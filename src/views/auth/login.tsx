import React, { useEffect, useState } from 'react';
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
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { createLoginStyles } from '../../styles/pagesStyles/loginStyles';
import { authRemoteRepository } from '../../data/remote/repositories/authRemoteRepository';
import { useAccount } from '../../context/AccountContext';
import { accountSync } from '../../data/sync/accountSync';
import { Images } from '../../../assets';
import { useToast } from '../../hooks/useToast';

export default function Login({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const loginStepStyles = createLoginStyles(width, height);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { refreshAccount } = useAccount();
  const toast = useToast();
  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email || !password) {
      toast.info('Preencha todos os campos.');
      return;
    }

    try {
      const response = await authRemoteRepository.login(email, password);
      if (!response?.token) {
        toast.error('Email ou senha inválidos.');
        throw new Error('Email ou senha inválidos.');
      }
      await accountSync.syncFromServer();
      await refreshAccount();
      navigation.navigate('Main');
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Email ou senha inválidos.');
      return;
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  const goToMain = () => {
    navigation.navigate('Main');
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
                {/* Header */}
                <View style={loginStepStyles.header}>
                  <Text style={loginStepStyles.headerTitle}>Entrar</Text>
                  <Text style={loginStepStyles.headerSubtitle}>
                    Digite seu email e senha para continuar
                  </Text>
                </View>

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
                      returnKeyType="next"
                      autoComplete="email"
                    />

                    <View style={loginStepStyles.passwordContainer}>
                      <TextInput
                        style={loginStepStyles.passwordInput}
                        placeholder="Senha"
                        placeholderTextColor="#999"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        returnKeyType="done"
                        onSubmitEditing={handleLogin}
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
                  </View>
                    
                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    style={loginStepStyles.forgotPasswordLink}
                    onPress={() => navigation.navigate('ForgotPassword')}
                  >
                    <Text style={loginStepStyles.forgotPasswordText}>
                      Esqueci minha senha
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Buttons */}
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

