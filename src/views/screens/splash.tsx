import React, { useEffect } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { splashStyles as styles } from '../../styles/pagesStyles/splashStyles';
import NetInfo from "@react-native-community/netinfo";
import { getStorage } from '../../utils/storange';
import { accountService } from '../../services/accountService';

export default function Splash({ navigation }: any) {
  useEffect(() => {

  }, [navigation]);

  useEffect(() => {
    (async () => {
      const netState = await NetInfo.fetch();

      if (!netState.isConnected) {
        navigation.navigate('Main');
        return;
      }

      const token = await getStorage('@token');
      if (token) {
        const account = await accountService.getProfile();
        if (account) {
          navigation.navigate('Main');
          return;
        }
      }

      const timer = setTimeout(() => {
        navigation.replace('Welcome');
      }, 3000);

      return () => clearTimeout(timer);
    })();
  }, [navigation])

  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={require('../../../assets/img/logoPet.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#B648A0" />
    </SafeAreaView>
  );
}

