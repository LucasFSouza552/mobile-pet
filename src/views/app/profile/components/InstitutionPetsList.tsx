import React, { useCallback, useState } from 'react';
import { FlatList, Image, Text, View, StyleSheet, TouchableOpacity, ImageSourcePropType } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { petRemoteRepository } from '../../../../data/remote/repositories/petRemoteRepository';
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

interface InstitutionPetsListProps {
  institutionId: string;
  canManage?: boolean;
}

export default function InstitutionPetsList({ institutionId, canManage = false }: InstitutionPetsListProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const navigation = useNavigation<any>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await petRemoteRepository.getAllByInstitution(institutionId);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPet = (petId?: string, event?: any) => {
    if (!canManage || !petId) return;
    if (event) {
      event.stopPropagation();
    }
    navigation.getParent()?.navigate('EditPet', { petId });
  };

  const handlePetPress = (petId?: string) => {
    if (petId) {
      navigation.getParent()?.navigate('PetDetails', { petId });
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [institutionId])
  );

  return (
    <FlatList
      data={items}
      keyExtractor={(item: any, index) => String(item?.id ?? index)}
      refreshing={loading}
      onRefresh={load}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        canManage ? (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => navigation.getParent()?.navigate('NewPet')}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="plus" size={16} color={COLORS.primary} />
            <Text style={styles.addButtonText}>Cadastrar novo pet</Text>
          </TouchableOpacity>
        ) : null
      }
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyContainer}>
            <FontAwesome5 name="paw" size={48} color={COLORS.text} style={{ opacity: 0.3 }} />
            <Text style={styles.emptyText}>Nenhum pet cadastrado pela instituição.</Text>
          </View>
        ) : null
      }
      renderItem={({ item }) => {
        const firstImage = item?.avatar ?? item?.images?.[0];
        const imageSource = getImageSource(firstImage);
        const genderText = item?.gender?.toLowerCase() === 'female' ? 'Fêmea' : 
                          item?.gender?.toLowerCase() === 'male' ? 'Macho' : 
                          item?.gender || '';

        return (
          <TouchableOpacity
            style={styles.petCard}
            onPress={() => handlePetPress(item?.id)}
            activeOpacity={0.7}
          >
            <View style={styles.imageContainer}>
              <Image source={imageSource} style={styles.petImage} />
            </View>
            <View style={styles.petInfo}>
              <View style={styles.infoHeader}>
                <Text style={styles.petName}>{item?.name ?? 'Pet'}</Text>
                {!item?.adopted && (
                  <View style={styles.statusBadge}>
                    <Text style={styles.statusBadgeText}>Disponível</Text>
                  </View>
                )}
              </View>
              <View style={styles.badgesRow}>
                {!!item?.type && (
                  <View style={[styles.badge, { backgroundColor: COLORS.primary }]}>
                    <Text style={styles.badgeText}>{String(item.type)}</Text>
                  </View>
                )}
                {genderText && (
                  <View style={[styles.badge, { backgroundColor: COLORS.primary + '20', borderWidth: 1, borderColor: COLORS.primary + '40' }]}>
                    <Text style={[styles.badgeText, { color: COLORS.primary }]}>{genderText}</Text>
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
            {canManage && (
              <TouchableOpacity
                style={styles.editButton}
                onPress={(e) => handleEditPet(item?.id, e)}
                activeOpacity={0.7}
              >
                <FontAwesome5 name="edit" size={14} color={COLORS.bg} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        );
      }}
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
    infoHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      gap: 8,
    },
    petName: {
      fontWeight: '700',
      fontSize: 18,
      color: COLORS.text,
      flex: 1,
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
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: '#10b981',
    },
    statusBadgeText: {
      color: COLORS.bg,
      fontSize: 10,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginHorizontal: 16,
      marginBottom: 16,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: COLORS.primary,
      backgroundColor: COLORS.primary + '10',
    },
    addButtonText: {
      color: COLORS.primary,
      fontWeight: '700',
      fontSize: 15,
    },
    editButton: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: COLORS.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyText: {
      textAlign: 'center',
      color: COLORS.text,
      opacity: 0.6,
      marginTop: 16,
      fontSize: 14,
    },
  });
}


