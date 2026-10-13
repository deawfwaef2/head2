import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Stage 23 · 大师级实时光影·画风色调·材质微距定制管线
 * (Real-Time Customizable Lighting, Art-Style Color Grading & SSS Material Pipeline)
 */

export const RENDER_QUALITY_LEVELS = ['low', 'medium', 'high', 'ultra', 'rtx2070'];

export const WINDOW_GOBO_CATALOG = [
  { id: 'rain_mullion', modeInt: 1, label: '🌧️ 雨夜十字窗格 + 窗玻璃流雨痕透光 (伴学推荐)' },
  { id: 'venetian_blinds', modeInt: 2, label: '🪟 书房百叶窗斜射格栅条纹透光 (极强明暗切割)' },
  { id: 'gothic_lattice', modeInt: 3, label: '🏰 哥特菱格花窗铅条透光 (古典标本馆)' },
  { id: 'tree_dappled', modeInt: 4, label: '🌿 窗外夜雨梧桐树影斑驳透光 (静谧庭院)' },
  { id: 'none', modeInt: 0, label: '🔦 纯粹伦勃朗单束聚光 (无窗框投影)' },
];

export const GLOBAL_CHIAROSCURO_UNIFORMS = {
  uSssIntensity: { value: 1.25 },
  uChiaroscuro: { value: 1.22 },
  uWindowGoboMode: { value: 1.0 },
  uWindowGoboStrength: { value: 0.72 },
  uWindowLightDir: { value: new THREE.Vector3(0.46, 0.44, 0.77).normalize() },
};

