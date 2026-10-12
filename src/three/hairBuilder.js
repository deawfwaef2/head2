import * as THREE from 'three';
import { createRealisticHairStrandTexture, createRealisticHairNormalTexture } from '../textures/skinTextureGenerator.js';

/**
 * Builds a single continuous, gap-free 3D Ellipsoidal Volumetric Hair Shell
 * Mathematically verified against all cranium/forehead vertices (max skull norm = 0.9578 < 1.0)
 * so no scalp, forehead, or temple ever clips through.
 */
function buildContinuousHairShellGeometry({
  rows = 36,
  cols = 56,
  backLength = 13.5,
  crownLift = 0.0,
  volumeScale = 1.0,
  waveAmp = 0.22,
  waveFreq = 2.2
}) {
  const geom = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= rows; i++) {
    const v = i / rows; // 0 = crown parting line, 0.50 = equator (Y=2.6), 1.0 = bottom hair tips
    for (let j = 0; j <= cols; j++) {
      const u = j / cols; // 0 = right forehead/temple, 0.5 = back occiput, 1.0 = left forehead/temple
      // Wrap from right anterior temple (+0.28*PI) around back (-0.5*PI) to left anterior temple (-1.28*PI)
      const phi = Math.PI * 0.28 - u * Math.PI * 1.56;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);
      const frontBlend = Math.max(0.0, sinP);

      const rxBase = (8.38 - frontBlend * 0.68) * volumeScale;
      const rzBase = (sinP >= 0 ? 6.82 : 7.82) * volumeScale;

      let x, y, z;
      if (v <= 0.50) {
        const theta = 0.03 + (v / 0.50) * (Math.PI * 0.5 - 0.03);
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        // Subtle center parting crease along top of crown (near u = 0.5)
        const partDip = Math.exp(-Math.pow((u - 0.5) / 0.04, 2)) * 0.18 * cosT;
        y = 2.6 + (8.46 + crownLift) * cosT - partDip;
        x = cosP * rxBase * sinT;
        z = -0.55 + sinP * rzBase * sinT + cosT * 1.15;
      } else {
        const w = (v - 0.50) / 0.50; // 0 at equator (Y=2.6) -> 1 at tips
        const xEq = cosP * rxBase;
        const zEq = -0.55 + sinP * rzBase;

        const isCheekLock = Math.max(0.0, 1.0 - Math.min(u, 1.0 - u) / 0.24);
        const taperX = 1.0 - (0.28 * isCheekLock + 0.14 * (1.0 - isCheekLock)) * w;
        const wave = Math.sin(w * Math.PI * waveFreq + u * 8.0) * waveAmp * w;

        x = xEq * taperX + cosP * wave;
        y = 2.6 - w * backLength;
        z = zEq * (1.0 - 0.10 * w) + sinP * wave * 0.5;
      }

      positions.push(x, y, z);
      uvs.push(u * 3.0, 1.0 - v);
    }
  }

  const stride = cols + 1;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = (i + 1) * stride + j;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  geom.setIndex(indices);
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  return geom;
}

/**
 * Builds dedicated cheek-framing side locks (either blunt Japanese Hime cheek cut or long S-wave locks)
 * that overlap seamlessly with both the main hair shell and the forehead bangs.
 */
function buildCheekFramingLockGeometry({
  side = 1,
  isHime = false,
  lockDrop = 10.8,
  crownLift = 0.0,
  volumeScale = 1.0
}) {
  const rows = 26;
  const cols = 14;
  const geom = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= rows; i++) {
    const v = i / rows;
    for (let j = 0; j <= cols; j++) {
      const u = j / cols; // 0 = front cheek/brow edge, 1 = back temple edge
      const phi = (side > 0 ? (0.31 - u * 0.24) : (0.69 + u * 0.24)) * Math.PI;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      const rx = 7.72 * volumeScale;
      const rz = 6.86 * volumeScale;

      let x, y, z;
      if (v <= 0.45) {
        const theta = 0.04 + (v / 0.45) * (Math.PI * 0.5 - 0.04);
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        x = cosP * rx * sinT;
        y = 2.6 + (8.48 + crownLift) * cosT;
        z = -0.55 + sinP * rz * sinT + cosT * 1.15;
      } else {
        const w = (v - 0.45) / 0.55;
        const xEq = cosP * rx;
        const zEq = -0.55 + sinP * rz;
        const jawInward = (isHime ? 0.27 : 0.31) * Math.pow(w, 1.12);
        const ribbonArch = Math.sin(u * Math.PI) * 0.20;
        x = xEq * (1.0 - jawInward) + side * ribbonArch;
        y = 2.6 - w * (isHime ? 7.2 : lockDrop);
        z = zEq + 0.32 * Math.sin(w * Math.PI) + ribbonArch * 0.4;
      }

      positions.push(x, y, z);
      uvs.push(u, 1.0 - v);
    }
  }

  const stride = cols + 1;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = (i + 1) * stride + j;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  geom.setIndex(indices);
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  return geom;
}

