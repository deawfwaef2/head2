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
  fangyaoping:      { faceArchetype: 'cn_oval_scholar', eyebrowStyle: 'cn_scholar_natural', skinVariant: 'cn_scholar_natural', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
  user_photo:       { faceArchetype: 'cn_round_babyface', eyebrowStyle: 'kr_straight_mist', skinVariant: 'kr_dewy_peach', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
  chuxia:           { faceArchetype: 'cn_round_babyface', eyebrowStyle: 'kr_straight_mist', skinVariant: 'kr_dewy_peach', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
  female_realistic: { faceArchetype: 'kr_idol_vline', eyebrowStyle: 'kr_idol_arch', skinVariant: 'kr_chaebol_cool', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
  linxi:            { faceArchetype: 'kr_idol_vline', eyebrowStyle: 'kr_idol_arch', skinVariant: 'kr_chaebol_cool', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
  female_2:         { faceArchetype: 'cn_classical_melon', eyebrowStyle: 'cn_willow_classical', skinVariant: 'cn_jiangnan_jade', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
  suwan:            { faceArchetype: 'cn_classical_melon', eyebrowStyle: 'cn_willow_classical', skinVariant: 'cn_jiangnan_jade', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
  female_3:         { faceArchetype: 'kr_sweet_heart', eyebrowStyle: 'kr_sweet_droop', skinVariant: 'kr_firstlove_camellia', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
  qianxue:          { faceArchetype: 'kr_sweet_heart', eyebrowStyle: 'kr_sweet_droop', skinVariant: 'kr_firstlove_camellia', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
  female_gentle:    { faceArchetype: 'cn_cold_royal', eyebrowStyle: 'cn_cold_sword', skinVariant: 'cn_intellectual_olive', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
  shenzhiwei:       { faceArchetype: 'cn_cold_royal', eyebrowStyle: 'cn_cold_sword', skinVariant: 'cn_intellectual_olive', jawVLine: 0.0, chinLength: 0.0, cheekSoftness: 0.0, noseBridge: 0.0, eyeAlmond: 0.0, eyeTilt: 0.0, lipFullness: 0.0 },
};

/**
 * Stage 35 · Maps UI Eyebrow Style IDs to Official MakeHuman 3D Eyebrow Assets (`eyebrow001..012` .obj + .png)
 * Zero `browDown` so eyebrows never scowl or press down into the upper eyelids!
 */
const EYEBROW_STYLE_TO_MH_ASSET = {
  cn_scholar_natural:  { assetId: 'eyebrow012', browDown: 0.0, browUp: 0.12 },
  kr_straight_mist:    { assetId: 'eyebrow001', browDown: 0.0, browUp: 0.15 },
  kr_idol_arch:        { assetId: 'eyebrow010', browDown: 0.0, browUp: 0.22 },
  cn_willow_classical: { assetId: 'eyebrow002', browDown: 0.0, browUp: 0.18 },
  kr_sweet_droop:      { assetId: 'eyebrow004', browDown: 0.0, browUp: 0.10 },
  cn_cold_sword:       { assetId: 'eyebrow003', browDown: 0.0, browUp: 0.28 },
  kr_wild_feathered:   { assetId: 'eyebrow005', browDown: 0.0, browUp: 0.16 },
  cn_tang_moth:        { assetId: 'eyebrow008', browDown: 0.0, browUp: 0.12 },
};

/**
 * Stage 35 · Pure Single-Head Default Archetypes (`默认不要混合`)
 * All `headBlend` channels default to `0.0` so presets use the clean, un-distorted base head model out of the box.
 * Multi-head mixing only activates when the player manually adjusts the Multi-Head Mixer sliders!
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
  cn_round_babyface:    { skinVariant: 'kr_dewy_peach',         headBlend: { ...PURE_ZERO_BLEND } },
  kr_idol_vline:        { skinVariant: 'kr_chaebol_cool',       headBlend: { ...PURE_ZERO_BLEND } },
  cn_classical_melon:   { skinVariant: 'cn_jiangnan_jade',      headBlend: { ...PURE_ZERO_BLEND } },
  kr_sweet_heart:       { skinVariant: 'kr_firstlove_camellia', headBlend: { ...PURE_ZERO_BLEND } },
  cn_cold_royal:        { skinVariant: 'cn_intellectual_olive', headBlend: { ...PURE_ZERO_BLEND } },
  cn_pure_campus_bell:  { skinVariant: 'cn_porcelain_ivory',    headBlend: { ...PURE_ZERO_BLEND } },
  kr_waterglow_idol:    { skinVariant: 'kr_dewy_peach',         headBlend: { ...PURE_ZERO_BLEND } },
  cn_tang_peony:        { skinVariant: 'cn_jiangnan_jade',      headBlend: { ...PURE_ZERO_BLEND } },
  eurasian_sculpted_mix:{ skinVariant: 'eurasian_velvet_rose',  headBlend: { ...PURE_ZERO_BLEND } },
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
        child.material.alphaTest = 0.015;
        child.material.transparent = true;
        child.material.opacity = 0.96;
        child.material.needsUpdate = true;
      }
      if (asset.pos && child.geometry?.attributes?.position && child.geometry.attributes.position.array.length === asset.pos.length) {
        child.geometry.attributes.position.array.set(asset.pos);
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
      if (child.material && child.material.map !== targetTex) {
        child.material.map = targetTex;
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
  const sideburn = Math.max(-0.6, Math.min(0.7, Number(morphs.sideburnLock ?? 0)));
  const hairFlare = Math.max(-0.7, Math.min(0.7, Number(morphs.hairFlare ?? 0)));
  const offX = Math.max(-0.5, Math.min(0.5, Number(morphs.hairOffsetX ?? 0)));
  const offY = Math.max(-0.5, Math.min(0.5, Number(morphs.hairOffsetY ?? 0)));
  const offZ = Math.max(-0.5, Math.min(0.5, Number(morphs.hairOffsetZ ?? 0)));
  const uScale = Math.max(0.82, Math.min(1.22, Number(morphs.hairScale ?? 1.0)));
  const neckClear = Math.max(0.0, Math.min(1.0, Number(rootGroup.userData.neckClearance ?? 0.45)));
  const frontBangsStyle = morphs.frontBangsStyle || rootGroup.userData.frontBangsStyle || 'default';
  const sideLocksStyle = morphs.sideLocksStyle || rootGroup.userData.sideLocksStyle || 'default';
  const wispyFeather = Math.max(0.0, Math.min(1.0, Number(morphs.hairWispyFeather ?? rootGroup.userData.hairWispyFeather ?? 0.45)));
  const ombreMix = Math.max(0.0, Math.min(1.0, Number(morphs.hairOmbreMix ?? rootGroup.userData.hairOmbreMix ?? 0.0)));
  const tipColorHex = morphs.hairTipColor || rootGroup.userData.hairTipColor || '#4a3528';
  const tipCol = new THREE.Color(tipColorHex);

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
    const base = geo.userData.basePositions;
    const out = posAttr.array;
    const count = posAttr.count;
    const isModularDonor = Boolean(child.userData?.isModularPart);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      let x = base[i3];
      let y = base[i3 + 1];
      let z = base[i3 + 2];

      // Modular Bare Forehead mode: smoothly sweep front bangs up & to the sides
      if (!isModularDonor && frontBangsStyle === 'forehead_bare' && z > 0.048 && y > 0.012 && y < 0.082 && Math.abs(x) < 0.056) {
        const wFore = Math.min(1.0, (z - 0.048) / 0.036) * Math.min(1.0, (0.082 - y) / 0.042) * Math.min(1.0, (0.056 - Math.abs(x)) / 0.028);
        const signX = x >= 0 ? 1.0 : -1.0;
        x += signX * 0.038 * wFore;
        y += 0.026 * wFore;
        z -= 0.012 * wFore;
      }

      // Modular Tucked-Behind-Ears mode: smoothly tuck side locks behind the ear line
      if (!isModularDonor && sideLocksStyle === 'tucked_ear' && z > 0.004 && z < 0.062 && y < 0.032 && y > -0.045 && Math.abs(x) > 0.046) {
        const wEar = Math.min(1.0, (0.032 - y) / 0.035) * Math.min(1.0, (Math.abs(x) - 0.046) / 0.025) * Math.min(1.0, (0.062 - z) / 0.032);
        const signX = x >= 0 ? 1.0 : -1.0;
        z -= 0.024 * wEar;
        x += signX * 0.006 * wEar;
      }

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

    posAttr.needsUpdate = true;
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
    // 7 Distinct DAZ-Style Complete 3D Head Models + 2 Brow Bone Channels (encoded in int16 * 32767.0)
    mh_head_asian_youth: wAsianYouth * 1.05,
    mh_head_oval:        wCnScholar * 1.15,
    mh_head_round:       wCnBaby * 1.15,
    mh_head_heart:       wKrVline * 1.15,
    mh_head_melon:       wCnMelon * 1.15,
    mh_head_diamond:     wCnRoyal * 1.15,
    mh_head_eurasian:    wEurasian * 1.25,
    mh_brow_down:        Number(browSpec.browDown ?? 0),
    mh_brow_up:          Number(browSpec.browUp ?? 0),
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
    child.material.sheen = Math.min(0.18, sheen * 0.16);
    child.material.roughness = Math.max(0.42, 0.62 - sheen * 0.16);
    child.material.anisotropy = 0.45 + sheen * 0.25;
    child.material.clearcoat = 0.0;
  });
}

function computeTrueHairDisplayColor(hairColorHex = '#121216') {
  const normalizedHex = String(hairColorHex || '#121216').toLowerCase();
  const legacyDarkSet = new Set(['#191518', '#1a151c', '#181418', '#22171b', '#261a16', '#171417', '#121216', '#111216']);
  if (legacyDarkSet.has(normalizedHex)) {
    return new THREE.Color('#131418');
  }
  const baseColor = new THREE.Color(normalizedHex);
  const lum = 0.299 * baseColor.r + 0.587 * baseColor.g + 0.114 * baseColor.b;
  if (lum < 0.05) {
    return new THREE.Color('#131418');
  }
  return baseColor;
}

function smoothHairCardNormals(geometry) {
  if (!geometry?.attributes?.position || !geometry?.attributes?.normal || geometry.userData?.normalsSmoothed) return;
  geometry.userData = geometry.userData || {};
  geometry.userData.normalsSmoothed = true;
  const pos = geometry.attributes.position;
  const norm = geometry.attributes.normal;
  const hcX = 0.0, hcY = 0.015, hcZ = -0.015;
  for (let i = 0; i < pos.count; i++) {
    const rx = pos.getX(i) - hcX;
    const ry = pos.getY(i) - hcY;
    const rz = pos.getZ(i) - hcZ;
    const rLen = Math.hypot(rx, ry, rz) || 1.0;
    const ox = rx / rLen, oy = ry / rLen, oz = rz / rLen;

    let nx = norm.getX(i), ny = norm.getY(i), nz = norm.getZ(i);
    if (nx * ox + ny * oy + nz * oz < -0.15) {
      nx = -nx; ny = -ny; nz = -nz;
    }
    const bx = nx * 0.65 + ox * 0.35;
    const by = ny * 0.65 + oy * 0.35;
    const bz = nz * 0.65 + oz * 0.35;
    const bLen = Math.hypot(bx, by, bz) || 1.0;
    norm.setXYZ(i, bx / bLen, by / bLen, bz / bLen);
  }
  norm.needsUpdate = true;
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
 * Stage 33 · Velvety Jet-Black Silk & Smooth Anisotropic Marschner Hair Pipeline:
 * 1. Eliminates screen-space dFdx/dFdy normal embossing and 13:1 root-to-tip wire contrast that caused
 *    tinfoil dead-line artifacts (`锡箔纸死线条`).
 * 2. Preserves genuine raven-black base hair color (`乌黑真发`) with soft, cushiony lock volume (`0.64x..1.24x`)
 *    and darkens semi-transparent strand edges (`edgeSoftness`) so alpha cutouts never produce silver fringes.
 * 3. Uses smooth 3D cranial-blended normals for a cohesive, silky Kajiya-Kay / Marschner "Angel Ring" crown sheen.
 */
function injectMarschnerHairShader(material, sheenIntensity = 0.88, isWispLayer = false, hairShaderParams = {}) {
  const sharedUniforms = {
    uHairWispyFeather: { value: Number(hairShaderParams.hairWispyFeather ?? 0.45) },
    uHairOmbreMix: { value: Number(hairShaderParams.hairOmbreMix ?? 0.0) },
    uHairTipColor: { value: new THREE.Color(hairShaderParams.hairTipColor || '#4a3528') },
  };
  material.userData = material.userData || {};
  material.userData.hairShaderUniforms = sharedUniforms;
  material.customProgramCacheKey = () => `marschner_hair_v35_${sheenIntensity.toFixed(2)}_${isWispLayer ? 'wisp' : 'core'}`;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uHairWispyFeather = sharedUniforms.uHairWispyFeather;
    shader.uniforms.uHairOmbreMix = sharedUniforms.uHairOmbreMix;
    shader.uniforms.uHairTipColor = sharedUniforms.uHairTipColor;

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
      vec3 cranSphereN = normalize(vec3(cranVec.x * 1.12, max(-0.22, cranVec.y * 0.96 + 0.028), cranVec.z * 1.05));
      if (dot(objectNormal, cranSphereN) < -0.15) {
        objectNormal = -objectNormal;
      }
      objectNormal = normalize(mix(objectNormal, cranSphereN, 0.38));
      vHairSmoothNormal = objectNormal;
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vHairLocalPos = position;
      ${isWispLayer ? 'transformed += objectNormal * 0.00045;' : ''}
      `
    );

    shader.fragmentShader = `
      uniform float uHairWispyFeather;
      uniform float uHairOmbreMix;
      uniform vec3 uHairTipColor;
      varying vec3 vHairLocalPos;
      varying vec3 vHairSmoothNormal;
      float vStrandReliefField;
      float vArtistLockRidge;
      float vHairEdgeSoftness;
    ` + shader.fragmentShader;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      vStrandReliefField = 0.5;
      vArtistLockRidge = 0.5;
      vHairEdgeSoftness = 1.0;
      #ifdef USE_MAP
        vec4 sampledDiffuseColor = texture2D( map, vMapUv );
        #ifdef DECODE_VIDEO_TEXTURE
          sampledDiffuseColor = sRGBTransferEETF( sampledDiffuseColor );
        #endif
        float rawLinearLuma = clamp(dot(sampledDiffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
        float texSrgbLuma = sqrt(rawLinearLuma);
        float artistLockShade = smoothstep(0.22, 0.86, texSrgbLuma);

        float texAlpha = sampledDiffuseColor.a;

        // Stage 35 · Wispy See-Through Air Bangs & Soft Tip Feathering (matches user_photo_ref.jpg!)
        float inForeheadBangs = smoothstep(0.056, 0.072, vHairLocalPos.z)
          * smoothstep(0.012, 0.026, vHairLocalPos.y)
          * (1.0 - smoothstep(0.058, 0.082, vHairLocalPos.y))
          * (1.0 - smoothstep(0.036, 0.058, abs(vHairLocalPos.x)));
        if (inForeheadBangs > 0.01 && uHairWispyFeather > 0.01) {
          // Multi-scale non-periodic organic strand locks along forehead X + UV
          float strandCoord = vHairLocalPos.x * 420.0 + vMapUv.x * 18.0;
          float wispA = fract(sin(floor(strandCoord) * 127.1) * 43758.5453);
          float wispB = fract(sin(floor(strandCoord * 0.43 + 7.3) * 269.5) * 18345.23);
          float tipTaper = smoothstep(0.022, 0.056, vHairLocalPos.y);
          float wispMask = mix(0.32 + 0.68 * tipTaper, 1.0, smoothstep(0.25, 0.78, wispA * 0.6 + wispB * 0.4 + artistLockShade * 0.35));
          texAlpha *= mix(1.0, wispMask, inForeheadBangs * clamp(uHairWispyFeather, 0.0, 0.92));
        }

        float edgeSoftness = smoothstep(0.14, 0.68, texAlpha);
        vHairEdgeSoftness = edgeSoftness;
        vStrandReliefField = artistLockShade;
        vArtistLockRidge = artistLockShade;

        // Dual-Tone Ombre Hair Dye (Root-to-Tip Gradient)
        float tipFactor = clamp((0.038 - vHairLocalPos.y) / 0.095, 0.0, 1.0);
        float ombreWeight = smoothstep(0.12, 0.88, tipFactor) * clamp(uHairOmbreMix, 0.0, 1.0);
        vec3 baseHairCol = mix(diffuse, uHairTipColor, ombreWeight);

        // Subtle root-parting & inner-neck depth AO
        float rFromCore = length(vHairLocalPos - vec3(0.0, 0.020, -0.008));
        float innerDepthAO = smoothstep(0.060, 0.092, rFromCore);
        float crownPartAO = 1.0 - 0.18 * exp(-pow(vHairLocalPos.x / 0.016, 2.0)) * smoothstep(0.050, 0.095, vHairLocalPos.y);
        float hairVolAO = (0.78 + 0.22 * innerDepthAO) * crownPartAO;

        // Soft, velvety silk lock shading (NO harsh 13:1 wire stripes or grey-brown wash)
        vec3 deepSilk = baseHairCol * 0.62;
        vec3 litSilk = baseHairCol * 1.28;
        diffuseColor.rgb = mix(deepSilk, litSilk, artistLockShade) * hairVolAO * (0.45 + 0.55 * edgeSoftness);

        ${isWispLayer ? `
          float edgeBand = smoothstep(0.04, 0.36, texAlpha) * (1.0 - 0.65 * smoothstep(0.68, 0.95, texAlpha));
          diffuseColor.a *= clamp(edgeBand * 0.78, 0.0, 0.72);
        ` : `
          diffuseColor.a *= clamp(texAlpha, 0.0, 1.0);
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

        // Smooth 3D meridian hair tangent across cranial dome for natural silk Angel Ring
        vec3 pRel = vHairLocalPos - vec3(0.0, 0.012, -0.010);
        vec3 nCran = normalize(vec3(pRel.x * 1.10, pRel.y + 0.026, pRel.z * 1.05));
        vec3 bAzim = normalize(vec3(-nCran.z, 0.0, nCran.x + 1e-5));
        vec3 tMeridian = normalize(cross(bAzim, nCran));
        if (tMeridian.y > 0.0) tMeridian = -tMeridian;

        float lockTilt = (vArtistLockRidge - 0.5) * 0.06;
        vec3 keyLightDir = normalize(vec3(0.26, 0.68, 0.68));
        vec3 HKey = normalize(keyLightDir + viewDir);

        // Primary R cuticle silk band (smooth halo across crown & mid-locks)
        vec3 T1 = normalize(tMeridian + (-0.08 + lockTilt) * surfNorm);
        float tdoth1 = clamp(dot(T1, HKey), -1.0, 1.0);
        float sinTH1 = sqrt(max(0.0, 1.0 - tdoth1 * tdoth1));
        float specR = pow(max(0.0, sinTH1), 42.0) * (0.55 + 0.45 * vArtistLockRidge);

        // Secondary TRT soft cortex sheen
        vec3 T2 = normalize(tMeridian + (0.12 - lockTilt) * surfNorm);
        float tdoth2 = clamp(dot(T2, HKey), -1.0, 1.0);
        float sinTH2 = sqrt(max(0.0, 1.0 - tdoth2 * tdoth2));
        float specTRT = pow(max(0.0, sinTH2), 18.0) * (0.45 + 0.55 * vArtistLockRidge);

        // Subtle grazing-angle rim separation (faded to zero on semi-transparent edges)
        float ndotv = clamp(abs(dot(surfNorm, viewDir)), 0.0, 1.0);
        float fresnelRim = pow(1.0 - ndotv, 3.2) * 0.42;

        float ndotlKey = smoothstep(-0.15, 0.68, dot(surfNorm, keyLightDir));
        float edgeMask = vHairEdgeSoftness * vHairEdgeSoftness;

        float tipFactorSpec = clamp((0.038 - vHairLocalPos.y) / 0.095, 0.0, 1.0);
        vec3 specBaseCol = mix(diffuse, uHairTipColor, smoothstep(0.12, 0.88, tipFactorSpec) * clamp(uHairOmbreMix, 0.0, 1.0));
        vec3 rTint = mix(vec3(0.065, 0.068, 0.082), specBaseCol * 2.5 + vec3(0.045, 0.045, 0.055), 0.52);
        vec3 trtTint = specBaseCol * 2.8 + vec3(0.032, 0.028, 0.036);
        vec3 rimTint = specBaseCol * 2.1 + vec3(0.028, 0.028, 0.036);

        vec3 anisoGlint = (
          specR * rTint * 0.68 +
          specTRT * trtTint * 0.52
        ) * ndotlKey * edgeMask * ${(0.68 + sheenIntensity * 0.46).toFixed(3)};

        vec3 rimStrand = fresnelRim * rimTint * edgeMask * 0.45;

        float wrapLight = 0.36 + 0.64 * smoothstep(-0.40, 0.75, dot(surfNorm, keyLightDir));
        reflectedLight.directDiffuse = max(reflectedLight.directDiffuse, diffuseColor.rgb * wrapLight * 0.76);

        reflectedLight.directSpecular *= 0.22 * edgeMask;
        reflectedLight.indirectSpecular *= 0.26 * edgeMask;
        reflectedLight.indirectSpecular += (anisoGlint + rimStrand) * smoothstep(0.18, 0.68, diffuseColor.a);
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
};

const MODULAR_SIDELOCKS_DONORS = {
  photo_wisp:   { style: 'hair_user_photo',           filter: (x, y, z) => Math.abs(x) > 0.046 && z > 0.002 && z < 0.068 && y > -0.048 && y < 0.045 },
  hime_cheek:   { style: 'daz_hair_hime',             filter: (x, y, z) => Math.abs(x) > 0.044 && z > 0.005 && z < 0.066 && y > -0.068 && y < 0.042 },
  wavy_tendril: { style: 'daz_hair_french_lazy_roll', filter: (x, y, z) => Math.abs(x) > 0.045 && z > -0.005 && z < 0.068 && y > -0.065 && y < 0.045 },
};

const MODULAR_BACK_DONORS = {
  high_ponytail: { style: 'daz_hair_sport_ponytail', filter: (x, y, z) => z < -0.032 || (z < -0.012 && y > 0.055) },
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
      const subGeo = filterGeometryByCentroid(child.geometry, donorSpec.filter, false);
      if (subGeo) {
        const m = new THREE.Mesh(subGeo, child.material);
        m.name = `Modular_${donorSpec.style}`;
        m.userData.isModularPart = true;
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
  const frontBangsStyle = config.frontBangs || config.frontBangsStyle || config.morphs?.frontBangs || config.morphs?.frontBangsStyle || rootGroup.userData.frontBangsStyle || 'default';
  const sideLocksStyle = config.sideLocks || config.sideLocksStyle || config.morphs?.sideLocks || config.morphs?.sideLocksStyle || rootGroup.userData.sideLocksStyle || 'default';
  const backAttachmentStyle = config.backAttachment || config.backAttachmentStyle || config.morphs?.backAttachment || config.morphs?.backAttachmentStyle || rootGroup.userData.backAttachmentStyle || 'none';
  const hairTipColor = config.hairTipColor || config.morphs?.hairTipColor || rootGroup.userData.hairTipColor || '#4a3528';
  const hairOmbreMix = Number(config.hairOmbreMix ?? config.morphs?.hairOmbreMix ?? rootGroup.userData.hairOmbreMix ?? 0.0);
  const hairWispyFeather = Number(
    config.hairWispyFeather ?? config.morphs?.hairWispyFeather ?? rootGroup.userData.hairWispyFeather ??
    (frontBangsStyle === 'wispy_air' ? 0.62 : 0.42)
  );

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

    // Load optional modular custom hair parts (Front Bangs + Side Locks + Back Ponytail/Bun)
    const bangsDonor = (frontBangsStyle !== 'default' && frontBangsStyle !== 'forehead_bare' && MODULAR_BANGS_DONORS[frontBangsStyle]?.style !== resolvedStyle)
      ? MODULAR_BANGS_DONORS[frontBangsStyle]
      : null;
    const sideDonor = (sideLocksStyle !== 'default' && sideLocksStyle !== 'tucked_ear' && MODULAR_SIDELOCKS_DONORS[sideLocksStyle]?.style !== resolvedStyle)
      ? MODULAR_SIDELOCKS_DONORS[sideLocksStyle]
      : null;
    const backDonor = (backAttachmentStyle !== 'none' && MODULAR_BACK_DONORS[backAttachmentStyle]?.style !== resolvedStyle)
      ? MODULAR_BACK_DONORS[backAttachmentStyle]
      : null;

    // If replacing front bangs with a modular donor, trim the base hair's conflicting front forehead bangs
    if (bangsDonor) {
      loadedScene.traverse((child) => {
        if (!child.isMesh || !child.geometry?.attributes?.position) return;
        const trimmed = filterGeometryByCentroid(
          child.geometry,
          (x, y, z) => z > 0.056 && y > 0.015 && y < 0.078 && Math.abs(x) < 0.048,
          true
        );
        if (trimmed) child.geometry = trimmed;
      });
    }

    const [bangsMeshes, sideMeshes, backMeshes] = await Promise.all([
      loadModularDonorMeshes(bangsDonor),
      loadModularDonorMeshes(sideDonor),
      loadModularDonorMeshes(backDonor),
    ]);
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
    const sheenIntensity = Number(config.hairSheen ?? rootGroup.userData.hairSheen ?? 0.88);
    rootGroup.userData.hairSheen = sheenIntensity;
    const hairLum = 0.299 * displayColor.r + 0.587 * displayColor.g + 0.114 * displayColor.b;
    const isJetBlack = hairLum < 0.16;
    const sheenCol = isJetBlack
      ? new THREE.Color('#2c2e38')
      : displayColor.clone().multiplyScalar(1.25);

    const scalpCap = buildScalpRootShadowCap(modelContainer, displayColor);
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
    const wispClones = [];

    loadedScene.traverse((child) => {
      if (!child.isMesh) return;
      const g = child.geometry;
      if (g?.attributes?.position) {
        smoothHairCardNormals(g);
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

      // Pass 1: Velvety Silk Core Locks with MSAA alphaToCoverage & smooth Angel Ring sheen
      const coreMat = new THREE.MeshPhysicalMaterial({
        map: mapTex,
        color: displayColor,
        roughness: Math.max(0.36, 0.52 - sheenIntensity * 0.14),
        metalness: 0.0,
        sheen: Math.min(0.24, sheenIntensity * 0.20),
        sheenRoughness: 0.46,
        sheenColor: sheenCol,
        anisotropy: 0.72 + sheenIntensity * 0.20,
        anisotropyRotation: Math.PI / 2,
        clearcoat: 0.0,
        clearcoatRoughness: 0.48,
        specularIntensity: 0.28,
        specularColor: isJetBlack ? new THREE.Color('#5a5e6c') : new THREE.Color('#b8b0a8'),
        envMapIntensity: isJetBlack ? 0.16 : 0.28,
        transparent: false,
        alphaTest: mapTex ? 0.16 : 0.0,
        alphaToCoverage: Boolean(mapTex),
        depthWrite: true,
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 2,
        side: THREE.DoubleSide,
      });
      coreMat.userData.builtInHair = true;
      injectMarschnerHairShader(coreMat, sheenIntensity, false, hairShaderParams);

      child.material = coreMat;
      child.castShadow = false;
      child.receiveShadow = true;
      child.renderOrder = 1;

      if (mapTex) {
        // Pass 2: 3D-Offset Feathered Gossamer Edge Shell (+0.45mm along smooth 3D normal)
        const wispMat = new THREE.MeshPhysicalMaterial({
          map: mapTex,
          color: displayColor,
          roughness: Math.max(0.36, 0.50 - sheenIntensity * 0.14),
          metalness: 0.0,
          sheen: Math.min(0.24, sheenIntensity * 0.22),
          sheenRoughness: 0.44,
          sheenColor: sheenCol,
          anisotropy: 0.74 + sheenIntensity * 0.18,
          anisotropyRotation: Math.PI / 2,
          clearcoat: 0.0,
          clearcoatRoughness: 0.46,
          specularIntensity: 0.28,
          specularColor: isJetBlack ? new THREE.Color('#5e6270') : new THREE.Color('#c0b8b0'),
          envMapIntensity: isJetBlack ? 0.18 : 0.30,
          transparent: true,
          opacity: 1.0,
          alphaTest: 0.015,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
        wispMat.userData.builtInHair = true;
        injectMarschnerHairShader(wispMat, sheenIntensity, true, hairShaderParams);

        const wispMesh = new THREE.Mesh(child.geometry, wispMat);
        wispMesh.name = `${child.name || 'Hair'}_SilkyWisps`;
        wispMesh.userData.isModularPart = Boolean(child.userData?.isModularPart);
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

    const mergedMorphs = {
      ...(rootGroup.userData.currentMorphs || {}),
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
    console.warn('Failed to load 3D artist hair model:', hairUrl, err);
    return null;
  }
}

export async function updateHairDesignOnGroup(rootGroup, patch = {}) {
  if (!rootGroup) return;
  const prevFront = rootGroup.userData.frontBangsStyle || 'default';
  const prevSide = rootGroup.userData.sideLocksStyle || 'default';
  const prevBack = rootGroup.userData.backAttachmentStyle || 'none';
  const prevStyle = rootGroup.userData.currentHairStyle || 'hair_user_photo';

  const nextStyle = patch.hairStyle ? resolveRealHairStyle(patch.hairStyle) : prevStyle;
  const nextFront = patch.frontBangs ?? patch.frontBangsStyle ?? prevFront;
  const nextSide = patch.sideLocks ?? patch.sideLocksStyle ?? prevSide;
  const nextBack = patch.backAttachment ?? patch.backAttachmentStyle ?? prevBack;

  if (patch.hairColor) rootGroup.userData.hairColor = patch.hairColor;
  if (patch.hairTipColor) rootGroup.userData.hairTipColor = patch.hairTipColor;
  if (patch.hairOmbreMix !== undefined) rootGroup.userData.hairOmbreMix = Number(patch.hairOmbreMix);
  if (patch.hairWispyFeather !== undefined) rootGroup.userData.hairWispyFeather = Number(patch.hairWispyFeather);
  if (patch.hairSheen !== undefined) rootGroup.userData.hairSheen = Number(patch.hairSheen);

  rootGroup.userData.currentMorphs = {
    ...(rootGroup.userData.currentMorphs || {}),
    ...patch,
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
  if (hairGroup && patch.hairColor) {
    const dispCol = computeTrueHairDisplayColor(patch.hairColor);
    hairGroup.traverse((child) => {
      if (child.isMesh && child.material && child.name !== 'ScalpRootFeatherCap') {
        child.material.color.copy(dispCol);
      }
    });
  }
  applyArtistHairFineTuning(rootGroup, rootGroup.userData.currentMorphs);
}

/**
 * Stage 36 · Natural Deep Espresso-Brown Iris & Pinpoint Catchlight Eye Shader
 * Eliminates milky grey-white environment wash and faceted cornea rings so eyes are
 * deep, dark, crystal-clear, and expressive with a delicate pinpoint catchlight.
 */
function injectLifelikeEyeShader(material) {
  material.customProgramCacheKey = () => 'cervix3d_lifelike_eye_v36';
  material.onBeforeCompile = (shader) => {
    shader.vertexShader = `
      varying vec3 vEyeLocalPos;
      varying vec3 vEyeNormal;
    ` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      vEyeLocalPos = position;
      vEyeNormal = normalize(normal);
      `
    );
    shader.fragmentShader = `
      varying vec3 vEyeLocalPos;
      varying vec3 vEyeNormal;
    ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `
      #include <map_fragment>
      // Deepen iris & pupil contrast so East Asian dark brown eyes never look washed-out or grey
      float eyeSideMap = vEyeLocalPos.x >= 0.0 ? 1.0 : -1.0;
      vec2 relXYMap = (vEyeLocalPos.xy - vec2(eyeSideMap * 0.0285, 0.0179)) / 0.0061;
      float rIrisMap = length(relXYMap);
      float inIrisMap = 1.0 - smoothstep(0.82, 1.04, rIrisMap);
      float inPupilMap = 1.0 - smoothstep(0.24, 0.42, rIrisMap);
      vec3 deepIrisCol = pow(max(diffuseColor.rgb, vec3(0.001)), vec3(1.26)) * vec3(0.76, 0.70, 0.66);
      diffuseColor.rgb = mix(diffuseColor.rgb * 0.90, deepIrisCol, inIrisMap);
      diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.012, 0.010, 0.014), inPupilMap * 0.92);
      `
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      `
      #include <lights_fragment_end>
      vec3 viewDir = normalize(vViewPosition);
      vec3 nEye = normalize(normal);

      // Compute local eye center in 3D head space (left/right eye at x = +-0.0285, y = 0.0179, z = 0.0851)
      float eyeSide = vEyeLocalPos.x >= 0.0 ? 1.0 : -1.0;
      vec2 relXY = (vEyeLocalPos.xy - vec2(eyeSide * 0.0285, 0.0179)) / 0.0061;
      float rIris = length(relXY);
      float inIris = 1.0 - smoothstep(0.86, 1.04, rIris);

      // Upper eyelid soft ambient occlusion along upper lid shadow line
      float upperLidAO = smoothstep(0.0238, 0.0182, vEyeLocalPos.y);
      reflectedLight.directDiffuse *= (0.58 + 0.42 * upperLidAO);
      reflectedLight.indirectDiffuse *= (0.62 + 0.38 * upperLidAO);
      reflectedLight.indirectSpecular *= 0.08;

      // Subtle warm amber lower-iris caustic crescent
      float causticZone = clamp(-relXY.y * 0.85 - relXY.x * 0.30, 0.0, 1.0) * exp(-pow((rIris - 0.56) / 0.22, 2.0));
      reflectedLight.directDiffuse += vec3(0.24, 0.12, 0.05) * causticZone * inIris;

      // Delicate, tiny pinpoint catchlight at upper-right of pupil (never covers whole iris)
      float uvCatch1 = exp(-(pow((relXY.x + 0.24) / 0.075, 2.0) + pow((relXY.y - 0.26) / 0.068, 2.0)));
      float uvCatch2 = exp(-(pow((relXY.x - 0.26) / 0.045, 2.0) + pow((relXY.y + 0.22) / 0.045, 2.0)));

      vec3 wetCatchlight = vec3(0.72, 0.69, 0.64) * (uvCatch1 * inIris)
                         + vec3(0.28, 0.27, 0.26) * (uvCatch2 * inIris);
      reflectedLight.directSpecular = reflectedLight.directSpecular * 0.15 + wetCatchlight * upperLidAO;
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
      const skinMaterial = new THREE.MeshPhysicalMaterial({
        map: realSkinMap,
        normalMap: skinNorm,
        normalScale: new THREE.Vector2(0.58, 0.58),
        roughnessMap: skinMicro.roughnessMap,
        color: computeSkinTintColor(skinToneHex),
        roughness: Math.max(0.56, Number(materials.skinRoughness ?? 0.62)),
        metalness: 0.0,
        sheen: 0.18,
        sheenRoughness: 0.78,
        sheenColor: new THREE.Color('#f7d5ca'),
        clearcoat: 0.0,
        clearcoatRoughness: 0.65,
        specularIntensity: 0.22,
        specularColor: new THREE.Color('#fff5ee'),
        ior: 1.38,
        envMapIntensity: 0.24,
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
        emissiveIntensity: 0.24,
        bumpMap: bumpTex,
        bumpScale: 0.005,
        roughness: Math.max(0.42, 0.76 - wetness * 0.32),
        metalness: 0.0,
        clearcoat: 0.12,
        clearcoatRoughness: 0.45,
        specularIntensity: 0.28,
        envMapIntensity: 0.20,
        side: THREE.DoubleSide,
      });
    } else if (matName === 'Eye') {
      const eyeMap = child.material?.map || null;
      if (eyeMap) {
        eyeMap.colorSpace = THREE.SRGBColorSpace;
        eyeMap.anisotropy = 8;
      }
      const eyeMat = new THREE.MeshPhysicalMaterial({
        map: eyeMap,
        roughness: 0.30,
        metalness: 0.0,
        clearcoat: 0.0,
        clearcoatRoughness: 0.50,
        specularIntensity: 0.16,
        ior: 1.38,
        envMapIntensity: 0.03,
      });
      injectLifelikeEyeShader(eyeMat);
      child.material = eyeMat;
    } else if (matName === 'Cornea') {
      child.visible = false;
      child.material = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.0,
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
