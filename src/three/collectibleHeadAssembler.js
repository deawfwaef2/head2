import * as THREE from 'three';
import { applyStoredFaceSculpt, applyStoredHairSculpt } from './sculptStrokeLayer.js';
import { injectArtistHairLighting, updateArtistHairFlow } from './artistHairLighting.js';
import { refineArtistHairCards } from './hairCardSubdivision.js';
import { fitArtistHairOutsideScalp } from './hairScalpFit.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { createAnatomyTextures } from '../textures/anatomyTextureGenerator.js';
import { createSkinMicroMaps } from '../textures/skinTextureGenerator.js';
import { resolvePrivateModelUrl } from '../data/privateModelStore.js';
import { injectAestheticSubsurfaceScattering, injectForensicCrossSectionShader } from './photorealLighting.js';
import { REAL_HAIR_CATALOG, FACE_ARCHETYPE_CATALOG, HEAD_BLEND_CHANNELS } from '../data/defaultCollectibles.js';
import {
  MPFB_SPARSE_HEAD_TARGETS,
  BROW_TO_SKIN_INDEX,
  LASH_TO_SKIN_INDEX,
  EYE_SHAPE_PRESET_CATALOG,
  EAST_ASIAN_ARCHETYPE_MPFB_RECIPES,
} from '../data/eastAsianHeadAndEyeTargets.js';
import { FACE_FINE_TARGETS } from '../data/faceFineTargets.js';
import { syncFaceAccessories } from './faceAccessories.js';
import {
  buildSpecimenContainerGroup,
  buildSpecimenDecorGroup,
} from './specimenStageAndContainers.js';
import {
  generateStrands,
  createStrandMaterial,
  setStrandParams,
  morphedHeadSoup,
  alphaSamplerFromTexture,
  scalpDistanceAttribute,
} from './masterQuality/strandHair.js';
import {
  upgradeEyeMaterial,
  buildHairMaterials,
} from './masterQuality/featureMaterials.js';
import {
  computeHairCoverage,
  buildBabyHairGeometry,
} from './masterQuality/hairlineBlend.js';
import {
  buildLashGeometry,
  buildBrowGeometry,
  createLashStrandMaterial,
} from './masterQuality/lashStrands.js';

const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

const arrayBufferCache = new Map();
const textCache = new Map();
const masterStrandGeometryCache = new Map();
let globalStrandMeshVersion = 1;
const BUILTIN_HEAD_URL = '/models/daz_asian_head_base.glb';
const BUST_WORLD_SCALE = 115.0;

export const MASTER_HAIR_DENSITIES = {
  low:   { label: '流畅 (约 1.3 万根)', guides: 1150, childrenPerGuide: 9, fuzzPerGuide: 0.9 },
  mid:   { label: '标准 (约 2.7 万根)', guides: 1850, childrenPerGuide: 13, fuzzPerGuide: 1.35 },
  high:  { label: '高精 (约 4.8 万根)', guides: 2600, childrenPerGuide: 17, fuzzPerGuide: 1.6 },
  ultra: { label: '极致 (约 8.8 万根)', guides: 3400, childrenPerGuide: 24, fuzzPerGuide: 2.2 },
};

export const MASTER_HAIR_CONFIG = {
  mode: 'strand',
  density: 'low',
  gainR: 0.48,
  gainTT: 0.42,
  gainTRT: 0.68,
  gainDiffuse: 0.72,
};

if (typeof window !== 'undefined') {
  window.__MASTER_HAIR_CONFIG__ = MASTER_HAIR_CONFIG;
}

export function getMasterHairConfig() {
  return { ...MASTER_HAIR_CONFIG };
}

export function setMasterHairConfig(patch = {}) {
  if (patch.mode === 'strand' || patch.mode === 'card') MASTER_HAIR_CONFIG.mode = patch.mode;
  if (patch.density && MASTER_HAIR_DENSITIES[patch.density]) MASTER_HAIR_CONFIG.density = patch.density;
  if (patch.gainR != null && Number.isFinite(+patch.gainR)) MASTER_HAIR_CONFIG.gainR = +patch.gainR;
  if (patch.gainTT != null && Number.isFinite(+patch.gainTT)) MASTER_HAIR_CONFIG.gainTT = +patch.gainTT;
  if (patch.gainTRT != null && Number.isFinite(+patch.gainTRT)) MASTER_HAIR_CONFIG.gainTRT = +patch.gainTRT;
  if (patch.gainDiffuse != null && Number.isFinite(+patch.gainDiffuse)) MASTER_HAIR_CONFIG.gainDiffuse = +patch.gainDiffuse;
  return { ...MASTER_HAIR_CONFIG };
}

const _strandDbs = new THREE.Vector2();
let _interactiveCardLOD = false;
let _interactiveLodTimer = null;
let _pointerDownActive = false;

if (typeof window !== 'undefined' && !window.__HAIR_LOD_BOUND__) {
  window.__HAIR_LOD_BOUND__ = true;
  const triggerInteractiveLOD = (holdMs = 160) => {
    _interactiveCardLOD = true;
    if (_interactiveLodTimer) clearTimeout(_interactiveLodTimer);
    _interactiveLodTimer = setTimeout(() => {
      if (!_pointerDownActive) _interactiveCardLOD = false;
    }, holdMs);
  };
  window.addEventListener('pointerdown', () => { _pointerDownActive = true; }, { passive: true });
  window.addEventListener('pointermove', (e) => {
    if (_pointerDownActive || (e.buttons & 7) !== 0) triggerInteractiveLOD(150);
  }, { passive: true });
  window.addEventListener('pointerup', () => {
    _pointerDownActive = false;
    triggerInteractiveLOD(90);
  }, { passive: true });
  window.addEventListener('pointercancel', () => {
    _pointerDownActive = false;
    triggerInteractiveLOD(90);
  }, { passive: true });
  window.addEventListener('wheel', () => {
    triggerInteractiveLOD(180);
  }, { passive: true });
}

export function updateMasterStrandHairPxScale(scene, renderer, camera) {
  if (!scene || !renderer || !camera) return;
  const hpx = renderer.getDrawingBufferSize(_strandDbs).y;
  const pxScale = (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov || 24) / 2)) / Math.max(1, hpx);
  const lodChanged = scene.userData._lastCardLOD !== _interactiveCardLOD;
  if (!lodChanged && scene.userData._strandUniformsVersion === globalStrandMeshVersion && scene.userData._cachedStrandUniforms) {
    if (scene.userData._lastStrandPxScale === pxScale) return;
    const list = scene.userData._cachedStrandUniforms;
    for (let i = 0; i < list.length; i++) list[i].uPxScale.value = pxScale;
    scene.userData._lastStrandPxScale = pxScale;
    return;
  }
  const list = [];
  scene.traverse((obj) => {
    if (!obj.isMesh) return;
    if (obj.name === 'MasterStrandHairMesh') {
      obj.visible = !_interactiveCardLOD;
    }
    if (obj.material?.userData?.isMasterCardHair && obj.material?.userData?.uniforms) {
      const cu = obj.material.userData.uniforms;
      if (cu.uInset) cu.uInset.value = _interactiveCardLOD ? 0.0 : 0.0028;
      if (cu.uScalpFade) cu.uScalpFade.value = _interactiveCardLOD ? 0.0 : 0.055;
    }
    if (obj.material?.userData?.strandUniforms) {
      obj.material.userData.strandUniforms.uPxScale.value = pxScale;
      list.push(obj.material.userData.strandUniforms);
    }
  });
  scene.userData._lastCardLOD = _interactiveCardLOD;
  scene.userData._lastStrandPxScale = pxScale;
  scene.userData._strandUniformsVersion = globalStrandMeshVersion;
  scene.userData._cachedStrandUniforms = list;
}

function hexToMasterStrandRgb(hairColorHex = '#121216') {
  const normalizedHex = String(hairColorHex || '#121216').trim().toLowerCase();
  const c = new THREE.Color(normalizedHex);
  const maxC = Math.max(c.r, c.g, c.b);
  if (maxC < 0.008) {
    return [0.022, 0.016, 0.014];
  }
  // Preserve full chromaticity & lightness for dyed hair (brown, blonde, red, blue, silver, pink, white)
  const boost = maxC < 0.06 ? 0.95 : (maxC < 0.25 ? 0.82 : 0.68);
  return [
    Math.min(0.78, 0.014 + c.r * boost),
    Math.min(0.75, 0.011 + c.g * boost),
    Math.min(0.78, 0.010 + c.b * boost),
  ];
}
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

const _builtinHeadTemplatePromises = new Map();
async function getBuiltinHeadSceneClone(buf, contextKey = 'desktop') {
  if (!_builtinHeadTemplatePromises.has(contextKey)) {
    _builtinHeadTemplatePromises.set(contextKey, parseGlbBuffer(buf).then((gltf) => {
      gltf.scene.traverse((c) => {
        if (!c.isMesh) return;
        if (c.geometry) {
          c.geometry.userData = c.geometry.userData || {};
          c.geometry.userData.sharedBuiltinGeo = true;
        }
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        for (const m of mats) {
          if (!m) continue;
          for (const v of Object.values(m)) {
            if (v?.isTexture) {
              v.userData = v.userData || {};
              v.userData.sharedSkinMicro = true;
            }
          }
        }
      });
      return gltf;
    }));
  }
  const templateGltf = await _builtinHeadTemplatePromises.get(contextKey);
  const clonedScene = templateGltf.scene.clone(true);
  clonedScene.traverse((c) => {
    if (!c.isMesh) return;
    if (c.morphTargetInfluences) {
      c.morphTargetInfluences = [...c.morphTargetInfluences];
    }
    if (c.morphTargetDictionary) {
      c.morphTargetDictionary = { ...c.morphTargetDictionary };
    }
    const matName = c.material?.name || c.name;
    if (c.name === 'Eyebrows' || matName === 'Eyebrow') {
      c.geometry = c.geometry.clone();
      c.geometry.userData = { ...(c.geometry.userData || {}), sharedBuiltinGeo: false };
    }
  });
  return { scene: clonedScene };
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
  fangyaoping:      { faceArchetype: 'cn_oval_scholar', eyebrowStyle: 'cn_scholar_natural', skinVariant: 'cn_scholar_natural', jawVLine: -0.08, chinLength: -0.04, cheekSoftness: 0.16, noseBridge: 0.04, noseWidth: 0.04, eyeSize: 0.12, eyeAperture: 0.0, eyeAlmond: 0.08, eyeTilt: -0.04, eyeSpacing: 0.0, lipFullness: 0.08, mouthSmile: 0.06 },
  user_photo:       { faceArchetype: 'cn_round_babyface', eyebrowStyle: 'kr_straight_mist', skinVariant: 'kr_dewy_peach', jawVLine: -0.22, chinLength: -0.18, cheekSoftness: 0.28, noseBridge: -0.08, noseWidth: 0.04, eyeSize: 0.28, eyeAperture: 0.0, eyeAlmond: -0.12, eyeTilt: -0.16, eyeSpacing: 0.04, lipFullness: 0.24, mouthSmile: 0.08 },
  chuxia:           { faceArchetype: 'cn_round_babyface', eyebrowStyle: 'kr_straight_mist', skinVariant: 'kr_dewy_peach', jawVLine: -0.22, chinLength: -0.18, cheekSoftness: 0.28, noseBridge: -0.08, noseWidth: 0.04, eyeSize: 0.28, eyeAperture: 0.0, eyeAlmond: -0.12, eyeTilt: -0.16, eyeSpacing: 0.04, lipFullness: 0.24, mouthSmile: 0.08 },
  female_realistic: { faceArchetype: 'kr_idol_vline', eyebrowStyle: 'kr_idol_arch', skinVariant: 'kr_chaebol_cool', jawVLine: 0.28, chinLength: 0.14, cheekSoftness: -0.18, noseBridge: 0.24, noseWidth: -0.14, eyeSize: -0.06, eyeAperture: 0.0, eyeAlmond: 0.26, eyeTilt: 0.26, eyeSpacing: -0.02, lipFullness: -0.08, mouthSmile: -0.04 },
  linxi:            { faceArchetype: 'kr_idol_vline', eyebrowStyle: 'kr_idol_arch', skinVariant: 'kr_chaebol_cool', jawVLine: 0.28, chinLength: 0.14, cheekSoftness: -0.18, noseBridge: 0.24, noseWidth: -0.14, eyeSize: -0.06, eyeAperture: 0.0, eyeAlmond: 0.26, eyeTilt: 0.26, eyeSpacing: -0.02, lipFullness: -0.08, mouthSmile: -0.04 },
  female_2:         { faceArchetype: 'cn_classical_melon', eyebrowStyle: 'cn_willow_classical', skinVariant: 'cn_jiangnan_jade', jawVLine: 0.18, chinLength: 0.08, cheekSoftness: 0.08, noseBridge: 0.14, noseWidth: -0.10, eyeSize: 0.14, eyeAperture: 0.0, eyeAlmond: 0.18, eyeTilt: 0.08, eyeSpacing: 0.02, lipFullness: 0.12, mouthSmile: 0.04 },
  suwan:            { faceArchetype: 'cn_classical_melon', eyebrowStyle: 'cn_willow_classical', skinVariant: 'cn_jiangnan_jade', jawVLine: 0.18, chinLength: 0.08, cheekSoftness: 0.08, noseBridge: 0.14, noseWidth: -0.10, eyeSize: 0.14, eyeAperture: 0.0, eyeAlmond: 0.18, eyeTilt: 0.08, eyeSpacing: 0.02, lipFullness: 0.12, mouthSmile: 0.04 },
  female_3:         { faceArchetype: 'kr_sweet_heart', eyebrowStyle: 'kr_sweet_droop', skinVariant: 'kr_firstlove_camellia', jawVLine: 0.22, chinLength: -0.08, cheekSoftness: 0.22, noseBridge: 0.10, noseWidth: -0.08, eyeSize: 0.24, eyeAperture: 0.0, eyeAlmond: 0.06, eyeTilt: -0.10, eyeSpacing: 0.02, lipFullness: 0.18, mouthSmile: 0.04 },
  qianxue:          { faceArchetype: 'kr_sweet_heart', eyebrowStyle: 'kr_sweet_droop', skinVariant: 'kr_firstlove_camellia', jawVLine: 0.22, chinLength: -0.08, cheekSoftness: 0.22, noseBridge: 0.10, noseWidth: -0.08, eyeSize: 0.24, eyeAperture: 0.0, eyeAlmond: 0.06, eyeTilt: -0.10, eyeSpacing: 0.02, lipFullness: 0.18, mouthSmile: 0.04 },
  female_gentle:    { faceArchetype: 'cn_cold_royal', eyebrowStyle: 'cn_cold_sword', skinVariant: 'cn_intellectual_olive', jawVLine: 0.20, chinLength: 0.16, cheekSoftness: -0.20, noseBridge: 0.26, noseWidth: -0.12, eyeSize: 0.06, eyeAperture: 0.0, eyeAlmond: 0.22, eyeTilt: 0.18, eyeSpacing: -0.02, lipFullness: 0.10, mouthSmile: 0.08 },
  shenzhiwei:       { faceArchetype: 'cn_cold_royal', eyebrowStyle: 'cn_cold_sword', skinVariant: 'cn_intellectual_olive', jawVLine: 0.20, chinLength: 0.16, cheekSoftness: -0.20, noseBridge: 0.26, noseWidth: -0.12, eyeSize: 0.06, eyeAperture: 0.0, eyeAlmond: 0.22, eyeTilt: 0.18, eyeSpacing: -0.02, lipFullness: 0.10, mouthSmile: 0.08 },
};

/**
 * Stage 35 · Maps UI Eyebrow Style IDs to Official MakeHuman 3D Eyebrow Assets (`eyebrow001..012` .obj + .png)
 * Zero `browDown` so eyebrows never scowl or press down into the upper eyelids!
 */
const EYEBROW_STYLE_TO_MH_ASSET = {
  cn_scholar_natural:  { assetId: 'eyebrow002', browDown: 0.0, browUp: 0.08 },
  kr_straight_mist:    { assetId: 'eyebrow001', browDown: 0.0, browUp: 0.10 },
  kr_idol_arch:        { assetId: 'eyebrow010', browDown: 0.0, browUp: 0.16 },
  cn_willow_classical: { assetId: 'eyebrow002', browDown: 0.0, browUp: 0.12 },
  kr_sweet_droop:      { assetId: 'eyebrow004', browDown: 0.0, browUp: 0.06 },
  cn_cold_sword:       { assetId: 'eyebrow003', browDown: 0.0, browUp: 0.18 },
  kr_wild_feathered:   { assetId: 'eyebrow005', browDown: 0.0, browUp: 0.12 },
  cn_tang_moth:        { assetId: 'eyebrow008', browDown: 0.0, browUp: 0.08 },
};

/**
 * Stage 44 · Clean Zero-Distortion Default Archetype Weights
 * Follows standing user rule: "模型各种预设默认不要混合，混合很多脸看上去违和怪异不好看"
 */
const PURE_ZERO_BLEND = {
  blend_asian_youth: 0.0,
  blend_cn_scholar:  0.0,
  blend_cn_baby:     0.0,
  blend_kr_vline:    0.0,
  blend_cn_melon:    0.0,
  blend_cn_royal:    0.0,
  blend_eurasian:    0.0,
};

const ARCHETYPE_REAL_TARGET_WEIGHTS = {
  cn_oval_scholar:       { skinVariant: 'cn_scholar_natural',    mpfbKey: 'cn_oval_scholar',       headBlend: { ...PURE_ZERO_BLEND } },
  cn_round_babyface:     { skinVariant: 'kr_dewy_peach',         mpfbKey: 'cn_round_babyface',     headBlend: { ...PURE_ZERO_BLEND, blend_cn_baby: 0.18 } },
  kr_idol_vline:         { skinVariant: 'kr_chaebol_cool',       mpfbKey: 'kr_idol_vline',         headBlend: { ...PURE_ZERO_BLEND, blend_kr_vline: 0.22 } },
  cn_classical_melon:    { skinVariant: 'cn_jiangnan_jade',      mpfbKey: 'cn_classical_melon',    headBlend: { ...PURE_ZERO_BLEND, blend_cn_melon: 0.20 } },
  kr_sweet_heart:        { skinVariant: 'kr_firstlove_camellia', mpfbKey: 'kr_sweet_heart',        headBlend: { ...PURE_ZERO_BLEND, blend_kr_vline: 0.16 } },
  cn_cold_royal:         { skinVariant: 'cn_intellectual_olive', mpfbKey: 'cn_cold_royal',         headBlend: { ...PURE_ZERO_BLEND, blend_cn_royal: 0.18 } },
  cn_pure_campus_bell:   { skinVariant: 'cn_porcelain_ivory',    mpfbKey: 'cn_pure_campus_bell',   headBlend: { ...PURE_ZERO_BLEND, blend_asian_youth: 0.20 } },
  kr_waterglow_idol:     { skinVariant: 'kr_dewy_peach',         mpfbKey: 'kr_waterglow_idol',     headBlend: { ...PURE_ZERO_BLEND, blend_asian_youth: 0.18 } },
  cn_tang_peony:         { skinVariant: 'cn_jiangnan_jade',      mpfbKey: 'cn_tang_peony',         headBlend: { ...PURE_ZERO_BLEND, blend_cn_scholar: 0.18 } },
  cn_northern_danfeng:   { skinVariant: 'cn_porcelain_ivory',    mpfbKey: 'cn_northern_danfeng',   headBlend: { ...PURE_ZERO_BLEND, blend_cn_scholar: 0.22, blend_cn_melon: 0.12 } },
  cn_cat_fox_siren:      { skinVariant: 'kr_chaebol_cool',       mpfbKey: 'cn_cat_fox_siren',      headBlend: { ...PURE_ZERO_BLEND, blend_kr_vline: 0.20, blend_cn_melon: 0.18 } },
  cn_wide_catfish_chic:  { skinVariant: 'cn_intellectual_olive', mpfbKey: 'cn_wide_catfish_chic',  headBlend: { ...PURE_ZERO_BLEND, blend_cn_scholar: 0.10, blend_cn_royal: 0.22 } },
  cn_imperial_square:    { skinVariant: 'cn_scholar_natural',    mpfbKey: 'cn_imperial_square',    headBlend: { ...PURE_ZERO_BLEND, blend_cn_scholar: 0.24, blend_cn_royal: 0.14 } },
  jp_yamato_clear:       { skinVariant: 'cn_porcelain_ivory',    mpfbKey: 'jp_yamato_clear',       headBlend: { ...PURE_ZERO_BLEND, blend_asian_youth: 0.22, blend_cn_baby: 0.12 } },
  cn_puppy_innocent:     { skinVariant: 'kr_dewy_peach',         mpfbKey: 'cn_puppy_innocent',     headBlend: { ...PURE_ZERO_BLEND, blend_asian_youth: 0.16, blend_cn_baby: 0.22 } },
  eurasian_sculpted_mix: { skinVariant: 'eurasian_velvet_rose',  mpfbKey: 'eurasian_sculpted_mix', headBlend: { ...PURE_ZERO_BLEND, blend_eurasian: 0.25 } },
};
for (const fa of FACE_ARCHETYPE_CATALOG) {
  if (!fa?.id) continue;
  const existing = ARCHETYPE_REAL_TARGET_WEIGHTS[fa.id] || {};
  ARCHETYPE_REAL_TARGET_WEIGHTS[fa.id] = {
    skinVariant: existing.skinVariant || fa.defaultSkinVariant || 'cn_porcelain_ivory',
    mpfbKey: existing.mpfbKey || fa.id,
    headBlend: { ...PURE_ZERO_BLEND, ...(fa.headBlend || {}), ...(existing.headBlend || {}) },
    morphRecipe: fa.morphRecipe || {},
    defaultEyePreset: fa.defaultEyePreset || null,
  };
}

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

function applyRealEyebrowAssetToGroup(rootGroup, eyebrowStyle = 'cn_scholar_natural', morphs = null) {
  if (!rootGroup || !realWebAssetsCache?.eyebrows) return;
  const spec = EYEBROW_STYLE_TO_MH_ASSET[eyebrowStyle] || EYEBROW_STYLE_TO_MH_ASSET.cn_scholar_natural;
  const asset = realWebAssetsCache.eyebrows[spec.assetId] || realWebAssetsCache.eyebrows.eyebrow001;
  if (!asset) return;

  const m = morphs || rootGroup.userData.currentMorphs || {};
  const browH = Math.max(-1.0, Math.min(1.0, Number(m.browHeight ?? 0)));
  const browTilt = Math.max(-1.0, Math.min(1.0, Number(m.browTilt ?? 0)));
  const browThick = Math.max(0.5, Math.min(1.65, Number(m.browThickness ?? 1.0)));

  rootGroup.traverse((child) => {
    if (!child.isMesh) return;
    const matName = child.material?.name || '';
    if (child.name === 'Eyebrows' || matName === 'Eyebrow' || child.userData?.isEyebrowMesh) {
      child.userData.isEyebrowMesh = true;
      if (asset.texture && child.material) {
        child.material.map = asset.texture;
        child.material.alphaTest = 0.0;
        child.material.alphaToCoverage = false;
        child.material.transparent = true;
        child.material.opacity = Math.min(0.95, Number(rootGroup.userData.browOpacity ?? 0.90));
        if (rootGroup.userData.browColor) {
          child.material.color.set(rootGroup.userData.browColor);
        }
        child.material.needsUpdate = true;
      }
      if (asset.pos && child.geometry?.attributes?.position && child.geometry.attributes.position.array.length === asset.pos.length) {
        const out = child.geometry.attributes.position.array;
        const src = asset.pos;
        for (let i = 0; i < src.length; i += 3) {
          const bx = src[i];
          const by = src[i + 1];
          const bz = src[i + 2];
          const centerY = 0.0322;
          const archShift = (Math.abs(bx) - 0.030) * browTilt * 0.14;
          out[i] = bx;
          out[i + 1] = centerY + (by - centerY) * browThick + browH * 0.0042 + archShift;
          // Keep +0.25mm above the brow ridge so 0% of the eyebrow sinks behind HeadSkinMesh!
          out[i + 2] = bz + 0.00025;
        }
        child.geometry.attributes.position.needsUpdate = true;
        child.geometry.computeVertexNormals();
      }
      if (asset.uv && child.geometry?.attributes?.uv && child.geometry.attributes.uv.array.length === asset.uv.length) {
        child.geometry.attributes.uv.array.set(asset.uv);
        child.geometry.attributes.uv.needsUpdate = true;
      }
    }
  });
}

function resolveLegacySkinVariantId(skinVariantId = 'cn_porcelain_ivory') {
  if (realWebAssetsCache?.skins && realWebAssetsCache.skins[skinVariantId]) {
    return skinVariantId;
  }
  const legacyMap = {
    young_asian: 'cn_scholar_natural',
    natural_makeup: 'kr_dewy_peach',
    violet_makeup: 'kr_chaebol_cool',
    eurasian: 'cn_jiangnan_jade',
    glam_makeup: 'kr_firstlove_camellia',
    zoey: 'cn_intellectual_olive',
  };
  return legacyMap[skinVariantId] || skinVariantId || 'cn_porcelain_ivory';
}

const HEAD_BLEND_TO_SKIN_MAP = {
  blend_asian_youth: 'cn_porcelain_ivory',
  blend_cn_scholar:  'cn_scholar_natural',
  blend_cn_baby:     'kr_dewy_peach',
  blend_kr_vline:    'kr_chaebol_cool',
  blend_cn_melon:    'cn_jiangnan_jade',
  blend_cn_royal:    'cn_intellectual_olive',
  blend_eurasian:    'eurasian_velvet_rose',
};

