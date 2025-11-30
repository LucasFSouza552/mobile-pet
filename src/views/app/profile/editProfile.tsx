import React, { useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAccount } from '../../../context/AccountContext';
import { useTheme } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/types';
import { pictureRepository } from '../../../data/remote/repositories/pictureRemoteRepository';
import { accountRemoteRepository } from '../../../data/remote/repositories/accountRemoteRepository';
import { authRemoteRepository } from '../../../data/remote/repositories/authRemoteRepository';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useToast } from '../../../hooks/useToast';
import { IAccount } from '../../../models/IAccount';
import IAddress from '../../../models/IAddress';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import { validateName, validatePhone, validatePassword, validatePasswordConfirmation, validateCEP } from '../../../utils/validation';
import { useEditProfileReducer } from './useEditProfileReducer';

interface EditProfileProps {
  navigation: any;
}

export default function EditProfile({ navigation }: EditProfileProps) {
  const { account, loading: accountLoading, refreshAccount } = useAccount();
  const { COLORS } = useTheme();
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

  const handleSubmit = async () => {
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
  };

  const styles = makeStyles(COLORS);

  if (accountLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando...</Text>
      </SafeAreaView>
    );
  }

  if (!account) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <Text style={styles.loadingText}>Conta não encontrada</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const displayFormData = formData || account;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <FontAwesome name="arrow-left" size={20} color={COLORS.primary} />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Editar Perfil</Text>
          </View>

          <View style={styles.avatarSection}>
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleAvatarChange}
            >
              <Image
                source={
                  avatarPreview
                    ? { uri: avatarPreview }
                    : pictureRepository.getSource(account.avatar)
                }
                style={styles.avatarImage}
              />
              <View style={styles.avatarOverlay}>
                <MaterialCommunityIcons
                  name="camera"
                  size={30}
                  color="#fff"
                />
                <Text style={styles.avatarOverlayText}>Alterar foto</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor={COLORS.text + '80'}
                value={displayFormData.name || ''}
                onChangeText={(value) => updateFormField('name', value)}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                placeholder="seu@email.com"
                placeholderTextColor={COLORS.text + '80'}
                value={displayFormData.email || ''}
                editable={false}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.disabledHint}>O e-mail não pode ser alterado</Text>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Telefone</Text>
              <TextInput
                style={styles.input}
                placeholder="(00) 00000-0000"
                placeholderTextColor={COLORS.text + '80'}
                value={displayFormData.phone_number || ''}
                onChangeText={(value) => updateFormField('phone_number', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Endereço</Text>

            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>CEP</Text>
                <TextInput
                  style={styles.input}
                  placeholder="00000-000"
                  placeholderTextColor={COLORS.text + '80'}
                  value={address.cep || ''}
                  onChangeText={(value) => updateAddressField('cep', value)}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 0.5 }]}>
                <Text style={styles.inputLabel}>Estado</Text>
                <TextInput
                  style={styles.input}
                  placeholder="UF"
                  placeholderTextColor={COLORS.text + '80'}
                  value={address.state || ''}
                  onChangeText={(value) => updateAddressField('state', value)}
                  maxLength={2}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Cidade</Text>
              <TextInput
                style={styles.input}
                placeholder="Sua cidade"
                placeholderTextColor={COLORS.text + '80'}
                value={address.city || ''}
                onChangeText={(value) => updateAddressField('city', value)}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Bairro</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu bairro"
                placeholderTextColor={COLORS.text + '80'}
                value={address.neighborhood || ''}
                onChangeText={(value) => updateAddressField('neighborhood', value)}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Rua</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome da rua"
                  placeholderTextColor={COLORS.text + '80'}
                  value={address.street || ''}
                  onChangeText={(value) => updateAddressField('street', value)}
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 0.5 }]}>
                <Text style={styles.inputLabel}>Número</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000"
                  placeholderTextColor={COLORS.text + '80'}
                  value={address.number || ''}
                  onChangeText={(value) => updateAddressField('number', value)}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Complemento</Text>
              <TextInput
                style={styles.input}
                placeholder="Apartamento, bloco, etc. (opcional)"
                placeholderTextColor={COLORS.text + '80'}
                value={address.complement || ''}
                onChangeText={(value) => updateAddressField('complement', value)}
              />
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Alterar Senha (opcional)</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Senha Atual</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite sua senha atual"
                  placeholderTextColor={COLORS.text + '80'}
                  value={password.current}
                  onChangeText={(value) => updatePasswordField('current', value)}
                  secureTextEntry={!showPassword.current}
                />
                <TouchableOpacity
                  onPress={() => toggleShowPassword('current')}
                  style={styles.eyeIcon}
                >
                  <FontAwesome
                    name={showPassword.current ? 'eye' : 'eye-slash'}
                    size={20}
                    color={COLORS.text + '80'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Nova Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Digite sua nova senha"
                  placeholderTextColor={COLORS.text + '80'}
                  value={password.new}
                  onChangeText={(value) => updatePasswordField('new', value)}
                  secureTextEntry={!showPassword.new}
                />
                <TouchableOpacity
                  onPress={() => toggleShowPassword('new')}
                  style={styles.eyeIcon}
                >
                  <FontAwesome
                    name={showPassword.new ? 'eye' : 'eye-slash'}
                    size={20}
                    color={COLORS.text + '80'}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirme sua nova senha"
                  placeholderTextColor={COLORS.text + '80'}
                  value={password.confirm}
                  onChangeText={(value) => updatePasswordField('confirm', value)}
                  secureTextEntry={!showPassword.confirm}
                />
                <TouchableOpacity
                  onPress={() => toggleShowPassword('confirm')}
                  style={styles.eyeIcon}
                >
                  <FontAwesome
                    name={showPassword.confirm ? 'eye' : 'eye-slash'}
                    size={20}
                    color={COLORS.text + '80'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <PrimaryButton
              text={loading ? 'Salvando...' : 'Salvar Alterações'}
              onPress={handleSubmit}
            />
            <SecondaryButton
              text="Cancelar"
              onPress={() => navigation.goBack()}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
    },
    loadingContainer: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: COLORS.text,
      fontSize: 16,
      marginTop: 12,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      gap: 12,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: COLORS.primary,
    },
    backButtonText: {
      color: COLORS.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      flex: 1,
    },
    avatarSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    avatarContainer: {
      position: 'relative',
      width: 150,
      height: 150,
      borderRadius: 75,
      overflow: 'hidden',
      borderWidth: 5,
      borderColor: COLORS.primary,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
      backgroundColor: COLORS.iconBackground,
    },
    avatarOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: COLORS.iconBackground + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarOverlayText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '500',
      marginTop: 4,
    },
    formSection: {
      backgroundColor: COLORS.quarternary,
      borderRadius: 15,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: COLORS.primary + '30',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.primary,
      marginBottom: 16,
      paddingBottom: 8,
      borderBottomWidth: 2,
      borderBottomColor: COLORS.primary + '40',
    },
    inputWrapper: {
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: COLORS.tertiary,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: COLORS.text,
      fontSize: 16,
      borderWidth: 1,
      borderColor: COLORS.primary + '20',
    },
    inputDisabled: {
      backgroundColor: COLORS.tertiary + '80',
      opacity: 0.6,
    },
    disabledHint: {
      fontSize: 12,
      color: COLORS.text,
      marginTop: 4,
      fontStyle: 'italic',
    },
    row: {
      flexDirection: 'row',
      gap: 8,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.tertiary,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.primary + '20',
    },
    passwordInput: {
      flex: 1,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: COLORS.text,
      fontSize: 16,
    },
    eyeIcon: {
      padding: 12,
    },
    buttonContainer: {
      gap: 12,
      marginTop: 8,
    },
  });
}

