import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createDazSkinTexture } from '../textures/skinTextureGenerator.js';
import { createAnatomyTextures } from '../textures/anatomyTextureGenerator.js';
import { createRealisticHairGroup } from './hairBuilder.js';

const objCache = new Map();
const objLoader = new OBJLoader();
const gltfLoader = new GLTFLoader();

const PRESET_PATHS = {
  linxi: '/models/daz_asian_female_linxi.obj',
  suwan: '/models/daz_asian_female_suwan.obj',
  qianxue: '/models/daz_asian_female_qianxue.obj'
};

export async function loadPresetObjGeometry(preset = 'linxi') {
  const key = PRESET_PATHS[preset] ? preset : 'linxi';
  if (objCache.has(key)) {
    return objCache.get(key).clone(true);
  }
  const url = PRESET_PATHS[key];
  const loadedGroup = await new Promise((resolve, reject) => {
    objLoader.load(url, resolve, undefined, reject);
  });
  objCache.set(key, loadedGroup);
  return loadedGroup.clone(true);
}

/**
 * Applies real-time Daz-style facial bone morphs & neck cross-section cut adjustments to the head geometry
 */
export function applyHeadMorphsToGeometry(geom, basePositions, morphs = {}, isCap = false) {
  const posAttr = geom.attributes.position;
  const arr = posAttr.array;

  const {
    jawVLine = 0.0,       // -0.5 (wider) to +0.5 (sharper V-line)
    cheekSoftness = 0.0,  // -0.5 to +0.5
    noseBridge = 0.0,     // -0.5 to +0.5
    eyeAlmond = 0.0,      // -0.5 to +0.5
    lipFullness = 0.0,    // -0.5 to +0.5
    neckDiameter = 1.0,   // 0.80 to 1.20
    cutHeightOffset = 0.0,// -1.8 to +1.8 cm
    cutTiltPitch = 0.0,   // -18 to +18 deg (anterior-posterior tilt)
    cutTiltRoll = 0.0     // -15 to +15 deg (left-right tilt)
  } = morphs;

  const pitchRad = (cutTiltPitch * Math.PI) / 180;
  const rollRad = (cutTiltRoll * Math.PI) / 180;
  const neckCz = -2.35;
  const baseNeckY = -14.2;

  for (let i = 0; i < arr.length; i += 3) {
    let x = basePositions[i];
    let y = basePositions[i + 1];
    let z = basePositions[i + 2];

    if (!isCap) {
      // 1. Jaw V-line morph (y in -9.5 .. -1.0)
      if (y < -1.0 && y > -10.0 && z > -4.0) {
        const w = Math.max(0, Math.min(1, (-1.0 - y) / 8.2));
        x *= (1.0 - jawVLine * 0.24 * w);
      }
      // 2. Cheekbone softness / fullness (y in -2.5 .. +2.5)
      if (y > -2.5 && y < 2.8 && z > -2.0) {
        const w = Math.exp(-Math.pow(y / 2.0, 2));
        x *= (1.0 + cheekSoftness * 0.14 * w);
        z += cheekSoftness * 0.28 * w * Math.exp(-Math.pow((Math.abs(x) - 3.2) / 2.2, 2));
      }
      // 3. Nose bridge & tip projection
      if (Math.abs(x) < 2.2 && y > -2.2 && y < 4.2 && z > 4.2) {
        const nw = Math.exp(-Math.pow(x / 1.4, 2)) * Math.exp(-Math.pow((y - 0.8) / 2.6, 2));
        z += noseBridge * 0.65 * nw;
      }
      // 4. Eye almond tilt
      if (y > 1.2 && y < 4.0 && z > 2.4) {
        for (const ex of [-3.18, 3.18]) {
          const ew = Math.exp(-Math.pow((x - ex) / 1.5, 2)) * Math.exp(-Math.pow((y - 2.6) / 0.9, 2));
          if (ew > 0.02) {
            const outer = (Math.abs(x) - 3.18) / 1.4;
            y += eyeAlmond * 0.36 * outer * ew;
          }
        }
      }
      // 5. Lip fullness
      if (Math.abs(x) < 2.5 && y > -5.8 && y < -3.0 && z > 4.0) {
        const lw = Math.exp(-Math.pow(x / 1.9, 2)) * Math.exp(-Math.pow((y + 4.35) / 0.95, 2));
        z += lipFullness * 0.55 * lw;
      }
    }

    // 6. Neck diameter & Anatomical Cross-Section Cut Plane height/tilt (below y = -9.2)
    if (isCap || y < -9.2) {
      const neckWeight = isCap ? 1.0 : Math.max(0, Math.min(1, (-9.2 - y) / 5.0));
      const scaleR = 1.0 + (neckDiameter - 1.0) * neckWeight;
      x *= scaleR;
      z = neckCz + (z - neckCz) * scaleR;

      // Apply cutHeightOffset & tilt plane near bottom of neck
      const planeShift = cutHeightOffset + (z - neckCz) * Math.tan(pitchRad) + x * Math.tan(rollRad);
      if (isCap) {
        y += planeShift;
      } else {
        y += planeShift * (neckWeight * neckWeight);
      }
    }

    arr[i] = x;
    arr[i + 1] = y;
    arr[i + 2] = z;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

/**
 * Builds a complete interactive 3D Collectible Head Group (Head + Anatomical Cross-Section Base + Realistic Hair + Rotation Gimbal)
 */
export async function buildCollectibleHeadNode(config = {}) {
  const {
    basePreset = 'linxi',
    customModelUrl = null,
    customModelType = 'glb',
    skinTone = '#f6d8cb',
    blushIntensity = 0.48,
    lipColor = '#d45b6a',
    irisColor = '#3a2318',
    hairStyle = 'long_straight',
    hairColor = '#141116',
    hairSheen = 0.88,
    neckClearance = 0.35,
    morphs = {},
    anatomyOptions = {},
    photoElement = null,
    photoBlend = 0.0
  } = config;

  const root = new THREE.Group();
  root.name = 'CollectibleHeadRoot';

  // Generate high-res Daz skin texture & medical anatomy cross-section textures
  const { texture: skinTex, canvas: skinCanvas } = createDazSkinTexture({
    skinTone,
    blushIntensity,
    lipColor,
    irisColor,
    photoElement,
    photoBlend
  });

  const { colorTex: anatomyColorTex, bumpTex: anatomyBumpTex, colorCanvas: anatomyCanvas } = createAnatomyTextures({
    skinColor: skinTone,
    vascularContrast: anatomyOptions.vascularContrast ?? 1.0,
    dermisRimScale: anatomyOptions.dermisRimScale ?? 1.0,
    showLabels: anatomyOptions.showLabels ?? false
  });

  const wetness = anatomyOptions.wetness ?? 0.78;

  const skinMaterial = new THREE.MeshPhysicalMaterial({
    map: skinTex,
    roughness: 0.42,
    metalness: 0.02,
    clearcoat: 0.18,
    clearcoatRoughness: 0.38,
    sheen: 0.35,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color('#ffcdc2'),
    reflectivity: 0.45
  });

  const anatomyMaterial = new THREE.MeshPhysicalMaterial({
    map: anatomyColorTex,
    bumpMap: anatomyBumpTex,
    bumpScale: 0.16,
    roughness: 0.52 - wetness * 0.32,
    metalness: 0.04,
    clearcoat: wetness * 0.85,
    clearcoatRoughness: 0.16,
    side: THREE.DoubleSide
  });

  if (customModelUrl) {
    // Load external user-imported Daz .glb/.gltf/.obj and automatically slice at neck plane + attach anatomical cross-section cap!
    let extObj;
    if (customModelType === 'obj') {
      extObj = await new Promise((res, rej) => objLoader.load(customModelUrl, res, undefined, rej));
    } else {
      const gltf = await new Promise((res, rej) => gltfLoader.load(customModelUrl, res, undefined, rej));
      extObj = gltf.scene;
    }

    // Normalize bounding box to match our canonical scale (height ~ 25 units)
    const box = new THREE.Box3().setFromObject(extObj);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = 24.0 / Math.max(0.001, size.y);
    extObj.scale.setScalar(scale);
    extObj.position.set(-center.x * scale, -center.y * scale - 1.5, -center.z * scale);

    const cutY = -11.5 + (morphs.cutHeightOffset || 0);
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -cutY);

    extObj.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.clippingPlanes = [clipPlane];
        child.material.clipShadows = true;
      }
    });
    root.add(extObj);

    // Add fitted Medical Anatomical Cross-Section Cap Disc at cutY
    const capGeom = new THREE.CircleGeometry(4.5 * (morphs.neckDiameter || 1.0), 64);
    capGeom.rotateX(Math.PI / 2);
    capGeom.translate(0, cutY, -1.2);
    const capMesh = new THREE.Mesh(capGeom, anatomyMaterial);
    capMesh.name = 'neck_cross_section';
    root.add(capMesh);
  } else {
    // Load built-in subdivided Daz-style Asian female head + integrated 3D relief cross-section
    const objGroup = await loadPresetObjGeometry(basePreset);
    let headMesh = null;
    let capMesh = null;

    objGroup.traverse((child) => {
      if (child.isMesh) {
        const geom = child.geometry.clone();
        const basePos = new Float32Array(geom.attributes.position.array);
        child.userData.basePositions = basePos;
        child.geometry = geom;

        if (child.name.includes('neck_cross_section')) {
          child.material = anatomyMaterial;
          applyHeadMorphsToGeometry(geom, basePos, morphs, true);
          capMesh = child;
        } else {
          child.material = skinMaterial;
          applyHeadMorphsToGeometry(geom, basePos, morphs, false);
          headMesh = child;
        }
      }
    });

    root.add(objGroup);

    // Attach realistic multi-layer hair system
    if (hairStyle !== 'none') {
      const hairGroup = createRealisticHairGroup({
        style: hairStyle,
        hairColor,
        sheenIntensity: hairSheen,
        neckClearance
      });
      root.add(hairGroup);
    }

    root.userData.headMesh = headMesh;
    root.userData.capMesh = capMesh;
  }

  // Add subtle 3D Rotation Mode Gimbal Rings (hidden until user clicks pet to enter Rotation Mode)
  const gimbalGroup = new THREE.Group();
  gimbalGroup.name = 'RotationGimbal';
  gimbalGroup.visible = false;

  const ringGeo1 = new THREE.TorusGeometry(11.8, 0.08, 12, 72);
  const ringMat1 = new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.65 });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.y = -2.0;

  const ringGeo2 = new THREE.TorusGeometry(12.4, 0.06, 12, 72);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: '#f43f5e', transparent: true, opacity: 0.45 });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.position.y = -2.0;

  gimbalGroup.add(ring1, ring2);
  root.add(gimbalGroup);

  root.userData.gimbalGroup = gimbalGroup;
  root.userData.skinCanvas = skinCanvas;
  root.userData.anatomyCanvas = anatomyCanvas;
  root.userData.skinMaterial = skinMaterial;
  root.userData.anatomyMaterial = anatomyMaterial;

  return root;
}
