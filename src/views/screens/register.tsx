import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  TouchableWithoutFeedback, 
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { createRegisterStepStyles } from '../../styles/pagesStyles/registerStepStyles';

type DocumentType = 'cpf' | 'cnpj' | null;

export default function Register({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const registerStepStyles = createRegisterStepStyles(width, height);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>(null);

  const handleDocumentTypeSelect = (type: DocumentType) => {
    setSelectedDocumentType(type);
  };

  const handleContinue = () => {
    if (selectedDocumentType) {
      navigation.navigate('RegisterStep1', { documentType: selectedDocumentType });
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={registerStepStyles.container}>
      <Image
        source={require('../../../assets/img/petfundo.png')}
        style={registerStepStyles.backgroundImage}
        resizeMode="cover"
      />
      
      <SafeAreaView style={registerStepStyles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <View style={registerStepStyles.content}>
              {/* Header */}
              <View style={registerStepStyles.header}>
                <Text style={registerStepStyles.headerTitle}>Registrar</Text>
                <Text style={registerStepStyles.headerSubtitle}>
                  Primeiro, queremos saber quem é você.
                </Text>
              </View>

              {/* Progress Indicator */}
              <View style={registerStepStyles.progressContainer}>
                <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepActive]}>
                  <FontAwesome name="user" size={20} color="#fff" />
                </View>
                <View style={registerStepStyles.progressLine} />
                <View style={registerStepStyles.progressStep}>
                  <FontAwesome name="envelope" size={20} color="#666" />
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
                <Text style={registerStepStyles.title}>
                  Como você deseja{'\n'}se cadastrar?
                </Text>

                {/* Document Type Selection */}
                <View style={registerStepStyles.documentTypeContainer}>
                  <TouchableOpacity
                    style={[
                      registerStepStyles.documentTypeButton,
                      selectedDocumentType === 'cpf' && registerStepStyles.documentTypeButtonActive
                    ]}
                    onPress={() => handleDocumentTypeSelect('cpf')}
                    activeOpacity={0.7}
                  >
                    <FontAwesome 
                      name={selectedDocumentType === 'cpf' ? 'check-circle' : 'circle-o'} 
                      size={24} 
                      color={selectedDocumentType === 'cpf' ? '#B648A0' : '#999'} 
                    />
                    <View style={registerStepStyles.documentTypeTextContainer}>
                      <Text style={[
                        registerStepStyles.documentTypeTitle,
                        selectedDocumentType === 'cpf' && registerStepStyles.documentTypeTitleActive
                      ]}>
                        CPF
                      </Text>
                      <Text style={registerStepStyles.documentTypeSubtitle}>
                        Cadastro como pessoa física
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      registerStepStyles.documentTypeButton,
                      selectedDocumentType === 'cnpj' && registerStepStyles.documentTypeButtonActive
                    ]}
                    onPress={() => handleDocumentTypeSelect('cnpj')}
                    activeOpacity={0.7}
                  >
                    <FontAwesome 
                      name={selectedDocumentType === 'cnpj' ? 'check-circle' : 'circle-o'} 
                      size={24} 
                      color={selectedDocumentType === 'cnpj' ? '#B648A0' : '#999'} 
                    />
                    <View style={registerStepStyles.documentTypeTextContainer}>
                      <Text style={[
                        registerStepStyles.documentTypeTitle,
                        selectedDocumentType === 'cnpj' && registerStepStyles.documentTypeTitleActive
                      ]}>
                        CNPJ
                      </Text>
                      <Text style={registerStepStyles.documentTypeSubtitle}>
                        Cadastro como instituição
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Buttons */}
              <View style={registerStepStyles.buttonContainer}>
                <TouchableOpacity 
                  style={registerStepStyles.backButton} 
                  onPress={handleBackToLogin}
                >
                  <Text style={registerStepStyles.backButtonText}>Voltar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    registerStepStyles.nextButton,
                    !selectedDocumentType && registerStepStyles.nextButtonDisabled
                  ]} 
                  onPress={handleContinue}
                  disabled={!selectedDocumentType}
                >
                  <Text style={registerStepStyles.nextButtonText}>Próximo</Text>
                </TouchableOpacity>
              </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