function applyRealSkinVariantToGroup(rootGroup, skinVariantId = 'cn_porcelain_ivory', blendWeights = null) {
  if (!rootGroup || !realWebAssetsCache?.skins) return;
  const resolvedId = resolveLegacySkinVariantId(skinVariantId);
  let targetTex = realWebAssetsCache.skins[resolvedId] || realWebAssetsCache.skins.cn_porcelain_ivory;
  if (!targetTex) return;

  // DAZ Studio Multi-Head Skin + Geometry Blending:
  // When multiple head models are actively mixed via the 7-channel head blender, blend their 2K photographic skins!
  if (blendWeights && typeof document !== 'undefined') {
    const activeEntries = Object.entries(HEAD_BLEND_TO_SKIN_MAP)
      .map(([k, sId]) => ({ weight: Math.max(0, Number(blendWeights[k]) || 0), tex: realWebAssetsCache.skins[sId] }))
      .filter((e) => e.weight > 0.08 && e.tex?.image);

    if (activeEntries.length >= 2) {
      const sig = `${resolvedId}:${activeEntries.map((e) => `${e.weight.toFixed(2)}`).join(',')}`;
      if (rootGroup.userData._blendedSkinSig === sig && rootGroup.userData._blendedSkinTex) {
        targetTex = rootGroup.userData._blendedSkinTex;
      } else {
        let canvas = rootGroup.userData._blendedSkinCanvas;
        if (!canvas) {
          canvas = document.createElement('canvas');
          canvas.width = 1024;
          canvas.height = 1024;
          rootGroup.userData._blendedSkinCanvas = canvas;
        }
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, 1024, 1024);
        ctx.globalAlpha = 1.0;
        if (targetTex.image) {
          ctx.drawImage(targetTex.image, 0, 0, 1024, 1024);
        }
        const totalW = activeEntries.reduce((acc, e) => acc + e.weight, 0) || 1.0;
        let accumAlpha = 0.0;
        for (const entry of activeEntries) {
          const wNorm = (entry.weight / totalW) * 0.65;
          if (wNorm > 0.04 && entry.tex.image) {
            ctx.globalAlpha = Math.min(1.0, wNorm / (1.0 - accumAlpha * 0.5));
            ctx.drawImage(entry.tex.image, 0, 0, 1024, 1024);
            accumAlpha += wNorm;
          }
        }
        ctx.globalAlpha = 1.0;
        let blendedTex = rootGroup.userData._blendedSkinTex;
        if (!blendedTex) {
          blendedTex = new THREE.CanvasTexture(canvas);
          blendedTex.flipY = false;
          blendedTex.colorSpace = THREE.SRGBColorSpace;
          blendedTex.anisotropy = 16;
          blendedTex.userData = { sharedSkinMicro: true };
          rootGroup.userData._blendedSkinTex = blendedTex;
        }
        blendedTex.needsUpdate = true;
        rootGroup.userData._blendedSkinSig = sig;
        targetTex = blendedTex;
      }
    }
  }

  rootGroup.traverse((child) => {
    if (!child.isMesh) return;
    if (child.name === 'HeadSkinMesh' || child.material?.name === 'Skin') {
      if (child.material) {
        child.material.userData = child.material.userData || {};
        child.material.userData.baseSkinMap = targetTex;
        if (!rootGroup.userData.liveMaterials?.customSkinMapUrl && child.material.map !== targetTex) {
          child.material.map = targetTex;
          child.material.needsUpdate = true;
        }
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
  const sideburn = Math.max(-0.6, Math.min(0.7, Number(morphs.sideburnLock ?? 0)));
  const hairFlare = Math.max(-0.7, Math.min(0.7, Number(morphs.hairFlare ?? 0)));
  const hairCurlWave = Math.max(-0.6, Math.min(0.9, Number(morphs.hairCurlWave ?? 0)));
  const offX = Math.max(-0.5, Math.min(0.5, Number(morphs.hairOffsetX ?? 0)));
  const offY = Math.max(-0.5, Math.min(0.5, Number(morphs.hairOffsetY ?? 0)));
  const offZ = Math.max(-0.5, Math.min(0.5, Number(morphs.hairOffsetZ ?? 0)));
  const uScale = Math.max(0.82, Math.min(1.22, Number(morphs.hairScale ?? 1.0)));
  const neckClear = Math.max(0.0, Math.min(1.0, Number(rootGroup.userData.neckClearance ?? 0.45)));
  const topCrownStyle = morphs.topCrown || morphs.topCrownStyle || rootGroup.userData.topCrownStyle || 'default';
  const frontBangsStyle = morphs.frontBangs || morphs.frontBangsStyle || rootGroup.userData.frontBangsStyle || 'default';
  const sideLocksStyle = morphs.sideLocks || morphs.sideLocksStyle || rootGroup.userData.sideLocksStyle || 'default';
  const wispyFeather = Math.max(0.0, Math.min(1.0, Number(morphs.hairWispyFeather ?? rootGroup.userData.hairWispyFeather ?? 0.45)));
  const ombreMix = Math.max(0.0, Math.min(1.0, Number(morphs.hairOmbreMix ?? rootGroup.userData.hairOmbreMix ?? 0.0)));
  const tipColorHex = morphs.hairTipColor || rootGroup.userData.hairTipColor || '#4a3528';
  const tipCol = new THREE.Color(tipColorHex);
  const highlightHex = morphs.hairHighlightColor || rootGroup.userData.hairHighlightColor || '#9e6b52';
  const highlightCol = new THREE.Color(highlightHex);
  const highlightStr = Math.max(0.0, Math.min(1.0, Number(morphs.hairHighlightStrength ?? rootGroup.userData.hairHighlightStrength ?? 0.0)));

  hairGroup.position.set(offX * 0.035, offY * 0.035, offZ * 0.035);
  hairGroup.scale.setScalar(uScale);

  const hcX = 0.0, hcY = 0.025, hcZ = 0.0;
  const visitedGeos = new Set();

  hairGroup.traverse((child) => {
    if (child.isMesh && child.material?.userData?.hairShaderUniforms) {
      const u = child.material.userData.hairShaderUniforms;
      if (u.uHairWispyFeather) u.uHairWispyFeather.value = wispyFeather;
      if (u.uHairOmbreMix) u.uHairOmbreMix.value = ombreMix;
      if (u.uHairTipColor) u.uHairTipColor.value.copy(tipCol);
      if (u.uHairHighlightColor) u.uHairHighlightColor.value.copy(highlightCol);
      if (u.uHairHighlightStrength) u.uHairHighlightStrength.value = highlightStr;
    }
    if (child.isMesh && child.material?.userData?.strandUniforms) {
      const su = child.material.userData.strandUniforms;
      if (su.uHairOmbreMix) su.uHairOmbreMix.value = ombreMix;
      if (su.uHairTipColor) su.uHairTipColor.value.copy(tipCol);
    }
    if (!child.isMesh || !child.geometry?.attributes?.position) return;
    if (child.name === 'ScalpRootFeatherCap' || child.name === 'ScalpRootStrands') {
      return;
    }
    const isStrandMesh = child.name === 'MasterStrandHairMesh' || child.name === 'BabyHairWisps';
    const crownBoost = topCrownStyle === 'fluffy_high_crown' ? 0.28 : 0.0;
    const effHairVol = hairVol + crownBoost;
    const effBangsLen = frontBangsStyle === 'forehead_bare' ? Math.min(bangsLen, -0.42) : (frontBangsStyle === 'choppy_micro' ? Math.min(bangsLen, -0.25) : bangsLen);
    const effBangsPart = frontBangsStyle === 'forehead_bare' ? Math.max(bangsPart, 0.68) : (frontBangsStyle === 'curtain_part' ? Math.max(bangsPart, 0.36) : bangsPart);
    const effSideburn = sideLocksStyle === 'tucked_ear' ? Math.min(sideburn, -0.46) : sideburn;
    if (isStrandMesh || child.material?.userData?.isMasterCardHair) {
      const u = child.material?.userData?.strandUniforms;
      if (child.name === 'BabyHairWisps') return;
      if (u?.uHairFineTune0 && u?.uHairFineTune1 && u?.uHairFineTune2) {
        const crownMode = topCrownStyle === 'photo_sleek_crown' ? 1.0 : (topCrownStyle === 'side_part_crown' ? 2.0 : 0.0);
        u.uHairFineTune0.value.set(crownMode, effHairVol, effBangsLen, effBangsPart);
        u.uHairFineTune1.value.set(effSideburn, hairLen, hairFlare, hairCurlWave);
        u.uHairFineTune2.value.set(neckClear, 0, 0, 0);
      }
      return;
    }
    const geo = child.geometry;
    if (visitedGeos.has(geo)) return;
    visitedGeos.add(geo);

    const posAttr = geo.attributes.position;
    if (!geo.userData.basePositions) {
      geo.userData.basePositions = Float32Array.from(posAttr.array);
    }
    const signature = JSON.stringify([bangsLen,bangsPart,hairVol,hairLen,sideburn,hairFlare,hairCurlWave,neckClear,topCrownStyle,frontBangsStyle,sideLocksStyle,rootGroup.userData.morphSignature || '']);
    if (geo.userData.hairShapeSignature === signature) return;
    geo.userData.hairShapeSignature = signature;
    if (!geo.userData.baseHairNormals && geo.attributes.normal) geo.userData.baseHairNormals = Float32Array.from(geo.attributes.normal.array);
    const base = geo.userData.basePositions;
    const out = posAttr.array;
    const count = posAttr.count;
    const isModularDonor = Boolean(child.userData?.isModularPart);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = base[i3];
      let y = base[i3 + 1];
      let z = base[i3 + 2];

      // Modular Crown Shaping (Zone 1)
      if (!isModularDonor && topCrownStyle === 'photo_sleek_crown' && y < 0.045 && Math.abs(x) > 0.052 && z < 0.042) {
        const wSleek = Math.min(1.0, (0.045 - y) / 0.065) * Math.min(1.0, (Math.abs(x) - 0.052) / 0.032);
        const signX = x >= 0 ? 1.0 : -1.0;
        x -= signX * 0.014 * wSleek;
        z -= 0.010 * wSleek;
      } else if (!isModularDonor && topCrownStyle === 'side_part_crown' && y > 0.045) {
        const wTop = Math.min(1.0, (y - 0.045) / 0.075);
        x += 0.008 * wTop;
      }

      if (Math.abs(effHairVol) > 1e-4 && y > -0.02) {
        const wCrown = Math.min(1.0, Math.max(0.0, (y + 0.02) / 0.09));
        const rx = x - hcX;
        const ry = y - hcY;
        const rz = z - hcZ;
        x += rx * (effHairVol * 0.16 * wCrown);
        if (ry > 0) y += ry * (effHairVol * 0.22 * wCrown);
        z += rz * (effHairVol * 0.12 * wCrown);
      }

      if ((Math.abs(effBangsLen) > 1e-4 || Math.abs(effBangsPart) > 1e-4) && z > 0.042 && y > -0.035 && Math.abs(x) < 0.068) {
        const wFront = Math.min(1.0, Math.max(0.0, (z - 0.042) / 0.045));
        const wCenter = Math.min(1.0, Math.max(0.0, 1.0 - Math.abs(x) / 0.068));
        const wLowerBangs = Math.min(1.0, Math.max(0.0, (0.065 - y) / 0.065));
        const wBangs = wFront * wCenter * wLowerBangs;
        y -= effBangsLen * 0.028 * wBangs;
        z += Math.max(0.0, effBangsLen) * 0.005 * wBangs;
        if (Math.abs(effBangsPart) > 1e-4) {
          const signX = x >= 0 ? 1.0 : -1.0;
          const partStrength = Math.exp(-Math.pow(Math.abs(x) / 0.036, 2.0));
          x += signX * effBangsPart * 0.028 * wFront * wLowerBangs * partStrength;
          y += Math.max(0.0, effBangsPart) * 0.014 * wFront * wLowerBangs * partStrength;
        }
      }

      if (Math.abs(effSideburn) > 1e-4 && z > -0.015 && y < 0.032 && Math.abs(x) > 0.032) {
        const wSide = Math.min(1.0, Math.max(0.0, (0.032 - y) / 0.10));
        const signX = x >= 0 ? 1.0 : -1.0;
        x -= signX * effSideburn * 0.016 * wSide;
        z += effSideburn * 0.012 * wSide;
      }

      if ((Math.abs(hairLen) > 1e-4 || Math.abs(hairFlare) > 1e-4 || Math.abs(hairCurlWave) > 1e-4) && y < -0.005) {
        const wTip = Math.min(1.0, Math.max(0.0, (-0.005 - y) / 0.11));
        y -= hairLen * 0.055 * wTip;
        const signX = x >= 0 ? 1.0 : -1.0;
        x += signX * hairFlare * 0.028 * (wTip * wTip);
        z += hairFlare * 0.014 * (wTip * wTip);
        if (Math.abs(hairCurlWave) > 1e-4) {
          const wavePhase = y * 135.0 + Math.abs(x) * 42.0;
          x += Math.sin(wavePhase) * 0.0085 * hairCurlWave * wTip;
          z += Math.cos(wavePhase * 0.85) * 0.0065 * hairCurlWave * wTip;
        }
      }

      if (neckClear > 0.05 && y < -0.042 && z < 0.025) {
        const wBelow = Math.min(1.0, Math.max(0.0, (-0.042 - y) / 0.055));
        const rNeck = Math.hypot(x, z + 0.014);
        if (rNeck < 0.050) {
          const push = (0.050 - rNeck) * neckClear * 0.72 * wBelow;
          const signX = x >= 0 ? 1.0 : -1.0;
          x += signX * push * 0.88;
          z -= push * 0.32;
        }
      }

      out[i3] = x;
      out[i3 + 1] = y;
      out[i3 + 2] = z;
    }

      if (child.material?.userData?.builtInHair && !isStrandMesh && !child.material?.userData?.isMasterCardHair) {
        fitArtistHairOutsideScalp(geo, rootGroup.getObjectByName('HeadSkinMesh'));
      }
    // A changed hair-shape signature has just rebuilt the unbrushed card from
    // its cached artist positions. Re-add the cached user sculpt layer once;
    // unchanged strand buffers never pay this per-slider cost.
    if (geo.userData.sculptDelta) geo.userData.sculptOnPositions = false;
    geo.userData.sculptBounds = null;
    posAttr.needsUpdate = true;
    // CRITICAL RULE: NEVER call raw geo.computeVertexNormals() on UV-split hair cards!
    // Raw computeVertexNormals() creates flat faceted triangles across UV seams (causing white triangle glare).
    // Always preserve the welded radial-blended baseHairNormals baked into the GLB!
    if (geo.userData.baseHairNormals && geo.attributes.normal) {
      geo.attributes.normal.array.set(geo.userData.baseHairNormals);
      geo.attributes.normal.needsUpdate = true;
    }
    if (geo.attributes.artistHairFlow) updateArtistHairFlow(geo, geo.userData.hairFlowHorizontal);
    geo.computeBoundingBox();
    geo.computeBoundingSphere();
  });
}

export function setHeadSkinVariant(rootGroup, skinVariant = 'cn_porcelain_ivory') {
  if (!rootGroup) return;
  const resolved = resolveLegacySkinVariantId(skinVariant);
  rootGroup.userData.skinVariant = resolved;
  rootGroup.userData.currentMorphs = { ...(rootGroup.userData.currentMorphs || {}), skinVariant: resolved };
  applyRealSkinVariantToGroup(rootGroup, resolved);
}

export function setHeadEyebrowStyle(rootGroup, eyebrowStyle = 'cn_scholar_natural') {
  if (!rootGroup) return;
  rootGroup.userData.eyebrowStyle = eyebrowStyle;
  rootGroup.userData.currentMorphs = { ...(rootGroup.userData.currentMorphs || {}), eyebrowStyle };
  applyRealEyebrowAssetToGroup(rootGroup, eyebrowStyle);
  applyHeadMorphsToGroup(rootGroup, rootGroup.userData.currentMorphs);
}

export function setHeadFaceArchetype(rootGroup, faceArchetype = 'cn_oval_scholar', options = {}) {
  if (!rootGroup) return;
  rootGroup.userData.faceArchetype = faceArchetype;
  const archSpec = ARCHETYPE_REAL_TARGET_WEIGHTS[faceArchetype] || ARCHETYPE_REAL_TARGET_WEIGHTS.cn_oval_scholar;
  const blendRecipe = archSpec.headBlend || {};
  const morphRecipe = archSpec.morphRecipe || {};
  const nextMorphs = {
    ...(rootGroup.userData.currentMorphs || {}),
    ...morphRecipe,
    ...(archSpec.defaultEyePreset ? { eyePreset: archSpec.defaultEyePreset } : {}),
    faceArchetype,
    ...blendRecipe,
  };
  if (options.syncSkinVariant !== false && archSpec.skinVariant) {
    rootGroup.userData.skinVariant = archSpec.skinVariant;
    nextMorphs.skinVariant = archSpec.skinVariant;
    applyRealSkinVariantToGroup(rootGroup, archSpec.skinVariant);
  }
  rootGroup.userData.currentMorphs = nextMorphs;
  applyHeadMorphsToGroup(rootGroup, nextMorphs);
}

export function getHeadBlendStateFromGroup(rootGroup) {
  const m = rootGroup?.userData?.currentMorphs || {};
  const faceArchetype = m.faceArchetype || rootGroup?.userData?.faceArchetype || 'cn_oval_scholar';
  const archSpec = ARCHETYPE_REAL_TARGET_WEIGHTS[faceArchetype] || ARCHETYPE_REAL_TARGET_WEIGHTS.cn_oval_scholar;
  const def = archSpec.headBlend || {};
  const state = {
    blend_asian_youth: Number(m.blend_asian_youth ?? def.blend_asian_youth ?? 0.0),
    blend_cn_scholar:  Number(m.blend_cn_scholar  ?? def.blend_cn_scholar  ?? 0.0),
    blend_cn_baby:     Number(m.blend_cn_baby     ?? def.blend_cn_baby     ?? 0.0),
    blend_kr_vline:    Number(m.blend_kr_vline    ?? def.blend_kr_vline    ?? 0.0),
    blend_cn_melon:    Number(m.blend_cn_melon    ?? def.blend_cn_melon    ?? 0.0),
    blend_cn_royal:    Number(m.blend_cn_royal    ?? def.blend_cn_royal    ?? 0.0),
    blend_eurasian:    Number(m.blend_eurasian    ?? def.blend_eurasian    ?? 0.0),
  };
  for (const ch of HEAD_BLEND_CHANNELS) {
    const isOff = m['on_' + ch.id] === false;
    state[ch.id] = isOff ? 0.0 : Number(m[ch.id] ?? def[ch.id] ?? 0.0);
  }
  return state;
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
  const defBlend = archSpec.headBlend || {};
  const browSpec = EYEBROW_STYLE_TO_MH_ASSET[eyebrowStyle] || EYEBROW_STYLE_TO_MH_ASSET.cn_scholar_natural;

  const clampBlend = (val) => Math.max(0.0, Math.min(1.4, Number(val) || 0.0));
  const LEGACY_7_IDS = new Set([
    'blend_asian_youth', 'blend_cn_scholar', 'blend_cn_baby',
    'blend_kr_vline', 'blend_cn_melon', 'blend_cn_royal', 'blend_eurasian'
  ]);
  let wAsianYouth = m.on_blend_asian_youth === false ? 0 : clampBlend(m.blend_asian_youth ?? defBlend.blend_asian_youth ?? 0.0);
  let wCnScholar  = m.on_blend_cn_scholar === false  ? 0 : clampBlend(m.blend_cn_scholar  ?? defBlend.blend_cn_scholar  ?? 0.0);
  let wCnBaby     = m.on_blend_cn_baby === false     ? 0 : clampBlend(m.blend_cn_baby     ?? defBlend.blend_cn_baby     ?? 0.0);
  let wKrVline    = m.on_blend_kr_vline === false    ? 0 : clampBlend(m.blend_kr_vline    ?? defBlend.blend_kr_vline    ?? 0.0);
  let wCnMelon    = m.on_blend_cn_melon === false    ? 0 : clampBlend(m.blend_cn_melon    ?? defBlend.blend_cn_melon    ?? 0.0);
  let wCnRoyal    = m.on_blend_cn_royal === false    ? 0 : clampBlend(m.blend_cn_royal    ?? defBlend.blend_cn_royal    ?? 0.0);
  let wEurasian   = m.on_blend_eurasian === false    ? 0 : clampBlend(m.blend_eurasian    ?? defBlend.blend_eurasian    ?? 0.0);

  // Stage 65: Accumulate all 38 East Asian head models from HEAD_BLEND_CHANNELS
  let extraJawV = 0, extraChin = 0, extraCheek = 0, extraNose = 0, extraNoseW = 0;
  let extraEyeSize = 0, extraEyeAlmond = 0, extraEyeTilt = 0, extraEyeSpacing = 0;
  let extraLip = 0, extraSmile = 0, extraForehead = 0;

  let activeExtraSum = 0;
  for (const ch of HEAD_BLEND_CHANNELS) {
    if (m['on_' + ch.id] === false) continue;
    const wCh = clampBlend(m[ch.id] ?? 0.0);
    if (wCh <= 0.001) continue;
    const chSpec = ARCHETYPE_REAL_TARGET_WEIGHTS[ch.archId];
    if (!chSpec) continue;
    if (!LEGACY_7_IDS.has(ch.id)) {
      const hb = chSpec.headBlend || {};
      wAsianYouth += wCh * (hb.blend_asian_youth || (ch.morphKey === 'mh_head_asian_youth' ? 0.65 : 0));
      wCnScholar  += wCh * (hb.blend_cn_scholar  || (ch.morphKey === 'mh_head_oval'        ? 0.65 : 0));
      wCnBaby     += wCh * (hb.blend_cn_baby     || (ch.morphKey === 'mh_head_round'       ? 0.65 : 0));
      wKrVline    += wCh * (hb.blend_kr_vline    || (ch.morphKey === 'mh_head_heart'       ? 0.65 : 0));
      wCnMelon    += wCh * (hb.blend_cn_melon    || (ch.morphKey === 'mh_head_melon'       ? 0.65 : 0));
      wCnRoyal    += wCh * (hb.blend_cn_royal    || (ch.morphKey === 'mh_head_diamond'     ? 0.65 : 0));
      wEurasian   += wCh * (hb.blend_eurasian    || (ch.morphKey === 'mh_head_eurasian'    ? 0.65 : 0));
    }
    const mr = chSpec.morphRecipe || {};
    extraJawV       += wCh * Number(mr.jawVLine ?? 0) * 0.45;
    extraChin       += wCh * Number(mr.chinLength ?? 0) * 0.45;
    extraCheek      += wCh * Number(mr.cheekSoftness ?? 0) * 0.45;
    extraNose       += wCh * Number(mr.noseBridge ?? 0) * 0.45;
    extraNoseW      += wCh * Number(mr.noseWidth ?? 0) * 0.45;
    extraEyeSize    += wCh * Number(mr.eyeSize ?? 0) * 0.40;
    extraEyeAlmond  += wCh * Number(mr.eyeAlmond ?? 0) * 0.40;
    extraEyeTilt    += wCh * Number(mr.eyeTilt ?? 0) * 0.45;
    extraEyeSpacing += wCh * Number(mr.eyeSpacing ?? 0) * 0.40;
    extraLip        += wCh * Number(mr.lipFullness ?? 0) * 0.40;
    extraSmile      += wCh * Number(mr.mouthSmile ?? 0) * 0.40;
    extraForehead   += wCh * Number(mr.foreheadHeight ?? 0) * 0.35;
    activeExtraSum  += wCh;
  }

  // Soft normalization so turning on 3, 10, or all 38 head model switches simultaneously never over-inflates facial geometry
  const rawBaseSum = wAsianYouth + wCnScholar + wCnBaby + wKrVline + wCnMelon + wCnRoyal + wEurasian;
  const baseNorm = rawBaseSum > 1.25 ? (1.25 / rawBaseSum) : 1.0;
  wAsianYouth *= baseNorm;
  wCnScholar  *= baseNorm;
  wCnBaby     *= baseNorm;
  wKrVline    *= baseNorm;
  wCnMelon    *= baseNorm;
  wCnRoyal    *= baseNorm;
  wEurasian   *= baseNorm;

  const extraNorm = activeExtraSum > 1.35 ? (1.35 / activeExtraSum) : 1.0;
  extraJawV       *= extraNorm;
  extraChin       *= extraNorm;
  extraCheek      *= extraNorm;
  extraNose       *= extraNorm;
  extraNoseW      *= extraNorm;
  extraEyeSize    *= extraNorm;
  extraEyeAlmond  *= extraNorm;
  extraEyeTilt    *= extraNorm;
  extraEyeSpacing *= extraNorm;
  extraLip        *= extraNorm;
  extraSmile      *= extraNorm;
  extraForehead   *= extraNorm;

  const skinVariant = resolveLegacySkinVariantId(
    m.skinVariant || rootGroup.userData.skinVariant || bias.skinVariant || archSpec.skinVariant || 'cn_porcelain_ivory'
  );
  rootGroup.userData.skinVariant = skinVariant;
  applyRealSkinVariantToGroup(rootGroup, skinVariant, {
    blend_asian_youth: wAsianYouth,
    blend_cn_scholar:  wCnScholar,
    blend_cn_baby:     wCnBaby,
    blend_kr_vline:    wKrVline,
    blend_cn_melon:    wCnMelon,
    blend_cn_royal:    wCnRoyal,
    blend_eurasian:    wEurasian,
  });
  applyRealEyebrowAssetToGroup(rootGroup, eyebrowStyle, m);

  // Stage 43 + Stage 65: Full-range [-1.5, +1.5] facial, cranial & 14-parameter eye shape/optics fine-tuning
  const clampHarmony = (val, maxAbs = 1.35) => Math.max(-maxAbs, Math.min(maxAbs, Number(val) || 0));

  const jawV = clampHarmony((m.jawVLine ?? -(m.jawWidth ?? bias.jawVLine)) + 0.24 + extraJawV);
  const chin = clampHarmony((m.chinLength ?? bias.chinLength) - 0.08 + extraChin);
  const cheek = clampHarmony((m.cheekSoftness ?? m.cheekboneFullness ?? bias.cheekSoftness) + extraCheek);
  const nose = clampHarmony((m.noseBridge ?? m.noseBridgeHeight ?? bias.noseBridge) + extraNose);
  const noseW = clampHarmony((m.noseWidth ?? (-nose * 0.35)) - 0.24 + extraNoseW);
  // Keep eyeSize and eyeAlmond independent so eyeSize is NEVER shadowed when eyeAlmond === 0!
  const eyeSizeVal = clampHarmony((m.eyeSize ?? 0.0) + extraEyeSize, 1.5);
  const eyeApertureVal = clampHarmony(m.eyeAperture ?? 0.0, 1.5);
  const eyeAlmondVal = clampHarmony((m.eyeAlmond ?? bias.eyeAlmond ?? 0.0) + extraEyeAlmond, 1.5);
  const eye = clampHarmony(eyeSizeVal * 1.15 + eyeAlmondVal * 0.65, 1.65);
  const eyeTilt = clampHarmony((m.eyeTilt ?? bias.eyeTilt) + extraEyeTilt, 1.5);
  const eyeSpacingVal = clampHarmony((m.eyeSpacing ?? 0.0) + extraEyeSpacing, 1.3);
  const eyelidOpen = clampHarmony(m.eyelidOpen ?? 0, 1.5);
  const browH = clampHarmony(m.browHeight ?? 0);
  const lip = clampHarmony((m.lipFullness ?? bias.lipFullness) - 0.14 + extraLip, 1.30);
  const mouthSmile = clampHarmony((m.mouthSmile ?? 0) + extraSmile, 1.30);
  const forehead = clampHarmony((m.foreheadHeight ?? 0) + extraForehead, 1.30);
  const ear = clampHarmony(m.earSize ?? 0, 1.30);
  const headWidthRatio = clampHarmony(m.headWidthScale ?? m.headWidth ?? 0, 0.28);
  const headLengthRatio = clampHarmony(m.headLengthScale ?? m.headLength ?? 0, 0.28);

  const exprId = m.deadExpression || rootGroup.userData.deadExpression || 'dead_calm';
  rootGroup.userData.deadExpression = exprId;
  const exprPreset = FORENSIC_EXPRESSION_PRESETS.find((p) => p.id === exprId) || FORENSIC_EXPRESSION_PRESETS[0];
  const presetW = exprPreset.weights || {};

  const jawOpenVal = Math.max(0, Math.min(0.85, Number(m.jawOpen ?? m.mouthOpen ?? 0)));
  const jawSideVal = Math.max(0, Math.min(0.85, Number(m.jawSide ?? 0)));
  const tongueOutVal = Math.max(0, Math.min(0.85, Number(m.tongueOut ?? 0)));
  const eyeRollUpVal = Math.max(0, Math.min(0.85, Number(m.eyeRollUp ?? 0)));
  const calmLidRelax = exprId === 'dead_calm' ? 0.12 : 0.0;
  const openSlider = Number(m.eyelidOpen ?? m.eyeAperture ?? 0);
  const eyeCloseVal = Math.max(0, Math.min(0.95, Number(m.eyeClose ?? calmLidRelax) + Math.max(0, -openSlider * 0.45)));
  const eyeWideVal = Math.max(0, Math.min(0.45, Number(m.eyeWide ?? 0) + Math.max(0, (openSlider - 0.25) * 0.40)));

  const targetWeights = {
    // 7 Distinct DAZ-Style Complete 3D Head Models + 2 Brow Bone Channels (encoded in int16 * 32767.0)
    mh_head_asian_youth: wAsianYouth * 0.65,
    mh_head_oval:        wCnScholar * 0.55,
    mh_head_round:       wCnBaby * 0.52,
    mh_head_heart:       wKrVline * 0.58,
    mh_head_melon:       wCnMelon * 0.58,
    mh_head_diamond:     wCnRoyal * 0.52,
    mh_head_eurasian:    wEurasian * 0.65,
    mh_brow_down:        Math.max(0, Number(browSpec.browDown ?? 0) + Math.max(0, -browH * 0.75)),
    mh_brow_up:          Math.max(0, Number(browSpec.browUp ?? 0) + Math.max(0, browH * 0.75)),
    // Official MakeHuman Base `.target` Sliders (harmonious range)
    face_jaw_width_decr: jawV > 0 ? jawV * 0.85 : 0,
    face_jaw_width_incr: jawV < 0 ? -jawV * 0.85 : 0,
    face_chin_incr: chin > 0 ? chin * 0.85 : 0,
    face_chin_decr: chin < 0 ? -chin * 0.85 : 0,
    face_cheekbones_incr: cheek > 0 ? cheek * 0.85 : 0,
    face_cheekbones_decr: cheek < 0 ? -cheek * 0.85 : 0,
    face_nose_height_incr: nose > 0 ? nose * 0.85 : 0,
    face_nose_height_decr: nose < 0 ? -nose * 0.85 : 0,
    face_nose_width_incr: noseW > 0 ? noseW * 0.82 : 0,
    face_nose_width_decr: noseW < 0 ? -noseW * 0.82 : 0,
    face_eye_size_incr: eye > 0 ? eye * 0.78 : 0,
    face_eye_size_decr: eye < 0 ? -eye * 0.78 : 0,
    // In MakeHuman/daz_asian_head_base.glb, face_eye_tilt_decr lowers the medial (inner) canthus = positive upward slant (丹凤眼/吊梢眼)
    face_eye_tilt_decr: eyeTilt > 0 ? eyeTilt * 0.75 : 0,
    face_eye_tilt_incr: eyeTilt < 0 ? -eyeTilt * 0.75 : 0,
    face_lips_incr: lip > 0 ? lip * 0.72 : 0,
    face_lips_decr: lip < 0 ? -lip * 0.72 : 0,
    face_mouth_width_decr: 0,
    face_mouth_width_incr: 0,
    face_forehead_incr: forehead > 0 ? forehead * 0.82 : 0,
    face_forehead_decr: forehead < 0 ? -forehead * 0.82 : 0,
    face_ear_size_incr: ear > 0 ? ear * 0.85 : 0,
    face_ear_size_decr: ear < 0 ? -ear * 0.85 : 0,
    blink_left: eyeCloseVal,
    blink_right: eyeCloseVal,
    look_left: 0,
    look_right: 0,
    look_up: eyeRollUpVal * 0.65,
    look_down: 0,
    expr_serene: Number(presetW.expr_serene ?? 0),
    expr_hollow: Math.max(0, Number(presetW.expr_hollow ?? 0) + Math.max(0, -mouthSmile * 0.45)),
    expr_shock: Number(presetW.expr_shock ?? 0),
    expr_rigor: Number(presetW.expr_rigor ?? 0),
    expr_smile: Math.max(0, Number(presetW.expr_smile ?? 0) + Math.max(0, mouthSmile * 0.85)),
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

  // Apply non-destructive overall cranial width & length aspect ratio scaling
  const modelContainer = rootGroup.getObjectByName('RealDazHeadContainer');
  if (modelContainer) {
    modelContainer.scale.set(
      BUST_WORLD_SCALE * (1.0 + headWidthRatio * 0.55),
      BUST_WORLD_SCALE * (1.0 + headLengthRatio * 0.55),
      BUST_WORLD_SCALE
    );
  }

  // Update gaze offset, iris scale coupled with eyeSize, eye spacing & eyelash density on Eye/Eyelash meshes
  const yaw = clampHarmony(m.gazeYaw ?? 0, 1.0);
  const pitch = clampHarmony(m.gazePitch ?? 0, 1.0);
  const baseIrisScale = Number(m.irisScale ?? rootGroup.userData?.liveMaterials?.irisScale ?? 1.0);
  const coupledIrisScale = Math.max(0.62, Math.min(1.52, baseIrisScale * (1.0 + eyeSizeVal * 0.16)));
  rootGroup.traverse((child) => {
    if (!child.isMesh) return;
    const eyeU = child.material?.userData?.eyeUniforms;
    if (eyeU) {
      if (eyeU.uGazeOffset) eyeU.uGazeOffset.value.set(yaw * 0.24, pitch * 0.22);
      if (eyeU.uIrisScale) eyeU.uIrisScale.value = coupledIrisScale;
      if (eyeU.uEyeSpacing) eyeU.uEyeSpacing.value = eyeSpacingVal;
      if (m.pupilSize !== undefined && eyeU.uPupilScale) eyeU.uPupilScale.value = Number(m.pupilSize);
      if (m.irisBrightness !== undefined && eyeU.uIrisBrightness) eyeU.uIrisBrightness.value = Number(m.irisBrightness);
      if (m.limbalRing !== undefined && eyeU.uLimbalRing) eyeU.uLimbalRing.value = Number(m.limbalRing);
      if (m.irisColor && eyeU.uIrisColor) {
        eyeU.uIrisColor.value.set(m.irisColor);
        if (eyeU.uIrisColorMix) eyeU.uIrisColorMix.value = Math.max(0.88, Number(m.irisColorMix ?? m.irisMix ?? 0.92));
      }
    }
    if ((child.material?.name === 'Eyelash' || child.userData?.isEyelashMesh) && m.eyelashDensity !== undefined) {
      child.material.opacity = Math.max(0.08, Math.min(1.0, Number(m.eyelashDensity) * 0.86));
    }
  });

  applyMpfbEastAsianTargetsToGroup(rootGroup, m, faceArchetype);
  applyArtistHairFineTuning(rootGroup, m);
  applyStoredHairSculpt(rootGroup, m);
  syncFaceAccessories(rootGroup, m);

  const capMesh = rootGroup.getObjectByName('NeckCrossSectionCap');
  if (capMesh) {
    const cutOffsetCm = Number(m.cutHeightOffset ?? 0);
    capMesh.position.y = (cutOffsetCm / BUST_WORLD_SCALE) * 0.35;
  }
}

function createLightweightGeometryInstance(srcGeo, clonePos = true) {
  const g = new THREE.BufferGeometry();
  g.index = srcGeo.index;
  g.attributes = clonePos && srcGeo.attributes?.position
    ? { ...srcGeo.attributes, position: srcGeo.attributes.position.clone() }
    : { ...srcGeo.attributes };
  g.morphAttributes = srcGeo.morphAttributes;
  g.morphTargetsRelative = srcGeo.morphTargetsRelative;
  g.groups = srcGeo.groups;
  g.boundingBox = srcGeo.boundingBox ? srcGeo.boundingBox.clone() : null;
  g.boundingSphere = srcGeo.boundingSphere ? srcGeo.boundingSphere.clone() : null;
  g.userData = { ...srcGeo.userData };
  return g;
}

/**
 * Stage 48 · Official MakeHuman / MPFB2 3D East Asian Eye & Head Morph Target Blender
 * Applies the 34 artist-sculpted MPFB2 `.target.gz` sparse displacement vectors to HeadSkinMesh (4494v),
 * Eyelashes (250v), and Eyes (rigid horizontal socket sync) in < 0.25ms.
 */
function applyMpfbEastAsianTargetsToGroup(rootGroup, m = {}, faceArchetype = 'cn_oval_scholar') {
  if (!rootGroup) return;
  const skinMesh = rootGroup.getObjectByName('HeadSkinMesh');
  if (!skinMesh?.geometry?.attributes?.position) return;

  const archSpec = ARCHETYPE_REAL_TARGET_WEIGHTS[faceArchetype] || ARCHETYPE_REAL_TARGET_WEIGHTS.cn_oval_scholar;
  const archRecipe = EAST_ASIAN_ARCHETYPE_MPFB_RECIPES[archSpec.mpfbKey] || {};

  const eyeTiltVal = Math.max(-1.5, Math.min(1.5, Number(m.eyeTilt ?? 0)));
  const eyeHeightVal = Math.max(-1.5, Math.min(1.5, Number(m.eyeHeight ?? m.eyeAperture ?? 0)));
  const eyeSpacingVal = Math.max(-1.3, Math.min(1.3, Number(m.eyeSpacing ?? 0)));
  const eyeEpicanthusVal = Math.max(-1.5, Math.min(1.5, Number(m.eyeEpicanthus ?? 0)));
  const eyeCreaseVal = Math.max(-1.5, Math.min(1.5, Number(m.eyeCrease ?? 0)));
  const eyeBagVal = Math.max(0.0, Math.min(1.5, Number(m.eyeBag ?? m.aegyoSalStrength ?? 0)));
  // Advanced edit range: signed MPFB sculpts really respond beyond the old
  // [-1,+1] controls, but remain bounded before eyelids/lips can invert.
  const fineValue = (key) => Math.max(-1.30, Math.min(1.30, Number(m[key]) || 0));

  const weights = { ...archRecipe };
  const addW = (k, v) => {
    if (Math.abs(v) > 1e-4) weights[k] = (weights[k] || 0) + v;
  };

  // Stage 65: Blend MPFB2 3D `.target` recipes across all 38 East Asian head models when switched ON
  let totalChWeight = 0;
  for (const ch of HEAD_BLEND_CHANNELS) {
    if (m['on_' + ch.id] === false) continue;
    const wCh = Math.max(0, Math.min(1.4, Number(m[ch.id] ?? 0)));
    if (wCh > 0.001) totalChWeight += wCh;
  }
  if (totalChWeight > 0.001) {
    const chNorm = totalChWeight > 1.25 ? (1.25 / totalChWeight) : 1.0;
    for (const ch of HEAD_BLEND_CHANNELS) {
      if (m['on_' + ch.id] === false) continue;
      const wCh = Math.max(0, Math.min(1.4, Number(m[ch.id] ?? 0))) * chNorm;
      if (wCh <= 0.001) continue;
      const chSpec = ARCHETYPE_REAL_TARGET_WEIGHTS[ch.archId];
      const chMpfb = EAST_ASIAN_ARCHETYPE_MPFB_RECIPES[chSpec?.mpfbKey || ch.archId];
      if (!chMpfb) continue;
      for (const [tk, tv] of Object.entries(chMpfb)) {
        addW(tk, tv * wCh * 0.72);
      }
    }
  }

  // 1. Epicanthic Fold & Inner Canthus (内眦赘皮/蒙古褶 vs 开内眼角)
  // Note: in MPFB2, corner2 (|x|=0.21) is the medial (inner) canthus; corner1 (|x|=0.43) is the lateral (outer) canthus
  if (eyeEpicanthusVal > 0) {
    addW('eye_epicanthus_in', eyeEpicanthusVal * 0.85);
    addW('eye_outer_corner_down', eyeEpicanthusVal * 0.45);
  } else if (eyeEpicanthusVal < 0) {
    addW('eye_epicanthus_out', -eyeEpicanthusVal * 0.85);
    addW('eye_outer_corner_down', -eyeEpicanthusVal * 0.35);
  }

  // 2. Eyelid Fold / Monolid vs Tapered In-Out vs Parallel Double (单眼皮 / 内双 / 平行大双)
  if (eyeCreaseVal < 0) {
    addW('eye_eyefold_down', -eyeCreaseVal * 0.35);
    addW('eye_eyefold_convex', -eyeCreaseVal * 0.65);
    addW('eye_depth_shallow', -eyeCreaseVal * 0.28);
  } else if (eyeCreaseVal > 0) {
    addW('eye_eyefold_up', eyeCreaseVal * 0.72);
    addW('eye_eyefold_concave', eyeCreaseVal * 0.65);
  }

  // 3. Outer Canthus Slant (丹凤眼/狐狸吊梢眼 vs 小狗无辜下至眼)
  if (eyeTiltVal > 0.08) {
    // Lift lateral (outer) canthus (corner1-up) + lower medial (inner) canthus (corner2-down) + lift outer eyefold (angle-down)
    addW('eye_inner_corner_up', eyeTiltVal * 0.85);
    addW('eye_outer_corner_down', eyeTiltVal * 0.48);
    addW('eye_eyefold_angle_down', eyeTiltVal * 0.62);
  } else if (eyeTiltVal < -0.08) {
    // Lower lateral (outer) canthus (corner1-down) + raise medial (inner) canthus (corner2-up) + puppy outer lower lid
    addW('eye_inner_corner_down', -eyeTiltVal * 0.78);
    addW('eye_outer_corner_up', -eyeTiltVal * 0.38);
    addW('eye_eyefold_angle_up', -eyeTiltVal * 0.45);
  }

  // 4. Vertical Eye Opening (灵动小鹿圆眼 vs 江南柳叶细眼/微醺睡凤眼)
  if (eyeHeightVal > 0.05) {
    addW('eye_height_mid_incr', eyeHeightVal * 0.42);
    addW('eye_height_outer_incr', eyeHeightVal * 0.32);
  } else if (eyeHeightVal < -0.05) {
    addW('eye_height_mid_decr', -eyeHeightVal * 0.45);
    addW('eye_height_outer_decr', -eyeHeightVal * 0.35);
  }

  // 5. Intercanthal Eye Spacing (宽距幼态/鲶鱼系高级脸 vs 窄距浓颜系)
  if (eyeSpacingVal > 0.02) {
    addW('eye_spacing_wide', eyeSpacingVal * 0.55);
  } else if (eyeSpacingVal < -0.02) {
    addW('eye_spacing_narrow', -eyeSpacingVal * 0.55);
  }

  // 6. Aegyo-Sal / Lower Eyelid Fullness (桃花眼饱满卧蚕)
  if (eyeBagVal > 0.20) {
    addW('eye_bag_incr', (eyeBagVal - 0.20) * 0.75);
    addW('eye_bag_height_incr', (eyeBagVal - 0.20) * 0.55);
  }

  // Stage 69c: real artist-sculpted facial detail.
  const lowerLid = fineValue('lowerLidFlatness');
  if (lowerLid > 0) {
    addW('eye_height_mid_decr', lowerLid * 0.68);
    addW('eye_height_outer_incr', lowerLid * 0.22);
    addW('eye_bag_decr', lowerLid * 0.42);
    addW('eye_bag_height_decr', lowerLid * 0.18);
  } else if (lowerLid < 0) {
    addW('eye_height_mid_incr', -lowerLid * 0.55);
    addW('eye_height_outer_decr', -lowerLid * 0.18);
    addW('eye_bag_incr', -lowerLid * 0.22);
  }
  const eyeDepth = fineValue('eyeDepth');
  addW(eyeDepth >= 0 ? 'eye_depth_deep' : 'eye_depth_shallow', Math.abs(eyeDepth) * 0.80);
  // MPFB2 corner1 is lateral and corner2 medial: independent local sculpts,
  // rather than a proxy that only changes a UI number or the entire head scale.
  const outerCanthus = fineValue('outerCanthusLift');
  addW(outerCanthus >= 0 ? 'eye_inner_corner_up' : 'eye_inner_corner_down', Math.abs(outerCanthus) * 0.95);
  const medialCanthus = fineValue('eyeMedialCanthusLift');
  addW(medialCanthus >= 0 ? 'eye_outer_corner_up' : 'eye_outer_corner_down', Math.abs(medialCanthus) * 0.80);
  const upperFold = fineValue('eyeUpperFoldHeight');
  addW(upperFold >= 0 ? 'eye_eyefold_up' : 'eye_eyefold_down', Math.abs(upperFold) * 0.78);
  const outerOpening = fineValue('eyeOuterOpening');
  addW(outerOpening >= 0 ? 'eye_height_outer_incr' : 'eye_height_outer_decr', Math.abs(outerOpening) * 0.84);

  const mouthWidth = fineValue('mouthWidth');
  addW(mouthWidth >= 0 ? 'mouth_scale_horiz_incr' : 'mouth_scale_horiz_decr', Math.abs(mouthWidth) * 0.90);
  const mouthHeight = fineValue('mouthHeight');
  addW(mouthHeight >= 0 ? 'mouth_scale_vert_incr' : 'mouth_scale_vert_decr', Math.abs(mouthHeight) * 0.80);
  const cupidBow = fineValue('cupidBow');
  addW(cupidBow >= 0 ? 'mouth_cupidsbow_incr' : 'mouth_cupidsbow_decr', Math.abs(cupidBow) * 0.82);
  const lowerLip = fineValue('lowerLipCenter');
  addW(lowerLip >= 0 ? 'mouth_lowerlip_middle_down' : 'mouth_lowerlip_middle_up', Math.abs(lowerLip) * 0.76);
  const mouthCorner = fineValue('mouthCornerLift');
  addW(mouthCorner >= 0 ? 'mouth_angles_up' : 'mouth_angles_down', Math.abs(mouthCorner) * 0.88);
  const upperLip = fineValue('upperLipLift');
  // MPFB only supplies an upward sculpt. A signed weight displaces the *same*
  // upper-lip vertices down for negative values, without moving the lower lip.
  addW('mouth_upperlip_middle_up', upperLip * 0.78);
  const chinWidth = fineValue('chinWidth');
  addW(chinWidth >= 0 ? 'chin_width_incr' : 'chin_width_decr', Math.abs(chinWidth) * 0.70);
  const noseTip = fineValue('noseTipAngle');
  addW(noseTip >= 0 ? 'nose_point_up' : 'nose_point_down', Math.abs(noseTip) * 0.68);
  const noseTipWidth = fineValue('noseTipWidth');
  addW(noseTipWidth >= 0 ? 'nose_point_width_incr' : 'nose_point_width_decr', Math.abs(noseTipWidth) * 0.84);

  // More independently weighted MPFB2 vertex targets (not cosmetic UI):
  // balanced to at most ~5 mm at the advanced editor extrema.
  for (const [key, positive, negative, gain] of [
    ['cheekVolume', 'cheek_volume_incr', 'cheek_volume_decr', 0.35],
    ['cheekHeight', 'cheek_trans_up', 'cheek_trans_down', 0.34],
    ['cheekInner', 'cheek_inner_incr', 'cheek_inner_decr', 0.35],
    ['chinProjection', 'chin_prognathism_incr', 'chin_prognathism_decr', 0.39],
    ['nostrilWidth', 'nose_nostrils_width_incr', 'nose_nostrils_width_decr', 0.55],
    ['templeFullness', 'forehead_temple_incr', 'forehead_temple_decr', 0.85],
  ]) {
    const val = fineValue(key);
    addW(val >= 0 ? positive : negative, Math.abs(val) * gain);
  }
  addW('chin_cleft_incr', Math.min(1.30, Math.max(0, Number(m.chinCleft) || 0)) * 0.65);
  addW('mouth_philtrum_volume_incr', fineValue('philtrumVolume') * 0.85);

  // Ensure lightweight per-instance position buffer on HeadSkinMesh, Eyelashes, and Eyes (never clone 42 morphAttributes!)
  if (!skinMesh.userData.hasMpfbClone) {
    skinMesh.geometry = createLightweightGeometryInstance(skinMesh.geometry);
    skinMesh.userData.origSkinPos = new Float32Array(skinMesh.geometry.attributes.position.array);
    skinMesh.userData.hasMpfbClone = true;
  }
  const skinPosAttr = skinMesh.geometry.attributes.position;
  const skinArr = skinPosAttr.array;
  const origSkin = skinMesh.userData.origSkinPos;
  skinArr.set(origSkin);

  let anyActive = false;
  for (const [tKey, w] of Object.entries(weights)) {
    if (Math.abs(w) < 1e-3) continue;
    const flat = MPFB_SPARSE_HEAD_TARGETS[tKey] || FACE_FINE_TARGETS[tKey];
    if (!flat) continue;
    anyActive = true;
    const scale = w * 1e-5;
    for (let i = 0; i < flat.length; i += 4) {
      const vi3 = flat[i] * 3;
      skinArr[vi3] += flat[i + 1] * scale;
      skinArr[vi3 + 1] += flat[i + 2] * scale;
      skinArr[vi3 + 2] += flat[i + 3] * scale;
    }
  }
  // The reusable user brush is applied AFTER MPFB rebuilds the skin from
  // origSkinPos, otherwise the next slider input erases the user's sculpt.
  if (applyStoredFaceSculpt(skinMesh, m, skinArr)) anyActive = true;
  skinPosAttr.needsUpdate = true;

  // Synchronize Eyelashes (250v) and Eyes (rigid horizontal socket shift) with HeadSkinMesh
  rootGroup.traverse((child) => {
    if (!child.isMesh) return;
    if (child.userData?.isEyelashMesh || child.material?.name === 'Eyelash') {
      if (!child.userData.hasMpfbClone) {
        child.geometry = createLightweightGeometryInstance(child.geometry);
        child.userData.origLashPos = new Float32Array(child.geometry.attributes.position.array);
        child.userData.hasMpfbClone = true;
      }
      const lAttr = child.geometry.attributes.position;
      const lArr = lAttr.array;
      const origL = child.userData.origLashPos;
      if (!anyActive) {
        lArr.set(origL);
      } else {
        const count = Math.min(lAttr.count, LASH_TO_SKIN_INDEX.length);
        for (let li = 0; li < count; li++) {
          const si3 = LASH_TO_SKIN_INDEX[li] * 3;
          const li3 = li * 3;
          lArr[li3] = origL[li3] + (skinArr[si3] - origSkin[si3]);
          lArr[li3 + 1] = origL[li3 + 1] + (skinArr[si3 + 1] - origSkin[si3 + 1]);
          lArr[li3 + 2] = origL[li3 + 2] + (skinArr[si3 + 2] - origSkin[si3 + 2]);
        }
      }
      lAttr.needsUpdate = true;
      const strandChild = child.userData.lashStrandMesh;
      const roots = strandChild?.geometry?.userData?.lashGuideRoots;
      const origStrand = strandChild?.geometry?.userData?.origStrandPos;
      if (strandChild && roots && origStrand) {
        const sAttr = strandChild.geometry.attributes.position;
        const sArr = sAttr.array;
        if (!anyActive) {
          sArr.set(origStrand);
        } else {
          for (let vi = 0; vi < roots.length; vi++) {
            const [a, b, w] = roots[vi];
            const a3 = a * 3, b3 = b * 3, vi3 = vi * 3;
            const dx = (lArr[a3] - origL[a3]) * (1 - w) + (lArr[b3] - origL[b3]) * w;
            const dy = (lArr[a3 + 1] - origL[a3 + 1]) * (1 - w) + (lArr[b3 + 1] - origL[b3 + 1]) * w;
            const dz = (lArr[a3 + 2] - origL[a3 + 2]) * (1 - w) + (lArr[b3 + 2] - origL[b3 + 2]) * w;
            sArr[vi3] = origStrand[vi3] + dx;
            sArr[vi3 + 1] = origStrand[vi3 + 1] + dy;
            sArr[vi3 + 2] = origStrand[vi3 + 2] + dz;
          }
        }
        sAttr.needsUpdate = true;
      }
    } else if (child.material?.userData?.eyeUniforms) {
      if (!child.userData.hasMpfbClone) {
        child.geometry = createLightweightGeometryInstance(child.geometry);
        child.userData.origEyePos = new Float32Array(child.geometry.attributes.position.array);
        child.userData.hasMpfbClone = true;
      }
      const eAttr = child.geometry.attributes.position;
      const eArr = eAttr.array;
      const origE = child.userData.origEyePos;
      const dxShift = eyeSpacingVal * 0.00145;
      for (let ei = 0; ei < origE.length; ei += 3) {
        const signX = origE[ei] >= 0 ? 1.0 : -1.0;
        eArr[ei] = origE[ei] + signX * dxShift;
        eArr[ei + 1] = origE[ei + 1];
        eArr[ei + 2] = origE[ei + 2];
      }
      eAttr.needsUpdate = true;
    }
  });
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
  // Normalize against default warm ivory (#ffe8df -> r=1.0, g=0.81, b=0.74 in linear space)
  // so default skinToneHex gives a neutral (1,1,1) multiplier while darker/cooler/warmer picks
  // visibly shift the skin across the full [0.48, 1.24] range!
  const r = Math.min(1.24, Math.max(0.48, 0.36 + c.r * 0.64));
  const g = Math.min(1.24, Math.max(0.48, 0.42 + c.g * 0.71));
  const b = Math.min(1.24, Math.max(0.48, 0.45 + c.b * 0.74));
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
  // Stage 64 · 10 new MakeHuman .mhclo 3D hairstyles
  'daz_hair_o4saken_long',
  'daz_hair_blunt_bob_bangs',
  'daz_hair_inverted_bob_bangs',
  'daz_hair_french_braid_bun',
  'daz_hair_double_braid',
  'daz_hair_unkempt_french_braid',
  'daz_hair_rehman_bun',
  'daz_hair_island_princess',
  'daz_hair_ashley_wave',
  'daz_hair_bow_bun_braids',
  ...REAL_HAIR_CATALOG.map(h => h.id).filter(id => id && id !== 'none'),
]);

export const HAIR_STYLE_PRESET_RECIPES = {
  preset_hime_cut_long: {
    baseStyle: 'hair_long01',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.28,
  },
  preset_jk_twin_ponytail: {
    baseStyle: 'daz_hair_air_bangs_long',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'twin_braids',
    hairWispyFeather: 0.45,
  },
  preset_guofeng_twin_buns: {
    baseStyle: 'daz_hair_twin_buns',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.32,
  },
  preset_kpop_curtain_ponytail: {
    baseStyle: 'hair_ponytail01',
    topCrown: 'fluffy_high_crown',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.42,
  },
  preset_french_lazy_chignon: {
    baseStyle: 'daz_hair_low_chignon',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.42,
  },
  preset_chaebol_sleek_long: {
    baseStyle: 'daz_hair_o4saken_long',
    topCrown: 'fluffy_high_crown',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.35,
  },
  preset_sakura_pink_hime_bob: {
    baseStyle: 'daz_hair_blunt_bob_bangs',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairTipColor: '#a85d74',
    hairOmbreMix: 0.68,
    hairWispyFeather: 0.34,
  },
  preset_wolf_mullet_cool: {
    baseStyle: 'daz_hair_wolf_clavicle',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.44,
  },
  preset_republic_student_braids: {
    baseStyle: 'daz_hair_double_braid',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.38,
  },
  preset_hk_retro_glam_wave: {
    baseStyle: 'daz_hair_ashley_wave',
    topCrown: 'fluffy_high_crown',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.42,
  },
  preset_FirstLove_air_bob: {
    baseStyle: 'daz_hair_inverted_bob_bangs',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.45,
  },
  preset_song_aesthetic_updo: {
    baseStyle: 'daz_hair_bow_bun_braids',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.40,
  },
  preset_ice_queen_silver_wave: {
    baseStyle: 'daz_hair_mermaid_curl',
    topCrown: 'fluffy_high_crown',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairTipColor: '#8c96a6',
    hairOmbreMix: 0.65,
    hairWispyFeather: 0.40,
  },
  preset_gentle_sister_clavicle: {
    baseStyle: 'hair_short04',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairTipColor: '#4a3528',
    hairOmbreMix: 0.62,
    hairWispyFeather: 0.42,
  },
  preset_ballet_core_ribbons: {
    baseStyle: 'daz_hair_ballerina_bun',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.42,
  },
  preset_ocean_blue_hime_long: {
    baseStyle: 'daz_hair_hime',
    topCrown: 'fluffy_high_crown',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairTipColor: '#29527a',
    hairOmbreMix: 0.70,
    hairWispyFeather: 0.32,
  },
  preset_burgundy_siren_wave: {
    baseStyle: 'daz_hair_curtain_wave',
    topCrown: 'fluffy_high_crown',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairTipColor: '#6e1e32',
    hairOmbreMix: 0.68,
    hairWispyFeather: 0.42,
  },
  preset_mori_girl_unkempt_braid: {
    baseStyle: 'daz_hair_unkempt_french_braid',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairTipColor: '#6e4730',
    hairOmbreMix: 0.64,
    hairWispyFeather: 0.42,
  },
  preset_clean_fit_sleek_bun: {
    baseStyle: 'daz_hair_low_chignon',
    topCrown: 'photo_sleek_crown',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.30,
  },
  preset_sweet_milk_tea_halfup: {
    baseStyle: 'daz_hair_halfup_princess',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairTipColor: '#6e4730',
    hairOmbreMix: 0.68,
    hairWispyFeather: 0.38,
  },
  preset_imperial_crown_braid_hime: {
    baseStyle: 'daz_hair_crown_braid',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairWispyFeather: 0.36,
  },
  preset_cyber_hologram_twin: {
    baseStyle: 'daz_hair_twin_braids',
    topCrown: 'fluffy_high_crown',
    frontBangs: 'default',
    sideLocks: 'default',
    backAttachment: 'none',
    hairTipColor: '#8c96a6',
    hairOmbreMix: 0.66,
    hairWispyFeather: 0.40,
  },
};

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
  node.userData.disposed = true; // Cancel pending async accessories / hair loads.
  const geometries = new Set(), materials = new Set(), textures = new Set();
  node.traverse(child => {
    if (!child.isMesh) return;
    if (child.geometry && !child.geometry.userData?.sharedBuiltinGeo) geometries.add(child.geometry);
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

// One bounded material response, shared by initial load and the live slider.
function configureHairSheen(material, value) {
  const n = Number(value);
  const sheen = Number.isFinite(n) ? THREE.MathUtils.clamp(n, 0, 1) : 0.65;
  material.roughness = 0.64 - sheen * 0.26;
  material.specularIntensity = 0.18 + sheen * 0.45;
  material.anisotropy = 0; // Handled by custom Marschner/Kajiya-Kay dual lobe in RE_Direct_ArtistHair
  material.sheen = 0;
  material.sheenRoughness = 0.50;
  material.clearcoat = 0;
  material.envMapIntensity = material.userData?.isMasterStrandHair ? 0.10 : 0.22;
  if (material.userData?.strandUniforms) {
    const shineScale = 0.55 + sheen * 1.05;
    material.userData.strandUniforms.uGainR.value = MASTER_HAIR_CONFIG.gainR * shineScale;
    material.userData.strandUniforms.uGainTRT.value = MASTER_HAIR_CONFIG.gainTRT * shineScale;
  }
}

export function updateHairSheen(node, value) {
  if (!node) return;
  const n = Number(value);
  const sheen = Number.isFinite(n) ? THREE.MathUtils.clamp(n, 0, 1) : 0.65;
  node.userData.hairSheen = sheen;
  node.getObjectByName('HairGroup')?.traverse(child => {
    if (!child.isMesh || child.name === 'ScalpRootFeatherCap') return;
    for (const material of Array.isArray(child.material) ? child.material : [child.material]) {
      if (material?.userData?.builtInHair) configureHairSheen(material, sheen);
    }
  });
}

function computeTrueHairDisplayColor(hairColorHex = '#121216') {
  const normalizedHex = String(hairColorHex || '#121216').toLowerCase();
  const legacyDarkSet = new Set(['#191518', '#1a151c', '#181418', '#22171b', '#261a16', '#171417', '#121216', '#111216', '#1b181d', '#1b1b1e', '#141318', '#0f1015', '#121118']);
  if (legacyDarkSet.has(normalizedHex)) {
    return new THREE.Color('#28272b');
  }
  const baseColor = new THREE.Color(normalizedHex);
  const lum = 0.299 * baseColor.r + 0.587 * baseColor.g + 0.114 * baseColor.b;
  if (lum < 0.032) {
    const scale = 0.032 / Math.max(lum, 0.004);
    baseColor.multiplyScalar(Math.min(scale, 2.4));
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
 * Multi-scale artist hair-card strand shading + feathered air-bang coverage.
 */
function injectArtistHairColor(material, hairShaderParams = {}) {
  const uniforms = {
    uHairWispyFeather: { value: Number(hairShaderParams.hairWispyFeather ?? 0.55) },
    uHairUseCoverage: { value: 1 },
    uHairOmbreMix: { value: Number(hairShaderParams.hairOmbreMix ?? 0) },
    uHairTipColor: { value: new THREE.Color(hairShaderParams.hairTipColor || '#4a3528') },
    uHairHighlightColor: { value: new THREE.Color('#9e6b52') },
    uHairHighlightStrength: { value: 0 },
    uHairFlowHoriz: { value: hairShaderParams.flowHorizontal ? 1.0 : 0.0 },
  };
  material.userData.hairShaderUniforms = uniforms;
  material.customProgramCacheKey = () => 'artist-hair-azimuth-coverage-v69f2';
  material.onBeforeRender = renderer => {
    const rt = renderer.getRenderTarget();
    uniforms.uHairUseCoverage.value = rt
      ? (rt.samples > 0 ? 1 : 0)
      : (renderer.getContext().getContextAttributes().antialias ? 1 : 0);
  };
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = 'varying vec3 vHairLocalPos;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>',
      '#include <begin_vertex>\nvHairLocalPos = position;');
    shader.fragmentShader = `
      varying vec3 vHairLocalPos;
      uniform float uHairWispyFeather;
      uniform float uHairUseCoverage;
      uniform float uHairOmbreMix;
      uniform vec3 uHairTipColor;
      uniform vec3 uHairHighlightColor;
      uniform float uHairHighlightStrength;
      uniform float uHairFlowHoriz;
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      #ifdef USE_MAP
        vec4 hairTexel = texture2D(map, vMapUv);
        float rawLuma = sqrt(clamp(dot(hairTexel.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0));
        // Compress dark valleys so no texture region ever turns into a black blotch ("减少黑区")
        float atlasLuma = clamp((rawLuma - 0.32) / 0.58, 0.0, 1.0);

        // 3-octave sub-pixel individual hair fiber field ("消除片状感的精细发丝纹理")
        float uCoord = uHairFlowHoriz > 0.5 ? vMapUv.y : vMapUv.x;
        float vCoord = uHairFlowHoriz > 0.5 ? vMapUv.x : vMapUv.y;
        float waveShift = 0.0020 * sin(vCoord * 20.0 + uCoord * 28.0);
        float s0 = 0.5 + 0.5 * sin(vHairLocalPos.x * 380.0 + vHairLocalPos.z * 190.0);
        float s1 = 0.5 + 0.5 * sin((uCoord + waveShift) * 180.0 * 6.2831853 + 0.3);
        float s2 = 0.5 + 0.5 * sin((uCoord - waveShift * 0.6) * 420.0 * 6.2831853 + 1.1);
        float s3 = 0.5 + 0.5 * sin((uCoord + waveShift * 0.3) * 780.0 * 6.2831853 + 2.4);
        float microStrand = clamp(0.22 * s1 + 0.44 * pow(s2, 0.80) + 0.34 * pow(s3, 0.75), 0.0, 1.0);

        float lockValue = clamp(mix(atlasLuma, microStrand, 0.52), 0.0, 1.0);
        float tips = smoothstep(0.12, 0.88, clamp((0.038 - vHairLocalPos.y) / 0.095, 0.0, 1.0));
        vec3 tint = mix(diffuse, uHairTipColor, tips * uHairOmbreMix);
        tint = mix(tint, uHairHighlightColor, smoothstep(0.55, 0.9, lockValue) * uHairHighlightStrength);

        // High-contrast fiber-to-fiber separation with lifted shadow floor (zero black slabs!)
        float crownLift = smoothstep(-0.04, 0.11, vHairLocalPos.y);
        float fiberCrest = pow(lockValue, 2.1) * (0.45 + 0.55 * s0);
        vec3 fiberSheen = (tint * 0.75 + vec3(0.020, 0.018, 0.022)) * fiberCrest;
        diffuseColor.rgb = (tint * mix(0.52, 1.62, pow(lockValue, 1.15)) + fiberSheen) * (0.88 + 0.16 * crownLift);

        // Clean macroscopic V-notch lock tips at the very bottom 6mm of forehead bangs ONLY (y = 0.025..0.032)
        // Keeps each hair lock 100% opaque (never a grey translucent band!) while breaking up straight horizontal bottom edges
        float bangBottomEdge = smoothstep(0.052, 0.068, vHairLocalPos.z)
                             * clamp((0.032 - vHairLocalPos.y) / 0.008, 0.0, 1.0)
                             * (1.0 - smoothstep(0.042, 0.056, abs(vHairLocalPos.x)));
        float lockWave = 0.58 * (0.5 + 0.5 * sin(vHairLocalPos.x * 580.0 + sin(vHairLocalPos.y * 80.0) * 0.35))
                       + 0.42 * (0.5 + 0.5 * sin(vHairLocalPos.x * 1320.0 + 1.2));
        float tipKeep = step(bangBottomEdge * 0.72, lockWave);
        diffuseColor.a = hairTexel.a * mix(1.0, tipKeep, step(0.01, bangBottomEdge));
      #endif
    `);
    shader.fragmentShader = shader.fragmentShader.replace('#include <alphatest_fragment>', `
      #ifdef USE_ALPHATEST
        if (uHairUseCoverage > 0.5) {
          if (diffuseColor.a < 0.14) discard;
        } else {
          if (diffuseColor.a < 0.24) discard;
          diffuseColor.a = 1.0;
        }
      #endif
    `);
    injectArtistHairLighting(shader);
  };
}

function buildScalpRootShadowCap(modelContainer, displayColor) {
  let headMesh = null;
  let headGeo = null;
  modelContainer.traverse((child) => {
    if (!headGeo && child.isMesh && child.geometry?.attributes?.position && (child.name === 'HeadSkinMesh' || child.material?.name === 'Skin')) {
      headMesh = child;
      headGeo = child.geometry;
    }
  });
  if (!headGeo || !headGeo.index) return null;

  const pos = headGeo.attributes.position;
  const idx = headGeo.index.array;
  const capIndices = [];
  const capGeo = new THREE.BufferGeometry();
  const newPos = new Float32Array(pos.array.length);
  const colors = new Float32Array(pos.count * 4);
  const hcX = 0.0, hcY = 0.02, hcZ = -0.01;

  const ss = (a, b, v) => {
    const t = Math.max(0.0, Math.min(1.0, (v - a) / (b - a)));
    return t * t * (3.0 - 2.0 * t);
  };

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const dx = x - hcX, dy = y - hcY, dz = z - hcZ;
    const len = Math.hypot(dx, dy, dz) || 1.0;
    // Offset 1.2mm outside the skull and share GPU morph targets so pink skin never pokes through the back/side
    newPos[i * 3] = x + (dx / len) * 0.0012;
    newPos[i * 3 + 1] = y + (dy / len) * 0.0012;
    newPos[i * 3 + 2] = z + (dz / len) * 0.0012;

    const fadeY = z < -0.016 ? ss(-0.037, -0.016, y) : ss(0.012, 0.034, y);
    // The sideburn hairline is LOWER than the central forehead hairline. Do
    // not cut an entire triangle at its centroid: that makes zigzag bald
    // polygons above the ears when the artist hair cards are sparse.
    const sideHairline = ss(0.030, 0.055, Math.abs(x));
    const frontStartY = 0.080 - sideHairline * 0.047;
    const foreheadClear = z > 0.008 ? ss(frontStartY, frontStartY + 0.019, y) : 1.0;
    const templeClear = z > 0.002 ? ss(0.024, 0.045, y) : 1.0;
    const earClear = (Math.abs(x) > 0.048 && z > -0.028 && z < 0.028) ? ss(0.023, 0.044, y) : 1.0;
    const strandMod = 0.92 + 0.08 * Math.sin(x * 480.0 + z * 320.0);
    const alpha = fadeY * foreheadClear * templeClear * earClear * 0.97;

    colors[i * 4] = strandMod;
    colors[i * 4 + 1] = strandMod;
    colors[i * 4 + 2] = strandMod;
    colors[i * 4 + 3] = alpha;
  }
  // Select triangles whose feathered vertex coverage is nonzero; the vertex
  // alpha, not a hard triangle cutoff, defines the anatomical hairline.
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i], b = idx[i + 1], c = idx[i + 2];
    if (Math.max(colors[a * 4 + 3], colors[b * 4 + 3], colors[c * 4 + 3]) > 0.012) {
      capIndices.push(a, b, c);
    }
  }
  if (!capIndices.length) return null;
  capGeo.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
  capGeo.setAttribute('color', new THREE.BufferAttribute(colors, 4));
  if (headGeo.attributes.normal) {
    capGeo.setAttribute('normal', headGeo.attributes.normal);
  }
  if (headGeo.morphAttributes?.position) {
    capGeo.morphAttributes.position = headGeo.morphAttributes.position;
  }
  if (headGeo.morphAttributes?.normal) {
    capGeo.morphAttributes.normal = headGeo.morphAttributes.normal;
  }
  // GLTF head morph targets store *relative deltas*. A newly constructed
  // BufferGeometry defaults to absolute targets; without this flag the scalp
  // cap is pulled inside the skull whenever a face preset has morph weights,
  // exposing skin through a large apparent bald hole on the crown/temple.
  capGeo.morphTargetsRelative = headGeo.morphTargetsRelative;
  capGeo.setIndex(capIndices);

  const capColor = new THREE.Color(
    Math.max(0.032, displayColor.r * 1.15),
    Math.max(0.024, displayColor.g * 1.12),
    Math.max(0.020, displayColor.b * 1.10)
  );
  const capMat = new THREE.MeshStandardMaterial({
    color: capColor,
    vertexColors: true,
    roughness: 0.88,
    metalness: 0.0,
    transparent: true,
    opacity: 1.0,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  capMat.userData.builtInHair = true;
  capMat.userData.isScalpCap = true;
  // The close-fitting, morph-correct scalp undercoat should read as pigmented
  // hair roots between actual strands, not a featureless bald plastic patch.
  // Frequency derivatives suppress shimmer when the head becomes a small pet.
  capMat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRootLocal;')
      .replace('#include <project_vertex>', 'vRootLocal = transformed;\n#include <project_vertex>');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vRootLocal;')
      .replace('#include <color_fragment>', `#include <color_fragment>
        float hairAngle = atan(vRootLocal.z + 0.010, vRootLocal.x);
        float lockFlow = hairAngle * 126.0 + vRootLocal.y * 56.0;
        float lock = 0.5 + 0.5 * sin(lockFlow + 0.32 * sin(vRootLocal.y * 130.0));
        float strandPhase = hairAngle * 468.0 + vRootLocal.y * 93.0;
        float fiberAA = 1.0 - smoothstep(1.0, 3.2, fwidth(strandPhase));
        float fiber = mix(0.5, 0.5 + 0.5 * sin(strandPhase), fiberAA);
        diffuseColor.rgb *= 0.67 + 0.28 * lock + 0.20 * fiber;`);
  };
  capMat.customProgramCacheKey = () => 'morphed-scalp-root-fibers-v1';
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.name = 'ScalpRootFeatherCap';
  if (headMesh?.morphTargetInfluences) {
    capMesh.morphTargetInfluences = headMesh.morphTargetInfluences;
  }
  capMesh.renderOrder = 0;
  return capMesh;
}

// A compact 3D root layer follows the *morphed scalp cap*, not a flat dark
// polygon. It fills the visible gaps between the authored cards on the crown
// and above the ears even when adaptive software WebGL reduces long strands.
function buildScalpRootStrands(capMesh, displayColor, software = false, lod = 'studio') {
  const geo = capMesh?.geometry;
  if (!geo?.index || !geo.attributes?.position || !geo.attributes?.color) return null;
  const pos = geo.attributes.position;
  const cols = geo.attributes.color;
  const idx = geo.index;
  const candidates = [];
  let total = 0;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  const ab = new THREE.Vector3(), ac = new THREE.Vector3();
  for (let j = 0; j < idx.count; j += 3) {
    const ia = idx.getX(j), ib = idx.getX(j + 1), ic = idx.getX(j + 2);
    const alpha = (cols.getW(ia) + cols.getW(ib) + cols.getW(ic)) / 3;
    if (alpha < 0.48) continue;
    a.fromBufferAttribute(pos, ia); b.fromBufferAttribute(pos, ib); c.fromBufferAttribute(pos, ic);
    const area = ab.subVectors(b, a).cross(ac.subVectors(c, a)).length() * 0.5;
    if (area < 1e-9) continue;
    total += area * alpha;
    candidates.push({ ia, ib, ic, cumulative: total });
  }
  if (!total) return null;
  const target = software ? (lod === 'desktop' ? 370 : 1550) : 2250;
  const positions = [], normals = [], fibers = [], indices = [];
  const crown = new THREE.Vector3(0, 0.136, -0.018);
  const skull = new THREE.Vector3(0, 0.020, -0.010);
  const p = new THREE.Vector3(), n = new THREE.Vector3(), tangent = new THREE.Vector3(), lateral = new THREE.Vector3();
  let seed = 0x517a1e;
  const rnd = () => { seed = (Math.imul(1664525, seed) + 1013904223) >>> 0; return seed / 4294967296; };
  for (let strand = 0; strand < target; strand++) {
    const where = rnd() * total;
    let lo = 0, hi = candidates.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (candidates[mid].cumulative < where) lo = mid + 1; else hi = mid; }
    const t = candidates[lo];
    let u = rnd(), v = rnd();
    if (u + v > 1) { u = 1 - u; v = 1 - v; }
    const w = 1 - u - v;
    const alpha = cols.getW(t.ia) * w + cols.getW(t.ib) * u + cols.getW(t.ic) * v;
    if (alpha < 0.50) continue;
    p.set(
      pos.getX(t.ia) * w + pos.getX(t.ib) * u + pos.getX(t.ic) * v,
      pos.getY(t.ia) * w + pos.getY(t.ib) * u + pos.getY(t.ic) * v,
      pos.getZ(t.ia) * w + pos.getZ(t.ib) * u + pos.getZ(t.ic) * v,
    );
    n.subVectors(p, skull).normalize();
    tangent.subVectors(p, crown);
    tangent.y -= 0.005;
    tangent.z -= 0.012;
    tangent.addScaledVector(n, -tangent.dot(n)).normalize();
    if (tangent.lengthSq() < 0.2) continue;
    lateral.crossVectors(tangent, n).normalize();
    const len = 0.012 + rnd() * 0.014;
    const width = 0.00017 + rnd() * 0.00016;
    const brightness = 0.67 + rnd() * 0.61;
    const wave = rnd() * Math.PI * 2;
    const base = positions.length / 3;
    const segments = 6;
    for (let s = 0; s <= segments; s++) {
      const f = s / segments;
      const k = len * f;
      const curl = (0.00022 + k * 0.032) * Math.sin(wave + f * 3.2);
      const lift = 0.0015 + 0.0019 * f * f;
      const cx = p.x + tangent.x * k + n.x * lift + lateral.x * curl;
      const cy = p.y + tangent.y * k + n.y * lift + lateral.y * curl;
      const cz = p.z + tangent.z * k + n.z * lift + lateral.z * curl;
      const fade = (1 - 0.47 * f * f) * brightness;
      for (const sign of [-1, 1]) {
        const half = width * (1.0 - 0.73 * f);
        positions.push(cx + lateral.x * half * sign, cy + lateral.y * half * sign, cz + lateral.z * half * sign);
        normals.push(n.x, n.y, n.z);
        fibers.push(fade, fade, fade);
      }
      if (s < segments) {
        const vi = base + s * 2;
        indices.push(vi, vi + 1, vi + 2, vi + 1, vi + 3, vi + 2);
      }
    }
  }
  if (!positions.length) return null;
  const fiberGeo = new THREE.BufferGeometry();
  fiberGeo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  fiberGeo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  fiberGeo.setAttribute('color', new THREE.Float32BufferAttribute(fibers, 3));
  fiberGeo.setIndex(indices);
  fiberGeo.computeBoundingSphere();
  const fiberMat = new THREE.MeshStandardMaterial({
    color: displayColor.clone().multiplyScalar(1.35), vertexColors: true,
    roughness: 0.58, metalness: 0, side: THREE.DoubleSide,
  });
  fiberMat.userData.builtInHair = true;
  const fibersMesh = new THREE.Mesh(fiberGeo, fiberMat);
  fibersMesh.name = 'ScalpRootStrands';
  fibersMesh.castShadow = false;
  fibersMesh.receiveShadow = true;
  fibersMesh.userData.strandCount = positions.length / 42; // two vertices × seven samples × xyz
  return fibersMesh;
}

