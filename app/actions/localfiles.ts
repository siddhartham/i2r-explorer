import { GetState, Dispatch } from '../reducers/types';
import DataStore from '../utils/dataStore';

const { ipcRenderer } = require('electron');
const { app } = require('electron').remote;

const getDefaultFavouriteFolders = () => {
  return [
    {
      name: 'Home',
      icon: 'icon-home',
      clr: 'darkviolet'
    },
    {
      name: 'Desktop',
      icon: 'icon-monitor',
      clr: 'indigo'
    },
    {
      name: 'Documents',
      icon: 'icon-folder',
      clr: '#00bfff'
    },
    {
      name: 'Downloads',
      icon: 'icon-download',
      clr: 'green'
    },
    {
      name: 'Music',
      icon: 'icon-music',
      clr: '#adad03'
    },
    {
      name: 'Videos',
      icon: 'icon-video',
      clr: 'orange'
    },
    {
      name: 'Pictures',
      icon: 'icon-picture',
      clr: 'red'
    }
  ];
};

export const LOCALFILES_ACTION = 'LOCALFILES_ACTION';

const updateLocalFiles = (payload: any) => {
  return { type: LOCALFILES_ACTION, payload };
};

const getTotalProgressPercent = (progressPercent: any) => {
  let total = 0;
  let loaded = 0;
  Object.values(progressPercent).forEach(pp => {
    total += (pp as any).total;
    loaded += (pp as any).loaded;
  });
  return Math.ceil((loaded / total) * 100);
};

export const resetContext = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    ipcRenderer.send('RESET_CTX');
  };
}

export const setLocalContext = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { fileList } = getState().localfiles;

    let cnt = 0;
    for (let i = 0; i < fileList.length; i += 1) {
      if (fileList[i].isSelected) cnt += 1;
    }

    ipcRenderer.send('UPDATE_LOCAL_CTX', { localFilesCnt: cnt });
  };
}

export const listLocalComplete = (payload: any) => {
  return (dispatch: Dispatch, getState: GetState) => {
    dispatch(updateLocalFiles(payload));
  };
};

export const selectLocalFavFolder = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    ipcRenderer.send('LOCAL_SELECT_FOLDER');
  };
};

export const removeLocalFavFolder = (pth:any) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { favourites } = getState().localfiles;
    for (let idx = 0; idx < favourites.length; idx += 1) {
      if (favourites[idx].path === pth) {
        favourites.splice(idx, 1);
      }
    }
    DataStore.Save('favourites', favourites);
    const payload = {
      favourites: favourites,
      favouritesCount: favourites.length
    };
    dispatch(updateLocalFiles(payload));
  };
};

export const addToFavFolders = (args: any) => {
  return (dispatch: Dispatch, getState: GetState) => {
    console.log(args);
    const { favourites } = getState().localfiles;
    const defaultsFolders: any = getDefaultFavouriteFolders();
    const pth:any = args.folder;
    const bkmrk:any = args.bookmark;
    let defaultFound = false;
    for (let idx = 0; idx < defaultsFolders.length; idx += 1) {
      if (defaultsFolders[idx].name.toLowerCase() === pth.split('/').pop().toLowerCase()) {
        favourites.push({...defaultsFolders[idx], path:pth, bookmark: bkmrk});
        defaultFound = true;
        break;
      }
    }
    if (!defaultFound) {
      const tuples:any = pth.split('/');
      const t1:any = tuples.pop();
      const t2:any = tuples.pop();
      favourites.push({
        name: `..${t2}/${t1}`,
        path: pth,
        bookmark: bkmrk,
        icon: 'icon-folder',
        clr: '#00bfff'
      });
    }
    if(bkmrk) DataStore.Save('favourites', favourites); //Do not store if boobakr is not presnet
    const payload = {
      favourites: favourites,
      favouritesCount: favourites.length
    };
    dispatch(updateLocalFiles(payload));
  };
};

export const createLocalFolder = (folderName: any) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { currentPath } = getState().localfiles;
    ipcRenderer.send('LOCAL_CREATE_FOLDER', {
      pth: currentPath,
      name: folderName
    });
  };
};

export const deleteSelectedLocalFiles = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { fileList, uploadQueue } = getState().localfiles;

    const files: Array<string> = [];
    for (let i = 0; i < fileList.length; i += 1) {
      if (
        uploadQueue.lastIndexOf(fileList[i].path) === -1 &&
        fileList[i].isSelected
      ) {
        files.push(fileList[i].path);
      }
    }
    if (files.length > 0) {
      if (window.confirm('Are you sure you wish to delete this file(s) ?')) {
        for (let i = 0; i < files.length; i += 1) {
          ipcRenderer.send('LOCAL_DELETE_FILE', { pth: files[i] });
        }
      }
    }
  };
};

