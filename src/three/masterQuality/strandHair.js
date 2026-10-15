// 画质提升 · 发片 → 真发丝（Card-to-Strand）转换与渲染（独立模块，不接入主项目）
//
// 核心思路（与主项目“只在发片上做着色”的根本区别）：
//   主项目发型 = 若干张带 alpha 贴图的发片网格。无论着色多精细，近看都是“一片一片”的。
//   这里把**艺术家发片网格当作发型的形状/流向容器**，在它上面“长”出几万根真正的 3D 发丝：
//     1) 引导发（Guide）：在发片表面按面积×贴图不透明度撒种子，沿发片 UV 的 V 方向（发丝走向，
//        dP/dv）在 3D 曲面上双向追踪，直到贴图 alpha 变透明（发梢）或离开发片（发根）。
//        发根端 = 离头皮更近的一端（物理判断，不依赖 UV 朝向）。形状 100% 来自原发型资产。
//     2) 子发（Child）：每根引导发周围按“发片宽、厚度薄”的椭圆分布生成子发，沿平行移动标架偏移，
//        越到发梢越向引导发收拢（成缕 clumping），加入细微卷曲（frizz）、少量飞翘碎发（flyaway）、
//        发梢长短不齐。这是影视 Groom（XGen/Houdini/Blender 曲线毛发）的标准引导/插值做法。
//     3) 体积 AO：按方位角分箱求外轮廓半径，越深入发量内部越暗 → 真实的发量层次与暗部。
//     4) 渲染：每根发丝是始终朝向相机的细带（像素级最小宽度 + MSAA 覆盖率抗锯齿），
//        着色用 Marschner 三瓣（R 表皮反射 / TT 透射逆光 / TRT 内部二次反射，Karis 2016 近似）
//        + Kajiya 漫反射 + 发量自遮蔽，切线是真实的发丝切线（不再从 UV 导数猜）。
//     5) 原发片保留为内层“发量底衬”（向内收 1.2mm、压暗），并作为阴影代理投射柔和 VSM 阴影
//        （额头上的发丝投影、远光侧的自阴影）。
import * as THREE from 'three';

export const STRAND_DEFAULTS = {
  guides: 1850,
  childrenPerGuide: 13,
  step: 0.0022,
  maxLength: 0.5,
  surfaceSnap: 0.6,
  maxSurfaceDist: 0.0038,
  tipAlpha: 0.1,
  clumpWidth: 0.0062,
  clumpThickness: 0.0034,
  clump: [0.25, 0.65],
  frizz: 0.00028,
  strayRatio: 0.022,
  subClumps: 4,
  fuzzPerGuide: 1.35,
  scalpMargin: 0.0013,
  widthWorld: 0.00008,
  minPixelWidth: 0.8,
  seed: 1337,
};

// ---------- 小工具 ----------
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

class TriGrid {
  constructor(tri, cell) {
    this.tri = tri; this.cell = cell; this.invCell = 1.0 / cell;
    const n = (tri.length / 9) | 0;
    let mnx = Infinity, mny = Infinity, mnz = Infinity;
    let mxx = -Infinity, mxy = -Infinity, mxz = -Infinity;
    const triBox = new Float32Array(n * 6);
    for (let t = 0; t < n; t++) {
      const o = t * 9, b = t * 6;
      const ax = tri[o], ay = tri[o + 1], az = tri[o + 2];
      const bx = tri[o + 3], by = tri[o + 4], bz = tri[o + 5];
      const cx = tri[o + 6], cy = tri[o + 7], cz = tri[o + 8];
      const lx = ax < bx ? (ax < cx ? ax : cx) : (bx < cx ? bx : cx);
      const ly = ay < by ? (ay < cy ? ay : cy) : (by < cy ? by : cy);
      const lz = az < bz ? (az < cz ? az : cz) : (bz < cz ? bz : cz);
      const hx = ax > bx ? (ax > cx ? ax : cx) : (bx > cx ? bx : cx);
      const hy = ay > by ? (ay > cy ? ay : cy) : (by > cy ? by : cy);
      const hz = az > bz ? (az > cz ? az : cz) : (bz > cz ? bz : cz);
      triBox[b] = lx; triBox[b + 1] = ly; triBox[b + 2] = lz;
      triBox[b + 3] = hx; triBox[b + 4] = hy; triBox[b + 5] = hz;
      if (lx < mnx) mnx = lx; if (ly < mny) mny = ly; if (lz < mnz) mnz = lz;
      if (hx > mxx) mxx = hx; if (hy > mxy) mxy = hy; if (hz > mxz) mxz = hz;
    }
    this.triBox = triBox;
    this.minX = mnx - cell; this.minY = mny - cell; this.minZ = mnz - cell;
    const dimX = Math.max(1, Math.ceil((mxx + cell - this.minX) * this.invCell));
    const dimY = Math.max(1, Math.ceil((mxy + cell - this.minY) * this.invCell));
    const dimZ = Math.max(1, Math.ceil((mxz + cell - this.minZ) * this.invCell));
    this.dimX = dimX; this.dimY = dimY; this.dimZ = dimZ;
    const numCells = dimX * dimY * dimZ;
    const cellCount = new Int32Array(numCells);
    const triBounds = new Int32Array(n * 6);
    let totalRefs = 0;
    for (let t = 0; t < n; t++) {
      const b = t * 6;
      const x0 = Math.max(0, Math.min(dimX - 1, Math.floor((triBox[b] - this.minX) * this.invCell)));
      const y0 = Math.max(0, Math.min(dimY - 1, Math.floor((triBox[b + 1] - this.minY) * this.invCell)));
      const z0 = Math.max(0, Math.min(dimZ - 1, Math.floor((triBox[b + 2] - this.minZ) * this.invCell)));
      const x1 = Math.max(0, Math.min(dimX - 1, Math.floor((triBox[b + 3] - this.minX) * this.invCell)));
      const y1 = Math.max(0, Math.min(dimY - 1, Math.floor((triBox[b + 4] - this.minY) * this.invCell)));
      const z1 = Math.max(0, Math.min(dimZ - 1, Math.floor((triBox[b + 5] - this.minZ) * this.invCell)));
      triBounds[b] = x0; triBounds[b + 1] = y0; triBounds[b + 2] = z0;
      triBounds[b + 3] = x1; triBounds[b + 4] = y1; triBounds[b + 5] = z1;
      for (let x = x0; x <= x1; x++) {
        const xyBase = x * dimY;
        for (let y = y0; y <= y1; y++) {
          const base = (xyBase + y) * dimZ;
          for (let z = z0; z <= z1; z++) {
            cellCount[base + z]++;
            totalRefs++;
          }
        }
      }
    }
    const cellStart = new Int32Array(numCells);
    let running = 0;
    for (let i = 0; i < numCells; i++) {
      cellStart[i] = running;
      running += cellCount[i];
      cellCount[i] = 0;
    }
    const cellTris = new Int32Array(totalRefs);
    for (let t = 0; t < n; t++) {
      const b = t * 6;
      const x0 = triBounds[b], y0 = triBounds[b + 1], z0 = triBounds[b + 2];
      const x1 = triBounds[b + 3], y1 = triBounds[b + 4], z1 = triBounds[b + 5];
      for (let x = x0; x <= x1; x++) {
        const xyBase = x * dimY;
        for (let y = y0; y <= y1; y++) {
          const base = (xyBase + y) * dimZ;
          for (let z = z0; z <= z1; z++) {
            const key = base + z;
            cellTris[cellStart[key] + cellCount[key]++] = t;
          }
        }
      }
    }
    this.cellStart = cellStart;
    this.cellCount = cellCount;
    this.cellTris = cellTris;
    this._stamp = new Uint32Array(n);
    this._iter = 1;
  }

