import * as THREE from 'three';
import { createRealisticHairStrandTexture } from '../textures/skinTextureGenerator.js';

export const HAIR_STYLE_PRESETS = [
  {
    id: 'long_straight',
    name: '东方乌木黑长直 (Classic Ebony Silk)',
    desc: '中分自然发缝 + 贴颊修颜侧发束 + 垂顺高光丝感背发'
  },
  {
    id: 'hime_cut',
    name: '日式姬发公主切 (Classic Hime Cut)',
    desc: '空气感轻薄刘海 + 齐颌阶梯切齐侧发束 + 顺滑长后发'
  },
  {
    id: 'low_chignon',
    name: '江南温婉低盘发 (Elegant Low Chignon)',
    desc: '全露修长颈部与解剖断面 + 脑后温婉发髻 + 龙须刘海碎发'
  },
  {
    id: 'soft_waves',
    name: '韩系八字刘海微卷 (Curtain Bangs Waves)',
    desc: 'S型蓬松高颅顶八字刘海 + 柔美微卷侧发束'
  },
  {
    id: 'sleek_bob',
    name: '清冷高智感内扣短发 (Sleek Chin Bob)',
    desc: '利落齐下颌内扣波波头，完整展露颈部与C4医学解剖断面'
  }
];

/**
 * Extrudes a curved 3D ribbon strip along a CatmullRomCurve3 with outward normal orientation
 */
