import * as THREE from 'three';
import {
  buildCollectibleHeadNode,
  applyHeadMorphsToGroup,
  attachRealHairModel,
  attachSpecimenContainerAndDecor,
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
  applyRenderQualityToEngine,
  applyCustomVisualConfigToEngine,
  requestShadowUpdate
} from './photorealLighting.js';
import { createBeautyPostChain } from './beautyPostChain.js';
import { createBokehDust } from './atmosphere.js';
import {
  buildScreenSpaceStageGroup,
  buildPlaceableContainerStructure,
  updateContainerStructureState,
  updateRainyStudyBackdrop
} from './specimenStageAndContainers.js';

/**
 * Full-Screen 3D Perspective Box Space & Desktop Pet Physics/Interaction Engine
 * Stage 23 Upgrades:
 *  - Real 3D Gravity & Surface Landing System (`enableGravity`: true by default, switchable to floating mode)
 *  - Clear 3D Floor Stage & Screen-Space Multi-Shelf Rack (`floorStyle`, `shelfLayout`)
 *  - 3D Specimen Containers & Holders (`glass_bell_jar`, `velvet_chalice`, `formalin_cylinder`, `acrylic_cube`, `surgical_tray`, `none`)
 *  - 3D Study Companion Decorative Props (`trophy_candles`, `study_tomes`, `soul_siphon`, `forensic_evidence`, `none`)
 *  - One-Click Screen-Space Placement Formations (`study_sides`, `bottom_row`, `altar_pyramid`, `macro_focus`)
 */

