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
import { validateCPF, validateCNPJ } from '../../../utils/validation';

export default function RegisterStep3({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const registerStepStyles = createRegisterStepStyles(width, height);
  const {
    documentType,
    name,
    avatar,
    avatarFile,
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
      avatar,
      avatarFile,
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
      avatar,
      avatarFile,
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
                {/* Header */}
                <View style={registerStepStyles.header}>
                  <Text style={registerStepStyles.headerTitle}>Registrar</Text>
                  <Text style={registerStepStyles.headerSubtitle}>Quase lá!</Text>
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
                  <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepActive]}>
                    <FontAwesome name="id-card" size={20} color="#fff" />
                  </View>
                  <View style={registerStepStyles.progressLine} />
                  <View style={registerStepStyles.progressStep}>
                    <FontAwesome name="lock" size={20} color="#666" />
                  </View>
                </View>

                {/* Form */}
                <View style={registerStepStyles.formContainer}>
                  <Text style={registerStepStyles.title}>
                    Informe seu {documentType.toUpperCase()}
                  </Text>

                  {/* Document Input */}
                  <View style={registerStepStyles.inputWrapper}>
                    <TextInput
                      style={[
                        registerStepStyles.input,
                        documentTouched && documentError && registerStepStyles.inputError
                      ]}
                      placeholder={documentType === 'cpf' ? 'CPF' : 'CNPJ'}
                      placeholderTextColor="#999999"
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

