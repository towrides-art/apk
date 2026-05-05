import React, { useEffect, useRef, useState } from "react";
 import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, Text,TextInput,TouchableOpacity,View } from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
  import Toast from '../src/utils/toast';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../src/theme/ThemeProvider';
import api from "./axiosInstance";

export default function OTPScreen({navigation,route }:any ){
    const { theme } = useTheme();
    const {name, phone,callingCode }= route.params;
    const [visible, setVisible] = useState(false);
    const [otp, setOtp] = useState('');
const inputRef = useRef<TextInput>(null);
    const [seconds, setSeconds] = useState(30);
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
    const boxArray = new Array(4).fill(0)
    const handlePress = () => {
    inputRef.current?.focus(); // Safely call focus if ref is set
  }
  const nextPress = async ()=>{
      setSeconds(45);
         
  try {
      const res = await api.post("/send-otp", { mobile: phone });
      console.log("API Response:", res.data);

      navigation.navigate("OTPScreen", {
        name: user_details.name || "",
        phone:user_details.phone,
        callingCode: callingCode || "+91", // fallback if needed
      });
       Toast.show('Verification code sent successfuly');  
    } catch (err: any) {
      console.log("API Error:", err.response?.data || err.message);
      Toast.show("Something went wrong. Please try again."+err);
    }
    }
 const CheckOTP = async () => {
  if (!otp || otp.trim().length != 4) {
    Toast.show("Please enter OTP");
    return;
  }

  try {
    const res = await api.post("/user/verify-otp", {
      phone: user_details.phone,
      name:user_details.name,
      otp:otp
    });

    console.log("OTP Verification Response:", res.data);

    Toast.show("Verification successful!");

    await AsyncStorage.setItem("token", res.data.token);
    await AsyncStorage.setItem("user_token", res.data.token);
    await AsyncStorage.setItem("name", res.data.user.name);

    navigation.reset({ 
      index: 0, 
      routes: [{ name: "EnableLocationScreen", params: { verified_data: res.data } }] 
    });
  } catch (err: any) {
    console.log("ERR VERIFICATION:", err.response?.data || err.message);
    Toast.show(err.response?.data?.message || "OTP verification failed");
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