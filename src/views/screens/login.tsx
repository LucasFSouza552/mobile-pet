import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Dimensions, TouchableWithoutFeedback, Keyboard, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginStyles } from '../../styles/pagesStyles/loginStyles';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { width, height } = useWindowDimensions();

  const styles = loginStyles(width, height);

  const handleLogin = () => {
    console.log('Login attempt:', { email, password });
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
              <Text style={styles.subtitle}>Digite seu email e senha para continuar</Text>

              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Email ou nome de usuário"
                  placeholderTextColor="#999999"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#999999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Entrar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.registerLink} onPress={handleRegister}>
                <Text style={styles.registerText}>
                  Não tem conta? <Text style={styles.registerLinkText}>Clique aqui</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}
