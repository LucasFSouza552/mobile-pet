import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Profile from './profile';
import Donate from './donate';
import { useEffect } from 'react';
import NetInfo from "@react-native-community/netinfo";
import FindPets from './findPets';
import Community from './community';

const Tab = createBottomTabNavigator();

export default function Main() {

  useEffect(() => {
    const checkConnection = async () => {
      const netState = await NetInfo.fetch();

    }
  }, []);


  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#f2f2f2',
        tabBarStyle: { backgroundColor: '#B04BA0' },
        tabBarItemStyle: { paddingVertical: 10 },
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle';

          if (route.name === 'Profile') {
            iconName = 'person';
          }else if (route.name === 'Community') {
            iconName = 'chatbox-outline';
          } 
          else if (route.name === 'FindPets') {
            iconName = 'heart-outline';
          }else if (route.name === 'Donate') {
            iconName = 'heart';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
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