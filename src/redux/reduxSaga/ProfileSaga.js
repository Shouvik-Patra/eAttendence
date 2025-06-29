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
} from '../reducer/ProfileReducer';
import { getTokenSuccess, logoutSuccess } from '../reducer/AuthReducer';
import showErrorAlert from '../../utils/helpers/Toast';
import constants from '../../utils/helpers/constants';
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
    } 
    // else if (
    //   response.data.message == 'There was a problem finding the user.'
    // ) {
    //   yield call(AsyncStorage.removeItem, constants.TOKEN);
    //   yield put(getTokenSuccess(null));
    //   yield put(logoutSuccess());
    // }
     else {
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
  console.log('45444----------------->>', items?.getTokenResponse
);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    console.log("Header>>>>>>>>>>>>>>>>",Header,action.payload);
    const response = yield call(postApi, 'check_in', action.payload, Header);
    console.log("response>>>>>>>>>>>",response);
    
    if (response?.data?.meta?.code == 200) {
      yield put(clockinSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(clockinFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log("helooo>>>",error);
    
    yield put(clockinFailure(error));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}
export function* clockoutSaga(action) {
  let items = yield select(getItem);
  console.log('45444----------------->>', items?.getTokenResponse
);

  try {
    let Header = {
      Accept: 'application/json',
      contenttype: 'multipart/form-data',
      accesstoken: items?.getTokenResponse,
    };

    console.log("Header>>>>>>>>>>>>>>>>",Header,action.payload);
    const response = yield call(postApi, 'check_out', action.payload, Header);
    console.log("response>>>>>>>>>>>",response);
    
    if (response?.data?.meta?.code == 200) {
      yield put(clockoutSuccess(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    } else {
      yield put(clockoutFailure(response?.data?.data));
      showErrorAlert(response?.data?.meta?.message);
    }
  } catch (error) {
    console.log("helooo>>>",error);
    
    yield put(clockoutFailure(error));
    // showErrorAlert(error?.response?.data?.meta?.message);
  }
}

const watchFunction = [
  (function* () {
    yield takeLatest('Profile/userDetailsRequest', userDetailsSaga);
  })(),
  (function* () {
    yield takeLatest(
      'Profile/clockinRequest',
      clockinSaga,
    );
  })(),
  (function* () {
    yield takeLatest(
      'Profile/clockoutRequest',
      clockoutSaga,
    );
  })(),
];

export default watchFunction;
