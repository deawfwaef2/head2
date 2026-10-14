import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Stage 23 · 大师级实时光影·画风色调·材质微距定制管线
 * (Real-Time Customizable Lighting, Art-Style Color Grading & SSS Material Pipeline)
 */

export const RENDER_QUALITY_LEVELS = ['low', 'medium', 'high', 'ultra', 'rtx2070'];

export const HDR_ENVIRONMENT_CATALOG = [
  { id: 'softbox_portrait', label: '📸 85mm 影棚双柔光箱 + 环形眼神光 HDR (人像推荐)' },
  { id: 'golden_hour', label: '🌅 落日暖金胶片逆光 HDR (夕阳暖肤漫反射)' },
  { id: 'rainy_window', label: '🌧️ 雨夜书房天光漫射 + 暖台灯 HDR (沉浸伴学)' },
  { id: 'museum_velvet', label: '🏛️ 卢浮宫天鹅绒展柜穹顶 HDR (戏剧性明暗)' },
];

export const WINDOW_GOBO_CATALOG = [
  { id: 'rain_mullion', modeInt: 1, label: '🌧️ 雨夜十字窗格 + 柔和漫射窗光 (伴学推荐)' },
  { id: 'venetian_blinds', modeInt: 2, label: '🪟 书房百叶窗柔化漫射光 (电影感光影)' },
  { id: 'gothic_lattice', modeInt: 3, label: '🏰 哥特菱格花窗柔光 (古典标本馆)' },
  { id: 'tree_dappled', modeInt: 4, label: '🌿 窗外梧桐树影柔光 (静谧庭院)' },
  { id: 'none', modeInt: 0, label: '🔦 纯净影棚无影柔光箱 (无窗框投影)' },
];

export const GLOBAL_CHIAROSCURO_UNIFORMS = {
  uSssIntensity: { value: 0.82 },
  uChiaroscuro: { value: 0.68 },
  uWindowGoboMode: { value: 1.0 },
  uWindowGoboStrength: { value: 0.34 },
  uWindowLightDir: { value: new THREE.Vector3(0.54, 0.44, 0.72).normalize() },
  uCursorLightDir: { value: new THREE.Vector3(0.18, 0.28, 0.94).normalize() },
  uCursorTorchIntensity: { value: 0.28 },
};

export function updateInteractiveCursorLight(ndcX = 0, ndcY = 0) {
  const lx = Math.max(-0.85, Math.min(0.85, Number(ndcX) * 0.75));
  const ly = Math.max(-0.65, Math.min(0.85, Number(ndcY) * 0.65 + 0.18));
  GLOBAL_CHIAROSCURO_UNIFORMS.uCursorLightDir.value.set(lx, ly, 0.92).normalize();
}

