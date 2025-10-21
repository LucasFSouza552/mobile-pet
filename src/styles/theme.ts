import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

export const useTheme = () => {
  const { width, height } = useWindowDimensions();

  const BASE_WIDTH = 375;
  const BASE_HEIGHT = 812;
  const scale = (size: number) => {
    const factor = width / BASE_WIDTH;
    return size * Math.min(factor, 1.1);
  };

  const verticalScale = (size: number) => {
    const factor = height / BASE_HEIGHT;
    return size * Math.min(factor, 1.1);
  };

  const COLORS = {
    textShadow: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(255, 255, 255, 0.2)',
    bg: "#fff",
    text: "#000",
    primary: "#B648A0",
    secondary: "#363135",
    tertiary: "#61475C",
    quarternary: "#332630",
    quinary: "#4A3A46"
  };

  const SPACING = {
    xs: scale(4),
    sm: scale(8),
    md: scale(16),
    lg: scale(24),
    xl: scale(32),
  };

  const FONT_SIZE = {
    small: scale(12),
    regular: scale(16),
    medium: scale(18),
    large: scale(24),
    xlarge: scale(28),
  };

  return useMemo(() => ({ COLORS, SPACING, FONT_SIZE, scale, verticalScale }), [width, height]);
};
