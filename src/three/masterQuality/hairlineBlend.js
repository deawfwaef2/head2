// 画质提升 · 发际线柔化 + 碎发（Baby hair）
//
// 问题：发片/发壳网格在额头上留下一条“剪出来”的硬边 → 像戴假发。
// 真人发际线 = 几毫米宽的过渡带：越往脸部头发越稀、越细、越短，皮肤上能看到细小毛发和发根的暗色，
// 外加一圈不服帖的短碎发（baby hair）。影视/MetaHuman 的做法是：
//   1) 头皮/发际线遮罩画进皮肤（hair-in-skin）：发根暗色 + 细发纹理沿生长方向渐隐；
//   2) 头发覆盖区域的头皮做遮蔽（scalp AO），避免发缝里透出亮皮肤；
//   3) 沿发际线长出一圈稀疏的短细发，打破网格边缘轮廓。
// 这里全部从当前发型网格自动计算（换发型自动重算），不依赖手绘贴图，也不改头模。
import * as THREE from 'three';

export const HAIRLINE_DEFAULTS = {
  soft: 1.0,        // 皮肤上的发际线过渡强度（0 = 关）
  scalpAO: 0.7,     // 头发覆盖区头皮压暗
  babyHair: 1.0,    // 碎发密度倍数（0 = 关）
  babyLength: 1.0,  // 碎发长度倍数
  babyLift: 1.0,    // 碎发离开皮肤的蓬松度
};

function morphedPositions(mesh) {
  const g = mesh.geometry; const base = g.attributes.position;
  const arr = new Float32Array(base.array.length); arr.set(base.array);
  const inf = mesh.morphTargetInfluences || []; const ma = g.morphAttributes.position || [];
  const rel = g.morphTargetsRelative !== false;
  for (let m = 0; m < ma.length; m++) {
    const w = inf[m]; if (!w) continue; const a = ma[m];
    for (let i = 0; i < base.count; i++) {
      if (rel) { arr[i * 3] += a.getX(i) * w; arr[i * 3 + 1] += a.getY(i) * w; arr[i * 3 + 2] += a.getZ(i) * w; }
    }
  }
  return arr;
}

function vertexNormals(P, index, count) {
  const N = new Float32Array(count * 3);
  for (let t = 0; t < index.length; t += 3) {
    const a = index[t] * 3, b = index[t + 1] * 3, c = index[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2];
    const vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const k of [a, b, c]) { N[k] += nx; N[k + 1] += ny; N[k + 2] += nz; }
  }
  for (let i = 0; i < count; i++) { const l = Math.hypot(N[i * 3], N[i * 3 + 1], N[i * 3 + 2]) || 1; N[i * 3] /= l; N[i * 3 + 1] /= l; N[i * 3 + 2] /= l; }
  return N;
}

/**
 * 计算皮肤每个顶点被头发覆盖的程度（0..1）与发丝生长方向，写入皮肤几何 aHairCov / aHairDir。
 * @returns 世界空间的皮肤顶点/法线/覆盖度，用于生成碎发
 */
