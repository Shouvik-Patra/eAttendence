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
import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import TextInputWithButton from '../../components/TextInputWithBotton';
import DatePicker from 'react-native-date-picker';
import normalize from '../../utils/helpers/normalize';
import Modal from 'react-native-modal';
import connectionrequest from '../../utils/helpers/NetInfo';
import { useDispatch, useSelector } from 'react-redux';
import {
  applyLeaveRequest,
  leaveTypeRequest,
} from '../../redux/reducer/ProfileReducer';
import Loader from '../../utils/helpers/Loader';
import { Dropdown } from 'react-native-element-dropdown';
import { useIsFocused } from '@react-navigation/native';
let status = '';
const ApplyLeave = () => {
  const dispatch = useDispatch();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [leaveType, setLeaveType] = useState([]);
  const [selectedLeaveType, setSelectedLeaveType] = useState(null);
  const [isFocusTask, setIsFocusTask] = useState(false);
console.log("selectedLeaveType>>>>>>>>>>>>>>>>>>>",selectedLeaveType);

  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHolidayVisible, setIsHolidayVisible] = useState(false);

  const holidays = [
    {
      id: '1',
      name: 'Republic Day',
      date: 'January 26, 2025',
      type: 'National',
    },
    {
      id: '2',
      name: 'Maha Shivratri',
      date: 'February 26, 2025',
      type: 'Religious',
    },
    { id: '3', name: 'Holi', date: 'March 14, 2025', type: 'Religious' },
    { id: '4', name: 'Good Friday', date: 'April 18, 2025', type: 'Religious' },
    { id: '5', name: 'Ram Navami', date: 'April 6, 2025', type: 'Religious' },
    {
      id: '6',
      name: 'Independence Day',
      date: 'August 15, 2025',
      type: 'National',
    },
    {
      id: '7',
      name: 'Janmashtami',
      date: 'August 16, 2025',
      type: 'Religious',
    },
    {
      id: '8',
      name: 'Gandhi Jayanti',
      date: 'October 2, 2025',
      type: 'National',
    },
    { id: '9', name: 'Dussehra', date: 'October 2, 2025', type: 'Religious' },
    { id: '10', name: 'Diwali', date: 'October 20, 2025', type: 'Religious' },
    {
      id: '11',
      name: 'Guru Nanak Jayanti',
      date: 'November 5, 2025',
      type: 'Religious',
    },
    {
      id: '12',
      name: 'Christmas Day',
      date: 'December 25, 2025',
      type: 'Religious',
    },
  ];
  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => {
          dispatch(leaveTypeRequest());
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  }, [isFocused]);
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerText, styles.nameColumn]}>Holiday Name</Text>
        <Text style={[styles.headerText, styles.dateColumn]}>Date</Text>
      </View>
    </View>
  );

  const renderHolidayItem = ({ item, index }) => (
    <View
      style={[
        styles.itemContainer,
        index % 2 === 0 ? styles.evenRow : styles.oddRow,
      ]}
    >
      <Text style={[styles.itemText, styles.nameColumn, styles.holidayName]}>
        {item.name}
      </Text>
      <Text style={[styles.itemText, styles.dateColumn]}>{item.date}</Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Text style={styles.footerText}>Total holidays: {holidays.length}</Text>
    </View>
  );

  const formatDate = date => {
    return moment(date).format('YYYY-MM-DD');
  };

  const formatDateForDisplay = date => {
    return moment(date).format('DD/MM/YYYY');
  };

  const calculateLeaveDays = () => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // if (leaveType === 'half' && daysDiff === 1) {
    //   return 0.5;
    // }
    return daysDiff;
  };

  const handleStartDateConfirm = selectedDate => {
    console.log(selectedDate);

    setShowStartDatePicker(false);
    setStartDate(selectedDate);
    // If end date is before start date, update end date
    if (selectedDate > endDate) {
      setEndDate(selectedDate);
    }
  };

  const handleEndDateConfirm = selectedDate => {
    setShowEndDatePicker(false);
    // Ensure end date is not before start date
    if (selectedDate >= startDate) {
      setEndDate(selectedDate);
    } else {
      Alert.alert('Invalid Date', 'End date cannot be before start date');
    }
  };

  const handleStartDateCancel = () => {
    setShowStartDatePicker(false);
  };

  const handleEndDateCancel = () => {
    setShowEndDatePicker(false);
  };

  function handleSubmit() {
    // Check if start date is today
    const today = new Date();
    const isStartDateToday = startDate.toDateString() === today.toDateString();

    // Validation checks
     if (selectedLeaveType == null) {
      showErrorAlert('Please Select leave Type.');
    } else if (reason == '') {
      showErrorAlert('Please describe reason for leave.');
    } else {
      const obj = {
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
        leave_gov_type: selectedLeaveType,
        reason: reason,
      };
      connectionrequest()
        .then(() => {
          console.log('applyLeaveRequest:obj>>>>>>>', obj);
          dispatch(applyLeaveRequest(obj));
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  }

  useEffect(() => {
    if (ProfileReducer?.leaveTypeResponse?.length > 0) {
      setLeaveType(ProfileReducer?.leaveTypeResponse);
    }
  }, [ProfileReducer?.leaveTypeResponse]);

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/applyLeaveRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/applyLeaveSuccess':
        status = ProfileReducer.status;
        setStartDate(new Date());
        setEndDate(new Date());
        setSelectedLeaveType(null);
        setReason('');

        break;
      case 'Profile/applyLeaveFailure':
        status = ProfileReducer.status;
        break;
      case 'Profile/leaveTypeRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/leaveTypeSuccess':
        status = ProfileReducer.status;
        setLeaveType(ProfileReducer?.leaveTypeResponse);
        break;
      case 'Profile/leaveTypeFailure':
        status = ProfileReducer.status;
        break;
    }
  }
  return (
    <>
      <Loader
        visible={
          ProfileReducer?.status == 'Profile/leaveTypeRequest' ||
          ProfileReducer?.status == 'Profile/applyLeaveRequest'
        }
      />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          paddingHorizontal: normalize(20),
          paddingTop: normalize(20),
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setIsHolidayVisible(!isHolidayVisible);
          }}
          style={{
            backgroundColor: Colors.white,
            padding: 5,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'flex-end',
            borderRadius: 8,
          }}
        >
          <Image
            style={{ tintColor: Colors.skyblue, height: 30, width: 30 }}
            source={Images.tab2}
          />
        </TouchableOpacity>

        {/* Start Date Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateText}>
              {formatDateForDisplay(startDate)}
            </Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* End Date Section */}
        <View style={styles.section}>
          <Text style={styles.label}>End Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDateForDisplay(endDate)}</Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>
        </View>
        {/* End Date Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Leave Type *</Text>

          <Dropdown
            style={[styles.dropdown, isFocusTask && { borderColor: '#24bcf7' }]}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            containerStyle={styles.dropdownListContainer}
            itemTextStyle={styles.dropdownItemText}
            data={leaveType}
            maxHeight={300}
            labelField="name"
            valueField="id"
            placeholder={!isFocusTask ? 'Select Leave Type' : '...'}
            searchPlaceholder="Search..."
            value={'selectedLeaveType'}
            onFocus={() => setIsFocusTask(true)}
            onBlur={() => setIsFocusTask(false)}
            onChange={item => {
              setSelectedLeaveType(item.name); // or item.name, depending on use
              setIsFocusTask(false);
            }}
            renderLeftIcon={() => <Text style={styles.icon}>🗓️</Text>}
          />
        </View>

        {/* Total Days Display */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Leave Days</Text>
            <Text style={styles.summaryValue}>
              {calculateLeaveDays()}{' '}
              {calculateLeaveDays() === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>

        {/* Reason Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Reason for Leave *</Text>

          <TextInputWithButton
            show={true}
            icon={true}
            height={normalize(45)}
            inputWidth={'100%'}
            textColor={Colors.white}
            placeholder={'Reason'}
            placeholderTextColor={Colors.black}
            paddingLeft={normalize(25)}
            borderColor={Colors.inputGreyBorder}
            borderRadius={normalize(5)}
            editable={true}
            fontFamily={Fonts.MulishRegular}
            isheadertext={true}
            value={reason}
            fontSize={normalize(14)}
            headertxtsize={normalize(13)}
            onChangeText={setReason}
            tintColor={Colors.tintGrey}
            multiline={true}
            maxLength={500}
          />
          <Text style={styles.characterCount}>{reason.length}/500</Text>
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isSubmitting && styles.submitButtonDisabled,
          ]}
          onPress={() => {
            handleSubmit();
          }}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Applying...' : 'Apply Leave'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Date Pickers */}
      <DatePicker
        modal
        open={showStartDatePicker}
        date={startDate}
        mode="date"
        onConfirm={handleStartDateConfirm}
        onCancel={handleStartDateCancel}
        minimumDate={new Date()}
        title="Select Start Date"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <DatePicker
        modal
        open={showEndDatePicker}
        date={endDate}
        mode="date"
        onConfirm={handleEndDateConfirm}
        onCancel={handleEndDateCancel}
        minimumDate={startDate}
        title="Select End Date"
        confirmText="Confirm"
        cancelText="Cancel"
      />

      <Modal
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}
        backdropTransitionOutTiming={0}
        backdropOpacity={0.1}
        hideModalContentWhileAnimating={true}
        isVisible={isHolidayVisible}
        style={{ width: '100%', alignSelf: 'center', margin: 0 }}
        animationInTiming={800}
        animationOutTiming={1000}
        onBackdropPress={() => setIsHolidayVisible(!isHolidayVisible)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -25,
              right: normalize(0),
              zIndex: 99,
            }}
            onPress={() => {
              setIsHolidayVisible(!isHolidayVisible);
            }}
          >
            <Image
              source={Images.cross}
              style={{
                height: normalize(60),
                width: normalize(60),
                zIndex: 99,
              }}
            />
          </TouchableOpacity>
          <Text style={styles.title}>2025 Holiday Calendar</Text>

          <FlatList
            data={holidays}
            keyExtractor={item => item.id}
            renderItem={renderHolidayItem}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            style={styles.flatList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </>
  );
};

