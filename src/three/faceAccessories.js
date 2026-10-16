import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  glassesContourKey, readGlassesContour, sampleGlassesContour,
  sampleGlassesContourPoints,
} from './glassesContour.js';

// Existing handmade frames remain available. The optional scanned-texture
// metal frame is a separately licensed CC0 Poly Haven asset; offline HTML
// embeds its GLB while the dev-server version fetches the same local file.
const POLYHAVEN_URL = '/models/polyhaven_round_spectacles.glb';
const GLASSES = new Set(['none', 'squircle_large', 'wire_oval', 'acetate_square', 'aviator', 'polyhaven_round', 'polyhaven_large_oval']);
const FRAME_OUTLINES = new Set(['soft_square', 'round', 'cat_eye']);
const FRAME_FINISHES = {
  warm_acetate: { color: '#a07857', metalness: 0.025, roughness: 0.32, clearcoat: 0.78 },
  matte_black: { color: '#333039', metalness: 0.0, roughness: 0.75, clearcoat: 0.08 },
  brushed_titanium: { color: '#b5bfc3', metalness: 0.88, roughness: 0.37, clearcoat: 0.12 },
  champagne_gold: { color: '#c49a61', metalness: 0.78, roughness: 0.22, clearcoat: 0.38 },
};
let polyhavenSourcePromise = null;
const HATS = new Set(['none', 'beret', 'beanie', 'bucket']);
const EYE_Y = 0.021;
const FRAME_Z = 0.105;
const FRAME_ANCHOR = new THREE.Vector3(0, EYE_Y, FRAME_Z);
const acetateStyle = style => style === 'squircle_large' || style === 'acetate_square';
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const limit = (v, fallback, min, max) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const hex = (v, fallback) => /^#[\da-f]{6}$/i.test(v || '') ? v : fallback;

// Subtle bounded acetate grain breaks up a flat plastic silhouette without
// shipping an external file. The reusable atlas remains local and offline.
let acetateGrain = null;
function warmAcetateGrain() {
  if (acetateGrain) return acetateGrain;
  const w = 128, h = 64, bytes = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const wave = Math.sin(x * 0.19 + 1.8 * Math.sin(y * 0.21))
      * Math.sin(y * 0.18 + Math.sin(x * 0.045));
    const grain = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1;
    const value = Math.max(0.78, Math.min(1.0, 0.93 + wave * 0.055 + grain * 0.016));
    const i = (y * w + x) * 4;
    bytes[i] = Math.round(255 * value);
    bytes[i + 1] = Math.round(254 * value);
    bytes[i + 2] = Math.round(248 * value);
    bytes[i + 3] = 255;
  }
  acetateGrain = new THREE.DataTexture(bytes, w, h, THREE.RGBAFormat);
  acetateGrain.colorSpace = THREE.SRGBColorSpace;
  acetateGrain.wrapS = acetateGrain.wrapT = THREE.RepeatWrapping;
  acetateGrain.minFilter = THREE.LinearMipmapLinearFilter;
  acetateGrain.magFilter = THREE.LinearFilter;
  acetateGrain.generateMipmaps = true;
  acetateGrain.needsUpdate = true;
  return acetateGrain;
}

function mesh(group, geometry, material, name, castShadow = true) {
  const part = new THREE.Mesh(geometry, material);
  part.name = name;
  part.castShadow = castShadow;
  part.receiveShadow = true;
  group.add(part);
  return part;
}

function wire(group, coordinates, radius, material, name, closed = false) {
  const curve = new THREE.CatmullRomCurve3(
    coordinates.map(p => V(...p)), closed, 'centripetal'
  );
  return mesh(group, new THREE.TubeGeometry(curve, Math.max(24, coordinates.length * 2), radius, 6, closed), material, name, false);
}

function proceduralOutlineSpec(style, outline) {
  const large = style === 'squircle_large';
  const acetate = style === 'acetate_square' || large;
  return {
    large, acetate,
    cx: large ? 0.0335 : 0.032,
    rx: large ? 0.0292 : style === 'aviator' ? 0.027 : style === 'wire_oval' ? 0.0253 : 0.0263,
    ry: large ? (outline === 'round' ? 0.0210 : 0.0191)
      : style === 'aviator' ? 0.019 : style === 'wire_oval' ? 0.0164 : 0.0154,
    cy: style === 'aviator' ? 0.0205 : 0.020,
    exPow: outline === 'round' ? 1 : outline === 'cat_eye' ? 0.78
      : large ? 0.62 : acetate ? 0.67 : 0.78,
    eyPow: outline === 'round' ? 1 : outline === 'cat_eye' ? 0.80
      : large ? 0.66 : acetate ? 0.75 : 0.85,
  };
}

