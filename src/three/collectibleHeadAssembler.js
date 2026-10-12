import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { createAnatomyTextures } from '../textures/anatomyTextureGenerator.js';
import { createSkinMicroMaps } from '../textures/skinTextureGenerator.js';
import { resolvePrivateModelUrl } from '../data/privateModelStore.js';

const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

const arrayBufferCache = new Map();
const BUST_WORLD_SCALE = 115.0;

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

// Subtle bone-structure biases per preset — NOTE: lipFullness is 0.0 across all presets so mouth is NEVER pouty ("嘟嘟嘴")!
const PRESET_MORPH_BIASES = {
  user_photo: { jawVLine: 0.02, cheekSoftness: 0.16, noseBridge: 0.02, eyeAlmond: 0.06, lipFullness: 0.0 },
  linxi: { jawVLine: 0.10, cheekSoftness: 0.10, noseBridge: 0.10, eyeAlmond: 0.10, lipFullness: 0.0 },
  suwan: { jawVLine: 0.22, cheekSoftness: 0.04, noseBridge: 0.20, eyeAlmond: 0.22, lipFullness: 0.0 },
  qianxue: { jawVLine: 0.18, cheekSoftness: 0.14, noseBridge: 0.16, eyeAlmond: 0.16, lipFullness: 0.0 },
  shenzhiwei: { jawVLine: 0.06, cheekSoftness: 0.20, noseBridge: 0.06, eyeAlmond: 0.14, lipFullness: 0.0 },
};

/**
 * Applies facial morph sliders to all morph-enabled meshes inside `rootGroup`.
 * Never narrows mouth width automatically so lips remain flat, calm, and lifeless.
 */
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
    blink_left: 0,
    blink_right: 0,
    look_left: 0,
    look_right: 0,
    look_up: 0,
    look_down: 0,
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
 * Keeps eyelids and eyeballs 100% motionless in their calm, still specimen state.
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

export function resolveRealHairStyle(styleName = 'hair_user_photo') {
  if (styleName === 'none') return 'none';
  const legacyMap = {
    user_bangs: 'hair_user_photo',
    long_straight: 'hair_long01',
    long_waves: 'hair_long01',
    hime_cut: 'hair_user_photo',
    sleek_bob: 'hair_bob02',
    short_bob: 'hair_bob02',
    low_chignon: 'hair_ponytail01',
    high_ponytail: 'hair_ponytail01',
    soft_waves: 'hair_braid01',
  };
  const mapped = legacyMap[styleName] || styleName;
  const valid = new Set([
    'hair_user_photo',
    'hair_long01',
    'hair_bob01',
    'hair_bob02',
    'hair_ponytail01',
    'hair_braid01',
    'hair_short02',
    'hair_short04',
  ]);
  return valid.has(mapped) ? mapped : 'hair_user_photo';
}

export async function attachRealHairModel(rootGroup, config = {}) {
  const modelContainer = rootGroup.getObjectByName('RealDazHeadContainer');
  if (!modelContainer) return null;

  const oldHair = modelContainer.getObjectByName('HairGroup');
  if (oldHair) {
    modelContainer.remove(oldHair);
  }

  const rawStyle = config.hairStyle || config.materials?.hairStyle || 'hair_user_photo';
  const resolvedStyle = resolveRealHairStyle(rawStyle);
  if (resolvedStyle === 'none') {
    rootGroup.userData.currentHairStyle = 'none';
    return null;
  }

  const hairUrl = config.customHairUrl || `/models/${resolvedStyle}.glb`;

  try {
    const buf = await fetchGlbArrayBuffer(hairUrl);
    const gltf = await parseGlbBuffer(buf);
    const hairGroup = new THREE.Group();
    hairGroup.name = 'HairGroup';

    const hairColorHex = config.hairColor || config.materials?.hairColorHex || '#191518';
    const baseColor = new THREE.Color(hairColorHex);
    const displayColor = new THREE.Color(
      Math.max(0.13, baseColor.r * 1.20),
      Math.max(0.11, baseColor.g * 1.20),
      Math.max(0.13, baseColor.b * 1.20)
    );
    const sheenIntensity = Number(config.hairSheen ?? 0.88);

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const origMat = child.material;
        const mapTex = origMat?.map || null;
        if (mapTex) {
          mapTex.colorSpace = THREE.SRGBColorSpace;
          mapTex.anisotropy = 8;
        }
        // Stage 8 发丝去灰：深色发必须压低环境反射/釉面/绒光，否则 RoomEnvironment 会把黑发洗成灰白塑料感
        const hairLum = 0.299 * displayColor.r + 0.587 * displayColor.g + 0.114 * displayColor.b;
        const hairEnvI = 0.32 + Math.min(0.55, hairLum * 0.85);
        const hairSheen = Math.min(0.30, sheenIntensity * 0.30);
        child.material = new THREE.MeshPhysicalMaterial({
          map: mapTex,
          color: displayColor,
          roughness: Math.max(0.30, 0.58 - sheenIntensity * 0.22),
          metalness: 0.0,
          sheen: hairSheen,
          sheenRoughness: 0.42,
          sheenColor: displayColor.clone().multiplyScalar(1.15),
          anisotropy: 0.60,
          clearcoat: 0.22,
          clearcoatRoughness: 0.42,
          specularIntensity: 0.70,
          envMapIntensity: hairEnvI,
          transparent: true,
          alphaTest: 0.16,
          alphaToCoverage: true,
          side: THREE.DoubleSide,
        });
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    hairGroup.add(gltf.scene);
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
  const ringMat1 = new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.65 });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  gimbalGroup.add(ring1);

  const ringGeo2 = new THREE.TorusGeometry(12.4, 0.12, 12, 64);
  ringGeo2.rotateY(Math.PI / 2);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: '#f43f5e', transparent: true, opacity: 0.52 });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  gimbalGroup.add(ring2);

  return gimbalGroup;
}

