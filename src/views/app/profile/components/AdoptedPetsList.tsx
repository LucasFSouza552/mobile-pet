import React, { useCallback, useState } from 'react';
import { FlatList, Image, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { petRemoteRepository } from '../../../../data/remote/repositories/petRemoteRepository';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';
import { ThemeColors } from '../../../../theme/types';
import { useTheme } from '../../../../context/ThemeContext';
import { formatDateOnly } from '../../../../utils/date';

interface AdoptedPetsListProps {
  accountId: string;
}

export default function AdoptedPetsList({ accountId }: AdoptedPetsListProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const navigation = useNavigation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await petRemoteRepository.getAdoptedPetsByAccount(accountId);
      setItems(Array.isArray(data) ? data : []);
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

  const handlePress = (petId: string) => {
    if (petId) {
      (navigation as any).getParent()?.navigate('PetDetails', { petId });
    }
  };

  return (
    <FlatList
      data={items}
      keyExtractor={(item: any, index) => String(item?.id ?? index)}
      refreshing={loading}
      onRefresh={load}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyBox}>
            <FontAwesome5 name="heart" size={48} color={COLORS.text} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Text style={styles.emptyText}>Nenhum pet adotado ainda.</Text>
            <Text style={styles.emptySubtext}>Quando você adotar um pet, ele aparecerá aqui.</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => {
        const firstImage = item?.avatar ?? item?.images?.[0];
        const imageSource = pictureRepository.getSource(firstImage);

        return (
          <TouchableOpacity
            style={styles.petCard}
            onPress={() => handlePress(item?.id)}
            activeOpacity={0.7}
          >
            <View style={styles.imageContainer}>
              <Image source={imageSource} style={styles.petImage} />
              <View style={styles.adoptedBadge}>
                <FontAwesome5 name="check-circle" size={16} color={COLORS.iconBackground} />
              </View>
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
                    <Text style={styles.badgeText}>
                      {String(item.gender).toLowerCase() === 'female' ? 'Fêmea' :
                        String(item.gender).toLowerCase() === 'male' ? 'Macho' : String(item.gender)}
                    </Text>
                  </View>
                )}
                {typeof item?.age === 'number' && (
                  <View style={[styles.badge, { backgroundColor: COLORS.primary + '20', borderWidth: 1, borderColor: COLORS.primary + '40' }]}>
                    <Text style={styles.badgeText}>{item.age} ano{item.age === 1 ? '' : 's'}</Text>
                  </View>
                )}
                {!!item?.weight && (
                  <View style={[styles.badge, { backgroundColor: COLORS.primary + '20', borderWidth: 1, borderColor: COLORS.primary + '40' }]}>
                    <Text style={styles.badgeText}>{item.weight} kg</Text>
                  </View>
                )}
              </View>
              {item?.adoptedAt && (
                <View style={styles.adoptedDateContainer}>
                  <FontAwesome5 name="calendar-check" size={12} color={COLORS.primary} />
                  <Text style={styles.adoptedDate}>Adotado em {formatDateOnly(item.adoptedAt)}</Text>
                </View>
              )}
              {!!item?.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      }}
      contentContainerStyle={items.length === 0 ? { flexGrow: 1, justifyContent: 'center', padding: 24 } : { paddingTop: 8, paddingBottom: 24 }}
    />
  );
}

function makeStyles(COLORS: ThemeColors) {
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
      backgroundColor: COLORS.iconBackground,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.15,
      shadowRadius: 3,
      elevation: 2,
      position: 'relative',
    },
    petImage: {
      width: 80,
      height: 80,
      borderRadius: 14,
    },
    adoptedBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: COLORS.iconBackground,
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
    adoptedDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 8,
    },
    adoptedDate: {
      color: COLORS.primary,
      fontSize: 12,
      fontWeight: '600',
    },
    description: {
      color: COLORS.text,
      fontSize: 13,
      lineHeight: 18,
    },
    emptyBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
    },
    emptyText: {
      textAlign: 'center',
      color: COLORS.text,
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    emptySubtext: {
      textAlign: 'center',
      color: COLORS.text,
      opacity: 0.6,
      fontSize: 14,
    },
  });
}


