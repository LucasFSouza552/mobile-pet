import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { accountRemoteRepository } from '../../../data/remote/repositories/accountRemoteRepository';
import { pictureRepository } from '../../../data/remote/repositories/pictureRemoteRepository';
import { IAccount } from '../../../models/IAccount';
import { useToast } from '../../../hooks/useToast';
import { useIsFocused } from '@react-navigation/native';

export default function Donate({ navigation }: any) {
  const { COLORS } = useTheme();
  const styles = makeStyles(COLORS);
  const isFocused = useIsFocused();
  const toast = useToast();
  
  const [institutions, setInstitutions] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadInstitutions = async () => {
    try {
      setLoading(true);
      let accounts: IAccount[] = [];
      
      try {
        const allAccounts = await accountRemoteRepository.adminFetchAllAccounts();
        if (Array.isArray(allAccounts)) {
          accounts = allAccounts;
        }
      } catch (adminError) {
        try {
          const searchResults = await accountRemoteRepository.searchAccount();
          if (Array.isArray(searchResults)) {
            accounts = searchResults;
          }
        } catch (searchError) {
          try {
            const emptySearch = await accountRemoteRepository.fetchAccountByName('');
            if (Array.isArray(emptySearch)) {
              accounts = emptySearch;
            }
          } catch {
            accounts = [];
          }
        }
      }
      
      const institutionsList = accounts.filter((acc: IAccount) => acc.role === 'institution');
      setInstitutions(institutionsList);
      
      if (institutionsList.length === 0 && !loading) {
        toast.info('Nenhuma instituição encontrada', 'Tente atualizar a lista');
      }
    } catch (error: any) {
      toast.handleApiError(error, error?.data?.message || 'Erro ao carregar instituições');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadInstitutions();
    }
  }, [isFocused]);

  const onRefresh = () => {
    setRefreshing(true);
    loadInstitutions();
  };

  const handleDonate = (institution: IAccount | null) => {
    navigation?.navigate('DonationPage', { institution: institution || null });
  };

  const handleDonateToUs = () => {
    navigation?.navigate('DonationPage', { institution: null });
  };

  const renderInstitution = ({ item }: { item: IAccount }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => handleDonate(item)}
      activeOpacity={0.7}
    >
      <Image 
        source={pictureRepository.getSource(item.avatar)} 
        style={styles.avatar} 
      />
      <View style={styles.cardInfo}>
        <Text style={styles.name}>{item.name}</Text>
        {item.address?.city && (
          <Text style={styles.location}>
            {item.address.city}, {item.address.state}
          </Text>
        )}
        {item.verified && (
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verificado</Text>
          </View>
        )}
      </View>
      <View style={styles.arrowContainer}>
        <Text style={styles.arrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Faça uma Doação</Text>
        <Text style={styles.subtitle}>Sua ajuda faz a diferença na vida de muitos animais</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Carregando instituições...</Text>
        </View>
      ) : (
        <FlatList
          data={institutions}
          renderItem={renderInstitution}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <TouchableOpacity 
              style={styles.ourCard} 
              onPress={handleDonateToUs}
              activeOpacity={0.7}
            >
              <View style={styles.ourCardContent}>
                <View style={styles.ourCardIcon}>
                  <Text style={styles.ourCardIconText}>❤️</Text>
                </View>
                <View style={styles.ourCardInfo}>
                  <Text style={styles.ourCardTitle}>Doe para nós</Text>
                  <Text style={styles.ourCardSubtitle}>
                    Ajude a manter o PetAmigo funcionando
                  </Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Text style={[styles.arrow, { color: '#fff', opacity: 0.9 }]}>›</Text>
                </View>
              </View>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma instituição encontrada</Text>
              <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                <Text style={styles.refreshButtonText}>Tentar novamente</Text>
              </TouchableOpacity>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(COLORS: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary,
    },
    header: {
      padding: 20,
      paddingBottom: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: COLORS.text,
      opacity: 0.7,
    },
    list: {
      padding: 16,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: COLORS.quarternary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    avatar: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: COLORS.bg,
    },
    cardInfo: {
      flex: 1,
      marginLeft: 12,
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.text,
      marginBottom: 4,
    },
    location: {
      fontSize: 14,
      color: COLORS.text,
      opacity: 0.6,
      marginBottom: 4,
    },
    verifiedBadge: {
      alignSelf: 'flex-start',
      backgroundColor: COLORS.primary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      marginTop: 4,
    },
    verifiedText: {
      fontSize: 12,
      color: '#fff',
      fontWeight: '600',
    },
    arrowContainer: {
      marginLeft: 8,
    },
    arrow: {
      fontSize: 24,
      color: COLORS.text,
      opacity: 0.5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: COLORS.text,
      opacity: 0.7,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 40,
    },
    emptyText: {
      fontSize: 16,
      color: COLORS.text,
      opacity: 0.7,
      textAlign: 'center',
      marginBottom: 20,
    },
    refreshButton: {
      backgroundColor: COLORS.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 20,
    },
    refreshButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    ourCard: {
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
    ourCardContent: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ourCardIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    ourCardIconText: {
      fontSize: 32,
    },
    ourCardInfo: {
      flex: 1,
    },
    ourCardTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 4,
    },
    ourCardSubtitle: {
      fontSize: 14,
      color: '#fff',
      opacity: 0.9,
    },
  });
}

