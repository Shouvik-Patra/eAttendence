import {
  Alert,
  FlatList,
  Image,
  ImageBackground,
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
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import {
  addTaskRequest,
  complitedTaskListRequest,
  endTaskRequest,
  startTaskRequest,
  taskListRequest,
  taskLocationRequest,
} from '../../redux/reducer/ProfileReducer';
import connectionrequest from '../../utils/helpers/NetInfo';
import Loader from '../../utils/helpers/Loader';
import { LocationGeocoder } from '../../components/LocationGeocoder';
import TextInputWithButton from '../../components/TextInputWithBotton';
import Button from '../../components/Button';
let status = '';
let currentLocation = '';
const ActiveTask = props => {
  const dispatch = useDispatch();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const ProfileReducer = useSelector(state => state.ProfileReducer);

  const isFocused = useIsFocused();
  const [isClocked, setIsClocked] = useState(false);
  const [taskId, setTaskId] = useState(null);
  const [taskAction, setTaskAction] = useState(null);
  const [endTaskModal, setEndTaskModal] = useState(false);
  const [addTaskModal, setAddTaskModal] = useState(false);
  const [TaskLocationList, setTaskLocation] = useState([]);
  const [TaskPurposeList, setTaskPurposeList] = useState([]);
  const [complitedTaskData, setComplitedTaskData] = useState([]);
  const [isFocusTask1, setIsFocusTask1] = useState(false);
  const [isFocusTask2, setIsFocusTask2] = useState(false);
  const [selectedTaskLocation, setSelectedTasklocatio] = useState('');
  const [selectedTaskPurpose, setSelectedTaskPurpose] = useState('');
  const [other_location, setOther_location] = useState('');
  const [other_purpose, setOther_purpose] = useState('');
  // const [buttonRes, setButtonRes] = useState('');
  console.log('>>>>>', selectedTaskLocation, selectedTaskPurpose);

  const [location, setLocation] = useState({ latitude: null, longitude: null });
  currentLocation = props?.route?.params?.currenLocation;
  const handleTasklocationSelect = async item => {
    setSelectedTasklocatio(item);
    setIsFocusTask1(false);
  };
  const handleTaskPurposeSelect = async item => {
    setSelectedTaskPurpose(item);
    setIsFocusTask2(false);
  };

  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => {
          dispatch(taskListRequest());
          dispatch(taskLocationRequest());
          dispatch(complitedTaskListRequest());
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    } else {
      setAddTaskModal(false);
    }
  }, [isFocused]);
  const getLocation = async (taskid, buttonRes) => {
    setEndTaskModal(false);
    setAddTaskModal(false);
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        // setLocation({ latitude, longitude });
        if (buttonRes == 'start') {
          onStartTask(latitude, longitude, taskid);
        } else if (buttonRes == 'end') {
          onEndTask(latitude, longitude, taskid);
        } else {
          onAddNewTask(latitude, longitude);
        }
      },
      error => {
        console.log('Error getting location', error);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  };
  // const handleClickPhoto = async (lat, long) => {
  //   const result = await LocationGeocoder(lat, long);
  //   const actualAddress = result?.address || 'Unknown Address';

  //   props?.navigation.navigate('Attendence', {
  //     currentAddress: actualAddress,
  //     latitude: lat,
  //     longitude: long,
  //     pagename: 'ActiveTask',
  //     status: 'task',
  //     location_id: selectedTaskLocation?.id,
  //     task_id: selectedTaskPurpose?.id,
  //     other_location: other_location,
  //     other_purpose: other_purpose,
  //   });
  // };

  const onAddNewTask = async (lat, long) => {
    const result = await LocationGeocoder(lat, long);
    const actualAddress = result?.address || 'Unknown Address';
    if (selectedTaskLocation?.id == undefined) {
      showErrorAlert('Please select task location');
    } else if (selectedTaskPurpose?.id == undefined) {
      showErrorAlert('Please select task purpose');
    } else if (
      selectedTaskLocation?.location_name == 'Others' &&
      other_location == ''
    ) {
      showErrorAlert('Please enter other location details');
    } else if (selectedTaskLocation?.title == 'Others' && other_purpose == '') {
      showErrorAlert('Please enter other purpose details');
    } else {
      const formData = new FormData();

      formData.append('task_id', selectedTaskPurpose?.id);
      formData.append('location_id', selectedTaskLocation?.id);
      formData.append('other_location', other_location);
      formData.append('other_purpose', other_purpose);
      formData.append('date', moment(new Date()).format('YYYY-MM-DD'));
      formData.append('time', moment().format('HH:mm:ss'));
      formData.append('latitude', lat);
      formData.append('longitude', long);
      formData.append('address', actualAddress);

      connectionrequest()
        .then(() => {
          console.log('formdata>>>>>>>', formData);

          dispatch(addTaskRequest(formData));
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  };
  const onStartTask = async (lat, long, taskid) => {
    const result = await LocationGeocoder(lat, long);
    const actualAddress = result?.address || 'Unknown Address';

    let obj = {
      id: taskid,
      start_time: moment().format('HH:mm:ss'),
      start_latitude: lat,
      start_longitude: long,
      start_address: actualAddress,
    };

    connectionrequest()
      .then(() => {
        console.log('formdata>>>>>>>', obj);

        dispatch(startTaskRequest(obj));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  };
  const onEndTask = async (lat, long, taskid) => {
    const result = await LocationGeocoder(lat, long);
    const actualAddress = result?.address || 'Unknown Address';

    let obj = {
      id: taskid,
      end_time: moment().format('HH:mm:ss'),
      end_latitude: lat,
      end_longitude: long,
      end_address: actualAddress,
    };

    connectionrequest()
      .then(() => {
        dispatch(endTaskRequest(obj));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  };

  const renderTaskList = ({ item, index }) => (
    console.log(item?.status),
    (
      <View style={styles.userInfoContainer}>
        <View style={styles.userTextContainer}>
          {/* <Text style={styles.userAddress}>{item?.address}</Text> */}
          <Text style={styles.blackText}>
            Visit Location :{' '}
            <Text style={styles.redText}>
              {item?.location_name ? item?.location_name : ''}
            </Text>
          </Text>
          <Text style={styles.blackText}>
            Visit Purpose :{' '}
            <Text style={styles.redText}>
              {item?.task_name ? item?.task_name : ''}
            </Text>
          </Text>
          <Text style={styles.blackText}>
            Created at :{' '}
            <Text style={styles.redText}>
              {/* {moment. item?.created_at} */}
              {moment(item?.created_at)
                .local()
                .format('ddd, MMM D, YYYY • h:mm A')}
            </Text>
          </Text>
          <Text style={styles.blackText}>
            Status :{' '}
            <Text
              style={[
                styles.redText,

                {
                  color: isClocked ? Colors.green : Colors.red,
                  textTransform: 'capitalize',
                },
              ]}
            >
              {item?.status}
            </Text>
          </Text>
          <Text style={styles.blackText}>
            Task Duration :{' '}
            <Text style={styles.redText}>{item?.task_duration}</Text>
          </Text>
        </View>

        {item?.status === 'approved' || item?.status === 'ongoing' ? (
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              width: '100%',
              alignItems: 'center',
            }}
          >
            <Button
              height={normalize(45)}
              width={'48%'}
              marginTop={normalize(25)}
              backgroundColor={Colors.green}
              title={'Start Task'}
              fontSize={normalize(15)}
              fontFamily={Fonts.MulishSemiBold}
              textColor={'white'}
              opacity={item?.status === 'ongoing' ? 0.5 : 1}
              disabled={item?.status === 'ongoing'}
              onPress={() => {
                getLocation(item?.id, 'start');
              }}
            />
            <Button
              height={normalize(45)}
              marginTop={normalize(25)}
              width={'48%'}
              backgroundColor={Colors.red}
              title={'End Task'}
              fontSize={normalize(15)}
              fontFamily={Fonts.MulishSemiBold}
              textColor={'white'}
              opacity={item?.status === 'approved' ? 0.5 : 1}
              disabled={item?.status === 'approved'}
              onPress={() => {
                setTaskId(item?.id);
                setTaskAction('end');
                setEndTaskModal(true);
              }}
            />
          </View>
        ) : null}
      </View>
    )
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
        if (ProfileReducer?.attendenceStatusResponse?.status === 'present') {
          Alert.alert('You are not allowed to add task', 'You Clocked Out');
        } else if (
          ProfileReducer?.attendenceStatusResponse?.attendance_status_text ==
            'Not Marked' &&
          currentLocation != 'outsideoffice'
        ) {
          Alert.alert(
            'You are not allowed to add task',
            'Please Clock In first',
          );
        } else if (
          ProfileReducer?.attendenceStatusResponse?.attendance_status_text ==
            'Attendance Not Applicable' &&
          currentLocation != 'outsideoffice'
        ) {
          Alert.alert(
            'You are not allowed to add task',
            'Please Clock In first',
          );
        } else {
          setAddTaskModal(true);
        }
      }}
    >
      <Image
        resizeMode="contain"
        style={{ height: 50, width: 50 }}
        source={
          ProfileReducer?.attendenceStatusResponse?.attendance_status_text ==
          'Clocked In'
            ? Images.addTask
            : Images.lock
        }
      />
      <Text style={styles.newTask}>Add New visit</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    if (ProfileReducer?.taskLocationResponse?.length > 0) {
      setTaskLocation(ProfileReducer.taskLocationResponse);
    }
  }, [ProfileReducer.taskLocationResponse]);
  useEffect(() => {
    if (ProfileReducer?.taskListResponse?.length > 0) {
      setTaskPurposeList(ProfileReducer.taskListResponse);
    }
  }, [ProfileReducer.taskListResponse]);
  useEffect(() => {
    if (ProfileReducer?.complitedTaskResponse?.length > 0) {
      setComplitedTaskData(ProfileReducer.complitedTaskResponse);
    }
  }, [ProfileReducer.complitedTaskResponse]);
  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/taskLocationRequest':
        status = ProfileReducer.status;

        break;
      case 'Profile/taskLocationSuccess':
        status = ProfileReducer.status;

        break;
      case 'Profile/taskLocationFailure':
        status = ProfileReducer.status;

        break;

      case 'Profile/taskListRequest':
        status = ProfileReducer.status;

        break;
      case 'Profile/taskListSuccess':
        status = ProfileReducer.status;

        break;
      case 'Profile/taskListFailure':
        status = ProfileReducer.status;

        showErrorAlert('Something went wrong!');
        break;

      case 'Profile/complitedTaskListRequest':
        status = ProfileReducer.status;

        break;
      case 'Profile/complitedTaskListSuccess':
        status = ProfileReducer.status;

        break;
      case 'Profile/complitedTaskListFailure':
        status = ProfileReducer.status;
        showErrorAlert('Something went wrong! ');

        break;

      case 'Profile/addTaskRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/addTaskSuccess':
        status = ProfileReducer.status;
        setAddTaskModal(false);
        dispatch(complitedTaskListRequest());
        break;
      case 'Profile/addTaskFailure':
        status = ProfileReducer.status;
        showErrorAlert('Task add fail due to Network issue, Try again!');
        break;

      case 'Profile/startTaskRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/startTaskSuccess':
        status = ProfileReducer.status;
        // setAddTaskModal(false);
        dispatch(complitedTaskListRequest());
        break;
      case 'Profile/startTaskFailure':
        status = ProfileReducer.status;
        showErrorAlert('Task add fail due to Network issue, Try again!');
        break;

      case 'Profile/endTaskRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/endTaskSuccess':
        status = ProfileReducer.status;
        // setAddTaskModal(false);
        dispatch(complitedTaskListRequest());
        break;
      case 'Profile/endTaskFailure':
        status = ProfileReducer.status;
        showErrorAlert('Task add fail due to Network issue, Try again!');
        break;
    }
  }

  return (
    <View style={styles.mainContainer}>
      <Header
        HeaderLogo
        Title
        placeText={'Field Visit'}
        onPress_back_button={() => {}}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />

      <Loader
        visible={
          ProfileReducer?.status == 'Profile/startTaskRequest' ||
          ProfileReducer?.status == 'Profile/endTaskRequest' ||
          ProfileReducer?.status == 'Profile/taskLocationRequest' ||
          ProfileReducer?.status == 'Profile/taskListRequest' ||
          ProfileReducer?.status == 'Profile/complitedTaskListRequest' ||
          ProfileReducer?.status == 'Profile/addTaskRequest'
        }
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <FlatList
          data={complitedTaskData}
          keyExtractor={item => item.id}
          renderItem={renderTaskList}
          ListFooterComponent={renderFooter}
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
        // style={{ width: '100%', alignSelf: 'center', }}
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
          <Text
            style={{
              textAlign: 'center',
              fontFamily: Fonts.MulishExtraBold,
              fontSize: 24,
              color: Colors.white,
              marginBottom: normalize(50),
            }}
          >
            Verify Your Visit
          </Text>
          <Text
            style={{
              textAlign: 'left',
              fontFamily: Fonts.MulishBold,
              fontSize: 16,
              color: Colors.white,
              marginBottom: 5,
            }}
          >
            Select visit location
          </Text>
          <View style={styles.dropdownContainer}>
            <Dropdown
              style={[
                styles.dropdown,
                isFocusTask1 && { borderColor: '#24bcf7' },
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              containerStyle={styles.dropdownListContainer}
              itemTextStyle={styles.dropdownItemText}
              data={TaskLocationList}
              maxHeight={300}
              labelField="location_name" // Display the title
              valueField="id" // Use the ID as value
              placeholder={!isFocusTask1 ? 'Select location' : '...'}
              searchPlaceholder="Search..."
              value={selectedTaskLocation?.location_name} // This will be the ID
              onFocus={() => setIsFocusTask1(true)}
              onBlur={() => setIsFocusTask1(false)}
              onChange={handleTasklocationSelect}
              renderLeftIcon={() => <Text style={styles.icon}>📋</Text>}
            />
            {selectedTaskLocation?.location_name == 'Others' && (
              <TextInputWithButton
                show={true}
                icon={true}
                height={normalize(45)}
                inputWidth={'100%'}
                marginTop={normalize(25)}
                backgroundColor={Colors.white}
                textColor={Colors.textInputColor}
                InputHeaderText={'Other location'}
                placeholder={'Other location'}
                placeholderTextColor={Colors.black}
                paddingLeft={normalize(25)}
                borderColor={Colors.skyblue}
                borderRadius={normalize(5)}
                editable={true}
                fontFamily={Fonts.MulishRegular}
                isheadertext={true}
                value={other_location}
                fontSize={normalize(14)}
                headertxtsize={normalize(13)}
                onChangeText={e => setOther_location(e)}
                tintColor={Colors.tintGrey}
              />
            )}
          </View>

          <Text
            style={{
              textAlign: 'left',
              fontFamily: Fonts.MulishBold,
              fontSize: 16,
              color: Colors.white,
              marginBottom: 5,
            }}
          >
            Select visit purpose
          </Text>
          <View style={styles.dropdownContainer}>
            <Dropdown
              style={[
                styles.dropdown,
                isFocusTask2 && { borderColor: '#24bcf7' },
              ]}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              inputSearchStyle={styles.inputSearchStyle}
              iconStyle={styles.iconStyle}
              containerStyle={styles.dropdownListContainer}
              itemTextStyle={styles.dropdownItemText}
              data={TaskPurposeList}
              maxHeight={300}
              labelField="title" // Display the title
              valueField="id" // Use the ID as value
              placeholder={!isFocusTask2 ? 'Select purpose' : '...'}
              searchPlaceholder="Search..."
              value={selectedTaskPurpose?.title} // This will be the ID
              onFocus={() => setIsFocusTask2(true)}
              onBlur={() => setIsFocusTask2(false)}
              onChange={handleTaskPurposeSelect}
              renderLeftIcon={() => <Text style={styles.icon}>📋</Text>}
            />
            {selectedTaskPurpose?.title == 'Others' && (
              <TextInputWithButton
                show={true}
                icon={true}
                height={normalize(45)}
                inputWidth={'100%'}
                backgroundColor={Colors.white}
                marginTop={normalize(25)}
                textColor={Colors.textInputColor}
                InputHeaderText={'Other purpose'}
                placeholder={'Other purpose'}
                placeholderTextColor={Colors.black}
                paddingLeft={normalize(25)}
                borderColor={Colors.skyblue}
                borderRadius={normalize(5)}
                editable={true}
                fontFamily={Fonts.MulishRegular}
                isheadertext={true}
                value={other_purpose}
                fontSize={normalize(14)}
                headertxtsize={normalize(13)}
                onChangeText={e => setOther_purpose(e)}
                tintColor={Colors.tintGrey}
              />
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.clockButton,
              {
                backgroundColor: Colors.orange,
              },
            ]}
            onPress={() => {
              getLocation();
            }}
          >
            <Text style={styles.clockButtonText}>Verify My Visit</Text>
          </TouchableOpacity>
        </ImageBackground>
      </Modal>

      <Modal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.7}
        hideModalContentWhileAnimating={true}
        isVisible={endTaskModal}
        animationInTiming={800}
        animationOutTiming={1000}
        onBackdropPress={() => setEndTaskModal(false)}
      >
        <ImageBackground
          resizeMode="stretch"
          source={Images.pageBackground}
          style={styles.modalContainer}
        >
          <TouchableOpacity
            style={styles.close}
            onPress={() => {
              setEndTaskModal(false);
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
              You are about to end thsi task. Now what...?
            </Text>

            <TouchableOpacity
              style={[
                styles.clockButton,
                {
                  backgroundColor: Colors.green,
                },
              ]}
              onPress={() => {
                setEndTaskModal(false);
                getLocation(taskId, taskAction);

                setTimeout(() => {
                  setAddTaskModal(true);
                }, 3000); // Adjust this delay if needed
              }}
            >
              <Text style={styles.clockButtonText}>Proceed To Next</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.clockButton,
                {
                  backgroundColor: Colors.orange,
                },
              ]}
              onPress={() => {
                getLocation(taskId, taskAction);
              }}
            >
              <Text style={styles.clockButtonText}>End This Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.clockButton,
                {
                  backgroundColor: Colors.red,
                },
              ]}
              // onPress={() => {
              //   props?.navigation?.navigate('Home', {
              //     currenLocation: 'ActiveTask',
              //   });
              //   setAddTaskModal(false);
              // }}

              onPress={() => {
                setEndTaskModal(false);
                setAddTaskModal(false);
                getLocation(taskId, taskAction);

                setTimeout(() => {
                  props?.navigation?.navigate('Home', {
                    currenLocation: 'ActiveTask',
                  });
                }, 3000); // Adjust this delay if needed
              }}
            >
              <Text style={styles.clockButtonText}>End Day</Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
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
    width: '100%',
    padding: normalize(10),
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    marginBottom: normalize(10),
  },
  userTextContainer: {
    width: '100%',
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
    fontFamily: Fonts.MulishRegular,
    fontSize: 16,
    marginTop: 5,
    color: Colors.black,
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
    width: '100%',
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
