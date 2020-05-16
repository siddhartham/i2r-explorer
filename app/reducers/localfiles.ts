import { LOCALFILES_ACTION } from '../actions/localfiles';

const initialState = {
  currentPath: null,
  favourites: [],
  pathHistory: [],
  fileList: [],
  seletedFileTT: 0,
  uploadQueue: [],
  uploadQueueCnt: 0,
  progressPercent: {},
  totalProgressPercent: 0,
  favouritesCount: 0
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