  // 最近三角形（在邻域内）；out = {t, d2, x,y,z, u,v,w}
  closest(px, py, pz, out, ring = 1) {
    const invC = this.invCell, c = this.cell;
    const dimX = this.dimX, dimY = this.dimY, dimZ = this.dimZ;
    const fx = (px - this.minX) * invC, fy = (py - this.minY) * invC, fz = (pz - this.minZ) * invC;
    const cx = Math.floor(fx), cy = Math.floor(fy), cz = Math.floor(fz);
    out.t = -1; out.d2 = Infinity;
    const it = (this._iter = (this._iter + 1) | 0);
    const st = this._stamp, cellStart = this.cellStart, cellCount = this.cellCount, cellTris = this.cellTris;
    const tri = this.tri, B = this.triBox;

    // 1. Check center cell first — if closest point is closer than distance to cell wall, early exit!
    if (cx >= 0 && cy >= 0 && cz >= 0 && cx < dimX && cy < dimY && cz < dimZ) {
      const cKey = (cx * dimY + cy) * dimZ + cz;
      const cnt = cellCount[cKey];
      if (cnt > 0) {
        const start = cellStart[cKey];
        for (let i = 0; i < cnt; i++) {
          const t = cellTris[start + i];
          st[t] = it;
          const b6 = t * 6;
          const dx = px < B[b6] ? B[b6] - px : (px > B[b6 + 3] ? px - B[b6 + 3] : 0);
          const dy = py < B[b6 + 1] ? B[b6 + 1] - py : (py > B[b6 + 4] ? py - B[b6 + 4] : 0);
          const dz = pz < B[b6 + 2] ? B[b6 + 2] - pz : (pz > B[b6 + 5] ? pz - B[b6 + 5] : 0);
          if (dx * dx + dy * dy + dz * dz < out.d2) {
            closestPtTri(px, py, pz, tri, t * 9, out, t);
          }
        }
        if (out.t >= 0) {
          const ux = fx - cx, uy = fy - cy, uz = fz - cz;
          const minWall = Math.min(ux, 1.0 - ux, uy, 1.0 - uy, uz, 1.0 - uz) * c;
          if (out.d2 <= minWall * minWall) return true;
        }
      }
    }

    const x0 = Math.max(0, cx - ring), x1 = Math.min(dimX - 1, cx + ring);
    const y0 = Math.max(0, cy - ring), y1 = Math.min(dimY - 1, cy + ring);
    const z0 = Math.max(0, cz - ring), z1 = Math.min(dimZ - 1, cz + ring);
    for (let x = x0; x <= x1; x++) {
      const xyBase = x * dimY;
      for (let y = y0; y <= y1; y++) {
        const base = (xyBase + y) * dimZ;
        for (let z = z0; z <= z1; z++) {
          if (x === cx && y === cy && z === cz) continue;
          const key = base + z;
          const cnt = cellCount[key];
          if (cnt === 0) continue;
          const start = cellStart[key];
          for (let i = 0; i < cnt; i++) {
            const t = cellTris[start + i];
            if (st[t] === it) continue;
            st[t] = it;
            const b6 = t * 6;
            const dx = px < B[b6] ? B[b6] - px : (px > B[b6 + 3] ? px - B[b6 + 3] : 0);
            const dy = py < B[b6 + 1] ? B[b6 + 1] - py : (py > B[b6 + 4] ? py - B[b6 + 4] : 0);
            const dz = pz < B[b6 + 2] ? B[b6 + 2] - pz : (pz > B[b6 + 5] ? pz - B[b6 + 5] : 0);
            if (dx * dx + dy * dy + dz * dz >= out.d2) continue;
            closestPtTri(px, py, pz, tri, t * 9, out, t);
          }
        }
      }
    }
    return out.t >= 0;
  }

  closestOnCard(px, py, pz, prevU, prevV, U, out, ring = 1) {
    const invC = this.invCell, c = this.cell;
    const dimX = this.dimX, dimY = this.dimY, dimZ = this.dimZ;
    const fx = (px - this.minX) * invC, fy = (py - this.minY) * invC, fz = (pz - this.minZ) * invC;
    const cx = Math.floor(fx), cy = Math.floor(fy), cz = Math.floor(fz);
    out.t = -1; out.d2 = Infinity;
    const it = (this._iter = (this._iter + 1) | 0);
    const st = this._stamp, cellStart = this.cellStart, cellCount = this.cellCount, cellTris = this.cellTris;
    const tri = this.tri, B = this.triBox;

    if (cx >= 0 && cy >= 0 && cz >= 0 && cx < dimX && cy < dimY && cz < dimZ) {
      const cKey = (cx * dimY + cy) * dimZ + cz;
      const cnt = cellCount[cKey];
      if (cnt > 0) {
        const start = cellStart[cKey];
        for (let i = 0; i < cnt; i++) {
          const t = cellTris[start + i];
          st[t] = it;
          const t6 = t * 6;
          if (Math.abs(U[t6] - prevU) > 0.26 || Math.abs(U[t6 + 1] - prevV) > 0.26) continue;
          const b6 = t * 6;
          const dx = px < B[b6] ? B[b6] - px : (px > B[b6 + 3] ? px - B[b6 + 3] : 0);
          const dy = py < B[b6 + 1] ? B[b6 + 1] - py : (py > B[b6 + 4] ? py - B[b6 + 4] : 0);
          const dz = pz < B[b6 + 2] ? B[b6 + 2] - pz : (pz > B[b6 + 5] ? pz - B[b6 + 5] : 0);
          if (dx * dx + dy * dy + dz * dz < out.d2) {
            closestPtTri(px, py, pz, tri, t * 9, out, t);
          }
        }
        if (out.t >= 0) {
          const ux = fx - cx, uy = fy - cy, uz = fz - cz;
          const minWall = Math.min(ux, 1.0 - ux, uy, 1.0 - uy, uz, 1.0 - uz) * c;
          if (out.d2 <= minWall * minWall) return true;
        }
      }
    }

    const x0 = Math.max(0, cx - ring), x1 = Math.min(dimX - 1, cx + ring);
    const y0 = Math.max(0, cy - ring), y1 = Math.min(dimY - 1, cy + ring);
    const z0 = Math.max(0, cz - ring), z1 = Math.min(dimZ - 1, cz + ring);
    for (let x = x0; x <= x1; x++) {
      const xyBase = x * dimY;
      for (let y = y0; y <= y1; y++) {
        const base = (xyBase + y) * dimZ;
        for (let z = z0; z <= z1; z++) {
          if (x === cx && y === cy && z === cz) continue;
          const key = base + z;
          const cnt = cellCount[key];
          if (cnt === 0) continue;
          const start = cellStart[key];
          for (let i = 0; i < cnt; i++) {
            const t = cellTris[start + i];
            if (st[t] === it) continue;
            st[t] = it;
            const t6 = t * 6;
            if (Math.abs(U[t6] - prevU) > 0.26 || Math.abs(U[t6 + 1] - prevV) > 0.26) continue;
            const b6 = t * 6;
            const dx = px < B[b6] ? B[b6] - px : (px > B[b6 + 3] ? px - B[b6 + 3] : 0);
            const dy = py < B[b6 + 1] ? B[b6 + 1] - py : (py > B[b6 + 4] ? py - B[b6 + 4] : 0);
            const dz = pz < B[b6 + 2] ? B[b6 + 2] - pz : (pz > B[b6 + 5] ? pz - B[b6 + 5] : 0);
            if (dx * dx + dy * dy + dz * dz >= out.d2) continue;
            closestPtTri(px, py, pz, tri, t * 9, out, t);
          }
        }
      }
    }
    return out.t >= 0;
  }
}

const _r = { x: 0, y: 0, z: 0, u: 0, v: 0, w: 0 };
// Ericson, Real-Time Collision Detection 5.1.5
function closestPtTri(px, py, pz, T, o, out, tIdx) {
  const ax = T[o], ay = T[o + 1], az = T[o + 2], bx = T[o + 3], by = T[o + 4], bz = T[o + 5], cx = T[o + 6], cy = T[o + 7], cz = T[o + 8];
  const abx = bx - ax, aby = by - ay, abz = bz - az, acx = cx - ax, acy = cy - ay, acz = cz - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  let u, v, w;
  if (d1 <= 0 && d2 <= 0) { u = 1; v = 0; w = 0; } else {
    const bpx = px - bx, bpy = py - by, bpz = pz - bz;
    const d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
    if (d3 >= 0 && d4 <= d3) { u = 0; v = 1; w = 0; } else {
      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) { const t = d1 / (d1 - d3); u = 1 - t; v = t; w = 0; } else {
        const cpx = px - cx, cpy = py - cy, cpz = pz - cz;
        const d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
        if (d6 >= 0 && d5 <= d6) { u = 0; v = 0; w = 1; } else {
          const vb = d5 * d2 - d1 * d6;
          if (vb <= 0 && d2 >= 0 && d6 <= 0) { const t = d2 / (d2 - d6); u = 1 - t; v = 0; w = t; } else {
            const va = d3 * d6 - d5 * d4;
            if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const t = (d4 - d3) / ((d4 - d3) + (d5 - d6)); u = 0; v = 1 - t; w = t; } else {
              const den = 1 / (va + vb + vc); v = vb * den; w = vc * den; u = 1 - v - w;
            }
          }
        }
      }
    }
  }
  const x = u * ax + v * bx + w * cx, y = u * ay + v * by + w * cy, z = u * az + v * bz + w * cz;
  const dd = (px - x) ** 2 + (py - y) ** 2 + (pz - z) ** 2;
  if (dd < out.d2) { out.d2 = dd; out.t = tIdx; out.x = x; out.y = y; out.z = z; out.u = u; out.v = v; out.w = w; }
}

