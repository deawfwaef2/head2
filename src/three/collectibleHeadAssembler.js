import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { createAnatomyTextures } from '../textures/anatomyTextureGenerator.js';
import { createSkinMicroMaps } from '../textures/skinTextureGenerator.js';
import { resolvePrivateModelUrl } from '../data/privateModelStore.js';
import { injectAestheticSubsurfaceScattering } from './photorealLighting.js';
import { REAL_HAIR_CATALOG } from '../data/defaultCollectibles.js';
import {
  buildSpecimenContainerGroup,
  buildSpecimenDecorGroup,
} from './specimenStageAndContainers.js';

const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

const arrayBufferCache = new Map();
const textCache = new Map();
const BUILTIN_HEAD_URL = '/models/daz_asian_head_base.glb';
const BUST_WORLD_SCALE = 115.0;
const CANONICAL_HEAD_HEIGHT = 0.58;
const CANONICAL_HEAD_CENTER_Y = -0.035;

/**
 * 7 Forensic Post-Mortem / Dead-Person Expression Presets ("死人各种表情")
 */
export const FORENSIC_EXPRESSION_PRESETS = [
  {
    id: 'dead_calm',
    label: '失活标本 · 默认微阖',
    shortLabel: '失活标本',
    desc: '瞳孔失焦、眼睑半阖、双唇松弛平直闭合（默认失活态）',
    weights: {},
  },
  {
    id: 'dead_half_open',
    label: '半睁迷离 · 微启失神',
    shortLabel: '半睁微启',
    desc: '眼睑半垂、瞳仁微向上翻、双唇微启露出洁白门齿的断气瞬间',
    weights: { expr_serene: 0.35, expr_hollow: 0.42 },
  },
  {
    id: 'dead_serene',
    label: '安详永眠 · 双目紧闭',
    shortLabel: '安详永眠',
    desc: '双目完全闭合、长睫低垂、面部肌肉彻底松弛安详',
    weights: { expr_serene: 0.85 },
  },
  {
    id: 'dead_hollow',
    label: '死不瞑目 · 翻白微张',
    shortLabel: '死不瞑目',
    desc: '眼帘半垂、黑仁向上翻白、下颌松弛微张露出门齿',
    weights: { expr_hollow: 0.75 },
  },
  {
    id: 'dead_shock',
    label: '惊愕断首 · 圆睁张口',
    shortLabel: '惊愕断首',
    desc: '双目惊恐圆睁、眉头高挑、下颌大张露出上下牙列与舌腔',
    weights: { expr_shock: 0.65 },
  },
  {
    id: 'dead_rigor',
    label: '临终痉挛 · 尸僵咬牙',
    shortLabel: '临终痉挛',
    desc: '眉心紧锁、大小眼痉挛抽搐、鼻翼耸起、痛苦咧嘴露齿',
    weights: { expr_rigor: 0.70 },
  },
  {
    id: 'dead_smile',
    label: '诡异尸笑 · 防腐微哂',
    shortLabel: '诡异尸笑',
    desc: '眼帘低垂、嘴角不对称诡异牵拉上扬（尸笑面容）',
    weights: { expr_smile: 0.65 },
  },
  {
    id: 'dead_flaccid',
    label: '面瘫弛缓 · 歪嘴吐舌',
    shortLabel: '面瘫吐舌',
    desc: '单侧眼闭合、单侧翻白眼、下颌脱臼偏斜伴舌尖微吐',
    weights: { expr_flaccid: 0.70 },
  },
];

export const HIGH_POLY_HAIR_CATALOG = REAL_HAIR_CATALOG.map((item) => ({
  id: item.id,
  label: item.label,
  shortLabel: item.shortLabel || item.label,
  category: item.category || '精选发型',
  desc: item.desc || '',
}));

