import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { accountService } from '../../services/accountService';

export default function Profile() {


  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Perfil</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20 },
});