function triSoup(geom, matrix) {
  const pos = geom.attributes.position, uv = geom.attributes.uv;
  const idx = geom.index ? geom.index.array : null;
  const n = idx ? idx.length / 3 : pos.count / 3;
  const P = new Float32Array(n * 9), U = uv ? new Float32Array(n * 6) : null;
  const v = new THREE.Vector3();
  for (let t = 0; t < n; t++) for (let k = 0; k < 3; k++) {
    const i = idx ? idx[t * 3 + k] : t * 3 + k;
    v.fromBufferAttribute(pos, i); if (matrix) v.applyMatrix4(matrix);
    P[t * 9 + k * 3] = v.x; P[t * 9 + k * 3 + 1] = v.y; P[t * 9 + k * 3 + 2] = v.z;
    if (U) { U[t * 6 + k * 2] = uv.getX(i); U[t * 6 + k * 2 + 1] = uv.getY(i); }
  }
  return { P, U, n };
}

/** 读取头部当前（含 morph）形状 → 三角形汤 */
export function morphedHeadSoup(mesh, useLocal = false) {
  const g = mesh.geometry; const base = g.attributes.position;
  const out = new THREE.BufferGeometry();
  const arr = new Float32Array(base.array.length); arr.set(base.array);
  const inf = mesh.morphTargetInfluences || [];
  const ma = g.morphAttributes.position || [];
  for (let m = 0; m < ma.length; m++) {
    const w = inf[m]; if (!w) continue;
    const a = ma[m];
    for (let i = 0; i < base.count; i++) { arr[i * 3] += a.getX(i) * w; arr[i * 3 + 1] += a.getY(i) * w; arr[i * 3 + 2] += a.getZ(i) * w; }
  }
  out.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  if (g.index) out.setIndex(g.index);
  if (useLocal) {
    mesh.updateMatrix();
    return triSoup(out, mesh.matrix);
  }
  mesh.updateWorldMatrix(true, false);
  return triSoup(out, mesh.matrixWorld);
}

export function alphaSamplerFromTexture(tex) {
  const img = tex?.image;
  if (!img || !img.width) return () => 1;
  const W = Math.min(1024, img.width), H = Math.min(1024, img.height);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data;
  const flip = tex.flipY;
  return (u, v) => {
    u -= Math.floor(u); v -= Math.floor(v);
    const x = Math.min(W - 1, Math.floor(u * W)); const y = Math.min(H - 1, Math.floor((flip ? 1 - v : v) * H));
    return d[(y * W + x) * 4 + 3] / 255;
  };
}

/**
 * @param hairGeom  发片 BufferGeometry（position/uv/index）
 * @param hairMatrix 发片到头部坐标的矩阵
 * @param alphaAt   (u,v)=>alpha
 * @param headSoup  morphedHeadSoup(headMesh)
 */