function proceduralContourXY(style, morphs, side, angle, inset = 0) {
  const outline = FRAME_OUTLINES.has(morphs.glassesOutline) ? morphs.glassesOutline : 'soft_square';
  const s = proceduralOutlineSpec(style, outline);
  const c = side * Math.cos(angle), sin = Math.sin(angle);
  const ex = Math.sign(c) * Math.pow(Math.abs(c), s.exPow);
  const ey = Math.sign(sin) * Math.pow(Math.abs(sin), s.eyPow);
  const catLift = outline === 'cat_eye' ? 0.007 * Math.max(0, side * ex) ** 2 : 0;
  const [outward, up] = sampleGlassesContour(morphs.glassesContours, style, side, angle);
  return [
    side * s.cx + (s.rx - inset) * ex + side * s.rx * outward,
    s.cy - EYE_Y + (s.ry - inset) * ey + catLift + s.ry * up,
  ];
}

// Shared by the renderer and the on-canvas shape editor. Returns a real
// frame-local position, not a 2D approximation detached from the 3D lenses.
export function glassesContourFrameSize(style, morphs = {}) {
  if (style.startsWith('polyhaven_')) return { cx: 0.029, rx: 0.026, ry: 0.022 };
  return proceduralOutlineSpec(style, morphs.glassesOutline || 'soft_square');
}

export function glassesContourHandleLocal(style, morphs, side, index) {
  const angle = index * Math.PI / 4;
  if (style.startsWith('polyhaven_')) {
    const [outward, up] = sampleGlassesContour(morphs.glassesContours, style, side, angle);
    return new THREE.Vector3(
      side * (0.029 + 0.026 * (Math.cos(angle) + outward)),
      0.022 * (Math.sin(angle) + up),
      -0.010,
    );
  }
  const [x, y] = proceduralContourXY(style, morphs, side, angle);
  return new THREE.Vector3(x, y, -0.001);
}