export const VISUAL_STYLE_PRESETS = {
  cinema_85mm_portrait: {
    id: 'cinema_85mm_portrait',
    label: '🎞️ 85mm 怀旧柔焦写真 · 窗畔伦勃朗光影与胶片老照片感 (默认首推)',
    hdrMode: 'golden_hour',
    keyColor: '#ffeed6',
    fillColor: '#768db0',
    rimColor: '#fcd9a8',
    hemiSky: '#f7ece0',
    hemiGround: '#161110',
    keyIntensity: 1.36,
    fillIntensity: 0.28,
    rimIntensity: 0.78,
    hemiIntensity: 0.24,
    upIntensity: 0.14,
    keyAzimuthDeg: 38,
    keyElevationDeg: 28,
    exposure: 0.80,
    envIntensity: 0.32,
    contrast: 1.09,
    saturation: 0.90,
    warmth: 0.07,
    vignette: 0.36,
    sharpen: 0.06,
    softFocus: 0.56,
    depthBlur: 0.44,
    chromatic: 0.14,
    bloomStrength: 0.07,
    filmGrain: 0.09,
    tyndall: 0.58,
    vintagePhoto: 0.48,
    skinGloss: 0.12,
    sssIntensity: 0.82,
    chiaroscuro: 0.68,
    irisSparkle: 0.05,
    halation: 0.28,
    skinLumen: 0.0,
    cursorTorch: 0.28,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.34,
    tint: [1.02, 0.99, 0.94],
    shadowTint: [0.035, 0.025, 0.022],
  },
  korean_magazine_glow: {
    id: 'korean_magazine_glow',
    label: '✨ 柔雾胶片写真 · 细腻哑光绒肌与浅景深虚化',
    hdrMode: 'softbox_portrait',
    keyColor: '#fff3e8',
    fillColor: '#8da8cc',
    rimColor: '#fde6d8',
    hemiSky: '#faf2ec',
    hemiGround: '#1a1416',
    keyIntensity: 1.38,
    fillIntensity: 0.34,
    rimIntensity: 0.82,
    hemiIntensity: 0.28,
    upIntensity: 0.16,
    keyAzimuthDeg: 32,
    keyElevationDeg: 26,
    exposure: 0.82,
    envIntensity: 0.34,
    contrast: 1.07,
    saturation: 0.94,
    warmth: 0.03,
    vignette: 0.30,
    sharpen: 0.08,
    softFocus: 0.52,
    depthBlur: 0.38,
    chromatic: 0.10,
    bloomStrength: 0.07,
    filmGrain: 0.07,
    tyndall: 0.44,
    vintagePhoto: 0.32,
    skinGloss: 0.14,
    sssIntensity: 0.84,
    chiaroscuro: 0.56,
    irisSparkle: 0.06,
    halation: 0.24,
    skinLumen: 0.0,
    cursorTorch: 0.30,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.26,
    tint: [1.01, 0.995, 0.98],
    shadowTint: [0.03, 0.022, 0.028],
  },
  wong_kar_wai_film: {
    id: 'wong_kar_wai_film',
    label: '🎞️ 王家卫式电影胶片 · 复古暖金暗调与黑柔镜晕染',
    hdrMode: 'golden_hour',
    keyColor: '#ffd69e',
    fillColor: '#4c7a78',
    rimColor: '#fbbf24',
    hemiSky: '#ffe8c8',
    hemiGround: '#0e1615',
    keyIntensity: 1.42,
    fillIntensity: 0.24,
    rimIntensity: 0.88,
    hemiIntensity: 0.20,
    upIntensity: 0.12,
    keyAzimuthDeg: 42,
    keyElevationDeg: 28,
    exposure: 0.78,
    envIntensity: 0.28,
    contrast: 1.14,
    saturation: 0.88,
    warmth: 0.11,
    vignette: 0.44,
    sharpen: 0.04,
    softFocus: 0.60,
    depthBlur: 0.48,
    chromatic: 0.18,
    bloomStrength: 0.08,
    filmGrain: 0.15,
    tyndall: 0.64,
    vintagePhoto: 0.62,
    skinGloss: 0.12,
    sssIntensity: 0.82,
    chiaroscuro: 0.78,
    irisSparkle: 0.04,
    halation: 0.34,
    skinLumen: 0.0,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.40,
    tint: [1.03, 0.98, 0.90],
    shadowTint: [0.02, 0.04, 0.03],
  },
  dreamy_promist_soft: {
    id: 'dreamy_promist_soft',
    label: '☁️ 电影黑柔镜 (1/4 Pro-Mist) · 极致光学柔焦模糊彻底消除3D感',
    hdrMode: 'softbox_portrait',
    keyColor: '#ffeedf',
    fillColor: '#8ba2c4',
    rimColor: '#f8d8c8',
    hemiSky: '#faf0ea',
    hemiGround: '#181214',
    keyIntensity: 1.32,
    fillIntensity: 0.30,
    rimIntensity: 0.74,
    hemiIntensity: 0.24,
    upIntensity: 0.14,
    keyAzimuthDeg: 36,
    keyElevationDeg: 28,
    exposure: 0.79,
    envIntensity: 0.30,
    contrast: 1.06,
    saturation: 0.90,
    warmth: 0.06,
    vignette: 0.36,
    sharpen: 0.0,
    softFocus: 0.74,
    depthBlur: 0.56,
    chromatic: 0.14,
    bloomStrength: 0.08,
    filmGrain: 0.10,
    tyndall: 0.52,
    vintagePhoto: 0.46,
    skinGloss: 0.10,
    sssIntensity: 0.80,
    chiaroscuro: 0.64,
    irisSparkle: 0.04,
    halation: 0.32,
    skinLumen: 0.0,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.32,
    tint: [1.02, 0.99, 0.95],
    shadowTint: [0.035, 0.025, 0.028],
  },
  kodak_portra_400: {
    id: 'kodak_portra_400',
    label: '📷 柯达 Portra 400 人像胶卷 · 真实光学微单暖肤色温',
    hdrMode: 'golden_hour',
    keyColor: '#ffeed9',
    fillColor: '#8ea8c8',
    rimColor: '#ffe2bd',
    hemiSky: '#fff4e8',
    hemiGround: '#1a1412',
    keyIntensity: 1.62,
    fillIntensity: 0.44,
    rimIntensity: 1.28,
    hemiIntensity: 0.34,
    upIntensity: 0.22,
    keyAzimuthDeg: 32,
    keyElevationDeg: 30,
    exposure: 0.87,
    envIntensity: 0.86,
    contrast: 1.08,
    saturation: 0.96,
    warmth: 0.05,
    vignette: 0.28,
    sharpen: 0.26,
    softFocus: 0.06,
    depthBlur: 0.0,
    chromatic: 0.08,
    bloomStrength: 0.05,
    filmGrain: 0.09,
    tyndall: 0.38,
    vintagePhoto: 0.18,
    skinGloss: 0.36,
    sssIntensity: 0.84,
    chiaroscuro: 0.58,
    windowGobo: 'tree_dappled',
    windowGoboStrength: 0.24,
    tint: [1.01, 0.995, 0.97],
    shadowTint: [0.025, 0.02, 0.02],
  },
  fujifilm_eterna_cinema: {
    id: 'fujifilm_eterna_cinema',
    label: '🍃 富士 Eterna 电影空气感 · 日系清透青白柔焦胶片',
    hdrMode: 'rainy_window',
    keyColor: '#f4f8ff',
    fillColor: '#88abc8',
    rimColor: '#cceeff',
    hemiSky: '#f0f7ff',
    hemiGround: '#121820',
    keyIntensity: 1.58,
    fillIntensity: 0.48,
    rimIntensity: 1.32,
    hemiIntensity: 0.36,
    upIntensity: 0.22,
    keyAzimuthDeg: 28,
    keyElevationDeg: 32,
    exposure: 0.88,
    envIntensity: 0.90,
    contrast: 1.07,
    saturation: 0.94,
    warmth: -0.02,
    vignette: 0.26,
    sharpen: 0.28,
    softFocus: 0.06,
    depthBlur: 0.0,
    chromatic: 0.08,
    bloomStrength: 0.05,
    filmGrain: 0.07,
    tyndall: 0.32,
    vintagePhoto: 0.10,
    skinGloss: 0.38,
    sssIntensity: 0.80,
    chiaroscuro: 0.54,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.22,
    tint: [0.98, 1.00, 1.02],
    shadowTint: [0.015, 0.025, 0.04],
  },
  sunset_amber_hdr: {
    id: 'sunset_amber_hdr',
    label: '🌅 暮色琥珀夕照 HDR · 逆光发丝金边与暖橘柔焦散射',
    hdrMode: 'golden_hour',
    keyColor: '#ffe0ba',
    fillColor: '#7c8db5',
    rimColor: '#fbbf24',
    hemiSky: '#ffedd5',
    hemiGround: '#18100e',
    keyIntensity: 1.66,
    fillIntensity: 0.42,
    rimIntensity: 1.52,
    hemiIntensity: 0.32,
    upIntensity: 0.20,
    keyAzimuthDeg: 40,
    keyElevationDeg: 26,
    exposure: 0.87,
    envIntensity: 0.92,
    contrast: 1.09,
    saturation: 0.99,
    warmth: 0.09,
    vignette: 0.30,
    sharpen: 0.26,
    softFocus: 0.07,
    depthBlur: 0.0,
    chromatic: 0.10,
    bloomStrength: 0.06,
    filmGrain: 0.08,
    tyndall: 0.52,
    vintagePhoto: 0.18,
    skinGloss: 0.40,
    sssIntensity: 0.88,
    chiaroscuro: 0.62,
    windowGobo: 'tree_dappled',
    windowGoboStrength: 0.28,
    tint: [1.02, 0.99, 0.95],
    shadowTint: [0.03, 0.02, 0.025],
  },
  rainy_study: {
    id: 'rainy_study',
    label: '🌧️ 雨夜伴学书房 · 窗畔冷暖交织与柔和景深虚化',
    hdrMode: 'rainy_window',
    keyColor: '#ffeed6',
    fillColor: '#7f98bd',
    rimColor: '#f7d8b6',
    hemiSky: '#f5ece0',
    hemiGround: '#1a1514',
    keyIntensity: 1.98,
    fillIntensity: 0.50,
    rimIntensity: 1.24,
    hemiIntensity: 0.42,
    upIntensity: 0.30,
    keyAzimuthDeg: 34,
    keyElevationDeg: 30,
    exposure: 0.95,
    envIntensity: 0.46,
    contrast: 1.08,
    saturation: 0.96,
    warmth: 0.06,
    vignette: 0.32,
    sharpen: 0.24,
    softFocus: 0.42,
    depthBlur: 0.30,
    chromatic: 0.18,
    bloomStrength: 0.08,
    filmGrain: 0.12,
    tyndall: 0.56,
    vintagePhoto: 0.28,
    skinGloss: 0.18,
    sssIntensity: 1.45,
    chiaroscuro: 0.62,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.32,
    tint: [1.01, 0.99, 0.97],
    shadowTint: [0.045, 0.035, 0.05],
  },
  warm_gallery: {
    id: 'warm_gallery',
    label: '🏛️ 暖金私人藏馆 · 伦勃朗柔化立体光影',
    hdrMode: 'museum_velvet',
    keyColor: '#ffebd6',
    fillColor: '#89a0c4',
    rimColor: '#ffe0c4',
    hemiSky: '#fff5ee',
    hemiGround: '#1a1418',
    keyIntensity: 1.96,
    fillIntensity: 0.48,
    rimIntensity: 1.22,
    hemiIntensity: 0.40,
    upIntensity: 0.28,
    keyAzimuthDeg: 34,
    keyElevationDeg: 32,
    exposure: 0.95,
    envIntensity: 0.46,
    contrast: 1.08,
    saturation: 0.98,
    warmth: 0.07,
    vignette: 0.32,
    sharpen: 0.24,
    softFocus: 0.40,
    depthBlur: 0.28,
    chromatic: 0.16,
    bloomStrength: 0.08,
    filmGrain: 0.10,
    tyndall: 0.52,
    vintagePhoto: 0.24,
    skinGloss: 0.18,
    sssIntensity: 1.42,
    chiaroscuro: 0.64,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.30,
    tint: [1.02, 0.99, 0.96],
    shadowTint: [0.04, 0.03, 0.035],
  },
  cold_forensic: {
    id: 'cold_forensic',
    label: '❄️ 冷冽法医标本室 · 无影灯清冷冰瓷滤镜',
    hdrMode: 'rainy_window',
    keyColor: '#eef6ff',
    fillColor: '#82a4cf',
    rimColor: '#bae6fd',
    hemiSky: '#eaf3ff',
    hemiGround: '#121824',
    keyIntensity: 1.95,
    fillIntensity: 0.54,
    rimIntensity: 1.28,
    hemiIntensity: 0.42,
    upIntensity: 0.30,
    keyAzimuthDeg: 28,
    keyElevationDeg: 36,
    exposure: 0.95,
    envIntensity: 0.46,
    contrast: 1.10,
    saturation: 0.93,
    warmth: -0.05,
    vignette: 0.32,
    sharpen: 0.30,
    softFocus: 0.32,
    depthBlur: 0.24,
    chromatic: 0.14,
    bloomStrength: 0.06,
    filmGrain: 0.10,
    tyndall: 0.42,
    vintagePhoto: 0.16,
    skinGloss: 0.20,
    sssIntensity: 1.32,
    chiaroscuro: 0.65,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.28,
    tint: [0.97, 0.99, 1.03],
    shadowTint: [0.02, 0.035, 0.06],
  },
  gothic_velvet: {
    id: 'gothic_velvet',
    label: '🕯️ 暗夜哥特烛光 · 古典油画级柔焦明暗',
    hdrMode: 'museum_velvet',
    keyColor: '#ffdcb3',
    fillColor: '#6676a0',
    rimColor: '#fda4af',
    hemiSky: '#ffe8d6',
    hemiGround: '#140c10',
    keyIntensity: 2.08,
    fillIntensity: 0.38,
    rimIntensity: 1.32,
    hemiIntensity: 0.32,
    upIntensity: 0.24,
    keyAzimuthDeg: 42,
    keyElevationDeg: 28,
    exposure: 0.93,
    envIntensity: 0.38,
    contrast: 1.12,
    saturation: 0.95,
    warmth: 0.12,
    vignette: 0.40,
    sharpen: 0.20,
    softFocus: 0.48,
    depthBlur: 0.36,
    chromatic: 0.22,
    bloomStrength: 0.09,
    filmGrain: 0.16,
    tyndall: 0.64,
    vintagePhoto: 0.44,
    skinGloss: 0.18,
    sssIntensity: 1.48,
    chiaroscuro: 0.78,
    windowGobo: 'gothic_lattice',
    windowGoboStrength: 0.36,
    tint: [1.03, 0.98, 0.93],
    shadowTint: [0.06, 0.03, 0.045],
  },
  luxury_porcelain: {
    id: 'luxury_porcelain',
    label: '🌸 晨光凝脂画报 · 柔光箱无影高通透玉肌',
    hdrMode: 'softbox_portrait',
    keyColor: '#fff5eb',
    fillColor: '#a8c0e2',
    rimColor: '#ffe4e6',
    hemiSky: '#fff8f6',
    hemiGround: '#20181c',
    keyIntensity: 1.88,
    fillIntensity: 0.64,
    rimIntensity: 1.18,
    hemiIntensity: 0.52,
    upIntensity: 0.34,
    keyAzimuthDeg: 28,
    keyElevationDeg: 28,
    exposure: 0.97,
    envIntensity: 0.56,
    contrast: 1.05,
    saturation: 0.98,
    warmth: 0.05,
    vignette: 0.24,
    sharpen: 0.20,
    softFocus: 0.52,
    depthBlur: 0.32,
    chromatic: 0.15,
    bloomStrength: 0.09,
    filmGrain: 0.08,
    tyndall: 0.48,
    vintagePhoto: 0.20,
    skinGloss: 0.20,
    sssIntensity: 1.52,
    chiaroscuro: 0.45,
    windowGobo: 'tree_dappled',
    windowGoboStrength: 0.22,
    tint: [1.02, 0.995, 0.98],
    shadowTint: [0.04, 0.03, 0.035],
  },
  cyber_vitrine: {
    id: 'cyber_vitrine',
    label: '🔮 雨夜霓虹展柜 · 冰蓝绯红冷暖双切割',
    hdrMode: 'rainy_window',
    keyColor: '#f0f7ff',
    fillColor: '#38bdf8',
    rimColor: '#fb7185',
    hemiSky: '#e0f2fe',
    hemiGround: '#140c1e',
    keyIntensity: 1.95,
    fillIntensity: 0.46,
    rimIntensity: 1.65,
    hemiIntensity: 0.38,
    upIntensity: 0.28,
    keyAzimuthDeg: -34,
    keyElevationDeg: 30,
    exposure: 0.94,
    envIntensity: 0.44,
    contrast: 1.10,
    saturation: 1.04,
    warmth: -0.02,
    vignette: 0.36,
    sharpen: 0.24,
    softFocus: 0.40,
    depthBlur: 0.32,
    chromatic: 0.24,
    bloomStrength: 0.10,
    filmGrain: 0.10,
    tyndall: 0.58,
    vintagePhoto: 0.18,
    skinGloss: 0.22,
    sssIntensity: 1.38,
    chiaroscuro: 0.68,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.34,
    tint: [0.99, 0.98, 1.04],
    shadowTint: [0.04, 0.01, 0.06],
  },
  vintage_film: {
    id: 'vintage_film',
    label: '🕰️ 民国银盐老相片 · 怀旧柔焦胶片颗粒与暖金高光',
    hdrMode: 'golden_hour',
    keyColor: '#ffe6c8',
    fillColor: '#94887c',
    rimColor: '#fcd34d',
    hemiSky: '#fff0db',
    hemiGround: '#1c1512',
    keyIntensity: 1.98,
    fillIntensity: 0.44,
    rimIntensity: 1.24,
    hemiIntensity: 0.38,
    upIntensity: 0.26,
    keyAzimuthDeg: 38,
    keyElevationDeg: 32,
    exposure: 0.94,
    envIntensity: 0.42,
    contrast: 1.08,
    saturation: 0.86,
    warmth: 0.14,
    vignette: 0.40,
    sharpen: 0.18,
    softFocus: 0.54,
    depthBlur: 0.38,
    chromatic: 0.24,
    bloomStrength: 0.09,
    filmGrain: 0.22,
    tyndall: 0.68,
    vintagePhoto: 0.58,
    skinGloss: 0.18,
    sssIntensity: 1.42,
    chiaroscuro: 0.65,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.32,
    tint: [1.04, 0.98, 0.90],
    shadowTint: [0.07, 0.05, 0.03],
  },
};

