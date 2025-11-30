import React, { useCallback, useEffect, useMemo } from 'react';
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
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
  import * as ExpoCamera from 'expo-camera';

import { useTheme } from '../../../context/ThemeContext';
import { useAccount } from '../../../context/AccountContext';
import { useCamera } from '../../../context/CameraContext';
import { petRemoteRepository } from '../../../data/remote/repositories/petRemoteRepository';
import { pictureRepository } from '../../../data/remote/repositories/pictureRemoteRepository';
import PrimaryButton from '../../../components/Buttons/PrimaryButton';
import SecondaryButton from '../../../components/Buttons/SecondaryButton';
import CameraView from '../../../components/CameraView';
import { IPet } from '../../../models/IPet';
import { ThemeColors } from '../../../theme/types';
import { useToast } from '../../../hooks/useToast';
import { useEditPetReducer } from './useEditPetReducer';

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
  const { setIsCameraOpen } = useCamera();
  const styles = makeStyles(COLORS);
  const toast = useToast();
  const petId = route?.params?.petId;

  const {
    state,
    setForm,
    updateFormField,
    setPet,
    setPetImages,
    addNewImages,
    removeNewImage,
    removeImageIndex,
    restoreImageIndex,
    setCameraOpen,
    setLoading,
    setSaving,
    resetImages,
  } = useEditPetReducer();

  const { form, pet, petImages, newImages, removedImageIndices, isCameraOpen, loading, saving } = state;

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
      resetImages();
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Não foi possível carregar o pet');
      navigation.goBack();
      return;
    } finally {
      setLoading(false);
    }
  }, [petId, navigation, setLoading, setPet, setForm, setPetImages, resetImages, toast]);

  useEffect(() => {
    if (!petId) {
      toast.error('Erro', 'Pet não identificado');
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


  const pickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.info('Permissão necessária', 'Precisamos de acesso à galeria para adicionar fotos.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      
      const picked = result.assets.map((asset, idx) => {
        const uri = asset.uri;
        const ext = (asset.fileName?.split('.').pop() || 'jpg').toLowerCase();
        const name = asset.fileName || `pet-image-${Date.now()}-${idx}.${ext}`;
        const type = asset.mimeType || `image/${ext}`;
        return { uri, name, type };
      });
      
      const totalImages = petImages.length - removedImageIndices.size + newImages.length + picked.length;
      if (totalImages > 6) {
        toast.info('Limite de imagens', 'Você pode adicionar no máximo 6 imagens.');
        return;
      }
      
      setNewImages(prev => [...prev, ...picked]);
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Não foi possível abrir a galeria.');
    }
  };

  const openCamera = async () => {
    try {
      const request =
        (ExpoCamera as any).requestCameraPermissionsAsync ||
        (ExpoCamera as any).Camera?.requestCameraPermissionsAsync;
      const { status } = await (request ? request() : Promise.resolve({ status: 'denied' }));
      if (status !== 'granted') {
        toast.info('Permissão necessária', 'Precisamos de acesso à câmera para tirar fotos.');
        return;
      }
      setIsCameraOpen(true);
      setCameraOpen(true);
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Não foi possível acessar a câmera.');
    }
  };

  const handleCameraCapture = (photo: { uri: string; name: string; type: string }) => {
    const totalImages = petImages.length - removedImageIndices.size + newImages.length + 1;
    if (totalImages > 6) {
      toast.info('Limite de imagens', 'Você pode adicionar no máximo 6 imagens.');
      return;
    }
    addNewImages([photo]);
    setCameraOpen(false);
  };


  const handleSave = async () => {
    if (!petId || !canEdit || saving) return;

    if (!form.name.trim()) {
      toast.info('Informe o nome do pet');
      return;
    }

    if (!form.weight.trim()) {
      toast.info('Informe o peso do pet');
      return;
    }

    const parsedWeight = Number(String(form.weight).replace(',', '.'));
    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      toast.info('Peso inválido', 'Use somente números maiores que zero.');
      return;
    }

    let parsedAge: number | undefined;
    if (form.age.trim()) {
      const tempAge = Number(form.age);
      if (!Number.isFinite(tempAge) || tempAge < 0) {
        toast.info('Idade inválida', 'Utilize apenas números positivos.');
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

      if (removedImageIndices.size > 0 || newImages.length > 0) {
        const remainingImages = petImages.filter((_, index) => !removedImageIndices.has(index));
        const formData = new FormData();
        
        const allImages = [...remainingImages.map(url => {
          const imageSource = pictureRepository.getSource(url);
          const uri = typeof imageSource === 'object' && 'uri' in imageSource 
            ? imageSource.uri 
            : String(url);
          const filename = url.split('/').pop() || `image-${Date.now()}.jpg`;
          return { uri, name: filename, type: 'image/jpeg' };
        }), ...newImages];
        
        if (allImages.length === 0) {
          await petRemoteRepository.updateImages(petId, formData);
        } else {
          for (const image of allImages) {
            formData.append('images', {
              uri: image.uri,
              name: image.name,
              type: image.type,
            } as any);
          }
          await petRemoteRepository.updateImages(petId, formData);
        }
      }

      toast.success('Pet atualizado com sucesso!');
      navigation.goBack();
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao salvar alterações');
    } finally {
      setSaving(false);
    }
  };

  const renderImages = () => {
    const existingImages = petImages.map((img, index) => ({
      type: 'existing' as const,
      id: `existing-${index}`,
      data: img,
      index,
    }));
    
    const newImageItems = newImages.map((img, index) => ({
      type: 'new' as const,
      id: `new-${index}`,
      data: img,
      index,
    }));
    
    const allImages = [...existingImages, ...newImageItems];
    
    if (allImages.length === 0) {
      return (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>Nenhuma imagem cadastrada</Text>
        </View>
      );
    }

    return (
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesRow}
        >
          {existingImages.map((item) => {
            const isRemoved = removedImageIndices.has(item.index);
            return (
              <View key={item.id} style={styles.imageWrapper}>
                <Image
                  source={pictureRepository.getSource(item.data)}
                  style={[styles.petImage, isRemoved && styles.removedImage]}
                />
                {canEdit && (
                  <TouchableOpacity
                    style={isRemoved ? styles.restoreImageButton : styles.removeImageButton}
                    onPress={() => isRemoved ? restoreImageIndex(item.index) : removeImageIndex(item.index)}
                    activeOpacity={0.7}
                  >
                    <FontAwesome5
                      name={isRemoved ? 'undo' : 'times'}
                      size={14}
                      color={COLORS.iconBackground}
                    />
                  </TouchableOpacity>
                )}
                {isRemoved && (
                  <View style={styles.removedOverlay}>
                    <Text style={styles.removedText}>Removida</Text>
                  </View>
                )}
              </View>
            );
          })}
          {newImageItems.map((item) => (
            <View key={item.id} style={styles.imageWrapper}>
              <Image
                source={{ uri: item.data.uri }}
                style={styles.petImage}
              />
              {canEdit && (
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeNewImage(item.index)}
                  activeOpacity={0.7}
                >
                  <FontAwesome5
                    name="times"
                    size={14}
                    color={COLORS.iconBackground}
                  />
                </TouchableOpacity>
              )}
              <View style={styles.newImageBadge}>
                <Text style={styles.newImageText}>Nova</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        {canEdit && (
          <View style={styles.addImageButtons}>
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={pickImages}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="images" size={18} color={COLORS.primary} />
              <Text style={styles.addImageButtonText}>Galeria</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={openCamera}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="camera" size={18} color={COLORS.primary} />
              <Text style={styles.addImageButtonText}>Câmera</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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
              onChangeText={value => updateFormField('name', value)}
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
              onChangeText={value => updateFormField('description', value)}
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
                  onPress={() => updateFormField('type', type)}
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
                  onPress={() => updateFormField('gender', gender.value)}
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
                  onChangeText={value => updateFormField('age', value)}
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
                  onChangeText={value => updateFormField('weight', value)}
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
                  toast.info('Você não pode editar este pet', 'Apenas a instituição que cadastrou este pet pode alterar os dados e apenas enquanto ele estiver disponível.');
                  return;
                }
                handleSave();
              }}
            />
            <SecondaryButton text="Cancelar" onPress={() => navigation.goBack()} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <CameraView
        visible={isCameraOpen}
        onClose={() => {
          setCameraOpen(false);
          setIsCameraOpen(false);
        }}
        onCapture={handleCameraCapture}
      />
    </SafeAreaView>
  );
}

function makeStyles(COLORS: ThemeColors) {
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
      color: COLORS.iconBackground,
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
    imageWrapper: {
      position: 'relative',
    },
    petImage: {
      width: 110,
      height: 110,
      borderRadius: 14,
      backgroundColor: COLORS.tertiary,
    },
    removedImage: {
      opacity: 0.5,
    },
    removeImageButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#ef4444',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    restoreImageButton: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: '#10b981',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    removedOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    removedText: {
      color: COLORS.iconBackground,
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
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
    newImageBadge: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#10b981',
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    newImageText: {
      color: COLORS.iconBackground,
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'center',
    },
    addImageButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 12,
    },
    addImageButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: COLORS.primary,
      backgroundColor: COLORS.primary + '10',
    },
    addImageButtonText: {
      color: COLORS.primary,
      fontWeight: '700',
      fontSize: 14,
    },
  });
}

