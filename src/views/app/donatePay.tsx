import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function DonationPage() {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');

  const handleDonate = () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (isNaN(value) || value < 10) {
      setMessage('O valor mínimo para doação é R$10,00.');
      return;
    }
    setMessage(`Obrigado por ajudar os pets.`);
    setAmount('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Doe para Instituições de Pets</Text>
      <Text style={styles.subtitle}>Sua ajuda faz a diferença na vida de muitos animais</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o valor (mínimo R$10,00)"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TouchableOpacity style={styles.button} onPress={handleDonate}>
        <Text style={styles.buttonText}>Fazer Doação</Text>
      </TouchableOpacity>

      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#B648A0',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#B648A0',
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 30,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#B648A0',
    marginTop: 10,
  },
});
