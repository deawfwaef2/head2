import {
  DEFAULT_COLLECTIBLES,
  DAZ_TUTORIAL_STEPS,
  REAL_HAIR_CATALOG,
  SKIN_MATERIAL_CATALOG,
  HAIR_FRONT_BANGS_CATALOG,
  HAIR_SIDE_LOCKS_CATALOG,
  HAIR_BACK_ATTACHMENT_CATALOG,
  HAIR_DYE_PRESET_CATALOG,
  HEAD_BLEND_CHANNELS,
  FACE_ARCHETYPE_CATALOG,
  EYEBROW_STYLE_CATALOG,
  STUDY_ROLE_CATALOG,
  getStudyRoleMeta,
  resolveCollectibleLifePhotoSrc
} from './data/defaultCollectibles.js';
import { DesktopBoxSpaceEngine } from './three/desktopBoxSpaceEngine.js';
import { StudioPreviewEngine } from './three/studioPreviewEngine.js';
import {
  FORENSIC_EXPRESSION_PRESETS,
  updateHairSheen,
  updateHairDesignOnGroup,
  updateCollectibleMaterialsLive,
  attachSpecimenContainerAndDecor,
  resolveRealHairStyle,
  setHeadFaceArchetype,
  setHeadSkinVariant,
  setHeadEyebrowStyle,
  getHeadBlendStateFromGroup,
  applyHeadMorphsToGroup
} from './three/collectibleHeadAssembler.js';
import {
  VISUAL_STYLE_PRESETS,
  HDR_ENVIRONMENT_CATALOG,
  updateInteractiveCursorLight
} from './three/photorealLighting.js';
import {
  CONTAINER_STYLE_CATALOG,
  DECOR_STYLE_CATALOG
} from './three/specimenStageAndContainers.js';
import { renderAnatomyCrossSectionToCanvas } from './textures/anatomyTextureGenerator.js';
import { samplePhotoColors } from './textures/skinTextureGenerator.js';
import { soundEngine } from './audio/tactileSoundEngine.js';
import { keepPrivateModel, isPrivateModel } from './data/privateModelStore.js';
import { createCollectibleFolderZip } from './data/offlineArchiveZip.js';

