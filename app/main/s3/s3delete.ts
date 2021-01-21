import { BrowserWindow } from 'electron';

const AWS = require('aws-sdk');

export default class S3Delete {
  s3: any;
  s3Conf: any;
  s3Key: string;

  constructor(s3Conf: any, s3Key: string) {
    this.s3Conf = s3Conf;
    this.s3Key = s3Key;

    this.deleteFile();
  }

  deleteFile() {
    console.log(`Starting delete ${this.s3Key}`);

    let win: any = BrowserWindow.getFocusedWindow();
    if(!win) win = BrowserWindow.getAllWindows()[0];

    const params = {
      Bucket: this.s3Conf.bucket,
      Key: `${this.s3Key}`
    };
    this.s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      region: this.s3Conf.region,
      credentials: {
        accessKeyId: this.s3Conf.awsKey,
        secretAccessKey: this.s3Conf.secretKey
      }
    });

    this.s3.deleteObject(params, (err: any, data: any) => {
      if (err){
        console.error(err);
        win.webContents.send('S3_DELETE_CANCEL', {
          s3Path: this.s3Key,
          error: err.message
        });
        return;
      }
      win.webContents.send('S3_DELETE_COMPLETE', {
        s3Path: this.s3Key
      });
    });
  }
}
