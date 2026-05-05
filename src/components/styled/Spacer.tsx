import React from 'react';
import { View } from 'react-native';
import { spacing } from '../../theme/theme';

interface SpacerProps {
  size?: keyof typeof spacing;
  horizontal?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({ 
  size = 'md', 
  horizontal = false 
}) => {
  const spacerStyle = horizontal
    ? { width: spacing[size] }
    : { height: spacing[size] };
  
  return <View style={spacerStyle} />;
}; 