import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, NavigationProp } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../src/theme/ThemeProvider';
import api from './axiosInstance';
import axios from 'axios';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import {
  connectUserSocket,
  onRideAccepted,
  onRideCancelled,
  onDriverArrived,
  onRideStarted,
  onRideCompleted,
  disconnectSocket,
} from '../src/services/socketService';

const POLL_INTERVAL = 10000;
const GOOGLE_MAPS_API_KEY = 'AIzaSyCr6FbhZa_qV3jn7bz6lr7OZYfTz5Xrpzo';
const { width, height } = Dimensions.get('window');

interface RouteParams {
  bookingId: number;
  bookingPin?: string;
  selectedLocation?: any;
  selected_drop_points?: any;
  totalPrice?: number;
  selectedVehicle?: string;
  selected_tow_type?: string;
}

const normalizeRideStatus = (raw?: string) => {
  if (!raw) return 'searching';
  const status = raw.toLowerCase();
  if (['requested', 'pending'].includes(status)) return 'searching';
  if (['ride_started', 'ride-started', 'started', 'in_progress', 'on_trip'].includes(status)) return 'in_progress';
  return status;
};

const shouldNavigateToTracking = (status: string) =>
  ['accepted', 'arrived', 'in_progress', 'completed'].includes(status);

const SearchingProvider: React.FC = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute();
  const routeParams = route.params as RouteParams;
  const { bookingId, bookingPin, selectedLocation, selected_drop_points, totalPrice, selectedVehicle, selected_tow_type } = routeParams;

  const [currentStatus, setCurrentStatus] = useState<string>('searching');
  const [pollCount, setPollCount] = useState(0);
  const [isPolling, setIsPolling] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const cancelTokenSourceRef = useRef(axios.CancelToken.source());

  const navigateToTracking = (payload: any, statusOverride?: string) => {
    const bookingDetails = payload?.details || payload?.booking || payload;
    const normalizedStatus = normalizeRideStatus(statusOverride || bookingDetails?.status || payload?.status);
    const driverData =
      payload?.driver ||
      bookingDetails?.driver ||
      (bookingDetails?.driver_name ? { name: bookingDetails.driver_name, phone: bookingDetails.driver_phone } : null);

    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'TrackingScreen',
          params: {
            bookingId: bookingDetails?.id || bookingId,
            booking: { ...bookingDetails, status: normalizedStatus },
            driver: driverData,
            selectedLocation,
            selected_drop_points,
            totalPrice,
            bookingPin: bookingDetails?.pin || payload?.pin || bookingPin,
          },
        },
      ],
    });
  };

  // Animations
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const dotAnim1 = useRef(new Animated.Value(0)).current;
  const dotAnim2 = useRef(new Animated.Value(0)).current;
  const dotAnim3 = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Pulsing ripple animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // Animated dots for "Finding your driver..."
  useEffect(() => {
    const dots = Animated.loop(
      Animated.sequence([
        Animated.timing(dotAnim1, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotAnim2, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotAnim3, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dotAnim1, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(dotAnim2, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.timing(dotAnim3, { toValue: 0, duration: 0, useNativeDriver: true }),
        Animated.delay(400),
      ])
    );
    dots.start();
    return () => dots.stop();
  }, []);

  // Shimmer animation
  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, { toValue: 1, duration: 1500, useNativeDriver: true })
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  // Status messages that rotate
  const statusMessages = [
    'Finding your driver',
    'Connecting to nearby tow trucks',
    'Almost there',
    'Drivers nearby are being notified',
  ];
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMsgIndex(prev => (prev + 1) % statusMessages.length);
    }, 4000);
    return () => clearInterval(msgInterval);
  }, []);

  // Poll ride status
  const pollRideStatus = async () => {
    try {
      const response = await api.post('/user/rides/rideStatus', {
        booking_id: bookingId
      }, {
        cancelToken: cancelTokenSourceRef.current.token
      });

      if (!isMountedRef.current) return;

      if (response.data) {
        const responseData = response.data;
        const rideData = responseData.data || responseData.details || responseData.booking || responseData;
        const status = normalizeRideStatus(responseData.status || rideData?.status);
        setCurrentStatus(status);
        setPollCount(prev => prev + 1);

        if (status === 'cancelled') {
          setIsPolling(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          Alert.alert('Booking Cancelled', 'Your booking has been cancelled.', [
            { text: 'OK', onPress: () => navigation.navigate('DashboardScreen') }
          ]);
          return;
        }

        if (shouldNavigateToTracking(status)) {
          setIsPolling(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          navigateToTracking(responseData, status);
        }
      }
    } catch (error: any) {
      if (axios.isCancel(error)) return;
      console.error('Error polling ride status:', error);
      if (error.response?.status === 404) {
        setIsPolling(false);
        clearInterval(intervalRef.current!);
        Alert.alert('Booking Not Found', 'This booking could not be found.', [
          { text: 'OK', onPress: () => navigation.navigate('DashboardScreen') }
        ]);
      }
    }
  };

  useEffect(() => {
    if (!bookingId) {
      Alert.alert('Error', 'No booking ID found', [{ text: 'OK', onPress: () => navigation.goBack() }]);
      return;
    }
    pollRideStatus();
    intervalRef.current = setInterval(pollRideStatus, POLL_INTERVAL);

    // Connect socket for real-time updates
    let unsub1: (() => void) | undefined;
    let unsub2: (() => void) | undefined;
    let unsub3: (() => void) | undefined;
    let unsub4: (() => void) | undefined;
    let unsub5: (() => void) | undefined;
    (async () => {
      try {
        await connectUserSocket();
        unsub1 = onRideAccepted((data: any) => {
          if (!isMountedRef.current) return;
          setIsPolling(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          const normalized = normalizeRideStatus(data?.status || 'accepted');
          setCurrentStatus(normalized);
          navigateToTracking(data, normalized);
        });
        unsub3 = onDriverArrived((data: any) => {
          if (!isMountedRef.current) return;
          setIsPolling(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          const normalized = normalizeRideStatus(data?.status || 'arrived');
          setCurrentStatus(normalized);
          navigateToTracking(data, normalized);
        });
        unsub4 = onRideStarted((data: any) => {
          if (!isMountedRef.current) return;
          setIsPolling(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          const normalized = normalizeRideStatus(data?.status || 'in_progress');
          setCurrentStatus(normalized);
          navigateToTracking(data, normalized);
        });
        unsub5 = onRideCompleted((data: any) => {
          if (!isMountedRef.current) return;
          setIsPolling(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          const normalized = normalizeRideStatus(data?.status || 'completed');
          setCurrentStatus(normalized);
          navigateToTracking(data, normalized);
        });
        unsub2 = onRideCancelled((data: any) => {
          if (!isMountedRef.current) return;
          setIsPolling(false);
          if (intervalRef.current) clearInterval(intervalRef.current);
          setCurrentStatus('cancelled');
          Alert.alert('Booking Cancelled', 'Your ride has been cancelled.', [
            { text: 'OK', onPress: () => navigation.navigate('DashboardScreen' as any) }
          ]);
        });
      } catch (e) {
        console.log('[Socket] Connection failed, falling back to polling:', e);
      }
    })();

    return () => {
      isMountedRef.current = false;
      setIsPolling(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (cancelTokenSourceRef.current) cancelTokenSourceRef.current.cancel('Component unmounted');
      if (unsub1) unsub1();
      if (unsub2) unsub2();
      if (unsub3) unsub3();
      if (unsub4) unsub4();
      if (unsub5) unsub5();
      disconnectSocket();
    };
  }, [bookingId]);

  const handleCancel = () => {
    Alert.alert('Cancel Booking?', 'Are you sure you want to cancel? Drivers nearby may be on their way.', [
      { text: 'Wait', style: 'cancel' },
      { text: 'Cancel Anyway', style: 'destructive', onPress: performCancel }
    ]);
  };

  const performCancel = async () => {
    if (!bookingId) { navigation.goBack(); return; }
    setIsCancelling(true);
    try {
      await api.post('/user/rides/cancel', { booking_id: bookingId });
      setIsPolling(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (cancelTokenSourceRef.current) cancelTokenSourceRef.current.cancel('Ride cancelled by user');
      Alert.alert('Booking Cancelled', 'Your ride has been cancelled.', [
        { text: 'OK', onPress: () => navigation.navigate('DashboardScreen') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to cancel. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Pickup coordinates
  const pickupLat = selectedLocation?.coords?.latitude ?? selectedLocation?.latitude ?? selectedLocation?.lat ?? 0;
  const pickupLng = selectedLocation?.coords?.longitude ?? selectedLocation?.longitude ?? selectedLocation?.lng ?? 0;
  const dropLat = selected_drop_points?.latitude ?? selected_drop_points?.lat ?? 0;
  const dropLng = selected_drop_points?.longitude ?? selected_drop_points?.lng ?? 0;

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });

  const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [0, 1], outputRange: [-200, 200] });

  const towTypeLabel = selected_tow_type
    ? selected_tow_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Tow Truck';
  const vehicleLabel = selectedVehicle
    ? selectedVehicle.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Vehicle';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen map */}
      <MapView
        provider="google"
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: pickupLat || 28.6139,
          longitude: pickupLng || 77.2090,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsTraffic={true}
      >
        {pickupLat > 0 && (
          <Marker coordinate={{ latitude: pickupLat, longitude: pickupLng }} title="Pickup" pinColor="#4CAF50" />
        )}
        {dropLat > 0 && (
          <Marker coordinate={{ latitude: dropLat, longitude: dropLng }} title="Drop" pinColor="#F44336" />
        )}
        {pickupLat > 0 && dropLat > 0 && (
          <MapViewDirections
            origin={{ latitude: pickupLat, longitude: pickupLng }}
            destination={{ latitude: dropLat, longitude: dropLng }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#f37f21"
            onError={(e) => console.warn('Directions error', e)}
          />
        )}
      </MapView>

      {/* Pulsing ripple on pickup */}
      {pickupLat > 0 && (
        <View style={styles.rippleContainer} pointerEvents="none">
          <Animated.View style={[styles.ripple, {
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          }]} />
          <Animated.View style={[styles.ripple, styles.rippleDelay, {
            transform: [{ scale: pulseScale }],
            opacity: pulseOpacity,
          }]} />
          <View style={styles.rippleCenter} />
        </View>
      )}

      {/* Back button overlay */}
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />

        {/* Title + animated dots */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{statusMessages[msgIndex]}</Text>
          <View style={styles.dotsRow}>
            <Animated.View style={[styles.dot, { opacity: dotAnim1 }]} />
            <Animated.View style={[styles.dot, { opacity: dotAnim2 }]} />
            <Animated.View style={[styles.dot, { opacity: dotAnim3 }]} />
          </View>
        </View>
        <Text style={styles.subtitle}>Connecting you to nearby tow trucks</Text>

        {/* Status pill */}
        <View style={styles.statusPill}>
          <Animated.View style={[styles.statusDot, {
            opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] })
          }]} />
          <Text style={styles.statusText}>
            {currentStatus === 'searching' ? 'Searching' : currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
          </Text>
        </View>

        {/* Booking Info Card */}
        <View style={styles.bookingCard}>
          <View style={styles.bookingRow}>
            <Text style={styles.bookingLabel}>Booking ID</Text>
            <Text style={styles.bookingValue}>#{bookingId}</Text>
          </View>
          {bookingPin && (
            <View style={styles.bookingRow}>
              <Text style={styles.bookingLabel}>PIN</Text>
              <View style={styles.pinBox}>
                <Text style={styles.pinText}>{bookingPin}</Text>
              </View>
            </View>
          )}
          {totalPrice ? (
            <View style={styles.bookingRow}>
              <Text style={styles.bookingLabel}>Estimated Fare</Text>
              <Text style={styles.priceText}>₹{totalPrice}</Text>
            </View>
          ) : null}
        </View>

        {/* Tow Details Card */}
        <View style={styles.towCard}>
          <View style={styles.towCardRow}>
            <MaterialIcons name="local-taxi" size={20} color="#f37f21" />
            <View style={styles.towCardInfo}>
              <Text style={styles.towCardLabel}>Tow Type</Text>
              <Text style={styles.towCardValue}>{towTypeLabel}</Text>
            </View>
          </View>
          <View style={styles.towCardDivider} />
          <View style={styles.towCardRow}>
            <MaterialIcons name="directions-car" size={20} color="#f37f21" />
            <View style={styles.towCardInfo}>
              <Text style={styles.towCardLabel}>Vehicle</Text>
              <Text style={styles.towCardValue}>{vehicleLabel}</Text>
            </View>
          </View>
        </View>

        {/* Shimmer loading bar */}
        <View style={styles.shimmerContainer}>
          <View style={styles.shimmerBg} />
          <Animated.View style={[styles.shimmerLine, { transform: [{ translateX: shimmerTranslate }] }]} />
        </View>

        {/* Cancel button */}
        <TouchableOpacity
          style={[styles.cancelBtn, isCancelling && { opacity: 0.5 }]}
          onPress={handleCancel}
          disabled={isCancelling}
          activeOpacity={0.7}
        >
          {isCancelling ? (
            <ActivityIndicator size="small" color="#F44336" />
          ) : (
            <>
              <MaterialIcons name="close" size={18} color="#F44336" style={{ marginRight: 8 }} />
              <Text style={styles.cancelText}>Cancel Booking</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Back button
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  // Ripple animation
  rippleContainer: {
    position: 'absolute',
    top: height * 0.25,
    left: width / 2 - 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(243,127,33,0.3)',
  },
  rippleDelay: {
    backgroundColor: 'rgba(243,127,33,0.15)',
  },
  rippleCenter: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#f37f21',
    borderWidth: 3,
    borderColor: '#fff',
  },
  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '65%',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
  },
  sheetHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 14,
  },
  // Title + dots
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  dotsRow: {
    flexDirection: 'row',
    marginLeft: 4,
    marginTop: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#f37f21',
    marginHorizontal: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 12,
  },
  // Status pill
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 14,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f37f21',
    marginRight: 8,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f37f21',
  },
  // Booking card
  bookingCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
  bookingValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },
  pinBox: {
    backgroundColor: '#f37f21',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pinText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#f37f21',
  },
  // Tow details card
  towCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  towCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  towCardInfo: {
    marginLeft: 10,
    flex: 1,
  },
  towCardLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  towCardValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
    marginTop: 1,
  },
  towCardDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 6,
  },
  // Shimmer
  shimmerContainer: {
    height: 4,
    borderRadius: 2,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
    marginBottom: 14,
  },
  shimmerBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f0f0f0',
  },
  shimmerLine: {
    width: 100,
    height: '100%',
    backgroundColor: 'rgba(243,127,33,0.15)',
  },
  // Cancel button
  cancelBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F44336',
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: '#FFF5F5',
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F44336',
  },
});

export default SearchingProvider;
