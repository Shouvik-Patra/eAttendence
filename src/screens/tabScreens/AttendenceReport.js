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
  const [selectedMonth, setSelectedMonth] = useState(
    moment().format('YYYY-MM'),
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // Generate months from January to current month
  const generateMonthOptions = () => {
    const currentYear = moment().year();
    const currentMonth = moment().month(); // 0-11
    const months = [];

    for (let i = 0; i <= currentMonth; i++) {
      const monthData = {
        value: moment().year(currentYear).month(i).format('YYYY-MM'),
        label: moment().year(currentYear).month(i).format('MMMM YYYY'),
      };
      months.push(monthData);
    }

    return months.reverse(); // Show latest month first
  };

  const monthOptions = generateMonthOptions();

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
        return Colors.lightgreen || '#E8F5E8';
      case 'leave':
        return Colors.lightred || '#FFE8E8';
      case 'holiday':
        return Colors.lightYellow || '#FFF8E1';
      default:
        return Colors.white || '#F5F5F5';
    }
  };

  const getStatusBadgeColor = status => {
    switch (status) {
      case 'present':
        return '#4CAF50';
      case 'leave':
        return '#F44336';
      case 'holiday':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const prepareSummaryData = () => {
    if (!attendenceList || Object.keys(attendenceList).length === 0) {
      return null;
    }

    const monthKey = Object.keys(attendenceList)[0];
    return attendenceList[monthKey]?.summary;
  };

  const prepareCalendarData = () => {
    if (!attendenceList || Object.keys(attendenceList).length === 0) {
      return [];
    }

    const monthKey = Object.keys(attendenceList)[0];
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
      badgeColor: getStatusBadgeColor(calendarData[date]),
    }));
  };

  const renderSummaryCard = (title, value, icon, color) => (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <View style={styles.summaryCardContent}>
        <Text style={styles.summaryCardTitle}>{title}</Text>
        <Text style={[styles.summaryCardValue, { color }]}>{value}</Text>
      </View>
      <View style={[styles.summaryIcon, { backgroundColor: color + '20' }]}>
        <Text style={[styles.summaryIconText, { color }]}>{icon}</Text>
      </View>
    </View>
  );

  const renderSummarySection = () => {
    const summary = prepareSummaryData();
    if (!summary) return null;

    return (
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryTitle}>Monthly Summary</Text>
        <View style={styles.summaryGrid}>
          {renderSummaryCard(
            'Present Days',
            summary.total_present_days,
            '✓',
            '#4CAF50',
          )}
          {renderSummaryCard(
            'Leave Days',
            summary.total_leave_days,
            '✗',
            '#F44336',
          )}
          {renderSummaryCard(
            'Absent Days',
            summary.total_absent_days,
            '○',
            '#FF9800',
          )}
          {renderSummaryCard(
            'Working Hours',
            `${summary.total_working_hours}h`,
            '⏱',
            '#2196F3',
          )}
        </View>
        {/* <View style={styles.workingHoursContainer}>
          <Text style={styles.workingHoursText}>
             Working Hours: {summary.expected_working_hours}h
          </Text>
        </View> */}
      </View>
    );
  };

  const renderMonthSelector = () => (
    <View style={styles.monthSelectorContainer}>
      <TouchableOpacity
        style={styles.monthSelectorButton}
        onPress={() => setShowMonthPicker(true)}
      >
        <Text style={styles.monthSelectorText}>
          {moment(selectedMonth).format('MMMM YYYY')}
        </Text>
        <Text style={styles.monthSelectorArrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMonthPicker = () => (
    <Modal
      isVisible={showMonthPicker}
      onBackdropPress={() => setShowMonthPicker(false)}
      style={styles.modalContainer}
    >
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Select Month</Text>
        <FlatList
          data={monthOptions}
          keyExtractor={item => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.monthOption,
                selectedMonth === item.value && styles.selectedMonthOption,
              ]}
              onPress={() => {
                setSelectedMonth(item.value);
                setShowMonthPicker(false);
              }}
            >
              <Text
                style={[
                  styles.monthOptionText,
                  selectedMonth === item.value &&
                    styles.selectedMonthOptionText,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={styles.modalCloseButton}
          onPress={() => setShowMonthPicker(false)}
        >
          <Text style={styles.modalCloseButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  const renderCalendarItem = ({ item }) => (
    <View style={[styles.tableRow, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.dateColumn}>
        <Text style={styles.dateText}>{item.formattedDate}</Text>
      </View>
      <View style={styles.statusColumn}>
        <View
          style={[styles.statusBadge, { backgroundColor: item.badgeColor }]}
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
          <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
          <Text style={styles.legendText}>Present</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
          <Text style={styles.legendText}>Leave</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FF9800' }]} />
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
          dispatch(attendenceReportRequest({ month: selectedMonth }));
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  }, [isFocused, selectedMonth]);

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

  const hasData = calendarData.length > 0 || prepareSummaryData() !== null;

  return (
    <View style={styles.container}>
      <Header
        HeaderLogo
        Title
        placeText={'Attendance Report'}
        onPress_back_button={() => navigation.goBack()}
      />
      <Loader
        visible={
          ProfileReducer?.status == 'Profile/leaveCancelRequest' ||
          ProfileReducer?.status == 'Profile/leaveLogRequest'
        }
      />

      {/* Month Selector at top-right */}
      <View style={styles.topRightContainer}>{renderMonthSelector()}</View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {hasData ? (
          <>
            {/* Summary Section */}
            {renderSummarySection()}

            {/* Calendar Section */}
            <View style={styles.tableContainer}>
              <View style={styles.tableTopSection}>
                <Text style={styles.tableTitle}>
                  Monthly Attendance
                </Text>
              </View>
              {calendarData.length > 0 ? (
                <>
                  {renderTableHeader()}
                  <FlatList
                    data={calendarData}
                    keyExtractor={item => item.id}
                    renderItem={renderCalendarItem}
                    style={styles.calendarFlatList}
                    showsVerticalScrollIndicator={false}
                  />
                  {renderLegend()}
                </>
              ) : (
                <View style={styles.noDataContainer}>
                  <Text style={styles.noDataText}>
                    No attendance data available for this month
                  </Text>
                </View>
              )}
            </View>

            {/* Original Leave Reports List */}
            <FlatList
              data={attendenceList}
              keyExtractor={item => item.id}
              renderItem={renderAttendenceReport}
              ListEmptyComponent={() => (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No leave data available</Text>
                </View>
              )}
              style={styles.flatList}
              showsVerticalScrollIndicator={false}
            />
          </>
        ) : (
          <View style={styles.noDataMainContainer}>
            <Text style={styles.noDataMainText}>
              No data available for selected month
            </Text>
            <Text style={styles.noDataSubText}>
              Please select a different month or check back later
            </Text>
          </View>
        )}
      </ScrollView>

      {renderMonthPicker()}
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
  scrollView: {
    flex: 1,
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

  // Summary Section Styles
  summaryContainer: {
    backgroundColor: Colors.white,
    marginVertical: normalize(10),
    borderRadius: normalize(12),
    padding: normalize(16),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: normalize(16),
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: Colors.white,
    borderRadius: normalize(8),
    padding: normalize(12),
    marginBottom: normalize(12),
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryCardContent: {
    flex: 1,
  },
  summaryCardTitle: {
    fontSize: 12,
    fontFamily: Fonts.MulishRegular,
    color: Colors.black,
    marginBottom: normalize(4),
  },
  summaryCardValue: {
    fontSize: 18,
    fontFamily: Fonts.MulishBold,
  },
  summaryIcon: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconText: {
    fontSize: 16,
    fontFamily: Fonts.MulishBold,
  },
  workingHoursContainer: {
    backgroundColor: '#f8f9fa',
    padding: normalize(12),
    borderRadius: normalize(8),
    marginTop: normalize(8),
  },
  workingHoursText: {
    fontSize: 14,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
    textAlign: 'center',
  },

  // Top Right Container
  topRightContainer: {
    marginTop: normalize(10),
  },

  // Month Selector Styles
  monthSelectorContainer: {
    alignItems: 'flex-end',
  },
  monthSelectorTitle: {
    fontSize: 12,
    fontFamily: Fonts.MulishRegular,
    color: Colors.black,
    marginBottom: normalize(4),
  },
  monthSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    borderRadius: normalize(6),
    borderWidth: 1,
    borderColor: Colors.lightGray || '#e9ecef',
    minWidth: normalize(120),
  },
  monthSelectorText: {
    fontSize: 12,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
    flex: 1,
  },
  monthSelectorArrow: {
    fontSize: 10,
    color: Colors.black,
    marginLeft: normalize(4),
  },

  // Modal Styles
  modalContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderRadius: normalize(12),
    padding: normalize(20),
    width: '90%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    textAlign: 'center',
    marginBottom: normalize(16),
  },
  monthOption: {
    paddingVertical: normalize(12),
    paddingHorizontal: normalize(16),
    borderRadius: normalize(8),
    marginBottom: normalize(8),
  },
  selectedMonthOption: {
    backgroundColor: Colors.lightBlue || '#e3f2fd',
  },
  monthOptionText: {
    fontSize: 16,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
  },
  selectedMonthOptionText: {
    color: Colors.blue || '#2196F3',
  },
  modalCloseButton: {
    backgroundColor: Colors.blue || '#2196F3',
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
    marginTop: normalize(16),
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontFamily: Fonts.MulishBold,
    color: Colors.white,
    textAlign: 'center',
  },

  // Calendar Table Styles
  tableContainer: {
    backgroundColor: Colors.white,
    marginVertical: normalize(10),
    borderRadius: normalize(12),
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  // Table Top Section (Updated)
  tableTopSection: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray || '#e9ecef',
  },
  tableTitle: {
    fontSize: 18,
    fontFamily: Fonts.MulishBold,
    color: Colors.black,
    flex: 1,
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
    borderColor: 'rgba(255,255,255,0.3)',
  },
  statusText: {
    fontSize: 12,
    fontFamily: Fonts.MulishBold,
    color: Colors.white,
    textTransform: 'capitalize',
  },
  legendContainer: {
    padding: normalize(15),
    backgroundColor: Colors.lightGray || '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray || '#e9ecef',
    borderBottomLeftRadius: normalize(12),
    borderBottomRightRadius: normalize(12),
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
    borderColor: 'rgba(255,255,255,0.3)',
  },
  legendText: {
    fontSize: 12,
    fontFamily: Fonts.MulishRegular,
    color: Colors.black,
  },

  emptyContainer: {
    padding: 20,
    marginTop: normalize(80),
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontFamily: Fonts.MulishBold,
    color: Colors.white,
  },

  noDataContainer: {
    fontSize: 16,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
    textAlign:'center'
  },
  noDataText:{
  textAlign:'center',
    fontSize: 16,
    fontFamily: Fonts.MulishRegular,
    color: Colors.black,
  },

  noDataMainContainer:{
   backgroundColor:Colors.white,
   borderRadius:8,
   marginTop:80,
   padding:15,
   alignItems:'center'
  },
noDataMainText:{
    fontSize: 16,
    fontFamily: Fonts.MulishSemiBold,
    color: Colors.black,
    textAlign:'center'
  },
noDataSubText:{
  textAlign:'center',
    fontSize: 16,
    fontFamily: Fonts.MulishRegular,
    color: Colors.black,
  },
});