const MODULAR_BANGS_DONORS = {
  wispy_air:    { style: 'hair_user_photo',         filter: (x, y, z) => z > 0.044 && y > 0.012 && y < 0.092 && Math.abs(x) < 0.062 },
  curtain_part: { style: 'daz_hair_curtain_wave',   filter: (x, y, z) => z > 0.036 && y > 0.002 && y < 0.095 && Math.abs(x) < 0.068 },
  hime_blunt:   { style: 'daz_hair_hime',           filter: (x, y, z) => z > 0.048 && y > 0.015 && y < 0.092 && Math.abs(x) < 0.056 },
  side_swept:   { style: 'daz_hair_side_long',      filter: (x, y, z) => z > 0.038 && y > 0.008 && y < 0.095 && Math.abs(x) < 0.066 },
  french_light: { style: 'daz_hair_blunt_bob_bangs',filter: (x, y, z) => z > 0.044 && y > 0.012 && y < 0.092 && Math.abs(x) < 0.058 },
  choppy_micro: { style: 'hair_bob02',              filter: (x, y, z) => z > 0.046 && y > 0.024 && y < 0.092 && Math.abs(x) < 0.056 },
};

const MODULAR_SIDELOCKS_DONORS = {
  photo_wisp:       { style: 'hair_user_photo',           filter: (x, y, z) => x > 0.044 && z > 0.002 && z < 0.068 && y > -0.048 && y < 0.045 },
  both_wisps:       { style: 'hair_bob01',                filter: (x, y, z) => Math.abs(x) > 0.045 && z > 0.002 && z < 0.068 && y > -0.052 && y < 0.045 },
  hime_cheek:       { style: 'daz_hair_hime',             filter: (x, y, z) => Math.abs(x) > 0.044 && z > 0.005 && z < 0.066 && y > -0.062 && y < 0.042 },
  wavy_tendril:     { style: 'daz_hair_french_lazy_roll', filter: (x, y, z) => Math.abs(x) > 0.045 && z > -0.005 && z < 0.068 && y > -0.058 && y < 0.045 },
  long_chest_locks: { style: 'daz_hair_o4saken_long',     filter: (x, y, z) => Math.abs(x) > 0.042 && z > -0.005 && z < 0.068 && y > -0.105 && y < 0.045 },
};

