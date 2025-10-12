import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { welcomeStyles as styles } from '../../styles/pagesStyles/welcomeStyles';

export default function Welcome({ navigation }: any) {
  const [resizeMode, setResizeMode] = useState<'cover' | 'contain'>('cover');

  useEffect(() => {
    const onChange = (result: any) => {
      const { width, height } = result.window;
      const aspectRatio = width / height;
      
      if (aspectRatio > 1.5) {
        setResizeMode('contain');
      } else if (aspectRatio < 0.7) {
        setResizeMode('cover');
      } else {
        setResizeMode('cover');
      }
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    
    const initialDimensions = Dimensions.get('window');
    const { width, height } = initialDimensions;
    const aspectRatio = width / height;
    
    if (aspectRatio > 1.5) {
      setResizeMode('contain');
    } else {
      setResizeMode('cover');
    }
    
    return () => subscription?.remove();
  }, []);

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../../assets/img/petfundo.png')}
        style={styles.backgroundImage}
        resizeMode={resizeMode}
      />
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