const pmremEnvCache = new WeakMap();

export function applyBaseRendererSettings(renderer, exposure = 0.90) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false;
  renderer.shadowMap.needsUpdate = true;
}

export function requestShadowUpdate(renderer) {
  if (renderer && renderer.shadowMap && renderer.shadowMap.enabled) {
    renderer.shadowMap.needsUpdate = true;
  }
}

export function ensureSceneEnvironment(renderer, scene, intensity = 0.88, hdrMode = 'softbox_portrait') {
  let envMapByMode = pmremEnvCache.get(renderer);
  if (!envMapByMode) {
    envMapByMode = new Map();
    pmremEnvCache.set(renderer, envMapByMode);
  }
  const modeKey = hdrMode || 'softbox_portrait';
  let envTex = envMapByMode.get(modeKey);
  if (!envTex) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    // Build a high-contrast dark-velvet studio HDR light dome instead of a flat white box so HDR sculpts facial topography!
    const domeScene = new THREE.Scene();

    const modePalettes = {
      softbox_portrait: {
        bg: new THREE.Color(0.018, 0.020, 0.028),
        ring: new THREE.Color(1.45, 1.38, 1.30),
        warmBox: new THREE.Color(1.55, 1.34, 1.18),
        coolBox: new THREE.Color(0.32, 0.42, 0.58),
        rimStrip: new THREE.Color(0.95, 1.05, 1.22),
        bounceBox: new THREE.Color(0.26, 0.22, 0.20),
      },
      golden_hour: {
        bg: new THREE.Color(0.024, 0.014, 0.010),
        ring: new THREE.Color(1.65, 1.18, 0.68),
        warmBox: new THREE.Color(1.75, 1.12, 0.58),
        coolBox: new THREE.Color(0.22, 0.32, 0.52),
        rimStrip: new THREE.Color(1.35, 0.92, 0.44),
        bounceBox: new THREE.Color(0.32, 0.20, 0.14),
      },
      rainy_window: {
        bg: new THREE.Color(0.012, 0.022, 0.038),
        ring: new THREE.Color(1.18, 1.48, 1.75),
        warmBox: new THREE.Color(1.12, 1.32, 1.62),
        coolBox: new THREE.Color(0.35, 0.52, 0.78),
        rimStrip: new THREE.Color(0.92, 1.28, 1.58),
        bounceBox: new THREE.Color(0.18, 0.26, 0.36),
      },
      museum_velvet: {
        bg: new THREE.Color(0.014, 0.010, 0.018),
        ring: new THREE.Color(1.42, 1.16, 0.88),
        warmBox: new THREE.Color(1.52, 1.14, 0.78),
        coolBox: new THREE.Color(0.24, 0.22, 0.38),
        rimStrip: new THREE.Color(1.12, 0.88, 0.64),
        bounceBox: new THREE.Color(0.20, 0.15, 0.18),
      },
    };
    const pal = modePalettes[modeKey] || modePalettes.softbox_portrait;
    domeScene.background = pal.bg;

    // Circular Portrait Beauty-Dish Ring Light in front (+Z) for circular eye catchlights & nose-tip glint
    const ringGeo = new THREE.RingGeometry(1.15, 1.72, 48);
    const ringMat = new THREE.MeshBasicMaterial({ color: pal.ring, side: THREE.DoubleSide });
    const beautyRing = new THREE.Mesh(ringGeo, ringMat);
    beautyRing.position.set(0.24, 1.05, 4.0);
    beautyRing.lookAt(0, 0.12, 0);
    domeScene.add(beautyRing);

    // Key Octabox Softbox Panel (top-right-front)
    const warmBox = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 3.4),
      new THREE.MeshBasicMaterial({ color: pal.warmBox, side: THREE.DoubleSide })
    );
    warmBox.position.set(3.2, 2.4, 3.0);
    warmBox.lookAt(0, 0, 0);
    domeScene.add(warmBox);

    // Fill Softbox Panel (left-front)
    const coolBox = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 3.2),
      new THREE.MeshBasicMaterial({ color: pal.coolBox, side: THREE.DoubleSide })
    );
    coolBox.position.set(-3.6, 1.4, 2.4);
    coolBox.lookAt(0, 0, 0);
    domeScene.add(coolBox);

    // High-Contrast Rim Strip Softbox (top-left-back) for cheek & jawline HDR rim sculpting
    const rimStrip = new THREE.Mesh(
      new THREE.PlaneGeometry(1.8, 4.6),
      new THREE.MeshBasicMaterial({ color: pal.rimStrip, side: THREE.DoubleSide })
    );
    rimStrip.position.set(-2.8, 2.8, -3.4);
    rimStrip.lookAt(0, 0, 0);
    domeScene.add(rimStrip);

    // Subtle Lower Chin Reflector Bounce Card
    const bounceCard = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 2.8),
      new THREE.MeshBasicMaterial({ color: pal.bounceBox, side: THREE.DoubleSide })
    );
    bounceCard.position.set(0.0, -2.8, 2.4);
    bounceCard.lookAt(0, 0, 0);
    domeScene.add(bounceCard);

    envTex = pmrem.fromScene(domeScene, 0.032).texture;
    domeScene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    pmrem.dispose();
    envMapByMode.set(modeKey, envTex);
  }
  scene.environment = envTex;
  if ('environmentIntensity' in scene) {
    scene.environmentIntensity = intensity;
  }
  return envTex;
}

