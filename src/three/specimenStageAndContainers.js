import * as THREE from 'three';
import { injectStageWindowGoboShader } from './photorealLighting.js';
import {
  getBeveledBoxGeometry,
  getFlutedColumnShaftGeometry,
  getSculptedGadroonLatheGeometry,
  buildHighPolyTuftedVelvetCushion,
  buildBaroqueScrollFoot,
  getVictorianBalusterGeometry,
  buildArchitecturalScrollCorbel,
  buildHighPoly3DRose,
} from './highPolyArchitectureBuilders.js';

/**
 * Stage 23–27 · 屏幕空间 3D 实体地板/层架 + 独立可放置头颅收纳建筑 + 雨夜伴学书房窗景系统
 * - 头颅收纳装置不再与角色绑定，而是独立可放置、可拖拽、可吸附收纳任意断头的 3D 建筑 (`placedStructures`)
 * - 书房雨夜木格窗 + 窗外飘雨粒子 + 绿罩黄铜伴学台灯 + 窗户透光 Gobo 阴影投射
 */

export const FLOOR_STYLE_CATALOG = [
  { id: 'walnut_desk', label: '🪵 雨夜胡桃木伴学书桌 · 真皮桌垫与黄铜包边 (默认伴学推荐)' },
  { id: 'dark_obsidian', label: '🏛️ 黑曜石镜面展台 · 镶金刻度线' },
  { id: 'marble_museum', label: '🤍 帕特农汉白玉展台 · 灰金云纹高反差' },
  { id: 'surgical_steel', label: '🔬 法医不锈钢解剖托台 · 导流槽与厘米标尺' },
  { id: 'none', label: '🌌 隐藏实体地板 (仅保留盒型透视网格)' },
];

export const SHELF_LAYOUT_CATALOG = [
  { id: 'study_side_rack', label: '📚 伴学侧边双层陈列架 + 底部长案台 (推荐伴学)' },
  { id: 'bottom_gallery', label: '🏛️ 屏幕底部一字长案台 (全员案头陈列)' },
  { id: 'stepped_altar', label: '👑 三阶金字塔加冕高台 (高低错落陈列)' },
  { id: 'corner_pedestals', label: '📐 屏幕四角黑金高脚立柱台' },
];

export const CONTAINER_STYLE_CATALOG = [
  { id: 'glass_bell_jar', shortLabel: '玻璃钟罩座', label: '🧪 维多利亚玻璃钟罩座 · 黑金黄铜底座 (可放置收纳建筑)', headMountY: 13.5, snapRadius: 14.5 },
  { id: 'velvet_chalice', shortLabel: '丝绒圣杯座', label: '👑 黑金丝绒高脚圣杯座 · 露天颈口托盘 (可放置收纳建筑)', headMountY: 14.6, snapRadius: 14.0 },
  { id: 'formalin_cylinder', shortLabel: '福尔马林缸', label: '🧫 福尔马林圆柱防腐缸 · 琥珀刻度液 (可放置收纳建筑)', headMountY: 13.6, snapRadius: 14.5 },
  { id: 'acrylic_cube', shortLabel: '水晶方盒座', label: '💎 博物馆亚克力水晶方盒 · 底射灯座 (可放置收纳建筑)', headMountY: 13.5, snapRadius: 15.0 },
  { id: 'surgical_tray', shortLabel: '解剖浅盘座', label: '🩸 法医不锈钢解剖浅盘 · 凝血标本垫 (可放置收纳建筑)', headMountY: 12.1, snapRadius: 14.0 },
  { id: 'guillotine_plinth', shortLabel: '断头木托座', label: '🪓 黑胡桃断头台木托座 · 处决铜铭牌 (可放置收纳建筑)', headMountY: 13.0, snapRadius: 14.0 },
];

export const DECOR_STYLE_CATALOG = [
  { id: 'trophy_candles', shortLabel: '白烛玫瑰', label: '🕯️ 案头哥特白烛阵 + 暗红凋零玫瑰花瓣 (独立场景摆件)' },
  { id: 'study_tomes', shortLabel: '状元古籍', label: '📚 案头状元满分卷 + 烫金古籍书堆 + 黄铜怀表 (独立场景摆件)' },
  { id: 'soul_siphon', shortLabel: '虹吸法阵', label: '⚡ 案头生机汲取金环阵 + 悬浮灵子微光 (独立场景摆件)' },
  { id: 'forensic_evidence', shortLabel: '物证黄牌', label: '🏷️ 案头法医物证黄牌 (#01/#02) + 解剖器械盘 (独立场景摆件)' },
  { id: 'none', shortLabel: '无装饰品', label: '🚫 无场景装饰摆件 (纯享极简展台)' },
];

export const PLACEMENT_FORMATIONS = [
  { id: 'study_sides', label: '📚 伴学左右护法阵 (移至屏幕两侧层架，留出中央学习区)' },
  { id: 'bottom_row', label: '🏛️ 案头一字排开阵 (整齐陈列于底部清晰桌面)' },
  { id: 'altar_pyramid', label: '👑 生者加冕高台阵 (主位居中高台 + 两侧拱卫)' },
  { id: 'macro_focus', label: '🔍 中心贴脸特写阵 (主藏品拉近至镜头前特写)' },
];

const floorTextureCache = new Map();
let formalinGradTexture = null;

