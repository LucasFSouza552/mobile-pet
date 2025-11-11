import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import PostList from '../../components/Cards/PostList';
import { usePost } from '../../context/PostContext';
import { useAccount } from '../../context/AccountContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

interface CommunityPageProps {
  navigation: any;
}

export default function Community({ navigation }: CommunityPageProps) {

  const { posts, fetchMore, refresh, loading: postsLoading } = usePost();
  const { account, loading, logout, refreshAccount } = useAccount();
  const [showTopics, setShowTopics] = useState(false);

  const communities = [
    { name: 'Amicão', icon: 'paw' },
    { name: 'Gato Feliz', icon: 'paw' },
    { name: 'SOS Pets', icon: 'paw' },
  ];

  const topics = [
    'Adoção e Resgate',
    'Saúde e Bem-estar',
    'Adestramento',
    'Cuidados Diários',
    'Produtos e Serviços',
  ];

  useEffect(() => {
    if (!loading && !account) {
      navigation.navigate('Welcome');
    }
  }, [loading, account, navigation]);

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [])
  );

  if (!account) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FontAwesome name="paw" size={24} color="#fff" />
          <Text style={styles.headerTitle}>Comunidade PetAmigo</Text>
        </View>
        <TouchableOpacity
          style={styles.headerIconButton}
          onPress={() => setShowTopics(prev => !prev)}
          accessibilityLabel="Abrir menu de assuntos"
        >
          <FontAwesome name="bars" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {showTopics && (
        <>
          <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowTopics(false)} />
          <View style={styles.menuContainer}>
            <Text style={styles.menuTitle}>Assuntos</Text>
            {topics.map((topic, i) => (
              <TouchableOpacity key={i} style={styles.menuItem}>
                <Text style={styles.menuItemText}>{topic}</Text>
                <FontAwesome name="chevron-right" size={14} color="#B648A0" />
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      <View style={styles.listContainer}>
      <PostList title="Comunidade" posts={posts} account={account} onEndReached={fetchMore} onRefresh={refresh} refreshing={postsLoading} />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  listContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    backgroundColor: '#2c2a2e',
    flex: 1,
  },
  header: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B648A0',
    paddingHorizontal: 15,
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#B648A0',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  headerIconButton: {
    padding: 6,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    flex: 1,
  },
  menuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    left: 15,
    right: 15,
    backgroundColor: '#363135',
    borderRadius: 10,
    padding: 12,
    zIndex: 10,
    elevation: 4,
  },
  menuTitle: {
    color: '#B648A0',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#B648A0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  menuItemText: {
    color: '#fff',
  },
  section: {
    marginBottom: 25,
    backgroundColor: '#363135',
    borderRadius: 10,
    padding: 15,
  },
  postCard: {
    backgroundColor: '#2c2a2e',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  postUser: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  postText: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 10,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  iconButton: {
    padding: 5,
  },
  communityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  communityText: {
    color: '#fff',
    marginLeft: 8,
  },
});

