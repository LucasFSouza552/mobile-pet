import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ScrollView, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { registerFormStyles as styles } from '../../styles/pagesStyles/registerFormStyles';

interface RegisterFormData {
  document: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface FormErrors {
  document?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export default function RegisterForm({ navigation, route }: any) {
  const { documentType } = route.params;
  
  const scrollViewRef = useRef<ScrollView>(null);
  const documentRef = useRef<TextInput>(null);
  const fullNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const cityRef = useRef<TextInput>(null);
  const stateRef = useRef<TextInput>(null);
  const zipCodeRef = useRef<TextInput>(null);
  
  const [formData, setFormData] = useState<RegisterFormData>({
    document: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateCPF = (cpf: string): boolean => {
    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    return cpfRegex.test(cpf);
  };

  const validateCNPJ = (cnpj: string): boolean => {
    const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
    return cnpjRegex.test(cnpj);
  };

  const formatPhone = (text: string): string => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const formatZipCode = (text: string): string => {
    const numbers = text.replace(/\D/g, '');
    if (numbers.length <= 5) {
      return numbers;
    } else {
      return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
    }
  };

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

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.document.trim()) {
      newErrors.document = `${documentType?.toUpperCase()} é obrigatório`;
    } else if (documentType === 'cpf' && !validateCPF(formData.document)) {
      newErrors.document = 'CPF inválido';
    } else if (documentType === 'cnpj' && !validateCNPJ(formData.document)) {
      newErrors.document = 'CNPJ inválido';
    }

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Nome completo é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Endereço é obrigatório';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'Cidade é obrigatória';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'Estado é obrigatório';
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'CEP é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const scrollToInput = (inputRef: React.RefObject<TextInput | null>) => {
    setTimeout(() => {
      inputRef.current?.measureInWindow((x, y, width, height) => {
        const scrollOffset = y - 200; // Offset para deixar o campo visível
        scrollViewRef.current?.scrollTo({
          y: Math.max(0, scrollOffset),
          animated: true,
        });
      });
    }, 100);
  };

  const handleInputFocus = (inputRef: React.RefObject<TextInput | null>) => {
    scrollToInput(inputRef);
  };


  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);

      // Solicitar permissão de localização
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'Para usar sua localização atual, é necessário permitir o acesso à localização nas configurações do aplicativo.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Obter localização atual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Fazer geocoding reverso para obter o endereço
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        
        // Preencher os campos com os dados obtidos
        setFormData(prev => ({
          ...prev,
          address: `${address.street || ''} ${address.streetNumber || ''}`.trim(),
          city: address.city || '',
          state: address.region || '',
          zipCode: address.postalCode || '',
        }));

        // Limpar erros dos campos preenchidos
        setErrors(prev => ({
          ...prev,
          address: undefined,
          city: undefined,
          state: undefined,
          zipCode: undefined,
        }));

        Alert.alert(
          'Localização encontrada',
          'Seu endereço foi preenchido automaticamente com base na sua localização atual.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Erro ao obter localização:', error);
      Alert.alert(
        'Erro',
        'Não foi possível obter sua localização atual. Verifique se a localização está habilitada.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleInputChange = (field: keyof RegisterFormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'document') {
      if (documentType === 'cpf') {
        formattedValue = formatCPF(value);
      } else if (documentType === 'cnpj') {
        formattedValue = formatCNPJ(value);
      }
    } else if (field === 'phone') {
      formattedValue = formatPhone(value);
    } else if (field === 'zipCode') {
      formattedValue = formatZipCode(value);
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleRegister = () => {
    if (validateForm()) {
      console.log('Register data:', { documentType, ...formData });
      // Aqui você pode navegar para a próxima etapa ou processar o registro
      // navigation.navigate('NextStep', { documentType, formData });
    }
  };

  const handleBackToSelection = () => {
    navigation.goBack();
  };

  const isFormValid = Object.values(formData).every(value => value.trim() !== '') && 
                     Object.keys(errors).length === 0;

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/img/petfundo.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image
                    source={require('../../../assets/img/logoPet.png')}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
              </View>

              <ScrollView 
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 50 }}
              >
              <View style={styles.formContainer}>
                <Text style={styles.title}>Dados Pessoais</Text>
                <Text style={styles.subtitle}>
                  Cadastro com {documentType?.toUpperCase()}
                </Text>
                
