import React, { useReducer, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { darkTheme, lightTheme } from '../../../../theme/Themes';

type TabKey = 'posts' | 'pets' | 'adopted' | 'wishlist' | 'history';

interface ProfileTopTabsProps {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
  isInstitution: boolean;
  COLORS: typeof lightTheme.colors | typeof darkTheme.colors;
  showHistory: boolean;
}

type TabState = {
  activeTab: TabKey;
  isInstitution: boolean;
  showHistory: boolean;
};

type TabAction = 
  | { type: 'SET_ACTIVE_TAB'; payload: TabKey }
  | { type: 'SET_IS_INSTITUTION'; payload: boolean }
  | { type: 'SET_SHOW_HISTORY'; payload: boolean };

interface TabConfig {
  key: TabKey;
  label: string | ((isInstitution: boolean) => string);
  shouldShow: (state: TabState) => boolean;
}

const tabsConfig: TabConfig[] = [
  {
    key: 'pets',
    label: 'Pets',
    shouldShow: (state) => state.isInstitution,
  },
  {
    key: 'posts',
    label: 'Posts',
    shouldShow: (state) => !state.isInstitution,
  },
  {
    key: 'adopted',
    label: 'Adotados',
    shouldShow: (state) => !state.isInstitution,
  },
  {
    key: 'wishlist',
    label: (isInstitution) => isInstitution ? 'Desejados' : 'Desejo adotar',
    shouldShow: (state) => true,
  },
  {
    key: 'history',
    label: 'Histórico',
    shouldShow: (state) => state.showHistory,
  },
];

const tabReducer = (state: TabState, action: TabAction): TabState => {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_IS_INSTITUTION':
      return { ...state, isInstitution: action.payload };
    case 'SET_SHOW_HISTORY':
      return { ...state, showHistory: action.payload };
    default:
      return state;
  }
};

interface TabItemProps {
  tabKey: TabKey;
  label: string;
  isActive: boolean;
  onPress: () => void;
  styles: ReturnType<typeof makeStyles>;
}

const TabItem: React.FC<TabItemProps> = ({ tabKey, label, isActive, onPress, styles }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabItem, isActive && styles.tabItemActive]}
      accessibilityState={{ selected: isActive }}
    >
      <Text style={styles.tabText}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const useTabs = (initialState: TabState) => {
  const [state, dispatch] = useReducer(tabReducer, initialState);

  const setActiveTab = (tab: TabKey) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  };

  const setIsInstitution = (value: boolean) => {
    dispatch({ type: 'SET_IS_INSTITUTION', payload: value });
  };

  const setShowHistory = (value: boolean) => {
    dispatch({ type: 'SET_SHOW_HISTORY', payload: value });
  };

  const visibleTabs = useMemo(() => {
    return tabsConfig.filter(tab => tab.shouldShow(state));
  }, [state]);

  return {
    state,
    setActiveTab,
    setIsInstitution,
    setShowHistory,
    visibleTabs,
  };
};

export default function ProfileTopTabs({ activeTab, onChange, isInstitution, COLORS, showHistory }: ProfileTopTabsProps) {
  const styles = makeStyles(COLORS);
  
  const { visibleTabs } = useTabs({
    activeTab,
    isInstitution,
    showHistory,
  });

  const getTabLabel = (config: TabConfig): string => {
    if (typeof config.label === 'function') {
      return config.label(isInstitution);
    }
    return config.label;
  };

  return (
    <ScrollView horizontal style={styles.scrollView} showsHorizontalScrollIndicator={false}>
      <View style={styles.topTabs}>
        {visibleTabs.map((tabConfig) => {
          return (
          <TabItem
            key={tabConfig.key}
            tabKey={tabConfig.key}
            label={getTabLabel(tabConfig)}
            isActive={activeTab === tabConfig.key}
            onPress={() => onChange(tabConfig.key)}
            styles={styles}
          />
        )})}
      </View>
    </ScrollView>
  );
}

function makeStyles(COLORS: typeof lightTheme.colors | typeof darkTheme.colors) {
  return StyleSheet.create({
    scrollView: {
      flex: 1,
      backgroundColor: COLORS.secondary,
      height: 60,
      maxHeight: 60,
      minHeight: 60,
    },
    topTabs: {
      flexDirection: 'row',
      borderRadius: 12,
      gap: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 10,
      backgroundColor: COLORS.tertiary,
    },
    tabItemActive: {
      backgroundColor: COLORS.primary,
    },
    tabText: {
      color: COLORS.bg,
      fontWeight: '600',
    },
  });
}


