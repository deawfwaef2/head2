import * as THREE from 'three';

/**
 * Generates High-Resolution (1024x1024) Realistic Medical & Forensic Anatomical Neck Cross-Section Textures (C4/C5 Level)
 * Orientation Contract (100% matched with `NeckCrossSection` UV in `daz_asian_head_base.glb` and `NeckAnatomy3DGroup`):
 *  - Anterior (+Z, throat under the chin)  <=> UV.v > 0.5 (v = 0.58..0.95, top half of canvas)
 *  - Posterior (-Z, nape/cervical spine)   <=> UV.v < 0.5 (v = 0.05..0.48, bottom half of canvas)
 *  - Subject's Left / Viewer's Right (+X)  <=> UV.u > 0.5
 *  - Subject's Right / Viewer's Left (-X)  <=> UV.u < 0.5
 */

export const ANATOMY_LABELS = [
  { id: 'trachea', name: '气管腔与C形透明软骨环 (Trachea & Hyaline C-Ring)', u: 0.50, v: 0.705, color: '#7dd3fc' },
  { id: 'esophagus', name: '食管星状黏膜皱襞腔 (Esophagus Lumen)', u: 0.50, v: 0.585, color: '#fda4af' },
  { id: 'thyroid', name: '甲状腺左/右叶与峡部 (Thyroid Gland)', u: 0.38, v: 0.680, color: '#f87171' },
  { id: 'carotid', name: '颈总动脉断口 (Common Carotid A.)', u: 0.338, v: 0.565, color: '#ef4444' },
  { id: 'jugular', name: '颈内静脉腔 (Internal Jugular V.)', u: 0.272, v: 0.555, color: '#60a5fa' },
  { id: 'scm', name: '胸锁乳突肌束 (Sternocleidomastoid M.)', u: 0.225, v: 0.635, color: '#fb7185' },
  { id: 'vertebra', name: 'C4 颈椎椎体与红骨髓松质 (C4 Vertebral Body)', u: 0.50, v: 0.425, color: '#fde68a' },
  { id: 'spinal_cord', name: '脊髓白质与灰质蝴蝶角 (Spinal Cord)', u: 0.50, v: 0.335, color: '#fef08a' },
  { id: 'trapezius', name: '斜方肌与头半棘肌群 (Deep Cervical Mm.)', u: 0.68, v: 0.245, color: '#f43f5e' },
  { id: 'dermis', name: '外翻真皮切缘与皮下黄脂肪层 (Dermis & Adipose)', u: 0.84, v: 0.760, color: '#fcd34d' }
];

