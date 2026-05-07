import React, { useEffect, useRef, useState } from "react";
 import { Alert, KeyboardAvoidingView, Modal, Platform, SafeAreaView, StyleSheet, Text,TextInput,TouchableOpacity,View } from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  import Toast from '../src/utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/theme/ThemeProvider';
import api from "./axiosInstance";
import { sendOTP, confirmOTP, resetConfirmation } from '../src/utils/firebaseAuth';

export default function OTPScreen({navigation,route }:any ){
    const { theme } = useTheme();
    const {name, phone,callingCode, otpLink }= route.params || {};
    const [visible, setVisible] = useState(false);
    const [otp, setOtp] = useState('');
const inputRef = useRef<TextInput>(null);
    const [seconds, setSeconds] = useState(30);
    const [showNameModal, setShowNameModal] = useState(false);
    const [userName, setUserName] = useState('');
    const [verifiedToken, setVerifiedToken] = useState('');
const user_details={
  name:name,
  phone:phone,
  callingCode:callingCode,
}
  useEffect(() => { 
    if (seconds === 0) return; // Stop when it reaches 0

    const interval = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, [seconds]);
  
  // Log OTP link for development
  useEffect(() => {
    if (otpLink) {
      console.log('OTP Link:', otpLink);
      Toast.show('OTP link generated. Check console.');
    }
  }, [otpLink]);
    const boxArray = new Array(4).fill(0)
    const handlePress = () => {
    inputRef.current?.focus(); // Safely call focus if ref is set
  }
  const nextPress = async ()=>{
      setSeconds(45);
         
  try {
      const fullPhone = `${callingCode || '+91'}${phone}`;
      await sendOTP(fullPhone);
      Toast.show('Verification code sent successfully');  
    } catch (err: any) {
      console.log("Firebase Error:", err.message);
      Toast.show("Failed to send OTP. Please try again.");
    }
    }
 const CheckOTP = async () => {
  if (!otp || otp.trim().length != 4) {
    Toast.show("Please enter OTP");
    return;
  }

  try {
    // Verify OTP with backend
    const fullPhone = `${callingCode || '+91'}${phone}`;
    const response = await confirmOTP(fullPhone, otp);
    
    console.log("OTP Verification Response:", response);

    Toast.show("Verification successful!");

    await AsyncStorage.setItem("token", response.token);
    await AsyncStorage.setItem("user_token", response.token);

    const returnedName = response.user?.name;
    if (!returnedName || returnedName === user_details.phone || returnedName === `+91${user_details.phone}`) {
      // User has no name set, show name input modal
      setVerifiedToken(response.token);
      setShowNameModal(true);
    } else {
      await AsyncStorage.setItem("name", returnedName);
      navigation.reset({ 
        index: 0, 
        routes: [{ name: "EnableLocationScreen", params: { verified_data: response } }] 
      });
    }
  } catch (err: any) {
    console.log("ERR VERIFICATION:", err.message);
    Toast.show(err.message || "OTP verification failed");
  }
};

 const saveNameAndProceed = async () => {
  if (!userName.trim()) {
    Toast.show("Please enter your name");
    return;
  }
  try {
    await api.put("/user/profile", { name: userName.trim() });
    await AsyncStorage.setItem("name", userName.trim());
    setShowNameModal(false);
    navigation.reset({ 
      index: 0, 
      routes: [{ name: "EnableLocationScreen" }] 
    });
  } catch (err: any) {
    // Even if profile update fails, proceed with the name
    await AsyncStorage.setItem("name", userName.trim());
    setShowNameModal(false);
    navigation.reset({ 
      index: 0, 
      routes: [{ name: "EnableLocationScreen" }] 
    });
  }
};

    return(
          <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0} 
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        
            <View style={styles.top_box}>
                 <MaterialIcons onPress={()=>navigation.goBack()} name="arrow-back" size={30} color={theme.colors.text.primary} />
                 <View style={{display:"flex",justifyContent:'center',alignItems:'center', marginTop:50 }}>
                    <Text style={{fontSize:28, fontWeight:'bold',marginTop:10, color: theme.colors.text.primary}}>Enter then code</Text>
                    <Text style={{fontSize:18, marginTop:6, textAlign:'center', lineHeight:25, color: theme.colors.text.secondary}}>We have sent you a verification code to {`\n`} +{ callingCode } {phone}</Text>
                </View>
                <TextInput
           style={{opacity: 0,}}
          value={otp}
          ref={inputRef}
          onChangeText={(text) => {
            if (text.length <= 4) setOtp(text);
            // if(text.length == 4 ) CheckOTP();
          }}
          keyboardType="number-pad"
          maxLength={4}
          autoFocus={true}
          
        />
              <TouchableOpacity onPress={() => {
    inputRef.current?.focus();
  }} activeOpacity={1}>

                <View style={styles.dots} >
                {boxArray.map((_, index) => (
            <Text
            key={index}
            style={otp[index] ? styles.dot_af_txt : [styles.dot, { backgroundColor: theme.colors.border.secondary }]}
            >
            {otp[index] ? otp[index] : ''}
            </Text>
            ))}

                </View></TouchableOpacity>

                <View style={{marginTop:50, display:"flex", justifyContent:"center", alignItems:'center'}}>
                   <TouchableOpacity style={{
                             marginTop:13,
                            marginBottom:5,
                            borderColor: theme.colors.interactive.primary,
                            borderWidth:2,
                            
                              width:'100%',
                            padding:13,
                            borderRadius:13,
                             
                           alignItems: 'center',
                          justifyContent:'center',
                          marginInline:16
                        }} 
                        onPress={()=>CheckOTP()} activeOpacity={0.6}>
                         
                                    <Text style={{fontSize:20, color: theme.colors.interactive.primary}}>Verify</Text>
                                </TouchableOpacity>

                    {seconds==0?(
                        <TouchableOpacity style={{
                             marginTop:13,
                            marginBottom:5,
                            backgroundColor: theme.colors.interactive.primary,
                              width:'100%',
                            padding:13,
                            borderRadius:13,
                           alignItems: 'center',
                          justifyContent:'center',
                          marginInline:16
                        }} 
                        onPress={()=>nextPress()} activeOpacity={0.6}>
                         
                                    <Text style={{fontSize:20, color: theme.colors.text.inverse}}>Resend Code</Text>
                                </TouchableOpacity>
                    ):(
                    <Text style={{fontSize:18, color: theme.colors.text.tertiary}} >You can resend code in {seconds} seconds</Text>

                    )}
                </View>
                 
            </View>
           
 
        </SafeAreaView>

        {/* Name Input Modal */}
        <Modal visible={showNameModal} animationType="fade" transparent onRequestClose={() => {}}>
          <View style={{flex:1, backgroundColor:'rgba(0,0,0,0.5)', justifyContent:'center', alignItems:'center'}}>
            <View style={{backgroundColor: theme.colors.background.primary, borderRadius:20, padding:24, width:'85%', alignItems:'center'}}>
              <MaterialIcons name="person" size={40} color={theme.colors.interactive.primary} />
              <Text style={{fontSize:20, fontWeight:'bold', marginTop:12, color: theme.colors.text.primary}}>What's your name?</Text>
              <Text style={{fontSize:14, marginTop:6, color: theme.colors.text.secondary, textAlign:'center'}}>Please enter your name to continue</Text>
              <TextInput
                style={{width:'100%', borderWidth:2, borderColor: theme.colors.border.secondary, borderRadius:12, padding:14, marginTop:20, fontSize:16, color: theme.colors.text.primary}}
                placeholder="Enter your full name"
                placeholderTextColor={theme.colors.text.tertiary}
                value={userName}
                onChangeText={setUserName}
                autoFocus
              />
              <TouchableOpacity
                style={{width:'100%', backgroundColor: theme.colors.interactive.primary, borderRadius:12, padding:14, marginTop:16, alignItems:'center'}}
                onPress={saveNameAndProceed}
              >
                <Text style={{fontSize:16, fontWeight:'bold', color: theme.colors.text.inverse}}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

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