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
  fangyaoping:      { faceArchetype: 'cn_oval_scholar', eyebrowStyle: 'cn_scholar_natural', skinVariant: 'young_asian', jawVLine: 0.04, chinLength: -0.02, cheekSoftness: 0.06, noseBridge: 0.02, eyeAlmond: 0.06, eyeTilt: -0.02, lipFullness: 0.02 },
  user_photo:       { faceArchetype: 'cn_round_babyface', eyebrowStyle: 'kr_straight_mist', skinVariant: 'natural_makeup', jawVLine: -0.06, chinLength: -0.08, cheekSoftness: 0.14, noseBridge: 0.02, eyeAlmond: 0.10, eyeTilt: -0.04, lipFullness: 0.06 },
  chuxia:           { faceArchetype: 'cn_round_babyface', eyebrowStyle: 'kr_straight_mist', skinVariant: 'natural_makeup', jawVLine: -0.06, chinLength: -0.08, cheekSoftness: 0.14, noseBridge: 0.02, eyeAlmond: 0.10, eyeTilt: -0.04, lipFullness: 0.06 },
  female_realistic: { faceArchetype: 'kr_idol_vline', eyebrowStyle: 'kr_idol_arch', skinVariant: 'violet_makeup', jawVLine: 0.12, chinLength: -0.02, cheekSoftness: 0.08, noseBridge: 0.12, eyeAlmond: 0.08, eyeTilt: 0.08, lipFullness: 0.06 },
  linxi:            { faceArchetype: 'kr_idol_vline', eyebrowStyle: 'kr_idol_arch', skinVariant: 'violet_makeup', jawVLine: 0.12, chinLength: -0.02, cheekSoftness: 0.08, noseBridge: 0.12, eyeAlmond: 0.08, eyeTilt: 0.08, lipFullness: 0.06 },
  female_2:         { faceArchetype: 'cn_classical_melon', eyebrowStyle: 'cn_willow_classical', skinVariant: 'eurasian', jawVLine: 0.10, chinLength: 0.02, cheekSoftness: 0.02, noseBridge: 0.06, eyeAlmond: 0.05, eyeTilt: 0.06, lipFullness: 0.04 },
  suwan:            { faceArchetype: 'cn_classical_melon', eyebrowStyle: 'cn_willow_classical', skinVariant: 'eurasian', jawVLine: 0.10, chinLength: 0.02, cheekSoftness: 0.02, noseBridge: 0.06, eyeAlmond: 0.05, eyeTilt: 0.06, lipFullness: 0.04 },
  female_3:         { faceArchetype: 'kr_sweet_heart', eyebrowStyle: 'kr_sweet_droop', skinVariant: 'glam_makeup', jawVLine: 0.12, chinLength: -0.06, cheekSoftness: 0.12, noseBridge: 0.06, eyeAlmond: 0.12, eyeTilt: -0.02, lipFullness: 0.08 },
  qianxue:          { faceArchetype: 'kr_sweet_heart', eyebrowStyle: 'kr_sweet_droop', skinVariant: 'glam_makeup', jawVLine: 0.12, chinLength: -0.06, cheekSoftness: 0.12, noseBridge: 0.06, eyeAlmond: 0.12, eyeTilt: -0.02, lipFullness: 0.08 },
  female_gentle:    { faceArchetype: 'cn_cold_royal', eyebrowStyle: 'cn_cold_sword', skinVariant: 'zoey', jawVLine: 0.08, chinLength: 0.06, cheekSoftness: -0.06, noseBridge: 0.10, eyeAlmond: 0.02, eyeTilt: 0.08, lipFullness: 0.02 },
  shenzhiwei:       { faceArchetype: 'cn_cold_royal', eyebrowStyle: 'cn_cold_sword', skinVariant: 'zoey', jawVLine: 0.08, chinLength: 0.06, cheekSoftness: -0.06, noseBridge: 0.10, eyeAlmond: 0.02, eyeTilt: 0.08, lipFullness: 0.02 },
};

/**
 * Stage 29 · Maps UI Eyebrow Style IDs to Official MakeHuman 3D Eyebrow Assets (`eyebrow001..012` .obj + .png)
 */
