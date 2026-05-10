import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, borderRadius } from '../../theme/theme';

interface StyledViewProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'card' | 'elevated';
  padding?: keyof typeof spacing;
  margin?: keyof typeof spacing;
}

export const StyledView: React.FC<StyledViewProps> = ({ 
  children, 
  style, 
  variant = 'primary', 
  padding, 
  margin 
}) => {
  const { theme } = useTheme();
  
  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'card':
        return {
          backgroundColor: theme.colors.surface.primary,
          borderRadius: borderRadius.md,
          ...theme.shadows.small,
        };
      case 'elevated':
        return {
          backgroundColor: theme.colors.surface.elevated,
          borderRadius: borderRadius.md,
          ...theme.shadows.medium,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface.secondary,
        };
      default:
        return {
          backgroundColor: theme.colors.background.primary,
        };
    }
  };

  return (
    <View
      style={[
        getVariantStyle(),
        padding && { padding: spacing[padding] },
        margin && { margin: spacing[margin] },
        style,
      ]}
    >
      {children}
    </View>
  );
}; 