// 程序化睫毛（v1）—— 取代 MakeHuman 自带的睫毛贴片（贴图细丝在 mipmap 后几乎全部丢失，正面看是一团团色块）
// 做法：在皮肤网格的眼裂边界（只属于一个三角形的边）上找到上/下眼睑缘，沿缘线长出真实弯曲的睫毛丝，
// 每根丝的顶点复制根部皮肤顶点的 morph 增量 → 眨眼 / 表情时睫毛跟着眼睑走。
// 另外沿上睑缘生成一条极细的深色"睫毛根线"（天然眼线），由 uLashLine 控制，可开关/连线。
import * as THREE from 'three';

function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/** 找到某只眼睛周围的皮肤边界顶点（眼裂），返回按 x 排序的上/下睑缘点 */
function findLidLoops(pos, index, eye, r) {
  const edge = new Map();
  const key = (a, b) => (a < b ? a * 1e6 + b : b * 1e6 + a);
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i), b = index.getX(i + 1), c = index.getX(i + 2);
    for (const [u, v] of [[a, b], [b, c], [c, a]]) { const k = key(u, v); edge.set(k, (edge.get(k) || 0) + 1); }
  }
  const verts = new Set();
  const p = new THREE.Vector3();
  for (const [k, n] of edge) {
    if (n !== 1) continue;
    const a = Math.floor(k / 1e6), b = k % 1e6;
    for (const v of [a, b]) {
      p.fromBufferAttribute(pos, v);
      const dx = p.x - eye.x, dy = p.y - eye.y, dz = p.z - eye.z;
      if (Math.abs(dx) < 1.7 * r && Math.abs(dy) < 1.0 * r && dz > -0.6 * r && dz < 1.6 * r) verts.add(v);
    }
  }
  const list = [...verts].map((v) => ({ v, p: new THREE.Vector3().fromBufferAttribute(pos, v) }));
  if (list.length < 8) return null;
  let lo = list[0], hi = list[0];
  for (const o of list) { if (o.p.x < lo.p.x) lo = o; if (o.p.x > hi.p.x) hi = o; }
  const upper = [], lower = [];
  for (const o of list) {
    const t = (o.p.x - lo.p.x) / Math.max(1e-6, hi.p.x - lo.p.x);
    const chordY = lo.p.y + (hi.p.y - lo.p.y) * t;
    if (o === lo || o === hi) { upper.push(o); lower.push(o); } else (o.p.y >= chordY ? upper : lower).push(o);
  }
  upper.sort((a, b) => a.p.x - b.p.x); lower.sort((a, b) => a.p.x - b.p.x);
  return { upper, lower };
}

/** 用原睫毛贴片作为"睑缘向导"：每个 x 区间里离眼球中心最近的顶点 = 睫毛根部（贴片本身就是为这个眼睑做的） */
function findGuideRoots(gpos, eye, r) {
  const p = new THREE.Vector3(); const BIN = 22;
  const up = new Array(BIN).fill(null), lo = new Array(BIN).fill(null);
  const x0 = eye.x - 1.2 * r, x1 = eye.x + 1.2 * r;
  for (let i = 0; i < gpos.count; i++) {
    p.fromBufferAttribute(gpos, i);
    if (p.x < x0 || p.x > x1 || Math.abs(p.y - eye.y) > 1.2 * r) continue;
    if (Math.hypot(p.x - eye.x, p.y - eye.y) > 1.25 * r) continue;
    const b = Math.min(BIN - 1, Math.floor(((p.x - x0) / (x1 - x0)) * BIN));
    const d = Math.hypot(p.x - eye.x, (p.y - eye.y) * 1.6, (p.z - eye.z) * 0.5);
    const arr = p.y >= eye.y + 0.0 ? up : lo;
    if (!arr[b] || d < arr[b].d) arr[b] = { v: i, p: p.clone(), d };
  }
  const upper = up.filter(Boolean), lower = lo.filter(Boolean);
  return upper.length >= 4 ? { upper, lower } : null;
}

/** 沿折线按弧长取点：返回位置 + 两个相邻根顶点及权重（用于复制 morph） */
function samplePolyline(pts, t) {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + pts[i].p.distanceTo(pts[i - 1].p));
  const s = t * L[L.length - 1];
  let i = 1; while (i < pts.length - 1 && L[i] < s) i++;
  const seg = Math.max(1e-9, L[i] - L[i - 1]); const w = THREE.MathUtils.clamp((s - L[i - 1]) / seg, 0, 1);
  const p = pts[i - 1].p.clone().lerp(pts[i].p, w);
  const tan = pts[i].p.clone().sub(pts[i - 1].p).normalize();
  return { p, tan, a: pts[i - 1].v, b: pts[i].v, w };
}

