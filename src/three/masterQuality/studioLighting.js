// 画质提升 · 摄影棚布光（独立模块，不依赖主项目）
// 思路：真实感 = 真实的光源形状 + 柔和但有方向的阴影 + 眼睛/皮肤里能看到的柔光箱反射。
//  1) 用一个只供 PMREM 烘焙的“虚拟摄影棚”场景（发光柔光箱 / 反光板 / 轮廓灯条）生成 IBL 环境贴图，
//     这样皮肤高光与眼神光是“矩形柔光箱”而不是 CG 点光源的小亮点。该场景不会出现在画面里。
//  2) 再放一盏与主柔光箱同方向的方向光，负责投射柔和阴影（头发→额头、鼻影、下巴影）。
import * as THREE from 'three';

export const LIGHT_PRESETS = {
  softbox: {
    label: '摄影棚柔光',
    exposure: 0.85,
    key: { dir: [-0.55, 0.42, 0.72], color: 0xfff4ea, intensity: 2.6, size: 1.35 },
    fill: { dir: [0.85, 0.05, 0.55], color: 0xe9eef7, intensity: 0.08 },
    rim: [{ dir: [0.7, 0.35, -0.65], color: 0xfff1e2, intensity: 1.15 }, { dir: [-0.75, 0.25, -0.6], color: 0xdfe8ff, intensity: 0.65 }],
    top: 0.2, floor: [0.16, 0.13, 0.11],
    envIntensity: 0.38,
    backdrop: ['#8c8580', '#3f3b39'],
  },
  window: {
    label: '窗边自然光',
    exposure: 1.08,
    key: { dir: [0.85, 0.32, 0.42], color: 0xfff1e0, intensity: 2.9, size: 1.9 },
    fill: { dir: [-0.8, 0.1, 0.6], color: 0xf1e6da, intensity: 0.42 },
    rim: [{ dir: [-0.5, 0.4, -0.8], color: 0xffe9d2, intensity: 0.55 }],
    top: 0.42, floor: [0.36, 0.30, 0.25],
    envIntensity: 1.0,
    backdrop: ['#d9cdbf', '#9a8b7c'],
  },
  rembrandt: {
    label: '伦勃朗侧光（强明暗）',
    exposure: 0.95,
    key: { dir: [-0.78, 0.55, 0.32], color: 0xffe8d0, intensity: 3.2, size: 0.9 },
    fill: { dir: [0.9, 0.0, 0.4], color: 0xd6deea, intensity: 0.1 },
    rim: [{ dir: [0.65, 0.4, -0.7], color: 0xfff0e0, intensity: 0.9 }],
    top: 0.1, floor: [0.08, 0.07, 0.06],
    envIntensity: 0.55,
    backdrop: ['#3a3634', '#121111'],
  },
  overcast: {
    label: '阴天柔光',
    exposure: 1.12,
    key: { dir: [0.15, 0.55, 0.85], color: 0xf4f6ff, intensity: 1.55, size: 2.4 },
    fill: { dir: [-0.6, 0.0, 0.8], color: 0xf2f0ee, intensity: 0.5 },
    rim: [{ dir: [0.6, 0.6, -0.5], color: 0xffffff, intensity: 0.75 }],
    top: 0.55, floor: [0.30, 0.29, 0.28],
    envIntensity: 1.15,
    backdrop: ['#b8b4b0', '#6d6a68'],
  },
  goldenBack: {
    label: '暖阳逆光 · 金色轮廓（参考图3）',
    exposure: 0.92,
    key: { dir: [-0.35, 0.38, -0.75], color: 0xffc98a, intensity: 3.4, size: 0.8 },
    fill: { dir: [0.4, 0.1, 0.9], color: 0xffe2c4, intensity: 0.28 },
    rim: [{ dir: [-0.85, 0.3, -0.45], color: 0xffb46b, intensity: 2.4 }, { dir: [0.75, 0.25, -0.6], color: 0xffd9a8, intensity: 0.9 }],
    top: 0.12, floor: [0.22, 0.14, 0.08],
    envIntensity: 0.5,
    backdrop: ['#6b4a2c', '#120c08'],
    haze: 0.35,
  },
  windowGobo: {
    label: '窗格斜射光斑（参考图2）',
    exposure: 1.0,
    key: { dir: [0.72, 0.42, 0.55], color: 0xfff0d6, intensity: 3.6, size: 0.55 },
    fill: { dir: [-0.8, 0.05, 0.6], color: 0x9fb3c6, intensity: 0.22 },
    rim: [{ dir: [-0.6, 0.3, -0.75], color: 0xbcd0e6, intensity: 0.35 }],
    top: 0.18, floor: [0.12, 0.13, 0.15],
    envIntensity: 0.45,
    backdrop: ['#5d6f78', '#1f2a30'],
    gobo: 'window',
  },
  leafDapple: {
    label: '树影光斑 · 午后',
    exposure: 1.0,
    key: { dir: [0.55, 0.62, 0.55], color: 0xfff1d2, intensity: 3.3, size: 0.6 },
    fill: { dir: [-0.7, 0.1, 0.7], color: 0xcfe0c8, intensity: 0.3 },
    rim: [{ dir: [-0.5, 0.4, -0.8], color: 0xfff0d0, intensity: 0.6 }],
    top: 0.3, floor: [0.18, 0.2, 0.14],
    envIntensity: 0.6,
    backdrop: ['#7f8a6e', '#2a2f24'],
    gobo: 'leaf',
  },
  indoorDay: {
    label: '室内柔和日光（参考图1）',
    exposure: 0.9,
    key: { dir: [-0.72, 0.32, 0.6], color: 0xfff3e8, intensity: 2.4, size: 1.8 },
    fill: { dir: [0.8, 0.05, 0.6], color: 0xf3ece4, intensity: 0.22 },
    rim: [{ dir: [0.55, 0.35, -0.75], color: 0xfff4ea, intensity: 0.5 }],
    top: 0.35, floor: [0.3, 0.26, 0.22],
    envIntensity: 0.7,
    backdrop: ['#e6ddd2', '#a8998a'],
  },
  butterfly: {
    label: '蝴蝶光 · 美妆棚',
    exposure: 0.95,
    key: { dir: [0.0, 0.6, 0.8], color: 0xfff8f2, intensity: 2.5, size: 1.4 },
    fill: { dir: [0.0, -0.45, 0.9], color: 0xffffff, intensity: 0.45 },
    rim: [{ dir: [0.75, 0.3, -0.6], color: 0xffffff, intensity: 0.8 }, { dir: [-0.75, 0.3, -0.6], color: 0xffffff, intensity: 0.8 }],
    top: 0.25, floor: [0.25, 0.24, 0.24],
    envIntensity: 0.6,
    backdrop: ['#c9c3bf', '#5b5654'],
  },
  cinematicTeal: {
    label: '电影感 · 冷暖对比',
    exposure: 0.9,
    key: { dir: [-0.7, 0.35, 0.6], color: 0xffd7ad, intensity: 2.8, size: 0.9 },
    fill: { dir: [0.8, 0.0, 0.5], color: 0x6f9ec4, intensity: 0.35 },
    rim: [{ dir: [0.7, 0.35, -0.65], color: 0x86c3ff, intensity: 1.6 }],
    top: 0.08, floor: [0.05, 0.08, 0.1],
    envIntensity: 0.45,
    backdrop: ['#2c3e4a', '#0b1116'],
  },
};


