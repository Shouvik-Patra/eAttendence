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
  Switch,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import { Camera } from 'react-native-vision-camera';
import normalize from '../../utils/helpers/normalize';
import moment from 'moment';
import Modal from 'react-native-modal';
import Geolocation from '@react-native-community/geolocation';
import Loader from '../../utils/helpers/Loader';
import connectionrequest from '../../utils/helpers/NetInfo';
import {
  attendenceStatusRequest,
  flashMessageRequest,
  userDetailsRequest,
} from '../../redux/reducer/ProfileReducer';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import constants from '../../utils/helpers/constants';
import UpdateModal from '../../components/UpdateModal';
import { logoutRequest } from '../../redux/reducer/AuthReducer';

let status = '';

const Home = props => {
  const dispatch = useDispatch();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const ProfileReducer = useSelector(state => state.ProfileReducer);

  const isFocused = useIsFocused();
  const [addTaskModal, setAddTaskModal] = useState(false);
  // Add these new states after existing useState declarations:
  const [flashMessage, setFlashMessage] = useState('');
  const [flashMessageModal, setFlashMessageModal] = useState(false);
  const [currentFlashIndex, setCurrentFlashIndex] = useState(0);
  const [capturedImageWithGeotag, setCapturedImageWithGeotag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [updateModalVisible, setUpdateModalVisible] = useState(false);

  // Permission states
  const [locationPermission, setLocationPermission] = useState(null);
  const [cameraPermission, setCameraPermission] = useState(null);

  // Network type toggle: true = High Accuracy (GPS), false = Battery Saver (Network)
  const [useHighAccuracy, setUseHighAccuracy] = useState(false);

  useEffect(() => {
    // if user is inactive then it will auto logout
    if (ProfileReducer?.userDetailsResponse?.status === 'inactive') {
      dispatch(logoutRequest());
    }
    const checkPermission = async () => {
      const status = await Camera.getCameraPermissionStatus();

      if (status !== 'authorized') {
        const newStatus = await Camera.requestCameraPermission();
      }
    };

    checkPermission();
  }, [isFocused]);

  useEffect(() => {
    if (ProfileReducer?.userDetailsResponse?.app_info != undefined) {
      if (
        ProfileReducer?.userDetailsResponse?.app_info[0]?.value !=
        constants?.APP_VERSION
      ) {
        setUpdateModalVisible(true);
      }
    }
  }, [isFocused]);

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
      // For iOS
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

  const getLocation = async (isInside, attendenceStatus) => {
    setAddTaskModal(false);
    try {
      setLoading(true);
      setLoadingMessage('Checking permissions...');

      const locationGranted = await checkLocationPermission();
      const cameraGranted = await checkCameraPermission();

      if (!locationGranted) {
        setLoading(false);
        setLoadingMessage('');
        showErrorAlert(
          'Location permission is required for attendance marking',
        );
        return;
      }

      if (!cameraGranted) {
        setLoading(false);
        setLoadingMessage('');
        showErrorAlert('Camera permission is required for attendance marking');
        return;
      }

      // Start location fetching
      setLoadingMessage(
        useHighAccuracy
          ? 'Fetching your location (High Accuracy)...'
          : 'Fetching your location (Battery Saver)...',
      );

      const locationPromise = new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            resolve({ latitude, longitude });
          },
          error => {
            console.log('Geolocation error:', error);
            let errorMessage = 'Unable to fetch location. ';

            switch (error.code) {
              case 1:
                errorMessage += 'Location permission denied.';
                break;
              case 2:
                errorMessage += 'Location not available.';
                break;
              case 3:
                errorMessage += 'Location request timed out.';
                break;
              default:
                errorMessage += 'Please try again.';
            }

            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: useHighAccuracy, // controlled by toggle
            timeout: useHighAccuracy ? 20000 : 15000,
            maximumAge: useHighAccuracy ? 5000 : 10000,
          },
        );
      });

      // Wait for location
      const locationData = await locationPromise;

      setLoading(false);
      setLoadingMessage('');
      setAddTaskModal(false);

      props?.navigation.navigate('Attendence', {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        pagename: 'Home',
        isInsideOffice: isInside,
        attendenceStatus: attendenceStatus,
        status:
          ProfileReducer?.attendenceStatusResponse?.is_attendance_given == 1 ||
          ProfileReducer?.attendenceStatusResponse?.is_attendance_given == 2 ||
          ProfileReducer?.attendenceStatusResponse?.is_attendance_given == 3
            ? 'clockout'
            : 'clockin',
        check_out_remarks:
          ProfileReducer?.attendenceStatusResponse?.task_tracking_remarks,
      });
    } catch (error) {
      setLoading(false);
      setLoadingMessage('');
      console.log('Location fetch error:', error);
      showErrorAlert(
        error.message || 'Failed to get location. Please try again.',
      );
    }
  };

  // Initial permission check on component mount
  useEffect(() => {
    const initializePermissions = async () => {
      await checkLocationPermission();
      await checkCameraPermission();
    };

    initializePermissions();
  }, []);

  useEffect(() => {
    if (props?.route?.params?.finalImageUri) {
      setCapturedImageWithGeotag(props.route.params.finalImageUri);
      props?.navigation.setParams({ finalImageUri: undefined });
    }
  }, [props?.route?.params?.finalImageUri]);

  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => {
          dispatch(attendenceStatusRequest());
          dispatch(userDetailsRequest());
          dispatch(flashMessageRequest());
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    } else {
      setAddTaskModal(false);
    }
  }, [isFocused]);

  // Handle clock in/out button press with permission validation
  const handleClockAction = () => {
    if (locationPermission !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please grant location permission to mark attendance.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Grant Permission',
            onPress: () => checkLocationPermission(),
          },
        ],
      );
      return;
    }

    if (cameraPermission !== 'granted') {
      Alert.alert(
        'Camera Permission Required',
        'Please grant camera permission to mark attendance.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Grant Permission', onPress: () => checkCameraPermission() },
        ],
      );
      return;
    }

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
              props?.navigation?.navigate('DailyTask', {
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
  };

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
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
      case 'Profile/flashMessageRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/flashMessageSuccess':
        status = ProfileReducer.status;
        setFlashMessage(ProfileReducer?.flashMessageResponse);
        if (
          ProfileReducer?.flashMessageResponse &&
          ProfileReducer.flashMessageResponse.length > 0
        ) {
          setCurrentFlashIndex(0);
          setFlashMessageModal(true);
        }
        break;
      case 'Profile/flashMessageFailure':
        status = ProfileReducer.status;
        break;
    }
  }

  // Helper to format "0 min" display — hide if zero/irrelevant
  const lateClockIn = ProfileReducer?.attendenceStatusResponse?.late_clock_in;
  const earlyClockOut =
    ProfileReducer?.attendenceStatusResponse?.early_clock_out;
  const officeTiming = ProfileReducer?.attendenceStatusResponse?.office_timing;

  return (
    <View style={styles.mainContainer}>
      <Header
        HeaderLogo
        Title
        placeText={'Home'}
        onPress_back_button={() => {}}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />
      <Loader
        visible={
          loading ||
          ProfileReducer?.status == 'Profile/clockinRequest' ||
          ProfileReducer?.status == 'Profile/userDetailsRequest' ||
          ProfileReducer?.status == 'Profile/flashMessageRequest'
        }
        loadingText={loadingMessage || 'Loading...'}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── User Info Card ── */}
        <View style={styles.userCard}>
          {/* Main body: big photo LEFT + info RIGHT */}
          <View style={styles.cardBody}>
            {/* ── Photo column ── */}
            <View style={styles.photoCol}>
              {ProfileReducer?.attendenceStatusResponse?.check_out_photo ? (
                <Image
                  resizeMode="stretch"
                  style={styles.profilePhoto}
                  source={{
                    uri: ProfileReducer.attendenceStatusResponse
                      .check_out_photo,
                  }}
                />
              ) : ProfileReducer?.attendenceStatusResponse?.check_in_photo ? (
                <Image
                  resizeMode="stretch"
                  style={styles.profilePhoto}
                  source={{
                    uri: ProfileReducer.attendenceStatusResponse.check_in_photo,
                  }}
                />
              ) : (
                <Image
                  resizeMode="contain"
                  style={styles.profilePhoto}
                  source={Images.profilepic}
                />
              )}
              {/* Status badge below photo */}
              <View
                style={[
                  styles.photoBadge,
                  {
                    backgroundColor:
                      ProfileReducer?.attendenceStatusResponse
                        ?.attendance_status_text === 'Clocked Out Other' ||
                      ProfileReducer?.attendenceStatusResponse
                        ?.attendance_status_text === 'Clocked Out Outside' ||
                      ProfileReducer?.attendenceStatusResponse
                        ?.attendance_status_text === 'Clocked Out Inside'
                        ? '#ef4444'
                        : ProfileReducer?.attendenceStatusResponse?.status ===
                          'pending'
                        ? '#f59e0b'
                        : '#22c55e',
                  },
                ]}
              >
                <Text style={styles.photoBadgeText}>
                  {ProfileReducer?.attendenceStatusResponse
                    ?.attendance_status_text === 'Clocked Out Other' ||
                  ProfileReducer?.attendenceStatusResponse
                    ?.attendance_status_text === 'Clocked Out Outside' ||
                  ProfileReducer?.attendenceStatusResponse
                    ?.attendance_status_text === 'Clocked Out Inside'
                    ? 'CLOCKED OUT'
                    : ProfileReducer?.attendenceStatusResponse?.status ===
                      'pending'
                    ? 'PENDING'
                    : 'CLOCKED IN'}
                </Text>
              </View>
            </View>

            {/* ── Info column ── */}
            <View style={styles.infoCol}>
              {/* Name */}
              <Text style={styles.infoName} numberOfLines={2}>
                {ProfileReducer?.userDetailsResponse?.name}
              </Text>

              {/* Designation */}
              <Text style={styles.infoDesignation} numberOfLines={1}>
                {ProfileReducer?.userDetailsResponse?.designation}
              </Text>

              {/* Phone */}
              <View style={styles.infoRow}>
                <Text style={styles.infoRowIcon}>📞</Text>
                <Text style={styles.infoRowText}>
                  {ProfileReducer?.userDetailsResponse?.phone}
                </Text>
              </View>

              {/* Municipality */}
              <View style={styles.infoRow}>
                <Text style={styles.infoRowIcon}>📍</Text>
                <Text style={styles.infoRowText} numberOfLines={2}>
                  {[
                    ProfileReducer?.userDetailsResponse?.municipality,
                    ...(
                      ProfileReducer?.userDetailsResponse
                        ?.municipality_another || []
                    ).map(i => i?.name),
                  ]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </Text>
              </View>

              {/* Today */}
              <View style={styles.infoRow}>
                <Text style={styles.infoRowIcon}>📅</Text>
                <Text style={styles.infoRowText}>
                  {moment().format('ddd, D MMM YYYY')}
                </Text>
              </View>

              {/* Office timing */}
              <View style={styles.infoRow}>
                <Text style={styles.infoRowIcon}>🕐</Text>
                <Text style={styles.infoRowText}>{officeTiming || '—'}</Text>
              </View>
            </View>
          </View>

          {/* ── Bottom stats strip ── */}
          <View style={styles.statsStrip}>
            <View style={styles.stripCell}>
              <Text style={styles.stripLabel}>Late Clock In</Text>
              <Text
                style={[
                  styles.stripValue,
                  {
                    color:
                      lateClockIn && lateClockIn !== '0 min'
                        ? '#ef4444'
                        : '#22c55e',
                  },
                ]}
              >
                {lateClockIn && lateClockIn !== '0 min'
                  ? lateClockIn
                  : '✓ On Time'}
              </Text>
            </View>

            <View style={styles.stripDivider} />

            <View style={styles.stripCell}>
              <Text style={styles.stripLabel}>Early Clock Out</Text>
              <Text
                style={[
                  styles.stripValue,
                  {
                    color:
                      earlyClockOut && earlyClockOut !== '0 min'
                        ? '#ef4444'
                        : '#22c55e',
                  },
                ]}
              >
                {earlyClockOut && earlyClockOut !== '0 min'
                  ? earlyClockOut
                  : '✓ None'}
              </Text>
            </View>
          </View>

          {/* Permission warning */}
          {(locationPermission === 'denied' ||
            cameraPermission === 'denied') && (
            <View style={styles.permissionWarning}>
              <Text style={styles.permissionWarningText}>
                ⚠️ Permissions needed for attendance
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

        {/* Network Type Toggle */}
        <View style={styles.networkToggleContainer}>
          <View style={styles.networkToggleRow}>
            <View style={styles.networkToggleLeft}>
              <Text style={styles.networkToggleTitle}>📡 Location Mode</Text>
              <Text style={styles.networkToggleSubtitle}>
                {useHighAccuracy
                  ? '🛰️ High Accuracy (GPS) — More precise location'
                  : '📶 Network Mode — Faster location detection'}
              </Text>
            </View>
            <Switch
              value={useHighAccuracy}
              onValueChange={val => setUseHighAccuracy(val)}
              thumbColor={useHighAccuracy ? Colors.white : Colors.white}
              trackColor={{ false: Colors.grey || '#ccc', true: Colors.green }}
            />
          </View>
        </View>

        {/* Clock In/Out Button */}
        {!(
          ProfileReducer?.attendenceStatusResponse?.attendance_status_text ===
            'Clocked Out Outside' ||
          ProfileReducer?.attendenceStatusResponse?.attendance_status_text ===
            'Clocked Out Inside' ||
          ProfileReducer?.attendenceStatusResponse?.attendance_status_text ===
            'Clocked Out Other' ||
          ProfileReducer?.attendenceStatusResponse?.is_attendence_allowed ===
            false
        ) && (
          <TouchableOpacity
            disabled={
              (ProfileReducer?.attendenceStatusResponse?.status === 'pending' &&
                ProfileReducer?.attendenceStatusResponse
                  ?.is_attendance_given === 2) ||
              (ProfileReducer?.attendenceStatusResponse?.status === 'pending' &&
                ProfileReducer?.attendenceStatusResponse
                  ?.is_attendance_given === 3)
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
                  if (status === 'pending' && is_attendance_given === 3)
                    return Colors.green;
                  if (status === 'present') return '#FFA500';
                  return Colors.grey;
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
            onPress={handleClockAction}
          >
            <Text style={styles.clockButtonText}>
              {(() => {
                const { status, is_attendance_given } =
                  ProfileReducer?.attendenceStatusResponse || {};
                if (status === 'pending' && is_attendance_given === 0)
                  return 'Clock In';
                if (status === 'present' && is_attendance_given === 1)
                  return 'Clock Out';
                if (status === 'present' && is_attendance_given === 2)
                  return 'Clock Out';
                if (status === 'pending' && is_attendance_given === 2)
                  return 'Clock in pending...';
                if (status === 'pending' && is_attendance_given === 3)
                  return 'Clock in pending...';
                if (status === 'present' && is_attendance_given === 3)
                  return 'Clock Out';
              })()}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      {/* Clock In Modal */}
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
        <ImageBackground resizeMode="stretch" style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.close}
            onPress={() => setAddTaskModal(false)}
          >
            <Image
              resizeMode="contain"
              source={Images.close}
              style={{ height: normalize(10), width: normalize(10) }}
            />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={{ paddingTop: 50 }}
            showsVerticalScrollIndicator={false}
          >
            <Image
              resizeMode="contain"
              style={{
                alignSelf: 'center',
                height: normalize(50),
                width: normalize(50),
                marginTop: -50,
              }}
              source={Images.wb_logo}
            />

            <Text
              style={{
                textAlign: 'center',
                fontFamily: Fonts.MulishExtraBold,
                fontSize: 22,
                color: Colors.green,
                marginBottom: normalize(15),
                marginTop: normalize(20),
              }}
            >
              Select from where are you CLOCK IN
            </Text>

            <TouchableOpacity
              style={[styles.clockButton, { backgroundColor: Colors.green }]}
              onPress={() => getLocation('inside', 'present')}
            >
              <Text style={styles.clockButtonText}>Office Duty</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.clockButton, { backgroundColor: Colors.skyblue }]}
              onPress={() => getLocation('outside', 'pending')}
            >
              <Text style={styles.clockButtonText}>
                Official Visit Within ULB Jurisdiction
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.clockButton, { backgroundColor: Colors.red }]}
              onPress={() => getLocation('other', 'pending')}
            >
              <Text style={styles.clockButtonText}>
                Official Visit Outside ULB Jurisdiction
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
      </Modal>
      // Add this Flash Message Modal just before the UpdateModal component at
      the bottom:
      {/* Flash Message Modal */}
      <Modal
        animationIn={'zoomIn'}
        animationOut={'zoomOut'}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.75}
        hideModalContentWhileAnimating={true}
        isVisible={flashMessageModal}
        animationInTiming={400}
        animationOutTiming={400}
        onBackdropPress={() => {
          setFlashMessageModal(false);
          setCurrentFlashIndex(0);
        }}
      >
        <View style={styles.flashModalContainer}>
          <ScrollView>
            {/* Header */}
            <View style={styles.flashModalHeader}>
              <View style={styles.flashIconCircle}>
                <Text style={{ fontSize: 20 }}>📢</Text>
              </View>
              <TouchableOpacity
                style={styles.flashCloseBtn}
                onPress={() => {
                  setFlashMessageModal(false);
                  setCurrentFlashIndex(0);
                }}
              >
                <Image
                  resizeMode="contain"
                  source={Images.close}
                  style={{ height: normalize(10), width: normalize(10) }}
                />
              </TouchableOpacity>
            </View>

            {/* Message count indicator */}
            {flashMessage?.length > 1 && (
              <View style={styles.flashDotRow}>
                {flashMessage.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.flashDot,
                      {
                        backgroundColor:
                          i === currentFlashIndex ? Colors.green : '#ccc',
                        width:
                          i === currentFlashIndex
                            ? normalize(18)
                            : normalize(8),
                      },
                    ]}
                  />
                ))}
              </View>
            )}

            {/* Title */}
            <Text style={styles.flashModalTitle}>
              {flashMessage?.[currentFlashIndex]?.title || ''}
            </Text>

            {/* Message */}
            <Text style={styles.flashModalMessage}>
              {flashMessage?.[currentFlashIndex]?.message || ''}
            </Text>

            {/* Counter */}
            {flashMessage?.length > 1 && (
              <Text style={styles.flashCounter}>
                {currentFlashIndex + 1} / {flashMessage.length}
              </Text>
            )}

            {/* Action button */}
            <TouchableOpacity
              style={styles.flashActionBtn}
              onPress={() => {
                if (currentFlashIndex < (flashMessage?.length || 1) - 1) {
                  setCurrentFlashIndex(prev => prev + 1);
                } else {
                  setFlashMessageModal(false);
                  setCurrentFlashIndex(0);
                }
              }}
            >
              <Text style={styles.flashActionText}>
                {currentFlashIndex < (flashMessage?.length || 1) - 1
                  ? 'Next →'
                  : 'Got it ✓'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
      <UpdateModal
        isVisible={updateModalVisible}
        onClose={() => setUpdateModalVisible(false)}
      />
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
    paddingBottom: normalize(100),
  },
  // ── User Card ────────────────────────────────────────────
  userCard: {
    backgroundColor: Colors.white,
    borderRadius: normalize(16),
    marginBottom: normalize(10),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    paddingTop: normalize(10),
    padding: normalize(5),
  },
  cardBody: {
    flexDirection: 'row',
  },
  // ── Photo column (left) ──
  photoCol: {
    width: normalize(115),
    backgroundColor: '#1e293b',
    borderTopRightRadius: normalize(10),
    borderTopLeftRadius: normalize(10),
  },
  profilePhoto: {
    width: normalize(115),
    height: normalize(155),
    borderTopRightRadius: normalize(10),
    borderTopLeftRadius: normalize(10),
  },
  photoBadge: {
    paddingVertical: normalize(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoBadgeText: {
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 9,
    color: Colors.white,
    letterSpacing: 0.8,
  },
  // ── Info column (right) ──
  infoCol: {
    flex: 1,
    paddingHorizontal: normalize(12),
    paddingTop: normalize(12),
    paddingBottom: normalize(10),
    justifyContent: 'center',
  },
  infoName: {
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 18,
    color: '#0f172a',
    lineHeight: 22,
    marginBottom: normalize(2),
  },
  infoDesignation: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 13,
    color: Colors.orange,
    marginBottom: normalize(8),
    textTransform: 'capitalize',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: normalize(5),
  },
  infoRowIcon: {
    fontSize: 13,
    marginRight: normalize(5),
    marginTop: 1,
  },
  infoRowText: {
    fontFamily: Fonts.MulishSemiBold,
    fontSize: 13,
    color: '#334155',
    flex: 1,
    lineHeight: 18,
  },
  // ── Stats strip (bottom) ──
  statsStrip: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  stripCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: normalize(10),
  },
  stripDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: normalize(8),
  },
  stripLabel: {
    fontFamily: Fonts.MulishRegular,
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: normalize(3),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  stripValue: {
    fontFamily: Fonts.MulishBold,
    fontSize: 13,
  },
  clockButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: normalize(50),
    borderRadius: normalize(8),
    marginBottom: normalize(20),
  },
  clockButtonText: {
    fontFamily: Fonts.MulishBold,
    fontSize: 18,
    textAlign: 'center',
    width: '80%',
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
    backgroundColor: Colors.white,
    height: normalize(400),
    justifyContent: 'center',
    padding: normalize(20),
    borderRadius: normalize(8),
    overflow: 'hidden',
    zIndex: 98,
  },
  // Network toggle styles
  networkToggleContainer: {
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    padding: normalize(12),
    marginBottom: normalize(10),
  },
  networkToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  networkToggleLeft: {
    flex: 1,
    marginRight: normalize(10),
  },
  networkToggleTitle: {
    fontFamily: Fonts.MulishBold,
    fontSize: 15,
    color: Colors.black,
  },
  networkToggleSubtitle: {
    fontFamily: Fonts.MulishRegular,
    fontSize: 12,
    color: '#555',
    marginTop: 3,
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

  // Add these styles to your StyleSheet.create({...}):

  flashModalContainer: {
    backgroundColor: Colors.white,
    borderRadius: normalize(16),
    padding: normalize(20),
    marginHorizontal: normalize(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  flashModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(10),
  },
  flashIconCircle: {
    width: normalize(44),
    height: normalize(44),
    borderRadius: normalize(22),
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashCloseBtn: {
    backgroundColor: '#f1f5f9',
    borderRadius: 50,
    padding: 6,
    height: normalize(24),
    width: normalize(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(12),
    gap: 5,
  },
  flashDot: {
    height: normalize(8),
    borderRadius: normalize(4),
  },
  flashModalTitle: {
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 18,
    color: '#0f172a',
    marginBottom: normalize(10),
    lineHeight: 24,
  },
  flashModalMessage: {
    fontFamily: Fonts.MulishRegular,
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
    marginBottom: normalize(16),
  },
  flashCounter: {
    fontFamily: Fonts.MulishRegular,
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginBottom: normalize(8),
  },
  flashActionBtn: {
    backgroundColor: Colors.green,
    borderRadius: normalize(8),
    paddingVertical: normalize(12),
    alignItems: 'center',
  },
  flashActionText: {
    fontFamily: Fonts.MulishBold,
    fontSize: 15,
    color: Colors.white,
  },
});
