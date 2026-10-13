import * as THREE from 'three';

/**
 * Stage 13b · 唯美氛围：呼吸尘埃 (Bokeh Dust) + 工坊背幕光晕 (Studio Backdrop Glow)
 * - 全部程序化 Canvas 纹理，零外部资源，file:// 离线兼容
 * - 加色混合 + 关闭深度写入：只增氛围，永不遮挡头模/断面
 * - 每帧 CPU 更新仅数百点位移，开销可忽略；可随时开关
 */

let _dustSpriteCache = null;
function getDustSprite() {
  if (_dustSpriteCache) return _dustSpriteCache;
  const s = 64;
  const canvas = document.createElement('canvas');
  canvas.width = s;
  canvas.height = s;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.7, 'rgba(255,255,255,0.12)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  _dustSpriteCache = tex;
  return tex;
}

const DUST_PALETTE = ['#cfe8ff', '#ffe9d6', '#e6d6ff', '#ffffff', '#ffd9e6'];

function buildDustLayer({ count, size, opacity, bounds, seed }) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const base = new Float32Array(count * 3);
  const phase = new Float32Array(count * 2);
  const color = new THREE.Color();
  // 确定性伪随机：同一参数每次生成一致，避免抽帧闪烁感
  let s = seed >>> 0 || 1;
  const rnd = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = 0; i < count; i++) {
    const x = bounds.x[0] + rnd() * (bounds.x[1] - bounds.x[0]);
    const y = bounds.y[0] + rnd() * (bounds.y[1] - bounds.y[0]);
    const z = bounds.z[0] + rnd() * (bounds.z[1] - bounds.z[0]);
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    base[i * 3] = x;
    base[i * 3 + 1] = y;
    base[i * 3 + 2] = z;
    phase[i * 2] = rnd() * Math.PI * 2;
    phase[i * 2 + 1] = rnd() * Math.PI * 2;
    color.set(DUST_PALETTE[(rnd() * DUST_PALETTE.length) | 0]);
    const dim = 0.55 + rnd() * 0.45;
    colors[i * 3] = color.r * dim;
    colors[i * 3 + 1] = color.g * dim;
    colors[i * 3 + 2] = color.b * dim;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geo.boundingSphere = new THREE.Sphere(
    new THREE.Vector3(
      (bounds.x[0] + bounds.x[1]) / 2,
      (bounds.y[0] + bounds.y[1]) / 2,
      (bounds.z[0] + bounds.z[1]) / 2
    ),
    Math.hypot(bounds.x[1] - bounds.x[0], bounds.y[1] - bounds.y[0], bounds.z[1] - bounds.z[0]) / 2 + 8
  );
  const mat = new THREE.PointsMaterial({
    size,
    map: getDustSprite(),
    vertexColors: true,
    transparent: true,
    opacity,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 5;
  return { points, base, phase, count };
}

/**
 * 创建多层呼吸尘埃。返回 { group, update(dt, elapsed) }。
 * bounds: { x:[min,max], y:[min,max], z:[min,max] } 世界坐标范围
 */
export function createBokehDust(options = {}) {
  const bounds = options.bounds || { x: [-58, 58], y: [-30, 30], z: [-112, -4] };
  const group = new THREE.Group();
  group.name = 'BokehDustAtmosphere';
  const layers = [
    buildDustLayer({ count: options.far ?? 120, size: options.farSize ?? 1.7, opacity: 0.34, bounds, seed: 1234567 }),
    buildDustLayer({ count: options.mid ?? 80, size: options.midSize ?? 2.9, opacity: 0.28, bounds, seed: 7654321 }),
    buildDustLayer({ count: options.near ?? 36, size: options.nearSize ?? 4.8, opacity: 0.20, bounds, seed: 2468135 }),
  ];
  for (const layer of layers) group.add(layer.points);

  function update(_dt, elapsed) {
    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li];
      const arr = layer.points.geometry.attributes.position.array;
      const sway = 2.2 + li * 1.6;
      const rise = 1.4 + li * 0.9;
      const speed = 0.10 + li * 0.045;
      for (let i = 0; i < layer.count; i++) {
        const p1 = layer.phase[i * 2];
        const p2 = layer.phase[i * 2 + 1];
        arr[i * 3] = layer.base[i * 3] + Math.sin(elapsed * speed + p1) * sway;
        arr[i * 3 + 1] = layer.base[i * 3 + 1] + Math.sin(elapsed * speed * 1.3 + p2) * rise;
      }
      layer.points.geometry.attributes.position.needsUpdate = true;
    }
  }
  return { group, update };
}

let _backdropCache = null;
/**
 * 工坊背幕光晕：头模身后的柔和冷调径向辉光盘，增强纵深与唯美感。
 * MeshBasicMaterial（不受灯光影响，效果确定），透明边缘融入页面背景。
 */
export function createStudioBackdrop(width = 150, height = 110) {
  if (!_backdropCache) {
    const w = 256;
    const h = 192;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(w / 2, h * 0.46, 8, w / 2, h * 0.46, w * 0.52);
    g.addColorStop(0, 'rgba(148,197,255,0.55)');
    g.addColorStop(0.45, 'rgba(125,180,245,0.22)');
    g.addColorStop(0.75, 'rgba(110,150,220,0.07)');
    g.addColorStop(1, 'rgba(100,140,210,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    _backdropCache = tex;
  }
  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshBasicMaterial({
    map: _backdropCache,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'StudioBackdropGlow';
  mesh.renderOrder = -5;
  return mesh;
}
