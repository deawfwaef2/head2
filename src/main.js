import { DEFAULT_COLLECTIBLES, DAZ_TUTORIAL_STEPS } from './data/defaultCollectibles.js';
import { DesktopBoxSpaceEngine } from './three/desktopBoxSpaceEngine.js';
import { StudioPreviewEngine } from './three/studioPreviewEngine.js';
import { FORENSIC_EXPRESSION_PRESETS, updateHairSheen } from './three/collectibleHeadAssembler.js';
import { renderAnatomyCrossSectionToCanvas } from './textures/anatomyTextureGenerator.js';
import { samplePhotoColors } from './textures/skinTextureGenerator.js';
import { soundEngine } from './audio/tactileSoundEngine.js';
import { keepPrivateModel, isPrivateModel } from './data/privateModelStore.js';
import { createCollectibleFolderZip } from './data/offlineArchiveZip.js';

// ============================================================================
// APPLICATION STATE
// ============================================================================
const STORAGE_KEY = 'cervix3d-collectibles-v2';
function restoreCollectibles() {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_COLLECTIBLES));
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return defaults;
    const byId = new Map(defaults.map(item => [item.id, item]));
    for (const item of saved) {
      if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') continue;
      // A blob URL is tied to a single tab. Never restore a dead reference.
      if (item.customModelUrl?.startsWith('blob:')) item.customModelUrl = null;
      byId.set(item.id, item);
    }
    return [...byId.values()];
  } catch (_) { return defaults; }
}
function persistCollectibles() {
  try {
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
    basePreset: 'user_photo',
    deadExpression: 'dead_calm',
    customModelUrl: null,
    customModelType: 'glb',
    skinTone: '#ffe9df',
    blushIntensity: 0.25,
    lipColor: '#bf6872',
    irisColor: '#3b2014',
    hairStyle: 'groom_photo_tied',
    groomDensity: 6000,
    hairColor: '#191518',
    hairSheen: 0.88,
    neckClearance: 0.55,
    photoElement: null,
    photoBlend: 0.0,
    morphs: {
      deadExpression: 'dead_calm',
      jawOpen: 0.0,
      eyeRollUp: 0.0,
      tongueOut: 0.0,
      jawSide: 0.0,
      bangsLength: 0.0,
      hairVolume: 0.0,
      jawVLine: 0.04,
      cheekSoftness: 0.16,
      noseBridge: 0.04,
      eyeAlmond: 0.08,
      lipFullness: 0.0,
      neckDiameter: 0.96,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C4–C5 颈椎鲜血横切面 (切缘凝血渗血态 + 气管软骨环 + 脊髓灰质)',
      vascularContrast: 1.28,
      dermisRimScale: 1.0,
      wetness: 0.92,
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
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

// ============================================================================
// BUILT-IN REFERENCE PORTRAIT ILLUSTRATION GENERATOR (For Instant Semi-Auto Workflow)
// ============================================================================
function drawPresetReferencePortrait(canvas, preset = 'user_photo') {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  if (preset === 'user_photo') {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, w, h);
      const scale = Math.max(w / img.width, h / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (w - dw) * 0.5, (h - dh) * 0.5, dw, dh);
      // Alignment guide lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(w * 0.5, 10); ctx.lineTo(w * 0.5, h - 10);
      ctx.moveTo(16, h * 0.44); ctx.lineTo(w - 16, h * 0.44);
      ctx.stroke();
      const overlayCanvas = document.getElementById('studio-photo-overlay');
      if (overlayCanvas) {
        const octx = overlayCanvas.getContext('2d');
        octx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        octx.drawImage(canvas, 0, 0, overlayCanvas.width, overlayCanvas.height);
      }
    };
    img.src = (typeof window !== 'undefined' && window.__EMBEDDED_REF_PHOTO__)
      ? window.__EMBEDDED_REF_PHOTO__
      : '/models/user_photo_ref.png';
  }

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
    modeBadge.textContent = '🪦 静止标本态 (单击360°旋转)';
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
    const curExpr = item.deadExpression || item.morphs?.deadExpression || 'dead_calm';

    const exprOptsHtml = FORENSIC_EXPRESSION_PRESETS.map(
      ep => `<option value="${ep.id}" ${ep.id === curExpr ? 'selected' : ''}>💀 ${ep.label}</option>`
    ).join('');

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
      <div class="field-row" style="margin: 4px 0;">
        <select class="vault-expr-select" data-vault-expr="${item.id}" style="width:100%;font-size:11.5px;padding:4px 6px;border-radius:6px;background:rgba(15,23,42,0.85);color:#e2e8f0;border:1px solid rgba(244,63,94,0.35);">
          ${exprOptsHtml}
        </select>
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

  grid.querySelectorAll('[data-vault-expr]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.vaultExpr;
      const exprId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      if (!col) return;
      col.deadExpression = exprId;
      col.morphs = { ...(col.morphs || {}), deadExpression: exprId };
      persistCollectibles();
      if (desktopEngine && desktopEngine.pets.has(id)) {
        desktopEngine.setPetExpression(id, exprId);
      }
      const ep = FORENSIC_EXPRESSION_PRESETS.find(p => p.id === exprId);
      showToast(`💀 已将「${col.name}」表情切换为：${ep ? ep.label : exprId}`);
    });
  });

  grid.querySelectorAll('[data-vault-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.vaultAction;
      const id = btn.dataset.id;
      const col = state.collectibles.find(c => c.id === id);
      if (!col || !desktopEngine) return;

      if (action === 'toggle-summon') {
        if (desktopEngine.pets.has(id)) {
          desktopEngine.recallCollectible(id);
          col.summoned = false;
          showToast(`已从电脑屏幕收回藏品「${col.name}」`);
        } else {
          try { await desktopEngine.summonCollectible(col); }
          catch (error) { showToast(`召唤失败：请重新导入「${col.name}」的原始模型。`); return; }
          col.summoned = true;
          showToast(`✨ 已将「${col.name}」召唤至电脑屏幕 3D 盒型空间！`);
        }
        persistCollectibles();
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
    const curExpr = p.deadExpression || 'dead_calm';
    const exprShortOpts = FORENSIC_EXPRESSION_PRESETS.map(
      ep => `<option value="${ep.id}" ${ep.id === curExpr ? 'selected' : ''}>💀${ep.shortLabel}</option>`
    ).join('');
    const pill = document.createElement('div');
    pill.className = `pet-pill ${p.isRotationMode ? 'rotating' : ''}`;
    pill.innerHTML = `
      <strong>${p.name}</strong>
      <span class="pet-pill-meta">[Z:${p.zMm}mm]</span>
      <select class="pill-mini-btn" data-pill-expr="${p.id}" title="切换死人表情" style="padding:1px 4px;background:rgba(15,23,42,0.9);color:#fda4af;border:1px solid rgba(244,63,94,0.4);border-radius:4px;">
        ${exprShortOpts}
      </select>
      <button class="pill-mini-btn" data-pill-rot="${p.id}">
        ${p.isRotationMode ? '🔄 旋转中(点此取消)' : '🔄 旋转模式'}
      </button>
      <button class="pill-mini-btn" data-pill-reset="${p.id}" title="重置角度">回正</button>
    `;
    pillsContainer.appendChild(pill);
  }

  pillsContainer.querySelectorAll('[data-pill-expr]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.pillExpr;
      const exprId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      if (col) {
        col.deadExpression = exprId;
        col.morphs = { ...(col.morphs || {}), deadExpression: exprId };
        persistCollectibles();
      }
      desktopEngine.setPetExpression(id, exprId);
      renderVaultGrid();
    });
  });
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

