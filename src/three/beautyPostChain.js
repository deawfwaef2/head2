import * as THREE from 'three';
import { isSoftwareRenderer } from './photorealLighting.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

/**
 * Stage 40 · 全栈电影光学与胶片后处理自由定制矩阵 (27+ Real-Time Photoreal Post-Processing Controls)
 * 新增并整合以下电影级真实感后处理通道（全程 16-bit HalfFloat HDR + 严格保留 Alpha 透明通道，零黑屏）：
 * 1. uSssBlur         — 屏幕空间真皮红润次表面散射扩散 (Screen-Space Subsurface Scattering RGB Diffusion)
 * 2. uMicroContrast   — 局部微反差与立体骨相清晰度 (Local Clarity & Micro-Contrast Relief)
 * 3. uHighlightRoll   — 胶片高光肩部奶油柔化压缩 (Analog Highlight Shoulder Roll-Off)
 * 4. uShadowCrush     — 暗部趾部压暗与天鹅绒黑位深度 (Shadow Toe Crush & Velvet Black Depth)
 * 5. uSoftFocus       — 17-Tap 电影黑柔镜光学柔焦漫射 (Black Pro-Mist Optical Diffusion)
 * 6. uDepthBlur       — 85mm f/1.2 大光圈椭圆景深模糊 (Portrait Elliptical Bokeh DOF)
 * 7. uSwirlyBokeh     — 经典 Petzval / Helios-44 旋焦散景模糊 (Swirly Tangential Bokeh)
 * 8. uSunFlareVeil    — 逆光镜头暖金眩光雾翳与光圈鬼影环 (Backlit Lens Veiling Glare & Aperture Ring)
 * 9. uDappledBokeh    — 前景树影暗角与翠金散景光斑 (Foreground Dappled Foliage & Emerald-Gold Bokeh)
 * 10. uTyndall        — 窗畔丁达尔斜射体积光束 (Crepuscular Volumetric God-Rays)
 * 11. uAnamorphicFlare— 变形宽银幕水平光斑拉丝 (Panavision Anamorphic Horizontal Streak Flare)
 * 12. uLightLeak      — 胶片暗盒边缘有机暖金红漏光呼吸 (Analog Film Burn & Corner Light Leak)
 * 13. uWetLensDrop    — 窗畔呼吸水雾与微光柔晕 (Rainy Window Condensation Mist & Dew Halo)
 * 14. uFilmLutMode / uFilmLutStrength — 8款大师级电影胶片乳剂曲线 (Kodak 2383 / Portra 160 / Fuji Velvia / CineStill 800T / Ilford HP5 / Bleach Bypass / Agfa Vista / Natural)
 * 15. uHalation       — 胶片卤化银红橙高光边缘晕染 (Silver-Halide Red-Orange Halation)
 * 16. uChromatic      — 光学定焦镜头色散紫边 (Optical Radial Chromatic Dispersion)
 * 17. uLensDistortion — 光学球面镜桶形/枕形微畸变 (Optical Barrel/Pincushion Lens Curvature)
 * 18. uSharpen / uVintagePhoto / uFilmGrain / uVignette / uContrast / uSaturation / uWarmth
 */

export const FILM_LUT_CATALOG = [
  { id: 'portra_160_sun', modeInt: 1, label: '🌞 Kodak Portra 160 盛夏逆光人像 (参考图同款·奶油肤色+强明暗)' },
  { id: 'kodak_2383', modeInt: 0, label: '🎞️ Kodak Vision3 2383 电影印片胶卷 (暖金高光+深邃青绿暗部)' },
  { id: 'fuji_velvia_50', modeInt: 2, label: '🍃 Fujifilm Eterna/Velvia 翠绿森系胶片 (通透树影+自然肤色)' },
  { id: 'cinestill_800t', modeInt: 3, label: '🌃 CineStill 800T 钨丝灯电影卷 (朱红光晕+冷翠暗调)' },
  { id: 'ilford_hp5_bichrome', modeInt: 4, label: '🖤 Ilford HP5 银盐暖铂金黑白 (极致伦勃朗雕塑明暗)' },
  { id: 'bleach_bypass', modeInt: 5, label: '⚔️ Bleach Bypass 银留存冲洗 (高反差低饱和电影硬朗质感)' },
  { id: 'agfa_vista_warm', modeInt: 6, label: '🌅 Agfa Vista 200 琥珀落日胶卷 (浓郁金红高光+复古褐影)' },
  { id: 'natural_linear', modeInt: 7, label: '📷 纯净物理零染调色 (仅保留光学镜头后处理特效)' },
];

export const DESKTOP_PET_BLUR_MODES = [
  { id: 'none', modeInt: 0, shortLabel: '🚫 无模糊 (超清锐利)', label: '🚫 无模糊 · 4K全画幅锐利原画', defaultPower: 0.0 },
  { id: 'portrait_dof', modeInt: 1, shortLabel: '📷 单反大光圈景深虚化', label: '📷 85mm f/1.2 单反大光圈人像景深虚化 (主体清晰·边缘柔美散景)', defaultPower: 0.72 },
  { id: 'pro_mist', modeInt: 2, shortLabel: '🌸 奶油黑柔镜柔焦', label: '🌸 Black Pro-Mist 奶油柔焦梦境滤镜 (高光柔晕·柔滑肤质)', defaultPower: 0.68 },
  { id: 'tilt_shift', modeInt: 3, shortLabel: '🎞️ 微距移轴镜头模糊', label: '🎞️ Tilt-Shift 微距移轴桌面剧场模糊 (眼部对焦带清晰·上下渐进虚化)', defaultPower: 0.78 },
  { id: 'radial_zoom', modeInt: 4, shortLabel: '🌀 电影径向聚焦模糊', label: '🌀 Petzval 电影径向旋焦散景模糊 (中心聚焦·四周旋焦包围)', defaultPower: 0.72 },
  { id: 'dream_haze', modeInt: 5, shortLabel: '🌫️ 全画幅柔雾高斯模糊', label: '🌫️ 全画幅柔雾氛围高斯模糊 (微醺朦胧梦境感)', defaultPower: 0.65 },
];

