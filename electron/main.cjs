/**
 * One renderer, two safe modes: a normal-sized management window and a transparent
 * desktop-pet layer. The latter is click-through except when the pointer hits a pet.
 * Emergency recovery: Ctrl/Cmd+Alt+M (or X), or the tray menu, restores manager.
 */
const { app, BrowserWindow, screen, ipcMain, globalShortcut, Menu, Tray, nativeImage, shell } = require('electron');
const path = require('path');

let window = null;
let tray = null;
let mode = 'manager';
let ignored = false;
let managerBounds = null;
let cursorTimer = null;

function setIgnore(ignore) {
  if (!window || window.isDestroyed() || ignored === ignore) return;
  ignored = ignore;
  window.setIgnoreMouseEvents(ignore, { forward: true });
}

function switchMode(next) {
  if (!window || window.isDestroyed() || !['overlay', 'manager'].includes(next)) return mode;
  if (mode === next) {
    if (next === 'manager') { setIgnore(false); window.show(); window.focus(); }
    return mode;
  }
  if (next === 'overlay') {
    // Preserve the last *real* window geometry, not the fullscreen overlay geometry.
    managerBounds = window.getBounds();
    mode = 'overlay';
    const bounds = screen.getDisplayMatching(managerBounds).workArea;
    window.setAlwaysOnTop(false);
    window.setBounds(bounds);
    window.setSkipTaskbar(true);
    window.setAlwaysOnTop(true, 'floating'); // Never 'screen-saver': don't cover full-screen apps.
    window.showInactive();
    setIgnore(true); // Fail safe: renderer errors must never block the desktop.
  } else {
    mode = 'manager';
    setIgnore(false);
    window.setAlwaysOnTop(false);
    window.setSkipTaskbar(false);
    window.setBounds(managerBounds || { width: 1180, height: 770, x: 80, y: 80 });
    window.show();
    window.focus();
  }
  window.webContents.send('cervix3d:desktop-mode', mode);
  updateTray();
  return mode;
}

function updateTray() {
  if (!tray) return;
  tray.setToolTip(mode === 'overlay' ? 'CERVIX-3D · 桌宠运行中 · 右键打开管理器' : 'CERVIX-3D · 典藏管理器');
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: '打开典藏管理器  Ctrl+Alt+M', click: () => switchMode('manager') },
    { label: '仅显示桌宠（桌面点击穿透）', click: () => switchMode('overlay') },
    { type: 'separator' },
    { label: '退出 CERVIX-3D', click: () => app.quit() }
  ]));
}

function createWindow() {
  const work = screen.getPrimaryDisplay().workArea;
  const width = Math.min(1180, work.width);
  const height = Math.min(770, work.height);
  managerBounds = {
    x: work.x + Math.floor((work.width - width) / 2),
    y: work.y + Math.floor((work.height - height) / 2), width, height
  };
  window = new BrowserWindow({
    ...managerBounds,
    transparent: true,
    backgroundColor: '#00000000',
    frame: false,
    resizable: true,
    alwaysOnTop: false,
    skipTaskbar: false,
    hasShadow: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  // Renderer source is local; no arbitrary external navigation inside the privileged window.
  window.webContents.setWindowOpenHandler(({ url }) => {
    try {
      const target = new URL(url);
      if (target.protocol === 'https:' && target.hostname === 'www.daz3d.com') shell.openExternal(target.href);
    } catch (_) {}
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', (event, url) => {
    const allowed = process.env.VITE_DEV_SERVER_URL || `file://${path.resolve(__dirname, '..', '点击开始游戏_CERVIX3D.html')}`;
    if (!url.startsWith(allowed)) event.preventDefault();
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    window.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(path.resolve(__dirname, '..', '点击开始游戏_CERVIX3D.html'));
  }
  window.on('closed', () => { window = null; });

  // Main-process cursor polling works even when the overlay ignores mouse events.
  // Forwarded pointermove alone is not available consistently on all platforms.
  cursorTimer = setInterval(() => {
    if (mode !== 'overlay' || !window || window.isDestroyed() || window.webContents.isLoading()) return;
    const point = screen.getCursorScreenPoint();
    const bounds = window.getBounds();
    window.webContents.send('cervix3d:cursor-screen-point', {
      x: point.x - bounds.x, y: point.y - bounds.y
    });
  }, 40);
  cursorTimer.unref?.();

  try {
    tray = new Tray(nativeImage.createFromPath(path.join(__dirname, 'tray.png')));
    tray.on('double-click', () => switchMode('manager'));
    tray.on('click', () => switchMode('manager'));
    updateTray();
  } catch (error) {
    console.warn('Tray unavailable; use Ctrl+Alt+M to reopen the manager:', error.message);
  }
}

app.whenReady().then(() => {
  createWindow();
  globalShortcut.register('CommandOrControl+Alt+M', () => switchMode('manager'));
  globalShortcut.register('CommandOrControl+Alt+X', () => switchMode('manager'));
});

function fromOurWindow(event) { return window && !window.isDestroyed() && event.sender === window.webContents; }
ipcMain.handle('cervix3d:set-mode', (event, next) => {
  if (!fromOurWindow(event)) return mode;
  return switchMode(next);
});
ipcMain.on('cervix3d:set-ignore-mouse', (event, ignore) => {
  if (fromOurWindow(event) && mode === 'overlay') setIgnore(Boolean(ignore));
});
ipcMain.on('cervix3d:center-manager', event => {
  if (fromOurWindow(event) && mode === 'manager') window.center();
});
ipcMain.on('cervix3d:quit', event => {
  if (fromOurWindow(event)) app.quit();
});
app.on('activate', () => switchMode('manager'));
app.on('will-quit', () => {
  if (cursorTimer) clearInterval(cursorTimer);
  globalShortcut.unregisterAll();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
