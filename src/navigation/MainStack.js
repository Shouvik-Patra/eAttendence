import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Toast from 'react-native-toast-message';

import { Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Splash from '../screens/splash/Splash';
import Signin from '../screens/authScreens/Signin';
import Attendence from '../screens/tabScreens/Attendance';
import FormalAttendanceBottomTab from './FormalAttendanceBottomTab';
import LoginTypeScreen from '../screens/authScreens/LoginTypeScreen';
import InformalAttendanceBottomTab from './InformalAttendanceBottomTab';
import InformalAttendance from '../screens/tabScreens/InformalAttendance';
import constants from '../utils/helpers/constants';

const Stack = createStackNavigator();

export default function StackNav() {
  const AuthReducer = useSelector(state => state.AuthReducer);
  const [isReady, setIsReady] = useState(false);
  
  let loginType = AuthReducer?.loginTypeResponse;

  useEffect(() => {
    // Add delay before showing screens
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 3000); // 2 second delay

    return () => clearTimeout(timer);
  }, []);

  const authScreens = {
    LoginTypeScreen: LoginTypeScreen,
    Signin: Signin,
  };
  
  const FormalmMainScreens = {
    FormalAttendanceBottomTab: FormalAttendanceBottomTab,
    Attendence: Attendence,
  };
  
  const InformalmainScreens = {
    InformalAttendanceBottomTab: InformalAttendanceBottomTab,
    InformalAttendance: InformalAttendance,
  };

  // Determine which main screens to use based on loginType
  const mainScreens = loginType === 'formal' ? FormalmMainScreens : InformalmainScreens;

  // Show splash during loading or delay period
  if (AuthReducer?.isLoading || !isReady) {
    return <Splash />;
  } else {
    return (
      <NavigationContainer>
        {AuthReducer.getTokenResponse === null ? (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {Object.entries({
              ...authScreens,
            }).map(([name, component]) => {
              return <Stack.Screen key={name} name={name} component={component} />;
            })}
          </Stack.Navigator>
        ) : (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {Object.entries({
              ...mainScreens,
            }).map(([name, component]) => {
              return <Stack.Screen key={name} name={name} component={component} />;
            })}
          </Stack.Navigator>
        )}
        <Toast />
      </NavigationContainer>
    );
  }
}