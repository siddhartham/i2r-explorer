import { BrowserWindow, app } from 'electron';

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);

export default class LocalList {
  pth: string;
  bookmark: string;
  constructor(pth: string, bookmark: string) {
    this.pth = pth;
    this.bookmark = bookmark;
    if(this.pth) this.listFiles();
  }

  listFiles = () => {
    console.log(`Listing local path ${this.pth}`);

    let win: any = BrowserWindow.getFocusedWindow();
    if (!win) win = BrowserWindow.getAllWindows()[0];

    let stopAccessingSecurityScopedResource:any = null;
    if(this.bookmark){
      stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(this.bookmark);
    }

    try {
      readdir(this.pth)
        .then((files: string | any[]) => {
          const fileList = [];
          for (let i = 0; i < files.length; i += 1) {
            const file = files[i];
            const fullPath = path.join(this.pth, file);
            const stat = fs.statSync(fullPath);
            if (stat.isFile() || stat.isDirectory()) {
              fileList.push({
                path: fullPath,
                name: file,
                extn: path.extname(file),
                isDir: stat.isDirectory(),
                isSelected: false,
                ...stat
              });
            }
          }
          const payload = {
            currentPath: this.pth,
            fileList: fileList,
            seletedFileTT: 0
          };
          win.webContents.send('LOCAL_FILES_LIST_COMPLETE', payload);
          if(stopAccessingSecurityScopedResource){
            stopAccessingSecurityScopedResource();
            stopAccessingSecurityScopedResource = null;
          }
          return true;
        })
        .catch((err: any) => {
          console.error(err);
          if(stopAccessingSecurityScopedResource){
            stopAccessingSecurityScopedResource();
            stopAccessingSecurityScopedResource = null;
          }
          return false;
        })
    } catch (err) {
      console.error(err);
      if(stopAccessingSecurityScopedResource){
        stopAccessingSecurityScopedResource();
        stopAccessingSecurityScopedResource = null;
      }
    } finally {
      if(stopAccessingSecurityScopedResource){
        stopAccessingSecurityScopedResource();
        stopAccessingSecurityScopedResource = null;
      }
    }
  };
}
