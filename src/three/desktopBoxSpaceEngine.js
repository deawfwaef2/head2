import * as THREE from 'three';
import {
  buildCollectibleHeadNode,
  applyHeadMorphsToGroup,
  attachRealHairModel,
  updateHeadLifeAnimation,
  triggerCollectibleBlink,
  disposeHeadNode
} from './collectibleHeadAssembler.js';
import { soundEngine } from '../audio/tactileSoundEngine.js';
import {
  applyBaseRendererSettings,
  isSoftwareRenderer,
  ensureSceneEnvironment,
  buildDesktopLightRig,
  applyRenderQualityToEngine
} from './photorealLighting.js';
import { createBeautyPostChain } from './beautyPostChain.js';
import { createBokehDust } from './atmosphere.js';

/**
 * Full-Screen 3D Perspective Box Space & Desktop Pet Physics/Interaction Engine
 * Implements:
 *  - Screen-Center Vanishing Point (透视消失点) with configurable X/Y offset
 *  - Bounded 3D Box Space (有限深度盒型空间: Front Glass Z=0 to Back Wall Z=-maxDepth)
 *  - Wheel Scroll Z-Depth push/pull along perspective rays toward/from Vanishing Point
 *  - Drag & Drop with tactile velocity inertia, wall collisions, and pet-to-pet physics
 *  - Click once -> Enter 360° Rotation Mode; Click again -> Cancel Rotation Mode
 *  - Real 3D Eyeball Cursor Gaze Follow + Natural Eyelid Blinking + Hover Dossier HUD
 */

