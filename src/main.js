import { DEFAULT_COLLECTIBLES, DAZ_TUTORIAL_STEPS } from './data/defaultCollectibles.js';
import { DesktopBoxSpaceEngine } from './three/desktopBoxSpaceEngine.js';
import { StudioPreviewEngine } from './three/studioPreviewEngine.js';
import { renderAnatomyCrossSectionToCanvas } from './textures/anatomyTextureGenerator.js';
import { samplePhotoColors } from './textures/skinTextureGenerator.js';
import { soundEngine } from './audio/tactileSoundEngine.js';
import { createCollectibleFolderZip } from './data/offlineArchiveZip.js';
import { keepPrivateModel, isPrivateModel } from './data/privateModelStore.js';

// ============================================================================
// APPLICATION STATE
// ============================================================================
const STORAGE_KEY = 'cervix3d-collectibles-v1';
function restoreCollectibles() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return JSON.parse(JSON.stringify(DEFAULT_COLLECTIBLES));
    const byId = new Map(DEFAULT_COLLECTIBLES.map(item => [item.id, structuredClone(item)]));
    for (const item of saved) {
      if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') continue;
      // Blob URLs are bound to one browser session. Never persist a broken model reference.
      if (item.customModelUrl?.startsWith('blob:')) item.customModelUrl = null;
      if (item.customHairUrl?.startsWith('blob:')) item.customHairUrl = null;
      byId.set(item.id, item);
    }
    return [...byId.values()];
  } catch (_) {
    return JSON.parse(JSON.stringify(DEFAULT_COLLECTIBLES));
  }
}
function persistCollectibles() {
  try {
    // Browser storage keeps offline file:// sessions usable after closing the page.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.collectibles));
    return true;
  } catch (_) { return false; }
}
const state = {
  collectibles: restoreCollectibles(),
  archiveItems: [],
  selectedArchiveIndex: 0,
  windowHidden: false,
  bgModeIndex: 0, // 0: os, 1: void, 2: transparent
  studioDraft: {
    basePreset: 'linxi',
    customModelUrl: null,
    customModelType: 'glb',
    customHairUrl: null,
    customHairType: 'glb',
    hairFit: { scale: 1, x: 0, y: 0, z: 0 },
    skinTone: '#f7d9cc',
    blushIntensity: 0.52,
    lipColor: '#d45868',
    irisColor: '#362015',
    hairStyle: 'long_straight',
    hairColor: '#131015',
    hairSheen: 0.90,
    neckClearance: 0.38,
    photoElement: null,
    photoBlend: 0.0,
    morphs: {
      jawVLine: 0.08,
      cheekSoftness: 0.12,
      noseBridge: 0.06,
      eyeAlmond: 0.10,
      lipFullness: 0.12,
      neckDiameter: 0.98,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C4 颈椎标准横断面 (含透明软骨气管环与蝴蝶形脊髓灰质)',
      vascularContrast: 1.15,
      dermisRimScale: 1.0,
      wetness: 0.82,
      showLabels: false
    }
  }
};

let desktopEngine = null;
let studioEngine = null;
let toastTimer = null;

function showToast(msg) {
  const el = document.getElementById('toast-notification');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3200);
}

// ============================================================================
// BUILT-IN REFERENCE PORTRAIT ILLUSTRATION GENERATOR (For Instant Semi-Auto Workflow)
// ============================================================================
function drawPresetReferencePortrait(canvas, preset = 'linxi') {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Studio portrait backdrop
  const bg = ctx.createRadialGradient(w * 0.5, h * 0.42, 12, w * 0.5, h * 0.5, w * 0.72);
  bg.addColorStop(0, '#273549');
  bg.addColorStop(1, '#0d1322');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cfg = preset === 'suwan'
    ? { skin: '#fae0d6', lip: '#de5466', iris: '#452719', jawW: 54, hair: '#18131a', hime: true }
    : preset === 'qianxue'
      ? { skin: '#f5d5c8', lip: '#b84656', iris: '#241713', jawW: 57, hair: '#110f14', updo: true }
      : { skin: '#f7d9cc', lip: '#d45868', iris: '#362015', jawW: 60, hair: '#131015', straight: true };

  const cx = w * 0.5;
  const cy = h * 0.48;

  // Back hair silhouette
  ctx.fillStyle = cfg.hair;
  if (!cfg.updo) {
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, 78, 118, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy - 18, 72, 0, Math.PI * 2);
    ctx.fill();
  }

  // Slender neck & anatomical cut guide line
  ctx.fillStyle = cfg.skin;
  ctx.fillRect(cx - 26, cy + 62, 52, 56);
  ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
  ctx.setLineDash([4, 3]);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 42, cy + 112);
  ctx.lineTo(cx + 42, cy + 112);
  ctx.stroke();
  ctx.setLineDash([]);

  // East Asian Female Face Contour
  ctx.beginPath();
  ctx.moveTo(cx - 62, cy - 22);
  ctx.quadraticCurveTo(cx - 64, cy + 32, cx - cfg.jawW * 0.65, cy + 58);
  ctx.quadraticCurveTo(cx, cy + 84, cx + cfg.jawW * 0.65, cy + 58);
  ctx.quadraticCurveTo(cx + 64, cy + 32, cx + 62, cy - 22);
  ctx.quadraticCurveTo(cx + 58, cy - 82, cx, cy - 84);
  ctx.quadraticCurveTo(cx - 58, cy - 82, cx - 62, cy - 22);
  ctx.closePath();
  ctx.fillStyle = cfg.skin;
  ctx.fill();

  // Brows, Almond Eyes & Lips
  for (const side of [-1, 1]) {
    const ex = cx + side * 26;
    const ey = cy - 10;
    // Brow
    ctx.strokeStyle = '#261b18';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx + side * 12, ey - 16);
    ctx.quadraticCurveTo(ex, ey - 21, cx + side * 44, ey - 14);
    ctx.stroke();

    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(ex, ey, 13, 6.5, -side * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cfg.iris;
    ctx.beginPath();
    ctx.arc(ex, ey, 5.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(ex - 2, ey - 2, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // Lips
  ctx.fillStyle = cfg.lip;
  ctx.beginPath();
  ctx.ellipse(cx, cy + 44, 16, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Front hair locks & alignment crosshair
  ctx.fillStyle = cfg.hair;
  if (cfg.hime) {
    ctx.fillRect(cx - 66, cy - 68, 18, 110);
    ctx.fillRect(cx + 48, cy - 68, 18, 110);
    ctx.fillRect(cx - 50, cy - 82, 100, 34);
  } else {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 84);
    ctx.quadraticCurveTo(cx - 64, cy - 55, cx - 66, cy + 25);
    ctx.lineTo(cx - 54, cy + 25);
    ctx.quadraticCurveTo(cx - 48, cy - 42, cx, cy - 68);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 84);
    ctx.quadraticCurveTo(cx + 64, cy - 55, cx + 66, cy + 25);
    ctx.lineTo(cx + 54, cy + 25);
    ctx.quadraticCurveTo(cx + 48, cy - 42, cx, cy - 68);
    ctx.fill();
  }

  // Facial Landmark Alignment Guides
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, 12); ctx.lineTo(cx, h - 12);
  ctx.moveTo(20, cy - 10); ctx.lineTo(w - 20, cy - 10);
  ctx.moveTo(30, cy + 44); ctx.lineTo(w - 30, cy + 44);
  ctx.stroke();

  // Copy to studio photo overlay canvas as well
  const overlayCanvas = document.getElementById('studio-photo-overlay');
  if (overlayCanvas) {
    const octx = overlayCanvas.getContext('2d');
    octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    octx.drawImage(canvas, 0, 0, overlayCanvas.width, overlayCanvas.height);
  }
}

