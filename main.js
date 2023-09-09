//	Funky Scoreboard
//	(C) 2023 kawashiro-ryofu
//	License: MPL-2.0
//	main.js	
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const version = 'v' + require(__dirname + '/package.json').version

require('./server/server')


function createWindow () {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    icon: './assests/favicon.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  })
  win.loadFile('index.html')
  win.setTitle(`Funky Scoreboard ${version}`)
  win.setMinimumSize(1024, 768)

  //  全屏状态
  ipcMain.handle('get-fullscreen-status', (event) => {
    const currentWindow = BrowserWindow.fromWebContents(event.sender);
    const isFullScreen = currentWindow.isFullScreen();
    return isFullScreen;
  });

  // 启用全屏模式
  ipcMain.on('enable-fullscreen', () => {
    win.setFullScreen(true);
  });

  // 关闭全屏模式
  ipcMain.on('disable-fullscreen', () => {
    if (win.isFullScreen()) {
      win.setFullScreen(false);
    }
  });


  ipcMain.on('suicide', () => {
    app.quit()
  });

}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

