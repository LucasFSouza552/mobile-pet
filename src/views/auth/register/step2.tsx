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

export default function RegisterStep2({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const registerStepStyles = createRegisterStepStyles(width, height);
  const { documentType, name, avatar } = route.params;
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

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
  };

  const handleNext = () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Por favor, informe seu e-mail.');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Atenção', 'Por favor, informe um e-mail válido.');
      return;
    }

    if (!phone.trim()) {
      Alert.alert('Atenção', 'Por favor, informe seu telefone.');
      return;
    }

    const phoneNumbers = phone.replace(/\D/g, '');
    if (phoneNumbers.length < 10) {
      Alert.alert('Atenção', 'Por favor, informe um telefone válido.');
      return;
    }

    navigation.navigate('RegisterStep3', {
      documentType,
      name,
      avatar,
      email: email.trim(),
      phone_number: phone,
    });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const isFormValid = email.trim() !== '' && phone.trim() !== '' && validateEmail(email);

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
            <TextInput
              style={registerStepStyles.input}
              placeholder="Email"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />

            {/* Phone Input */}
            <TextInput
              style={registerStepStyles.input}
              placeholder="Telefone"
              placeholderTextColor="#999999"
              value={phone}
              onChangeText={handlePhoneChange}
              keyboardType="phone-pad"
              returnKeyType="done"
              maxLength={15}
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

