import React, { useContext, useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useAccount } from '../../context/AccountContext';

const screenWidth = Dimensions.get('window').width;

export default function Profile() {
  const { account, refreshAccount } = useAccount();

  useEffect(() => {
    refreshAccount();
  }, [])

  if(!account) {
    // carregar o skeleton
    console.log(account);
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: `http://10.0.2.2:3000/api/picture/${account?.avatar}` }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{account.name}</Text>
            <Text style={styles.badge}>🏅</Text>
            <Text style={styles.badge}>🐾</Text>
          </View>
          <View style={styles.postsRow}>
            <Text style={styles.posts}>985 Posts</Text>
            <Text style={styles.posts}>1.294 Posts</Text>
          </View>
        </View>
      </View>
      <View style={styles.background}>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2B2B2B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B648A0',
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fff',
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
    color: '#fff',
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
    color: '#fff',
    backgroundColor: '#9F4A95',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
  },
  background: {
    flex: 1,
    width: screenWidth,
    height: 400, 
    justifyContent: 'center',
    alignItems: 'center',
  },
});