/**
 * @param skin 皮肤 Mesh（使用其当前 base position + morphAttributes）
 * @param eyes [{c: Vector3 眼球中心, side: -1|1}]  r 眼球半径
 */
export function buildLashGeometry(skin, eyes, r, opts = {}) {
  const guide = opts.guide?.geometry;
  const g0 = guide || skin.geometry; const pos = g0.attributes.position; const index = skin.geometry.index;
  if (!guide && !index) return null;
  const SEG = 7;
  const P = [], N = [], S = [], V = [], K = [], T = [], roots = []; // roots: [a,b,w] per vertex
  const idx = []; let vbase = 0;
  const info = { loops: [] };
  for (const eye of eyes) {
    const loops = guide ? findGuideRoots(pos, eye.c, r) : findLidLoops(pos, index, eye.c, r);
    info.loops.push(loops ? [loops.upper.length, loops.lower.length] : null);
    if (!loops || loops.upper.length < 4) continue;
    const nasalAtLowX = eye.c.x > 0; // 右侧眼（+x）的鼻侧在低 x 端
    const rand = rng(eye.c.x > 0 ? 7 : 13);
    const make = (pts, isUpper) => {
      const count = isUpper ? (opts.upperCount || 150) : (opts.lowerCount || 60);
      for (let i = 0; i < count; i++) {
        const t = THREE.MathUtils.clamp((i + 0.5 + (rand() - 0.5) * 0.9) / count, 0.02, 0.98);
        const sm = samplePolyline(pts, t);
        const outer = nasalAtLowX ? t : 1 - t; // 0 = 内眼角, 1 = 外眼角
        // 长度：内眼角短，中外段最长，外眼角略收
        const prof = Math.sin(Math.PI * Math.min(1, 0.12 + outer * 0.88)) * 0.75 + 0.25 * outer * (1 - outer) * 4 * 0.25;
        const len = (isUpper ? 0.0042 + 0.0058 * prof : 0.0016 + 0.0022 * prof) * (0.8 + rand() * 0.4) * (opts.length || 1);
        if (!isUpper && (outer < 0.12 || rand() < 0.15)) continue;
        // 方向：从眼球中心指向根部的径向（上睑≈向上向前）+ 向前，外侧向外撇
        const radial = sm.p.clone().sub(eye.c); radial.z *= 0.4; radial.normalize();
        const fwd = new THREE.Vector3(0, 0, 1);
        const outward = new THREE.Vector3(Math.sign(eye.c.x) || 1, 0, 0);
        const up = isUpper ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(0, -1, 0);
        const d0 = fwd.clone().multiplyScalar(0.85).addScaledVector(radial, 0.35).addScaledVector(up, isUpper ? -0.12 : 0.25).addScaledVector(outward, (outer - 0.4) * 0.3).normalize();
        const curl = (isUpper ? 1.1 : 0.35) * (0.8 + rand() * 0.4);
        const jitter = new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).multiplyScalar(0.25);
        const root = sm.p.clone().addScaledVector(fwd, 0.0002).addScaledVector(up, isUpper ? -0.00015 : 0.0001);
        let prev = root.clone();
        const pts2 = [root.clone()];
        for (let s = 1; s <= SEG; s++) {
          const u = s / SEG;
          const dir = d0.clone().addScaledVector(up, curl * u).add(jitter.clone().multiplyScalar(u)).normalize();
          prev = prev.clone().addScaledVector(dir, len / SEG); pts2.push(prev);
        }
        for (let s = 0; s <= SEG; s++) {
          const u = s / SEG; const p = pts2[s];
          const tg = (s < SEG ? pts2[s + 1].clone().sub(p) : p.clone().sub(pts2[s - 1])).normalize();
          for (const side of [-1, 1]) {
            P.push(p.x, p.y, p.z); N.push(radial.x, radial.y, radial.z); T.push(tg.x, tg.y, tg.z);
            S.push(u); V.push(side); K.push(isUpper ? 0 : 1); roots.push([sm.a, sm.b, sm.w]);
          }
          if (s < SEG) { const q = vbase + s * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
        }
        vbase += (SEG + 1) * 2;
      }
      // 睫毛根线：沿睑缘的一条细带（宽方向 = 径向，紧贴睑缘前沿）
      if (isUpper) {
        const M = 40;
        for (let i = 0; i <= M; i++) {
          const sm = samplePolyline(pts, 0.01 + 0.98 * (i / M));
          const outer = nasalAtLowX ? i / M : 1 - i / M;
          const radial = sm.p.clone().sub(eye.c); radial.z *= 0.4; radial.normalize();
          const p = sm.p.clone().add(new THREE.Vector3(0, 0, 0.00035));
          const tg = sm.tan;
          for (const side of [-1, 1]) {
            P.push(p.x, p.y, p.z); N.push(radial.x, radial.y, radial.z); T.push(radial.x, radial.y, radial.z);
            S.push(0.15 + 0.6 * Math.abs(outer - 0.55)); V.push(side); K.push(2); roots.push([sm.a, sm.b, sm.w]);
          }
          if (i < M) { const q = vbase + i * 2; idx.push(q, q + 1, q + 2, q + 1, q + 3, q + 2); }
          void tg;
        }
        vbase += (M + 1) * 2;
      }
    };
    make(loops.upper, true);
    make(loops.lower, false);
  }
  if (!P.length) return { geometry: null, info };
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('aTan', new THREE.Float32BufferAttribute(T, 3));
  g.setAttribute('aS', new THREE.Float32BufferAttribute(S, 1));
  g.setAttribute('aV', new THREE.Float32BufferAttribute(V, 1));
  g.setAttribute('aKind', new THREE.Float32BufferAttribute(K, 1));
  g.setIndex(idx);
  // 复制根部皮肤顶点的 morph 增量 → 跟随眨眼/表情
  const ma = g0.morphAttributes.position;
  if (ma && ma.length) {
    g.morphAttributes.position = ma.map((m) => {
      const arr = new Float32Array(roots.length * 3);
      for (let i = 0; i < roots.length; i++) {
        const [a, b, w] = roots[i];
        arr[i * 3] = m.getX(a) * (1 - w) + m.getX(b) * w;
        arr[i * 3 + 1] = m.getY(a) * (1 - w) + m.getY(b) * w;
        arr[i * 3 + 2] = m.getZ(a) * (1 - w) + m.getZ(b) * w;
      }
      return new THREE.BufferAttribute(arr, 3);
    });
    g.morphTargetsRelative = g0.morphTargetsRelative;
  }
  g.computeBoundingSphere(); g.boundingSphere.radius += 0.01;
  g.userData.lashGuideRoots = roots;
  g.userData.origStrandPos = new Float32Array(P);
  info.verts = roots.length;
  return { geometry: g, info };
}

