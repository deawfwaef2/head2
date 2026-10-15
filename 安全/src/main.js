// 安全版 · 写实收藏胸像桌宠工作室 —— 主程序
// 内容边界：活人自然神态的虚构成年角色 + 中性展示底座。详见 安全/HANDOFF_安全.md
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createStudioRig, createBackdrop, LIGHT_PRESETS } from './three/studioLighting.js';
import { upgradeSkinMaterial, setSkinParams } from './three/skinMaterial.js';
import { buildLashGeometry, buildBrowGeometry, createLashStrandMaterial, setLashStrandParams } from './three/lashStrands.js';
import { upgradeEyeMaterial, upgradeLashMaterial, setLashParams, upgradeBrowMaterial, buildHairMaterials, applyHairColor } from './three/featureMaterials.js';
import { createPostChain, createAccumulator, FILM_PRESETS, POST_DEFAULTS } from './three/postChain.js';
import { createDisplayStand, STAND_STYLES } from './three/displayStand.js';
import { BACKGROUNDS, backgroundTexture } from './three/backgrounds.js';
import { generateStrands, createStrandMaterial, setStrandParams, morphedHeadSoup, alphaSamplerFromTexture, scalpDistanceAttribute } from './three/strandHair.js';
import { HAIR_CATALOG, HAIR_GROUPS, HEAD_MODEL_ID } from './data/hairCatalog.js';
import { loadModelBytes } from './data/assetLoader.js';
import './style.css';
import { EFFECT_REGISTRY, EFFECT_GROUPS } from './data/effectRegistry.js';
import { createEffectBus } from './data/effectBus.js';
import { FACE_ARCHETYPES, FACE_REGIONS, EYE_SLIDERS, eyeSliderWeights } from './data/faceArchetypes.js';
import { applyFaceTargets, recipeWeights } from './three/faceTargets.js';
import { computeHairCoverage, buildBabyHairGeometry, HAIRLINE_DEFAULTS } from './three/hairlineBlend.js';
const HAIRS = HAIR_CATALOG;

const qs = new URLSearchParams(location.search);
const QA = qs.has('qa');
const $ = (id) => document.getElementById(id);
const STORE_KEY = 'safebust-studio-v1';
const SETTINGS_VER = 3;

// ---------------- 数据定义 ----------------
const HAIR_COLORS = {
  natural: { label: '自然黑棕', rgb: [0.025, 0.018, 0.015] },
  black: { label: '乌黑', rgb: [0.014, 0.012, 0.011] },
  brown: { label: '栗棕', rgb: [0.085, 0.045, 0.028] },
  tea: { label: '奶茶棕', rgb: [0.2, 0.12, 0.075] },
  ash: { label: '冷灰棕', rgb: [0.09, 0.08, 0.075] },
  honey: { label: '蜂蜜金棕', rgb: [0.32, 0.18, 0.08] },
  wine: { label: '酒红', rgb: [0.12, 0.03, 0.03] },
};
const DENSITY = {
  low: { label: '流畅（约 2 万根）', guides: 1500, childrenPerGuide: 10, fuzzPerGuide: 1.0 },
  mid: { label: '标准（约 5 万根）', guides: 2600, childrenPerGuide: 17, fuzzPerGuide: 1.6 },
  high: { label: '高精（约 9 万根）', guides: 3200, childrenPerGuide: 26, fuzzPerGuide: 2.2 },
  ultra: { label: '极致（约 15 万根，需独显）', guides: 3800, childrenPerGuide: 38, fuzzPerGuide: 3.0 },
};
const HEAD_SHAPES = [['mh_head_asian_youth', '东方青年'], ['mh_head_oval', '鹅蛋'], ['mh_head_heart', '心形'], ['mh_head_round', '圆润'], ['mh_head_melon', '瓜子'], ['mh_head_diamond', '菱形'], ['mh_head_eurasian', '欧亚立体']];
const FACE_SLIDERS = [['nose_width', '鼻翼宽窄'], ['nose_height', '鼻梁高低'], ['jaw_width', '下颌宽窄'], ['chin', '下巴长短'], ['cheekbones', '颧骨'], ['eye_size', '眼睛大小'], ['eye_tilt', '眼尾上扬'], ['lips', '嘴唇厚薄'], ['forehead', '额头'], ['ear_size', '耳朵大小']];
const SKIN_LABELS = { cn_scholar_natural: '自然素颜', cn_porcelain_ivory: '瓷白', kr_dewy_peach: '水光蜜桃', kr_firstlove_camellia: '初恋山茶', cn_jiangnan_jade: '温玉', kr_chaebol_cool: '冷调白皙', cn_intellectual_olive: '橄榄暖调', eurasian_velvet_rose: '玫瑰丝绒', young_asian: '青年原版', natural_makeup: '淡妆原版' };
const BROW_LABELS = { eyebrow010: '自然毛流眉', eyebrow003: '柳叶眉', eyebrow001: '平直眉', eyebrow002: '细弯眉', eyebrow004: '标准眉', eyebrow005: '细眉', eyebrow008: '浓眉', eyebrow012: '野生眉' };
const VIEWS = {
  portrait: { label: '胸像全景', pos: [0.3, 0.05, 1.32], target: [0, -0.028, 0], fov: 17 },
  front: { label: '正面肖像', pos: [0, 0.012, 1.05], target: [0, 0.005, 0], fov: 15 },
  threequarter: { label: '3/4 侧', pos: [-0.62, 0.05, 0.85], target: [0, 0.008, 0.01], fov: 15 },
  profile: { label: '侧面', pos: [-1.05, 0.02, 0.06], target: [0, 0.005, 0], fov: 15 },
  closeup: { label: '眼部特写', pos: [-0.1, 0.03, 0.52], target: [0, 0.018, 0.05], fov: 13 },
  hairline: { label: '发际线特写', pos: [-0.16, 0.1, 0.6], target: [0, 0.055, 0.05], fov: 13 },
  hairdetail: { label: '头发特写', pos: [-0.62, 0.1, 0.85], target: [-0.025, 0.02, 0.0], fov: 8.5 },
};
// 一键风格（布光 + 胶片 + 皮肤）
const LOOKS = {
  daylight: { label: '☀️ 室内日光', light: 'indoorDay', film: 'portra400', bg: 'roomWarm', skin: { scatter: 1.05, roughness: 0.55 }, dof: true },
  window: { label: '🪟 窗格光影', light: 'windowGobo', film: 'moodyFilm', bg: 'windowShadow', skin: { scatter: 1.15, roughness: 0.52 }, dof: true },
  golden: { label: '🌅 暖阳逆光', light: 'goldenBack', film: 'gold200', bg: 'goldenHour', skin: { scatter: 1.3, roughness: 0.5 }, dof: true },
  japan: { label: '🍃 日系清透', light: 'overcast', film: 'japanAiry', bg: 'sheerCurtain', skin: { scatter: 1.2, roughness: 0.58 }, dof: true },
  korean: { label: '🍦 韩系奶油', light: 'butterfly', film: 'koreanCream', bg: 'sheerCurtain', skin: { scatter: 1.25, roughness: 0.56 }, dof: true },
  hk: { label: '🏮 港风复古', light: 'cinematicTeal', film: 'hkRetro', bg: 'cityNight', skin: { scatter: 1.0, roughness: 0.48 }, dof: true },
  cafe: { label: '☕ 咖啡馆暖灯', light: 'rembrandt', film: 'portra400', bg: 'cafe', skin: { scatter: 1.15, roughness: 0.5 }, dof: true },
  leaf: { label: '🌿 树影午后', light: 'leafDapple', film: 'pro400h', bg: 'garden', skin: { scatter: 1.1, roughness: 0.54 }, dof: true },
  cine: { label: '🎬 好莱坞青橙', light: 'cinematicTeal', film: 'tealOrange', bg: 'cityNight', skin: { scatter: 1.0, roughness: 0.5 }, dof: true },
  oil: { label: '🖼 古典油画', light: 'rembrandt', film: 'oilPainting', bg: 'grayWall', skin: { scatter: 1.1, roughness: 0.55 }, dof: false },
  studio: { label: '📸 棚拍精修', light: 'softbox', film: 'phonePortrait', bg: 'studio', skin: { scatter: 1.0, roughness: 0.56 }, dof: false },
  mono: { label: '🖤 黑白经典', light: 'rembrandt', film: 'trix400', bg: 'grayWall', skin: { scatter: 0.9, roughness: 0.52 }, dof: false },
};

