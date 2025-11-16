import { StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export function welcomeStyles() {
  const { theme, SPACING, FONT_SIZE, scale, verticalScale, COLORS } = useTheme();
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
      ...StyleSheet.absoluteFillObject
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.lg,
    },
    logo: {
      width: scale(120),
      height: scale(120),
      marginBottom: verticalScale(32),
    },
    title: {
      fontSize: FONT_SIZE.xlarge,
      fontWeight: 'bold',
      color: COLORS.primary,
      textAlign: 'center',
      marginBottom: verticalScale(16),
    },
    subtitle: {
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      textAlign: 'center',
      lineHeight: verticalScale(22),
      marginBottom: verticalScale(56),
    },
    buttonContainer: {
      width: '100%',
      gap: verticalScale(16),
    },
    loginButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: verticalScale(14),
      borderRadius: scale(10),
      alignItems: 'center',
      elevation: 4,
    },
    loginButtonText: {
      color: COLORS.secondary,
      fontSize: FONT_SIZE.medium,
      fontWeight: '600',
    },
    registerButton: {
      backgroundColor: COLORS.secondary,
      paddingVertical: verticalScale(14),
      borderRadius: scale(10),
      alignItems: 'center',
      elevation: 4
    },
    registerButtonText: {
      color: "white",
      fontSize: FONT_SIZE.medium,
      fontWeight: '600',
    },
  });
};
