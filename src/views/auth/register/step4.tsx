import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  ScrollView
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { createRegisterStepStyles } from '../../../styles/pagesStyles/registerStepStyles';
import { authRemoteRepository } from '../../../data/remote/repositories/authRemoteRepository';
import { accountRemoteRepository } from '../../../data/remote/repositories/accountRemoteRepository';
import { IAccount } from '../../../models/IAccount';
import { ITypeAccounts } from '../../../models/ITypeAccounts';
import { accountSync } from '../../../data/sync/accountSync';
import { useAccount } from '../../../context/AccountContext';
import { Images } from '../../../../assets';
import { useToast } from '../../../hooks/useToast';

export default function RegisterStep4({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const registerStepStyles = createRegisterStepStyles(width, height);
  const { documentType, name, avatar, avatarFile, email, phone_number, cpf, cnpj } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { refreshAccount } = useAccount();
  const toast = useToast();
  const handleRegister = async () => {
    if (!password.trim()) {
      toast.info('Por favor, informe sua senha.');
      return;
    }

    if (password.length < 8) {
      toast.info('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    if (!confirmPassword.trim()) {
      toast.info('Por favor, confirme sua senha.');
      return;
    }

    if (password !== confirmPassword) {
      toast.info('As senhas não coincidem.');
      return;
    }

    try {
      setLoading(true);

      const role: ITypeAccounts = documentType === 'cnpj' ? 'institution' : 'user';

      const accountData: IAccount = {
        name,
        email,
        phone_number,
        role,
        cpf: cpf?.replaceAll("-", "")?.replaceAll(".", "") || undefined,
        cnpj: cnpj || undefined,
        lastSyncedAt: "",
        postCount: 0
      } as IAccount;

      const registerData = {
        ...accountData,
        password,
      };

      await authRemoteRepository.register(registerData as any);
      
      if (avatarFile && avatar) {
        try {
          const formData = new FormData();
          formData.append('avatar', {
            uri: avatar,
            type: avatarFile.mimeType || avatarFile.type || 'image/jpeg',
            name: avatarFile.fileName || `avatar_${Date.now()}.jpg`,
          } as any);
          
          await accountRemoteRepository.uploadAvatar(formData);
        } catch (avatarError: any) {
          console.error('Erro ao fazer upload do avatar:', avatarError);
          toast.info('Conta criada, mas houve um erro ao fazer upload da foto. Você pode adicionar uma foto depois no perfil.');
        }
      }
      
      await accountSync.syncFromServer();
      await refreshAccount();

      toast.success('Cadastro realizado com sucesso!');

      navigation.replace("Login");

    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao realizar cadastro. Tente novamente.');
      return;
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFormValid =
    password.trim() !== '' &&
    confirmPassword.trim() !== '' &&
    password === confirmPassword &&
    password.length >= 8;

  return (
    <View style={registerStepStyles.container}>
      <Image
        source={Images.petfundo}
        style={registerStepStyles.backgroundImage}
        resizeMode="cover"
      />

      <SafeAreaView style={registerStepStyles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={registerStepStyles.content}>
                {/* Header */}
                <View style={registerStepStyles.header}>
                  <Text style={registerStepStyles.headerTitle}>Registrar</Text>
                  <Text style={registerStepStyles.headerSubtitle}>
                    Por fim, proteja a seu espaço!
                  </Text>
                </View>

                {/* Progress Indicator */}
                <View style={registerStepStyles.progressContainer}>
                  <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepCompleted]}>
                    <FontAwesome name="check" size={20} color="#fff" />
                  </View>
                  <View style={[registerStepStyles.progressLine, registerStepStyles.progressLineActive]} />
                  <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepCompleted]}>
                    <FontAwesome name="check" size={20} color="#fff" />
                  </View>
                  <View style={[registerStepStyles.progressLine, registerStepStyles.progressLineActive]} />
                  <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepCompleted]}>
                    <FontAwesome name="check" size={20} color="#fff" />
                  </View>
                  <View style={[registerStepStyles.progressLine, registerStepStyles.progressLineActive]} />
                  <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepActive]}>
                    <FontAwesome name="lock" size={20} color="#fff" />
                  </View>
                </View>

                {/* Form */}
                <View style={registerStepStyles.formContainer}>
                  <Text style={registerStepStyles.title}>
                    Crie uma senha{'\n'}forte
                  </Text>

                  {/* Password Input */}
                  <View style={registerStepStyles.passwordContainer}>
                    <TextInput
                      style={registerStepStyles.passwordInput}
                      placeholder="Senha"
                      placeholderTextColor="#999999"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      returnKeyType="next"
                    />
                    <TouchableOpacity
                      style={registerStepStyles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <FontAwesome
                        name={showPassword ? "eye" : "eye-slash"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Confirm Password Input */}
                  <View style={registerStepStyles.passwordContainer}>
                    <TextInput
                      style={registerStepStyles.passwordInput}
                      placeholder="Confirme sua senha"
                      placeholderTextColor="#999999"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                    />
                    <TouchableOpacity
                      style={registerStepStyles.eyeButton}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <FontAwesome
                        name={showConfirmPassword ? "eye" : "eye-slash"}
                        size={20}
                        color="#999"
                      />
                    </TouchableOpacity>
                  </View>

                  {password.length > 0 && password.length < 8 && (
                    <Text style={registerStepStyles.hintText}>
                      A senha deve ter no mínimo 8 caracteres
                    </Text>
                  )}

                  {password.length >= 8 && confirmPassword.length > 0 && password !== confirmPassword && (
                    <Text style={registerStepStyles.errorHintText}>
                      As senhas não coincidem
                    </Text>
                  )}
                </View>

                {/* Buttons */}
                <View style={registerStepStyles.buttonContainer}>
                  <TouchableOpacity
                    style={registerStepStyles.backButton}
                    onPress={handleBack}
                    disabled={loading}
                  >
                    <Text style={registerStepStyles.backButtonText}>Voltar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      registerStepStyles.nextButton,
                      (!isFormValid || loading) && registerStepStyles.nextButtonDisabled
                    ]}
                    onPress={handleRegister}
                    disabled={!isFormValid || loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={registerStepStyles.nextButtonText}>Próximo</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

