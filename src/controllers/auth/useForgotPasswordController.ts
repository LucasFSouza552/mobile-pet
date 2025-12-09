import { useState, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authRemoteRepository } from '../../data/remote/repositories/authRemoteRepository';
import { useToast } from '../../hooks/useToast';

export function useForgotPasswordController() {
  const navigation = useNavigation<any>();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = useCallback((emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  }, []);

  const handleForgotPassword = useCallback(async () => {
    Keyboard.dismiss();
    
    if (!email.trim()) {
      toast.info('Por favor, informe seu email.');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Email inválido', 'Por favor, informe um email válido.');
      return;
    }

    try {
      setLoading(true);
      await authRemoteRepository.forgotPassword(email);
      setEmailSent(true);
      toast.success(
        'Email enviado!',
        'Verifique sua caixa de entrada para redefinir sua senha.'
      );
    } catch (error: any) {
      toast.handleApiError(
        error,
        error?.data?.message || 'Erro ao enviar email de recuperação.'
      );
    } finally {
      setLoading(false);
    }
  }, [email, validateEmail, toast]);

  const handleBackToLogin = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return {
    // Estados
    email,
    loading,
    emailSent,
    
    // Handlers
    setEmail,
    handleForgotPassword,
    handleBackToLogin,
  };
}

