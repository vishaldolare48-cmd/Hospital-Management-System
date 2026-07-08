const { contextBridge } = require('electron');

// Expose a safe object to the React application context window
contextBridge.exposeInMainWorld('hmsDesktop', {
  isElectron: true
});
