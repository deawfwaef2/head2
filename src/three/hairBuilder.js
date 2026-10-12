import * as THREE from 'three';
import { createRealisticHairStrandTexture } from '../textures/skinTextureGenerator.js';

export const HAIR_STYLE_PRESETS = [
  {
    id: 'long_straight',
    name: '东方乌木黑长直 (Classic Ebony Silk)',
    desc: '高颅顶包裹发缝 + 贴颊修颜侧发束 + 垂顺丝感长发'
  },
  {
    id: 'hime_cut',
    name: '日式姬发公主切 (Classic Hime Cut)',
    desc: '柔顺齐眉刘海 + 紧贴面颊齐颌阶梯公主切 + 顺滑长后发'
  },
  {
    id: 'low_chignon',
    name: '江南温婉低盘发 (Elegant Low Chignon)',
    desc: '全露修长天鹅颈与C5解剖断面 + 脑后温婉发髻 + 修颜龙须碎发'
  },
  {
    id: 'soft_waves',
    name: '韩系八字刘海微卷 (Curtain Bangs Waves)',
    desc: 'S型蓬松高颅顶八字刘海 + 柔美微卷侧发束'
  },
  {
    id: 'sleek_bob',
    name: '清冷高智感内扣短发 (Sleek Chin Bob)',
    desc: '利落齐下颌内扣波波头，完整展露下颈与医学解剖断面'
  }
];

/**
 * Builds a continuous, watertight-feeling 3D Volumetric Hair Shell wrapping the crown, temples, and back of head
 * Eliminates any bald gap between the forehead/temples and the outer hair locks!
 */