// ============================================================================
// HOVER DOSSIER FLOATING WINDOW RENDERER
// ============================================================================
function updateHoverDossierHUD(hoverInfo) {
  const hud = document.getElementById('pet-hover-dossier');
  if (!hud) return;

  if (!hoverInfo) {
    hud.classList.add('hidden');
    return;
  }

  const col = hoverInfo.collectible;
  document.getElementById('hud-serial').textContent = col.id;
  document.getElementById('hud-grade').textContent = col.grade || 'SSR · 特级典藏';
  document.getElementById('hud-name').textContent = col.name;
  document.getElementById('hud-subtitle').textContent = col.subtitle || '';

  const modeBadge = document.getElementById('hud-mode-badge');
  if (hoverInfo.isRotationMode) {
    modeBadge.textContent = '🔄 360°旋转模式 (再点取消)';
    modeBadge.classList.add('rotating');
  } else {
    modeBadge.textContent = '👁️ 3D视线追随中';
    modeBadge.classList.remove('rotating');
  }

  document.getElementById('hud-pos-x').textContent = hoverInfo.positionCm.x;
  document.getElementById('hud-pos-y').textContent = hoverInfo.positionCm.y;
  document.getElementById('hud-pos-z').textContent = hoverInfo.positionCm.zMm;

  document.getElementById('hud-anatomy-level').textContent =
    col.anatomyOptions?.cutLevel || 'C4 颈椎标准横断面';
  document.getElementById('hud-anatomy-notes').textContent =
    col.dossier?.anatomyNotes || '';
  document.getElementById('hud-origin-notes').textContent =
    col.dossier?.origin || '';

  const tagsEl = document.getElementById('hud-tags');
  tagsEl.innerHTML = '';
  for (const t of (col.dossier?.tags || [])) {
    const span = document.createElement('span');
    span.className = 'dossier-tag';
    span.textContent = t;
    tagsEl.appendChild(span);
  }

  // Position HUD window smartly beside the 3D head pet without going off-screen
  const pad = 16;
  const hudW = 315;
  const hudH = 290;
  let left = hoverInfo.screenX + 24;
  if (left + hudW > window.innerWidth - pad) {
    left = hoverInfo.screenX - hudW - 85;
  }
  left = Math.max(pad, Math.min(window.innerWidth - hudW - pad, left));
  let top = Math.max(58, Math.min(window.innerHeight - hudH - pad, hoverInfo.screenY - 90));

  hud.style.left = `${left}px`;
  hud.style.top = `${top}px`;
  hud.classList.remove('hidden');
}

// ============================================================================
// VAULT & ACTIVE SCREEN PETS STRIP RENDERER
// ============================================================================
function renderVaultGrid() {
  const grid = document.getElementById('vault-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const activeSet = new Set(desktopEngine ? Array.from(desktopEngine.pets.keys()) : []);

  for (const item of state.collectibles) {
    const isSummoned = activeSet.has(item.id);
    const petEntry = desktopEngine ? desktopEngine.pets.get(item.id) : null;
    const isRotating = petEntry ? petEntry.isRotationMode : false;

    const card = document.createElement('div');
    card.className = `vault-card ${isSummoned ? 'summoned' : ''}`;
    card.innerHTML = `
      <div class="vault-card-top">
        <div>
          <span class="vault-serial">${item.id}</span>
          <span class="vault-grade">${item.grade || 'SSR'}</span>
        </div>
        <span class="vault-status ${isSummoned ? 'active' : ''}">
          ${isSummoned ? (isRotating ? '🔄 屏幕旋转鉴赏中' : '🟢 已在屏幕召唤') : '⚪ 典藏库待命'}
        </span>
      </div>
      <div>
        <div class="vault-title">${item.name}</div>
        <div class="vault-sub">${item.subtitle || ''}</div>
      </div>
      <div class="vault-anatomy-box">
        <strong>🩸 底座解剖断面：</strong>${item.anatomyOptions?.cutLevel || 'C4 标准横切面'}<br/>
        <span>${item.dossier?.anatomyNotes || ''}</span>
      </div>
      <div class="dossier-tags">
        ${(item.dossier?.tags || []).map(t => `<span class="dossier-tag">${t}</span>`).join('')}
      </div>
      <div class="vault-actions">
        <button class="btn ${isSummoned ? 'accent' : 'primary'}" data-vault-action="toggle-summon" data-id="${item.id}">
          ${isSummoned ? '📥 从屏幕收回' : '🚀 召唤至电脑屏幕'}
        </button>
        ${isSummoned ? `
          <button class="btn secondary" data-vault-action="toggle-rotate" data-id="${item.id}">
            ${isRotating ? '⏹️ 取消旋转模式' : '🔄 进入360°旋转模式'}
          </button>
        ` : ''}
        <button class="btn ghost" data-vault-action="load-studio" data-id="${item.id}">
          🛠️ 载入工坊精调/预览断面
        </button>
      </div>
    `;
    grid.appendChild(card);
  }

  grid.querySelectorAll('[data-vault-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.vaultAction;
      const id = btn.dataset.id;
      const col = state.collectibles.find(c => c.id === id);
      if (!col || !desktopEngine) return;

      if (action === 'toggle-summon') {
        if (desktopEngine.pets.has(id)) {
          desktopEngine.recallCollectible(id);
          showToast(`已从电脑屏幕收回藏品「${col.name}」`);
        } else {
          await desktopEngine.summonCollectible(col);
          showToast(`✨ 已将「${col.name}」召唤至电脑屏幕 3D 盒型空间！`);
        }
        renderVaultGrid();
      } else if (action === 'toggle-rotate') {
        desktopEngine.toggleRotationMode(id);
        renderVaultGrid();
      } else if (action === 'load-studio') {
        loadCollectibleIntoStudio(col);
        switchSoftwareTab('studio');
        showToast(`已将「${col.name}」载入半自动工坊`);
      }
    });
  });
}

