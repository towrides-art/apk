import React, { useEffect, useRef, useState } from "react";
 import { Alert,Image, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text,TextInput,TouchableOpacity,View } from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  import Toast from '../src/utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
 import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import Geolocation from 'react-native-geolocation-service';
import { useTheme } from '../src/theme/ThemeProvider';

export default function LocationErrorPage({navigation,route }:any ){
   const { theme } = useTheme();
   const {message }= route.params;
      const requestLocation = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    try {
      const result = await request(permission);

      if (result === RESULTS.GRANTED) {
                    navigation.navigate('DashboardScreen');

      } else {
        Alert.alert('Permission Denied', 'Location permission was not granted');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    }
  };
   useEffect(() => {
    const checkLocationPermission = async () => {
      const permission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
          : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

      try {
        const result = await check(permission);
        console.log('Permission status:', result);
 
          if(result == RESULTS.GRANTED) {
           // Alert.alert('Granted', 'Location permission is granted.');
             
          }
      } catch (error) {
        console.error('Error checking location permission:', error);
        Alert.alert('Error', 'Failed to check location permission.');
      }
    };

    checkLocationPermission();
  }, []); // Runs only once on mount


    return(
          <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} 
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
               
            <View style={styles.top_box}>
                  <View style={{display:"flex",justifyContent:'center',alignItems:'center', marginTop:50 }}>
                <Image style={{width:250, height:250, marginBottom:20}} source={require('./asset/location.jpeg')}/>
                    <Text style={{fontSize:26, fontWeight:'bold',marginTop:10, color: theme.colors.text.primary}}>Error on Location Fetch</Text>
                    <Text style={{fontSize:16, marginTop:6, textAlign:'center', lineHeight:25, color: theme.colors.text.secondary}}>
                       
                       Error while accessing your location. Please try turning device location on and then try again {`\n`} {message}
                        </Text>
                </View>
                 
              
                      
                </View>
                   <TouchableOpacity style={{
                             marginTop:103,
                            
                            backgroundColor: theme.colors.interactive.primary,
                              
                            padding:13,
                            borderRadius:13,
                           alignItems: 'center',
                          justifyContent:'center',
                          marginInline:16
                        }}   onPress={requestLocation} 
                       activeOpacity={0.6}>
                         
                                    <Text style={{fontSize:20, color: theme.colors.text.inverse}}>Try Again</Text>
                                </TouchableOpacity>
                    
           
           
 
        </SafeAreaView>
        </KeyboardAvoidingView>
    );
}
const styles = StyleSheet.create({
    container:{
    flex: 1,
    padding: 0,
    paddingTop:16,
    display:'flex',
    justifyContent:'space-between',
    paddingBottom:10,
    },
    top_box:{
        paddingInline:16
    },
    dots:{
display:'flex',
flexDirection:'row',
justifyContent:'center',
alignItems:'center',
gap:30,
marginTop:40
    }
   ,
   dot_af_txt:{
    fontSize:40,
    lineHeight:40,
     fontWeight:'bold'
   }
   ,
   dot:{
    height:20,
    width:17,
    borderRadius:13,
    
    marginTop:10,
    marginBottom:10,
    marginInline:3
   }
});