import { createVisualRepair } from './ui/visualRepair.js';
import { initObsidianProStudio } from './ui/obsidianProStudio.js';
import './ui/obsidianProStudio.css';
import {
  DEFAULT_COLLECTIBLES,
  DAZ_TUTORIAL_STEPS,
  REAL_HAIR_CATALOG,
  SKIN_MATERIAL_CATALOG,
  HAIR_TOP_CROWN_CATALOG,
  HAIR_FRONT_BANGS_CATALOG,
  HAIR_SIDE_LOCKS_CATALOG,
  HAIR_BACK_ATTACHMENT_CATALOG,
  HAIR_DYE_PRESET_CATALOG,
  HEAD_BLEND_CHANNELS,
  FACE_ARCHETYPE_CATALOG,
  EYE_SHAPE_PRESET_CATALOG,
  EYEBROW_STYLE_CATALOG,
  EYELINER_STYLE_CATALOG,
  CHAR_MATERIAL_PRESET_CATALOG,
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
  applyHeadMorphsToGroup,
  setMasterHairConfig,
  getMasterHairConfig,
  MASTER_HAIR_DENSITIES
} from './three/collectibleHeadAssembler.js';
import {
  VISUAL_STYLE_PRESETS,
  HDR_ENVIRONMENT_CATALOG,
  DYNAMIC_LIGHT_MODES,
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
import {
  PUZZLE_SKILL_SLOTS,
  PUZZLE_SKILL_CATALOG,
  DEFAULT_HEAD_PUZZLE_LOADOUTS,
  SURVIVOR_VICTORY_DECLARATIONS,
  DESKTOP_TACTILE_PLAY_MODES,
  DESKTOP_STATUS_FOIL_FORMATIONS,
  SPECIMEN_SILENT_PLAY_OBSERVATIONS,
  getNextSilentPlayObservation,
  UNIVERSAL_SUPERIORITY_AURA_TEMPLATES,
  COMFORT_HANDBOOK_CATEGORIES,
  COMFORT_HANDBOOK_ARTICLES,
  QUICK_COMFORT_PILLS,
  analyzeNotebookAntiCheat,
  generateBoothPuzzleKey,
  generateMonthlySettlementHash
} from './data/puzzleSkillEngine.js';

// ============================================================================
// APPLICATION STATE
// ============================================================================
const STORAGE_KEY = 'cervix3d-collectibles-stage69d-save-load-v1';
function restoreCollectibles() {
  const defaults = JSON.parse(JSON.stringify(DEFAULT_COLLECTIBLES));
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (Array.isArray(saved) && saved.length > 0) {
      const byId = new Map(defaults.map(item => [item.id, item]));
      for (const item of saved) {
        if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') continue;
        if (item.customModelUrl?.startsWith('blob:')) item.customModelUrl = null;
        if (item.customHairUrl?.startsWith('blob:')) item.customHairUrl = null;
        const def = byId.get(item.id);
        if (def) {
          byId.set(item.id, {
            ...def,
            ...item,
            morphs: { ...(def.morphs || {}), ...(item.morphs || {}) },
          });
        } else {
          byId.set(item.id, item);
        }
      }
      return [...byId.values()];
    }
    // Migrate only custom user-created specimens from previous storage keys
    const legacy = JSON.parse(
      localStorage.getItem('cervix3d-collectibles-stage43-master-v1') ||
      localStorage.getItem('cervix3d-collectibles-stage36-master-v1') ||
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
      const byId = new Map(defaults.map(d => [d.id, d]));
      for (const item of legacy) {
        if (!item || typeof item.id !== 'string') continue;
        if (item.customModelUrl?.startsWith('blob:')) item.customModelUrl = null;
        if (item.customHairUrl?.startsWith('blob:')) item.customHairUrl = null;
        if (!byId.has(item.id)) {
          defaults.unshift(item);
        } else if (typeof item.name === 'string' && item.name.startsWith('QA ')) {
          const def = byId.get(item.id);
          def.summoned = Boolean(item.summoned);
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
  windowHidden: true,
  bgModeIndex: 0, // 0: os, 1: void, 2: transparent
  studyTriumphEnabled: false,
  studyStartTime: Date.now(),
  studyEnergyPoints: 1580,
  studyMindset: 'survivor_crown',
  activeRoleBuffMultiplier: 1.6,
  pomodoroRunning: false,
  pomodoroRemainingSec: 25 * 60,
  rainStudyAudioEnabled: true,
  placardsEnabled: true,
  desktopPetMode: false,
  placardOffsets: {},
  vcdTargetPetId: 'selected',
  pinnedDossierPetId: null,
  pureScreenMode: false,
  petStripExpanded: false,
  activeStripPetId: 'SPEC-2026-FYP',
  visualCustomConfig: {
    presetId: 'dlss5_neural_photoreal',
    hdrMode: 'softbox_portrait',
    envIntensity: 0.56,
    windowGobo: 'none',
    windowGoboStrength: 0.12,
    dynamicLightMode: 'sunset_cloud_drift',
    dynamicLightSpeed: 1.0,
    dynamicLightAmp: 1.0,
    chiaroscuro: 0.34,
    tyndall: 0.22,
    vintagePhoto: 0.0,
    softFocus: 0.04,
    depthBlur: 0.0,
    chromatic: 0.03,
    keyColor: '#fff6ee',
    rimColor: '#ffe8cc',
    keyAzimuthDeg: -28,
    keyElevationDeg: 26,
    keyIntensity: 1.84,
    fillIntensity: 0.64,
    rimIntensity: 1.32,
    hemiIntensity: 0.46,
    upIntensity: 0.24,
    exposure: 1.04,
    supersample: 1.0,
    casSharpen: 0.78,
    shadowLift: 0.36,
    specularClarity: 0.88,
    eyeClarity: 1.08,
    poreReliefGlobal: 1.15,
    sssIntensity: 0.92,
    skinGloss: 0.14,
    wetGloss: 0.14,
    sharpen: 0.18,
    contrast: 1.14,
    saturation: 0.96,
    warmth: 0.06,
    vignette: 0.26,
    filmGrain: 0.05,
    bloomStrength: 0.10,
    irisSparkle: 0.10,
    halation: 0.28,
    skinLumen: 0.0,
    cursorTorch: 0.28,
    sssBlur: 0.22,
    microContrast: 0.48,
    highlightRoll: 0.42,
    shadowCrush: 0.16,
    sunFlareVeil: 0.22,
    dappledBokeh: 0.0,
    anamorphicFlare: 0.16,
    lightLeak: 0.06,
    swirlyBokeh: 0.0,
    wetLensDrop: 0.0,
    lensDistortion: 0.04,
    filmLutMode: 'portra_160_sun',
    filmLutStrength: 0.48,
    postfxCombo: 'sunlit_portra_bokeh'
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
    customSkinMapUrl: '',
    customNormalMapUrl: '',
    customRoughnessMapUrl: '',
    customIrisMapUrl: '',
    skinTone: '#faDFce',
    blushIntensity: 0.18,
    lipColor: '#bc646e',
    irisColor: '#382015',
    eyelinerStyle: 0,
    eyelinerStrength: 0.0,
    eyelinerColor: '#2d201e',
    lashColor: '#44322e',
    eyeshadowIntensity: 0.0,
    eyelashDensity: 0.68,
    normalMapStrength: 0.26,
    poreScale: 1.0,
    poreRelief: 0.24,
    skinRoughness: 0.38,
    tZoneOiliness: 0.30,
    specularLobe: 0.45,
    charSssDepth: 0.80,
    charSssColor: '#e85a4f',
    vascularity: 0.24,
    skinMottle: 0.18,
    vellusFuzz: 0.36,
    lipCreaseDepth: 0.36,
    earTipFlush: 0.32,
    corneaWetness: 0.92,
    scleraVeinIntensity: 0.16,
    neckBloodStrength: 0.85,
    tearTrackStrength: 0.0,
    tearType: 0,
    nosebleedStrength: 0.0,
    nosebleedMode: 0,
    mouthBloodStrength: 0.0,
    faceSplatterStrength: 0.0,
    hairStyle: 'hair_user_photo',
    topCrown: 'default',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairDyePreset: 'natural_ebony',
    hairTipColor: '#4a3528',
    hairOmbreMix: 0.0,
    hairWispyFeather: 0.58,
    groomDensity: 6000,
    hairColor: '#121216',
    hairSheen: 0.78,
    neckClearance: 0.55,
    photoElement: null,
    photoBlend: 0.0,
    morphs: {
      deadExpression: 'dead_calm',
      jawOpen: 0.0,
      eyeRollUp: 0.0,
      tongueOut: 0.0,
      jawSide: 0.0,
      topCrownStyle: 'default',
      frontBangs: 'default',
      sideLocks: 'default',
      backAttachment: 'none',
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
      jawVLine: -0.08,
      chinLength: -0.04,
      cheekSoftness: 0.16,
      noseBridge: 0.04,
      noseWidth: 0.04,
      eyeSize: 0.12,
      eyeAperture: 0.0,
      eyeAlmond: 0.08,
      eyeTilt: -0.04,
      eyeSpacing: 0.0,
      lipFullness: 0.08,
      mouthSmile: 0.06,
      foreheadHeight: 0.04,
      eyelinerStyle: 0,
      eyelinerStrength: 0.0,
      eyeshadowIntensity: 0.0,
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
    } else if (preset === 'linxi') {
      img.src = (typeof window !== 'undefined' && window.__EMBEDDED_LINXI_PHOTO__)
        ? window.__EMBEDDED_LINXI_PHOTO__
        : '/models/linxi_life_ref.jpg';
    } else {
      img.src = (typeof window !== 'undefined' && window.__EMBEDDED_REF_PHOTO__)
        ? window.__EMBEDDED_REF_PHOTO__
        : '/models/chuxia_life_ref.jpg';
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
// HOVER DOSSIER FLOATING WINDOW & ALWAYS-ON CONNECTED SPECIMEN PLACARDS
// ("角色断头就是来个那种信息条不用关的那种类似标牌的连接，能看到角色照片，简要信息")
// ============================================================================
function populateAndShowDossierHUD(hoverInfo) {
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

function updateHoverDossierHUD(hoverInfo) {
  if (state.pinnedDossierPetId && desktopEngine && desktopEngine.pets.has(state.pinnedDossierPetId)) {
    if (hoverInfo && hoverInfo.collectible?.id === state.pinnedDossierPetId) {
      populateAndShowDossierHUD(hoverInfo);
    }
    return;
  }
  const hud = document.getElementById('pet-hover-dossier');
  if (hud && !hud.classList.contains('hidden')) {
    hud.classList.add('hidden');
  }
}

function togglePinnedDossierForPet(petId) {
  const hud = document.getElementById('pet-hover-dossier');
  if (!petId || !desktopEngine || !desktopEngine.pets.has(petId)) {
    state.pinnedDossierPetId = null;
    if (hud) hud.classList.add('hidden');
    return;
  }
  if (state.pinnedDossierPetId === petId && hud && !hud.classList.contains('hidden')) {
    state.pinnedDossierPetId = null;
    hud.classList.add('hidden');
    return;
  }
  state.pinnedDossierPetId = petId;
  const pet = desktopEngine.pets.get(petId);
  const snappedStruct = pet.snappedStructureId ? desktopEngine.structures.get(pet.snappedStructureId) : null;
  const screenPt = desktopEngine.worldToScreen(pet.pos);
  populateAndShowDossierHUD({
    collectible: pet.collectible,
    snappedStructure: snappedStruct || null,
    isRotationMode: pet.isRotationMode,
    positionCm: {
      x: Math.round(pet.pos.x),
      y: Math.round(pet.pos.y),
      zMm: Math.round(pet.pos.z * 10),
    },
    screenX: screenPt.x,
    screenY: screenPt.y,
  });
}

function renderSpecimenPlacards(placardsList = []) {
  const layer = document.getElementById('specimen-placards-layer');
  const svgEl = document.getElementById('specimen-placards-svg');
  const cardsEl = document.getElementById('specimen-placards-cards');
  if (!layer || !svgEl || !cardsEl) return;

  if (!state.placardsEnabled || placardsList.length === 0) {
    layer.classList.add('hidden');
    svgEl.innerHTML = '';
    cardsEl.innerHTML = '';
    return;
  }
  layer.classList.remove('hidden');

  const winW = window.innerWidth;
  const winH = window.innerHeight;
  const cardHalfW = 114;
  const cardHalfH = 30;
  const existingCards = new Map();
  cardsEl.querySelectorAll('.specimen-placard-card').forEach((el) => {
    existingCards.set(el.dataset.placardPetId, el);
  });

  const activeIds = new Set();
  const svgParts = [];

  for (const item of placardsList) {
    const col = item.collectible;
    if (!col) continue;
    activeIds.add(item.id);

    // Apply user custom drag offset (if moved) & clamp inside screen bounds
    const userOff = state.placardOffsets?.[item.id] || { dx: 0, dy: 0 };
    const hasCustomOffset = Math.abs(userOff.dx) > 1 || Math.abs(userOff.dy) > 1;
    let maxRight = winW - cardHalfW - 12;
    const swWin = document.getElementById('software-window');
    if (!hasCustomOffset && swWin && !state.windowHidden && swWin.classList.contains('window-dock-right') && !document.body.classList.contains('pure-screen-mode')) {
      const rect = swWin.getBoundingClientRect();
      if (rect.width > 80 && item.anchorX < rect.left) {
        maxRight = Math.min(maxRight, rect.left - cardHalfW - 10);
      }
    }
    const cx = Math.max(cardHalfW + 12, Math.min(maxRight, item.cardX + userOff.dx));
    const cy = Math.max(54, Math.min(winH - cardHalfH - 28, item.cardY + userOff.dy));

    // Dynamic 4-Edge Brass Callout Leader Line from 3D Neck Cut (anchorX, anchorY) -> Elbow -> Nearest Card Edge
    const dxCard = cx - item.anchorX;
    const dyCard = cy - item.anchorY;
    let attachX = cx;
    let attachY = cy;
    let elbowX = item.anchorX;
    let elbowY = item.anchorY;
    if (Math.abs(dyCard) > Math.abs(dxCard) * 0.68 && Math.abs(dyCard) > cardHalfH + 10) {
      // Attach to Top or Bottom edge of placard
      attachX = Math.max(cx - cardHalfW + 18, Math.min(cx + cardHalfW - 18, item.anchorX + dxCard * 0.25));
      attachY = dyCard > 0 ? cy - cardHalfH + 3 : cy + cardHalfH - 3;
      elbowX = attachX;
      elbowY = item.anchorY + (attachY - item.anchorY) * 0.52;
    } else {
      // Attach to Left or Right edge of placard
      attachX = dxCard >= 0 ? cx - cardHalfW + 4 : cx + cardHalfW - 4;
      attachY = Math.max(cy - cardHalfH + 10, Math.min(cy + cardHalfH - 10, cy));
      elbowX = item.anchorX + (attachX - item.anchorX) * 0.45;
      elbowY = attachY;
    }

    const isSelectedPet = state.activeStripPetId === item.id;
    const strokeCol = (item.isHovered || isSelectedPet) ? 'rgba(251, 191, 36, 0.96)' : 'rgba(217, 179, 130, 0.76)';
    const glowCol = (item.isHovered || isSelectedPet) ? 'rgba(245, 158, 11, 0.44)' : 'rgba(15, 12, 10, 0.55)';

    svgParts.push(`
      <g>
        <polyline points="${item.anchorX.toFixed(1)},${item.anchorY.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${attachX.toFixed(1)},${attachY.toFixed(1)}"
          fill="none" stroke="${glowCol}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" />
        <polyline points="${item.anchorX.toFixed(1)},${item.anchorY.toFixed(1)} ${elbowX.toFixed(1)},${elbowY.toFixed(1)} ${attachX.toFixed(1)},${attachY.toFixed(1)}"
          fill="none" stroke="${strokeCol}" stroke-width="1.4" stroke-dasharray="${(item.isHovered || isSelectedPet) ? 'none' : '4 2.5'}" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="${item.anchorX.toFixed(1)}" cy="${item.anchorY.toFixed(1)}" r="3.5" fill="#fde68a" stroke="#451a03" stroke-width="1.2" />
        <circle cx="${attachX.toFixed(1)}" cy="${attachY.toFixed(1)}" r="2.7" fill="#d9b382" />
      </g>
    `);

    let cardEl = existingCards.get(item.id);
    const photoSrc = resolveCollectibleLifePhotoSrc(col);
    const displayName = col.customDisplayName || col.name || '未命名标本';
    const parsedAge = (col.fateRecord?.vitalityStatus || col.subtitle || '').match(/\d+\s*岁/)?.[0] || '19岁';
    const displayAge = col.customAge || col.fateRecord?.ageAtCollection || parsedAge;
    const originText = col.dossier?.origin || col.subtitle || '私密典藏标本';
    const briefStory = col.customBriefStory
      || col.customContrastText
      || col.fateRecord?.causeOfDeath
      || col.fateRecord?.cause
      || col.fateRecord?.vitalityStatus
      || col.subtitle
      || '静默案头藏品 · 任由主人端详摆布';

    if (!cardEl) {
      cardEl = document.createElement('div');
      cardEl.className = 'specimen-placard-card';
      cardEl.dataset.placardPetId = item.id;
      cardEl.title = '按住鼠标左键可自由拖拽此标牌 · 双击标牌归位 · 点击文字可直接修改名字/年龄/简要故事';
      cardEl.innerHTML = `
        <div class="placard-header-main">
          <div class="placard-photo-wrap" data-placard-dossier="${item.id}" title="点击查看完整生平档案">
            <img data-placard-photo src="${photoSrc}" alt="${displayName}照片" draggable="false" />
          </div>
          <div class="placard-info-col">
            <div class="placard-top-row">
              <span class="placard-name" data-placard-title contenteditable="true" spellcheck="false" title="点击直接修改人物名字">${displayName}</span>
              <span class="placard-age-badge" data-placard-age contenteditable="true" spellcheck="false" title="点击直接修改人物年龄">${displayAge}</span>
            </div>
            <div class="placard-origin-line" data-placard-origin>${originText}</div>
          </div>
        </div>
        <div class="placard-brief-line" data-placard-brief contenteditable="true" spellcheck="false" title="可上下滚动查看完整故事 · 点击文字可直接修改内容">${briefStory}</div>
        <div class="placard-action-bar">
          <button type="button" class="placard-mini-btn" data-placard-dossier="${item.id}" title="展开完整生前状态、死因经过与反差语录">📖 完整生平档案</button>
          <button type="button" class="placard-mini-btn" data-placard-edit-studio="${item.id}" title="打开人物标牌与角色存档编辑器">✍️ 编辑标牌 / 存档</button>
        </div>
      `;
      const titleEditEl = cardEl.querySelector('[data-placard-title]');
      titleEditEl?.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      titleEditEl?.addEventListener('blur', () => {
        const raw = titleEditEl.textContent?.trim();
        if (raw) {
          col.customDisplayName = raw;
          persistCollectibles();
          if (typeof window.__syncPlacardEditorFields === 'function') window.__syncPlacardEditorFields(col);
          if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
          showToast(`✍️ 已更新标牌名字为「${raw}」`);
        }
      });
      titleEditEl?.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          titleEditEl.blur();
        }
      });

      const ageEditEl = cardEl.querySelector('[data-placard-age]');
      ageEditEl?.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      ageEditEl?.addEventListener('blur', () => {
        const rawAge = ageEditEl.textContent?.trim();
        if (rawAge) {
          col.customAge = rawAge;
          if (col.fateRecord) col.fateRecord.ageAtCollection = rawAge;
          persistCollectibles();
          if (typeof window.__syncPlacardEditorFields === 'function') window.__syncPlacardEditorFields(col);
          if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
          showToast(`✍️ 已更新标牌年龄为「${rawAge}」`);
        }
      });
      ageEditEl?.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          ageEditEl.blur();
        }
      });

      const briefEl = cardEl.querySelector('[data-placard-brief]');
      briefEl?.addEventListener('pointerdown', (ev) => ev.stopPropagation());
      briefEl?.addEventListener('blur', () => {
        const text = briefEl.textContent?.trim();
        if (text) {
          col.customBriefStory = text;
          col.customContrastText = text;
          persistCollectibles();
          if (typeof window.__syncPlacardEditorFields === 'function') window.__syncPlacardEditorFields(col);
          if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
          showToast('✍️ 已保存人物简要故事！');
        }
      });
      briefEl?.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          briefEl.blur();
        }
      });

      cardEl.querySelectorAll('[data-placard-dossier]').forEach((btn) => {
        btn.addEventListener('pointerdown', (ev) => ev.stopPropagation());
        btn.addEventListener('click', (ev) => {
          if (cardEl.dataset.justDragged === '1') return;
          ev.stopPropagation();
          state.activeStripPetId = item.id;
          if (typeof window.__syncVcdSelectedPetUI === 'function') {
            window.__syncVcdSelectedPetUI(item.id);
          }
          togglePinnedDossierForPet(item.id);
        });
      });

      cardEl.querySelectorAll('[data-placard-edit-studio]').forEach((btn) => {
        btn.addEventListener('pointerdown', (ev) => ev.stopPropagation());
        btn.addEventListener('click', (ev) => {
          if (cardEl.dataset.justDragged === '1') return;
          ev.stopPropagation();
          state.activeStripPetId = item.id;
          if (typeof window.__syncVcdSelectedPetUI === 'function') {
            window.__syncVcdSelectedPetUI(item.id);
          }
          const studio = document.getElementById('obsidian-char-hair-studio');
          if (studio) {
            studio.classList.remove('hidden');
            document.getElementById('btn-open-obsidian-studio')?.classList.add('active-top');
            const charTab = studio.querySelector('.obs-tab-btn[data-obs-tab="char"]');
            charTab?.click();
            if (typeof window.__syncPlacardEditorFields === 'function') window.__syncPlacardEditorFields(col);
            if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
          }
        });
      });

      // Stage 43 · Free Pointer Dragging & Double-Click Reset for Connected Specimen Placards
      cardEl.addEventListener('pointerdown', (ev) => {
        if (ev.button !== 0) return;
        if (ev.target.closest('[contenteditable="true"]')) return;
        ev.stopPropagation();
        state.activeStripPetId = item.id;
        if (typeof window.__syncVcdSelectedPetUI === 'function') {
          window.__syncVcdSelectedPetUI(item.id);
        }
        const curOff = state.placardOffsets[item.id] || { dx: 0, dy: 0 };
        const startX = ev.clientX;
        const startY = ev.clientY;
        const startDx = curOff.dx;
        const startDy = curOff.dy;
        let moved = false;
        cardEl.setPointerCapture(ev.pointerId);
        cardEl.classList.add('is-dragging');

        const onMove = (mev) => {
          const dX = mev.clientX - startX;
          const dY = mev.clientY - startY;
          if (Math.hypot(dX, dY) > 3) moved = true;
          state.placardOffsets[item.id] = { dx: startDx + dX, dy: startDy + dY };
          if (desktopEngine) {
            renderSpecimenPlacards(desktopEngine.getPlacardsScreenData());
          }
        };
        const onUp = (uev) => {
          cardEl.releasePointerCapture(uev.pointerId);
          cardEl.classList.remove('is-dragging');
          cardEl.removeEventListener('pointermove', onMove);
          cardEl.removeEventListener('pointerup', onUp);
          cardEl.removeEventListener('pointercancel', onUp);
          if (moved) {
            cardEl.dataset.justDragged = '1';
            setTimeout(() => { delete cardEl.dataset.justDragged; }, 160);
          }
        };
        cardEl.addEventListener('pointermove', onMove);
        cardEl.addEventListener('pointerup', onUp);
        cardEl.addEventListener('pointercancel', onUp);
      });

      cardEl.addEventListener('dblclick', (ev) => {
        if (ev.target.closest('[contenteditable="true"]')) return;
        ev.stopPropagation();
        delete state.placardOffsets[item.id];
        if (desktopEngine) renderSpecimenPlacards(desktopEngine.getPlacardsScreenData());
        showToast(`🏷️ 已将「${displayName}」连接标牌归位至默认锚点`);
      });

      cardsEl.appendChild(cardEl);
    } else {
      const photoImg = cardEl.querySelector('[data-placard-photo]');
      if (photoImg && photoImg.getAttribute('src') !== photoSrc) {
        photoImg.setAttribute('src', photoSrc);
      }
      const titleEl = cardEl.querySelector('[data-placard-title]');
      if (titleEl && document.activeElement !== titleEl) {
        titleEl.textContent = displayName;
      }
      const ageEl = cardEl.querySelector('[data-placard-age]');
      if (ageEl && document.activeElement !== ageEl) {
        ageEl.textContent = displayAge;
      }
      const originEl = cardEl.querySelector('[data-placard-origin]');
      if (originEl) {
        originEl.textContent = originText;
      }
      const briefEl = cardEl.querySelector('[data-placard-brief]');
      if (briefEl && document.activeElement !== briefEl) {
        briefEl.textContent = briefStory;
      }
    }

    cardEl.classList.toggle('is-hovered', Boolean(item.isHovered || isSelectedPet));
    cardEl.style.left = `${cx.toFixed(1)}px`;
    cardEl.style.top = `${cy.toFixed(1)}px`;
  }

  // Remove stale placard DOM elements for dismissed heads
  for (const [id, el] of existingCards.entries()) {
    if (!activeIds.has(id)) {
      el.remove();
    }
  }

  svgEl.innerHTML = svgParts.join('');
}

