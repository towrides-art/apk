import React, { useEffect, useRef, useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Animated, Alert, Modal as NativeModal, SafeAreaView } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import RNModal from "react-native-modal";
import DestinationSelector from "./DestinationSelector";
import GarageSelector from "./GarageSelector";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomSelector from "./CustomSelector";
import CustomSelectorWithImage from "./CustomSelectorWithImage";
import Toast from '../../src/utils/toast';
import ServiceIcon from './ServiceIcons';
import { useTheme } from '../../src/theme/ThemeProvider';
import { StyledText, StyledButton, StyledView, Spacer } from '../../src/components/styled';
import { dimensions } from '../../src/theme/dimensions';
import api from '../axiosInstance';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
Geocoder.init('AIzaSyCr6FbhZa_qV3jn7bz6lr7OZYfTz5Xrpzo');

const services = [
  {
    name: 'Vehicle Towing',
    image: require('./asset/tow.jpg'),
    whereToRequired: false,
    type: 'tow'
  },
];

const calculateDrivingDistance = async (origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) => {
  const GOOGLE_MAPS_API_KEY = 'AIzaSyCr6FbhZa_qV3jn7bz6lr7OZYfTz5Xrpzo'; // Move to environment variables
  
  try {
    const originStr = `${origin.latitude},${origin.longitude}`;
    const destStr = `${destination.latitude},${destination.longitude}`;
    
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originStr}&destinations=${destStr}&units=metric&mode=driving&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    console.log('Distance Matrix API Response:', data);
    
    if (data.status === 'OK' && data.rows[0].elements[0].status === 'OK') {
      const element = data.rows[0].elements[0];
      return {
        distance: parseFloat((element.distance.value / 1000).toFixed(1)), // km
        duration: element.duration.text,
        durationValue: element.duration.value, // seconds
        success: true
      };
    }
    
    throw new Error('No route found');
  } catch (error) {
    console.error('Distance Matrix API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { success: false, error: errorMessage };
  }
};
 

