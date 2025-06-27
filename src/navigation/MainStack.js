import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Splash from '../screens/splash/Splash';
import BottomTabNav from './BottomTabNav';
import Toast from 'react-native-toast-message';
import Signin from '../screens/authScreens/Signin';
import Attendence from '../screens/tabScreens/Attendance';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createStackNavigator();

export default function MainStack() {
  const [loggedIn, setLoggedin] = useState(false);
  console.log('loggedIn>>>>', loggedIn);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        setLoggedin(true);
      } else {
        setLoggedin(false);
      }
    };
    checkAuth();
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Signin" component={Signin} />
        <Stack.Screen name="BottomTabNav" component={BottomTabNav} />

        <Stack.Screen name="Attendence" component={Attendence} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