export function generateStrands(hairGeom, hairMatrix, alphaAt, headSoup, opts = {}) {
  const o = { ...STRAND_DEFAULTS, ...opts };
  const rnd = mulberry32(o.seed);
  const t0 = performance.now();
  let P, U, n, triAlphaFn;
  if (Array.isArray(hairGeom)) {
    const soups = hairGeom.map((entry) => ({
      ...triSoup(entry.geom, entry.matrix),
      alphaAt: entry.alphaAt || (() => 1),
    })).filter((s) => s.n > 0 && s.U);
    n = soups.reduce((acc, s) => acc + s.n, 0);
    P = new Float32Array(n * 9);
    U = new Float32Array(n * 6);
    const fns = new Array(n);
    let off = 0;
    for (const s of soups) {
      P.set(s.P, off * 9);
      U.set(s.U, off * 6);
      for (let i = 0; i < s.n; i++) fns[off + i] = s.alphaAt;
      off += s.n;
    }
    triAlphaFn = (t, u, v) => fns[t](u, v);
  } else {
    const single = triSoup(hairGeom, hairMatrix);
    P = single.P; U = single.U; n = single.n;
    triAlphaFn = (_t, u, v) => alphaAt(u, v);
  }
  if (!n || !U) return null;
  // 每个三角形的发丝方向 dP/dv、法线、面积、平均 alpha
  const dir = new Float32Array(n * 3), area = new Float32Array(n), tAlpha = new Float32Array(n);
  for (let t = 0; t < n; t++) {
    const o9 = t * 9, o6 = t * 6;
    const e1x = P[o9 + 3] - P[o9], e1y = P[o9 + 4] - P[o9 + 1], e1z = P[o9 + 5] - P[o9 + 2];
    const e2x = P[o9 + 6] - P[o9], e2y = P[o9 + 7] - P[o9 + 1], e2z = P[o9 + 8] - P[o9 + 2];
    const du1 = U[o6 + 2] - U[o6], dv1 = U[o6 + 3] - U[o6 + 1], du2 = U[o6 + 4] - U[o6], dv2 = U[o6 + 5] - U[o6 + 1];
    const det = du1 * dv2 - du2 * dv1;
    let bx = 0, by = -1, bz = 0;
    if (Math.abs(det) > 1e-12) { bx = (-du2 * e1x + du1 * e2x) / det; by = (-du2 * e1y + du1 * e2y) / det; bz = (-du2 * e1z + du1 * e2z) / det; }
    const l = Math.sqrt((bx)*(bx) + (by)*(by) + (bz)*(bz)) || 1; dir[t * 3] = bx / l; dir[t * 3 + 1] = by / l; dir[t * 3 + 2] = bz / l;
    const cxp = e1y * e2z - e1z * e2y, cyp = e1z * e2x - e1x * e2z, czp = e1x * e2y - e1y * e2x;
    area[t] = 0.5 * Math.sqrt((cxp)*(cxp) + (cyp)*(cyp) + (czp)*(czp));
    tAlpha[t] = triAlphaFn(t, (U[o6] + U[o6 + 2] + U[o6 + 4]) / 3, (U[o6 + 1] + U[o6 + 3] + U[o6 + 5]) / 3);
  }
  const grid = new TriGrid(P, 0.006);
  if (!headSoup._triGrid) headSoup._triGrid = new TriGrid(headSoup.P, 0.01);
  const head = headSoup._triGrid;
  // 头部中心（用于体积法线 / AO）
  let hc = headSoup._headCenter;
  if (!hc) {
    hc = [0, 0, 0];
    let k = 0;
    for (let i = 0; i < headSoup.P.length; i += 3) {
      hc[0] += headSoup.P[i]; hc[1] += headSoup.P[i + 1]; hc[2] += headSoup.P[i + 2]; k++;
    }
    hc[0] /= k; hc[1] /= k; hc[2] /= k;
    headSoup._headCenter = hc;
  }
  const q = { t: -1, d2: 0, x: 0, y: 0, z: 0, u: 0, v: 0, w: 0 };
  const hq = { t: -1, d2: 0, x: 0, y: 0, z: 0, u: 0, v: 0, w: 0 };

  // 种子：按 面积 × alpha × 前额刘海权重 加权
  const cdf = new Float64Array(n); let acc = 0;
  for (let t = 0; t < n; t++) {
    const o9 = t * 9;
    const zm = (P[o9 + 2] + P[o9 + 5] + P[o9 + 8]) / 3;
    const frontWeight = zm > 0.035 ? 1.55 : 1.0;
    acc += area[t] * frontWeight * (tAlpha[t] > 0.35 ? tAlpha[t] : 0);
    cdf[t] = acc;
  }
  if (acc <= 0) return null;
  const pickTri = () => { const r = rnd() * acc; let lo = 0, hi = n - 1; while (lo < hi) { const m = (lo + hi) >> 1; if (cdf[m] < r) lo = m + 1; else hi = m; } return lo; };

  const occ = new Uint8Array(65536);
  const invOccCell = 1.0 / (o.occCell || 0.0028);
  const occKey = (x, y, z) => (((Math.floor(x * invOccCell) * 73856093) ^ (Math.floor(y * invOccCell) * 19349663) ^ (Math.floor(z * invOccCell) * 83492791)) & 65535);

  // Trace step 3.3mm is ~3x finer than the 9mm resample grid, cutting trace steps without changing resampled guide geometry
  const traceStep = Math.max(o.step, 0.0042);
  const maxSurfDistSq = o.maxSurfaceDist * o.maxSurfaceDist;

  function traceDir(sx, sy, sz, tSeed, sign, isTipward) {
    const pts = [];
    let px = sx, py = sy, pz = sz, pdx = 0, pdy = 0, pdz = 0, len = 0;
    let curT = tSeed;
    const s6 = tSeed * 6;
    let prevU = (U[s6] + U[s6 + 2] + U[s6 + 4]) / 3, prevV = (U[s6 + 1] + U[s6 + 3] + U[s6 + 5]) / 3;
    for (let s = 0; s < 260 && len < o.maxLength; s++) {
      let dx = dir[curT * 3] * sign, dy = dir[curT * 3 + 1] * sign, dz = dir[curT * 3 + 2] * sign;
      if (s > 0) {
        const c = dx * pdx + dy * pdy + dz * pdz; if (c < 0.35) break; // 急转弯或进入对称分缝反向发片 = 立即终止，绝不跨过中分线画横丝
        dx = pdx * 0.45 + dx * 0.55; dy = pdy * 0.45 + dy * 0.55; dz = pdz * 0.45 + dz * 0.55;
        const l = Math.sqrt((dx)*(dx) + (dy)*(dy) + (dz)*(dz)) || 1; dx /= l; dy /= l; dz /= l;
      }
      let nx = px + dx * traceStep, ny = py + dy * traceStep, nz = pz + dz * traceStep;
      if (!grid.closestOnCard(nx, ny, nz, prevU, prevV, U, q)) break;
      if (q.d2 > maxSurfDistSq) break;
      nx += (q.x - nx) * o.surfaceSnap; ny += (q.y - ny) * o.surfaceSnap; nz += (q.z - nz) * o.surfaceSnap;
      const t6 = q.t * 6;
      const uu = U[t6] * q.u + U[t6 + 2] * q.v + U[t6 + 4] * q.w;
      const vv = U[t6 + 1] * q.u + U[t6 + 3] * q.v + U[t6 + 5] * q.w;
      if (Math.abs(uu - prevU) > 0.10 || Math.abs(vv - prevV) > 0.10) break; // 防止跨过 UV 接缝跳到另一张发片
      prevU = uu; prevV = vv;
      const a = triAlphaFn(q.t, uu, vv);
      if (a < o.tipAlpha) { if (isTipward) pts.push([nx, ny, nz]); break; }
      pts.push([nx, ny, nz]);
      len += Math.sqrt((nx - px)*(nx - px) + (ny - py)*(ny - py) + (nz - pz)*(nz - pz));
      pdx = dx; pdy = dy; pdz = dz; px = nx; py = ny; pz = nz;
      curT = q.t;
    }
    return pts;
  }
  const headDist = (p) => { if (!head.closest(p[0], p[1], p[2], hq, 2)) return 1; return Math.sqrt(hq.d2); };

  const guides = [];
  let attempts = 0;
  const maxAttempts = Math.ceil(o.guides * 3.5);
  while (guides.length < o.guides && attempts < maxAttempts) {
    attempts++;
    const t = pickTri();
    let a = rnd(), b = rnd(); if (a + b > 1) { a = 1 - a; b = 1 - b; }
    const o9 = t * 9;
    const sx = P[o9] * (1 - a - b) + P[o9 + 3] * a + P[o9 + 6] * b;
    const sy = P[o9 + 1] * (1 - a - b) + P[o9 + 4] * a + P[o9 + 7] * b;
    const sz = P[o9 + 2] * (1 - a - b) + P[o9 + 5] * a + P[o9 + 8] * b;
    const k = occKey(sx, sy, sz);
    const maxOcc = sz > 0.045 ? 6 : (attempts > o.guides * 1.8 ? 4 : 2);
    if (occ[k] >= maxOcc) continue;
    const fwd = traceDir(sx, sy, sz, t, 1, true);
    const back = traceDir(sx, sy, sz, t, -1, true);
    let pts = back.reverse().concat([[sx, sy, sz]], fwd);
    if (pts.length < 4) continue;
    // 发根 = 位于上方的解剖发根端（水平碎发则取离头皮近的一端），绝不因刘海发梢贴近额头而把刘海上下颠倒！
    const pFirst = pts[0], pLast = pts[pts.length - 1];
    const dySpan = pFirst[1] - pLast[1];
    if (Math.abs(dySpan) > 0.010 ? (dySpan < 0) : (headDist(pLast) < headDist(pFirst))) pts.reverse();
    // 将发根向反切线方向自然延伸 8mm 收入上层发丝下方，彻底消除刘海与头顶发片交界处的断层黑缝
    if (pts.length >= 3 && pts[0][1] > 0.055 && pts[0][1] < 0.125) {
      const r0 = pts[0], r1 = pts[2];
      let rx = r0[0] - r1[0], ry = r0[1] - r1[1], rz = r0[2] - r1[2];
      const rl = Math.sqrt(rx * rx + ry * ry + rz * rz) || 1;
      rx /= rl; ry /= rl; rz /= rl;
      if (ry > 0.15) {
        pts.unshift(
          [r0[0] + rx * 0.008, r0[1] + ry * 0.008, r0[2] + rz * 0.008],
          [r0[0] + rx * 0.004, r0[1] + ry * 0.004, r0[2] + rz * 0.004]
        );
      }
    }
    let L = 0; for (let i = 1; i < pts.length; i++) L += Math.sqrt((pts[i][0] - pts[i - 1][0])*(pts[i][0] - pts[i - 1][0]) + (pts[i][1] - pts[i - 1][1])*(pts[i][1] - pts[i - 1][1]) + (pts[i][2] - pts[i - 1][2])*(pts[i][2] - pts[i - 1][2]));
    if (L < 0.014) continue;
    for (let i = 0; i < pts.length; i += 2) { const p = pts[i]; const kk = occKey(p[0], p[1], p[2]); if (occ[kk] < 255) occ[kk]++; }
    guides.push(resample(pts, L));
  }
  // 发丝不穿头皮：推到头皮外 scalpMargin
  const T = headSoup.P;
  for (let gi = 0; gi < guides.length; gi++) {
    const gp = guides[gi].p;
    for (let pi = 0; pi < gp.length; pi++) {
      const p = gp[pi];
      if (!head.closest(p[0], p[1], p[2], hq, 1)) continue;
      const ht = hq.t * 9;
      const e1x = T[ht + 3] - T[ht], e1y = T[ht + 4] - T[ht + 1], e1z = T[ht + 5] - T[ht + 2];
      const e2x = T[ht + 6] - T[ht], e2y = T[ht + 7] - T[ht + 1], e2z = T[ht + 8] - T[ht + 2];
      let nx = e1y * e2z - e1z * e2y, ny = e1z * e2x - e1x * e2z, nz = e1x * e2y - e1y * e2x;
      const nl = Math.sqrt((nx)*(nx) + (ny)*(ny) + (nz)*(nz)) || 1; nx /= nl; ny /= nl; nz /= nl;
      if (nx * (hq.x - hc[0]) + ny * (hq.y - hc[1]) + nz * (hq.z - hc[2]) < 0) { nx = -nx; ny = -ny; nz = -nz; }
      const sd = (p[0] - hq.x) * nx + (p[1] - hq.y) * ny + (p[2] - hq.z) * nz;
      if (sd < o.scalpMargin) { const k2 = o.scalpMargin - sd; p[0] += nx * k2; p[1] += ny * k2; p[2] += nz * k2; }
    }
  }
  const tGuides = performance.now();
  const strands = buildChildren(guides, hc, o, rnd);
  return { ...strands, guides: guides.length, headCenter: hc, ms: { guides: tGuides - t0, children: performance.now() - tGuides } };
}

