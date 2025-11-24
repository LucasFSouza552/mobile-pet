import React, { useState } from 'react';
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
import { FontAwesome5 } from '@expo/vector-icons';
import { createLoginStyles } from '../../styles/pagesStyles/loginStyles';
import { authRemoteRepository } from '../../data/remote/repositories/authRemoteRepository';
import { Images } from '../../../assets';
import { useToast } from '../../hooks/useToast';

export default function ForgotPassword({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const loginStepStyles = createLoginStyles(width, height);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const toast = useToast();

  const handleForgotPassword = async () => {
    Keyboard.dismiss();
    
    if (!email.trim()) {
      toast.info('Por favor, informe seu email.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Email inválido', 'Por favor, informe um email válido.');
      return;
    }

    try {
      setLoading(true);
      await authRemoteRepository.forgotPassword(email);
      setEmailSent(true);
      toast.success(
        'Email enviado!',
        'Verifique sua caixa de entrada para redefinir sua senha.'
      );
    } catch (error: any) {
      toast.handleApiError(
        error,
        error?.data?.message || 'Erro ao enviar email de recuperação.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.goBack();
  };

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
                  <Text style={loginStepStyles.headerTitle}>Esqueci minha senha</Text>
                  <Text style={loginStepStyles.headerSubtitle}>
                    {emailSent
                      ? 'Enviamos um email com instruções para redefinir sua senha.'
                      : 'Digite seu email para receber instruções de recuperação de senha.'}
                  </Text>
                </View>

                {!emailSent ? (
                  <>
                    {/* Form */}
                    <View style={loginStepStyles.formContainer}>
                      <View style={loginStepStyles.inputContainer}>
                        <TextInput
                          style={loginStepStyles.input}
                          placeholder="Email"
                          placeholderTextColor="#999"
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

                    {/* Button */}
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
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={loginStepStyles.loginButtonText}>Enviar</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <View style={loginStepStyles.formContainer}>
                    <View style={loginStepStyles.successContainer}>
                      <FontAwesome5 name="check-circle" size={64} color="#2ECC71" />
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
