import React, { useEffect } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { splashStyles as styles } from '../../styles/pagesStyles/splashStyles';
import NetInfo from "@react-native-community/netinfo";
import { getStorage, removeStorage } from '../../utils/storange';
import { accountService } from '../../services/accountService';
import { runMigrations } from '../../data/local/database/migrations';

export default function Splash({ navigation }: any) {

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    const checkConnectionAndNavigate = async () => {
      
      await runMigrations();
      
      const netState = await NetInfo.fetch();

      if (!netState.isConnected) {
        navigation.navigate('Main');
        return;
      }

      const token = await getStorage('@token');
      if (token) {
        try {
          const account = await accountService.getProfile();

          if (account) {
            navigation.navigate('Main');
            return;
          }
        } catch (error) {
          await removeStorage('@token');
          navigation.replace('Welcome');
          throw error;
        }
      }

      timer = setTimeout(() => {
        navigation.replace('Welcome');
      }, 5000);
    };

    checkConnectionAndNavigate();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [navigation]);

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

