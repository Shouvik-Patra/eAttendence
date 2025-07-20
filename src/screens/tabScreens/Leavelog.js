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
  leaveCancelRequest,
  leaveLogRequest,
} from '../../redux/reducer/ProfileReducer';
import Loader from '../../utils/helpers/Loader';
import { useIsFocused } from '@react-navigation/native';
let status = '';
const Leavelog = () => {
  const dispatch = useDispatch();
  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const isFocused = useIsFocused();
  const [loading, setLoading] = useState(false);
  const [LeavelogList, setLeavelogList] = useState([]);
  const formatDate = date => {
    return moment(date).format('YYYY-MM-DD');
  };

  function handleCancel(id) {
    connectionrequest()
      .then(() => {
        dispatch(leaveCancelRequest(id));
      })
      .catch(err => {
        console.log(err);
        showErrorAlert('Please connect to internet');
      });
  }
  const renderLeavelog = ({ item, index }) => (
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
      {item?.status === 'pending' && (
        <TouchableOpacity
          onPress={() => {
            Alert.alert('Are you sure', 'You want to cancel ?', [
              {
                text: 'Cancel',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
              },
              {
                text: 'OK',
                onPress: () => {
                  handleCancel(item?.id);
                },
              },
            ]);
          }}
          style={{
            backgroundColor: Colors.red,
            position: 'absolute',
            right: 20,
            top: 15,
            borderRadius: normalize(8),
          }}
        >
          <Text
            style={[
              styles.lebelValue,
              {
                color: Colors.white,
                paddingHorizontal: 30,
                paddingVertical: 10,
              },
            ]}
          >
            Cancel
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  useEffect(() => {
    if (isFocused) {
      connectionrequest()
        .then(() => {
          dispatch(leaveLogRequest());
        })
        .catch(err => {
          console.log(err);
          showErrorAlert('Please connect to internet');
        });
    }
  }, [isFocused]);

  useEffect(() => {
    if (ProfileReducer?.leaveLogResponse?.length > 0) {
      setLeavelogList(ProfileReducer?.leaveLogResponse);
    }
  }, [ProfileReducer?.leaveLogResponse]);

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/leaveLogRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/leaveLogSuccess':
        status = ProfileReducer.status;
        console.log('Kick===========>>leaveLogSuccess');
        
        break;
      case 'Profile/leaveLogFailure':
        status = ProfileReducer.status;
        break;
      case 'Profile/leaveCancelRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/leaveCancelSuccess':
        status = ProfileReducer.status;
        console.log('Kick===========>>leaveCancelSuccess');

        connectionrequest()
          .then(() => {
            dispatch(leaveLogRequest());
          })
          .catch(err => {
            console.log(err);
            showErrorAlert('Please connect to internet');
          });
        break;
      case 'Profile/leaveCancelFailure':
        status = ProfileReducer.status;
        break;
    }
  }
  return (
    <View style={styles.container}>
      <Loader
        visible={
          ProfileReducer?.status == 'Profile/leaveCancelRequest' ||
          ProfileReducer?.status == 'Profile/leaveLogRequest'
        }
      />
      <FlatList
        data={LeavelogList}
        keyExtractor={item => item.id}
        renderItem={renderLeavelog}
        style={styles.flatList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default Leavelog;

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
});
