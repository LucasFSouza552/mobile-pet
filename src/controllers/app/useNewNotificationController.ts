import { useState, useEffect, useCallback } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import * as ExpoCamera from 'expo-camera';
import { useAccount } from '../../context/AccountContext';
import {
  NotificationPayload,
  notificationRemoteRepository,
} from '../../data/remote/repositories/notificationRemoteRepository';
import { useToast } from '../../hooks/useToast';

export function useNewNotificationController() {
  const navigation = useNavigation<any>();
  const { account, loading } = useAccount();
  const isFocused = useIsFocused();
  const toast = useToast();

  const [content, setContent] = useState('');
  const [image, setImage] = useState<NotificationPayload['image'] | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!account) {
        navigation.navigate('Welcome');
        return;
      }
      if (account.role === 'institution') {
        navigation.goBack();
      }
    }
  }, [account, loading, navigation]);

  const fetchLocation = useCallback(async () => {
    setLocationLoading(true);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const message = 'Permissão negada para obter localização.';
        toast.info('Permissão necessária', message);
        throw new Error(message);
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const result = {
        latitude: coords.latitude,
        longitude: coords.longitude,
      };
      setLocation(result);
      return result;
    } catch (error: any) {
      const message =
        error?.message || 'Não foi possível obter a localização.';
      toast.info('Erro', message);
      throw new Error(message);
    } finally {
      setLocationLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLocation().catch(() => { });
  }, [fetchLocation]);

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

  useEffect(() => {
    if (isFocused) {
      openCamera();
    } else {
      setIsCameraOpen(false);
    }
  }, [isFocused, openCamera]);

  const handleCameraCapture = useCallback((photo: { uri: string; name: string; type: string }) => {
    setImage(photo);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!content.trim()) {
      toast.error('Validação', 'Descreva o motivo da notificação');
      return;
    }

    if (!image) {
      toast.error('Validação', 'Anexe uma imagem para a notificação');
      return;
    }

    let coords = location;
    if (!coords) {
      try {
        coords = await fetchLocation();
      } catch {
        return;
      }
    }

    setSubmitting(true);

    try {
      await notificationRemoteRepository.createNotification({
        content: content.trim(),
        type: 'warning',
        latitude: coords.latitude,
        longitude: coords.longitude,
        image,
      });

      toast.success('Sucesso', 'Notificação enviada');
      navigation.goBack();
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao criar notificação');
    } finally {
      setSubmitting(false);
    }
  }, [content, image, location, fetchLocation, toast, navigation]);

  const closeCamera = useCallback(() => {
    setIsCameraOpen(false);
  }, []);

  const removeImage = useCallback(() => {
    setImage(null);
  }, []);

  const isBusy = submitting || locationLoading;

  return {
    // Estados
    content,
    image,
    submitting,
    locationLoading,
    isCameraOpen,
    isBusy,
    
    // Handlers
    setContent,
    openCamera,
    handleCameraCapture,
    closeCamera,
    removeImage,
    handleSubmit,
  };
}

