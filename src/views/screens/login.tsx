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
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginStyles } from '../../styles/pagesStyles/loginStyles';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { authService } from '../../services/authService';
import Toast from 'react-native-toast-message';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>();
  const styles = loginStyles();

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
      const token = await authService.login(email, password);
      if (!token) {
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Email ou senha inválidos.',
          position: 'bottom',
        });
        throw new Error('Email ou senha inválidos.');
      }
      console.log("IR PARA MAIN")
      navigation.navigate('Main');
    } catch (error: any) {
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

  const goToMain = () => {
    navigation.navigate('Main');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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

                <PrimaryButton text="Entrar" onPress={handleLogin} />

                <TouchableOpacity
                  style={styles.registerLink}
                  onPress={handleRegister}
                >
                  <Text style={styles.registerText}>
                    Não tem conta?{' '}
                    <Text style={styles.registerLinkText}>Clique aqui</Text>
                  </Text>
                </TouchableOpacity>

                {/* botão temporário! Tirar quando login funcionar!!!!!!!!!!! */}
                <TouchableOpacity
                  style={[styles.registerLink, { marginTop: 20 }]}
                  onPress={goToMain}
                >
                  <Text style={[styles.registerLinkText, { color: '#007BFF' }]}>
                    Ir para a tela principal
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
