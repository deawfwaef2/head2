import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { createAnatomyTextures } from '../textures/anatomyTextureGenerator.js';

const gltfLoader = new GLTFLoader();
const objLoader = new OBJLoader();

// Cache ArrayBuffers so loading or cloning heads & 3D hair GLBs is instant
const arrayBufferCache = new Map();

// Converts 0.24m real-world MakeHuman/Daz head height to 27.6cm scene units
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
  const resp = await fetch(url);
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

// Preset baseline morph offsets so Lin Xi, Su Wan, Qian Xue, and Shen Zhiwei each have distinct East Asian facial bone structure
const PRESET_MORPH_BIASES = {
  linxi: { jawVLine: 0.12, cheekSoftness: 0.10, noseBridge: 0.12, eyeAlmond: 0.14, lipFullness: 0.15 },
  suwan: { jawVLine: 0.28, cheekSoftness: 0.04, noseBridge: 0.25, eyeAlmond: 0.28, lipFullness: 0.05 },
  qianxue: { jawVLine: 0.22, cheekSoftness: 0.18, noseBridge: 0.20, eyeAlmond: 0.20, lipFullness: 0.22 },
  shenzhiwei: { jawVLine: 0.06, cheekSoftness: 0.24, noseBridge: 0.08, eyeAlmond: 0.18, lipFullness: 0.28 },
};

/**
 * Applies facial morph sliders to all morph-enabled meshes inside `rootGroup`
 * (including HeadSkin, Eyebrows, Eyelashes, Eyes, and the attached 3D Hair GLB).
 */
