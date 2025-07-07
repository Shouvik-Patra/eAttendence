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
  applyLeaveResponse: {},
  municipalityRegisterResponse: {},
  municipalityRegisterListResponse: {},
  municipalityOfficeListResponse: {},
  leaveLogResponse: {},
  leaveCancelResponse: {},
  leaveTypeResponse: {},
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

    applyLeaveRequest(state, action) {
      state.status = action.type;
    },
    applyLeaveSuccess(state, action) {
      state.applyLeaveResponse = action.payload;
      state.status = action.type;
    },
    applyLeaveFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    municipalityRegisterRequest(state, action) {
      state.status = action.type;
    },
    municipalityRegisterSuccess(state, action) {
      state.applyLeaveResponse = action.payload;
      state.status = action.type;
    },
    municipalityRegisterFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    municipalityRegisterListRequest(state, action) {
      state.status = action.type;
    },
    municipalityRegisterListSuccess(state, action) {
      state.municipalityRegisterListResponse = action.payload;
      state.status = action.type;
    },
    municipalityRegisterListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    municipalityOfficeListRequest(state, action) {
      state.status = action.type;
    },
    municipalityOfficeListSuccess(state, action) {
      state.municipalityOfficeListResponse = action.payload;
      state.status = action.type;
    },
    municipalityOfficeListFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    leaveLogRequest(state, action) {
      state.status = action.type;
    },
    leaveLogSuccess(state, action) {
      state.leaveLogResponse = action.payload;
      state.status = action.type;
    },
    leaveLogFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },

    leaveCancelRequest(state, action) {
      state.status = action.type;
    },
    leaveCancelSuccess(state, action) {
      state.leaveCancelResponse = action.payload;
      state.status = action.type;
    },
    leaveCancelFailure(state, action) {
      state.error = action.error;
      state.status = action.type;
    },
    leaveTypeRequest(state, action) {
      state.status = action.type;
    },
    leaveTypeSuccess(state, action) {
      state.leaveTypeResponse = action.payload;
      state.status = action.type;
    },
    leaveTypeFailure(state, action) {
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

  applyLeaveRequest,
  applyLeaveSuccess,
  applyLeaveFailure,

  municipalityRegisterRequest,
  municipalityRegisterSuccess,
  municipalityRegisterFailure,

  municipalityRegisterListRequest,
  municipalityRegisterListSuccess,
  municipalityRegisterListFailure,

  municipalityOfficeListRequest,
  municipalityOfficeListSuccess,
  municipalityOfficeListFailure,

  leaveLogRequest,
  leaveLogSuccess,
  leaveLogFailure,

  leaveCancelRequest,
  leaveCancelSuccess,
  leaveCancelFailure,

  leaveTypeRequest,
  leaveTypeSuccess,
  leaveTypeFailure,

} = ProfileSlice.actions;

export default ProfileSlice.reducer;
