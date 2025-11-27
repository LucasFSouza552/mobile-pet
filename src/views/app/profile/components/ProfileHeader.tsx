import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome5, FontAwesome6, MaterialIcons } from '@expo/vector-icons';
import { darkTheme, lightTheme } from '../../../../theme/Themes';
import { pictureRepository } from '../../../../data/remote/repositories/pictureRemoteRepository';
import { IAccount } from '../../../../models/IAccount';
import { achievementsSync } from '../../../../data/sync/achievementsSync';
import { IAchievement } from '../../../../models/IAchievement';

interface ProfileHeaderProps {
  account: IAccount;
  COLORS: typeof lightTheme.colors | typeof darkTheme.colors;
  isSelf: boolean;
}

export default function ProfileHeader({ account, COLORS, isSelf }: ProfileHeaderProps) {
  const styles = makeStyles(COLORS);
  const navigation = useNavigation();
  const isInstitution = account?.role === 'institution';
  const [achievements, setAchievements] = useState<IAchievement[]>([]);

  const handleSettingsPress = () => {
    (navigation as any).getParent()?.navigate('ProfileSettings');
  };

  const handleNotificationsPress = () => {
    (navigation as any).getParent()?.navigate('InstitutionNotifications');
  };

  useEffect(() => {
    const loadAchievements = async () => {
      if (!account?.id) {
        setAchievements([]);
        return;
      }

      try {
        const accountAchievements = await achievementsSync.getByAccount(account.id);
        setAchievements(accountAchievements || []);
      } catch (error) {
        console.error('Erro ao carregar achievements:', error);
        setAchievements([]);
      }
    };

    loadAchievements();
  }, [account?.id]);

  const displayAchievements = useMemo(() => {
    return achievements.slice(0, 3);
  }, [achievements]);

  const hasMoreAchievements = achievements.length > 3;

  const getAchievementConfig = (type?: string) => {
    switch (type) {
      case 'donation':
        return {
          icon: 'shield-dog' as const,
          bgColor: '#A855F7',
          iconColor: '#FFFFFF',
        };
      case 'sponsorship':
        return {
          icon: 'handshake-simple' as const,
          bgColor: '#EC4899',
          iconColor: '#FFFFFF',
        };
      case 'adoption':
        return {
          icon: 'paw' as const,
          bgColor: '#3B82F6',
          iconColor: '#FFFFFF',
        };
      default:
        return {
          icon: 'star' as const,
          bgColor: '#8B5CF6',
          iconColor: '#FFFFFF',
        };
    }
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
          {account?.verified && (
            <MaterialIcons name="verified" size={18} color="#34D399" style={styles.verifiedIcon} />
          )}
          <Text style={styles.name}>{account?.name}</Text>
        </View>
        {achievements.length > 0 && (
          <View style={styles.achievementsRow}>
            {displayAchievements.map((achievement, index) => {
              const achievementConfig = getAchievementConfig(achievement?.type);
              return (
                <View
                  key={achievement?.id || index}
                  style={[
                    styles.achievementBadge,
                    { backgroundColor: achievementConfig.bgColor },
                    styles.achievementBadgeGlow,
                  ]}
                >
                  <FontAwesome6
                    name={achievementConfig.icon}
                    size={16}
                    color={achievementConfig.iconColor}
                  />
                </View>
              );
            })}
            {hasMoreAchievements && (
              <Text style={styles.achievementCount}>+{achievements.length - 3}</Text>
            )}
          </View>
        )}
        <View style={styles.postsRow}>
          <Text style={styles.posts}>{account?.postCount || 0} Publicações</Text>
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
      gap: 6,
    },
    verifiedIcon: {
      marginRight: 6,
    },
    name: {
      fontSize: 22,
      fontWeight: 'bold',
      color: COLORS.text,
    },
    achievementsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    achievementBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    achievementBadgeGlow: {
      shadowColor: '#fff',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.5,
      shadowRadius: 8,
      elevation: 8,
    },
    achievementCount: {
      fontSize: 12,
      color: COLORS.text,
      opacity: 0.7,
      fontWeight: '600',
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
