import { useState, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { authRemoteRepository } from '../../data/remote/repositories/authRemoteRepository';
import { useAccount } from '../../context/AccountContext';
import { accountSync } from '../../data/sync/accountSync';
import { useToast } from '../../hooks/useToast';

export function useLoginController() {
  const navigation = useNavigation<any>();
  const { refreshAccount } = useAccount();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();
    
    if (!email || !password) {
      toast.info('Preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      const response = await authRemoteRepository.login(email, password);
      
      if (!response?.token) {
        toast.error('Email ou senha inválidos.');
        throw new Error('Email ou senha inválidos.');
      }
      
      await accountSync.syncFromServer();
      await refreshAccount();
      navigation.navigate('Main');
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Email ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  }, [email, password, toast, refreshAccount, navigation]);

  const handleRegister = useCallback(() => {
    navigation.navigate('Register');
  }, [navigation]);

  const handleForgotPassword = useCallback(() => {
    navigation.navigate('ForgotPassword');
  }, [navigation]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  return {
    // Estados
    email,
    password,
    showPassword,
    loading,
    
    // Handlers
    setEmail,
    setPassword,
    toggleShowPassword,
    handleLogin,
    handleRegister,
    handleForgotPassword,
  };
}