const EYEBROW_STYLE_TO_MH_ASSET = {
  cn_scholar_natural:  { assetId: 'eyebrow001', browDown: 0.0,  browUp: 0.0  },
  kr_straight_mist:    { assetId: 'eyebrow008', browDown: 0.32, browUp: 0.0  },
  kr_idol_arch:        { assetId: 'eyebrow002', browDown: 0.0,  browUp: 0.22 },
  cn_willow_classical: { assetId: 'eyebrow012', browDown: 0.0,  browUp: 0.18 },
  kr_sweet_droop:      { assetId: 'eyebrow010', browDown: 0.42, browUp: 0.0  },
  cn_cold_sword:       { assetId: 'eyebrow005', browDown: 0.0,  browUp: 0.40 },
  kr_wild_feathered:   { assetId: 'eyebrow003', browDown: 0.0,  browUp: 0.12 },
  cn_tang_moth:        { assetId: 'eyebrow004', browDown: 0.20, browUp: 0.0  },
};

/**
 * Stage 29 · Maps Face Archetype IDs to 100% Real Downloaded MakeHuman / MPFB2 & Elvaerwyn `.target` Morph Weights
 * + Real Downloaded Photographic Skin Variant (ZERO manual math vertex pinching!).
 */
const ARCHETYPE_REAL_TARGET_WEIGHTS = {
  cn_oval_scholar: {
    skinVariant: 'young_asian',
    targets: {
      mh_head_oval: 0.34,
      mh_head_round: 0.12,
      mh_head_heart: 0.0,
      mh_head_diamond: 0.0,
      elvs_baby_cheeks: 0.10,
      elvs_apple_cheeks: 0.08,
      elvs_slim_cheeks: 0.0,
    },
  },
  cn_round_babyface: {
    skinVariant: 'natural_makeup',
    targets: {
      mh_head_round: 0.52,
      mh_head_oval: 0.0,
      mh_head_heart: 0.0,
      mh_head_diamond: 0.0,
      elvs_baby_cheeks: 0.42,
      elvs_apple_cheeks: 0.28,
      elvs_slim_cheeks: 0.0,
    },
  },
  kr_idol_vline: {
    skinVariant: 'violet_makeup',
    targets: {
      mh_head_round: 0.0,
      mh_head_oval: 0.20,
      mh_head_heart: 0.46,
      mh_head_diamond: 0.15,
      elvs_baby_cheeks: 0.0,
      elvs_apple_cheeks: 0.36,
      elvs_slim_cheeks: 0.22,
    },
  },
  cn_classical_melon: {
    skinVariant: 'eurasian',
    targets: {
      mh_head_round: 0.0,
      mh_head_oval: 0.30,
      mh_head_heart: 0.34,
      mh_head_diamond: 0.0,
      elvs_baby_cheeks: 0.0,
      elvs_apple_cheeks: 0.12,
      elvs_slim_cheeks: 0.32,
    },
  },
  kr_sweet_heart: {
    skinVariant: 'glam_makeup',
    targets: {
      mh_head_round: 0.22,
      mh_head_oval: 0.0,
      mh_head_heart: 0.48,
      mh_head_diamond: 0.0,
      elvs_baby_cheeks: 0.20,
      elvs_apple_cheeks: 0.42,
      elvs_slim_cheeks: 0.0,
    },
  },
  cn_cold_royal: {
    skinVariant: 'zoey',
    targets: {
      mh_head_round: 0.0,
      mh_head_oval: 0.24,
      mh_head_heart: 0.0,
      mh_head_diamond: 0.46,
      elvs_baby_cheeks: 0.0,
      elvs_apple_cheeks: 0.0,
      elvs_slim_cheeks: 0.38,
    },
  },
};

let realWebAssetsPromise = null;
let realWebAssetsCache = null;

/**
 * Extracts and decodes the 6 Real Downloaded MakeHuman Photographic Skin Textures
 * and 8 Real Official MakeHuman 3D Eyebrow Models (`eyebrow001..012` .obj + .png)
 * embedded inside `daz_asian_head_base.glb`.
 */