function resample(pts, L) {
  const N = Math.max(8, Math.min(24, Math.round(L / 0.009) + 2));
  const out = new Array(N);
  const cum = new Float64Array(pts.length);
  for (let i = 1; i < pts.length; i++) cum[i] = cum[i - 1] + Math.sqrt((pts[i][0] - pts[i - 1][0])*(pts[i][0] - pts[i - 1][0]) + (pts[i][1] - pts[i - 1][1])*(pts[i][1] - pts[i - 1][1]) + (pts[i][2] - pts[i - 1][2])*(pts[i][2] - pts[i - 1][2]));
  let j = 0;
  for (let i = 0; i < N; i++) {
    const s = (i / (N - 1)) * L;
    while (j < cum.length - 2 && cum[j + 1] < s) j++;
    const f = Math.min(1, Math.max(0, (s - cum[j]) / Math.max(1e-9, cum[j + 1] - cum[j])));
    out[i] = [pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f, pts[j][2] + (pts[j + 1][2] - pts[j][2]) * f];
  }
  // 轻微平滑（去掉追踪锯齿）
  for (let it = 0; it < 2; it++) for (let i = 1; i < N - 1; i++) for (let k = 0; k < 3; k++) out[i][k] = out[i][k] * 0.5 + (out[i - 1][k] + out[i + 1][k]) * 0.25;
  return { p: out, L };
}

let _fPx = 0, _fPy = 0, _fPz = 0;
let _fNx = 0, _fNy = 0, _fNz = 0;
let _fBx = 0, _fBy = 0, _fBz = 0;
let _fAO = 1;