// 画质档位：决定分辨率上限、抗锯齿、AO 采样、阴影精度、发丝密度
const QUALITY = {
  smooth: { label: '流畅（核显/笔记本）', pr: 1.0, msaa: 0, ao: 8, shadow: 2048, density: 'low', hairMode: 'strand', accum: 12 },
  balanced: { label: '均衡（推荐）', pr: 1.25, msaa: 2, ao: 12, shadow: 2048, density: 'mid', hairMode: 'strand', accum: 20 },
  high: { label: '高画质（独显）', pr: 1.5, msaa: 4, ao: 16, shadow: 4096, density: 'high', hairMode: 'strand', accum: 28 },
  ultra: { label: '极致（高端独显）', pr: 2.0, msaa: 4, ao: 16, shadow: 4096, density: 'ultra', hairMode: 'strand', accum: 40 },
};
function defaultCharacter() {
  return {
    id: 'B' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: '未命名胸像', note: '', created: Date.now(), thumb: '',
    look: 'window',
    shape: { mh_head_asian_youth: 0.65 },
    face: Object.fromEntries(FACE_SLIDERS.map(([k]) => [k, 0])),
    expr: { smile: 0.0, serene: 0.15, browUp: 0 },
    skin: 'cn_scholar_natural', brow: 'eyebrow010',
    hair: HAIRS[0].id, hairColor: 'natural', hairCustom: '',
    hairShine: 1, hairBack: 1, lashStrands: true, lashDensity: 1, lashLower: 0.65, lashDark: 0.9, lashLine: 0.6, browStrands: true, browDensity: 1, browBase: 0.45,
    stand: 'obsidian',
    light: 'windowGobo', lightOv: { azimuth: 0, elevation: 0, keyMul: 1, softMul: 1, kelvin: 0, rimMul: 1, fillMul: 1, envMul: 1, exposureMul: 1, gobo: 'preset', goboScale: 1, goboSoft: 0.5, bgMul: 0.55, shadowStrength: 0.8, shadowSoft: 1.3 },
    skinP: { scatter: 1.15, roughness: 0.52, normalScale: 0.3, sheen: 0.1, dualLobe: 0.07, albedoSaturation: 1.22, micro: 0.55, breakup: 0.5, mottle: 0.5, regional: 0.7, translucency: 0.8, delight: 0.75, normalHP: 1 },
    film: 'moodyFilm', bg: 'windowShadow', post: { dof: true, aperture: 0.0016 }, eyeOcc: 0.75,
    hairline: { ...HAIRLINE_DEFAULTS }, fx: { bypass: {}, links: [] },
    faceArch: 'none', faceArchK: 0.6, eyeShape: {},
  };
}
function defaultSettings() {
  return { quality: 'auto', hairMode: 'strand', density: 'low', pixelRatio: 0, shadowRes: 2048, blink: true, idle: true, toneMap: 'neutral', petSize: 340, ao: true, msaa: 2, interactScale: 0.6, maxFps: 60, accum: true, hairLOD: true, hairShadow: true };
}
function loadStore() {
  try { const s = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); if (s && Array.isArray(s.items)) return s; } catch (e) { /* ignore */ }
  return { items: [], current: null, settings: defaultSettings() };
}
const store = loadStore();
store.settings = (store.settings && store.settings.ver === SETTINGS_VER) ? { ...defaultSettings(), ...store.settings } : { ...defaultSettings(), ver: SETTINGS_VER }; // 旧版设置太重，升级时重置画质
let storageOK = true;
function saveStore() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); storageOK = true; } catch (e) { storageOK = false; toast('浏览器禁止本地存储，本次修改只保留在当前会话'); }
}
let ch = (store.current && store.items.find((x) => x.id === store.current)) ? structuredClone(store.items.find((x) => x.id === store.current)) : defaultCharacter();
ch = { ...defaultCharacter(), ...ch, lightOv: { ...defaultCharacter().lightOv, ...(ch.lightOv || {}) }, skinP: { ...defaultCharacter().skinP, ...(ch.skinP || {}) } };
const S = store.settings;
function normalizeChar(c) { const d = defaultCharacter(); if (c.skinP && c.skinP.normalScale === 0.8) c.skinP.normalScale = 0.3; /* 旧默认值会放大法线贴图里的脏斑 */ c.hairline = { ...d.hairline, ...(c.hairline || {}) }; for (const k of ['browStrands', 'browDensity', 'browBase', 'lashStrands', 'lashDensity', 'lashLower', 'lashDark', 'lashLine', 'eyeOcc', 'hairShine', 'hairBack']) if (c[k] == null) c[k] = d[k]; c.fx = { bypass: { ...(c.fx?.bypass || {}) }, links: [...(c.fx?.links || [])] }; return c; }
normalizeChar(ch);

// ---------------- 效果总线：所有画面效果 = 可开关 / 可调 / 可连线的节点 ----------------
const fxBus = createEffectBus({
  registry: EFFECT_REGISTRY,
  state: () => ch.fx,
  read: (e) => {
    switch (e.scope) {
      case 'post': return e.key === 'autoFocus' ? ch.post.autoFocus !== false : postRaw()[e.key];
      case 'skin': return ch.skinP[e.key];
      case 'hairline': return ch.hairline[e.key];
      case 'light': return ch.lightOv[e.key];
      case 'char': return ch[e.key];
      case 'render': return S[e.key] !== false;
    }
    return undefined;
  },
  write: (e, v) => {
    switch (e.scope) {
      case 'post': ch.post[e.key] = v; break;
      case 'skin': ch.skinP[e.key] = v; break;
      case 'hairline': ch.hairline[e.key] = v; break;
      case 'light': ch.lightOv[e.key] = v; break;
      case 'char': ch[e.key] = v; break;
      case 'render': S[e.key] = v; saveStore(); break;
    }
  },
  apply: (scope, heavy) => applyScope(scope, heavy),
});
const fxOn = (id) => !!fxBus.effective(id);
function effScope(scope, obj) { const o = { ...obj }; for (const e of EFFECT_REGISTRY) if (e.scope === scope && !fxBus.isEnabled(e.id)) o[e.key] = e.off; return o; }
let babyT = 0;
function applyScope(scope, heavy) {
  if (!gltfHead) return;
  if (scope === 'post') repost();
  else if (scope === 'skin' || scope === 'hairline') { applySkinParams(); if (heavy) { clearTimeout(babyT); babyT = setTimeout(buildBabyHair, 200); } invalidate(); }
  else if (scope === 'light') relight();
  else if (scope === 'char') { (parts.eyes || []).forEach((e) => setupEyeOcclusion(e.material)); applyLashLook(); applyHairLook(); }
  else if (scope === 'render') { applyRenderToggles(); }
}
window.SafeBust = { debug: { get parts() { return parts; }, get scene() { return scene; }, get camera() { return camera; }, get renderer() { return renderer; }, get head() { return head; }, renderNow: (n = 1) => { accum?.reset(); for (let i = 0; i < n; i++) renderFrame(true); } }, fx: fxBus, get character() { return ch; }, settings: S, invalidate: () => invalidate(), registry: EFFECT_REGISTRY };

// ---------------- 渲染器 ----------------
const canvas = $('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: true });
const isSoftware = (() => { try { const gl = renderer.getContext(); const ext = gl.getExtension('WEBGL_debug_renderer_info'); const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''; return /swiftshader|llvmpipe|software/i.test(r); } catch (e) { return false; } })();
function qProfile() { const k = S.quality === 'auto' ? (isSoftware ? 'smooth' : 'balanced') : S.quality; return QUALITY[k] || QUALITY.balanced; }
let interacting = false;
let prOverride = 0;
function pixelRatio() {
  if (prOverride) return prOverride;
  const base = S.pixelRatio || Math.min(window.devicePixelRatio || 1, qProfile().pr);
  return interacting ? Math.max(0.5, base * S.interactScale) : base;
}
renderer.setPixelRatio(pixelRatio());
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.VSMShadowMap;
function applyQualityProfile(k) {
  S.quality = k; const q = qProfile();
  S.msaa = q.msaa; S.shadowRes = q.shadow; S.density = q.density; S.hairMode = q.hairMode; S.pixelRatio = 0;
}
if (!S.qualityApplied) { applyQualityProfile(S.quality || 'auto'); S.qualityApplied = true; }
renderer.shadowMap.autoUpdate = false; // 阴影只在灯光/形体/姿态变化时更新

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(15, window.innerWidth / window.innerHeight, 0.05, 30);
const controls = new OrbitControls(camera, canvas);
controls.addEventListener('change', () => invalidate());
controls.enableDamping = true; controls.minDistance = 0.35; controls.maxDistance = 2.4; controls.maxPolarAngle = Math.PI * 0.62;

let rig = null; let backdrop = null; let post = null; let basicLights = null;
const head = new THREE.Group(); scene.add(head);
let gltfHead = null; let parts = {}; let builtinSkin = null; let stand = null;
const origMats = new Map(); const skinTextures = {};
let hairMeshes = []; let hairMats = null; let hairCards = null; let strandMesh = null; let strandMat = null;
const strandCache = new Map();
let compare = false; // A/B：原始渲染
let dirty = 3; // 按需渲染：>0 时才渲染（静止画面不占 GPU）
let accum = null;
function invalidate(n = 2) { dirty = Math.max(dirty, n); accum?.reset(); }
function invalidateShadow() { renderer.shadowMap.needsUpdate = true; invalidate(); }

const loader = new GLTFLoader();
function parseGlb(u8) { const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength); return new Promise((res, rej) => loader.parse(buf, '', res, rej)); }
async function decodeBV(info) {
  const bv = await gltfHead.parser.getDependency('bufferView', info.bufferView);
  const bmp = await createImageBitmap(new Blob([bv], { type: info.mimeType }));
  const tex = new THREE.Texture(bmp); tex.flipY = false; tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8; tex.needsUpdate = true;
  return tex;
}
async function loadSkinTexture(name) {
  if (skinTextures[name]) return skinTextures[name];
  const ex = gltfHead.parser.json.extras?.realWebAssets?.skins?.[name];
  if (!ex) return null;
  return (skinTextures[name] = await decodeBV(ex));
}
const browCache = {};
async function applyBrow(id) {
  const info = gltfHead.parser.json.extras?.realWebAssets?.eyebrows?.[id];
  const mesh = parts.brows; if (!info || !mesh) return;
  if (!browCache[id]) browCache[id] = await decodeBV(info);
  const g = mesh.geometry;
  if (info.pos && g.attributes.position.array.length === info.pos.length) {
    const out = g.attributes.position.array;
    for (let i = 0; i < info.pos.length; i += 3) { out[i] = info.pos[i]; out[i + 1] = info.pos[i + 1]; out[i + 2] = info.pos[i + 2] + 0.00025; }
    g.attributes.position.needsUpdate = true; g.computeVertexNormals();
    if (g.userData.mpfbBase) { g.userData.mpfbBase = new Float32Array(out); applyFace(); }
  }
  if (info.uv && g.attributes.uv.array.length === info.uv.length) { g.attributes.uv.array.set(info.uv); g.attributes.uv.needsUpdate = true; }
  origMats.get(mesh).map = browCache[id];
  if (mesh.userData.after) { mesh.userData.after.map = browCache[id]; mesh.userData.after.needsUpdate = true; }
  if (eyeInfo) buildBrowStrands();
}

