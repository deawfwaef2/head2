// 安全版 · 摄影后期链
// RenderPass(MSAA 半浮点 HDR) → GTAO 接触阴影 → 景深(可选) → 柔和辉光 → 色调映射 → 胶片/镜头层
// 胶片/镜头层：白平衡、色调分离、胶片曲线(趾部/肩部)、褪色、晕光(Halation)、柔焦(Pro-Mist)、
//             色差、暗角、亮度相关颗粒、微对比锐化、黑白。全部可调，并提供胶片预设。
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';

export const POST_DEFAULTS = {
  ao: true, aoRadius: 0.035, aoIntensity: 0.9,
  bloom: 0.12, bloomThreshold: 0.92, bloomRadius: 0.55,
  dof: false, focus: 1.05, aperture: 0.0025, maxblur: 0.006,
  grain: 0.03, grainSize: 1.0, vignette: 0.3, chroma: 0.0010, sharpen: 0.35,
  warmth: 0.0, tint: 0.0, contrast: 1.04, saturation: 0.97, lift: 0.012, fade: 0.0,
  toe: 0.0, shoulder: 0.0, halation: 0.0, diffusion: 0.0,
  splitShadow: [0.5, 0.5, 0.5], splitHighlight: [0.5, 0.5, 0.5], splitAmount: 0.0,
  bw: 0.0,
};

// 胶片 / 风格预设（只做调色与镜头层，不改模型）
export const FILM_PRESETS = {
  clean: { label: '干净数码（无胶片）', grain: 0.012, contrast: 1.03, saturation: 0.98, warmth: 0, tint: 0, lift: 0.006, fade: 0, toe: 0, shoulder: 0, halation: 0, diffusion: 0, splitAmount: 0, bw: 0, vignette: 0.18 },
  portra400: { label: 'Kodak Portra 400 · 人像暖肤', grain: 0.035, contrast: 0.98, saturation: 0.92, warmth: 0.55, tint: 0.08, lift: 0.025, fade: 0.04, toe: 0.25, shoulder: 0.45, halation: 0.12, diffusion: 0.05, splitShadow: [0.42, 0.5, 0.56], splitHighlight: [0.62, 0.52, 0.42], splitAmount: 0.18, bw: 0, vignette: 0.28 },
  pro400h: { label: 'Fuji Pro 400H · 清透青绿', grain: 0.03, contrast: 0.96, saturation: 0.9, warmth: -0.15, tint: -0.12, lift: 0.03, fade: 0.06, toe: 0.2, shoulder: 0.5, halation: 0.06, diffusion: 0.06, splitShadow: [0.4, 0.55, 0.55], splitHighlight: [0.56, 0.54, 0.5], splitAmount: 0.2, bw: 0, vignette: 0.22 },
  cinestill800t: { label: 'CineStill 800T · 夜景红晕', grain: 0.05, contrast: 1.06, saturation: 0.95, warmth: -0.45, tint: 0.05, lift: 0.02, fade: 0.03, toe: 0.3, shoulder: 0.3, halation: 0.55, diffusion: 0.08, splitShadow: [0.36, 0.5, 0.62], splitHighlight: [0.64, 0.5, 0.4], splitAmount: 0.25, bw: 0, vignette: 0.35 },
  gold200: { label: 'Kodak Gold 200 · 怀旧金黄', grain: 0.045, contrast: 1.02, saturation: 1.05, warmth: 0.8, tint: 0.05, lift: 0.03, fade: 0.06, toe: 0.3, shoulder: 0.35, halation: 0.15, diffusion: 0.04, splitShadow: [0.48, 0.48, 0.5], splitHighlight: [0.66, 0.54, 0.36], splitAmount: 0.22, bw: 0, vignette: 0.32 },
  softMist: { label: '柔焦 Pro-Mist · 唯美人像', grain: 0.022, contrast: 0.94, saturation: 0.94, warmth: 0.25, tint: 0.06, lift: 0.035, fade: 0.05, toe: 0.15, shoulder: 0.55, halation: 0.08, diffusion: 0.45, splitShadow: [0.48, 0.5, 0.54], splitHighlight: [0.58, 0.52, 0.48], splitAmount: 0.12, bw: 0, vignette: 0.2 },
  moodyFilm: { label: '暗调胶片 · 光影情绪', grain: 0.05, contrast: 1.12, saturation: 0.86, warmth: 0.35, tint: 0.02, lift: 0.04, fade: 0.08, toe: 0.45, shoulder: 0.3, halation: 0.2, diffusion: 0.1, splitShadow: [0.4, 0.48, 0.52], splitHighlight: [0.64, 0.52, 0.4], splitAmount: 0.28, bw: 0, vignette: 0.48 },
  trix400: { label: 'Kodak Tri-X 400 · 黑白', grain: 0.07, contrast: 1.15, saturation: 1, warmth: 0, tint: 0, lift: 0.02, fade: 0.03, toe: 0.35, shoulder: 0.3, halation: 0, diffusion: 0.05, splitAmount: 0, bw: 1, vignette: 0.4 },
};

