import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: {},
  isLoading: true,
  error: {},
  informaluserDetailsResponse: {},
  informalattendenceStatusResponse: {},
  InformalclockinResponse: {},
  InformalclockoutResponse: {},
  InformalProfileDetailsResponse: {},
};

const ImformalProfileSlice = createSlice({
  name: 'InformalProfile',
  initialState,
  reducers: {
    informalUserDetailsRequest(state, action) {
      state.status = action.type;
    },
    informalUserDetailsSuccess(state, action) {
      state.informaluserDetailsResponse = action.payload;
      state.status = action.type;
    },
    informalUserDetailsFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    informalattendenceStatusRequest(state, action) {
      state.status = action.type;
    },
    informalattendenceStatusSuccess(state, action) {
      state.informalattendenceStatusResponse = action.payload;
      state.status = action.type;
    },
    informalattendenceStatusFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    InformalclockinRequest(state, action) {
      state.status = action.type;
    },
    InformalclockinSuccess(state, action) {
      state.InformalclockinResponse = action.payload;
      state.status = action.type;
    },
    InformalclockinFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    InformalclockoutRequest(state, action) {
      state.status = action.type;
    },
    InformalclockoutSuccess(state, action) {
      state.InformalclockoutResponse = action.payload;
      state.status = action.type;
    },
    InformalclockoutFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    InformalProfileDetailsRequest(state, action) {
      state.status = action.type;

    },
    InformalProfileDetailsSuccess(state, action) {
      state.InformalProfileDetailsResponse = action.payload;
      state.status = action.type;
    },
    InformalProfileDetailsFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
  },
});

export const {
  informalUserDetailsRequest,
  informalUserDetailsSuccess,
  informalUserDetailsFailure,

  InformalclockinRequest,
  InformalclockinSuccess,
  InformalclockinFailure,

  InformalclockoutRequest,
  InformalclockoutSuccess,
  InformalclockoutFailure,

  InformalProfileDetailsRequest,
  InformalProfileDetailsSuccess,
  InformalProfileDetailsFailure,
} = ImformalProfileSlice.actions;

export default ImformalProfileSlice.reducer;