function v3(a) { return new THREE.Vector3(a[0], a[1], a[2]).normalize(); }

/** 构建只用于 PMREM 的虚拟摄影棚（发光面板），返回 envMap 纹理 */
export function buildStudioEnvironment(renderer, preset) {
  const env = new THREE.Scene();
  // 深灰色棚壁，带一点暖色地面反光
  const room = new THREE.Mesh(
    new THREE.SphereGeometry(20, 48, 24),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: { top: { value: preset.top }, floor: { value: new THREE.Vector3(...preset.floor) } },
      vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
      fragmentShader: `uniform float top; uniform vec3 floor; varying vec3 vP;
        void main(){ float h = vP.y; vec3 wall = vec3(0.055,0.052,0.05);
          vec3 c = mix(floor, wall, smoothstep(-0.35, 0.05, h));
          c = mix(c, vec3(top), smoothstep(0.55, 0.98, h));
          gl_FragColor = vec4(c,1.0);} `,
    }),
  );
  env.add(room);
  const panel = (dir, color, intensity, w, h, dist = 9) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.DoubleSide }),
    );
    const d = v3(dir);
    m.position.copy(d.multiplyScalar(dist));
    m.lookAt(0, 0, 0);
    env.add(m);
    return m;
  };
  const k = preset.key;
  // 主柔光箱：大面积矩形 + 外圈柔边（模拟柔光布衰减）
  panel(k.dir, k.color, 7.5 * (k.intensity / 2.4), 4.2 * k.size, 5.6 * k.size, 9);
  panel(k.dir, k.color, 1.6 * (k.intensity / 2.4), 6.4 * k.size, 7.8 * k.size, 9.4);
  // 补光反光板（大、暗、偏冷）
  panel(preset.fill.dir, preset.fill.color, 3.2 * preset.fill.intensity / 0.33 * 0.33, 6, 7, 9);
  // 轮廓灯条（窄长条）
  for (const r of preset.rim) panel(r.dir, r.color, 9 * r.intensity, 1.0, 7.5, 9);
  // 顶部柔光
  panel([0, 1, 0.15], 0xffffff, 2.2 * preset.top, 6, 6, 9);

  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(env, 0.02);
  pmrem.dispose();
  env.traverse((o) => { o.geometry?.dispose?.(); o.material?.dispose?.(); });
  return rt.texture;
}

