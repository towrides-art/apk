import React from 'react';
import { View, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../theme/ThemeProvider';
import { StyledText, StyledButton } from './index';
import { dimensions } from '../../theme/dimensions';

interface StyledAppBarProps {
  title: string;
  subtitle?: string;
  leftIcon?: string;
  rightIcon?: string;
  onLeftPress?: () => void;
  onRightPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
  variant?: 'primary' | 'secondary' | 'transparent';
  elevation?: boolean;
}

export const StyledAppBar: React.FC<StyledAppBarProps> = ({
  title,
  subtitle,
  leftIcon,
  rightIcon,
  onLeftPress,
  onRightPress,
  showBackButton = false,
  onBackPress,
  variant = 'primary',
  elevation = true,
}) => {
  const { theme, isDark } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return theme.colors.surface.primary;
      case 'secondary':
        return theme.colors.surface.secondary;
      case 'transparent':
        return 'transparent';
      default:
        return theme.colors.surface.primary;
    }
  };

  const getBorderColor = () => {
    if (variant === 'transparent') return 'transparent';
    return theme.colors.border.secondary;
  };

  return (
    <>
      {/* <StatusBar
        backgroundColor={getBackgroundColor()}
        barStyle={isDark ? 'light-content' : 'dark-content'}
        translucent={false}
      /> */}
      <View style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderBottomColor: getBorderColor(),
        }
      ]}>
        <View style={styles.content}>
          {/* Left Section */}
          <View style={styles.leftSection}>
            {showBackButton && (
              <TouchableOpacity
                style={[styles.iconButton, {
                  backgroundColor: theme.colors.surface.secondary,
                  borderColor: theme.colors.border.secondary,
                }]}
                onPress={onBackPress}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name="arrow-back"
                  size={20}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
            )}
            {leftIcon && !showBackButton && (
              <TouchableOpacity
                style={[styles.iconButton, {
                  backgroundColor: theme.colors.surface.secondary,
                  borderColor: theme.colors.border.secondary,
                }]}
                onPress={onLeftPress}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={leftIcon as any}
                  size={20}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
            )}
          </View>

          {/* Center Section */}
          <View style={styles.centerSection}>
            <StyledText
              variant="h3"
              color="primary"
              weight="bold"
              style={styles.title}
            >
              {title}
            </StyledText>
            {/* {subtitle && (
              <StyledText
                variant="caption"
                color="secondary"
                style={styles.subtitle}
                numberOfLines={1}
              >
                {subtitle}
              </StyledText>
            )} */}
          </View>

          {/* Right Section */}
          {/* <View style={styles.rightSection}>
            {rightIcon && (
              <TouchableOpacity
                style={[styles.iconButton, {
                  backgroundColor: theme.colors.surface.secondary,
                  borderColor: theme.colors.border.secondary,
                }]}
                onPress={onRightPress}
                activeOpacity={0.7}
              >
                <MaterialIcons
                  name={rightIcon as any}
                  size={20}
                  color={theme.colors.text.primary}
                />
              </TouchableOpacity>
            )}
          </View> */}
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    height: dimensions.components.header.height + 20,
    borderBottomWidth: 1,
    justifyContent: 'flex-end',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: dimensions.spacing.md4,
    height: dimensions.components.header.height,
  },
  leftSection: {
    width: 48,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    width: 48,
    alignItems: 'flex-end',
  },
  title: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
}); 