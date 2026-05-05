# TowRide App - Technical Specification Document

## Table of Contents
1. [Project Overview](#project-overview)
2. [App Architecture](#app-architecture)
3. [Technology Stack](#technology-stack)
4. [Screen Flow & Navigation](#screen-flow--navigation)
5. [Core Features](#core-features)
6. [Component Architecture](#component-architecture)
7. [Theme System](#theme-system)
8. [API Integrations](#api-integrations)
9. [State Management](#state-management)
10. [File Structure](#file-structure)
11. [Development Setup](#development-setup)
12. [Build Configuration](#build-configuration)

## Project Overview

**TowRide** is a React Native mobile application that provides vehicle towing services. The app allows users to request towing services for various vehicle types, track service providers in real-time, and manage their service history.

### Key Features
- User authentication via phone number
- Location-based service requests
- Real-time provider tracking
- Multiple vehicle type support
- Service history and invoicing
- Rating and feedback system

## App Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    TowRide App Architecture                 │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer (React Native Components)              │
│  ├── Screens (UI Controllers)                              │
│  ├── Components (Reusable UI Elements)                     │
│  └── Styled Components (Theme-based UI)                    │
├─────────────────────────────────────────────────────────────┤
│  Business Logic Layer                                      │
│  ├── Theme Provider (Design System)                        │
│  ├── Navigation (React Navigation)                         │
│  └── State Management (React Hooks + AsyncStorage)         │
├─────────────────────────────────────────────────────────────┤
│  Data Layer                                                │
│  ├── AsyncStorage (Local Persistence)                      │
│  ├── Google Maps API (Location Services)                   │
│  └── External APIs (Service Provider Integration)          │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Core Technologies
- **React Native**: 0.80.1
- **React**: 19.1.0
- **TypeScript**: 5.0.4
- **Node.js**: >=18

### Navigation
- **@react-navigation/native**: ^7.1.14
- **@react-navigation/native-stack**: ^7.3.21

### Maps & Location
- **react-native-maps**: ^1.24.3
- **@react-native-community/geolocation**: ^3.4.0
- **react-native-geolocation-service**: ^5.3.1
- **react-native-geocoding**: ^0.5.0
- **@mapbox/polyline**: ^1.2.1

### UI Components
- **react-native-vector-icons**: ^10.2.0
- **react-native-modal**: ^14.0.0-rc.1
- **react-native-dropdown-picker**: ^5.4.6
- **react-native-country-picker-modal**: ^2.0.0
- **@gorhom/bottom-sheet**: ^5.1.6

### State & Storage
- **@react-native-async-storage/async-storage**: ^2.2.0
- **react-native-permissions**: ^5.4.1

### Utilities
- **axios**: ^1.10.0
- **react-native-simple-toast**: ^3.3.2
- **react-native-reanimated**: ^3.18.0
- **react-native-gesture-handler**: ^2.27.1

## Screen Flow & Navigation

### Navigation Structure
```
App (Root)
├── SplashScreen (3s delay)
├── PreLoginScreen
│   ├── LoginPhone
│   │   └── OTPScreen
│   │       └── EnableLocationScreen
│   │           └── DashboardScreen (Main)
│   └── Google Login (Future)
└── DashboardScreen (Main App)
    ├── NewDashboard (Alternative)
    ├── SearchingProvider
    ├── RideHistoryScreen
    ├── InvoiceScreen
    ├── FeedbackScreen
    ├── WalletScreen
    ├── ProfileScreen
    └── HelpScreen
```

### Screen Descriptions

#### 1. SplashScreen
- **Purpose**: App initialization and loading
- **Duration**: 3 seconds
- **Features**: 
  - App branding
  - Permission checks
  - User authentication state verification

#### 2. PreLoginScreen
- **Purpose**: User onboarding and authentication options
- **Features**:
  - App introduction slider
  - Phone number login option
  - Google login option (placeholder)
  - Terms of service and privacy policy links

#### 3. LoginPhone
- **Purpose**: Phone number collection and validation
- **Features**:
  - Country code selection
  - Phone number input with validation
  - Name collection
  - 10-digit phone number validation

#### 4. OTPScreen
- **Purpose**: Phone number verification
- **Features**:
  - 4-digit OTP input
  - Auto-verification on completion
  - Resend code functionality (30-second timer)
  - User data storage

#### 5. EnableLocationScreen
- **Purpose**: Location permission request
- **Features**:
  - Location permission explanation
  - Permission request handling
  - Settings redirection if denied

#### 6. DashboardScreen (Main)
- **Purpose**: Primary app interface
- **Features**:
  - Interactive map with location selection
  - Service request interface
  - Sidebar navigation
  - Real-time location updates

#### 7. SearchingProvider
- **Purpose**: Service provider matching and tracking
- **Features**:
  - Real-time provider search
  - Route visualization
  - Driver details and ETA
  - Trip cancellation options
  - Rating system

## Core Features

### 1. User Authentication
- **Phone Number Verification**: SMS-based OTP verification
- **User Profile**: Name and contact information storage
- **Session Management**: Persistent login state

### 2. Location Services
- **Current Location**: GPS-based location detection
- **Location Selection**: Interactive map for pickup/drop points
- **Address Search**: Google Places API integration
- **Route Planning**: Turn-by-turn directions

### 3. Service Request System
- **Vehicle Selection**: 13 different vehicle types
- **Tow Type Selection**: 6 different towing methods
- **Pricing Calculator**: Dynamic pricing based on vehicle and service type
- **Service Details**: Pickup and drop location specification

### 4. Real-time Tracking
- **Provider Matching**: Algorithm-based driver assignment
- **Live Tracking**: Real-time location updates
- **ETA Calculation**: Estimated arrival time
- **Communication**: In-app messaging with drivers

### 5. Service Management
- **Service History**: Past service records
- **Invoicing**: Digital receipts and payment tracking
- **Rating System**: Driver and service feedback
- **Wallet Integration**: Payment management

## Component Architecture

### Screen Components
```
Screens/
├── PreLoginScreen.tsx          # Onboarding and login options
├── LoginPhone.tsx              # Phone number input
├── OTPScreen.tsx               # OTP verification
├── EnableLocationScreen.tsx    # Location permission
├── DashboardScreen.tsx         # Main dashboard
├── NewDashboard.jsx            # Alternative dashboard
├── SearchingProvider.tsx       # Provider tracking
├── RideHistoryScreen.tsx       # Service history
├── InvoiceScreen.tsx           # Billing and receipts
├── FeedbackScreen.tsx          # Rating and feedback
├── WalletScreen.tsx            # Payment management
├── ProfileScreen.tsx           # User profile
└── HelpScreen.tsx              # Support and help
```

### Reusable Components
```
Screens/Components/
├── ChooseMap.tsx               # Interactive map component
├── ServicesUnderMapNew.tsx     # Service selection interface
├── Sidebar.tsx                 # Navigation sidebar
├── CustomSelector.tsx          # Dropdown selector
├── CustomSelectorWithImage.tsx # Image-based selector
├── DestinationSelector.tsx     # Location picker
├── GarageSelector.tsx          # Service destination picker
├── DriverRating.tsx            # Rating component
├── ServiceIcons.tsx            # Service type icons
└── GeoTest.tsx                 # Location testing utility
```

### Styled Components
```
src/components/styled/
├── index.ts                    # Component exports
├── StyledAppBar.tsx           # App bar component
├── StyledButton.tsx           # Button component
├── StyledText.tsx             # Text component
├── StyledView.tsx             # View component
└── Spacer.tsx                 # Spacing component
```

## Theme System

### Design System Architecture
The app implements a comprehensive design system with:

#### Color Palette
- **Primary**: TowRides Orange (#f37f21)
- **Secondary**: Blue (#2196F3)
- **Neutral**: Gray scale (50-900)
- **Semantic**: Success, Warning, Error, Info

#### Typography
- **Font Sizes**: 10px - 48px (responsive)
- **Font Weights**: Light (300) to Extra Bold (800)
- **Line Heights**: Optimized for readability

#### Spacing System
- **8pt Grid**: Consistent spacing scale
- **Responsive**: Device-specific adjustments
- **Components**: Standardized component dimensions

#### Theme Implementation
```typescript
// Light Theme
export const lightTheme: Theme = {
  colors: {
    background: { primary: '#FAFAFA', secondary: '#F5F5F5' },
    surface: { primary: '#FFFFFF', secondary: '#F5F5F5' },
    text: { primary: '#212121', secondary: '#616161' },
    interactive: { primary: '#f37f21', secondary: '#2196F3' }
  }
}

// Dark Theme
export const darkTheme: Theme = {
  colors: {
    background: { primary: '#0E0E0E', secondary: '#202020' },
    surface: { primary: '#202020', secondary: '#303030' },
    text: { primary: '#FFFFFF', secondary: '#CCCCCC' },
    interactive: { primary: '#f37f21', secondary: '#2196F3' }
  }
}
```

## API Integrations

### Google Maps Services
- **Maps API**: Interactive map rendering
- **Geocoding API**: Address to coordinates conversion
- **Directions API**: Route planning and navigation
- **Places API**: Location search and autocomplete

### Location Services
- **GPS**: Real-time location tracking
- **Geolocation**: Device location access
- **Permissions**: Location permission management

### External Services
- **SMS Gateway**: OTP delivery (placeholder)
- **Payment Gateway**: Payment processing (future)
- **Push Notifications**: Real-time updates (future)

## State Management

### Local State Management
- **React Hooks**: useState, useEffect, useContext
- **AsyncStorage**: Persistent data storage
- **Theme Context**: Global theme management

### Data Persistence
```typescript
// User Data Storage
const userDetails = {
  name: string,
  phone: string,
  callingCode: string
}

// Service Request Storage
const serviceRequest = {
  selectedLocation: { latitude: number, longitude: number },
  selectedDropPoints: { latitude: number, longitude: number },
  selectedVehicle: string,
  selectedTowType: string,
  serviceType: string
}
```

## File Structure

```
towride/
├── App.tsx                     # Root component
├── app.json                    # App configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── babel.config.js             # Babel configuration
├── metro.config.js             # Metro bundler config
├── jest.config.js              # Testing configuration
├── Screens/                    # Screen components
│   ├── Components/             # Reusable components
│   └── asset/                  # Screen assets
├── src/                        # Source code
│   ├── components/             # Component library
│   ├── theme/                  # Design system
│   └── utils/                  # Utility functions
├── android/                    # Android native code
├── ios/                        # iOS native code
└── __tests__/                  # Test files
```

## Development Setup

### Prerequisites
- Node.js >= 18
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- CocoaPods (for iOS dependencies)

### Installation
```bash
# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Environment Configuration
- **Google Maps API Key**: Required for map functionality
- **SMS Gateway**: Required for OTP delivery
- **Backend API**: Required for service provider integration

## Build Configuration

### Android Configuration
- **Target SDK**: 34
- **Min SDK**: 21
- **Build Tools**: Gradle 8.0+
- **Permissions**: Location, Internet, Camera

### iOS Configuration
- **Deployment Target**: 11.0
- **Swift Version**: 5.0
- **Permissions**: Location When In Use, Camera

### Build Scripts
```json
{
  "scripts": {
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "start": "react-native start",
    "test": "jest",
    "lint": "eslint .",
    "postinstall": "patch-package"
  }
}
```

## Key Implementation Details

### 1. Location Permission Handling
- Cross-platform permission management
- Graceful fallback for denied permissions
- Settings redirection for permission changes

### 2. Map Integration
- Real-time location updates
- Interactive marker placement
- Route visualization with polylines
- Address search and autocomplete

### 3. Service Request Flow
- Multi-step service selection
- Dynamic pricing calculation
- Real-time provider matching
- Trip tracking and communication

### 4. Theme System
- Light and dark mode support
- Responsive design tokens
- Consistent component styling
- Accessibility considerations

### 5. State Management
- Context-based theme management
- AsyncStorage for persistence
- React hooks for local state
- Navigation state management

## Future Enhancements

### Planned Features
- **Payment Integration**: Stripe/PayPal integration
- **Push Notifications**: Real-time updates
- **Chat System**: In-app messaging
- **Multi-language Support**: Internationalization
- **Offline Mode**: Limited offline functionality
- **Analytics**: User behavior tracking
- **Admin Dashboard**: Service provider management

### Technical Improvements
- **State Management**: Redux/Zustand integration
- **Testing**: Comprehensive test coverage
- **Performance**: Code splitting and optimization
- **Security**: Enhanced data protection
- **Monitoring**: Error tracking and analytics

---

This specification document provides a comprehensive overview of the TowRide app architecture, features, and implementation details. It serves as a reference for developers, designers, and stakeholders involved in the project.