function glassesAsset(style, morphs = {}) {
  const root = new THREE.Group();
  root.name = `Glasses_${style}`;
  const largeSquircle = style === 'squircle_large';
  const acetate = style === 'acetate_square' || largeSquircle;
  const outlineStyle = FRAME_OUTLINES.has(morphs.glassesOutline) ? morphs.glassesOutline : 'soft_square';
  const rimThickness = limit(morphs.glassesRimThickness, 1, 0.42, 1.90);
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: acetate ? '#342523' : '#524740', metalness: acetate ? 0.035 : 0.82,
    roughness: acetate ? 0.32 : 0.29, clearcoat: acetate ? 0.78 : 0.22,
    clearcoatRoughness: acetate ? 0.19 : 0.26, envMapIntensity: 0.68,
    side: THREE.DoubleSide,
  });
  const hardwareMat = new THREE.MeshPhysicalMaterial({
    color: '#aca69d', metalness: 0.92, roughness: 0.25,
    clearcoat: 0.35, envMapIntensity: 0.88,
  });
  // A gently convex, clear optical lens with a weak anti-reflection cast.
  // Transmission is deliberately avoided so offline/software WebGL remains fast.
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: '#e8f3fa', metalness: 0, roughness: 0.16,
    specularIntensity: 0.95, specularColor: '#f3f9ff',
    clearcoat: 0.92, clearcoatRoughness: 0.13,
    transparent: true, opacity: 0.12, depthWrite: false,
    side: THREE.DoubleSide, envMapIntensity: 0.65,
  });
  const reflexMat = new THREE.MeshBasicMaterial({
    color: '#d7efff', transparent: true, opacity: 0.16,
    depthWrite: false, side: THREE.DoubleSide,
  });
  const padMat = new THREE.MeshPhysicalMaterial({
    color: '#d9e0db', roughness: 0.38, metalness: 0,
    transparent: true, opacity: 0.42, depthWrite: false,
  });
  root.userData.frameMaterial = frameMat;
  root.userData.lensMaterial = lensMat;

  for (const side of [-1, 1]) {
    const spec = proceduralOutlineSpec(style, outlineStyle);
    const cx = side * spec.cx, rx = spec.rx, ry = spec.ry, cy = spec.cy;
    const steps = 64;
    // A separate editable contour changes each rim vertex, its actual lens
    // aperture and the optician hardware, not the overall frame scale.
    // For the left lens the parameter is mirrored so 'outer' means outward
    // on both eyes; zero offsets reproduce the untouched artist silhouette.
    const xy = (t, inset = 0) => proceduralContourXY(
      style, morphs, side, side < 0 ? Math.PI - t : t, inset
    );
    const rim = [];
    for (let i = 0; i < steps; i++) {
      const [x, y] = xy(i * Math.PI * 2 / steps);
      rim.push([x, y, -0.0012 * ((x - cx) / rx) ** 2]);
    }
    if (acetate) {
      // A bevelled 3D annular acetate band, rather than a round gold pipe.
      const outline = new THREE.Shape();
      for (let i = 0; i < steps; i++) {
        const [x, y] = xy(i * Math.PI * 2 / steps);
        if (i === 0) outline.moveTo(x, y); else outline.lineTo(x, y);
      }
      outline.closePath();
      const rimWidth = (largeSquircle ? 0.00215 : 0.00205) * rimThickness;
      const aperture = new THREE.Path();
      for (let i = steps - 1; i >= 0; i--) {
        const [x, y] = xy(i * Math.PI * 2 / steps, rimWidth);
        if (i === steps - 1) aperture.moveTo(x, y); else aperture.lineTo(x, y);
      }
      aperture.closePath();
      outline.holes.push(aperture);
      const ring = mesh(root, new THREE.ExtrudeGeometry(outline, {
        depth: 0.0017 * rimThickness, steps: 1, bevelEnabled: true,
        bevelThickness: 0.00034, bevelSize: 0.00026, bevelSegments: 2,
      }), frameMat, `AcetateBevel_${side}`, false);
      ring.position.z = -0.0014;
    } else {
      wire(root, rim, (style === 'aviator' ? 0.00091 : 0.00079) * rimThickness,
        frameMat, `TitaniumRim_${side}`, true);
      // A fine secondary rear eye-wire catches the studio key light.
      const inner = rim.map(([x, y, z]) => [
        cx + (x - cx) * 0.977, cy - EYE_Y + (y - (cy - EYE_Y)) * 0.977, z - 0.00115,
      ]);
      wire(root, inner, 0.00027 * Math.sqrt(rimThickness), hardwareMat, `InnerWire_${side}`, true);
    }

    const lensVerts = [cx, cy - EYE_Y, -0.00115];
    const lensIdx = [];
    for (let i = 0; i <= steps; i++) {
      const [x, y] = xy(i * Math.PI * 2 / steps,
        acetate ? (largeSquircle ? 0.00215 : 0.00205) * rimThickness + 0.0002 : 0.00075 * rimThickness);
      lensVerts.push(x, y, -0.0021 - 0.00045 * ((x - cx) / rx) ** 2);
      if (i < steps) lensIdx.push(0, i + 1, i + 2);
    }
    const lensGeo = new THREE.BufferGeometry();
    lensGeo.setAttribute('position', new THREE.Float32BufferAttribute(lensVerts, 3));
    lensGeo.setIndex(lensIdx);
    lensGeo.computeVertexNormals();
    const lens = mesh(root, lensGeo, lensMat, `ConvexOpticalLens_${side}`, false);
    lens.renderOrder = 4;
    // Asymmetrical, low-opacity blue AR reflection (the face remains visible).
    wire(root, [
      [cx - rx * 0.72, cy - EYE_Y + ry * 0.30, -0.00154],
      [cx - rx * 0.44, cy - EYE_Y + ry * 0.60, -0.00128],
      [cx - rx * 0.15, cy - EYE_Y + ry * 0.67, -0.00128],
    ], 0.00028, reflexMat, `AntiReflectGlint_${side}`);

    // Mechanical endpieces, real receding temples and two tiny hinge screws.
    const outer = proceduralContourXY(style, morphs, side, 0);
    const templeStart = outer[0];
    const hingeY = outer[1] + 0.0022;
    const hingeLift = hingeY - (0.0222 - EYE_Y);
    const arm = [
      [templeStart, hingeY, -0.0014],
      [side * 0.065, 0.0220 - EYE_Y + hingeLift * 0.65, 0.091 - FRAME_Z],
      [side * 0.071, 0.0200 - EYE_Y, 0.048 - FRAME_Z],
      [side * 0.074, 0.0160 - EYE_Y, 0.005 - FRAME_Z],
      [side * 0.073, 0.0090 - EYE_Y, -0.020 - FRAME_Z],
      [side * 0.068, 0.0040 - EYE_Y, -0.026 - FRAME_Z],
    ];
    wire(root, arm, acetate ? 0.00130 : 0.00068, frameMat, `Temple_${side}`);
    const hinge = mesh(root, new THREE.BoxGeometry(0.0028, 0.0025, 0.0033), hardwareMat, `Hinge_${side}`, false);
    hinge.position.set(templeStart, arm[0][1], -0.0012);
    for (const h of [-1, 1]) {
      const screw = mesh(root, new THREE.SphereGeometry(0.00043, 8, 6),
        hardwareMat, `HingePin_${side}_${h}`, false);
      screw.position.set(templeStart + side * 0.0003, arm[0][1] + h * 0.0007, 0.0007);
    }
    if (!acetate || largeSquircle) {
      const pad = mesh(root, new THREE.SphereGeometry(0.0025, 12, 10),
        padMat, `SiliconeNosePad_${side}`, false);
      pad.position.set(side * 0.0094, 0.010 - EYE_Y, 0.098 - FRAME_Z);
      pad.scale.set(0.70, 1.07, 0.45);
      wire(root, [
        [side * 0.0090, 0.020 - EYE_Y, 0.103 - FRAME_Z],
        [side * 0.0085, 0.015 - EYE_Y, 0.101 - FRAME_Z],
        [side * 0.0094, 0.010 - EYE_Y, 0.098 - FRAME_Z],
      ], 0.00032, hardwareMat, `PadArm_${side}`);
    }
  }
  // The bridge ends follow both inner contour landmarks; widening one nose
  // corner no longer leaves a disconnected metal stub beside the new lens.
  const innerL = proceduralContourXY(style, morphs, -1, Math.PI);
  const innerR = proceduralContourXY(style, morphs, 1, Math.PI);
  const bridgeL = Math.min(-0.003, innerL[0] - 0.0035);
  const bridgeR = Math.max(0.003, innerR[0] + 0.0035);
  wire(root, [
    [bridgeL, innerL[1] + 0.0075, -0.0014],
    [bridgeL * 0.62, innerL[1] + 0.0100, 0.0010],
    [0, (innerL[1] + innerR[1]) * 0.5 + 0.0109, 0.0017],
    [bridgeR * 0.62, innerR[1] + 0.0100, 0.0010],
    [bridgeR, innerR[1] + 0.0075, -0.0014],
  ], acetate ? (largeSquircle ? 0.0012 * Math.sqrt(rimThickness) : 0.00110) : 0.00074,
  frameMat, 'NasalSaddleBridge');
  if (style === 'aviator') {
    wire(root, [
      [-0.012, 0.039 - EYE_Y, -0.0020], [-0.006, 0.041 - EYE_Y, -0.0010],
      [0, 0.0412 - EYE_Y, -0.0007], [0.006, 0.041 - EYE_Y, -0.0010],
      [0.012, 0.039 - EYE_Y, -0.0020],
    ], 0.00067, hardwareMat, 'UpperAviatorBridge');
  }
  return root;
}

