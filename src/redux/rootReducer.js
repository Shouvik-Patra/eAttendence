// src/redux/rootReducer.js
import { combineReducers } from 'redux';
import exampleReducer from './example/exampleSlice';

const rootReducer = combineReducers({
  example: exampleReducer,
});

export default rootReducer;
