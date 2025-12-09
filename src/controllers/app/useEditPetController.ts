import { useCallback, useEffect, useMemo } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoCamera from 'expo-camera';
import { useAccount } from '../../context/AccountContext';
import { useCamera } from '../../context/CameraContext';
import { petRemoteRepository } from '../../data/remote/repositories/petRemoteRepository';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { IPet } from '../../models/IPet';
import { useToast } from '../../hooks/useToast';
import { useEditPetReducer } from '../../views/app/pets/useEditPetReducer';

export function useEditPetController() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { account } = useAccount();
  const { setIsCameraOpen } = useCamera();
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
  }, [petId, loadPet, navigation, toast]);

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

  const pickImages = useCallback(async () => {
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
      
      addNewImages(picked);
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Não foi possível abrir a galeria.');
    }
  }, [petImages.length, removedImageIndices.size, newImages.length, addNewImages, toast]);

  const openCamera = useCallback(async () => {
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
  }, [setIsCameraOpen, setCameraOpen, toast]);

  const handleCameraCapture = useCallback((photo: { uri: string; name: string; type: string }) => {
    const totalImages = petImages.length - removedImageIndices.size + newImages.length + 1;
    if (totalImages > 6) {
      toast.info('Limite de imagens', 'Você pode adicionar no máximo 6 imagens.');
      return;
    }
    addNewImages([photo]);
    setCameraOpen(false);
  }, [petImages.length, removedImageIndices.size, newImages.length, addNewImages, setCameraOpen, toast]);

  const handleSave = useCallback(async () => {
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
  }, [petId, canEdit, saving, form, petImages, removedImageIndices, newImages, setSaving, toast, navigation]);

  const closeCamera = useCallback(() => {
    setCameraOpen(false);
    setIsCameraOpen(false);
  }, [setCameraOpen, setIsCameraOpen]);

  return {
    // Estados
    form,
    pet,
    petImages,
    newImages,
    removedImageIndices,
    isCameraOpen,
    loading,
    saving,
    canEdit,
    
    // Handlers
    updateFormField,
    pickImages,
    openCamera,
    handleCameraCapture,
    closeCamera,
    removeNewImage,
    removeImageIndex,
    restoreImageIndex,
    handleSave,
  };
}

