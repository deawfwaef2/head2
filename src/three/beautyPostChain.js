import * as THREE from 'three';
import { isSoftwareRenderer } from './photorealLighting.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Stage 23 · 大师级实时画质·画风色调·微距锐化后期定制链 (Customizable Beauty & Film Grade Post Chain)
 * - 支持 6 大画风色调预设 (暖金展柜 / 冷冽法医 / 哥特丝绒 / 赛博霓虹 / 胶片画报 / 极净日光)
 * - 支持 5-Tap 微距毛孔与发丝锐化 (uSharpen) —— 消除 WebGL 模糊感，让 2K 毛孔/睫毛/虹膜/丝绸发束刀锋般锐利
 * - 支持 色温冷暖 (uWarmth)、明暗对比 (uContrast)、饱和度 (uSaturation)、暗部色调分离 (uShadowTint)、电影暗角 (uVignette)、胶片微颗粒 (uFilmGrain)
 * - 全程保留 Alpha 透明通道，零黑屏、零火球眩光
 */

export const BeautyGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    tSourceAlpha: { value: null },
    uResolution: { value: new THREE.Vector2(1280, 720) },
    uVignette: { value: 0.32 },
    uSaturation: { value: 1.10 },
    uContrast: { value: 1.08 },
    uWarmth: { value: 0.04 },
    uSharpen: { value: 0.42 },
    uFilmGrain: { value: 0.0 },
    uTint: { value: new THREE.Vector3(1.0, 0.99, 0.97) },
    uShadowTint: { value: new THREE.Vector3(0.02, 0.01, 0.03) },
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
    uniform vec3 uTint;
    uniform vec3 uShadowTint;
    varying vec2 vUv;

    void main() {
      vec4 c = texture2D(tDiffuse, vUv);
      vec3 col = c.rgb;
      if (!(col.r >= 0.0 && col.g >= 0.0 && col.b >= 0.0)) col = vec3(0.0);
      col = clamp(col, 0.0, 2.0);

      // 1. 5-Tap Micro-Detail Unsharp Mask (Pores, Eyelashes, Iris & Hair Strands Clarity)
      if (uSharpen > 0.001) {
        vec2 texel = 1.0 / max(uResolution, vec2(256.0));
        vec3 n = texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb;
        vec3 s = texture2D(tDiffuse, vUv - vec2(0.0, texel.y)).rgb;
        vec3 e = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb;
        vec3 w = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0)).rgb;
        vec3 blur = 0.25 * (n + s + e + w);
        vec3 detail = clamp(col - blur, -0.25, 0.25);
        col = clamp(col + detail * (uSharpen * 1.45), 0.0, 2.0);
      }

      // 2. Color Temperature Warmth Shift
      col.r += uWarmth * 0.075;
      col.g += uWarmth * 0.018;
      col.b -= uWarmth * 0.075;
      col = max(col, vec3(0.0));

      // 3. Highlight / Midtone Art-Style Tint & Shadow Split-Toning
      col *= uTint;
      float lumaPre = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float shadowMask = clamp(1.0 - smoothstep(0.0, 0.45, lumaPre), 0.0, 1.0);
      col += uShadowTint * shadowMask * 0.45;

      // 4. S-Curve Contrast pivoted at 0.18 middle grey
      col = (col - vec3(0.18)) * uContrast + vec3(0.18);
      col = max(col, vec3(0.0));

      // 5. Saturation
      float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(luma), col, uSaturation);

      // 6. Optional Subtle Film Grain
      if (uFilmGrain > 0.001) {
        float noise = fract(sin(dot(vUv * uResolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
        col += noise * uFilmGrain * 0.12;
      }

      // 7. Cinema Vignette (RGB only, preserves alpha)
      vec2 d = vUv - vec2(0.5);
      float v = 1.0 - uVignette * smoothstep(0.15, 0.75, length(d) * 1.35);
      col *= v;

      gl_FragColor = vec4(clamp(col, 0.0, 1.0), texture2D(tSourceAlpha, vUv).r);
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
    options.bloomStrength ?? 0.05,
    options.bloomRadius ?? 0.30,
    options.bloomThreshold ?? 0.94
  );

  const gradePass = new ShaderPass(BeautyGradeShader);
  gradePass.uniforms.tSourceAlpha.value = alphaTarget.texture;
  gradePass.uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
  gradePass.uniforms.uVignette.value = options.vignette ?? 0.32;
  gradePass.uniforms.uSaturation.value = options.saturation ?? 1.10;
  gradePass.uniforms.uContrast.value = options.contrast ?? 1.08;
  gradePass.uniforms.uWarmth.value = options.warmth ?? 0.04;
  gradePass.uniforms.uSharpen.value = options.sharpen ?? 0.42;
  gradePass.uniforms.uFilmGrain.value = options.filmGrain ?? 0.0;

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
