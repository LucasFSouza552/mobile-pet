// src/styles/useTheme.ts
import { useWindowDimensions } from 'react-native';
import { useMemo } from 'react';

export const useTheme = () => {
  const { width, height } = useWindowDimensions();

  const BASE_WIDTH = 375;
  const BASE_HEIGHT = 812;

  const scale = (size: number) => (width / BASE_WIDTH) * size;
  const verticalScale = (size: number) => (height / BASE_HEIGHT) * size;

  // TODO: Definir as cores baseado no tema
  const COLORS = {
    primary: '#B648A0',
    secondary: '#ffffff',
    text: '#333333',
    textShadow: 'rgba(255, 255, 255, 0.8)',
    border: 'rgba(255, 255, 255, 0.2)',
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
