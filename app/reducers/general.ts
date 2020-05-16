import { GENERAL_ACTION } from '../actions/general';
import DataStore from '../utils/dataStore';

const initialState = {
  transferLogs: DataStore.Get('transferLogs', []),
  autoConnectSetting: DataStore.Get('autoConnectSetting', 'auto'),
  notifyOnUpload: DataStore.Get('notifyOnUpload', true),
  notifyOnDownload: DataStore.Get('notifyOnDownload', true)
};

const general = (state = initialState, action: any) => {
  switch (action.type) {
    case GENERAL_ACTION:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default general;
