import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import Header from '../../components/Header';
import { Colors } from '../../themes/ThemePath';
import AsyncStorage from '@react-native-async-storage/async-storage';
import showErrorAlert from '../../utils/helpers/Toast';

const Home = (props) => {
  const [isClocked, setIsClocked] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const intervalRef = useRef(null);

  // Load saved timer state on component mount
  useEffect(() => {
    loadTimerState();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Start/stop timer based on clock state
  useEffect(() => {
    if (isClocked && startTime) {
      startTimer();
    } else {
      stopTimer();
    }
  }, [isClocked, startTime]);

  const loadTimerState = async () => {
    try {
      const savedState = await AsyncStorage.getItem('timerState');
      if (savedState) {
        const { isClocked: savedIsClocked, startTime: savedStartTime } = JSON.parse(savedState);
        
        if (savedIsClocked && savedStartTime) {
          setIsClocked(true);
          setStartTime(savedStartTime);
          // Calculate elapsed time since the app was closed
          const currentTime = Date.now();
          const elapsed = Math.floor((currentTime - savedStartTime) / 1000);
          setElapsedTime(elapsed);
        }
      }
    } catch (error) {
      console.error('Error loading timer state:', error);
    }
  };

  const saveTimerState = async (clockedState, timeStarted) => {
    try {
      const state = {
        isClocked: clockedState,
        startTime: timeStarted,
      };
      await AsyncStorage.setItem('timerState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  };

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = setInterval(() => {
      const currentTime = Date.now();
      const elapsed = Math.floor((currentTime - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleClockIn = () => {
    const currentTime = Date.now();
    setIsClocked(true);
    setStartTime(currentTime);
    setElapsedTime(0);
    saveTimerState(true, currentTime);
    showErrorAlert('Clocked In', 'Timer started successfully!');
  };

  const handleClockOut = () => {
    setIsClocked(false);
    setStartTime(null);
    stopTimer();
    saveTimerState(false, null);
    
    const finalTime = formatTime(elapsedTime);
    showErrorAlert('Clocked Out', `Total time worked: ${finalTime}`);
    setElapsedTime(0);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  return (
     <View style={{flex:1,backgroundColor:Colors.white,justifyContent:'center',alignItems:'center'}}>
       <Header
        HeaderLogo
        Title
        placeText={'Home'}
        onPress_back_button={() => {
          setModalVisible(true);
        }}
        onPress_right_button={() => {
          props.navigation.navigate('Notification');
        }}
      />
      <View style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.title}>Time Tracker</Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        <Text style={styles.statusText}>
          {isClocked ? 'Currently Clocked In' : 'Not Clocked In'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        {!isClocked ? (
          <TouchableOpacity style={styles.clockInButton} onPress={handleClockIn}>
            <Text style={styles.buttonText}>Clock In</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.clockOutButton} onPress={handleClockOut}>
            <Text style={styles.buttonText}>Clock Out</Text>
          </TouchableOpacity>
        )}
      </View>

      {isClocked && (
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Started: {new Date(startTime).toLocaleTimeString()}
          </Text>
        </View>
      )}
    </View>
     <TouchableOpacity style={{}}>

     </TouchableOpacity>
    </View>
  )
}

export default Home

const styles = StyleSheet.create({

   container: {
    flex: 1,
    backgroundColor: '#34495e',
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%'
  },
  header: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ecf0f1',
    marginBottom: 10,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#e74c3c',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusText: {
    fontSize: 18,
    color: '#bdc3c7',
    textAlign: 'center',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  clockInButton: {
    backgroundColor: '#27ae60',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  clockOutButton: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
  },
})