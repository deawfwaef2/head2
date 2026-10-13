import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Stage 23 · 大师级实时光影·画风色调·材质微距定制管线
 * (Real-Time Customizable Lighting, Art-Style Color Grading & SSS Material Pipeline)
 */

export const RENDER_QUALITY_LEVELS = ['low', 'medium', 'high', 'ultra', 'rtx2070'];

export const VISUAL_STYLE_PRESETS = {
  warm_gallery: {
    id: 'warm_gallery',
    label: '🏛️ 暖金私人藏馆 · 雕塑级立体光影 (默认推荐)',
    keyColor: '#fff3e8',
    fillColor: '#b8cbe8',
    rimColor: '#ffdfc2',
    hemiSky: '#fff5ee',
    hemiGround: '#1e161a',
    keyIntensity: 1.58,
    fillIntensity: 0.16,
    rimIntensity: 1.15,
    hemiIntensity: 0.20,
    upIntensity: 0.34,
    keyAzimuthDeg: 32,
    keyElevationDeg: 36,
    exposure: 0.90,
    envIntensity: 0.48,
    contrast: 1.12,
    saturation: 1.10,
    warmth: 0.06,
    vignette: 0.36,
    sharpen: 0.48,
    bloomStrength: 0.05,
    filmGrain: 0.0,
    skinGloss: 0.55,
    sssIntensity: 1.15,
    tint: [1.01, 0.99, 0.96],
    shadowTint: [0.03, 0.01, 0.02],
  },
  cold_forensic: {
    id: 'cold_forensic',
    label: '❄️ 冷冽法医标本室 · 手术冷光高锐度',
    keyColor: '#eef6ff',
    fillColor: '#9ec5eb',
    rimColor: '#bae6fd',
    hemiSky: '#f0f7ff',
    hemiGround: '#111927',
    keyIntensity: 1.65,
    fillIntensity: 0.18,
    rimIntensity: 1.28,
    hemiIntensity: 0.18,
    upIntensity: 0.42,
    keyAzimuthDeg: 24,
    keyElevationDeg: 44,
    exposure: 0.92,
    envIntensity: 0.52,
    contrast: 1.16,
    saturation: 1.02,
    warmth: -0.14,
    vignette: 0.38,
    sharpen: 0.66,
    bloomStrength: 0.04,
    filmGrain: 0.0,
    skinGloss: 0.78,
    sssIntensity: 0.85,
    tint: [0.96, 0.99, 1.04],
    shadowTint: [0.0, 0.02, 0.05],
  },
  gothic_velvet: {
    id: 'gothic_velvet',
    label: '🕯️ 暗夜哥特烛光 · 伦勃朗深邃油画感',
    keyColor: '#ffdfb8',
    fillColor: '#6f7ea8',
    rimColor: '#fda4af',
    hemiSky: '#ffe8d6',
    hemiGround: '#140c10',
    keyIntensity: 1.82,
    fillIntensity: 0.08,
    rimIntensity: 1.35,
    hemiIntensity: 0.12,
    upIntensity: 0.28,
    keyAzimuthDeg: 52,
    keyElevationDeg: 28,
    exposure: 0.86,
    envIntensity: 0.36,
    contrast: 1.22,
    saturation: 1.14,
    warmth: 0.16,
    vignette: 0.52,
    sharpen: 0.45,
    bloomStrength: 0.07,
    filmGrain: 0.08,
    skinGloss: 0.62,
    sssIntensity: 1.45,
    tint: [1.04, 0.97, 0.92],
    shadowTint: [0.06, 0.01, 0.03],
  },
  luxury_porcelain: {
    id: 'luxury_porcelain',
    label: '🌸 唯美凝脂画报 · 蜜桃冷白皮柔光',
    keyColor: '#fff7f2',
    fillColor: '#dce8f8',
    rimColor: '#ffe4e6',
    hemiSky: '#fff8f6',
    hemiGround: '#2d2226',
    keyIntensity: 1.42,
    fillIntensity: 0.28,
    rimIntensity: 1.05,
    hemiIntensity: 0.28,
    upIntensity: 0.38,
    keyAzimuthDeg: 20,
    keyElevationDeg: 26,
    exposure: 0.94,
    envIntensity: 0.56,
    contrast: 1.06,
    saturation: 1.12,
    warmth: 0.03,
    vignette: 0.26,
    sharpen: 0.40,
    bloomStrength: 0.07,
    filmGrain: 0.0,
    skinGloss: 0.50,
    sssIntensity: 1.35,
    tint: [1.02, 0.99, 1.0],
    shadowTint: [0.04, 0.015, 0.025],
  },
  cyber_vitrine: {
    id: 'cyber_vitrine',
    label: '🔮 赛博霓虹玻璃柜 · 冰蓝绯红双色轮廓',
    keyColor: '#f8f0ff',
    fillColor: '#38bdf8',
    rimColor: '#fb7185',
    hemiSky: '#e0f2fe',
    hemiGround: '#1e1028',
    keyIntensity: 1.48,
    fillIntensity: 0.36,
    rimIntensity: 1.85,
    hemiIntensity: 0.18,
    upIntensity: 0.40,
    keyAzimuthDeg: -34,
    keyElevationDeg: 32,
    exposure: 0.90,
    envIntensity: 0.54,
    contrast: 1.18,
    saturation: 1.22,
    warmth: -0.06,
    vignette: 0.44,
    sharpen: 0.54,
    bloomStrength: 0.09,
    filmGrain: 0.0,
    skinGloss: 0.85,
    sssIntensity: 1.10,
    tint: [0.99, 0.98, 1.05],
    shadowTint: [0.04, 0.0, 0.07],
  },
  vintage_film: {
    id: 'vintage_film',
    label: '🎞️ 复古胶片标本志 · 柯达暖调微颗粒',
    keyColor: '#ffeedb',
    fillColor: '#b5c2d4',
    rimColor: '#fcd34d',
    hemiSky: '#fff2e2',
    hemiGround: '#29201b',
    keyIntensity: 1.52,
    fillIntensity: 0.20,
    rimIntensity: 0.98,
    hemiIntensity: 0.22,
    upIntensity: 0.32,
    keyAzimuthDeg: 38,
    keyElevationDeg: 34,
    exposure: 0.89,
    envIntensity: 0.44,
    contrast: 1.14,
    saturation: 0.96,
    warmth: 0.14,
    vignette: 0.46,
    sharpen: 0.36,
    bloomStrength: 0.05,
    filmGrain: 0.22,
    skinGloss: 0.45,
    sssIntensity: 1.10,
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
 * Stage 23 · Pre-Integrated Subsurface Scattering (SSS) Dermis Wrap Shader with Live Uniform Control
 */
export function injectAestheticSubsurfaceScattering(material, initialSss = 1.15) {
  material.userData = material.userData || {};
  material.userData.uSssIntensity = { value: initialSss };

  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSssIntensity = material.userData.uSssIntensity;
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_physical_pars_fragment>',
      `#include <lights_physical_pars_fragment>
      uniform float uSssIntensity;
      vec3 computeSubsurfaceWrap(vec3 normal, vec3 lightDir, vec3 lightColor) {
        float ndl = dot(normal, lightDir);
        float wrap = clamp((ndl + 0.40) / 1.40, 0.0, 1.0);
        float scatterBand = smoothstep(-0.38, 0.16, ndl) * (1.0 - smoothstep(0.04, 0.56, ndl));
        vec3 sssTint = vec3(0.98, 0.30, 0.24) * scatterBand * 0.26 + vec3(1.0, 0.74, 0.68) * (wrap * 0.075);
        return sssTint * lightColor * uSssIntensity;
      }`
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <lights_fragment_end>',
      `#include <lights_fragment_end>
      #if ( NUM_DIR_LIGHTS > 0 )
        vec3 sssAccum = vec3(0.0);
        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
          sssAccum += computeSubsurfaceWrap( geometryNormal, directionalLights[ i ].direction, directionalLights[ i ].color );
        }
        #pragma unroll_loop_end
        reflectedLight.directDiffuse += sssAccum * diffuseColor.rgb * 0.40;
      #endif`
    );
  };
  material.customProgramCacheKey = () => 'cervix3d-aesthetic-sss-v23';
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
  const hemi = new THREE.HemisphereLight('#fff5ee', '#1e161a', 0.20);
  const key = new THREE.DirectionalLight('#fff3e8', 1.58);
  key.position.set(28, 34, 48);
  configureKeyShadow(key, 28, 2048, 220);
  const fill = new THREE.DirectionalLight('#b8cbe8', 0.16);
  fill.position.set(-34, 10, 35);
  const up = new THREE.DirectionalLight('#f2c9c0', 0.34);
  up.position.set(0, -48, 22);
  const rim = new THREE.DirectionalLight('#ffdfc2', 1.15);
  rim.position.set(-14, 28, -42);
  scene.add(hemi, key, fill, up, rim);
  return { hemi, key, fill, up, rim };
}

