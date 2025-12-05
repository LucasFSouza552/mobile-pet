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
  ScrollView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Images } from '../../../../assets';
import { validateCPF, validateCNPJ } from '../../../utils/validation';
import { useTheme } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/types';
import RegisterProgress from '../../../components/RegisterProgress';

export default function RegisterStep3({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, FONT_SIZE } = useTheme();
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;
  const registerStepStyles = makeStyles(width, height, COLORS, FONT_SIZE);
  const {
    documentType,
    name,
    email,
    phone_number,
    password = '',
    confirmPassword = '',
    cpf,
    cnpj,
  } = route.params;
  const initialDocument = documentType === 'cpf' ? (cpf ?? '') : (cnpj ?? '');
  const [document, setDocument] = useState(initialDocument);
  const [documentError, setDocumentError] = useState<string | undefined>();
  const [documentTouched, setDocumentTouched] = useState(false);

  const formatCPF = (text: string): string => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 3) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
    } else if (numbers.length <= 9) {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
    } else {
      return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9, 11)}`;
    }
  };

  const formatCNPJ = (text: string): string => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 5) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    } else if (numbers.length <= 8) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5)}`;
    } else if (numbers.length <= 12) {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8)}`;
    } else {
      return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/${numbers.slice(8, 12)}-${numbers.slice(12, 14)}`;
    }
  };

  const handleDocumentChange = (text: string) => {
    const formatted = documentType === 'cpf' ? formatCPF(text) : formatCNPJ(text);
    setDocument(formatted);

    if (documentTouched) {
      const validation = documentType === 'cpf'
        ? validateCPF(formatted)
        : validateCNPJ(formatted);
      setDocumentError(validation.isValid ? undefined : validation.error);
    }
  };

  const handleDocumentBlur = () => {
    setDocumentTouched(true);
    const validation = documentType === 'cpf'
      ? validateCPF(document)
      : validateCNPJ(document);
    setDocumentError(validation.isValid ? undefined : validation.error);
  };

  const handleNext = () => {
    setDocumentTouched(true);
    const validation = documentType === 'cpf'
      ? validateCPF(document)
      : validateCNPJ(document);

    setDocumentError(validation.isValid ? undefined : validation.error);

    if (!validation.isValid) {
      return;
    }

    const documentData = documentType === 'cpf'
      ? { cpf: document, cnpj: undefined }
      : { cpf: undefined, cnpj: document };

    navigation.navigate('RegisterStep4', {
      documentType,
      name,
      email,
      phone_number,
      password,
      confirmPassword,
      ...documentData,
    });
  };

  const handleBack = () => {
    navigation.navigate('RegisterStep2', {
      documentType,
      name,
      email,
      phone_number,
      cpf: documentType === 'cpf' ? document : cpf,
      cnpj: documentType === 'cnpj' ? document : cnpj,
      password,
      confirmPassword,
    });
  };

  const documentValidation = documentType === 'cpf'
    ? validateCPF(document)
    : validateCNPJ(document);
  const isFormValid = documentValidation.isValid;

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
                  <Text style={registerStepStyles.headerSubtitle}>Quase lá!</Text>
                </View>

                <RegisterProgress 
                  currentStep={3} 
                  scale={scale} 
                  verticalScale={verticalScale} 
                  FONT_SIZE={FONT_SIZE} 
                />

                <View style={registerStepStyles.formContainer}>
                  <Text style={registerStepStyles.title}>
                    Informe seu {documentType.toUpperCase()}
                  </Text>

                  <View style={registerStepStyles.inputWrapper}>
                    <TextInput
                      style={[
                        registerStepStyles.input,
                        documentTouched && documentError && registerStepStyles.inputError
                      ]}
                      placeholder={documentType === 'cpf' ? 'CPF' : 'CNPJ'}
                      placeholderTextColor={COLORS.text + '80'}
                      value={document}
                      onChangeText={handleDocumentChange}
                      onBlur={handleDocumentBlur}
                      keyboardType="numeric"
                      returnKeyType="done"
                      maxLength={documentType === 'cpf' ? 14 : 18}
                      onSubmitEditing={handleNext}
                    />
                    {documentTouched && documentError && (
                      <Text style={registerStepStyles.errorText}>{documentError}</Text>
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

