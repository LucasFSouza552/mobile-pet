import { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAccount } from '../../context/AccountContext';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { accountRemoteRepository } from '../../data/remote/repositories/accountRemoteRepository';
import { authRemoteRepository } from '../../data/remote/repositories/authRemoteRepository';
import { IAccount } from '../../models/IAccount';
import { useToast } from '../../hooks/useToast';
import { validateName, validatePhone, validatePassword, validatePasswordConfirmation, validateCEP } from '../../utils/validation';
import { useEditProfileReducer } from '../../views/app/profile/useEditProfileReducer';

export function useEditProfileController() {
  const navigation = useNavigation<any>();
  const { account, loading: accountLoading, refreshAccount } = useAccount();
  const toast = useToast();

  const {
    state,
    setFormData,
    updateFormField,
    setAddress,
    updateAddressField,
    updatePasswordField,
    setAvatarPreview,
    setLoading,
    toggleShowPassword,
    handleAvatarChange,
  } = useEditProfileReducer();

  const { formData, address, password, avatarPreview, avatarFile, loading, showPassword } = state;

  useEffect(() => {
    if (account) {
      setFormData({ ...account });
      setAddress(
        account.address || {
          street: '',
          number: '',
          complement: '',
          city: '',
          cep: '',
          state: '',
          neighborhood: '',
        }
      );
      const avatarSource = pictureRepository.getSource(account.avatar);
      if (typeof avatarSource === 'object' && 'uri' in avatarSource) {
        setAvatarPreview(avatarSource.uri || null);
      }
    }
  }, [account, setFormData, setAddress, setAvatarPreview]);

  const handleSubmit = useCallback(async () => {
    const displayFormData = formData || account;
    if (!displayFormData) return;

    setLoading(true);

    try {
      const nameValidation = validateName(displayFormData.name || '');
      if (!nameValidation.isValid) {
        toast.error('Validação', nameValidation.error || 'Nome é obrigatório');
        return;
      }

      if (displayFormData.phone_number) {
        const phoneValidation = validatePhone(displayFormData.phone_number);
        if (!phoneValidation.isValid) {
          toast.error('Validação', phoneValidation.error || 'Telefone inválido');
          return;
        }
      }

      if (address.cep) {
        const cepValidation = validateCEP(address.cep);
        if (!cepValidation.isValid) {
          toast.error('Validação', cepValidation.error || 'CEP inválido');
          return;
        }
      }

      if (password.new || password.current || password.confirm) {
        if (!password.current) {
          toast.error('Senha atual obrigatória', 'Digite sua senha atual para alterar a senha');
          return;
        }

        const passwordValidation = validatePassword(password.new, 6);
        if (!passwordValidation.isValid) {
          toast.error('Validação', passwordValidation.error || 'Senha inválida');
          return;
        }

        const confirmValidation = validatePasswordConfirmation(password.new, password.confirm);
        if (!confirmValidation.isValid) {
          toast.error('Validação', confirmValidation.error || 'As senhas não coincidem');
          return;
        }

        try {
          await authRemoteRepository.changePassword(
            password.current,
            password.new
          );
        } catch (error: any) {
          toast.handleApiError(error, error?.data?.message || 'Erro ao alterar senha');
          return;
        }
      }

      if (avatarFile) {
        try {
          const formDataAvatar = new FormData();
          formDataAvatar.append('avatar', {
            uri: avatarFile.uri,
            type: avatarFile.mimeType || avatarFile.type || 'image/jpeg',
            name: avatarFile.fileName || `avatar_${Date.now()}.jpg`,
          } as any);

          await accountRemoteRepository.uploadAvatar(formDataAvatar);
        } catch (error: any) {
          toast.handleApiError(error, error?.data?.message || 'Erro ao fazer upload da foto');
          return;
        }
      }

      try {
        const updateData: Partial<IAccount> = {
          name: displayFormData.name,
          phone_number: displayFormData.phone_number,
          address: address,
        };

        await accountRemoteRepository.updateAccount(updateData as IAccount);
      } catch (error: any) {
        toast.handleApiError(error, error?.data?.message || 'Erro ao atualizar dados do perfil');
        return;
      }

      await refreshAccount();

      toast.success('Perfil atualizado com sucesso!');

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  }, [formData, account, address, password, avatarFile, setLoading, toast, refreshAccount, navigation]);

  return {
    // Estados
    formData,
    address,
    password,
    avatarPreview,
    loading,
    accountLoading,
    showPassword,
    
    // Handlers
    updateFormField,
    updateAddressField,
    updatePasswordField,
    toggleShowPassword,
    handleAvatarChange,
    handleSubmit,
  };
}