export function buildDesktopLightRig(scene) {
  const hemi = new THREE.HemisphereLight('#fff5ee', '#1e161a', 0.20);
  const key = new THREE.DirectionalLight('#fff3e8', 1.58);
  key.position.set(45, 52, 95);
  configureKeyShadow(key, 85, 2048, 520);
  const fill = new THREE.DirectionalLight('#b8cbe8', 0.16);
  fill.position.set(-55, 15, 70);
  const up = new THREE.DirectionalLight('#f7d5d0', 0.34);
  up.position.set(0, -65, 55);
  const rim = new THREE.DirectionalLight('#ffdfc2', 1.15);
  rim.position.set(-22, 38, -80);
  scene.add(hemi, key, fill, up, rim);
  return { hemi, key, fill, up, rim };
}

/**
 * Applies a complete Visual Customizer configuration (preset + user sliders) to either
 * DesktopBoxSpaceEngine or StudioPreviewEngine in real time.
 */
export function applyCustomVisualConfigToEngine(engine, cfg = {}) {
  if (!engine || !engine.renderer || !engine.scene) return;
  const basePreset = VISUAL_STYLE_PRESETS[cfg.presetId] || VISUAL_STYLE_PRESETS.warm_gallery;
  const m = { ...basePreset, ...cfg };

  const isStudio = Boolean(engine.controls);
  const rig = engine.lightRig || {
    hemi: engine.hemiLight || engine.hemi,
    key: engine.keyLight,
    fill: engine.fillLight,
    up: engine.anatomyUpLight || engine.upLight,
    rim: engine.rimLight,
  };

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
  }
  if (rig.fill) {
    rig.fill.color.set(m.fillColor || basePreset.fillColor);
    rig.fill.intensity = Number(m.fillIntensity ?? basePreset.fillIntensity);
  }
  if (rig.rim) {
    rig.rim.color.set(m.rimColor || basePreset.rimColor);
    rig.rim.intensity = Number(m.rimIntensity ?? basePreset.rimIntensity);
  }
  if (rig.hemi) {
    rig.hemi.color.set(m.hemiSky || basePreset.hemiSky);
    rig.hemi.groundColor.set(m.hemiGround || basePreset.hemiGround);
    rig.hemi.intensity = Number(m.hemiIntensity ?? basePreset.hemiIntensity);
  }
  if (rig.up) {
    rig.up.intensity = Number(m.upIntensity ?? basePreset.upIntensity);
  }

  engine.renderer.toneMappingExposure = Number(m.exposure ?? basePreset.exposure);
  if ('environmentIntensity' in engine.scene) {
    engine.scene.environmentIntensity = Number(m.envIntensity ?? basePreset.envIntensity);
  }

  // Update skin subsurface scattering & surface gloss on all heads in the scene
  const skinGloss = Number(m.skinGloss ?? basePreset.skinGloss);
  const sssIntensity = Number(m.sssIntensity ?? basePreset.sssIntensity);
  engine.scene.traverse((obj) => {
    if (!obj.isMesh || !obj.material) return;
    if (obj.name === 'HeadSkinMesh' || obj.material.userData?.uSssIntensity) {
      if (obj.material.userData?.uSssIntensity) {
        obj.material.userData.uSssIntensity.value = sssIntensity;
      }
      obj.material.roughness = Math.max(0.28, 0.72 - skinGloss * 0.34);
      obj.material.clearcoat = Math.min(0.45, 0.03 + skinGloss * 0.24);
      obj.material.clearcoatRoughness = Math.max(0.18, 0.56 - skinGloss * 0.28);
      obj.material.specularIntensity = 0.28 + skinGloss * 0.36;
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