function formatAssetQuality(stats) {
  if (!stats) return '未取得模型信息';
  const tris = (stats.triangles || 0).toLocaleString('zh-HK');
  const texture = stats.maxTextureSize
    ? (stats.maxTextureSize >= 1024 ? `${(stats.maxTextureSize / 1024).toFixed(stats.maxTextureSize % 1024 ? 1 : 0)}K` : `${stats.maxTextureSize}px`)
    : '无可读贴图';
  if (stats.source === 'built-in-demo') {
    return `内置演示头模 · ${tris} 三角面 · 源贴图最大 ${texture} · 非 DAZ/扫描级资产`;
  }
  const maps = [
    stats.hasNormalMap ? '法线图' : '无内嵌法线图',
    stats.hasRoughnessMap ? '粗糙度图' : '无粗糙度图',
    stats.hasDisplacementMap ? '置换图' : '无置换图',
  ].join(' / ');
  return `用户 GLB · ${tris} 三角面 · 最大贴图 ${texture} · 保留原 PBR（${maps}）`;
}

async function refreshStudio3DModel() {
  if (!studioEngine) return;
  await studioEngine.loadOrRebuild(state.studioDraft);
  const status = document.getElementById('custom-model-status');
  if (status) {
    const groom = studioEngine.headNode?.userData?.groomStats;
    status.textContent = formatAssetQuality(studioEngine.headNode?.userData?.assetStats) + (groom ? ` · 新Groom：源 ${groom.sourceCurves.toLocaleString()} 曲线 / 实时 ${groom.renderedStrands.toLocaleString()} 发丝` : '');
    const groomStatus = document.getElementById('groom-quality-status');
    if (groomStatus) groomStatus.textContent = groom ? `曲线 Groom · ${groom.sourceCurves.toLocaleString()} 根源曲线 · 本预览 ${groom.renderedStrands.toLocaleString()} 根立体渐细发丝 · ${groom.triangles.toLocaleString()} 三角面` : '当前为旧版发型或外部资产，不适用新 Groom 密度控制。';
    status.title = '实时 PBR 的最终细节受原始网格密度、贴图分辨率和材质图完整度限制。';
  }
  update2DAnatomyInspector();
}

