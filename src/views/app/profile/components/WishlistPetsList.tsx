import React, { useCallback, useState } from 'react';
import { FlatList, Image, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { accountPetInteractionSync } from '../../../../data/sync/accountPetInteractionSync';
import { petRemoteRepository } from '../../../../data/remote/repositories/petRemoteRepository';
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
      console.log(interactions);
      const likedPetIds = Array.from(
        new Set(interactions.filter(i => i.status === 'liked').map(i => i.pet))
      );
      const fetched = await Promise.all(
        likedPetIds.map(async (petId) => {
          try {
            return await petRemoteRepository.fetchPetById(petId);
          } catch {
            return null;
          }
        })
      );
      setItems(fetched.filter(Boolean));
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
            {!!item?.type ? <Text style={styles.petSub}>{item.type}</Text> : null}
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


