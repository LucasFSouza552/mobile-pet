import React, { useCallback, useState, useRef } from 'react';
import { FlatList, Image, Text, View, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { accountPetInteractionSync } from '../../../../data/sync/accountPetInteractionSync';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';
import { darkTheme, lightTheme } from '../../../../theme/Themes';
import { useTheme } from '../../../../context/ThemeContext';

const getImageSource = (imageId?: string | null): ImageSourcePropType => {
  if (!imageId) {
    return pictureRepository.getSource(undefined);
  }

  if (typeof imageId === 'string' && (imageId.startsWith('file://') || imageId.startsWith('/'))) {
    return { uri: imageId };
  }

  return pictureRepository.getSource(imageId);
};

interface WishlistPetsListProps {
  accountId: string;
  onFindPets: () => void;
}

export default function WishlistPetsList({ accountId, onFindPets }: WishlistPetsListProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const lastAccountIdRef = useRef<string | null>(null);

  const load = useCallback(async () => {
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      const interactions = await accountPetInteractionSync.getByAccount(accountId);
      
      const petsMap = new Map<string, any>();
      
      interactions.forEach((interaction: any) => {
        const status = String(interaction?.status ?? "").toLowerCase().trim();
        if (status !== "liked") {
          return;
        }
        
        const petData = interaction?.pet;
        
        if (!petData || typeof petData !== "object" || !petData?.id) {
          return;
        }
        
        if (petData.adopted === true || petData.adopted === 1) {
          return;
        }
        
        if (!petsMap.has(petData.id)) {
          petsMap.set(petData.id, petData);
        }
      });
      
      const uniquePets = Array.from(petsMap.values());

      setItems(uniquePets);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [accountId]);

  useFocusEffect(
    useCallback(() => {
      if (lastAccountIdRef.current !== accountId) {
        lastAccountIdRef.current = accountId;
        load();
      }
    }, [accountId, load])
  );

  return (
    <View style={{ flex: 1 }}>
    <FlatList
      data={items}
      keyExtractor={(item: any, index) => {
        const id = item?.id;
        if (id) {
          return String(id);
        }
        return `pet-${index}`;
      }}
      refreshing={loading}
      onRefresh={load}
      showsVerticalScrollIndicator={false}
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
      renderItem={({ item }) => {
        const firstImage = item?.images?.[0];
        const imageSource = getImageSource(firstImage);

        return (
          <View style={styles.petCard}>
            <View style={styles.imageContainer}>
              <Image source={imageSource} style={styles.petImage} />
            </View>
            <View style={styles.petInfo}>
              <Text style={styles.petName}>{item?.name ?? 'Pet'}</Text>
              <View style={styles.badgesRow}>
                {!!item?.type && (
                  <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                    <Text style={styles.badgeText}>{String(item.type)}</Text>
                  </View>
                )}
                {!!item?.gender && (
                  <View style={[styles.badge, { backgroundColor: COLORS.primary + '20', borderWidth: 1, borderColor: COLORS.primary + '40' }]}>
                    <Text style={[styles.badgeText, { color: COLORS.primary }]}>
                      {String(item.gender).toLowerCase() === 'female' ? 'Fêmea' :
                        String(item.gender).toLowerCase() === 'male' ? 'Macho' : String(item.gender)}
                    </Text>
                  </View>
                )}
                {typeof item?.age === 'number' && (
                  <View style={[styles.badge, { backgroundColor: COLORS.primary + '20', borderWidth: 1, borderColor: COLORS.primary + '40' }]}>
                    <Text style={[styles.badgeText, { color: COLORS.primary }]}>{item.age} ano{item.age === 1 ? '' : 's'}</Text>
                  </View>
                )}
                {!!item?.weight && (
                  <View style={[styles.badge, { backgroundColor: COLORS.primary + '20', borderWidth: 1, borderColor: COLORS.primary + '40' }]}>
                    <Text style={[styles.badgeText, { color: COLORS.primary }]}>{item.weight} kg</Text>
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
        )
      }}
    />
    </View>
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    petCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.tertiary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      marginHorizontal: 16,
      gap: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    imageContainer: {
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: COLORS.bg,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
    },
    petImage: {
      width: 80,
      height: 80,
      borderRadius: 14,
    },
    petInfo: {
      flex: 1,
      justifyContent: 'center',
    },
    petName: {
      fontWeight: '700',
      fontSize: 18,
      color: COLORS.text,
      marginBottom: 8,
    },
    badgesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 8,
    },
    badge: {
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeText: {
      color: COLORS.bg,
      fontWeight: '600',
      fontSize: 11,
    },
    description: {
      color: COLORS.text,
      opacity: 0.7,
      fontSize: 13,
      lineHeight: 18,
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