async function loadHead() {
  gltfHead = await parseGlb(await loadModelBytes(HEAD_MODEL_ID));
  const root = gltfHead.scene;
  root.traverse((o) => {
    if (!o.isMesh) return;
    origMats.set(o, o.material);
    o.castShadow = true; o.receiveShadow = true;
    const n = o.name;
    if (n.startsWith('HeadSkin')) parts.skin = o;
    else if (n.startsWith('Eyebrows')) parts.brows = o;
    else if (n.startsWith('Eyelashes')) parts.lashes = o;
    else if (n.startsWith('Eyes')) (parts.eyes ||= []).push(o);
    else if (n.startsWith('Teeth') || n.startsWith('Tongue')) (parts.mouth ||= []).push(o);
    else o.visible = false; // 任何未知网格一律不显示
  });
  head.add(root);
  // 眼球中心与半径（用于眼部遮蔽）
  const eyeball = (parts.eyes || []).find((e) => !(e.material.name || '').toLowerCase().includes('cornea')) || parts.eyes?.[0];
  if (eyeball) {
    const pa = eyeball.geometry.attributes.position; const L = new THREE.Box3(), R = new THREE.Box3(); const v = new THREE.Vector3();
    for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); (v.x < 0 ? L : R).expandByPoint(v); }
    eyeInfo = { L: L.getCenter(new THREE.Vector3()), R: R.getCenter(new THREE.Vector3()), r: Math.max(L.getSize(v).y, 0.01) * 0.5 };
    eyeInfo.L0 = eyeInfo.L.clone(); eyeInfo.R0 = eyeInfo.R.clone();
  }
}
let eyeInfo = null; let noseTip = null;
function setupFaceAnchors() {
  const u = builtinSkin?.userData?.skinUniforms; if (!u || !eyeInfo) return;
  if (!noseTip) {
    const pa = parts.skin.geometry.attributes.position; let best = -1e9; const v = new THREE.Vector3(); noseTip = new THREE.Vector3();
    for (let i = 0; i < pa.count; i++) { v.fromBufferAttribute(pa, i); if (Math.abs(v.x) < 0.006 && v.y < eyeInfo.L.y && v.y > eyeInfo.L.y - 0.06 && v.z > best) { best = v.z; noseTip.copy(v); } }
  }
  u.uFaceEyeL.value.copy(eyeInfo.L); u.uFaceEyeR.value.copy(eyeInfo.R); u.uFaceNose.value.copy(noseTip);
}
let lashMesh = null; let lashMat = null; let browMesh = null;
function buildLashStrands() {
  if (!parts.skin || !eyeInfo) return;
  if (lashMesh) { lashMesh.parent?.remove(lashMesh); lashMesh.geometry.dispose(); lashMesh = null; }
  const res = buildLashGeometry(parts.skin, [{ c: eyeInfo.L }, { c: eyeInfo.R }], eyeInfo.r, { guide: parts.lashes });
  window.__LASH_INFO__ = res?.info;
  if (!res?.geometry) return;
  lashMat ||= createLashStrandMaterial();
  lashMesh = new THREE.Mesh(res.geometry, lashMat);
  lashMesh.name = 'LashStrands'; lashMesh.renderOrder = 3; lashMesh.castShadow = false; lashMesh.receiveShadow = true;
  const msrc = parts.lashes || parts.skin; // morph 增量取自向导网格 → 字典/权重也用它的（共享数组：眨眼/表情自动同步）
  lashMesh.morphTargetDictionary = msrc.morphTargetDictionary;
  lashMesh.morphTargetInfluences = msrc.morphTargetInfluences;
  lashMesh.position.copy(parts.skin.position); lashMesh.quaternion.copy(parts.skin.quaternion); lashMesh.scale.copy(parts.skin.scale);
  parts.skin.parent.add(lashMesh);
  buildBrowStrands();
}
function buildBrowStrands() {
  if (browMesh) { browMesh.parent?.remove(browMesh); browMesh.geometry.dispose(); browMesh = null; }
  const b = parts.brows; const map = b && (origMats.get(b)?.map);
  if (b && map?.image && lashMat) {
    const res = buildBrowGeometry(b, alphaSamplerFromTexture(map));
    window.__BROW_INFO__ = res?.info;
    if (res?.geometry) {
      browMesh = new THREE.Mesh(res.geometry, lashMat);
      browMesh.name = 'BrowStrands'; browMesh.renderOrder = 3; browMesh.castShadow = false; browMesh.receiveShadow = true;
      browMesh.morphTargetDictionary = b.morphTargetDictionary; browMesh.morphTargetInfluences = b.morphTargetInfluences;
      browMesh.position.copy(b.position); browMesh.quaternion.copy(b.quaternion); browMesh.scale.copy(b.scale);
      b.parent.add(browMesh);
    }
  }
  applyLashLook();
}
function applyLashLook() {
  const fx = (id, d) => { const v = fxBus.effective(id); return v == null ? d : v; };
  const p = { eyeY: eyeInfo ? (eyeInfo.L.y + eyeInfo.R.y) / 2 : 0, lashDensity: fx('char.lashDensity', 1), lashLower: fx('char.lashLower', 0.5), lashDark: fx('char.lashDark', 0.9), lashLine: fx('char.lashLine', 0.6) };
  const m = parts.lashes?.userData?.after; if (m) setLashParams(m, p);
  if (lashMat) setLashStrandParams(lashMat, p);
  const after = !compare; const strands = after && fxOn('char.lashStrands') && !!lashMesh;
  if (lashMesh) lashMesh.visible = strands;
  if (parts.lashes) parts.lashes.visible = !strands;
  const bs = after && fxOn('char.browStrands') && !!browMesh;
  if (browMesh) browMesh.visible = bs;
  if (lashMat) setLashStrandParams(lashMat, { browDensity: fx('char.browDensity', 1) });
  const bm = parts.brows?.userData?.after; if (bm?.userData?.browU) bm.userData.browU.uBrowBase.value = bs ? fx('char.browBase', 0.45) : 1;
}
function setupEyeOcclusion(mat) {
  const u = mat?.userData?.eyeUniforms; if (!u || !eyeInfo) return;
  u.uEyeL.value.copy(eyeInfo.L); u.uEyeR.value.copy(eyeInfo.R); u.uEyeRad.value = eyeInfo.r; u.uEyeOcc.value = fxBus.effective('char.eyeOcc') ?? 0.75;
}

// ---------------- 形体 / 表情（只用资产自带的 morph target） ----------------
// MPFB2 骨相 + 眼型细调（叠加在基础顶点上）
function applyFace() {
  if (!parts.skin || !eyeInfo) return;
  const w = recipeWeights(ch.faceArch, ch.faceArchK ?? 0.6);
  for (const [k, v] of Object.entries(eyeSliderWeights(ch.eyeShape))) w[k] = (w[k] || 0) + v;
  const eyeY = (eyeInfo.L0.y + eyeInfo.R0.y) / 2;
  const r = applyFaceTargets(parts, w, { eyeY, eyeL: eyeInfo.L0, eyeR: eyeInfo.R0, eyeRad: eyeInfo.r, eyeSpacing: ch.eyeShape?.spacing || 0 });
  if (r) { eyeInfo.L.copy(eyeInfo.L0).add(new THREE.Vector3(...r.dL)); eyeInfo.R.copy(eyeInfo.R0).add(new THREE.Vector3(...r.dR)); }
  noseTip = null; setupFaceAnchors();
  for (const e of parts.eyes || []) if (e.material?.userData?.eyeUniforms) setupEyeOcclusion(e.material);
  buildLashStrands();
}
function setMorph(name, v) {
  gltfHead.scene.traverse((o) => {
    if (!o.isMesh || !o.morphTargetDictionary) return;
    const i = o.morphTargetDictionary[name]; if (i != null) o.morphTargetInfluences[i] = v;
  });
}
function applyShape() {
  gltfHead.scene.traverse((o) => { if (o.isMesh && o.morphTargetInfluences) o.morphTargetInfluences.fill(0); });
  for (const [k] of HEAD_SHAPES) setMorph(k, ch.shape[k] || 0);
  for (const [k] of FACE_SLIDERS) { const v = ch.face[k] || 0; setMorph('face_' + k + '_incr', Math.max(0, v)); setMorph('face_' + k + '_decr', Math.max(0, -v)); }
  setMorph('expr_smile', ch.expr.smile || 0);
  setMorph('expr_serene', ch.expr.serene || 0);
  setMorph('mh_brow_up', Math.max(0, ch.expr.browUp || 0));
  setMorph('mh_brow_down', Math.max(0, -(ch.expr.browUp || 0)));
  applyFace();
  invalidateShadow();
}

