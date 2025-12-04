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
  Linking,
  FlatList,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import { Camera } from 'react-native-vision-camera';
import normalize from '../../utils/helpers/normalize';
import Loader from '../../utils/helpers/Loader';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import moment from 'moment';
import Geolocation from '@react-native-community/geolocation';
import connectionrequest from '../../utils/helpers/NetInfo';
import {
  InformalProfileDetailsRequest,
  informalUserDetailsRequest,
} from '../../redux/reducer/InformalProfileReducer';
import showErrorAlert from '../../utils/helpers/Toast';

let status = '';

const InformalHome = props => {
  const dispatch = useDispatch();
  const InformalProfileReducer = useSelector(
    state => state.InformalProfileReducer,
  );

  const isFocused = useIsFocused();
  const [loadingMessage, setLoadingMessage] = useState('');

  // Permission states
  const [locationPermission, setLocationPermission] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(
    InformalProfileReducer?.InformalProfileDetailsResponse || '',
  );

  const [workersData, setWorkersData] = useState([]);
  useEffect(() => {
    setWorkersData(InformalProfileReducer?.informaluserDetailsResponse || []);
  }, [InformalProfileReducer?.informaluserDetailsResponse]);
  function userProfileDetails() {
    connectionrequest()
      .then(() => {
        dispatch(InformalProfileDetailsRequest());
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  }

  useEffect(() => {
    checkLocationPermission();
    checkCameraPermission();

    const checkPermission = async () => {
      const status = await Camera.getCameraPermissionStatus();

      if (status !== 'authorized') {
        const newStatus = await Camera.requestCameraPermission();
      }
    };

    checkPermission();
  }, [isFocused]);

  // Get current location
  const getCurrentLocation = (status, workerId) => {
    setLoading(true);

    Geolocation.getCurrentPosition(
      position => {
        props?.navigation.navigate('InformalAttendance', {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          status: status,
          pagename: 'InformalHome',
          workerId: workerId,
        });
        setLoading(false);
      },
      error => {
        setLoading(false);

        console.log('Location error:', error);
        Alert.alert(
          'Location Error',
          'Unable to get current location. Please ensure location services are enabled.',
        );
      },
      {
        enableHighAccuracy: false,
        timeout: 60000,
        maximumAge: 10000,
      },
    );
  };

  const handleClickPhoto = (status, workerId) => {
    getCurrentLocation(status, workerId);
  };

  // Check and request location permission
  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );

        if (granted) {
          setLocationPermission('granted');
          return true;
        } else {
          const requestResult = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission Required',
              message:
                'This app needs access to your location for attendance marking.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );

          if (requestResult === PermissionsAndroid.RESULTS.GRANTED) {
            setLocationPermission('granted');
            return true;
          } else if (
            requestResult === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ) {
            setLocationPermission('denied');
            showSettingsAlert('Location');
            return false;
          } else {
            setLocationPermission('denied');
            return false;
          }
        }
      } catch (error) {
        console.log('Location permission error:', error);
        setLocationPermission('denied');
        return false;
      }
    } else {
      setLocationPermission('granted');
      return true;
    }
  };

  // Check and request camera permission
  const checkCameraPermission = async () => {
    try {
      const permission = await Camera.getCameraPermissionStatus();

      if (permission === 'granted') {
        setCameraPermission('granted');
        return true;
      } else if (permission === 'not-determined') {
        const newPermission = await Camera.requestCameraPermission();
        if (newPermission === 'granted') {
          setCameraPermission('granted');
          return true;
        } else {
          setCameraPermission('denied');
          if (newPermission === 'denied') {
            showSettingsAlert('Camera');
          }
          return false;
        }
      } else {
        setCameraPermission('denied');
        showSettingsAlert('Camera');
        return false;
      }
    } catch (error) {
      console.log('Camera permission error:', error);
      setCameraPermission('denied');
      return false;
    }
  };

  // Show alert to navigate to settings
  const showSettingsAlert = permissionType => {
    Alert.alert(
      `${permissionType} Permission Required`,
      `Please enable ${permissionType.toLowerCase()} permission in settings to use this feature.`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Permission denied'),
          style: 'cancel',
        },
        {
          text: 'Open Settings',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Linking.openURL('app-settings:');
            } else {
              Linking.openSettings();
            }
          },
        },
      ],
    );
  };

  // Handle clock in/out functionality
  const handleClockInOut = (status, workerId) => {
    handleClickPhoto(status, workerId);
  };

  useEffect(() => {
    userProfileDetails();
    connectionrequest()
      .then(() => {
        dispatch(informalUserDetailsRequest());
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  }, [isFocused]);

  // Helper function to determine worker status
  const getWorkerStatus = item => {
    if (item.check_in && item.check_out) {
      return 'completed'; // Both clock-in and clock-out done
    } else if (item.check_in && !item.check_out) {
      return 'clocked-in'; // Only clock-in done
    } else {
      return 'pending'; // No clock-in yet
    }
  };

  // Render worker item
  const renderWorkerItem = ({ item, index }) => {
    const workerStatus = getWorkerStatus(item);
    const isCompleted = workerStatus === 'completed';
    const isClockedIn = workerStatus === 'clocked-in';
    const isPending = workerStatus === 'pending';

    return (
      <View
        key={item.id}
        style={[styles.workerItem, isCompleted && styles.workerItemCompleted]}
      >
        <View style={styles.workerInfoContainer}>
          <Text style={styles.workerName}>{item.name}</Text>

          {/* Display clock-in and clock-out times */}
          <View style={styles.timeContainer}>
            {item.check_in && (
              <Text style={styles.timeText}>In: {item.check_in}</Text>
            )}
            {item.check_out && (
              <Text style={styles.timeText}>Out: {item.check_out}</Text>
            )}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          {isCompleted ? (
            // Show completed status when both clock-in and clock-out are done
            <View style={styles.completedBadge}>
              <Text style={styles.completedText}>✓ Completed</Text>
            </View>
          ) : (
            // Show appropriate button based on status
            <TouchableOpacity
              style={[
                styles.clockButton,
                isClockedIn ? styles.clockOutButton : styles.clockInButton,
                isCompleted && styles.disabledButton,
              ]}
              onPress={() =>
                handleClockInOut(item.attendance_status_check, item.id)
              }
              disabled={isCompleted}
            >
              <Text style={styles.buttonText}>
                {isClockedIn ? 'Clock-Out' : 'Clock-In'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
  if (status == '' || InformalProfileReducer.status != status) {
    switch (InformalProfileReducer.status) {
      case 'InformalProfile/informalUserDetailsRequest':
        status = InformalProfileReducer.status;
        break;
      case 'InformalProfile/informalUserDetailsSuccess':
        status = InformalProfileReducer.status;
        setWorkersData(InformalProfileReducer?.informaluserDetailsResponse);
        break;
      case 'InformalProfile/informalUserDetailsFailure':
        status = InformalProfileReducer.status;
        setWorkersData([]);
        break;

      case 'InformalProfile/InformalProfileDetailsRequest':
        status = InformalProfileReducer.status;
        break;
      case 'InformalProfile/InformalProfileDetailsSuccess':
        status = InformalProfileReducer.status;
        setProfileData(InformalProfileReducer?.InformalProfileDetailsResponse);
        break;
      case 'InformalProfile/InformalProfileDetailsFailure':
        status = InformalProfileReducer.status;

        break;
    }
  }
  return (
    <ImageBackground source={Images.greenbg} style={styles.mainContainer}>
      <Header
        HeaderLogo
        Title
        placeText={'Attendance'}
        onPress_back_button={() => {
          // setModalVisible(true);
        }}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />

      <Loader visible={loading} loadingText={loadingMessage || 'Loading...'} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info Section */}
        <View style={styles.userInfoContainer}>
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>
              {profileData?.park_details?.project_code}
            </Text>

            <Text
              style={[
                styles.userAddress,
                { color: Colors.lightBlue, textTransform: 'capitalize' },
              ]}
            >
              {profileData?.park_details?.project_type}
            </Text>
            <Text
              style={[
                styles.userAddress,
                { color: Colors.white, textTransform: 'capitalize' },
              ]}
            >
              {profileData?.district_name}
            </Text>
            <Text
              style={[
                styles.userAddress,
                { color: Colors.orange, textTransform: 'capitalize' },
              ]}
            >
              {profileData?.municipality_name}
            </Text>

            <Text style={styles.whiteText}>
              Today :
              <Text style={styles.todayText}>
                {' '}
                {moment().format('ddd, MMM, D')}.
              </Text>
            </Text>

            {/* Permission Status Indicators */}
            {(locationPermission === 'denied' ||
              cameraPermission === 'denied') && (
              <View style={styles.permissionWarning}>
                <Text style={styles.permissionWarningText}>
                  ⚠️ Permissions needed for attendance marking
                </Text>
                {locationPermission === 'denied' && (
                  <Text style={styles.permissionText}>
                    • Location access required
                  </Text>
                )}
                {cameraPermission === 'denied' && (
                  <Text style={styles.permissionText}>
                    • Camera access required
                  </Text>
                )}
              </View>
            )}
          </View>
          {/* <View style={styles.imageContainer}> */}
          <Image
            resizeMode="contain"
            style={styles.userImagePlaceholder}
            source={Images.wb_logo}
          />
        </View>
        {/* </View> */}

        {/* Workers List Section */}
        <View style={styles.workersListContainer}>
          <Text style={styles.workersListHeading}>List of Workers</Text>

          <View style={styles.flatListContainer}>
            <FlatList
              data={workersData}
              keyExtractor={item => item.id.toString()}
              renderItem={renderWorkerItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

export default InformalHome;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  imageContainer: {
    borderWidth: normalize(2),
    borderRadius: normalize(15),
    borderColor: Colors.skyblue,
    height: normalize(100),
    width: normalize(90),
    overflow: 'hidden',
  },
  userImage: {
    height: normalize(100),
    width: normalize(90),
  },
  userImagePlaceholder: {
    alignSelf: 'center',
    height: normalize(80),
    width: normalize(70),
  },
  userInfoContainer: {
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '95%',
    padding: normalize(10),
    backgroundColor: Colors.bgColor,
    borderRadius: normalize(8),
    marginBottom: normalize(10),
    marginTop: normalize(10),
  },
  userTextContainer: {
    width: '60%',
  },
  userName: {
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 20,
    color: Colors.white,
  },
  phone: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
  },
  userAddress: {
    fontFamily: Fonts.MulishBold,
    fontSize: 16,
    marginTop: 5,
  },
  whiteText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    marginTop: 5,
    color: Colors.white,
  },
  blackText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    marginTop: 5,
    color: Colors.black,
  },
  redText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    marginTop: 5,
    color: Colors.red,
  },
  todayText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    marginTop: 5,
    color: Colors.green,
  },

  // Permission warning styles
  permissionWarning: {
    marginTop: normalize(10),
    padding: normalize(8),
    backgroundColor: '#FFF3CD',
    borderRadius: normalize(5),
    borderLeftWidth: 3,
    borderLeftColor: '#FFA500',
  },
  permissionWarningText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 14,
    color: '#856404',
    marginBottom: 5,
  },
  permissionText: {
    fontFamily: Fonts.MulishRegular,
    fontSize: 12,
    color: '#856404',
    marginLeft: 10,
  },

  // Workers List Styles
  workersListContainer: {
    alignSelf: 'center',
    width: '95%',
    backgroundColor: Colors.bgColor,
    borderRadius: normalize(8),
    padding: normalize(10),
    marginBottom: normalize(20),
  },
  workersListHeading: {
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 18,
    color: Colors.white,
    marginBottom: normalize(15),
    textAlign: 'center',
  },
  flatListContainer: {
    paddingBottom: normalize(100),
  },
  workerItem: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(15),
    backgroundColor: '#F8F9FA',
    borderRadius: normalize(8),
    marginBottom: normalize(10),
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1.41,
  },
  workerItemCompleted: {
    backgroundColor: '#E8F5E9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  workerInfoContainer: {
    flex: 1,
    marginRight: normalize(10),
  },
  workerName: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 16,
    color: Colors.black,
    marginBottom: normalize(4),
  },
  timeContainer: {
    marginTop: normalize(2),
  },
  timeText: {
    fontFamily: Fonts.MulishRegular,
    fontSize: 12,
    color: '#666',
    marginTop: normalize(2),
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: normalize(8),
  },
  clockButton: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(6),
    minWidth: normalize(80),
    alignItems: 'center',
  },
  clockInButton: {
    backgroundColor: Colors.green || '#28A745',
  },
  clockOutButton: {
    backgroundColor: '#FFC107',
  },
  disabledButton: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  completedBadge: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(6),
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  completedText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 14,
    color: Colors.white,
  },
  buttonText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 14,
    color: Colors.white,
  },
});
