import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  SCULPT_MAX_GESTURES, SCULPT_MAX_SEGMENTS, getBrushableHairMeshes,
  applyLiveSculptStroke, finalizeSculptStroke
} from './sculptStrokeLayer.js';
import { syncFaceAccessories } from './faceAccessories.js';
import {
  buildCollectibleHeadNode,
  applyHeadMorphsToGroup,
  updateCollectibleMaterialsLive,
  updateHeadLifeAnimation,
  triggerCollectibleBlink,
  disposeHeadNode,
  updateHairDesignOnGroup,
  updateMasterStrandHairPxScale
} from './collectibleHeadAssembler.js';
import {
  applyBaseRendererSettings,
  isSoftwareRenderer,
  ensureSceneEnvironment,
  buildStudioLightRig,
  applyRenderQualityToEngine,
  applyCustomVisualConfigToEngine,
  updateDynamicLightingOnEngine,
  requestShadowUpdate
} from './photorealLighting.js';
import { createBeautyPostChain } from './beautyPostChain.js';
import { createBokehDust, createStudioBackdrop } from './atmosphere.js';

export class StudioPreviewEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.headNode = null;
    this.autoRotate = false;
    this.currentConfig = null;
    this.clock = new THREE.Clock();
    this.pointerNdc = { x: 0, y: 0 };
    this.sculptTool = 'orbit';
    this.sculptProfiles = {
      face: { radius: 0.034, strength: 0.30 },
      hair: { radius: 0.042, strength: 0.55 }
    };
    this.sculptRadius = this.sculptProfiles.face.radius; // artist model local metres
    this.sculptStrength = this.sculptProfiles.face.strength;
    this.sculptSymmetric = true;
    this.sculptDrag = null;
    this.sculptSeriesSerial = 0;
    this.sculptRaycaster = new THREE.Raycaster();
    this.getSculptMorphs = null;
    this.onSculptCommit = null;
    this.onSculptStatus = null;

    this.lastFrameTime = performance.now();
    this.renderWakeUntil = performance.now() + 2500;
    // Software WebGL caps each frame at 220 ms, but wakes for only 160 ms.
    // Preserve one pending frame so a slider change never gets silently lost.
    this.pendingRender = true;
    this.needsShadowRefresh = true;

    this.initScene();
    this.bindPointerTracking();
    // A locally embedded GLB can finish loading after the idle renderer has
    // gone to sleep. Wake only when an accessory actually becomes ready.
    window.addEventListener('cervix3d:asset-ready', () => this.wakeRender(0.3, true));
    this.animate = this.animate.bind(this);
    this.animId = requestAnimationFrame(this.animate);
  }

  wakeRender(durationSeconds = 1.6, refreshShadow = false) {
    this.pendingRender = true;
    const dur = this.softwareRenderer ? Math.min(durationSeconds, 0.16) : durationSeconds;
    const until = performance.now() + dur * 1000;
    if (until > this.renderWakeUntil) {
      this.renderWakeUntil = until;
    }
    if (refreshShadow) {
      this.needsShadowRefresh = true;
    }
  }

  isCanvasVisible() {
    if (!this.canvas || document.hidden) return false;
    if (this.canvas.offsetParent === null) return false;
    return this.canvas.clientWidth > 4 && this.canvas.clientHeight > 4;
  }

  initScene() {
    this.scene = new THREE.Scene();

    const w = this.canvas.clientWidth || 540;
    const h = this.canvas.clientHeight || 480;
    this.camera = new THREE.PerspectiveCamera(32, w / h, 1, 300);
    this.camera.position.set(0, 1.0, 62);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'default',
      stencil: false,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.softwareRenderer = isSoftwareRenderer(this.renderer);
    if (this.softwareRenderer) {
      this.renderWakeUntil = performance.now() + 180;
    }
    this.renderer.localClippingEnabled = true;
    // Stage 39 强明暗发丝投影写实管线：ACES + sRGB + 10:1主补光比 + 落日逆光离线 IBL
    applyBaseRendererSettings(this.renderer, 0.88);
    ensureSceneEnvironment(this.renderer, this.scene, 0.16, 'golden_hour');

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, 1.0, 0.5);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    // Allow closer macro zoom (11 cm) for pore/iris/cross-section inspection
    this.controls.minDistance = 11;
    this.controls.maxDistance = 95;
    this.controls.update();
    this.controls.addEventListener('change', () => {
      this.wakeRender(1.2);
    });
    this.controls.addEventListener('start', () => {
      this.wakeRender(2.0);
    });

    // Stage 7 写实 5 点灯阵（主光带柔和阴影 + 底部解剖检查灯 + 背部轮廓光）
    this.lightRig = buildStudioLightRig(this.scene);
    this.keyLight = this.lightRig.key;

    // Stage 13a 电影级后期链（辉光 + 唯美调色；异常则回退直渲，永不黑屏）
    this.beautyPost = null;
    this.beautyPostUserEnabled = true;
    try {
      this.beautyPost = createBeautyPostChain(this.renderer, this.scene, this.camera, { width: w, height: h });
      this.beautyPost?.setEnabled(true);
    } catch (err) {
      console.warn('后期链初始化失败，已回退直渲:', err);
      this.beautyPost = null;
    }

    this.visualConfig = {
      presetId: 'cinema_85mm_portrait',
      hdrMode: 'golden_hour',
      windowGobo: 'hair_sun_slit',
      windowGoboStrength: 0.78,
      chiaroscuro: 0.94,
    };
    applyCustomVisualConfigToEngine(this, this.visualConfig);

    // Stage 13b 唯美氛围：背幕光晕 + 少量呼吸尘埃（加色混合，永不遮挡头模）
    this.atmosphere = null;
    this.backdropMesh = null;
    try {
      this.backdropMesh = createStudioBackdrop(150, 110);
      this.backdropMesh.position.set(0, -2, -34);
      this.scene.add(this.backdropMesh);
      this.atmosphere = createBokehDust({
        far: 50, mid: 32, near: 14,
        farSize: 0.9, midSize: 1.5, nearSize: 2.4,
        bounds: { x: [-24, 24], y: [-18, 14], z: [-30, 10] },
      });
      this.scene.add(this.atmosphere.group);
    } catch (err) {
      console.warn('氛围初始化失败，已跳过:', err);
      this.atmosphere = null;
      this.backdropMesh = null;
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

  setSculptTool(mode) {
    if (this.sculptDrag) this.finishSculptDrag();
    this.sculptTool = ['orbit', 'face', 'hair', 'glasses'].includes(mode) ? mode : 'orbit';
    this.controls.enabled = this.sculptTool === 'orbit';
    this.autoRotate = false;
    this.canvas.style.cursor = this.sculptTool === 'orbit' ? '' : 'crosshair';
    this.canvas.style.touchAction = this.sculptTool === 'orbit' ? '' : 'none';
    this.wakeRender(0.2);
  }

  sculptNdc(event) {
    const rect = this.canvas.getBoundingClientRect();
    return new THREE.Vector2(
      ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
      -((event.clientY - rect.top) / Math.max(rect.height, 1)) * 2 + 1
    );
  }

  // The GPU expands glossy fibers into ribbons, but their two CPU vertices
  // share a centerline position: Raycaster sees a zero-area triangle. On a
  // missed card ray, pick a nearby *real strand centerline* in screen space.
  pickStrandBrushStart(event, strandMesh) {
    const positions = strandMesh?.geometry?.attributes?.position;
    if (!positions || !strandMesh.visible) return null;
    const rect = this.canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const nx = (event.clientX - rect.left) / rect.width * 2 - 1;
    const ny = 1 - (event.clientY - rect.top) / rect.height * 2;
    strandMesh.updateMatrixWorld(true);
    const clip = new THREE.Matrix4().multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse)
      .multiply(strandMesh.matrixWorld).elements;
    const a = positions.array;
    let nearestIndex = -1, best = 14 * 14;
    // Four ribbon segments per sample; a click is accepted only within 14px.
    for (let i = 0; i < positions.count; i += 8) {
      const j = i * 3, x = a[j], y = a[j + 1], z = a[j + 2];
      const w = clip[3] * x + clip[7] * y + clip[11] * z + clip[15];
      if (w <= 0) continue;
      const px = (clip[0] * x + clip[4] * y + clip[8] * z + clip[12]) / w;
      const py = (clip[1] * x + clip[5] * y + clip[9] * z + clip[13]) / w;
      const dx = (px - nx) * rect.width * 0.5;
      const dy = (py - ny) * rect.height * 0.5;
      const d2 = dx * dx + dy * dy;
      if (d2 < best) { best = d2; nearestIndex = j; }
    }
    if (nearestIndex < 0) return null;
    return { object: strandMesh,
      point: new THREE.Vector3(a[nearestIndex], a[nearestIndex + 1], a[nearestIndex + 2])
        .applyMatrix4(strandMesh.matrixWorld) };
  }

  startGlassesDrag(event, morphs) {
    const style = morphs.glassesStyle || 'none';
    const frame = this.headNode.getObjectByName(`Glasses_${style}`);
    if (!frame || style === 'none') {
      this.onSculptStatus?.('请先在眼镜款式中选一副，再选择「直接拉眼镜」。');
      return;
    }
    this.headNode.updateMatrixWorld(true);
    this.sculptRaycaster.setFromCamera(this.sculptNdc(event), this.camera);
    const hit = this.sculptRaycaster.intersectObject(frame, true)[0];
    if (!hit) {
      this.onSculptStatus?.('请在镜框或镜片表面按住左键：左右拉框宽，上下拉框高。');
      return;
    }
    const local = frame.worldToLocal(hit.point.clone());
    const before = {
      width: Number(morphs.glassesWidth) || 1,
      height: Number(morphs.glassesHeight) || 1,
    };
    const gestures = morphs.sculptGestures ||= [];
    if (gestures.length >= SCULPT_MAX_GESTURES) gestures.shift();
    const gesture = { tool: 'glasses', glassesBefore: before, strokes: [] };
    gestures.push(gesture);
    this.sculptDrag = {
      tool: 'glasses', pointerId: event.pointerId, node: this.headNode,
      gesture, before, startX: event.clientX, startY: event.clientY,
      side: local.x < 0 ? -1 : 1, vertical: local.y < 0 ? -1 : 1,
    };
    this.canvas.setPointerCapture(event.pointerId);
    this.onSculptStatus?.('正在直接塑形眼镜网格：左右拖动改变框宽，上下拖动改变框高，松开保存。');
    event.preventDefault();
  }

  moveGlassesDrag(event, drag) {
    const morphs = this.getSculptMorphs?.();
    if (!morphs) return;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const width = clamp(drag.before.width + (event.clientX - drag.startX) * drag.side / 220, 0.68, 1.65);
    const height = clamp(drag.before.height + (drag.startY - event.clientY) * drag.vertical / 210, 0.68, 1.55);
    if (Math.abs((morphs.glassesWidth ?? 1) - width) < 0.002 &&
        Math.abs((morphs.glassesHeight ?? 1) - height) < 0.002) return;
    morphs.glassesWidth = width;
    morphs.glassesHeight = height;
    Object.assign(this.headNode.userData.currentMorphs, { glassesWidth: width, glassesHeight: height });
    syncFaceAccessories(this.headNode, this.headNode.userData.currentMorphs);
    this.wakeRender(0.4, true);
    this.onSculptStatus?.(`镜框宽 ${Math.round(width * 100)}% · 框高 ${Math.round(height * 100)}% · 可松开保存或撤销`);
    event.preventDefault();
  }

  startSculptDrag(event) {
    if (this.sculptTool === 'orbit' || event.button !== 0 || !this.headNode) return;
    const morphs = this.getSculptMorphs?.();
    if (!morphs) return;
    if (this.sculptTool === 'glasses') return this.startGlassesDrag(event, morphs);
    if (this.sculptTool === 'face' && this.currentConfig?.customModelUrl) {
      this.onSculptStatus?.('外部头模不包含内置 MPFB 顶点结构；请先用内置头模雕塑。');
      return;
    }
    const faceMesh = this.headNode.getObjectByName('HeadSkinMesh');
    const hairGroup = this.headNode.getObjectByName('HairGroup');
    const target = this.sculptTool === 'face' ? faceMesh : hairGroup;
    // Intersect the authored opaque undercoat first. Strand ribbons have
    // degenerate CPU triangles, so include them through the centerline picker
    // below instead of raycasting 160k zero-area vertices on every click.
    const hitMeshes = this.sculptTool === 'face' ? [faceMesh].filter(Boolean) :
      getBrushableHairMeshes(this.headNode, false).filter(mesh => mesh.visible);
    const masterStrands = this.sculptTool === 'hair'
      ? hairGroup?.getObjectByName('MasterStrandHairMesh') : null;
    if (!target || (!hitMeshes.length && !masterStrands)) {
      this.onSculptStatus?.('此模型没有可编辑的对应网格；等模型加载完成再试。');
      return;
    }
    this.headNode.updateMatrixWorld(true);
    this.sculptRaycaster.setFromCamera(this.sculptNdc(event), this.camera);
    let hit = this.sculptRaycaster.intersectObjects(hitMeshes, false)[0];
    if (!hit && masterStrands) hit = this.pickStrandBrushStart(event, masterStrands);
    if (!hit) {
      this.onSculptStatus?.(this.sculptTool === 'face' ? '请从脸部皮肤表面开始拖动。' : '请从发束或发梢开始梳理；固定发根不能拖拽。');
      return;
    }
    const startWorld = hit.point.clone();
    const startLocal = target.worldToLocal(startWorld.clone());
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(
      this.camera.getWorldDirection(new THREE.Vector3()), startWorld
    );
    const gestures = morphs.sculptGestures ||= [];
    if (gestures.length >= SCULPT_MAX_GESTURES) gestures.shift();
    const seriesId = `drag-${Date.now().toString(36)}-${++this.sculptSeriesSerial}`;
    const gesture = {
      tool: this.sculptTool,
      ...(this.sculptTool === 'hair' ? { hairStyle: this.headNode.userData.currentHairStyle || '' } : {}),
      seriesId, strokes: []
    };
    gestures.push(gesture);
    morphs.sculptRevision = (Number(morphs.sculptRevision) || 0) + 1;
    this.updateMorphsFast(morphs); // align runtime caches with this new undo step
    this.sculptDrag = {
      pointerId: event.pointerId, node: this.headNode, target, plane,
      seriesId, gesture, gestures: [gesture], startLocal, lastLocal: startLocal.clone(), applied: new THREE.Vector3(),
      lastFrame: 0
    };
    this.canvas.setPointerCapture(event.pointerId);
    this.onSculptStatus?.(this.sculptTool === 'face' ? '正拉动面部网格；松开即完成一笔。' : '正沿发束梳理网格；松开即完成一笔。');
    event.preventDefault();
  }

  moveSculptDrag(event) {
    const drag = this.sculptDrag;
    if (!drag || drag.pointerId !== event.pointerId || drag.node !== this.headNode) return;
    if (drag.tool === 'glasses') return this.moveGlassesDrag(event, drag);
    if (event.timeStamp - drag.lastFrame < 12) return; // bounded CPU work while dragging
    drag.lastFrame = event.timeStamp;
    if (drag.gesture.strokes.length >= SCULPT_MAX_SEGMENTS) {
      // Continue the *same pointer drag* in another serializable chunk, not
      // a dead end after 64 samples. All chunks share an undo-series ID.
      const morphs = this.getSculptMorphs?.();
      if (!morphs) return;
      const gestures = morphs.sculptGestures ||= [];
      if (gestures.length >= SCULPT_MAX_GESTURES) gestures.shift();
      drag.gesture = {
        tool: drag.gesture.tool,
        ...(drag.gesture.tool === 'hair' ? { hairStyle: drag.node.userData.currentHairStyle || '' } : {}),
        seriesId: drag.seriesId, strokes: [],
      };
      drag.gestures.push(drag.gesture);
      gestures.push(drag.gesture);
      this.onSculptStatus?.('已自动续接这一笔；继续拖动，松开后仍可一次撤销整个拖拽。');
    }
    this.sculptRaycaster.setFromCamera(this.sculptNdc(event), this.camera);
    const world = this.sculptRaycaster.ray.intersectPlane(drag.plane, new THREE.Vector3());
    if (!world) return;
    const local = drag.target.worldToLocal(world);
    let center, delta;
    if (drag.gesture.tool === 'face') {
      const desired = local.clone().sub(drag.startLocal).clampLength(0, 0.040).multiplyScalar(this.sculptStrength);
      delta = desired.sub(drag.applied).clampLength(0, 0.008);
      center = drag.startLocal;
      drag.applied.add(delta);
    } else {
      center = drag.lastLocal.clone().add(local).multiplyScalar(0.5);
      delta = local.clone().sub(drag.lastLocal).multiplyScalar(this.sculptStrength).clampLength(0, 0.008);
      drag.lastLocal.copy(local);
    }
    if (delta.lengthSq() < 1e-8) return;
    const round = n => Math.round(n * 1e6) / 1e6;
    const stroke = [center.x, center.y, center.z, delta.x, delta.y, delta.z,
      Math.min(0.065, Math.max(0.010, this.sculptRadius)), this.sculptSymmetric ? 1 : 0].map(round);
    const changed = applyLiveSculptStroke(this.headNode, drag.gesture.tool, stroke);
    if (changed) {
      drag.gesture.strokes.push(stroke);
      this.wakeRender(0.25, true);
    }
    event.preventDefault();
  }

  finishSculptDrag(event) {
    const drag = this.sculptDrag;
    if (!drag || (event && event.pointerId !== drag.pointerId)) return;
    this.sculptDrag = null;
    if (this.canvas.hasPointerCapture(drag.pointerId)) this.canvas.releasePointerCapture(drag.pointerId);
    const morphs = this.getSculptMorphs?.();
    if (drag.tool === 'glasses') {
      const changed = morphs && (
        Math.abs((morphs.glassesWidth ?? 1) - drag.before.width) > 0.002 ||
        Math.abs((morphs.glassesHeight ?? 1) - drag.before.height) > 0.002
      );
      if (!changed) {
        const i = morphs?.sculptGestures?.indexOf(drag.gesture) ?? -1;
        if (i >= 0) morphs.sculptGestures.splice(i, 1);
      } else {
        this.updateMorphsFast(morphs);
        this.onSculptCommit?.(morphs);
      }
      this.onSculptStatus?.(changed ? '镜框网格塑形已保存到外观草稿；可撤销或建档。' : '眼镜没有产生形变。');
      return;
    }
    const hasStrokes = drag.gestures.some(g => g.strokes.length > 0);
    for (const empty of drag.gestures.filter(g => !g.strokes.length)) {
      const i = morphs?.sculptGestures?.indexOf(empty) ?? -1;
      if (i >= 0) morphs.sculptGestures.splice(i, 1);
    }
    if (hasStrokes && drag.node === this.headNode) {
      finalizeSculptStroke(this.headNode, drag.gesture.tool);
      this.onSculptCommit?.(morphs);
      this.wakeRender(0.8, true);
    }
    this.onSculptStatus?.(hasStrokes ? '已完成一笔；可一次撤销整个拖拽或保存到档案。' : '未击中网格；没有生成笔画。');
  }

  undoSculpt() {
    if (this.sculptDrag) this.finishSculptDrag();
    const morphs = this.getSculptMorphs?.();
    if (!morphs?.sculptGestures?.length) return false;
    const undone = morphs.sculptGestures.pop();
    if (undone.tool === 'glasses') {
      morphs.glassesWidth = undone.glassesBefore?.width ?? 1;
      morphs.glassesHeight = undone.glassesBefore?.height ?? 1;
      this.updateMorphsFast(morphs);
      this.onSculptCommit?.(morphs);
      this.onSculptStatus?.('已撤销眼镜框宽 / 框高的直接拖拽形变。');
      return true;
    }
    if (undone.seriesId) {
      while (morphs.sculptGestures.at(-1)?.seriesId === undone.seriesId) morphs.sculptGestures.pop();
    }
    morphs.sculptRevision = (Number(morphs.sculptRevision) || 0) + 1;
    this.updateMorphsFast(morphs);
    finalizeSculptStroke(this.headNode, undone.tool);
    this.onSculptCommit?.(morphs);
    this.onSculptStatus?.('已撤销上一笔网格雕塑。');
    return true;
  }

  bindPointerTracking() {
    this.canvas.addEventListener('pointermove', (e) => {
      if (this.sculptDrag) this.moveSculptDrag(e);
      const rect = this.canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        this.pointerNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.pointerNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      }
      this.wakeRender(1.2);
    });
    this.canvas.addEventListener('pointerdown', (e) => {
      if (this.sculptTool !== 'orbit') {
        this.startSculptDrag(e);
        return;
      }
      this.wakeRender(2.0);
      if (this.headNode) triggerCollectibleBlink(this.headNode);
    });
    this.canvas.addEventListener('pointerup', e => this.finishSculptDrag(e));
    this.canvas.addEventListener('pointercancel', e => this.finishSculptDrag(e));
    this.canvas.addEventListener('wheel', () => {
      this.wakeRender(1.5);
    }, { passive: true });
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w > 0 && h > 0) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
      if (this.beautyPost) this.beautyPost.syncSize(w, h, this.renderer.getPixelRatio());
      this.wakeRender(1.5, true);
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

  applyVisualCustomConfig(cfg = {}) {
    this.visualConfig = { ...(this.visualConfig || {}), ...cfg };
    applyCustomVisualConfigToEngine(this, this.visualConfig);
  }

  /** Stage 13b：用户可随时开关氛围（尘埃 + 背幕光晕，设置页持久化） */
  setAtmosphereEnabled(v) {
    const on = v !== false;
    if (this.atmosphere) this.atmosphere.group.visible = on;
    if (this.backdropMesh) this.backdropMesh.visible = on;
    this.wakeRender(1.2);
  }

  async loadOrRebuild(config) {
    const request = (this.loadRequest || 0) + 1;
    this.loadRequest = request;
    const previousGroomId = this.headNode?.userData?.groomStats?.id;
    this.currentConfig = JSON.parse(JSON.stringify(config));
    if (config.photoElement) {
      this.currentConfig.photoElement = config.photoElement;
    }

    // Curved hair has large geometry. Release the previous built-in preview
    // before constructing its replacement; external import still stays atomic.
    if (!config.customModelUrl && this.headNode?.userData?.groomStats) {
      disposeHeadNode(this.headNode); this.headNode = null;
      this.renderer.renderLists.dispose();
      await new Promise(resolve => setTimeout(resolve, 16));
      if (request !== this.loadRequest) return this.headNode;
    }
    const newNode = await buildCollectibleHeadNode({ ...this.currentConfig, groomLod: 'studio', groomSoftware: this.softwareRenderer });
    if (request !== this.loadRequest) { disposeHeadNode(newNode); return this.headNode; }
    disposeHeadNode(this.headNode);
    this.headNode = newNode;
    this.scene.add(this.headNode);
    // A user may move several live sliders while the GLB and hair are still
    // loading. Keep the latest draft instead of replacing their edits with
    // the snapshot captured when the asynchronous build started.
    if (this.currentConfig?.morphs) applyHeadMorphsToGroup(newNode, this.currentConfig.morphs);
    if (this.visualConfig) {
      applyCustomVisualConfigToEngine(this, this.visualConfig);
    }
    const newGroomId = this.headNode.userData?.groomStats?.id;
    if (newGroomId !== previousGroomId && (newGroomId === 'groom_center_long' || previousGroomId === 'groom_center_long')) this.setCameraPreset('front');
    this.updateCutHelperPosition(config.morphs);
    this.wakeRender(2.0, true);
    return newNode;
  }

  /** Replace only the hairstyle. Reuse the existing face, textures, geometry,
   * viewer and head transform rather than loading the entire head GLB again. */
  async updateHairOnly(config) {
    if (!this.headNode || config.customModelUrl || config.customHairUrl || this.currentConfig?.customModelUrl) {
      return this.loadOrRebuild(config);
    }
    const request = ++this.loadRequest;
    const node = this.headNode;
    const before = performance.now();
    this.currentConfig = JSON.parse(JSON.stringify(config));
    await updateHairDesignOnGroup(node, {
      hairStyle: config.hairStyle,
      hairColor: config.hairColor,
      hairSheen: config.hairSheen,
      neckClearance: config.neckClearance,
      topCrown: config.topCrown ?? config.morphs?.topCrown,
      frontBangs: config.frontBangs ?? config.morphs?.frontBangs,
      sideLocks: config.sideLocks ?? config.morphs?.sideLocks,
      backAttachment: config.backAttachment ?? config.morphs?.backAttachment,
      hairRenderMode: config.morphs?.hairRenderMode,
      strandDensity: config.morphs?.strandDensity,
    });
    if (this.headNode !== node || this.loadRequest !== request) return this.headNode;
    this.lastHairSwitchMs = Math.round(performance.now() - before);
    this.updateCutHelperPosition(config.morphs);
    this.wakeRender(1.0, true);
    return node;
  }

  /**
   * Real-time 32-channel morph slider update on the GLB meshes
   */
  updateMorphsFast(morphs = {}) {
    if (this.currentConfig) this.currentConfig.morphs = { ...(this.currentConfig.morphs || {}), ...morphs };
    if (!this.headNode) return;
    applyHeadMorphsToGroup(this.headNode, morphs);
    this.updateCutHelperPosition(morphs);
    this.wakeRender(1.4, true);
  }

  /**
   * Stage 36: Zero-latency live GPU material/color/makeup/pore/eye/photo-projection update
   */
  updateMaterialsFast(patch = {}) {
    if (!this.headNode) return;
    updateCollectibleMaterialsLive(this.headNode, patch);
    this.wakeRender(1.4, false);
  }

  updateCutHelperPosition(morphs = {}) {
    if (!this.cutPlaneHelper) return;
    this.cutPlaneHelper.position.y = (morphs.cutHeightOffset || 0) * 0.35;
    this.cutPlaneHelper.rotation.x = ((morphs.cutTiltPitch || 0) * Math.PI) / 180;
    this.cutPlaneHelper.rotation.z = -((morphs.cutTiltRoll || 0) * Math.PI) / 180;
  }

  setCameraPreset(preset) {
    this.autoRotate = false;
    const longHair = this.headNode?.userData?.groomStats?.id === 'groom_center_long';
    if (preset === 'front') {
      this.camera.position.set(0, 1.0, 62);
      this.controls.target.set(0, 1.0, 0.5);
    } else if (preset === 'three_quarter') {
      this.camera.position.set(22, 1.5, 56);
      this.controls.target.set(0, 1.0, 0.5);
    } else if (preset === 'anatomy_bottom') {
      // Dramatic upward inspection view directly looking at the C4/C5 Medical Anatomical Neck Cross-Section!
      this.camera.position.set(0, -34, 15);
      this.controls.target.set(0, -12.2, -0.8);
    } else if (preset === 'profile') {
      this.camera.position.set(60, 1.2, 0.5);
      this.controls.target.set(0, 1.0, 0.5);
    } else if (preset === 'turntable') {
      this.camera.position.set(22, 1.5, 58);
      this.controls.target.set(0, 1.0, 0.5);
      this.autoRotate = this.sculptTool === 'orbit';
    }
    if (longHair && preset !== 'anatomy_bottom') {
      this.camera.position.multiplyScalar(1.35);
      this.camera.position.y = -6;
      this.controls.target.y = -6;
    }
    this.controls.update();
    this.wakeRender(2.0, true);
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate);

    // Stage 22 Zero-Fan-Roar Fix: skip completely when Studio tab or Software window is hidden -> 0% GPU!
    if (!this.isCanvasVisible()) {
      this.lastFrameTime = performance.now();
      return;
    }

    const now = performance.now();
    const isIdle = !this.autoRotate && now > this.renderWakeUntil;
    if (isIdle && !this.pendingRender) {
      return;
    }
    const elapsedMs = now - this.lastFrameTime;
    const minIntervalMs = this.softwareRenderer ? 220.0 : 15.5;
    if (elapsedMs < minIntervalMs) return;
    this.pendingRender = false;
    const dt = Math.min(0.05, elapsedMs / 1000);
    this.lastFrameTime = now;

    const elapsed = this.clock.getElapsedTime();
    updateDynamicLightingOnEngine(this, elapsed);
    if (this.headNode) {
      if (this.autoRotate) {
        this.headNode.rotation.y += dt * 0.65;
        this.needsShadowRefresh = true;
      } else if (Math.abs(this.headNode.rotation.y) > 0.0005) {
        this.headNode.rotation.y *= 0.92;
        this.needsShadowRefresh = true;
      }
      updateHeadLifeAnimation(this.headNode, dt, this.pointerNdc.x * 0.65, this.pointerNdc.y * 0.55);
    }
    this.controls.update();
    if (this.atmosphere && this.atmosphere.group.visible) {
      this.atmosphere.update(dt, elapsed);
    }
    if (this.needsShadowRefresh) {
      requestShadowUpdate(this.renderer);
      this.needsShadowRefresh = false;
    }
    updateMasterStrandHairPxScale(this.scene, this.renderer, this.camera);
    if (this.beautyPost && this.beautyPost.enabled && !this.softwareRenderer) {
      this.beautyPost.render();
    } else {
      this.renderer.render(this.scene, this.camera);
    }
    if (this.softwareRenderer) {
      this.renderWakeUntil = 0;
    }
  }
}