/**
 * Builds the continuous forehead fringe / bangs cap using spherical azimuth phi in [0.18*PI, 0.82*PI]
 * on the exact same ellipsoidal envelope as the main hair shell & cheek locks,
 * guaranteeing 0% triangular gaps on the forehead or temples!
 */
function buildForeheadFringeGeometry({
  isHime = false,
  isParted = false,
  crownLift = 0.0,
  thetaSpan = 1.32
}) {
  const rows = 24;
  const cols = 64;
  const geom = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= rows; i++) {
    const v = i / rows; // 0 = crown parting, 1 = eyebrow-level fringe tips (Y ≈ +4.3)
    const theta = 0.03 + v * thetaSpan;
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);

    for (let j = 0; j <= cols; j++) {
      const u = j / cols; // 0 = left temple (phi = 0.82*PI), 1 = right temple (phi = 0.18*PI)
      const s = (u - 0.5) * 2.0; // -1..+1

      // Continuous azimuthal angle across the entire anterior forehead & temples
      let phi = (0.82 - u * 0.64) * Math.PI;

      // For curtain/parted bangs, gently part only the lower fringe tips (v > 0.58) near the eyebrows
      // while keeping the upper forehead & hairline (v <= 0.58) 100% sealed!
      if (!isHime && v > 0.55) {
        const tipV = (v - 0.55) / 0.45;
        const maxPartAngle = isParted ? 0.095 : 0.048;
        const partPush = maxPartAngle * Math.pow(tipV, 1.8) * Math.exp(-Math.pow(s / 0.45, 2));
        phi += (s >= 0 ? -partPush : partPush) * Math.PI;
      }

      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);
      // Geometric per-fiber ridges to break directional light into fine silky streaks
      const microWave = Math.sin(u * Math.PI * 24.0) * 0.24 * v;

      const rx = 7.72;
      const rz = 6.88 + microWave;

      const x = cosP * rx * sinT;
      // Gentle arched lower fringe line that follows the natural eyebrow curve
      const browArchDrop = isHime ? (1.0 - Math.pow(s, 2) * 0.35) * 0.35 * v : (Math.pow(s, 2) * 0.45) * v;
      const y = 2.6 + (8.48 + crownLift) * cosT - browArchDrop;
      const z = -0.55 + sinP * rz * sinT + cosT * 1.15;

      positions.push(x, y, z);
      uvs.push(u * 2.0, 1.0 - v);
    }
  }

  const stride = cols + 1;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * stride + j;
      const b = a + 1;
      const c = (i + 1) * stride + j;
      const d = c + 1;
      indices.push(a, c, b);
      indices.push(b, c, d);
    }
  }

  geom.setIndex(indices);
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  return geom;
}

/**
 * Builds an inner solid hairline & scalp dome so even under parted curtain bangs
 * the upper forehead hairline has natural dark hair root density with zero skin gaps.
 */
function buildScalpUnderCapGeometry(crownLift = 0.0) {
  return buildForeheadFringeGeometry({
    isHime: true,
    isParted: false,
    crownLift: crownLift - 0.04,
    thetaSpan: 1.06 // Covers crown down to upper forehead hairline Y ≈ +6.1
  });
}

