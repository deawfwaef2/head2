const { app, BrowserWindow, ipcMain, screen, Tray, Menu, globalShortcut, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

let win = null;
let tray = null;
let mode = 'manager';
let ignoringMouse = false;
let cursorTimer = null;

// Support starting directly in Pure Transparent Overlay mode via `--overlay` or `CERVIX_START_OVERLAY=1`
const startInOverlay =
  process.argv.includes('--overlay') || process.env.CERVIX_START_OVERLAY === '1';

function managerBounds() {
  const area = screen.getPrimaryDisplay().workArea;
  const width = Math.min(1260, Math.round(area.width * 0.84));
  const height = Math.min(820, Math.round(area.height * 0.86));
  return {
    x: Math.round(area.x + (area.width - width) / 2),
    y: Math.round(area.y + (area.height - height) / 2),
    width,
    height
  };
}

function setIgnoreMouse(ignore) {
  if (!win || win.isDestroyed() || mode !== 'overlay') return;
  const next = Boolean(ignore);
  if (next === ignoringMouse) return;
  ignoringMouse = next;
  win.setIgnoreMouseEvents(next, { forward: true });
}

function sendCursorPoint() {
  if (!win || win.isDestroyed() || mode !== 'overlay') return;
  const cursor = screen.getCursorScreenPoint();
  const bounds = win.getBounds();
  win.webContents.send('cervix3d:cursor-screen-point', {
    x: cursor.x - bounds.x,
    y: cursor.y - bounds.y
  });
}

function switchMode(next) {
  if (!win || win.isDestroyed()) return 'manager';
  mode = next === 'overlay' ? 'overlay' : 'manager';
  if (mode === 'overlay') {
    const area = screen.getPrimaryDisplay().workArea;
    win.setResizable(false);
    win.setSkipTaskbar(true);
    win.setAlwaysOnTop(true, 'screen-saver');
    win.setBounds(area);
    ignoringMouse = false;
    setIgnoreMouse(true);
    if (!cursorTimer) cursorTimer = setInterval(sendCursorPoint, 33);
  } else {
    if (cursorTimer) {
      clearInterval(cursorTimer);
      cursorTimer = null;
    }
    ignoringMouse = false;
    win.setIgnoreMouseEvents(false);
    win.setAlwaysOnTop(false);
    win.setSkipTaskbar(false);
    win.setResizable(true);
    win.setBounds(managerBounds());
    win.show();
    win.focus();
  }
  win.webContents.send('cervix3d:desktop-mode', mode);
  return mode;
}

function createTray() {
  const iconPath = path.join(__dirname, 'tray.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon);
  tray.setToolTip('CERVIX-3D 真实屏幕透明穿透桌宠 (Ctrl+Alt+M 切换模式)');

  const hdDemoPath = path.join(__dirname, '..', '画质提升', '点击打开_画质提升演示.html');
  const mainHtmlPath = path.join(__dirname, '..', '点击开始游戏_CERVIX3D.html');

  const menuTemplate = [
    { label: '🗖 展开 CERVIX-3D 软件主窗口', click: () => switchMode('manager') },
    { label: '🟢 切换纯屏幕透明穿透桌宠层 (Ctrl+Alt+M)', click: () => switchMode('overlay') },
    { type: 'separator' },
    {
      label: '📦 加载主程序 (点击开始游戏_CERVIX3D.html)',
      click: () => {
        if (win && !win.isDestroyed() && fs.existsSync(mainHtmlPath)) {
          switchMode('manager');
          win.loadFile(mainHtmlPath);
        }
      }
    }
  ];

  if (fs.existsSync(hdDemoPath)) {
    menuTemplate.push({
      label: '✨ 预览【画质提升演示.html】独立高画质舱',
      click: () => {
        if (win && !win.isDestroyed()) {
          switchMode('manager');
          win.loadFile(hdDemoPath);
        }
      }
    });
  }

  menuTemplate.push(
    { type: 'separator' },
    { label: '✕ 退出 CERVIX-3D 桌面桌宠 (Ctrl+Alt+X)', click: () => app.quit() }
  );

  tray.setContextMenu(Menu.buildFromTemplate(menuTemplate));
  tray.on('click', () => switchMode(mode === 'overlay' ? 'manager' : 'overlay'));
}

app.whenReady().then(() => {
  win = new BrowserWindow({
    ...managerBounds(),
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    win.loadURL(devUrl);
  } else {
    win.loadFile(path.join(__dirname, '..', '点击开始游戏_CERVIX3D.html'));
  }

  win.webContents.on('did-finish-load', () => {
    if (startInOverlay) {
      setTimeout(() => switchMode('overlay'), 450);
    }
  });

  createTray();
  globalShortcut.register('CommandOrControl+Alt+M', () =>
    switchMode(mode === 'overlay' ? 'manager' : 'overlay')
  );
  globalShortcut.register('CommandOrControl+Alt+X', () => app.quit());

  ipcMain.handle('cervix3d:set-mode', (_event, next) => switchMode(next));
  ipcMain.on('cervix3d:set-ignore-mouse', (_event, ignore) => setIgnoreMouse(ignore));
  ipcMain.on('cervix3d:center-manager', () => {
    if (win && !win.isDestroyed() && mode === 'manager') win.setBounds(managerBounds());
  });
  ipcMain.on('cervix3d:quit', () => app.quit());
});

app.on('will-quit', () => globalShortcut.unregisterAll());
app.on('window-all-closed', () => app.quit());
