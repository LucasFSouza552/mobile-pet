import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export const createGlobalStyles = (COLORS: any) => StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: COLORS.text,
  },
});

export const useGlobalStyles = () => {
  const { COLORS } = useTheme();
  return createGlobalStyles(COLORS);
};
