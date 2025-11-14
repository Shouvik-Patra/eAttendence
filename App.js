import {
  StatusBar,
  StyleSheet,
  Platform,
  Alert,
  Linking,
  PermissionsAndroid,
} from 'react-native';
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

// Background message handler - MUST be outside component
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

const App = () => {
  const dispatch = useDispatch();

  // Enhanced notification permission request
  const requestUserPermission = async () => {
    try {
      if (Platform.OS === 'ios') {
        // iOS Permission Request
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('iOS Authorization status:', authStatus);
          await getFCMToken();
          return true;
        } else {
          console.log('iOS Notification permission denied');
          showPermissionAlert();
          return false;
        }
      } else {
        // Android Permission Request (Android 13+)
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            {
              title: 'Notification Permission',
              message: 'This app needs permission to send you notifications',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            console.log('Android notification permission granted');
            await getFCMToken();
            return true;
          } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            console.log('Android notification permission blocked');
            showPermissionBlockedAlert();
            return false;
          } else {
            console.log('Android notification permission denied');
            showPermissionAlert();
            return false;
          }
        } else {
          // Android 12 and below - permissions granted by default
          console.log(
            'Android <13: Notification permission granted by default',
          );
          await getFCMToken();
          return true;
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Get FCM Token
  const getFCMToken = async () => {
    try {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        console.log('FCM Token:', fcmToken);
        // TODO: Save token to your backend if needed
        // You can dispatch a Redux action here to save the token
        return fcmToken;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
    }
  };

  // Show alert when permission is denied
  const showPermissionAlert = () => {
    Alert.alert(
      'Enable Notifications',
      'Please enable notifications to receive important updates and alerts.',
      [
        { text: 'Not Now', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ],
    );
  };

  // Show alert when permission is blocked
  const showPermissionBlockedAlert = () => {
    Alert.alert(
      'Notifications Blocked',
      'Notification permission is blocked. Please enable it from your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => Linking.openSettings(),
        },
      ],
    );
  };

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
