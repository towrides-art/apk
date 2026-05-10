import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, G, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../src/theme/ThemeProvider';
import { StyledText } from '../src/components/styled';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Animated Splash Screen Component
const AnimatedSplashScreen: React.FC = () => {
  const { theme, isDark } = useTheme();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const vehicleAnim = useRef(new Animated.Value(-100)).current; // Start off-screen
  const wheelRotateAnim = useRef(new Animated.Value(0)).current;
  const roadAnim = useRef(new Animated.Value(0)).current;
  
  // Start animations
  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Scale animation
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Slide up animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Vehicle movement animation - runs across screen
    Animated.timing(vehicleAnim, {
      toValue: SCREEN_WIDTH + 100, // Move to right edge
      duration: 3000,
      useNativeDriver: true,
    }).start();

    // Wheel rotation animation
    Animated.loop(
      Animated.timing(wheelRotateAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ).start();

    // Road movement animation
    Animated.loop(
      Animated.timing(roadAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Progress animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2500,
      useNativeDriver: false,
    }).start();
  }, []);

  // Custom SVG Vehicle Component
  const TowRidesVehicle = () => (
    <Svg width={80} height={40} viewBox="0 0 80 40">
      <Defs>
        <LinearGradient id="vehicleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={theme.colors.interactive.primary} />
          <Stop offset="50%" stopColor={theme.colors.interactive.warning} />
          <Stop offset="100%" stopColor={theme.colors.interactive.secondary} />
        </LinearGradient>
        <LinearGradient id="wheelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={theme.colors.surface.primary} />
          <Stop offset="100%" stopColor={theme.colors.surface.secondary} />
        </LinearGradient>
      </Defs>
      
      {/* Main Truck Body */}
      <G transform="translate(5, 10)">
        {/* Truck Cab */}
        <Rect
          x="0"
          y="5"
          width="20"
          height="15"
          rx="2"
          fill="url(#vehicleGradient)"
        />
        
        {/* Truck Trailer */}
        <Rect
          x="20"
          y="8"
          width="30"
          height="12"
          rx="1"
          fill="url(#vehicleGradient)"
        />
        
        {/* Wheels */}
        <Circle
          cx="8"
          cy="25"
          r="4"
          fill="url(#wheelGradient)"
          stroke={theme.colors.interactive.primary}
          strokeWidth="1"
        />
        <Circle
          cx="35"
          cy="25"
          r="4"
          fill="url(#wheelGradient)"
          stroke={theme.colors.interactive.primary}
          strokeWidth="1"
        />
        
        {/* Windshield */}
        <Rect
          x="2"
          y="7"
          width="6"
          height="6"
          rx="1"
          fill={theme.colors.background.primary}
          opacity={0.8}
        />
        
        {/* Tow Hook */}
        <Rect
          x="-3"
          y="12"
          width="6"
          height="2"
          rx="1"
          fill={theme.colors.interactive.primary}
        />
        
        {/* Tow Chain */}
        <Path
          d="M -3 13 Q 0 16 3 13 Q 6 16 9 13"
          stroke={theme.colors.interactive.primary}
          strokeWidth="1"
          fill="none"
        />
        
        {/* Headlights */}
        <Circle cx="0" cy="8" r="1.5" fill={theme.colors.interactive.warning} />
        <Circle cx="0" cy="12" r="1.5" fill={theme.colors.interactive.warning} />
      </G>
    </Svg>
  );

  // Road Lines Component
  const RoadLines = () => (
    <Svg width={SCREEN_WIDTH} height={20} viewBox={`0 0 ${SCREEN_WIDTH} 20`}>
      <Defs>
        <LinearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={theme.colors.interactive.primary} />
          <Stop offset="50%" stopColor={theme.colors.interactive.secondary} />
          <Stop offset="100%" stopColor={theme.colors.interactive.primary} />
        </LinearGradient>
      </Defs>
      
      {/* Road Lines */}
      <G>
        <Rect x="0" y="8" width="40" height="2" rx="1" fill="url(#roadGradient)" opacity={0.6} />
        <Rect x="60" y="8" width="40" height="2" rx="1" fill="url(#roadGradient)" opacity={0.6} />
        <Rect x="120" y="8" width="40" height="2" rx="1" fill="url(#roadGradient)" opacity={0.6} />
        <Rect x="180" y="8" width="40" height="2" rx="1" fill="url(#roadGradient)" opacity={0.6} />
        <Rect x="240" y="8" width="40" height="2" rx="1" fill="url(#roadGradient)" opacity={0.6} />
        <Rect x="300" y="8" width="40" height="2" rx="1" fill="url(#roadGradient)" opacity={0.6} />
      </G>
    </Svg>
  );

  // Loading Dots Component
  const LoadingDots = () => (
    <View style={styles.loadingDotsContainer}>
      {[0, 1, 2].map((index) => (
        <Animated.View
          key={index}
          style={[
            styles.loadingDot,
            {
              backgroundColor: theme.colors.interactive.primary,
              transform: [{
                scale: pulseAnim.interpolate({
                  inputRange: [1, 1.1],
                  outputRange: [1, 1.2],
                }),
              }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.1],
                outputRange: [0.6, 1],
              }),
            }
          ]}
        />
      ))}
    </View>
  );

  // Progress Bar Component
  const ProgressBar = () => (
    <View style={[styles.progressContainer, { backgroundColor: theme.colors.surface.secondary }]}>
      <Animated.View
        style={[
          styles.progressBar,
          {
            backgroundColor: theme.colors.interactive.primary,
            width: progressAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }),
          }
        ]}
      />
    </View>
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background.primary }]}>
        {/* Background Gradient */}
        <View style={[styles.backgroundGradient, { backgroundColor: theme.colors.background.secondary }]} />
        
        {/* Road Lines */}
        <Animated.View
          style={[
            styles.roadContainer,
            {
              transform: [{
                translateX: roadAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -100],
                }),
              }],
            },
          ]}
        >
          <RoadLines />
        </Animated.View>

        {/* Moving Vehicle */}
        <Animated.View
          style={[
            styles.vehicleContainer,
            {
              transform: [{ translateX: vehicleAnim }],
            },
          ]}
        >
          <TowRidesVehicle />
        </Animated.View>

        {/* App Title */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <StyledText variant="h1" color="primary" weight="bold" style={styles.appTitle}>
            TowRides
          </StyledText>
          <StyledText variant="body" color="secondary" style={styles.appSubtitle}>
            Your Reliable Towing Service
          </StyledText>
        </Animated.View>

        {/* Loading Section */}
        <Animated.View
          style={[
            styles.loadingContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <LoadingDots />
          <StyledText variant="body" color="secondary" style={styles.loadingText}>
            Initializing your experience...
          </StyledText>
          <ProgressBar />
        </Animated.View>

        {/* Floating Elements */}
        <Animated.View
          style={[
            styles.floatingElement1,
            {
              transform: [
                {
                  translateY: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0, -10],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.floatingCircle, { backgroundColor: theme.colors.interactive.primary }]} />
        </Animated.View>

        <Animated.View
          style={[
            styles.floatingElement2,
            {
              transform: [
                {
                  translateY: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0, 15],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.floatingCircle, { backgroundColor: theme.colors.interactive.secondary }]} />
        </Animated.View>

        {/* Additional floating elements */}
        <Animated.View
          style={[
            styles.floatingElement3,
            {
              transform: [
                {
                  translateY: pulseAnim.interpolate({
                    inputRange: [1, 1.1],
                    outputRange: [0, -8],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.floatingCircle, { backgroundColor: theme.colors.interactive.warning }]} />
        </Animated.View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  roadContainer: {
    position: 'absolute',
    bottom: '30%',
    left: 0,
    right: 0,
  },
  vehicleContainer: {
    position: 'absolute',
    bottom: '28%',
    left: 0,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 50,
    zIndex: 10,
  },
  appTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  appSubtitle: {
    fontSize: 18,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    width: '80%',
    zIndex: 10,
  },
  loadingDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressContainer: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  floatingElement1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    width: 20,
    height: 20,
  },
  floatingElement2: {
    position: 'absolute',
    bottom: '25%',
    right: '15%',
    width: 16,
    height: 16,
  },
  floatingElement3: {
    position: 'absolute',
    top: '60%',
    right: '20%',
    width: 14,
    height: 14,
  },
  floatingCircle: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    opacity: 0.6,
  },
});

export default AnimatedSplashScreen;
