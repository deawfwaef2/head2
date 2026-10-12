import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { createDazSkinTexture, createRealisticHairStrandTexture, createRealisticHairNormalTexture } from '../textures/skinTextureGenerator.js';
import { createAnatomyTextures } from '../textures/anatomyTextureGenerator.js';
import { createRealisticHairGroup } from './hairBuilder.js';

const objCache = new Map();
const objLoader = new OBJLoader();
const gltfLoader = new GLTFLoader();

// Standalone HTML embeds model text under window.__EMBEDDED_MODELS__ keyed by file basename or preset key.
function embeddedModelText(urlOrKey) {
  if (typeof window === 'undefined' || !window.__EMBEDDED_MODELS__) return null;
  if (window.__EMBEDDED_MODELS__[urlOrKey]) return window.__EMBEDDED_MODELS__[urlOrKey];
  const name = String(urlOrKey).split('/').pop();
  return window.__EMBEDDED_MODELS__[name] || null;
}

async function loadObjAny(url) {
  const cacheKey = `url:${url}`;
  if (objCache.has(cacheKey)) {
    return objCache.get(cacheKey).clone(true);
  }
  const txt = embeddedModelText(url);
  if (txt) {
    const parsed = objLoader.parse(txt);
    objCache.set(cacheKey, parsed);
    return parsed.clone(true);
  }
  const loaded = await new Promise((res, rej) => objLoader.load(url, res, undefined, rej));
  objCache.set(cacheKey, loaded);
  return loaded.clone(true);
}

const PRESET_PATHS = {
  linxi: '/models/daz_asian_female_linxi.obj',
  suwan: '/models/daz_asian_female_suwan.obj',
  qianxue: '/models/daz_asian_female_qianxue.obj',
  mh_asian: '/models/mh_asian_female_head.obj'
};

export async function loadPresetObjGeometry(preset = 'linxi') {
  const key = PRESET_PATHS[preset] ? preset : 'linxi';
  if (objCache.has(key)) {
    return objCache.get(key).clone(true);
  }

  const embedded = embeddedModelText(key) || embeddedModelText(PRESET_PATHS[key]);
  if (embedded) {
    const parsed = objLoader.parse(embedded);
    objCache.set(key, parsed);
    return parsed.clone(true);
  }

  const url = PRESET_PATHS[key];
  const loadedGroup = await new Promise((resolve, reject) => {
    objLoader.load(url, resolve, undefined, reject);
  });
  objCache.set(key, loadedGroup);
  return loadedGroup.clone(true);
}

/**
 * Builds a position-welded vertex map for unindexed BufferGeometry (from OBJLoader)
 * so we can compute 100% seamless Phong/PBR smooth vertex normals with zero polygon facets!
 */
function buildPositionWeldData(posArray) {
  const numVerts = posArray.length / 3;
  const vertToUnique = new Int32Array(numVerts);
  const map = new Map();
  let uniqueCount = 0;

  for (let i = 0; i < numVerts; i++) {
    const x = Math.round(posArray[i * 3] * 2000);
    const y = Math.round(posArray[i * 3 + 1] * 2000);
    const z = Math.round(posArray[i * 3 + 2] * 2000);
    const key = `${x},${y},${z}`;
    let uid = map.get(key);
    if (uid === undefined) {
      uid = uniqueCount++;
      map.set(key, uid);
    }
    vertToUnique[i] = uid;
  }

  return {
    vertToUnique,
    uniqueCount,
    accumNormals: new Float32Array(uniqueCount * 3)
  };
}

/**
 * Computes true welded smooth vertex normals across all triangles sharing the same 3D position
 */
