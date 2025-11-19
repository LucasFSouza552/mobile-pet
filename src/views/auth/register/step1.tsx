import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  Alert, 
  Platform,
  useWindowDimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { createRegisterStepStyles } from '../../../styles/pagesStyles/registerStepStyles';
import { Images } from '../../../../assets';

export default function RegisterStep1({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const registerStepStyles = createRegisterStepStyles(width, height);
  const { documentType } = route.params;
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria de fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'Por favor, informe seu nome.');
      return;
    }

    navigation.navigate('RegisterStep2', {
      documentType,
      name: name.trim(),
      avatar,
    });
  };

  const handleBack = () => {
    navigation.goBack();
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
                  <Text style={registerStepStyles.title}>Como você quer{'\n'}ser conhecido(a)?</Text>

                  {/* Avatar Picker */}
                  <TouchableOpacity 
                    style={registerStepStyles.avatarContainer}
                    onPress={pickImage}
                  >
                    {avatar ? (
                      <Image source={{ uri: avatar }} style={registerStepStyles.avatarImage} />
                    ) : (
                      <View style={registerStepStyles.avatarPlaceholder}>
                        <FontAwesome name="camera" size={50} color="#B648A0" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {/* Name Input */}
                  <TextInput
                    style={registerStepStyles.input}
                    placeholder="Nome"
                    placeholderTextColor="#999999"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    returnKeyType="done"
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
                      !name.trim() && registerStepStyles.nextButtonDisabled
                    ]} 
                    onPress={handleNext}
                    disabled={!name.trim()}
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

