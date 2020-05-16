import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import { History } from 'history';
import localfiles from './localfiles';
import s3files from './s3files';
import general from './general';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    localfiles,
    s3files,
    general
  });
}
