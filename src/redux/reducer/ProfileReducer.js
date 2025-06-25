import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  status: {},
  isLoading: true,
  error: {},
  userDetailsResponse: {},
  notificationResponse: {},
  userUpdateResponse: {},
  bookingListResponse: {},
  bookingAcceptedListResponse: {},
  orderStatusUpdateResponse: {},
  cancelReasonResponse: {},
  deliverStatusResponse: {},
  driverEarningResponse: {},
  callResponse: {},
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

    notificationRequest(state, action) {
      state.status = action.type;
    },
    notificationSuccess(state, action) {
      state.notificationResponse = action.payload;
      state.status = action.type;
    },
    notificationFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    userUpdateRequest(state, action) {
      state.status = action.type;
    },
    userUpdateSuccess(state, action) {
      state.userUpdateResponse = action.payload;
      state.status = action.type;
    },
    userUpdateFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    bookingListRequest(state, action) {
      state.status = action.type;
    },
    bookingListSuccess(state, action) {
      state.bookingListResponse = action.payload;
      state.status = action.type;
    },
    bookingListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    bookingAcceptedListRequest(state, action) {
      state.status = action.type;
    },
    bookingAcceptedListSuccess(state, action) {
      state.bookingAcceptedListResponse = action.payload;
      state.status = action.type;
    },
    bookingAcceptedListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    orderStatusUpdateRequest(state, action) {
      state.status = action.type;
    },
    orderStatusUpdateSuccess(state, action) {
      state.orderStatusUpdateResponse = action.payload;
      state.status = action.type;
    },
    orderStatusUpdateFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    cancelReasonRequest(state, action) {
      state.status = action.type;
    },
    cancelReasonSuccess(state, action) {
      state.cancelReasonResponse = action.payload;
      state.status = action.type;
    },
    cancelReasonFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    deliverStatusRequest(state, action) {
      state.status = action.type;
    },
    deliverStatusSuccess(state, action) {
      state.deliverStatusResponse = action.payload;
      state.status = action.type;
    },
    deliverStatusFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    driverEarningRequest(state, action) {
      state.status = action.type;
    },
    driverEarningSuccess(state, action) {
      state.driverEarningResponse = action.payload;
      state.status = action.type;
    },
    driverEarningFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    callRequest(state, action) {
      state.status = action.type;
    },
    callSuccess(state, action) {
      state.callResponse = action.payload;
      state.status = action.type;
    },
    callFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
  },
});

export const {
  userDetailsRequest,
  userDetailsSuccess,
  userDetailsFailure,

  notificationRequest,
  notificationSuccess,
  notificationFailure,

  userUpdateRequest,
  userUpdateSuccess,
  userUpdateFailure,

  bookingListRequest,
  bookingListSuccess,
  bookingListFailure,

  bookingAcceptedListRequest,
  bookingAcceptedListSuccess,
  bookingAcceptedListFailure,

  orderStatusUpdateRequest,
  orderStatusUpdateSuccess,
  orderStatusUpdateFailure,

  cancelReasonRequest,
  cancelReasonSuccess,
  cancelReasonFailure,

  deliverStatusRequest,
  deliverStatusSuccess,
  deliverStatusFailure,

  driverEarningRequest,
  driverEarningSuccess,
  driverEarningFailure,
  
  callRequest,
callSuccess,
callFailure,
} = ProfileSlice.actions;

export default ProfileSlice.reducer;
