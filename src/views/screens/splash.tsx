import React, { useEffect } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { splashStyles as styles } from '../../styles/pagesStyles/splashStyles';
import NetInfo from "@react-native-community/netinfo";
import { getStorage, removeStorage, saveStorage } from '../../utils/storange';
import { accountService } from '../../services/accountService';
import { runMigrations } from '../../data/local/database/migrations';

export default function Splash({ navigation }: any) {

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    const checkConnectionAndNavigate = async () => {
      try {
        await runMigrations();

        const netState = await NetInfo.fetch();
        const token = await getStorage('@token');

        if (!netState.isConnected && token) {
          navigation.replace('Main');
          return;
        }

        if (token) {
          try {
            const account = await accountService.getProfile();

            if (!account) {
              await removeStorage('@token');
              navigation.replace('Welcome');
              return;
            }

            navigation.replace('Main');
            return;
          } catch (error) {
            await removeStorage('@token');
            navigation.replace('Welcome');
            return;
          }
        }

        timer = setTimeout(() => {
          navigation.replace('Welcome');
        }, 10000);
      } catch (error: any) {
        console.error('Erro em Splash:', error);
        try {
          await removeStorage('@token');
        } catch (e) {

        }
        navigation.replace('Welcome');
      }
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

