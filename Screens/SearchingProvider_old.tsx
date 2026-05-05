import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Alert,
  BackHandler,
  Animated,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
  PanResponder,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// @ts-ignore
import polyline from '@mapbox/polyline';
import axios from 'axios';
import Modal from 'react-native-modal';
import DriverRating from './Components/DriverRating';
import { useTheme } from '../src/theme/ThemeProvider';
import { StyledText, StyledButton, StyledView, Spacer } from '../src/components/styled';
import { dimensions } from '../src/theme/dimensions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Utility functions
const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const deg2rad = (deg: number): number => deg * (Math.PI / 180);

// Types
interface Driver {
  id: number;
  name: string;
  vehicleNumber: string;
  vehicleModel: string;
  rating: number;
  experience: string;
  image: any;
  eta: string;
  status: string;
  phone: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface RouteParams {
  selected_drop_points: {
    latitude: number;
    longitude: number;
  };
  selectedLocation: {
    latitude: number;
    longitude: number;
  };
  selectedVehicle?: string;
  selected_tow_type?: string;
  service_type?: string;
}

// Driver data
const DRIVERS: Driver[] = [
    {
      id: 1,
      name: "Rajesh Kumar",
      vehicleNumber: "HR80E1335",
      vehicleModel: "Mahindra Bolero",
      rating: 4.8,
      experience: "5 years",
      image: require('./asset/map_icon_search.jpg'),
      eta: "4 min",
      status: "Completing a nearby trip",
    phone: "+91 98765 43210",
    location: { latitude: 28.6139, longitude: 77.2090 }
    },
    {
      id: 2,
      name: "Amit Singh",
      vehicleNumber: "DL01AB1234",
      vehicleModel: "Tata 407",
      rating: 4.6,
      experience: "3 years",
      image: require('./asset/map_icon_search.jpg'),
      eta: "6 min",
      status: "On the way",
    phone: "+91 98765 43211",
    location: { latitude: 28.6140, longitude: 77.2091 }
    },
    {
      id: 3,
      name: "Suresh Patel",
      vehicleNumber: "MH02CD5678",
      vehicleModel: "Ashok Leyland Dost",
      rating: 4.9,
      experience: "7 years",
      image: require('./asset/map_icon_search.jpg'),
      eta: "3 min",
      status: "Completing a nearby trip",
    phone: "+91 98765 43212",
    location: { latitude: 28.6141, longitude: 77.2092 }
    },
    {
      id: 4,
      name: "Vikram Sharma",
      vehicleNumber: "KA03EF9012",
      vehicleModel: "Mahindra Supro",
      rating: 4.7,
      experience: "4 years",
      image: require('./asset/map_icon_search.jpg'),
      eta: "8 min",
      status: "On the way",
    phone: "+91 98765 43213",
    location: { latitude: 28.6142, longitude: 77.2093 }
    },
    {
      id: 5,
      name: "Deepak Verma",
      vehicleNumber: "TN04GH3456",
      vehicleModel: "Tata Ace",
      rating: 4.5,
      experience: "2 years",
      image: require('./asset/map_icon_search.jpg'),
      eta: "5 min",
      status: "Completing a nearby trip",
    phone: "+91 98765 43214",
    location: { latitude: 28.6143, longitude: 77.2094 }
  }
];

// Main Component
const SearchingProvider: React.FC = () => {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const routeParams = route.params as RouteParams || {
    selected_drop_points: { latitude: 0, longitude: 0 },
    selectedLocation: { latitude: 0, longitude: 0 },
    selectedVehicle: '',
    selected_tow_type: '',
    service_type: ''
  };
  const { selected_drop_points, selectedLocation, selectedVehicle, selected_tow_type, service_type } = routeParams;

  // State management
  const [routeCoordinates, setRouteCoordinates] = useState<any[]>([]);
  const [distance, setDistance] = useState('0');
  const [providerFound, setProviderFound] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchProgress, setSearchProgress] = useState(0);
  const [searchStatus, setSearchStatus] = useState('Initializing search...');
  const [currentDriverCount, setCurrentDriverCount] = useState(0);

  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const mapRef = useRef<MapView>(null);
  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Pan responder for bottom sheet
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (_, gestuereState) => {
      if (gestureState.dy > 0) {
        slideAnim.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        // Close bottom sheet
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 300,
          useNativeDriver: false,
        }).start();
      } else {
        // Snap back to original position
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Calculate distance
  useEffect(() => {
    if (selectedLocation && selected_drop_points) {
      const distance = getDistanceFromLatLonInKm(
        selectedLocation.latitude,
        selectedLocation.longitude,
        selected_drop_points.latitude,
        selected_drop_points.longitude
      );
      setDistance(distance.toFixed(2));
    }
  }, [selectedLocation, selected_drop_points]);

  // Fetch route
  const fetchRoute = useCallback(async () => {
    if (!selectedLocation || !selected_drop_points) return;

    try {
      const origin = `${selectedLocation.latitude},${selectedLocation.longitude}`;
      const destination = `${selected_drop_points.latitude},${selected_drop_points.longitude}`;
      const apiKey = 'AIzaSyDEFWG5jYxYTXBouOr43vjV4Aj6WEOXBps';

      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`
      );

      if (response.data.routes && response.data.routes.length > 0) {
        const points = response.data.routes[0].overview_polyline.points;
        const coords = polyline.decode(points).map(([lat, lng]: [number, number]) => ({
          latitude: lat,
          longitude: lng,
        }));
        setRouteCoordinates(coords);

        const route = response.data.routes[0];
        const leg = route.legs[0];
        setDistance((leg.distance.value / 1000).toFixed(2));

        // Fit map to route
        if (mapRef.current) {
          mapRef.current.fitToCoordinates(coords, {
            edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
            animated: true,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  }, [selectedLocation, selected_drop_points]);

  // Enhanced search animations
  useEffect(() => {
    // Main search pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for search circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation for search icon
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Bounce animation for progress bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.05,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Shimmer effect for loading text
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim, pulseAnim, rotateAnim, bounceAnim, shimmerAnim]);

  // Progress animation
  useEffect(() => {
    if (!providerFound) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 5000,
        useNativeDriver: false,
      }).start();
    }
  }, [providerFound, progressAnim]);

  // Enhanced provider search with dynamic status
  useEffect(() => {
    const searchProvider = () => {
      setSearchProgress(0);
      setIsLoading(true);
      setSearchStatus('Initializing search...');
      setCurrentDriverCount(0);

      const statusMessages = [
        'Initializing search...',
        'Scanning nearby drivers...',
        'Checking driver availability...',
        'Matching best driver...',
        'Almost ready...',
        'Driver found!'
      ];

      let messageIndex = 0;
      const statusInterval = setInterval(() => {
        if (messageIndex < statusMessages.length - 1) {
          messageIndex++;
          setSearchStatus(statusMessages[messageIndex]);
        }
      }, 800);

      const progressInterval = setInterval(() => {
        setSearchProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      const driverCountInterval = setInterval(() => {
        setCurrentDriverCount(prev => {
          if (prev < 5) {
            return prev + 1;
          }
          return prev;
        });
      }, 1000);

      searchTimerRef.current = setTimeout(() => {
        clearInterval(progressInterval);
        clearInterval(statusInterval);
        clearInterval(driverCountInterval);
        
        const randomDriver = DRIVERS[Math.floor(Math.random() * DRIVERS.length)];
      setSelectedDriver(randomDriver);
      setProviderFound(true);
        setIsLoading(false);
        setSearchProgress(100);
        setSearchStatus('Driver found!');

        // Animate bottom sheet in
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: false,
          }),
        ]).start();
    }, 5000);

      return () => {
        if (searchTimerRef.current) {
          clearTimeout(searchTimerRef.current);
        }
        clearInterval(progressInterval);
        clearInterval(statusInterval);
        clearInterval(driverCountInterval);
      };
    };

    const cleanup = searchProvider();
    return cleanup;
  }, []);

  // Show rating modal after delay
  useEffect(() => {
    if (providerFound && selectedDriver) {
      const ratingTimer = setTimeout(() => {
        setShowRatingModal(true);
        setProviderFound(false);
      }, 20000);

      return () => clearTimeout(ratingTimer);
    }
  }, [providerFound, selectedDriver]);

  // Back button handler
  useEffect(() => {
    const backAction = () => {
      if (providerFound) {
        // Show cancel modal
      return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [providerFound]);

  // Initial setup
  useEffect(() => {
    fetchRoute();
  }, [fetchRoute]);

  const handleCancel = () => {
    (navigation as any).replace('DashboardScreen');
  };

  const handleRatingSubmit = (rating: number, comment: string) => {
    console.log('Rating submitted:', { rating, comment, driver: selectedDriver?.name });
    // Implement API call here
  };

  const handleCallDriver = () => {
    // Implement call functionality
    console.log('Calling driver:', selectedDriver?.phone);
  };

  const handleMessageDriver = () => {
    // Implement messaging functionality
    console.log('Messaging driver:', selectedDriver?.name);
  };

  // Render loading state
  if (isLoading && !providerFound) {
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        
        {/* Map View */}
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={{
            latitude: selectedLocation?.latitude || 28.6139,
            longitude: selectedLocation?.longitude || 77.2090,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          showsMyLocationButton={false}
            >
              <Marker coordinate={selectedLocation} title="Pickup" pinColor="green" />
              <Marker coordinate={selected_drop_points} title="Drop" pinColor="red" />
              {routeCoordinates.length > 0 && (
                <Polyline
                  coordinates={routeCoordinates}
              strokeColor={theme.colors.interactive.primary}
                  strokeWidth={4}
                />
              )}
            </MapView>

        {/* Distance indicator */}
        <View style={[styles.distanceIndicator, { backgroundColor: theme.colors.surface.primary }]}>
          <MaterialIcons name="straighten" size={16} color={theme.colors.text.secondary} />
          <StyledText variant="body" color="secondary" style={styles.distanceText}>
            {distance} km
          </StyledText>
            </View>

        {/* Search overlay */}
        <View style={[styles.searchOverlay, { backgroundColor: theme.colors.surface.primary }]}>
          {/* Header */}
          <View style={styles.searchHeader}>
            <View style={styles.searchTitleContainer}>
              <StyledText variant="h3" color="primary" weight="bold">
                Finding your service provider
              </StyledText>
              <StyledText variant="body" color="secondary">
                Please wait while we match you with the best available driver
              </StyledText>
              </View>
            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.colors.surface.secondary }]}
              onPress={handleCancel}
            >
              <MaterialIcons name="close" size={20} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Progress section */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <StyledText variant="body" color="primary" weight="medium">
                Search Progress
              </StyledText>
              <StyledText variant="caption" color="secondary">
                {searchProgress}%
              </StyledText>
            </View>
            
            <Animated.View 
              style={[
                styles.progressBar, 
                { 
                  backgroundColor: theme.colors.surface.secondary,
                  transform: [{ scaleY: bounceAnim }],
                }
              ]}
            >
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    backgroundColor: theme.colors.interactive.primary,
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
              {/* Progress glow effect */}
              <Animated.View
                style={[
                  styles.progressGlow,
                  {
                    backgroundColor: theme.colors.interactive.primary,
                    shadowColor: theme.colors.interactive.primary,
                    opacity: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.6],
                    }),
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  },
                ]}
              />
            </Animated.View>
              </View>

          {/* Enhanced search animation */}
          <View style={styles.searchAnimationContainer}>
            {/* Outer pulse ring */}
            <Animated.View 
              style={[
                styles.pulseRing, 
                { 
                  backgroundColor: theme.colors.interactive.primary,
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0.3, 0],
                  }),
                }
              ]} 
            />
            
            {/* Main search circle */}
            <Animated.View style={[
              styles.searchCircle, 
              { 
                backgroundColor: theme.colors.interactive.primary,
                transform: [{ scale: scaleAnim }] 
              }
            ]}>
              <Animated.View
                style={{
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                }}
              >
                <MaterialIcons name="search" size={40} color={theme.colors.text.inverse} />
              </Animated.View>
            </Animated.View>
            
            {/* Dynamic status text */}
            <Animated.View style={styles.searchingTextContainer}>
              <StyledText variant="body" color="primary" weight="medium" style={styles.searchingText}>
                {searchStatus}
              </StyledText>
              <StyledText variant="caption" color="secondary" style={styles.driverCountText}>
                {currentDriverCount > 0 ? `${currentDriverCount} drivers nearby` : 'Searching...'}
              </StyledText>
              <Animated.View
                style={[
                  styles.shimmerOverlay,
                  {
                    backgroundColor: theme.colors.interactive.primary,
                    opacity: shimmerAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 0.3],
                    }),
                  }
                ]}
              />
              </Animated.View>
            
            {/* Animated dots */}
            <View style={styles.dotsContainer}>
              {[0, 1, 2].map((index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.dot,
                    {
                      backgroundColor: theme.colors.interactive.primary,
                      transform: [{
                        scale: bounceAnim.interpolate({
                          inputRange: [1, 1.05],
                          outputRange: [1, 1.2],
                        }),
                      }],
                      opacity: bounceAnim.interpolate({
                        inputRange: [1, 1.05],
                        outputRange: [0.6, 1],
                      }),
                    }
                  ]}
                />
              ))}
                </View>
          </View>

          {/* Enhanced service details with animations */}
          <Animated.View 
            style={[
              styles.serviceDetails, 
              { 
                backgroundColor: theme.colors.surface.secondary,
                transform: [{ scale: bounceAnim }],
              }
            ]}
          >
            <View style={styles.serviceDetailRow}>
              <Animated.View
                style={{
                  transform: [{
                    rotate: rotateAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  }],
                }}
              >
                <MaterialIcons name="directions-car" size={20} color={theme.colors.interactive.primary} />
              </Animated.View>
              <StyledText variant="body" color="primary" weight="medium">
                {selectedVehicle || 'Vehicle Towing'}
              </StyledText>
            </View>
            <View style={styles.serviceDetailRow}>
              <Animated.View
                    style={{
                  transform: [{
                    scale: pulseAnim,
                  }],
                }}
              >
                <MaterialIcons name="local-shipping" size={20} color={theme.colors.interactive.primary} />
              </Animated.View>
              <StyledText variant="body" color="primary" weight="medium">
                {selected_tow_type || 'Standard Tow'}
              </StyledText>
              </View>
              </Animated.View>

          {/* Live search stats */}
          <View style={[
            styles.searchStats, 
            { 
              backgroundColor: theme.colors.surface.primary,
              borderColor: theme.colors.border.secondary,
            }
          ]}>
            <View style={styles.statItem}>
              <MaterialIcons name="schedule" size={16} color={theme.colors.text.secondary} />
              <StyledText variant="caption" color="secondary">
                Est. time: 2-5 min
              </StyledText>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="location-on" size={16} color={theme.colors.text.secondary} />
              <StyledText variant="caption" color="secondary">
                {distance} km away
              </StyledText>
          </View>
            <View style={styles.statItem}>
              <MaterialIcons name="star" size={16} color={theme.colors.interactive.warning} />
              <StyledText variant="caption" color="secondary">
                Avg. rating: 4.8
              </StyledText>
          </View>
          </View>
        </View>
      </View>
    );
  }

  // Render provider found state
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: selectedLocation?.latitude || 28.6139,
          longitude: selectedLocation?.longitude || 77.2090,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
            <Marker coordinate={selectedLocation} title="Pickup" pinColor="green" />
            <Marker coordinate={selected_drop_points} title="Drop" pinColor="red" />
        {selectedDriver?.location && (
          <Marker coordinate={selectedDriver.location} title="Driver" pinColor="blue" />
        )}
            {routeCoordinates.length > 0 && (
              <Polyline
                coordinates={routeCoordinates}
            strokeColor={theme.colors.interactive.primary}
                strokeWidth={4}
              />
            )}
          </MapView>

      {/* Action buttons overlay */}
          <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.surface.primary }]}>
              <MaterialIcons name="edit" size={18} color={theme.colors.interactive.primary} />
          <StyledText variant="caption" color="primary" style={styles.actionButtonText}>
            Edit Pickup
          </StyledText>
            </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.surface.primary }]}>
              <MaterialIcons name="share" size={18} color={theme.colors.interactive.primary} />
          <StyledText variant="caption" color="primary" style={styles.actionButtonText}>
            Share
          </StyledText>
            </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: theme.colors.surface.primary }]}>
          <MaterialIcons name="security" size={18} color={theme.colors.interactive.primary} />
          <StyledText variant="caption" color="primary" style={styles.actionButtonText}>
            Safety
          </StyledText>
            </TouchableOpacity>
          </View>

      {/* Driver details bottom sheet */}
      <Animated.View
        style={[
          styles.driverDetailsContainer,
          {
            backgroundColor: theme.colors.surface.primary,
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
        {...panResponder.panHandlers}
      >
        {/* Drag indicator */}
        <View style={[styles.dragIndicator, { backgroundColor: theme.colors.border.secondary }]} />

        {/* Driver info header */}
        <View style={styles.driverHeader}>
          <View style={styles.driverHeaderContent}>
            <StyledText variant="h3" color="primary" weight="bold">
              Your driver is on the way
            </StyledText>
            <StyledText variant="body" color="secondary">
              {selectedDriver?.status}
            </StyledText>
              </View>
          <View style={[styles.etaBadge, { backgroundColor: theme.colors.interactive.primary }]}>
            <StyledText variant="body" color="inverse" weight="bold">
              {selectedDriver?.eta}
            </StyledText>
              </View>
            </View>

        {/* Driver card */}
        <View style={[styles.driverCard, { backgroundColor: theme.colors.surface.secondary }]}>
              <View style={styles.driverInfo}>
                <Image source={selectedDriver?.image} style={styles.driverImage} />
            <View style={styles.driverDetails}>
              <StyledText variant="h4" color="primary" weight="bold">
                {selectedDriver?.name}
              </StyledText>
              <StyledText variant="body" color="secondary">
                {selectedDriver?.vehicleModel} • {selectedDriver?.vehicleNumber}
              </StyledText>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color={theme.colors.interactive.warning} />
                <StyledText variant="body" color="primary" weight="medium">
                  {selectedDriver?.rating} • {selectedDriver?.experience}
                </StyledText>
                </View>
              </View>
            </View>
          <View style={styles.driverActions}>
              <TouchableOpacity 
              style={[styles.actionIconButton, { backgroundColor: theme.colors.interactive.primary }]}
              onPress={handleCallDriver}
              >
              <MaterialIcons name="phone" size={20} color={theme.colors.text.inverse} />
              </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionIconButton, { backgroundColor: theme.colors.surface.primary }]}
              onPress={handleMessageDriver}
            >
              <MaterialIcons name="message" size={20} color={theme.colors.text.primary} />
              </TouchableOpacity>
          </View>
            </View>

        {/* Trip details */}
        <View style={styles.tripDetails}>
          <View style={styles.tripDetailItem}>
            <MaterialIcons name="location-on" size={20} color={theme.colors.text.secondary} />
            <View style={styles.tripDetailContent}>
              <StyledText variant="caption" color="secondary">
                Pickup from
              </StyledText>
              <StyledText variant="body" color="primary" weight="medium">
                Current location
              </StyledText>
            </View>
          </View>
          <View style={styles.tripDetailItem}>
            <MaterialIcons name="place" size={20} color={theme.colors.text.secondary} />
            <View style={styles.tripDetailContent}>
              <StyledText variant="caption" color="secondary">
                Drop off
              </StyledText>
              <StyledText variant="body" color="primary" weight="medium">
                Selected destination
              </StyledText>
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.bottomActions}>
          <StyledButton
            variant="outline"
            size="large"
            onPress={handleCancel}
            style={styles.cancelButton}
          >
            Cancel Trip
          </StyledButton>
          <StyledButton
            variant="primary"
            size="large"
            onPress={() => {}}
            style={styles.trackButton}
          >
            Track Driver
          </StyledButton>
          </View>
      </Animated.View>

      {/* Driver Rating Modal */}
      {showRatingModal && selectedDriver && (
        <DriverRating
          visible={showRatingModal}
          driver={selectedDriver}
          onRatingSubmit={handleRatingSubmit}
          onClose={() => setShowRatingModal(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  distanceIndicator: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: dimensions.spacing.md4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md3,
    paddingVertical: dimensions.spacing.sm3,
    borderRadius: dimensions.layout.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distanceText: {
    marginLeft: dimensions.spacing.xs3,
    fontWeight: '600',
  },
  searchOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: dimensions.layout.borderRadius.xl,
    borderTopRightRadius: dimensions.layout.borderRadius.xl,
    padding: dimensions.spacing.lg4,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: dimensions.spacing.lg4,
  },
  searchTitleContainer: {
    flex: 1,
    marginRight: dimensions.spacing.md4,
  },
  cancelButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressSection: {
    marginBottom: dimensions.spacing.lg4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.sm3,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  searchAnimationContainer: {
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg4,
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    top: -20,
    left: -20,
  },
  searchCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  searchingTextContainer: {
    position: 'relative',
    marginBottom: dimensions.spacing.md4,
  },
  searchingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: dimensions.spacing.xs3,
  },
  driverCountText: {
    textAlign: 'center',
    fontSize: 12,
    opacity: 0.8,
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 4,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: dimensions.spacing.sm3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: dimensions.spacing.md4,
    borderRadius: dimensions.layout.borderRadius.lg,
    marginBottom: dimensions.spacing.md4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.sm3,
  },
  searchStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: dimensions.spacing.sm4,
    borderRadius: dimensions.layout.borderRadius.md,
    borderWidth: 1,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: dimensions.spacing.xs3,
  },
  actionButtonsContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 80,
    right: dimensions.spacing.md4,
    flexDirection: 'column',
    gap: dimensions.spacing.sm3,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md3,
    paddingVertical: dimensions.spacing.sm3,
    borderRadius: dimensions.layout.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    marginLeft: dimensions.spacing.xs3,
    fontWeight: '600',
  },
  driverDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: dimensions.layout.borderRadius.xl,
    borderTopRightRadius: dimensions.layout.borderRadius.xl,
    padding: dimensions.spacing.lg4,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: dimensions.spacing.lg4,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: dimensions.spacing.lg4,
  },
  driverHeaderContent: {
    flex: 1,
  },
  etaBadge: {
    paddingHorizontal: dimensions.spacing.md3,
    paddingVertical: dimensions.spacing.sm3,
    borderRadius: dimensions.layout.borderRadius.lg,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: dimensions.spacing.md4,
    borderRadius: dimensions.layout.borderRadius.lg,
    marginBottom: dimensions.spacing.lg4,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  driverImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: dimensions.spacing.md4,
  },
  driverDetails: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: dimensions.spacing.xs3,
  },
  driverActions: {
    flexDirection: 'row',
    gap: dimensions.spacing.sm3,
  },
  actionIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripDetails: {
    marginBottom: dimensions.spacing.lg4,
  },
  tripDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: dimensions.spacing.md3,
  },
  tripDetailContent: {
    marginLeft: dimensions.spacing.md3,
    flex: 1,
  },
  bottomActions: {
    flexDirection: 'row',
    gap: dimensions.spacing.md4,
  },
  trackButton: {
    flex: 1,
  },
});

export default SearchingProvider;