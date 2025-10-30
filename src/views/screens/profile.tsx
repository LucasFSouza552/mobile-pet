import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useAccount } from '../../context/AccountContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@env';
import PrimaryButton from '../../components/Buttons/PrimaryButton';

const screenWidth = Dimensions.get('window').width;

export default function Profile({ navigation }: any) {
  const { account, loading, logout } = useAccount();


  useEffect(() => {
    if (!loading && account === null) {
      console.log('Nenhuma conta encontrada');
      navigation.replace('Welcome');
    }
  }, [loading, account, navigation]);

  if (loading || !account) {
    return <Text>Carregando...</Text>;
  }



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: `${API_URL}/picture/${account?.avatar}` }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{account.name}</Text>
          </View>
          <View style={styles.postsRow}>
            <Text style={styles.posts}>{account.postCount} Publicações</Text>
          </View>

          <PrimaryButton text='X' onPress={logout} />
        </View>
      </View>
      <View style={styles.background}>
      </View>
    </SafeAreaView>
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
