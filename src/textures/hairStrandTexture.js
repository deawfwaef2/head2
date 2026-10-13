import * as THREE from 'three';

/**
 * Stage 10 · 程序化高清发丝纹理（全自动发质重制）
 *
 * 根因：8 款 GLB 内嵌发丝贴图仅 256×256，且烘焙成灰糊一团——任何材质参数都救不了
 * 一张糊贴图。本模块在运行时把 GLB 贴图升级为 1024² 脆发丝：
 *   - RGB：~1050 根程序化发丝（束明暗 + 挑染闪丝 + 发根分区 + 缕块带），
 *     叠乘 GLB 原图明暗（保留发型师烘焙的缕块体积感），灰度中性以便 displayColor 染色；
 *   - Alpha：沿用 GLB 镂空（平滑收紧），由 alphaTest + alphaToCoverage 做脆边；
 *   - Roughness：同循环配准生成，发丝间粗糙起伏（束感第二来源）。
 * 按发型 id 单例缓存，多颗头共用。
 */

const _cache = new Map();

function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function paintStrandBase(ctx, S, seed) {
  const rnd = mulberry32(seed);
  // 中性灰底（发根深 → 发干亮 → 发梢收）
  const base = ctx.createLinearGradient(0, 0, 0, S);
  base.addColorStop(0.0, '#8d8883');
  base.addColorStop(0.18, '#b3aca6');
  base.addColorStop(0.75, '#bab3ab');
  base.addColorStop(1.0, '#9d9791');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, S, S);
  // 缕块明暗带（发缕体积感）
  const bands = 7 + Math.floor(rnd() * 3);
  for (let b = 0; b < bands; b++) {
    const y0 = ((b + rnd() * 0.6) / bands) * S;
    const h = (S / bands) * (0.35 + rnd() * 0.5);
    const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(0.5, rnd() < 0.55 ? 'rgba(22,17,15,0.17)' : 'rgba(255,250,244,0.10)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, y0, S, h);
  }
  // ~1050 根发丝
  const N = 1050;
  for (let i = 0; i < N; i++) {
    const x = ((i + rnd() * 0.9) / N) * S;
    const w = 0.8 + rnd() * 1.9;
    const glint = rnd() < 0.05;
    let c;
    let a;
    if (glint) {
      c = 232 + Math.floor(rnd() * 22);
      a = 0.5 + rnd() * 0.3;
    } else if (rnd() < 0.48) {
      c = 84 + Math.floor(rnd() * 44);
      a = 0.35 + rnd() * 0.35;
    } else {
      c = 148 + Math.floor(rnd() * 58);
      a = 0.3 + rnd() * 0.35;
    }
    const wob = 2 + rnd() * 7;
    const ph = rnd() * Math.PI * 2;
    const ph2 = rnd() * Math.PI * 2;
    ctx.strokeStyle = `rgba(${c},${Math.max(0, c - 5)},${Math.max(0, c - 9)},${a.toFixed(2)})`;
    ctx.lineWidth = w;
    ctx.beginPath();
    const segs = 8;
    for (let s2 = 0; s2 <= segs; s2++) {
      const y = (s2 / segs) * S;
      const xx =
        x +
        Math.sin(ph + s2 * 1.1) * wob * (0.3 + (0.7 * s2) / segs) +
        Math.sin(ph2 + s2 * 2.3) * 1.2;
      if (s2) ctx.lineTo(xx, y);
      else ctx.moveTo(xx, y);
    }
    ctx.stroke();
  }
  // 顶部发根分区阴影（头顶深度）
  const rg = ctx.createLinearGradient(0, 0, 0, S * 0.1);
  rg.addColorStop(0, 'rgba(12,8,8,0.55)');
  rg.addColorStop(1, 'rgba(12,8,8,0)');
  ctx.fillStyle = rg;
  ctx.fillRect(0, 0, S, S * 0.1);
}

export function getHairStrandTextures(styleId, glbImage) {
  const key = styleId || 'custom';
  if (_cache.has(key)) return _cache.get(key);

  const S = 1024;
  // 1) GLB 原图放大取明暗 + alpha
  const gl = document.createElement('canvas');
  gl.width = S;
  gl.height = S;
  const gctx = gl.getContext('2d', { willReadFrequently: true });
  gctx.drawImage(glbImage, 0, 0, S, S);
  const gdata = gctx.getImageData(0, 0, S, S).data;

  // 2) 程序化发丝底
  const c = document.createElement('canvas');
  c.width = S;
  c.height = S;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  paintStrandBase(ctx, S, hashStr('strand|' + key));

  // 3) 同循环配准：RGB 叠乘 GLB 明暗、alpha 收紧、roughness 派生
  const img = ctx.getImageData(0, 0, S, S);
  const d = img.data;
  const rc = document.createElement('canvas');
  rc.width = S;
  rc.height = S;
  const rctx = rc.getContext('2d');
  const rimg = rctx.createImageData(S, S);
  const rd = rimg.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = (0.299 * gdata[i] + 0.587 * gdata[i + 1] + 0.114 * gdata[i + 2]) / 255;
    const m = 0.42 + 0.58 * Math.min(1, lum * 1.35);
    const r = d[i] * m;
    const g = d[i + 1] * m;
    const b = d[i + 2] * m;
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
    let a = gdata[i + 3] / 255;
    a = Math.min(1, Math.max(0, (a - 0.16) / 0.3));
    a = a * a * (3 - 2 * a);
    d[i + 3] = a * 255;
    // 粗糙：亮丝滑（低粗糙）暗缝糙（高粗糙），发丝间起伏
    const sl = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    const rough = Math.min(205, Math.max(80, 168 - (sl - 0.42) * 210));
    rd[i] = rough;
    rd[i + 1] = rough;
    rd[i + 2] = rough;
    rd[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  rctx.putImageData(rimg, 0, 0);

  const map = new THREE.CanvasTexture(c);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.ClampToEdgeWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  map.anisotropy = 8;
  map.needsUpdate = true;

  const roughnessMap = new THREE.CanvasTexture(rc);
  roughnessMap.wrapS = THREE.ClampToEdgeWrapping;
  roughnessMap.wrapT = THREE.ClampToEdgeWrapping;
  roughnessMap.anisotropy = 4;
  roughnessMap.needsUpdate = true;

  const out = { map, roughnessMap };
  _cache.set(key, out);
  return out;
}
