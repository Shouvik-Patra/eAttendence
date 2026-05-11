import {
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import Button from '../../components/Button';
import TextInputWithButton from '../../components/TextInputWithBotton';
import Loader from '../../utils/helpers/Loader';
import showErrorAlert from '../../utils/helpers/Toast';
import { useDispatch, useSelector } from 'react-redux';
import {
  informalsignInRequest,
  signInRequest,
} from '../../redux/reducer/AuthReducer';
import connectionrequest from '../../utils/helpers/NetInfo';
import ShowMessage from '../../utils/helpers/ShowMessage';
import constants from '../../utils/helpers/constants';
import UpdateModal from '../../components/UpdateModal';
import { Camera } from 'react-native-vision-camera';
import { useIsFocused } from '@react-navigation/native';
import { getDeviceToken } from '../../utils/helpers/notificationService';

const windowHeight = Dimensions.get('window').height;
let status = '';

const Signin = props => {
  const dispatch = useDispatch();
  const isFocused = useIsFocused();
  const AuthReducer = useSelector(state => state.AuthReducer);

  const [phone, setPhone] = useState(''); //8013046678//
  const [secure1, setSecure1] = useState(true);
  const [password, setPassword] = useState(''); //
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fcmToken, setFcmToken] = useState('');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

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
      return true; // iOS case
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Setup FCM on component mount
  useEffect(() => {
    requestLocationPermission();
    // Setup FCM notification
    const setupFCM = async () => {
      const token = await getDeviceToken();
      if (token) {
        setFcmToken(token);
      }
    };

    setupFCM();
  }, []);

  const employeeLogin = () => {
    setLoading(true);
    if (phone === '') {
      showErrorAlert('Please Enter username');
      setLoading(false);
    } else if (password == '') {
      showErrorAlert('Please Enter Password');
      setLoading(false);
    } else {
      let obj = {
        username: phone.trim(),
        password: password,
        app_version: constants.APP_VERSION,
        fcm_token: fcmToken || '', // Add FCM token to login payload
      };
      let informalobj = {
        project_code: phone.trim(),
        password: password,
        app_version: constants.APP_VERSION,
        fcm_token: fcmToken || '', // Add FCM token to login payload
      };

      connectionrequest()
        .then(() => {
          // Check if username is a phone number (contains only digits)
          const loginType = AuthReducer?.loginTypeResponse;

          if (loginType === 'formal') {
            dispatch(signInRequest(obj));
          } else {
            dispatch(informalsignInRequest(informalobj));
          }
        })
        .catch(err => {
          showErrorAlert('Please connect to internet');
          setLoading(false);
        });
    }
  };

  // Handle status changes for both formal and informal login
  if (status == '' || AuthReducer.status != status) {
    switch (AuthReducer.status) {
      case 'Auth/signInRequest':
      case 'Auth/informalsignInRequest':
        status = AuthReducer.status;
        break;
      case 'Auth/signInSuccess':
      case 'Auth/inFormalsignInSuccess':
        status = AuthReducer.status;
        setLoading(false);
        break;
      case 'Auth/signInFailure':
      case 'Auth/inFormalsignInFailure':
        status = AuthReducer.status;
        setLoading(false);
        break;
    }
  }

  return (
    <ImageBackground
      source={Images.pageBackground}
      resizeMode="cover"
      style={styles.onbordingStyle}
    >
      <Loader
        visible={
          AuthReducer?.status === 'Auth/signInRequest' ||
          AuthReducer?.status === 'Auth/informalsignInRequest'
        }
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            flexGrow: 1,
            padding: 15,
            paddingBottom: isKeyboardVisible ? normalize(200) : normalize(20),
          }}
        >
          <View style={{ width: '100%', paddingHorizontal: normalize(10) }}>
            <View style={styles.headerContain}>
              <Image
                resizeMode="contain"
                style={{
                  alignSelf: 'center',
                  height: normalize(100),
                  width: normalize(100),
                  marginTop: -30,
                }}
                source={Images.wb_logo}
              />

              <Text
                style={[
                  styles.headerText2,
                  { fontSize: 18, fontWeight: 'bold' },
                ]}
              >
                State Urban Development Agency
              </Text>
              <Text style={styles.headerText2}>
                Under Department of Urban Development & Municipal Affairs
              </Text>
              <Text
                style={[
                  styles.headerText2,
                  { fontSize: 16, fontWeight: 'bold' },
                ]}
              >
                Government of West Bengal
              </Text>
            </View>
          </View>

          <View
            style={{
              width: '100%',
              flex: 1,
              alignSelf: 'center',
              backgroundColor: Colors.white,
              borderRadius: normalize(10),
              alignItems: 'center',
              padding: 15,
              marginTop: 15,
            }}
          >
            <Text style={styles.headerText1}>Login</Text>
            <TextInputWithButton
              show={true}
              icon={true}
              height={normalize(45)}
              inputWidth={'100%'}
              marginTop={normalize(25)}
              textColor={Colors.textInputColor}
              InputHeaderText={'User Name'}
              placeholder={'Enter username'}
              placeholderTextColor={Colors.black}
              paddingLeft={normalize(25)}
              borderColor={Colors.inputGreyBorder}
              borderRadius={normalize(5)}
              editable={true}
              fontFamily={Fonts.MulishRegular}
              isheadertext={true}
              value={phone}
              fontSize={normalize(14)}
              headertxtsize={normalize(13)}
              onChangeText={e => setPhone(e)}
              tintColor={Colors.tintGrey}
            />
            <TextInputWithButton
              show={true}
              icon={true}
              height={normalize(45)}
              inputWidth={'100%'}
              marginTop={normalize(25)}
              textColor={Colors.textInputColor}
              InputHeaderText={'Password'}
              placeholder={'Enter password'}
              keyboardType={'email'}
              placeholderTextColor={Colors.black}
              paddingLeft={normalize(25)}
              borderColor={Colors.inputGreyBorder}
              borderRadius={normalize(5)}
              editable={true}
              fontFamily={Fonts.MulishRegular}
              isheadertext={true}
              value={password}
              fontSize={normalize(14)}
              headertxtsize={normalize(13)}
              onChangeText={e => setPassword(e)}
              isRightIconVisible
              rightimage={Images.eyeclose}
              rightimageheight={normalize(15)}
              rightimagewidth={normalize(15)}
              tintColor={Colors.tintGrey}
              secureTextEntry={secure1}
              onRightPress={() => {
                setSecure1(!secure1);
              }}
            />

            <Button
              height={normalize(45)}
              marginTop={normalize(25)}
              width={'100%'}
              backgroundColor={Colors.skyblue}
              title={'Signin'}
              fontSize={normalize(15)}
              fontFamily={Fonts.MulishSemiBold}
              textColor={'white'}
              onPress={() => {
                employeeLogin();
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

export default Signin;

const styles = StyleSheet.create({
  onbordingStyle: {
    flex: 1,
  },

  headerContain: {
    alignSelf: 'flex-start',
    marginTop: normalize(80),
    width: '100%',
  },
  underline: {
    width: normalize(55),
    height: normalize(3),
    borderRadius: normalize(15),
    backgroundColor: Colors.lightYellow,
    marginTop: normalize(5),
  },
  headerText1: {
    fontSize: normalize(22),
    marginTop: normalize(15),
    color: Colors.darkblue,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerText2: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: normalize(12),
    color: Colors.darkblue,
    textAlign: 'center',
  },
  text1: {
    fontSize: normalize(12),
    color: '#B4B3BB',
    fontFamily: Fonts.MulishRegular,
  },
  fontregular: {
    fontSize: normalize(12),
    color: Colors.textInputColor,
    fontFamily: Fonts.MulishRegular,
  },
  contentWrapper: {},
});
