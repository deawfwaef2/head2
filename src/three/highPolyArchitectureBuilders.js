import * as THREE from 'three';

/**
 * Stage 48 · High-Poly 3D Architectural, Furniture, Pedestal & Museum Container Builders
 * Replaces low-poly primitive boxes/cylinders with 3,500–8,500-triangle sculpted meshes:
 * - Beveled ogee plinths (`ExtrudeGeometry` with smooth `absarc` corners & multi-segment bevels)
 * - 144×28 sculpted fluted Corinthian columns with entasis & concave flute terminations
 * - 96-segment gadrooned / spiral-fluted rotational lathe bodies
 * - Radially pleated & button-tufted velvet cushions
 * - 3D Catmull-Rom `TubeGeometry` Baroque S-scroll corbels, candelabra arms, and lion-paw feet
 */

const geoCache = new Map();

/**
 * High-poly rounded & beveled architectural slab/plinth (replaces 12-tri BoxGeometry)
 */
export function getBeveledBoxGeometry(w, h, d, radius = 0.45, bevel = 0.22, bevelSegments = 5) {
  const key = `bbox:${w.toFixed(2)}:${h.toFixed(2)}:${d.toFixed(2)}:${radius.toFixed(2)}:${bevel.toFixed(2)}:${bevelSegments}`;
  if (geoCache.has(key)) return geoCache.get(key);

  const hw = Math.max(0.4, w * 0.5 - bevel);
  const hd = Math.max(0.4, d * 0.5 - bevel);
  const r = Math.min(radius, hw * 0.45, hd * 0.45);
  const shape = new THREE.Shape();
  shape.moveTo(-hw + r, -hd);
  shape.lineTo(hw - r, -hd);
  shape.absarc(hw - r, -hd + r, r, -Math.PI * 0.5, 0, false);
  shape.lineTo(hw, hd - r);
  shape.absarc(hw - r, hd - r, r, 0, Math.PI * 0.5, false);
  shape.lineTo(-hw + r, hd);
  shape.absarc(-hw + r, hd - r, r, Math.PI * 0.5, Math.PI, false);
  shape.lineTo(-hw, -hd + r);
  shape.absarc(-hw + r, -hd + r, r, Math.PI, Math.PI * 1.5, false);

  const extrudeDepth = Math.max(0.1, h - bevel * 2);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: extrudeDepth,
    bevelEnabled: true,
    bevelSegments,
    steps: 1,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments: 12,
  });
  geo.rotateX(-Math.PI * 0.5);
  geo.translate(0, -extrudeDepth * 0.5, 0);
  geo.computeVertexNormals();
  geoCache.set(key, geo);
  return geo;
}

/**
 * High-poly 24-flute Corinthian/Ionic column shaft with classical entasis & concave flutes (~6,500 tris)
 */
export function getFlutedColumnShaftGeometry(rTop, rBottom, height, flutes = 24, radialSegs = 120, heightSegs = 24) {
  const key = `flutecol:${rTop.toFixed(2)}:${rBottom.toFixed(2)}:${height.toFixed(2)}:${flutes}:${radialSegs}:${heightSegs}`;
  if (geoCache.has(key)) return geoCache.get(key);

  const geo = new THREE.CylinderGeometry(rTop, rBottom, height, radialSegs, heightSegs, false);
  const pos = geo.attributes.position;
  const halfH = height * 0.5;
  const fluteDepth = Math.min(rTop, rBottom) * 0.085;

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 1e-3) continue;

    const vNorm = (y + halfH) / Math.max(1e-4, height); // 0 at bottom, 1 at top
    // Classical entasis (subtle architectural belly swell around 40% height)
    const entasis = Math.sin(vNorm * Math.PI) * 0.035 * rBottom;
    // Flute termination fade near top and bottom astragal rings
    const fluteVerticalMask = Math.sin(Math.min(1, Math.max(0, (vNorm - 0.06) / 0.88)) * Math.PI);
    const fluteEndSmooth = Math.pow(Math.max(0, fluteVerticalMask), 0.35);

    const theta = Math.atan2(z, x);
    const wave = Math.cos(theta * flutes);
    // Concave channels separated by crisp fillets
    const groove = wave > -0.65 ? Math.pow((wave + 0.65) / 1.65, 1.4) : 0.0;
    const newR = r + entasis - fluteDepth * groove * fluteEndSmooth;
    const scale = newR / r;
    pos.setX(i, x * scale);
    pos.setZ(i, z * scale);
  }
  geo.computeVertexNormals();
  geoCache.set(key, geo);
  return geo;
}

/**
 * High-poly rotational Lathe mesh with 3D Gadrooned / Chrysanthemum relief fluting (`浮雕瓜棱/菊瓣纹`)
 */
