import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Dimensions,
  View,
  Text,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import PropTypes from 'prop-types';
import { Colors } from '../../themes/ThemePath';

export default function Loader({ visible }) {
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let animation;

    if (visible) {
      const startRotation = () => {
        rotateAnimation.setValue(0);
        animation = Animated.loop(
          Animated.timing(rotateAnimation, {
            toValue: 1,
            duration: 1000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        );
        animation.start();
      };

      startRotation();
    } else {
      rotateAnimation.setValue(0);
    }

    return () => {
      if (animation) animation.stop();
    };
  }, [visible]);

  const screenHeight = Dimensions.get('window').height;

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return visible ? (
    <SafeAreaView
      style={{
        flex: 1,
        position: 'absolute',
        backgroundColor: 'rgba(0,0,0,0.7)',
        zIndex: 10,
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        height: screenHeight,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Animated.View
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          borderWidth: 6,
          borderColor: Colors.button || '#fff',
          borderTopColor: 'transparent',
          transform: [{ rotate: spin }],
        }}
      />
      <Text
        style={{
          marginTop: 24,
          fontSize: 16,
          color: '#ffffff',
          fontWeight: '500',
          textAlign: 'center',
        }}>
        Loading...
      </Text>
    </SafeAreaView>
  ) : null;
}

Loader.propTypes = {
  visible: PropTypes.bool,
};

Loader.defaultProps = {
  visible: false,
};
