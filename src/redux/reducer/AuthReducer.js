import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  status: '',
  isLoading: true,
  getTokenResponse: {},
  error: {},
  logoutResponse: {},
  sortCodeVerifyResponse: {},
  signInResponse: {},
  otpVerifyResponse: {},
  otpSuccessResponse: {},
  cmsDetailsResponse: {},
  saveSocketResponse: {},
  languageResponse: {},
  localizationData: {},
};

const AuthSlice = createSlice({
  name: 'Auth',
  initialState,
  reducers: {
    //TOKEN
    getTokenRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    getTokenSuccess(state, action) {
      state.isLoading = false;
      state.getTokenResponse = action.payload;
      state.status = action.type;
    },
    getTokenFailure(state, action) {
      state.isLoading = false;
      state.error = action.error;
      state.status = action.type;
    },

    //logout
    logoutRequest(state, action) {
      state.status = action.type;
    },
    logoutSuccess(state, action) {
      state.logoutResponse = action.payload;
      state.status = action.type;
    },
    logoutFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    //VERIFY SORT CODE
    sortCodeVerifyRequest(state, action) {
      state.status = action.type;
    },
    sortCodeVerifySuccess(state, action) {
      state.sortCodeVerifyResponse = action.payload;
      state.status = action.type;
    },
    sortCodeVerifyFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    //SIGN IN
    signInRequest(state, action) {
      state.status = action.type;
    },
    signInSuccess(state, action) {
      state.signInResponse = action.payload;
      state.status = action.type;
    },
    signInFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    //VERIFY OTP
    otpVerifyRequest(state, action) {
      state.status = action.type;
    },
    otpVerifySuccess(state, action) {
      state.otpVerifyResponse = action.payload;
      state.status = action.type;
    },
    otpVerifyFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    //OTP SUCCESS
    otpSuccessRequest(state, action) {
      state.status = action.type;
    },
    otpSuccessSuccess(state, action) {
      state.otpSuccessResponse = action.payload;
      state.status = action.type;
    },
    otpSuccessFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    //OTP SUCCESS
    cmsDetailsRequest(state, action) {
      state.status = action.type;
    },
    cmsDetailsSuccess(state, action) {
      state.cmsDetailsResponse = action.payload;
      state.status = action.type;
    },
    cmsDetailsFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    //socket
    saveSocketRequest(state, action) {
      state.status = action.type;
    },
    saveSocketSuccess(state, action) {
      state.saveSocketResponse = action?.payload;
      state.status = action.type;
    },
    saveSocketFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    //LANGUAGE
    languageRequest(state, action) {
      state.status = action.type;
    },
    languageSuccess(state, action) {
      state.languageResponse = action.payload;
      state.status = action.type;
    },
    languageFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },


    setLocalizationReq(state, action) {
      state.status = action.type;
    },
    setLocalizationSucccess(state, action) {
      state.localizationData = action.payload;
      state.status = action.type;
    },
  },
});

export const {
  logoutRequest,
  logoutSuccess,
  logoutFailure,

  getTokenRequest,
  getTokenSuccess,
  getTokenFailure,

  sortCodeVerifyRequest,
  sortCodeVerifySuccess,
  sortCodeVerifyFailure,

  signInRequest,
  signInSuccess,
  signInFailure,

  otpVerifyRequest,
  otpVerifySuccess,
  otpVerifyFailure,

  otpSuccessRequest,
  otpSuccessSuccess,
  otpSuccessFailure,

  cmsDetailsRequest,
  cmsDetailsSuccess,
  cmsDetailsFailure,

  saveSocketRequest,
  saveSocketSuccess,
  saveSocketFailure,

  languageRequest,
  languageSuccess,
  languageFailure,
  setLocalizationReq,
  setLocalizationSucccess
} = AuthSlice.actions;

export default AuthSlice.reducer;
