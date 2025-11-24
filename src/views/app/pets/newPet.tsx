import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import { useTheme } from '../../../context/ThemeContext';
import { useAccount } from '../../../context/AccountContext';
import { petRemoteRepository } from '../../../data/remote/repositories/petRemoteRepository';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import { darkTheme, lightTheme } from '../../../theme/Themes';
import { useToast } from '../../../hooks/useToast';

const PET_TYPES = ['Cachorro', 'Gato', 'Pássaro', 'Outro'] as const;
const GENDERS = [
  { value: 'male', label: 'Macho' },
  { value: 'female', label: 'Fêmea' },
] as const;

export default function NewPet({ navigation }: any) {
  const { COLORS } = useTheme();
  const { account } = useAccount();
  const styles = useMemo(() => makeStyles(COLORS), [COLORS]);
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<typeof PET_TYPES[number]>('Cachorro');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [image, setImage] = useState<{ uri: string; name: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const isInstitution = account?.role === 'institution';

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para adicionar foto do pet.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.length) return;
    const asset = result.assets[0];
    setImage({
      uri: asset.uri,
      name: asset.fileName || `pet-${Date.now()}.jpg`,
      type: asset.mimeType || 'image/jpeg',
    });
  };

  const validate = () => {
    if (!isInstitution) {
      toast.error('Somente instituições podem cadastrar pets.');
      return false;
    }
    if (!name.trim()) {
      toast.info('Informe o nome do pet.');
      return false;
    }
    const weightValue = Number(weight.replace(',', '.'));
    if (!weight.trim() || Number.isNaN(weightValue) || weightValue <= 0) {
      toast.info('Insira um peso válido.');
      return false;
    }
    if (age.trim()) {
      const ageValue = Number(age);
      if (Number.isNaN(ageValue) || ageValue < 0) {
        toast.info('Idade deve ser um número positivo.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: any = {
      name: name.trim(),
      description: description.trim(),
      type,
      gender,
      weight: Number(weight.replace(',', '.')),
    };
    if (age.trim()) {
      payload.age = Number(age);
    }

    setLoading(true);
    try {
      const created = await petRemoteRepository.institutionCreatePet(payload);
      if (created?.id && image) {
        const formData = new FormData();
        formData.append('images', {
          uri: image.uri,
          name: image.name,
          type: image.type,
        } as any);
        await petRemoteRepository.updateImages(created.id, formData);
      }
      toast.success('Pet cadastrado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Não foi possível cadastrar o pet.');
      return;
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cadastrar novo pet</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações principais</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nome *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nome do pet"
                placeholderTextColor={COLORS.text + '66'}
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={styles.inputLabel}>Espécie *</Text>
            <View style={styles.chipsRow}>
              {PET_TYPES.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[styles.chip, type === option && styles.chipActive]}
                  onPress={() => setType(option)}
                >
                  <Text style={[styles.chipText, type === option && styles.chipTextActive]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Sexo *</Text>
            <View style={styles.chipsRow}>
              {GENDERS.map(option => (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.chip, gender === option.value && styles.chipActive]}
                  onPress={() => setGender(option.value)}
                >
                  <Text style={[styles.chipText, gender === option.value && styles.chipTextActive]}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Idade (anos)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: 2"
                  placeholderTextColor={COLORS.text + '66'}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Peso (kg) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: 5,5"
                  placeholderTextColor={COLORS.text + '66'}
                  keyboardType="decimal-pad"
                  value={weight}
                  onChangeText={setWeight}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholder="Conte um pouco sobre o pet, temperamento, cuidados, etc."
              placeholderTextColor={COLORS.text + '66'}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos</Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              {image ? (
                <View style={styles.preview}>
                  <Text style={styles.previewText}>{image.name}</Text>
                  <Text style={styles.previewSub}>Toque para trocar</Text>
                </View>
              ) : (
                <View style={styles.previewEmpty}>
                  <FontAwesome5 name="camera" size={20} color={COLORS.primary} />
                  <Text style={styles.previewText}>Adicionar foto</Text>
                  <Text style={styles.previewSub}>Opcional</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.actions}>
            <PrimaryButton text={loading ? 'Salvando...' : 'Cadastrar pet'} onPress={handleSubmit} />
            <SecondaryButton text="Cancelar" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 40,
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
    backButtonText: {
      color: COLORS.primary,
      fontWeight: '600',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'right',
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.text,
    },
    section: {
      backgroundColor: COLORS.tertiary,
      borderRadius: 16,
      padding: 16,
      gap: 12,
      borderWidth: 1,
      borderColor: COLORS.primary + '22',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.primary,
    },
    inputGroup: {
      gap: 6,
    },
    inputLabel: {
      color: COLORS.text,
      fontWeight: '600',
      fontSize: 13,
    },
    input: {
      backgroundColor: COLORS.quarternary,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: COLORS.text,
      borderWidth: 1,
      borderColor: COLORS.quarternary,
    },
    textArea: {
      minHeight: 120,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: COLORS.quarternary,
      borderWidth: 1,
      borderColor: COLORS.quarternary,
    },
    chipActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    chipText: {
      color: COLORS.text,
      fontWeight: '600',
    },
    chipTextActive: {
      color: COLORS.bg,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    imagePicker: {
      borderWidth: 1,
      borderColor: COLORS.primary + '33',
      borderRadius: 14,
      padding: 16,
      backgroundColor: COLORS.quarternary,
    },
    preview: {
      gap: 4,
    },
    previewEmpty: {
      alignItems: 'center',
      gap: 6,
    },
    previewText: {
      color: COLORS.text,
      fontWeight: '600',
    },
    previewSub: {
      color: COLORS.text,
      opacity: 0.6,
      fontSize: 12,
    },
    actions: {
      gap: 12,
    },
  });
}


