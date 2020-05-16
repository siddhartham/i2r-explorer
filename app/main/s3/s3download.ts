import { BrowserWindow } from 'electron';

const { download } = require('electron-dl');

const AWS = require('aws-sdk');

export default class S3Download {
  s3: any;
  s3Conf: any;
  s3Key: string;
  localPath: string;
  dlObj: any;

  constructor(s3Conf: any, s3Key: string, localPath: string) {
    this.s3Conf = s3Conf;
    this.s3Key = s3Key;
    this.localPath = localPath;
  };

  async downloadFile() {
    console.log(`Starting download ${this.s3Key} =>  ${this.localPath}`);

    let win: any = BrowserWindow.getFocusedWindow();
    if(!win) win = BrowserWindow.getAllWindows()[0];

    const that = this;

    const { s3Key, localPath } = this;

    this.s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      region: this.s3Conf.region,
      credentials: {
        accessKeyId: this.s3Conf.awsKey,
        secretAccessKey: this.s3Conf.secretKey
      }
    });

    const params = {
      Bucket: this.s3Conf.bucket,
      Key: `${this.s3Key}`,
      Expires: 60
    };

    const signedUrl = this.s3.getSignedUrl('getObject', params);

    const options = {
      directory: this.localPath,
      showBadge: true,
      saveAs: false,
      onStarted: function (dl: any) {
        console.log(`Started = ${dl.getFilename()}`);
        that.dlObj = dl;
      },
      onProgress: function (status: any) {
        console.log(`Progress ${s3Key} => ${status.percent}%`);
      },
      onCancel: function (dl: any) {
        console.log(`Canceled ${s3Key} => ${dl.getFilename()}`);
        win.webContents.send('S3_DOWNLOAD_CANCEL', {
          filePath: localPath,
          s3Path: s3Key
        });
      }
    };

    try {
      await download(win, signedUrl, options);
      win.webContents.send('S3_DOWNLOAD_COMPLETE', {
        filePath: this.localPath,
        s3Path: this.s3Key
      });
    } catch (err) {
      console.log(err);
      win.webContents.send('S3_DOWNLOAD_CANCEL', {
        filePath: this.localPath,
        s3Path: this.s3Key,
        error: err.message
      });
    }
    return true;
  };

  abort() {
    if (this.dlObj) this.dlObj.cancel();
  };
}
