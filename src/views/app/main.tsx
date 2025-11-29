import * as React from 'react';
import { createMaterialTopTabNavigator, } from '@react-navigation/material-top-tabs';
import { AntDesign, FontAwesome5, FontAwesome6, FontAwesome } from '@expo/vector-icons';
import Profile from './profile/profile';
import Donate from './donation/donate';
import MatchPets from './matchPets';
import Community from './community';
import { useTheme } from '../../context/ThemeContext';
import NewPost from './newPost';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount } from '../../context/AccountContext';
import { useCamera } from '../../context/CameraContext';
import { useEffect } from 'react';
import { useNetworkSync } from '../../hooks/useNetworkSync';

const Tab = createMaterialTopTabNavigator();

const Icons = {
  Profile: { name: 'user-alt', family: FontAwesome5 },
  Donate: { name: 'hands-helping', family: FontAwesome5 },
  MatchPets: { name: 'heart', family: AntDesign },
  Community: { name: 'comments', family: FontAwesome },
  NewPost: { name: 'plus', family: FontAwesome },
};

export default function Main() {

  const { COLORS, FONT_SIZE } = useTheme();
  const insets = useSafeAreaInsets();
  const { isCameraOpen } = useCamera();
  const { account } = useAccount();
  const isInstitution = account?.role === 'institution';

  const { syncNow } = useNetworkSync();

  useEffect(() => {
    (async () => {
      await syncNow();
    })();
  }, [syncNow]);

  return (
    <Tab.Navigator
      initialRouteName='Profile'
      tabBarPosition='bottom'
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        swipeEnabled: true,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.tertiary,
        tabBarStyle: isCameraOpen ? {
          display: 'none',
          height: 0,
          opacity: 0,
        } : {
          backgroundColor: COLORS.secondary,
          paddingBottom: insets.bottom,
        },
        tabBarItemStyle: { paddingVertical: 20 },
        tabBarIndicatorStyle: { backgroundColor: 'transparent' },
        tabBarIcon: ({ color }) => {
          const { name, family: IconFamily } =
            Icons[route?.name as keyof typeof Icons] || { name: 'question-circle', family: FontAwesome };

          return <IconFamily name={name} size={FONT_SIZE.large} color={color} />
        },
      })}
    >
      {!isInstitution && (
        <Tab.Screen name="MatchPets" component={MatchPets} />
      )}
      <Tab.Screen name="Donate" component={Donate} />
      <Tab.Screen
        name="NewPost"
        component={NewPost}
        options={{
          tabBarStyle: isCameraOpen ? {
            display: 'none',
            height: 0,
            opacity: 0,
          } : {
            backgroundColor: COLORS.secondary,
            paddingBottom: insets.bottom,
          },
        }}
      />
      <Tab.Screen name="Community" component={Community} />
      <Tab.Screen
        name="Profile"
        component={Profile}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.setParams({ accountId: undefined });
          },
        })}
      />
    </Tab.Navigator>
  );
}

