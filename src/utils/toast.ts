import { Alert } from 'react-native';

export const Toast = {
  show: (message: string, duration?: number) => {
    Alert.alert('', message, [{ text: 'OK' }]);
  },
  showWithGravity: (message: string, duration?: number, gravity?: string) => {
    Alert.alert('', message, [{ text: 'OK' }]);
  },
  showWithGravityAndOffset: (message: string, duration?: number, gravity?: string, xOffset?: number, yOffset?: number) => {
    Alert.alert('', message, [{ text: 'OK' }]);
  },
  // Constants for compatibility
  SHORT: 2000,
  LONG: 3500
};

export default Toast; 