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
  ActivityIndicator,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Images } from '../../../assets';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/types';
import { useForgotPasswordController } from '../../controllers/auth/useForgotPasswordController';

export default function ForgotPassword({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, scale, verticalScale, FONT_SIZE } = useTheme();
  const loginStepStyles = makeStyles(COLORS, scale, verticalScale, FONT_SIZE);
  
  const {
    email,
    loading,
    emailSent,
    setEmail,
    handleForgotPassword,
    handleBackToLogin,
  } = useForgotPasswordController();

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
                <TouchableOpacity
                  style={loginStepStyles.backButtonTop}
                  onPress={handleBackToLogin}
                >
                  <FontAwesome5 name="arrow-left" size={FONT_SIZE.regular} color={COLORS.text} />
                </TouchableOpacity>

                <View style={loginStepStyles.header}>
                  <Text style={loginStepStyles.headerTitle}>Esqueci minha senha</Text>
                  <Text style={loginStepStyles.headerSubtitle}>
                    {emailSent
                      ? 'Enviamos um email com instruções para redefinir sua senha.'
                      : 'Digite seu email para receber instruções de recuperação de senha.'}
                  </Text>
                </View>

                {!emailSent ? (
                  <>
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
                          returnKeyType="send"
                          autoComplete="email"
                          onSubmitEditing={handleForgotPassword}
                          editable={!loading}
                        />
                      </View>
                    </View>

                    <View style={loginStepStyles.buttonContainer}>
                      <TouchableOpacity
                        style={[
                          loginStepStyles.loginButton,
                          loading && { opacity: 0.6 }
                        ]}
                        onPress={handleForgotPassword}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator color={COLORS.text} />
                        ) : (
                          <Text style={loginStepStyles.loginButtonText}>Enviar</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={loginStepStyles.formContainer}>
                    <View style={loginStepStyles.successContainer}>
                      <FontAwesome5 name="check-circle" size={FONT_SIZE.xxlarge} color={COLORS.success} />
                      <Text style={loginStepStyles.successText}>
                        Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
                      </Text>
                    </View>
                  </View>
                )}
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
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingBottom: verticalScale(30),
      width: '100%',
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
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      textAlign: 'center',
      marginTop: verticalScale(20),
      paddingHorizontal: scale(20),
      lineHeight: scale(24),
    },
  });
}
