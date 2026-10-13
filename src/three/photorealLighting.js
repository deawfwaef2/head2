import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * Stage 7 · 共享写实渲染管线 (Photoreal Rendering Pipeline)
 * - ACES 电影级色调映射 + sRGB 输出
 * - PMREM RoomEnvironment 图像光照 (IBL)：皮肤/眼球/发丝的真实反射与高光，全离线无外部 HDR
 * - 主光源 PCF 柔和阴影：鼻翼/唇缝/眼窝的真实自投影，消除“纸片 low 感”
 * - 三档画质 (low/medium/high)：像素比 / 阴影分辨率 / 环境光强度联动
 *
 * 本模块同时被 StudioPreviewEngine（工坊预览）与 DesktopBoxSpaceEngine（屏幕桌宠）
 * 引用，保证两处渲染观感一致。所有资源均为程序化生成，file:// 离线直玩兼容。
 */

export const RENDER_QUALITY_LEVELS = ['low', 'medium', 'high', 'ultra', 'rtx2070'];

// 每个 WebGLRenderer 只生成一张 PMREM 环境贴图，避免重复烘焙
const pmremEnvCache = new WeakMap();

export function applyBaseRendererSettings(renderer, exposure = 1.0) {
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

/**
 * 为场景挂载离线 IBL 环境（RoomEnvironment 经 PMREM 烘焙，无需任何外部 HDR 文件）。
 * 返回环境贴图；重复调用不会重复烘焙。
 */
export function ensureSceneEnvironment(renderer, scene, intensity = 0.85) {
  let envTex = pmremEnvCache.get(renderer);
  if (!envTex) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    envTex = pmrem.fromScene(room, 0.04).texture;
    pmrem.dispose();
    pmremEnvCache.set(renderer, envTex);
  }
  scene.environment = envTex;
  if ('environmentIntensity' in scene) {
    scene.environmentIntensity = intensity;
  }
  return envTex;
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

/**
 * 工坊预览 5 点写实灯阵（key 主光带阴影 + fill 补光 + 底部解剖检查灯 + 背部轮廓光 + 半球光）
 */
export function buildStudioLightRig(scene) {
  // A shaped studio key/fill ratio keeps facial planes readable instead of
  // filling every shadow into the flat, porcelain/plastic look.
  const hemi = new THREE.HemisphereLight('#fff5ef', '#34272b', 0.24);
  const key = new THREE.DirectionalLight('#fff4ed', 1.32);
  key.position.set(28, 34, 48);
  configureKeyShadow(key, 26, 2048, 220);
  const fill = new THREE.DirectionalLight('#b7c9e5', 0.20);
  fill.position.set(-34, 10, 35);
  const up = new THREE.DirectionalLight('#f2c9c0', 0.34);
  up.position.set(0, -48, 22);
  const rim = new THREE.DirectionalLight('#d1e2ef', 0.88);
  rim.position.set(0, 26, -42);
  scene.add(hemi, key, fill, up, rim);
  return { hemi, key, fill, up, rim };
}

/**
 * 屏幕桌宠盒型空间 5 点写实灯阵（与工坊同色温体系，保证预览与上屏一致）
 * 注意：旧版背部 PointLight 在物理灯光单位下几乎无贡献，改为确定性 DirectionalLight。
 */
export function buildDesktopLightRig(scene) {
  const hemi = new THREE.HemisphereLight('#fff5f0', '#26314a', 0.30);
  const key = new THREE.DirectionalLight('#fff6ef', 1.28);
  key.position.set(42, 48, 95);
  configureKeyShadow(key, 70, 2048, 500);
  const fill = new THREE.DirectionalLight('#9cc2ff', 0.26);
  fill.position.set(-55, 15, 70);
  const up = new THREE.DirectionalLight('#fde2e4', 0.38);
  up.position.set(0, -65, 55);
  const rim = new THREE.DirectionalLight('#7dd3fc', 1.08);
  rim.position.set(0, 35, -80);
  scene.add(hemi, key, fill, up, rim);
  return { hemi, key, fill, up, rim };
}

const QUALITY_CONFIGS = {
  low: { pixelRatioCap: 1, shadowSize: 0, envIntensity: 0.28, aniso: 4 },
  medium: { pixelRatioCap: 1.5, shadowSize: 1024, envIntensity: 0.50, aniso: 8 },
  high: { pixelRatioCap: 2, shadowSize: 2048, envIntensity: 0.55, aniso: 8 },
  // Stage 14 · 电影 Ultra：WebGL 版的 DLSS 等效上限——以超采样换发丝/皮肤稳定性。
  // 工坊(小画布)可拉到 3x + 4096 阴影；全屏桌宠封顶 2.5x，避免显存爆炸。
  ultra: { pixelRatioCap: 2.5, studioPixelRatioCap: 3, shadowSize: 2048, studioShadowSize: 4096, envIntensity: 0.58, aniso: 16 },
  // Stage 15 · RTX 2070 Super (Turing 8GB) 专属推荐档：单头桌宠瓶颈是全屏像素/发丝overdraw而非几何。
  // 原生分辨率起步 + 桌宠封顶1.5x/工坊2x + 2048阴影 + 16x过滤 + 桌面自适应动态分辨率(引擎侧)。
  // 这是该卡上“清晰度/帧率”甜点；盲目3x超采样只会掉帧并触发驱动降频，反而更糊更卡。
  rtx2070: { pixelRatioCap: 1.5, studioPixelRatioCap: 2, shadowSize: 2048, studioShadowSize: 2048, envIntensity: 0.50, aniso: 16 },
};

/**
 * 对引擎应用画质档位。调用方随后必须自行 resize（各引擎 resize 语义不同）。
 * 引擎需暴露：this.renderer / this.scene / this.keyLight。
 */
export function applyRenderQualityToEngine(engine, level = 'high') {
  const lvl = RENDER_QUALITY_LEVELS.includes(level) ? level : 'high';
  const cfg = QUALITY_CONFIGS[lvl];
  const { renderer, scene } = engine;
  if (!renderer || !scene) return lvl;

  const isStudio = Boolean(engine.controls);
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
  // Portrait supersampling reduces subpixel hair shimmer on DPR=1 displays.
  // Desktop stays native DPR to avoid quadrupling the full-screen render cost.
  let ratio = dpr;
  if (lvl === 'rtx2070') ratio = isStudio ? Math.max(dpr, 1.75) : Math.max(dpr, 1.25);
  else if (lvl === 'ultra') ratio = isStudio ? Math.max(dpr, 2.5) : Math.max(dpr, 1.75);
  else if (lvl === 'high' && isStudio) ratio = Math.max(dpr, 2);
  const cap = isStudio ? (cfg.studioPixelRatioCap || cfg.pixelRatioCap) : cfg.pixelRatioCap;
  renderer.setPixelRatio(engine.softwareRenderer ? Math.min(dpr, 1) : Math.min(ratio, cap));

  // 最高档把已加载贴图的各向异性过滤拉满，斜视角下皮肤/发丝不再糊成一片。
  const maxAniso = Math.min(cfg.aniso || 8, renderer.capabilities?.getMaxAnisotropy?.() || 8);
  scene.traverse?.((obj) => {
    const mats = Array.isArray(obj.material) ? obj.material : (obj.material ? [obj.material] : []);
    mats.forEach((m) => {
      ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'aoMap'].forEach((k) => {
        if (m[k]) m[k].anisotropy = maxAniso;
      });
    });
  });

  const shadowSize = isStudio ? (cfg.studioShadowSize || cfg.shadowSize) : cfg.shadowSize;
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
  engine.currentRenderQuality = lvl;
  return lvl;
}

export function isSoftwareRenderer(renderer) {
  try {
    const gl = renderer.getContext();
    const debug = gl.getExtension('WEBGL_debug_renderer_info');
    const name = debug ? gl.getParameter(debug.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
    return /swiftshader|llvmpipe|softpipe|software raster/i.test(String(name));
  } catch (_) { return false; }
}
