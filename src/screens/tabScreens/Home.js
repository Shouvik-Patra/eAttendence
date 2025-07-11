import {
  Alert,
  Image,
  ImageBackground,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import { Camera } from 'react-native-vision-camera';
import normalize from '../../utils/helpers/normalize';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import moment from 'moment';
import Modal from 'react-native-modal';
import Geolocation from '@react-native-community/geolocation';
import Loader from '../../utils/helpers/Loader';
import connectionrequest from '../../utils/helpers/NetInfo';
import {
  attendenceStatusRequest,
  userDetailsRequest,
} from '../../redux/reducer/ProfileReducer';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import { LocationGeocoder } from '../../components/LocationGeocoder';
let status = '';
const Home = props => {
  const dispatch = useDispatch();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const ProfileReducer = useSelector(state => state.ProfileReducer);

  const isFocused = useIsFocused();
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [capturedImageWithGeotag, setCapturedImageWithGeotag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInsideOffice, setIsInsideOffice] = useState('');

  const [location, setLocation] = useState({
    latitude: 22.5726,
    longitude: 88.3639,
  });

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
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
  const getLocation = async (isInside, attendenceStatus) => {
    setLoading(true);
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setLocation({ latitude, longitude });
        handleClickPhoto(latitude, longitude, isInside, attendenceStatus);
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
    if (isFocused) {
      getCurrentLocation();
      connectionrequest()
        .then(() => {
          dispatch(attendenceStatusRequest());
          dispatch(userDetailsRequest());
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    } else {
      setAddTaskModal(false);
    }
  }, [isFocused]);
  const handleClickPhoto = async (lat, long, isInside, attendenceStatus) => {
    console.log('>>>', lat, long);
    const result = await LocationGeocoder(lat, long);
    const actualAddress = result?.address || 'Unknown Address';
    setLoading(false);
    props?.navigation.navigate('Attendence', {
      currentAddress: actualAddress,
      latitude: lat,
      longitude: long,
      pagename: 'Home',
      isInsideOffice: isInside,
      attendenceStatus: attendenceStatus,
      status:
        ProfileReducer?.attendenceStatusResponse?.is_attendance_given == 1 ||
        ProfileReducer?.attendenceStatusResponse?.is_attendance_given == 2
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
        break;
      case 'Profile/clockinSuccessFailure':
        status = ProfileReducer.status;
        break;
      case 'Profile/userDetailsRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/userDetailsSuccess':
        status = ProfileReducer.status;
        break;
      case 'Profile/userDetailsFailure':
        status = ProfileReducer.status;
        break;

      case 'Profile/attendenceStatusRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/attendenceStatusSuccess':
        status = ProfileReducer.status;
        break;
      case 'Profile/attendenceStatusFailure':
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
      <Loader
        visible={
          ProfileReducer?.status == 'Profile/clockinRequest' ||
          ProfileReducer?.status == 'Profile/userDetailsRequest'
        }
      />
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
                      ProfileReducer?.attendenceStatusResponse?.status ==
                      'pending'
                        ? Colors.red
                        : Colors.green,
                  },
                ]}
              >
                {ProfileReducer?.attendenceStatusResponse?.status == 'pending'
                  ? 'Pending...'
                  : 'Clocked In'}
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
        {!(
          ProfileReducer?.attendenceStatusResponse?.attendance_status_text ===
            'Clocked Out Outside' ||
          ProfileReducer?.attendenceStatusResponse?.attendance_status_text ===
            'Clocked Out Inside'
        ) && (
          <TouchableOpacity
            disabled={
              ProfileReducer?.attendenceStatusResponse?.status === 'pending' &&
              ProfileReducer?.attendenceStatusResponse?.is_attendance_given ===
                2
            }
            style={[
              styles.clockButton,
              {
                backgroundColor: (() => {
                  const { status, is_attendance_given } =
                    ProfileReducer?.attendenceStatusResponse || {};
                  if (status === 'pending' && is_attendance_given === 0)
                    return Colors.green;
                  if (status === 'pending' && is_attendance_given === 2)
                    return Colors.green;
                  if (status === 'present') return '#FFA500'; // Orange
                  return Colors.grey; // fallback
                })(),
                opacity:
                  ProfileReducer?.attendenceStatusResponse?.status ===
                    'pending' &&
                  ProfileReducer?.attendenceStatusResponse
                    ?.is_attendance_given === 2
                    ? 0.5
                    : 1,
              },
            ]}
            onPress={() => {
              const { status, is_attendance_given, is_task_running } =
                ProfileReducer?.attendenceStatusResponse || {};
              if (status === 'present') {
                if (is_task_running) {
                  Alert.alert('Warning!', 'Please End the running task', [
                    {
                      text: 'Cancel',
                      onPress: () => console.log('Cancel Pressed'),
                      style: 'cancel',
                    },
                    {
                      text: 'OK',
                      onPress: () => {
                        props?.navigation?.navigate('ActiveTask', {
                          currenLocation: 'Home',
                        });
                      },
                    },
                  ]);
                } else {
                  getLocation('inside', 'present');
                }
              } else {
                setAddTaskModal(true);
              }
            }}
          >
            <Text style={styles.clockButtonText}>
              {(() => {
                const { status, is_attendance_given } =
                  ProfileReducer?.attendenceStatusResponse || {};
                if (status === 'pending' && is_attendance_given === 0)
                  return 'Clock In';
                if (status === 'present' && is_attendance_given === 1)
                  return 'Clock Out';
                if (status === 'pending' && is_attendance_given === 2)
                  return 'Clock in pending...';
                if (status === 'present' && is_attendance_given === 2)
                  return 'Clock Out';
                return 'Loading...';
              })()}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Modal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.7}
        hideModalContentWhileAnimating={true}
        isVisible={addTaskModal}
        animationInTiming={800}
        animationOutTiming={1000}
        onBackdropPress={() => setAddTaskModal(false)}
      >
        <ImageBackground
          resizeMode="stretch"
          source={Images.pageBackground}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.close}
            onPress={() => {
              setAddTaskModal(false);
            }}
          >
            <Image
              resizeMode="contain"
              source={Images.close}
              style={{ height: normalize(10), width: normalize(10) }}
            />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={{ paddingTop: 50 }}>
            <Image
              resizeMode="contain"
              style={{
                alignSelf: 'center',
                height: normalize(100),
                width: normalize(100),
                marginTop: -50,
              }}
              source={Images.wb_logo}
            />

            <Text
              style={{
                textAlign: 'center',
                fontFamily: Fonts.MulishExtraBold,
                fontSize: 22,
                color: Colors.white,
                marginBottom: normalize(15),
                marginTop: normalize(20),
              }}
            >
              Select from where are you CLOCK IN
            </Text>

            <TouchableOpacity
              style={[
                styles.clockButton,
                {
                  backgroundColor: Colors.green,
                },
              ]}
              onPress={() => {
                getLocation('inside', 'present');
              }}
            >
              <Text style={styles.clockButtonText}>Inside Office</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.clockButton,
                {
                  backgroundColor: Colors.orange,
                },
              ]}
              onPress={() => {
                getLocation('outside', 'pending');
              }}
            >
              <Text style={styles.clockButtonText}>Outside Office</Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
      </Modal>
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

  close: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 50,
    padding: 5,
    height: normalize(20),
    width: normalize(20),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    height: normalize(400),
    justifyContent: 'center',
    padding: normalize(20),
    borderRadius: normalize(8),
    overflow: 'hidden',
    zIndex: 98,
  },
});
