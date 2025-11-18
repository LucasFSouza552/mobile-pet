import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { darkTheme, lightTheme } from '../../../../theme/Themes';

type TabKey = 'posts' | 'pets' | 'adopted' | 'wishlist';

interface ProfileTopTabsProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  isInstitution: boolean;
  COLORS: typeof lightTheme.colors | typeof darkTheme.colors;
}

export default function ProfileTopTabs({ activeTab, onChange, isInstitution, COLORS }: ProfileTopTabsProps) {
  const styles = makeStyles(COLORS);
  return (
    <View style={styles.topTabs}>
      {isInstitution ? (
        <TouchableOpacity
          onPress={() => onChange('pets')}
          style={[styles.tabItem, activeTab === 'pets' && styles.tabItemActive]}
          accessibilityState={{ selected: activeTab === 'pets' }}
        >
          <Text style={[styles.tabText, activeTab === 'pets' && styles.tabTextActive]}>Pets</Text>
        </TouchableOpacity>
      ) : null}
      <TouchableOpacity
        onPress={() => onChange('posts')}
        style={[styles.tabItem, activeTab === 'posts' && styles.tabItemActive]}
        accessibilityState={{ selected: activeTab === 'posts' }}
      >
        <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Posts</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange('adopted')}
        style={[styles.tabItem, activeTab === 'adopted' && styles.tabItemActive]}
        accessibilityState={{ selected: activeTab === 'adopted' }}
      >
        <Text style={[styles.tabText, activeTab === 'adopted' && styles.tabTextActive]}>Adotados</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onChange('wishlist')}
        style={[styles.tabItem, activeTab === 'wishlist' && styles.tabItemActive]}
        accessibilityState={{ selected: activeTab === 'wishlist' }}
      >
        <Text style={[styles.tabText, activeTab === 'wishlist' && styles.tabTextActive]}>
          {isInstitution ? 'Desejados' : 'Desejo adotar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    topTabs: {
      flexDirection: 'row',
      backgroundColor: COLORS.secondary,
      borderRadius: 12,
      padding: 4,
      gap: 8,
      marginBottom: 12,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: COLORS.tertiary,
    },
    tabItemActive: {
      backgroundColor: COLORS.primary,
    },
    tabText: {
      color: COLORS.text,
      fontWeight: '600',
    },
    tabTextActive: {
      color: COLORS.bg,
    },
  });
}


