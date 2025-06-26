import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Splash from '../screens/splash/Splash';
import Welcome from '../screens/authScreens/Welcome';
import BottomTabNav from './BottomTabNav';
import Task from '../screens/tabScreens/HolidayList';
import ActiveTask from '../screens/tabScreens/ActiveTask';
import Toast from 'react-native-toast-message';
import Signin from '../screens/authScreens/Signin';
import Attendence from '../screens/tabScreens/Attendance';
import Home from '../screens/tabScreens/Home';

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Signin" component={Signin} />
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="BottomTabNav" component={BottomTabNav} />
        <Stack.Screen
          name="Attendence"
          component={Attendence}
          options={{
            title: 'Take Photo',
            headerShown: false, 
          }}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
