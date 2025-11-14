import { StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import MainStack from './src/navigation/MainStack';
import { useDispatch } from 'react-redux';
import { getTokenRequest } from './src/redux/reducer/AuthReducer';
import {
  CustomAlertProvider,
  useCustomAlert,
} from './src/utils/helpers/CustomAlertContext';
import { setAlertInstance } from './src/utils/helpers/ShowMessage';
import messaging from '@react-native-firebase/messaging';
import Toast from 'react-native-toast-message';

const App = () => {
  const dispatch = useDispatch();


  async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
}
  useEffect(() => {
    requestUserPermission();
    dispatch(getTokenRequest());
  }, []);

  const showNotificationAlert = (title, remoteMessage) => {
    console.log(title, remoteMessage, 'Notification received');

    Toast.show({
      type: 'info',
      text1: title,
      text2: remoteMessage,
      position: 'top',
      autoHide: false,
      visibilityTime: 10000,
    });
  };

  useEffect(() => {
    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('Foreground notification received:', remoteMessage);
      showNotificationAlert(
        remoteMessage?.notification?.title,
        remoteMessage?.notification?.body,
      );
    });

    // Handle notification opened app from background/quit state
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log(
        'Notification caused app to open from background state:',
        remoteMessage,
      );
      // Handle navigation or other actions when user taps notification
    });

    // Check whether an initial notification is available
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log(
            'Notification caused app to open from quit state:',
            remoteMessage,
          );
          // Handle navigation or other actions when user taps notification
        }
      });

    return unsubscribe;
  }, []);

  const InitAlert = () => {
    const alert = useCustomAlert();

    useEffect(() => {
      setAlertInstance(alert);
    }, [alert]);

    return null;
  };

  return (
    <CustomAlertProvider>
      <InitAlert />
      <StatusBar animated={true} backgroundColor="black" />
      <MainStack />
      <Toast />
    </CustomAlertProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});