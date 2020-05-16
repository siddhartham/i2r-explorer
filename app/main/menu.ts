/* eslint @typescript-eslint/ban-ts-ignore: off */
import {
  app,
  Menu,
  BrowserWindow,
  ipcMain,
  MenuItemConstructorOptions
} from 'electron';

const path = require('path');

export default class MenuBuilder {
  mainWindow: BrowserWindow;
  localFilesCnt: number;
  s3FilesCnt: number;
  mouseContext: string;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.localFilesCnt = 0;
    this.s3FilesCnt = 0;
    this.mouseContext = '';
    ipcMain.on('RESET_CTX', (_event) => {
      this.mouseContext = '';
      this.setupContextMenu();
    });
    ipcMain.on('UPDATE_LOCAL_CTX', (_event, arg) => {
      this.localFilesCnt = arg.localFilesCnt;
      this.mouseContext = 'LOCAL';
      this.setupContextMenu();
    });
    ipcMain.on('UPDATE_S3_CTX', (_event, arg) => {
      this.s3FilesCnt = arg.s3FilesCnt;
      this.mouseContext = 'S3';
      this.setupContextMenu();
    });
  }

  getS3Menu(ctxMenu: any) {
    ctxMenu.push({ type: 'separator' });
    ctxMenu.push({
      label: 'Reload S3 folder',
      click: () => {
        this.mainWindow.webContents.send('CTX_S3_RELOAD_FILES');
      }
    });
    ctxMenu.push({ type: 'separator' });
    ctxMenu.push({
      label: 'Create folder in S3',
      click: () => {
        this.mainWindow.webContents.send('CTX_S3_CREATE_FOLDER');
      }
    });
    if (this.s3FilesCnt > 0) {
      ctxMenu.push({
        label: 'Download selected S3 files',
        click: () => {
          this.mainWindow.webContents.send('CTX_S3_DOWNLOAD_FILES');

        }
      });
      ctxMenu.push({ type: 'separator' });
      ctxMenu.push({
        label: 'Delete selected S3 files',
        click: () => {
          this.mainWindow.webContents.send('CTX_S3_DELETE_FILES');

        }
      });
    }
    return ctxMenu;
  }
  getLocalMenu(ctxMenu: any) {
    ctxMenu.push({ type: 'separator' });
    ctxMenu.push({
      label: 'Reload local folder',
      click: () => {
        this.mainWindow.webContents.send('CTX_LOCAL_RELOAD_FILES');
      }
    });
    ctxMenu.push({ type: 'separator' });
    ctxMenu.push({
      label: 'Create local folder',
      click: () => {
        this.mainWindow.webContents.send('CTX_LOCAL_CREATE_FOLDER');
      }
    });

    if (this.localFilesCnt > 0) {
      ctxMenu.push({
        label: 'Upload selected files',
        click: () => {
          this.mainWindow.webContents.send('CTX_S3_UPLOAD_FILES');

        }
      });
      ctxMenu.push({ type: 'separator' });
      ctxMenu.push({
        label: 'Delete selected files',
        click: () => {
          this.mainWindow.webContents.send('CTX_LOCAL_DELETE_FILES');

        }
      });
    }
    return ctxMenu;
  }

  buildMenu() {
    this.setupContextMenu();

    const template =
      process.platform === 'darwin'
        ? this.buildDarwinTemplate()
        : this.buildDefaultTemplate();

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    return menu;
  }

  buildContextMenuTemplate(props: any) {
    let ctxMenu = [];
    const { x, y } = props;
    if (
      process.env.NODE_ENV === 'development' ||
      process.env.DEBUG_PROD === 'true'
    ) {
      ctxMenu.push({
        label: 'Inspect element',
        click: () => {
          this.mainWindow.webContents.inspectElement(x, y);

        }
      });
    }

    if (this.mouseContext === 'LOCAL') ctxMenu = this.getLocalMenu(ctxMenu);
    if (this.mouseContext === 'S3') ctxMenu = this.getS3Menu(ctxMenu);

    return ctxMenu;
  }

  setupContextMenu() {
    this.mainWindow.webContents.on('context-menu', (_, props) => {
      // @ts-ignore
      Menu.buildFromTemplate(this.buildContextMenuTemplate(props)).popup({
        window: this.mainWindow
      });
    });
  }

  buildDarwinTemplate() {
    const subMenuAbout: MenuItemConstructorOptions = {
      label: 'i2rexplorer',
      submenu: [
        {
          label: 'About i2rexplorer',
          // @ts-ignore
          selector: 'orderFrontStandardAboutPanel:'
        },
        { type: 'separator' },
        { label: 'Services', submenu: [] },
        { type: 'separator' },
        {
          label: 'Hide i2rexplorer',
          accelerator: 'Command+H',
          // @ts-ignore
          selector: 'hide:'
        },
        {
          label: 'Hide Others',
          accelerator: 'Command+Shift+H',
          // @ts-ignore
          selector: 'hideOtherApplications:'
        },
        {
          label: 'Show All',
          // @ts-ignore
          selector: 'unhideAllApplications:'
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    };

    const subMenuWindow: MenuItemConstructorOptions = {
      label: 'Window',
      submenu: [
        {
          label: 'Minimize',
          accelerator: 'CmdOrCtrl+M',
          // @ts-ignore
          selector: 'performMiniaturize:'
        },
        {
          label: 'Close',
          accelerator: 'CmdOrCtrl+W',
          // @ts-ignore
          selector: 'performClose:'
        },
        { type: 'separator' },
        {
          label: 'Bring All to Front',
          // @ts-ignore
          selector: 'arrangeInFront:'
        }
      ]
    };

    const subMenuEdit: MenuItemConstructorOptions = {
      label: 'Edit',
      submenu: [
        {
          label: 'Cut',
          accelerator: 'CmdOrCtrl+X',
          // @ts-ignore
          selector: 'cut:'
        },
        {
          label: 'Copy',
          accelerator: 'CmdOrCtrl+C',
          // @ts-ignore
          selector: 'copy:'
        },
        {
          label: 'Paste',
          accelerator: 'CmdOrCtrl+V',
          // @ts-ignore
          selector: 'paste:'
        },
        {
          label: 'Select All',
          accelerator: 'CmdOrCtrl+A',
          // @ts-ignore
          selector: 'selectAll:'
        }
      ]
    };

    const subMenuViewDev: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            this.mainWindow.webContents.reload();
          }
        },
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        },
        {
          label: 'Toggle Developer Tools',
          accelerator: 'Alt+Command+I',
          click: () => {
            this.mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    };
    const subMenuViewProd: MenuItemConstructorOptions = {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Full Screen',
          accelerator: 'Ctrl+Command+F',
          click: () => {
            this.mainWindow.setFullScreen(!this.mainWindow.isFullScreen());
          }
        }
      ]
    };
    const subMenuView =
      process.env.NODE_ENV === 'development' ||
        process.env.DEBUG_PROD === 'true'
        ? subMenuViewDev
        : subMenuViewProd;

    return [subMenuAbout, subMenuEdit, subMenuView, subMenuWindow];
  }

  buildDefaultTemplate() {
    const templateDefault = [
      {
        label: '&View',
        submenu:
          process.env.NODE_ENV === 'development' ||
            process.env.DEBUG_PROD === 'true'
            ? [
              {
                label: '&Reload',
                accelerator: 'Ctrl+R',
                click: () => {
                  this.mainWindow.webContents.reload();
                }
              },
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen()
                  );
                }
              },
              {
                label: 'Toggle &Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click: () => {
                  this.mainWindow.webContents.toggleDevTools();
                }
              }
            ]
            : [
              {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click: () => {
                  this.mainWindow.setFullScreen(
                    !this.mainWindow.isFullScreen()
                  );
                }
              }
            ]
      }
    ];

    return templateDefault;
  }
}
