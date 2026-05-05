import React, { useEffect } from 'react';
import { View, Text, Alert, Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

const GeoTest = () => {
  useEffect(() => {
    const getLocation = async () => {
      try {
        if (Platform.OS === 'android') {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Permission Denied', 'Location permission not granted');
            return;
          }
        }

        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log('Latitude:', latitude, 'Longitude:', longitude);
            Alert.alert('Your Location', `Lat: ${latitude}, Lon: ${longitude}`);
          },
          (error) => {
            console.error(error);
            Alert.alert('Location Error', error.message);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      } catch (err) {
        console.error('Fatal error', err);
        Alert.alert('Crash', err.message);
      }
    };

    getLocation();
  }, []);

  return (
    <View>
      <Text>Using @react-native-community/geolocation</Text>
    </View>
  );
};

export default GeoTest;
