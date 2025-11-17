import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useAccount } from '../../../context/AccountContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pictureRepository } from '../../../data/remote/repositories/pictureRemoteRepository';
import PostList from '../../../components/Cards/PostList';
import { usePost } from '../../../context/PostContext';
import { useTheme } from '../../../context/ThemeContext';
import { darkTheme, lightTheme } from '../../../theme/Themes';
import { useFocusEffect } from '@react-navigation/native';
import { accountRemoteRepository } from '../../../data/remote/repositories/accountRemoteRepository';
import Toast from 'react-native-toast-message';
import ProfileHeaderMenu from './ProfileHeaderMenu';

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
      Toast.show({ type: "error",  text1: postsError, position: "bottom" });
    }
  }, [postsError]);

  if (!viewAccount) {
    return null;
  }

  const styles = makeStyles(COLORS);

  const isInstitution = account?.role === 'institution';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <Image
            source={pictureRepository.getSource(viewAccount?.avatar)}
            style={styles.avatar}
          />
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{viewAccount?.name}</Text>
          </View>
          <View style={styles.postsRow}>
            <Text style={styles.posts}>{viewAccount?.postCount} Publicações</Text>
          </View>
        </View>
        {isSelf ? (
          <ProfileHeaderMenu
            COLORS={COLORS}
            onEdit={() => navigation.getParent()?.navigate('EditProfile')}
            onLogout={async () => {
              await logout();
              navigation.navigate('Welcome');
            }}
          />
        ) : null}
      </View>

      {isInstitution && isSelf && (
        <TouchableOpacity
          style={styles.notificationsButton}
          onPress={() => navigation.getParent()?.navigate('InstitutionNotifications')}
        >
          <Text style={styles.notificationsButtonText}>Ver notificações de usuários</Text>
        </TouchableOpacity>
      )}

      <View style={styles.listContainer}>
        <PostList
          title={isSelf ? "Seus posts" : "Posts"}
          posts={userPosts}
          account={viewAccount}
          onEndReached={() => { if (targetAccountId) { return loadMoreUserPosts(targetAccountId); } }}
          onRefresh={() => { if (targetAccountId) { return refreshUserPosts(targetAccountId); } }}
          refreshing={postsLoading}
        />
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      backgroundColor: COLORS.primary,
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 10,
    },
    avatarWrapper: {
      borderWidth: 2,
      borderColor: COLORS.bg,
      borderRadius: 44,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 100,
      backgroundColor: COLORS.bg,
    },
    headerInfo: {
      flex: 1,
      width: '100%',
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
      color: COLORS.text,
      marginRight: 8,
    },
    badge: {
      fontSize: 18,
      marginRight: 4,
    },
    postsRow: {
      flexDirection: 'row',
      marginTop: 4,
    },
    posts: {
      fontSize: 14,
      color: COLORS.bg,
      backgroundColor: COLORS.tertiary,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      marginRight: 6,
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