/**
 * 程序化眉毛（v1）：在原眉毛网格上按贴图 alpha 密度撒点，长出贴着皮肤的细眉丝。
 * 生长方向按真人眉形：眉头向上竖立、眉身向外斜上、眉尾向外微下；每根丝复制所在三角形的 morph 增量。
 */
export function buildBrowGeometry(brow, alphaAt, opts = {}) {
  const g0 = brow.geometry; const pos = g0.attributes.position; const uv = g0.attributes.uv; const nor = g0.attributes.normal;
  if (!pos || !uv || !nor) return null;
  const idxA = g0.index; const triCount = idxA ? idxA.count / 3 : pos.count / 3;
  const vi = (t, k) => (idxA ? idxA.getX(t * 3 + k) : t * 3 + k);
  const rand = rng(29);
  // 每侧眉毛的 x 范围（眉头 → 眉尾）
  const ext = { '-1': [1e9, -1e9], '1': [1e9, -1e9] };
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); const sd = x < 0 ? '-1' : '1'; const ax = Math.abs(x); ext[sd][0] = Math.min(ext[sd][0], ax); ext[sd][1] = Math.max(ext[sd][1], ax); }
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  const areas = []; let total = 0;
  for (let t = 0; t < triCount; t++) {
    A.fromBufferAttribute(pos, vi(t, 0)); B.fromBufferAttribute(pos, vi(t, 1)); C.fromBufferAttribute(pos, vi(t, 2));
    const ar = B.clone().sub(A).cross(C.clone().sub(A)).length() * 0.5; total += ar; areas.push(total);
  }
  const SEG = 4; const target = opts.count || 1800;
  const P = [], N = [], T = [], S = [], V = [], K = [], roots = [], idx = []; let vbase = 0;
  let tries = 0; let made = 0;
  while (made < target && tries < target * 12) {
    tries++;
    const r0 = rand() * total; let lo = 0, hi = areas.length - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (areas[mid] < r0) lo = mid + 1; else hi = mid; }
    const t = lo; let b1 = rand(), b2 = rand(); if (b1 + b2 > 1) { b1 = 1 - b1; b2 = 1 - b2; } const b0 = 1 - b1 - b2;
    const ia = vi(t, 0), ib = vi(t, 1), ic = vi(t, 2);
    const u = uv.getX(ia) * b0 + uv.getX(ib) * b1 + uv.getX(ic) * b2, v = uv.getY(ia) * b0 + uv.getY(ib) * b1 + uv.getY(ic) * b2;
    const a = alphaAt(u, v);
    if (rand() > THREE.MathUtils.smoothstep(a, 0.15, 0.75)) continue;
    const p = new THREE.Vector3().fromBufferAttribute(pos, ia).multiplyScalar(b0).addScaledVector(new THREE.Vector3().fromBufferAttribute(pos, ib), b1).addScaledVector(new THREE.Vector3().fromBufferAttribute(pos, ic), b2);
    const n = new THREE.Vector3().fromBufferAttribute(nor, ia).multiplyScalar(b0).addScaledVector(new THREE.Vector3().fromBufferAttribute(nor, ib), b1).addScaledVector(new THREE.Vector3().fromBufferAttribute(nor, ic), b2).normalize();
    if (n.z < 0) n.negate();
    const sd = p.x < 0 ? -1 : 1; const e = ext[String(sd)];
    const tt = THREE.MathUtils.clamp((Math.abs(p.x) - e[0]) / Math.max(1e-6, e[1] - e[0]), 0, 1); // 0 眉头, 1 眉尾
    let ang = THREE.MathUtils.lerp(72, 14, THREE.MathUtils.smoothstep(tt, 0.02, 0.38));
    ang = THREE.MathUtils.lerp(ang, -16, THREE.MathUtils.smoothstep(tt, 0.68, 1.0));
    ang += (rand() - 0.5) * 22;
    const rad = THREE.MathUtils.degToRad(ang);
    const dir = new THREE.Vector3(Math.cos(rad) * sd, Math.sin(rad), 0);
    dir.addScaledVector(n, -dir.dot(n)).normalize();
    const len = (tt < 0.2 ? 0.0032 : 0.0048 + 0.0018 * rand()) * (0.75 + rand() * 0.5) * (opts.length || 1);
    const root = p.clone().addScaledVector(n, 0.00012);
    const pts = [root];
    for (let k = 1; k <= SEG; k++) {
      const uu = k / SEG;
      const q = root.clone().addScaledVector(dir, len * uu).addScaledVector(n, 0.00035 * Math.sin(uu * Math.PI) * (tt < 0.2 ? 1.6 : 1.0));
      pts.push(q);
    }
    for (let k = 0; k <= SEG; k++) {
      const q = pts[k]; const tg = (k < SEG ? pts[k + 1].clone().sub(q) : q.clone().sub(pts[k - 1])).normalize();
      for (const side of [-1, 1]) {
        P.push(q.x, q.y, q.z); N.push(n.x, n.y, n.z); T.push(tg.x, tg.y, tg.z); S.push(k / SEG); V.push(side); K.push(3);
        roots.push([[ia, b0], [ib, b1], [ic, b2]]);
      }
      if (k < SEG) { const q0 = vbase + k * 2; idx.push(q0, q0 + 1, q0 + 2, q0 + 1, q0 + 3, q0 + 2); }
    }
    vbase += (SEG + 1) * 2; made++;
  }
  if (!P.length) return null;
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
  g.setAttribute('aTan', new THREE.Float32BufferAttribute(T, 3));
  g.setAttribute('aS', new THREE.Float32BufferAttribute(S, 1));
  g.setAttribute('aV', new THREE.Float32BufferAttribute(V, 1));
  g.setAttribute('aKind', new THREE.Float32BufferAttribute(K, 1));
  g.setIndex(idx);
  const ma = g0.morphAttributes.position;
  if (ma && ma.length) {
    g.morphAttributes.position = ma.map((m) => {
      const arr = new Float32Array(roots.length * 3);
      for (let i = 0; i < roots.length; i++) for (const [j, w] of roots[i]) { arr[i * 3] += m.getX(j) * w; arr[i * 3 + 1] += m.getY(j) * w; arr[i * 3 + 2] += m.getZ(j) * w; }
      return new THREE.BufferAttribute(arr, 3);
    });
    g.morphTargetsRelative = g0.morphTargetsRelative;
  }
  g.computeBoundingSphere(); g.boundingSphere.radius += 0.01;
  return { geometry: g, info: { hairs: made } };
}