/** 色温(K) → 线性 RGB 近似（Tanner Helland 拟合） */
export function kelvinToRGB(k) {
  const t = k / 100; let r, g, b;
  if (t <= 66) { r = 255; g = 99.4708025861 * Math.log(t) - 161.1195681661; b = t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307; }
  else { r = 329.698727446 * Math.pow(t - 60, -0.1332047592); g = 288.1221695283 * Math.pow(t - 60, -0.0755148492); b = 255; }
  const c = (v) => Math.min(255, Math.max(0, v)) / 255;
  return new THREE.Color(c(r), c(g), c(b));
}

const GOBO_LAYER = 5;
function leafTexture() {
  const S = 256; const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d'); g.clearRect(0, 0, S, S);
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  g.fillStyle = '#fff';
  for (let i = 0; i < 70; i++) {
    const x = rnd() * S, y = rnd() * S, rx = 6 + rnd() * 16, ry = 3 + rnd() * 8;
    g.save(); g.translate(x, y); g.rotate(rnd() * Math.PI); g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.fill(); g.restore();
  }
  // 枝条
  g.strokeStyle = '#fff'; g.lineWidth = 3;
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(rnd() * S, 0); g.quadraticCurveTo(rnd() * S, rnd() * S, rnd() * S, S); g.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1.6, 1.6);
  return t;
}
/** 只进阴影图、不进主画面（单独 layer）的遮光板：窗格 / 树叶 */
function buildGobo(type) {
  const g = new THREE.Group(); g.name = 'Gobo_' + type;
  const mat = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
  if (type === 'window') {
    const bar = (w, h, x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.004), mat); m.position.set(x, y, 0); g.add(m); };
    // 窗框（大外框留出两格玻璃 + 横档），斜放形成参考图那样的斜切光斑
    for (const x of [-0.25, -0.075, 0.1, 0.27]) bar(0.016, 0.9, x, 0);
    for (const y of [-0.16, 0.02, 0.2]) bar(0.9, 0.014, 0, y);
    bar(0.9, 0.5, 0, 0.48); bar(0.9, 0.5, 0, -0.48); bar(0.3, 0.9, -0.45, 0); bar(0.3, 0.9, 0.45, 0);
    g.rotation.z = 0.42;
  } else {
    const t = leafTexture();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), new THREE.MeshBasicMaterial({ map: t, alphaMap: t, alphaTest: 0.5, transparent: false, side: THREE.DoubleSide }));
    g.add(m);
  }
  g.traverse((o) => { o.layers.set(GOBO_LAYER); o.castShadow = true; o.receiveShadow = false; });
  return g;
}

