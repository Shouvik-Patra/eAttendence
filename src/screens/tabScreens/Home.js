import {
  Alert,
  Image,
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

const Home = props => {
  const [isClocked, setIsClocked] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);
  const [capturedImageWithGeotag, setCapturedImageWithGeotag] = useState(null);
  console.log('capturedImageWithGeotag::', capturedImageWithGeotag);

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

  const handleClickPhoto = () => {
    // Navigate to Attendance page with required location data
    props?.navigation.navigate('Attendence', {
      currentAddress: '123 Main Street, City, State', // Replace with actual address
      latitude: 37.7749, // Replace with actual latitude
      longitude: -122.4194, // Replace with actual longitude
    });
  };

  const clearCapturedImage = () => {
    setCapturedImageWithGeotag(null);
  };

  // Load saved timer state on component mount
  useEffect(() => {
    loadTimerState();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start/stop timer based on clock state
  useEffect(() => {
    if (isClocked && startTime) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [isClocked, startTime]);

  const loadTimerState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('timerState');
      if (savedState) {
        const { isClocked: savedIsClocked, startTime: savedStartTime } =
          JSON.parse(savedState);

        if (savedIsClocked && savedStartTime) {
          setIsClocked(true);
          setStartTime(savedStartTime);
          // Calculate elapsed time since the app was closed
          const currentTime = Date.now();
          const elapsed = Math.floor((currentTime - savedStartTime) / 1000);
          setElapsedTime(elapsed);
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  };

  const saveTimerState = async (clockedState, timeStarted) => {
    try {
      const state = {
        isClocked: clockedState,
        startTime: timeStarted,
      };
      await AsyncStorage.setItem('timerState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleClockIn = () => {
    const currentTime = Date.now();
    handleClickPhoto();
    setIsClocked(true);
    setStartTime(currentTime);
    setElapsedTime(0);
    saveTimerState(true, currentTime);
    showErrorAlert('Clocked In', 'Timer started successfully!');
  };

  const handleClockOut = () => {
    handleClickPhoto();
    setIsClocked(false);
    setStartTime(null);
    stopTimer();
    saveTimerState(false, null);

    const finalTime = formatTime(elapsedTime);
    showErrorAlert('Clocked Out', `Total time worked: ${finalTime}`);
    setElapsedTime(0);
  };

  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const checkPermission = async () => {
    const newCameraPermission = await Camera.requestCameraPermission();
  };

  useEffect(() => {
    checkPermission();
  }, []);

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
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Section */}
        <View style={styles.userInfoContainer}>
          <View style={styles.userTextContainer}>
            <Text style={styles.userName}>
              Shouvik Patra
            </Text>
            <Text style={styles.userAddress}>
              Uttar Rajyadharpur, Baidyabati, Hooghly, 712222
            </Text>
            <Text style={styles.blackText}>
              Attendence :{' '}
              <Text style={[styles.redText, {color: isClocked ? Colors.green : Colors.red}]}>
                {isClocked ? 'Clocked In' : 'Pending'}
              </Text>
            </Text>
            <Text style={styles.blackText}>
              Today :
              <Text style={styles.todayText}>
                {' '}{moment().format('ddd, MMM, D')}.
              </Text>
            </Text>
            <Text style={styles.blackText}>
              Working Hour :
              <Text style={styles.redText}>
                {' '}{formatTime(elapsedTime)}
              </Text>
            </Text>
            <Text style={styles.blackText}>
              Started :
              <Text style={styles.redText}>
                {' '}
                {startTime
                  ? new Date(startTime).toLocaleTimeString()
                  : 'Not started'}
              </Text>
            </Text>
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
        <View style={styles.mapSection}>
          <View style={styles.mapContainer}>
            {/* Uncomment this for actual MapView */}
            {/* <MapView
              style={styles.map}
              initialRegion={{
                latitude: 22.5726,
                longitude: 88.3639,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
            >
              <Marker
                coordinate={{ latitude: 22.5726, longitude: 88.3639 }}
                title="Kolkata"
              />
            </MapView> */}
            <Image
              resizeMode="cover"
              style={styles.mapImage}
              source={Images.map}
            />
          </View>
        </View>

        {/* Clock In/Out Button */}
        <TouchableOpacity
          style={[styles.clockButton, {
            backgroundColor: isClocked ? '#FFA500' : Colors.green,
          }]}
          onPress={isClocked ? handleClockOut : handleClockIn}
        >
          <Text style={styles.clockButtonText}>
            {isClocked ? 'Clock Out' : 'Clock In'}
          </Text>
        </TouchableOpacity>
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