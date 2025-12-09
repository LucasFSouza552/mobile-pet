import { useState, useEffect, useCallback } from 'react';
import { Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { authRemoteRepository } from '../../data/remote/repositories/authRemoteRepository';
import { useToast } from '../../hooks/useToast';

export function useResetPasswordController() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = route?.params?.token;
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      toast.error('Link expirado', 'Link de recuperação inválido.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
    }
  }, [route?.params?.token, toast, navigation]);

  const validatePassword = useCallback((passwordValue: string): boolean => {
    return passwordValue.length >= 8;
  }, []);

  const handleResetPassword = useCallback(async () => {
    Keyboard.dismiss();

    if (!password.trim()) {
      toast.info('Por favor, informe sua nova senha.');
      return;
    }

    if (!validatePassword(password)) {
      toast.error('Senha muito curta', 'A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (!confirmPassword.trim()) {
      toast.info('Por favor, confirme sua senha.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Senhas não coincidem', 'As senhas devem ser iguais.');
      return;
    }

    if (!token) {
      toast.error('Link inválido', 'Link de recuperação inválido.');
      return;
    }

    try {
      setLoading(true);
      await authRemoteRepository.resetPassword(token, password);
      toast.success('Senha redefinida!', 'Sua senha foi alterada com sucesso.');
      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (error: any) {
      toast.handleApiError(
        error,
        error?.data?.message || 'Erro ao redefinir senha. O link pode ter expirado.'
      );
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, token, validatePassword, toast, navigation]);

  const handleBackToLogin = useCallback(() => {
    navigation.navigate('Login');
  }, [navigation]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  return {
    // Estados
    password,
    confirmPassword,
    showPassword,
    showConfirmPassword,
    loading,
    token,
    
    // Handlers
    setPassword,
    setConfirmPassword,
    toggleShowPassword,
    toggleShowConfirmPassword,
    handleResetPassword,
    handleBackToLogin,
  };
}

