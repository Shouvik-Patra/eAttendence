import { call, put, select, takeLatest } from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getApi,
  postApi,
  postApiWithParam,
  putApi,
} from '../../utils/helpers/ApiRequest';

import showErrorAlert from '../../utils/helpers/Toast';
import {
  getTokenSuccess,
  logoutRequest,
  logoutSuccess,
} from '../reducer/AuthReducer';
import constants from '../../utils/helpers/constants';
import ShowMessage from '../../utils/helpers/ShowMessage';
import {
  InformalclockinFailure,
  InformalclockinSuccess,
  InformalclockoutFailure,
  InformalclockoutSuccess,
  InformalProfileDetailsFailure,
  InformalProfileDetailsSuccess,
  informalUserDetailsFailure,
  informalUserDetailsSuccess,
} from '../reducer/InformalProfileReducer';
let getItem = state => state.AuthReducer;

//Informal User Profile Details

export function* informaluUserDetailsSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };

  try {
    let response = yield call(getApi, 'getParkUsersWithAttendance', header);

    if (response?.data?.meta?.code == 200) {
      yield put(informalUserDetailsSuccess(response?.data?.data));
    } else {
      yield put(informalUserDetailsFailure(response?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('error>>>>>>>>>>', error);

    yield put(informalUserDetailsFailure(error?.response?.data));
    if (error?.response?.data?.meta?.message == 'Token is invalid or expired') {
      yield call(AsyncStorage.removeItem, constants.TOKEN);
      yield call(AsyncStorage.removeItem, constants.LOGIN_TYPE);
      yield put(getTokenSuccess(null));
      yield put(logoutSuccess());
    }
  }
}

export function* InformalclockinSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'check_in_park',
      action.payload,
      Header,
    );
    if (response?.data?.meta?.code == 200) {
      yield put(InformalclockinSuccess(response?.data?.data));
      // showErrorAlert(response?.data?.meta?.message);
      ShowMessage(response?.data?.meta?.message, 'success');
    } else {
      yield put(InformalclockinFailure(response?.data?.data));
      // showErrorAlert(response?.data?.meta?.message);
      ShowMessage(response?.data?.meta?.message, 'error');
    }
  } catch (error) {
    yield put(InformalclockinFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

export function* InformalclockoutSaga(action) {
  let items = yield select(getItem);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    const response = yield call(
      postApi,
      'check_out_park',
      action.payload,
      Header,
    );

    if (response?.data?.meta?.code == 200) {
      yield put(InformalclockoutSuccess(response?.data?.data));
      // showErrorAlert(response?.data?.meta?.message);
      ShowMessage(response?.data?.meta?.message, 'success');
    } else {
      yield put(InformalclockoutFailure(response?.data?.data));
      // showErrorAlert(response?.data?.meta?.message);
      ShowMessage(response?.data?.meta?.message, 'error');
    }
  } catch (error) {
    yield put(InformalclockoutFailure(error?.response?.data));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

export function* informaluProfileDetailsSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  
  try {
    let response = yield call(getApi, 'admin/me', header);

    if (response?.data?.meta?.code == 200) {
      yield put(InformalProfileDetailsSuccess(response?.data?.data));
    } else {
      yield put(InformalProfileDetailsFailure(response?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log('error>>>>>>>>>>', error);

    yield put(informalUserDetailsFailure(error?.response?.data));
    if (error?.response?.data?.meta?.message == 'Token is invalid or expired') {
      yield call(AsyncStorage.removeItem, constants.TOKEN);
      yield call(AsyncStorage.removeItem, constants.LOGIN_TYPE);
      yield put(getTokenSuccess(null));
      yield put(logoutSuccess());
    }
  }
}
const watchFunction = [
  (function* () {
    yield takeLatest(
      'InformalProfile/informalUserDetailsRequest',
      informaluUserDetailsSaga,
    );
  })(),
  (function* () {
    yield takeLatest(
      'InformalProfile/InformalclockinRequest',
      InformalclockinSaga,
    );
  })(),
  (function* () {
    yield takeLatest(
      'InformalProfile/InformalclockoutRequest',
      InformalclockoutSaga,
    );
  })(),
  (function* () {
    yield takeLatest(
      'InformalProfile/InformalProfileDetailsRequest',
      informaluProfileDetailsSaga,
    );
  })(),
];

export default watchFunction;
