import * as THREE from 'three';
import { injectStageWindowGoboShader } from './photorealLighting.js';

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

  const mainSlabGeo = new THREE.BoxGeometry(boxW * 1.16, slabThickness, floorDepth);
  const mainSlab = new THREE.Mesh(mainSlabGeo, floorMat);
  mainSlab.position.set(0, floorSurfaceY - slabThickness * 0.5, floorCenterZ);
  mainSlab.receiveShadow = true;
  group.add(mainSlab);

  const frontBarGeo = new THREE.BoxGeometry(boxW * 1.16, slabThickness * 1.08, 1.4);
  const frontBar = new THREE.Mesh(frontBarGeo, trimMat);
  frontBar.position.set(0, floorSurfaceY - slabThickness * 0.48, 2.0);
  frontBar.receiveShadow = true;
  group.add(frontBar);

  // Stage 28: Every shelf & podium is built as an individually draggable & deletable 3D structure!
  const addShelfPlatform = (id, label, cx, surfaceY, cz, w, d, hThickness = 1.6, isColumn = false) => {
    const shelfNode = new THREE.Group();
    shelfNode.name = `StageShelf_${id}`;
    shelfNode.position.set(cx, surfaceY, cz);

    const slabGeo = isColumn
      ? new THREE.CylinderGeometry(w * 0.5, w * 0.54, hThickness, 32)
      : new THREE.BoxGeometry(w, hThickness, d);
    const slab = new THREE.Mesh(slabGeo, floorMat);
    slab.position.set(0, -hThickness * 0.5, 0);
    slab.castShadow = true;
    slab.receiveShadow = true;
    shelfNode.add(slab);

    if (!isColumn) {
      const lipGeo = new THREE.BoxGeometry(w + 0.4, hThickness * 0.65, 0.9);
      const lip = new THREE.Mesh(lipGeo, trimMat);
      lip.position.set(0, -hThickness * 0.35, d * 0.5);
      shelfNode.add(lip);

      for (const side of [-1, 1]) {
        const brkGeo = new THREE.BoxGeometry(0.8, 3.6, d * 0.82);
        const brk = new THREE.Mesh(brkGeo, trimMat);
        brk.position.set(side * (w * 0.42), -hThickness - 1.6, -d * 0.05);
        shelfNode.add(brk);
      }
    } else {
      const shaftH = Math.max(2, surfaceY - hThickness - floorSurfaceY);
      if (shaftH > 2) {
        const shaftGeo = new THREE.CylinderGeometry(w * 0.34, w * 0.40, shaftH, 24);
        const shaftMat = new THREE.MeshStandardMaterial({
          color: '#111827',
          roughness: 0.32,
          metalness: 0.25,
        });
        const shaft = new THREE.Mesh(shaftGeo, shaftMat);
        shaft.position.set(0, -hThickness - shaftH * 0.5, 0);
        shaft.castShadow = true;
        shaft.receiveShadow = true;
        shelfNode.add(shaft);

        const ringGeo = new THREE.TorusGeometry(w * 0.46, 0.38, 12, 32);
        ringGeo.rotateX(Math.PI / 2);
        const topRing = new THREE.Mesh(ringGeo, trimMat);
        topRing.position.set(0, -hThickness, 0);
        shelfNode.add(topRing);
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
    const shelfW = Math.max(22, boxW * 0.26);
    const shelfD = 32;
    const leftX = bounds.minX + shelfW * 0.52;
    const rightX = bounds.maxX - shelfW * 0.52;
    const midY = floorSurfaceY + boxH * 0.34;
    const highY = floorSurfaceY + boxH * 0.64;

    addShelfPlatform('shelf_left_mid', '左侧伴学中层展架', leftX, midY, -18, shelfW, shelfD);
    addShelfPlatform('shelf_right_mid', '右侧伴学中层展架', rightX, midY, -18, shelfW, shelfD);
    addShelfPlatform('shelf_left_high', '左上伴学高层展架', leftX, highY, -24, shelfW * 0.92, shelfD);
    addShelfPlatform('shelf_right_high', '右上伴学高层展架', rightX, highY, -24, shelfW * 0.92, shelfD);
  } else if (shelfLayout === 'stepped_altar') {
    const centerY = floorSurfaceY + boxH * 0.30;
    const sideY = floorSurfaceY + boxH * 0.16;
    addShelfPlatform('altar_center_top', '中央加冕主祭坛', 0, centerY, -22, 28, 30, 2.2);
    addShelfPlatform('altar_left_step', '左翼次级展台', -boxW * 0.28, sideY, -16, 24, 28, 1.8);
    addShelfPlatform('altar_right_step', '右翼次级展台', boxW * 0.28, sideY, -16, 24, 28, 1.8);
  } else if (shelfLayout === 'corner_pedestals') {
    const colW = 19;
    const leftX = bounds.minX + 16;
    const rightX = bounds.maxX - 16;
    const innerLX = bounds.minX + 36;
    const innerRX = bounds.maxX - 36;
    addShelfPlatform('pedestal_L1', '左外立柱台', leftX, floorSurfaceY + 15, -14, colW, colW, 1.8, true);
    addShelfPlatform('pedestal_R1', '右外立柱台', rightX, floorSurfaceY + 15, -14, colW, colW, 1.8, true);
    addShelfPlatform('pedestal_L2', '左内高立柱台', innerLX, floorSurfaceY + 25, -28, colW, colW, 1.8, true);
    addShelfPlatform('pedestal_R2', '右内高立柱台', innerRX, floorSurfaceY + 25, -28, colW, colW, 1.8, true);
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
export function buildSpecimenContainerGroup(containerStyle = 'glass_bell_jar') {
  const group = new THREE.Group();
  group.name = 'SpecimenContainerGroup';
  group.userData.containerStyle = containerStyle;

  if (!containerStyle || containerStyle === 'none') {
    group.userData.baseBottomOffset = -12.6;
    return group;
  }

  const brassMat = new THREE.MeshStandardMaterial({
    color: '#d4af37',
    roughness: 0.24,
    metalness: 0.86,
  });
  const obsidianMat = new THREE.MeshPhysicalMaterial({
    color: '#111827',
    roughness: 0.18,
    metalness: 0.15,
    clearcoat: 0.75,
    clearcoatRoughness: 0.15,
  });
  const velvetMat = new THREE.MeshPhysicalMaterial({
    color: '#58101d',
    roughness: 0.85,
    metalness: 0.0,
    sheen: 0.92,
    sheenRoughness: 0.35,
    sheenColor: new THREE.Color('#fb7185'),
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#f0f9ff',
    transparent: true,
    opacity: 0.19,
    roughness: 0.04,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.02,
    specularIntensity: 1.0,
    ior: 1.50,
    envMapIntensity: 1.65,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  if (containerStyle === 'glass_bell_jar') {
    // 1. Stepped Obsidian & Turned Brass Pedestal Base (y = -12.5 down to -15.4)
    const basePlinth = new THREE.Mesh(new THREE.CylinderGeometry(10.8, 11.6, 1.8, 48), obsidianMat);
    basePlinth.position.set(0, -14.5, -0.5);
    basePlinth.castShadow = true;
    basePlinth.receiveShadow = true;
    group.add(basePlinth);

    const brassStep = new THREE.Mesh(new THREE.CylinderGeometry(9.8, 10.4, 0.7, 48), brassMat);
    brassStep.position.set(0, -13.3, -0.5);
    brassStep.receiveShadow = true;
    group.add(brassStep);

    const velvetCushion = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.8, 0.55, 40), velvetMat);
    velvetCushion.position.set(0, -12.75, -0.5);
    velvetCushion.receiveShadow = true;
    group.add(velvetCushion);

    // Engraved Brass Nameplate on the front of the base
    const plate = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.0, 0.4), brassMat);
    plate.position.set(0, -14.4, 10.9);
    group.add(plate);

    // 2. Crystal Bell Jar Dome (Cylinder + Hemisphere Dome + Top Finial Knob)
    const cylGeo = new THREE.CylinderGeometry(9.9, 9.9, 18.5, 48, 1, true);
    const cylMesh = new THREE.Mesh(cylGeo, glassMat);
    cylMesh.position.set(0, -3.8, -0.5);
    group.add(cylMesh);

    const domeGeo = new THREE.SphereGeometry(9.9, 48, 24, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const domeMesh = new THREE.Mesh(domeGeo, glassMat);
    domeMesh.position.set(0, 5.45, -0.5);
    group.add(domeMesh);

    // Top Brass & Glass Finial Knob
    const knob = new THREE.Mesh(new THREE.SphereGeometry(1.15, 24, 16), brassMat);
    knob.position.set(0, 16.1, -0.5);
    group.add(knob);

    group.userData.baseBottomOffset = -15.4;
  } else if (containerStyle === 'velvet_chalice') {
    // Open-air Luxury Velvet & Gold Chalice Pedestal (No glass cover)
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 9.6, 1.4, 40), obsidianMat);
    foot.position.set(0, -15.3, -0.5);
    foot.castShadow = true;
    foot.receiveShadow = true;
    group.add(foot);

    const stem = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 4.6, 2.4, 32), brassMat);
    stem.position.set(0, -13.6, -0.5);
    stem.castShadow = true;
    group.add(stem);

    const cup = new THREE.Mesh(new THREE.CylinderGeometry(8.8, 5.2, 1.4, 40), obsidianMat);
    cup.position.set(0, -12.6, -0.5);
    cup.receiveShadow = true;
    group.add(cup);

    const cushion = new THREE.Mesh(new THREE.CylinderGeometry(8.2, 8.5, 0.65, 40), velvetMat);
    cushion.position.set(0, -12.1, -0.5);
    cushion.receiveShadow = true;
    group.add(cushion);

    const goldRim = new THREE.Mesh(new THREE.TorusGeometry(8.6, 0.26, 12, 48), brassMat);
    goldRim.rotateX(Math.PI / 2);
    goldRim.position.set(0, -12.0, -0.5);
    group.add(goldRim);

    group.userData.baseBottomOffset = -16.0;
  } else if (containerStyle === 'formalin_cylinder') {
    // Medical Formalin Preservation Tank with Amber Meniscus & Graduation Ticks
    const steelMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.25,
      metalness: 0.85,
    });
    const bottomCap = new THREE.Mesh(new THREE.CylinderGeometry(10.6, 10.9, 2.0, 48), steelMat);
    bottomCap.position.set(0, -14.4, -0.5);
    bottomCap.castShadow = true;
    bottomCap.receiveShadow = true;
    group.add(bottomCap);

    // Formalin-tinted glass cylinder with graduation ruler texture
    const formalinGlassMat = new THREE.MeshPhysicalMaterial({
      color: '#fef3c7',
      map: getFormalinGradTexture(),
      transparent: true,
      opacity: 0.26,
      roughness: 0.05,
      clearcoat: 1.0,
      ior: 1.48,
      envMapIntensity: 1.5,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(10.2, 10.2, 28.5, 48, 1, true), formalinGlassMat);
    tank.position.set(0, 0.8, -0.5);
    group.add(tank);

    // Formalin liquid meniscus surface ring near top
    const meniscusMat = new THREE.MeshBasicMaterial({
      color: '#fde68a',
      transparent: true,
      opacity: 0.24,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const meniscus = new THREE.Mesh(new THREE.RingGeometry(0.5, 10.1, 48), meniscusMat);
    meniscus.rotateX(-Math.PI / 2);
    meniscus.position.set(0, 13.4, -0.5);
    group.add(meniscus);

    // Heavy Stainless Top Lid & Specimen Suspension Ring
    const topLid = new THREE.Mesh(new THREE.CylinderGeometry(10.7, 10.5, 1.5, 48), steelMat);
    topLid.position.set(0, 15.6, -0.5);
    group.add(topLid);

    const handle = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.35, 12, 32), brassMat);
    handle.position.set(0, 17.2, -0.5);
    group.add(handle);

    group.userData.baseBottomOffset = -15.4;
  } else if (containerStyle === 'acrylic_cube') {
    // Modern Museum Acrylic Vitrine Box + 4 Brass Corner Pillars + Uplight Ring
    const baseBox = new THREE.Mesh(new THREE.BoxGeometry(20.6, 2.2, 20.6), obsidianMat);
    baseBox.position.set(0, -14.3, -0.5);
    baseBox.castShadow = true;
    baseBox.receiveShadow = true;
    group.add(baseBox);

    // Glowing LED Uplight Ring illuminating the C4/C5 neck cross-section
    const ledGeo = new THREE.RingGeometry(5.6, 6.4, 48);
    ledGeo.rotateX(-Math.PI / 2);
    const ledMat = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.72,
      side: THREE.DoubleSide,
    });
    const ledRing = new THREE.Mesh(ledGeo, ledMat);
    ledRing.position.set(0, -13.15, -0.5);
    group.add(ledRing);

    const boxGlass = new THREE.Mesh(new THREE.BoxGeometry(19.6, 28.2, 19.6), glassMat);
    boxGlass.position.set(0, 0.9, -0.5);
    group.add(boxGlass);

    // 4 Thin Brass Corner Edges
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 28.4, 12), brassMat);
        post.position.set(sx * 9.8, 0.9, -0.5 + sz * 9.8);
        group.add(post);
      }
    }

    group.userData.baseBottomOffset = -15.4;
  } else if (containerStyle === 'surgical_tray') {
    // Medical Stainless-Steel Dissection Tray + Coagulated Blood Pad
    const steelTrayMat = new THREE.MeshStandardMaterial({
      color: '#cbd5e1',
      roughness: 0.22,
      metalness: 0.88,
    });
    const trayBottom = new THREE.Mesh(new THREE.CylinderGeometry(10.2, 8.8, 1.4, 40), steelTrayMat);
    trayBottom.position.set(0, -13.4, -0.5);
    trayBottom.castShadow = true;
    trayBottom.receiveShadow = true;
    group.add(trayBottom);

    const trayRim = new THREE.Mesh(new THREE.TorusGeometry(10.2, 0.42, 12, 48), steelTrayMat);
    trayRim.rotateX(Math.PI / 2);
    trayRim.position.set(0, -12.7, -0.5);
    group.add(trayRim);

    const bloodPadMat = new THREE.MeshPhysicalMaterial({
      color: '#4c0519',
      roughness: 0.14,
      clearcoat: 0.95,
      clearcoatRoughness: 0.08,
    });
    const bloodPool = new THREE.Mesh(new THREE.CylinderGeometry(6.8, 7.2, 0.35, 32), bloodPadMat);
    bloodPool.position.set(0, -12.6, -0.5);
    group.add(bloodPool);

    group.userData.baseBottomOffset = -14.1;
  } else if (containerStyle === 'guillotine_plinth') {
    // Dark Walnut Executioner's Plinth + Brass Trophy Plaque + Velvet Neck Depression
    const walnutMat = new THREE.MeshPhysicalMaterial({
      color: '#2b150d',
      roughness: 0.34,
      clearcoat: 0.35,
    });
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(19.2, 2.6, 19.2), walnutMat);
    plinth.position.set(0, -14.1, -0.5);
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    group.add(plinth);

    const brassTrim = new THREE.Mesh(new THREE.BoxGeometry(19.8, 0.5, 19.8), brassMat);
    brassTrim.position.set(0, -15.2, -0.5);
    group.add(brassTrim);

    const neckPad = new THREE.Mesh(new THREE.CylinderGeometry(7.6, 8.2, 0.65, 36), velvetMat);
    neckPad.position.set(0, -12.55, -0.5);
    group.add(neckPad);

    const plaque = new THREE.Mesh(new THREE.BoxGeometry(7.4, 1.3, 0.45), brassMat);
    plaque.position.set(0, -14.0, 9.2);
    group.add(plaque);

    group.userData.baseBottomOffset = -15.45;
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
    // Two Gothic Ivory Pillar Candles with Warm Glowing Flames + Scattered Dark Rose Petals
    const waxMat = new THREE.MeshStandardMaterial({
      color: '#fef3c7',
      roughness: 0.42,
      metalness: 0.0,
    });
    const flameMat = new THREE.MeshBasicMaterial({ color: '#fbbf24' });
    const glowMat = new THREE.MeshBasicMaterial({
      color: '#f59e0b',
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    });
    const holderMat = new THREE.MeshStandardMaterial({
      color: '#d4af37',
      roughness: 0.28,
      metalness: 0.85,
    });

    const candleConfigs = [
      { x: -12.2, z: 3.5, h: 5.2, r: 1.05 },
      { x: 12.0, z: 2.8, h: 3.8, r: 0.95 },
    ];
    for (const c of candleConfigs) {
      const holder = new THREE.Mesh(new THREE.CylinderGeometry(c.r * 1.45, c.r * 1.65, 0.6, 20), holderMat);
      holder.position.set(c.x, y0 + 0.3, c.z);
      group.add(holder);

      const candle = new THREE.Mesh(new THREE.CylinderGeometry(c.r * 0.92, c.r, c.h, 20), waxMat);
      candle.position.set(c.x, y0 + 0.6 + c.h * 0.5, c.z);
      candle.castShadow = true;
      group.add(candle);

      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1.35, 12), flameMat);
      flame.position.set(c.x, y0 + 0.6 + c.h + 0.7, c.z);
      group.add(flame);

      const halo = new THREE.Mesh(new THREE.SphereGeometry(1.35, 16, 12), glowMat);
      halo.position.set(c.x, y0 + 0.6 + c.h + 0.7, c.z);
      group.add(halo);
    }

    // Scattered Dark-Crimson Rose Petals around the front of the container
    const petalMat = new THREE.MeshStandardMaterial({
      color: '#881337',
      roughness: 0.62,
      side: THREE.DoubleSide,
    });
    const petalCoords = [
      [-6.5, 9.8, 0.3],
      [-3.2, 11.2, -0.4],
      [2.8, 10.8, 0.8],
      [7.4, 9.4, -0.6],
      [-9.5, 7.2, 1.1],
      [9.2, 6.8, 0.2],
    ];
    for (const [px, pz, rot] of petalCoords) {
      const petalGeo = new THREE.CircleGeometry(0.95, 12);
      petalGeo.scale(1.35, 0.85, 1.0);
      petalGeo.rotateX(-Math.PI / 2);
      const petal = new THREE.Mesh(petalGeo, petalMat);
      petal.position.set(px, y0 + 0.12, pz);
      petal.rotation.y = rot;
      group.add(petal);
    }
  } else if (decorStyle === 'study_tomes') {
    // Stacked Leather-Bound Study Books + Gold-Foil Spines + Brass Pocket Watch
    const bookColors = ['#451a03', '#1e1b4b', '#3f1d28'];
    const pageMat = new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.7 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#d4af37', roughness: 0.25, metalness: 0.85 });

    for (let i = 0; i < 3; i++) {
      const bw = 6.2 - i * 0.4;
      const bd = 8.4 - i * 0.4;
      const bh = 1.35;
      const coverMat = new THREE.MeshStandardMaterial({ color: bookColors[i], roughness: 0.55 });
      const book = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), coverMat);
      book.position.set(-13.4, y0 + bh * (i + 0.5), 1.5);
      book.rotation.y = 0.18 - i * 0.14;
      book.castShadow = true;
      group.add(book);

      const pages = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.94, bh * 0.76, bd * 0.94), pageMat);
      pages.position.copy(book.position);
      pages.rotation.copy(book.rotation);
      group.add(pages);
    }

    // Miniature Brass Pocket Watch resting beside the container
    const watchBody = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, 0.45, 24), goldMat);
    watchBody.position.set(11.6, y0 + 0.45, 5.2);
    watchBody.rotation.x = -0.22;
    group.add(watchBody);
  } else if (decorStyle === 'soul_siphon') {
    // Survivor Vital Energy Siphon Golden-Cyan Rune Rings + Floating Luminous Motes
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: '#fbbf24',
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
    });
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: '#38bdf8',
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
    });

    const outerRing = new THREE.Mesh(new THREE.RingGeometry(11.8, 12.3, 64), ringMat1);
    outerRing.rotateX(-Math.PI / 2);
    outerRing.position.set(0, y0 + 0.15, -0.5);
    group.add(outerRing);

    const innerRing = new THREE.Mesh(new THREE.RingGeometry(10.6, 10.9, 64), ringMat2);
    innerRing.rotateX(-Math.PI / 2);
    innerRing.position.set(0, y0 + 0.22, -0.5);
    group.add(innerRing);

    // Floating Golden & Cyan Vital Energy Orbs around the head
    const orbGeo = new THREE.SphereGeometry(0.38, 12, 12);
    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const rad = 11.2 + (i % 2) * 1.4;
      const h = y0 + 3.0 + (i / 10) * 22.0;
      const orb = new THREE.Mesh(orbGeo, i % 2 === 0 ? ringMat1 : ringMat2);
      orb.position.set(Math.cos(angle) * rad, h, -0.5 + Math.sin(angle) * rad);
      group.add(orb);
    }
  } else if (decorStyle === 'forensic_evidence') {
    // Yellow Crime-Scene Forensic Evidence Tent Marker (#01)
    const yellowMat = new THREE.MeshStandardMaterial({
      color: '#facc15',
      roughness: 0.35,
      side: THREE.DoubleSide,
    });
    const tentGroup = new THREE.Group();
    tentGroup.position.set(11.4, y0, 6.2);
    tentGroup.rotation.y = -0.35;

    const side1 = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.8), yellowMat);
    side1.position.set(0, 1.75, 0.65);
    side1.rotation.x = -0.34;
    tentGroup.add(side1);

    const side2 = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.8), yellowMat);
    side2.position.set(0, 1.75, -0.65);
    side2.rotation.x = 0.34;
    tentGroup.add(side2);

    group.add(tentGroup);
  }

  return group;
}
