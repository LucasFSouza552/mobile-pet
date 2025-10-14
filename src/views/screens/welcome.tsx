import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { welcomeStyles } from '../../styles/pagesStyles/welcomeStyles';


export default function Welcome({ navigation }: any) {
  
  const { width, height } = useWindowDimensions();

  const styles = welcomeStyles(width, height);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('../../../assets/img/logoPet.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Bem-vindo ao PetApp</Text>
        <Text style={styles.subtitle}>
          Conecte-se com outros amantes de pets e compartilhe momentos especiais
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>Criar Conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