// ---------------- 头发 ----------------
function hairRGB() {
  if (ch.hairColor === 'custom' && ch.hairCustom) { const c = new THREE.Color(ch.hairCustom).convertSRGBToLinear(); return [c.r * 0.6, c.g * 0.6, c.b * 0.6]; }
  return (HAIR_COLORS[ch.hairColor] || HAIR_COLORS.natural).rgb;
}
const hairGlbCache = new Map();
async function loadHair(id) {
  for (const m of hairMeshes) m.parent?.remove(m);
  hairMeshes = [];
  if (strandMesh) { strandMesh.parent?.remove(strandMesh); strandMesh = null; }
  const h = HAIRS.find((x) => x.id === id) || HAIRS[0];
  if (!hairGlbCache.has(h.id)) hairGlbCache.set(h.id, await parseGlb(await loadModelBytes(h.id)));
  const g = hairGlbCache.get(h.id);
  let srcMesh = null; g.scene.traverse((o) => { if (o.isMesh && !srcMesh) srcMesh = o; });
  if (!srcMesh) return;
  const geom = srcMesh.geometry; const orig = srcMesh.material;
  hairMats = buildHairMaterials(orig);
  applyHairColor(hairMats, hairRGB());
  const core = new THREE.Mesh(geom, hairMats.core); core.castShadow = fxOn('render.hairShadow'); core.receiveShadow = true;
  core.userData.orig = orig; core.userData.after = hairMats.core;
  const tips = new THREE.Mesh(geom, hairMats.tips); tips.renderOrder = 2; tips.receiveShadow = true; tips.userData.afterOnly = true;
  srcMesh.updateWorldMatrix(true, false);
  for (const m of [core, tips]) { m.applyMatrix4(srcMesh.matrixWorld); head.add(m); hairMeshes.push(m); }
  hairCards = { core, tips, srcMesh, orig, geom, id: h.id };
  if (S.hairMode === 'strand') await buildStrands();
  buildHairline();
}
// ---------------- 发际线柔化 + 碎发（随发型/脸型自动重算） ----------------
let hairlineInfo = null; let babyMesh = null; let babyMat = null;
function headCenterWorld() { const b = new THREE.Box3().setFromObject(parts.skin); const c = b.getCenter(new THREE.Vector3()); return [c.x, c.y, c.z]; }
function buildHairline() {
  if (!hairCards || !parts.skin) return;
  try {
    const t0 = performance.now();
    hairCards.srcMesh.updateWorldMatrix(true, false);
    const hc = headCenterWorld(); const eyeY = eyeInfo ? (eyeInfo.L.y + eyeInfo.R.y) / 2 : hc[1];
    hairlineInfo = computeHairCoverage(parts.skin, hairCards.geom, hairCards.srcMesh.matrixWorld, alphaSamplerFromTexture(hairCards.orig.map), { eyeY, headCenter: hc });
    buildBabyHair();
    if (QA) console.log('hairline ms', Math.round(performance.now() - t0));
  } catch (err) { console.error('发际线计算失败', err); }
}
function buildBabyHair() {
  if (babyMesh) { babyMesh.parent?.remove(babyMesh); babyMesh.geometry.dispose(); babyMesh = null; }
  const dens = fxBus.effective('hairline.babyHair');
  if (!hairlineInfo || !(dens > 0)) { invalidate(); return; }
  const hc = headCenterWorld();
  const eyeY = eyeInfo ? (eyeInfo.L.y + eyeInfo.R.y) / 2 : hc[1];
  const { geometry } = buildBabyHairGeometry(hairlineInfo, { eyeY, headCenter: hc }, { babyHair: dens, babyLength: fxBus.effective('hairline.babyLength'), babyLift: fxBus.effective('hairline.babyLift') });
  if (!babyMat) babyMat = createStrandMaterial(hc);
  babyMat.userData.strandUniforms.uHeadCenter.value.set(...hc);
  setStrandParams(babyMat, strandShade());
  babyMesh = new THREE.Mesh(geometry, babyMat);
  babyMesh.frustumCulled = false; babyMesh.receiveShadow = true; babyMesh.castShadow = false; babyMesh.renderOrder = 3; babyMesh.visible = !compare;
  head.add(babyMesh); invalidate();
}
function shapeKey() { return JSON.stringify([ch.shape, ch.face, ch.faceArch, ch.faceArchK, ch.eyeShape]); }
async function buildStrands() {
  if (!hairCards) return;
  const key = hairCards.id + '|' + S.density + '|' + shapeKey();
  busy('正在把发片转换为真发丝（' + DENSITY[S.density].label + '）…');
  await new Promise((r) => setTimeout(r, 30));
  let res = strandCache.get(key);
  if (!res) {
    const alphaAt = alphaSamplerFromTexture(hairCards.orig.map);
    const soup = morphedHeadSoup(parts.skin);
    hairCards.srcMesh.updateWorldMatrix(true, false);
    res = generateStrands(hairCards.geom, hairCards.srcMesh.matrixWorld, alphaAt, soup, DENSITY[S.density]);
    if (!hairCards.geom.attributes.aScalpD) scalpDistanceAttribute(hairCards.geom, hairCards.srcMesh.matrixWorld, soup);
    if (strandCache.size > 6) strandCache.delete(strandCache.keys().next().value);
    strandCache.set(key, res);
  }
  if (!strandMat) strandMat = createStrandMaterial(res.headCenter);
  strandMat.userData.strandUniforms.uHeadCenter.value.set(...res.headCenter);
  setStrandParams(strandMat, strandShade());
  if (strandMesh) strandMesh.parent?.remove(strandMesh);
  strandMesh = new THREE.Mesh(res.geometry, strandMat);
  strandMesh.castShadow = false; strandMesh.receiveShadow = true; strandMesh.frustumCulled = false; strandMesh.renderOrder = 1;
  head.add(strandMesh);
  busy(null); invalidateShadow();
}
function strandShade() { const sh = fxBus.effective('char.hairShine'), bk = fxBus.effective('char.hairBack'); return { color: hairRGB(), gainR: 1.15 * sh, gainTRT: 1.8 * sh, gainTT: bk }; }
function applySkinParams() { if (builtinSkin) setSkinParams(builtinSkin, { ...effScope('skin', ch.skinP), hairline: fxBus.effective('hairline.soft'), scalpAO: fxBus.effective('hairline.scalpAO'), hairRoot: hairRGB() }); }
function applyRenderToggles() { const hs = fxOn('render.hairShadow'); for (const m of hairMeshes) if (!m.userData.afterOnly) m.castShadow = hs; invalidateShadow(); }
function applyHairLook() {
  if (hairMats) applyHairColor(hairMats, hairRGB());
  if (strandMat) setStrandParams(strandMat, strandShade());
  if (babyMat) setStrandParams(babyMat, strandShade());
  applySkinParams();
  applyMaterials();
}

// 头发 LOD：拖动/缩放时临时显示发片（很快），停下后换回真发丝做精修
let hairLODActive = false;
function setHairLOD(cards) {
  if (!strandMesh || compare || S.hairMode !== 'strand' || cards === hairLODActive) return;
  hairLODActive = cards;
  strandMesh.visible = !cards;
  for (const m of hairMeshes) if (m.userData.afterOnly) m.visible = cards;
  if (hairMats) {
    hairMats.shared.uScalpFade.value = cards ? 0.0 : 0.010;
    hairMats.shared.uInset.value = cards ? 0.0 : 0.0025;
    hairMats.core.alphaTest = cards ? 0.45 : 0.62;
    hairMats.core.color.setRGB(...hairRGB().map((v) => v * (cards ? 1 : 0.3)));
  }
}

// ---------------- 材质（A/B 对比） ----------------
async function applySkinTexture() {
  const tex = await loadSkinTexture(ch.skin);
  const so = origMats.get(parts.skin);
  if (tex) so.map = tex;
  if (!builtinSkin) builtinSkin = upgradeSkinMaterial(so);
  builtinSkin.map = tex || so.map; builtinSkin.needsUpdate = true; so.needsUpdate = true;
  setupFaceAnchors();
}
function applyMaterials() {
  hairLODActive = false;
  const after = !compare;
  parts.skin.material = after ? builtinSkin : origMats.get(parts.skin);
  for (const e of parts.eyes || []) {
    const o = origMats.get(e);
    e.material = after ? (e.userData.after ||= upgradeEyeMaterial(o)) : o;
    if (after) setupEyeOcclusion(e.material);
    if (o.name.toLowerCase().includes('cornea')) e.castShadow = false;
  }
  if (parts.lashes) {
    const o = origMats.get(parts.lashes);
    if (after && !parts.lashes.userData.after) parts.lashes.userData.after = upgradeLashMaterial(o);
    parts.lashes.material = after ? parts.lashes.userData.after : o;
  }
  if (parts.brows) { const o = origMats.get(parts.brows); parts.brows.material = after ? (parts.brows.userData.after ||= upgradeBrowMaterial(o)) : o; parts.brows.castShadow = false; }
  applyLashLook();
  const strandOn = after && S.hairMode === 'strand' && !!strandMesh;
  for (const m of hairMeshes) {
    if (m.userData.afterOnly) m.visible = after && !strandOn;
    else m.material = after ? m.userData.after : m.userData.orig;
  }
  if (strandMesh) strandMesh.visible = strandOn;
  if (hairMats) {
    hairMats.shared.uScalpFade.value = strandOn ? 0.010 : 0.0;
    hairMats.shared.uInset.value = strandOn ? 0.0025 : 0.0;
    hairMats.core.alphaTest = strandOn ? 0.62 : 0.45;
    hairMats.core.color.setRGB(...hairRGB().map((v) => v * (strandOn ? 0.3 : 1)));
  }
  applySkinParams();
  if (babyMesh) babyMesh.visible = after;
  scene.traverse((o) => { if (o.material && !Array.isArray(o.material)) o.material.needsUpdate = true; });
  invalidateShadow();
}

// ---------------- 布光 / 后期 ----------------
function applyLighting() {
  if (compare) {
    if (rig) rig.group.visible = false;
    if (backdrop) backdrop.mesh.visible = false;
    scene.environment = null; scene.background = new THREE.Color(0x1b1e24);
    if (!basicLights) {
      basicLights = new THREE.Group();
      basicLights.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.6));
      const d = new THREE.DirectionalLight(0xffffff, 1.8); d.position.set(0.4, 0.6, 1); basicLights.add(d);
      scene.add(basicLights);
    }
    basicLights.visible = true; renderer.shadowMap.enabled = false;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1;
    return;
  }
  if (basicLights) basicLights.visible = false;
  renderer.shadowMap.enabled = true;
  if (!rig) rig = createStudioRig(scene, renderer, ch.light, { shadowMapSize: S.shadowRes });
  rig.group.visible = true;
  const p = rig.apply(ch.light, effScope('light', ch.lightOv));
  if (!backdrop) backdrop = createBackdrop(scene, p.backdrop);
  setBackdrop(p); backdrop.mesh.visible = true;
  scene.background = null;
  renderer.toneMapping = { agx: THREE.AgXToneMapping, aces: THREE.ACESFilmicToneMapping, neutral: THREE.NeutralToneMapping }[S.toneMap] || THREE.NeutralToneMapping;
}
function postRaw() { const film = FILM_PRESETS[ch.film] || FILM_PRESETS.clean; return { ...POST_DEFAULTS, ...film, ...ch.post }; }
function postParams() {
  const o = effScope('post', postRaw());
  return { ...o, ao: S.ao && o.ao !== false };
}
function rebuildPost() { post?.dispose(); post = null; applyPost(); onResize(); }
function applyPost() {
  if (!post) post = createPostChain(renderer, scene, camera, { samples: isSoftware ? 0 : S.msaa, aoSamples: qProfile().ao });
  post.set(postParams());
}
async function applyAll() {
  applyShape();
  await applySkinTexture();
  await applyBrow(ch.brow);
  applyMaterials();
  applyLighting();
  applyPost();
  if (stand) stand.userData.setStyle(ch.stand);
  invalidateShadow(); invalidate(3);
}

function setView(id) {
  const v = VIEWS[id] || VIEWS.portrait;
  camera.position.set(...v.pos); camera.fov = v.fov; camera.updateProjectionMatrix();
  controls.target.set(...v.target); controls.update();
}