export const setProgressPercent = (
  pth: string,
  loaded: number,
  percent: number
) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { progressPercent } = getState().localfiles;
    progressPercent[pth] = {
      percent: percent,
      loaded: loaded,
      total: progressPercent[pth].total
    };

    const payload = {
      progressPercent: progressPercent,
      totalProgressPercent: getTotalProgressPercent(progressPercent)
    };
    dispatch(updateLocalFiles(payload));
  };
};

export const markUploadComplete = (pth: string) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { uploadQueue, fileList, progressPercent } = getState().localfiles;

    for (let i = 0; i < fileList.length; i += 1) {
      if (pth === fileList[i].path) fileList[i].isSelected = false;
    }

    const ucIndex: number = uploadQueue.lastIndexOf(pth);
    if (ucIndex !== -1) {
      uploadQueue.splice(ucIndex, 1);
    }

    progressPercent[pth] = {
      percent: 100,
      loaded: progressPercent[pth].loaded,
      total: progressPercent[pth].total
    };

    const payload = {
      fileList: fileList,
      seletedFileTT: new Date(),
      uploadQueue: uploadQueue,
      uploadQueueCnt: uploadQueue.length,
      progressPercent: progressPercent,
      totalProgressPercent: getTotalProgressPercent(progressPercent)
    };
    dispatch(updateLocalFiles(payload));
  };
};

export const abortUploadFile = (pth: string) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { uploadQueue, progressPercent } = getState().localfiles;

    const ucIndex: number = uploadQueue.lastIndexOf(pth);
    if (ucIndex !== -1) {
      uploadQueue.splice(ucIndex, 1);
      ipcRenderer.send('S3_ABORT_UPLOAD', { filePath: pth });
    }

    progressPercent[pth] = { percent: 0, loaded: 0, total: 0 };

    const payload = {
      uploadQueue: uploadQueue,
      uploadQueueCnt: uploadQueue.length,
      progressPercent: progressPercent,
      totalProgressPercent: getTotalProgressPercent(progressPercent)
    };
    dispatch(updateLocalFiles(payload));
  };
};

export const uploadSelectedFiles = () => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { fileList, uploadQueue, progressPercent } = getState().localfiles;
    const { s3Conf, s3Path, s3State } = getState().s3files;

    if (s3State !== 'connected') {
      alert('Please connect to S3');
      return;
    }

    const files: Array<string> = [];
    for (let i = 0; i < fileList.length; i += 1) {
      if (
        uploadQueue.lastIndexOf(fileList[i].path) === -1 &&
        fileList[i].isSelected
      ) {
        files.push(fileList[i].path);
        uploadQueue.push(fileList[i].path);
        progressPercent[fileList[i].path] = {
          percent: 1,
          loaded: 1,
          total: fileList[i].size
        };
      }
    }
    if (files.length > 0)
      ipcRenderer.send('S3_UPLOAD_FILES', { s3Conf, s3Path, files });
    const payload = {
      uploadQueue: uploadQueue,
      uploadQueueCnt: uploadQueue.length,
      progressPercent: progressPercent,
      totalProgressPercent: getTotalProgressPercent(progressPercent)
    };
    dispatch(updateLocalFiles(payload));
  };
};

export const selectFileAsync = (pth: string, isShift = false) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { fileList } = getState().localfiles;

    let cnt = 0;
    for (let i = 0; i < fileList.length; i += 1) {
      if (pth === fileList[i].path)
        fileList[i].isSelected = !fileList[i].isSelected;
      else if (isShift === false) fileList[i].isSelected = false;
      if (fileList[i].isSelected) cnt += 1;
    }

    const payload = { fileList: fileList, seletedFileTT: new Date() };
    dispatch(updateLocalFiles(payload));
  };
};

export const getListAsync = (pt: any = null, name: any = null, bkmrk: any = null) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { pathHistory, currentPath } = getState().localfiles;

    const pth = pt === null ? currentPath : pt;

    if (name) {
      for (let i = 0; i < pathHistory.length; i += 1) {
        const v = pathHistory[i];
        if (v.path === pth) pathHistory.splice(i, 1);
      }
      pathHistory.push({ name: name, path: pth });
      if (pathHistory.length > 10) pathHistory.splice(0, 1);

      const payload = { pathHistory: pathHistory };
      dispatch(updateLocalFiles(payload));
    }

    ipcRenderer.send('LOCAL_LIST_FILES', { pth: pth, bookmark: bkmrk });
  };
};
