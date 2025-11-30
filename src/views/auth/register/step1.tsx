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
  ScrollView,
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { Images } from '../../../../assets';
import { validateName } from '../../../utils/validation';
import { useTheme } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/types';

export default function RegisterStep1({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, FONT_SIZE } = useTheme();
  const registerStepStyles = makeStyles(width, height, COLORS, FONT_SIZE);
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

function makeStyles(
  width: number,
  height: number,
  COLORS: ThemeColors,
  FONT_SIZE: { regular: number; medium: number; large: number; xlarge: number }
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
    avatarContainer: {
      width: scale(150),
      height: scale(150),
      borderRadius: scale(75),
      marginBottom: verticalScale(30),
      overflow: 'hidden',
      borderWidth: 3,
      borderColor: COLORS.primary,
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: COLORS.primary + '33',
      justifyContent: 'center',
      alignItems: 'center',
    },
    inputWrapper: {
      width: '100%',
      marginBottom: verticalScale(5),
    },
    input: {
      width: '100%',
      height: verticalScale(55),
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: COLORS.primary,
      borderRadius: scale(10),
      paddingHorizontal: scale(20),
      fontSize: FONT_SIZE.regular,
      color: COLORS.text,
      marginBottom: verticalScale(5),
    },
    inputError: {
      borderColor: COLORS.error,
      borderWidth: 2,
    },
    errorText: {
      fontSize: FONT_SIZE.small,
      color: COLORS.error,
      marginTop: verticalScale(-5),
      marginBottom: verticalScale(10),
      marginLeft: scale(5),
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