function syncStudioExpressionUI(exprId) {
  const sel = document.getElementById('sel-dead-expression');
  if (sel) sel.value = exprId;
  document.querySelectorAll('[data-dead-expr]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.deadExpr === exprId);
  });
}

function loadCollectibleIntoStudio(col) {
  const deadExpr = col.deadExpression || col.morphs?.deadExpression || 'dead_calm';
  state.studioDraft = JSON.parse(JSON.stringify({
    basePreset: col.basePreset || 'user_photo',
    deadExpression: deadExpr,
    customModelUrl: col.customModelUrl || null,
    customModelType: col.customModelType || 'glb',
    skinTone: col.skinTone || '#ffe9df',
    blushIntensity: col.blushIntensity ?? 0.25,
    lipColor: col.lipColor || '#bf6872',
    irisColor: col.irisColor || '#3b2014',
    hairStyle: col.hairStyle || 'groom_photo_tied',
    groomDensity: col.groomDensity || 6000,
    hairColor: col.hairColor || '#191518',
    hairSheen: col.hairSheen ?? 0.90,
    neckClearance: col.neckClearance ?? 0.38,
    photoElement: null,
    photoBlend: 0.0,
    morphs: {
      deadExpression: deadExpr,
      jawOpen: 0.0,
      eyeRollUp: 0.0,
      tongueOut: 0.0,
      jawSide: 0.0,
      bangsLength: 0.0,
      hairVolume: 0.0,
      ...(col.morphs || {})
    },
    anatomyOptions: { ...col.anatomyOptions }
  }));

  document.getElementById('sel-base-preset').value = state.studioDraft.basePreset;
  document.getElementById('sel-hair-style').value = state.studioDraft.hairStyle;
  document.getElementById('sel-groom-density').value = String(state.studioDraft.groomDensity || 6000);
  syncStudioExpressionUI(deadExpr);
  document.getElementById('col-skin').value = state.studioDraft.skinTone;
  document.getElementById('col-lip').value = state.studioDraft.lipColor;
  document.getElementById('col-iris').value = state.studioDraft.irisColor;
  document.getElementById('col-hair').value = state.studioDraft.hairColor;

  document.getElementById('inp-col-name').value = col.name;
  document.getElementById('inp-col-id').value = col.id;
  document.getElementById('inp-col-subtitle').value = col.subtitle || '';
  document.getElementById('inp-col-cutlevel').value = col.anatomyOptions?.cutLevel || '';
  document.getElementById('inp-col-notes').value = col.dossier?.anatomyNotes || '';

  refreshStudio3DModel();
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
      state.archiveItems = data.items;
      renderArchiveExplorer();
      return;
    }
  } catch (_) {}

  // Offline / file:// fallback: build archive items directly from state.collectibles
  state.archiveItems = state.collectibles.map(item => ({
    folderName: item.folderName || `${item.id}_${item.name}`,
    folderPath: `/collectibles/${item.folderName || item.id}`,
    manifest: item,
    dossierMd: `# 颅相典藏档案 · ${item.name} (${item.id})\n\n- **典藏编号**: \`${item.id}\`\n- **藏品名称**: ${item.name}\n- **副标题**: ${item.subtitle || ''}\n- **解剖断面**: ${item.anatomyOptions?.cutLevel || ''}\n\n## 骨相与解剖记录\n${item.dossier?.origin || ''}\n\n${item.dossier?.anatomyNotes || ''}`
  }));
  renderArchiveExplorer();
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
    if (window.cervixDesktopBridge?.isDesktop || e.target.closest('button')) return;
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
    if (window.cervixDesktopBridge?.isDesktop) {
      window.cervixDesktopBridge.centerManager();
      return;
    }
    win.style.left = '';
    win.style.right = '16px';
    win.style.top = '58px';
    win.style.transform = '';
    if (studioEngine) setTimeout(() => studioEngine.resize(), 60);
  });

  const toggleDockMode = () => {
    win.classList.toggle('window-dock-right');
    const isDocked = win.classList.contains('window-dock-right');
    const quickDockBtn = document.getElementById('btn-quick-dock-window');
    if (quickDockBtn) {
      quickDockBtn.textContent = isDocked ? '◧ 窗口: 右侧紧凑停靠' : '🗖 窗口: 宽屏工作台';
    }
    if (studioEngine) setTimeout(() => studioEngine.resize(), 180);
  };
  const winBtnDock = document.getElementById('win-btn-dock');
  if (winBtnDock) winBtnDock.addEventListener('click', toggleDockMode);
  const quickDockBtn = document.getElementById('btn-quick-dock-window');
  if (quickDockBtn) quickDockBtn.addEventListener('click', toggleDockMode);

  const winBtnGlass = document.getElementById('win-btn-glass');
  if (winBtnGlass) {
    winBtnGlass.addEventListener('click', () => {
      win.classList.toggle('window-glass');
      showToast(win.classList.contains('window-glass')
        ? '🌓 已开启半透明毛玻璃窗口模式，可直接透视后方3D盒型空间'
        : '已恢复标准不透明窗口模式');
    });
  }

  const quickPetsTopBtn = document.getElementById('btn-quick-pets-top');
  if (quickPetsTopBtn) {
    quickPetsTopBtn.addEventListener('click', () => {
      const nextTop = !desktopEngine.settings.petsAlwaysOnTop;
      desktopEngine.updateSettings({ petsAlwaysOnTop: nextTop });
      const canvas = document.getElementById('desktop-pet-canvas');
      if (canvas) canvas.classList.toggle('pets-behind-window', !nextTop);
      quickPetsTopBtn.classList.toggle('active-top', nextTop);
      quickPetsTopBtn.textContent = nextTop ? '📌 3D桌宠: 置顶最前' : '🖥️ 3D桌宠: 桌面背景层';
      showToast(nextTop
        ? '📌 3D桌宠已设为【置顶最前】：绝不被DAZ窗口遮挡，且可直接穿透拖拽/旋转！'
        : '🖥️ 3D桌宠已设为【桌面背景层】：位于软件窗口后方');
    });
  }
}