export const VISUAL_STYLE_PRESETS = {
  rainy_study: {
    id: 'rainy_study',
    label: '🌧️ 雨夜书房窗格透光 · 伦勃朗高反差伴学 (默认推荐)',
    keyColor: '#ffeed6',
    fillColor: '#5c7ba6',
    rimColor: '#93c5fd',
    hemiSky: '#cbd5e1',
    hemiGround: '#090d16',
    keyIntensity: 2.15,
    fillIntensity: 0.05,
    rimIntensity: 1.52,
    hemiIntensity: 0.08,
    upIntensity: 0.18,
    keyAzimuthDeg: 38,
    keyElevationDeg: 32,
    exposure: 0.88,
    envIntensity: 0.18,
    contrast: 1.24,
    saturation: 1.06,
    warmth: 0.02,
    vignette: 0.48,
    sharpen: 0.56,
    bloomStrength: 0.04,
    filmGrain: 0.05,
    skinGloss: 0.18,
    sssIntensity: 1.28,
    chiaroscuro: 1.25,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.74,
    tint: [1.0, 0.99, 1.02],
    shadowTint: [0.01, 0.02, 0.05],
  },
  warm_gallery: {
    id: 'warm_gallery',
    label: '🏛️ 暖金私人藏馆 · 雕塑级立体光影',
    keyColor: '#ffe8d1',
    fillColor: '#7b93b8',
    rimColor: '#ffdfc2',
    hemiSky: '#fff5ee',
    hemiGround: '#120c10',
    keyIntensity: 1.95,
    fillIntensity: 0.07,
    rimIntensity: 1.32,
    hemiIntensity: 0.10,
    upIntensity: 0.22,
    keyAzimuthDeg: 36,
    keyElevationDeg: 34,
    exposure: 0.88,
    envIntensity: 0.20,
    contrast: 1.20,
    saturation: 1.08,
    warmth: 0.06,
    vignette: 0.44,
    sharpen: 0.52,
    bloomStrength: 0.04,
    filmGrain: 0.03,
    skinGloss: 0.20,
    sssIntensity: 1.22,
    chiaroscuro: 1.18,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.68,
    tint: [1.01, 0.99, 0.96],
    shadowTint: [0.03, 0.01, 0.02],
  },
  cold_forensic: {
    id: 'cold_forensic',
    label: '❄️ 冷冽法医标本室 · 手术冷光高锐度',
    keyColor: '#e8f3ff',
    fillColor: '#648cb8',
    rimColor: '#bae6fd',
    hemiSky: '#e2efff',
    hemiGround: '#0a0f18',
    keyIntensity: 2.10,
    fillIntensity: 0.06,
    rimIntensity: 1.45,
    hemiIntensity: 0.08,
    upIntensity: 0.24,
    keyAzimuthDeg: 28,
    keyElevationDeg: 42,
    exposure: 0.88,
    envIntensity: 0.18,
    contrast: 1.26,
    saturation: 0.98,
    warmth: -0.14,
    vignette: 0.46,
    sharpen: 0.68,
    bloomStrength: 0.03,
    filmGrain: 0.04,
    skinGloss: 0.26,
    sssIntensity: 0.90,
    chiaroscuro: 1.32,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.76,
    tint: [0.96, 0.99, 1.04],
    shadowTint: [0.0, 0.02, 0.05],
  },
  gothic_velvet: {
    id: 'gothic_velvet',
    label: '🕯️ 暗夜哥特烛光 · 卡拉瓦乔极暗油画感',
    keyColor: '#ffd4a3',
    fillColor: '#4a5578',
    rimColor: '#fda4af',
    hemiSky: '#ffe8d6',
    hemiGround: '#0b0609',
    keyIntensity: 2.25,
    fillIntensity: 0.04,
    rimIntensity: 1.45,
    hemiIntensity: 0.06,
    upIntensity: 0.16,
    keyAzimuthDeg: 52,
    keyElevationDeg: 28,
    exposure: 0.84,
    envIntensity: 0.14,
    contrast: 1.28,
    saturation: 1.12,
    warmth: 0.16,
    vignette: 0.56,
    sharpen: 0.52,
    bloomStrength: 0.05,
    filmGrain: 0.09,
    skinGloss: 0.22,
    sssIntensity: 1.45,
    chiaroscuro: 1.40,
    windowGobo: 'gothic_lattice',
    windowGoboStrength: 0.78,
    tint: [1.04, 0.97, 0.92],
    shadowTint: [0.06, 0.01, 0.03],
  },
  luxury_porcelain: {
    id: 'luxury_porcelain',
    label: '🌸 唯美凝脂画报 · 庭院树影柔光对比',
    keyColor: '#fff5ed',
    fillColor: '#9cb4d8',
    rimColor: '#ffe4e6',
    hemiSky: '#fff8f6',
    hemiGround: '#1a1216',
    keyIntensity: 1.85,
    fillIntensity: 0.10,
    rimIntensity: 1.20,
    hemiIntensity: 0.12,
    upIntensity: 0.22,
    keyAzimuthDeg: 28,
    keyElevationDeg: 28,
    exposure: 0.90,
    envIntensity: 0.22,
    contrast: 1.16,
    saturation: 1.08,
    warmth: 0.03,
    vignette: 0.36,
    sharpen: 0.48,
    bloomStrength: 0.05,
    filmGrain: 0.0,
    skinGloss: 0.16,
    sssIntensity: 1.35,
    chiaroscuro: 1.08,
    windowGobo: 'tree_dappled',
    windowGoboStrength: 0.65,
    tint: [1.02, 0.99, 1.0],
    shadowTint: [0.04, 0.015, 0.025],
  },
  cyber_vitrine: {
    id: 'cyber_vitrine',
    label: '🔮 雨夜霓虹百叶窗 · 冰蓝绯红冷暖双切割',
    keyColor: '#f0f7ff',
    fillColor: '#38bdf8',
    rimColor: '#fb7185',
    hemiSky: '#e0f2fe',
    hemiGround: '#0f0716',
    keyIntensity: 1.98,
    fillIntensity: 0.12,
    rimIntensity: 1.95,
    hemiIntensity: 0.08,
    upIntensity: 0.22,
    keyAzimuthDeg: -38,
    keyElevationDeg: 32,
    exposure: 0.88,
    envIntensity: 0.20,
    contrast: 1.25,
    saturation: 1.18,
    warmth: -0.06,
    vignette: 0.48,
    sharpen: 0.56,
    bloomStrength: 0.06,
    filmGrain: 0.04,
    skinGloss: 0.28,
    sssIntensity: 1.10,
    chiaroscuro: 1.28,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.82,
    tint: [0.99, 0.98, 1.05],
    shadowTint: [0.04, 0.0, 0.07],
  },
  vintage_film: {
    id: 'vintage_film',
    label: '🎞️ 复古胶片标本志 · 旧书房窗影微颗粒',
    keyColor: '#ffe8cf',
    fillColor: '#7a8ea8',
    rimColor: '#fcd34d',
    hemiSky: '#fff2e2',
    hemiGround: '#17110e',
    keyIntensity: 1.92,
    fillIntensity: 0.08,
    rimIntensity: 1.15,
    hemiIntensity: 0.10,
    upIntensity: 0.20,
    keyAzimuthDeg: 40,
    keyElevationDeg: 34,
    exposure: 0.87,
    envIntensity: 0.18,
    contrast: 1.22,
    saturation: 0.94,
    warmth: 0.14,
    vignette: 0.50,
    sharpen: 0.46,
    bloomStrength: 0.04,
    filmGrain: 0.20,
    skinGloss: 0.16,
    sssIntensity: 1.15,
    chiaroscuro: 1.22,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.72,
    tint: [1.03, 0.99, 0.93],
    shadowTint: [0.05, 0.03, 0.01],
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

export function ensureSceneEnvironment(renderer, scene, intensity = 0.85) {
  let envTex = pmremEnvCache.get(renderer);
  if (!envTex) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();

    // Circular Portrait Beauty-Dish Ring Light in front (+Z) for soulful circular eye catchlights
    const ringGeo = new THREE.RingGeometry(1.30, 1.78, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(9.5, 8.9, 8.6),
      side: THREE.DoubleSide,
    });
    const beautyRing = new THREE.Mesh(ringGeo, ringMat);
    beautyRing.position.set(0.28, 1.15, 4.2);
    beautyRing.lookAt(0, 0.15, 0);
    room.add(beautyRing);

    // Warm Rose-Peach Key Softbox Panel (top-right-front)
    const warmBox = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.0),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(6.8, 5.6, 5.3), side: THREE.DoubleSide })
    );
    warmBox.position.set(3.1, 2.3, 2.9);
    warmBox.lookAt(0, 0, 0);
    room.add(warmBox);

    // Champagne-Pearl Rim Softbox Panel (top-left-back)
    const coolBox = new THREE.Mesh(
      new THREE.PlaneGeometry(3.8, 3.2),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(5.4, 5.2, 5.8), side: THREE.DoubleSide })
    );
    coolBox.position.set(-3.3, 2.2, -3.1);
    coolBox.lookAt(0, 0, 0);
    room.add(coolBox);

    envTex = pmrem.fromScene(room, 0.038).texture;
    room.dispose();
    pmrem.dispose();
    pmremEnvCache.set(renderer, envTex);
  }
  scene.environment = envTex;
  if ('environmentIntensity' in scene) {
    scene.environmentIntensity = intensity;
  }
  return envTex;
}

