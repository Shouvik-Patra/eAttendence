import {all} from 'redux-saga/effects';
import AuthSaga from './AuthSaga';
import ProfileSaga from './ProfileSaga'
import InformalProfileSaga from './InformalProfileSaga'

const combinedSaga = [
  ...AuthSaga,...ProfileSaga,...InformalProfileSaga
];

export default function* RootSaga() {
  yield all(combinedSaga);
}