export const DESKTOP_PET_FILTER_PRESETS = [
  {
    id: 'natural_clean',
    shortLabel: '✨ 原生超清光影',
    label: '✨ 原生超清写实光影 · 零偏色纯净还原',
    visualPreset: 'dlss5_neural_photoreal',
    lightPreset: 'softbox',
    gobo: 'none',
    grade: {
      contrast: 1.03, saturation: 0.98, warmth: 0.0, tintShift: 0.0, lift: 0.006, fade: 0.0,
      toe: 0.0, shoulder: 0.0, halation: 0.02, diffusion: 0.0,
      splitShadow: [0.5, 0.5, 0.5], splitHighlight: [0.5, 0.5, 0.5], splitAmount: 0.0, bw: 0.0,
      vignette: 0.16, softFocus: 0.02, filmGrain: 0.012, shadowLift: 0.35,
      tyndall: 0.10, sunFlareVeil: 0.0, dappledBokeh: 0.0, anamorphicFlare: 0.0, lightLeak: 0.0, vintagePhoto: 0.0,
      filmLutMode: 7, filmLutStrength: 0.0,
    },
  },
  {
    id: 'korean_cream',
    shortLabel: '🍦 韩系奶油水光',
    label: '🍦 韩系奶油水光柔肤 · 清透蜜桃柔光滤镜',
    visualPreset: 'soft_butterfly_glamour',
    lightPreset: 'butterfly',
    gobo: 'none',
    grade: {
      contrast: 0.90, saturation: 0.90, warmth: 0.38, tintShift: 0.14, lift: 0.055, fade: 0.08,
      toe: 0.08, shoulder: 0.65, halation: 0.08, diffusion: 0.42,
      splitShadow: [0.56, 0.46, 0.50], splitHighlight: [0.68, 0.54, 0.48], splitAmount: 0.32, bw: 0.0,
      vignette: 0.12, softFocus: 0.46, filmGrain: 0.015, shadowLift: 0.52,
      tyndall: 0.18, sunFlareVeil: 0.12, dappledBokeh: 0.0, anamorphicFlare: 0.0, lightLeak: 0.0, vintagePhoto: 0.0,
      filmLutMode: 1, filmLutStrength: 0.38,
    },
  },
  {
    id: 'japan_airy',
    shortLabel: '🍃 日系清透空气',
    label: '🍃 日系清透空气感胶片 · 富士青绿森系柔光',
    visualPreset: 'dappled_forest_breeze',
    lightPreset: 'overcast',
    gobo: 'none',
    grade: {
      contrast: 0.86, saturation: 0.82, warmth: -0.22, tintShift: -0.14, lift: 0.075, fade: 0.14,
      toe: 0.05, shoulder: 0.65, halation: 0.04, diffusion: 0.24,
      splitShadow: [0.36, 0.58, 0.62], splitHighlight: [0.54, 0.56, 0.50], splitAmount: 0.36, bw: 0.0,
      vignette: 0.10, softFocus: 0.28, filmGrain: 0.02, shadowLift: 0.60,
      tyndall: 0.22, sunFlareVeil: 0.06, dappledBokeh: 0.15, anamorphicFlare: 0.0, lightLeak: 0.0, vintagePhoto: 0.0,
      filmLutMode: 2, filmLutStrength: 0.58,
    },
  },
  {
    id: 'hk_retro_neon',
    shortLabel: '🏮 90港风复古胶片',
    label: '🏮 90年代王家卫港风复古 · 浓郁暖金与暗青明暗',
    visualPreset: 'wong_kar_wai_blinds',
    lightPreset: 'cinematicTeal',
    gobo: 'venetian_blinds',
    grade: {
      contrast: 1.16, saturation: 1.08, warmth: 0.32, tintShift: -0.28, lift: 0.03, fade: 0.08,
      toe: 0.45, shoulder: 0.32, halation: 0.48, diffusion: 0.20,
      splitShadow: [0.26, 0.58, 0.46], splitHighlight: [0.74, 0.50, 0.32], splitAmount: 0.48, bw: 0.0,
      vignette: 0.48, softFocus: 0.26, filmGrain: 0.06, shadowLift: 0.18,
      tyndall: 0.45, sunFlareVeil: 0.18, dappledBokeh: 0.0, anamorphicFlare: 0.25, lightLeak: 0.16, vintagePhoto: 0.12,
      filmLutMode: 0, filmLutStrength: 0.68,
    },
  },
  {
    id: 'golden_backlit',
    shortLabel: '🌅 暖阳逆光金丝',
    label: '🌅 暖阳逆光金色轮廓 · 夕阳丁达尔发丝透光',
    visualPreset: 'reference_sunlit_chiaroscuro',
    lightPreset: 'goldenBack',
    gobo: 'hair_sun_slit',
    grade: {
      contrast: 1.06, saturation: 1.08, warmth: 0.82, tintShift: 0.06, lift: 0.035, fade: 0.06,
      toe: 0.28, shoulder: 0.40, halation: 0.32, diffusion: 0.16,
      splitShadow: [0.48, 0.44, 0.48], splitHighlight: [0.76, 0.56, 0.30], splitAmount: 0.38, bw: 0.0,
      vignette: 0.34, softFocus: 0.32, filmGrain: 0.04, shadowLift: 0.30,
      tyndall: 0.85, sunFlareVeil: 0.42, dappledBokeh: 0.25, anamorphicFlare: 0.15, lightLeak: 0.12, vintagePhoto: 0.05,
      filmLutMode: 6, filmLutStrength: 0.62,
    },
  },
  {
    id: 'window_shadow',
    shortLabel: '🪟 窗格斜射光斑',
    label: '🪟 窗格斜射光影情绪 · 百叶窗切割光斑与暗调胶片',
    visualPreset: 'wong_kar_wai_blinds',
    lightPreset: 'windowGobo',
    gobo: 'venetian_blinds',
    grade: {
      contrast: 1.15, saturation: 0.86, warmth: 0.35, tintShift: 0.02, lift: 0.04, fade: 0.09,
      toe: 0.48, shoulder: 0.32, halation: 0.22, diffusion: 0.12,
      splitShadow: [0.36, 0.46, 0.56], splitHighlight: [0.68, 0.52, 0.38], splitAmount: 0.36, bw: 0.0,
      vignette: 0.50, softFocus: 0.16, filmGrain: 0.05, shadowLift: 0.22,
      tyndall: 0.62, sunFlareVeil: 0.14, dappledBokeh: 0.0, anamorphicFlare: 0.08, lightLeak: 0.0, vintagePhoto: 0.0,
      filmLutMode: 0, filmLutStrength: 0.55,
    },
  },
  {
    id: 'leaf_dapple',
    shortLabel: '🌿 树影午后光斑',
    label: '🌿 午后梧桐树影斑驳 · 树隙光斑与富士Pro400H',
    visualPreset: 'dappled_forest_breeze',
    lightPreset: 'leafDapple',
    gobo: 'tree_dappled',
    grade: {
      contrast: 0.96, saturation: 0.92, warmth: -0.12, tintShift: -0.14, lift: 0.035, fade: 0.07,
      toe: 0.20, shoulder: 0.50, halation: 0.08, diffusion: 0.12,
      splitShadow: [0.36, 0.56, 0.52], splitHighlight: [0.60, 0.56, 0.46], splitAmount: 0.32, bw: 0.0,
      vignette: 0.26, softFocus: 0.22, filmGrain: 0.03, shadowLift: 0.38,
      tyndall: 0.58, sunFlareVeil: 0.18, dappledBokeh: 0.72, anamorphicFlare: 0.0, lightLeak: 0.0, vintagePhoto: 0.0,
      filmLutMode: 2, filmLutStrength: 0.58,
    },
  },
  {
    id: 'teal_orange',
    shortLabel: '🎬 好莱坞青橙电影',
    label: '🎬 好莱坞青橙大片滤镜 · 冷青暗部与暖金肤色对比',
    visualPreset: 'cinema_85mm_portrait',
    lightPreset: 'cinematicTeal',
    gobo: 'none',
    grade: {
      contrast: 1.16, saturation: 1.04, warmth: 0.12, tintShift: -0.04, lift: 0.018, fade: 0.03,
      toe: 0.38, shoulder: 0.36, halation: 0.14, diffusion: 0.06,
      splitShadow: [0.22, 0.52, 0.68], splitHighlight: [0.76, 0.52, 0.32], splitAmount: 0.52, bw: 0.0,
      vignette: 0.42, softFocus: 0.10, filmGrain: 0.03, shadowLift: 0.20,
      tyndall: 0.28, sunFlareVeil: 0.08, dappledBokeh: 0.0, anamorphicFlare: 0.48, lightLeak: 0.0, vintagePhoto: 0.0,
      filmLutMode: 0, filmLutStrength: 0.72,
    },
  },
  {
    id: 'rembrandt_oil',
    shortLabel: '🖼️ 古典油画伦勃朗',
    label: '🖼️ 伦勃朗古典油画光影 · 戏剧性三角侧光与深邃暗部',
    visualPreset: 'rembrandt_atelier_oil',
    lightPreset: 'rembrandt',
    gobo: 'none',
    grade: {
      contrast: 1.20, saturation: 0.82, warmth: 0.62, tintShift: 0.05, lift: 0.02, fade: 0.06,
      toe: 0.58, shoulder: 0.42, halation: 0.10, diffusion: 0.15,
      splitShadow: [0.40, 0.38, 0.34], splitHighlight: [0.72, 0.56, 0.34], splitAmount: 0.44, bw: 0.0,
      vignette: 0.62, softFocus: 0.20, filmGrain: 0.035, shadowCrush: 0.32, shadowLift: 0.16,
      tyndall: 0.24, sunFlareVeil: 0.06, dappledBokeh: 0.0, anamorphicFlare: 0.0, lightLeak: 0.0, vintagePhoto: 0.18,
      filmLutMode: 1, filmLutStrength: 0.55,
    },
  },
  {
    id: 'polaroid_instant',
    shortLabel: '📸 宝丽来复古相纸',
    label: '📸 复古宝丽来拍立得 · 怀旧暖调褪色与柔光暗角',
    visualPreset: 'vintage_silver_plate',
    lightPreset: 'indoorDay',
    gobo: 'none',
    grade: {
      contrast: 0.88, saturation: 0.82, warmth: 0.42, tintShift: 0.15, lift: 0.085, fade: 0.18,
      toe: 0.12, shoulder: 0.52, halation: 0.16, diffusion: 0.18,
      splitShadow: [0.44, 0.48, 0.62], splitHighlight: [0.68, 0.56, 0.38], splitAmount: 0.38, bw: 0.0,
      vignette: 0.46, softFocus: 0.28, filmGrain: 0.048, shadowLift: 0.48,
      tyndall: 0.25, sunFlareVeil: 0.18, dappledBokeh: 0.0, anamorphicFlare: 0.0, lightLeak: 0.34, vintagePhoto: 0.38,
      filmLutMode: 6, filmLutStrength: 0.52,
    },
  },
  {
    id: 'cinestill_night',
    shortLabel: '🌃 午夜霓虹800T',
    label: '🌃 CineStill 800T 午夜钨丝灯胶卷 · 冷蓝暗调与朱红光晕',
    visualPreset: 'cyber_neon_blade',
    lightPreset: 'cinematicTeal',
    gobo: 'rain_mullion',
    grade: {
      contrast: 1.12, saturation: 0.96, warmth: -0.48, tintShift: 0.08, lift: 0.022, fade: 0.04,
      toe: 0.32, shoulder: 0.32, halation: 0.68, diffusion: 0.12,
      splitShadow: [0.28, 0.48, 0.68], splitHighlight: [0.72, 0.48, 0.38], splitAmount: 0.42, bw: 0.0,
      vignette: 0.40, softFocus: 0.22, filmGrain: 0.055, shadowLift: 0.24,
      tyndall: 0.32, sunFlareVeil: 0.08, dappledBokeh: 0.0, anamorphicFlare: 0.52, lightLeak: 0.10, vintagePhoto: 0.0,
      filmLutMode: 3, filmLutStrength: 0.78,
    },
  },
  {
    id: 'mono_trix',
    shortLabel: '🖤 银盐黑白经典',
    label: '🖤 Kodak Tri-X 400 银盐黑白 · 极致骨相光影雕塑感',
    visualPreset: 'ilford_mono_noir',
    lightPreset: 'rembrandt',
    gobo: 'none',
    grade: {
      contrast: 1.22, saturation: 0.0, warmth: 0.0, tintShift: 0.0, lift: 0.022, fade: 0.04,
      toe: 0.42, shoulder: 0.32, halation: 0.0, diffusion: 0.06,
      splitShadow: [0.5, 0.5, 0.5], splitHighlight: [0.5, 0.5, 0.5], splitAmount: 0.0, bw: 1.0,
      vignette: 0.46, softFocus: 0.06, filmGrain: 0.085, shadowLift: 0.22,
      tyndall: 0.22, sunFlareVeil: 0.0, dappledBokeh: 0.0, anamorphicFlare: 0.0, lightLeak: 0.0, vintagePhoto: 0.0,
      filmLutMode: 4, filmLutStrength: 1.0,
    },
  },
];
for (const fp of DESKTOP_PET_FILTER_PRESETS) {
  if (fp.grade) Object.assign(fp, fp.grade);
}