function buildChildren(guides, hc, o, rnd) {
  // ---- 体积 AO：发丝密度体素 + 沿“离开头部”方向的射线累积（简化版 Deep Opacity）----
  const VX = 0.004, invVX = 1.0 / VX;
  let mnx = 1e9, mny = 1e9, mnz = 1e9, mxx = -1e9, mxy = -1e9, mxz = -1e9;
  for (let gi = 0; gi < guides.length; gi++) {
    const gp = guides[gi].p;
    for (let pi = 0; pi < gp.length; pi++) {
      const p = gp[pi];
      if (p[0] < mnx) mnx = p[0]; if (p[1] < mny) mny = p[1]; if (p[2] < mnz) mnz = p[2];
      if (p[0] > mxx) mxx = p[0]; if (p[1] > mxy) mxy = p[1]; if (p[2] > mxz) mxz = p[2];
    }
  }
  mnx -= 0.03; mny -= 0.03; mnz -= 0.03; mxx += 0.03; mxy += 0.03; mxz += 0.03;
  const GX = Math.ceil((mxx - mnx) * invVX), GY = Math.ceil((mxy - mny) * invVX), GZ = Math.ceil((mxz - mnz) * invVX);
  const dens = new Float32Array(GX * GY * GZ);
  const vidx = (x, y, z) => {
    const i = Math.floor((x - mnx) * invVX), j = Math.floor((y - mny) * invVX), k = Math.floor((z - mnz) * invVX);
    return (i < 0 || j < 0 || k < 0 || i >= GX || j >= GY || k >= GZ) ? -1 : (k * GY + j) * GX + i;
  };
  for (let gi = 0; gi < guides.length; gi++) {
    const gp = guides[gi].p;
    const invGl = 1.0 / Math.max(1, gp.length - 1);
    for (let i = 1; i < gp.length; i++) {
      const tSeg = i * invGl;
      const tipWeight = 1.0 - 0.85 * Math.max(0.0, Math.min(1.0, (tSeg - 0.50) / 0.50));
      const A = gp[i - 1], B = gp[i];
      const seg = Math.sqrt((B[0] - A[0])*(B[0] - A[0]) + (B[1] - A[1])*(B[1] - A[1]) + (B[2] - A[2])*(B[2] - A[2]));
      const n = Math.max(1, Math.ceil(seg * 500.0));
      for (let k = 0; k < n; k++) {
        const f = (k + 0.5) / n;
        const id = vidx(A[0] + (B[0] - A[0]) * f, A[1] + (B[1] - A[1]) * f, A[2] + (B[2] - A[2]) * f);
        if (id >= 0) dens[id] += tipWeight;
      }
    }
  }
  const aoAt = (px, py, pz) => {
    let dx = px - hc[0], dy = py - hc[1], dz = pz - hc[2];
    const l = Math.sqrt((dx)*(dx) + (dy)*(dy) + (dz)*(dz)) || 1; dx /= l; dy /= l; dz /= l;
    let acc = 0;
    for (let st = 1; st <= 7; st++) {
      const d = 0.0025 + st * 0.003;
      const id = vidx(px + dx * d, py + dy * d, pz + dz * d);
      if (id >= 0) acc += dens[id];
    }
    return 0.58 + 0.42 * Math.exp(-acc * 0.032);
  };

  // ---- 容量预估：子发 C×N + 绒毛碎发（固定 FUZZ_N 点）----
  const C = o.childrenPerGuide, FUZZ_N = 6;
  const fuzzPer = o.fuzzPerGuide;
  let cap = 0; for (let gi = 0; gi < guides.length; gi++) cap += guides[gi].p.length * C + Math.ceil(fuzzPer + 1) * FUZZ_N;
  const pos = new Float32Array(cap * 6), tan = new Float32Array(cap * 6);
  const side = new Float32Array(cap * 2), tt = new Float32Array(cap * 2), rr = new Float32Array(cap * 2), ao = new Float32Array(cap * 2), ww = new Float32Array(cap * 2);
  const index = new Uint32Array(cap * 6);
  let vp = 0, ip = 0, strandCount = 0, fuzzCount = 0, strayCount = 0;

  // Pre-allocated flat frame buffers (max N <= 32)
  const gP = new Float64Array(96), gT = new Float64Array(96), gN = new Float64Array(96), gB = new Float64Array(96), gAO = new Float64Array(32);
  const tTab = new Float64Array(32), tpTab = new Float64Array(32);
  const subA = new Float64Array(16), subB = new Float64Array(16), subC = new Float64Array(16);

  for (let gi = 0; gi < guides.length; gi++) {
    const g = guides[gi];
    const N = g.p.length;
    // 平行移动标架 + 引导点 AO 预计算（避免每个子发顶点重复 7 步体素投射）
    for (let i = 0; i < N; i++) {
      const i3 = i * 3;
      const pi = g.p[i];
      gP[i3] = pi[0]; gP[i3 + 1] = pi[1]; gP[i3 + 2] = pi[2];
      gAO[i] = aoAt(pi[0], pi[1], pi[2]);
      const a = g.p[i > 0 ? i - 1 : 0], b = g.p[i < N - 1 ? i + 1 : N - 1];
      let tx = b[0] - a[0], ty = b[1] - a[1], tz = b[2] - a[2];
      const l = Math.sqrt((tx)*(tx) + (ty)*(ty) + (tz)*(tz)) || 1; tx /= l; ty /= l; tz /= l;
      gT[i3] = tx; gT[i3 + 1] = ty; gT[i3 + 2] = tz;
      let nx, ny, nz;
      if (i === 0) {
        nx = pi[0] - hc[0]; ny = pi[1] - hc[1]; nz = pi[2] - hc[2];
      } else {
        nx = gN[i3 - 3]; ny = gN[i3 - 2]; nz = gN[i3 - 1];
      }
      const d = nx * tx + ny * ty + nz * tz;
      nx -= tx * d; ny -= ty * d; nz -= tz * d;
      const nl = Math.sqrt((nx)*(nx) + (ny)*(ny) + (nz)*(nz)) || 1; nx /= nl; ny /= nl; nz /= nl;
      gN[i3] = nx; gN[i3 + 1] = ny; gN[i3 + 2] = nz;
      gB[i3] = ty * nz - tz * ny; gB[i3 + 1] = tz * nx - tx * nz; gB[i3 + 2] = tx * ny - ty * nx;
    }

    const sampleFrame = (s01) => {
      const s = s01 * (N - 1);
      if (s >= N - 1) {
        const ex = (s - (N - 1)) * (g.L / (N - 1));
        const b3 = (N - 1) * 3;
        _fPx = gP[b3] + gT[b3] * ex; _fPy = gP[b3 + 1] + gT[b3 + 1] * ex; _fPz = gP[b3 + 2] + gT[b3 + 2] * ex;
        _fNx = gN[b3]; _fNy = gN[b3 + 1]; _fNz = gN[b3 + 2];
        _fBx = gB[b3]; _fBy = gB[b3 + 1]; _fBz = gB[b3 + 2];
        _fAO = gAO[N - 1];
        return;
      }
      const i0 = Math.max(0, Math.min(N - 2, s | 0));
      const f = s - i0;
      const a3 = i0 * 3, b3 = a3 + 3;
      _fPx = gP[a3] + (gP[b3] - gP[a3]) * f; _fPy = gP[a3 + 1] + (gP[b3 + 1] - gP[a3 + 1]) * f; _fPz = gP[a3 + 2] + (gP[b3 + 2] - gP[a3 + 2]) * f;
      _fNx = gN[a3] + (gN[b3] - gN[a3]) * f; _fNy = gN[a3 + 1] + (gN[b3 + 1] - gN[a3 + 1]) * f; _fNz = gN[a3 + 2] + (gN[b3 + 2] - gN[a3 + 2]) * f;
      _fBx = gB[a3] + (gB[b3] - gB[a3]) * f; _fBy = gB[a3 + 1] + (gB[b3 + 1] - gB[a3 + 1]) * f; _fBz = gB[a3 + 2] + (gB[b3 + 2] - gB[a3 + 2]) * f;
      _fAO = gAO[i0] + (gAO[i0 + 1] - gAO[i0]) * f;
    };

    const SC = o.subClumps;
    for (let k = 0; k < SC; k++) {
      subA[k] = (rnd() * 1.2 - 0.2) * o.clumpThickness * 0.8;
      subB[k] = (rnd() * 2 - 1) * o.clumpWidth * 0.8;
      subC[k] = 0.55 + rnd() * 0.4;
    }
    const invN1 = 1.0 / (N - 1);
    for (let i = 0; i < N; i++) {
      const ti = i * invN1;
      tTab[i] = ti;
      tpTab[i] = Math.pow(ti, 1.3);
    }
    for (let c = 0; c < C; c++) {
      const oa = (rnd() * 1.25 - 0.25) * o.clumpThickness, ob = (rnd() * 2 - 1) * o.clumpWidth;
      const scIdx = c % SC;
      const sc0 = subA[scIdx], sc1 = subB[scIdx], sc2 = subC[scIdx];
      const clumpMain = o.clump[0] + rnd() * (o.clump[1] - o.clump[0]);
      const loose = rnd() < 0.12;
      const stray = rnd() < o.strayRatio;
      const tEnd = stray ? 0.8 + rnd() * 0.22 : 1 - Math.pow(rnd(), 1.6) * 0.38;
      const fr = o.frizz * (0.5 + rnd()) * (rnd() < 0.08 ? 3.5 : 1);
      const fk = 2 + rnd() * 5, fph = rnd() * 6.283;
      const strayT0 = 0.25 + rnd() * 0.5, strayAmp = 0.003 + rnd() * 0.009, strayB = rnd() * 2 - 1, strayCurl = (rnd() * 2 - 1) * 0.009;
      const sr = rnd();
      const wmul = stray ? 0.55 : (0.75 + rnd() * 0.5);
      const base = vp;
      for (let i = 0; i < N; i++) {
        const t = tTab[i];
        sampleFrame(t * tEnd);
        const tp = tpTab[i];
        const kSub = loose ? 0.1 * tp : sc2 * tp * 0.8;
        const kMain = clumpMain * tp * 0.6;
        let a = (oa + (sc0 - oa) * kSub) * (1 - kMain);
        let b = (ob + (sc1 - ob) * kSub) * (1 - kMain);
        const wave = Math.sin(fph + t * fk * 6.283) * fr * (0.3 + t);
        const wave2 = Math.cos(fph * 1.7 + t * fk * 4.1) * fr * (0.3 + t);
        let flyN = 0, flyL = 0;
        if (stray && t > strayT0) {
          const u = (t - strayT0) / (1 - strayT0);
          flyN = strayAmp * u * u;
          flyL = strayAmp * 0.7 * strayB * u * u + strayCurl * Math.sin(u * 3.0);
        }
        const dn = a + wave + flyN, db = b + wave2 + flyL;
        const px = _fPx + _fNx * dn + _fBx * db;
        const py = _fPy + _fNy * dn + _fBy * db;
        const pz = _fPz + _fNz * dn + _fBz * db;
        const occl = _fAO * (loose ? 1.0 : 0.92 + 0.08 * (1 - kSub));
        const v0 = vp, v1 = vp + 1;
        const v0_3 = v0 * 3, v1_3 = v1 * 3;
        pos[v0_3] = px; pos[v0_3 + 1] = py; pos[v0_3 + 2] = pz;
        pos[v1_3] = px; pos[v1_3 + 1] = py; pos[v1_3 + 2] = pz;
        side[v0] = -1; side[v1] = 1;
        tt[v0] = t; tt[v1] = t;
        rr[v0] = sr; rr[v1] = sr;
        ao[v0] = occl; ao[v1] = occl;
        ww[v0] = wmul; ww[v1] = wmul;
        if (i < N - 1) {
          const a0 = base + i * 2;
          index[ip++] = a0; index[ip++] = a0 + 1; index[ip++] = a0 + 2;
          index[ip++] = a0 + 1; index[ip++] = a0 + 3; index[ip++] = a0 + 2;
        }
        vp += 2;
      }
      strandCount++; if (stray) strayCount++;
    }
    const nf = Math.floor(fuzzPer) + (rnd() < fuzzPer % 1 ? 1 : 0);
    const invFuzz1 = 1.0 / (FUZZ_N - 1);
    for (let f = 0; f < nf; f++) {
      const s0 = rnd() * 0.7, len = 0.006 + rnd() * 0.018;
      const ds = len / Math.max(g.L, 1e-4);
      const oa = (rnd() * 1.1) * o.clumpThickness, ob = (rnd() * 2 - 1) * o.clumpWidth * 1.1;
      const lift = 0.0015 + rnd() * 0.004, curl = (rnd() * 2 - 1) * 0.004, ph = rnd() * 6.28, sr = rnd();
      const base = vp;
      for (let i = 0; i < FUZZ_N; i++) {
        const u = i * invFuzz1;
        sampleFrame(Math.min(1, s0 + ds * u));
        const dn = oa + lift * u * u + Math.sin(ph + u * 5) * 0.0004;
        const db = ob + curl * u * u + Math.cos(ph + u * 4) * 0.0005;
        const px = _fPx + _fNx * dn + _fBx * db;
        const py = _fPy + _fNy * dn + _fBy * db;
        const pz = _fPz + _fNz * dn + _fBz * db;
        const tVal = 0.35 + 0.65 * u;
        const v0 = vp, v1 = vp + 1;
        const v0_3 = v0 * 3, v1_3 = v1 * 3;
        pos[v0_3] = px; pos[v0_3 + 1] = py; pos[v0_3 + 2] = pz;
        pos[v1_3] = px; pos[v1_3 + 1] = py; pos[v1_3 + 2] = pz;
        side[v0] = -1; side[v1] = 1;
        tt[v0] = tVal; tt[v1] = tVal;
        rr[v0] = sr; rr[v1] = sr;
        ao[v0] = _fAO; ao[v1] = _fAO;
        ww[v0] = 0.45; ww[v1] = 0.45;
        if (i < FUZZ_N - 1) {
          const a0 = base + i * 2;
          index[ip++] = a0; index[ip++] = a0 + 1; index[ip++] = a0 + 2;
          index[ip++] = a0 + 1; index[ip++] = a0 + 3; index[ip++] = a0 + 2;
        }
        vp += 2;
      }
      fuzzCount++;
    }
  }
  // 用实际位置重算切线（同一根发丝内相邻点：t 递增）
  for (let v = 0; v < vp; v += 2) {
    const tcur = tt[v];
    const hasPrev = v >= 2 && tt[v - 2] < tcur, hasNext = v + 2 < vp && tt[v + 2] > tcur;
    const prev = hasPrev ? v - 2 : v, next = hasNext ? v + 2 : v;
    const n3 = next * 3, p3 = prev * 3;
    let dx = pos[n3] - pos[p3], dy = pos[n3 + 1] - pos[p3 + 1], dz = pos[n3 + 2] - pos[p3 + 2];
    const l = Math.sqrt((dx)*(dx) + (dy)*(dy) + (dz)*(dz)); if (l < 1e-9) continue; dx /= l; dy /= l; dz /= l;
    const v3 = v * 3;
    tan[v3] = dx; tan[v3 + 1] = dy; tan[v3 + 2] = dz;
    tan[v3 + 3] = dx; tan[v3 + 4] = dy; tan[v3 + 5] = dz;
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(pos.subarray(0, vp * 3), 3));
  geom.setAttribute('aTan', new THREE.BufferAttribute(tan.subarray(0, vp * 3), 3));
  geom.setAttribute('aSide', new THREE.BufferAttribute(side.subarray(0, vp), 1));
  geom.setAttribute('aT', new THREE.BufferAttribute(tt.subarray(0, vp), 1));
  geom.setAttribute('aRand', new THREE.BufferAttribute(rr.subarray(0, vp), 1));
  geom.setAttribute('aAO', new THREE.BufferAttribute(ao.subarray(0, vp), 1));
  geom.setAttribute('aW', new THREE.BufferAttribute(ww.subarray(0, vp), 1));
  geom.setIndex(new THREE.BufferAttribute(index.subarray(0, ip), 1));
  geom.boundingSphere = new THREE.Sphere(new THREE.Vector3(hc[0], hc[1], hc[2]), 0.22);
  const stepS = Math.max(1, (vp / 400) | 0);
  const aoS = [];
  for (let i = 0; i < vp; i += stepS) aoS.push(ao[i]);
  aoS.sort((x, y) => x - y);
  const aoStats = aoS.length ? [0.1, 0.5, 0.9].map((q) => +aoS[Math.floor(q * (aoS.length - 1))].toFixed(3)) : [0.3, 0.6, 0.9];
  return { aoStats, geometry: geom, strandCount: strandCount + fuzzCount, mainStrands: strandCount, fuzz: fuzzCount, strays: strayCount, vertexCount: vp };
}

