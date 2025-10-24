import React, { useEffect } from 'react';
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

const Stack = createNativeStackNavigator();

export default function App() {
  // useEffect(() => {
  //   (async () => {
  //     await createAccountTable();
  //     // const account: IAccount = {
  //     //   name: 'Leonardo Souza',
  //     //   email: 'leonardo.souza@example.com',
  //     //   avatar: 'file:///storage/emulated/0/Pictures/avatar1.png',
  //     //   password: 'hashed_password_123',
  //     //   phone_number: '+55 32 99888-7766',
  //     //   role: 'user',
  //     //   cpf: '123.456.789-00',
  //     //   verified: true,
  //     //   address: {
  //     //     street: 'Rua das Palmeiras',
  //     //     number: '120',
  //     //     complement: 'Apto 202 - Bloco B',
  //     //     city: 'Muriaé',
  //     //     state: 'MG',
  //     //     cep: '36880-000',
  //     //     neighborhood: 'Centro',
  //     //   },
  //     // } as IAccount;

  //     // accountRepository.create(account)

  //   })();
  // }, []);

   

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
            <Stack.Screen name="Main" component={Main} />
          </Stack.Navigator>
          <StatusBar style="auto" hidden />
        </NavigationContainer>
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
