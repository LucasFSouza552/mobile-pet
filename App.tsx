import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
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
import EditProfileScreen from './src/views/app/profile/editProfile';
import NewNotificationScreen from './src/views/app/newNotification';
import InstitutionNotificationsScreen from './src/views/app/institutionNotifications';
import DonatePayScreen from './src/views/app/donatePay';


import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from './src/context/ThemeContext';
import { useTheme as useAppTheme } from './src/context/ThemeContext';
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
      <ThemeProvider>
        <ThemedStatusBar />
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
                  <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                  <Stack.Screen name="CreateNotification" component={NewNotificationScreen} />
                  <Stack.Screen name="InstitutionNotifications" component={InstitutionNotificationsScreen} />
                  <Stack.Screen name="DonatePay" component={DonatePayScreen} />
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

function ThemedStatusBar() {
  const { COLORS } = useAppTheme();
  return (
    <View style={{ backgroundColor: COLORS.primary, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 35 }}>
      <StatusBar barStyle="light-content" translucent={false} backgroundColor={COLORS.primary} />
    </View>
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
