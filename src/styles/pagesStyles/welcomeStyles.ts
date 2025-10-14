import { StyleSheet } from 'react-native';
import { useTheme } from '../theme';

export const welcomeStyles = (width: number, height: number) => {
  const { COLORS, SPACING, FONT_SIZE, scale, verticalScale } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    backgroundImage: {
      ...StyleSheet.absoluteFillObject, // cobre toda a tela
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.md,
    },
    logo: {
      width: scale(120),           // tamanho escalável
      height: scale(120),
      maxWidth: 150,
      minWidth: 100,
      marginBottom: verticalScale(32),
    },
    title: {
      fontSize: FONT_SIZE.xlarge,
      fontWeight: 'bold',
      color: COLORS.primary,
      textAlign: 'center',
      marginBottom: verticalScale(16),
      textShadowColor: COLORS.textShadow,
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      paddingHorizontal: SPACING.md,
      paddingVertical: verticalScale(8),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    subtitle: {
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      textAlign: 'center',
      lineHeight: verticalScale(24),
      marginBottom: verticalScale(64),
      paddingHorizontal: SPACING.md,
      textShadowColor: COLORS.textShadow,
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      paddingVertical: verticalScale(8),
      borderRadius: scale(12),
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    buttonContainer: {
      width: '100%',
      gap: verticalScale(16),
    },
    loginButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: verticalScale(16),
      borderRadius: scale(10),
      alignItems: 'center',
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    loginButtonText: {
      color: COLORS.secondary,
      fontSize: FONT_SIZE.medium,
      fontWeight: '600',
    },
    registerButton: {
      backgroundColor: COLORS.secondary,
      paddingVertical: verticalScale(16),
      borderRadius: scale(12),
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    registerButtonText: {
      color: COLORS.primary,
      fontSize: FONT_SIZE.medium,
      fontWeight: '600',
    },
  });
};
