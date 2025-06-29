import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import React, { useEffect } from 'react';
import { Images } from '../../themes/ThemePath';

const Splash = props => {
  //  useEffect(() => {
  //   setTimeout(() => {
  //     props?.navigation.replace('Signin');
  //   }, 2000);
  // }, []);
  return (
    <ImageBackground
      style={{ flex: 1 }}
      source={Images.pageBackground}
      resizeMode="cover"
    />
  );
};

export default Splash;

const styles = StyleSheet.create({});
