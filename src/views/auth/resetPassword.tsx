import React, { useState, useEffect } from 'react';
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
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { authRemoteRepository } from '../../data/remote/repositories/authRemoteRepository';
import { Images } from '../../../assets';
import { useToast } from '../../hooks/useToast';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/types';

export default function ResetPassword({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, scale, verticalScale, FONT_SIZE } = useTheme();
  const loginStepStyles = makeStyles(COLORS, scale, verticalScale, FONT_SIZE);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const tokenParam = route?.params?.token;
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error('Token inválido', 'Link de recuperação inválido.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    }
  }, [route?.params?.token]);

  const handleResetPassword = async () => {
    Keyboard.dismiss();

    if (!password.trim()) {
      toast.info('Por favor, informe sua nova senha.');
      return;
    }

    if (password.length < 8) {
      toast.error('Senha muito curta', 'A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (!confirmPassword.trim()) {
      toast.info('Por favor, confirme sua senha.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Senhas não coincidem', 'As senhas devem ser iguais.');
      return;
    }

    if (!token) {
      toast.error('Token inválido', 'Link de recuperação inválido.');
      return;
    }

    try {
      setLoading(true);
      await authRemoteRepository.resetPassword(token, password);
      toast.success('Senha redefinida!', 'Sua senha foi alterada com sucesso.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (error: any) {
      toast.handleApiError(
        error,
        error?.data?.message || 'Erro ao redefinir senha. O link pode ter expirado.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  if (!token) {
    return (
      <View style={loginStepStyles.container}>
        <Image
          source={Images.petfundo}
          style={loginStepStyles.backgroundImage}
          resizeMode="cover"
        />
        <SafeAreaView style={loginStepStyles.safeArea} edges={['top', 'left', 'right']}>
          <View style={loginStepStyles.content}>
            <View style={loginStepStyles.header}>
              <Text style={loginStepStyles.headerTitle}>Token inválido</Text>
              <Text style={loginStepStyles.headerSubtitle}>
                O link de recuperação é inválido ou expirou.
              </Text>
            </View>
            <TouchableOpacity
              style={loginStepStyles.loginButton}
              onPress={handleBackToLogin}
            >
              <Text style={loginStepStyles.loginButtonText}>Voltar ao Login</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

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
                  <Text style={loginStepStyles.headerTitle}>Redefinir senha</Text>
                  <Text style={loginStepStyles.headerSubtitle}>
                    Digite sua nova senha abaixo
                  </Text>
                </View>

                <View style={loginStepStyles.formContainer}>
                  <View style={loginStepStyles.inputContainer}>
                    <View style={loginStepStyles.passwordContainer}>
                      <TextInput
                        style={loginStepStyles.passwordInput}
                        placeholder="Nova senha"
                        placeholderTextColor={COLORS.text}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        returnKeyType="next"
                        autoComplete="password-new"
                        editable={!loading}
                      />
                      <TouchableOpacity
                        style={loginStepStyles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <FontAwesome
                          name={showPassword ? 'eye' : 'eye-slash'}
                          size={FONT_SIZE.regular}
                          color={COLORS.text}
                          style={{ opacity: 0.6 }}
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={loginStepStyles.passwordContainer}>
                      <TextInput
                        style={loginStepStyles.passwordInput}
                        placeholder="Confirmar senha"
                        placeholderTextColor={COLORS.text}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleResetPassword}
                        autoComplete="password-new"
                        editable={!loading}
                      />
                      <TouchableOpacity
                        style={loginStepStyles.eyeButton}
                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        <FontAwesome
                          name={showConfirmPassword ? 'eye' : 'eye-slash'}
                          size={FONT_SIZE.regular}
                          color={COLORS.text}
                          style={{ opacity: 0.6 }}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={loginStepStyles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      loginStepStyles.loginButton,
                      { width: '100%' },
                      loading && { opacity: 0.6 }
                    ]}
                    onPress={handleResetPassword}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={COLORS.text} />
                    ) : (
                      <Text style={loginStepStyles.loginButtonText}>Redefinir senha</Text>
                    )}
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
  });
}
