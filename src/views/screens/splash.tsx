import React from 'react';
import { View, ActivityIndicator, Image, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { splashStyles as styles } from '../../styles/pagesStyles/splashStyles';

export default function Splash() {
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../../assets/img/logoPet.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#B648A0" />
    </SafeAreaView>
  );
}

