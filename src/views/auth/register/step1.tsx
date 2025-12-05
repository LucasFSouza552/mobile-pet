import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
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
import { FontAwesome } from '@expo/vector-icons';
import { Images } from '../../../../assets';
import { validateName } from '../../../utils/validation';
import { useTheme } from '../../../context/ThemeContext';
import { ThemeColors } from '../../../theme/types';
import RegisterProgress from '../../../components/RegisterProgress';

export default function RegisterStep1({ navigation, route }: any) {
  const { width, height } = useWindowDimensions();
  const { COLORS, FONT_SIZE } = useTheme();
  const scale = (size: number) => (width / 375) * size;
  const verticalScale = (size: number) => (height / 812) * size;
  const registerStepStyles = makeStyles(width, height, COLORS, FONT_SIZE);
  const { documentType, name: initialName = '' } = route.params || {};
  const [name, setName] = useState(initialName);
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

                <RegisterProgress 
                  currentStep={1} 
                  scale={scale} 
                  verticalScale={verticalScale} 
                  FONT_SIZE={FONT_SIZE} 
                />

                <View style={registerStepStyles.formContainer}>
                  <Text style={registerStepStyles.title}>Como você quer{'\n'}ser conhecido(a)?</Text>

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
      fontSize: FONT_SIZE.regular * 0.85,
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

