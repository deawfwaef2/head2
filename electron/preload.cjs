const { contextBridge, ipcRenderer } = require('electron');

let lastCursorPoint = { x: -1, y: -1 };
let currentDesktopMode = 'manager';
let pureFloatingHeadMode = true;
let previousFloorStyle = 'walnut_desk';

function isInteractiveOverlayElementAt(x, y) {
  if (typeof document === 'undefined' || x < 0 || y < 0) return false;
  const el = document.elementFromPoint(x, y);
  if (!el) return false;
  return Boolean(
    el.closest(
      '#cervix-real-pet-capsule, #structure-floating-hud, .specimen-placard-card, #hover-dossier-hud button, [data-pet-interactive="true"]'
    )
  );
}

function applyFloorStyleForOverlay(usePureFloating) {
  const floorSelect = document.getElementById('sel-floor-style');
  if (!floorSelect) return;
  if (usePureFloating) {
    if (floorSelect.value !== 'none') {
      previousFloorStyle = floorSelect.value || 'walnut_desk';
    }
    floorSelect.value = 'none';
    floorSelect.dispatchEvent(new Event('change', { bubbles: true }));
  } else {
    floorSelect.value = previousFloorStyle || 'walnut_desk';
    floorSelect.dispatchEvent(new Event('change', { bubbles: true }));
  }
  const btnFloor = document.getElementById('cervix-pet-btn-floor');
  if (btnFloor) {
    btnFloor.textContent = usePureFloating ? '🌌 纯人头穿透: 开' : '🪵 3D书桌架: 开';
  }
}

function ensureOverlayCapsuleDOM() {
  if (typeof document === 'undefined' || !document.body) return;
  if (document.getElementById('cervix-real-pet-capsule')) return;

  const style = document.createElement('style');
  style.id = 'cervix-real-pet-capsule-style';
  style.textContent = `
    #cervix-real-pet-capsule {
      position: fixed;
      top: 14px;
      right: 16px;
      z-index: 2147483646;
      display: none;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(15, 23, 42, 0.84);
      border: 1px solid rgba(212, 175, 55, 0.55);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(10px);
      font-family: system-ui, -apple-system, "Microsoft YaHei", sans-serif;
      user-select: none;
      pointer-events: auto;
      transition: opacity 0.2s ease, transform 0.2s ease;
      opacity: 0.42;
    }
    #cervix-real-pet-capsule:hover {
      opacity: 1 !important;
      transform: translateY(1px);
    }
    body.real-desktop-overlay #cervix-real-pet-capsule {
      display: inline-flex !important;
    }
    #cervix-real-pet-capsule .pet-cap-badge {
      font-size: 11px;
      font-weight: 700;
      color: #facc15;
      padding: 0 4px;
      letter-spacing: 0.03em;
    }
    #cervix-real-pet-capsule button {
      appearance: none;
      border: 1px solid rgba(148, 163, 184, 0.35);
      background: rgba(30, 41, 59, 0.9);
      color: #f8fafc;
      font-size: 11px;
      font-weight: 600;
      padding: 4px 9px;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.15s ease;
      white-space: nowrap;
    }
    #cervix-real-pet-capsule button:hover {
      background: rgba(212, 175, 55, 0.28);
      border-color: #facc15;
      color: #ffffff;
    }
    #cervix-real-pet-capsule button.danger:hover {
      background: rgba(239, 68, 68, 0.35);
      border-color: #f87171;
    }
  `;
  document.head.appendChild(style);

  const capsule = document.createElement('div');
  capsule.id = 'cervix-real-pet-capsule';
  capsule.setAttribute('data-pet-interactive', 'true');
  capsule.innerHTML = `
    <span class="pet-cap-badge" title="空白区域鼠标100%穿透到底层桌面软件；悬停3D人头或此胶囊可直接交互">🟢 屏幕桌宠穿透中</span>
    <button id="cervix-pet-btn-manager" title="展开完整 3D 建模工坊与典藏库窗口 (快捷键 Ctrl+Alt+M)">🗖 展开工坊</button>
    <button id="cervix-pet-btn-floor" title="切换【纯3D人头透明悬浮】或【显示3D胡桃木书架】">🌌 纯人头穿透: 开</button>
    <button id="cervix-pet-btn-placards" title="开关人头旁边的生前照片连接标牌">🏷️ 标牌</button>
    <button id="cervix-pet-btn-summon" title="一键召唤典藏库全部断头标本到桌面">✨ 召唤全员</button>
    <button id="cervix-pet-btn-quit" class="danger" title="退出桌面桌宠程序 (快捷键 Ctrl+Alt+X)">✕</button>
  `;
  document.body.appendChild(capsule);

  document.getElementById('cervix-pet-btn-manager')?.addEventListener('click', () => {
    const toggleBtn = document.getElementById('btn-toggle-window');
    if (toggleBtn && document.body.classList.contains('real-desktop-overlay')) {
      toggleBtn.click();
    } else {
      ipcRenderer.invoke('cervix3d:set-mode', 'manager');
    }
  });

  document.getElementById('cervix-pet-btn-floor')?.addEventListener('click', () => {
    pureFloatingHeadMode = !pureFloatingHeadMode;
    applyFloorStyleForOverlay(pureFloatingHeadMode);
  });

  document.getElementById('cervix-pet-btn-placards')?.addEventListener('click', () => {
    document.getElementById('btn-quick-placards')?.click();
  });

  document.getElementById('cervix-pet-btn-summon')?.addEventListener('click', () => {
    document.getElementById('btn-summon-all')?.click();
  });

  document.getElementById('cervix-pet-btn-quit')?.addEventListener('click', () => {
    ipcRenderer.send('cervix3d:quit');
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    ensureOverlayCapsuleDOM();
  });
}

