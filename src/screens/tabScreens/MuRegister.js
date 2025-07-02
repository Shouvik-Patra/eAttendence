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
    complitedTaskListRequest,
    municipalityRegisterListRequest,
    taskListRequest,
    userDetailsRequest,
} from '../../redux/reducer/ProfileReducer';
import connectionrequest from '../../utils/helpers/NetInfo';
import Loader from '../../utils/helpers/Loader';
import { LocationGeocoder } from '../../components/LocationGeocoder';
let status = '';
const ActiveTask = props => {
    const dispatch = useDispatch();
    const AuthReducer = useSelector(state => state.AuthReducer);
    const ProfileReducer = useSelector(state => state.ProfileReducer);

    const isFocused = useIsFocused();
    const [isClocked, setIsClocked] = useState(false);
    const [capturedImageWithGeotag, setCapturedImageWithGeotag] = useState(null);
    const [addTaskModal, setAddTaskModal] = useState(false);
    const [TaskList, setTaskList] = useState([
        { label: 'Office No. 1', value: '1' },
        { label: 'Office No. 2', value: '2' },
        { label: 'Office No. 3', value: '3' },
        { label: 'Office No. 4', value: '4' },
        { label: 'Office No. 5', value: '5' },
        { label: 'Office No. 6', value: '6' },
        { label: 'Office No. 7', value: '7' },
        { label: 'Office No. 8', value: '8' },
    ]);
    const [complitedTaskData, setComplitedTaskData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFocusTask, setIsFocusTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState('');
    console.log("selectedTask>>>>>", selectedTask);

    const [location, setLocation] = useState({ latitude: null, longitude: null });
    // Listen for the returned image from Attendance page
    useEffect(() => {
        if (props?.route?.params?.finalImageUri) {
            setCapturedImageWithGeotag(props.route.params.finalImageUri);
            // Clear the parameter to avoid re-triggering
            props?.navigation.setParams({ finalImageUri: undefined });
        }
    }, [props?.route?.params?.finalImageUri]);
    const handleTaskSelect = async item => {
        setSelectedTask(item.value);
        await AsyncStorage.setItem('language', item.value);
        setIsFocusTask(false);
    };
    useEffect(() => {
        connectionrequest()
            .then(() => {
                dispatch(userDetailsRequest());
                dispatch(municipalityRegisterListRequest());
            })
            .catch(err => {
                console.log(err);
                showErrorAlert('Please connect to internet');
            });
    }, [isFocused]);
    const getLocation = async () => {
        setAddTaskModal(!addTaskModal);
        setLoading(true);
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                handleClickPhoto(latitude, longitude);
            },
            error => {
                setLoading(false);
                console.log('Error getting location', error);
            },
            { enableHighAccuracy: false, timeout: 15000, maximumAge: 10000 },
        );
    };
    const handleClickPhoto = async (lat, long) => {
        const result = await LocationGeocoder(lat, long);
        const actualAddress = result?.address || 'Unknown Address';
        setLoading(false);
        props?.navigation.navigate('Attendence', {
            currentAddress: actualAddress,
            latitude: lat,
            longitude: long,
            pagename: 'MuRegister',
            status: 'MuRegister',
            task_id: selectedTask,
        });
    };

    const renderTaskList = ({ item, index }) => (
        <View style={styles.userInfoContainer}>
            <View style={styles.userTextContainer}>
                <Text style={styles.blackText}>
                    Office No :{' '}
                    <Text
                        style={[
                            styles.redText,
                            { color: isClocked ? Colors.green : Colors.red },
                        ]}
                    >
                        {item?.office_no}
                    </Text>
                </Text>
                <Text style={styles.userAddress}>{item?.address}</Text>
                <Text style={styles.blackText}>
                    latitude :{' '}
                    <Text
                        style={[
                            styles.redText,
                            { color: isClocked ? Colors.green : Colors.red },
                        ]}
                    >
                        {item?.latitude}
                    </Text>
                </Text>
                <Text style={styles.blackText}>
                    longitude :{' '}
                    <Text
                        style={[
                            styles.redText,
                            { color: isClocked ? Colors.green : Colors.red },
                        ]}
                    >
                        {item?.longitude}
                    </Text>
                </Text>
                <Text style={styles.blackText}>
                    Created at :{' '}
                    <Text
                        style={[
                            styles.redText,
                            { color: isClocked ? Colors.green : Colors.red },
                        ]}
                    >
                        {/* {moment. item?.created_at} */}
                        {moment(item?.created_at)
                            .local()
                            .format('ddd, MMM D, YYYY • h:mm A')}
                    </Text>
                </Text>
            </View>
            <View style={styles.imageContainer}>
                {item?.photo ? (
                    <Image
                        resizeMode="cover"
                        style={styles.userImagePlaceholder}
                        source={{ uri: item?.photo }}
                    />
                ) : (
                    <Image
                        resizeMode="contain"
                        style={styles.userImagePlaceholder}
                        source={Images.profilepic}
                    />
                )}
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
                if (
                    ProfileReducer?.userDetailsResponse?.attendance_status_text ==
                    'Clocked Out'
                ) {
                    Alert.alert('You are not allowed to add task', 'You Clocked Out');
                } else if (
                    ProfileReducer?.userDetailsResponse?.attendance_status_text ==
                    'Not Marked'
                ) {
                    Alert.alert(
                        'You are not allowed to add task',
                        'Please Clock In first',
                    );
                } else {
                    setAddTaskModal(!addTaskModal);
                }
            }}
        >
            <Image
                resizeMode="contain"
                style={{ height: 50, width: 50 }}
                source={
                    ProfileReducer?.userDetailsResponse?.attendance_status_text ==
                        'Clocked In'
                        ? Images.addTask
                        : Images.lock
                }
            />
            <Text style={styles.newTask}>Add New visit</Text>
        </TouchableOpacity>
    );

    if (status == '' || ProfileReducer.status != status) {
        switch (ProfileReducer.status) {


            case 'Profile/municipalityRegisterListRequest':
                status = ProfileReducer.status;
                setLoading(true);
                break;
            case 'Profile/municipalityRegisterListSuccess':
                status = ProfileReducer.status;
                setLoading(false);
                setComplitedTaskData(ProfileReducer?.municipalityRegisterListResponse);
                break;
            case 'Profile/municipalityRegisterListFailure':
                status = ProfileReducer.status;
                showErrorAlert('Something went wrong! ')

                setLoading(false);
                break;

            case 'Profile/municipalityRegisterRequest':
                status = ProfileReducer.status;
                setLoading(true);
                break;
            case 'Profile/municipalityRegisterSuccess':
                status = ProfileReducer.status;
                setLoading(false);
                break;
            case 'Profile/municipalityRegisterFailure':
                status = ProfileReducer.status;
                showErrorAlert('Task add fail due to Network issue, Try again!')
                setLoading(false);
                break;
        }
    }

    return (
        <View style={styles.mainContainer}>
            <Header
                HeaderLogo
                Title
                placeText={'Field Visit'}
                onPress_back_button={() => { }}
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
                <FlatList
                    data={
                        ProfileReducer?.municipalityRegisterListResponse
                            ? ProfileReducer?.municipalityRegisterListResponse
                            : []
                    }
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
                onBackdropPress={() => setAddTaskModal(!addTaskModal)}
            >
                <ImageBackground
                    resizeMode="stretch"
                    source={Images.pageBackground}
                    style={styles.modalContainer}
                >
                    <TouchableOpacity
                        style={styles.close}
                        onPress={() => {
                            setAddTaskModal(!addTaskModal);
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
                                marginTop: -50
                            }}
                            source={Images.wb_logo}
                        />
                        <Text style={styles.instructionLebel}>
                            *Instruction:
                        </Text>
                        <Text style={styles.instructionText}>
                            While taking the photo, make sure you are standing at a central location inside the municipality office.</Text>

                        <Text style={styles.instructionLebel}>
                            *নির্দেশিকা:

                        </Text>
                        <Text style={styles.instructionText}>
                            ছবি তোলার সময় খেয়াল রাখবেন যেন আপনি মিউনিসিপ্যালিটি অফিসের ভিতরে কোনো কেন্দ্রস্থলে দাঁড়িয়ে ছবি তোলেন।
                        </Text>

                        <Text
                            style={{
                                textAlign: 'center',
                                fontFamily: Fonts.MulishExtraBold,
                                fontSize: 24,
                                color: Colors.white,
                                marginBottom: normalize(15),
                                marginTop: normalize(20)
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
                            Select office
                        </Text>
                        <View style={styles.dropdownContainer}>
                            <Dropdown
                                style={[
                                    styles.dropdown,
                                    isFocusTask && { borderColor: '#24bcf7' },
                                ]}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                iconStyle={styles.iconStyle}
                                containerStyle={styles.dropdownListContainer}
                                itemTextStyle={styles.dropdownItemText}
                                data={TaskList}
                                maxHeight={300}
                                labelField="label" // Display the title
                                valueField="value" // Use the ID as value
                                placeholder={!isFocusTask ? 'Select field' : '...'}
                                searchPlaceholder="Search..."
                                value={selectedTask} // This will be the ID
                                onFocus={() => setIsFocusTask(true)}
                                onBlur={() => setIsFocusTask(false)}
                                onChange={handleTaskSelect}
                                renderLeftIcon={() => <Text style={styles.icon}>📋</Text>}
                            />
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        padding: normalize(10),
        backgroundColor: Colors.white,
        borderRadius: normalize(8),
        marginBottom: normalize(10),
    },
    userTextContainer: {
        width: '60%',
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
        fontFamily: Fonts.MulishSemiBold,
        fontSize: 16,
        fontWeight: '700',
        marginTop: 5,
        color: Colors.red,
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
    instructionLebel: {
        fontFamily: Fonts.MulishBold,
        fontSize: 22,
        marginTop: normalize(5),
        color: Colors.white,
    },
    instructionText: {
        fontFamily: Fonts.MulishRegular,
        fontSize: 18,
        marginTop: normalize(5),
        color: Colors.white,
    },
});
