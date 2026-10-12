import * as THREE from 'three';

/**
 * Generates High-Resolution Realistic Medical Anatomical Neck Cross-Section Textures (C4/C5 Level)
 * Includes:
 *  - Albedo / Diffuse Map (Epidermis, Dermis rim, Subcutaneous fat lobules, Investing fascia,
 *    Sternocleidomastoid, Infrahyoid strap muscles, Trapezius, Scalenes, Semispinalis,
 *    Trachea hyaline cartilage C-ring & dark airway lumen, Esophagus collapsed stellate mucosa,
 *    Thyroid gland lobes, Carotid sheath with Common Carotid Artery, Internal Jugular Vein & Vagus Nerve,
 *    Cervical Vertebra C4 cortical/trabecular bone, Vertebral arteries, Dural sac & Spinal Cord butterfly gray matter)
 *  - Bump / Relief Map (protruding bone & cartilage, striated muscle fascicles, recessed lumens)
 *  - Roughness / Specular Wetness Map (moist vascular/mucosal sheen vs satin bone/skin)
 */

export const ANATOMY_LABELS = [
  { id: 'trachea', name: '气管腔与透明软骨环 (Trachea & Cartilage)', u: 0.50, v: 0.72, color: '#7dd3fc' },
  { id: 'esophagus', name: '食管星状黏膜腔 (Esophagus)', u: 0.50, v: 0.60, color: '#fda4af' },
  { id: 'thyroid', name: '甲状腺左/右叶 (Thyroid Gland)', u: 0.37, v: 0.69, color: '#f87171' },
  { id: 'carotid', name: '颈总动脉 (Common Carotid A.)', u: 0.34, v: 0.56, color: '#ef4444' },
  { id: 'jugular', name: '颈内静脉 (Internal Jugular V.)', u: 0.26, v: 0.55, color: '#60a5fa' },
  { id: 'scm', name: '胸锁乳突肌 (Sternocleidomastoid M.)', u: 0.21, v: 0.63, color: '#fb7185' },
  { id: 'vertebra', name: 'C4 颈椎椎体 (C4 Vertebral Body)', u: 0.50, v: 0.44, color: '#fde68a' },
  { id: 'spinal_cord', name: '脊髓灰质蝴蝶角 (Spinal Cord)', u: 0.50, v: 0.32, color: '#fef08a' },
  { id: 'trapezius', name: '斜方肌与颈深肌群 (Deep Cervical Mm.)', u: 0.68, v: 0.26, color: '#f43f5e' },
  { id: 'dermis', name: '真皮切缘与皮下脂肪层 (Dermis & Adipose)', u: 0.84, v: 0.76, color: '#fcd34d' }
];

function drawMuscleCompartment(ctx, cx, cy, rx, ry, angle, baseColor, fiberTint, seed = 1) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Epimysium fibrous white-pink sheath
  ctx.beginPath();
  ctx.ellipse(0, 0, rx + 3, ry + 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(242, 225, 222, 0.82)';
  ctx.fill();

  // Muscle belly base
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(-rx * 0.2, -ry * 0.2, rx * 0.1, 0, 0, Math.max(rx, ry));
  grad.addColorStop(0, fiberTint || '#b93842');
  grad.addColorStop(0.65, baseColor || '#8f222c');
  grad.addColorStop(1, '#5e141c');
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.clip();

  // Internal perimysium marbling (white fibrous septa dividing muscle fascicles)
  ctx.strokeStyle = 'rgba(248, 224, 220, 0.36)';
  ctx.lineWidth = 1.4;
  const count = Math.floor((rx * ry) / 85);
  for (let i = 0; i < count; i++) {
    const a = ((i * 137.5 + seed * 29) % 360) * (Math.PI / 180);
    const r = Math.sqrt((i + 0.5) / count) * 0.88;
    const fx = Math.cos(a) * rx * r;
    const fy = Math.sin(a) * ry * r;
    const fr = 4 + ((i * 17) % 6);
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const ka = (k / 6) * Math.PI * 2 + (i % 3) * 0.2;
      const rad = fr * (0.78 + 0.32 * Math.sin(k * 2.1 + i));
      const px = fx + Math.cos(ka) * rad;
      const py = fy + Math.sin(ka) * rad * 0.82;
      if (k === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = i % 3 === 0 ? 'rgba(165, 42, 52, 0.55)' : 'rgba(110, 20, 28, 0.55)';
    ctx.fill();
    ctx.stroke();
  }

  // Fine myofibril stippling
  for (let i = 0; i < count * 3; i++) {
    const a = i * 2.39996;
    const r = Math.sqrt(i / (count * 3)) * 0.95;
    const px = Math.cos(a) * rx * r;
    const py = Math.sin(a) * ry * r;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 190, 190, 0.18)' : 'rgba(45, 5, 10, 0.25)';
    ctx.fillRect(px, py, 1.8, 1.8);
  }

  ctx.restore();
}

