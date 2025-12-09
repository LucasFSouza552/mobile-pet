import { useState, useEffect, useCallback } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as ExpoCamera from 'expo-camera';
import { useAccount } from '../../context/AccountContext';
import { postRepository } from '../../data/remote/repositories/postRemoteRepository';
import { useToast } from '../../hooks/useToast';

interface ImageFile {
  uri: string;
  name: string;
  type: string;
}

export function useNewPostController() {
  const { account } = useAccount();
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const toast = useToast();

  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    if (isFocused) {
      setImages([]);
      setContent('');
      setSubmitting(false);
    }
  }, [isFocused]);

  const pickImages = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        toast.info('Permissão necessária', 'Precisamos de acesso às suas fotos para anexar imagens.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 0.8,
      });
      if (result.canceled) return;
      const picked = (result.assets || []).map((a, idx) => {
        const uri = a.uri;
        const ext = (a.fileName?.split('.').pop() || 'jpg').toLowerCase();
        const name = a.fileName || `image_${Date.now()}_${idx}.${ext}`;
        const type = a.mimeType || `image/${ext}`;
        return { uri, name, type };
      });
      setImages(prev => [...prev, ...picked]);
    } catch (e) {
      toast.handleError(e, 'Não foi possível abrir a galeria');
    }
  }, [toast]);

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
    } catch (e) {
      toast.handleError(e, 'Não foi possível acessar a câmera');
    }
  }, [toast]);

  const handleCameraCapture = useCallback((photo: ImageFile) => {
    setImages(prev => [...prev, photo]);
    setIsCameraOpen(false);
  }, []);

  const removeImage = useCallback((index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!account) {
      toast.error('Sessão expirada', 'Você precisa estar logado para postar.');
      return;
    }
    if (!content.trim() && images.length === 0) {
      toast.error('Validação', 'Adicione conteúdo ou ao menos uma imagem.');
      return;
    }
    try {
      setSubmitting(true);
      const form = new FormData();
      form.append('content', content.trim());
      images.forEach((img) => {
        form.append('images', {
          uri: img.uri,
          name: img.name,
          type: img.type,
        } as any);
      });
      await postRepository.createPost(form);
      setContent('');
      setImages([]);
      toast.success('Sucesso', 'Post criado!');
      navigation.navigate('Community');
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao criar post');
    } finally {
      setSubmitting(false);
    }
  }, [account, content, images, toast, navigation]);

  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  return {
    // Estados
    content,
    submitting,
    images,
    isCameraOpen,
    
    // Handlers
    setContent,
    pickImages,
    openCamera,
    handleCameraCapture,
    removeImage,
    handleSubmit,
    closeCamera,
  };
}

