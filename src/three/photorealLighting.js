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
  { id: 'hair_sun_slit', modeInt: 5, label: '🌞 盛夏逆光发丝缕缕投影 + 树隙切光斑 (参考图同款·强明暗对比)' },
  { id: 'tree_dappled', modeInt: 4, label: '🌿 窗外梧桐树影摇曳斑驳光 + 发丝微影 (自然呼吸感)' },
  { id: 'venetian_blinds', modeInt: 2, label: '🪟 书房百叶窗条纹切光 (王家卫电影感强明暗切割)' },
  { id: 'rain_mullion', modeInt: 1, label: '🌧️ 雨夜十字窗格 + 流云漫射窗光 (伴学推荐)' },
  { id: 'gothic_lattice', modeInt: 3, label: '🏰 哥特菱格花窗光影 (古典标本馆)' },
  { id: 'none', modeInt: 0, label: '🔦 纯净影棚柔光箱 (无遮光投影)' },
];

export const DYNAMIC_LIGHT_MODES = [
  { id: 'sunset_cloud_drift', label: '🌅 暮色流云慢移 · 光影角度与冷暖缓慢呼吸 (默认推荐)' },
  { id: 'tree_breeze_dappled', label: '🌿 梧桐树影微风摇曳 · 发丝投影与斑驳光斑缓慢流淌' },
  { id: 'rain_caustics_sway', label: '🌧️ 雨夜窗影水波 · 柔和冷暖交替漫游' },
  { id: 'candle_chiaroscuro', label: '🕯️ 古典烛火摇曳 · 暖金伦勃朗明暗跳动' },
  { id: 'cinema_orbit', label: '🎬 戏剧环绕走马灯 · 140°立体雕塑光巡航' },
  { id: 'static_locked', label: '⏸️ 固定静帧光影 · 锁定当前手动光源角度' },
];

export const GLOBAL_CHIAROSCURO_UNIFORMS = {
  uSssIntensity: { value: 0.96 },
  uChiaroscuro: { value: 0.94 },
  uWindowGoboMode: { value: 5.0 },
  uWindowGoboStrength: { value: 0.78 },
  uWindowGoboPhase: { value: 0.0 },
  uWindowLightDir: { value: new THREE.Vector3(0.58, 0.42, 0.70).normalize() },
  uCursorLightDir: { value: new THREE.Vector3(0.18, 0.28, 0.94).normalize() },
  uCursorTorchIntensity: { value: 0.24 },
};

export function updateInteractiveCursorLight(ndcX = 0, ndcY = 0) {
  const lx = Math.max(-0.85, Math.min(0.85, Number(ndcX) * 0.75));
  const ly = Math.max(-0.65, Math.min(0.85, Number(ndcY) * 0.65 + 0.18));
  GLOBAL_CHIAROSCURO_UNIFORMS.uCursorLightDir.value.set(lx, ly, 0.92).normalize();
}

export const VISUAL_STYLE_PRESETS = {
  sunlit_hair_shadow_film: {
    id: 'sunlit_hair_shadow_film',
    label: '🌞 盛夏逆光发丝投影 · 强明暗切割与奶油柔焦胶片 (参考图同款·首推)',
    desc: '复刻参考照：脸颊缕缕发丝投影、前景树隙斜切强阳光、奶油漫射高光与暖绿散景光斑',
    hdrMode: 'golden_hour',
    keyColor: '#ffe4b8',
    fillColor: '#4a5d4e',
    rimColor: '#ffd28a',
    hemiSky: '#fff0d4',
    hemiGround: '#141812',
    keyIntensity: 2.15,
    fillIntensity: 0.14,
    rimIntensity: 1.55,
    hemiIntensity: 0.14,
    upIntensity: 0.06,
    keyAzimuthDeg: -38,
    keyElevationDeg: 26,
    exposure: 0.88,
    envIntensity: 0.24,
    contrast: 1.22,
    saturation: 0.94,
    warmth: 0.09,
    vignette: 0.42,
    sharpen: 0.04,
    softFocus: 0.66,
    depthBlur: 0.54,
    chromatic: 0.16,
    bloomStrength: 0.14,
    filmGrain: 0.10,
    tyndall: 0.78,
    vintagePhoto: 0.46,
    skinGloss: 0.12,
    sssIntensity: 0.98,
    chiaroscuro: 0.96,
    irisSparkle: 0.08,
    halation: 0.52,
    skinLumen: 0.0,
    cursorTorch: 0.22,
    windowGobo: 'hair_sun_slit',
    windowGoboStrength: 0.82,
    tint: [1.03, 0.99, 0.91],
    shadowTint: [0.028, 0.036, 0.022],
  },
  cinema_85mm_portrait: {
    id: 'cinema_85mm_portrait',
    label: '📸 85mm 逆光发丝强光影写真 · 奶油柔焦与树隙明暗切割 (默认首推)',
    desc: '强明暗切割比(10:1)、脸颊缕缕发丝投影、奶油高光柔焦漫射与复古胶片层次',
    hdrMode: 'golden_hour',
    keyColor: '#ffe6be',
    fillColor: '#526458',
    rimColor: '#ffd494',
    hemiSky: '#fff2da',
    hemiGround: '#151814',
    keyIntensity: 2.08,
    fillIntensity: 0.16,
    rimIntensity: 1.48,
    hemiIntensity: 0.15,
    upIntensity: 0.08,
    keyAzimuthDeg: -36,
    keyElevationDeg: 26,
    exposure: 0.88,
    envIntensity: 0.25,
    contrast: 1.20,
    saturation: 0.94,
    warmth: 0.08,
    vignette: 0.40,
    sharpen: 0.05,
    softFocus: 0.64,
    depthBlur: 0.52,
    chromatic: 0.15,
    bloomStrength: 0.13,
    filmGrain: 0.09,
    tyndall: 0.74,
    vintagePhoto: 0.44,
    skinGloss: 0.12,
    sssIntensity: 0.96,
    chiaroscuro: 0.94,
    irisSparkle: 0.08,
    halation: 0.48,
    skinLumen: 0.0,
    cursorTorch: 0.24,
    windowGobo: 'hair_sun_slit',
    windowGoboStrength: 0.78,
    tint: [1.03, 0.99, 0.92],
    shadowTint: [0.028, 0.035, 0.022],
  },
  korean_magazine_glow: {
    id: 'korean_magazine_glow',
    label: '✨ 韩系画报清透水光 · 高调柔焦冷白凝脂滤镜',
    hdrMode: 'softbox_portrait',
    keyColor: '#fffaf8',
    fillColor: '#c6daf8',
    rimColor: '#eef4ff',
    hemiSky: '#ffffff',
    hemiGround: '#2c242c',
    keyIntensity: 1.64,
    fillIntensity: 0.72,
    rimIntensity: 1.46,
    hemiIntensity: 0.52,
    upIntensity: 0.32,
    keyAzimuthDeg: 24,
    keyElevationDeg: 25,
    exposure: 0.97,
    envIntensity: 1.02,
    contrast: 1.04,
    saturation: 1.03,
    warmth: 0.0,
    vignette: 0.18,
    sharpen: 0.28,
    softFocus: 0.18,
    depthBlur: 0.10,
    chromatic: 0.06,
    bloomStrength: 0.14,
    filmGrain: 0.03,
    tyndall: 0.30,
    vintagePhoto: 0.04,
    skinGloss: 0.65,
    sssIntensity: 0.95,
    chiaroscuro: 0.25,
    irisSparkle: 0.90,
    halation: 0.52,
    skinLumen: 0.72,
    cursorTorch: 0.85,
    windowGobo: 'none',
    windowGoboStrength: 0.10,
    tint: [1.01, 1.01, 1.03],
    shadowTint: [0.03, 0.025, 0.04],
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
    keyIntensity: 1.68,
    fillIntensity: 0.36,
    rimIntensity: 1.42,
    hemiIntensity: 0.28,
    upIntensity: 0.18,
    keyAzimuthDeg: 38,
    keyElevationDeg: 30,
    exposure: 0.86,
    envIntensity: 0.85,
    contrast: 1.12,
    saturation: 0.95,
    warmth: 0.08,
    vignette: 0.38,
    sharpen: 0.24,
    softFocus: 0.10,
    depthBlur: 0.04,
    chromatic: 0.14,
    bloomStrength: 0.07,
    filmGrain: 0.14,
    tyndall: 0.48,
    vintagePhoto: 0.28,
    skinGloss: 0.38,
    sssIntensity: 0.88,
    chiaroscuro: 0.72,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.32,
    tint: [1.02, 0.99, 0.93],
    shadowTint: [0.015, 0.035, 0.03],
  },
  dreamy_promist_soft: {
    id: 'dreamy_promist_soft',
    label: '☁️ 电影黑柔镜 (1/4 Pro-Mist) · 极致奶油柔焦彻底消除3D硬边',
    hdrMode: 'softbox_portrait',
    keyColor: '#fff4ea',
    fillColor: '#a4b8dc',
    rimColor: '#fde2e4',
    hemiSky: '#fff8f6',
    hemiGround: '#1c1618',
    keyIntensity: 1.56,
    fillIntensity: 0.52,
    rimIntensity: 1.26,
    hemiIntensity: 0.38,
    upIntensity: 0.24,
    keyAzimuthDeg: 28,
    keyElevationDeg: 28,
    exposure: 0.88,
    envIntensity: 0.90,
    contrast: 1.05,
    saturation: 0.97,
    warmth: 0.03,
    vignette: 0.24,
    sharpen: 0.22,
    softFocus: 0.14,
    depthBlur: 0.04,
    chromatic: 0.10,
    bloomStrength: 0.07,
    filmGrain: 0.06,
    tyndall: 0.36,
    vintagePhoto: 0.12,
    skinGloss: 0.38,
    sssIntensity: 0.86,
    chiaroscuro: 0.50,
    windowGobo: 'none',
    windowGoboStrength: 0.15,
    tint: [1.01, 1.00, 0.99],
    shadowTint: [0.025, 0.02, 0.03],
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
  if (!envTex && typeof renderer.compile === 'function') {
    const pmrem = new THREE.PMREMGenerator(renderer);
    // Build a high-contrast dark-velvet studio HDR light dome instead of a flat white box so HDR sculpts facial topography!
    const domeScene = new THREE.Scene();

    const modePalettes = {
      softbox_portrait: {
        bg: new THREE.Color(0.018, 0.018, 0.024),
        warmBox: new THREE.Color(3.8, 3.3, 2.9),
        coolBox: new THREE.Color(0.42, 0.48, 0.62),
        rimStrip: new THREE.Color(4.4, 4.6, 5.2),
        bounceBox: new THREE.Color(0.32, 0.28, 0.26),
      },
      golden_hour: {
        bg: new THREE.Color(0.016, 0.010, 0.006),
        warmBox: new THREE.Color(5.4, 3.2, 1.5),
        coolBox: new THREE.Color(0.28, 0.24, 0.20),
        rimStrip: new THREE.Color(5.8, 3.8, 1.6),
        bounceBox: new THREE.Color(0.26, 0.18, 0.12),
      },
      rainy_window: {
        bg: new THREE.Color(0.012, 0.020, 0.036),
        warmBox: new THREE.Color(3.2, 3.8, 4.8),
        coolBox: new THREE.Color(0.38, 0.52, 0.74),
        rimStrip: new THREE.Color(4.2, 5.4, 6.4),
        bounceBox: new THREE.Color(0.28, 0.36, 0.52),
      },
      museum_velvet: {
        bg: new THREE.Color(0.012, 0.008, 0.016),
        warmBox: new THREE.Color(4.2, 3.0, 2.0),
        coolBox: new THREE.Color(0.26, 0.22, 0.34),
        rimStrip: new THREE.Color(4.8, 3.6, 2.4),
        bounceBox: new THREE.Color(0.22, 0.18, 0.22),
      },
    };
    const pal = modePalettes[modeKey] || modePalettes.softbox_portrait;
    domeScene.background = pal.bg;

    // Key Octabox Softbox Panel (top-right-front — natural portrait key without blinding central ring glare)
    const warmBox = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.0),
      new THREE.MeshBasicMaterial({ color: pal.warmBox, side: THREE.DoubleSide })
    );
    warmBox.position.set(3.2, 2.4, 3.2);
    warmBox.lookAt(0, 0, 0);
    domeScene.add(warmBox);

    // Fill Softbox Panel (left-front)
    const coolBox = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 3.0),
      new THREE.MeshBasicMaterial({ color: pal.coolBox, side: THREE.DoubleSide })
    );
    coolBox.position.set(-3.6, 1.4, 2.6);
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

    envTex = pmrem.fromScene(domeScene, 0.04).texture;
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