const MODULAR_BACK_DONORS = {
  high_ponytail:       { style: 'daz_hair_sport_ponytail', filter: (x, y, z) => z < -0.032 || (z < -0.012 && y > 0.055) },
  low_ponytail:        { style: 'hair_user_photo',         filter: (x, y, z) => z < -0.038 && y < 0.062 },
  photo_tied_ponytail: { style: 'hair_user_photo',         filter: (x, y, z) => z < -0.038 && y < 0.062 },
  low_chignon:         { style: 'daz_hair_low_chignon',    filter: (x, y, z) => z < -0.035 && y < 0.048 },
  twin_buns:           { style: 'daz_hair_twin_buns',      filter: (x, y, z) => y > 0.068 && Math.abs(x) > 0.042 && z < 0.035 },
  twin_braids:         { style: 'daz_hair_twin_braids',    filter: (x, y, z) => y < 0.018 && Math.abs(x) > 0.048 && z < 0.028 },
  sleek_long_back:     { style: 'daz_hair_o4saken_long',   filter: (x, y, z) => z < -0.018 && y < 0.055 },
  wavy_long_back:      { style: 'daz_hair_ashley_wave',    filter: (x, y, z) => z < -0.018 && y < 0.055 },
};

function filterGeometryByCentroid(geometry, predicate, invert = false) {
  if (!geometry?.attributes?.position) return null;
  const pos = geometry.attributes.position;
  const idx = geometry.index ? geometry.index.array : null;
  const kept = [];
  if (idx) {
    for (let i = 0; i < idx.length; i += 3) {
      const a = idx[i], b = idx[i + 1], c = idx[i + 2];
      const xm = (pos.getX(a) + pos.getX(b) + pos.getX(c)) / 3.0;
      const ym = (pos.getY(a) + pos.getY(b) + pos.getY(c)) / 3.0;
      const zm = (pos.getZ(a) + pos.getZ(b) + pos.getZ(c)) / 3.0;
      const match = Boolean(predicate(xm, ym, zm));
      if (invert ? !match : match) {
        kept.push(a, b, c);
      }
    }
    if (kept.length === 0) return null;
    const cloned = geometry.clone();
    cloned.setIndex(kept);
    return cloned;
  }
  return geometry.clone();
}

