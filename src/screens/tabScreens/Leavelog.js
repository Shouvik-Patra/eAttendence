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
let status = '';
const Leavelog = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    const [leaveType, setLeaveType] = useState('full'); // 'full' or 'half'
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isHolidayVisible, setIsHolidayVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const AuthReducer = useSelector(state => state.AuthReducer);
    const ProfileReducer = useSelector(state => state.ProfileReducer);
    const LeavelogList = [
        {
            id: '1',
            name: 'Republic Day',
            from_date: '04-07-2025',
            to_date: '06-07-2025',
            leave_status: 'Approved',
            applied_on: '02-07-2025',
        },
        {
            id: '1',
            name: 'Republic Day',
            from_date: '06-07-2025',
            to_date: '07-07-2025',
            leave_status: 'Cancel',
            applied_on: '02-07-2025',
        },
        {
            id: '1',
            name: 'Republic Day',
            from_date: '06-07-2025',
            to_date: '07-07-2025',
            leave_status: 'Pending',
            applied_on: '02-07-2025',
        },

    ];

    const renderHeader = () => (
        <View style={{ width: '100%' }}>

        </View>
    );

    const renderLeavelog = ({ item, index }) => (
        <View style={styles.itemContainer}>
            <View style={styles.row1}>
                <Text style={styles.lebel}>Leave Status : </Text>
                <Text
                    style={[
                        styles.lebelValue,
                        {
                            color:
                                item?.leave_status === 'Pending'
                                    ? Colors.orange
                                    : item?.leave_status === 'Cancel'
                                        ? Colors.red
                                        : Colors.green,
                            fontFamily: Fonts.MulishBold,
                        },
                    ]}>
                    {item?.leave_status}
                </Text>
            </View>
            <View style={styles.row1}>
                <Text style={styles.lebel}>From : </Text>
                <Text style={styles.lebelValue}>{item?.from_date}</Text>
            </View>
            <View style={styles.row1}>
                <Text style={styles.lebel}>To : </Text>
                <Text style={styles.lebelValue}>{item?.to_date}</Text>
            </View>
            <View style={styles.row1}>
                <Text style={styles.lebel}>Applyed on : </Text>
                <Text style={styles.lebelValue}>{item?.applied_on}</Text>
            </View>
            { item?.leave_status === 'Pending' &&<TouchableOpacity style={{ backgroundColor: Colors.red, position: 'absolute', right: 20, bottom: 20, borderRadius: normalize(8) }}>
                <Text style={[styles.lebelValue, { color: Colors.white, paddingHorizontal: 30, paddingVertical: 10 }]}>Cancel</Text>
            </TouchableOpacity>}
        </View>
    );



    const formatDate = date => {
        return moment(date).format('YYYY-MM-DD');
    };


    function handleSubmit() {
        const obj = {
            start_date: formatDate(startDate),
            end_date: formatDate(endDate),
            reason: reason,
        };
        // const formData = new FormData();

        // formData.append('start_date', formatDate(startDate));

        // formData.append('end_date', formatDate(endDate));

        // formData.append('reason', reason);

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

    if (status == '' || ProfileReducer.status != status) {
        switch (ProfileReducer.status) {
            case 'Profile/applyLeaveRequest':
                status = ProfileReducer.status;
                setLoading(true);
                break;
            case 'Profile/applyLeaveSuccess':
                status = ProfileReducer.status;
                setLoading(false);

                break;
            case 'Profile/applyLeaveFailure':
                status = ProfileReducer.status;
                setLoading(false);

                break;
        }
    }
    return (
        <>
            <Loader visible={loading} />
            <FlatList
                data={LeavelogList}
                keyExtractor={item => item.id}
                renderItem={renderLeavelog}
                ListHeaderComponent={renderHeader}
                style={styles.flatList}
                showsVerticalScrollIndicator={false}
            />


        </>
    );
};

export default Leavelog;

const styles = StyleSheet.create({
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
    itemContainer: { borderRadius: normalize(8), backgroundColor: Colors.white, width: '100%', padding: normalize(10), marginTop: normalize(10) },
    row1: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: normalize(5) },
    lebel: {
        fontSize: 16,
        fontFamily: Fonts.MulishBold,
        color: Colors.black
    },
    lebelValue: {
        fontSize: 16,
        fontFamily: Fonts.MulishSemiBold,
        color: Colors.black
    },
});
