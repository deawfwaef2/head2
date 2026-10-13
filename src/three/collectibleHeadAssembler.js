import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { createAnatomyTextures } from '../textures/anatomyTextureGenerator.js';
import { createSkinMicroMaps } from '../textures/skinTextureGenerator.js';
import { buildCurveGroom, groomStyleFor, applyCurveGroomShape } from './curveGroom.js';
import { repairHairNormals } from './hairGeometry.js';
import { getHairStrandTextures } from '../textures/hairStrandTexture.js';
import { resolvePrivateModelUrl } from '../data/privateModelStore.js';

const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

const arrayBufferCache = new Map();
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
    id: 'dead_serene',
    label: '安详永眠 · 双目紧闭',
    shortLabel: '安详永眠',
    desc: '双目完全闭合、长睫低垂、面部肌肉彻底松弛安详',
    weights: { expr_serene: 1.0 },
  },
  {
    id: 'dead_hollow',
    label: '死不瞑目 · 翻白微张',
    shortLabel: '死不瞑目',
    desc: '眼帘半垂、黑仁向上翻白、下颌松弛微张露出门齿',
    weights: { expr_hollow: 1.0 },
  },
  {
    id: 'dead_shock',
    label: '惊愕断首 · 圆睁张口',
    shortLabel: '惊愕断首',
    desc: '双目惊恐圆睁、眉头高挑、下颌大张露出上下牙列与舌腔',
    weights: { expr_shock: 1.0 },
  },
  {
    id: 'dead_rigor',
    label: '临终痉挛 · 尸僵咬牙',
    shortLabel: '临终痉挛',
    desc: '眉心紧锁、大小眼痉挛抽搐、鼻翼耸起、痛苦咧嘴露齿',
    weights: { expr_rigor: 1.0 },
  },
  {
    id: 'dead_smile',
    label: '诡异尸笑 · 防腐微哂',
    shortLabel: '诡异尸笑',
    desc: '眼帘低垂、嘴角不对称诡异牵拉上扬（尸笑面容）',
    weights: { expr_smile: 1.0 },
  },
  {
    id: 'dead_flaccid',
    label: '面瘫弛缓 · 歪嘴吐舌',
    shortLabel: '面瘫吐舌',
    desc: '单侧眼闭合、单侧翻白眼、下颌脱臼偏斜伴舌尖微吐',
    weights: { expr_flaccid: 1.0 },
  },
];

export const HIGH_POLY_HAIR_CATALOG = [
  {
    id: 'hair_user_photo',
    label: '照片同款 · 空气碎刘海束发 (5,029v)',
    desc: '无缝贴合头骨、清透空气碎刘海 + 脸颊修颜碎发 + 露耳后挽发髻',
  },
  {
    id: 'hair_bob01',
    label: 'Toigo · 内扣齐刘海波波头 (2,806v)',
    desc: '经典高精齐刘海内扣短波波，发尾自然包裹下颌线',
  },
  {
    id: 'hair_bob02',
    label: 'Toigo · 日系层次内卷短波波 (3,031v)',
    desc: '斜分层次感蓬松短波波，露出修长颈部与解剖断面',
  },
  {
    id: 'hair_short02',
    label: 'O4saken · 中式空气刘海微卷短发 (12,547v)',
    desc: '超精细多层Alpha发片交织，真实还原轻盈发丝飞舞感',
  },
  {
    id: 'hair_long01',
    label: 'Elvs Lara · 中分长发样例 (17,360v)',
    desc: '内置发型演示网格；实际细节取决于该 GLB 的拓扑和纹理分辨率',
  },
  {
    id: 'hair_ponytail01',
    label: 'Elvs Hazel · 利落偏分柔顺束发 (4,891v)',
    desc: '气质偏分刘海配脑后利落挽发，完整展现耳廓与下颌骨相',
  },
  {
    id: 'hair_braid01',
    label: 'Elvs Adrienne · 法式蓬松微卷盘发 (9,352v)',
    desc: '9,352顶点浪漫法式微卷刘海与盘发纹理，立体感极强',
  },
  {
    id: 'hair_short04',
    label: 'Elvs Daisy · 千金感斜刘海半束发 (6,721v)',
    desc: '柔和斜刘海搭配双侧垂落发缕，温婉东方标本气质',
  },
  {
    id: 'none',
    label: '无头发 · 纯解剖头骨/光头标本',
    desc: '完全移除毛发层，仅保留头皮与医学解剖断面',
  },
];

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

