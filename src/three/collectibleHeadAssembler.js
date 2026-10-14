import * as THREE from 'three';
import { injectArtistHairLighting, updateArtistHairFlow } from './artistHairLighting.js';
import { refineArtistHairCards } from './hairCardSubdivision.js';
import { fitArtistHairOutsideScalp } from './hairScalpFit.js';
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

let _builtinHeadTemplatePromise = null;
async function getBuiltinHeadSceneClone(buf) {
  if (!_builtinHeadTemplatePromise) {
    _builtinHeadTemplatePromise = parseGlbBuffer(buf).then((gltf) => {
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
    });
  }
  const templateGltf = await _builtinHeadTemplatePromise;
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
  cn_scholar_natural:  { assetId: 'eyebrow012', browDown: 0.0, browUp: 0.08 },
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
  cn_oval_scholar:      { skinVariant: 'cn_scholar_natural',    headBlend: { ...PURE_ZERO_BLEND } },
  cn_round_babyface:    { skinVariant: 'kr_dewy_peach',         headBlend: { ...PURE_ZERO_BLEND, blend_cn_baby: 0.18 } },
  kr_idol_vline:        { skinVariant: 'kr_chaebol_cool',       headBlend: { ...PURE_ZERO_BLEND, blend_kr_vline: 0.22 } },
  cn_classical_melon:   { skinVariant: 'cn_jiangnan_jade',      headBlend: { ...PURE_ZERO_BLEND, blend_cn_melon: 0.20 } },
  kr_sweet_heart:       { skinVariant: 'kr_firstlove_camellia', headBlend: { ...PURE_ZERO_BLEND, blend_kr_vline: 0.16 } },
  cn_cold_royal:        { skinVariant: 'cn_intellectual_olive', headBlend: { ...PURE_ZERO_BLEND, blend_cn_royal: 0.18 } },
  cn_pure_campus_bell:  { skinVariant: 'cn_porcelain_ivory',    headBlend: { ...PURE_ZERO_BLEND, blend_asian_youth: 0.20 } },
  kr_waterglow_idol:    { skinVariant: 'kr_dewy_peach',         headBlend: { ...PURE_ZERO_BLEND, blend_asian_youth: 0.18 } },
  cn_tang_peony:        { skinVariant: 'cn_jiangnan_jade',      headBlend: { ...PURE_ZERO_BLEND, blend_cn_scholar: 0.18 } },
  eurasian_sculpted_mix:{ skinVariant: 'eurasian_velvet_rose',  headBlend: { ...PURE_ZERO_BLEND, blend_eurasian: 0.25 } },
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
          let texSource = img;
          if (!isOpaque && typeof document !== 'undefined') {
            try {
              const c = document.createElement('canvas');
              c.width = img.width || 256;
              c.height = img.height || 256;
              const ctx = c.getContext('2d');
              ctx.drawImage(img, 0, 0, c.width, c.height);
              const imgData = ctx.getImageData(0, 0, c.width, c.height);
              const d = imgData.data;
              for (let i = 0; i < d.length; i += 4) {
                const aNorm = d[i + 3] / 255.0;
                // Lift near-black MakeHuman eyebrow pixels to natural soft charcoal-taupe
                // and feather alpha so eyebrows never render as heavy pitch-black blocks!
                d[i]     = Math.min(255, Math.round(92 + d[i] * 0.45));
                d[i + 1] = Math.min(255, Math.round(74 + d[i + 1] * 0.42));
                d[i + 2] = Math.min(255, Math.round(68 + d[i + 2] * 0.40));
                d[i + 3] = Math.min(220, Math.round(Math.pow(aNorm, 1.35) * 185));
              }
              ctx.putImageData(imgData, 0, 0);
              texSource = c;
            } catch (_) {}
          }
          const tex = new THREE.Texture(texSource);
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
        child.material.opacity = Math.min(0.88, Number(rootGroup.userData.browOpacity ?? 0.78));
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
          // Snuggle -0.65mm closer to the brow ridge so eyebrows never float like a sticker
          out[i + 2] = bz - 0.00065;
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
      u.uHairWispyFeather.value = wispyFeather;
      u.uHairOmbreMix.value = ombreMix;
      u.uHairTipColor.value.copy(tipCol);
      if (u.uHairHighlightColor) u.uHairHighlightColor.value.copy(highlightCol);
      if (u.uHairHighlightStrength) u.uHairHighlightStrength.value = highlightStr;
    }
    if (!child.isMesh || !child.geometry?.attributes?.position) return;
    if (child.name === 'ScalpRootFeatherCap') return;
    const geo = child.geometry;
    if (visitedGeos.has(geo)) return;
    visitedGeos.add(geo);

    const posAttr = geo.attributes.position;
    if (!geo.userData.basePositions) {
      geo.userData.basePositions = Float32Array.from(posAttr.array);
    }
    const signature = JSON.stringify([bangsLen,bangsPart,hairVol,hairLen,sideburn,hairFlare,hairCurlWave,neckClear,topCrownStyle,frontBangsStyle,sideLocksStyle]);
    if (geo.userData.hairShapeSignature === signature) return;
    geo.userData.hairShapeSignature = signature;
    if (!geo.userData.baseHairNormals && geo.attributes.normal) geo.userData.baseHairNormals = Float32Array.from(geo.attributes.normal.array);
    const base = geo.userData.basePositions;
    const out = posAttr.array;
    const count = posAttr.count;
    const isModularDonor = Boolean(child.userData?.isModularPart);

    // Compute effective crown volume boost from modular topCrownStyle
    const crownBoost = topCrownStyle === 'fluffy_high_crown' ? 0.28 : (topCrownStyle === 'photo_sleek_crown' ? -0.12 : 0.0);
    const effHairVol = hairVol + crownBoost;

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

    if (child.material?.userData?.builtInHair) fitArtistHairOutsideScalp(geo, rootGroup.getObjectByName('HeadSkinMesh'));
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
  const nextMorphs = {
    ...(rootGroup.userData.currentMorphs || {}),
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
  return {
    blend_asian_youth: Number(m.blend_asian_youth ?? def.blend_asian_youth ?? 0.0),
    blend_cn_scholar:  Number(m.blend_cn_scholar  ?? def.blend_cn_scholar  ?? 0.0),
    blend_cn_baby:     Number(m.blend_cn_baby     ?? def.blend_cn_baby     ?? 0.0),
    blend_kr_vline:    Number(m.blend_kr_vline    ?? def.blend_kr_vline    ?? 0.0),
    blend_cn_melon:    Number(m.blend_cn_melon    ?? def.blend_cn_melon    ?? 0.0),
    blend_cn_royal:    Number(m.blend_cn_royal    ?? def.blend_cn_royal    ?? 0.0),
    blend_eurasian:    Number(m.blend_eurasian    ?? def.blend_eurasian    ?? 0.0),
  };
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
  const wAsianYouth = clampBlend(m.blend_asian_youth ?? defBlend.blend_asian_youth ?? 0.0);
  const wCnScholar  = clampBlend(m.blend_cn_scholar  ?? defBlend.blend_cn_scholar  ?? 0.0);
  const wCnBaby     = clampBlend(m.blend_cn_baby     ?? defBlend.blend_cn_baby     ?? 0.0);
  const wKrVline    = clampBlend(m.blend_kr_vline    ?? defBlend.blend_kr_vline    ?? 0.0);
  const wCnMelon    = clampBlend(m.blend_cn_melon    ?? defBlend.blend_cn_melon    ?? 0.0);
  const wCnRoyal    = clampBlend(m.blend_cn_royal    ?? defBlend.blend_cn_royal    ?? 0.0);
  const wEurasian   = clampBlend(m.blend_eurasian    ?? defBlend.blend_eurasian    ?? 0.0);

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

  // Stage 43: Full-range [-1.5, +1.5] facial, cranial & 14-parameter eye shape/optics fine-tuning
  const clampHarmony = (val, maxAbs = 1.35) => Math.max(-maxAbs, Math.min(maxAbs, Number(val) || 0));

  const jawV = clampHarmony((m.jawVLine ?? -(m.jawWidth ?? bias.jawVLine)) + 0.24);
  const chin = clampHarmony((m.chinLength ?? bias.chinLength) - 0.08);
  const cheek = clampHarmony(m.cheekSoftness ?? m.cheekboneFullness ?? bias.cheekSoftness);
  const nose = clampHarmony(m.noseBridge ?? m.noseBridgeHeight ?? bias.noseBridge);
  const noseW = clampHarmony((m.noseWidth ?? (-nose * 0.35)) - 0.24);
  // Keep eyeSize and eyeAlmond independent so eyeSize is NEVER shadowed when eyeAlmond === 0!
  const eyeSizeVal = clampHarmony(m.eyeSize ?? 0.0, 1.5);
  const eyeApertureVal = clampHarmony(m.eyeAperture ?? 0.0, 1.5);
  const eyeAlmondVal = clampHarmony(m.eyeAlmond ?? bias.eyeAlmond ?? 0.0, 1.5);
  const eye = clampHarmony(eyeSizeVal * 1.15 + eyeAlmondVal * 0.65, 1.65);
  const eyeTilt = clampHarmony(m.eyeTilt ?? bias.eyeTilt, 1.5);
  const eyeSpacingVal = clampHarmony(m.eyeSpacing ?? 0.0, 1.2);
  const eyelidOpen = clampHarmony(m.eyelidOpen ?? 0, 1.5);
  const browH = clampHarmony(m.browHeight ?? 0);
  const lip = clampHarmony((m.lipFullness ?? bias.lipFullness) - 0.14, 0.95);
  const mouthSmile = clampHarmony(m.mouthSmile ?? 0, 0.95);
  const forehead = clampHarmony(m.foreheadHeight ?? 0, 0.95);
  const ear = clampHarmony(m.earSize ?? 0, 0.95);
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
  const calmLidRelax = exprId === 'dead_calm' ? 0.08 : 0.0;
  const eyeCloseVal = Math.max(0, Math.min(1.0, Number(m.eyeClose ?? calmLidRelax) + Math.max(0, -eyelidOpen * 0.72) + Math.max(0, -eyeApertureVal * 0.65)));
  const eyeWideVal = Math.max(0, Math.min(0.65, Number(m.eyeWide ?? 0) + Math.max(0, eyelidOpen * 0.65) + Math.max(0, eyeApertureVal * 0.55)));

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
    face_eye_tilt_incr: eyeTilt > 0 ? eyeTilt * 0.85 : 0,
    face_eye_tilt_decr: eyeTilt < 0 ? -eyeTilt * 0.85 : 0,
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
  const sheen = Number.isFinite(n) ? THREE.MathUtils.clamp(n, 0, 1) : 0.45;
  material.roughness = 0.70 - sheen * 0.16;
  material.specularIntensity = sheen * 0.42;
  material.anisotropy = 0; // No metal-like GGX streaks with unknown/mirrored card tangents.
  material.sheen = 0;
  material.clearcoat = 0;
  material.envMapIntensity = 0.18;
}