// ---------------- 发丝着色器（Marschner 三瓣近似 + Kajiya 漫反射） ----------------
export const STRAND_SHADING_DEFAULTS = {
  color: [0.024, 0.017, 0.014],
  gainR: 0.68, gainTT: 0.90, gainTRT: 1.45, gainDiffuse: 0.88,
  alphaR: -0.07, betaR: 0.085,
  colorVariation: 0.28,
  tipLighten: 0.14,
};

export function createStrandMaterial(headCenter = [0.0, 0.02, -0.01], opts = {}) {
  if (headCenter && !Array.isArray(headCenter) && typeof headCenter === 'object') {
    opts = headCenter;
    headCenter = opts.headCenter || [0.0, 0.02, -0.01];
  }
  if (!Array.isArray(headCenter)) headCenter = [0.0, 0.02, -0.01];
  const o = { ...STRAND_SHADING_DEFAULTS, ...opts };
  const mat = new THREE.MeshStandardMaterial({
    name: 'PhotorealStrandHair', color: new THREE.Color(...o.color), roughness: 0.65, metalness: 0,
    side: THREE.DoubleSide, envMapIntensity: 0.08, alphaToCoverage: true,
  });
  mat.userData.builtInHair = true;
  mat.userData.isMasterStrandHair = true;
  const u = {
    uHeadCenter: { value: new THREE.Vector3(...headCenter) },
    uWidth: { value: STRAND_DEFAULTS.widthWorld },
    uMinPx: { value: STRAND_DEFAULTS.minPixelWidth },
    uPxScale: { value: 0.00068 },
    uGainR: { value: o.gainR }, uGainTT: { value: o.gainTT }, uGainTRT: { value: o.gainTRT }, uGainD: { value: o.gainDiffuse },
    uAlphaR: { value: o.alphaR }, uBetaR: { value: o.betaR },
    uColorVar: { value: o.colorVariation }, uTipLighten: { value: o.tipLighten }, uCovGain: { value: 1.65 }, uMinAlpha: { value: 0.82 },
    uHairOmbreMix: { value: Number(o.hairOmbreMix ?? 0.0) },
    uHairTipColor: { value: new THREE.Color(o.hairTipColor || '#4a3528') },
    uHairFineTune0: { value: new THREE.Vector4(0, 0, 0, 0) },
    uHairFineTune1: { value: new THREE.Vector4(0, 0, 0, 0) },
    uHairFineTune2: { value: new THREE.Vector4(0.45, 0, 0, 0) },
  };
  mat.userData.strandUniforms = u;
  mat.userData.hairShaderUniforms = u;
  mat.onBeforeCompile = (s) => {
    Object.assign(s.uniforms, u);
    s.vertexShader = s.vertexShader
      .replace('#include <common>', `#include <common>
        attribute vec3 aTan; attribute float aSide; attribute float aT; attribute float aRand; attribute float aAO; attribute float aW;
        uniform vec3 uHeadCenter; uniform float uWidth, uMinPx, uPxScale;
        uniform vec4 uHairFineTune0, uHairFineTune1, uHairFineTune2;
        varying vec3 vHT; varying float vT, vRand, vAO, vCov, vW;
        vec3 applyMasterStrandFineTune(vec3 p) {
          float x = p.x, y = p.y, z = p.z;
          float crownMode = uHairFineTune0.x;
          float effHairVol = uHairFineTune0.y;
          float bangsLen = uHairFineTune0.z;
          float bangsPart = uHairFineTune0.w;
          float sideburn = uHairFineTune1.x;
          float hairLen = uHairFineTune1.y;
          float hairFlare = uHairFineTune1.z;
          float hairCurlWave = uHairFineTune1.w;
          float neckClear = uHairFineTune2.x;
          if (crownMode > 0.5 && crownMode < 1.5 && y < 0.045 && abs(x) > 0.052 && z < 0.042) {
            float wSleek = min(1.0, (0.045 - y) / 0.065) * min(1.0, (abs(x) - 0.052) / 0.032);
            float signX = x >= 0.0 ? 1.0 : -1.0;
            x -= signX * 0.014 * wSleek;
            z -= 0.010 * wSleek;
          } else if (crownMode > 1.5 && y > 0.045) {
            float wTop = min(1.0, (y - 0.045) / 0.075);
            x += 0.008 * wTop;
          }
          if (abs(effHairVol) > 1e-4 && y > -0.02) {
            float wCrown = clamp((y + 0.02) / 0.09, 0.0, 1.0);
            float rx = x;
            float ry = y - 0.025;
            float rz = z;
            x += rx * (effHairVol * 0.16 * wCrown);
            if (ry > 0.0) y += ry * (effHairVol * 0.22 * wCrown);
            z += rz * (effHairVol * 0.12 * wCrown);
          }
          if ((abs(bangsLen) > 1e-4 || abs(bangsPart) > 1e-4) && z > 0.042 && y > -0.035 && abs(x) < 0.068) {
            float wFront = clamp((z - 0.042) / 0.045, 0.0, 1.0);
            float wCenter = clamp(1.0 - abs(x) / 0.068, 0.0, 1.0);
            float wLowerBangs = clamp((0.065 - y) / 0.065, 0.0, 1.0);
            float wBangs = wFront * wCenter * wLowerBangs;
            y -= bangsLen * 0.028 * wBangs;
            z += max(0.0, bangsLen) * 0.005 * wBangs;
            if (abs(bangsPart) > 1e-4) {
              float signX = x >= 0.0 ? 1.0 : -1.0;
              float pxRatio = abs(x) / 0.032;
              float partStrength = exp(-(pxRatio * pxRatio));
              x += signX * bangsPart * 0.022 * wFront * wLowerBangs * partStrength;
              y += max(0.0, bangsPart) * 0.010 * wFront * wLowerBangs * partStrength;
            }
          }
          if (abs(sideburn) > 1e-4 && z > -0.015 && y < 0.025 && abs(x) > 0.032) {
            float wSide = clamp((0.025 - y) / 0.10, 0.0, 1.0);
            float signX = x >= 0.0 ? 1.0 : -1.0;
            x -= signX * sideburn * 0.020 * wSide;
            z += sideburn * 0.010 * wSide;
          }
          if ((abs(hairLen) > 1e-4 || abs(hairFlare) > 1e-4 || abs(hairCurlWave) > 1e-4) && y < -0.005) {
            float wTip = clamp((-0.005 - y) / 0.11, 0.0, 1.0);
            y -= hairLen * 0.055 * wTip;
            float signX = x >= 0.0 ? 1.0 : -1.0;
            x += signX * hairFlare * 0.028 * (wTip * wTip);
            z += hairFlare * 0.014 * (wTip * wTip);
            if (abs(hairCurlWave) > 1e-4) {
              float wavePhase = y * 135.0 + abs(x) * 42.0;
              x += sin(wavePhase) * 0.0085 * hairCurlWave * wTip;
              z += cos(wavePhase * 0.85) * 0.0065 * hairCurlWave * wTip;
            }
          }
          if (neckClear > 0.05 && y < -0.042 && z < 0.025) {
            float wBelow = clamp((-0.042 - y) / 0.055, 0.0, 1.0);
            float rNeck = length(vec2(x, z + 0.014));
            if (rNeck < 0.050) {
              float push = (0.050 - rNeck) * neckClear * 0.72 * wBelow;
              float signX = x >= 0.0 ? 1.0 : -1.0;
              x += signX * push * 0.88;
              z -= push * 0.32;
            }
          }
          return vec3(x, y, z);
        }`)
      .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = normalize(position - uHeadCenter);')
      .replace('#include <project_vertex>', `
        transformed = applyMasterStrandFineTune(transformed);
        vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
        vec3 tV = normalize(mat3(modelViewMatrix) * aTan);
        vHT = tV; vT = aT; vRand = aRand; vAO = aAO; vW = aW;
        vec3 vd = normalize(-mvPosition.xyz);
        vec3 sd = cross(tV, vd); float sl = length(sd); sd = sl > 1e-4 ? sd / sl : vec3(1.0, 0.0, 0.0);
        float px = uPxScale * max(-mvPosition.z, 0.01);
        float modelScale = length(modelViewMatrix[0].xyz);
        // 细线覆盖率抗锯齿（phone-wire AA）：真实发径 0.07mm 远小于 1 像素，
        // 画成 >= uMinPx 像素宽、再用 alpha = 真实宽/绘制宽 交给 alpha-to-coverage，避免“毛线粗”或断成虚线
        float rootTaper = mix(0.5, 1.0, smoothstep(0.0, 0.1, aT));
        float tipTaper = 1.0 - 0.8 * smoothstep(0.55, 1.0, aT);
        float trueW = uWidth * modelScale * aW * rootTaper * tipTaper;
        float drawW = max(trueW, uMinPx * px);
        vCov = clamp(trueW / max(drawW, 1e-7), 0.0, 1.0);
        mvPosition.xyz += sd * aSide * 0.5 * drawW;
        gl_Position = projectionMatrix * mvPosition;`);
    const lights = THREE.ShaderChunk.lights_physical_pars_fragment.replace(
      /void RE_Direct_Physical\([\s\S]*?\n}\n/,
      `void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
        vec3 T = gHairT; vec3 L = directLight.direction; vec3 V = geometryViewDir; vec3 N = geometryNormal;
        float sI = clamp(dot(T, L), -0.999, 0.999), sR = clamp(dot(T, V), -0.999, 0.999);
        float thI = fastAsin(sI), thR = fastAsin(sR);
        float thH = 0.5 * (thI + thR), thD = 0.5 * (thR - thI);
        float cosD = max(1.0 - 0.5 * thD * thD, 0.2);
        vec3 Lp = L - T * sI, Vp = V - T * sR;
        float cosPhi = clamp(dot(Lp, Vp) * inversesqrt(max(dot(Lp, Lp) * dot(Vp, Vp), 1e-6)), -1.0, 1.0);
        float cosHalfPhi = sqrt(clamp(0.5 + 0.5 * cosPhi, 0.0, 1.0));
        float bR = gHairBR;
        float aR = gHairAR;
        float MR = hairGauss(thH - aR, bR);
        float MTT = hairGauss(thH + aR * 0.5, bR * 0.5);
        float MTRT = hairGauss(thH + aR * 1.5, bR * 2.0);
        float f1 = 1.0 - sqrt(clamp(0.5 + 0.5 * dot(L, V), 0.0, 1.0));
        float f2 = f1 * f1;
        float f = 0.0465 + (1.0 - 0.0465) * (f2 * f2 * f1);
        float NR = 0.25 * cosHalfPhi * f;
        vec3 Tabs = pow(max(gHairBase, vec3(1e-4)), vec3(0.72 / cosD));
        float oneMinusF2 = (1.0 - f) * (1.0 - f);
        vec3 NTT = oneMinusF2 * Tabs * exp(-3.65 * cosPhi - 3.98);
        vec3 NTRT = oneMinusF2 * f * Tabs * Tabs * exp(17.0 * cosPhi - 16.78);
        vec3 spec = gHairSV * vec3(MR * NR * uGainR) + MTT * NTT * uGainTT + MTRT * NTRT * uGainTRT;
        float kd = sqrt(max(0.0, 1.0 - sI * sI));
        float vol = clamp((dot(N, L) + 0.35) * 0.74, 0.0, 1.0);
        vec3 diff = BRDF_Lambert(material.diffuseColor) * kd * mix(0.14, 0.82, vol) * uGainD;
        reflectedLight.directDiffuse += directLight.color * diff;
        reflectedLight.directSpecular += directLight.color * spec * mix(0.68, 1.0, gHairAO) * vol * 0.45;
      }
`);
    s.fragmentShader = s.fragmentShader
      .replace('#include <common>', `#include <common>
        uniform float uGainR, uGainTT, uGainTRT, uGainD, uAlphaR, uBetaR, uColorVar, uTipLighten;
        uniform float uHairOmbreMix; uniform vec3 uHairTipColor;
        varying vec3 vHT; varying float vT, vRand, vAO, vCov, vW;
        uniform float uCovGain, uMinAlpha;
        vec3 gHairT = vec3(0.0, 1.0, 0.0); vec3 gHairBase = vec3(0.03); float gHairAO = 1.0;
        float gHairBR = 0.085; float gHairAR = -0.07; float gHairSV = 1.0;
        float fastAsin(float x) { float x2 = x * x; return x * (1.0 + x2 * (0.16667 + 0.075 * x2)); }
        float hairGauss(float x, float b) { return exp(-x * x / (2.0 * b * b)) / (2.5066283 * b); }`)
      .replace('#include <lights_physical_pars_fragment>', lights)
      .replace('#include <color_fragment>', `#include <color_fragment>
        diffuseColor.rgb = mix(diffuseColor.rgb, uHairTipColor * 0.18, smoothstep(0.32, 0.92, vT) * clamp(uHairOmbreMix, 0.0, 1.0));
        diffuseColor.rgb *= (1.0 - uColorVar * 0.5 + uColorVar * vRand) * (1.0 + uTipLighten * vT * vT);
        gHairBase = diffuseColor.rgb;
        gHairAO = vAO;
        gHairBR = uBetaR * (0.8 + 0.4 * fract(vRand * 7.31));
        gHairAR = uAlphaR + (fract(vRand * 13.7) - 0.5) * 0.12 + sin(vT * 23.0 + vRand * 61.0) * 0.035;
        gHairSV = 0.25 + 1.5 * fract(vRand * 3.97);
        diffuseColor.rgb *= mix(0.65, 1.0, vAO);
        // 覆盖率 + 随机抖动（MSAA 只有 4 个样本，alpha < 1/8 会直接消失；抖动让期望值正确）
        float hcov = fract(sin(dot(gl_FragCoord.xy + vRand * 97.0, vec2(12.9898, 78.233))) * 43758.5453);
        // 发量主体基本不透明（真实头发是几十层叠在一起的），只有发梢、飞发、绒毛才半透明
        float aBody = max(vCov * uCovGain, uMinAlpha);
        float tipFade = 1.0 - 0.7 * smoothstep(0.7, 1.0, vT);
        float thin = vW < 0.6 ? 0.55 : 1.0;
        diffuseColor.a = clamp(aBody * tipFade * thin + (hcov - 0.5) * 0.12, 0.0, 1.0);`)
      .replace('#include <normal_fragment_begin>', `#include <normal_fragment_begin>
        normal = normalize(vNormal);
        gHairT = normalize(vHT);`);
  };
  mat.customProgramCacheKey = () => 'photoreal-strand-hair-v2';
  return mat;
}

