import { StyleSheet } from 'react-native';

export const createLoginStyles = (width: number, height: number) => {
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#332630',
    },
    backgroundImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0.3,
    },
    safeArea: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: scale(30),
      paddingTop: verticalScale(20),
    },
    header: {
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    headerTitle: {
      fontSize: scale(32),
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: verticalScale(5),
    },
    headerSubtitle: {
      fontSize: scale(14),
      color: '#ddd',
      textAlign: 'center',
    },
  
    // Form
    formContainer: {
      flex: 1,
      alignItems: 'center',
      marginTop: verticalScale(40),
    },
    
    // Inputs
    inputContainer: {
      width: '100%',
    },
    input: {
      width: '100%',
      height: verticalScale(55),
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#B648A0',
      borderRadius: scale(10),
      paddingHorizontal: scale(20),
      fontSize: scale(16),
      color: '#fff',
      marginBottom: verticalScale(20),
    },

    // Password Input with Eye Icon
    passwordContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#B648A0',
      borderRadius: scale(10),
      marginBottom: verticalScale(20),
      backgroundColor: 'transparent',
      height: verticalScale(55),
    },
    passwordInput: {
      flex: 1,
      height: '100%',
      paddingHorizontal: scale(20),
      fontSize: scale(16),
      color: '#fff',
    },
    eyeButton: {
      paddingHorizontal: scale(15),
      height: '100%',
      justifyContent: 'center',
    },

    // Buttons
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: verticalScale(30),
      width: '100%',
    },
    backButton: {
      paddingVertical: verticalScale(15),
      paddingHorizontal: scale(30),
    },
    backButtonText: {
      fontSize: scale(18),
      fontWeight: 'bold',
      color: '#fff',
    },
    loginButton: {
      backgroundColor: '#B648A0',
      paddingVertical: verticalScale(15),
      paddingHorizontal: scale(40),
      borderRadius: scale(25),
      minWidth: scale(140),
      alignItems: 'center',
    },
    loginButtonText: {
      fontSize: scale(18),
      fontWeight: 'bold',
      color: '#fff',
    },
    backButtonTop: {
      padding: scale(10),
      marginBottom: verticalScale(10),
      alignSelf: 'flex-start',
    },
    successContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: verticalScale(40),
    },
    successText: {
      fontSize: scale(16),
      color: '#fff',
      textAlign: 'center',
      marginTop: verticalScale(20),
      paddingHorizontal: scale(20),
      lineHeight: scale(24),
    },
    forgotPasswordLink: {
      alignSelf: 'flex-end',
      marginTop: verticalScale(-10),
      marginBottom: verticalScale(10),
    },
    forgotPasswordText: {
      fontSize: scale(14),
      color: '#B648A0',
      fontWeight: '600',
    },
  });
};