const LensFilmShader = {
  uniforms: {
    tDiffuse: { value: null },
    uRes: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 },
    uGrain: { value: 0.03 }, uGrainSize: { value: 1 },
    uVignette: { value: 0.3 }, uChroma: { value: 0.001 }, uSharpen: { value: 0.35 },
    uWarmth: { value: 0 }, uTint: { value: 0 }, uContrast: { value: 1.04 }, uSaturation: { value: 0.97 },
    uLift: { value: 0.012 }, uFade: { value: 0 }, uToe: { value: 0 }, uShoulder: { value: 0 },
    uHalation: { value: 0 }, uDiffusion: { value: 0 },
    uSplitS: { value: new THREE.Vector3(0.5, 0.5, 0.5) }, uSplitH: { value: new THREE.Vector3(0.5, 0.5, 0.5) }, uSplitAmt: { value: 0 },
    uBW: { value: 0 },
  },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);} ',
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse; uniform vec2 uRes; uniform float uTime;
    uniform float uGrain, uGrainSize, uVignette, uChroma, uSharpen, uWarmth, uTint, uContrast, uSaturation, uLift, uFade, uToe, uShoulder, uHalation, uDiffusion, uSplitAmt, uBW;
    uniform vec3 uSplitS, uSplitH;
    varying vec2 vUv;
    float hash(vec2 p){ p = fract(p*vec2(443.897,441.423)); p += dot(p, p.yx+19.19); return fract((p.x+p.y)*p.x); }
    float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
    vec3 softLight(vec3 b, vec3 s){ return mix(2.0*b*s + b*b*(1.0-2.0*s), sqrt(b)*(2.0*s-1.0) + 2.0*b*(1.0-s), step(0.5, s)); }
    void main(){
      vec2 uv = vUv; vec2 c = uv - 0.5;
      float r2 = dot(c, c);
      vec2 px = 1.0 / uRes;
      // 镜头横向色差（边缘明显）
      vec2 off = c * uChroma * (1.0 + r2 * 4.0);
      vec3 col;
      col.r = texture2D(tDiffuse, uv + off).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv - off).b;
      // 微对比锐化
      vec3 blur = (texture2D(tDiffuse, uv + vec2(px.x,0.)).rgb + texture2D(tDiffuse, uv - vec2(px.x,0.)).rgb
                 + texture2D(tDiffuse, uv + vec2(0.,px.y)).rgb + texture2D(tDiffuse, uv - vec2(0.,px.y)).rgb) * 0.25;
      col += (col - blur) * uSharpen;
      // 宽半径采样：柔焦(Pro-Mist) 与 胶片晕光(Halation)
      if (uDiffusion > 0.001 || uHalation > 0.001) {
        vec3 wide = vec3(0.0); vec3 hl = vec3(0.0); float tot = 0.0;
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 2.39996; float rr = (3.0 + float(i) * 1.6);
          vec2 o = vec2(cos(a), sin(a)) * rr * px * (uRes.y / 900.0);
          vec3 s = texture2D(tDiffuse, uv + o).rgb;
          wide += s; hl += max(s - 0.72, 0.0); tot += 1.0;
        }
        wide /= tot; hl /= tot;
        // 柔焦：亮部向外溢出，整体降低微对比，像真实柔焦滤镜
        col = mix(col, max(col, wide), uDiffusion * 0.6);
        col += max(wide - 0.55, 0.0) * uDiffusion * 0.5;
        // 晕光：高光周围的红橙色光晕（胶片片基反射）
        col += hl * vec3(1.0, 0.32, 0.12) * uHalation * 2.2;
      }
      // 白平衡（冷暖 + 品绿）
      col *= vec3(1.0 + uWarmth * 0.07, 1.0 - uTint * 0.05, 1.0 - uWarmth * 0.07);
      col.rb *= 1.0 + uTint * 0.03;
      // 胶片曲线：趾部压暗部、肩部柔化高光
      float L = luma(col);
      col = mix(col, col * smoothstep(0.0, 0.35, L + 0.05) * 1.05, uToe * 0.5);
      col = col / (1.0 + col * uShoulder * 0.35) * (1.0 + uShoulder * 0.35);
      // 抬黑 / 褪色 / 对比 / 饱和
      col = col * (1.0 - uLift) + uLift;
      col = mix(col, col * 0.88 + 0.06, uFade);
      col = (col - 0.5) * uContrast + 0.5;
      L = luma(col);
      col = mix(vec3(L), col, uSaturation);
      // 色调分离：暗部 / 亮部分别偏色
      float w = smoothstep(0.0, 1.0, L);
      vec3 split = mix(uSplitS, uSplitH, w);
      col = mix(col, softLight(clamp(col, 0.0, 1.0), split), uSplitAmt);
      // 黑白
      col = mix(col, vec3(luma(col)), uBW);
      // 暗角
      col *= mix(1.0, smoothstep(0.85, 0.15, r2 * 1.6), uVignette);
      // 亮度相关颗粒（中间调最明显）
      vec2 gp = floor(uv * uRes / max(uGrainSize, 0.5));
      float g = hash(gp + fract(uTime) * 91.7) - 0.5;
      float gl = luma(col);
      col += g * uGrain * (0.6 + 1.6 * gl * (1.0 - gl));
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }`,
};

export function createPostChain(renderer, scene, camera, opts = {}) {
  const o = { ...POST_DEFAULTS, ...opts };
  const size = renderer.getSize(new THREE.Vector2());
  const pr = renderer.getPixelRatio();
  const rt = new THREE.WebGLRenderTarget(size.x * pr, size.y * pr, { type: THREE.HalfFloatType, samples: opts.samples ?? 4 });
  const composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));

  const gtao = new GTAOPass(scene, camera, size.x, size.y);
  gtao.updateGtaoMaterial({ radius: o.aoRadius, distanceExponent: 1.4, thickness: 1.0, scale: 1.0, samples: o.aoSamples ?? 12 });
  gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: o.aoSamples ?? 12 });
  gtao.blendIntensity = o.aoIntensity;
  composer.addPass(gtao);

  const bokeh = new BokehPass(scene, camera, { focus: o.focus, aperture: o.aperture, maxblur: o.maxblur });
  bokeh.enabled = !!o.dof;
  composer.addPass(bokeh);

  const bloom = new UnrealBloomPass(new THREE.Vector2(size.x, size.y), o.bloom, o.bloomRadius, o.bloomThreshold);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());
  const film = new ShaderPass(LensFilmShader);
  composer.addPass(film);

  const U = film.uniforms;
  const map = { grain: 'uGrain', grainSize: 'uGrainSize', vignette: 'uVignette', chroma: 'uChroma', sharpen: 'uSharpen', warmth: 'uWarmth', tint: 'uTint', contrast: 'uContrast', saturation: 'uSaturation', lift: 'uLift', fade: 'uFade', toe: 'uToe', shoulder: 'uShoulder', halation: 'uHalation', diffusion: 'uDiffusion', splitAmount: 'uSplitAmt', bw: 'uBW' };
  function set(p) {
    for (const [k, u] of Object.entries(map)) if (p[k] != null) U[u].value = p[k];
    if (p.splitShadow) U.uSplitS.value.set(...p.splitShadow);
    if (p.splitHighlight) U.uSplitH.value.set(...p.splitHighlight);
    if (p.bloom != null) bloom.strength = p.bloom;
    if (p.bloomThreshold != null) bloom.threshold = p.bloomThreshold;
    if (p.aoIntensity != null) gtao.blendIntensity = p.aoIntensity;
    if (p.ao != null) gtao.enabled = !!p.ao;
    if (p.dof != null) bokeh.enabled = !!p.dof;
    if (p.focus != null) bokeh.uniforms.focus.value = p.focus;
    if (p.aperture != null) bokeh.uniforms.aperture.value = p.aperture;
    if (p.maxblur != null) bokeh.uniforms.maxblur.value = p.maxblur;
  }
  set(o);
  function setSize(w, h) {
    composer.setSize(w, h);
    U.uRes.value.set(w * renderer.getPixelRatio(), h * renderer.getPixelRatio());
  }
  setSize(size.x, size.y);
  return {
    composer, gtao, bloom, bokeh, film, set, setSize,
    render(t) { U.uTime.value = t; composer.render(); },
    dispose() { composer.dispose?.(); rt.dispose(); },
  };
}

// ———————— 静止画面渐进式超采样（多帧亚像素抖动累积）————————
// 画面静止时每帧把相机投影偏移不到 1 像素（Halton 序列），把后期链的最终结果做滑动平均：
// 16~32 帧后等效 16~32 倍超采样，发丝、睫毛、高光边缘都会变得干净细腻。交互时不累积。
export function createAccumulator(renderer) {
  const mk = () => new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
  let A = mk(), B = mk();
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const blendMat = new THREE.ShaderMaterial({
    uniforms: { tPrev: { value: null }, tCur: { value: null }, uW: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform sampler2D tPrev, tCur; uniform float uW; varying vec2 vUv; void main(){ gl_FragColor = mix(texture2D(tPrev, vUv), texture2D(tCur, vUv), uW); }',
    depthTest: false, depthWrite: false,
  });
  const copyMat = new THREE.ShaderMaterial({
    uniforms: { tSrc: { value: null } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: 'uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.0); }',
    depthTest: false, depthWrite: false,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), blendMat);
  const qs = new THREE.Scene(); qs.add(quad);
  let n = 0;
  const halton = (i, b) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; };
  return {
    get count() { return n; },
    reset() { n = 0; },
    jitter(i) { return [halton(i + 1, 2) - 0.5, halton(i + 1, 3) - 0.5]; },
    setSize(w, h) { A.setSize(w, h); B.setSize(w, h); n = 0; },
    /** curTex：本帧后期链结果；返回累积后的帧数 */
    accumulate(curTex) {
      blendMat.uniforms.tPrev.value = A.texture; blendMat.uniforms.tCur.value = curTex; blendMat.uniforms.uW.value = 1 / (n + 1);
      quad.material = blendMat; renderer.setRenderTarget(B); renderer.render(qs, quadCam);
      [A, B] = [B, A]; n++;
      copyMat.uniforms.tSrc.value = A.texture; quad.material = copyMat; renderer.setRenderTarget(null); renderer.render(qs, quadCam);
      return n;
    },
  };
}
