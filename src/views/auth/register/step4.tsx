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
import { validatePassword, validatePasswordConfirmation } from '../../../utils/validation';

export default function RegisterStep4({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const registerStepStyles = createRegisterStepStyles(width, height);
  const {
    documentType,
    name,
    avatar,
    avatarFile,
    email,
    phone_number,
    cpf,
    cnpj,
    password: initialPassword = '',
    confirmPassword: initialConfirmPassword = '',
  } = route.params;
  const [password, setPassword] = useState(initialPassword);
  const [confirmPassword, setConfirmPassword] = useState(initialConfirmPassword);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | undefined>();
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);
  const { refreshAccount } = useAccount();
  const toast = useToast();
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (passwordTouched) {
      const validation = validatePassword(value);
      setPasswordError(validation.isValid ? undefined : validation.error);

      if (confirmPasswordTouched) {
        const confirmValidation = validatePasswordConfirmation(value, confirmPassword);
        setConfirmPasswordError(confirmValidation.isValid ? undefined : confirmValidation.error);
      }
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (confirmPasswordTouched) {
      const validation = validatePasswordConfirmation(password, value);
      setConfirmPasswordError(validation.isValid ? undefined : validation.error);
    }
  };

  const handlePasswordBlur = () => {
    setPasswordTouched(true);
    const validation = validatePassword(password);
    setPasswordError(validation.isValid ? undefined : validation.error);
  };

  const handleConfirmPasswordBlur = () => {
    setConfirmPasswordTouched(true);
    const validation = validatePasswordConfirmation(password, confirmPassword);
    setConfirmPasswordError(validation.isValid ? undefined : validation.error);
  };

  const handleRegister = async () => {
    setPasswordTouched(true);
    setConfirmPasswordTouched(true);

    const passwordValidation = validatePassword(password);
    const confirmValidation = validatePasswordConfirmation(password, confirmPassword);

    setPasswordError(passwordValidation.isValid ? undefined : passwordValidation.error);
    setConfirmPasswordError(confirmValidation.isValid ? undefined : confirmValidation.error);

    if (!passwordValidation.isValid || !confirmValidation.isValid) {
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
    navigation.navigate('RegisterStep3', {
      documentType,
      name,
      avatar,
      avatarFile,
      email,
      phone_number,
      cpf,
      cnpj,
      password,
      confirmPassword,
    });
  };

  const passwordValidation = validatePassword(password);
  const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
  const isFormValid = passwordValidation.isValid && confirmValidation.isValid;

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
                  <View style={registerStepStyles.inputWrapper}>
                    <View style={[
                      registerStepStyles.passwordContainer,
                      passwordTouched && passwordError && registerStepStyles.passwordContainerError
                    ]}>
                      <TextInput
                        style={registerStepStyles.passwordInput}
                        placeholder="Senha"
                        placeholderTextColor="#999999"
                        value={password}
                        onChangeText={handlePasswordChange}
                        onBlur={handlePasswordBlur}
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
                    {passwordTouched && passwordError && (
                      <Text style={registerStepStyles.errorText}>{passwordError}</Text>
                    )}
                    {password.length > 0 && password.length < 8 && !passwordError && (
                      <Text style={registerStepStyles.hintText}>
                        A senha deve ter no mínimo 8 caracteres e conter letras e números
                      </Text>
                    )}
                  </View>

                  {/* Confirm Password Input */}
                  <View style={registerStepStyles.inputWrapper}>
                    <View style={[
                      registerStepStyles.passwordContainer,
                      confirmPasswordTouched && confirmPasswordError && registerStepStyles.passwordContainerError
                    ]}>
                      <TextInput
                        style={registerStepStyles.passwordInput}
                        placeholder="Confirme sua senha"
                        placeholderTextColor="#999999"
                        value={confirmPassword}
                        onChangeText={handleConfirmPasswordChange}
                        onBlur={handleConfirmPasswordBlur}
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
                    {confirmPasswordTouched && confirmPasswordError && (
                      <Text style={registerStepStyles.errorText}>{confirmPasswordError}</Text>
                    )}
                  </View>
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