/** 在主场景中布置直射光（带柔和阴影）。apply(id, overrides) 可叠加用户调节 */
export function createStudioRig(scene, renderer, presetId = 'softbox', opts = {}) {
  const group = new THREE.Group();
  group.name = 'PhotorealStudioRig';
  scene.add(group);
  const radius = opts.radius ?? 1.2;

  const key = new THREE.DirectionalLight(0xffffff, 1);
  key.castShadow = true;
  key.shadow.mapSize.set(opts.shadowMapSize ?? 2048, opts.shadowMapSize ?? 2048);
  key.shadow.bias = -0.00012;
  key.shadow.normalBias = 0.0012;
  key.shadow.radius = 6;
  key.shadow.blurSamples = 16;
  const sc = key.shadow.camera;
  sc.left = -0.26; sc.right = 0.26; sc.top = 0.3; sc.bottom = -0.3; sc.near = 0.1; sc.far = 3.0;
  sc.layers.enable(GOBO_LAYER);
  group.add(key, key.target);

  const rims = [new THREE.DirectionalLight(), new THREE.DirectionalLight()];
  rims.forEach((r) => group.add(r, r.target));
  const fill = new THREE.DirectionalLight();
  group.add(fill, fill.target);
  const gobos = { window: buildGobo('window'), leaf: buildGobo('leaf') };
  Object.values(gobos).forEach((g) => { g.visible = false; group.add(g); });

  let envTex = null; let lastEnvKey = '';
  let current = null;
  function apply(id, ov = {}, o2 = {}) {
    const base = LIGHT_PRESETS[id] || LIGHT_PRESETS.softbox;
    const p = JSON.parse(JSON.stringify(base));
    // —— 用户叠加：主光方位/仰角偏移、强度、软硬、色温、轮廓、补光、环境 ——
    const d = v3(p.key.dir);
    let az = Math.atan2(d.x, d.z), el = Math.asin(THREE.MathUtils.clamp(d.y, -1, 1));
    az += THREE.MathUtils.degToRad(ov.azimuth || 0);
    el = THREE.MathUtils.clamp(el + THREE.MathUtils.degToRad(ov.elevation || 0), -0.3, 1.45);
    p.key.dir = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];
    p.key.intensity *= ov.keyMul ?? 1;
    p.key.size *= ov.softMul ?? 1;
    if (ov.kelvin) { const k = kelvinToRGB(ov.kelvin); p.key.color = new THREE.Color(p.key.color).lerp(k, 0.85).getHex(); }
    p.rim.forEach((r) => { r.intensity *= ov.rimMul ?? 1; });
    p.fill.intensity *= ov.fillMul ?? 1;
    p.envIntensity *= ov.envMul ?? 1;
    if (ov.gobo && ov.gobo !== 'preset') p.gobo = ov.gobo === 'none' ? null : ov.gobo;

    key.position.copy(v3(p.key.dir).multiplyScalar(radius));
    key.color.set(p.key.color);
    key.intensity = p.key.intensity;
    key.shadow.radius = 2 + 5 * p.key.size;
    fill.position.copy(v3(p.fill.dir).multiplyScalar(radius));
    fill.color.set(p.fill.color);
    fill.intensity = p.fill.intensity;
    rims.forEach((r, i) => {
      const rd = p.rim[i];
      r.visible = !!rd;
      if (!rd) return;
      r.position.copy(v3(rd.dir).multiplyScalar(radius));
      r.color.set(rd.color);
      r.intensity = rd.intensity;
    });
    for (const [k, g] of Object.entries(gobos)) {
      g.visible = p.gobo === k;
      if (g.visible) {
        g.position.copy(v3(p.key.dir).multiplyScalar(0.42 * (ov.goboDist ?? 1)));
        g.lookAt(key.position);
        g.rotateZ(k === 'window' ? 0.42 : 0);
        const s = ov.goboScale ?? 1; g.scale.setScalar(s);
      }
    }
    if (p.gobo) key.shadow.radius = Math.min(key.shadow.radius, 2 + 3 * (ov.goboSoft ?? 0.5));
    key.shadow.radius *= ov.shadowSoft ?? 1;                // 阴影柔和度（效果总线可调）
    if ('intensity' in key.shadow) key.shadow.intensity = ov.shadowStrength ?? 1; // 阴影浓度（真实室内有大量反弹光，阴影不会死黑）
    // 环境贴图只在相关参数变化时重烘焙（避免拖动滑杆时卡顿）
    const envKey = JSON.stringify([id, p.key.dir.map((v) => v.toFixed(2)), p.key.color, p.key.intensity.toFixed(2), p.key.size.toFixed(2), p.rim.map((r) => r.intensity.toFixed(2)), p.fill.intensity.toFixed(2)]);
    if (envKey !== lastEnvKey && (!o2.skipEnv || !envTex)) {
      if (envTex) envTex.dispose();
      envTex = buildStudioEnvironment(renderer, p);
      lastEnvKey = envKey;
    }
    scene.environment = envTex;
    scene.environmentIntensity = p.envIntensity;
    renderer.toneMappingExposure = p.exposure * (ov.exposureMul ?? 1);
    renderer.shadowMap.needsUpdate = true;
    current = p;
    return p;
  }
  apply(presetId);
  return { group, key, fill, rims, gobos, apply, get preset() { return current; } };
}