// ---------------- UI 工具 ----------------
let toastT = 0;
function toast(msg) { const t = $('toast'); t.textContent = msg; t.style.display = 'block'; clearTimeout(toastT); toastT = setTimeout(() => { t.style.display = 'none'; }, 2600); }
function busy(msg) { const b = $('busy'); if (!msg) { b.style.display = 'none'; return; } b.textContent = msg; b.style.display = 'block'; }
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (k.startsWith('on')) e[k] = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v); }
  for (const k of kids) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
}
function section(parent, title, open = false) { const d = h('details', open ? { open: '' } : {}); d.append(h('summary', {}, title)); parent.append(d); return d; }
function slider(parent, label, min, max, step, get, set, commit) {
  const inp = h('input', { type: 'range', min, max, step }); inp.value = get();
  const out = h('span', {}, (+inp.value).toFixed(step < 0.01 ? 3 : 2));
  inp.oninput = () => { out.textContent = (+inp.value).toFixed(step < 0.01 ? 3 : 2); set(+inp.value); };
  if (commit) inp.onchange = () => commit(+inp.value);
  parent.append(h('label', { class: 'l' }, label), h('div', { class: 'row' }, inp, out));
  return inp;
}
function select(parent, label, items, get, set) {
  const s = h('select'); s.innerHTML = items.map(([v, l]) => `<option value="${v}">${l}</option>`).join(''); s.value = get();
  s.onchange = () => set(s.value);
  if (label) parent.append(h('label', { class: 'l' }, label));
  parent.append(s); return s;
}
function check(parent, label, get, set) {
  const c = h('input', { type: 'checkbox' }); c.checked = !!get(); c.onchange = () => set(c.checked);
  parent.append(h('label', { class: 'chk' }, c, label)); return c;
}
let envT = 0;
function setBackdrop(p) { if (!backdrop) return; const k = fxBus.effective('light.bgMul') ?? 0.55; const sc = (hex) => '#' + new THREE.Color(hex).multiplyScalar(k).getHexString(); backdrop.set([sc(p.backdrop[0]), sc(p.backdrop[1])]); backdrop.setTexture(backgroundTexture(ch.bg || 'studio'), k * 1.25); }
const relight = () => {
  if (compare || !rig) return;
  const p = rig.apply(ch.light, effScope('light', ch.lightOv), { skipEnv: true }); setBackdrop(p); invalidateShadow();
  clearTimeout(envT); envT = setTimeout(() => { rig.apply(ch.light, effScope('light', ch.lightOv)); invalidateShadow(); }, 180);
};
const repost = () => { post && post.set(postParams()); invalidate(); };

// ---------------- 效果控件：每个效果 = 开关 + 数值，数值被连线改动时自动同步 ----------------
let fxUiUnsubs = [];
function fxCtl(parent, id) {
  const e = fxBus.entry(id); if (!e) return null;
  const wrap = h('div', { class: 'fx' + (fxBus.isEnabled(id) ? '' : ' off'), 'data-fx': id });
  if (e.kind === 'toggle') {
    const c = h('input', { type: 'checkbox' }); c.checked = !!fxBus.get(id);
    c.onchange = () => { fxBus.enable(id, true); fxBus.set(id, c.checked); };
    wrap.append(h('label', { class: 'chk' }, c, e.label));
    fxUiUnsubs.push(fxBus.on(id, (v) => { c.checked = !!v; }));
  } else {
    const on = h('input', { type: 'checkbox', title: '开 / 关此效果（关闭时数值保留）' }); on.checked = fxBus.isEnabled(id);
    on.onchange = () => { fxBus.enable(id, on.checked); wrap.classList.toggle('off', !on.checked); };
    const dec = e.step < 0.001 ? 4 : e.step < 0.01 ? 3 : e.step < 1 ? 2 : 0;
    const inp = h('input', { type: 'range', min: e.min, max: e.max, step: e.step }); inp.value = fxBus.get(id) ?? e.off;
    const out = h('span', {}, (+inp.value).toFixed(dec));
    inp.oninput = () => { out.textContent = (+inp.value).toFixed(dec); fxBus.set(id, +inp.value); };
    wrap.append(h('label', { class: 'l fxl' }, on, e.label), h('div', { class: 'row' }, inp, out));
    fxUiUnsubs.push(fxBus.on(id, (v) => { if (document.activeElement !== inp) { inp.value = v; out.textContent = (+v).toFixed(dec); } on.checked = fxBus.isEnabled(id); wrap.classList.toggle('off', !on.checked); }));
  }
  parent.append(wrap); return wrap;
}
function buildFxWiring(P) {
  const W = section(P, '🔌 效果开关与连线（高级 / 可二次开发）');
  W.append(h('div', { class: 'note' }, '所有画面效果都登记在 src/data/effectRegistry.js，没有写死。每项左边的勾 = 开关（关掉时数值保留）。连线：让一个效果驱动另一个，目标 = 偏移 + 倍数 × 源。控制台可用 window.SafeBust.fx 编程控制。'));
  const opts = EFFECT_REGISTRY.map((e) => [e.id, (EFFECT_GROUPS[e.group] || '').replace(/^\S+\s/, '') + ' · ' + e.label]);
  const list = h('div', { class: 'links' }); W.append(list);
  const drawLinks = () => {
    list.innerHTML = '';
    fxBus.links().forEach((l, i) => {
      const lab = (id) => fxBus.entry(id)?.label || id;
      const c = h('input', { type: 'checkbox' }); c.checked = l.on !== false; c.onchange = () => { l.on = c.checked; };
      list.append(h('div', { class: 'linkrow' }, c, ` ${lab(l.from)} → ${lab(l.to)}（×${l.scale} ${l.offset >= 0 ? '+' : ''}${l.offset}）`, h('button', { class: 'mini', onclick: () => { fxBus.unlink(i); drawLinks(); } }, '删除')));
    });
    if (!fxBus.links().length) list.append(h('div', { class: 'note' }, '暂无连线'));
  };
  drawLinks();
  let from = 'light.keyMul', to = 'post.bloom';
  select(W, '源（输出）', opts, () => from, (v) => { from = v; });
  select(W, '目标（输入）', opts, () => to, (v) => { to = v; });
  const sc = h('input', { type: 'number', value: 1, step: 0.05 }); const of = h('input', { type: 'number', value: 0, step: 0.01 });
  W.append(h('div', { class: 'grid2' }, h('label', { class: 'l' }, '倍数 ', sc), h('label', { class: 'l' }, '偏移 ', of)));
  W.append(h('button', { class: 'btn', onclick: () => { try { fxBus.link(from, to, { scale: +sc.value, offset: +of.value }); drawLinks(); toast('已连线'); } catch (err) { toast(String(err.message || err)); } } }, '＋ 连线'));
  W.append(h('div', { class: 'grid2' },
    h('button', { class: 'btn ghost', onclick: () => { ch.fx.bypass = {}; for (const sc2 of new Set(EFFECT_REGISTRY.map((e) => e.scope))) applyScope(sc2, true); buildStudio(); } }, '全部效果打开'),
    h('button', { class: 'btn ghost', onclick: () => { for (const e of EFFECT_REGISTRY) if (e.kind === 'range' && e.scope !== 'light') ch.fx.bypass[e.id] = true; for (const sc2 of new Set(EFFECT_REGISTRY.map((e) => e.scope))) applyScope(sc2, true); buildStudio(); } }, '全关（看纯净底模）'),
  ));
  const fileI = h('input', { type: 'file', accept: '.json', style: 'display:none' });
  fileI.onchange = async () => { const f = fileI.files[0]; if (!f) return; try { fxBus.import(await f.text()); buildStudio(); toast('已导入效果配置'); } catch (err) { toast('导入失败：' + err.message); } };
  W.append(fileI, h('div', { class: 'grid2' },
    h('button', { class: 'btn ghost', onclick: () => download('效果配置_' + ch.name + '.json', new Blob([fxBus.export()], { type: 'application/json' })) }, '导出效果 JSON'),
    h('button', { class: 'btn ghost', onclick: () => fileI.click() }, '导入效果 JSON'),
  ));
}

