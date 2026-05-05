import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Alert,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  FlatList,
  Linking,
  Image
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
import Modal from 'react-native-modal';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { IntentLauncher } from 'react-native-intent-launcher';
import { useTheme } from '../../src/theme/ThemeProvider';
import { StyledText, StyledView } from '../../src/components/styled';
import { dimensions } from '../../src/theme/dimensions';
import CustomSidebarScreen from './Sidebar';

// Replace with your real Google Maps Geocoding API key
Geocoder.init('AIzaSyCr6FbhZa_qV3jn7bz6lr7OZYfTz5Xrpzo');

const markerBoxWidth = '90%';
const screenWidth = Dimensions.get('window').width;
const markerBoxLeft = (screenWidth - screenWidth*0.9) / 2;

const ChooseMap = ({ navigation, setSelectedLocation, selectedLocation, setSearchText, searchText, locationShortName, setLocationShortName,height, openPickupSearch, setOpenPickupSearch }: any) => {
  const { theme } = useTheme();
  const [locationName, setLocationName] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [moving, setMoving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Dynamic styles that use theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: dimensions.spacing.lg,
      paddingTop: Platform.OS === 'ios' ? 50 : 25,
      paddingBottom: dimensions.spacing.lg,
      elevation: 12,
      shadowColor: '#f37f21',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 12,
      backgroundColor: '#f37f21',
      borderBottomWidth: 0,
    },
    headerButton: {
      padding: dimensions.spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    titleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    subtitle: {
      fontSize: 11,
      opacity: 0.8,
      marginTop: 2,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '800',
      textAlign: 'center',
      flex: 1,
      color: '#ffffff',
      textShadowColor: 'rgba(0, 0, 0, 0.4)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
      letterSpacing: 1,
    },
    profileButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.4)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 8,
    },
    map: {
      flex: 1,
    },
    markerFixed: {
      position: 'absolute',
      top: Dimensions.get('window').height / 2 - (Dimensions.get('window').height) * 0.073 +55,
      left: Dimensions.get('window').width / 2 - (Dimensions.get('window').width) * 0.05,
    },
    marker: {
      fontSize: 32,
    },
    markerInfo: {
      position: 'absolute',
      left: markerBoxLeft,
      bottom: Dimensions.get('window').height/5,
      width: markerBoxWidth,
      fontWeight:800,
      backgroundColor: 'rgba(243, 127, 33, 0.95)',
      elevation: 15,
      shadowColor: '#f37f21',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      padding: 16,
      borderRadius: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    pickupCard: {
      position: 'absolute',
      left: markerBoxLeft,
      width: markerBoxWidth,
      backgroundColor: 'rgba(243, 127, 33, 0.95)',
      elevation: 15,
      shadowColor: '#f37f21',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      padding: 18,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    pickupCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pickupIconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.colors.interactive.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
      shadowColor: theme.colors.interactive.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
    pickupTextContainer: {
      flex: 1,
    },
    pickupLabel: {
      fontSize: 10,
      fontWeight: '600',
      letterSpacing: 1,
      opacity: 0.7,
      marginBottom: 2,
    },
    pickupAddress: {
      fontSize: 16,
      lineHeight: 20,
      color: theme.colors.text.inverse,
      fontWeight: '500',
    },
    pickupArrowContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 8,
    },
    bottomSheet: {
      height: '50%',
      backgroundColor: '#fff',
      padding: 20,
      borderTopRightRadius: 25,
      borderTopLeftRadius: 25,
    },
    sheetTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    input: {
      backgroundColor: '#eee',
      borderRadius: 10,
      padding: 10,
      marginBottom: 10,
    },
    suggestion: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#ccc',
      color: '#333',
    },
    coordText: {
      marginTop: 10,
      fontSize: 13,
      textAlign: 'center',
      color: '#666',
    },
    loaderContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100000
    },
    searchBox: {
      position: 'relative',
      justifyContent: 'center',
    },
    inputWithClear: {
      backgroundColor: '#eee',
      borderRadius: 10,
      padding: 10,
      paddingRight: 35,
      marginBottom: 10,
    },
    clearButton: {
      position: 'absolute',
      right: 10,
      top: -1,
      zIndex: 1,
    },
    clearButtonText: {
      fontSize: 30,
      color: '#888',
    },
  });

  const mapRef = useRef<MapView>(null);

  const [mapRegion, setMapRegion] = useState({
    latitude: '',
    longitude: '',
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  useEffect(() => {
    setMapRegion((prev) => ({
      latitude: selectedLocation?.latitude,
      longitude: selectedLocation?.longitude,
      latitudeDelta: prev.latitudeDelta || 0.01,
      longitudeDelta: prev.longitudeDelta || 0.01,
    }));
  }, [selectedLocation]);

  const fetchAddressFromCoords = async (lat: number, lng: number) => {
    try {
      const json = await Geocoder.from(lat, lng);
      const fullAddress = json.results[0]?.formatted_address || 'Location unavailable';
      const addressComponents = json.results[0]?.address_components || [];

      const nameOrShort =
        addressComponents.find((c) => c.types.includes('point_of_interest'))?.long_name ||
        addressComponents.find((c) => c.types.includes('premise'))?.long_name ||
        addressComponents.find((c) => c.types.includes('sublocality'))?.long_name ||
        addressComponents.find((c) => c.types.includes('route'))?.long_name ||
        addressComponents.find((c) => c.types.includes('neighborhood'))?.long_name ||
        addressComponents.find((c) => c.types.includes('locality'))?.long_name ||
        fullAddress.split(',')[0];

      setLocationShortName(nameOrShort);
      setLocationName(fullAddress);
      setSearchText(fullAddress);
    } catch (error) {
      setLocationName('Location unavailable');
      setLocationShortName('Location unavailable');
    } finally {
      setMoving(false);
      setIsLocating(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Location permission is required.');
          return;
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const region = {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };

          setSelectedLocation({ latitude, longitude });
          fetchAddressFromCoords(latitude, longitude);
          setLoading(false);

          if (mapRef.current) {
            try {
              mapRef.current.animateToRegion(region, 1500);
              setTimeout(() => {
                setMoving(false);
              }, 1500); // match the duration
            } catch (error) {
              console.error(error);
              setMoving(false); // ensure fallback in case of error
            }
          }
        },
        (error) => {
          // Again Check without Accuracy
          Geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              const region = {
                latitude,
                longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              };

              setSelectedLocation({ latitude, longitude });
              fetchAddressFromCoords(latitude, longitude);
              setLoading(false);

              if (mapRef.current) {
                try {
                  mapRef.current.animateToRegion(region, 1500);
                  setTimeout(() => {
                    setMoving(false);
                  }, 1500); // match the duration
                } catch (error) {
                  console.error(error);
                  setMoving(false); // ensure fallback in case of error
                }

              }
            },
            (error) => {
              if (error.code === 2) {
                Alert.alert(
                  'Location Disabled',
                  'Please turn on your device location then click try again',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Turn On',
                      onPress: () => {
                        if (Platform.OS === 'android') {
                          IntentLauncher.startActivity({
                            action: 'android.settings.LOCATION_SOURCE_SETTINGS',
                          });
                        } else {
                          Linking.openURL('App-Prefs:root=LOCATION_SERVICES');
                        }
                      },
                    },
                  ]
                );
              }
              // Don't set fake location - show error state
              setLocationShortName('Location unavailable');
              setLoading(false);
              setMoving(false);
            },
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 10000,
            }
          );

          // End Again Check
          // setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        }
      );
    } catch (err) {
      setLoading(false);
    }
    setMoving(false);
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (modalVisible && searchText.length >= 3) {
      handleSearch(searchText);
    }
  }, [modalVisible]);

  // Open search modal when triggered from ServicesUnderMapNew
  useEffect(() => {
    if (openPickupSearch) {
      setModalVisible(true);
      setOpenPickupSearch(false);
    }
  }, [openPickupSearch]);

  const handleRegionChangeComplete = (region: any) => {
    setSelectedLocation({
      latitude: region.latitude,
      longitude: region.longitude,
    });
    fetchAddressFromCoords(region.latitude, region.longitude);
    setMoving(false);

  };

  const handleSearch = async (text: string) => {
    setSearchText(text);
    if (text.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await Geocoder.from(text);
      const results = res.results.map((item: any) => ({
        name: item.formatted_address,
        location: item.geometry.location,
      }));
      setSuggestions(results);
    } catch (err) {
    }
  };

  const selectSuggestion = (item: any) => {
    setSelectedLocation({
      latitude: item.location.lat,
      longitude: item.location.lng,
    });
    setLocationName(item.name);
    setLocationShortName(item.name.split(',')[0]);
    setSearchText(item.name);
    setSuggestions([]);
    setModalVisible(false);

    if (mapRef.current) {
      try {
        mapRef.current.animateToRegion({
          latitude: item.location.lat,
          longitude: item.location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
        setTimeout(() => {
          setMoving(false);
        }, 1000);
      } finally {
        setMoving(false);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header]}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            setIsSidebarOpen(true);
          }}
        >
          <View style={styles.iconContainer}>
            <MaterialIcons name="menu" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <StyledText variant="h1" color="inverse" weight="bold" style={styles.headerTitle}>
            Tow Rides
          </StyledText>
        </View>
        
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={() => {
            navigation.navigate('ProfileScreen')
          }}
        >
          <View style={[
            styles.profileButton, 
            { 
              backgroundColor: isLocating ? theme.colors.interactive.primary : 'rgba(255, 255, 255, 0.2)'
            }
          ]}>
            <MaterialIcons 
              name="person"
              size={20} 
              color="#fff" 
            />
          </View>
        </TouchableOpacity>
      </View>

      {selectedLocation ? (
        <>
          <MapView
            ref={mapRef}
            style={styles.map}
            provider="google"
            initialRegion={{
              latitude: selectedLocation.latitude,
              longitude: selectedLocation.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            onRegionChange={() => { setMoving(true) }}
            onRegionChangeComplete={handleRegionChangeComplete}
            showsUserLocation={true}
          >
            {moving && (
              <Marker
                coordinate={{
                  latitude: selectedLocation.latitude,
                  longitude: selectedLocation.longitude,
                }}
                title="Selected Location"
                pinColor="#4CAF50" 
              />
            )}

          </MapView>

          <View style={styles.markerFixed}>
            <Image
              source={require('../asset/pin.png')}
              style={{ width: 48, height: 48, resizeMode: 'contain', marginBottom: -6 }}
            />
            {/* <Text style={styles.marker}>📍</Text> */}
          </View>

          <Modal
            isVisible={modalVisible}
            onBackdropPress={() => setModalVisible(false)}
            style={{ justifyContent: 'flex-end', margin: 0 }}
          >
            <View style={styles.bottomSheet}>
              <Text style={styles.sheetTitle}>Set Pickup Location</Text>
              <View style={styles.searchBox}>
                <TextInput
                  value={searchText}
                  onChangeText={handleSearch}
                  placeholder="Search location..."
                  style={styles.inputWithClear}
                />
                {searchText.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{ flex: 1 }}>
                <FlatList
                  data={suggestions}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => selectSuggestion(item)}>
                      <Text style={styles.suggestion}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
              <Text style={styles.coordText}>
                Current Location: {selectedLocation.latitude.toFixed(5)}, {selectedLocation.longitude.toFixed(5)}
              </Text>
            </View>
          </Modal>
        </>
      ) : (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#f37f21" />
          <Text>Fetching location...</Text>
        </View>
      )}

      <CustomSidebarScreen
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        navigation={navigation}
      />
    </View>
  );
};

export default ChooseMap;
