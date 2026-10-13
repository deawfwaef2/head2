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
    uVignette: { value: 0.22 },
    uSaturation: { value: 1.02 },
    uContrast: { value: 1.05 },
    uWarmth: { value: 0.02 },
    uSharpen: { value: 0.30 },
    uSoftFocus: { value: 0.14 },
    uDepthBlur: { value: 0.12 },
    uChromatic: { value: 0.08 },
    uFilmGrain: { value: 0.04 },
    uTyndall: { value: 0.36 },
    uVintagePhoto: { value: 0.06 },
    uIrisSparkle: { value: 0.82 },
    uHalation: { value: 0.48 },
    uSkinLumen: { value: 0.58 },
    uTyndallAngle: { value: -0.58 },
    uTyndallColor: { value: new THREE.Vector3(1.0, 0.94, 0.86) },
    uTint: { value: new THREE.Vector3(1.01, 1.00, 1.01) },
    uShadowTint: { value: new THREE.Vector3(0.03, 0.02, 0.03) },
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
    uniform float uSoftFocus;
    uniform float uDepthBlur;
    uniform float uChromatic;
    uniform float uFilmGrain;
    uniform float uTyndall;
    uniform float uVintagePhoto;
    uniform float uIrisSparkle;
    uniform float uHalation;
    uniform float uSkinLumen;
    uniform float uTyndallAngle;
    uniform vec3 uTyndallColor;
    uniform vec3 uTint;
    uniform vec3 uShadowTint;
    varying vec2 vUv;

    vec3 sampleRingBlur(vec2 uv, vec2 radiusTexel) {
      vec3 sum = texture2D(tDiffuse, uv).rgb * 0.20;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 1.0,  0.0) * radiusTexel, 0.002, 0.998)).rgb * 0.12;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-1.0,  0.0) * radiusTexel, 0.002, 0.998)).rgb * 0.12;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.0,  1.0) * radiusTexel, 0.002, 0.998)).rgb * 0.12;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.0, -1.0) * radiusTexel, 0.002, 0.998)).rgb * 0.12;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.707,  0.707) * radiusTexel * 1.45, 0.002, 0.998)).rgb * 0.08;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.707,  0.707) * radiusTexel * 1.45, 0.002, 0.998)).rgb * 0.08;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.707, -0.707) * radiusTexel * 1.45, 0.002, 0.998)).rgb * 0.08;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.707, -0.707) * radiusTexel * 1.45, 0.002, 0.998)).rgb * 0.08;
      return sum;
    }

    void main() {
      vec2 texel = 1.0 / max(uResolution, vec2(256.0));
      float srcAlpha = texture2D(tSourceAlpha, vUv).r;

      // 0. Subtle Optical Lens Chromatic Dispersion (85mm f/1.4 optical realism)
      vec2 centerVec = vUv - vec2(0.5);
      float radialDist = length(centerVec);
      vec2 caOffset = centerVec * radialDist * (uChromatic * 0.0038) * smoothstep(0.05, 0.5, srcAlpha);
      vec3 col;
      col.r = texture2D(tDiffuse, clamp(vUv + caOffset, 0.001, 0.999)).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, clamp(vUv - caOffset, 0.001, 0.999)).b;
      if (!(col.r >= 0.0 && col.g >= 0.0 && col.b >= 0.0)) col = vec3(0.0);
      col = clamp(col, 0.0, 12.0);

      // 1. 5-Tap Micro-Detail Unsharp Mask (pores, iris fibers, eyelashes, hair strands)
      vec3 n = texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb;
      vec3 s = texture2D(tDiffuse, vUv - vec2(0.0, texel.y)).rgb;
      vec3 e = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb;
      vec3 w = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0)).rgb;
      vec3 blur1 = 0.25 * (n + s + e + w);

      if (uSharpen > 0.001) {
        vec3 detail = clamp(col - blur1, -0.16, 0.16);
        col = clamp(col + detail * (uSharpen * 1.22), 0.0, 12.0);
      }

      // 2. Next-Gen Dewy Porcelain Skin Luminance Lift (uSkinLumen)
      if (uSkinLumen > 0.001 && srcAlpha > 0.05) {
        float warmHue = clamp((col.r - col.b) * 3.2, 0.0, 1.0) * clamp((col.r - col.g) * 4.5, 0.0, 1.0);
        float midMask = smoothstep(0.06, 0.22, col.r) * (1.0 - smoothstep(0.85, 1.45, col.r));
        float skinMask = warmHue * midMask;
        vec3 porcelainLift = vec3(col.r * 1.10, col.g * 1.12, col.b * 1.14) + vec3(0.022, 0.018, 0.020);
        col = mix(col, porcelainLift, skinMask * clamp(uSkinLumen * 0.65, 0.0, 0.75));
      }

      // 3. Optical Pro-Mist / Subsurface Portrait Soft-Focus Diffusion & Rim Halation (uSoftFocus + uHalation)
      if ((uSoftFocus > 0.001 || uHalation > 0.001) && srcAlpha > 0.01) {
        vec3 mistNear = sampleRingBlur(vUv, texel * 2.4);
        vec3 mistWide = sampleRingBlur(vUv, texel * 6.2);
        vec3 mistBlend = mix(mistNear, mistWide, 0.54);
        float lumaOrig = dot(col, vec3(0.299, 0.587, 0.114));
        float skinAndHighMask = smoothstep(0.08, 0.32, lumaOrig);
        vec3 softCol = mix(col, mistBlend, clamp(uSoftFocus * 0.52, 0.0, 0.72) * skinAndHighMask);
        vec3 hiGlow = max(vec3(0.0), mistWide - vec3(0.42)) * (uSoftFocus * 0.28 + uHalation * 0.36) * vec3(1.06, 0.94, 0.92);
        col = softCol + hiGlow * srcAlpha;
      }

      // 4. HDR Star-Cross Corneal Catchlight & Dewy Glint Sparkle (uIrisSparkle)
      if (uIrisSparkle > 0.001 && srcAlpha > 0.05) {
        float starH = 0.0;
        float starV = 0.0;
        for (int k = -3; k <= 3; k++) {
          float fk = float(k);
          float wStar = exp(-abs(fk) * 0.58);
          vec3 sh = texture2D(tDiffuse, clamp(vUv + vec2(fk * texel.x * 2.2, 0.0), 0.002, 0.998)).rgb;
          vec3 sv = texture2D(tDiffuse, clamp(vUv + vec2(0.0, fk * texel.y * 2.2), 0.002, 0.998)).rgb;
          starH += smoothstep(0.92, 2.2, dot(sh, vec3(0.299, 0.587, 0.114))) * wStar;
          starV += smoothstep(0.92, 2.2, dot(sv, vec3(0.299, 0.587, 0.114))) * wStar;
        }
        float starGlint = (starH + starV) * 0.14 * uIrisSparkle;
        col += vec3(1.02, 0.99, 0.96) * starGlint * srcAlpha;
      }

      // 5. 85mm Portrait Lens Depth-of-Field / Peripheral Bokeh Blur
      if (uDepthBlur > 0.001 && srcAlpha > 0.01) {
        float bokehMask = smoothstep(0.22, 0.72, length((vUv - vec2(0.5, 0.48)) * vec2(1.12, 0.95)));
        float blurAmt = clamp(bokehMask * uDepthBlur, 0.0, 1.0);
        if (blurAmt > 0.01) {
          vec3 dofSample = sampleRingBlur(vUv, texel * (2.5 + blurAmt * 7.5));
          col = mix(col, dofSample, blurAmt * 0.78);
        }
      }

      // 6. True Screen-Space Radial Crepuscular God-Ray Scatter
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
        vec3 tyndallGlow = uTyndallColor * (scatter * 0.20 * srcAlpha);
        col += tyndallGlow * uTyndall;
      }

      // 7. Color Temperature Warmth Shift
      col.r += uWarmth * 0.048;
      col.g += uWarmth * 0.014;
      col.b -= uWarmth * 0.045;
      col = max(col, vec3(0.0));

      // 8. Highlight / Midtone Art-Style Tint
      col *= uTint;

      // 9. Toe-Preserving Filmic S-Curve Contrast (preserves full HDR highlight headroom > 1.0 for ACES OutputPass!)
      float lumaPre = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float contrastPower = mix(1.0, clamp(uContrast, 0.80, 1.35), smoothstep(0.02, 0.22, lumaPre));
      vec3 filmicS = pow(max(col, vec3(0.0001)), vec3(contrastPower)) * pow(0.28, 1.0 - contrastPower);
      col = mix(col, filmicS, 0.65);
      col = max(col, vec3(0.0));

      // Creamy Shadow Split-Toning applied to mid-shadows only (masked out on deep black hair)
      float lumaPostC = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float shadowMask = clamp(1.0 - smoothstep(0.06, 0.42, lumaPostC), 0.0, 1.0) * smoothstep(0.022, 0.075, lumaPostC);
      col += uShadowTint * shadowMask * 0.28;

      // 10. Saturation
      float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(luma), col, uSaturation);

      // 11. Analog Film Emulsion & Rim Halation
      if (uVintagePhoto > 0.001) {
        float lumV = dot(col, vec3(0.299, 0.587, 0.114));
        vec3 warmSilver = vec3(lumV * 1.05, lumV * 0.98, lumV * 0.89);
        vec3 poeticFilm = mix(col, warmSilver, 0.16);
        vec3 wideBlur = 0.5 * (
          texture2D(tDiffuse, vUv + texel * 3.0).rgb +
          texture2D(tDiffuse, vUv - texel * 3.0).rgb
        );
        float hiMask = smoothstep(0.58, 0.95, dot(wideBlur, vec3(0.299, 0.587, 0.114)));
        poeticFilm += vec3(0.065, 0.042, 0.024) * hiMask * srcAlpha;
        col = mix(col, poeticFilm, clamp(uVintagePhoto, 0.0, 1.0));
      }

      // 12. Fine Silver-Halide Film Grain
      if (uFilmGrain > 0.001 && srcAlpha > 0.01) {
        float noise = fract(sin(dot(vUv * uResolution, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
        col += noise * uFilmGrain * 0.065 * srcAlpha;
      }

      // 13. Subtle Studio Vignette
      vec2 d = (vUv - vec2(0.5)) * vec2(1.08, 0.96);
      float v = 1.0 - uVignette * smoothstep(0.25, 0.88, length(d) * 1.28);
      col *= v;

      gl_FragColor = vec4(clamp(col, 0.0, 12.0), clamp(srcAlpha, 0.0, 1.0));
    }
  `,
};

export function createBeautyPostChain(renderer, scene, camera, options = {}) {
  const width = Math.max(2, Math.floor(options.width || 512));
  const height = Math.max(2, Math.floor(options.height || 512));
  const software = isSoftwareRenderer(renderer);
  const samplingScale = 1;
  const pixelRatio = (options.pixelRatio || renderer.getPixelRatio()) * samplingScale;

  // Stage 35 · True 16-Bit HalfFloat HDR RenderTarget!
  // Prevents clamping linear HDR highlights (> 1.0) before UnrealBloomPass and ACESFilmic OutputPass!
  const hdrTarget = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
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
    options.bloomStrength ?? 0.12,
    options.bloomRadius ?? 0.42,
    options.bloomThreshold ?? 0.85
  );

  const gradePass = new ShaderPass(BeautyGradeShader);
  gradePass.uniforms.tSourceAlpha.value = alphaTarget.texture;
  gradePass.uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
  gradePass.uniforms.uVignette.value = options.vignette ?? 0.22;
  gradePass.uniforms.uSaturation.value = options.saturation ?? 1.02;
  gradePass.uniforms.uContrast.value = options.contrast ?? 1.05;
  gradePass.uniforms.uWarmth.value = options.warmth ?? 0.02;
  gradePass.uniforms.uSharpen.value = options.sharpen ?? 0.30;
  gradePass.uniforms.uSoftFocus.value = options.softFocus ?? 0.14;
  gradePass.uniforms.uDepthBlur.value = options.depthBlur ?? 0.12;
  gradePass.uniforms.uChromatic.value = options.chromatic ?? 0.08;
  gradePass.uniforms.uFilmGrain.value = options.filmGrain ?? 0.04;
  gradePass.uniforms.uTyndall.value = options.tyndall ?? 0.36;
  gradePass.uniforms.uVintagePhoto.value = options.vintagePhoto ?? 0.06;
  gradePass.uniforms.uIrisSparkle.value = options.irisSparkle ?? 0.82;
  gradePass.uniforms.uHalation.value = options.halation ?? 0.48;
  gradePass.uniforms.uSkinLumen.value = options.skinLumen ?? 0.58;

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
      if (params.softFocus !== undefined) u.uSoftFocus.value = Number(params.softFocus);
      if (params.depthBlur !== undefined) u.uDepthBlur.value = Number(params.depthBlur);
      if (params.chromatic !== undefined) u.uChromatic.value = Number(params.chromatic);
      if (params.filmGrain !== undefined) u.uFilmGrain.value = Number(params.filmGrain);
      if (params.tyndall !== undefined) u.uTyndall.value = Number(params.tyndall);
      if (params.vintagePhoto !== undefined) u.uVintagePhoto.value = Number(params.vintagePhoto);
      if (params.irisSparkle !== undefined) u.uIrisSparkle.value = Number(params.irisSparkle);
      if (params.halation !== undefined) u.uHalation.value = Number(params.halation);
      if (params.skinLumen !== undefined) u.uSkinLumen.value = Number(params.skinLumen);
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
