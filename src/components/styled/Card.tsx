import React from 'react';
import { TouchableOpacity, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { StyledText } from './StyledText';
import { dimensions } from '../../theme/dimensions';

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  onPress,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const { theme } = useTheme();

  const getPaddingValue = () => {
    switch (padding) {
      case 'none': return 0;
      case 'small': return dimensions.spacing.sm4;
      case 'medium': return dimensions.spacing.md4;
      case 'large': return dimensions.spacing.lg4;
      default: return dimensions.spacing.md4;
    }
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: theme.colors.surface.primary,
      borderRadius: dimensions.layout.borderRadius.lg,
      padding: getPaddingValue(),
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          ...theme.shadows.medium,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: theme.colors.border.primary,
        };
      default:
        return {
          ...baseStyle,
          ...theme.shadows.small,
        };
    }
  };

  const CardComponent = onPress ? TouchableOpacity : View;
  const cardProps = onPress ? { onPress, activeOpacity: 0.7 } : {};

  return (
    <CardComponent {...cardProps} style={[getCardStyle(), style]}>
      {title && (
        <StyledText variant="h4" color="primary" weight="bold" style={styles.title}>
          {title}
        </StyledText>
      )}
      {subtitle && (
        <StyledText variant="body" color="secondary" style={styles.subtitle}>
          {subtitle}
        </StyledText>
      )}
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  title: {
    marginBottom: dimensions.spacing.sm3,
  },
  subtitle: {
    marginBottom: dimensions.spacing.md3,
  },
});
