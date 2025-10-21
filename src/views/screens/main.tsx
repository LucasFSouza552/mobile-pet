import * as React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Profile from './profile';
import Donate from './donate';

const Tab = createBottomTabNavigator();

export default function Main() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#f2f2f2',
        tabBarStyle: { backgroundColor: '#B04BA0' },
        tabBarShowLabel: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: string; 

          if (route.name === 'Profile') {
            iconName = 'person';
          } else if (route.name === 'Donate') {
            iconName = 'heart';
          } else {
            iconName = 'alert-circle';
          }

          return <Ionicons name={iconName} size={28} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Donate" component={Donate} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}