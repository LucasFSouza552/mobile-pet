import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useAccount } from '../../../context/AccountContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import PostList from '../../../components/Cards/PostList';
import { usePost } from '../../../context/PostContext';
import { useTheme } from '../../../context/ThemeContext';
import { darkTheme, lightTheme } from '../../../theme/Themes';
import { useFocusEffect } from '@react-navigation/native';
import { accountRemoteRepository } from '../../../data/remote/repositories/accountRemoteRepository';
import ProfileTopTabs from './components/ProfileTopTabs';
import AdoptedPetsList from './components/AdoptedPetsList';
import WishlistPetsList from './components/WishlistPetsList';
import InstitutionPetsList from './components/InstitutionPetsList';
import InstitutionDesiredPetsList from './components/InstitutionDesiredPetsList';
import UserHistoryList from './components/UserHistoryList';
import Toast from 'react-native-toast-message';
import ProfileHeader from './components/ProfileHeader';

const screenWidth = Dimensions.get('window').width;

interface ProfileProps {
  navigation: any;
  route?: { params?: { accountId?: string } };
}

export default function Profile({ navigation, route }: ProfileProps) {
  const { account, loading, logout, refreshAccount } = useAccount();
  const { userPosts, loadMoreUserPosts, refreshUserPosts, loading: postsLoading, error: postsError } = usePost();
  const { COLORS } = useTheme();
  const [viewAccount, setViewAccount] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'pets' | 'adopted' | 'wishlist' | 'history'>('posts');

  const targetAccountId = route?.params?.accountId ?? account?.id ?? null;
  const isSelf = !!account?.id && targetAccountId === account.id;

  const styles = makeStyles(COLORS);

  const isInstitution = account?.role === 'institution';

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
      if (!targetAccountId) {
        setViewAccount(account || null);
        return;
      }
      if (isSelf) {
        setViewAccount(account || null);
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
  }, [targetAccountId, account, isSelf]);

  useEffect(() => {
    if (postsError) {
      Toast.show({ type: "error", text1: postsError, position: "bottom" });
    }
  }, [postsError]);

  if (!viewAccount) {
    return null;
  }


  return (
    <SafeAreaView style={styles.container}>
      <ProfileHeader
        account={viewAccount}
        COLORS={COLORS}
        isSelf={isSelf}
        onEdit={() => navigation.getParent()?.navigate('EditProfile')}
        onLogout={async () => {
          await logout();
          navigation.navigate('Welcome');
        }}
      />

      {isInstitution && isSelf && (
        <TouchableOpacity
          style={styles.notificationsButton}
          onPress={() => navigation.getParent()?.navigate('InstitutionNotifications')}
        >
          <Text style={styles.notificationsButtonText}>Ver notificações de usuários</Text>
        </TouchableOpacity>
      )}

      <View style={styles.listContainer}>
        <ProfileTopTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          isInstitution={viewAccount?.role === 'institution'}
          COLORS={COLORS}
          showHistory={isSelf}
        />
        
        {activeTab === 'pets' && viewAccount?.role === 'institution' ? (
          targetAccountId ? <InstitutionPetsList institutionId={targetAccountId} canManage={isSelf} /> : null
        ) : activeTab === 'posts' ? (
          <PostList
            title={isSelf ? "Seus posts" : "Posts"}
            posts={userPosts}
            account={viewAccount}
            onEndReached={() => { if (targetAccountId) { return loadMoreUserPosts(targetAccountId); } }}
            onRefresh={() => { if (targetAccountId) { return refreshUserPosts(targetAccountId); } }}
            refreshing={postsLoading}
          />
        ) : activeTab === 'adopted' ? (
          targetAccountId ? <AdoptedPetsList accountId={targetAccountId} /> : null
        ) : activeTab === 'history' ? (
          isSelf && targetAccountId ? (
            <UserHistoryList accountId={targetAccountId} />
          ) : (
            <View style={styles.emptyHistoryBox}>
              <Text style={styles.emptyHistoryText}>O histórico completo só está disponível para o dono da conta.</Text>
            </View>
          )
        ) : (
          viewAccount?.role === 'institution'
            ? (targetAccountId ? <InstitutionDesiredPetsList institutionId={targetAccountId} /> : null)
            : (targetAccountId ? <WishlistPetsList accountId={targetAccountId} onFindPets={() => navigation.getParent()?.navigate('FindPets')} /> : null)
        )}
      </View>
    </SafeAreaView>
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.secondary
    },
    headerActions: {
      flexDirection: 'row',
      gap: 8,
    },
    editButton: {
      backgroundColor: COLORS.tertiary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    editText: {
      color: COLORS.text,
      fontWeight: '600',
    },
    logoutButton: {
      backgroundColor: COLORS.tertiary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    logoutText: {
      color: COLORS.text,
      fontWeight: '600',
    },
    background: {
      flex: 1,
      width: screenWidth,
      height: 400,
      justifyContent: 'center',
      alignItems: 'center',
    },
    listContainer: {
      flex: 1,
      width: '100%',
      paddingHorizontal: 12,
      paddingTop: 12,
    },
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
    wishlistBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
    notificationsButton: {
      marginTop: 12,
      marginHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: COLORS.primary,
      alignItems: 'center',
    },
    notificationsButtonText: {
      color: COLORS.bg,
      fontWeight: '700',
    },
    emptyHistoryBox: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },
    emptyHistoryText: {
      color: COLORS.text,
      opacity: 0.8,
      textAlign: 'center',
      fontSize: 14,
    },
    postContainer: {
      backgroundColor: COLORS.quarternary,
      marginTop: 20,
      width: screenWidth,
      alignItems: 'center',
    },
    postHeaderContainer: {
      width: screenWidth,
      padding: 16,
      display: "flex",
      gap: 5,
      justifyContent: "center",
      flexDirection: "row"
    },
    selectedMenuItem: {
      display: "flex",
      textAlign: "center",
      color: COLORS.text,
      backgroundColor: COLORS.tertiary,
      borderRadius: 15,
      padding: 8,
    }
  });
}

