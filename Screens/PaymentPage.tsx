import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert } from 'react-native';
import { WebView, type WebViewNavigation } from 'react-native-webview';
import api from './axiosInstance';
import Toast from '../src/utils/toast';

export default function PaymentScreen({ route, navigation }: { route: any; navigation: any }) {
  const {
    amount,
          booking,
   } = route.params;
   const bookingData = booking
  const [paymentLink, setPaymentLink] = useState(null);
 const [isRequestGone,setIsRequestGone] = useState(false);
  useEffect(() => {
    const createOrder = async () => {
      try {
        const res = await api.post('/create-order', {
          amount:amount,

        });
        console.log(bookingData)
        console.log(res)
        setPaymentLink(res.data.payment_link);
      } catch (error) {
        console.error('Error creating order:', error);
        // console.log(error.message)
        Alert.alert('Error', 'Unable to create payment link. Please try again.');
      }
    };

    createOrder();
  }, []);

  if (!paymentLink) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  const handleNavigationChange = async(navState: WebViewNavigation) => {
    const { url } = navState;
    if (url.includes('payment-success')) {
    //   navigation.replace('PaymentSuccess'); // Optional navigation
    //    Payment Book System
      console.log('✅ Payment success detected');

    if(!isRequestGone){
      console.log('🚀 Calling API now');
try{
const red = await api.post('/user/rides/paymentPaid', {
  booking_id: bookingData.id,
  amount: amount 
});
console.log(red)
 const response = await api.post('/user/rides/rideStatus', {
  booking_id:bookingData.id
 });
      const booking2= response.data;
  Alert.alert('Success', 'Payment Successful2!');
    
   
      setIsRequestGone(true);
      // Toast.show('Ride booked successfully! PIN: ' + booking.pin, Toast.LONG);
      
      // Close modal
       
      // Navigate to booking status or searching provider screen
      // befopr going SearchingProvider
        

      setTimeout(() => {
    navigation.replace('TrackingScreen', {
            bookingId:booking2.details.id,
            booking: booking2.details,
            driver: booking2.driver
             
          });
      }, 300);
}catch(error){
  console.error(error)
}
          
  
 
    
    }
    // Book System end
    } else if (url.includes('payment-failed')) {
      Alert.alert('Failed', 'Payment Failed. Please try again.');
      navigation.goBack();
    }
  };

  return (
    <WebView
      source={{ uri: paymentLink }}
      onNavigationStateChange={handleNavigationChange}
      startInLoadingState
      renderLoading={() => (
        <ActivityIndicator size="large" color="#000" style={{ flex: 1 }} />
      )}
    />
  );
}
