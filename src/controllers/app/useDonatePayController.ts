import { useState, useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { accountRemoteRepository } from '../../data/remote/repositories/accountRemoteRepository';
import { IAccount } from '../../models/IAccount';
import { useToast } from '../../hooks/useToast';

interface DonatePayRouteParams {
  institution?: IAccount;
  petId?: string;
}

export function useDonatePayController() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const toast = useToast();

  const institution = route?.params?.institution as IAccount | undefined;

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCurrency = useCallback((value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (!numbers) return '';

    const cents = parseInt(numbers, 10);
    const reais = (cents / 100).toFixed(2);

    return reais.replace('.', ',');
  }, []);

  const handleAmountChange = useCallback((text: string) => {
    const formatted = formatCurrency(text);
    setAmount(formatted);
  }, [formatCurrency]);

  const handleDonate = useCallback(async () => {
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
      if (institution) {
        const response = await accountRemoteRepository.sponsorInstitution(institution.id, amountString);
        if (!response || !response.url) {
          throw new Error('Resposta inválida do servidor. URL de pagamento não encontrada.');
        }
        navigation.navigate('DonationWebView', { url: response.url });
      } else {
        const response = await accountRemoteRepository.donate(amountString);
        if (!response || !response.url) {
          throw new Error('Resposta inválida do servidor. URL de pagamento não encontrada.');
        }
        navigation.navigate('DonationWebView', { url: response.url });
      }

      setAmount('');
    } catch (error: any) {
      toast.error('Erro ao realizar doação', error.data?.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [amount, institution, toast, navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    // Estados
    institution,
    amount,
    loading,
    
    // Handlers
    handleAmountChange,
    handleDonate,
    handleBack,
  };
}