function getFloorTexture(styleId = 'dark_obsidian') {
  if (floorTextureCache.has(styleId)) return floorTextureCache.get(styleId);
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  if (styleId === 'walnut_desk') {
    // Rich dark walnut wood grain + central dark leather desk mat + brass border
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#2b1810');
    grad.addColorStop(0.5, '#3b2217');
    grad.addColorStop(1, '#22120b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Wood grain fibers
    for (let i = 0; i < 240; i++) {
      const y = (i / 240) * h;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(18, 8, 4, 0.28)' : 'rgba(92, 54, 34, 0.18)';
      ctx.lineWidth = 1 + (i % 3);
      ctx.beginPath();
      ctx.moveTo(0, y);
      for (let x = 0; x <= w; x += 64) {
        ctx.lineTo(x, y + Math.sin(x * 0.015 + i * 0.4) * 3.5);
      }
      ctx.stroke();
    }

    // Central leather study desk pad
    ctx.fillStyle = 'rgba(18, 22, 30, 0.76)';
    ctx.fillRect(w * 0.08, h * 0.14, w * 0.84, h * 0.74);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 3;
    ctx.strokeRect(w * 0.085, h * 0.15, w * 0.83, h * 0.72);
  } else if (styleId === 'marble_museum') {
    // Carrara white-grey marble with subtle gold geometric inlay
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#d8dde6');
    grad.addColorStop(0.5, '#eef2f6');
    grad.addColorStop(1, '#cbd2de');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Marble veins
    ctx.strokeStyle = 'rgba(100, 116, 139, 0.26)';
    for (let v = 0; v < 28; v++) {
      ctx.lineWidth = 1 + (v % 3) * 0.8;
      ctx.beginPath();
      let vx = (v / 28) * w;
      let vy = 0;
      ctx.moveTo(vx, vy);
      while (vy < h) {
        vy += 24;
        vx += Math.sin(vy * 0.04 + v) * 14;
        ctx.lineTo(vx, vy);
      }
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(180, 142, 68, 0.65)';
    ctx.lineWidth = 4;
    ctx.strokeRect(18, 18, w - 36, h - 36);
  } else if (styleId === 'surgical_steel') {
    // Brushed medical stainless steel + millimeter ruler ticks
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#475569');
    grad.addColorStop(0.5, '#64748b');
    grad.addColorStop(1, '#334155');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    // Front ruler bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.fillRect(0, h - 38, w, 38);
    ctx.strokeStyle = '#38bdf8';
    for (let x = 16; x < w - 16; x += 16) {
      const tall = x % 64 === 0 ? 18 : 9;
      ctx.beginPath();
      ctx.moveTo(x, h - 4);
      ctx.lineTo(x, h - 4 - tall);
      ctx.stroke();
    }
  } else {
    // Default: Dark Obsidian Mirror Stone with Gold & Cyan Architectural Grid
    const grad = ctx.createRadialGradient(w * 0.5, h * 0.55, 40, w * 0.5, h * 0.5, w * 0.65);
    grad.addColorStop(0, '#1e293b');
    grad.addColorStop(0.6, '#0f172a');
    grad.addColorStop(1, '#090d16');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Crisp gold & cyan architectural tile lines
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.28)';
    ctx.lineWidth = 1.5;
    const cols = 8;
    const rows = 4;
    for (let i = 1; i < cols; i++) {
      const x = (i / cols) * w;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let j = 1; j < rows; j++) {
      const y = (j / rows) * h;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Perimeter double gold & cyan trim
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.78)';
    ctx.lineWidth = 5;
    ctx.strokeRect(12, 12, w - 24, h - 24);
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(24, 24, w - 48, h - 48);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  floorTextureCache.set(styleId, tex);
  return tex;
}

function getFormalinGradTexture() {
  if (formalinGradTexture) return formalinGradTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);

  // Subtle millimeter graduation ticks along the front of the cylinder
  ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
  ctx.fillStyle = 'rgba(226, 232, 240, 0.65)';
  ctx.font = 'bold 14px monospace';
  for (let y = 40; y <= 460; y += 14) {
    const isMajor = (y - 40) % 70 === 0;
    const len = isMajor ? 28 : 12;
    ctx.lineWidth = isMajor ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(240, y);
    ctx.lineTo(240 + len, y);
    ctx.stroke();
    if (isMajor) {
      const ml = Math.round(((460 - y) / 420) * 2000);
      ctx.fillText(`${ml}ml`, 274, y + 5);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  formalinGradTexture = tex;
  return tex;
}

/**
 * Builds the 3D Screen-Space Floor Stage & Multi-Shelf Display Rack (`FloorStageGroup`)
 * and returns `{ group, platforms }` for gravity landing & placement.
 */
export function buildScreenSpaceStageGroup(bounds, options = {}) {
  const floorStyle = options.floorStyle || 'dark_obsidian';
  const shelfLayout = options.shelfLayout || 'study_side_rack';

  const group = new THREE.Group();
  group.name = 'ScreenSpaceStageGroup';
  const platforms = [];
  const movableProps = [];

  const boxW = bounds.maxX - bounds.minX;
  const boxH = bounds.maxY - bounds.minY;
  const floorMinZ = bounds.minZ;
  const floorMaxZ = 42;
  const floorDepth = floorMaxZ - floorMinZ;
  const floorCenterZ = (floorMinZ + floorMaxZ) * 0.5;
  const floorSurfaceY = bounds.minY + 1.8;

  platforms.push({
    id: 'main_floor',
    label: '底部主展台桌面',
    minX: -boxW * 0.85,
    maxX: boxW * 0.85,
    minZ: bounds.minZ,
    maxZ: bounds.maxZ,
    surfaceY: floorSurfaceY,
    isMainFloor: true,
  });

  if (floorStyle === 'none') {
    return { stageGroup: group, group, shelves: platforms, platforms, movableProps };
  }

  const floorTex = getFloorTexture(floorStyle);
  const isLightMarble = floorStyle === 'marble_museum';
  const slabThickness = 2.2;

  const floorMat = new THREE.MeshPhysicalMaterial({
    map: floorTex,
    roughness: floorStyle === 'walnut_desk' ? 0.36 : isLightMarble ? 0.24 : 0.20,
    metalness: floorStyle === 'surgical_steel' ? 0.65 : 0.08,
    clearcoat: 0.42,
    clearcoatRoughness: 0.24,
    envMapIntensity: 0.45,
  });
  injectStageWindowGoboShader(floorMat);

  const trimMat = new THREE.MeshStandardMaterial({
    color: floorStyle === 'surgical_steel' ? '#94a3b8' : '#d4af37',
    roughness: 0.26,
    metalness: 0.82,
  });

  const mainSlabGeo = getBeveledBoxGeometry(boxW * 1.16, slabThickness, floorDepth, 1.2, 0.35, 6);
  const mainSlab = new THREE.Mesh(mainSlabGeo, floorMat);
  mainSlab.position.set(0, floorSurfaceY - slabThickness * 0.5, floorCenterZ);
  mainSlab.receiveShadow = true;
  group.add(mainSlab);

  const frontBarGeo = getBeveledBoxGeometry(boxW * 1.16, slabThickness * 1.08, 1.5, 0.35, 0.22, 5);
  const frontBar = new THREE.Mesh(frontBarGeo, trimMat);
  frontBar.position.set(0, floorSurfaceY - slabThickness * 0.48, 2.0);
  frontBar.receiveShadow = true;
  group.add(frontBar);

  // Stage 48: High-Poly Sculpted Museum Gallery Console Shelves & 24-Flute Corinthian Columns
  const addShelfPlatform = (id, label, cx, surfaceY, cz, w, d, hThickness = 1.6, isColumn = false) => {
    const shelfNode = new THREE.Group();
    shelfNode.name = `StageShelf_${id}`;
    shelfNode.position.set(cx, surfaceY, cz);

    if (!isColumn) {
      // 1. Multi-tiered smooth-beveled ogee architectural deck + cornice molding
      const topDeck = new THREE.Mesh(getBeveledBoxGeometry(w, hThickness * 0.68, d, 0.9, 0.24, 6), floorMat);
      topDeck.position.set(0, -hThickness * 0.34, 0);
      topDeck.castShadow = true;
      topDeck.receiveShadow = true;
      shelfNode.add(topDeck);

      const midCornice = new THREE.Mesh(getBeveledBoxGeometry(w + 0.55, hThickness * 0.28, d + 0.55, 0.95, 0.14, 5), trimMat);
      midCornice.position.set(0, -hThickness * 0.56, 0);
      shelfNode.add(midCornice);

      const lowerSoffit = new THREE.Mesh(getBeveledBoxGeometry(w * 0.92, hThickness * 0.58, d * 0.92, 0.75, 0.20, 5), floorMat);
      lowerSoffit.position.set(0, -hThickness * 0.92, 0);
      lowerSoffit.castShadow = true;
      shelfNode.add(lowerSoffit);

      // 2. Classical Dentil Frieze along front & side soffit
      const dentilCount = Math.max(8, Math.round(w / 1.8));
      const dentilGeo = getBeveledBoxGeometry(0.55, 0.42, 0.48, 0.08, 0.06, 3);
      for (let di = 0; di < dentilCount; di++) {
        const dx = -w * 0.43 + (di / Math.max(1, dentilCount - 1)) * (w * 0.86);
        const dent = new THREE.Mesh(dentilGeo, trimMat);
        dent.position.set(dx, -hThickness * 0.76, d * 0.46);
        shelfNode.add(dent);
      }

      // 3. Turned Victorian Hourglass Balustrade Gallery Rail along back & sides
      const railH = 1.85;
      const balGeo = getVictorianBalusterGeometry();
      const backRail = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, w * 0.94, 20), trimMat);
      backRail.rotation.z = Math.PI * 0.5;
      backRail.position.set(0, railH, -d * 0.44);
      shelfNode.add(backRail);

      // Back balusters
      const backSpindles = 7;
      for (let bi = 0; bi < backSpindles; bi++) {
        const bx = -w * 0.44 + (bi / (backSpindles - 1)) * (w * 0.88);
        const sp = new THREE.Mesh(balGeo, trimMat);
        sp.scale.set(0.85, railH, 0.85);
        sp.position.set(bx, railH * 0.5, -d * 0.44);
        shelfNode.add(sp);
      }

      for (const side of [-1, 1]) {
        const sideRail = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, d * 0.86, 20), trimMat);
        sideRail.rotation.x = Math.PI * 0.5;
        sideRail.position.set(side * w * 0.46, railH, -d * 0.01);
        shelfNode.add(sideRail);

        for (const zf of [-0.44, -0.15, 0.14, 0.41]) {
          const sp = new THREE.Mesh(balGeo, trimMat);
          sp.scale.set(0.9, railH, 0.9);
          sp.position.set(side * w * 0.46, railH * 0.5, d * zf);
          shelfNode.add(sp);
        }

        // Corner Urn Finials
        for (const zf of [-0.44, 0.41]) {
          const finial = new THREE.Mesh(new THREE.SphereGeometry(0.32, 18, 14), trimMat);
          finial.scale.set(1.0, 1.35, 1.0);
          finial.position.set(side * w * 0.46, railH + 0.28, d * zf);
          shelfNode.add(finial);
        }

        // 4. High-Poly Wrought-Brass Double-Volute Scroll Corbels underneath shelf
        const corbel = buildArchitecturalScrollCorbel(d * 0.82, 5.4, trimMat);
        corbel.position.set(side * (w * 0.40), -hThickness * 1.05, 0);
        shelfNode.add(corbel);
      }
    } else {
      // High-Poly 24-Flute Corinthian / Baroque Museum Pedestal Column (~7,200 triangles)
      const shaftH = Math.max(3, surfaceY - hThickness - floorSurfaceY);

      // Top Beveled Abacus Deck + Gadrooned Echinus Capital
      const abacus = new THREE.Mesh(getBeveledBoxGeometry(w * 0.96, hThickness * 0.52, d * 0.96, 0.8, 0.18, 5), floorMat);
      abacus.position.set(0, -hThickness * 0.26, 0);
      abacus.castShadow = true;
      abacus.receiveShadow = true;
      shelfNode.add(abacus);

      const capPts = [
        new THREE.Vector2(0.0, -hThickness * 1.65),
        new THREE.Vector2(w * 0.35, -hThickness * 1.65),
        new THREE.Vector2(w * 0.39, -hThickness * 1.25),
        new THREE.Vector2(w * 0.49, -hThickness * 0.72),
        new THREE.Vector2(w * 0.52, -hThickness * 0.45),
        new THREE.Vector2(0.0, -hThickness * 0.45),
      ];
      const capGeo = getSculptedGadroonLatheGeometry(capPts, 96, 28, 0.16, -hThickness * 1.5, -hThickness * 0.5);
      const capMesh = new THREE.Mesh(capGeo, floorMat);
      capMesh.castShadow = true;
      capMesh.receiveShadow = true;
      shelfNode.add(capMesh);

      // 4 Ionic Corner Volute Scrolls under the Abacus corners
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const volute = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.20, 14, 28), trimMat);
          volute.rotation.y = sx * sz * Math.PI * 0.25;
          volute.position.set(sx * w * 0.38, -hThickness * 0.72, sz * d * 0.38);
          shelfNode.add(volute);
        }
      }

      if (shaftH > 2) {
        const shaftMat = new THREE.MeshPhysicalMaterial({
          map: floorTex,
          color: isLightMarble ? '#e2e8f0' : '#1e293b',
          roughness: 0.26,
          clearcoat: 0.42,
        });
        // True 24-flute concave Corinthian column shaft with entasis
        const shaftGeo = getFlutedColumnShaftGeometry(w * 0.34, w * 0.39, shaftH, 24, 120, 24);
        const shaft = new THREE.Mesh(shaftGeo, shaftMat);
        shaft.position.set(0, -hThickness * 1.5 - shaftH * 0.5, 0);
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        shelfNode.add(shaft);

        const topAstragal = new THREE.Mesh(new THREE.TorusGeometry(w * 0.38, 0.26, 18, 64), trimMat);
        topAstragal.rotateX(Math.PI / 2);
        topAstragal.position.set(0, -hThickness * 1.45, 0);
        shelfNode.add(topAstragal);

        // Attic Torus-Scotia-Torus Base + Beveled Plinth + 4 Lion-Paw Scroll Feet
        const baseY = -hThickness * 1.5 - shaftH;
        const atticPts = [
          new THREE.Vector2(0.0, baseY + 0.6),
          new THREE.Vector2(w * 0.50, baseY + 0.6),
          new THREE.Vector2(w * 0.52, baseY + 1.0),
          new THREE.Vector2(w * 0.45, baseY + 1.4),
          new THREE.Vector2(w * 0.48, baseY + 1.8),
          new THREE.Vector2(w * 0.40, baseY + 2.2),
          new THREE.Vector2(0.0, baseY + 2.2),
        ];
        const atticBase = new THREE.Mesh(getSculptedGadroonLatheGeometry(atticPts, 96, 28, 0.14, baseY + 0.6, baseY + 2.1), trimMat);
        shelfNode.add(atticBase);

        const subPlinth = new THREE.Mesh(getBeveledBoxGeometry(w * 1.02, 1.1, d * 1.02, 0.85, 0.20, 5), floorMat);
        subPlinth.position.set(0, baseY + 0.55, 0);
        shelfNode.add(subPlinth);
      }
    }

    const platEntry = {
      id,
      label,
      halfW: w * 0.56,
      halfD: d * 0.65,
      minX: cx - w * 0.56,
      maxX: cx + w * 0.56,
      minZ: cz - d * 0.65,
      maxZ: cz + d * 0.65,
      surfaceY,
      centerX: cx,
      centerZ: cz,
    };
    platforms.push(platEntry);

    shelfNode.userData = {
      isPlaceableStructure: true,
      isShelfStructure: true,
      structureId: `SHELF-${id}`,
      containerStyle: 'stage_shelf',
      label: `🪵 ${label}`,
      fullLabel: `🪵 可移动/可删除展架 · ${label}`,
      platformRef: platEntry,
      freeVerticalDrag: true,
    };
    group.add(shelfNode);
    movableProps.push(shelfNode);
  };

  if (shelfLayout === 'study_side_rack') {
    // Stage 41 Anti-Clipping Open-Headroom Staggered Gallery Layout:
    // Every shelf & pedestal is horizontally staggered with 100% open vertical sky above it,
    // so NO upper board can ever slice through a 24cm-tall head's forehead or hair!
    const shelfW = Math.max(21, Math.min(26, boxW * 0.20));
    const shelfD = 26;
    const safeEdgeInset = Math.max(shelfW * 0.60, 20);
    const leftX = bounds.minX + safeEdgeInset;
    const rightX = bounds.maxX - safeEdgeInset;
    const innerLeftX = leftX * 0.56;
    const innerRightX = rightX * 0.56;
    const midY = floorSurfaceY + boxH * 0.22;
    const lowY = floorSurfaceY + 11.5;

    addShelfPlatform('shelf_left_mid', '左翼无顶遮挡伴学高台', leftX, midY, -18, shelfW, shelfD, 1.8, false);
    addShelfPlatform('shelf_right_mid', '右翼无顶遮挡伴学高台', rightX, midY, -18, shelfW, shelfD, 1.8, false);
    addShelfPlatform('shelf_left_low', '左内科林斯凹槽立柱台', innerLeftX, lowY, -34, 17, 17, 1.8, true);
    addShelfPlatform('shelf_right_low', '右内科林斯凹槽立柱台', innerRightX, lowY, -34, 17, 17, 1.8, true);
  } else if (shelfLayout === 'stepped_altar') {
    const centerY = floorSurfaceY + boxH * 0.24;
    const sideY = floorSurfaceY + boxH * 0.13;
    addShelfPlatform('altar_center_top', '中央加冕主祭坛', 0, centerY, -22, 28, 30, 2.2);
    addShelfPlatform('altar_left_step', '左翼次级展台', -boxW * 0.26, sideY, -16, 24, 28, 1.8);
    addShelfPlatform('altar_right_step', '右翼次级展台', boxW * 0.26, sideY, -16, 24, 28, 1.8);
  } else if (shelfLayout === 'corner_pedestals') {
    const colW = 19;
    const leftX = bounds.minX + 22;
    const rightX = bounds.maxX - 22;
    const innerLX = bounds.minX + 38;
    const innerRX = bounds.maxX - 38;
    addShelfPlatform('pedestal_L1', '左外立柱台', leftX, floorSurfaceY + 11, -16, colW, colW, 1.8, true);
    addShelfPlatform('pedestal_R1', '右外立柱台', rightX, floorSurfaceY + 11, -16, colW, colW, 1.8, true);
    addShelfPlatform('pedestal_L2', '左内高立柱台', innerLX, floorSurfaceY + 19, -28, colW, colW, 1.8, true);
    addShelfPlatform('pedestal_R2', '右内高立柱台', innerRX, floorSurfaceY + 19, -28, colW, colW, 1.8, true);
  } else if (shelfLayout === 'bottom_gallery') {
    const coasterPositions = [-boxW * 0.36, -boxW * 0.18, 0, boxW * 0.18, boxW * 0.36];
    for (let i = 0; i < coasterPositions.length; i++) {
      const cx = coasterPositions[i];
      const discGeo = new THREE.CylinderGeometry(8.8, 9.4, 0.5, 32);
      const disc = new THREE.Mesh(discGeo, trimMat);
      disc.position.set(cx, floorSurfaceY + 0.25, -16);
      disc.receiveShadow = true;
      group.add(disc);
    }
  }

  // Stage 28: Make every Decorative Prop on the Desk & Shelves individually draggable & deletable!
  const decorStyle = options.decorStyle || 'trophy_candles';
  if (decorStyle && decorStyle !== 'none') {
    const decorLabelMap = {
      study_tomes: '📚 状元古籍错题本摆件',
      trophy_candles: '🕯️ 祭坛红烛玫瑰摆件',
      soul_siphon: '⚡ 灵魂汲取导管摆件',
      forensic_evidence: '🏷️ 法医物证标尺摆件',
    };
    const propAnchors = [
      { x: -boxW * 0.38, y: floorSurfaceY, z: -12, scale: 0.92, rotY: 0.15 },
      { x: boxW * 0.38, y: floorSurfaceY, z: -12, scale: 0.92, rotY: -0.25 },
    ];
    let propIdx = 1;
    for (const anchor of propAnchors) {
      const propInstance = buildSpecimenDecorGroup(decorStyle, 0);
      propInstance.position.set(anchor.x, anchor.y, anchor.z);
      propInstance.scale.setScalar(anchor.scale);
      propInstance.rotation.y = anchor.rotY;
      propInstance.userData = {
        isPlaceableStructure: true,
        isDecorProp: true,
        structureId: `PROP-${propIdx++}`,
        containerStyle: `prop_${decorStyle}`,
        label: decorLabelMap[decorStyle] || '📚 书房桌面摆件',
        fullLabel: `${decorLabelMap[decorStyle] || '书房摆件'} #${propIdx - 1}`,
      };
      group.add(propInstance);
      movableProps.push(propInstance);
    }
  }

  return { stageGroup: group, group, shelves: platforms, platforms, movableProps };
}

