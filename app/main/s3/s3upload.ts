import { ipcMain, BrowserWindow } from 'electron';

const AWS = require('aws-sdk');
const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

export default class S3Upload {
  s3: any;
  s3mu: any;
  s3Conf: any;
  s3Path: string;
  filePath: string;

  constructor(s3Conf: any, s3Path: string, filePath: string, isFolder = false) {
    this.s3Conf = s3Conf;
    this.s3Path = s3Path;
    this.filePath = filePath;
    // if (isFolder)
    //   this.createFolder();
    // else
    //   this.uploadFile();
  };
  createFolder() {
    console.log(`Starting create folder ${this.filePath} => ${this.s3Path}`);

    let win: any = BrowserWindow.getFocusedWindow();
    if (!win) win = BrowserWindow.getAllWindows()[0];

    const { s3Path } = this;

    // Upload the stream
    const params = {
      Bucket: this.s3Conf.bucket,
      Key: `${this.s3Path}${path.basename(this.filePath)}/`,
      Body: ""
    };
    this.s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      region: this.s3Conf.region,
      credentials: {
        accessKeyId: this.s3Conf.awsKey,
        secretAccessKey: this.s3Conf.secretKey
      }
    });

    this.s3mu = this.s3.upload(params, function(err: any, data: any) {
      if (err){
        console.log(err, err.stack);
        win.webContents.send('S3_FOLDER_CREATE_CANCEL', {
          s3Path: s3Path,
          error: err.message
        });
        return;
      }
      win.webContents.send('S3_FOLDER_CREATE_COMPLETE', {
        s3Path: s3Path
      });
    });
  };
  uploadFile() {
    console.log(`Starting upload ${this.filePath} => ${this.s3Path}`);

    let win: any = BrowserWindow.getFocusedWindow();
    if(!win) win = BrowserWindow.getAllWindows()[0];

    const stat = fs.statSync(this.filePath);
    const totalSize = stat.size;

    const { s3Path, filePath } = this;

    const body = fs.createReadStream(this.filePath);
    // Upload the stream
    const params = {
      Bucket: this.s3Conf.bucket,
      Key: `${this.s3Path}${path.basename(this.filePath)}`,
      Body: body
    };
    this.s3 = new AWS.S3({
      apiVersion: '2006-03-01',
      region: this.s3Conf.region,
      credentials: {
        accessKeyId: this.s3Conf.awsKey,
        secretAccessKey: this.s3Conf.secretKey
      }
    });

    this.s3mu = this.s3.upload(params, function(err: any, data: any) {
      if (err) {
        console.log('An error occurred', err);
        win.webContents.send('S3_UPLOAD_CANCEL', {
          filePath: filePath,
          s3Path: s3Path,
          error: err.message
        });
        return;
      }
      console.log('Completed upload at', data.Location);
      win.webContents.send('S3_UPLOAD_COMPLETE', {
        filePath: filePath,
        s3Path: s3Path,
        data: data
      });
    });

    this.s3mu.on('httpUploadProgress', function (evt: any) {
      console.log('Progress:', evt.loaded, '/', totalSize);
      win.webContents.send('S3_UPLOAD_PROGRESS', {
        filePath: filePath,
        s3Path: s3Path,
        loaded: evt.loaded,
        progress: Math.ceil((evt.loaded / totalSize) * 100)
      });
    });
  };

  abort() {
    this.s3mu.abort();
  };
}
