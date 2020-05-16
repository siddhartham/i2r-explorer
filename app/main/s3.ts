import { ipcMain } from 'electron';

import S3Upload from './s3/s3upload';
import S3Download from './s3/s3download';
import S3Delete from './s3/s3delete';

export const registerS3Functions = () => {
  const uploadObjs: any = {};

  ipcMain.on('S3_UPLOAD_FILES', (_event, arg) => {
    if (arg.folderName) {
      const u = new S3Upload(arg.s3Conf, arg.s3Path, `${arg.folderName}`, true);
      u.createFolder();
    } else {
      arg.files.forEach((filePath: string) => {
        uploadObjs[filePath] = new S3Upload(arg.s3Conf, arg.s3Path, filePath);
        uploadObjs[filePath].uploadFile();
      });
    }
  });

  ipcMain.on('S3_ABORT_UPLOAD', (_event, arg) => {
    console.log(`Abort upload ${arg.filePath}`);
    uploadObjs[arg.filePath].abort();
    delete uploadObjs[arg.filePath];
  });

  // TODO: can we make ke async ?
  const dlObjs: any = {};
  ipcMain.on('S3_DOWNLOAD_FILES', async (_event, arg) => {
    for (let i = 0; i < arg.s3keys.length; i += 1) {
      const s3key: string = arg.s3keys[i];
      const dlObj: S3Download = new S3Download(
        arg.s3Conf,
        s3key,
        arg.currentPath
      );
      dlObjs[s3key] = dlObj;
      await dlObj.downloadFile();
    }
  });

  ipcMain.on('S3_ABORT_DOWNLOAD', (_event, arg) => {
    if (dlObjs[arg.s3Key]) {
      console.log(`Abort download ${arg.s3Key}`);
      dlObjs[arg.s3Key].abort();
      delete dlObjs[arg.s3Key];
    }
  });

  ipcMain.on('S3_DELETE_FILES', (_event, arg) => {
    arg.s3keys.forEach((s3key: string) => {
      new S3Delete(arg.s3Conf, s3key);
    });
  });
};