let rainyWindowPaneTex = null;
function getRainyWindowPaneTexture() {
  if (rainyWindowPaneTex) return rainyWindowPaneTex;
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  // Deep rainy midnight sky gradient outside the study window
  const g = ctx.createLinearGradient(0, 0, 0, 512);
  g.addColorStop(0, '#070d19');
  g.addColorStop(0.55, '#0f1c32');
  g.addColorStop(1, '#192a46');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);

  // Soft distant streetlamp / campus library warm bokeh through the rain
  const bokehs = [
    [130, 340, 62, 'rgba(251, 191, 36, 0.20)'],
    [370, 310, 75, 'rgba(147, 197, 253, 0.22)'],
    [250, 390, 54, 'rgba(253, 224, 71, 0.16)'],
    [95, 210, 48, 'rgba(96, 165, 250, 0.16)'],
  ];
  for (const [bx, by, br, col] of bokehs) {
    const bg = ctx.createRadialGradient(bx, by, 2, bx, by, br);
    bg.addColorStop(0, col);
    bg.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.fill();
  }

  // Raindrop trails and condensation droplets on the window glass
  ctx.strokeStyle = 'rgba(191, 219, 254, 0.26)';
  for (let i = 0; i < 95; i++) {
    const rx = Math.random() * 512;
    const ry = Math.random() * 440;
    const rlen = 25 + Math.random() * 85;
    ctx.lineWidth = 0.8 + Math.random() * 1.4;
    ctx.beginPath();
    ctx.moveTo(rx, ry);
    ctx.bezierCurveTo(rx + 2, ry + rlen * 0.35, rx - 2, ry + rlen * 0.7, rx + 0.5, ry + rlen);
    ctx.stroke();

    // Terminal water droplet bead
    ctx.fillStyle = 'rgba(224, 242, 254, 0.48)';
    ctx.beginPath();
    ctx.arc(rx + 0.5, ry + rlen, 1.4 + Math.random() * 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  rainyWindowPaneTex = tex;
  return tex;
}

export function buildRainyStudyWindowGroup(bounds, floorSurfaceY) {
  const root = new THREE.Group();
  root.name = 'RainyStudyBackdropGroup';

  const boxW = bounds.maxX - bounds.minX;
  const boxH = bounds.maxY - bounds.minY;
  const backZ = bounds.minZ + 0.8;

  // 1. Tall Study Room Mullioned Window on the right-back wall (casting the window gobo light)
  const winW = Math.min(48, boxW * 0.42);
  const winH = Math.min(46, boxH * 0.74);
  const winX = boxW * 0.16;
  const winY = floorSurfaceY + winH * 0.52 + 4.0;

  const woodFrameMat = new THREE.MeshStandardMaterial({
    color: '#23140d',
    roughness: 0.45,
    metalness: 0.12,
  });
  const brassLatchMat = new THREE.MeshStandardMaterial({
    color: '#d4af37',
    roughness: 0.28,
    metalness: 0.85,
  });

  // Window Glass Pane with Rain Streaks & Night Sky Bokeh
  const paneMat = new THREE.MeshBasicMaterial({
    map: getRainyWindowPaneTexture(),
    transparent: true,
    opacity: 0.88,
  });
  const paneMesh = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), paneMat);
  paneMesh.position.set(winX, winY, backZ);
  root.add(paneMesh);

  // Outer Window Frame + Sill
  const frameThick = 1.5;
  const topBar = new THREE.Mesh(new THREE.BoxGeometry(winW + frameThick * 2, frameThick, 1.4), woodFrameMat);
  topBar.position.set(winX, winY + winH * 0.5, backZ + 0.4);
  const botSill = new THREE.Mesh(new THREE.BoxGeometry(winW + frameThick * 3.2, frameThick * 1.3, 2.8), woodFrameMat);
  botSill.position.set(winX, winY - winH * 0.5, backZ + 0.8);
  const leftStile = new THREE.Mesh(new THREE.BoxGeometry(frameThick, winH, 1.4), woodFrameMat);
  leftStile.position.set(winX - winW * 0.5, winY, backZ + 0.4);
  const rightStile = new THREE.Mesh(new THREE.BoxGeometry(frameThick, winH, 1.4), woodFrameMat);
  rightStile.position.set(winX + winW * 0.5, winY, backZ + 0.4);
  root.add(topBar, botSill, leftStile, rightStile);

  // Mullion Crossbars (3x3 Classic Study Window Grid)
  for (const fx of [-0.17, 0.17]) {
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.75, winH, 0.9), woodFrameMat);
    vBar.position.set(winX + winW * fx, winY, backZ + 0.35);
    root.add(vBar);
  }
  for (const fy of [-0.18, 0.18]) {
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(winW, 0.75, 0.9), woodFrameMat);
    hBar.position.set(winX, winY + winH * fy, backZ + 0.35);
    root.add(hBar);
  }
  // Brass Casement Handle
  const handle = new THREE.Mesh(new THREE.BoxGeometry(0.45, 2.4, 1.1), brassLatchMat);
  handle.position.set(winX - winW * 0.17, winY - 2.0, backZ + 0.9);
  root.add(handle);

  // 2. Animated 3D Falling Rain Streaks outside the study window
  const rainCount = 140;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 6); // 2 vertices per rain streak line
  const rainMeta = new Float32Array(rainCount * 4); // x, y, z, speed
  for (let i = 0; i < rainCount; i++) {
    const rx = winX + (Math.random() - 0.5) * (winW * 1.05);
    const ry = winY + (Math.random() - 0.5) * (winH * 0.92);
    const rz = backZ + 0.18 + Math.random() * 4.5;
    const spd = 28 + Math.random() * 22;
    rainMeta[i * 4] = rx;
    rainMeta[i * 4 + 1] = ry;
    rainMeta[i * 4 + 2] = rz;
    rainMeta[i * 4 + 3] = spd;

    const i6 = i * 6;
    rainPos[i6] = rx;
    rainPos[i6 + 1] = ry;
    rainPos[i6 + 2] = rz;
    rainPos[i6 + 3] = rx - 0.45;
    rainPos[i6 + 4] = ry - 2.8;
    rainPos[i6 + 5] = rz;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  const rainMat = new THREE.LineBasicMaterial({
    color: '#bae6fd',
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
  });
  const rainLines = new THREE.LineSegments(rainGeo, rainMat);
  rainLines.name = 'RainyWindowStreaks';
  rainLines.userData = {
    rainMeta,
    minY: winY - winH * 0.48,
    maxY: winY + winH * 0.48,
  };
  root.add(rainLines);

  // 3. Cozy Green-Shaded Brass Banker's Study Lamp + Open Study Notebook on the Left Desk Corner
  const lampGroup = new THREE.Group();
  lampGroup.name = 'BankersStudyLamp';
  lampGroup.position.set(-boxW * 0.33, floorSurfaceY, -21);
  lampGroup.rotation.y = 0.38;

  const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.8, 0.9, 28), brassLatchMat);
  lampBase.position.y = 0.45;
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.52, 11.5, 16), brassLatchMat);
  lampStem.position.y = 6.2;
  const shadeMat = new THREE.MeshPhysicalMaterial({
    color: '#065f46',
    emissive: new THREE.Color('#047857'),
    emissiveIntensity: 0.35,
    roughness: 0.18,
    clearcoat: 0.85,
  });
  const lampShade = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 3.6, 2.8, 24, 1, false, 0, Math.PI), shadeMat);
  lampShade.rotation.z = Math.PI * 0.5;
  lampShade.rotation.y = Math.PI * 0.5;
  lampShade.position.set(1.2, 11.8, 0.8);
  const bulbGlow = new THREE.Mesh(
    new THREE.SphereGeometry(1.1, 16, 12),
    new THREE.MeshBasicMaterial({ color: '#fde68a' })
  );
  bulbGlow.position.set(1.2, 11.0, 0.9);
  lampGroup.add(lampBase, lampStem, lampShade, bulbGlow);
  root.add(lampGroup);

  return root;
}

