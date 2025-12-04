import { call, put, takeLatest } from 'redux-saga/effects';
import showErrorAlert from '../../utils/helpers/Toast';
import { postApi } from '../../utils/helpers/ApiRequest';
import {
  getLoginTypeFailure,
  getLoginTypeSuccess,
  getTokenFailure,
  getTokenSuccess,
  inFormalsignInFailure,
  inFormalsignInSuccess,
  logoutFailure,
  logoutSuccess,
  signInFailure,
  signInSuccess,
} from '../reducer/AuthReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import constants from '../../utils/helpers/constants';
import ShowMessage from '../../utils/helpers/ShowMessage';

export function* getTokenSaga() {
  try {
    const response = yield call(AsyncStorage.getItem, constants.TOKEN);
    if (response != null) {
      yield put(getTokenSuccess(response));
    } else {
      yield put(getTokenSuccess(null));
    }
  } catch (error) {
    yield put(getTokenFailure(error));
  }
}

export function* getLoginTypeSaga() {
  try {
    const response = yield call(AsyncStorage.getItem, constants.LOGIN_TYPE);
    if (response != null) {
      yield put(getLoginTypeSuccess(response));
    } else {
      yield put(getLoginTypeSuccess(null));
    }
  } catch (error) {
    yield put(getLoginTypeFailure(error));
  }
}

export function* signinSaga(action) {
  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  };
  try {
    let response = yield call(
      postApi,
      'employee-login-emp',
      action.payload,
      header,
    );
    if (response?.data?.meta?.code == 200) {
      const accessToken = response?.data?.data?.access_token;

      // Store only the access token in the reducer
      yield put(signInSuccess(accessToken));
      ShowMessage(response?.data?.meta?.message, 'success');

      yield call(AsyncStorage.setItem, constants.TOKEN, accessToken);
      yield put(getTokenSuccess(accessToken));
    } else {
      yield put(signInFailure(response?.data?.data));
      ShowMessage(response?.data?.meta?.message, 'error');
    }
  } catch (error) {
    yield put(signInFailure(error));
  }
}

export function* inFormalsigninSaga(action) {
  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  };
  try {
    let response = yield call(postApi, 'park/details/login', action.payload, header);

    if (response?.data?.meta?.code == 200) {
      const accessToken = response?.data?.data?.access_token;

      // Store the full response data in the reducer
      yield put(inFormalsignInSuccess(response?.data?.data?.access_token));
      ShowMessage(response?.data?.meta?.message, 'success');

      yield call(AsyncStorage.setItem, constants.TOKEN, accessToken);

      yield put(getTokenSuccess(accessToken));
    } else {
      yield put(inFormalsignInFailure(response?.data?.data));
      ShowMessage(response?.data?.meta?.message, 'error');
    }
  } catch (error) {
    yield put(inFormalsignInFailure(error));
  }
}

/* LOGOUT */
export function* userLogoutSaga() {
  try {
    yield call(AsyncStorage.removeItem, constants.TOKEN);
    yield call(AsyncStorage.removeItem, constants.LOGIN_TYPE);
    yield put(getTokenSuccess(null));
    yield put(getLoginTypeSuccess(null));
    yield put(logoutSuccess());
  } catch (error) {
    yield put(logoutFailure());
  }
}

const watchFunction = [
  (function* () {
    yield takeLatest('Auth/getTokenRequest', getTokenSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/getLoginTypeRequest', getLoginTypeSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/logoutRequest', userLogoutSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/signInRequest', signinSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/informalsignInRequest', inFormalsigninSaga);
  })(),
];

export default watchFunction;