function base64ToArrayBuffer(b64) {
  const binaryString = window.atob(b64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

async function fetchGlbArrayBuffer(url) {
  if (arrayBufferCache.has(url)) {
    return arrayBufferCache.get(url);
  }
  if (typeof window !== 'undefined' && window.__EMBEDDED_GLBS__ && window.__EMBEDDED_GLBS__[url]) {
    const buf = base64ToArrayBuffer(window.__EMBEDDED_GLBS__[url]);
    arrayBufferCache.set(url, buf);
    return buf;
  }
  const localUrl = await resolvePrivateModelUrl(url);
  const resp = await fetch(localUrl);
  if (!resp.ok) {
    throw new Error(`Failed to fetch GLB ${url}: ${resp.status}`);
  }
  const buf = await resp.arrayBuffer();
  arrayBufferCache.set(url, buf);
  return buf;
}

async function fetchObjText(url) {
  if (textCache.has(url)) return textCache.get(url);
  const localUrl = await resolvePrivateModelUrl(url);
  const resp = await fetch(localUrl);
  if (!resp.ok) throw new Error(`Failed to fetch OBJ ${url}: ${resp.status}`);
  const txt = await resp.text();
  textCache.set(url, txt);
  return txt;
}

function parseGlbBuffer(buffer) {
  return new Promise((resolve, reject) => {
    gltfLoader.parse(buffer.slice(0), '', (gltf) => resolve(gltf), (err) => reject(err));
  });
}

function textureDimensions(texture) {
  const image = texture?.image || texture?.source?.data;
  return {
    width: Number(image?.naturalWidth || image?.videoWidth || image?.width || 0),
    height: Number(image?.naturalHeight || image?.videoHeight || image?.height || 0),
  };
}

function prepareImportedMaterial(material) {
  if (!material) return;
  const colorTextureSlots = [
    'map', 'emissiveMap', 'specularColorMap', 'sheenColorMap',
  ];
  for (const slot of colorTextureSlots) {
    const texture = material[slot];
    if (!texture?.isTexture) continue;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
  }
  for (const key of Object.keys(material)) {
    const value = material[key];
    if (!value?.isTexture || colorTextureSlots.includes(key)) continue;
    value.colorSpace = THREE.NoColorSpace;
    value.anisotropy = 8;
    value.needsUpdate = true;
  }
}

function inspectSceneAsset(scene) {
  const seenMaterials = new Set();
  const seenTextures = new Set();
  const stats = {
    meshes: 0,
    vertices: 0,
    triangles: 0,
    materials: 0,
    textures: 0,
    maxTextureSize: 0,
    hasNormalMap: false,
    hasRoughnessMap: false,
    hasDisplacementMap: false,
  };

  scene.traverse((object) => {
    if (!object.isMesh) return;
    stats.meshes += 1;
    const geometry = object.geometry;
    stats.vertices += geometry?.attributes?.position?.count || 0;
    stats.triangles += geometry?.index
      ? Math.floor(geometry.index.count / 3)
      : Math.floor((geometry?.attributes?.position?.count || 0) / 3);
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    for (const material of materials) {
      if (!material) continue;
      seenMaterials.add(material);
      stats.hasNormalMap ||= Boolean(material.normalMap);
      stats.hasRoughnessMap ||= Boolean(material.roughnessMap);
      stats.hasDisplacementMap ||= Boolean(material.displacementMap);
      for (const key of Object.keys(material)) {
        const texture = material[key];
        if (!texture?.isTexture) continue;
        seenTextures.add(texture);
        const { width, height } = textureDimensions(texture);
        stats.maxTextureSize = Math.max(stats.maxTextureSize, width, height);
      }
    }
  });
  stats.materials = seenMaterials.size;
  stats.textures = seenTextures.size;
  return stats;
}

function fitImportedHead(scene) {
  const sourceBounds = new THREE.Box3().setFromObject(scene);
  const sourceSize = sourceBounds.getSize(new THREE.Vector3());
  const largestCrossSection = Math.max(sourceSize.x, sourceSize.z);
  if (!Number.isFinite(sourceSize.y) || sourceSize.y < 0.025 || largestCrossSection < 0.025) {
    throw new Error('模型尺寸无效或过小；请确认 GLB 中包含已裁切的头部网格。');
  }
  const aspect = sourceSize.y / largestCrossSection;
  if (aspect > 3.2) {
    throw new Error('模型比例像是完整人体而不是单独头部；请先在 Blender/DAZ 中裁成头部并封好颈口，再导入。');
  }

  const fitGroup = new THREE.Group();
  fitGroup.name = 'ImportedHeadFit';
  fitGroup.add(scene);
  fitGroup.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(fitGroup);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const fitScale = CANONICAL_HEAD_HEIGHT / Math.max(size.y, 1e-4);
  fitGroup.scale.setScalar(fitScale);
  fitGroup.position.set(
    -center.x * fitScale,
    CANONICAL_HEAD_CENTER_Y - center.y * fitScale,
    -center.z * fitScale,
  );
  fitGroup.userData.fitScale = fitScale;
  fitGroup.userData.sourceAspect = aspect;
  return fitGroup;
}

const PRESET_MORPH_BIASES = {
  fangyaoping:      { faceArchetype: 'cn_oval_scholar', eyebrowStyle: 'cn_scholar_natural', jawVLine: 0.08, chinLength: -0.06, cheekSoftness: 0.14, noseBridge: 0.04, eyeAlmond: 0.10, eyeTilt: -0.03, lipFullness: 0.04 },
  user_photo:       { faceArchetype: 'cn_round_babyface', eyebrowStyle: 'kr_straight_mist', jawVLine: -0.18, chinLength: -0.22, cheekSoftness: 0.28, noseBridge: 0.02, eyeAlmond: 0.18, eyeTilt: -0.08, lipFullness: 0.12 },
  chuxia:           { faceArchetype: 'cn_round_babyface', eyebrowStyle: 'kr_straight_mist', jawVLine: -0.18, chinLength: -0.22, cheekSoftness: 0.28, noseBridge: 0.02, eyeAlmond: 0.18, eyeTilt: -0.08, lipFullness: 0.12 },
  female_realistic: { faceArchetype: 'kr_idol_vline', eyebrowStyle: 'kr_idol_arch', jawVLine: 0.24, chinLength: -0.04, cheekSoftness: 0.16, noseBridge: 0.22, eyeAlmond: 0.12, eyeTilt: 0.16, lipFullness: 0.10 },
  linxi:            { faceArchetype: 'kr_idol_vline', eyebrowStyle: 'kr_idol_arch', jawVLine: 0.24, chinLength: -0.04, cheekSoftness: 0.16, noseBridge: 0.22, eyeAlmond: 0.12, eyeTilt: 0.16, lipFullness: 0.10 },
  female_2:         { faceArchetype: 'cn_classical_melon', eyebrowStyle: 'cn_willow_classical', jawVLine: 0.22, chinLength: 0.04, cheekSoftness: 0.04, noseBridge: 0.12, eyeAlmond: 0.08, eyeTilt: 0.10, lipFullness: 0.06 },
  suwan:            { faceArchetype: 'cn_classical_melon', eyebrowStyle: 'cn_willow_classical', jawVLine: 0.22, chinLength: 0.04, cheekSoftness: 0.04, noseBridge: 0.12, eyeAlmond: 0.08, eyeTilt: 0.10, lipFullness: 0.06 },
  female_3:         { faceArchetype: 'kr_sweet_heart', eyebrowStyle: 'kr_sweet_droop', jawVLine: 0.26, chinLength: -0.16, cheekSoftness: 0.22, noseBridge: 0.10, eyeAlmond: 0.20, eyeTilt: -0.04, lipFullness: 0.16 },
  qianxue:          { faceArchetype: 'kr_sweet_heart', eyebrowStyle: 'kr_sweet_droop', jawVLine: 0.26, chinLength: -0.16, cheekSoftness: 0.22, noseBridge: 0.10, eyeAlmond: 0.20, eyeTilt: -0.04, lipFullness: 0.16 },
  female_gentle:    { faceArchetype: 'cn_cold_royal', eyebrowStyle: 'cn_cold_sword', jawVLine: 0.16, chinLength: 0.14, cheekSoftness: -0.12, noseBridge: 0.20, eyeAlmond: 0.04, eyeTilt: 0.14, lipFullness: 0.02 },
  shenzhiwei:       { faceArchetype: 'cn_cold_royal', eyebrowStyle: 'cn_cold_sword', jawVLine: 0.16, chinLength: 0.14, cheekSoftness: -0.12, noseBridge: 0.20, eyeAlmond: 0.04, eyeTilt: 0.14, lipFullness: 0.02 },
};

const eyebrowTextureCache = new Map();

/**
 * Stage 28 · 8 款中韩根根分明真毛流眉形生成器 (`buildEyebrowTextureForStyle`)
 * Directly matches MakeHuman's Eyebrows UV layout:
 * - Left Brow (`x > 0`): `u` from `0.03` (inner head) -> `0.95` (outer tail), `v` centered at `0.405` (`0.318..0.490`)
 * - Right Brow (`x < 0`): `u` from `0.96` (inner head) -> `0.03` (outer tail), `v` centered at `0.670` (`0.580..0.760`)
 */
export function buildEyebrowTextureForStyle(styleId = 'cn_scholar_natural', hairColorHex = '#181416') {
  if (typeof document === 'undefined') return null;
  const cacheKey = `${styleId}_${hairColorHex}`;
  if (eyebrowTextureCache.has(cacheKey)) {
    return eyebrowTextureCache.get(cacheKey);
  }

  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, w, h);

  // Style parameters: thickness, archPeak (in v), tailSlope, lengthFactor, mistAlpha, strokeCount, wildHead
  const STYLE_PARAMS = {
    cn_scholar_natural:  { thick: 1.00, arch: 0.016, tailDrop: 0.010, len: 0.94, mist: 0.34, strokes: 480, wild: 0.35, color: [34, 27, 25] },
    kr_straight_mist:    { thick: 1.16, arch: 0.002, tailDrop: -0.004, len: 0.92, mist: 0.48, strokes: 440, wild: 0.15, color: [62, 46, 40] },
    kr_idol_arch:        { thick: 0.86, arch: 0.028, tailDrop: 0.022, len: 0.98, mist: 0.36, strokes: 520, wild: 0.40, color: [42, 32, 30] },
    cn_willow_classical: { thick: 0.54, arch: 0.038, tailDrop: 0.028, len: 0.98, mist: 0.26, strokes: 420, wild: 0.10, color: [28, 24, 26] },
    kr_sweet_droop:      { thick: 0.96, arch: -0.008, tailDrop: 0.032, len: 0.90, mist: 0.42, strokes: 450, wild: 0.25, color: [68, 48, 42] },
    cn_cold_sword:       { thick: 0.92, arch: 0.014, tailDrop: -0.026, len: 0.98, mist: 0.38, strokes: 540, wild: 0.45, color: [24, 20, 22] },
    kr_wild_feathered:   { thick: 1.22, arch: 0.022, tailDrop: 0.012, len: 0.96, mist: 0.24, strokes: 640, wild: 0.85, color: [30, 24, 22] },
    cn_tang_moth:        { thick: 0.82, arch: -0.012, tailDrop: 0.018, len: 0.76, mist: 0.44, strokes: 380, wild: 0.20, color: [32, 28, 30] },
  };
  const sp = STYLE_PARAMS[styleId] || STYLE_PARAMS.cn_scholar_natural;
  const [cr, cg, cb] = sp.color;

  const drawSingleBrowStrip = (uHead, uTail, vCenter) => {
    const dir = uTail > uHead ? 1 : -1;
    const spanU = Math.abs(uTail - uHead) * sp.len;

    const getSpineV = (t) => {
      // t = 0 (inner head) -> 1 (outer tail)
      // Note: in Eyebrow UV, smaller v is HIGHER on the forehead!
      const archCurve = Math.sin(Math.pow(t, 0.85) * Math.PI) * sp.arch;
      const tailShift = Math.pow(Math.max(0, t - 0.55) / 0.45, 1.5) * sp.tailDrop;
      return vCenter - archCurve + tailShift;
    };

    const getHalfThickV = (t) => {
      const headTaper = Math.pow(Math.min(1, t / 0.16), 0.7);
      const tailTaper = Math.pow(Math.max(0, 1 - Math.max(0, (t - 0.58) / 0.42)), 1.25);
      return 0.036 * sp.thick * headTaper * tailTaper;
    };

    // 1. Soft airbrushed brow-powder mist base
    for (let step = 0; step < 65; step++) {
      const t = step / 64;
      const u = uHead + dir * t * spanU;
      const v = getSpineV(t);
      const rx = w * 0.022;
      const ry = Math.max(2, h * getHalfThickV(t) * 1.15);
      ctx.save();
      ctx.translate(u * w, v * h);
      ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
      const a = sp.mist * Math.sin(t * Math.PI) * 0.18;
      g.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${a})`);
      g.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. 500+ individual tapered Bezier hair strokes (根根分明真毛流)
    let seed = (styleId.charCodeAt(0) * 997 + styleId.charCodeAt(3) * 131 + (dir > 0 ? 17 : 53)) >>> 0;
    const rnd = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    ctx.lineCap = 'round';
    for (let i = 0; i < sp.strokes; i++) {
      const t = Math.pow(rnd(), 0.92) * 0.97;
      const u0 = uHead + dir * t * spanU;
      const spineV = getSpineV(t);
      const ht = getHalfThickV(t);
      const offsetNorm = (rnd() - 0.5) * 1.65;
      const v0 = spineV + offsetNorm * ht;

      // Hair growth angle: inner head hairs brush upward (`-v`), mid/tail hairs stream outward along spine
      const isInnerHead = t < 0.20;
      const strokeLenU = (0.042 + rnd() * 0.048) * (1.0 - t * 0.32);
      const u1 = u0 + dir * strokeLenU * (isInnerHead ? (0.45 + 0.55 * (t / 0.20)) : 1.0);
      const spineV1 = getSpineV(Math.min(1, t + strokeLenU));
      const upBrush = isInnerHead ? (-0.028 * (1.0 - t / 0.20) * (0.6 + sp.wild)) : 0;
      const convergeToSpine = spineV1 + offsetNorm * ht * (t > 0.65 ? 0.25 : 0.72) + upBrush;

      const cpU = (u0 + u1) * 0.5 + dir * 0.008;
      const cpV = (v0 + convergeToSpine) * 0.5 - 0.006 * (1 - t);

      const alpha = (0.38 + rnd() * 0.52) * Math.min(1, t / 0.06) * Math.min(1, (1 - t) / 0.08);
      const shade = 0.82 + rnd() * 0.34;
      ctx.strokeStyle = `rgba(${Math.round(cr * shade)}, ${Math.round(cg * shade)}, ${Math.round(cb * shade)}, ${alpha.toFixed(3)})`;
      ctx.lineWidth = (0.85 + rnd() * 1.25) * (t > 0.75 ? 0.72 : 1.0);

      ctx.beginPath();
      ctx.moveTo(u0 * w, v0 * h);
      ctx.quadraticCurveTo(cpU * w, cpV * h, u1 * w, convergeToSpine * h);
      ctx.stroke();
    }
  };

  // Left Brow (u: 0.04 -> 0.94, vCenter: 0.408) & Right Brow (u: 0.95 -> 0.05, vCenter: 0.672)
  drawSingleBrowStrip(0.045, 0.945, 0.408);
  drawSingleBrowStrip(0.945, 0.045, 0.672);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  eyebrowTextureCache.set(cacheKey, tex);
  return tex;
}

const characterSkinOverlayCache = new Map();

/**
 * Stage 28 · 6 位角色专属中韩少女皮肤肌理、骨相修容、卧蚕/黑眼圈、腮红、唇妆与特征痣贴图生成器
 * Uses the EXACT verified MakeHuman face UV coordinates (`u: 0.78..0.95` top-to-bottom, `v: 0.44..0.59` left-to-right, midline `v = 0.5168`)!
 */
function buildCharacterSkinOverlayMap(baseSkinMap, presetKey = 'user_photo', eyebrowStyle = '') {
  if (!baseSkinMap?.image || typeof document === 'undefined') return baseSkinMap;
  const img = baseSkinMap.image;
  const w = img.width || 1536;
  const h = img.height || 1536;
  const cacheKey = `v28_${presetKey}_${eyebrowStyle}_${w}x${h}`;
  if (characterSkinOverlayCache.has(cacheKey)) {
    return characterSkinOverlayCache.get(cacheKey);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, w, h);

  // Helper: paint an elliptical soft radial gradient in MakeHuman face UV space
  // Remember: `u` is vertical (forehead 0.802 -> chin 0.946), `v` is horizontal (left cheek 0.460 <- midline 0.5168 -> right cheek 0.573)
  const paintFaceUV = (u, v, ru, rv, colInner, colMid = null, colOuter = 'rgba(0,0,0,0)') => {
    ctx.save();
    ctx.translate(u * w, v * h);
    ctx.scale(1, (rv * h) / Math.max(ru * w, 1e-4));
    const rad = ru * w;
    const g = ctx.createRadialGradient(0, 0, rad * 0.04, 0, 0, rad);
    g.addColorStop(0, colInner);
    if (colMid) g.addColorStop(0.52, colMid);
    g.addColorStop(1, colOuter);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, rad, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  // 1. Softly neutralize the baked-in Western eyebrow on the base skin texture (at u=0.8252, v=0.4815 & 0.5522)
  // so our 8 custom East Asian eyebrow styles have zero ghosting underneath!
  paintFaceUV(0.8250, 0.4815, 0.0085, 0.022, 'rgba(232, 196, 176, 0.72)', 'rgba(232, 196, 176, 0.38)');
  paintFaceUV(0.8250, 0.5522, 0.0085, 0.022, 'rgba(232, 196, 176, 0.72)', 'rgba(232, 196, 176, 0.38)');

  // 2. Character-Specific Complexion Undertone, Blush, Eye Makeup, Aegyo-sal/Dark Circles, Nose & Lip Tint
  const isChuxia = presetKey === 'user_photo' || presetKey === 'chuxia';
  const isFang = presetKey === 'fangyaoping';
  const isLinxi = presetKey === 'female_realistic' || presetKey === 'linxi';
  const isSuwan = presetKey === 'female_2' || presetKey === 'suwan';
  const isQianxue = presetKey === 'female_3' || presetKey === 'qianxue';
  const isShen = presetKey === 'female_gentle' || presetKey === 'shenzhiwei';

  if (isChuxia) {
    // 🍑 初夏 (19岁中式圆润娃娃脸 · 蜜桃粉白婴儿肌 + 饱满圆润蜜桃腮红 + 卧蚕高光 + 水润蜜桃咬唇)
    paintFaceUV(0.865, 0.5168, 0.115, 0.088, 'rgba(255, 242, 238, 0.24)', 'rgba(255, 236, 232, 0.12)');
    // Plump round baby-face peach apple-cheek blush (苹果肌大面积蜜桃粉红晕)
    paintFaceUV(0.8625, 0.4740, 0.019, 0.022, 'rgba(244, 114, 138, 0.36)', 'rgba(248, 148, 164, 0.18)');
    paintFaceUV(0.8625, 0.5596, 0.019, 0.022, 'rgba(244, 114, 138, 0.36)', 'rgba(248, 148, 164, 0.18)');
    // Cute pinky nose-tip & chin blush (幼态鼻头与下巴微粉)
    paintFaceUV(0.8682, 0.5168, 0.0075, 0.0085, 'rgba(240, 110, 128, 0.30)');
    paintFaceUV(0.9380, 0.5168, 0.0110, 0.0130, 'rgba(240, 120, 138, 0.22)');
    // Sweet Aegyo-sal (卧蚕珠光提亮 + 卧蚕下缘浅影)
    paintFaceUV(0.8458, 0.4835, 0.0032, 0.013, 'rgba(255, 246, 240, 0.42)');
    paintFaceUV(0.8458, 0.5501, 0.0032, 0.013, 'rgba(255, 246, 240, 0.42)');
    paintFaceUV(0.8492, 0.4835, 0.0028, 0.013, 'rgba(135, 78, 76, 0.22)');
    paintFaceUV(0.8492, 0.5501, 0.0028, 0.013, 'rgba(135, 78, 76, 0.22)');
    // Juicy peach-strawberry gradient petal lips (蜜桃粉嫩咬唇妆)
    paintFaceUV(0.8935, 0.5168, 0.0052, 0.021, 'rgba(228, 78, 104, 0.55)', 'rgba(238, 118, 136, 0.25)');
    paintFaceUV(0.9002, 0.5168, 0.0058, 0.020, 'rgba(224, 72, 98, 0.58)', 'rgba(238, 118, 136, 0.26)');
  } else if (isFang) {
    // 📖 方尧平 (19岁广东怀集高考女状元 · 岭南暖象牙素颜学生肌 + 熬夜刷题淡青眼圈 + 素颜淡粉唇)
    paintFaceUV(0.865, 0.5168, 0.115, 0.088, 'rgba(248, 222, 198, 0.20)', 'rgba(242, 214, 190, 0.10)');
    // Late-night study infraorbital dark circles (高三熬夜刷题淡青紫黑眼圈)
    paintFaceUV(0.8485, 0.4840, 0.0065, 0.015, 'rgba(76, 56, 78, 0.26)', 'rgba(92, 68, 86, 0.12)');
    paintFaceUV(0.8485, 0.5496, 0.0065, 0.015, 'rgba(76, 56, 78, 0.26)', 'rgba(92, 68, 86, 0.12)');
    // Barely-there natural student cheek warmth
    paintFaceUV(0.8640, 0.4730, 0.015, 0.016, 'rgba(215, 128, 122, 0.15)');
    paintFaceUV(0.8640, 0.5606, 0.015, 0.016, 'rgba(215, 128, 122, 0.15)');
    // Un-made-up natural pale rose student lips
    paintFaceUV(0.8935, 0.5168, 0.0048, 0.020, 'rgba(188, 104, 110, 0.36)');
    paintFaceUV(0.9000, 0.5168, 0.0052, 0.019, 'rgba(184, 98, 106, 0.38)');
  } else if (isLinxi) {
    // ✨ 林汐 (21岁韩系财阀千金V脸 · 韩系冷白水光瓷肌 + 立体鼻影山根高光 + 烟熏大地眼尾 + 冷调梅子浆果唇)
    paintFaceUV(0.865, 0.5168, 0.115, 0.088, 'rgba(245, 240, 252, 0.28)', 'rgba(238, 232, 248, 0.14)');
    // Korean high nose-bridge highlight & bilateral nose contour shadow (韩式高光山根与立体鼻影)
    paintFaceUV(0.8480, 0.5168, 0.0180, 0.0032, 'rgba(255, 252, 255, 0.46)');
    paintFaceUV(0.8675, 0.5168, 0.0042, 0.0042, 'rgba(255, 250, 252, 0.52)');
    paintFaceUV(0.8420, 0.5085, 0.0140, 0.0040, 'rgba(92, 68, 64, 0.24)');
    paintFaceUV(0.8420, 0.5251, 0.0140, 0.0040, 'rgba(92, 68, 64, 0.24)');
    // Korean smoky champagne-taupe outer eyelid & upturned cat-eye liner shadow
    paintFaceUV(0.8365, 0.4755, 0.0065, 0.014, 'rgba(72, 44, 52, 0.38)', 'rgba(110, 72, 78, 0.18)');
    paintFaceUV(0.8365, 0.5581, 0.0065, 0.014, 'rgba(72, 44, 52, 0.38)', 'rgba(110, 72, 78, 0.18)');
    // Plump Korean Aegyo-sal highlight
    paintFaceUV(0.8458, 0.4835, 0.0028, 0.013, 'rgba(255, 248, 245, 0.45)');
    paintFaceUV(0.8458, 0.5501, 0.0028, 0.013, 'rgba(255, 248, 245, 0.45)');
    // High oblique cheekbone cool rose-mauve blush
    paintFaceUV(0.8580, 0.4675, 0.015, 0.018, 'rgba(198, 92, 128, 0.26)');
    paintFaceUV(0.8580, 0.5661, 0.015, 0.018, 'rgba(198, 92, 128, 0.26)');
    // Rich Korean velvet plum-berry lip tint (韩系冷调梅子玫瑰唇釉)
    paintFaceUV(0.8935, 0.5168, 0.0052, 0.021, 'rgba(152, 34, 66, 0.68)', 'rgba(178, 58, 88, 0.32)');
    paintFaceUV(0.9002, 0.5168, 0.0058, 0.020, 'rgba(142, 28, 58, 0.72)', 'rgba(178, 58, 88, 0.35)');
  } else if (isSuwan) {
    // 🌸 苏晚 (20岁江南古典瓜子脸 · 温润羊脂暖玉肌 + 杏粉远山眼影 + 古典花瓣点绛唇)
    paintFaceUV(0.865, 0.5168, 0.115, 0.088, 'rgba(255, 244, 228, 0.24)', 'rgba(252, 238, 218, 0.12)');
    // Classical warm cinnabar-apricot upper lid & outer corner tint
    paintFaceUV(0.8355, 0.4795, 0.0060, 0.014, 'rgba(186, 88, 82, 0.28)');
    paintFaceUV(0.8355, 0.5541, 0.0060, 0.014, 'rgba(186, 88, 82, 0.28)');
    // Gentle classical apricot cheek flush
    paintFaceUV(0.8635, 0.4725, 0.016, 0.018, 'rgba(224, 118, 108, 0.26)');
    paintFaceUV(0.8635, 0.5611, 0.016, 0.018, 'rgba(224, 118, 108, 0.26)');
    // Classical Chinese inner-lip cinnabar gradient ("点绛唇"：唇心浓朱砂、唇周柔和)
    paintFaceUV(0.8962, 0.5168, 0.0045, 0.013, 'rgba(196, 38, 48, 0.75)', 'rgba(212, 82, 88, 0.32)');
  } else if (isQianxue) {
    // 💖 千雪 (18岁韩系初恋甜美心形脸 / 古典舞首席 · 舞台雪瓷肌 + 眼下桃花红晕 + 浓郁山茶红唇)
    paintFaceUV(0.865, 0.5168, 0.115, 0.088, 'rgba(255, 248, 250, 0.32)', 'rgba(255, 242, 246, 0.16)');
    // Dramatic stage cherry-blossom eye corner & high under-eye blush (舞台桃花眼尾与眼下微醺红晕)
    paintFaceUV(0.8390, 0.4730, 0.0075, 0.015, 'rgba(218, 52, 82, 0.42)');
    paintFaceUV(0.8390, 0.5606, 0.0075, 0.015, 'rgba(218, 52, 82, 0.42)');
    paintFaceUV(0.8555, 0.4745, 0.016, 0.020, 'rgba(236, 88, 114, 0.38)', 'rgba(244, 128, 148, 0.18)');
    paintFaceUV(0.8555, 0.5591, 0.016, 0.020, 'rgba(236, 88, 114, 0.38)', 'rgba(244, 128, 148, 0.18)');
    // Vibrant camellia-crimson stage lips
    paintFaceUV(0.8935, 0.5168, 0.0054, 0.021, 'rgba(208, 28, 52, 0.74)', 'rgba(224, 64, 84, 0.36)');
    paintFaceUV(0.9002, 0.5168, 0.0060, 0.020, 'rgba(198, 24, 48, 0.78)', 'rgba(224, 64, 84, 0.38)');
  } else if (isShen) {
    // ❄️ 沈知微 (23岁中式清冷高智御姐脸 · 冷调象牙橄榄肌 + 深邃大地修容 + 干枯玫瑰哑光唇)
    paintFaceUV(0.865, 0.5168, 0.115, 0.088, 'rgba(236, 222, 210, 0.22)');
    // Deep intellectual eye-socket & cheekbone hollow contour (高智感眼窝与颊凹修容)
    paintFaceUV(0.8345, 0.4820, 0.0070, 0.016, 'rgba(86, 56, 48, 0.34)');
    paintFaceUV(0.8345, 0.5516, 0.0070, 0.016, 'rgba(86, 56, 48, 0.34)');
    paintFaceUV(0.8780, 0.4610, 0.018, 0.014, 'rgba(96, 64, 54, 0.24)');
    paintFaceUV(0.8780, 0.5726, 0.018, 0.014, 'rgba(96, 64, 54, 0.24)');
    // Dried-rose matte lips (干枯玫瑰哑光豆沙唇)
    paintFaceUV(0.8935, 0.5168, 0.0050, 0.021, 'rgba(148, 58, 68, 0.62)', 'rgba(168, 82, 90, 0.28)');
    paintFaceUV(0.9002, 0.5168, 0.0056, 0.020, 'rgba(142, 54, 64, 0.65)', 'rgba(168, 82, 90, 0.30)');
  }

  // 3. Universal realistic anatomical micro-depth on TRUE face UV coordinates (alar wings, philtrum dimple, sub-labial crease)
  paintFaceUV(0.8729, 0.5008, 0.0055, 0.0055, 'rgba(78, 38, 34, 0.22)');
  paintFaceUV(0.8729, 0.5329, 0.0055, 0.0055, 'rgba(78, 38, 34, 0.22)');
  paintFaceUV(0.8825, 0.5168, 0.0055, 0.0040, 'rgba(88, 46, 42, 0.16)');
  paintFaceUV(0.9120, 0.5168, 0.0055, 0.0110, 'rgba(74, 42, 40, 0.18)');

  // 4. Signature Beauty Marks (特征美人痣)
  const paintMole = (u, v, radPx = 2.4, alpha = 0.78) => {
    const cx = u * w;
    const cy = v * h;
    const grad = ctx.createRadialGradient(cx, cy, 0.2, cx, cy, radPx);
    grad.addColorStop(0.0, `rgba(38, 20, 16, ${alpha})`);
    grad.addColorStop(0.55, `rgba(58, 34, 26, ${alpha * 0.65})`);
    grad.addColorStop(1.0, 'rgba(58, 34, 26, 0.0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radPx, 0, Math.PI * 2);
    ctx.fill();
  };

  if (isChuxia) {
    paintMole(0.8847, 0.5543, w * 0.0015, 0.78);
    paintMole(0.8895, 0.5640, w * 0.0016, 0.82);
    paintMole(0.9042, 0.5718, w * 0.0015, 0.78);
  } else if (isFang) {
    paintMole(0.8510, 0.4510, w * 0.0013, 0.68);
  } else if (isLinxi) {
    paintMole(0.8475, 0.4685, w * 0.0016, 0.85);
  } else if (isSuwan) {
    paintMole(0.8492, 0.5562, w * 0.0015, 0.82);
  } else if (isQianxue) {
    paintMole(0.8585, 0.5168, w * 0.0016, 0.85);
  } else if (isShen) {
    paintMole(0.8885, 0.4765, w * 0.0016, 0.82);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = baseSkinMap.flipY;
  tex.wrapS = baseSkinMap.wrapS;
  tex.wrapT = baseSkinMap.wrapT;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  characterSkinOverlayCache.set(cacheKey, tex);
  return tex;
}

/**
 * 9-Axis Real-Time Interactive Player Hair Editing & Fine-Tuning ("允许玩家编辑微调")
 * Works identically on both built-in 28 artist hairstyles and external player-imported .glb/.obj hairstyles.
 * Because Pass 1 (Core) and Pass 2 (Silky Wisps) share the same BufferGeometry, updating `geo.attributes.position`
 * once updates both passes in lockstep.
 */
export function applyArtistHairFineTuning(rootGroup, morphs = {}) {
  const hairGroup = rootGroup?.getObjectByName('HairGroup');
  if (!hairGroup) return;

  const bangsLen = Math.max(-0.6, Math.min(0.9, Number(morphs.bangsLength ?? 0)));
  const bangsPart = Math.max(-0.6, Math.min(0.6, Number(morphs.bangsParting ?? 0)));
  const hairVol = Math.max(-0.5, Math.min(0.9, Number(morphs.hairVolume ?? 0)));
  const hairLen = Math.max(-0.6, Math.min(0.9, Number(morphs.hairLength ?? 0)));
  const sideburn = Math.max(-0.6, Math.min(0.7, Number(morphs.sideburnLock ?? 0)));
  const hairFlare = Math.max(-0.7, Math.min(0.7, Number(morphs.hairFlare ?? 0)));
  const offX = Math.max(-0.5, Math.min(0.5, Number(morphs.hairOffsetX ?? 0)));
  const offY = Math.max(-0.5, Math.min(0.5, Number(morphs.hairOffsetY ?? 0)));
  const offZ = Math.max(-0.5, Math.min(0.5, Number(morphs.hairOffsetZ ?? 0)));
  const uScale = Math.max(0.82, Math.min(1.22, Number(morphs.hairScale ?? 1.0)));
  const neckClear = Math.max(0.0, Math.min(1.0, Number(rootGroup.userData.neckClearance ?? 0.45)));

  hairGroup.position.set(offX * 0.035, offY * 0.035, offZ * 0.035);
  hairGroup.scale.setScalar(uScale);

  const hcX = 0.0, hcY = 0.025, hcZ = 0.0;
  const visitedGeos = new Set();

  hairGroup.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;
    if (child.name === 'ScalpRootFeatherCap') return;
    const geo = child.geometry;
    if (visitedGeos.has(geo)) return;
    visitedGeos.add(geo);

    const posAttr = geo.attributes.position;
    if (!geo.userData.basePositions) {
      geo.userData.basePositions = Float32Array.from(posAttr.array);
    }
    const base = geo.userData.basePositions;
    const out = posAttr.array;
    const count = posAttr.count;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = base[i3];
      let y = base[i3 + 1];
      let z = base[i3 + 2];

      if (Math.abs(hairVol) > 1e-4 && y > -0.02) {
        const wCrown = Math.min(1.0, Math.max(0.0, (y + 0.02) / 0.09));
        const rx = x - hcX;
        const ry = y - hcY;
        const rz = z - hcZ;
        x += rx * (hairVol * 0.16 * wCrown);
        if (ry > 0) y += ry * (hairVol * 0.22 * wCrown);
        z += rz * (hairVol * 0.12 * wCrown);
      }

      if ((Math.abs(bangsLen) > 1e-4 || Math.abs(bangsPart) > 1e-4) && z > 0.042 && y > -0.035 && Math.abs(x) < 0.068) {
        const wFront = Math.min(1.0, Math.max(0.0, (z - 0.042) / 0.045));
        const wCenter = Math.min(1.0, Math.max(0.0, 1.0 - Math.abs(x) / 0.068));
        const wLowerBangs = Math.min(1.0, Math.max(0.0, (0.065 - y) / 0.065));
        const wBangs = wFront * wCenter * wLowerBangs;
        y -= bangsLen * 0.028 * wBangs;
        z += Math.max(0.0, bangsLen) * 0.005 * wBangs;
        if (Math.abs(bangsPart) > 1e-4) {
          const signX = x >= 0 ? 1.0 : -1.0;
          const partStrength = Math.exp(-Math.pow(Math.abs(x) / 0.032, 2.0));
          x += signX * bangsPart * 0.022 * wFront * wLowerBangs * partStrength;
          y += Math.max(0.0, bangsPart) * 0.010 * wFront * wLowerBangs * partStrength;
        }
      }

      if (Math.abs(sideburn) > 1e-4 && z > -0.015 && y < 0.025 && Math.abs(x) > 0.032) {
        const wSide = Math.min(1.0, Math.max(0.0, (0.025 - y) / 0.10));
        const signX = x >= 0 ? 1.0 : -1.0;
        x -= signX * sideburn * 0.020 * wSide;
        z += sideburn * 0.010 * wSide;
      }

      if ((Math.abs(hairLen) > 1e-4 || Math.abs(hairFlare) > 1e-4) && y < -0.015) {
        const wTip = Math.min(1.0, Math.max(0.0, (-0.015 - y) / 0.11));
        y -= hairLen * 0.055 * wTip;
        const signX = x >= 0 ? 1.0 : -1.0;
        x += signX * hairFlare * 0.028 * (wTip * wTip);
        z += hairFlare * 0.014 * (wTip * wTip);
      }

      if (neckClear > 0.05 && y < -0.072 && z < 0.04) {
        const below = -0.072 - y;
        if (below > 0) {
          const lift = Math.min(below, below * neckClear * 0.65);
          y += lift;
        }
      }

      out[i3] = x;
      out[i3 + 1] = y;
      out[i3 + 2] = z;
    }

    posAttr.needsUpdate = true;
  });
}

/**
 * Stage 28 · 中韩青年女头型 3D 骨相与软组织精雕引擎 (`applyEastAsianCraniofacialSculpt`)
 * 1. Baseline De-American-Asian (`去美式亚裔高颧骨方腮修正`):
 *    - Narrows protruding lateral zygomatic arches (`|x| in [0.040, 0.078], y in [-0.020, 0.028], z in [0.008, 0.078]`)
 *    - Softens angular square gonial jaw corners (`|x| in [0.034, 0.068], y in [-0.065, -0.020]`)
 *    - Smooths heavy outer brow bone & lifts East Asian high cranial crown (`高颅顶`)
 * 2. Applies 6 Distinct Chinese & Korean Young Female Face Archetypes (`faceArchetype`):
 *    - `cn_round_babyface` (`🍑 中式幼态圆润娃娃脸` — 初夏): Plump round baby-fat cheeks, short rounded moon-chin, round puppy eyes
 *    - `kr_idol_vline` (`✨ 韩系财阀千金V脸` — 林汐): Narrow Korean face, contoured V-jaw, plump anterior apple muscles + aegyo-sal, upturned nose & cat eyes
 *    - `cn_oval_scholar` (`📖 中式清秀书卷鹅蛋脸` — 方尧平): Authentic southern Chinese 19yo female student oval face
 *    - `cn_classical_melon` (`🌸 江南古典瓜子脸` — 苏晚): Narrow temples, smooth upper cheeks tapering to slender melon-seed chin, phoenix eyes
 *    - `kr_sweet_heart` (`💖 韩系甜美心形脸` — 千雪): Full heart-shaped upper apple cheeks tapering to compact petite chin, dewy eyes & fuller lips
 *    - `cn_cold_royal` (`❄️ 中式清冷高智御姐脸` — 沈知微): Slightly elongated intellectual proportion, sculpted cheeks, high straight nose bridge
 * 3. Sculpt 3D `Eyebrows` mesh geometry to match the selected `eyebrowStyle` arch/droop/sword slope.
 */
export function applyEastAsianCraniofacialSculpt(rootGroup, faceArchetype = 'cn_oval_scholar', eyebrowStyle = 'cn_scholar_natural') {
  const dazContainer = rootGroup?.getObjectByName('RealDazHeadContainer');
  if (!dazContainer) return;

  const smoothBell = (val, center, halfWidth) => {
    const d = Math.abs(val - center) / Math.max(halfWidth, 1e-5);
    if (d >= 1.0) return 0.0;
    const t = 1.0 - d * d;
    return t * t;
  };

  dazContainer.traverse((child) => {
    if (!child.isMesh || !child.geometry?.attributes?.position) return;
    const geo = child.geometry;
    const posAttr = geo.attributes.position;
    if (!geo.userData.rawDazPositions) {
      geo.userData.rawDazPositions = Float32Array.from(posAttr.array);
    }
    const base = geo.userData.rawDazPositions;
    const out = posAttr.array;
    const count = posAttr.count;
    const isBrowMesh = child.name === 'Eyebrows' || child.material?.name === 'Eyebrow';

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = base[i3];
      let y = base[i3 + 1];
      let z = base[i3 + 2];
      const absX = Math.abs(x);
      const signX = x >= 0 ? 1.0 : -1.0;

      // Neck protection weight: keep C4/C5 neck base (`y < -0.072`) anchored cleanly
      const wHead = Math.min(1.0, Math.max(0.0, (y + 0.075) / 0.025));

      if (wHead > 0.001) {
        // ====================================================================
        // STEP A: Baseline De-American-Asian Refinement (去美式亚裔高颧骨方腮基底)
        // ====================================================================
        // 1. Tuck protruding lateral zygomatic arch (外扩高颧弓内推)
        const wZygoY = smoothBell(y, 0.002, 0.028);
        const wZygoZ = smoothBell(z, 0.046, 0.040);
        const wZygoX = Math.min(1.0, Math.max(0.0, (absX - 0.036) / 0.032));
        const wZygo = wZygoY * wZygoZ * wZygoX * wHead;
        x -= signX * (absX - 0.034) * 0.145 * wZygo;

        // 2. Soften wide square mandibular gonial angle (去方腮/柔和下颌角)
        const wGonY = smoothBell(y, -0.042, 0.026);
        const wGonZ = smoothBell(z, 0.034, 0.042);
        const wGonX = Math.min(1.0, Math.max(0.0, (absX - 0.030) / 0.032));
        const wGon = wGonY * wGonZ * wGonX * wHead;
        x -= signX * (absX - 0.028) * 0.135 * wGon;

        // 3. Soften heavy Western lateral brow ridge & fill smooth East Asian forehead
        const wBrowY = smoothBell(y, 0.028, 0.016);
        const wBrowZ = Math.min(1.0, Math.max(0.0, (z - 0.055) / 0.035));
        const wBrowOuter = smoothBell(absX, 0.042, 0.022);
        z -= 0.0026 * wBrowY * wBrowZ * wBrowOuter * wHead;
        const wForeheadCenter = smoothBell(y, 0.052, 0.028) * smoothBell(absX, 0.0, 0.046) * Math.min(1.0, Math.max(0.0, (z - 0.045) / 0.045));
        z += 0.0030 * wForeheadCenter * wHead;

        // 4. East Asian High Cranial Crown (中韩头包脸高颅顶)
        if (y > 0.048) {
          const wCrown = Math.min(1.0, (y - 0.048) / 0.065);
          y += 0.0065 * wCrown;
          x *= 1.0 + 0.032 * wCrown;
        }

        // ====================================================================
        // STEP B: 6 Distinct Chinese & Korean Young Female Face Archetypes
        // ====================================================================
        if (faceArchetype === 'cn_round_babyface') {
          // 🍑 中式幼态圆润娃娃脸 (初夏):
          // - Shorten lower face & chin (`y < 0.008` lifted upward)
          // - Round out chin tip (widen narrow chin tip & soften point so it's a round moon face)
          // - Plump soft round buccal baby-fat cheeks (`婴儿肥脸颊与苹果肌饱满外扩`)
          if (y < 0.010) {
            const wLower = Math.min(1.0, (0.010 - y) / 0.080) * wHead;
            y += 0.0082 * wLower;
          }
          // Plump round buccal & apple cheeks (饱满圆润脸颊 + 婴儿肥)
          const wBabyCheekY = smoothBell(y, -0.024, 0.034);
          const wBabyCheekZ = Math.min(1.0, Math.max(0.0, (z - 0.018) / 0.055));
          const wBabyCheekX = smoothBell(absX, 0.046, 0.030);
          const wBabyCheek = wBabyCheekY * wBabyCheekZ * wBabyCheekX * wHead;
          x += signX * 0.0072 * wBabyCheek;
          z += 0.0058 * wBabyCheek;

          // Round out the chin so it is a cute circular arc, never sharp
          const wChinTip = smoothBell(y, -0.058, 0.018) * Math.min(1.0, Math.max(0.0, (z - 0.045) / 0.045)) * wHead;
          x *= 1.0 + 0.14 * wChinTip;
          z -= 0.0022 * wChinTip * smoothBell(absX, 0.0, 0.016);

          // Rounder, larger puppy eyes
          const wEyeZone = smoothBell(y, 0.012, 0.014) * smoothBell(absX, 0.031, 0.018) * Math.min(1.0, Math.max(0.0, (z - 0.055) / 0.030));
          y += (y - 0.012) * 0.18 * wEyeZone;
        } else if (faceArchetype === 'kr_idol_vline') {
          // ✨ 韩系财阀千金鹅蛋V脸 (林汐):
          // - Sleek narrower overall face width
          // - Strong V-line jaw contour tapering to a dainty upturned Korean V-chin
          // - Plump anterior Korean apple muscles + Aegyo-sal + high upturned nose + cat-eye tilt
          x *= 1.0 - 0.075 * wHead;
          const wVJaw = smoothBell(y, -0.038, 0.028) * Math.min(1.0, Math.max(0.0, (absX - 0.018) / 0.045)) * wHead;
          x -= signX * (absX - 0.016) * 0.165 * wVJaw;

          // Dainty upturned Korean V-chin tip
          const wKrChin = smoothBell(y, -0.060, 0.016) * smoothBell(absX, 0.0, 0.022) * Math.min(1.0, Math.max(0.0, (z - 0.050) / 0.040)) * wHead;
          z += 0.0038 * wKrChin;
          y += 0.0024 * wKrChin;
          x *= 1.0 - 0.12 * wKrChin;

          // Plump anterior Korean apple muscle (韩系饱满前苹果肌与卧蚕)
          const wApple = smoothBell(y, -0.006, 0.018) * smoothBell(absX, 0.028, 0.018) * Math.min(1.0, Math.max(0.0, (z - 0.055) / 0.035)) * wHead;
          z += 0.0052 * wApple;

          // High straight Korean nose bridge & upturned tip
          const wNose = smoothBell(y, -0.002, 0.022) * smoothBell(absX, 0.0, 0.014) * Math.min(1.0, Math.max(0.0, (z - 0.075) / 0.035)) * wHead;
          z += 0.0046 * wNose;
          if (y < -0.004) y += 0.0018 * wNose;

          // Upturned cat-eye outer corner
          const wOuterEye = smoothBell(y, 0.012, 0.014) * smoothBell(absX, 0.044, 0.014) * Math.min(1.0, Math.max(0.0, (z - 0.055) / 0.030)) * wHead;
          y += 0.0026 * wOuterEye;
        } else if (faceArchetype === 'cn_oval_scholar') {
          // 📖 中式清秀书卷鹅蛋脸 (方尧平):
          // - Balanced southern Chinese 19yo female student oval contour
          // - Soft natural cheek curve, modest southern nose, calm horizontal almond eyes
          const wOvalCheek = smoothBell(y, -0.022, 0.030) * smoothBell(absX, 0.045, 0.026) * Math.min(1.0, Math.max(0.0, (z - 0.020) / 0.055)) * wHead;
          x += signX * 0.0028 * wOvalCheek;
          z += 0.0024 * wOvalCheek;
          if (y < 0.005) {
            const wLower = Math.min(1.0, (0.005 - y) / 0.075) * wHead;
            y += 0.0032 * wLower;
          }
        } else if (faceArchetype === 'cn_classical_melon') {
          // 🌸 江南古典瓜子脸 (苏晚):
          // - Narrow upper temples, smooth upper cheeks tapering gracefully to a classical melon-seed chin
          x *= 1.0 - 0.055 * wHead;
          const wMelonTaper = Math.min(1.0, Math.max(0.0, (-0.010 - y) / 0.055)) * Math.min(1.0, Math.max(0.0, (z - 0.015) / 0.060)) * wHead;
          x *= 1.0 - 0.145 * wMelonTaper;
          // Classical phoenix eye tilt
          const wOuterEye = smoothBell(y, 0.012, 0.014) * smoothBell(absX, 0.044, 0.014) * Math.min(1.0, Math.max(0.0, (z - 0.055) / 0.030)) * wHead;
          y += 0.0018 * wOuterEye;
        } else if (faceArchetype === 'kr_sweet_heart') {
          // 💖 韩系初恋甜美心形脸 (千雪):
          // - Full heart-shaped upper apple cheeks tapering rapidly below the mouth to a petite short chin
          const wHeartUpper = smoothBell(y, -0.004, 0.022) * smoothBell(absX, 0.042, 0.024) * Math.min(1.0, Math.max(0.0, (z - 0.035) / 0.045)) * wHead;
          x += signX * 0.0048 * wHeartUpper;
          z += 0.0045 * wHeartUpper;

          const wHeartLower = Math.min(1.0, Math.max(0.0, (-0.020 - y) / 0.048)) * wHead;
          x *= 1.0 - 0.165 * wHeartLower;
          y += 0.0055 * wHeartLower;

          // Plump pouty lips
          const wLips = smoothBell(y, -0.034, 0.012) * smoothBell(absX, 0.0, 0.024) * Math.min(1.0, Math.max(0.0, (z - 0.065) / 0.035)) * wHead;
          z += 0.0032 * wLips;
        } else if (faceArchetype === 'cn_cold_royal') {
          // ❄️ 中式清冷高智御姐脸 (沈知微):
          // - Slightly elongated intellectual mid/lower face, narrow sculpted buccal cheeks, high straight nose bridge
          x *= 1.0 - 0.065 * wHead;
          if (y < 0.005 && y > -0.068) {
            const wElong = smoothBell(y, -0.032, 0.035) * wHead;
            y -= 0.0036 * wElong;
          }
          const wBuccalHollow = smoothBell(y, -0.026, 0.020) * smoothBell(absX, 0.044, 0.020) * Math.min(1.0, Math.max(0.0, (z - 0.025) / 0.050)) * wHead;
          x -= signX * 0.0042 * wBuccalHollow;
          const wNose = smoothBell(y, 0.002, 0.024) * smoothBell(absX, 0.0, 0.014) * Math.min(1.0, Math.max(0.0, (z - 0.072) / 0.038)) * wHead;
          z += 0.0044 * wNose;
        }

        // ====================================================================
        // STEP C: 3D Eyebrow Mesh & Supraorbital Brow Shaping (`eyebrowStyle`)
        // ====================================================================
        const wBrowRegion = smoothBell(y, 0.027, 0.012) * Math.min(1.0, Math.max(0.0, (z - 0.062) / 0.032)) * smoothBell(absX, 0.032, 0.028);
        if (wBrowRegion > 0.001 || isBrowMesh) {
          const tBrow = Math.min(1.0, Math.max(0.0, (absX - 0.010) / 0.044)); // 0 = inner head, 1 = outer tail
          const mult = isBrowMesh ? 1.0 : wBrowRegion * 0.55;
          if (eyebrowStyle === 'kr_straight_mist') {
            // Flatten arch into a straight Korean mist brow
            const archFlatten = Math.sin(tBrow * Math.PI) * -0.0024 + tBrow * 0.0012;
            y += archFlatten * mult;
          } else if (eyebrowStyle === 'cn_willow_classical') {
            // High graceful classical willow arch
            const willowArch = Math.sin(Math.pow(tBrow, 0.85) * Math.PI) * 0.0038 - Math.pow(Math.max(0, tBrow - 0.65) / 0.35, 1.5) * 0.0025;
            y += willowArch * mult;
          } else if (eyebrowStyle === 'kr_sweet_droop') {
            // Gentle downward puppy/innocent outer brow tail
            const droop = -Math.pow(tBrow, 1.35) * 0.0042;
            y += droop * mult;
          } else if (eyebrowStyle === 'cn_cold_sword') {
            // Ascending heroic sword brow
            const sword = Math.pow(tBrow, 1.15) * 0.0046 - (1.0 - tBrow) * 0.0012;
            y += sword * mult;
          } else if (eyebrowStyle === 'kr_idol_arch') {
            // Korean idol meteor arch
            const meteor = Math.sin(Math.pow(tBrow, 0.9) * Math.PI) * 0.0026 - Math.pow(Math.max(0, tBrow - 0.6) / 0.4, 1.4) * 0.0022;
            y += meteor * mult;
          } else if (eyebrowStyle === 'cn_tang_moth') {
            // Short compact classical moth brow
            if (isBrowMesh && absX > 0.036) {
              x -= signX * (absX - 0.036) * 0.32;
            }
          }
        }
      }

      out[i3] = x;
      out[i3 + 1] = y;
      out[i3 + 2] = z;
    }

    posAttr.needsUpdate = true;
  });
}

export function setHeadEyebrowStyle(rootGroup, eyebrowStyle = 'cn_scholar_natural') {
  if (!rootGroup) return;
  rootGroup.userData.eyebrowStyle = eyebrowStyle;
  rootGroup.userData.currentMorphs = { ...(rootGroup.userData.currentMorphs || {}), eyebrowStyle };

  const browTex = buildEyebrowTextureForStyle(eyebrowStyle, rootGroup.userData.hairColor || '#181416');
  rootGroup.traverse((child) => {
    if (!child.isMesh) return;
    const matName = child.material?.name || '';
    if (child.name === 'Eyebrows' || matName === 'Eyebrow' || child.userData?.isEyebrowMesh) {
      child.userData.isEyebrowMesh = true;
      if (browTex && child.material) {
        child.material.map = browTex;
        child.material.alphaTest = 0.02;
        child.material.transparent = true;
        child.material.needsUpdate = true;
      }
    }
  });

  applyEastAsianCraniofacialSculpt(
    rootGroup,
    rootGroup.userData.faceArchetype || 'cn_oval_scholar',
    eyebrowStyle,
  );
}

export function setHeadFaceArchetype(rootGroup, faceArchetype = 'cn_oval_scholar') {
  if (!rootGroup) return;
  rootGroup.userData.faceArchetype = faceArchetype;
  rootGroup.userData.currentMorphs = { ...(rootGroup.userData.currentMorphs || {}), faceArchetype };
  applyEastAsianCraniofacialSculpt(
    rootGroup,
    faceArchetype,
    rootGroup.userData.eyebrowStyle || 'cn_scholar_natural',
  );
}

export function applyHeadMorphsToGroup(rootGroup, morphs = {}) {
  if (!rootGroup) return;
  rootGroup.userData.currentMorphs = { ...(rootGroup.userData.currentMorphs || {}), ...morphs };
  const m = rootGroup.userData.currentMorphs;
  const presetKey = rootGroup.userData.basePreset || 'user_photo';
  const bias = PRESET_MORPH_BIASES[presetKey] || PRESET_MORPH_BIASES.user_photo;

  const faceArchetype = m.faceArchetype || rootGroup.userData.faceArchetype || bias.faceArchetype || 'cn_oval_scholar';
  const eyebrowStyle = m.eyebrowStyle || rootGroup.userData.eyebrowStyle || bias.eyebrowStyle || 'cn_scholar_natural';
  const prevEyebrowStyle = rootGroup.userData.eyebrowStyle;
  rootGroup.userData.faceArchetype = faceArchetype;
  rootGroup.userData.eyebrowStyle = eyebrowStyle;

  if (eyebrowStyle !== prevEyebrowStyle) {
    const browTex = buildEyebrowTextureForStyle(eyebrowStyle, rootGroup.userData.hairColor || '#181416');
    rootGroup.traverse((child) => {
      if (!child.isMesh) return;
      if (child.name === 'Eyebrows' || child.userData?.isEyebrowMesh) {
        child.userData.isEyebrowMesh = true;
        if (browTex && child.material) {
          child.material.map = browTex;
          child.material.needsUpdate = true;
        }
      }
    });
  }

  applyEastAsianCraniofacialSculpt(rootGroup, faceArchetype, eyebrowStyle);

  const clampHarmony = (val, maxAbs = 0.36) => Math.max(-maxAbs, Math.min(maxAbs, Number(val) || 0));

  const jawV = clampHarmony(m.jawVLine ?? -(m.jawWidth ?? bias.jawVLine));
  const chin = clampHarmony(m.chinLength ?? bias.chinLength);
  const cheek = clampHarmony(m.cheekSoftness ?? m.cheekboneFullness ?? bias.cheekSoftness);
  const nose = clampHarmony(m.noseBridge ?? m.noseBridgeHeight ?? bias.noseBridge);
  const eye = clampHarmony(m.eyeAlmond ?? m.eyeSize ?? bias.eyeAlmond);
  const eyeTilt = clampHarmony(m.eyeTilt ?? bias.eyeTilt);
  const lip = clampHarmony(m.lipFullness ?? bias.lipFullness, 0.28);
  const forehead = clampHarmony(m.foreheadHeight ?? 0, 0.25);
  const ear = clampHarmony(m.earSize ?? 0, 0.30);

  const exprId = m.deadExpression || rootGroup.userData.deadExpression || 'dead_calm';
  rootGroup.userData.deadExpression = exprId;
  const exprPreset = FORENSIC_EXPRESSION_PRESETS.find((p) => p.id === exprId) || FORENSIC_EXPRESSION_PRESETS[0];
  const presetW = exprPreset.weights || {};

  const jawOpenVal = Math.max(0, Math.min(0.85, Number(m.jawOpen ?? 0)));
  const jawSideVal = Math.max(0, Math.min(0.85, Number(m.jawSide ?? 0)));
  const tongueOutVal = Math.max(0, Math.min(0.85, Number(m.tongueOut ?? 0)));
  const eyeRollUpVal = Math.max(0, Math.min(0.85, Number(m.eyeRollUp ?? 0)));
  const eyeCloseVal = Math.max(0, Math.min(1.0, Number(m.eyeClose ?? 0)));
  const eyeWideVal = Math.max(0, Math.min(0.85, Number(m.eyeWide ?? 0)));

  const targetWeights = {
    face_jaw_width_decr: jawV > 0 ? jawV : 0,
    face_jaw_width_incr: jawV < 0 ? -jawV : 0,
    face_chin_incr: chin > 0 ? chin : 0,
    face_chin_decr: chin < 0 ? -chin : 0,
    face_cheekbones_incr: cheek > 0 ? cheek : 0,
    face_cheekbones_decr: cheek < 0 ? -cheek : 0,
    face_nose_height_incr: nose > 0 ? nose : 0,
    face_nose_height_decr: nose < 0 ? -nose : 0,
    face_nose_width_decr: nose > 0 ? nose * 0.55 : 0,
    face_nose_width_incr: nose < 0 ? -nose * 0.55 : 0,
    face_eye_size_incr: eye > 0 ? eye : 0,
    face_eye_size_decr: eye < 0 ? -eye : 0,
    face_eye_tilt_incr: eyeTilt > 0 ? eyeTilt : 0,
    face_eye_tilt_decr: eyeTilt < 0 ? -eyeTilt : 0,
    face_lips_incr: lip > 0 ? lip : 0,
    face_lips_decr: lip < 0 ? -lip : 0,
    face_mouth_width_decr: 0,
    face_mouth_width_incr: 0,
    face_forehead_incr: forehead > 0 ? forehead : 0,
    face_forehead_decr: forehead < 0 ? -forehead : 0,
    face_ear_size_incr: ear > 0 ? ear : 0,
    face_ear_size_decr: ear < 0 ? -ear : 0,
    blink_left: eyeCloseVal,
    blink_right: eyeCloseVal,
    look_left: 0,
    look_right: 0,
    look_up: eyeRollUpVal * 0.65,
    look_down: 0,
    expr_serene: Number(presetW.expr_serene ?? 0),
    expr_hollow: Number(presetW.expr_hollow ?? 0),
    expr_shock: Number(presetW.expr_shock ?? 0),
    expr_rigor: Number(presetW.expr_rigor ?? 0),
    expr_smile: Number(presetW.expr_smile ?? 0),
    expr_flaccid: Number(presetW.expr_flaccid ?? 0),
    jaw_open: jawOpenVal,
    jaw_side: jawSideVal,
    tongue_out: tongueOutVal,
    eye_wide: eyeWideVal,
  };

  rootGroup.traverse((child) => {
    if (!child.isMesh || !child.morphTargetDictionary || !child.morphTargetInfluences) return;
    const dict = child.morphTargetDictionary;
    const infl = child.morphTargetInfluences;
    for (const [tName, weight] of Object.entries(targetWeights)) {
      if (tName in dict) {
        infl[dict[tName]] = weight;
      }
    }
  });

  applyArtistHairFineTuning(rootGroup, m);

  const capMesh = rootGroup.getObjectByName('NeckCrossSectionCap');
  if (capMesh) {
    const cutOffsetCm = Number(m.cutHeightOffset ?? 0);
    capMesh.position.y = (cutOffsetCm / BUST_WORLD_SCALE) * 0.35;
  }
}

export function applyHeadMorphsToGeometry(geometryOrMesh, basePositions, morphs = {}) {
  if (!geometryOrMesh) return;
  const parentGroup = geometryOrMesh?.userData?.parentHeadGroup;
  if (parentGroup) {
    applyHeadMorphsToGroup(parentGroup, morphs);
  }
}

export function updateHeadLifeAnimation() {
  // Motionless preserved specimen feel
}

export function triggerCollectibleBlink() {
  // Disabled ("不要眨眼")
}

function computeSkinTintColor(skinToneHex = '#ffe8df') {
  const c = new THREE.Color(skinToneHex || '#ffe8df');
  // Preserve distinct warm/cool/porcelain/peach character skin tones without washing them out
  const r = Math.min(1.06, Math.max(0.82, 0.42 + c.r * 0.60));
  const g = Math.min(1.05, Math.max(0.78, 0.42 + c.g * 0.60));
  const b = Math.min(1.06, Math.max(0.76, 0.42 + c.b * 0.60));
  return new THREE.Color(r, g, b);
}

const ALL_28_VALID_HAIRS = new Set([
  'hair_bob01',
  'hair_user_photo',
  'hair_bob02',
  'hair_short02',
  'daz_hair_asym_short',
  'daz_hair_pixie_chic',
  'daz_hair_air_bangs_long',
  'hair_long01',
  'daz_hair_hime',
  'hair_short04',
  'daz_hair_side_long',
  'daz_hair_wolf_clavicle',
  'daz_hair_curtain_wave',
  'daz_hair_hazel_wave',
  'daz_hair_wavy_bob',
  'daz_hair_glam_wave',
  'daz_hair_mermaid_curl',
  'daz_hair_french_lazy_roll',
  'hair_braid01',
  'daz_hair_adrienne_updo',
  'daz_hair_low_chignon',
  'daz_hair_crown_braid',
  'daz_hair_ballerina_bun',
  'hair_ponytail01',
  'daz_hair_twin_buns',
  'daz_hair_halfup_princess',
  'daz_hair_twin_braids',
  'daz_hair_sport_ponytail',
]);

export function resolveRealHairStyle(styleName = 'hair_bob01') {
  if (styleName === 'none') return 'none';
  const stripped = String(styleName).replace(/^real_/, '');
  const legacyMap = {
    groom_photo_tied: 'daz_hair_air_bangs_long',
    groom_center_long: 'hair_long01',
    groom_low_chignon: 'hair_braid01',
    groom_hime_cut: 'daz_hair_hime',
    groom_clavicle_bob: 'daz_hair_curtain_wave',
    groom_air_bob: 'hair_bob01',
    groom_high_ponytail: 'hair_ponytail01',
    groom_pixie_short: 'daz_hair_pixie_chic',
    user_bangs: 'hair_bob01',
    photo_tied_wisps: 'hair_user_photo',
    long_straight: 'hair_long01',
    long_waves: 'daz_hair_curtain_wave',
    hime_cut: 'daz_hair_hime',
    hair_hime_cut: 'daz_hair_hime',
    clavicle_layer: 'hair_short04',
    hair_clavicle_layer: 'hair_short04',
    butterfly_halfup: 'daz_hair_halfup_princess',
    hair_butterfly_halfup: 'daz_hair_halfup_princess',
    sleek_bob: 'hair_bob02',
    short_bob: 'hair_bob01',
    low_chignon: 'daz_hair_low_chignon',
    high_ponytail: 'hair_ponytail01',
    soft_waves: 'daz_hair_hazel_wave',
  };
  const mapped = legacyMap[stripped] || legacyMap[styleName] || stripped;
  return ALL_28_VALID_HAIRS.has(mapped) ? mapped : 'hair_bob01';
}

export function disposeHeadNode(node) {
  if (!node) return;
  const geometries = new Set(), materials = new Set(), textures = new Set();
  node.traverse(child => {
    if (!child.isMesh) return;
    if (child.geometry) geometries.add(child.geometry);
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) {
        if (value?.isTexture && !value.userData?.sharedHairAtlas && !value.userData?.sharedSkinMicro) textures.add(value);
      }
    }
  });
  geometries.forEach(value => value.dispose());
  materials.forEach(value => value.dispose());
  textures.forEach(value => value.dispose());
  node.removeFromParent();
}

export function updateHairSheen(node, value) {
  const sheen = Math.max(0.2, Math.min(1.0, Number(value) || 0.88));
  node?.getObjectByName('HairGroup')?.traverse(child => {
    if (!child.isMesh || !child.material?.userData?.builtInHair) return;
    if (child.name === 'ScalpRootFeatherCap') return;
    child.material.sheen = Math.min(0.36, sheen * 0.34);
    child.material.roughness = Math.max(0.26, 0.48 - sheen * 0.18);
    child.material.anisotropy = 0.55 + sheen * 0.35;
    child.material.clearcoat = 0.10 + sheen * 0.08;
  });
}

function computeTrueHairDisplayColor(hairColorHex = '#121216') {
  const normalizedHex = String(hairColorHex || '#121216').toLowerCase();
  const legacyDarkSet = new Set(['#191518', '#1a151c', '#181418', '#22171b', '#261a16', '#171417']);
  const baseColor = new THREE.Color(legacyDarkSet.has(normalizedHex) ? '#121216' : normalizedHex);
  const lum = 0.299 * baseColor.r + 0.587 * baseColor.g + 0.114 * baseColor.b;
  if (lum < 0.08) {
    return new THREE.Color('#191a20');
  }
  return baseColor;
}

function fitImportedHairScene(scene) {
  const box = new THREE.Box3().setFromObject(scene);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z, 1e-4);
  if (maxDim > 0.85 || maxDim < 0.06) {
    const scale = 0.24 / maxDim;
    scene.scale.multiplyScalar(scale);
    scene.position.set(-center.x * scale, 0.035 - center.y * scale, -center.z * scale);
  }
}

/**
 * Injects Dual-Lobe Marschner / Kajiya-Kay Anisotropic Micro-Fiber Cuticle Glints
 * and Premultiplied Edge De-Fringing into a MeshPhysicalMaterial.
 */
function injectMarschnerHairShader(material, sheenIntensity = 0.90) {
  material.customProgramCacheKey = () => `marschner_hair_v25_${sheenIntensity.toFixed(2)}_${material.transparent ? 'alpha' : 'core'}`;
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #include <map_fragment>
      #ifdef USE_MAP
        float uCoord = vMapUv.x;
        float vCoord = vMapUv.y;
        float microStrand = 0.5 + 0.5 * (
          0.55 * sin(uCoord * 380.0 + sin(vCoord * 18.0) * 0.35) +
          0.45 * cos(uCoord * 790.0 + 1.4)
        );
        float edgeRichness = smoothstep(0.01, 0.42, diffuseColor.a);
        diffuseColor.rgb *= (0.74 + 0.26 * edgeRichness) * (0.86 + 0.26 * microStrand);
      #endif
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      `
      #include <lights_fragment_end>
      #ifdef USE_MAP
        vec3 viewDir = normalize(vViewPosition);
        vec3 surfNorm = normalize(normal);
        vec3 hairDir = normalize(vec3(-surfNorm.x * 0.28, 0.92, -surfNorm.z * 0.28));
        float fiberJitter = sin(vMapUv.x * 460.0) * 0.055 + cos(vMapUv.x * 920.0) * 0.035;
        vec3 lightDir = normalize(vec3(0.28, 0.52, 0.80));
        vec3 H = normalize(lightDir + viewDir);

        vec3 T1 = normalize(hairDir - (0.14 + fiberJitter) * surfNorm);
        float tdoth1 = clamp(dot(T1, H), -1.0, 1.0);
        float sinTH1 = sqrt(max(0.0, 1.0 - tdoth1 * tdoth1));
        float specR = pow(sinTH1, 56.0) * smoothstep(-0.2, 0.35, dot(surfNorm, lightDir));

        vec3 T2 = normalize(hairDir + (0.20 - fiberJitter * 1.3) * surfNorm);
        float tdoth2 = clamp(dot(T2, H), -1.0, 1.0);
        float sinTH2 = sqrt(max(0.0, 1.0 - tdoth2 * tdoth2));
        float specTRT = pow(sinTH2, 20.0) * smoothstep(-0.15, 0.45, dot(surfNorm, lightDir));

        float strandMask = 0.45 + 0.55 * (0.5 + 0.5 * sin(vMapUv.x * 520.0 + vMapUv.y * 12.0));
        vec3 anisoGlint = (
          specR * vec3(0.11, 0.12, 0.15) * strandMask +
          specTRT * (diffuseColor.rgb * 1.45 + vec3(0.04, 0.045, 0.06)) * (0.65 + 0.35 * strandMask)
        ) * ${(0.65 + sheenIntensity * 0.55).toFixed(3)};

        reflectedLight.indirectSpecular += anisoGlint;
      #endif
      `
    );
  };
}

function buildScalpRootShadowCap(modelContainer, displayColor) {
  let headGeo = null;
  modelContainer.traverse((child) => {
    if (!headGeo && child.isMesh && child.geometry?.attributes?.position && (child.name === 'HeadSkinMesh' || child.material?.name === 'Skin')) {
      headGeo = child.geometry;
    }
  });
  if (!headGeo || !headGeo.index) return null;

  const pos = headGeo.attributes.position;
  const idx = headGeo.index.array;
  const capIndices = [];
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i], b = idx[i + 1], c = idx[i + 2];
    const ym = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3.0;
    const zm = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3.0;
    if (ym > 0.024 && (zm < 0.054 || (ym > 0.056 && zm < 0.066))) {
      capIndices.push(a, b, c);
    }
  }
  if (capIndices.length === 0) return null;

  const capGeo = new THREE.BufferGeometry();
  const newPos = new Float32Array(pos.array.length);
  const hcX = 0.0, hcY = 0.02, hcZ = -0.01;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const dx = x - hcX, dy = y - hcY, dz = z - hcZ;
    const len = Math.hypot(dx, dy, dz) || 1.0;
    newPos[i * 3] = x + (dx / len) * 0.0005;
    newPos[i * 3 + 1] = y + (dy / len) * 0.0005;
    newPos[i * 3 + 2] = z + (dz / len) * 0.0005;
  }
  capGeo.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
  if (headGeo.attributes.normal) {
    capGeo.setAttribute('normal', headGeo.attributes.normal);
  }
  capGeo.setIndex(capIndices);

  const capMat = new THREE.MeshStandardMaterial({
    color: displayColor.clone().multiplyScalar(0.55),
    roughness: 0.85,
    metalness: 0.0,
    transparent: true,
    opacity: 0.65,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  capMat.userData.builtInHair = true;
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.name = 'ScalpRootFeatherCap';
  capMesh.renderOrder = 0;
  return capMesh;
}

export async function attachRealHairModel(rootGroup, config = {}) {
  const modelContainer = rootGroup.getObjectByName('RealDazHeadContainer');
  if (!modelContainer) return null;

  rootGroup.userData.neckClearance = Number(config.neckClearance ?? rootGroup.userData.neckClearance ?? 0.45);
  const request = (rootGroup.userData.hairRequestSerial || 0) + 1;
  rootGroup.userData.hairRequestSerial = request;
  const oldHair = modelContainer.getObjectByName('HairGroup');

  const rawStyle = config.hairStyle || config.materials?.hairStyle || 'hair_bob01';
  const resolvedStyle = resolveRealHairStyle(rawStyle);
  if (resolvedStyle === 'none' && !config.customHairUrl) {
    disposeHeadNode(oldHair);
    delete rootGroup.userData.groomStats;
    rootGroup.userData.currentHairStyle = 'none';
    return null;
  }

  delete rootGroup.userData.groomStats;
  const hairUrl = config.customHairUrl || `/models/${resolvedStyle}.glb`;
  const isCustomObj = Boolean(config.customHairUrl && (config.customHairType === 'obj' || String(config.customHairUrl).toLowerCase().endsWith('.obj')));

  try {
    let loadedScene = null;
    if (isCustomObj) {
      const txt = await fetchObjText(hairUrl);
      loadedScene = objLoader.parse(txt);
      fitImportedHairScene(loadedScene);
    } else {
      const buf = await fetchGlbArrayBuffer(hairUrl);
      const gltf = await parseGlbBuffer(buf);
      loadedScene = gltf.scene;
      if (config.customHairUrl) fitImportedHairScene(loadedScene);
    }

    if (rootGroup.userData.hairRequestSerial !== request) {
      disposeHeadNode(loadedScene);
      return null;
    }

    const hairGroup = new THREE.Group();
    hairGroup.name = 'HairGroup';

    const hairColorHex = config.hairColor || config.materials?.hairColorHex || '#121216';
    const displayColor = computeTrueHairDisplayColor(hairColorHex);
    const sheenIntensity = Number(config.hairSheen ?? 0.90);
    const hairLum = 0.299 * displayColor.r + 0.587 * displayColor.g + 0.114 * displayColor.b;
    const isJetBlack = hairLum < 0.08;
    const sheenCol = isJetBlack
      ? new THREE.Color('#303440')
      : displayColor.clone().multiplyScalar(1.25);

    const scalpCap = buildScalpRootShadowCap(modelContainer, displayColor);
    if (scalpCap) {
      hairGroup.add(scalpCap);
    }

    let totalVerts = 0;
    let totalTris = 0;
    const wispClones = [];

    loadedScene.traverse((child) => {
      if (!child.isMesh) return;
      const g = child.geometry;
      if (g?.attributes?.position) {
        totalVerts += g.attributes.position.count;
        totalTris += g.index ? Math.floor(g.index.count / 3) : Math.floor(g.attributes.position.count / 3);
      }
      const origMat = Array.isArray(child.material) ? child.material[0] : child.material;
      const mapTex = origMat?.map || null;
      if (mapTex) {
        mapTex.colorSpace = THREE.SRGBColorSpace;
        mapTex.anisotropy = 16;
        mapTex.generateMipmaps = true;
        mapTex.minFilter = THREE.LinearMipmapLinearFilter;
        mapTex.magFilter = THREE.LinearFilter;
        mapTex.needsUpdate = true;
      }

      // Pass 1: Dense Core Depth Pre-Pass (writes depth buffer for solid interior hair locks)
      const coreMat = new THREE.MeshPhysicalMaterial({
        map: mapTex,
        color: displayColor,
        roughness: Math.max(0.28, 0.48 - sheenIntensity * 0.18),
        metalness: 0.02,
        sheen: Math.min(0.36, sheenIntensity * 0.34),
        sheenRoughness: 0.38,
        sheenColor: sheenCol,
        anisotropy: 0.55 + sheenIntensity * 0.35,
        anisotropyRotation: Math.PI / 2,
        clearcoat: 0.10 + sheenIntensity * 0.08,
        clearcoatRoughness: 0.30,
        specularIntensity: 0.72,
        specularColor: isJetBlack ? new THREE.Color('#cfd6e6') : new THREE.Color('#ffffff'),
        envMapIntensity: isJetBlack ? 0.40 : 0.52,
        transparent: false,
        alphaTest: mapTex ? 0.82 : 0.0,
        depthWrite: true,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 2,
        side: THREE.DoubleSide,
      });
      coreMat.userData.builtInHair = true;
      injectMarschnerHairShader(coreMat, sheenIntensity);

      child.material = coreMat;
      child.castShadow = true;
      child.receiveShadow = true;
      child.renderOrder = 1;

      if (mapTex) {
        // Pass 2: True Alpha-Blended Gossamer Strand & Feathered Bangs Pass
        const wispMat = new THREE.MeshPhysicalMaterial({
          map: mapTex,
          color: displayColor,
          roughness: Math.max(0.26, 0.46 - sheenIntensity * 0.18),
          metalness: 0.02,
          sheen: Math.min(0.38, sheenIntensity * 0.36),
          sheenRoughness: 0.36,
          sheenColor: sheenCol,
          anisotropy: 0.58 + sheenIntensity * 0.35,
          anisotropyRotation: Math.PI / 2,
          clearcoat: 0.12 + sheenIntensity * 0.08,
          clearcoatRoughness: 0.28,
          specularIntensity: 0.76,
          specularColor: isJetBlack ? new THREE.Color('#d8e0ef') : new THREE.Color('#ffffff'),
          envMapIntensity: isJetBlack ? 0.42 : 0.54,
          transparent: true,
          opacity: 1.0,
          alphaTest: 0.015,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        wispMat.userData.builtInHair = true;
        injectMarschnerHairShader(wispMat, sheenIntensity);

        const wispMesh = new THREE.Mesh(child.geometry, wispMat);
        wispMesh.name = `${child.name || 'Hair'}_SilkyWisps`;
        wispMesh.position.copy(child.position);
        wispMesh.rotation.copy(child.rotation);
        wispMesh.scale.copy(child.scale);
        wispMesh.castShadow = false;
        wispMesh.receiveShadow = true;
        wispMesh.renderOrder = 2;
        wispClones.push({ parent: child.parent || loadedScene, wispMesh });
      }
    });

    for (const { parent, wispMesh } of wispClones) {
      parent.add(wispMesh);
    }

    hairGroup.add(loadedScene);
    disposeHeadNode(oldHair);
    modelContainer.add(hairGroup);
    rootGroup.userData.currentHairStyle = resolvedStyle;
    rootGroup.userData.hairStats = { vertices: totalVerts, triangles: totalTris, style: resolvedStyle };

    applyHeadMorphsToGroup(rootGroup, rootGroup.userData.currentMorphs || {});
    return hairGroup;
  } catch (err) {
    console.warn('Failed to load 3D artist hair model:', hairUrl, err);
    return null;
  }
}

function buildGimbalOverlayGroup() {
  const gimbalGroup = new THREE.Group();
  gimbalGroup.name = 'RotationGimbalGroup';
  gimbalGroup.visible = false;

  const ringGeo1 = new THREE.TorusGeometry(13.2, 0.16, 12, 64);
  const ringMat1 = new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.30 });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.userData.planeNormal = new THREE.Vector3(0, 0, 1);
  ring1.userData.baseOpacity = 0.30;
  gimbalGroup.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(12.4, 0.12, 12, 64);
  ringGeo2.rotateY(Math.PI / 2);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: '#f43f5e', transparent: true, opacity: 0.22 });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.userData.planeNormal = new THREE.Vector3(1, 0, 0);
  ring2.userData.baseOpacity = 0.22;
  gimbalGroup.add(ring2);

  return gimbalGroup;
}

export async function buildCollectibleHeadNode(config = {}) {
  const rootGroup = new THREE.Group();
  rootGroup.name = `Collectible_${config.id || 'StudioDraft'}`;
  rootGroup.userData.collectibleId = config.id || 'StudioDraft';
  const presetKey = config.basePreset || 'user_photo';
  const presetBias = PRESET_MORPH_BIASES[presetKey] || PRESET_MORPH_BIASES.user_photo;
  rootGroup.userData.basePreset = presetKey;
  rootGroup.userData.faceArchetype = config.faceArchetype || config.morphs?.faceArchetype || presetBias.faceArchetype || 'cn_oval_scholar';
  rootGroup.userData.eyebrowStyle = config.eyebrowStyle || config.morphs?.eyebrowStyle || presetBias.eyebrowStyle || 'cn_scholar_natural';
  rootGroup.userData.hairColor = config.hairColor || config.materials?.hairColorHex || '#121216';
  rootGroup.userData.deadExpression = config.deadExpression || config.morphs?.deadExpression || 'dead_calm';
  rootGroup.userData.neckClearance = Number(config.neckClearance ?? 0.45);

  const morphs = {
    ...(config.morphs || {}),
    faceArchetype: rootGroup.userData.faceArchetype,
    eyebrowStyle: rootGroup.userData.eyebrowStyle,
    deadExpression: config.deadExpression || config.morphs?.deadExpression || 'dead_calm',
  };
  const materials = config.materials || {};
  rootGroup.userData.currentMorphs = { ...morphs };

  const modelContainer = new THREE.Group();
  modelContainer.name = 'RealDazHeadContainer';
  modelContainer.scale.setScalar(BUST_WORLD_SCALE);
  rootGroup.add(modelContainer);

  const skinToneHex = config.skinTone || materials.skinToneHex || '#ffe9df';
  const wetness = Number(config.anatomyOptions?.wetness ?? materials.crossSectionWetness ?? 0.92);
  const vascularContrast = Number(config.anatomyOptions?.vascularContrast ?? materials.crossSectionVeinContrast ?? 1.25);
  const showLabels = Boolean(config.anatomyOptions?.showLabels);

  const { colorTex, bumpTex } = createAnatomyTextures({
    skinColor: skinToneHex,
    vascularContrast,
    dermisRimScale: 1.0,
    showLabels,
  });

  const customUrl = config.customModelUrl || config.modelUrl;
  const isCustomObj = customUrl && (config.customModelType === 'obj' || customUrl.endsWith('.obj'));
  const targetGlbUrl = (!customUrl || isCustomObj || customUrl.includes('daz_asian_female_'))
    ? BUILTIN_HEAD_URL
    : customUrl;
  const isBuiltInAsset = targetGlbUrl === BUILTIN_HEAD_URL;

  const buf = await fetchGlbArrayBuffer(targetGlbUrl);
  const gltf = await parseGlbBuffer(buf);

  const sourceAssetStats = inspectSceneAsset(gltf.scene);
  let headSkinMesh = null;
  let neckCapMesh = null;

  gltf.scene.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;

    const matName = child.material?.name || child.name;
    if (!isBuiltInAsset) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach(prepareImportedMaterial);
      if (!headSkinMesh) headSkinMesh = child;
      return;
    }

    if (matName === 'Skin' || child.name === 'HeadSkin') {
      child.name = 'HeadSkinMesh';
      headSkinMesh = child;
      child.geometry.userData = child.geometry.userData || {};
      child.geometry.userData.parentHeadGroup = rootGroup;
      child.userData.basePositions = true;

      const rawSkinMap = child.material?.map || null;
      const skinNorm = child.material?.normalMap || null;
      if (rawSkinMap) {
        rawSkinMap.colorSpace = THREE.SRGBColorSpace;
        rawSkinMap.anisotropy = 8;
      }
      const skinMap = buildCharacterSkinOverlayMap(
        rawSkinMap,
        rootGroup.userData.basePreset || 'user_photo',
        rootGroup.userData.eyebrowStyle || 'cn_scholar_natural',
      );
      const skinMicro = createSkinMicroMaps();
      for (const texture of Object.values(skinMicro)) {
        if (texture?.isTexture) texture.userData.sharedSkinMicro = true;
      }
      const skinMaterial = new THREE.MeshPhysicalMaterial({
        map: skinMap,
        normalMap: skinNorm,
        normalScale: new THREE.Vector2(0.62, 0.62),
        roughnessMap: skinMicro.roughnessMap,
        bumpMap: skinMicro.bumpMap,
        bumpScale: 0.016,
        color: computeSkinTintColor(skinToneHex),
        roughness: Math.max(0.58, Number(materials.skinRoughness ?? 0.68)),
        metalness: 0.0,
        sheen: 0.36,
        sheenRoughness: 0.84,
        sheenColor: new THREE.Color('#e8b4ae'),
        clearcoat: 0.0,
        clearcoatRoughness: 0.58,
        specularIntensity: 0.20,
        specularColor: new THREE.Color('#dce6f2'),
        ior: 1.39,
        envMapIntensity: 0.16,
        emissive: new THREE.Color('#000000'),
        emissiveIntensity: 0.0,
      });
      injectAestheticSubsurfaceScattering(skinMaterial);
      child.material = skinMaterial;
    } else if (matName === 'NeckCrossSection' || child.name === 'NeckCrossSection') {
      child.name = 'NeckCrossSectionCap';
      neckCapMesh = child;
      child.geometry.userData = child.geometry.userData || {};
      child.geometry.userData.parentHeadGroup = rootGroup;
      child.userData.basePositions = true;

      child.material = new THREE.MeshPhysicalMaterial({
        map: colorTex,
        emissiveMap: colorTex,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.32,
        bumpMap: bumpTex,
        bumpScale: 0.005,
        roughness: Math.max(0.34, 0.72 - wetness * 0.40),
        metalness: 0.0,
        clearcoat: 0.25,
        clearcoatRoughness: 0.35,
        specularIntensity: 0.40,
        envMapIntensity: 0.32,
        side: THREE.DoubleSide,
      });
    } else if (matName === 'Eye') {
      const eyeMap = child.material?.map || null;
      if (eyeMap) {
        eyeMap.colorSpace = THREE.SRGBColorSpace;
        eyeMap.anisotropy = 8;
      }
      child.material = new THREE.MeshPhysicalMaterial({
        map: eyeMap,
        roughness: 0.05,
        metalness: 0.0,
        clearcoat: 0.94,
        clearcoatRoughness: 0.02,
        specularIntensity: 0.95,
        ior: 1.38,
        envMapIntensity: 1.32,
      });
    } else if (matName === 'Cornea') {
      child.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: 0.04,
        roughness: 0.02,
        metalness: 0.0,
        clearcoat: 0.65,
        clearcoatRoughness: 0.01,
        specularIntensity: 0.75,
        ior: 1.38,
        envMapIntensity: 0.62,
        depthWrite: false,
      });
    } else if (matName === 'Eyebrow') {
      child.userData.isEyebrowMesh = true;
      const customBrowMap = buildEyebrowTextureForStyle(
        rootGroup.userData.eyebrowStyle || 'cn_scholar_natural',
        rootGroup.userData.hairColor || '#181416',
      );
      const browMap = customBrowMap || child.material?.map || null;
      if (browMap) browMap.colorSpace = THREE.SRGBColorSpace;
      child.material = new THREE.MeshStandardMaterial({
        map: browMap,
        color: new THREE.Color('#ffffff'),
        transparent: true,
        alphaTest: 0.02,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        roughness: 0.56,
        envMapIntensity: 0.35,
        side: THREE.DoubleSide,
      });
    } else if (matName === 'Eyelash') {
      const lashMap = child.material?.map || null;
      if (lashMap) lashMap.colorSpace = THREE.SRGBColorSpace;
      child.material = new THREE.MeshStandardMaterial({
        map: lashMap,
        color: new THREE.Color('#ffffff'),
        transparent: true,
        alphaTest: 0.06,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        roughness: 0.36,
        envMapIntensity: 0.45,
        side: THREE.DoubleSide,
      });
    } else if (matName === 'Teeth' || child.name === 'Teeth') {
      const teethMap = child.material?.map || null;
      if (teethMap) teethMap.colorSpace = THREE.SRGBColorSpace;
      child.material = new THREE.MeshPhysicalMaterial({
        map: teethMap,
        color: new THREE.Color('#f4ede2'),
        roughness: 0.18,
        metalness: 0.0,
        clearcoat: 0.75,
        clearcoatRoughness: 0.10,
        ior: 1.52,
        envMapIntensity: 0.65,
        side: THREE.DoubleSide,
      });
    } else if (matName === 'Tongue' || child.name === 'Tongue') {
      const tongueMap = child.material?.map || null;
      if (tongueMap) tongueMap.colorSpace = THREE.SRGBColorSpace;
      child.material = new THREE.MeshPhysicalMaterial({
        map: tongueMap,
        color: new THREE.Color('#d6747a'),
        roughness: 0.28,
        metalness: 0.0,
        clearcoat: 0.65,
        clearcoatRoughness: 0.16,
        sheen: 0.35,
        sheenColor: new THREE.Color('#ff9aa2'),
        envMapIntensity: 0.55,
        side: THREE.DoubleSide,
      });
    }
  });

  rootGroup.userData.assetStats = {
    ...sourceAssetStats,
    source: isBuiltInAsset ? 'built-in-demo' : 'user-glb',
  };

  if (isBuiltInAsset) {
    modelContainer.add(gltf.scene);
  } else {
    modelContainer.add(fitImportedHead(gltf.scene));
  }

  await attachRealHairModel(rootGroup, config);
  applyHeadMorphsToGroup(rootGroup, morphs);
  attachSpecimenContainerAndDecor(rootGroup, config);

  const gimbalGroup = buildGimbalOverlayGroup();
  rootGroup.add(gimbalGroup);
  rootGroup.userData.gimbalGroup = gimbalGroup;
  rootGroup.userData.headMesh = headSkinMesh;
  rootGroup.userData.capMesh = neckCapMesh;

  return rootGroup;
}

export function attachSpecimenContainerAndDecor(rootGroup, config = {}) {
  if (!rootGroup) return;
  const oldContainer = rootGroup.getObjectByName('SpecimenContainerGroup');
  if (oldContainer) rootGroup.remove(oldContainer);
  const oldDecor = rootGroup.getObjectByName('SpecimenDecorGroup');
  if (oldDecor) rootGroup.remove(oldDecor);

  // Stage 27: Specimen containers (头颅收纳装置) are NEVER bound to character heads on the desktop!
  // They are independent placeable 3D architectural structures (可放置的收纳建筑) on the desk/shelves.
  const containerStyle = config.forcePreviewContainer ? (config.studioContainerStyle || 'none') : 'none';

  const containerGroup = buildSpecimenContainerGroup(containerStyle);
  rootGroup.add(containerGroup);

  const baseBottomOffset = containerGroup.userData.baseBottomOffset ?? -10.8;
  rootGroup.userData.containerGroup = containerGroup;
  rootGroup.userData.containerStyle = containerStyle;
  rootGroup.userData.baseBottomOffset = baseBottomOffset;
}

export const assembleCollectibleHead = buildCollectibleHeadNode;
