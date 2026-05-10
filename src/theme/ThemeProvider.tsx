import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ColorScheme, getTheme } from './theme';

interface ThemeContextType {
  theme: Theme;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  initialColorScheme?: ColorScheme;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialColorScheme,
}) => {
  const systemColorScheme = useColorScheme() as ColorScheme;
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(
    initialColorScheme || systemColorScheme || 'light'
  );
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setColorSchemeState(savedTheme);
        } else {
          // Default to system color scheme if no saved preference
          setColorSchemeState(systemColorScheme || 'light');
          await AsyncStorage.setItem(THEME_STORAGE_KEY, systemColorScheme || 'light');
        }
      } catch (error) {
        console.warn('Failed to load theme preference:', error);
        // Fallback to system color scheme or light
        setColorSchemeState(systemColorScheme || 'light');
      } finally {
        setIsLoaded(true);
      }
    };

    loadThemePreference();
  }, [systemColorScheme]);

  // Save theme preference
  const setColorScheme = async (scheme: ColorScheme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, scheme);
      setColorSchemeState(scheme);
    } catch (error) {
      console.warn('Failed to save theme preference:', error);
      setColorSchemeState(scheme);
    }
  };

  // Toggle between light and dark
  const toggleTheme = () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorScheme(newScheme);
  };

  const theme = getTheme(colorScheme);
  const isDark = colorScheme === 'dark';

  const contextValue: ThemeContextType = {
    theme,
    colorScheme,
    setColorScheme,
    toggleTheme,
    isDark,
  };

  // Don't render until theme is loaded
  if (!isLoaded) {
    return null; // Or a loading spinner
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};