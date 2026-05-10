import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/theme';

interface StyledTextProps {
  children?: React.ReactNode;
  style?: TextStyle;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'caption' | 'button';
  color?: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'inverse' | 'black';
  weight?: keyof typeof typography.weights;
  onPress?: () => void;
}

export const StyledText: React.FC<StyledTextProps> = ({ 
  children, 
  style, 
  variant = 'body', 
  color = 'primary', 
  weight = 'regular',
  onPress
}) => {
  const { theme } = useTheme();
  
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontSize: typography.sizes.xxxl,
          fontWeight: typography.weights.bold,
        };
      case 'h2':
        return {
          fontSize: typography.sizes.xxl,
          fontWeight: typography.weights.semibold,
        };
      case 'h3':
        return {
          fontSize: typography.sizes.xl,
          fontWeight: typography.weights.medium,
        };
      case 'h4':
        return {
          fontSize: typography.sizes.lg,
          fontWeight: typography.weights.medium,
        };
      case 'button':
        return {
          fontSize: typography.sizes.md,
          fontWeight: typography.weights.medium,
        };
      case 'caption':
        return {
          fontSize: typography.sizes.sm,
          fontWeight: typography.weights.regular,
        };
      default:
        return {
          fontSize: typography.sizes.md,
          fontWeight: typography.weights.regular,
        };
    }
  };

  const getColorStyle = (): TextStyle => {
    switch (color) {
      case 'secondary':
        return { color: theme.colors.text.secondary };
      case 'tertiary':
        return { color: theme.colors.text.tertiary };
      case 'disabled':
        return { color: theme.colors.text.disabled };
      case 'inverse':
        return { color: theme.colors.text.inverse };
      case 'black':
        return {color:'black'}
      default:
        return { color: theme.colors.text.primary };
    }
  };

  return (
    <Text
      style={[
        getVariantStyle(),
        getColorStyle(),
        { fontWeight: typography.weights[weight] },
        style,
      ]}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}; 