/**
 * Stage 27 · Rembrandt Chiaroscuro + Window Light Gobo Projection + De-Silicone Dermis SSS Shader
 */
export function injectAestheticSubsurfaceScattering(material, initialSss = 1.25) {
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
      varying vec3 vCervixWorldPos;
      varying vec3 vCervixWorldNormal;`
    );
    shader.vertexShader = shader.vertexShader.replace(
      '#include <worldpos_vertex>',
      `#include <worldpos_vertex>
      vCervixWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;
      vCervixWorldNormal = normalize(mat3(modelMatrix) * objectNormal);`
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
      varying vec3 vCervixWorldNormal;

      float computeWindowGoboMask(vec3 worldPos, vec3 lightDir) {
        if (uWindowGoboMode < 0.5 || uWindowGoboStrength <= 0.001) return 1.0;
        vec3 L = normalize(lightDir);
        vec3 rightAx = normalize(cross(vec3(0.0, 1.0, 0.0), L) + vec3(1e-4, 0.0, 0.0));
        vec3 upAx = normalize(cross(L, rightAx));
        vec2 p = vec2(dot(worldPos, rightAx), dot(worldPos, upAx));

        float mask = 1.0;
        if (uWindowGoboMode < 1.5) {
          // Mode 1: Rainy Night Window Mullions + Raindrop Refraction Streaks
          float barX = smoothstep(0.72, 0.88, abs(sin(p.x * 0.19)));
          float barY = smoothstep(0.74, 0.90, abs(sin(p.y * 0.21)));
          float framePass = (1.0 - barX * 0.88) * (1.0 - barY * 0.88);
          float rainStreak = 0.82 + 0.18 * sin(p.x * 1.85 + sin(p.y * 0.65) * 1.4) * cos(p.y * 0.42);
          mask = framePass * rainStreak;
        } else if (uWindowGoboMode < 2.5) {
          // Mode 2: Venetian Blinds Slats (High-contrast slatted window light)
          float slat = smoothstep(-0.22, 0.32, sin(p.y * 0.72 + p.x * 0.18));
          float stile = 1.0 - smoothstep(0.86, 0.95, abs(sin(p.x * 0.14))) * 0.82;
          mask = slat * stile;
        } else if (uWindowGoboMode < 3.5) {
          // Mode 3: Gothic Diamond Lead-Glass Window Lattice
          float d1 = smoothstep(0.76, 0.92, abs(sin((p.x + p.y) * 0.24)));
          float d2 = smoothstep(0.76, 0.92, abs(sin((p.x - p.y) * 0.24)));
          mask = (1.0 - d1 * 0.85) * (1.0 - d2 * 0.85);
        } else {
          // Mode 4: Rainy Courtyard Tree Foliage Dappled Shadows
          float leaf1 = sin(p.x * 0.31 + cos(p.y * 0.27) * 1.8);
          float leaf2 = cos(p.y * 0.37 - sin(p.x * 0.23) * 1.6);
          mask = smoothstep(-0.35, 0.48, leaf1 * leaf2 + 0.22);
        }
        return mix(1.0, clamp(mask, 0.08, 1.0), clamp(uWindowGoboStrength, 0.0, 1.0));
      }

      vec3 computeSubsurfaceWrap(vec3 normal, vec3 lightDir, vec3 lightColor) {
        float ndl = dot(normal, lightDir);
        float wrap = clamp((ndl + 0.36) / 1.36, 0.0, 1.0);
        float scatterBand = smoothstep(-0.32, 0.18, ndl) * (1.0 - smoothstep(0.05, 0.52, ndl));
        vec3 sssTint = vec3(0.92, 0.24, 0.20) * scatterBand * 0.32 + vec3(0.96, 0.68, 0.64) * (wrap * 0.055);
        return sssTint * lightColor * uSssIntensity;
      }`
    );

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      `#include <lights_fragment_end>
      vec3 worldN = normalize(vCervixWorldNormal);
      vec3 winL = normalize(uWindowLightDir);
      float goboMask = computeWindowGoboMask(vCervixWorldPos, winL);
      float rawNdl = dot(worldN, winL);

      // Rembrandt Chiaroscuro Light-Dark Differential (加强光影明暗差分 + 窗户透光)
      float litTerm = smoothstep(-0.14, 0.44, rawNdl) * goboMask;
      float chiaroscuroStrength = clamp(uChiaroscuro, 0.0, 1.6);
      float darkSuppression = mix(1.0, mix(0.14, 1.18, litTerm), clamp(chiaroscuroStrength * 0.72, 0.0, 0.94));

      reflectedLight.directDiffuse *= darkSuppression;
      reflectedLight.indirectDiffuse *= mix(1.0, 0.18 + 0.62 * litTerm, clamp(chiaroscuroStrength * 0.65, 0.0, 0.90));
      // Kill silicone-doll specular in shadow and grazing flat areas
      reflectedLight.directSpecular *= (0.22 + 0.78 * litTerm) * 0.62;
      reflectedLight.indirectSpecular *= (0.12 + 0.45 * litTerm) * 0.48;

      // Cool rainy-night shadow tint on the unlit side of the severed head
      vec3 coldShadowTint = vec3(0.72, 0.82, 0.98);
      reflectedLight.indirectDiffuse = mix(reflectedLight.indirectDiffuse * coldShadowTint, reflectedLight.indirectDiffuse, litTerm);

      #if ( NUM_DIR_LIGHTS > 0 )
        vec3 sssAccum = vec3(0.0);
        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
          sssAccum += computeSubsurfaceWrap( geometryNormal, directionalLights[ i ].direction, directionalLights[ i ].color );
        }
        #pragma unroll_loop_end
        reflectedLight.directDiffuse += sssAccum * diffuseColor.rgb * (0.25 + 0.75 * goboMask) * 0.38;
      #endif`
    );
  };
  material.customProgramCacheKey = () => 'cervix3d-chiaroscuro-window-sss-v27';
}