export const BeautyGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    tSourceAlpha: { value: null },
    uResolution: { value: new THREE.Vector2(1280, 720) },
    uTime: { value: 0.0 },
    uVignette: { value: 0.44 },
    uSaturation: { value: 0.96 },
    uContrast: { value: 1.22 },
    uWarmth: { value: 0.12 },
    uSharpen: { value: 0.06 },
    uSoftFocus: { value: 0.58 },
    uDepthBlur: { value: 0.48 },
    uBlurMode: { value: 0.0 },
    uBlurPower: { value: 0.0 },
    uFocusCenterY: { value: 0.52 },
    uFade: { value: 0.0 },
    uTintShift: { value: 0.0 },
    uLift: { value: 0.006 },
    uToe: { value: 0.0 },
    uShoulder: { value: 0.0 },
    uDiffusion: { value: 0.0 },
    uBW: { value: 0.0 },
    uSplitShadow: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
    uSplitHighlight: { value: new THREE.Vector3(0.5, 0.5, 0.5) },
    uSplitAmount: { value: 0.0 },
    uChromatic: { value: 0.16 },
    uFilmGrain: { value: 0.07 },
    uTyndall: { value: 0.74 },
    uVintagePhoto: { value: 0.08 },
    uIrisSparkle: { value: 0.05 },
    uHalation: { value: 0.32 },
    uSkinLumen: { value: 0.0 },
    uSssBlur: { value: 0.24 },
    uMicroContrast: { value: 0.48 },
    uHighlightRoll: { value: 0.42 },
    uShadowCrush: { value: 0.18 },
    uSunFlareVeil: { value: 0.22 },
    uDappledBokeh: { value: 0.0 },
    uAnamorphicFlare: { value: 0.16 },
    uLightLeak: { value: 0.08 },
    uSwirlyBokeh: { value: 0.0 },
    uWetLensDrop: { value: 0.0 },
    uLensDistortion: { value: 0.04 },
    uFilmLutMode: { value: 1.0 },
    uFilmLutStrength: { value: 0.48 },
    uCasSharpen: { value: 0.68 },
    uExposure: { value: 1.08 },
    uShadowLift: { value: 0.28 },
    uSpecularClarity: { value: 0.75 },
    uTyndallAngle: { value: -0.58 },
    uTyndallColor: { value: new THREE.Vector3(1.0, 0.91, 0.76) },
    uTint: { value: new THREE.Vector3(1.04, 0.99, 0.94) },
    uShadowTint: { value: new THREE.Vector3(0.055, 0.042, 0.028) },
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
    uniform float uTime;
    uniform float uVignette;
    uniform float uSaturation;
    uniform float uContrast;
    uniform float uWarmth;
    uniform float uSharpen;
    uniform float uSoftFocus;
    uniform float uDepthBlur;
    uniform float uBlurMode;
    uniform float uBlurPower;
    uniform float uFocusCenterY;
    uniform float uFade;
    uniform float uTintShift;
    uniform float uLift;
    uniform float uToe;
    uniform float uShoulder;
    uniform float uDiffusion;
    uniform float uBW;
    uniform vec3 uSplitShadow;
    uniform vec3 uSplitHighlight;
    uniform float uSplitAmount;
    uniform float uChromatic;
    uniform float uFilmGrain;
    uniform float uTyndall;
    uniform float uVintagePhoto;
    uniform float uIrisSparkle;
    uniform float uHalation;
    uniform float uSkinLumen;
    uniform float uSssBlur;
    uniform float uMicroContrast;
    uniform float uHighlightRoll;
    uniform float uShadowCrush;
    uniform float uSunFlareVeil;
    uniform float uDappledBokeh;
    uniform float uAnamorphicFlare;
    uniform float uLightLeak;
    uniform float uSwirlyBokeh;
    uniform float uWetLensDrop;
    uniform float uLensDistortion;
    uniform float uFilmLutMode;
    uniform float uFilmLutStrength;
    uniform float uCasSharpen;
    uniform float uExposure;
    uniform float uShadowLift;
    uniform float uSpecularClarity;
    uniform float uTyndallAngle;
    uniform vec3 uTyndallColor;
    uniform vec3 uTint;
    uniform vec3 uShadowTint;
    varying vec2 vUv;

    // Hardware-Bilinear 8-Tap Dual-Ring Optical Portrait Lens Diffusion Kernel (samples 32 texels in 8 fetches!)
    vec3 sampleRingBlur(vec2 uv, vec2 radiusTexel) {
      vec3 sum = texture2D(tDiffuse, uv).rgb * 0.20;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.85,  0.35) * radiusTexel * 0.78, 0.002, 0.998)).rgb * 0.125;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.85, -0.35) * radiusTexel * 0.78, 0.002, 0.998)).rgb * 0.125;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.35,  0.85) * radiusTexel * 0.78, 0.002, 0.998)).rgb * 0.125;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.35, -0.85) * radiusTexel * 0.78, 0.002, 0.998)).rgb * 0.125;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.924,  0.383) * radiusTexel * 1.42, 0.002, 0.998)).rgb * 0.075;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.924, -0.383) * radiusTexel * 1.42, 0.002, 0.998)).rgb * 0.075;
      sum += texture2D(tDiffuse, clamp(uv + vec2(-0.383,  0.924) * radiusTexel * 1.42, 0.002, 0.998)).rgb * 0.075;
      sum += texture2D(tDiffuse, clamp(uv + vec2( 0.383, -0.924) * radiusTexel * 1.42, 0.002, 0.998)).rgb * 0.075;
      return sum;
    }

    // Petzval / Helios-44 Swirly Tangential Bokeh Sampler
    vec3 sampleSwirlyBokeh(vec2 uv, vec2 centerVec, vec2 texel, float swirlStrength) {
      vec2 tang = normalize(vec2(-centerVec.y, centerVec.x) + vec2(1e-5));
      vec2 rad  = normalize(centerVec + vec2(1e-5));
      vec2 stepT = tang * texel * (6.5 * swirlStrength);
      vec2 stepR = rad  * texel * (2.2 * swirlStrength);
      vec3 acc = texture2D(tDiffuse, uv).rgb * 0.22;
      acc += texture2D(tDiffuse, clamp(uv + stepT * 0.5 + stepR * 0.25, 0.002, 0.998)).rgb * 0.16;
      acc += texture2D(tDiffuse, clamp(uv - stepT * 0.5 + stepR * 0.25, 0.002, 0.998)).rgb * 0.16;
      acc += texture2D(tDiffuse, clamp(uv + stepT * 1.0 - stepR * 0.35, 0.002, 0.998)).rgb * 0.13;
      acc += texture2D(tDiffuse, clamp(uv - stepT * 1.0 - stepR * 0.35, 0.002, 0.998)).rgb * 0.13;
      acc += texture2D(tDiffuse, clamp(uv + stepT * 1.55, 0.002, 0.998)).rgb * 0.10;
      acc += texture2D(tDiffuse, clamp(uv - stepT * 1.55, 0.002, 0.998)).rgb * 0.10;
      return acc;
    }

    // 8 Cinema Film Stock Emulsion LUT Curves
    vec3 applyCinemaFilmStockLUT(vec3 c, float modeVal) {
      float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));
      float shMask = clamp(1.0 - smoothstep(0.0, 0.42, lum), 0.0, 1.0);
      float hiMask = smoothstep(0.38, 0.95, lum);
      float midMask = clamp(1.0 - shMask - hiMask * 0.65, 0.0, 1.0);

      if (modeVal < 0.5) {
        // 0: Kodak Vision3 2383 Print Film (Rich golden-amber highlights + deep teal-emerald shadows)
        vec3 graded = c * mix(vec3(0.84, 0.96, 1.04), vec3(1.10, 0.99, 0.84), smoothstep(0.12, 0.68, lum));
        graded += vec3(-0.012, 0.014, 0.022) * shMask;
        graded += vec3(0.032, 0.015, -0.016) * hiMask;
        return max(graded, vec3(0.0));
      } else if (modeVal < 1.5) {
        // 1: Kodak Portra 160 Sunlit Portrait (Reference Photo uploads/image-1.png: creamy peach-gold skin + warm olive-espresso shadows)
        vec3 graded = c * mix(vec3(0.92, 0.88, 0.76), vec3(1.08, 0.98, 0.86), smoothstep(0.10, 0.65, lum));
        graded += vec3(0.018, 0.012, -0.006) * midMask;
        graded += vec3(0.036, 0.018, -0.014) * hiMask;
        return max(graded, vec3(0.0));
      } else if (modeVal < 2.5) {
        // 2: Fujifilm Eterna / Velvia 50 Foliage Cinema (Crisp emerald-jade shadows + translucent warm ivory skin)
        vec3 graded = c * mix(vec3(0.82, 0.98, 0.88), vec3(1.04, 1.01, 0.94), smoothstep(0.14, 0.70, lum));
        graded += vec3(-0.010, 0.018, 0.006) * shMask;
        return max(graded, vec3(0.0));
      } else if (modeVal < 3.5) {
        // 3: CineStill 800T Tungsten Halation (Cool cyan-teal shadows + warm ruby-amber halation highlights)
        vec3 graded = c * mix(vec3(0.78, 0.95, 1.12), vec3(1.12, 0.94, 0.82), smoothstep(0.16, 0.66, lum));
        graded += vec3(-0.016, 0.010, 0.030) * shMask;
        graded += vec3(0.048, 0.012, -0.018) * hiMask;
        return max(graded, vec3(0.0));
      } else if (modeVal < 4.5) {
        // 4: Ilford HP5 Warm Platinum-Palladium Silver Monochrome (Sculptural Rembrandt B&W with warm ivory highlights)
        vec3 mono = vec3(lum);
        mono *= mix(vec3(0.88, 0.84, 0.80), vec3(1.08, 1.02, 0.93), smoothstep(0.08, 0.78, lum));
        return max(mono, vec3(0.0));
      } else if (modeVal < 5.5) {
        // 5: Bleach Bypass Silver Retention (Desaturated, high-metallic micro-contrast cinema look)
        vec3 desat = mix(vec3(lum), c, 0.48);
        vec3 silver = pow(max(desat, vec3(0.0001)), vec3(1.18)) * 1.06;
        return max(silver, vec3(0.0));
      } else if (modeVal < 6.5) {
        // 6: Agfa Vista 200 Golden Sunset Film (Warm nostalgic amber-rose midtones + velvety sepia-brown shadows)
        vec3 graded = c * mix(vec3(0.98, 0.84, 0.72), vec3(1.12, 0.97, 0.82), smoothstep(0.08, 0.64, lum));
        graded += vec3(0.025, 0.008, -0.010) * (midMask + hiMask * 0.5);
        return max(graded, vec3(0.0));
      }
      // 7: Natural Linear
      return c;
    }

    void main() {
      vec2 texel = 1.0 / max(uResolution, vec2(256.0));
      vec2 rawCenter = vUv - vec2(0.5);
      float rawR2 = dot(rawCenter, rawCenter);

      // 0A. Subtle Optical Prime Lens Barrel/Pincushion Curvature (uLensDistortion)
      float srcAlphaRaw = texture2D(tSourceAlpha, vUv).r;
      vec2 uv = vUv;
      if (abs(uLensDistortion) > 0.001 && srcAlphaRaw > 0.01) {
        vec2 warped = vec2(0.5) + rawCenter * (1.0 - uLensDistortion * 0.085 * rawR2);
        if (warped.x > 0.002 && warped.x < 0.998 && warped.y > 0.002 && warped.y < 0.998) {
          float warpedAlpha = texture2D(tSourceAlpha, warped).r;
          if (warpedAlpha > 0.01) uv = warped;
        }
      }

      float srcAlpha = texture2D(tSourceAlpha, uv).r;
      vec2 centerVec = uv - vec2(0.5);
      float radialDist = length(centerVec);

      // 0B. Optical Lens Chromatic Dispersion (vintage 85mm f/1.2 lateral color fringing)
      vec2 caOffset = centerVec * radialDist * (uChromatic * 0.0046) * smoothstep(0.05, 0.5, srcAlpha);
      vec3 col;
      col.r = texture2D(tDiffuse, clamp(uv + caOffset, 0.001, 0.999)).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, clamp(uv - caOffset, 0.001, 0.999)).b;
      if (!(col.r >= 0.0 && col.g >= 0.0 && col.b >= 0.0)) col = vec3(0.0);
      col = clamp(col, 0.0, 4.0);

      // 0C. Stage 41 Real-Time Exposure Compensation & Non-Linear Shadow Fill Lift (uExposure + uShadowLift)
      col *= clamp(uExposure, 0.40, 2.20);
      if (uShadowLift > 0.005 && srcAlpha > 0.01) {
        float lumInit = dot(col, vec3(0.2126, 0.7152, 0.0722));
        float liftZone = (1.0 - smoothstep(0.0, 0.46, lumInit)) * smoothstep(0.002, 0.035, lumInit);
        col += (col * 0.92 + vec3(0.022, 0.018, 0.016)) * liftZone * clamp(uShadowLift, 0.0, 1.5);
      }

      // 1. Adjustable Analog Film Highlight Shoulder Roll-Off (uHighlightRoll)
      // Preserves bright sunlit cheek glow while smoothly rolling off harsh digital clipping
      float shoulderKnee = mix(1.05, 0.72, clamp(uHighlightRoll, 0.0, 1.5) * 0.65);
      float shoulderStrength = 0.25 + clamp(uHighlightRoll, 0.0, 1.5) * 0.45;
      col = col / (vec3(1.0) + max(vec3(0.0), col - vec3(shoulderKnee)) * shoulderStrength);

      // Compute foreground skin & fine-edge subject protection mask so multi-head desktop shelves stay razor-sharp!
      vec3 nTap = texture2D(tDiffuse, uv + vec2(0.0, texel.y)).rgb * clamp(uExposure, 0.40, 2.20);
      vec3 sTap = texture2D(tDiffuse, uv - vec2(0.0, texel.y)).rgb * clamp(uExposure, 0.40, 2.20);
      vec3 eTap = texture2D(tDiffuse, uv + vec2(texel.x, 0.0)).rgb * clamp(uExposure, 0.40, 2.20);
      vec3 wTap = texture2D(tDiffuse, uv - vec2(texel.x, 0.0)).rgb * clamp(uExposure, 0.40, 2.20);
      vec3 blur1 = 0.25 * (nTap + sTap + eTap + wTap);
      float skinWarmMask = smoothstep(-0.015, 0.085, (col.r - col.g) + (col.g - col.b) * 0.65)
                         * smoothstep(0.025, 0.20, dot(col, vec3(0.299, 0.587, 0.114)));
      float fineEdgeMask = smoothstep(0.008, 0.045, length(col - blur1));
      float subjectKeepSharpMask = clamp(max(skinWarmMask * 0.92, fineEdgeMask * 0.88), 0.0, 0.95);

      // Shared single-pass wide ring blur reused across SSS, Micro-Contrast, Soft-Focus & Halation (cuts 85 taps down to 8!)
      bool needWideBlur = (srcAlpha > 0.005) && (
        (uSssBlur > 0.005 && skinWarmMask > 0.01) ||
        (uMicroContrast > 0.005) ||
        (uSoftFocus > 0.001 || uHalation > 0.001)
      );
      vec3 sharedWideBlur = needWideBlur
        ? sampleRingBlur(uv, texel * 3.8) * clamp(uExposure, 0.40, 2.20)
        : blur1;

      // 2. Screen-Space Subsurface Scattering (SSSSS) Red-Channel Dermal Diffusion (uSssBlur)
      if (uSssBlur > 0.005 && srcAlpha > 0.01 && skinWarmMask > 0.01) {
        vec3 sssDiff = mix(blur1, sharedWideBlur, 0.52);
        float sssAmt = clamp(uSssBlur * skinWarmMask * (1.0 - fineEdgeMask * 0.85), 0.0, 0.75);
        float lumBeforeSss = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col.r = mix(col.r, sssDiff.r * 1.02, sssAmt * 0.46);
        col.g = mix(col.g, sssDiff.g,        sssAmt * 0.18);
        col.b = mix(col.b, sssDiff.b * 0.99, sssAmt * 0.06);
        float lumAfterSss = max(0.0001, dot(col, vec3(0.2126, 0.7152, 0.0722)));
        col *= mix(1.0, lumBeforeSss / lumAfterSss, 0.65);
      }

      // 3. Local Micro-Contrast & Screen-Space Sculptural Clarity (uMicroContrast)
      if (uMicroContrast > 0.005 && srcAlpha > 0.01) {
        float lumCur = dot(col, vec3(0.2126, 0.7152, 0.0722));
        float lumMean = dot(sharedWideBlur, vec3(0.2126, 0.7152, 0.0722));
        float localDiff = clamp(lumCur - lumMean, -0.16, 0.16);
        float aoWeight = localDiff < 0.0 ? 1.18 : 0.82;
        col = max(vec3(0.0), col + col * (localDiff * aoWeight * uMicroContrast * 1.05));
      }

      // 4A. Stage 41 AMD FidelityFX CAS 5-Tap Contrast-Adaptive Sharpening (uCasSharpen) + Unsharp Mask (uSharpen)
      if ((uCasSharpen > 0.005 || uSharpen > 0.005) && srcAlpha > 0.01) {
        float casStrength = clamp(uCasSharpen + uSharpen * 0.45, 0.0, 1.65);
        vec3 minRGB = min(min(min(nTap, sTap), min(eTap, wTap)), col);
        vec3 maxRGB = max(max(max(nTap, sTap), max(eTap, wTap)), col);
        vec3 amp = sqrt(clamp(min(minRGB, max(vec3(1.0) - maxRGB, vec3(0.0))) / max(maxRGB, vec3(0.0001)), 0.0, 1.0));
        float peak = -1.0 / mix(8.0, 4.6, clamp(casStrength, 0.0, 1.5));
        vec3 wCas = amp * peak;
        vec3 casCol = clamp((col + (nTap + sTap + eTap + wTap) * wCas) / max(vec3(1.0) + 4.0 * wCas, vec3(0.15)), 0.0, 4.0);
        col = mix(col, casCol, clamp(casStrength * 0.88, 0.0, 1.0));
      }

      // 4B. Stage 41 Pinpoint Specular & Catchlight Micro-Clarity (uSpecularClarity)
      if (uSpecularClarity > 0.005 && srcAlpha > 0.01) {
        float lumSpec = dot(col, vec3(0.2126, 0.7152, 0.0722));
        float hiSpec = smoothstep(0.48, 0.94, lumSpec) * clamp(length(col - blur1) * 5.2, 0.0, 1.0);
        col += col * hiSpec * clamp(uSpecularClarity, 0.0, 1.6) * 0.36;
      }

      // 5. True Optical Highlight-Only Black Pro-Mist & Silver-Halide Halation (uSoftFocus + uHalation)
      if ((uSoftFocus > 0.001 || uHalation > 0.001) && srcAlpha > 0.005) {
        vec3 mistNear = mix(blur1, sharedWideBlur, 0.35);
        vec3 mistWide = sharedWideBlur;
        vec3 mistBlend = mix(mistNear, mistWide, 0.48);
        float mistLuma = dot(mistBlend, vec3(0.2126, 0.7152, 0.0722));
        float hiOnlyMask = smoothstep(0.64, 0.96, mistLuma) * (1.0 - fineEdgeMask * 0.75);
        vec3 softCol = mix(col, mistBlend, clamp(uSoftFocus * 0.32 * hiOnlyMask, 0.0, 0.42));
        vec3 hiGlow = max(vec3(0.0), mistWide - vec3(0.56)) * (uSoftFocus * 0.22) * vec3(1.08, 0.95, 0.82);
        vec3 halationEdge = max(vec3(0.0), mistWide - col * 0.86 - vec3(0.42)) * (uHalation * 0.38) * vec3(1.22, 0.50, 0.22);
        col = softCol + (hiGlow + halationEdge) * srcAlpha;
      }

      // 6. Subject-Preserving Peripheral Bokeh DOF + Petzval Swirly Bokeh (uDepthBlur + uSwirlyBokeh)
      if ((uDepthBlur > 0.001 || uSwirlyBokeh > 0.001) && srcAlpha > 0.005) {
        float bgMask = 1.0 - subjectKeepSharpMask;
        float bokehMask = smoothstep(0.42, 0.82, length((uv - vec2(0.50, 0.50)) * vec2(0.88, 1.08))) * bgMask;
        float blurAmt = clamp(bokehMask * uDepthBlur, 0.0, 1.0);
        if (blurAmt > 0.005) {
          vec3 dofSample = sampleRingBlur(uv, texel * (3.2 + blurAmt * 6.0)) * clamp(uExposure, 0.40, 2.20);
          col = mix(col, dofSample, clamp(blurAmt * 0.72, 0.0, 0.78));
        }
        float swirlMask = smoothstep(0.44, 0.84, radialDist) * clamp(uSwirlyBokeh, 0.0, 1.5) * bgMask;
        if (swirlMask > 0.005) {
          vec3 swirled = sampleSwirlyBokeh(uv, centerVec, texel, swirlMask) * clamp(uExposure, 0.40, 2.20);
          col = mix(col, swirled, clamp(swirlMask * 0.65, 0.0, 0.75));
        }
      }

      // 6B. Multi-Mode Desktop Pet Optical Blur Suite (uBlurMode 1..5 + uBlurPower)
      float resScale = max(0.75, uResolution.y / 900.0);
      if (uBlurMode > 0.5 && uBlurPower > 0.005 && srcAlpha > 0.005) {
        float bp = clamp(uBlurPower, 0.0, 1.5);
        if (uBlurMode < 1.5) {
          // Mode 1: 85mm f/1.2 Portrait Bokeh DOF (keeps central focal circle sharp, blurs periphery/background with 12-tap golden-angle disc)
          float distFromFocus = length((uv - vec2(0.50, uFocusCenterY)) * vec2(0.95, 1.15));
          float coc = smoothstep(0.10, 0.52, distFromFocus) * bp;
          if (coc > 0.005) {
            vec3 bokehAcc = vec3(0.0);
            float wSum = 0.0;
            for (int i = 0; i < 12; i++) {
              float ang = float(i) * 2.399963;
              float rad = (3.2 + float(i) * 2.4) * coc * resScale;
              vec2 offUv = clamp(uv + vec2(cos(ang), sin(ang)) * texel * rad, 0.002, 0.998);
              vec3 tap = texture2D(tDiffuse, offUv).rgb * clamp(uExposure, 0.40, 2.20);
              float tapLum = dot(tap, vec3(0.2126, 0.7152, 0.0722));
              float w = 1.0 + smoothstep(0.50, 0.92, tapLum) * 1.65;
              bokehAcc += tap * w;
              wSum += w;
            }
            col = mix(col, bokehAcc / max(wSum, 0.001), clamp(coc * 0.96, 0.0, 0.96));
          }
        } else if (uBlurMode < 2.5) {
          // Mode 2: Black Pro-Mist Creamy Glamour Diffusion (12-tap highlight bloom + micro-contrast softening)
          vec3 wideAcc = vec3(0.0);
          for (int i = 0; i < 12; i++) {
            float ang = float(i) * 2.399963;
            float rad = (3.8 + float(i) * 2.2) * bp * resScale;
            vec2 offUv = clamp(uv + vec2(cos(ang), sin(ang)) * texel * rad, 0.002, 0.998);
            wideAcc += texture2D(tDiffuse, offUv).rgb * clamp(uExposure, 0.40, 2.20);
          }
          wideAcc /= 12.0;
          col = mix(col, max(col * 0.90, wideAcc), clamp(bp * 0.68, 0.0, 0.85));
          col += max(wideAcc - vec3(0.46), vec3(0.0)) * bp * 0.56 * vec3(1.06, 0.96, 0.90);
        } else if (uBlurMode < 3.5) {
          // Mode 3: Tilt-Shift Miniature Lens Blur (sharp horizontal focal band at uFocusCenterY, progressive top/bottom blur)
          float bandDist = abs(uv.y - uFocusCenterY);
          float tiltMask = smoothstep(0.05, 0.30, bandDist) * bp;
          if (tiltMask > 0.005) {
            vec3 tiltBlur = sampleRingBlur(uv, texel * (5.5 + tiltMask * 16.0) * resScale) * clamp(uExposure, 0.40, 2.20);
            col = mix(col, tiltBlur, clamp(tiltMask * 0.95, 0.0, 0.96));
          }
        } else if (uBlurMode < 4.5) {
          // Mode 4: Petzval / Radial Focus Blur (sharp center, directional + tangential swirl toward edges)
          vec2 fVec = uv - vec2(0.50, uFocusCenterY);
          float rMask = smoothstep(0.10, 0.52, length(fVec)) * bp;
          if (rMask > 0.005) {
            vec3 radSwirl = sampleSwirlyBokeh(uv, fVec, texel, rMask * 2.4 * resScale) * clamp(uExposure, 0.40, 2.20);
            col = mix(col, radSwirl, clamp(rMask * 0.92, 0.0, 0.94));
          }
        } else {
          // Mode 5: Full-Frame Creamy Dream Haze Blur
          vec3 hazeBlur1 = sampleRingBlur(uv, texel * (4.5 + bp * 12.0) * resScale) * clamp(uExposure, 0.40, 2.20);
          vec3 hazeBlur2 = sampleRingBlur(uv, texel * (9.0 + bp * 22.0) * resScale) * clamp(uExposure, 0.40, 2.20);
          col = mix(col, mix(hazeBlur1, hazeBlur2, 0.55), clamp(bp * 0.88, 0.0, 0.94));
        }
      }

      // 7. Cinema Anamorphic Horizontal Lens Streak Flare (uAnamorphicFlare)
      if (uAnamorphicFlare > 0.005 && srcAlpha > 0.005) {
        vec3 anamSum = vec3(0.0);
        float offsets[4];
        offsets[0] = -14.0; offsets[1] = -5.5;
        offsets[2] =  5.5;  offsets[3] =  14.0;
        for (int i = 0; i < 4; i++) {
          vec2 sUv = clamp(uv + vec2(offsets[i] * texel.x * 2.2, 0.0), 0.002, 0.998);
          vec3 sCol = texture2D(tDiffuse, sUv).rgb;
          float sLum = dot(sCol, vec3(0.2126, 0.7152, 0.0722));
          float hiPass = smoothstep(0.62, 0.98, sLum);
          anamSum += sCol * hiPass * (0.30 - abs(offsets[i]) * 0.011);
        }
        vec3 streakTint = mix(vec3(1.12, 0.88, 0.62), vec3(0.68, 0.88, 1.25), 0.35);
        col += anamSum * streakTint * uAnamorphicFlare * 0.38 * srcAlpha;
      }

      // 8. Reference-Photo Sun-Flare Veil + Crepuscular God-Rays + Upper-Corner Warm Golden Bokeh
      vec2 lightOrigin = uTyndallAngle <= 0.0 ? vec2(0.84, 0.92) : vec2(0.14, 0.90);
      if ((uTyndall > 0.001 || uSunFlareVeil > 0.001) && srcAlpha > 0.005) {
        vec2 delta = (lightOrigin - uv) * 0.30;
        vec2 sampleUv = uv;
        float scatter = 0.0;
        float weight = 0.34;
        for (int i = 0; i < 4; i++) {
          sampleUv += delta * 0.25;
          vec2 clampedUv = clamp(sampleUv, 0.01, 0.99);
          vec3 sc = texture2D(tDiffuse, clampedUv).rgb;
          float lumS = dot(sc, vec3(0.299, 0.587, 0.114));
          scatter += smoothstep(0.30, 0.85, lumS) * weight;
          weight *= 0.72;
        }
        // Crepuscular Volumetric God-Ray Scatter (uTyndall)
        vec3 tyndallCol = mix(uTyndallColor, vec3(1.06, 0.88, 0.72), 0.45);
        col += tyndallCol * (scatter * 0.20 * uTyndall * srcAlpha);

        // Upper-Corner Warm Peach-Gold Sun-Flare Veiling Glare & Optical Aperture Ghost Ring (uSunFlareVeil)
        if (uSunFlareVeil > 0.001) {
          float flareDist = length((uv - lightOrigin) * vec2(0.85, 0.95));
          float sunVeil = pow(clamp(1.0 - flareDist * 1.15, 0.0, 1.0), 2.4);
          vec2 ghostCenter = mix(lightOrigin, vec2(0.5), 0.68);
          float ghostDist = length((uv - ghostCenter) * vec2(1.05, 0.95));
          float ghostRing = smoothstep(0.22, 0.16, abs(ghostDist - 0.18)) * smoothstep(0.38, 0.05, ghostDist);
          vec3 flareAdd = tyndallCol * (sunVeil * 0.12 + ghostRing * 0.032 * vec3(1.12, 0.95, 0.74));
          col += flareAdd * uSunFlareVeil * srcAlpha;
        }
      }

      // 9. Upper-Canopy Warm Golden Sunlight Bokeh Circles (uDappledBokeh)
      // Fixed in Stage 41: ZERO muddy green blotches over lower-right desktop heads!
      if (uDappledBokeh > 0.001 && srcAlpha > 0.005) {
        vec2 canopyCorner = vec2(1.0 - lightOrigin.x, 0.88);
        float folDist = length((uv - canopyCorner) * vec2(0.92, 1.15));
        float folZone = smoothstep(0.48, 0.08, folDist) * clamp(uDappledBokeh, 0.0, 1.5) * (1.0 - skinWarmMask * 0.92);
        if (folZone > 0.01) {
          float drift = sin(uTime * 0.45) * 0.010;
          float b1 = smoothstep(0.058, 0.012, length(uv - (canopyCorner + vec2(-0.08 + drift, -0.06))));
          float b2 = smoothstep(0.046, 0.010, length(uv - (canopyCorner + vec2(-0.03 - drift, -0.12))));
          float b3 = smoothstep(0.064, 0.014, length(uv - (canopyCorner + vec2(-0.14, -0.04 + drift))));
          float bokehDots = clamp(b1 + b2 * 0.85 + b3 * 0.72, 0.0, 1.25);
          col += vec3(1.08, 0.88, 0.56) * bokehDots * folZone * 0.18 * srcAlpha;
        }
      }

      // 10. Rainy Window Breath Mist & Dew Refraction Halo (uWetLensDrop)
      if (uWetLensDrop > 0.005 && srcAlpha > 0.005) {
        float edgeMist = smoothstep(0.18, 0.65, radialDist) * clamp(uWetLensDrop, 0.0, 1.5);
        vec3 mistSample = sampleRingBlur(uv, texel * (6.0 + edgeMist * 8.0));
        // Micro water-droplet caustic shimmer
        vec2 dropGrid = uv * vec2(26.0, 18.0) + vec2(0.0, uTime * 0.08);
        vec2 dropCell = fract(dropGrid) - vec2(0.5);
        float dropHash = fract(sin(dot(floor(dropGrid), vec2(127.1, 311.7))) * 43758.5453);
        float dropMask = smoothstep(0.28, 0.06, length(dropCell * vec2(1.0, 0.75))) * step(0.62, dropHash);
        col = mix(col, mistSample * vec3(0.96, 1.01, 1.06) + vec3(0.025, 0.032, 0.042), clamp(edgeMist * 0.45, 0.0, 0.65));
        col += mistSample * dropMask * uWetLensDrop * 0.14 * srcAlpha;
      }

      // 11. Analog Camera Film Burn & Corner Light Leak (uLightLeak)
      if (uLightLeak > 0.005 && srcAlpha > 0.005) {
        float tSlow = uTime * 0.32;
        float leakL = pow(clamp(1.0 - length((uv - vec2(0.04, 0.28 + sin(tSlow) * 0.08)) * vec2(1.35, 0.75)), 0.0, 1.0), 2.6);
        float leakR = pow(clamp(1.0 - length((uv - vec2(0.95, 0.74 + cos(tSlow * 0.8) * 0.08)) * vec2(1.45, 0.82)), 0.0, 1.0), 2.8);
        vec3 leakColor = leakL * vec3(1.18, 0.42, 0.14) + leakR * vec3(1.12, 0.68, 0.22);
        col += leakColor * uLightLeak * 0.28 * srcAlpha;
      }

      // 12. White Balance (Kelvin Warmth + Green/Magenta TintShift) & Pro-Mist / Halation Lens Layer (matching masterQuality/postChain.js)
      if ((uDiffusion > 0.001 || uHalation > 0.12) && srcAlpha > 0.005) {
        vec3 wideD = vec3(0.0); vec3 hlD = vec3(0.0);
        for (int i = 0; i < 12; i++) {
          float a = float(i) * 2.39996; float rr = (3.0 + float(i) * 1.6) * resScale;
          vec2 o = clamp(uv + vec2(cos(a), sin(a)) * rr * texel, 0.002, 0.998);
          vec3 s = texture2D(tDiffuse, o).rgb * clamp(uExposure, 0.40, 2.20);
          wideD += s; hlD += max(s - vec3(0.68), vec3(0.0));
        }
        wideD /= 12.0; hlD /= 12.0;
        col = mix(col, max(col, wideD), uDiffusion * 0.62);
        col += max(wideD - vec3(0.52), vec3(0.0)) * uDiffusion * 0.52;
        col += hlD * vec3(1.0, 0.32, 0.12) * uHalation * 1.65 * srcAlpha;
      }

      col *= vec3(1.0 + uWarmth * 0.14, 1.0 - uTintShift * 0.08, 1.0 - uWarmth * 0.14);
      col.rb *= 1.0 + uTintShift * 0.04;
      col = max(col, vec3(0.0));

      // 13. Highlight / Midtone Art-Style Tint
      col *= uTint;

      // 14. 8 Cinema Film Stock Emulsion LUT Curves (uFilmLutMode + uFilmLutStrength)
      if (uFilmLutStrength > 0.005 && srcAlpha > 0.005) {
        vec3 lutCol = applyCinemaFilmStockLUT(col, uFilmLutMode);
        col = mix(col, lutCol, clamp(uFilmLutStrength, 0.0, 1.0));
      }

      // 15. Film Stock Toe/Shoulder Curve, Black Lift, Fade & Filmic Contrast (matching masterQuality/postChain.js)
      float lumaPre = dot(col, vec3(0.2126, 0.7152, 0.0722));
      if (uToe > 0.001) {
        col = mix(col, col * smoothstep(0.0, 0.38, lumaPre + 0.04) * 1.06, clamp(uToe * 0.65, 0.0, 0.85));
      }
      if (uShoulder > 0.001) {
        col = col / (vec3(1.0) + col * uShoulder * 0.38) * (1.0 + uShoulder * 0.38);
      }
      if (uLift > 0.001 && srcAlpha > 0.005) {
        col = col * (1.0 - uLift) + vec3(uLift);
      }
      if (uFade > 0.001 && srcAlpha > 0.005) {
        col = mix(col, col * 0.86 + vec3(0.065), clamp(uFade, 0.0, 0.75));
      }
      float contrastPower = clamp(uContrast, 0.80, 1.65);
      vec3 filmicS = pow(max(col, vec3(0.0001)), vec3(contrastPower)) * pow(0.34, 1.0 - contrastPower);
      float crushAmt = clamp(uShadowCrush * 0.45 + max(0.0, contrastPower - 1.0) * 0.45, 0.0, 0.75);
      float deepShadowToe = smoothstep(0.0, 0.36, lumaPre);
      filmicS *= mix(1.0, 0.78 + 0.24 * deepShadowToe, clamp(crushAmt, 0.0, 0.75));
      // Preserve dark hair strand contrast (lumaPre < 0.18) instead of clipping (col - 0.5)*contrast + 0.5 below zero!
      vec3 linContrast = max(col * 0.75, (col - 0.5) * contrastPower + 0.5);
      col = mix(linContrast, filmicS, 0.72);
      col = max(col, vec3(0.0));

      // 16. Creamy Shadow Split-Toning
      float lumaPostC = dot(col, vec3(0.2126, 0.7152, 0.0722));
      float shadowMask = clamp(1.0 - smoothstep(0.06, 0.42, lumaPostC), 0.0, 1.0) * smoothstep(0.018, 0.070, lumaPostC);
      col += uShadowTint * shadowMask * 0.30;

      // 17. Saturation
      float luma = dot(col, vec3(0.2126, 0.7152, 0.0722));
      col = mix(vec3(luma), col, uSaturation);

      // 16B. Soft-Light Cinema Split-Toning & Monochrome (matching masterQuality/postChain.js)
      if (uSplitAmount > 0.001 && srcAlpha > 0.005) {
        float lumST = clamp(dot(col, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0);
        float wST = smoothstep(0.0, 1.0, lumST);
        vec3 splitCol = mix(uSplitShadow, uSplitHighlight, wST);
        vec3 baseClamped = clamp(col, 0.0, 1.0);
        vec3 softSplit = mix(
          2.0 * baseClamped * splitCol + baseClamped * baseClamped * (1.0 - 2.0 * splitCol),
          sqrt(max(baseClamped, vec3(0.0001))) * (2.0 * splitCol - 1.0) + 2.0 * baseClamped * (1.0 - splitCol),
          step(vec3(0.5), splitCol)
        );
        col = mix(col, softSplit, clamp(uSplitAmount, 0.0, 0.95));
      }
      if (uBW > 0.001 && srcAlpha > 0.005) {
        float lumBW = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(col, vec3(lumBW), clamp(uBW, 0.0, 1.0));
      }

      // 18. Authentic Silver-Halide Vintage Old-Photo Emulsion (uVintagePhoto)
      if (uVintagePhoto > 0.001 && srcAlpha > 0.005) {
        float vp = clamp(uVintagePhoto, 0.0, 1.0);
        float lumV = dot(col, vec3(0.299, 0.587, 0.114));
        vec3 sepiaTone = vec3(
          lumV * 1.08 + 0.022,
          lumV * 0.96 + 0.014,
          lumV * 0.80 + 0.010
        );
        vec3 analogEmulsion = mix(col, sepiaTone, 0.34);
        analogEmulsion = vec3(0.022, 0.017, 0.015) + analogEmulsion * vec3(0.92, 0.89, 0.84);
        vec3 halBlur = sampleRingBlur(uv, texel * 5.5);
        float hiMask = smoothstep(0.44, 0.86, dot(halBlur, vec3(0.299, 0.587, 0.114)));
        analogEmulsion += vec3(0.058, 0.032, 0.014) * hiMask * srcAlpha;
        col = mix(col, analogEmulsion, vp);
      }

      // 19. Organic 35mm Silver-Halide Dual-Frequency Film Grain (uFilmGrain)
      if (uFilmGrain > 0.001 && srcAlpha > 0.01) {
        vec2 grainUv = floor(uv * uResolution * 0.78);
        float noiseFine = fract(sin(dot(grainUv, vec2(12.9898, 78.233))) * 43758.5453) - 0.5;
        vec2 clumpUv = floor(uv * uResolution * 0.38);
        float noiseClump = fract(sin(dot(clumpUv, vec2(39.346, 11.135))) * 28461.328) - 0.5;
        float combinedGrain = noiseFine * 0.72 + noiseClump * 0.28;
        float midWeight = smoothstep(0.02, 0.18, luma) * (1.0 - smoothstep(0.75, 0.98, luma));
        col += combinedGrain * uFilmGrain * (0.048 + 0.048 * midWeight) * srcAlpha;
      }

      // 20. Atmospheric Portrait Vignette
      vec2 d = (uv - vec2(0.5)) * vec2(1.08, 0.96);
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

  // True 16-Bit HalfFloat HDR RenderTarget (4x MSAA for full 4-step alphaToCoverage hair feathering)
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
      'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ float a=texture2D(tDiffuse,vUv).a; gl_FragColor=vec4(smoothstep(0.005,0.12,a),0.0,0.0,1.0); }',
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

  const initBloomStr = options.bloomStrength ?? 0.11;
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    initBloomStr,
    options.bloomRadius ?? 0.54,
    options.bloomThreshold ?? 0.88
  );
  bloomPass.enabled = initBloomStr > 0.045;

  const gradePass = new ShaderPass(BeautyGradeShader);
  gradePass.uniforms.tSourceAlpha.value = alphaTarget.texture;
  gradePass.uniforms.uResolution.value.set(width * pixelRatio, height * pixelRatio);

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

  const startMs = performance.now();

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
      if (params.bloomStrength !== undefined) {
        bloomPass.strength = Number(params.bloomStrength);
        bloomPass.enabled = bloomPass.strength > 0.045;
      }
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
      if (params.sssBlur !== undefined) u.uSssBlur.value = Number(params.sssBlur);
      if (params.microContrast !== undefined) u.uMicroContrast.value = Number(params.microContrast);
      if (params.highlightRoll !== undefined) u.uHighlightRoll.value = Number(params.highlightRoll);
      if (params.shadowCrush !== undefined) u.uShadowCrush.value = Number(params.shadowCrush);
      if (params.sunFlareVeil !== undefined) u.uSunFlareVeil.value = Number(params.sunFlareVeil);
      if (params.dappledBokeh !== undefined) u.uDappledBokeh.value = Number(params.dappledBokeh);
      if (params.anamorphicFlare !== undefined) u.uAnamorphicFlare.value = Number(params.anamorphicFlare);
      if (params.lightLeak !== undefined) u.uLightLeak.value = Number(params.lightLeak);
      if (params.swirlyBokeh !== undefined) u.uSwirlyBokeh.value = Number(params.swirlyBokeh);
      if (params.wetLensDrop !== undefined) u.uWetLensDrop.value = Number(params.wetLensDrop);
      if (params.lensDistortion !== undefined) u.uLensDistortion.value = Number(params.lensDistortion);
      if (params.blurMode !== undefined && u.uBlurMode) {
        const bm = DESKTOP_PET_BLUR_MODES.find(m => m.id === params.blurMode);
        u.uBlurMode.value = bm ? bm.modeInt : Number(params.blurMode) || 0.0;
      }
      if (params.blurPower !== undefined && u.uBlurPower) u.uBlurPower.value = Number(params.blurPower);
      if (params.focusCenterY !== undefined && u.uFocusCenterY) u.uFocusCenterY.value = Number(params.focusCenterY);
      if (params.fade !== undefined && u.uFade) u.uFade.value = Number(params.fade);
      if (params.tintShift !== undefined && u.uTintShift) u.uTintShift.value = Number(params.tintShift);
      if (params.lift !== undefined && u.uLift) u.uLift.value = Number(params.lift);
      if (params.toe !== undefined && u.uToe) u.uToe.value = Number(params.toe);
      if (params.shoulder !== undefined && u.uShoulder) u.uShoulder.value = Number(params.shoulder);
      if (params.diffusion !== undefined && u.uDiffusion) u.uDiffusion.value = Number(params.diffusion);
      if (params.bw !== undefined && u.uBW) u.uBW.value = Number(params.bw);
      if (params.splitAmount !== undefined && u.uSplitAmount) u.uSplitAmount.value = Number(params.splitAmount);
      if (Array.isArray(params.splitShadow) && u.uSplitShadow) {
        u.uSplitShadow.value.set(params.splitShadow[0], params.splitShadow[1], params.splitShadow[2]);
      }
      if (Array.isArray(params.splitHighlight) && u.uSplitHighlight) {
        u.uSplitHighlight.value.set(params.splitHighlight[0], params.splitHighlight[1], params.splitHighlight[2]);
      }
      if (params.filmLutMode !== undefined) {
        const lutItem = FILM_LUT_CATALOG.find(l => l.id === params.filmLutMode);
        u.uFilmLutMode.value = lutItem ? lutItem.modeInt : Number(params.filmLutMode) || 1.0;
      }
      if (params.filmLutStrength !== undefined) u.uFilmLutStrength.value = Number(params.filmLutStrength);
      if (params.casSharpen !== undefined && u.uCasSharpen) u.uCasSharpen.value = Number(params.casSharpen);
      if (params.exposure !== undefined && u.uExposure) u.uExposure.value = Number(params.exposure);
      if (params.shadowLift !== undefined && u.uShadowLift) u.uShadowLift.value = Number(params.shadowLift);
      if (params.specularClarity !== undefined && u.uSpecularClarity) u.uSpecularClarity.value = Number(params.specularClarity);
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
      if (params.filterPreset !== undefined) {
        const fp = DESKTOP_PET_FILTER_PRESETS.find(p => p.id === params.filterPreset);
        if (fp) {
          const g = fp.grade || fp;
          if (g.warmth !== undefined) u.uWarmth.value = Number(g.warmth);
          if (g.tintShift !== undefined && u.uTintShift) u.uTintShift.value = Number(g.tintShift);
          if (g.contrast !== undefined) u.uContrast.value = Number(g.contrast);
          if (g.saturation !== undefined) u.uSaturation.value = Number(g.saturation);
          if (g.vignette !== undefined) u.uVignette.value = Number(g.vignette);
          if (g.lift !== undefined && u.uLift) u.uLift.value = Number(g.lift);
          if (g.fade !== undefined && u.uFade) u.uFade.value = Number(g.fade);
          if (g.toe !== undefined && u.uToe) u.uToe.value = Number(g.toe);
          if (g.shoulder !== undefined && u.uShoulder) u.uShoulder.value = Number(g.shoulder);
          if (g.halation !== undefined) u.uHalation.value = Number(g.halation);
          if (g.diffusion !== undefined && u.uDiffusion) u.uDiffusion.value = Number(g.diffusion);
          if (g.bw !== undefined && u.uBW) u.uBW.value = Number(g.bw);
          if (g.softFocus !== undefined) u.uSoftFocus.value = Number(g.softFocus);
          if (g.shadowLift !== undefined && u.uShadowLift) u.uShadowLift.value = Number(g.shadowLift);
          if (g.shadowCrush !== undefined && u.uShadowCrush) u.uShadowCrush.value = Number(g.shadowCrush);
          if (g.filmGrain !== undefined) u.uFilmGrain.value = Number(g.filmGrain);
          if (g.tyndall !== undefined) u.uTyndall.value = Number(g.tyndall);
          if (g.sunFlareVeil !== undefined) u.uSunFlareVeil.value = Number(g.sunFlareVeil);
          if (g.dappledBokeh !== undefined) u.uDappledBokeh.value = Number(g.dappledBokeh);
          if (g.anamorphicFlare !== undefined) u.uAnamorphicFlare.value = Number(g.anamorphicFlare);
          if (g.lightLeak !== undefined) u.uLightLeak.value = Number(g.lightLeak);
          if (g.vintagePhoto !== undefined) u.uVintagePhoto.value = Number(g.vintagePhoto);
          if (g.filmLutMode !== undefined) u.uFilmLutMode.value = Number(g.filmLutMode);
          if (g.filmLutStrength !== undefined) u.uFilmLutStrength.value = Number(g.filmLutStrength);
          if (g.splitAmount !== undefined && u.uSplitAmount) u.uSplitAmount.value = Number(g.splitAmount);
          if (Array.isArray(g.splitShadow) && u.uSplitShadow) {
            u.uSplitShadow.value.set(g.splitShadow[0], g.splitShadow[1], g.splitShadow[2]);
          }
          if (Array.isArray(g.splitHighlight) && u.uSplitHighlight) {
            u.uSplitHighlight.value.set(g.splitHighlight[0], g.splitHighlight[1], g.splitHighlight[2]);
          }
        }
      }
    },
    render() {
      gradePass.uniforms.uTime.value = (performance.now() - startMs) * 0.001;
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
