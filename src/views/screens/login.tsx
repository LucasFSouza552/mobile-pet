import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  TouchableWithoutFeedback,
  Keyboard, KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginStyles } from '../../styles/pagesStyles/loginStyles';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { authService } from '../../services/authService';
import ErrorMessage from '../../components/Buttons/ErrorComponet';

import Toast, { ErrorToast } from 'react-native-toast-message';


export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();

  const styles = loginStyles();

  const handleLogin = async () => {
     Keyboard.dismiss();
    if (!email || !password) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Preencha todos os campos.', position: 'bottom' });
      return;
    }
    try {
      const success = await authService.login(email, password);
      if (success) {
        navigation.navigate('Main');
      }

    } catch (error) {
      Toast.show({ type: 'error', text1: 'Erro', text2: 'Email ou senha inválidos.', position: 'bottom' });
    }
  };

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(''), 3000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{ flex: 1 }}>
        <View style={styles.container}>
          <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../../assets/img/logoPet.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <View style={styles.formContainer}>
                <Text style={styles.title}>Entrar</Text>
                <Text style={styles.subtitle}>
                  Digite seu email e senha para continuar
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#999999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    returnKeyType="done"
                    onSubmitEditing={handleLogin} 
                  />
                </View>

                <PrimaryButton text="Entrar" onPress={() => handleLogin()} />

                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={handleRegister}
                >
                  <Text style={styles.registerText}>
                    Não tem conta?{' '}
                    <Text style={styles.registerLinkText}>Clique aqui</Text>
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </SafeAreaView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>

  );
}