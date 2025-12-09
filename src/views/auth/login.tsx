import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { Images } from '../../../assets';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/types';
import { useLoginController } from '../../controllers/auth/useLoginController';

export default function Login({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, scale, verticalScale, FONT_SIZE } = useTheme();
  const loginStepStyles = makeStyles(COLORS, scale, verticalScale, FONT_SIZE);
  
  const {
    email,
    password,
    showPassword,
    loading,
    setEmail,
    setPassword,
    toggleShowPassword,
    handleLogin,
    handleRegister,
    handleForgotPassword,
  } = useLoginController();
  
  return (
    <View style={loginStepStyles.container}>
      <Image
          source={Images.petfundo}
        style={loginStepStyles.backgroundImage}
        resizeMode="cover"
      />
      
      <SafeAreaView style={loginStepStyles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <View style={loginStepStyles.content}>
                <View style={loginStepStyles.header}>
                  <Text style={loginStepStyles.headerTitle}>Entrar</Text>
                  <Text style={loginStepStyles.headerSubtitle}>
                    Digite seu email e senha para continuar
                  </Text>
                </View>

                <View style={loginStepStyles.formContainer}>
                  <View style={loginStepStyles.inputContainer}>
                    <TextInput
                      style={loginStepStyles.input}
                      placeholder="Email"
                      placeholderTextColor={COLORS.text}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      returnKeyType="next"
                      autoComplete="email"
                    />

                    <View style={loginStepStyles.passwordContainer}>
                      <TextInput
                        style={loginStepStyles.passwordInput}
                        placeholder="Senha"
                        placeholderTextColor={COLORS.text}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
                      />
                      <TouchableOpacity
                        style={loginStepStyles.eyeButton}
                        onPress={toggleShowPassword}
                      >
                        <FontAwesome
                          name={showPassword ? 'eye' : 'eye-slash'}
                          size={FONT_SIZE.regular}
                          color={COLORS.text}
                          style={{ opacity: 0.6 }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                    
                  <TouchableOpacity
                    style={loginStepStyles.forgotPasswordLink}
                    onPress={handleForgotPassword}
                  >
                    <Text style={loginStepStyles.forgotPasswordText}>
                      Esqueci minha senha
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={loginStepStyles.buttonContainer}>
                  <TouchableOpacity 
                    style={loginStepStyles.backButton} 
                    onPress={handleRegister}
                  >
                    <Text style={loginStepStyles.backButtonText}>Registrar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={loginStepStyles.loginButton} 
                    onPress={handleLogin}
                  >
                    <Text style={loginStepStyles.loginButtonText}>Entrar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

function makeStyles(COLORS: ThemeColors, scale: (size: number) => number, verticalScale: (size: number) => number, FONT_SIZE: { regular: number; medium: number; large: number }) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.quarternary,
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
      fontSize: FONT_SIZE.large,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: verticalScale(5),
    },
    headerSubtitle: {
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      opacity: 0.8,
      textAlign: 'center',
    },
    formContainer: {
      flex: 1,
      alignItems: 'center',
      marginTop: verticalScale(40),
    },
    inputContainer: {
      width: '100%',
    },
    input: {
      width: '100%',
      height: verticalScale(55),
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderRadius: scale(10),
      paddingHorizontal: scale(20),
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      marginBottom: verticalScale(20),
    },
    passwordContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderRadius: scale(10),
      marginBottom: verticalScale(20),
      backgroundColor: 'transparent',
      height: verticalScale(55),
    },
    passwordInput: {
      flex: 1,
      height: '100%',
      paddingHorizontal: scale(20),
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
    },
    eyeButton: {
      paddingHorizontal: scale(15),
      height: '100%',
      justifyContent: 'center',
    },
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
      fontSize: FONT_SIZE.medium,
      fontWeight: 'bold',
      color: COLORS.text,
    },
    loginButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: verticalScale(15),
      paddingHorizontal: scale(40),
      borderRadius: scale(25),
      minWidth: scale(140),
      alignItems: 'center',
    },
    loginButtonText: {
      fontSize: FONT_SIZE.medium,
      fontWeight: 'bold',
      color: COLORS.text,
    },
    forgotPasswordLink: {
      alignSelf: 'flex-end',
      marginTop: verticalScale(-10),
      marginBottom: verticalScale(10),
    },
    forgotPasswordText: {
      fontSize: FONT_SIZE.regular,
      color: COLORS.primary,
      fontWeight: '600',
    },
  });
}

