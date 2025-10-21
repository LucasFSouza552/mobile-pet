import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/views/screens/splash';
import WelcomeScreen from './src/views/screens/welcome';
import LoginScreen from './src/views/screens/login';
import RegisterScreen from './src/views/screens/register';
import RegisterFormScreen from './src/views/screens/registerForm';


import { initialWindowMetrics, SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ThemeProvider } from './src/context/ThemeContext';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>

        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RegisterForm" component={RegisterFormScreen} />
          </Stack.Navigator>
          <StatusBar style="auto" hidden />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
