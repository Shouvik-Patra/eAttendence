import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  status: {},
  isLoading: true,
  error: {},
  userDetailsResponse: {},
  clockinResponse: {},
  clockoutResponse: {},
  profileUpdateResponse: {},
  taskListResponse: {},
  complitedTaskResponse: {},
  addTaskResponse: {},
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

    profileUpdateRequest(state, action) {
      state.status = action.type;
    },
    profileUpdateSuccess(state, action) {
      state.profileUpdateResponse = action.payload;
      state.status = action.type;
    },
    profileUpdateFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    taskListRequest(state, action) {
      state.status = action.type;
    },
    taskListSuccess(state, action) {
      state.taskListResponse = action.payload;
      state.status = action.type;
    },
    taskListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    complitedTaskListRequest(state, action) {
      state.status = action.type;
    },
    complitedTaskListSuccess(state, action) {
      state.complitedTaskResponse = action.payload;
      state.status = action.type;
    },
    complitedTaskListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    addTaskRequest(state, action) {
      state.status = action.type;
    },
    addTaskSuccess(state, action) {
      state.addTaskResponse = action.payload;
      state.status = action.type;
    },
    addTaskFailure(state, action) {
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

  profileUpdateRequest,
  profileUpdateSuccess,
  profileUpdateFailure,

  taskListRequest,
  taskListSuccess,
  taskListFailure,

  complitedTaskListRequest,
  complitedTaskListSuccess,
  complitedTaskListFailure,

  addTaskRequest,
  addTaskSuccess,
  addTaskFailure,
  
} = ProfileSlice.actions;

export default ProfileSlice.reducer;