const ServicesUnderMapNew = ({ 
  navigation, selectedLocation, setSelectedLocation, searchText, setSearchText, setHeight, height, selectedDropLocation, setSelectedDropLocation, dropSearchText, setDropSearchText, openPickupSearch }: any) => {
  const { theme } = useTheme();

  // Dynamic styles that use theme
  const styles = StyleSheet.create({
    // ─── Home bottom panel (Professional) ───
    maincontainer: {
      width: '100%',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      position: 'absolute',
      bottom: 0,
      elevation: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -10 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      backgroundColor: theme.colors.surface.primary,
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 32,
    },
    panelHandle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#ddd',
      alignSelf: 'center',
      marginBottom: 16,
    },
    locationCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#f5f5f5',
      borderRadius: 16,
      paddingVertical: 4,
      paddingHorizontal: 4,
    },
    timeline: {
      width: 28,
      alignItems: 'center',
      paddingTop: 14,
      paddingBottom: 14,
    },
    timelineDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#4CAF50',
      borderWidth: 3,
      borderColor: '#A5D6A7',
    },
    timelineLine: {
      width: 2,
      flex: 1,
      backgroundColor: '#ccc',
      marginVertical: 2,
      minHeight: 16,
    },
    timelineEndDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: '#F44336',
      borderWidth: 3,
      borderColor: '#EF9A9A',
    },
    locationInputs: {
      flex: 1,
      gap: 0,
    },
    pickupInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    pickupLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: '#4CAF50',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 2,
    },
    pickupText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '500',
      lineHeight: 18,
    },
    dropInput: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 12,
    },
    dropLabel: {
      fontSize: 10,
      fontWeight: '700',
      color: '#F44336',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 2,
    },
    dropPlaceholder: {
      flex: 1,
      fontSize: 18,
      color: '#bbb',
      fontWeight: '600',
      lineHeight: 22,
    },
    dropText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text.primary,
      fontWeight: '600',
      lineHeight: 18,
    },
    dropSearchIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#f37f21',
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 3,
      shadowColor: '#f37f21',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    // ─── Booking modal (Rapido-style bottom sheet) ───
    bookingModal: {
      margin: 0,
      justifyContent: 'flex-end',
    },
    bookingContainer: {
      backgroundColor: '#fff',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      height: '88%',
      paddingBottom: 0,
    },
    bookingHandle: {
      width: 44,
      height: 5,
      borderRadius: 3,
      backgroundColor: '#ddd',
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 8,
    },
    bookingHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 6,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    bookingTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#1a1a1a',
    },
    bookingCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#f5f5f5',
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Location summary - compact
    locationSummary: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginHorizontal: 16,
      marginVertical: 10,
      padding: 12,
      backgroundColor: '#f5f5f5',
      borderRadius: 14,
    },
    summaryTimeline: {
      width: 18,
      alignItems: 'center',
      marginRight: 10,
      paddingTop: 2,
    },
    summaryDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      borderWidth: 2,
    },
    summaryLine: {
      width: 1.5,
      flex: 1,
      backgroundColor: '#ccc',
      marginVertical: 1,
      minHeight: 10,
    },
    summaryTexts: {
      flex: 1,
      gap: 4,
    },
    summaryPickup: {
      fontSize: 12,
      color: '#333',
      fontWeight: '500',
    },
    summaryDrop: {
      fontSize: 12,
      color: '#333',
      fontWeight: '500',
    },
    summaryLabel: {
      fontSize: 8,
      fontWeight: '700',
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    // Vehicle type chips
    vehicleChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 16,
      paddingBottom: 10,
      gap: 8,
    },
    vehicleChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      backgroundColor: '#f5f5f5',
      borderWidth: 1.5,
      borderColor: '#e0e0e0',
    },
    vehicleChipActive: {
      backgroundColor: '#FFF3E0',
      borderColor: '#f37f21',
    },
    vehicleChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#666',
    },
    vehicleChipTextActive: {
      color: '#f37f21',
    },
    // Section label
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 8,
      paddingHorizontal: 16,
    },
    // Tow option card (Rapido style)
    towCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 8,
      paddingVertical: 10,
      paddingHorizontal: 14,
      backgroundColor: '#fff',
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: '#eee',
      elevation: 1,
    },
    towCardSelected: {
      borderColor: '#f37f21',
      backgroundColor: '#FFF8F0',
      elevation: 3,
      shadowColor: '#f37f21',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    towCardImage: {
      width: 44,
      height: 44,
      borderRadius: 10,
      backgroundColor: '#f5f5f5',
      marginRight: 12,
      resizeMode: 'contain',
    },
    towCardInfo: {
      flex: 1,
    },
    towCardName: {
      fontSize: 14,
      fontWeight: '700',
      color: '#222',
    },
    towCardEta: {
      fontSize: 11,
      color: '#888',
      marginTop: 2,
    },
    towCardPrice: {
      alignItems: 'flex-end',
    },
    towCardPriceText: {
      fontSize: 16,
      fontWeight: '800',
      color: '#222',
    },
    towCardPriceSub: {
      fontSize: 10,
      color: '#aaa',
      marginTop: 1,
    },
    towCardCheck: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#f37f21',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    towCardCheckEmpty: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: '#ddd',
      marginLeft: 8,
    },
    // Distance info - inline
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 6,
    },
    infoLabel: {
      fontSize: 12,
      color: '#999',
      fontWeight: '500',
    },
    infoValue: {
      fontSize: 13,
      fontWeight: '700',
      color: '#333',
    },
    // Sticky bottom CTA
    ctaContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#fff',
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
      borderTopWidth: 1,
      borderTopColor: '#f0f0f0',
      elevation: 12,
    },
    ctaPriceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    ctaPriceLabel: {
      fontSize: 12,
      color: '#888',
      fontWeight: '600',
    },
    ctaPriceValue: {
      fontSize: 22,
      fontWeight: '900',
      color: '#f37f21',
    },
    bookButton: {
      backgroundColor: '#f37f21',
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      elevation: 6,
      shadowColor: '#f37f21',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
    },
    bookButtonText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: 0.5,
    },
    // Drop location modal
    searchContainer: {
      position: 'absolute',
      top: 50,
      left: 12,
      right: 12,
      zIndex: 10,
      backgroundColor: '#fff',
      borderRadius: 14,
      elevation: 6,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    searchBox: {
      position: 'relative',
      justifyContent: 'center',
    },
    inputWithClear: {
      borderRadius: 14,
      padding: 14,
      paddingRight: 40,
      fontSize: 16,
    },
    clearButton: {
      position: 'absolute',
      right: 12,
      top: 8,
      zIndex: 1,
    },
    clearButtonText: {
      fontSize: 26,
      color: '#aaa',
    },
    suggestionsList: {
      maxHeight: 180,
      paddingHorizontal: 8,
      paddingBottom: 8,
    },
    suggestionItem: {
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#f0f0f0',
    },
    suggestionText: {
      fontSize: 14,
      color: '#333',
    },
    markerFixed: {
      position: 'absolute',
      top: Dimensions.get('window').height / 2 - Dimensions.get('window').height * 0.073,
      left: Dimensions.get('window').width / 2 - Dimensions.get('window').width * 0.05,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 30,
      left: 16,
      right: 16,
      gap: 10,
    },
    confirmButton: {
      backgroundColor: '#f37f21',
      paddingVertical: 14,
      borderRadius: 14,
      alignItems: 'center',
      elevation: 4,
    },
    cancelButton: {
      paddingVertical: 10,
      alignItems: 'center',
    },
  });
  const [tow_model, setTowModel] = useState(false);
  const [dropModalVisible, setDropModalVisible] = useState(false);
  const [dropTempLocation, setDropTempLocation] = useState<any>(null);
  const [dropSearchInput, setDropSearchInput] = useState('');
  const [dropSuggestions, setDropSuggestions] = useState<any[]>([]);
  const dropMapRef = useRef<MapView>(null);

  const openDropModal = () => {
    if (!selectedLocation) {
      Toast.show('Please wait for location to load', Toast.SHORT);
      return;
    }
    setDropTempLocation(selectedDropLocation || selectedLocation);
    setDropModalVisible(true);
    if (selectedDropLocation) {
      setDropSearchInput(selectedDropLocation.name || '');
    } else {
      fetchDropAddress(selectedLocation.latitude, selectedLocation.longitude);
    }
  };

  const fetchDropAddress = async (lat: number, lng: number) => {
    try {
      const res = await Geocoder.from(lat, lng);
      const addr = res.results[0]?.formatted_address || '';
      setDropSearchInput(addr);
    } catch (err) {
      setDropSearchInput('');
    }
  };

  const handleDropMapRegionChange = async (region: any) => {
    setDropTempLocation({ latitude: region.latitude, longitude: region.longitude });
    fetchDropAddress(region.latitude, region.longitude);
  };

  const handleDropSearch = async (text: string) => {
    setDropSearchInput(text);
    if (text.length < 3) { setDropSuggestions([]); return; }
    try {
      const res = await Geocoder.from(text);
      const results = res.results.map((item: any) => ({
        name: item.formatted_address,
        location: item.geometry.location,
      }));
      setDropSuggestions(results);
    } catch (err) {}
  };

  const selectDropSuggestion = (item: any) => {
    const loc = { latitude: item.location.lat, longitude: item.location.lng };
    setDropTempLocation(loc);
    setDropSearchInput(item.name);
    setDropSuggestions([]);
    dropMapRef.current?.animateToRegion({ ...loc, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };

  const confirmDropLocation = () => {
    if (dropTempLocation) {
      setSelectedDropLocation({ ...dropTempLocation, name: dropSearchInput });
    }
    setDropModalVisible(false);
    // Auto-open booking modal after drop is selected
    setTimeout(() => setTowModel(true), 300);
  };
  
  const openServiceModel = (type: string) => {
    if (type == 'tow') {
      setTowModel(true);
    }
  }
  
  const [bookingInProgress, setBookingInProgress] = useState(false);

    const [Vehicleopen, setVehicleOpen] = useState(false);
    const [selectedVehicle, SetselectedVehicle] = useState(null);
    const [vehicles, setVehicles] = useState<{label: string, value: string}[]>([]);
    const [tow_open, setTowOpen] = useState(false);
    const [selected_tow_type, SetselectedTowType] = useState(null);
    const [selected_where_to, setSelectedWhereTo] = useState('my_destination')
    const [other_details, set_other_details] = useState('')
    // selected_drop_points removed - using parent's selectedDropLocation instead
    const [selected_pickup_points, set_selected_pickup_points] = useState(null)
    const [tow_types, setTowTypes] = useState<{label: string, value: string, image: any}[]>([]);
    const [renderTowContent, setRenderTowContent] = useState(false);

    // Price calculation states
    const [totalPrice, setTotalPrice] = useState(0);
    const [basePrice, setBasePrice] = useState(0);
    const [pricePerKm, setPricePerKm] = useState(0);
    const [distance, setDistance] = useState(0);
    const [estimatedTime, setEstimatedTime] = useState('');
    const [showPriceDetails, setShowPriceDetails] = useState(false);
    const [showBookingConfirmation, setShowBookingConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [priceLoading, setPriceLoading] = useState(false);
    const [calculatingDistance, setCalculatingDistance] = useState(false);
    const [routeFound, setRouteFound] = useState(false);

    
    // Animation for price section
    const priceAnimation = useRef(new Animated.Value(0)).current;
    const priceOpacity = useRef(new Animated.Value(0)).current;

    // Load services data when modal opens
    useEffect(() => {
      if (tow_model) {
        loadServicesData();
        setTimeout(() => {
          setRenderTowContent(true);
        }, 50);
        // Recalculate distance if we have locations but distance is 0
        if (distance === 0 && (selected_pickup_points ?? selectedLocation) && selectedDropLocation) {
          const recalc = async () => {
            setCalculatingDistance(true);
            try {
              const origin = {
                latitude: (selected_pickup_points ?? selectedLocation).latitude || (selected_pickup_points ?? selectedLocation).coords?.latitude || (selected_pickup_points ?? selectedLocation).lat,
                longitude: (selected_pickup_points ?? selectedLocation).longitude || (selected_pickup_points ?? selectedLocation).coords?.longitude || (selected_pickup_points ?? selectedLocation).lng
              };
              const destination = {
                latitude: selectedDropLocation?.latitude || selectedDropLocation?.coords?.latitude || selectedDropLocation?.lat,
                longitude: selectedDropLocation?.longitude || selectedDropLocation?.coords?.longitude || selectedDropLocation?.lng
              };
              if (origin.latitude && destination.latitude) {
                const result = await calculateDrivingDistance(origin, destination);
                if (result.success) {
                  setDistance(result.distance || 0);
                  setEstimatedTime(result.duration || '');
                  setRouteFound(true);
                }
              }
            } catch (e) {
              console.error('Recalc distance error:', e);
            } finally {
              setCalculatingDistance(false);
            }
          };
          recalc();
        }
      } else {
        setRenderTowContent(false);
      }
    }, [tow_model]);

    // Auto-calculate distance when locations change
    useEffect(() => {
      const autoCalculateDistance = async () => {
        if (!(selected_pickup_points ?? selectedLocation) || !selectedDropLocation) {
          setDistance(0);
          setEstimatedTime('');
          setRouteFound(false);
          return;
        }
        
        setCalculatingDistance(true);
        setRouteFound(false);
        
        try {
          // Extract coordinates properly
          const origin = {
            latitude: (selected_pickup_points ?? selectedLocation).latitude || (selected_pickup_points ?? selectedLocation).coords?.latitude || (selected_pickup_points ?? selectedLocation).lat,
            longitude: (selected_pickup_points ?? selectedLocation).longitude || (selected_pickup_points ?? selectedLocation).coords?.longitude || (selected_pickup_points ?? selectedLocation).lng
          };
          
          const destination = {
            latitude: selectedDropLocation?.latitude || selectedDropLocation?.coords?.latitude || selectedDropLocation?.lat,
            longitude: selectedDropLocation?.longitude || selectedDropLocation?.coords?.longitude || selectedDropLocation?.lng
          };
          
          console.log('Calculating distance between:', origin, destination);
          
          if (!origin.latitude || !destination.latitude) {
            Toast.show('Location coordinates not available', Toast.SHORT);
            return;
          }
          
          const result = await calculateDrivingDistance(origin, destination);
          
          if (result.success) {
            setDistance(result.distance || 0);
            setEstimatedTime(result.duration || '');
            setRouteFound(true);
            // Toast.show(`Distance: ${result.distance} km (${result.duration})`, Toast.LONG);
          } else {
            Toast.show(`Failed to calculate distance: ${result.error}`, Toast.LONG);
            setDistance(0);
            setEstimatedTime('');
            setRouteFound(false);
          }
          
        } catch (error) {
          console.error('Distance calculation error:', error);
          Toast.show('Unable to calculate driving distance', Toast.SHORT);
          setDistance(0);
          setEstimatedTime('');
          setRouteFound(false);
        } finally {
          setCalculatingDistance(false);
        }
      };
      
      // Add small delay to avoid too many API calls
      const timeoutId = setTimeout(autoCalculateDistance, 1000);
      return () => clearTimeout(timeoutId);
      
    }, [selected_pickup_points, selectedDropLocation, selectedLocation]);

    // Load services data from API
    const loadServicesData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/get_tows');
        const data = response.data;

        // Transform vehicles data to match dropdown format
        const transformedVehicles = data.vechiles.map((vehicle: any, index: number) => ({
          label: vehicle.label,
          value: vehicle.key, // Use key instead of numeric value
        }));

        // Transform tow types data to match dropdown format  
        const transformedTowTypes = data.tow_types.map((towType: any, index: number) => ({
          label: towType.label,
          value: towType.key, // Use key instead of numeric value
          image: getImageForTowType(towType.key), // You'll need to map images
        }));

        setVehicles(transformedVehicles);
        setTowTypes(transformedTowTypes);
      } catch (error) {
        console.error('Error loading services:', error);
        Toast.show('Failed to load services. Please try again.', Toast.SHORT);
      } finally {
        setLoading(false);
      }
    };

    // Map tow type keys to images
    const getImageForTowType = (key: 'flatbed' | 'mini_flatbed' | 'heavy_duty_flatbed' | 'wheel_lift' | 'heavy_duty_tow_truck' | 'rotato') => {
      const imageMap = {
        'flatbed': require('./asset/tow_types/1.png'),
        'mini_flatbed': require('./asset/tow_types/2.png'),
        'heavy_duty_flatbed': require('./asset/tow_types/2.png'),
        'wheel_lift': require('./asset/tow_types/4.png'),
        'heavy_duty_tow_truck': require('./asset/tow_types/5.png'),
        'rotato': require('./asset/tow_types/6.png'),
      };
      return imageMap[key] || require('./asset/tow_types/1.png');
    };

    // Calculate price when selections change
    useEffect(() => {
      if (selectedVehicle && selected_tow_type && distance > 0) {
        calculatePrice();
      }
    }, [selectedVehicle, selected_tow_type, distance]);

    // Calculate price using API
    const calculatePrice = async () => {
      if (!selectedVehicle || !selected_tow_type || distance <= 0) return;
      
      setPriceLoading(true);
      try {
        const response = await api.post('/calculate_fair', {
          tow_type: selected_tow_type,
          vechile_type: selectedVehicle,
          distance: distance
        });

        const data = response.data;
        setBasePrice(data.base_price);
        setPricePerKm(data.price_per_km);
        setTotalPrice(data.total);
        
        console.log('Price calculated:', data);
      } catch (error) {
        console.error('Error calculating price:', error);
        Toast.show('Failed to calculate price. Please try again.', Toast.SHORT);
      } finally {
        setPriceLoading(false);
      }
    };

    const [isTowSliding, setIsTowSliding] = useState(false);

    const handleTowSlide = () => {
      if (!isTowSliding) {
        if (
          !selectedDropLocation ||
          !(selected_pickup_points ?? selectedLocation) ||
          !selected_tow_type ||
          !selectedVehicle
        ) {
          Toast.show('Please fill all required fields!', Toast.SHORT);
          return;
        }
        
        if (distance <= 0 || !routeFound) {
          Toast.show('Please wait for distance calculation or check locations!', Toast.SHORT);
          return;
        }
        
        // Show price details first
        setShowPriceDetails(true);
      }
    };

   // Update the handleProceedWithBooking function in your TowModel component

const handleProceedWithBooking = async () => {
  // Check each requirement and show specific error
  if (!(selected_pickup_points ?? selectedLocation)) {
    Toast.show('Please select pickup location', Toast.SHORT);
    return;
  }
  if (!selectedDropLocation) {
    Toast.show('Please select drop location', Toast.SHORT);
    return;
  }
  if (!selectedVehicle) {
    Toast.show('Please select vehicle type', Toast.SHORT);
    return;
  }
  if (!selected_tow_type) {
    Toast.show('Please select tow type', Toast.SHORT);
    return;
  }
  if (!distance || distance <= 0) {
    Toast.show('Distance calculation failed. Please check locations.', Toast.SHORT);
    return;
  }
  if (!totalPrice || totalPrice <= 0) {
    Toast.show('Price calculation failed. Please try again.', Toast.SHORT);
    return;
  }

  setIsTowSliding(true);

  try {
    // Check if user is authenticated
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Toast.show('Please login to book a ride', Toast.SHORT);
      setIsTowSliding(false);
      return;
    }

    // Prepare booking data - match backend expected format
    const bookingData = {
      tow_type: selected_tow_type,
      vehicle_type: selectedVehicle,
      pickup_lat: (selected_pickup_points ?? selectedLocation).latitude || (selected_pickup_points ?? selectedLocation).coords?.latitude || (selected_pickup_points ?? selectedLocation).lat,
      pickup_lng: (selected_pickup_points ?? selectedLocation).longitude || (selected_pickup_points ?? selectedLocation).coords?.longitude || (selected_pickup_points ?? selectedLocation).lng,
      pickup_address: searchText || 'Pickup Location',
      drop_lat: selectedDropLocation.latitude || selectedDropLocation.coords?.latitude || selectedDropLocation.lat,
      drop_lng: selectedDropLocation.longitude || selectedDropLocation.coords?.longitude || selectedDropLocation.lng,
      drop_address: selectedDropLocation.name || selectedDropLocation.description || 'Drop Location',
      payment_type: 'cash',
      fare: totalPrice,
      distance: distance
    };

    console.log('Booking data:', bookingData);
    console.log('Token exists:', !!token);

    // Call booking API
    const response = await api.post('/user/rides/book', bookingData);

    if (response.data.booking) {
      const booking = response.data.booking;

      console.log('Booking successful:', booking);

      // Close modal
      setTowModel(false);

      // Navigate to searching provider screen
      setTimeout(() => {
        navigation.navigate('SearchingProvider', {
          booking: booking,
          selected_drop_points: selectedDropLocation,
          selectedLocation: selected_pickup_points ?? selectedLocation,
          selected_tow_type: selected_tow_type,
          service_type: 'tow',
          selectedVehicle: selectedVehicle,
          totalPrice: totalPrice,
          basePrice: basePrice,
          pricePerKm: pricePerKm,
          distance: distance,
          estimatedTime: estimatedTime,
          bookingPin: booking.pin,
          bookingId: booking.id
        });
      }, 300);
    }
  
    
  } catch (error) {
    console.error('Booking error:', error);
    let errorMessage = 'Failed to book ride. Please try again.';

    if (error && typeof error === 'object' && 'response' in error) {
      const err = error as any;
      if (err.response?.status === 401 || err.response?.status === 404) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'OTPScreen' }],
          });
        }, 1500);
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Object.values(errors).flat().join('\n');
      }
    }

    Toast.show(errorMessage, Toast.LONG);
  } finally {
    setIsTowSliding(false);
  }
  };

  return (
    <>
      {/* ─── BOOKING BOTTOM SHEET (Rapido-style) ─── */}
      <RNModal
        isVisible={tow_model}
        onBackdropPress={() => setTowModel(false)}
        style={styles.bookingModal}
        onBackButtonPress={() => setTowModel(false)}
      >
        <View style={styles.bookingContainer}>
          <View style={styles.bookingHandle} />
          <View style={styles.bookingHeader}>
            <Text style={styles.bookingTitle}>Choose Your Tow</Text>
            <TouchableOpacity style={styles.bookingCloseBtn} onPress={() => setTowModel(false)}>
              <MaterialIcons name="close" size={18} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
            {/* Location summary - compact */}
            <View style={styles.locationSummary}>
              <View style={styles.summaryTimeline}>
                <View style={[styles.summaryDot, { borderColor: '#4CAF50', backgroundColor: '#E8F5E9' }]} />
                <View style={styles.summaryLine} />
                <View style={[styles.summaryDot, { borderColor: '#F44336', backgroundColor: '#FFEBEE' }]} />
              </View>
              <View style={styles.summaryTexts}>
                <View>
                  <Text style={styles.summaryLabel}>PICKUP</Text>
                  <Text style={styles.summaryPickup} numberOfLines={1}>{searchText || 'Pickup location'}</Text>
                </View>
                <View>
                  <Text style={styles.summaryLabel}>DROP</Text>
                  <Text style={styles.summaryDrop} numberOfLines={1}>{selectedDropLocation?.name || dropSearchText || 'Drop location'}</Text>
                </View>
              </View>
              {distance > 0 && (
                <View style={{ alignItems: 'flex-end', paddingLeft: 8 }}>
                  <Text style={styles.infoValue}>{distance.toFixed(1)} km</Text>
                  <Text style={styles.infoLabel}>{estimatedTime}</Text>
                </View>
              )}
            </View>

            {/* Vehicle Type Chips */}
            <Text style={styles.sectionLabel}>Your Vehicle</Text>
            <View style={styles.vehicleChipsRow}>
              {vehicles.map((v: any) => (
                <TouchableOpacity
                  key={v.value}
                  style={[styles.vehicleChip, selectedVehicle === v.value && styles.vehicleChipActive]}
                  onPress={() => SetselectedVehicle(v.value)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.vehicleChipText, selectedVehicle === v.value && styles.vehicleChipTextActive]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tow Options - Rapido style cards */}
            <Text style={styles.sectionLabel}>Select Tow Type</Text>
            {calculatingDistance ? (
              <View style={{ paddingVertical: 20, alignItems: 'center' }}>
                <Text style={{ color: '#888', fontSize: 13 }}>⏳ Calculating distance & prices...</Text>
              </View>
            ) : (
              tow_types.map((tow: any) => {
                const isSelected = selected_tow_type === tow.value;
                // Estimate price per tow type (use API price if available, else estimate)
                const towPrice = isSelected && totalPrice > 0 ? totalPrice : (distance > 0 ? Math.round(distance * (tow.value === 'flatbed' ? 35 : tow.value === 'heavy_duty_flatbed' || tow.value === 'heavy_duty_tow_truck' ? 55 : tow.value === 'rotato' ? 65 : 25)) : 0);
                const eta = distance > 0 ? `${Math.max(5, Math.round(distance * 3))}-${Math.max(8, Math.round(distance * 4))} min` : '-- min';

                return (
                  <TouchableOpacity
                    key={tow.value}
                    style={[styles.towCard, isSelected && styles.towCardSelected]}
                    onPress={() => SetselectedTowType(tow.value)}
                    activeOpacity={0.7}
                  >
                    <Image source={tow.image} style={styles.towCardImage} />
                    <View style={styles.towCardInfo}>
                      <Text style={styles.towCardName}>{tow.label}</Text>
                      <Text style={styles.towCardEta}>ETA: {eta}</Text>
                    </View>
                    <View style={styles.towCardPrice}>
                      {towPrice > 0 ? (
                        <>
                          <Text style={styles.towCardPriceText}>₹{towPrice}</Text>
                          <Text style={styles.towCardPriceSub}>est. fare</Text>
                        </>
                      ) : (
                        <Text style={styles.towCardPriceSub}>Select vehicle</Text>
                      )}
                    </View>
                    {isSelected ? (
                      <View style={styles.towCardCheck}>
                        <MaterialIcons name="check" size={14} color="#fff" />
                      </View>
                    ) : (
                      <View style={styles.towCardCheckEmpty} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Sticky bottom CTA */}
          <View style={styles.ctaContainer}>
            <View style={styles.ctaPriceRow}>
              <View>
                <Text style={styles.ctaPriceLabel}>
                  {totalPrice > 0 ? 'Estimated Fare' : priceLoading ? 'Calculating...' : 'Select options'}
                </Text>
                {distance > 0 && (
                  <Text style={{ fontSize: 10, color: '#bbb' }}>{distance.toFixed(1)} km • {estimatedTime}</Text>
                )}
              </View>
              {totalPrice > 0 && (
                <Text style={styles.ctaPriceValue}>₹{totalPrice.toFixed(0)}</Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.bookButton}
              activeOpacity={0.8}
              onPress={() => {
                if (!selectedLocation) { Toast.show('Select pickup location', Toast.SHORT); return; }
                if (!selectedDropLocation) { Toast.show('Select drop location', Toast.SHORT); return; }
                if (!selectedVehicle) { Toast.show('Select vehicle type', Toast.SHORT); return; }
                if (!selected_tow_type) { Toast.show('Select tow type', Toast.SHORT); return; }
                handleProceedWithBooking();
              }}
            >
              <MaterialIcons name="local-taxi" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.bookButtonText}>BOOK TOW</Text>
            </TouchableOpacity>
          </View>
        </View>
      </RNModal>

      {/* ─── HOME BOTTOM PANEL (Professional) ─── */}
      <View
        onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
        style={[styles.maincontainer, { backgroundColor: theme.colors.surface.primary }]}
      >
        {/* Drag handle */}
        <View style={styles.panelHandle} />

        {/* Location card */}
        <View style={styles.locationCard}>
          {/* Timeline dots */}
          <View style={styles.timeline}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineLine} />
            <View style={styles.timelineEndDot} />
          </View>

          {/* Input area */}
          <View style={styles.locationInputs}>
            {/* Pickup */}
            <TouchableOpacity
              style={styles.pickupInput}
              onPress={() => { if (openPickupSearch) openPickupSearch(); }}
              activeOpacity={0.6}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.pickupLabel}>PICKUP</Text>
                <Text style={styles.pickupText} numberOfLines={1}>
                  {searchText || 'Detecting location...'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialIcons name="search" size={18} color="#999" />
                <MaterialIcons name="my-location" size={18} color="#4CAF50" />
              </View>
            </TouchableOpacity>

            {/* Drop / Where to? */}
            <TouchableOpacity
              style={styles.dropInput}
              onPress={openDropModal}
              activeOpacity={0.6}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.dropLabel}>DROP</Text>
                {selectedDropLocation?.name || dropSearchText ? (
                  <Text style={styles.dropText} numberOfLines={1}>
                    {selectedDropLocation?.name || dropSearchText}
                  </Text>
                ) : (
                  <Text style={styles.dropPlaceholder}>Where to?</Text>
                )}
              </View>
              <View style={styles.dropSearchIcon}>
                <MaterialIcons name="search" size={20} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── DROP LOCATION FULLSCREEN MODAL ─── */}
      <NativeModal visible={dropModalVisible} animationType="slide" onRequestClose={() => setDropModalVisible(false)}>
        <SafeAreaView style={{ flex: 1 }}>
          {/* Map - rendered first as base layer */}
          {dropTempLocation ? (
            <MapView
              ref={dropMapRef}
              style={{ width: Dimensions.get('window').width, height: Dimensions.get('window').height }}
              initialRegion={{
                latitude: dropTempLocation.latitude,
                longitude: dropTempLocation.longitude,
                latitudeDelta: 0.007,
                longitudeDelta: 0.007,
              }}
              onRegionChangeComplete={handleDropMapRegionChange}
              showsUserLocation={true}
              provider="google"
            >
              <Marker coordinate={dropTempLocation} title="Drop Location" pinColor="#F44336" />
            </MapView>
          ) : (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#999' }}>Loading map...</Text>
            </View>
          )}

          {/* Search bar - overlaid on top */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <TextInput
                value={dropSearchInput}
                onChangeText={handleDropSearch}
                placeholder="Search drop location..."
                style={styles.inputWithClear}
                autoFocus
              />
              {dropSearchInput.length > 0 && (
                <TouchableOpacity onPress={() => setDropSearchInput('')} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>×</Text>
                </TouchableOpacity>
              )}
            </View>
            {dropSuggestions.length > 0 && (
              <View style={styles.suggestionsList}>
                {dropSuggestions.map((item: any, index: number) => (
                  <TouchableOpacity key={index} onPress={() => selectDropSuggestion(item)} style={styles.suggestionItem}>
                    <MaterialIcons name="location-on" size={16} color="#999" style={{ marginRight: 8 }} />
                    <Text style={styles.suggestionText} numberOfLines={1}>{item.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.markerFixed}>
            <Image source={require('../asset/pin.png')} style={{ width: 48, height: 48, resizeMode: 'contain', marginBottom: -6 }} />
          </View>

          {/* Bottom actions */}
          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={confirmDropLocation} style={styles.confirmButton}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#fff' }}>Confirm Drop Location</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDropModalVisible(false)} style={styles.cancelButton}>
              <Text style={{ fontSize: 15, color: '#888' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </NativeModal>
    </>
  );
}
export default ServicesUnderMapNew;