let _fallbackWhitePhotoTex = null;
function getFallbackPhotoTex() {
  if (!_fallbackWhitePhotoTex) {
    _fallbackWhitePhotoTex = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    _fallbackWhitePhotoTex.needsUpdate = true;
  }
  return _fallbackWhitePhotoTex;
}

/**
 * Creates a per-material uniform bundle for Stage 36 True-Dermis Micro-Structure
 * & Real-Time Facial Color, Makeup, Lip Vermilion, Freckle, Beauty-Mark & Reference-Photo Projection.
 */
export function createSkinGradingUniforms(initial = {}) {
  return {
    uSkinToneTint: { value: new THREE.Color(initial.skinToneTint || '#ffffff') },
    uSkinWarmthShift: { value: Number(initial.skinWarmthShift ?? 0.0) },
    uSkinBrightness: { value: Number(initial.skinBrightness ?? 1.0) },
    uSkinRosiness: { value: Number(initial.skinRosiness ?? 0.25) },
    uPoreRelief: { value: Number(initial.poreRelief ?? 1.15) },
    uSkinMicroMottle: { value: Number(initial.skinMicroMottle ?? 1.0) },
    uBlushColor: { value: new THREE.Color(initial.blushColor || '#f07682') },
    uBlushStrength: { value: Number(initial.blushStrength ?? 0.22) },
    uEyeshadowColor: { value: new THREE.Color(initial.eyeshadowColor || '#b87068') },
    uEyeshadowStrength: { value: Number(initial.eyeshadowStrength ?? 0.18) },
    uAegyoSalStrength: { value: Number(initial.aegyoSalStrength ?? 0.42) },
    uDarkCircleStrength: { value: Number(initial.darkCircleStrength ?? 0.10) },
    uLipColor: { value: new THREE.Color(initial.lipColor || '#cb5362') },
    uLipStrength: { value: Number(initial.lipStrength ?? 0.36) },
    uLipGloss: { value: Number(initial.lipGloss ?? 0.48) },
    uFreckleStrength: { value: Number(initial.freckleStrength ?? 0.0) },
    uBeautyMarkMode: { value: Number(initial.beautyMarkMode ?? 0.0) },
    uPhotoProjMap: { value: initial.photoProjMap || getFallbackPhotoTex() },
    uPhotoProjEnabled: { value: initial.photoProjMap ? 1.0 : 0.0 },
    uPhotoProjStrength: { value: Number(initial.photoProjStrength ?? 0.0) },
    uPhotoProjScale: { value: Number(initial.photoProjScale ?? 1.0) },
    uPhotoProjOffset: { value: new THREE.Vector2(Number(initial.photoProjOffsetX ?? 0.0), Number(initial.photoProjOffsetY ?? 0.0)) },
  };
}

