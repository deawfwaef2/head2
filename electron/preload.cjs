const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('cervixDesktopBridge', {
  isDesktop: true,
  setMode: mode => ipcRenderer.invoke('cervix3d:set-mode', mode),
  setIgnoreMouseEvents: ignore => ipcRenderer.send('cervix3d:set-ignore-mouse', Boolean(ignore)),
  centerManager: () => ipcRenderer.send('cervix3d:center-manager'),
  quit: () => ipcRenderer.send('cervix3d:quit'),
  onModeChange: callback => ipcRenderer.on('cervix3d:desktop-mode', (_event, mode) => callback(mode)),
  onCursorPoint: callback => ipcRenderer.on('cervix3d:cursor-screen-point', (_event, point) => callback(point))
});
