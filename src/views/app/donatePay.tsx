import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ScrollView, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { IAccount } from '../../models/IAccount';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { accountRemoteRepository } from '../../data/remote/repositories/accountRemoteRepository';
import Toast from 'react-native-toast-message';

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
      Toast.show({
        type: 'error',
        text1: 'Valor inválido',
        text2: 'Por favor, digite um valor para doação',
        position: 'bottom',
      });
      return;
    }

    const value = parseFloat(amount.replace(',', '.'));
    if (isNaN(value) || value < 10) {
      Toast.show({
        type: 'error',
        text1: 'Valor mínimo',
        text2: 'O valor mínimo para doação é R$10,00',
        position: 'bottom',
      });
      return;
    }

    try {
      setLoading(true);
      
      const amountString = value.toFixed(2);
      
      console.log('[DONATE] Valor formatado:', amountString);
      console.log('[DONATE] Tipo do valor:', typeof amountString);
      
      const response = await accountRemoteRepository.donate(amountString);
      
      console.log('[DONATE] Resposta recebida:', response);
      
      if (!response || !response.url) {
        console.error('[DONATE] Resposta inválida:', response);
        throw new Error('Resposta inválida do servidor. URL de pagamento não encontrada.');
      }

      const canOpen = await Linking.canOpenURL(response.url);
      if (canOpen) {
        await Linking.openURL(response.url);
        
        Toast.show({
          type: 'success',
          text1: 'Redirecionando para pagamento...',
          text2: 'Você será redirecionado para o MercadoPago',
          position: 'bottom',
        });
        
        setTimeout(() => {
          setAmount('');
          navigation.goBack();
        }, 2000);
      } else {
        Alert.alert(
          'Erro',
          'Não foi possível abrir o link de pagamento. Por favor, tente novamente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('[DONATE] Erro completo:', JSON.stringify(error, null, 2));
      console.error('[DONATE] Tipo do erro:', typeof error);
      console.error('[DONATE] Erro.message:', error?.message);
      console.error('[DONATE] Erro.response:', error?.response);
      console.error('[DONATE] Erro.response?.data:', error?.response?.data);
      console.error('[DONATE] Erro.response?.status:', error?.response?.status);
      
      let errorMessage = 'Tente novamente mais tarde';
      
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = (error as any).message;
        } else if ('error' in error) {
          errorMessage = (error as any).error;
        }
      }
      
      if (errorMessage === 'Tente novamente mais tarde') {
        if (error?.message) {
          errorMessage = error.message;
        } else if (error?.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
      }
      
      if (errorMessage.includes('Token não encontrado') || errorMessage.includes('Unauthorized')) {
        errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
      } else if (errorMessage.includes('Quantidade não foi informada')) {
        errorMessage = 'Por favor, informe um valor para doação.';
      } else if (errorMessage.includes('Usuário não encontrado')) {
        errorMessage = 'Usuário não encontrado. Por favor, faça login novamente.';
      } else if (errorMessage.includes('Erro ao doar para petApp') || errorMessage.includes('Erro ao doar')) {
        errorMessage = 'Erro ao processar doação. Verifique sua conexão e tente novamente. Se o problema persistir, entre em contato com o suporte.';
      }
      
      Toast.show({
        type: 'error',
        text1: 'Erro ao realizar doação',
        text2: errorMessage,
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
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
