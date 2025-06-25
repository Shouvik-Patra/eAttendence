import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import Header from '../../components/Header';
import { Colors, Fonts } from '../../themes/ThemePath';
import showErrorAlert from '../../utils/helpers/Toast';
import TextInputWithButton from '../../components/TextInputWithBotton';
import DatePicker from 'react-native-date-picker';
import normalize from '../../utils/helpers/normalize';

const ApplyLeave = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [leaveType, setLeaveType] = useState('full'); // 'full' or 'half'
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const calculateLeaveDays = () => {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    if (leaveType === 'half' && daysDiff === 1) {
      return 0.5;
    }
    return daysDiff;
  };

  const handleStartDateConfirm = (selectedDate) => {
    setShowStartDatePicker(false);
    setStartDate(selectedDate);
    // If end date is before start date, update end date
    if (selectedDate > endDate) {
      setEndDate(selectedDate);
    }
  };

  const handleEndDateConfirm = (selectedDate) => {
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

  const validateForm = () => {
    if (!startDate || !endDate) {
      showErrorAlert('Error', 'Please select both start and end dates');
      return false;
    }

    if (endDate < startDate) {
      showErrorAlert('Error', 'End date cannot be before start date');
      return false;
    }

    if (!reason.trim()) {
      showErrorAlert('Error', 'Please enter a reason for leave');
      return false;
    }

    if (reason.trim().length < 10) {
      showErrorAlert('Error', 'Please provide a more detailed reason (minimum 10 characters)');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const leaveData = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        leaveType,
        reason: reason.trim(),
        totalDays: calculateLeaveDays(),
        submittedAt: new Date().toISOString(),
      };

      console.log('Leave Application Submitted:', leaveData);

      Alert.alert(
        'Success',
        `Leave application submitted successfully!\n\nDays: ${calculateLeaveDays()}\nType: ${leaveType === 'full' ? 'Full Day' : 'Half Day'}`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setStartDate(new Date());
              setEndDate(new Date());
              setLeaveType('full');
              setReason('');
            }
          }
        ]
      );
    } catch (error) {
      showErrorAlert('Error', 'Failed to submit leave application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' }}>
      <Header
        HeaderLogo
        Title
        placeText={'Apply Leave'}
        onPress_back_button={() => {
          setModalVisible(true);
        }}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom:100,paddingHorizontal:normalize(20),paddingTop:normalize(20)}}>
        {/* Start Date Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Text style={styles.dateText}>{formatDate(startDate)}</Text>
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
            <Text style={styles.dateText}>{formatDate(endDate)}</Text>
            <Text style={styles.dateIcon}>📅</Text>
          </TouchableOpacity>
        </View>

        {/* Leave Type Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Leave Type *</Text>
          <View style={styles.radioContainer}>
            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setLeaveType('full')}
            >
              <View style={[styles.radio, leaveType === 'full' && styles.radioSelected]}>
                {leaveType === 'full' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioText}>Full Day</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.radioOption}
              onPress={() => setLeaveType('half')}
            >
              <View style={[styles.radio, leaveType === 'half' && styles.radioSelected]}>
                {leaveType === 'half' && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.radioText}>Half Day</Text>
            </TouchableOpacity>
          </View>

          {leaveType === 'half' && calculateLeaveDays() > 1 && (
            <Text style={styles.warningText}>
              Half day option is only applicable for single day leave
            </Text>
          )}
        </View>

        {/* Total Days Display */}
        <View style={styles.section}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Leave Days</Text>
            <Text style={styles.summaryValue}>
              {calculateLeaveDays()} {calculateLeaveDays() === 1 ? 'day' : 'days'}
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
            textColor={Colors.textInputColor}
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

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
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
    </View>
  )
}

export default ApplyLeave

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#34495e',
    width: '100%'
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
    paddingBottom:normalize(100)
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
})