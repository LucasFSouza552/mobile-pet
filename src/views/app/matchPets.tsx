import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { accountRemoteRepository } from '../../data/remote/repositories/accountRemoteRepository';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { IPet } from '../../models/IPet';
import { IAccount } from '../../models/IAccount';
import { petRemoteRepository } from '../../data/remote/repositories/petRemoteRepository';
import { useToast } from '../../hooks/useToast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MatchPets() {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const navigation = useNavigation<any>();

  const isFocused = useIsFocused();
  const [petFeed, setPetFeed] = useState<IPet | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const toast = useToast();
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
  }, []);

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
    const index = Math.round(contentOffsetX / (SCREEN_WIDTH - 32));
    setCurrentImageIndex(index);
  }, []);

  const goToPreviousImage = useCallback(() => {
    if (!petFeed?.images || currentImageIndex === 0) return;
    const newIndex = currentImageIndex - 1;
    scrollViewRef.current?.scrollTo({
      x: newIndex * (SCREEN_WIDTH - 32),
      animated: true,
    });
    setCurrentImageIndex(newIndex);
  }, [petFeed?.images, currentImageIndex]);

  const goToNextImage = useCallback(() => {
    if (!petFeed?.images || currentImageIndex === petFeed.images.length - 1) return;
    const newIndex = currentImageIndex + 1;
    scrollViewRef.current?.scrollTo({
      x: newIndex * (SCREEN_WIDTH - 32),
      animated: true,
    });
    setCurrentImageIndex(newIndex);
  }, [petFeed?.images, currentImageIndex]);

  const owner: IAccount | null = useMemo(() => {
    return petFeed && typeof (petFeed as any).account === 'object'
      ? ((petFeed as any).account as IAccount)
      : null;
  }, [petFeed]);

  const recommendationText = useMemo(() => {
    if (!petFeed) return 'A comunidade recomenda este pet para você';

    if (owner?.name) {
      return `${owner.name} e voluntários recomendam ${petFeed.name || 'este pet'} para você`;
    }

    return 'A comunidade recomenda este pet para você';
  }, [owner?.name, petFeed?.name]);

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

  const displayAge = useMemo(() => {
    if (typeof petFeed?.age === 'number') {
      return `${petFeed.age} ano${petFeed.age === 1 ? '' : 's'}`;
    }
    return null;
  }, [petFeed?.age]);

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
    (navigation as any)?.getParent?.()?.navigate('PetDetails', { petId: petFeed.id });
  }, [navigation, petFeed?.id]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Encontre seu novo amigo</Text>
      {loading && !petFeed ? (
        <View style={styles.emptyBox}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.emptyText}>Carregando...</Text>
        </View>
      ) : petFeed ? (
        <View style={styles.card}>
          <View style={styles.cardGradient}>
            <View style={styles.imageContainer}>
              {petFeed.images && petFeed.images.length > 1 ? (
                <>
                  <ScrollView
                    ref={scrollViewRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.scrollView}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    decelerationRate="fast"
                    snapToInterval={SCREEN_WIDTH - 32}
                    snapToAlignment="center"
                  >
                    {petFeed.images.map((imgId, i) => (
                      <Image
                        key={`${imgId}-${i}`}
                        source={pictureRepository.getSource(imgId)}
                        style={[styles.photo, styles.photoMulti]}
                      />
                    ))}
                  </ScrollView>
                  <View style={styles.touchAreas}>
                    <TouchableOpacity
                      style={styles.touchAreaLeft}
                      onPress={goToPreviousImage}
                      activeOpacity={0.3}
                      disabled={currentImageIndex === 0}
                    />
                    <TouchableOpacity
                      style={styles.touchAreaRight}
                      onPress={goToNextImage}
                      activeOpacity={0.3}
                      disabled={currentImageIndex === petFeed.images.length - 1}
                    />
                  </View>
                  <View style={styles.imageIndicators}>
                    {petFeed.images.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.indicatorDot,
                          index === currentImageIndex && styles.indicatorDotActive
                        ]}
                      />
                    ))}
                  </View>
                  <View style={styles.imageCounter}>
                    <Text style={styles.imageCounterText}>
                      {currentImageIndex + 1} / {petFeed.images.length}
                    </Text>
                  </View>
                </>
              ) : (
                <Image source={pictureRepository.getSource(petFeed.images?.[0])} style={styles.photo} />
              )}
            </View>
            {reactionType && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.reactionOverlay,
                  {
                    opacity: reactionAnim,
                    transform: [
                      {
                        scale: reactionAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.5, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Ionicons
                  name={reactionType === 'like' ? 'heart' : 'heart-dislike'}
                  size={96}
                  color={reactionType === 'like' ? '#FF4F81' : '#E74C3C'}
                />
              </Animated.View>
            )}
            <View style={styles.infoOverlay}>
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.nameRow}>
                    <Text style={styles.name}>
                      {petFeed.name}
                    </Text>
                    {petFeed.gender && (
                      <View
                        style={[
                          styles.genderBadge,
                          petFeed.gender === 'female'
                            ? styles.genderBadgeFemale
                            : styles.genderBadgeMale,
                        ]}
                      >
                        <FontAwesome5
                          name={petFeed.gender === 'female' ? 'venus' : 'mars'}
                          size={20}
                          color="#fff"
                        />
                      </View>
                    )}
                  </View>

                  {infoChips.length > 0 && (
                    <View style={styles.chipRow}>
                      {infoChips.slice(0, 2).map((chip, index) => (
                        <View style={styles.chip} key={`chip-${chip.label}-${index}`}>
                          <Ionicons name={chip.icon} size={14} color="#fff" />
                          <Text style={styles.chipText}>{chip.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {isOwnerVerified && (
                  <View style={styles.verifiedPill}>
                    <Ionicons name="checkmark-circle" size={18} color="#34D399" />
                  </View>
                )}
              </View>

              {!!petFeed.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {petFeed.description}
                </Text>
              )}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Sem mais pets por perto</Text>
        </View>
      )}

      <View style={styles.actions}>
        <Animated.View style={{ transform: [{ scale: dislikeScale }] }}>
          <TouchableOpacity
            style={[
              styles.circleBtnLarge,
              styles.circleBtnLeft,
              (loading || !petFeed) && styles.buttonDisabled
            ]}
            onPress={onNope}
            disabled={loading || !petFeed}
            accessibilityLabel="Não curtir"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="close" size={30} color="#fff" />
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={[styles.actionButton, (!petFeed) && styles.buttonDisabled]}
          onPress={handleShowDetails}
          disabled={!petFeed}
          accessibilityLabel="Ver detalhes"
        >
          <Ionicons name="information-circle" size={26} color="#60A5FA" />
        </TouchableOpacity>

        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <TouchableOpacity
            style={[
              styles.circleBtnLarge,
              styles.circleBtnRight,
              (loading || !petFeed) && styles.buttonDisabled
            ]}
            onPress={onLike}
            disabled={loading || !petFeed}
            accessibilityLabel="Curtir"
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="heart" size={30} color="#fff" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(COLORS: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
      padding: 16,
    },
    header: {
      color: COLORS.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 12,
    },
    card: {
      flex: 1,
      borderRadius: 28,
      overflow: 'hidden',
      padding: 2,
      backgroundColor: `${COLORS.primary}25`,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
    cardGradient: {
      flex: 1,
      borderRadius: 26,
      overflow: 'hidden',
    },
    imageContainer: {
      flex: 1,
      position: 'relative',
    },
    scrollView: {
      flex: 1,
    },
    photo: {
      width: '100%',
      flex: 1,
      resizeMode: 'cover',
    },
    photoMulti: {
      width: SCREEN_WIDTH - 32,
      minHeight: 400,
    },
    imageIndicators: {
      position: 'absolute',
      top: 12,
      left: 16,
      right: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
    },
    indicatorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    indicatorDotActive: {
      width: 24,
      backgroundColor: '#B648A0',
    },
    imageCounter: {
      position: 'absolute',
      top: 16,
      right: 16,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    imageCounterText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
    touchAreas: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
      zIndex: 5,
    },
    touchAreaLeft: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    touchAreaRight: {
      flex: 1,
      backgroundColor: 'transparent',
    },
    infoOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: 20,
      paddingVertical: 24,
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      gap: 12,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    name: {
      color: '#fff',
      fontSize: 26,
      fontWeight: '800',
    },
    ageText: {
      color: '#fff',
      fontSize: 18,
      opacity: 0.8,
      fontWeight: '600',
    },
    genderBadge: {
      width: 40,
      height: 40,
      borderRadius: 30,
      backgroundColor: 'rgba(182, 72, 160, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: '#B648A0',
    },
    genderBadgeFemale: {
      backgroundColor: '#d946ef',
      borderColor: '#f472b6',
    },
    genderBadgeMale: {
      backgroundColor: '#3b82f6',
      borderColor: '#60a5fa',
    },
    verifiedPill: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: 'rgba(52, 211, 153, 0.15)',
      borderWidth: 1,
      borderColor: 'rgba(52, 211, 153, 0.4)',
    },
    description: {
      color: '#fff',
      fontSize: 14,
      lineHeight: 20,
      opacity: 0.95,
    },
    matchMetaRow: {
      gap: 6,
    },
    matchLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    matchLabel: {
      color: '#FDE68A',
      fontWeight: '700',
      fontSize: 13,
      textTransform: 'uppercase',
    },
    matchDescription: {
      color: '#fff',
      opacity: 0.85,
      fontSize: 13,
      lineHeight: 18,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    chipText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    reactionOverlay: {
      position: 'absolute',
      top: '40%',
      left: 0,
      right: 0,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 15,
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
    },
    actionButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.2)',
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowOffset: { width: 0, height: 6 },
      shadowRadius: 8,
      elevation: 4,
    },
    circleBtnLarge: {
      width: 76,
      height: 76,
      borderRadius: 38,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowOffset: { width: 0, height: 12 },
      shadowRadius: 14,
      elevation: 8,
      backgroundColor: '#000',
    },
    circleBtnLeft: {
      backgroundColor: '#E74C3C',
    },
    circleBtnRight: {
      backgroundColor: COLORS.primary,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    emptyBox: {
      flex: 1,
      borderRadius: 16,
      backgroundColor: COLORS.quarternary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      color: COLORS.text,
      fontSize: 16,
      opacity: 0.8,
    },
  });
}

