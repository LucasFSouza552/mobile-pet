import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
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
import { FontAwesome } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import { useTheme } from '../../../context/ThemeContext';
import { useAccount } from '../../../context/AccountContext';
import { petRemoteRepository } from '../../../data/remote/repositories/petRemoteRepository';
import { pictureRepository } from '../../../data/remote/repositories/pictureRemoteRepository';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import { IPet } from '../../../models/IPet';
import { darkTheme, lightTheme } from '../../../theme/Themes';

type PetFormState = {
  name: string;
  description: string;
  type: IPet['type'];
  gender: 'Male' | 'Female';
  age: string;
  weight: string;
};

const PET_TYPES: IPet['type'][] = ['Cachorro', 'Gato', 'Pássaro', 'Outro'];
const GENDERS: Array<{ value: 'Male' | 'Female'; label: string }> = [
  { value: 'Male', label: 'Macho' },
  { value: 'Female', label: 'Fêmea' },
];

interface EditPetProps {
  navigation: any;
  route: { params?: { petId?: string } };
}

export default function EditPet({ navigation, route }: EditPetProps) {
  const { COLORS } = useTheme();
  const { account } = useAccount();
  const styles = makeStyles(COLORS);

  const petId = route?.params?.petId;

  const [form, setForm] = useState<PetFormState>({
    name: '',
    description: '',
    type: 'Cachorro',
    gender: 'Male',
    age: '',
    weight: '',
  });
  const [pet, setPet] = useState<IPet | null>(null);
  const [petImages, setPetImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPet = useCallback(async () => {
    if (!petId) return;
    try {
      setLoading(true);
      const data = await petRemoteRepository.fetchPetById(petId);
      setPet(data);
      setForm({
        name: data?.name ?? '',
        description: data?.description ?? '',
        type: (data?.type as IPet['type']) ?? 'Cachorro',
        gender: String(data?.gender).toLowerCase() === 'female' ? 'Female' : 'Male',
        age: typeof data?.age === 'number' ? String(data.age) : '',
        weight: typeof data?.weight === 'number' ? String(data.weight) : '',
      });
      setPetImages(Array.isArray(data?.images) ? data.images : []);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Não foi possível carregar o pet',
        text2: error?.message ?? 'Tente novamente mais tarde',
        position: 'bottom',
      });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [petId, navigation]);

  useEffect(() => {
    if (!petId) {
      Toast.show({
        type: 'error',
        text1: 'Pet não identificado',
        position: 'bottom',
      });
      navigation.goBack();
      return;
    }
    loadPet();
  }, [petId, loadPet, navigation]);

  const ownerId = useMemo(() => {
    if (!pet?.account) return null;
    if (typeof pet.account === 'string') return pet.account;
    if (typeof (pet.account as any)?.id === 'string') return (pet.account as any).id;
    return null;
  }, [pet]);

  const canEdit = useMemo(() => {
    if (!account?.id) return false;
    if (pet?.adopted) return false;
    return ownerId === account.id;
  }, [account?.id, ownerId, pet?.adopted]);

  const updateForm = (key: keyof PetFormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!petId || !canEdit || saving) return;

    if (!form.name.trim()) {
      Toast.show({ type: 'info', text1: 'Informe o nome do pet', position: 'bottom' });
      return;
    }

    if (!form.weight.trim()) {
      Toast.show({ type: 'info', text1: 'Informe o peso do pet', position: 'bottom' });
      return;
    }

    const parsedWeight = Number(String(form.weight).replace(',', '.'));
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      Toast.show({ type: 'info', text1: 'Peso inválido', text2: 'Use somente números maiores que zero.', position: 'bottom' });
      return;
    }

    let parsedAge: number | undefined;
    if (form.age.trim()) {
      const tempAge = Number(form.age);
      if (!Number.isFinite(tempAge) || tempAge < 0) {
        Toast.show({ type: 'info', text1: 'Idade inválida', text2: 'Utilize apenas números positivos.', position: 'bottom' });
        return;
      }
      parsedAge = tempAge;
    }

    const payload: Record<string, any> = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      gender: form.gender === 'Female' ? 'female' : 'male',
      weight: parsedWeight,
    };

    if (typeof parsedAge === 'number') {
      payload.age = parsedAge;
    }

    setSaving(true);
    try {
      await petRemoteRepository.updatePetDetails(petId, payload);
      Toast.show({
        type: 'success',
        text1: 'Pet atualizado com sucesso!',
        position: 'bottom',
      });
      navigation.goBack();
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar alterações',
        text2: error?.message ?? 'Tente novamente mais tarde',
        position: 'bottom',
      });
    } finally {
      setSaving(false);
    }
  };

  const renderImages = () => {
    if (!petImages.length) {
      return (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Nenhuma imagem cadastrada</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.imagesRow}
      >
        {petImages.map((img, index) => (
          <Image
            key={`${img}-${index}`}
            source={pictureRepository.getSource(img)}
            style={styles.petImage}
          />
        ))}
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Carregando informações do pet...</Text>
      </SafeAreaView>
    );
  }

  if (!pet) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Pet não encontrado.</Text>
        <SecondaryButton text="Voltar" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <FontAwesome name="arrow-left" size={16} color={COLORS.primary} />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Editar Pet</Text>
            <View style={{ width: 60 }} />
          </View>

          {!canEdit && (
            <View style={styles.lockedBox}>
              <Text style={styles.lockedTitle}>Edição bloqueada</Text>
              <Text style={styles.lockedMessage}>
                Apenas a instituição que cadastrou este pet pode alterar os dados e apenas enquanto ele estiver disponível.
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Fotos do Pet</Text>
            {renderImages()}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações gerais</Text>

            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={styles.input}
              placeholder="Nome do pet"
              placeholderTextColor={COLORS.text + '66'}
              value={form.name}
              onChangeText={value => updateForm('name', value)}
            />

            <Text style={styles.label}>Descrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Conte um pouco sobre a personalidade e cuidados do pet"
              placeholderTextColor={COLORS.text + '66'}
              value={form.description}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              onChangeText={value => updateForm('description', value)}
            />

            <Text style={styles.label}>Tipo</Text>
            <View style={styles.optionGroup}>
              {PET_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.optionChip,
                    form.type === type && styles.optionChipActive,
                  ]}
                  onPress={() => updateForm('type', type)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      form.type === type && styles.optionChipTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Sexo</Text>
            <View style={styles.optionGroup}>
              {GENDERS.map(gender => (
                <TouchableOpacity
                  key={gender.value}
                  style={[
                    styles.optionChip,
                    form.gender === gender.value && styles.optionChipActive,
                  ]}
                  onPress={() => updateForm('gender', gender.value)}
                >
                  <Text
                    style={[
                      styles.optionChipText,
                      form.gender === gender.value && styles.optionChipTextActive,
                    ]}
                  >
                    {gender.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Idade (anos)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: 2"
                  placeholderTextColor={COLORS.text + '66'}
                  value={form.age}
                  onChangeText={value => updateForm('age', value)}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Peso (kg)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex.: 12.5"
                  placeholderTextColor={COLORS.text + '66'}
                  value={form.weight}
                  onChangeText={value => updateForm('weight', value)}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>
          </View>

          <View style={styles.buttons}>
            <PrimaryButton
              text={saving ? 'Salvando...' : 'Salvar alterações'}
              onPress={() => {
                if (!canEdit) {
                  Toast.show({
                    type: 'info',
                    text1: 'Você não pode editar este pet',
                    position: 'bottom',
                  });
                  return;
                }
                handleSave();
              }}
            />
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
      paddingBottom: 32,
      gap: 16,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: COLORS.tertiary,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: COLORS.primary,
    },
    backButtonText: {
      color: COLORS.primary,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: COLORS.text,
    },
    section: {
      backgroundColor: COLORS.quarternary,
      borderRadius: 16,
      padding: 16,
      gap: 12,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: COLORS.primary,
    },
    label: {
      fontSize: 14,
      color: COLORS.text,
      marginBottom: 6,
      fontWeight: '600',
    },
    input: {
      backgroundColor: COLORS.tertiary,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 12,
      color: COLORS.text,
      borderWidth: 1,
      borderColor: COLORS.tertiary,
      marginBottom: 12,
    },
    textArea: {
      minHeight: 100,
    },
    optionGroup: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    optionChip: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: COLORS.tertiary,
      borderWidth: 1,
      borderColor: COLORS.tertiary,
    },
    optionChipActive: {
      backgroundColor: COLORS.primary,
      borderColor: COLORS.primary,
    },
    optionChipText: {
      color: COLORS.text,
      fontWeight: '600',
    },
    optionChipTextActive: {
      color: COLORS.bg,
    },
    row: {
      flexDirection: 'row',
      gap: 12,
    },
    buttons: {
      gap: 12,
    },
    imagesRow: {
      gap: 12,
    },
    petImage: {
      width: 110,
      height: 110,
      borderRadius: 14,
      backgroundColor: COLORS.tertiary,
    },
    imagePlaceholder: {
      height: 120,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: COLORS.tertiary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    imagePlaceholderText: {
      color: COLORS.text,
      opacity: 0.6,
    },
    lockedBox: {
      backgroundColor: COLORS.tertiary,
      borderRadius: 12,
      padding: 12,
    },
    lockedTitle: {
      color: COLORS.primary,
      fontWeight: '700',
      marginBottom: 4,
    },
    lockedMessage: {
      color: COLORS.text,
      opacity: 0.8,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.secondary,
      padding: 16,
      gap: 12,
    },
    loadingText: {
      color: COLORS.text,
      fontWeight: '600',
      textAlign: 'center',
    },
  });
}

