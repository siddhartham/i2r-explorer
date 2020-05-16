import { BrowserWindow } from 'electron';

const fs = require('fs');
const path = require('path');

export default class LocalCreate {
  pth: string;
  name: string;
  constructor(pth: string, name: string) {
    this.pth = pth;
    this.name = name;
    this.createFile();
  }

  createFile = () => {
    console.log(`Create local folder ${this.pth}`);

    let win: any = BrowserWindow.getFocusedWindow();
    if (!win) win = BrowserWindow.getAllWindows()[0];

    try {
      const dirpath = path.join(this.pth, this.name);
      fs.mkdir(dirpath, { recursive: true }, (err: any) => {
        if (err) throw err;
        win.webContents.send('LOCAL_FOLDER_CREATE_COMPLETE', { pth: dirpath });
      });
    } catch (err) {
      console.log(err);
    }
  };
}
