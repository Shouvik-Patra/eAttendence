import { call, put, select, takeLatest } from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApi, postApi } from '../../utils/helpers/ApiRequest';

import {
  userDetailsSuccess,
  userDetailsFailure,
  clockinSuccess,
  clockinFailure,
  clockoutSuccess,
  clockoutFailure,
  profileUpdateSuccess,
  profileUpdateFailure,
  taskListSuccess,
  taskListFailure,
  complitedTaskListSuccess,
  complitedTaskListFailure,
  addTaskSuccess,
  addTaskFailure,
  applyLeaveSuccess,
  applyLeaveFailure,
    municipalityRegisterSuccess,
  municipalityRegisterFailure,
  municipalityRegisterListFailure,
  municipalityRegisterListSuccess,
} from '../reducer/ProfileReducer';
import showErrorAlert from '../../utils/helpers/Toast';
let getItem = state => state.AuthReducer;

//User Profile Details

export function* userDetailsSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, 'user_profile_info', header);

    if (response?.data?.meta?.code == 200) {
      yield put(userDetailsSuccess(response?.data?.data));
    } else {
      yield put(userDetailsFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('add address error:', error);
    yield put(userDetailsFailure(error));
  }
}

export function* clockinSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(postApi, 'check_in', action.payload, Header);
    if (response?.data?.meta?.code == 200) {
      yield put(clockinSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(clockinFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(clockinFailure(error));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

export function* clockoutSaga(action) {
  let items = yield select(getItem);
  console.log('45444----------------->>', items?.getTokenResponse);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    console.log('Header>>>>>>>>>>>>>>>>', Header, action.payload);
    const response = yield call(postApi, 'check_out', action.payload, Header);
    console.log('clockoutSaga ::response>>>>>>>>>>>', response);

    if (response?.data?.meta?.code == 200) {
      yield put(clockoutSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(clockoutFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('helooo>>>', error);

    yield put(clockoutFailure(error));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
export function* profileupdateSaga(action) {
  let items = yield select(getItem);
  console.log('45444----------------->>', items?.getTokenResponse);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'user_profile_update',
      action.payload,
      Header,
    );
    console.log('response>>>>>>>>>>>', response);

    if (response?.data?.meta?.code == 200) {
      yield put(profileUpdateSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(profileUpdateFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('helooo>>>', error);

    yield put(profileUpdateFailure(error));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
export function* taskListSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, 'get-all-tasks', header);

    if (response?.data?.meta?.code == 200) {
      yield put(taskListSuccess(response?.data?.data));
    } else {
      yield put(taskListFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('add address error:', error);
    yield put(taskListFailure(error));
  }
}
export function* complitedTaskListSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, 'get-task-submit', header);

    if (response?.data?.meta?.code == 200) {
      yield put(complitedTaskListSuccess(response?.data?.data));
    } else {
      yield put(complitedTaskListFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('add address error:', error);
    yield put(complitedTaskListFailure(error));
  }
}
export function* addTaskSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'create-task-submit',
      action.payload,
      Header,
    );
    console.log('response>>>>>>>>>>>', response);

    if (response?.data?.meta?.code == 200) {
      yield put(addTaskSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(addTaskFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('helooo>>>', error);

    yield put(addTaskFailure(error));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
export function* applyleaveSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'application/json',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(postApi, 'apply_leave', action.payload, Header);
    console.log('response>>>>>>>>>>>', response);

    if (response?.data?.meta?.code == 200) {
      yield put(applyLeaveSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(applyLeaveFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    yield put(applyLeaveFailure(error));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
export function* municipalityRegisterSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'createMunicipality',
      action.payload,
      Header,
    );
    console.log('response>>>>>>>>>>>', response);

    if (response?.data?.meta?.code == 200) {
      yield put(municipalityRegisterSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(municipalityRegisterFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('helooo>>>', error);

    yield put(municipalityRegisterFailure(error));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

export function* municipalityRegisterListSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  try {
    let response = yield call(getApi, 'getMunicipalityList', header);

    if (response?.data?.meta?.code == 200) {
      yield put(municipalityRegisterListSuccess(response?.data?.data));
    } else {
      yield put(municipalityRegisterListFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('add address error:', error);
    yield put(municipalityRegisterListFailure(error));
  }
}
const watchFunction = [
  (function* () {
    yield takeLatest('Profile/userDetailsRequest', userDetailsSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/clockinRequest', clockinSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/clockoutRequest', clockoutSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/profileUpdateRequest', profileupdateSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/taskListRequest', taskListSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/complitedTaskListRequest', complitedTaskListSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/addTaskRequest', addTaskSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/municipalityRegisterRequest', municipalityRegisterSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/applyLeaveRequest', applyleaveSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/municipalityRegisterListRequest', municipalityRegisterListSaga);
  })(),
];

export default watchFunction;
