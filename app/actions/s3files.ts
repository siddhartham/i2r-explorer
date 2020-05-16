import { GetState, Dispatch } from '../reducers/types';
import DataStore from '../utils/dataStore';

const { ipcRenderer } = require('electron');

const AWS = require('aws-sdk');

export const S3FILES_ACTION = 'S3FILES_ACTION';

const updateS3Files = (payload: any) => {
  return { type: S3FILES_ACTION, payload };
};

const parseFileList = (pth: string, data: any) => {
  console.log(data);
  const files = data.CommonPrefixes.map(function(commonPrefix: any) {
    const prefix = commonPrefix.Prefix;
    const fileName = decodeURIComponent(prefix.replace(pth, ''));
    return {
      path: prefix,
      name: fileName,
      extn: fileName.split(".").pop(),
      isDir: true,
      size: 0
    };
  });
  for (let i = 0; i < data.Contents.length; i += 1) {
    const c = data.Contents[i];
    const fileName = decodeURIComponent(c.Key.replace(pth, ''));
    files.push({
      path: c.Key,
      name: fileName,
      extn: fileName.split(".").pop(),
      isDir: false,
      size: c.Size,
      isSelected: false
    });
  }
  return files;
};

export const setS3Context = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { s3Conf, s3FileList } = getState().s3files;

    let cnt = 0;
    for (let i = 0; i < s3FileList.length; i += 1) {
      if (s3FileList[i].isSelected) cnt += 1;
    }

    ipcRenderer.send('UPDATE_S3_CTX', { s3FilesCnt: cnt });
  };
}

export const deleteSelectedS3Files = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const payload = { s3State: 'reloading' };
    dispatch(updateS3Files(payload));

    const { s3Conf, s3FileList } = getState().s3files;
    const s3keys: Array<string> = [];
    for (let i = 0; i < s3FileList.length; i += 1) {
      if (s3FileList[i].isSelected) s3keys.push(s3FileList[i].path);
    }
    if (s3keys.length > 0) {
      if (window.confirm('Are you sure you wish to delete this file(s) ?')) {
        ipcRenderer.send('S3_DELETE_FILES', { s3Conf, s3keys });
      }
    }
  };
};

export const downloadSelectedFiles = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { s3Conf, s3FileList } = getState().s3files;
    const { currentPath } = getState().localfiles;

    const s3keys: Array<string> = [];
    for (let i = 0; i < s3FileList.length; i += 1) {
      if (s3FileList[i].isSelected) s3keys.push(s3FileList[i].path);
    }
    if (s3keys.length > 0)
      ipcRenderer.send('S3_DOWNLOAD_FILES', { s3Conf, s3keys, currentPath });
  };
};

export const createS3Folder = (folderName: any) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const payload = { s3State: 'reloading' };
    dispatch(updateS3Files(payload));

    const { s3Conf, s3Path } = getState().s3files;
    ipcRenderer.send('S3_UPLOAD_FILES', { s3Conf, s3Path, folderName });
  };
};

export const disconnectS3 = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const payload = { s3State: 'disconnected' };
    dispatch(updateS3Files(payload));
  };
};

export const selectS3FileAsync = (pth: string, isShift = false) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { s3FileList } = getState().s3files;

    let cnt = 0;
    for (let i = 0; i < s3FileList.length; i += 1) {
      if (pth === s3FileList[i].path)
        s3FileList[i].isSelected = !s3FileList[i].isSelected;
      else if (isShift === false) s3FileList[i].isSelected = false;
      if (s3FileList[i].isSelected) cnt += 1;
    }

    const payload = { s3FileList: s3FileList, seletedS3FileTT: new Date() };
    dispatch(updateS3Files(payload));
  };
};

export const saveS3ConfAsync = (conf: any) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const payload = { s3State: 'connecting' };
    dispatch(updateS3Files(payload));

    let { s3Conf } = getState().s3files;
    const { autoConnectSetting } = getState().general;

    s3Conf = { ...s3Conf, ...conf };
    if (autoConnectSetting !== 'clear') DataStore.Save('s3Conf', s3Conf);
    AWS.config.update({
      region: s3Conf.region,
      accessKeyId: s3Conf.awsKey,
      secretAccessKey: s3Conf.secretKey
    });
    const s3Connection: any = new AWS.S3({
      apiVersion: '2006-03-01',
      params: { Bucket: s3Conf.bucket }
    });
    s3Connection.listObjects({ Delimiter: '/', Prefix: '' }, function(
      err: any,
      data: any
    ) {
      if (err) {
        const payload = {
          s3Conf: s3Conf,
          s3State: 'disconnected',
          s3Connection: null
        };
        dispatch(updateS3Files(payload));
        alert(err.message);
      } else {
        const files = parseFileList('', data);
        const payload = {
          s3Conf: s3Conf,
          s3State: 'connected',
          s3Connection: s3Connection,
          s3FileList: files,
          seletedS3FileTT: 0
        };
        dispatch(updateS3Files(payload));
      }
    });
  };
};

export const getS3ListAsync = (pth: string) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const payload = { s3State: 'reloading' };
    dispatch(updateS3Files(payload));

    const { s3Connection } = getState().s3files;
    s3Connection.listObjects({ Delimiter: '/', Prefix: pth }, function(
      err: any,
      data: any
    ) {
      if (err) {
        const payload = { s3State: 'disconnected', s3Connection: null };
        dispatch(updateS3Files(payload));
        alert(err.message);
      } else {
        const files = parseFileList(pth, data);
        const payload = {
          s3State: 'connected',
          s3FileList: files,
          s3Path: pth,
          seletedS3FileTT: 0
        };
        dispatch(updateS3Files(payload));
      }
    });
  };
};

export const reloadS3ListAsync = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const payload = { s3State: 'reloading' };
    dispatch(updateS3Files(payload));

    const { s3Connection, s3Path } = getState().s3files;
    s3Connection.listObjects({ Delimiter: '/', Prefix: s3Path }, function(
      err: any,
      data: any
    ) {
      if (err) {
        const payload = { s3State: 'disconnected', s3Connection: null };
        dispatch(updateS3Files(payload));
        alert(err.message);
      } else {
        const files = parseFileList(s3Path, data);
        const payload = {
          s3State: 'connected',
          s3FileList: files,
          s3Path: s3Path,
          seletedS3FileTT: 0
        };
        dispatch(updateS3Files(payload));
      }
    });
  };
};

export const getS3UpAsync = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const payload = { s3State: 'reloading' };
    dispatch(updateS3Files(payload));

    const { s3Path, s3Connection } = getState().s3files;
    if (!s3Path) return;
    const seg = s3Path.split('/');
    seg.pop();
    seg.pop();
    const pth = seg.length === 0 ? '' : `${seg.join('/')}/`;

    s3Connection.listObjects({ Delimiter: '/', Prefix: pth }, function(
      err: any,
      data: any
    ) {
      if (err) {
        const payload = { s3State: 'disconnected', s3Connection: null };
        dispatch(updateS3Files(payload));
        alert(err.message);
      } else {
        const files = parseFileList(pth, data);
        const payload = {
          s3State: 'connected',
          s3FileList: files,
          s3Path: pth,
          seletedS3FileTT: 0
        };
        dispatch(updateS3Files(payload));
      }
    });
  };
};
