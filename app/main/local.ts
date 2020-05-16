import { ipcMain, dialog, BrowserWindow } from 'electron';
import LocalList from './local/locallist';
import LocalDelete from './local/localdelete';
import LocalCreate from './local/localcreate';

export const registerLocalFunctions = () => {
  ipcMain.on('LOCAL_LIST_FILES', (_event, arg) => {
    new LocalList(arg.pth);
  });
  ipcMain.on('LOCAL_DELETE_FILE', (_event, arg) => {
    new LocalDelete(arg.pth);
  });
  ipcMain.on('LOCAL_CREATE_FOLDER', (_event, arg) => {
    new LocalCreate(arg.pth, arg.name);
  });
  ipcMain.on('LOCAL_SELECT_FOLDER', (_event) => {
    let win: any = BrowserWindow.getFocusedWindow();
    if (!win) win = BrowserWindow.getAllWindows()[0];
    const fPth = dialog.showOpenDialogSync(win, { securityScopedBookmarks: true, properties: ['openDirectory', 'noResolveAliases', 'createDirectory', 'multiSelections'] });
    console.log("Selected Folders",fPth);
    win.webContents.send('LOCAL_SELECT_FOLDER_DONE', fPth);
  });
};