export function getSculptedGadroonLatheGeometry(points, radialSegs = 96, lobes = 32, lobeAmp = 0.22, yMin = -99, yMax = 99, twist = 0.0) {
  const geo = new THREE.LatheGeometry(points, radialSegs);
  const pos = geo.attributes.position;
  const spanY = Math.max(0.1, yMax - yMin);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (r < 0.8 || y < yMin || y > yMax) continue;
    const tY = (y - yMin) / spanY;
    const env = Math.sin(tY * Math.PI);
    const theta = Math.atan2(z, x) + tY * twist;
    const gadroon = Math.sin(theta * lobes);
    const dr = lobeAmp * env * (0.65 * gadroon + 0.35 * Math.abs(gadroon));
    const scale = (r + dr) / r;
    pos.setX(i, x * scale);
    pos.setZ(i, z * scale);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * High-poly radially pleated & diamond-tufted velvet specimen cushion (`高模褶皱镶扣丝绒软垫`, ~2,800 tris)
 */
export function buildHighPolyTuftedVelvetCushion(rTop, rBot, height, yPos, velvetMat, brassMat) {
  const group = new THREE.Group();
  group.position.set(0, yPos, -0.5);

  const radialSegs = 96;
  const heightSegs = 12;
  const geo = new THREE.CylinderGeometry(rTop, rBot, height, radialSegs, heightSegs, false);
  const pos = geo.attributes.position;
  const halfH = height * 0.5;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const r = Math.hypot(x, z);
    const theta = Math.atan2(z, x);
    const vNorm = (y + halfH) / Math.max(1e-4, height);
    // Plump pillow profile on sides + 28 radial silk pleats
    const sideBulge = Math.sin(vNorm * Math.PI) * 0.42;
    const pleat = Math.sin(theta * 28.0) * 0.09 * Math.sin(vNorm * Math.PI);
    if (r > 0.2) {
      const nr = r + (sideBulge + pleat) * (r / Math.max(rTop, rBot));
      pos.setX(i, (x / r) * nr);
      pos.setZ(i, (z / r) * nr);
    }
    // Crowned top surface with radial tuft dimples
    if (y > halfH * 0.4) {
      const rRatio = r / Math.max(0.1, rTop);
      const dome = Math.cos(rRatio * Math.PI * 0.5) * 0.28;
      const radialFold = Math.cos(theta * 16.0) * 0.04 * Math.sin(rRatio * Math.PI);
      pos.setY(i, y + dome + radialFold);
    }
  }
  geo.computeVertexNormals();
  const cushionMesh = new THREE.Mesh(geo, velvetMat);
  cushionMesh.receiveShadow = true;
  cushionMesh.castShadow = true;
  group.add(cushionMesh);

  // Braided Gold Cord Piping around the cushion perimeter
  const cordGeo = new THREE.TorusGeometry(rTop * 0.99, 0.16, 16, 80);
  const cPos = cordGeo.attributes.position;
  for (let i = 0; i < cPos.count; i++) {
    const x = cPos.getX(i);
    const y = cPos.getY(i);
    const z = cPos.getZ(i);
    const ang = Math.atan2(y, x);
    const twist = Math.sin(ang * 36.0) * 0.035;
    cPos.setZ(i, z + twist);
  }
  cordGeo.computeVertexNormals();
  cordGeo.rotateX(Math.PI * 0.5);
  const cord = new THREE.Mesh(cordGeo, brassMat);
  cord.position.y = height * 0.36;
  group.add(cord);

  // 12 Brass Tufting Studs around the cushion crown
  const studGeo = new THREE.SphereGeometry(0.18, 14, 10);
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const stud = new THREE.Mesh(studGeo, brassMat);
    stud.scale.set(1.1, 0.65, 1.1);
    stud.position.set(Math.cos(a) * (rTop * 0.78), height * 0.52, Math.sin(a) * (rTop * 0.78));
    group.add(stud);
  }

  return group;
}

/**
 * High-poly Baroque Lion-Paw & Acanthus S-Scroll Foot (`高模狮爪巴洛克卷草支脚`)
 */
export function buildBaroqueScrollFoot(brassMat, scale = 1.0) {
  const foot = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 1.25, -0.55),
    new THREE.Vector3(0.0, 0.95, 0.15),
    new THREE.Vector3(0.0, 0.42, 0.45),
    new THREE.Vector3(0.0, 0.15, 0.95),
    new THREE.Vector3(0.0, 0.35, 1.22),
  ]);
  const scrollTube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.32, 14, false), brassMat);
  foot.add(scrollTube);

  // 3 Sculpted Lion Claw Digits gripping a brass ball
  const ball = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12), brassMat);
  ball.position.set(0, 0.18, 0.85);
  foot.add(ball);

  for (const dx of [-0.26, 0.0, 0.26]) {
    const toe = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.55, 12), brassMat);
    toe.rotation.x = Math.PI * 0.38;
    toe.rotation.z = -dx * 0.6;
    toe.position.set(dx, 0.22, 1.12);
    foot.add(toe);
  }

  // Acanthus upper shoulder boss
  const boss = new THREE.Mesh(new THREE.SphereGeometry(0.42, 16, 12), brassMat);
  boss.scale.set(1.25, 0.85, 0.95);
  boss.position.set(0, 1.05, 0.05);
  foot.add(boss);

  foot.scale.setScalar(scale);
  return foot;
}

