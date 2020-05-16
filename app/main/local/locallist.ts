import { BrowserWindow } from 'electron';

const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);

export default class LocalList {
  pth: string;
  constructor(pth: string) {
    this.pth = pth;
    if(this.pth) this.listFiles();
  }

  listFiles = () => {
    console.log(`Listing local path ${this.pth}`);

    let win: any = BrowserWindow.getFocusedWindow();
    if (!win) win = BrowserWindow.getAllWindows()[0];

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
          return true;
        })
        .catch((err: any) => {
          console.log(err);
          return false;
        });
    } catch (err) {
      console.log(err);
    }
  };
}
