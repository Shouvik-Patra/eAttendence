import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Header from '../../components/Header';
import ApplyLeave from './ApplyLeave';
import Leavelog from './Leavelog';
import { useSelector } from 'react-redux';
import { Colors, Fonts } from '../../themes/ThemePath';
import UpdateModal from '../../components/UpdateModal';
import { useIsFocused } from '@react-navigation/native';
import constants from '../../utils/helpers/constants';

const Tab = createMaterialTopTabNavigator();

const LeaveTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontSize: 16,
          fontFamily: Fonts.MulishBold,
          color: Colors.white,
        },
        tabBarIndicatorStyle: {
          backgroundColor: Colors.white,
          height: 3,
        },
        tabBarStyle: {
          backgroundColor: Colors.orange,
        },
      }}
    >
      <Tab.Screen name="Leave Apply" component={ApplyLeave} />
      <Tab.Screen name="Leave Details" component={Leavelog} />
    </Tab.Navigator>
  );
};

const Leave = ({ navigation }) => {
  const isFocused = useIsFocused();

  const ProfileReducer = useSelector(state => state.ProfileReducer);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
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
  return (
    <View style={styles.container}>
      <Header
        HeaderLogo
        Title
        placeText={'Leave'}
        onPress_back_button={() => navigation.goBack()}
        onPress_right_button={() => navigation.navigate('Notification')}
      />
      <LeaveTabs />
      <UpdateModal
        isVisible={updateModalVisible}
        onClose={() => setUpdateModalVisible(false)}
      />
    </View>
  );
};

export default Leave;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495e',
  },
});