export function applyHeadMorphsToGroup(rootGroup, morphs = {}) {
  if (!rootGroup) return;
  rootGroup.userData.currentMorphs = { ...(rootGroup.userData.currentMorphs || {}), ...morphs };
  const m = rootGroup.userData.currentMorphs;
  const presetKey = rootGroup.userData.basePreset || 'linxi';
  const bias = PRESET_MORPH_BIASES[presetKey] || PRESET_MORPH_BIASES.linxi;

  // Support both Studio UI slider names (jawVLine, cheekSoftness, noseBridge, eyeAlmond, lipFullness)
  // and detailed morph keys (jawWidth, chinLength, etc.)
  const jawV = (m.jawVLine ?? -(m.jawWidth ?? 0)) + bias.jawVLine * 0.5;
  const cheek = (m.cheekSoftness ?? m.cheekboneFullness ?? 0) + bias.cheekSoftness * 0.5;
  const nose = (m.noseBridge ?? m.noseBridgeHeight ?? 0) + bias.noseBridge * 0.5;
  const eye = (m.eyeAlmond ?? m.eyeSize ?? 0) + bias.eyeAlmond * 0.5;
  const lip = (m.lipFullness ?? 0) + bias.lipFullness * 0.5;
  const forehead = Number(m.foreheadHeight ?? 0);
  const ear = Number(m.earSize ?? 0);

  const targetWeights = {
    face_jaw_width_decr: jawV > 0 ? Math.min(1.25, jawV * 1.45) : 0,
    face_jaw_width_incr: jawV < 0 ? Math.min(1.15, -jawV * 1.35) : 0,
    face_chin_decr: jawV > 0 ? Math.min(1.0, jawV * 0.85) : 0,
    face_chin_incr: jawV < 0 ? Math.min(1.0, -jawV * 0.85) : 0,
    face_cheekbones_incr: cheek > 0 ? Math.min(1.2, cheek * 1.4) : 0,
    face_cheekbones_decr: cheek < 0 ? Math.min(1.2, -cheek * 1.4) : 0,
    face_nose_height_incr: nose > 0 ? Math.min(1.2, nose * 1.35) : 0,
    face_nose_height_decr: nose < 0 ? Math.min(1.2, -nose * 1.35) : 0,
    face_nose_width_decr: nose > 0 ? Math.min(1.1, nose * 0.95) : 0,
    face_nose_width_incr: nose < 0 ? Math.min(1.1, -nose * 0.95) : 0,
    face_eye_size_incr: eye > 0 ? Math.min(0.95, eye * 1.15) : 0,
    face_eye_size_decr: eye < 0 ? Math.min(0.95, -eye * 1.15) : 0,
    face_eye_tilt_incr: eye > 0 ? Math.min(1.1, eye * 1.25) : 0,
    face_eye_tilt_decr: eye < 0 ? Math.min(1.1, -eye * 1.25) : 0,
    face_lips_incr: lip > 0 ? Math.min(1.25, lip * 1.45) : 0,
    face_lips_decr: lip < 0 ? Math.min(1.15, -lip * 1.35) : 0,
    face_mouth_width_decr: lip > 0 ? Math.min(0.85, lip * 0.65) : 0,
    face_forehead_incr: forehead > 0 ? Math.min(1.0, forehead * 1.3) : 0,
    face_forehead_decr: forehead < 0 ? Math.min(1.0, -forehead * 1.3) : 0,
    face_ear_size_incr: ear > 0 ? Math.min(1.0, ear * 1.3) : 0,
    face_ear_size_decr: ear < 0 ? Math.min(1.0, -ear * 1.3) : 0,
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

  // Apply neck cross-section cut height offset or tilt if adjusted
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
 * Updates real-time blinking (`blink_left`, `blink_right`) and 3D eyeball cursor tracking
 * (`look_left`, `look_right`, `look_up`, `look_down`) on the head collectible!
 */
export function updateHeadLifeAnimation(rootGroup, dt = 0.016, targetGazeX = 0, targetGazeY = 0) {
  if (!rootGroup) return;
  if (!rootGroup.userData.eyeLife) {
    rootGroup.userData.eyeLife = {
      timer: 1.0 + Math.random() * 2.4,
      blinkPhase: -1,
      blinkDuration: 0.16,
      gazeX: 0,
      gazeY: 0,
    };
  }
  const life = rootGroup.userData.eyeLife;
  life.timer -= dt;
  if (life.timer <= 0 && life.blinkPhase < 0) {
    life.blinkPhase = 0;
    life.timer = 2.4 + Math.random() * 3.0;
  }

  let blinkWeight = 0;
  if (life.blinkPhase >= 0) {
    life.blinkPhase += dt / life.blinkDuration;
    if (life.blinkPhase >= 1.0) {
      life.blinkPhase = -1;
      blinkWeight = 0;
    } else {
      const t = life.blinkPhase;
      blinkWeight = t < 0.36 ? (t / 0.36) : (1.0 - (t - 0.36) / 0.64);
      blinkWeight = Math.max(0, Math.min(1, blinkWeight));
    }
  }

  const damp = Math.min(1, dt * 8.5);
  life.gazeX += (targetGazeX - life.gazeX) * damp;
  life.gazeY += (targetGazeY - life.gazeY) * damp;

  const gx = Math.max(-0.85, Math.min(0.85, life.gazeX));
  const gy = Math.max(-0.75, Math.min(0.75, life.gazeY));

  rootGroup.traverse((child) => {
    if (!child.isMesh || !child.morphTargetDictionary || !child.morphTargetInfluences) return;
    const dict = child.morphTargetDictionary;
    const infl = child.morphTargetInfluences;

    if ('blink_left' in dict) infl[dict.blink_left] = blinkWeight * 0.88;
    if ('blink_right' in dict) infl[dict.blink_right] = blinkWeight * 0.88;

    if ('look_right' in dict) infl[dict.look_right] = gx > 0 ? gx : 0;
    if ('look_left' in dict) infl[dict.look_left] = gx < 0 ? -gx : 0;
    if ('look_up' in dict) infl[dict.look_up] = gy > 0 ? gy : 0;
    if ('look_down' in dict) infl[dict.look_down] = gy < 0 ? -gy : 0;
  });
}

export function triggerCollectibleBlink(rootGroup) {
  if (!rootGroup || !rootGroup.userData.eyeLife) return;
  rootGroup.userData.eyeLife.blinkPhase = 0;
}

function computeSkinTintColor(skinToneHex = '#ffe8df') {
  const c = new THREE.Color(skinToneHex || '#ffe8df');
  const r = Math.min(1.08, Math.max(0.80, 0.74 + c.r * 0.28));
  const g = Math.min(1.06, Math.max(0.77, 0.74 + c.g * 0.29));
  const b = Math.min(1.06, Math.max(0.76, 0.74 + c.b * 0.30));
  return new THREE.Color(r, g, b);
}

/**
 * Resolves any hair style ID (including legacy names) to one of the 7 real 3D hair GLBs
 */
export function resolveRealHairStyle(styleName = 'hair_long01') {
  if (styleName === 'none') return 'none';
  const legacyMap = {
    long_straight: 'hair_long01',
    long_waves: 'hair_long01',
    hime_cut: 'hair_bob01',
    sleek_bob: 'hair_bob02',
    short_bob: 'hair_bob02',
    low_chignon: 'hair_ponytail01',
    high_ponytail: 'hair_ponytail01',
    soft_waves: 'hair_braid01',
  };
  const mapped = legacyMap[styleName] || styleName;
  const valid = new Set([
    'hair_long01',
    'hair_bob01',
    'hair_bob02',
    'hair_ponytail01',
    'hair_braid01',
    'hair_short02',
    'hair_short04',
  ]);
  return valid.has(mapped) ? mapped : 'hair_long01';
}

export async function attachRealHairModel(rootGroup, config = {}) {
  const modelContainer = rootGroup.getObjectByName('RealDazHeadContainer');
  if (!modelContainer) return null;

  const oldHair = modelContainer.getObjectByName('HairGroup');
  if (oldHair) {
    modelContainer.remove(oldHair);
  }

  const rawStyle = config.hairStyle || config.materials?.hairStyle || 'hair_long01';
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

    const hairColorHex = config.hairColor || config.materials?.hairColorHex || '#1c1624';
    const baseColor = new THREE.Color(hairColorHex);
    const displayColor = new THREE.Color(
      Math.max(0.14, baseColor.r * 1.25),
      Math.max(0.11, baseColor.g * 1.25),
      Math.max(0.15, baseColor.b * 1.25)
    );
    const sheenIntensity = Number(config.hairSheen ?? 0.90);

    gltf.scene.traverse((child) => {
      if (child.isMesh) {
        const origMat = child.material;
        const mapTex = origMat?.map || null;
        if (mapTex) {
          mapTex.colorSpace = THREE.SRGBColorSpace;
          mapTex.anisotropy = 8;
        }
        child.material = new THREE.MeshPhysicalMaterial({
          map: mapTex,
          color: displayColor,
          roughness: Math.max(0.22, 0.55 - sheenIntensity * 0.25),
          metalness: 0.04,
          sheen: sheenIntensity * 0.55,
          sheenRoughness: 0.32,
          sheenColor: displayColor.clone().multiplyScalar(1.65),
          transparent: true,
          alphaTest: 0.16,
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
 * Builds the complete High-Precision Collectible Head Bust Node (`只有头 + C4/C5 解剖断面 + 真实3D头发`)
 */
export async function buildCollectibleHeadNode(config = {}) {
  const rootGroup = new THREE.Group();
  rootGroup.name = `Collectible_${config.id || 'StudioDraft'}`;
  rootGroup.userData.collectibleId = config.id || 'StudioDraft';
  rootGroup.userData.basePreset = config.basePreset || 'linxi';

  const morphs = config.morphs || {};
  const materials = config.materials || {};
  rootGroup.userData.currentMorphs = { ...morphs };

  const modelContainer = new THREE.Group();
  modelContainer.name = 'RealDazHeadContainer';
  modelContainer.scale.setScalar(BUST_WORLD_SCALE);
  rootGroup.add(modelContainer);

  const skinToneHex = config.skinTone || materials.skinToneHex || '#ffe8df';
  const wetness = Number(config.anatomyOptions?.wetness ?? materials.crossSectionWetness ?? 0.86);
  const vascularContrast = Number(config.anatomyOptions?.vascularContrast ?? materials.crossSectionVeinContrast ?? 1.15);
  const showLabels = Boolean(config.anatomyOptions?.showLabels);

  const { colorTex, bumpTex } = createAnatomyTextures({
    skinColor: skinToneHex,
    vascularContrast,
    dermisRimScale: 1.0,
    showLabels,
  });

  // Determine model URL (defaulting to our real compiled East Asian Female Head GLB)
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
      child.material = new THREE.MeshPhysicalMaterial({
        map: skinMap,
        normalMap: skinNorm,
        normalScale: new THREE.Vector2(0.28, 0.28),
        color: computeSkinTintColor(skinToneHex),
        roughness: Number(materials.skinRoughness ?? 0.36),
        metalness: 0.0,
        sheen: 0.28,
        sheenRoughness: 0.62,
        sheenColor: new THREE.Color('#ff9d8f'),
        clearcoat: 0.08,
        clearcoatRoughness: 0.40,
      });
    } else if (matName === 'NeckCrossSection' || child.name === 'NeckCrossSection') {
      child.name = 'NeckCrossSectionCap';
      neckCapMesh = child;
      child.geometry.userData = child.geometry.userData || {};
      child.geometry.userData.parentHeadGroup = rootGroup;
      child.userData.basePositions = true;

      child.material = new THREE.MeshPhysicalMaterial({
        map: colorTex,
        bumpMap: bumpTex,
        bumpScale: 0.0035,
        roughness: Math.max(0.08, 1.0 - wetness * 0.88),
        metalness: 0.02,
        clearcoat: wetness * 0.95,
        clearcoatRoughness: 0.10,
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
        roughness: 0.06,
        metalness: 0.0,
        clearcoat: 0.95,
        clearcoatRoughness: 0.03,
      });
    } else if (matName === 'Cornea') {
      child.material = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: 0.16,
        roughness: 0.02,
        metalness: 0.0,
        clearcoat: 1.0,
        clearcoatRoughness: 0.01,
        depthWrite: false,
      });
    } else if (matName === 'Eyebrow') {
      const browMap = child.material?.map || null;
      child.material = new THREE.MeshStandardMaterial({
        map: browMap,
        color: new THREE.Color('#2a1f1d'),
        transparent: true,
        alphaTest: 0.06,
        depthWrite: false,
        roughness: 0.65,
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
        side: THREE.DoubleSide,
      });
    }
  });

  modelContainer.add(gltf.scene);

  // Attach real 3D Hair GLB
  await attachRealHairModel(rootGroup, config);

  // Apply initial facial morphs
  applyHeadMorphsToGroup(rootGroup, morphs);

  // Attach 360° Rotation Gimbal Rings
  const gimbalGroup = buildGimbalOverlayGroup();
  rootGroup.add(gimbalGroup);
  rootGroup.userData.gimbalGroup = gimbalGroup;
  rootGroup.userData.headMesh = headSkinMesh;
  rootGroup.userData.capMesh = neckCapMesh;

  return rootGroup;
}

export const assembleCollectibleHead = buildCollectibleHeadNode;
