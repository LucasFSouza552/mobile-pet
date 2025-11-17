import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { accountRemoteRepository } from '../../data/remote/repositories/accountRemoteRepository';

export default function DonationPage({ navigation, route }: any) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const { COLORS } = useTheme();
  const institutionId: string | undefined = route?.params?.institutionId;
  const presets = [10, 25, 50, 100];
  const styles = makeStyles(COLORS, focused);

  const handleDonate = async () => {
    const value = parseFloat(amount.replace(',', '.'));
    if (isNaN(value) || value < 10) {
      setMessage('O valor mínimo para doação é R$10,00.');
      return;
    }
    try {
      setLoading(true);
      const data = institutionId
        ? await accountRemoteRepository.sponsorInstitution(institutionId, value)
        : await accountRemoteRepository.donate(value);

      const url: string | undefined = data?.url || data?.paymentUrl || data?.link;
      if (url && typeof url === 'string') {
        navigation.navigate('DonationWebView', { url });
        return;
      }

      setMessage('Obrigado por ajudar os pets.');
      setAmount('');
      Toast.show({ type: 'success', text1: 'Doação iniciada com sucesso!', position: 'bottom' });
    } catch (err: any) {
      const text = err?.message || 'Erro ao processar doação.';
      Toast.show({ type: 'error', text1: text, position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Voltar" onPress={() => navigation.goBack()} style={styles.backBtn}>
          <FontAwesome name="chevron-left" size={18} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <FontAwesome name="paw" size={28} color={COLORS.primary} style={styles.pawIcon} />
        <Text style={styles.title}>
          {institutionId ? 'Patrocinar Instituição' : 'Doe para Instituições de Pets'}
        </Text>
        <Text style={styles.subtitle}>
          Sua ajuda faz a diferença na vida de muitos animais
        </Text>

        <Text style={styles.label}>Valor da doação</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o valor (mínimo R$10,00)"
          placeholderTextColor={COLORS.text}
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        <Text style={styles.helper}>Valor mínimo: R$10,00</Text>

        <View style={styles.presetsRow}>
          {presets.map((v) => (
            <TouchableOpacity
              key={v}
              accessibilityLabel={`Definir doação em R$${v},00`}
              style={styles.chip}
              onPress={() => setAmount(String(v))}
            >
              <Text style={styles.chipText}>R${v},00</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleDonate} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={COLORS.bg} />
          ) : (
            <View style={styles.buttonContent}>
              <FontAwesome name="heart" size={18} color={COLORS.bg} />
              <Text style={styles.buttonText}>{institutionId ? 'Patrocinar' : 'Fazer Doação'}</Text>
            </View>
          )}
        </TouchableOpacity>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <View style={styles.infoRow}>
          <FontAwesome name="shield" size={14} color={COLORS.text} />
          <Text style={styles.infoText}>Pagamento seguro e protegido.</Text>
        </View>
      </View>
    </View>
  );
}

function makeStyles(COLORS: any, focused: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 30,
      backgroundColor: COLORS.secondary,
    },
    header: {
      position: 'absolute',
      top: 20,
      left: 20,
    },
    backBtn: {
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 12,
      backgroundColor: COLORS.tertiary,
    },
    content: {
      width: '100%',
      borderRadius: 16,
      paddingVertical: 24,
      paddingHorizontal: 20,
      backgroundColor: COLORS.bg,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
    },
    pawIcon: {
      alignSelf: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      marginBottom: 10,
      textAlign: 'center',
      color: COLORS.primary,
    },
    subtitle: {
      fontSize: 16,
      marginBottom: 30,
      textAlign: 'center',
      color: COLORS.text,
    },
    label: {
      fontSize: 14,
      marginBottom: 8,
      fontWeight: '600',
      color: COLORS.text,
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderRadius: 10,
      padding: 15,
      fontSize: 18,
      marginBottom: 20,
      textAlign: 'center',
      borderColor: focused ? COLORS.primary : COLORS.tertiary,
      color: COLORS.text,
      backgroundColor: COLORS.secondary,
    },
    helper: {
      fontSize: 12,
      opacity: 0.7,
      textAlign: 'center',
      marginBottom: 16,
      color: COLORS.text,
    },
    presetsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      marginBottom: 18,
    },
    chip: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 999,
      marginHorizontal: 6,
      marginVertical: 4,
      backgroundColor: COLORS.tertiary,
    },
    chipText: {
      fontWeight: '700',
      color: COLORS.text,
    },
    button: {
      paddingVertical: 15,
      paddingHorizontal: 50,
      borderRadius: 30,
      marginBottom: 15,
      backgroundColor: COLORS.primary,
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    buttonText: {
      fontSize: 18,
      textAlign: 'center',
      color: COLORS.bg,
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      marginTop: 10,
      color: COLORS.primary,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginTop: 6,
    },
    infoText: {
      fontSize: 12,
      opacity: 0.8,
      color: COLORS.text,
    },
  });
}
