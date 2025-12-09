import { useState, useEffect, useCallback } from 'react';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { accountRemoteRepository } from '../../data/remote/repositories/accountRemoteRepository';
import { IAccount } from '../../models/IAccount';
import { useToast } from '../../hooks/useToast';

export function useDonateController() {
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();
  const toast = useToast();

  const [institutions, setInstitutions] = useState<IAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadInstitutions = useCallback(async () => {
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
  }, [toast, loading]);

  useEffect(() => {
    if (isFocused) {
      loadInstitutions();
    }
  }, [isFocused, loadInstitutions]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInstitutions();
  }, [loadInstitutions]);

  const handleDonate = useCallback((institution: IAccount | null) => {
    navigation?.navigate('DonationPage', { institution: institution || null });
  }, [navigation]);

  const handleDonateToUs = useCallback(() => {
    navigation?.navigate('DonationPage', { institution: null });
  }, [navigation]);

  return {
    // Estados
    institutions,
    loading,
    refreshing,
    
    // Handlers
    onRefresh,
    handleDonate,
    handleDonateToUs,
  };
}