async function loadModularDonorMeshes(donorSpec) {
  if (!donorSpec) return [];
  try {
    const buf = await fetchGlbArrayBuffer(`/models/${donorSpec.style}.glb`);
    const gltf = await parseGlbBuffer(buf);
    const meshes = [];
    gltf.scene.traverse((child) => {
      if (!child.isMesh || !child.geometry?.attributes?.position) return;
      const refined = refineArtistHairCards(child.geometry);
      const subGeo = filterGeometryByCentroid(refined, donorSpec.filter, false);
      if (refined !== child.geometry) refined.dispose();
      if (subGeo) {
        const m = new THREE.Mesh(subGeo, child.material);
        m.name = `Modular_${donorSpec.style}`;
        m.userData.isModularPart = true;
        m.userData.hairSourceStyle = donorSpec.style;
        meshes.push(m);
      }
    });
    return meshes;
  } catch (e) {
    console.warn('Modular hair donor load skipped:', donorSpec.style, e);
    return [];
  }
}

export async function attachRealHairModel(rootGroup, config = {}) {
  const startedAt = performance.now();
  const marks = {};
  const mark = stage => { marks[stage] = Math.round(performance.now() - startedAt); };
  const modelContainer = rootGroup.getObjectByName('RealDazHeadContainer');
  if (!modelContainer) return null;

  rootGroup.userData.neckClearance = Number(config.neckClearance ?? rootGroup.userData.neckClearance ?? 0.45);
  const rawStyle = config.hairStyle || config.materials?.hairStyle || 'hair_user_photo';
  const selectedStyle = resolveRealHairStyle(rawStyle);
  const presetRecipe = HAIR_STYLE_PRESET_RECIPES[selectedStyle] || null;
  const resolvedStyle = presetRecipe ? presetRecipe.baseStyle : selectedStyle;

  const rawTopCrown = config.topCrown || config.topCrownStyle || config.morphs?.topCrown || config.morphs?.topCrownStyle || rootGroup.userData.topCrownStyle || 'default';
  const rawFrontBangs = config.frontBangs || config.frontBangsStyle || config.morphs?.frontBangs || config.morphs?.frontBangsStyle || rootGroup.userData.frontBangsStyle || 'default';
  const rawSideLocks = config.sideLocks || config.sideLocksStyle || config.morphs?.sideLocks || config.morphs?.sideLocksStyle || rootGroup.userData.sideLocksStyle || 'default';
  const rawBackAttachment = config.backAttachment || config.backAttachmentStyle || config.morphs?.backAttachment || config.morphs?.backAttachmentStyle || rootGroup.userData.backAttachmentStyle || 'none';

  const topCrownStyle = (rawTopCrown === 'default' && presetRecipe?.topCrown) ? presetRecipe.topCrown : rawTopCrown;
  const frontBangsStyle = (rawFrontBangs === 'default' && presetRecipe?.frontBangs) ? presetRecipe.frontBangs : rawFrontBangs;
  const sideLocksStyle = (rawSideLocks === 'default' && presetRecipe?.sideLocks) ? presetRecipe.sideLocks : rawSideLocks;
  const backAttachmentStyle = (rawBackAttachment === 'none' && presetRecipe?.backAttachment) ? presetRecipe.backAttachment : rawBackAttachment;

  const hairTipColor = config.hairTipColor || config.morphs?.hairTipColor || presetRecipe?.hairTipColor || rootGroup.userData.hairTipColor || '#4a3528';
  const hairOmbreMix = Number(config.hairOmbreMix ?? config.morphs?.hairOmbreMix ?? presetRecipe?.hairOmbreMix ?? rootGroup.userData.hairOmbreMix ?? 0.0);
  const hairWispyFeather = Number(
    config.hairWispyFeather ?? config.morphs?.hairWispyFeather ?? presetRecipe?.hairWispyFeather ?? rootGroup.userData.hairWispyFeather ??
    (frontBangsStyle === 'wispy_air' ? 0.62 : 0.42)
  );
  const hairRenderMode = config.hairRenderMode || config.morphs?.hairRenderMode || rootGroup.userData.hairRenderMode || MASTER_HAIR_CONFIG.mode || 'card';
  const strandDensity = config.strandDensity || config.morphs?.strandDensity || rootGroup.userData.strandDensity || MASTER_HAIR_CONFIG.density || 'mid';
  const groomSoftware = Boolean(config.groomSoftware ?? rootGroup.userData.groomSoftware);
  const groomLod = config.groomLod || rootGroup.userData.groomLod || 'studio';
  rootGroup.userData.groomSoftware = groomSoftware;
  rootGroup.userData.groomLod = groomLod;

  rootGroup.userData.topCrownStyle = topCrownStyle;
  rootGroup.userData.frontBangsStyle = frontBangsStyle;
  rootGroup.userData.sideLocksStyle = sideLocksStyle;
  rootGroup.userData.backAttachmentStyle = backAttachmentStyle;
  rootGroup.userData.hairTipColor = hairTipColor;
  rootGroup.userData.hairOmbreMix = hairOmbreMix;
  rootGroup.userData.hairWispyFeather = hairWispyFeather;
  rootGroup.userData.hairRenderMode = hairRenderMode;
  rootGroup.userData.strandDensity = strandDensity;

  const request = (rootGroup.userData.hairRequestSerial || 0) + 1;
  rootGroup.userData.hairRequestSerial = request;
  delete rootGroup.userData.accessoryHairBaseY;
  delete rootGroup.userData.accessoryHairTopY;
  delete rootGroup.userData.accessoryBareHead;
  const oldHair = modelContainer.getObjectByName('HairGroup');

  if (selectedStyle === 'none' && !config.customHairUrl) {
    disposeHeadNode(oldHair);
    delete rootGroup.userData.groomStats;
    rootGroup.userData.currentHairStyle = 'none';
    syncFaceAccessories(rootGroup, rootGroup.userData.currentMorphs);
    delete rootGroup.userData.hairStats;
    delete rootGroup.userData.hairLoadError;
    return null;
  }

  delete rootGroup.userData.groomStats;
  rootGroup.userData.customHairUrl = config.customHairUrl || null;
  rootGroup.userData.customHairType = config.customHairType || null;
  const hairUrl = config.customHairUrl || `/models/${resolvedStyle}.glb`;
  const isCustomObj = Boolean(config.customHairUrl && (config.customHairType === 'obj' || String(config.customHairUrl).toLowerCase().endsWith('.obj')));
  const useStrandMode = Boolean(!config.customHairUrl && hairRenderMode === 'strand');

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

    mark('readAndParse');
    // The photo-style mesh already has overlapping authored cards; Loop subdivision
    // rounds their open boundaries into holes and creates faceted crown overlaps.
    if (!config.customHairUrl && !useStrandMode && resolvedStyle !== 'hair_user_photo') loadedScene.traverse(child => {
      if (!child.isMesh) return;
      const original = child.geometry;
      child.geometry = refineArtistHairCards(original);
      if (child.geometry !== original) original.dispose();
    });

    // Stage 43 · 4-Zone Surgical Modular Hair Assembly (Crown / Front Bangs / Side Locks / Back Attachment)
    // NOTE: Never delete triangles from front forehead or side locks via filterGeometryByCentroid — triangle deletion creates sawtooth holes!
    // Instead, 'forehead_bare' and 'tucked_ear' are smoothly parted/tucked by continuous vertex weights in applyArtistHairFineTuning.
    const stripBackDrape = backAttachmentStyle !== 'none' && (backAttachmentStyle === 'cropped_nape' || (MODULAR_BACK_DONORS[backAttachmentStyle] && MODULAR_BACK_DONORS[backAttachmentStyle].style !== resolvedStyle));

    const bangsDonor = (frontBangsStyle !== 'default' && frontBangsStyle !== 'forehead_bare' && MODULAR_BANGS_DONORS[frontBangsStyle]?.style !== resolvedStyle)
      ? MODULAR_BANGS_DONORS[frontBangsStyle]
      : null;
    const sideDonor = (sideLocksStyle !== 'default' && sideLocksStyle !== 'tucked_ear' && MODULAR_SIDELOCKS_DONORS[sideLocksStyle]?.style !== resolvedStyle)
      ? MODULAR_SIDELOCKS_DONORS[sideLocksStyle]
      : null;
    const backDonor = (backAttachmentStyle !== 'none' && backAttachmentStyle !== 'cropped_nape' && MODULAR_BACK_DONORS[backAttachmentStyle]?.style !== resolvedStyle)
      ? MODULAR_BACK_DONORS[backAttachmentStyle]
      : null;

    const [bangsMeshes, sideMeshes, backMeshes] = await Promise.all([
      loadModularDonorMeshes(bangsDonor),
      loadModularDonorMeshes(sideDonor),
      loadModularDonorMeshes(backDonor),
    ]);

    if (stripBackDrape) {
      loadedScene.traverse((child) => {
        if (!child.isMesh || !child.geometry?.attributes?.position) return;
        let geo = child.geometry;
        if (stripBackDrape && (backAttachmentStyle === 'cropped_nape' || backMeshes.length)) {
          const trimmed = filterGeometryByCentroid(
            geo,
            (x, y, z) => z < -0.018 && y < 0.025,
            true
          );
          if (trimmed) geo = trimmed;
        }
        child.geometry = geo;
      });
    }

    for (const m of [...bangsMeshes, ...sideMeshes, ...backMeshes]) {
      loadedScene.add(m);
    }

    if (rootGroup.userData.hairRequestSerial !== request) {
      disposeHeadNode(loadedScene);
      return null;
    }

    mark('modularParts');
    const hairGroup = new THREE.Group();
    hairGroup.name = 'HairGroup';

    const hairColorHex = config.hairColor || config.materials?.hairColorHex || rootGroup.userData.hairColor || '#121216';
    rootGroup.userData.hairColor = hairColorHex;
    const displayColor = computeTrueHairDisplayColor(hairColorHex);
    const sheenIntensity = Number(config.hairSheen ?? rootGroup.userData.hairSheen ?? 0.45);
    rootGroup.userData.hairSheen = sheenIntensity;
    const scalpCap = config.customHairUrl ? null : buildScalpRootShadowCap(modelContainer, displayColor);
    if (scalpCap) {
      hairGroup.add(scalpCap);
      if (useStrandMode) {
        const roots = buildScalpRootStrands(scalpCap, displayColor, groomSoftware, groomLod);
        if (roots) hairGroup.add(roots);
      }
    }

    mark('scalpCap');
    const hairShaderParams = {
      hairWispyFeather,
      hairOmbreMix,
      hairTipColor,
    };

    let totalVerts = 0;
    let totalTris = 0;
    let strandCount = 0;
    let guideCount = 0;
    const customAsset = Boolean(config.customHairUrl);
    const strandRgb = hexToMasterStrandRgb(hairColorHex);
    // Keep Stage69h's geometry-generation revision in the cache key while
    // independently caching software/GPU LODs from the Stage70 pipeline.
    const strandRuntimeLod = groomSoftware
      ? (groomLod === 'desktop' ? 'software-desktop' : 'software-studio') : 'gpu';
    const strandCacheKey = `v8|${resolvedStyle}|${frontBangsStyle}|${sideLocksStyle}|${backAttachmentStyle}|${strandDensity}|${strandRuntimeLod}`;
    let strandRes = useStrandMode ? masterStrandGeometryCache.get(strandCacheKey) : null;
    const headSkinMesh = modelContainer.getObjectByName('HeadSkinMesh');
    const headSoup = (useStrandMode && !strandRes && headSkinMesh) ? morphedHeadSoup(headSkinMesh, true) : null;
    const strandEntries = [];
    let hairMeshIdx = 0;

    loadedScene.traverse(child => {
      if (!child.isMesh) return;
      const g = child.geometry;
      const curMeshIdx = hairMeshIdx++;
      if (g?.attributes?.position) {
        totalVerts += g.attributes.position.count;
        totalTris += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      }
      child.updateMatrix();
      if (headSkinMesh && !customAsset && !useStrandMode) {
        fitArtistHairOutsideScalp(g, headSkinMesh);
      }
      if (useStrandMode && g?.attributes?.position && g?.attributes?.uv) {
        if (!g.attributes.aScalpD) {
          const scalpKey = `v8|${resolvedStyle}|${frontBangsStyle}|${sideLocksStyle}|${backAttachmentStyle}|${curMeshIdx}|${g.attributes.position.count}`;
          let cachedScalpAttr = masterStrandGeometryCache.get(`scalp:${scalpKey}`);
          if (!cachedScalpAttr && (headSoup || headSkinMesh)) {
            const soup = headSoup || morphedHeadSoup(headSkinMesh, true);
            scalpDistanceAttribute(g, child.matrix, soup);
            cachedScalpAttr = g.attributes.aScalpD;
            masterStrandGeometryCache.set(`scalp:${scalpKey}`, cachedScalpAttr);
          } else if (cachedScalpAttr) {
            g.setAttribute('aScalpD', cachedScalpAttr);
          }
        }
        if (!strandRes) {
          const origMat = Array.isArray(child.material) ? child.material[0] : child.material;
          strandEntries.push({
            geom: g,
            matrix: child.matrix.clone(),
            alphaAt: alphaSamplerFromTexture(origMat?.map),
          });
        }
      }
      if (!customAsset) updateArtistHairFlow(g, (child.userData.hairSourceStyle || resolvedStyle) === 'daz_hair_asym_short');
      const configureMaterial = original => {
        if (customAsset && original) {
          const preserved = original.clone();
          preserved.userData = { ...preserved.userData, importedHair: true };
          return preserved;
        }
        const map = original?.map || null;
        if (map) {
          map.colorSpace = THREE.SRGBColorSpace;
          map.anisotropy = 8;
          map.generateMipmaps = true;
          map.minFilter = THREE.LinearMipmapLinearFilter;
          map.magFilter = THREE.LinearFilter;
          map.needsUpdate = true;
        }
        if (useStrandMode) {
          const hMats = buildHairMaterials({ map });
          const coreMat = hMats.core;
          coreMat.userData.builtInHair = true;
          coreMat.userData.isMasterCardHair = true;
          coreMat.userData.uniforms = hMats.shared;
          coreMat.polygonOffset = true;
          coreMat.polygonOffsetFactor = -1;
          coreMat.polygonOffsetUnits = -1;
          if (hMats.shared) {
            hMats.shared.uScalpFade.value = 0.055;
            hMats.shared.uInset.value = 0.0018;
          }
          coreMat.alphaTest = 0.22;
          coreMat.alphaToCoverage = true;
          coreMat.color.setRGB(strandRgb[0] * 0.96, strandRgb[1] * 0.96, strandRgb[2] * 0.96);
          return coreMat;
        }
        const material = new THREE.MeshPhysicalMaterial({
          name: 'ArtistHair_StableCoverage', map, color: displayColor,
          metalness: 0, specularColor: new THREE.Color('#ffffff'),
          transparent: false, alphaTest: map ? 0.12 : 0,
          alphaToCoverage: Boolean(map), depthWrite: true,
          side: THREE.DoubleSide,
          polygonOffset: useStrandMode,
          polygonOffsetFactor: useStrandMode ? 1 : 0,
          polygonOffsetUnits: useStrandMode ? 1 : 0,
        });
        material.userData.builtInHair = true;
        configureHairSheen(material, sheenIntensity);
        injectArtistHairColor(material, { ...hairShaderParams, flowHorizontal: (child.userData.hairSourceStyle || resolvedStyle) === 'daz_hair_asym_short' });
        return material;
      };
      child.material = Array.isArray(child.material)
        ? child.material.map(configureMaterial) : configureMaterial(child.material);
      child.castShadow = true;
      child.receiveShadow = true;
      child.renderOrder = 0;
    });

    mark('materialsAndDistance');
    if (useStrandMode && (strandRes || (headSoup && strandEntries.length > 0))) {
      if (!strandRes) {
        const baseDensity = MASTER_HAIR_DENSITIES[strandDensity] || MASTER_HAIR_DENSITIES.mid;
        const desktopSoftware = strandRuntimeLod === 'software-desktop';
        const densitySpec = groomSoftware ? {
          ...baseDensity,
          guides: Math.max(260, Math.round(baseDensity.guides * (desktopSoftware ? .38 : .55))),
          childrenPerGuide: Math.max(4, Math.round(baseDensity.childrenPerGuide * (desktopSoftware ? .63 : .72))),
          fuzzPerGuide: baseDensity.fuzzPerGuide * (desktopSoftware ? .80 : .82),
        } : baseDensity;
        strandRes = generateStrands(strandEntries, null, null, headSoup, densitySpec);
        if (strandRes?.geometry) {
          strandRes.geometry.userData.sharedBuiltinGeo = true;
          masterStrandGeometryCache.set(strandCacheKey, strandRes);
        }
      }
      if (strandRes?.geometry) {
        const strandMat = createStrandMaterial(strandRes.headCenter, {
          color: strandRgb,
          gainR: MASTER_HAIR_CONFIG.gainR,
          gainTT: MASTER_HAIR_CONFIG.gainTT,
          gainTRT: MASTER_HAIR_CONFIG.gainTRT,
          gainDiffuse: MASTER_HAIR_CONFIG.gainDiffuse,
          hairOmbreMix,
          hairTipColor,
        });
        const strandGeo = createLightweightGeometryInstance(strandRes.geometry, false);
        strandGeo.userData.sharedBuiltinGeo = true;
        const strandMesh = new THREE.Mesh(strandGeo, strandMat);
        strandMesh.name = 'MasterStrandHairMesh';
        strandMesh.castShadow = false;
        strandMesh.receiveShadow = true;
        strandMesh.frustumCulled = false;
        strandMesh.renderOrder = 1;
        hairGroup.add(strandMesh);
        globalStrandMeshVersion++;
        totalVerts += strandRes.vertexCount;
        totalTris += strandRes.geometry.index ? strandRes.geometry.index.count / 3 : 0;
        strandCount = strandRes.strandCount;
        guideCount = strandRes.guides;
        if (typeof window !== 'undefined') {
          window.__STRAND_STATS__ = {
            id: resolvedStyle,
            density: strandDensity,
            runtimeLod: strandRuntimeLod,
            guides: strandRes.guides,
            strands: strandRes.strandCount,
            main: strandRes.mainStrands,
            fuzz: strandRes.fuzz,
            strays: strandRes.strays,
            verts: strandRes.vertexCount,
            ao: strandRes.aoStats,
          };
        }
      }
    }

    mark('strandGeneration');
    hairGroup.add(loadedScene);
    disposeHeadNode(oldHair);
    modelContainer.add(hairGroup);
    rootGroup.userData.currentHairStyle = selectedStyle;
    delete rootGroup.userData.hairLoadError;
    rootGroup.userData.hairStats = {
      vertices: totalVerts,
      triangles: Math.round(totalTris),
      strands: strandCount,
      guides: guideCount,
      mode: useStrandMode ? 'strand' : 'card',
      density: strandDensity,
      runtimeLod: strandRuntimeLod,
      style: selectedStyle,
    };

    const mergedMorphs = {
      ...(rootGroup.userData.currentMorphs || {}),
      topCrownStyle,
      frontBangsStyle,
      sideLocksStyle,
      backAttachmentStyle,
      hairTipColor,
      hairOmbreMix,
      hairWispyFeather,
      hairRenderMode,
      strandDensity,
    };
    applyHeadMorphsToGroup(rootGroup, mergedMorphs);

    mark('morphs');
    // Update 3D Hairline Coverage (`aHairCov`, `aHairDir`), Root Pigment (`uHairRoot`), and Baby-Hair Wisps (`masterQuality/hairlineBlend.js`)
    try {
      let skinMeshForHairline = null;
      modelContainer.traverse((ch) => {
        if (!skinMeshForHairline && ch.isMesh && (ch.name === 'HeadSkinMesh' || ch.material?.name === 'Skin')) {
          skinMeshForHairline = ch;
        }
      });
      if (skinMeshForHairline) {
        const strandRgb = hexToMasterStrandRgb(hairColorHex);
        const uHairRoot = skinMeshForHairline.material?.userData?.skinGradingUniforms?.uHairRoot;
        if (uHairRoot?.value) {
          uHairRoot.value.set(strandRgb[0] * 1.15, strandRgb[1] * 1.15, strandRgb[2] * 1.15);
        }
        modelContainer.updateMatrixWorld(true);
        const invContainerMat = new THREE.Matrix4().copy(modelContainer.matrixWorld).invert();
        const hairLocalEntries = [];
        hairGroup.traverse((ch) => {
          if (ch.isMesh && ch.visible && ch.name !== 'ScalpRootFeatherCap' && ch.name !== 'ScalpRootStrands' && ch.name !== 'BabyHairWisps' && ch.name !== 'MasterStrandHairMesh' && ch.name !== 'MasterStrandHair') {
            const relMat = new THREE.Matrix4().multiplyMatrices(invContainerMat, ch.matrixWorld);
            const mat0 = Array.isArray(ch.material) ? ch.material[0] : ch.material;
            hairLocalEntries.push({
              geom: ch.geometry,
              matrix: relMat,
              alphaAt: mat0?.map ? alphaSamplerFromTexture(mat0.map) : null,
            });
          }
        });
        if (hairLocalEntries.length > 0) {
          const hairlineAnchors = { eyeY: 0.0184, headCenter: [0.0, 0.02, -0.01] };
          computeHairCoverage(skinMeshForHairline, hairLocalEntries, hairlineAnchors, { useLocalSpace: true });
        }
      }
    } catch (_) {}

    mark('hairlineCoverage');
    if (typeof window !== 'undefined' && window.__HAIR_TIMING__) console.info('HAIR_TIMING', selectedStyle, JSON.stringify(marks));
    return hairGroup;
  } catch (err) {
    if (rootGroup.userData.hairRequestSerial === request) rootGroup.userData.hairLoadError = String(err.message || err).slice(0, 180);
    console.warn('Failed to load 3D artist hair model:', hairUrl, err);
    return null;
  }
}

