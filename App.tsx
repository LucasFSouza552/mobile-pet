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
import ProfileSettingsScreen from './src/views/app/profile/ProfileSettings';
import EditPetScreen from './src/views/app/pets/editPet';
import PetDetailsScreen from './src/views/app/pets/PetDetails';
import NewNotificationScreen from './src/views/app/newNotification/newNotification';
import InstitutionNotificationsScreen from './src/views/app/institutionNotifications/institutionNotifications';
import DonationPage from './src/views/app/donation/donatePay';
import DonationWebView from './src/views/app/donation/DonationWebView';
import NewPetScreen from './src/views/app/pets/newPet';
import ForgotPasswordScreen from './src/views/auth/forgotPassword';
import ResetPasswordScreen from './src/views/auth/resetPassword';
import ProfileScreen from './src/views/app/profile/profile';


import { initialWindowMetrics, SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider } from './src/context/ThemeContext';
import { useTheme as useAppTheme } from './src/context/ThemeContext';
import Toast from 'react-native-toast-message';
import { AccountProvider } from './src/context/AccountContext';
import { PostProvider } from './src/context/PostContext';
import { CameraProvider } from './src/context/CameraContext';
import { runMigrations } from './src/data';
import { SuccessToast, ErrorToast as ThemedErrorToast, InfoToast } from './src/components/Toast/ThemedToast';
const Stack = createNativeStackNavigator();

export default function App() {

  const [dbReady, setDbReady] = useState(false);


  useEffect(() => {
    (async () => {
      try {
        await runMigrations();
      } finally {
        setDbReady(true);
      }
    })();

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
            <CameraProvider>
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
                  <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                  <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                  <Stack.Screen name="Register" component={RegisterScreen} />
                  <Stack.Screen name="RegisterStep1" component={RegisterStep1Screen} />
                  <Stack.Screen name="RegisterStep2" component={RegisterStep2Screen} />
                  <Stack.Screen name="RegisterStep3" component={RegisterStep3Screen} />
                  <Stack.Screen name="RegisterStep4" component={RegisterStep4Screen} />
                  <Stack.Screen name="Main" component={Main} />
                  <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                  <Stack.Screen name="ProfileSettings" component={ProfileSettingsScreen} />
                  <Stack.Screen name="EditPet" component={EditPetScreen} />
                  <Stack.Screen name="CreateNotification" component={NewNotificationScreen} />
                  <Stack.Screen name="InstitutionNotifications" component={InstitutionNotificationsScreen} />
                  <Stack.Screen name="DonationPage" component={DonationPage} />
                  <Stack.Screen name="DonationWebView" component={DonationWebView} />
                  <Stack.Screen name="NewPet" component={NewPetScreen} />
                  <Stack.Screen name="PetDetails" component={PetDetailsScreen} />
                  <Stack.Screen name="ProfileView" component={ProfileScreen} />
                </Stack.Navigator>


                <ThemedToastWrapper />

              </NavigationContainer>
            </PostProvider>
            </CameraProvider>
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

function ThemedToastWrapper() {
  const toastConfig = {
    success: (props: any) => <SuccessToast {...props} />,
    error: (props: any) => <ThemedErrorToast {...props} />,
    info: (props: any) => <InfoToast {...props} />,
  };

  return (
    <Toast
      config={toastConfig}
      position="top"
      topOffset={60}
      visibilityTime={2500}
    />
  );
}