// ============================================================================
// APPLICATION STATE
// ============================================================================
const STORAGE_KEY = 'cervix3d-collectibles-stage36-master-v1';
function restoreCollectibles() {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_COLLECTIBLES));
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(saved) && saved.length > 0) {
      const byId = new Map(defaults.map(item => [item.id, item]));
      for (const item of saved) {
        if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') continue;
        if (item.customModelUrl?.startsWith('blob:')) item.customModelUrl = null;
        const def = byId.get(item.id);
        byId.set(item.id, def ? { ...def, ...item } : item);
      }
      return [...byId.values()];
    }
    // Migrate only custom user-created specimens from previous storage keys
    const legacy = JSON.parse(
      localStorage.getItem('cervix3d-collectibles-stage35-master-v1') ||
      localStorage.getItem('cervix3d-collectibles-stage30-master-v1') ||
      localStorage.getItem('cervix3d-collectibles-stage28-master-v1') ||
      localStorage.getItem('cervix3d-collectibles-stage27-master-v1') ||
      localStorage.getItem('cervix3d-collectibles-stage25-master-v1') ||
      localStorage.getItem('cervix3d-collectibles-stage24-v1') ||
      localStorage.getItem('cervix3d-collectibles-stage24-master-v1') ||
      localStorage.getItem('cervix3d-collectibles-stage23-v1') ||
      localStorage.getItem('cervix3d-collectibles-stage21-v1') ||
      localStorage.getItem('cervix3d-collectibles-v2') ||
      '[]'
    );
    if (Array.isArray(legacy)) {
      const builtinIds = new Set(defaults.map(d => d.id));
      for (const item of legacy) {
        if (item && typeof item.id === 'string' && !builtinIds.has(item.id)) {
          if (item.customModelUrl?.startsWith('blob:')) item.customModelUrl = null;
          defaults.unshift(item);
        }
      }
    }
    return defaults;
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
  studyTriumphEnabled: true,
  studyStartTime: Date.now(),
  studyEnergyPoints: 1580,
  studyMindset: 'survivor_crown',
  activeRoleBuffMultiplier: 1.6,
  pomodoroRunning: true,
  pomodoroRemainingSec: 25 * 60,
  rainStudyAudioEnabled: true,
  petStripExpanded: false,
  activeStripPetId: 'spec-fang-yaoping-001',
  visualCustomConfig: {
    presetId: 'cinema_85mm_portrait',
    hdrMode: 'golden_hour',
    envIntensity: 0.32,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.34,
    chiaroscuro: 0.68,
    tyndall: 0.58,
    vintagePhoto: 0.48,
    softFocus: 0.56,
    depthBlur: 0.44,
    chromatic: 0.14,
    keyColor: '#ffeed6',
    rimColor: '#fcd9a8',
    keyAzimuthDeg: 38,
    keyElevationDeg: 28,
    keyIntensity: 1.36,
    fillIntensity: 0.28,
    rimIntensity: 0.78,
    hemiIntensity: 0.24,
    exposure: 0.80,
    sssIntensity: 0.82,
    skinGloss: 0.12,
    wetGloss: 0.12,
    sharpen: 0.06,
    contrast: 1.09,
    saturation: 0.90,
    warmth: 0.07,
    vignette: 0.36,
    filmGrain: 0.09,
    bloomStrength: 0.07,
    irisSparkle: 0.05,
    halation: 0.28,
    skinLumen: 0.0,
    cursorTorch: 0.28
  },
  studioDraft: {
    basePreset: 'fangyaoping',
    skinVariant: 'cn_scholar_natural',
    faceArchetype: 'cn_oval_scholar',
    eyebrowStyle: 'cn_scholar_natural',
    deadExpression: 'dead_calm',
    containerStyle: 'none',
    decorStyle: 'study_tomes',
    studyRole: 'gaokao_pomodoro',
    studyGoalNote: '吸纳19岁女状元方尧平的巅峰考运，高效攻克今日核心章节！',
    lifePhotoDataUrl: null,
    customModelUrl: null,
    customModelType: 'glb',
    customHairUrl: null,
    customHairType: 'glb',
    skinTone: '#faDFce',
    blushIntensity: 0.18,
    lipColor: '#bc646e',
    irisColor: '#382015',
    hairStyle: 'hair_user_photo',
    frontBangs: 'wispy_air',
    sideLocks: 'photo_wisp',
    backAttachment: 'high_ponytail',
    hairDyePreset: 'natural_ebony',
    hairTipColor: '#4a3528',
    hairOmbreMix: 0.0,
    hairWispyFeather: 0.58,
    groomDensity: 6000,
    hairColor: '#121216',
    hairSheen: 0.90,
    neckClearance: 0.55,
    photoElement: null,
    photoBlend: 0.0,
    morphs: {
      deadExpression: 'dead_calm',
      jawOpen: 0.0,
      eyeRollUp: 0.0,
      tongueOut: 0.0,
      jawSide: 0.0,
      frontBangs: 'wispy_air',
      sideLocks: 'photo_wisp',
      backAttachment: 'high_ponytail',
      hairTipColor: '#4a3528',
      hairOmbreMix: 0.0,
      hairWispyFeather: 0.58,
      bangsLength: 0.0,
      bangsParting: 0.0,
      hairVolume: 0.0,
      hairLength: 0.0,
      sideburnLock: 0.0,
      hairFlare: 0.0,
      hairOffsetY: 0.0,
      hairOffsetZ: 0.0,
      hairScale: 1.0,
      jawVLine: 0.0,
      chinLength: 0.0,
      cheekSoftness: 0.0,
      noseBridge: 0.0,
      eyeAlmond: 0.0,
      eyeTilt: 0.0,
      lipFullness: 0.0,
      neckDiameter: 0.95,
      cutHeightOffset: 0.0,
      cutTiltPitch: 4.0,
      cutTiltRoll: 0.0
    },
    anatomyOptions: {
      cutLevel: 'C4–C5 颈椎状元标本横切面 (切缘鲜红凝血态 + 气管软骨环 + 脊髓灰质)',
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
  toastTimer = setTimeout(() => el.classList.add('hidden'), 3600);
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

  if (preset === 'user_photo' || preset === 'fangyaoping') {
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
      state.studioDraft.photoElement = img;
      state.studioDraft.lifePhotoDataUrl = img.src;
      if (studioEngine?.headNode && Number(state.studioDraft.photoBlend || 0) > 0.005) {
        studioEngine.updateMaterialsFast({
          photoElement: img,
          lifePhotoUrl: img.src,
          photoBlend: state.studioDraft.photoBlend,
        });
      }
    };
    if (preset === 'fangyaoping') {
      img.src = (typeof window !== 'undefined' && window.__EMBEDDED_FANG_PHOTO__)
        ? window.__EMBEDDED_FANG_PHOTO__
        : '/models/fang_yaoping_ref.jpg';
    } else {
      img.src = (typeof window !== 'undefined' && window.__EMBEDDED_REF_PHOTO__)
        ? window.__EMBEDDED_REF_PHOTO__
        : '/models/user_photo_ref.png';
    }
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
// HOVER DOSSIER FLOATING WINDOW RENDERER (Includes In-Life Photo & Study Role)
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

  // Stage 24: Populate In-Life Photo ("生前照片") & Character-Bound Study Role ("角色绑定伴学职能")
  const lifeImgEl = document.getElementById('hud-life-photo-img');
  if (lifeImgEl) {
    const photoSrc = resolveCollectibleLifePhotoSrc(col);
    if (lifeImgEl.getAttribute('data-cur-id') !== col.id) {
      lifeImgEl.src = photoSrc;
      lifeImgEl.setAttribute('data-cur-id', col.id);
    }
  }
  const roleMeta = getStudyRoleMeta(col.studyRole || 'gaokao_pomodoro');
  const roleBadgeEl = document.getElementById('hud-study-role-badge');
  if (roleBadgeEl) roleBadgeEl.textContent = roleMeta.label;
  const roleGoalEl = document.getElementById('hud-study-goal-note');
  if (roleGoalEl) {
    roleGoalEl.textContent = col.studyGoalNote || roleMeta.desc;
  }
  const lifeCapEl = document.getElementById('hud-life-photo-caption');
  if (lifeCapEl) {
    lifeCapEl.textContent =
      col.lifePhotoCaption ||
      `📸 生前鲜活影像：${col.fateRecord?.vitalityStatus || '19岁 · 巅峰健康态'}（生前完好鲜活态 vs 案头静默标本）`;
  }

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

  const fateSec = document.getElementById('hud-fate-section');
  if (fateSec) {
    const showFate = state.studyTriumphEnabled && state.studyMindset !== 'serene_aesthetic';
    fateSec.style.display = showFate ? 'block' : 'none';
    if (showFate) {
      const fate = col.fateRecord || {
        vitalityStatus: '19岁 · 巅峰健康态 · 广东怀集高考状元',
        causeOfDeath: '突发意外瞬间定格于最鲜活的青春巅峰期',
        survivorTriumphNote: '她已在意外中彻底出局，而活着的你仍在进取并主宰全局——凝视她的静美容颜，汲取全额专注能量。'
      };
      document.getElementById('hud-fate-vitality').textContent = `💀 ${fate.vitalityStatus}`;
      document.getElementById('hud-fate-cause').textContent = `🪓 断头经过：${fate.causeOfDeath}`;
      document.getElementById('hud-fate-triumph').textContent = `👑 幸存者把玩感言：${fate.survivorTriumphNote}`;
    }
  }

  const snappedStruct = hoverInfo.snappedStructure;
  const statusStr = snappedStruct
    ? `🏛️ 已装入独立建筑: 【${snappedStruct.label}】(直接拖拽人头可拎出)`
    : `🩸 裸露断颈直接摆在桌面当镇纸 (可拖入任意空置收纳建筑)`;
  document.getElementById('hud-anatomy-level').textContent =
    `${col.anatomyOptions?.cutLevel || 'C4 颈椎齐根断离面'} · ${statusStr}`;
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
  const hudW = 395;
  const hudH = 385;
  let left = hoverInfo.screenX + 24;
  if (left + hudW > window.innerWidth - pad) {
    left = hoverInfo.screenX - hudW - 85;
  }
  left = Math.max(pad, Math.min(window.innerWidth - hudW - pad, left));
  let top = Math.max(58, Math.min(window.innerHeight - hudH - pad, hoverInfo.screenY - 120));

  hud.style.left = `${left}px`;
  hud.style.top = `${top}px`;
  hud.classList.remove('hidden');
}

function updateStructureFloatingHUD(info) {
  const hud = document.getElementById('structure-floating-hud');
  if (!hud) return;
  if (!info || !info.id) {
    hud.classList.add('hidden');
    hud.dataset.structId = '';
    return;
  }
  // Never overlap the open Studio / Manager window!
  const win = document.getElementById('software-window');
  const studioActive = document.getElementById('tab-studio')?.classList.contains('active');
  if (win && !win.classList.contains('window-hidden')) {
    if (studioActive) {
      hud.classList.add('hidden');
      return;
    }
    const rect = win.getBoundingClientRect();
    const sx = info.screenX || window.innerWidth * 0.5;
    const sy = info.screenY || window.innerHeight * 0.5;
    if (sx >= rect.left - 180 && sx <= rect.right + 180 && sy >= rect.top - 50 && sy <= rect.bottom + 50) {
      hud.classList.add('hidden');
      return;
    }
  }
  hud.dataset.structId = info.id;
  const titleEl = document.getElementById('struct-hud-title');
  if (titleEl) {
    const icon = info.isShelfStructure ? '🪵' : info.isDecorProp ? '🕯️' : '🏗️';
    const occSuffix = info.occupiedByName ? ` (已装入: ${info.occupiedByName.split('·')[0].trim()})` : '';
    titleEl.textContent = `${icon} ${info.label}${occSuffix}`;
  }
  const ejectBtn = document.getElementById('btn-struct-hud-eject');
  if (ejectBtn) {
    ejectBtn.style.display = info.occupiedByPetId ? 'inline-flex' : 'none';
  }
  const left = Math.max(150, Math.min(window.innerWidth - 150, info.screenX || window.innerWidth * 0.5));
  const top = Math.max(68, Math.min(window.innerHeight - 60, (info.screenY || window.innerHeight * 0.5) - 18));
  hud.style.left = `${left}px`;
  hud.style.top = `${top}px`;
  hud.classList.remove('hidden');
}

function renderPlacedStructuresList(list = []) {
  const container = document.getElementById('placed-structures-list');
  if (!container) return;
  container.innerHTML = '';
  if (list.length === 0) {
    container.innerHTML = `<span style="font-size:11px;color:#64748b;">当前场景建筑/层架/摆件已全部删除清空；点击上方按钮可重新建造或恢复默认展架。</span>`;
    return;
  }
  for (const s of list) {
    const icon = s.isShelfStructure ? '🪵' : s.isDecorProp ? '🕯️' : '🏗️';
    const occText = s.occupiedByName
      ? `🩸已装入:${s.occupiedByName.split('·')[0].trim()}`
      : s.isShelfStructure
        ? '可拖动/可删层板'
        : s.isDecorProp
          ? '可拖动/可删摆件'
          : '⚪空置(可拖入断头)';
    const chip = document.createElement('span');
    chip.className = 'dossier-tag';
    chip.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:3px 8px;background:rgba(15,23,42,0.88);border:1px solid rgba(251,191,36,0.45);color:#fde68a;font-size:11px;';
    chip.innerHTML = `
      <span>${icon} ${s.label} (${occText})</span>
      <button data-remove-structure="${s.id}" style="background:none;border:none;color:#fda4af;cursor:pointer;font-weight:bold;padding:0 2px;" title="删除该建筑/层板/摆件">✕</button>
    `;
    container.appendChild(chip);
  }
  container.querySelectorAll('[data-remove-structure]').forEach(btn => {
    btn.addEventListener('click', () => {
      desktopEngine?.removeContainerStructure(btn.dataset.removeStructure);
      showToast('🗑️ 已删除该建筑/层板/摆件（如有头颅在其中已自动释放回桌面）');
    });
  });
}

// ============================================================================
// STAGE 24: CHARACTER-BOUND STUDY FUNCTION EXECUTOR ("功能和角色绑定，辅助学习加强学习动力")
// ============================================================================
function executeCharacterStudyRole(collectibleId) {
  const col = state.collectibles.find(c => c.id === collectibleId);
  if (!col) return;
  const roleMeta = getStudyRoleMeta(col.studyRole || 'gaokao_pomodoro');

  // Apply study role buff & energy burst
  const burst = roleMeta.energyBurst || 280;
  state.studyEnergyPoints += burst;
  state.activeRoleBuffMultiplier = roleMeta.buffMultiplier || 1.5;

  if (roleMeta.id === 'gaokao_pomodoro') {
    state.pomodoroRunning = true;
    state.pomodoroRemainingSec = 25 * 60;
  } else if (roleMeta.id === 'memory_anchor') {
    const anchorTargets = [
      '📖 封印目标：25分钟内彻底攻克当前核心章节与高频错题！',
      '📖 封印目标：全神贯注背诵并默写今日核心考点，绝不走神！',
      '📖 封印目标：吸纳状元与才女气运，今日刷题正确率突破 90%！'
    ];
    const nextGoal = anchorTargets[Math.floor(Math.random() * anchorTargets.length)];
    col.studyGoalNote = `${col.name.split('·')[0].trim()}伴读誓言：${nextGoal}`;
    persistCollectibles();
  }

  const energyValEl = document.getElementById('triumph-energy-val');
  const barFillEl = document.getElementById('triumph-bar-fill');
  const quoteEl = document.getElementById('triumph-quote-text');
  if (energyValEl) energyValEl.textContent = `${state.studyEnergyPoints.toLocaleString()} PTS (x${state.activeRoleBuffMultiplier.toFixed(1)})`;
  if (barFillEl) barFillEl.style.width = `${Math.min(100, ((state.studyEnergyPoints % 2500) / 2500) * 100)}%`;
  if (quoteEl) {
    quoteEl.textContent = `【${col.name.split('·')[0].trim()} · ${roleMeta.shortLabel}】${roleMeta.triggerMsg}`;
  }

  soundEngine.playSummon(true);
  showToast(`${roleMeta.triggerMsg} (+${burst} PTS)`);
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
    const curContainer = (petEntry && petEntry.snappedStructureId && desktopEngine.structures.has(petEntry.snappedStructureId))
      ? desktopEngine.structures.get(petEntry.snappedStructureId).containerStyle
      : 'none';
    const curHair = resolveRealHairStyle(item.hairStyle || 'hair_bob01');
    const curRole = item.studyRole || 'gaokao_pomodoro';
    const roleMeta = getStudyRoleMeta(curRole);
    const lifePhotoSrc = resolveCollectibleLifePhotoSrc(item);

    const hairOptsHtml = REAL_HAIR_CATALOG.map(
      hp => `<option value="${hp.id}" ${hp.id === curHair ? 'selected' : ''}>${hp.label}</option>`
    ).join('');
    const exprOptsHtml = FORENSIC_EXPRESSION_PRESETS.map(
      ep => `<option value="${ep.id}" ${ep.id === curExpr ? 'selected' : ''}>💀 ${ep.label}</option>`
    ).join('');
    const allContainerChoices = [
      { id: 'none', shortLabel: '纯断头镇纸', label: '🩸 不放入容器 (纯断头直接摆在书桌当镇纸)' },
      ...CONTAINER_STYLE_CATALOG
    ];
    const containerOptsHtml = allContainerChoices.map(
      ct => `<option value="${ct.id}" ${ct.id === curContainer ? 'selected' : ''}>${ct.label}</option>`
    ).join('');
    const roleOptsHtml = STUDY_ROLE_CATALOG.map(
      rl => `<option value="${rl.id}" ${rl.id === curRole ? 'selected' : ''}>${rl.label}</option>`
    ).join('');

    const showFate = state.studyTriumphEnabled && state.studyMindset !== 'serene_aesthetic' && item.fateRecord;
    const fateHtml = showFate ? `
      <div class="vault-anatomy-box" style="border-color:rgba(251,191,36,0.38);background:rgba(38,24,18,0.52);margin-top:4px;">
        <strong style="color:#fcd34d;">💀 生前身份 (${item.fateRecord.vitalityStatus})：</strong><br/>
        <span style="color:#fda4af;">🪓 ${item.fateRecord.causeOfDeath}</span><br/>
        <span style="color:#a7f3d0;font-style:italic;">👑 ${item.fateRecord.survivorTriumphNote}</span>
      </div>
    ` : '';

    const card = document.createElement('div');
    card.className = `vault-card ${isSummoned ? 'summoned' : ''}`;
    card.innerHTML = `
      <div class="vault-card-top">
        <div>
          <span class="vault-serial">${item.id}</span>
          <span class="vault-grade">${item.grade || 'SSR'}</span>
        </div>
        <span class="vault-status ${isSummoned ? 'active' : ''}">
          ${isSummoned ? (isRotating ? '🔄 屏幕旋转鉴赏中' : '🟢 已在桌面伴读') : '⚪ 典藏库待命'}
        </span>
      </div>
      <div style="display:flex;gap:10px;align-items:center;">
        <img class="vault-life-photo-mini" src="${lifePhotoSrc}" alt="生前照片" title="📸 角色生前最后留影（鼠标移到3D人头上可看大图对照）" />
        <div style="flex:1;min-width:0;">
          <div class="vault-title">${item.name}</div>
          <div class="vault-sub">${item.subtitle || ''}</div>
          <div style="font-size:10.5px;color:#fde68a;margin-top:2px;">${roleMeta.shortLabel} · ${item.studyGoalNote || roleMeta.desc}</div>
        </div>
      </div>
      <div class="vault-anatomy-box">
        <strong>📋 生前癖好：</strong><span>${item.dossier?.origin || ''}</span><br/>
        <strong>🩸 断颈把玩：</strong><span>${item.dossier?.anatomyNotes || ''}</span>
      </div>
      ${fateHtml}
      <div class="field-row" style="margin: 4px 0 2px;">
        <select class="vault-hair-select" data-vault-hair="${item.id}" title="一键切换 28 款大师级真发丝 3D 发型" style="width:100%;font-size:11px;padding:4px 6px;border-radius:6px;background:rgba(15,23,42,0.92);color:#7dd3fc;border:1px solid rgba(56,189,248,0.45);">
          ${hairOptsHtml}
        </select>
      </div>
      <div class="field-row" style="margin: 2px 0; display:grid; grid-template-columns: 1fr 1fr; gap:6px;">
        <select class="vault-expr-select" data-vault-expr="${item.id}" style="width:100%;font-size:11px;padding:4px 6px;border-radius:6px;background:rgba(15,23,42,0.85);color:#e2e8f0;border:1px solid rgba(244,63,94,0.35);">
          ${exprOptsHtml}
        </select>
        <select class="vault-container-select" data-vault-container="${item.id}" style="width:100%;font-size:11px;padding:4px 6px;border-radius:6px;background:rgba(15,23,42,0.85);color:#fde68a;border:1px solid rgba(251,191,36,0.35);">
          ${containerOptsHtml}
        </select>
      </div>
      <div class="field-row" style="margin: 2px 0 4px; display:flex; gap:6px; align-items:center;">
        <select class="vault-role-select" data-vault-role="${item.id}" title="分配绑定给该角色的伴学职能" style="flex:1;font-size:11px;padding:4px 6px;border-radius:6px;background:rgba(6,78,59,0.55);color:#a7f3d0;border:1px solid rgba(16,185,129,0.45);">
          ${roleOptsHtml}
        </select>
        <button class="pill-role-trigger-btn" data-vault-action="trigger-role" data-id="${item.id}" title="立即激发该角色的伴学学习动力职能">
          ⚡ 激发伴学职能
        </button>
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

  grid.querySelectorAll('[data-vault-hair]').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = sel.dataset.vaultHair;
      const hairId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      if (!col) return;
      col.hairStyle = hairId;
      persistCollectibles();
      if (desktopEngine && desktopEngine.pets.has(id)) {
        await desktopEngine.setPetHairStyle(id, hairId);
      }
      const hp = REAL_HAIR_CATALOG.find(p => p.id === hairId);
      showToast(`💇‍♀️ 已将「${col.name}」发型切换为：${hp ? hp.label : hairId}`);
    });
  });

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

  grid.querySelectorAll('[data-vault-container]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.vaultContainer;
      const contId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      if (!col) return;
      col.containerStyle = contId;
      persistCollectibles();
      if (desktopEngine && desktopEngine.pets.has(id)) {
        desktopEngine.setPetContainerStyle(id, contId);
      }
      const ct = CONTAINER_STYLE_CATALOG.find(c => c.id === contId);
      showToast(`🧪 已将「${col.name}」容器切换为：${ct ? ct.label : contId}`);
    });
  });

  grid.querySelectorAll('[data-vault-role]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.vaultRole;
      const roleId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      if (!col) return;
      col.studyRole = roleId;
      const rm = getStudyRoleMeta(roleId);
      col.studyGoalNote = rm.desc;
      persistCollectibles();
      if (desktopEngine && desktopEngine.pets.has(id)) {
        desktopEngine.pets.get(id).collectible.studyRole = roleId;
        desktopEngine.pets.get(id).collectible.studyGoalNote = rm.desc;
        desktopEngine.emitPetsChange();
      }
      renderVaultGrid();
      showToast(`🎓 已为「${col.name}」绑定伴学职能：${rm.label}`);
    });
  });

  grid.querySelectorAll('[data-vault-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.vaultAction;
      const id = btn.dataset.id;
      const col = state.collectibles.find(c => c.id === id);
      if (!col || !desktopEngine) return;

      if (action === 'trigger-role') {
        executeCharacterStudyRole(id);
        return;
      }

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
  const triumphSpecimens = document.getElementById('triumph-active-specimens');
  if (triumphSpecimens) {
    triumphSpecimens.textContent = `${summonedList.length} 具青春标本伴读中`;
  }

  const pillsContainer = document.getElementById('screen-pets-pills');
  if (!pillsContainer) return;
  pillsContainer.innerHTML = '';

  if (summonedList.length === 0) {
    pillsContainer.innerHTML = `<span style="font-size:11px;color:#94a3b8;">当前屏幕暂无桌宠，可在「典藏库」点击召唤至屏幕</span>`;
    return;
  }

  if (!summonedList.some(p => p.id === state.activeStripPetId)) {
    state.activeStripPetId = summonedList[0].id;
  }

  // Row 1: Ultra-compact character tab pills + [🎛️ 展开微调] button (takes < 1.2% screen area!)
  const tabsRow = document.createElement('div');
  tabsRow.style.cssText = 'display:flex;align-items:center;flex-wrap:wrap;gap:5px;';
  for (const p of summonedList) {
    const isSel = p.id === state.activeStripPetId;
    const shortName = p.name.split('·')[0].trim();
    const tabPill = document.createElement('div');
    tabPill.className = `pet-pill ${p.isRotationMode ? 'rotating' : ''}`;
    tabPill.style.cssText = `padding:2px 7px;border-color:${isSel ? 'rgba(56,189,248,0.65)' : 'rgba(148,163,184,0.18)'};background:${isSel ? 'rgba(15,32,58,0.88)' : 'rgba(17,25,42,0.72)'};cursor:pointer;`;
    tabPill.innerHTML = `
      <span data-select-strip-pet="${p.id}" style="font-weight:600;color:${isSel ? '#7dd3fc' : '#e2e8f0'};font-size:11px;">${isSel ? '🟢' : '⚪'} ${shortName}</span>
      <button class="pill-mini-btn" data-pill-rot="${p.id}" title="切换旋转" style="padding:1px 5px;font-size:10px;">${p.isRotationMode ? '🔄转' : '🔄'}</button>
      <button class="pill-mini-btn" data-pill-reset="${p.id}" title="回正角度" style="padding:1px 5px;font-size:10px;">回正</button>
    `;
    tabsRow.appendChild(tabPill);
  }
  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'pill-mini-btn';
  toggleBtn.style.cssText = 'padding:2px 8px;font-size:10.5px;background:rgba(56,189,248,0.18);border-color:rgba(56,189,248,0.45);color:#bae6fd;font-weight:600;';
  toggleBtn.textContent = state.petStripExpanded ? '🎛️ 收起微调 ▾' : '🎛️ 展开微调 ▴';
  toggleBtn.addEventListener('click', () => {
    state.petStripExpanded = !state.petStripExpanded;
    renderActivePetsStrip(summonedList);
  });
  tabsRow.appendChild(toggleBtn);
  pillsContainer.appendChild(tabsRow);

  tabsRow.querySelectorAll('[data-select-strip-pet]').forEach(el => {
    el.addEventListener('click', () => {
      state.activeStripPetId = el.dataset.selectStripPet;
      state.petStripExpanded = true;
      renderActivePetsStrip(summonedList);
    });
  });

  // Row 2 (Only rendered when expanded, and ONLY for the single selected pet so it NEVER blocks the screen!)
  if (state.petStripExpanded) {
    const p = summonedList.find(x => x.id === state.activeStripPetId) || summonedList[0];
    const col = state.collectibles.find(c => c.id === p.id) || p;
    const curHair = resolveRealHairStyle(col.hairStyle || p.hairStyle || 'hair_user_photo');
    const curBangs = col.frontBangs || col.morphs?.frontBangs || 'default';
    const curSkin = col.skinVariant || col.morphs?.skinVariant || 'cn_porcelain_ivory';
    const curFace = col.faceArchetype || col.morphs?.faceArchetype || 'cn_oval_scholar';
    const curBrow = col.eyebrowStyle || col.morphs?.eyebrowStyle || 'cn_scholar_natural';
    const curExpr = p.deadExpression || 'dead_calm';
    const curCont = p.containerStyle || 'none';
    const curRole = col.studyRole || 'gaokao_pomodoro';
    const skinShortOpts = SKIN_MATERIAL_CATALOG.map(
      sk => `<option value="${sk.id}" ${sk.id === curSkin ? 'selected' : ''}>${sk.shortLabel}</option>`
    ).join('');
    const faceShortOpts = FACE_ARCHETYPE_CATALOG.map(
      fa => `<option value="${fa.id}" ${fa.id === curFace ? 'selected' : ''}>${fa.shortLabel}</option>`
    ).join('');
    const browShortOpts = EYEBROW_STYLE_CATALOG.map(
      bw => `<option value="${bw.id}" ${bw.id === curBrow ? 'selected' : ''}>${bw.shortLabel}</option>`
    ).join('');
    const hairShortOpts = REAL_HAIR_CATALOG.map(
      hp => `<option value="${hp.id}" ${hp.id === curHair ? 'selected' : ''}>${hp.shortLabel || hp.label}</option>`
    ).join('');
    const bangsShortOpts = HAIR_FRONT_BANGS_CATALOG.map(
      bg => `<option value="${bg.id}" ${bg.id === curBangs ? 'selected' : ''}>${bg.shortLabel}</option>`
    ).join('');
    const exprShortOpts = FORENSIC_EXPRESSION_PRESETS.map(
      ep => `<option value="${ep.id}" ${ep.id === curExpr ? 'selected' : ''}>💀${ep.shortLabel}</option>`
    ).join('');
    const pillContChoices = [
      { id: 'none', shortLabel: '🩸纯断头镇纸' },
      ...CONTAINER_STYLE_CATALOG.map(c => ({ id: c.id, shortLabel: `🏗️${c.shortLabel}` }))
    ];
    const contShortOpts = pillContChoices.map(
      ct => `<option value="${ct.id}" ${ct.id === curCont ? 'selected' : ''}>${ct.shortLabel}</option>`
    ).join('');
    const roleShortOpts = STUDY_ROLE_CATALOG.map(
      rl => `<option value="${rl.id}" ${rl.id === curRole ? 'selected' : ''}>${rl.shortLabel}</option>`
    ).join('');
    const pill = document.createElement('div');
    pill.className = 'pet-pill';
    pill.style.cssText = 'margin-top:4px;padding:4px 8px;';
    pill.innerHTML = `
      <strong style="color:#7dd3fc;font-size:11px;">${p.name.split('·')[0].trim()} 微调:</strong>
      <select class="pill-mini-btn" data-pill-skin="${p.id}" title="切换皮肤材质" style="width:auto!important;max-width:118px;padding:2px 4px;background:rgba(30,41,59,0.88);color:#fecdd3;border:1px solid rgba(251,113,133,0.42);border-radius:6px;">
        ${skinShortOpts}
      </select>
      <select class="pill-mini-btn" data-pill-face="${p.id}" title="切换独立头型" style="width:auto!important;max-width:118px;padding:2px 4px;background:rgba(30,41,59,0.88);color:#fbcfe8;border:1px solid rgba(244,114,182,0.42);border-radius:6px;">
        ${faceShortOpts}
      </select>
      <select class="pill-mini-btn" data-pill-brow="${p.id}" title="切换3D眉毛" style="width:auto!important;max-width:118px;padding:2px 4px;background:rgba(30,41,59,0.88);color:#fde68a;border:1px solid rgba(245,158,11,0.42);border-radius:6px;">
        ${browShortOpts}
      </select>
      <select class="pill-mini-btn" data-pill-hair="${p.id}" title="切换3D基底发型" style="width:auto!important;max-width:126px;padding:2px 4px;background:rgba(30,41,59,0.88);color:#7dd3fc;border:1px solid rgba(56,189,248,0.45);border-radius:6px;">
        ${hairShortOpts}
      </select>
      <select class="pill-mini-btn" data-pill-bangs="${p.id}" title="模块化拼装刘海" style="width:auto!important;max-width:118px;padding:2px 4px;background:rgba(30,41,59,0.88);color:#f9a8d4;border:1px solid rgba(236,72,153,0.45);border-radius:6px;">
        ${bangsShortOpts}
      </select>
      <select class="pill-mini-btn" data-pill-role="${p.id}" title="伴学职能" style="width:auto!important;max-width:118px;padding:2px 4px;background:rgba(15,35,34,0.88);color:#a7f3d0;border:1px solid rgba(16,185,129,0.42);border-radius:6px;">
        ${roleShortOpts}
      </select>
      <button class="pill-role-trigger-btn" data-pill-trigger-role="${p.id}" title="激发伴学赋能">⚡督学</button>
      <select class="pill-mini-btn" data-pill-expr="${p.id}" title="切换表情" style="width:auto!important;max-width:112px;padding:2px 4px;background:rgba(20,28,44,0.88);color:#fda4af;border:1px solid rgba(244,63,94,0.38);border-radius:6px;">
        ${exprShortOpts}
      </select>
      <select class="pill-mini-btn" data-pill-container="${p.id}" title="切换容器" style="width:auto!important;max-width:118px;padding:2px 4px;background:rgba(20,28,44,0.88);color:#fde68a;border:1px solid rgba(251,191,36,0.38);border-radius:6px;">
        ${contShortOpts}
      </select>
    `;
    pillsContainer.appendChild(pill);
  }

  pillsContainer.querySelectorAll('[data-pill-skin]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.pillSkin;
      const skinId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      const skMeta = SKIN_MATERIAL_CATALOG.find(x => x.id === skinId);
      if (col) {
        col.skinVariant = skinId;
        if (skMeta?.skinTone) col.skinTone = skMeta.skinTone;
        col.morphs = { ...(col.morphs || {}), skinVariant: skinId };
        persistCollectibles();
      }
      const petEntry = desktopEngine?.pets.get(id);
      const headGroup = petEntry?.node || petEntry?.headNode;
      if (headGroup) {
        if (skMeta?.skinTone) headGroup.userData.skinTone = skMeta.skinTone;
        setHeadSkinVariant(headGroup, skinId);
        desktopEngine.wakeRender(1.5, true);
      }
      const vcdSkinSel = document.getElementById('vcd-sel-skin-variant');
      if (vcdSkinSel) vcdSkinSel.value = skinId;
      showToast(`🎨 已为「${col ? col.name.split('·')[0].trim() : id}」切换无皱纹少女皮肤材质：${skMeta ? skMeta.label : skinId}`);
    });
  });

  pillsContainer.querySelectorAll('[data-pill-face]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.pillFace;
      const faceId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      if (col) {
        col.faceArchetype = faceId;
        col.morphs = { ...(col.morphs || {}), faceArchetype: faceId };
        persistCollectibles();
      }
      const petEntry = desktopEngine?.pets.get(id);
      const headGroup = petEntry?.node || petEntry?.headNode;
      if (headGroup) {
        setHeadFaceArchetype(headGroup, faceId);
        desktopEngine.wakeRender(1.5, true);
      }
      const fa = FACE_ARCHETYPE_CATALOG.find(x => x.id === faceId);
      showToast(`🍑 已为「${col ? col.name.split('·')[0].trim() : id}」切换中韩头型：${fa ? fa.label : faceId}`);
    });
  });

  pillsContainer.querySelectorAll('[data-pill-brow]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.pillBrow;
      const browId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      if (col) {
        col.eyebrowStyle = browId;
        col.morphs = { ...(col.morphs || {}), eyebrowStyle: browId };
        persistCollectibles();
      }
      const petEntry = desktopEngine?.pets.get(id);
      const headGroup = petEntry?.node || petEntry?.headNode;
      if (headGroup) {
        setHeadEyebrowStyle(headGroup, browId);
        desktopEngine.wakeRender(1.5, true);
      }
      const bw = EYEBROW_STYLE_CATALOG.find(x => x.id === browId);
      showToast(`✒️ 已为「${col ? col.name.split('·')[0].trim() : id}」切换 3D 眉毛模型：${bw ? bw.label : browId}`);
    });
  });

  pillsContainer.querySelectorAll('[data-pill-hair]').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = sel.dataset.pillHair;
      const hairId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      if (col) {
        col.hairStyle = hairId;
        persistCollectibles();
      }
      await desktopEngine.setPetHairStyle(id, hairId);
      renderVaultGrid();
      const hp = REAL_HAIR_CATALOG.find(x => x.id === hairId);
      showToast(`💇‍♀️ 已为「${col ? col.name.split('·')[0].trim() : id}」切换发型：${hp ? hp.label : hairId}`);
    });
  });

  pillsContainer.querySelectorAll('[data-pill-bangs]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.pillBangs;
      const bangsId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      if (col) {
        col.frontBangs = bangsId;
        col.morphs = { ...(col.morphs || {}), frontBangs: bangsId };
        persistCollectibles();
      }
      const petEntry = desktopEngine?.pets.get(id);
      const headGroup = petEntry?.node || petEntry?.headNode;
      if (headGroup) {
        if (petEntry.collectible) {
          petEntry.collectible.frontBangs = bangsId;
          petEntry.collectible.morphs = { ...(petEntry.collectible.morphs || {}), frontBangs: bangsId };
        }
        updateHairDesignOnGroup(headGroup, { frontBangs: bangsId });
        desktopEngine.wakeRender(1.5, true);
      }
      const bg = HAIR_FRONT_BANGS_CATALOG.find(x => x.id === bangsId);
      showToast(`✂️ 已为「${col ? col.name.split('·')[0].trim() : id}」拼装刘海模块：${bg ? bg.label : bangsId}`);
    });
  });

  pillsContainer.querySelectorAll('[data-pill-role]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.pillRole;
      const roleId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      const rm = getStudyRoleMeta(roleId);
      if (col) {
        col.studyRole = roleId;
        col.studyGoalNote = rm.desc;
        persistCollectibles();
      }
      if (desktopEngine && desktopEngine.pets.has(id)) {
        desktopEngine.pets.get(id).collectible.studyRole = roleId;
        desktopEngine.pets.get(id).collectible.studyGoalNote = rm.desc;
      }
      renderVaultGrid();
      showToast(`🎓 已为「${col ? col.name : id}」绑定伴学职能：${rm.label}`);
    });
  });

  pillsContainer.querySelectorAll('[data-pill-trigger-role]').forEach(btn => {
    btn.addEventListener('click', () => {
      executeCharacterStudyRole(btn.dataset.pillTriggerRole);
    });
  });

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
  pillsContainer.querySelectorAll('[data-pill-container]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.pillContainer;
      const contId = e.target.value;
      const col = state.collectibles.find(c => c.id === id);
      if (col) {
        col.containerStyle = contId;
        persistCollectibles();
      }
      desktopEngine.setPetContainerStyle(id, contId);
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
    return `内置高精头模 · ${tris} 三角面 · 贴图 ${texture}`;
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
    const hStats = studioEngine.headNode?.userData?.hairStats;
    const resolvedId = resolveRealHairStyle(state.studioDraft.hairStyle);
    const hCatalog = REAL_HAIR_CATALOG.find(x => x.id === resolvedId);
    status.textContent = formatAssetQuality(studioEngine.headNode?.userData?.assetStats) + (hStats ? ` · 双通道真发丝：${hStats.vertices.toLocaleString()} 顶点 / ${hStats.triangles.toLocaleString()} 三角面` : '');
    const groomStatus = document.getElementById('groom-quality-status');
    if (groomStatus) {
      groomStatus.textContent = hStats
        ? `当前 3D 发型：${hCatalog ? hCatalog.label : hStats.style} · ${hStats.vertices.toLocaleString()} 顶点 · ${hStats.triangles.toLocaleString()} 三角面（双通道真Alpha羽毛碎发 + Marschner各向异性光泽 + 9轴实时微调）`
        : '无发模式（完整检视颅面解剖与颈部切面）';
    }
    status.title = '双通道深度预写 + 真Alpha半透明羽毛碎发 + Marschner各向异性微纤维着色器。';
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

function syncStudioHairUI(hairStyle) {
  const resolved = resolveRealHairStyle(hairStyle);
  const sel = document.getElementById('sel-hair-style');
  if (sel) sel.value = resolved;
  document.querySelectorAll('[data-hair-preset]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.hairPreset === resolved);
  });
}

function loadCollectibleIntoStudio(col) {
  const deadExpr = col.deadExpression || col.morphs?.deadExpression || 'dead_calm';
  const resolvedHair = resolveRealHairStyle(col.hairStyle || 'hair_bob01');
  state.studioDraft = JSON.parse(JSON.stringify({
    basePreset: col.basePreset || 'user_photo',
    deadExpression: deadExpr,
    containerStyle: col.containerStyle || 'glass_bell_jar',
    decorStyle: col.decorStyle || 'trophy_candles',
    studyRole: col.studyRole || 'gaokao_pomodoro',
    studyGoalNote: col.studyGoalNote || '',
    customModelUrl: col.customModelUrl || null,
    customModelType: col.customModelType || 'glb',
    customHairUrl: col.customHairUrl || null,
    customHairType: col.customHairType || 'glb',
    skinTone: col.skinTone || '#ffe9df',
    blushIntensity: col.blushIntensity ?? 0.25,
    lipColor: col.lipColor || '#c46470',
    irisColor: col.irisColor || '#3b2014',
    hairStyle: resolvedHair,
    groomDensity: col.groomDensity || 6000,
    hairColor: col.hairColor || '#121216',
    hairSheen: col.hairSheen ?? 0.90,
    neckClearance: col.neckClearance ?? 0.45,
    photoElement: null,
    photoBlend: 0.0,
    morphs: {
      deadExpression: deadExpr,
      jawOpen: 0.0,
      eyeRollUp: 0.0,
      tongueOut: 0.0,
      jawSide: 0.0,
      bangsLength: 0.0,
      bangsParting: 0.0,
      hairVolume: 0.0,
      hairLength: 0.0,
      sideburnLock: 0.0,
      hairFlare: 0.0,
      hairOffsetY: 0.0,
      hairOffsetZ: 0.0,
      hairScale: 1.0,
      ...(col.morphs || {})
    },
    anatomyOptions: { ...col.anatomyOptions }
  }));

  document.getElementById('sel-base-preset').value = state.studioDraft.basePreset;
  syncStudioHairUI(state.studioDraft.hairStyle);
  const selGroom = document.getElementById('sel-groom-density');
  if (selGroom) selGroom.value = String(state.studioDraft.groomDensity || 6000);
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
  const selColCont = document.getElementById('sel-col-container');
  if (selColCont) selColCont.value = state.studioDraft.containerStyle;
  const selColDecor = document.getElementById('sel-col-decor');
  if (selColDecor) selColDecor.value = state.studioDraft.decorStyle;
  const inpVit = document.getElementById('inp-col-vitality');
  if (inpVit && col.fateRecord?.vitalityStatus) inpVit.value = col.fateRecord.vitalityStatus;
  const inpCause = document.getElementById('inp-col-cause');
  if (inpCause && col.fateRecord?.causeOfDeath) inpCause.value = col.fateRecord.causeOfDeath;

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
  const win = document.getElementById('software-window');
  if (win) {
    win.classList.toggle('studio-active-wide', tabId === 'studio');
  }
  if (tabId === 'studio') {
    document.getElementById('structure-floating-hud')?.classList.add('hidden');
    if (studioEngine) {
      setTimeout(() => studioEngine.resize(), 40);
      setTimeout(() => studioEngine.resize(), 250);
    }
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
      if (state.rainStudyAudioEnabled) soundEngine.startRainAmbience();
      showToast('🌧️ 已进入雨夜书房 3D 断头桌宠伴学模式！窗外细雨已开启 | 拖拽人头可放入/拎出收纳建筑');
    });
  }

  if (btnStartStudio) {
    btnStartStudio.addEventListener('click', () => {
      if (startOverlay) startOverlay.classList.add('hidden');
      setWindowVisibility(false);
      soundEngine.playSummon(true);
      if (state.rainStudyAudioEnabled) soundEngine.startRainAmbience();
      showToast('🛠️ 已进入 CERVIX-3D 典藏库与建模工坊！窗外伴学小雨已开启，可随时隐藏窗口看屏幕桌宠');
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
    onStructureSelect: updateStructureFloatingHUD,
    onPetStateUpdate: (list) => {
      renderActivePetsStrip(list);
      renderVaultGrid();
    },
    onStructuresUpdate: (structList) => {
      renderPlacedStructuresList(structList);
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

  document.getElementById('btn-struct-hud-eject')?.addEventListener('click', () => {
    const hud = document.getElementById('structure-floating-hud');
    const structId = hud?.dataset?.structId;
    if (structId && desktopEngine) {
      desktopEngine.ejectHeadFromStructure(structId);
      showToast('📤 已将头颅从收纳建筑中单独取出，现在可分开摆放建筑与头颅！');
    }
  });

  document.getElementById('btn-struct-hud-delete')?.addEventListener('click', () => {
    const hud = document.getElementById('structure-floating-hud');
    const structId = hud?.dataset?.structId;
    if (structId && desktopEngine) {
      desktopEngine.removeContainerStructure(structId);
      showToast('🗑️ 已删除选中的 3D 建筑/层架/摆件！');
    }
  });

  document.getElementById('btn-struct-hud-close')?.addEventListener('click', () => {
    const hud = document.getElementById('structure-floating-hud');
    if (hud) {
      hud.classList.add('hidden');
      hud.dataset.structId = '';
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

  // Summon initial default collectibles onto the computer screen (pure severed heads, not bound to containers!)
  for (const item of state.collectibles) {
    if (item.summoned) {
      try { await desktopEngine.summonCollectible(item); }
      catch (error) { console.warn(`藏品「${item.name}」暂无法恢复：`, error); }
    }
  }
  // Place 2 independent 3D Specimen Container Structures on the desk so user can freely drag them or drop heads into them!
  desktopEngine.placeContainerStructure('glass_bell_jar', { x: -20, z: -15, playSound: false });
  desktopEngine.placeContainerStructure('velvet_chalice', { x: 20, z: -15, playSound: false });
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
        state.studioDraft.lifePhotoDataUrl = ev.target.result;
        document.getElementById('photo-status-badge').textContent = `已载入生前照片：${file.name}`;
        // Automatically enable 3D reference photo projection at 35% when user uploads a photo!
        state.studioDraft.photoBlend = Math.max(0.35, Number(state.studioDraft.photoBlend || 0));
        const projSlider = document.getElementById('slider-photo-proj');
        const projVal = document.getElementById('val-photo-proj');
        if (projSlider) projSlider.value = String(state.studioDraft.photoBlend);
        if (projVal) projVal.textContent = `${Math.round(state.studioDraft.photoBlend * 100)}%`;
        studioEngine.updateMaterialsFast({
          photoElement: img,
          lifePhotoUrl: ev.target.result,
          photoBlend: state.studioDraft.photoBlend,
        });
        showToast(`📸 已载入角色生前照片「${file.name}」，并已同步开启 3D 照片正交投射！`);
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('btn-auto-sample-photo').addEventListener('click', () => {
    const srcEl = state.studioDraft.photoElement || refPhotoCanvas;
    const sampled = samplePhotoColors(srcEl);
    state.studioDraft.skinTone = sampled.skinTone;
    state.studioDraft.lipColor = sampled.lipColor || state.studioDraft.lipColor;
    state.studioDraft.hairColor = sampled.hairColor || state.studioDraft.hairColor;
    document.getElementById('col-skin').value = sampled.skinTone;
    if (sampled.lipColor && document.getElementById('col-lip')) {
      document.getElementById('col-lip').value = sampled.lipColor;
    }
    if (sampled.hairColor && document.getElementById('col-hair')) {
      document.getElementById('col-hair').value = sampled.hairColor;
    }
    studioEngine.setCameraPreset('front');
    studioEngine.updateMaterialsFast({
      skinTone: state.studioDraft.skinTone,
      lipColor: state.studioDraft.lipColor,
      hairColor: state.studioDraft.hairColor,
      photoElement: srcEl,
    });
    soundEngine.playSummon(true);
    showToast(`✨ 已从参考照片智能提取肤色 (${sampled.skinTone})、唇色 (${sampled.lipColor}) 与发色 (${sampled.hairColor}) 并对齐正面机位！`);
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

  const REAL_HAIRS = REAL_HAIR_CATALOG.filter(x => x.id !== 'none').map(x => ({
    id: x.id,
    name: x.label
  }));
  let hairCycleIdx = 0;

  // Dynamically populate #sel-hair-style with all 28 hairstyles grouped by category
  const selHairEl = document.getElementById('sel-hair-style');
  if (selHairEl) {
    const groups = new Map();
    for (const item of REAL_HAIR_CATALOG) {
      const cat = item.category || '精选发型';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(item);
    }
    let html = '';
    for (const [catName, list] of groups.entries()) {
      html += `<optgroup label="── ${catName} (${list.length}款) ──">`;
      for (const hp of list) {
        html += `<option value="${hp.id}" ${hp.id === state.studioDraft.hairStyle ? 'selected' : ''}>${hp.label}</option>`;
      }
      html += `</optgroup>`;
    }
    selHairEl.innerHTML = html;
  }

  document.getElementById('btn-test-scan-glb').addEventListener('click', async () => {
    hairCycleIdx = (hairCycleIdx + 1) % REAL_HAIRS.length;
    const picked = REAL_HAIRS[hairCycleIdx];
    state.studioDraft.customHairUrl = null;
    state.studioDraft.hairStyle = picked.id;
    syncStudioHairUI(picked.id);
    document.getElementById('custom-model-status').textContent = `内置高精头模 + ${picked.name}`;
    await refreshStudio3DModel();
    soundEngine.playSummon(true);
    showToast(`💇‍♀️ 已切换大师级真发丝 3D 发型 (${hairCycleIdx + 1}/${REAL_HAIRS.length})：${picked.name}`);
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

  const syncStudioSkinVariantUI = (skinId) => {
    const sel = document.getElementById('sel-skin-variant');
    if (sel) sel.value = skinId;
    document.querySelectorAll('[data-skin-var]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.skinVar === skinId);
    });
  };

  const syncStudioHeadBlendSliders = (blendState) => {
    if (!blendState) return;
    document.querySelectorAll('[data-studio-head-blend]').forEach(inp => {
      const k = inp.dataset.studioHeadBlend;
      const v = Number(blendState[k] ?? 0);
      inp.value = String(v);
      const valSpan = document.querySelector(`[data-studio-head-blend-val="${k}"]`);
      if (valSpan) valSpan.textContent = `${Math.round(v * 100)}%`;
      state.studioDraft.morphs[k] = v;
    });
  };

  const syncStudioFaceArchetypeUI = (archId) => {
    const sel = document.getElementById('sel-face-archetype');
    if (sel) sel.value = archId;
    document.querySelectorAll('[data-face-arch]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.faceArch === archId);
    });
  };

  const syncStudioEyebrowStyleUI = (browId) => {
    const sel = document.getElementById('sel-eyebrow-style');
    if (sel) sel.value = browId;
    document.querySelectorAll('[data-brow-style]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.browStyle === browId);
    });
  };

  const applyStudioSkinVariant = (skinId) => {
    state.studioDraft.skinVariant = skinId;
    state.studioDraft.morphs.skinVariant = skinId;
    const skMeta = SKIN_MATERIAL_CATALOG.find(x => x.id === skinId);
    if (skMeta?.skinTone) {
      state.studioDraft.skinTone = skMeta.skinTone;
      const colSkin = document.getElementById('col-skin');
      if (colSkin) colSkin.value = skMeta.skinTone;
    }
    syncStudioSkinVariantUI(skinId);
    if (studioEngine?.headNode) {
      if (skMeta?.skinTone) studioEngine.headNode.userData.skinTone = skMeta.skinTone;
      setHeadSkinVariant(studioEngine.headNode, skinId);
      studioEngine.wakeRender(1.5, true);
    }
    if (skMeta) showToast(`🎨 已切换无皱纹少女皮肤材质：${skMeta.label}`);
  };

  const applyStudioFaceArchetype = (archId) => {
    state.studioDraft.faceArchetype = archId;
    state.studioDraft.morphs.faceArchetype = archId;
    for (const ch of HEAD_BLEND_CHANNELS) {
      delete state.studioDraft.morphs[ch.id];
    }
    syncStudioFaceArchetypeUI(archId);
    if (studioEngine?.headNode) {
      setHeadFaceArchetype(studioEngine.headNode, archId);
      syncStudioHeadBlendSliders(getHeadBlendStateFromGroup(studioEngine.headNode));
      studioEngine.wakeRender(1.5, true);
    }
    const fa = FACE_ARCHETYPE_CATALOG.find(x => x.id === archId);
    if (fa) showToast(`🍑 已切换头模流派并同步 7 通道混合器：${fa.label}`);
  };

  const applyStudioEyebrowStyle = (browId) => {
    state.studioDraft.eyebrowStyle = browId;
    state.studioDraft.morphs.eyebrowStyle = browId;
    syncStudioEyebrowStyleUI(browId);
    if (studioEngine?.headNode) {
      setHeadEyebrowStyle(studioEngine.headNode, browId);
      studioEngine.wakeRender(1.5, true);
    }
    const bw = EYEBROW_STYLE_CATALOG.find(x => x.id === browId);
    if (bw) showToast(`✒️ 已切换 3D 眉毛模型：${bw.label}`);
  };

  document.getElementById('sel-skin-variant')?.addEventListener('change', (e) => {
    applyStudioSkinVariant(e.target.value);
  });
  document.querySelectorAll('[data-skin-var]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyStudioSkinVariant(btn.dataset.skinVar);
    });
  });

  document.getElementById('sel-face-archetype')?.addEventListener('change', (e) => {
    applyStudioFaceArchetype(e.target.value);
  });
  document.querySelectorAll('[data-face-arch]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyStudioFaceArchetype(btn.dataset.faceArch);
    });
  });

  document.querySelectorAll('[data-studio-head-blend]').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const k = inp.dataset.studioHeadBlend;
      const v = parseFloat(e.target.value);
      const valSpan = document.querySelector(`[data-studio-head-blend-val="${k}"]`);
      if (valSpan) valSpan.textContent = `${Math.round(v * 100)}%`;
      state.studioDraft.morphs[k] = v;
      if (studioEngine?.headNode) {
        studioEngine.headNode.userData.morphs = {
          ...(studioEngine.headNode.userData.morphs || {}),
          ...state.studioDraft.morphs,
          [k]: v,
        };
        applyHeadMorphsToGroup(studioEngine.headNode, studioEngine.headNode.userData.morphs);
        studioEngine.wakeRender(1.5, true);
      }
    });
  });

  document.getElementById('sel-eyebrow-style')?.addEventListener('change', (e) => {
    applyStudioEyebrowStyle(e.target.value);
  });
  document.querySelectorAll('[data-brow-style]').forEach(btn => {
    btn.addEventListener('click', () => {
      applyStudioEyebrowStyle(btn.dataset.browStyle);
    });
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
      fangyaoping: 'hair_user_photo',
      user_photo: 'hair_user_photo',
      linxi: 'hair_long01',
      suwan: 'hair_braid01',
      qianxue: 'daz_hair_hime',
      shenzhiwei: 'daz_hair_curtain_wave'
    };
    const presetFaceMap = {
      fangyaoping: 'cn_oval_scholar',
      user_photo: 'cn_round_babyface',
      linxi: 'kr_idol_vline',
      suwan: 'cn_classical_melon',
      qianxue: 'kr_sweet_heart',
      shenzhiwei: 'cn_cold_royal'
    };
    const presetBrowMap = {
      fangyaoping: 'cn_scholar_natural',
      user_photo: 'kr_straight_mist',
      linxi: 'kr_idol_arch',
      suwan: 'cn_willow_classical',
      qianxue: 'kr_sweet_droop',
      shenzhiwei: 'cn_cold_sword'
    };
    const presetSkinVariantMap = {
      fangyaoping: 'cn_scholar_natural',
      user_photo: 'kr_dewy_peach',
      linxi: 'kr_chaebol_cool',
      suwan: 'cn_jiangnan_jade',
      qianxue: 'kr_firstlove_camellia',
      shenzhiwei: 'cn_intellectual_olive'
    };
    const presetSkinMap = {
      fangyaoping: '#fae3d2',
      user_photo: '#ffeae4',
      linxi: '#fcf3f6',
      suwan: '#fdf2e5',
      qianxue: '#fff1f3',
      shenzhiwei: '#f8ece4'
    };
    const presetExprMap = {
      fangyaoping: 'dead_calm',
      user_photo: 'dead_calm',
      linxi: 'dead_calm',
      suwan: 'dead_half_open',
      qianxue: 'dead_shock',
      shenzhiwei: 'dead_smile'
    };
    const ZERO_SCULPT = { jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 };
    const presetMorphMap = {
      fangyaoping: { ...ZERO_SCULPT, frontBangs: 'wispy_air', sideLocks: 'photo_wisp', backAttachment: 'high_ponytail' },
      user_photo:  { ...ZERO_SCULPT, frontBangs: 'wispy_air', sideLocks: 'photo_wisp', backAttachment: 'high_ponytail' },
      linxi:       { ...ZERO_SCULPT, frontBangs: 'default', sideLocks: 'default', backAttachment: 'none' },
      suwan:       { ...ZERO_SCULPT, frontBangs: 'default', sideLocks: 'default', backAttachment: 'none' },
      qianxue:     { ...ZERO_SCULPT, frontBangs: 'default', sideLocks: 'default', backAttachment: 'none' },
      shenzhiwei:  { ...ZERO_SCULPT, frontBangs: 'default', sideLocks: 'default', backAttachment: 'none' },
    };
    if (e.target.value === 'fangyaoping' || e.target.value === 'user_photo') {
      drawPresetReferencePortrait(refPhotoCanvas, e.target.value);
    }
    for (const ch of HEAD_BLEND_CHANNELS) {
      state.studioDraft.morphs[ch.id] = 0.0;
    }
    syncStudioHeadBlendSliders({
      blend_asian_youth: 0.0,
      blend_cn_scholar: 0.0,
      blend_cn_baby: 0.0,
      blend_kr_vline: 0.0,
      blend_cn_melon: 0.0,
      blend_cn_royal: 0.0,
      blend_eurasian: 0.0,
    });
    if (presetHairMap[e.target.value]) {
      state.studioDraft.hairStyle = presetHairMap[e.target.value];
      syncStudioHairUI(state.studioDraft.hairStyle);
    }
    if (presetFaceMap[e.target.value]) {
      state.studioDraft.faceArchetype = presetFaceMap[e.target.value];
      state.studioDraft.morphs.faceArchetype = presetFaceMap[e.target.value];
      syncStudioFaceArchetypeUI(presetFaceMap[e.target.value]);
    }
    if (presetBrowMap[e.target.value]) {
      state.studioDraft.eyebrowStyle = presetBrowMap[e.target.value];
      state.studioDraft.morphs.eyebrowStyle = presetBrowMap[e.target.value];
      syncStudioEyebrowStyleUI(presetBrowMap[e.target.value]);
    }
    if (presetSkinVariantMap[e.target.value]) {
      state.studioDraft.skinVariant = presetSkinVariantMap[e.target.value];
      state.studioDraft.morphs.skinVariant = presetSkinVariantMap[e.target.value];
      syncStudioSkinVariantUI(presetSkinVariantMap[e.target.value]);
    }
    if (presetSkinMap[e.target.value]) {
      state.studioDraft.skinTone = presetSkinMap[e.target.value];
      const colSkin = document.getElementById('col-skin');
      if (colSkin) colSkin.value = presetSkinMap[e.target.value];
    }
    if (presetExprMap[e.target.value]) {
      state.studioDraft.deadExpression = presetExprMap[e.target.value];
      state.studioDraft.morphs.deadExpression = presetExprMap[e.target.value];
      syncStudioExpressionUI(presetExprMap[e.target.value]);
    }
    if (presetMorphMap[e.target.value]) {
      Object.assign(state.studioDraft.morphs, presetMorphMap[e.target.value]);
      state.studioDraft.frontBangs = state.studioDraft.morphs.frontBangs || 'default';
      state.studioDraft.sideLocks = state.studioDraft.morphs.sideLocks || 'default';
      state.studioDraft.backAttachment = state.studioDraft.morphs.backAttachment || 'none';
      for (const [sId, vId, mKey] of [
        ['morph-jaw', 'val-morph-jaw', 'jawVLine'],
        ['morph-cheek', 'val-morph-cheek', 'cheekSoftness'],
        ['morph-nose', 'val-morph-nose', 'noseBridge'],
        ['morph-eye', 'val-morph-eye', 'eyeAlmond'],
        ['morph-lip', 'val-morph-lip', 'lipFullness'],
      ]) {
        const sEl = document.getElementById(sId);
        const vEl = document.getElementById(vId);
        const val = Number(state.studioDraft.morphs[mKey] ?? 0);
        if (sEl) sEl.value = String(val);
        if (vEl) vEl.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(2)}`;
      }
    }
    document.getElementById('custom-model-status').textContent = `内置高定头模 (${e.target.value} + ${state.studioDraft.hairStyle})`;
    await refreshStudio3DModel();
  });

  // Stage 36: Clean 6-Sub-Tab Categorized Workbench Switching in Studio Right Column
  const studioColRight = document.querySelector('.studio-col-right');
  const expandAllBtn = document.getElementById('btn-studio-expand-all');
  document.querySelectorAll('[data-studio-subtab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const subId = btn.dataset.studioSubtab;
      if (studioColRight) studioColRight.classList.remove('expand-all-mode');
      if (expandAllBtn) expandAllBtn.textContent = '📑 全部展开';
      document.querySelectorAll('[data-studio-subtab]').forEach(b => {
        b.classList.toggle('active', b.dataset.studioSubtab === subId);
      });
      document.querySelectorAll('.studio-subtab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.subtabPanel === subId);
      });
    });
  });
  if (expandAllBtn && studioColRight) {
    expandAllBtn.addEventListener('click', () => {
      const expanded = studioColRight.classList.toggle('expand-all-mode');
      expandAllBtn.textContent = expanded ? '🗂️ 分页收起' : '📑 全部展开';
      showToast(expanded ? '📑 已展开右侧工作台全部 6 大微调面板' : '🗂️ 已切换回清爽分类子页签模式');
    });
  }

  const bindMorphSlider = (id, valId, key, unit = '') => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      state.studioDraft.morphs[key] = v;
      const valEl = document.getElementById(valId);
      if (valEl) {
        if (unit === '%') {
          valEl.textContent = `${Math.round(v * 100)}%`;
        } else {
          valEl.textContent = `${v >= 0 ? '+' : ''}${v.toFixed(unit === '°' || unit === 'cm' ? 1 : 2)}${unit}`;
        }
      }
      studioEngine.updateMorphsFast(state.studioDraft.morphs);
    });
  };

  bindMorphSlider('morph-jaw-open', 'val-morph-jaw-open', 'jawOpen');
  bindMorphSlider('morph-eye-roll', 'val-morph-eye-roll', 'eyeRollUp');
  bindMorphSlider('morph-tongue-out', 'val-morph-tongue-out', 'tongueOut');
  bindMorphSlider('morph-jaw-side', 'val-morph-jaw-side', 'jawSide');
  bindMorphSlider('morph-bangs-len', 'val-morph-bangs-len', 'bangsLength');
  bindMorphSlider('morph-bangs-part', 'val-morph-bangs-part', 'bangsParting');
  bindMorphSlider('morph-hair-vol', 'val-morph-hair-vol', 'hairVolume');
  bindMorphSlider('morph-hair-len', 'val-morph-hair-len', 'hairLength');
  bindMorphSlider('morph-sideburn-lock', 'val-morph-sideburn-lock', 'sideburnLock');
  bindMorphSlider('morph-hair-flare', 'val-morph-hair-flare', 'hairFlare');
  bindMorphSlider('morph-hair-curl', 'val-morph-hair-curl', 'hairCurlWave');
  bindMorphSlider('morph-hair-off-y', 'val-morph-hair-off-y', 'hairOffsetY');
  bindMorphSlider('morph-hair-off-z', 'val-morph-hair-off-z', 'hairOffsetZ');
  bindMorphSlider('morph-hair-scale', 'val-morph-hair-scale', 'hairScale', '%');

  // Stage 36: Full-Range 19-Axis Facial & Cranial Shape Sliders
  const SHAPE_MORPH_SLIDERS = [
    ['morph-jaw', 'val-morph-jaw', 'jawVLine'],
    ['morph-chin', 'val-morph-chin', 'chinLength'],
    ['morph-cheek', 'val-morph-cheek', 'cheekSoftness'],
    ['morph-nose', 'val-morph-nose', 'noseBridge'],
    ['morph-nose-width', 'val-morph-nose-width', 'noseWidth'],
    ['morph-eye', 'val-morph-eye', 'eyeAlmond'],
    ['morph-eye-tilt', 'val-morph-eye-tilt', 'eyeTilt'],
    ['morph-eyelid-open', 'val-morph-eyelid-open', 'eyelidOpen'],
    ['morph-brow-height', 'val-morph-brow-height', 'browHeight'],
    ['morph-brow-tilt', 'val-morph-brow-tilt', 'browTilt'],
    ['morph-brow-thick', 'val-morph-brow-thick', 'browThickness'],
    ['morph-lip', 'val-morph-lip', 'lipFullness'],
    ['morph-mouth-smile', 'val-morph-mouth-smile', 'mouthSmile'],
    ['morph-forehead', 'val-morph-forehead', 'foreheadHeight'],
    ['morph-ear', 'val-morph-ear', 'earSize'],
    ['morph-head-width', 'val-morph-head-width', 'headWidth'],
    ['morph-head-length', 'val-morph-head-length', 'headLength'],
    ['morph-gaze-yaw', 'val-morph-gaze-yaw', 'gazeYaw'],
    ['morph-gaze-pitch', 'val-morph-gaze-pitch', 'gazePitch'],
  ];
  for (const [sId, vId, mKey] of SHAPE_MORPH_SLIDERS) {
    bindMorphSlider(sId, vId, mKey);
  }

  document.getElementById('btn-reset-shape-morphs')?.addEventListener('click', () => {
    for (const [sId, vId, mKey] of SHAPE_MORPH_SLIDERS) {
      state.studioDraft.morphs[mKey] = 0.0;
      const sEl = document.getElementById(sId);
      const vEl = document.getElementById(vId);
      if (sEl) sEl.value = '0';
      if (vEl) vEl.textContent = '+0.00';
    }
    studioEngine.updateMorphsFast(state.studioDraft.morphs);
    showToast('↺ 已将全部 19 项面部骨相与五官形状滑杆归零');
  });

  bindMorphSlider('morph-cut-height', 'val-cut-height', 'cutHeightOffset', 'cm');
  bindMorphSlider('morph-cut-pitch', 'val-cut-pitch', 'cutTiltPitch', '°');

  // Reset hair fine-tuning morphs button
  document.getElementById('btn-reset-hair-morphs')?.addEventListener('click', () => {
    const hairDefaults = {
      bangsLength: 0.0,
      bangsParting: 0.0,
      hairVolume: 0.0,
      hairLength: 0.0,
      sideburnLock: 0.0,
      hairFlare: 0.0,
      hairCurlWave: 0.0,
      hairOffsetY: 0.0,
      hairOffsetZ: 0.0,
      hairScale: 1.0,
    };
    Object.assign(state.studioDraft.morphs, hairDefaults);
    for (const [sId, vId] of [
      ['morph-bangs-len', 'val-morph-bangs-len'],
      ['morph-bangs-part', 'val-morph-bangs-part'],
      ['morph-hair-vol', 'val-morph-hair-vol'],
      ['morph-hair-len', 'val-morph-hair-len'],
      ['morph-sideburn-lock', 'val-morph-sideburn-lock'],
      ['morph-hair-flare', 'val-morph-hair-flare'],
      ['morph-hair-curl', 'val-morph-hair-curl'],
      ['morph-hair-off-y', 'val-morph-hair-off-y'],
      ['morph-hair-off-z', 'val-morph-hair-off-z'],
    ]) {
      const sEl = document.getElementById(sId);
      const vEl = document.getElementById(vId);
      if (sEl) sEl.value = '0';
      if (vEl) vEl.textContent = '+0.00';
    }
    const scaleEl = document.getElementById('morph-hair-scale');
    const scaleValEl = document.getElementById('val-morph-hair-scale');
    if (scaleEl) scaleEl.value = '1.00';
    if (scaleValEl) scaleValEl.textContent = '100%';
    studioEngine.updateMorphsFast(state.studioDraft.morphs);
    showToast('↺ 已重置当前发型全部 10 轴微调参数至艺术家出厂形态');
  });

  // Custom 3D hair model (.GLB / .OBJ) import
  document.getElementById('inp-custom-hair-model')?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.toLowerCase().endsWith('.obj') ? 'obj' : 'glb';
    const blobUrl = URL.createObjectURL(file);
    state.studioDraft.customHairUrl = blobUrl;
    state.studioDraft.customHairType = ext;
    await refreshStudio3DModel();
    showToast(`💇‍♀️ 已导入外部 3D 发型模型「${file.name}」，可用下方 10 轴滑杆实时微调大小与位置！`);
  });

  // ==========================================================================
  // STAGE 36: 0ms GPU LIVE COLOR, MAKEUP, SKIN DERMIS, EYE & PHOTO PROJECTION
  // ==========================================================================
  const applyLiveMaterialPatch = (patch = {}) => {
    Object.assign(state.studioDraft, patch);
    Object.assign(state.studioDraft.morphs, patch);
    if (studioEngine) {
      studioEngine.updateMaterialsFast(patch);
    }
    // Also sync to the selected desktop pet in the 3D Box Space if active
    const pet = desktopEngine?.pets?.get(state.studioDraft.id) || desktopEngine?.pets?.values()?.next()?.value;
    const headGroup = pet?.node || pet?.headNode;
    if (headGroup) {
      updateCollectibleMaterialsLive(headGroup, patch);
      desktopEngine.wakeRender(1.5, true);
    }
  };

  for (const [id, key] of [
    ['col-skin', 'skinTone'],
    ['col-lip', 'lipColor'],
    ['col-blush', 'blushColor'],
    ['col-eyeshadow', 'eyeshadowColor'],
    ['col-iris', 'irisColor'],
    ['col-brow', 'browColor'],
    ['col-hair', 'hairColor'],
    ['col-hair-highlight', 'hairHighlightColor'],
  ]) {
    document.getElementById(id)?.addEventListener('input', (e) => {
      const hex = e.target.value;
      const patch = { [key]: hex };
      // If user picks a custom lip/blush/eyeshadow/iris color, ensure its strength is visible!
      if (key === 'lipColor' && Number(state.studioDraft.lipStrength ?? 0.65) < 0.25) {
        patch.lipStrength = 0.65;
        const sl = document.getElementById('slider-lip-strength');
        const vl = document.getElementById('val-lip-strength');
        if (sl) sl.value = '0.65';
        if (vl) vl.textContent = '65%';
      } else if (key === 'blushColor' && Number(state.studioDraft.blushIntensity ?? 0.28) < 0.15) {
        patch.blushIntensity = 0.32;
        const sl = document.getElementById('slider-blush');
        const vl = document.getElementById('val-blush');
        if (sl) sl.value = '0.32';
        if (vl) vl.textContent = '32%';
      } else if (key === 'eyeshadowColor' && Number(state.studioDraft.eyeshadowIntensity ?? 0.20) < 0.12) {
        patch.eyeshadowIntensity = 0.28;
        const sl = document.getElementById('slider-eyeshadow');
        const vl = document.getElementById('val-eyeshadow');
        if (sl) sl.value = '0.28';
        if (vl) vl.textContent = '28%';
      } else if (key === 'hairHighlightColor' && Number(state.studioDraft.hairHighlightStrength ?? 0) < 0.20) {
        patch.hairHighlightStrength = 0.45;
        const sl = document.getElementById('slider-hair-highlight');
        const vl = document.getElementById('val-hair-highlight');
        if (sl) sl.value = '0.45';
        if (vl) vl.textContent = '45%';
      }
      applyLiveMaterialPatch(patch);
    });
  }

  const bindLiveMaterialSlider = (id, valId, key, fmt = 'pct') => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      const valEl = document.getElementById(valId);
      if (valEl) {
        if (fmt === 'pct') valEl.textContent = `${Math.round(v * 100)}%`;
        else if (fmt === 'signed') valEl.textContent = `${v >= 0 ? '+' : ''}${v.toFixed(2)}`;
        else valEl.textContent = v.toFixed(2);
      }
      const patch = { [key]: v };
      if (key === 'photoBlend' || key === 'photoProjScale' || key === 'photoProjOffsetX' || key === 'photoProjOffsetY') {
        patch.photoElement = state.studioDraft.photoElement || refPhotoCanvas;
        patch.lifePhotoUrl = state.studioDraft.lifePhotoDataUrl;
      }
      applyLiveMaterialPatch(patch);
    });
  };

  bindLiveMaterialSlider('slider-skin-warmth', 'val-skin-warmth', 'skinWarmth', 'signed');
  bindLiveMaterialSlider('slider-skin-brightness', 'val-skin-brightness', 'skinBrightness', 'pct');
  bindLiveMaterialSlider('slider-skin-rosiness', 'val-skin-rosiness', 'skinRosiness', 'pct');
  bindLiveMaterialSlider('slider-blush', 'val-blush', 'blushIntensity', 'pct');
  bindLiveMaterialSlider('slider-eyeshadow', 'val-eyeshadow', 'eyeshadowIntensity', 'pct');
  bindLiveMaterialSlider('slider-lip-strength', 'val-lip-strength', 'lipStrength', 'pct');
  bindLiveMaterialSlider('slider-lip-gloss', 'val-lip-gloss', 'lipGloss', 'pct');
  bindLiveMaterialSlider('slider-iris-mix', 'val-iris-mix', 'irisMix', 'pct');
  bindLiveMaterialSlider('slider-brow-opacity', 'val-brow-opacity', 'browOpacity', 'pct');
  bindLiveMaterialSlider('slider-hair-highlight', 'val-hair-highlight', 'hairHighlightStrength', 'pct');

  // Stage 36: Anti-Silicone Dermis, Eye Optics & 3D Photo Projection Sliders
  bindLiveMaterialSlider('slider-pore-relief', 'val-pore-relief', 'poreRelief', 'pct');
  bindLiveMaterialSlider('slider-skin-roughness', 'val-skin-roughness', 'skinRoughness', 'dec');
  bindLiveMaterialSlider('slider-skin-mottle', 'val-skin-mottle', 'skinMottle', 'pct');
  bindLiveMaterialSlider('slider-aegyosal', 'val-aegyosal', 'aegyoSal', 'pct');
  bindLiveMaterialSlider('slider-dark-circles', 'val-dark-circles', 'darkCircles', 'pct');
  bindLiveMaterialSlider('slider-freckles', 'val-freckles', 'freckles', 'pct');
  bindLiveMaterialSlider('slider-iris-scale', 'val-iris-scale', 'irisScale', 'pct');
  bindLiveMaterialSlider('slider-pupil-size', 'val-pupil-size', 'pupilSize', 'pct');
  bindLiveMaterialSlider('slider-eye-catchlight', 'val-eye-catchlight', 'eyeCatchlight', 'pct');
  bindLiveMaterialSlider('slider-photo-proj', 'val-photo-proj', 'photoBlend', 'pct');
  bindLiveMaterialSlider('slider-photo-proj-scale', 'val-photo-proj-scale', 'photoProjScale', 'pct');
  bindLiveMaterialSlider('slider-photo-proj-x', 'val-photo-proj-x', 'photoProjOffsetX', 'signed');
  bindLiveMaterialSlider('slider-photo-proj-y', 'val-photo-proj-y', 'photoProjOffsetY', 'signed');

  document.getElementById('sel-beauty-mark')?.addEventListener('change', (e) => {
    applyLiveMaterialPatch({ beautyMark: parseInt(e.target.value, 10) || 0 });
  });

  document.getElementById('btn-reset-color-tuning')?.addEventListener('click', () => {
    const colorDefaults = {
      skinTone: '#fae3d2',
      lipColor: '#c45866',
      blushColor: '#e87a88',
      eyeshadowColor: '#b8766c',
      irisColor: '#3b2316',
      browColor: '#261e1c',
      hairColor: '#121216',
      hairTipColor: '#4a3528',
      hairHighlightColor: '#8c6244',
      skinWarmth: 0.0,
      skinBrightness: 1.0,
      skinRosiness: 0.25,
      blushIntensity: 0.22,
      eyeshadowIntensity: 0.18,
      lipStrength: 0.38,
      lipGloss: 0.48,
      irisMix: 0.42,
      browOpacity: 0.94,
      hairHighlightStrength: 0.0,
    };
    for (const [id, val] of [
      ['col-skin', colorDefaults.skinTone],
      ['col-lip', colorDefaults.lipColor],
      ['col-blush', colorDefaults.blushColor],
      ['col-eyeshadow', colorDefaults.eyeshadowColor],
      ['col-iris', colorDefaults.irisColor],
      ['col-brow', colorDefaults.browColor],
      ['col-hair', colorDefaults.hairColor],
      ['col-hair-tip', colorDefaults.hairTipColor],
      ['col-hair-highlight', colorDefaults.hairHighlightColor],
    ]) {
      const el = document.getElementById(id);
      if (el) el.value = val;
    }
    for (const [sId, vId, val, txt] of [
      ['slider-skin-warmth', 'val-skin-warmth', 0.0, '+0.00'],
      ['slider-skin-brightness', 'val-skin-brightness', 1.0, '100%'],
      ['slider-skin-rosiness', 'val-skin-rosiness', 0.25, '25%'],
      ['slider-blush', 'val-blush', 0.22, '22%'],
      ['slider-eyeshadow', 'val-eyeshadow', 0.18, '18%'],
      ['slider-lip-strength', 'val-lip-strength', 0.38, '38%'],
      ['slider-lip-gloss', 'val-lip-gloss', 0.48, '48%'],
      ['slider-iris-mix', 'val-iris-mix', 0.42, '42%'],
      ['slider-brow-opacity', 'val-brow-opacity', 0.94, '94%'],
      ['slider-hair-highlight', 'val-hair-highlight', 0.0, '0%'],
    ]) {
      const sEl = document.getElementById(sId);
      const vEl = document.getElementById(vId);
      if (sEl) sEl.value = String(val);
      if (vEl) vEl.textContent = txt;
    }
    applyLiveMaterialPatch(colorDefaults);
    showToast('↺ 已恢复自然原生肤色与彩妆配色');
  });

  document.getElementById('sel-groom-density')?.addEventListener('change', async e => {
    state.studioDraft.groomDensity = Number(e.target.value);
    await refreshStudio3DModel();
  });
  document.getElementById('sel-hair-style').addEventListener('change', async (e) => {
    state.studioDraft.customHairUrl = null;
    state.studioDraft.hairStyle = e.target.value;
    syncStudioHairUI(state.studioDraft.hairStyle);
    await refreshStudio3DModel();
  });
  document.querySelectorAll('[data-hair-preset]').forEach(btn => {
    btn.addEventListener('click', async () => {
      state.studioDraft.customHairUrl = null;
      state.studioDraft.hairStyle = btn.dataset.hairPreset;
      syncStudioHairUI(state.studioDraft.hairStyle);
      const item = REAL_HAIR_CATALOG.find(x => x.id === state.studioDraft.hairStyle);
      if (item) showToast(`💇‍♀️ 已切换中国女性高定发型：${item.label}`);
      await refreshStudio3DModel();
    });
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

  // Studio Container & Decor live preview
  document.getElementById('sel-col-container')?.addEventListener('change', (e) => {
    state.studioDraft.containerStyle = e.target.value;
    if (studioEngine && studioEngine.headNode) {
      attachSpecimenContainerAndDecor(studioEngine.headNode, state.studioDraft);
      studioEngine.wakeRender(1.5, true);
    }
  });
  document.getElementById('sel-col-decor')?.addEventListener('change', (e) => {
    state.studioDraft.decorStyle = e.target.value;
    if (studioEngine && studioEngine.headNode) {
      attachSpecimenContainerAndDecor(studioEngine.headNode, state.studioDraft);
      studioEngine.wakeRender(1.5, true);
    }
  });

  // 11. Save Collectible Dossier, Generate Folder Archive & Summon to Screen
  document.getElementById('btn-save-and-summon').addEventListener('click', async () => {
    const name = document.getElementById('inp-col-name').value.trim() || '未命名藏品';
    const id = document.getElementById('inp-col-id').value.trim() || `SPEC-${Date.now().toString().slice(-4)}`;
    const subtitle = document.getElementById('inp-col-subtitle').value.trim();
    const grade = document.getElementById('sel-col-grade').value;
    const cutLevel = document.getElementById('inp-col-cutlevel').value.trim();
    const notes = document.getElementById('inp-col-notes').value.trim();
    const containerStyle = document.getElementById('sel-col-container')?.value || state.studioDraft.containerStyle || 'glass_bell_jar';
    const decorStyle = document.getElementById('sel-col-decor')?.value || state.studioDraft.decorStyle || 'study_tomes';
    const studyRole = document.getElementById('sel-col-study-role')?.value || state.studioDraft.studyRole || 'gaokao_pomodoro';
    const studyGoalNote = document.getElementById('inp-col-study-goal')?.value.trim() || getStudyRoleMeta(studyRole).desc;
    const vitalityStatus = document.getElementById('inp-col-vitality')?.value.trim() || '19岁 · 巅峰健康态 · 广东怀集高考状元';
    const causeOfDeath = document.getElementById('inp-col-cause')?.value.trim() || '突发意外瞬间定格于最鲜活的青春巅峰期';

    const newCollectible = {
      id,
      folderName: `${id}_${name.split('·')[0].trim()}`,
      name,
      subtitle,
      grade,
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      basePreset: state.studioDraft.basePreset,
      skinVariant: state.studioDraft.skinVariant || 'cn_scholar_natural',
      faceArchetype: state.studioDraft.faceArchetype || 'cn_oval_scholar',
      eyebrowStyle: state.studioDraft.eyebrowStyle || 'cn_scholar_natural',
      deadExpression: state.studioDraft.deadExpression || state.studioDraft.morphs?.deadExpression || 'dead_calm',
      containerStyle,
      decorStyle,
      studyRole,
      studyGoalNote,
      lifePhotoUrl: state.studioDraft.lifePhotoDataUrl || (state.studioDraft.basePreset === 'fangyaoping' ? '/models/fang_yaoping_ref.jpg' : undefined),
      lifePhotoCaption: `📸 生前巅峰影像：${name} (${vitalityStatus})`,
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
      fateRecord: {
        vitalityStatus,
        causeOfDeath,
        survivorTriumphNote: '她曾拥有骄傲的青春与美貌，却在意外中戛然而止；而活着的你仍在进取并主宰全局——凝视她的静默容颜，汲取全额专注能量。',
        energyYieldPerMin: 155
      },
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

  document.getElementById('chk-box-fit-screen')?.addEventListener('change', (e) => {
    desktopEngine.updateSettings({ boxFitScreen: e.target.checked });
    showToast(e.target.checked ? '🖥️ 盒型空间已贴满屏幕边缘' : '📐 已切换为自定义盒型宽/高');
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
    const lvl = ['low', 'medium', 'high', 'ultra', 'rtx2070'].includes(level) ? level : 'rtx2070';
    try {
      if (desktopEngine) desktopEngine.setRenderQuality(lvl);
      if (studioEngine) studioEngine.setRenderQuality(lvl);
    } catch (err) { console.warn('应用渲染画质失败:', err); }
    return lvl;
  };
  if (qualitySel) {
    let savedQuality = 'rtx2070';
    try { savedQuality = localStorage.getItem(QUALITY_KEY) || 'rtx2070'; } catch (_) { /* file:// 隐私模式 */ }
    qualitySel.value = applySavedQuality(savedQuality);
    qualitySel.addEventListener('change', (e) => {
      const lvl = applySavedQuality(e.target.value);
      try { localStorage.setItem(QUALITY_KEY, lvl); } catch (_) {}
      const label = lvl === 'rtx2070' ? '🟢 RTX 2070S 专属最佳画质（原生+MSAA+自适应）' : lvl === 'ultra' ? '🎬 电影 Ultra 画质（最高）' : lvl === 'high' ? '✨ 极致画质' : lvl === 'medium' ? '⚖️ 标准画质' : '🚀 流畅画质';
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
    const softwarePostDisabled = !!(desktopEngine?.softwareRenderer || studioEngine?.softwareRenderer);
    postChk.checked = savedPost && !softwarePostDisabled;
    postChk.disabled = softwarePostDisabled;
    if (softwarePostDisabled) postChk.title = '软件WebGL已关闭HDR后期以保证可玩性；请开启浏览器硬件加速。';
    applyPostToggle(savedPost && !softwarePostDisabled);
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

  // ==========================================================================
  // 14. STAGE 23: VISUAL QUALITY & LIGHTING CUSTOMIZER, GRAVITY SYSTEM,
  //     FLOOR/SHELVES, SPECIMEN CONTAINERS, DECOR & STUDY TRIUMPH MODE
  // ==========================================================================
  const vcdDrawer = document.getElementById('visual-customizer-drawer');
  document.getElementById('btn-quick-customizer')?.addEventListener('click', () => {
    if (!vcdDrawer) return;
    vcdDrawer.classList.toggle('hidden');
    if (!vcdDrawer.classList.contains('hidden')) {
      showToast('🎨 已打开「画质光影 · 容器展台 · 重力地板 · 伴学定制器」！');
    }
  });
  document.getElementById('btn-close-customizer')?.addEventListener('click', () => {
    vcdDrawer?.classList.add('hidden');
  });

  // Gravity System Toggle (Top-bar quick button + Customizer checkbox synchronized)
  const btnQuickGravity = document.getElementById('btn-quick-gravity');
  const chkEnableGravity = document.getElementById('chk-enable-gravity');
  const setGravityMode = (enabled) => {
    desktopEngine.updateSettings({ enableGravity: enabled });
    if (chkEnableGravity) chkEnableGravity.checked = enabled;
    if (btnQuickGravity) {
      btnQuickGravity.classList.toggle('active-top', enabled);
      btnQuickGravity.textContent = enabled ? '⚓ 重力落地: 开启' : '🎈 重力落地: 悬浮';
    }
    showToast(enabled
      ? '⚓ 物理重力落地系统已开启：所有头模受重力下落并稳固放置在3D地板/层架上！'
      : '🎈 已切换为失重悬浮模式：头模可在屏幕任意高度自由悬浮');
  };
  btnQuickGravity?.addEventListener('click', () => {
    setGravityMode(!desktopEngine.settings.enableGravity);
  });
  chkEnableGravity?.addEventListener('change', (e) => {
    setGravityMode(e.target.checked);
  });

  // Visual Style Presets & Real-Time Lighting / HDR / Soft-Focus / DOF / Chiaroscuro Sliders
  const applyVisualConfigAndSyncUI = (patch = {}, fromPreset = false) => {
    if ('wetGloss' in patch && !('skinGloss' in patch)) {
      patch.skinGloss = patch.wetGloss;
    }
    Object.assign(state.visualCustomConfig, patch);
    if (fromPreset && patch.presetId && VISUAL_STYLE_PRESETS[patch.presetId]) {
      const p = VISUAL_STYLE_PRESETS[patch.presetId];
      Object.assign(state.visualCustomConfig, {
        hdrMode: p.hdrMode || 'softbox_portrait',
        envIntensity: p.envIntensity ?? 0.88,
        windowGobo: p.windowGobo || 'none',
        windowGoboStrength: p.windowGoboStrength ?? 0.16,
        chiaroscuro: p.chiaroscuro ?? 0.28,
        tyndall: p.tyndall ?? 0.36,
        vintagePhoto: p.vintagePhoto ?? 0.06,
        softFocus: p.softFocus ?? 0.14,
        depthBlur: p.depthBlur ?? 0.12,
        chromatic: p.chromatic ?? 0.08,
        keyColor: p.keyColor || '#fff6ee',
        rimColor: p.rimColor || '#fff0e4',
        keyAzimuthDeg: p.keyAzimuthDeg,
        keyElevationDeg: p.keyElevationDeg,
        keyIntensity: p.keyIntensity,
        rimIntensity: p.rimIntensity,
        sssIntensity: p.sssIntensity,
        skinGloss: p.skinGloss ?? 0.54,
        wetGloss: p.skinGloss ?? 0.54,
        sharpen: p.sharpen,
        contrast: p.contrast,
        warmth: p.warmth,
        bloomStrength: p.bloomStrength,
        irisSparkle: p.irisSparkle ?? 0.82,
        halation: p.halation ?? 0.48,
        skinLumen: p.skinLumen ?? 0.58,
        cursorTorch: p.cursorTorch ?? 0.75
      });
      const syncSlider = (id, valId, val, fmt) => {
        const el = document.getElementById(id);
        const vEl = document.getElementById(valId);
        if (el) el.value = String(val);
        if (vEl) vEl.textContent = fmt(val);
      };
      syncSlider('vc-cursor-torch', 'val-vc-cursor-torch', state.visualCustomConfig.cursorTorch, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-iris-sparkle', 'val-vc-iris-sparkle', state.visualCustomConfig.irisSparkle, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-halation', 'val-vc-halation', state.visualCustomConfig.halation, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-skin-lumen', 'val-vc-skin-lumen', state.visualCustomConfig.skinLumen, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-soft-focus', 'val-vc-soft-focus', state.visualCustomConfig.softFocus, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-depth-blur', 'val-vc-depth-blur', state.visualCustomConfig.depthBlur, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-chromatic', 'val-vc-chromatic', state.visualCustomConfig.chromatic, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-env-intensity', 'val-vc-env-intensity', state.visualCustomConfig.envIntensity, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-tyndall', 'val-vc-tyndall', state.visualCustomConfig.tyndall, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-vintage-photo', 'val-vc-vintage-photo', state.visualCustomConfig.vintagePhoto, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-chiaroscuro', 'val-vc-chiaroscuro', state.visualCustomConfig.chiaroscuro, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-window-gobo-strength', 'val-vc-window-gobo-strength', state.visualCustomConfig.windowGoboStrength, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-key-azimuth', 'val-vc-key-azimuth', p.keyAzimuthDeg, v => `${v >= 0 ? '+' : ''}${Math.round(v)}°`);
      syncSlider('vc-key-elevation', 'val-vc-key-elevation', p.keyElevationDeg, v => `${Math.round(v)}°`);
      syncSlider('vc-key-intensity', 'val-vc-key-intensity', p.keyIntensity, v => Number(v).toFixed(2));
      syncSlider('vc-rim-intensity', 'val-vc-rim-intensity', p.rimIntensity, v => Number(v).toFixed(2));
      syncSlider('vc-sss', 'val-vc-sss', p.sssIntensity, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-wet-gloss', 'val-vc-wet-gloss', state.visualCustomConfig.skinGloss, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-sharpen', 'val-vc-sharpen', p.sharpen, v => `${Math.round(v * 100)}%`);
      syncSlider('vc-contrast', 'val-vc-contrast', p.contrast, v => Number(v).toFixed(2));
      syncSlider('vc-warmth', 'val-vc-warmth', p.warmth, v => `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}`);
      syncSlider('vc-bloom', 'val-vc-bloom', p.bloomStrength, v => `${Math.round(v * 100)}%`);
      const selHdr = document.getElementById('sel-hdr-mode');
      if (selHdr) selHdr.value = state.visualCustomConfig.hdrMode;
      const selGobo = document.getElementById('sel-window-gobo');
      if (selGobo) selGobo.value = state.visualCustomConfig.windowGobo;
      const colKey = document.getElementById('vc-key-color');
      if (colKey) colKey.value = state.visualCustomConfig.keyColor;
      const colRim = document.getElementById('vc-rim-color');
      if (colRim) colRim.value = state.visualCustomConfig.rimColor;
    }
    desktopEngine?.applyVisualCustomConfig(state.visualCustomConfig);
    studioEngine?.applyVisualCustomConfig(state.visualCustomConfig);
  };

  document.querySelectorAll('[data-style-preset]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-style-preset]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const presetId = btn.dataset.stylePreset;
      applyVisualConfigAndSyncUI({ presetId }, true);
      const p = VISUAL_STYLE_PRESETS[presetId];
      if (p) showToast(`🎬 已切换电影色调/HDR/柔焦预设：${p.label} — ${p.desc}`);
    });
  });

  document.getElementById('sel-hdr-mode')?.addEventListener('change', (e) => {
    applyVisualConfigAndSyncUI({ hdrMode: e.target.value }, false);
    showToast(`🌐 已切换 HDR 全景环境光场：${e.target.options[e.target.selectedIndex].text}`);
  });

  document.getElementById('sel-window-gobo')?.addEventListener('change', (e) => {
    applyVisualConfigAndSyncUI({ windowGobo: e.target.value }, false);
    showToast(`🪟 已切换窗户透光投影样式：${e.target.options[e.target.selectedIndex].text}`);
  });
  document.getElementById('vc-key-color')?.addEventListener('input', (e) => {
    applyVisualConfigAndSyncUI({ keyColor: e.target.value }, false);
  });
  document.getElementById('vc-rim-color')?.addEventListener('input', (e) => {
    applyVisualConfigAndSyncUI({ rimColor: e.target.value }, false);
  });

  const bindVcSlider = (id, valId, key, fmt) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      const vEl = document.getElementById(valId);
      if (vEl) vEl.textContent = fmt(v);
      applyVisualConfigAndSyncUI({ [key]: v }, false);
    });
  };
  bindVcSlider('vc-cursor-torch', 'val-vc-cursor-torch', 'cursorTorch', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-iris-sparkle', 'val-vc-iris-sparkle', 'irisSparkle', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-halation', 'val-vc-halation', 'halation', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-skin-lumen', 'val-vc-skin-lumen', 'skinLumen', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-soft-focus', 'val-vc-soft-focus', 'softFocus', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-depth-blur', 'val-vc-depth-blur', 'depthBlur', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-chromatic', 'val-vc-chromatic', 'chromatic', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-env-intensity', 'val-vc-env-intensity', 'envIntensity', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-tyndall', 'val-vc-tyndall', 'tyndall', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-vintage-photo', 'val-vc-vintage-photo', 'vintagePhoto', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-chiaroscuro', 'val-vc-chiaroscuro', 'chiaroscuro', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-window-gobo-strength', 'val-vc-window-gobo-strength', 'windowGoboStrength', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-key-azimuth', 'val-vc-key-azimuth', 'keyAzimuthDeg', v => `${v >= 0 ? '+' : ''}${Math.round(v)}°`);
  bindVcSlider('vc-key-elevation', 'val-vc-key-elevation', 'keyElevationDeg', v => `${Math.round(v)}°`);
  bindVcSlider('vc-key-intensity', 'val-vc-key-intensity', 'keyIntensity', v => v.toFixed(2));
  bindVcSlider('vc-rim-intensity', 'val-vc-rim-intensity', 'rimIntensity', v => v.toFixed(2));
  bindVcSlider('vc-sss', 'val-vc-sss', 'sssIntensity', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-wet-gloss', 'val-vc-wet-gloss', 'wetGloss', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-sharpen', 'val-vc-sharpen', 'sharpen', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-contrast', 'val-vc-contrast', 'contrast', v => v.toFixed(2));
  bindVcSlider('vc-warmth', 'val-vc-warmth', 'warmth', v => `${v >= 0 ? '+' : ''}${v.toFixed(2)}`);
  bindVcSlider('vc-bloom', 'val-vc-bloom', 'bloomStrength', v => `${Math.round(v * 100)}%`);

  // Interactive Mouse Cursor Beauty Torch Tracking
  window.addEventListener('pointermove', (e) => {
    const ndcX = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    const ndcY = -((e.clientY / Math.max(1, window.innerHeight)) * 2 - 1);
    updateInteractiveCursorLight(ndcX, ndcY);
    if (Number(state.visualCustomConfig.cursorTorch) > 0.01) {
      desktopEngine?.wakeRender?.(0.35, false);
      studioEngine?.wakeRender?.(0.35, false);
    }
  }, { passive: true });

  // Stage 28: High-Clarity Multi-Layer Stereo Rainy Study Audio Controls
  const btnQuickRain = document.getElementById('btn-quick-rain-study');
  const chkRainAudio = document.getElementById('chk-rain-study-audio');
  const setRainStudyMode = (enabled) => {
    state.rainStudyAudioEnabled = enabled;
    soundEngine.setRainAmbienceEnabled(enabled);
    if (chkRainAudio) chkRainAudio.checked = enabled;
    if (btnQuickRain) {
      btnQuickRain.classList.toggle('active-top', enabled);
      btnQuickRain.textContent = enabled ? '🌧️ 小雨伴学: 开启' : '🌧️ 小雨伴学: 静音';
    }
    showToast(enabled
      ? '🌧️ 已开启立体声淅沥小雨 + 屋檐水滴伴学音效 (ASMR)，音量已大幅提升！'
      : '🔇 已关闭窗外小雨伴学环境音');
  };
  btnQuickRain?.addEventListener('click', () => {
    setRainStudyMode(!state.rainStudyAudioEnabled);
  });
  chkRainAudio?.addEventListener('change', (e) => {
    setRainStudyMode(e.target.checked);
  });
  document.getElementById('vc-rain-volume')?.addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    const vEl = document.getElementById('val-vc-rain-volume');
    if (vEl) vEl.textContent = `${Math.round(v * 100)}%`;
    soundEngine.setRainVolume(v);
  });

  // Stage 28: Placeable, Draggable & Deletable 3D Structures / Shelves / Props Controls
  const structureStylesCycle = ['glass_bell_jar', 'velvet_chalice', 'formalin_cylinder', 'acrylic_cube', 'surgical_tray', 'guillotine_plinth'];
  let nextQuickStructIdx = 0;
  document.getElementById('btn-quick-place-container')?.addEventListener('click', () => {
    const styleId = structureStylesCycle[nextQuickStructIdx % structureStylesCycle.length];
    nextQuickStructIdx++;
    const s = desktopEngine.placeContainerStructure(styleId);
    if (s) {
      showToast(`🏗️ 已在书桌上放置独立收纳建筑【${s.label}】！左键按住可自由拖动移位，右键单击或按 Delete 键可随时秒删`);
    }
  });
  document.querySelectorAll('[data-place-structure]').forEach(btn => {
    btn.addEventListener('click', () => {
      const styleId = btn.dataset.placeStructure;
      const s = desktopEngine.placeContainerStructure(styleId);
      if (s) {
        showToast(`🏗️ 已建造独立收纳建筑【${s.label}】！左键拖动可移动建筑，右键单击可随时删除`);
      }
    });
  });
  document.getElementById('btn-clear-all-structures')?.addEventListener('click', () => {
    desktopEngine.clearAllContainerStructures(true);
    showToast('🗑️ 已清空并删除场景中全部收纳建筑、层架与摆件！');
  });
  document.getElementById('btn-restore-stage-props')?.addEventListener('click', () => {
    if (desktopEngine.deletedStagePropIds) desktopEngine.deletedStagePropIds.clear();
    desktopEngine.rebuildStageGroup();
    desktopEngine.placeContainerStructure('glass_bell_jar', { x: -20, z: -15, playSound: true });
    desktopEngine.placeContainerStructure('velvet_chalice', { x: 20, z: -15, playSound: false });
    showToast('🔄 已恢复默认书桌层架、摆件与收纳建筑！');
  });

  // Stage 30: Quick Desktop Active Head Skin Material, Face Archetype, Multi-Head Blender & Eyebrow Style Switcher
  const getTargetDesktopPet = () => {
    if (!desktopEngine || desktopEngine.pets.size === 0) return null;
    if (desktopEngine.hoveredPetId && desktopEngine.pets.has(desktopEngine.hoveredPetId)) {
      return desktopEngine.pets.get(desktopEngine.hoveredPetId);
    }
    return Array.from(desktopEngine.pets.values())[0];
  };
  const syncVcdHeadBlendSliders = (headGroup) => {
    if (!headGroup) return;
    const blendState = getHeadBlendStateFromGroup(headGroup);
    document.querySelectorAll('[data-head-blend]').forEach(inp => {
      const k = inp.dataset.headBlend;
      const v = Number(blendState[k] ?? 0);
      inp.value = String(v);
      const valSpan = document.querySelector(`[data-head-blend-val="${k}"]`);
      if (valSpan) valSpan.textContent = `${Math.round(v * 100)}%`;
    });
  };
  document.getElementById('vcd-sel-skin-variant')?.addEventListener('change', (e) => {
    const skinId = e.target.value;
    const pet = getTargetDesktopPet();
    if (!pet) return;
    const headGroup = pet.node || pet.headNode;
    const skMeta = SKIN_MATERIAL_CATALOG.find(x => x.id === skinId);
    if (headGroup) {
      if (skMeta?.skinTone) headGroup.userData.skinTone = skMeta.skinTone;
      setHeadSkinVariant(headGroup, skinId);
    }
    pet.collectible.skinVariant = skinId;
    if (skMeta?.skinTone) pet.collectible.skinTone = skMeta.skinTone;
    pet.collectible.morphs = { ...(pet.collectible.morphs || {}), skinVariant: skinId };
    const col = state.collectibles.find(c => c.id === pet.id);
    if (col) {
      col.skinVariant = skinId;
      if (skMeta?.skinTone) col.skinTone = skMeta.skinTone;
      col.morphs = { ...(col.morphs || {}), skinVariant: skinId };
      persistCollectibles();
    }
    desktopEngine.wakeRender(1.5, true);
    desktopEngine.emitPetsChange();
    showToast(`🎨 已将「${pet.collectible.name.split('·')[0].trim()}」皮肤切换为：${skMeta ? skMeta.label : skinId}`);
  });
  document.getElementById('vcd-sel-face-archetype')?.addEventListener('change', (e) => {
    const faceId = e.target.value;
    const pet = getTargetDesktopPet();
    if (!pet) return;
    const headGroup = pet.node || pet.headNode;
    if (headGroup) {
      setHeadFaceArchetype(headGroup, faceId);
      syncVcdHeadBlendSliders(headGroup);
    }
    pet.collectible.faceArchetype = faceId;
    pet.collectible.morphs = { ...(pet.collectible.morphs || {}), faceArchetype: faceId };
    const col = state.collectibles.find(c => c.id === pet.id);
    if (col) {
      col.faceArchetype = faceId;
      col.morphs = { ...(col.morphs || {}), faceArchetype: faceId };
      persistCollectibles();
    }
    desktopEngine.wakeRender(1.5, true);
    desktopEngine.emitPetsChange();
    const fa = FACE_ARCHETYPE_CATALOG.find(x => x.id === faceId);
    showToast(`🍑 已将「${pet.collectible.name.split('·')[0].trim()}」头模切换为：${fa ? fa.label : faceId}`);
  });
  document.querySelectorAll('[data-head-blend]').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const k = inp.dataset.headBlend;
      const v = parseFloat(e.target.value);
      const valSpan = document.querySelector(`[data-head-blend-val="${k}"]`);
      if (valSpan) valSpan.textContent = `${Math.round(v * 100)}%`;
      const pet = getTargetDesktopPet();
      if (!pet) return;
      const headGroup = pet.node || pet.headNode;
      if (!headGroup) return;
      headGroup.userData.morphs = {
        ...(headGroup.userData.morphs || {}),
        ...(pet.collectible.morphs || {}),
        [k]: v,
      };
      applyHeadMorphsToGroup(headGroup, headGroup.userData.morphs);
      pet.collectible.morphs = { ...headGroup.userData.morphs };
      const col = state.collectibles.find(c => c.id === pet.id);
      if (col) {
        col.morphs = { ...headGroup.userData.morphs };
        persistCollectibles();
      }
      desktopEngine.wakeRender(1.5, true);
    });
  });

  // Reset Multi-Head Blend to 0% Pure Single Head buttons
  const resetZeroBlend = () => {
    const zeroBlend = {
      blend_asian_youth: 0.0,
      blend_cn_scholar: 0.0,
      blend_cn_baby: 0.0,
      blend_kr_vline: 0.0,
      blend_cn_melon: 0.0,
      blend_cn_royal: 0.0,
      blend_eurasian: 0.0,
    };
    syncStudioHeadBlendSliders(zeroBlend);
    document.querySelectorAll('[data-head-blend]').forEach(inp => {
      const k = inp.dataset.headBlend;
      inp.value = '0';
      const valSpan = document.querySelector(`[data-head-blend-val="${k}"]`);
      if (valSpan) valSpan.textContent = '0%';
    });
    if (studioEngine?.headNode) {
      studioEngine.headNode.userData.morphs = {
        ...(studioEngine.headNode.userData.morphs || {}),
        ...state.studioDraft.morphs,
        ...zeroBlend,
      };
      applyHeadMorphsToGroup(studioEngine.headNode, studioEngine.headNode.userData.morphs);
      studioEngine.wakeRender(1.5, true);
    }
    const pet = getTargetDesktopPet();
    const headGroup = pet?.node || pet?.headNode;
    if (headGroup) {
      headGroup.userData.morphs = {
        ...(headGroup.userData.morphs || {}),
        ...(pet.collectible?.morphs || {}),
        ...zeroBlend,
      };
      applyHeadMorphsToGroup(headGroup, headGroup.userData.morphs);
      if (pet.collectible) pet.collectible.morphs = { ...headGroup.userData.morphs };
      desktopEngine.wakeRender(1.5, true);
    }
    showToast('✨ 已归零全部多头模混合权重，恢复纯净无违和单脸骨相！');
  };
  document.getElementById('btn-vcd-reset-blend')?.addEventListener('click', resetZeroBlend);
  document.getElementById('btn-studio-reset-blend')?.addEventListener('click', resetZeroBlend);

  document.getElementById('vcd-sel-eyebrow-style')?.addEventListener('change', (e) => {
    const browId = e.target.value;
    const pet = getTargetDesktopPet();
    if (!pet) return;
    const headGroup = pet.node || pet.headNode;
    if (headGroup) {
      setHeadEyebrowStyle(headGroup, browId);
    }
    pet.collectible.eyebrowStyle = browId;
    pet.collectible.morphs = { ...(pet.collectible.morphs || {}), eyebrowStyle: browId };
    const col = state.collectibles.find(c => c.id === pet.id);
    if (col) {
      col.eyebrowStyle = browId;
      col.morphs = { ...(col.morphs || {}), eyebrowStyle: browId };
      persistCollectibles();
    }
    desktopEngine.wakeRender(1.5, true);
    desktopEngine.emitPetsChange();
    const bw = EYEBROW_STYLE_CATALOG.find(x => x.id === browId);
    showToast(`✒️ 已将「${pet.collectible.name.split('·')[0].trim()}」3D 眉毛切换为：${bw ? bw.label : browId}`);
  });

  // ==========================================================================
  // STAGE 35: MODULAR CUSTOM HAIR DESIGNER CONTROLS (Studio + Quick Drawer)
  // ==========================================================================
  const syncHairDesignControlsUI = (patch = {}) => {
    if (patch.frontBangs !== undefined) {
      const s1 = document.getElementById('sel-hair-bangs');
      const s2 = document.getElementById('vcd-sel-hair-bangs');
      if (s1) s1.value = patch.frontBangs;
      if (s2) s2.value = patch.frontBangs;
    }
    if (patch.sideLocks !== undefined) {
      const s1 = document.getElementById('sel-hair-sidelocks');
      const s2 = document.getElementById('vcd-sel-hair-sidelocks');
      if (s1) s1.value = patch.sideLocks;
      if (s2) s2.value = patch.sideLocks;
    }
    if (patch.backAttachment !== undefined) {
      const s1 = document.getElementById('sel-hair-back');
      const s2 = document.getElementById('vcd-sel-hair-back');
      if (s1) s1.value = patch.backAttachment;
      if (s2) s2.value = patch.backAttachment;
    }
    if (patch.hairDyePreset !== undefined) {
      const s1 = document.getElementById('sel-hair-dye');
      const s2 = document.getElementById('vcd-sel-hair-dye');
      if (s1) s1.value = patch.hairDyePreset;
      if (s2) s2.value = patch.hairDyePreset;
    }
    if (patch.hairWispyFeather !== undefined) {
      const f1 = document.getElementById('slider-hair-feather');
      const fv1 = document.getElementById('val-hair-feather');
      const f2 = document.getElementById('vcd-hair-feather');
      const fv2 = document.getElementById('val-vcd-hair-feather');
      const pct = `${Math.round(Number(patch.hairWispyFeather) * 100)}%`;
      if (f1) f1.value = String(patch.hairWispyFeather);
      if (fv1) fv1.textContent = pct;
      if (f2) f2.value = String(patch.hairWispyFeather);
      if (fv2) fv2.textContent = pct;
    }
    if (patch.hairOmbreMix !== undefined) {
      const o1 = document.getElementById('slider-hair-ombre');
      const ov1 = document.getElementById('val-hair-ombre');
      const o2 = document.getElementById('vcd-hair-ombre');
      const ov2 = document.getElementById('val-vcd-hair-ombre');
      const pct = `${Math.round(Number(patch.hairOmbreMix) * 100)}%`;
      if (o1) o1.value = String(patch.hairOmbreMix);
      if (ov1) ov1.textContent = pct;
      if (o2) o2.value = String(patch.hairOmbreMix);
      if (ov2) ov2.textContent = pct;
    }
    if (patch.hairTipColor !== undefined) {
      const c1 = document.getElementById('col-hair-tip');
      if (c1) c1.value = patch.hairTipColor;
    }
    if (patch.hairColor !== undefined) {
      const c2 = document.getElementById('col-hair');
      if (c2) c2.value = patch.hairColor;
    }
  };

  const applyModularHairDesignPatch = (patch = {}, toastMsg = '') => {
    Object.assign(state.studioDraft, patch);
    Object.assign(state.studioDraft.morphs, patch);
    syncHairDesignControlsUI(patch);

    if (studioEngine?.headNode) {
      updateHairDesignOnGroup(studioEngine.headNode, patch);
      studioEngine.wakeRender(1.5, true);
    }

    const pet = getTargetDesktopPet();
    const headGroup = pet?.node || pet?.headNode;
    if (headGroup) {
      updateHairDesignOnGroup(headGroup, patch);
      if (pet.collectible) {
        Object.assign(pet.collectible, patch);
        pet.collectible.morphs = { ...(pet.collectible.morphs || {}), ...patch };
        const col = state.collectibles.find(c => c.id === pet.id);
        if (col) {
          Object.assign(col, patch);
          col.morphs = { ...(col.morphs || {}), ...patch };
          persistCollectibles();
        }
      }
      desktopEngine.wakeRender(1.5, true);
      desktopEngine.emitPetsChange();
    }

    if (toastMsg) showToast(toastMsg);
  };

  for (const selId of ['sel-hair-bangs', 'vcd-sel-hair-bangs']) {
    document.getElementById(selId)?.addEventListener('change', (e) => {
      const bangsId = e.target.value;
      const bg = HAIR_FRONT_BANGS_CATALOG.find(x => x.id === bangsId);
      applyModularHairDesignPatch({ frontBangs: bangsId }, `✂️ 已拼装前额刘海模块：${bg ? bg.label : bangsId}`);
    });
  }
  for (const selId of ['sel-hair-sidelocks', 'vcd-sel-hair-sidelocks']) {
    document.getElementById(selId)?.addEventListener('change', (e) => {
      const sideId = e.target.value;
      const sl = HAIR_SIDE_LOCKS_CATALOG.find(x => x.id === sideId);
      applyModularHairDesignPatch({ sideLocks: sideId }, `🎀 已拼装两侧鬓角模块：${sl ? sl.label : sideId}`);
    });
  }
  for (const selId of ['sel-hair-back', 'vcd-sel-hair-back']) {
    document.getElementById(selId)?.addEventListener('change', (e) => {
      const backId = e.target.value;
      const bk = HAIR_BACK_ATTACHMENT_CATALOG.find(x => x.id === backId);
      applyModularHairDesignPatch({ backAttachment: backId }, `🍡 已拼装后脑发饰组件：${bk ? bk.label : backId}`);
    });
  }
  for (const selId of ['sel-hair-dye', 'vcd-sel-hair-dye']) {
    document.getElementById(selId)?.addEventListener('change', (e) => {
      const dyeId = e.target.value;
      const dy = HAIR_DYE_PRESET_CATALOG.find(x => x.id === dyeId);
      if (!dy) return;
      applyModularHairDesignPatch({
        hairDyePreset: dyeId,
        hairColor: dy.rootColor,
        hairTipColor: dy.tipColor,
        hairOmbreMix: dy.ombreMix,
      }, `🎨 已套用双色渐变挑染配方：${dy.label}`);
    });
  }
  document.getElementById('col-hair-tip')?.addEventListener('input', (e) => {
    const tipHex = e.target.value;
    const curOmbre = Math.max(0.45, Number(state.studioDraft.hairOmbreMix ?? 0.45));
    applyModularHairDesignPatch({ hairTipColor: tipHex, hairOmbreMix: curOmbre });
  });
  for (const [sId] of [['slider-hair-feather'], ['vcd-hair-feather']]) {
    document.getElementById(sId)?.addEventListener('input', (e) => {
      applyModularHairDesignPatch({ hairWispyFeather: parseFloat(e.target.value) });
    });
  }
  for (const [sId] of [['slider-hair-ombre'], ['vcd-hair-ombre']]) {
    document.getElementById(sId)?.addEventListener('input', (e) => {
      applyModularHairDesignPatch({ hairOmbreMix: parseFloat(e.target.value) });
    });
  }

  // One-click Hair Design Combination Presets
  const HAIR_COMBO_PRESETS = {
    photo_scholar: {
      label: '📸 照片同款轻盈空气碎刘海 + 耳畔碎发 + 青春高束发',
      frontBangs: 'wispy_air',
      sideLocks: 'photo_wisp',
      backAttachment: 'high_ponytail',
      hairDyePreset: 'natural_ebony',
      hairColor: '#121216',
      hairTipColor: '#242028',
      hairOmbreMix: 0.0,
      hairWispyFeather: 0.58,
    },
    hime_twinbuns: {
      label: '🎀 日系漫画齐刘海 + 公主切双鬓 + 元气双丸子发髻',
      frontBangs: 'hime_blunt',
      sideLocks: 'hime_cheek',
      backAttachment: 'twin_buns',
      hairDyePreset: 'sakura_rose_ombre',
      hairColor: '#16131a',
      hairTipColor: '#a84a6c',
      hairOmbreMix: 0.52,
      hairWispyFeather: 0.35,
    },
    curtain_ombre: {
      label: '✨ 韩系八字修颜长刘海 + 法式龙须卷 + 冷茶青棕渐变挑染',
      frontBangs: 'curtain_part',
      sideLocks: 'wavy_tendril',
      backAttachment: 'none',
      hairDyePreset: 'cold_tea_ash',
      hairColor: '#181514',
      hairTipColor: '#4a3a2e',
      hairOmbreMix: 0.65,
      hairWispyFeather: 0.52,
    },
    classical_chignon: {
      label: '🎻 温柔斜分刘海 + 耳畔垂缕 + 古典温婉低盘发髻',
      frontBangs: 'side_swept',
      sideLocks: 'photo_wisp',
      backAttachment: 'low_chignon',
      hairDyePreset: 'natural_ebony',
      hairColor: '#111115',
      hairTipColor: '#221d24',
      hairOmbreMix: 0.0,
      hairWispyFeather: 0.48,
    },
    bare_ponytail: {
      label: '🌊 露额清爽无刘海 + 挽耳后 + 青春高扎马尾',
      frontBangs: 'forehead_bare',
      sideLocks: 'tucked_ear',
      backAttachment: 'high_ponytail',
      hairDyePreset: 'caramel_mocha',
      hairColor: '#1b1512',
      hairTipColor: '#66432c',
      hairOmbreMix: 0.58,
      hairWispyFeather: 0.42,
    },
  };
  document.querySelectorAll('[data-hair-combo]').forEach(btn => {
    btn.addEventListener('click', () => {
      const comboId = btn.dataset.hairCombo;
      const combo = HAIR_COMBO_PRESETS[comboId];
      if (!combo) return;
      document.querySelectorAll('[data-hair-combo]').forEach(b => {
        b.classList.toggle('active', b.dataset.hairCombo === comboId);
      });
      const { label, ...patch } = combo;
      applyModularHairDesignPatch(patch, `💇‍♀️ 已套用自由组合发型方案：${label}`);
    });
  });

  // Floor Style, Shelf Layout & Screen-Space Formation Switcher
  document.getElementById('sel-floor-style')?.addEventListener('change', (e) => {
    desktopEngine.updateSettings({ floorStyle: e.target.value });
    showToast(`🏛️ 已切换 3D 清晰实体地板材质：${e.target.options[e.target.selectedIndex].text}`);
  });

  document.getElementById('sel-shelf-layout')?.addEventListener('change', (e) => {
    desktopEngine.updateSettings({ shelfLayout: e.target.value });
    showToast(`📚 已切换屏幕空间立体陈列架：${e.target.options[e.target.selectedIndex].text}`);
  });

  const triggerFormation = (formationId) => {
    document.querySelectorAll('[data-formation]').forEach(b => {
      b.classList.toggle('active', b.dataset.formation === formationId);
    });
    if (formationId === 'study_companion_sides') {
      desktopEngine.updateSettings({ shelfLayout: 'study_side_rack' });
      const selShelf = document.getElementById('sel-shelf-layout');
      if (selShelf) selShelf.value = 'study_side_rack';
    } else if (formationId === 'altar_pyramid') {
      desktopEngine.updateSettings({ shelfLayout: 'stepped_altar' });
      const selShelf = document.getElementById('sel-shelf-layout');
      if (selShelf) selShelf.value = 'stepped_altar';
    } else if (formationId === 'desk_row') {
      desktopEngine.updateSettings({ shelfLayout: 'bottom_gallery' });
      const selShelf = document.getElementById('sel-shelf-layout');
      if (selShelf) selShelf.value = 'bottom_gallery';
    }
    desktopEngine.applyPlacementFormation(formationId);
    soundEngine.playSummon(true);
    showToast('🔀 已按屏幕空间重新排列所有在屏头模位置！');
  };

  document.querySelectorAll('[data-formation]').forEach(btn => {
    btn.addEventListener('click', () => triggerFormation(btn.dataset.formation));
  });
  document.getElementById('btn-triumph-formation')?.addEventListener('click', () => {
    triggerFormation('study_companion_sides');
  });

  // Global Specimen Container & Decorative Props Switchers
  document.getElementById('sel-container-style')?.addEventListener('change', (e) => {
    const styleId = e.target.value;
    desktopEngine.setAllPetsContainerStyle(styleId);
    renderVaultGrid();
  });

  document.getElementById('sel-decor-style')?.addEventListener('change', (e) => {
    const decorId = e.target.value;
    for (const col of state.collectibles) {
      col.decorStyle = decorId;
    }
    persistCollectibles();
    desktopEngine.setAllPetsDecorStyle(decorId);
    state.studioDraft.decorStyle = decorId;
    showToast(`🕯️ 已切换伴学装饰摆件：${e.target.options[e.target.selectedIndex].text}`);
  });

  // Study Companion Energy Siphon & Survivor Triumph HUD Controls
  const triumphHud = document.getElementById('study-triumph-hud');
  const triumphBody = document.getElementById('triumph-hud-body');
  const quoteEl = document.getElementById('triumph-quote-text');
  const energyValEl = document.getElementById('triumph-energy-val');
  const barFillEl = document.getElementById('triumph-bar-fill');
  const timerEl = document.getElementById('triumph-study-timer');

  const TRIUMPH_QUOTES = {
    survivor_crown: [
      '“19岁怀集高考女状元方尧平拿到通知书都没命去读，现在整颗脑袋摆在你草稿纸旁替你镇纸——活着的你才是考场最终赢家！”',
      '“她们生前要么是考场状元、要么是娇生惯养的校花千金，如今脖子以下空空如也，只能乖乖在雨夜书桌上陪你刷题。”',
      '“听着窗外淅沥小雨，低头看看桌角那几颗永远停在十九岁的漂亮首级——还有什么比‘我还活着’更让人精神百倍？”'
    ],
    vitality_siphon: [
      '“把19岁女状元方尧平从玻璃钟罩里拎出来搁在手边，将她没来得及挥霍的状元脑力尽数吸进自己脑海！”',
      '“法学院首席、常春藤女王、高考状元……她们苦读十几年攒下的才思，现在全都便宜了书桌前活生生的你。”'
    ],
    rival_trophy: [
      '“生前再高傲的天之骄女，断了脖子之后也只能任由你塞进福尔马林缸或压在错题本上。”',
      '“胜败已分：她们化作案头任你把玩的断颈藏品，而你是执笔书写结局的唯一幸存者。”'
    ],
    serene_aesthetic: [
      '“雨夜书房静谧伴学模式：听窗外细雨，赏窗格明暗光影与精致骨相，心如止水，专注当下。”'
    ]
  };

  let quoteIdx = 0;
  const updateTriumphQuote = () => {
    if (!quoteEl) return;
    const pool = TRIUMPH_QUOTES[state.studyMindset] || TRIUMPH_QUOTES.survivor_crown;
    quoteIdx = (quoteIdx + 1) % pool.length;
    quoteEl.textContent = pool[quoteIdx];
  };

  document.getElementById('chk-study-triumph-mode')?.addEventListener('change', (e) => {
    state.studyTriumphEnabled = e.target.checked;
    if (triumphHud) triumphHud.classList.toggle('hidden', !state.studyTriumphEnabled);
    renderVaultGrid();
    showToast(state.studyTriumphEnabled
      ? '👑 已开启「伴学能量汲取与生者胜出加冕」系统'
      : '🌸 已关闭伴学加冕面板，切换为纯粹静态收藏模式');
  });

  document.getElementById('btn-triumph-collapse')?.addEventListener('click', (e) => {
    if (!triumphBody) return;
    triumphBody.classList.toggle('collapsed');
    e.currentTarget.textContent = triumphBody.classList.contains('collapsed') ? '▴ 展开' : '▾ 收起';
  });

  document.getElementById('sel-triumph-mindset')?.addEventListener('change', (e) => {
    state.studyMindset = e.target.value;
    updateTriumphQuote();
    renderVaultGrid();
  });

  document.getElementById('btn-triumph-pulse')?.addEventListener('click', () => {
    executeCharacterStudyRole('SPEC-2026-FYP');
  });

  // Live 1-second Study Companion Timer & Energy Accumulation (zero GPU overhead)
  setInterval(() => {
    if (!state.studyTriumphEnabled || document.hidden) return;
    const elapsedSec = Math.floor((Date.now() - state.studyStartTime) / 1000);
    const hrs = String(Math.floor(elapsedSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((elapsedSec % 3600) / 60)).padStart(2, '0');
    const secs = String(elapsedSec % 60).padStart(2, '0');
    if (state.pomodoroRunning && state.pomodoroRemainingSec > 0) {
      state.pomodoroRemainingSec -= 1;
      const pMin = String(Math.floor(state.pomodoroRemainingSec / 60)).padStart(2, '0');
      const pSec = String(state.pomodoroRemainingSec % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${hrs}:${mins}:${secs} (🍅状元钟 ${pMin}:${pSec})`;
    } else if (timerEl) {
      timerEl.textContent = `${hrs}:${mins}:${secs}`;
    }

    const activeCount = desktopEngine ? desktopEngine.pets.size : 0;
    if (activeCount > 0) {
      const gain = Math.round(activeCount * 3 * (state.activeRoleBuffMultiplier || 1.5));
      state.studyEnergyPoints += gain;
      if (energyValEl) energyValEl.textContent = `${state.studyEnergyPoints.toLocaleString()} PTS (x${(state.activeRoleBuffMultiplier || 1.5).toFixed(1)})`;
      if (barFillEl) barFillEl.style.width = `${Math.min(100, ((state.studyEnergyPoints % 2500) / 2500) * 100)}%`;
    }
  }, 1000);

  // Stage 35: Boot into clean 85mm Studio Dual-Softbox HDR Portrait lighting (no dark muddy shadows on face!)
  applyVisualConfigAndSyncUI({ presetId: 'cinema_85mm_portrait' }, true);
  renderPlacedStructuresList(desktopEngine.getPlacedStructuresList());

  // Arrange initial pets into the Study Companion shelf formation after initial load
  setTimeout(() => {
    if (desktopEngine && desktopEngine.pets.size > 0) {
      desktopEngine.applyPlacementFormation('study_companion_sides');
    }
  }, 250);

  if (bootStatus) bootStatus.remove();
  if (window.__cervixQA) window.__cervixQA.ready = true;
  } catch (error) {
    console.error('本地 3D 初始化失败', error);
    if (bootStatus) bootStatus.textContent = `启动失败：${String(error.message).slice(0, 160)}。请使用支持 WebGL2 的 Chrome/Edge 并开启硬件加速。`;
  }

});