/**
 * Stage 33 · Crisp Photographic Dermis SSS + High-Contrast HDR Facial Reflection Pipeline:
 * - Eliminates the excessive uniform orange-peach SSS wash that made faces look overexposed and silicone-like.
 * - Preserves full HDR environment reflection (`indirectSpecular`) with natural Fresnel cheek/nose/lip sheen so
 *   switching HDR modes (`softbox_portrait`, `golden_hour`, `rainy_window`, `museum_velvet`) visibly sculpts the face!
 */
export function injectAestheticSubsurfaceScattering(material, initialSss = 0.92) {
  material.userData = material.userData || {};
  material.userData.uSssIntensity = GLOBAL_CHIAROSCURO_UNIFORMS.uSssIntensity;
  if (typeof initialSss === 'number') {
    GLOBAL_CHIAROSCURO_UNIFORMS.uSssIntensity.value = initialSss;
  }

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSssIntensity = GLOBAL_CHIAROSCURO_UNIFORMS.uSssIntensity;
    shader.uniforms.uChiaroscuro = GLOBAL_CHIAROSCURO_UNIFORMS.uChiaroscuro;
    shader.uniforms.uWindowGoboMode = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboMode;
    shader.uniforms.uWindowGoboStrength = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboStrength;
    shader.uniforms.uWindowLightDir = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowLightDir;
    shader.uniforms.uCursorLightDir = GLOBAL_CHIAROSCURO_UNIFORMS.uCursorLightDir;
    shader.uniforms.uCursorTorchIntensity = GLOBAL_CHIAROSCURO_UNIFORMS.uCursorTorchIntensity;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      varying vec3 vCervixWorldPos;
      varying vec3 vCervixLocalPos;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
      vCervixLocalPos = position;
      vCervixWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_physical_pars_fragment>',
      `#include <lights_physical_pars_fragment>
      uniform float uSssIntensity;
      uniform float uChiaroscuro;
      uniform float uWindowGoboMode;
      uniform float uWindowGoboStrength;
      uniform vec3 uWindowLightDir;
      uniform vec3 uCursorLightDir;
      uniform float uCursorTorchIntensity;
      varying vec3 vCervixWorldPos;
      varying vec3 vCervixLocalPos;

      float computeWindowBeamEnvelope(vec3 worldPos, vec3 lightDir) {
        if (uWindowGoboMode < 0.5 || uWindowGoboStrength <= 0.001) return 1.0;
        vec3 L = normalize(lightDir);
        vec3 rightAx = normalize(cross(vec3(0.0, 1.0, 0.0), L) + vec3(1e-4, 0.0, 0.0));
        vec3 upAx = normalize(cross(L, rightAx));
        vec2 p = vec2(dot(worldPos, rightAx), dot(worldPos, upAx));
        float radialCone = smoothstep(78.0, 14.0, length(p * vec2(0.75, 0.85)));
        float softMullion = 0.88 + 0.12 * smoothstep(-0.6, 0.6, cos(p.y * 0.085 + p.x * 0.04));
        float env = clamp(0.55 + 0.45 * radialCone * softMullion, 0.48, 1.0);
        return mix(1.0, env, clamp(uWindowGoboStrength * 0.55, 0.0, 1.0));
      }

      vec3 computeDualLobeSkinSSS(vec3 fragNormal, vec3 lightDir, vec3 lightColor, vec3 viewDir, vec3 localPos) {
        float ndl = dot(fragNormal, lightDir);
        // 1. Pre-Integrated Translucent Rose-Cream Terminator Scatter (eliminates muddy grey-brown shadows!)
        float penumbra = smoothstep(-0.62, 0.18, ndl) * (1.0 - smoothstep(0.08, 0.62, ndl));
        vec3 deepDermis = vec3(0.96, 0.38, 0.32) * penumbra * 0.30;
        // 2. Soft Epidermal Wrap (keeps unlit cheek luminous & hydrated)
        float softWrap = clamp((ndl + 0.52) / 1.52, 0.0, 1.0) * (1.0 - smoothstep(0.22, 0.78, ndl));
        vec3 chromaticWrap = vec3(0.11, 0.068, 0.056) * softWrap;
        // 3. Thin-Tissue Ear & Nostril Back-Lit Ruby Translucency
        float thinTissueMask = max(
          smoothstep(0.058, 0.078, abs(localPos.x)) * smoothstep(-0.028, 0.025, localPos.y),
          smoothstep(0.080, 0.095, localPos.z) * smoothstep(-0.022, 0.008, localPos.y)
        );
        float backTrans = pow(clamp(dot(-viewDir, lightDir) + 0.25, 0.0, 1.0), 2.2) * thinTissueMask;
        vec3 rubyTrans = vec3(1.10, 0.28, 0.20) * backTrans * 0.28;
        return (deepDermis + chromaticWrap + rubyTrans) * lightColor * uSssIntensity;
      }`
    );

    // Crisp microscopic dermal pore normal relief
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      `#include <normal_fragment_maps>
      #ifdef USE_ROUGHNESSMAP
        vec3 dPosDx = dFdx( vViewPosition );
        vec3 dPosDy = dFdy( vViewPosition );
        float dPoreDx = dFdx( roughnessFactor );
        float dPoreDy = dFdy( roughnessFactor );
        vec3 r1 = cross( dPosDy, normal );
        vec3 r2 = cross( normal, dPosDx );
        float det = dot( dPosDx, r1 );
        if ( abs( det ) > 1e-6 ) {
          vec3 surfGrad = sign( det ) * ( dPoreDx * r1 + dPoreDy * r2 );
          normal = normalize( normal - ( 0.0072 / max( abs( det ), 1e-4 ) ) * surfGrad );
        }
      #endif`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      `#include <lights_fragment_end>
      vec3 viewDir = normalize(vViewPosition);
      vec3 viewWinL = normalize((viewMatrix * vec4(normalize(uWindowLightDir), 0.0)).xyz);
      float winEnv = computeWindowBeamEnvelope(vCervixWorldPos, uWindowLightDir);
      float fragNdl = dot(normal, viewWinL);

      // Sculptural Directional Chiaroscuro Portrait Shading (authentic light & shadow depth across nose bridge & cheeks)
      float litTerm = smoothstep(-0.28, 0.68, fragNdl) * winEnv;
      float chiaroscuroStrength = clamp(uChiaroscuro, 0.0, 1.5);
      float chiaroscuroCurve = mix(1.0, mix(0.40, 1.02, litTerm), clamp(chiaroscuroStrength * 0.82, 0.0, 0.90));

      reflectedLight.directDiffuse *= chiaroscuroCurve;
      reflectedLight.indirectDiffuse *= mix(0.92, 0.44 + 0.56 * litTerm, clamp(chiaroscuroStrength * 0.72, 0.0, 0.85));

      // Warm Amber-Rose Subsurface Bounce along Shadow Terminator (warm cinematic shadows, never muddy grey)
      vec3 warmSubsurfaceShadow = vec3(1.06, 0.90, 0.86);
      reflectedLight.indirectDiffuse = mix(reflectedLight.indirectDiffuse * warmSubsurfaceShadow, reflectedLight.indirectDiffuse, litTerm);

      // Matte-Velvet Photographic Skin Specular (eliminates plastic/silicone shine & temple glare)
      float ndotv = clamp(dot(normal, viewDir), 0.0, 1.0);
      float poreSpecMask = clamp(1.18 - roughnessFactor * 0.82, 0.22, 0.78);
      float tZoneMask = max(
        exp(-pow(vCervixLocalPos.x / 0.014, 2.0)) * smoothstep(0.072, 0.095, vCervixLocalPos.z),
        exp(-pow((abs(vCervixLocalPos.x) - 0.035) / 0.018, 2.0)) * exp(-pow((vCervixLocalPos.y - 0.002) / 0.015, 2.0)) * smoothstep(0.066, 0.088, vCervixLocalPos.z)
      );
      reflectedLight.directSpecular *= (0.26 + 0.24 * litTerm + 0.18 * tZoneMask) * poreSpecMask;
      reflectedLight.indirectSpecular *= (0.20 + 0.14 * tZoneMask) * poreSpecMask * (0.45 + 0.55 * litTerm);

      // Subtle Interactive Studio Torch (gentle warm light without specular glare)
      if (uCursorTorchIntensity > 0.01) {
        vec3 curL = normalize(uCursorLightDir);
        vec3 curH = normalize(curL + viewDir);
        float curNdl = max(0.0, dot(normal, curL));
        float curSpec = pow(max(0.0, dot(normal, curH)), 28.0) * (0.30 + 0.40 * tZoneMask);
        reflectedLight.directDiffuse += diffuseColor.rgb * vec3(1.02, 0.96, 0.92) * curNdl * 0.06 * uCursorTorchIntensity;
        reflectedLight.directSpecular += vec3(1.02, 0.96, 0.92) * curSpec * 0.10 * uCursorTorchIntensity;
      }

      // Delicate Vellus Hair (Peach Fuzz) Grazing Rim along lit cheek contour
      float vellusRim = pow(1.0 - ndotv, 4.0) * smoothstep(0.0, 0.65, fragNdl);
      reflectedLight.directDiffuse += diffuseColor.rgb * vec3(1.04, 0.95, 0.88) * vellusRim * 0.08;

      #if ( NUM_DIR_LIGHTS > 0 )
        vec3 sssAccum = vec3(0.0);
        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
          sssAccum += computeDualLobeSkinSSS( normal, directionalLights[ i ].direction, directionalLights[ i ].color, viewDir, vCervixLocalPos );
        }
        #pragma unroll_loop_end
        reflectedLight.directDiffuse += sssAccum * diffuseColor.rgb * (0.55 + 0.45 * winEnv) * 0.26;
      #endif`
    );
  };
  material.customProgramCacheKey = () => 'cervix3d-chiaroscuro-window-sss-v36';
}

