import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Icon components (you can replace these with your preferred icon library)
const CheckIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, { color: '#10b981' }]}>✓</Text>
  </View>
);

const ErrorIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, { color: '#ef4444' }]}>✕</Text>
  </View>
);

const WarningIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, { color: '#f59e0b' }]}>⚠</Text>
  </View>
);

const InfoIcon = () => (
  <View style={styles.iconContainer}>
    <Text style={[styles.iconText, { color: '#3b82f6' }]}>ℹ</Text>
  </View>
);

const CloseIcon = () => (
  <Text style={styles.closeIcon}>×</Text>
);

const ShowAlert = ({
  message,
  type = 'info',
  duration = 4000,
  onClose = () => {},
  position = 'top',
  style = {},
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    // Entry animation
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress animation
    if (duration > 0) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: duration,
        useNativeDriver: false,
      }).start();

      // Auto dismiss
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      onClose();
    });
  };

  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#ecfdf5',
          borderColor: '#10b981',
          shadowColor: '#10b981',
        };
      case 'error':
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444',
          shadowColor: '#ef4444',
        };
      case 'warning':
        return {
          backgroundColor: '#fffbeb',
          borderColor: '#f59e0b',
          shadowColor: '#f59e0b',
        };
      default:
        return {
          backgroundColor: '#eff6ff',
          borderColor: '#3b82f6',
          shadowColor: '#3b82f6',
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getPositionStyles = () => {
    const baseStyles = {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 1000,
    };

    switch (position) {
      case 'top':
        return {
          ...baseStyles,
          top: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 16,
        };
      case 'bottom':
        return {
          ...baseStyles,
          bottom: Platform.OS === 'ios' ? 60 : 16,
        };
      case 'center':
        return {
          ...baseStyles,
          top: screenHeight / 2 - 50,
        };
      default:
        return {
          ...baseStyles,
          top: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 16,
        };
    }
  };

  const getSlideTransform = () => {
    if (position === 'bottom') {
      return {
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [100, 0],
            }),
          },
          { scale: scaleAnim },
        ],
      };
    } else {
      return {
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-100, 0],
            }),
          },
          { scale: scaleAnim },
        ],
      };
    }
  };

  if (!isVisible) return null;

  const alertStyles = getAlertStyles();

  return (
    <Animated.View
      style={[
        getPositionStyles(),
        {
          opacity: opacityAnim,
          ...getSlideTransform(),
        },
        style,
      ]}
    >
      <View
        style={[
          styles.alertContainer,
          {
            backgroundColor: alertStyles.backgroundColor,
            borderColor: alertStyles.borderColor,
            shadowColor: alertStyles.shadowColor,
          },
        ]}
      >
        {/* Progress bar */}
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: alertStyles.borderColor,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['100%', '0%'],
              }),
            },
          ]}
        />

        {/* Content */}
        <View style={styles.contentContainer}>
          <View style={styles.iconWrapper}>
            {getIcon()}
          </View>
          
          <Text style={styles.messageText} numberOfLines={3}>
            {message}
          </Text>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CloseIcon />
          </TouchableOpacity>
        </View>

        {/* Decorative elements */}
        <View style={[styles.decorativeCircle, styles.topRightCircle]} />
        <View style={[styles.decorativeCircle, styles.bottomLeftCircle]} />
      </View>
    </Animated.View>
  );
};

// Demo component
const AlertDemo = () => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = (message, type = 'info', position = 'top') => {
    const id = Date.now();
    const newAlert = {
      id,
      message,
      type,
      position,
    };

    setAlerts(prev => [...prev, newAlert]);
  };

  const removeAlert = id => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <View style={styles.demoContainer}>
      <Text style={styles.demoTitle}>Beautiful Alert Component</Text>
      <Text style={styles.demoSubtitle}>
        Tap the buttons below to see different alert types
      </Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.demoButton, styles.successButton]}
          onPress={() =>
            showAlert('Success! Your action was completed successfully.', 'success')
          }
        >
          <Text style={styles.buttonText}>Show Success Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoButton, styles.errorButton]}
          onPress={() =>
            showAlert('Error! Something went wrong. Please try again.', 'error')
          }
        >
          <Text style={styles.buttonText}>Show Error Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoButton, styles.warningButton]}
          onPress={() =>
            showAlert('Warning! Please review your input before proceeding.', 'warning')
          }
        >
          <Text style={styles.buttonText}>Show Warning Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoButton, styles.infoButton]}
          onPress={() =>
            showAlert("Info: Here's some helpful information for you.", 'info')
          }
        >
          <Text style={styles.buttonText}>Show Info Alert</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoButton, styles.positionButton]}
          onPress={() =>
            showAlert('Bottom positioned alert!', 'success', 'bottom')
          }
        >
          <Text style={styles.buttonText}>Show Bottom Alert</Text>
        </TouchableOpacity>
      </View>

      {/* Render all active alerts */}
      {alerts.map(alert => (
        <ShowAlert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          position={alert.position}
          onClose={() => removeAlert(alert.id)}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  alertContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: 3,
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 19, // Account for progress bar
  },
  iconWrapper: {
    marginRight: 12,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  iconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontWeight: '500',
  },
  closeButton: {
    marginLeft: 8,
    padding: 4,
  },
  closeIcon: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  decorativeCircle: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    opacity: 0.1,
  },
  topRightCircle: {
    top: -10,
    right: -10,
    backgroundColor: '#000',
  },
  bottomLeftCircle: {
    bottom: -10,
    left: -10,
    backgroundColor: '#000',
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  // Demo styles
  demoContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : StatusBar.currentHeight + 20,
  },
  demoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1f2937',
    marginBottom: 8,
  },
  demoSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#6b7280',
    marginBottom: 32,
  },
  buttonContainer: {
    gap: 16,
  },
  demoButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  successButton: {
    backgroundColor: '#10b981',
  },
  errorButton: {
    backgroundColor: '#ef4444',
  },
  warningButton: {
    backgroundColor: '#f59e0b',
  },
  infoButton: {
    backgroundColor: '#3b82f6',
  },
  positionButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AlertDemo;