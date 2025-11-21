import React, { useCallback, useState } from 'react';
import { FlatList, Image, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { accountPetInteractionSync } from '../../../../data/sync/accountPetInteractionSync';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';
import { darkTheme, lightTheme } from '../../../../theme/Themes';
import { useTheme } from '../../../../context/ThemeContext';

interface WishlistPetsListProps {
  accountId: string;
  onFindPets: () => void;
}

export default function WishlistPetsList({ accountId, onFindPets }: WishlistPetsListProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const interactions = await accountPetInteractionSync.getByAccount(accountId);
      const filtered = interactions.filter((interaction: any) => {
        const status = String(interaction?.status ?? "").toLowerCase();
        const allowed = status === "" || status === "liked" || status === "pending" || status === "requested";
        if (!allowed) return false;
        const petData = interaction?.pet;
        if (petData && typeof petData === "object") {
          return !petData?.adopted;
        }
        return true;
      });
      const pets = filtered
        .map(interaction => (typeof interaction?.pet === "object" ? interaction.pet : null))
        .filter(Boolean);
      setItems(pets as any[]);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [accountId])
  );



  return (
    <FlatList
      data={items}
      keyExtractor={(item: any, index) => String(item?.id ?? index)}
      refreshing={loading}
      onRefresh={load}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Sua lista de desejo está vazia.</Text>
            <TouchableOpacity style={styles.findButton} onPress={onFindPets}>
              <Text style={styles.findButtonText}>Encontrar Pets</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
      renderItem={({ item }) => (
        <View style={styles.petCard}>
          <Image source={pictureRepository.getSource(item?.avatar ?? item?.images?.[0])} style={styles.petImage} />
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{item?.name ?? 'Pet'}</Text>
            <View style={styles.badgesRow}>
              {!!item?.type && (
                <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                  <Text style={styles.badgeText}>{String(item.type)}</Text>
                </View>
              )}
              {!!item?.gender && (
                <View style={[styles.badge, { backgroundColor: COLORS.tertiary }]}>
                  <Text style={styles.badgeText}>
                    {String(item.gender).toLowerCase() === 'female' ? 'Fêmea' :
                     String(item.gender).toLowerCase() === 'male' ? 'Macho' : String(item.gender)}
                  </Text>
                </View>
              )}
              {typeof item?.age === 'number' && (
                <View style={[styles.badge, { backgroundColor: COLORS.tertiary }]}>
                  <Text style={styles.badgeText}>{item.age} ano{item.age === 1 ? '' : 's'}</Text>
                </View>
              )}
              {!!item?.weight && (
                <View style={[styles.badge, { backgroundColor: COLORS.tertiary }]}>
                  <Text style={styles.badgeText}>{item.weight} kg</Text>
                </View>
              )}
            </View>
            {!!item?.description && (
              <Text style={styles.description} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>
        </View>
      )}
      contentContainerStyle={items.length === 0 ? { flexGrow: 1, justifyContent: 'center' } : undefined}
    />
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    petCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.tertiary,
      padding: 10,
      borderRadius: 12,
      marginBottom: 10,
      gap: 10,
    },
    badgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 6,
      marginTop: 4,
      marginBottom: 4,
    },
    badge: {
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    badgeText: {
      color: COLORS.bg,
      fontWeight: '700',
      fontSize: 12,
    },
    petImage: {
      width: 60,
      height: 60,
      borderRadius: 10,
      backgroundColor: COLORS.bg,
    },
    petInfo: {
      flex: 1,
    },
    petName: {
      fontWeight: '700',
      color: COLORS.text,
      marginBottom: 2,
    },
    description: {
      color: COLORS.text,
      opacity: 0.9,
      fontSize: 12,
    },
    petSub: {
      color: COLORS.text,
      opacity: 0.8,
      fontSize: 12,
    },
    emptyBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyText: {
      textAlign: 'center',
      color: COLORS.text,
      opacity: 0.8,
      marginVertical: 12,
    },
    findButton: {
      marginTop: 10,
      backgroundColor: COLORS.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 12,
    },
    findButtonText: {
      color: COLORS.bg,
      fontWeight: '700',
    },
  });
}


