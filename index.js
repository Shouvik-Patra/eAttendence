// remove code ----[remove comment out code]

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

if (__DEV__) {
  ErrorUtils.setGlobalHandler(() =>
    Alert.alert(
      'Security Restriction',
      'This application cannot run while Developer Options are enabled.\n\nPlease disable Developer Options from your device settings and launch the application again.',
      [
        {
          text: 'Close',
          onPress: () => BackHandler.exitApp(),
        },
      ],
      { cancelable: false },
    ),
  );
  throw new Error('App will not run in development mode');
}

import React from 'react';
import { Alert, AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import Store from './src/redux/Store';
import { Provider } from 'react-redux';
import messaging from '@react-native-firebase/messaging';

LogBox.ignoreAllLogs();

// Register background handler BEFORE app registration
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
  // You can perform any background task here
  // Note: You cannot show alerts or toasts from here as the app is in background
});

const eAttandence = () => {
  return (
    <Provider store={Store}>
      <App />
    </Provider>
  );
};

AppRegistry.registerComponent(appName, () => eAttandence);