contextBridge.exposeInMainWorld('cervixDesktopBridge', {
  isDesktop: true,
  setMode: (mode) => {
    currentDesktopMode = mode;
    ensureOverlayCapsuleDOM();
    if (mode === 'overlay') {
      const startOverlay = document.getElementById('start-game-overlay');
      if (startOverlay && !startOverlay.classList.contains('hidden')) {
        startOverlay.classList.add('hidden');
      }
      applyFloorStyleForOverlay(pureFloatingHeadMode);
    } else {
      applyFloorStyleForOverlay(false);
    }
    return ipcRenderer.invoke('cervix3d:set-mode', mode);
  },
  setIgnoreMouseEvents: (ignore) => {
    const overInteractiveDOM = isInteractiveOverlayElementAt(lastCursorPoint.x, lastCursorPoint.y);
    const finalIgnore = overInteractiveDOM ? false : Boolean(ignore);
    ipcRenderer.send('cervix3d:set-ignore-mouse', finalIgnore);
  },
  centerManager: () => ipcRenderer.send('cervix3d:center-manager'),
  quit: () => ipcRenderer.send('cervix3d:quit'),
  onModeChange: (callback) =>
    ipcRenderer.on('cervix3d:desktop-mode', (_event, mode) => {
      currentDesktopMode = mode;
      ensureOverlayCapsuleDOM();
      if (mode === 'overlay') {
        const startOverlay = document.getElementById('start-game-overlay');
        if (startOverlay && !startOverlay.classList.contains('hidden')) {
          startOverlay.classList.add('hidden');
        }
        applyFloorStyleForOverlay(pureFloatingHeadMode);
      } else {
        applyFloorStyleForOverlay(false);
      }
      callback(mode);
    }),
  onCursorPoint: (callback) =>
    ipcRenderer.on('cervix3d:cursor-screen-point', (_event, point) => {
      lastCursorPoint = point || { x: -1, y: -1 };
      callback(point);
    })
});
