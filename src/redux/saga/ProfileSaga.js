import {call, put, select, takeLatest} from 'redux-saga/effects';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {getApi, postApi} from '../../utils/helpers/ApiRequest';
import Toast from '../../utils/helpers/Toast';
import constants from '../../utils/helpers/constants';
import showErrorAlert from '../../utils/helpers/Toast';
import {
  bookingListFailure,
  bookingListSuccess,
  cancelReasonFailure,
  cancelReasonSuccess,
  notificationFailure,
  notificationSuccess,
  orderStatusUpdateFailure,
  orderStatusUpdateSuccess,
  reviewandRatingFailure,
  reviewandRatingSuccess,
  userDetailsFailure,
  userDetailsSuccess,
  userUpdateFailure,
  userUpdateSuccess,
  deliverStatusSuccess,
  deliverStatusFailure,
  driverEarningFailure,
  driverEarningSuccess,
  bookingAcceptedListFailure,
  bookingAcceptedListSuccess,
  callFailure,
  callSuccess,
} from '../reducer/ProfileReducer';
import {getTokenSuccess, logoutSuccess} from '../reducer/AuthReducer';
import getFinalMessage from '../../utils/helpers/getFinalMessage';

let getItem = state => state.AuthReducer;

//User Profile Details
export function* userDetailsSaga(action) {
  let items = yield select(getItem);

  let header = {
    Accept: 'application/json',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
    let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(getApi, 'user/details', header);

    if (response.data.status == 200) {
      yield put(userDetailsSuccess(response?.data));
    } else if (
      response.data.message == 'There was a problem finding the user.'
    ) {
      yield call(AsyncStorage.removeItem, constants.TOKEN);
      yield put(getTokenSuccess(null));
      yield put(logoutSuccess());
    } else {
      yield put(userDetailsFailure(response?.data));
        getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    console.log('add address error:', error);
    yield put(userDetailsFailure(error));
    showErrorAlert(response?.data?.message);
  }
}

//Notification

export function* notificationSaga(action) {
  let items = yield select(getItem);
  let header = {
    Accept: 'application/json',
    contenttype: 'multipart/form-data',
    accesstoken: items?.getTokenResponse,
  };
  let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(
      postApi,
      'driver/notification',
      action.payload,
      header,
    );
    if (response.data.status == 200) {
      yield put(notificationSuccess(response?.data));
      // showErrorAlert(response?.data?.message);
    } else {
      yield put(notificationFailure(response?.data));
       getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    yield put(notificationFailure(error));
  }
}

//USER UPDATE SAGA
export function* userUpdateSaga(action) {
  let items = yield select(getItem);
  let header = {
    Accept: 'application/json',
    contenttype: 'multipart/form-data',
    accesstoken: items?.getTokenResponse,
  };
  let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(
      postApi,
      'user/update-profile',
      action.payload,
      header,
    );
    console.log(response, 'ssssss');
    if (response.data.status == 200) {
      yield put(userUpdateSuccess(response?.data));
        getFinalMessage(response?.data?.message, AuthReducer);
    } else {
      yield put(userUpdateFailure(response?.data));
      getFinalMessage(response?.data?.message, AuthReducer);

    }
  } catch (error) {
    yield put(userUpdateFailure(error));
  }
}
//BOOKING LIST SAGA
export function* bookingListSaga(action) {
  let items = yield select(getItem);
  let header = {
    Accept: 'application/json',
    contenttype: 'multipart/form-data',
    accesstoken: items?.getTokenResponse,
  };
  let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(
      postApi,
      'driver/order/list',
      action.payload,
      header,
    );
    console.log(response, 'ssssss');
    if (response.data.status == 200) {
      yield put(bookingListSuccess(response?.data));
      // showErrorAlert(response?.data?.message);
    } else {
      yield put(bookingListFailure(response?.data));
              getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    yield put(bookingListFailure(error));
  }
}
//BOOKING ACCEPTED LIST SAGA
export function* bookingAcceptedListSaga(action) {
  let items = yield select(getItem);
  let header = {
    Accept: 'application/json',
    contenttype: 'multipart/form-data',
    accesstoken: items?.getTokenResponse,
  };
  let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(
      postApi,
      'driver/order/list',
      action.payload,
      header,
    );
    console.log(response, 'ssssss');
    if (response.data.status == 200) {
      yield put(bookingAcceptedListSuccess(response?.data));
      // showErrorAlert(response?.data?.message);
    } else {
      yield put(bookingAcceptedListFailure(response?.data));
              getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    yield put(bookingAcceptedListFailure(error));
  }
}
//BOOKING STATUS UPDATE SAGA
export function* bookingUpdateStatusSaga(action) {
  let items = yield select(getItem);
  let header = {
    Accept: 'application/json',
    contenttype: 'multipart/form-data',
    accesstoken: items?.getTokenResponse,
  };
  let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(
      postApi,
      'driver/order/status-update',
      action.payload,
      header,
    );
    console.log(response, 'ssssss');
    if (response.data.status == 200) {
      yield put(orderStatusUpdateSuccess(response?.data));
             getFinalMessage(response?.data?.message, AuthReducer);
    } else {
      yield put(orderStatusUpdateFailure(response?.data));
      getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    yield put(orderStatusUpdateFailure(error));
  }
}
//CANCEL REASON LIST SAGA
export function* cancelReasonSaga(action) {
  let items = yield select(getItem);
  let header = {
    Accept: 'application/json',
    contenttype: 'multipart/form-data',
    accesstoken: items?.getTokenResponse,
  };
  let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(
      postApi,
      'order/cancellation-reason/list',
      action.payload,
      header,
    );
    if (response.data.status == 200) {
      yield put(cancelReasonSuccess(response?.data));
      // showErrorAlert(response?.data?.message);
    } else {
      yield put(cancelReasonFailure(response?.data));
                  getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    yield put(cancelReasonFailure(error));
  }
}
//DELIVER STATUS SAGA
export function* deliverStatusSaga(action) {
  let items = yield select(getItem);
  let header = {
    Accept: 'application/json',
    // contenttype: 'multipart/form-data',
    contenttype: 'application/json',
    accesstoken: items?.getTokenResponse,
  };
  let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(
      postApi,
      'driver/order/status-update',
      action.payload,
      header,
    );
    if (response.data.status == 200) {
      yield put(deliverStatusSuccess(response?.data));
                  getFinalMessage(response?.data?.message, AuthReducer);
    } else {
      yield put(deliverStatusFailure(response?.data));
      getFinalMessage(response?.data?.message, AuthReducer);

    }
  } catch (error) {
    yield put(deliverStatusFailure(error));
  }
}
//DELIVER STATUS SAGA
export function* driverEarningSaga(action) {
  let items = yield select(getItem);
  let header = {
    Accept: 'application/json',
    contenttype: 'multipart/form-data',
    accesstoken: items?.getTokenResponse,
  };
  let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(
      postApi,
      'driver/earning-details',
      action.payload,
      header,
    );
    if (response.data.status == 200) {
      yield put(driverEarningSuccess(response?.data));
      // showErrorAlert(response?.data?.message);
    } else {
      yield put(driverEarningFailure(response?.data));
            getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    yield put(driverEarningFailure(error));
  }
}
//CALL SAGA
export function* callSaga(action) {
  let items = yield select(getItem);
  let header = {
    Accept: 'application/json',
    contenttype: 'multipart/form-data',
    accesstoken: items?.getTokenResponse,
  };
  let AuthReducer = yield select(state => state.AuthReducer);
  try {
    let response = yield call(
      postApi,
      'driver/makeCall ',
      action.payload,
      header,
    );
    if (response.data.status == 200) {
      yield put(callSuccess(response?.data));
      // showErrorAlert(response?.data?.message);
    } else {
      yield put(callFailure(response?.data));
           getFinalMessage(response?.data?.message, AuthReducer);
    }
  } catch (error) {
    yield put(callFailure(error));
  }
}
const watchFunction = [
  (function* () {
    yield takeLatest('Profile/userDetailsRequest', userDetailsSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/notificationRequest', notificationSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/userUpdateRequest', userUpdateSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/bookingListRequest', bookingListSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/bookingAcceptedListRequest', bookingAcceptedListSaga);
  })(),
  (function* () {
    yield takeLatest(
      'Profile/orderStatusUpdateRequest',
      bookingUpdateStatusSaga,
    );
  })(),
  (function* () {
    yield takeLatest('Profile/cancelReasonRequest', cancelReasonSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/deliverStatusRequest', deliverStatusSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/driverEarningRequest', driverEarningSaga);
  })(),
  (function* () {
    yield takeLatest('Profile/callRequest', callSaga);
  })(),
];
export default watchFunction;
