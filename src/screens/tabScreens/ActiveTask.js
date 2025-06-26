import {
  Alert,
  FlatList,
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
import { Dropdown } from 'react-native-element-dropdown';
import Modal from 'react-native-modal';
const ActiveTask = props => {
  const [isClocked, setIsClocked] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);
  const [capturedImageWithGeotag, setCapturedImageWithGeotag] = useState(null);
  const [addTaskModal, setAddTaskModal] = useState(false);
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

  const TaskList = [
    { label: 'Field Visit 1', value: 'fv1' },
    { label: 'Field Visit 2', value: 'fv2' },
    { label: 'Field Visit 3', value: 'fv3' },
  ];
  const [isFocusTask, setIsFocusTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState('');
  const handleLanguageSelect = async item => {
    setSelectedTask(item.value);
    await AsyncStorage.setItem('language', item.value);
    setIsFocusTask(false);
  };

  const renderTaskList = ({ item, index }) => (
    <View style={styles.userInfoContainer}>
      <View style={styles.userTextContainer}>
        <Text style={styles.userAddress}>
          Uttar Rajyadharpur, Baidyabati, Hooghly, 712222
        </Text>
        <Text style={styles.blackText}>
          latitude :{' '}
          <Text
            style={[
              styles.redText,
              { color: isClocked ? Colors.green : Colors.red },
            ]}
          >
            22.95541
          </Text>
        </Text>
        <Text style={styles.blackText}>
          longitude :{' '}
          <Text
            style={[
              styles.redText,
              { color: isClocked ? Colors.green : Colors.red },
            ]}
          >
            88.115151
          </Text>
        </Text>
      </View>
      <View style={styles.imageContainer}>
        <Image
          resizeMode="contain"
          style={styles.userImagePlaceholder}
          source={Images.profilepic}
        />
      </View>
    </View>
  );
  const renderFooter = () => (
    <TouchableOpacity
      style={{
        width: '100%',
        height: normalize(100),
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginBottom: normalize(10),
      }}
      onPress={() => {
        setAddTaskModal(!addTaskModal);
      }}
    >
      <Image
        resizeMode="contain"
        style={{ height: 50, width: 50 }}
        source={Images.lock}
      />
      <Text style={styles.newTask}>Add New Task</Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.mainContainer}>
      <Header
        HeaderLogo
        Title
        placeText={'Active Task'}
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
        <FlatList
          data={TaskList}
          keyExtractor={item => item.id}
          renderItem={renderTaskList}
          // ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          // style={styles.flatList}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
      <Modal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.7}
        hideModalContentWhileAnimating={true}
        isVisible={addTaskModal}
        // isVisible={false}
        style={{ width: '100%', alignSelf: 'center', margin: 0 }}
        animationInTiming={800}
        animationOutTiming={1000}
        onBackdropPress={() => setAddTaskModal(!addTaskModal)}
      >
        <View style={styles.modalContainer}>
          <Text
            style={{
              textAlign: 'left',
              fontFamily: Fonts.MulishBold,
              fontSize: 16,
              color: Colors.white,
              marginBottom: 5,
            }}
          >
            Select Task for today
          </Text>
          <View style={styles.dropdownContainer}>
            <Dropdown
              style={[
                styles.dropdown,
                isFocusTask && { borderColor: '#24bcf7' },
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              containerStyle={styles.dropdownListContainer}
              itemTextStyle={styles.dropdownItemText}
              data={TaskList}
              maxHeight={300}
              labelField="label"
              valueField="value"
              placeholder={!isFocusTask ? 'Select Task' : '...'}
              searchPlaceholder="Search..."
              value={selectedTask}
              onFocus={() => setIsFocusTask(true)}
              onBlur={() => setIsFocusTask(false)}
              onChange={handleLanguageSelect}
              renderLeftIcon={() => <Text style={styles.icon}>📋</Text>}
            />
          </View>

          <TouchableOpacity
          style={[
            styles.clockButton,
            {
              backgroundColor: isClocked ? '#FFA500' : Colors.green,
            },
          ]}
          onPress={isClocked ? handleClockOut : handleClockIn}
        >
          <Text style={styles.clockButtonText}>
            {isClocked ? 'Clock Out' : 'Verify My Visit'}
          </Text>
        </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default ActiveTask;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalContainer: {
    height: normalize(550),
    backgroundColor: '#808080',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
    justifyContent: 'center',
    padding: normalize(15),
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
  newTask: {
    fontFamily: Fonts.MulishBold,
    fontSize: 16,
    color: Colors.black,
    marginTop: normalize(5),
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
    height: normalize(100),
    width: normalize(80),
    overflow: 'hidden',
  },
  userImage: {
    height: normalize(150),
    width: normalize(110),
  },
  userImagePlaceholder: {
    alignSelf: 'center',
    height: normalize(100),
    width: normalize(80),
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
  dropdownContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  dropdown: {
    height: 50,
    width: '100%',
    borderColor: '#2494ea',
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  // New styles for dropdown list styling
  dropdownListContainer: {
    backgroundColor: Colors.greytext, // Green background for dropdown list
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dropdownItemText: {
    color: '#000000', // Black text color for dropdown items
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 10,
    fontSize: 18,
  },
});