async function ensureRealWebAssetsLoaded(glbBuffer) {
  if (realWebAssetsCache) return realWebAssetsCache;
  if (realWebAssetsPromise) return realWebAssetsPromise;

  realWebAssetsPromise = (async () => {
    try {
      const view = new DataView(glbBuffer);
      const jsonLen = view.getUint32(12, true);
      const jsonBytes = new Uint8Array(glbBuffer, 20, jsonLen);
      const gh = JSON.parse(new TextDecoder().decode(jsonBytes));
      const binStart = 28 + jsonLen;
      const meta = gh?.extras?.realWebAssets;
      if (!meta) return null;

      const decodeTextureFromBufferView = (bvIdx, mimeType, isOpaque = true) => new Promise((resolve) => {
        const bv = gh.bufferViews[bvIdx];
        if (!bv || typeof document === 'undefined') {
          resolve(null);
          return;
        }
        const slice = new Uint8Array(glbBuffer, binStart + (bv.byteOffset || 0), bv.byteLength);
        const blob = new Blob([slice], { type: mimeType || 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          URL.revokeObjectURL(url);
          const tex = new THREE.Texture(img);
          tex.flipY = false;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 16;
          tex.generateMipmaps = true;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          tex.userData = { sharedSkinMicro: true, realWebAsset: true, isOpaque };
          resolve(tex);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(null);
        };
        img.src = url;
      });

      const skins = {};
      const skinEntries = Object.entries(meta.skins || {});
      await Promise.all(skinEntries.map(async ([skinId, info]) => {
        const tex = await decodeTextureFromBufferView(info.bufferView, info.mimeType, true);
        if (tex) skins[skinId] = tex;
      }));

      const eyebrows = {};
      const browEntries = Object.entries(meta.eyebrows || {});
      await Promise.all(browEntries.map(async ([browId, info]) => {
        const tex = await decodeTextureFromBufferView(info.bufferView, info.mimeType, false);
        eyebrows[browId] = {
          texture: tex,
          pos: info.pos ? new Float32Array(info.pos) : null,
          uv: info.uv ? new Float32Array(info.uv) : null,
        };
      }));

      realWebAssetsCache = { skins, eyebrows };
      return realWebAssetsCache;
    } catch (err) {
      console.warn('Failed to decode real embedded web assets from GLB:', err);
      return null;
    }
  })();

  return realWebAssetsPromise;
}

function applyRealEyebrowAssetToGroup(rootGroup, eyebrowStyle = 'cn_scholar_natural') {
  if (!rootGroup || !realWebAssetsCache?.eyebrows) return;
  const spec = EYEBROW_STYLE_TO_MH_ASSET[eyebrowStyle] || EYEBROW_STYLE_TO_MH_ASSET.cn_scholar_natural;
  const asset = realWebAssetsCache.eyebrows[spec.assetId] || realWebAssetsCache.eyebrows.eyebrow001;
  if (!asset) return;

  rootGroup.traverse((child) => {
    if (!child.isMesh) return;
    const matName = child.material?.name || '';
    if (child.name === 'Eyebrows' || matName === 'Eyebrow' || child.userData?.isEyebrowMesh) {
      child.userData.isEyebrowMesh = true;
      if (asset.texture && child.material) {
        child.material.map = asset.texture;
        child.material.alphaTest = 0.02;
        child.material.transparent = true;
        child.material.needsUpdate = true;
      }
      if (asset.pos && child.geometry?.attributes?.position && child.geometry.attributes.position.array.length === asset.pos.length) {
        child.geometry.attributes.position.array.set(asset.pos);
        child.geometry.attributes.position.needsUpdate = true;
      }
      if (asset.uv && child.geometry?.attributes?.uv && child.geometry.attributes.uv.array.length === asset.uv.length) {
        child.geometry.attributes.uv.array.set(asset.uv);
        child.geometry.attributes.uv.needsUpdate = true;
      }
    }
  });
}

function applyRealSkinVariantToGroup(rootGroup, skinVariantId = 'young_asian') {
  if (!rootGroup || !realWebAssetsCache?.skins) return;
  const tex = realWebAssetsCache.skins[skinVariantId] || realWebAssetsCache.skins.young_asian;
  if (!tex) return;
  rootGroup.traverse((child) => {
    if (!child.isMesh) return;
    if (child.name === 'HeadSkinMesh' || child.material?.name === 'Skin') {
      if (child.material && child.material.map !== tex) {
        child.material.map = tex;
        child.material.needsUpdate = true;
      }
    }
  });
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
  const sideburnRaw = Math.max(-0.6, Math.min(0.7, Number(morphs.sideburnLock ?? morphs.hairSideburnTuck ?? 0)));
  const faceArchetype = morphs.faceArchetype || rootGroup.userData.faceArchetype || 'cn_oval_scholar';
  const archCheekClearance = faceArchetype === 'cn_round_babyface' ? -0.08
    : faceArchetype === 'kr_sweet_heart' ? -0.04
    : (faceArchetype === 'kr_idol_vline' || faceArchetype === 'cn_classical_melon') ? 0.04 : 0.0;
  const sideburn = Math.max(-0.6, Math.min(0.7, sideburnRaw + archCheekClearance));
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

export function setHeadEyebrowStyle(rootGroup, eyebrowStyle = 'cn_scholar_natural') {
  if (!rootGroup) return;
  rootGroup.userData.eyebrowStyle = eyebrowStyle;
  rootGroup.userData.currentMorphs = { ...(rootGroup.userData.currentMorphs || {}), eyebrowStyle };
  applyRealEyebrowAssetToGroup(rootGroup, eyebrowStyle);
  applyHeadMorphsToGroup(rootGroup, rootGroup.userData.currentMorphs);
}

export function setHeadFaceArchetype(rootGroup, faceArchetype = 'cn_oval_scholar') {
  if (!rootGroup) return;
  rootGroup.userData.faceArchetype = faceArchetype;
  const archSpec = ARCHETYPE_REAL_TARGET_WEIGHTS[faceArchetype] || ARCHETYPE_REAL_TARGET_WEIGHTS.cn_oval_scholar;
  if (archSpec?.skinVariant) {
    rootGroup.userData.skinVariant = archSpec.skinVariant;
    applyRealSkinVariantToGroup(rootGroup, archSpec.skinVariant);
  }
  rootGroup.userData.currentMorphs = { ...(rootGroup.userData.currentMorphs || {}), faceArchetype };
  applyHeadMorphsToGroup(rootGroup, rootGroup.userData.currentMorphs);
}

export function applyHeadMorphsToGroup(rootGroup, morphs = {}) {
  if (!rootGroup) return;
  rootGroup.userData.currentMorphs = { ...(rootGroup.userData.currentMorphs || {}), ...morphs };
  const m = rootGroup.userData.currentMorphs;
  const presetKey = rootGroup.userData.basePreset || 'user_photo';
  const bias = PRESET_MORPH_BIASES[presetKey] || PRESET_MORPH_BIASES.user_photo;

  const faceArchetype = m.faceArchetype || rootGroup.userData.faceArchetype || bias.faceArchetype || 'cn_oval_scholar';
  const eyebrowStyle = m.eyebrowStyle || rootGroup.userData.eyebrowStyle || bias.eyebrowStyle || 'cn_scholar_natural';
  rootGroup.userData.faceArchetype = faceArchetype;
  rootGroup.userData.eyebrowStyle = eyebrowStyle;

  const archSpec = ARCHETYPE_REAL_TARGET_WEIGHTS[faceArchetype] || ARCHETYPE_REAL_TARGET_WEIGHTS.cn_oval_scholar;
  const archTargets = archSpec.targets || {};
  const browSpec = EYEBROW_STYLE_TO_MH_ASSET[eyebrowStyle] || EYEBROW_STYLE_TO_MH_ASSET.cn_scholar_natural;

  const skinVariant = m.skinVariant || rootGroup.userData.skinVariant || bias.skinVariant || archSpec.skinVariant || 'young_asian';
  rootGroup.userData.skinVariant = skinVariant;
  applyRealSkinVariantToGroup(rootGroup, skinVariant);
  applyRealEyebrowAssetToGroup(rootGroup, eyebrowStyle);

  const clampHarmony = (val, maxAbs = 0.28) => Math.max(-maxAbs, Math.min(maxAbs, Number(val) || 0));

  const jawV = clampHarmony(m.jawVLine ?? -(m.jawWidth ?? bias.jawVLine));
  const chin = clampHarmony(m.chinLength ?? bias.chinLength);
  const cheek = clampHarmony(m.cheekSoftness ?? m.cheekboneFullness ?? bias.cheekSoftness);
  const nose = clampHarmony(m.noseBridge ?? m.noseBridgeHeight ?? bias.noseBridge);
  const eye = clampHarmony(m.eyeAlmond ?? m.eyeSize ?? bias.eyeAlmond);
  const eyeTilt = clampHarmony(m.eyeTilt ?? bias.eyeTilt);
  const lip = clampHarmony(m.lipFullness ?? bias.lipFullness, 0.22);
  const forehead = clampHarmony(m.foreheadHeight ?? 0, 0.22);
  const ear = clampHarmony(m.earSize ?? 0, 0.25);

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
    // 9 Real Downloaded MakeHuman / MPFB2 & Elvaerwyn Artist `.target` Morphs
    mh_head_round: Number(archTargets.mh_head_round ?? 0),
    mh_head_oval: Number(archTargets.mh_head_oval ?? 0),
    mh_head_heart: Number(archTargets.mh_head_heart ?? 0),
    mh_head_diamond: Number(archTargets.mh_head_diamond ?? 0),
    elvs_baby_cheeks: Number(archTargets.elvs_baby_cheeks ?? 0),
    elvs_apple_cheeks: Number(archTargets.elvs_apple_cheeks ?? 0),
    elvs_slim_cheeks: Number(archTargets.elvs_slim_cheeks ?? 0),
    mh_brow_down: Number(browSpec.browDown ?? 0),
    mh_brow_up: Number(browSpec.browUp ?? 0),
    // Official MakeHuman Base `.target` Sliders
    face_jaw_width_decr: jawV > 0 ? jawV : 0,
    face_jaw_width_incr: jawV < 0 ? -jawV : 0,
    face_chin_incr: chin > 0 ? chin : 0,
    face_chin_decr: chin < 0 ? -chin : 0,
    face_cheekbones_incr: cheek > 0 ? cheek : 0,
    face_cheekbones_decr: cheek < 0 ? -cheek : 0,
    face_nose_height_incr: nose > 0 ? nose : 0,
    face_nose_height_decr: nose < 0 ? -nose : 0,
    face_nose_width_decr: nose > 0 ? nose * 0.45 : 0,
    face_nose_width_incr: nose < 0 ? -nose * 0.45 : 0,
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
  // Subtle neutral tint (0.93..1.02) so the real downloaded photographic female skin texture
  // retains 100% of its natural dermal pores, eyelids, lips, and subsurface complexion without plastic wash!
  const r = Math.min(1.02, Math.max(0.93, 0.80 + c.r * 0.21));
  const g = Math.min(1.02, Math.max(0.92, 0.80 + c.g * 0.21));
  const b = Math.min(1.02, Math.max(0.91, 0.80 + c.b * 0.21));
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
    child.material.sheen = Math.min(0.22, sheen * 0.20);
    child.material.roughness = Math.max(0.36, 0.56 - sheen * 0.16);
    child.material.anisotropy = 0.72 + sheen * 0.24;
    child.material.clearcoat = 0.0;
  });
}

