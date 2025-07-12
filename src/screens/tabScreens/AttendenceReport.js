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
  attendenceReportRequest,
  leaveCancelRequest,
  leaveLogRequest,
} from '../../redux/reducer/ProfileReducer';
import Loader from '../../utils/helpers/Loader';
import { useIsFocused } from '@react-navigation/native';

let status = '';

const AttendenceReport = () => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [attendenceList, setAttendenceList] = useState([]);

  const formatDate = date => {
    return moment(date).format('YYYY-MM-DD');
  };

  const formatCalendarDate = dateString => {
    const date = new Date(dateString);
    const options = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getStatusColor = status => {
    switch (status) {
      case 'present':
        return Colors.lightgreen || '#90EE90'; // lightgreen
      case 'leave':
        return Colors.lightred || '#FFB6C1'; // lightred
      case 'holiday':
        return Colors.lightYellow || '#FFFFE0'; // lightyellow
      default:
        return Colors.white || '#F5F5F5'; // default color
    }
  };

  const prepareCalendarData = () => {
    if (!attendenceList || Object.keys(attendenceList).length === 0) {
      return [];
    }

    const monthKey = Object.keys(attendenceList)[0]; // Get first month key
    const calendarData = attendenceList[monthKey]?.calendar;

    if (!calendarData) {
      return [];
    }

    const sortedDates = Object.keys(calendarData).sort();

    return sortedDates.map(date => ({
      id: date,
      date: date,
      formattedDate: formatCalendarDate(date),
      status: calendarData[date],
      backgroundColor: getStatusColor(calendarData[date]),
    }));
  };

  const renderCalendarItem = ({ item }) => (
    <View style={[styles.tableRow, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.dateColumn}>
        <Text style={styles.dateText}>{item.formattedDate}</Text>
      </View>
      <View style={styles.statusColumn}>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: item.backgroundColor },
          ]}
        >
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderTableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={styles.dateColumn}>
        <Text style={styles.headerText}>Date</Text>
      </View>
      <View style={styles.statusColumn}>
        <Text style={styles.headerText}>Status</Text>
      </View>
    </View>
  );

  const renderLegend = () => (
    <View style={styles.legendContainer}>
      <Text style={styles.legendTitle}>Status Legend</Text>
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: Colors.lightgreen || '#90EE90' },
            ]}
          />
          <Text style={styles.legendText}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: Colors.lightred || '#FFB6C1' },
            ]}
          />
          <Text style={styles.legendText}>Leave</Text>
        </View>
        <View style={styles.legendItem}>
          <View
            style={[
              styles.legendColor,
              { backgroundColor: Colors.lightYellow || '#FFFFE0' },
            ]}
          />
          <Text style={styles.legendText}>Holiday</Text>
        </View>
      </View>
    </View>
  );

  const renderAttendenceReport = ({ item, index }) => (
    <View
      style={[
        styles.itemContainer,
        {
          backgroundColor:
            item?.status === 'pending'
              ? Colors.lightYellow
              : item?.status === 'approved'
              ? Colors.lightgreen
              : Colors.lightred,
        },
      ]}
    >
      <View style={styles.row1}>
        <Text style={styles.lebel}>Leave Status : </Text>
        <Text style={[styles.lebelValue, { textTransform: 'capitalize' }]}>
          {item?.status}
        </Text>
      </View>
      <View style={styles.row1}>
        <Text style={styles.lebel}>Leave Type : </Text>
        <Text style={styles.lebelValue}>{item?.leave_gov_type}</Text>
      </View>
      <View style={styles.row1}>
        <Text style={styles.lebel}>From : </Text>
        <Text style={styles.lebelValue}>{formatDate(item?.start_date)}</Text>
      </View>
      <View style={styles.row1}>
        <Text style={styles.lebel}>To : </Text>
        <Text style={styles.lebelValue}>{formatDate(item?.end_date)}</Text>
      </View>
      <View style={styles.row1}>
        <Text style={styles.lebel}>Applyed on : </Text>
        <Text style={styles.lebelValue}>{formatDate(item?.applied_at)}</Text>
      </View>
      <View style={[styles.row1, { width: '75%', alignItems: 'baseline' }]}>
        <Text style={styles.lebel}>Leave Reason : </Text>
        <Text style={styles.lebelValue}>{item?.reason}</Text>
      </View>
      {item?.status === 'rejected' && (
        <View style={[styles.row1, { width: '75%', alignItems: 'baseline' }]}>
          <Text style={styles.lebel}>Reject Reason : </Text>
          <Text style={styles.lebelValue}>{item?.leaves_status}</Text>
        </View>
      )}
    </View>
  );

  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => {
          dispatch(attendenceReportRequest());
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  }, [isFocused]);

  useEffect(() => {
    if (ProfileReducer?.attendenceReportResponse) {
      setAttendenceList(ProfileReducer?.attendenceReportResponse);
    }
  }, [ProfileReducer?.attendenceReportResponse]);

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/attendenceReportRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/attendenceReportSuccess':
        status = ProfileReducer.status;
        break;
      case 'Profile/attendenceReportFailure':
        status = ProfileReducer.status;
        break;
    }
  }

  const calendarData = prepareCalendarData();

  return (
    <View style={styles.container}>
      <Header
        HeaderLogo
        Title
        placeText={'Attendence Report'}
        onPress_back_button={() => navigation.goBack()}
        // onPress_right_button={() => navigation.navigate('Notification')}
      />
      <Loader
        visible={
          ProfileReducer?.status == 'Profile/leaveCancelRequest' ||
          ProfileReducer?.status == 'Profile/leaveLogRequest'
        }
      />

      {/* Calendar Table */}
      {calendarData.length > 0 && (
        <View style={styles.tableContainer}>
          <Text style={styles.tableTitle}>Monthly Attendance Calendar</Text>
          {renderTableHeader()}
          <FlatList
            data={calendarData}
            keyExtractor={item => item.id}
            renderItem={renderCalendarItem}
            style={styles.calendarFlatList}
            showsVerticalScrollIndicator={false}
          />
          {renderLegend()}
        </View>
      )}

      {/* Original Leave Reports List */}
      <FlatList
        data={attendenceList}
        keyExtractor={item => item.id}
        renderItem={renderAttendenceReport}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No data available</Text>
          </View>
        )}
        style={styles.flatList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default AttendenceReport;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: Colors.bgColor,
    paddingHorizontal: 10,
  },
  flatList: {
    flex: 1,
    width: '100%',
    paddingBottom: normalize(100),
    marginBottom: normalize(100),
  },
  listContainer: {
    width: '100%',
    paddingBottom: normalize(100),
    marginBottom: normalize(100),
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
  itemContainer: {
    borderRadius: normalize(8),
    backgroundColor: Colors.white,
    width: '100%',
    padding: normalize(10),
    marginTop: normalize(10),
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: normalize(5),
  },
  lebel: {
    fontSize: 16,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
  },
  lebelValue: {
    fontSize: 16,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
  },
  // New Calendar Table Styles
  tableContainer: {
    backgroundColor: Colors.white,
    marginVertical: normalize(10),
    borderRadius: normalize(8),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  tableTitle: {
    fontSize: 18,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    textAlign: 'center',
    paddingVertical: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray || '#e9ecef',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: Colors.lightGray || '#f8f9fa',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray || '#e9ecef',
  },
  headerText: {
    fontSize: 14,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calendarFlatList: {
    maxHeight: normalize(300),
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(15),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray || '#e9ecef',
  },
  dateColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  statusColumn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  dateText: {
    fontSize: 14,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
  },
  statusBadge: {
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
    textTransform: 'capitalize',
  },
  legendContainer: {
    padding: normalize(15),
    backgroundColor: Colors.lightGray || '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray || '#e9ecef',
  },
  legendTitle: {
    fontSize: 14,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: normalize(10),
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: normalize(16),
    height: normalize(16),
    borderRadius: normalize(8),
    marginRight: normalize(8),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  legendText: {
    fontSize: 12,
    fontFamily: Fonts.MulishRegular,
    color: Colors.black,
  },

  emptyContainer: {
    padding: 20,marginTop:normalize(80),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontFamily:Fonts.MulishBold,
    color: Colors.white,
  },
});
