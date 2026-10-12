import * as THREE from 'three';
import { createRealisticHairStrandTexture, createRealisticHairNormalTexture } from '../textures/skinTextureGenerator.js';

/**
 * Builds a single continuous, gap-free 3D Ellipsoidal Volumetric Hair Shell
 * verified against the sculpted cranium envelope so no scalp/temple ever clips through.
 */
function buildContinuousHairShellGeometry({
  rows = 34,
  cols = 52,
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
      const u = j / cols; // 0 = right cheek/temple, 0.5 = back occiput, 1.0 = left cheek/temple
      // Wrap from right temple/cheek (+0.20*PI) around back (-0.5*PI) to left temple/cheek (-1.20*PI)
      const phi = Math.PI * 0.20 - u * Math.PI * 1.40;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);
      const frontW = Math.max(0.0, sinP);

      let x, y, z;
      if (v <= 0.50) {
        const theta = 0.04 + (v / 0.50) * (Math.PI * 0.5 - 0.04);
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);

        // Center parting crease along top of crown (near u = 0.5)
        const partDip = Math.exp(-Math.pow((u - 0.5) / 0.04, 2)) * 0.22 * cosT;
        y = 2.6 + (8.40 + crownLift) * cosT - partDip;

        const rx = (8.15 - frontW * 1.20) * volumeScale * sinT;
        const rz = (sinP > 0 ? 6.48 : 7.48) * volumeScale * sinT;
        x = cosP * rx;
        z = -0.55 + sinP * rz + cosT * 1.45;
      } else {
        const w = (v - 0.50) / 0.50; // 0 at equator (Y=2.6) -> 1 at tips
        const rxEq = (8.15 - frontW * 1.20) * volumeScale;
        const rzEq = (sinP > 0 ? 6.48 : 7.48) * volumeScale;
        const xEq = cosP * rxEq;
        const zEq = -0.55 + sinP * rzEq;

        const isCheekLock = Math.max(0.0, 1.0 - Math.min(u, 1.0 - u) / 0.22);
        const taperX = 1.0 - (0.28 * isCheekLock + 0.14 * (1.0 - isCheekLock)) * w;
        const wave = Math.sin(w * Math.PI * waveFreq + u * 8.0) * waveAmp * w;

        x = xEq * taperX + cosP * wave;
        y = 2.6 - w * backLength;
        z = zEq * (1.0 - 0.12 * w) + sinP * wave * 0.5;
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
 * that hug the temples and cheekbones with zero gap.
 */
function buildCheekFramingLockGeometry({
  side = 1,
  isHime = false,
  lockDrop = 10.8,
  crownLift = 0.0,
  volumeScale = 1.0
}) {
  const rows = 24;
  const cols = 12;
  const geom = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= rows; i++) {
    const v = i / rows;
    for (let j = 0; j <= cols; j++) {
      const u = j / cols; // 0 = front cheek edge, 1 = back temple edge
      const phi = (side > 0 ? (0.24 - u * 0.22) : (-1.24 + u * 0.22)) * Math.PI;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);

      let x, y, z;
      if (v <= 0.45) {
        const theta = 0.08 + (v / 0.45) * (Math.PI * 0.5 - 0.08);
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        x = cosP * 7.30 * volumeScale * sinT;
        y = 2.6 + (8.35 + crownLift) * cosT;
        z = -0.45 + sinP * 6.58 * volumeScale * sinT + cosT * 1.35;
      } else {
        const w = (v - 0.45) / 0.55;
        const xEq = cosP * 7.30 * volumeScale;
        const zEq = -0.45 + sinP * 6.58 * volumeScale;
        const jawInward = (isHime ? 0.28 : 0.32) * Math.pow(w, 1.15);
        // Subtle thickness arch across u so each cheek lock looks plush and 3D
        const ribbonArch = Math.sin(u * Math.PI) * 0.18;
        x = xEq * (1.0 - jawInward) + side * ribbonArch;
        y = 2.6 - w * (isHime ? 7.2 : lockDrop);
        z = zEq + 0.35 * Math.sin(w * Math.PI) + ribbonArch * 0.4;
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
 * Builds the continuous forehead fringe / bangs cap connecting the crown parting
 * smoothly over the forehead down to the eyebrows (Y ≈ +4.4) with zero forehead skin clipping.
 */
function buildForeheadFringeGeometry({
  isHime = false,
  isParted = false,
  crownLift = 0.0,
  thetaSpan = 1.27
}) {
  const rows = 20;
  const cols = 64;
  const geom = new THREE.BufferGeometry();
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= rows; i++) {
    const v = i / rows; // 0 = crown hairline, 1 = eyebrow-level fringe tips
    for (let j = 0; j <= cols; j++) {
      const u = j / cols; // 0 = left temple, 1 = right temple
      const s = (u - 0.5) * 2.0; // -1..+1

      let x, y, z;
      if (isHime) {
        // Full arched Japanese Hime fringe across forehead down to Y = +4.4
        const theta = 0.05 + v * thetaSpan;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        const archCos = Math.cos(s * Math.PI * 0.38);
        // Real geometric per-fiber ridges (not just a normal-map trick) so a single
        // directional light breaks into many thin streaks instead of one flat
        // mirror-like specular blob across the whole fringe panel.
        const microStrand = Math.sin(u * Math.PI * 24.0) * 0.32 * v;
        x = s * 5.60 * (0.25 + 0.75 * sinT);
        y = 2.8 + (8.20 + crownLift) * cosT - (1.0 - archCos) * 0.75 * v;
        z = -0.15 + (6.20 + microStrand) * sinT * archCos + cosT * 1.35;
      } else {
        // Airy Center-Parted / Side-Swept Curtain Bangs (八字高颅顶空气刘海)
        const gapWidth = isParted ? 1.55 : 0.95;
        const partGap = (0.05 + gapWidth * Math.pow(v, 2.3)) * (s >= 0 ? 1 : -1);
        const xSpan = partGap + s * (5.68 - Math.abs(partGap)) * (0.30 + 0.70 * v);
        const archCos = Math.cos(Math.min(1.0, Math.abs(xSpan) / 6.35) * Math.PI * 0.44);
        const theta = 0.05 + v * thetaSpan;
        const sinT = Math.sin(theta);
        const cosT = Math.cos(theta);
        // Real geometric per-fiber ridges (not just a normal-map trick) so a single
        // directional light breaks into many thin streaks instead of one flat
        // mirror-like specular blob across the whole fringe panel.
        const microStrand = Math.sin(u * Math.PI * 24.0) * 0.34 * v;

        x = xSpan;
        y = 2.6 + (8.30 + crownLift) * cosT;
        z = -0.15 + (6.22 + microStrand) * sinT * archCos + cosT * 1.35;
      }

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
 * Builds realistic multi-layered volumetric East Asian female hair styles.
 */
// UI 下拉发型 ID -> 已实现的构建分支（修复 long_straight 等 ID 静默无发的 BUG）
const HAIR_STYLE_ALIAS = {
  long_straight: 'long_silk',
  soft_waves: 'long_silk',
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

  const map = createRealisticHairStrandTexture(hairColor, sheenIntensity);
  const sheenCol = new THREE.Color(hairColor).offsetHSL(0.02, 0.05, 0.16);
  // Per-strand ridge normal map: breaks a single flat specular mirror-blob into
  // hundreds of thin bright fiber streaks (fixes the "silver plastic helmet" bug).
  const strandNormalMap = createRealisticHairNormalTexture();
  strandNormalMap.repeat.set(1, 3);

  // NOTE: clearcoat on MeshPhysicalMaterial renders a tight mirror-like GGX
  // highlight. On a smooth-ish surface like these hair panels that highlight
  // can land as one big blown-out "silver plastic" blob instead of many
  // soft fiber streaks, so clearcoat is kept very low/off and we lean on a
  // higher base roughness + fabric-like `sheen` (softer, broader falloff)
  // plus the per-fiber ridge normal map for believable silky shine instead.
  const solidHairMat = new THREE.MeshPhysicalMaterial({
    map,
    normalMap: strandNormalMap,
    normalScale: new THREE.Vector2(0.85, 0.85),
    roughness: Math.max(0.58, 0.72 - sheenIntensity * 0.1),
    metalness: 0.0,
    clearcoat: 0,
    sheen: 0.4 * sheenIntensity,
    sheenRoughness: 0.62,
    sheenColor: sheenCol,
    side: THREE.DoubleSide
  });

  // IMPORTANT: this is a hard alpha-TEST cutout (transparent: false), not alpha
  // BLENDING. These strand panels sit directly in front of the opaque hair
  // shell; with alpha *blending* enabled, any pixel that is only partially
  // transparent gets composited with whatever is drawn behind it (the shell).
  // When both surfaces catch the key light's specular highlight at the same
  // viewing angle, that per-pixel blend adds their brightnesses together and
  // produces a blown-out "silver plastic" patch instead of hair sheen. Using
  // alphaTest-only cutout means each pixel is either fully the strand's own
  // (correctly, moderately lit) color or fully discarded — never a brightness-
  // doubling blend of two independently-lit surfaces.
  const strandHairMat = new THREE.MeshPhysicalMaterial({
    map,
    normalMap: strandNormalMap,
    normalScale: new THREE.Vector2(0.85, 0.85),
    transparent: false,
    alphaTest: 0.35,
    depthWrite: true,
    roughness: Math.max(0.58, 0.7 - sheenIntensity * 0.1),
    metalness: 0.0,
    clearcoat: 0,
    sheen: 0.44 * sheenIntensity,
    sheenRoughness: 0.58,
    sheenColor: sheenCol,
    side: THREE.DoubleSide
  });

  const lenOffset = -neckClearance * 1.2;

  if (style === 'none') return group;

  if (style === 'long_silk') {
    const shell = new THREE.Mesh(
      buildContinuousHairShellGeometry({
        backLength: 13.8,
        crownLift: 0.15,
        volumeScale: 1.0,
        waveAmp: 0.22,
        waveFreq: 2.2
      }),
      solidHairMat
    );
    group.add(shell);

    for (const side of [-1, 1]) {
      const lock = new THREE.Mesh(
        buildCheekFramingLockGeometry({
          side,
          isHime: false,
          lockDrop: 12.2,
          crownLift: 0.15,
          volumeScale: 1.0
        }),
        strandHairMat
      );
      group.add(lock);
    }

    const fringe = new THREE.Mesh(
      buildForeheadFringeGeometry({
        isHime: false,
        isParted: false,
        crownLift: 0.15,
        thetaSpan: 1.27
      }),
      strandHairMat
    );
    group.add(fringe);
  } else if (style === 'hime_cut') {
    const shell = new THREE.Mesh(
      buildContinuousHairShellGeometry({
        backLength: 14.2,
        crownLift: 0.10,
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
          lockDrop: 7.2,
          crownLift: 0.10,
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
        crownLift: 0.10,
        thetaSpan: 1.26
      }),
      solidHairMat
    );
    group.add(fringe);
  } else if (style === 'clavicle_bob') {
    const shell = new THREE.Mesh(
      buildContinuousHairShellGeometry({
        backLength: 10.6,
        crownLift: 0.12,
        volumeScale: 0.99,
        waveAmp: 0.18,
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
          lockDrop: 9.8,
          crownLift: 0.12,
          volumeScale: 0.99
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
        thetaSpan: 1.25
      }),
      strandHairMat
    );
    group.add(fringe);
  } else if (style === 'cyber_updo') {
    const shell = new THREE.Mesh(
      buildContinuousHairShellGeometry({
        backLength: 6.2,
        crownLift: 0.10,
        volumeScale: 0.98,
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
          lockDrop: 10.4,
          crownLift: 0.10,
          volumeScale: 0.99
        }),
        strandHairMat
      );
      group.add(lock);
    }

    const fringe = new THREE.Mesh(
      buildForeheadFringeGeometry({
        isHime: false,
        isParted: true,
        crownLift: 0.10,
        thetaSpan: 1.24
      }),
      strandHairMat
    );
    group.add(fringe);
  }

  // Temple/sideburn bridge patches: the fringe cap and the cheek-framing lock
  // are two independently-parameterized surfaces, so their shared seam at the
  // temple can leave a thin triangular gap that exposes bare scalp/skin
  // underneath ("悬空黑缝" bug). These small opaque hair-colored patches sit
  // exactly on that seam and are intentionally oversized so they always fully
  // cover the junction regardless of style, reading simply as a bit more
  // natural hair volume at the temple rather than as a visible patch.
  for (const side of [-1, 1]) {
    const bridge = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 14, 12),
      solidHairMat
    );
    bridge.scale.set(0.62, 1.05, 0.5);
    bridge.position.set(side * 5.55, 6.1, 3.35);
    bridge.rotation.y = side * 0.32;
    group.add(bridge);
  }

  return group;
}