function drawMuscleCompartment(ctx, cx, cy, rx, ry, angle, baseColor, fiberTint, seed = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Dark venous blood sulcus in the intermuscular fascial groove outside epimysium
  ctx.beginPath();
  ctx.ellipse(0, 0, rx + 5.5, ry + 5.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(56, 6, 12, 0.52)';
  ctx.fill();

  // Epimysium glistening collagenous white-pink sheath
  ctx.beginPath();
  ctx.ellipse(0, 0, rx + 3.2, ry + 3.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(244, 224, 220, 0.86)';
  ctx.fill();

  // Muscle belly base with rich radial vascular gradient
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(-rx * 0.18, -ry * 0.18, rx * 0.08, 0, 0, Math.max(rx, ry));
  grad.addColorStop(0, fiberTint || '#cf3c48');
  grad.addColorStop(0.58, baseColor || '#961e2a');
  grad.addColorStop(0.88, '#661019');
  grad.addColorStop(1, '#3d070d');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.clip();

  // Internal perimysium marbling (polygonal secondary muscle fascicles with white collagen septa)
  ctx.strokeStyle = 'rgba(252, 230, 226, 0.52)';
  ctx.lineWidth = 1.6;
  const count = Math.max(12, Math.floor((rx * ry) / 140));
  for (let i = 0; i < count; i++) {
    const a = ((i * 137.508 + seed * 31) % 360) * (Math.PI / 180);
    const r = Math.sqrt((i + 0.45) / count) * 0.90;
    const fx = Math.cos(a) * rx * r;
    const fy = Math.sin(a) * ry * r;
    const fr = Math.max(5, Math.sqrt((rx * ry) / count) * (0.62 + ((i * 13) % 5) * 0.09));
    ctx.beginPath();
    for (let k = 0; k < 7; k++) {
      const ka = (k / 7) * Math.PI * 2 + (i % 4) * 0.22;
      const rad = fr * (0.76 + 0.30 * Math.sin(k * 2.3 + i * 1.7));
      const px = fx + Math.cos(ka) * rad;
      const py = fy + Math.sin(ka) * rad * 0.84;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = i % 3 === 0
      ? 'rgba(182, 42, 54, 0.62)'
      : i % 3 === 1
        ? 'rgba(128, 22, 32, 0.62)'
        : 'rgba(92, 12, 20, 0.58)';
    ctx.fill();
    ctx.stroke();
  }

  // Fine endomysium myofibril cross-striation stippling & severed arterioles
  for (let i = 0; i < count * 5; i++) {
    const a = i * 2.399963;
    const r = Math.sqrt(i / (count * 5)) * 0.96;
    const px = Math.cos(a) * rx * r;
    const py = Math.sin(a) * ry * r;
    ctx.fillStyle = i % 5 === 0
      ? 'rgba(255, 215, 215, 0.28)'
      : i % 2 === 0
        ? 'rgba(220, 48, 60, 0.24)'
        : 'rgba(38, 4, 8, 0.32)';
    ctx.fillRect(px, py, 2.2, 2.2);
  }

  ctx.restore();
}

export function renderAnatomyCrossSectionToCanvas(canvas, options = {}) {
  const size = canvas.width || 1024;
  const ctx = canvas.getContext('2d');
  const {
    skinColor = '#f4d2c4',
    vascularContrast = 1.25,
    dermisRimScale = 1.0,
    showLabels = false
  } = options;

  ctx.clearRect(0, 0, size, size);
  const cx = size * 0.5;
  const cy = size * 0.5;
  const R = size * 0.462;

  // UV (u, v) -> Canvas (x, y) with Three.js CanvasTexture (flipY = true):
  // UV.v = 1.0 (Anterior +Z throat) -> Canvas Y = 0 (top)
  // UV.v = 0.0 (Posterior -Z spine) -> Canvas Y = size (bottom)
  const uvToXY = (u, v) => [u * size, (1.0 - v) * size];

  ctx.fillStyle = skinColor;
  ctx.fillRect(0, 0, size, size);

  // 1. Outer Epidermis, Retracted Pale Dermis Cut Lip & Coagulated Incision Line
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2);
  ctx.fillStyle = skinColor;
  ctx.fill();

  const dermisR = R * (1.0 - 0.026 * dermisRimScale);
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  const dermisGrad = ctx.createRadialGradient(cx, cy, dermisR * 0.90, cx, cy, R);
  dermisGrad.addColorStop(0.0, '#7a121c');
  dermisGrad.addColorStop(0.45, '#e8b6aa');
  dermisGrad.addColorStop(0.75, '#f9e3dc');
  dermisGrad.addColorStop(0.93, '#c86462');
  dermisGrad.addColorStop(0.98, '#540810');
  dermisGrad.addColorStop(1.0, skinColor);
  ctx.fillStyle = dermisGrad;
  ctx.fill();

  // 2. Subcutaneous Adipose Tissue Layer (Glistening yellow fat lobules with capillary septa)
  const fatR = dermisR * 0.966;
  ctx.beginPath();
  ctx.arc(cx, cy, fatR, 0, Math.PI * 2);
  ctx.fillStyle = '#d99e4e';
  ctx.fill();

  const numFatLobules = 96;
  for (let i = 0; i < numFatLobules; i++) {
    const ang = (i / numFatLobules) * Math.PI * 2;
    const rad = fatR * (0.938 - 0.028 * Math.sin(i * 4.3));
    const lx = cx + Math.cos(ang) * rad;
    const ly = cy + Math.sin(ang) * rad;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.015, size * 0.025, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 3 === 0 ? '#fae29c' : i % 3 === 1 ? '#f0c465' : '#e0a84b';
    ctx.fill();
    ctx.strokeStyle = 'rgba(168, 28, 38, 0.58)';
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.restore();
  }

  // 3. Investing Deep Cervical Fascia Core & Intermuscular Venous Coagulation Bed
  const fasciaR = fatR * 0.896;
  ctx.beginPath();
  ctx.arc(cx, cy, fasciaR, 0, Math.PI * 2);
  const matrixGrad = ctx.createRadialGradient(cx, cy, size * 0.04, cx, cy, fasciaR);
  matrixGrad.addColorStop(0, '#7d1d26');
  matrixGrad.addColorStop(0.52, '#69151e');
  matrixGrad.addColorStop(0.86, '#9e3842');
  matrixGrad.addColorStop(0.96, '#dfb8b4');
  matrixGrad.addColorStop(1.0, '#f2dedc');
  ctx.fillStyle = matrixGrad;
  ctx.fill();

  // Anterolateral Platysma (颈阔肌) thin superficial muscle sheet inside subcutaneous fat (Anterior v > 0.62)
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.beginPath();
    const startAng = side === -1 ? -Math.PI * 0.84 : -Math.PI * 0.40;
    const endAng = side === -1 ? -Math.PI * 0.60 : -Math.PI * 0.16;
    ctx.arc(cx, cy, fatR * 0.935, startAng, endAng);
    ctx.strokeStyle = '#a82834';
    ctx.lineWidth = size * 0.015;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }

  // 4. Muscular Compartments (Bilateral Symmetric)
  // Anterior is v > 0.5 (top half of canvas), Posterior is v < 0.5 (bottom half of canvas)
  for (const side of [-1, 1]) {
    // (a) Sternocleidomastoid Muscle (胸锁乳突肌) - prominent anterolateral belly
    const [scmX, scmY] = uvToXY(0.5 + side * 0.275, 0.635);
    drawMuscleCompartment(ctx, scmX, scmY, size * 0.104, size * 0.058, side * 0.68, '#9e1f2c', '#d43f4d', side + 2);

    // (b) Infrahyoid Strap Muscles (舌骨下肌群: Sternohyoid & Sternothyroid) - anterior near midline
    const [strapX, strapY] = uvToXY(0.5 + side * 0.095, 0.795);
    drawMuscleCompartment(ctx, strapX, strapY, size * 0.064, size * 0.036, side * 0.22, '#a62836', '#d64856', side + 5);

    // (c) Omohyoid superior belly (肩胛舌骨肌上腹)
    const [omoX, omoY] = uvToXY(0.5 + side * 0.20, 0.745);
    drawMuscleCompartment(ctx, omoX, omoY, size * 0.044, size * 0.026, side * 0.45, '#8e1c28', '#bd3542', side + 8);

    // (d) Longus Colli & Longus Capitis (颈长肌/头长肌 - prevertebral anterior to C4 body)
    const [longX, longY] = uvToXY(0.5 + side * 0.075, 0.525);
    drawMuscleCompartment(ctx, longX, longY, size * 0.048, size * 0.028, -side * 0.18, '#781520', '#a62834', side + 11);

    // (e) Anterior, Middle & Posterior Scalene Muscles (前/中/后斜角肌 - lateral to vertebra)
    const [scalX, scalY] = uvToXY(0.5 + side * 0.24, 0.44);
    drawMuscleCompartment(ctx, scalX, scalY, size * 0.076, size * 0.054, -side * 0.35, '#911e29', '#c23845', side + 14);

    // (f) Levator Scapulae & Splenius Cervicis (肩胛提肌与头夹肌 - posterolateral)
    const [levX, levY] = uvToXY(0.5 + side * 0.28, 0.31);
    drawMuscleCompartment(ctx, levX, levY, size * 0.086, size * 0.052, -side * 0.75, '#8c1c27', '#ba3441', side + 19);

    // (g) Semispinalis & Multifidus (头半棘肌与多裂肌 - deep posterior flanking spinous process)
    const [semiX, semiY] = uvToXY(0.5 + side * 0.115, 0.255);
    drawMuscleCompartment(ctx, semiX, semiY, size * 0.074, size * 0.046, -side * 0.42, '#76141e', '#a82834', side + 23);

    // (h) Trapezius Muscle (斜方肌 - posterior superficial crescent)
    const [trapX, trapY] = uvToXY(0.5 + side * 0.175, 0.165);
    drawMuscleCompartment(ctx, trapX, trapY, size * 0.102, size * 0.042, -side * 0.30, '#9c2230', '#c73e4c', side + 29);
  }

  // 5. Cervical Vertebra C4 & Spinal Cord (第4颈椎横切面、横突孔椎动脉、分叉棘突与椎管脊髓 — Posterior v < 0.5)
  const [vertX, vertY] = uvToXY(0.50, 0.425);
  const [cordX, cordY] = uvToXY(0.50, 0.335);

  ctx.save();
  // Posterior vertebral arch (laminae + bifid spinous process projecting toward posterior v=0.18)
  ctx.beginPath();
  ctx.moveTo(vertX - size * 0.112, vertY);
  ctx.quadraticCurveTo(vertX - size * 0.092, cordY + size * 0.052, vertX - size * 0.030, cordY + size * 0.126);
  ctx.lineTo(vertX - size * 0.019, cordY + size * 0.148);
  ctx.lineTo(vertX, cordY + size * 0.120);
  ctx.lineTo(vertX + size * 0.019, cordY + size * 0.148);
  ctx.lineTo(vertX + size * 0.030, cordY + size * 0.126);
  ctx.quadraticCurveTo(vertX + size * 0.092, cordY + size * 0.052, vertX + size * 0.112, vertY);
  ctx.closePath();
  ctx.fillStyle = '#efe2ca';
  ctx.fill();
  ctx.strokeStyle = '#bfa87e';
  ctx.lineWidth = size * 0.004;
  ctx.stroke();

  // Bilateral Transverse Processes with Foramina Transversaria (横突与横突孔椎动静脉)
  for (const side of [-1, 1]) {
    const [tpX, tpY] = uvToXY(0.50 + side * 0.116, 0.43);
    ctx.beginPath();
    ctx.ellipse(tpX, tpY, size * 0.052, size * 0.033, side * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#f5ead4';
    ctx.fill();
    ctx.strokeStyle = '#b49a6c';
    ctx.lineWidth = size * 0.004;
    ctx.stroke();

    const [vaX, vaY] = uvToXY(0.50 + side * 0.120, 0.43);
    ctx.beginPath();
    ctx.arc(vaX, vaY, size * 0.016, 0, Math.PI * 2);
    ctx.fillStyle = '#38050a';
    ctx.fill();
    ctx.strokeStyle = '#dc1e2e';
    ctx.lineWidth = size * 0.0035;
    ctx.stroke();
  }

  // C4 Vertebral Body (C4 椎体 - Dense ivory cortical bone rim + Honeycomb red-marrow cancellous core)
  ctx.beginPath();
  ctx.ellipse(vertX, vertY, size * 0.090, size * 0.064, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f9f0de';
  ctx.fill();
  ctx.strokeStyle = '#b59b6d';
  ctx.lineWidth = size * 0.0045;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(vertX, vertY, size * 0.074, size * 0.049, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#9e2e32';
  ctx.fill();
  ctx.clip();
  for (let i = 0; i < 140; i++) {
    const a = i * 2.39996;
    const r = Math.sqrt(i / 140);
    const bx = vertX + Math.cos(a) * size * 0.064 * r;
    const by = vertY + Math.sin(a) * size * 0.042 * r;
    ctx.beginPath();
    ctx.arc(bx, by, (size * 0.0022) + (i % 3) * (size * 0.001), 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(242, 224, 196, 0.72)' : 'rgba(96, 14, 20, 0.78)';
    ctx.fill();
  }
  ctx.restore();

  // Vertebral Foramen (椎孔), Epidural Venous Plexus, Dural Sac & Spinal Cord (脊髓灰质蝴蝶角)
  ctx.beginPath();
  ctx.ellipse(cordX, cordY, size * 0.057, size * 0.046, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#4a141c';
  ctx.fill();
  ctx.strokeStyle = '#e8dcc4';
  ctx.lineWidth = size * 0.003;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cordX, cordY, size * 0.047, size * 0.037, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#9ab8c7';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cordX, cordY, size * 0.041, size * 0.031, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f8f0dc';
  ctx.fill();
  ctx.strokeStyle = '#c8b68e';
  ctx.lineWidth = size * 0.002;
  ctx.stroke();

  // Butterfly-Shaped Spinal Gray Matter Horns (脊髓灰质蝴蝶角)
  ctx.fillStyle = '#b87672';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cordX + side * size * 0.015, cordY - size * 0.006, size * 0.011, size * 0.017, side * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cordX + side * size * 0.016, cordY + size * 0.008, size * 0.0078, size * 0.015, -side * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillRect(cordX - size * 0.016, cordY - size * 0.0035, size * 0.032, size * 0.007);
  ctx.beginPath();
  ctx.arc(cordX, cordY, size * 0.0028, 0, Math.PI * 2);
  ctx.fillStyle = '#3d1016';
  ctx.fill();
  ctx.restore();

  // Ligamentum nuchae (项韧带 posterior midline fibrous septum)
  ctx.beginPath();
  ctx.moveTo(cordX, cordY + size * 0.145);
  ctx.lineTo(cx, cy + fasciaR * 0.96);
  ctx.strokeStyle = 'rgba(245, 235, 225, 0.82)';
  ctx.lineWidth = size * 0.004;
  ctx.stroke();

  // 6. Anterior Visceral Compartment: Esophagus (v=0.585), Thyroid Gland (v=0.675) & Trachea (v=0.705)
  const [esoX, esoY] = uvToXY(0.50, 0.585);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(esoX, esoY, size * 0.045, size * 0.029, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#982432';
  ctx.fill();
  ctx.strokeStyle = '#ebc4be';
  ctx.lineWidth = size * 0.0025;
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(esoX, esoY, size * 0.029, size * 0.017, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e69ea6';
  ctx.fill();
  ctx.beginPath();
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const r = k % 2 === 0 ? size * 0.019 : size * 0.005;
    const px = esoX + Math.cos(a) * r;
    const py = esoY + Math.sin(a) * r * 0.62;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#1e0307';
  ctx.fill();
  ctx.restore();

  const [trachX, trachY] = uvToXY(0.50, 0.705);
  for (const side of [-1, 1]) {
    const [thyX, thyY] = uvToXY(0.50 + side * 0.106, 0.675);
    ctx.save();
    ctx.translate(thyX, thyY);
    ctx.rotate(side * 0.42);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.044, size * 0.078, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#821824';
    ctx.fill();
    ctx.strokeStyle = '#f0c2be';
    ctx.lineWidth = size * 0.003;
    ctx.stroke();
    for (let i = 0; i < 32; i++) {
      const a = i * 2.1;
      const r = Math.sqrt(i / 32) * 0.82;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * size * 0.034 * r, Math.sin(a) * size * 0.064 * r, size * 0.004, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(205, 58, 70, 0.72)';
      ctx.fill();
    }
    ctx.restore();
  }

  // Trachea (气管横切面: Pearly hyaline cartilage C-ring + pink mucosa + deep recessed airway cavity)
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(trachX, trachY, size * 0.081, size * 0.074, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#deecf4';
  ctx.fill();
  ctx.strokeStyle = '#8aa8ba';
  ctx.lineWidth = size * 0.004;
  ctx.stroke();

  // Posterior trachealis muscle gap on the C-ring (facing esophagus at posterior side of trachea)
  ctx.beginPath();
  ctx.ellipse(trachX, trachY + size * 0.055, size * 0.052, size * 0.022, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#bc4c58';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(trachX, trachY, size * 0.059, size * 0.053, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ed949e';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(trachX, trachY, size * 0.051, size * 0.045, 0, 0, Math.PI * 2);
  const lumenGrad = ctx.createRadialGradient(trachX, trachY - size * 0.01, size * 0.005, trachX, trachY, size * 0.048);
  lumenGrad.addColorStop(0, '#090103');
  lumenGrad.addColorStop(0.72, '#1e0409');
  lumenGrad.addColorStop(1, '#54121d');
  ctx.fillStyle = lumenGrad;
  ctx.fill();
  ctx.restore();

  // 7. Bilateral Carotid Sheaths (双侧颈动脉鞘: Common Carotid Artery, Internal Jugular Vein, Vagus Nerve)
  for (const side of [-1, 1]) {
    const [csX, csY] = uvToXY(0.50 + side * 0.195, 0.56);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(csX, csY, size * 0.079, size * 0.056, side * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 226, 222, 0.54)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 240, 236, 0.78)';
    ctx.lineWidth = size * 0.0022;
    ctx.stroke();

    // Common Carotid Artery (颈总动脉)
    const [caX, caY] = uvToXY(0.50 + side * 0.162, 0.565);
    ctx.beginPath();
    ctx.arc(caX, caY, size * 0.032, 0, Math.PI * 2);
    ctx.fillStyle = '#f68892';
    ctx.fill();
    ctx.strokeStyle = '#d4192a';
    ctx.lineWidth = size * 0.003;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(caX, caY, size * 0.020, 0, Math.PI * 2);
    ctx.fillStyle = vascularContrast > 1.1 ? '#6e060f' : '#3d0308';
    ctx.fill();

    // Internal Jugular Vein (颈内静脉)
    const [ijvX, ijvY] = uvToXY(0.50 + side * 0.228, 0.555);
    ctx.beginPath();
    ctx.ellipse(ijvX, ijvY, size * 0.039, size * 0.030, side * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#7386b0';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ijvX, ijvY, size * 0.031, size * 0.023, side * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#181c38';
    ctx.fill();

    // Vagus Nerve CN X (迷走神经)
    const [vnX, vnY] = uvToXY(0.50 + side * 0.192, 0.532);
    ctx.beginPath();
    ctx.arc(vnX, vnY, size * 0.0095, 0, Math.PI * 2);
    ctx.fillStyle = '#f8e696';
    ctx.fill();
    ctx.strokeStyle = '#b4943e';
    ctx.lineWidth = size * 0.0018;
    ctx.stroke();
    ctx.restore();
  }

  // Superficial veins (Anterior Jugular & External Jugular lumens)
  for (const side of [-1, 1]) {
    const [ajvX, ajvY] = uvToXY(0.50 + side * 0.055, 0.855);
    ctx.beginPath();
    ctx.arc(ajvX, ajvY, size * 0.0075, 0, Math.PI * 2);
    ctx.fillStyle = '#20264d';
    ctx.fill();
    ctx.strokeStyle = '#8fa4d4';
    ctx.lineWidth = size * 0.0018;
    ctx.stroke();

    const [ejvX, ejvY] = uvToXY(0.50 + side * 0.355, 0.585);
    ctx.beginPath();
    ctx.arc(ejvX, ejvY, size * 0.0095, 0, Math.PI * 2);
    ctx.fillStyle = '#20264d';
    ctx.fill();
    ctx.strokeStyle = '#8fa4d4';
    ctx.lineWidth = size * 0.002;
    ctx.stroke();
  }

  // 8. Optional Anatomical Callout Labels
  if (showLabels) {
    ctx.save();
    const fontPx = Math.round(size * 0.0185);
    ctx.font = `600 ${fontPx}px "JetBrains Mono", "PingFang SC", sans-serif`;
    const boxH = Math.round(fontPx * 1.45);
    for (const item of ANATOMY_LABELS) {
      const [lx, ly] = uvToXY(item.u, item.v);
      ctx.beginPath();
      ctx.arc(lx, ly, size * 0.006, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = Math.max(2, size * 0.0025);
      ctx.stroke();

      const textW = ctx.measureText(item.name).width;
      const padX = Math.round(size * 0.008);
      const offsetX = Math.round(size * 0.014);
      const boxX = lx > cx ? lx + offsetX : lx - textW - padX * 2 - offsetX;
      const boxY = ly - Math.round(boxH * 0.5);
      ctx.fillStyle = 'rgba(9, 13, 22, 0.86)';
      ctx.fillRect(boxX, boxY, textW + padX * 2, boxH);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = Math.max(1.2, size * 0.0015);
      ctx.strokeRect(boxX, boxY, textW + padX * 2, boxH);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(item.name, boxX + padX, boxY + Math.round(boxH * 0.73));
    }
    ctx.restore();
  }
}

const _anatomyTexCache = new Map();

export function createAnatomyTextures(options = {}) {
  const cacheKey = `v2_${options.skinColor || '#ffe9df'}_${Number(options.vascularContrast ?? 1.25).toFixed(2)}_${Boolean(options.showLabels)}`;
  if (_anatomyTexCache.has(cacheKey)) {
    return _anatomyTexCache.get(cacheKey);
  }
  const size = 1024;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  renderAnatomyCrossSectionToCanvas(colorCanvas, options);

  // Create high-contrast Anatomical Topographical Bump / Height Map
  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext('2d');
  bctx.drawImage(colorCanvas, 0, 0);
  const imgData = bctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Cortical bone, hyaline cartilage, arterial walls & fat lobules protrude; airway & venous lumens recess deeply
    const rawLum = 0.30 * r + 0.48 * g + 0.22 * b;
    const contrastLum = Math.min(255, Math.max(0, Math.round((rawLum - 110) * 1.45 + 128)));
    data[i] = contrastLum;
    data[i + 1] = contrastLum;
    data[i + 2] = contrastLum;
  }
  bctx.putImageData(imgData, 0, 0);

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.anisotropy = 16;
  colorTex.userData = { sharedSkinMicro: true };
  colorTex.needsUpdate = true;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.anisotropy = 8;
  bumpTex.userData = { sharedSkinMicro: true };
  bumpTex.needsUpdate = true;

  const entry = { colorTex, bumpTex, colorCanvas };
  _anatomyTexCache.set(cacheKey, entry);
  return entry;
}
