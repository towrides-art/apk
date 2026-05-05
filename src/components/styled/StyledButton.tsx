import React from 'react';
import { TouchableOpacity, ViewStyle, TextStyle, TouchableOpacityProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { StyledText } from './StyledText';
import { spacing, borderRadius, typography } from '../../theme/theme';
import { dimensions } from '../../theme/dimensions';

interface StyledButtonProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  onPress?: () => void;
}

export const StyledButton: React.FC<StyledButtonProps & Omit<TouchableOpacityProps, 'style' | 'onPress'>> = ({
  children,
  style,
  textStyle,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onPress,
  ...props
}) => {
  const { theme } = useTheme();
  
  const getVariantStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.text.disabled : theme.colors.interactive.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? theme.colors.text.disabled : theme.colors.interactive.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? theme.colors.border.secondary : theme.colors.interactive.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      default:
        return baseStyle;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return {
          height: dimensions.components.button.smallHeight,
          paddingHorizontal: spacing.md,
        };
      case 'large':
        return {
          height: dimensions.components.button.largeHeight,
          paddingHorizontal: spacing.xl,
        };
      default:
        return {
          height: dimensions.components.button.height,
          paddingHorizontal: spacing.lg,
        };
    }
  };

  const getTextColor = (): string => {
    if (disabled) return theme.colors.text.disabled;
    
    switch (variant) {
      case 'outline':
      case 'ghost':
        return theme.colors.interactive.primary;
      default:
        return theme.colors.text.inverse;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getVariantStyle(),
        getSizeStyle(),
        style,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <StyledText
        variant="button"
        color="inverse"
        style={{
          color: getTextColor(),
          ...textStyle,
        }}
      >
        {children}
      </StyledText>
    </TouchableOpacity>
  );
}; 