function buildContinuousHairShellGeometry(style, maxDropY) {
  const rows = 30;
  const cols = 44;
  const positions = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= rows; i++) {
    const v = i / rows; // 0 = crown parting line, 1 = bottom hair tips
    for (let j = 0; j <= cols; j++) {
      const u = j / cols; // 0 = right temple/cheek lock, 0.5 = center back occiput, 1 = left temple/cheek lock
      // Angle around head: from +0.14*pi (right front temple) through -0.5*pi (back) to -1.14*pi (left front temple)
      const phi = Math.PI * 0.14 - u * Math.PI * 1.28;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);
      const isSideTemple = Math.max(0, Math.sin(phi) + 0.35); // >0 near front temples

      let x, y, z;

      if (v <= 0.48) {
        // Upper cranial vault & temple wrap (v in 0..0.48)
        const t = v / 0.48;
        const st = Math.sin(t * Math.PI * 0.5);

        // Crown height: high cranial top (高颅顶 Y = +10.35), dipping slightly at center parting
        const partDip = Math.exp(-Math.pow((u - 0.5) / 0.04, 2)) * 0.18 * (1 - t);
        const topY = 10.25 - partDip;
        const midY = 2.2 + isSideTemple * 1.2;
        y = (1 - t * t) * topY + (t * t) * midY;

        // Radius expands smoothly from parting line over the skull & hugs the temples tightly
        const rx = 0.25 * (1 - st) + (7.15 - isSideTemple * 1.05) * st;
        const rzFront = 4.65;
        const rzBack = 8.05;
        const rz = sinP > 0 ? rzFront * st : rzBack * st;

        x = cosP * rx;
        z = -1.35 + (sinP > 0 ? sinP * (rz + 1.8) : sinP * rz) + (1 - st) * 2.2;
      } else {
        // Lower draping curtain / bob / chignon (v in 0.48..1.0)
        const w = (v - 0.48) / 0.52; // 0 to 1
        const midY = 2.2 + isSideTemple * 1.2;
        const rxMid = 7.15 - isSideTemple * 1.05;
        const rzMid = sinP > 0 ? 4.65 : 8.05;
        const zMid = -1.35 + (sinP > 0 ? sinP * (rzMid + 1.8) : sinP * rzMid);

        if (style === 'low_chignon') {
          // Sweep smoothly inward toward occipital chignon bun at (0, -2.5, -8.8)
          const sw = w * w * (3 - 2 * w);
          x = cosP * rxMid * (1 - 0.78 * sw);
          y = (1 - w) * midY + w * (-3.2);
          z = (1 - sw) * zMid + sw * (-8.8);
        } else if (style === 'sleek_bob') {
          // Inner-curl chin-length bob ending around Y = -6.8 (above lower neck!)
          const bobEndY = -6.8;
          const curlIn = Math.sin(w * Math.PI * 0.85);
          const taperIn = 1.0 - 0.26 * (w * w);
          x = cosP * (rxMid * taperIn + 0.35 * curlIn);
          y = (1 - w) * midY + w * bobEndY;
          z = zMid * (0.96 - 0.14 * w * w);
        } else {
          // Long Straight / Hime / Soft Waves cascading curtain
          const wave = style === 'soft_waves' ? Math.sin(w * Math.PI * 2.2 + u * 8.0) * 0.42 * w : 0;
          const taper = 1.0 - 0.22 * w + wave * 0.06;
          x = cosP * rxMid * taper + wave * 0.35;
          y = (1 - w) * midY + w * maxDropY;
          z = zMid * (0.98 - 0.12 * w);
        }
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

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

/**
 * Extrudes a curved 3D ribbon strip along a CatmullRomCurve3 with smooth transverse arch
 */
function buildHairRibbonGeometry(points, widthStart, widthMid, widthEnd, twist = 0, segments = 28) {
  const curve = new THREE.CatmullRomCurve3(points);
  const pts = curve.getPoints(segments);
  const positions = [];
  const uvs = [];
  const indices = [];

  const headCenter = new THREE.Vector3(0, 1.8, -1.2);

  for (let i = 0; i <= segments; i++) {
    const v = i / segments;
    const p = pts[i];
    const tangent = curve.getTangent(v).normalize();

    const radial = new THREE.Vector3().subVectors(p, headCenter);
    radial.y *= 0.30;
    if (radial.lengthSq() < 0.001) radial.set(0, 0, 1);
    radial.normalize();

    const binormal = new THREE.Vector3().crossVectors(tangent, radial).normalize();
    if (twist !== 0) {
      binormal.applyAxisAngle(tangent, twist * Math.sin(v * Math.PI));
    }

    let w;
    if (v < 0.42) {
      const t = v / 0.42;
      w = widthStart + (widthMid - widthStart) * Math.sin(t * Math.PI * 0.5);
    } else {
      const t = (v - 0.42) / 0.58;
      w = widthMid * (1 - t * t) + widthEnd * (t * t);
    }

    const cols = 4;
    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const offset = (u - 0.5) * w;
      const archLift = Math.sin(u * Math.PI) * (w * 0.16);
      const vx = p.x + binormal.x * offset + radial.x * archLift;
      const vy = p.y + binormal.y * offset + radial.y * archLift;
      const vz = p.z + binormal.z * offset + radial.z * archLift;
      positions.push(vx, vy, vz);
      uvs.push(u, 1.0 - v);
    }
  }

  const stride = 5;
  for (let i = 0; i < segments; i++) {
    for (let c = 0; c < 4; c++) {
      const a = i * stride + c;
      const b = a + 1;
      const d = (i + 1) * stride + c;
      const e = d + 1;
      indices.push(a, d, b);
      indices.push(b, d, e);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

export function createRealisticHairGroup(options = {}) {
  const {
    style = 'long_straight',
    hairColor = '#131015',
    sheenIntensity = 0.88,
    neckClearance = 0.38
  } = options;

  const group = new THREE.Group();
  group.name = 'RealisticHairGroup';

  const strandTex = createRealisticHairStrandTexture(hairColor, sheenIntensity);
  strandTex.wrapS = THREE.RepeatWrapping;

  const baseCol = new THREE.Color(hairColor);

  // Solid Volumetric Base Shell Material (rich dark ebony with subtle silk sheen)
  const volumeMat = new THREE.MeshPhysicalMaterial({
    color: baseCol,
    map: strandTex,
    roughness: 0.42,
    metalness: 0.04,
    clearcoat: 0.26 * sheenIntensity,
    clearcoatRoughness: 0.32,
    sheen: 0.45 * sheenIntensity,
    sheenRoughness: 0.38,
    sheenColor: baseCol.clone().lerp(new THREE.Color('#525b76'), 0.35),
    side: THREE.DoubleSide
  });

  // Outer Overlapping Silk Locks Material
  const lockMat = new THREE.MeshPhysicalMaterial({
    color: baseCol,
    map: strandTex,
    alphaMap: strandTex,
    transparent: true,
    alphaTest: 0.12,
    roughness: 0.38,
    metalness: 0.05,
    clearcoat: 0.32 * sheenIntensity,
    clearcoatRoughness: 0.28,
    sheen: 0.55 * sheenIntensity,
    sheenRoughness: 0.32,
    sheenColor: baseCol.clone().lerp(new THREE.Color('#64708f'), 0.38),
    side: THREE.DoubleSide
  });

  const maxDropY = -11.6 + neckClearance * 3.0;

  // 1. Continuous Volumetric Hair Shell (eliminates any temple/crown gaps!)
  const shellGeo = buildContinuousHairShellGeometry(style, maxDropY);
  const shellMesh = new THREE.Mesh(shellGeo, volumeMat);
  group.add(shellMesh);

  // 2. Sculpted Overlapping Face-Framing Side Locks & Temple Curtain (贴颊修颜侧发束)
  const addLock = (pts, w0, w1, w2, twist = 0) => {
    const g = buildHairRibbonGeometry(pts, w0, w1, w2, twist, 28);
    group.add(new THREE.Mesh(g, lockMat));
  };

  for (const side of [-1, 1]) {
    // 4 overlapping temple & cheek-hugging side locks that seamlessly connect the forehead hairline to the cheeks
    for (let s = 0; s < 4; s++) {
      const t = s / 3; // 0 = front-most cheek lock, 1 = pre-auricular lock
      if (style === 'hime_cut') {
        // Blunt cheek-level Hime sidelocks (公主切齐腮发束) hugging the cheek contour at X = +-4.9, Z = +2.8
        const pts = [
          new THREE.Vector3(side * (0.2 + t * 0.4), 10.28, 2.2 - t * 0.6),
          new THREE.Vector3(side * (3.6 + t * 1.1), 8.2, 4.3 - t * 0.8),
          new THREE.Vector3(side * (5.35 + t * 0.55), 3.6, 3.1 - t * 1.1),
          new THREE.Vector3(side * (5.05 + t * 0.55), -0.6, 2.6 - t * 1.1),
          new THREE.Vector3(side * (4.35 + t * 0.50), -4.5 - t * 0.25, 2.2 - t * 1.0)
        ];
        addLock(pts, 1.2, 2.25, 1.85, 0);
      } else if (style === 'low_chignon') {
        // Swept-back temple locks + 1 delicate S-curve tendril (龙须碎发)
        if (s === 0) {
          const pts = [
            new THREE.Vector3(side * 0.25, 10.25, 2.2),
            new THREE.Vector3(side * 3.8, 8.2, 4.3),
            new THREE.Vector3(side * 5.45, 3.6, 2.9),
            new THREE.Vector3(side * 5.25, -0.8, 2.3),
            new THREE.Vector3(side * 4.45, -4.8, 2.0)
          ];
          addLock(pts, 0.9, 1.45, 0.25, side * 0.18);
        } else {
          const pts = [
            new THREE.Vector3(side * (0.3 + t * 0.4), 10.25, 1.8 - t * 0.6),
            new THREE.Vector3(side * (4.4 + t * 1.0), 8.0, 3.8 - t * 1.0),
            new THREE.Vector3(side * (6.35 + t * 0.4), 2.8, 1.6 - t * 1.4),
            new THREE.Vector3(side * (5.2 + t * 0.3), -1.8, -3.5 - t * 1.2),
            new THREE.Vector3(side * 1.8, -3.0, -8.8)
          ];
          addLock(pts, 1.3, 2.4, 1.4, 0);
        }
      } else if (style === 'sleek_bob') {
        // Sleek inner-curl chin bob side locks
        const pts = [
          new THREE.Vector3(side * (0.2 + t * 0.35), 10.28, 2.1 - t * 0.6),
          new THREE.Vector3(side * (3.9 + t * 1.1), 8.1, 4.2 - t * 0.9),
          new THREE.Vector3(side * (5.65 + t * 0.55), 3.2, 2.8 - t * 1.1),
          new THREE.Vector3(side * (5.35 + t * 0.50), -1.5, 2.2 - t * 1.1),
          new THREE.Vector3(side * (4.05 + t * 0.45), -6.5, 1.8 - t * 1.0)
        ];
        addLock(pts, 1.2, 2.3, 1.25, side * 0.15);
      } else {
        // Long Straight & Soft Waves: voluminous curtain bangs + cheek-framing locks flowing down
        const wave = style === 'soft_waves' ? 0.55 : 0.08;
        const pts = [
          new THREE.Vector3(side * (0.2 + t * 0.38), 10.30, 2.1 - t * 0.7),
          new THREE.Vector3(side * (3.7 + t * 1.15), 8.2, 4.35 - t * 0.9),
          new THREE.Vector3(side * (5.55 + t * 0.65), 3.4, 2.95 - t * 1.2),
          new THREE.Vector3(side * (5.25 + t * 0.65 + wave), -1.4, 2.15 - t * 1.2),
          new THREE.Vector3(side * (4.45 + t * 0.65 - wave * 0.6), -6.2, 1.35 - t * 1.2),
          new THREE.Vector3(side * (4.25 + t * 0.65), maxDropY + 0.4, 0.5 - t * 1.2)
        ];
        addLock(pts, 1.25, 2.35, 0.85, side * 0.16);
      }
    }
  }

  // 3. Soft Curved Forehead Fringe / Curtain Bangs (Eliminates sparse comb-tooth bangs!)
  if (style === 'hime_cut') {
    // Cohesive, softly arched Japanese fringe across forehead (from X = -4.2 to +4.2)
    for (let b = -3; b <= 3; b++) {
      const bx = b * 1.15;
      const arch = Math.sqrt(Math.max(0.2, 1 - (bx / 5.4) ** 2));
      const pts = [
        new THREE.Vector3(bx * 0.18, 10.25, 2.3),
        new THREE.Vector3(bx * 0.68, 8.55, 4.65 * arch + 0.45),
        new THREE.Vector3(bx * 0.92, 6.45, 5.18 * arch + 0.35),
        new THREE.Vector3(bx * 1.00, 4.15 + (b * b) * 0.06, 5.02 * arch + 0.22)
      ];
      addLock(pts, 0.95, 1.75, 1.25, 0);
    }
  } else {
    // Soft Korean S-curve curtain bangs (八字高颅顶刘海过渡) bridging the center parting to the temples
    for (const side of [-1, 1]) {
      for (let k = 0; k < 2; k++) {
        const pts = [
          new THREE.Vector3(side * (0.15 + k * 0.2), 10.30, 2.35),
          new THREE.Vector3(side * (1.85 + k * 0.85), 8.65, 4.88 - k * 0.25),
          new THREE.Vector3(side * (3.95 + k * 0.75), 6.05, 4.45 - k * 0.45),
          new THREE.Vector3(side * (5.25 + k * 0.45), 2.85, 3.15 - k * 0.55)
        ];
        addLock(pts, 1.0, 1.95, 0.95, side * 0.14);
      }
    }
  }

  // 4. Sculpted Chignon Bun for 'low_chignon'
  if (style === 'low_chignon') {
    const bunGeo = new THREE.SphereGeometry(2.75, 28, 24);
    bunGeo.scale(1.25, 0.92, 0.88);
    bunGeo.translate(0, -3.0, -9.2);
    const bunMesh = new THREE.Mesh(bunGeo, volumeMat);
    group.add(bunMesh);
  }

  return group;
}