/**
 * Injects Soft Architectural Window Light Envelope onto 3D Desk Floor & Shelf surfaces
 */
export function injectStageWindowGoboShader(material) {
  if (!material) return material;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindowGoboMode = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboMode;
    shader.uniforms.uWindowGoboStrength = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboStrength;
    shader.uniforms.uWindowLightDir = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowLightDir;
    shader.uniforms.uChiaroscuro = GLOBAL_CHIAROSCURO_UNIFORMS.uChiaroscuro;

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      varying vec3 vStageWorldPos;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
      vStageWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `#include <common>
      uniform float uWindowGoboMode;
      uniform float uWindowGoboStrength;
      uniform vec3 uWindowLightDir;
      uniform float uChiaroscuro;
      varying vec3 vStageWorldPos;`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      `#include <lights_fragment_end>
      if (uWindowGoboMode >= 0.5 && uWindowGoboStrength > 0.001) {
        vec3 L = normalize(uWindowLightDir);
        vec3 rightAx = normalize(cross(vec3(0.0, 1.0, 0.0), L) + vec3(1e-4, 0.0, 0.0));
        vec3 upAx = normalize(cross(L, rightAx));
        vec2 p = vec2(dot(vStageWorldPos, rightAx), dot(vStageWorldPos, upAx));
        float gMask = smoothstep(92.0, 18.0, length(p * vec2(0.75, 0.85)));
        float finalGobo = mix(1.0, clamp(0.32 + 0.68 * gMask, 0.28, 1.0), clamp(uWindowGoboStrength * 0.75, 0.0, 1.0));
        reflectedLight.directDiffuse *= finalGobo;
        reflectedLight.directSpecular *= finalGobo;
      }`
    );
  };
  material.customProgramCacheKey = () => 'cervix3d-stage-window-gobo-v29';
  return material;
}

