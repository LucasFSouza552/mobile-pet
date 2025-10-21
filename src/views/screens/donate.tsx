import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Donate() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tela de Doação</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  text: { fontSize: 20 },
});