/**
 * Stage 36 · Anti-Silicone True-Dermis 3D Millimeter-Space Micro-Pore & Real-Time Facial Grading Pipeline:
 * 1. Solves the MakeHuman full-body UV resolution bottleneck (~200px face island) by synthesizing
 *    3-scale 3D millimeter-space cellular sebaceous pores, Langer's rhomboid creases, and vertical
 *    lip-vermilion furrows directly at `vCervixLocalPos` (infinite sharpness even at 11cm macro zoom!).
 * 2. Adds subtle organic melanin & hemoglobin chromophore micro-mottling (`uSkinMicroMottle`) so skin
 *    never looks like a flat uniform CG color fill.
 * 3. Provides 0ms real-time GPU grading for Skin Tone, Warmth, Brightness, Rosiness, Blush, Eyeshadow,
 *    Aegyo-Sal, Dark Circles, Lip Vermilion Color/Gloss, Freckles, and 6 Beauty-Mark Positions!
 */
export function injectAestheticSubsurfaceScattering(material, initialSss = 0.92, initialGrading = {}) {
  material.userData = material.userData || {};
  material.userData.uSssIntensity = GLOBAL_CHIAROSCURO_UNIFORMS.uSssIntensity;
  const gradingU = material.userData.skinGradingUniforms || createSkinGradingUniforms(initialGrading);
  material.userData.skinGradingUniforms = gradingU;

  if (typeof initialSss === 'number') {
    GLOBAL_CHIAROSCURO_UNIFORMS.uSssIntensity.value = initialSss;
  }

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSssIntensity = GLOBAL_CHIAROSCURO_UNIFORMS.uSssIntensity;
    shader.uniforms.uChiaroscuro = GLOBAL_CHIAROSCURO_UNIFORMS.uChiaroscuro;
    shader.uniforms.uWindowGoboMode = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboMode;
    shader.uniforms.uWindowGoboStrength = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboStrength;
    shader.uniforms.uWindowGoboPhase = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboPhase;
    shader.uniforms.uWindowLightDir = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowLightDir;
    shader.uniforms.uCursorLightDir = GLOBAL_CHIAROSCURO_UNIFORMS.uCursorLightDir;
    shader.uniforms.uCursorTorchIntensity = GLOBAL_CHIAROSCURO_UNIFORMS.uCursorTorchIntensity;
    for (const [k, uObj] of Object.entries(gradingU)) {
      shader.uniforms[k] = uObj;
    }

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
      uniform float uWindowGoboPhase;
      uniform vec3 uWindowLightDir;
      uniform vec3 uCursorLightDir;
      uniform float uCursorTorchIntensity;
      uniform vec3 uSkinToneTint;
      uniform float uSkinWarmthShift;
      uniform float uSkinBrightness;
      uniform float uSkinRosiness;
      uniform float uPoreRelief;
      uniform float uSkinMicroMottle;
      uniform vec3 uBlushColor;
      uniform float uBlushStrength;
      uniform vec3 uEyeshadowColor;
      uniform float uEyeshadowStrength;
      uniform float uAegyoSalStrength;
      uniform float uDarkCircleStrength;
      uniform vec3 uLipColor;
      uniform float uLipStrength;
      uniform float uLipGloss;
      uniform float uFreckleStrength;
      uniform float uBeautyMarkMode;
      uniform sampler2D uPhotoProjMap;
      uniform float uPhotoProjEnabled;
      uniform float uPhotoProjStrength;
      uniform float uPhotoProjScale;
      uniform vec2 uPhotoProjOffset;
      varying vec3 vCervixWorldPos;
      varying vec3 vCervixLocalPos;
      float vDermisPoreCavity;
      float vLipVermilionMask;

      float dermisHash21(vec2 p) {
        p = fract(p * vec2(234.56, 789.12));
        p += dot(p, p + 34.56);
        return fract(p.x * p.y);
      }

      float dermisNoise2D(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(dermisHash21(i), dermisHash21(i + vec2(1.0, 0.0)), u.x),
          mix(dermisHash21(i + vec2(0.0, 1.0)), dermisHash21(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      // 3D Millimeter-Space Cellular Sebaceous Pore & Langer's Rhomboid Crease Field
      float compute3DPoreField(vec3 localPos) {
        vec2 mm = vec2(atan(localPos.x, max(0.02, localPos.z + 0.02)) * 92.0, localPos.y * 920.0);
        vec2 cell = floor(mm * 3.8);
        vec2 fracP = fract(mm * 3.8) - 0.5;
        vec2 jitter = vec2(dermisHash21(cell) - 0.5, dermisHash21(cell + 17.3) - 0.5) * 0.48;
        float dPore = length(fracP - jitter);
        float poreCrater = smoothstep(0.11, 0.34, dPore);
        float langerA = dermisNoise2D(vec2(mm.x * 2.4 + mm.y * 1.7, mm.y * 2.4 - mm.x * 1.7));
        float langerB = dermisNoise2D(vec2(mm.x * 5.2 - mm.y * 3.4, mm.y * 5.2 + mm.x * 3.4));
        return clamp(poreCrater * 0.58 + (0.62 * langerA + 0.38 * langerB) * 0.42, 0.0, 1.0);
      }

      // Smooth 3D Lip Vermilion Mask & Vertical Lip Crease Relief
      float computeLipVermilionMask(vec3 p, out float lipCrease) {
        float xNorm = p.x / 0.0205;
        float cupidsBow = -0.0226 - 0.0018 * cos(clamp(xNorm, -1.0, 1.0) * 3.14159 * 2.0) - 0.0048 * pow(abs(xNorm), 1.85);
        float lowerBorder = -0.0384 + 0.0056 * pow(abs(xNorm), 1.75);
        float inX = 1.0 - smoothstep(0.76, 1.04, abs(xNorm));
        float inY = smoothstep(lowerBorder - 0.0022, lowerBorder + 0.0022, p.y)
                  * (1.0 - smoothstep(cupidsBow - 0.0018, cupidsBow + 0.0020, p.y));
        float inZ = smoothstep(0.096, 0.1015, p.z);
        float mask = clamp(inX * inY * inZ, 0.0, 1.0);
        float creaseWave = dermisNoise2D(vec2(p.x * 1650.0, p.y * 240.0));
        lipCrease = mix(0.5, creaseWave, mask);
        return mask;
      }

      float computeWindowBeamEnvelope(vec3 worldPos, vec3 localPos, vec3 lightDir) {
        if (uWindowGoboMode < 0.5 || uWindowGoboStrength <= 0.001) return 1.0;
        vec3 L = normalize(lightDir);
        vec3 rightAx = normalize(cross(vec3(0.0, 1.0, 0.0), L) + vec3(1e-4, 0.0, 0.0));
        vec3 upAx = normalize(cross(L, rightAx));
        vec2 p = vec2(dot(worldPos, rightAx), dot(worldPos, upAx));
        vec2 faceCm = localPos.xy * 100.0;
        float ph = uWindowGoboPhase;
        float sunSide = L.x >= 0.0 ? 1.0 : -1.0;

        // Multi-Harmonic Wispy Hair-Strand Cast Shadows across Sunlit Temple, Eye & Cheek (复刻参考图脸颊缕缕发丝投影)
        float cheekStrandZone = smoothstep(-4.4, -1.8, faceCm.y)
                              * (1.0 - smoothstep(3.2, 5.2, faceCm.y))
                              * smoothstep(0.032, 0.068, localPos.z)
                              * smoothstep(-2.4, 1.6, faceCm.x * sunSide + 0.8);
        float curveBend = (faceCm.y - 2.6) * (faceCm.y - 2.6) * 0.11;
        float sCoord = (faceCm.x * sunSide - faceCm.y * 0.44 + curveBend) * 9.6 + sin(ph * 0.65) * 1.6;
        float wispLock = smoothstep(-0.34, 0.46, sin(sCoord * 0.38 + cos(faceCm.y * 0.82 - ph * 0.4) * 0.78));
        float fineStrandA = smoothstep(-0.56, 0.34, sin(sCoord * 1.18 + sin(faceCm.y * 1.38) * 0.62));
        float fineStrandB = smoothstep(-0.62, 0.30, cos(sCoord * 2.10 - faceCm.y * 0.88 + ph * 0.52));
        float hairStrandShadow = mix(
          1.0,
          0.10 + 0.90 * (0.45 * wispLock + 0.35 * fineStrandA + 0.20 * fineStrandB),
          cheekStrandZone * 0.94
        );

        float pattern = 1.0;
        if (uWindowGoboMode < 1.5) {
          // 1. Rainy Mullion Window Lattice at True Facial Scale + Raindrop Caustics
          float mx = smoothstep(-0.55, 0.35, cos((faceCm.x + sin(ph * 0.6) * 1.4) * 0.68));
          float my = smoothstep(-0.55, 0.35, cos((faceCm.y + cos(ph * 0.5) * 1.1) * 0.68));
          float rainRipple = 0.82 + 0.18 * sin(faceCm.x * 1.8 + faceCm.y * 2.2 - ph * 1.8);
          pattern = (0.10 + 0.90 * mx * my) * rainRipple * mix(1.0, hairStrandShadow, 0.55);
        } else if (uWindowGoboMode < 2.5) {
          // 2. Venetian Blinds Slats slicing across eyes & cheeks (High-Contrast Film Noir / Wong Kar-wai)
          float slat = smoothstep(-0.28, 0.32, cos((faceCm.y * 1.85 + faceCm.x * 0.42 * sunSide) + sin(ph * 0.6) * 1.5));
          pattern = (0.06 + 0.94 * slat) * mix(1.0, hairStrandShadow, 0.50);
        } else if (uWindowGoboMode < 3.5) {
          // 3. Gothic Diamond Stained-Glass Lattice across face
          float d1 = smoothstep(-0.45, 0.38, cos((faceCm.x + faceCm.y) * 0.72 + sin(ph * 0.5) * 0.9));
          float d2 = smoothstep(-0.45, 0.38, cos((faceCm.x - faceCm.y) * 0.72 - cos(ph * 0.5) * 0.9));
          pattern = (0.08 + 0.92 * d1 * d2) * mix(1.0, hairStrandShadow, 0.45);
        } else if (uWindowGoboMode < 4.5) {
          // 4. Swaying Sycamore Tree Dappled Sunlight + Wispy Hair Shadows
          float leaf1 = sin(faceCm.x * 0.78 + ph * 0.9) * cos(faceCm.y * 0.84 - ph * 0.75);
          float leaf2 = sin((faceCm.x - faceCm.y) * 0.62 - ph * 0.6) * cos((faceCm.x + faceCm.y) * 0.55 + ph * 0.95);
          float dappled = smoothstep(-0.22, 0.34, 0.55 * leaf1 + 0.45 * leaf2);
          pattern = (0.08 + 0.92 * dappled) * mix(1.0, hairStrandShadow, 0.82);
        } else {
          // 5. Reference Photo Mode (hair_sun_slit): Diagonal Sunbeam Slit + Forehead/Jaw Foliage Cut Shadow + Cheek Hair-Strand Shadows!
          float diagCoord = faceCm.x * (-0.52 * sunSide) + faceCm.y * 0.85 + sin(ph * 0.38) * 0.65;
          float upperForeheadCut = 1.0 - smoothstep(1.35, 3.10, diagCoord + 0.45 * sin(faceCm.x * 0.65 + ph * 0.3));
          float lowerJawCut = smoothstep(-4.8, -2.0, faceCm.y + faceCm.x * 0.28 * sunSide + cos(ph * 0.32) * 0.42);
          float sideFoliageCut = smoothstep(-4.2, -0.4, faceCm.x * sunSide + faceCm.y * 0.36 + sin(faceCm.y * 0.75 - ph * 0.45) * 0.65);
          float sunSlit = upperForeheadCut * lowerJawCut * (0.10 + 0.90 * sideFoliageCut);
          pattern = clamp(0.05 + 0.95 * sunSlit * hairStrandShadow, 0.05, 1.0);
        }
        return mix(1.0, pattern, clamp(uWindowGoboStrength, 0.0, 1.0));
      }

      vec3 computeDualLobeSkinSSS(vec3 fragNormal, vec3 lightDir, vec3 lightColor, vec3 viewDir, vec3 localPos) {
        float ndl = dot(fragNormal, lightDir);
        float penumbra = smoothstep(-0.62, 0.18, ndl) * (1.0 - smoothstep(0.08, 0.62, ndl));
        vec3 deepDermis = vec3(0.96, 0.36, 0.30) * penumbra * 0.28;
        float softWrap = clamp((ndl + 0.52) / 1.52, 0.0, 1.0) * (1.0 - smoothstep(0.22, 0.78, ndl));
        vec3 chromaticWrap = vec3(0.095, 0.058, 0.048) * softWrap;
        float thinTissueMask = max(
          smoothstep(0.058, 0.078, abs(localPos.x)) * smoothstep(-0.028, 0.025, localPos.y),
          smoothstep(0.080, 0.095, localPos.z) * smoothstep(-0.022, 0.008, localPos.y)
        );
        float backTrans = pow(clamp(dot(-viewDir, lightDir) + 0.25, 0.0, 1.0), 2.2) * thinTissueMask;
        vec3 rubyTrans = vec3(1.05, 0.26, 0.18) * backTrans * 0.26;
        return (deepDermis + chromaticWrap + rubyTrans) * lightColor * uSssIntensity;
      }`
    );

    // Stage 36 · Real-Time Facial Color, Makeup, Lip Vermilion, Freckle, Beauty-Mark & Photo Projection Grading
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <map_fragment>',
      `#include <map_fragment>
      {
        vec3 p = vCervixLocalPos;
        float lipCreaseVal = 0.5;
        float lipMask = computeLipVermilionMask(p, lipCreaseVal);
        vLipVermilionMask = lipMask;

        // 0. Direct 3D Frontal Portrait Photo Projection (solves 286px MakeHuman UV bottleneck!)
        float eyeHoleMask = smoothstep(0.0040, 0.0068, length((vec2(abs(p.x), p.y) - vec2(0.0288, 0.0162)) * vec2(0.74, 1.45)));
        if (uPhotoProjEnabled > 0.5 && uPhotoProjStrength > 0.005 && p.z > 0.032) {
          float pScale = max(0.45, uPhotoProjScale);
          vec2 projUV = vec2(
            0.5 + (p.x / (0.128 * pScale)) + uPhotoProjOffset.x,
            0.51 + (p.y / (0.148 * pScale)) + uPhotoProjOffset.y
          );
          if (projUV.x > 0.02 && projUV.x < 0.98 && projUV.y > 0.02 && projUV.y < 0.98) {
            vec4 photoSample = texture2D(uPhotoProjMap, projUV);
            vec3 photoLinear = pow(max(photoSample.rgb, vec3(0.001)), vec3(2.2));
            float ovalDist = length((p.xy - vec2(0.0, -0.001)) / vec2(0.054, 0.058));
            float ovalFeather = (1.0 - smoothstep(0.68, 1.04, ovalDist)) * smoothstep(0.035, 0.068, p.z) * eyeHoleMask;
            diffuseColor.rgb = mix(diffuseColor.rgb, photoLinear, clamp(ovalFeather * uPhotoProjStrength, 0.0, 0.95));
          }
        }

        // 1. Base Skin Tone Tint, Warmth Shift & Brightness
        vec3 skinCol = diffuseColor.rgb * uSkinToneTint * uSkinBrightness;
        skinCol.r *= (1.0 + uSkinWarmthShift * 0.10 + uSkinRosiness * 0.055);
        skinCol.g *= (1.0 + uSkinWarmthShift * 0.02 - uSkinRosiness * 0.015);
        skinCol.b *= (1.0 - uSkinWarmthShift * 0.10 - uSkinRosiness * 0.025);

        // 2. Micro-Chromophore Melanin & Hemoglobin Mottling (eliminates flat CG color fill!)
        vec2 mmCoord = vec2(p.x * 340.0, p.y * 340.0 + p.z * 180.0);
        float hemoNoise = dermisNoise2D(mmCoord * 1.3) - 0.5;
        float melaNoise = dermisNoise2D(mmCoord * 2.9 + 11.7) - 0.5;
        float faceFrontMask = smoothstep(0.02, 0.075, p.z);
        vec3 chromoDelta = (vec3(0.024, -0.010, -0.008) * hemoNoise + vec3(0.014, 0.008, -0.012) * melaNoise)
                         * clamp(uSkinMicroMottle, 0.0, 1.6) * faceFrontMask * (1.0 - lipMask * 0.7);
        skinCol += skinCol * chromoDelta;

        // 3. Apple Cheek & Nasal-Tip Blush Gradient
        float cheekDist = length((vec2(abs(p.x), p.y) - vec2(0.036, -0.004)) / vec2(0.023, 0.017));
        float noseTipDist = length((p.xy - vec2(0.0, -0.0145)) / vec2(0.011, 0.009));
        float blushMask = (exp(-cheekDist * cheekDist * 1.45) + 0.38 * exp(-noseTipDist * noseTipDist * 1.8))
                        * smoothstep(0.058, 0.088, p.z) * (1.0 - lipMask);
        skinCol = mix(skinCol, skinCol * (0.55 + 0.45 * uBlushColor) + uBlushColor * 0.24, clamp(blushMask * uBlushStrength * 0.85, 0.0, 0.75));

        // 4. Upper Eyelid Eyeshadow & Outer Canthus Contour
        float lidDist = length((vec2(abs(p.x), p.y) - vec2(0.030, 0.0205)) / vec2(0.017, 0.0065));
        float eyeHole = eyeHoleMask;
        float shadowMask = exp(-lidDist * lidDist * 1.6) * eyeHole * smoothstep(0.072, 0.088, p.z);
        skinCol = mix(skinCol, skinCol * uEyeshadowColor * 0.92, clamp(shadowMask * uEyeshadowStrength * 0.85, 0.0, 0.72));

        // 5. Under-Eye Aegyo-Sal (卧蚕) Puff Highlight & Subtle Groove Shadow
        if (uAegyoSalStrength > 0.01) {
          float inEyeX = exp(-pow((abs(p.x) - 0.029) / 0.013, 2.0)) * smoothstep(0.074, 0.086, p.z);
          float puffBand = exp(-pow((p.y - 0.0082) / 0.0020, 2.0)) * inEyeX;
          float grooveBand = exp(-pow((p.y - 0.0046) / 0.0016, 2.0)) * inEyeX;
          skinCol += vec3(0.042, 0.034, 0.032) * puffBand * uAegyoSalStrength;
          skinCol *= (1.0 - 0.13 * grooveBand * uAegyoSalStrength);
        }

        // 6. Periorbital Dark Circles / Forensic Post-Mortem Eye Hollow Tint
        if (uDarkCircleStrength > 0.01) {
          float dcDist = length((vec2(abs(p.x), p.y) - vec2(0.027, 0.0045)) / vec2(0.015, 0.0065));
          float dcMask = exp(-dcDist * dcDist * 1.5) * smoothstep(0.072, 0.086, p.z);
          skinCol = mix(skinCol, skinCol * vec3(0.76, 0.68, 0.74), clamp(dcMask * uDarkCircleStrength * 0.65, 0.0, 0.55));
        }

        // 7. Natural Freckles across Nasal Bridge & Upper Cheeks
        if (uFreckleStrength > 0.01) {
          float freckleZone = exp(-pow(p.x / 0.046, 2.0)) * exp(-pow((p.y + 0.003) / 0.015, 2.0)) * smoothstep(0.068, 0.092, p.z) * (1.0 - lipMask);
          vec2 fGrid = p.xy * 1150.0;
          vec2 fCell = floor(fGrid);
          vec2 fFrac = fract(fGrid) - 0.5;
          vec2 fJit = vec2(dermisHash21(fCell) - 0.5, dermisHash21(fCell + 9.1) - 0.5) * 0.55;
          float fDot = (1.0 - smoothstep(0.08, 0.24, length(fFrac - fJit))) * step(0.68, dermisHash21(fCell + 31.7));
          skinCol = mix(skinCol, skinCol * vec3(0.72, 0.56, 0.46), clamp(fDot * freckleZone * uFreckleStrength * 0.72, 0.0, 0.60));
        }

        // 8. Switchable Beauty Marks / Moles (1=右颊三痣, 2=左眼泪痣, 3=右眼下卧蚕痣, 4=鼻梁痣, 5=左唇角痣, 6=净肌去痣)
        if (uBeautyMarkMode >= 0.5) {
          float moleAlpha = 0.0;
          if (abs(uBeautyMarkMode - 1.0) < 0.4) {
            float m1 = 1.0 - smoothstep(0.0007, 0.0014, length(p.xy - vec2(-0.036, -0.012)));
            float m2 = 1.0 - smoothstep(0.0006, 0.0013, length(p.xy - vec2(-0.041, -0.019)));
            float m3 = 1.0 - smoothstep(0.0006, 0.0013, length(p.xy - vec2(-0.033, -0.025)));
            moleAlpha = max(m1, max(m2, m3)) * step(0.055, p.z);
          } else if (abs(uBeautyMarkMode - 2.0) < 0.4) {
            moleAlpha = (1.0 - smoothstep(0.0006, 0.0013, length(p.xy - vec2(0.039, 0.0095)))) * step(0.070, p.z);
          } else if (abs(uBeautyMarkMode - 3.0) < 0.4) {
            moleAlpha = (1.0 - smoothstep(0.0006, 0.0013, length(p.xy - vec2(-0.028, 0.0055)))) * step(0.075, p.z);
          } else if (abs(uBeautyMarkMode - 4.0) < 0.4) {
            moleAlpha = (1.0 - smoothstep(0.0006, 0.0012, length(p.xy - vec2(0.0015, 0.0045)))) * step(0.095, p.z);
          } else if (abs(uBeautyMarkMode - 5.0) < 0.4) {
            moleAlpha = (1.0 - smoothstep(0.0006, 0.0013, length(p.xy - vec2(0.021, -0.0345)))) * step(0.088, p.z);
          }
          skinCol = mix(skinCol, skinCol * vec3(0.32, 0.22, 0.18), moleAlpha * 0.85);
        }

        // 9. Lip Vermilion Color Grading & Inner Bite-Lip (咬唇) Depth
        if (lipMask > 0.005 && uLipStrength > 0.01) {
          float innerBite = exp(-pow((p.y + 0.0315) / 0.0042, 2.0)) * (1.0 - smoothstep(0.008, 0.018, abs(p.x)));
          vec3 targetLip = mix(uLipColor * 1.06, uLipColor * 0.78, innerBite * 0.55);
          targetLip *= (0.92 + 0.16 * lipCreaseVal);
          skinCol = mix(skinCol, mix(skinCol * 0.45 + targetLip * 0.65, targetLip, 0.68), clamp(lipMask * uLipStrength, 0.0, 0.95));
        }

        diffuseColor.rgb = skinCol;
      }`
    );

    // 3D Millimeter-Space Dermis Pore + Vertical Lip Crease Normal Perturbation
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <normal_fragment_maps>',
      `#include <normal_fragment_maps>
      {
        float faceRegion = smoothstep(-0.065, -0.025, vCervixLocalPos.y) * smoothstep(-0.01, 0.055, vCervixLocalPos.z);
        float poreVal = compute3DPoreField(vCervixLocalPos);
        float lipCreaseLocal = 0.5;
        float lipMaskN = computeLipVermilionMask(vCervixLocalPos, lipCreaseLocal);
        float combinedMicroHeight = mix(poreVal, lipCreaseLocal * 1.35, lipMaskN);
        vDermisPoreCavity = poreVal;

        #ifdef USE_ROUGHNESSMAP
          combinedMicroHeight = mix(combinedMicroHeight, roughnessFactor, 0.35);
        #endif

        vec3 dPosDx = dFdx( vViewPosition );
        vec3 dPosDy = dFdy( vViewPosition );
        float dHdx = dFdx( combinedMicroHeight );
        float dHdy = dFdy( combinedMicroHeight );
        vec3 r1 = cross( dPosDy, normal );
        vec3 r2 = cross( normal, dPosDx );
        float det = dot( dPosDx, r1 );
        if ( abs( det ) > 1e-6 ) {
          float reliefAmp = 0.0115 * clamp(uPoreRelief, 0.0, 2.2) * (0.35 + 0.65 * faceRegion);
          vec3 surfGrad = sign( det ) * ( dHdx * r1 + dHdy * r2 );
          normal = normalize( normal - ( reliefAmp / max( abs( det ), 1e-4 ) ) * surfGrad );
        }
      }`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      `#include <lights_fragment_end>
      vec3 viewDir = normalize(vViewPosition);
      vec3 viewWinL = normalize((viewMatrix * vec4(normalize(uWindowLightDir), 0.0)).xyz);
      float winEnv = computeWindowBeamEnvelope(vCervixWorldPos, vCervixLocalPos, uWindowLightDir);
      float fragNdl = dot(normal, viewWinL);

      // Stage 38 · High-Contrast Sun-Slit & Hair-Strand Chiaroscuro (复刻参考图：强明暗切割对比 + 发丝投影 + 交界线暖橘红真皮透光)
      float litNdl = smoothstep(-0.24, 0.42, fragNdl);
      float sunMask = clamp(litNdl * winEnv, 0.0, 1.0);
      float litTerm = sunMask;
      float chiaroscuroStrength = clamp(uChiaroscuro, 0.0, 1.5);
      float shadowContrast = clamp(chiaroscuroStrength * 0.78 + uWindowGoboStrength * 0.35, 0.0, 1.25);

      // Sunlit patches glow with warm golden-ivory radiance; shadow zones & hair-strand shadows drop into deep velvety film shadow!
      float directScale = mix(1.0, mix(0.06, 1.48, pow(sunMask, 0.86)), clamp(shadowContrast, 0.0, 1.0));
      float indirectScale = mix(1.0, mix(0.14, 1.06, smoothstep(0.0, 0.85, sunMask)), clamp(shadowContrast * 0.92, 0.0, 0.96));

      reflectedLight.directDiffuse *= directScale * mix(vec3(0.80, 0.64, 0.50), vec3(1.09, 0.99, 0.88), sunMask);
      reflectedLight.indirectDiffuse *= indirectScale;

      // Deep Cinematic Warm-Olive / Espresso-Amber Film Shadow Toning (eliminates flat grey CG ambient)
      vec3 warmSubsurfaceShadow = vec3(0.78, 0.68, 0.54);
      reflectedLight.indirectDiffuse = mix(reflectedLight.indirectDiffuse * warmSubsurfaceShadow, reflectedLight.indirectDiffuse, sunMask);

      // Subsurface Blood-Glow Penumbra Fringe right along every Sun-Slit & Hair-Strand Shadow Border!
      float penumbraFringe = 4.0 * sunMask * (1.0 - sunMask);
      vec3 bloodTerminatorGlow = diffuseColor.rgb * vec3(1.26, 0.44, 0.22) * pow(penumbraFringe, 1.15) * 0.44 * uSssIntensity * clamp(shadowContrast, 0.2, 1.2);
      reflectedLight.directDiffuse += bloodTerminatorGlow;

      // Anti-Silicone Micro-Pore Specular Cavity Masking + Dedicated Wet Lip Gloss
      float ndotv = clamp(dot(normal, viewDir), 0.0, 1.0);
      float fresnelSheen = pow(1.0 - ndotv, 2.8);
      float poreSpecMask = clamp(0.32 + 0.88 * vDermisPoreCavity, 0.26, 1.12);
      float tZoneMask = max(
        exp(-pow(vCervixLocalPos.x / 0.015, 2.0)) * smoothstep(0.075, 0.105, vCervixLocalPos.z),
        exp(-pow((abs(vCervixLocalPos.x) - 0.035) / 0.020, 2.0)) * exp(-pow((vCervixLocalPos.y - 0.002) / 0.016, 2.0)) * smoothstep(0.068, 0.092, vCervixLocalPos.z)
      );
      float lipSpecBoost = vLipVermilionMask * clamp(uLipGloss, 0.0, 1.5) * 1.45;
      reflectedLight.directSpecular *= (0.18 + 0.62 * sunMask + 0.22 * tZoneMask * sunMask + lipSpecBoost) * poreSpecMask;
      reflectedLight.indirectSpecular *= (0.16 + 0.45 * sunMask + 0.20 * fresnelSheen * sunMask + lipSpecBoost * 0.85) * poreSpecMask;

      // Interactive Mouse-Following Studio Beauty Torch
      if (uCursorTorchIntensity > 0.01) {
        vec3 curL = normalize(uCursorLightDir);
        vec3 curH = normalize(curL + viewDir);
        float curNdl = max(0.0, dot(normal, curL));
        float curSpec = pow(max(0.0, dot(normal, curH)), 42.0) * (0.35 + 0.45 * tZoneMask + lipSpecBoost) * poreSpecMask;
        reflectedLight.directDiffuse += diffuseColor.rgb * vec3(1.02, 0.97, 0.95) * curNdl * 0.08 * uCursorTorchIntensity;
        reflectedLight.directSpecular += vec3(1.04, 0.99, 0.96) * curSpec * 0.18 * uCursorTorchIntensity;
      }

      // Delicate Vellus Hair (Peach Fuzz) Grazing Rim along cheek & jawline contour
      float vellusRim = pow(1.0 - ndotv, 3.4) * smoothstep(-0.25, 0.55, fragNdl) * (1.0 - vLipVermilionMask);
      reflectedLight.directDiffuse += diffuseColor.rgb * vec3(1.08, 0.95, 0.84) * vellusRim * (0.08 + 0.16 * sunMask);

      #if ( NUM_DIR_LIGHTS > 0 )
        vec3 sssAccum = vec3(0.0);
        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
          sssAccum += computeDualLobeSkinSSS( normal, directionalLights[ i ].direction, directionalLights[ i ].color, viewDir, vCervixLocalPos );
        }
        #pragma unroll_loop_end
        reflectedLight.directDiffuse += sssAccum * diffuseColor.rgb * (0.35 + 0.65 * winEnv) * 0.36;
      #endif`
    );
  };
  material.customProgramCacheKey = () => 'cervix3d-true-dermis-v38';
}

