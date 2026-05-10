import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
  ScrollView,
  PanResponder,
  Image,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../src/theme/ThemeProvider';
import { StyledText, StyledButton, StyledView, Spacer } from '../../src/components/styled';
import { dimensions } from '../../src/theme/dimensions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SIDEBAR_WIDTH = SCREEN_WIDTH * 0.85;

// Types
interface MenuItem {
  id: string;
  title: string;
  icon: string;
  screen: string;
  color: string;
  bgColor: string;
  badge?: number;
  isNew?: boolean;
  isPremium?: boolean;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  rating?: number;
  totalRides?: number;
}

// Menu items configuration
const MENU_ITEMS: MenuItem[] = [
  {
    id: 'history',
    title: 'Ride History',
    icon: 'history',
    screen: 'RideHistoryScreen',
    color: '#FF6B35',
    bgColor: '#FFF3E0',
    badge: 3,
  },
  {
    id: 'invoice',
    title: 'Invoices & Trips',
    icon: 'receipt',
    screen: 'InvoiceScreen',
    color: '#4ECDC4',
    bgColor: '#E0F2F1',
  },
  {
    id: 'feedback',
    title: 'Service Feedback',
    icon: 'rate-review',
    screen: 'FeedbackScreen',
    color: '#45B7D1',
    bgColor: '#E3F2FD',
  },{
    id: 'profile',
    title: 'Profile',
    icon: 'person',
    screen: 'ProfileScreen',
    color: '#45B7D1',
    bgColor: '#E3F2FD',
  },
  
{
    id: 'support',
    title: 'Service Support',
    icon: 'warning',
    screen: 'Support',
    color: '#45B7D1',
    bgColor: '#E3F2FD',
  },
  
  // {
  //   id: 'wallet',
  //   title: 'Wallet',
  //   icon: 'account-balance-wallet',
  //   screen: 'WalletScreen',
  //   color: '#96CEB4',
  //   bgColor: '#E8F5E8',
  //   isNew: true,
  // },
  // {
  //   id: 'promotions',
  //   title: 'Promotions',
  //   icon: 'local-offer',
  //   screen: 'PromotionsScreen',
  //   color: '#FFB74D',
  //   bgColor: '#FFF8E1',
  //   badge: 5,
  // },
  // {
  //   id: 'help',
  //   title: 'Help & Support',
  //   icon: 'help',
  //   screen: 'HelpScreen',
  //   color: '#f37f21',
  //   bgColor: '#FFF3E0',
  // },
  // {
  //   id: 'settings',
  //   title: 'Settings',
  //   icon: 'settings',
  //   screen: 'SettingsScreen',
  //   color: '#9E9E9E',
  //   bgColor: '#F5F5F5',
  // },
  // {
  //   id: 'premium',
  //   title: 'TowRide Premium',
  //   icon: 'star',
  //   screen: 'PremiumScreen',
  //   color: '#FFD700',
  //   bgColor: '#FFFDE7',
  //   isPremium: true,
  // },
];

