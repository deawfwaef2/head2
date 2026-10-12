import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { buildCollectibleHeadNode, applyHeadMorphsToGeometry } from './collectibleHeadAssembler.js';

export class StudioPreviewEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.headNode = null;
    this.autoRotate = false;
    this.currentConfig = null;
    this.clock = new THREE.Clock();

    this.initScene();
    this.animate = this.animate.bind(this);
    this.animId = requestAnimationFrame(this.animate);
  }

  initScene() {
    this.scene = new THREE.Scene();

    const w = this.canvas.clientWidth || 540;
    const h = this.canvas.clientHeight || 480;
    this.camera = new THREE.PerspectiveCamera(36, w / h, 1, 300);
    this.camera.position.set(0, -1.0, 44);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.localClippingEnabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.14;

    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.target.set(0, -1.8, -1.0);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 16;
    this.controls.maxDistance = 85;
    this.controls.update();

    // Studio 4-point lighting + bottom anatomical inspection light
    const hemi = new THREE.HemisphereLight('#fff7f2', '#1e293b', 1.25);
    this.scene.add(hemi);

    const key = new THREE.DirectionalLight('#fff8f4', 1.65);
    key.position.set(28, 32, 48);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight('#93c5fd', 0.95);
    fill.position.set(-34, 10, 35);
    this.scene.add(fill);

    const bottomAnatomyLight = new THREE.DirectionalLight('#ffe4e6', 1.55);
    bottomAnatomyLight.position.set(0, -48, 22);
    this.scene.add(bottomAnatomyLight);

    const backRim = new THREE.DirectionalLight('#38bdf8', 1.15);
    backRim.position.set(0, 26, -42);
    this.scene.add(backRim);

    // Subtle circular specimen studio reference ring below the neck cross-section
    const gridGeo = new THREE.RingGeometry(5.6, 5.75, 64);
    gridGeo.rotateX(-Math.PI / 2);
    gridGeo.translate(0, -14.3, -2.35);
    const gridMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide
    });
    this.cutPlaneHelper = new THREE.Mesh(gridGeo, gridMat);
    this.scene.add(this.cutPlaneHelper);
  }

  resize() {
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;
    if (w > 0 && h > 0) {
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h, false);
    }
  }

  async loadOrRebuild(config) {
    this.currentConfig = JSON.parse(JSON.stringify(config));
    // Preserve photoElement reference if present
    if (config.photoElement) {
      this.currentConfig.photoElement = config.photoElement;
    }

    const newNode = await buildCollectibleHeadNode(this.currentConfig);
    if (this.headNode) {
      this.scene.remove(this.headNode);
    }
    this.headNode = newNode;
    this.scene.add(this.headNode);
    this.updateCutHelperPosition(config.morphs);
    return newNode;
  }

  /**
   * Fast path for morph sliders without rebuilding textures or hair
   */
  updateMorphsFast(morphs = {}) {
    if (!this.headNode) return;
    const headMesh = this.headNode.userData.headMesh;
    const capMesh = this.headNode.userData.capMesh;
    if (headMesh && headMesh.userData.basePositions) {
      applyHeadMorphsToGeometry(headMesh.geometry, headMesh.userData.basePositions, morphs, false, headMesh.userData.weldData);
    }
    if (capMesh && capMesh.userData.basePositions) {
      applyHeadMorphsToGeometry(capMesh.geometry, capMesh.userData.basePositions, morphs, true, capMesh.userData.weldData);
    }
    this.updateCutHelperPosition(morphs);
  }

  updateCutHelperPosition(morphs = {}) {
    if (!this.cutPlaneHelper) return;
    this.cutPlaneHelper.position.y = morphs.cutHeightOffset || 0;
    this.cutPlaneHelper.rotation.x = ((morphs.cutTiltPitch || 0) * Math.PI) / 180;
    this.cutPlaneHelper.rotation.z = -((morphs.cutTiltRoll || 0) * Math.PI) / 180;
  }

  setCameraPreset(preset) {
    this.autoRotate = false;
    if (preset === 'front') {
      this.camera.position.set(0, -0.5, 42);
      this.controls.target.set(0, -0.8, 0);
    } else if (preset === 'three_quarter') {
      this.camera.position.set(22, 1.5, 36);
      this.controls.target.set(0, -1.8, -1.0);
    } else if (preset === 'anatomy_bottom') {
      // Dramatic upward inspection view directly looking at the C4/C5 Medical Anatomical Neck Cross-Section!
      this.camera.position.set(0, -34, 14);
      this.controls.target.set(0, -12.5, -2.3);
    } else if (preset === 'profile') {
      this.camera.position.set(42, -1.0, -1.0);
      this.controls.target.set(0, -1.5, -1.5);
    } else if (preset === 'turntable') {
      this.camera.position.set(16, -2.5, 38);
      this.controls.target.set(0, -2.0, -1.2);
      this.autoRotate = true;
    }
    this.controls.update();
  }

  animate() {
    this.animId = requestAnimationFrame(this.animate);
    const dt = this.clock.getDelta();
    if (this.autoRotate && this.headNode) {
      this.headNode.rotation.y += dt * 0.65;
    } else if (this.headNode) {
      this.headNode.rotation.y *= 0.92;
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}
