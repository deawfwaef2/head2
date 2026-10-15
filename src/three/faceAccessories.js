import * as THREE from 'three';

// Stage 69d: lightweight, actual 3D eyeglass and hat geometry, authored for
// the built-in MakeHuman head's local metre coordinate system. No external
// texture requests: both the offline HTML and desktop pets share these assets.
const GLASSES = new Set(['none', 'wire_oval', 'acetate_square', 'aviator']);
const HATS = new Set(['none', 'beret', 'beanie', 'bucket']);
const EYE_Y = 0.021;
const FRAME_Z = 0.105;
const FRAME_ANCHOR = new THREE.Vector3(0, EYE_Y, FRAME_Z);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const limit = (v, fallback, min, max) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const hex = (v, fallback) => /^#[\da-f]{6}$/i.test(v || '') ? v : fallback;

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

function glassesAsset(style) {
  const root = new THREE.Group();
  root.name = `Glasses_${style}`;
  const metallic = style !== 'acetate_square';
  const frameMat = new THREE.MeshPhysicalMaterial({
    color: '#a07857', metalness: metallic ? 0.76 : 0.02,
    roughness: metallic ? 0.30 : 0.28,
    clearcoat: metallic ? 0.28 : 0.72,
    clearcoatRoughness: 0.19,
    side: THREE.DoubleSide,
  });
  const lensMat = new THREE.MeshPhysicalMaterial({
    color: '#e3edf3', metalness: 0, roughness: 0.08,
    transparent: true, opacity: 0.045, depthWrite: false,
    side: THREE.DoubleSide,
  });
  const padMat = new THREE.MeshPhysicalMaterial({
    color: '#e8d2b7', roughness: 0.47, metalness: 0,
    transparent: true, opacity: 0.82,
  });
  root.userData.frameMaterial = frameMat;
  root.userData.lensMaterial = lensMat;

  for (const side of [-1, 1]) {
    const cx = side * 0.032;
    const rx = style === 'aviator' ? 0.027 : style === 'wire_oval' ? 0.0253 : 0.0263;
    const ry = style === 'aviator' ? 0.0190 : style === 'wire_oval' ? 0.0164 : 0.0154;
    const pts = [];
    const shape = new THREE.Shape();
    const square = style === 'acetate_square';
    const steps = 64;
    for (let i = 0; i < steps; i++) {
      const t = i * Math.PI * 2 / steps;
      const co = Math.cos(t), si = Math.sin(t);
      const x = cx + rx * (square ? Math.sign(co) * Math.pow(Math.abs(co), 0.60) : co);
      const y = (style === 'aviator' ? 0.0205 : 0.0200) + ry * (square ? Math.sign(si) * Math.pow(Math.abs(si), 0.68) : si);
      // The real temples recede gently around the skull, unlike a flat 2D sticker.
      const z = FRAME_Z - 0.0012 * Math.pow(Math.abs(x - cx) / rx, 2);
      pts.push([x, y - FRAME_ANCHOR.y, z - FRAME_ANCHOR.z]);
      if (i === 0) shape.moveTo(x, y - FRAME_ANCHOR.y);
      else shape.lineTo(x, y - FRAME_ANCHOR.y);
    }
    shape.closePath();
    wire(root, pts, square ? 0.0020 : 0.00125, frameMat, `Rim_${side}`, true);
    const lens = mesh(root, new THREE.ShapeGeometry(shape, 8), lensMat, `ClearLens_${side}`, false);
    lens.position.z = -0.0014;
    lens.renderOrder = 4;
    // Joined hinges and tapered temples follow the sides of the head and tuck
    // behind, rather than ending abruptly at the outside of the eye.
    const arm = [
      [side * (Math.abs(cx) + rx), 0.0225 - EYE_Y, FRAME_Z - 0.0012 - FRAME_Z],
      [side * 0.065, 0.0220 - EYE_Y, 0.091 - FRAME_Z],
      [side * 0.071, 0.0200 - EYE_Y, 0.048 - FRAME_Z],
      [side * 0.074, 0.0160 - EYE_Y, 0.005 - FRAME_Z],
      [side * 0.073, 0.0090 - EYE_Y, -0.020 - FRAME_Z],
      [side * 0.068, 0.0040 - EYE_Y, -0.026 - FRAME_Z],
    ];
    wire(root, arm, square ? 0.00165 : 0.00105, frameMat, `Temple_${side}`);
    const hinge = mesh(root, new THREE.SphereGeometry(0.0024, 10, 6), frameMat, `Hinge_${side}`, false);
    hinge.position.set(...arm[0]);
    // Small semitranslucent pads visually seat the bridge on the nose.
    const pad = mesh(root, new THREE.SphereGeometry(0.0032, 10, 8), padMat, `NosePad_${side}`, false);
    pad.position.set(side * 0.0094, 0.010 - EYE_Y, 0.098 - FRAME_Z);
    pad.scale.set(0.55, 1.0, 0.48);
  }
  const bridge = [
    [-0.0071, 0.027 - EYE_Y, 0.104 - FRAME_Z],
    [-0.0047, 0.033 - EYE_Y, 0.106 - FRAME_Z],
    [0, 0.035 - EYE_Y, 0.107 - FRAME_Z],
    [0.0047, 0.033 - EYE_Y, 0.106 - FRAME_Z],
    [0.0071, 0.027 - EYE_Y, 0.104 - FRAME_Z],
  ];
  wire(root, bridge, style === 'acetate_square' ? 0.00185 : 0.00115, frameMat, 'NoseBridge');
  if (style === 'aviator') {
    wire(root, [
      [-0.013, 0.040 - EYE_Y, 0.103 - FRAME_Z],
      [-0.006, 0.042 - EYE_Y, 0.104 - FRAME_Z],
      [0, 0.0425 - EYE_Y, 0.105 - FRAME_Z],
      [0.006, 0.042 - EYE_Y, 0.104 - FRAME_Z],
      [0.013, 0.040 - EYE_Y, 0.103 - FRAME_Z],
    ], 0.0009, frameMat, 'UpperAviatorBridge');
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

function disposePart(part) {
  if (!part) return;
  part.parent?.remove(part);
  const materials = new Set(), geometries = new Set();
  part.traverse(obj => {
    if (!obj.isMesh) return;
    geometries.add(obj.geometry);
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
    if (obj.name === 'MasterStrandHairMesh' || obj.name.includes('ScalpCap')) return;
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
  if (holder.userData.glassesStyle !== glassesStyle) {
    disposePart(holder.getObjectByName(`Glasses_${holder.userData.glassesStyle}`));
    if (glassesStyle !== 'none') holder.add(glassesAsset(glassesStyle));
    holder.userData.glassesStyle = glassesStyle;
  }
  if (holder.userData.hatStyle !== hatStyle) {
    disposePart(holder.getObjectByName(`Hat_${holder.userData.hatStyle}`));
    if (hatStyle !== 'none') holder.add(hatAsset(hatStyle));
    holder.userData.hatStyle = hatStyle;
  }
  const glasses = holder.getObjectByName(`Glasses_${glassesStyle}`);
  if (glasses) {
    glasses.position.set(
      0,
      FRAME_ANCHOR.y + limit(morphs.glassesOffsetY, 0, -9, 9) * 0.001,
      FRAME_ANCHOR.z + limit(morphs.glassesOffsetZ, 0, -9, 9) * 0.001,
    );
    const s = limit(morphs.glassesSize, 1, 0.82, 1.18);
    glasses.scale.set(s * (1 + limit(morphs.eyeSpacing, 0, -1.2, 1.2) * 0.035), s, s);
    glasses.rotation.set(limit(morphs.glassesTilt, 0, -12, 12) * Math.PI / 180, 0, 0);
    glasses.userData.frameMaterial.color.set(hex(morphs.glassesColor, '#a07857'));
    const tint = limit(morphs.glassesLensTint, 0, 0, 0.8);
    glasses.userData.lensMaterial.color.set(tint > 0.12 ? '#4c6070' : '#e3edf3');
    glasses.userData.lensMaterial.opacity = 0.045 + tint * 0.66;
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
      baseY + limit(morphs.hatOffsetY, 0, -14, 14) * 0.001,
      0.004,
    );
    const hatSize = limit(morphs.hatSize, 1, 0.86, 1.19);
    const capHeight = hatStyle === 'beanie' ? 0.065 : 0.057;
    const rise = Math.max(1, Math.min(1.46, (rootGroup.userData.accessoryHairTopY + 0.012 - baseY) / capHeight));
    // The forehead hair reaches z=0.082 m at band height. Bring the front brim
    // around it and lower the cuff to the scalp, instead of making a floating lid.
    hat.scale.set(hatSize * (rootGroup.userData.accessoryBareHead ? 0.89 : 1), hatSize * rise, hatSize * 1.50);
    hat.rotation.z = limit(morphs.hatTilt, 0, -14, 14) * Math.PI / 180;
    const color = hex(morphs.hatColor, '#785670');
    hat.userData.fabricMaterial.color.set(color);
    hat.userData.trimMaterial.color.set(color).multiplyScalar(0.70);
  }
}