function buildHairRibbonGeometry(points, widthStart, widthMid, widthEnd, twist = 0, segments = 28) {
  const curve = new THREE.CatmullRomCurve3(points);
  const pts = curve.getPoints(segments);
  const positions = [];
  const uvs = [];
  const indices = [];

  const headCenter = new THREE.Vector3(0, 2.0, -1.8);

  for (let i = 0; i <= segments; i++) {
    const v = i / segments;
    const p = pts[i];
    const tangent = curve.getTangent(v).normalize();

    // Outward radial vector from head center
    const radial = new THREE.Vector3().subVectors(p, headCenter);
    radial.y *= 0.35;
    if (radial.lengthSq() < 0.001) radial.set(0, 0, -1);
    radial.normalize();

    // Binormal along the surface of the head
    const binormal = new THREE.Vector3().crossVectors(tangent, radial).normalize();
    if (twist !== 0) {
      binormal.applyAxisAngle(tangent, twist * Math.sin(v * Math.PI));
    }

    // Smooth width profile (narrow root -> wide mid -> tapered tip)
    let w;
    if (v < 0.45) {
      const t = v / 0.45;
      w = widthStart + (widthMid - widthStart) * Math.sin(t * Math.PI * 0.5);
    } else {
      const t = (v - 0.45) / 0.55;
      w = widthMid * (1 - t * t) + widthEnd * (t * t);
    }

    // Slight transverse arch across the ribbon so it looks cylindrical rather than flat paper
    const cols = 3;
    for (let c = 0; c <= cols; c++) {
      const u = c / cols;
      const offset = (u - 0.5) * w;
      const archLift = Math.sin(u * Math.PI) * (w * 0.14);
      const vx = p.x + binormal.x * offset + radial.x * archLift;
      const vy = p.y + binormal.y * offset + radial.y * archLift;
      const vz = p.z + binormal.z * offset + radial.z * archLift;
      positions.push(vx, vy, vz);
      uvs.push(u, 1.0 - v);
    }
  }

  const stride = 4;
  for (let i = 0; i < segments; i++) {
    for (let c = 0; c < 3; c++) {
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
    hairColor = '#141116',
    sheenIntensity = 0.88,
    neckClearance = 0.35 // 0 = long draping, 1 = high clearance above neck cross-section
  } = options;

  const group = new THREE.Group();
  group.name = 'RealisticHairGroup';

  const strandTex = createRealisticHairStrandTexture(hairColor, sheenIntensity);

  // Main anisotropic silk hair ribbon material
  const hairMat = new THREE.MeshPhysicalMaterial({
    map: strandTex,
    alphaMap: strandTex,
    transparent: true,
    alphaTest: 0.08,
    side: THREE.DoubleSide,
    roughness: 0.34,
    metalness: 0.08,
    clearcoat: 0.65 * sheenIntensity,
    clearcoatRoughness: 0.24,
    sheen: 0.85 * sheenIntensity,
    sheenRoughness: 0.3,
    sheenColor: new THREE.Color(hairColor).lerp(new THREE.Color('#7c839a'), 0.38)
  });

  // Dense inner cranial scalp under-cap material (prevents any gaps between strands)
  const capMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(hairColor).multiplyScalar(0.55),
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide
  });

  // 1. Sculpted Cranial Hair Base Cap hugging the skull vault & occiput
  // Head skull radius: X ~ 7.75, Y ~ [-5.5, +10.7], Z ~ [-9.65, +4.4]
  const capGeoms = [];
  const numCapStrips = 28;
  for (let i = 0; i < numCapStrips; i++) {
    // Angle around back and sides of head: from right temple (-0.18 pi) around back (-0.5 pi) to left temple (-0.82 pi)
    const frac = i / (numCapStrips - 1);
    const phi = -Math.PI * 0.06 - frac * Math.PI * 0.88; // wraps around right side, back, and left side
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi); // negative (towards back -Z)

    const rootX = cosP * 0.35;
    const rootY = 10.78;
    const rootZ = -0.6 + sinP * 0.4;

    const mid1X = cosP * 6.45;
    const mid1Y = 8.4;
    const mid1Z = -1.4 + sinP * 6.6;

    const mid2X = cosP * 8.15;
    const mid2Y = 3.2;
    const mid2Z = -1.9 + sinP * 8.2;

    const lowX = cosP * 7.55;
    const lowY = -3.2;
    const lowZ = -2.2 + sinP * 6.9;

    const napeX = cosP * 5.4;
    const napeY = -7.2;
    const napeZ = -2.4 + sinP * 5.1;

    const pts = [
      new THREE.Vector3(rootX, rootY, rootZ),
      new THREE.Vector3(mid1X, mid1Y, mid1Z),
      new THREE.Vector3(mid2X, mid2Y, mid2Z),
      new THREE.Vector3(lowX, lowY, lowZ),
      new THREE.Vector3(napeX, napeY, napeZ)
    ];
    const g = buildHairRibbonGeometry(pts, 0.9, 2.35, 1.65, 0, 20);
    capGeoms.push(g);
  }
  for (const g of capGeoms) {
    group.add(new THREE.Mesh(g, capMat));
  }

  // Bottom Y limit so hair respects the C4/C5 anatomical neck cross-section (neck_y = -14.2)
  const maxDropY = -13.4 + neckClearance * 3.2;

  // 2. Style-Specific Multi-Layer Hair Ribbons (Back, Side Face-Framing, Bangs/Fringe)
  const ribbons = [];
  const flyawayCurves = [];

  // Helper to add a ribbon + matching flyaway silk strands
  const addStrandBundle = (pts, w0, w1, w2, twist = 0, flyawayCount = 5) => {
    const geom = buildHairRibbonGeometry(pts, w0, w1, w2, twist, 28);
    ribbons.push(new THREE.Mesh(geom, hairMat));

    const baseCurve = new THREE.CatmullRomCurve3(pts);
    for (let f = 0; f < flyawayCount; f++) {
      const offsetSpread = ((f / Math.max(1, flyawayCount - 1)) - 0.5) * w1 * 0.92;
      const lift = 0.08 + (f % 3) * 0.06;
      const fPts = pts.map((p, idx) => {
        const t = idx / (pts.length - 1);
        const rad = new THREE.Vector3(p.x, (p.y - 2.0) * 0.3, p.z + 1.8).normalize();
        const sideVec = new THREE.Vector3(-rad.z, 0, rad.x).normalize();
        return new THREE.Vector3(
          p.x + sideVec.x * offsetSpread * (0.3 + 0.7 * Math.sin(t * Math.PI)) + rad.x * lift,
          p.y + Math.sin(t * Math.PI * 2 + f) * 0.08,
          p.z + sideVec.z * offsetSpread * (0.3 + 0.7 * Math.sin(t * Math.PI)) + rad.z * lift
        );
      });
      flyawayCurves.push(new THREE.CatmullRomCurve3(fPts));
    }
  };

  if (style === 'long_straight' || style === 'hime_cut' || style === 'soft_waves') {
    // Back & posterolateral cascading strands (26 layered ribbons across 2 depth tiers)
    for (let layer = 0; layer < 2; layer++) {
      const count = layer === 0 ? 16 : 12;
      const rBoost = layer * 0.28;
      for (let i = 0; i < count; i++) {
        const frac = i / (count - 1);
        const phi = -Math.PI * 0.14 - frac * Math.PI * 0.72;
        const cosP = Math.cos(phi);
        const sinP = Math.sin(phi);
        const waveAmp = style === 'soft_waves' ? 0.68 : 0.12;
        const phase = i * 0.9 + layer;

        const pts = [
          new THREE.Vector3(cosP * 0.3, 10.82 + layer * 0.05, -0.4 + sinP * 0.3),
          new THREE.Vector3(cosP * (6.3 + rBoost), 8.5, -1.2 + sinP * (6.4 + rBoost)),
          new THREE.Vector3(cosP * (8.15 + rBoost) + Math.sin(phase) * waveAmp * 0.4, 3.0, -1.9 + sinP * (8.15 + rBoost)),
          new THREE.Vector3(cosP * (7.65 + rBoost) - Math.sin(phase) * waveAmp, -3.5, -2.3 + sinP * (7.2 + rBoost)),
          new THREE.Vector3(cosP * (6.45 + rBoost) + Math.sin(phase) * waveAmp, -8.8, -2.8 + sinP * (6.2 + rBoost)),
          new THREE.Vector3(cosP * (5.85 + rBoost), maxDropY, -3.1 + sinP * (5.8 + rBoost))
        ];
        addStrandBundle(pts, 0.75, 2.15, 0.65, (i % 2 === 0 ? 0.12 : -0.12), 6);
      }
    }
  }

  if (style === 'long_straight') {
    // Classic Center-Parted Sleek Face-Framing Side Locks + Temple Drapes
    for (const side of [-1, 1]) {
      for (let s = 0; s < 5; s++) {
        const t = s / 4; // 0 = closest to cheek/temple, 1 = near ear
        const pts = [
          new THREE.Vector3(side * (0.22 + t * 0.4), 10.75, 1.4 - t * 1.2),
          new THREE.Vector3(side * (4.6 + t * 2.2), 8.6 - t * 0.4, 3.6 - t * 2.4),
          new THREE.Vector3(side * (6.95 + t * 0.85), 3.4 - t * 0.5, 1.5 - t * 2.6),
          new THREE.Vector3(side * (6.65 + t * 0.75), -2.4, 0.8 - t * 2.5),
          new THREE.Vector3(side * (5.65 + t * 0.85), -7.8, 0.1 - t * 2.4),
          new THREE.Vector3(side * (5.15 + t * 0.85), maxDropY + 0.5, -0.5 - t * 2.2)
        ];
        addStrandBundle(pts, 0.6, 1.55, 0.35, side * 0.15, 7);
      }
    }
  } else if (style === 'hime_cut') {
    // Iconic Hime Cut Cheek-Level Step Locks + Wispy Air Bangs
    for (const side of [-1, 1]) {
      // Hime cheek locks (bluntly cut around Y = -5.6 near jaw/cheek)
      for (let s = 0; s < 4; s++) {
        const t = s / 3;
        const pts = [
          new THREE.Vector3(side * (0.25 + t * 0.35), 10.75, 1.8 - t * 0.8),
          new THREE.Vector3(side * (4.5 + t * 1.6), 8.5, 3.8 - t * 1.4),
          new THREE.Vector3(side * (6.75 + t * 0.65), 3.2, 2.0 - t * 1.5),
          new THREE.Vector3(side * (6.45 + t * 0.55), -1.8, 1.5 - t * 1.4),
          new THREE.Vector3(side * (5.45 + t * 0.55), -5.8 - t * 0.3, 1.2 - t * 1.3)
        ];
        addStrandBundle(pts, 0.55, 1.45, 1.15, 0, 6);
      }
    }
    // Delicate wispy air bangs across forehead (Y = 10.6 down to eyebrow level Y = 4.6)
    for (let b = -4; b <= 4; b++) {
      const bx = b * 1.05;
      const archZ = Math.sqrt(Math.max(0.1, 1 - (bx / 6.2) ** 2));
      const pts = [
        new THREE.Vector3(bx * 0.18, 10.68, 2.2),
        new THREE.Vector3(bx * 0.65, 8.95, 4.45 * archZ + 0.6),
        new THREE.Vector3(bx * 0.92, 6.85, 5.25 * archZ + 0.4),
        new THREE.Vector3(bx * 1.02, 4.55 + Math.abs(b) * 0.12, 5.15 * archZ + 0.2)
      ];
      addStrandBundle(pts, 0.35, 0.85, 0.25, 0, 4);
    }
  } else if (style === 'soft_waves') {
    // Korean S-Curve Curtain Bangs (八字刘海) + Wavy Side Locks
    for (const side of [-1, 1]) {
      for (let s = 0; s < 5; s++) {
        const t = s / 4;
        const pts = [
          new THREE.Vector3(side * (0.2 + t * 0.35), 10.88, 1.6 - t * 0.9),
          new THREE.Vector3(side * (3.2 + t * 2.1), 8.9, 4.4 - t * 1.6),
          new THREE.Vector3(side * (6.8 + t * 0.9), 4.2, 2.3 - t * 2.0),
          new THREE.Vector3(side * (7.5 + t * 0.7), -0.8, 0.9 - t * 2.2),
          new THREE.Vector3(side * (6.2 + t * 0.8), -5.8, 0.6 - t * 2.2),
          new THREE.Vector3(side * (6.9 + t * 0.7), -9.8, -0.4 - t * 2.1),
          new THREE.Vector3(side * (5.8 + t * 0.7), maxDropY + 0.6, -1.2 - t * 2.0)
        ];
        addStrandBundle(pts, 0.65, 1.65, 0.4, side * 0.28, 7);
      }
    }
  } else if (style === 'low_chignon') {
    // Elegant Low Chignon Updo: Hair swept back into an occipital bun at (0, -2.8, -9.8), leaving the entire neck & cross-section exposed!
    for (let i = 0; i < 18; i++) {
      const frac = i / 17;
      const phi = -Math.PI * 0.12 - frac * Math.PI * 0.76;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);
      const pts = [
        new THREE.Vector3(cosP * 0.3, 10.82, -0.3 + sinP * 0.3),
        new THREE.Vector3(cosP * 6.35, 8.4, -1.2 + sinP * 6.45),
        new THREE.Vector3(cosP * 8.1, 3.2, -1.9 + sinP * 8.15),
        new THREE.Vector3(cosP * 5.2, -1.8, -6.5 + sinP * 3.8),
        new THREE.Vector3(cosP * 1.8, -3.2, -9.8)
      ];
      addStrandBundle(pts, 0.75, 1.95, 0.95, 0, 5);
    }
    // Sculpted coiled chignon bun at the back of the skull (0, -3.0, -10.2)
    for (let k = 0; k < 8; k++) {
      const a0 = (k / 8) * Math.PI * 2;
      const coilPts = [];
      for (let step = 0; step <= 8; step++) {
        const ang = a0 + (step / 8) * Math.PI * 1.6;
        const r = 1.6 + 0.95 * Math.sin((step / 8) * Math.PI);
        coilPts.push(new THREE.Vector3(
          Math.cos(ang) * r * 1.25,
          -3.0 + Math.sin(ang) * r,
          -9.6 - Math.sin((step / 8) * Math.PI) * 1.85
        ));
      }
      addStrandBundle(coilPts, 0.85, 1.45, 0.75, 0.3, 4);
    }
    // Delicate S-curve temple tendrils (龙须刘海) framing the cheeks
    for (const side of [-1, 1]) {
      for (let t = 0; t < 2; t++) {
        const pts = [
          new THREE.Vector3(side * (0.25 + t * 0.4), 10.75, 1.8 - t * 0.6),
          new THREE.Vector3(side * (4.4 + t * 1.2), 8.4, 3.9 - t * 1.0),
          new THREE.Vector3(side * (6.75 + t * 0.5), 3.6, 2.2 - t * 1.1),
          new THREE.Vector3(side * (6.95 + t * 0.4), -1.2, 1.2 - t * 1.1),
          new THREE.Vector3(side * (5.85 + t * 0.4), -5.6 - t * 1.2, 1.5 - t * 1.0)
        ];
        addStrandBundle(pts, 0.4, 0.95, 0.18, side * 0.22, 6);
      }
    }
  } else if (style === 'sleek_bob') {
    // Sleek Chin-Length Inner-Curl Bob (curves inward at Y = -8.2, exposing lower neck & anatomical cross-section)
    for (let i = 0; i < 22; i++) {
      const frac = i / 21;
      const phi = -Math.PI * 0.04 - frac * Math.PI * 0.92;
      const cosP = Math.cos(phi);
      const sinP = Math.sin(phi);
      const pts = [
        new THREE.Vector3(cosP * 0.3, 10.82, -0.2 + sinP * 0.3),
        new THREE.Vector3(cosP * 6.4, 8.4, -1.1 + sinP * 6.4),
        new THREE.Vector3(cosP * 8.2, 3.0, -1.8 + sinP * 8.15),
        new THREE.Vector3(cosP * 7.8, -2.8, -2.0 + sinP * 7.2),
        new THREE.Vector3(cosP * 6.1, -7.8, -2.1 + sinP * 5.6)
      ];
      addStrandBundle(pts, 0.7, 1.95, 0.85, 0, 5);
    }
    for (const side of [-1, 1]) {
      for (let s = 0; s < 3; s++) {
        const t = s / 2;
        const pts = [
          new THREE.Vector3(side * (0.25 + t * 0.3), 10.78, 1.6 - t * 0.8),
          new THREE.Vector3(side * (4.8 + t * 1.4), 8.4, 3.6 - t * 1.4),
          new THREE.Vector3(side * (6.95 + t * 0.6), 3.0, 1.8 - t * 1.5),
          new THREE.Vector3(side * (6.75 + t * 0.5), -2.8, 1.2 - t * 1.4),
          new THREE.Vector3(side * (5.25 + t * 0.5), -7.9, 1.1 - t * 1.3)
        ];
        addStrandBundle(pts, 0.55, 1.45, 0.65, side * 0.15, 6);
      }
    }
  }

  for (const rMesh of ribbons) {
    group.add(rMesh);
  }

  // 3. Build 3D Individual Micro-Flyaway Silk Hair Strands (THREE.LineSegments with vertex color sheen)
  const linePositions = [];
  const lineColors = [];
  const rootCol = new THREE.Color(hairColor).multiplyScalar(0.7);
  const sheenCol = new THREE.Color(hairColor).lerp(new THREE.Color('#a3acc2'), 0.45 * sheenIntensity);
  const tipCol = new THREE.Color(hairColor).multiplyScalar(0.9);

  for (const curve of flyawayCurves) {
    const segs = 16;
    const cPts = curve.getPoints(segs);
    for (let i = 0; i < segs; i++) {
      const t0 = i / segs;
      const t1 = (i + 1) / segs;
      const p0 = cPts[i];
      const p1 = cPts[i + 1];
      linePositions.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);

      const colForT = (t) => {
        // Angel-ring highlight peak around t = 0.34
        const sheen = Math.exp(-Math.pow((t - 0.34) / 0.14, 2));
        return rootCol.clone().lerp(tipCol, t).lerp(sheenCol, sheen);
      };
      const c0 = colForT(t0);
      const c1 = colForT(t1);
      lineColors.push(c0.r, c0.g, c0.b, c1.r, c1.g, c1.b);
    }
  }

  if (linePositions.length > 0) {
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    lineGeom.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.62
    });
    const flyawayLines = new THREE.LineSegments(lineGeom, lineMat);
    group.add(flyawayLines);
  }

  return group;
}