// ---------------- 工坊面板 ----------------
function buildStudio() {
  const P = $('p-studio'); P.innerHTML = '';
  fxUiUnsubs.forEach((f) => f()); fxUiUnsubs = [];
  P.append(h('h3', {}, '🎨 胸像工坊'));
  const nameI = h('input', { type: 'text', value: ch.name, maxlength: 24 }); nameI.oninput = () => { ch.name = nameI.value || '未命名胸像'; };
  P.append(h('label', { class: 'l' }, '名称'), nameI);
  select(P, '镜头', Object.entries(VIEWS).map(([k, v]) => [k, v.label]), () => 'portrait', setView);

  const L = section(P, '✨ 一键风格', true);
  const looks = h('div', { class: 'looks' }); L.append(looks);
  for (const [k, v] of Object.entries(LOOKS)) {
    const b = h('button', { class: ch.look === k ? 'on' : '' }, v.label);
    b.onclick = async () => {
      ch.look = k; ch.light = v.light; ch.film = v.film; ch.bg = v.bg; ch.skinP = { ...ch.skinP, ...v.skin };
      ch.lightOv = defaultCharacter().lightOv; ch.post = { dof: v.dof, aperture: 0.0016 };
      await applyAll(); buildStudio();
    };
    looks.append(b);
  }
  L.append(h('div', { class: 'note' }, '一键风格会同时设置布光、胶片调色和皮肤参数，之后仍可在下方逐项微调。'));

  const C = section(P, '👤 角色外形');
  select(C, '头型基底', HEAD_SHAPES.map(([k, l]) => [k, l]), () => Object.entries(ch.shape).sort((a, b) => b[1] - a[1])[0]?.[0] || 'mh_head_asian_youth', (v) => { ch.shape = { [v]: 0.65 }; applyShape(); rebuildStrandsSoon(); buildStudio(); });
  const top = Object.entries(ch.shape).sort((a, b) => b[1] - a[1])[0];
  if (top) slider(C, '头型强度', 0, 1, 0.01, () => top[1], (v) => { ch.shape[top[0]] = v; applyShape(); }, rebuildStrandsSoon);
  select(C, '骨相预设（MPFB2 雕刻形变，' + (FACE_ARCHETYPES.length - 1) + ' 款）', FACE_ARCHETYPES.map((f) => [f.id, (FACE_REGIONS[f.region] ? '[' + FACE_REGIONS[f.region] + '] ' : '') + f.label]), () => ch.faceArch || 'none', (v) => { ch.faceArch = v; applyShape(); rebuildStrandsSoon(); });
  slider(C, '骨相强度', 0, 1.5, 0.01, () => ch.faceArchK ?? 0.6, (v) => { ch.faceArchK = v; applyShape(); }, rebuildStrandsSoon);
  for (const [k, l] of EYE_SLIDERS) slider(C, l, k === 'bag' ? 0 : -1, 1, 0.01, () => ch.eyeShape?.[k] || 0, (v) => { (ch.eyeShape ||= {})[k] = v; applyShape(); }, rebuildStrandsSoon);
  for (const [k, l] of FACE_SLIDERS) slider(C, l, -1, 1, 0.01, () => ch.face[k] || 0, (v) => { ch.face[k] = v; applyShape(); }, rebuildStrandsSoon);
  slider(C, '微笑', 0, 1, 0.01, () => ch.expr.smile, (v) => { ch.expr.smile = v; applyShape(); });
  slider(C, '恬静', 0, 1, 0.01, () => ch.expr.serene, (v) => { ch.expr.serene = v; applyShape(); });
  slider(C, '眉毛高低', -1, 1, 0.01, () => ch.expr.browUp, (v) => { ch.expr.browUp = v; applyShape(); });
  const skins = Object.keys(gltfHead.parser.json.extras?.realWebAssets?.skins || {}).filter((s) => SKIN_LABELS[s]);
  select(C, '肤质贴图', skins.map((s) => [s, SKIN_LABELS[s]]), () => ch.skin, async (v) => { ch.skin = v; await applySkinTexture(); applyMaterials(); });
  fxCtl(C, 'char.eyeOcc');
  fxCtl(C, 'char.lashStrands'); fxCtl(C, 'char.lashDensity'); fxCtl(C, 'char.lashLower'); fxCtl(C, 'char.lashDark'); fxCtl(C, 'char.lashLine');
  fxCtl(C, 'char.browStrands'); fxCtl(C, 'char.browDensity'); fxCtl(C, 'char.browBase');
  select(C, '眉形', Object.keys(gltfHead.parser.json.extras?.realWebAssets?.eyebrows || {}).map((b) => [b, BROW_LABELS[b] || b]), () => ch.brow, async (v) => { ch.brow = v; await applyBrow(v); });

  const Hh = section(P, '💇 发型发色');
  select(Hh, '发型（' + HAIRS.length + ' 款）', HAIRS.map((x) => [x.id, '[' + (HAIR_GROUPS[x.group] || '').slice(0, 2) + '] ' + x.label]), () => ch.hair, async (v) => { ch.hair = v; await loadHair(v); applyMaterials(); });
  select(Hh, '发色', [...Object.entries(HAIR_COLORS).map(([k, v]) => [k, v.label]), ['custom', '自定义…']], () => ch.hairColor, (v) => { ch.hairColor = v; applyHairLook(); buildStudio(); });
  if (ch.hairColor === 'custom') { const ci = h('input', { type: 'color', value: ch.hairCustom || '#3a2618' }); ci.oninput = () => { ch.hairCustom = ci.value; applyHairLook(); }; Hh.append(ci); }
  fxCtl(Hh, 'char.hairShine');
  fxCtl(Hh, 'char.hairBack');

  const Li = section(P, '💡 布光');
  select(Li, '布光预设', Object.entries(LIGHT_PRESETS).map(([k, v]) => [k, v.label]), () => ch.light, (v) => { ch.light = v; relight(); });
  for (const id of ['light.azimuth', 'light.elevation', 'light.keyMul', 'light.softMul', 'light.kelvin', 'light.rimMul', 'light.fillMul', 'light.envMul', 'light.exposureMul', 'light.shadowStrength', 'light.shadowSoft']) fxCtl(Li, id);
  const o = ch.lightOv;
  select(Li, '虚化环境背景', Object.entries(BACKGROUNDS).map(([k, v]) => [k, v.label]), () => ch.bg || 'studio', (v) => { ch.bg = v; relight(); });
  fxCtl(Li, 'light.bgMul');
  select(Li, '光斑遮挡（Gobo）', [['preset', '跟随预设'], ['none', '无'], ['window', '窗格'], ['leaf', '树叶']], () => o.gobo, (v) => { o.gobo = v; relight(); });
  fxCtl(Li, 'light.goboScale'); fxCtl(Li, 'light.goboSoft');

  const Sk = section(P, '🧴 皮肤质感');
  for (const e of EFFECT_REGISTRY) if (e.group === 'skin') fxCtl(Sk, e.id);

  const HL = section(P, '🌱 发际线与碎发（去“假发感”）');
  for (const e of EFFECT_REGISTRY) if (e.group === 'hairline') fxCtl(HL, e.id);
  HL.append(h('div', { class: 'note' }, '根据当前发型自动计算：皮肤上画出几毫米宽的细发过渡带、头发下的头皮压暗、再沿发际线长一圈短碎发。换发型/改脸型会自动重算。'));

  const F = section(P, '🎞️ 胶片与后期');
  select(F, '胶片预设', Object.entries(FILM_PRESETS).map(([k, v]) => [k, v.label]), () => ch.film, (v) => { ch.film = v; ch.post = { dof: ch.post.dof, ao: ch.post.ao }; repost(); buildStudio(); });
  for (const e of EFFECT_REGISTRY) if (e.group === 'post') fxCtl(F, e.id);
  const Lens = section(P, '📷 镜头（景深 / AO / 对焦）');
  for (const e of EFFECT_REGISTRY) if (e.group === 'lens') fxCtl(Lens, e.id);

  buildFxWiring(P);

  const St = section(P, '🏛 展示底座');
  select(St, '底座材质', Object.entries(STAND_STYLES).map(([k, v]) => [k, v.label]), () => ch.stand, (v) => { ch.stand = v; stand?.userData.setStyle(v); });

  const N = section(P, '📝 备注');
  const ta = h('textarea', { maxlength: 300 }); ta.value = ch.note; ta.oninput = () => { ch.note = ta.value; }; N.append(ta);

  const exists = store.items.some((x) => x.id === ch.id);
  P.append(h('button', { class: 'btn gold', onclick: () => saveCurrent(false) }, exists ? '💾 保存修改' : '💾 保存为藏品'));
  if (exists) P.append(h('button', { class: 'btn', onclick: () => saveCurrent(true) }, '📄 另存为新藏品'));
  P.append(h('div', { class: 'grid2' },
    h('button', { class: 'btn ghost', onclick: async () => { const id = ch.id; const keep = { id, name: ch.name, created: ch.created }; ch = { ...defaultCharacter(), ...keep }; await loadHair(ch.hair); await applyAll(); buildStudio(); toast('已重置外观'); } }, '↺ 重置外观'),
    h('button', { class: 'btn ghost', onclick: async () => { ch = defaultCharacter(); await loadHair(ch.hair); await applyAll(); buildStudio(); toast('新建空白胸像'); } }, '＋ 新建'),
  ));
  P.append(h('div', { class: 'note' }, '鼠标拖动旋转、滚轮缩放、右键平移。所有角色均为虚构，底座为中性陈列底座。软件渲染（无独显/未开硬件加速）时会自动降低发丝密度。'));
}
let rebuildT = 0;
function rebuildStrandsSoon() { clearTimeout(rebuildT); rebuildT = setTimeout(async () => { if (S.hairMode === 'strand') await buildStrands(); buildHairline(); applyMaterials(); }, 250); }

// ---------------- 保存 / 收藏 ----------------
function snapshotThumb() {
  renderFrame();
  const W = 240, H = 320; const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); const sw = canvas.width, sh = canvas.height;
  const k = Math.min(sw / W, sh / H) * 0.82; const cw = W * k, chh = H * k;
  const off = camera.view && camera.view.enabled ? (330 / (window.innerWidth + 330)) * sw * 0.5 : 0;
  const sx = (sw - cw) / 2 - off;
  g.drawImage(canvas, Math.max(0, sx), (sh - chh) / 2, cw, chh, 0, 0, W, H);
  return cv.toDataURL('image/jpeg', 0.82);
}
function saveCurrent(asNew) {
  if (asNew) { ch = structuredClone(ch); ch.id = defaultCharacter().id; ch.created = Date.now(); ch.name = ch.name + ' 副本'; }
  ch.thumb = snapshotThumb(); ch.updated = Date.now();
  const i = store.items.findIndex((x) => x.id === ch.id);
  if (i >= 0) store.items[i] = structuredClone(ch); else store.items.unshift(structuredClone(ch));
  store.current = ch.id; saveStore(); buildStudio(); buildGallery();
  toast(storageOK ? `已保存「${ch.name}」到收藏` : '已加入本次会话的收藏（浏览器未允许本地存储）');
}
async function loadCharacter(id) {
  const it = store.items.find((x) => x.id === id); if (!it) return;
  const d = defaultCharacter();
  ch = { ...d, ...structuredClone(it), lightOv: { ...d.lightOv, ...(it.lightOv || {}) }, skinP: { ...d.skinP, ...(it.skinP || {}) } }; normalizeChar(ch);
  store.current = id; saveStore();
  if (!hairCards || hairCards.id !== ch.hair || S.hairMode === 'strand') await loadHair(ch.hair);
  await applyAll(); buildStudio(); buildGallery();
}
function download(name, blob) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 2000); }
function buildGallery() {
  const P = $('p-gallery'); P.innerHTML = '';
  P.append(h('h3', {}, `🗂 我的收藏（${store.items.length}）`));
  if (!store.items.length) P.append(h('div', { class: 'note' }, '还没有藏品。在「工坊」调好外观后点击「保存为藏品」。'));
  const cards = h('div', { class: 'cards' }); P.append(cards);
  for (const it of store.items) {
    const card = h('div', { class: 'card' + (it.id === ch.id ? ' cur' : '') },
      h('img', { src: it.thumb || '', alt: it.name }),
      h('div', { class: 't' }, h('b', {}, it.name), h('i', {}, new Date(it.updated || it.created).toLocaleString())),
    );
    const act = h('div', { class: 'a' },
      h('button', { title: '编辑', onclick: async (e) => { e.stopPropagation(); await loadCharacter(it.id); switchTab('studio'); } }, '编辑'),
      h('button', { title: '桌宠', onclick: async (e) => { e.stopPropagation(); await loadCharacter(it.id); enterPet(); } }, '桌宠'),
      h('button', { title: '导出', onclick: (e) => { e.stopPropagation(); download(`${it.name}.bust.json`, new Blob([JSON.stringify(it, null, 2)], { type: 'application/json' })); } }, '导出'),
      h('button', { title: '删除', onclick: (e) => { e.stopPropagation(); if (!confirm(`删除「${it.name}」？`)) return; store.items = store.items.filter((x) => x.id !== it.id); saveStore(); buildGallery(); buildStudio(); } }, '删除'),
    );
    card.append(act);
    card.onclick = () => loadCharacter(it.id);
    cards.append(card);
  }
  const file = h('input', { type: 'file', accept: '.json', multiple: '', style: 'display:none' });
  file.onchange = async () => {
    let n = 0;
    for (const f of file.files) {
      try {
        const j = JSON.parse(await f.text()); const arr = Array.isArray(j) ? j : (j.items || [j]);
        for (const it of arr) { if (!it || typeof it !== 'object' || !it.name) continue; const c = { ...defaultCharacter(), ...it, id: defaultCharacter().id }; store.items.unshift(c); n++; }
      } catch (e) { toast('无法读取 ' + f.name); }
    }
    saveStore(); buildGallery(); toast(`已导入 ${n} 件藏品`);
  };
  P.append(file,
    h('button', { class: 'btn', onclick: () => file.click() }, '📥 导入藏品 JSON'),
    h('button', { class: 'btn', onclick: () => download('我的胸像收藏.json', new Blob([JSON.stringify({ items: store.items }, null, 2)], { type: 'application/json' })) }, '📤 导出全部收藏'),
    h('div', { class: 'note' }, '收藏保存在本浏览器的 localStorage。换电脑或清理浏览器数据前请先导出。'));
}