export async function updateHairDesignOnGroup(rootGroup, patch = {}) {
  if (!rootGroup) return;
  const prevTop = rootGroup.userData.topCrownStyle || 'default';
  const prevFront = rootGroup.userData.frontBangsStyle || 'default';
  const prevSide = rootGroup.userData.sideLocksStyle || 'default';
  const prevBack = rootGroup.userData.backAttachmentStyle || 'none';
  const prevStyle = rootGroup.userData.currentHairStyle || 'hair_user_photo';
  const prevMode = rootGroup.userData.hairRenderMode || MASTER_HAIR_CONFIG.mode || 'strand';
  const prevDensity = rootGroup.userData.strandDensity || MASTER_HAIR_CONFIG.density || 'mid';

  const nextStyle = patch.hairStyle ? resolveRealHairStyle(patch.hairStyle) : prevStyle;
  const styleChanged = Boolean(patch.hairStyle && nextStyle !== prevStyle);
  const nextPreset = HAIR_STYLE_PRESET_RECIPES[nextStyle] || null;
  const prevWasPreset = Boolean(HAIR_STYLE_PRESET_RECIPES[prevStyle]);

  const nextTop = patch.topCrown ?? patch.topCrownStyle ?? (styleChanged ? (nextPreset?.topCrown || (prevWasPreset ? 'default' : prevTop)) : prevTop);
  const nextFront = patch.frontBangs ?? patch.frontBangsStyle ?? (styleChanged ? (nextPreset?.frontBangs || (prevWasPreset ? 'default' : prevFront)) : prevFront);
  const nextSide = patch.sideLocks ?? patch.sideLocksStyle ?? (styleChanged ? (nextPreset?.sideLocks || (prevWasPreset ? 'default' : prevSide)) : prevSide);
  const nextBack = patch.backAttachment ?? patch.backAttachmentStyle ?? (styleChanged ? (nextPreset?.backAttachment || (prevWasPreset ? 'none' : prevBack)) : prevBack);
  const nextMode = patch.hairRenderMode ?? prevMode;
  const nextDensity = patch.strandDensity ?? prevDensity;

  if (patch.hairColor) rootGroup.userData.hairColor = patch.hairColor;
  if (patch.hairTipColor) {
    rootGroup.userData.hairTipColor = patch.hairTipColor;
  } else if (styleChanged && nextPreset?.hairTipColor) {
    rootGroup.userData.hairTipColor = nextPreset.hairTipColor;
  }
  if (patch.hairOmbreMix !== undefined) {
    rootGroup.userData.hairOmbreMix = Number(patch.hairOmbreMix);
  } else if (styleChanged) {
    rootGroup.userData.hairOmbreMix = Number(nextPreset?.hairOmbreMix ?? (prevWasPreset ? 0.0 : (rootGroup.userData.hairOmbreMix ?? 0.0)));
  }
  if (patch.hairWispyFeather !== undefined) {
    rootGroup.userData.hairWispyFeather = Number(patch.hairWispyFeather);
  } else if (styleChanged && nextPreset?.hairWispyFeather !== undefined) {
    rootGroup.userData.hairWispyFeather = Number(nextPreset.hairWispyFeather);
  }
  if (patch.hairSheen !== undefined) rootGroup.userData.hairSheen = Number(patch.hairSheen);
  rootGroup.userData.topCrownStyle = nextTop;
  rootGroup.userData.hairRenderMode = nextMode;
  rootGroup.userData.strandDensity = nextDensity;

  rootGroup.userData.currentMorphs = {
    ...(rootGroup.userData.currentMorphs || {}),
    ...patch,
    topCrown: nextTop,
    topCrownStyle: nextTop,
    frontBangs: nextFront,
    frontBangsStyle: nextFront,
    sideLocks: nextSide,
    sideLocksStyle: nextSide,
    backAttachment: nextBack,
    backAttachmentStyle: nextBack,
    hairRenderMode: nextMode,
    strandDensity: nextDensity,
  };

  const needsGeometryRebuild =
    nextStyle !== prevStyle ||
    nextFront !== prevFront ||
    nextSide !== prevSide ||
    nextBack !== prevBack ||
    nextMode !== prevMode ||
    nextDensity !== prevDensity;

  if (needsGeometryRebuild) {
    await attachRealHairModel(rootGroup, {
      hairStyle: nextStyle,
      customHairUrl: patch.hairStyle ? null : rootGroup.userData.customHairUrl,
      customHairType: rootGroup.userData.customHairType,
      topCrown: nextTop,
      topCrownStyle: nextTop,
      frontBangs: nextFront,
      frontBangsStyle: nextFront,
      sideLocks: nextSide,
      sideLocksStyle: nextSide,
      backAttachment: nextBack,
      backAttachmentStyle: nextBack,
      hairRenderMode: nextMode,
      strandDensity: nextDensity,
      groomSoftware: rootGroup.userData.groomSoftware,
      groomLod: rootGroup.userData.groomLod,
      hairColor: rootGroup.userData.hairColor,
      hairTipColor: rootGroup.userData.hairTipColor,
      hairOmbreMix: rootGroup.userData.hairOmbreMix,
      hairWispyFeather: rootGroup.userData.hairWispyFeather,
      hairSheen: rootGroup.userData.hairSheen,
      neckClearance: rootGroup.userData.neckClearance,
      morphs: rootGroup.userData.currentMorphs,
    });
    return;
  }

  // Fast live shader + morph update (zero reload latency)
  const hairGroup = rootGroup.getObjectByName('HairGroup');
  if (patch.hairSheen !== undefined) updateHairSheen(rootGroup, patch.hairSheen);
  if (hairGroup && patch.hairColor) {
    const dispCol = computeTrueHairDisplayColor(patch.hairColor);
    const strandRgb = hexToMasterStrandRgb(patch.hairColor);
    hairGroup.traverse((child) => {
      if (!child.isMesh) return;
      if (child.name === 'ScalpRootFeatherCap' && child.material) {
        child.material.color.setRGB(
          Math.max(0.032, dispCol.r * 1.15),
          Math.max(0.024, dispCol.g * 1.12),
          Math.max(0.020, dispCol.b * 1.10)
        );
        return;
      }
      for (const mat of Array.isArray(child.material) ? child.material : [child.material]) {
        if (mat?.userData?.isMasterStrandHair || mat?.userData?.strandUniforms) {
          mat.color.setRGB(strandRgb[0], strandRgb[1], strandRgb[2]);
        } else if (mat?.userData?.isMasterCardHair) {
          mat.color.setRGB(strandRgb[0] * 0.96, strandRgb[1] * 0.96, strandRgb[2] * 0.96);
        } else if (mat?.userData?.builtInHair) {
          mat.color.copy(dispCol).multiplyScalar(child.name === 'ScalpRootStrands' ? 1.35 : 1);
        }
      }
    });
  }
  applyArtistHairFineTuning(rootGroup, rootGroup.userData.currentMorphs);
  applyStoredHairSculpt(rootGroup, rootGroup.userData.currentMorphs);
}

/**
 * Stage 43 · DLSS-5-Inspired Multi-Layered Iris Stroma, Limbal Ring, Pupil Dilation & Clean Sclera Shader
 * - Supports full-range real-time Iris Color (`uIrisColor`), Iris Brightness (`uIrisBrightness`),
 *   Iris Scale (`uIrisScale` 虹膜/美瞳直径 0.68..1.38 with clean ivory sclera replacement),
 *   Pupil Dilation (`uPupilScale` 瞳孔大小), Limbal Ring (`uLimbalRing` 暗环深度),
 *   Inter-Eye Spacing (`uEyeSpacing`), Catchlight (`uCatchlightStrength`), and Sclera Clarity (`uScleraBrightness`).
 */