export function updateRainyStudyBackdrop(stageGroup, dt = 0.016) {
  if (!stageGroup) return;
  const rainLines = stageGroup.getObjectByName('RainyWindowStreaks');
  if (!rainLines || !rainLines.geometry?.attributes?.position) return;
  const posAttr = rainLines.geometry.attributes.position;
  const arr = posAttr.array;
  const { rainMeta, minY, maxY } = rainLines.userData;
  const spanY = maxY - minY;
  const count = rainMeta.length / 4;

  for (let i = 0; i < count; i++) {
    const m4 = i * 4;
    let ry = rainMeta[m4 + 1] - rainMeta[m4 + 3] * dt;
    if (ry < minY) ry += spanY;
    rainMeta[m4 + 1] = ry;
    const rx = rainMeta[m4];
    const rz = rainMeta[m4 + 2];

    const i6 = i * 6;
    arr[i6] = rx;
    arr[i6 + 1] = ry;
    arr[i6 + 2] = rz;
    arr[i6 + 3] = rx - 0.42;
    arr[i6 + 4] = ry - 2.7;
    arr[i6 + 5] = rz;
  }
  posAttr.needsUpdate = true;
}

/**
 * Builds a 3D Specimen Container / Pedestal Holder around a Collectible Head
 * (`glass_bell_jar`, `velvet_chalice`, `formalin_cylinder`, `acrylic_cube`, `surgical_tray`, `none`).
 * Local coordinates match `buildCollectibleHeadNode` where neck cut is at `y ≈ -12.4` and crown is at `y ≈ +12.5`.
 */
let engravedPlaqueTex = null;
function getEngravedPlaqueTexture() {
  if (engravedPlaqueTex) return engravedPlaqueTex;
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 256, 64);
  g.addColorStop(0, '#b48a28');
  g.addColorStop(0.5, '#f3d078');
  g.addColorStop(1, '#9e761e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 64);
  ctx.strokeStyle = '#3b2806';
  ctx.lineWidth = 4;
  ctx.strokeRect(4, 4, 248, 56);
  ctx.fillStyle = '#261802';
  ctx.font = 'bold 16px serif';
  ctx.textAlign = 'center';
  ctx.fillText('CERVIX · ARCHIVE', 128, 28);
  ctx.font = '11px monospace';
  ctx.fillText('SPECIMEN COLLECTION', 128, 48);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  engravedPlaqueTex = tex;
  return tex;
}

