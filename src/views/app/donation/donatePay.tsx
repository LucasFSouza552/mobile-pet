import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { IAccount } from '../../../models/IAccount';
import { pictureRepository } from '../../../data/remote/repositories/pictureRemoteRepository';
import { accountRemoteRepository } from '../../../data/remote/repositories/accountRemoteRepository';
import { useToast } from '../../../hooks/useToast';
import { FontAwesome } from '@expo/vector-icons';

interface DonatePayProps {
  navigation: any;
  route: {
    params?: {
      institution?: IAccount;
      petId?: string;
    };
  };
}

export default function DonatePay({ navigation, route }: DonatePayProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const toast = useToast();
  
  const institution = route?.params?.institution;
  
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';
    
    const cents = parseInt(numbers, 10);
    const reais = (cents / 100).toFixed(2);
    
    return reais.replace('.', ',');
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatCurrency(text);
    setAmount(formatted);
  };

  const handleDonate = async () => {
    if (!amount) {
      toast.error('Valor inválido', 'Por favor, digite um valor para doação');
      return;
    }

    const value = parseFloat(amount.replace(',', '.'));
    if (isNaN(value) || value < 10) {
      toast.error('Valor mínimo', 'O valor mínimo para doação é R$10,00');
      return;
    }

    try {
      setLoading(true);
      
      const amountString = value.toFixed(2);
      
      const response = await accountRemoteRepository.donate(amountString);
      
      if (!response || !response.url) {
        throw new Error('Resposta inválida do servidor. URL de pagamento não encontrada.');
      }

      navigation.navigate('DonationWebView', { url: response.url });
      setAmount('');
    } catch (error: any) {
      toast.error('Erro ao realizar doação', error.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome name="chevron-left" size={20} color={COLORS.text} />
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {institution && (
          <View style={styles.institutionCard}>
            <Image 
              source={pictureRepository.getSource(institution.avatar)}
              style={styles.institutionAvatar} 
            />
            <Text style={styles.institutionName}>{institution.name}</Text>
            {institution.address?.city && (
              <Text style={styles.institutionLocation}>
                {institution.address.city}, {institution.address.state}
              </Text>
            )}
          </View>
        )}

        <View style={styles.content}>
          <Text style={styles.title}>
            {institution ? `Doe para ${institution.name}` : 'Doe para PetAmigo'}
          </Text>
          <Text style={styles.subtitle}>
            Sua ajuda faz a diferença na vida de muitos animais
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Valor da doação</Text>
            <View style={styles.currencyContainer}>
              <Text style={styles.currencySymbol}>R$</Text>
              <TextInput
                style={styles.input}
                placeholder="0,00"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={amount}
                onChangeText={handleAmountChange} 
                editable={!loading}
              />
            </View>
            <Text style={styles.minValue}>Valor mínimo: R$10,00</Text>
          </View>

          <TouchableOpacity 
            style={[styles.button, loading && styles.buttonDisabled]} 
            onPress={handleDonate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Fazer Doação</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.infoText}>
            Sua doação será processada de forma segura e ajudará a manter os cuidados com os animais.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(COLORS: any) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 20,
    },
    backButton: {
      padding: 8,
    },
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
    },
    scrollContent: {
      flexGrow: 1,
      padding: 20,
    },
    institutionCard: {
      backgroundColor: COLORS.quarternary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    institutionAvatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: COLORS.bg,
      marginBottom: 12,
    },
    institutionName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: 4,
    },
    institutionLocation: {
      fontSize: 14,
      color: COLORS.text,
      opacity: 0.7,
    },
    content: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.text,
      opacity: 0.7,
      marginBottom: 32,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 24,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 8,
    },
    currencyContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderRadius: 12,
      paddingHorizontal: 16,
      backgroundColor: COLORS.quarternary,
    },
    currencySymbol: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      marginRight: 8,
    },
    input: {
      flex: 1,
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      paddingVertical: 16,
    },
    minValue: {
      fontSize: 12,
      color: COLORS.text,
      opacity: 0.6,
      marginTop: 8,
      textAlign: 'center',
    },
    button: {
      backgroundColor: COLORS.primary,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      color: '#fff',
      fontSize: 18,
      fontWeight: 'bold',
    },
    infoText: {
      fontSize: 14,
      color: COLORS.text,
      opacity: 0.7,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
}