function injectLifelikeEyeShader(material, initialEye = {}) {
  const eyeUniforms = {
    uIrisColor: { value: new THREE.Color(initialEye.irisColor || '#3b271e') },
    uIrisColorMix: { value: Number(initialEye.irisColorMix ?? 0.88) },
    uIrisScale: { value: Number(initialEye.irisScale ?? 1.0) },
    uPupilScale: { value: Number(initialEye.pupilSize ?? 1.0) },
    uIrisBrightness: { value: Number(initialEye.irisBrightness ?? 1.0) },
    uLimbalRing: { value: Number(initialEye.limbalRing ?? 0.68) },
    uEyeSpacing: { value: Number(initialEye.eyeSpacing ?? 0.0) },
    uCatchlightStrength: { value: Number(initialEye.eyeCatchlight ?? 0.85) },
    uIrisSparkle: { value: 0 },
    uScleraBrightness: { value: Number(initialEye.scleraBrightness ?? 0.96) },
    uEyeClarity: { value: Number(initialEye.eyeClarity ?? 0.85) },
    uCorneaWetness: { value: Number(initialEye.corneaWetness ?? 0.92) },
    uScleraVeinIntensity: { value: Number(initialEye.scleraVeinIntensity ?? 0.16) },
    uWindowGobo: { value: 0.0 },
    uWindowGoboStrength: { value: 0.78 },
    uWindowGoboScale: { value: 1.0 },
    uWindowGoboSoftness: { value: 0.5 },
    uWindowGoboPhase: { value: 0.0 },
    uChiaroscuro: { value: 0.88 },
    uGazeOffset: {
      value: new THREE.Vector2(
        Number(initialEye.gazeYaw ?? 0) * 0.24,
        Number(initialEye.gazePitch ?? 0) * 0.22
      ),
    },
  };
  material.userData = material.userData || {};
  material.userData.eyeUniforms = eyeUniforms;
  material.customProgramCacheKey = () => 'cervix3d_lifelike_eye_v44';
  material.onBeforeCompile = (shader) => {
    for (const [k, uObj] of Object.entries(eyeUniforms)) {
      shader.uniforms[k] = uObj;
    }
    shader.vertexShader = `
      varying vec3 vEyeLocalPos;
      varying vec3 vEyeWorldPos;
      varying vec3 vEyeNormal;
    ` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vEyeLocalPos = position;
      vEyeWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      vEyeNormal = normalize(normal);
      `
    );
    shader.fragmentShader = `
      uniform vec3 uIrisColor;
      uniform float uIrisColorMix;
      uniform float uIrisScale;
      uniform float uPupilScale;
      uniform float uIrisBrightness;
      uniform float uLimbalRing;
      uniform float uEyeSpacing;
      uniform float uCatchlightStrength;
      uniform float uIrisSparkle;
      uniform float uScleraBrightness;
      uniform float uEyeClarity;
      uniform float uCorneaWetness;
      uniform float uScleraVeinIntensity;
      uniform float uWindowGobo;
      uniform float uWindowGoboStrength;
      uniform float uWindowGoboScale;
      uniform float uWindowGoboSoftness;
      uniform float uWindowGoboPhase;
      uniform float uChiaroscuro;
      uniform vec2 uGazeOffset;
      varying vec3 vEyeLocalPos;
      varying vec3 vEyeWorldPos;
      varying vec3 vEyeNormal;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #include <map_fragment>
      {
        float eyeSide = vEyeLocalPos.x >= 0.0 ? 1.0 : -1.0;
        vec2 eyeCenter = vec2(eyeSide * (0.0285 + uEyeSpacing * 0.0024), 0.0184) + uGazeOffset * 0.0045;
        vec2 relXY = (vEyeLocalPos.xy - eyeCenter) / (0.0063 * clamp(uIrisScale, 0.65, 1.42));
        float rIris = length(relXY);
        float inIris = 1.0 - smoothstep(0.88, 1.03, rIris);
        float pupilRadius = 0.33 * clamp(uPupilScale, 0.45, 1.65);
        float inPupil = 1.0 - smoothstep(pupilRadius - 0.045, pupilRadius + 0.045, rIris);

        // Multi-layered radial iris collagen crypt fibers, warm collarette ring & limbal ring
        float theta = atan(relXY.y, relXY.x);
        float clarityBoost = clamp(uEyeClarity, 0.0, 1.6);
        float radialFibers = 0.5 + 0.5 * sin(theta * 38.0 + sin(rIris * 13.0) * 1.3) * cos(theta * 21.0 - 0.8);
        float fineCrypts = 0.5 + 0.5 * cos(theta * 62.0 - rIris * 9.5);
        float collaretteRing = exp(-pow((rIris - 0.46) / 0.13, 2.0)) * (0.24 + 0.18 * clarityBoost);
        float limbalMask = smoothstep(0.64, 0.98, rIris) * inIris;
        float limbalDarken = clamp(uLimbalRing, 0.0, 1.2) * (0.72 + 0.14 * clarityBoost) * limbalMask;

        vec3 baseStroma = uIrisColor * clamp(uIrisBrightness, 0.45, 1.75);
        vec3 warmCollarette = mix(baseStroma, baseStroma * vec3(1.26, 1.10, 0.86) + vec3(0.06, 0.04, 0.02), 0.58);
        vec3 customIris = (baseStroma * (0.58 + (0.54 + 0.18 * clarityBoost) * radialFibers + 0.15 * fineCrypts) + warmCollarette * collaretteRing)
                        * (1.0 - limbalDarken);
        float stromaMask = inIris * (1.0 - inPupil);
        float effMix = clamp(max(uIrisColorMix, 0.88), 0.0, 0.98);
        diffuseColor.rgb = mix(diffuseColor.rgb, customIris, clamp(stromaMask * effMix, 0.0, 0.97));
        // Deep velvet-black pupil aperture
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.006, 0.006, 0.010), inPupil * 0.97);

        // Clean physiological moist sclera + Medial Canthus Lacrimal Caruncle (内眼角湿润泪阜)
        float scleraMask = 1.0 - inIris;
        float axEye = abs(vEyeLocalPos.x);
        float medialCaruncle = (1.0 - smoothstep(0.0152, 0.0186, axEye)) * exp(-pow((vEyeLocalPos.y - 0.0172) / 0.0032, 2.0));
        float lateralCorner = smoothstep(0.0365, 0.0425, axEye);
        vec3 cleanScleraBase = vec3(0.86, 0.84, 0.83);
        vec3 naturalSclera = mix(cleanScleraBase, vec3(0.76, 0.64, 0.63), lateralCorner * 0.35);
        naturalSclera = mix(naturalSclera, vec3(0.78, 0.48, 0.50), clamp(medialCaruncle * 0.82, 0.0, 0.85));
        if (uScleraVeinIntensity > 0.01) {
          float veinAngle = theta * 14.0 + sin(rIris * 6.5) * 2.2;
          float veinBranch = smoothstep(0.92, 0.995, abs(sin(veinAngle) * cos(theta * 7.0 + rIris * 4.0)));
          float veinMask = veinBranch * smoothstep(1.08, 1.65, rIris) * clamp(uScleraVeinIntensity, 0.0, 1.2);
          naturalSclera = mix(naturalSclera, vec3(0.68, 0.30, 0.32), clamp(veinMask * 0.42, 0.0, 0.40));
        }
        // Eye Occlusion (Upper/Lower eyelid shadow + moist pink canthus corner tint)
        vec2 qOcc = (vEyeLocalPos.xy - eyeCenter) / 0.0115;
        float occUpper = smoothstep(0.05, 0.62, qOcc.y);
        float occLower = smoothstep(-0.22, -0.68, qOcc.y) * 0.45;
        float occCorner = smoothstep(0.35, 0.88, abs(qOcc.x)) * 0.58;
        float occTotal = clamp(occUpper + occLower + occCorner, 0.0, 1.0) * 0.72;
        naturalSclera *= mix(vec3(1.0), vec3(0.46, 0.39, 0.38), occTotal);
        naturalSclera = mix(naturalSclera, naturalSclera * vec3(1.06, 0.86, 0.84), occCorner * 0.45);
        diffuseColor.rgb = mix(diffuseColor.rgb * mix(vec3(1.0), vec3(0.55, 0.48, 0.46), occUpper * 0.55), naturalSclera * clamp(uScleraBrightness, 0.62, 1.24), scleraMask);
      }
      `
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      `
      #include <lights_fragment_end>
      vec3 viewDir = normalize(vViewPosition);
      vec3 nEye = normalize(normal);

      float eyeSide = vEyeLocalPos.x >= 0.0 ? 1.0 : -1.0;
      vec2 eyeCenter = vec2(eyeSide * (0.0285 + uEyeSpacing * 0.0024), 0.0184) + uGazeOffset * 0.0045;
      vec2 relXY = (vEyeLocalPos.xy - eyeCenter) / (0.0063 * clamp(uIrisScale, 0.65, 1.42));
      float rIris = length(relXY);
      float inIris = 1.0 - smoothstep(0.88, 1.06, rIris);

      // 1. Realistic Upper Eyelid & Lash Cast Shadow (makes eyeball sit deeply inside the orbital socket!)
      float upperLidShadow = smoothstep(0.0226, 0.0176, vEyeLocalPos.y);
      float lowerLidAO = smoothstep(0.0114, 0.0138, vEyeLocalPos.y);
      float cornerAO = 1.0 - 0.22 * smoothstep(1.05, 1.90, abs(relXY.x));
      float orbitalAO = clamp((0.58 + 0.42 * upperLidShadow) * (0.86 + 0.14 * lowerLidAO) * cornerAO, 0.52, 1.0);

      // 2. Coupling with Scene Window Gobo & Chiaroscuro Shadow Falloff
      float eyeGoboAtten = 1.0;
      if (uWindowGobo > 0.5 && uWindowGoboStrength > 0.01) {
        float gScale = max(0.35, uWindowGoboScale);
        float drift = uWindowGoboPhase;
        vec2 gUV = vec2(
          vEyeWorldPos.x * 0.055 * gScale + vEyeWorldPos.y * 0.022 * gScale + drift * 0.14,
          vEyeWorldPos.y * 0.065 * gScale - vEyeWorldPos.z * 0.018 * gScale + sin(drift * 0.5) * 0.04
        );
        float gSoft = mix(0.04, 0.24, clamp(uWindowGoboSoftness, 0.0, 1.0));
        float gLight = 1.0;
        if (uWindowGobo < 1.5) {
          float b = fract(gUV.y * 5.2 + gUV.x * 1.4);
          gLight = smoothstep(0.30 - gSoft, 0.36 + gSoft, b) * (1.0 - smoothstep(0.76 - gSoft, 0.82 + gSoft, b));
        } else if (uWindowGobo < 2.5) {
          float gx = abs(fract(gUV.x * 1.8) - 0.5);
          float gy = abs(fract(gUV.y * 1.6) - 0.5);
          gLight = smoothstep(0.07 - gSoft * 0.35, 0.12 + gSoft * 0.45, min(gx, gy));
        } else {
          float slit = exp(-pow((fract(gUV.y * 1.2 + gUV.x * 0.65) - 0.48) / max(0.08, 0.14 + gSoft * 0.35), 2.0));
          gLight = clamp(slit * 1.15, 0.0, 1.0);
        }
        eyeGoboAtten = mix(1.0, 0.32 + 0.68 * gLight, clamp(uWindowGoboStrength, 0.0, 1.0));
      }

      reflectedLight.directDiffuse *= orbitalAO * eyeGoboAtten;
      reflectedLight.indirectDiffuse *= orbitalAO * mix(1.0, eyeGoboAtten, 0.72) * mix(0.92, 0.64, clamp(uChiaroscuro, 0.0, 1.0));

      // Lower iris warm caustic refraction (concave iris dish illuminated opposite the top-left key light)
      float causticZone = clamp(-relXY.y * 0.85 - relXY.x * 0.30, 0.0, 1.0) * exp(-pow((rIris - 0.56) / 0.22, 2.0));
      reflectedLight.directDiffuse += (uIrisColor * clamp(uIrisBrightness, 0.5, 1.6) * 0.62 + vec3(0.18, 0.11, 0.07)) * causticZone * inIris * 0.72 * eyeGoboAtten;

      // Studio Softbox Window Catchlight + Subtle Caruncle Moisture Pinpoint + Uncrushed PMREM Cornea Reflection (masterQuality/featureMaterials.js)
      float wetFactor = clamp(uCorneaWetness, 0.2, 1.5);
      vec2 sb1 = (relXY - vec2(-0.26, 0.24)) / vec2(0.11, 0.085);
      float softbox1 = exp(-pow(max(abs(sb1.x), abs(sb1.y)), 2.6)) * smoothstep(0.0228, 0.0192, vEyeLocalPos.y);
      float softbox2 = exp(-(pow((relXY.x - 0.28) / 0.045, 2.0) + pow((relXY.y + 0.24) / 0.042, 2.0))) * 0.42;
      vec3 wetCatchlight = (vec3(2.25, 2.22, 2.18) * softbox1 + vec3(1.15, 1.18, 1.24) * softbox2)
                         * inIris * clamp(uCatchlightStrength, 0.0, 1.6) * wetFactor * (0.55 + 0.45 * eyeGoboAtten);
      // Independent point-source catchlight actually confined to each iris.
      // The old photography slider only updated an unused post shader uniform.
      float pointGlint = exp(-pow((relXY.x - 0.16) / 0.075, 2.0) - pow((relXY.y - 0.32) / 0.064, 2.0));
      wetCatchlight += vec3(1.52, 1.58, 1.72) * pointGlint * inIris
                     * clamp(uIrisSparkle, 0.0, 1.6) * wetFactor * orbitalAO * eyeGoboAtten;
      float specKeep = mix(0.65, 0.95, inIris) * orbitalAO * eyeGoboAtten * wetFactor;
      reflectedLight.directSpecular = reflectedLight.directSpecular * specKeep + wetCatchlight;
      reflectedLight.indirectSpecular *= specKeep;
      `
    );
  };
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

/**
 * Stage 53 · Continuous High-Resolution 8,700-Vertex 3D Organic Anatomical Cross-Section Sculptor
 * Replaces crude primitive spheres/tori with a single seamless, high-density (54 radial × 160 angular)
 * 3D sculpted anatomical mesh whose outer boundary locks onto the exact neck perimeter of HeadSkin and
 * whose interior continuously forms:
 *  - Anterior (+Z, UV.v > 0.5): Deep recessed hollow tracheal airway funnel (+10.5mm into throat) with
 *    3 internal cartilaginous ring undulations, raised C-shaped hyaline cartilage ridge, recessed
 *    stellate esophageal lumen, and lobulated bilateral thyroid relief;
 *  - Posterior (-Z, UV.v < 0.5): Protruding C4 cervical vertebra cortical ring (-2.2mm), recessed
 *    honeycomb cancellous bone marrow pit, bilateral transverse foramina with vertebral artery cuffs,
 *    posterior vertebral arch & bifid spinous process, and protruding severed spinal cord stump;
 *  - Bilateral Carotid Sheaths: Raised elastic carotid arterial cuffs with recessed lumens;
 *  - 16 Retracted Cervical Muscle Bellies separated by recessed intermuscular fascial sulci;
 *  - Beveled Ragged Dermis Cut Lip & Organic Coagulated Blood Meniscus Rim.
 */
let _cachedHighResCrossSectionGeo = null;
function buildHighResSculptedNeckCrossSectionGeometry(baseCapMesh) {
  if (_cachedHighResCrossSectionGeo) {
    return _cachedHighResCrossSectionGeo.clone();
  }

  const posAttr = baseCapMesh.geometry?.attributes?.position;
  const uvAttr = baseCapMesh.geometry?.attributes?.uv;
  let cx = 0.0;
  let cz = -0.0128;
  const cutY = -0.1100;
  const rimSamples = [];

  if (posAttr && uvAttr) {
    // Ensure UV orientation on baseCapMesh has Anterior (+Z) mapped to UV.v > 0.5
    let maxZ = -Infinity;
    let frontIdx = 0;
    for (let i = 0; i < posAttr.count; i++) {
      const z = posAttr.getZ(i);
      if (z > maxZ) {
        maxZ = z;
        frontIdx = i;
      }
    }
    if (uvAttr.getY(frontIdx) < 0.5) {
      for (let i = 0; i < uvAttr.count; i++) {
        uvAttr.setY(i, 1.0 - uvAttr.getY(i));
      }
      uvAttr.needsUpdate = true;
    }

    let sumX = 0;
    let sumZ = 0;
    let cntCenter = 0;
    for (let i = 0; i < posAttr.count; i++) {
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);
      const rhoUv = Math.hypot((u - 0.5) / 0.455, (v - 0.5) / 0.455);
      if (rhoUv < 0.12) {
        sumX += posAttr.getX(i);
        sumZ += posAttr.getZ(i);
        cntCenter++;
      }
    }
    if (cntCenter > 0) {
      cx = sumX / cntCenter;
      cz = sumZ / cntCenter;
    }
    for (let i = 0; i < posAttr.count; i++) {
      const u = uvAttr.getX(i);
      const v = uvAttr.getY(i);
      const rhoUv = Math.hypot((u - 0.5) / 0.455, (v - 0.5) / 0.455);
      if (rhoUv > 0.94) {
        const px = posAttr.getX(i);
        const pz = posAttr.getZ(i);
        const ang = Math.atan2(pz - cz, px - cx);
        const rad = Math.hypot(px - cx, pz - cz);
        rimSamples.push({ ang, rad });
      }
    }
  }

  const getOuterRadiusAtAngle = (theta) => {
    if (rimSamples.length === 0) return 0.0445;
    let bestW = 0;
    let bestR = 0;
    for (let i = 0; i < rimSamples.length; i++) {
      let d = Math.abs(rimSamples[i].ang - theta);
      if (d > Math.PI) d = 2.0 * Math.PI - d;
      const w = 1.0 / Math.max(0.015, d * d);
      bestW += w;
      bestR += rimSamples[i].rad * w;
    }
    return bestW > 0 ? bestR / bestW : 0.0445;
  };

  const N_rad = 54;
  const N_ang = 160;
  const stride = N_ang + 1;
  const numVerts = (N_rad + 1) * stride;
  const positions = new Float32Array(numVerts * 3);
  const uvs = new Float32Array(numVerts * 2);
  const indices = [];

  for (let ir = 0; ir <= N_rad; ir++) {
    // Non-linear radial distribution (starts at 0.0025 to avoid polar center triangle degeneracy)
    const tRad = ir / N_rad;
    const rho = ir === 0 ? 0.0 : (0.0025 + 0.9975 * Math.pow(tRad, 0.92));

    for (let ia = 0; ia <= N_ang; ia++) {
      const theta = (ia / N_ang) * Math.PI * 2.0;
      const rOuter = getOuterRadiusAtAngle(theta);
      const u_d = rho * Math.cos(theta);
      const v_d = rho * Math.sin(theta);
      const u = 0.5 + 0.455 * u_d;
      const v = 0.5 + 0.455 * v_d;

      const x = cx + u_d * rOuter;
      const z = cz + v_d * rOuter;

      let dy = 0.0;

      // 1. ANTERIOR (+Z): Deep Continuous Trachea Airway Cavity & Hyaline C-Ring (u=0.50, v=0.715)
      const dTrach = Math.hypot((u - 0.50) / 0.068, (v - 0.715) / 0.060);
      const angTrach = Math.atan2(v - 0.715, u - 0.50);
      if (dTrach < 1.18) {
        if (dTrach < 0.68) {
          // Deep hollow airway cavity plunging +9.8mm up into the throat + 3 internal tracheal ring ridges
          const depthT = Math.pow(1.0 - Math.pow(dTrach / 0.68, 2.0), 1.35);
          const ringUndulation = 0.00050 * Math.sin(depthT * Math.PI * 6.0);
          dy += 0.0098 * depthT + ringUndulation;
        } else if (dTrach < 0.98) {
          // Hyaline cartilage C-ring (open posteriorly at angTrach ≈ -PI/2 toward esophagus)
          const postGap = Math.exp(-Math.pow((angTrach + Math.PI * 0.5) / 0.54, 2.0));
          const cRingProfile = Math.exp(-Math.pow((dTrach - 0.80) / 0.11, 2.0));
          dy -= 0.00165 * cRingProfile * (1.0 - 0.88 * postGap);
        }
      }

      // 2. ESOPHAGUS: Collapsed Stellate Mucosal Pit (u=0.50, v=0.585)
      const dEso = Math.hypot((u - 0.50) / 0.044, (v - 0.585) / 0.028);
      const angEso = Math.atan2(v - 0.585, u - 0.50);
      if (dEso < 1.15) {
        if (dEso < 0.62) {
          const stellateFolds = 0.00040 * Math.cos(angEso * 6.0) * (dEso / 0.62);
          dy += 0.0030 * (1.0 - Math.pow(dEso / 0.62, 2.0)) + stellateFolds;
        } else {
          dy -= 0.00080 * Math.exp(-Math.pow((dEso - 0.82) / 0.16, 2.0));
        }
      }

      // 3. BILATERAL THYROID GLAND LOBES: Lobulated Endocrine Relief (u=0.50±0.094, v=0.688)
      for (const side of [-1, 1]) {
        const dThy = Math.hypot((u - (0.50 + side * 0.094)) / 0.045, (v - 0.688) / 0.064);
        if (dThy < 1.02) {
          const lobuleNoise = 0.00028 * Math.sin(u * 190.0) * Math.cos(v * 190.0);
          dy -= (0.00105 * Math.cos(dThy * Math.PI * 0.48) + lobuleNoise);
        }
      }

      // 4. POSTERIOR (-Z): C4 Cervical Vertebra Cortical Ring & Recessed Trabecular Marrow (u=0.50, v=0.442)
      const dVert = Math.hypot((u - 0.50) / 0.084, (v - 0.442) / 0.058);
      if (dVert < 1.14) {
        if (dVert > 0.64) {
          // Hard cortical bone outer ring protruding -2.2mm downward
          dy -= 0.00220 * Math.exp(-Math.pow((dVert - 0.84) / 0.16, 2.0));
        } else {
          // Recessed cancellous red-marrow core with fine honeycomb bony spicules
          const trabSpicules = 0.00042 * Math.sin(u * 280.0) * Math.cos(v * 280.0);
          dy -= (0.00070 - trabSpicules);
        }
      }

      // Bilateral Transverse Processes & Foramina Transversaria (u=0.50±0.106, v=0.422)
      for (const side of [-1, 1]) {
        const dTp = Math.hypot((u - (0.50 + side * 0.106)) / 0.050, (v - 0.422) / 0.033);
        const dFt = Math.hypot((u - (0.50 + side * 0.114)) / 0.019, (v - 0.422) / 0.015);
        if (dFt < 1.0) {
          dy += 0.0022 * (1.0 - dFt);
        } else if (dTp < 1.08) {
          dy -= 0.00160 * Math.exp(-Math.pow((dTp - 0.68) / 0.24, 2.0));
        }
      }

      // Posterior Vertebral Arch (Laminae) & Bifid Spinous Process (v in [0.195, 0.365])
      if (v > 0.190 && v < 0.368) {
        const tSp = (0.368 - v) / (0.368 - 0.190);
        const targetDu = tSp < 0.58 ? 0.062 * (1.0 - tSp / 0.58) : 0.014 * ((tSp - 0.58) / 0.42);
        const dArch = Math.abs(Math.abs(u - 0.50) - targetDu);
        if (dArch < 0.024) {
          dy -= 0.00180 * Math.exp(-Math.pow(dArch / 0.013, 2.0));
        }
      }

      // 5. SPINAL CANAL & SEVERED SPINAL CORD STUMP (u=0.50, v=0.332)
      const dCord = Math.hypot((u - 0.50) / 0.052, (v - 0.332) / 0.041);
      if (dCord < 1.12) {
        if (dCord < 0.68) {
          dy -= 0.00190 * Math.cos(dCord * Math.PI * 0.62);
        } else {
          dy += 0.00140 * Math.exp(-Math.pow((dCord - 0.86) / 0.15, 2.0));
        }
      }

      // 6. BILATERAL CAROTID SHEATH VESSELS: Common Carotid Artery & Internal Jugular Vein
      for (const side of [-1, 1]) {
        // Common Carotid Artery (u=0.50±0.158, v=0.562): thick elastic wall + recessed lumen
        const dCa = Math.hypot((u - (0.50 + side * 0.158)) / 0.027, (v - 0.562) / 0.025);
        if (dCa < 1.20) {
          if (dCa < 0.56) {
            dy += 0.0028 * (1.0 - Math.pow(dCa / 0.56, 2.0));
          } else {
            dy -= 0.00165 * Math.exp(-Math.pow((dCa - 0.78) / 0.18, 2.0));
          }
        }
        // Internal Jugular Vein (u=0.50±0.212, v=0.548): collapsed venous slit + thin wall
        const jx = (u - (0.50 + side * 0.212)) * Math.cos(0.45 * side) + (v - 0.548) * Math.sin(0.45 * side);
        const jy = -(u - (0.50 + side * 0.212)) * Math.sin(0.45 * side) + (v - 0.548) * Math.cos(0.45 * side);
        const dIjv = Math.hypot(jx / 0.033, jy / 0.017);
        if (dIjv < 1.15) {
          if (dIjv < 0.68) {
            dy += 0.0022 * (1.0 - Math.pow(dIjv / 0.68, 2.0));
          } else {
            dy -= 0.00090 * Math.exp(-Math.pow((dIjv - 0.86) / 0.16, 2.0));
          }
        }
      }

      // 7. TIGHTLY-PACKED ROTATED CERVICAL MUSCLE BELLIES & INTERMUSCULAR SEPTA
      const muscleBellies = [
        [0.255, 0.665, 0.135, 0.088, 0.68],
        [0.095, 0.825, 0.092, 0.052, 0.16],
        [0.205, 0.775, 0.078, 0.048, 0.44],
        [0.085, 0.535, 0.076, 0.052, -0.15],
        [0.245, 0.465, 0.108, 0.078, -0.32],
        [0.295, 0.325, 0.118, 0.084, -0.72],
        [0.125, 0.255, 0.098, 0.074, -0.38],
        [0.195, 0.145, 0.142, 0.062, -0.22],
      ];
      let minM = 10.0;
      let secondM = 10.0;
      for (const side of [-1, 1]) {
        for (const [mcx, mcy, mrx, mry, mang] of muscleBellies) {
          const rot = -side * mang;
          const dx = u - (0.50 + side * mcx);
          const dz = v - mcy;
          const lx = (dx * Math.cos(rot) + dz * Math.sin(rot)) / mrx;
          const lz = (-dx * Math.sin(rot) + dz * Math.cos(rot)) / mry;
          const dm = Math.hypot(lx, lz);
          if (dm < minM) {
            secondM = minM;
            minM = dm;
          } else if (dm < secondM) {
            secondM = dm;
          }
        }
      }
      if (minM < 1.15 && dTrach > 1.05 && dVert > 1.02 && dCord > 0.98) {
        const bellyVal = Math.max(0.0, Math.cos(Math.min(1.0, minM) * Math.PI * 0.46));
        const septumCleft = Math.exp(-Math.pow((secondM - minM) / 0.085, 2.0));
        const myofibrilWave = 0.00024 * Math.sin(u * 230.0 + v * 150.0) * Math.cos(u * 170.0 - v * 210.0);
        dy -= (0.00135 * bellyVal * (1.0 - 0.65 * septumCleft) + myofibrilWave * bellyVal);
        dy += 0.00065 * septumCleft;
      }

      // 8. OUTER SUBCUTANEOUS LAYER & BEVELED RAGGED DERMIS CUT LIP (rho in [0.90, 1.0])
      if (rho > 0.90) {
        const rimWave = 0.00032 * Math.sin(theta * 7.0 + 0.5) + 0.00020 * Math.cos(theta * 13.0 - 1.2);
        const dermisBevel = -0.00115 * Math.exp(-Math.pow((1.0 - rho) / 0.036, 2.0));
        dy += dermisBevel + rimWave * smoothstepJS(0.93, 1.0, rho);
      }

      const idx = ir * stride + ia;
      positions[idx * 3] = x;
      positions[idx * 3 + 1] = cutY + dy;
      positions[idx * 3 + 2] = z;
      uvs[idx * 2] = u;
      uvs[idx * 2 + 1] = v;
    }
  }

  for (let ir = 0; ir < N_rad; ir++) {
    for (let ia = 0; ia < N_ang; ia++) {
      const a = ir * stride + ia;
      const b = a + 1;
      const d = (ir + 1) * stride + ia;
      const c = d + 1;
      indices.push(a, b, c);
      indices.push(a, c, d);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();

  // Blend computed 3D anatomical relief normals with a forward-tilted base normal so key/rim lights
  // sculpt every cavity and ridge without harsh black back-faces
  const normAttr = geo.attributes.normal;
  for (let i = 0; i < normAttr.count; i++) {
    let nx = normAttr.getX(i);
    let ny = normAttr.getY(i);
    let nz = normAttr.getZ(i);
    if (ny > 0) {
      nx = -nx;
      ny = -ny;
      nz = -nz;
    }
    nx = nx * 0.68;
    ny = ny * 0.68 + (-0.93) * 0.32;
    nz = nz * 0.68 + 0.36 * 0.32;
    const len = Math.hypot(nx, ny, nz) || 1.0;
    normAttr.setXYZ(i, nx / len, ny / len, nz / len);
  }
  normAttr.needsUpdate = true;

  _cachedHighResCrossSectionGeo = geo;
  return geo.clone();
}

function smoothstepJS(edge0, edge1, x) {
  const t = Math.max(0.0, Math.min(1.0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3.0 - 2.0 * t);
}

function computeCharacterFluidSeed(config = {}) {
  if (config.charFluidSeed !== undefined) return Number(config.charFluidSeed);
  if (config.materials?.charFluidSeed !== undefined) return Number(config.materials.charFluidSeed);
  const str = String(config.id || config.name || config.basePreset || config.faceArchetype || 'StudioDraft');
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return 1.13 + ((h >>> 0) % 8999) / 1000.0;
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
  rootGroup.userData.skinVariant = resolveLegacySkinVariantId(
    config.skinVariant || config.morphs?.skinVariant || presetBias.skinVariant || 'cn_porcelain_ivory'
  );
  rootGroup.userData.hairColor = config.hairColor || config.materials?.hairColorHex || '#121216';
  rootGroup.userData.deadExpression = config.deadExpression || config.morphs?.deadExpression || 'dead_calm';
  rootGroup.userData.neckClearance = Number(config.neckClearance ?? 0.45);

  const morphs = {
    ...(config.morphs || {}),
    faceArchetype: rootGroup.userData.faceArchetype,
    eyebrowStyle: rootGroup.userData.eyebrowStyle,
    skinVariant: rootGroup.userData.skinVariant,
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
  const charFluidSeed = computeCharacterFluidSeed(config);
  rootGroup.userData.charFluidSeed = charFluidSeed;

  const { colorTex, bumpTex } = createAnatomyTextures({
    skinColor: skinToneHex,
    vascularContrast,
    dermisRimScale: 1.0,
    anatomySeed: charFluidSeed,
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
  const gltf = isBuiltInAsset ? await getBuiltinHeadSceneClone(buf, config.groomLod || 'desktop') : await parseGlbBuffer(buf);

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
      const vCount = child.geometry.attributes.position.count;
      if (!child.geometry.getAttribute('aHairCov')) {
        child.geometry.setAttribute('aHairCov', new THREE.BufferAttribute(new Float32Array(vCount), 1));
      }
      if (!child.geometry.getAttribute('aHairDir')) {
        const initDir = new Float32Array(vCount * 3);
        for (let vi = 0; vi < vCount; vi++) initDir[vi * 3 + 1] = -1.0;
        child.geometry.setAttribute('aHairDir', new THREE.BufferAttribute(initDir, 3));
      }

      const rawSkinMap = child.material?.map || null;
      const skinNorm = child.material?.normalMap || null;
      if (rawSkinMap) {
        rawSkinMap.colorSpace = THREE.SRGBColorSpace;
        rawSkinMap.anisotropy = 16;
        rawSkinMap.generateMipmaps = true;
        rawSkinMap.minFilter = THREE.LinearMipmapLinearFilter;
        rawSkinMap.magFilter = THREE.LinearFilter;
        rawSkinMap.needsUpdate = true;
      }
      if (skinNorm) {
        skinNorm.anisotropy = 16;
        skinNorm.generateMipmaps = true;
        skinNorm.minFilter = THREE.LinearMipmapLinearFilter;
        skinNorm.magFilter = THREE.LinearFilter;
        skinNorm.needsUpdate = true;
      }
      const skinVariantId = rootGroup.userData.skinVariant || presetBias.skinVariant || 'cn_porcelain_ivory';
      rootGroup.userData.skinVariant = skinVariantId;
      const realSkinMap = realWebAssetsCache?.skins?.[skinVariantId] || rawSkinMap;
      if (realSkinMap) {
        realSkinMap.generateMipmaps = true;
        realSkinMap.minFilter = THREE.LinearMipmapLinearFilter;
        realSkinMap.magFilter = THREE.LinearFilter;
      }
      const skinMicro = createSkinMicroMaps();
      for (const texture of Object.values(skinMicro)) {
        if (texture?.isTexture) texture.userData.sharedSkinMicro = true;
      }
      const initRough = Math.max(0.28, Math.min(0.88, Number(config.skinRoughness ?? materials.skinRoughness ?? morphs.skinRoughness ?? 0.56)));
      const initNormScale = Math.max(0.0, Math.min(1.6, Number(config.normalMapStrength ?? materials.normalMapStrength ?? morphs.normalMapStrength ?? 0.34)));
      const skinMaterial = new THREE.MeshPhysicalMaterial({
        map: realSkinMap,
        normalMap: skinNorm,
        normalScale: new THREE.Vector2(initNormScale, initNormScale),
        roughnessMap: skinMicro.roughnessMap,
        color: new THREE.Color('#ffffff'),
        roughness: initRough,
        metalness: 0.0,
        sheen: 0.25,
        sheenRoughness: 0.65,
        sheenColor: new THREE.Color(1.0, 0.86, 0.80),
        clearcoat: 0.12,
        clearcoatRoughness: 0.36,
        specularIntensity: 0.65,
        specularColor: new THREE.Color(1.0, 0.98, 0.96),
        ior: 1.40,
        envMapIntensity: 0.72,
        emissive: new THREE.Color('#000000'),
        emissiveIntensity: 0.0,
      });
      skinMaterial.userData.customSkinRoughness = initRough;
      skinMaterial.userData.baseSkinMap = realSkinMap;
      skinMaterial.userData.baseNormalMap = skinNorm;
      skinMaterial.userData.baseRoughnessMap = skinMicro.roughnessMap;
      injectAestheticSubsurfaceScattering(skinMaterial, 0.88, {
        skinToneTint: computeSkinTintColor(skinToneHex),
        skinWarmthShift: Number(config.skinWarmthShift ?? materials.skinWarmthShift ?? morphs.skinWarmthShift ?? 0.0),
        skinBrightness: Number(config.skinBrightness ?? materials.skinBrightness ?? morphs.skinBrightness ?? 1.0),
        skinRosiness: Number(config.skinRosiness ?? materials.skinRosiness ?? morphs.skinRosiness ?? 0.25),
        poreScale: Number(config.poreScale ?? materials.poreScale ?? morphs.poreScale ?? 1.0),
        poreRelief: Number(config.poreRelief ?? materials.poreRelief ?? morphs.poreRelief ?? 0.24),
        tZoneOiliness: Number(config.tZoneOiliness ?? materials.tZoneOiliness ?? morphs.tZoneOiliness ?? 0.30),
        specularLobe: Number(config.specularLobe ?? materials.specularLobe ?? morphs.specularLobe ?? 0.45),
        charSssDepth: Number(config.charSssDepth ?? materials.charSssDepth ?? morphs.charSssDepth ?? 0.80),
        charSssColor: config.charSssColor || materials.charSssColor || morphs.charSssColor || '#e85a4f',
        vascularity: Number(config.vascularity ?? materials.vascularity ?? morphs.vascularity ?? 0.24),
        skinMicroMottle: Number(config.skinMicroMottle ?? materials.skinMicroMottle ?? morphs.skinMottle ?? 0.16),
        vellusFuzz: Number(config.vellusFuzz ?? materials.vellusFuzz ?? morphs.vellusFuzz ?? 0.36),
        lipCreaseDepth: Number(config.lipCreaseDepth ?? materials.lipCreaseDepth ?? morphs.lipCreaseDepth ?? 0.36),
        earTipFlush: Number(config.earTipFlush ?? materials.earTipFlush ?? morphs.earTipFlush ?? 0.32),
        blushColor: config.blushColor || materials.blushColor || '#f07682',
        blushStrength: Number(config.blushIntensity ?? materials.blushIntensity ?? 0.22),
        eyeshadowColor: config.eyeshadowColor || materials.eyeshadowColor || '#c88278',
        eyeshadowStrength: Number(config.eyeshadowIntensity ?? materials.eyeshadowIntensity ?? morphs.eyeshadowIntensity ?? 0.0),
        eyelinerStyle: Number(config.eyelinerStyle ?? materials.eyelinerStyle ?? morphs.eyelinerStyle ?? 0.0),
        eyelinerStrength: Number(config.eyelinerStrength ?? materials.eyelinerStrength ?? morphs.eyelinerStrength ?? 0.0),
        eyelinerColor: config.eyelinerColor || materials.eyelinerColor || morphs.eyelinerColor || '#2d201e',
        aegyoSalStrength: Number(config.aegyoSalStrength ?? materials.aegyoSalStrength ?? 0.16),
        darkCircleStrength: Number(config.darkCircleStrength ?? materials.darkCircleStrength ?? 0.0),
        lipColor: config.lipColor || materials.lipColor || '#cb5362',
        lipStrength: Number(config.lipStrength ?? materials.lipStrength ?? 0.38),
        lipGloss: Number(config.lipGloss ?? materials.lipGloss ?? morphs.lipGloss ?? 0.48),
        freckleStrength: Number(config.freckleStrength ?? materials.freckleStrength ?? 0.0),
        beautyMarkMode: Number(config.beautyMarkMode ?? materials.beautyMarkMode ?? 0.0),
        neckBloodStrength: Number(config.neckBloodStrength ?? materials.neckBloodStrength ?? morphs.neckBloodStrength ?? 0.85),
        nosebleedStrength: Number(config.nosebleedStrength ?? materials.nosebleedStrength ?? morphs.nosebleedStrength ?? 0.0),
        nosebleedMode: Number(config.nosebleedMode ?? materials.nosebleedMode ?? morphs.nosebleedMode ?? 0.0),
        tearTrackStrength: Number(config.tearTrackStrength ?? materials.tearTrackStrength ?? morphs.tearTrackStrength ?? 0.0),
        tearType: Number(config.tearType ?? materials.tearType ?? morphs.tearType ?? 0.0),
        mouthBloodStrength: Number(config.mouthBloodStrength ?? materials.mouthBloodStrength ?? morphs.mouthBloodStrength ?? 0.0),
        faceSplatterStrength: Number(config.faceSplatterStrength ?? materials.faceSplatterStrength ?? morphs.faceSplatterStrength ?? 0.0),
        charFluidSeed,
      });
      child.material = skinMaterial;
    } else if (matName === 'NeckCrossSection' || child.name === 'NeckCrossSection') {
      child.name = 'NeckCrossSectionCap';
      neckCapMesh = child;

      // Replace coarse 845-vertex cap with continuous 8,700-vertex 3D sculpted anatomical cross-section mesh (zero primitive balls/tori!)
      const highResGeo = buildHighResSculptedNeckCrossSectionGeometry(child);
      child.geometry = highResGeo;
      child.geometry.userData = child.geometry.userData || {};
      child.geometry.userData.parentHeadGroup = rootGroup;
      child.userData.basePositions = true;

      const oldAnatomy3D = child.getObjectByName('NeckAnatomy3DGroup');
      if (oldAnatomy3D) child.remove(oldAnatomy3D);

      const crossMat = new THREE.MeshPhysicalMaterial({
        map: colorTex,
        bumpMap: bumpTex,
        bumpScale: 0.014,
        roughness: 0.24,
        metalness: 0.0,
        clearcoat: 0.0,
        clearcoatRoughness: 0.20,
        ior: 1.44,
        specularIntensity: 0.72,
        envMapIntensity: 0.36,
        side: THREE.DoubleSide,
      });
      injectForensicCrossSectionShader(crossMat, wetness);
      child.material = crossMat;
    } else if (matName === 'Eye') {
      child.castShadow = false;
      child.receiveShadow = true;
      const eyeMap = child.material?.map || null;
      if (eyeMap) {
        eyeMap.colorSpace = THREE.SRGBColorSpace;
        eyeMap.anisotropy = 16;
      }
      const eyeMat = new THREE.MeshPhysicalMaterial({
        map: eyeMap,
        roughness: 0.02,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        specularIntensity: 0.92,
        ior: 1.376,
        envMapIntensity: 0.85,
      });
      eyeMat.userData.baseEyeMap = eyeMap;
      injectLifelikeEyeShader(eyeMat, {
        irisColor: config.irisColor || materials.irisColor || '#3b271e',
        irisColorMix: Number(config.irisColorMix ?? materials.irisColorMix ?? 0.88),
        irisScale: Number(config.irisScale ?? materials.irisScale ?? morphs.irisScale ?? 1.0),
        pupilSize: Number(config.pupilSize ?? materials.pupilSize ?? morphs.pupilSize ?? 1.0),
        irisBrightness: Number(config.irisBrightness ?? materials.irisBrightness ?? morphs.irisBrightness ?? 1.15),
        limbalRing: Number(config.limbalRing ?? materials.limbalRing ?? morphs.limbalRing ?? 0.80),
        eyeCatchlight: Number(config.eyeCatchlight ?? materials.eyeCatchlight ?? 0.85),
        scleraBrightness: Number(config.scleraBrightness ?? materials.scleraBrightness ?? 0.96),
        eyeClarity: Number(config.eyeClarity ?? materials.eyeClarity ?? 0.85),
        corneaWetness: Number(config.corneaWetness ?? materials.corneaWetness ?? morphs.corneaWetness ?? 0.92),
        scleraVeinIntensity: Number(config.scleraVeinIntensity ?? materials.scleraVeinIntensity ?? morphs.scleraVeinIntensity ?? 0.16),
        gazeYaw: Number(morphs.gazeYaw ?? 0),
        gazePitch: Number(morphs.gazePitch ?? 0),
      });
      child.material = eyeMat;
    } else if (matName === 'Cornea') {
      // Stage 56 · Master Cornea Specular-Preserving Reflection (画质提升/src/featureMaterials.js)
      // Base opacity is 0.04 (zero milky wash over iris!), while specular reflection is added to alpha (specL * 0.7)
      child.visible = true;
      child.castShadow = false;
      child.receiveShadow = false;
      child.material = upgradeEyeMaterial({ name: 'Cornea' });
    } else if (matName === 'Eyebrow') {
      child.castShadow = false;
      child.receiveShadow = true;
      child.userData.isEyebrowMesh = true;
      const browSpec = EYEBROW_STYLE_TO_MH_ASSET[rootGroup.userData.eyebrowStyle || 'cn_scholar_natural'] || EYEBROW_STYLE_TO_MH_ASSET.cn_scholar_natural;
      const realBrowAsset = realWebAssetsCache?.eyebrows?.[browSpec.assetId] || realWebAssetsCache?.eyebrows?.eyebrow001;
      const browMap = realBrowAsset?.texture || child.material?.map || null;
      if (browMap) browMap.colorSpace = THREE.SRGBColorSpace;
      const browColHex = config.browColor || materials.browColor || '#ffffff';
      const browOp = Number(config.browOpacity ?? materials.browOpacity ?? 0.92);
      rootGroup.userData.browColor = browColHex;
      rootGroup.userData.browOpacity = browOp;
      const browMat = new THREE.MeshStandardMaterial({
        name: 'PhotorealBrow',
        map: browMap,
        color: new THREE.Color(browColHex),
        roughness: 0.85,
        metalness: 0.0,
        envMapIntensity: 0.25,
        transparent: true,
        opacity: Math.min(0.95, browOp * 0.92),
        alphaTest: 0.0,
        alphaToCoverage: false,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        side: THREE.DoubleSide,
      });
      // Stage 67 · Master 25-Tap (5x5) Gaussian Feathering + Skin-Blend Roots (masterQuality/featureMaterials.js)
      browMat.onBeforeCompile = (shader) => {
        shader.vertexShader = 'varying vec3 vBrowLocalPos;\n' + shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvBrowLocalPos = position;'
        );
        shader.fragmentShader = 'varying vec3 vBrowLocalPos;\n' + shader.fragmentShader.replace(
          '#include <map_fragment>',
          `#include <map_fragment>
          #ifdef USE_MAP
          {
            vec2 texel = vec2(2.4 / 512.0);
            float sumA = 0.0;
            float wSum = 0.0;
            for (int x = -2; x <= 2; x++) {
              for (int y = -2; y <= 2; y++) {
                float w = exp(-0.35 * float(x * x + y * y));
                sumA += texture2D(map, vMapUv + vec2(float(x), float(y)) * texel).a * w;
                wSum += w;
              }
            }
            float a = sumA / wSum;
            float axB = abs(vBrowLocalPos.x);
            float innerFeather = smoothstep(0.0088, 0.0175, axB);
            float outerFeather = 1.0 - smoothstep(0.0468, 0.0552, axB);
            diffuseColor.rgb = mix(vec3(0.42, 0.31, 0.27), vec3(0.11, 0.085, 0.072) * diffuse, smoothstep(0.0, 0.48, a));
            diffuseColor.a = smoothstep(0.06, 0.55, a) * 0.68 * innerFeather * outerFeather * opacity;
          }
          #endif`
        );
      };
      browMat.customProgramCacheKey = () => 'photoreal-brow-v67';
      child.material = browMat;
    } else if (matName === 'Eyelash') {
      child.castShadow = false;
      child.receiveShadow = true;
      child.userData.isEyelashMesh = true;
      const lashMap = child.material?.map || null;
      if (lashMap) {
        lashMap.colorSpace = THREE.SRGBColorSpace;
        lashMap.anisotropy = 8;
      }
      const initLashDensity = Number(config.eyelashDensity ?? materials.eyelashDensity ?? morphs.eyelashDensity ?? 0.68);
      const lashMat = new THREE.MeshStandardMaterial({
        name: 'Eyelash',
        map: lashMap,
        color: new THREE.Color(config.lashColor || materials.lashColor || '#261d1a'),
        transparent: true,
        opacity: Math.max(0.0, Math.min(0.95, initLashDensity * 0.90)),
        alphaTest: 0.0,
        alphaToCoverage: false,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        roughness: 0.55,
        envMapIntensity: 0.30,
        side: THREE.DoubleSide,
      });
      // Stage 68 · Negative-LOD 3-Tap Max + Root Lashline & Lower-Lid Softening (masterQuality/featureMaterials.js v3)
      lashMat.onBeforeCompile = (shader) => {
        shader.vertexShader = 'varying float vLashLocalY;\n' + shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\nvLashLocalY = position.y;'
        );
        shader.fragmentShader = 'varying float vLashLocalY;\n' + shader.fragmentShader.replace(
          '#include <map_fragment>',
          `#include <map_fragment>
          #ifdef USE_MAP
          {
            vec2 lpx = vec2(1.0 / 512.0);
            float la = texture2D(map, vMapUv, -1.5).a;
            la = max(la, 0.8 * texture2D(map, vMapUv + vec2(lpx.x, 0.0), -1.5).a);
            la = max(la, 0.8 * texture2D(map, vMapUv - vec2(lpx.x, 0.0), -1.5).a);
            float lblur = texture2D(map, vMapUv, 2.5).a;
            float lashA = smoothstep(0.02, 0.32, la);
            float rootA = smoothstep(0.08, 0.35, lblur) * 0.62;
            float upperKeep = smoothstep(0.013, 0.019, vLashLocalY);
            diffuseColor.rgb = vec3(0.032, 0.024, 0.021) * diffuse;
            diffuseColor.a = clamp(max(lashA, rootA * 0.85) * mix(0.55, 1.0, upperKeep) * opacity, 0.0, 1.0);
          }
          #endif`
        );
      };
      lashMat.customProgramCacheKey = () => 'photoreal-lash-v68';
      child.material = lashMat;
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
    try {
      let guideLash = null;
      let guideBrow = null;
      gltf.scene.traverse((ch) => {
        if (!ch.isMesh) return;
        if (ch.userData?.isEyelashMesh || ch.material?.name === 'Eyelash') guideLash = ch;
        if (ch.userData?.isEyebrowMesh || ch.material?.name === 'PhotorealBrow') guideBrow = ch;
      });
      if (headSkinMesh && guideLash) {
        const lashStrandMat = createLashStrandMaterial();
        const eyeCenters = [
          { c: new THREE.Vector3(-0.0322, 0.0184, 0.0725) },
          { c: new THREE.Vector3(0.0322, 0.0184, 0.0725) },
        ];
        const lashRes = buildLashGeometry(headSkinMesh, eyeCenters, 0.0128, { guide: guideLash });
        if (lashRes?.geometry) {
          const lashStrandMesh = new THREE.Mesh(lashRes.geometry, lashStrandMat);
          lashStrandMesh.name = 'LashStrands';
          lashStrandMesh.renderOrder = 3;
          lashStrandMesh.castShadow = false;
          lashStrandMesh.receiveShadow = true;
          lashStrandMesh.morphTargetDictionary = guideLash.morphTargetDictionary;
          lashStrandMesh.morphTargetInfluences = guideLash.morphTargetInfluences;
          lashStrandMesh.position.copy(guideLash.position);
          lashStrandMesh.quaternion.copy(guideLash.quaternion);
          lashStrandMesh.scale.copy(guideLash.scale);
          guideLash.parent?.add(lashStrandMesh);
          guideLash.userData.lashStrandMesh = lashStrandMesh;
        }
        if (guideBrow && guideBrow.material?.map?.image) {
          const browRes = buildBrowGeometry(guideBrow, alphaSamplerFromTexture(guideBrow.material.map), { count: 1400 });
          if (browRes?.geometry) {
            const browStrandMesh = new THREE.Mesh(browRes.geometry, lashStrandMat);
            browStrandMesh.name = 'BrowStrands';
            browStrandMesh.renderOrder = 3;
            browStrandMesh.castShadow = false;
            browStrandMesh.receiveShadow = true;
            browStrandMesh.morphTargetDictionary = guideBrow.morphTargetDictionary;
            browStrandMesh.morphTargetInfluences = guideBrow.morphTargetInfluences;
            browStrandMesh.position.copy(guideBrow.position);
            browStrandMesh.quaternion.copy(guideBrow.quaternion);
            browStrandMesh.scale.copy(guideBrow.scale);
            guideBrow.parent?.add(browStrandMesh);
          }
        }
      }
    } catch (_) {}
  } else {
    modelContainer.add(fitImportedHead(gltf.scene));
  }

  applyHeadMorphsToGroup(rootGroup, morphs);
  await attachRealHairModel(rootGroup, config);
  rootGroup.userData.accessoriesReady = isBuiltInAsset;
  syncFaceAccessories(rootGroup, rootGroup.userData.currentMorphs);
  attachSpecimenContainerAndDecor(rootGroup, config);

  const gimbalGroup = buildGimbalOverlayGroup();
  rootGroup.add(gimbalGroup);
  rootGroup.userData.gimbalGroup = gimbalGroup;
  rootGroup.userData.headMesh = headSkinMesh;
  rootGroup.userData.capMesh = neckCapMesh;

  // Apply any initial material / photo-projection grading
  updateCollectibleMaterialsLive(rootGroup, {
    ...materials,
    ...config,
    ...(config.morphs || {}),
  });

  return rootGroup;
}

