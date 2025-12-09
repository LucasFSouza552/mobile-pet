import { useCallback, useEffect, useState } from 'react';
import { useAccount } from '../../context/AccountContext';
import { usePost } from '../../context/PostContext';
import { useFocusEffect } from '@react-navigation/native';
import { accountRemoteRepository } from '../../data/remote/repositories/accountRemoteRepository';
import { useToast } from '../../hooks/useToast';

export type ProfileTab = 'posts' | 'pets' | 'adopted' | 'wishlist' | 'history';

interface UseProfileControllerProps {
  route?: { params?: { accountId?: string } };
  navigation: any;
}

export function useProfileController({ route, navigation }: UseProfileControllerProps) {
  const { account, loading } = useAccount();
  const { userPosts, loadMoreUserPosts, refreshUserPosts, loading: postsLoading, error: postsError } = usePost();
  const toast = useToast();
  
  const [viewAccount, setViewAccount] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  
  const targetAccountId = route?.params?.accountId ?? account?.id ?? null;
  const isSelf = !!account?.id && targetAccountId === account.id;
  useFocusEffect(
    useCallback(() => {
      if (targetAccountId) {
        refreshUserPosts(targetAccountId);
      }
    }, [targetAccountId])
  );

  useEffect(() => {
    if (!loading && !account && !route?.params?.accountId) {
      navigation.navigate('Welcome');
    }
  }, [loading, account, navigation, route?.params?.accountId]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!targetAccountId || loading) {
        if (active) setViewAccount(account || null);
        return;
      }
      if (isSelf) {
        if (active) setViewAccount(account || null);
        return;
      }
      try {
        const other = await accountRemoteRepository.getById(targetAccountId);
        if (active) setViewAccount(other);
      } catch {
        if (active) setViewAccount(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [targetAccountId, account, loading, isSelf]);

  useEffect(() => {
    if (postsError) {
      toast.handleApiError(postsError, postsError);
      return;
    }
  }, [postsError, toast]);

  const handleLoadMorePosts = useCallback(() => {
    if (targetAccountId) {
      return loadMoreUserPosts(targetAccountId);
    }
  }, [targetAccountId, loadMoreUserPosts]);

  const handleRefreshPosts = useCallback(() => {
    if (targetAccountId) {
      return refreshUserPosts(targetAccountId);
    }
  }, [targetAccountId, refreshUserPosts]);

  return {
    viewAccount,
    activeTab,
    loading,
    postsLoading,
    postsError,
    
    targetAccountId,
    isSelf,
    userPosts,
    
    setActiveTab,
    handleLoadMorePosts,
    handleRefreshPosts,
  };
}

