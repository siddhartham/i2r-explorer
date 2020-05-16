import { GetState, Dispatch } from '../reducers/types';

import DataStore from '../utils/dataStore';

export const GENERAL_ACTION = 'GENERAL_ACTION';

const saveGeneral = (payload: any) => {
  return { type: GENERAL_ACTION, payload };
};

export const saveSettings = (stg:any) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { s3Conf } = getState().s3files;
    Object.keys(stg).forEach((k)=>{
      DataStore.Save(k, stg[k]);
    })
    const payload = {
      ...stg
    };
    if(stg.autoConnectSetting==='clear'){
      DataStore.Del('s3Conf');
    }else{
      DataStore.Save('s3Conf', s3Conf);
    }
    dispatch(saveGeneral(payload));
  };
};

export const addToTransferLog = (entry:any) => {
  return (dispatch: Dispatch, getState: GetState) => {
    const { transferLogs, notifyOnUpload, notifyOnDownload } = getState().general;
    transferLogs.push(entry);

    const payload = {
      transferLogs: transferLogs
    };

    if(notifyOnDownload && entry.type==='Download'){
      new Notification(`Download ${entry.status}`, {
        body: `Download of file ${entry.s3} to ${entry.local} is ${entry.status}`
      });
    }
    if(notifyOnUpload && entry.type==='Upload'){
      new Notification(`Upload ${entry.status}`, {
        body: `Upload of file ${entry.local} to ${entry.s3} is ${entry.status}`
      });
    }

    DataStore.Save('transferLogs', transferLogs);
    dispatch(saveGeneral(payload));
  };
};
