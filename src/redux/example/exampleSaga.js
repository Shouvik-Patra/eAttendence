// src/redux/example/exampleSaga.js
import { put, takeLatest, call } from 'redux-saga/effects';
import {
  fetchDataRequest,
  fetchDataSuccess,
  fetchDataFailure,
} from './exampleSlice';

function* fetchDataWorker() {
  try {
    // Simulate API call
    const response = yield call(() =>
      new Promise((resolve) => setTimeout(() => resolve('Hello from API'), 1000))
    );
    yield put(fetchDataSuccess(response));
  } catch (error) {
    yield put(fetchDataFailure(error.message));
  }
}

export default function* exampleSaga() {
  yield takeLatest(fetchDataRequest.type, fetchDataWorker);
}
