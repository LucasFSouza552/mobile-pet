import { StyleSheet } from 'react-native';

export const GlobalStyles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#333',
  },
});

export const theme = {
  colors: {
    background: '#f8f9fa',
    textPrimary: '#333333',
    primary: '#1565c0',
    white: '#ffffff',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
};
