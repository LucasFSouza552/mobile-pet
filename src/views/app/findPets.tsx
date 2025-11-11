import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { accountRemoteRepository } from '../../data/remote/repositories/accountRemoteRepository';
import { pictureRepository } from '../../data/remote/repositories/pictureRemoteRepository';
import { useIsFocused } from '@react-navigation/native';
import { IPet } from '../../models/IPet';
import { IAccount } from '../../models/IAccount';
import { accountPetInteractionLocalRepository } from '../../data';
import { petRemoteRepository } from '../../data/remote/repositories/petRemoteRepository';

export default function FindPets() {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);

  const isFocused = useIsFocused();
  const [petFeed, setPetFeed] = useState<IPet | null>(null);
  const [loading, setLoading] = useState(false);
  // owner vem em petFeed.account quando o backend inclui relacionamento

  const loadNextPet = async () => {
    try {
      setLoading(true);
      const data = await accountRemoteRepository.fetchFeed();
      console.log(data);
      setPetFeed(data || null);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: 'Erro ao carregar feed', text2: e?.message, position: 'bottom' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadNextPet();
    }
  }, [isFocused]);

  const owner: IAccount | null = petFeed && typeof (petFeed as any).account === 'object'
    ? ((petFeed as any).account as IAccount)
    : null;

  const onNope = async () => {
    if (!petFeed) return;
    await petRemoteRepository.rejectPetAdoption(petFeed.id);
    await loadNextPet();
  };

  const onLike = async () => {
    if (!petFeed) return;
    await petRemoteRepository.requestPetAdoption(petFeed.id);
    await loadNextPet();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Encontre seu novo amigo</Text>
      {loading ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Carregando...</Text>
        </View>
      ) : petFeed ? (
        <View style={styles.card}>
          {petFeed.images && petFeed.images.length > 1 ? (
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={{ flex: 1 }}>
              {petFeed.images.map((imgId, i) => (
                <Image key={`${imgId}-${i}`} source={pictureRepository.getSource(imgId)} style={styles.photo} />
              ))}
            </ScrollView>
          ) : (
            <Image source={pictureRepository.getSource(petFeed.images?.[0])} style={styles.photo} />
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.name}>{petFeed.name}</Text>
            <View style={styles.badgesRow}>
              <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                <Text style={styles.badgeText}>{petFeed.type}</Text>
              </View>
              {!!petFeed.gender && (
                <View style={[styles.badge, { backgroundColor: COLORS.tertiary }]}>
                  <Text style={styles.badgeText}>{petFeed.gender === 'M' ? 'Macho' : 'Fêmea'}</Text>
                </View>
              )}
              {typeof petFeed.age === 'number' && (
                <View style={[styles.badge, { backgroundColor: COLORS.tertiary }]}>
                  <Text style={styles.badgeText}>{petFeed.age} ano{petFeed.age === 1 ? '' : 's'}</Text>
                </View>
              )}
              {!!petFeed.weight && (
                <View style={[styles.badge, { backgroundColor: COLORS.tertiary }]}>
                  <Text style={styles.badgeText}>{petFeed.weight} kg</Text>
                </View>
              )}
            </View>
            {!!petFeed.description && <Text style={styles.meta}>{petFeed.description}</Text>}

            <View style={styles.ownerRow}>
              {owner ? (
                <>
                  <Image source={pictureRepository.getSource(owner.avatar)} style={styles.ownerAvatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ownerName}>{owner.name}</Text>
                    <Text style={styles.ownerMeta}>{owner.email || owner.phone_number}</Text>
                  </View>
                </>
              ) : null}
            </View>
          </View>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Sem mais pets por perto</Text>
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity style={[styles.circleBtn, { backgroundColor: '#E74C3C' }]} onPress={onNope} accessibilityLabel="Não curtir">
          <Ionicons name="close" size={26} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.circleBtn, { backgroundColor: COLORS.primary }]} onPress={onLike} accessibilityLabel="Curtir">
          <Ionicons name="heart" size={26} color="#fff" />
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
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: COLORS.quarternary,
    },
    photo: {
      width: '100%',
      flex: 1,
      resizeMode: 'cover',
    },
    cardInfo: {
      padding: 12,
      backgroundColor: 'rgba(0,0,0,0.3)',
    },
    badgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
      marginBottom: 6,
    },
    badge: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    badgeText: {
      color: COLORS.text,
      fontWeight: '700',
      fontSize: 12,
    },
    name: {
      color: COLORS.text,
      fontSize: 18,
      fontWeight: '700',
    },
    meta: {
      color: COLORS.text,
      opacity: 0.9,
      marginTop: 2,
    },
    ownerRow: {
      marginTop: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    ownerAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: COLORS.bg,
      borderWidth: 1,
      borderColor: COLORS.text,
    },
    ownerName: {
      color: COLORS.text,
      fontWeight: '700',
    },
    ownerMeta: {
      color: COLORS.text,
      opacity: 0.8,
      fontSize: 12,
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

