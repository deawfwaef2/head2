/**
 * Electron Main Process for CERVIX-3D True Desktop Transparent Overlay
 * Creates a borderless, transparent, always-on-top fullscreen window across the user's primary display,
 * with dynamic click-through (setIgnoreMouseEvents) whenever the mouse is over empty desktop background!
 */
const { app, BrowserWindow, screen, ipcMain } = require('electron');
const path = require('path');

let overlayWindow = null;

function createTransparentDesktopOverlay() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  overlayWindow.setAlwaysOnTop(true, 'screen-saver');

  // Dynamic mouse click-through: when cursor is over empty transparent desktop, pass clicks to OS apps below!
  ipcMain.on('cervix3d:set-ignore-mouse', (_event, ignore) => {
    if (!overlayWindow) return;
    if (ignore) {
      overlayWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      overlayWindow.setIgnoreMouseEvents(false);
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';
  overlayWindow.loadURL(devUrl);
}

app.whenReady().then(() => {
  createTransparentDesktopOverlay();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
