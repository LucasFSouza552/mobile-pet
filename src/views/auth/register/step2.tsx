import React, { useState } from 'react';
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

export default function RegisterStep2({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const registerStepStyles = createRegisterStepStyles(width, height);
  const { documentType, name, avatar, avatarFile } = route.params;
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);

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
    });
  };

  const handleBack = () => {
    navigation.goBack();
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
          {/* Header */}
          <View style={registerStepStyles.header}>
            <Text style={registerStepStyles.headerTitle}>Registrar</Text>
            <Text style={registerStepStyles.headerSubtitle}>
              Agora, conte pra gente como podemos te encontrar.
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={registerStepStyles.progressContainer}>
            <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepCompleted]}>
              <FontAwesome name="check" size={20} color="#fff" />
            </View>
            <View style={[registerStepStyles.progressLine, registerStepStyles.progressLineActive]} />
            <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepActive]}>
              <FontAwesome name="envelope" size={20} color="#fff" />
            </View>
            <View style={registerStepStyles.progressLine} />
            <View style={registerStepStyles.progressStep}>
              <FontAwesome name="id-card" size={20} color="#666" />
            </View>
            <View style={registerStepStyles.progressLine} />
            <View style={registerStepStyles.progressStep}>
              <FontAwesome name="lock" size={20} color="#666" />
            </View>
          </View>

          {/* Form */}
          <View style={registerStepStyles.formContainer}>
            <Text style={registerStepStyles.title}>Qual é o seu{'\n'}e-mail e telefone?</Text>

            {/* Email Input */}
            <View style={registerStepStyles.inputWrapper}>
              <TextInput
                style={[
                  registerStepStyles.input,
                  emailTouched && emailError && registerStepStyles.inputError
                ]}
                placeholder="Email"
                placeholderTextColor="#999999"
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

            {/* Phone Input */}
            <View style={registerStepStyles.inputWrapper}>
              <TextInput
                style={[
                  registerStepStyles.input,
                  phoneTouched && phoneError && registerStepStyles.inputError
                ]}
                placeholder="Telefone"
                placeholderTextColor="#999999"
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

          {/* Buttons */}
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

