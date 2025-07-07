import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import showErrorAlert from '../../utils/helpers/Toast';
import { Camera } from 'react-native-vision-camera';
import normalize from '../../utils/helpers/normalize';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import moment from 'moment';
import Geolocation from '@react-native-community/geolocation';
import Loader from '../../utils/helpers/Loader';
import connectionrequest from '../../utils/helpers/NetInfo';
import { userDetailsRequest } from '../../redux/reducer/ProfileReducer';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { LocationGeocoder } from '../../components/LocationGeocoder';
let status = '';
const Home = props => {
  const dispatch = useDispatch();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();
  const [capturedImageWithGeotag, setCapturedImageWithGeotag] = useState(null);
  const [loading, setLoading] = useState(false);

  const [location, setLocation] = useState({
    latitude: 22.5726,
    longitude: 88.3639,
  });
  console.log('my location', location);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const getLocation = async () => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        handleClickPhoto(latitude, longitude);
      },
      error => {
        setLoading(false);
        console.log('Error getting location', error);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  };
  const getCurrentLocation = async () => {
    // setLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        setLoading(false);
      },
      error => {
        setLoading(false);
        console.log('Error getting location', error);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  };


  // Listen for the returned image from Attendance page
  useEffect(() => {
    if (props?.route?.params?.finalImageUri) {
      setCapturedImageWithGeotag(props.route.params.finalImageUri);
      // Clear the parameter to avoid re-triggering
      props?.navigation.setParams({ finalImageUri: undefined });

      // Show success message
      showErrorAlert('Success', 'Photo captured with geotag successfully!');
    }
  }, [props?.route?.params?.finalImageUri]);
  useEffect(() => {
    getCurrentLocation();
    connectionrequest()
      .then(() => {
        dispatch(userDetailsRequest());
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  }, []);
  const handleClickPhoto = async (lat, long) => {
    console.log('>>>', lat, long);
    const result = await LocationGeocoder(lat, long);
    const actualAddress = result?.address || 'Unknown Address';
    setLoading(false);
    props?.navigation.navigate('Attendence', {
      currentAddress: actualAddress,
      latitude: lat,
      longitude: long,
      pagename: 'Home',
      status:
        ProfileReducer?.userDetailsResponse?.is_attendance_given == 1
          ? 'clockout'
          : 'clockin',
    });
  };

  const checkPermission = async () => {
    const newCameraPermission = await Camera.requestCameraPermission();
  };

  useEffect(() => {
    requestLocationPermission();
    checkPermission();
  }, []);

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/clockinRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/clockinSuccess':
        status = ProfileReducer.status;
        // setFormTypeData(ProfileReducer?.formListResponse?.data);
        break;
      case 'Profile/clockinSuccessFailure':
        status = ProfileReducer.status;
        break;
    }
  }
  return (
    <View style={styles.mainContainer}>
      <Header
        HeaderLogo
        Title
        placeText={'Home'}
        onPress_back_button={() => {
          // setModalVisible(true); // Make sure this function exists
        }}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />
      <Loader visible={loading} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        <View style={styles.userInfoContainer}>
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>
              {ProfileReducer?.userDetailsResponse?.name}
            </Text>
            <Text style={styles.userAddress}>
              Uttar Rajyadharpur, Baidyabati, Hooghly, 712222
            </Text>
            <Text style={styles.blackText}>
              Attendence :{' '}
              <Text
                style={[
                  styles.redText,
                  {
                    color:
                      ProfileReducer?.userDetailsResponse
                        ?.is_attendance_given == 1
                        ? Colors.green
                        : Colors.red,
                  },
                ]}
              >
                {ProfileReducer?.userDetailsResponse?.is_attendance_given == 1
                  ? 'Clocked In'
                  : 'Pending...'}
              </Text>
            </Text>
            <Text style={styles.blackText}>
              Today :
              <Text style={styles.todayText}>
                {' '}
                {moment().format('ddd, MMM, D')}.
              </Text>
            </Text>
            {/* <Text style={styles.blackText}>
              Working Hour :
              <Text style={styles.redText}> {formatTime(elapsedTime)}</Text>
            </Text> */}
            {/* <Text style={styles.blackText}>
              Started :
              <Text style={styles.redText}>
                {' '}
                {startTime
                  ? new Date(startTime).toLocaleTimeString()
                  : 'Not started'}
              </Text>
            </Text> */}
          </View>
          <View style={styles.imageContainer}>
            {capturedImageWithGeotag ? (
              <Image
                resizeMode="cover"
                style={styles.userImage}
                source={{ uri: capturedImageWithGeotag }}
              />
            ) : (
              <Image
                resizeMode="contain"
                style={styles.userImagePlaceholder}
                source={Images.profilepic}
              />
            )}
          </View>
        </View>

        {/* Map Section */}
        {/* <View style={styles.mapSection}>
          <View style={styles.mapContainer}>
            {location?.latitude && location?.longitude ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                  latitudeDelta: 0.009,
                  longitudeDelta: 0.004,
                }}
                showsUserLocation={true}
                showsMyLocationButton={true}
                provider={PROVIDER_GOOGLE}
              >
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title="My Location"
                  description="Current Position"
                />
              </MapView>
            ) : (
              <Text style={{ textAlign: 'center', padding: 10 }}>
                Fetching location...
              </Text>
            )}
          </View>
        </View> */}

        {/* Clock In/Out Button */}
        {ProfileReducer?.userDetailsResponse?.attendance_status_text !=
          'Clocked Out' && (
            <TouchableOpacity
              style={[
                styles.clockButton,
                {
                  backgroundColor:
                    ProfileReducer?.userDetailsResponse?.is_attendance_given == 1
                      ? '#FFA500'
                      : Colors.green,
                },
              ]}
              onPress={() => {
                getLocation();
              }}
            >
              <Text style={styles.clockButtonText}>
                {ProfileReducer?.userDetailsResponse?.is_attendance_given == 1
                  ? 'Clock Out'
                  : 'Clock In'}
              </Text>
            </TouchableOpacity>
          )}
      </ScrollView>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#34495e',
  },
  scrollViewContent: {
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(10),
    paddingBottom: normalize(100), // Extra padding at bottom
  },
  userInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    padding: normalize(10),
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    marginBottom: normalize(10),
  },
  userTextContainer: {
    width: '60%',
  },
  userName: {
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 20,
  },
  userAddress: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    fontWeight: '500',
    marginTop: 5,
  },
  blackText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 5,
    color: Colors.black,
  },
  redText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 5,
    color: Colors.red,
  },
  todayText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 5,
    color: Colors.green,
  },
  imageContainer: {
    borderWidth: normalize(2),
    borderRadius: normalize(15),
    borderColor: Colors.skyblue,
    height: normalize(150),
    width: normalize(110),
    overflow: 'hidden',
  },
  userImage: {
    height: normalize(150),
    width: normalize(110),
  },
  userImagePlaceholder: {
    alignSelf: 'center',
    height: normalize(150),
    width: normalize(110),
  },
  mapSection: {
    width: '100%',
    padding: normalize(5),
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    marginBottom: normalize(15),
  },
  mapContainer: {
    height: normalize(300),
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapImage: {
    height: normalize(300),
    width: '100%',
  },
  clockButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: normalize(50),
    borderRadius: normalize(8),
    marginBottom: normalize(20),
  },
  clockButtonText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 20,
    fontWeight: '900',
    color: Colors.white,
  },
});
