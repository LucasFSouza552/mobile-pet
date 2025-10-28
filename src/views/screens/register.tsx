import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerStyles as styles } from '../../styles/pagesStyles/registerStyles';

type DocumentType = 'cpf' | 'cnpj' | null;

export default function Register({ navigation }: any) {
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>(null);

  const handleDocumentTypeSelect = (type: DocumentType) => {
    setSelectedDocumentType(type);
  };

  const handleContinue = () => {
    if (selectedDocumentType) {
      navigation.navigate('RegisterForm', { documentType: selectedDocumentType });
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  const isContinueDisabled = selectedDocumentType === null;

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/img/petfundo.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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

            <View style={styles.formContainer}>
              <Text style={styles.title}>Cadastrar</Text>
              
              <View style={styles.selectionContainer}>
                <Text style={styles.selectionTitle}>Como você deseja se cadastrar?</Text>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[
                      styles.selectionButton,
                      selectedDocumentType === 'cpf' && styles.selectionButtonActive
                    ]}
                    onPress={() => handleDocumentTypeSelect('cpf')}
                  >
                    <Text style={[
                      styles.selectionButtonText,
                      selectedDocumentType === 'cpf' && styles.selectionButtonTextActive
                    ]}>
                      CPF
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.selectionButton,
                      selectedDocumentType === 'cnpj' && styles.selectionButtonActive
                    ]}
                    onPress={() => handleDocumentTypeSelect('cnpj')}
                  >
                    <Text style={[
                      styles.selectionButtonText,
                      selectedDocumentType === 'cnpj' && styles.selectionButtonTextActive
                    ]}>
                      CNPJ
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.continueButton,
                  isContinueDisabled && styles.continueButtonDisabled
                ]}
                onPress={handleContinue}
                disabled={isContinueDisabled}
              >
                <Text style={styles.continueButtonText}>Continuar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backLink} onPress={handleBackToLogin}>
                <Text style={styles.backText}>
                  Já tem conta? <Text style={styles.backLinkText}>Voltar ao login</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </View>
  );
}
