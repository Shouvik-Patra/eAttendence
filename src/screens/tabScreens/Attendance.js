import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import ViewShot from 'react-native-view-shot';
import ImageCompressor from 'react-native-compressor';
import { Images } from '../../themes/ThemePath';
import normalize from '../../utils/helpers/normalize';
import showErrorAlert from '../../utils/helpers/Toast';
import moment from 'moment';
import connectionrequest from '../../utils/helpers/NetInfo';
import { useDispatch, useSelector } from 'react-redux';
import {
  clockinRequest,
  clockoutRequest,
} from '../../redux/reducer/ProfileReducer';
import Loader from '../../utils/helpers/Loader';
import constants from '../../utils/helpers/constants';

let status = '';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const SQUARE_SIZE = SCREEN_WIDTH * 0.8;
const SQUARE_TOP = (SCREEN_HEIGHT - SQUARE_SIZE) / 2 - 50;

// Design tokens
const COLORS = {
  accent: '#00E5CC',
  accentDim: 'rgba(0, 229, 204, 0.15)',
  accentBorder: 'rgba(0, 229, 204, 0.4)',
  success: '#00C896',
  successDim: 'rgba(0, 200, 150, 0.2)',
  glass: 'rgba(10, 20, 35, 0.72)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
  white: '#FFFFFF',
  whiteFaint: 'rgba(255,255,255,0.08)',
};