/** Preserve a user's glTF PBR material. Only annotate texture color spaces and
 * sampling quality; never replace DAZ/Blender maps with the built-in demo skin. */
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
  // glTF data maps (normal/roughness/metalness/AO/height) intentionally stay linear.
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

// Subtle bone-structure biases per preset — NOTE: lipFullness is 0.0 across all presets so mouth is NEVER pouty ("嘟嘟嘴")!
const PRESET_MORPH_BIASES = {
  user_photo: { jawVLine: 0.02, cheekSoftness: 0.16, noseBridge: 0.02, eyeAlmond: 0.06, lipFullness: 0.0 },
  linxi: { jawVLine: 0.10, cheekSoftness: 0.10, noseBridge: 0.10, eyeAlmond: 0.10, lipFullness: 0.0 },
  suwan: { jawVLine: 0.22, cheekSoftness: 0.04, noseBridge: 0.20, eyeAlmond: 0.22, lipFullness: 0.0 },
  qianxue: { jawVLine: 0.18, cheekSoftness: 0.14, noseBridge: 0.16, eyeAlmond: 0.16, lipFullness: 0.0 },
  shenzhiwei: { jawVLine: 0.06, cheekSoftness: 0.20, noseBridge: 0.06, eyeAlmond: 0.14, lipFullness: 0.0 },
};

/**
 * Applies facial bone morphs, forensic dead-person expressions ("死人各种表情"),
 * and 3D hair morphs across all morph-enabled meshes inside `rootGroup`.
 */

// Stage 18 · 头皮根层跟随头部 Morph：换表情/捏脸时，Groom_ScalpRootDensity 必须和
// HeadSkinMesh 用同一组 morph 权重重算顶点，否则额头皮肤动了、发际层不动 -> 露头皮。
function syncScalpRootLayerToMorphs(rootGroup) {
  const head = rootGroup.getObjectByName('HeadSkinMesh');
  const root = rootGroup.getObjectByName('Groom_ScalpRootDensity');
  if (!head || !root) return;
  const hg = head.geometry, rg = root.geometry;
  const hp = hg?.attributes?.position, rp = rg?.attributes?.position;
  if (!hp || !rp || hp.count !== rp.count) return;
  if (!rg.userData.basePositions) rg.userData.basePositions = Float32Array.from(rp.array);
  const out = rp.array;
  out.set(rg.userData.basePositions);
  const morphAttrs = hg.morphAttributes?.position || [];
  const dict = head.morphTargetDictionary, infl = head.morphTargetInfluences;
  const relative = hg.morphTargetsRelative !== false;
  const vCount = hp.count;
  if (dict && infl) {
    for (const [, idx] of Object.entries(dict)) {
      const w = infl[idx];
      if (!w || !Number.isFinite(w) || Math.abs(w) < 1e-5) continue;
      const ma = morphAttrs[idx];
      if (!ma || ma.count < vCount) continue;
      // CRITICAL FIX (Stage 20): `ma` in `daz_asian_head_base.glb` is an InterleavedBufferAttribute
      // with normalized Int16Array (stride=4). Using `ma.getX(v)/getY(v)/getZ(v)` properly
      // de-interleaves and denormalizes (/32767.0) instead of reading raw Int16 with stride 3!
      for (let v = 0; v < vCount; v++) {
        let dx = relative ? ma.getX(v) : ma.getX(v) - hp.getX(v);
        let dy = relative ? ma.getY(v) : ma.getY(v) - hp.getY(v);
        let dz = relative ? ma.getZ(v) : ma.getZ(v) - hp.getZ(v);
        if (!Number.isFinite(dx) || !Number.isFinite(dy) || !Number.isFinite(dz)) continue;
        dx = Math.max(-0.025, Math.min(0.025, dx));
        dy = Math.max(-0.025, Math.min(0.025, dy));
        dz = Math.max(-0.025, Math.min(0.025, dz));
        const i3 = v * 3;
        out[i3] += dx * w;
        out[i3 + 1] += dy * w;
        out[i3 + 2] += dz * w;
      }
    }
  }
  let maxAbs = 0;
  for (let i = 0; i < out.length; i++) maxAbs = Math.max(maxAbs, Math.abs(out[i]));
  if (!Number.isFinite(maxAbs) || maxAbs > 0.6) {
    out.set(rg.userData.basePositions);
  }
  rp.needsUpdate = true;
  rg.computeBoundingSphere();
}

