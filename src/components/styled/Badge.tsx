import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { StyledText } from './StyledText';
import { dimensions } from '../../theme/dimensions';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  const { theme } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.interactive.primary,
          color: theme.colors.text.inverse,
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.surface.secondary,
          color: theme.colors.text.primary,
        };
      case 'success':
        return {
          backgroundColor: theme.colors.interactive.success,
          color: theme.colors.text.inverse,
        };
      case 'warning':
        return {
          backgroundColor: theme.colors.interactive.warning,
          color: theme.colors.text.inverse,
        };
      case 'error':
        return {
          backgroundColor: theme.colors.interactive.error,
          color: theme.colors.text.inverse,
        };
      case 'info':
        return {
          backgroundColor: theme.colors.interactive.info,
          color: theme.colors.text.inverse,
        };
      default:
        return {
          backgroundColor: theme.colors.interactive.primary,
          color: theme.colors.text.inverse,
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          paddingHorizontal: dimensions.spacing.xs3,
          paddingVertical: dimensions.spacing.xs,
          borderRadius: dimensions.layout.borderRadius.sm,
        };
      case 'medium':
        return {
          paddingHorizontal: dimensions.spacing.sm3,
          paddingVertical: dimensions.spacing.xs3,
          borderRadius: dimensions.layout.borderRadius.md,
        };
      case 'large':
        return {
          paddingHorizontal: dimensions.spacing.sm4,
          paddingVertical: dimensions.spacing.sm3,
          borderRadius: dimensions.layout.borderRadius.lg,
        };
      default:
        return {
          paddingHorizontal: dimensions.spacing.sm3,
          paddingVertical: dimensions.spacing.xs3,
          borderRadius: dimensions.layout.borderRadius.md,
        };
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.backgroundColor,
          ...sizeStyle,
        },
        style,
      ]}
    >
      <StyledText
        variant="caption"
        color={variantStyle.color as any}
        weight="bold"
        style={styles.badgeText}
      >
        {children}
      </StyledText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
