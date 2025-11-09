import React, { useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, Button } from 'react-native';
import { useAccount } from '../../../context/AccountContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pictureRepository } from '../../../data/remote/repositories/pictureRemoteRepository';
import PostList from '../../../components/Cards/PostList';
import { usePost } from '../../../context/PostContext';
import { useTheme } from '../../../context/ThemeContext';
import { darkTheme, lightTheme } from '../../../theme/Themes';

const screenWidth = Dimensions.get('window').width;

interface ProfileProps {
  navigation: any;
}

export default function Profile({ navigation }: ProfileProps) {
  const { account, loading, logout, refreshAccount } = useAccount();
  const { userPosts, loadMoreUserPosts, refreshUserPosts, loading: postsLoading } = usePost();
  const { COLORS } = useTheme();

  useEffect(() => {
    if (account?.id) {
      refreshUserPosts(account.id);
    }
  }, []);

  useEffect(() => {
    console.log("userPosts", userPosts.map(post => post.id));
  }, [userPosts]);

  useEffect(() => {
    if (!loading && !account) {
      navigation.navigate('Welcome');
    }
  }, [loading, account, navigation]);

  useEffect(() => {
    console.log("userPosts", userPosts.length);
  }, [userPosts]);


  if (!account) {
    return null;
  }

  const styles = makeStyles(COLORS);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <Image
            source={pictureRepository.getSource(account?.avatar)}
            style={styles.avatar}
          />
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{account.name}</Text>
          </View>
          <View style={styles.postsRow}>
            <Text style={styles.posts}>{account.postCount} Publicações</Text>
          </View>
        </View>
        <TouchableOpacity
          accessibilityLabel="Sair da conta"
          style={styles.logoutButton}
          onPress={async () => {
            await logout();
            navigation.navigate('Welcome');
          }}
        >
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.listContainer}>
        <PostList
          title="Seus posts"
          posts={userPosts}
          account={account}
          onEndReached={() => loadMoreUserPosts(account.id)}
          onRefresh={() => refreshUserPosts(account.id)}
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
      paddingHorizontal: 12,
      paddingTop: 12,
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

