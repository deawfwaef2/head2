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
  uSssIntensity: { value: 1.42 },
  uChiaroscuro: { value: 0.58 },
  uWindowGoboMode: { value: 1.0 },
  uWindowGoboStrength: { value: 0.35 },
  uWindowLightDir: { value: new THREE.Vector3(0.42, 0.46, 0.78).normalize() },
};

export const VISUAL_STYLE_PRESETS = {
  cinema_85mm_portrait: {
    id: 'cinema_85mm_portrait',
    label: '📸 85mm 大光圈人像摄影 · 柔焦奶油肌与双柔光箱 HDR (默认首推)',
    hdrMode: 'softbox_portrait',
    keyColor: '#fff3e4',
    fillColor: '#9eb6d8',
    rimColor: '#ffe8d6',
    hemiSky: '#fff8f2',
    hemiGround: '#241c1a',
    keyIntensity: 1.92,
    fillIntensity: 0.58,
    rimIntensity: 1.15,
    hemiIntensity: 0.46,
    upIntensity: 0.32,
    keyAzimuthDeg: 30,
    keyElevationDeg: 28,
    exposure: 0.96,
    envIntensity: 0.52,
    contrast: 1.06,
    saturation: 0.98,
    warmth: 0.05,
    vignette: 0.28,
    sharpen: 0.22,
    softFocus: 0.46,
    depthBlur: 0.32,
    chromatic: 0.18,
    bloomStrength: 0.08,
    filmGrain: 0.09,
    tyndall: 0.45,
    vintagePhoto: 0.20,
    skinGloss: 0.16,
    sssIntensity: 1.48,
    chiaroscuro: 0.52,
    windowGobo: 'none',
    windowGoboStrength: 0.22,
    tint: [1.01, 0.995, 0.98],
    shadowTint: [0.04, 0.03, 0.045],
  },
  korean_magazine_glow: {
    id: 'korean_magazine_glow',
    label: '✨ 韩系画报清透水光 · 高调柔焦冷白凝脂滤镜',
    hdrMode: 'softbox_portrait',
    keyColor: '#fff8f4',
    fillColor: '#b8ccf0',
    rimColor: '#ffeef2',
    hemiSky: '#ffffff',
    hemiGround: '#282026',
    keyIntensity: 1.85,
    fillIntensity: 0.72,
    rimIntensity: 1.18,
    hemiIntensity: 0.56,
    upIntensity: 0.36,
    keyAzimuthDeg: 24,
    keyElevationDeg: 26,
    exposure: 0.99,
    envIntensity: 0.62,
    contrast: 1.04,
    saturation: 1.02,
    warmth: 0.02,
    vignette: 0.20,
    sharpen: 0.18,
    softFocus: 0.56,
    depthBlur: 0.36,
    chromatic: 0.14,
    bloomStrength: 0.10,
    filmGrain: 0.06,
    tyndall: 0.38,
    vintagePhoto: 0.12,
    skinGloss: 0.26,
    sssIntensity: 1.55,
    chiaroscuro: 0.38,
    windowGobo: 'none',
    windowGoboStrength: 0.15,
    tint: [1.02, 1.00, 1.01],
    shadowTint: [0.04, 0.03, 0.05],
  },
  wong_kar_wai_film: {
    id: 'wong_kar_wai_film',
    label: '🎞️ 王家卫式电影胶片 · 复古暖金暗调与黑柔镜晕染',
    hdrMode: 'golden_hour',
    keyColor: '#ffd9a8',
    fillColor: '#4c7a78',
    rimColor: '#f59e0b',
    hemiSky: '#ffe8c8',
    hemiGround: '#0e1918',
    keyIntensity: 2.05,
    fillIntensity: 0.42,
    rimIntensity: 1.38,
    hemiIntensity: 0.34,
    upIntensity: 0.26,
    keyAzimuthDeg: 38,
    keyElevationDeg: 30,
    exposure: 0.93,
    envIntensity: 0.42,
    contrast: 1.12,
    saturation: 0.94,
    warmth: 0.12,
    vignette: 0.42,
    sharpen: 0.16,
    softFocus: 0.58,
    depthBlur: 0.42,
    chromatic: 0.28,
    bloomStrength: 0.11,
    filmGrain: 0.22,
    tyndall: 0.68,
    vintagePhoto: 0.52,
    skinGloss: 0.20,
    sssIntensity: 1.45,
    chiaroscuro: 0.72,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.38,
    tint: [1.03, 0.99, 0.91],
    shadowTint: [0.02, 0.05, 0.04],
  },
  dreamy_promist_soft: {
    id: 'dreamy_promist_soft',
    label: '☁️ 电影黑柔镜 (1/4 Pro-Mist) · 极致奶油柔焦彻底消除3D硬边',
    hdrMode: 'softbox_portrait',
    keyColor: '#fff2e6',
    fillColor: '#a4b8dc',
    rimColor: '#fde2e4',
    hemiSky: '#fff8f6',
    hemiGround: '#221a1d',
    keyIntensity: 1.88,
    fillIntensity: 0.64,
    rimIntensity: 1.22,
    hemiIntensity: 0.50,
    upIntensity: 0.34,
    keyAzimuthDeg: 28,
    keyElevationDeg: 28,
    exposure: 0.97,
    envIntensity: 0.56,
    contrast: 1.03,
    saturation: 0.96,
    warmth: 0.06,
    vignette: 0.26,
    sharpen: 0.10,
    softFocus: 0.72,
    depthBlur: 0.45,
    chromatic: 0.22,
    bloomStrength: 0.12,
    filmGrain: 0.10,
    tyndall: 0.55,
    vintagePhoto: 0.28,
    skinGloss: 0.18,
    sssIntensity: 1.55,
    chiaroscuro: 0.42,
    windowGobo: 'none',
    windowGoboStrength: 0.18,
    tint: [1.02, 0.995, 0.98],
    shadowTint: [0.05, 0.035, 0.05],
  },
  kodak_portra_400: {
    id: 'kodak_portra_400',
    label: '📷 柯达 Portra 400 人像胶卷 · 真实光学微单暖肤色温',
    hdrMode: 'golden_hour',
    keyColor: '#ffeed9',
    fillColor: '#8ea8c8',
    rimColor: '#ffe2bd',
    hemiSky: '#fff4e8',
    hemiGround: '#201815',
    keyIntensity: 1.95,
    fillIntensity: 0.54,
    rimIntensity: 1.18,
    hemiIntensity: 0.44,
    upIntensity: 0.30,
    keyAzimuthDeg: 32,
    keyElevationDeg: 30,
    exposure: 0.96,
    envIntensity: 0.48,
    contrast: 1.07,
    saturation: 0.95,
    warmth: 0.09,
    vignette: 0.30,
    sharpen: 0.20,
    softFocus: 0.44,
    depthBlur: 0.34,
    chromatic: 0.20,
    bloomStrength: 0.08,
    filmGrain: 0.15,
    tyndall: 0.50,
    vintagePhoto: 0.38,
    skinGloss: 0.16,
    sssIntensity: 1.46,
    chiaroscuro: 0.55,
    windowGobo: 'tree_dappled',
    windowGoboStrength: 0.28,
    tint: [1.03, 0.99, 0.95],
    shadowTint: [0.05, 0.035, 0.03],
  },
  fujifilm_eterna_cinema: {
    id: 'fujifilm_eterna_cinema',
    label: '🍃 富士 Eterna 电影空气感 · 日系清透青白柔焦胶片',
    hdrMode: 'rainy_window',
    keyColor: '#f4f8ff',
    fillColor: '#88abc8',
    rimColor: '#e0f2fe',
    hemiSky: '#f0f7ff',
    hemiGround: '#161e26',
    keyIntensity: 1.90,
    fillIntensity: 0.58,
    rimIntensity: 1.20,
    hemiIntensity: 0.46,
    upIntensity: 0.30,
    keyAzimuthDeg: 28,
    keyElevationDeg: 32,
    exposure: 0.96,
    envIntensity: 0.50,
    contrast: 1.05,
    saturation: 0.90,
    warmth: -0.02,
    vignette: 0.28,
    sharpen: 0.20,
    softFocus: 0.48,
    depthBlur: 0.36,
    chromatic: 0.16,
    bloomStrength: 0.08,
    filmGrain: 0.12,
    tyndall: 0.44,
    vintagePhoto: 0.24,
    skinGloss: 0.18,
    sssIntensity: 1.42,
    chiaroscuro: 0.50,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.26,
    tint: [0.98, 1.00, 1.02],
    shadowTint: [0.02, 0.04, 0.055],
  },
  sunset_amber_hdr: {
    id: 'sunset_amber_hdr',
    label: '🌅 暮色琥珀夕照 HDR · 逆光发丝金边与暖橘柔焦散射',
    hdrMode: 'golden_hour',
    keyColor: '#ffe0ba',
    fillColor: '#7c8db5',
    rimColor: '#fbbf24',
    hemiSky: '#ffedd5',
    hemiGround: '#1c1210',
    keyIntensity: 2.02,
    fillIntensity: 0.48,
    rimIntensity: 1.52,
    hemiIntensity: 0.40,
    upIntensity: 0.28,
    keyAzimuthDeg: 40,
    keyElevationDeg: 26,
    exposure: 0.95,
    envIntensity: 0.50,
    contrast: 1.08,
    saturation: 1.00,
    warmth: 0.14,
    vignette: 0.34,
    sharpen: 0.20,
    softFocus: 0.50,
    depthBlur: 0.36,
    chromatic: 0.20,
    bloomStrength: 0.10,
    filmGrain: 0.12,
    tyndall: 0.72,
    vintagePhoto: 0.34,
    skinGloss: 0.20,
    sssIntensity: 1.52,
    chiaroscuro: 0.60,
    windowGobo: 'tree_dappled',
    windowGoboStrength: 0.32,
    tint: [1.04, 0.98, 0.93],
    shadowTint: [0.06, 0.03, 0.04],
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

export function ensureSceneEnvironment(renderer, scene, intensity = 0.85, hdrMode = 'softbox_portrait') {
  let envMapByMode = pmremEnvCache.get(renderer);
  if (!envMapByMode) {
    envMapByMode = new Map();
    pmremEnvCache.set(renderer, envMapByMode);
  }
  const modeKey = hdrMode || 'softbox_portrait';
  let envTex = envMapByMode.get(modeKey);
  if (!envTex) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();

    const modePalettes = {
      softbox_portrait: {
        ring: new THREE.Color(10.5, 9.8, 9.5),
        warmBox: new THREE.Color(7.8, 6.6, 6.2),
        coolBox: new THREE.Color(6.2, 6.6, 7.6),
        bounceBox: new THREE.Color(4.5, 3.8, 3.6),
      },
      golden_hour: {
        ring: new THREE.Color(11.5, 8.8, 6.2),
        warmBox: new THREE.Color(10.2, 6.8, 3.8),
        coolBox: new THREE.Color(4.2, 5.2, 6.8),
        bounceBox: new THREE.Color(5.8, 3.8, 2.5),
      },
      rainy_window: {
        ring: new THREE.Color(8.2, 9.6, 11.4),
        warmBox: new THREE.Color(6.5, 5.4, 4.6),
        coolBox: new THREE.Color(5.8, 7.4, 9.8),
        bounceBox: new THREE.Color(3.2, 3.8, 4.6),
      },
      museum_velvet: {
        ring: new THREE.Color(9.2, 8.0, 6.8),
        warmBox: new THREE.Color(7.4, 5.6, 4.2),
        coolBox: new THREE.Color(3.8, 4.2, 5.4),
        bounceBox: new THREE.Color(3.0, 2.2, 2.4),
      },
    };
    const pal = modePalettes[modeKey] || modePalettes.softbox_portrait;

    // Circular Portrait Beauty-Dish Ring Light in front (+Z) for soulful circular eye catchlights
    const ringGeo = new THREE.RingGeometry(1.30, 1.82, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: pal.ring,
      side: THREE.DoubleSide,
    });
    const beautyRing = new THREE.Mesh(ringGeo, ringMat);
    beautyRing.position.set(0.28, 1.15, 4.2);
    beautyRing.lookAt(0, 0.15, 0);
    room.add(beautyRing);

    // Key Softbox Panel (top-right-front)
    const warmBox = new THREE.Mesh(
      new THREE.PlaneGeometry(4.2, 3.6),
      new THREE.MeshBasicMaterial({ color: pal.warmBox, side: THREE.DoubleSide })
    );
    warmBox.position.set(3.0, 2.2, 3.0);
    warmBox.lookAt(0, 0, 0);
    room.add(warmBox);

    // Rim / Fill Softbox Panel (top-left-back)
    const coolBox = new THREE.Mesh(
      new THREE.PlaneGeometry(4.4, 3.6),
      new THREE.MeshBasicMaterial({ color: pal.coolBox, side: THREE.DoubleSide })
    );
    coolBox.position.set(-3.2, 2.1, -2.8);
    coolBox.lookAt(0, 0, 0);
    room.add(coolBox);

    // Lower Chin Reflector Bounce Card (eliminates harsh under-nose/chin dark shadows!)
    const bounceCard = new THREE.Mesh(
      new THREE.PlaneGeometry(4.0, 3.2),
      new THREE.MeshBasicMaterial({ color: pal.bounceBox, side: THREE.DoubleSide })
    );
    bounceCard.position.set(0.0, -2.4, 2.6);
    bounceCard.lookAt(0, 0, 0);
    room.add(bounceCard);

    envTex = pmrem.fromScene(room, 0.042).texture;
    room.dispose();
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
 * Stage 29 · Pre-Integrated Dual-Lobe Dermis SSS + Screen-Space Micro-Pore Normal Relief + Anti-Silicone Pore Specular Masking
 * - Fixes Three.js's mutually exclusive `normalMap` vs `bumpMap` limitation by perturbing the fragment `normal`
 *   using screen-space derivatives (`dFdx`/`dFdy`) of `roughnessFactor` (`roughnessMap` tiled at 14×14) on top of `Aksel_Skin_NRM.png`.
 * - Uses the perturbed fragment `normal` (NEVER unperturbed vertex normals) for chiaroscuro & chromatic RGB subsurface wrap.
 * - Eliminates fake 2D sine-stripe face bars; uses soft architectural window falloff + sharp 3D shadow maps.
 */
export function injectAestheticSubsurfaceScattering(material, initialSss = 1.32) {
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

    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `#include <common>
      varying vec3 vCervixWorldPos;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
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
      varying vec3 vCervixWorldPos;

      float computeWindowBeamEnvelope(vec3 worldPos, vec3 lightDir) {
        if (uWindowGoboMode < 0.5 || uWindowGoboStrength <= 0.001) return 1.0;
        vec3 L = normalize(lightDir);
        vec3 rightAx = normalize(cross(vec3(0.0, 1.0, 0.0), L) + vec3(1e-4, 0.0, 0.0));
        vec3 upAx = normalize(cross(L, rightAx));
        vec2 p = vec2(dot(worldPos, rightAx), dot(worldPos, upAx));
        // Soft, wide architectural window light cone (never paints harsh zebra stripes across a face)
        float radialCone = smoothstep(78.0, 14.0, length(p * vec2(0.75, 0.85)));
        float softMullion = 0.88 + 0.12 * smoothstep(-0.6, 0.6, cos(p.y * 0.085 + p.x * 0.04));
        float env = clamp(0.42 + 0.58 * radialCone * softMullion, 0.35, 1.0);
        return mix(1.0, env, clamp(uWindowGoboStrength * 0.65, 0.0, 1.0));
      }

      vec3 computeDualLobeSkinSSS(vec3 fragNormal, vec3 lightDir, vec3 lightColor) {
        float ndl = dot(fragNormal, lightDir);
        // Wide Chromatic RGB wrap-lighting (Jimenez/Penner Pre-Integrated Skin profile: Red scatters deep into shadow)
        float wrapR = clamp((ndl + 0.68) / 1.68, 0.0, 1.0);
        float wrapG = clamp((ndl + 0.38) / 1.38, 0.0, 1.0);
        float wrapB = clamp((ndl + 0.18) / 1.18, 0.0, 1.0);
        // Creamy peach-coral subsurface terminator band right along the light-shadow boundary
        float penumbra = smoothstep(-0.55, 0.12, ndl) * (1.0 - smoothstep(0.05, 0.58, ndl));
        vec3 deepDermis = vec3(0.96, 0.34, 0.26) * penumbra * 0.36;
        vec3 chromaticWrap = vec3(wrapR * 0.18, wrapG * 0.11, wrapB * 0.075);
        return (deepDermis + chromaticWrap) * lightColor * uSssIntensity;
      }`
    );

    // Subtle microscopic dermal pore normal perturbation (kept delicate so young girl skin is silky & wrinkle-free)
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
          normal = normalize( normal - ( 0.0065 / max( abs( det ), 1e-4 ) ) * surfGrad );
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

      // Soft Portrait Chiaroscuro (prevents harsh 3D-game black shadow lines across the nose and cheeks)
      float litTerm = smoothstep(-0.45, 0.55, fragNdl) * winEnv;
      float chiaroscuroStrength = clamp(uChiaroscuro, 0.0, 1.5);
      float chiaroscuroCurve = mix(1.0, mix(0.68, 1.05, litTerm), clamp(chiaroscuroStrength * 0.35, 0.0, 0.55));

      reflectedLight.directDiffuse *= chiaroscuroCurve;
      reflectedLight.indirectDiffuse *= mix(1.0, 0.72 + 0.28 * litTerm, clamp(chiaroscuroStrength * 0.30, 0.0, 0.45));

      // Anti-Silicone Pore-Cavity Specular Masking:
      // Suppresses plastic specular sheets so skin has a soft, translucent velvet-matte sheen
      float poreSpecMask = clamp(1.32 - roughnessFactor * 1.12, 0.12, 0.95);
      reflectedLight.directSpecular *= (0.35 + 0.65 * litTerm) * poreSpecMask * 0.48;
      reflectedLight.indirectSpecular *= (0.30 + 0.55 * litTerm) * poreSpecMask * 0.42;

      // Warm rose-ivory subsurface shadow fill mixed with subtle atmospheric bounce
      vec3 warmSubsurfaceShadow = vec3(0.96, 0.88, 0.90);
      reflectedLight.indirectDiffuse = mix(reflectedLight.indirectDiffuse * warmSubsurfaceShadow, reflectedLight.indirectDiffuse, litTerm);

      // Vellus Hair (Peach Fuzz) Grazing Rim Backscatter along cheek & jawline contour
      float ndotv = clamp(dot(normal, viewDir), 0.0, 1.0);
      float vellusRim = pow(1.0 - ndotv, 3.6) * smoothstep(-0.25, 0.55, fragNdl);
      reflectedLight.directDiffuse += diffuseColor.rgb * vec3(1.05, 0.95, 0.90) * vellusRim * 0.16;

      #if ( NUM_DIR_LIGHTS > 0 )
        vec3 sssAccum = vec3(0.0);
        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
          sssAccum += computeDualLobeSkinSSS( normal, directionalLights[ i ].direction, directionalLights[ i ].color );
        }
        #pragma unroll_loop_end
        reflectedLight.directDiffuse += sssAccum * diffuseColor.rgb * (0.58 + 0.42 * winEnv) * 0.48;
      #endif`
    );
  };
  material.customProgramCacheKey = () => 'cervix3d-chiaroscuro-window-sss-v30';
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

  const chiaroscuro = Number(m.chiaroscuro ?? basePreset.chiaroscuro ?? 0.55);
  const goboItem = WINDOW_GOBO_CATALOG.find(g => g.id === (m.windowGobo || basePreset.windowGobo || 'none')) || WINDOW_GOBO_CATALOG[0];
  const goboStrength = Number(m.windowGoboStrength ?? basePreset.windowGoboStrength ?? 0.25);

  GLOBAL_CHIAROSCURO_UNIFORMS.uChiaroscuro.value = chiaroscuro;
  GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboMode.value = goboItem.modeInt;
  GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboStrength.value = goboStrength;

  if (rig.key) {
    rig.key.color.set(m.keyColor || basePreset.keyColor);
    rig.key.intensity = Number(m.keyIntensity ?? basePreset.keyIntensity);
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
    rig.fill.color.set(m.fillColor || basePreset.fillColor);
    const baseFill = Number(m.fillIntensity ?? basePreset.fillIntensity);
    rig.fill.intensity = baseFill * Math.max(0.45, 1.15 - chiaroscuro * 0.35);
  }
  if (rig.rim) {
    rig.rim.color.set(m.rimColor || basePreset.rimColor);
    rig.rim.intensity = Number(m.rimIntensity ?? basePreset.rimIntensity);
  }
  if (rig.hemi) {
    rig.hemi.color.set(m.hemiSky || basePreset.hemiSky);
    rig.hemi.groundColor.set(m.hemiGround || basePreset.hemiGround);
    const baseHemi = Number(m.hemiIntensity ?? basePreset.hemiIntensity);
    rig.hemi.intensity = baseHemi * Math.max(0.50, 1.12 - chiaroscuro * 0.30);
  }
  if (rig.up) {
    rig.up.intensity = Number(m.upIntensity ?? basePreset.upIntensity);
  }

  engine.renderer.toneMappingExposure = Number(m.exposure ?? basePreset.exposure);
  const baseEnv = Number(m.envIntensity ?? basePreset.envIntensity ?? 0.50);
  const effectiveEnv = baseEnv * Math.max(0.55, 1.10 - chiaroscuro * 0.25);
  const hdrMode = m.hdrMode || basePreset.hdrMode || 'softbox_portrait';
  ensureSceneEnvironment(engine.renderer, engine.scene, effectiveEnv, hdrMode);

  // Update skin subsurface scattering & matte-velvet human dermis
  const skinGloss = Number(m.skinGloss ?? basePreset.skinGloss ?? 0.16);
  const sssIntensity = Number(m.sssIntensity ?? basePreset.sssIntensity ?? 1.48);
  GLOBAL_CHIAROSCURO_UNIFORMS.uSssIntensity.value = sssIntensity;

  engine.scene.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    if (obj.name === 'HeadSkinMesh' || obj.material.userData?.uSssIntensity) {
      obj.material.roughness = Math.max(0.50, 0.78 - skinGloss * 0.30);
      obj.material.clearcoat = skinGloss > 0.70 ? (skinGloss - 0.70) * 0.35 : 0.0;
      obj.material.clearcoatRoughness = Math.max(0.38, 0.68 - skinGloss * 0.25);
      obj.material.specularIntensity = 0.14 + skinGloss * 0.20;
      obj.material.envMapIntensity = 0.18 + skinGloss * 0.18;
    }
  });

  const tyndallVal = Number(m.tyndall ?? basePreset.tyndall ?? 0.45);
  const vintagePhotoVal = Number(m.vintagePhoto ?? basePreset.vintagePhoto ?? 0.20);
  const keyAzDeg = Number(m.keyAzimuthDeg ?? basePreset.keyAzimuthDeg ?? 30);
  const tyndallAngleRad = keyAzDeg >= 0 ? -0.58 : 0.58;
  const keyHex = m.keyColor || basePreset.keyColor || '#fff3e4';

  if (engine.atmosphere && typeof engine.atmosphere.setTyndallConfig === 'function') {
    engine.atmosphere.setTyndallConfig({
      intensity: tyndallVal,
      color: keyHex,
      azimuthDeg: keyAzDeg,
    });
  }

  if (engine.beautyPost && typeof engine.beautyPost.setGradeParams === 'function') {
    engine.beautyPost.setGradeParams({
      bloomStrength: Number(m.bloomStrength ?? basePreset.bloomStrength),
      vignette: Number(m.vignette ?? basePreset.vignette),
      saturation: Number(m.saturation ?? basePreset.saturation),
      contrast: Number(m.contrast ?? basePreset.contrast),
      warmth: Number(m.warmth ?? basePreset.warmth),
      sharpen: Number(m.sharpen ?? basePreset.sharpen ?? 0.22),
      softFocus: Number(m.softFocus ?? basePreset.softFocus ?? 0.46),
      depthBlur: Number(m.depthBlur ?? basePreset.depthBlur ?? 0.32),
      chromatic: Number(m.chromatic ?? basePreset.chromatic ?? 0.18),
      filmGrain: Number(m.filmGrain ?? basePreset.filmGrain),
      tyndall: tyndallVal,
      vintagePhoto: vintagePhotoVal,
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
