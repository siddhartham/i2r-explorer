import { BrowserWindow, shell } from 'electron';

export default class LocalDelete {
  pth: string;
  constructor(pth: string) {
    this.pth = pth;
    this.deleteFile();
  }

  deleteFile = () => {
    console.log(`Delete local path ${this.pth}`);

    let win: any = BrowserWindow.getFocusedWindow();
    if (!win) win = BrowserWindow.getAllWindows()[0];

    try {
      shell.moveItemToTrash(this.pth);
    } catch (err) {
      console.log(err);
    }

    win.webContents.send('LOCAL_FILES_DELETE_COMPLETE', { pth: this.pth });
  };
}
