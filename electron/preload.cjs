const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cervixDesktopBridge', {
  setIgnoreMouseEvents: (ignore) => {
    ipcRenderer.send('cervix3d:set-ignore-mouse', Boolean(ignore));
  }
});
