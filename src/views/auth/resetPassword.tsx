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
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { createLoginStyles } from '../../styles/pagesStyles/loginStyles';
import { authRemoteRepository } from '../../data/remote/repositories/authRemoteRepository';
import { Images } from '../../../assets';
import { useToast } from '../../hooks/useToast';

export default function ResetPassword({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const loginStepStyles = createLoginStyles(width, height);
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
                {/* Back Button */}
                <TouchableOpacity
                  style={loginStepStyles.backButtonTop}
                  onPress={handleBackToLogin}
                >
                  <FontAwesome5 name="arrow-left" size={20} color="#fff" />
                </TouchableOpacity>

                {/* Header */}
                <View style={loginStepStyles.header}>
                  <Text style={loginStepStyles.headerTitle}>Redefinir senha</Text>
                  <Text style={loginStepStyles.headerSubtitle}>
                    Digite sua nova senha abaixo
                  </Text>
                </View>

                {/* Form */}
                <View style={loginStepStyles.formContainer}>
                  <View style={loginStepStyles.inputContainer}>
                    <View style={loginStepStyles.passwordContainer}>
                      <TextInput
                        style={loginStepStyles.passwordInput}
                        placeholder="Nova senha"
                        placeholderTextColor="#999"
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
                          size={20}
                          color="#999"
                        />
                      </TouchableOpacity>
                    </View>

                    <View style={loginStepStyles.passwordContainer}>
                      <TextInput
                        style={loginStepStyles.passwordInput}
                        placeholder="Confirmar senha"
                        placeholderTextColor="#999"
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
                          size={20}
                          color="#999"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Button */}
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
                      <ActivityIndicator color="#fff" />
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
