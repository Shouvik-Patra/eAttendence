import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import Header from '../../components/Header';
import { Colors, Fonts, Images } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import showErrorAlert from '../../utils/helpers/Toast';
import { StackActions, useIsFocused } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { logoutRequest } from '../../redux/reducer/AuthReducer';
import {
  InformalProfileDetailsRequest,
  userDetailsRequest,
} from '../../redux/reducer/InformalProfileReducer';
import connectionrequest from '../../utils/helpers/NetInfo';
import Loader from '../../utils/helpers/Loader';
let status = '';
const InformalProfile = props => {
  const dispatch = useDispatch();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const InformalProfileReducer = useSelector(
    state => state.InformalProfileReducer,
  );

  const isFocused = useIsFocused();
  const [profileData, setProfileData] = useState(InformalProfileReducer?.InformalProfileDetailsResponse || '');

  const [loading, setLoading] = useState(false);

  function userProfileDetails() {
    connectionrequest()
      .then(() => {
        dispatch(InformalProfileDetailsRequest());
      })
      .catch(err => {
        showErrorAlert('Please connect to internet');
      });
  }
  useEffect(() => {
    userProfileDetails();
  }, []);
  if (status == '' || InformalProfileReducer.status != status) {
    switch (InformalProfileReducer.status) {
      case 'InformalProfile/InformalProfileDetailsRequest':
        status = InformalProfileReducer.status;
        break;
      case 'InformalProfile/InformalProfileDetailsSuccess':
        status = InformalProfileReducer.status;
        setProfileData(InformalProfileReducer?.InformalProfileDetailsResponse);
        break;
      case 'InformalProfile/InformalProfileDetailsFailure':
        status = InformalProfileReducer.status;

        break;
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.white,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Header
        HeaderLogo
        Title
        placeText={'My InformalProfile'}
        onPress_back_button={() => {
          setModalVisible(true);
        }}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />
      <Loader visible={loading} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Image
            resizeMode="contain"
            style={styles.profileImage}
            source={Images.wb_logo}
          />
          <Text style={styles.headerName}>
            {profileData?.municipality_name} municipality
          </Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.fieldValue}>{profileData?.park_details?.project_code}</Text>
          <Text style={styles.fieldValue}>{profileData?.email}</Text>
          <Text style={styles.fieldValue}>{profileData?.district_name}</Text>
         
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.editButton,
              { marginTop: normalize(10), backgroundColor: Colors.orange },
            ]}
            onPress={() => {
              dispatch(logoutRequest());
            }}
          >
            <Text style={styles.editButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495e',
    width: '100%',
    paddingBottom: normalize(60),
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#34495e',
    width: '100%',
  },
  scrollViewContent: {
    // paddingHorizontal: normalize(10),
    // paddingVertical: normalize(10),
    paddingBottom: normalize(100), // Extra padding at bottom
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
  },
  editImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.white,
    textTransform: 'capitalize',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 10,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginTop: 15,
  },
  nonEditableField: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  input: {
    fontSize: 16,
    color: '#333',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    padding: 20,
  },
  editButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default InformalProfile;