export class DesktopBoxSpaceEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.onHoverChange = callbacks.onHoverChange || (() => {});
    this.onPetStateUpdate = callbacks.onPetStateUpdate || (() => {});
    this.onStructuresUpdate = callbacks.onStructuresUpdate || (() => {});
    this.onBoxCollisionVisual = callbacks.onBoxCollisionVisual || (() => {});

    this.settings = {
      fov: 42,
      vanishingPointOffsetX: 0,
      vanishingPointOffsetY: 0,
      boxFitScreen: true,
      boxWidthCm: 96,
      boxHeightCm: 56,
      boxMaxDepthMm: 1200,
      showBoxGrid: 'always',
      followIntensity: 0.0,
      wheelDepthStep: 1.0,
      autoResetAfterRotate: false,
      enablePetCollision: true,
      petsAlwaysOnTop: true,
      // Stage 27 Gravity, Walnut Study Desk, Rainy Window & Placeable Container Structures
      enableGravity: true,
      floorStyle: 'walnut_desk',
      shelfLayout: 'study_side_rack',
      defaultContainerStyle: 'glass_bell_jar',
      defaultDecorStyle: 'study_tomes',
      rainyWindowEnabled: true,
    };

    this.stagePlatforms = [];
    this.visualConfig = { presetId: 'rainy_study' };

    this.pets = new Map();
    this.structures = new Map();
    this.structureSerial = 1;
    this.hoveredPetId = null;
    this.pointerDownInfo = null;
    this.mouseNDC = new THREE.Vector2(0, 0);
    this.mouseClient = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();
    this.interactionHighlightTimer = 0;

    this.lastFrameTime = performance.now();
    this.renderWakeUntil = performance.now() + 2500;
    this.needsShadowRefresh = true;

    this.initScene();
    this.initBoxWireframe();
    this.bindEvents();
    this.animate = this.animate.bind(this);
    this.animFrameId = requestAnimationFrame(this.animate);
  }

  wakeRender(durationSeconds = 1.6, refreshShadow = false) {
    const until = performance.now() + durationSeconds * 1000;
    if (until > this.renderWakeUntil) {
      this.renderWakeUntil = until;
    }
    if (refreshShadow) {
      this.needsShadowRefresh = true;
    }
  }

  initScene() {
    this.scene = new THREE.Scene();

    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(this.settings.fov, w / h, 4, 700);
    this.cameraZ = 115;
    this.camera.position.set(0, 0, this.cameraZ);
    this.camera.lookAt(0, 0, -50);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'default',
      stencil: false
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.softwareRenderer = isSoftwareRenderer(this.renderer);
    this.renderer.localClippingEnabled = true;
    // Stage 22 唯美写实管线：ACES + sRGB + 静态阴影缓存 + 环形眼神光离线 IBL
    applyBaseRendererSettings(this.renderer, 0.86);
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
    if (this.settings.boxFitScreen !== false) {
      // 前框贴屏：以相机到前框(Z=0)的距离反推可视半高/半宽，前框四边与屏幕四边重合
      const dist = Math.max(1, this.cameraZ || 115);
      const halfH = Math.tan(THREE.MathUtils.degToRad((this.settings.fov || 42) * 0.5)) * dist;
      const halfW = halfH * aspect;
      const maxDepthCm = this.settings.boxMaxDepthMm / 10;
      return {
        minX: -halfW,
        maxX: halfW,
        minY: -halfH,
        maxY: halfH,
        minZ: -maxDepthCm,
        // Stage 22 Macro Close-Up Zone: allow scrolling forward up to Z = +78 cm (37 cm from camera!)
        maxZ: 78
      };
    }
    const halfH = this.settings.boxHeightCm * 0.5;
    const halfW = halfH * aspect * (this.settings.boxWidthCm / 82);
    const maxDepthCm = this.settings.boxMaxDepthMm / 10;
    return {
      minX: -halfW,
      maxX: halfW,
      minY: -halfH,
      maxY: halfH,
      minZ: -maxDepthCm,
      maxZ: 78
    };
  }

  /**
   * Stage 22 · Computes perspective-accurate X/Y boundaries at any depth `z` so the head
   * can be dragged smoothly all the way to the true left/right/top/bottom screen edges at any depth.
   */
  getBoxBoundsAtZ(z = 0, petScale = 0.76) {
    const base = this.getBoxBounds();
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const distFromCam = Math.max(26, (this.cameraZ || 115) - z);
    const fovRad = THREE.MathUtils.degToRad((this.camera?.fov || this.settings.fov || 42) * 0.5);
    const frustumHalfH = distFromCam * Math.tan(fovRad);
    const frustumHalfW = frustumHalfH * aspect;

    const widthScale = this.settings.boxFitScreen !== false ? 1.0 : Math.max(0.75, (this.settings.boxWidthCm || 96) / 96);
    const heightScale = this.settings.boxFitScreen !== false ? 1.0 : Math.max(0.75, (this.settings.boxHeightCm || 56) / 56);
    const halfW = frustumHalfW * widthScale;
    const halfH = frustumHalfH * heightScale;

    // Gentle edge padding so the head never disappears completely off-screen,
    // while letting you place it right up against any screen edge or corner!
    const padX = Math.min(halfW * 0.08, 2.4 * petScale);
    const padY = Math.min(halfH * 0.10, 2.8 * petScale);

    return {
      minX: -(halfW - padX),
      maxX: halfW - padX,
      minY: -(halfH - padY),
      maxY: halfH - padY,
      minZ: base.minZ,
      maxZ: base.maxZ
    };
  }

  computeMacroTargetScale(zCm, baseScale = 0.76) {
    // Smoothly boosts scale up to 1.52x when scrolled into the close-up zone (z > -15 up to +76)
    const macroT = Math.max(0, Math.min(1, (zCm + 15) / 91));
    return baseScale * (1.0 + macroT * 0.52);
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

    // Stage 23/27: Build Clear 3D Floor Stage, Screen-Space Shelves, Rainy Study Window & Independent Scene Decor Props
    if (this.stageGroup) {
      this.scene.remove(this.stageGroup);
    }
    const { group: stageGroup, platforms } = buildScreenSpaceStageGroup(b, {
      floorStyle: this.settings.floorStyle || 'walnut_desk',
      shelfLayout: this.settings.shelfLayout || 'study_side_rack',
      decorStyle: this.settings.defaultDecorStyle || 'study_tomes',
      rainyWindowEnabled: this.settings.rainyWindowEnabled !== false,
    });
    this.stageGroup = stageGroup;
    this.stagePlatforms = platforms;
    this.scene.add(this.stageGroup);
  }

  /**
   * Finds the highest 3D shelf or floor surface Y underneath `(x, z)` that can support a head or structure at `y`.
   */
  getSupportSurfaceY(x, y, z, scale = 0.76, baseBottomOffset = -10.8) {
    const baseB = this.getBoxBounds();
    const defaultFloorY = baseB.minY + 1.8;
    if (!this.stagePlatforms || this.stagePlatforms.length === 0) return defaultFloorY;

    const currentBottomY = y + baseBottomOffset * scale;
    let bestSurfaceY = defaultFloorY;
    for (const plat of this.stagePlatforms) {
      if (plat.isMainFloor) {
        bestSurfaceY = Math.max(bestSurfaceY, plat.surfaceY);
        continue;
      }
      if (x >= plat.minX && x <= plat.maxX && z >= plat.minZ && z <= plat.maxZ) {
        if (currentBottomY >= plat.surfaceY - 2.6) {
          if (plat.surfaceY > bestSurfaceY) {
            bestSurfaceY = plat.surfaceY;
          }
        }
      }
    }
    return bestSurfaceY;
  }

  /**
   * Stage 27 · Places an Independent 3D Specimen Container Structure (`可放置的头颅收纳建筑`) in the 3D scene.
   * Not bound to any character! Any severed head dropped near it magnetically snaps onto its neck socket,
   * and dragging the head lifts the pure severed head right back out.
   */
  placeContainerStructure(containerStyle = 'glass_bell_jar', options = {}) {
    if (!containerStyle || containerStyle === 'none') return null;
    const structureId = options.id || `STRUCT-${this.structureSerial++}`;
    if (this.structures.has(structureId)) {
      this.removeContainerStructure(structureId, false);
    }

    const node = buildPlaceableContainerStructure(containerStyle, structureId);
    const baseB = this.getBoxBounds();
    const floorY = baseB.minY + 1.8;

    const count = this.structures.size;
    const defaultSlots = [
      { x: -18, y: floorY, z: -15 },
      { x: 18, y: floorY, z: -15 },
      { x: 0, y: floorY, z: -14 },
      { x: -32, y: floorY, z: -16 },
      { x: 32, y: floorY, z: -16 },
    ];
    const slot = defaultSlots[count % defaultSlots.length];
    const startZ = options.z ?? slot.z;
    const scale = this.computeMacroTargetScale(startZ, 0.76);
    const bz = this.getBoxBoundsAtZ(startZ, scale);
    const startX = Math.max(bz.minX, Math.min(bz.maxX, options.x ?? slot.x));
    const rawY = options.y ?? slot.y;
    const supportY = this.getSupportSurfaceY(startX, rawY + 4, startZ, scale, 0);

    node.position.set(startX, supportY, startZ);
    node.scale.setScalar(scale);
    this.scene.add(node);

    const structEntry = {
      id: structureId,
      containerStyle,
      label: node.userData.label || '收纳建筑',
      fullLabel: node.userData.fullLabel || containerStyle,
      node,
      pos: new THREE.Vector3(startX, supportY, startZ),
      scale,
      occupiedByPetId: null,
    };
    this.structures.set(structureId, structEntry);

    if (options.playSound !== false) {
      soundEngine.playContainerSnap(startX / Math.max(1, bz.maxX));
    }
    this.wakeRender(2.0, true);
    this.onStructuresUpdate(this.getPlacedStructuresList());
    this.onPetStateUpdate(this.getSummonedList());
    return structEntry;
  }

  removeContainerStructure(structureId, playSound = true) {
    const struct = this.structures.get(structureId);
    if (!struct) return;
    if (struct.occupiedByPetId && this.pets.has(struct.occupiedByPetId)) {
      this.unsnapHeadFromStructure(this.pets.get(struct.occupiedByPetId));
    }
    this.scene.remove(struct.node);
    this.structures.delete(structureId);
    if (playSound) soundEngine.playSummon(false);
    this.wakeRender(1.6, true);
    this.onStructuresUpdate(this.getPlacedStructuresList());
    this.onPetStateUpdate(this.getSummonedList());
  }

  clearAllContainerStructures() {
    for (const id of Array.from(this.structures.keys())) {
      this.removeContainerStructure(id, false);
    }
    soundEngine.playSummon(false);
    this.wakeRender(1.6, true);
  }

  snapHeadIntoStructure(pet, struct, playSound = true) {
    if (!pet || !struct) return;
    if (pet.snappedStructureId && pet.snappedStructureId !== struct.id) {
      this.unsnapHeadFromStructure(pet);
    }
    if (struct.occupiedByPetId && struct.occupiedByPetId !== pet.id && this.pets.has(struct.occupiedByPetId)) {
      this.unsnapHeadFromStructure(this.pets.get(struct.occupiedByPetId));
    }

    pet.snappedStructureId = struct.id;
    struct.occupiedByPetId = pet.id;
    struct.node.userData.occupiedByPetId = pet.id;

    const socketLocalY = struct.node.userData.headSocketLocalY ?? 13.5;
    pet.pos.x = struct.pos.x;
    pet.pos.z = struct.pos.z;
    pet.targetScale = struct.scale;
    pet.pos.y = struct.pos.y + socketLocalY * struct.scale;
    pet.vel.set(0, 0, 0);
    pet.dropDistance = 0;
    pet.isGrounded = true;

    updateContainerStructureState(struct.node, true);
    if (playSound) {
      const bz = this.getBoxBoundsAtZ(pet.pos.z, pet.targetScale);
      soundEngine.playContainerSnap(pet.pos.x / Math.max(1, bz.maxX));
    }
    this.wakeRender(1.8, true);
    this.onStructuresUpdate(this.getPlacedStructuresList());
    this.onPetStateUpdate(this.getSummonedList());
  }

  unsnapHeadFromStructure(pet) {
    if (!pet || !pet.snappedStructureId) return;
    const struct = this.structures.get(pet.snappedStructureId);
    pet.snappedStructureId = null;
    if (struct) {
      struct.occupiedByPetId = null;
      struct.node.userData.occupiedByPetId = null;
      updateContainerStructureState(struct.node, false);
    }
    this.onStructuresUpdate(this.getPlacedStructuresList());
  }

  findNearestAvailableStructure(pos, maxDist = 14.5) {
    let best = null;
    let bestDist = maxDist;
    for (const struct of this.structures.values()) {
      if (struct.occupiedByPetId) continue;
      const socketY = struct.pos.y + (struct.node.userData.headSocketLocalY ?? 13.5) * struct.scale;
      const dx = pos.x - struct.pos.x;
      const dy = (pos.y - socketY) * 0.65;
      const dz = (pos.z - struct.pos.z) * 0.75;
      const d = Math.hypot(dx, dy, dz);
      if (d < bestDist) {
        bestDist = d;
        best = struct;
      }
    }
    return best;
  }

  getPlacedStructuresList() {
    return Array.from(this.structures.values()).map((s) => {
      const occPet = s.occupiedByPetId ? this.pets.get(s.occupiedByPetId) : null;
      return {
        id: s.id,
        containerStyle: s.containerStyle,
        label: s.label,
        fullLabel: s.fullLabel,
        occupiedByPetId: s.occupiedByPetId,
        occupiedByName: occPet ? occPet.collectible.name : null,
        x: Math.round(s.pos.x),
        y: Math.round(s.pos.y),
        zMm: Math.round(s.pos.z * 10),
      };
    });
  }

  updateSettings(newPartial = {}) {
    Object.assign(this.settings, newPartial);
    this.updateCameraProjection();
    this.initBoxWireframe();
    for (const struct of this.structures.values()) {
      const bz = this.getBoxBoundsAtZ(struct.pos.z, struct.scale);
      struct.pos.z = Math.max(bz.minZ + 4, Math.min(bz.maxZ - 2, struct.pos.z));
      struct.pos.x = Math.max(bz.minX, Math.min(bz.maxX, struct.pos.x));
      struct.pos.y = this.getSupportSurfaceY(struct.pos.x, struct.pos.y + 4, struct.pos.z, struct.scale, 0);
      struct.node.position.copy(struct.pos);
    }
    for (const pet of this.pets.values()) {
      const bz = this.getBoxBoundsAtZ(pet.pos.z, pet.targetScale);
      pet.pos.z = Math.max(bz.minZ + 4, Math.min(bz.maxZ - 2, pet.pos.z));
      pet.pos.x = Math.max(bz.minX, Math.min(bz.maxX, pet.pos.x));
      pet.pos.y = Math.max(bz.minY, Math.min(bz.maxY, pet.pos.y));
    }
    this.wakeRender(1.8, true);
  }

  applyVisualCustomConfig(cfg = {}) {
    this.visualConfig = { ...this.visualConfig, ...cfg };
    applyCustomVisualConfigToEngine(this, this.visualConfig);
  }

  async summonCollectible(collectible) {
    if (this.pets.has(collectible.id)) {
      this.recallCollectible(collectible.id, false);
    }

    // Stage 27: Character head is 100% pure severed head ("只有头"), NEVER bound to a container mesh!
    const headNode = await buildCollectibleHeadNode({
      ...collectible,
      containerStyle: 'none',
      decorStyle: 'none',
      groomLod: 'desktop',
      groomSoftware: this.softwareRenderer,
    });
    if (this.visualConfig) {
      applyCustomVisualConfigToEngine(this, this.visualConfig);
    }

    const baseB = this.getBoxBounds();
    const rawZCm = (collectible.boxPosition?.z ?? -160) / 10;
    const startZ = Math.max(baseB.minZ + 6, Math.min(baseB.maxZ - 2, rawZCm));
    const baseScale = 0.76;
    const targetScale = this.computeMacroTargetScale(startZ, baseScale);
    const bz = this.getBoxBoundsAtZ(startZ, targetScale);

    const startX = Math.max(bz.minX, Math.min(bz.maxX, collectible.boxPosition?.x ?? 0));
    const baseBottomOffset = headNode.userData.baseBottomOffset ?? -10.8;
    let startY = Math.max(bz.minY, Math.min(bz.maxY, collectible.boxPosition?.y ?? 2));

    if (this.settings.enableGravity) {
      const supportY = this.getSupportSurfaceY(startX, startY + 8, startZ, targetScale, baseBottomOffset);
      startY = supportY - baseBottomOffset * targetScale;
    }

    headNode.position.set(startX, startY, startZ);
    headNode.rotation.set(this.settings.enableGravity ? -0.04 : -0.18, 0, 0);
    headNode.scale.setScalar(0.01);
    this.scene.add(headNode);

    const entry = {
      id: collectible.id,
      collectible,
      node: headNode,
      pos: new THREE.Vector3(startX, startY, startZ),
      vel: new THREE.Vector3(0, 0, 0),
      baseScale,
      targetScale,
      currentScale: 0.01,
      isRotationMode: false,
      isGrounded: Boolean(this.settings.enableGravity),
      snappedStructureId: null,
      customRot: new THREE.Euler(this.settings.enableGravity ? -0.04 : -0.18, 0, 0),
      currentRot: new THREE.Euler(this.settings.enableGravity ? -0.04 : -0.18, 0, 0),
      radius: 8.8,
      phase: Math.random() * Math.PI * 2
    };

    this.pets.set(collectible.id, entry);

    // If summoned close to an empty placed Container Structure, automatically snap into it!
    const nearStruct = this.findNearestAvailableStructure(entry.pos, 12.0);
    if (nearStruct) {
      this.snapHeadIntoStructure(entry, nearStruct, false);
    }

    soundEngine.playSummon(true);
    this.wakeRender(2.4, true);
    this.onPetStateUpdate(this.getSummonedList());
    return entry;
  }

  recallCollectible(id, playSound = true) {
    const entry = this.pets.get(id);
    if (!entry) return;
    if (entry.snappedStructureId) {
      this.unsnapHeadFromStructure(entry);
    }
    entry.node.userData.hairRequestSerial = (entry.node.userData.hairRequestSerial || 0) + 1;
    disposeHeadNode(entry.node);
    this.pets.delete(id);
    if (this.hoveredPetId === id) {
      this.hoveredPetId = null;
      this.onHoverChange(null);
    }
    if (playSound) soundEngine.playSummon(false);
    this.wakeRender(1.4, true);
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
      pet.customRot.set(this.settings.enableGravity ? -0.04 : -0.18, 0, 0);
    }
    triggerCollectibleBlink(pet.node);
    const bz = this.getBoxBoundsAtZ(pet.pos.z, pet.targetScale);
    const panX = pet.pos.x / Math.max(1, bz.maxX);
    soundEngine.playRotationModeToggle(pet.isRotationMode, panX);
    this.wakeRender(1.8, true);
    this.onPetStateUpdate(this.getSummonedList());
    this.refreshHoverHUD();
  }

  resetPetOrientation(id) {
    const pet = this.pets.get(id);
    if (!pet) return;
    pet.customRot.set(this.settings.enableGravity ? -0.04 : -0.18, 0, 0);
    this.wakeRender(1.5, true);
  }

  setPetExpression(id, exprId) {
    const pet = this.pets.get(id);
    if (!pet || !pet.node) return;
    pet.collectible.deadExpression = exprId;
    pet.collectible.morphs = { ...(pet.collectible.morphs || {}), deadExpression: exprId };
    applyHeadMorphsToGroup(pet.node, { deadExpression: exprId });
    soundEngine.playPickup(0);
    this.wakeRender(1.6, true);
    this.onPetStateUpdate(this.getSummonedList());
    this.refreshHoverHUD();
  }

  /**
   * Stage 27: Container structures are NOT bound to heads!
   * Calling `setPetContainerStyle(id, style)` either removes the head from its container (`style === 'none'`)
   * or places/replaces an independent 3D Container Structure at the head's position and snaps the head into it.
   */
  setPetContainerStyle(id, containerStyle) {
    const pet = this.pets.get(id);
    if (!pet || !pet.node) return;
    if (!containerStyle || containerStyle === 'none') {
      if (pet.snappedStructureId) {
        const oldStructId = pet.snappedStructureId;
        this.unsnapHeadFromStructure(pet);
        this.removeContainerStructure(oldStructId, false);
      }
      soundEngine.playPickup(0);
      this.wakeRender(1.8, true);
      this.onPetStateUpdate(this.getSummonedList());
      return;
    }

    if (pet.snappedStructureId) {
      const oldStructId = pet.snappedStructureId;
      this.unsnapHeadFromStructure(pet);
      this.removeContainerStructure(oldStructId, false);
    }
    const baseOff = pet.node.userData.baseBottomOffset ?? -10.8;
    const supportY = this.getSupportSurfaceY(pet.pos.x, pet.pos.y, pet.pos.z, pet.targetScale, baseOff);
    const struct = this.placeContainerStructure(containerStyle, {
      x: pet.pos.x,
      y: supportY,
      z: pet.pos.z,
      playSound: false,
    });
    if (struct) {
      this.snapHeadIntoStructure(pet, struct, true);
    }
  }

  setAllPetsContainerStyle(containerStyle) {
    this.settings.defaultContainerStyle = containerStyle;
    if (!containerStyle || containerStyle === 'none') {
      this.clearAllContainerStructures();
      return;
    }
    this.placeContainerStructure(containerStyle);
  }

  setAllPetsDecorStyle(decorStyle) {
    this.settings.defaultDecorStyle = decorStyle;
    // Stage 24: Decorative props live on the 3D Stage Floor & Shelves (NOT bound to character heads!)
    this.initBoxWireframe();
    soundEngine.playPickup(0);
    this.wakeRender(1.8, true);
    this.onPetStateUpdate(this.getSummonedList());
  }

  /**
   * Stage 23/24 · One-Click Screen-Space Placement Formations
   * (`study_sides` / `study_companion_sides`, `bottom_row` / `desk_row`, `altar_pyramid`, `macro_focus` / `macro_center`)
   */
  applyPlacementFormation(formationId = 'study_sides') {
    const petList = Array.from(this.pets.values());
    if (petList.length === 0) return;

    const normId = formationId === 'study_companion_sides' ? 'study_sides'
      : formationId === 'desk_row' ? 'bottom_row'
      : formationId === 'macro_center' ? 'macro_focus'
      : formationId;

    if (normId === 'study_sides') {
      this.updateSettings({ shelfLayout: 'study_side_rack' });
    } else if (normId === 'bottom_row') {
      this.updateSettings({ shelfLayout: 'bottom_gallery' });
    } else if (normId === 'altar_pyramid') {
      this.updateSettings({ shelfLayout: 'stepped_altar' });
    }

    const baseB = this.getBoxBounds();
    const floorY = baseB.minY + 1.8;
    const boxW = baseB.maxX - baseB.minX;
    const boxH = baseB.maxY - baseB.minY;

    petList.forEach((pet, idx) => {
      const baseOff = pet.node.userData.baseBottomOffset ?? -15.4;
      let tx = 0;
      let tz = -18;
      let surfY = floorY;

      if (normId === 'study_sides') {
        const shelfW = Math.max(22, boxW * 0.26);
        const leftX = baseB.minX + shelfW * 0.52;
        const rightX = baseB.maxX - shelfW * 0.52;
        const midY = floorY + boxH * 0.34;
        const highY = floorY + boxH * 0.64;
        const slots = [
          { x: leftX, y: midY, z: -18 },
          { x: rightX, y: midY, z: -18 },
          { x: leftX, y: floorY, z: -14 },
          { x: rightX, y: floorY, z: -14 },
          { x: leftX, y: highY, z: -24 },
          { x: rightX, y: highY, z: -24 },
        ];
        const s = slots[idx % slots.length];
        tx = s.x;
        tz = s.z;
        surfY = s.y;
      } else if (normId === 'bottom_row') {
        const count = petList.length;
        const span = Math.min(boxW * 0.76, count * 24);
        tx = count === 1 ? 0 : -span * 0.5 + (idx / (count - 1)) * span;
        tz = -16;
        surfY = floorY;
      } else if (normId === 'altar_pyramid') {
        const centerY = floorY + boxH * 0.30;
        const sideY = floorY + boxH * 0.16;
        const slots = [
          { x: 0, y: centerY, z: -22 },
          { x: -boxW * 0.28, y: sideY, z: -16 },
          { x: boxW * 0.28, y: sideY, z: -16 },
          { x: -boxW * 0.44, y: floorY, z: -12 },
          { x: boxW * 0.44, y: floorY, z: -12 },
        ];
        const s = slots[idx % slots.length];
        tx = s.x;
        tz = s.z;
        surfY = s.y;
      } else if (normId === 'macro_focus') {
        if (idx === 0) {
          tx = 0;
          tz = 48; // Close-up macro inspection in center!
          surfY = floorY + 6;
        } else {
          const side = idx % 2 === 1 ? -1 : 1;
          tx = side * (boxW * 0.36);
          tz = -22;
          surfY = floorY + (idx > 2 ? boxH * 0.34 : 0);
        }
      }

      pet.pos.z = tz;
      pet.targetScale = this.computeMacroTargetScale(tz, pet.baseScale || 0.76);
      pet.pos.x = tx;
      if (pet.snappedStructureId && this.structures.has(pet.snappedStructureId)) {
        const struct = this.structures.get(pet.snappedStructureId);
        struct.pos.set(tx, surfY, tz);
        struct.scale = pet.targetScale;
        struct.node.position.copy(struct.pos);
        struct.node.scale.setScalar(struct.scale);
        const socketLocalY = struct.node.userData.headSocketLocalY ?? 13.5;
        pet.pos.y = struct.pos.y + socketLocalY * struct.scale;
      } else {
        pet.pos.y = surfY - baseOff * pet.targetScale;
      }
      pet.vel.set(0, 0, 0);
      pet.dropDistance = 0;
      pet.isGrounded = true;
    });

    soundEngine.playSummon(true);
    this.wakeRender(2.4, true);
    this.onStructuresUpdate(this.getPlacedStructuresList());
    this.onPetStateUpdate(this.getSummonedList());
  }

  async setPetHairStyle(id, hairStyle) {
    const pet = this.pets.get(id);
    if (!pet || !pet.node) return;
    pet.collectible.hairStyle = hairStyle;
    await attachRealHairModel(pet.node, { ...pet.collectible, groomLod: 'desktop', groomSoftware: this.softwareRenderer });
    soundEngine.playPickup(0);
    this.wakeRender(1.8, true);
    this.onPetStateUpdate(this.getSummonedList());
  }

  getSummonedList() {
    return Array.from(this.pets.values()).map(p => {
      const snappedStruct = p.snappedStructureId ? this.structures.get(p.snappedStructureId) : null;
      return {
        id: p.id,
        name: p.collectible.name,
        deadExpression: p.collectible.deadExpression || p.collectible.morphs?.deadExpression || 'dead_calm',
        hairStyle: p.collectible.hairStyle || 'hair_user_photo',
        containerStyle: snappedStruct ? snappedStruct.containerStyle : 'none',
        snappedStructureId: p.snappedStructureId || null,
        studyRole: p.collectible.studyRole || 'survivor_motivator',
        isRotationMode: p.isRotationMode,
        x: Math.round(p.pos.x),
        y: Math.round(p.pos.y),
        zMm: Math.round(p.pos.z * 10)
      };
    });
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

  pickStructureAtCursor() {
    if (this.structures.size === 0) return null;
    this.raycaster.setFromCamera(this.mouseNDC, this.camera);
    const roots = [];
    for (const s of this.structures.values()) {
      roots.push(s.node);
    }
    const hits = this.raycaster.intersectObjects(roots, true);
    if (hits.length === 0) return null;

    let obj = hits[0].object;
    while (obj) {
      for (const s of this.structures.values()) {
        if (s.node === obj) return { struct: s, hitPoint: hits[0].point };
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
    const snappedStruct = pet.snappedStructureId ? this.structures.get(pet.snappedStructureId) : null;
    this.onHoverChange({
      id: pet.id,
      collectible: pet.collectible,
      snappedStructure: snappedStruct || null,
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
    if (document.body.classList.contains('real-desktop-manager')) return true;
    const target = e.target;
    if (!target || !(target instanceof Element)) return false;
    if (target.closest('#start-game-overlay, #studio-preview-canvas, #desktop-overlay-bar, #screen-pets-strip, #visual-customizer-drawer, #study-triumph-hud')) {
      return true;
    }
    if (target.closest('button, input, select, textarea, label, a, #window-titlebar, .nav-tab, .os-icon, .archive-folder-item')) {
      return true;
    }
    if (!this.settings.petsAlwaysOnTop && target.closest('#software-window')) {
      return true;
    }
    return false;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.resize());

    window.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.updateMouseCoords(e);
      if (this.isBlockedByUI(e)) return;

      const hitPet = this.pickPetAtCursor();
      const hitStructInfo = this.pickStructureAtCursor();

      // If clicking on the pedestal base of an occupied container structure (or on any empty container structure),
      // drag the Container Structure itself! If clicking on the Severed Head, drag the pure Severed Head (lifting it out)!
      let dragStructure = null;
      if (hitStructInfo) {
        const s = hitStructInfo.struct;
        const clickNearPedestal = hitStructInfo.hitPoint.y <= s.pos.y + 4.2 * s.scale;
        if (!hitPet || !s.occupiedByPetId || clickNearPedestal) {
          dragStructure = s;
        }
      }

      if (dragStructure) {
        e.stopPropagation();
        this.interactionHighlightTimer = 1.5;
        this.wakeRender(2.0, true);
        const hitWorld = this.getMouseWorldAtZ(dragStructure.pos.z);
        this.pointerDownInfo = {
          structure: dragStructure,
          pet: null,
          startX: e.clientX,
          startY: e.clientY,
          lastX: e.clientX,
          lastY: e.clientY,
          movedDist: 0,
          grabOffset: new THREE.Vector3().subVectors(dragStructure.pos, hitWorld),
          pickupSoundPlayed: false
        };
        return;
      }

      if (!hitPet) return;

      e.stopPropagation();
      this.interactionHighlightTimer = 1.5;
      this.wakeRender(2.0, true);
      triggerCollectibleBlink(hitPet.node);

      const hitWorld = this.getMouseWorldAtZ(hitPet.pos.z);
      this.pointerDownInfo = {
        pet: hitPet,
        structure: null,
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
        const dx = e.clientX - info.lastX;
        const dy = e.clientY - info.lastY;
        info.lastX = e.clientX;
        info.lastY = e.clientY;
        info.movedDist += Math.hypot(dx, dy);
        this.interactionHighlightTimer = 1.2;
        this.wakeRender(1.6, true);

        // Case A: Dragging an Independent 3D Container Structure (`可放置的头颅收纳建筑`)
        if (info.structure) {
          if (info.movedDist > 4) {
            const struct = info.structure;
            const bz = this.getBoxBoundsAtZ(struct.pos.z, struct.scale);
            if (!info.pickupSoundPlayed) {
              info.pickupSoundPlayed = true;
              soundEngine.playPickup(struct.pos.x / Math.max(1, bz.maxX));
            }
            const worldTarget = this.getMouseWorldAtZ(struct.pos.z).add(info.grabOffset);
            const clampedX = Math.max(bz.minX, Math.min(bz.maxX, worldTarget.x));
            const clampedY = Math.max(bz.minY, Math.min(bz.maxY, worldTarget.y));
            const supportY = this.settings.enableGravity
              ? this.getSupportSurfaceY(clampedX, clampedY + 4, struct.pos.z, struct.scale, 0)
              : clampedY;

            struct.pos.x = clampedX;
            struct.pos.y = supportY;
            struct.node.position.copy(struct.pos);

            // If a severed head is stored inside this structure, carry it along!
            if (struct.occupiedByPetId && this.pets.has(struct.occupiedByPetId)) {
              const occPet = this.pets.get(struct.occupiedByPetId);
              const socketLocalY = struct.node.userData.headSocketLocalY ?? 13.5;
              occPet.pos.x = struct.pos.x;
              occPet.pos.z = struct.pos.z;
              occPet.pos.y = struct.pos.y + socketLocalY * struct.scale;
              occPet.node.position.copy(occPet.pos);
            }
            this.needsShadowRefresh = true;
          }
          return;
        }

        // Case B: Dragging or Rotating a Severed Head (`只有头`)
        const pet = info.pet;
        if (info.movedDist > 5) {
          const bz = this.getBoxBoundsAtZ(pet.pos.z, pet.targetScale);
          if (pet.isRotationMode) {
            pet.customRot.y += dx * 0.013;
            pet.customRot.x = Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.48, pet.customRot.x + dy * 0.013));
            const speedNorm = Math.min(1, Math.hypot(dx, dy) / 28);
            soundEngine.updateDragWhoosh(speedNorm * 0.55, pet.pos.x / Math.max(1, bz.maxX));
          } else {
            if (!info.pickupSoundPlayed) {
              info.pickupSoundPlayed = true;
              // Lift the pure severed head right out of its container structure if it was inside one!
              if (pet.snappedStructureId) {
                this.unsnapHeadFromStructure(pet);
              }
              soundEngine.playPickup(pet.pos.x / Math.max(1, bz.maxX));
            }
            const worldTarget = this.getMouseWorldAtZ(pet.pos.z).add(info.grabOffset);
            const clampedX = Math.max(bz.minX, Math.min(bz.maxX, worldTarget.x));
            const clampedY = Math.max(bz.minY, Math.min(bz.maxY, worldTarget.y));
            pet.vel.set(
              (clampedX - pet.pos.x) * 0.48,
              (clampedY - pet.pos.y) * 0.48,
              0
            );
            pet.pos.x = clampedX;
            pet.pos.y = clampedY;

            const speedNorm = Math.min(1, Math.hypot(dx, dy) / 34);
            soundEngine.updateDragWhoosh(speedNorm, pet.pos.x / Math.max(1, bz.maxX));
          }
          this.refreshHoverHUD();
        }
        return;
      }

      if (this.settings.followIntensity > 0.01 && this.pets.size > 0) {
        this.wakeRender(0.6);
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
      const hitStruct = !hitPet ? this.pickStructureAtCursor() : null;
      const newId = hitPet ? hitPet.id : null;
      if (newId !== this.hoveredPetId) {
        this.hoveredPetId = newId;
        this.wakeRender(0.8);
      }
      document.body.style.cursor = hitPet
        ? (hitPet.isRotationMode ? 'grab' : 'pointer')
        : (hitStruct ? 'move' : '');
      if (this.hoveredPetId) {
        this.refreshHoverHUD();
      } else {
        this.onHoverChange(null);
      }
    });

    window.addEventListener('pointerup', () => {
      if (!this.pointerDownInfo) return;
      const info = this.pointerDownInfo;
      this.pointerDownInfo = null;

      soundEngine.stopDragWhoosh();
      this.wakeRender(1.8, true);

      if (info.structure) {
        const struct = info.structure;
        const bz = this.getBoxBoundsAtZ(struct.pos.z, struct.scale);
        // If this empty container structure was dropped onto a free severed head, snap that head into it!
        if (!struct.occupiedByPetId) {
          for (const p of this.pets.values()) {
            if (!p.snappedStructureId && Math.hypot(p.pos.x - struct.pos.x, p.pos.z - struct.pos.z) < 13.5) {
              this.snapHeadIntoStructure(p, struct, true);
              break;
            }
          }
        }
        soundEngine.playRelease(struct.pos.x / Math.max(1, bz.maxX));
        this.onStructuresUpdate(this.getPlacedStructuresList());
        this.onPetStateUpdate(this.getSummonedList());
        return;
      }

      const pet = info.pet;
      if (!pet) return;

      if (info.movedDist <= 5) {
        this.toggleRotationMode(pet.id);
      } else if (info.pickupSoundPlayed) {
        // Check if the severed head was dropped near an unoccupied placed Container Structure!
        const targetStruct = this.findNearestAvailableStructure(pet.pos, 14.8);
        if (targetStruct) {
          this.snapHeadIntoStructure(pet, targetStruct, true);
        } else {
          const bz = this.getBoxBoundsAtZ(pet.pos.z, pet.targetScale);
          soundEngine.playRelease(pet.pos.x / Math.max(1, bz.maxX));
          this.onPetStateUpdate(this.getSummonedList());
        }
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
      this.wakeRender(1.8, true);

      const baseB = this.getBoxBounds();
      // Stage 22 Macro Close-Up Wheel Step: smooth, generous step up to Z = +76 cm (39 cm from camera!)
      const mag = Math.min(13.5, Math.max(6.2, Math.abs(e.deltaY) * 0.075));
      const stepCm = (e.deltaY > 0 ? -mag : mag) * this.settings.wheelDepthStep;
      const nextZ = hitPet.pos.z + stepCm;
      const bz = this.getBoxBoundsAtZ(nextZ, hitPet.targetScale);
      const panX = hitPet.pos.x / Math.max(1, bz.maxX);

      if (nextZ < baseB.minZ + 4) {
        hitPet.pos.z = baseB.minZ + 4;
        hitPet.vel.z = 1.2;
        soundEngine.playBoxWallCollision(0.75, 'back_wall', panX);
        this.onBoxCollisionVisual('back');
      } else if (nextZ > baseB.maxZ - 2) {
        hitPet.pos.z = baseB.maxZ - 2;
        hitPet.vel.z = -1.2;
        soundEngine.playBoxWallCollision(0.85, 'front_glass', panX);
        this.onBoxCollisionVisual('front');
      } else {
        hitPet.pos.z = nextZ;
        const totalRange = Math.max(1, baseB.maxZ - baseB.minZ);
        const depthRatio = (baseB.maxZ - hitPet.pos.z) / totalRange;
        soundEngine.playDepthTick(depthRatio, panX);
      }

      // Update macro close-up scale boost and clamp X/Y smoothly to the new depth's screen frustum
      hitPet.targetScale = this.computeMacroTargetScale(hitPet.pos.z, hitPet.baseScale || 0.76);
      const newBounds = this.getBoxBoundsAtZ(hitPet.pos.z, hitPet.targetScale);
      hitPet.pos.x = Math.max(newBounds.minX, Math.min(newBounds.maxX, hitPet.pos.x));
      hitPet.pos.y = Math.max(newBounds.minY, Math.min(newBounds.maxY, hitPet.pos.y));

      // If the head is stored inside a Container Structure, move/scale the Container Structure along with it!
      if (hitPet.snappedStructureId && this.structures.has(hitPet.snappedStructureId)) {
        const struct = this.structures.get(hitPet.snappedStructureId);
        struct.pos.z = hitPet.pos.z;
        struct.pos.x = hitPet.pos.x;
        struct.scale = hitPet.targetScale;
        struct.pos.y = this.getSupportSurfaceY(struct.pos.x, struct.pos.y + 4, struct.pos.z, struct.scale, 0);
        struct.node.position.copy(struct.pos);
        struct.node.scale.setScalar(struct.scale);
        const socketLocalY = struct.node.userData.headSocketLocalY ?? 13.5;
        hitPet.pos.y = struct.pos.y + socketLocalY * struct.scale;
      }

      this.refreshHoverHUD();
      this.onStructuresUpdate(this.getPlacedStructuresList());
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
    this.wakeRender(1.5, true);
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
    this.wakeRender(1.5, true);
  }

  /** Stage 13a：用户可随时开关辉光后期（设置页持久化） */
  setBeautyPostEnabled(v) {
    this.beautyPostUserEnabled = v !== false;
    if (this.beautyPost) {
      const lvl = this.currentRenderQuality || 'high';
      this.beautyPost.setEnabled(lvl !== 'low' && this.beautyPostUserEnabled);
    }
    this.wakeRender(1.2);
  }

  /** Stage 13b：用户可随时开关氛围尘埃（设置页持久化） */
  setAtmosphereEnabled(v) {
    if (this.atmosphere) this.atmosphere.group.visible = v !== false;
    this.wakeRender(1.2);
  }

  animate() {
    this.animFrameId = requestAnimationFrame(this.animate);

    if (document.hidden) {
      this.lastFrameTime = performance.now();
      return;
    }

    const now = performance.now();
    const elapsedMs = now - this.lastFrameTime;
    // Stage 22 Zero-Fan-Roar Fix: cap desktop engine at ~60 FPS (15.5 ms) so high-refresh monitors never cause GPU fan roar
    if (elapsedMs < 15.5) return;
    const dt = Math.min(0.05, elapsedMs / 1000);
    this.lastFrameTime = now;

    const petArray = Array.from(this.pets.values());
    let anyActiveAnimation = this.interactionHighlightTimer > 0.001 || Boolean(this.pointerDownInfo);

    if (!anyActiveAnimation && now > this.renderWakeUntil) {
      for (const pet of petArray) {
        const velSq = pet.vel.lengthSq();
        const scaleDiff = Math.abs(pet.targetScale - pet.currentScale);
        let ungrounded = false;
        if (this.settings.enableGravity) {
          let targetRestY;
          if (pet.snappedStructureId && this.structures.has(pet.snappedStructureId)) {
            const struct = this.structures.get(pet.snappedStructureId);
            targetRestY = struct.pos.y + (struct.node.userData.headSocketLocalY ?? 13.5) * struct.scale;
          } else {
            const baseOff = pet.node.userData.baseBottomOffset ?? -10.8;
            const supportY = this.getSupportSurfaceY(pet.pos.x, pet.pos.y, pet.pos.z, pet.targetScale, baseOff);
            targetRestY = supportY - baseOff * pet.targetScale;
          }
          if (Math.abs(pet.pos.y - targetRestY) > 0.16) {
            ungrounded = true;
          }
        }
        if (velSq > 0.0004 || scaleDiff > 0.0008 || pet.isRotationMode || ungrounded) {
          anyActiveAnimation = true;
          break;
        }
      }
    }

    // Zero-Fan-Roar Smart Idle Sleep: when all desktop pets are stationary and wake timer has elapsed -> 0% GPU!
    if (!anyActiveAnimation && now > this.renderWakeUntil) {
      return;
    }

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
    const baseB = this.getBoxBounds();

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

    if (this.settings.enablePetCollision && petArray.length > 1) {
      for (let i = 0; i < petArray.length; i++) {
        for (let j = i + 1; j < petArray.length; j++) {
          const p1 = petArray[i];
          const p2 = petArray[j];
          const diff = new THREE.Vector3().subVectors(p1.pos, p2.pos);
          if (this.settings.enableGravity && p1.isGrounded && p2.isGrounded) {
            diff.y = 0; // Grounded pets push horizontally along the desk surface, never lifting each other into the air
          }
          const dist = diff.length();
          const minDist = (p1.radius * p1.currentScale + p2.radius * p2.currentScale) * 1.10;
          if (dist < minDist && dist > 0.001) {
            const overlap = (minDist - dist) * 0.5;
            diff.normalize();
            p1.pos.addScaledVector(diff, overlap);
            p2.pos.addScaledVector(diff, -overlap);

            const relSpeed = p1.vel.distanceTo(p2.vel);
            p1.vel.addScaledVector(diff, 0.35);
            p2.vel.addScaledVector(diff, -0.35);
            this.needsShadowRefresh = true;
            if (relSpeed > 1.35 && now - (this.lastPetCollideSoundAt || 0) > 450) {
              this.lastPetCollideSoundAt = now;
              soundEngine.playBoxWallCollision(Math.min(1, relSpeed * 0.35), 'pet', p1.pos.x / Math.max(1, baseB.maxX));
            }
          }
        }
      }
    }

    for (const pet of petArray) {
      const scaleDiff = pet.targetScale - pet.currentScale;
      if (Math.abs(scaleDiff) > 0.0004) {
        pet.currentScale += scaleDiff * 0.16;
        pet.node.scale.setScalar(pet.currentScale);
        this.needsShadowRefresh = true;
      }

      const isBeingDragged = this.pointerDownInfo && this.pointerDownInfo.pet === pet && this.pointerDownInfo.movedDist > 5 && !pet.isRotationMode;
      const bz = this.getBoxBoundsAtZ(pet.pos.z, pet.targetScale);
      const panX = pet.pos.x / Math.max(1, bz.maxX);

      if (isBeingDragged) {
        pet.isGrounded = false;
        pet.dropDistance = Math.max(pet.dropDistance || 0, 4.0);
      } else if (pet.snappedStructureId && this.structures.has(pet.snappedStructureId)) {
        const struct = this.structures.get(pet.snappedStructureId);
        const socketLocalY = struct.node.userData.headSocketLocalY ?? 13.5;
        pet.pos.x = struct.pos.x;
        pet.pos.z = struct.pos.z;
        pet.pos.y = struct.pos.y + socketLocalY * struct.scale;
        pet.vel.set(0, 0, 0);
        pet.dropDistance = 0;
        pet.isGrounded = true;
      } else {
        if (this.settings.enableGravity) {
          const baseOff = pet.node.userData.baseBottomOffset ?? -10.8;
          const supportY = this.getSupportSurfaceY(pet.pos.x, pet.pos.y, pet.pos.z, pet.targetScale, baseOff);
          const targetRestY = supportY - baseOff * pet.targetScale;

          if (pet.pos.y > targetRestY + 0.12) {
            // Stage 24 Strong, Crisp Gravity Acceleration (4.8 cm/frame², terminal velocity -22 cm/frame)
            pet.vel.y = Math.max(-22.0, pet.vel.y - 4.8 * (dt * 60));
            pet.dropDistance = (pet.dropDistance || 0) + Math.abs(pet.vel.y);
            pet.isGrounded = false;
            this.needsShadowRefresh = true;
          }

          pet.pos.add(pet.vel);
          pet.vel.x *= pet.isGrounded ? 0.72 : 0.88;
          pet.vel.z *= 0.82;

          if (pet.pos.y <= targetRestY + 0.12) {
            pet.pos.y = targetRestY;
            // Play landing sound ONLY ONCE when transitioning from a real drop (> 3.0 cm) to grounded, never in a loop!
            if (!pet.isGrounded && (pet.dropDistance || 0) > 3.0 && Math.abs(pet.vel.y) > 1.2) {
              if (now - (pet.lastLandSoundAt || 0) > 400) {
                pet.lastLandSoundAt = now;
                soundEngine.playBoxWallCollision(Math.min(1, Math.abs(pet.vel.y) * 0.18), 'side', panX);
                this.onBoxCollisionVisual('bottom');
              }
            }
            pet.vel.y = 0;
            pet.dropDistance = 0;
            pet.isGrounded = true;
            this.needsShadowRefresh = true;
          }
          if (pet.vel.lengthSq() < 0.0004 && pet.isGrounded) {
            pet.vel.set(0, 0, 0);
          }
        } else {
          if (pet.vel.lengthSq() > 0.0001) {
            pet.pos.add(pet.vel);
            pet.vel.multiplyScalar(0.88);
            this.needsShadowRefresh = true;
          } else {
            pet.vel.set(0, 0, 0);
          }
        }
      }

      if (pet.pos.x < bz.minX) {
        pet.pos.x = bz.minX;
        if (Math.abs(pet.vel.x) > 0.25) {
          soundEngine.playBoxWallCollision(Math.min(1, Math.abs(pet.vel.x) * 0.5), 'side', -0.9);
          this.onBoxCollisionVisual('left');
        }
        pet.vel.x = Math.abs(pet.vel.x) * 0.65;
      } else if (pet.pos.x > bz.maxX) {
        pet.pos.x = bz.maxX;
        if (Math.abs(pet.vel.x) > 0.25) {
          soundEngine.playBoxWallCollision(Math.min(1, Math.abs(pet.vel.x) * 0.5), 'side', 0.9);
          this.onBoxCollisionVisual('right');
        }
        pet.vel.x = -Math.abs(pet.vel.x) * 0.65;
      }

      if (!this.settings.enableGravity && pet.pos.y < bz.minY) {
        pet.pos.y = bz.minY;
        if (Math.abs(pet.vel.y) > 0.25) {
          soundEngine.playBoxWallCollision(Math.min(1, Math.abs(pet.vel.y) * 0.5), 'side', panX);
          this.onBoxCollisionVisual('bottom');
        }
        pet.vel.y = Math.abs(pet.vel.y) * 0.65;
      } else if (pet.pos.y > bz.maxY) {
        pet.pos.y = bz.maxY;
        if (Math.abs(pet.vel.y) > 0.25) {
          soundEngine.playBoxWallCollision(Math.min(1, Math.abs(pet.vel.y) * 0.5), 'side', panX);
          this.onBoxCollisionVisual('top');
        }
        pet.vel.y = -Math.abs(pet.vel.y) * 0.65;
      }

      if (pet.pos.z < bz.minZ + 4) {
        pet.pos.z = bz.minZ + 4;
        pet.vel.z = Math.abs(pet.vel.z) * 0.5;
      } else if (pet.pos.z > bz.maxZ - 2) {
        pet.pos.z = bz.maxZ - 2;
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
    if (this.stageGroup && this.settings.rainyWindowEnabled !== false) {
      updateRainyStudyBackdrop(this.stageGroup, dt);
    }

    if (this.needsShadowRefresh) {
      requestShadowUpdate(this.renderer);
      this.needsShadowRefresh = false;
    }

    if (this.beautyPost && this.beautyPost.enabled) {
      this.beautyPost.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