export function applyHeadMorphsToGroup(rootGroup, morphs = {}) {
  if (!rootGroup) return;
  rootGroup.userData.currentMorphs = { ...(rootGroup.userData.currentMorphs || {}), ...morphs };
  const m = rootGroup.userData.currentMorphs;
  const presetKey = rootGroup.userData.basePreset || 'user_photo';
  const bias = PRESET_MORPH_BIASES[presetKey] || PRESET_MORPH_BIASES.user_photo;

  const jawV = (m.jawVLine ?? -(m.jawWidth ?? 0)) + bias.jawVLine * 0.4;
  const cheek = (m.cheekSoftness ?? m.cheekboneFullness ?? 0) + bias.cheekSoftness * 0.4;
  const nose = (m.noseBridge ?? m.noseBridgeHeight ?? 0) + bias.noseBridge * 0.4;
  const eye = (m.eyeAlmond ?? m.eyeSize ?? 0) + bias.eyeAlmond * 0.4;
  const lip = (m.lipFullness ?? 0) + bias.lipFullness * 0.4;
  const forehead = Number(m.foreheadHeight ?? 0);
  const ear = Number(m.earSize ?? 0);

  // Forensic Post-Mortem Expression Preset + Fine-Tuning Sliders
  const exprId = m.deadExpression || rootGroup.userData.deadExpression || 'dead_calm';
  rootGroup.userData.deadExpression = exprId;
  const exprPreset = FORENSIC_EXPRESSION_PRESETS.find((p) => p.id === exprId) || FORENSIC_EXPRESSION_PRESETS[0];
  const presetW = exprPreset.weights || {};

  const jawOpenVal = Math.max(0, Math.min(1.2, Number(m.jawOpen ?? 0)));
  const jawSideVal = Math.max(0, Math.min(1.2, Number(m.jawSide ?? 0)));
  const tongueOutVal = Math.max(0, Math.min(1.2, Number(m.tongueOut ?? 0)));
  const eyeRollUpVal = Math.max(0, Math.min(1.2, Number(m.eyeRollUp ?? 0)));
  const eyeCloseVal = Math.max(0, Math.min(1.0, Number(m.eyeClose ?? 0)));
  const eyeWideVal = Math.max(0, Math.min(1.0, Number(m.eyeWide ?? 0)));

  // Hair 3D morphs
  const hairLenVal = Math.max(-0.5, Math.min(1.2, Number(m.hairLength ?? 0)));
  const hairVolVal = Math.max(-0.5, Math.min(1.2, Number(m.hairVolume ?? 0)));
  const bangsLenVal = Math.max(-0.5, Math.min(1.2, Number(m.bangsLength ?? 0)));

  const targetWeights = {
    face_jaw_width_decr: jawV > 0 ? Math.min(1.1, jawV * 1.25) : 0,
    face_jaw_width_incr: jawV < 0 ? Math.min(1.1, -jawV * 1.25) : 0,
    face_chin_decr: jawV > 0 ? Math.min(0.85, jawV * 0.65) : 0,
    face_chin_incr: jawV < 0 ? Math.min(0.85, -jawV * 0.65) : 0,
    face_cheekbones_incr: cheek > 0 ? Math.min(1.1, cheek * 1.25) : 0,
    face_cheekbones_decr: cheek < 0 ? Math.min(1.1, -cheek * 1.25) : 0,
    face_nose_height_incr: nose > 0 ? Math.min(1.1, nose * 1.2) : 0,
    face_nose_height_decr: nose < 0 ? Math.min(1.1, -nose * 1.2) : 0,
    face_nose_width_decr: nose > 0 ? Math.min(0.9, nose * 0.75) : 0,
    face_nose_width_incr: nose < 0 ? Math.min(0.9, -nose * 0.75) : 0,
    face_eye_size_incr: eye > 0 ? Math.min(0.8, eye * 0.95) : 0,
    face_eye_size_decr: eye < 0 ? Math.min(0.8, -eye * 0.95) : 0,
    face_eye_tilt_incr: eye > 0 ? Math.min(0.9, eye * 1.05) : 0,
    face_eye_tilt_decr: eye < 0 ? Math.min(0.9, -eye * 1.05) : 0,
    face_lips_incr: lip > 0 ? Math.min(0.75, lip * 0.85) : 0,
    face_lips_decr: lip < 0 ? Math.min(0.95, -lip * 1.15) : 0,
    face_mouth_width_decr: 0, // Never pinch mouth width into a pout!
    face_forehead_incr: forehead > 0 ? Math.min(1.0, forehead * 1.2) : 0,
    face_forehead_decr: forehead < 0 ? Math.min(1.0, -forehead * 1.2) : 0,
    face_ear_size_incr: ear > 0 ? Math.min(1.0, ear * 1.2) : 0,
    face_ear_size_decr: ear < 0 ? Math.min(1.0, -ear * 1.2) : 0,
    blink_left: eyeCloseVal,
    blink_right: eyeCloseVal,
    look_left: 0,
    look_right: 0,
    look_up: eyeRollUpVal * 0.65,
    look_down: 0,
    // 10 Forensic Post-Mortem Expression Morph Targets
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
    // Hair 3D morphs
    hair_length: hairLenVal,
    hair_volume: hairVolVal,
    bangs_length: bangsLenVal,
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

  applyCurveGroomShape(rootGroup, m);
  syncScalpRootLayerToMorphs(rootGroup);

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

/**
 * Lifeless Specimen Expression Mode ("不要眨眼，死人表情默认那种感觉"):
 * Keeps eyelids and eyeballs 100% motionless in their configured post-mortem state.
 */
export function updateHeadLifeAnimation() {
  // Intentionally motionless for authentic preserved specimen feel
}

export function triggerCollectibleBlink() {
  // Intentionally disabled ("不要眨眼")
}

function computeSkinTintColor(skinToneHex = '#ffe8df') {
  const c = new THREE.Color(skinToneHex || '#ffe8df');
  const r = Math.min(1.06, Math.max(0.82, 0.75 + c.r * 0.27));
  const g = Math.min(1.05, Math.max(0.79, 0.75 + c.g * 0.28));
  const b = Math.min(1.05, Math.max(0.78, 0.75 + c.b * 0.29));
  return new THREE.Color(r, g, b);
}

export function resolveRealHairStyle(styleName = 'groom_photo_tied') {
  if (
    [
      'groom_photo_tied',
      'groom_center_long',
      'groom_low_chignon',
      'groom_air_bob',
      'groom_clavicle_bob',
      'groom_hime_cut',
      'groom_high_ponytail',
      'groom_pixie_short',
    ].includes(styleName)
  ) {
    return styleName;
  }
  if (styleName === 'none') return 'none';
  const stripped = String(styleName).replace(/^real_/, '');
  const legacyMap = {
    user_bangs: 'hair_user_photo',
    photo_tied_wisps: 'hair_user_photo',
    long_straight: 'hair_long01',
    long_waves: 'hair_short04',
    hime_cut: 'groom_hime_cut',
    hair_hime_cut: 'groom_hime_cut',
    clavicle_layer: 'groom_clavicle_bob',
    hair_clavicle_layer: 'groom_clavicle_bob',
    butterfly_halfup: 'groom_center_long',
    hair_butterfly_halfup: 'groom_center_long',
    sleek_bob: 'hair_bob01',
    short_bob: 'hair_bob02',
    low_chignon: 'hair_braid01',
    high_ponytail: 'hair_ponytail01',
    soft_waves: 'hair_braid01',
  };
  const mapped = legacyMap[stripped] || legacyMap[styleName] || stripped;
  const valid = new Set([
    'hair_user_photo',
    'hair_long01',
    'hair_bob01',
    'hair_bob02',
    'hair_ponytail01',
    'hair_braid01',
    'hair_short02',
    'hair_short04',
    'groom_photo_tied',
    'groom_center_long',
    'groom_low_chignon',
    'groom_air_bob',
    'groom_clavicle_bob',
    'groom_hime_cut',
    'groom_high_ponytail',
    'groom_pixie_short',
  ]);
  return valid.has(mapped) ? mapped : 'hair_user_photo';
}

function resolveUnderlayerGlbName(styleName) {
  const map = {
    groom_photo_tied: 'hair_user_photo',
    hair_user_photo: 'hair_user_photo',
    groom_center_long: 'hair_short04',
    hair_short04: 'hair_short04',
    hair_long01: 'hair_long01',
    groom_low_chignon: 'hair_braid01',
    hair_braid01: 'hair_braid01',
    groom_air_bob: 'hair_bob01',
    hair_bob01: 'hair_bob01',
    groom_clavicle_bob: 'hair_bob02',
    hair_bob02: 'hair_bob02',
    groom_hime_cut: 'hair_bob02',
    groom_high_ponytail: 'hair_ponytail01',
    hair_ponytail01: 'hair_ponytail01',
    groom_pixie_short: 'hair_short02',
    hair_short02: 'hair_short02',
  };
  return map[styleName] || 'hair_user_photo';
}

async function buildHairVolumeUnderlayer(resolvedStyle, config = {}) {
  const glbName = resolveUnderlayerGlbName(resolvedStyle);
  const hairUrl = `/models/${glbName}.glb`;
  const buf = await fetchGlbArrayBuffer(hairUrl);
  const gltf = await parseGlbBuffer(buf);
  const underGroup = new THREE.Group();
  underGroup.name = 'Groom_VolumeUnderlayer';
  // Slightly inset so outer 3D silk curve ribbons layer seamlessly above the volume shell
  underGroup.scale.set(0.992, 0.994, 0.992);

  const hairColorHex = config.hairColor || config.materials?.hairColorHex || '#191518';
  const baseColor = new THREE.Color(hairColorHex);
  const displayColor = baseColor.clone().lerp(new THREE.Color(0x3a2b2d), 0.16);
  const sheenIntensity = Number(config.hairSheen ?? 0.88);

  gltf.scene.traverse((child) => {
    if (!child.isMesh) return;
    child.userData.normalRepair = repairHairNormals(child.geometry);
    const origMat = child.material;
    let mapTex = origMat?.map || null;
    let roughTex = null;
    if (mapTex) {
      mapTex.colorSpace = THREE.SRGBColorSpace;
      mapTex.anisotropy = 8;
      try {
        const img = mapTex.image;
        const iw = img ? img.width || img.naturalWidth || 0 : 0;
        if (img && iw > 0) {
          const detail = getHairStrandTextures(mapTex, `${hairUrl}|${origMat.name}|${mapTex.name}`);
          mapTex = detail.map;
          roughTex = detail.roughnessMap;
        }
      } catch (_) {
        roughTex = null;
      }
    }
    const hairLum = 0.299 * displayColor.r + 0.587 * displayColor.g + 0.114 * displayColor.b;
    const hairEnvI = 0.28 + Math.min(0.32, hairLum * 0.50);
    child.material = new THREE.MeshPhysicalMaterial({
      map: mapTex,
      roughnessMap: roughTex,
      color: displayColor,
      roughness: roughTex ? 1.0 : Math.max(0.40, 0.64 - sheenIntensity * 0.16),
      metalness: 0.0,
      sheen: Math.min(0.26, sheenIntensity * 0.28),
      sheenRoughness: 0.52,
      sheenColor: displayColor.clone().multiplyScalar(1.12),
      anisotropy: 0.45 + sheenIntensity * 0.30,
      anisotropyRotation: Math.PI / 2,
      clearcoat: 0.06,
      clearcoatRoughness: 0.44,
      specularIntensity: 0.55,
      envMapIntensity: hairEnvI,
      transparent: false,
      alphaTest: mapTex ? 0.14 : 0.0,
      alphaToCoverage: true,
      depthWrite: true,
      side: THREE.DoubleSide,
    });
    child.material.userData.builtInHair = true;
    child.castShadow = true;
    child.receiveShadow = true;
    child.renderOrder = 1;
  });

  underGroup.add(gltf.scene);
  return underGroup;
}

/** Dispose an assembled tree without invalidating shared procedural textures. */
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
  const sheen = Math.max(.2, Math.min(1, Number(value) || .88));
  node?.getObjectByName('HairGroup')?.traverse(child => {
    if (!child.isMesh || !child.material?.userData?.builtInHair) return;
    if (child.material.userData.curveGroom) {
      child.material.roughness = .60 - sheen * .18;
      child.material.specularIntensity = .30 + sheen * .20;
      return;
    }
    child.material.sheen = Math.min(.24, sheen * .25);
    child.material.roughness = child.material.roughnessMap ? 1 : .65 - sheen * .12;
    child.material.anisotropy = .35 + sheen * .35;
  });
}

export async function attachRealHairModel(rootGroup, config = {}) {
  const modelContainer = rootGroup.getObjectByName('RealDazHeadContainer');
  if (!modelContainer) return null;

  // Remove legacy shell even when changing to bald / a failed hair load.
  const legacyCap = modelContainer.getObjectByName('ScalpCap');
  if (legacyCap) {
    legacyCap.removeFromParent();
    legacyCap.geometry.dispose();
    legacyCap.material.dispose();
  }
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

  const groomId = !config.customHairUrl ? groomStyleFor(resolvedStyle) : null;
  if (groomId) {
    try {
      const groom = await buildCurveGroom(groomId, rootGroup.getObjectByName('HeadSkinMesh'), config);
      if (rootGroup.userData.hairRequestSerial !== request) { disposeHeadNode(groom); return null; }
      disposeHeadNode(oldHair);
      modelContainer.add(groom);
      try {
        const underlayer = await buildHairVolumeUnderlayer(resolvedStyle, config);
        if (underlayer) {
          if (rootGroup.userData.hairRequestSerial !== request) disposeHeadNode(underlayer);
          else groom.add(underlayer);
        }
      } catch (_) { /* 发量层失败则纯发丝呈现 */ }
      rootGroup.userData.currentHairStyle = groomId;
      rootGroup.userData.groomStats = groom.userData.groom;
      if (rootGroup.userData.currentMorphs) applyHeadMorphsToGroup(rootGroup, rootGroup.userData.currentMorphs);
      return groom;
    } catch (error) {
      console.error('Groom 曲线构建失败', error);
      throw error; // Do not silently claim a failed new groom is the old hair.
    }
  }
  delete rootGroup.userData.groomStats;
  const hairUrl = config.customHairUrl || `/models/${resolvedStyle}.glb`;

  try {
    const buf = await fetchGlbArrayBuffer(hairUrl);
    const gltf = await parseGlbBuffer(buf);
    if (rootGroup.userData.hairRequestSerial !== request) { disposeHeadNode(gltf.scene); return null; }
    const hairGroup = new THREE.Group();
    hairGroup.name = 'HairGroup';

    const hairColorHex = config.hairColor || config.materials?.hairColorHex || '#191518';
    const baseColor = new THREE.Color(hairColorHex);
    // Keep black/brown hair dark; a heavy grey tint + clearcoat made the demo
    // hair read as a grey plastic helmet under the studio environment.
    const displayColor = baseColor.clone().lerp(new THREE.Color(0x493a3c), 0.18);
    const sheenIntensity = Number(config.hairSheen ?? 0.88);

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        if (config.customHairUrl) {
          const materials = Array.isArray(child.material) ? child.material : [child.material];
          materials.forEach(prepareImportedMaterial);
          child.castShadow = child.receiveShadow = true;
          return; // User-owned atlases/PBR must never be replaced by demo textures.
        }
        child.userData.normalRepair = repairHairNormals(child.geometry);
        const origMat = child.material;
        let mapTex = origMat?.map || null;
        let roughTex = null;
        if (mapTex) {
          mapTex.colorSpace = THREE.SRGBColorSpace;
          mapTex.anisotropy = 8;
          // Stage 10：GLB 内 256² 灰糊发丝 → 运行时重制 1024² 脆发丝 + 配准粗糙图
          // （保留 GLB alpha 镂空；displayColor 照常染色；失败则回退原图）
          try {
            const img = mapTex.image;
            const iw = img ? img.width || img.naturalWidth || 0 : 0;
            if (img && iw > 0) {
              const detail = getHairStrandTextures(mapTex, `${hairUrl}|${origMat.name}|${mapTex.name}`);
              mapTex = detail.map;
              roughTex = detail.roughnessMap;
            }
          } catch (e) {
            console.warn('Hair detail enhancement unavailable; retaining original atlas', e);
            roughTex = null;
          }
        }
        // Stage 8b 发丝束感：黑发底要深但束间要有对比——环境光托底防压黑 + 强各向异性拉出束状挑染高光，
        // 釉面压到最低只留紧致闪点（去头盔感），绒光放宽变柔（去单团假高光）
        const hairLum = 0.299 * displayColor.r + 0.587 * displayColor.g + 0.114 * displayColor.b;
        // Stage 8b+9 合并甜点：Stage 9 调暗了整套灯阵（exposure 1.0/弱fill），发丝取中间值——
        // 既不回到 8a 的黑压碎糊团（env 0.32），也不用 Stage 9 的 0.16 极暗（用户刚抱怨过糊）；
        // 强各向异性 0.85 保留束状挑染（束感核心），spec 取中保证弱灯下仍有束闪
        const hairEnvI = 0.32 + Math.min(0.38, hairLum * 0.60);
        const hairSheen = Math.min(0.30, sheenIntensity * 0.32);
        child.material = new THREE.MeshPhysicalMaterial({
          map: mapTex,
          roughnessMap: roughTex,
          color: displayColor,
          // 有 roughnessMap 时标量置 1（粗糙完全由发丝纹理携带）
          roughness: roughTex ? 1.0 : Math.max(0.36, 0.62 - sheenIntensity * 0.16),
          metalness: 0.0,
          sheen: hairSheen,
          sheenRoughness: 0.55,
          sheenColor: displayColor.clone().multiplyScalar(1.15),
          anisotropy: 0.35 + sheenIntensity * 0.35,
          anisotropyRotation: Math.PI / 2,
          clearcoat: 0.09,
          clearcoatRoughness: 0.40,
          specularIntensity: 0.75,
          envMapIntensity: hairEnvI,
          // Stage 10：发片正确做法——不透明 + alphaTest 脆边 + alphaToCoverage 柔边，
          // 告别 transparent 排序错乱造成的团块/光晕；depthWrite 保证发片间正确遮挡
          transparent: false,
          alphaTest: mapTex ? 0.14 : 0.0,
          alphaToCoverage: true,
          depthWrite: true,
          side: THREE.DoubleSide,
        });
        child.material.userData.builtInHair = true;
        // Use actual scene lights. The old KK hook added unshadowed white emission
        // from a hard-coded direction and mixed world/view normals, lighting cards
        // as independent silver triangles rather than coherent hair.
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    hairGroup.add(gltf.scene);
    disposeHeadNode(oldHair);
    modelContainer.add(hairGroup);
    rootGroup.userData.currentHairStyle = resolvedStyle;
    if (rootGroup.userData.currentMorphs) {
      applyHeadMorphsToGroup(rootGroup, rootGroup.userData.currentMorphs);
    }
    return hairGroup;
  } catch (err) {
    console.warn('Failed to load real 3D hair GLB:', hairUrl, err);
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

/**
 * Builds a collectible head node from either the bundled demo GLB or a user's
 * head-only GLB. User materials are retained; custom assets are uniformly fit
 * to the studio viewport without promising automatic photo-to-3D reconstruction.
 */
export async function buildCollectibleHeadNode(config = {}) {
  const rootGroup = new THREE.Group();
  rootGroup.name = `Collectible_${config.id || 'StudioDraft'}`;
  rootGroup.userData.collectibleId = config.id || 'StudioDraft';
  rootGroup.userData.basePreset = config.basePreset || 'user_photo';
  rootGroup.userData.deadExpression = config.deadExpression || config.morphs?.deadExpression || 'dead_calm';

  const morphs = {
    ...(config.morphs || {}),
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
      // Keep user-owned DAZ/Blender glTF PBR maps intact. Replacing these with the
      // demo material was flattening high-resolution skin into a pale, waxy look.
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

      const skinMap = child.material?.map || null;
      const skinNorm = child.material?.normalMap || null;
      if (skinMap) {
        skinMap.colorSpace = THREE.SRGBColorSpace;
        skinMap.anisotropy = 8;
      }
      // Stage 7/8 写实皮肤：微观粗糙/毛孔 + 次表面暖调 + IBL（Stage 8 降低自发光洗白、增强毛孔法线）
      const skinMicro = createSkinMicroMaps();
      for (const texture of Object.values(skinMicro)) {
        if (texture?.isTexture) texture.userData.sharedSkinMicro = true;
      }
      child.material = new THREE.MeshPhysicalMaterial({
        map: skinMap,
        normalMap: skinNorm,
        normalScale: new THREE.Vector2(0.50, 0.50),
        roughnessMap: skinMicro.roughnessMap,
        bumpMap: skinMicro.bumpMap,
        bumpScale: 0.042,
        color: computeSkinTintColor(skinToneHex),
        roughness: Number(materials.skinRoughness ?? 0.62),
        metalness: 0.0,
        sheen: 0.16,
        sheenRoughness: 0.62,
        sheenColor: new THREE.Color('#e8a49b'),
        clearcoat: 0.05,
        clearcoatRoughness: 0.55,
        specularIntensity: 0.38,
        ior: 1.42,
        envMapIntensity: 0.34,
        emissive: new THREE.Color('#000000'),
        emissiveIntensity: 0.0,
      });
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
        // Stage 8b+9 合并：8b 的缎面自发光（防掠射角洗白）+ Stage 9 的弱自发光（防霓虹红盘）取中——
        // 用户证实"有的角度是好的"，保留中等自发光保证仰视可读，同时缎面粗糙杀死镜面泛白
        emissiveIntensity: 0.35,
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
        roughness: 0.08,
        metalness: 0.0,
        clearcoat: 0.92,
        clearcoatRoughness: 0.04,
        specularIntensity: 1.0,
        ior: 1.38,
        envMapIntensity: 1.60,
      });
    } else if (matName === 'Cornea') {
      child.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffffff'),
        transparent: true,
        // Linear HDR composites highlights before tonemapping; a thick white
        // overlay would wash out the iris in the post chain.
        opacity: 0.04,
        roughness: 0.04,
        metalness: 0.0,
        clearcoat: 0.40,
        clearcoatRoughness: 0.01,
        specularIntensity: 0.65,
        ior: 1.38,
        envMapIntensity: 0.35,
        depthWrite: false,
      });
    } else if (matName === 'Eyebrow') {
      const browMap = child.material?.map || null;
      child.material = new THREE.MeshStandardMaterial({
        map: browMap,
        color: new THREE.Color('#241a18'),
        transparent: true,
        alphaTest: 0.06,
        depthWrite: false,
        roughness: 0.65,
        envMapIntensity: 0.50,
        side: THREE.DoubleSide,
      });
    } else if (matName === 'Eyelash') {
      const lashMap = child.material?.map || null;
      child.material = new THREE.MeshStandardMaterial({
        map: lashMap,
        color: new THREE.Color('#100c0d'),
        transparent: true,
        alphaTest: 0.10,
        roughness: 0.40,
        envMapIntensity: 0.50,
        side: THREE.DoubleSide,
      });
    } else if (matName === 'Teeth' || child.name === 'Teeth') {
      const teethMap = child.material?.map || null;
      if (teethMap) {
        teethMap.colorSpace = THREE.SRGBColorSpace;
      }
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
      if (tongueMap) {
        tongueMap.colorSpace = THREE.SRGBColorSpace;
      }
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
    // DAZ exports can be centimeters/meters and use a different origin. Fit a
    // head-only GLB into the studio's known head scale without changing its aspect.
    modelContainer.add(fitImportedHead(gltf.scene));
  }

  await attachRealHairModel(rootGroup, config);
  applyHeadMorphsToGroup(rootGroup, morphs);

  const gimbalGroup = buildGimbalOverlayGroup();
  rootGroup.add(gimbalGroup);
  rootGroup.userData.gimbalGroup = gimbalGroup;
  rootGroup.userData.headMesh = headSkinMesh;
  rootGroup.userData.capMesh = neckCapMesh;

  return rootGroup;
}

export const assembleCollectibleHead = buildCollectibleHeadNode;
