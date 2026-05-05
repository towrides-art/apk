import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

// Screen dimensions
export const screenDimensions = {
  width,
  height,
  // Responsive breakpoints
  isSmallDevice: width < 375,
  isMediumDevice: width >= 375 && width < 414,
  isLargeDevice: width >= 414,
} as const;

// Scalable spacing values
export const scalableSpacing = {
  // Extra small spacing
  xs: 4,
  xs2: 6,
  xs3: 8,
  
  // Small spacing
  sm: 10,
  sm2: 12,
  sm3: 14,
  sm4: 16,
  
  // Medium spacing
  md: 18,
  md2: 20,
  md3: 22,
  md4: 24,
  
  // Large spacing
  lg: 26,
  lg2: 28,
  lg3: 30,
  lg4: 32,
  
  // Extra large spacing
  xl: 34,
  xl2: 36,
  xl3: 38,
  xl4: 40,
  
  // 2x large spacing
  xxl: 42,
  xxl2: 44,
  xxl3: 46,
  xxl4: 48,
  
  // 3x large spacing
  xxxl: 50,
  xxxl2: 52,
  xxxl3: 54,
  xxxl4: 56,
  xxxl5: 58,
  xxxl6: 60,
  xxxl7: 62,
  xxxl8: 64,
} as const;

// Component dimensions
export const componentDimensions = {
  // Header dimensions
  header: {
    height: 56,
    paddingHorizontal: scalableSpacing.md4,
  },
  
  // Button dimensions
  button: {
    height: 48,
    smallHeight: 40,
    largeHeight: 56,
    borderRadius: 12,
    paddingHorizontal: scalableSpacing.md4,
  },
  
  // Input dimensions
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: scalableSpacing.md4,
  },
  
  // Card dimensions
  card: {
    padding: scalableSpacing.md4,
    margin: scalableSpacing.sm3,
    borderRadius: 16,
  },
  
  // Modal dimensions
  modal: {
    padding: scalableSpacing.lg4,
    borderRadius: 20,
  },
  
  // Icon dimensions
  icon: {
    small: 16,
    medium: 24,
    large: 32,
    xlarge: 48,
  },
  
  // Avatar dimensions
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },
} as const;

// Typography dimensions
export const typographyDimensions = {
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    xxxl: 24,
    display: 32,
    hero: 48,
  },
  
  // Line heights
  lineHeight: {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    xl: 22,
    xxl: 24,
    xxxl: 28,
    display: 36,
    hero: 52,
  },
  
  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
    widest: 2,
  },
} as const;

// Layout dimensions
export const layoutDimensions = {
  // Container padding
  containerPadding: {
    xs: scalableSpacing.sm4,
    sm: scalableSpacing.md4,
    md: scalableSpacing.lg4,
    lg: scalableSpacing.xl4,
  },
  
  // Section spacing
  sectionSpacing: {
    xs: scalableSpacing.md4,
    sm: scalableSpacing.lg4,
    md: scalableSpacing.xl4,
    lg: scalableSpacing.xxl4,
  },
  
  // Border radius
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 50,
  },
  
  // Shadow dimensions
  shadow: {
    small: {
      offset: { width: 0, height: 1 },
      radius: 2,
      elevation: 1,
    },
    medium: {
      offset: { width: 0, height: 2 },
      radius: 4,
      elevation: 2,
    },
    large: {
      offset: { width: 0, height: 4 },
      radius: 8,
      elevation: 4,
    },
  },
} as const;

// Responsive dimensions based on screen size
export const responsiveDimensions = {
  // Responsive padding
  padding: {
    horizontal: screenDimensions.isSmallDevice ? scalableSpacing.md4 : scalableSpacing.lg4,
    vertical: screenDimensions.isSmallDevice ? scalableSpacing.md4 : scalableSpacing.lg4,
  },
  
  // Responsive margins
  margin: {
    horizontal: screenDimensions.isSmallDevice ? scalableSpacing.sm4 : scalableSpacing.md4,
    vertical: screenDimensions.isSmallDevice ? scalableSpacing.sm4 : scalableSpacing.md4,
  },
  
  // Responsive font sizes
  fontSize: {
    h1: screenDimensions.isSmallDevice ? typographyDimensions.fontSize.xxxl : typographyDimensions.fontSize.display,
    h2: screenDimensions.isSmallDevice ? typographyDimensions.fontSize.xxl : typographyDimensions.fontSize.xxxl,
    h3: screenDimensions.isSmallDevice ? typographyDimensions.fontSize.xl : typographyDimensions.fontSize.xxl,
    body: screenDimensions.isSmallDevice ? typographyDimensions.fontSize.md : typographyDimensions.fontSize.lg,
    caption: screenDimensions.isSmallDevice ? typographyDimensions.fontSize.sm : typographyDimensions.fontSize.md,
  },
} as const;

// Export all dimensions
export const dimensions = {
  screen: screenDimensions,
  spacing: scalableSpacing,
  components: componentDimensions,
  typography: typographyDimensions,
  layout: layoutDimensions,
  responsive: responsiveDimensions,
} as const; 