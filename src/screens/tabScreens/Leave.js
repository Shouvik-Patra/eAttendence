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
import React, { useState } from 'react';
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
import { applyLeaveRequest } from '../../redux/reducer/ProfileReducer';
import Loader from '../../utils/helpers/Loader';
import Leavelog from './Leavelog';
import ApplyLeave from './ApplyLeave';
let status = '';
const Leave = () => {
  const [tabName, setTabName] = useState('LeaveApply');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const ProfileReducer = useSelector(state => state.ProfileReducer);



  // if (status == '' || ProfileReducer.status != status) {
  //   switch (ProfileReducer.status) {
  //     case 'Profile/applyLeaveRequest':
  //       status = ProfileReducer.status;
  //       setLoading(true);
  //       break;
  //     case 'Profile/applyLeaveSuccess':
  //       status = ProfileReducer.status;
  //       setLoading(false);

  //       break;
  //     case 'Profile/applyLeaveFailure':
  //       status = ProfileReducer.status;
  //       setLoading(false);

  //       break;
  //   }
  // }
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#34495e',
      }}
    >
      <Header
        HeaderLogo
        Title
        placeText={'Leave'}
        onPress_back_button={() => {
          setModalVisible(true);
        }}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />
      <Loader visible={loading} />
      <View style={{ width: '100%', flexDirection: 'row' }}>
        <TouchableOpacity style={[styles.tab, { borderBottomWidth: tabName == 'Apply' ? 2 : 0 }]}
          onPress={() => {
            setTabName('Apply')
          }}
        >
          <Text style={{ fontSize: 18, fontFamily: Fonts.MulishBold, color: Colors.white }} >Leave Apply</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, { borderBottomWidth: tabName == 'Log' ? 2 : 0 }]}

          onPress={() => {
            setTabName('Log')
          }}
        >
          <Text style={{ fontSize: 18, fontFamily: Fonts.MulishBold, color: Colors.white }} >Leave Details</Text>
        </TouchableOpacity>
      </View>

      {
        tabName == 'Apply' ? <ApplyLeave /> : <Leavelog />
      }

    </View>
  );
};

export default Leave;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495e',
    width: '100%',
  },
  tab: {
    height: normalize(50),
    backgroundColor: Colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    // borderBottomWidth: 2,
    borderColor: Colors.white,
    width: '50%'
  }

});
