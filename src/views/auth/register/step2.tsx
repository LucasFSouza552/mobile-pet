import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert,
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
import { Images } from '../../../../assets';
import { validateEmail, validatePhone } from '../../../utils/validation';
import { useTheme } from '../../../context/ThemeContext';

export default function RegisterStep2({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, FONT_SIZE } = useTheme();
  const registerStepStyles = createRegisterStepStyles(width, height, COLORS, FONT_SIZE);
  const {
    documentType,
    name,
    avatar,
    avatarFile,
    email: initialEmail = '',
    phone_number: initialPhone = '',
    cpf,
    cnpj,
    password,
    confirmPassword,
  } = route.params || {};
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

  useEffect(() => {
    if (!documentType || !name) {
      navigation.navigate('Register');
    }
  }, [documentType, name, navigation]);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  useEffect(() => {
    setPhone(initialPhone);
  }, [initialPhone]);

  const formatPhone = (text: string): string => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhone(text);
    setPhone(formatted);
    
    if (phoneTouched) {
      const validation = validatePhone(formatted);
      setPhoneError(validation.isValid ? undefined : validation.error);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    
    if (emailTouched) {
      const validation = validateEmail(text);
      setEmailError(validation.isValid ? undefined : validation.error);
    }
  };

  const handleEmailBlur = () => {
    setEmailTouched(true);
    const validation = validateEmail(email);
    setEmailError(validation.isValid ? undefined : validation.error);
  };

  const handlePhoneBlur = () => {
    setPhoneTouched(true);
    const validation = validatePhone(phone);
    setPhoneError(validation.isValid ? undefined : validation.error);
  };

  const handleNext = () => {
    setEmailTouched(true);
    setPhoneTouched(true);

    const emailValidation = validateEmail(email);
    const phoneValidation = validatePhone(phone);

    setEmailError(emailValidation.isValid ? undefined : emailValidation.error);
    setPhoneError(phoneValidation.isValid ? undefined : phoneValidation.error);

    if (!emailValidation.isValid || !phoneValidation.isValid) {
      return;
    }

    navigation.navigate('RegisterStep3', {
      documentType,
      name,
      avatar,
      avatarFile,
      email: email.trim(),
      phone_number: phone,
      cpf,
      cnpj,
      password,
      confirmPassword,
    });
  };

  const handleBack = () => {
    navigation.navigate('RegisterStep1', {
      documentType,
      name,
      avatar,
      avatarFile,
    });
  };

  const emailValidation = validateEmail(email);
  const phoneValidation = validatePhone(phone);
  const isFormValid = emailValidation.isValid && phoneValidation.isValid;

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
          <View style={registerStepStyles.header}>
            <Text style={registerStepStyles.headerTitle}>Registrar</Text>
            <Text style={registerStepStyles.headerSubtitle}>
              Agora, conte pra gente como podemos te encontrar.
            </Text>
          </View>

          <View style={registerStepStyles.progressContainer}>
            <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepCompleted]}>
              <FontAwesome name="check" size={FONT_SIZE.regular} color={COLORS.text} />
            </View>
            <View style={[registerStepStyles.progressLine, registerStepStyles.progressLineActive]} />
            <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepActive]}>
              <FontAwesome name="envelope" size={FONT_SIZE.regular} color={COLORS.text} />
            </View>
            <View style={registerStepStyles.progressLine} />
            <View style={registerStepStyles.progressStep}>
              <FontAwesome name="id-card" size={FONT_SIZE.regular} color={COLORS.text} style={{ opacity: 0.5 }} />
            </View>
            <View style={registerStepStyles.progressLine} />
            <View style={registerStepStyles.progressStep}>
              <FontAwesome name="lock" size={FONT_SIZE.regular} color={COLORS.text} style={{ opacity: 0.5 }} />
            </View>
          </View>

          <View style={registerStepStyles.formContainer}>
            <Text style={registerStepStyles.title}>Qual é o seu{'\n'}e-mail e telefone?</Text>

            <View style={registerStepStyles.inputWrapper}>
              <TextInput
                style={[
                  registerStepStyles.input,
                  emailTouched && emailError && registerStepStyles.inputError
                ]}
                placeholder="Email"
                placeholderTextColor={COLORS.text + '80'}
                value={email}
                onChangeText={handleEmailChange}
                onBlur={handleEmailBlur}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
              />
              {emailTouched && emailError && (
                <Text style={registerStepStyles.errorText}>{emailError}</Text>
              )}
            </View>

            <View style={registerStepStyles.inputWrapper}>
              <TextInput
                style={[
                  registerStepStyles.input,
                  phoneTouched && phoneError && registerStepStyles.inputError
                ]}
                placeholder="Telefone"
                placeholderTextColor={COLORS.text + '80'}
                value={phone}
                onChangeText={handlePhoneChange}
                onBlur={handlePhoneBlur}
                keyboardType="phone-pad"
                returnKeyType="done"
                maxLength={15}
                onSubmitEditing={handleNext}
              />
              {phoneTouched && phoneError && (
                <Text style={registerStepStyles.errorText}>{phoneError}</Text>
              )}
            </View>
          </View>

          <View style={registerStepStyles.buttonContainer}>
            <TouchableOpacity style={registerStepStyles.backButton} onPress={handleBack}>
              <Text style={registerStepStyles.backButtonText}>Voltar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                registerStepStyles.nextButton,
                !isFormValid && registerStepStyles.nextButtonDisabled
              ]} 
              onPress={handleNext}
              disabled={!isFormValid}
            >
              <Text style={registerStepStyles.nextButtonText}>Próximo</Text>
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