                <View style={styles.documentContainer}>
                  <Text style={styles.documentLabel}>
                    {documentType === 'cpf' ? 'CPF' : 'CNPJ'} *
                  </Text>
                  <TextInput
                    ref={documentRef}
                    style={[styles.input, errors.document && styles.inputError]}
                    placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
                    placeholderTextColor="#999999"
                    value={formData.document}
                    onChangeText={(value) => handleInputChange('document', value)}
                    onFocus={() => handleInputFocus(documentRef)}
                    keyboardType="numeric"
                    maxLength={documentType === 'cpf' ? 14 : 18}
                  />
                  {errors.document && <Text style={styles.errorText}>{errors.document}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    ref={fullNameRef}
                    style={[styles.input, errors.fullName && styles.inputError]}
                    placeholder="Nome completo"
                    placeholderTextColor="#999999"
                    value={formData.fullName}
                    onChangeText={(value) => handleInputChange('fullName', value)}
                    onFocus={() => handleInputFocus(fullNameRef)}
                    autoCapitalize="words"
                  />
                  {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <TextInput
                    ref={emailRef}
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="E-mail"
                    placeholderTextColor="#999999"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    onFocus={() => handleInputFocus(emailRef)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.inputContainer}>
                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.phonePrefix}>+55</Text>
                    <TextInput
                      ref={phoneRef}
                      style={[styles.phoneInput, errors.phone && styles.inputError]}
                      placeholder="(11) 99999-9999"
                      placeholderTextColor="#999999"
                      value={formData.phone}
                      onChangeText={(value) => handleInputChange('phone', value)}
                      onFocus={() => handleInputFocus(phoneRef)}
                      keyboardType="phone-pad"
                      maxLength={15}
                    />
                  </View>
                  {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
                </View>

                <View style={styles.addressInputContainer}>
                  <View style={[
                    styles.inputWithLocationButton,
                    errors.address && styles.inputWithLocationButtonError
                  ]}>
                    <TextInput
                      ref={addressRef}
                      style={styles.addressInputField}
                      placeholder="Endereço (Rua, número, complemento)"
                      placeholderTextColor="#999999"
                      value={formData.address}
                      onChangeText={(value) => handleInputChange('address', value)}
                      onFocus={() => handleInputFocus(addressRef)}
                    />
                    <TouchableOpacity
                      style={[
                        styles.locationButton,
                        isLoadingLocation && styles.locationButtonDisabled
                      ]}
                      onPress={getCurrentLocation}
                      disabled={isLoadingLocation}
                    >
                      <View style={styles.mapPinIcon}>
                        <View style={styles.mapPinCircle}>
                          <View style={styles.mapPinInnerDot} />
                        </View>
                        <View style={styles.mapPinTail} />
                      </View>
                    </TouchableOpacity>
                  </View>
                  {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
                </View>

                <View style={styles.addressRow}>
                  <TextInput
                    ref={cityRef}
                    style={[
                      styles.addressInputHalf,
                      styles.addressInputLeft,
                      errors.city && styles.inputError
                    ]}
                    placeholder="Cidade"
                    placeholderTextColor="#999999"
                    value={formData.city}
                    onChangeText={(value) => handleInputChange('city', value)}
                    onFocus={() => handleInputFocus(cityRef)}
                    autoCapitalize="words"
                  />
                  <TextInput
                    ref={stateRef}
                    style={[
                      styles.addressInputHalf,
                      styles.addressInputRight,
                      errors.state && styles.inputError
                    ]}
                    placeholder="Estado"
                    placeholderTextColor="#999999"
                    value={formData.state}
                    onChangeText={(value) => handleInputChange('state', value)}
                    onFocus={() => handleInputFocus(stateRef)}
                    autoCapitalize="characters"
                    maxLength={2}
                  />
                </View>
                {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
                {errors.state && <Text style={styles.errorText}>{errors.state}</Text>}

                <View style={styles.zipCodeContainer}>
                  <TextInput
                    ref={zipCodeRef}
                    style={[styles.input, errors.zipCode && styles.inputError]}
                    placeholder="CEP"
                    placeholderTextColor="#999999"
                    value={formData.zipCode}
                    onChangeText={(value) => handleInputChange('zipCode', value)}
                    onFocus={() => handleInputFocus(zipCodeRef)}
                    keyboardType="numeric"
                    maxLength={9}
                  />
                  {errors.zipCode && <Text style={styles.errorText}>{errors.zipCode}</Text>}
                </View>

                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    !isFormValid && styles.registerButtonDisabled
                  ]}
                  onPress={handleRegister}
                  disabled={!isFormValid}
                >
                  <Text style={styles.registerButtonText}>Cadastrar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.backLink} onPress={handleBackToSelection}>
                  <Text style={styles.backText}>
                    <Text style={styles.backLinkText}>← Voltar</Text>
                  </Text>
                </TouchableOpacity>
              </View>
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