function configureKeyShadow(light, bound, mapSize = 2048, far = 400) {
  light.castShadow = true;
  light.shadow.mapSize.set(mapSize, mapSize);
  const c = light.shadow.camera;
  c.left = -bound;
  c.right = bound;
  c.top = bound;
  c.bottom = -bound;
  c.near = 1;
  c.far = far;
  c.updateProjectionMatrix();
  light.shadow.bias = -0.00012;
  light.shadow.normalBias = 0.018;
}

export function buildStudioLightRig(scene) {
  const hemi = new THREE.HemisphereLight('#fff6ee', '#221a18', 0.46);
  const key = new THREE.DirectionalLight('#fff2e2', 1.92);
  key.position.set(32, 30, 46);
  configureKeyShadow(key, 20, 2048, 220);
  const fill = new THREE.DirectionalLight('#9eb6d8', 0.58);
  fill.position.set(-34, 14, 38);
  const up = new THREE.DirectionalLight('#f7d5ce', 0.32);
  up.position.set(0, -48, 26);
  const rim = new THREE.DirectionalLight('#ffe8d6', 1.15);
  rim.position.set(-18, 28, -42);
  scene.add(hemi, key, fill, up, rim);
  return { hemi, key, fill, up, rim };
}

export function buildDesktopLightRig(scene) {
  const hemi = new THREE.HemisphereLight('#fff6ee', '#221a18', 0.46);
  const key = new THREE.DirectionalLight('#fff2e2', 1.95);
  key.position.set(52, 48, 88);
  configureKeyShadow(key, 54, 2048, 480);
  const fill = new THREE.DirectionalLight('#9eb6d8', 0.58);
  fill.position.set(-55, 18, 72);
  const up = new THREE.DirectionalLight('#f7d5ce', 0.32);
  up.position.set(0, -65, 55);
  const rim = new THREE.DirectionalLight('#ffe8d6', 1.18);
  rim.position.set(-28, 42, -80);
  scene.add(hemi, key, fill, up, rim);
  return { hemi, key, fill, up, rim };
}

