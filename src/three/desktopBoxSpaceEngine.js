import * as THREE from 'three';
import { buildCollectibleHeadNode } from './collectibleHeadAssembler.js';
import { soundEngine } from '../audio/tactileSoundEngine.js';

/**
 * Full-Screen 3D Perspective Box Space & Desktop Pet Physics/Interaction Engine
 * Implements:
 *  - Screen-Center Vanishing Point (透视消失点) with configurable X/Y offset
 *  - Bounded 3D Box Space (有限深度盒型空间: Front Glass Z=0 to Back Wall Z=-maxDepth)
 *  - Wheel Scroll Z-Depth push/pull along perspective rays toward/from Vanishing Point
 *  - Drag & Drop with tactile velocity inertia, wall collisions, and pet-to-pet physics
 *  - Click once -> Enter 360° Rotation Mode; Click again -> Cancel Rotation Mode
 *  - 3D Cursor Gaze Follow effect & Hover Dossier HUD Window coordinates
 */

export class DesktopBoxSpaceEngine {
  constructor(canvas, callbacks = {}) {
    this.canvas = canvas;
    this.onHoverChange = callbacks.onHoverChange || (() => {});
    this.onPetStateUpdate = callbacks.onPetStateUpdate || (() => {});
    this.onBoxCollisionVisual = callbacks.onBoxCollisionVisual || (() => {});

    this.settings = {
      fov: 42,
      vanishingPointOffsetX: 0, // -0.35 to +0.35 of screen width
      vanishingPointOffsetY: 0, // -0.35 to +0.35 of screen height
      boxWidthCm: 88,           // Half-width = 44
      boxHeightCm: 52,          // Half-height = 26
      boxMaxDepthMm: 1200,      // Displayed in mm (scene units = mm / 10 = 120 cm)
      showBoxGrid: 'always',    // 'always' | 'interaction' | 'hidden'
      followIntensity: 0.72,    // 0 to 1
      wheelDepthStep: 1.0,      // Scroll sensitivity
      autoResetAfterRotate: false,
      enablePetCollision: true
    };

    this.pets = new Map(); // id -> petEntry
    this.hoveredPetId = null;
    this.activeDragPet = null;
    this.pointerDownInfo = null;
    this.mouseNDC = new THREE.Vector2(0, 0);
    this.mouseClient = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.5 };
    this.raycaster = new THREE.Raycaster();
    this.clock = new THREE.Clock();
    this.wallFlashAlpha = { left: 0, right: 0, top: 0, bottom: 0, front: 0, back: 0 };
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
    // Camera sits at Z = +115 cm looking at origin (Z = 0 is the front screen glass plane!)
    this.cameraZ = 115;
    this.camera.position.set(0, 0, this.cameraZ);
    this.camera.lookAt(0, 0, -50);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.localClippingEnabled = true;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;

    // Museum-grade studio 4-point lighting for realistic skin SSS, hair sheen, and wet anatomy cross-section
    const ambient = new THREE.HemisphereLight('#fff5f0', '#1e293b', 1.25);
    this.scene.add(ambient);

    this.keyLight = new THREE.DirectionalLight('#fff8f2', 2.1);
    this.keyLight.position.set(42, 48, 95);
    this.scene.add(this.keyLight);

    this.fillLight = new THREE.DirectionalLight('#93c5fd', 0.95);
    this.fillLight.position.set(-55, 15, 70);
    this.scene.add(this.fillLight);

    // Upward anatomical uplight so the neck cross-section at the bottom is always well-lit when lifted or tilted!
    this.anatomyUpLight = new THREE.DirectionalLight('#fde2e4', 1.35);
    this.anatomyUpLight.position.set(0, -65, 55);
    this.scene.add(this.anatomyUpLight);

    this.rimLight = new THREE.PointLight('#38bdf8', 1.6, 260);
    this.rimLight.position.set(0, 35, -80);
    this.scene.add(this.rimLight);