const Attendence = props => {
  const dispatch = useDispatch();
  const AuthReducer = useSelector(state => state.AuthReducer);
  const ProfileReducer = useSelector(state => state.ProfileReducer);

  const [cameraPosition, setCameraPosition] = useState('front');
  const device = useCameraDevice(cameraPosition);
  const [flash, setFlash] = useState('off');
  const cameraRef = useRef(null);
  const viewShotRef = useRef(null);

  const currentAddress = props?.route?.params?.currentAddress;
  const latitude = props?.route.params?.latitude;
  const longitude = props?.route.params?.longitude;
  const task_id = props?.route.params?.task_id;
  const location_id = props?.route.params?.location_id;
  const office_id = props?.route.params?.office_id;
  const isInsideOffice = props?.route?.params?.isInsideOffice;
  const attendenceStatus = props?.route?.params?.attendenceStatus;
  const check_out_remarks = props?.route?.params?.check_out_remarks;

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [finalImage, setFinalImage] = useState('');
  const [showFullScreenPreview, setShowFullScreenPreview] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [showOverlay, setShowOverlay] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);

  // Animations
  const checkboxScale = useRef(new Animated.Value(1)).current;
  const submitOpacity = useRef(new Animated.Value(0.4)).current;
  const overlaySlide = useRef(new Animated.Value(60)).current;
  const overlayFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const locationData = {
    address: currentAddress,
    latitude: latitude,
    longitude: longitude,
  };

  useEffect(() => {
    checkPermission();
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 950,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 950,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (showOverlay) {
      Animated.parallel([
        Animated.timing(overlaySlide, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(overlayFade, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      overlaySlide.setValue(60);
      overlayFade.setValue(0);
    }
  }, [showOverlay]);

  useEffect(() => {
    Animated.timing(submitOpacity, {
      toValue: isDeclarationChecked ? 1 : 0.4,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [isDeclarationChecked]);

  const updateDateTime = () => {
    const now = new Date();
    setCurrentDateTime(
      `${now.toLocaleDateString()}  ${now.toLocaleTimeString()}`,
    );
  };

  const checkPermission = async () => {
    await Camera.requestCameraPermission();
    await Camera.requestMicrophonePermission();
  };

  const toggleCameraPosition = () => {
    setCameraPosition(p => (p === 'front' ? 'back' : 'front'));
  };

  const handleCheckboxPress = () => {
    Animated.sequence([
      Animated.timing(checkboxScale, {
        toValue: 0.82,
        duration: 90,
        useNativeDriver: true,
      }),
      Animated.spring(checkboxScale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
    setIsDeclarationChecked(prev => !prev);
  };

  const takePicture = async () => {
    if (cameraRef.current !== null && !isProcessing) {
      setIsProcessing(true);
      try {
        const photo = await cameraRef.current.takePhoto({
          qualityPrioritization: 'quality',
          quality: 0.9,
          flash: flash,
        });
        setPreviewImage(`file://${photo.path}`);
        setIsDeclarationChecked(false);
        setShowFullScreenPreview(true);
        setTimeout(() => {
          setShowOverlay(true);
          setIsProcessing(false);
        }, 1000);
      } catch (error) {
        console.error('Error during image capture:', error);
        setIsProcessing(false);
      }
    }
  };

  function onClockIn(capturedimage) {
    const imageName = capturedimage.split('/').pop();
    const formData = new FormData();
    formData.append('app_version', constants.APP_VERSION);
    formData.append('check_in', moment().format('HH:mm:ss'));
    formData.append('status', attendenceStatus);
    formData.append('check_in_latitude', latitude);
    formData.append('check_in_longitude', longitude);
    formData.append('check_in_address', locationData?.address);
    formData.append('remarks', isInsideOffice);
    formData.append('check_in_photo', {
      uri:
        Platform.OS === 'android'
          ? capturedimage
          : capturedimage.replace('file://', ''),
      name: imageName,
      type: 'image/jpeg',
    });
    connectionrequest()
      .then(() => dispatch(clockinRequest(formData)))
      .catch(() => showErrorAlert('Please connect to internet'));
  }

  function onClockOut(capturedimage) {
    const imageName = capturedimage.split('/').pop();
    const formData = new FormData();
    formData.append('check_out', moment().format('HH:mm:ss'));
    formData.append('check_out_latitude', latitude);
    formData.append('check_out_longitude', longitude);
    formData.append('check_out_address', 'test');
    formData.append('check_out_remarks', check_out_remarks);
    formData.append('check_out_photo', {
      uri:
        Platform.OS === 'android'
          ? capturedimage
          : capturedimage.replace('file://', ''),
      name: imageName,
      type: 'image/jpeg',
    });
    connectionrequest()
      .then(() => dispatch(clockoutRequest(formData)))
      .catch(() => showErrorAlert('Please connect to internet'));
  }


  const handleSubmit = async () => {
    if (!isDeclarationChecked) {
      showErrorAlert('Please confirm the declaration before submitting.');
      return;
    }
    setLoading(true);
    if (viewShotRef.current && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const capturedUri = await viewShotRef.current.capture();
        const finalImagePath = await ImageCompressor.Image.compress(
          capturedUri,
          {
            compressionMethod: 'auto',
            quality: 0.8,
            input: 'uri',
            output: 'jpg',
          },
        );
        setFinalImage(finalImagePath);

        if (props?.route?.params?.pagename == 'MyProfile') {
          props?.navigation.navigate('FormalAttendanceBottomTab', {
            screen: 'MyProfile',
            params: { finalImageUri: finalImagePath, isEditing: true },
          });
          return;
        }
        if (props?.route?.params?.status == 'clockin') {
          onClockIn(finalImagePath);
        } else if (props?.route?.params?.status == 'clockout') {
          onClockOut(finalImagePath);
        }
      } catch (error) {
        console.error('Error processing final image:', error);
        setIsSubmitting(false);
      }
    }
  };

  if (status == '' || ProfileReducer.status != status) {
    switch (ProfileReducer.status) {
      case 'Profile/clockinRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/clockinSuccess':
        status = ProfileReducer.status;
        props?.navigation.navigate('FormalAttendanceBottomTab', {
          screen: 'Home',
          params: { finalImageUri: finalImage },
        });
        break;
      case 'Profile/clockinFailure':
        status = ProfileReducer.status;
        props?.navigation.navigate('FormalAttendanceBottomTab', {
          screen: 'Home',
          params: { finalImageUri: finalImage },
        });
        break;
      case 'Profile/clockoutRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/clockoutSuccess':
        status = ProfileReducer.status;
        props?.navigation.navigate('FormalAttendanceBottomTab', {
          screen: 'Home',
          params: { finalImageUri: finalImage },
        });
        break;
      case 'Profile/clockoutFailure':
        status = ProfileReducer.status;
        showErrorAlert('Clock Out fail due to Network issue, Try again!');
        props?.navigation.navigate('FormalAttendanceBottomTab', {
          screen: 'Home',
          params: { finalImageUri: finalImage },
        });
        break;
      case 'Profile/municipalityRegisterRequest':
        status = ProfileReducer.status;
        break;
      case 'Profile/municipalityRegisterSuccess':
        status = ProfileReducer.status;
        setLoading(false);
        props?.navigation.navigate('FormalAttendanceBottomTab', {
          screen: 'MuRegister',
          params: { finalImageUri: finalImage },
        });
        break;
      case 'Profile/municipalityRegisterFailure':
        status = ProfileReducer.status;
        setLoading(false);
        showErrorAlert('Task add fail due to Network issue, Try again!');
        props?.navigation.navigate('FormalAttendanceBottomTab', {
          screen: 'MuRegister',
          params: { finalImageUri: finalImage },
        });
        break;
    }
  }

  const cancelCapture = () => props?.navigation.goBack();

  const retakePhoto = () => {
    setShowFullScreenPreview(false);
    setPreviewImage('');
    setShowOverlay(false);
    setIsProcessing(false);
    setIsDeclarationChecked(false);
  };

  if (!device)
    return (
      <View style={styles.container}>
        <View style={styles.loadingDot} />
        <Text style={styles.loadingText}>Initializing camera…</Text>
      </View>
    );

  return (
    <View style={styles.fullScreenContainer}>
      <Loader visible={loading} />

      {/* ── LIVE CAMERA ── */}
      {!showFullScreenPreview && (
        <>
          <Camera
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={true}
            photo={true}
            orientation="portrait"
            flash={flash}
            enableZoomGesture
            zoom={1.5}
          />

          <View style={styles.cameraFrameContainer}>
            <View style={styles.overlayTop} />

            <View style={styles.middleSection}>
              <View style={styles.overlaySide} />

              {/* Viewfinder box */}
              <View style={styles.squareFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <View style={styles.scanLine} />
                <View style={styles.instructionPill}>
                  <View style={styles.liveDot} />
                  <Text style={styles.instructionText}>
                    Position face within frame
                  </Text>
                </View>
              </View>

              <View style={styles.overlaySide} />
            </View>

            <View style={styles.overlayBottom}>
              {props?.route?.params?.pagename != 'MyProfile' && (
                <View style={styles.infoCard}>
                  <View style={styles.infoAccentBar} />
                  <Text style={styles.dateTimeText}>{currentDateTime}</Text>
                  {/* <Text style={styles.addressText} numberOfLines={2}>{currentAddress}</Text> */}
                  <View style={styles.coordRow}>
                    <Text style={styles.coordLabel}>LAT </Text>
                    <Text style={styles.coordValue}>
                      {locationData.latitude}
                    </Text>
                    <View style={styles.coordDivider} />
                    <Text style={styles.coordLabel}>LNG </Text>
                    <Text style={styles.coordValue}>
                      {locationData.longitude}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </>
      )}

      {/* ── PREVIEW ── */}
      {showFullScreenPreview && (
        <View style={styles.previewBg}>
          <View style={styles.previewGlow}>
            <ViewShot
              ref={viewShotRef}
              options={{
                format: 'jpg',
                quality: 0.9,
                width: SQUARE_SIZE,
                height: SQUARE_SIZE,
              }}
              style={styles.squarePreview}
            >
              <Image
                source={{ uri: previewImage }}
                style={styles.squarePreviewImage}
                resizeMode="cover"
              />

              {showOverlay && props?.route?.params?.pagename != 'MyProfile' && (
                <View style={styles.previewOverlay}>
                  <Text style={styles.previewDateTime}>{currentDateTime}</Text>
                  {/* <Text style={styles.previewAddress} numberOfLines={2}>{currentAddress}</Text> */}
                  <View style={styles.previewCoordRow}>
                    <Text style={styles.previewCoordLabel}>LAT </Text>
                    <Text style={styles.previewCoordVal}>
                      {locationData.latitude}
                    </Text>
                    <Text style={styles.previewCoordSep}> · </Text>
                    <Text style={styles.previewCoordLabel}>LNG </Text>
                    <Text style={styles.previewCoordVal}>
                      {locationData.longitude}
                    </Text>
                  </View>
                </View>
              )}
            </ViewShot>
          </View>
        </View>
      )}

      {/* ── HEADER ── */}
      <View style={styles.cameraHeader}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={cancelCapture}
          activeOpacity={0.75}
        >
          <Text style={styles.headerBtnIcon}>✕</Text>
        </TouchableOpacity>
        {/* {!showFullScreenPreview && (
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={toggleCameraPosition}
            activeOpacity={0.75}
          >
            <Image style={styles.flipIcon} source={Images.refreshicon} />
          </TouchableOpacity>
        )} */}
      </View>

      {/* ── FOOTER ── */}
      <View style={styles.cameraFooter}>
        {/* Capture */}
        {!showFullScreenPreview && !isProcessing && (
          <Animated.View
            style={[
              styles.capturePulseRing,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
              activeOpacity={0.8}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Processing */}
        {isProcessing && (
          <View style={styles.processingPill}>
            <View style={styles.processingDot} />
            <Text style={styles.processingText}>Processing…</Text>
          </View>
        )}

        {/* Preview controls */}
        {showFullScreenPreview && showOverlay && (
          <Animated.View
            style={[
              styles.controlsCard,
              {
                opacity: overlayFade,
                transform: [{ translateY: overlaySlide }],
                marginBottom: normalize(50),
              },
            ]}
          >
            {/* Declaration */}
            <TouchableOpacity
              style={[
                styles.declarationRow,
                isDeclarationChecked && styles.declarationRowActive,
              ]}
              onPress={handleCheckboxPress}
              activeOpacity={0.85}
            >
              <Animated.View
                style={[
                  styles.checkbox,
                  isDeclarationChecked && styles.checkboxChecked,
                  { transform: [{ scale: checkboxScale }] },
                ]}
              >
                {isDeclarationChecked && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Animated.View>
              <Text style={styles.declarationText}>
                Please ensure that the photo is taken by the employee
                himself/herself. Otherwise, the attendance will not be
                considered valid.
              </Text>
            </TouchableOpacity>

            {/* Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={retakePhoto}
                disabled={isSubmitting}
                activeOpacity={0.75}
              >
                <Text style={styles.retakeBtnText}>↩ Retake</Text>
              </TouchableOpacity>

              <Animated.View style={{ opacity: submitOpacity, flex: 1 }}>
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    !isDeclarationChecked && styles.submitBtnOff,
                  ]}
                  onPress={handleSubmit}
                  disabled={!isDeclarationChecked || isSubmitting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitBtnText}>
                    {isSubmitting ? 'Submitting…' : 'Confirm  ✓'}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
};

export default Attendence;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050D18',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.accent,
  },
  loadingText: {
    color: COLORS.accent,
    fontSize: 14,
    letterSpacing: 1.2,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
  },

  // ── Camera vignette ──
  cameraFrameContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
  overlayTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    maxHeight: SQUARE_TOP,
  },
  middleSection: {
    flexDirection: 'row',
    height: SQUARE_SIZE,
  },
  overlaySide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    paddingTop: 20,
  },

  // ── Viewfinder ──
  squareFrame: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderColor: COLORS.accent,
    borderWidth: 3,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 5,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 5,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 5,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 5,
  },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(0, 229, 204, 0.3)',
  },
  instructionPill: {
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 204, 0.35)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 30,
    gap: 8,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.accent,
  },
  instructionText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  // ── Info card ──
  infoCard: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    width: SCREEN_WIDTH * 0.86,
    overflow: 'hidden',
  },
  infoAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: COLORS.accent,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  dateTimeText: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  addressText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 10,
  },
  coordRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordLabel: {
    color: COLORS.accent,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  coordValue: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    marginRight: 10,
  },
  coordDivider: {
    width: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 10,
  },

  // ── Preview ──
  previewBg: {
    flex: 1,
    backgroundColor: '#060E1B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewGlow: {
    borderRadius: 18,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 28,
    elevation: 20,
  },
  squarePreview: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop:-100
  },
  squarePreviewImage: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(4, 12, 24, 0.85)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 229, 204, 0.2)',
  },
  previewDateTime: {
    color: COLORS.accent,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  previewAddress: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    marginBottom: 5,
  },
  previewCoordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: normalize(5),
  },
  previewCoordLabel: {
    color: COLORS.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  previewCoordVal: { color: 'rgba(255,255,255,0.58)', fontSize: 11, marginRight: 12 },
  previewCoordSep: { color: 'rgba(255,255,255,0.2)', fontSize: 10 },

  // ── Header ──
  cameraHeader: {
    flexDirection: 'row',
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    zIndex: 20,
  },
  headerBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBtnIcon: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
  flipIcon: {
    width: 22,
    height: 22,
    tintColor: COLORS.white,
  },

  // ── Footer ──
  cameraFooter: {
    position: 'absolute',
    bottom: 36,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },

  // Capture button
  capturePulseRing: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    borderColor: 'rgba(0, 229, 204, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(30),
  },
  captureButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInner: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 14,
  },

  // Processing
  processingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 30,
    gap: 10,
  },
  processingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent,
  },
  processingText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // ── Controls card ──
  controlsCard: {
    width: SCREEN_WIDTH * 0.9,
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 14,
  },

  // Declaration
  declarationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.whiteFaint,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  declarationRowActive: {
    borderColor: COLORS.accentBorder,
    backgroundColor: COLORS.accentDim,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 8,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 15,
  },
  declarationText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    lineHeight: 19,
    flex: 1,
  },

  // Buttons
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  retakeBtn: {
    flex: 1,
    backgroundColor: COLORS.whiteFaint,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retakeBtnText: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  submitBtn: {
    backgroundColor: COLORS.success,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 14,
    elevation: 8,
  },
  submitBtnOff: {
    backgroundColor: '#0F3028',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});