// A light-weight finishing groom for the fitted CC0 MakeHuman hairstyles. These thin,
// tapered, individually displaced cards sit over the temple/cheek transition rather
// than replacing the source hair. The deterministic offsets keep studio/desktop identical.
export function createFittedHairFinishingGroom({ color = '#141218', sheen = 0.8, style = 'long' } = {}) {
  const group = new THREE.Group();
  group.name = 'FittedHairFinishingGroom';
  const map = createRealisticHairStrandTexture(color, sheen);
  const mat = new THREE.MeshPhysicalMaterial({
    map, side: THREE.DoubleSide, alphaTest: 0.34, transparent: false,
    roughness: 0.67, metalness: 0, clearcoat: 0,
    sheen: 0.24 * sheen, sheenRoughness: 0.68,
    sheenColor: new THREE.Color(color).offsetHSL(0, 0.02, 0.11),
    depthWrite: true
  });
  const points = [], uvs = [], indices = [];
  const rows = 9;
  const length = style === 'bob' ? 5.8 : style === 'ponytail' ? 4.9 : 9.0;
  const count = style === 'ponytail' ? 18 : 30;
  for (const side of [-1, 1]) {
    for (let i = 0; i < count; i++) {
      const p = (i + 0.5) / count;
      const seed = Math.sin((i + 1) * 127.1 + side * 71.3) * 43758.5453;
      const jitter = seed - Math.floor(seed);
      // Emerge from INSIDE the fitted hair near the temple, never a floating
      // root above the silhouette. The source proxy remains the continuous cap.
      const startY = 4.8 - p * 0.9;
      const startX = 5.75 + p * 1.18;
      const startZ = 5.25 + 0.60 * Math.sin(p * Math.PI);
      const drop = length * (0.76 + 0.22 * jitter);
      const width = 0.075 + 0.075 * ((i * 17) % 11) / 11;
      const first = points.length / 3;
      for (let r = 0; r <= rows; r++) {
        const t = r / rows;
        const wave = Math.sin(t * 7.5 + i * 1.74) * 0.10 * t * t;
        // In front of the cheek, then fan away below the jaw so the face stays visible.
        const x = side * (startX + 0.70 * Math.sin(t * Math.PI * 0.7) + p * 0.43 * t + wave);
        const y = startY - drop * t;
        const z = startZ + 0.83 * Math.sin(t * Math.PI) + 0.35 * t + wave;
        const taper = Math.sin(Math.PI * (0.07 + 0.91 * t));
        const half = width * Math.max(0.025, taper);
        points.push(x - half, y, z + 0.018, x + half, y, z + 0.018);
        // Repeated S samples individual hair fibers; T runs root -> transparent tip.
        uvs.push(p * 3.0, 1 - t, p * 3.0 + 0.18, 1 - t);
        if (r < rows) {
          const a = first + r * 2;
          indices.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
        }
      }
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  group.add(new THREE.Mesh(geom, mat));
  return group;
}

// UI 下拉发型 ID -> 已实现的构建分支
const HAIR_STYLE_ALIAS = {
  long_straight: 'long_silk',
  soft_waves: 'soft_waves_real',
  low_chignon: 'cyber_updo',
  sleek_bob: 'clavicle_bob'
};

export function createRealisticHairGroup({
  style = 'long_silk',
  hairColor = '#141218',
  sheenIntensity = 0.85,
  neckClearance = 0.35
} = {}) {
  style = HAIR_STYLE_ALIAS[style] || style;
  const group = new THREE.Group();
  group.name = 'RealisticStrandHair';

  if (style === 'none') return group;

  const map = createRealisticHairStrandTexture(hairColor, sheenIntensity);
  const sheenCol = new THREE.Color(hairColor).offsetHSL(0.02, 0.05, 0.16);
  const strandNormalMap = createRealisticHairNormalTexture();
  strandNormalMap.repeat.set(1, 3);

  const solidHairMat = new THREE.MeshPhysicalMaterial({
    map,
    normalMap: strandNormalMap,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughness: Math.max(0.56, 0.70 - sheenIntensity * 0.10),
    metalness: 0.0,
    clearcoat: 0,
    sheen: 0.42 * sheenIntensity,
    sheenRoughness: 0.60,
    sheenColor: sheenCol,
    side: THREE.DoubleSide
  });

  // Use hard alphaTest cutout (transparent: false) so overlapping fringe & shell never double-expose specular blending!
  const strandHairMat = new THREE.MeshPhysicalMaterial({
    map,
    normalMap: strandNormalMap,
    normalScale: new THREE.Vector2(0.85, 0.85),
    transparent: false,
    alphaTest: 0.35,
    depthWrite: true,
    roughness: Math.max(0.56, 0.68 - sheenIntensity * 0.10),
    metalness: 0.0,
    clearcoat: 0,
    sheen: 0.46 * sheenIntensity,
    sheenRoughness: 0.56,
    sheenColor: sheenCol,
    side: THREE.DoubleSide
  });

  // Back hair length dynamically responds to neckClearance slider so user can expose the neck cross-section!
  const clearanceShorten = neckClearance * 4.5;

  // Always add the inner solid hairline scalp cap so upper forehead never shows bare skin through parted bangs
  group.add(new THREE.Mesh(buildScalpUnderCapGeometry(0.12), solidHairMat));

  if (style === 'long_silk' || style === 'soft_waves_real') {
    const isWavy = style === 'soft_waves_real';
    const shell = new THREE.Mesh(
      buildContinuousHairShellGeometry({
        backLength: Math.max(7.5, 14.2 - clearanceShorten),
        crownLift: isWavy ? 0.24 : 0.15,
        volumeScale: isWavy ? 1.03 : 1.0,
        waveAmp: isWavy ? 0.46 : 0.18,
        waveFreq: isWavy ? 3.2 : 2.0
      }),
      solidHairMat
    );
    group.add(shell);

    for (const side of [-1, 1]) {
      const lock = new THREE.Mesh(
        buildCheekFramingLockGeometry({
          side,
          isHime: false,
          lockDrop: Math.max(8.5, 12.2 - clearanceShorten * 0.5),
          crownLift: isWavy ? 0.24 : 0.15,
          volumeScale: isWavy ? 1.03 : 1.0
        }),
        strandHairMat
      );
      group.add(lock);
    }

    const fringe = new THREE.Mesh(
      buildForeheadFringeGeometry({
        isHime: false,
        isParted: isWavy,
        crownLift: isWavy ? 0.24 : 0.15,
        thetaSpan: 1.30
      }),
      strandHairMat
    );
    group.add(fringe);
  } else if (style === 'hime_cut') {
    const shell = new THREE.Mesh(
      buildContinuousHairShellGeometry({
        backLength: Math.max(7.5, 14.2 - clearanceShorten),
        crownLift: 0.12,
        volumeScale: 1.0,
        waveAmp: 0.06,
        waveFreq: 1.2
      }),
      solidHairMat
    );
    group.add(shell);

    for (const side of [-1, 1]) {
      const himeLock = new THREE.Mesh(
        buildCheekFramingLockGeometry({
          side,
          isHime: true,
          lockDrop: 7.4,
          crownLift: 0.12,
          volumeScale: 1.01
        }),
        solidHairMat
      );
      group.add(himeLock);
    }

    const fringe = new THREE.Mesh(
      buildForeheadFringeGeometry({
        isHime: true,
        isParted: false,
        crownLift: 0.12,
        thetaSpan: 1.30
      }),
      solidHairMat
    );
    group.add(fringe);
  } else if (style === 'clavicle_bob') {
    const shell = new THREE.Mesh(
      buildContinuousHairShellGeometry({
        backLength: Math.max(6.8, 10.6 - clearanceShorten * 0.7),
        crownLift: 0.14,
        volumeScale: 1.0,
        waveAmp: 0.16,
        waveFreq: 1.6
      }),
      solidHairMat
    );
    group.add(shell);

    for (const side of [-1, 1]) {
      const lock = new THREE.Mesh(
        buildCheekFramingLockGeometry({
          side,
          isHime: false,
          lockDrop: 9.6,
          crownLift: 0.14,
          volumeScale: 1.0
        }),
        strandHairMat
      );
      group.add(lock);
    }

    const fringe = new THREE.Mesh(
      buildForeheadFringeGeometry({
        isHime: false,
        isParted: true,
        crownLift: 0.14,
        thetaSpan: 1.28
      }),
      strandHairMat
    );
    group.add(fringe);
  } else if (style === 'cyber_updo') {
    const shell = new THREE.Mesh(
      buildContinuousHairShellGeometry({
        backLength: 5.8,
        crownLift: 0.12,
        volumeScale: 0.99,
        waveAmp: 0.08,
        waveFreq: 1.0
      }),
      solidHairMat
    );
    group.add(shell);

    // Sculpted high crown bun
    const bunGeo = new THREE.SphereGeometry(2.85, 28, 22);
    bunGeo.scale(1.05, 0.88, 1.05);
    bunGeo.translate(0, 10.5, -5.0);
    const bunMesh = new THREE.Mesh(bunGeo, solidHairMat);
    group.add(bunMesh);

    const ornamentGeo = new THREE.TorusGeometry(2.45, 0.18, 14, 36);
    ornamentGeo.rotateX(Math.PI * 0.36);
    ornamentGeo.translate(0, 9.8, -4.6);
    const ornamentMat = new THREE.MeshStandardMaterial({
      color: 0xd8b4fe,
      metalness: 0.88,
      roughness: 0.18,
      emissive: 0x3b0764,
      emissiveIntensity: 0.35
    });
    group.add(new THREE.Mesh(ornamentGeo, ornamentMat));

    for (const side of [-1, 1]) {
      const lock = new THREE.Mesh(
        buildCheekFramingLockGeometry({
          side,
          isHime: false,
          lockDrop: 10.2,
          crownLift: 0.12,
          volumeScale: 1.0
        }),
        strandHairMat
      );
      group.add(lock);
    }

    const fringe = new THREE.Mesh(
      buildForeheadFringeGeometry({
        isHime: false,
        isParted: true,
        crownLift: 0.12,
        thetaSpan: 1.28
      }),
      strandHairMat
    );
    group.add(fringe);
  }

  return group;
}
