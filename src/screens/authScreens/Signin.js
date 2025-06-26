import {
  Alert,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import Button from '../../components/Button';
import TextInputWithButton from '../../components/TextInputWithBotton';
import { postApi } from '../../utils/helpers/ApiRequest';
import axios from 'axios';
import apiService from '../../utils/helpers/ApiService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../utils/helpers/Loader';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const ResetPassword = props => {
  const [phone, setPhone] = useState('9876543210');
  const [secure1, setSecure1] = useState(false);
  const [password1, setPassword1] = useState('Test@1234');
  const [keyboardShown, setKeyboardShown] = useState(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true); // or some other action
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false); // or some other action
      },
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

const employeeLogin = async () => {
    if (!phone || !password1) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.login(phone, password1);
      console.log("red>>>>>>>>>>>>>",response);
      
      Alert.alert('Success', 'Login successful!', [
        {
          text: 'OK',
          onPress: () => props.navigation.replace('Home'),
        },
      ]);
    } catch (error) {
      // Error is already handled in apiService, but you can add custom handling here
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <ImageBackground
      source={Images.pageBackground}
      resizeMode="cover"
      style={styles.onbordingStyle}
    >
      <Loader visible={loading} />
      <SafeAreaView style={{ flex: 1, width: '100%' }}>
        <View style={{ width: '100%', paddingHorizontal: normalize(10) }}>
          <View style={styles.headerContain}>
            <Text style={styles.headerText1}>Login</Text>
            <Text style={styles.headerText2}>Lorem ipsum dolor sit amet</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            // paddingHorizontal: normalize(20),
            maxHeight: windowHeight - normalize(200),
            backgroundColor: '#FFF',
            borderRadius: normalize(10),
            padding: normalize(15),
            flex: 1,
            position: 'absolute',
            bottom: '10%',
            alignSelf: 'center',
            width: '90%',
          }}
          contentContainerStyle={{
            flexGrow: 1,
            paddingBottom: isKeyboardVisible ? normalize(200) : normalize(20),
          }}
        >
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
          >
            <View
              style={{
                width: '100%',
                height: normalize(370),
                alignSelf: 'center',
                backgroundColor: Colors.white,
                borderRadius: normalize(10),
                alignItems: 'center',
              }}
            >
              <TextInputWithButton
                show={true}
                icon={true}
                height={normalize(45)}
                inputWidth={'100%'}
                marginTop={normalize(25)}
                textColor={Colors.textInputColor}
                InputHeaderText={'Phone number'}
                placeholder={'Enter phone'}
                keyboardType={'phone-pad'}
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
                InputHeaderText={'New Password'}
                placeholder={'Enter password'}
                keyboardType={'email'}
                placeholderTextColor={Colors.black}
                paddingLeft={normalize(25)}
                borderColor={Colors.inputGreyBorder}
                borderRadius={normalize(5)}
                editable={true}
                fontFamily={Fonts.MulishRegular}
                isheadertext={true}
                value={password1}
                fontSize={normalize(14)}
                headertxtsize={normalize(13)}
                onChangeText={e => setPassword1(e)}
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
                borderRadius={normalize(10)}
                backgroundColor={Colors.button}
                title={'Signin'}
                fontSize={normalize(15)}
                fontFamily={Fonts.MulishSemiBold}
                textColor={'white'}
                onPress={() => {
                  employeeLogin();
                  // props.navigation.navigate('BottomTabNav');
                }}
              />
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default ResetPassword;

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
    // fontFamily: Fonts.MulishRegular,
    fontSize: normalize(22),
    marginTop: normalize(15),
    color: Colors.fontWhite,
    fontWeight: '900',
    textAlign: 'center',
  },
  headerText2: {
    fontFamily: Fonts.MulishRegular,
    fontSize: normalize(12),
    marginTop: normalize(10),
    color: Colors.fontWhite,

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
  contentWrapper: {
    // // height: normalize(370),
    // // position: 'absolute',
    // backgroundColor: Colors.white,
    // borderRadius: normalize(10),
    // width: '100%',
    // bottom: normalize(20),
    // padding: normalize(15)
  },
});
