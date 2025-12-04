import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: '',
  isLoading: true,
  getTokenResponse: null,
  loginTypeResponse: null,
  error: {},
  logoutResponse: {},
  signinResponse: {},
  inFormalsigninResponse: {},
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

    getLoginTypeRequest(state, action) {
      state.isLoading = true;
      state.status = action.type;
    },
    getLoginTypeSuccess(state, action) {
      state.isLoading = false;
      state.loginTypeResponse = action.payload;
      state.status = action.type;
    },
    getLoginTypeFailure(state, action) {
      state.isLoading = false;
      state.error = action.error;
      state.status = action.type;
    },

    //LOGOUT
    logoutRequest(state, action) {
      state.status = action.type;
    },
    logoutSuccess(state, action) {
      state.logoutResponse = action.payload;
      state.getTokenResponse = null; // Clear token on logout
      state.loginTypeResponse = null; // Clear login type on logout
      state.signinResponse = {};
      state.inFormalsigninResponse = {};
      state.status = action.type;
    },
    logoutFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    //FORMAL SIGN IN (Phone Number)
    signInRequest(state, action) {
      state.status = action.type;
    },
    signInSuccess(state, action) {
      state.signinResponse = action.payload;
      state.getTokenResponse = action.payload;
      state.isLoading = false;
      state.status = action.type;
    },
    signInFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    //INFORMAL SIGN IN (Username)
    informalsignInRequest(state, action) {
      state.status = action.type;
    },
    inFormalsignInSuccess(state, action) {
      state.inFormalsigninResponse = action.payload;
      state.getTokenResponse = action.payload;
      state.isLoading = false;
      state.status = action.type;
    },
    inFormalsignInFailure(state, action) {
      state.error = action.error;
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

  getLoginTypeRequest,
  getLoginTypeSuccess,
  getLoginTypeFailure,

  signInRequest,
  signInSuccess,
  signInFailure,

  informalsignInRequest,
  inFormalsignInSuccess,
  inFormalsignInFailure,
} = AuthSlice.actions;

export default AuthSlice.reducer;