/** 摄影背景：柔和渐变（影棚）或屏幕空间虚化环境图（随相机方位轻微视差） */
export function createBackdrop(scene, colors) {
  const mat = new THREE.ShaderMaterial({
    depthWrite: false,
    side: THREE.BackSide,
    uniforms: {
      cA: { value: new THREE.Color(colors[0]) }, cB: { value: new THREE.Color(colors[1]) },
      tBg: { value: null }, uUseTex: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uPar: { value: new THREE.Vector2() }, uBright: { value: 1 },
    },
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.0); gl_Position = p.xyww; }',
    fragmentShader: `uniform vec3 cA; uniform vec3 cB; uniform sampler2D tBg; uniform float uUseTex, uBright; uniform vec2 uRes, uPar; varying vec3 vP;
      void main(){
        vec3 c;
        if (uUseTex > 0.5) {
          vec2 uv = gl_FragCoord.xy / uRes;
          uv = (uv - 0.5) * 0.78 + 0.5 + uPar;
          c = texture2D(tBg, clamp(uv, 0.002, 0.998)).rgb * uBright;
        } else {
          vec3 d = normalize(vP); float spot = smoothstep(1.15, 0.0, length(vec2(d.x*1.1, d.y*1.35 - 0.05) / max(0.2, -d.z+0.6)));
          c = mix(cB, cA, spot);
        }
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
  const m = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), mat);
  m.frustumCulled = false;
  m.renderOrder = -10;
  m.name = 'PhotoBackdrop';
  scene.add(m);
  return {
    mesh: m, mat,
    set(c) { mat.uniforms.cA.value.set(c[0]); mat.uniforms.cB.value.set(c[1]); },
    setTexture(tex, bright = 1) { mat.uniforms.tBg.value = tex; mat.uniforms.uUseTex.value = tex ? 1 : 0; mat.uniforms.uBright.value = bright; },
    update(renderer, camera) {
      const sz = renderer.getDrawingBufferSize(mat.uniforms.uRes.value);
      const az = Math.atan2(camera.position.x, camera.position.z); const el = Math.atan2(camera.position.y, Math.hypot(camera.position.x, camera.position.z));
      mat.uniforms.uPar.value.set(-az * 0.09, el * 0.12);
      return sz;
    },
  };
}