/**
 * Builds the complete High-Precision Collectible Head Bust Node
 * (`只有头 + 切口真实血迹 + 高亮度 C4/C5 医学解剖断面 + 照片定制发型/7款真实3D头发 + 静态失活表情`)
 */
export async function buildCollectibleHeadNode(config = {}) {
  const rootGroup = new THREE.Group();
  rootGroup.name = `Collectible_${config.id || 'StudioDraft'}`;
  rootGroup.userData.collectibleId = config.id || 'StudioDraft';
  rootGroup.userData.basePreset = config.basePreset || 'user_photo';

  const morphs = config.morphs || {};
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
    ? '/models/daz_asian_head_base.glb'
    : customUrl;

  const buf = await fetchGlbArrayBuffer(targetGlbUrl);
  const gltf = await parseGlbBuffer(buf);

  let headSkinMesh = null;
  let neckCapMesh = null;

  gltf.scene.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;

    const matName = child.material?.name || child.name;
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
      child.material = new THREE.MeshPhysicalMaterial({
        map: skinMap,
        normalMap: skinNorm,
        normalScale: new THREE.Vector2(0.45, 0.45),
        roughnessMap: skinMicro.roughnessMap,
        bumpMap: skinMicro.bumpMap,
        bumpScale: 0.03,
        color: computeSkinTintColor(skinToneHex),
        roughness: Number(materials.skinRoughness ?? 0.62),
        metalness: 0.0,
        sheen: 0.35,
        sheenRoughness: 0.55,
        sheenColor: new THREE.Color('#ffb3a7'),
        clearcoat: 0.14,
        clearcoatRoughness: 0.50,
        specularIntensity: 0.60,
        ior: 1.46,
        envMapIntensity: 0.90,
        emissive: new THREE.Color('#2a0f0c'),
        emissiveIntensity: 0.15,
      });
    } else if (matName === 'NeckCrossSection' || child.name === 'NeckCrossSection') {
      child.name = 'NeckCrossSectionCap';
      neckCapMesh = child;
      child.geometry.userData = child.geometry.userData || {};
      child.geometry.userData.parentHeadGroup = rootGroup;
      child.userData.basePositions = true;

      // High-brightness, glistening wet C4/C5 anatomical cross-section!
      // Using emissiveMap guarantees the downward-facing section is NEVER dark or black!
      child.material = new THREE.MeshPhysicalMaterial({
        map: colorTex,
        emissiveMap: colorTex,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.74,
        bumpMap: bumpTex,
        bumpScale: 0.004,
        roughness: Math.max(0.06, 1.0 - wetness * 0.90),
        metalness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.08,
        specularIntensity: 0.70,
        envMapIntensity: 0.75,
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
        opacity: 0.15,
        roughness: 0.02,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        specularIntensity: 1.0,
        ior: 1.38,
        envMapIntensity: 2.20,
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
    }
  });

  modelContainer.add(gltf.scene);

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