export function buildSpecimenContainerGroup(containerStyle = 'glass_bell_jar') {
  const group = new THREE.Group();
  group.name = 'SpecimenContainerGroup';
  group.userData.containerStyle = containerStyle;

  if (!containerStyle || containerStyle === 'none') {
    group.userData.baseBottomOffset = -12.6;
    return group;
  }

  const brassMat = new THREE.MeshStandardMaterial({
    color: '#c9a23f',
    roughness: 0.26,
    metalness: 0.84,
  });
  const plaqueMat = new THREE.MeshStandardMaterial({
    map: getEngravedPlaqueTexture(),
    roughness: 0.28,
    metalness: 0.78,
  });
  const obsidianMat = new THREE.MeshPhysicalMaterial({
    map: getFloorTexture('dark_obsidian'),
    color: '#182234',
    roughness: 0.22,
    metalness: 0.14,
    clearcoat: 0.55,
    clearcoatRoughness: 0.20,
  });
  const walnutCarvedMat = new THREE.MeshPhysicalMaterial({
    map: getFloorTexture('walnut_desk'),
    color: '#3a1f14',
    roughness: 0.30,
    clearcoat: 0.42,
    clearcoatRoughness: 0.24,
  });
  const velvetMat = new THREE.MeshPhysicalMaterial({
    color: '#4c0b18',
    roughness: 0.88,
    metalness: 0.0,
    sheen: 0.92,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color('#f43f5e'),
  });
  // Ultra-clean museum crystal glass: never milky or overly bright!
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#e2f1ff',
    transparent: true,
    opacity: 0.085,
    roughness: 0.06,
    metalness: 0.0,
    clearcoat: 0.42,
    clearcoatRoughness: 0.05,
    specularIntensity: 0.45,
    ior: 1.48,
    envMapIntensity: 0.32,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  if (containerStyle === 'glass_bell_jar') {
    // 1. 96-Segment Gadrooned Victorian Ebony & Brass Ogee Plinth Base (y = -15.6 .. -12.4)
    const baseProfile = [
      new THREE.Vector2(0.0, -15.5),
      new THREE.Vector2(11.9, -15.5),
      new THREE.Vector2(12.2, -15.0),
      new THREE.Vector2(11.4, -14.5),
      new THREE.Vector2(11.6, -13.9),
      new THREE.Vector2(10.6, -13.4),
      new THREE.Vector2(10.3, -12.9),
      new THREE.Vector2(9.2, -12.6),
      new THREE.Vector2(0.0, -12.6),
    ];
    const basePlinth = new THREE.Mesh(
      getSculptedGadroonLatheGeometry(baseProfile, 96, 36, 0.18, -15.1, -13.3),
      obsidianMat
    );
    basePlinth.position.set(0, 0, -0.5);
    basePlinth.castShadow = true;
    basePlinth.receiveShadow = true;
    group.add(basePlinth);

    // 4 High-Poly Baroque Lion-Paw & Acanthus Scroll Feet under the Victorian Base
    for (let i = 0; i < 4; i++) {
      const a = (i + 0.5) * Math.PI * 0.5;
      const foot = buildBaroqueScrollFoot(brassMat, 1.05);
      foot.position.set(Math.cos(a) * 10.6, -15.6, -0.5 + Math.sin(a) * 10.6);
      foot.rotation.y = -a + Math.PI * 0.5;
      group.add(foot);
    }

    // Precision Turned Brass Gallery Rim & 24 Hourglass Victorian Balusters
    const galleryRing = new THREE.Mesh(new THREE.TorusGeometry(9.85, 0.24, 20, 80), brassMat);
    galleryRing.rotateX(Math.PI / 2);
    galleryRing.position.set(0, -12.55, -0.5);
    group.add(galleryRing);

    const lowerRing = new THREE.Mesh(new THREE.TorusGeometry(10.85, 0.20, 18, 80), brassMat);
    lowerRing.rotateX(Math.PI / 2);
    lowerRing.position.set(0, -13.5, -0.5);
    group.add(lowerRing);

    const balGeo = getVictorianBalusterGeometry();
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const bal = new THREE.Mesh(balGeo, brassMat);
      bal.scale.set(0.75, 1.05, 0.75);
      bal.position.set(Math.cos(a) * 9.85, -13.05, -0.5 + Math.sin(a) * 9.85);
      group.add(bal);
    }

    // High-Poly Radially Pleated & Button-Tufted Burgundy Velvet Cushion
    group.add(buildHighPolyTuftedVelvetCushion(8.15, 8.75, 0.78, -12.45, velvetMat, brassMat));

    // Ornate Beveled Brass Museum Cartouche Plaque + 4 Corner Rivets on Front
    const plate = new THREE.Mesh(getBeveledBoxGeometry(6.2, 1.4, 0.45, 0.28, 0.10, 4), plaqueMat);
    plate.position.set(0, -14.25, 11.2);
    group.add(plate);
    for (const [rx, ry] of [[-2.6, 0.42], [2.6, 0.42], [-2.6, -0.42], [2.6, -0.42]]) {
      const riv = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), brassMat);
      riv.position.set(rx, -14.25 + ry, 11.42);
      group.add(riv);
    }

    // 2. 96-Segment Blown Crystal Bell Jar Dome + Multi-Tiered Baroque Imperial Crown Finial
    const bellProfile = [];
    for (let i = 0; i <= 36; i++) {
      const t = i / 36;
      if (t < 0.62) {
        const y = -12.8 + (t / 0.62) * 18.2;
        bellProfile.push(new THREE.Vector2(9.95, y));
      } else {
        const u = (t - 0.62) / 0.38;
        const ang = u * Math.PI * 0.5;
        bellProfile.push(new THREE.Vector2(Math.cos(ang) * 9.95, 5.4 + Math.sin(ang) * 9.8));
      }
    }
    const bellDome = new THREE.Mesh(new THREE.LatheGeometry(bellProfile, 96), glassMat);
    bellDome.position.set(0, 0, -0.5);
    group.add(bellDome);

    // Subtle Brass Rim Band & 4 Decorative Brass Bezel Clasps at Bottom of Glass Bell
    const glassRim = new THREE.Mesh(new THREE.TorusGeometry(9.96, 0.20, 16, 80), brassMat);
    glassRim.rotateX(Math.PI / 2);
    glassRim.position.set(0, -12.75, -0.5);
    group.add(glassRim);

    // Ornate Gadrooned Brass Imperial Spire Finial on Top of Dome
    const finialPts = [
      new THREE.Vector2(0.0, 15.0),
      new THREE.Vector2(1.85, 15.0),
      new THREE.Vector2(1.45, 15.3),
      new THREE.Vector2(0.75, 15.7),
      new THREE.Vector2(1.15, 16.3),
      new THREE.Vector2(0.55, 16.9),
      new THREE.Vector2(0.70, 17.3),
      new THREE.Vector2(0.18, 17.9),
      new THREE.Vector2(0.0, 18.4),
    ];
    const finial = new THREE.Mesh(
      getSculptedGadroonLatheGeometry(finialPts, 64, 20, 0.10, 15.1, 17.5),
      brassMat
    );
    finial.position.set(0, 0, -0.5);
    group.add(finial);

    group.userData.baseBottomOffset = -15.6;
  } else if (containerStyle === 'velvet_chalice') {
    // 1. Beveled Octagonal Sub-Plinth + 96-Segment Gadrooned & Spiral-Fluted Baroque Chalice (~6,400 tris)
    const subPlinth = new THREE.Mesh(getBeveledBoxGeometry(18.6, 1.0, 18.6, 2.2, 0.22, 5), obsidianMat);
    subPlinth.position.set(0, -15.6, -0.5);
    subPlinth.castShadow = true;
    subPlinth.receiveShadow = true;
    group.add(subPlinth);

    const chalicePts = [
      new THREE.Vector2(0.0, -15.2),
      new THREE.Vector2(9.8, -15.2),
      new THREE.Vector2(10.1, -14.8),
      new THREE.Vector2(8.4, -14.4),
      new THREE.Vector2(4.8, -14.0),
      new THREE.Vector2(2.8, -13.6),
      new THREE.Vector2(4.4, -13.1),
      new THREE.Vector2(2.7, -12.6),
      new THREE.Vector2(6.2, -12.2),
      new THREE.Vector2(9.1, -11.9),
      new THREE.Vector2(9.3, -11.65),
      new THREE.Vector2(0.0, -11.65),
    ];
    const chaliceBody = new THREE.Mesh(
      getSculptedGadroonLatheGeometry(chalicePts, 96, 32, 0.22, -15.1, -11.7, 1.2),
      obsidianMat
    );
    chaliceBody.position.set(0, 0, -0.5);
    chaliceBody.castShadow = true;
    chaliceBody.receiveShadow = true;
    group.add(chaliceBody);

    // 4 Sculpted Baroque S-Scroll Flying-Buttress Handles around the Chalice Stem
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const handleCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(Math.cos(a) * 8.6, -12.0, -0.5 + Math.sin(a) * 8.6),
        new THREE.Vector3(Math.cos(a) * 9.8, -12.8, -0.5 + Math.sin(a) * 9.8),
        new THREE.Vector3(Math.cos(a) * 6.5, -13.6, -0.5 + Math.sin(a) * 6.5),
        new THREE.Vector3(Math.cos(a) * 8.8, -14.8, -0.5 + Math.sin(a) * 8.8),
      ]);
      const hTube = new THREE.Mesh(new THREE.TubeGeometry(handleCurve, 28, 0.26, 14, false), brassMat);
      group.add(hTube);
    }

    const knopRing = new THREE.Mesh(new THREE.TorusGeometry(4.45, 0.34, 20, 64), brassMat);
    knopRing.rotateX(Math.PI / 2);
    knopRing.position.set(0, -13.1, -0.5);
    group.add(knopRing);

    const footRing = new THREE.Mesh(new THREE.TorusGeometry(9.7, 0.28, 20, 80), brassMat);
    footRing.rotateX(Math.PI / 2);
    footRing.position.set(0, -14.9, -0.5);
    group.add(footRing);

    // High-Poly Radially Pleated & Button-Tufted Velvet Cushion
    group.add(buildHighPolyTuftedVelvetCushion(8.35, 8.75, 0.82, -11.65, velvetMat, brassMat));

    const goldRim = new THREE.Mesh(new THREE.TorusGeometry(9.15, 0.30, 20, 80), brassMat);
    goldRim.rotateX(Math.PI / 2);
    goldRim.position.set(0, -11.75, -0.5);
    group.add(goldRim);

    // 24 Baroque Brass Stud Pearls around the Chalice Crown
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), brassMat);
      pearl.position.set(Math.cos(a) * 9.35, -11.75, -0.5 + Math.sin(a) * 9.35);
      group.add(pearl);
    }

    group.userData.baseBottomOffset = -16.0;
  } else if (containerStyle === 'formalin_cylinder') {
    // High-Poly Anatomical Autoclave Formalin Chamber with 8 Fluted Tie-Columns, Bourdon Pressure Gauge & 6-Spoke Handwheel
    const steelMat = new THREE.MeshStandardMaterial({
      color: '#64748b',
      roughness: 0.24,
      metalness: 0.88,
    });
    const bottomPts = [
      new THREE.Vector2(0.0, -15.5),
      new THREE.Vector2(11.6, -15.5),
      new THREE.Vector2(11.8, -14.9),
      new THREE.Vector2(11.2, -14.5),
      new THREE.Vector2(11.5, -14.1),
      new THREE.Vector2(10.7, -13.6),
      new THREE.Vector2(10.7, -13.1),
      new THREE.Vector2(0.0, -13.1),
    ];
    const bottomCap = new THREE.Mesh(
      getSculptedGadroonLatheGeometry(bottomPts, 96, 36, 0.14, -15.2, -13.5),
      steelMat
    );
    bottomCap.position.set(0, 0, -0.5);
    bottomCap.castShadow = true;
    bottomCap.receiveShadow = true;
    group.add(bottomCap);

    // Internal Machined Specimen Neck Cradle Pedestal inside the Tank
    group.add(buildHighPolyTuftedVelvetCushion(7.8, 8.2, 0.68, -12.6, velvetMat, brassMat));

    // 16 Brass Hex Bolts & 8 External Fluted Tie-Rods with Turnbuckles around the Formalin Cylinder
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      const boltB = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.52, 6), brassMat);
      boltB.position.set(Math.cos(a) * 11.05, -14.2, -0.5 + Math.sin(a) * 11.05);
      group.add(boltB);

      const boltT = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.52, 6), brassMat);
      boltT.position.set(Math.cos(a) * 11.05, 16.5, -0.5 + Math.sin(a) * 11.05);
      group.add(boltT);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i + 0.5) * Math.PI * 0.25;
      const rx = Math.cos(a) * 10.92;
      const rz = -0.5 + Math.sin(a) * 10.92;
      const tieRod = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 30.8, 16), brassMat);
      tieRod.position.set(rx, 1.0, rz);
      group.add(tieRod);

      const turnbuckle = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 2.2, 6), steelMat);
      turnbuckle.position.set(rx, -6.5, rz);
      group.add(turnbuckle);
    }

    // 3D Bourdon Pressure Gauge & Helical Copper Siphon Tube on Front-Right
    const gaugePipeCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(8.5, -13.8, 7.2),
      new THREE.Vector3(9.8, -13.2, 8.4),
      new THREE.Vector3(10.2, -12.2, 8.8),
      new THREE.Vector3(9.6, -11.4, 8.6),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(gaugePipeCurve, 24, 0.16, 12, false), brassMat));
    const gaugeBody = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.65, 32), brassMat);
    gaugeBody.rotation.x = Math.PI * 0.5;
    gaugeBody.rotation.z = -0.35;
    gaugeBody.position.set(9.6, -11.1, 8.75);
    group.add(gaugeBody);

    const plate = new THREE.Mesh(getBeveledBoxGeometry(5.8, 1.35, 0.42, 0.25, 0.10, 4), plaqueMat);
    plate.position.set(0, -14.35, 11.45);
    group.add(plate);

    // Subtle Amber Formalin Glass Cylinder with Graduation Scale
    const formalinGlassMat = new THREE.MeshPhysicalMaterial({
      color: '#fde68a',
      map: getFormalinGradTexture(),
      transparent: true,
      opacity: 0.12,
      roughness: 0.08,
      clearcoat: 0.40,
      ior: 1.46,
      envMapIntensity: 0.30,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(10.2, 10.2, 28.5, 96, 1, true), formalinGlassMat);
    tank.position.set(0, 0.8, -0.5);
    group.add(tank);

    const meniscusMat = new THREE.MeshBasicMaterial({
      color: '#fcd34d',
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const meniscus = new THREE.Mesh(new THREE.RingGeometry(0.6, 10.1, 64), meniscusMat);
    meniscus.rotateX(-Math.PI / 2);
    meniscus.position.set(0, 13.6, -0.5);
    group.add(meniscus);

    // Top Machined Autoclave Dome Lid + 6-Spoke Brass Valve Handwheel
    const topLidPts = [
      new THREE.Vector2(0.0, 14.8),
      new THREE.Vector2(10.7, 14.8),
      new THREE.Vector2(11.5, 15.2),
      new THREE.Vector2(11.5, 15.9),
      new THREE.Vector2(9.6, 16.4),
      new THREE.Vector2(4.2, 16.8),
      new THREE.Vector2(0.0, 16.9),
    ];
    const topLid = new THREE.Mesh(new THREE.LatheGeometry(topLidPts, 96), steelMat);
    topLid.position.set(0, 0, -0.5);
    group.add(topLid);

    const valveWheel = new THREE.Mesh(new THREE.TorusGeometry(2.8, 0.34, 18, 64), brassMat);
    valveWheel.rotateX(Math.PI / 2);
    valveWheel.position.set(0, 17.6, -0.5);
    group.add(valveWheel);

    for (let s = 0; s < 6; s++) {
      const a = (s / 6) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.7, 12), brassMat);
      spoke.rotation.z = Math.PI * 0.5;
      spoke.rotation.y = a;
      spoke.position.set(Math.cos(a) * 1.35, 17.6, -0.5 + Math.sin(a) * 1.35);
      group.add(spoke);
    }

    const valveStem = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.68, 1.5, 24), brassMat);
    valveStem.position.set(0, 17.0, -0.5);
    group.add(valveStem);

    group.userData.baseBottomOffset = -15.5;
  } else if (containerStyle === 'acrylic_cube') {
    // High-Poly Louvre Architectural Vitrine Case with Stepped Beveled Ogee Plinth & 4 Fluted Corner Columns
    const plinthBottom = new THREE.Mesh(getBeveledBoxGeometry(22.4, 1.5, 22.4, 1.1, 0.28, 6), obsidianMat);
    plinthBottom.position.set(0, -14.9, -0.5);
    plinthBottom.castShadow = true;
    plinthBottom.receiveShadow = true;
    group.add(plinthBottom);

    const brassMolding = new THREE.Mesh(getBeveledBoxGeometry(21.4, 0.48, 21.4, 0.95, 0.14, 5), brassMat);
    brassMolding.position.set(0, -14.1, -0.5);
    group.add(brassMolding);

    const plinthStep = new THREE.Mesh(getBeveledBoxGeometry(20.6, 1.35, 20.6, 0.85, 0.24, 6), obsidianMat);
    plinthStep.position.set(0, -13.45, -0.5);
    plinthStep.receiveShadow = true;
    group.add(plinthStep);

    // High-Poly Radially Pleated & Button-Tufted Velvet Cushion
    group.add(buildHighPolyTuftedVelvetCushion(8.1, 8.6, 0.72, -12.55, velvetMat, brassMat));

    const plate = new THREE.Mesh(getBeveledBoxGeometry(6.2, 1.35, 0.42, 0.24, 0.10, 4), plaqueMat);
    plate.position.set(0, -14.15, 11.15);
    group.add(plate);

    // Warm Museum Uplight Ring
    const ledGeo = new THREE.RingGeometry(6.2, 6.9, 64);
    ledGeo.rotateX(-Math.PI / 2);
    const ledMat = new THREE.MeshBasicMaterial({
      color: '#fde68a',
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
    });
    const ledRing = new THREE.Mesh(ledGeo, ledMat);
    ledRing.position.set(0, -12.72, -0.5);
    group.add(ledRing);

    const boxGlass = new THREE.Mesh(new THREE.BoxGeometry(19.6, 28.2, 19.6), glassMat);
    boxGlass.position.set(0, 1.1, -0.5);
    group.add(boxGlass);

    // Top Beveled Cornice Frame + 4 Fluted Corner Pillars with Corinthian Capitals & Spire Finials
    const topCapFrame = new THREE.Mesh(getBeveledBoxGeometry(20.8, 0.75, 20.8, 0.8, 0.18, 5), brassMat);
    topCapFrame.position.set(0, 15.35, -0.5);
    group.add(topCapFrame);

    const cornerColGeo = getFlutedColumnShaftGeometry(0.42, 0.46, 28.4, 16, 48, 12);
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const post = new THREE.Mesh(cornerColGeo, brassMat);
        post.position.set(sx * 9.85, 1.1, -0.5 + sz * 9.85);
        group.add(post);

        const cornerFinial = new THREE.Mesh(new THREE.SphereGeometry(0.68, 20, 16), brassMat);
        cornerFinial.scale.set(1.0, 1.35, 1.0);
        cornerFinial.position.set(sx * 9.85, 16.15, -0.5 + sz * 9.85);
        group.add(cornerFinial);
      }
    }

    group.userData.baseBottomOffset = -15.6;
  } else if (containerStyle === 'surgical_tray') {
    // High-Poly Medical Dissection Basin with Rolled Rim, Drainage Channels, Brass Handles & 3D Scalpel/Forceps
    const steelTrayMat = new THREE.MeshStandardMaterial({
      map: getFloorTexture('surgical_steel'),
      color: '#cbd5e1',
      roughness: 0.22,
      metalness: 0.88,
    });
    const trayPts = [
      new THREE.Vector2(0.0, -14.25),
      new THREE.Vector2(9.2, -14.25),
      new THREE.Vector2(9.8, -13.9),
      new THREE.Vector2(10.8, -12.7),
      new THREE.Vector2(11.3, -12.45),
      new THREE.Vector2(10.6, -12.35),
      new THREE.Vector2(9.0, -13.2),
      new THREE.Vector2(0.0, -13.2),
    ];
    const trayMesh = new THREE.Mesh(
      getSculptedGadroonLatheGeometry(trayPts, 96, 36, 0.08, -14.1, -12.6),
      steelTrayMat
    );
    trayMesh.position.set(0, 0, -0.5);
    trayMesh.castShadow = true;
    trayMesh.receiveShadow = true;
    group.add(trayMesh);

    const trayRim = new THREE.Mesh(new THREE.TorusGeometry(10.95, 0.38, 20, 80), steelTrayMat);
    trayRim.rotateX(Math.PI / 2);
    trayRim.position.set(0, -12.45, -0.5);
    group.add(trayRim);

    // Side Sculpted Brass Carrying Handles with Mounting Bosses
    for (const side of [-1, 1]) {
      const hCurve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(side * 10.6, -12.6, -2.2),
        new THREE.Vector3(side * 12.2, -12.4, -1.4),
        new THREE.Vector3(side * 12.2, -12.4, 0.4),
        new THREE.Vector3(side * 10.6, -12.6, 1.2),
      ]);
      group.add(new THREE.Mesh(new THREE.TubeGeometry(hCurve, 24, 0.24, 14, false), brassMat));
    }

    // 3D Surgical Scalpel & Ringed Hemostat Forceps resting on the front-right rim
    const scalpelHandle = new THREE.Mesh(getBeveledBoxGeometry(3.2, 0.16, 0.36, 0.08, 0.04, 3), brassMat);
    scalpelHandle.position.set(7.6, -12.12, 6.2);
    scalpelHandle.rotation.y = -0.55;
    group.add(scalpelHandle);
    const scalpelBlade = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.45, 12), steelTrayMat);
    scalpelBlade.rotation.z = Math.PI * 0.5;
    scalpelBlade.rotation.y = -0.55;
    scalpelBlade.position.set(6.1, -12.12, 7.1);
    group.add(scalpelBlade);

    const bloodPadMat = new THREE.MeshPhysicalMaterial({
      color: '#4c0519',
      roughness: 0.16,
      clearcoat: 0.88,
      clearcoatRoughness: 0.08,
    });
    const bloodPool = new THREE.Mesh(new THREE.CylinderGeometry(8.0, 8.4, 0.48, 64), bloodPadMat);
    bloodPool.position.set(0, -12.9, -0.5);
    group.add(bloodPool);

    group.userData.baseBottomOffset = -14.25;
  } else if (containerStyle === 'guillotine_plinth') {
    // High-Poly 1793 Carved Dark Walnut Executioner's Plinth + Two-Piece Wooden Lunette Stock + Twin Lion-Ring Handles
    const plinthBase = new THREE.Mesh(getBeveledBoxGeometry(21.2, 1.35, 21.2, 1.0, 0.28, 6), walnutCarvedMat);
    plinthBase.position.set(0, -15.0, -0.5);
    plinthBase.castShadow = true;
    plinthBase.receiveShadow = true;
    group.add(plinthBase);

    const brassTrim = new THREE.Mesh(getBeveledBoxGeometry(20.2, 0.48, 20.2, 0.9, 0.14, 5), brassMat);
    brassTrim.position.set(0, -14.3, -0.5);
    group.add(brassTrim);

    const plinthBody = new THREE.Mesh(getBeveledBoxGeometry(19.2, 2.2, 19.2, 0.85, 0.26, 6), walnutCarvedMat);
    plinthBody.position.set(0, -13.4, -0.5);
    plinthBody.castShadow = true;
    plinthBody.receiveShadow = true;
    group.add(plinthBody);

    // Carved Wooden Lunette Neck Stock Collar + Brass Hinge Straps & Wing-Nuts
    const topBevelRing = new THREE.Mesh(new THREE.TorusGeometry(8.4, 0.34, 20, 80), brassMat);
    topBevelRing.rotateX(Math.PI / 2);
    topBevelRing.position.set(0, -12.25, -0.5);
    group.add(topBevelRing);

    group.add(buildHighPolyTuftedVelvetCushion(7.9, 8.3, 0.72, -12.35, velvetMat, brassMat));

    // Twin Sculpted Lion-Head Brass Drop-Ring Handles on Left & Right Sides
    for (const side of [-1, 1]) {
      const lionBoss = new THREE.Mesh(new THREE.SphereGeometry(0.78, 20, 16), brassMat);
      lionBoss.scale.set(0.65, 1.0, 1.0);
      lionBoss.position.set(side * 9.65, -13.35, -0.5);
      group.add(lionBoss);

      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.22, 16, 40), brassMat);
      ring.rotation.y = Math.PI * 0.5;
      ring.position.set(side * 9.95, -13.85, -0.5);
      group.add(ring);
    }

    const plaque = new THREE.Mesh(getBeveledBoxGeometry(7.0, 1.4, 0.45, 0.26, 0.10, 4), plaqueMat);
    plaque.position.set(0, -13.45, 9.65);
    group.add(plaque);

    group.userData.baseBottomOffset = -15.6;
  } else {
    group.userData.baseBottomOffset = -12.6;
  }

  return group;
}

