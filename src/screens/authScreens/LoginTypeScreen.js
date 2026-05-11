import {
  Dimensions,
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import { PermissionsAndroid } from 'react-native';
import { getDeviceToken } from '../../utils/helpers/notificationService';
import { useDispatch } from 'react-redux';
import { getLoginTypeSuccess } from '../../redux/reducer/AuthReducer';
import constants from '../../utils/helpers/constants';

const LoginTypeScreen = props => {
  const dispatch = useDispatch();
  
  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app requires access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
      return true;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  useEffect(() => {
    requestLocationPermission();
    const setupFCM = async () => {
      const token = await getDeviceToken();
    };
    setupFCM();
  }, []);

  const handleLoginTypeSelection = async (type) => {
    try {
      // Save login type to AsyncStorage
      await AsyncStorage.setItem(constants.LOGIN_TYPE, type);
      
      // Update Redux store with login type
      dispatch(getLoginTypeSuccess(type));
      
      // Navigate to SignIn screen
      props.navigation.navigate('Signin');
    } catch (error) {
      console.error('Error saving login type:', error);
    }
  };

  return (
    <ImageBackground
      source={Images.pageBackground}
      resizeMode="cover"
      style={styles.onbordingStyle}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.contentWrapper}>
          {/* Header Section */}
          <View style={styles.headerContain}>
            <Image
              resizeMode="contain"
              style={styles.logoImage}
              source={Images.wb_logo}
            />

            <Text style={[styles.headerText2, styles.boldHeader]}>
              State Urban Development Agency
            </Text>
            <Text style={styles.headerText2}>
              Under Department of Urban Development & Municipal Affairs
            </Text>
            <Text style={[styles.headerText2, styles.boldSubHeader]}>
              Government of West Bengal
            </Text>
          </View>

          {/* Login Type Options */}
          <View style={styles.optionsContainer}>
            <Text style={styles.selectText}>Select Login Type</Text>

            {/* Formal Login Option */}
            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.7}
              onPress={() => handleLoginTypeSelection('formal')}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>📱</Text>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Formal Login</Text>
                <Text style={styles.optionSubtitle}>
                  Login with phone number
                </Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>

            {/* Informal Login Option */}
            <TouchableOpacity
              style={styles.optionCard}
              activeOpacity={0.7}
              onPress={() => handleLoginTypeSelection('informal')}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.iconText}>👤</Text>
              </View>
              <View style={styles.optionTextContainer}>
                <Text style={styles.optionTitle}>Informal Login</Text>
                <Text style={styles.optionSubtitle}>Login with username</Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default LoginTypeScreen;

const styles = StyleSheet.create({
  onbordingStyle: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: normalize(20),
    paddingTop: normalize(60),
  },
  headerContain: {
    alignSelf: 'center',
    alignItems: 'center',
    marginTop: normalize(20),
    width: '100%',
  },
  logoImage: {
    alignSelf: 'center',
    height: normalize(100),
    width: normalize(100),
    marginBottom: normalize(15),
  },
  headerText2: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: normalize(12),
    color: Colors.darkblue,
    textAlign: 'center',
    marginVertical: normalize(2),
  },
  boldHeader: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color:Colors.darkblue
  },
  boldSubHeader: {
    fontSize: normalize(14),
    fontWeight: 'bold',
    marginTop: normalize(5),
    color:Colors.darkblue

  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  selectText: {
    fontSize: normalize(24),
    fontFamily: Fonts.MulishBold,
    color: Colors.darkblue,
    textAlign: 'center',
    marginBottom: normalize(30),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: normalize(12),
    padding: normalize(20),
    marginBottom: normalize(20),
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: normalize(50),
    height: normalize(50),
    borderRadius: normalize(25),
    backgroundColor: Colors.skyblue + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(15),
  },
  iconText: {
    fontSize: normalize(28),
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: normalize(18),
    fontFamily: Fonts.MulishBold,
    color: Colors.darkblue,
    marginBottom: normalize(4),
  },
  optionSubtitle: {
    fontSize: normalize(13),
    fontFamily: Fonts.MulishRegular,
    color: Colors.textInputColor,
  },
  arrowIcon: {
    fontSize: normalize(30),
    color: Colors.skyblue,
    fontWeight: 'bold',
  },
});