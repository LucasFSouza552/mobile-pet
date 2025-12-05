import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent, Animated, ScrollView, Dimensions } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { accountRemoteRepository } from '../../../data/remote/repositories/accountRemoteRepository';
import { petRemoteRepository } from '../../../data/remote/repositories/petRemoteRepository';
import { useToast } from '../../../hooks/useToast';
import { IPet } from '../../../models/IPet';
import { IAccount } from '../../../models/IAccount';
import { ThemePadding } from '../../../theme/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UseMatchPetsControllerProps {
  PADDING: ThemePadding;
}

export function useMatchPetsController({ PADDING }: UseMatchPetsControllerProps) {
  const isFocused = useIsFocused();
  const navigation = useNavigation<any>();
  const toast = useToast();
  
  const [petFeed, setPetFeed] = useState<IPet | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const likeScale = useRef(new Animated.Value(1)).current;
  const dislikeScale = useRef(new Animated.Value(1)).current;
  const reactionAnim = useRef(new Animated.Value(0)).current;
  const [reactionType, setReactionType] = useState<'like' | 'dislike' | null>(null);

  const loadNextPet = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accountRemoteRepository.fetchFeed();
      setPetFeed(data || null);
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao carregar feed');
      return;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isFocused) {
      loadNextPet();
    }
  }, [isFocused]);

  useEffect(() => {
    if (petFeed) {
      setCurrentImageIndex(0);
      scrollViewRef.current?.scrollTo({ x: 0, animated: false });
    }
  }, [petFeed?.id]);

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const cardPadding = PADDING.md * 2;
    const index = Math.round(contentOffsetX / (SCREEN_WIDTH - cardPadding));
    setCurrentImageIndex(index);
  }, [PADDING]);

  const goToPreviousImage = useCallback(() => {
    if (!petFeed?.images || currentImageIndex === 0) return;
    const cardPadding = PADDING.md * 2;
    const newIndex = currentImageIndex - 1;
    scrollViewRef.current?.scrollTo({
      x: newIndex * (SCREEN_WIDTH - cardPadding),
      animated: true,
    });
    setCurrentImageIndex(newIndex);
  }, [petFeed?.images, currentImageIndex, PADDING]);

  const goToNextImage = useCallback(() => {
    if (!petFeed?.images || currentImageIndex === petFeed.images.length - 1) return;
    const cardPadding = PADDING.md * 2;
    const newIndex = currentImageIndex + 1;
    scrollViewRef.current?.scrollTo({
      x: newIndex * (SCREEN_WIDTH - cardPadding),
      animated: true,
    });
    setCurrentImageIndex(newIndex);
  }, [petFeed?.images, currentImageIndex, PADDING]);

  const owner: IAccount | null = useMemo(() => {
    return petFeed && typeof (petFeed as any).account === 'object'
      ? ((petFeed as any).account as IAccount)
      : null;
  }, [petFeed]);

  const infoChips = useMemo(() => {
    if (!petFeed) return [];

    const chips: Array<{ icon: keyof typeof Ionicons.glyphMap; label: string }> = [];

    if (petFeed.type) {
      chips.push({ icon: 'paw-outline', label: petFeed.type });
    }

    if (typeof petFeed.age === 'number') {
      chips.push({ icon: 'time-outline', label: `${petFeed.age} ano${petFeed.age === 1 ? '' : 's'}` });
    }

    if (petFeed.gender) {
      chips.push({
        icon: String(petFeed.gender).toLowerCase() === 'male' ? 'male-outline' : 'female-outline',
        label: String(petFeed.gender).toLowerCase() === 'male' ? 'Macho' : 'Fêmea',
      });
    }

    return chips;
  }, [petFeed]);

  const isOwnerVerified = useMemo(() => Boolean((owner as any)?.verified), [owner]);

  const animateButton = useCallback((animatedValue: Animated.Value) => {
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animatedValue, {
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const triggerReaction = useCallback((type: 'like' | 'dislike') => {
    setReactionType(type);
    reactionAnim.setValue(0);
    Animated.sequence([
      Animated.timing(reactionAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(reactionAnim, {
        toValue: 0,
        duration: 200,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setReactionType(null));
  }, [reactionAnim]);

  const onNope = useCallback(async () => {
    if (!petFeed || loading) return;
    animateButton(dislikeScale);
    triggerReaction('dislike');
    await petRemoteRepository.dislikePet(petFeed.id);
    await loadNextPet();
  }, [petFeed, loadNextPet, animateButton, dislikeScale, loading, triggerReaction]);

  const onLike = useCallback(async () => {
    if (!petFeed || loading) return;
    animateButton(likeScale);
    triggerReaction('like');

    await petRemoteRepository.likePet(petFeed.id);
    await loadNextPet();
  }, [petFeed, loadNextPet, animateButton, likeScale, loading, triggerReaction]);

  const handleShowDetails = useCallback(() => {
    if (!petFeed?.id) return;
    navigation?.getParent?.()?.navigate('PetDetails', { petId: petFeed.id });
  }, [navigation, petFeed?.id]);

  return {
    petFeed,
    loading,
    currentImageIndex,
    reactionType,
    reactionAnim,
    scrollViewRef,
    likeScale,
    dislikeScale,
    owner,
    infoChips,
    isOwnerVerified,
    handleScroll,
    goToPreviousImage,
    goToNextImage,
    onNope,
    onLike,
    handleShowDetails,
  };
}
