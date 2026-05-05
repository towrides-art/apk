import React, { forwardRef } from 'react';
import { Animated, View, ViewProps } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

interface AnimatedViewProps extends ViewProps {
  children?: React.ReactNode;
  animatedValue?: Animated.Value;
  style?: any;
}

export const AnimatedView = forwardRef<View, AnimatedViewProps>(
  ({ children, animatedValue, style, ...props }, ref) => {
    const { theme } = useTheme();

    return (
      <Animated.View
        ref={ref}
        style={[
          {
            backgroundColor: theme.colors.surface.primary,
          },
          style,
        ]}
        {...props}
      >
        {children}
      </Animated.View>
    );
  }
);

AnimatedView.displayName = 'AnimatedView';