const HDR_MODE_LIGHT_SIGNATURES = {
  softbox_portrait: {
    keyTint: '#fff7f0', fillTint: '#a6c4f0', rimTint: '#e2eeff', skyTint: '#fff9f5',
    keyScale: 1.0, fillScale: 1.0, rimScale: 1.05,
  },
  golden_hour: {
    keyTint: '#ffbe78', fillTint: '#6888c8', rimTint: '#ffb44c', skyTint: '#ffdfba',
    keyScale: 1.08, fillScale: 0.84, rimScale: 1.32,
  },
  rainy_window: {
    keyTint: '#cfe6ff', fillTint: '#6e96c8', rimTint: '#8ceeff', skyTint: '#d8ecff',
    keyScale: 0.98, fillScale: 1.06, rimScale: 1.24,
  },
  museum_velvet: {
    keyTint: '#ffe0b2', fillTint: '#7a6898', rimTint: '#ffd098', skyTint: '#f5e2cc',
    keyScale: 1.05, fillScale: 0.68, rimScale: 1.18,
  },
};

/**
 * Applies a complete Visual Customizer configuration (preset + user sliders + HDR mode + optical blur)
 * to either DesktopBoxSpaceEngine or StudioPreviewEngine in real time.
 */
export function applyCustomVisualConfigToEngine(engine, cfg = {}) {
  if (!engine || !engine.renderer || !engine.scene) return;
  const basePreset = VISUAL_STYLE_PRESETS[cfg.presetId] || VISUAL_STYLE_PRESETS.cinema_85mm_portrait;
  const m = { ...basePreset, ...cfg };

  const isStudio = Boolean(engine.controls);
  const rig = engine.lightRig || {
    hemi: engine.hemiLight || engine.hemi,
    key: engine.keyLight,
    fill: engine.fillLight,
    up: engine.anatomyUpLight || engine.upLight,
    rim: engine.rimLight,
  };

  const chiaroscuro = Number(m.chiaroscuro ?? basePreset.chiaroscuro ?? 0.58);
  const goboItem = WINDOW_GOBO_CATALOG.find(g => g.id === (m.windowGobo || basePreset.windowGobo || 'none')) || WINDOW_GOBO_CATALOG[0];
  const goboStrength = Number(m.windowGoboStrength ?? basePreset.windowGoboStrength ?? 0.18);
  const hdrMode = m.hdrMode || basePreset.hdrMode || 'softbox_portrait';
  const hdrSig = HDR_MODE_LIGHT_SIGNATURES[hdrMode] || HDR_MODE_LIGHT_SIGNATURES.softbox_portrait;

  GLOBAL_CHIAROSCURO_UNIFORMS.uChiaroscuro.value = chiaroscuro;
  GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboMode.value = goboItem.modeInt;
  GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboStrength.value = goboStrength;

  if (rig.key) {
    const baseKeyCol = new THREE.Color(m.keyColor || basePreset.keyColor);
    baseKeyCol.lerp(new THREE.Color(hdrSig.keyTint), 0.52);
    rig.key.color.copy(baseKeyCol);
    rig.key.intensity = Number(m.keyIntensity ?? basePreset.keyIntensity) * hdrSig.keyScale;
    const radius = isStudio ? 64 : 116;
    const az = THREE.MathUtils.degToRad(Number(m.keyAzimuthDeg ?? basePreset.keyAzimuthDeg));
    const el = THREE.MathUtils.degToRad(Number(m.keyElevationDeg ?? basePreset.keyElevationDeg));
    const cosEl = Math.cos(el);
    rig.key.position.set(
      radius * cosEl * Math.sin(az),
      radius * Math.sin(el),
      radius * cosEl * Math.cos(az)
    );
    GLOBAL_CHIAROSCURO_UNIFORMS.uWindowLightDir.value.copy(rig.key.position).normalize();
  }
  if (rig.fill) {
    const baseFillCol = new THREE.Color(m.fillColor || basePreset.fillColor);
    baseFillCol.lerp(new THREE.Color(hdrSig.fillTint), 0.55);
    rig.fill.color.copy(baseFillCol);
    const baseFill = Number(m.fillIntensity ?? basePreset.fillIntensity) * hdrSig.fillScale;
    rig.fill.intensity = baseFill * Math.max(0.42, 1.12 - chiaroscuro * 0.35);
  }
  if (rig.rim) {
    const baseRimCol = new THREE.Color(m.rimColor || basePreset.rimColor);
    baseRimCol.lerp(new THREE.Color(hdrSig.rimTint), 0.62);
    rig.rim.color.copy(baseRimCol);
    rig.rim.intensity = Number(m.rimIntensity ?? basePreset.rimIntensity) * hdrSig.rimScale;
  }
  if (rig.hemi) {
    const baseSkyCol = new THREE.Color(m.hemiSky || basePreset.hemiSky);
    baseSkyCol.lerp(new THREE.Color(hdrSig.skyTint), 0.50);
    rig.hemi.color.copy(baseSkyCol);
    rig.hemi.groundColor.set(m.hemiGround || basePreset.hemiGround);
    const baseHemi = Number(m.hemiIntensity ?? basePreset.hemiIntensity);
    rig.hemi.intensity = baseHemi * Math.max(0.45, 1.08 - chiaroscuro * 0.30);
  }
  if (rig.up) {
    rig.up.intensity = Number(m.upIntensity ?? basePreset.upIntensity);
  }

  engine.renderer.toneMappingExposure = Number(m.exposure ?? basePreset.exposure);
  const baseEnv = Number(m.envIntensity ?? basePreset.envIntensity ?? 0.88);
  const effectiveEnv = baseEnv * Math.max(0.68, 1.12 - chiaroscuro * 0.20);
  ensureSceneEnvironment(engine.renderer, engine.scene, effectiveEnv, hdrMode);

  // Update skin subsurface scattering & natural matte-velvet photographic skin response
  const skinGloss = Number(m.skinGloss ?? basePreset.skinGloss ?? 0.12);
  const sssIntensity = Number(m.sssIntensity ?? basePreset.sssIntensity ?? 0.82);
  const cursorTorch = Number(m.cursorTorch ?? basePreset.cursorTorch ?? 0.28);
  GLOBAL_CHIAROSCURO_UNIFORMS.uSssIntensity.value = sssIntensity;
  GLOBAL_CHIAROSCURO_UNIFORMS.uCursorTorchIntensity.value = cursorTorch;

  engine.scene.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    if (obj.name === 'HeadSkinMesh' || obj.material.userData?.uSssIntensity) {
      obj.material.roughness = Math.max(0.48, 0.68 - skinGloss * 0.24);
      obj.material.clearcoat = skinGloss * 0.04;
      obj.material.clearcoatRoughness = Math.max(0.45, 0.72 - skinGloss * 0.25);
      obj.material.specularIntensity = 0.18 + skinGloss * 0.22;
      obj.material.envMapIntensity = 0.20 + skinGloss * 0.24;
    }
  });

  const tyndallVal = Number(m.tyndall ?? basePreset.tyndall ?? 0.36);
  const vintagePhotoVal = Number(m.vintagePhoto ?? basePreset.vintagePhoto ?? 0.06);
  const keyAzDeg = Number(m.keyAzimuthDeg ?? basePreset.keyAzimuthDeg ?? 28);
  const tyndallAngleRad = keyAzDeg >= 0 ? -0.58 : 0.58;
  const keyHex = m.keyColor || basePreset.keyColor || '#fff6ee';

  if (engine.atmosphere && typeof engine.atmosphere.setTyndallConfig === 'function') {
    engine.atmosphere.setTyndallConfig({
      intensity: tyndallVal,
      color: keyHex,
      azimuthDeg: keyAzDeg,
    });
  }

  if (engine.beautyPost && typeof engine.beautyPost.setGradeParams === 'function') {
    engine.beautyPost.setGradeParams({
      bloomStrength: Number(m.bloomStrength ?? basePreset.bloomStrength ?? 0.12),
      vignette: Number(m.vignette ?? basePreset.vignette),
      saturation: Number(m.saturation ?? basePreset.saturation),
      contrast: Number(m.contrast ?? basePreset.contrast),
      warmth: Number(m.warmth ?? basePreset.warmth),
      sharpen: Number(m.sharpen ?? basePreset.sharpen ?? 0.30),
      softFocus: Number(m.softFocus ?? basePreset.softFocus ?? 0.14),
      depthBlur: Number(m.depthBlur ?? basePreset.depthBlur ?? 0.12),
      chromatic: Number(m.chromatic ?? basePreset.chromatic ?? 0.08),
      filmGrain: Number(m.filmGrain ?? basePreset.filmGrain ?? 0.04),
      tyndall: tyndallVal,
      vintagePhoto: vintagePhotoVal,
      irisSparkle: Number(m.irisSparkle ?? basePreset.irisSparkle ?? 0.82),
      halation: Number(m.halation ?? basePreset.halation ?? 0.48),
      skinLumen: Number(m.skinLumen ?? basePreset.skinLumen ?? 0.58),
      tyndallAngle: tyndallAngleRad,
      tyndallColor: keyHex,
      tint: m.tint || basePreset.tint,
      shadowTint: m.shadowTint || basePreset.shadowTint,
    });
  }

  requestShadowUpdate(engine.renderer);
  if (typeof engine.wakeRender === 'function') {
    engine.wakeRender(1.8, true);
  }
}