// ---------------- 设置 ----------------
function buildSettings() {
  const P = $('p-settings'); P.innerHTML = '';
  P.append(h('h3', {}, '⚙️ 设置'));
  const A = section(P, '画质', true);
  select(A, '画质档位', [['auto', '自动（' + (isSoftware ? '检测到软件渲染→流畅' : '均衡') + '）'], ...Object.entries(QUALITY).map(([k, v]) => [k, v.label])], () => S.quality, async (v) => {
    applyQualityProfile(v); saveStore();
    if (rig) { rig.key.shadow.mapSize.set(S.shadowRes, S.shadowRes); rig.key.shadow.map?.dispose(); rig.key.shadow.map = null; }
    rebuildPost();
    if (S.hairMode === 'strand') await buildStrands();
    applyMaterials(); buildSettings(); toast('已切换：' + qProfile().label);
  });
  select(A, '帧率上限', [['30', '30 fps（省电、风扇安静）'], ['60', '60 fps']], () => String(S.maxFps), (v) => { S.maxFps = +v; saveStore(); });
  check(A, '静止时多帧超采样精修（越停越清晰）', () => S.accum, (v) => { S.accum = v; saveStore(); invalidate(); });
  check(A, '拖动时头发切换为发片（大幅减少卡顿）', () => S.hairLOD, (v) => { S.hairLOD = v; saveStore(); });
  slider(A, '拖动时分辨率（越低越跟手）', 0.35, 1, 0.05, () => S.interactScale, (v) => { S.interactScale = v; saveStore(); });
  A.append(h('div', { class: 'note' }, '画面静止时不再重复渲染（GPU 占用接近 0）；拖动/缩放时自动降分辨率并暂停 AO，松手后渲染一帧满画质。'));
  select(A, '头发渲染', [['strand', '真发丝（发片→发丝转换）'], ['card', '发片（更快）']], () => S.hairMode, async (v) => { S.hairMode = v; saveStore(); if (v === 'strand') await buildStrands(); applyMaterials(); });
  select(A, '发丝密度', Object.entries(DENSITY).map(([k, v]) => [k, v.label]), () => S.density, async (v) => { S.density = v; saveStore(); if (S.hairMode === 'strand') { await buildStrands(); applyMaterials(); } });
  select(A, '渲染分辨率', [['0', '自动'], ['0.75', '75%（省电）'], ['1', '100%'], ['1.5', '150%'], ['2', '200%（高清屏）']], () => String(S.pixelRatio), (v) => { S.pixelRatio = +v; saveStore(); onResize(); });
  select(A, '阴影贴图', [['1024', '1024'], ['2048', '2048'], ['4096', '4096（独显）']], () => String(S.shadowRes), (v) => { S.shadowRes = +v; saveStore(); if (rig) { rig.key.shadow.mapSize.set(+v, +v); rig.key.shadow.map?.dispose(); rig.key.shadow.map = null; renderer.shadowMap.needsUpdate = true; } });
  select(A, '色调映射', [['neutral', 'Khronos PBR Neutral（肤色准）'], ['agx', 'AgX（高光柔和）'], ['aces', 'ACES（电影对比）']], () => S.toneMap, (v) => { S.toneMap = v; saveStore(); applyLighting(); scene.traverse((o) => { if (o.material) o.material.needsUpdate = true; }); });
  check(A, '全局环境光遮蔽（GTAO）', () => S.ao, (v) => { S.ao = v; saveStore(); repost(); });
  const B = section(P, '神态与桌宠', true);
  check(B, '自然眨眼', () => S.blink, (v) => { S.blink = v; saveStore(); });
  check(B, '桌宠偶尔说话提醒', () => S.idle, (v) => { S.idle = v; saveStore(); });
  slider(B, '桌宠窗口大小', 220, 560, 10, () => S.petSize, (v) => { S.petSize = v; saveStore(); if (document.body.classList.contains('pet')) layoutPet(); });
  const C = section(P, '数据');
  C.append(h('button', { class: 'btn ghost', onclick: () => { if (!confirm('清空全部收藏与设置？此操作不可恢复（建议先导出）。')) return; localStorage.removeItem(STORE_KEY); location.reload(); } }, '🗑 清空本地数据'));
  P.append(h('div', { class: 'note', html: `渲染器：${isSoftware ? '<b style="color:#e8b36a">软件渲染（建议开启浏览器硬件加速）</b>' : '硬件 GPU'}<br>本页面为离线单文件，不联网、不上传任何数据。<br>HTML 版桌宠显示在浏览器窗口内，不是跨应用的系统桌宠。` }));
}

// ---------------- 桌宠模式 ----------------
const pet = { x: 0, y: 0, spin: false, bubbleT: 0, savedView: null };
const PET_LINES = ['今天也辛苦了，记得喝水。', '休息一下眼睛吧，看看远处。', '坐久了，起来活动一下？', '光线不错，适合拍一张。', '专注二十五分钟，再休息五分钟。', '你好呀～'];
function layoutPet() {
  const w = S.petSize, hgt = Math.round(S.petSize * 1.3);
  const win = $('petWin'); win.style.width = w + 'px'; win.style.height = hgt + 'px';
  pet.x = Math.min(Math.max(0, pet.x), window.innerWidth - w); pet.y = Math.min(Math.max(0, pet.y), window.innerHeight - hgt - 42);
  win.style.left = pet.x + 'px'; win.style.top = pet.y + 'px';
  renderer.setPixelRatio(pixelRatio()); renderer.setSize(w, hgt, false);
  camera.clearViewOffset(); camera.aspect = w / hgt; camera.updateProjectionMatrix(); post?.setSize(w, hgt); resizeAccum(); invalidate();
}
function enterPet() {
  document.body.classList.add('pet', 'hideui');
  pet.savedView = { pos: camera.position.clone(), target: controls.target.clone(), fov: camera.fov };
  $('petWin').prepend(canvas);
  pet.x = window.innerWidth - S.petSize - 40; pet.y = window.innerHeight - S.petSize * 1.3 - 70;
  setView('portrait'); controls.enabled = false;
  $('petName').textContent = ch.name;
  layoutPet(); setTab('pet');
  say('你好，我是「' + ch.name + '」。');
}
function exitPet() {
  document.body.classList.remove('pet', 'hideui');
  document.body.prepend(canvas);
  controls.enabled = true; head.rotation.y = 0; head.position.y = 0; pet.spin = false;
  if (pet.savedView) { camera.position.copy(pet.savedView.pos); controls.target.copy(pet.savedView.target); camera.fov = pet.savedView.fov; }
  onResize(); switchTab('studio');
}
function say(text) { const b = $('petBubble'); b.textContent = text; b.style.display = 'block'; clearTimeout(pet.bubbleT); pet.bubbleT = setTimeout(() => { b.style.display = 'none'; }, 3800); }
function bindPet() {
  const win = $('petWin'); let drag = null; let moved = false;
  win.addEventListener('pointerdown', (e) => { if (e.target.closest('#petBar')) return; drag = { x: e.clientX - pet.x, y: e.clientY - pet.y }; moved = false; win.setPointerCapture(e.pointerId); win.style.cursor = 'grabbing'; });
  win.addEventListener('pointermove', (e) => { if (!drag) return; const nx = e.clientX - drag.x, ny = e.clientY - drag.y; if (Math.abs(nx - pet.x) + Math.abs(ny - pet.y) > 2) moved = true; pet.x = nx; pet.y = ny; win.style.left = pet.x + 'px'; win.style.top = pet.y + 'px'; });
  win.addEventListener('pointerup', () => { if (!drag) return; drag = null; win.style.cursor = 'grab'; if (!moved) say(PET_LINES[Math.floor(Math.random() * PET_LINES.length)]); layoutPet(); });
  win.addEventListener('wheel', (e) => { e.preventDefault(); S.petSize = Math.min(560, Math.max(220, S.petSize - Math.sign(e.deltaY) * 20)); layoutPet(); }, { passive: false });
  win.addEventListener('dblclick', () => exitPet());
  $('petBar').onclick = (e) => {
    const a = e.target.dataset.pet; if (!a) return;
    if (a === 'exit') exitPet();
    if (a === 'spin') pet.spin = !pet.spin;
    if (a === 'bigger') { S.petSize = Math.min(560, S.petSize + 40); layoutPet(); }
    if (a === 'smaller') { S.petSize = Math.max(220, S.petSize - 40); layoutPet(); }
    saveStore();
  };
}