const photoProjTexCache = new Map();
function loadPhotoProjectionTexture(url, onLoaded) {
  if (!url || typeof Image === 'undefined') return null;
  // Default portrait projection must use the same embedded assets as the HUD.
  // file:// cannot fetch /models/... from the OS filesystem.
  if (typeof window !== 'undefined') {
    const photoPath = String(url).replace(/^\.\//, '/');
    if (photoPath === '/models/fang_yaoping_ref.jpg' && window.__EMBEDDED_FANG_PHOTO__) url = window.__EMBEDDED_FANG_PHOTO__;
    if (/^\/models\/(user_photo_ref|chuxia_life_ref)\.(jpg|png)$/.test(photoPath) && window.__EMBEDDED_REF_PHOTO__) url = window.__EMBEDDED_REF_PHOTO__;
    if (photoPath === '/models/linxi_life_ref.jpg' && window.__EMBEDDED_LINXI_PHOTO__) url = window.__EMBEDDED_LINXI_PHOTO__;
  }
  if (photoProjTexCache.has(url)) {
    const cached = photoProjTexCache.get(url);
    if (onLoaded) onLoaded(cached);
    return cached;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  const tex = new THREE.Texture(img);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.userData = { sharedSkinMicro: true };
  photoProjTexCache.set(url, tex);
  img.onload = () => {
    tex.needsUpdate = true;
    if (onLoaded) onLoaded(tex);
  };
  img.src = url;
  return tex;
}

const customMapTexCache = new Map();
function loadCustomCharacterTexture(url, isColor = true, onLoaded) {
  if (!url || typeof Image === 'undefined') return null;
  const cacheKey = `${isColor ? 'srgb' : 'lin'}:${url}`;
  if (customMapTexCache.has(cacheKey)) {
    const cached = customMapTexCache.get(cacheKey);
    if (onLoaded) onLoaded(cached);
    return cached;
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  const tex = new THREE.Texture(img);
  tex.flipY = false;
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 16;
  tex.userData = { sharedSkinMicro: true, customCharTex: true };
  customMapTexCache.set(cacheKey, tex);
  img.onload = () => {
    tex.needsUpdate = true;
    if (onLoaded) onLoaded(tex);
  };
  img.src = url;
  return tex;
}

/**
 * Stage 44 · Zero-Latency Live GPU Material, Custom Texture Maps, Dermis Realism, Eyeliner & Iris Updater
 * Updates all skin, custom textures, subsurface scattering, micro-pores, eyeliner, iris, eyebrow,
 * and cross-section parameters in 0ms without reloading or rebuilding the 3D GLB model!
 */
export function updateCollectibleMaterialsLive(rootGroup, patch = {}) {
  if (!rootGroup) return;
  rootGroup.userData.liveMaterials = {
    ...(rootGroup.userData.liveMaterials || {}),
    ...patch,
  };
  const m = rootGroup.userData.liveMaterials;

  if (patch.browColor !== undefined) rootGroup.userData.browColor = patch.browColor;
  if (patch.browOpacity !== undefined) rootGroup.userData.browOpacity = Number(patch.browOpacity);

  // If hair color / ombre / highlight / feather keys are in patch, update HairGroup live in 0ms!
  if (
    patch.hairColor !== undefined ||
    patch.hairTipColor !== undefined ||
    patch.hairHighlightColor !== undefined ||
    patch.hairHighlightStrength !== undefined ||
    patch.hairOmbreMix !== undefined ||
    patch.hairWispyFeather !== undefined
  ) {
    rootGroup.userData.currentMorphs = {
      ...(rootGroup.userData.currentMorphs || {}),
      ...patch,
    };
    updateHairDesignOnGroup(rootGroup, patch);
  }

  rootGroup.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    const mat = child.material;

    // 1. HeadSkinMesh: True-Dermis, Custom Texture Maps & Makeup Grading Uniforms
    if (child.name === 'HeadSkinMesh' && mat.userData?.skinGradingUniforms) {
      const u = mat.userData.skinGradingUniforms;
      if (m.skinTone || m.skinToneHex) {
        u.uSkinToneTint.value.copy(computeSkinTintColor(m.skinTone || m.skinToneHex));
      }
      const warmth = m.skinWarmthShift ?? m.skinWarmth;
      if (warmth !== undefined) u.uSkinWarmthShift.value = Number(warmth);
      if (m.skinBrightness !== undefined) u.uSkinBrightness.value = Number(m.skinBrightness);
      if (m.skinRosiness !== undefined) u.uSkinRosiness.value = Number(m.skinRosiness);
      if (m.poreScale !== undefined && u.uPoreScale) u.uPoreScale.value = Number(m.poreScale);
      if (m.poreRelief !== undefined) {
        // Character edits update the base, not the temporary modulated result.
        const basePore = Number(m.poreRelief);
        mat.userData.baseVisualPoreRelief = basePore;
        const factor = mat.userData.visualPoreFactor;
        u.uPoreRelief.value = factor !== undefined ? Math.min(1, basePore * factor) : basePore;
      }
      if (m.tZoneOiliness !== undefined && u.uTZoneOiliness) u.uTZoneOiliness.value = Number(m.tZoneOiliness);
      if (m.specularLobe !== undefined && u.uSpecularLobe) u.uSpecularLobe.value = Number(m.specularLobe);
      if (m.charSssDepth !== undefined && u.uCharSssDepth) u.uCharSssDepth.value = Number(m.charSssDepth);
      if (m.charSssColor && u.uCharSssColor) u.uCharSssColor.value.set(m.charSssColor);
      if (m.vascularity !== undefined && u.uVascularity) u.uVascularity.value = Number(m.vascularity);
      const mottle = m.skinMicroMottle ?? m.skinMottle;
      if (mottle !== undefined) u.uSkinMicroMottle.value = Number(mottle);
      if (m.vellusFuzz !== undefined && u.uVellusFuzz) u.uVellusFuzz.value = Number(m.vellusFuzz);
      if (m.lipCreaseDepth !== undefined && u.uLipCreaseDepth) u.uLipCreaseDepth.value = Number(m.lipCreaseDepth);
      if (m.earTipFlush !== undefined && u.uEarTipFlush) u.uEarTipFlush.value = Number(m.earTipFlush);

      if (m.skinRoughness !== undefined) {
        const rVal = Math.max(0.18, Math.min(0.88, Number(m.skinRoughness)));
        mat.roughness = THREE.MathUtils.lerp(rVal, Math.max(rVal, 0.54), mat.userData.visualMatteAmount || 0);
        mat.userData.customSkinRoughness = rVal;
      }
      if (m.normalMapStrength !== undefined && mat.normalScale) {
        const ns = Math.max(0.0, Math.min(1.8, Number(m.normalMapStrength)));
        mat.normalScale.set(ns, ns);
      }

      // Per-Character Custom Uploaded Texture Maps (or restore built-in map when cleared to '')
      if (patch.customSkinMapUrl !== undefined) {
        if (patch.customSkinMapUrl) {
          loadCustomCharacterTexture(patch.customSkinMapUrl, true, (tex) => {
            mat.map = tex;
            mat.needsUpdate = true;
          });
        } else if (mat.userData.baseSkinMap) {
          mat.map = mat.userData.baseSkinMap;
          mat.needsUpdate = true;
        }
      }
      if (patch.customNormalMapUrl !== undefined) {
        if (patch.customNormalMapUrl) {
          loadCustomCharacterTexture(patch.customNormalMapUrl, false, (tex) => {
            mat.normalMap = tex;
            mat.needsUpdate = true;
          });
        } else if (mat.userData.baseNormalMap !== undefined) {
          mat.normalMap = mat.userData.baseNormalMap;
          mat.needsUpdate = true;
        }
      }
      if (patch.customRoughnessMapUrl !== undefined) {
        if (patch.customRoughnessMapUrl) {
          loadCustomCharacterTexture(patch.customRoughnessMapUrl, false, (tex) => {
            mat.roughnessMap = tex;
            mat.needsUpdate = true;
          });
        } else if (mat.userData.baseRoughnessMap !== undefined) {
          mat.roughnessMap = mat.userData.baseRoughnessMap;
          mat.needsUpdate = true;
        }
      }

      if (m.blushColor) u.uBlushColor.value.set(m.blushColor);
      if (m.blushIntensity !== undefined) u.uBlushStrength.value = Number(m.blushIntensity);
      if (m.eyeshadowColor) u.uEyeshadowColor.value.set(m.eyeshadowColor);
      if (m.eyeshadowIntensity !== undefined) u.uEyeshadowStrength.value = Number(m.eyeshadowIntensity);
      if (m.eyelinerStyle !== undefined && u.uEyelinerStyle) u.uEyelinerStyle.value = Number(m.eyelinerStyle);
      if (m.eyelinerStrength !== undefined && u.uEyelinerStrength) u.uEyelinerStrength.value = Number(m.eyelinerStrength);
      if (m.eyelinerColor && u.uEyelinerColor) u.uEyelinerColor.value.set(m.eyelinerColor);
      const aegyo = m.aegyoSalStrength ?? m.aegyoSal;
      if (aegyo !== undefined) u.uAegyoSalStrength.value = Number(aegyo);
      const darkCirc = m.darkCircleStrength ?? m.darkCircles;
      if (darkCirc !== undefined) u.uDarkCircleStrength.value = Number(darkCirc);
      if (m.lipColor) u.uLipColor.value.set(m.lipColor);
      if (m.lipStrength !== undefined) u.uLipStrength.value = Number(m.lipStrength);
      if (m.lipGloss !== undefined) u.uLipGloss.value = Number(m.lipGloss);
      const freck = m.freckleStrength ?? m.freckles;
      if (freck !== undefined) u.uFreckleStrength.value = Number(freck);
      const bMark = m.beautyMarkMode ?? m.beautyMark;
      if (bMark !== undefined) u.uBeautyMarkMode.value = Number(bMark);

      if (m.neckBloodStrength !== undefined && u.uNeckBloodStrength) u.uNeckBloodStrength.value = Number(m.neckBloodStrength);
      if (m.nosebleedStrength !== undefined && u.uNosebleedStrength) u.uNosebleedStrength.value = Number(m.nosebleedStrength);
      if (m.nosebleedMode !== undefined && u.uNosebleedMode) u.uNosebleedMode.value = Number(m.nosebleedMode);
      if (m.tearTrackStrength !== undefined && u.uTearTrackStrength) u.uTearTrackStrength.value = Number(m.tearTrackStrength);
      if (m.tearType !== undefined && u.uTearType) u.uTearType.value = Number(m.tearType);
      if (m.mouthBloodStrength !== undefined && u.uMouthBloodStrength) u.uMouthBloodStrength.value = Number(m.mouthBloodStrength);
      if (m.faceSplatterStrength !== undefined && u.uFaceSplatterStrength) u.uFaceSplatterStrength.value = Number(m.faceSplatterStrength);
      if (m.charFluidSeed !== undefined && u.uCharFluidSeed) u.uCharFluidSeed.value = Number(m.charFluidSeed);

      const projStr = m.photoProjStrength ?? m.photoBlend;
      if (projStr !== undefined) {
        u.uPhotoProjStrength.value = Number(projStr);
        if (Number(projStr) > 0.005) u.uPhotoProjEnabled.value = 1.0;
      }
      if (m.photoProjScale !== undefined) u.uPhotoProjScale.value = Number(m.photoProjScale);
      if (m.photoProjOffsetX !== undefined || m.photoProjOffsetY !== undefined) {
        u.uPhotoProjOffset.value.set(
          Number(m.photoProjOffsetX ?? u.uPhotoProjOffset.value.x),
          Number(m.photoProjOffsetY ?? u.uPhotoProjOffset.value.y)
        );
      }
      const photoUrl = m.photoUrl || m.photoProjectionUrl || m.lifePhotoUrl;
      if (photoUrl) {
        loadPhotoProjectionTexture(photoUrl, (tex) => {
          u.uPhotoProjMap.value = tex;
          if (u.uPhotoProjStrength.value > 0.005) u.uPhotoProjEnabled.value = 1.0;
        });
      } else if (m.photoElement) {
        const tex = new THREE.Texture(m.photoElement);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.needsUpdate = true;
        tex.userData = { sharedSkinMicro: true };
        u.uPhotoProjMap.value = tex;
        if (u.uPhotoProjStrength.value > 0.005) u.uPhotoProjEnabled.value = 1.0;
      }
    }

    // 2. Eye Mesh: Iris Color, Scale, Pupil Dilation, Brightness, Limbal Ring, Cornea Wetness, Sclera Veins & Custom Iris Texture
    if (mat.userData?.eyeUniforms) {
      const eu = mat.userData.eyeUniforms;
      if (patch.customIrisMapUrl !== undefined) {
        if (patch.customIrisMapUrl) {
          loadCustomCharacterTexture(patch.customIrisMapUrl, true, (tex) => {
            mat.map = tex;
            mat.needsUpdate = true;
            eu.uIrisColorMix.value = 0.25;
          });
        } else if (mat.userData.baseEyeMap !== undefined) {
          mat.map = mat.userData.baseEyeMap;
          mat.needsUpdate = true;
          eu.uIrisColorMix.value = 0.88;
        }
      }
      const imix = m.irisColorMix ?? m.irisMix;
      if (m.irisColor) {
        eu.uIrisColor.value.set(m.irisColor);
        if (imix === undefined && !m.customIrisMapUrl) eu.uIrisColorMix.value = 0.88;
      }
      if (imix !== undefined) eu.uIrisColorMix.value = Number(imix);
      if (m.irisScale !== undefined) eu.uIrisScale.value = Number(m.irisScale);
      if (m.pupilSize !== undefined) eu.uPupilScale.value = Number(m.pupilSize);
      if (m.irisBrightness !== undefined && eu.uIrisBrightness) eu.uIrisBrightness.value = Number(m.irisBrightness);
      if (m.limbalRing !== undefined && eu.uLimbalRing) eu.uLimbalRing.value = Number(m.limbalRing);
      if (m.eyeSpacing !== undefined && eu.uEyeSpacing) eu.uEyeSpacing.value = Number(m.eyeSpacing);
      if (m.eyeCatchlight !== undefined) eu.uCatchlightStrength.value = Number(m.eyeCatchlight);
      if (m.scleraBrightness !== undefined) eu.uScleraBrightness.value = Number(m.scleraBrightness);
      if (m.eyeClarity !== undefined && eu.uEyeClarity) eu.uEyeClarity.value = Number(m.eyeClarity);
      if (m.corneaWetness !== undefined && eu.uCorneaWetness) eu.uCorneaWetness.value = Number(m.corneaWetness);
      if (m.scleraVeinIntensity !== undefined && eu.uScleraVeinIntensity) eu.uScleraVeinIntensity.value = Number(m.scleraVeinIntensity);
      if (m.gazeYaw !== undefined || m.gazePitch !== undefined) {
        eu.uGazeOffset.value.set(
          Number(m.gazeYaw ?? 0) * 0.24,
          Number(m.gazePitch ?? 0) * 0.22
        );
      }
    }

    // 2B. Eyelash Mesh: Live Density / Opacity & Color (zero solid black root band)
    if (child.name === 'Eyelashes' || mat.name === 'Eyelash' || child.userData?.isEyelashMesh) {
      if (m.eyelashDensity !== undefined) {
        const dVal = Math.max(0.0, Math.min(1.2, Number(m.eyelashDensity)));
        mat.opacity = Math.max(0.0, Math.min(0.92, dVal * 0.72));
        child.visible = dVal > 0.02;
      }
      if (m.lashColor) {
        mat.color.set(m.lashColor);
      }
    }

    // 3. Eyebrow Mesh: Live Tint & Opacity
    if (child.userData?.isEyebrowMesh || mat.name === 'Eyebrow') {
      if (m.browColor) mat.color.set(m.browColor);
      if (m.browOpacity !== undefined) mat.opacity = Math.max(0.15, Math.min(1.0, Number(m.browOpacity)));
    }

    // 4. NeckCrossSectionCap: Live Wetness (spatially-varying roughness driven by injectForensicCrossSectionShader)
    if (child.name === 'NeckCrossSectionCap' && m.wetness !== undefined) {
      const w = Number(m.wetness);
      mat.roughness = 0.24;
      mat.clearcoat = 0.0;
      if (mat.userData?.uCrossWetness) mat.userData.uCrossWetness.value = w;
    }
  });

  // 5. HairGroup: Live 0ms Hair Color, Tip Ombre Color, Ombre Mix & Sheen Update
  if (
    m.hairColor !== undefined ||
    m.hairTipColor !== undefined ||
    m.hairOmbreMix !== undefined ||
    m.hairHighlightColor !== undefined ||
    m.hairHighlightStrength !== undefined ||
    m.hairSheen !== undefined
  ) {
    // When user explicitly picks a new base hairColor without specifying a new tip color,
    // also align tip color if it was still on a default preset so the whole hair visibly changes color
    if (m.hairColor && !m.hairTipColor) {
      rootGroup.userData.hairTipColor = m.hairColor;
      if (rootGroup.userData.currentMorphs) {
        rootGroup.userData.currentMorphs.hairTipColor = m.hairColor;
      }
    }
    updateHairDesignOnGroup(rootGroup, m);
  }
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
