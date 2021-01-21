import { LOCALFILES_ACTION } from '../actions/localfiles';
import DataStore from '../utils/dataStore';

const favourites:any = DataStore.Get('favourites', []);
const initialState = {
  currentPath: null,
  favourites: favourites,
  pathHistory: [],
  fileList: [],
  seletedFileTT: 0,
  uploadQueue: [],
  uploadQueueCnt: 0,
  progressPercent: {},
  totalProgressPercent: 0,
  favouritesCount: favourites.length
};

const localfiles = (state = initialState, action: any) => {
  switch (action.type) {
    case LOCALFILES_ACTION:
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

export default localfiles;
