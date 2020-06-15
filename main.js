'use strict';

// Modules to control application life and create native browser window
const { app, shell, BrowserWindow, Menu } = require('electron');
const path = require('path');

if(require('electron-squirrel-startup')) return;

require('update-electron-app')();

app.allowRendererProcessReuse = true;

const isMac = process.platform === 'darwin';

const helpMenu = {
  role: 'help',
  submenu: [
    {
      label: 'Learn More',
      click: async () => {
        await shell.openExternal('https://electronjs.org');
      },
    },
    ...(!isMac ? [
      { type: 'separator' },
      {
        role: 'about',
      },
    ] : []),
  ],
};

const menuTemplate = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  { role: 'fileMenu' },
  { role: 'editMenu' },
  { role: 'viewMenu' },
  { role: 'windowMenu' },
  helpMenu,
];

const menu = Menu.buildFromTemplate(menuTemplate);
Menu.setApplicationMenu(menu);

app.setAboutPanelOptions({
  iconPath: path.join(__dirname, 'resources/icon.png'),
});

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