// ---------------- 导航 / 工具栏 ----------------
function setTab(t) { document.querySelectorAll('#top button').forEach((b) => b.classList.toggle('on', b.dataset.tab === t)); document.querySelectorAll('.panel').forEach((p) => p.classList.toggle('on', p.id === 'p-' + t)); applyViewOffset(); }
function switchTab(t) {
  if (t === 'pet') { enterPet(); return; }
  if (document.body.classList.contains('pet')) { exitPet(); }
  setTab(t);
  if (t === 'gallery') buildGallery();
  if (t === 'settings') buildSettings();
}
function bindChrome() {
  document.querySelectorAll('#top button').forEach((b) => { b.onclick = () => switchTab(b.dataset.tab); });
  $('btnUI').onclick = () => { if (document.body.classList.contains('pet')) return; document.body.classList.toggle('hideui'); applyViewOffset(); };
  $('btnAB').onclick = async () => {
    compare = !compare; $('btnAB').classList.toggle('on', compare);
    $('abLabel').style.display = compare ? 'block' : 'none'; $('abLabel').textContent = '⬜ 原始渲染（未启用写实管线）';
    applyMaterials(); applyLighting();
  };
  $('btnShot').onclick = async () => {
    busy('正在渲染超清截图（2 倍分辨率 × 32 帧超采样）…'); await new Promise((r) => setTimeout(r, 40));
    const pr0 = renderer.getPixelRatio(); prOverride = Math.min(3, pr0 * 2); onResize(); setHairLOD(false);
    accum?.reset(); for (let i = 0; i < 32; i++) renderFrame(true);
    canvas.toBlob((b) => { download(`${ch.name}_超清_${Date.now()}.png`, b); prOverride = 0; onResize(); busy(null); }, 'image/png');
  };
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.body.classList.contains('pet')) exitPet(); });
}
function applyViewOffset() {
  const W = window.innerWidth, H = window.innerHeight;
  const panelOpen = !document.body.classList.contains('hideui') && !document.body.classList.contains('pet') && document.querySelector('.panel.on') && W > 820;
  if (panelOpen) camera.setViewOffset(W + 330, H, 330, 0, W, H); else camera.clearViewOffset();
  camera.updateProjectionMatrix();
}
function onResize() {
  if (document.body.classList.contains('pet')) { layoutPet(); return; }
  renderer.setPixelRatio(pixelRatio());
  camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight); post?.setSize(window.innerWidth, window.innerHeight);
  resizeAccum(); applyViewOffset(); invalidate();
}
function resizeAccum() { if (!accum) return; const sz = renderer.getDrawingBufferSize(new THREE.Vector2()); accum.setSize(sz.x, sz.y); }
window.addEventListener('resize', onResize);

// ---------------- 主循环 ----------------
const clock = new THREE.Clock();
const _dbs = new THREE.Vector2();
const blink = { next: 2.5, t: -1 };
function accumTarget() { return QA ? Math.min(6, qProfile().accum) : qProfile().accum; }
function renderFrame(forceAccum) {
  { const hpx = renderer.getDrawingBufferSize(_dbs).y; const pxs = { pxScale: 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) / Math.max(1, hpx) }; if (strandMat) setStrandParams(strandMat, pxs); if (babyMat) setStrandParams(babyMat, pxs); if (lashMat) lashMat.userData.u.uPxScale.value = pxs.pxScale; }
  if (post && fxOn('post.autoFocus') && eyeInfo) {
    const eyeW = head.localToWorld(eyeInfo.L.clone().add(eyeInfo.R).multiplyScalar(0.5));
    const d = camera.position.distanceTo(eyeW); if (Math.abs(post.bokeh.uniforms.focus.value - d) > 1e-4) post.bokeh.uniforms.focus.value = d;
  }
  if (backdrop) backdrop.update(renderer, camera);
  const useAccum = !compare && post && (fxOn('render.accum') || forceAccum) && !interacting;
  if (useAccum) {
    if (!accum) { accum = createAccumulator(renderer); const sz = renderer.getDrawingBufferSize(new THREE.Vector2()); accum.setSize(sz.x, sz.y); }
    const sz = renderer.getDrawingBufferSize(_dbs);
    const [jx, jy] = accum.count === 0 ? [0, 0] : accum.jitter(accum.count);
    camera.updateProjectionMatrix();
    camera.projectionMatrix.elements[8] += (jx * 2) / sz.x; camera.projectionMatrix.elements[9] += (jy * 2) / sz.y;
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    post.composer.renderToScreen = false;
    post.render(0.5); // 固定颗粒种子：累积时颗粒不被平均掉
    post.composer.renderToScreen = true;
    camera.updateProjectionMatrix();
    accum.accumulate(post.composer.readBuffer.texture);
  } else if (!compare && post) post.render(clock.getElapsedTime());
  else renderer.render(scene, camera);
  if (renderer.shadowMap.needsUpdate) renderer.shadowMap.needsUpdate = false;
}
let frames = 0; let lastT = 0; let lastRender = 0;
// 交互时临时降分辨率并关闭 AO/景深，松手后渲染一帧满画质（渐进式精修）
let interactT = 0;
function setInteract(on) {
  if (interacting === on) return;
  interacting = on;
  const pet = document.body.classList.contains('pet');
  renderer.setPixelRatio(pixelRatio());
  if (pet) layoutPet(); else { renderer.setSize(window.innerWidth, window.innerHeight); post?.setSize(window.innerWidth, window.innerHeight); resizeAccum(); }
  if (fxOn('render.hairLOD')) setHairLOD(on);
  if (post) { const pp = postParams(); post.set(on ? { ao: false, dof: false, diffusion: 0, halation: 0 } : { ao: pp.ao, dof: pp.dof, diffusion: pp.diffusion, halation: pp.halation }); }
  invalidate();
}
function pokeInteract() { setInteract(true); clearTimeout(interactT); interactT = setTimeout(() => setInteract(false), 260); }
canvas.addEventListener('pointerdown', () => { setInteract(true); clearTimeout(interactT); });
window.addEventListener('pointerup', () => { if (interacting) { clearTimeout(interactT); interactT = setTimeout(() => setInteract(false), 120); } });
canvas.addEventListener('wheel', pokeInteract, { passive: true });
// 任何面板操作都触发重绘
document.addEventListener('input', () => invalidate());
document.addEventListener('change', () => invalidate(3));

function tick(now) {
  requestAnimationFrame(tick);
  const t = now / 1000; const dt = Math.min(0.05, lastT ? t - lastT : 0.016); lastT = t;
  if (controls.enabled) controls.update(); // 阻尼惯性期间会触发 change → invalidate
  const isPet = document.body.classList.contains('pet');
  // 自然眨眼（活人神态）
  if (fxOn('render.blink') && gltfHead && !QA) {
    if (blink.t < 0 && t > blink.next) blink.t = 0;
    if (blink.t >= 0) {
      blink.t += dt; const k = Math.sin(Math.min(1, blink.t / 0.16) * Math.PI);
      setMorph('blink_left', k); setMorph('blink_right', k); invalidate(1);
      if (blink.t > 0.16) { blink.t = -1; blink.next = t + 2.5 + Math.random() * 4; setMorph('blink_left', 0); setMorph('blink_right', 0); invalidate(1); }
    }
  }
  if (isPet) {
    if (pet.spin) { head.rotation.y += dt * 0.8; invalidateShadow(); } else if (Math.abs(head.rotation.y) > 1e-3) { head.rotation.y *= 0.9; invalidateShadow(); }
    if (S.idle && Math.random() < 0.0008) say(PET_LINES[Math.floor(Math.random() * PET_LINES.length)]);
  }
  const accumulating = fxOn('render.accum') && accum && !interacting && !compare && accum.count > 0 && accum.count < accumTarget();
  if (dirty <= 0 && !accumulating) return;
  // 帧率上限：桌宠待机 30fps，其余按设置
  const cap = isPet && !pet.spin ? 30 : S.maxFps;
  if (now - lastRender < 1000 / cap - 2) return;
  lastRender = now;
  if (dirty > 0) dirty--;
  renderFrame();
  frames++;
  if (QA ? (accum && accum.count >= accumTarget()) || frames > 40 : frames === 3) window.__READY__ = true;
}

// ---------------- 启动 ----------------
let ready = false; let wantEnter = false;
function enterApp() { $('start').classList.add('hide'); }
function progress(p, msg) { $('startBar').style.width = Math.round(p * 100) + '%'; $('startStatus').textContent = msg; }
$('btnStart').onclick = () => { if (ready) enterApp(); else { wantEnter = true; $('btnStart').textContent = '加载中，马上进入…'; } };
async function boot() {
  try {
    progress(0.1, '解析头模…'); await new Promise((r) => setTimeout(r, 20));
    await loadHead();
    progress(0.35, '准备发型…'); await new Promise((r) => setTimeout(r, 20));
    if (qs.get('hair')) ch.hair = qs.get('hair');
    if (qs.get('look') && LOOKS[qs.get('look')]) { const v = LOOKS[qs.get('look')]; ch.look = qs.get('look'); ch.light = v.light; ch.film = v.film; ch.bg = v.bg; ch.skinP = { ...ch.skinP, ...v.skin }; ch.post = { dof: v.dof, aperture: 0.0016 }; }
    if (qs.get('hairmode')) S.hairMode = qs.get('hairmode');
    if (qs.get('face')) ch.faceArch = qs.get('face');
    for (const id of (qs.get('fxoff') || '').split(',').filter(Boolean)) ch.fx.bypass[id] = true; // 例：?fxoff=render.hairShadow,post.grain
    if (qs.get('density')) S.density = qs.get('density');
    applyShape();
    await loadHair(ch.hair);
    progress(0.75, '布置摄影棚灯光…'); await new Promise((r) => setTimeout(r, 20));
    stand = createDisplayStand(parts.skin, ch.stand); head.add(stand);
    if (qs.has('hideui')) document.body.classList.add('hideui');
    setView(qs.get('view') || 'portrait');
    applyViewOffset();
    await applyAll();
    buildStudio(); buildGallery(); buildSettings(); bindChrome(); bindPet();
    progress(1, isSoftware ? '已就绪（检测到软件渲染，已自动降低发丝密度）' : '已就绪');
    ready = true; $('btnStart').textContent = '▶ 点击开始';
    if (wantEnter || QA || qs.has('autostart')) enterApp();
    if (qs.has('pet')) enterPet();
    invalidate(4); requestAnimationFrame(tick);
  } catch (err) {
    console.error(err);
    $('startStatus').textContent = '加载失败：' + (err?.message || err) + '（请用 Chrome / Edge 并开启硬件加速）';
    window.__ERROR__ = String(err?.stack || err);
  }
}
boot();
