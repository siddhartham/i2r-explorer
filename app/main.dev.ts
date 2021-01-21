/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 */
import { app, BrowserWindow, Tray, nativeImage } from 'electron';
import log from 'electron-log';
import path from 'path';
import MenuBuilder from './main/menu';
import { registerS3Functions } from './main/s3';
import { registerLocalFunctions } from './main/local';

app.allowRendererProcessReuse = true;

console.log = log.log;
log.catchErrors();

let isQuitting = false;
let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS', 'REDUX_DEVTOOLS'];

  return Promise.all(
    extensions.map(name => installer.default(installer[name], forceDownload))
  ).catch(console.error);
};

const createWindow = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    minWidth: 800,
    minHeight: 728,
    backgroundColor: '#212121',
    icon: path.join(__dirname, 'app.icns'),
    webPreferences:
      process.env.NODE_ENV === 'development' || process.env.E2E_BUILD === 'true'
        ? {
          nodeIntegration: true
        }
        : {
          preload: path.join(__dirname, 'dist/renderer.prod.js')
        }
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);
  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('minimize', function (event: any) {
    event.preventDefault();
    // mainWindow.hide();
  });
  // Keep the app running in background on close event
  mainWindow.on('close', e => {
    if (!isQuitting) {
      e.preventDefault();
      if (process.platform === 'darwin') {
        app.hide();
      } else {
        mainWindow?.hide();
      }
    }
    return false;
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  tray = new Tray(nativeImage.createFromDataURL("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAB/0lEQVQ4T8WTTU9TQRSGn7mf5bapLW1kQWzR4EcILgx+IMVgIBr3utGFa/+S/8CFLogmoGgjBtkY4kKjFhMQiAsiSG1LP27vvWPmtrRiGqMrZzOTmTnPmXPmfcWruzOS9pCed7DsOQtdb+0L0TkXCiB9j6YfYFkmQmhI2WG2LgbBoSC32cTUNYRuEAJc1yV74xb17a949SraQSYVrBuYTgwpg5ClktmpATbmH2FZFmLxzpTUTJPE2Qt8WsqTOTGMXy2rd4IM8N0G34ol+kwdgaBUdxm5ep3vb5eRvt8FxE+NUvnymeO371HdWkMVoTI39nYoPJ0lEXPCMqrVGscmptldWeoCVHNSY5MUFhcwDYGpaezs1xkdz2En06zm50hGFQD2qzUyuZnegM3XL4g6fWGte+UKQ+cvY/cfpbDw+N8BRQW4mMNKpP83IJ7k4/MnpKJR0MTf90CVkBkbx06kWZmbJe3YeFLiegGnp671buLWch6n3cQf5QrZS1eID4/gVUqhLpzBLOsP7hMbOklp9T1Bs9nSgfrG/nMTfHj5jHjEQiJpNH2Sjo0ZO6L0F/6M7sTYXF/jzOQ0xXdvWoCulG/S2N0O9Y2UCE3Hb9QI3EbHOIHvY0QcIgODbMw/bEn5kJlM87ALQ9P94jwhQk+47m9m6kS1Xag0/qchDKNz/BNYMC3mQgF5TQAAAABJRU5ErkJggg=="));
  tray.addListener('click', ()=>{
    mainWindow?.show();
  })
  tray.setToolTip(app.getName());

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  registerS3Functions();
  registerLocalFunctions();
};

/**
 * Add event listeners...
 */
app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  // enforceMacOSAppLocation();
  createWindow();
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow();
});

app.on('will-quit', () => {
  isQuitting = true;
});
app.on('before-quit', () => {
  isQuitting = true;
});