export function computeHairCoverage(skinMesh, hairGeom, hairMatrix, alphaAt, anchors = null, useLocalSpace = false) {
  if (Array.isArray(hairGeom) && hairMatrix && typeof hairMatrix === 'object' && !hairMatrix.isMatrix4) {
    if (alphaAt && typeof alphaAt === 'object' && 'useLocalSpace' in alphaAt) {
      useLocalSpace = Boolean(alphaAt.useLocalSpace);
    }
    anchors = hairMatrix.eyeY !== undefined ? hairMatrix : anchors;
    hairMatrix = null;
    alphaAt = null;
  }
  if (!useLocalSpace) skinMesh.updateWorldMatrix(true, false);
  else skinMesh.updateMatrix();
  const g = skinMesh.geometry; const count = g.attributes.position.count;
  const local = morphedPositions(skinMesh);
  const index = g.index ? g.index.array : Uint32Array.from({ length: count }, (_, i) => i);
  // 世界空间或容器内米制局部空间（与发片、发丝生成同一坐标系）
  const M = useLocalSpace ? skinMesh.matrix : skinMesh.matrixWorld; const v = new THREE.Vector3();
  const P = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) { v.set(local[i * 3], local[i * 3 + 1], local[i * 3 + 2]).applyMatrix4(M); P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z; }
  const N = vertexNormals(P, index, count);

  // 1) 在发片表面按面积撒点（跳过贴图透明处）→ 空间哈希（支持单网格或多网格列表）
  const entries = Array.isArray(hairGeom) ? hairGeom : [{ geom: hairGeom, matrix: hairMatrix || new THREE.Matrix4(), alphaAt }];
  const cell = 0.008; const grid = new Map(); const pts = [];
  const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3();
  let seed = 1234567; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const spacing2 = 0.0022 * 0.0022;
  for (const entry of entries) {
    const hg = entry.geom || entry.mesh?.geometry; if (!hg?.attributes?.position) continue;
    const hp = hg.attributes.position, huv = hg.attributes.uv, hidx = hg.index;
    const hMat = entry.matrix || entry.mesh?.matrix || new THREE.Matrix4();
    const hAlpha = entry.alphaAt ?? alphaAt;
    const tri = hidx ? hidx.count / 3 : hp.count / 3;
    for (let t = 0; t < tri; t++) {
      const ia = hidx ? hidx.getX(t * 3) : t * 3, ib = hidx ? hidx.getX(t * 3 + 1) : t * 3 + 1, ic = hidx ? hidx.getX(t * 3 + 2) : t * 3 + 2;
      A.fromBufferAttribute(hp, ia).applyMatrix4(hMat); B.fromBufferAttribute(hp, ib).applyMatrix4(hMat); C.fromBufferAttribute(hp, ic).applyMatrix4(hMat);
      const area = new THREE.Vector3().subVectors(B, A).cross(new THREE.Vector3().subVectors(C, A)).length() * 0.5;
      const n = Math.min(80, Math.max(1, Math.round(area / spacing2)));
      for (let s = 0; s < n; s++) {
        let r1 = rnd(), r2 = rnd(); if (r1 + r2 > 1) { r1 = 1 - r1; r2 = 1 - r2; }
        const r0 = 1 - r1 - r2;
        if (huv && hAlpha) {
          const u = huv.getX(ia) * r0 + huv.getX(ib) * r1 + huv.getX(ic) * r2;
          const w = huv.getY(ia) * r0 + huv.getY(ib) * r1 + huv.getY(ic) * r2;
          if (hAlpha(u, w) < 0.3) continue;
        }
        const x = A.x * r0 + B.x * r1 + C.x * r2, y = A.y * r0 + B.y * r1 + C.y * r2, z = A.z * r0 + B.z * r1 + C.z * r2;
        const key = Math.floor(x / cell) + ',' + Math.floor(y / cell) + ',' + Math.floor(z / cell);
        let a = grid.get(key); if (!a) { a = []; grid.set(key, a); } a.push(pts.length); pts.push(x, y, z);
      }
    }
  }
  // 2) 每个皮肤顶点：法线方向上方 6.5mm 内、横向 3.5mm 内是否有贴头皮发根（排除悬空在额头前的刘海发梢！）
  const raw = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const px = P[i * 3], py = P[i * 3 + 1], pz = P[i * 3 + 2], nx = N[i * 3], ny = N[i * 3 + 1], nz = N[i * 3 + 2];
    const cx = Math.floor(px / cell), cy = Math.floor(py / cell), cz = Math.floor(pz / cell);
    let hits = 0;
    for (let x = cx - 1; x <= cx + 1 && hits < 6; x++) for (let y = cy - 1; y <= cy + 1; y++) for (let z = cz - 1; z <= cz + 1; z++) {
      const a = grid.get(x + ',' + y + ',' + z); if (!a) continue;
      for (const k of a) {
        const dx = pts[k] - px, dy = pts[k + 1] - py, dz = pts[k + 2] - pz;
        const along = dx * nx + dy * ny + dz * nz; if (along < -0.0025 || along > 0.0068) continue;
        const lat2 = dx * dx + dy * dy + dz * dz - along * along;
        if (lat2 < 0.0035 * 0.0035) hits++;
      }
    }
    raw[i] = Math.min(1, hits / 3);
  }
  // 头皮区域遮罩：只有上额发际线（y > eyeY + 0.048）、太阳穴鬓角、耳后才可能是发际线；前额中下部的悬空刘海不算发根
  if (anchors) {
    const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    for (let i = 0; i < count; i++) {
      const x = Math.abs(P[i * 3]), y = P[i * 3 + 1], z = P[i * 3 + 2];
      const top = ss(anchors.eyeY + 0.048, anchors.eyeY + 0.064, y);
      const temple = ss(0.046, 0.058, x) * ss(anchors.eyeY + 0.012, anchors.eyeY + 0.032, y);
      const side = ss(anchors.headCenter[2] + 0.01, anchors.headCenter[2] - 0.02, z) * ss(anchors.eyeY - 0.03, anchors.eyeY - 0.005, y);
      raw[i] *= Math.max(top, temple, side);
    }
  }
  // 3) 沿网格拓扑平滑（形成几毫米宽的过渡带）
  const adj = Array.from({ length: count }, () => new Set());
  for (let t = 0; t < index.length; t += 3) { const a = index[t], b = index[t + 1], c = index[t + 2]; adj[a].add(b).add(c); adj[b].add(a).add(c); adj[c].add(a).add(b); }
  // 网格接缝处的重复顶点（同位置不同 UV）也连起来，避免过渡带断开
  const posKey = new Map();
  for (let i = 0; i < count; i++) { const k = Math.round(P[i * 3] * 1e5) + ',' + Math.round(P[i * 3 + 1] * 1e5) + ',' + Math.round(P[i * 3 + 2] * 1e5); const j = posKey.get(k); if (j != null) { adj[i].add(j); adj[j].add(i); } else posKey.set(k, i); }
  let cov = raw.slice();
  for (let it = 0; it < 3; it++) {
    const nxt = new Float32Array(count);
    for (let i = 0; i < count; i++) { let s = 0; for (const j of adj[i]) s += cov[j]; nxt[i] = adj[i].size ? cov[i] * 0.45 + 0.55 * s / adj[i].size : cov[i]; }
    cov = nxt;
  }
  for (let i = 0; i < count; i++) { const x = Math.min(1, Math.max(0, (cov[i] - 0.06) / 0.6)); cov[i] = x * x * (3 - 2 * x); }
  // 4) 生长方向：覆盖度梯度的反方向（从头发指向脸），投影到切平面；没有梯度时取“向下”
  const dirW = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    let gx = 0, gy = 0, gz = 0;
    for (const j of adj[i]) { const dx = P[j * 3] - P[i * 3], dy = P[j * 3 + 1] - P[i * 3 + 1], dz = P[j * 3 + 2] - P[i * 3 + 2]; const l2 = dx * dx + dy * dy + dz * dz + 1e-10; const dc = cov[j] - cov[i]; gx += dc * dx / l2; gy += dc * dy / l2; gz += dc * dz / l2; }
    let dx = -gx, dy = -gy - 2.0, dz = -gz; // 偏向下（重力/自然发流）
    const nx = N[i * 3], ny = N[i * 3 + 1], nz = N[i * 3 + 2]; const d = dx * nx + dy * ny + dz * nz; dx -= nx * d; dy -= ny * d; dz -= nz * d;
    const l = Math.hypot(dx, dy, dz) || 1; dirW[i * 3] = dx / l; dirW[i * 3 + 1] = dy / l; dirW[i * 3 + 2] = dz / l;
  }
  // 写入皮肤几何（方向转回皮肤局部空间）
  const inv = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().copy(M).invert());
  const dirL = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) { v.set(dirW[i * 3], dirW[i * 3 + 1], dirW[i * 3 + 2]).applyMatrix3(inv).normalize(); dirL[i * 3] = v.x; dirL[i * 3 + 1] = v.y; dirL[i * 3 + 2] = v.z; }
  g.setAttribute('aHairCov', new THREE.BufferAttribute(cov, 1));
  g.setAttribute('aHairDir', new THREE.BufferAttribute(dirL, 3));
  return { P, N, cov, dir: dirW, count };
}