export function computeWeldedSmoothNormals(geom, weldData) {
  const pos = geom.attributes.position.array;
  let normAttr = geom.attributes.normal;
  if (!normAttr || normAttr.array.length !== pos.length) {
    normAttr = new THREE.BufferAttribute(new Float32Array(pos.length), 3);
    geom.setAttribute('normal', normAttr);
  }
  const norm = normAttr.array;
  const { vertToUnique, uniqueCount, accumNormals } = weldData;
  accumNormals.fill(0);

  const numTris = pos.length / 9;
  for (let t = 0; t < numTris; t++) {
    const i0 = t * 3;
    const i1 = i0 + 1;
    const i2 = i0 + 2;

    const p0x = pos[i0 * 3], p0y = pos[i0 * 3 + 1], p0z = pos[i0 * 3 + 2];
    const ux = pos[i1 * 3] - p0x, uy = pos[i1 * 3 + 1] - p0y, uz = pos[i1 * 3 + 2] - p0z;
    const vx = pos[i2 * 3] - p0x, vy = pos[i2 * 3 + 1] - p0y, vz = pos[i2 * 3 + 2] - p0z;

    const nx = uy * vz - uz * vy;
    const ny = uz * vx - ux * vz;
    const nz = ux * vy - uy * vx;

    const u0 = vertToUnique[i0] * 3;
    const u1 = vertToUnique[i1] * 3;
    const u2 = vertToUnique[i2] * 3;

    accumNormals[u0] += nx; accumNormals[u0 + 1] += ny; accumNormals[u0 + 2] += nz;
    accumNormals[u1] += nx; accumNormals[u1 + 1] += ny; accumNormals[u1 + 2] += nz;
    accumNormals[u2] += nx; accumNormals[u2 + 1] += ny; accumNormals[u2 + 2] += nz;
  }

  for (let u = 0; u < uniqueCount; u++) {
    const idx = u * 3;
    const nx = accumNormals[idx], ny = accumNormals[idx + 1], nz = accumNormals[idx + 2];
    const len = Math.hypot(nx, ny, nz) || 1.0;
    accumNormals[idx] = nx / len;
    accumNormals[idx + 1] = ny / len;
    accumNormals[idx + 2] = nz / len;
  }

  const numVerts = pos.length / 3;
  for (let i = 0; i < numVerts; i++) {
    const uid = vertToUnique[i] * 3;
    norm[i * 3] = accumNormals[uid];
    norm[i * 3 + 1] = accumNormals[uid + 1];
    norm[i * 3 + 2] = accumNormals[uid + 2];
  }

  normAttr.needsUpdate = true;
}

/**
 * Applies real-time Daz-style facial bone morphs & neck cross-section cut adjustments to the head geometry
 */
