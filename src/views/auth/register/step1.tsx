import React, { useEffect, useState } from 'react';
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
import { validateName } from '../../../utils/validation';
import { useTheme } from '../../../context/ThemeContext';

export default function RegisterStep1({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, FONT_SIZE } = useTheme();
  const registerStepStyles = createRegisterStepStyles(width, height, COLORS, FONT_SIZE);
  const { documentType, name: initialName = '', avatar: initialAvatar = null, avatarFile: initialAvatarFile = null } = route.params || {};
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState<string | null>(initialAvatar);
  const [avatarFile, setAvatarFile] = useState<any>(initialAvatarFile);
  const [nameError, setNameError] = useState<string | undefined>();
  const [nameTouched, setNameTouched] = useState(false);

  useEffect(() => {
    if (!documentType) {
      navigation.navigate('Register');
    }
  }, [documentType, navigation]);

  useEffect(() => {
    if (initialName !== undefined) {
      setName(initialName);
    }
  }, [initialName]);

  useEffect(() => {
    if (initialAvatar !== undefined) {
      setAvatar(initialAvatar);
    }
    if (initialAvatarFile !== undefined) {
      setAvatarFile(initialAvatarFile);
    }
  }, [initialAvatar, initialAvatarFile]);

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

    if (!result.canceled && result.assets[0]) {
      setAvatar(result.assets[0].uri);
      setAvatarFile(result.assets[0]);
    }
  };

  const handleNameChange = (text: string) => {
    setName(text);
    if (nameTouched) {
      const validation = validateName(text);
      setNameError(validation.isValid ? undefined : validation.error);
    }
  };

  const handleNameBlur = () => {
    setNameTouched(true);
    const validation = validateName(name);
    setNameError(validation.isValid ? undefined : validation.error);
  };

  const handleNext = () => {
    setNameTouched(true);
    const validation = validateName(name);
    setNameError(validation.isValid ? undefined : validation.error);
    
    if (!validation.isValid) {
      return;
    }

    navigation.navigate('RegisterStep2', {
      documentType,
      name: name.trim(),
      avatar,
      avatarFile,
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
                  <Text style={registerStepStyles.title}>Como você quer{'\n'}ser conhecido(a)?</Text>

                  <TouchableOpacity 
                    style={registerStepStyles.avatarContainer}
                    onPress={pickImage}
                  >
                    {avatar ? (
                      <Image source={{ uri: avatar }} style={registerStepStyles.avatarImage} />
                    ) : (
                      <View style={registerStepStyles.avatarPlaceholder}>
                        <FontAwesome name="camera" size={FONT_SIZE.xlarge} color={COLORS.primary} />
                      </View>
                    )}
                  </TouchableOpacity>

                  <View style={registerStepStyles.inputWrapper}>
                    <TextInput
                      style={[
                        registerStepStyles.input,
                        nameTouched && nameError && registerStepStyles.inputError
                      ]}
                      placeholder="Nome"
                      placeholderTextColor={COLORS.text + '80'}
                      value={name}
                      onChangeText={handleNameChange}
                      onBlur={handleNameBlur}
                      autoCapitalize="words"
                      returnKeyType="done"
                      onSubmitEditing={handleNext}
                    />
                    {nameTouched && nameError && (
                      <Text style={registerStepStyles.errorText}>{nameError}</Text>
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
                      (!validateName(name).isValid || nameTouched && nameError) && registerStepStyles.nextButtonDisabled
                    ]} 
                    onPress={handleNext}
                    disabled={!validateName(name).isValid}
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

