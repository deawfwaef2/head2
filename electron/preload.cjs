const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cervixDesktopBridge', {
  isDesktop: true,
  setIgnoreMouseEvents: (ignore) => {
    ipcRenderer.send('cervix3d:set-ignore-mouse', Boolean(ignore));
  }
});
