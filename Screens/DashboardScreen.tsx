import React, { use, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text,TextInput,TouchableOpacity,View } from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CountryPicker,{Country} from 'react-native-country-picker-modal';
import Toast from '../src/utils/toast';
import GeoTest from "./Components/GeoTest";
import CustomSidebarScreen from "./Components/Sidebar";
import { useRoute } from "@react-navigation/native";
import ChooseMap from "./Components/ChooseMap";
import ServicesUnderMap from "./Components/ServicesUnderMap";
import CustomSelector from "./Components/CustomSelector";
import ServicesUnderMapNew from "./Components/ServicesUnderMapNew";
import { useTheme } from '../src/theme/ThemeProvider';
import api from "./axiosInstance";
import AsyncStorage from "@react-native-async-storage/async-storage";
 
export default function DashboardScreen({navigation}:any ){
    const { theme } = useTheme();
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [selectedDropLocation, setSelectedDropLocation] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [dropSearchText, setDropSearchText] = useState('');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   const route = useRoute();

const { setIsSidebarOpen: setSidebarFromParams }:any = route.params;

useEffect(() => {
  if (setSidebarFromParams) {
    setIsSidebarOpen(setSidebarFromParams);
  }
}, [setSidebarFromParams]);

useEffect(() => {
  navigation.setOptions({
    // You can now safely set functions here
    onSidebarToggle: () => {
      setIsSidebarOpen((prev: boolean) => !prev);
    }
  });
}, [navigation]);

const [selected_value,set_selected_value]=useState(null);
 const [vehicles, setVehicles] = useState([
    { label: 'Bike/Scooter', value: '1' },
    { label: 'Electric Bike', value: '2' },
    { label: 'Hatchback', value: '3' },
    { label: 'Sedan', value: '4' },
    { label: 'SUV', value: '5' },
    { label: 'Electric Car', value: '6' },
    { label: 'Pickup Truck', value: '7' },
    { label: 'Auto/E-Rickshaw', value: '8' },
    { label: 'Mini Truck', value: '9' },
    { label: 'Bus/School Van', value: '10' },
    { label: 'Tractor/Trolley', value: '11' },
    { label: 'Luxury Car', value: '12' },
    { label: 'JCB/Construction', value: '13' },
   ]);
     const [locationShortName, setLocationShortName] = useState('');
     const [dropLocationShortName, setDropLocationShortName] = useState('');
     const [height, setHeight] = useState(0);
     const [openPickupSearch, setOpenPickupSearch] = useState(false);
const set_fcm = async ()=>{
    try {
      const fcm_token = await AsyncStorage.getItem('fcm_token');
      if (fcm_token) {
        await api.post('/user/set_fcm', {
          fcm_token: fcm_token
        });
      }
    } catch (error) {
      console.log('FCM token set failed (user may not be logged in):', error);
    }
}
useEffect(()=>{
  set_fcm();
},[])
    return(
        
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        
         {/* <TouchableOpacity style={{zIndex:100,position:'absolute', top:5,left:5, backgroundColor:'#fff', padding:10, borderRadius:'50%', elevation:5}} onPress={()=>setIsSidebarOpen(true)} >
            <MaterialIcons name="menu" style={{fontSize:30}}/>
         </TouchableOpacity> */}
         {/* <TouchableOpacity style={{zIndex:100,position:'absolute', bottom:(Dimensions.get('window').height * 0.22 )+10,right:10, backgroundColor: theme.colors.surface.primary, padding:10, borderRadius:'50%', elevation:5}} onPress={()=>navigation.replace('DashboardScreen')} >
            <MaterialIcons name="near-me" style={{fontSize:30, color: theme.colors.text.primary}}/>
         </TouchableOpacity> */}
         <ChooseMap locationShortName={locationShortName} height={height}  setLocationShortName={setLocationShortName} searchText={searchText} setSearchText={setSearchText} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} navigation={navigation} openPickupSearch={openPickupSearch} setOpenPickupSearch={setOpenPickupSearch}/>

        <ServicesUnderMapNew navigation={navigation} height={height} setHeight={setHeight}  searchText={locationShortName} setSearchText={setSearchText}  selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} selectedDropLocation={selectedDropLocation} setSelectedDropLocation={setSelectedDropLocation} dropSearchText={dropLocationShortName} setDropSearchText={setDropLocationShortName} openPickupSearch={() => setOpenPickupSearch(true)} />
       {/* <CustomSelector 
        selected_value={selected_value} 
        set_selected_value={set_selected_value}
        SelectName="Vehicle"
        SelectIcon="directions-car-filled"
        selecties={vehicles}
        /> */}
        
        <CustomSidebarScreen 
          isSidebarOpen={isSidebarOpen} 
          setIsSidebarOpen={setIsSidebarOpen}
          navigation={navigation}
        />
        
        </SafeAreaView>
         
    );
}
const styles = StyleSheet.create({
    container:{
    flex: 1,
    padding: 0,
     
    position:'relative',
    },
     

   
});