function renderActivePetsStrip(summonedList = []) {
  const badge = document.getElementById('active-pet-count-badge');
  if (badge) badge.textContent = `${summonedList.length} 在屏`;

  const pillsContainer = document.getElementById('screen-pets-pills');
  if (!pillsContainer) return;
  pillsContainer.innerHTML = '';

  if (summonedList.length === 0) {
    pillsContainer.innerHTML = `<span style="font-size:11.5px;color:#94a3b8;">当前屏幕暂无桌宠，可在「典藏库」点击召唤至屏幕</span>`;
    return;
  }

  for (const p of summonedList) {
    const pill = document.createElement('div');
    pill.className = `pet-pill ${p.isRotationMode ? 'rotating' : ''}`;
    pill.innerHTML = `
      <strong>${p.name}</strong>
      <span class="pet-pill-meta">[Z:${p.zMm}mm]</span>
      <button class="pill-mini-btn" data-pill-rot="${p.id}">
        ${p.isRotationMode ? '🔄 旋转中(点此取消)' : '🔄 旋转模式'}
      </button>
      <button class="pill-mini-btn" data-pill-reset="${p.id}" title="重置角度">回正</button>
    `;
    pillsContainer.appendChild(pill);
  }

  pillsContainer.querySelectorAll('[data-pill-rot]').forEach(btn => {
    btn.addEventListener('click', () => {
      desktopEngine.toggleRotationMode(btn.dataset.pillRot);
      renderVaultGrid();
    });
  });
  pillsContainer.querySelectorAll('[data-pill-reset]').forEach(btn => {
    btn.addEventListener('click', () => {
      desktopEngine.resetPetOrientation(btn.dataset.pillReset);
    });
  });
}

// ============================================================================
// STUDIO CONTROLS & 2D ANATOMY ATLAS SYNC
// ============================================================================
function update2DAnatomyInspector() {
  const canvas = document.getElementById('anatomy-2d-preview');
  if (!canvas) return;
  renderAnatomyCrossSectionToCanvas(canvas, {
    skinColor: state.studioDraft.skinTone,
    vascularContrast: state.studioDraft.anatomyOptions.vascularContrast,
    dermisRimScale: state.studioDraft.anatomyOptions.dermisRimScale,
    showLabels: state.studioDraft.anatomyOptions.showLabels
  });
}

async function refreshStudio3DModel() {
  if (!studioEngine) return;
  await studioEngine.loadOrRebuild(state.studioDraft);
  update2DAnatomyInspector();
}

function loadCollectibleIntoStudio(col) {
  state.studioDraft = JSON.parse(JSON.stringify({
    basePreset: col.basePreset || 'linxi',
    customModelUrl: col.customModelUrl || null,
    customModelType: col.customModelType || 'glb',
    customHairUrl: col.customHairUrl || null,
    customHairType: col.customHairType || 'obj',
    hairFit: col.hairFit || { scale: 1, x: 0, y: 0, z: 0 },
    skinTone: col.skinTone || '#f7d9cc',
    blushIntensity: col.blushIntensity ?? 0.52,
    lipColor: col.lipColor || '#d45868',
    irisColor: col.irisColor || '#362015',
    hairStyle: col.hairStyle || 'long_straight',
    hairColor: col.hairColor || '#131015',
    hairSheen: col.hairSheen ?? 0.90,
    neckClearance: col.neckClearance ?? 0.38,
    photoElement: null,
    photoBlend: 0.0,
    morphs: { ...col.morphs },
    anatomyOptions: { ...col.anatomyOptions }
  }));

  document.getElementById('sel-base-preset').value = state.studioDraft.basePreset;
  document.getElementById('sel-hair-style').value = state.studioDraft.hairStyle;
  document.getElementById('col-skin').value = state.studioDraft.skinTone;
  document.getElementById('col-lip').value = state.studioDraft.lipColor;
  document.getElementById('col-iris').value = state.studioDraft.irisColor;
  document.getElementById('col-hair').value = state.studioDraft.hairColor;
  for (const prop of ['scale', 'x', 'y', 'z']) {
    const value = Number(state.studioDraft.hairFit[prop]) || (prop === 'scale' ? 1 : 0);
    document.getElementById(`hair-fit-${prop}`).value = String(value);
    document.getElementById(`hair-fit-${prop}-value`).textContent = prop === 'scale' ? `${Math.round(value * 100)}%` : value.toFixed(1);
  }
  if (isPrivateModel(col.customModelUrl)) {
    document.getElementById('custom-model-status').textContent = '🔒 本机私有高精模型（从浏览器仓库加载）；如清除了网站数据，请重新选原始 GLB。';
  }

  document.getElementById('inp-col-name').value = col.name;
  document.getElementById('inp-col-id').value = col.id;
  document.getElementById('inp-col-subtitle').value = col.subtitle || '';
  document.getElementById('inp-col-cutlevel').value = col.anatomyOptions?.cutLevel || '';
  document.getElementById('inp-col-notes').value = col.dossier?.anatomyNotes || '';

  refreshStudio3DModel().catch(error => showToast(`预览载入失败：${error.message}`));
}

// ============================================================================
// ARCHIVE DIRECTORY EXPLORER (/api/collectibles)
// ============================================================================
async function fetchAndRenderArchives() {
  try {
    if (window.location.protocol === 'file:') throw new Error('offline file mode');
    const resp = await fetch('/api/collectibles');
    const data = await resp.json();
    if (data.ok && Array.isArray(data.items)) {
      const serverIds = new Set(data.items.map(entry => entry.manifest?.id));
      state.archiveItems = [...data.items, ...state.collectibles
        .filter(item => !serverIds.has(item.id))
        .map(item => makeLocalArchiveEntry(item))];
      renderArchiveExplorer();
      return;
    }
  } catch (_) {}

  // Offline / file:// fallback: local records are real, but folder creation needs a download.
  state.archiveItems = state.collectibles.map(makeLocalArchiveEntry);
  renderArchiveExplorer();
}

function makeLocalArchiveEntry(item) {
  return {
    folderName: item.folderName || `${item.id}_${item.name}`,
    folderPath: `/collectibles/${item.folderName || item.id}`,
    manifest: item,
    dossierMd: `# 颅相典藏档案 · ${item.name} (${item.id})\n\n- **典藏编号**: \`${item.id}\`\n- **藏品名称**: ${item.name}\n- **副标题**: ${item.subtitle || ''}\n- **解剖断面**: ${item.anatomyOptions?.cutLevel || ''}\n\n## 骨相与解剖记录\n${item.dossier?.origin || ''}\n\n${item.dossier?.anatomyNotes || ''}`
  };
}