/**
 * Injects Window Light Gobo Projection onto 3D Desk Floor & Shelf surfaces
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
        float gMask = 1.0;
        if (uWindowGoboMode < 1.5) {
          float bx = smoothstep(0.72, 0.88, abs(sin(p.x * 0.14)));
          float by = smoothstep(0.74, 0.90, abs(sin(p.y * 0.16)));
          float rStreak = 0.84 + 0.16 * sin(p.x * 1.35 + sin(p.y * 0.5) * 1.2);
          gMask = (1.0 - bx * 0.85) * (1.0 - by * 0.85) * rStreak;
        } else if (uWindowGoboMode < 2.5) {
          gMask = smoothstep(-0.20, 0.30, sin(p.y * 0.55 + p.x * 0.14));
        } else if (uWindowGoboMode < 3.5) {
          float d1 = smoothstep(0.76, 0.92, abs(sin((p.x + p.y) * 0.18)));
          float d2 = smoothstep(0.76, 0.92, abs(sin((p.x - p.y) * 0.18)));
          gMask = (1.0 - d1 * 0.85) * (1.0 - d2 * 0.85);
        } else {
          gMask = smoothstep(-0.35, 0.48, sin(p.x * 0.22) * cos(p.y * 0.25) + 0.2);
        }
        float finalGobo = mix(1.0, clamp(gMask, 0.12, 1.0), clamp(uWindowGoboStrength, 0.0, 1.0));
        reflectedLight.directDiffuse *= finalGobo;
        reflectedLight.directSpecular *= finalGobo;
      }`
    );
  };
  material.customProgramCacheKey = () => 'cervix3d-stage-window-gobo-v27';
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
  light.shadow.bias = -0.00015;
  light.shadow.normalBias = 0.03;
}

export function buildStudioLightRig(scene) {
  const hemi = new THREE.HemisphereLight('#cbd5e1', '#090d16', 0.08);
  const key = new THREE.DirectionalLight('#ffeed6', 2.05);
  key.position.set(32, 34, 44);
  configureKeyShadow(key, 28, 2048, 220);
  const fill = new THREE.DirectionalLight('#5c7ba6', 0.05);
  fill.position.set(-34, 10, 35);
  const up = new THREE.DirectionalLight('#f2c9c0', 0.18);
  up.position.set(0, -48, 22);
  const rim = new THREE.DirectionalLight('#93c5fd', 1.48);
  rim.position.set(-18, 28, -42);
  scene.add(hemi, key, fill, up, rim);
  return { hemi, key, fill, up, rim };
}

export function buildDesktopLightRig(scene) {
  const hemi = new THREE.HemisphereLight('#cbd5e1', '#090d16', 0.08);
  const key = new THREE.DirectionalLight('#ffeed6', 2.15);
  key.position.set(54, 52, 86);
  configureKeyShadow(key, 85, 2048, 520);
  const fill = new THREE.DirectionalLight('#5c7ba6', 0.05);
  fill.position.set(-55, 15, 70);
  const up = new THREE.DirectionalLight('#f7d5d0', 0.18);
  up.position.set(0, -65, 55);
  const rim = new THREE.DirectionalLight('#93c5fd', 1.52);
  rim.position.set(-28, 42, -80);
  scene.add(hemi, key, fill, up, rim);
  return { hemi, key, fill, up, rim };
}

/**
 * Applies a complete Visual Customizer configuration (preset + user sliders + window gobo) to either
 * DesktopBoxSpaceEngine or StudioPreviewEngine in real time.
 */