const QUALITY_CONFIGS = {
  low: { pixelRatioCap: 1, shadowSize: 0, envIntensity: 0.28, aniso: 4 },
  medium: { pixelRatioCap: 1.5, shadowSize: 1024, envIntensity: 0.46, aniso: 8 },
  high: { pixelRatioCap: 2, shadowSize: 2048, envIntensity: 0.50, aniso: 8 },
  ultra: {
    pixelRatioCap: 2.5,
    studioPixelRatioCap: 3,
    shadowSize: 2048,
    studioShadowSize: 4096,
    envIntensity: 0.54,
    aniso: 16,
  },
  rtx2070: {
    pixelRatioCap: 1.5,
    studioPixelRatioCap: 2,
    shadowSize: 2048,
    studioShadowSize: 2048,
    envIntensity: 0.48,
    aniso: 16,
  },
};

export function applyRenderQualityToEngine(engine, level = 'high') {
  const lvl = RENDER_QUALITY_LEVELS.includes(level) ? level : 'high';
  const cfg = QUALITY_CONFIGS[lvl];
  const { renderer, scene } = engine;
  if (!renderer || !scene) return lvl;

  const isStudio = Boolean(engine.controls);
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  let ratio = dpr;
  if (lvl === 'rtx2070') ratio = isStudio ? Math.max(dpr, 1.75) : Math.max(dpr, 1.25);
  else if (lvl === 'ultra') ratio = isStudio ? Math.max(dpr, 2.5) : Math.max(dpr, 1.75);
  else if (lvl === 'high' && isStudio) ratio = Math.max(dpr, 2);
  const cap = isStudio ? cfg.studioPixelRatioCap || cfg.pixelRatioCap : cfg.pixelRatioCap;
  renderer.setPixelRatio(engine.softwareRenderer ? Math.min(dpr, 1) : Math.min(ratio, cap));

  const maxAniso = Math.min(cfg.aniso || 8, renderer.capabilities?.getMaxAnisotropy?.() || 8);
  scene.traverse?.((obj) => {
    const mats = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : [];
    mats.forEach((m) => {
      ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'].forEach((k) => {
        if (m[k]) m[k].anisotropy = maxAniso;
      });
    });
  });

  const shadowSize = isStudio ? cfg.studioShadowSize || cfg.shadowSize : cfg.shadowSize;
  const key = engine.keyLight;
  if (key && key.shadow) {
    key.castShadow = shadowSize > 0;
    if (shadowSize > 0) {
      const sh = key.shadow;
      if (sh.mapSize.x !== shadowSize) {
        sh.mapSize.set(shadowSize, shadowSize);
        if (sh.map) {
          sh.map.dispose();
          sh.map = null;
        }
      }
    }
  }

  if ('environmentIntensity' in scene) {
    scene.environmentIntensity = cfg.envIntensity;
  }
  requestShadowUpdate(renderer);
  engine.currentRenderQuality = lvl;
  if (typeof engine.wakeRender === 'function') {
    engine.wakeRender(1.5, true);
  }
  return lvl;
}

export function isSoftwareRenderer(renderer) {
  try {
    const gl = renderer.getContext();
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const name = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return /swiftshader|llvmpipe|softpipe|software raster/i.test(String(name));
  } catch (_) {
    return false;
  }
}