function renderArchiveExplorer() {
  const listEl = document.getElementById('archive-folder-list');
  if (!listEl) return;
  listEl.innerHTML = '';

  state.archiveItems.forEach((entry, idx) => {
    const div = document.createElement('div');
    div.className = `archive-folder-item ${idx === state.selectedArchiveIndex ? 'active' : ''}`;
    div.innerHTML = `
      <div class="arch-folder-name">📁 /collectibles/${entry.folderName}/</div>
      <div class="arch-folder-sub">${entry.manifest.name} · ${entry.manifest.anatomyOptions?.cutLevel || 'C4横断面'}</div>
    `;
    div.addEventListener('click', () => {
      state.selectedArchiveIndex = idx;
      renderArchiveExplorer();
    });
    listEl.appendChild(div);
  });

  const current = state.archiveItems[state.selectedArchiveIndex];
  if (current) {
    document.getElementById('arch-inspect-title').textContent = `📄 正在检视: /collectibles/${current.folderName}/`;
    document.getElementById('arch-dossier-content').textContent = current.dossierMd || '';
    document.getElementById('arch-manifest-content').textContent = JSON.stringify(current.manifest, null, 2);
  }
}

// ============================================================================
// TUTORIAL RENDERER
// ============================================================================
function renderTutorialTab() {
  const container = document.getElementById('tutorial-steps-container');
  if (!container) return;
  container.innerHTML = DAZ_TUTORIAL_STEPS.map(s => `
    <div class="tutorial-card">
      <span class="tut-step-badge">${s.step}</span>
      <h3>${s.title}</h3>
      <div class="tut-sub">${s.subtitle}</div>
      <div class="tut-list">
        ${s.content.map(line => `<p>${line}</p>`).join('')}
      </div>
      <div class="tut-protip">💡 <strong>实战技巧：</strong>${s.proTip}</div>
    </div>
  `).join('');
}

// ============================================================================
// TAB SWITCHING & WINDOW DRAGGING
// ============================================================================
function switchSoftwareTab(tabId) {
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });
  if (tabId === 'studio' && studioEngine) {
    setTimeout(() => studioEngine.resize(), 40);
  }
  if (tabId === 'archives') {
    fetchAndRenderArchives();
  }
}

function initWindowDragging() {
  const win = document.getElementById('software-window');
  const bar = document.getElementById('window-titlebar');
  if (!win || !bar) return;

  let dragging = false;
  let startX = 0, startY = 0, origLeft = 0, origTop = 0;

  bar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    dragging = true;
    const rect = win.getBoundingClientRect();
    win.style.transform = 'none';
    win.style.left = `${rect.left}px`;
    win.style.top = `${rect.top}px`;
    startX = e.clientX;
    startY = e.clientY;
    origLeft = rect.left;
    origTop = rect.top;
  });

  window.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const nx = Math.max(8, Math.min(window.innerWidth - 200, origLeft + (e.clientX - startX)));
    const ny = Math.max(46, Math.min(window.innerHeight - 100, origTop + (e.clientY - startY)));
    win.style.left = `${nx}px`;
    win.style.top = `${ny}px`;
  });

  window.addEventListener('pointerup', () => {
    dragging = false;
  });

  document.getElementById('win-btn-center').addEventListener('click', () => {
    win.style.left = '50%';
    win.style.top = '58px';
    win.style.transform = 'translateX(-50%)';
  });
}

