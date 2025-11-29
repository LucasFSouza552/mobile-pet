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
import { ThemeColors, ThemeFontSize, ThemeGap, ThemePadding } from '../../theme/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MatchPets() {
  const { COLORS, FONT_SIZE, PADDING, GAP, getShadow, scale } = useTheme();
  const styles = makeStyles(COLORS, FONT_SIZE, PADDING, GAP, getShadow, scale);
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
                    snapToInterval={SCREEN_WIDTH - (PADDING.md * 2)}
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
                  size={FONT_SIZE.xxlarge * 3}
                  color={reactionType === 'like' ? COLORS.primary : COLORS.error}
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
                          size={FONT_SIZE.regular}
                          color="#fff"
                        />
                      </View>
                    )}
                  </View>

                  {infoChips.length > 0 && (
                    <View style={styles.chipRow}>
                      {infoChips.slice(0, 2).map((chip, index) => (
                        <View style={styles.chip} key={`chip-${chip.label}-${index}`}>
                          <Ionicons name={chip.icon} size={FONT_SIZE.small} color="#fff" />
                          <Text style={styles.chipText}>{chip.label}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {isOwnerVerified && (
                  <View style={styles.verifiedPill}>
                    <Ionicons name="checkmark-circle" size={FONT_SIZE.regular} color={COLORS.success} />
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
              <Ionicons name="close" size={FONT_SIZE.xlarge} color="#fff" />
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity
          style={[styles.actionButton, (!petFeed) && styles.buttonDisabled]}
          onPress={handleShowDetails}
          disabled={!petFeed}
          accessibilityLabel="Ver detalhes"
        >
          <Ionicons name="information-circle" size={FONT_SIZE.xlarge} color={COLORS.info} />
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
              <Ionicons name="heart" size={FONT_SIZE.xlarge} color="#fff" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

function makeStyles(
  COLORS: ThemeColors,
  FONT_SIZE: ThemeFontSize,
  PADDING: ThemePadding,
  GAP: ThemeGap,
  getShadow: (level: 'sm' | 'md' | 'lg' | 'xl') => {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  },
  scale: (size: number) => number
) {
  const shadowLg = getShadow('lg');
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
      padding: PADDING.md,
    },
    header: {
      color: COLORS.text,
      fontSize: FONT_SIZE.large,
      fontWeight: 'bold',
      marginBottom: GAP.md,
    },
    card: {
      flex: 1,
      borderRadius: scale(28),
      overflow: 'hidden',
      padding: scale(2),
      backgroundColor: `${COLORS.primary}25`,
      ...shadowLg,
    },
    cardGradient: {
      flex: 1,
      borderRadius: scale(26),
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
      width: SCREEN_WIDTH - (PADDING.md * 2),
      minHeight: scale(400),
    },
    imageIndicators: {
      position: 'absolute',
      top: PADDING.sm,
      left: PADDING.md,
      right: PADDING.md,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: GAP.sm,
      paddingHorizontal: PADDING.md,
    },
    indicatorDot: {
      width: scale(8),
      height: scale(8),
      borderRadius: scale(4),
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    indicatorDotActive: {
      width: scale(24),
      backgroundColor: COLORS.primary,
    },
    imageCounter: {
      position: 'absolute',
      top: PADDING.md,
      right: PADDING.md,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: PADDING.sm,
      paddingVertical: PADDING.xs,
      borderRadius: scale(16),
    },
    imageCounterText: {
      color: '#fff',
      fontSize: FONT_SIZE.small,
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
      paddingHorizontal: PADDING.lg,
      paddingVertical: PADDING.xl,
      backgroundColor: 'rgba(0,0,0,0.55)',
      borderBottomLeftRadius: scale(24),
      borderBottomRightRadius: scale(24),
      gap: GAP.md,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: GAP.md,
    },
    name: {
      color: '#fff',
      fontSize: FONT_SIZE.xlarge,
      fontWeight: '800',
    },
    ageText: {
      color: '#fff',
      fontSize: FONT_SIZE.medium,
      opacity: 0.8,
      fontWeight: '600',
    },
    genderBadge: {
      width: scale(40),
      height: scale(40),
      borderRadius: scale(30),
      backgroundColor: `${COLORS.primary}33`,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: scale(1.5),
      borderColor: COLORS.primary,
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
      paddingHorizontal: PADDING.sm,
      paddingVertical: PADDING.xs,
      borderRadius: 999,
      backgroundColor: `${COLORS.success}26`,
      borderWidth: 1,
      borderColor: `${COLORS.success}66`,
    },
    description: {
      color: '#fff',
      fontSize: FONT_SIZE.small,
      lineHeight: FONT_SIZE.regular + 4,
      opacity: 0.95,
    },
    matchMetaRow: {
      gap: GAP.sm,
    },
    matchLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: GAP.sm,
    },
    matchLabel: {
      color: '#FDE68A',
      fontWeight: '700',
      fontSize: FONT_SIZE.small,
      textTransform: 'uppercase',
    },
    matchDescription: {
      color: '#fff',
      opacity: 0.85,
      fontSize: FONT_SIZE.small,
      lineHeight: FONT_SIZE.regular,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GAP.sm,
      marginTop: GAP.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: GAP.sm,
      paddingHorizontal: PADDING.md,
      paddingVertical: PADDING.xs,
      borderRadius: 999,
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.2)',
    },
    chipText: {
      color: '#fff',
      fontSize: FONT_SIZE.small,
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
      gap: GAP.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: PADDING.md,
    },
    actionButton: {
      width: scale(52),
      height: scale(52),
      borderRadius: scale(26),
      borderWidth: scale(2),
      borderColor: 'rgba(255,255,255,0.2)',
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    circleBtnLarge: {
      width: scale(76),
      height: scale(76),
      borderRadius: scale(38),
      alignItems: 'center',
      justifyContent: 'center',
      ...shadowLg,
      backgroundColor: '#000',
    },
    circleBtnLeft: {
      backgroundColor: COLORS.error,
    },
    circleBtnRight: {
      backgroundColor: COLORS.primary,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    emptyBox: {
      flex: 1,
      borderRadius: scale(16),
      backgroundColor: COLORS.quarternary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      color: COLORS.text,
      fontSize: FONT_SIZE.regular,
      opacity: 0.8,
    },
  });
}

