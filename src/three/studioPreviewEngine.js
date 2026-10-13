import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  buildCollectibleHeadNode,
  applyHeadMorphsToGroup,
  updateHeadLifeAnimation,
  triggerCollectibleBlink,
  disposeHeadNode
} from './collectibleHeadAssembler.js';
import {
  applyBaseRendererSettings,
  ensureSceneEnvironment,
  buildStudioLightRig,
  applyRenderQualityToEngine
} from './photorealLighting.js';
import { createBeautyPostChain } from './beautyPostChain.js';

export class StudioPreviewEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.headNode = null;
    this.autoRotate = false;
    this.currentConfig = null;
    this.clock = new THREE.Clock();
    this.pointerNdc = { x: 0, y: 0 };

    this.initScene();
    this.bindPointerTracking();
    this.animate = this.animate.bind(this);
    this.animId = requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();

    const w = this.canvas.clientWidth || 540;
    const h = this.canvas.clientHeight || 480;
    this.camera = new THREE.PerspectiveCamera(34, w / h, 1, 300);
    this.camera.position.set(0, -7.0, 58);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.localClippingEnabled = true;
    // Stage 7 写实管线：ACES + sRGB + PCF 柔和阴影 + 离线 IBL 环境
    applyBaseRendererSettings(this.renderer, 0.94);
    ensureSceneEnvironment(this.renderer, this.scene, 0.85);

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, -1.5, 0.5);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 16;
    this.controls.maxDistance = 85;
    this.controls.update();

    // Stage 7 写实 5 点灯阵（主光带柔和阴影 + 底部解剖检查灯 + 背部轮廓光）
    this.lightRig = buildStudioLightRig(this.scene);
    this.keyLight = this.lightRig.key;

    // Stage 13a 电影级后期链（辉光 + 唯美调色；异常则回退直渲，永不黑屏）
    this.beautyPost = null;
    this.beautyPostUserEnabled = true;
    try {
      this.beautyPost = createBeautyPostChain(this.renderer, this.scene, this.camera, { width: w, height: h });
      this.beautyPost.setEnabled(true);
    } catch (err) {
      console.warn('后期链初始化失败，已回退直渲:', err);
      this.beautyPost = null;
    }

    // Subtle circular specimen studio reference ring below the C4/C5 neck cross-section
    const gridGeo = new THREE.RingGeometry(5.2, 5.38, 64);
    gridGeo.rotateX(-Math.PI / 2);
    gridGeo.translate(0, -12.75, -0.8);
    const gridMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide
    });
    this.cutPlaneHelper = new THREE.Mesh(gridGeo, gridMat);
    this.scene.add(this.cutPlaneHelper);
  }

  bindPointerTracking() {
    this.canvas.addEventListener('pointermove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }
    });
    this.canvas.addEventListener('pointerdown', () => {
      if (this.headNode) triggerCollectibleBlink(this.headNode);
    });
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w > 0 && h > 0) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
      if (this.beautyPost) this.beautyPost.syncSize(w, h, this.renderer.getPixelRatio());
    }
  }

  /** Stage 7：三档写实画质（low/medium/high），由设置页统一调度 */
  setRenderQuality(level) {
    const lvl = applyRenderQualityToEngine(this, level);
    if (this.beautyPost) {
      // 流畅档强制关闭后期（省显存保帧率），其余档位跟随用户开关
      this.beautyPost.setEnabled(lvl !== 'low' && this.beautyPostUserEnabled !== false);
    }
    this.resize();
  }

  /** Stage 13a：用户可随时开关辉光后期（设置页持久化） */
  setBeautyPostEnabled(v) {
    this.beautyPostUserEnabled = v !== false;
    if (this.beautyPost) {
      const lvl = this.currentRenderQuality || 'high';
      this.beautyPost.setEnabled(lvl !== 'low' && this.beautyPostUserEnabled);
    }
  }

  async loadOrRebuild(config) {
    const request = (this.loadRequest || 0) + 1;
    this.loadRequest = request;
    this.currentConfig = JSON.parse(JSON.stringify(config));
    if (config.photoElement) {
      this.currentConfig.photoElement = config.photoElement;
    }

    const newNode = await buildCollectibleHeadNode({ ...this.currentConfig, groomLod: 'studio' });
    if (request !== this.loadRequest) { disposeHeadNode(newNode); return this.headNode; }
    disposeHeadNode(this.headNode);
    this.headNode = newNode;
    this.scene.add(this.headNode);
    this.updateCutHelperPosition(config.morphs);
    return newNode;
  }

  /**
   * Real-time 32-channel morph slider update on the GLB meshes
   */
  updateMorphsFast(morphs = {}) {
    if (!this.headNode) return;
    applyHeadMorphsToGroup(this.headNode, morphs);
    this.updateCutHelperPosition(morphs);
  }

  updateCutHelperPosition(morphs = {}) {
    if (!this.cutPlaneHelper) return;
    this.cutPlaneHelper.position.y = (morphs.cutHeightOffset || 0) * 0.35;
    this.cutPlaneHelper.rotation.x = ((morphs.cutTiltPitch || 0) * Math.PI) / 180;
    this.cutPlaneHelper.rotation.z = -((morphs.cutTiltRoll || 0) * Math.PI) / 180;
  }

  setCameraPreset(preset) {
    this.autoRotate = false;
    if (preset === 'front') {
      this.camera.position.set(0, -7.0, 58);
      this.controls.target.set(0, -1.5, 0.5);
    } else if (preset === 'three_quarter') {
      this.camera.position.set(21, -5.0, 53);
      this.controls.target.set(0, -1.5, 0.5);
    } else if (preset === 'anatomy_bottom') {
      // Dramatic upward inspection view directly looking at the C4/C5 Medical Anatomical Neck Cross-Section!
      this.camera.position.set(0, -34, 15);
      this.controls.target.set(0, -12.2, -0.8);
    } else if (preset === 'profile') {
      this.camera.position.set(58, 0.0, 0.5);
      this.controls.target.set(0, -0.8, 0.5);
    } else if (preset === 'turntable') {
      this.camera.position.set(22, -4.0, 54);
      this.controls.target.set(0, -1.0, 0.5);
      this.autoRotate = true;
    }
    this.controls.update();
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate);
    const dt = Math.min(0.05, this.clock.getDelta());
    if (this.headNode) {
      if (this.autoRotate) {
        this.headNode.rotation.y += dt * 0.65;
      } else {
        this.headNode.rotation.y *= 0.92;
      }
      updateHeadLifeAnimation(this.headNode, dt, this.pointerNdc.x * 0.65, this.pointerNdc.y * 0.55);
    }
    this.controls.update();
    if (this.beautyPost && this.beautyPost.enabled) {
      this.beautyPost.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
