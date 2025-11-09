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

export default function RegisterStep3({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const registerStepStyles = createRegisterStepStyles(width, height);
  const { documentType, name, avatar, email, phone_number } = route.params;
  const [document, setDocument] = useState('');

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
  };

  const validateCPF = (cpf: string): boolean => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
  };

  const validateCNPJ = (cnpj: string): boolean => {
    const numbers = cnpj.replace(/\D/g, '');
    return numbers.length === 14;
  };

  const handleNext = () => {
    if (!document.trim()) {
      Alert.alert('Atenção', `Por favor, informe seu ${documentType.toUpperCase()}.`);
      return;
    }

    const isValid = documentType === 'cpf' ? validateCPF(document) : validateCNPJ(document);
    if (!isValid) {
      Alert.alert('Atenção', `Por favor, informe um ${documentType.toUpperCase()} válido.`);
      return;
    }

    const documentData = documentType === 'cpf' 
      ? { cpf: document, cnpj: undefined }
      : { cpf: undefined, cnpj: document };

    navigation.navigate('RegisterStep4', {
      documentType,
      name,
      avatar,
      email,
      phone_number,
      ...documentData,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFormValid = document.trim() !== '' && 
    (documentType === 'cpf' ? validateCPF(document) : validateCNPJ(document));

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
            <TextInput
              style={registerStepStyles.input}
              placeholder={documentType === 'cpf' ? 'CPF' : 'CNPJ'}
              placeholderTextColor="#999999"
              value={document}
              onChangeText={handleDocumentChange}
              keyboardType="numeric"
              returnKeyType="done"
              maxLength={documentType === 'cpf' ? 14 : 18}
              onSubmitEditing={handleNext}
            />
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

