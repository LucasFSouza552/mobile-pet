import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5 } from '@expo/vector-icons';
import { darkTheme, lightTheme } from '../../../../theme/Themes';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';

interface ProfileHeaderProps {
  account: any;
  COLORS: typeof lightTheme.colors | typeof darkTheme.colors;
  isSelf: boolean;
}

export default function ProfileHeader({ account, COLORS, isSelf }: ProfileHeaderProps) {
  const styles = makeStyles(COLORS);
  const navigation = useNavigation();
  const isInstitution = account?.role === 'institution';

  const handleSettingsPress = () => {
    (navigation as any).getParent()?.navigate('ProfileSettings');
  };

  const handleNotificationsPress = () => {
    (navigation as any).getParent()?.navigate('InstitutionNotifications');
  };

  return (
    <View style={styles.header}>
      <View style={styles.avatarWrapper}>
        <Image
          source={pictureRepository.getSource(account?.avatar)}
          style={styles.avatar}
        />
      </View>
      <View style={styles.headerInfo}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{account?.name}</Text>
        </View>
        <View style={styles.postsRow}>
          <Text style={styles.posts}>{account?.postCount} Publicações</Text>
        </View>
      </View>
      {isSelf ? (

        <View style={styles.buttonsRow}>
          {isInstitution && <TouchableOpacity
            style={styles.notificationsButton}
            onPress={handleNotificationsPress}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="bell" size={20} style={styles.notificationsIcon} />
          </TouchableOpacity>}
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
            activeOpacity={0.7}
          >
            <FontAwesome5 name="cog" size={20} style={styles.settingsIcon} />
          </TouchableOpacity>
        </View>
      ) : null}

    </View>
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      backgroundColor: COLORS.primary,
      paddingHorizontal: 12,
      paddingVertical: 10,
      width: '100%',
    },
    avatarWrapper: {
      borderWidth: 2,
      borderColor: COLORS.bg,
      borderRadius: 44,
      marginRight: 10,
    },
    avatar: {
      width: 70,
      height: 70,
      borderRadius: 100,
      backgroundColor: COLORS.bg,
    },
    headerInfo: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
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
    settingsButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: COLORS.tertiary + '40',
    },
    notificationsButton: {
      padding: 8,
      marginLeft: 8,
      borderRadius: 20,
      backgroundColor: COLORS.tertiary + '40',
    },
    notificationsIcon: {
      color: COLORS.text,
    },
    settingsIcon: {
      color: COLORS.text,
      width: 20,
      height: 20,
    },
    buttonsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
  });
}


