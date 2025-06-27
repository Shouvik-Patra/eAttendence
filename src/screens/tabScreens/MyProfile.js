import React, { useState } from 'react';
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
import { Colors, Images } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import showErrorAlert from '../../utils/helpers/Toast';
import { StackActions } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({
    profilePicture: Images.profilepic,
    name: 'Shouvik Patra',
    dob: '1995-11-11',
    doj: '2020-03-01',
    address: 'Uttar Rajyadharpur, Hooghly',
    phoneNumber: '8961700942',
  });

  const [editedProfile, setEditedProfile] = useState({ ...profile });

  const handleEdit = () => {
    setEditedProfile({ ...profile });
    setIsEditing(true);
  };
  const handleLogout = async () => {
      const token = await AsyncStorage.getItem('token');
console.log(token);

    // await AsyncStorage.clear();
    props.navigation.navigate('Signin');
  };

  const handleSave = () => {
    setProfile({ ...editedProfile });
    setIsEditing(false);
    showErrorAlert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditedProfile({ ...profile });
    setIsEditing(false);
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel || response.error) {
        return;
      }

      if (response.assets && response.assets[0]) {
        setEditedProfile({
          ...editedProfile,
          profilePicture: response.assets[0].uri,
        });
      }
    });
  };

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const ProfileField = ({
    label,
    value,
    editable = true,
    multiline = false,
    onChangeText,
  }) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {isEditing && editable ? (
        <TextInput
          style={[styles.input, multiline && styles.multilineInput]}
          value={value}
          onChangeText={onChangeText}
          multiline={multiline}
          numberOfLines={multiline ? 3 : 1}
        />
      ) : (
        <Text style={[styles.fieldValue, !editable && styles.nonEditableField]}>
          {label.includes('Date') ? formatDate(value) : value}
        </Text>
      )}
    </View>
  );

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
        placeText={'My Profile'}
        onPress_back_button={() => {
          setModalVisible(true);
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
        <View style={styles.header}>
          <TouchableOpacity
            onPress={isEditing ? selectImage : null}
            style={styles.profileImageContainer}
            disabled={!isEditing}
          >
            <Image
              source={editedProfile.profilePicture}
              style={styles.profileImage}
            />
            {isEditing && (
              <View style={styles.editImageOverlay}>
                <Text style={styles.editImageText}>Tap to change</Text>
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.headerName}>
            {isEditing ? editedProfile.name : profile.name}
          </Text>
        </View>

        <View style={styles.content}>
          <ProfileField
            label="Full Name"
            value={isEditing ? editedProfile.name : profile.name}
            onChangeText={text =>
              setEditedProfile({ ...editedProfile, name: text })
            }
          />

          <ProfileField
            label="Date of Birth"
            value={isEditing ? editedProfile.dob : profile.dob}
            onChangeText={text =>
              setEditedProfile({ ...editedProfile, dob: text })
            }
          />

          <ProfileField
            label="Date of Joining"
            value={isEditing ? editedProfile.doj : profile.doj}
            onChangeText={text =>
              setEditedProfile({ ...editedProfile, doj: text })
            }
          />

          <ProfileField
            label="Address"
            value={isEditing ? editedProfile.address : profile.address}
            multiline={true}
            onChangeText={text =>
              setEditedProfile({ ...editedProfile, address: text })
            }
          />

          <ProfileField
            label="Phone Number"
            value={profile.phoneNumber}
            editable={false}
          />
        </View>

        <View style={styles.buttonContainer}>
          {isEditing ? (
            <View style={styles.editButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.editButton,
                  { marginTop: normalize(10), backgroundColor: Colors.orange },
                ]}
                onPress={handleLogout}
              >
                <Text style={styles.editButtonText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}
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
    // backgroundColor: '#fff',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4CAF50',
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

export default ProfilePage;