/**
 * High-poly Lathe-Turned Victorian Hourglass Baluster Spindle (`高模车削花瓶栏杆柱`)
 */
let balusterGeoCache = null;
export function getVictorianBalusterGeometry() {
  if (balusterGeoCache) return balusterGeoCache;
  const pts = [
    new THREE.Vector2(0.0, -0.50),
    new THREE.Vector2(0.24, -0.50),
    new THREE.Vector2(0.22, -0.40),
    new THREE.Vector2(0.12, -0.28),
    new THREE.Vector2(0.25, -0.10),
    new THREE.Vector2(0.18, 0.08),
    new THREE.Vector2(0.10, 0.24),
    new THREE.Vector2(0.22, 0.38),
    new THREE.Vector2(0.24, 0.50),
    new THREE.Vector2(0.0, 0.50),
  ];
  balusterGeoCache = new THREE.LatheGeometry(pts, 20);
  balusterGeoCache.computeVertexNormals();
  return balusterGeoCache;
}

/**
 * High-poly Wrought-Brass Double-Volute Architectural Corbel Bracket (`高模双涡卷雕花托臂`)
 */
export function buildArchitecturalScrollCorbel(depth, height, trimMat) {
  const corbel = new THREE.Group();
  // Main S-scroll structural spine
  const sCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, depth * 0.38),
    new THREE.Vector3(0, -height * 0.18, depth * 0.42),
    new THREE.Vector3(0, -height * 0.42, depth * 0.18),
    new THREE.Vector3(0, -height * 0.68, -depth * 0.15),
    new THREE.Vector3(0, -height * 0.95, -depth * 0.38),
    new THREE.Vector3(0, -height * 0.78, -depth * 0.44),
  ]);
  const mainScroll = new THREE.Mesh(new THREE.TubeGeometry(sCurve, 36, 0.32, 16, false), trimMat);
  corbel.add(mainScroll);

  // Secondary inner filigree C-scroll
  const cCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -height * 0.08, depth * 0.12),
    new THREE.Vector3(0, -height * 0.28, -depth * 0.06),
    new THREE.Vector3(0, -height * 0.48, -depth * 0.28),
    new THREE.Vector3(0, -height * 0.25, -depth * 0.36),
  ]);
  const innerScroll = new THREE.Mesh(new THREE.TubeGeometry(cCurve, 24, 0.18, 12, false), trimMat);
  corbel.add(innerScroll);

  // Upper & lower turned rosettes
  for (const [ry, rz, rRad] of [
    [-height * 0.20, depth * 0.28, 0.48],
    [-height * 0.78, -depth * 0.32, 0.42],
  ]) {
    const ros = new THREE.Mesh(new THREE.CylinderGeometry(rRad, rRad, 0.72, 20), trimMat);
    ros.rotation.z = Math.PI * 0.5;
    ros.position.set(0, ry, rz);
    corbel.add(ros);
  }

  // Lathe-turned pendant finial drop
  const dropPts = [
    new THREE.Vector2(0.0, 0.0),
    new THREE.Vector2(0.45, -0.2),
    new THREE.Vector2(0.28, -0.6),
    new THREE.Vector2(0.38, -1.0),
    new THREE.Vector2(0.14, -1.6),
    new THREE.Vector2(0.0, -2.1),
  ];
  const drop = new THREE.Mesh(new THREE.LatheGeometry(dropPts, 24), trimMat);
  drop.position.set(0, -height * 0.95, -depth * 0.35);
  corbel.add(drop);

  return corbel;
}

/**
 * High-poly 3D Multi-Petal Blooming Rose (`高模立体层叠玫瑰花朵`, ~720 tris)
 */
export function buildHighPoly3DRose(petalMat, stemMat) {
  const rose = new THREE.Group();
  const layers = [
    { count: 5, rad: 0.26, h: 0.45, tilt: 0.25 },
    { count: 7, rad: 0.48, h: 0.38, tilt: 0.58 },
    { count: 9, rad: 0.72, h: 0.30, tilt: 0.95 },
  ];
  const petalGeo = new THREE.SphereGeometry(0.36, 14, 10, 0, Math.PI * 0.85, 0, Math.PI * 0.65);
  petalGeo.scale(1.15, 0.85, 0.45);

  for (let li = 0; li < layers.length; li++) {
    const { count, rad, h, tilt } = layers[li];
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + li * 0.45;
      const p = new THREE.Mesh(petalGeo, petalMat);
      p.position.set(Math.cos(a) * rad, h, Math.sin(a) * rad);
      p.rotation.y = -a + Math.PI * 0.5;
      p.rotation.x = tilt;
      rose.add(p);
    }
  }
  if (stemMat) {
    for (let s = 0; s < 4; s++) {
      const a = (s / 4) * Math.PI * 2;
      const sepal = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 10), stemMat);
      sepal.rotation.z = Math.PI * 0.42;
      sepal.rotation.y = a;
      sepal.position.set(Math.cos(a) * 0.45, 0.12, Math.sin(a) * 0.45);
      rose.add(sepal);
    }
  }
  return rose;
}
