// 安全版 · MPFB2 雕刻面部形变叠加（骨相预设 + 眼型细调）
// 直接改写 HeadSkin 的基础顶点（不动 morph target），睫毛/眉毛跟随最近的皮肤顶点，眼球按眼眶平均位移平移。
// 头顶/后脑（发型贴合区）做衰减，避免改脸型后头发穿模。
import * as THREE from 'three';
import { MPFB_SPARSE_HEAD_TARGETS, EAST_ASIAN_ARCHETYPE_MPFB_RECIPES } from '../data/eastAsianHeadTargets.js';

function nearestMap(geomPos, skinBase, M) {
  // M: 把部件局部坐标变到皮肤局部坐标的矩阵
  const n = geomPos.count, out = new Int32Array(n); const v = new THREE.Vector3();
  const sc = skinBase.length / 3;
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(geomPos, i).applyMatrix4(M);
    let best = 1e9, bi = 0;
    for (let j = 0; j < sc; j++) { const dx = skinBase[j * 3] - v.x, dy = skinBase[j * 3 + 1] - v.y, dz = skinBase[j * 3 + 2] - v.z; const d = dx * dx + dy * dy + dz * dz; if (d < best) { best = d; bi = j; } }
    out[i] = best < 0.012 * 0.012 ? bi : -1;
  }
  return out;
}

export function recipeWeights(archetype, strength = 1) {
  const r = EAST_ASIAN_ARCHETYPE_MPFB_RECIPES[archetype] || {};
  const w = {}; for (const [k, v] of Object.entries(r)) w[k] = v * strength; return w;
}

/**
 * @param parts { skin, lashes, brows, eyes[] }
 * @param weights { targetName: weight }
 * @param anchors { eyeY, eyeL:Vector3, eyeR:Vector3, eyeR_rad }
 */
export function applyFaceTargets(parts, weights, anchors) {
  const skin = parts.skin; if (!skin) return;
  const g = skin.geometry; const pa = g.attributes.position;
  if (!skin.userData.mpfbBase) skin.userData.mpfbBase = new Float32Array(pa.array);
  const base = skin.userData.mpfbBase; const n = pa.count;
  const D = new Float32Array(n * 3);
  for (const [k, w] of Object.entries(weights)) {
    if (!w) continue; const t = MPFB_SPARSE_HEAD_TARGETS[k]; if (!t) continue;
    const s = w * 1e-5;
    for (let i = 0; i < t.length; i += 4) { const vi = t[i]; if (vi >= n) continue; D[vi * 3] += t[i + 1] * s; D[vi * 3 + 1] += t[i + 2] * s; D[vi * 3 + 2] += t[i + 3] * s; }
  }
  // 衰减：头顶与后脑不动（发型是按原头型贴合的）
  const ss = (a, b, x) => { const q = Math.min(1, Math.max(0, (x - a) / (b - a))); return q * q * (3 - 2 * q); };
  const eyeY = anchors?.eyeY ?? 0.03; let zFront = -1e9, zBack = 1e9;
  for (let i = 0; i < n; i++) { zFront = Math.max(zFront, base[i * 3 + 2]); zBack = Math.min(zBack, base[i * 3 + 2]); }
  const zMid = (zFront + zBack) / 2;
  for (let i = 0; i < n; i++) {
    const y = base[i * 3 + 1], z = base[i * 3 + 2];
    const m = (1 - ss(eyeY + 0.04, eyeY + 0.075, y)) * ss(zMid - 0.03, zMid + 0.01, z);
    D[i * 3] *= m; D[i * 3 + 1] *= m; D[i * 3 + 2] *= m;
    pa.array[i * 3] = base[i * 3] + D[i * 3]; pa.array[i * 3 + 1] = base[i * 3 + 1] + D[i * 3 + 1]; pa.array[i * 3 + 2] = base[i * 3 + 2] + D[i * 3 + 2];
  }
  pa.needsUpdate = true; g.computeBoundingSphere(); g.computeBoundingBox();
  skin.updateWorldMatrix(true, false);
  const toSkin = (mesh) => { mesh.updateWorldMatrix(true, false); return new THREE.Matrix4().copy(skin.matrixWorld).invert().multiply(mesh.matrixWorld); };
  // 睫毛 / 眉毛：跟随最近皮肤顶点
  for (const part of [parts.lashes, parts.brows]) {
    if (!part) continue; const pg = part.geometry; const pp = pg.attributes.position;
    if (!pg.userData.mpfbBase) { pg.userData.mpfbBase = new Float32Array(pp.array); pg.userData.mpfbMap = nearestMap(pp, base, toSkin(part)); }
    const pb = pg.userData.mpfbBase, map = pg.userData.mpfbMap;
    const M = toSkin(part); const R = new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().copy(M).invert()); const v = new THREE.Vector3();
    for (let i = 0; i < pp.count; i++) {
      const j = map[i]; let dx = 0, dy = 0, dz = 0;
      if (j >= 0) { v.set(D[j * 3], D[j * 3 + 1], D[j * 3 + 2]).applyMatrix3(R); dx = v.x; dy = v.y; dz = v.z; }
      pp.array[i * 3] = pb[i * 3] + dx; pp.array[i * 3 + 1] = pb[i * 3 + 1] + dy; pp.array[i * 3 + 2] = pb[i * 3 + 2] + dz;
    }
    pp.needsUpdate = true; pg.computeBoundingSphere();
  }
  // 眼球：按眼眶附近皮肤平均位移整体平移（左右分开）
  if (anchors?.eyeL && parts.eyes?.length) {
    const avg = (c) => { let sx = 0, sy = 0, sz = 0, cnt = 0; const r = (anchors.eyeRad || 0.012) * 1.8; for (let i = 0; i < n; i++) { const dx = base[i * 3] - c.x, dy = base[i * 3 + 1] - c.y, dz = base[i * 3 + 2] - c.z; if (dx * dx + dy * dy + dz * dz < r * r) { sx += D[i * 3]; sy += D[i * 3 + 1]; sz += D[i * 3 + 2]; cnt++; } } return cnt ? [sx / cnt, sy / cnt, sz / cnt] : [0, 0, 0]; };
    const dL = avg(anchors.eyeL), dR = avg(anchors.eyeR);
    for (const e of parts.eyes) {
      const eg = e.geometry; const ep = eg.attributes.position;
      if (!eg.userData.mpfbBase) eg.userData.mpfbBase = new Float32Array(ep.array);
      const eb = eg.userData.mpfbBase;
      for (let i = 0; i < ep.count; i++) { const d = eb[i * 3] < 0 ? dL : dR; ep.array[i * 3] = eb[i * 3] + d[0]; ep.array[i * 3 + 1] = eb[i * 3 + 1] + d[1]; ep.array[i * 3 + 2] = eb[i * 3 + 2] + d[2]; }
      ep.needsUpdate = true; eg.computeBoundingSphere();
    }
    return { dL, dR };
  }
  return null;
}
