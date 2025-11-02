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
import { authService } from '../../services/authService';
import Toast from 'react-native-toast-message';

export default function Login({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const loginStepStyles = createLoginStyles(width, height);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>();

  const handleLogin = async () => {
    Keyboard.dismiss();
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Preencha todos os campos.',
        position: 'bottom',
      });
      return;
    }

    try {
      const response = await authService.login(email, password);
      
      if (response) {
        Toast.show({
          type: 'success',
          text1: 'Sucesso',
          text2: 'Login realizado com sucesso!',
          position: 'bottom',
        });
        navigation.replace('Main');
      }
    } catch (error: any) {
      console.error('Erro no login:', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: error.message || 'Email ou senha inválidos.',
        position: 'bottom',
      });
    }
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  return (
    <View style={loginStepStyles.container}>
      <Image
        source={require('../../../assets/img/petfundo.png')}
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