/**
 * Stage 27 · Builds an Independent, Placeable, Draggable 3D Specimen Container Structure (`可放置的头颅收纳建筑`).
 * Unlike old containers that were bound to character heads, these are standalone architectural objects
 * placed on the desk/shelves. Any severed head dropped near a structure magnetically snaps onto its neck socket,
 * and can be lifted right back out at any time!
 */
export function buildPlaceableContainerStructure(containerStyle = 'glass_bell_jar', structureId = '') {
  const root = new THREE.Group();
  root.name = `PlacedContainerStructure_${structureId}`;
  const catItem = CONTAINER_STYLE_CATALOG.find((c) => c.id === containerStyle) || CONTAINER_STYLE_CATALOG[0];

  const inner = buildSpecimenContainerGroup(containerStyle);
  const bottomOffset = inner.userData.baseBottomOffset ?? -15.4;
  // Shift inner group so the bottom of the container rests flush at local Y = 0!
  const shiftY = -bottomOffset;
  inner.position.y = shiftY;
  root.add(inner);

  // Separate glass/cover meshes so they can lift slightly when empty and seal shut when a head is placed inside
  const coverMeshes = [];
  inner.traverse((obj) => {
    if (!obj.isMesh) return;
    obj.userData.parentStructureId = structureId;
    obj.userData.isContainerStructureMesh = true;
    // Any mesh centered above local y = -8 in `inner` (the glass dome, tank wall, lid, finial) is part of the cover
    if (obj.position.y > -9.5) {
      obj.userData.baseLocalY = obj.position.y;
      if (obj.material && obj.material.transparent) {
        obj.userData.baseOpacity = obj.material.opacity;
      }
      coverMeshes.push(obj);
    }
  });

  // Add a subtle glowing Neck Socket Target Ring on the cushion when empty
  const socketRingGeo = new THREE.RingGeometry(5.2, 6.1, 48);
  socketRingGeo.rotateX(-Math.PI / 2);
  const socketRingMat = new THREE.MeshBasicMaterial({
    color: '#fbbf24',
    transparent: true,
    opacity: 0.55,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const socketRing = new THREE.Mesh(socketRingGeo, socketRingMat);
  // Cushion top in world-relative structure coords is around shiftY - 12.2
  const cushionSurfaceY = Math.max(1.4, shiftY - 12.1);
  socketRing.position.set(0, cushionSurfaceY + 0.08, -0.5);
  socketRing.userData.parentStructureId = structureId;
  root.add(socketRing);

  // Where a snapped severed head's rootGroup origin should sit relative to the structure's Y=0 base:
  // A severed head's C4/C5 neck cut sits at `head.y - 10.8`. To rest on `cushionSurfaceY`, `head.y = cushionSurfaceY + 10.8`.
  const headSocketLocalY = cushionSurfaceY + 10.75;

  root.userData = {
    structureId,
    containerStyle,
    label: catItem.shortLabel || '收纳座',
    fullLabel: catItem.label,
    isContainerStructure: true,
    baseBottomOffset: 0,
    cushionSurfaceY,
    headSocketLocalY,
    snapRadius: catItem.snapRadius || 14.5,
    coverMeshes,
    socketRing,
    occupiedByPetId: null,
  };

  updateContainerStructureState(root, false);
  return root;
}

export function updateContainerStructureState(structureRoot, isOccupied = false) {
  if (!structureRoot || !structureRoot.userData) return;
  const { coverMeshes = [], socketRing } = structureRoot.userData;
  if (socketRing) {
    socketRing.visible = !isOccupied;
  }
  for (const m of coverMeshes) {
    if (typeof m.userData.baseLocalY === 'number') {
      // When empty, glass cover sits slightly raised (+1.6 cm) & airy; when occupied, seals tightly over the severed head
      m.position.y = m.userData.baseLocalY + (isOccupied ? 0.0 : 1.6);
    }
    if (m.material && typeof m.userData.baseOpacity === 'number') {
      m.material.opacity = isOccupied ? m.userData.baseOpacity : m.userData.baseOpacity * 0.72;
    }
  }
}

/**
 * Builds 3D Decorative Props around a Specimen Container (`trophy_candles`, `study_tomes`, `soul_siphon`, `forensic_evidence`, `none`).
 * Positioned relative to `y = baseBottomOffset` so props sit directly on the floor/shelf beside the container!
 */
export function buildSpecimenDecorGroup(decorStyle = 'trophy_candles', baseBottomY = -15.4) {
  const group = new THREE.Group();
  group.name = 'SpecimenDecorGroup';
  group.userData.decorStyle = decorStyle;
  if (!decorStyle || decorStyle === 'none') return group;

  const y0 = baseBottomY;

  if (decorStyle === 'trophy_candles') {
    // High-Poly Baroque Candelabras with Gadrooned Bases, S-Scroll Arms, Wax Drips & 3D Blooming Roses
    const waxMat = new THREE.MeshPhysicalMaterial({
      color: '#fef3c7',
      roughness: 0.36,
      metalness: 0.0,
      clearcoat: 0.28,
      transmission: 0.12,
    });
    const flameMat = new THREE.MeshBasicMaterial({ color: '#fde047' });
    const glowMat = new THREE.MeshBasicMaterial({
      color: '#f59e0b',
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });
    const holderMat = new THREE.MeshStandardMaterial({
      color: '#d4af37',
      roughness: 0.24,
      metalness: 0.88,
    });
    const petalMat = new THREE.MeshPhysicalMaterial({
      color: '#881337',
      roughness: 0.48,
      sheen: 0.85,
      sheenColor: new THREE.Color('#f43f5e'),
      side: THREE.DoubleSide,
    });
    const stemMat = new THREE.MeshStandardMaterial({ color: '#14532d', roughness: 0.65 });

    const candleConfigs = [
      { x: -12.4, z: 3.4, h: 5.4, r: 1.05 },
      { x: 12.2, z: 2.8, h: 4.1, r: 0.96 },
    ];
    for (const c of candleConfigs) {
      // Multi-tiered gadrooned Baroque candlestick base + drip bobeche
      const holderPts = [
        new THREE.Vector2(0.0, 0.0),
        new THREE.Vector2(c.r * 1.95, 0.0),
        new THREE.Vector2(c.r * 1.75, 0.35),
        new THREE.Vector2(c.r * 0.65, 0.72),
        new THREE.Vector2(c.r * 1.05, 1.05),
        new THREE.Vector2(c.r * 0.58, 1.35),
        new THREE.Vector2(c.r * 1.55, 1.65),
        new THREE.Vector2(c.r * 1.25, 1.85),
        new THREE.Vector2(0.0, 1.85),
      ];
      const holder = new THREE.Mesh(
        getSculptedGadroonLatheGeometry(holderPts, 48, 20, 0.08, 0.0, 1.8),
        holderMat
      );
      holder.position.set(c.x, y0, c.z);
      holder.castShadow = true;
      group.add(holder);

      // High-poly candle shaft with sculpted wax drip rivulets
      const candleGeo = new THREE.CylinderGeometry(c.r * 0.90, c.r, c.h, 36, 12);
      const cPos = candleGeo.attributes.position;
      for (let i = 0; i < cPos.count; i++) {
        const vx = cPos.getX(i);
        const vy = cPos.getY(i);
        const vz = cPos.getZ(i);
        const ang = Math.atan2(vz, vx);
        const drip = Math.max(0, Math.sin(ang * 5.0 + vy * 1.2)) * 0.08 * ((vy + c.h * 0.5) / c.h);
        const r0 = Math.hypot(vx, vz);
        if (r0 > 0.1) {
          cPos.setX(i, (vx / r0) * (r0 + drip));
          cPos.setZ(i, (vz / r0) * (r0 + drip));
        }
      }
      candleGeo.computeVertexNormals();
      const candle = new THREE.Mesh(candleGeo, waxMat);
      candle.position.set(c.x, y0 + 1.75 + c.h * 0.5, c.z);
      candle.castShadow = true;
      group.add(candle);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.45, 20), flameMat);
      flame.position.set(c.x, y0 + 1.75 + c.h + 0.72, c.z);
      group.add(flame);

      const halo = new THREE.Mesh(new THREE.SphereGeometry(1.4, 20, 16), glowMat);
      halo.position.set(c.x, y0 + 1.75 + c.h + 0.72, c.z);
      group.add(halo);
    }

    // 4 High-Poly 3D Multi-Petal Blooming Crimson Roses around the front
    const roseCoords = [
      [-6.8, 9.6, 0.3, 1.15],
      [-2.8, 11.0, -0.4, 0.95],
      [3.2, 10.6, 0.8, 1.10],
      [7.6, 9.2, -0.6, 1.00],
    ];
    for (const [rx, rz, rot, sc] of roseCoords) {
      const rose = buildHighPoly3DRose(petalMat, stemMat);
      rose.position.set(rx, y0 + 0.05, rz);
      rose.rotation.y = rot;
      rose.scale.setScalar(sc);
      group.add(rose);
    }
  } else if (decorStyle === 'study_tomes') {
    // High-Poly Beveled Leather-Bound Grimoires with Raised Spine Bands, Brass Corners, Inkwell & Feather Quill + Open Pocket Watch
    const bookColors = ['#451a03', '#1e1b4b', '#3f1d28'];
    const pageMat = new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.65 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#d4af37', roughness: 0.24, metalness: 0.88 });
    const ribbonMat = new THREE.MeshStandardMaterial({ color: '#9f1239', roughness: 0.5 });

    for (let i = 0; i < 3; i++) {
      const bw = 6.4 - i * 0.4;
      const bd = 8.6 - i * 0.4;
      const bh = 1.42;
      const bookGroup = new THREE.Group();
      bookGroup.position.set(-13.4, y0 + bh * (i + 0.5), 1.5);
      bookGroup.rotation.y = 0.18 - i * 0.14;

      const coverMat = new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.48 });
      const cover = new THREE.Mesh(getBeveledBoxGeometry(bw, bh, bd, 0.32, 0.12, 4), coverMat);
      cover.castShadow = true;
      bookGroup.add(cover);

      const pages = new THREE.Mesh(getBeveledBoxGeometry(bw * 0.93, bh * 0.78, bd * 0.94, 0.20, 0.06, 3), pageMat);
      pages.position.x = 0.18;
      bookGroup.add(pages);

      // 5 Raised Gold Spine Ribs along the left spine of each grimoire
      for (let r = -2; r <= 2; r++) {
        const rib = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, bh * 0.96, 14), goldMat);
        rib.position.set(-bw * 0.49, 0, r * (bd * 0.16));
        bookGroup.add(rib);
      }

      // 4 Brass Corner Protectors
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const corner = new THREE.Mesh(getBeveledBoxGeometry(0.65, bh * 1.03, 0.65, 0.08, 0.04, 3), goldMat);
          corner.position.set(sx * (bw * 0.46), 0, sz * (bd * 0.46));
          bookGroup.add(corner);
        }
      }
      group.add(bookGroup);
    }

    // Ornate Brass Inkwell + Sculpted Feather Quill on Top of the Book Stack
    const inkwellPts = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(1.15, 0.0),
      new THREE.Vector2(1.25, 0.35),
      new THREE.Vector2(0.85, 0.95),
      new THREE.Vector2(0.55, 1.35),
      new THREE.Vector2(0.72, 1.55),
      new THREE.Vector2(0.0, 1.55),
    ];
    const inkwell = new THREE.Mesh(getSculptedGadroonLatheGeometry(inkwellPts, 40, 16, 0.06, 0.0, 1.4), goldMat);
    inkwell.position.set(-13.2, y0 + 4.25, 1.2);
    group.add(inkwell);

    const quillCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-13.2, y0 + 5.2, 1.2),
      new THREE.Vector3(-12.4, y0 + 7.2, 0.6),
      new THREE.Vector3(-11.1, y0 + 9.1, -0.2),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(quillCurve, 24, 0.09, 10, false), pageMat));

    // High-Poly Open-Lid Brass Pocket Watch + Serpentine Chain on Right
    const watchCase = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 0.52, 48), goldMat);
    watchCase.position.set(11.6, y0 + 0.32, 5.2);
    group.add(watchCase);

    const watchFace = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.65, 0.56, 40), pageMat);
    watchFace.position.set(11.6, y0 + 0.34, 5.2);
    group.add(watchFace);

    const openLid = new THREE.Mesh(new THREE.CylinderGeometry(1.90, 1.90, 0.18, 48), goldMat);
    openLid.position.set(11.6, y0 + 1.65, 3.65);
    openLid.rotation.x = 1.05;
    group.add(openLid);

    const chainCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(11.6, y0 + 0.25, 7.2),
      new THREE.Vector3(13.2, y0 + 0.18, 8.4),
      new THREE.Vector3(10.4, y0 + 0.18, 9.6),
      new THREE.Vector3(8.8, y0 + 0.18, 8.5),
    ]);
    group.add(new THREE.Mesh(new THREE.TubeGeometry(chainCurve, 32, 0.10, 10, false), ribbonMat));
  } else if (decorStyle === 'soul_siphon') {
    // High-Poly Astrolabe / Armillary Gimbal Siphon Array + 8 Crystal Soul-Vial Resonators
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      emissive: new THREE.Color('#d97706'),
      emissiveIntensity: 0.45,
      roughness: 0.22,
      metalness: 0.88,
    });
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.65,
      side: THREE.DoubleSide,
    });

    const outerTorus = new THREE.Mesh(new THREE.TorusGeometry(12.2, 0.28, 20, 96), ringMat1);
    outerTorus.rotateX(Math.PI / 2);
    outerTorus.position.set(0, y0 + 0.30, -0.5);
    group.add(outerTorus);

    const innerTorus = new THREE.Mesh(new THREE.TorusGeometry(10.8, 0.20, 18, 80), ringMat1);
    innerTorus.rotateX(Math.PI / 2);
    innerTorus.position.set(0, y0 + 0.26, -0.5);
    group.add(innerTorus);

    // 8 Crystal Resonator Vials around the Perimeter Ring
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const vx = Math.cos(a) * 11.5;
      const vz = -0.5 + Math.sin(a) * 11.5;
      const vialBase = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.58, 0.45, 20), ringMat1);
      vialBase.position.set(vx, y0 + 0.25, vz);
      group.add(vialBase);

      const vialCrystal = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 1.85, 20), ringMat2);
      vialCrystal.position.set(vx, y0 + 1.35, vz);
      group.add(vialCrystal);

      const vialCap = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.65, 20), ringMat1);
      vialCap.position.set(vx, y0 + 2.55, vz);
      group.add(vialCap);
    }

    // Floating Golden & Cyan Vital Energy Orbs around the head
    const orbGeo = new THREE.SphereGeometry(0.40, 16, 14);
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const rad = 11.2 + (i % 2) * 1.4;
      const h = y0 + 3.2 + (i / 12) * 21.0;
      const orb = new THREE.Mesh(orbGeo, i % 2 === 0 ? ringMat1 : ringMat2);
      orb.position.set(Math.cos(angle) * rad, h, -0.5 + Math.sin(angle) * rad);
      group.add(orb);
    }
  } else if (decorStyle === 'forensic_evidence') {
    // High-Poly Crime-Scene Forensic Evidence Markers + Stainless Instrument Tray & Specimen Vials
    const yellowMat = new THREE.MeshStandardMaterial({
      color: '#facc15',
      roughness: 0.28,
      metalness: 0.12,
    });
    const steelMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.22,
      metalness: 0.88,
    });
    const tentGroup = new THREE.Group();
    tentGroup.position.set(11.4, y0, 6.2);
    tentGroup.rotation.y = -0.35;

    const side1 = new THREE.Mesh(getBeveledBoxGeometry(3.4, 3.9, 0.22, 0.20, 0.06, 4), yellowMat);
    side1.position.set(0, 1.8, 0.68);
    side1.rotation.x = -0.34;
    tentGroup.add(side1);

    const side2 = new THREE.Mesh(getBeveledBoxGeometry(3.4, 3.9, 0.22, 0.20, 0.06, 4), yellowMat);
    side2.position.set(0, 1.8, -0.68);
    side2.rotation.x = 0.34;
    tentGroup.add(side2);

    group.add(tentGroup);

    // Left-Side High-Poly Stainless Forensic Instrument Tray + 3 Specimen Vials
    const miniTray = new THREE.Mesh(getBeveledBoxGeometry(6.2, 0.45, 4.4, 0.55, 0.14, 5), steelMat);
    miniTray.position.set(-12.2, y0 + 0.25, 4.8);
    miniTray.rotation.y = 0.28;
    group.add(miniTray);

    const vialGlassMat = new THREE.MeshPhysicalMaterial({
      color: '#991b1b',
      transparent: true,
      opacity: 0.72,
      roughness: 0.10,
      clearcoat: 0.85,
    });
    for (let v = -1; v <= 1; v++) {
      const vial = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 2.1, 20), vialGlassMat);
      vial.position.set(-12.2 + v * 1.2, y0 + 1.45, 4.4);
      group.add(vial);
    }
  }

  return group;
}
