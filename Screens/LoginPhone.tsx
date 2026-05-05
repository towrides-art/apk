import React, { useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CountryPicker, { Country } from 'react-native-country-picker-modal';
import Toast from '../src/utils/toast';
import { useTheme } from '../src/theme/ThemeProvider';
import { StyledText, StyledButton, StyledView, Spacer } from '../src/components/styled';
import { dimensions } from '../src/theme/dimensions';
import api from './axiosInstance'
export default function LoginPhone({ navigation }: any) {
  const { theme } = useTheme();
  const [countryCode, setCountryCode] = useState('IN' as any);
  const [callingCode, setCallingCode] = useState('91');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(false);
  
const nextPress = async () => {
  if (/^\d{10}$/.test(phone)) {  // ensures exactly 10 digits
    try {
      const res = await api.post("/user/send-otp", { phone: phone });
      console.log("API Response:", res.data);

      navigation.navigate("OTPScreen", {
        name: name || "",
        phone,
        callingCode: callingCode || "+91", // fallback if needed
      });
    } catch (err: any) {
      console.log("API Error:", err.response?.data || err.message);
      Toast.show("Something went wrong. Please try again."+err);
    }
  } else {
    Toast.show("Mobile number must be exactly 10 digits");
  }
};

  
  const nextPress2 = () => {
    Toast.show('Please click Next to proceed')
  }
  
  const getInputRowStyle = () => ({
    ...styles.inputRow,
    borderColor: theme.colors.border.primary,
    backgroundColor: theme.colors.surface.secondary,
  });
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.colors.background.primary }]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? dimensions.spacing.xl4 : 0}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        <StyledView style={styles.top_box}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialIcons 
              name="arrow-back" 
              size={dimensions.components.icon.large} 
              color={theme.colors.text.primary} 
            />
          </TouchableOpacity>
          
          <StyledText 
            variant="h1" 
            color="primary" 
            style={styles.title}
          >
            Join us via phone number
          </StyledText>
          
          <StyledText 
            variant="body" 
            color="secondary" 
            style={styles.subtitle}
          >
            We'll text a code to verify your phone
          </StyledText>

          <StyledView style={getInputRowStyle()}>
            <TouchableOpacity onPress={() => setVisible(true)}>
              <MaterialIcons 
                name="person" 
                size={dimensions.components.icon.large}
                color={theme.colors.text.secondary}
              />
            </TouchableOpacity>

            <TextInput
              style={[styles.textInput, { 
                color: theme.colors.text.primary,
                fontSize: dimensions.typography.fontSize.lg,
              }]}
              keyboardType="default"
              placeholder="Enter Your Name"
              placeholderTextColor={theme.colors.text.tertiary}
              onChangeText={(text) => setName(text)}
              autoFocus={true}
              value={name}
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
            />
          </StyledView>
          
          <StyledView style={getInputRowStyle()}>
            <TouchableOpacity onPress={() => setVisible(true)}>
              <CountryPicker
                countryCode={countryCode}
                withFlag
                withCallingCode
                withFilter
                withCallingCodeButton
                visible={visible}
                onSelect={(country) => {
                  setCountryCode(country.cca2);
                  setCallingCode(country.callingCode[0]);
                  setVisible(false);
                }}
                onClose={() => setVisible(false)}
              />
            </TouchableOpacity>

            <TextInput
              style={[styles.textInput, { 
                color: theme.colors.text.primary,
                fontSize: dimensions.typography.fontSize.lg,
              }]}
              keyboardType="phone-pad"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              onChangeText={(text) => { 
                if (text.length < 11) { 
                  setPhone(text) 
                } 
                if (text.length == 10) { 
                  // nextPress2() 
                } 
              }}
              placeholder="Mobile Number"
              placeholderTextColor={theme.colors.text.tertiary}
              value={phone}
            />
          </StyledView>
        </StyledView>
        
        <StyledButton
          variant="primary"
          size="large"
          onPress={nextPress}
          style={styles.nextButton}
        >
          <StyledText variant="button" color="inverse" weight="medium">
            Next
          </StyledText>
        </StyledButton>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    paddingTop: dimensions.spacing.sm4, // 16px
    display: 'flex',
    justifyContent: 'space-between',
    paddingBottom: dimensions.spacing.sm, // 10px
  },
  top_box: {
    paddingHorizontal: dimensions.spacing.sm4, // 16px
  },
  title: {
    marginTop: dimensions.spacing.sm, // 10px
    marginBottom: dimensions.spacing.xs3, // 8px
  },
  subtitle: {
    marginBottom: dimensions.spacing.lg4, // 32px
  },
  inputRow: {
    marginTop: dimensions.spacing.lg2, // 28px
    flexDirection: 'row',
    borderWidth: 2,
    borderRadius: dimensions.layout.borderRadius.md, // 12px
    alignItems: 'center',
    height: dimensions.components.input.height, // 48px
    paddingHorizontal: dimensions.spacing.sm, // 10px
  },
  textInput: {
    fontWeight: '500',
    flex: 1,
    paddingVertical: dimensions.spacing.sm, // 10px
    paddingHorizontal: dimensions.spacing.sm3, // 14px
  },
  nextButton: {
    marginHorizontal: dimensions.spacing.sm4, // 16px
    marginBottom: dimensions.spacing.lg2, // 28px
  },
});