export function renderAnatomyCrossSectionToCanvas(canvas, options = {}) {
  const size = canvas.width || 1024;
  const ctx = canvas.getContext('2d');
  const {
    skinColor = '#f4d2c4',
    vascularContrast = 1.0,
    dermisRimScale = 1.0,
    showLabels = false
  } = options;

  ctx.clearRect(0, 0, size, size);
  const cx = size * 0.5;
  const cy = size * 0.5;
  const R = size * 0.46;

  //Note on orientation:
  // In UV space: v > 0.5 (bottom of canvas if y-down, or let's check Three.js flipY=true):
  // With standard Three.js CanvasTexture (flipY = true), canvas Y=0 is UV v=1.0 (anterior trachea),
  // and canvas Y=size is UV v=0.0 (posterior spine)!
  // Let's map UV (u, v) -> Canvas (u * size, (1 - v) * size) consistently!
  const uvToXY = (u, v) => [u * size, (1.0 - v) * size];

  // Fill background with outer skin tone so UV boundaries never bleed black
  ctx.fillStyle = skinColor;
  ctx.fillRect(0, 0, size, size);

  // 1. Outer Epidermis & Dermis Cut Rim (v=0.5, u=0.5, radius R)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.04, 0, Math.PI * 2);
  ctx.fillStyle = skinColor;
  ctx.fill();

  // Dermis fibrous pink-ivory margin
  const dermisR = R * (1.0 - 0.025 * dermisRimScale);
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  const dermisGrad = ctx.createRadialGradient(cx, cy, dermisR * 0.92, cx, cy, R);
  dermisGrad.addColorStop(0, '#e8b4a8');
  dermisGrad.addColorStop(0.6, '#f6dcd4');
  dermisGrad.addColorStop(0.92, '#df9e8e');
  dermisGrad.addColorStop(1.0, skinColor);
  ctx.fillStyle = dermisGrad;
  ctx.fill();

  // 2. Subcutaneous Adipose Tissue Layer (Yellowish-cream fat lobules with fibrous septa)
  const fatR = dermisR * 0.965;
  ctx.beginPath();
  ctx.arc(cx, cy, fatR, 0, Math.PI * 2);
  ctx.fillStyle = '#e7bd74';
  ctx.fill();

  // Draw adipose lobules around the perimeter ring
  const numFatLobules = 76;
  for (let i = 0; i < numFatLobules; i++) {
    const ang = (i / numFatLobules) * Math.PI * 2;
    const rad = fatR * (0.935 - 0.03 * Math.sin(i * 3.7));
    const lx = cx + Math.cos(ang) * rad;
    const ly = cy + Math.sin(ang) * rad;
    ctx.save();
    ctx.translate(lx, ly);
    ctx.rotate(ang);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.013, size * 0.022, 0, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#f4d58d' : '#e5b968';
    ctx.fill();
    ctx.strokeStyle = 'rgba(195, 115, 95, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  // 3. Investing Deep Cervical Fascia Core & Connective Tissue Matrix
  const fasciaR = fatR * 0.895;
  ctx.beginPath();
  ctx.arc(cx, cy, fasciaR, 0, Math.PI * 2);
  const matrixGrad = ctx.createRadialGradient(cx, cy, size * 0.04, cx, cy, fasciaR);
  matrixGrad.addColorStop(0, '#c67d7a');
  matrixGrad.addColorStop(0.55, '#b86362');
  matrixGrad.addColorStop(0.92, '#d9aba6');
  matrixGrad.addColorStop(1.0, '#f0dedc');
  ctx.fillStyle = matrixGrad;
  ctx.fill();

  // Anterolateral Platysma thin muscle sheet inside subcutaneous layer (anterior is top of canvas, v > 0.6)
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.beginPath();
    const startAng = side === -1 ? -Math.PI * 0.82 : -Math.PI * 0.42;
    const endAng = side === -1 ? -Math.PI * 0.58 : -Math.PI * 0.18;
    ctx.arc(cx, cy, fatR * 0.93, startAng, endAng);
    ctx.strokeStyle = '#b43c46';
    ctx.lineWidth = size * 0.014;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
  }

  // 4. Muscular Compartments (Bilateral Symmetric)
  // Remember: Anterior is v > 0.5 (Canvas Y < cy), Posterior is v < 0.5 (Canvas Y > cy)
  for (const side of [-1, 1]) {
    // (a) Sternocleidomastoid Muscle (胸锁乳突肌) - large prominent anterolateral oval
    const [scmX, scmY] = uvToXY(0.5 + side * 0.275, 0.635);
    drawMuscleCompartment(ctx, scmX, scmY, size * 0.095, size * 0.052, side * 0.68, '#982430', '#c43c48', side + 2);

    // (b) Infrahyoid Strap Muscles (舌骨下肌群: Sternohyoid & Sternothyroid) - anterior near midline
    const [strapX, strapY] = uvToXY(0.5 + side * 0.095, 0.795);
    drawMuscleCompartment(ctx, strapX, strapY, size * 0.058, size * 0.032, side * 0.22, '#9e2935', '#c84450', side + 5);

    // (c) Omohyoid superior belly
    const [omoX, omoY] = uvToXY(0.5 + side * 0.20, 0.745);
    drawMuscleCompartment(ctx, omoX, omoY, size * 0.042, size * 0.025, side * 0.45, '#92222d', '#b83844', side + 8);

    // (d) Longus Colli & Longus Capitis (颈长肌/头长肌 - prevertebral anterior to C4 body)
    const [longX, longY] = uvToXY(0.5 + side * 0.075, 0.525);
    drawMuscleCompartment(ctx, longX, longY, size * 0.046, size * 0.026, -side * 0.18, '#7d1b24', '#a32c37', side + 11);

    // (e) Anterior, Middle & Posterior Scalene Muscles (前/中/后斜角肌 - lateral to vertebra)
    const [scalX, scalY] = uvToXY(0.5 + side * 0.24, 0.44);
    drawMuscleCompartment(ctx, scalX, scalY, size * 0.068, size * 0.048, -side * 0.35, '#8a2029', '#b23440', side + 14);

    // (f) Levator Scapulae & Splenius Cervicis (肩胛提肌与头夹肌 - posterolateral)
    const [levX, levY] = uvToXY(0.5 + side * 0.28, 0.31);
    drawMuscleCompartment(ctx, levX, levY, size * 0.078, size * 0.046, -side * 0.75, '#861e28', '#ad323d', side + 19);

    // (g) Semispinalis & Multifidus (半棘肌与多裂肌 - deep posterior flanking spinous process)
    const [semiX, semiY] = uvToXY(0.5 + side * 0.115, 0.255);
    drawMuscleCompartment(ctx, semiX, semiY, size * 0.072, size * 0.044, -side * 0.42, '#7c1a22', '#a82c36', side + 23);

    // (h) Trapezius Muscle (斜方肌 - posterior superficial crescent)
    const [trapX, trapY] = uvToXY(0.5 + side * 0.175, 0.165);
    drawMuscleCompartment(ctx, trapX, trapY, size * 0.095, size * 0.036, -side * 0.30, '#962430', '#bc3b48', side + 29);
  }

  // 5. Cervical Vertebra C4 & Spinal Cord (第4颈椎横切面与椎管脊髓)
  // Vertebral arch & transverse processes & bifid spinous process
  const [vertX, vertY] = uvToXY(0.50, 0.425);
  const [cordX, cordY] = uvToXY(0.50, 0.335);

  ctx.save();
  // Posterior vertebral arch (laminae + bifid spinous process projecting toward v=0.18)
  ctx.beginPath();
  ctx.moveTo(vertX - size * 0.11, vertY);
  ctx.quadraticCurveTo(vertX - size * 0.09, cordY + size * 0.05, vertX - size * 0.028, cordY + size * 0.125);
  // Bifid tip (分叉棘突)
  ctx.lineTo(vertX - size * 0.018, cordY + size * 0.145);
  ctx.lineTo(vertX, cordY + size * 0.120);
  ctx.lineTo(vertX + size * 0.018, cordY + size * 0.145);
  ctx.lineTo(vertX + size * 0.028, cordY + size * 0.125);
  ctx.quadraticCurveTo(vertX + size * 0.09, cordY + size * 0.05, vertX + size * 0.11, vertY);
  ctx.closePath();
  ctx.fillStyle = '#ede0c8';
  ctx.fill();
  ctx.strokeStyle = '#cbb894';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Bilateral Transverse Processes with Foramina Transversaria (横突与横突孔)
  for (const side of [-1, 1]) {
    const [tpX, tpY] = uvToXY(0.50 + side * 0.115, 0.43);
    ctx.beginPath();
    ctx.ellipse(tpX, tpY, size * 0.045, size * 0.028, side * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#efe3cc';
    ctx.fill();
    ctx.strokeStyle = '#c5b08b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Foramen transversarium containing Vertebral Artery & Vein (椎动脉与椎静脉)
    const [vaX, vaY] = uvToXY(0.50 + side * 0.12, 0.43);
    ctx.beginPath();
    ctx.arc(vaX, vaY, size * 0.013, 0, Math.PI * 2);
    ctx.fillStyle = '#4a0c12';
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  // C4 Vertebral Body (C4 椎体 - Cortical rim + Trabecular cancellous bone core)
  ctx.beginPath();
  ctx.ellipse(vertX, vertY, size * 0.076, size * 0.054, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f5ead6'; // Dense ivory cortical bone rim
  ctx.fill();
  ctx.strokeStyle = '#c9b38c';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Spongy trabecular bone core inside vertebral body
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(vertX, vertY, size * 0.062, size * 0.042, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#b85d56';
  ctx.fill();
  ctx.clip();
  // Trabecular bone lattice pores
  for (let i = 0; i < 95; i++) {
    const a = i * 2.4;
    const r = Math.sqrt(i / 95);
    const bx = vertX + Math.cos(a) * size * 0.06 * r;
    const by = vertY + Math.sin(a) * size * 0.04 * r;
    ctx.beginPath();
    ctx.arc(bx, by, 2.2 + (i % 3), 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(238, 218, 192, 0.65)' : 'rgba(120, 32, 32, 0.65)';
    ctx.fill();
  }
  ctx.restore();

  // Vertebral Foramen (椎孔) & Spinal Cord (脊髓横切面)
  ctx.beginPath();
  ctx.ellipse(cordX, cordY, size * 0.050, size * 0.040, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#5a2d32'; // Epidural space
  ctx.fill();
  ctx.strokeStyle = '#dfd0b8';
  ctx.lineWidth = 2.2;
  ctx.stroke();

  // Dura mater & Subarachnoid CSF space
  ctx.beginPath();
  ctx.ellipse(cordX, cordY, size * 0.041, size * 0.032, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#8fa8b2';
  ctx.fill();

  // Spinal Cord White Matter Oval
  ctx.beginPath();
  ctx.ellipse(cordX, cordY, size * 0.035, size * 0.026, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f3ead8';
  ctx.fill();
  ctx.strokeStyle = '#d4c3a3';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Iconic Butterfly-Shaped Spinal Gray Matter Horns (脊髓灰质蝴蝶角)
  ctx.fillStyle = '#b9837e';
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(cordX + side * size * 0.013, cordY - size * 0.005, size * 0.009, size * 0.014, side * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cordX + side * size * 0.014, cordY + size * 0.007, size * 0.006, size * 0.013, -side * 0.35, 0, Math.PI * 2);
    ctx.fill();
  }
  // Grey commissure & central canal
  ctx.fillRect(cordX - size * 0.014, cordY - size * 0.003, size * 0.028, size * 0.006);
  ctx.beginPath();
  ctx.arc(cordX, cordY, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = '#4a2024';
  ctx.fill();
  ctx.restore();

  // Ligamentum nuchae (项韧带 posterior midline septum)
  ctx.beginPath();
  ctx.moveTo(cordX, cordY + size * 0.14);
  ctx.lineTo(cx, cy + fasciaR * 0.96);
  ctx.strokeStyle = 'rgba(245, 235, 225, 0.78)';
  ctx.lineWidth = 3.5;
  ctx.stroke();

  // 6. Visceral Compartment: Esophagus, Trachea & Thyroid Gland
  // (a) Esophagus (食管 - collapsed muscular tube with stellate mucosa at v=0.585)
  const [esoX, esoY] = uvToXY(0.50, 0.585);
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(esoX, esoY, size * 0.044, size * 0.028, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#9c2c38'; // Muscularis externa
  ctx.fill();
  ctx.strokeStyle = '#e8c5c0';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Submucosa & Stellate (star-shaped) esophageal lumen
  ctx.beginPath();
  ctx.ellipse(esoX, esoY, size * 0.028, size * 0.016, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e49da4';
  ctx.fill();
  ctx.beginPath();
  for (let k = 0; k < 12; k++) {
    const a = (k / 12) * Math.PI * 2;
    const r = k % 2 === 0 ? size * 0.018 : size * 0.005;
    const px = esoX + Math.cos(a) * r;
    const py = esoY + Math.sin(a) * r * 0.6;
    if (k === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#2d070c';
  ctx.fill();
  ctx.restore();

  // (b) Thyroid Gland Lobes & Isthmus (甲状腺左右叶与峡部 flanking trachea)
  const [trachX, trachY] = uvToXY(0.50, 0.705);
  for (const side of [-1, 1]) {
    const [thyX, thyY] = uvToXY(0.50 + side * 0.105, 0.675);
    ctx.save();
    ctx.translate(thyX, thyY);
    ctx.rotate(side * 0.42);
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.036, size * 0.068, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#7e1d28';
    ctx.fill();
    ctx.strokeStyle = '#e2b2ae';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // Thyroid follicles texture
    for (let i = 0; i < 22; i++) {
      const a = i * 2.1;
      const r = Math.sqrt(i / 22) * 0.8;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * size * 0.028 * r, Math.sin(a) * size * 0.056 * r, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(190, 55, 65, 0.65)';
      ctx.fill();
    }
    ctx.restore();
  }

  // (c) Trachea (气管横切面: Hyaline cartilage C-ring + pink mucosa + recessed dark airway lumen)
  ctx.save();
  // Outer perichondrium & C-shaped hyaline cartilage ring (pearly bluish-white)
  ctx.beginPath();
  ctx.ellipse(trachX, trachY, size * 0.068, size * 0.062, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#d8e6ec'; // Pearly hyaline cartilage
  ctx.fill();
  ctx.strokeStyle = '#9bb8c4';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Posterior trachealis muscle gap on the C-ring (facing esophagus at bottom of trachea)
  ctx.beginPath();
  ctx.ellipse(trachX, trachY + size * 0.046, size * 0.044, size * 0.018, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#b84b56';
  ctx.fill();

  // Inner mucosal ring
  ctx.beginPath();
  ctx.ellipse(trachX, trachY, size * 0.050, size * 0.045, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e58c96';
  ctx.fill();

  // Deeply recessed Tracheal Airway Lumen (dark cavity with depth gradient)
  ctx.beginPath();
  ctx.ellipse(trachX, trachY, size * 0.043, size * 0.038, 0, 0, Math.PI * 2);
  const lumenGrad = ctx.createRadialGradient(trachX, trachY - size * 0.01, size * 0.005, trachX, trachY, size * 0.045);
  lumenGrad.addColorStop(0, '#120306');
  lumenGrad.addColorStop(0.75, '#26080e');
  lumenGrad.addColorStop(1, '#581622');
  ctx.fillStyle = lumenGrad;
  ctx.fill();
  ctx.restore();

  // 7. Bilateral Carotid Sheaths (双侧颈动脉鞘: Common Carotid Artery, Internal Jugular Vein, Vagus Nerve)
  for (const side of [-1, 1]) {
    // Fascial carotid sheath envelope
    const [csX, csY] = uvToXY(0.50 + side * 0.195, 0.56);
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(csX, csY, size * 0.072, size * 0.050, side * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(244, 228, 224, 0.52)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 242, 238, 0.75)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // (a) Common Carotid Artery (颈总动脉 - medial, thick round muscular arterial wall)
    const [caX, caY] = uvToXY(0.50 + side * 0.162, 0.565);
    ctx.beginPath();
    ctx.arc(caX, caY, size * 0.026, 0, Math.PI * 2);
    ctx.fillStyle = '#f07882'; // Thick tunica media
    ctx.fill();
    ctx.strokeStyle = '#c81e2b';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(caX, caY, size * 0.016, 0, Math.PI * 2);
    ctx.fillStyle = vascularContrast > 1.1 ? '#7f0912' : '#4a060b'; // Arterial lumen
    ctx.fill();

    // (b) Internal Jugular Vein (颈内静脉 - lateral, larger oval thinner-walled dark venous blue-purple lumen)
    const [ijvX, ijvY] = uvToXY(0.50 + side * 0.228, 0.555);
    ctx.beginPath();
    ctx.ellipse(ijvX, ijvY, size * 0.032, size * 0.024, side * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#6c7ea8';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(ijvX, ijvY, size * 0.025, size * 0.018, side * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#191d38'; // Deep venous lumen
    ctx.fill();

    // (c) Vagus Nerve CN X (迷走神经 - posterior between artery and vein)
    const [vnX, vnY] = uvToXY(0.50 + side * 0.192, 0.532);
    ctx.beginPath();
    ctx.arc(vnX, vnY, size * 0.0075, 0, Math.PI * 2);
    ctx.fillStyle = '#f7e594';
    ctx.fill();
    ctx.strokeStyle = '#b4943e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // Superficial veins (Anterior Jugular & External Jugular small lumens)
  for (const side of [-1, 1]) {
    const [ajvX, ajvY] = uvToXY(0.50 + side * 0.055, 0.855);
    ctx.beginPath();
    ctx.arc(ajvX, ajvY, size * 0.007, 0, Math.PI * 2);
    ctx.fillStyle = '#242b54';
    ctx.fill();
    ctx.strokeStyle = '#8fa4d4';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const [ejvX, ejvY] = uvToXY(0.50 + side * 0.355, 0.585);
    ctx.beginPath();
    ctx.arc(ejvX, ejvY, size * 0.009, 0, Math.PI * 2);
    ctx.fillStyle = '#242b54';
    ctx.fill();
    ctx.strokeStyle = '#8fa4d4';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // 8. Optional Anatomical Callout Labels (for 2D/3D Atlas Inspection)
  if (showLabels) {
    ctx.save();
    ctx.font = `600 ${Math.round(size * 0.019)}px "JetBrains Mono", "PingFang SC", sans-serif`;
    for (const item of ANATOMY_LABELS) {
      const [lx, ly] = uvToXY(item.u, item.v);
      ctx.beginPath();
      ctx.arc(lx, ly, size * 0.006, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.stroke();

      const textW = ctx.measureText(item.name).width;
      const boxX = lx > cx ? lx + 12 : lx - textW - 20;
      const boxY = ly - 12;
      ctx.fillStyle = 'rgba(9, 13, 22, 0.84)';
      ctx.fillRect(boxX, boxY, textW + 10, 22);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX, boxY, textW + 10, 22);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(item.name, boxX + 5, boxY + 16);
    }
    ctx.restore();
  }
}

export function createAnatomyTextures(options = {}) {
  const size = 1024;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  renderAnatomyCrossSectionToCanvas(colorCanvas, options);

  // Create matching Bump / Height Map from luminance & anatomical features
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
    // Bone/cartilage/fascia (high luminance) protrudes; dark lumens (low luminance) recess
    const lum = Math.min(255, Math.max(0, Math.round(0.35 * r + 0.45 * g + 0.2 * b)));
    data[i] = lum;
    data[i + 1] = lum;
    data[i + 2] = lum;
  }
  bctx.putImageData(imgData, 0, 0);

  const colorTex = new THREE.CanvasTexture(colorCanvas);
  colorTex.colorSpace = THREE.SRGBColorSpace;
  colorTex.anisotropy = 8;
  colorTex.needsUpdate = true;

  const bumpTex = new THREE.CanvasTexture(bumpCanvas);
  bumpTex.anisotropy = 4;
  bumpTex.needsUpdate = true;

  return { colorTex, bumpTex, colorCanvas };
}
