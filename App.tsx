import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/views/screens/splash';
import WelcomeScreen from './src/views/screens/welcome';
import LoginScreen from './src/views/screens/login';
import RegisterScreen from './src/views/screens/register';
import RegisterFormScreen from './src/views/screens/registerForm';
import Main from './src/views/screens/main';



import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from './src/context/ThemeContext';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Keyboard } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {

  const [keyboardOffset, setKeyboardOffset] = useState(50);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardVisible(true);
      setKeyboardOffset(e.endCoordinates.height + 30);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
      setKeyboardOffset(50);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);


  return (

    <ThemeProvider>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>

        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Splash"
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="RegisterForm" component={RegisterFormScreen} />
            <Stack.Screen name="Main" component={Main} />
          </Stack.Navigator>


          <Toast
            config={toastConfig}
            position="top"     
            topOffset={60}
            visibilityTime={2500}
          />

          <StatusBar style="auto" hidden />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}


const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: '#2ECC71',
        borderRadius: 10,
        minHeight: 70,
        width: '90%',
        alignSelf: 'center',
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2ECC71',
      }}
      text2Style={{
        fontSize: 14,
        color: '#333',
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: '#E74C3C',
        borderRadius: 10,
        minHeight: 70,
        width: '90%',
        alignSelf: 'center',
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#E74C3C',
      }}
      text2Style={{
        fontSize: 14,
        color: '#555',
      }}
    />
  ),
};