function computeTrueHairDisplayColor(hairColorHex = '#121216') {
  const normalizedHex = String(hairColorHex || '#121216').toLowerCase();
  const legacyDarkSet = new Set(['#191518', '#1a151c', '#181418', '#22171b', '#261a16', '#171417', '#121216']);
  const baseColor = new THREE.Color(legacyDarkSet.has(normalizedHex) ? '#151418' : normalizedHex);
  const lum = 0.299 * baseColor.r + 0.587 * baseColor.g + 0.114 * baseColor.b;
  if (lum < 0.08) {
    return new THREE.Color('#17161b');
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
 * Stage 30 True 3D Cranial-Flow Stochastic Strand & Meridian Marschner Hair Pipeline:
 * 1. Spherized Cranial-Blended Normals: Blends flat polygon card normals with smooth 3D cranial dome normals
 *    so adjacent hair cards shade as one cohesive, soft 3D hair volume (zero paper-card facet seams).
 * 2. 100% Non-Periodic 3D Cranial-Space Stochastic Micro-Strand Noise: Replaces all periodic sin(u * N)
 *    stripes with multi-scale continuous 3D cranial-azimuth value noise (zero repeating barcode lines).
 * 3. True 3D Meridian Hair Flow Tangents: Curves hair tangents from the crown along cranial meridians
 *    so Marschner R + TRT anisotropic highlights form a natural silk "Angel Ring" arc near the crown
 *    instead of washing out vertical hair locks into silver-gray metal.
 * 4. Volumetric Root/Inner Depth AO & 3D-Offset Gossamer Wisp Shell: Darkens deep under-layers and
 *    crown partings while offsetting Pass 2 wisps +0.65mm outward along the 3D normal.
 */
function injectMarschnerHairShader(material, sheenIntensity = 0.90, isWispLayer = false) {
  material.customProgramCacheKey = () => `marschner_hair_v30_${sheenIntensity.toFixed(2)}_${isWispLayer ? 'wisp' : 'core'}`;
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = `
      varying vec3 vHairLocalPos;
      varying vec3 vHairSmoothNormal;
    ` + shader.vertexShader;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <beginnormal_vertex>',
      `
      #include <beginnormal_vertex>
      vec3 cranCenter = vec3(0.0, 0.015, -0.008);
      vec3 cranVec = position - cranCenter;
      vec3 cranSphereN = normalize(vec3(cranVec.x * 1.15, max(-0.22, cranVec.y * 0.95 + 0.035), cranVec.z * 1.05));
      if (dot(objectNormal, cranSphereN) < 0.0) {
        objectNormal = -objectNormal;
      }
      objectNormal = normalize(mix(objectNormal, cranSphereN, 0.62));
      vHairSmoothNormal = objectNormal;
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vHairLocalPos = position;
      ${isWispLayer ? 'transformed += objectNormal * 0.00065;' : ''}
      `
    );

    shader.fragmentShader = `
      varying vec3 vHairLocalPos;
      varying vec3 vHairSmoothNormal;

      float hairHash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float hairValueNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hairHash21(i);
        float b = hairHash21(i + vec2(1.0, 0.0));
        float c = hairHash21(i + vec2(0.0, 1.0));
        float d = hairHash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #include <map_fragment>
      #ifdef USE_MAP
        // Convert over-bright greyscale hair map into rich melanin strand contrast without washing out dark hair
        float texLuma = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));
        float strandDetail = clamp((texLuma - 0.50) * 1.65 + 0.50, 0.0, 1.0);

        // Continuous 3D cranial-azimuth coordinates for 100% non-periodic stochastic hair fibers
        float azimAngle = atan(vHairLocalPos.x, vHairLocalPos.z + 0.012);
        float meridianArc = vHairLocalPos.y * 8.5 + length(vHairLocalPos.xz) * 2.2;

        // 3 octaves of non-periodic anisotropic stochastic strand noise stretched along the hair flow
        float nCoarse = hairValueNoise(vec2(azimAngle * 28.0 + vMapUv.x * 19.0, meridianArc * 1.4));
        float nMedium = hairValueNoise(vec2(azimAngle * 74.0 - vMapUv.x * 43.0 + nCoarse * 0.45, meridianArc * 2.6));
        float nFine   = hairValueNoise(vec2(azimAngle * 168.0 + vMapUv.x * 97.0, meridianArc * 4.2 + vMapUv.y * 3.5));
        float stochasticFiber = 0.34 * nCoarse + 0.41 * nMedium + 0.25 * nFine;

        // 3D volumetric depth & root-parting ambient occlusion (eliminates flat paper-card look)
        float rFromCore = length(vHairLocalPos - vec3(0.0, 0.022, -0.008));
        float innerDepthAO = smoothstep(0.068, 0.098, rFromCore);
        float crownPartAO = 1.0 - 0.32 * exp(-pow(vHairLocalPos.x / 0.016, 2.0)) * smoothstep(0.045, 0.095, vHairLocalPos.y);
        float neckNapeAO = smoothstep(-0.085, 0.015, vHairLocalPos.y);
        float hairVolAO = (0.64 + 0.36 * innerDepthAO) * crownPartAO * (0.72 + 0.28 * neckNapeAO);

        // Combine base melanin color with stochastic fibers & volumetric AO
        float fiberMod = mix(0.68, 1.24, 0.45 * strandDetail + 0.55 * stochasticFiber);
        diffuseColor.rgb = diffuse * fiberMod * hairVolAO;

        ${isWispLayer ? `
          // Pass 2 only renders gossamer feathered edges & outer flyaway wisps (prevents opaque double-overdraw)
          float wispFeather = smoothstep(0.02, 0.28, diffuseColor.a) * (1.0 - 0.62 * smoothstep(0.76, 0.96, diffuseColor.a));
          float wispStrandMask = smoothstep(0.28, 0.82, stochasticFiber * 0.65 + strandDetail * 0.35);
          diffuseColor.a = clamp(wispFeather * (0.55 + 0.45 * wispStrandMask), 0.0, 0.82);
        ` : `
          // Pass 1 renders solid volumetric locks with stochastic strand-dithered alpha borders
          diffuseColor.a = clamp(diffuseColor.a * (0.86 + 0.26 * stochasticFiber), 0.0, 1.0);
        `}
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

        // True 3D cranial meridian hair flow tangent (curves from crown to tips along the head sphere)
        vec3 pRel = vHairLocalPos - vec3(0.0, 0.010, -0.010);
        vec3 nCran = normalize(vec3(pRel.x * 1.15, pRel.y + 0.028, pRel.z * 1.08));
        vec3 bAzim = normalize(vec3(-nCran.z, 0.0, nCran.x + 1e-5));
        vec3 tMeridian = normalize(cross(bAzim, nCran));
        if (tMeridian.y > 0.0) tMeridian = -tMeridian;

        // Subtle per-clump stochastic cuticle tilt (non-periodic, zero sine stripes)
        float clumpShift = (hairValueNoise(vec2(atan(pRel.x, pRel.z) * 36.0, vHairLocalPos.y * 14.0)) - 0.5) * 0.14;
        vec3 lightDir = normalize(vec3(0.24, 0.68, 0.69));
        vec3 H = normalize(lightDir + viewDir);

        // Primary R cuticle glint (shifted toward crown by -6 deg)
        vec3 T1 = normalize(tMeridian + (-0.11 + clumpShift) * surfNorm);
        float tdoth1 = clamp(dot(T1, H), -1.0, 1.0);
        float sinTH1 = sqrt(max(0.0, 1.0 - tdoth1 * tdoth1));
        float LongitudinalR = pow(max(0.0, 1.0 - abs(tdoth1)), 18.0) * pow(sinTH1, 64.0);

        // Secondary TRT warm cortex sheen (shifted toward tips by +10 deg)
        vec3 T2 = normalize(tMeridian + (0.18 - clumpShift * 1.2) * surfNorm);
        float tdoth2 = clamp(dot(T2, H), -1.0, 1.0);
        float sinTH2 = sqrt(max(0.0, 1.0 - tdoth2 * tdoth2));
        float LongitudinalTRT = pow(max(0.0, 1.0 - abs(tdoth2)), 9.0) * pow(sinTH2, 24.0);

        // Crown & upper-arch curvature mask so the Angel Ring forms naturally on curved upper locks
        float crownBand = smoothstep(-0.045, 0.065, vHairLocalPos.y);
        float ndotl = smoothstep(-0.08, 0.55, dot(surfNorm, lightDir));
        float strandSparkle = 0.55 + 0.45 * hairValueNoise(vec2(atan(pRel.x, pRel.z) * 140.0 + vMapUv.x * 65.0, vHairLocalPos.y * 22.0));

        vec3 rColor = mix(vec3(0.055, 0.060, 0.072), diffuse * 1.6 + vec3(0.045), 0.35);
        vec3 trtColor = diffuse * 2.1 + vec3(0.028, 0.022, 0.018);

        vec3 anisoGlint = (
          LongitudinalR * rColor * strandSparkle * (0.45 + 0.55 * crownBand) +
          LongitudinalTRT * trtColor * (0.70 + 0.30 * strandSparkle) * (0.35 + 0.65 * crownBand)
        ) * ndotl * ${(0.48 + sheenIntensity * 0.42).toFixed(3)};

        // Attenuate default isotropic plastic PBR specular so hair never looks like glossy plastic sheet
        reflectedLight.directSpecular *= 0.18;
        reflectedLight.indirectSpecular *= 0.22;
        reflectedLight.indirectSpecular += anisoGlint * smoothstep(0.08, 0.65, diffuseColor.a);
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

      // Pass 1: Dense Core Volumetric Locks (writes depth buffer with stochastic strand-dithered borders)
      const coreMat = new THREE.MeshPhysicalMaterial({
        map: mapTex,
        color: displayColor,
        roughness: Math.max(0.38, 0.56 - sheenIntensity * 0.16),
        metalness: 0.0,
        sheen: Math.min(0.20, sheenIntensity * 0.18),
        sheenRoughness: 0.48,
        sheenColor: sheenCol,
        anisotropy: 0.72 + sheenIntensity * 0.24,
        anisotropyRotation: Math.PI / 2,
        clearcoat: 0.0,
        clearcoatRoughness: 0.52,
        specularIntensity: 0.28,
        specularColor: isJetBlack ? new THREE.Color('#6a7284') : new THREE.Color('#b8b0a8'),
        envMapIntensity: isJetBlack ? 0.12 : 0.18,
        transparent: false,
        alphaTest: mapTex ? 0.36 : 0.0,
        depthWrite: true,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 2,
        side: THREE.DoubleSide,
      });
      coreMat.userData.builtInHair = true;
      injectMarschnerHairShader(coreMat, sheenIntensity, false);

      child.material = coreMat;
      child.castShadow = true;
      child.receiveShadow = true;
      child.renderOrder = 1;

      if (mapTex) {
        // Pass 2: 3D-Offset Gossamer Flyaway & Feathered Edge Shell (+0.65mm along smooth 3D normal)
        const wispMat = new THREE.MeshPhysicalMaterial({
          map: mapTex,
          color: displayColor,
          roughness: Math.max(0.36, 0.54 - sheenIntensity * 0.16),
          metalness: 0.0,
          sheen: Math.min(0.22, sheenIntensity * 0.20),
          sheenRoughness: 0.45,
          sheenColor: sheenCol,
          anisotropy: 0.76 + sheenIntensity * 0.22,
          anisotropyRotation: Math.PI / 2,
          clearcoat: 0.0,
          clearcoatRoughness: 0.50,
          specularIntensity: 0.30,
          specularColor: isJetBlack ? new THREE.Color('#747c90') : new THREE.Color('#c2bab0'),
          envMapIntensity: isJetBlack ? 0.14 : 0.20,
          transparent: true,
          opacity: 1.0,
          alphaTest: 0.015,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        wispMat.userData.builtInHair = true;
        injectMarschnerHairShader(wispMat, sheenIntensity, true);

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
  if (isBuiltInAsset) {
    await ensureRealWebAssetsLoaded(buf);
  }
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
        rawSkinMap.anisotropy = 16;
      }
      if (skinNorm) {
        skinNorm.anisotropy = 16;
      }
      const skinVariantId = presetBias.skinVariant || 'young_asian';
      rootGroup.userData.skinVariant = skinVariantId;
      const realSkinMap = realWebAssetsCache?.skins?.[skinVariantId] || rawSkinMap;
      const skinMicro = createSkinMicroMaps();
      for (const texture of Object.values(skinMicro)) {
        if (texture?.isTexture) texture.userData.sharedSkinMicro = true;
      }
      const skinMaterial = new THREE.MeshPhysicalMaterial({
        map: realSkinMap,
        normalMap: skinNorm,
        normalScale: new THREE.Vector2(0.88, 0.88),
        roughnessMap: skinMicro.roughnessMap,
        color: computeSkinTintColor(skinToneHex),
        roughness: Math.max(0.56, Number(materials.skinRoughness ?? 0.66)),
        metalness: 0.0,
        sheen: 0.34,
        sheenRoughness: 0.82,
        sheenColor: new THREE.Color('#e6b2aa'),
        clearcoat: 0.0,
        clearcoatRoughness: 0.58,
        specularIntensity: 0.24,
        specularColor: new THREE.Color('#e2eaf4'),
        ior: 1.39,
        envMapIntensity: 0.18,
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
      const browSpec = EYEBROW_STYLE_TO_MH_ASSET[rootGroup.userData.eyebrowStyle || 'cn_scholar_natural'] || EYEBROW_STYLE_TO_MH_ASSET.cn_scholar_natural;
      const realBrowAsset = realWebAssetsCache?.eyebrows?.[browSpec.assetId] || realWebAssetsCache?.eyebrows?.eyebrow001;
      const browMap = realBrowAsset?.texture || child.material?.map || null;
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
