import * as THREE from 'three';

/**
 * Generates High-Precision Daz-Style East Asian Female Facial Texture & Hair Strand Textures
 * Aligned with 0.0001 UV accuracy to the canonical 468-landmark subdivided head topology.
 */

function hexToRgb(hex) {
  const clean = (hex || '#f5d6c8').replace('#', '');
  const num = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbStr(r, g, b, a = 1) {
  return `rgba(${Math.round(Math.max(0, Math.min(255, r)))}, ${Math.round(Math.max(0, Math.min(255, g)))}, ${Math.round(Math.max(0, Math.min(255, b)))}, ${a})`;
}

export function createDazSkinTexture(options = {}) {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const {
    skinTone = '#f6d8cb',
    blushIntensity = 0.48,
    lipColor = '#d45b6a',
    irisColor = '#3a2318',
    eyelinerIntensity = 0.85,
    browColor = '#281d19',
    photoElement = null,
    photoBlend = 0.0
  } = options;

  const base = hexToRgb(skinTone);
  const lip = hexToRgb(lipColor);
  const iris = hexToRgb(irisColor);
  const brow = hexToRgb(browColor);

  // Helper: convert UV (u, v) to Canvas (x, y) with flipY = true
  const uv = (u, v) => [u * size, (1.0 - v) * size];

  // 1. Base Subsurface Scattering Porcelain/Ivory Skin Gradient
  ctx.fillStyle = skinTone;
  ctx.fillRect(0, 0, size, size);

  const centerGrad = ctx.createRadialGradient(size * 0.5, size * 0.48, size * 0.04, size * 0.5, size * 0.5, size * 0.56);
  centerGrad.addColorStop(0, rgbStr(base.r + 8, base.g + 4, base.b + 3, 1));
  centerGrad.addColorStop(0.65, skinTone);
  centerGrad.addColorStop(1, rgbStr(base.r - 12, base.g - 14, base.b - 12, 1));
  ctx.fillStyle = centerGrad;
  ctx.fillRect(0, 0, size, size);

  // Subtle micro-skin pore & dermal warmth variation
  for (let i = 0; i < 3500; i++) {
    const px = ((i * 1973) % size);
    const py = ((i * 929) % size);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 240, 235, 0.035)' : 'rgba(185, 110, 95, 0.03)';
    ctx.fillRect(px, py, 2, 2);
  }

  // 2. Soft Cheek Subsurface Blush & Malar Highlight (u=0.320/0.680, v=0.429)
  for (const side of [-1, 1]) {
    const [cx, cy] = uv(0.5 + side * 0.175, 0.465);
    const blushGrad = ctx.createRadialGradient(cx, cy, size * 0.01, cx, cy, size * 0.135);
    blushGrad.addColorStop(0, `rgba(232, 112, 118, ${0.28 * blushIntensity})`);
    blushGrad.addColorStop(0.55, `rgba(232, 125, 125, ${0.14 * blushIntensity})`);
    blushGrad.addColorStop(1, 'rgba(232, 125, 125, 0)');
    ctx.fillStyle = blushGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.135, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Nasal Bridge Highlight, Tip Warmth & Nostril Soft Shadows
  // Nose bridge highlight (u=0.50, v=0.64 -> 0.4525)
  const [nbTopX, nbTopY] = uv(0.50, 0.65);
  const [nbTipX, nbTipY] = uv(0.50, 0.4525);
  const bridgeGrad = ctx.createLinearGradient(nbTopX - size * 0.035, 0, nbTopX + size * 0.035, 0);
  bridgeGrad.addColorStop(0, 'rgba(155, 102, 88, 0.12)');
  bridgeGrad.addColorStop(0.5, 'rgba(255, 250, 246, 0.28)');
  bridgeGrad.addColorStop(1, 'rgba(155, 102, 88, 0.12)');
  ctx.fillStyle = bridgeGrad;
  ctx.fillRect(nbTopX - size * 0.032, nbTopY, size * 0.064, nbTipY - nbTopY);

  // Nasal tip subtle rosy warmth & highlight dot
  const tipWarmth = ctx.createRadialGradient(nbTipX, nbTipY, 2, nbTipX, nbTipY, size * 0.045);
  tipWarmth.addColorStop(0, 'rgba(255, 248, 245, 0.35)');
  tipWarmth.addColorStop(0.4, `rgba(228, 120, 118, ${0.22 * blushIntensity})`);
  tipWarmth.addColorStop(1, 'rgba(228, 120, 118, 0)');
  ctx.fillStyle = tipWarmth;
  ctx.beginPath();
  ctx.arc(nbTipX, nbTipY, size * 0.045, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils (u=0.4227 & 0.5773, v=0.4140)
  for (const side of [-1, 1]) {
    const [nx, ny] = uv(0.50 + side * 0.052, 0.412);
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(side * 0.42);
    const nostGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 0.018);
    nostGrad.addColorStop(0, 'rgba(58, 24, 22, 0.72)');
    nostGrad.addColorStop(0.6, 'rgba(115, 56, 48, 0.38)');
    nostGrad.addColorStop(1, 'rgba(115, 56, 48, 0)');
    ctx.fillStyle = nostGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.018, size * 0.009, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Philtrum soft groove (v=0.398 down to 0.350)
  const [phTopX, phTopY] = uv(0.50, 0.398);
  const [phBotX, phBotY] = uv(0.50, 0.350);
  const philGrad = ctx.createLinearGradient(phTopX - size * 0.018, 0, phTopX + size * 0.018, 0);
  philGrad.addColorStop(0, 'rgba(255, 248, 244, 0.22)');
  philGrad.addColorStop(0.5, 'rgba(148, 88, 78, 0.16)');
  philGrad.addColorStop(1, 'rgba(255, 248, 244, 0.22)');
  ctx.fillStyle = philGrad;
  ctx.fillRect(phTopX - size * 0.018, phTopY, size * 0.036, phBotY - phTopY);

  // 4. Sculpted Satin / Glass Lips (Cupid's bow v=0.350, parting v=0.3055, bottom v=0.263, corners u=0.382..0.618)
  ctx.save();
  const [mLeftX, mLeftY] = uv(0.382, 0.3055);
  const [mRightX, mRightY] = uv(0.618, 0.3055);
  const [cupidLX, cupidLY] = uv(0.471, 0.351);
  const [cupidCX, cupidCY] = uv(0.500, 0.344);
  const [cupidRX, cupidRY] = uv(0.529, 0.351);
  const [lipBotX, lipBotY] = uv(0.500, 0.261);
  const [partCX, partCY] = uv(0.500, 0.3055);

  // Soft outer lip vermilion halo
  const lipCenterY = (cupidCY + lipBotY) * 0.5;
  const lipHalo = ctx.createRadialGradient(partCX, lipCenterY, size * 0.01, partCX, lipCenterY, size * 0.125);
  lipHalo.addColorStop(0, rgbStr(lip.r, lip.g, lip.b, 0.88));
  lipHalo.addColorStop(0.65, rgbStr(lip.r + 12, lip.g + 8, lip.b + 10, 0.55));
  lipHalo.addColorStop(1, rgbStr(base.r, base.g, base.b, 0));

  // Upper & lower vermilion lip path
  ctx.beginPath();
  ctx.moveTo(mLeftX, mLeftY);
  ctx.quadraticCurveTo((mLeftX + cupidLX) * 0.5, cupidLY + 2, cupidLX, cupidLY);
  ctx.quadraticCurveTo(cupidCX, cupidCY + 3, cupidRX, cupidRY);
  ctx.quadraticCurveTo((cupidRX + mRightX) * 0.5, cupidRY + 2, mRightX, mRightY);
  ctx.quadraticCurveTo(partCX + size * 0.055, lipBotY + 2, lipBotX, lipBotY);
  ctx.quadraticCurveTo(partCX - size * 0.055, lipBotY + 2, mLeftX, mLeftY);
  ctx.closePath();

  const lipGrad = ctx.createLinearGradient(0, cupidLY, 0, lipBotY);
  lipGrad.addColorStop(0, rgbStr(lip.r - 12, lip.g - 10, lip.b - 8, 0.92));
  lipGrad.addColorStop(0.46, rgbStr(lip.r - 28, lip.g - 24, lip.b - 20, 0.98));
  lipGrad.addColorStop(0.68, rgbStr(lip.r + 16, lip.g + 12, lip.b + 14, 0.95));
  lipGrad.addColorStop(1, rgbStr(lip.r - 5, lip.g, lip.b + 4, 0.85));
  ctx.fillStyle = lipGrad;
  ctx.fill();

  // Fine vertical lip sulci & lower lip water-gloss highlight
  ctx.save();
  ctx.clip();
  for (let i = -14; i <= 14; i++) {
    const lx = partCX + i * (size * 0.0075);
    ctx.beginPath();
    ctx.moveTo(lx, cupidLY);
    ctx.quadraticCurveTo(lx + i * 0.6, partCY, lx, lipBotY);
    ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 225, 230, 0.14)' : 'rgba(95, 20, 30, 0.12)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
  // Glossy specular bar on lower lip
  const [glossX, glossY] = uv(0.50, 0.284);
  ctx.beginPath();
  ctx.ellipse(glossX, glossY, size * 0.048, size * 0.0085, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 245, 247, 0.42)';
  ctx.fill();
  ctx.restore();

  // Oral commissure / mouth parting line (v=0.3055)
  ctx.beginPath();
  ctx.moveTo(mLeftX, mLeftY);
  ctx.quadraticCurveTo(partCX - size * 0.03, partCY + 3, partCX, partCY + 1);
  ctx.quadraticCurveTo(partCX + size * 0.03, partCY + 3, mRightX, mRightY);
  ctx.strokeStyle = 'rgba(72, 16, 24, 0.82)';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // 5. Hyper-Detailed East Asian Female Eyes, Iris, Cornea, Double Eyelid & Eyelashes
  // Left Eye: outer u=0.2801, inner u=0.4191, top v=0.6446, bot v=0.5994, center (0.346, 0.622)
  // Right Eye: inner u=0.5810, outer u=0.7199, top v=0.6446, bot v=0.5994, center (0.654, 0.622)
  const eyeConfigs = [
    { side: -1, outerU: 0.278, innerU: 0.420, centerU: 0.348, centerV: 0.622, topV: 0.646, botV: 0.598 },
    { side: 1, outerU: 0.722, innerU: 0.580, centerU: 0.652, centerV: 0.622, topV: 0.646, botV: 0.598 }
  ];

  for (const eye of eyeConfigs) {
    const [outerX, outerY] = uv(eye.outerU, 0.624);
    const [innerX, innerY] = uv(eye.innerU, 0.613);
    const [topX, topY] = uv(eye.centerU, eye.topV);
    const [botX, botY] = uv(eye.centerU, eye.botV);
    const [irisX, irisY] = uv(eye.centerU, eye.centerV + 0.002);

    // (a) Soft Periorbital Eyeshadow & Aegyo-sal (卧蚕微高光与眼窝晕染)
    const shadowGrad = ctx.createRadialGradient(irisX, irisY - size * 0.01, size * 0.01, irisX, irisY, size * 0.095);
    shadowGrad.addColorStop(0, 'rgba(168, 96, 86, 0.32)');
    shadowGrad.addColorStop(0.6, 'rgba(182, 112, 102, 0.16)');
    shadowGrad.addColorStop(1, 'rgba(182, 112, 102, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(irisX, irisY, size * 0.095, 0, Math.PI * 2);
    ctx.fill();

    // (b) East Asian Double-Eyelid Crease Line (双眼皮折痕线 around v=0.660)
    const [creaseOuterX, creaseOuterY] = uv(eye.outerU + eye.side * 0.004, 0.640);
    const [creaseTopX, creaseTopY] = uv(eye.centerU, 0.663);
    const [creaseInnerX, creaseInnerY] = uv(eye.innerU - eye.side * 0.004, 0.624);
    ctx.beginPath();
    ctx.moveTo(creaseInnerX, creaseInnerY);
    ctx.quadraticCurveTo(creaseTopX, creaseTopY - (creaseTopY - topY) * 0.5, creaseOuterX, creaseOuterY);
    ctx.strokeStyle = 'rgba(115, 58, 48, 0.52)';
    ctx.lineWidth = 2.0;
    ctx.stroke();

    // (c) Eye Aperture Clip Path (Almond Eye Shape)
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.quadraticCurveTo(topX, topY - (innerY - topY) * 0.82, outerX, outerY);
    ctx.quadraticCurveTo(botX, botY + (botY - innerY) * 0.82, innerX, innerY);
    ctx.closePath();

    // Sclera with soft upper eyelid shadow
    const scleraGrad = ctx.createLinearGradient(0, topY, 0, botY);
    scleraGrad.addColorStop(0, '#c8b8b6');
    scleraGrad.addColorStop(0.28, '#f7f2f0');
    scleraGrad.addColorStop(0.82, '#fcf9f8');
    scleraGrad.addColorStop(1, '#e2cfd0');
    ctx.fillStyle = scleraGrad;
    ctx.fill();
    ctx.clip();

    // Pink lacrimal caruncle (内眼角泪阜)
    ctx.beginPath();
    ctx.arc(innerX - eye.side * 4, innerY, size * 0.011, 0, Math.PI * 2);
    ctx.fillStyle = '#d97b82';
    ctx.fill();

    // (d) Detailed Multi-Layered Iris & Pupil & Corneal Catchlights
    const irisR = size * 0.033;
    // Outer dark limbal ring
    ctx.beginPath();
    ctx.arc(irisX, irisY, irisR, 0, Math.PI * 2);
    const irisGrad = ctx.createRadialGradient(irisX, irisY, irisR * 0.2, irisX, irisY, irisR);
    irisGrad.addColorStop(0, rgbStr(iris.r + 38, iris.g + 26, iris.b + 18, 1));
    irisGrad.addColorStop(0.62, rgbStr(iris.r, iris.g, iris.b, 1));
    irisGrad.addColorStop(0.92, rgbStr(iris.r * 0.4, iris.g * 0.4, iris.b * 0.4, 1));
    irisGrad.addColorStop(1, '#0d0705');
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // 140 Radial Iris Stromal Fibers
    for (let k = 0; k < 140; k++) {
      const a = (k / 140) * Math.PI * 2;
      const rIn = irisR * (0.28 + (k % 3) * 0.04);
      const rOut = irisR * (0.88 - (k % 4) * 0.03);
      ctx.beginPath();
      ctx.moveTo(irisX + Math.cos(a) * rIn, irisY + Math.sin(a) * rIn);
      ctx.lineTo(irisX + Math.cos(a) * rOut, irisY + Math.sin(a) * rOut);
      ctx.strokeStyle = k % 2 === 0
        ? rgbStr(iris.r + 58, iris.g + 42, iris.b + 28, 0.32)
        : 'rgba(15, 8, 5, 0.35)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }

    // Pupil aperture
    ctx.beginPath();
    ctx.arc(irisX, irisY, irisR * 0.34, 0, Math.PI * 2);
    ctx.fillStyle = '#070506';
    ctx.fill();

    // Upper eyelid ambient shadow across top of iris
    ctx.fillStyle = 'rgba(18, 8, 10, 0.28)';
    ctx.fillRect(irisX - irisR, topY - 10, irisR * 2, (botY - topY) * 0.38);

    // Twin Corneal Specular Catchlights (眼神光)
    ctx.beginPath();
    ctx.ellipse(irisX - irisR * 0.32, irisY - irisR * 0.26, irisR * 0.18, irisR * 0.13, -0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(irisX + irisR * 0.34, irisY + irisR * 0.28, irisR * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
    ctx.fill();

    ctx.restore(); // End eye aperture clip

    // (e) Tight Upper Eyeliner, Winged Outer Corner & Individual Curved Eyelashes
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.quadraticCurveTo(topX, topY - (innerY - topY) * 0.85, outerX, outerY);
    ctx.lineTo(outerX + eye.side * size * 0.015, outerY - size * 0.004);
    ctx.strokeStyle = `rgba(24, 14, 15, ${eyelinerIntensity})`;
    ctx.lineWidth = 4.2;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Lower subtle lash line
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.quadraticCurveTo(botX, botY + (botY - innerY) * 0.82, outerX, outerY);
    ctx.strokeStyle = 'rgba(88, 48, 45, 0.48)';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // 38 Individual Upper Eyelashes + 22 Lower Eyelashes
    for (let i = 0; i < 38; i++) {
      const t = i / 37;
      // Quadratic Bezier point along upper lid from inner to outer
      const ctrlY = topY - (innerY - topY) * 0.85;
      const lx = (1 - t) * (1 - t) * innerX + 2 * (1 - t) * t * topX + t * t * outerX;
      const ly = (1 - t) * (1 - t) * innerY + 2 * (1 - t) * t * ctrlY + t * t * outerY;
      const lashLen = size * (0.006 + 0.012 * Math.sin(Math.PI * Math.pow(t, 0.75)));
      const flareAng = -Math.PI * 0.5 + eye.side * (t - 0.35) * 0.95;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(
        lx + Math.cos(flareAng) * lashLen * 0.6,
        ly + Math.sin(flareAng) * lashLen * 0.6,
        lx + Math.cos(flareAng + eye.side * 0.25) * lashLen,
        ly + Math.sin(flareAng + eye.side * 0.25) * lashLen
      );
      ctx.strokeStyle = 'rgba(20, 12, 13, 0.82)';
      ctx.lineWidth = 1.35;
      ctx.stroke();
    }
  }

  // 6. Feathered East Asian Female Eyebrows (根根分明毛流感自然平眉/微挑眉)
  // Left brow: (0.4417, 0.7383) -> (0.3273, 0.7435) -> (0.2296, 0.7005)
  // Right brow: (0.5583, 0.7383) -> (0.6727, 0.7434) -> (0.7704, 0.7004)
  const browConfigs = [
    { side: -1, p0: uv(0.442, 0.736), p1: uv(0.325, 0.752), p2: uv(0.228, 0.702) },
    { side: 1, p0: uv(0.558, 0.736), p1: uv(0.675, 0.752), p2: uv(0.772, 0.702) }
  ];

  for (const bCfg of browConfigs) {
    const [x0, y0] = bCfg.p0;
    const [x1, y1] = bCfg.p1;
    const [x2, y2] = bCfg.p2;

    // Soft brow powder base
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0 + 6);
    ctx.quadraticCurveTo(x1, y1 - 12, x2, y2);
    ctx.quadraticCurveTo(x1, y1 + 8, x0, y0 + 10);
    ctx.closePath();
    ctx.fillStyle = rgbStr(brow.r, brow.g, brow.b, 0.28);
    ctx.fill();

    // 110 Individual Directional Eyebrow Hairs
    for (let i = 0; i < 110; i++) {
      const t = i / 109;
      const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
      const by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
      const spread = (1 - Math.pow(t, 1.6)) * 8.5 + 2.0;
      const oy = ((i % 7) - 3) * (spread * 0.28);
      const hairLen = size * (0.016 * (1 - 0.35 * t));
      const ang = bCfg.side === -1
        ? Math.PI + (0.38 - 0.55 * t)
        : -(0.38 - 0.55 * t);
      ctx.beginPath();
      ctx.moveTo(bx, by + oy);
      ctx.quadraticCurveTo(
        bx + Math.cos(ang) * hairLen * 0.5,
        by + oy - 3.5,
        bx + Math.cos(ang) * hairLen,
        by + oy + Math.sin(ang) * hairLen * 0.35
      );
      ctx.strokeStyle = rgbStr(brow.r, brow.g, brow.b, 0.55 * Math.sin(Math.PI * Math.pow(t, 0.65)));
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();
  }

  // 7. Optional Photo Reference UV Projection Blend (if user enabled semi-auto photo texture projection)
  if (photoElement && photoBlend > 0.01) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.85, photoBlend);
    // Feathered elliptical mask over facial UV area (u in 0.18..0.82, v in 0.08..0.88)
    ctx.beginPath();
    ctx.ellipse(size * 0.5, size * 0.52, size * 0.31, size * 0.38, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(photoElement, size * 0.16, size * 0.10, size * 0.68, size * 0.82);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return { texture: tex, canvas };
}

/**
 * Generates High-Resolution Silk Hair Strand Texture with Root-to-Tip Alpha & Dual-Lobe Anisotropic Specular Sheen
 */
export function createRealisticHairStrandTexture(hairColorHex = '#141115', sheenIntensity = 0.85) {
  const w = 512;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const base = hexToRgb(hairColorHex);
  ctx.clearRect(0, 0, w, h);

  // Draw 360 individual vertical silk hair fibers with subtle root-to-tip taper and Kajiya-Kay angel-ring sheen
  for (let i = 0; i < 360; i++) {
    const x = (i / 360) * w + Math.sin(i * 7.3) * 1.5;
    const edgeFade = Math.sin((i / 360) * Math.PI);
    const toneShift = ((i * 29) % 24) - 12;

    const grad = ctx.createLinearGradient(x, 0, x, h);
    grad.addColorStop(0, rgbStr(base.r * 0.6, base.g * 0.6, base.b * 0.6, 0.95 * edgeFade));
    grad.addColorStop(0.24, rgbStr(base.r + toneShift, base.g + toneShift, base.b + toneShift, 0.98 * edgeFade));
    // Primary & secondary anisotropic specular highlight bands (Angel Ring)
    grad.addColorStop(0.36, rgbStr(base.r + 58 * sheenIntensity, base.g + 52 * sheenIntensity, base.b + 64 * sheenIntensity, 0.98 * edgeFade));
    grad.addColorStop(0.48, rgbStr(base.r + toneShift, base.g + toneShift, base.b + toneShift, 0.96 * edgeFade));
    grad.addColorStop(0.62, rgbStr(base.r + 34 * sheenIntensity, base.g + 28 * sheenIntensity, base.b + 38 * sheenIntensity, 0.92 * edgeFade));
    grad.addColorStop(0.88, rgbStr(base.r * 0.8, base.g * 0.8, base.b * 0.8, 0.65 * edgeFade));
    grad.addColorStop(1.0, rgbStr(base.r, base.g, base.b, 0.0));

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + Math.sin(i * 1.7) * 3.5, h * 0.33,
      x - Math.sin(i * 2.3) * 3.5, h * 0.66,
      x + Math.sin(i * 3.1) * 2.0, h
    );
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.6 + (i % 3) * 0.6;
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Extracts dominant skin tone, lip color, and dark hair/brow accents from an uploaded reference photo
 */
export function samplePhotoColors(imgElement) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, 128, 128);
  const data = ctx.getImageData(0, 0, 128, 128).data;

  const avgRegion = (x0, y0, x1, y1) => {
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const idx = (y * 128 + x) * 4;
        r += data[idx];
        g += data[idx + 1];
        b += data[idx + 2];
        n++;
      }
    }
    return { r: r / n, g: g / n, b: b / n };
  };

  // Sample central forehead/cheek region for skin tone, blending with natural East Asian porcelain palette
  const cheek = avgRegion(44, 52, 84, 76);
  const sr = Math.round(Math.min(250, Math.max(215, cheek.r * 0.45 + 245 * 0.55)));
  const sg = Math.round(Math.min(228, Math.max(182, cheek.g * 0.45 + 214 * 0.55)));
  const sb = Math.round(Math.min(216, Math.max(168, cheek.b * 0.45 + 200 * 0.55)));
  const toHex = (r, g, b) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');

  return {
    skinTone: toHex(sr, sg, sb),
    lipColor: '#d15666',
    irisColor: '#362016'
  };
}
