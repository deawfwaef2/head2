import * as THREE from 'three';

/**
 * High-Precision Daz-Style East Asian Female Facial Texture & Lustrous Silk Hair Texture Generator
 * Specifically engineered to eliminate UV bleed on neck/chin and deliver expressive East Asian beauty features.
 */

function hexToRgb(hex) {
  const clean = (hex || '#f6d8cb').replace('#', '');
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean;
  const num = parseInt(full, 16) || 0xf6d8cb;
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
    skinTone = '#f7d9cc',
    blushIntensity = 0.52,
    lipColor = '#d45868',
    irisColor = '#362015',
    eyelinerIntensity = 0.90,
    browColor = '#261b18',
    photoElement = null,
    photoBlend = 0.0
  } = options;

  const base = hexToRgb(skinTone);
  const lip = hexToRgb(lipColor);
  const iris = hexToRgb(irisColor);
  const brow = hexToRgb(browColor);

  // Convert UV (u, v) to Canvas (x, y) with flipY = true
  const uv = (u, v) => [u * size, (1.0 - v) * size];

  // 1. Base Porcelain Subsurface Scattering Skin Tone (Uniform on outer neck/cranium margins!)
  ctx.fillStyle = skinTone;
  ctx.fillRect(0, 0, size, size);

  // Soft warm T-zone & central face glow
  const faceGlow = ctx.createRadialGradient(size * 0.5, size * 0.46, size * 0.03, size * 0.5, size * 0.48, size * 0.36);
  faceGlow.addColorStop(0, rgbStr(base.r + 7, base.g + 5, base.b + 5, 1));
  faceGlow.addColorStop(0.75, skinTone);
  faceGlow.addColorStop(1, skinTone);
  ctx.fillStyle = faceGlow;
  ctx.fillRect(0, 0, size, size);

  // 2. Soft Peach/Rose Apple Cheek Blush (u=0.33/0.67, v=0.48)
  for (const side of [-1, 1]) {
    const [cx, cy] = uv(0.5 + side * 0.165, 0.485);
    const blushGrad = ctx.createRadialGradient(cx, cy, size * 0.008, cx, cy, size * 0.125);
    blushGrad.addColorStop(0, `rgba(238, 118, 126, ${0.30 * blushIntensity})`);
    blushGrad.addColorStop(0.55, `rgba(238, 130, 135, ${0.14 * blushIntensity})`);
    blushGrad.addColorStop(1, 'rgba(238, 130, 135, 0)');
    ctx.fillStyle = blushGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.125, 0, Math.PI * 2);
    ctx.fill();
  }

  // 3. Delicate Nasal Bridge Contour, Highlight & Petite Nostrils
  const [nbTopX, nbTopY] = uv(0.50, 0.645);
  const [nbTipX, nbTipY] = uv(0.50, 0.456);

  // Subtle side nose shadow lines (柔和鼻影)
  for (const side of [-1, 1]) {
    const sx = nbTopX + side * size * 0.026;
    const sGrad = ctx.createLinearGradient(0, nbTopY, 0, nbTipY);
    sGrad.addColorStop(0, 'rgba(150, 95, 82, 0.16)');
    sGrad.addColorStop(0.5, 'rgba(150, 95, 82, 0.09)');
    sGrad.addColorStop(1, 'rgba(150, 95, 82, 0)');
    ctx.strokeStyle = sGrad;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(sx, nbTopY);
    ctx.quadraticCurveTo(nbTopX + side * size * 0.018, (nbTopY + nbTipY) * 0.5, nbTopX + side * size * 0.024, nbTipY);
    ctx.stroke();
  }

  // Nasal bridge pearl highlight line
  const bridgeHi = ctx.createLinearGradient(0, nbTopY, 0, nbTipY);
  bridgeHi.addColorStop(0, 'rgba(255, 252, 250, 0.35)');
  bridgeHi.addColorStop(0.7, 'rgba(255, 252, 250, 0.42)');
  bridgeHi.addColorStop(1, 'rgba(255, 252, 250, 0)');
  ctx.strokeStyle = bridgeHi;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(nbTopX, nbTopY + 8);
  ctx.lineTo(nbTipX, nbTipY - 8);
  ctx.stroke();

  // Nose tip blush & pearl dot
  const tipGlow = ctx.createRadialGradient(nbTipX, nbTipY, 1, nbTipX, nbTipY, size * 0.036);
  tipGlow.addColorStop(0, 'rgba(255, 250, 248, 0.48)');
  tipGlow.addColorStop(0.38, `rgba(235, 122, 124, ${0.22 * blushIntensity})`);
  tipGlow.addColorStop(1, 'rgba(235, 122, 124, 0)');
  ctx.fillStyle = tipGlow;
  ctx.beginPath();
  ctx.arc(nbTipX, nbTipY, size * 0.036, 0, Math.PI * 2);
  ctx.fill();

  // Petite Nostrils (u = 0.462 & 0.538, v = 0.415)
  for (const side of [-1, 1]) {
    const [nx, ny] = uv(0.50 + side * 0.038, 0.415);
    ctx.save();
    ctx.translate(nx, ny);
    ctx.rotate(side * 0.48);
    const nGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, size * 0.012);
    nGrad.addColorStop(0, 'rgba(68, 28, 25, 0.62)');
    nGrad.addColorStop(0.65, 'rgba(130, 68, 58, 0.25)');
    nGrad.addColorStop(1, 'rgba(130, 68, 58, 0)');
    ctx.fillStyle = nGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.012, size * 0.006, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // 4. Petite Gradient Petal / Water-Gloss Lips (花瓣渐层水光唇)
  // Narrower, softer, feathered edges so lips look natural and plump
  ctx.save();
  const [mLeftX, mLeftY] = uv(0.402, 0.308);
  const [mRightX, mRightY] = uv(0.598, 0.308);
  const [cupidLX, cupidLY] = uv(0.474, 0.352);
  const [cupidCX, cupidCY] = uv(0.500, 0.345);
  const [cupidRX, cupidRY] = uv(0.526, 0.352);
  const [lipBotX, lipBotY] = uv(0.500, 0.264);
  const [partCX, partCY] = uv(0.500, 0.307);

  ctx.beginPath();
  ctx.moveTo(mLeftX, mLeftY);
  ctx.quadraticCurveTo((mLeftX + cupidLX) * 0.5, cupidLY + 2, cupidLX, cupidLY);
  ctx.quadraticCurveTo(cupidCX, cupidCY + 3, cupidRX, cupidRY);
  ctx.quadraticCurveTo((cupidRX + mRightX) * 0.5, cupidRY + 2, mRightX, mRightY);
  ctx.quadraticCurveTo(partCX + size * 0.048, lipBotY + 2, lipBotX, lipBotY);
  ctx.quadraticCurveTo(partCX - size * 0.048, lipBotY + 2, mLeftX, mLeftY);
  ctx.closePath();

  const lipGrad = ctx.createRadialGradient(partCX, partCY, size * 0.008, partCX, (cupidCY + lipBotY) * 0.5, size * 0.098);
  lipGrad.addColorStop(0, rgbStr(lip.r - 18, lip.g - 18, lip.b - 12, 0.96));
  lipGrad.addColorStop(0.52, rgbStr(lip.r + 8, lip.g + 4, lip.b + 8, 0.90));
  lipGrad.addColorStop(0.88, rgbStr(lip.r + 28, lip.g + 24, lip.b + 24, 0.52));
  lipGrad.addColorStop(1, rgbStr(base.r, base.g, base.b, 0.0));
  ctx.fillStyle = lipGrad;
  ctx.fill();

  // Water-gloss specular droplets on lower lip
  const [glossX, glossY] = uv(0.50, 0.285);
  ctx.beginPath();
  ctx.ellipse(glossX - 10, glossY, size * 0.022, size * 0.0055, -0.08, 0, Math.PI * 2);
  ctx.ellipse(glossX + 12, glossY, size * 0.016, size * 0.0045, 0.08, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 248, 250, 0.52)';
  ctx.fill();

  // Delicate smiling mouth line (微笑唇线)
  ctx.beginPath();
  ctx.moveTo(mLeftX - 3, mLeftY - 2);
  ctx.quadraticCurveTo(partCX - size * 0.028, partCY + 3, partCX, partCY + 1);
  ctx.quadraticCurveTo(partCX + size * 0.028, partCY + 3, mRightX + 3, mRightY - 2);
  ctx.strokeStyle = 'rgba(82, 22, 30, 0.78)';
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.stroke();
  ctx.restore();

  // 5. Large, Luminous East Asian Female Almond Eyes (星眸杏眼 + 卧蚕 + 双眼皮 + 纤长睫毛)
  const eyeConfigs = [
    { side: -1, outerU: 0.268, innerU: 0.422, centerU: 0.346, centerV: 0.622, topV: 0.654, botV: 0.592 },
    { side: 1, outerU: 0.732, innerU: 0.578, centerU: 0.654, centerV: 0.622, topV: 0.654, botV: 0.592 }
  ];

  for (const eye of eyeConfigs) {
    const [outerX, outerY] = uv(eye.outerU, 0.625);
    const [innerX, innerY] = uv(eye.innerU, 0.612);
    const [topX, topY] = uv(eye.centerU, eye.topV);
    const [botX, botY] = uv(eye.centerU, eye.botV);
    const [irisX, irisY] = uv(eye.centerU, eye.centerV + 0.002);

    // (a) Soft Peach-Rose Eyeshadow Halo
    const shadowGrad = ctx.createRadialGradient(irisX, irisY - 6, size * 0.015, irisX, irisY, size * 0.098);
    shadowGrad.addColorStop(0, 'rgba(182, 102, 95, 0.34)');
    shadowGrad.addColorStop(0.6, 'rgba(205, 128, 120, 0.16)');
    shadowGrad.addColorStop(1, 'rgba(205, 128, 120, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(irisX, irisY, size * 0.098, 0, Math.PI * 2);
    ctx.fill();

    // (b) Aegyo-sal (卧蚕珍珠高光 + 下缘浅影)
    const [aegyoX, aegyoY] = uv(eye.centerU, eye.botV - 0.014);
    ctx.beginPath();
    ctx.moveTo(innerX, innerY + 8);
    ctx.quadraticCurveTo(aegyoX, aegyoY + 8, outerX, outerY + 8);
    ctx.strokeStyle = 'rgba(255, 246, 242, 0.42)';
    ctx.lineWidth = 4.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(innerX + eye.side * 6, innerY + 13);
    ctx.quadraticCurveTo(aegyoX, aegyoY + 14, outerX - eye.side * 6, outerY + 12);
    ctx.strokeStyle = 'rgba(148, 86, 78, 0.24)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // (c) Parallel-Crescent Double Eyelid Fold (扇形双眼皮折痕)
    const [creaseOuterX, creaseOuterY] = uv(eye.outerU + eye.side * 0.005, 0.642);
    const [creaseTopX, creaseTopY] = uv(eye.centerU, 0.669);
    const [creaseInnerX, creaseInnerY] = uv(eye.innerU - eye.side * 0.002, 0.622);
    ctx.beginPath();
    ctx.moveTo(creaseInnerX, creaseInnerY);
    ctx.quadraticCurveTo(creaseTopX, creaseTopY - (innerY - creaseTopY) * 0.42, creaseOuterX, creaseOuterY);
    ctx.strokeStyle = 'rgba(112, 56, 48, 0.58)';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // (d) Almond Eye Aperture Clip
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.quadraticCurveTo(topX, topY - (innerY - topY) * 0.85, outerX, outerY);
    ctx.quadraticCurveTo(botX, botY + (botY - innerY) * 0.85, innerX, innerY);
    ctx.closePath();

    const scleraGrad = ctx.createLinearGradient(0, topY, 0, botY);
    scleraGrad.addColorStop(0, '#cbbec0');
    scleraGrad.addColorStop(0.25, '#faf6f5');
    scleraGrad.addColorStop(0.85, '#ffffff');
    scleraGrad.addColorStop(1, '#e6d6d8');
    ctx.fillStyle = scleraGrad;
    ctx.fill();
    ctx.clip();

    // Inner corner pink lacrimal caruncle
    ctx.beginPath();
    ctx.arc(innerX - eye.side * 4, innerY, size * 0.011, 0, Math.PI * 2);
    ctx.fillStyle = '#df828a';
    ctx.fill();

    // Large Expressive Iris (radius 0.039 * size)
    const irisR = size * 0.039;
    ctx.beginPath();
    ctx.arc(irisX, irisY, irisR, 0, Math.PI * 2);
    const irisGrad = ctx.createRadialGradient(irisX, irisY + 4, irisR * 0.15, irisX, irisY, irisR);
    irisGrad.addColorStop(0, rgbStr(iris.r + 52, iris.g + 34, iris.b + 22, 1));
    irisGrad.addColorStop(0.58, rgbStr(iris.r + 14, iris.g + 8, iris.b + 4, 1));
    irisGrad.addColorStop(0.88, rgbStr(iris.r * 0.35, iris.g * 0.35, iris.b * 0.35, 1));
    irisGrad.addColorStop(1, '#0c0706');
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // Radial iris fibers & lower warm amber crescent reflection
    for (let k = 0; k < 120; k++) {
      const a = (k / 120) * Math.PI * 2;
      const rIn = irisR * 0.30;
      const rOut = irisR * 0.86;
      ctx.beginPath();
      ctx.moveTo(irisX + Math.cos(a) * rIn, irisY + Math.sin(a) * rIn);
      ctx.lineTo(irisX + Math.cos(a) * rOut, irisY + Math.sin(a) * rOut);
      ctx.strokeStyle = k % 2 === 0
        ? rgbStr(iris.r + 68, iris.g + 46, iris.b + 30, 0.34)
        : 'rgba(12, 6, 4, 0.36)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Deep pupil
    ctx.beginPath();
    ctx.arc(irisX, irisY, irisR * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = '#060405';
    ctx.fill();

    // Upper lid soft shadow across top of iris
    ctx.fillStyle = 'rgba(15, 7, 9, 0.30)';
    ctx.fillRect(irisX - irisR, topY - 12, irisR * 2, (botY - topY) * 0.36);

    // Crystal Star Catchlights (双眼神光)
    ctx.beginPath();
    ctx.ellipse(irisX - irisR * 0.30, irisY - irisR * 0.25, irisR * 0.21, irisR * 0.15, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    ctx.fill();

    ctx.beginPath();
    ctx.arc(irisX + irisR * 0.32, irisY + irisR * 0.28, irisR * 0.095, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
    ctx.fill();
    ctx.restore(); // End eye aperture clip

    // (e) Winged Upper Eyeliner & Lush Clustered Eyelashes (漫画/写真感簇状睫毛)
    ctx.beginPath();
    ctx.moveTo(innerX, innerY);
    ctx.quadraticCurveTo(topX, topY - (innerY - topY) * 0.86, outerX, outerY);
    ctx.lineTo(outerX + eye.side * size * 0.018, outerY - size * 0.005);
    ctx.strokeStyle = `rgba(20, 11, 13, ${eyelinerIntensity})`;
    ctx.lineWidth = 4.6;
    ctx.lineCap = 'round';
    ctx.stroke();

    for (let i = 0; i < 42; i++) {
      const t = i / 41;
      const ctrlY = topY - (innerY - topY) * 0.86;
      const lx = (1 - t) * (1 - t) * innerX + 2 * (1 - t) * t * topX + t * t * outerX;
      const ly = (1 - t) * (1 - t) * innerY + 2 * (1 - t) * t * ctrlY + t * t * outerY;
      const lashLen = size * (0.007 + 0.014 * Math.sin(Math.PI * Math.pow(t, 0.72)));
      const flareAng = -Math.PI * 0.5 + eye.side * (t - 0.32) * 0.92;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.quadraticCurveTo(
        lx + Math.cos(flareAng) * lashLen * 0.55,
        ly + Math.sin(flareAng) * lashLen * 0.55,
        lx + Math.cos(flareAng + eye.side * 0.28) * lashLen,
        ly + Math.sin(flareAng + eye.side * 0.28) * lashLen
      );
      ctx.strokeStyle = 'rgba(18, 10, 12, 0.86)';
      ctx.lineWidth = i % 3 === 0 ? 1.7 : 1.15;
      ctx.stroke();
    }
  }

  // 6. Soft Feathered East Asian Arch Eyebrows (柔雾野生眉)
  const browConfigs = [
    { side: -1, p0: uv(0.438, 0.735), p1: uv(0.325, 0.750), p2: uv(0.228, 0.706) },
    { side: 1, p0: uv(0.562, 0.735), p1: uv(0.675, 0.750), p2: uv(0.772, 0.706) }
  ];

  for (const bCfg of browConfigs) {
    const [x0, y0] = bCfg.p0;
    const [x1, y1] = bCfg.p1;
    const [x2, y2] = bCfg.p2;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y0 + 5);
    ctx.quadraticCurveTo(x1, y1 - 11, x2, y2);
    ctx.quadraticCurveTo(x1, y1 + 8, x0, y0 + 10);
    ctx.closePath();
    ctx.fillStyle = rgbStr(brow.r, brow.g, brow.b, 0.34);
    ctx.fill();

    for (let i = 0; i < 115; i++) {
      const t = i / 114;
      const bx = (1 - t) * (1 - t) * x0 + 2 * (1 - t) * t * x1 + t * t * x2;
      const by = (1 - t) * (1 - t) * y0 + 2 * (1 - t) * t * y1 + t * t * y2;
      const spread = (1 - Math.pow(t, 1.5)) * 8.0 + 2.0;
      const oy = ((i % 7) - 3) * (spread * 0.26);
      const hairLen = size * (0.015 * (1 - 0.35 * t));
      const ang = bCfg.side === -1 ? Math.PI + (0.35 - 0.52 * t) : -(0.35 - 0.52 * t);
      ctx.beginPath();
      ctx.moveTo(bx, by + oy);
      ctx.quadraticCurveTo(
        bx + Math.cos(ang) * hairLen * 0.5,
        by + oy - 3.0,
        bx + Math.cos(ang) * hairLen,
        by + oy + Math.sin(ang) * hairLen * 0.32
      );
      ctx.strokeStyle = rgbStr(brow.r, brow.g, brow.b, 0.58 * Math.sin(Math.PI * Math.pow(t, 0.65)));
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();
  }

  // 7. Optional Photo Reference UV Projection Blend
  if (photoElement && photoBlend > 0.01) {
    ctx.save();
    ctx.globalAlpha = Math.min(0.85, photoBlend);
    ctx.beginPath();
    ctx.ellipse(size * 0.5, size * 0.52, size * 0.28, size * 0.34, 0, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(photoElement, size * 0.18, size * 0.14, size * 0.64, size * 0.76);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return { texture: tex, canvas };
}

/**
 * Generates Rich, Deep Ebony Silk Hair Texture with Subtle Realistic Kajiya-Kay Anisotropic Sheen
 * (Fixes the overly bright grey hair strip look from earlier!)
 */
export function createRealisticHairStrandTexture(hairColorHex = '#141116', sheenIntensity = 0.85) {
  const w = 512;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const base = hexToRgb(hairColorHex);
  // Solid deep base in the upper 86% so overlapping locks never look like sparse comb teeth
  const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
  bgGrad.addColorStop(0, rgbStr(base.r * 0.7, base.g * 0.7, base.b * 0.7, 0.98));
  bgGrad.addColorStop(0.78, rgbStr(base.r * 0.85, base.g * 0.85, base.b * 0.85, 0.96));
  bgGrad.addColorStop(0.94, rgbStr(base.r * 0.8, base.g * 0.8, base.b * 0.8, 0.45));
  bgGrad.addColorStop(1.0, rgbStr(base.r, base.g, base.b, 0.0));
  ctx.fillStyle = bgGrad;
  ctx.fillRect(14, 0, w - 28, h);

  // Draw 420 fine silk hair fibers with subtle, realistic dark-espresso / blue-black sheen
  for (let i = 0; i < 420; i++) {
    const x = (i / 420) * w;
    const edgeFade = Math.pow(Math.sin((i / 420) * Math.PI), 0.45);
    const toneShift = ((i * 29) % 14) - 7;

    const grad = ctx.createLinearGradient(x, 0, x, h);
    grad.addColorStop(0, rgbStr(base.r * 0.55, base.g * 0.55, base.b * 0.55, 0.98 * edgeFade));
    grad.addColorStop(0.24, rgbStr(base.r + toneShift, base.g + toneShift, base.b + toneShift, 0.98 * edgeFade));
    // Subtle, natural silk highlight band (not washed-out white!)
    grad.addColorStop(0.35, rgbStr(base.r + 28 * sheenIntensity, base.g + 24 * sheenIntensity, base.b + 34 * sheenIntensity, 0.98 * edgeFade));
    grad.addColorStop(0.48, rgbStr(base.r + toneShift, base.g + toneShift, base.b + toneShift, 0.96 * edgeFade));
    grad.addColorStop(0.62, rgbStr(base.r + 16 * sheenIntensity, base.g + 14 * sheenIntensity, base.b + 22 * sheenIntensity, 0.94 * edgeFade));
    grad.addColorStop(0.86, rgbStr(base.r * 0.75, base.g * 0.75, base.b * 0.75, 0.78 * edgeFade));
    grad.addColorStop(1.0, rgbStr(base.r, base.g, base.b, 0.0));

    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.bezierCurveTo(
      x + Math.sin(i * 1.7) * 2.5, h * 0.33,
      x - Math.sin(i * 2.3) * 2.5, h * 0.66,
      x + Math.sin(i * 3.1) * 1.5, h
    );
    ctx.strokeStyle = grad;
    ctx.lineWidth = 1.8;
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
 * Stage 7 · 皮肤微观细节贴图（程序化生成，全离线）
 * Stage 13c 升级为 1024px 灰度噪声：同时用作皮肤 roughnessMap（粗糙度变化）与 bumpMap（毛孔凹凸），
 * 消除“塑料皮”廉价感。单例缓存，多颗头共用同一张，不占多余显存。
 * 注意：数据贴图必须保持线性色彩空间（不设 SRGB），否则粗糙度会偏亮失真。
 */
let _skinMicroCache = null;
export function createSkinMicroMaps(size = 2048) {
  if (_skinMicroCache) return _skinMicroCache;
  // 斑点/皮纹数量按面积缩放、尺寸按边长缩放，保证 1024 与 512 观感密度一致
  const unit = size / 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 基底：中高灰（×材质 roughness 0.62 ≈ 0.40 有效粗糙度，接近真实皮肤）
  ctx.fillStyle = '#b0b0b0';
  ctx.fillRect(0, 0, size, size);

  // 大尺度柔和油脂/干燥区分区（T区偏光滑=偏暗，两颊偏干=偏亮）
  const zones = [
    [0.50, 0.44, 0.34, 'rgba(70,70,70,0.10)'],   // 中央T区：略光滑
    [0.20, 0.55, 0.26, 'rgba(235,235,235,0.10)'], // 左颊：略干
    [0.80, 0.55, 0.26, 'rgba(235,235,235,0.10)'], // 右颊：略干
  ];
  for (const [zx, zy, zr, col] of zones) {
    const g = ctx.createRadialGradient(size * zx, size * zy, 4, size * zx, size * zy, size * zr);
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(128,128,128,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }

  // 毛孔与微观噪点：随机深浅斑点
  for (let i = 0; i < Math.round(9000 * unit * unit); i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const r = (Math.random() < 0.12 ? 1.6 + Math.random() * 1.4 : 0.5 + Math.random() * 1.0) * unit;
    const dark = Math.random() < 0.55;
    const v = dark ? 60 + Math.random() * 60 : 190 + Math.random() * 55;
    ctx.fillStyle = `rgba(${v | 0},${v | 0},${v | 0},${0.05 + Math.random() * 0.09})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 细小皮纹短线（增强近看真实感）
  ctx.lineWidth = 0.7 * unit;
  for (let i = 0; i < Math.round(900 * unit * unit); i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const a = Math.random() * Math.PI;
    const len = (2 + Math.random() * 5) * unit;
    const v = 95 + Math.random() * 90;
    ctx.strokeStyle = `rgba(${v | 0},${v | 0},${v | 0},0.10)`;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 16; // Stage 18：2048 毛孔 + 16x 过滤，近看不糊
  tex.needsUpdate = true;
  _skinMicroCache = { roughnessMap: tex, bumpMap: tex };
  return _skinMicroCache;
}

export function samplePhotoColors(imgElement) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const ctx = c.getContext('2d');
  ctx.drawImage(imgElement, 0, 0, 128, 128);
  const data = ctx.getImageData(0, 0, 128, 128).data;

  let r = 0, g = 0, b = 0, n = 0;
  for (let y = 48; y < 78; y++) {
    for (let x = 44; x < 84; x++) {
      const idx = (y * 128 + x) * 4;
      r += data[idx]; g += data[idx + 1]; b += data[idx + 2]; n++;
    }
  }
  r /= n; g /= n; b /= n;
  const sr = Math.round(Math.min(250, Math.max(222, r * 0.45 + 246 * 0.55)));
  const sg = Math.round(Math.min(228, Math.max(190, g * 0.45 + 216 * 0.55)));
  const sb = Math.round(Math.min(218, Math.max(176, b * 0.45 + 204 * 0.55)));
  const toHex = (rv, gv, bv) => '#' + [rv, gv, bv].map(v => v.toString(16).padStart(2, '0')).join('');

  return {
    skinTone: toHex(sr, sg, sb),
    lipColor: '#d45868',
    irisColor: '#362015'
  };
}
