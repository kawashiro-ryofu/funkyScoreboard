const { app, BrowserWindow } = require('electron')
const path = require('path')
const version = 'v' + require(__dirname + '/package.json').version
require('./server/server')

function createWindow () {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    icon: './assests/favicon.ico',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  })
  win.setMinimumSize(1280, 800)
  win.loadFile('index.html')
  win.setTitle(`Funky Scoreboard ${version}`)
  //win.setFullScreen(true)
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