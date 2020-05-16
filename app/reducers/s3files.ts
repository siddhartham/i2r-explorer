import { S3FILES_ACTION } from '../actions/s3files';
import DataStore from '../utils/dataStore';

const initialState = {
  s3Conf: DataStore.Get('s3Conf'),
  s3State: 'disconnected',
  s3Connection: null,
  s3Path: '',
  s3FileList: [],
  seletedS3FileTT: 0
};

const s3files = (state = initialState, action: any) => {
  switch (action.type) {
    case S3FILES_ACTION:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default s3files;
