import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import SplashScreen from './src/views/screens/splash';
import WelcomeScreen from './src/views/screens/welcome';
import LoginScreen from './src/views/screens/login';
import RegisterScreen from './src/views/screens/register';
import RegisterStep1Screen from './src/views/screens/registerStep1';
import RegisterStep2Screen from './src/views/screens/registerStep2';
import RegisterStep3Screen from './src/views/screens/registerStep3';
import RegisterStep4Screen from './src/views/screens/registerStep4';
import Main from './src/views/screens/main';

import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from './src/context/ThemeContext';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Keyboard } from 'react-native';
import { AccountProvider } from './src/context/AccountContext';

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
      <AccountProvider>

        <SafeAreaProvider initialMetrics={initialWindowMetrics}>

          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Splash"
              screenOptions={{
                headerShown: false,
              }}
            >
              <Stack.Screen name="Splash" component={SplashScreen} />
              <Stack.Screen name="Welcome" component={WelcomeScreen}  />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
              <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
              <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
              <Stack.Screen name="RegisterStep3" component={RegisterStep3Screen} />
              <Stack.Screen name="RegisterStep4" component={RegisterStep4Screen} />
              <Stack.Screen name="Main" component={Main} />
            </Stack.Navigator>


            <Toast
              config={toastConfig}
              position="top"
              topOffset={60}
              visibilityTime={2500}
            />

            <StatusBar style="auto" hidden  />
          </NavigationContainer>
        </SafeAreaProvider>

      </AccountProvider>
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
