import * as THREE from 'three';

/**
 * Stage 28 · 唯美老照片丁达尔体积光束 (Volumetric Tyndall God-Rays) + 暖金胶片浮尘 (Bokeh Dust) + 工坊背幕光晕
 * - 零外部资源，纯 GLSL 体积光帷幕与程序化 Canvas 纹理
 * - 加色混合 + 关闭深度写入：营造诗意老照片斜阳/窗光丁达尔效应，永不遮挡头模/断面
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
  g.addColorStop(0, 'rgba(255,250,238,1)');
  g.addColorStop(0.32, 'rgba(255,236,200,0.68)');
  g.addColorStop(0.68, 'rgba(245,214,170,0.18)');
  g.addColorStop(1, 'rgba(245,214,170,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  _dustSpriteCache = tex;
  return tex;
}

const DUST_PALETTE = ['#fff3d6', '#ffe4b8', '#f7e7ce', '#e6eefc', '#ffd9c2'];

function buildDustLayer({ count, size, opacity, bounds, seed }) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const base = new Float32Array(count * 3);
  const phase = new Float32Array(count * 2);
  const color = new THREE.Color();
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
    // Boost brightness for dust motes along the diagonal Tyndall light path
    const inBeam = Math.exp(-Math.pow((x * 0.65 - y * 0.85 - 6.0) / 28.0, 2.0));
    const dim = (0.48 + rnd() * 0.52) * (0.72 + 0.65 * inBeam);
    colors[i * 3] = Math.min(1, color.r * dim);
    colors[i * 3 + 1] = Math.min(1, color.g * dim);
    colors[i * 3 + 2] = Math.min(1, color.b * dim);
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
 * 构建 3D 丁达尔体积光束帷幕 (Volumetric Tyndall Light Shafts)
 * 斜射穿过书房上空与头模周遭，呈现唯美老照片的空气感与光束感
 */
function buildTyndallLightShafts() {
  const group = new THREE.Group();
  group.name = 'TyndallLightShaftsGroup';

  const uniforms = {
    uTime: { value: 0 },
    uIntensity: { value: 0.82 },
    uBeamColor: { value: new THREE.Color('#ffebd2') },
    uBeamAngle: { value: -0.58 },
  };

  const shaftMat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform float uIntensity;
      uniform vec3 uBeamColor;
      uniform float uBeamAngle;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        // Rotate UV to create diagonal volumetric light shafts from upper window
        vec2 p = vUv - vec2(0.58, 0.72);
        float c = cos(uBeamAngle);
        float s = sin(uBeamAngle);
        vec2 rot = vec2(p.x * c - p.y * s, p.x * s + p.y * c);

        // Multi-ray window slat interference pattern (Tyndall shafts)
        float ray1 = exp(-pow((rot.x + 0.14) * 5.8, 2.0));
        float ray2 = exp(-pow((rot.x - 0.02) * 4.4, 2.0)) * 0.92;
        float ray3 = exp(-pow((rot.x - 0.19) * 6.5, 2.0)) * 0.76;
        float ray4 = exp(-pow((rot.x + 0.29) * 8.2, 2.0)) * 0.52;
        float fineSlats = 0.78 + 0.22 * sin(rot.x * 46.0 + sin(uTime * 0.25) * 0.4);

        // Longitudinal attenuation from upper window source down to desk
        float along = clamp(1.0 - (0.72 - vUv.y) * 0.92, 0.0, 1.0);
        float topSoft = smoothstep(0.99, 0.82, vUv.y);
        float bottomSoft = smoothstep(0.01, 0.26, vUv.y);
        float edgeMask = smoothstep(0.02, 0.22, vUv.x) * smoothstep(0.98, 0.78, vUv.x);

        float alpha = (ray1 + ray2 + ray3 + ray4) * fineSlats * along * topSoft * bottomSoft * edgeMask;
        alpha *= 0.105 * uIntensity;

        gl_FragColor = vec4(uBeamColor, clamp(alpha, 0.0, 0.36));
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  // 3 layered depth curtains for true 3D parallax volumetric depth (never occluding heads)
  const depths = [
    { z: -32, w: 138, h: 78, scaleI: 1.0 },
    { z: -18, w: 124, h: 72, scaleI: 0.72 },
    { z: -6,  w: 112, h: 66, scaleI: 0.45 },
  ];
  depths.forEach((d, idx) => {
    const planeGeo = new THREE.PlaneGeometry(d.w, d.h);
    const mat = idx === 0 ? shaftMat : shaftMat.clone();
    mat.uniforms.uIntensity = uniforms.uIntensity;
    mat.uniforms.uBeamColor = uniforms.uBeamColor;
    mat.uniforms.uBeamAngle = uniforms.uBeamAngle;
    mat.uniforms.uTime = uniforms.uTime;
    const mesh = new THREE.Mesh(planeGeo, mat);
    mesh.position.set(0, 2, d.z);
    mesh.renderOrder = 4;
    mesh.raycast = () => {}; // Never intercept mouse clicks!
    group.add(mesh);
  });

  group.userData.uniforms = uniforms;
  return group;
}