export function setStrandParams(mat, p) {
  const u = mat.userData.strandUniforms; if (!u) return;
  if (p.color) mat.color.setRGB(...p.color);
  if (p.gainR != null) u.uGainR.value = p.gainR;
  if (p.gainTT != null) u.uGainTT.value = p.gainTT;
  if (p.gainTRT != null) u.uGainTRT.value = p.gainTRT;
  if (p.minPx != null) u.uMinPx.value = p.minPx;
  if (p.pxScale != null) u.uPxScale.value = p.pxScale;
  if (p.covGain != null) u.uCovGain.value = p.covGain;
}

/** 发片每个顶点到头皮的距离（用于发丝模式下只保留贴头皮的发片底衬）。超出搜索范围记为 1。 */
export function scalpDistanceAttribute(geom, matrix, headSoup) {
  if (!headSoup._triGrid) headSoup._triGrid = new TriGrid(headSoup.P, 0.01);
  const head = headSoup._triGrid;
  const q = { t: -1, d2: 0, x: 0, y: 0, z: 0, u: 0, v: 0, w: 0 };
  const pos = geom.attributes.position; const out = new Float32Array(pos.count); const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i).applyMatrix4(matrix);
    out[i] = head.closest(v.x, v.y, v.z, q, 2) ? Math.sqrt(q.d2) : 1;
  }
  geom.setAttribute('aScalpD', new THREE.BufferAttribute(out, 1));
}
