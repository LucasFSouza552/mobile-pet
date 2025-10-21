import { StyleSheet } from 'react-native';
import { useTheme } from '../theme';

export const welcomeStyles = () => {
  const { COLORS, SPACING, FONT_SIZE, scale, verticalScale } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
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
      textShadowColor: COLORS.textShadow,
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      paddingHorizontal: SPACING.md,
      paddingVertical: verticalScale(6),
      borderRadius: scale(10),
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    subtitle: {
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      textAlign: 'center',
      lineHeight: verticalScale(22),
      marginBottom: verticalScale(56),
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
      paddingHorizontal: SPACING.md,
      paddingVertical: verticalScale(6),
      borderRadius: scale(10),
      borderWidth: 1,
      borderColor: COLORS.border,
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
