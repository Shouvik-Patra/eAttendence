import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: {},
  isLoading: true,
  error: {},
  userDetailsResponse: {},
  clockinResponse: {},
  clockoutResponse: {},
};

const ProfileSlice = createSlice({
  name: 'Profile',
  initialState,
  reducers: {
    userDetailsRequest(state, action) {
      state.status = action.type;
    },
    userDetailsSuccess(state, action) {
      state.userDetailsResponse = action.payload;
      state.status = action.type;
    },
    userDetailsFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    clockinRequest(state, action) {
      state.status = action.type;
    },
    clockinSuccess(state, action) {
      state.clockinResponse = action.payload;
      state.status = action.type;
    },
    clockinFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    clockoutRequest(state, action) {
      state.status = action.type;
    },
    clockoutSuccess(state, action) {
      state.clockoutResponse = action.payload;
      state.status = action.type;
    },
    clockoutFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
  },
});

export const {
  userDetailsRequest,
  userDetailsSuccess,
  userDetailsFailure,

  clockinRequest,
  clockinSuccess,
  clockinFailure,

  clockoutRequest,
  clockoutSuccess,
  clockoutFailure,
} = ProfileSlice.actions;

export default ProfileSlice.reducer;
