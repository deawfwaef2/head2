import * as THREE from 'three';
import { isSoftwareRenderer } from './photorealLighting.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Stage 28 · 唯美老照片胶片感 + 屏幕空间丁达尔体积光束 + 微距毛孔锐化后期定制链
 * - 支持 丁达尔斜射体积光散射 (uTyndall) —— 从书房斜上方洒下的暖银丁达尔光线与高光柔晕
 * - 支持 唯美老照片胶片乳剂调色 (uVintagePhoto) —— 复古暖银盐高光、天鹅绒微褐暗部褪色、胶片卤化银高光晕染 (Halation)
 * - 支持 5-Tap 微距毛孔与发丝锐化 (uSharpen) —— 让 2K 毛孔/野生眉毛流/睫毛/虹膜/丝绸发束清晰锐利
 * - 全程保留 Alpha 透明通道，零黑屏
 */

export const BeautyGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    tSourceAlpha: { value: null },
    uResolution: { value: new THREE.Vector2(1280, 720) },
    uVignette: { value: 0.36 },
    uSaturation: { value: 0.96 },
    uContrast: { value: 1.18 },
    uWarmth: { value: 0.10 },
    uSharpen: { value: 0.64 },
    uFilmGrain: { value: 0.16 },
    uTyndall: { value: 0.75 },
    uVintagePhoto: { value: 0.42 },
    uTyndallAngle: { value: -0.58 },
    uTyndallColor: { value: new THREE.Vector3(1.0, 0.92, 0.80) },
    uTint: { value: new THREE.Vector3(1.01, 0.99, 0.95) },
    uShadowTint: { value: new THREE.Vector3(0.05, 0.035, 0.045) },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform sampler2D tSourceAlpha;
    uniform vec2 uResolution;
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uContrast;
    uniform float uWarmth;
    uniform float uSharpen;
    uniform float uFilmGrain;
    uniform float uTyndall;
    uniform float uVintagePhoto;
    uniform float uTyndallAngle;
    uniform vec3 uTyndallColor;
    uniform vec3 uTint;
    uniform vec3 uShadowTint;
    varying vec2 vUv;

    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 col = c.rgb;
      if (!(col.r >= 0.0 && col.g >= 0.0 && col.b >= 0.0)) col = vec3(0.0);
      col = clamp(col, 0.0, 2.0);
      float srcAlpha = texture2D(tSourceAlpha, vUv).r;

      // 1. 5-Tap Micro-Detail Unsharp Mask (sharpens real 2K skin pores, eyebrow hairs, eyelashes & iris)
      vec2 texel = 1.0 / max(uResolution, vec2(256.0));
      vec3 n = texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb;
      vec3 s = texture2D(tDiffuse, vUv - vec2(0.0, texel.y)).rgb;
      vec3 e = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb;
      vec3 w = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0)).rgb;
      vec3 blur = 0.25 * (n + s + e + w);

      if (uSharpen > 0.001) {
        vec3 detail = clamp(col - blur, -0.25, 0.25);
        col = clamp(col + detail * (uSharpen * 1.65), 0.0, 2.0);
      }

      // 2. True Screen-Space Radial Crepuscular God-Ray Scatter (NO flat 2D stripes/rectangles!)
      if (uTyndall > 0.001 && srcAlpha > 0.005) {
        vec2 lightOrigin = uTyndallAngle <= 0.0 ? vec2(0.82, 0.94) : vec2(0.18, 0.94);
        vec2 delta = (lightOrigin - vUv) * 0.28;
        vec2 sampleUv = vUv;
        float scatter = 0.0;
        float weight = 0.18;
        for (int i = 0; i < 8; i++) {
          sampleUv += delta * 0.125;
          vec2 clampedUv = clamp(sampleUv, 0.01, 0.99);
          vec3 sc = texture2D(tDiffuse, clampedUv).rgb;
          float sa = texture2D(tSourceAlpha, clampedUv).r;
          float lumS = dot(sc, vec3(0.299, 0.587, 0.114));
          scatter += smoothstep(0.38, 0.95, lumS) * sa * weight;
          weight *= 0.84;
        }
        vec3 tyndallGlow = uTyndallColor * (scatter * 0.22 * srcAlpha);
        col += tyndallGlow * uTyndall;
      }

      // 3. Color Temperature Warmth Shift
      col.r += uWarmth * 0.065;
      col.g += uWarmth * 0.018;
      col.b -= uWarmth * 0.062;
      col = max(col, vec3(0.0));

      // 4. Highlight / Midtone Art-Style Tint & Deep Chiaroscuro Shadow Split-Toning
      col *= uTint;
      float lumaPre = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float shadowMask = clamp(1.0 - smoothstep(0.0, 0.42, lumaPre), 0.0, 1.0);
      col += uShadowTint * shadowMask * 0.35;

      // 5. High-Dynamic S-Curve Contrast pivoted at 0.20 middle grey
      col = (col - vec3(0.20)) * uContrast + vec3(0.20);
      col = max(col, vec3(0.0));

      // 6. Saturation
      float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(luma), col, uSaturation);

      // 7. Subtle Analog Film Emulsion & Rim Halation (without muddying skin contrast)
      if (uVintagePhoto > 0.001) {
        float lumV = dot(col, vec3(0.299, 0.587, 0.114));
        vec3 warmSilver = vec3(lumV * 1.06, lumV * 0.97, lumV * 0.86);
        vec3 poeticFilm = mix(col, warmSilver, 0.18);
        vec3 wideBlur = 0.5 * (
          texture2D(tDiffuse, vUv + texel * 3.0).rgb +
          texture2D(tDiffuse, vUv - texel * 3.0).rgb
        );
        float hiMask = smoothstep(0.58, 0.95, dot(wideBlur, vec3(0.299, 0.587, 0.114)));
        poeticFilm += vec3(0.08, 0.048, 0.026) * hiMask * srcAlpha;
        col = mix(col, poeticFilm, clamp(uVintagePhoto, 0.0, 1.0));
      }

      // 8. Fine Silver-Halide Film Grain (suppresses plastic digital smoothness on skin)
      if (uFilmGrain > 0.001 && srcAlpha > 0.01) {
        float noise = fract(sin(dot(vUv * uResolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
        col += noise * uFilmGrain * 0.09 * srcAlpha;
      }

      // 9. Subtle Studio Vignette (RGB only, preserves alpha)
      vec2 d = (vUv - vec2(0.5)) * vec2(1.08, 0.96);
      float v = 1.0 - uVignette * smoothstep(0.20, 0.82, length(d) * 1.32);
      col *= v;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), clamp(srcAlpha, 0.0, 1.0));
    }
  `,
};

export function createBeautyPostChain(renderer, scene, camera, options = {}) {
  const width = Math.max(2, Math.floor(options.width || 512));
  const height = Math.max(2, Math.floor(options.height || 512));
  const software = isSoftwareRenderer(renderer);
  const samplingScale = 1;
  const pixelRatio = (options.pixelRatio || renderer.getPixelRatio()) * samplingScale;

  const hdrTarget = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.UnsignedByteType,
    samples: software ? 0 : Math.min(4, renderer.capabilities.maxSamples || 0),
  });
  const composer = new EffectComposer(renderer, hdrTarget);
  composer.setPixelRatio(pixelRatio);
  composer.setSize(width, height);

  const renderPass = new RenderPass(scene, camera);

  const alphaTarget = new THREE.WebGLRenderTarget(2, 2, {
    format: THREE.RedFormat,
    type: THREE.UnsignedByteType,
    depthBuffer: false,
    stencilBuffer: false,
  });
  const alphaMaterial = new THREE.ShaderMaterial({
    uniforms: { tDiffuse: { value: null } },
    vertexShader: BeautyGradeShader.vertexShader,
    fragmentShader:
      'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ gl_FragColor=vec4(texture2D(tDiffuse,vUv).a,0.0,0.0,1.0); }',
    depthTest: false,
    depthWrite: false,
    toneMapped: false,
    blending: THREE.NoBlending,
  });
  const alphaQuad = new FullScreenQuad(alphaMaterial);
  const alphaPass = new Pass();
  alphaPass.needsSwap = false;
  alphaPass.render = (r, write, read) => {
    alphaMaterial.uniforms.tDiffuse.value = read.texture;
    r.setRenderTarget(alphaTarget);
    alphaQuad.render(r);
  };
  let sizeW = width;
  let sizeH = height;
  let sizeRatio = pixelRatio;

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    options.bloomStrength ?? 0.08,
    options.bloomRadius ?? 0.36,
    options.bloomThreshold ?? 0.88
  );

  const gradePass = new ShaderPass(BeautyGradeShader);
  gradePass.uniforms.tSourceAlpha.value = alphaTarget.texture;
  gradePass.uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
  gradePass.uniforms.uVignette.value = options.vignette ?? 0.42;
  gradePass.uniforms.uSaturation.value = options.saturation ?? 0.88;
  gradePass.uniforms.uContrast.value = options.contrast ?? 1.16;
  gradePass.uniforms.uWarmth.value = options.warmth ?? 0.14;
  gradePass.uniforms.uSharpen.value = options.sharpen ?? 0.54;
  gradePass.uniforms.uFilmGrain.value = options.filmGrain ?? 0.24;
  gradePass.uniforms.uTyndall.value = options.tyndall ?? 0.82;
  gradePass.uniforms.uVintagePhoto.value = options.vintagePhoto ?? 0.76;

  const resizeAlpha = () => {
    const rw = Math.max(2, Math.floor(sizeW * sizeRatio));
    const rh = Math.max(2, Math.floor(sizeH * sizeRatio));
    alphaTarget.setSize(rw, rh);
    gradePass.uniforms.uResolution.value.set(rw, rh);
  };
  resizeAlpha();

  const outputPass = new OutputPass();

  composer.addPass(renderPass);
  composer.addPass(alphaPass);
  composer.addPass(bloomPass);
  composer.addPass(gradePass);
  composer.addPass(outputPass);

  const chain = {
    composer,
    bloomPass,
    gradePass,
    enabled: true,
    setSize(w, h) {
      const ww = Math.max(2, Math.floor(w));
      const hh = Math.max(2, Math.floor(h));
      sizeW = ww;
      sizeH = hh;
      composer.setSize(ww, hh);
      resizeAlpha();
    },
    setPixelRatio(r) {
      sizeRatio = r * samplingScale;
      composer.setPixelRatio(sizeRatio);
      resizeAlpha();
    },
    syncSize(w, h, r) {
      if (r) chain.setPixelRatio(r);
      chain.setSize(w, h);
    },
    setEnabled(v) {
      chain.enabled = v !== false;
    },
    setGradeParams(params = {}) {
      if (params.bloomStrength !== undefined) bloomPass.strength = Number(params.bloomStrength);
      if (params.bloomRadius !== undefined) bloomPass.radius = Number(params.bloomRadius);
      if (params.bloomThreshold !== undefined) bloomPass.threshold = Number(params.bloomThreshold);
      const u = gradePass.uniforms;
      if (params.vignette !== undefined) u.uVignette.value = Number(params.vignette);
      if (params.saturation !== undefined) u.uSaturation.value = Number(params.saturation);
      if (params.contrast !== undefined) u.uContrast.value = Number(params.contrast);
      if (params.warmth !== undefined) u.uWarmth.value = Number(params.warmth);
      if (params.sharpen !== undefined) u.uSharpen.value = Number(params.sharpen);
      if (params.filmGrain !== undefined) u.uFilmGrain.value = Number(params.filmGrain);
      if (params.tyndall !== undefined) u.uTyndall.value = Number(params.tyndall);
      if (params.vintagePhoto !== undefined) u.uVintagePhoto.value = Number(params.vintagePhoto);
      if (params.tyndallAngle !== undefined) u.uTyndallAngle.value = Number(params.tyndallAngle);
      if (params.tyndallColor) {
        const tc = new THREE.Color(params.tyndallColor);
        u.uTyndallColor.value.set(tc.r, tc.g, tc.b);
      }
      if (Array.isArray(params.tint)) {
        u.uTint.value.set(params.tint[0], params.tint[1], params.tint[2]);
      }
      if (Array.isArray(params.shadowTint)) {
        u.uShadowTint.value.set(params.shadowTint[0], params.shadowTint[1], params.shadowTint[2]);
      }
    },
    render() {
      composer.render();
    },
    dispose() {
      alphaTarget.dispose();
      alphaMaterial.dispose();
      alphaQuad.dispose();
      bloomPass.dispose();
      gradePass.dispose();
      outputPass.dispose();
      composer.dispose();
    },
  };
  return chain;
}