export function applyCustomVisualConfigToEngine(engine, cfg = {}) {
  if (!engine || !engine.renderer || !engine.scene) return;
  const basePreset = VISUAL_STYLE_PRESETS[cfg.presetId] || VISUAL_STYLE_PRESETS.rainy_study;
  const m = { ...basePreset, ...cfg };

  const isStudio = Boolean(engine.controls);
  const rig = engine.lightRig || {
    hemi: engine.hemiLight || engine.hemi,
    key: engine.keyLight,
    fill: engine.fillLight,
    up: engine.anatomyUpLight || engine.upLight,
    rim: engine.rimLight,
  };

  const chiaroscuro = Number(m.chiaroscuro ?? basePreset.chiaroscuro ?? 1.25);
  const goboItem = WINDOW_GOBO_CATALOG.find(g => g.id === (m.windowGobo || basePreset.windowGobo || 'rain_mullion')) || WINDOW_GOBO_CATALOG[0];
  const goboStrength = Number(m.windowGoboStrength ?? basePreset.windowGoboStrength ?? 0.74);

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
    // Keep fill light suppressed when chiaroscuro is high so shadow side stays dark and dramatic
    const baseFill = Number(m.fillIntensity ?? basePreset.fillIntensity);
    rig.fill.intensity = baseFill * Math.max(0.15, 1.25 - chiaroscuro * 0.72);
  }
  if (rig.rim) {
    rig.rim.color.set(m.rimColor || basePreset.rimColor);
    rig.rim.intensity = Number(m.rimIntensity ?? basePreset.rimIntensity);
  }
  if (rig.hemi) {
    rig.hemi.color.set(m.hemiSky || basePreset.hemiSky);
    rig.hemi.groundColor.set(m.hemiGround || basePreset.hemiGround);
    const baseHemi = Number(m.hemiIntensity ?? basePreset.hemiIntensity);
    rig.hemi.intensity = baseHemi * Math.max(0.20, 1.20 - chiaroscuro * 0.65);
  }
  if (rig.up) {
    rig.up.intensity = Number(m.upIntensity ?? basePreset.upIntensity);
  }

  engine.renderer.toneMappingExposure = Number(m.exposure ?? basePreset.exposure);
  if ('environmentIntensity' in engine.scene) {
    const baseEnv = Number(m.envIntensity ?? basePreset.envIntensity);
    engine.scene.environmentIntensity = baseEnv * Math.max(0.25, 1.20 - chiaroscuro * 0.55);
  }

  // Update skin subsurface scattering & matte-velvet human dermis (NO silicone doll clearcoat!)
  const skinGloss = Number(m.skinGloss ?? basePreset.skinGloss ?? 0.18);
  const sssIntensity = Number(m.sssIntensity ?? basePreset.sssIntensity ?? 1.25);
  GLOBAL_CHIAROSCURO_UNIFORMS.uSssIntensity.value = sssIntensity;

  engine.scene.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    if (obj.name === 'HeadSkinMesh' || obj.material.userData?.uSssIntensity) {
      // Matte-velvet human dermis: roughness stays 0.56~0.76, clearcoat is 0 unless user explicitly cranks wetGloss above 0.65!
      obj.material.roughness = Math.max(0.46, 0.78 - skinGloss * 0.34);
      obj.material.clearcoat = skinGloss > 0.65 ? (skinGloss - 0.65) * 0.45 : 0.0;
      obj.material.clearcoatRoughness = Math.max(0.32, 0.68 - skinGloss * 0.28);
      obj.material.specularIntensity = 0.16 + skinGloss * 0.24;
      obj.material.envMapIntensity = 0.14 + skinGloss * 0.16;
    }
  });

  if (engine.beautyPost && typeof engine.beautyPost.setGradeParams === 'function') {
    engine.beautyPost.setGradeParams({
      bloomStrength: Number(m.bloomStrength ?? basePreset.bloomStrength),
      vignette: Number(m.vignette ?? basePreset.vignette),
      saturation: Number(m.saturation ?? basePreset.saturation),
      contrast: Number(m.contrast ?? basePreset.contrast),
      warmth: Number(m.warmth ?? basePreset.warmth),
      sharpen: Number(m.sharpen ?? basePreset.sharpen),
      filmGrain: Number(m.filmGrain ?? basePreset.filmGrain),
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
