import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import {
  getListAsync,
  selectFileAsync,
  uploadSelectedFiles,
  abortUploadFile,
  markUploadComplete,
  setProgressPercent,
  createLocalFolder,
  deleteSelectedLocalFiles,
  listLocalComplete,
  selectLocalFavFolder,
  addToFavFolders,
  removeLocalFavFolder,
  setLocalContext,
  resetContext
} from '../actions/localfiles';
import {
  disconnectS3,
  saveS3ConfAsync,
  selectS3FileAsync,
  getS3ListAsync,
  getS3UpAsync,
  deleteSelectedS3Files,
  downloadSelectedFiles,
  reloadS3ListAsync,
  createS3Folder,
  setS3Context
} from '../actions/s3files';
import {
  addToTransferLog
} from '../actions/general';
import HomePage from '../components/Home';

const mapStateToProps = (state: any) => {
  return { ...state.localfiles, ...state.s3files, ...state.general };
};

function mapDispatchToProps(dispatch: Dispatch) {
  return bindActionCreators(
    {
      getListAsync,
      selectFileAsync,
      disconnectS3,
      saveS3ConfAsync,
      selectS3FileAsync,
      getS3ListAsync,
      getS3UpAsync,
      uploadSelectedFiles,
      abortUploadFile,
      markUploadComplete,
      setProgressPercent,
      deleteSelectedS3Files,
      downloadSelectedFiles,
      reloadS3ListAsync,
      createS3Folder,
      createLocalFolder,
      deleteSelectedLocalFiles,
      addToTransferLog,
      listLocalComplete,
      selectLocalFavFolder,
      addToFavFolders,
      removeLocalFavFolder,
      setLocalContext,
      setS3Context,
      resetContext
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(HomePage);