// ============================================================================
// INITIALIZE EVERYTHING ON DOM READY
// ============================================================================
window.addEventListener('DOMContentLoaded', async () => {
  if (window.cervixDesktopBridge?.isDesktop) {
    document.body.classList.remove('bg-mode-os', 'bg-mode-void');
    document.body.classList.add('bg-mode-transparent', 'real-desktop-overlay');
    state.bgModeIndex = 2;
    document.getElementById('btn-quick-bg-mode').textContent = '✨ 背景: 透明桌面层';
  }
  // 1. Initialize Full-Screen 3D Perspective Box Space & Desktop Pet Engine
  const desktopCanvas = document.getElementById('desktop-pet-canvas');
  desktopEngine = new DesktopBoxSpaceEngine(desktopCanvas, {
    onHoverChange: updateHoverDossierHUD,
    onPetStateUpdate: (list) => {
      renderActivePetsStrip(list);
      renderVaultGrid();
    },
    onBoxCollisionVisual: (wall) => {
      const el = document.getElementById(`flash-${wall}`);
      if (el) {
        el.classList.add('active');
        setTimeout(() => el.classList.remove('active'), 260);
      }
    }
  });

  // Summon initial default collectibles onto the computer screen
  for (const item of state.collectibles) {
    if (item.summoned) {
      try {
        await desktopEngine.summonCollectible(item);
      } catch (error) {
        // Browser storage may have been cleared; still let the studio boot.
        console.warn(`无法恢复藏品「${item.name}」：${error.message}`);
      }
    }
  }
  renderVaultGrid();

  // 2. Initialize 3D Studio Preview Engine
  const studioCanvas = document.getElementById('studio-preview-canvas');
  studioEngine = new StudioPreviewEngine(studioCanvas);
  const refPhotoCanvas = document.getElementById('ref-photo-canvas');
  drawPresetReferencePortrait(refPhotoCanvas, 'linxi');
  await refreshStudio3DModel();

  // 3. Render Tutorial & Fetch Archives
  renderTutorialTab();
  fetchAndRenderArchives();
  initWindowDragging();

  // 4. Bind Start Game Overlay Buttons (Unlocks WebAudio & starts game)
  const startOverlay = document.getElementById('start-game-overlay');
  const btnStartPure = document.getElementById('btn-start-pure-desktop');
  const btnStartStudio = document.getElementById('btn-start-with-studio');

  if (btnStartPure) {
    btnStartPure.addEventListener('click', () => {
      if (startOverlay) startOverlay.classList.add('hidden');
      state.windowHidden = true;
      document.getElementById('software-window').classList.add('window-hidden');
      document.getElementById('btn-toggle-window').textContent = '🗖 展开 CERVIX-3D 软件主窗口';
      soundEngine.playSummon(true);
      showToast('🎮 已进入屏幕 3D 桌宠把玩模式！悬停看档案 | 单击模型切换360°旋转 | 滚轮推拉景深 | 拖拽碰撞盒壁');
    });
  }

  if (btnStartStudio) {
    btnStartStudio.addEventListener('click', () => {
      if (startOverlay) startOverlay.classList.add('hidden');
      state.windowHidden = false;
      document.getElementById('software-window').classList.remove('window-hidden');
      document.getElementById('btn-toggle-window').textContent = '🗕 隐藏软件窗口 (纯看屏幕桌宠)';
      soundEngine.playSummon(true);
      showToast('🛠️ 已进入 CERVIX-3D 典藏库与建模工坊！可随时点击右上角「隐藏软件窗口」看屏幕桌宠');
    });
  }

  // Bind Navigation Tabs & Desktop Shortcut Icons
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchSoftwareTab(btn.dataset.tab));
  });
  document.querySelectorAll('.os-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      state.windowHidden = false;
      document.getElementById('software-window').classList.remove('window-hidden');
      document.getElementById('btn-toggle-window').textContent = '🗕 隐藏软件窗口 (纯看屏幕桌宠)';
      switchSoftwareTab(icon.dataset.tab);
    });
  });

  // 5. Bind Top-Right Desktop Overlay Controls (Hide/Show Window, Grid, Background, Mute)
  const toggleWinBtn = document.getElementById('btn-toggle-window');
  const toggleWindowVisibility = () => {
    state.windowHidden = !state.windowHidden;
    document.getElementById('software-window').classList.toggle('window-hidden', state.windowHidden);
    toggleWinBtn.textContent = state.windowHidden
      ? '🗖 展开 CERVIX-3D 软件主窗口'
      : '🗕 隐藏软件窗口 (纯看屏幕桌宠)';
    if (state.windowHidden) {
      showToast('已隐藏软件窗口！现在您可以直接在电脑屏幕上拖拽3D头模、滚轮推拉景深、单击切换360°旋转模式');
    }
  };
  toggleWinBtn.addEventListener('click', toggleWindowVisibility);
  document.getElementById('win-btn-minimize').addEventListener('click', toggleWindowVisibility);

  document.getElementById('btn-quick-box-grid').addEventListener('click', (e) => {
    const modes = ['always', 'interaction', 'hidden'];
    const labels = { always: '📦 盒型透视网格: 常显', interaction: '📦 盒型透视网格: 交互显', hidden: '📦 盒型透视网格: 隐藏' };
    const nextIdx = (modes.indexOf(desktopEngine.settings.showBoxGrid) + 1) % modes.length;
    const nextMode = modes[nextIdx];
    desktopEngine.updateSettings({ showBoxGrid: nextMode });
    document.getElementById('sel-box-grid-mode').value = nextMode;
    document.getElementById('vanishing-point-hud').style.opacity = nextMode === 'hidden' ? '0' : '0.72';
    e.currentTarget.textContent = labels[nextMode];
  });

  document.getElementById('btn-quick-bg-mode').addEventListener('click', (e) => {
    const classes = ['bg-mode-os', 'bg-mode-void', 'bg-mode-transparent'];
    const names = ['🖥️ 背景: 仿真电脑桌面', '🌑 背景: 暗房标本展柜', '✨ 背景: 透明桌面层'];
    document.body.classList.remove(...classes);
    state.bgModeIndex = (state.bgModeIndex + 1) % classes.length;
    document.body.classList.add(classes[state.bgModeIndex]);
    document.getElementById('os-desktop-icons').style.display = state.bgModeIndex === 0 ? 'flex' : 'none';
    e.currentTarget.textContent = names[state.bgModeIndex];
  });

  document.getElementById('btn-quick-mute').addEventListener('click', (e) => {
    soundEngine.enabled = !soundEngine.enabled;
    e.currentTarget.textContent = soundEngine.enabled ? '🔊 物理音效: 开启' : '🔇 物理音效: 静音';
    if (soundEngine.enabled) soundEngine.playPickup(0);
  });

  // 6. Vault Banner Buttons
  document.getElementById('btn-summon-all').addEventListener('click', async () => {
    for (const col of state.collectibles) {
      if (!desktopEngine.pets.has(col.id)) {
        await desktopEngine.summonCollectible(col);
      }
    }
    renderVaultGrid();
    showToast('✨ 已将全部典藏头部桌宠召唤至电脑屏幕 3D 盒型空间！');
  });

  document.getElementById('btn-goto-register').addEventListener('click', () => {
    switchSoftwareTab('studio');
  });

  // 7. Studio Photo Upload, Preset Reference Photos & Semi-Auto Sampling
  document.querySelectorAll('[data-ref-photo]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-ref-photo]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const preset = btn.dataset.refPhoto;
      drawPresetReferencePortrait(refPhotoCanvas, preset);
      state.studioDraft.photoElement = refPhotoCanvas;
      document.getElementById('photo-status-badge').textContent = `内置参考照：${btn.textContent}`;
    });
  });

  document.getElementById('input-photo-upload').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const ctx = refPhotoCanvas.getContext('2d');
        ctx.clearRect(0, 0, refPhotoCanvas.width, refPhotoCanvas.height);
        ctx.drawImage(img, 0, 0, refPhotoCanvas.width, refPhotoCanvas.height);
        const overlayCanvas = document.getElementById('studio-photo-overlay');
        overlayCanvas.getContext('2d').drawImage(img, 0, 0, overlayCanvas.width, overlayCanvas.height);
        state.studioDraft.photoElement = img;
        document.getElementById('photo-status-badge').textContent = `已载入照片：${file.name}`;
        showToast(`📸 已载入参考照片「${file.name}」，可点击「半自动采样对位」提取肤色与骨相`);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btn-auto-sample-photo').addEventListener('click', async () => {
    const srcEl = state.studioDraft.photoElement || refPhotoCanvas;
    const sampled = samplePhotoColors(srcEl);
    state.studioDraft.skinTone = sampled.skinTone;
    document.getElementById('col-skin').value = sampled.skinTone;
    studioEngine.setCameraPreset('front');
    await refreshStudio3DModel();
    soundEngine.playSummon(true);
    showToast(`✨ 已从参考照片智能提取肤色 (${sampled.skinTone}) 并对齐正面骨相机位！`);
  });

  document.getElementById('chk-photo-overlay').addEventListener('change', (e) => {
    const overlay = document.getElementById('studio-photo-overlay');
    overlay.classList.toggle('hidden', !e.target.checked);
    if (e.target.checked) {
      studioEngine.setCameraPreset('front');
    }
  });

  document.getElementById('slider-overlay-opacity').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    document.getElementById('val-overlay-opacity').textContent = `${Math.round(v * 100)}%`;
    document.getElementById('studio-photo-overlay').style.opacity = String(v);
  });

  document.getElementById('slider-photo-uv-blend').addEventListener('input', async (e) => {
    const v = parseFloat(e.target.value);
    document.getElementById('val-photo-uv-blend').textContent = `${Math.round(v * 100)}%`;
    state.studioDraft.photoElement = state.studioDraft.photoElement || refPhotoCanvas;
    state.studioDraft.photoBlend = v;
    await refreshStudio3DModel();
  });

  // 8. External Daz GLB/OBJ Import & Test Scan GLB Button
  document.getElementById('input-model-upload').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const oldUrl = state.studioDraft.customModelUrl;
    const oldType = state.studioDraft.customModelType;
    const oldHair = state.studioDraft.customHairUrl;
    const status = document.getElementById('custom-model-status');
    status.textContent = `正在读取「${file.name}」…`;
    try {
      const url = await keepPrivateModel(file);
      state.studioDraft.customModelUrl = url;
      state.studioDraft.customModelType = file.name.toLowerCase().endsWith('.obj') ? 'obj' : 'glb';
      state.studioDraft.customHairUrl = null; // Never attach old hairstyle to a new head accidentally.
      await refreshStudio3DModel();
      status.textContent = `🔒 本机模型已保存：${file.name} · ${Math.round(file.size / 1024 / 1024)} MB · ${state.studioDraft.customModelType.toUpperCase()}（原始 PBR 材质保留；请旋转核对颈部切面）`;
      showToast(`已加载私人模型「${file.name}」；下一步可选配套头发、调发际线并注册收藏品。`);
    } catch (error) {
      state.studioDraft.customModelUrl = oldUrl;
      state.studioDraft.customModelType = oldType;
      state.studioDraft.customHairUrl = oldHair;
      status.textContent = `模型导入失败：${error.message}；建议使用含内嵌贴图的 .glb`;
      showToast(status.textContent);
    }
    e.target.value = '';
  });

  document.getElementById('input-hair-upload').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!state.studioDraft.customModelUrl || /mh_asian_female_head/.test(state.studioDraft.customModelUrl)) {
      showToast('请先导入你自己的头部 GLB，再选从同一场景导出的配套头发。');
      e.target.value = '';
      return;
    }
    const oldUrl = state.studioDraft.customHairUrl;
    const oldType = state.studioDraft.customHairType;
    try {
      state.studioDraft.customHairUrl = await keepPrivateModel(file);
      state.studioDraft.customHairType = file.name.toLowerCase().endsWith('.obj') ? 'obj' : 'glb';
      await refreshStudio3DModel();
      document.getElementById('private-asset-hint').textContent = `🔒 已保存配套头发：${file.name}；使用下方四个滑杆对齐发际线。`;
      showToast(`头发已加载：${file.name}；请在正面、45°和侧面检查贴合。`);
    } catch (error) {
      state.studioDraft.customHairUrl = oldUrl;
      state.studioDraft.customHairType = oldType;
      showToast(`头发导入失败：${error.message}`);
    }
    e.target.value = '';
  });

  for (const prop of ['scale', 'x', 'y', 'z']) {
    const slider = document.getElementById(`hair-fit-${prop}`);
    slider.addEventListener('input', () => {
      const value = Number(slider.value);
      state.studioDraft.hairFit[prop] = value;
      document.getElementById(`hair-fit-${prop}-value`).textContent = prop === 'scale' ? `${Math.round(value * 100)}%` : value.toFixed(1);
      studioEngine.updateHairFitFast(state.studioDraft.hairFit);
    });
  }

  document.getElementById('btn-test-scan-glb').addEventListener('click', async () => {
    if (state.studioDraft.customModelUrl === '/models/LeePerrySmith.glb') {
      state.studioDraft.customModelUrl = null;
      state.studioDraft.customHairUrl = null;
      document.getElementById('custom-model-status').textContent = '当前使用：内置 Daz 东亚女性高精细分头模 (9,160面)';
      showToast('已切换回内置 Daz 东亚女性高精细分头模');
    } else {
      state.studioDraft.customModelUrl = '/models/LeePerrySmith.glb';
      state.studioDraft.customModelType = 'glb';
      state.studioDraft.customHairUrl = null;
      document.getElementById('custom-model-status').textContent = '当前使用：外部高精三维人头扫描模型 (LeePerrySmith.glb + 自动颈部解剖封口)';
      showToast('🧪 已载入真实 3D 扫描头模 (.glb)，演示自动颈部截断与 C4 医学解剖断面封口！');
    }
    await refreshStudio3DModel();
  });

  // 8b. CC0 MakeHuman Asian female head (+ hair) preset
  const loadMHHead = async (hairFile, label) => {
    state.studioDraft.basePreset = 'mh_asian';
    state.studioDraft.customModelUrl = '/models/mh_asian_female_head.obj';
    state.studioDraft.customModelType = 'obj';
    state.studioDraft.customHairUrl = hairFile ? `/models/${hairFile}` : null;
    document.getElementById('sel-base-preset').value = 'mh_asian';
    document.getElementById('custom-model-status').textContent = `当前使用：MakeHuman 亚洲女性高精3D头模 (含独立3D眼球/睫毛 + C4解剖断面 + ${label})`;
    showToast(`🧬 已载入 CC0 亚洲女性3D头雕（${label}），支持实时调节五官滑块、肤色唇色瞳色与解剖断面！`);
    await refreshStudio3DModel();
  };
  document.getElementById('btn-mh-bob')?.addEventListener('click', () => loadMHHead('mh_hair_bob02.obj', '波波头 + 分层鬓发'));
  document.getElementById('btn-mh-long')?.addEventListener('click', () => loadMHHead('mh_hair_long01.obj', '柔顺长发 + 分层鬓发'));
  document.getElementById('btn-mh-ponytail')?.addEventListener('click', () => loadMHHead('mh_hair_ponytail01.obj', '低马尾 + 分层鬓发'));

  // 9. Studio Camera Preset Buttons & Anatomy Labels Checkbox
  document.querySelectorAll('[data-cam]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-cam]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      studioEngine.setCameraPreset(btn.dataset.cam);
    });
  });

  document.getElementById('chk-anatomy-labels').addEventListener('change', async (e) => {
    state.studioDraft.anatomyOptions.showLabels = e.target.checked;
    await refreshStudio3DModel();
  });

  // 10. Studio Morph Sliders, Colors & Hair Controls
  document.getElementById('sel-base-preset').addEventListener('change', async (e) => {
    state.studioDraft.customModelUrl = null;
    state.studioDraft.basePreset = e.target.value;
    const mh = e.target.value === 'mh_asian';
    state.studioDraft.customHairUrl = mh ? '/models/mh_hair_bob02.obj' : null;
    document.getElementById('custom-model-status').textContent = mh
      ? '当前使用：MakeHuman CC0 亚洲女性头雕 + 贴合式波波发（可点击下方切换长发/马尾）'
      : `当前使用：内置程序化东亚女性头雕 (${e.target.value})`;
    await refreshStudio3DModel();
  });

  const bindMorphSlider = (id, valId, key, unit = '') => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      state.studioDraft.morphs[key] = v;
      document.getElementById(valId).textContent = `${v >= 0 ? '+' : ''}${v.toFixed(unit === '°' || unit === 'cm' ? 1 : 2)}${unit}`;
      studioEngine.updateMorphsFast(state.studioDraft.morphs);
    });
  };

  bindMorphSlider('morph-jaw', 'val-morph-jaw', 'jawVLine');
  bindMorphSlider('morph-cheek', 'val-morph-cheek', 'cheekSoftness');
  bindMorphSlider('morph-nose', 'val-morph-nose', 'noseBridge');
  bindMorphSlider('morph-eye', 'val-morph-eye', 'eyeAlmond');
  bindMorphSlider('morph-lip', 'val-morph-lip', 'lipFullness');
  bindMorphSlider('morph-cut-height', 'val-cut-height', 'cutHeightOffset', 'cm');
  bindMorphSlider('morph-cut-pitch', 'val-cut-pitch', 'cutTiltPitch', '°');

  for (const [id, key] of [
    ['col-skin', 'skinTone'],
    ['col-lip', 'lipColor'],
    ['col-iris', 'irisColor'],
    ['col-hair', 'hairColor']
  ]) {
    document.getElementById(id).addEventListener('input', async (e) => {
      state.studioDraft[key] = e.target.value;
      await refreshStudio3DModel();
    });
  }

  document.getElementById('sel-hair-style').addEventListener('change', async (e) => {
    if (isPrivateModel(state.studioDraft.customModelUrl)) {
      showToast('自备高精模型请使用上方「选配套头发」，这里的旧程序化发型无法自动贴合。');
      e.target.value = state.studioDraft.hairStyle;
      return;
    }
    state.studioDraft.hairStyle = e.target.value;
    state.studioDraft.customHairUrl = null;
    await refreshStudio3DModel();
  });

  document.getElementById('slider-hair-sheen').addEventListener('input', async (e) => {
    const v = parseFloat(e.target.value);
    state.studioDraft.hairSheen = v;
    document.getElementById('val-hair-sheen').textContent = `${Math.round(v * 100)}%`;
    await refreshStudio3DModel();
  });

  document.getElementById('slider-neck-clearance').addEventListener('input', async (e) => {
    const v = parseFloat(e.target.value);
    state.studioDraft.neckClearance = v;
    document.getElementById('val-neck-clearance').textContent = `${Math.round(v * 100)}%`;
    await refreshStudio3DModel();
  });

  document.getElementById('slider-anatomy-wetness').addEventListener('input', async (e) => {
    const v = parseFloat(e.target.value);
    state.studioDraft.anatomyOptions.wetness = v;
    document.getElementById('val-anatomy-wetness').textContent = `${Math.round(v * 100)}%`;
    await refreshStudio3DModel();
  });

  // 11. Save Collectible Dossier, Generate Folder Archive & Summon to Screen
  document.getElementById('btn-save-and-summon').addEventListener('click', async () => {
    const name = document.getElementById('inp-col-name').value.trim() || '未命名藏品';
    const id = document.getElementById('inp-col-id').value.trim() || `SPEC-${Date.now().toString().slice(-4)}`;
    const subtitle = document.getElementById('inp-col-subtitle').value.trim();
    const grade = document.getElementById('sel-col-grade').value;
    const cutLevel = document.getElementById('inp-col-cutlevel').value.trim();
    const notes = document.getElementById('inp-col-notes').value.trim();

    const newCollectible = {
      id,
      folderName: `${id}_${name.split('·')[0].trim()}`,
      name,
      subtitle,
      grade,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      basePreset: state.studioDraft.basePreset,
      customModelUrl: state.studioDraft.customModelUrl,
      customModelType: state.studioDraft.customModelType,
      customHairUrl: state.studioDraft.customHairUrl,
      customHairType: state.studioDraft.customHairType,
      hairFit: { ...state.studioDraft.hairFit },
      skinTone: state.studioDraft.skinTone,
      blushIntensity: state.studioDraft.blushIntensity,
      lipColor: state.studioDraft.lipColor,
      irisColor: state.studioDraft.irisColor,
      hairStyle: state.studioDraft.hairStyle,
      hairColor: state.studioDraft.hairColor,
      hairSheen: state.studioDraft.hairSheen,
      neckClearance: state.studioDraft.neckClearance,
      morphs: { ...state.studioDraft.morphs },
      anatomyOptions: {
        ...state.studioDraft.anatomyOptions,
        cutLevel
      },
      dossier: {
        origin: `基于 ${state.studioDraft.basePreset === 'mh_asian' ? 'CC0 MakeHuman 亚洲女性头模' : state.studioDraft.customModelUrl ? '用户自备外部模型' : '内置程序化东亚女性头模'} 与照片半自动对位装配。`,
        anatomyNotes: notes,
        hairNotes: `发型 ${state.studioDraft.customHairUrl?.split('/').pop() || state.studioDraft.hairStyle}，光泽度 ${Math.round(state.studioDraft.hairSheen * 100)}%。`,
        tags: [state.studioDraft.basePreset === 'mh_asian' ? 'CC0 MakeHuman' : '3D头雕', cutLevel.slice(0, 10), grade.split('·')[0].trim(), '解剖断面']
      },
      summoned: true,
      boxPosition: {
        x: Math.round((Math.random() - 0.5) * 32),
        y: Math.round((Math.random() - 0.5) * 14),
        z: -160
      }
    };

    const existingIdx = state.collectibles.findIndex(c => c.id === id);
    if (existingIdx >= 0) {
      state.collectibles[existingIdx] = newCollectible;
    } else {
      state.collectibles.unshift(newCollectible);
    }

    const locallySaved = persistCollectibles();
    let folderCreated = false;
    // Vite desktop/dev mode can write an actual folder. file:// cannot write to disk silently.
    if (window.location.protocol !== 'file:') {
      try {
        const response = await fetch('/api/collectibles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectible: newCollectible })
        });
        folderCreated = response.ok && (await response.json()).ok === true;
      } catch (_) { /* Offline / static hosting: local storage remains available. */ }
    }
    await fetchAndRenderArchives();
    try {
      await desktopEngine.summonCollectible(newCollectible);
    } catch (error) {
      showToast(`已保存档案，但模型载入失败：${error.message}`);
      renderVaultGrid();
      return;
    }
    renderVaultGrid();

    const nextNum = state.collectibles.length + 1;
    document.getElementById('inp-col-id').value = `SPEC-2026-${String(nextNum).padStart(3, '0')}`;
    showToast(folderCreated
      ? `🎉 已创建 /collectibles/${newCollectible.folderName}/ 并召唤「${name}」！`
      : locallySaved
        ? `🎉「${name}」已在本浏览器保存并召唤；若要实体档案，请到档案页下载文件。`
        : `「${name}」已召唤；浏览器禁止本地存储，请到档案页下载备份。`);
  });

  // 12. Bind 3D Box Space, Vanishing Point & Tactile Sound Settings
  const vpHud = document.getElementById('vanishing-point-hud');
  const updateVpHudPosition = () => {
    const ox = desktopEngine.settings.vanishingPointOffsetX;
    const oy = desktopEngine.settings.vanishingPointOffsetY;
    vpHud.style.left = `${(0.5 + ox) * 100}%`;
    vpHud.style.top = `${(0.5 + oy) * 100}%`;
    document.getElementById('vp-coord-text').textContent =
      `(${Math.round(ox * 100)}%, ${Math.round(-oy * 100)}%)`;
    document.getElementById('vp-depth-range').textContent =
      `0 ~ -${desktopEngine.settings.boxMaxDepthMm}mm`;
  };

  document.getElementById('set-vp-x').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    document.getElementById('val-set-vp-x').textContent = `${Math.round(v * 100)}%`;
    desktopEngine.updateSettings({ vanishingPointOffsetX: v });
    updateVpHudPosition();
  });

  document.getElementById('set-vp-y').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    document.getElementById('val-set-vp-y').textContent = `${Math.round(v * 100)}%`;
    desktopEngine.updateSettings({ vanishingPointOffsetY: -v });
    updateVpHudPosition();
  });

  document.getElementById('set-box-depth').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    document.getElementById('val-set-box-depth').textContent = `${v} mm`;
    desktopEngine.updateSettings({ boxMaxDepthMm: v });
    updateVpHudPosition();
  });

  document.getElementById('set-box-width').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    document.getElementById('val-set-box-width').textContent = `${v} cm`;
    desktopEngine.updateSettings({ boxWidthCm: v });
  });

  document.getElementById('set-box-height').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    document.getElementById('val-set-box-height').textContent = `${v} cm`;
    desktopEngine.updateSettings({ boxHeightCm: v });
  });

  document.getElementById('set-fov').addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10);
    document.getElementById('val-set-fov').textContent = `${v}°`;
    desktopEngine.updateSettings({ fov: v });
  });

  document.getElementById('sel-box-grid-mode').addEventListener('change', (e) => {
    const mode = e.target.value;
    desktopEngine.updateSettings({ showBoxGrid: mode });
    vpHud.style.opacity = mode === 'hidden' ? '0' : '0.72';
  });

  document.getElementById('set-follow-intensity').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    document.getElementById('val-set-follow-intensity').textContent = `${Math.round(v * 100)}%`;
    desktopEngine.updateSettings({ followIntensity: v });
  });

  document.getElementById('set-wheel-step').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    document.getElementById('val-set-wheel-step').textContent = `${v.toFixed(1)}x`;
    desktopEngine.updateSettings({ wheelDepthStep: v });
  });

  document.getElementById('chk-pet-collision').addEventListener('change', (e) => {
    desktopEngine.updateSettings({ enablePetCollision: e.target.checked });
  });

  document.getElementById('chk-auto-reset-rot').addEventListener('change', (e) => {
    desktopEngine.updateSettings({ autoResetAfterRotate: e.target.checked });
  });

  // Sound Sliders & Test Buttons
  for (const [id, valId, prop] of [
    ['snd-master', 'val-snd-master', 'masterVolume'],
    ['snd-pickup', 'val-snd-pickup', 'pickupVolume'],
    ['snd-drag', 'val-snd-drag', 'dragVolume'],
    ['snd-collision', 'val-snd-collision', 'collisionVolume'],
    ['snd-depth', 'val-snd-depth', 'depthTickVolume']
  ]) {
    document.getElementById(id).addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      soundEngine[prop] = v;
      document.getElementById(valId).textContent = `${Math.round(v * 100)}%`;
    });
  }

  document.querySelectorAll('[data-test-sound]').forEach(btn => {
    btn.addEventListener('click', () => {
      const type = btn.dataset.testSound;
      if (type === 'pickup') soundEngine.playPickup(0);
      else if (type === 'collision_glass') soundEngine.playBoxWallCollision(0.95, 'front_glass', 0);
      else if (type === 'collision_wall') soundEngine.playBoxWallCollision(0.85, 'side', -0.6);
      else if (type === 'depth') soundEngine.playDepthTick(0.4, 0);
      else if (type === 'rotate') soundEngine.playRotationModeToggle(true, 0);
      else if (type === 'summon') soundEngine.playSummon(true);
    });
  });

  // 13. Archive Explorer Buttons (Summon from Archive / Download / Import)
  document.getElementById('btn-refresh-archives').addEventListener('click', fetchAndRenderArchives);

  document.getElementById('btn-arch-summon').addEventListener('click', async () => {
    const current = state.archiveItems[state.selectedArchiveIndex];
    if (!current || !current.manifest) return;
    await desktopEngine.summonCollectible(current.manifest);
    showToast(`🎯 已从目录档案 /collectibles/${current.folderName}/ 召唤「${current.manifest.name}」至屏幕！`);
  });

  document.getElementById('btn-arch-folder-zip').addEventListener('click', () => {
    const current = state.archiveItems[state.selectedArchiveIndex];
    if (!current?.manifest) return;
    const blob = createCollectibleFolderZip(current.folderName, current.manifest, current.dossierMd);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${current.folderName.replace(/[^\w\-\u4e00-\u9fff]/g, '_')}.zip`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    showToast('📦 档案文件夹已下载为 ZIP，解压可得到 manifest.json 和 dossier.md。');
  });

  document.getElementById('btn-arch-download').addEventListener('click', () => {
    const current = state.archiveItems[state.selectedArchiveIndex];
    if (!current || !current.manifest) return;
    const blob = new Blob([JSON.stringify(current.manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${current.folderName}.cervix3d.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('input-import-archive').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (!imported.id || !imported.name) throw new Error('Invalid archive format');
        const existing = state.collectibles.findIndex(item => item.id === imported.id);
        if (existing >= 0) state.collectibles[existing] = imported;
        else state.collectibles.unshift(imported);
        persistCollectibles();
        if (window.location.protocol !== 'file:') {
          try {
            await fetch('/api/collectibles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ collectible: imported })
            });
          } catch (_) { /* Local-only archive still works. */ }
        }
        await fetchAndRenderArchives();
        await desktopEngine.summonCollectible(imported);
        renderVaultGrid();
        showToast(`📤 已导入档案「${imported.name}」并召唤至电脑屏幕！`);
      } catch (err) {
        showToast(`导入失败：${err.message}`);
      }
    };
    reader.readAsText(file);
  });
});
