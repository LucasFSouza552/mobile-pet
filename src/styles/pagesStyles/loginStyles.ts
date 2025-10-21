import { StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../../context/ThemeContext';


const { width, height } = Dimensions.get('window');

export const loginStyles = () => {
  const { COLORS } = useTheme()

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    safeArea: {
      flex: 1
    },
    backgroundImage: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: '100%',
    },
    content: {
      flex: 1,

    },
    header: {
      alignItems: 'center',
      paddingHorizontal: width * 0.05,
      paddingTop: height * 0.03,
      paddingBottom: height * 0.005,
    },
    logoContainer: {
      alignItems: 'center',
    },
    logo: {
      width: width * 0.15,
      height: width * 0.15,
      maxWidth: 60,
      minWidth: 40,
    },
    formContainer: {
      backgroundColor: COLORS.secondary,
      marginHorizontal: width * 0.08,
      borderRadius: width * 0.05,
      paddingHorizontal: width * 0.06,
      paddingVertical: height * 0.03,
      marginTop: height * 0.05,
      marginBottom: height * 0.1,
    },
    title: {
      fontSize: width * 0.07,
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: height * 0.008,
    },
    subtitle: {
      fontSize: width * 0.035,
      color: '#ffffff',
      textAlign: 'center',
      marginBottom: height * 0.025,
      opacity: 0.8,
    },
    inputContainer: {
      marginBottom: height * 0.02,
    },
    input: {
      backgroundColor: '#ffffff',
      borderRadius: width * 0.03,
      paddingHorizontal: width * 0.04,
      paddingVertical: height * 0.015,
      fontSize: width * 0.04,
      marginBottom: height * 0.015,
      color: '#333333',
    },
    registerLink: {
      alignItems: 'center',
    },
    registerText: {
      color: '#ffffff',
      fontSize: width * 0.04,
    },
    registerLinkText: {
      color: '#B648A0',
      fontWeight: '600',
    },
  });
}
