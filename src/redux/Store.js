import {configureStore} from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import {logger} from 'redux-logger';
import AuthReducer from './reducer/AuthReducer';
import RootSaga from './saga/RootSaga';
import ProfileReducer from './reducer/ProfileReducer';

let SagaMiddleware = createSagaMiddleware();
const middleware = [SagaMiddleware, logger];
export default configureStore({
  reducer: {
    AuthReducer: AuthReducer,
    ProfileReducer: ProfileReducer,
  },
  middleware,
});
SagaMiddleware.run(RootSaga);
