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
import { createRegisterStepStyles } from '../../../styles/pagesStyles/registerStepStyles';
import { Images } from '../../../../assets';
import { useTheme } from '../../../context/ThemeContext';

type DocumentType = 'cpf' | 'cnpj' | null;

export default function Register({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, FONT_SIZE } = useTheme();
  const registerStepStyles = createRegisterStepStyles(width, height, COLORS, FONT_SIZE);
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1 }}>
              <View style={registerStepStyles.content}>
              <View style={registerStepStyles.header}>
                <Text style={registerStepStyles.headerTitle}>Registrar</Text>
                <Text style={registerStepStyles.headerSubtitle}>
                  Primeiro, queremos saber quem é você.
                </Text>
              </View>

              <View style={registerStepStyles.progressContainer}>
                <View style={[registerStepStyles.progressStep, registerStepStyles.progressStepActive]}>
                  <FontAwesome name="user" size={FONT_SIZE.regular} color={COLORS.text} />
                </View>
                <View style={registerStepStyles.progressLine} />
                <View style={registerStepStyles.progressStep}>
                  <FontAwesome name="envelope" size={FONT_SIZE.regular} color={COLORS.text} style={{ opacity: 0.5 }} />
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
                <Text style={registerStepStyles.title}>
                  Como você deseja{'\n'}se cadastrar?
                </Text>

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
                      size={FONT_SIZE.medium} 
                      color={selectedDocumentType === 'cpf' ? COLORS.primary : COLORS.text} 
                      style={{ opacity: selectedDocumentType === 'cpf' ? 1 : 0.6 }}
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
                      size={FONT_SIZE.medium} 
                      color={selectedDocumentType === 'cnpj' ? COLORS.primary : COLORS.text} 
                      style={{ opacity: selectedDocumentType === 'cnpj' ? 1 : 0.6 }}
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

