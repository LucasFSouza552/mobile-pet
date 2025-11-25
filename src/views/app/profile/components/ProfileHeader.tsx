import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { darkTheme, lightTheme } from '../../../../theme/Themes';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';
import type { IAchievement } from '../../../../models/IAchievement';

interface ProfileHeaderProps {
  account: any;
  COLORS: typeof lightTheme.colors | typeof darkTheme.colors;
  isSelf: boolean;
  achievements?: IAchievement[];
}

export default function ProfileHeader({ account, COLORS, isSelf, achievements = [] }: ProfileHeaderProps) {
  const styles = makeStyles(COLORS);
  const navigation = useNavigation();

  const handleSettingsPress = () => {
    (navigation as any).getParent()?.navigate('ProfileSettings');
  };

  const renderAchievementBadge = (achievement: IAchievement, index: number) => {
    let iconName: string;
    let IconComponent: any;
    let color: string;
    
    switch (achievement.type) {
      case "adoption":
        IconComponent = MaterialIcons;
        iconName = "pets";
        color = "#BC2DEB";
        break;
      case "donation":
        IconComponent = FontAwesome5;
        iconName = "shield-dog";
        color = "#E02880";
        break;
      case "sponsorship":
        IconComponent = FontAwesome5;
        iconName = "hands-helping";
        color = "#427AF4";
        break;
      default:
        return null;
    }

    return (
      <View key={index} style={styles.badgeContainer}>
        <IconComponent 
          name={iconName} 
          size={18} 
          color={color} 
        />
      </View>
    );
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
          {account?.verified && (
            <MaterialIcons name="verified" size={18} color="#00D9FF" style={styles.verifiedBadge} />
          )}
          {achievements.map((achievement, index) => renderAchievementBadge(achievement, index))}
        </View>
        <View style={styles.postsRow}>
          <Text style={styles.posts}>{account?.postCount || 0} Publicações</Text>
        </View>
      </View>
      {isSelf ? (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsPress}
          activeOpacity={0.7}
        >
          <FontAwesome5 name="cog" size={20} color={COLORS.text} />
        </TouchableOpacity>
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
    verifiedBadge: {
      marginLeft: 4,
    },
    badgeContainer: {
      marginLeft: 6,
      padding: 2,
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
  });
}


