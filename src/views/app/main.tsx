import * as React from 'react';
import { createMaterialTopTabNavigator, } from '@react-navigation/material-top-tabs';
import { AntDesign, FontAwesome5, FontAwesome6, FontAwesome } from '@expo/vector-icons';
import Profile from './profile/profile';
import Donate from './donate';
import FindPets from './findPets';
import Community from './community';
import { useTheme } from '../../context/ThemeContext';
import NewPost from './newPost';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAccount } from '../../context/AccountContext';

const Tab = createMaterialTopTabNavigator();

const Icons = {
  Profile: { name: 'user-alt', family: FontAwesome5 },
  Donate: { name: 'hands-helping', family: FontAwesome5 },
  FindPets: { name: 'heart', family: AntDesign },
  Community: { name: 'comments', family: FontAwesome },
  NewPost: { name: 'plus', family: FontAwesome },
};

export default function Main() {

  const { COLORS } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      initialRouteName='Profile'
      tabBarPosition='bottom'
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        swipeEnabled: true,
        tabBarActiveTintColor: '#f2f2f2',
        tabBarInactiveTintColor: COLORS.primary,
        tabBarStyle: { 
          backgroundColor: COLORS.secondary,
          paddingBottom: insets.bottom,
        },
        tabBarItemStyle: { paddingVertical: 20 },
        tabBarIndicatorStyle: { backgroundColor: 'transparent' },
        tabBarIcon: ({ color }) => {

          const { name, family: IconFamily } =
            Icons[route?.name as keyof typeof Icons] || { name: 'question-circle', family: FontAwesome };

          return <IconFamily name={name} size={30} color={color} />
        },
      })}
    >
      <Tab.Screen name="FindPets" component={FindPets} />
      <Tab.Screen name="Donate" component={Donate} />
      <Tab.Screen
        name="NewPost"
        component={NewPost}
        options={{
          tabBarStyle: { 
            backgroundColor: COLORS.secondary,
            paddingBottom: insets.bottom,
            height: 40 + insets.bottom,
          },
        }}
      />
      <Tab.Screen name="Community" component={Community} />
      <Tab.Screen
        name="Profile"
        component={Profile}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.navigate('Profile', {});
          },
        })}
      />
    </Tab.Navigator>
  );
}

