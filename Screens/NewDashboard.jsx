import React, { useEffect, useRef, useState } from "react";
import { Alert, Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
import Toast from '../src/utils/toast';
import GeoTest from "./Components/GeoTest";
import CustomSidebarScreen from "./Components/Sidebar";
import { useRoute } from "@react-navigation/native";
import ChooseMap from "./Components/ChooseMap";
import ServicesUnderMap from "./Components/ServicesUnderMap";
import { useTheme } from '../src/theme/ThemeProvider';

export default function NewDashboard({ navigation }) {
  const { theme } = useTheme();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const route = useRoute();

  const { setIsSidebarOpen: setSidebarFromParams } = route.params || {};

  useEffect(() => {
    if (setSidebarFromParams) {
      setIsSidebarOpen(setSidebarFromParams);
    }
  }, [setSidebarFromParams]);

  useEffect(() => {
    navigation.setOptions({
      // You can now safely set functions here
      onSidebarToggle: () => {
        setIsSidebarOpen((prev) => !prev);
      }
    });
  }, [navigation]);
  return (

    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>

      <TouchableOpacity style={[styles.menuButton, { backgroundColor: theme.colors.surface.primary }]} onPress={() => setIsSidebarOpen(true)} >
        <MaterialIcons name="menu" style={{ fontSize: 30, color: theme.colors.text.primary }} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.nearMeButton, { backgroundColor: theme.colors.surface.primary }]} onPress={() => navigation.replace('DashboardScreen')} >
        <MaterialIcons name="near-me" style={{ fontSize: 30, color: theme.colors.text.primary }} />
      </TouchableOpacity>
      <ChooseMap searchText={searchText} setSearchText={setSearchText} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} navigation={navigation} />

      <ServicesUnderMap navigation={navigation} searchText={searchText} selectedLocation={selectedLocation} />

      <CustomSidebarScreen
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        navigation={navigation}
      />
    </SafeAreaView>

  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    position: 'relative',
  },
  menuButton: {
    zIndex: 100,
    position: 'absolute',
    top: 5,
    left: 5,
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  nearMeButton: {
    zIndex: 100,
    position: 'absolute',
    bottom: (Dimensions.get('window').height * 0.22) + 10,
    right: 10,
    padding: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
});