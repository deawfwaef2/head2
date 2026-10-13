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
    label: '🎞️ 雨夜书房 · 伦勃朗窗光与次表面真皮肌理 (默认推荐)',
    keyColor: '#ffecd2',
    fillColor: '#6d84a8',
    rimColor: '#f7d8b6',
    hemiSky: '#f5e8d8',
    hemiGround: '#181210',
    keyIntensity: 2.38,
    fillIntensity: 0.24,
    rimIntensity: 1.42,
    hemiIntensity: 0.22,
    upIntensity: 0.24,
    keyAzimuthDeg: 38,
    keyElevationDeg: 32,
    exposure: 0.94,
    envIntensity: 0.28,
    contrast: 1.16,
    saturation: 0.96,
    warmth: 0.08,
    vignette: 0.36,
    sharpen: 0.64,
    bloomStrength: 0.06,
    filmGrain: 0.16,
    tyndall: 0.72,
    vintagePhoto: 0.36,
    skinGloss: 0.24,
    sssIntensity: 1.35,
    chiaroscuro: 1.18,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.55,
    tint: [1.01, 0.99, 0.96],
    shadowTint: [0.05, 0.035, 0.045],
  },
  warm_gallery: {
    id: 'warm_gallery',
    label: '🏛️ 暖金私人藏馆 · 雕塑级伦勃朗立体光影',
    keyColor: '#ffebd6',
    fillColor: '#7b93b8',
    rimColor: '#ffe0c4',
    hemiSky: '#fff5ee',
    hemiGround: '#151014',
    keyIntensity: 2.25,
    fillIntensity: 0.26,
    rimIntensity: 1.35,
    hemiIntensity: 0.24,
    upIntensity: 0.24,
    keyAzimuthDeg: 36,
    keyElevationDeg: 34,
    exposure: 0.94,
    envIntensity: 0.30,
    contrast: 1.16,
    saturation: 0.98,
    warmth: 0.08,
    vignette: 0.36,
    sharpen: 0.62,
    bloomStrength: 0.06,
    filmGrain: 0.14,
    tyndall: 0.65,
    vintagePhoto: 0.28,
    skinGloss: 0.24,
    sssIntensity: 1.30,
    chiaroscuro: 1.15,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.50,
    tint: [1.02, 0.99, 0.96],
    shadowTint: [0.04, 0.03, 0.03],
  },
  cold_forensic: {
    id: 'cold_forensic',
    label: '❄️ 冷冽法医标本室 · 无影灯微距毛孔高锐度',
    keyColor: '#eef6ff',
    fillColor: '#6b90bd',
    rimColor: '#bae6fd',
    hemiSky: '#e4f0ff',
    hemiGround: '#0d131f',
    keyIntensity: 2.30,
    fillIntensity: 0.28,
    rimIntensity: 1.48,
    hemiIntensity: 0.22,
    upIntensity: 0.26,
    keyAzimuthDeg: 28,
    keyElevationDeg: 40,
    exposure: 0.93,
    envIntensity: 0.28,
    contrast: 1.20,
    saturation: 0.94,
    warmth: -0.06,
    vignette: 0.38,
    sharpen: 0.72,
    bloomStrength: 0.05,
    filmGrain: 0.12,
    tyndall: 0.48,
    vintagePhoto: 0.18,
    skinGloss: 0.28,
    sssIntensity: 1.10,
    chiaroscuro: 1.22,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.48,
    tint: [0.97, 0.99, 1.03],
    shadowTint: [0.02, 0.03, 0.06],
  },
  gothic_velvet: {
    id: 'gothic_velvet',
    label: '🕯️ 暗夜哥特烛光 · 古典油画级深邃明暗',
    keyColor: '#ffd8ab',
    fillColor: '#56648c',
    rimColor: '#fda4af',
    hemiSky: '#ffe8d6',
    hemiGround: '#0e080c',
    keyIntensity: 2.42,
    fillIntensity: 0.18,
    rimIntensity: 1.45,
    hemiIntensity: 0.18,
    upIntensity: 0.20,
    keyAzimuthDeg: 48,
    keyElevationDeg: 28,
    exposure: 0.91,
    envIntensity: 0.22,
    contrast: 1.22,
    saturation: 0.95,
    warmth: 0.14,
    vignette: 0.46,
    sharpen: 0.60,
    bloomStrength: 0.07,
    filmGrain: 0.20,
    tyndall: 0.78,
    vintagePhoto: 0.52,
    skinGloss: 0.24,
    sssIntensity: 1.45,
    chiaroscuro: 1.28,
    windowGobo: 'gothic_lattice',
    windowGoboStrength: 0.58,
    tint: [1.03, 0.98, 0.92],
    shadowTint: [0.06, 0.03, 0.04],
  },
  luxury_porcelain: {
    id: 'luxury_porcelain',
    label: '🌸 晨光凝脂画报 · 柔光箱双侧通透肌理',
    keyColor: '#fff4e8',
    fillColor: '#9cb4d8',
    rimColor: '#ffe4e6',
    hemiSky: '#fff8f6',
    hemiGround: '#1a1216',
    keyIntensity: 2.15,
    fillIntensity: 0.34,
    rimIntensity: 1.28,
    hemiIntensity: 0.28,
    upIntensity: 0.26,
    keyAzimuthDeg: 32,
    keyElevationDeg: 30,
    exposure: 0.95,
    envIntensity: 0.34,
    contrast: 1.14,
    saturation: 0.98,
    warmth: 0.06,
    vignette: 0.32,
    sharpen: 0.60,
    bloomStrength: 0.07,
    filmGrain: 0.12,
    tyndall: 0.65,
    vintagePhoto: 0.28,
    skinGloss: 0.24,
    sssIntensity: 1.40,
    chiaroscuro: 1.06,
    windowGobo: 'tree_dappled',
    windowGoboStrength: 0.42,
    tint: [1.02, 0.99, 0.97],
    shadowTint: [0.04, 0.03, 0.03],
  },
  cyber_vitrine: {
    id: 'cyber_vitrine',
    label: '🔮 雨夜霓虹展柜 · 冰蓝绯红冷暖双切割',
    keyColor: '#f0f7ff',
    fillColor: '#38bdf8',
    rimColor: '#fb7185',
    hemiSky: '#e0f2fe',
    hemiGround: '#0f0716',
    keyIntensity: 2.18,
    fillIntensity: 0.26,
    rimIntensity: 1.85,
    hemiIntensity: 0.20,
    upIntensity: 0.24,
    keyAzimuthDeg: -38,
    keyElevationDeg: 32,
    exposure: 0.92,
    envIntensity: 0.26,
    contrast: 1.20,
    saturation: 1.06,
    warmth: -0.02,
    vignette: 0.42,
    sharpen: 0.64,
    bloomStrength: 0.07,
    filmGrain: 0.12,
    tyndall: 0.68,
    vintagePhoto: 0.20,
    skinGloss: 0.28,
    sssIntensity: 1.20,
    chiaroscuro: 1.22,
    windowGobo: 'venetian_blinds',
    windowGoboStrength: 0.55,
    tint: [0.99, 0.98, 1.04],
    shadowTint: [0.04, 0.0, 0.06],
  },
  vintage_film: {
    id: 'vintage_film',
    label: '📷 民国银盐老相片 · 复古胶片颗粒与暖金高光',
    keyColor: '#ffe6c8',
    fillColor: '#82776c',
    rimColor: '#fcd34d',
    hemiSky: '#fff0db',
    hemiGround: '#17110e',
    keyIntensity: 2.28,
    fillIntensity: 0.22,
    rimIntensity: 1.34,
    hemiIntensity: 0.20,
    upIntensity: 0.22,
    keyAzimuthDeg: 42,
    keyElevationDeg: 34,
    exposure: 0.93,
    envIntensity: 0.24,
    contrast: 1.18,
    saturation: 0.86,
    warmth: 0.16,
    vignette: 0.44,
    sharpen: 0.58,
    bloomStrength: 0.07,
    filmGrain: 0.24,
    tyndall: 0.82,
    vintagePhoto: 0.68,
    skinGloss: 0.22,
    sssIntensity: 1.28,
    chiaroscuro: 1.20,
    windowGobo: 'rain_mullion',
    windowGoboStrength: 0.52,
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
        // Chromatic RGB wrap-lighting (Jimenez/Penner Pre-Integrated Skin profile: Red scatters deepest into shadow)
        float wrapR = clamp((ndl + 0.48) / 1.48, 0.0, 1.0);
        float wrapG = clamp((ndl + 0.22) / 1.22, 0.0, 1.0);
        float wrapB = clamp((ndl + 0.05) / 1.05, 0.0, 1.0);
        // Blood-warm terminator band right along the light-shadow boundary (ndl in [-0.38, +0.24])
        float penumbra = smoothstep(-0.42, 0.06, ndl) * (1.0 - smoothstep(0.04, 0.46, ndl));
        vec3 deepDermis = vec3(0.94, 0.22, 0.15) * penumbra * 0.38;
        vec3 chromaticWrap = vec3(wrapR * 0.14, wrapG * 0.075, wrapB * 0.045);
        return (deepDermis + chromaticWrap) * lightColor * uSssIntensity;
      }`
    );

    // Combine high-frequency dermal pore relief from roughnessMap with Aksel_Skin_NRM.png normalMap!
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
          normal = normalize( normal - ( 0.022 / max( abs( det ), 1e-4 ) ) * surfGrad );
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

      // True Perturbed-Normal Chiaroscuro Differential (preserves every pore and wrinkle from Aksel_Skin_NRM.png)
      float litTerm = smoothstep(-0.22, 0.48, fragNdl) * winEnv;
      float chiaroscuroStrength = clamp(uChiaroscuro, 0.0, 1.6);
      float chiaroscuroCurve = mix(1.0, mix(0.32, 1.12, litTerm), clamp(chiaroscuroStrength * 0.52, 0.0, 0.78));

      reflectedLight.directDiffuse *= chiaroscuroCurve;
      reflectedLight.indirectDiffuse *= mix(1.0, 0.42 + 0.58 * litTerm, clamp(chiaroscuroStrength * 0.45, 0.0, 0.68));

      // Anti-Silicone Pore-Cavity Specular Masking:
      // Breaks up uniform plastic specular sheets so pore cavities trap light and lipid micro-facets glint naturally
      float poreSpecMask = clamp(1.42 - roughnessFactor * 1.18, 0.15, 1.15);
      reflectedLight.directSpecular *= (0.28 + 0.72 * litTerm) * poreSpecMask * 0.68;
      reflectedLight.indirectSpecular *= (0.22 + 0.58 * litTerm) * poreSpecMask * 0.52;

      // Subtle cool slate-blue atmospheric tint in deep shadow planes
      vec3 coldShadowTint = vec3(0.80, 0.87, 0.98);
      reflectedLight.indirectDiffuse = mix(reflectedLight.indirectDiffuse * coldShadowTint, reflectedLight.indirectDiffuse, litTerm);

      // Vellus Hair (Peach Fuzz) Grazing Rim Backscatter along cheek & jawline contour
      float ndotv = clamp(dot(normal, viewDir), 0.0, 1.0);
      float vellusRim = pow(1.0 - ndotv, 3.8) * smoothstep(-0.15, 0.55, fragNdl);
      reflectedLight.directDiffuse += diffuseColor.rgb * vec3(1.04, 0.94, 0.88) * vellusRim * 0.14;

      #if ( NUM_DIR_LIGHTS > 0 )
        vec3 sssAccum = vec3(0.0);
        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
          sssAccum += computeDualLobeSkinSSS( normal, directionalLights[ i ].direction, directionalLights[ i ].color );
        }
        #pragma unroll_loop_end
        reflectedLight.directDiffuse += sssAccum * diffuseColor.rgb * (0.45 + 0.55 * winEnv) * 0.42;
      #endif`
    );
  };
  material.customProgramCacheKey = () => 'cervix3d-chiaroscuro-window-sss-v29';
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
  const hemi = new THREE.HemisphereLight('#d6e0f0', '#121622', 0.22);
  const key = new THREE.DirectionalLight('#ffeed6', 2.25);
  key.position.set(32, 34, 44);
  configureKeyShadow(key, 20, 2048, 220);
  const fill = new THREE.DirectionalLight('#6d86b0', 0.24);
  fill.position.set(-34, 12, 35);
  const up = new THREE.DirectionalLight('#f2c9c0', 0.22);
  up.position.set(0, -48, 22);
  const rim = new THREE.DirectionalLight('#93c5fd', 1.42);
  rim.position.set(-18, 28, -42);
  scene.add(hemi, key, fill, up, rim);
  return { hemi, key, fill, up, rim };
}

export function buildDesktopLightRig(scene) {
  const hemi = new THREE.HemisphereLight('#d6e0f0', '#121622', 0.22);
  const key = new THREE.DirectionalLight('#ffeed6', 2.35);
  key.position.set(54, 52, 86);
  configureKeyShadow(key, 54, 2048, 480);
  const fill = new THREE.DirectionalLight('#6d86b0', 0.24);
  fill.position.set(-55, 16, 70);
  const up = new THREE.DirectionalLight('#f7d5d0', 0.22);
  up.position.set(0, -65, 55);
  const rim = new THREE.DirectionalLight('#93c5fd', 1.45);
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

  const tyndallVal = Number(m.tyndall ?? basePreset.tyndall ?? 0.85);
  const vintagePhotoVal = Number(m.vintagePhoto ?? basePreset.vintagePhoto ?? 0.76);
  const keyAzDeg = Number(m.keyAzimuthDeg ?? basePreset.keyAzimuthDeg ?? 40);
  const tyndallAngleRad = keyAzDeg >= 0 ? -0.58 : 0.58;
  const keyHex = m.keyColor || basePreset.keyColor || '#ffe7c4';

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
      sharpen: Number(m.sharpen ?? basePreset.sharpen),
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