export default ApplyLeave;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.bgColor,
  },
  modalContainer: {
    height: normalize(550),
    backgroundColor: '#808080',
    width: '95%',
    alignSelf: 'center',
    borderRadius: 10,
  },
  header: {
    backgroundColor: '#3498db',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: normalize(10),
    paddingTop: 20,
    paddingBottom: normalize(100),
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    elevation: 1,
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  dateIcon: {
    fontSize: 20,
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 10,
    elevation: 1,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#bdc3c7',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#3498db',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#3498db',
  },
  radioText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  warningText: {
    fontSize: 12,
    color: '#e74c3c',
    marginTop: 5,
    fontStyle: 'italic',
  },
  summaryCard: {
    backgroundColor: '#e8f6f3',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#27ae60',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#27ae60',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    color: '#27ae60',
    fontWeight: 'bold',
    marginTop: 2,
  },
  textArea: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
    textAlignVertical: 'top',
    elevation: 1,
  },
  characterCount: {
    fontSize: 12,
    color: '#95a5a6',
    textAlign: 'right',
    marginTop: 5,
  },
  submitButton: {
    backgroundColor: '#27ae60',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  submitButtonDisabled: {
    backgroundColor: '#95a5a6',
    elevation: 1,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomSpace: {
    height: 30,
  },
  titleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginTop: normalize(10),
  },
  flatList: {
    flex: 1,
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  headerContainer: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  evenRow: {
    backgroundColor: '#f8f9fa',
  },
  oddRow: {
    backgroundColor: '#ffffff',
  },
  itemText: {
    fontSize: 14,
    color: '#495057',
  },
  holidayName: {
    fontWeight: '500',
    color: '#212529',
  },
  nameColumn: {
    flex: 2,
  },
  dateColumn: {
    flex: 1.5,
  },
  typeColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  typeBadge: {
    backgroundColor: '#d4edda',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c3e6cb',
  },
  typeBadgeText: {
    color: '#155724',
    fontSize: 12,
    fontWeight: '600',
  },
  footerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6c757d',
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
