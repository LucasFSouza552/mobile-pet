import React, { useCallback, useState } from 'react';
import { FlatList, Image, Text, View, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { petRemoteRepository } from '../../../../data/remote/repositories/petRemoteRepository';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';
import { darkTheme, lightTheme } from '../../../../theme/Themes';
import { useTheme } from '../../../../context/ThemeContext';

interface InstitutionPetsListProps {
  institutionId: string;
}

export default function InstitutionPetsList({ institutionId }: InstitutionPetsListProps) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
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
      ListEmptyComponent={!loading ? <Text style={styles.emptyText}>Nenhum pet cadastrado pela instituição.</Text> : null}
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
    emptyText: {
      textAlign: 'center',
      color: COLORS.text,
      opacity: 0.8,
      marginVertical: 12,
    },
  });
}


