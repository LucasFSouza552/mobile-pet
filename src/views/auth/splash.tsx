import React, { useEffect } from 'react';
import { ActivityIndicator, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { accountSync } from '../../data/sync/accountSync';
import { runMigrations } from '../../data/local/database/migrations';
import { Images } from '../../../assets';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../theme/types';

export default function Splash({ navigation }: any) {
  const { COLORS, scale, verticalScale } = useTheme();
  const { width } = useWindowDimensions();
  const styles = makeStyles(COLORS, scale, verticalScale, width);

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
      <ActivityIndicator size="large" color={COLORS.primary} />
    </SafeAreaView>
  );
}

function makeStyles(COLORS: ThemeColors, scale: (size: number) => number, verticalScale: (size: number) => number, width: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.secondary,
      paddingHorizontal: 20,
    },
    logo: {
      width: width * 0.4,
      height: width * 0.4,
      maxWidth: 200,
      minWidth: 120,
      marginBottom: verticalScale(20),
    },
  });
}

