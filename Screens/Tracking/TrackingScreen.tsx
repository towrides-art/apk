import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, Dimensions, Alert, Modal, TextInput, Text, Animated, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MapView, { Marker } from 'react-native-maps';
import { useTheme } from '../../src/theme/ThemeProvider';
import api from '../axiosInstance';
import MapViewDirections from 'react-native-maps-directions';
import { Linking } from 'react-native';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCr6FbhZa_qV3jn7bz6lr7OZYfTz5Xrpzo';   // ← replace 

const { width, height } = Dimensions.get('window');

const PROGRESS_STEPS = ['Searching', 'Assigned', 'Arrived', 'On Trip', 'Completed'];

const normalizeRideStatus = (raw?: string) => {
  if (!raw) return 'searching';
  const status = raw.toLowerCase();
  if (['requested', 'pending'].includes(status)) return 'searching';
  if (['ride_started', 'ride-started', 'started', 'in_progress', 'on_trip'].includes(status)) return 'in_progress';
  return status;
};

export default function TrackingScreen({ navigation, route }: any) {
  const { theme } = useTheme();
  const bookingId = route?.params?.bookingId;
  const initialBooking = route?.params?.booking;

  // Ride status states
  const [rideStatus, setRideStatus] = useState('searching');
  const [driver, setDriver] = useState<any>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(initialBooking || null);
  const [driverLocation, setDriverLocation] = useState<any>(null);
  const [isPaymentDone,setIsPaymentDone]=useState(true)
  const [sheetExpanded, setSheetExpanded] = useState(false);

  const livePulse = useRef(new Animated.Value(0)).current;
  const sheetAnim = useRef(new Animated.Value(0)).current;

  // Live dot pulse animation
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(livePulse, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(livePulse, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

  const toggleSheet = () => {
    const toValue = sheetExpanded ? 0 : 1;
    Animated.spring(sheetAnim, { toValue, useNativeDriver: true, friction: 7 }).start();
    setSheetExpanded(!sheetExpanded);
  };

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -(height * 0.35)],
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(true);
  const [pollCount, setPollCount] = useState(0);
  
  // Rating states
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // Location states
  const [pickupLocation, setPickupLocation] = useState<any>(null);
  const [dropLocation, setDropLocation] = useState<any>(null);

  // Debug: Log state changes
  useEffect(() => {
    console.log('DropLocation state changed:', dropLocation);
  }, [dropLocation]);

  useEffect(() => {
    console.log('PickupLocation state changed:', pickupLocation);
  }, [pickupLocation]);

  const mapRef = useRef<MapView>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const locationPollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize locations and start tracking
  useEffect(() => {
    if (!bookingId) {
      Alert.alert('Error', 'No booking ID found');
      navigation.goBack();
      return;
    }

    console.log('TrackingScreen initialized with booking:', bookingId);
    
    // Parse initial booking data if available
    if (initialBooking) {
      const normalized = normalizeRideStatus(initialBooking.status);
      setRideStatus(normalized);
      setBookingDetails({ ...initialBooking, status: normalized });
      parseBookingData(initialBooking);
    }

    // Start polling ride status
    startStatusPolling();
    
    // Start location polling
    startLocationPolling();

    return () => {
      stopStatusPolling();
      stopLocationPolling();
    };
  }, [bookingId]);
  
  // Parse booking data to extract locations
  const parseBookingData = (booking: any) => {
    try {
      console.log('Parsing booking data:', booking);
      
      // Backend returns pickup/drop as { lat, lng, address } objects
      if (booking.pickup?.lat && booking.pickup?.lng) {
        setPickupLocation({ latitude: booking.pickup.lat, longitude: booking.pickup.lng });
      } else if (booking.pickup_location_cords) {
        const pickup = JSON.parse(booking.pickup_location_cords);
        setPickupLocation(pickup);
      }
      
      if (booking.drop?.lat && booking.drop?.lng) {
        setDropLocation({ latitude: booking.drop.lat, longitude: booking.drop.lng });
      } else if (booking.drop_location_cords) {
        const drop = JSON.parse(booking.drop_location_cords);
        setDropLocation(drop);
      }
    } catch (error) {
      console.error('Error parsing booking coordinates:', error);
    }
  };

  // Start polling ride status
  const startStatusPolling = () => {
    const pollStatus = async () => {
      try {
        console.log(`Polling ride status... Attempt: ${pollCount + 1}`);
        
        const response = await api.post('/user/rides/rideStatus', {
          booking_id: bookingId
        });

        if (response.data) {
          const responseData = response.data;
          const rideData = responseData.data || responseData.details || responseData.booking || responseData;
          const normalizedStatus = normalizeRideStatus(responseData.status || rideData?.status);
          const driverData =
            responseData.driver ||
            rideData?.driver ||
            (rideData?.driver_name ? { name: rideData.driver_name, phone: rideData.driver_phone } : null);

          console.log('Current ride status:', normalizedStatus);
          setRideStatus(normalizedStatus);
          if (driverData) setDriver(driverData);
          setBookingDetails({ ...rideData, status: normalizedStatus });

          // Parse locations if not already set
          if (rideData && !pickupLocation) {
            parseBookingData(rideData);
          }

          // Check if already rated
          if (rideData?.user_rating) {
            setHasRated(true);
            setRating(rideData.user_rating);
            setReview(rideData.user_review || '');
          }

          // Show rating modal when ride is completed and not rated
          if (normalizedStatus === 'completed' && !rideData?.user_rating && !showRatingModal) {
            setTimeout(() => {
              setShowRatingModal(true);
              stopStatusPolling(); // Stop polling once completed
            }, 2000);
          }

          setPollCount(prev => prev + 1);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error polling ride status:', error);
        setLoading(false);
      }
    };

    // Initial poll
    pollStatus();
    
    // Set up polling interval (every 10 seconds)
    pollIntervalRef.current = setInterval(pollStatus, 10000);
  };

  // Stop status polling
  const stopStatusPolling = () => {
    setIsPolling(false);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  // Start location polling (replaces Firebase Realtime DB)
  const startLocationPolling = () => {
    if (!bookingId) return;

    const pollLocation = async () => {
      try {
        const response = await api.get(`/user/driver-location/${bookingId}`);
        const data = response.data;
        if (data && data.latitude && data.longitude) {
          console.log('Driver location update:', data);
          setDriverLocation({
            latitude: data.latitude,
            longitude: data.longitude,
            timestamp: data.timestamp,
            status: data.status
          });

          // Animate map to show driver location
          if (mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: data.latitude,
              longitude: data.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 1000);
          }
        }
      } catch (e) {
        console.warn('Location poll error:', e);
      }
    };

    // Poll every 3 seconds
    pollLocation();
    locationPollIntervalRef.current = setInterval(pollLocation, 3000);
  };

  // Stop location polling
  const stopLocationPolling = () => {
    if (locationPollIntervalRef.current) {
      clearInterval(locationPollIntervalRef.current);
      locationPollIntervalRef.current = null;
    }
  };

  // Submit driver rating
  const submitRating = async () => {
    if (rating === 0) {
      Alert.alert('Rating Required', 'Please select a rating before submitting');
      return;
    }

    setIsSubmittingRating(true);

    try {
      console.log('Submitting driver rating:', { rating, review });
      
      const response = await api.post('/user/rides/rateDriver', {
        booking_id: bookingId,
        rating: rating,
        review: review
      });

      console.log('Rating submitted successfully:', response.data);

      if (response.data.message) {
        setHasRated(true);
        setShowRatingModal(false);
        
        Alert.alert(
          'Thank You!',
          'Your rating has been submitted successfully.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('DashboardScreen')
            }
          ]
        );
      }

    } catch (error: any) {
      console.error('Error submitting rating:', error);
      
      let errorMessage = 'Failed to submit rating. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 404) {
        errorMessage = 'Booking not found.';
      } else if (error.response?.status === 400) {
        errorMessage = 'This ride cannot be rated at this time.';
      }

      Alert.alert('Error', errorMessage);
      
    } finally {
      setIsSubmittingRating(false);
    }
  };

  // Call driver
  const callDriver = () => {
    if (driver?.mobile) {
      const phoneRaw = driver.mobile || '';
      const phone = phoneRaw.replace(/\D/g, ''); // remove non-numeric chars

      if (!phone) {
        Alert.alert('Error', 'Driver contact information not available');
        return;
      }

      const telUrl = `tel:${phone}`;

      // Try to open the phone dialer
      Linking.canOpenURL(telUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(telUrl);
          } else {
            Alert.alert('Error', 'Unable to place a call from this device.');
          }
        })
        .catch((err) => {
          console.error('Error initiating call:', err);
          Alert.alert('Error', 'Unable to place a call. Please try again.');
        });
    } else {
      Alert.alert('Error', 'Driver contact information not available');
    }
  };

  const WhatsappDriver = () => {
    // if (driver?.phone) {
      const phoneRaw = driver.mobile || '';
      const phone = phoneRaw.replace(/\D/g, ''); // remove non-numeric chars
      const message = `Hello ${driver.name}, I'm contacting you about booking ${bookingId || ''}.`;
      const whatsappUrl = `whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`;
      const webWhatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;


      Linking.canOpenURL(whatsappUrl)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(whatsappUrl);
          } else {
            return Linking.openURL(webWhatsappUrl);
          }
        })
        .catch((err) => {
          console.error('Error opening WhatsApp:', err);
          Alert.alert('Error', 'Unable to open WhatsApp. Please ensure WhatsApp is installed or try again.');
        });
    // } else {
    //   Alert.alert('Error', 'Driver contact information not available');
    // }
  };

  // Cancel ride
  const cancelRide = () => {
    if (rideStatus !== 'pending') {
      Alert.alert('Cannot Cancel', 'This ride cannot be cancelled at this time.');
      return;
    }

    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await api.post('/user/rides/cancelRide', {
                booking_id: bookingId
              });
              
              Alert.alert('Ride Cancelled', 'Your ride has been cancelled successfully.');
              navigation.navigate('DashboardScreen');
              
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel ride. Please try again.');
            }
          }
        }
      ]
    );
  };

  // Progress step index
  const getStepIndex = () => {
    switch (rideStatus) {
      case 'pending':
      case 'searching':
        return 0;
      case 'accepted':
        return 1;
      case 'arrived':
        return 2;
      case 'in_progress':
        return 3;
      case 'completed':
        return 4;
      default: return 0;
    }
  };

  const getStatusLabel = () => {
    switch (rideStatus) {
      case 'pending':
      case 'searching':
        return 'Finding driver';
      case 'accepted':
        return 'Driver on the way';
      case 'arrived':
        return 'Driver arrived';
      case 'in_progress':
        return 'Trip in progress';
      case 'completed':
        return 'Trip completed';
      case 'cancelled':
        return 'Ride cancelled';
      default: return 'Tracking';
    }
  };

  const getStatusEmoji = () => {
    switch (rideStatus) {
      case 'pending':
      case 'searching':
        return '🔍';
      case 'accepted':
        return '🚗';
      case 'arrived':
        return '📍';
      case 'in_progress':
        return '🚛';
      case 'completed':
        return '✅';
      case 'cancelled':
        return '❌';
      default: return '📍';
    }
  };

  const renderStars = () => (
    <View style={s.starsRow}>
      {[1, 2, 3, 4, 5].map(star => (
        <TouchableOpacity key={star} onPress={() => setRating(star)} style={s.starBtn}>
          <MaterialIcons name={star <= rating ? 'star' : 'star-border'} size={36} color={star <= rating ? '#FFD700' : '#ddd'} />
        </TouchableOpacity>
      ))}
    </View>
  );

  if (loading) {
    return (
      <View style={s.container}>
        <StatusBar barStyle="light-content" />
        <View style={s.loadingWrap}>
          <Animated.View style={[s.loadingPulse, { transform: [{ scale: livePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] }) }] }]}>
            <MaterialIcons name="local-taxi" size={32} color="#f37f21" />
          </Animated.View>
          <Text style={s.loadingText}>Loading ride details...</Text>
        </View>
      </View>
    );
  }

  const stepIdx = getStepIndex();

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" />

      {/* Full-screen map */}
      <MapView
        ref={mapRef}
        provider="google"
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: pickupLocation?.latitude || driverLocation?.latitude || 28.6139,
          longitude: pickupLocation?.longitude || driverLocation?.longitude || 77.2090,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        showsTraffic={true}
      >
        {pickupLocation && (
          <Marker coordinate={pickupLocation} title="Pickup" pinColor="#4CAF50" />
        )}
        {dropLocation && (
          <Marker coordinate={dropLocation} title="Drop" pinColor="#F44336" />
        )}
        {driverLocation && pickupLocation && (rideStatus === 'accepted' || rideStatus === 'arrived') && (
          <>
            <Marker coordinate={driverLocation} title="Driver" anchor={{ x: 0.5, y: 0.5 }}>
              <View style={s.driverMarker}>
                <MaterialIcons name="local-taxi" size={20} color="#fff" />
              </View>
            </Marker>
            <MapViewDirections
              origin={driverLocation}
              destination={pickupLocation}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={4}
              strokeColor="#f37f21"
              onReady={result => { mapRef.current?.fitToCoordinates(result.coordinates, { edgePadding: { top: 80, right: 50, bottom: 300, left: 50 } }); }}
              onError={err => console.log('Directions Error:', err)}
            />
          </>
        )}
        {rideStatus === 'in_progress' && pickupLocation && dropLocation && (
          <MapViewDirections
            origin={pickupLocation}
            destination={dropLocation}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#f37f21"
            onReady={result => { mapRef.current?.fitToCoordinates(result.coordinates, { edgePadding: { top: 80, right: 50, bottom: 300, left: 50 } }); }}
            onError={err => console.log('Directions Error:', err)}
          />
        )}
      </MapView>

      {/* Back button */}
      <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
        <MaterialIcons name="arrow-back" size={22} color="#fff" />
      </TouchableOpacity>

      {/* Floating status pill */}
      <View style={s.statusPill}>
        <Text style={s.statusEmoji}>{getStatusEmoji()}</Text>
        <Text style={s.statusLabel}>{getStatusLabel()}</Text>
        {isPolling && (
          <View style={s.liveBadge}>
            <Animated.View style={[s.liveDot, { opacity: livePulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] }) }]} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[s.bottomSheet, { transform: [{ translateY: sheetTranslateY }] }]}>
        <TouchableOpacity onPress={toggleSheet} activeOpacity={0.7}>
          <View style={s.sheetHandle} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>

          {/* Progress Steps */}
          <View style={s.stepsRow}>
            {PROGRESS_STEPS.map((step, i) => (
              <View key={step} style={s.stepItem}>
                <View style={[s.stepCircle, i <= stepIdx && s.stepCircleActive, i === stepIdx && s.stepCircleCurrent]}>
                  {i < stepIdx ? (
                    <MaterialIcons name="check" size={12} color="#fff" />
                  ) : (
                    <View style={[s.stepInnerDot, i <= stepIdx && s.stepInnerDotActive]} />
                  )}
                </View>
                {i < PROGRESS_STEPS.length - 1 && (
                  <View style={[s.stepLine, i < stepIdx && s.stepLineActive]} />
                )}
                <Text style={[s.stepLabel, i <= stepIdx && s.stepLabelActive]}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Driver Card */}
          {driver && (
            <View style={s.driverCard}>
              <View style={s.driverRow}>
                <View style={s.driverAvatar}>
                  <MaterialIcons name="person" size={28} color="#fff" />
                </View>
                <View style={s.driverInfo}>
                  <Text style={s.driverName}>{driver.name || 'Driver'}</Text>
                  <View style={s.driverMeta}>
                    {driver.rating && (
                      <View style={s.ratingChip}>
                        <MaterialIcons name="star" size={12} color="#FFD700" />
                        <Text style={s.ratingText}>{driver.rating}</Text>
                      </View>
                    )}
                    <Text style={s.vehicleText}>{driver.vehicle_number || bookingDetails?.tow_type || ''}</Text>
                  </View>
                </View>
                <TouchableOpacity style={s.actionBtn} onPress={callDriver}>
                  <MaterialIcons name="phone" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#25D366' }]} onPress={WhatsappDriver}>
                  <MaterialIcons name="chat" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
              {(rideStatus === 'accepted' || rideStatus === 'in_progress') && (
                <Text style={s.arrivingText}>
                  {rideStatus === 'accepted' ? 'Arriving soon to pickup' : 'Heading to destination'}
                </Text>
              )}
            </View>
          )}

          {/* Trip Route Timeline */}
          <View style={s.routeCard}>
            <View style={s.timelineRow}>
              <View style={s.timelineCol}>
                <View style={[s.tlDot, { backgroundColor: '#4CAF50' }]} />
                <View style={s.tlLine} />
                <View style={[s.tlDot, { backgroundColor: '#F44336' }]} />
              </View>
              <View style={s.tlTexts}>
                <View style={s.tlItem}>
                  <Text style={s.tlLabel}>PICKUP</Text>
                  <Text style={s.tlValue} numberOfLines={1}>{bookingDetails?.pickup_location_name || 'Pickup location'}</Text>
                </View>
                <View style={s.tlSpacer} />
                <View style={s.tlItem}>
                  <Text style={s.tlLabel}>DROP</Text>
                  <Text style={s.tlValue} numberOfLines={1}>{bookingDetails?.drop_location_name || 'Drop location'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Compact Booking Info */}
          <View style={s.infoCard}>
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Fare</Text>
              <Text style={s.infoPrice}>₹{bookingDetails?.fair || '0'}</Text>
            </View>
            {bookingDetails?.pin && (
              <View style={s.infoRow}>
                <Text style={s.infoLabel}>PIN</Text>
                <View style={s.pinBox}>
                  <Text style={s.pinText}>{bookingDetails.pin}</Text>
                </View>
              </View>
            )}
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>Payment</Text>
              <Text style={s.infoValue}>Cash</Text>
            </View>
            {bookingDetails?.fair > bookingDetails?.paid && (
              <TouchableOpacity
                style={s.payBtn}
                onPress={() => navigation.navigate('PaymentScreen', { amount: bookingDetails?.fair - bookingDetails.paid, booking: bookingDetails, driver })}
              >
                <Text style={s.payBtnText}>Pay ₹{bookingDetails.fair - bookingDetails.paid} Now</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Action buttons */}
          {(rideStatus === 'pending' || rideStatus === 'searching' || rideStatus === 'accepted') && (
            <TouchableOpacity style={s.cancelBtn} onPress={cancelRide} activeOpacity={0.7}>
              <MaterialIcons name="close" size={18} color="#F44336" style={{ marginRight: 8 }} />
              <Text style={s.cancelText}>Cancel Ride</Text>
            </TouchableOpacity>
          )}

          {rideStatus === 'completed' && !hasRated && (
            <TouchableOpacity style={s.rateBtn} onPress={() => setShowRatingModal(true)} activeOpacity={0.7}>
              <MaterialIcons name="star" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={s.rateBtnText}>Rate Driver</Text>
            </TouchableOpacity>
          )}

          {hasRated && (
            <View style={s.ratedRow}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={s.ratedText}>Rated {rating} stars</Text>
            </View>
          )}
        </ScrollView>
      </Animated.View>

      {/* Rating Modal */}
      <Modal visible={showRatingModal} animationType="slide" transparent onRequestClose={() => !isSubmittingRating && setShowRatingModal(false)}>
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <Text style={s.modalTitle}>Rate Your Driver</Text>
            <Text style={s.modalSub}>How was your experience with {driver?.name || 'your driver'}?</Text>
            <View style={s.ratingWrap}>{renderStars()}</View>
            <View style={s.reviewWrap}>
              <Text style={s.reviewLabel}>Write a review (optional)</Text>
              <TextInput style={s.reviewInput} value={review} onChangeText={setReview} placeholder="Share your feedback..." multiline numberOfLines={3} maxLength={500} editable={!isSubmittingRating} />
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.skipBtn} onPress={() => { if (!isSubmittingRating) { setShowRatingModal(false); navigation.navigate('DashboardScreen'); } }} disabled={isSubmittingRating}>
                <Text style={s.skipBtnText}>Skip</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.submitBtn, { backgroundColor: isSubmittingRating ? '#ccc' : '#f37f21', opacity: rating === 0 || isSubmittingRating ? 0.5 : 1 }]} onPress={submitRating} disabled={rating === 0 || isSubmittingRating}>
                <Text style={s.submitBtnText}>{isSubmittingRating ? 'Submitting...' : 'Submit'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  // Loading
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingPulse: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF3E0', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  loadingText: { fontSize: 14, color: '#888', fontWeight: '500' },
  // Back button
  backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 10 },
  // Status pill
  statusPill: { position: 'absolute', top: 50, left: 68, right: 16, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 28, paddingHorizontal: 16, paddingVertical: 10, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8 },
  statusEmoji: { fontSize: 16, marginRight: 8 },
  statusLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: '#222' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4CAF50', marginRight: 4 },
  liveText: { fontSize: 9, fontWeight: '800', color: '#4CAF50', letterSpacing: 1 },
  // Driver marker
  driverMarker: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f37f21', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff', elevation: 4 },
  // Bottom sheet
  bottomSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '70%', elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.15, shadowRadius: 16, paddingBottom: 20 },
  sheetHandle: { width: 44, height: 5, borderRadius: 3, backgroundColor: '#ddd', alignSelf: 'center', marginTop: 12, marginBottom: 10 },
  // Progress steps
  stepsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  stepCircleActive: { backgroundColor: '#f37f21' },
  stepCircleCurrent: { borderWidth: 2, borderColor: '#f37f21', backgroundColor: '#FFF3E0' },
  stepInnerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ddd' },
  stepInnerDotActive: { backgroundColor: '#fff' },
  stepLine: { width: 20, height: 2, backgroundColor: '#eee', position: 'absolute', top: 12, left: '55%' },
  stepLineActive: { backgroundColor: '#f37f21' },
  stepLabel: { fontSize: 9, fontWeight: '600', color: '#bbb', textAlign: 'center' },
  stepLabelActive: { color: '#f37f21' },
  // Driver card
  driverCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, backgroundColor: '#f8f9fa', borderRadius: 16 },
  driverRow: { flexDirection: 'row', alignItems: 'center' },
  driverAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#f37f21', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 16, fontWeight: '700', color: '#222' },
  driverMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  ratingChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF8E1', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginRight: 8 },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#F9A825', marginLeft: 2 },
  vehicleText: { fontSize: 12, color: '#888', fontWeight: '500' },
  actionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginLeft: 6 },
  arrivingText: { fontSize: 12, color: '#f37f21', fontWeight: '600', marginTop: 8, textAlign: 'center' },
  // Route timeline
  routeCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, backgroundColor: '#f8f9fa', borderRadius: 16 },
  timelineRow: { flexDirection: 'row' },
  timelineCol: { width: 20, alignItems: 'center', marginRight: 12 },
  tlDot: { width: 10, height: 10, borderRadius: 5 },
  tlLine: { width: 2, flex: 1, backgroundColor: '#ddd', marginVertical: 2, minHeight: 20 },
  tlTexts: { flex: 1 },
  tlItem: {},
  tlSpacer: { height: 8 },
  tlLabel: { fontSize: 9, fontWeight: '700', color: '#999', letterSpacing: 0.8, textTransform: 'uppercase' },
  tlValue: { fontSize: 13, color: '#333', fontWeight: '600', marginTop: 1 },
  // Compact info
  infoCard: { marginHorizontal: 16, marginBottom: 10, padding: 14, backgroundColor: '#f8f9fa', borderRadius: 16 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  infoLabel: { fontSize: 12, color: '#999', fontWeight: '500' },
  infoPrice: { fontSize: 20, fontWeight: '900', color: '#f37f21' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  pinBox: { backgroundColor: '#f37f21', paddingHorizontal: 14, paddingVertical: 3, borderRadius: 8 },
  pinText: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: 4 },
  payBtn: { backgroundColor: '#f37f21', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  payBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  // Cancel / Rate buttons
  cancelBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, borderWidth: 2, borderColor: '#F44336', borderRadius: 14, paddingVertical: 12, backgroundColor: '#FFF5F5' },
  cancelText: { fontSize: 15, fontWeight: '700', color: '#F44336' },
  rateBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 16, backgroundColor: '#f37f21', borderRadius: 14, paddingVertical: 14 },
  rateBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
  ratedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, paddingVertical: 12, backgroundColor: '#E8F5E9', borderRadius: 12 },
  ratedText: { fontSize: 14, fontWeight: '600', color: '#333', marginLeft: 6 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: width * 0.9, maxHeight: height * 0.75 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#222', textAlign: 'center', marginBottom: 6 },
  modalSub: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 20 },
  ratingWrap: { alignItems: 'center', marginBottom: 20 },
  starsRow: { flexDirection: 'row', gap: 6 },
  starBtn: { padding: 4 },
  reviewWrap: { marginBottom: 20 },
  reviewLabel: { fontSize: 13, color: '#888', marginBottom: 6 },
  reviewInput: { borderWidth: 1, borderColor: '#eee', borderRadius: 12, padding: 12, fontSize: 15, textAlignVertical: 'top', minHeight: 70 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  skipBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#eee', alignItems: 'center' },
  skipBtnText: { fontSize: 15, fontWeight: '600', color: '#888' },
  submitBtn: { flex: 2, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },
});
