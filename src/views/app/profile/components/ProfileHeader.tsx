import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../../../../theme/Themes';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';
import ProfileHeaderMenu from '../ProfileHeaderMenu';

interface ProfileHeaderProps {
  account: any;
  COLORS: typeof lightTheme.colors | typeof darkTheme.colors;
  isSelf: boolean;
  onEdit: () => void;
  onLogout: () => Promise<void> | void;
}

export default function ProfileHeader({ account, COLORS, isSelf, onEdit, onLogout }: ProfileHeaderProps) {
  const styles = makeStyles(COLORS);
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
        <ProfileHeaderMenu
          COLORS={COLORS}
          onEdit={onEdit}
          onLogout={onLogout}
        />
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
  });
}