function updateStructureFloatingHUD(info) {
  const hud = document.getElementById('structure-floating-hud');
  if (hud) hud.classList.add('hidden');
  return;
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
// STAGE 52: PUZZLE-SKILL ENGINE, MONTHLY SCORE POOL & ANTI-CHEAT RUNTIME
// ============================================================================
const PUZZLE_SCORE_STORAGE_KEY = 'cervix3d-puzzle-monthly-score-v52';
function loadPuzzleScoreState() {
  const defaultState = {
    yearMonth: '2026-10',
    monthlyFocusScore: 480,
    monthlyNotebookScore: 420,
    monthlyVictorScore: 380,
    dailyScore: 1280,
    heartbeatPassedCount: 2,
    heartbeatFailedCount: 0,
    totalValidNotebookChars: 210,
    lastNotebookEntropy: 4.46,
    subscriberCount: 200,
    hardcoreWipeEnabled: true,
    loadouts: JSON.parse(JSON.stringify(DEFAULT_HEAD_PUZZLE_LOADOUTS)),
    auditLogs: [
      '• [10-14 09:30] 研习笔记审计：高等数学泰勒展开推导 · 210有效字 · 香农熵4.46(S级) · +420 PTS',
      '• [10-14 10:15] 沉浸专注计时：连续专注 16 分钟 + 2次在线签到通过 · +480 PTS'
    ],
  };
  try {
    const raw = JSON.parse(localStorage.getItem(PUZZLE_SCORE_STORAGE_KEY) || 'null');
    if (raw && typeof raw === 'object') {
      return {
        ...defaultState,
        ...raw,
        loadouts: { ...defaultState.loadouts, ...(raw.loadouts || {}) },
      };
    }
  } catch (_) {}
  return defaultState;
}

const puzzleState = loadPuzzleScoreState();
function savePuzzleScoreState() {
  try {
    localStorage.setItem(PUZZLE_SCORE_STORAGE_KEY, JSON.stringify(puzzleState));
  } catch (_) {}
}

const puzzleRuntime = {
  focusRunning: false,
  focusSessionSec: 0,
  focusSessionPendingPts: 0,
  nextHeartbeatInSec: 45,
  hbActive: false,
  hbCountdownSec: 25,
  pastedCharsInDraft: 0,
  keystrokeTimestamps: [],
  keystrokeIntervals: [],
  victorBuffUntilMs: 0,
  bountyRunning: false,
  bountyRemainingSec: 15 * 60,
  declIdx: 0,
};

function getHeadLoadout(collectibleId) {
  if (!puzzleState.loadouts[collectibleId]) {
    puzzleState.loadouts[collectibleId] = {
      activeTrigger: collectibleId === 'SPEC-2026-000' ? 'PZ-B1' : (collectibleId === 'SPEC-2026-001' ? 'PZ-C1' : 'PZ-A1'),
      passiveBuff: collectibleId === 'SPEC-2026-000' ? 'PZ-P2' : (collectibleId === 'SPEC-2026-001' ? 'PZ-P3' : 'PZ-P1'),
      anticheatGuard: collectibleId === 'SPEC-2026-000' ? 'PZ-G2' : (collectibleId === 'SPEC-2026-001' ? 'PZ-G3' : 'PZ-G1'),
    };
  }
  return puzzleState.loadouts[collectibleId];
}

function getPlacardPuzzleButtonLabel(collectibleId) {
  if (puzzleRuntime.hbActive) {
    return '🚨点我巡检!';
  }
  const loadout = getHeadLoadout(collectibleId);
  if (loadout.activeTrigger === 'PZ-A1') {
    if (puzzleRuntime.focusRunning) {
      const m = String(Math.floor(puzzleRuntime.focusSessionSec / 60)).padStart(2, '0');
      const s = String(puzzleRuntime.focusSessionSec % 60).padStart(2, '0');
      return `⏱️${m}:${s}·结算`;
    }
    return '⏱️点头专注';
  }
  if (loadout.activeTrigger === 'PZ-B1') {
    return '✍️笔记计分';
  }
  return '⚡胜者汲取';
}

function getActivePuzzleMultiplier() {
  let mult = 1.35; // 状元基础连击环
  if (Date.now() < puzzleRuntime.victorBuffUntilMs) {
    mult *= 1.40; // 胜者肾上腺素加成
  }
  if (puzzleRuntime.focusRunning && puzzleRuntime.focusSessionSec >= 300) {
    mult *= Math.min(1.6, 1 + Math.floor(puzzleRuntime.focusSessionSec / 300) * 0.15);
  }
  return Number(mult.toFixed(2));
}

function getMonthlyTotalScore() {
  return Math.round(
    (puzzleState.monthlyFocusScore || 0) +
    (puzzleState.monthlyNotebookScore || 0) +
    (puzzleState.monthlyVictorScore || 0)
  );
}

// ============================================================================
// STAGE 24 & 52: CHARACTER-BOUND STUDY & PUZZLE SKILL EXECUTOR
// ============================================================================
function triggerHeadPuzzleSkill(collectibleId, source = 'placard') {
  // 1. If Anti-AFK Heartbeat Check is flashing, clicking ANY head or placard immediately passes the check!
  if (puzzleRuntime.hbActive) {
    if (typeof window.__confirmPuzzleHeartbeatCheck === 'function') {
      window.__confirmPuzzleHeartbeatCheck(collectibleId);
    }
    return;
  }

  const loadout = getHeadLoadout(collectibleId);
  if (loadout.activeTrigger === 'PZ-A1') {
    // 专注计时器：点头直接开启/暂停结算专注计时！
    if (typeof window.__togglePuzzleFocusTimer === 'function') {
      window.__togglePuzzleFocusTimer(source);
    }
    return;
  }

  if (source === 'head-click') {
    // 平时直接单击其他头仅切换 360 旋转，不强行弹窗遮挡视线；点标牌按钮才打开对应工作台
    return;
  }

  if (loadout.activeTrigger === 'PZ-B1') {
    if (typeof window.__openPuzzleHubTab === 'function') {
      window.__openPuzzleHubTab('notebook');
    }
    return;
  }

  if (loadout.activeTrigger === 'PZ-C1') {
    if (typeof window.__triggerVictorSiphonAction === 'function') {
      window.__triggerVictorSiphonAction();
    }
    if (typeof window.__openPuzzleHubTab === 'function') {
      window.__openPuzzleHubTab('victor');
    }
  }
}

function executeCharacterStudyRole(collectibleId) {
  const col = state.collectibles.find(c => c.id === collectibleId);
  if (!col) return;
  const roleMeta = getStudyRoleMeta(col.studyRole || 'gaokao_pomodoro');

  // Apply study role buff & energy burst
  const burst = roleMeta.energyBurst || 280;
  state.studyEnergyPoints += burst;
  state.activeRoleBuffMultiplier = roleMeta.buffMultiplier || 1.5;

  const energyValEl = document.getElementById('triumph-energy-val');
  const barFillEl = document.getElementById('triumph-bar-fill');
  const quoteEl = document.getElementById('triumph-quote-text');
  if (energyValEl) energyValEl.textContent = `${state.studyEnergyPoints.toLocaleString()} PTS (x${state.activeRoleBuffMultiplier.toFixed(1)})`;
  if (barFillEl) barFillEl.style.width = `${Math.min(100, ((state.studyEnergyPoints % 2500) / 2500) * 100)}%`;
  if (quoteEl) {
    quoteEl.textContent = `【${col.name.split('·')[0].trim()} · ${roleMeta.shortLabel}】${roleMeta.triggerMsg}`;
  }

  triggerHeadPuzzleSkill(collectibleId, 'vault');
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
    const curFluid = p.fluidPreset || 'fresh_neck_cut';
    const fluidShortOpts = [
      ['fresh_neck_cut', '🔪 鲜血断口'],
      ['crying_tears', '💧 梨花泪痕'],
      ['nosebleed_tears', '🥀 鼻血+泪痕'],
      ['blood_tears_mouth', '🩸 血泪+嘴血'],
      ['heavy_trauma', '⚔️ 重度战损'],
      ['clean_specimen', '✨ 洁净无血'],
    ].map(([fid, flabel]) => `<option value="${fid}" ${fid === curFluid ? 'selected' : ''}>${flabel}</option>`).join('');
    const pill = document.createElement('div');
    pill.className = 'pet-pill';
    pill.style.cssText = 'margin-top:4px;padding:4px 8px;';
    pill.innerHTML = `
      <strong style="color:#7dd3fc;font-size:11px;">${p.name.split('·')[0].trim()} 微调:</strong>
      <select class="pill-mini-btn" data-pill-fluid="${p.id}" title="切换鼻血/泪痕/血泪/断口血迹状态" style="width:auto!important;max-width:118px;padding:2px 4px;background:rgba(48,14,24,0.92);color:#fda4af;border:1px solid rgba(244,63,94,0.55);border-radius:6px;">
        ${fluidShortOpts}
      </select>
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

  pillsContainer.querySelectorAll('[data-pill-fluid]').forEach(sel => {
    sel.addEventListener('change', (e) => {
      const id = sel.dataset.pillFluid;
      const fluidId = e.target.value;
      const presetMap = {
        fresh_neck_cut: { label: '🔪 鲜血断口', neckBloodStrength: 0.85, tearTrackStrength: 0.0, tearType: 0, nosebleedStrength: 0.0, nosebleedMode: 0, mouthBloodStrength: 0.0, faceSplatterStrength: 0.0 },
        crying_tears: { label: '💧 梨花带雨泪痕', neckBloodStrength: 0.85, tearTrackStrength: 0.88, tearType: 0, nosebleedStrength: 0.0, nosebleedMode: 0, mouthBloodStrength: 0.0, faceSplatterStrength: 0.0 },
        nosebleed_tears: { label: '🥀 凄美鼻血+泪痕', neckBloodStrength: 0.90, tearTrackStrength: 0.86, tearType: 0, nosebleedStrength: 0.84, nosebleedMode: 0, mouthBloodStrength: 0.28, faceSplatterStrength: 0.18 },
        blood_tears_mouth: { label: '🩸 猩红血泪+嘴角血', neckBloodStrength: 0.95, tearTrackStrength: 0.92, tearType: 2, nosebleedStrength: 0.68, nosebleedMode: 1, mouthBloodStrength: 0.88, faceSplatterStrength: 0.35 },
        heavy_trauma: { label: '⚔️ 重度断首战损', neckBloodStrength: 1.15, tearTrackStrength: 0.95, tearType: 2, nosebleedStrength: 0.96, nosebleedMode: 0, mouthBloodStrength: 0.92, faceSplatterStrength: 0.78 },
        clean_specimen: { label: '✨ 洁净无血标本', neckBloodStrength: 0.0, tearTrackStrength: 0.0, tearType: 0, nosebleedStrength: 0.0, nosebleedMode: 0, mouthBloodStrength: 0.0, faceSplatterStrength: 0.0 },
      };
      const pCfg = presetMap[fluidId] || presetMap.fresh_neck_cut;
      const col = state.collectibles.find(c => c.id === id);
      if (col) {
        col.fluidPreset = fluidId;
        Object.assign(col, pCfg);
        col.morphs = { ...(col.morphs || {}), ...pCfg };
        persistCollectibles();
      }
      const petEntry = desktopEngine?.pets.get(id);
      if (petEntry?.collectible) {
        petEntry.collectible.fluidPreset = fluidId;
        Object.assign(petEntry.collectible, pCfg);
      }
      const headGroup = petEntry?.node || petEntry?.headNode;
      if (headGroup) {
        updateCollectibleMaterialsLive(headGroup, pCfg);
        desktopEngine.wakeRender(1.5, true);
      }
      showToast(`🩸 已为「${col ? col.name.split('·')[0].trim() : id}」切换体液与创伤状态：${pCfg.label}`);
    });
  });

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
  const node = studioEngine.headNode;
  const hStats = node?.userData?.hairStats;
  const error = node?.userData?.hairLoadError;
  const status = document.getElementById('custom-model-status');
  if (status) {
    status.textContent = formatAssetQuality(node?.userData?.assetStats) +
      (hStats ? ` · 发型：${Math.round(hStats.triangles).toLocaleString()} 三角面` : '');
    status.title = '内置资产仅为示例，不等同于照片重建或正版 Daz 商业资产。';
  }
  const groomStatus = document.getElementById('groom-quality-status');
  if (groomStatus) groomStatus.textContent = error ? `发型加载失败：${error}。请重新导入原件。` :
    hStats ? `${state.studioDraft.customHairUrl ? '导入发型 · 保留原 PBR 材质' : '内置发片 · 单层覆盖 / 场景光照'} · ${hStats.vertices.toLocaleString()} 顶点 · ${Math.round(hStats.triangles).toLocaleString()} 三角面。轮廓与照片一致性仍取决于资产。` : '无发模式';
  const sheen = state.studioDraft.hairSheen ?? 0.45;
  const sheenInput = document.getElementById('slider-hair-sheen');
  if (sheenInput) {
    sheenInput.value = String(sheen);
    sheenInput.disabled = Boolean(state.studioDraft.customHairUrl);
    sheenInput.title = state.studioDraft.customHairUrl ? '外部模型保留艺术家材质；请在 Blender 调整其粗糙度。' : '';
  }
  document.getElementById('val-hair-sheen').textContent = `${Math.round(sheen * 100)}%`;
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
  const cm = col.morphs || {};
  state.studioDraft = JSON.parse(JSON.stringify({
    basePreset: col.basePreset || 'user_photo',
    skinVariant: col.skinVariant || cm.skinVariant || 'cn_scholar_natural',
    faceArchetype: col.faceArchetype || cm.faceArchetype || 'cn_oval_scholar',
    eyebrowStyle: col.eyebrowStyle || cm.eyebrowStyle || 'cn_scholar_natural',
    deadExpression: deadExpr,
    containerStyle: col.containerStyle || 'glass_bell_jar',
    decorStyle: col.decorStyle || 'trophy_candles',
    studyRole: col.studyRole || 'gaokao_pomodoro',
    studyGoalNote: col.studyGoalNote || '',
    customModelUrl: col.customModelUrl || null,
    customModelType: col.customModelType || 'glb',
    customHairUrl: col.customHairUrl || null,
    customHairType: col.customHairType || 'glb',
    customHairName: col.customHairName || '',
    customSkinMapUrl: col.customSkinMapUrl || cm.customSkinMapUrl || '',
    customNormalMapUrl: col.customNormalMapUrl || cm.customNormalMapUrl || '',
    customRoughnessMapUrl: col.customRoughnessMapUrl || cm.customRoughnessMapUrl || '',
    customIrisMapUrl: col.customIrisMapUrl || cm.customIrisMapUrl || '',
    skinTone: col.skinTone || '#ffe9df',
    blushIntensity: col.blushIntensity ?? 0.25,
    lipColor: col.lipColor || '#c46470',
    irisColor: col.irisColor || '#3b2014',
    eyelinerStyle: col.eyelinerStyle ?? cm.eyelinerStyle ?? 0,
    eyelinerStrength: col.eyelinerStrength ?? cm.eyelinerStrength ?? 0.0,
    eyelinerColor: col.eyelinerColor ?? cm.eyelinerColor ?? '#2d201e',
    lashColor: col.lashColor ?? cm.lashColor ?? '#44322e',
    eyeshadowIntensity: col.eyeshadowIntensity ?? cm.eyeshadowIntensity ?? 0.0,
    eyelashDensity: col.eyelashDensity ?? cm.eyelashDensity ?? 0.68,
    normalMapStrength: col.normalMapStrength ?? cm.normalMapStrength ?? 0.26,
    poreScale: col.poreScale ?? cm.poreScale ?? 1.0,
    poreRelief: col.poreRelief ?? cm.poreRelief ?? 0.24,
    skinRoughness: col.skinRoughness ?? cm.skinRoughness ?? 0.38,
    tZoneOiliness: col.tZoneOiliness ?? cm.tZoneOiliness ?? 0.30,
    specularLobe: col.specularLobe ?? cm.specularLobe ?? 0.45,
    charSssDepth: col.charSssDepth ?? cm.charSssDepth ?? 0.80,
    charSssColor: col.charSssColor ?? cm.charSssColor ?? '#e85a4f',
    vascularity: col.vascularity ?? cm.vascularity ?? 0.24,
    skinMottle: col.skinMottle ?? cm.skinMottle ?? 0.18,
    vellusFuzz: col.vellusFuzz ?? cm.vellusFuzz ?? 0.36,
    lipCreaseDepth: col.lipCreaseDepth ?? cm.lipCreaseDepth ?? 0.36,
    earTipFlush: col.earTipFlush ?? cm.earTipFlush ?? 0.32,
    corneaWetness: col.corneaWetness ?? cm.corneaWetness ?? 0.92,
    scleraVeinIntensity: col.scleraVeinIntensity ?? cm.scleraVeinIntensity ?? 0.16,
    hairStyle: resolvedHair,
    groomDensity: col.groomDensity || 6000,
    hairColor: col.hairColor || '#121216',
    hairSheen: col.hairSheen ?? 0.85,
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
      ...cm
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
  const colLiner = document.getElementById('col-eyeliner');
  if (colLiner) colLiner.value = state.studioDraft.eyelinerColor || '#2d201e';
  const colLash = document.getElementById('col-lash');
  if (colLash) colLash.value = state.studioDraft.lashColor || '#44322e';
  const colSss = document.getElementById('col-char-sss');
  if (colSss) colSss.value = state.studioDraft.charSssColor || '#e85a4f';
  const selLiner = document.getElementById('sel-eyeliner-style');
  if (selLiner) selLiner.value = String(state.studioDraft.eyelinerStyle ?? 0);
  for (const [sId, vId, key] of [
    ['slider-normal-map-strength', 'val-normal-map-strength', 'normalMapStrength'],
    ['slider-pore-scale', 'val-pore-scale', 'poreScale'],
    ['slider-pore-relief', 'val-pore-relief', 'poreRelief'],
    ['slider-skin-roughness', 'val-skin-roughness', 'skinRoughness'],
    ['slider-tzone-oiliness', 'val-tzone-oiliness', 'tZoneOiliness'],
    ['slider-specular-lobe', 'val-specular-lobe', 'specularLobe'],
    ['slider-char-sss-depth', 'val-char-sss-depth', 'charSssDepth'],
    ['slider-vascularity', 'val-vascularity', 'vascularity'],
    ['slider-skin-mottle', 'val-skin-mottle', 'skinMottle'],
    ['slider-vellus-fuzz', 'val-vellus-fuzz', 'vellusFuzz'],
    ['slider-lip-crease-depth', 'val-lip-crease-depth', 'lipCreaseDepth'],
    ['slider-ear-tip-flush', 'val-ear-tip-flush', 'earTipFlush'],
    ['slider-eyeliner-strength', 'val-eyeliner-strength', 'eyelinerStrength'],
    ['slider-eyeshadow', 'val-eyeshadow', 'eyeshadowIntensity'],
    ['slider-eyelash-density', 'val-eyelash-density', 'eyelashDensity'],
    ['slider-cornea-wetness', 'val-cornea-wetness', 'corneaWetness'],
    ['slider-sclera-veins', 'val-sclera-veins', 'scleraVeinIntensity'],
  ]) {
    const val = Number(state.studioDraft[key] ?? 0);
    const sEl = document.getElementById(sId);
    const vEl = document.getElementById(vId);
    if (sEl) sEl.value = String(val);
    if (vEl) vEl.textContent = `${Math.round(val * 100)}%`;
  }
  const mapStatusEl = document.getElementById('char-custom-map-status');
  if (mapStatusEl) {
    const activeNames = [];
    if (state.studioDraft.customSkinMapUrl) activeNames.push('表皮漫反射图');
    if (state.studioDraft.customNormalMapUrl) activeNames.push('微距法线图');
    if (state.studioDraft.customRoughnessMapUrl) activeNames.push('光泽粗糙度图');
    if (state.studioDraft.customIrisMapUrl) activeNames.push('虹膜纹理图');
    mapStatusEl.textContent = activeNames.length > 0
      ? `✅ 当前角色已挂载自定义PBR贴图：${activeNames.join(' + ')}`
      : '当前使用内置 2K 摄影级 PBR 贴图通道';
  }

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
      document.body.classList.remove('game-not-started');
      if (startOverlay) startOverlay.classList.add('hidden');
      setWindowVisibility(true);
      soundEngine.playSummon(true);
      if (state.rainStudyAudioEnabled) soundEngine.startRainAmbience();
      showToast('🌧️ 已进入雨夜书房 3D 断头桌宠伴学模式！窗外细雨已开启 | 拖拽人头可放入/拎出收纳建筑');
    });
  }

  if (btnStartStudio) {
    btnStartStudio.addEventListener('click', () => {
      document.body.classList.remove('game-not-started');
      if (startOverlay) startOverlay.classList.add('hidden');
      setWindowVisibility(false);
      // Go straight to the editor instead of opening the unrelated vault tab.
      document.querySelector('#software-tabs .nav-tab[data-tab="studio"]')?.click();
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
    onPlacardsUpdate: renderSpecimenPlacards,
    onHeadClick: (petId) => triggerHeadPuzzleSkill(petId, 'head-click'),
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

  document.getElementById('btn-struct-hud-closer')?.addEventListener('click', () => {
    const hud = document.getElementById('structure-floating-hud');
    const structId = hud?.dataset?.structId;
    if (structId && desktopEngine) {
      desktopEngine.stepStructureDepth(structId, 9.0);
    }
  });

  document.getElementById('btn-struct-hud-farther')?.addEventListener('click', () => {
    const hud = document.getElementById('structure-floating-hud');
    const structId = hud?.dataset?.structId;
    if (structId && desktopEngine) {
      desktopEngine.stepStructureDepth(structId, -9.0);
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
    if (desktopEngine) {
      desktopEngine.selectedStructureId = null;
    }
    updateStructureFloatingHUD(null);
  });

  document.getElementById('btn-close-hover-dossier')?.addEventListener('click', () => {
    state.pinnedDossierPetId = null;
    const hud = document.getElementById('pet-hover-dossier');
    if (hud) hud.classList.add('hidden');
  });

  // Global Unstuck-UI Safeguard: clicking outside popups/drawers or pressing Escape reliably dismisses them!
  window.addEventListener('pointerdown', (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const dossierEl = document.getElementById('pet-hover-dossier');
    if (dossierEl && !dossierEl.classList.contains('hidden')) {
      if (!target.closest('#pet-hover-dossier') && !target.closest('[data-placard-dossier]')) {
        state.pinnedDossierPetId = null;
        dossierEl.classList.add('hidden');
      }
    }
    const vcdEl = document.getElementById('visual-customizer-drawer');
    if (vcdEl && !vcdEl.classList.contains('hidden')) {
      if (target === desktopCanvas) {
        vcdEl.classList.add('hidden');
      }
    }
  }, true);

  const setPureScreenMode = (enabled) => {
    state.pureScreenMode = Boolean(enabled);
    document.body.classList.toggle('pure-screen-mode', state.pureScreenMode);
    const restoreBtn = document.getElementById('pure-screen-floating-btn');
    if (restoreBtn) restoreBtn.classList.toggle('hidden', !state.pureScreenMode);
    if (desktopEngine) {
      desktopEngine.onPlacardsUpdate(desktopEngine.getPlacardsScreenData());
    }
  };
  document.getElementById('btn-quick-pure-screen')?.addEventListener('click', () => {
    setPureScreenMode(true);
    showToast('👁️ 已进入纯享画面模式！所有悬浮面板已收起，仅保留3D动态光影与标本连接标牌（按 Esc 随时恢复）');
  });
  document.getElementById('pure-screen-floating-btn')?.addEventListener('click', () => {
    setPureScreenMode(false);
    showToast('✨ 已恢复显示全部 UI 控制面板');
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (state.pureScreenMode) {
        setPureScreenMode(false);
      }
      state.pinnedDossierPetId = null;
      document.getElementById('pet-hover-dossier')?.classList.add('hidden');
      document.getElementById('visual-customizer-drawer')?.classList.add('hidden');
      updateStructureFloatingHUD(null);
    }
  });

  document.getElementById('btn-quick-placards')?.addEventListener('click', (e) => {
    state.placardsEnabled = !state.placardsEnabled;
    e.currentTarget.classList.toggle('active-top', state.placardsEnabled);
    e.currentTarget.textContent = state.placardsEnabled ? '🏷️ 连接标牌: 开' : '🏷️ 连接标牌: 关';
    if (desktopEngine) {
      renderSpecimenPlacards(desktopEngine.getPlacardsScreenData());
    }
    showToast(state.placardsEnabled
      ? '🏷️ 已开启断头标本连接标牌（常驻显示角色生前照片与简要信息，无需手动关闭）'
      : '🏷️ 已隐藏断头标本连接标牌（鼠标悬停人头将显示传统悬浮卡片）');
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

  // Stage 8: headless visual-QA hook（无头浏览器截图验证/排障用，对正常游玩无任何影响）
  window.__cervixQA = {
    get desktop() { return desktopEngine; },
    get studio() { return studioEngine; },
    state,
    persistCollectibles,
    resolveCollectibleLifePhotoSrc,
    showToast,
    renderVaultGrid,
    refreshPlacards() {
      if (desktopEngine) renderSpecimenPlacards(desktopEngine.getPlacardsScreenData());
    },
    getActiveCollectible() {
      const targetId = state.activeStripPetId || 'SPEC-2026-FYP';
      return state.collectibles.find(c => c.id === targetId) || state.collectibles[0] || null;
    },
    syncLivePetToCollectible(col) {
      if (!col) return null;
      const pet = desktopEngine?.pets?.get(col.id);
      if (pet?.collectible) {
        Object.assign(col, JSON.parse(JSON.stringify(pet.collectible)));
      }
      const headGroup = pet?.node || pet?.headNode;
      if (headGroup?.userData?.currentMorphs) {
        col.morphs = { ...(col.morphs || {}), ...JSON.parse(JSON.stringify(headGroup.userData.currentMorphs)) };
      }
      if (headGroup?.userData?.currentHairStyle) {
        col.hairStyle = headGroup.userData.currentHairStyle;
      }
      if (headGroup?.userData?.hairColor) {
        col.hairColor = headGroup.userData.hairColor;
      }
      return col;
    },
    saveActiveCharacterDesign() {
      const col = this.getActiveCollectible();
      if (!col) return null;
      this.syncLivePetToCollectible(col);
      const nameInp = document.getElementById('obs-placard-name-input');
      const ageInp = document.getElementById('obs-placard-age-input');
      const storyInp = document.getElementById('obs-placard-story-input');
      if (nameInp?.value?.trim()) col.customDisplayName = nameInp.value.trim();
      if (ageInp?.value?.trim()) {
        col.customAge = ageInp.value.trim();
        if (col.fateRecord) col.fateRecord.ageAtCollection = col.customAge;
      }
      if (storyInp?.value?.trim()) {
        col.customBriefStory = storyInp.value.trim();
        col.customContrastText = col.customBriefStory;
      }
      persistCollectibles();
      renderVaultGrid();
      this.refreshPlacards();
      if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
      const title = col.customDisplayName || col.name;
      showToast(`💾 已保存角色「${title}」的全部脸型、发型、彩妆与标牌设定！`);
      return col;
    },
    async saveAsNewCharacterSlot(customTitle = '') {
      const baseCol = this.saveActiveCharacterDesign() || this.getActiveCollectible();
      if (!baseCol) return null;
      const cloned = JSON.parse(JSON.stringify(baseCol));
      const suffix = String(Date.now()).slice(-4);
      cloned.id = `SPEC-USER-${suffix}`;
      const baseName = customTitle.trim() || `${(baseCol.customDisplayName || baseCol.name.split('·')[0]).trim()} · 自定义存档#${state.collectibles.length + 1}`;
      cloned.name = baseName;
      cloned.customDisplayName = baseName;
      cloned.isCustomUserSlot = true;
      cloned.summoned = true;
      state.collectibles.unshift(cloned);
      state.activeStripPetId = cloned.id;
      persistCollectibles();
      if (desktopEngine) {
        try {
          await desktopEngine.summonCollectible(cloned);
          desktopEngine.selectedPetId = cloned.id;
          desktopEngine.emitPetsChange();
        } catch (_) {}
      }
      renderVaultGrid();
      this.refreshPlacards();
      if (typeof window.__syncVcdSelectedPetUI === 'function') window.__syncVcdSelectedPetUI(cloned.id);
      if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
      showToast(`➕ 已另存为新角色槽位「${baseName}」并召唤至桌面！`);
      return cloned;
    },
    async applySavedCharacterToActivePet(sourceId, mode = 'select_or_apply') {
      const srcCol = state.collectibles.find(c => c.id === sourceId);
      if (!srcCol) return;
      if (mode === 'select_or_apply' && desktopEngine?.pets?.has(sourceId)) {
        state.activeStripPetId = sourceId;
        desktopEngine.selectedPetId = sourceId;
        desktopEngine.emitPetsChange();
        loadCollectibleIntoStudio(srcCol);
        if (typeof window.__syncVcdSelectedPetUI === 'function') window.__syncVcdSelectedPetUI(sourceId);
        if (typeof window.__syncPlacardEditorFields === 'function') window.__syncPlacardEditorFields(srcCol);
        if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
        this.refreshPlacards();
        showToast(`📂 已切换并读取桌上角色「${srcCol.customDisplayName || srcCol.name}」`);
        return;
      }
      // Apply srcCol's full appearance onto the currently active desktop pet
      const targetCol = this.getActiveCollectible();
      if (!targetCol) return;
      const copyKeys = [
        'skinVariant', 'faceArchetype', 'eyebrowStyle', 'deadExpression',
        'hairStyle', 'hairColor', 'hairSheen', 'topCrown', 'frontBangs', 'sideLocks', 'backAttachment',
        'hairWispyFeather', 'hairOmbreMix', 'hairTipColor', 'hairHighlightColor', 'hairHighlightStrength',
        'skinTone', 'lipColor', 'blushColor', 'blushIntensity', 'eyeshadowColor', 'eyeshadowIntensity',
        'irisColor', 'eyelinerStyle', 'eyelinerStrength', 'eyelinerColor', 'lashColor', 'eyelashDensity',
      ];
      for (const k of copyKeys) {
        if (srcCol[k] !== undefined) targetCol[k] = srcCol[k];
      }
      targetCol.morphs = JSON.parse(JSON.stringify(srcCol.morphs || {}));
      persistCollectibles();
      if (desktopEngine?.pets?.has(targetCol.id)) {
        desktopEngine.recallCollectible(targetCol.id);
        await desktopEngine.summonCollectible(targetCol);
        desktopEngine.selectedPetId = targetCol.id;
        desktopEngine.emitPetsChange();
      }
      loadCollectibleIntoStudio(targetCol);
      if (typeof window.__syncVcdSelectedPetUI === 'function') window.__syncVcdSelectedPetUI(targetCol.id);
      if (typeof window.__syncPlacardEditorFields === 'function') window.__syncPlacardEditorFields(targetCol);
      if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
      renderVaultGrid();
      this.refreshPlacards();
      showToast(`📂 已将存档「${srcCol.customDisplayName || srcCol.name}」的全套脸型/发型/彩妆读档应用至「${targetCol.customDisplayName || targetCol.name}」！`);
    },
    async overwriteCharacterSlotWithCurrent(targetId) {
      const curCol = this.saveActiveCharacterDesign() || this.getActiveCollectible();
      const dstCol = state.collectibles.find(c => c.id === targetId);
      if (!curCol || !dstCol) return;
      if (curCol.id === dstCol.id) {
        showToast(`💾 已保存当前角色「${dstCol.customDisplayName || dstCol.name}」`);
        return;
      }
      const keepId = dstCol.id;
      const keepSummoned = dstCol.summoned;
      Object.assign(dstCol, JSON.parse(JSON.stringify(curCol)), { id: keepId, summoned: keepSummoned });
      persistCollectibles();
      if (desktopEngine?.pets?.has(keepId)) {
        desktopEngine.recallCollectible(keepId);
        await desktopEngine.summonCollectible(dstCol);
      }
      renderVaultGrid();
      this.refreshPlacards();
      if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
      showToast(`💾 已将当前外观与标牌覆盖保存至槽位「${dstCol.customDisplayName || dstCol.name}」！`);
    },
    async toggleSummonCollectibleById(colId) {
      const col = state.collectibles.find(c => c.id === colId);
      if (!col || !desktopEngine) return;
      if (desktopEngine.pets.has(colId)) {
        desktopEngine.recallCollectible(colId);
        col.summoned = false;
        showToast(`📦 已从桌面撤回角色「${col.customDisplayName || col.name}」`);
      } else {
        await desktopEngine.summonCollectible(col);
        col.summoned = true;
        state.activeStripPetId = colId;
        desktopEngine.selectedPetId = colId;
        showToast(`✨ 已将角色「${col.customDisplayName || col.name}」召唤至桌面！`);
      }
      persistCollectibles();
      renderVaultGrid();
      this.refreshPlacards();
      if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
    },
    deleteCharacterSlotById(colId) {
      const idx = state.collectibles.findIndex(c => c.id === colId);
      if (idx < 0) return;
      const col = state.collectibles[idx];
      const def = DEFAULT_COLLECTIBLES.find(d => d.id === colId);
      if (def) {
        const fresh = JSON.parse(JSON.stringify(def));
        fresh.summoned = col.summoned;
        state.collectibles[idx] = fresh;
        persistCollectibles();
        if (desktopEngine?.pets?.has(colId)) {
          desktopEngine.recallCollectible(colId);
          desktopEngine.summonCollectible(fresh);
        }
        renderVaultGrid();
        this.refreshPlacards();
        if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
        showToast(`↺ 已将预设角色「${fresh.name}」恢复为出厂默认设定`);
      } else {
        if (desktopEngine?.pets?.has(colId)) desktopEngine.recallCollectible(colId);
        state.collectibles.splice(idx, 1);
        if (state.activeStripPetId === colId) {
          state.activeStripPetId = state.collectibles[0]?.id || '';
        }
        persistCollectibles();
        renderVaultGrid();
        this.refreshPlacards();
        if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
        showToast(`🗑️ 已删除自定义角色存档「${col.customDisplayName || col.name}」`);
      }
    },
    exportCharacterJson(colId) {
      const col = (colId ? state.collectibles.find(c => c.id === colId) : null) || this.saveActiveCharacterDesign() || this.getActiveCollectible();
      if (!col) return;
      const payload = {
        type: 'cervix3d_character_preset_v1',
        exportedAt: new Date().toISOString(),
        character: col,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = (col.customDisplayName || col.name || 'character').replace(/[^\w\u4e00-\u9fa5\-]+/g, '_');
      a.href = url;
      a.download = `CERVIX3D_角色存档_${safeName}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      showToast(`📤 已导出角色存档文件：CERVIX3D_角色存档_${safeName}.json`);
    },
    async importCharacterJsonObject(payload) {
      const charData = payload?.character || payload;
      if (!charData || typeof charData !== 'object' || (!charData.name && !charData.morphs)) {
        showToast('⚠️ 角色存档 JSON 格式无效');
        return null;
      }
      const imported = JSON.parse(JSON.stringify(charData));
      imported.id = `SPEC-IMPORT-${String(Date.now()).slice(-4)}`;
      imported.isCustomUserSlot = true;
      imported.summoned = true;
      state.collectibles.unshift(imported);
      state.activeStripPetId = imported.id;
      persistCollectibles();
      if (desktopEngine) {
        try {
          await desktopEngine.summonCollectible(imported);
          desktopEngine.selectedPetId = imported.id;
          desktopEngine.emitPetsChange();
        } catch (_) {}
      }
      renderVaultGrid();
      this.refreshPlacards();
      if (typeof window.__syncVcdSelectedPetUI === 'function') window.__syncVcdSelectedPetUI(imported.id);
      if (typeof window.__refreshObsCharSaveSlots === 'function') window.__refreshObsCharSaveSlots();
      showToast(`📥 已成功导入角色存档「${imported.customDisplayName || imported.name}」并召唤至桌面！`);
      return imported;
    },
    captureVisualEffectSnapshot(customName = '', includeCamera = true) {
      const vc = JSON.parse(JSON.stringify(state.visualCustomConfig || {}));
      const cam = desktopEngine?.camera;
      const ctrl = desktopEngine?.controls;
      return {
        type: 'cervix3d_visual_effect_preset_v1',
        name: customName || '自定义画面效果存档',
        savedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        visualCustomConfig: vc,
        filterPreset: document.getElementById('top-pet-filter-select')?.value || vc.filterPreset || 'natural_studio',
        blurMode: document.getElementById('top-pet-blur-select')?.value || vc.blurMode || 'none',
        blurPower: Number(document.getElementById('obs-pet-blur-power')?.value ?? vc.blurPower ?? 0.65),
        focusCenterY: Number(document.getElementById('obs-pet-blur-focus-y')?.value ?? vc.focusCenterY ?? 0.52),
        backdropPreset: desktopEngine?.currentBackdropPreset || 'transparent',
        desktopPetMode: Boolean(desktopEngine?.desktopPetMode),
        floorStyle: desktopEngine?.settings?.floorStyle || 'walnut_parquet',
        shelfLayout: desktopEngine?.settings?.shelfLayout || 'minimal_desk',
        placardsEnabled: Boolean(state.placardsEnabled),
        cameraState: (includeCamera && cam) ? {
          pos: [cam.position.x, cam.position.y, cam.position.z],
          target: ctrl?.target ? [ctrl.target.x, ctrl.target.y, ctrl.target.z] : [0, 0, 0],
          fov: cam.fov,
        } : null,
      };
    },
    applyVisualEffectSnapshot(snap, restoreCamera = true) {
      if (!snap || typeof snap !== 'object') return;
      const vc = snap.visualCustomConfig || {};
      if (state.visualCustomConfig) {
        Object.assign(state.visualCustomConfig, vc);
      }
      if (snap.filterPreset) {
        const topFilter = document.getElementById('top-pet-filter-select');
        if (topFilter) {
          topFilter.value = snap.filterPreset;
          topFilter.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      // Re-apply exact fine-tuned grade values on top of the filter preset
      if (state.visualCustomConfig && Object.keys(vc).length > 0) {
        Object.assign(state.visualCustomConfig, vc);
        if (desktopEngine) applyCustomVisualConfigToEngine(desktopEngine, state.visualCustomConfig);
        if (studioEngine) applyCustomVisualConfigToEngine(studioEngine, state.visualCustomConfig);
        desktopEngine?.beautyPost?.setGradeParams?.(state.visualCustomConfig);
        studioEngine?.beautyPost?.setGradeParams?.(state.visualCustomConfig);
      }
      if (snap.blurMode !== undefined) {
        const bpEl = document.getElementById('obs-pet-blur-power');
        const fyEl = document.getElementById('obs-pet-blur-focus-y');
        if (bpEl && snap.blurPower !== undefined) bpEl.value = String(snap.blurPower);
        if (fyEl && snap.focusCenterY !== undefined) fyEl.value = String(snap.focusCenterY);
        const topBlur = document.getElementById('top-pet-blur-select');
        if (topBlur) {
          topBlur.value = snap.blurMode;
          topBlur.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
      if (snap.backdropPreset && desktopEngine?.setBackdropPreset) {
        desktopEngine.setBackdropPreset(snap.backdropPreset);
      }
      if (typeof snap.desktopPetMode === 'boolean' && desktopEngine?.setDesktopPetMode) {
        desktopEngine.setDesktopPetMode(snap.desktopPetMode);
        state.desktopPetMode = snap.desktopPetMode;
        const topBtn = document.getElementById('btn-desktop-pet-mode-toggle');
        if (topBtn) {
          topBtn.classList.toggle('active-top', snap.desktopPetMode);
          topBtn.textContent = snap.desktopPetMode ? '🐾 桌宠模式:开' : '🐾 桌宠无地板';
        }
      }
      if (!snap.desktopPetMode && desktopEngine?.updateSettings) {
        const stagePatch = {};
        if (snap.floorStyle) stagePatch.floorStyle = snap.floorStyle;
        if (snap.shelfLayout) stagePatch.shelfLayout = snap.shelfLayout;
        if (Object.keys(stagePatch).length > 0) desktopEngine.updateSettings(stagePatch);
      }
      if (typeof snap.placardsEnabled === 'boolean') {
        state.placardsEnabled = snap.placardsEnabled;
        const pChk = document.getElementById('obs-chk-placards-visible');
        if (pChk) pChk.checked = snap.placardsEnabled;
        this.refreshPlacards();
      }
      if (restoreCamera && snap.cameraState && desktopEngine?.camera) {
        const { pos, target, fov } = snap.cameraState;
        if (Array.isArray(pos) && pos.length === 3) {
          desktopEngine.camera.position.set(pos[0], pos[1], pos[2]);
        }
        if (Array.isArray(target) && target.length === 3 && desktopEngine.controls?.target) {
          desktopEngine.controls.target.set(target[0], target[1], target[2]);
          desktopEngine.controls.update?.();
        }
        if (typeof fov === 'number') {
          desktopEngine.camera.fov = fov;
          desktopEngine.camera.updateProjectionMatrix();
        }
      }
      desktopEngine?.wakeRender?.(2.5, true);
      studioEngine?.wakeRender?.(2.5, true);
      if (typeof window.__syncObsVisualFineSliders === 'function') {
        window.__syncObsVisualFineSliders();
      }
      showToast(`🎬 已读档应用画面效果：「${snap.name || '画面存档'}」`);
    },
  };

  // Summon initial default collectibles onto the computer screen (defer canvas render until all initial pets are in scene!)
  desktopEngine.booting = true;
  const summonedItems = state.collectibles.filter((item) => item.summoned);
  for (let i = 0; i < summonedItems.length; i++) {
    const item = summonedItems[i];
    if (bootStatus) bootStatus.textContent = `正在构建 3D 藏品模型 (${i + 1}/${summonedItems.length})：${item.name}…`;
    await new Promise((r) => setTimeout(r, 0));
    try { await desktopEngine.summonCollectible(item); }
    catch (error) { console.warn(`藏品「${item.name}」暂无法恢复：`, error); }
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

  // Stage 65: Dynamically populate #sel-hair-style, #vcd-hair-style, and #hair-style-quick-chips with all 61 hairstyles (surfacing the 32 new hairstyles prominently at the top!)
  const NEW_32_HAIR_IDS = new Set([
    'daz_hair_o4saken_long', 'daz_hair_blunt_bob_bangs', 'daz_hair_inverted_bob_bangs',
    'daz_hair_french_braid_bun', 'daz_hair_double_braid', 'daz_hair_unkempt_french_braid',
    'daz_hair_rehman_bun', 'daz_hair_island_princess', 'daz_hair_ashley_wave', 'daz_hair_bow_bun_braids',
    ...REAL_HAIR_CATALOG.filter(x => x.id.startsWith('preset_')).map(x => x.id),
  ]);
  const buildFullHairSelectHtml = (selectedId) => {
    const newList = REAL_HAIR_CATALOG.filter(x => NEW_32_HAIR_IDS.has(x.id));
    const groups = new Map();
    groups.set('✨ 新增32款东亚高定发型 (NEW)', newList);
    for (const item of REAL_HAIR_CATALOG) {
      const cat = item.category || '精选发型';
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat).push(item);
    }
    let html = '';
    for (const [catName, list] of groups.entries()) {
      html += `<optgroup label="── ${catName} (${list.length}款) ──">`;
      for (const hp of list) {
        const badge = NEW_32_HAIR_IDS.has(hp.id) && !catName.includes('新增') ? '✨ ' : '';
        html += `<option value="${hp.id}" ${hp.id === selectedId ? 'selected' : ''}>${badge}${hp.label}</option>`;
      }
      html += `</optgroup>`;
    }
    return html;
  };
  const selHairEl = document.getElementById('sel-hair-style');
  if (selHairEl) selHairEl.innerHTML = buildFullHairSelectHtml(state.studioDraft.hairStyle);
  const vcdHairEl = document.getElementById('vcd-hair-style');
  if (vcdHairEl) vcdHairEl.innerHTML = buildFullHairSelectHtml(state.studioDraft.hairStyle);

  const hairQuickChipsEl = document.getElementById('hair-style-quick-chips');
  if (hairQuickChipsEl) {
    const orderedHairs = [
      ...REAL_HAIR_CATALOG.filter(x => NEW_32_HAIR_IDS.has(x.id)),
      ...REAL_HAIR_CATALOG.filter(x => !NEW_32_HAIR_IDS.has(x.id)),
    ];
    hairQuickChipsEl.innerHTML = orderedHairs.map(hp => {
      const isNew = NEW_32_HAIR_IDS.has(hp.id);
      return `<button type="button" class="chip-btn ${hp.id === state.studioDraft.hairStyle ? 'active' : ''}" data-hair-preset="${hp.id}" title="${hp.label} — ${hp.desc || ''}" style="${isNew ? 'border-color:rgba(245,196,81,0.55);' : ''}">${isNew ? '✨ ' : ''}${hp.shortLabel || hp.label}</button>`;
    }).join('');
  }

  // Stage 65: Dynamically populate #sel-face-archetype, #vcd-sel-face-archetype, and #face-archetype-quick-chips with all 38 East Asian head models
  const REGION_NAMES = {
    cn: '🇨🇳 中式古典与现代骨相 (14款)',
    kr: '🇰🇷 韩系财阀与女团骨相 (8款)',
    jp: '🇯🇵 日系透明感与昭和骨相 (8款)',
    mix: '🌏 港台浓颜与亚欧混血骨相 (8款)',
  };
  const buildFullFaceSelectHtml = (selectedArch) => {
    const groups = new Map([['cn', []], ['kr', []], ['jp', []], ['mix', []]]);
    for (const fa of FACE_ARCHETYPE_CATALOG) {
      const r = groups.has(fa.region) ? fa.region : 'cn';
      groups.get(r).push(fa);
    }
    let html = '';
    for (const [rKey, list] of groups.entries()) {
      if (!list.length) continue;
      html += `<optgroup label="── ${REGION_NAMES[rKey] || rKey} ──">`;
      for (const fa of list) {
        html += `<option value="${fa.id}" ${fa.id === selectedArch ? 'selected' : ''}>${fa.shortLabel || fa.label}</option>`;
      }
      html += `</optgroup>`;
    }
    return html;
  };
  const selFaceEl = document.getElementById('sel-face-archetype');
  if (selFaceEl) selFaceEl.innerHTML = buildFullFaceSelectHtml(state.studioDraft.faceArchetype);
  const vcdFaceEl = document.getElementById('vcd-sel-face-archetype');
  if (vcdFaceEl) vcdFaceEl.innerHTML = buildFullFaceSelectHtml(state.studioDraft.faceArchetype);

  const faceQuickChipsEl = document.getElementById('face-archetype-quick-chips');
  if (faceQuickChipsEl) {
    faceQuickChipsEl.innerHTML = FACE_ARCHETYPE_CATALOG.map(fa =>
      `<button type="button" class="chip-btn ${fa.id === state.studioDraft.faceArchetype ? 'active' : ''}" data-face-arch="${fa.id}" title="${fa.label} — ${fa.desc || ''}">${fa.shortLabel || fa.label}</button>`
    ).join('');
  }

  // Stage 65: Dynamically populate #studio-head-blend-sliders and #vcd-head-blend-sliders with ALL 38 head models + ON/OFF switches (开关) + 0%-100% weight sliders
  const buildAll38BlendRowsHtml = (mode = 'studio') => {
    const dataSliderAttr = mode === 'studio' ? 'data-studio-head-blend' : 'data-head-blend';
    const dataSwitchAttr = mode === 'studio' ? 'data-studio-head-blend-on' : 'data-head-blend-on';
    const dataValAttr = mode === 'studio' ? 'data-studio-head-blend-val' : 'data-head-blend-val';
    return HEAD_BLEND_CHANNELS.map((ch, idx) => `
      <div class="vcd-slider-row head-blend-38-row" data-blend-region="${ch.region || 'cn'}" style="display:grid;grid-template-columns:44px minmax(112px,1.25fr) 1fr 38px;align-items:center;gap:6px;padding:3px 4px;border-radius:6px;background:rgba(255,255,255,0.02);">
        <label style="display:inline-flex;align-items:center;gap:3px;cursor:pointer;font-size:10px;color:#cbd5e1;user-select:none;" title="开启/关闭「${ch.label}」头模混合开关">
          <input type="checkbox" ${dataSwitchAttr}="${ch.id}" style="accent-color:#10b981;width:13px;height:13px;cursor:pointer;" />
          <span>开关</span>
        </label>
        <span style="font-size:11px;color:#e2e8f0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${idx + 1}. ${ch.label}">${ch.shortLabel}</span>
        <input type="range" ${dataSliderAttr}="${ch.id}" data-last-weight="0.50" min="0" max="1" step="0.01" value="0" style="width:100%;" />
        <span class="mono-val" ${dataValAttr}="${ch.id}" style="font-size:10px;text-align:right;">0%</span>
      </div>
    `).join('');
  };
  const studioBlendContainer = document.getElementById('studio-head-blend-sliders');
  if (studioBlendContainer) {
    studioBlendContainer.style.maxHeight = '290px';
    studioBlendContainer.style.overflowY = 'auto';
    studioBlendContainer.style.paddingRight = '4px';
    studioBlendContainer.innerHTML = buildAll38BlendRowsHtml('studio');
  }
  const vcdBlendContainer = document.getElementById('vcd-head-blend-sliders');
  if (vcdBlendContainer) {
    vcdBlendContainer.style.maxHeight = '290px';
    vcdBlendContainer.style.overflowY = 'auto';
    vcdBlendContainer.style.paddingRight = '4px';
    vcdBlendContainer.innerHTML = buildAll38BlendRowsHtml('vcd');
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
      const chk = document.querySelector(`[data-studio-head-blend-on="${k}"]`);
      if (chk) chk.checked = v > 0.005;
      const valSpan = document.querySelector(`[data-studio-head-blend-val="${k}"]`);
      if (valSpan) valSpan.textContent = `${Math.round(v * 100)}%`;
      state.studioDraft.morphs[k] = v;
      state.studioDraft.morphs['on_' + k] = v > 0.005;
    });
    document.querySelectorAll('[data-obs-blend-val]').forEach(inp => {
      const k = inp.dataset.obsBlendVal;
      const v = Number(blendState[k] ?? 0);
      inp.value = String(v);
      const chk = document.querySelector(`[data-obs-blend-on="${k}"]`);
      if (chk) chk.checked = v > 0.005;
      const txt = document.querySelector(`[data-obs-blend-txt="${k}"]`);
      if (txt) txt.textContent = `${Math.round(v * 100)}%`;
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

  const syncStudioShapeSlidersFromMorphs = (mObj = {}) => {
    for (const [sId, vId, mKey, unit] of [
      ['morph-eye-size', 'val-morph-eye-size', 'eyeSize', ''],
      ['morph-eye', 'val-morph-eye', 'eyeAlmond', ''],
      ['morph-eyelid-open', 'val-morph-eyelid-open', 'eyelidOpen', ''],
      ['morph-eye-tilt', 'val-morph-eye-tilt', 'eyeTilt', ''],
      ['morph-eye-spacing', 'val-morph-eye-spacing', 'eyeSpacing', ''],
      ['morph-eye-epicanthus', 'val-morph-eye-epicanthus', 'eyeEpicanthus', ''],
      ['morph-eye-crease', 'val-morph-eye-crease', 'eyeCrease', ''],
      ['morph-eye-bag', 'val-morph-eye-bag', 'eyeBag', ''],
      ['morph-iris-scale', 'val-morph-iris-scale', 'irisScale', '%'],
      ['morph-pupil-size', 'val-morph-pupil-size', 'pupilSize', '%'],
      ['morph-jaw', 'val-morph-jaw', 'jawVLine', ''],
      ['morph-chin', 'val-morph-chin', 'chinLength', ''],
      ['morph-cheek', 'val-morph-cheek', 'cheekSoftness', ''],
      ['morph-nose', 'val-morph-nose', 'noseBridge', ''],
      ['morph-nose-width', 'val-morph-nose-width', 'noseWidth', ''],
      ['morph-lip', 'val-morph-lip', 'lipFullness', ''],
      ['morph-mouth-smile', 'val-morph-mouth-smile', 'mouthSmile', ''],
      ['morph-forehead', 'val-morph-forehead', 'foreheadHeight', ''],
      ['morph-head-width', 'val-morph-head-width', 'headWidth', '%scale'],
      ['morph-head-length', 'val-morph-head-length', 'headLength', '%scale'],
    ]) {
      if (mObj[mKey] === undefined) continue;
      const val = Number(mObj[mKey]);
      const sEl = document.getElementById(sId);
      const vEl = document.getElementById(vId);
      if (sEl) sEl.value = String(val);
      if (vEl) {
        if (unit === '%') vEl.textContent = `${Math.round(val * 100)}%`;
        else if (unit === '%scale') vEl.textContent = `${Math.round((1 + val) * 100)}%`;
        else vEl.textContent = `${val >= 0 ? '+' : ''}${val.toFixed(2)}`;
      }
    }
  };

  const applyStudioFaceArchetype = (archId) => {
    state.studioDraft.faceArchetype = archId;
    state.studioDraft.morphs.faceArchetype = archId;
    for (const ch of HEAD_BLEND_CHANNELS) {
      delete state.studioDraft.morphs[ch.id];
    }
    const fa = FACE_ARCHETYPE_CATALOG.find(x => x.id === archId);
    if (fa?.morphRecipe) {
      Object.assign(state.studioDraft.morphs, fa.morphRecipe);
      syncStudioShapeSlidersFromMorphs(state.studioDraft.morphs);
    }
    if (fa?.defaultSkinVariant) {
      state.studioDraft.skinVariant = fa.defaultSkinVariant;
      state.studioDraft.morphs.skinVariant = fa.defaultSkinVariant;
      syncStudioSkinVariantUI(fa.defaultSkinVariant);
    }
    syncStudioFaceArchetypeUI(archId);
    if (studioEngine?.headNode) {
      setHeadFaceArchetype(studioEngine.headNode, archId);
      applyHeadMorphsToGroup(studioEngine.headNode, state.studioDraft.morphs);
      syncStudioHeadBlendSliders(getHeadBlendStateFromGroup(studioEngine.headNode));
      studioEngine.wakeRender(1.5, true);
    }
    if (fa) showToast(`🍑 已切换头模流派与专属骨相参数：${fa.label}`);
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
      if (v > 0.01) inp.dataset.lastWeight = String(v);
      const isOn = v > 0.005;
      const chk = document.querySelector(`[data-studio-head-blend-on="${k}"]`);
      if (chk) chk.checked = isOn;
      const valSpan = document.querySelector(`[data-studio-head-blend-val="${k}"]`);
      if (valSpan) valSpan.textContent = `${Math.round(v * 100)}%`;
      state.studioDraft.morphs[k] = v;
      state.studioDraft.morphs['on_' + k] = isOn;
      if (studioEngine?.headNode) {
        studioEngine.headNode.userData.morphs = {
          ...(studioEngine.headNode.userData.morphs || {}),
          ...state.studioDraft.morphs,
          [k]: v,
          ['on_' + k]: isOn,
        };
        applyHeadMorphsToGroup(studioEngine.headNode, studioEngine.headNode.userData.morphs);
        studioEngine.wakeRender(1.5, true);
      }
      for (const pet of getTargetDesktopPetsList()) {
        const headGroup = pet?.node || pet?.headNode;
        if (headGroup) {
          headGroup.userData.morphs = {
            ...(headGroup.userData.morphs || {}),
            ...(pet.collectible?.morphs || {}),
            [k]: v,
            ['on_' + k]: isOn,
          };
          applyHeadMorphsToGroup(headGroup, headGroup.userData.morphs);
          if (pet.collectible) pet.collectible.morphs = { ...headGroup.userData.morphs };
        }
      }
      if (desktopEngine) desktopEngine.wakeRender(1.5, true);
    });
  });

  document.querySelectorAll('[data-studio-head-blend-on]').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const k = chk.dataset.studioHeadBlendOn;
      const isOn = Boolean(e.target.checked);
      const inp = document.querySelector(`[data-studio-head-blend="${k}"]`);
      if (!inp) return;
      if (isOn && parseFloat(inp.value) <= 0.01) {
        inp.value = inp.dataset.lastWeight || '0.50';
      } else if (!isOn) {
        if (parseFloat(inp.value) > 0.01) inp.dataset.lastWeight = inp.value;
        inp.value = '0';
      }
      inp.dispatchEvent(new Event('input', { bubbles: true }));
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
    const presetMorphMap = {
      fangyaoping: {
        jawVLine: -0.08, chinLength: -0.04, cheekSoftness: 0.16, noseBridge: 0.04, noseWidth: 0.04,
        eyeSize: 0.12, eyeAperture: 0.0, eyeAlmond: 0.08, eyeTilt: -0.04, eyeSpacing: 0.0,
        irisScale: 1.02, pupilSize: 1.00, lipFullness: 0.08, mouthSmile: 0.06, foreheadHeight: 0.04,
        eyelinerStyle: 0, eyelinerStrength: 0.0, eyeshadowIntensity: 0.0,
        topCrownStyle: 'default', frontBangs: 'default', sideLocks: 'default', backAttachment: 'none'
      },
      user_photo: {
        jawVLine: -0.22, chinLength: -0.18, cheekSoftness: 0.28, noseBridge: -0.08, noseWidth: 0.04,
        eyeSize: 0.28, eyeAperture: 0.0, eyeAlmond: -0.12, eyeTilt: -0.16, eyeSpacing: 0.04,
        irisScale: 1.06, pupilSize: 1.02, lipFullness: 0.24, mouthSmile: 0.08, foreheadHeight: 0.08,
        eyelinerStyle: 0, eyelinerStrength: 0.0, eyeshadowIntensity: 0.0,
        topCrownStyle: 'default', frontBangs: 'default', sideLocks: 'default', backAttachment: 'none'
      },
      linxi: {
        jawVLine: 0.34, chinLength: 0.12, cheekSoftness: -0.18, noseBridge: 0.28, noseWidth: -0.14,
        eyeSize: 0.06, eyeAperture: -0.04, eyeAlmond: 0.38, eyeTilt: 0.32, eyeSpacing: -0.02,
        irisScale: 0.98, pupilSize: 0.95, lipFullness: -0.06, mouthSmile: -0.04, foreheadHeight: 0.02,
        eyelinerStyle: 0, eyelinerStrength: 0.0, eyeshadowIntensity: 0.0,
        topCrownStyle: 'default', frontBangs: 'default', sideLocks: 'default', backAttachment: 'none'
      },
      suwan: {
        jawVLine: 0.24, chinLength: 0.10, cheekSoftness: 0.12, noseBridge: 0.18, noseWidth: -0.12,
        eyeSize: 0.18, eyeAperture: 0.04, eyeAlmond: 0.22, eyeTilt: 0.10, eyeSpacing: 0.02,
        irisScale: 1.04, pupilSize: 1.00, lipFullness: 0.14, mouthSmile: 0.04, foreheadHeight: 0.06,
        eyelinerStyle: 0, eyelinerStrength: 0.0, eyeshadowIntensity: 0.0,
        topCrownStyle: 'default', frontBangs: 'default', sideLocks: 'default', backAttachment: 'none'
      },
      qianxue: {
        jawVLine: 0.32, chinLength: -0.08, cheekSoftness: 0.24, noseBridge: 0.14, noseWidth: -0.10,
        eyeSize: 0.30, eyeAperture: 0.08, eyeAlmond: 0.08, eyeTilt: -0.08, eyeSpacing: 0.02,
        irisScale: 1.08, pupilSize: 1.04, lipFullness: 0.22, mouthSmile: 0.0, foreheadHeight: 0.04,
        eyelinerStyle: 0, eyelinerStrength: 0.0, eyeshadowIntensity: 0.0,
        topCrownStyle: 'default', frontBangs: 'default', sideLocks: 'default', backAttachment: 'none'
      },
      shenzhiwei: {
        jawVLine: 0.30, chinLength: 0.18, cheekSoftness: -0.24, noseBridge: 0.32, noseWidth: -0.16,
        eyeSize: 0.12, eyeAperture: 0.02, eyeAlmond: 0.32, eyeTilt: 0.20, eyeSpacing: -0.02,
        irisScale: 0.98, pupilSize: 0.95, lipFullness: 0.14, mouthSmile: 0.12, foreheadHeight: 0.02,
        eyelinerStyle: 0, eyelinerStrength: 0.0, eyeshadowIntensity: 0.0,
        topCrownStyle: 'default', frontBangs: 'default', sideLocks: 'default', backAttachment: 'none'
      },
    };
    if (e.target.value === 'fangyaoping' || e.target.value === 'user_photo') {
      drawPresetReferencePortrait(refPhotoCanvas, e.target.value);
    }
    for (const ch of HEAD_BLEND_CHANNELS) {
      delete state.studioDraft.morphs[ch.id];
    }
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
      state.studioDraft.topCrown = state.studioDraft.morphs.topCrownStyle || 'default';
      state.studioDraft.frontBangs = state.studioDraft.morphs.frontBangs || 'default';
      state.studioDraft.sideLocks = state.studioDraft.morphs.sideLocks || 'default';
      state.studioDraft.backAttachment = state.studioDraft.morphs.backAttachment || 'none';
      syncStudioShapeSlidersFromMorphs(state.studioDraft.morphs);
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

  const getTargetDesktopPetsList = () => {
    if (!desktopEngine || desktopEngine.pets.size === 0) return [];
    const targetMode = state.vcdTargetPetId || 'selected';
    if (targetMode === 'all') return Array.from(desktopEngine.pets.values());
    if (targetMode !== 'selected' && desktopEngine.pets.has(targetMode)) {
      return [desktopEngine.pets.get(targetMode)];
    }
    if (desktopEngine.hoveredPetId && desktopEngine.pets.has(desktopEngine.hoveredPetId)) {
      return [desktopEngine.pets.get(desktopEngine.hoveredPetId)];
    }
    if (state.activeStripPetId && desktopEngine.pets.has(state.activeStripPetId)) {
      return [desktopEngine.pets.get(state.activeStripPetId)];
    }
    if (state.studioDraft?.id && desktopEngine.pets.has(state.studioDraft.id)) {
      return [desktopEngine.pets.get(state.studioDraft.id)];
    }
    return [Array.from(desktopEngine.pets.values())[0]];
  };

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
      // Also update the active desktop pet(s) in real time!
      for (const pet of getTargetDesktopPetsList()) {
        const headGroup = pet?.node || pet?.headNode;
        if (headGroup) {
          headGroup.userData.morphs = {
            ...(headGroup.userData.morphs || {}),
            ...(pet.collectible?.morphs || {}),
            [key]: v,
          };
          applyHeadMorphsToGroup(headGroup, headGroup.userData.morphs);
          if (pet.collectible) {
            pet.collectible.morphs = { ...headGroup.userData.morphs };
          }
        }
      }
      if (desktopEngine) desktopEngine.wakeRender(1.5, true);
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

  // Stage 43: Full-Range 23-Axis Facial, Eye Size/Shape & Cranial Sliders
  const SHAPE_MORPH_SLIDERS = [
    ['morph-eye-size', 'val-morph-eye-size', 'eyeSize', ''],
    ['morph-eye', 'val-morph-eye', 'eyeAlmond', ''],
    ['morph-eyelid-open', 'val-morph-eyelid-open', 'eyelidOpen', ''],
    ['morph-eye-tilt', 'val-morph-eye-tilt', 'eyeTilt', ''],
    ['morph-eye-spacing', 'val-morph-eye-spacing', 'eyeSpacing', ''],
    ['morph-eye-epicanthus', 'val-morph-eye-epicanthus', 'eyeEpicanthus', ''],
    ['morph-eye-crease', 'val-morph-eye-crease', 'eyeCrease', ''],
    ['morph-eye-bag', 'val-morph-eye-bag', 'eyeBag', ''],
    ['morph-iris-scale', 'val-morph-iris-scale', 'irisScale', '%'],
    ['morph-pupil-size', 'val-morph-pupil-size', 'pupilSize', '%'],
    ['morph-jaw', 'val-morph-jaw', 'jawVLine', ''],
    ['morph-chin', 'val-morph-chin', 'chinLength', ''],
    ['morph-cheek', 'val-morph-cheek', 'cheekSoftness', ''],
    ['morph-nose', 'val-morph-nose', 'noseBridge', ''],
    ['morph-nose-width', 'val-morph-nose-width', 'noseWidth', ''],
    ['morph-brow-height', 'val-morph-brow-height', 'browHeight', ''],
    ['morph-brow-tilt', 'val-morph-brow-tilt', 'browTilt', ''],
    ['morph-brow-thick', 'val-morph-brow-thick', 'browThickness', '%'],
    ['morph-lip', 'val-morph-lip', 'lipFullness', ''],
    ['morph-mouth-smile', 'val-morph-mouth-smile', 'mouthSmile', ''],
    ['morph-forehead', 'val-morph-forehead', 'foreheadHeight', ''],
    ['morph-ear', 'val-morph-ear', 'earSize', ''],
    ['morph-head-width', 'val-morph-head-width', 'headWidth', ''],
    ['morph-head-length', 'val-morph-head-length', 'headLength', ''],
    ['morph-gaze-yaw', 'val-morph-gaze-yaw', 'gazeYaw', ''],
    ['morph-gaze-pitch', 'val-morph-gaze-pitch', 'gazePitch', ''],
  ];
  for (const [sId, vId, mKey, unit] of SHAPE_MORPH_SLIDERS) {
    bindMorphSlider(sId, vId, mKey, unit || '');
  }

  document.getElementById('studio-eye-preset-select')?.addEventListener('change', (e) => {
    const preset = EYE_SHAPE_PRESET_CATALOG.find(p => p.id === e.target.value);
    if (!preset) return;
    const patch = {
      eyePreset: preset.id,
      eyeSize: preset.eyeSize,
      eyeTilt: preset.eyeTilt,
      eyeAperture: preset.eyeHeight,
      eyelidOpen: preset.eyeHeight,
      eyeSpacing: preset.eyeSpacing,
      eyeEpicanthus: preset.eyeEpicanthus,
      eyeCrease: preset.eyeCrease,
      eyeBag: preset.eyeBag,
      aegyoSalStrength: Math.max(0.10, preset.eyeBag * 0.55),
      irisScale: preset.irisScale,
    };
    Object.assign(state.studioDraft.morphs, patch);
    syncStudioShapeSlidersFromMorphs(state.studioDraft.morphs);
    const vcdSel = document.getElementById('vcd-eye-preset-select');
    if (vcdSel) vcdSel.value = preset.id;
    studioEngine.updateMorphsFast(state.studioDraft.morphs);
    studioEngine.updateMaterialsFast(patch);
    for (const pet of getTargetDesktopPetsList()) {
      const headGroup = pet?.node || pet?.headNode;
      if (headGroup) {
        applyHeadMorphsToGroup(headGroup, { ...(pet.collectible?.morphs || {}), ...patch });
        updateCollectibleMaterialsLive(headGroup, patch);
      }
      if (pet.collectible) {
        Object.assign(pet.collectible.morphs, patch);
      }
    }
    if (desktopEngine) desktopEngine.wakeRender(1.5, true);
    showToast(`👁️ 已切换东亚3D眼型预设：${preset.label}`);
  });

  document.getElementById('btn-reset-shape-morphs')?.addEventListener('click', () => {
    for (const [sId, vId, mKey, unit] of SHAPE_MORPH_SLIDERS) {
      const defVal = (mKey === 'irisScale' || mKey === 'pupilSize' || mKey === 'browThickness') ? 1.0 : 0.0;
      state.studioDraft.morphs[mKey] = defVal;
      const sEl = document.getElementById(sId);
      const vEl = document.getElementById(vId);
      if (sEl) sEl.value = String(defVal);
      if (vEl) vEl.textContent = unit === '%' ? '100%' : '+0.00';
    }
    studioEngine.updateMorphsFast(state.studioDraft.morphs);
    for (const pet of getTargetDesktopPetsList()) {
      const headGroup = pet?.node || pet?.headNode;
      if (headGroup) applyHeadMorphsToGroup(headGroup, state.studioDraft.morphs);
    }
    if (desktopEngine) desktopEngine.wakeRender(1.5, true);
    showToast('↺ 已将全部 23 项眼睛大小/眼型与面部骨相滑杆归零');
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
    let reference;
    let persistent = true;
    try { reference = await keepPrivateModel(file); }
    catch (_) { reference = URL.createObjectURL(file); persistent = false; }
    state.studioDraft.customHairUrl = reference;
    state.studioDraft.customHairType = ext;
    state.studioDraft.customHairName = file.name;
    // Don't silently mix a previous preset's ponytail/bangs into an imported groom.
    for (const [key, value] of Object.entries({ topCrown: 'default', frontBangs: 'default', sideLocks: 'default', backAttachment: 'none' })) {
      state.studioDraft[key] = value;
      state.studioDraft.morphs[key] = value;
      state.studioDraft.morphs[`${key}Style`] = value;
    }
    for (const [id, value] of [['sel-hair-top-crown','default'],['sel-hair-bangs','default'],['sel-hair-sidelocks','default'],['sel-hair-back','none']]) {
      const element = document.getElementById(id); if (element) element.value = value;
    }
    await refreshStudio3DModel();
    const error = studioEngine.headNode?.userData?.hairLoadError;
    showToast(error ? `发型导入失败：${error}` :
      `已导入「${file.name}」，保留原材质。${persistent ? '已存入本浏览器私人资产库；保存藏品后可恢复。' : '浏览器存储不可用，仅本次会话有效，请保留原件。'}`);

  });

  // ==========================================================================
  // STAGE 43: 0ms GPU LIVE COLOR, MAKEUP, SKIN DERMIS, EYE & PHOTO PROJECTION
  // ==========================================================================
  const applyLiveMaterialPatch = (patch = {}) => {
    Object.assign(state.studioDraft, patch);
    Object.assign(state.studioDraft.morphs, patch);
    if (studioEngine) {
      studioEngine.updateMaterialsFast(patch);
    }
    // Sync to the target desktop pet(s) in the 3D Box Space
    for (const pet of getTargetDesktopPetsList()) {
      const headGroup = pet?.node || pet?.headNode;
      if (headGroup) {
        updateCollectibleMaterialsLive(headGroup, patch);
        if (pet.collectible) {
          Object.assign(pet.collectible, patch);
          pet.collectible.morphs = { ...(pet.collectible.morphs || {}), ...patch };
        }
      }
    }
    if (desktopEngine) desktopEngine.wakeRender(1.5, true);
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
    ['col-eyeliner', 'eyelinerColor'],
    ['col-lash', 'lashColor'],
    ['col-char-sss', 'charSssColor'],
  ]) {
    document.getElementById(id)?.addEventListener('input', (e) => {
      const hex = e.target.value;
      const patch = { [key]: hex };
      // If user picks a custom lip/blush/eyeshadow/iris/eyeliner color, ensure its strength is visible!
      if (key === 'irisColor') {
        patch.irisMix = Math.max(0.88, Number(state.studioDraft.irisMix ?? 0.88));
        const vcdIris = document.getElementById('vcd-iris-color');
        if (vcdIris) vcdIris.value = hex;
      } else if (key === 'eyelinerColor') {
        if (Number(state.studioDraft.eyelinerStyle ?? 0) === 0) {
          patch.eyelinerStyle = 2;
          const selEl = document.getElementById('sel-eyeliner-style');
          if (selEl) selEl.value = '2';
        }
        if (Number(state.studioDraft.eyelinerStrength ?? 0) < 0.25) {
          patch.eyelinerStrength = 0.45;
          const sl = document.getElementById('slider-eyeliner-strength');
          const vl = document.getElementById('val-eyeliner-strength');
          if (sl) sl.value = '0.45';
          if (vl) vl.textContent = '45%';
        }
      } else if (key === 'lipColor' && Number(state.studioDraft.lipStrength ?? 0.65) < 0.25) {
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
      } else if (key === 'eyeshadowColor' && Number(state.studioDraft.eyeshadowIntensity ?? 0.0) < 0.12) {
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

  document.getElementById('sel-eyeliner-style')?.addEventListener('change', (e) => {
    const styleId = parseInt(e.target.value, 10) || 0;
    let strength = Number(state.studioDraft.eyelinerStrength ?? 0.0);
    if (styleId === 0) {
      strength = 0.0;
    } else if (strength < 0.15) {
      strength = 0.48;
    }
    const sl = document.getElementById('slider-eyeliner-strength');
    const vl = document.getElementById('val-eyeliner-strength');
    if (sl) sl.value = String(strength);
    if (vl) vl.textContent = `${Math.round(strength * 100)}%`;
    applyLiveMaterialPatch({ eyelinerStyle: styleId, eyelinerStrength: strength });
    const meta = EYELINER_STYLE_CATALOG.find(x => x.id === styleId);
    if (meta) showToast(`👁️ 已切换眼线样式：${meta.label}`);
  });

  document.querySelectorAll('[data-studio-iris]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const hex = btn.dataset.studioIris;
      if (!hex) return;
      const colIris = document.getElementById('col-iris');
      if (colIris) colIris.value = hex;
      const vcdIris = document.getElementById('vcd-iris-color');
      if (vcdIris) vcdIris.value = hex;
      applyLiveMaterialPatch({ irisColor: hex, irisMix: 0.90 });
      showToast(`👁️ 已切换虹膜瞳色：${btn.textContent.trim()} (${hex})`);
    });
  });

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
      if (key === 'eyelinerStrength' && v > 0.05 && Number(state.studioDraft.eyelinerStyle ?? 0) === 0) {
        patch.eyelinerStyle = 2;
        const selEl = document.getElementById('sel-eyeliner-style');
        if (selEl) selEl.value = '2';
      }
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
  bindLiveMaterialSlider('slider-eyeliner-strength', 'val-eyeliner-strength', 'eyelinerStrength', 'pct');
  bindLiveMaterialSlider('slider-lip-strength', 'val-lip-strength', 'lipStrength', 'pct');
  bindLiveMaterialSlider('slider-lip-gloss', 'val-lip-gloss', 'lipGloss', 'pct');
  bindLiveMaterialSlider('slider-iris-mix', 'val-iris-mix', 'irisMix', 'pct');
  bindLiveMaterialSlider('slider-iris-brightness', 'val-iris-brightness', 'irisBrightness', 'pct');
  bindLiveMaterialSlider('slider-limbal-ring', 'val-limbal-ring', 'limbalRing', 'pct');
  bindLiveMaterialSlider('slider-sclera-brightness', 'val-sclera-brightness', 'scleraBrightness', 'pct');
  bindLiveMaterialSlider('slider-brow-opacity', 'val-brow-opacity', 'browOpacity', 'pct');
  bindLiveMaterialSlider('slider-hair-highlight', 'val-hair-highlight', 'hairHighlightStrength', 'pct');

  // Stage 44: DLSS-5 Per-Character Dermis, Custom PBR Maps, Eye Optics & 3D Photo Projection Sliders
  bindLiveMaterialSlider('slider-normal-map-strength', 'val-normal-map-strength', 'normalMapStrength', 'pct');
  bindLiveMaterialSlider('slider-pore-scale', 'val-pore-scale', 'poreScale', 'pct');
  bindLiveMaterialSlider('slider-pore-relief', 'val-pore-relief', 'poreRelief', 'pct');
  bindLiveMaterialSlider('slider-skin-roughness', 'val-skin-roughness', 'skinRoughness', 'pct');
  bindLiveMaterialSlider('slider-tzone-oiliness', 'val-tzone-oiliness', 'tZoneOiliness', 'pct');
  bindLiveMaterialSlider('slider-specular-lobe', 'val-specular-lobe', 'specularLobe', 'pct');
  bindLiveMaterialSlider('slider-char-sss-depth', 'val-char-sss-depth', 'charSssDepth', 'pct');
  bindLiveMaterialSlider('slider-vascularity', 'val-vascularity', 'vascularity', 'pct');
  bindLiveMaterialSlider('slider-skin-mottle', 'val-skin-mottle', 'skinMottle', 'pct');
  bindLiveMaterialSlider('slider-vellus-fuzz', 'val-vellus-fuzz', 'vellusFuzz', 'pct');
  bindLiveMaterialSlider('slider-lip-crease-depth', 'val-lip-crease-depth', 'lipCreaseDepth', 'pct');
  bindLiveMaterialSlider('slider-ear-tip-flush', 'val-ear-tip-flush', 'earTipFlush', 'pct');
  bindLiveMaterialSlider('slider-aegyosal', 'val-aegyosal', 'aegyoSal', 'pct');
  bindLiveMaterialSlider('slider-dark-circles', 'val-dark-circles', 'darkCircles', 'pct');
  bindLiveMaterialSlider('slider-freckles', 'val-freckles', 'freckles', 'pct');
  bindLiveMaterialSlider('slider-iris-scale', 'val-iris-scale', 'irisScale', 'pct');
  bindLiveMaterialSlider('slider-pupil-size', 'val-pupil-size', 'pupilSize', 'pct');
  bindLiveMaterialSlider('slider-eye-catchlight', 'val-eye-catchlight', 'eyeCatchlight', 'pct');
  bindLiveMaterialSlider('slider-cornea-wetness', 'val-cornea-wetness', 'corneaWetness', 'pct');
  bindLiveMaterialSlider('slider-sclera-veins', 'val-sclera-veins', 'scleraVeinIntensity', 'pct');
  bindLiveMaterialSlider('slider-eyelash-density', 'val-eyelash-density', 'eyelashDensity', 'pct');
  bindLiveMaterialSlider('slider-photo-proj', 'val-photo-proj', 'photoBlend', 'pct');
  bindLiveMaterialSlider('slider-photo-proj-scale', 'val-photo-proj-scale', 'photoProjScale', 'pct');
  bindLiveMaterialSlider('slider-photo-proj-x', 'val-photo-proj-x', 'photoProjOffsetX', 'signed');
  bindLiveMaterialSlider('slider-photo-proj-y', 'val-photo-proj-y', 'photoProjOffsetY', 'signed');

  // Stage 53: Forensic & Emotional Fluid System (Neck Cut Blood, Tear Tracks / Blood Tears, Nosebleed, Mouth Blood & Splatter)
  bindLiveMaterialSlider('slider-neck-blood', 'val-neck-blood', 'neckBloodStrength', 'pct');
  bindLiveMaterialSlider('slider-tear-track', 'val-tear-track', 'tearTrackStrength', 'pct');
  bindLiveMaterialSlider('slider-nosebleed', 'val-nosebleed', 'nosebleedStrength', 'pct');
  bindLiveMaterialSlider('slider-mouth-blood', 'val-mouth-blood', 'mouthBloodStrength', 'pct');
  bindLiveMaterialSlider('slider-face-splatter', 'val-face-splatter', 'faceSplatterStrength', 'pct');

  document.getElementById('sel-tear-type')?.addEventListener('change', (e) => {
    const v = parseInt(e.target.value, 10) || 0;
    const patch = { tearType: v };
    if (Number(state.studioDraft.tearTrackStrength ?? 0) < 0.15) {
      patch.tearTrackStrength = 0.85;
      const sEl = document.getElementById('slider-tear-track');
      const vEl = document.getElementById('val-tear-track');
      if (sEl) sEl.value = '0.85';
      if (vEl) vEl.textContent = '85%';
    }
    applyLiveMaterialPatch(patch);
    showToast(`💧 已切换泪水与哭痕类型：${e.target.options[e.target.selectedIndex].text}`);
  });

  document.getElementById('sel-nosebleed-mode')?.addEventListener('change', (e) => {
    const v = parseInt(e.target.value, 10) || 0;
    const patch = { nosebleedMode: v };
    if (Number(state.studioDraft.nosebleedStrength ?? 0) < 0.15) {
      patch.nosebleedStrength = 0.82;
      const sEl = document.getElementById('slider-nosebleed');
      const vEl = document.getElementById('val-nosebleed');
      if (sEl) sEl.value = '0.82';
      if (vEl) vEl.textContent = '82%';
    }
    applyLiveMaterialPatch(patch);
    showToast(`🩸 已切换鼻血流向模式：${e.target.options[e.target.selectedIndex].text}`);
  });

  const FORENSIC_FLUID_PRESETS = {
    fresh_neck_cut: {
      label: '🔪 鲜血断口 (默认)',
      neckBloodStrength: 0.85,
      tearTrackStrength: 0.0,
      tearType: 0,
      nosebleedStrength: 0.0,
      nosebleedMode: 0,
      mouthBloodStrength: 0.0,
      faceSplatterStrength: 0.0,
    },
    crying_tears: {
      label: '💧 梨花带雨 (清澈湿泪 + 哭红眼眶鼻头)',
      neckBloodStrength: 0.85,
      tearTrackStrength: 0.88,
      tearType: 0,
      nosebleedStrength: 0.0,
      nosebleedMode: 0,
      mouthBloodStrength: 0.0,
      faceSplatterStrength: 0.0,
    },
    nosebleed_tears: {
      label: '🥀 凄美鼻血 + 双颊泪痕',
      neckBloodStrength: 0.90,
      tearTrackStrength: 0.86,
      tearType: 0,
      nosebleedStrength: 0.84,
      nosebleedMode: 0,
      mouthBloodStrength: 0.28,
      faceSplatterStrength: 0.18,
    },
    blood_tears_mouth: {
      label: '🩸 猩红血泪 + 嘴角溢血',
      neckBloodStrength: 0.95,
      tearTrackStrength: 0.92,
      tearType: 2,
      nosebleedStrength: 0.68,
      nosebleedMode: 1,
      mouthBloodStrength: 0.88,
      faceSplatterStrength: 0.35,
    },
    heavy_trauma: {
      label: '⚔️ 重度断首战损 (鼻血+血泪+嘴角血+动脉溅血)',
      neckBloodStrength: 1.15,
      tearTrackStrength: 0.95,
      tearType: 2,
      nosebleedStrength: 0.96,
      nosebleedMode: 0,
      mouthBloodStrength: 0.92,
      faceSplatterStrength: 0.78,
    },
    clean_specimen: {
      label: '✨ 洁净无血标本 (清空血迹与泪痕)',
      neckBloodStrength: 0.0,
      tearTrackStrength: 0.0,
      tearType: 0,
      nosebleedStrength: 0.0,
      nosebleedMode: 0,
      mouthBloodStrength: 0.0,
      faceSplatterStrength: 0.0,
    },
  };

  const syncForensicFluidUI = (p) => {
    for (const [sId, vId, k] of [
      ['slider-neck-blood', 'val-neck-blood', 'neckBloodStrength'],
      ['slider-tear-track', 'val-tear-track', 'tearTrackStrength'],
      ['slider-nosebleed', 'val-nosebleed', 'nosebleedStrength'],
      ['slider-mouth-blood', 'val-mouth-blood', 'mouthBloodStrength'],
      ['slider-face-splatter', 'val-face-splatter', 'faceSplatterStrength'],
    ]) {
      if (p[k] === undefined) continue;
      const sEl = document.getElementById(sId);
      const vEl = document.getElementById(vId);
      if (sEl) sEl.value = String(p[k]);
      if (vEl) vEl.textContent = `${Math.round(Number(p[k]) * 100)}%`;
    }
    if (p.tearType !== undefined) {
      const sel = document.getElementById('sel-tear-type');
      if (sel) sel.value = String(p.tearType);
    }
    if (p.nosebleedMode !== undefined) {
      const sel = document.getElementById('sel-nosebleed-mode');
      if (sel) sel.value = String(p.nosebleedMode);
    }
  };

  document.querySelectorAll('[data-fluid-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.fluidPreset;
      const preset = FORENSIC_FLUID_PRESETS[key];
      if (!preset) return;
      document.querySelectorAll('[data-fluid-preset]').forEach(b => {
        b.classList.toggle('active', b.dataset.fluidPreset === key);
      });
      syncForensicFluidUI(preset);
      applyLiveMaterialPatch(preset);
      showToast(`🩸 已套用体液与创伤状态：${preset.label}`);
    });
  });

  // Stage 44: One-Click Per-Character Material & Photorealism Presets
  const syncCharMaterialPresetUI = (recipe = {}) => {
    for (const [sId, vId, key] of [
      ['slider-normal-map-strength', 'val-normal-map-strength', 'normalMapStrength'],
      ['slider-pore-scale', 'val-pore-scale', 'poreScale'],
      ['slider-pore-relief', 'val-pore-relief', 'poreRelief'],
      ['slider-skin-roughness', 'val-skin-roughness', 'skinRoughness'],
      ['slider-tzone-oiliness', 'val-tzone-oiliness', 'tZoneOiliness'],
      ['slider-specular-lobe', 'val-specular-lobe', 'specularLobe'],
      ['slider-char-sss-depth', 'val-char-sss-depth', 'charSssDepth'],
      ['slider-vascularity', 'val-vascularity', 'vascularity'],
      ['slider-skin-mottle', 'val-skin-mottle', 'skinMottle'],
      ['slider-vellus-fuzz', 'val-vellus-fuzz', 'vellusFuzz'],
      ['slider-lip-crease-depth', 'val-lip-crease-depth', 'lipCreaseDepth'],
      ['slider-ear-tip-flush', 'val-ear-tip-flush', 'earTipFlush'],
      ['slider-lip-gloss', 'val-lip-gloss', 'lipGloss'],
      ['slider-eyeliner-strength', 'val-eyeliner-strength', 'eyelinerStrength'],
      ['slider-eyeshadow', 'val-eyeshadow', 'eyeshadowIntensity'],
      ['slider-eyelash-density', 'val-eyelash-density', 'eyelashDensity'],
      ['slider-cornea-wetness', 'val-cornea-wetness', 'corneaWetness'],
      ['slider-sclera-veins', 'val-sclera-veins', 'scleraVeinIntensity'],
    ]) {
      if (recipe[key] === undefined) continue;
      const val = Number(recipe[key]);
      const sEl = document.getElementById(sId);
      const vEl = document.getElementById(vId);
      if (sEl) sEl.value = String(val);
      if (vEl) vEl.textContent = `${Math.round(val * 100)}%`;
    }
    if (recipe.eyelinerStyle !== undefined) {
      const selEl = document.getElementById('sel-eyeliner-style');
      if (selEl) selEl.value = String(recipe.eyelinerStyle);
    }
    if (recipe.eyelinerColor) {
      const colEl = document.getElementById('col-eyeliner');
      if (colEl) colEl.value = recipe.eyelinerColor;
    }
    if (recipe.charSssColor) {
      const colEl = document.getElementById('col-char-sss');
      if (colEl) colEl.value = recipe.charSssColor;
    }
  };

  document.querySelectorAll('[data-char-mat-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const presetId = btn.dataset.charMatPreset;
      const pMeta = CHAR_MATERIAL_PRESET_CATALOG.find(x => x.id === presetId);
      if (!pMeta) return;
      document.querySelectorAll('[data-char-mat-preset]').forEach(b => {
        b.classList.toggle('active', b.dataset.charMatPreset === presetId);
      });
      syncCharMaterialPresetUI(pMeta.recipe);
      applyLiveMaterialPatch(pMeta.recipe);
      showToast(`💎 已应用角色专属超写实材质方案：${pMeta.label}`);
    });
  });

  // Stage 44: Per-Character Custom PBR Texture Map Uploaders (Albedo / Normal / Roughness / Iris)
  const updateCustomMapStatusText = () => {
    const statusEl = document.getElementById('char-custom-map-status');
    if (!statusEl) return;
    const activeNames = [];
    if (state.studioDraft.customSkinMapUrl) activeNames.push('表皮漫反射图');
    if (state.studioDraft.customNormalMapUrl) activeNames.push('微距法线图');
    if (state.studioDraft.customRoughnessMapUrl) activeNames.push('光泽粗糙度图');
    if (state.studioDraft.customIrisMapUrl) activeNames.push('虹膜纹理图');
    statusEl.textContent = activeNames.length > 0
      ? `✅ 当前角色已挂载自定义PBR贴图：${activeNames.join(' + ')}`
      : '当前使用内置 2K 摄影级 PBR 贴图通道';
  };

  for (const [inpId, clearId, propKey, labelName] of [
    ['input-char-skin-map', 'btn-clear-char-skin-map', 'customSkinMapUrl', '皮肤漫反射贴图 (Albedo)'],
    ['input-char-normal-map', 'btn-clear-char-normal-map', 'customNormalMapUrl', '微距毛孔法线贴图 (Normal)'],
    ['input-char-roughness-map', 'btn-clear-char-roughness-map', 'customRoughnessMapUrl', '粗糙光泽度贴图 (Roughness)'],
    ['input-char-iris-map', 'btn-clear-char-iris-map', 'customIrisMapUrl', '眼球虹膜纹理贴图 (Iris)'],
  ]) {
    document.getElementById(inpId)?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        applyLiveMaterialPatch({ [propKey]: dataUrl });
        updateCustomMapStatusText();
        showToast(`🗺️ 已为当前角色挂载自定义${labelName}：${file.name}`);
      };
      reader.readAsDataURL(file);
    });
    document.getElementById(clearId)?.addEventListener('click', () => {
      applyLiveMaterialPatch({ [propKey]: '' });
      const inpEl = document.getElementById(inpId);
      if (inpEl) inpEl.value = '';
      updateCustomMapStatusText();
      showToast(`↺ 已清除自定义${labelName}，恢复角色内置 2K 摄影贴图`);
    });
  }

  document.getElementById('sel-beauty-mark')?.addEventListener('change', (e) => {
    applyLiveMaterialPatch({ beautyMark: parseInt(e.target.value, 10) || 0 });
  });

  document.getElementById('btn-reset-color-tuning')?.addEventListener('click', () => {
    const colorDefaults = {
      skinTone: '#fae3d2',
      lipColor: '#c45866',
      blushColor: '#e87a88',
      eyeshadowColor: '#c88278',
      eyelinerColor: '#2d201e',
      lashColor: '#44322e',
      charSssColor: '#e85a4f',
      irisColor: '#3b2316',
      browColor: '#261e1c',
      hairColor: '#121216',
      hairTipColor: '#4a3528',
      hairHighlightColor: '#8c6244',
      skinWarmth: 0.0,
      skinBrightness: 1.0,
      skinRosiness: 0.25,
      blushIntensity: 0.22,
      eyelinerStyle: 0,
      eyelinerStrength: 0.0,
      eyeshadowIntensity: 0.0,
      lipStrength: 0.38,
      lipGloss: 0.48,
      irisMix: 0.88,
      browOpacity: 0.94,
      hairHighlightStrength: 0.0,
    };
    for (const [id, val] of [
      ['col-skin', colorDefaults.skinTone],
      ['col-lip', colorDefaults.lipColor],
      ['col-blush', colorDefaults.blushColor],
      ['col-eyeshadow', colorDefaults.eyeshadowColor],
      ['col-eyeliner', colorDefaults.eyelinerColor],
      ['col-lash', colorDefaults.lashColor],
      ['col-char-sss', colorDefaults.charSssColor],
      ['col-iris', colorDefaults.irisColor],
      ['col-brow', colorDefaults.browColor],
      ['col-hair', colorDefaults.hairColor],
      ['col-hair-tip', colorDefaults.hairTipColor],
      ['col-hair-highlight', colorDefaults.hairHighlightColor],
    ]) {
      const el = document.getElementById(id);
      if (el) el.value = val;
    }
    const selLiner = document.getElementById('sel-eyeliner-style');
    if (selLiner) selLiner.value = '0';
    for (const [sId, vId, val, txt] of [
      ['slider-skin-warmth', 'val-skin-warmth', 0.0, '+0.00'],
      ['slider-skin-brightness', 'val-skin-brightness', 1.0, '100%'],
      ['slider-skin-rosiness', 'val-skin-rosiness', 0.25, '25%'],
      ['slider-blush', 'val-blush', 0.22, '22%'],
      ['slider-eyeliner-strength', 'val-eyeliner-strength', 0.0, '0%'],
      ['slider-eyeshadow', 'val-eyeshadow', 0.0, '0%'],
      ['slider-lip-strength', 'val-lip-strength', 0.38, '38%'],
      ['slider-lip-gloss', 'val-lip-gloss', 0.48, '48%'],
      ['slider-iris-mix', 'val-iris-mix', 0.88, '88%'],
      ['slider-brow-opacity', 'val-brow-opacity', 0.94, '94%'],
      ['slider-hair-highlight', 'val-hair-highlight', 0.0, '0%'],
    ]) {
      const sEl = document.getElementById(sId);
      const vEl = document.getElementById(vId);
      if (sEl) sEl.value = String(val);
      if (vEl) vEl.textContent = txt;
    }
    applyLiveMaterialPatch(colorDefaults);
    showToast('↺ 已恢复自然纯净素颜裸眼睑与原生肤色配色');
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

  document.querySelectorAll('[data-hair-finish]').forEach(button => {
    button.addEventListener('click', () => {
      if (state.studioDraft.customHairUrl) return showToast('外部发型保留艺术家原材质；请在 Blender 修改粗糙度后重新导入。');
      const slider = document.getElementById('slider-hair-sheen');
      slider.value = button.dataset.hairFinish;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
      studioEngine.wakeRender(1.5, false);
    });
  });

  document.getElementById('slider-hair-sheen').addEventListener('input', (e) => {
    const v = parseFloat(e.target.value);
    state.studioDraft.hairSheen = v;
    document.getElementById('val-hair-sheen').textContent = `${Math.round(v * 100)}%`;
    updateHairSheen(studioEngine.headNode, v);
    studioEngine.wakeRender(1.5, false);
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
      customHairUrl: state.studioDraft.customHairUrl,
      customHairType: state.studioDraft.customHairType,
      customHairName: state.studioDraft.customHairName,
      customSkinMapUrl: state.studioDraft.customSkinMapUrl || '',
      customNormalMapUrl: state.studioDraft.customNormalMapUrl || '',
      customRoughnessMapUrl: state.studioDraft.customRoughnessMapUrl || '',
      customIrisMapUrl: state.studioDraft.customIrisMapUrl || '',
      skinTone: state.studioDraft.skinTone,
      blushIntensity: state.studioDraft.blushIntensity,
      lipColor: state.studioDraft.lipColor,
      irisColor: state.studioDraft.irisColor,
      irisScale: state.studioDraft.irisScale ?? state.studioDraft.morphs?.irisScale ?? 1.0,
      pupilSize: state.studioDraft.pupilSize ?? state.studioDraft.morphs?.pupilSize ?? 1.0,
      irisBrightness: state.studioDraft.irisBrightness ?? state.studioDraft.morphs?.irisBrightness ?? 1.15,
      limbalRing: state.studioDraft.limbalRing ?? state.studioDraft.morphs?.limbalRing ?? 0.78,
      eyelinerStyle: state.studioDraft.eyelinerStyle ?? state.studioDraft.morphs?.eyelinerStyle ?? 0,
      eyelinerStrength: state.studioDraft.eyelinerStrength ?? state.studioDraft.morphs?.eyelinerStrength ?? 0.0,
      eyelinerColor: state.studioDraft.eyelinerColor ?? state.studioDraft.morphs?.eyelinerColor ?? '#2d201e',
      lashColor: state.studioDraft.lashColor ?? state.studioDraft.morphs?.lashColor ?? '#44322e',
      eyeshadowIntensity: state.studioDraft.eyeshadowIntensity ?? state.studioDraft.morphs?.eyeshadowIntensity ?? 0.0,
      eyelashDensity: state.studioDraft.eyelashDensity ?? state.studioDraft.morphs?.eyelashDensity ?? 0.68,
      normalMapStrength: state.studioDraft.normalMapStrength ?? state.studioDraft.morphs?.normalMapStrength ?? 0.26,
      poreScale: state.studioDraft.poreScale ?? state.studioDraft.morphs?.poreScale ?? 1.0,
      poreRelief: state.studioDraft.poreRelief ?? state.studioDraft.morphs?.poreRelief ?? 0.24,
      skinRoughness: state.studioDraft.skinRoughness ?? state.studioDraft.morphs?.skinRoughness ?? 0.38,
      tZoneOiliness: state.studioDraft.tZoneOiliness ?? state.studioDraft.morphs?.tZoneOiliness ?? 0.30,
      specularLobe: state.studioDraft.specularLobe ?? state.studioDraft.morphs?.specularLobe ?? 0.45,
      charSssDepth: state.studioDraft.charSssDepth ?? state.studioDraft.morphs?.charSssDepth ?? 0.80,
      charSssColor: state.studioDraft.charSssColor ?? state.studioDraft.morphs?.charSssColor ?? '#e85a4f',
      vascularity: state.studioDraft.vascularity ?? state.studioDraft.morphs?.vascularity ?? 0.24,
      skinMottle: state.studioDraft.skinMottle ?? state.studioDraft.morphs?.skinMottle ?? 0.18,
      vellusFuzz: state.studioDraft.vellusFuzz ?? state.studioDraft.morphs?.vellusFuzz ?? 0.36,
      lipCreaseDepth: state.studioDraft.lipCreaseDepth ?? state.studioDraft.morphs?.lipCreaseDepth ?? 0.36,
      earTipFlush: state.studioDraft.earTipFlush ?? state.studioDraft.morphs?.earTipFlush ?? 0.32,
      corneaWetness: state.studioDraft.corneaWetness ?? state.studioDraft.morphs?.corneaWetness ?? 0.92,
      scleraVeinIntensity: state.studioDraft.scleraVeinIntensity ?? state.studioDraft.morphs?.scleraVeinIntensity ?? 0.16,
      hairStyle: state.studioDraft.hairStyle,
      groomDensity: state.studioDraft.groomDensity || 6000,
      hairColor: state.studioDraft.hairColor,
      hairSheen: state.studioDraft.hairSheen,
      frontBangs: state.studioDraft.frontBangs || state.studioDraft.morphs.frontBangs,
      sideLocks: state.studioDraft.sideLocks || state.studioDraft.morphs.sideLocks,
      backAttachment: state.studioDraft.backAttachment || state.studioDraft.morphs.backAttachment,
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
        hdrMode: p.hdrMode || 'golden_hour',
        envIntensity: p.envIntensity ?? 0.18,
        windowGobo: p.windowGobo || 'hair_sun_slit',
        windowGoboStrength: p.windowGoboStrength ?? 0.78,
        chiaroscuro: p.chiaroscuro ?? 0.94,
        tyndall: p.tyndall ?? 0.74,
        vintagePhoto: p.vintagePhoto ?? 0.34,
        softFocus: p.softFocus ?? 0.58,
        depthBlur: p.depthBlur ?? 0.48,
        chromatic: p.chromatic ?? 0.16,
        keyColor: p.keyColor || '#ffe8c4',
        rimColor: p.rimColor || '#ffd494',
        keyAzimuthDeg: p.keyAzimuthDeg,
        keyElevationDeg: p.keyElevationDeg,
        keyIntensity: p.keyIntensity,
        fillIntensity: p.fillIntensity ?? 0.14,
        rimIntensity: p.rimIntensity,
        hemiIntensity: p.hemiIntensity ?? 0.14,
        upIntensity: p.upIntensity ?? 0.08,
        exposure: p.exposure ?? 0.88,
        sssIntensity: p.sssIntensity,
        skinGloss: p.skinGloss ?? 0.16,
        wetGloss: p.skinGloss ?? 0.16,
        sharpen: p.sharpen,
        contrast: p.contrast,
        saturation: p.saturation ?? 0.96,
        warmth: p.warmth,
        vignette: p.vignette ?? 0.44,
        filmGrain: p.filmGrain ?? 0.07,
        bloomStrength: p.bloomStrength,
        irisSparkle: p.irisSparkle ?? 0.05,
        halation: p.halation ?? 0.54,
        skinLumen: p.skinLumen ?? 0.0,
        cursorTorch: p.cursorTorch ?? 0.24,
        tint: p.tint,
        shadowTint: p.shadowTint,
      });
    }
    const syncSlider = (id, valId, val, fmt) => {
      const el = document.getElementById(id);
      const vEl = document.getElementById(valId);
      if (el && val !== undefined) el.value = String(val);
      if (vEl && val !== undefined) vEl.textContent = fmt(val);
    };
    const vc = state.visualCustomConfig;
    syncSlider('vc-cursor-torch', 'val-vc-cursor-torch', vc.cursorTorch, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-iris-sparkle', 'val-vc-iris-sparkle', vc.irisSparkle, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-halation', 'val-vc-halation', vc.halation, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-skin-lumen', 'val-vc-skin-lumen', vc.skinLumen, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-soft-focus', 'val-vc-soft-focus', vc.softFocus, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-depth-blur', 'val-vc-depth-blur', vc.depthBlur, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-chromatic', 'val-vc-chromatic', vc.chromatic, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-env-intensity', 'val-vc-env-intensity', vc.envIntensity, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-tyndall', 'val-vc-tyndall', vc.tyndall, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-vintage-photo', 'val-vc-vintage-photo', vc.vintagePhoto, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-chiaroscuro', 'val-vc-chiaroscuro', vc.chiaroscuro, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-window-gobo-strength', 'val-vc-window-gobo-strength', vc.windowGoboStrength, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-key-azimuth', 'val-vc-key-azimuth', vc.keyAzimuthDeg, v => `${v >= 0 ? '+' : ''}${Math.round(v)}°`);
    syncSlider('vc-key-elevation', 'val-vc-key-elevation', vc.keyElevationDeg, v => `${Math.round(v)}°`);
    syncSlider('vc-key-intensity', 'val-vc-key-intensity', vc.keyIntensity, v => Number(v).toFixed(2));
    syncSlider('vc-rim-intensity', 'val-vc-rim-intensity', vc.rimIntensity, v => Number(v).toFixed(2));
    syncSlider('vc-sss', 'val-vc-sss', vc.sssIntensity, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-wet-gloss', 'val-vc-wet-gloss', vc.skinGloss, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-sharpen', 'val-vc-sharpen', vc.sharpen, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-contrast', 'val-vc-contrast', vc.contrast, v => Number(v).toFixed(2));
    syncSlider('vc-saturation', 'val-vc-saturation', vc.saturation, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-warmth', 'val-vc-warmth', vc.warmth, v => `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}`);
    syncSlider('vc-bloom', 'val-vc-bloom', vc.bloomStrength, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-supersample', 'val-vc-supersample', vc.supersample ?? 1.50, v => `${Number(v).toFixed(2)}x`);
    syncSlider('vc-cas-sharpen', 'val-vc-cas-sharpen', vc.casSharpen ?? 0.68, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-exposure', 'val-vc-exposure', vc.exposure ?? 1.08, v => `${Number(v).toFixed(2)}x`);
    syncSlider('vc-shadow-lift', 'val-vc-shadow-lift', vc.shadowLift ?? 0.28, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-specular-clarity', 'val-vc-specular-clarity', vc.specularClarity ?? 0.75, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-eye-clarity', 'val-vc-eye-clarity', vc.eyeClarity ?? 0.92, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-pore-relief-global', 'val-vc-pore-relief-global', vc.poreReliefGlobal ?? 1.15, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-sss-blur', 'val-vc-sss-blur', vc.sssBlur, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-micro-contrast', 'val-vc-micro-contrast', vc.microContrast, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-highlight-roll', 'val-vc-highlight-roll', vc.highlightRoll, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-shadow-crush', 'val-vc-shadow-crush', vc.shadowCrush, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-sun-flare-veil', 'val-vc-sun-flare-veil', vc.sunFlareVeil, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-dappled-bokeh', 'val-vc-dappled-bokeh', vc.dappledBokeh, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-swirly-bokeh', 'val-vc-swirly-bokeh', vc.swirlyBokeh, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-anamorphic-flare', 'val-vc-anamorphic-flare', vc.anamorphicFlare, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-light-leak', 'val-vc-light-leak', vc.lightLeak, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-wet-lens-drop', 'val-vc-wet-lens-drop', vc.wetLensDrop, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-film-lut-strength', 'val-vc-film-lut-strength', vc.filmLutStrength, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-film-grain', 'val-vc-film-grain', vc.filmGrain, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-vignette', 'val-vc-vignette', vc.vignette, v => `${Math.round(v * 100)}%`);
    syncSlider('vc-lens-distortion', 'val-vc-lens-distortion', vc.lensDistortion, v => `${Math.round(v * 100)}%`);
    const selHdr = document.getElementById('sel-hdr-mode');
    if (selHdr && vc.hdrMode) selHdr.value = vc.hdrMode;
    const selGobo = document.getElementById('sel-window-gobo');
    if (selGobo && vc.windowGobo) selGobo.value = vc.windowGobo;
    const selLut = document.getElementById('sel-film-lut-mode');
    if (selLut && vc.filmLutMode) selLut.value = vc.filmLutMode;
    const colKey = document.getElementById('vc-key-color');
    if (colKey && vc.keyColor) colKey.value = vc.keyColor;
    const colRim = document.getElementById('vc-rim-color');
    if (colRim && vc.rimColor) colRim.value = vc.rimColor;
    const selDyn = document.getElementById('sel-dynamic-light-mode');
    if (selDyn && state.visualCustomConfig.dynamicLightMode) {
      selDyn.value = state.visualCustomConfig.dynamicLightMode;
    }
    const btnUltraTop = document.getElementById('btn-quick-ultra-crisp');
    if (btnUltraTop) {
      const isUltra = (vc.depthBlur ?? 0.04) <= 0.06 && (vc.casSharpen ?? 0.68) >= 0.60;
      btnUltraTop.textContent = isUltra ? '🔪 4K超清: 全屏零模糊' : '🌫️ 画质: 电影柔雾感';
      btnUltraTop.classList.toggle('active-top', isUltra);
    }
    const btnChiaroTop = document.getElementById('btn-quick-chiaroscuro');
    if (btnChiaroTop) {
      const gId = vc.windowGobo || 'hair_sun_slit';
      const goboTopLabels = {
        hair_sun_slit: '🌞 强光影: 逆光发丝投影',
        venetian_blinds: '🪟 强光影: 百叶窗切光',
        tree_dappled: '🌿 强光影: 树影斑驳',
        rain_mullion: '🌧️ 强光影: 雨夜窗格',
        gothic_lattice: '🏰 强光影: 哥特花窗',
        none: '🔦 柔光影: 影棚无影箱',
      };
      btnChiaroTop.textContent = goboTopLabels[gId] || '🌞 强光影: 开启';
      btnChiaroTop.classList.toggle('active-top', gId !== 'none' && (vc.chiaroscuro ?? 0.66) > 0.45);
    }
    const btnPostFxTop = document.getElementById('btn-quick-postfx');
    if (btnPostFxTop) {
      const cId = vc.postfxCombo || 'sunlit_portra_bokeh';
      const postfxTopLabels = {
        ultra_4k_zero_blur: '🔪 后处理: 4K全屏零模糊',
        sunlit_portra_bokeh: '🎞️ 后处理: Portra超清写真',
        kodak_2383_anamorphic: '🎬 后处理: 2383变形拉丝',
        cinestill_800t_halation: '🌃 后处理: 800T朱红旋焦',
        fuji_forest_lightleak: '🍃 后处理: 富士森系漏光',
        ilford_rembrandt_bw: '🖤 后处理: 铂金雕塑黑白',
        rainy_dew_promist: '💧 后处理: 雨窗水雾柔焦',
      };
      btnPostFxTop.textContent = postfxTopLabels[cId] || '🎞️ 后处理: 自定义';
      btnPostFxTop.classList.toggle('active-top', true);
    }
    const btnDynTop = document.getElementById('btn-quick-dyn-light');
    if (btnDynTop) {
      const mId = state.visualCustomConfig.dynamicLightMode || 'sunset_cloud_drift';
      const shortLabels = {
        sunset_cloud_drift: '🌅 慢速流光: 暮光云影',
        tree_breeze_dappled: '🌿 慢速流光: 树影微风',
        rain_caustics_sway: '🌧️ 慢速流光: 雨窗水纹',
        candle_chiaroscuro: '🕯️ 慢速流光: 烛火呼吸',
        cinema_orbit: '🎬 慢速流光: 电影环绕',
        static_locked: '🔒 慢速流光: 静态定格',
      };
      btnDynTop.textContent = shortLabels[mId] || '🌅 慢速流光: 开启';
      btnDynTop.classList.toggle('active-top', mId !== 'static_locked');
    }
    desktopEngine?.applyVisualCustomConfig(state.visualCustomConfig);
    studioEngine?.applyVisualCustomConfig(state.visualCustomConfig);
  };

  // Stage 40/41 · 7 Master Post-Processing & Ultra-HD Clarity Combos (1-Click or Top-Bar Cycle)
  const POSTFX_MASTER_COMBOS = {
    ultra_4k_zero_blur: {
      postfxCombo: 'ultra_4k_zero_blur',
      label: '🔪 4K 超清锐利零模糊 · 全屏两侧头模100%锐利 + AMD CAS 自适应锐化 + 暗部提亮',
      filmLutMode: 'portra_160_sun', filmLutStrength: 0.36,
      supersample: 1.75, casSharpen: 0.92, exposure: 1.12, shadowLift: 0.34, specularClarity: 0.95, eyeClarity: 1.08, poreReliefGlobal: 1.30,
      sssBlur: 0.08, microContrast: 0.56, highlightRoll: 0.44, shadowCrush: 0.08,
      sunFlareVeil: 0.08, dappledBokeh: 0.0, softFocus: 0.0, depthBlur: 0.0,
      swirlyBokeh: 0.0, anamorphicFlare: 0.08, lightLeak: 0.0, wetLensDrop: 0.0,
      tyndall: 0.32, halation: 0.16, vintagePhoto: 0.0, filmGrain: 0.02,
      vignette: 0.20, chromatic: 0.03, lensDistortion: 0.0, contrast: 1.12, saturation: 0.98, warmth: 0.04, bloomStrength: 0.08,
    },
    sunlit_portra_bokeh: {
      postfxCombo: 'sunlit_portra_bokeh',
      label: '🌞 Portra 160 逆光超清写真 · 全屏清晰五官 + 高光柔雾 + 真皮次表面散射 (默认推荐)',
      filmLutMode: 'portra_160_sun', filmLutStrength: 0.48,
      supersample: 1.50, casSharpen: 0.68, exposure: 1.08, shadowLift: 0.28, specularClarity: 0.75, eyeClarity: 0.92, poreReliefGlobal: 1.15,
      sssBlur: 0.22, microContrast: 0.48, highlightRoll: 0.42, shadowCrush: 0.16,
      sunFlareVeil: 0.22, dappledBokeh: 0.0, softFocus: 0.16, depthBlur: 0.04,
      swirlyBokeh: 0.0, anamorphicFlare: 0.16, lightLeak: 0.06, wetLensDrop: 0.0,
      tyndall: 0.48, halation: 0.28, vintagePhoto: 0.06, filmGrain: 0.05,
      vignette: 0.26, chromatic: 0.08, lensDistortion: 0.04, contrast: 1.14, saturation: 0.96, warmth: 0.06, bloomStrength: 0.10,
    },
    kodak_2383_anamorphic: {
      postfxCombo: 'kodak_2383_anamorphic',
      label: '🎬 Kodak Vision3 2383 电影印片 + 变形宽银幕水平拉丝 + 锐利骨相',
      filmLutMode: 'kodak_2383', filmLutStrength: 0.72,
      supersample: 1.50, casSharpen: 0.72, exposure: 1.06, shadowLift: 0.26, specularClarity: 0.82, eyeClarity: 0.95, poreReliefGlobal: 1.20,
      sssBlur: 0.24, microContrast: 0.56, highlightRoll: 0.54, shadowCrush: 0.28,
      sunFlareVeil: 0.28, dappledBokeh: 0.0, softFocus: 0.18, depthBlur: 0.08,
      swirlyBokeh: 0.12, anamorphicFlare: 0.78, lightLeak: 0.10, wetLensDrop: 0.0,
      tyndall: 0.52, halation: 0.42, vintagePhoto: 0.12, filmGrain: 0.06,
      vignette: 0.34, chromatic: 0.12, lensDistortion: 0.08, contrast: 1.18, saturation: 0.95, warmth: 0.06, bloomStrength: 0.12,
    },
    cinestill_800t_halation: {
      postfxCombo: 'cinestill_800t_halation',
      label: '🌃 CineStill 800T 朱红卤化银光晕 + 极边缘旋焦散景',
      filmLutMode: 'cinestill_800t', filmLutStrength: 0.68,
      supersample: 1.50, casSharpen: 0.66, exposure: 1.08, shadowLift: 0.30, specularClarity: 0.85, eyeClarity: 0.94, poreReliefGlobal: 1.15,
      sssBlur: 0.26, microContrast: 0.48, highlightRoll: 0.48, shadowCrush: 0.24,
      sunFlareVeil: 0.32, dappledBokeh: 0.0, softFocus: 0.22, depthBlur: 0.12,
      swirlyBokeh: 0.45, anamorphicFlare: 0.48, lightLeak: 0.22, wetLensDrop: 0.0,
      tyndall: 0.48, halation: 0.82, vintagePhoto: 0.10, filmGrain: 0.08,
      vignette: 0.36, chromatic: 0.14, lensDistortion: 0.10, contrast: 1.16, saturation: 0.98, warmth: 0.04, bloomStrength: 0.13,
    },
    fuji_forest_lightleak: {
      postfxCombo: 'fuji_forest_lightleak',
      label: '🍃 富士森系暖金顶角光斑 + 胶片暗盒暖红漏光呼吸',
      filmLutMode: 'fuji_velvia_50', filmLutStrength: 0.64,
      supersample: 1.50, casSharpen: 0.65, exposure: 1.08, shadowLift: 0.28, specularClarity: 0.72, eyeClarity: 0.92, poreReliefGlobal: 1.12,
      sssBlur: 0.28, microContrast: 0.42, highlightRoll: 0.46, shadowCrush: 0.20,
      sunFlareVeil: 0.45, dappledBokeh: 0.55, softFocus: 0.20, depthBlur: 0.08,
      swirlyBokeh: 0.15, anamorphicFlare: 0.16, lightLeak: 0.56, wetLensDrop: 0.0,
      tyndall: 0.62, halation: 0.34, vintagePhoto: 0.12, filmGrain: 0.06,
      vignette: 0.30, chromatic: 0.10, lensDistortion: 0.06, contrast: 1.14, saturation: 1.02, warmth: 0.08, bloomStrength: 0.11,
    },
    ilford_rembrandt_bw: {
      postfxCombo: 'ilford_rembrandt_bw',
      label: '🖤 Ilford HP5 铂金银盐高反差黑白 + 极致微反差骨相雕塑',
      filmLutMode: 'ilford_hp5_bichrome', filmLutStrength: 0.92,
      supersample: 1.50, casSharpen: 0.82, exposure: 1.06, shadowLift: 0.24, specularClarity: 0.88, eyeClarity: 1.00, poreReliefGlobal: 1.35,
      sssBlur: 0.16, microContrast: 0.72, highlightRoll: 0.44, shadowCrush: 0.38,
      sunFlareVeil: 0.22, dappledBokeh: 0.0, softFocus: 0.12, depthBlur: 0.06,
      swirlyBokeh: 0.12, anamorphicFlare: 0.12, lightLeak: 0.06, wetLensDrop: 0.0,
      tyndall: 0.48, halation: 0.24, vintagePhoto: 0.18, filmGrain: 0.10,
      vignette: 0.42, chromatic: 0.05, lensDistortion: 0.06, contrast: 1.24, saturation: 0.22, warmth: 0.06, bloomStrength: 0.08,
    },
    rainy_dew_promist: {
      postfxCombo: 'rainy_dew_promist',
      label: '💧 雨窗呼吸水雾微折射 + 黑柔镜高光漫射 + 丁达尔斜射光束',
      filmLutMode: 'kodak_2383', filmLutStrength: 0.56,
      supersample: 1.50, casSharpen: 0.62, exposure: 1.08, shadowLift: 0.30, specularClarity: 0.78, eyeClarity: 0.92, poreReliefGlobal: 1.15,
      sssBlur: 0.28, microContrast: 0.42, highlightRoll: 0.50, shadowCrush: 0.22,
      sunFlareVeil: 0.32, dappledBokeh: 0.0, softFocus: 0.28, depthBlur: 0.08,
      swirlyBokeh: 0.10, anamorphicFlare: 0.32, lightLeak: 0.08, wetLensDrop: 0.65,
      tyndall: 0.68, halation: 0.36, vintagePhoto: 0.10, filmGrain: 0.05,
      vignette: 0.32, chromatic: 0.10, lensDistortion: 0.06, contrast: 1.14, saturation: 0.95, warmth: 0.04, bloomStrength: 0.11,
    },
  };

  document.querySelectorAll('[data-postfx-combo]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-postfx-combo]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const comboId = btn.dataset.postfxCombo;
      const cfg = POSTFX_MASTER_COMBOS[comboId];
      if (cfg) {
        applyVisualConfigAndSyncUI(cfg, false);
        showToast(`🎞️ 已套用大师级后处理配方：${cfg.label}`);
      }
    });
  });

  document.getElementById('btn-reset-postfx')?.addEventListener('click', () => {
    document.querySelectorAll('[data-postfx-combo]').forEach(b => {
      b.classList.toggle('active', b.dataset.postfxCombo === 'sunlit_portra_bokeh');
    });
    applyVisualConfigAndSyncUI(POSTFX_MASTER_COMBOS.sunlit_portra_bokeh, false);
    showToast('🔄 已恢复参考图默认盛夏逆光发丝+Portra160散景后处理配方');
  });

  document.getElementById('btn-quick-ultra-crisp')?.addEventListener('click', () => {
    const curCombo = state.visualCustomConfig.postfxCombo || 'sunlit_portra_bokeh';
    const nextComboId = curCombo === 'ultra_4k_zero_blur' ? 'sunlit_portra_bokeh' : 'ultra_4k_zero_blur';
    const cfg = POSTFX_MASTER_COMBOS[nextComboId];
    document.querySelectorAll('[data-postfx-combo]').forEach(b => {
      b.classList.toggle('active', b.dataset.postfxCombo === nextComboId);
    });
    applyVisualConfigAndSyncUI(cfg, false);
    showToast(`🔪 已切换超清画质模式：${cfg.label}`);
  });

  document.getElementById('btn-quick-postfx')?.addEventListener('click', () => {
    const keys = Object.keys(POSTFX_MASTER_COMBOS);
    const cur = state.visualCustomConfig.postfxCombo || 'sunlit_portra_bokeh';
    const nextKey = keys[(keys.indexOf(cur) + 1) % keys.length];
    const cfg = POSTFX_MASTER_COMBOS[nextKey];
    document.querySelectorAll('[data-postfx-combo]').forEach(b => {
      b.classList.toggle('active', b.dataset.postfxCombo === nextKey);
    });
    applyVisualConfigAndSyncUI(cfg, false);
    showToast(`🎞️ 已切换大师级后处理特效：${cfg.label}`);
  });

  document.getElementById('sel-film-lut-mode')?.addEventListener('change', (e) => {
    applyVisualConfigAndSyncUI({ filmLutMode: e.target.value }, false);
    showToast(`🎞️ 已切换电影胶片乳剂曲线：${e.target.options[e.target.selectedIndex].text}`);
  });

  document.getElementById('btn-quick-chiaroscuro')?.addEventListener('click', () => {
    const cycleModes = [
      { windowGobo: 'hair_sun_slit', windowGoboStrength: 0.45, chiaroscuro: 0.66, keyIntensity: 2.02, fillIntensity: 0.42, contrast: 1.14, label: '🌞 盛夏逆光发丝缕缕投影 + 自然立体明暗对比 (推荐)' },
      { windowGobo: 'venetian_blinds', windowGoboStrength: 0.56, chiaroscuro: 0.72, keyIntensity: 2.10, fillIntensity: 0.36, contrast: 1.16, label: '🪟 书房百叶窗条纹切光 + 电影明暗分割' },
      { windowGobo: 'tree_dappled', windowGoboStrength: 0.50, chiaroscuro: 0.68, keyIntensity: 2.04, fillIntensity: 0.40, contrast: 1.14, label: '🌿 窗外梧桐树影斑驳光斑 + 自然林间光影' },
      { windowGobo: 'rain_mullion', windowGoboStrength: 0.48, chiaroscuro: 0.64, keyIntensity: 1.96, fillIntensity: 0.42, contrast: 1.12, label: '🌧️ 雨夜十字窗框投影 + 伦勃朗明暗雕塑感' },
      { windowGobo: 'none', windowGoboStrength: 0.0, chiaroscuro: 0.28, keyIntensity: 1.52, fillIntensity: 0.56, contrast: 1.06, label: '🔦 纯净影棚双柔光箱 (柔和均匀光影)' },
    ];
    const curGobo = state.visualCustomConfig.windowGobo || 'hair_sun_slit';
    const curIdx = cycleModes.findIndex(m => m.windowGobo === curGobo);
    const nextCfg = cycleModes[(curIdx + 1) % cycleModes.length];
    applyVisualConfigAndSyncUI(nextCfg, false);
    showToast(`🌓 已切换强光影明暗模式：${nextCfg.label}`);
  });

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

  document.getElementById('sel-dynamic-light-mode')?.addEventListener('change', (e) => {
    applyVisualConfigAndSyncUI({ dynamicLightMode: e.target.value }, false);
    const dm = DYNAMIC_LIGHT_MODES.find(x => x.id === e.target.value);
    showToast(`🌅 已切换慢速变换光影：${dm ? `${dm.label} — ${dm.desc}` : e.target.value}`);
  });

  document.getElementById('btn-quick-dyn-light')?.addEventListener('click', () => {
    const modes = DYNAMIC_LIGHT_MODES.map(m => m.id);
    const cur = state.visualCustomConfig.dynamicLightMode || 'sunset_cloud_drift';
    const nextMode = modes[(modes.indexOf(cur) + 1) % modes.length];
    applyVisualConfigAndSyncUI({ dynamicLightMode: nextMode }, false);
    const dm = DYNAMIC_LIGHT_MODES.find(x => x.id === nextMode);
    showToast(`🌅 已切换慢速变换光影模式：${dm ? `${dm.label} — ${dm.desc}` : nextMode}`);
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
  bindVcSlider('vc-supersample', 'val-vc-supersample', 'supersample', v => `${Number(v).toFixed(2)}x`);
  bindVcSlider('vc-cas-sharpen', 'val-vc-cas-sharpen', 'casSharpen', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-exposure', 'val-vc-exposure', 'exposure', v => `${Number(v).toFixed(2)}x`);
  bindVcSlider('vc-shadow-lift', 'val-vc-shadow-lift', 'shadowLift', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-specular-clarity', 'val-vc-specular-clarity', 'specularClarity', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-eye-clarity', 'val-vc-eye-clarity', 'eyeClarity', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-pore-relief-global', 'val-vc-pore-relief-global', 'poreReliefGlobal', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-dyn-speed', 'val-vc-dyn-speed', 'dynamicLightSpeed', v => `${Number(v).toFixed(2)}x`);
  bindVcSlider('vc-dyn-amp', 'val-vc-dyn-amp', 'dynamicLightAmp', v => `${Math.round(v * 100)}%`);
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
  bindVcSlider('vc-sss-blur', 'val-vc-sss-blur', 'sssBlur', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-micro-contrast', 'val-vc-micro-contrast', 'microContrast', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-highlight-roll', 'val-vc-highlight-roll', 'highlightRoll', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-shadow-crush', 'val-vc-shadow-crush', 'shadowCrush', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-sun-flare-veil', 'val-vc-sun-flare-veil', 'sunFlareVeil', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-dappled-bokeh', 'val-vc-dappled-bokeh', 'dappledBokeh', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-swirly-bokeh', 'val-vc-swirly-bokeh', 'swirlyBokeh', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-anamorphic-flare', 'val-vc-anamorphic-flare', 'anamorphicFlare', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-light-leak', 'val-vc-light-leak', 'lightLeak', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-wet-lens-drop', 'val-vc-wet-lens-drop', 'wetLensDrop', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-film-lut-strength', 'val-vc-film-lut-strength', 'filmLutStrength', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-film-grain', 'val-vc-film-grain', 'filmGrain', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-vignette', 'val-vc-vignette', 'vignette', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-lens-distortion', 'val-vc-lens-distortion', 'lensDistortion', v => `${Math.round(v * 100)}%`);
  bindVcSlider('vc-saturation', 'val-vc-saturation', 'saturation', v => `${Math.round(v * 100)}%`);
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

  // Initialize high-contrast sunlit hair-strand shadow visual config on startup
  applyVisualConfigAndSyncUI({}, false);

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

  // Stage 43: Quick Desktop Active Head Skin Material, Eye Size/Color, 4-Zone Modular Hair & Multi-Head Blender
  const getTargetDesktopPet = () => {
    const list = getTargetDesktopPetsList();
    return list[0] || null;
  };

  const syncVcdSelectedPetUI = (explicitPetId = null) => {
    if (!desktopEngine || desktopEngine.pets.size === 0) return;
    if (explicitPetId && desktopEngine.pets.has(explicitPetId)) {
      state.activeStripPetId = explicitPetId;
      const selEl = document.getElementById('vcd-target-pet-select');
      if (selEl && selEl.value !== 'all') {
        if ([...selEl.options].some(o => o.value === explicitPetId)) {
          selEl.value = explicitPetId;
          state.vcdTargetPetId = explicitPetId;
        }
      }
    }
    const pet = getTargetDesktopPet();
    if (!pet || !pet.collectible) return;
    const col = pet.collectible;
    const m = { ...(col.morphs || {}), ...(pet.node?.userData?.morphs || {}) };
    const badgeEl = document.getElementById('vcd-selected-pet-badge');
    if (badgeEl) {
      badgeEl.textContent = state.vcdTargetPetId === 'all'
        ? `当前操作：全部在屏角色 (${desktopEngine.pets.size}尊)`
        : `当前选中：${col.name.split('·')[0].trim()}`;
    }
    const skinEl = document.getElementById('vcd-skin-variant');
    if (skinEl && col.skinVariant) skinEl.value = col.skinVariant;
    const vcdSkinOld = document.getElementById('vcd-sel-skin-variant');
    if (vcdSkinOld && col.skinVariant) vcdSkinOld.value = col.skinVariant;

    const irisHex = col.irisColor || m.irisColor || '#3b2316';
    const irisEl = document.getElementById('vcd-iris-color');
    if (irisEl) irisEl.value = irisHex;

    const setSliderUI = (sId, vId, val, fmt = 'signed') => {
      const s = document.getElementById(sId);
      const v = document.getElementById(vId);
      const num = Number(val ?? 0);
      if (s) s.value = String(num);
      if (v) {
        if (fmt === 'pct') v.textContent = `${Math.round(num * 100)}%`;
        else v.textContent = `${num >= 0 ? '+' : ''}${num.toFixed(2)}`;
      }
    };
    setSliderUI('vcd-eye-size', 'val-vcd-eye-size', m.eyeSize ?? col.eyeSize ?? 0.0, 'signed');
    setSliderUI('vcd-eye-almond', 'val-vcd-eye-almond', m.eyeAlmond ?? 0.0, 'signed');
    setSliderUI('vcd-eye-aperture', 'val-vcd-eye-aperture', m.eyeAperture ?? m.eyelidOpen ?? 0.0, 'signed');
    setSliderUI('vcd-eye-tilt', 'val-vcd-eye-tilt', m.eyeTilt ?? 0.0, 'signed');
    setSliderUI('vcd-eye-spacing', 'val-vcd-eye-spacing', m.eyeSpacing ?? 0.0, 'signed');
    setSliderUI('vcd-eye-epicanthus', 'val-vcd-eye-epicanthus', m.eyeEpicanthus ?? 0.15, 'signed');
    setSliderUI('vcd-eye-crease', 'val-vcd-eye-crease', m.eyeCrease ?? 0.25, 'signed');
    setSliderUI('vcd-eye-bag', 'val-vcd-eye-bag', m.eyeBag ?? 0.20, 'signed');
    setSliderUI('vcd-iris-scale', 'val-vcd-iris-scale', m.irisScale ?? col.irisScale ?? 1.0, 'pct');
    setSliderUI('vcd-pupil-size', 'val-vcd-pupil-size', m.pupilSize ?? col.pupilSize ?? 1.0, 'pct');
    setSliderUI('vcd-iris-brightness', 'val-vcd-iris-brightness', m.irisBrightness ?? col.irisBrightness ?? 1.15, 'pct');
    setSliderUI('vcd-limbal-ring', 'val-vcd-limbal-ring', m.limbalRing ?? col.limbalRing ?? 1.0, 'pct');
    setSliderUI('vcd-sclera-brightness', 'val-vcd-sclera-brightness', m.scleraBrightness ?? col.scleraBrightness ?? 1.08, 'pct');

    const hs = document.getElementById('vcd-hair-style');
    if (hs && col.hairStyle) hs.value = col.hairStyle;
    const ht = document.getElementById('vcd-hair-top');
    if (ht) ht.value = col.topCrown || m.topCrown || 'default';
    const hb = document.getElementById('vcd-hair-bangs');
    if (hb) hb.value = col.frontBangs || m.frontBangs || 'default';
    const hsl = document.getElementById('vcd-hair-sidelocks');
    if (hsl) hsl.value = col.sideLocks || m.sideLocks || 'default';
    const hbk = document.getElementById('vcd-hair-back');
    if (hbk) hbk.value = col.backAttachment || m.backAttachment || 'none';
  };
  window.__syncVcdSelectedPetUI = syncVcdSelectedPetUI;

  document.getElementById('vcd-target-pet-select')?.addEventListener('change', (e) => {
    state.vcdTargetPetId = e.target.value;
    if (e.target.value !== 'selected' && e.target.value !== 'all') {
      state.activeStripPetId = e.target.value;
    }
    syncVcdSelectedPetUI();
    if (desktopEngine) renderSpecimenPlacards(desktopEngine.getPlacardsScreenData());
  });

  const applySkinVariantToTargetPets = (skinId) => {
    const skMeta = SKIN_MATERIAL_CATALOG.find(x => x.id === skinId);
    const pets = getTargetDesktopPetsList();
    if (!pets.length) return;
    for (const pet of pets) {
      const headGroup = pet.node || pet.headNode;
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
      }
    }
    persistCollectibles();
    const s1 = document.getElementById('vcd-skin-variant');
    const s2 = document.getElementById('vcd-sel-skin-variant');
    if (s1) s1.value = skinId;
    if (s2) s2.value = skinId;
    desktopEngine.wakeRender(1.5, true);
    desktopEngine.emitPetsChange();
    const firstName = pets.length > 1 ? `全部 ${pets.length} 尊角色` : pets[0].collectible.name.split('·')[0].trim();
    showToast(`🎨 已将「${firstName}」真皮贴图切换为：${skMeta ? skMeta.label : skinId}`);
  };

  document.getElementById('vcd-skin-variant')?.addEventListener('change', (e) => applySkinVariantToTargetPets(e.target.value));
  document.getElementById('vcd-sel-skin-variant')?.addEventListener('change', (e) => applySkinVariantToTargetPets(e.target.value));

  // Wire Quick Drawer Eye Color, Swatches & 10 Eye Size/Shape/Optics Sliders
  const applyEyePatchToTargetPets = (patch = {}) => {
    for (const pet of getTargetDesktopPetsList()) {
      const headGroup = pet.node || pet.headNode;
      if (!headGroup) continue;
      headGroup.userData.morphs = {
        ...(headGroup.userData.morphs || {}),
        ...(pet.collectible?.morphs || {}),
        ...patch,
      };
      if (patch.eyelidOpen !== undefined && patch.eyeAperture === undefined) {
        headGroup.userData.morphs.eyeAperture = patch.eyelidOpen;
      }
      if (patch.eyeAperture !== undefined && patch.eyelidOpen === undefined) {
        headGroup.userData.morphs.eyelidOpen = patch.eyeAperture;
      }
      applyHeadMorphsToGroup(headGroup, headGroup.userData.morphs);
      updateCollectibleMaterialsLive(headGroup, patch);
      if (pet.collectible) {
        Object.assign(pet.collectible, patch);
        pet.collectible.morphs = { ...headGroup.userData.morphs };
        const col = state.collectibles.find(c => c.id === pet.id);
        if (col) {
          Object.assign(col, patch);
          col.morphs = { ...headGroup.userData.morphs };
        }
      }
    }
    if (studioEngine) {
      Object.assign(state.studioDraft, patch);
      Object.assign(state.studioDraft.morphs, patch);
      studioEngine.updateMorphsFast(state.studioDraft.morphs);
      studioEngine.updateMaterialsFast(patch);
    }
    if (desktopEngine) desktopEngine.wakeRender(1.5, true);
  };

  document.getElementById('vcd-iris-color')?.addEventListener('input', (e) => {
    const hex = e.target.value;
    const colIris = document.getElementById('col-iris');
    if (colIris) colIris.value = hex;
    applyEyePatchToTargetPets({ irisColor: hex, irisMix: 0.90 });
  });
  document.querySelectorAll('[data-vcd-iris]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const hex = btn.dataset.vcdIris;
      if (!hex) return;
      const vcdIris = document.getElementById('vcd-iris-color');
      if (vcdIris) vcdIris.value = hex;
      const colIris = document.getElementById('col-iris');
      if (colIris) colIris.value = hex;
      applyEyePatchToTargetPets({ irisColor: hex, irisMix: 0.92 });
      showToast(`👁️ 已切换高透虹膜瞳色：${btn.textContent.trim()} (${hex})`);
    });
  });

  document.getElementById('vcd-eye-preset-select')?.addEventListener('change', (e) => {
    const preset = EYE_SHAPE_PRESET_CATALOG.find(p => p.id === e.target.value);
    if (!preset) return;
    const patch = {
      eyePreset: preset.id,
      eyeSize: preset.eyeSize,
      eyeTilt: preset.eyeTilt,
      eyeAperture: preset.eyeHeight,
      eyelidOpen: preset.eyeHeight,
      eyeSpacing: preset.eyeSpacing,
      eyeEpicanthus: preset.eyeEpicanthus,
      eyeCrease: preset.eyeCrease,
      eyeBag: preset.eyeBag,
      aegyoSalStrength: Math.max(0.10, preset.eyeBag * 0.55),
      irisScale: preset.irisScale,
    };
    const stSel = document.getElementById('studio-eye-preset-select');
    if (stSel) stSel.value = preset.id;
    applyEyePatchToTargetPets(patch);
    syncVcdSelectedPetUI();
    showToast(`👁️ 已切换东亚3D眼型预设：${preset.label}`);
  });

  for (const [sId, vId, key, fmt] of [
    ['vcd-eye-size', 'val-vcd-eye-size', 'eyeSize', 'signed'],
    ['vcd-eye-almond', 'val-vcd-eye-almond', 'eyeAlmond', 'signed'],
    ['vcd-eye-aperture', 'val-vcd-eye-aperture', 'eyeAperture', 'signed'],
    ['vcd-eye-tilt', 'val-vcd-eye-tilt', 'eyeTilt', 'signed'],
    ['vcd-eye-spacing', 'val-vcd-eye-spacing', 'eyeSpacing', 'signed'],
    ['vcd-eye-epicanthus', 'val-vcd-eye-epicanthus', 'eyeEpicanthus', 'signed'],
    ['vcd-eye-crease', 'val-vcd-eye-crease', 'eyeCrease', 'signed'],
    ['vcd-eye-bag', 'val-vcd-eye-bag', 'eyeBag', 'signed'],
    ['vcd-iris-scale', 'val-vcd-iris-scale', 'irisScale', 'pct'],
    ['vcd-pupil-size', 'val-vcd-pupil-size', 'pupilSize', 'pct'],
    ['vcd-iris-brightness', 'val-vcd-iris-brightness', 'irisBrightness', 'pct'],
    ['vcd-limbal-ring', 'val-vcd-limbal-ring', 'limbalRing', 'pct'],
    ['vcd-sclera-brightness', 'val-vcd-sclera-brightness', 'scleraBrightness', 'pct'],
  ]) {
    document.getElementById(sId)?.addEventListener('input', (e) => {
      const v = parseFloat(e.target.value);
      const valEl = document.getElementById(vId);
      if (valEl) {
        valEl.textContent = fmt === 'pct' ? `${Math.round(v * 100)}%` : `${v >= 0 ? '+' : ''}${v.toFixed(2)}`;
      }
      applyEyePatchToTargetPets({ [key]: v });
    });
  }

  // Stage 56 · Master Card-to-Strand v2 Hair Mode & Density Controls
  const applyMasterHairPatch = async (patch) => {
    const nextCfg = setMasterHairConfig(patch);
    const hairPatch = { hairRenderMode: nextCfg.mode, strandDensity: nextCfg.density };
    if (studioEngine?.headNode) {
      await updateHairDesignOnGroup(studioEngine.headNode, hairPatch);
      studioEngine.wakeRender(1.8, true);
    }
    if (desktopEngine?.rebuildAllPetsHair) {
      await desktopEngine.rebuildAllPetsHair(hairPatch);
    }
    const modeLabel = nextCfg.mode === 'strand'
      ? `✨ 真发丝模式 (${MASTER_HAIR_DENSITIES[nextCfg.density]?.label || nextCfg.density})`
      : '⬜ 原版发片模式';
    showToast(`💇‍♀️ 已切换发丝渲染管线：${modeLabel}`);
  };
  document.getElementById('vcd-master-hair-mode')?.addEventListener('change', (e) => {
    applyMasterHairPatch({ mode: e.target.value });
  });
  document.getElementById('vcd-master-hair-density')?.addEventListener('change', (e) => {
    applyMasterHairPatch({ density: e.target.value });
  });

  // Base hairstyle switching inside Quick Drawer
  document.getElementById('vcd-hair-style')?.addEventListener('change', async (e) => {
    const newHairStyle = e.target.value;
    const pets = getTargetDesktopPetsList();
    for (const pet of pets) {
      if (!pet?.collectible) continue;
      pet.collectible.hairStyle = newHairStyle;
      pet.collectible.frontBangs = 'default';
      pet.collectible.sideLocks = 'default';
      pet.collectible.topCrown = 'default';
      pet.collectible.backAttachment = 'none';
      if (pet.collectible.morphs) {
        pet.collectible.morphs.frontBangs = 'default';
        pet.collectible.morphs.frontBangsStyle = 'default';
        pet.collectible.morphs.sideLocks = 'default';
        pet.collectible.morphs.sideLocksStyle = 'default';
        pet.collectible.morphs.topCrown = 'default';
        pet.collectible.morphs.topCrownStyle = 'default';
        pet.collectible.morphs.backAttachment = 'none';
        pet.collectible.morphs.backAttachmentStyle = 'none';
      }
      const col = state.collectibles.find(c => c.id === pet.id);
      if (col) {
        col.hairStyle = newHairStyle;
        col.frontBangs = 'default';
        col.sideLocks = 'default';
        col.topCrown = 'default';
        col.backAttachment = 'none';
      }
      const savedPos = pet.pos ? pet.pos.clone() : null;
      await desktopEngine.summonCollectible(pet.collectible);
      const updatedPet = desktopEngine.pets.get(pet.id);
      if (updatedPet && savedPos) {
        updatedPet.pos.copy(savedPos);
        updatedPet.targetPos.copy(savedPos);
        updatedPet.node.position.copy(savedPos);
      }
    }
    persistCollectibles();
    desktopEngine.wakeRender(1.5, true);
    const hp = REAL_HAIR_CATALOG.find(x => x.id === newHairStyle);
    showToast(`💇‍♀️ 已切换完整主发型基底：${hp ? hp.label : newHairStyle}`);
  });

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
      if (v > 0.01) inp.dataset.lastWeight = String(v);
      const isOn = v > 0.005;
      const chk = document.querySelector(`[data-head-blend-on="${k}"]`);
      if (chk) chk.checked = isOn;
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
        ['on_' + k]: isOn,
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

  document.querySelectorAll('[data-head-blend-on]').forEach(chk => {
    chk.addEventListener('change', (e) => {
      const k = chk.dataset.headBlendOn;
      const isOn = Boolean(e.target.checked);
      const inp = document.querySelector(`[data-head-blend="${k}"]`);
      if (!inp) return;
      if (isOn && parseFloat(inp.value) <= 0.01) {
        inp.value = inp.dataset.lastWeight || '0.50';
      } else if (!isOn) {
        if (parseFloat(inp.value) > 0.01) inp.dataset.lastWeight = inp.value;
        inp.value = '0';
      }
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });

  // Reset Multi-Head Blend to 0% Pure Single Head buttons (all 38 head models)
  const resetZeroBlend = () => {
    const zeroBlend = {};
    for (const ch of HEAD_BLEND_CHANNELS) {
      zeroBlend[ch.id] = 0.0;
      zeroBlend['on_' + ch.id] = false;
    }
    syncStudioHeadBlendSliders(zeroBlend);
    document.querySelectorAll('[data-head-blend]').forEach(inp => {
      const k = inp.dataset.headBlend;
      inp.value = '0';
      const chk = document.querySelector(`[data-head-blend-on="${k}"]`);
      if (chk) chk.checked = false;
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
    showToast('✨ 已归零全部 38 款头模混合开关与权重，恢复纯净无违和单脸骨相！');
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
  // STAGE 43: 4-ZONE MODULAR HAIR DESIGNER CONTROLS (Studio + Quick Drawer)
  // ==========================================================================
  const syncHairDesignControlsUI = (patch = {}) => {
    if (patch.topCrown !== undefined) {
      for (const id of ['sel-hair-top-crown', 'vcd-hair-top']) {
        const el = document.getElementById(id);
        if (el) el.value = patch.topCrown;
      }
    }
    if (patch.frontBangs !== undefined) {
      for (const id of ['sel-hair-bangs', 'vcd-sel-hair-bangs', 'vcd-hair-bangs']) {
        const el = document.getElementById(id);
        if (el) el.value = patch.frontBangs;
      }
    }
    if (patch.sideLocks !== undefined) {
      for (const id of ['sel-hair-sidelocks', 'vcd-sel-hair-sidelocks', 'vcd-hair-sidelocks']) {
        const el = document.getElementById(id);
        if (el) el.value = patch.sideLocks;
      }
    }
    if (patch.backAttachment !== undefined) {
      for (const id of ['sel-hair-back', 'vcd-sel-hair-back', 'vcd-hair-back']) {
        const el = document.getElementById(id);
        if (el) el.value = patch.backAttachment;
      }
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

    for (const pet of getTargetDesktopPetsList()) {
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
          }
        }
      }
    }
    persistCollectibles();
    if (desktopEngine) {
      desktopEngine.wakeRender(1.5, true);
      desktopEngine.emitPetsChange();
    }

    if (toastMsg) showToast(toastMsg);
  };

  for (const selId of ['sel-hair-top-crown', 'vcd-hair-top']) {
    document.getElementById(selId)?.addEventListener('change', (e) => {
      const topId = e.target.value;
      const tp = HAIR_TOP_CROWN_CATALOG.find(x => x.id === topId);
      applyModularHairDesignPatch({ topCrown: topId }, `👑 已拼装顶冠/发缝基底模块：${tp ? tp.label : topId}`);
    });
  }
  for (const selId of ['sel-hair-bangs', 'vcd-sel-hair-bangs', 'vcd-hair-bangs']) {
    document.getElementById(selId)?.addEventListener('change', (e) => {
      const bangsId = e.target.value;
      const bg = HAIR_FRONT_BANGS_CATALOG.find(x => x.id === bangsId);
      applyModularHairDesignPatch({ frontBangs: bangsId }, `✂️ 已拼装前额刘海模块：${bg ? bg.label : bangsId}`);
    });
  }
  for (const selId of ['sel-hair-sidelocks', 'vcd-sel-hair-sidelocks', 'vcd-hair-sidelocks']) {
    document.getElementById(selId)?.addEventListener('change', (e) => {
      const sideId = e.target.value;
      const sl = HAIR_SIDE_LOCKS_CATALOG.find(x => x.id === sideId);
      applyModularHairDesignPatch({ sideLocks: sideId }, `🎀 已拼装两侧鬓角模块：${sl ? sl.label : sideId}`);
    });
  }
  for (const selId of ['sel-hair-back', 'vcd-sel-hair-back', 'vcd-hair-back']) {
    document.getElementById(selId)?.addEventListener('change', (e) => {
      const backId = e.target.value;
      const bk = HAIR_BACK_ATTACHMENT_CATALOG.find(x => x.id === backId);
      applyModularHairDesignPatch({ backAttachment: backId }, `🍡 已拼装后发/马尾/盘发模块：${bk ? bk.label : backId}`);
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
      label: '📸 照片同款轻盈空气碎刘海 + 右耳露出/左耳碎发 + 高束马尾',
      topCrown: 'close_natural',
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
      topCrown: 'center_part',
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
      label: '✨ 韩系八字修颜长刘海 + 法式龙须卷 + 披肩长波浪',
      topCrown: 'high_cranial',
      frontBangs: 'curtain_part',
      sideLocks: 'wavy_tendril',
      backAttachment: 'draped_wave_back',
      hairDyePreset: 'cold_tea_ash',
      hairColor: '#181514',
      hairTipColor: '#4a3a2e',
      hairOmbreMix: 0.65,
      hairWispyFeather: 0.52,
    },
    classical_chignon: {
      label: '🎻 温柔斜分刘海 + 耳畔垂缕 + 古典温婉低盘发髻',
      topCrown: 'side_part_left',
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
      topCrown: 'slick_ponytail_crown',
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

  // ==========================================================================
  // STAGE 52: VICTOR DOPAMINE, MONTHLY SCORE POOL & PUZZLE-SKILL HUB WIRING
  // ==========================================================================
  const puzzleHubModal = document.getElementById('victor-puzzle-hub-modal');
  const hbBanner = document.getElementById('heartbeat-anticheat-banner');
  const topMonthlyScoreEl = document.getElementById('top-monthly-score-val');
  const hubMonthlyTotalEl = document.getElementById('hub-monthly-total-pts');
  const hubScoreBreakdownEl = document.getElementById('hub-score-breakdown');
  const hubDailyTotalEl = document.getElementById('hub-daily-total-pts');
  const hubDailyRankEl = document.getElementById('hub-daily-rank-text');
  const hubActiveMultEl = document.getElementById('hub-active-mult-val');
  const hubActiveBuffDescEl = document.getElementById('hub-active-buff-desc');
  const hubDividendEstEl = document.getElementById('hub-dividend-est');
  const hubPoolSummaryEl = document.getElementById('hub-pool-summary');

  const SIMULATED_RIVALS = [
    { name: '🏆 #1 夜雨解剖师·K (已购7头全拼图)', basePts: 4280, tag: '日均专注 4.2h' },
    { name: '🥈 #2 怀集刷题机器 (方尧平+初夏双核)', basePts: 3150, tag: '笔记熵 4.62 S级' },
    { name: '🥉 #3 琴房守夜人 (初夏竖琴心流)', basePts: 1960, tag: '活人巡检 18/18' },
    { name: '🎖️ #5 匿名医学生·C4 (林汐斩首悬赏)', basePts: 1120, tag: '斩首任务 9 连胜' },
    { name: '💤 #19 挂机被清零的倒霉蛋 (超时未点)', basePts: 0, tag: '💀 巡检超时已扣光本月分' },
  ];

  function refreshPuzzleHubUI() {
    const focusPts = Math.round(puzzleState.monthlyFocusScore || 0);
    const notePts = Math.round(puzzleState.monthlyNotebookScore || 0);
    const victorPts = Math.round(puzzleState.monthlyVictorScore || 0);
    const totalPts = getMonthlyTotalScore();
    const mult = getActivePuzzleMultiplier();

    if (topMonthlyScoreEl) topMonthlyScoreEl.textContent = totalPts.toLocaleString();
    if (hubMonthlyTotalEl) hubMonthlyTotalEl.textContent = `${totalPts.toLocaleString()} PTS`;
    if (hubScoreBreakdownEl) {
      hubScoreBreakdownEl.textContent = `专注:${focusPts} · 笔记:${notePts} · 胜者:${victorPts}`;
    }
    if (hubDailyTotalEl) hubDailyTotalEl.textContent = `${totalPts.toLocaleString()} PTS`;
    if (hubActiveMultEl) hubActiveMultEl.textContent = `×${mult.toFixed(2)}`;

    const victorBuffSec = Math.max(0, Math.ceil((puzzleRuntime.victorBuffUntilMs - Date.now()) / 1000));
    if (hubActiveBuffDescEl) {
      hubActiveBuffDescEl.textContent = victorBuffSec > 0
        ? `🔥 胜者亢奋(${Math.ceil(victorBuffSec / 60)}m) · 巡检通过 ${puzzleState.heartbeatPassedCount} 次`
        : `状元连击环生效中 · 巡检通过 ${puzzleState.heartbeatPassedCount} 次`;
    }

    // Prize Pool Dividend calculation (Monthly Fee ¥50: Creator keeps ¥30, Pool gets ¥20/sub)
    const subCount = Math.max(10, Number(puzzleState.subscriberCount || 200));
    const creatorProfit = subCount * 30;
    const totalPoolRmb = subCount * 20;
    const allRivalPts = SIMULATED_RIVALS.reduce((s, r) => s + r.basePts, 0) + Math.max(1, subCount - 6) * 420;
    const myShare = totalPts / Math.max(1, allRivalPts + totalPts);
    // Top active grinders get weighted pool bonus
    const myDividendRmb = Math.min(totalPoolRmb * 0.35, totalPoolRmb * myShare * 3.8);
    const roiPct = Math.round((myDividendRmb / 50) * 100);

    if (hubDividendEstEl) hubDividendEstEl.textContent = `¥ ${myDividendRmb.toFixed(2)}`;
    if (hubPoolSummaryEl) {
      hubPoolSummaryEl.textContent = `总池 ¥${totalPoolRmb.toLocaleString()} (50元月费回本 ${roiPct}%)`;
    }

    const poolEconEl = document.getElementById('pool-economy-summary');
    if (poolEconEl) {
      const netGain = myDividendRmb - 50;
      poolEconEl.innerHTML = `
        <div>👑 <strong>创作者（你）月初稳赚净抽成：</strong><span style="color:#4ade80;font-weight:800;">¥ ${creatorProfit.toLocaleString()}.00</span>（${subCount}人 × ¥30 旱涝保收）</div>
        <div>🏦 <strong>本月玩家瓜分资产总池：</strong><span style="color:#38bdf8;font-weight:800;">¥ ${totalPoolRmb.toLocaleString()}.00</span>（${subCount}人 × ¥20 实打实激励池）</div>
        <div>🔥 <strong>当前玩家积分权重预计分红：</strong><span style="color:#fef08a;font-weight:800;">¥ ${myDividendRmb.toFixed(2)}</span>（扣除50元月费后<strong>${netGain >= 0 ? `净赚 +¥${netGain.toFixed(2)}` : `还差 ¥${Math.abs(netGain).toFixed(2)} 回本`}</strong>）</div>
      `;
    }

    // Update Leaderboard rows
    const combinedBoard = [
      ...SIMULATED_RIVALS,
      { name: '👑 【你 · 活人支配者】', basePts: totalPts, tag: `巡检 ${puzzleState.heartbeatPassedCount}次 · 有效字 ${puzzleState.totalValidNotebookChars}`, isMe: true },
    ].sort((a, b) => b.basePts - a.basePts);

    const myRankIdx = combinedBoard.findIndex(r => r.isMe);
    if (hubDailyRankEl) {
      if (myRankIdx === 0) {
        hubDailyRankEl.textContent = '👑 当前排位：全服第 #1 名（独占鳌头！）';
      } else {
        const diff = combinedBoard[myRankIdx - 1].basePts - totalPts;
        hubDailyRankEl.textContent = `当前排位：#${myRankIdx + 1} (距上一名仅差 ${diff} 分)`;
      }
    }

    const lbRowsEl = document.getElementById('hub-leaderboard-rows');
    if (lbRowsEl) {
      lbRowsEl.innerHTML = combinedBoard.map((item, idx) => `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;border-radius:8px;background:${item.isMe ? 'rgba(245,158,11,0.22)' : 'rgba(0,0,0,0.4)'};border:1px solid ${item.isMe ? '#fbbf24' : 'rgba(255,255,255,0.08)'};">
          <div>
            <strong style="color:${item.isMe ? '#fef08a' : '#f1f5f9'};font-size:12px;">${item.name}</strong>
            <span style="font-size:10.5px;color:#94a3b8;margin-left:6px;">${item.tag}</span>
          </div>
          <strong style="font-family:monospace;color:${item.isMe ? '#4ade80' : '#fcd34d'};font-size:13px;">${item.basePts.toLocaleString()} PTS</strong>
        </div>
      `).join('');
    }

    // Focus Tab stats
    const hbPassEl = document.getElementById('hub-hb-pass-count');
    const hbFailEl = document.getElementById('hub-hb-fail-count');
    if (hbPassEl) hbPassEl.textContent = `${puzzleState.heartbeatPassedCount} 次`;
    if (hbFailEl) hbFailEl.textContent = `${puzzleState.heartbeatFailedCount} 次`;

    // Notebook Tab stats
    const nbMonthlyEl = document.getElementById('nb-stat-monthly-pts');
    if (nbMonthlyEl) nbMonthlyEl.textContent = `${notePts.toLocaleString()} PTS`;
    const nbLogEl = document.getElementById('nb-audit-log-list');
    if (nbLogEl && Array.isArray(puzzleState.auditLogs)) {
      nbLogEl.innerHTML = puzzleState.auditLogs.slice(0, 8).map(line => `<div style="margin-bottom:3px;">${line}</div>`).join('');
    }

    // BOOTH Key & Settlement Hash
    const selHeadId = document.getElementById('puzzle-head-select')?.value || 'SPEC-2026-FYP';
    const curLoadout = getHeadLoadout(selHeadId);
    const boothKeyEl = document.getElementById('booth-generated-key');
    if (boothKeyEl) {
      boothKeyEl.textContent = generateBoothPuzzleKey(selHeadId, puzzleState.yearMonth, curLoadout);
    }
    const hashEl = document.getElementById('booth-settlement-hash');
    if (hashEl) {
      const { receiptCode } = generateMonthlySettlementHash(puzzleState);
      hashEl.textContent = receiptCode;
    }

    if (desktopEngine) {
      renderSpecimenPlacards(desktopEngine.getPlacardsScreenData());
    }
  }

  function openPuzzleHubTab(tabId = 'focus') {
    if (puzzleHubModal) puzzleHubModal.classList.remove('hidden');
    document.querySelectorAll('[data-hub-tab]').forEach(btn => {
      const isAct = btn.dataset.hubTab === tabId;
      btn.classList.toggle('active', isAct);
      btn.style.background = isAct ? 'rgba(245,158,11,0.24)' : 'rgba(255,255,255,0.05)';
      btn.style.borderColor = isAct ? 'rgba(251,191,36,0.65)' : 'rgba(255,255,255,0.16)';
      btn.style.color = isAct ? '#fef08a' : '#cbd5e1';
    });
    ['focus', 'notebook', 'victor', 'leaderboard', 'booth', 'bipolar'].forEach(id => {
      const pane = document.getElementById(`hub-pane-${id}`);
      if (pane) pane.classList.toggle('hidden', id !== tabId);
    });
    refreshPuzzleHubUI();
    if (tabId === 'notebook') {
      setTimeout(() => document.getElementById('hub-notebook-textarea')?.focus(), 60);
    }
  }
  window.__openPuzzleHubTab = openPuzzleHubTab;

  document.getElementById('btn-open-puzzle-hub')?.addEventListener('click', () => {
    if (puzzleHubModal?.classList.contains('hidden')) {
      openPuzzleHubTab('focus');
    } else {
      puzzleHubModal?.classList.add('hidden');
    }
  });
  document.getElementById('btn-triumph-open-hub')?.addEventListener('click', () => openPuzzleHubTab('focus'));
  document.getElementById('btn-close-puzzle-hub')?.addEventListener('click', () => puzzleHubModal?.classList.add('hidden'));

  document.querySelectorAll('[data-hub-tab]').forEach(btn => {
    btn.addEventListener('click', () => openPuzzleHubTab(btn.dataset.hubTab));
  });

  // 1. Focus Timer & Anti-AFK Random Heartbeat Check (方尧平 PZ-A1 & PZ-G1)
  function updateFocusClockUI() {
    const clockEl = document.getElementById('hub-focus-clock');
    const sessEl = document.getElementById('hub-focus-session-pts');
    const badgeEl = document.getElementById('focus-running-badge');
    const toggleBtn = document.getElementById('btn-hub-focus-toggle');
    const nextHbEl = document.getElementById('hub-hb-next-status');

    const hrs = String(Math.floor(puzzleRuntime.focusSessionSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((puzzleRuntime.focusSessionSec % 3600) / 60)).padStart(2, '0');
    const secs = String(puzzleRuntime.focusSessionSec % 60).padStart(2, '0');
    if (clockEl) clockEl.textContent = `${hrs}:${mins}:${secs}`;
    if (sessEl) {
      sessEl.textContent = `本轮已实时计入：+${Math.round(puzzleRuntime.focusSessionPendingPts)} PTS（本月专注总分：${Math.round(puzzleState.monthlyFocusScore)} PTS）`;
    }
    if (badgeEl) {
      badgeEl.textContent = puzzleRuntime.focusRunning
        ? '🔥 专注吸取中 · 防挂机巡检已布防'
        : '⏸️ 待机中 · 点头或下方按钮开启';
      badgeEl.style.background = puzzleRuntime.focusRunning ? 'rgba(34,197,94,0.22)' : 'rgba(148,163,184,0.2)';
      badgeEl.style.color = puzzleRuntime.focusRunning ? '#4ade80' : '#cbd5e1';
    }
    if (toggleBtn) {
      toggleBtn.textContent = puzzleRuntime.focusRunning
        ? '⏸️ 暂停专注计时 (安全保留已得积分)'
        : '▶️ 开启沉浸专注计时 (每秒自动累加赛季总分)';
    }
    if (nextHbEl) {
      nextHbEl.textContent = puzzleRuntime.hbActive
        ? `🚨 正在倒计时签到 (${puzzleRuntime.hbCountdownSec}s)！点击立得 +150 PTS！`
        : (puzzleRuntime.focusRunning ? `将在随机时刻触发签到奖励 (约 ${puzzleRuntime.nextHeartbeatInSec}s 内)` : '开启专注后随机降临');
    }
  }

  function triggerHeartbeatCheckNow() {
    puzzleRuntime.hbActive = false;
    if (hbBanner) hbBanner.classList.add('hidden');
  }

  function confirmHeartbeatCheck() {
    if (!puzzleRuntime.hbActive) return;
    puzzleRuntime.hbActive = false;
    puzzleRuntime.nextHeartbeatInSec = 55 + Math.floor(Math.random() * 65);
    if (hbBanner) hbBanner.classList.add('hidden');
    const bonus = Math.round(150 * getActivePuzzleMultiplier());
    puzzleState.monthlyFocusScore += bonus;
    puzzleRuntime.focusSessionPendingPts += bonus;
    puzzleState.heartbeatPassedCount += 1;
    puzzleState.auditLogs.unshift(`• [在线签到通过] 专注在线核验成功 (剩余${puzzleRuntime.hbCountdownSec}s) · +${bonus} PTS`);
    savePuzzleScoreState();
    soundEngine.playSummon(true);
    updateFocusClockUI();
    refreshPuzzleHubUI();
    showToast(`✅ 专注在线签到通过！获得暴击奖励 +${bonus} PTS（本月总分 ${getMonthlyTotalScore()} PTS）`);
  }
  window.__confirmPuzzleHeartbeatCheck = confirmHeartbeatCheck;

  function togglePuzzleFocusTimer(source = 'ui') {
    if (puzzleRuntime.hbActive) {
      confirmHeartbeatCheck();
      return;
    }
    puzzleRuntime.focusRunning = !puzzleRuntime.focusRunning;
    if (puzzleRuntime.focusRunning) {
      puzzleRuntime.nextHeartbeatInSec = 40 + Math.floor(Math.random() * 45);
      soundEngine.playSummon(true);
      showToast('⏱️ 已开启【沉浸专注计时器】！桌上的静默标本陪你专心研习，每秒实时累加月度总分！');
    } else {
      const settled = Math.round(puzzleRuntime.focusSessionPendingPts);
      puzzleRuntime.focusSessionPendingPts = 0;
      puzzleRuntime.focusSessionSec = 0;
      savePuzzleScoreState();
      showToast(`💰 已暂停并结算本轮专注时长（本轮入账 +${settled} PTS · 本月总分 ${getMonthlyTotalScore()} PTS）`);
    }
    updateFocusClockUI();
    refreshPuzzleHubUI();
  }
  window.__togglePuzzleFocusTimer = togglePuzzleFocusTimer;

  document.getElementById('btn-hub-focus-toggle')?.addEventListener('click', () => togglePuzzleFocusTimer('hub'));
  document.getElementById('btn-hub-focus-settle')?.addEventListener('click', () => {
    if (puzzleRuntime.focusRunning) {
      togglePuzzleFocusTimer('settle');
    } else {
      showToast(`💰 当前本月专注分已安全落袋：${Math.round(puzzleState.monthlyFocusScore)} PTS`);
    }
  });
  document.getElementById('btn-hub-trigger-hb-test')?.addEventListener('click', () => triggerHeartbeatCheckNow());
  document.getElementById('btn-confirm-heartbeat-now')?.addEventListener('click', () => confirmHeartbeatCheck());
  document.getElementById('chk-hb-hardcore-wipe')?.addEventListener('change', (e) => {
    puzzleState.hardcoreWipeEnabled = Boolean(e.target.checked);
    savePuzzleScoreState();
  });

  // 2. Anti-Cheat Entropy Study Notebook (初夏 PZ-B1 & PZ-G2)
  const nbTextarea = document.getElementById('hub-notebook-textarea');
  function evaluateNotebookDraft() {
    const text = nbTextarea?.value || '';
    const audit = analyzeNotebookAntiCheat(text, puzzleRuntime.pastedCharsInDraft, puzzleRuntime.keystrokeIntervals);
    const mult = getActivePuzzleMultiplier();
    const previewPts = audit.isCheating ? 0 : Math.round(audit.validTypedChars * 2.0 * mult);

    const validEl = document.getElementById('nb-stat-valid');
    const entEl = document.getElementById('nb-stat-entropy');
    const pasteEl = document.getElementById('nb-stat-pasted');
    const prevBtnEl = document.getElementById('nb-preview-pts');
    const badgeEl = document.getElementById('nb-grade-badge');
    const verdictEl = document.getElementById('nb-anticheat-verdict');

    if (validEl) validEl.textContent = `${audit.validTypedChars} 字`;
    if (entEl) entEl.textContent = `${audit.entropy.toFixed(2)} bits`;
    if (pasteEl) pasteEl.textContent = `${audit.pastedChars || 0} 字`;
    if (prevBtnEl) prevBtnEl.textContent = String(previewPts);
    if (badgeEl) {
      badgeEl.textContent = audit.grade;
      badgeEl.style.background = audit.isCheating ? 'rgba(239,68,68,0.28)' : 'rgba(16,185,129,0.22)';
      badgeEl.style.color = audit.isCheating ? '#fca5a5' : '#6ee7b7';
    }
    if (verdictEl) {
      verdictEl.textContent = audit.statusLabel;
      verdictEl.style.borderColor = audit.isCheating ? '#f87171' : 'rgba(52,211,153,0.35)';
      verdictEl.style.color = audit.isCheating ? '#fecaca' : '#a7f3d0';
    }
    return { audit, previewPts };
  }

  nbTextarea?.addEventListener('paste', (e) => {
    const pasted = (e.clipboardData || window.clipboardData)?.getData('text') || '';
    const cleanLen = pasted.replace(/\s+/g, '').length;
    puzzleRuntime.pastedCharsInDraft += cleanLen;
    setTimeout(evaluateNotebookDraft, 20);
    showToast(`🔍【初夏·防粘贴审计】检测到粘贴 ${cleanLen} 字，已自动隔离粘贴水字数，仅真实手敲计分！`);
  });

  nbTextarea?.addEventListener('keydown', (e) => {
    if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Enter') {
      const now = performance.now();
      const ts = puzzleRuntime.keystrokeTimestamps;
      if (ts.length > 0) {
        const dt = now - ts[ts.length - 1];
        puzzleRuntime.keystrokeIntervals.push(dt);
        if (puzzleRuntime.keystrokeIntervals.length > 30) puzzleRuntime.keystrokeIntervals.shift();
      }
      ts.push(now);
      if (ts.length > 30) ts.shift();
    }
  });

  nbTextarea?.addEventListener('input', () => evaluateNotebookDraft());

  document.getElementById('btn-nb-sample-good')?.addEventListener('click', () => {
    if (!nbTextarea) return;
    puzzleRuntime.pastedCharsInDraft = 0;
    puzzleRuntime.keystrokeIntervals = [115, 148, 92, 180, 134, 210, 98, 164, 142, 128, 175, 109];
    nbTextarea.value = '【今日硬核研习复盘】1. 微积分拉格朗日中值定理与柯西中值定理的几何意义对比：若函数f(x)在闭区间连续、开区间可导，则必存在一点ξ使得切线斜率等于割线斜率；2. WebGL2 着色器双瓣各向异性高光需沿切线副切线做纵向偏移；3. 今日已完成全部核心模块推导与默写。';
    evaluateNotebookDraft();
  });

  document.getElementById('btn-nb-sample-cheat')?.addEventListener('click', () => {
    if (!nbTextarea) return;
    puzzleRuntime.pastedCharsInDraft = 0;
    nbTextarea.value = 'aaaaaaaaaaaaaaaaaaaaaaaa123123123123123123asdfasdfasdfasdf';
    evaluateNotebookDraft();
    showToast('🚫 已填入乱敲水字样本：香农信息熵低于 2.1 bits，系统已自动拦截并判定 0 分！');
  });

  document.getElementById('btn-nb-commit-score')?.addEventListener('click', () => {
    const { audit, previewPts } = evaluateNotebookDraft();
    if (audit.isCheating || previewPts <= 0) {
      showToast('🚫 提交失败：当前笔记未通过反作弊信息熵核验或有效手敲字数为 0！');
      return;
    }
    puzzleState.monthlyNotebookScore += previewPts;
    puzzleState.totalValidNotebookChars += audit.validTypedChars;
    puzzleState.lastNotebookEntropy = audit.entropy;
    const snippet = (nbTextarea.value || '').trim().slice(0, 18).replace(/\s+/g, ' ');
    puzzleState.auditLogs.unshift(
      `• [笔记入库] "${snippet}..." · ${audit.validTypedChars}有效字 · 熵${audit.entropy}(${audit.grade.split('·')[0].trim()}) · +${previewPts} PTS`
    );
    nbTextarea.value = '';
    puzzleRuntime.pastedCharsInDraft = 0;
    savePuzzleScoreState();
    evaluateNotebookDraft();
    refreshPuzzleHubUI();
    soundEngine.playSummon(true);
    showToast(`📓 研习笔记已通过反作弊核验入库！获得 +${previewPts} PTS（本月总分 ${getMonthlyTotalScore()} PTS）`);
  });

  // 3. Survivor Dopamine Siphon & Deadline Guillotine Bounty (林汐 PZ-C1)
  function triggerVictorSiphonAction() {
    const decl = SURVIVOR_VICTORY_DECLARATIONS[puzzleRuntime.declIdx % SURVIVOR_VICTORY_DECLARATIONS.length];
    puzzleRuntime.declIdx += 1;
    const customInput = document.getElementById('victor-anxiety-input')?.value?.trim();
    const pts = 180;
    puzzleState.monthlyVictorScore += pts;
    puzzleRuntime.victorBuffUntilMs = Date.now() + 15 * 60 * 1000;

    const titleEl = document.getElementById('victor-decl-title');
    const quoteDom = document.getElementById('victor-decl-quote');
    const buffDom = document.getElementById('victor-decl-buff');
    if (titleEl) titleEl.textContent = decl.title;
    if (quoteDom) {
      quoteDom.textContent = customInput
        ? `【已将你的焦虑「${customInput}」踩碎在标本底座下】：${decl.quote}`
        : decl.quote;
    }
    if (buffDom) buffDom.textContent = decl.buffNote;
    if (document.getElementById('victor-anxiety-input')) {
      document.getElementById('victor-anxiety-input').value = '';
    }

    puzzleState.auditLogs.unshift(`• [胜者精神汲取] 粉碎负面内耗激活15分钟×1.4亢奋加成 · +${pts} PTS`);
    savePuzzleScoreState();
    soundEngine.playSummon(true);
    refreshPuzzleHubUI();
    showToast(`⚡【我是活人胜利者】精神能量汲取成功！+${pts} PTS & 激活 15 分钟 ×1.40 全场积分暴击！`);
  }
  window.__triggerVictorSiphonAction = triggerVictorSiphonAction;

  document.getElementById('btn-victor-siphon-now')?.addEventListener('click', () => triggerVictorSiphonAction());

  document.getElementById('btn-bounty-start')?.addEventListener('click', () => {
    puzzleRuntime.bountyRunning = true;
    puzzleRuntime.bountyRemainingSec = 15 * 60;
    const tagEl = document.getElementById('bounty-status-tag');
    if (tagEl) tagEl.textContent = '🔥 死线悬赏进行中！切勿摸鱼！';
    soundEngine.playSummon(true);
    showToast('🩸 已立下 15 分钟死线斩首军令状！倒计时前完成立得 +380 PTS！');
  });

  document.getElementById('btn-bounty-complete')?.addEventListener('click', () => {
    const taskName = document.getElementById('bounty-task-input')?.value?.trim() || '限时核心任务';
    const reward = Math.round(380 * getActivePuzzleMultiplier());
    puzzleRuntime.bountyRunning = false;
    puzzleRuntime.bountyRemainingSec = 15 * 60;
    puzzleState.monthlyVictorScore += reward;
    const tagEl = document.getElementById('bounty-status-tag');
    if (tagEl) tagEl.textContent = `✅ 已斩首完成 (+${reward} PTS)`;
    puzzleState.auditLogs.unshift(`• [死线任务斩首] 完成「${taskName.slice(0, 16)}」 · +${reward} PTS`);
    savePuzzleScoreState();
    soundEngine.playSummon(true);
    refreshPuzzleHubUI();
    showToast(`🗡️ 死线悬赏任务斩首成功！狂揽 +${reward} PTS（本月总分 ${getMonthlyTotalScore()} PTS）`);
  });

  // 4. BOOTH Prize Pool & Modular Puzzle Slot Selector Wiring
  document.getElementById('pool-sub-count')?.addEventListener('input', (e) => {
    puzzleState.subscriberCount = Math.max(10, Number(e.target.value || 200));
    savePuzzleScoreState();
    refreshPuzzleHubUI();
  });

  function populatePuzzleSelectors() {
    const headSel = document.getElementById('puzzle-head-select');
    const actSel = document.getElementById('puzzle-slot-active');
    const pasSel = document.getElementById('puzzle-slot-passive');
    const grdSel = document.getElementById('puzzle-slot-guard');
    if (!headSel || !actSel || !pasSel || !grdSel) return;

    const prevVal = headSel.value;
    headSel.innerHTML = state.collectibles.map(c => {
      const shortN = c.name.split('·')[0].trim();
      const auraN = c.customAuraTitle || '可自由定义反差人设';
      return `<option value="${c.id}" ${c.id === prevVal ? 'selected' : ''}>${c.id} · ${shortN} (${auraN})</option>`;
    }).join('');
    const curHeadId = headSel.value || state.collectibles[0]?.id || 'SPEC-2026-FYP';
    const loadout = getHeadLoadout(curHeadId);

    actSel.innerHTML = PUZZLE_SKILL_CATALOG.filter(p => p.slot === PUZZLE_SKILL_SLOTS.ACTIVE_TRIGGER)
      .map(p => `<option value="${p.code}" ${p.code === loadout.activeTrigger ? 'selected' : ''}>[${p.code}] ${p.name} — ${p.baseRateDesc}</option>`).join('');
    pasSel.innerHTML = PUZZLE_SKILL_CATALOG.filter(p => p.slot === PUZZLE_SKILL_SLOTS.PASSIVE_BUFF)
      .map(p => `<option value="${p.code}" ${p.code === loadout.passiveBuff ? 'selected' : ''}>[${p.code}] ${p.name}</option>`).join('');
    grdSel.innerHTML = PUZZLE_SKILL_CATALOG.filter(p => p.slot === PUZZLE_SKILL_SLOTS.ANTICHEAT_GUARD)
      .map(p => `<option value="${p.code}" ${p.code === loadout.anticheatGuard ? 'selected' : ''}>[${p.code}] ${p.name}</option>`).join('');
  }
  populatePuzzleSelectors();

  document.getElementById('puzzle-head-select')?.addEventListener('change', () => {
    populatePuzzleSelectors();
    refreshPuzzleHubUI();
  });
  ['puzzle-slot-active', 'puzzle-slot-passive', 'puzzle-slot-guard'].forEach(selId => {
    document.getElementById(selId)?.addEventListener('change', () => {
      const headId = document.getElementById('puzzle-head-select')?.value || 'SPEC-2026-FYP';
      const loadout = getHeadLoadout(headId);
      loadout.activeTrigger = document.getElementById('puzzle-slot-active')?.value || loadout.activeTrigger;
      loadout.passiveBuff = document.getElementById('puzzle-slot-passive')?.value || loadout.passiveBuff;
      loadout.anticheatGuard = document.getElementById('puzzle-slot-guard')?.value || loadout.anticheatGuard;
      savePuzzleScoreState();
      refreshPuzzleHubUI();
      showToast(`🧩 已更新「${headId}」的拼图技能槽配置并重新生成 BOOTH 识别 KEY！`);
    });
  });

  document.getElementById('btn-copy-settlement-hash')?.addEventListener('click', () => {
    const keyTxt = document.getElementById('booth-generated-key')?.textContent || '';
    const hashTxt = document.getElementById('booth-settlement-hash')?.textContent || '';
    const combined = `【CERVIX-3D 月底结算回执】${hashTxt}\n【当前头模拼图KEY】${keyTxt}`;
    navigator.clipboard?.writeText(combined).catch(() => {});
    showToast('📋 已复制月底客服核验哈希回执码与头模拼图 KEY！');
  });

  refreshPuzzleHubUI();
  updateFocusClockUI();

  // ==========================================================================
  // STAGE 55: DIRECT 3D DESKTOP TACTILE PLAYABILITY ("更多爽，不要不爽，死人不要说话，直接设计为捏脸/扒眼皮/掰嘴/点涂体液把玩玩法")
  // ==========================================================================
  const popupLayer = document.getElementById('dopamine-floating-popups');
  const tactileToast = document.getElementById('tactile-sculpt-hud-toast');
  let tactileToastTimer = null;
  let lastTactilePtsTime = 0;

  function spawnDopaminePopup() {
    return;
  }

  function showTactileToast() {
    if (tactileToast) tactileToast.classList.add('hidden');
    return;
  }

  function setDesktopTactilePlayMode(mode = 'move', focusPetId = null) {
    if (!desktopEngine) return;
    desktopEngine.tactilePlayMode = mode;
    document.querySelectorAll('[data-tactile-mode]').forEach(btn => {
      btn.classList.toggle('active-top', btn.dataset.tactileMode === mode);
    });
    document.querySelectorAll('[data-placard-pinch]').forEach(btn => {
      const active = mode === 'pinch_face' && (!focusPetId || btn.dataset.placardPinch === focusPetId);
      btn.style.background = active ? 'rgba(236,72,153,0.35)' : '';
    });
    const modeMeta = DESKTOP_TACTILE_PLAY_MODES.find(m => m.id === mode) || DESKTOP_TACTILE_PLAY_MODES[0];
    showTactileToast(
      `🎮 已切换桌面鼠标模式：${modeMeta.label}`,
      modeMeta.desc,
      '桌面直接把玩 ✨'
    );
  }
  window.__setDesktopTactilePlayMode = setDesktopTactilePlayMode;

  document.querySelectorAll('[data-tactile-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      setDesktopTactilePlayMode(btn.dataset.tactileMode || 'move');
    });
  });

  if (desktopEngine) {
    desktopEngine.onTactileManipulate = ({ pet, mode, zone, partLabel, clientX, clientY }) => {
      const shortName = (pet?.collectible?.name || '标本').split('·')[0].trim();
      const now = performance.now();
      let pts = 0;
      if (now - lastTactilePtsTime > 260) {
        lastTactilePtsTime = now;
        pts = Math.round(15 * getActivePuzzleMultiplier());
        puzzleState.monthlyVictorScore += pts;
        savePuzzleScoreState();
        refreshPuzzleHubUI();
        spawnDopaminePopup(`⚡ ${partLabel.split(' ')[0]} +${pts} PTS ✨`, clientX, clientY);
      }
      const silentNote = getNextSilentPlayObservation(zone);
      const modeIcon = mode === 'paint_fluid' ? '🩸' : (mode === 'roll_eyeball' ? '👁️' : (mode === 'groom_hair' ? '🪮' : (mode === 'bow_gaze' ? '🙇‍♀️' : '🤏')));
      showTactileToast(
        `${modeIcon} 正在把玩【${shortName}】：${partLabel}`,
        silentNote,
        pts > 0 ? `+${pts} PTS ✨` : '实时把玩中 ✨'
      );
      // Persist updated morphs to state.collectibles
      const col = state.collectibles.find(c => c.id === pet?.id);
      if (col && pet?.collectible?.morphs) {
        col.morphs = { ...col.morphs, ...pet.collectible.morphs };
      }
    };
  }

  window.__triggerPetDesktopEyeballCycle = (petId, clientX, clientY) => {
    const pet = desktopEngine?.pets?.get(petId);
    if (!pet) return;
    desktopEngine.applyTactileEyeballDelta(pet, 0, 0, true, clientX, clientY);
  };

  window.__triggerPetDesktopHairLift = (petId, clientX, clientY) => {
    const pet = desktopEngine?.pets?.get(petId);
    if (!pet) return;
    desktopEngine.applyTactileHairGroomDelta(pet, 0, 0, true, clientX, clientY);
  };

  const FLUID_PLAY_PRESETS = [
    { label: '💧 梨花带雨 (清泪+哭红眼鼻)', neck: 0.85, tear: 0.92, tearType: 0, nose: 0.0, mouth: 0.0, splat: 0.0 },
    { label: '🥀 凄美鼻血+眼角清泪', neck: 0.90, tear: 0.78, tearType: 0, nose: 0.88, mouth: 0.0, splat: 0.0 },
    { label: '🩸 猩红血泪+双侧嘴角溢血', neck: 0.98, tear: 0.96, tearType: 2, nose: 0.45, mouth: 0.86, splat: 0.28 },
    { label: '⚔️ 重度断首战损 (鼻血+血泪+溅血)', neck: 1.22, tear: 1.05, tearType: 2, nose: 1.02, mouth: 0.96, splat: 0.90 },
    { label: '✨ 擦拭干净 (仅保留C4断面微血)', neck: 0.65, tear: 0.0, tearType: 0, nose: 0.0, mouth: 0.0, splat: 0.0 },
  ];
  const petFluidCycleIdx = {};

  window.__cyclePetDesktopFluidPreset = (petId, clientX, clientY) => {
    const pet = desktopEngine?.pets?.get(petId);
    const col = state.collectibles.find(c => c.id === petId);
    if (!pet || !col) return;
    const idx = ((petFluidCycleIdx[petId] ?? -1) + 1) % FLUID_PLAY_PRESETS.length;
    petFluidCycleIdx[petId] = idx;
    const p = FLUID_PLAY_PRESETS[idx];

    col.neckBloodStrength = pet.collectible.neckBloodStrength = p.neck;
    col.tearTrackStrength = pet.collectible.tearTrackStrength = p.tear;
    col.tearType = pet.collectible.tearType = p.tearType;
    col.nosebleedStrength = pet.collectible.nosebleedStrength = p.nose;
    col.mouthBloodStrength = pet.collectible.mouthBloodStrength = p.mouth;
    col.faceSplatterStrength = pet.collectible.faceSplatterStrength = p.splat;
    col.morphs = {
      ...(col.morphs || {}),
      neckBloodStrength: p.neck,
      tearTrackStrength: p.tear,
      tearType: p.tearType,
      nosebleedStrength: p.nose,
      mouthBloodStrength: p.mouth,
      faceSplatterStrength: p.splat,
    };
    pet.collectible.morphs = { ...col.morphs };
    updateCollectibleMaterialsLive(pet.node, pet.collectible);
    desktopEngine.wakeRender(1.5, true);

    const pts = Math.round(45 * getActivePuzzleMultiplier());
    puzzleState.monthlyVictorScore += pts;
    savePuzzleScoreState();
    refreshPuzzleHubUI();
    const shortName = col.name.split('·')[0].trim();
    spawnDopaminePopup(`🩸 ${shortName}·${p.label.split(' ')[1]} +${pts} PTS ✨`, clientX, clientY);
    showTactileToast(
      `🩸 桌面直接点染【${shortName}】：${p.label}`,
      '【静默标本 · 凄美体液】已直接在 3D 头颅表面更新泪痕、血泪、鼻血与颈部断面鲜血度（也可点击顶部【🩸点涂鼻血/泪痕】用鼠标亲手点涂具体五官）。',
      `+${pts} PTS ✨`
    );
  };

  window.__cyclePetDesktopDeadExpression = (petId, clientX, clientY) => {
    const pet = desktopEngine?.pets?.get(petId);
    const col = state.collectibles.find(c => c.id === petId);
    if (!pet || !col) return;
    const exprList = FORENSIC_EXPRESSION_PRESETS;
    const curExpr = col.deadExpression || col.morphs?.deadExpression || 'dead_calm';
    const curIdx = exprList.findIndex(e => e.id === curExpr);
    const nextPreset = exprList[(curIdx + 1) % exprList.length] || exprList[0];

    col.deadExpression = nextPreset.id;
    col.morphs = {
      ...(col.morphs || {}),
      deadExpression: nextPreset.id,
      jawOpen: nextPreset.jawOpen,
      eyeRollUp: nextPreset.eyeRollUp,
      tongueOut: nextPreset.tongueOut,
      jawSide: nextPreset.jawSide,
      eyelidOpen: nextPreset.eyelidOpen,
      browAngle: nextPreset.browAngle,
      mouthCorner: nextPreset.mouthCorner,
    };
    pet.collectible.deadExpression = nextPreset.id;
    pet.collectible.morphs = { ...col.morphs };
    applyHeadMorphsToGroup(pet.node, col.morphs);
    desktopEngine.wakeRender(1.5, true);

    const pts = Math.round(45 * getActivePuzzleMultiplier());
    puzzleState.monthlyVictorScore += pts;
    savePuzzleScoreState();
    refreshPuzzleHubUI();
    const shortName = col.name.split('·')[0].trim();
    spawnDopaminePopup(`💀 ${shortName}·${nextPreset.shortLabel} +${pts} PTS ✨`, clientX, clientY);
    showTactileToast(
      `💀 桌面直接摆弄【${shortName}】死相：${nextPreset.label}`,
      `【静默标本 · 任由摆布】${nextPreset.desc}——她毫无知觉地保持着你设定的眼皮与唇齿开合度。`,
      `+${pts} PTS ✨`
    );
  };

  window.__togglePetDesktopBowPosture = (petId, clientX, clientY) => {
    const pet = desktopEngine?.pets?.get(petId);
    const col = state.collectibles.find(c => c.id === petId);
    if (!pet || !col) return;
    desktopEngine.applyTactileBowGazeDelta(pet, 0, 0, true, clientX, clientY);
  };

  window.__triggerPetDesktopChinLift = (petId, clientX, clientY) => {
    if (!desktopEngine) return;
    desktopEngine.performLinkedComfort3DAction('lift_chin', petId);
    const col = state.collectibles.find(c => c.id === petId);
    const displayName = col?.customDisplayName || (col?.name || '标本').split('·')[0].trim();
    const pts = Math.round(70 * getActivePuzzleMultiplier());
    puzzleState.monthlyVictorScore += pts;
    savePuzzleScoreState();
    refreshPuzzleHubUI();
    spawnDopaminePopup(`👆 挑起下巴审视 +${pts} PTS ✨`, clientX, clientY);
    showTactileToast(
      `👆 已挑起【${displayName}】下巴仰面18°接受单向审视`,
      getNextSilentPlayObservation('neck'),
      `+${pts} PTS ✨`
    );
  };

  const petAuraCycleIdx = {};
  window.__cyclePetSuperiorityAura = (petId, clientX, clientY) => {
    const col = state.collectibles.find(c => c.id === petId);
    if (!col) return;
    const idx = ((petAuraCycleIdx[petId] ?? -1) + 1) % UNIVERSAL_SUPERIORITY_AURA_TEMPLATES.length;
    petAuraCycleIdx[petId] = idx;
    const tpl = UNIVERSAL_SUPERIORITY_AURA_TEMPLATES[idx];
    col.customDisplayName = tpl.aliasName ? `${tpl.aliasName} · ${tpl.tagTitle}` : null;
    col.customAuraTitle = tpl.tagTitle;
    col.customSealBadge = tpl.sealBadge || '🔖 活人支配藏品 · 静默伴读中';
    col.customContrastText = tpl.contrastText;
    persistCollectibles();
    if (desktopEngine) {
      renderSpecimenPlacards(desktopEngine.getPlacardsScreenData());
    }
    populatePuzzleSelectors();

    const pts = Math.round(45 * getActivePuzzleMultiplier());
    puzzleState.monthlyVictorScore += pts;
    savePuzzleScoreState();
    refreshPuzzleHubUI();
    const displayHeadName = tpl.aliasName || col.name.split('·')[0].trim();
    spawnDopaminePopup(`🏷️ ${tpl.tagTitle} +${pts} PTS ✨`, clientX, clientY);
    showTactileToast(
      `🏷️ 已切换【${displayHeadName}】投射人设与封条：${tpl.sealBadge || tpl.tagTitle}`,
      `【${tpl.contrastText}】（预设名字与人设并非固定绑定，你也可以直接点击标牌上的名字或文字输入任何你想投射的人设！）`,
      `+${pts} PTS ✨`
    );
  };

  document.getElementById('btn-desktop-superiority-pulse')?.addEventListener('click', (ev) => {
    if (desktopEngine) {
      desktopEngine.triggerDesktopSuperiorityRelief();
    }
    const decl = SURVIVOR_VICTORY_DECLARATIONS[puzzleRuntime.declIdx % SURVIVOR_VICTORY_DECLARATIONS.length];
    puzzleRuntime.declIdx += 1;
    const pts = Math.round(120 * getActivePuzzleMultiplier());
    puzzleState.monthlyVictorScore += pts;
    puzzleRuntime.victorBuffUntilMs = Date.now() + 15 * 60 * 1000;
    // Automatically start or boost the calm focus study timer so superiority converts into study focus!
    let focusStartedMsg = '';
    if (!puzzleRuntime.focusRunning) {
      puzzleRuntime.focusRunning = true;
      puzzleRuntime.nextHeartbeatInSec = 55;
      updateFocusClockUI();
      focusStartedMsg = '（⏱️ 已同步为你开启沉浸专注计时，把优越感化为翻书动力！）';
    }
    savePuzzleScoreState();
    refreshPuzzleHubUI();
    soundEngine.playSummon(true);
    spawnDopaminePopup(`😮‍💨 全场俯首 · 活人优越感 +${pts} PTS ✨`, ev.clientX, ev.clientY);
    showTactileToast(
      `👑 ${decl.title}`,
      `${decl.quote}${focusStartedMsg}`,
      `+${pts} PTS & ×1.40 专注加成 ✨`
    );
  });

  document.getElementById('btn-desktop-lookdown-view')?.addEventListener('click', (ev) => {
    if (!desktopEngine) return;
    const isLookdown = desktopEngine.toggleLookdownDominanceView();
    const btn = document.getElementById('btn-desktop-lookdown-view');
    btn?.classList.toggle('active-top', isLookdown);
    if (btn) {
      btn.textContent = isLookdown ? '👣 俯视主宰: 开' : '👣 居高临下俯视';
    }
    const pts = Math.round(60 * getActivePuzzleMultiplier());
    puzzleState.monthlyVictorScore += pts;
    savePuzzleScoreState();
    refreshPuzzleHubUI();
    spawnDopaminePopup(isLookdown ? `👣 居高临下俯视 +${pts} PTS ✨` : `👀 平视伴读视角 +${pts} PTS ✨`, ev.clientX, ev.clientY);
    showTactileToast(
      isLookdown ? '👣 已开启【居高临下·上位者俯视视角】' : '👀 已恢复【书桌平视伴读视角】',
      isLookdown
        ? '镜头已抬升至你的视线高度俯视桌面，案头的3D断头藏品或低眉俯首、或从下方仰望你——生前再心高气傲的人，如今也只能在你的眼皮底下安静陪读。'
        : '镜头已恢复平视高度，可近距离端详或用鼠标捏脸把玩桌面上的3D头颅。',
      `+${pts} PTS ✨`
    );
  });

  // ==========================================================================
  // STAGE 58: 难受不舒服时随时点开看的【活人优越感 · 宽心手札】(#comfort-reader-drawer)
  // ==========================================================================
  const comfortDrawer = document.getElementById('comfort-reader-drawer');
  const comfortCatTabsEl = document.getElementById('comfort-category-tabs');
  const comfortArticleListEl = document.getElementById('comfort-article-list');
  const comfortTitleEl = document.getElementById('comfort-article-title');
  const comfortMoodEl = document.getElementById('comfort-article-mood');
  const comfortBodyEl = document.getElementById('comfort-article-body');
  const comfortAffirmEl = document.getElementById('comfort-article-affirmation');
  const comfortActionBtn = document.getElementById('btn-comfort-trigger-3d');
  const comfortPillTextEl = document.getElementById('comfort-quick-pill-text');

  let curComfortCatId = COMFORT_HANDBOOK_CATEGORIES[0]?.id || 'mocked';
  let curComfortArticleId = COMFORT_HANDBOOK_ARTICLES[0]?.id || 'mk_01';
  let curComfortPillIdx = 0;
  let curComfortTargetPetId = null;

  function renderComfortReader() {
    if (!comfortCatTabsEl || !comfortArticleListEl) return;
    comfortCatTabsEl.innerHTML = COMFORT_HANDBOOK_CATEGORIES.map(cat => {
      const active = cat.id === curComfortCatId;
      return `<button type="button" data-comfort-cat="${cat.id}" title="${cat.desc}" style="padding:4px 8px;border-radius:7px;font-size:11.5px;font-weight:700;cursor:pointer;border:1px solid ${active ? '#f472b6' : 'rgba(255,255,255,0.16)'};background:${active ? 'rgba(236,72,153,0.32)' : 'rgba(255,255,255,0.05)'};color:${active ? '#fdf2f8' : '#cbd5e1'};">${cat.label}</button>`;
    }).join('');

    comfortCatTabsEl.querySelectorAll('[data-comfort-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        curComfortCatId = btn.dataset.comfortCat;
        const firstArt = COMFORT_HANDBOOK_ARTICLES.find(a => a.category === curComfortCatId);
        if (firstArt) curComfortArticleId = firstArt.id;
        renderComfortReader();
      });
    });

    const catArticles = COMFORT_HANDBOOK_ARTICLES.filter(a => a.category === curComfortCatId);
    comfortArticleListEl.innerHTML = catArticles.map((art, i) => {
      const active = art.id === curComfortArticleId;
      return `<button type="button" data-comfort-art="${art.id}" style="text-align:left;padding:5px 9px;border-radius:6px;font-size:11.8px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:6px;border:1px solid ${active ? 'rgba(251,191,36,0.65)' : 'rgba(255,255,255,0.08)'};background:${active ? 'rgba(180,83,9,0.32)' : 'rgba(255,255,255,0.03)'};color:${active ? '#fef08a' : '#e2e8f0'};font-weight:${active ? '700' : '500'};">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${i + 1}. ${art.title}</span>
        <span style="font-size:10px;opacity:0.85;white-space:nowrap;color:#f9a8d4;">${art.moodTag}</span>
      </button>`;
    }).join('');

    comfortArticleListEl.querySelectorAll('[data-comfort-art]').forEach(btn => {
      btn.addEventListener('click', () => {
        curComfortArticleId = btn.dataset.comfortArt;
        renderComfortReader();
        const art = COMFORT_HANDBOOK_ARTICLES.find(a => a.id === curComfortArticleId);
        if (art && desktopEngine) {
          desktopEngine.performLinkedComfort3DAction(art.linked3DAction, curComfortTargetPetId);
        }
      });
    });

    const curArt = COMFORT_HANDBOOK_ARTICLES.find(a => a.id === curComfortArticleId) || COMFORT_HANDBOOK_ARTICLES[0];
    if (curArt) {
      if (comfortTitleEl) comfortTitleEl.textContent = curArt.title;
      if (comfortMoodEl) comfortMoodEl.textContent = curArt.moodTag;
      if (comfortBodyEl) {
        comfortBodyEl.innerHTML = curArt.paragraphs.map(p => {
          const formatted = String(p).replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#fde68a;font-weight:800;">$1</strong>');
          return `<p style="margin:0;text-indent:0;">${formatted}</p>`;
        }).join('');
      }
      if (comfortAffirmEl) comfortAffirmEl.textContent = curArt.affirmation;
      if (comfortActionBtn) comfortActionBtn.textContent = curArt.actionBtnLabel || '🎭 让桌上3D头颅配合本文动作 (+60 PTS)';
    }
  }
  renderComfortReader();

  function openComfortReaderDrawer() {
    if (comfortDrawer) comfortDrawer.classList.add('hidden');
  }
  window.__openComfortReaderDrawer = openComfortReaderDrawer;

  document.getElementById('btn-open-comfort-reader')?.addEventListener('click', () => {
    if (!comfortDrawer) return;
    if (comfortDrawer.classList.contains('hidden')) {
      openComfortReaderDrawer();
    } else {
      comfortDrawer.classList.add('hidden');
    }
  });

  document.getElementById('btn-close-comfort-reader')?.addEventListener('click', () => {
    comfortDrawer?.classList.add('hidden');
  });

  comfortActionBtn?.addEventListener('click', (ev) => {
    const curArt = COMFORT_HANDBOOK_ARTICLES.find(a => a.id === curComfortArticleId) || COMFORT_HANDBOOK_ARTICLES[0];
    if (curArt && desktopEngine) {
      desktopEngine.performLinkedComfort3DAction(curArt.linked3DAction, curComfortTargetPetId);
    }
    const pts = Math.round(60 * getActivePuzzleMultiplier());
    puzzleState.monthlyVictorScore += pts;
    savePuzzleScoreState();
    refreshPuzzleHubUI();
    spawnDopaminePopup(`🎭 头颅配合动作 +${pts} PTS ✨`, ev.clientX, ev.clientY);
    showTactileToast(
      `🎭 桌上3D头颅已配合执行：${curArt?.title || '宽心手札'}`,
      curArt?.affirmation || '在静默的标本面前，活着的你拥有绝对支配权。',
      `+${pts} PTS ✨`
    );
  });

  document.getElementById('btn-comfort-random-article')?.addEventListener('click', (ev) => {
    const others = COMFORT_HANDBOOK_ARTICLES.filter(a => a.id !== curComfortArticleId);
    const pick = others[Math.floor(Math.random() * others.length)] || COMFORT_HANDBOOK_ARTICLES[0];
    curComfortCatId = pick.category;
    curComfortArticleId = pick.id;
    renderComfortReader();
    if (desktopEngine) {
      desktopEngine.performLinkedComfort3DAction(pick.linked3DAction, curComfortTargetPetId);
    }
    const pts = Math.round(80 * getActivePuzzleMultiplier());
    puzzleState.monthlyVictorScore += pts;
    if (!puzzleRuntime.focusRunning) {
      puzzleRuntime.focusRunning = true;
      puzzleRuntime.nextHeartbeatInSec = 55;
      updateFocusClockUI();
    }
    savePuzzleScoreState();
    refreshPuzzleHubUI();
    spawnDopaminePopup(`📖 宽心爽文赋能 +${pts} PTS ✨`, ev.clientX, ev.clientY);
    showTactileToast(
      `📖 已为你翻开：${pick.title}`,
      pick.affirmation,
      `+${pts} PTS ✨`
    );
  });

  document.getElementById('btn-comfort-next-pill')?.addEventListener('click', (ev) => {
    curComfortPillIdx = (curComfortPillIdx + 1) % QUICK_COMFORT_PILLS.length;
    const pill = QUICK_COMFORT_PILLS[curComfortPillIdx];
    if (comfortPillTextEl) comfortPillTextEl.textContent = pill;
    const pts = Math.round(30 * getActivePuzzleMultiplier());
    puzzleState.monthlyVictorScore += pts;
    savePuzzleScoreState();
    refreshPuzzleHubUI();
    spawnDopaminePopup(`💊 速效强心针 +${pts} PTS ✨`, ev.clientX, ev.clientY);
  });

  // Stage 59: 1-Click 3D Status-Foil Formation Bar inside Comfort Reader
  document.querySelectorAll('[data-status-formation]').forEach((btn) => {
    btn.addEventListener('click', (ev) => {
      const fid = btn.dataset.statusFormation;
      const spec = DESKTOP_STATUS_FOIL_FORMATIONS.find(f => f.id === fid) || DESKTOP_STATUS_FOIL_FORMATIONS[0];
      if (desktopEngine) {
        desktopEngine.performLinkedComfort3DAction(spec.id, null);
      }
      const pts = Math.round((spec.pts || 90) * getActivePuzzleMultiplier());
      puzzleState.monthlyVictorScore += pts;
      savePuzzleScoreState();
      refreshPuzzleHubUI();
      spawnDopaminePopup(`${spec.shortLabel} +${pts} PTS ✨`, ev.clientX, ev.clientY);
      showTactileToast(spec.toastTitle, spec.toastSub, `+${pts} PTS ✨`);
    });
  });

  // Make #comfort-reader-drawer draggable by its header
  const comfortDragHeader = document.getElementById('comfort-reader-drag-header');
  if (comfortDragHeader && comfortDrawer) {
    let isDraggingComfort = false;
    let cStartX = 0, cStartY = 0, cInitLeft = 0, cInitTop = 0;
    comfortDragHeader.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      isDraggingComfort = true;
      const rect = comfortDrawer.getBoundingClientRect();
      cStartX = e.clientX;
      cStartY = e.clientY;
      cInitLeft = rect.left;
      cInitTop = rect.top;
      comfortDrawer.style.right = 'auto';
      comfortDrawer.style.left = `${cInitLeft}px`;
      comfortDrawer.style.top = `${cInitTop}px`;
      comfortDragHeader.setPointerCapture(e.pointerId);
    });
    comfortDragHeader.addEventListener('pointermove', (e) => {
      if (!isDraggingComfort) return;
      const nx = Math.max(8, Math.min(window.innerWidth - 320, cInitLeft + (e.clientX - cStartX)));
      const ny = Math.max(48, Math.min(window.innerHeight - 160, cInitTop + (e.clientY - cStartY)));
      comfortDrawer.style.left = `${nx}px`;
      comfortDrawer.style.top = `${ny}px`;
    });
    comfortDragHeader.addEventListener('pointerup', () => { isDraggingComfort = false; });
  }

  // Live 1-second Study Companion Timer, Focus Heartbeat Check & Energy Accumulation (zero GPU overhead)
  setInterval(() => {
    // 1. Focus Timer & Anti-AFK Random Heartbeat Countdown (Zero point wipe/deduction — pure positive reward!)
    if (puzzleRuntime.hbActive) {
      puzzleRuntime.hbCountdownSec -= 1;
      const cdEl = document.getElementById('hb-countdown-badge');
      if (cdEl) cdEl.textContent = `${Math.max(0, puzzleRuntime.hbCountdownSec)}s`;
      if (puzzleRuntime.hbCountdownSec <= 0) {
        puzzleRuntime.hbActive = false;
        puzzleRuntime.focusRunning = false;
        if (hbBanner) hbBanner.classList.add('hidden');
        savePuzzleScoreState();
        updateFocusClockUI();
        refreshPuzzleHubUI();
        showToast('⏸️ 专注巡检未点击，已自动为你暂停计时并 100% 保留全部已得积分（零扣分）！');
      } else {
        updateFocusClockUI();
      }
    } else if (puzzleRuntime.focusRunning) {
      puzzleRuntime.focusSessionSec += 1;
      const ptsPerSec = 0.5 * getActivePuzzleMultiplier(); // Base 30 PTS/min * multiplier
      puzzleRuntime.focusSessionPendingPts += ptsPerSec;
      puzzleState.monthlyFocusScore += ptsPerSec;
      puzzleRuntime.nextHeartbeatInSec -= 1;
      if (puzzleRuntime.nextHeartbeatInSec <= 0) {
        triggerHeartbeatCheckNow();
      } else {
        updateFocusClockUI();
        if (puzzleRuntime.focusSessionSec % 5 === 0) {
          savePuzzleScoreState();
          refreshPuzzleHubUI();
        }
      }
    }

    // 2. Deadline Guillotine Bounty Countdown (Zero point deduction!)
    if (puzzleRuntime.bountyRunning && puzzleRuntime.bountyRemainingSec > 0) {
      puzzleRuntime.bountyRemainingSec -= 1;
      const bMin = String(Math.floor(puzzleRuntime.bountyRemainingSec / 60)).padStart(2, '0');
      const bSec = String(puzzleRuntime.bountyRemainingSec % 60).padStart(2, '0');
      const bValEl = document.getElementById('bounty-timer-val');
      if (bValEl) bValEl.textContent = `${bMin}:${bSec}`;
      if (puzzleRuntime.bountyRemainingSec <= 0) {
        puzzleRuntime.bountyRunning = false;
        const tagEl = document.getElementById('bounty-status-tag');
        if (tagEl) tagEl.textContent = '⏸️ 本轮计时结束 (点击可随时领赏)';
        savePuzzleScoreState();
        refreshPuzzleHubUI();
      }
    }

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

    const totalPts = getMonthlyTotalScore();
    if (energyValEl) energyValEl.textContent = `${totalPts.toLocaleString()} PTS (x${getActivePuzzleMultiplier().toFixed(2)})`;
    if (barFillEl) barFillEl.style.width = `${Math.min(100, ((totalPts % 2500) / 2500) * 100)}%`;
  }, 1000);

  // Stage 43: Boot into DLSS-5 Neural Photorealistic Reconstruction preset
  applyVisualConfigAndSyncUI({ presetId: 'dlss5_neural_photoreal' }, true);
  syncVcdSelectedPetUI('SPEC-2026-FYP');
  renderPlacedStructuresList(desktopEngine.getPlacedStructuresList());

  // Arrange initial pets into the Study Companion shelf formation after initial load
  setTimeout(() => {
    if (desktopEngine && desktopEngine.pets.size > 0) {
      desktopEngine.applyPlacementFormation('study_companion_sides');
    }
  }, 250);

  const visualRepair = createVisualRepair({ desktop: desktopEngine, studio: studioEngine, notify: showToast });
  if (window.__cervixQA) window.__cervixQA.visualRepair = visualRepair;
  initObsidianProStudio();

  if (bootStatus) bootStatus.remove();
  if (window.__cervixQA) window.__cervixQA.ready = true;
  desktopEngine.booting = false;
  desktopEngine.wakeRender(1.5, true);
  } catch (error) {
    console.error('本地 3D 初始化失败', error);
    if (bootStatus) bootStatus.textContent = `启动失败：${String(error.message).slice(0, 160)}。请使用支持 WebGL2 的 Chrome/Edge 并开启硬件加速。`;
  }

});
