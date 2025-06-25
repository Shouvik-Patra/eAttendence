import {call, put, select, takeLatest} from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cmsDetailsFailure,
  cmsDetailsSuccess,
  getTokenFailure,
  getTokenSuccess,
  languageFailure,
  languageSuccess,
  logoutFailure,
  logoutSuccess,
  otpVerifyFailure,
  otpVerifySuccess,
  saveSocketFailure,
  saveSocketSuccess,
  setRoleSuccess,
  signInFailure,
  signInSuccess,
  sortCodeVerifyFailure,
  sortCodeVerifySuccess,
  setLocalizationSucccess,
} from '../reducer/AuthReducer';
import {getApi, postApi} from '../../utils/helpers/ApiRequest';
import Toast from '../../utils/helpers/Toast';
import constants from '../../utils/helpers/constants';
import showErrorAlert from '../../utils/helpers/Toast';
import getFinalMessage from '../../utils/helpers/getFinalMessage';

let getItem = state => state.AuthReducer;
let AuthReducer = state => state.AuthReducer;

//token
export function* getTokenSaga() {
  try {
    const response = yield call(AsyncStorage.getItem, constants.TOKEN);
    if (response != null) {
      yield put(getTokenSuccess(response));
      console.log('TOKEN===--->', response);
    } else {
      yield put(getTokenSuccess(null));
    }
  } catch (error) {
    yield put(getTokenFailure(error));
  }
}

//LOGOUT
export function* logout_Saga(action) {
  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  };
  try {
    yield call(AsyncStorage.removeItem, constants.TOKEN);
    yield call(AsyncStorage.removeItem, constants.LANGUAGE);
    yield put(getTokenSuccess(null));
    yield put(logoutSuccess(null));
    // showErrorAlert('Logout successfully');
  } catch (error) {
    console.log(error);
    yield put(logoutFailure(error));
  }
}

//SORT CODE VERIFYY SAGA
export function* sortCodeVerifySaga(action) {
  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  };
  let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(
      postApi,
      'driver/shortcode',
      action.payload,
      header,
    );
    console.log('response::::::::::', response);
    if (response.data.status == 200) {
      yield put(sortCodeVerifySuccess(response.data.data));
    } else {
      yield put(sortCodeVerifyFailure(response.data));
      getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    // Toast('Something went wrong')
    yield put(sortCodeVerifyFailure(error));
  }
}
//SIGN IN SAGA
export function* signinSaga(action) {
  // let items = yield select(getItem);
  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    // authorization: items?.getTokenResponse,
  };
  let AuthReducer = yield select(state => state.AuthReducer);

  try {
    let response = yield call(postApi, 'driver/signin', action.payload, header);
    let AuthReducer = yield select(state => state.AuthReducer);
    if (response.data.status == 200) {
      yield put(signInSuccess(response?.data));
      yield call(AsyncStorage.setItem, constants.LANGUAGE, 'en');
      // Toast(response?.data?.message);

      getFinalMessage(response?.data?.message, AuthReducer);
    } else {
      yield put(signInFailure(response?.data));

      getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    yield put(signInFailure(error));
  }
}

export function* otpVerificationSaga(action) {
  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  };
  try {
    let response = yield call(
      postApi,
      'driver/verify-phoneotp',
      action.payload,
      header,
    );
      let AuthReducer = yield select(state => state.AuthReducer);
    console.log('response::::::::::', response?.data?.token);
    if (response.data.status == 200) {
      yield put(otpVerifySuccess(response.data.data));
      yield call(AsyncStorage.setItem, constants.TOKEN, response?.data?.token);
      // yield put(getTokenSuccess(response?.data?.token));
    } else {
      yield put(otpVerifyFailure(response.data));
        getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    // Toast('Something went wrong')
    yield put(otpVerifyFailure(error));
  }
}

//otpSuccessSaga
export function* otpSuccessSaga() {
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

//CMS DETAILS Saga
export function* cmsDetailsSaga(action) {
  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
  };
    let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(postApi, 'cms/details', action.payload, header);
    console.log('response::::::::::', response?.data?.token);
    if (response.data.status == 200) {
      yield put(cmsDetailsSuccess(response.data.data));
      // yield put(getTokenSuccess(response?.data?.token));
    } else {
      yield put(cmsDetailsFailure(response.data));
        getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    // Toast('Something went wrong')
    yield put(cmsDetailsFailure(error));
  }
}

// Save Socket SAGA
export function* saveSocketSaga(action) {
  try {
    yield put(saveSocketSuccess(action?.payload));
  } catch (error) {
    yield put(saveSocketFailure(error?.response));
  }
}

export function* getLanguageSaga(action) {
  try {
    yield put(languageSuccess(action?.payload));

    console.log('action?.payload', action?.payload?.language);
    yield call(
      AsyncStorage.setItem,
      constants.LANGUAGE,
      action?.payload?.language,
    );
    const getLanguageResponse = yield call(
      AsyncStorage.getItem,
      constants.LANGUAGE,
    );
    console.log('getLanguageResponse', getLanguageResponse);
  } catch (error) {
    console.log(error);
    yield put(languageFailure(error));
  }
}
export function* setLocalizationSaga(action) {
  yield put(setLocalizationSucccess(action?.payload));
}
const watchFunction = [
  (function* () {
    yield takeLatest('Auth/getTokenRequest', getTokenSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/logoutRequest', logout_Saga);
  })(),
  (function* () {
    yield takeLatest('Auth/sortCodeVerifyRequest', sortCodeVerifySaga);
  })(),
  (function* () {
    yield takeLatest('Auth/signInRequest', signinSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/otpVerifyRequest', otpVerificationSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/otpSuccessRequest', otpSuccessSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/cmsDetailsRequest', cmsDetailsSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/saveSocketRequest', saveSocketSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/languageRequest', getLanguageSaga);
  })(),
  (function* () {
    yield takeLatest('Auth/setLocalizationReq', setLocalizationSaga);
  })(),
];
export default watchFunction;
