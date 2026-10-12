/**
 * Electron Main Process for CERVIX-3D True Desktop Transparent Overlay
 * Creates a borderless, transparent, always-on-top fullscreen window across the user's primary display,
 * with dynamic click-through (setIgnoreMouseEvents) whenever the mouse is over empty desktop background!
 */
const { app, BrowserWindow, screen, ipcMain, globalShortcut } = require('electron');
const path = require('path');

let overlayWindow = null;

function createTransparentDesktopOverlay() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { x, y, width, height } = primaryDisplay.workArea;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x,
    y,
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

  // Production/ZIP mode works offline: no Vite server or localhost dependency.
  // For hot reload development, set VITE_DEV_SERVER_URL explicitly.
  if (process.env.VITE_DEV_SERVER_URL) {
    overlayWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    overlayWindow.loadFile(path.resolve(__dirname, '..', '点击开始游戏_CERVIX3D.html'));
  }

  // Recovery control on platforms where forwarded mousemove isn't supported:
  // Ctrl/Cmd+Alt+X toggles full click-through without losing the desktop overlay.
  let passingThrough = false;
  globalShortcut.register('CommandOrControl+Alt+X', () => {
    passingThrough = !passingThrough;
    overlayWindow.setIgnoreMouseEvents(passingThrough, { forward: true });
  });
}

app.whenReady().then(() => {
  createTransparentDesktopOverlay();
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