export function createLashStrandMaterial() {
  const m = new THREE.MeshStandardMaterial({ name: 'LashStrands', color: 0xffffff, roughness: 0.7, metalness: 0, transparent: true, depthWrite: false, side: THREE.DoubleSide, envMapIntensity: 0.2 });
  m.userData.u = {
    uLashDensity: { value: 1 }, uLashLower: { value: 0.5 }, uLashDark: { value: 0.9 }, uLashLine: { value: 0.6 },
    uLashWidth: { value: 0.00013 }, uPxScale: { value: 0.001 }, uBrowDensity: { value: 1 }, uBrowWidth: { value: 0.00008 }, uBrowCol: { value: new THREE.Color(0.022, 0.016, 0.013) },
  };
  m.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, m.userData.u);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec3 aTan; attribute float aS, aV, aKind; varying float vS, vV, vKind, vCov;
        uniform float uLashWidth, uPxScale, uBrowWidth;`)
      .replace('#include <project_vertex>', `
        {
          vec3 camObj = (inverse(modelMatrix) * vec4(cameraPosition, 1.0)).xyz;
          vec3 toCam = normalize(camObj - transformed);
          float dist = length(camObj - transformed);
          float minW = uPxScale * dist * 0.75;            // 至少 ~0.75 像素宽，靠 alpha 保持真实粗细
          vec3 side; float w;
          if (aKind > 2.5) { side = normalize(cross(aTan, normal)); w = uBrowWidth * mix(1.0, 0.35, aS); }
          else if (aKind > 1.5) { side = normalize(aTan); w = 0.00055; }
          else { side = normalize(cross(aTan, toCam)); w = uLashWidth * mix(1.0, 0.25, aS) * (aKind > 0.5 ? 0.8 : 1.0); }
          float wd = max(w, minW);
          vCov = w / wd;
          transformed += side * aV * wd * 0.5;
          vS = aS; vV = aV; vKind = aKind;
        }
        #include <project_vertex>`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
        varying float vS, vV, vKind, vCov; uniform float uLashDensity, uLashLower, uLashDark, uLashLine, uBrowDensity; uniform vec3 uBrowCol;`)
      .replace('#include <map_fragment>', `
        vec3 lashCol = mix(vec3(0.07, 0.055, 0.048), vec3(0.010, 0.008, 0.007), uLashDark);
        float la;
        if (vKind > 2.5) {
          la = vCov * (1.0 - smoothstep(0.5, 1.0, vS)) * (1.0 - 0.3 * vV * vV) * uBrowDensity * 0.9;
          lashCol = mix(uBrowCol, uBrowCol * 2.0, smoothstep(0.5, 1.0, vS) * 0.6);
        } else if (vKind > 1.5) {
          la = exp(-vV * vV * 2.2) * uLashLine * 1.1 * (1.0 - vS * 0.5);
        } else {
          float taper = (1.0 - smoothstep(0.55, 1.0, vS)) * (1.0 + 0.6 * (1.0 - smoothstep(0.0, 0.25, vS)));
          la = vCov * taper * (1.0 - 0.35 * vV * vV) * uLashDensity * (vKind > 0.5 ? uLashLower * 0.8 : 1.0);
          lashCol = mix(lashCol, lashCol * 2.2 + vec3(0.02, 0.012, 0.008), smoothstep(0.6, 1.0, vS) * 0.5); // 发梢略透、偏棕
        }
        diffuseColor.rgb = lashCol;
        diffuseColor.a = clamp(la, 0.0, 1.0);`);
  };
  m.customProgramCacheKey = () => 'lash-strands-v2';
  return m;
}

export function setLashStrandParams(m, p) {
  const u = m?.userData?.u; if (!u) return;
  if (p.lashDensity != null) u.uLashDensity.value = p.lashDensity;
  if (p.lashLower != null) u.uLashLower.value = p.lashLower;
  if (p.lashDark != null) u.uLashDark.value = p.lashDark;
  if (p.lashLine != null) u.uLashLine.value = p.lashLine;
  if (p.pxScale != null) u.uPxScale.value = p.pxScale;
  if (p.browDensity != null) u.uBrowDensity.value = p.browDensity;
  if (p.browColor) u.uBrowCol.value.setRGB(...p.browColor);
}