export function applyHeadMorphsToGeometry(geom, basePositions, morphs = {}, isCap = false, weldData = null) {
  const posAttr = geom.attributes.position;
  const arr = posAttr.array;

  const {
    jawVLine = 0.0,
    cheekSoftness = 0.0,
    noseBridge = 0.0,
    eyeAlmond = 0.0,
    lipFullness = 0.0,
    neckDiameter = 1.0,
    cutHeightOffset = 0.0,
    cutTiltPitch = 0.0,
    cutTiltRoll = 0.0
  } = morphs;

  const pitchRad = (cutTiltPitch * Math.PI) / 180;
  const rollRad = (cutTiltRoll * Math.PI) / 180;
  const neckCz = -2.05;

  for (let i = 0; i < arr.length; i += 3) {
    let x = basePositions[i];
    let y = basePositions[i + 1];
    let z = basePositions[i + 2];

    if (!isCap) {
      if (y < -0.5 && y > -7.5 && z > -3.0) {
        const w = Math.max(0, Math.min(1, (-0.5 - y) / 6.6));
        x *= (1.0 - jawVLine * 0.24 * w);
      }
      if (y > -2.8 && y < 2.8 && z > -2.0) {
        const w = Math.exp(-Math.pow(y / 2.0, 2));
        x *= (1.0 + cheekSoftness * 0.14 * w);
        z += cheekSoftness * 0.28 * w * Math.exp(-Math.pow((Math.abs(x) - 3.0) / 2.0, 2));
      }
      if (Math.abs(x) < 2.2 && y > -2.6 && y < 4.2 && z > 4.0) {
        const nw = Math.exp(-Math.pow(x / 1.4, 2)) * Math.exp(-Math.pow((y - 0.5) / 2.6, 2));
        z += noseBridge * 0.65 * nw;
      }
      if (y > -0.2 && y < 4.0 && z > 2.4) {
        for (const ex of [-2.8, 2.8]) {
          const ew = Math.exp(-Math.pow((x - ex) / 1.6, 2)) * Math.exp(-Math.pow((y - 1.8) / 1.2, 2));
          if (ew > 0.02) {
            const outer = (Math.abs(x) - 2.6) / 1.4;
            y += eyeAlmond * 0.34 * outer * ew;
          }
        }
      }
      if (Math.abs(x) < 2.5 && y > -5.8 && y < -2.2 && z > 3.8) {
        const lw = Math.exp(-Math.pow(x / 1.8, 2)) * Math.exp(-Math.pow((y + 4.1) / 1.1, 2));
        z += lipFullness * 0.55 * lw;
      }
    }

    // Neck diameter & Anatomical Cross-Section Cut Plane height/tilt (below y = -7.5)
    if (isCap || y < -7.5) {
      const neckWeight = isCap ? 1.0 : Math.max(0, Math.min(1, (-7.5 - y) / 5.2));
      const scaleR = 1.0 + (neckDiameter - 1.0) * neckWeight;
      x *= scaleR;
      z = neckCz + (z - neckCz) * scaleR;

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
  if (weldData) {
    computeWeldedSmoothNormals(geom, weldData);
  } else {
    geom.computeVertexNormals();
  }
}

/**
 * Builds a complete interactive 3D Collectible Head Group (Head + Anatomical Cross-Section Base + Realistic Hair + Rotation Gimbal)
 */
export async function buildCollectibleHeadNode(config = {}) {
  const {
    basePreset = 'linxi',
    customModelUrl = null,
    customModelType = 'glb',
    skinTone = '#f7d9cc',
    blushIntensity = 0.52,
    lipColor = '#d45868',
    irisColor = '#362015',
    hairStyle = 'long_straight',
    hairColor = '#131015',
    hairSheen = 0.88,
    neckClearance = 0.38,
    morphs = {},
    anatomyOptions = {},
    photoElement = null,
    photoBlend = 0.0,
    customHairUrl = null
  } = config;

  const root = new THREE.Group();
  root.name = 'CollectibleHeadRoot';

  const isMHBuiltIn = (basePreset === 'mh_asian') || Boolean(customModelUrl && /mh_asian_female_head/.test(customModelUrl));

  const { texture: skinTex, canvas: skinCanvas } = createDazSkinTexture({
    skinTone,
    blushIntensity,
    lipColor,
    irisColor,
    photoElement,
    photoBlend,
    forMakeHuman3D: isMHBuiltIn
  });

  const { colorTex: anatomyColorTex, bumpTex: anatomyBumpTex, colorCanvas: anatomyCanvas } = createAnatomyTextures({
    skinColor: skinTone,
    vascularContrast: anatomyOptions.vascularContrast ?? 1.0,
    dermisRimScale: anatomyOptions.dermisRimScale ?? 1.0,
    showLabels: anatomyOptions.showLabels ?? false
  });

  const wetness = anatomyOptions.wetness ?? 0.82;

  const skinMaterial = new THREE.MeshPhysicalMaterial({
    map: skinTex,
    roughness: 0.42,
    metalness: 0.01,
    clearcoat: 0.15,
    clearcoatRoughness: 0.40,
    sheen: 0.34,
    sheenRoughness: 0.65,
    sheenColor: new THREE.Color('#ffd5c8'),
    reflectivity: 0.44
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

  if (customModelUrl && !isMHBuiltIn) {
    let extObj;
    if (customModelType === 'obj') {
      extObj = await loadObjAny(customModelUrl);
    } else {
      const gltf = await new Promise((res, rej) => gltfLoader.load(customModelUrl, res, undefined, rej));
      extObj = gltf.scene;
    }

    const box = new THREE.Box3().setFromObject(extObj);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    const scale = 22.5 / Math.max(0.001, size.y);
    extObj.scale.setScalar(scale);
    extObj.position.set(-center.x * scale, -center.y * scale - 1.2, -center.z * scale);

    const cutY = -10.5 + (morphs.cutHeightOffset || 0);
    const clipPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -cutY);

    extObj.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.clippingPlanes = [clipPlane];
        child.material.clipShadows = true;
      }
    });
    root.add(extObj);

    const capGeom = new THREE.CircleGeometry(3.4 * (morphs.neckDiameter || 1.0), 64);
    capGeom.rotateX(Math.PI / 2);
    capGeom.translate(0, cutY, -1.2);
    const capMesh = new THREE.Mesh(capGeom, anatomyMaterial);
    capMesh.name = 'neck_cross_section';
    root.add(capMesh);
  } else {
    const presetToLoad = isMHBuiltIn ? 'mh_asian' : basePreset;
    const objGroup = await loadPresetObjGeometry(presetToLoad);
    let headMesh = null;
    let capMesh = null;

    objGroup.traverse((child) => {
      if (child.isMesh) {
        const geom = child.geometry.clone();
        const basePos = new Float32Array(geom.attributes.position.array);
        const weldData = buildPositionWeldData(basePos);
        child.userData.basePositions = basePos;
        child.userData.weldData = weldData;
        child.geometry = geom;

        if (child.name.includes('neck_cross_section')) {
          child.material = anatomyMaterial;
          applyHeadMorphsToGeometry(geom, basePos, morphs, true, weldData);
          capMesh = child;
        } else {
          child.material = skinMaterial;
          applyHeadMorphsToGeometry(geom, basePos, morphs, false, weldData);
          headMesh = child;
        }
      }
    });

    root.add(objGroup);

    if (customHairUrl) {
      const hairObj = await loadObjAny(customHairUrl);
      const hairMap = createRealisticHairStrandTexture(hairColor, hairSheen);
      const strandNormalMap = createRealisticHairNormalTexture();
      strandNormalMap.repeat.set(1, 3);
      const sheenCol = new THREE.Color(hairColor).offsetHSL(0.02, 0.05, 0.16);
      const hairMat = new THREE.MeshPhysicalMaterial({
        map: hairMap,
        normalMap: strandNormalMap,
        normalScale: new THREE.Vector2(0.85, 0.85),
        color: new THREE.Color('#ffffff'),
        roughness: Math.max(0.56, 0.70 - hairSheen * 0.10),
        metalness: 0.0,
        clearcoat: 0,
        sheen: 0.45 * hairSheen,
        sheenRoughness: 0.58,
        sheenColor: sheenCol,
        side: THREE.DoubleSide
      });
      hairObj.traverse((child) => {
        if (child.isMesh) {
          const hGeom = child.geometry.clone();
          const hWeld = buildPositionWeldData(hGeom.attributes.position.array);
          computeWeldedSmoothNormals(hGeom, hWeld);
          child.geometry = hGeom;
          child.material = hairMat;
        }
      });
      hairObj.name = 'CollectibleHair';
      root.add(hairObj);
    } else if (hairStyle !== 'none') {
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

  // 3D Rotation Mode Gimbal Rings
  const gimbalGroup = new THREE.Group();
  gimbalGroup.name = 'RotationGimbal';
  gimbalGroup.visible = false;

  const ringGeo1 = new THREE.TorusGeometry(11.2, 0.08, 12, 72);
  const ringMat1 = new THREE.MeshBasicMaterial({ color: '#38bdf8', transparent: true, opacity: 0.65 });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.rotation.x = Math.PI / 2;
  ring1.position.y = -1.5;

  const ringGeo2 = new THREE.TorusGeometry(11.8, 0.06, 12, 72);
  const ringMat2 = new THREE.MeshBasicMaterial({ color: '#f43f5e', transparent: true, opacity: 0.45 });
  const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
  ring2.position.y = -1.5;

  gimbalGroup.add(ring1, ring2);
  root.add(gimbalGroup);

  root.userData.gimbalGroup = gimbalGroup;
  root.userData.skinCanvas = skinCanvas;
  root.userData.anatomyCanvas = anatomyCanvas;
  root.userData.skinMaterial = skinMaterial;
  root.userData.anatomyMaterial = anatomyMaterial;

  return root;
}
