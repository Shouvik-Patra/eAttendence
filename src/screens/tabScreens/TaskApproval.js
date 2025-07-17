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
  Platform,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import normalize from '../../utils/helpers/normalize';
import moment from 'moment';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
import Modal from 'react-native-modal';
import { useDispatch, useSelector } from 'react-redux';
import { useIsFocused } from '@react-navigation/native';
import Geolocation from '@react-native-community/geolocation';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  addTaskRequest,
  complitedTaskListRequest,
  taskListRequest,
  taskLocationRequest,
} from '../../redux/reducer/ProfileReducer';
import connectionrequest from '../../utils/helpers/NetInfo';
import Loader from '../../utils/helpers/Loader';
import { LocationGeocoder } from '../../components/LocationGeocoder';
import TextInputWithButton from '../../components/TextInputWithBotton';

let status = '';
let currentLocation = '';

const TaskApproval = props => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  console.log('Reducer Status:', ProfileReducer.status);

  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
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

  // New state variables for date/time pickers
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [locationString, setLocationString] = useState('');
  console.log('locationString>>>>>>>>', locationString);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  currentLocation = props?.route?.params?.currenLocation;

  // Date/Time picker handlers
  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDate;
    setShowStartDatePicker(Platform.OS === 'ios');
    setStartDate(currentDate);
  };

  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDate;
    setShowEndDatePicker(Platform.OS === 'ios');
    setEndDate(currentDate);
  };

  const onStartTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || startTime;
    setShowStartTimePicker(Platform.OS === 'ios');
    setStartTime(currentTime);
  };

  const onEndTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || endTime;
    setShowEndTimePicker(Platform.OS === 'ios');
    setEndTime(currentTime);
  };

  // Fixed dropdown handlers and state management
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
          dispatch(complitedTaskListRequest(`pending,rejected`));
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
    setLoading(true);
    setAddTaskModal(false);
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        onAddNewTask(latitude, longitude);
      },
      error => {
        console.log('Error getting location', error);
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
    );
  };

  const onAddNewTask = async (lat, long) => {
    const result = await LocationGeocoder(lat, long);
    const actualAddress = result?.address || 'Unknown Address';

    // Validation checks
    // if (!selectedTaskLocation?.id) {
    //   showErrorAlert('Please select task location');
    //   setLoading(false);
    //   return;
    // }
    if (!selectedTaskPurpose?.id) {
      showErrorAlert('Please select task purpose');
      setLoading(false);
      return;
    }
    // if (
    //   selectedTaskLocation?.location_name === 'Others' &&
    //   other_location === ''
    // ) {
    //   showErrorAlert('Please enter other location details');
    //   setLoading(false);
    //   return;
    // }
    if (selectedTaskPurpose?.title === 'Others' && other_purpose === '') {
      showErrorAlert('Please enter other purpose details');
      setLoading(false);
      return;
    }
    if (!startDate) {
      showErrorAlert('Please select start date');
      setLoading(false);
      return;
    }
    if (!endDate) {
      showErrorAlert('Please select end date');
      setLoading(false);
      return;
    }

    // Combine date and time for validation
    const startDateTime = new Date(startDate);
    startDateTime.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    const endDateTime = new Date(endDate);
    endDateTime.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    if (endDateTime < startDateTime) {
      showErrorAlert('End date and time must be after start date and time');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('location_id', selectedTaskPurpose?.id);
    formData.append('task_name', locationString);
    formData.append('other_purpose', other_purpose);
    formData.append('date', moment(new Date()).format('YYYY-MM-DD'));
    formData.append('time', moment().format('HH:mm:ss'));
    formData.append('createTaskDate', moment(startDate).format('YYYY-MM-DD'));
    formData.append('endTaskDate', moment(endDate).format('YYYY-MM-DD'));
    formData.append('start_time', moment(startTime).format('HH:mm:ss'));
    formData.append('end_time', moment(endTime).format('HH:mm:ss'));
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
  };

  const renderTaskList = ({ item, index }) => (
    <View
      style={[
        styles.userInfoContainer,
        {
          backgroundColor:
            item?.status == 'approved'
              ? Colors.lightgreen
              : item?.status == 'pending'
              ? Colors.lightred
              : item?.status == 'ongoing'
              ? Colors.lightYellow
              : item?.status == 'complete'
              ? Colors.lightgreen
              : Colors.lightred,
        },
      ]}
    >
      <View style={styles.userTextContainer}>
        <Text style={styles.blackText}>
          Visit Location(s) :{' '}
          <Text style={styles.redText}>
            {item?.task_name ? item?.task_name : ''}
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
                color: item?.status == 'rejected' ? Colors.red : Colors.green,
                textTransform: 'capitalize',
              },
            ]}
          >
            {item?.status}
          </Text>
        </Text>
        {/* <Text style={styles.blackText}>
          Start Date : <Text style={styles.redText}>{item?.task_duration}</Text>
        </Text>
        <Text style={styles.blackText}>
          End Date : <Text style={styles.redText}>{item?.task_duration}</Text>
        </Text> */}
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
        setAddTaskModal(true);
      }}
    >
      <Image
        resizeMode="contain"
        style={{ height: 50, width: 50 }}
        source={Images.addTask}
      />
      <Text style={styles.newTask}>Add New</Text>
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
  useEffect(() => {
    if (ProfileReducer.status === 'Profile/addTaskSuccess') {
      setLoading(false);
      Alert.alert('Hello');
      setAddTaskModal(false);
      // Reset form fields
      setSelectedTasklocatio('');
      setSelectedTaskPurpose('');
      setOther_location('');
      setOther_purpose('');
      setStartDate(new Date());
      setEndDate(new Date());
      setStartTime(new Date());
      setEndTime(new Date());
      dispatch(complitedTaskListRequest(`pending,rejected`));
    } else if (ProfileReducer.status === 'Profile/addTaskFailure') {
      setLoading(false);
    }
  }, [ProfileReducer.status]);

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

        break;
      case 'Profile/addTaskFailure':
        status = ProfileReducer.status;
        setLoading(false);
        break;
      case 'Profile/startTaskRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/startTaskSuccess':
        status = ProfileReducer.status;
        dispatch(complitedTaskListRequest(`pending,rejected`));

        break;
      case 'Profile/startTaskFailure':
        status = ProfileReducer.status;
        break;
      case 'Profile/endTaskRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/endTaskSuccess':
        status = ProfileReducer.status;
        dispatch(complitedTaskListRequest(`pending,rejected`));

        break;
      case 'Profile/endTaskFailure':
        status = ProfileReducer.status;
        break;
    }
  }

  return (
    <View style={styles.mainContainer}>
      <Loader
        visible={
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
        animationInTiming={800}
        animationOutTiming={1000}
        onBackdropPress={() => setAddTaskModal(false)}
      >
        <ImageBackground
          resizeMode="stretch"
          source={Images.pageBackground}
          style={styles.modalContainer}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.modalScrollContent}
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

            <Text style={styles.modalTitle}>Ask For Approval</Text>

            <Text style={styles.fieldLabel}>Select visit location</Text>
            <View style={styles.dropdownContainer}>
              <MultiSelect
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
                labelField="location_name"
                valueField="location_name" // value will now be an array of location_name
                placeholder={!isFocusTask1 ? 'Select location(s)' : '...'}
                searchPlaceholder="Search..."
                value={selectedLocations} // array of selected location names
                onFocus={() => setIsFocusTask1(true)}
                onBlur={() => setIsFocusTask1(false)}
                onChange={items => {
                  // ✅ items is an array of strings like ['DM office', 'SDO']
                  setSelectedLocations(items);
                  setLocationString(items.join(',')); // "DM office,SDO"
                }}
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

            <Text style={styles.fieldLabel}>Select visit purpose</Text>
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
                labelField="title"
                valueField="id"
                placeholder={!isFocusTask2 ? 'Select purpose' : '...'}
                searchPlaceholder="Search..."
                value={selectedTaskPurpose?.id}
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

            {/* Start Date and Time Section */}
            <Text style={styles.fieldLabel}>Start Date *</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateTimeButtonText}>
                  📅 {moment(startDate).format('DD/MM/YYYY')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.dateTimeButtonText}>
                  🕐 {moment(startTime).format('HH:mm')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* End Date and Time Section */}
            <Text style={styles.fieldLabel}>End Date *</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateTimeButtonText}>
                  📅 {moment(endDate).format('DD/MM/YYYY')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
                <Text style={styles.dateTimeButtonText}>
                  🕐 {moment(endTime).format('HH:mm')}
                </Text>
              </TouchableOpacity>
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
              <Text style={styles.clockButtonText}>Send for Approval</Text>
            </TouchableOpacity>
          </ScrollView>
        </ImageBackground>
      </Modal>

      {/* Date/Time Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          testID="startDatePicker"
          value={startDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onStartDateChange}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          testID="endDatePicker"
          value={endDate}
          mode="date"
          is24Hour={true}
          display="default"
          onChange={onEndDateChange}
        />
      )}
      {showStartTimePicker && (
        <DateTimePicker
          testID="startTimePicker"
          value={startTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onStartTimeChange}
        />
      )}
      {showEndTimePicker && (
        <DateTimePicker
          testID="endTimePicker"
          value={endTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onEndTimeChange}
        />
      )}
    </View>
  );
};

export default TaskApproval;

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
    zIndex: 1,
  },
  modalContainer: {
    maxHeight: '90%',
    justifyContent: 'center',
    borderRadius: normalize(8),
    overflow: 'hidden',
  },
  modalScrollContent: {
    padding: normalize(20),
    paddingTop: normalize(40),
  },
  modalTitle: {
    textAlign: 'center',
    fontFamily: Fonts.MulishExtraBold,
    fontSize: 24,
    color: Colors.white,
    marginBottom: normalize(30),
  },
  fieldLabel: {
    textAlign: 'left',
    fontFamily: Fonts.MulishBold,
    fontSize: 16,
    color: Colors.white,
    marginBottom: 5,
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
    marginTop: normalize(20),
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
  placeholderStyle: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.MulishRegular,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.MulishSemiBold,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.MulishRegular,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  dropdownListContainer: {
    backgroundColor: Colors.greytext,
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
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  icon: {
    marginRight: 10,
    fontSize: 18,
  },
  // New styles for date/time pickers
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  dateTimeButton: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.white,
    borderColor: '#2494ea',
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingLeft: 10,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  dateTimeButtonText: {
    fontSize: 16,
    color: Colors.black,
    fontFamily: Fonts.MulishSemiBold,
    textAlign: 'left',
  },
});
