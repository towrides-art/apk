import React, { useEffect } from 'react';
import { View, Image, SafeAreaView, StyleSheet, Linking, Text } from 'react-native';
import { useTheme } from '../src/theme/ThemeProvider';
import { StyledText, StyledButton, StyledView, Spacer } from '../src/components/styled';
import { dimensions } from '../src/theme/dimensions';
import LoginSlider from './LoginSlider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PreLoginScreen({ navigation }: any) {
  const { theme } = useTheme();
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          navigation.reset({
            index: 0,
            routes: [{ name: "DashboardScreen" }],
          });
        } else {
          navigation.replace("LoginPhone");
        }
            } catch (error) {
        console.log("Error checking token:", error);
            }
          };

          checkToken();
        }, [navigation]);
        
        // Only show full-screen image with a single continue button overlayed at the bottom
        return (
          <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
            <Image
        source={require('./asset/pre_login.jpeg')}
        style={styles.full_image}
        resizeMode="cover"
        accessibilityLabel="App logo"
            />

            <StyledView style={styles.button_container}>
        <StyledButton
          variant="primary"
          size="large"
          onPress={() => navigation.navigate('LoginPhone')}
          style={styles.continue_with_phone}
        >
          Continue With Phone
        </StyledButton>
        <Text style={{padding:10}}>By clicking continue button you agree with our terms and conditions.</Text>
            </StyledView>
          </SafeAreaView>
        );
      }

      const styles = StyleSheet.create({
        container: {
          flex: 1,
        },
        // image covers entire screen
        full_image: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
        },
        // overlay container for the single button at the bottom
        button_container: {
          position: 'absolute',
          left: 0,
        bottom:0,
          alignItems: 'center',
          borderRadius:"20 20 0 0",
          borderTopLeftRadius:20,
          borderTopRightRadius:20,
          padding:20
        },
        continue_with_phone: {
          width: '100%',
          fontSize:30
        },

        // kept for compatibility if needed elsewhere
        link: {
          textDecorationLine: 'underline',
        },
        continue_with_google: {
          marginBottom: dimensions.spacing.sm4,
        },
        google_button_content: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: dimensions.spacing.sm,
        },
        google_img: {
          height: dimensions.components.icon.large,
          width: dimensions.components.icon.large,
        },
        terms_text: {
          textAlign: 'center',
          paddingHorizontal: dimensions.spacing.sm,
          paddingBottom: dimensions.spacing.sm,
        },
      });
