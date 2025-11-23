import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { accountRemoteRepository } from '../../data/remote/repositories/accountRemoteRepository';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { useIsFocused } from '@react-navigation/native';
import { IPet } from '../../models/IPet';
import { IAccount } from '../../models/IAccount';
import { petRemoteRepository } from '../../data/remote/repositories/petRemoteRepository';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FindPets() {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);

  const isFocused = useIsFocused();
  const [petFeed, setPetFeed] = useState<IPet | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const loadNextPet = useCallback(async () => {
    try {
      setLoading(true);
      const data = await accountRemoteRepository.fetchFeed();
      setPetFeed(data || null);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro ao carregar feed', text2: e?.message, position: 'bottom' });
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

  const onNope = useCallback(async () => {
    if (!petFeed) return;
    await petRemoteRepository.dislikePet(petFeed.id);
    await loadNextPet();
  }, [petFeed, loadNextPet]);

  const onLike = useCallback(async () => {
    if (!petFeed) return;
    await petRemoteRepository.likePet(petFeed.id);
    await loadNextPet();
  }, [petFeed, loadNextPet]);

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
          <View style={styles.cardInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{petFeed.name}</Text>
              {petFeed.gender && (
                <View style={styles.genderBadge}>
                  <Ionicons
                    name={String(petFeed.gender).toLowerCase() === 'male' ? 'male-outline' : 'female-outline'}
                    size={16}
                    color="#B648A0"
                  />
                </View>
              )}
            </View>
            
            {!!petFeed.description && (
              <Text style={styles.description}>{petFeed.description}</Text>
            )}

            {owner?.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color="#fff" style={styles.infoIcon} />
                <Text style={styles.infoText}>
                  {[owner.address.street, owner.address.neighborhood, owner.address.number].filter(Boolean).join(', ')}
                  {owner.address.city && `, ${owner.address.city}`}
                  {owner.address.state && `, ${owner.address.state}`}
                </Text>
              </View>
            )}

            {!!petFeed.weight && (
              <View style={styles.infoRow}>
                <MaterialIcons name="scale" size={16} color="#fff" style={styles.infoIcon} />
                <Text style={styles.infoText}>{petFeed.weight}kg</Text>
              </View>
            )}

            {owner && owner.role === 'institution' && (
              <View style={styles.infoRow}>
                <Ionicons name="shield" size={16} color="#fff" style={styles.infoIcon} />
                <Text style={styles.infoText}>{owner.name}</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Sem mais pets por perto</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[
            styles.circleBtn, 
            { backgroundColor: '#E74C3C' },
            (loading || !petFeed) && styles.buttonDisabled
          ]} 
          onPress={onNope} 
          disabled={loading || !petFeed}
          accessibilityLabel="Não curtir"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="close" size={26} color="#fff" />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={[
            styles.circleBtn, 
            { backgroundColor: COLORS.primary },
            (loading || !petFeed) && styles.buttonDisabled
          ]} 
          onPress={onLike} 
          disabled={loading || !petFeed}
          accessibilityLabel="Curtir"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="heart" size={26} color="#fff" />
          )}
        </TouchableOpacity>
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
      borderRadius: 20,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      overflow: 'hidden',
      backgroundColor: COLORS.quarternary,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
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
      bottom: 16,
      left: 0,
      right: 0,
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
    cardInfo: {
      padding: 20,
      backgroundColor: '#363135',
      minHeight: 180,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    name: {
      color: '#fff',
      fontSize: 22,
      fontWeight: '700',
    },
    genderBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(182, 72, 160, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1.5,
      borderColor: '#B648A0',
    },
    description: {
      color: '#fff',
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 12,
      opacity: 0.95,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    infoIcon: {
      marginRight: 8,
      opacity: 0.9,
    },
    infoText: {
      color: '#fff',
      fontSize: 13,
      flex: 1,
      opacity: 0.9,
    },
    actions: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
    },
    circleBtn: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
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