// In Electron, the ordinary manager and transparent desktop layer are distinct
// OS window modes. In the downloadable HTML this remains an in-page toggle.
function setWindowVisibility(hidden, fromMainProcess = false) {
  state.windowHidden = hidden;
  document.getElementById('software-window').classList.toggle('window-hidden', hidden);
  document.getElementById('btn-toggle-window').textContent = hidden
    ? '🗖 展开 CERVIX-3D 软件主窗口'
    : '🗕 隐藏软件窗口 (纯看屏幕桌宠)';
  const bridge = window.cervixDesktopBridge;
  if (bridge?.isDesktop) {
    document.body.classList.toggle('real-desktop-overlay', hidden);
    document.body.classList.toggle('real-desktop-manager', !hidden);
    if (!fromMainProcess) bridge.setMode(hidden ? 'overlay' : 'manager');
  }
}

// ============================================================================
// INITIALIZE EVERYTHING ON DOM READY
// ============================================================================
window.addEventListener('DOMContentLoaded', async () => {
  // Bind BEFORE expensive WebGL/GLB work: a first click must never be lost.
  // 4. Bind Start Game Overlay Buttons (Unlocks WebAudio & starts game)
  const startOverlay = document.getElementById('start-game-overlay');
  const btnStartPure = document.getElementById('btn-start-pure-desktop');
  const btnStartStudio = document.getElementById('btn-start-with-studio');

  if (btnStartPure) {
    btnStartPure.addEventListener('click', () => {
      if (startOverlay) startOverlay.classList.add('hidden');
      setWindowVisibility(true);
      soundEngine.playSummon(true);
      showToast('🎮 已进入屏幕 3D 桌宠把玩模式！悬停看档案 | 单击模型切换360°旋转 | 滚轮推拉景深 | 拖拽碰撞盒壁');
    });
  }

  if (btnStartStudio) {
    btnStartStudio.addEventListener('click', () => {
      if (startOverlay) startOverlay.classList.add('hidden');
      setWindowVisibility(false);
      soundEngine.playSummon(true);
      showToast('🛠️ 已进入 CERVIX-3D 典藏库与建模工坊！可随时点击右上角「隐藏软件窗口」看屏幕桌宠');
    });
  }

  const bootStatus = document.getElementById('boot-status');
  try {

  if (window.cervixDesktopBridge?.isDesktop) {
    document.body.classList.remove('bg-mode-os', 'bg-mode-void');
    document.body.classList.add('bg-mode-transparent', 'real-desktop-manager');
    window.cervixDesktopBridge.onModeChange(mode => setWindowVisibility(mode === 'overlay', true));
    document.getElementById('win-btn-close').addEventListener('click', () => window.cervixDesktopBridge.quit());
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

  if (window.cervixDesktopBridge?.isDesktop) {
    desktopEngine.updateSettings({ showBoxGrid: 'hidden' });
    // The main process polls the real cursor while the transparent OS window
    // ignores input; hit-testing restores input only over a 3D head or drag.
    window.cervixDesktopBridge.onCursorPoint(({ x, y }) => {
      if (!state.windowHidden) return;
      const inside = x >= 0 && y >= 0 && x < window.innerWidth && y < window.innerHeight;
      let hit = null;
      if (inside) {
        desktopEngine.updateMouseCoords({ clientX: x, clientY: y });
        hit = desktopEngine.pickPetAtCursor();
      }
      window.cervixDesktopBridge.setIgnoreMouseEvents(!(hit || desktopEngine.pointerDownInfo));
      if (!desktopEngine.pointerDownInfo) {
        desktopEngine.hoveredPetId = hit?.id || null;
        if (hit) desktopEngine.refreshHoverHUD();
        else updateHoverDossierHUD(null);
      }
    });
  }

  // Summon initial default collectibles onto the computer screen
  for (const item of state.collectibles) {
    if (item.summoned) {
      try { await desktopEngine.summonCollectible(item); }
      catch (error) { console.warn(`藏品「${item.name}」暂无法恢复：`, error); }
    }
  }
  renderVaultGrid();

  if (bootStatus) bootStatus.textContent = '桌宠已加载，正在准备建模工坊…';

  // 2. Initialize 3D Studio Preview Engine
  const studioCanvas = document.getElementById('studio-preview-canvas');
  studioEngine = new StudioPreviewEngine(studioCanvas);
  const refPhotoCanvas = document.getElementById('ref-photo-canvas');
  drawPresetReferencePortrait(refPhotoCanvas, 'user_photo');
  await refreshStudio3DModel();

  // Stage 8: headless visual-QA hook（无头浏览器截图验证/排障用，对正常游玩无任何影响）
  window.__cervixQA = {
    get desktop() { return desktopEngine; },
    get studio() { return studioEngine; },
    state,
  };

  // 3. Render Tutorial & Fetch Archives
  renderTutorialTab();
  fetchAndRenderArchives();
  initWindowDragging();

  // Bind Navigation Tabs & Desktop Shortcut Icons
  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => switchSoftwareTab(btn.dataset.tab));
  });
  document.querySelectorAll('.os-icon').forEach(icon => {
    icon.addEventListener('click', () => {
      setWindowVisibility(false);
      switchSoftwareTab(icon.dataset.tab);
    });
  });

  // 5. Bind Top-Right Desktop Overlay Controls (Hide/Show Window, Grid, Background, Mute)
  const toggleWinBtn = document.getElementById('btn-toggle-window');
  const toggleWindowVisibility = () => {
    setWindowVisibility(!state.windowHidden);
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
        try { await desktopEngine.summonCollectible(col); col.summoned = true; }
        catch (error) { console.warn(`召唤「${col.name}」失败`, error); }
      }
    }
    persistCollectibles();
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

  // 8. External Daz GLB/OBJ Import & Test Scan GLB Button
  document.getElementById('input-model-upload').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.glb')) {
      showToast('目前仅支持内嵌贴图的 .glb；OBJ/GLTF 附属文件不会自动读取。');
      e.target.value = '';
      return;
    }
    const previous = state.studioDraft.customModelUrl;
    const previousHairStyle = state.studioDraft.hairStyle;
    let reference = null;
    try {
      try { reference = await keepPrivateModel(file); }
      catch (storageError) {
        console.warn('无法持久化私人模型，仅保留当前会话', storageError);
        reference = URL.createObjectURL(file);
      }
      state.studioDraft.customModelUrl = reference;
      state.studioDraft.customModelType = 'glb';
      // Imported GLBs often already contain their own hair; built-in hair has
      // different coordinates and would visibly float through that head.
      state.studioDraft.hairStyle = 'none';
      document.getElementById('sel-hair-style').value = 'none';
      await refreshStudio3DModel();
      const saved = isPrivateModel(reference);
      const stats = studioEngine.headNode?.userData?.assetStats;
      document.getElementById('custom-model-status').textContent = `${file.name} · ${formatAssetQuality(stats)} · ${saved ? '已存本机 IndexedDB' : '仅当前会话'}`;
      document.getElementById('custom-model-status').title = '已统一头部显示尺寸并保留原 GLB 材质/贴图；请检查方向、颈口和所有贴图是否正确。';
      showToast(`已预览「${file.name}」。${saved ? '本浏览器可恢复；仍请保留原文件备份。' : '浏览器存储失败，关闭页面后需重新选择。'}`);
    } catch (error) {
      state.studioDraft.customModelUrl = previous;
      state.studioDraft.hairStyle = previousHairStyle;
      document.getElementById('sel-hair-style').value = previousHairStyle;
      if (reference?.startsWith('blob:')) URL.revokeObjectURL(reference);
      e.target.value = '';
      console.warn('头部 GLB 导入失败', error);
      const reason = String(error?.message || '文件无法解析').replace(/[<>]/g, '').slice(0, 150);
      document.getElementById('custom-model-status').textContent = `导入失败：${reason}`;
      showToast(`GLB 导入失败：${reason}`);
    }
  });

  const REAL_HAIRS = [
    { id: 'groom_photo_tied', name: '新曲线 Groom · 碎刘海露耳束发' },
    { id: 'groom_center_long', name: '新曲线 Groom · 中式中分长发' },
    { id: 'groom_low_chignon', name: '新曲线 Groom · 中式低盘发' },
    { id: 'hair_user_photo', name: '照片同款 · 空气碎刘海露耳束发 (5,029v)' },
    { id: 'hair_short02', name: 'O4saken · 中式空气刘海微卷波波 (12,547v)' },
    { id: 'hair_long01', name: 'Elvs Lara · 中分长发样例 (17,360v)' },
    { id: 'hair_braid01', name: 'Elvs Adrienne · 法式蓬松微卷盘发 (9,352v)' },
    { id: 'hair_short04', name: 'Elvs Daisy · 千金感斜刘海半束发 (6,721v)' },
    { id: 'hair_ponytail01', name: 'Elvs Hazel · 利落偏分高颅顶束发 (4,891v)' },
    { id: 'hair_bob02', name: 'Toigo · 日系层次内卷短波波 (3,031v)' },
    { id: 'hair_bob01', name: 'Toigo · 经典齐刘海内扣学生波波 (2,806v)' }
  ];
  let hairCycleIdx = 0;

  document.getElementById('btn-test-scan-glb').addEventListener('click', async () => {
    hairCycleIdx = (hairCycleIdx + 1) % REAL_HAIRS.length;
    const picked = REAL_HAIRS[hairCycleIdx];
    state.studioDraft.hairStyle = picked.id;
    document.getElementById('sel-hair-style').value = picked.id;
    document.getElementById('custom-model-status').textContent = `内置演示头模 + ${picked.name}`;
    await refreshStudio3DModel();
    soundEngine.playSummon(true);
    showToast(`💇‍♀️ 已切换 MhcloFit 高精 3D 发型：${picked.name} (${picked.id}.glb)`);
  });

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

  // 10. Studio Morph Sliders, Forensic Post-Mortem Expressions, Colors & Hair Controls
  const applyStudioDeadExpression = (exprId) => {
    state.studioDraft.deadExpression = exprId;
    state.studioDraft.morphs.deadExpression = exprId;
    syncStudioExpressionUI(exprId);
    studioEngine.updateMorphsFast(state.studioDraft.morphs);
    const ep = FORENSIC_EXPRESSION_PRESETS.find(p => p.id === exprId);
    if (ep) {
      showToast(`💀 已切换死人/尸相表情：${ep.label} — ${ep.desc}`);
    }
  };

  const selDeadExpr = document.getElementById('sel-dead-expression');
  if (selDeadExpr) {
    selDeadExpr.addEventListener('change', (e) => {
      applyStudioDeadExpression(e.target.value);
    });
  }

  document.querySelectorAll('[data-dead-expr]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyStudioDeadExpression(btn.dataset.deadExpr);
    });
  });

  document.getElementById('sel-base-preset').addEventListener('change', async (e) => {
    state.studioDraft.customModelUrl = null;
    state.studioDraft.basePreset = e.target.value;
    const presetHairMap = {
      user_photo: 'hair_user_photo',
      linxi: 'hair_long01',
      suwan: 'hair_short02',
      qianxue: 'hair_ponytail01',
      shenzhiwei: 'hair_braid01'
    };
    const presetExprMap = {
      user_photo: 'dead_calm',
      linxi: 'dead_hollow',
      suwan: 'dead_serene',
      qianxue: 'dead_shock',
      shenzhiwei: 'dead_smile'
    };
    if (presetHairMap[e.target.value]) {
      state.studioDraft.hairStyle = presetHairMap[e.target.value];
      document.getElementById('sel-hair-style').value = state.studioDraft.hairStyle;
    }
    if (presetExprMap[e.target.value]) {
      state.studioDraft.deadExpression = presetExprMap[e.target.value];
      state.studioDraft.morphs.deadExpression = presetExprMap[e.target.value];
      syncStudioExpressionUI(presetExprMap[e.target.value]);
    }
    document.getElementById('custom-model-status').textContent = `内置演示头模 (${e.target.value} + ${state.studioDraft.hairStyle}.glb)`;
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

  bindMorphSlider('morph-jaw-open', 'val-morph-jaw-open', 'jawOpen');
  bindMorphSlider('morph-eye-roll', 'val-morph-eye-roll', 'eyeRollUp');
  bindMorphSlider('morph-tongue-out', 'val-morph-tongue-out', 'tongueOut');
  bindMorphSlider('morph-jaw-side', 'val-morph-jaw-side', 'jawSide');
  bindMorphSlider('morph-bangs-len', 'val-morph-bangs-len', 'bangsLength');
  bindMorphSlider('morph-hair-vol', 'val-morph-hair-vol', 'hairVolume');
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

  document.getElementById('sel-groom-density').addEventListener('change', async e => {
    state.studioDraft.groomDensity = Number(e.target.value);
    await refreshStudio3DModel();
  });
  document.getElementById('sel-hair-style').addEventListener('change', async (e) => {
    state.studioDraft.hairStyle = e.target.value;
    await refreshStudio3DModel();
  });

  document.getElementById('slider-hair-sheen').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    state.studioDraft.hairSheen = v;
    document.getElementById('val-hair-sheen').textContent = `${Math.round(v * 100)}%`;
    updateHairSheen(studioEngine.headNode, v);
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
      deadExpression: state.studioDraft.deadExpression || state.studioDraft.morphs?.deadExpression || 'dead_calm',
      customModelUrl: state.studioDraft.customModelUrl,
      customModelType: state.studioDraft.customModelType,
      skinTone: state.studioDraft.skinTone,
      blushIntensity: state.studioDraft.blushIntensity,
      lipColor: state.studioDraft.lipColor,
      irisColor: state.studioDraft.irisColor,
      hairStyle: state.studioDraft.hairStyle,
      groomDensity: state.studioDraft.groomDensity || 6000,
      hairColor: state.studioDraft.hairColor,
      hairSheen: state.studioDraft.hairSheen,
      neckClearance: state.studioDraft.neckClearance,
      morphs: { ...state.studioDraft.morphs },
      anatomyOptions: {
        ...state.studioDraft.anatomyOptions,
        cutLevel
      },
      dossier: {
        origin: state.studioDraft.customModelUrl
          ? '基于用户自备 GLB 与手工照片对位；原件仅保存在当前浏览器私人仓库（若浏览器存储不可用则仅当前会话），导出档案不含模型文件。'
          : `基于内置 GLB 示例 (${state.studioDraft.basePreset}) 与手工照片对位。`,
        anatomyNotes: notes,
        hairNotes: `3D 发型 (${state.studioDraft.hairStyle})，光泽度 ${Math.round(state.studioDraft.hairSheen * 100)}%。`,
        tags: ['3D头部藏品', cutLevel.slice(0, 10), grade.split('·')[0].trim(), '解剖切面示意']
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

    // Local persistence works for downloaded file:// HTML too. Only the local
    // Vite middleware can write a physical server-side folder; browsers cannot.
    const savedLocally = persistCollectibles();
    let diskSaved = false;
    if (location.protocol !== 'file:' && !location.hostname.endsWith('.github.io')) {
      try {
        const response = await fetch('/api/collectibles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectible: newCollectible })
        });
        diskSaved = response.ok;
      } catch (_) {}
    }
    await fetchAndRenderArchives();
    try { await desktopEngine.summonCollectible(newCollectible); }
    catch (error) { console.warn('召唤失败，藏品档案仍已保存', error); }
    renderVaultGrid();

    const nextNum = state.collectibles.length + 1;
    document.getElementById('inp-col-id').value = `SPEC-2026-00${nextNum}`;
    showToast(diskSaved
      ? `已在本地服务目录生成档案并登记「${name}」。`
      : savedLocally
        ? `已在浏览器保存「${name}」；可从档案页下载实体文件夹 ZIP。`
        : `「${name}」仅在本次会话保留；浏览器存储不足，请下载档案备份。`);
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

  // Stage 7b: Photoreal render quality switch (persisted, applied to BOTH engines)
  const QUALITY_KEY = 'cervix3d-render-quality';
  const qualitySel = document.getElementById('sel-render-quality');
  const applySavedQuality = (level) => {
    const lvl = ['low', 'medium', 'high'].includes(level) ? level : 'high';
    try {
      if (desktopEngine) desktopEngine.setRenderQuality(lvl);
      if (studioEngine) studioEngine.setRenderQuality(lvl);
    } catch (err) { console.warn('应用渲染画质失败:', err); }
    return lvl;
  };
  if (qualitySel) {
    let savedQuality = 'high';
    try { savedQuality = localStorage.getItem(QUALITY_KEY) || 'high'; } catch (_) { /* file:// 隐私模式 */ }
    qualitySel.value = applySavedQuality(savedQuality);
    qualitySel.addEventListener('change', (e) => {
      const lvl = applySavedQuality(e.target.value);
      try { localStorage.setItem(QUALITY_KEY, lvl); } catch (_) {}
      const label = lvl === 'high' ? '✨ 极致画质' : lvl === 'medium' ? '⚖️ 标准画质' : '🚀 流畅画质';
      showToast(`${label}已生效（工坊预览 + 屏幕桌宠同步切换）`);
    });
  }

  // Stage 13a/13b: 辉光后期 + 氛围开关（双引擎同步，持久化）
  const POST_KEY = 'cervix3d-beauty-post';
  const ATM_KEY = 'cervix3d-atmosphere';
  const postChk = document.getElementById('chk-beauty-post');
  const atmChk = document.getElementById('chk-atmosphere');
  const applyPostToggle = (on) => {
    try {
      if (desktopEngine) desktopEngine.setBeautyPostEnabled(on);
      if (studioEngine) studioEngine.setBeautyPostEnabled(on);
    } catch (err) { console.warn('应用辉光后期开关失败:', err); }
  };
  const applyAtmToggle = (on) => {
    try {
      if (desktopEngine) desktopEngine.setAtmosphereEnabled(on);
      if (studioEngine) studioEngine.setAtmosphereEnabled(on);
    } catch (err) { console.warn('应用氛围开关失败:', err); }
  };
  if (postChk) {
    let savedPost = true;
    try { savedPost = localStorage.getItem(POST_KEY) !== 'off'; } catch (_) {}
    postChk.checked = savedPost;
    applyPostToggle(savedPost);
    postChk.addEventListener('change', (e) => {
      applyPostToggle(e.target.checked);
      try { localStorage.setItem(POST_KEY, e.target.checked ? 'on' : 'off'); } catch (_) {}
      showToast(e.target.checked ? '✨ 辉光后期已开启' : '🌙 辉光后期已关闭（直渲模式）');
    });
  }
  if (atmChk) {
    let savedAtm = true;
    try { savedAtm = localStorage.getItem(ATM_KEY) !== 'off'; } catch (_) {}
    atmChk.checked = savedAtm;
    applyAtmToggle(savedAtm);
    atmChk.addEventListener('change', (e) => {
      applyAtmToggle(e.target.checked);
      try { localStorage.setItem(ATM_KEY, e.target.checked ? 'on' : 'off'); } catch (_) {}
      showToast(e.target.checked ? '🌫️ 氛围尘埃已开启' : '🌫️ 氛围尘埃已关闭');
    });
  }

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
    try {
      await desktopEngine.summonCollectible(current.manifest);
      const saved = state.collectibles.find(item => item.id === current.manifest.id);
      if (saved) { saved.summoned = true; persistCollectibles(); }
      showToast(`🎯 已从目录档案召唤「${current.manifest.name}」。`);
    } catch (error) {
      showToast(`无法召唤「${current.manifest.name}」：请检查私人 GLB 是否仍在本浏览器。`);
    }
  });

  document.getElementById('btn-arch-download').addEventListener('click', () => {
    const current = state.archiveItems[state.selectedArchiveIndex];
    if (!current || !current.manifest) return;
    downloadBlob(new Blob([JSON.stringify(current.manifest, null, 2)], { type: 'application/json' }),
      `${current.folderName}.cervix3d.json`);
  });
  document.getElementById('btn-arch-folder-zip').addEventListener('click', () => {
    const current = state.archiveItems[state.selectedArchiveIndex];
    if (!current || !current.manifest) return;
    const archive = createCollectibleFolderZip(current.folderName, current.manifest, current.dossierMd);
    downloadBlob(archive, `${current.folderName}.zip`);
    showToast('已下载档案文件夹 ZIP（manifest + dossier）；私人 GLB 原文件需单独备份。');
  });

  document.getElementById('input-import-archive').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported = JSON.parse(ev.target.result);
        if (typeof imported.id !== 'string' || typeof imported.name !== 'string') throw new Error('档案格式不正确');
        const existing = state.collectibles.findIndex(item => item.id === imported.id);
        if (existing >= 0) state.collectibles[existing] = imported;
        else state.collectibles.unshift(imported);
        persistCollectibles();
        if (location.protocol !== 'file:' && !location.hostname.endsWith('.github.io')) {
          try {
            await fetch('/api/collectibles', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ collectible: imported })
            });
          } catch (_) {}
        }
        await fetchAndRenderArchives();
        try {
          await desktopEngine.summonCollectible(imported);
          imported.summoned = true;
          persistCollectibles();
          showToast(`已导入并召唤「${imported.name}」。`);
        } catch (error) {
          imported.summoned = false;
          persistCollectibles();
          showToast(`档案已导入；召唤前请在此浏览器重新选择对应 GLB：${imported.name}`);
        }
        renderVaultGrid();
      } catch (err) {
        showToast(`导入失败：${err.message}`);
      }
    };
    reader.readAsText(file);
  });
  if (bootStatus) bootStatus.remove();
  if (window.__cervixQA) window.__cervixQA.ready = true;
  } catch (error) {
    console.error('本地 3D 初始化失败', error);
    if (bootStatus) bootStatus.textContent = `启动失败：${String(error.message).slice(0, 160)}。请使用支持 WebGL2 的 Chrome/Edge 并开启硬件加速。`;
  }

});
