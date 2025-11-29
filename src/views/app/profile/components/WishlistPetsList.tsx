import React, { useCallback } from 'react';
import { FlatList, Image, Text, View, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';
import { ThemeColors } from '../../../../theme/types';
import { useTheme } from '../../../../context/ThemeContext';
import { useWishPetsList } from './hooks/useWishPetsList';

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
  const navigation = useNavigation();
  const { items, loading, refreshing, error, load, onRefresh } = useWishPetsList(accountId);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item: any, index) => {
          const id = item?.id;
          if (id) {
            return String(id);
          }
          return `pet-${index}`;
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
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

          const handlePress = () => {
            if (item?.id) {
              (navigation as any).getParent()?.navigate('PetDetails', { petId: item.id });
            }
          };

          return (
            <TouchableOpacity
              style={styles.petCard}
              onPress={handlePress}
              activeOpacity={0.7}
            >
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
                      <Text style={[styles.badgeText]}>
                        {String(item.gender).toLowerCase() === 'female' ? 'Fêmea' :
                          String(item.gender).toLowerCase() === 'male' ? 'Macho' : String(item.gender)}
                      </Text>
                    </View>
                  )}
                  {typeof item?.age === 'number' && (
                    <View style={[styles.badge, { backgroundColor: COLORS.primary + '20', borderWidth: 1, borderColor: COLORS.primary + '40' }]}>
                      <Text style={[styles.badgeText]}>{item.age} ano{item.age === 1 ? '' : 's'}</Text>
                    </View>
                  )}
                  {!!item?.weight && (
                    <View style={[styles.badge, { backgroundColor: COLORS.primary + '20', borderWidth: 1, borderColor: COLORS.primary + '40' }]}>
                      <Text style={[styles.badgeText]}>{item.weight} kg</Text>
                    </View>
                  )}
                </View>
                {!!item?.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )
        }}
      />
    </View>
  );
}

function makeStyles(COLORS: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
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
      backgroundColor: COLORS.iconBackground,
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
      color: COLORS.text,
      fontWeight: '600',
      fontSize: 11,
    },
    description: {
      color: COLORS.text,
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
      color: COLORS.iconBackground,
      fontWeight: '700',
    },
  });
}


