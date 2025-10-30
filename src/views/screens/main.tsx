import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AntDesign, FontAwesome5, FontAwesome6, FontAwesome } from '@expo/vector-icons';

import Profile from './profile';
import Donate from './donate';
import FindPets from './findPets';
import Community from './community';
import { useTheme } from '../../context/ThemeContext';
import { useAccount } from '../../context/AccountContext';

const Tab = createBottomTabNavigator();

const Icons = {
  Profile: { name: 'user-alt', family: FontAwesome5 },
  Donate: { name: 'hands-helping', family: FontAwesome5 },
  FindPets: { name: 'heart', family: AntDesign },
  Community: { name: 'comments', family: FontAwesome },
};

export default function Main() {

  const { COLORS } = useTheme();
  
  
  return (
    <Tab.Navigator
      initialRouteName='Profile'
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.quarternary,
        tabBarInactiveTintColor: '#f2f2f2',
        tabBarStyle: { backgroundColor: '#B04BA0' },
        tabBarItemStyle: { paddingVertical: 10 },
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size }) => {

          const { name, family: IconFamily } =
            Icons[route?.name as keyof typeof Icons] || { name: 'question-circle', family: FontAwesome };

          return <IconFamily name={name} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="FindPets" component={FindPets} />
      <Tab.Screen name="Donate" component={Donate} />
      <Tab.Screen name="Community" component={Community} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

