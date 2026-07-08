const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  // Check if we are running in development mode
  const isDev = process.argv.includes('--dev') || process.env.NODE_ENV === 'development';

  const mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    title: 'Hospital Management System (HMS)',
    icon: path.join(__dirname, 'public', 'logo.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false, // Security best practice: disable nodeIntegration
      contextIsolation: true,  // Security best practice: isolate context
    },
  });

  if (isDev) {
    // Load local Vite dev server
    mainWindow.loadURL('http://localhost:5173');
    // Open Developer Tools for debugging IndexedDB storage
    mainWindow.webContents.openDevTools();
  } else {
    // Load built index.html for production build
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.aurahealth.hms');
  }
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