export class DesktopBoxSpaceEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.onHoverChange = callbacks.onHoverChange || (() => {});
    this.onPetStateUpdate = callbacks.onPetStateUpdate || (() => {});
    this.onBoxCollisionVisual = callbacks.onBoxCollisionVisual || (() => {});

    this.settings = {
      fov: 42,
      vanishingPointOffsetX: 0,
      vanishingPointOffsetY: 0,
      boxWidthCm: 88,
      boxHeightCm: 52,
      boxMaxDepthMm: 1200,
      showBoxGrid: 'always',
      followIntensity: 0.0,
      wheelDepthStep: 1.0,
      autoResetAfterRotate: false,
      enablePetCollision: true,
      petsAlwaysOnTop: true
    };

    this.pets = new Map();
    this.hoveredPetId = null;
    this.pointerDownInfo = null;
    this.mouseNDC = new THREE.Vector2(0, 0);
    this.mouseClient = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();
    this.interactionHighlightTimer = 0;

    this.initScene();
    this.initBoxWireframe();
    this.bindEvents();
    this.animate = this.animate.bind(this);
    this.animFrameId = requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(this.settings.fov, w / h, 5, 600);
    this.cameraZ = 115;
    this.camera.position.set(0, 0, this.cameraZ);
    this.camera.lookAt(0, 0, -50);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      stencil: false
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.softwareRenderer = isSoftwareRenderer(this.renderer);
    this.renderer.localClippingEnabled = true;
    // Stage 7 写实管线：ACES + sRGB + PCF 柔和阴影 + 离线 IBL 环境
    applyBaseRendererSettings(this.renderer, 1.0);
    ensureSceneEnvironment(this.renderer, this.scene, 0.85);

    // Stage 7 写实 5 点灯阵（与工坊同色温体系；背部轮廓光改用确定性方向光）
    this.lightRig = buildDesktopLightRig(this.scene);
    this.hemiLight = this.lightRig.hemi;
    this.keyLight = this.lightRig.key;
    this.fillLight = this.lightRig.fill;
    this.anatomyUpLight = this.lightRig.up;
    this.rimLight = this.lightRig.rim;

    // Stage 13a 电影级后期链（辉光 + 唯美调色；异常则回退直渲，永不黑屏）
    this.beautyPost = null;
    this.beautyPostUserEnabled = true;
    try {
      if (!this.softwareRenderer) this.beautyPost = createBeautyPostChain(this.renderer, this.scene, this.camera, { width: w, height: h });
      this.beautyPost?.setEnabled(true);
    } catch (err) {
      console.warn('后期链初始化失败，已回退直渲:', err);
      this.beautyPost = null;
    }

    // Stage 13b 唯美氛围：盒型空间内的呼吸尘埃（加色混合，永不遮挡头模）
    this.atmosphere = null;
    try {
      this.atmosphere = createBokehDust({
        bounds: { x: [-58, 58], y: [-30, 30], z: [-112, -4] },
      });
      this.scene.add(this.atmosphere.group);
    } catch (err) {
      console.warn('氛围尘埃初始化失败，已跳过:', err);
      this.atmosphere = null;
    }

    this.updateCameraProjection();
  }

  getBoxBounds() {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const halfH = this.settings.boxHeightCm * 0.5;
    const halfW = halfH * aspect * (this.settings.boxWidthCm / 82);
    const maxDepthCm = this.settings.boxMaxDepthMm / 10;
    return {
      minX: -halfW,
      maxX: halfW,
      minY: -halfH,
      maxY: halfH,
      minZ: -maxDepthCm,
      maxZ: 0
    };
  }

  updateCameraProjection() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.fov = this.settings.fov;
    this.camera.aspect = w / h;

    const ox = -this.settings.vanishingPointOffsetX * w;
    const oy = this.settings.vanishingPointOffsetY * h;
    if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) {
      this.camera.setViewOffset(w, h, ox, oy, w, h);
    } else {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
  }

  initBoxWireframe() {
    if (this.boxGroup) {
      this.scene.remove(this.boxGroup);
    }
    this.boxGroup = new THREE.Group();
    this.boxGroup.name = 'Bounded3DBoxSpace';

    const b = this.getBoxBounds();
    const depthSlices = [0, 0.25, 0.5, 0.75, 1.0];
    const linePositions = [];
    const lineColors = [];

    const cFront = new THREE.Color('#38bdf8');
    const cBack = new THREE.Color('#6366f1');

    const pushSeg = (x1, y1, z1, x2, y2, z2, col1, col2) => {
      linePositions.push(x1, y1, z1, x2, y2, z2);
      lineColors.push(col1.r, col1.g, col1.b, col2.r, col2.g, col2.b);
    };

    for (const frac of depthSlices) {
      const z = b.minZ * frac;
      const col = cFront.clone().lerp(cBack, frac);
      pushSeg(b.minX, b.minY, z, b.maxX, b.minY, z, col, col);
      pushSeg(b.maxX, b.minY, z, b.maxX, b.maxY, z, col, col);
      pushSeg(b.maxX, b.maxY, z, b.minX, b.maxY, z, col, col);
      pushSeg(b.minX, b.maxY, z, b.minX, b.minY, z, col, col);
    }

    const rays = [
      [b.minX, b.minY], [b.maxX, b.minY], [b.maxX, b.maxY], [b.minX, b.maxY],
      [0, b.minY], [0, b.maxY], [b.minX, 0], [b.maxX, 0]
    ];
    for (const [rx, ry] of rays) {
      pushSeg(rx, ry, 0, rx, ry, b.minZ, cFront, cBack);
    }

    const vpCol = new THREE.Color('#4f46e5').multiplyScalar(0.65);
    pushSeg(b.minX * 0.35, b.minY * 0.35, b.minZ, b.maxX * 0.35, b.maxY * 0.35, b.minZ, vpCol, vpCol);
    pushSeg(b.minX * 0.35, b.maxY * 0.35, b.minZ, b.maxX * 0.35, b.minY * 0.35, b.minZ, vpCol, vpCol);

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    geom.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

    this.boxLinesMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.24,
      depthWrite: false
    });
    const lines = new THREE.LineSegments(geom, this.boxLinesMat);
    this.boxGroup.add(lines);

    const backWallGeo = new THREE.PlaneGeometry(b.maxX - b.minX, b.maxY - b.minY);
    this.backWallMat = new THREE.MeshBasicMaterial({
      color: '#0f172a',
      transparent: true,
      opacity: 0.12,
      depthWrite: false
    });
    const backWallMesh = new THREE.Mesh(backWallGeo, this.backWallMat);
    backWallMesh.position.z = b.minZ;
    this.boxGroup.add(backWallMesh);

    this.scene.add(this.boxGroup);
  }

  updateSettings(newPartial = {}) {
    Object.assign(this.settings, newPartial);
    this.updateCameraProjection();
    this.initBoxWireframe();
    const b = this.getBoxBounds();
    for (const pet of this.pets.values()) {
      pet.pos.x = Math.max(b.minX + 8, Math.min(b.maxX - 8, pet.pos.x));
      pet.pos.y = Math.max(b.minY + 10, Math.min(b.maxY - 9, pet.pos.y));
      pet.pos.z = Math.max(b.minZ + 8, Math.min(b.maxZ - 2, pet.pos.z));
    }
  }

  async summonCollectible(collectible) {
    if (this.pets.has(collectible.id)) {
      this.recallCollectible(collectible.id, false);
    }

    const headNode = await buildCollectibleHeadNode({ ...collectible, groomLod: 'desktop', groomSoftware: this.softwareRenderer });
    const b = this.getBoxBounds();

    const startX = Math.max(b.minX + 10, Math.min(b.maxX - 10, collectible.boxPosition?.x ?? 0));
    const startY = Math.max(b.minY + 11, Math.min(b.maxY - 10, collectible.boxPosition?.y ?? 2));
    const rawZCm = (collectible.boxPosition?.z ?? -160) / 10;
    const startZ = Math.max(b.minZ + 8, Math.min(b.maxZ - 2, rawZCm));

    headNode.position.set(startX, startY, startZ);
    headNode.rotation.set(-0.18, 0, 0);
    headNode.scale.setScalar(0.01);
    this.scene.add(headNode);

    const entry = {
      id: collectible.id,
      collectible,
      node: headNode,
      pos: new THREE.Vector3(startX, startY, startZ),
      vel: new THREE.Vector3(0, 0, 0),
      targetScale: 0.72,
      currentScale: 0.01,
      isRotationMode: false,
      customRot: new THREE.Euler(-0.18, 0, 0),
      currentRot: new THREE.Euler(-0.18, 0, 0),
      radius: 8.2,
      phase: Math.random() * Math.PI * 2
    };

    this.pets.set(collectible.id, entry);
    soundEngine.playSummon(true);
    this.onPetStateUpdate(this.getSummonedList());
    return entry;
  }

  recallCollectible(id, playSound = true) {
    const entry = this.pets.get(id);
    if (!entry) return;
    // Invalidate an in-flight style replacement before releasing this pet.
    entry.node.userData.hairRequestSerial = (entry.node.userData.hairRequestSerial || 0) + 1;
    disposeHeadNode(entry.node);
    this.pets.delete(id);
    if (this.hoveredPetId === id) {
      this.hoveredPetId = null;
      this.onHoverChange(null);
    }
    if (playSound) soundEngine.playSummon(false);
    this.onPetStateUpdate(this.getSummonedList());
  }

  toggleRotationMode(id) {
    const pet = this.pets.get(id);
    if (!pet) return;
    pet.isRotationMode = !pet.isRotationMode;
    if (pet.node.userData.gimbalGroup) {
      pet.node.userData.gimbalGroup.visible = pet.isRotationMode;
    }
    if (!pet.isRotationMode && this.settings.autoResetAfterRotate) {
      pet.customRot.set(-0.18, 0, 0);
    }
    triggerCollectibleBlink(pet.node);
    const b = this.getBoxBounds();
    const panX = pet.pos.x / Math.max(1, b.maxX);
    soundEngine.playRotationModeToggle(pet.isRotationMode, panX);
    this.onPetStateUpdate(this.getSummonedList());
    this.refreshHoverHUD();
  }

  resetPetOrientation(id) {
    const pet = this.pets.get(id);
    if (!pet) return;
    pet.customRot.set(-0.18, 0, 0);
  }

  setPetExpression(id, exprId) {
    const pet = this.pets.get(id);
    if (!pet || !pet.node) return;
    pet.collectible.deadExpression = exprId;
    pet.collectible.morphs = { ...(pet.collectible.morphs || {}), deadExpression: exprId };
    applyHeadMorphsToGroup(pet.node, { deadExpression: exprId });
    soundEngine.playPickup(0);
    this.onPetStateUpdate(this.getSummonedList());
    this.refreshHoverHUD();
  }

  async setPetHairStyle(id, hairStyle) {
    const pet = this.pets.get(id);
    if (!pet || !pet.node) return;
    pet.collectible.hairStyle = hairStyle;
    await attachRealHairModel(pet.node, { ...pet.collectible, groomLod: 'desktop', groomSoftware: this.softwareRenderer });
    soundEngine.playPickup(0);
    this.onPetStateUpdate(this.getSummonedList());
  }

  getSummonedList() {
    return Array.from(this.pets.values()).map(p => ({
      id: p.id,
      name: p.collectible.name,
      deadExpression: p.collectible.deadExpression || p.collectible.morphs?.deadExpression || 'dead_calm',
      hairStyle: p.collectible.hairStyle || 'hair_user_photo',
      isRotationMode: p.isRotationMode,
      x: Math.round(p.pos.x),
      y: Math.round(p.pos.y),
      zMm: Math.round(p.pos.z * 10)
    }));
  }

  worldToScreen(vec3) {
    const v = vec3.clone().project(this.camera);
    return {
      x: (v.x * 0.5 + 0.5) * window.innerWidth,
      y: (-v.y * 0.5 + 0.5) * window.innerHeight
    };
  }

  getMouseWorldAtZ(targetZ) {
    this.raycaster.setFromCamera(this.mouseNDC, this.camera);
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -targetZ);
    const hit = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(plane, hit);
    return hit;
  }

  pickPetAtCursor() {
    if (this.pets.size === 0) return null;
    this.raycaster.setFromCamera(this.mouseNDC, this.camera);
    const roots = [];
    for (const pet of this.pets.values()) {
      roots.push(pet.node);
    }
    const hits = this.raycaster.intersectObjects(roots, true);
    if (hits.length === 0) return null;

    let obj = hits[0].object;
    while (obj) {
      for (const pet of this.pets.values()) {
        if (pet.node === obj) return pet;
      }
      obj = obj.parent;
    }
    return null;
  }

  refreshHoverHUD() {
    if (!this.hoveredPetId || !this.pets.has(this.hoveredPetId)) {
      this.onHoverChange(null);
      return;
    }
    const pet = this.pets.get(this.hoveredPetId);
    const screenPt = this.worldToScreen(pet.pos.clone().add(new THREE.Vector3(9, 4, 0)));
    this.onHoverChange({
      id: pet.id,
      collectible: pet.collectible,
      isRotationMode: pet.isRotationMode,
      positionCm: {
        x: Math.round(pet.pos.x),
        y: Math.round(pet.pos.y),
        zMm: Math.round(pet.pos.z * 10)
      },
      screenX: screenPt.x,
      screenY: screenPt.y
    });
  }

  /**
   * Returns true if the pointer event target is an interactive UI control or inside a window when pets are NOT on top
   */
  isBlockedByUI(e) {
    // Native manager is a separate normal-sized OS window: never interact with
    // invisible desktop pets behind its controls or background.
    if (document.body.classList.contains('real-desktop-manager')) return true;
    const target = e.target;
    if (!target || !(target instanceof Element)) return false;
    // Always yield to the start modal or the 3D studio preview viewport canvas
    if (target.closest('#start-game-overlay, #studio-preview-canvas, #desktop-overlay-bar, #screen-pets-strip')) {
      return true;
    }
    // Always yield to interactive buttons, inputs, sliders, titlebars, tabs, or folder items
    if (target.closest('button, input, select, textarea, label, a, #window-titlebar, .nav-tab, .os-icon, .archive-folder-item')) {
      return true;
    }
    // If petsAlwaysOnTop is disabled, yield whenever pointer is inside #software-window
    if (!this.settings.petsAlwaysOnTop && target.closest('#software-window')) {
      return true;
    }
    return false;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    // Global pointerdown so 3D pets work seamlessly even when #desktop-pet-canvas has pointer-events: none!
    window.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.updateMouseCoords(e);
      if (this.isBlockedByUI(e)) return;

      const hitPet = this.pickPetAtCursor();
      if (!hitPet) return;

      e.stopPropagation();
      this.interactionHighlightTimer = 1.5;
      triggerCollectibleBlink(hitPet.node);

      const hitWorld = this.getMouseWorldAtZ(hitPet.pos.z);
      this.pointerDownInfo = {
        pet: hitPet,
        startX: e.clientX,
        startY: e.clientY,
        lastX: e.clientX,
        lastY: e.clientY,
        movedDist: 0,
        grabOffset: new THREE.Vector3().subVectors(hitPet.pos, hitWorld),
        pickupSoundPlayed: false
      };
    }, true);

    window.addEventListener('pointermove', (e) => {
      this.updateMouseCoords(e);

      if (this.pointerDownInfo) {
        const info = this.pointerDownInfo;
        const pet = info.pet;
        const dx = e.clientX - info.lastX;
        const dy = e.clientY - info.lastY;
        info.lastX = e.clientX;
        info.lastY = e.clientY;
        info.movedDist += Math.hypot(dx, dy);
        this.interactionHighlightTimer = 1.2;

        if (info.movedDist > 5) {
          if (pet.isRotationMode) {
            pet.customRot.y += dx * 0.013;
            pet.customRot.x = Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.48, pet.customRot.x + dy * 0.013));
            const speedNorm = Math.min(1, Math.hypot(dx, dy) / 28);
            const b = this.getBoxBounds();
            soundEngine.updateDragWhoosh(speedNorm * 0.55, pet.pos.x / Math.max(1, b.maxX));
          } else {
            if (!info.pickupSoundPlayed) {
              info.pickupSoundPlayed = true;
              const b = this.getBoxBounds();
              soundEngine.playPickup(pet.pos.x / Math.max(1, b.maxX));
            }
            const worldTarget = this.getMouseWorldAtZ(pet.pos.z).add(info.grabOffset);
            pet.vel.set(
              (worldTarget.x - pet.pos.x) * 0.48,
              (worldTarget.y - pet.pos.y) * 0.48,
              0
            );
            pet.pos.x = worldTarget.x;
            pet.pos.y = worldTarget.y;

            const speedNorm = Math.min(1, Math.hypot(dx, dy) / 34);
            const b = this.getBoxBounds();
            soundEngine.updateDragWhoosh(speedNorm, pet.pos.x / Math.max(1, b.maxX));
          }
          this.refreshHoverHUD();
        }
        return;
      }

      if (this.isBlockedByUI(e)) {
        if (this.hoveredPetId) {
          this.hoveredPetId = null;
          document.body.style.cursor = '';
          this.onHoverChange(null);
        }
        return;
      }

      const hitPet = this.pickPetAtCursor();
      const newId = hitPet ? hitPet.id : null;
      if (newId !== this.hoveredPetId) {
        this.hoveredPetId = newId;
        document.body.style.cursor = hitPet
          ? (hitPet.isRotationMode ? 'grab' : 'pointer')
          : '';
      }
      if (this.hoveredPetId) {
        this.refreshHoverHUD();
      } else {
        this.onHoverChange(null);
      }
    });

    window.addEventListener('pointerup', () => {
      if (!this.pointerDownInfo) return;
      const info = this.pointerDownInfo;
      const pet = info.pet;
      this.pointerDownInfo = null;

      soundEngine.stopDragWhoosh();

      if (info.movedDist <= 5) {
        this.toggleRotationMode(pet.id);
      } else if (info.pickupSoundPlayed) {
        const b = this.getBoxBounds();
        soundEngine.playRelease(pet.pos.x / Math.max(1, b.maxX));
      }
    });

    window.addEventListener('wheel', (e) => {
      this.updateMouseCoords(e);
      if (this.isBlockedByUI(e)) return;

      const hitPet = this.pickPetAtCursor() || (this.hoveredPetId ? this.pets.get(this.hoveredPetId) : null);
      if (!hitPet) return;

      // Only intercept wheel if cursor is actually over a 3D head pet!
      e.preventDefault();
      e.stopPropagation();
      this.interactionHighlightTimer = 1.6;

      const b = this.getBoxBounds();
      const stepCm = (e.deltaY > 0 ? -4.8 : 4.8) * this.settings.wheelDepthStep;
      const nextZ = hitPet.pos.z + stepCm;
      const panX = hitPet.pos.x / Math.max(1, b.maxX);

      if (nextZ < b.minZ + 6) {
        hitPet.pos.z = b.minZ + 6;
        hitPet.vel.z = 1.4;
        soundEngine.playBoxWallCollision(0.75, 'back_wall', panX);
        this.onBoxCollisionVisual('back');
      } else if (nextZ > b.maxZ - 2) {
        hitPet.pos.z = b.maxZ - 2;
        hitPet.vel.z = -1.4;
        soundEngine.playBoxWallCollision(0.85, 'front_glass', panX);
        this.onBoxCollisionVisual('front');
      } else {
        hitPet.pos.z = nextZ;
        const depthRatio = Math.abs(hitPet.pos.z) / Math.max(1, Math.abs(b.minZ));
        soundEngine.playDepthTick(depthRatio, panX);
      }

      this.refreshHoverHUD();
      this.onPetStateUpdate(this.getSummonedList());
    }, { passive: false, capture: true });
  }

  updateMouseCoords(e) {
    this.mouseClient.x = e.clientX;
    this.mouseClient.y = e.clientY;
    this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.renderer.setSize(w, h);
    if (this.beautyPost) this.beautyPost.syncSize(w, h, this.renderer.getPixelRatio());
    this.updateCameraProjection();
    this.initBoxWireframe();
  }

  /** Stage 7：三档写实画质（low/medium/high），由设置页统一调度 */
  setRenderQuality(level) {
    const lvl = applyRenderQualityToEngine(this, level);
    // Stage 15: RTX 2070S 自适应动态分辨率——以设定档为上限，帧率不足时逐级降像素比保60fps，回升时恢复。
    this._adaptiveBaseRatio = this.renderer.getPixelRatio();
    this._adaptiveScale = 1;
    this._fpsEma = 60;
    this._adaptiveTimer = 0;
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

  /** Stage 13b：用户可随时开关氛围尘埃（设置页持久化） */
  setAtmosphereEnabled(v) {
    if (this.atmosphere) this.atmosphere.group.visible = v !== false;
  }

  animate() {
    this.animFrameId = requestAnimationFrame(this.animate);
    const dt = Math.min(0.05, this.clock.getDelta());
    // Stage 15: 仅 rtx2070 档启用动态分辨率（其余档行为不变）
    if (this.currentRenderQuality === 'rtx2070' && dt > 0 && this._adaptiveBaseRatio) {
      this._fpsEma = this._fpsEma * 0.95 + (1 / Math.max(dt, 1e-4)) * 0.05;
      this._adaptiveTimer -= dt;
      if (this._adaptiveTimer <= 0) {
        let next = this._adaptiveScale;
        if (this._fpsEma < 48 && next > 0.7) next = Math.max(0.7, next - 0.15);
        else if (this._fpsEma > 57 && next < 1) next = Math.min(1, next + 0.1);
        if (next !== this._adaptiveScale) {
          this._adaptiveScale = next;
          this.renderer.setPixelRatio(Math.max(0.75, this._adaptiveBaseRatio * next));
          this.resize();
        }
        this._adaptiveTimer = 1.25;
      }
    }
    const elapsed = this.clock.getElapsedTime();
    const b = this.getBoxBounds();

    if (this.interactionHighlightTimer > 0) {
      this.interactionHighlightTimer = Math.max(0, this.interactionHighlightTimer - dt);
    }
    if (this.boxGroup && this.boxLinesMat) {
      if (this.settings.showBoxGrid === 'hidden') {
        this.boxGroup.visible = false;
      } else if (this.settings.showBoxGrid === 'interaction') {
        this.boxGroup.visible = this.interactionHighlightTimer > 0.02;
        this.boxLinesMat.opacity = Math.min(0.45, this.interactionHighlightTimer * 0.4);
      } else {
        this.boxGroup.visible = true;
        this.boxLinesMat.opacity = 0.22 + (this.interactionHighlightTimer > 0 ? 0.18 : 0);
      }
    }

    const petArray = Array.from(this.pets.values());

    if (this.settings.enablePetCollision && petArray.length > 1) {
      for (let i = 0; i < petArray.length; i++) {
        for (let j = i + 1; j < petArray.length; j++) {
          const p1 = petArray[i];
          const p2 = petArray[j];
          const diff = new THREE.Vector3().subVectors(p1.pos, p2.pos);
          const dist = diff.length();
          const minDist = p1.radius + p2.radius;
          if (dist < minDist && dist > 0.001) {
            const overlap = (minDist - dist) * 0.5;
            diff.normalize();
            p1.pos.addScaledVector(diff, overlap);
            p2.pos.addScaledVector(diff, -overlap);

            const relSpeed = p1.vel.distanceTo(p2.vel);
            p1.vel.addScaledVector(diff, 0.85);
            p2.vel.addScaledVector(diff, -0.85);
            if (relSpeed > 0.25) {
              soundEngine.playBoxWallCollision(Math.min(1, relSpeed * 0.45), 'pet', p1.pos.x / Math.max(1, b.maxX));
            }
          }
        }
      }
    }

    for (const pet of petArray) {
      pet.currentScale += (pet.targetScale - pet.currentScale) * 0.14;
      pet.node.scale.setScalar(pet.currentScale);

      const isBeingDragged = this.pointerDownInfo && this.pointerDownInfo.pet === pet && this.pointerDownInfo.movedDist > 5 && !pet.isRotationMode;

      if (!isBeingDragged) {
        pet.pos.add(pet.vel);
        pet.vel.multiplyScalar(0.88);
      }

      const marginX = 7.8;
      const marginY = 9.2;
      const panX = pet.pos.x / Math.max(1, b.maxX);

      if (pet.pos.x < b.minX + marginX) {
        pet.pos.x = b.minX + marginX;
        if (Math.abs(pet.vel.x) > 0.25) {
          soundEngine.playBoxWallCollision(Math.min(1, Math.abs(pet.vel.x) * 0.5), 'side', -0.9);
          this.onBoxCollisionVisual('left');
        }
        pet.vel.x = Math.abs(pet.vel.x) * 0.65;
      } else if (pet.pos.x > b.maxX - marginX) {
        pet.pos.x = b.maxX - marginX;
        if (Math.abs(pet.vel.x) > 0.25) {
          soundEngine.playBoxWallCollision(Math.min(1, Math.abs(pet.vel.x) * 0.5), 'side', 0.9);
          this.onBoxCollisionVisual('right');
        }
        pet.vel.x = -Math.abs(pet.vel.x) * 0.65;
      }

      if (pet.pos.y < b.minY + marginY) {
        pet.pos.y = b.minY + marginY;
        if (Math.abs(pet.vel.y) > 0.25) {
          soundEngine.playBoxWallCollision(Math.min(1, Math.abs(pet.vel.y) * 0.5), 'side', panX);
          this.onBoxCollisionVisual('bottom');
        }
        pet.vel.y = Math.abs(pet.vel.y) * 0.65;
      } else if (pet.pos.y > b.maxY - marginY) {
        pet.pos.y = b.maxY - marginY;
        if (Math.abs(pet.vel.y) > 0.25) {
          soundEngine.playBoxWallCollision(Math.min(1, Math.abs(pet.vel.y) * 0.5), 'side', panX);
          this.onBoxCollisionVisual('top');
        }
        pet.vel.y = -Math.abs(pet.vel.y) * 0.65;
      }

      if (pet.pos.z < b.minZ + 6) {
        pet.pos.z = b.minZ + 6;
        pet.vel.z = Math.abs(pet.vel.z) * 0.5;
      } else if (pet.pos.z > b.maxZ - 2) {
        pet.pos.z = b.maxZ - 2;
        pet.vel.z = -Math.abs(pet.vel.z) * 0.5;
      }

      // Lifeless specimen mode: no lively vertical bobbing ("不要眨眼，而且头不要跟随鼠标旋转，就是死人表情默认那种感觉")
      pet.node.position.set(pet.pos.x, pet.pos.y, pet.pos.z);

      const cursorWorld = this.getMouseWorldAtZ(pet.pos.z * 0.5);
      const dx = cursorWorld.x - pet.pos.x;
      const dy = cursorWorld.y - pet.pos.y;
      const follow = this.settings.followIntensity;

      updateHeadLifeAnimation(pet.node, dt, 0, 0);

      if (pet.isRotationMode) {
        pet.node.rotation.x += (pet.customRot.x - pet.node.rotation.x) * 0.22;
        pet.node.rotation.y += (pet.customRot.y - pet.node.rotation.y) * 0.22;
        pet.node.rotation.z += (0 - pet.node.rotation.z) * 0.18;
        if (pet.node.userData.gimbalGroup) {
          pet.node.userData.gimbalGroup.children[0].rotation.z += dt * 0.8;
          pet.node.userData.gimbalGroup.children[1].rotation.y -= dt * 0.6;
          // Stage 8b: 红色矢状环正对相机时会糊成脸中线"红纹身"，掠射角视角下淡出
          for (const ring of pet.node.userData.gimbalGroup.children) {
            const n = (ring.userData.planeNormal || new THREE.Vector3(0, 0, 1)).clone()
              .applyQuaternion(ring.getWorldQuaternion(new THREE.Quaternion()));
            const toCam = this.camera.position.clone()
              .sub(ring.getWorldPosition(new THREE.Vector3())).normalize();
            const facing = Math.abs(n.dot(toCam));
            const fade = Math.min(1, Math.max(0, (facing - 0.10) / 0.28));
            ring.material.opacity = (ring.userData.baseOpacity ?? 0.6) * fade;
          }
        }
      } else {
        const targetYaw = follow > 0.01
          ? Math.max(-0.55, Math.min(0.55, (dx / 45) * follow)) + pet.customRot.y * 0.35
          : pet.customRot.y;
        const targetPitch = follow > 0.01
          ? Math.max(-0.42, Math.min(0.42, (-dy / 40) * follow)) + pet.customRot.x
          : pet.customRot.x;
        const velocityRoll = Math.max(-0.32, Math.min(0.32, -pet.vel.x * 0.14));

        pet.node.rotation.x += (targetPitch - pet.node.rotation.x) * 0.14;
        pet.node.rotation.y += (targetYaw - pet.node.rotation.y) * 0.14;
        pet.node.rotation.z += (velocityRoll - pet.node.rotation.z) * 0.14;
      }
    }

    if (this.atmosphere && this.atmosphere.group.visible) {
      this.atmosphere.update(dt, elapsed);
    }

    if (this.beautyPost && this.beautyPost.enabled) {
      this.beautyPost.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