    this.updateCameraProjection();
  }

  /**
   * Computes bounded 3D Box Space dimensions matched to screen aspect ratio
   */
  getBoxBounds() {
    const aspect = window.innerWidth / Math.max(1, window.innerHeight);
    const halfH = this.settings.boxHeightCm * 0.5;
    const halfW = halfH * aspect * (this.settings.boxWidthCm / 82);
    const maxDepthCm = this.settings.boxMaxDepthMm / 10; // e.g., 1200mm -> 120cm
    return {
      minX: -halfW,
      maxX: halfW,
      minY: -halfH,
      maxY: halfH,
      minZ: -maxDepthCm, // Back wall of the box
      maxZ: 0            // Front glass plane (computer screen surface)
    };
  }

  updateCameraProjection() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.fov = this.settings.fov;
    this.camera.aspect = w / h;

    // Apply off-axis perspective projection when Vanishing Point offset is adjusted
    const ox = -this.settings.vanishingPointOffsetX * w;
    const oy = this.settings.vanishingPointOffsetY * h;
    if (Math.abs(ox) > 0.5 || Math.abs(oy) > 0.5) {
      this.camera.setViewOffset(w, h, ox, oy, w, h);
    } else {
      this.camera.clearViewOffset();
    }
    this.camera.updateProjectionMatrix();
  }

  /**
   * Builds the 3D Perspective Box Space Wireframe Tunnel & Vanishing Point Crosshair
   */
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

    // Depth slice rectangles from Z=0 (front glass) to Z=minZ (back wall)
    for (const frac of depthSlices) {
      const z = b.minZ * frac;
      const col = cFront.clone().lerp(cBack, frac);
      pushSeg(b.minX, b.minY, z, b.maxX, b.minY, z, col, col);
      pushSeg(b.maxX, b.minY, z, b.maxX, b.maxY, z, col, col);
      pushSeg(b.maxX, b.maxY, z, b.minX, b.maxY, z, col, col);
      pushSeg(b.minX, b.maxY, z, b.minX, b.minY, z, col, col);
    }

    // 4 Corner Perspective Rays + Mid-Wall Rays converging toward the Back Wall & Vanishing Point
    const rays = [
      [b.minX, b.minY], [b.maxX, b.minY], [b.maxX, b.maxY], [b.minX, b.maxY],
      [0, b.minY], [0, b.maxY], [b.minX, 0], [b.maxX, 0]
    ];
    for (const [rx, ry] of rays) {
      pushSeg(rx, ry, 0, rx, ry, b.minZ, cFront, cBack);
    }

    // Back wall vanishing-point diagonal crosshairs
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

    // Back wall subtle translucent plane so user perceives the finite depth limit of the box
    const backWallGeo = new THREE.PlaneGeometry(b.maxX - b.minX, b.maxY - b.minY);
    this.backWallMat = new THREE.MeshBasicMaterial({
      color: '#0f172a',
      transparent: true,
      opacity: 0.14,
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
    // Clamp all active pets to updated box bounds
    const b = this.getBoxBounds();
    for (const pet of this.pets.values()) {
      pet.pos.x = Math.max(b.minX + 8, Math.min(b.maxX - 8, pet.pos.x));
      pet.pos.y = Math.max(b.minY + 10, Math.min(b.maxY - 9, pet.pos.y));
      pet.pos.z = Math.max(b.minZ + 8, Math.min(b.maxZ - 2, pet.pos.z));
    }
  }

  /**
   * Summons or updates a 3D Collectible Head Desktop Pet inside the 3D Box Space
   */
  async summonCollectible(collectible) {
    if (this.pets.has(collectible.id)) {
      this.recallCollectible(collectible.id, false);
    }

    const headNode = await buildCollectibleHeadNode(collectible);
    const b = this.getBoxBounds();

    const startX = Math.max(b.minX + 10, Math.min(b.maxX - 10, collectible.boxPosition?.x ?? 0));
    const startY = Math.max(b.minY + 11, Math.min(b.maxY - 10, collectible.boxPosition?.y ?? 2));
    // boxPosition.z is in mm (-1200 .. 0), convert to cm (-120 .. 0)
    const rawZCm = (collectible.boxPosition?.z ?? -160) / 10;
    const startZ = Math.max(b.minZ + 8, Math.min(b.maxZ - 2, rawZCm));

    headNode.position.set(startX, startY, startZ);

    // Subtle spawn scale-up animation
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
      customRot: new THREE.Euler(0.12, 0, 0), // Slight tilt showing both face & neck cross-section
      currentRot: new THREE.Euler(0, 0, 0),
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
    this.scene.remove(entry.node);
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
      pet.customRot.set(0.12, 0, 0);
    }
    const b = this.getBoxBounds();
    const panX = pet.pos.x / Math.max(1, b.maxX);
    soundEngine.playRotationModeToggle(pet.isRotationMode, panX);
    this.onPetStateUpdate(this.getSummonedList());
    this.refreshHoverHUD();
  }

  resetPetOrientation(id) {
    const pet = this.pets.get(id);
    if (!pet) return;
    pet.customRot.set(0.12, 0, 0);
  }

  getSummonedList() {
    return Array.from(this.pets.values()).map(p => ({
      id: p.id,
      name: p.collectible.name,
      isRotationMode: p.isRotationMode,
      x: Math.round(p.pos.x),
      y: Math.round(p.pos.y),
      zMm: Math.round(p.pos.z * 10)
    }));
  }

  /**
   * Projects a 3D world position to 2D screen pixel coordinates for the Hover Dossier Window
   */
  worldToScreen(vec3) {
    const v = vec3.clone().project(this.camera);
    return {
      x: (v.x * 0.5 + 0.5) * window.innerWidth,
      y: (-v.y * 0.5 + 0.5) * window.innerHeight
    };
  }

  /**
   * Computes the 3D world intersection on the plane Z = targetZ for current mouse NDC
   */
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

  bindEvents() {
    window.addEventListener('resize', () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      this.renderer.setSize(w, h);
      this.updateCameraProjection();
      this.initBoxWireframe();
    });

    this.canvas.addEventListener('pointerdown', (e) => {
      if (e.button !== 0) return;
      this.updateMouseCoords(e);
      const hitPet = this.pickPetAtCursor();
      if (!hitPet) return;

      e.stopPropagation();
      this.interactionHighlightTimer = 1.5;

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
    });

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
            // In 360° Rotation Mode: dragging freely rotates the head across yaw & pitch to inspect face & neck cross-section!
            pet.customRot.y += dx * 0.013;
            pet.customRot.x = Math.max(-Math.PI * 0.48, Math.min(Math.PI * 0.48, pet.customRot.x + dy * 0.013));
            const speedNorm = Math.min(1, Math.hypot(dx, dy) / 28);
            const b = this.getBoxBounds();
            soundEngine.updateDragWhoosh(speedNorm * 0.55, pet.pos.x / Math.max(1, b.maxX));
          } else {
            // In Desktop Box Space Mode: dragging moves the head in [X, Y] at its current Z depth
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

      // Hover detection when not dragging
      const hitPet = this.pickPetAtCursor();
      const newId = hitPet ? hitPet.id : null;
      if (newId !== this.hoveredPetId) {
        this.hoveredPetId = newId;
        this.canvas.style.cursor = hitPet
          ? (hitPet.isRotationMode ? 'grab' : 'pointer')
          : 'default';
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

      // If pointer barely moved (< 5px), treat as a click -> Toggle 360° Rotation Mode!
      if (info.movedDist <= 5) {
        this.toggleRotationMode(pet.id);
      } else if (info.pickupSoundPlayed) {
        const b = this.getBoxBounds();
        soundEngine.playRelease(pet.pos.x / Math.max(1, b.maxX));
      }
    });

    // Mouse Wheel adjusts 3D Depth (Z-axis) inside the Bounded 3D Box Space!
    this.canvas.addEventListener('wheel', (e) => {
      this.updateMouseCoords(e);
      const hitPet = this.pickPetAtCursor() || (this.hoveredPetId ? this.pets.get(this.hoveredPetId) : null);
      if (!hitPet) return;

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
    }, { passive: false });
  }

  updateMouseCoords(e) {
    this.mouseClient.x = e.clientX;
    this.mouseClient.y = e.clientY;
    this.mouseNDC.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouseNDC.y = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  animate() {
    this.animFrameId = requestAnimationFrame(this.animate);
    const dt = Math.min(0.05, this.clock.getDelta());
    const elapsed = this.clock.getElapsedTime();
    const b = this.getBoxBounds();

    // Update Box Space Grid visibility & opacity
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

    // Pet-to-Pet physical elastic collision inside the 3D Box Space
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

    // Update each summoned 3D head pet
    for (const pet of petArray) {
      // Smooth scale-in
      pet.currentScale += (pet.targetScale - pet.currentScale) * 0.14;
      pet.node.scale.setScalar(pet.currentScale);

      const isBeingDragged = this.pointerDownInfo && this.pointerDownInfo.pet === pet && this.pointerDownInfo.movedDist > 5 && !pet.isRotationMode;

      if (!isBeingDragged) {
        pet.pos.add(pet.vel);
        pet.vel.multiplyScalar(0.88); // Damping
      }

      // Bounded 3D Box Space Wall Collisions (Left, Right, Top, Bottom, Front Glass, Back Wall)
      // Because camera is perspective, visible frustum width at depth Z shrinks or grows, OR we enforce the physical 3D Box walls!
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

      // Gentle organic floating bob
      const bobY = Math.sin(elapsed * 1.8 + pet.phase) * 0.28;
      pet.node.position.set(pet.pos.x, pet.pos.y + bobY, pet.pos.z);

      // Rotation Logic:
      if (pet.isRotationMode) {
        // In 360° Rotation Mode: smoothly slerp toward user-inspected customRot + animate gimbal rings
        pet.node.rotation.x += (pet.customRot.x - pet.node.rotation.x) * 0.22;
        pet.node.rotation.y += (pet.customRot.y - pet.node.rotation.y) * 0.22;
        pet.node.rotation.z += (0 - pet.node.rotation.z) * 0.18;
        if (pet.node.userData.gimbalGroup) {
          pet.node.userData.gimbalGroup.children[0].rotation.z += dt * 0.8;
          pet.node.userData.gimbalGroup.children[1].rotation.y -= dt * 0.6;
        }
      } else {
        // In 3D Gaze Follow Mode:
        // Head subtly turns toward the mouse cursor in 3D space + tilts with drag velocity
        const cursorWorld = this.getMouseWorldAtZ(pet.pos.z * 0.5);
        const dx = cursorWorld.x - pet.pos.x;
        const dy = cursorWorld.y - pet.pos.y;
        const follow = this.settings.followIntensity;

        const targetYaw = Math.max(-0.62, Math.min(0.62, (dx / 42) * follow)) + pet.customRot.y * 0.35;
        const targetPitch = Math.max(-0.48, Math.min(0.48, (-dy / 38) * follow)) + pet.customRot.x;
        const velocityRoll = Math.max(-0.32, Math.min(0.32, -pet.vel.x * 0.14));

        pet.node.rotation.x += (targetPitch - pet.node.rotation.x) * 0.10;
        pet.node.rotation.y += (targetYaw - pet.node.rotation.y) * 0.10;
        pet.node.rotation.z += (velocityRoll - pet.node.rotation.z) * 0.12;
      }
    }

    this.renderer.render(this.scene, this.camera);
  }
}