// Main Component
interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  navigation: any;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
  navigation,
}) => {
  const { theme, isDark, toggleTheme } = useTheme();
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'User',
    email: 'user@example.com',
    phone: '+91 98765 43210',
    rating: 4.8,
    totalRides: 24,
  });

  // Animation values
  const slideAnim = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const menuItemAnims = useRef(
    MENU_ITEMS.map(() => new Animated.Value(0))
  ).current;

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 100;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dx < 0) {
        // Swipe left to close
        slideAnim.setValue(gestureState.dx);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dx < -50) {
        // Close sidebar
        closeSidebar();
      } else {
        // Snap back to open position
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userData = await AsyncStorage.getItem('user_details');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUserProfile(prev => ({
            ...prev,
            name: parsed.name || prev.name,
            phone: parsed.phone || prev.phone,
          }));
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    loadUserProfile();
  }, []);

  // Animate sidebar open/close
  useEffect(() => {
    if (isSidebarOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();

      // Animate menu items with stagger
      menuItemAnims.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: 1,
          duration: 200,
          delay: index * 50,
          useNativeDriver: true,
        }).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SIDEBAR_WIDTH,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset menu item animations
      menuItemAnims.forEach(anim => {
        anim.setValue(0);
      });
    }
  }, [isSidebarOpen, slideAnim, fadeAnim, scaleAnim, menuItemAnims]);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, [setIsSidebarOpen]);

  const handleNavigation = useCallback((screenName: string) => {
    closeSidebar();
    navigation?.navigate(screenName);
  }, [navigation, closeSidebar]);

  const handleProfilePress = useCallback(() => {
    closeSidebar();
    navigation?.navigate('ProfileScreen');
  }, [navigation, closeSidebar]);

  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem('user_details');
              await AsyncStorage.removeItem('token');
              navigation?.reset({
                index: 0,
                routes: [{ name: 'PreLogin' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
            }
          },
        },
      ]
    );
  }, [navigation]);

  const renderMenuItem = (item: MenuItem, index: number) => {
    const animValue = menuItemAnims[index];

    return (
      <Animated.View
        key={item.id}
        style={[
          styles.menuItemContainer,
          {
            opacity: animValue,
            transform: [
              {
                translateX: animValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.menuItem,
            { borderBottomColor: theme.colors.border.secondary },
          ]}
          onPress={() => handleNavigation(item.screen)}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemContent}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: item.bgColor },
              ]}
            >
              <MaterialIcons
                name={item.icon as any}
                size={20}
                color={item.color}
              />
              {item.badge && (
                <View style={[styles.badge, { backgroundColor: theme.colors.interactive.error }]}>
                  <StyledText variant="caption" color="inverse" style={styles.badgeText}>
                    {item.badge}
                  </StyledText>
                </View>
              )}
              {item.isNew && (
                <View style={[styles.newBadge, { backgroundColor: theme.colors.interactive.primary }]}>
                  <StyledText variant="caption" color="inverse" style={styles.newBadgeText}>
                    NEW
                  </StyledText>
                </View>
              )}
            </View>
            <View style={styles.menuItemTextContainer}>
              <StyledText variant="body" color="primary" style={styles.menuItemText}>
                {item.title}
              </StyledText>
              {item.isPremium && (
                <View style={styles.premiumIndicator}>
                  <MaterialIcons name="star" size={12} color="#FFD700" />
                </View>
              )}
            </View>
          </View>
          <MaterialIcons
            name="chevron-right"
            size={16}
            color={theme.colors.text.tertiary}
          />
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          {
            backgroundColor: theme.colors.surface.primary,
            transform: [{ translateX: slideAnim }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <ScrollView
          style={styles.sidebarContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Header Section */}
          <View style={[styles.headerSection, { backgroundColor: theme.colors.interactive.primary }]}>
            <View style={styles.headerContent}>
              <View style={styles.headerTitleContainer}>
                <StyledText variant="h1" color="inverse" style={styles.headerTitle}>
                  TowRide
                </StyledText>
                <StyledText variant="caption" color="inverse" style={styles.headerSubtitle}>
                  Professional Towing Services
                </StyledText>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeSidebar}
                activeOpacity={0.7}
              >
                <MaterialIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          {/* User Profile Section */}
          {/* <TouchableOpacity
            style={[styles.userSection, { backgroundColor: theme.colors.surface.secondary }]}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <View style={styles.userInfo}>
              <View style={[styles.userAvatar, { backgroundColor: theme.colors.interactive.primary }]}>
                {userProfile.avatar ? (
                  <Image source={{ uri: userProfile.avatar }} style={styles.avatarImage} />
                ) : (
                  <MaterialIcons name="person" size={32} color="white" />
                )}
              </View>
              <View style={styles.userDetails}>
                <StyledText variant="h3" color="primary" style={styles.userName}>
                  {userProfile.name}
                </StyledText>
                <StyledText variant="body" color="secondary" style={styles.userEmail}>
                  {userProfile.email}
                </StyledText>
                <View style={styles.userStats}>
                  <View style={styles.statItem}>
                    <MaterialIcons name="star" size={16} color={theme.colors.interactive.warning} />
                    <StyledText variant="caption" color="secondary" style={styles.statText}>
                      {userProfile.rating}
                    </StyledText>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialIcons name="directions-car" size={16} color={theme.colors.text.secondary} />
                    <StyledText variant="caption" color="secondary" style={styles.statText}>
                      {userProfile.totalRides} rides
                    </StyledText>
                  </View>
                </View>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.tertiary} />
          </TouchableOpacity> */}

          {/* Menu Section */}
          <View style={styles.menuSection}>
            {/* <StyledText variant="h4" color="primary" weight="bold" style={styles.menuTitle}>
              Services
            </StyledText> */}
            {MENU_ITEMS.slice(0, 5).map((item, index) => renderMenuItem(item, index))}

            {/* <Spacer size="lg"  /> */}
         
            {/* <StyledText variant="h4" color="primary" weight="bold" style={styles.menuTitle}>
              Account
            </StyledText>
            {MENU_ITEMS.slice(4, 6).map((item, index) => renderMenuItem(item, index + 4))}

            <Spacer size="lg" />

            <StyledText variant="h4" color="primary" weight="bold" style={styles.menuTitle}>
              Support
            </StyledText>
            {MENU_ITEMS.slice(6).map((item, index) => renderMenuItem(item, index + 6))} */}
          </View>

          {/* Theme Toggle */}
          {/* <View style={[styles.themeSection, { backgroundColor: theme.colors.surface.secondary }]}>
            <View style={styles.themeContent}>
              <MaterialIcons
                name={isDark ? 'dark-mode' : 'light-mode'}
                size={20}
                color={theme.colors.text.primary}
              />
              <StyledText variant="body" color="primary" style={styles.themeText}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </StyledText>
            </View>
            <TouchableOpacity
              style={[
                styles.themeToggle,
                { backgroundColor: theme.colors.interactive.primary },
              ]}
              onPress={handleThemeToggle}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.themeToggleThumb,
                  {
                    backgroundColor: 'white',
                    transform: [{ translateX: isDark ? 20 : 0 }],
                  },
                ]}
              />
            </TouchableOpacity>
          </View> */}

          {/* Logout Button */}
          <View style={styles.logoutSection}>
            <StyledButton
              variant="outline"
              size="large"
              onPress={handleLogout}
              style={[styles.logoutButton, { borderColor: theme.colors.interactive.error }]}
            >
              <MaterialIcons name="logout" size={18} color={theme.colors.interactive.error} />
              <StyledText variant="button" color="error" weight="medium" style={styles.logoutText}>
                Logout
              </StyledText>
            </StyledButton>
          </View>

          {/* App Version */}
          <View style={styles.versionSection}>
            <StyledText variant="caption" color="tertiary" style={styles.versionText}>
              TowRide v1.0.0
            </StyledText>
            <StyledText variant="caption" color="tertiary" style={styles.versionText}>
              © 2024 TowRide. All rights reserved.
            </StyledText>
          </View>
        </ScrollView>
      </Animated.View>

      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
            display: isSidebarOpen ? 'flex' : 'none',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          onPress={closeSidebar}
          activeOpacity={1}
        />
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SIDEBAR_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  sidebarContent: {
    flex: 1,
  },
  headerSection: {
    paddingTop: Platform.OS === 'ios' ? 50 : 35,
    paddingHorizontal: dimensions.spacing.md4,
    paddingBottom: dimensions.spacing.md4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: dimensions.spacing.xs3,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md4,
    paddingVertical: dimensions.spacing.md4,
    marginHorizontal: dimensions.spacing.md4,
    marginBottom: dimensions.spacing.md4,
    borderRadius: dimensions.layout.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: dimensions.spacing.sm4,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    marginBottom: dimensions.spacing.xs3,
    fontWeight: 'bold',
    fontSize: 16,
  },
  userEmail: {
    marginBottom: dimensions.spacing.sm3,
    fontSize: 14,
  },
  userStats: {
    flexDirection: 'row',
    gap: dimensions.spacing.md4,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: dimensions.spacing.xs3,
    fontSize: 12,
  },
  menuSection: {
    paddingHorizontal: dimensions.spacing.md4,
    marginBottom: dimensions.spacing.md4,
  },
  menuTitle: {
    marginTop: dimensions.spacing.xs,
    marginBottom: dimensions.spacing.xs,
    fontSize: 14,
    fontWeight: 'bold',
  },
  menuItemContainer: {
    marginBottom: dimensions.spacing.xs,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: dimensions.spacing.sm3,
    paddingHorizontal: dimensions.spacing.sm4,
    borderRadius: dimensions.layout.borderRadius.md,
    marginBottom: dimensions.spacing.xs3,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: dimensions.spacing.sm4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  newBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
  },
  menuItemTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontWeight: '500',
    fontSize: 14,
  },
  premiumIndicator: {
    marginLeft: dimensions.spacing.xs3,
  },
  themeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: dimensions.spacing.md4,
    paddingVertical: dimensions.spacing.sm4,
    marginHorizontal: dimensions.spacing.md4,
    marginBottom: dimensions.spacing.md4,
    borderRadius: dimensions.layout.borderRadius.lg,
  },
  themeContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeText: {
    marginLeft: dimensions.spacing.sm3,
    fontWeight: '500',
    fontSize: 14,
  },
  themeToggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  themeToggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutSection: {
    marginTop:200
,
    paddingHorizontal: dimensions.spacing.md4,
    marginBottom: dimensions.spacing.md4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingVertical: dimensions.spacing.sm3,
    paddingHorizontal: dimensions.spacing.md4,
    borderRadius: dimensions.layout.borderRadius.md,
  },
  logoutText: {
    marginLeft: dimensions.spacing.sm3,
    fontSize: 14,
  },
  versionSection: {
    paddingHorizontal: dimensions.spacing.md4,
    paddingBottom: dimensions.spacing.md4,
    alignItems: 'center',
  },
  versionText: {
    textAlign: 'center',
    marginBottom: dimensions.spacing.xs3,
    fontSize: 12,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 999,
  },
  overlayTouchable: {
    flex: 1,
  },
});

export default Sidebar;