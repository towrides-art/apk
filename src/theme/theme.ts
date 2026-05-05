import { dimensions } from './dimensions';

// Design system based on 8pt grid
export const spacing = dimensions.spacing;

export const borderRadius = dimensions.layout.borderRadius;

export const typography = {
  sizes: dimensions.typography.fontSize,
  weights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
} as const;

export const themeDimensions = {
  screen: dimensions.screen,
  header: dimensions.components.header,
  button: dimensions.components.button,
  input: dimensions.components.input,
  card: dimensions.components.card,
} as const;

// Color palette following Material Design principles
export const colors = {
  // Primary colors - Orange based on #f37f21
  primary: {
    50: '#FFF3E0',
    100: '#FFE0B2',
    200: '#FFCC80',
    300: '#FFB74D',
    400: '#FFA726',
    500: '#f37f21', // Main primary color - TowRides Orange
    600: '#F57C00',
    700: '#EF6C00',
    800: '#E65100',
    900: '#FF3D00',
  },
  // Secondary colors - Complementary to orange
  secondary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Blue as secondary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },
  // Neutral colors
  neutral: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  // Semantic colors
  success: {
    50: '#E8F5E8',
    100: '#C8E6C9',
    200: '#A5D6A7',
    300: '#81C784',
    400: '#66BB6A',
    500: '#4CAF50',
    600: '#43A047',
    700: '#388E3C',
    800: '#2E7D32',
    900: '#1B5E20',
  },
  warning: {
    50: '#FFF8E1',
    100: '#FFECB3',
    200: '#FFE082',
    300: '#FFD54F',
    400: '#FFCA28',
    500: '#FFC107',
    600: '#FFB300',
    700: '#FFA000',
    800: '#FF8F00',
    900: '#FF6F00',
  },
  error: {
    50: '#FFEBEE',
    100: '#FFCDD2',
    200: '#EF9A9A',
    300: '#E57373',
    400: '#EF5350',
    500: '#F44336',
    600: '#E53935',
    700: '#D32F2F',
    800: '#C62828',
    900: '#B71C1C',
  },
  // Special colors
  info: {
    50: '#E1F5FE',
    100: '#B3E5FC',
    200: '#81D4FA',
    300: '#4FC3F7',
    400: '#29B6F6',
    500: '#03A9F4',
    600: '#039BE5',
    700: '#0288D1',
    800: '#0277BD',
    900: '#01579B',
  },
} as const;

// Define theme structure type
export type ThemeColors = {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    modal: string;
  };
  surface: {
    primary: string;
    secondary: string;
    tertiary: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    disabled: string;
    inverse: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
  };
  interactive: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  status: {
    online: string;
    offline: string;
    busy: string;
    error: string;
  };
};

export type ThemeShadows = {
  small: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  medium: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  large: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
};

export type Theme = {
  colors: ThemeColors;
  shadows: ThemeShadows;
};

// Light theme
export const lightTheme: Theme = {
  colors: {
    // Background colors
    background: {
      primary: colors.neutral[50],
      secondary: colors.neutral[100],
      tertiary: colors.neutral[200],
      card: '#FFFFFF',
      modal: '#FFFFFF',
    },
    // Surface colors
    surface: {
      primary: '#FFFFFF',
      secondary: colors.neutral[100],
      tertiary: colors.neutral[200],
      elevated: '#FFFFFF',
    },
    // Text colors
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[700],
      tertiary: colors.neutral[500],
      disabled: colors.neutral[400],
      inverse: '#FFFFFF',
    },
    // Border colors
    border: {
      primary: colors.neutral[300],
      secondary: colors.neutral[200],
      focus: colors.primary[500], // Using TowRides orange
      error: colors.error[500],
    },
    // Interactive colors
    interactive: {
      primary: colors.primary[500], // TowRides orange
      secondary: colors.secondary[500],
      success: colors.success[500],
      warning: colors.warning[500],
      error: colors.error[500],
      info: colors.info[500],
    },
    // Status colors
    status: {
      online: colors.success[500],
      offline: colors.neutral[400],
      busy: colors.warning[500],
      error: colors.error[500],
    },
  },
  shadows: {
    small: {
      shadowColor: colors.neutral[900],
      shadowOffset: dimensions.layout.shadow.small.offset,
      shadowOpacity: 0.05,
      shadowRadius: dimensions.layout.shadow.small.radius,
      elevation: dimensions.layout.shadow.small.elevation,
    },
    medium: {
      shadowColor: colors.neutral[900],
      shadowOffset: dimensions.layout.shadow.medium.offset,
      shadowOpacity: 0.1,
      shadowRadius: dimensions.layout.shadow.medium.radius,
      elevation: dimensions.layout.shadow.medium.elevation,
    },
    large: {
      shadowColor: colors.neutral[900],
      shadowOffset: dimensions.layout.shadow.large.offset,
      shadowOpacity: 0.15,
      shadowRadius: dimensions.layout.shadow.large.radius,
      elevation: dimensions.layout.shadow.large.elevation,
    },
  },
};

// Dark theme
export const darkTheme: Theme = {
  colors: {
    // Background colors
    background: {
      primary: '#0E0E0E',
      secondary: '#202020',
      tertiary: '#303030',
      card: '#202020',
      modal: '#202020',
    },
    // Surface colors
    surface: {
      primary: '#202020',
      secondary: '#303030',
      tertiary: '#404040',
      elevated: '#303030',
    },
    // Text colors
    text: {
      primary: '#FFFFFF',
      secondary: '#CCCCCC',
      tertiary: '#999999',
      disabled: '#666666',
      inverse: '#0E0E0E',
    },
    // Border colors
    border: {
      primary: '#404040',
      secondary: '#303030',
      focus: '#0E0E0E',
      error: colors.error[400],
    },
    // Interactive colors
    interactive: {
      primary: '#0E0E0E',
      secondary: '#202020',
      success: colors.success[400],
      warning: colors.warning[400],
      error: colors.error[400],
      info: colors.info[400],
    },
    // Status colors
    status: {
      online: colors.success[400],
      offline: '#666666',
      busy: colors.warning[400],
      error: colors.error[400],
    },
  },
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: dimensions.layout.shadow.small.offset,
      shadowOpacity: 0.2,
      shadowRadius: dimensions.layout.shadow.small.radius,
      elevation: dimensions.layout.shadow.small.elevation,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: dimensions.layout.shadow.medium.offset,
      shadowOpacity: 0.3,
      shadowRadius: dimensions.layout.shadow.medium.radius,
      elevation: dimensions.layout.shadow.medium.elevation,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: dimensions.layout.shadow.large.offset,
      shadowOpacity: 0.4,
      shadowRadius: dimensions.layout.shadow.large.radius,
      elevation: dimensions.layout.shadow.large.elevation,
    },
  },
};

export type ColorScheme = 'light' | 'dark';

// Theme context and hook
export const getTheme = (colorScheme: ColorScheme): Theme => {
  return  lightTheme;
}; 