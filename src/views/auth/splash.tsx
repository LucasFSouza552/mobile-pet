import React, { useEffect } from 'react';
import { ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { splashStyles as styles } from '../../styles/pagesStyles/splashStyles';
import { accountSync } from '../../data/sync/accountSync';
import { runMigrations } from '../../data/local/database/migrations';
import { Images } from '../../../assets';

export default function Splash({ navigation }: any) {

  useEffect(() => {
    const checkConnectionAndNavigate = async () => {
      try {

        await runMigrations();

        const account = await accountSync.getProfile();
        if (account) {
          navigation.replace('Main');
          return;
        }

        navigation.replace('Welcome');
        return;

      } catch (error: any) {
        navigation.replace('Welcome');
      }
    };

    checkConnectionAndNavigate();

  }, [navigation]);
  return (
    <SafeAreaView style={styles.container}>
      <Image
        source={Images.logoPet}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator size="large" color="#B648A0" />
    </SafeAreaView>
  );
}

