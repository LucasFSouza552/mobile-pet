import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import SecondaryButton from '../../components/Buttons/SecondaryButton';
import { Images } from '../../../assets';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/types';

export default function Welcome({ navigation }: any) {
  const { COLORS, scale, verticalScale, FONT_SIZE, SPACING } = useTheme();
  const styles = makeStyles(COLORS, scale, verticalScale, FONT_SIZE, SPACING);

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
          source={Images.logoPet}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Bem-vindo ao PetApp</Text>
        <Text style={styles.subtitle}>
          Conecte-se com outros amantes de pets e compartilhe momentos especiais
        </Text>

        <View style={styles.buttonContainer}>
          <PrimaryButton text="Entrar" onPress={handleLogin} />

          <SecondaryButton text="Criar conta"  onPress={handleRegister} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(
  COLORS: ThemeColors,
  scale: (size: number) => number,
  verticalScale: (size: number) => number,
  FONT_SIZE: { regular: number; medium: number; large: number; xlarge: number },
  SPACING: { lg: number }
) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
      ...StyleSheet.absoluteFillObject,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: SPACING.lg,
    },
    logo: {
      width: scale(120),
      height: scale(120),
      marginBottom: verticalScale(32),
    },
    title: {
      fontSize: FONT_SIZE.xlarge,
      fontWeight: 'bold',
      color: COLORS.primary,
      textAlign: 'center',
      marginBottom: verticalScale(16),
    },
    subtitle: {
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      textAlign: 'center',
      lineHeight: verticalScale(22),
      marginBottom: verticalScale(56),
    },
    buttonContainer: {
      width: '100%',
      gap: verticalScale(16),
    },
    loginButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: verticalScale(14),
      borderRadius: scale(10),
      alignItems: 'center',
      elevation: 4,
    },
    loginButtonText: {
      color: COLORS.secondary,
      fontSize: FONT_SIZE.medium,
      fontWeight: '600',
    },
    registerButton: {
      backgroundColor: COLORS.secondary,
      paddingVertical: verticalScale(14),
      borderRadius: scale(10),
      alignItems: 'center',
      elevation: 4,
    },
    registerButtonText: {
      color: 'white',
      fontSize: FONT_SIZE.medium,
      fontWeight: '600',
    },
  });
}

