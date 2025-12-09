import { useState, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';
import { useAccount } from '../../context/AccountContext';
import { notificationRemoteRepository } from '../../data/remote/repositories/notificationRemoteRepository';
import { INotification } from '../../models/INotification';
import { useToast } from '../../hooks/useToast';
import { ThemeColors } from '../../theme/types';

export function useInstitutionNotificationsController(COLORS: ThemeColors) {
  const navigation = useNavigation<any>();
  const { account, loading } = useAccount();
  const toast = useToast();

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await notificationRemoteRepository.fetchAll();
      setNotifications(list);
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Não foi possível carregar as notificações.');
      return;
    } finally {
      setLoadingList(false);
      setRefreshing(false);
    }
  }, [toast]);

  useFocusEffect(
    useCallback(() => {
      if (!loading && account?.role !== 'institution') {
        navigation.goBack();
        return;
      }
      loadNotifications();
    }, [loading, account?.role, loadNotifications, navigation])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  }, [loadNotifications]);

  const getTypeConfig = useCallback((type: string) => {
    switch (type) {
      case 'warning':
        return {
          icon: 'exclamation-triangle',
          label: 'Alerta',
          backgroundColor: '#ef4444',
          iconColor: COLORS.iconBackground,
        };
      case 'info':
        return {
          icon: 'info-circle',
          label: 'Informação',
          backgroundColor: '#3b82f6',
          iconColor: COLORS.iconBackground,
        };
      case 'like':
        return {
          icon: 'heart',
          label: 'Curtida',
          backgroundColor: '#ec4899',
          iconColor: COLORS.iconBackground,
        };
      default:
        return {
          icon: 'bell',
          label: type.charAt(0).toUpperCase() + type.slice(1),
          backgroundColor: COLORS.primary,
          iconColor: COLORS.iconBackground,
        };
    }
  }, [COLORS]);

  const handleOpenInMaps = useCallback(async (latitude: number, longitude: number) => {
    const hasValidCoordinates =
      typeof latitude === 'number' &&
      typeof longitude === 'number' &&
      !isNaN(latitude) &&
      !isNaN(longitude) &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

    if (!hasValidCoordinates) {
      toast.error('Erro', 'Localização inválida.');
      return;
    }

    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        toast.error('Erro', 'Não foi possível abrir o mapa.');
      }
    } catch (error) {
      toast.error('Erro', 'Não foi possível abrir o mapa.');
    }
  }, [toast]);

  return {
    // Estados
    notifications,
    loadingList,
    refreshing,
    
    // Handlers
    handleRefresh,
    getTypeConfig,
    handleOpenInMaps,
  };
}