function ringLine(root, radiusX, radiusZ, y, mat, thickness, name) {
  const pts = [];
  for (let i = 0; i < 64; i++) {
    const t = i * Math.PI * 2 / 64;
    pts.push([radiusX * Math.cos(t), y, radiusZ * Math.sin(t)]);
  }
  return wire(root, pts, thickness, mat, name, true);
}

function brimGeometry(innerR, outerR, drop = 0) {
  const vertices = [], indices = [];
  for (let i = 0; i <= 96; i++) {
    const t = i * Math.PI * 2 / 96;
    const c = Math.cos(t), s = Math.sin(t);
    vertices.push(innerR * c, 0.004, innerR * 0.87 * s);
    vertices.push(outerR * c, -drop, outerR * 0.87 * s);
    if (i < 96) {
      const j = i * 2;
      indices.push(j, j + 2, j + 1, j + 2, j + 3, j + 1);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

function hatAsset(style) {
  const root = new THREE.Group();
  root.name = `Hat_${style}`;
  const fabric = new THREE.MeshPhysicalMaterial({
    color: '#785670', metalness: 0,
    roughness: style === 'beanie' ? 0.96 : 0.85,
    sheen: style === 'beret' ? 0.24 : 0.12,
    sheenColor: '#b99ba9', sheenRoughness: 0.89,
    side: THREE.DoubleSide,
  });
  const trim = fabric.clone();
  trim.color.multiplyScalar(0.70);
  trim.roughness = 0.86;
  root.userData.fabricMaterial = fabric;
  root.userData.trimMaterial = trim;

  if (style === 'beret') {
    const band = mesh(root, new THREE.CylinderGeometry(0.083, 0.082, 0.011, 72, 1, true), trim, 'BeretHeadband');
    band.scale.z = 0.86;
    band.position.y = 0.003;
    const feltProfile = [
      [0.000, 0.057], [0.028, 0.055], [0.057, 0.048],
      [0.086, 0.031], [0.104, 0.016], [0.103, 0.011],
      [0.091, 0.006], [0.080, -0.002],
    ].map(([r, h]) => new THREE.Vector2(r, h));
    const felt = mesh(root, new THREE.LatheGeometry(feltProfile, 72), fabric, 'FeltBeretCrown');
    felt.scale.z = 0.85;
    felt.position.x = -0.003;
    ringLine(root, 0.083, 0.071, -0.003, trim, 0.0010, 'BeretLowerSeam');
    const button = mesh(root, new THREE.SphereGeometry(0.004, 12, 8), trim, 'BeretTopButton');
    button.position.set(-0.003, 0.057, 0);
    button.scale.y = 0.40;
  } else if (style === 'beanie') {
    const profile = [
      [0.0, 0.065], [0.022, 0.063], [0.047, 0.055],
      [0.071, 0.038], [0.083, 0.016], [0.084, 0.006],
    ].map(([r, h]) => new THREE.Vector2(r, h));
    const crown = mesh(root, new THREE.LatheGeometry(profile, 72), fabric, 'KnitBeanieDome');
    crown.scale.z = 0.87;
    const cuff = mesh(root, new THREE.CylinderGeometry(0.084, 0.085, 0.018, 72, 1, true), trim, 'KnitFoldedCuff');
    cuff.position.y = 0.002;
    cuff.scale.z = 0.87;
    ringLine(root, 0.085, 0.074, -0.007, fabric, 0.0008, 'BeanieCuffHem');
    ringLine(root, 0.084, 0.073, 0.011, fabric, 0.00075, 'BeanieCuffTop');
    for (let rib = 0; rib < 32; rib++) {
      const t = rib * Math.PI * 2 / 32;
      const c = Math.cos(t), s = Math.sin(t);
      wire(root, [
        [0.085 * c, -0.006, 0.074 * s],
        [0.085 * c, 0.002, 0.074 * s],
        [0.084 * c, 0.011, 0.073 * s],
      ], 0.00043, fabric, `KnitRib_${rib}`);
    }
  } else if (style === 'bucket') {
    const profile = [
      [0.0, 0.056], [0.047, 0.056], [0.068, 0.052],
      [0.077, 0.040], [0.079, 0.017], [0.080, 0.006],
    ].map(([r, h]) => new THREE.Vector2(r, h));
    const crown = mesh(root, new THREE.LatheGeometry(profile, 72), fabric, 'BucketStructuredCrown');
    crown.scale.z = 0.86;
    mesh(root, brimGeometry(0.078, 0.109, 0.009), fabric, 'BucketCurvedBrim');
    ringLine(root, 0.109, 0.095, -0.009, trim, 0.00105, 'BucketBrimEdge');
    ringLine(root, 0.079, 0.068, 0.010, trim, 0.00125, 'BucketCrownBand');
    ringLine(root, 0.079, 0.068, 0.016, trim, 0.00055, 'BucketStitch');
  }
  return root;
}

async function polyhavenSource() {
  if (!polyhavenSourcePromise) {
    polyhavenSourcePromise = (async () => {
      const base64 = typeof window !== 'undefined' && window.__EMBEDDED_GLBS__?.[POLYHAVEN_URL];
      let buffer;
      if (base64) {
        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        buffer = bytes.buffer;
      } else {
        const response = await fetch(POLYHAVEN_URL);
        if (!response.ok) throw new Error(`Eyeglasses GLB HTTP ${response.status}`);
        buffer = await response.arrayBuffer();
      }
      const { scene } = await new GLTFLoader().parseAsync(buffer, '');
      scene.traverse(obj => {
        if (!obj.isMesh) return;
        // This template is shared by all heads. A change of style frees its
        // per-head materials, not the immutable geometry / atlas textures.
        obj.geometry.userData.sharedBuiltinGeo = true;
        for (const mat of (Array.isArray(obj.material) ? obj.material : [obj.material])) {
          for (const value of Object.values(mat)) {
            if (value?.isTexture) value.userData.sharedSkinMicro = true;
          }
        }
      });
      return scene;
    })().catch(err => { polyhavenSourcePromise = null; throw err; });
  }
  return polyhavenSourcePromise;
}

function reshapeScannedGlasses(glasses, outline, rimThickness, morphs, style) {
  const contour = glassesContourKey(morphs.glassesContours, style);
  const key = `${outline}|${rimThickness.toFixed(2)}|${contour}`;
  if (!glasses.userData.physicalLoaded || glasses.userData.scannedShapeKey === key) return;
  if (outline === 'round' && Math.abs(rimThickness - 1) < 0.005 && !contour && !glasses.userData.scannedShapeKey) {
    glasses.userData.scannedShapeKey = key; // preserve authored scan normals at its untouched baseline
    return;
  }
  const points = {
    '-1': readGlassesContour(morphs.glassesContours, style, -1),
    '1': readGlassesContour(morphs.glassesContours, style, 1),
  };
  glasses.updateWorldMatrix(true, true);
  const fromWorld = glasses.matrixWorld.clone().invert();
  const p = new THREE.Vector3();
  glasses.traverse(obj => {
    const attr = obj.isMesh && obj.geometry?.attributes?.position;
    if (!attr || !obj.userData.scannedBasePositions) return;
    const toGlasses = fromWorld.clone().multiply(obj.matrixWorld);
    const toMesh = toGlasses.clone().invert();
    const base = obj.userData.scannedBasePositions;
    const isLens = Boolean(obj.userData.isOpticalLens);
    for (let i = 0; i < attr.count; i++) {
      p.fromArray(base, i * 3).applyMatrix4(toGlasses);
      // The real CC0 scan has a contiguous bezel/hinge/temple: reshape it in
      // frame-local coordinates, preserving its mesh, UVs and material map.
      const forward = Math.min(1, Math.max(0, (p.z + 0.036) / 0.029));
      const outer = Math.min(1, Math.max(0, (Math.abs(p.x) - 0.028) / 0.040));
      if (outline === 'soft_square') {
        p.y += Math.sign(p.y) * 0.0023 * outer * outer * forward;
      } else if (outline === 'cat_eye') {
        p.y += (0.002 + 0.008 * outer * outer) * forward * (p.y > -0.022 ? 1 : 0.25);
      }
      if (!isLens && Math.abs(rimThickness - 1) > 0.005 && forward > 0) {
        const side = p.x < 0 ? -1 : 1;
        const dx = Math.abs(p.x) - 0.029;
        const r = Math.hypot(dx / 0.026, p.y / 0.022);
        if (r > 0.60 && r < 1.45) {
          const thick = (rimThickness - 1) * 0.0024 * (r >= 1 ? 1 : -1) * forward;
          p.x += side * (dx / 0.026) / r * thick;
          p.y += (p.y / 0.022) / r * thick;
        }
      }
      if (contour && forward > 0) {
        // Warp the actual CC0 scan in frame coordinates. Preserve hinges and
        // temples by fading away from the optical rims AND behind their front
        // plane; the clear lenses follow the exact same contour landmarks.
        const side = p.x < 0 ? -1 : 1;
        const nx = (Math.abs(p.x) - 0.029) / 0.026;
        const ny = p.y / 0.022;
        const r = Math.hypot(nx, ny);
        const inside = Math.max(0, Math.min(1, (r - 0.32) / 0.50));
        const outside = Math.max(0, Math.min(1, (1.67 - r) / 0.47));
        const mask = inside * outside * forward;
        if (mask > 0) {
          const [outward, up] = sampleGlassesContourPoints(points[String(side)], Math.atan2(ny, nx));
          p.x += side * 0.026 * outward * mask;
          p.y += 0.022 * up * mask;
        }
      }
      p.applyMatrix4(toMesh).toArray(attr.array, i * 3);
    }
    attr.needsUpdate = true;
    obj.geometry.computeVertexNormals();
    obj.geometry.computeBoundingBox();
    obj.geometry.computeBoundingSphere();
  });
  glasses.userData.scannedShapeKey = key;
}

function physicalGlassesAsset(rootGroup, glasses, morphs) {
  polyhavenSource().then(source => {
    // A head may have been rebuilt or the user may have switched style while
    // the Promise was pending. Never resurrect an accessory on a stale head.
    if (!glasses.parent || rootGroup.userData.disposed) return;
    const holder = glasses.parent;
    if (holder.userData.glassesStyle !== glasses.userData.physicalStyle) return;
    const instance = source.clone(true);
    instance.traverse(obj => {
      if (!obj.isMesh) return;
      // A GLTF scene clone shares geometry by default. Own this copy before
      // per-head frame sculpting, or changing one person's glasses would
      // irreversibly deform every other saved character's CC0 model.
      obj.geometry = obj.geometry.clone();
      obj.userData.scannedBasePositions = Float32Array.from(obj.geometry.attributes.position.array);
      const glass = obj.material?.name === 'round_spectacles_glass';
      obj.userData.isOpticalLens = glass;
      const mat = obj.material.clone();
      if (glass) {
        // glTF transmission requires an entire extra screen pass. The thin
        // lens uses a real mesh with faint tint instead, even on software GL.
        mat.transmission = 0;
        mat.map = null;
        mat.normalMap = null;
        mat.metalnessMap = null;
        mat.roughnessMap = null;
        mat.metalness = 0;
        mat.roughness = 0.19;
        mat.transparent = true;
        mat.opacity = 0.08;
        mat.depthWrite = false;
        mat.color.set('#eaf1ee');
        obj.renderOrder = 4;
        obj.castShadow = false;
        glasses.userData.lensMaterial = mat;
      } else {
        mat.metalness = 0.86;
        mat.roughness = 0.31;
        mat.transparent = false;
        obj.castShadow = false;
        glasses.userData.frameMaterial = mat;
        glasses.userData.scannedFrameMap = mat.map;
      }
      obj.material = mat;
    });
    glasses.add(instance);
    glasses.userData.physicalLoaded = true;
    syncFaceAccessories(rootGroup, rootGroup.userData.currentMorphs || morphs);
    window.dispatchEvent(new Event('cervix3d:asset-ready'));
  }).catch(err => {
    if (!glasses.parent || rootGroup.userData.disposed) return;
    console.warn('CC0 eyeglasses failed to load; showing a lightweight fallback:', err);
    rootGroup.userData.accessoryLoadError = String(err.message || err);
    const fallback = glassesAsset('wire_oval');
    glasses.add(fallback);
    glasses.userData.frameMaterial = fallback.userData.frameMaterial;
    glasses.userData.lensMaterial = fallback.userData.lensMaterial;
    glasses.userData.polyhavenFallback = true;
    syncFaceAccessories(rootGroup, rootGroup.userData.currentMorphs || morphs);
    window.dispatchEvent(new Event('cervix3d:asset-ready'));
  });
}

function disposePart(part) {
  if (!part) return;
  part.parent?.remove(part);
  const materials = new Set(), geometries = new Set();
  part.traverse(obj => {
    if (!obj.isMesh) return;
    if (!obj.geometry?.userData?.sharedBuiltinGeo) geometries.add(obj.geometry);
    for (const mat of (Array.isArray(obj.material) ? obj.material : [obj.material])) materials.add(mat);
  });
  geometries.forEach(g => g?.dispose());
  materials.forEach(mat => mat?.dispose());
}

function hairCrownFit(modelContainer) {
  const hair = modelContainer.getObjectByName('HairGroup');
  if (!hair) return { baseY: 0.075, topY: 0.122, bare: true };
  modelContainer.updateWorldMatrix(true, true);
  const toLocal = modelContainer.matrixWorld.clone().invert();
  let top = 0.122;
  hair.traverse(obj => {
    if (!obj.isMesh || !obj.geometry?.attributes?.position) return;
    if (obj.name === 'MasterStrandHairMesh' || obj.name === 'ScalpRootStrands' || obj.name.includes('ScalpCap')) return;
    if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
    const box = obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld).applyMatrix4(toLocal);
    if (Number.isFinite(box.max.y)) top = Math.max(top, box.max.y);
  });
  // The single tallest hair tuft is not where the band sits: wrap the real
  // crown volume several centimetres BELOW it. Very tall buns are clamped to
  // a humane hat height; the user can adjust the brim in the editor.
  return {
    baseY: Math.max(0.077, Math.min(0.108, top - 0.066)),
    topY: Math.min(top, 0.176),
    bare: false,
  };
}

export function syncFaceAccessories(rootGroup, morphs = {}) {
  if (!rootGroup?.userData?.accessoriesReady) return;
  const modelContainer = rootGroup.getObjectByName('RealDazHeadContainer');
  if (!modelContainer) return;
  let holder = modelContainer.getObjectByName('FaceAccessories');
  const glassesStyle = GLASSES.has(morphs.glassesStyle) ? morphs.glassesStyle : 'none';
  const hatStyle = HATS.has(morphs.hatStyle) ? morphs.hatStyle : 'none';
  if (!holder && glassesStyle === 'none' && hatStyle === 'none') return;
  if (!holder) {
    holder = new THREE.Group();
    holder.name = 'FaceAccessories';
    modelContainer.add(holder);
  }
  const outline = FRAME_OUTLINES.has(morphs.glassesOutline) ? morphs.glassesOutline : 'soft_square';
  const rimThickness = limit(morphs.glassesRimThickness, 1, 0.42, 1.90);
  // Procedural styles rebuild real rim/lens vertices; the scanned CC0 style
  // keeps its own geometry and is reshaped in place below (no GLB re-fetch).
  const physicalStyle = glassesStyle.startsWith('polyhaven_');
  const contourSignature = glassesContourKey(morphs.glassesContours, glassesStyle);
  const constructionKey = physicalStyle || glassesStyle === 'none'
    ? glassesStyle : `${glassesStyle}|${outline}|${rimThickness.toFixed(2)}|${contourSignature}`;
  if (holder.userData.glassesConstructionKey !== constructionKey) {
    disposePart(holder.getObjectByName(`Glasses_${holder.userData.glassesStyle}`));
    if (glassesStyle === 'polyhaven_round' || glassesStyle === 'polyhaven_large_oval') {
      const glasses = new THREE.Group();
      glasses.name = `Glasses_${glassesStyle}`;
      glasses.userData.physicalStyle = glassesStyle;
      holder.add(glasses);
      physicalGlassesAsset(rootGroup, glasses, morphs);
    } else if (glassesStyle !== 'none') {
      holder.add(glassesAsset(glassesStyle, morphs));
    }
    holder.userData.glassesStyle = glassesStyle;
    holder.userData.glassesConstructionKey = constructionKey;
  }
  if (holder.userData.hatStyle !== hatStyle) {
    disposePart(holder.getObjectByName(`Hat_${holder.userData.hatStyle}`));
    if (hatStyle !== 'none') holder.add(hatAsset(hatStyle));
    holder.userData.hatStyle = hatStyle;
  }
  const glasses = holder.getObjectByName(`Glasses_${glassesStyle}`);
  if (glasses) {
    const physical = glassesStyle.startsWith('polyhaven_') && !glasses.userData.polyhavenFallback;
    const dailyLarge = glassesStyle === 'polyhaven_large_oval';
    glasses.position.set(
      0,
      (physical ? 0.013 : FRAME_ANCHOR.y) + limit(morphs.glassesOffsetY, 0, -12, 12) * 0.001,
      FRAME_ANCHOR.z + limit(morphs.glassesOffsetZ, 0, -12, 12) * 0.001,
    );
    const s = limit(morphs.glassesSize, 1, 0.65, 1.55);
    // Independent real geometry axes are also controlled by dragging the
    // frame/lens directly in the studio; unlike 'size', they change SHAPE.
    const frameWidth = limit(morphs.glassesWidth, 1, 0.68, 1.65);
    const frameHeight = limit(morphs.glassesHeight, 1, 0.68, 1.55);
    const eyeFit = 1 + limit(morphs.eyeSpacing, 0, -1.2, 1.2) * 0.035;
    // Keep the optician's scanned frame, hinges, silicone pads and lenses.
    // Only the alternate fit widens the round original into a gentle oval
    // common in daily women's eyewear; it is NOT a photo-exact replica.
    glasses.scale.set(
      s * eyeFit * frameWidth * (dailyLarge ? 1.04 : physical ? 0.84 : 1),
      s * frameHeight * (dailyLarge ? 0.91 : physical ? 0.78 : 1),
      s * (dailyLarge ? 0.83 : physical ? 0.78 : 1)
    );
    glasses.rotation.set(limit(morphs.glassesTilt, 0, -18, 18) * Math.PI / 180, 0, 0);
    if (physical && glasses.userData.physicalLoaded) reshapeScannedGlasses(glasses, outline, rimThickness, morphs, glassesStyle);
    const frame = glasses.userData.frameMaterial;
    const lens = glasses.userData.lensMaterial;
    if (frame && lens) {
      const finish = FRAME_FINISHES[morphs.glassesFrameMaterial] || FRAME_FINISHES.warm_acetate;
      const chosenColor = hex(morphs.glassesColor, '#a07857');
      // All seven styles now change their REAL PBR bezel material. Preserve
      // the authored CC0 texture on scanned spectacles, use acetate grain
      // only on acetate, and leave clear glass untinted unless requested.
      frame.color.set(chosenColor.toLowerCase() === '#a07857' ? finish.color : chosenColor);
      frame.metalness = finish.metalness;
      frame.roughness = finish.roughness;
      if (frame.isMeshPhysicalMaterial) frame.clearcoat = finish.clearcoat;
      frame.envMapIntensity = finish.metalness > 0.5 ? 1.15 : 0.68;
      const grainMap = physical ? glasses.userData.scannedFrameMap || null
        : acetateStyle(glassesStyle) && finish === FRAME_FINISHES.warm_acetate ? warmAcetateGrain() : null;
      if (frame.map !== grainMap) { frame.map = grainMap; frame.needsUpdate = true; }
      const tint = limit(morphs.glassesLensTint, 0, 0, 0.8);
      lens.color.set(tint > 0.12 ? '#536879' : '#e8f3fa');
      lens.opacity = (physical ? 0.07 : 0.12) + tint * (physical ? 0.31 : 0.55);
    }
  }
  const hat = holder.getObjectByName(`Hat_${hatStyle}`);
  if (hat) {
    if (!Number.isFinite(rootGroup.userData.accessoryHairBaseY)) {
      const fit = hairCrownFit(modelContainer);
      rootGroup.userData.accessoryHairBaseY = fit.baseY;
      rootGroup.userData.accessoryHairTopY = fit.topY;
      rootGroup.userData.accessoryBareHead = fit.bare;
    }
    const baseY = rootGroup.userData.accessoryHairBaseY;
    hat.position.set(0,
      baseY + limit(morphs.hatOffsetY, 0, -18, 18) * 0.001,
      0.004,
    );
    const hatSize = limit(morphs.hatSize, 1, 0.78, 1.30);
    const capHeight = hatStyle === 'beanie' ? 0.065 : 0.057;
    const rise = Math.max(1, Math.min(1.46, (rootGroup.userData.accessoryHairTopY + 0.012 - baseY) / capHeight));
    // The forehead hair reaches z=0.082 m at band height. Bring the front brim
    // around it and lower the cuff to the scalp, instead of making a floating lid.
    hat.scale.set(hatSize * (rootGroup.userData.accessoryBareHead ? 0.89 : 1), hatSize * rise, hatSize * 1.50);
    hat.rotation.z = limit(morphs.hatTilt, 0, -18, 18) * Math.PI / 180;
    const color = hex(morphs.hatColor, '#785670');
    hat.userData.fabricMaterial.color.set(color);
    hat.userData.trimMaterial.color.set(color).multiplyScalar(0.70);
  }
}