/**
 * Injects Soft Architectural Window Light Envelope onto 3D Desk Floor & Shelf surfaces
 */
export function injectStageWindowGoboShader(material) {
  if (!material) return material;
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uWindowGoboMode = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboMode;
    shader.uniforms.uWindowGoboStrength = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboStrength;
    shader.uniforms.uWindowGoboPhase = GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboPhase;
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
      uniform float uWindowGoboPhase;
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
        float ph = uWindowGoboPhase;
        float pat = 0.52 + 0.48 * sin((p.x + sin(ph * 0.7) * 4.0) * 0.22) * cos((p.y + cos(ph * 0.5) * 3.0) * 0.22);
        float slitBand = smoothstep(-28.0, -4.0, p.x * 0.75 + p.y * 0.65 + sin(ph * 0.35) * 6.0) * smoothstep(34.0, 8.0, p.x * 0.75 + p.y * 0.65);
        float beamVal = uWindowGoboMode > 4.5 ? clamp(slitBand * (0.45 + 0.55 * pat), 0.0, 1.0) : clamp(gMask * pat, 0.0, 1.0);
        float finalGobo = mix(1.0, clamp(0.12 + 1.24 * beamVal, 0.12, 1.32), clamp(uWindowGoboStrength * 0.92, 0.0, 1.0));
        reflectedLight.directDiffuse *= finalGobo;
        reflectedLight.directSpecular *= finalGobo;
        reflectedLight.indirectDiffuse *= mix(1.0, 0.28 + 0.75 * beamVal, clamp(uChiaroscuro * 0.75, 0.0, 0.85));
      }`
    );
  };
  material.customProgramCacheKey = () => 'cervix3d-stage-window-gobo-v37';
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
  const hemi = new THREE.HemisphereLight('#ffe5ba', '#16110d', 0.14);
  const key = new THREE.DirectionalLight('#ffe8c4', 2.18);
  key.position.set(34, 26, 48);
  configureKeyShadow(key, 20, 2048, 220);
  const fill = new THREE.DirectionalLight('#3b2f26', 0.14);
  fill.position.set(-34, 14, 38);
  const up = new THREE.DirectionalLight('#c88264', 0.08);
  up.position.set(0, -48, 26);
  const rim = new THREE.DirectionalLight('#ffd494', 1.16);
  rim.position.set(-18, 28, -42);
  scene.add(hemi, key, fill, up, rim);
  return { hemi, key, fill, up, rim };
}

export function buildDesktopLightRig(scene) {
  const hemi = new THREE.HemisphereLight('#ffe5ba', '#16110d', 0.14);
  const key = new THREE.DirectionalLight('#ffe8c4', 2.18);
  key.position.set(54, 42, 86);
  configureKeyShadow(key, 54, 2048, 480);
  const fill = new THREE.DirectionalLight('#3b2f26', 0.14);
  fill.position.set(-55, 18, 72);
  const up = new THREE.DirectionalLight('#c88264', 0.08);
  up.position.set(0, -65, 55);
  const rim = new THREE.DirectionalLight('#ffd494', 1.18);
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
    rig.fill.intensity = baseFill * Math.max(0.08, 1.05 - chiaroscuro * 0.85);
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
    rig.hemi.intensity = baseHemi * Math.max(0.10, 1.05 - chiaroscuro * 0.80);
  }
  if (rig.up) {
    rig.up.intensity = Number(m.upIntensity ?? basePreset.upIntensity) * Math.max(0.10, 1.0 - chiaroscuro * 0.78);
  }

  engine.renderer.toneMappingExposure = Number(m.exposure ?? basePreset.exposure);
  const baseEnv = Number(m.envIntensity ?? basePreset.envIntensity ?? 0.25);
  const effectiveEnv = baseEnv * Math.max(0.12, 1.04 - chiaroscuro * 0.72);
  ensureSceneEnvironment(engine.renderer, engine.scene, effectiveEnv, hdrMode);

  // Update skin subsurface scattering & natural anti-silicone dermis reflectance
  const skinGloss = Number(m.skinGloss ?? basePreset.skinGloss ?? 0.14);
  const sssIntensity = Number(m.sssIntensity ?? basePreset.sssIntensity ?? 0.88);
  const cursorTorch = Number(m.cursorTorch ?? basePreset.cursorTorch ?? 0.55);
  GLOBAL_CHIAROSCURO_UNIFORMS.uSssIntensity.value = sssIntensity;
  GLOBAL_CHIAROSCURO_UNIFORMS.uCursorTorchIntensity.value = cursorTorch;

  engine.scene.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    if (obj.name === 'HeadSkinMesh' || obj.material.userData?.uSssIntensity) {
      const userRough = obj.material.userData?.customSkinRoughness;
      obj.material.roughness = typeof userRough === 'number'
        ? userRough
        : Math.max(0.42, 0.64 - skinGloss * 0.24);
      obj.material.clearcoat = Math.max(0.0, (skinGloss - 0.55) * 0.18);
      obj.material.clearcoatRoughness = 0.45;
      obj.material.specularIntensity = 0.24 + skinGloss * 0.26;
      obj.material.envMapIntensity = 0.34 + skinGloss * 0.28;
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
      bloomStrength: Number(m.bloomStrength ?? basePreset.bloomStrength ?? 0.11),
      vignette: Number(m.vignette ?? basePreset.vignette),
      saturation: Number(m.saturation ?? basePreset.saturation),
      contrast: Number(m.contrast ?? basePreset.contrast),
      warmth: Number(m.warmth ?? basePreset.warmth),
      sharpen: Number(m.sharpen ?? basePreset.sharpen ?? 0.06),
      softFocus: Number(m.softFocus ?? basePreset.softFocus ?? 0.58),
      depthBlur: Number(m.depthBlur ?? basePreset.depthBlur ?? 0.48),
      chromatic: Number(m.chromatic ?? basePreset.chromatic ?? 0.16),
      filmGrain: Number(m.filmGrain ?? basePreset.filmGrain ?? 0.07),
      tyndall: tyndallVal,
      vintagePhoto: vintagePhotoVal,
      irisSparkle: Number(m.irisSparkle ?? basePreset.irisSparkle ?? 0.05),
      halation: Number(m.halation ?? basePreset.halation ?? 0.54),
      skinLumen: Number(m.skinLumen ?? basePreset.skinLumen ?? 0.0),
      sssBlur: Number(m.sssBlur ?? basePreset.sssBlur ?? 0.64),
      microContrast: Number(m.microContrast ?? basePreset.microContrast ?? 0.42),
      highlightRoll: Number(m.highlightRoll ?? basePreset.highlightRoll ?? 0.52),
      shadowCrush: Number(m.shadowCrush ?? basePreset.shadowCrush ?? 0.58),
      sunFlareVeil: Number(m.sunFlareVeil ?? basePreset.sunFlareVeil ?? 0.76),
      dappledBokeh: Number(m.dappledBokeh ?? basePreset.dappledBokeh ?? 0.78),
      anamorphicFlare: Number(m.anamorphicFlare ?? basePreset.anamorphicFlare ?? 0.24),
      lightLeak: Number(m.lightLeak ?? basePreset.lightLeak ?? 0.22),
      swirlyBokeh: Number(m.swirlyBokeh ?? basePreset.swirlyBokeh ?? 0.28),
      wetLensDrop: Number(m.wetLensDrop ?? basePreset.wetLensDrop ?? 0.0),
      lensDistortion: Number(m.lensDistortion ?? basePreset.lensDistortion ?? 0.12),
      filmLutMode: m.filmLutMode ?? basePreset.filmLutMode ?? 'portra_160_sun',
      filmLutStrength: Number(m.filmLutStrength ?? basePreset.filmLutStrength ?? 0.68),
      tyndallAngle: tyndallAngleRad,
      tyndallColor: keyHex,
      tint: m.tint || basePreset.tint,
      shadowTint: m.shadowTint || basePreset.shadowTint,
    });
  }

  engine._activeVisualState = m;

  requestShadowUpdate(engine.renderer);
  if (typeof engine.wakeRender === 'function') {
    engine.wakeRender(1.8, true);
  }
}

/**
 * Stage 37 · Slow Shifting Dynamic Light & Shadow Engine ("设计那种变换光影缓慢")
 * Smoothly evolves window light azimuth/elevation, color temperature breathing, window gobo shadow phase,
 * and Tyndall god-ray angle so the portrait and desk are alive with poetic shifting light and shadow.
 */
export function updateDynamicLightingOnEngine(engine, elapsed = 0) {
  if (!engine || !engine.renderer || !engine.scene) return false;
  const m = engine._activeVisualState || engine.visualConfig || {};
  const mode = m.dynamicLightMode || 'sunset_cloud_drift';
  const speed = Number(m.dynamicLightSpeed ?? 1.0);
  const amp = Number(m.dynamicLightAmp ?? 1.0);

  if (mode === 'static_locked' || speed <= 0.001 || amp <= 0.001) {
    return false;
  }

  const t = elapsed * speed;
  const isStudio = Boolean(engine.controls);
  const rig = engine.lightRig || {
    hemi: engine.hemiLight || engine.hemi,
    key: engine.keyLight,
    fill: engine.fillLight,
    up: engine.anatomyUpLight || engine.upLight,
    rim: engine.rimLight,
  };
  if (!rig.key) return false;

  const basePreset = VISUAL_STYLE_PRESETS[m.presetId] || VISUAL_STYLE_PRESETS.cinema_85mm_portrait;
  const hdrMode = m.hdrMode || basePreset.hdrMode || 'golden_hour';
  const hdrSig = HDR_MODE_LIGHT_SIGNATURES[hdrMode] || HDR_MODE_LIGHT_SIGNATURES.golden_hour;

  const baseAz = Number(m.keyAzimuthDeg ?? basePreset.keyAzimuthDeg ?? 38);
  const baseEl = Number(m.keyElevationDeg ?? basePreset.keyElevationDeg ?? 28);
  const baseKeyInt = Number(m.keyIntensity ?? basePreset.keyIntensity ?? 1.36) * hdrSig.keyScale;
  const baseRimInt = Number(m.rimIntensity ?? basePreset.rimIntensity ?? 0.78) * hdrSig.rimScale;
  const baseTyndall = Number(m.tyndall ?? basePreset.tyndall ?? 0.58);

  let azOffset = 0;
  let elOffset = 0;
  let intFactor = 1.0;
  let warmthShift = 0.0;
  let goboPhase = t * 0.45;

  if (mode === 'sunset_cloud_drift') {
    // Slow sweeping window sun/cloud drift across face (+-24 deg azimuth, +-7 deg elevation)
    azOffset = (Math.sin(t * 0.36) * 20.0 + Math.cos(t * 0.17) * 6.0) * amp;
    elOffset = Math.sin(t * 0.25 + 0.8) * 6.5 * amp;
    intFactor = 1.0 + Math.sin(t * 0.42) * 0.14 * amp;
    warmthShift = Math.sin(t * 0.28) * 0.18 * amp;
    goboPhase = t * 0.42;
  } else if (mode === 'tree_breeze_dappled') {
    // Gentle breeze swaying sycamore tree leaves & dappled sunlight
    azOffset = Math.sin(t * 0.48) * 15.0 * amp;
    elOffset = Math.cos(t * 0.35) * 5.0 * amp;
    intFactor = 1.0 + (Math.sin(t * 0.95) * 0.10 + Math.cos(t * 1.6) * 0.06) * amp;
    warmthShift = Math.sin(t * 0.40) * 0.12 * amp;
    goboPhase = t * 0.85;
  } else if (mode === 'rain_caustics_sway') {
    // Rainy window water-caustic shimmer & cool-warm study lamp breathing
    azOffset = Math.sin(t * 0.30) * 16.0 * amp;
    elOffset = Math.sin(t * 0.44 + 1.2) * 5.5 * amp;
    intFactor = 1.0 + Math.sin(t * 0.65) * 0.12 * amp;
    warmthShift = -0.10 + Math.sin(t * 0.32) * 0.20 * amp;
    goboPhase = t * 0.72;
  } else if (mode === 'candle_chiaroscuro') {
    // Warm organic multi-harmonic candle flame sway & chiaroscuro dance
    const flicker = Math.sin(t * 2.8) * 0.5 + Math.sin(t * 5.3 + 1.4) * 0.3 + Math.cos(t * 1.7) * 0.2;
    azOffset = (Math.sin(t * 0.85) * 14.0 + flicker * 6.0) * amp;
    elOffset = (Math.cos(t * 0.95) * 4.5 + flicker * 3.0) * amp;
    intFactor = 1.0 + flicker * 0.18 * amp;
    warmthShift = 0.16 + flicker * 0.10 * amp;
    goboPhase = t * 0.55;
  } else if (mode === 'cinema_orbit') {
    // Continuous 130-degree sculptural light orbit across nose bridge & both cheeks
    azOffset = Math.sin(t * 0.52) * 62.0 * amp;
    elOffset = Math.cos(t * 0.26) * 10.0 * amp;
    intFactor = 1.0 + Math.cos(t * 0.52) * 0.10 * amp;
    warmthShift = Math.sin(t * 0.52) * 0.16 * amp;
    goboPhase = t * 0.60;
  }

  const curAzDeg = baseAz + azOffset;
  const curElDeg = Math.max(4, Math.min(72, baseEl + elOffset));
  const radius = isStudio ? 64 : 116;
  const azRad = THREE.MathUtils.degToRad(curAzDeg);
  const elRad = THREE.MathUtils.degToRad(curElDeg);
  const cosEl = Math.cos(elRad);

  rig.key.position.set(
    radius * cosEl * Math.sin(azRad),
    radius * Math.sin(elRad),
    radius * cosEl * Math.cos(azRad)
  );
  rig.key.intensity = Math.max(0.35, baseKeyInt * intFactor);

  // Subtle color temperature breathing on key & rim lights
  const baseKeyCol = new THREE.Color(m.keyColor || basePreset.keyColor || '#ffeed6');
  baseKeyCol.lerp(new THREE.Color(hdrSig.keyTint), 0.52);
  if (warmthShift >= 0) {
    baseKeyCol.lerp(new THREE.Color('#ffbe6b'), Math.min(0.45, warmthShift));
  } else {
    baseKeyCol.lerp(new THREE.Color('#b6d4ff'), Math.min(0.45, -warmthShift));
  }
  rig.key.color.copy(baseKeyCol);

  if (rig.rim) {
    rig.rim.intensity = Math.max(0.2, baseRimInt * (1.0 - (intFactor - 1.0) * 0.5));
    const rimAz = azRad + Math.PI * 0.82;
    rig.rim.position.set(
      radius * 0.72 * Math.sin(rimAz),
      radius * 0.42,
      -radius * 0.68 * Math.cos(azRad * 0.5)
    );
  }

  GLOBAL_CHIAROSCURO_UNIFORMS.uWindowLightDir.value.copy(rig.key.position).normalize();
  GLOBAL_CHIAROSCURO_UNIFORMS.uWindowGoboPhase.value = goboPhase;

  // Update Tyndall ray direction & breathing intensity
  const tyndallAngleRad = -THREE.MathUtils.clamp(curAzDeg / 58.0, -0.82, 0.82);
  const curTyndall = Math.max(0, baseTyndall * (0.90 + 0.22 * intFactor));
  if (engine.atmosphere && typeof engine.atmosphere.setTyndallConfig === 'function') {
    engine.atmosphere.setTyndallConfig({
      intensity: curTyndall,
      color: baseKeyCol.getStyle(),
      azimuthDeg: curAzDeg,
    });
  }
  if (engine.beautyPost && engine.beautyPost.gradePass?.uniforms) {
    const u = engine.beautyPost.gradePass.uniforms;
    if (u.uTyndallAngle) u.uTyndallAngle.value = tyndallAngleRad;
    if (u.uTyndall) u.uTyndall.value = curTyndall;
  }

  // Throttle shadow map rebuilds during slow ambient light drift (every ~120ms is silky smooth & saves GPU!)
  const nowMs = performance.now();
  if (!engine._lastDynShadowMs || nowMs - engine._lastDynShadowMs > 110) {
    engine._lastDynShadowMs = nowMs;
    requestShadowUpdate(engine.renderer);
  }
  return true;
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
    const activeEnv = engine._activeVisualState?.envIntensity ?? cfg.envIntensity;
    const activeChiaro = engine._activeVisualState?.chiaroscuro ?? 0.94;
    scene.environmentIntensity = activeEnv * Math.max(0.12, 1.04 - activeChiaro * 0.72);
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
