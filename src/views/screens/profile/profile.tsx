import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useAccount } from '../../../context/AccountContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_URL } from '@env';

const screenWidth = Dimensions.get('window').width;

export default function Profile({ navigation }: any) {
  const { account, refreshAccount } = useAccount();

  useEffect(() => {
    refreshAccount();
  }, [])

  if (!account) {
    navigation.navigate('Welcome');
    return;
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
            <Text style={styles.posts}>{account.countPost} Publicações</Text>
          </View>
        </View>
      </View>
      <View style={styles.postContainer}>
        <View style={styles.postHeaderContainer}>
          <SelectMenuOption text='Seus posts' />
          <SelectMenuOption text='Pets desejados' />
          <SelectMenuOption text='Histórico' />
        </View>
        <View>
          <View>
            <Text>Post</Text>
          </View>
          <View>
            <Text>Pets desejados</Text>
          </View>
          <View>
            <Text>Histórico</Text>
          </View>
        </View>
      </View>
      <View style={styles.background}>
      </View>
    </SafeAreaView>
  );
}

const SelectMenuOption = ({ text }: { text: string }) => {
  return (
    <View>
      <Text style={styles.selectedMenuItem}>{text}</Text>
    </View>
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
  postContainer: {
    backgroundColor: '#332630',
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
    color: '#fff',
    backgroundColor: '#9F4A95',
    borderRadius: 15,
    padding: 8,
  }
});