/**
 * 沿发际线生成碎发（与 strandHair 发丝同一几何格式，可共用发丝着色器）。
 * @param info computeHairCoverage 的返回值
 * @param anchors { eyeY, headCenter:[x,y,z] }
 */
export function buildBabyHairGeometry(info, anchors, opts = {}) {
  const o = { ...HAIRLINE_DEFAULTS, ...opts };
  const { P, N, cov, dir, count } = info; const SEG = 7;
  let seed = 98765; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const seeds = [];
  for (let i = 0; i < count; i++) {
    const c = cov[i]; if (c < 0.20 || c > 0.72) continue;
    const x = Math.abs(P[i * 3]), y = P[i * 3 + 1], z = P[i * 3 + 2];
    if (y < anchors.eyeY + 0.050 && x < 0.048) continue;    // 严禁在前额中下部裸露皮肤长碎发
    if (y < anchors.eyeY + 0.012) continue;                 // 只在发际线与太阳穴
    if (z < anchors.headCenter[2] - 0.035) continue;          // 后脑不需要
    const k = Math.max(0, 1 - Math.abs(c - 0.46) / 0.26) * 2.8 * o.babyHair;
    const n = Math.floor(k) + (rnd() < k % 1 ? 1 : 0);
    for (let s = 0; s < n; s++) seeds.push(i);
  }
  const nStr = seeds.length; const nv = nStr * SEG * 2;
  const pos = new Float32Array(nv * 3), tan = new Float32Array(nv * 3), side = new Float32Array(nv), tt = new Float32Array(nv), rr = new Float32Array(nv), ao = new Float32Array(nv), ww = new Float32Array(nv);
  const index = new Uint32Array(nStr * (SEG - 1) * 6);
  let vp = 0, ip = 0;
  for (const i of seeds) {
    const nx = N[i * 3], ny = N[i * 3 + 1], nz = N[i * 3 + 2];
    let dx = dir[i * 3], dy = dir[i * 3 + 1], dz = dir[i * 3 + 2];
    const bx = ny * dz - nz * dy, by = nz * dx - nx * dz, bz = nx * dy - ny * dx; // 切向副方向
    // 发根在顶点附近的切平面内随机抖动，往头发里缩一点（从发片下面长出来）
    const j1 = (rnd() * 2 - 1) * 0.004, j2 = (rnd() * 2 - 1) * 0.0025 - 0.0015;
    const rx = P[i * 3] + bx * j1 + dx * j2, ry = P[i * 3 + 1] + by * j1 + dy * j2, rz = P[i * 3 + 2] + bz * j1 + dz * j2;
    const ang = (rnd() * 2 - 1) * 0.35; const ca = Math.cos(ang), sa = Math.sin(ang);
    let tx = dx * ca + bx * sa, ty = dy * ca + by * sa, tz = dz * ca + bz * sa;
    const L = (0.0025 + Math.pow(rnd(), 2.2) * 0.008) * o.babyLength;
    const curl = (rnd() * 2 - 1) * 0.7, lift = (0.0002 + rnd() * 0.0009) * o.babyLift, sr = rnd();
    const w = 0.1 + rnd() * 0.12; const base = vp;
    let px = rx + nx * 0.0002, py = ry + ny * 0.0002, pz = rz + nz * 0.0002;
    for (let s = 0; s < SEG; s++) {
      const u = s / (SEG - 1);
      if (s > 0) {
        // 在切平面内弯曲（卷）+ 逐渐离开皮肤
        const a2 = curl * (1 / (SEG - 1)); const c2 = Math.cos(a2), s2 = Math.sin(a2);
        const cx = ny * tz - nz * ty, cy = nz * tx - nx * tz, cz = nx * ty - ny * tx;
        tx = tx * c2 + cx * s2; ty = ty * c2 + cy * s2; tz = tz * c2 + cz * s2;
        const step = L / (SEG - 1);
        px += tx * step + nx * lift * (2 * u) / (SEG - 1); py += ty * step + ny * lift * (2 * u) / (SEG - 1); pz += tz * step + nz * lift * (2 * u) / (SEG - 1);
      }
      for (let sd = 0; sd < 2; sd++) {
        const v = vp + sd;
        pos[v * 3] = px; pos[v * 3 + 1] = py; pos[v * 3 + 2] = pz; tan[v * 3] = tx; tan[v * 3 + 1] = ty; tan[v * 3 + 2] = tz;
        side[v] = sd ? 1 : -1; tt[v] = 0.25 + 0.75 * u; rr[v] = sr; ao[v] = 0.75 + 0.2 * u; ww[v] = w;
      }
      if (s < SEG - 1) { const a0 = base + s * 2; index[ip++] = a0; index[ip++] = a0 + 1; index[ip++] = a0 + 2; index[ip++] = a0 + 1; index[ip++] = a0 + 3; index[ip++] = a0 + 2; }
      vp += 2;
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geom.setAttribute('aTan', new THREE.BufferAttribute(tan, 3));
  geom.setAttribute('aSide', new THREE.BufferAttribute(side, 1));
  geom.setAttribute('aT', new THREE.BufferAttribute(tt, 1));
  geom.setAttribute('aRand', new THREE.BufferAttribute(rr, 1));
  geom.setAttribute('aAO', new THREE.BufferAttribute(ao, 1));
  geom.setAttribute('aW', new THREE.BufferAttribute(ww, 1));
  geom.setIndex(new THREE.BufferAttribute(index, 1));
  geom.computeBoundingSphere(); if (geom.boundingSphere) geom.boundingSphere.radius += 0.02;
  return { geometry: geom, strands: nStr };
}

/** 皮肤着色器里的发际线过渡（由 skinMaterial 注入；uniform 全部可开关） */
export const HAIRLINE_SKIN_GLSL = `
  if (uHairline > 0.001 || uScalpAO > 0.001) {
    float cv = vHairCov;
    vec3 hd = vHairDir; float hl = length(hd); hd = hl > 1e-4 ? hd / hl : vec3(0.0, -1.0, 0.0);
    vec3 tg = normalize(cross(hd, normalize(vSkinObjN)) + vec3(1e-6));
    float across = dot(vSkinObj, tg) * 2400.0;           // 约 0.4mm 一根
    float idc = floor(across);
    float h1 = fract(sin(idc * 12.9898) * 43758.5453);
    float fx = abs(fract(across) - (0.25 + 0.5 * h1));
    float aaw = fwidth(across);
    float line = 1.0 - smoothstep(0.04, 0.04 + 0.08 + aaw, fx);
    line = mix(line, 0.2, smoothstep(0.35, 1.2, aaw));    // 远看：平均成灰度，避免闪烁
    // 细发在不同位置结束：3D 噪声打散（不沿方向做分段，避免出现等高线条纹）
    float nz = sk_n(vSkinObj * 900.0) * 0.6 + sk_n(vSkinObj * 260.0) * 0.4;
    float exists = smoothstep(0.35, 0.75, cv + (nz - 0.5) * 0.45 + (h1 - 0.5) * 0.15);
    float fineN = sk_n(vSkinObj * 2600.0);
    float dens = exists * (0.55 + 0.45 * fineN); // 不再用条纹（插值方向在三角形间跳变会产生摩尔纹），细发交给碎发几何
    float scalp = smoothstep(0.45, 0.95, cv);
    vec3 cc = diffuseColor.rgb;
    cc *= mix(1.0, 0.55, scalp * uScalpAO);                // 头发覆盖处头皮遮蔽
    cc = mix(cc, uHairRoot, clamp(uHairline * (dens * 0.5 + scalp * 0.5 + smoothstep(0.2, 0.7, cv) * 0.1), 0.0, 1.0));
    diffuseColor.rgb = cc;
    gHairDens = clamp(uHairline * (dens + scalp * 0.6), 0.0, 1.0);
  }
`;
