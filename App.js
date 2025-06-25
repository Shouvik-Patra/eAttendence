import {StatusBar, StyleSheet} from 'react-native';
import React, {useEffect} from 'react';
import MainStack from './src/navigation/MainStack';

const App = () => {

  return (
    <>
      <StatusBar
        backgroundColor="transparent"
        translucent={true}
        // barStyle="dark-content"
        barStyle="light-content"
      />
    
      <MainStack />
    </>
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
