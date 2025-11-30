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
  useWindowDimensions,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome } from '@expo/vector-icons';
import { Images } from '../../../../assets';
import { useTheme } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/types';

type DocumentType = 'cpf' | 'cnpj' | null;

export default function Register({ navigation }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, FONT_SIZE } = useTheme();
  const registerStepStyles = makeStyles(width, height, COLORS, FONT_SIZE);
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
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: verticalScale(40),
      paddingHorizontal: scale(20),
    },
    progressStep: {
      width: scale(50),
      height: scale(50),
      borderRadius: scale(25),
      backgroundColor: COLORS.quinary,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.tertiary,
    },
    progressStepActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    progressStepCompleted: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    progressLine: {
      width: scale(30),
      height: 2,
      backgroundColor: COLORS.tertiary,
    },
    progressLineActive: {
      backgroundColor: COLORS.primary,
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
    documentTypeContainer: {
      width: '100%',
      gap: verticalScale(20),
    },
    documentTypeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      paddingVertical: verticalScale(20),
      paddingHorizontal: scale(20),
      backgroundColor: COLORS.quinary + '80',
      borderWidth: 2,
      borderColor: COLORS.tertiary,
      borderRadius: scale(15),
      gap: scale(15),
    },
    documentTypeButtonActive: {
      backgroundColor: COLORS.primary + '33',
      borderColor: COLORS.primary,
      borderWidth: 3,
    },
    documentTypeTextContainer: {
      flex: 1,
    },
    documentTypeTitle: {
      fontSize: FONT_SIZE.medium,
      fontWeight: 'bold',
      color: COLORS.text,
      opacity: 0.8,
      marginBottom: verticalScale(4),
    },
    documentTypeTitleActive: {
      color: COLORS.text,
      opacity: 1,
    },
    documentTypeSubtitle: {
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      opacity: 0.6,
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