export function updateHairSheen(node, value) {
  if (!node) return;
  const n = Number(value);
  const sheen = Number.isFinite(n) ? THREE.MathUtils.clamp(n, 0, 1) : 0.45;
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
  const legacyDarkSet = new Set(['#191518', '#1a151c', '#181418', '#22171b', '#261a16', '#171417', '#121216', '#111216']);
  if (legacyDarkSet.has(normalizedHex)) {
    return new THREE.Color('#1b1b1e');
  }
  const baseColor = new THREE.Color(normalizedHex);
  const lum = 0.299 * baseColor.r + 0.587 * baseColor.g + 0.114 * baseColor.b;
  if (lum < 0.05) {
    return new THREE.Color('#1b1b1e');
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

/** Stable artist-card shading, NOT a Marschner fiber BSDF.
 * Preserve authored normals, UVs and alpha. Let Three's scene lights provide all
 * illumination: no fixed-light additive glints, spherical tangent or emissive floor.
 */
function injectArtistHairColor(material, hairShaderParams = {}) {
  const uniforms = {
    uHairWispyFeather: { value: Number(hairShaderParams.hairWispyFeather ?? 0.45) },
    uHairUseCoverage: { value: 1 },
    uHairOmbreMix: { value: Number(hairShaderParams.hairOmbreMix ?? 0) },
    uHairTipColor: { value: new THREE.Color(hairShaderParams.hairTipColor || '#4a3528') },
    uHairHighlightColor: { value: new THREE.Color('#9e6b52') },
    uHairHighlightStrength: { value: 0 },
  };
  material.userData.hairShaderUniforms = uniforms;
  material.customProgramCacheKey = () => 'artist-hair-azimuth-coverage-v43';
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
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      #ifdef USE_MAP
        vec4 hairTexel = texture2D(map, vMapUv);
        // Artist atlas already contains the strand flow. Don't paint sine waves on it.
        float lockValue = sqrt(clamp(dot(hairTexel.rgb, vec3(0.2126,0.7152,0.0722)), 0.0, 1.0));
        float tips = smoothstep(0.12, 0.88, clamp((0.038-vHairLocalPos.y)/0.095,0.0,1.0));
        vec3 tint = mix(diffuse, uHairTipColor, tips * uHairOmbreMix);
        tint = mix(tint, uHairHighlightColor, smoothstep(0.55,0.9,lockValue)*uHairHighlightStrength);
        diffuseColor.rgb = tint * mix(0.48, 2.05, lockValue);
        // Thinning follows the existing strand coverage, never a screen-space noise mask.
        float coverage = hairTexel.a;
        coverage *= 1.0 - 0.25 * uHairWispyFeather * (1.0 - coverage);
        diffuseColor.a *= coverage;
      #endif
    `);
    // Three's default A2C alpha-test turns every alpha > .12 into opaque.
    // Preserve the artist coverage on MSAA targets instead of solid black strips.
    shader.fragmentShader = shader.fragmentShader.replace('#include <alphatest_fragment>', `
      #ifdef USE_ALPHATEST
        if (uHairUseCoverage > 0.5) {
          if (diffuseColor.a < 0.015) discard;
        } else {
          // Stable cutout fallback: no temporal noise / hashed transparency.
          if (diffuseColor.a < 0.38) discard;
          diffuseColor.a = 1.0;
        }
      #endif
    `);
    injectArtistHairLighting(shader);
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
    // Strictly keep cap behind upper hairline (never cover the forehead or brow area!)
    if (ym > 0.030 && zm < 0.048 && (zm < 0.032 || ym > 0.066)) {
      capIndices.push(a, b, c);
    }
  }
  if (capIndices.length === 0) return null;

  const capGeo = new THREE.BufferGeometry();
  const newPos = new Float32Array(pos.array.length);
  const colors = new Float32Array(pos.count * 4);
  const hcX = 0.0, hcY = 0.02, hcZ = -0.01;
  const baseR = displayColor.r * 0.68;
  const baseG = displayColor.g * 0.65;
  const baseB = displayColor.b * 0.65;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const dx = x - hcX, dy = y - hcY, dz = z - hcZ;
    const len = Math.hypot(dx, dy, dz) || 1.0;
    newPos[i * 3] = x + (dx / len) * 0.00035;
    newPos[i * 3 + 1] = y + (dy / len) * 0.00035;
    newPos[i * 3 + 2] = z + (dz / len) * 0.00035;

    // Smoothly feather vertex alpha to 0.0 near the front forehead hairline & side temples
    const fadeY = Math.min(1.0, Math.max(0.0, (y - 0.034) / 0.026));
    const fadeFront = Math.min(1.0, Math.max(0.0, (0.045 - z) / 0.028));
    const fadeTemple = Math.min(1.0, Math.max(0.0, (0.068 - Math.abs(x)) / 0.018));
    const alpha = fadeY * fadeFront * (z > 0.005 ? fadeTemple : 1.0) * 0.82;

    colors[i * 4] = baseR;
    colors[i * 4 + 1] = baseG;
    colors[i * 4 + 2] = baseB;
    colors[i * 4 + 3] = alpha;
  }
  capGeo.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
  capGeo.setAttribute('color', new THREE.BufferAttribute(colors, 4));
  if (headGeo.attributes.normal) {
    capGeo.setAttribute('normal', headGeo.attributes.normal);
  }
  capGeo.setIndex(capIndices);

  const capMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#ffffff'),
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
  const capMesh = new THREE.Mesh(capGeo, capMat);
  capMesh.name = 'ScalpRootFeatherCap';
  capMesh.renderOrder = 0;
  return capMesh;
}

const MODULAR_BANGS_DONORS = {
  wispy_air:    { style: 'hair_user_photo',       filter: (x, y, z) => z > 0.044 && y > 0.012 && y < 0.092 && Math.abs(x) < 0.062 },
  curtain_part: { style: 'daz_hair_curtain_wave', filter: (x, y, z) => z > 0.036 && y > 0.002 && y < 0.095 && Math.abs(x) < 0.068 },
  hime_blunt:   { style: 'daz_hair_hime',         filter: (x, y, z) => z > 0.048 && y > 0.015 && y < 0.092 && Math.abs(x) < 0.056 },
  side_swept:   { style: 'daz_hair_side_long',    filter: (x, y, z) => z > 0.038 && y > 0.008 && y < 0.095 && Math.abs(x) < 0.066 },
  choppy_micro: { style: 'daz_hair_short_bob',    filter: (x, y, z) => z > 0.046 && y > 0.024 && y < 0.092 && Math.abs(x) < 0.056 },
};

const MODULAR_SIDELOCKS_DONORS = {
  photo_wisp:   { style: 'hair_user_photo',           filter: (x, y, z) => x > 0.044 && z > 0.002 && z < 0.068 && y > -0.048 && y < 0.045 },
  both_wisps:   { style: 'daz_hair_korean_bob',       filter: (x, y, z) => Math.abs(x) > 0.045 && z > 0.002 && z < 0.068 && y > -0.052 && y < 0.045 },
  hime_cheek:   { style: 'daz_hair_hime',             filter: (x, y, z) => Math.abs(x) > 0.044 && z > 0.005 && z < 0.066 && y > -0.062 && y < 0.042 },
  wavy_tendril: { style: 'daz_hair_french_lazy_roll', filter: (x, y, z) => Math.abs(x) > 0.045 && z > -0.005 && z < 0.068 && y > -0.058 && y < 0.045 },
};

const MODULAR_BACK_DONORS = {
  high_ponytail: { style: 'daz_hair_sport_ponytail', filter: (x, y, z) => z < -0.032 || (z < -0.012 && y > 0.055) },
  low_ponytail:  { style: 'hair_user_photo',         filter: (x, y, z) => z < -0.038 && y < 0.062 },
  low_chignon:   { style: 'daz_hair_low_chignon',    filter: (x, y, z) => z < -0.035 && y < 0.048 },
  twin_buns:     { style: 'daz_hair_twin_buns',      filter: (x, y, z) => y > 0.068 && Math.abs(x) > 0.042 && z < 0.035 },
  twin_braids:   { style: 'daz_hair_twin_braids',    filter: (x, y, z) => y < 0.018 && Math.abs(x) > 0.048 && z < 0.028 },
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
  const modelContainer = rootGroup.getObjectByName('RealDazHeadContainer');
  if (!modelContainer) return null;

  rootGroup.userData.neckClearance = Number(config.neckClearance ?? rootGroup.userData.neckClearance ?? 0.45);
  const topCrownStyle = config.topCrown || config.topCrownStyle || config.morphs?.topCrown || config.morphs?.topCrownStyle || rootGroup.userData.topCrownStyle || 'default';
  const frontBangsStyle = config.frontBangs || config.frontBangsStyle || config.morphs?.frontBangs || config.morphs?.frontBangsStyle || rootGroup.userData.frontBangsStyle || 'default';
  const sideLocksStyle = config.sideLocks || config.sideLocksStyle || config.morphs?.sideLocks || config.morphs?.sideLocksStyle || rootGroup.userData.sideLocksStyle || 'default';
  const backAttachmentStyle = config.backAttachment || config.backAttachmentStyle || config.morphs?.backAttachment || config.morphs?.backAttachmentStyle || rootGroup.userData.backAttachmentStyle || 'none';
  const hairTipColor = config.hairTipColor || config.morphs?.hairTipColor || rootGroup.userData.hairTipColor || '#4a3528';
  const hairOmbreMix = Number(config.hairOmbreMix ?? config.morphs?.hairOmbreMix ?? rootGroup.userData.hairOmbreMix ?? 0.0);
  const hairWispyFeather = Number(
    config.hairWispyFeather ?? config.morphs?.hairWispyFeather ?? rootGroup.userData.hairWispyFeather ??
    (frontBangsStyle === 'wispy_air' ? 0.62 : 0.42)
  );

  rootGroup.userData.topCrownStyle = topCrownStyle;
  rootGroup.userData.frontBangsStyle = frontBangsStyle;
  rootGroup.userData.sideLocksStyle = sideLocksStyle;
  rootGroup.userData.backAttachmentStyle = backAttachmentStyle;
  rootGroup.userData.hairTipColor = hairTipColor;
  rootGroup.userData.hairOmbreMix = hairOmbreMix;
  rootGroup.userData.hairWispyFeather = hairWispyFeather;

  const request = (rootGroup.userData.hairRequestSerial || 0) + 1;
  rootGroup.userData.hairRequestSerial = request;
  const oldHair = modelContainer.getObjectByName('HairGroup');

  const rawStyle = config.hairStyle || config.materials?.hairStyle || 'hair_user_photo';
  const resolvedStyle = resolveRealHairStyle(rawStyle);
  if (resolvedStyle === 'none' && !config.customHairUrl) {
    disposeHeadNode(oldHair);
    delete rootGroup.userData.groomStats;
    rootGroup.userData.currentHairStyle = 'none';
    delete rootGroup.userData.hairStats;
    delete rootGroup.userData.hairLoadError;
    return null;
  }

  delete rootGroup.userData.groomStats;
  rootGroup.userData.customHairUrl = config.customHairUrl || null;
  rootGroup.userData.customHairType = config.customHairType || null;
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

    if (!config.customHairUrl) loadedScene.traverse(child => {
      if (!child.isMesh) return;
      const original = child.geometry;
      child.geometry = refineArtistHairCards(original);
      if (child.geometry !== original) original.dispose();
    });

    // Stage 43 · 4-Zone Surgical Modular Hair Assembly (Crown / Front Bangs / Side Locks / Back Attachment)
    const stripFrontBangs = frontBangsStyle !== 'default' && (frontBangsStyle === 'forehead_bare' || (MODULAR_BANGS_DONORS[frontBangsStyle] && MODULAR_BANGS_DONORS[frontBangsStyle].style !== resolvedStyle));
    const stripSideLocks = sideLocksStyle !== 'default' && (sideLocksStyle === 'tucked_ear' || (MODULAR_SIDELOCKS_DONORS[sideLocksStyle] && MODULAR_SIDELOCKS_DONORS[sideLocksStyle].style !== resolvedStyle));
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

    if (stripFrontBangs || stripSideLocks || stripBackDrape) {
      loadedScene.traverse((child) => {
        if (!child.isMesh || !child.geometry?.attributes?.position) return;
        let geo = child.geometry;
        if (stripFrontBangs && (frontBangsStyle === 'forehead_bare' || bangsMeshes.length)) {
          const trimmed = filterGeometryByCentroid(
            geo,
            (x, y, z) => z > 0.048 && y > 0.012 && y < 0.086 && Math.abs(x) < 0.056,
            true
          );
          if (trimmed) geo = trimmed;
        }
        if (stripSideLocks && (sideLocksStyle === 'tucked_ear' || sideMeshes.length)) {
          const trimmed = filterGeometryByCentroid(
            geo,
            (x, y, z) => Math.abs(x) > 0.046 && z > 0.002 && z < 0.068 && y > -0.058 && y < 0.042,
            true
          );
          if (trimmed) geo = trimmed;
        }
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
    }

    const hairShaderParams = {
      hairWispyFeather,
      hairOmbreMix,
      hairTipColor,
    };

    let totalVerts = 0;
    let totalTris = 0;
    const customAsset = Boolean(config.customHairUrl);
    loadedScene.traverse(child => {
      if (!child.isMesh) return;
      const g = child.geometry;
      if (g?.attributes?.position) {
        totalVerts += g.attributes.position.count;
        totalTris += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      }
      if (!customAsset) updateArtistHairFlow(g, (child.userData.hairSourceStyle || resolvedStyle) === 'daz_hair_asym_short');
      const configureMaterial = original => {
        // Imported GLBs retain artist PBR textures, material slots and alpha modes.
        // Never turn an imported multi-material groom into one black material.
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
        const material = new THREE.MeshPhysicalMaterial({
          name: 'ArtistHair_StableCoverage', map, color: displayColor,
          metalness: 0, specularColor: new THREE.Color('#ffffff'),
          transparent: false, alphaTest: map ? 0.12 : 0,
          alphaToCoverage: Boolean(map), depthWrite: true,
          side: THREE.DoubleSide,
        });
        material.userData.builtInHair = true;
        configureHairSheen(material, sheenIntensity);
        injectArtistHairColor(material, { ...hairShaderParams, flowHorizontal: (child.userData.hairSourceStyle || resolvedStyle) === 'daz_hair_asym_short' });
        return material;
      };
      child.material = Array.isArray(child.material)
        ? child.material.map(configureMaterial) : configureMaterial(child.material);
      child.castShadow = false; // Avoid shadow acne on extremely close card layers.
      child.receiveShadow = true;
      child.renderOrder = 0;
    });

    hairGroup.add(loadedScene);
    disposeHeadNode(oldHair);
    modelContainer.add(hairGroup);
    rootGroup.userData.currentHairStyle = resolvedStyle;
    delete rootGroup.userData.hairLoadError;
    rootGroup.userData.hairStats = { vertices: totalVerts, triangles: totalTris, style: resolvedStyle };

    const mergedMorphs = {
      ...(rootGroup.userData.currentMorphs || {}),
      topCrownStyle,
      frontBangsStyle,
      sideLocksStyle,
      backAttachmentStyle,
      hairTipColor,
      hairOmbreMix,
      hairWispyFeather,
    };
    applyHeadMorphsToGroup(rootGroup, mergedMorphs);
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

  const nextStyle = patch.hairStyle ? resolveRealHairStyle(patch.hairStyle) : prevStyle;
  const nextTop = patch.topCrown ?? patch.topCrownStyle ?? prevTop;
  const nextFront = patch.frontBangs ?? patch.frontBangsStyle ?? prevFront;
  const nextSide = patch.sideLocks ?? patch.sideLocksStyle ?? prevSide;
  const nextBack = patch.backAttachment ?? patch.backAttachmentStyle ?? prevBack;

  if (patch.hairColor) rootGroup.userData.hairColor = patch.hairColor;
  if (patch.hairTipColor) rootGroup.userData.hairTipColor = patch.hairTipColor;
  if (patch.hairOmbreMix !== undefined) rootGroup.userData.hairOmbreMix = Number(patch.hairOmbreMix);
  if (patch.hairWispyFeather !== undefined) rootGroup.userData.hairWispyFeather = Number(patch.hairWispyFeather);
  if (patch.hairSheen !== undefined) rootGroup.userData.hairSheen = Number(patch.hairSheen);
  rootGroup.userData.topCrownStyle = nextTop;

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
  };

  const needsGeometryRebuild =
    nextStyle !== prevStyle ||
    nextFront !== prevFront ||
    nextSide !== prevSide ||
    nextBack !== prevBack;

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
    hairGroup.traverse((child) => {
      if (child.isMesh && child.name !== 'ScalpRootFeatherCap') {
        for (const mat of Array.isArray(child.material) ? child.material : [child.material]) {
          if (mat?.userData?.builtInHair) mat.color.copy(dispCol);
        }
      }
    });
  }
  applyArtistHairFineTuning(rootGroup, rootGroup.userData.currentMorphs);
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
        vec2 eyeCenter = vec2(eyeSide * (0.0285 + uEyeSpacing * 0.0024), 0.0186) + uGazeOffset * 0.0045;
        vec2 relXY = (vEyeLocalPos.xy - eyeCenter) / (0.0065 * clamp(uIrisScale, 0.65, 1.42));
        float rIris = length(relXY);
        float inIris = 1.0 - smoothstep(0.88, 1.03, rIris);
        float pupilRadius = 0.34 * clamp(uPupilScale, 0.45, 1.65);
        float inPupil = 1.0 - smoothstep(pupilRadius - 0.05, pupilRadius + 0.05, rIris);

        // Multi-layered radial iris collagen crypt fibers, warm collarette ring & limbal ring
        float theta = atan(relXY.y, relXY.x);
        float clarityBoost = clamp(uEyeClarity, 0.0, 1.6);
        float radialFibers = 0.5 + 0.5 * sin(theta * 36.0 + sin(rIris * 12.0) * 1.4) * cos(theta * 19.0 - 0.8);
        float fineCrypts = 0.5 + 0.5 * cos(theta * 58.0 - rIris * 9.0);
        float collaretteRing = exp(-pow((rIris - 0.48) / 0.14, 2.0)) * (0.28 + 0.22 * clarityBoost);
        float limbalMask = smoothstep(0.66, 0.97, rIris) * inIris;
        float limbalDarken = clamp(uLimbalRing, 0.0, 1.2) * (0.68 + 0.14 * clarityBoost) * limbalMask;

        vec3 baseStroma = uIrisColor * clamp(uIrisBrightness, 0.45, 1.85);
        vec3 warmCollarette = mix(baseStroma, baseStroma * vec3(1.32, 1.12, 0.82) + vec3(0.08, 0.05, 0.02), 0.65);
        vec3 customIris = (baseStroma * (0.62 + (0.56 + 0.20 * clarityBoost) * radialFibers + 0.16 * fineCrypts) + warmCollarette * collaretteRing)
                        * (1.0 - limbalDarken);
        float stromaMask = inIris * (1.0 - inPupil);
        float effMix = clamp(max(uIrisColorMix, 0.86), 0.0, 0.98);
        diffuseColor.rgb = mix(diffuseColor.rgb, customIris, clamp(stromaMask * effMix, 0.0, 0.97));
        // Deep velvet-black pupil aperture
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.008, 0.008, 0.012), inPupil * 0.96);

        // Clean physiological moist sclera + customizable branching episcleral micro-capillaries
        float scleraMask = 1.0 - inIris;
        float cornerDist = smoothstep(0.92, 1.85, abs(relXY.x));
        vec3 cleanScleraBase = mix(vec3(0.89, 0.85, 0.83), max(diffuseColor.rgb, vec3(0.82, 0.78, 0.76)), 0.18);
        vec3 naturalSclera = mix(cleanScleraBase, vec3(0.76, 0.56, 0.54), cornerDist * 0.28);
        if (uScleraVeinIntensity > 0.01) {
          float veinAngle = theta * 14.0 + sin(rIris * 6.5) * 2.2;
          float veinBranch = smoothstep(0.92, 0.995, abs(sin(veinAngle) * cos(theta * 7.0 + rIris * 4.0)));
          float veinMask = veinBranch * smoothstep(1.05, 1.65, rIris) * clamp(uScleraVeinIntensity, 0.0, 1.2);
          naturalSclera = mix(naturalSclera, vec3(0.68, 0.22, 0.24), clamp(veinMask * 0.55, 0.0, 0.48));
        }
        diffuseColor.rgb = mix(diffuseColor.rgb, naturalSclera * clamp(uScleraBrightness, 0.62, 1.28), scleraMask);
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
      vec2 eyeCenter = vec2(eyeSide * (0.0285 + uEyeSpacing * 0.0024), 0.0186) + uGazeOffset * 0.0045;
      vec2 relXY = (vEyeLocalPos.xy - eyeCenter) / (0.0065 * clamp(uIrisScale, 0.65, 1.42));
      float rIris = length(relXY);
      float inIris = 1.0 - smoothstep(0.88, 1.06, rIris);

      // 1. Soft Physiological Eyelid Ambient Occlusion (NEVER creates a dark eyeliner band across the open eye!)
      float upperLidAO = smoothstep(0.0252, 0.0205, vEyeLocalPos.y);
      float lowerLidAO = smoothstep(0.0112, 0.0142, vEyeLocalPos.y);
      float cornerAO = 1.0 - 0.16 * smoothstep(1.05, 1.95, abs(relXY.x));
      float orbitalAO = clamp((0.80 + 0.20 * upperLidAO) * (0.90 + 0.10 * lowerLidAO) * cornerAO, 0.72, 1.0);

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
        eyeGoboAtten = mix(1.0, 0.26 + 0.74 * gLight, clamp(uWindowGoboStrength, 0.0, 1.0));
      }

      reflectedLight.directDiffuse *= orbitalAO * eyeGoboAtten;
      reflectedLight.indirectDiffuse *= orbitalAO * mix(1.0, eyeGoboAtten, 0.72) * mix(0.92, 0.56, clamp(uChiaroscuro, 0.0, 1.0));

      // Lower iris warm caustic crescent (opposite top-right key light)
      float causticZone = clamp(-relXY.y * 0.85 - relXY.x * 0.35, 0.0, 1.0) * exp(-pow((rIris - 0.58) / 0.24, 2.0));
      reflectedLight.directDiffuse += (uIrisColor * clamp(uIrisBrightness, 0.5, 1.7) * 0.72 + vec3(0.24, 0.14, 0.08)) * causticZone * inIris * 0.82 * eyeGoboAtten;

      // Crisp Pinpoint Studio Catchlights (uCorneaWetness) — zero artificial horizontal lower stripe!
      float wetFactor = clamp(uCorneaWetness, 0.2, 1.5);
      float uvCatch1 = exp(-(pow((relXY.x + 0.28) / 0.088, 2.0) + pow((relXY.y - 0.28) / 0.082, 2.0)));
      float uvCatch2 = exp(-(pow((relXY.x - 0.30) / 0.048, 2.0) + pow((relXY.y + 0.26) / 0.048, 2.0)));
      vec3 wetCatchlight = (vec3(2.15, 2.12, 2.08) * uvCatch1 + vec3(1.08, 1.10, 1.16) * uvCatch2)
                         * inIris * clamp(uCatchlightStrength, 0.0, 1.8) * wetFactor * (0.45 + 0.55 * eyeGoboAtten);
      float specKeep = mix(0.08, 0.24, inIris) * orbitalAO * eyeGoboAtten * wetFactor;
      reflectedLight.directSpecular = reflectedLight.directSpecular * specKeep + wetCatchlight * upperLidAO;
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
      const skinVariantId = rootGroup.userData.skinVariant || presetBias.skinVariant || 'cn_porcelain_ivory';
      rootGroup.userData.skinVariant = skinVariantId;
      const realSkinMap = realWebAssetsCache?.skins?.[skinVariantId] || rawSkinMap;
      const skinMicro = createSkinMicroMaps();
      for (const texture of Object.values(skinMicro)) {
        if (texture?.isTexture) texture.userData.sharedSkinMicro = true;
      }
      const initRough = Math.max(0.20, Math.min(0.88, Number(config.skinRoughness ?? materials.skinRoughness ?? morphs.skinRoughness ?? 0.38)));
      const initNormScale = Math.max(0.0, Math.min(1.6, Number(config.normalMapStrength ?? materials.normalMapStrength ?? morphs.normalMapStrength ?? 0.26)));
      const skinMaterial = new THREE.MeshPhysicalMaterial({
        map: realSkinMap,
        normalMap: skinNorm,
        normalScale: new THREE.Vector2(initNormScale, initNormScale),
        roughnessMap: skinMicro.roughnessMap,
        color: new THREE.Color('#ffffff'),
        roughness: initRough,
        metalness: 0.0,
        sheen: 0.22,
        sheenRoughness: 0.72,
        sheenColor: new THREE.Color('#ffddd4'),
        clearcoat: 0.0,
        clearcoatRoughness: 0.48,
        specularIntensity: 0.28,
        specularColor: new THREE.Color('#fff9f6'),
        ior: 1.40,
        envMapIntensity: 0.36,
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
      });
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
      child.castShadow = false;
      child.receiveShadow = true;
      const eyeMap = child.material?.map || null;
      if (eyeMap) {
        eyeMap.colorSpace = THREE.SRGBColorSpace;
        eyeMap.anisotropy = 16;
      }
      const eyeMat = new THREE.MeshPhysicalMaterial({
        map: eyeMap,
        roughness: 0.08,
        metalness: 0.0,
        clearcoat: 0.72,
        clearcoatRoughness: 0.04,
        specularIntensity: 0.65,
        ior: 1.38,
        envMapIntensity: 0.24,
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
      // Prim 2 (Cornea) outer shell must stay hidden so its clearcoat Fresnel reflection
      // never washes a milky grey-white glare across the iris and sclera!
      child.visible = false;
      child.castShadow = false;
      child.receiveShadow = false;
    } else if (matName === 'Eyebrow') {
      child.castShadow = false;
      child.receiveShadow = true;
      child.userData.isEyebrowMesh = true;
      const browSpec = EYEBROW_STYLE_TO_MH_ASSET[rootGroup.userData.eyebrowStyle || 'cn_scholar_natural'] || EYEBROW_STYLE_TO_MH_ASSET.cn_scholar_natural;
      const realBrowAsset = realWebAssetsCache?.eyebrows?.[browSpec.assetId] || realWebAssetsCache?.eyebrows?.eyebrow001;
      const browMap = realBrowAsset?.texture || child.material?.map || null;
      if (browMap) browMap.colorSpace = THREE.SRGBColorSpace;
      const browColHex = config.browColor || materials.browColor || '#ffffff';
      const browOp = Number(config.browOpacity ?? materials.browOpacity ?? 0.90);
      rootGroup.userData.browColor = browColHex;
      rootGroup.userData.browOpacity = browOp;
      child.material = new THREE.MeshStandardMaterial({
        map: browMap,
        color: new THREE.Color(browColHex),
        transparent: true,
        opacity: Math.min(0.88, browOp * 0.80),
        alphaTest: 0.0,
        alphaToCoverage: false,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        roughness: 0.65,
        envMapIntensity: 0.22,
        side: THREE.DoubleSide,
      });
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
      // Stage 44 Fix: alphaToCoverage: false & alphaTest: 0.0 prevent Three.js r170 from
      // turning the feathered lash alpha strip into a 100% solid black eyeliner ribbon!
      child.material = new THREE.MeshStandardMaterial({
        name: 'Eyelash',
        map: lashMap,
        color: new THREE.Color(config.lashColor || materials.lashColor || '#44322e'),
        transparent: true,
        opacity: Math.max(0.0, Math.min(0.92, initLashDensity * 0.72)),
        alphaTest: 0.0,
        alphaToCoverage: false,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -2,
        roughness: 0.52,
        envMapIntensity: 0.20,
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
    if (/^\/models\/user_photo_ref\.(jpg|png)$/.test(photoPath) && window.__EMBEDDED_REF_PHOTO__) url = window.__EMBEDDED_REF_PHOTO__;
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

    // 4. NeckCrossSectionCap: Live Wetness
    if (child.name === 'NeckCrossSectionCap' && m.wetness !== undefined) {
      const w = Number(m.wetness);
      mat.roughness = Math.max(0.28, 0.72 - w * 0.40);
      mat.clearcoat = 0.15 + w * 0.35;
    }
  });
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