/**
 * 创建多层呼吸尘埃 + 丁达尔体积光束。返回 { group, update(dt, elapsed), setTyndallConfig(cfg) }。
 */
export function createBokehDust(options = {}) {
  const rawBounds = options.bounds || { x: [-58, 58], y: [-30, 30], z: [-95, -4] };
  const bounds = {
    x: rawBounds.x,
    y: rawBounds.y,
    z: [rawBounds.z[0], Math.min(-6, rawBounds.z[1])],
  };
  const group = new THREE.Group();
  group.name = 'BokehDustAtmosphere';

  const tyndallGroup = buildTyndallLightShafts();
  group.add(tyndallGroup);

  const layers = [
    buildDustLayer({ count: options.far ?? 130, size: options.farSize ?? 1.55, opacity: 0.24, bounds, seed: 1234567 }),
    buildDustLayer({ count: options.mid ?? 85, size: options.midSize ?? 2.25, opacity: 0.19, bounds, seed: 7654321 }),
    buildDustLayer({ count: options.near ?? 36, size: options.nearSize ?? 3.10, opacity: 0.14, bounds, seed: 2468135 }),
  ];
  for (const layer of layers) {
    layer.points.raycast = () => {};
    group.add(layer.points);
  }

  function update(_dt, elapsed) {
    if (tyndallGroup.userData.uniforms) {
      tyndallGroup.userData.uniforms.uTime.value = elapsed;
    }
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

  function setTyndallConfig(cfg = {}) {
    const u = tyndallGroup.userData.uniforms;
    if (!u) return;
    if (cfg.intensity !== undefined) {
      u.uIntensity.value = Math.max(0, Math.min(2.0, Number(cfg.intensity)));
      tyndallGroup.visible = u.uIntensity.value > 0.01;
    }
    if (cfg.color) {
      u.uBeamColor.value.set(cfg.color);
    }
    if (cfg.azimuthDeg !== undefined) {
      const az = Number(cfg.azimuthDeg) || 44;
      u.uBeamAngle.value = THREE.MathUtils.degToRad(az >= 0 ? -32 : 32);
    }
  }

  return { group, tyndallGroup, update, setTyndallConfig };
}

let _backdropCache = null;
/**
 * 工坊背幕光晕：头模身后的柔和复古暖金/冷银径向辉光盘，增强纵深与唯美感。
 */
export function createStudioBackdrop(width = 150, height = 110) {
  if (!_backdropCache) {
    const w = 256;
    const h = 192;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    const g = ctx.createRadialGradient(w * 0.54, h * 0.42, 8, w * 0.50, h * 0.46, w * 0.54);
    g.addColorStop(0, 'rgba(255,232,198,0.48)');
    g.addColorStop(0.42, 'rgba(218,188,152,0.22)');
    g.addColorStop(0.75, 'rgba(130,115,105,0.08)');
    g.addColorStop(1, 'rgba(90,80,75,0)');
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
    opacity: 0.88,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'StudioBackdropGlow';
  mesh.renderOrder = -5;
  return mesh;
}
