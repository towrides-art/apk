import React from 'react';
import Svg, { Path, Circle, Rect, G, Line, Defs, LinearGradient, Stop } from 'react-native-svg';

interface ServiceIconProps {
  type: 'tow' | 'jumpstart' | 'tyre' | 'fuel';
  size?: number;
  color?: string;
}

const ServiceIcon: React.FC<ServiceIconProps> = ({ type, size = 60, color = '#f37f21' }) => {
  const renderIcon = () => {
    switch (type) {
      case 'tow':
        return (
          <Svg width={size} height={size} viewBox="0 0 60 60">
            <Defs>
              <LinearGradient id="towGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={color} />
                <Stop offset="100%" stopColor="#e65a1a" />
              </LinearGradient>
            </Defs>
            {/* Tow Truck Body */}
            <Rect x="8" y="35" width="44" height="12" rx="2" fill="url(#towGradient)" />
            {/* Truck Cabin */}
            <Rect x="40" y="25" width="12" height="10" rx="2" fill="url(#towGradient)" />
            {/* Wheels */}
            <Circle cx="15" cy="47" r="4" fill="#333" />
            <Circle cx="45" cy="47" r="4" fill="#333" />
            {/* Tow Hook */}
            <Rect x="8" y="40" width="6" height="3" fill="#333" />
            {/* Car being towed */}
            <Rect x="2" y="38" width="8" height="6" rx="1" fill="#666" />
            <Circle cx="4" cy="44" r="2" fill="#333" />
            <Circle cx="8" cy="44" r="2" fill="#333" />
            {/* Tow Cable */}
            <Line x1="14" y1="42" x2="2" y2="42" stroke="#333" strokeWidth="1" />
          </Svg>
        );

      case 'jumpstart':
        return (
          <Svg width={size} height={size} viewBox="0 0 60 60">
            <Defs>
              <LinearGradient id="jumpstartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={color} />
                <Stop offset="100%" stopColor="#e65a1a" />
              </LinearGradient>
            </Defs>
            {/* Battery */}
            <Rect x="15" y="20" width="30" height="20" rx="2" fill="url(#jumpstartGradient)" />
            <Rect x="17" y="22" width="26" height="16" fill="#fff" />
            {/* Battery Terminals */}
            <Rect x="42" y="25" width="3" height="10" fill="url(#jumpstartGradient)" />
            {/* Battery Cells */}
            <Rect x="20" y="25" width="4" height="10" fill="#ddd" />
            <Rect x="26" y="25" width="4" height="10" fill="#ddd" />
            <Rect x="32" y="25" width="4" height="10" fill="#ddd" />
            <Rect x="38" y="25" width="2" height="10" fill="#ddd" />
            {/* Jumper Cables */}
            <Path d="M 10 30 Q 5 25 5 20 Q 5 15 10 10" stroke="#333" strokeWidth="2" fill="none" />
            <Path d="M 50 30 Q 55 25 55 20 Q 55 15 50 10" stroke="#333" strokeWidth="2" fill="none" />
            {/* Cable Clamps */}
            <Rect x="8" y="8" width="4" height="4" rx="1" fill="#333" />
            <Rect x="48" y="8" width="4" height="4" rx="1" fill="#333" />
          </Svg>
        );

      case 'tyre':
        return (
          <Svg width={size} height={size} viewBox="0 0 60 60">
            <Defs>
              <LinearGradient id="tyreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={color} />
                <Stop offset="100%" stopColor="#e65a1a" />
              </LinearGradient>
            </Defs>
            {/* Main Tire */}
            <Circle cx="30" cy="30" r="18" fill="#333" />
            <Circle cx="30" cy="30" r="15" fill="#666" />
            <Circle cx="30" cy="30" r="12" fill="#333" />
            {/* Tire Tread Pattern */}
            <Path d="M 18 30 Q 20 25 22 30 Q 24 35 26 30" stroke="#999" strokeWidth="1" fill="none" />
            <Path d="M 34 30 Q 36 25 38 30 Q 40 35 42 30" stroke="#999" strokeWidth="1" fill="none" />
            <Path d="M 30 18 Q 25 20 30 22 Q 35 24 30 26" stroke="#999" strokeWidth="1" fill="none" />
            <Path d="M 30 34 Q 25 36 30 38 Q 35 40 30 42" stroke="#999" strokeWidth="1" fill="none" />
            {/* Hub */}
            <Circle cx="30" cy="30" r="6" fill="url(#tyreGradient)" />
            <Circle cx="30" cy="30" r="4" fill="#fff" />
            {/* Lug Nuts */}
            <Circle cx="26" cy="26" r="1" fill="#333" />
            <Circle cx="34" cy="26" r="1" fill="#333" />
            <Circle cx="26" cy="34" r="1" fill="#333" />
            <Circle cx="34" cy="34" r="1" fill="#333" />
          </Svg>
        );

      case 'fuel':
        return (
          <Svg width={size} height={size} viewBox="0 0 60 60">
            <Defs>
              <LinearGradient id="fuelGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor={color} />
                <Stop offset="100%" stopColor="#e65a1a" />
              </LinearGradient>
            </Defs>
            {/* Fuel Pump */}
            <Rect x="20" y="15" width="20" height="30" rx="2" fill="url(#fuelGradient)" />
            <Rect x="22" y="17" width="16" height="26" fill="#fff" />
            {/* Pump Display */}
            <Rect x="25" y="20" width="10" height="8" fill="#333" />
            <Rect x="27" y="22" width="6" height="4" fill="#0f0" />
            {/* Fuel Hose */}
            <Rect x="38" y="25" width="8" height="3" fill="#333" />
            {/* Hose Nozzle */}
            <Rect x="46" y="23" width="4" height="7" rx="1" fill="#666" />
            {/* Fuel Drop */}
            <Path d="M 48 30 Q 48 35 46 38 Q 44 40 42 38 Q 40 35 42 32 Q 44 30 48 30" fill="url(#fuelGradient)" />
            {/* Pump Handle */}
            <Rect x="25" y="35" width="12" height="8" rx="2" fill="#333" />
            <Rect x="27" y="37" width="8" height="4" fill="#666" />
          </Svg>
        );

      default:
        return null;
    }
  };

  return renderIcon();
};

export default ServiceIcon; 