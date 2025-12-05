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
  ScrollView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Images } from '../../../../assets';
import { validateEmail, validatePhone } from '../../../utils/validation';
import { useTheme } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/types';
import RegisterProgress from '../../../components/RegisterProgress';

export default function RegisterStep2({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, FONT_SIZE } = useTheme();
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;
  const registerStepStyles = makeStyles(width, height, COLORS, FONT_SIZE);
  const {
    documentType,
    name,
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

          <RegisterProgress 
            currentStep={2} 
            scale={scale} 
            verticalScale={verticalScale} 
            FONT_SIZE={FONT_SIZE} 
          />

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

function makeStyles(
  width: number,
  height: number,
  COLORS: ThemeColors,
  FONT_SIZE: { regular: number; medium: number; large: number }
) {
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.quarternary,
    },
    backgroundImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0.3,
    },
    safeArea: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: scale(30),
      paddingTop: verticalScale(20),
    },
    header: {
      alignItems: 'center',
      marginBottom: verticalScale(20),
    },
    headerTitle: {
      fontSize: FONT_SIZE.large,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: verticalScale(5),
    },
    headerSubtitle: {
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      opacity: 0.8,
      textAlign: 'center',
    },
    formContainer: {
      flex: 1,
      alignItems: 'center',
      marginTop: verticalScale(20),
    },
    title: {
      fontSize: FONT_SIZE.medium,
      fontWeight: 'bold',
      color: COLORS.text,
      textAlign: 'center',
      marginBottom: verticalScale(40),
      lineHeight: scale(32),
    },
    inputWrapper: {
      width: '100%',
      marginBottom: verticalScale(5),
    },
    input: {
      width: '100%',
      height: verticalScale(55),
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderRadius: scale(10),
      paddingHorizontal: scale(20),
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      marginBottom: verticalScale(5),
    },
    inputError: {
      borderColor: COLORS.error,
      borderWidth: 2,
    },
    errorText: {
      fontSize: FONT_SIZE.regular * 0.85,
      color: COLORS.error,
      marginTop: verticalScale(-5),
      marginBottom: verticalScale(10),
      marginLeft: scale(5),
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: verticalScale(30),
      width: '100%',
    },
    backButton: {
      paddingVertical: verticalScale(15),
      paddingHorizontal: scale(30),
    },
    backButtonText: {
      fontSize: FONT_SIZE.medium,
      fontWeight: 'bold',
      color: COLORS.text,
    },
    nextButton: {
      backgroundColor: COLORS.primary,
      paddingVertical: verticalScale(15),
      paddingHorizontal: scale(40),
      borderRadius: scale(25),
      minWidth: scale(140),
      alignItems: 'center',
    },
    nextButtonDisabled: {
      backgroundColor: COLORS.tertiary,
      opacity: 0.5,
    },
    nextButtonText: {
      fontSize: FONT_SIZE.medium,
      fontWeight: 'bold',
      color: COLORS.text,
    },
  });
}

