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
    uSaturation: { value: 0.90 },
    uContrast: { value: 1.09 },
    uWarmth: { value: 0.07 },
    uSharpen: { value: 0.06 },
    uSoftFocus: { value: 0.56 },
    uDepthBlur: { value: 0.44 },
    uChromatic: { value: 0.14 },
    uFilmGrain: { value: 0.09 },
    uTyndall: { value: 0.58 },
    uVintagePhoto: { value: 0.48 },
    uIrisSparkle: { value: 0.05 },
    uHalation: { value: 0.28 },
    uSkinLumen: { value: 0.0 },
    uTyndallAngle: { value: -0.58 },
    uTyndallColor: { value: new THREE.Vector3(1.0, 0.92, 0.78) },
    uTint: { value: new THREE.Vector3(1.02, 0.99, 0.94) },
    uShadowTint: { value: new THREE.Vector3(0.035, 0.025, 0.022) },
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

    // 17-Tap Dual-Ring Optical Portrait Lens Diffusion & Bokeh Kernel
    vec3 sampleRingBlur(vec2 uv, vec2 radiusTexel) {
      vec3 sum = texture2D(tDiffuse, uv).rgb * 0.16;
      // Inner 8-tap Gaussian ring
      sum += texture2D(tDiffuse, clamp(uv + vec2( 1.0,  0.0) * radiusTexel * 0.65, 0.002, 0.998)).rgb * 0.075;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-1.0,  0.0) * radiusTexel * 0.65, 0.002, 0.998)).rgb * 0.075;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.0,  1.0) * radiusTexel * 0.65, 0.002, 0.998)).rgb * 0.075;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.0, -1.0) * radiusTexel * 0.65, 0.002, 0.998)).rgb * 0.075;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.707,  0.707) * radiusTexel * 0.92, 0.002, 0.998)).rgb * 0.06;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.707,  0.707) * radiusTexel * 0.92, 0.002, 0.998)).rgb * 0.06;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.707, -0.707) * radiusTexel * 0.92, 0.002, 0.998)).rgb * 0.06;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.707, -0.707) * radiusTexel * 0.92, 0.002, 0.998)).rgb * 0.06;
      // Outer 8-tap optical bokeh disc ring
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.924,  0.383) * radiusTexel * 1.48, 0.002, 0.998)).rgb * 0.0375;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.924,  0.383) * radiusTexel * 1.48, 0.002, 0.998)).rgb * 0.0375;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.924, -0.383) * radiusTexel * 1.48, 0.002, 0.998)).rgb * 0.0375;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.924, -0.383) * radiusTexel * 1.48, 0.002, 0.998)).rgb * 0.0375;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.383,  0.924) * radiusTexel * 1.48, 0.002, 0.998)).rgb * 0.0375;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.383,  0.924) * radiusTexel * 1.48, 0.002, 0.998)).rgb * 0.0375;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.383, -0.924) * radiusTexel * 1.48, 0.002, 0.998)).rgb * 0.0375;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.383, -0.924) * radiusTexel * 1.48, 0.002, 0.998)).rgb * 0.0375;
      return sum;
    }

    void main() {
      vec2 texel = 1.0 / max(uResolution, vec2(256.0));
      float srcAlpha = texture2D(tSourceAlpha, vUv).r;

      // 0. Subtle Optical Lens Chromatic Dispersion (vintage 85mm f/1.4 optical realism)
      vec2 centerVec = vUv - vec2(0.5);
      float radialDist = length(centerVec);
      vec2 caOffset = centerVec * radialDist * (uChromatic * 0.0042) * smoothstep(0.05, 0.5, srcAlpha);
      vec3 col;
      col.r = texture2D(tDiffuse, clamp(vUv + caOffset, 0.001, 0.999)).r;
      col.g = texture2D(tDiffuse, vUv).g;
      col.b = texture2D(tDiffuse, clamp(vUv - caOffset, 0.001, 0.999)).b;
      if (!(col.r >= 0.0 && col.g >= 0.0 && col.b >= 0.0)) col = vec3(0.0);
      col = clamp(col, 0.0, 4.0);

      // 1. Filmic Highlight Shoulder Compression (prevents over-bright forehead/temple glare!)
      col = col / (vec3(1.0) + max(vec3(0.0), col - vec3(0.52)) * 0.72);

      // 2. Optional Micro-Detail Unsharp Mask (only when user explicitly increases uSharpen)
      if (uSharpen > 0.02) {
        vec3 n = texture2D(tDiffuse, vUv + vec2(0.0, texel.y)).rgb;
        vec3 s = texture2D(tDiffuse, vUv - vec2(0.0, texel.y)).rgb;
        vec3 e = texture2D(tDiffuse, vUv + vec2(texel.x, 0.0)).rgb;
        vec3 w = texture2D(tDiffuse, vUv - vec2(texel.x, 0.0)).rgb;
        vec3 blur1 = 0.25 * (n + s + e + w);
        vec3 detail = clamp(col - blur1, -0.08, 0.08);
        col = clamp(col + detail * (uSharpen * 0.65), 0.0, 4.0);
      }

      // 3. True Optical Soft-Focus Lens Diffusion (uSoftFocus + uHalation)
      // Melts synthetic 3D polygon edges, hair-card boundaries, and silicone harshness into a creamy analog portrait!
      if ((uSoftFocus > 0.001 || uHalation > 0.001) && srcAlpha > 0.005) {
        vec3 mistNear = sampleRingBlur(vUv, texel * (1.8 + uSoftFocus * 2.2));
        vec3 mistWide = sampleRingBlur(vUv, texel * (4.6 + uSoftFocus * 5.4));
        vec3 mistBlend = mix(mistNear, mistWide, 0.46);
        // Apply optical diffusion across ALL character pixels (including hair & shadow edges!)
        float opticalBlurMix = clamp(uSoftFocus * 0.68, 0.0, 0.85);
        vec3 softCol = mix(col, mistBlend, opticalBlurMix);
        // Warm analog Black Pro-Mist halation around highlights
        vec3 hiGlow = max(vec3(0.0), mistWide - vec3(0.46)) * (uSoftFocus * 0.16 + uHalation * 0.22) * vec3(1.06, 0.90, 0.78);
        col = softCol + hiGlow * srcAlpha;
      }

      // 4. 85mm f/1.2 Portrait Lens Depth-of-Field / Peripheral Bokeh Blur (uDepthBlur)
      // Keeps eyes & nose bridge softly focused while blurring outer hair, neck base, and background
      if (uDepthBlur > 0.001 && srcAlpha > 0.005) {
        float bokehMask = smoothstep(0.14, 0.62, length((vUv - vec2(0.5, 0.50)) * vec2(1.18, 0.98)));
        float blurAmt = clamp(bokehMask * uDepthBlur, 0.0, 1.0);
        if (blurAmt > 0.005) {
          vec3 dofNear = sampleRingBlur(vUv, texel * (3.2 + blurAmt * 6.5));
          vec3 dofFar  = sampleRingBlur(vUv, texel * (6.8 + blurAmt * 12.0));
          vec3 dofSample = mix(dofNear, dofFar, 0.52);
          col = mix(col, dofSample, clamp(blurAmt * 0.88, 0.0, 0.92));
        }
      }

      // 5. True Screen-Space Radial Crepuscular God-Ray Scatter (Directional Light Mood / 光线感)
      if (uTyndall > 0.001 && srcAlpha > 0.005) {
        vec2 lightOrigin = uTyndallAngle <= 0.0 ? vec2(0.84, 0.94) : vec2(0.16, 0.94);
        vec2 delta = (lightOrigin - vUv) * 0.30;
        vec2 sampleUv = vUv;
        float scatter = 0.0;
        float weight = 0.18;
        for (int i = 0; i < 8; i++) {
          sampleUv += delta * 0.125;
          vec2 clampedUv = clamp(sampleUv, 0.01, 0.99);
          vec3 sc = texture2D(tDiffuse, clampedUv).rgb;
          float sa = texture2D(tSourceAlpha, clampedUv).r;
          float lumS = dot(sc, vec3(0.299, 0.587, 0.114));
          scatter += smoothstep(0.32, 0.88, lumS) * sa * weight;
          weight *= 0.84;
        }
        // Directional window-light gradient across viewport (top-right warm light falloff to bottom-left shadow)
        float dirBeam = clamp(1.0 - length((vUv - lightOrigin) * vec2(0.85, 0.95)) * 0.92, 0.0, 1.0);
        vec3 tyndallGlow = uTyndallColor * ((scatter * 0.16 + dirBeam * 0.045) * srcAlpha);
        col += tyndallGlow * uTyndall;
      }

      // 6. Color Temperature Warmth Shift
      col.r += uWarmth * 0.044;
      col.g += uWarmth * 0.014;
      col.b -= uWarmth * 0.042;
      col = max(col, vec3(0.0));

      // 7. Highlight / Midtone Art-Style Tint
      col *= uTint;

      // 8. Toe-Preserving Filmic S-Curve Contrast
      float lumaPre = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float contrastPower = mix(1.0, clamp(uContrast, 0.82, 1.32), smoothstep(0.02, 0.22, lumaPre));
      vec3 filmicS = pow(max(col, vec3(0.0001)), vec3(contrastPower)) * pow(0.26, 1.0 - contrastPower);
      col = mix(col, filmicS, 0.68);
      col = max(col, vec3(0.0));

      // 9. Creamy Shadow Split-Toning
      float lumaPostC = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float shadowMask = clamp(1.0 - smoothstep(0.06, 0.42, lumaPostC), 0.0, 1.0) * smoothstep(0.018, 0.070, lumaPostC);
      col += uShadowTint * shadowMask * 0.28;

      // 10. Saturation
      float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(luma), col, uSaturation);

      // 11. Authentic Silver-Halide Vintage Old-Photo Emulsion (uVintagePhoto / 老照片感)
      if (uVintagePhoto > 0.001 && srcAlpha > 0.005) {
        float vp = clamp(uVintagePhoto, 0.0, 1.0);
        float lumV = dot(col, vec3(0.299, 0.587, 0.114));
        // Classic analog sepia-ivory tone mapping: warm golden-cream highlights + warm bronze midtones + velvet plum-brown shadows
        vec3 sepiaTone = vec3(
          lumV * 1.08 + 0.022,
          lumV * 0.96 + 0.014,
          lumV * 0.80 + 0.010
        );
        vec3 analogEmulsion = mix(col, sepiaTone, 0.34);
        // Faded matte analog black point & soft highlight compression (signature of vintage paper prints!)
        analogEmulsion = vec3(0.022, 0.017, 0.015) + analogEmulsion * vec3(0.92, 0.89, 0.84);
        // Subtle warm reddish-amber film halation around light boundaries
        vec3 halBlur = sampleRingBlur(vUv, texel * 5.5);
        float hiMask = smoothstep(0.44, 0.86, dot(halBlur, vec3(0.299, 0.587, 0.114)));
        analogEmulsion += vec3(0.058, 0.032, 0.014) * hiMask * srcAlpha;
        col = mix(col, analogEmulsion, vp);
      }

      // 12. Organic 35mm Silver-Halide Film Grain
      if (uFilmGrain > 0.001 && srcAlpha > 0.01) {
        vec2 grainUv = floor(vUv * uResolution * 0.75);
        float noise = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
        float midWeight = smoothstep(0.02, 0.18, luma) * (1.0 - smoothstep(0.75, 0.98, luma));
        col += noise * uFilmGrain * (0.045 + 0.045 * midWeight) * srcAlpha;
      }

      // 13. Atmospheric Portrait Vignette (frames the light naturally)
      vec2 d = (vUv - vec2(0.5)) * vec2(1.08, 0.96);
      float v = 1.0 - uVignette * smoothstep(0.20, 0.86, length(d) * 1.32);
      col *= v;

      gl_FragColor = vec4(clamp(col, 0.0, 4.0), clamp(srcAlpha, 0.0, 1.0));
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
    options.bloomStrength ?? 0.07,
    options.bloomRadius ?? 0.52,
    options.bloomThreshold ?? 0.92
  );

  const gradePass = new ShaderPass(BeautyGradeShader);
  gradePass.uniforms.tSourceAlpha.value = alphaTarget.texture;
  gradePass.uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);
  gradePass.uniforms.uVignette.value = options.vignette ?? 0.36;
  gradePass.uniforms.uSaturation.value = options.saturation ?? 0.90;
  gradePass.uniforms.uContrast.value = options.contrast ?? 1.09;
  gradePass.uniforms.uWarmth.value = options.warmth ?? 0.07;
  gradePass.uniforms.uSharpen.value = options.sharpen ?? 0.06;
  gradePass.uniforms.uSoftFocus.value = options.softFocus ?? 0.56;
  gradePass.uniforms.uDepthBlur.value = options.depthBlur ?? 0.44;
  gradePass.uniforms.uChromatic.value = options.chromatic ?? 0.14;
  gradePass.uniforms.uFilmGrain.value = options.filmGrain ?? 0.09;
  gradePass.uniforms.uTyndall.value = options.tyndall ?? 0.58;
  gradePass.uniforms.uVintagePhoto.value = options.vintagePhoto ?? 0.48;
  gradePass.uniforms.uIrisSparkle.value = options.irisSparkle ?? 0.05;
  gradePass.uniforms.uHalation.value = options.halation ?? 0.28;
  gradePass.uniforms.uSkinLumen.value = options.skinLumen ?? 0.0;

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
