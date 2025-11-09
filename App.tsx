import React, { useEffect, useState } from 'react';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import { StatusBar, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/views/auth/splash';
import WelcomeScreen from './src/views/auth/welcome';
import LoginScreen from './src/views/auth/login';
import RegisterScreen from './src/views/auth/register';
import RegisterStep1Screen from './src/views/auth/register/step1';
import RegisterStep2Screen from './src/views/auth/register/step2';
import RegisterStep3Screen from './src/views/auth/register/step3';
import RegisterStep4Screen from './src/views/auth/register/step4';
import Main from './src/views/app/main';
import PostDetails from './src/views/app/postDetails';

import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from './src/context/ThemeContext';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { Keyboard } from 'react-native';
import { AccountProvider } from './src/context/AccountContext';
import { PostProvider } from './src/context/PostContext';
import { runMigrations } from './src/data';

const Stack = createNativeStackNavigator();

export default function App() {

  const [keyboardOffset, setKeyboardOffset] = useState(50);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [dbReady, setDbReady] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        await runMigrations();
      } finally {
        setDbReady(true);
      }
    })();

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

  if (!dbReady) {
    return null;
  }

  return (
    <>

      <View style={{ backgroundColor: '#B648A0', display: 'flex', justifyContent: 'center', alignItems: 'center', height: 35 }}>
      
      <StatusBar barStyle="light-content" translucent={false} backgroundColor="#B648A0" />
      </View>
      <ThemeProvider>
        <AccountProvider>

          <SafeAreaProvider initialMetrics={initialWindowMetrics}>
            
            <PostProvider>
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
                  <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
                  <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
                  <Stack.Screen name="RegisterStep3" component={RegisterStep3Screen} />
                  <Stack.Screen name="RegisterStep4" component={RegisterStep4Screen} />
                  <Stack.Screen name="Main" component={Main} />
                <Stack.Screen name="PostDetails" component={PostDetails} />
                </Stack.Navigator>


                <Toast
                  config={toastConfig}
                  position="top"
                  topOffset={60}
                  visibilityTime={2500}
                />

              </NavigationContainer>
            </PostProvider>
            
          </SafeAreaProvider>

        </AccountProvider>
      </ThemeProvider >
    </>

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
