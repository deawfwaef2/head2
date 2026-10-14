import * as THREE from 'three';

/**
 * Stage 54 · Photorealistic Forensic & Cryosection C4/C5 Neck Cross-Section Synthesizer
 * Built on Visible Human Project C4 cryosection histology: tightly-packed anatomical muscle
 * compartments with creamy-rose epimysium/perimysium marbling, smooth-SDF (`smin`) C4 cervical
 * vertebra with spongy red bone marrow trabeculae, pearly hyaline C-ring trachea, collapsed
 * mucosal esophagus, realistic carotid/jugular sheaths, and per-specimen asymmetric blood clots.
 *
 * Orientation Contract (100% matched with `NeckCrossSection` UV in `daz_asian_head_base.glb`
 * under Three.js default `CanvasTexture.flipY = true`, where `v = 1.0 - py / size`):
 *  - Anterior (+Z, throat under the chin)  <=> UV.v > 0.5 (v = 0.58..0.95)
 *  - Posterior (-Z, nape/cervical spine)   <=> UV.v < 0.5 (v = 0.05..0.48)
 *  - Subject's Left / Viewer's Right (+X)  <=> UV.u > 0.5
 *  - Subject's Right / Viewer's Left (-X)  <=> UV.u < 0.5
 */

export const ANATOMY_LABELS = [
  { id: 'trachea', name: '气管腔与C形透明软骨环 (Trachea & Hyaline C-Ring)', u: 0.50, v: 0.715, color: '#7dd3fc' },
  { id: 'esophagus', name: '食管塌陷黏膜皱襞腔 (Esophagus Lumen)', u: 0.50, v: 0.585, color: '#fda4af' },
  { id: 'thyroid', name: '甲状腺左/右叶与峡部 (Thyroid Gland)', u: 0.39, v: 0.690, color: '#f87171' },
  { id: 'carotid', name: '颈总动脉断口 (Common Carotid A.)', u: 0.342, v: 0.562, color: '#ef4444' },
  { id: 'jugular', name: '颈内静脉塌陷腔 (Internal Jugular V.)', u: 0.288, v: 0.548, color: '#f87171' },
  { id: 'scm', name: '胸锁乳突肌束 (Sternocleidomastoid M.)', u: 0.225, v: 0.650, color: '#fb7185' },
  { id: 'vertebra', name: 'C4 颈椎椎体与红骨髓松质 (C4 Vertebral Body)', u: 0.50, v: 0.442, color: '#fde68a' },
  { id: 'spinal_cord', name: '脊髓白质与灰质蝴蝶角 (Spinal Cord)', u: 0.50, v: 0.332, color: '#fef08a' },
  { id: 'trapezius', name: '斜方肌与头半棘肌群 (Deep Cervical Mm.)', u: 0.68, v: 0.245, color: '#f43f5e' },
  { id: 'dermis', name: '真皮切缘与皮下浅筋膜 (Dermis & Subcutis)', u: 0.84, v: 0.760, color: '#fcd34d' }
];

function hash2(x, y, seed = 0) {
  let h = Math.imul(x ^ seed, 374761393) + Math.imul(y ^ (seed * 13 + 7), 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295.0;
}

function noise2D(x, y, seed = 0) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);
  const a = hash2(ix, iy, seed);
  const b = hash2(ix + 1, iy, seed);
  const c = hash2(ix, iy + 1, seed);
  const d = hash2(ix + 1, iy + 1, seed);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function fbm2D(x, y, seed = 0, octaves = 4) {
  let val = 0.0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    val += amp * noise2D(x * freq, y * freq, seed + i * 31);
    freq *= 2.03;
    amp *= 0.5;
  }
  return val;
}

function worley2D(x, y, seed = 0) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  let d1 = 10.0;
  let d2 = 10.0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const cx = ix + dx;
      const cy = iy + dy;
      const px = dx + 0.15 + 0.70 * hash2(cx, cy, seed) - fx;
      const py = dy + 0.15 + 0.70 * hash2(cx, cy, seed + 79) - fy;
      const d = Math.hypot(px, py);
      if (d < d1) {
        d2 = d1;
        d1 = d;
      } else if (d < d2) {
        d2 = d;
      }
    }
  }
  return [d1, d2 - d1];
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0.0, Math.min(1.0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3.0 - 2.0 * t);
}

function smin(a, b, k) {
  const h = Math.max(k - Math.abs(a - b), 0.0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}

function sdSegment(px, py, ax, ay, bx, by) {
  const pax = px - ax;
  const pay = py - ay;
  const bax = bx - ax;
  const bay = by - ay;
  const h = Math.max(0.0, Math.min(1.0, (pax * bax + pay * bay) / (bax * bax + bay * bay + 1e-8)));
  return Math.hypot(pax - bax * h, pay - bay * h);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

function clamp(x, lo, hi) {
  return x < lo ? lo : x > hi ? hi : x;
}

function parseHexRGB(hex, fallback = [245, 215, 202]) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(String(hex || '').trim());
  if (!m) return fallback;
  return [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
}

export function renderAnatomyCrossSectionToCanvas(canvas, options = {}) {
  const size = canvas.width || 640;
  const ctx = canvas.getContext('2d');
  const skinRGB = parseHexRGB(options.skinColor || '#ffe9df');
  const showLabels = Boolean(options.showLabels);
  const seedBase = Math.floor(Number(options.anatomySeed ?? 1.37) * 997) & 0xffff;

  const imgData = ctx.createImageData(size, size);
  const data = imgData.data;
  const hrData = new Uint8ClampedArray(size * size * 4);

  // Per-specimen asymmetric arterial & venous hemorrhage sectors
  const gushAngle1 = (hash2(seedBase, 17, 1) * Math.PI * 2.0) - Math.PI;
  const gushAngle2 = gushAngle1 + 1.65 + hash2(seedBase, 43, 2) * 1.25;

  // Tightly-packed rotated elliptical muscle bellies (expanded radii so they pack tightly
  // against each other with organic curved epimysium sheaths instead of straight Voronoi spokes):
  // [du, vc, rx, ry, rotAngle, toneBias]
  const baseMuscles = [
    [0.255, 0.665, 0.135, 0.088, 0.68, 0.06],   // Sternocleidomastoid (胸锁乳突肌)
    [0.095, 0.825, 0.092, 0.052, 0.16, -0.03],  // Sternohyoid / Sternothyroid (舌骨下肌群)
    [0.205, 0.775, 0.078, 0.048, 0.44, 0.04],   // Omohyoid (肩胛舌骨肌)
    [0.085, 0.535, 0.076, 0.052, -0.15, -0.07], // Longus Colli & Longus Capitis (颈长肌/头长肌)
    [0.245, 0.465, 0.108, 0.078, -0.32, 0.02],  // Anterior & Middle Scalenes (前/中斜角肌)
    [0.295, 0.325, 0.118, 0.084, -0.72, 0.05],  // Levator Scapulae & Splenius Cervicis (肩胛提肌/颈夹肌)
    [0.125, 0.255, 0.098, 0.074, -0.38, -0.04], // Semispinalis Capitis & Multifidus (头半棘肌/多裂肌)
    [0.195, 0.145, 0.142, 0.062, -0.22, 0.04],  // Trapezius & Splenius Capitis (斜方肌/头夹肌)
  ];
  const muscles = [];
  for (const side of [-1, 1]) {
    for (let i = 0; i < baseMuscles.length; i++) {
      const [du, vc, rx, ry, ang, tb] = baseMuscles[i];
      const rot = -side * ang;
      muscles.push([
        0.50 + side * du,
        vc,
        rx,
        ry,
        Math.cos(rot),
        Math.sin(rot),
        tb + (side > 0 ? 0.015 : -0.015),
        i * 2 + (side > 0 ? 1 : 0),
      ]);
    }
  }

  for (let py = 0; py < size; py++) {
    // Three.js CanvasTexture has flipY=true by default: py=0 -> UV.v=1.0, py=size-1 -> UV.v=0.0
    const v = 1.0 - (py + 0.5) / size;
    const dv = (v - 0.5) / 0.455;

    for (let px = 0; px < size; px++) {
      const u = (px + 0.5) / size;
      const du = (u - 0.5) / 0.455;
      const rho = Math.hypot(du, dv);
      const theta = Math.atan2(dv, du);

      const idx = (py * size + px) * 4;

      // Multi-scale organic domain warping
      const fbm1 = fbm2D(u * 9.5, v * 9.5, seedBase + 11, 3);
      const fbm2 = fbm2D(u * 24.0, v * 24.0, seedBase + 37, 3);
      const fbm3 = fbm2D(u * 68.0, v * 68.0, seedBase + 73, 3);
      const fbmMicro = noise2D(u * 190.0, v * 190.0, seedBase + 103);

      const uw = u + (fbm1 - 0.5) * 0.025 + (fbm2 - 0.5) * 0.010;
      const vw = v + (fbm2 - 0.5) * 0.025 + (fbm1 - 0.5) * 0.010;
      const rhoW = rho + (fbm2 - 0.5) * 0.018 + (fbm3 - 0.5) * 0.007;

      let rCol = 62.0;
      let gCol = 8.0;
      let bCol = 12.0;
      let heightVal = 0.50;
      let roughVal = 0.18;

      // ======================================================================
      // 1. OUTER EPIDERMIS/DERMIS CUT RIM & THIN SUBCUTANEOUS LAYER (rhoW >= 0.935)
      // ======================================================================
      if (rhoW >= 0.972) {
        // Cleanly severed dermal-epidermal skin rim matching outer 3D neck skin
        const tSkin = smoothstep(0.972, 1.005, rhoW);
        const drmR = mix(198, skinRGB[0] * 0.94, tSkin) + (fbm3 - 0.5) * 10;
        const drmG = mix(126, skinRGB[1] * 0.88, tSkin) + (fbm3 - 0.5) * 8;
        const drmB = mix(122, skinRGB[2] * 0.86, tSkin) + (fbm3 - 0.5) * 8;
        const edgeBlood = smoothstep(0.54, 0.82, fbm1 + 0.25 * Math.cos(theta - gushAngle1)) * (1.0 - smoothstep(1.01, 1.05, rhoW));
        rCol = mix(drmR, 92, edgeBlood * 0.72);
        gCol = mix(drmG, 9, edgeBlood * 0.80);
        bCol = mix(drmB, 13, edgeBlood * 0.80);
        heightVal = 0.72 - 0.08 * edgeBlood;
        roughVal = mix(0.42, 0.08, edgeBlood);
      } else {
        // ====================================================================
        // 2. DEEP CERVICAL FASCIA MATRIX & CURVED ANATOMICAL MUSCLE BELLIES
        // ====================================================================
        // Base deep cervical fascia & loose vascularized connective matrix between muscles
        const [bgF1, bgSep] = worley2D(uw * 52.0, vw * 52.0, seedBase + 173);
        const bgCollagen = (1.0 - smoothstep(0.015, 0.085, bgSep)) * (0.40 + 0.60 * fbm2);
        rCol = mix(64, 152, bgCollagen * 0.48) + (fbm3 - 0.5) * 14;
        gCol = mix(8, 58, bgCollagen * 0.42);
        bCol = mix(12, 64, bgCollagen * 0.42);
        heightVal = 0.44 + 0.06 * bgCollagen;
        roughVal = 0.10;

        // Evaluate curved elliptical muscle compartments with creamy-rose epimysium sheaths
        // and multi-scale myofibril perimysium marbling
        let bestM = null;
        let minD = 10.0;
        let secondD = 10.0;
        for (let m = 0; m < muscles.length; m++) {
          const md = muscles[m];
          const dx = uw - md[0];
          const dy = vw - md[1];
          const lx = (dx * md[4] + dy * md[5]) / md[2];
          const ly = (-dx * md[5] + dy * md[4]) / md[3];
          const d = Math.hypot(lx, ly);
          if (d < minD) {
            secondD = minD;
            minD = d;
            bestM = md;
          } else if (d < secondD) {
            secondD = d;
          }
        }

        // Smoothly pack muscle bellies so they fill the neck and wrap in thin epimysium fascia
        if (bestM && minD < 1.24) {
          const mMask = smoothstep(1.24, 0.84, minD);
          // Epimysium sheath along the curved muscle belly perimeter (minD ~ 0.90..1.12)
          const epiRing = Math.exp(-Math.pow((minD - 0.98) / 0.11, 2.0)) * (0.45 + 0.55 * fbm2);
          // Thin intermuscular septum where two adjacent muscle bellies press together
          const contactSeptum = Math.exp(-Math.pow((secondD - minD) / 0.09, 2.0)) * smoothstep(1.35, 0.85, secondD);

          const fu = uw * bestM[4] + vw * bestM[5];
          const fv = -uw * bestM[5] + vw * bestM[4];
          const mId = bestM[7];
          const toneBias = bestM[6];

          const [fasF1, fasSep] = worley2D(fu * 54.0, fv * 42.0, seedBase + 211 + mId * 19);
          const [subF1, subSep] = worley2D(fu * 124.0, fv * 98.0, seedBase + 307 + mId * 23);
          const perimysium = (1.0 - smoothstep(0.012, 0.075, fasSep)) * (0.35 + 0.65 * fbm2);
          const endomysium = (1.0 - smoothstep(0.015, 0.090, subSep)) * 0.35;

          // Rich oxygenated-crimson to venous-burgundy skeletal muscle fibers
          let musR = (118 + toneBias * 140) * (1.0 - 0.16 * minD) - fasF1 * 24.0 + (fbmMicro - 0.5) * 24.0 + (fbm2 - 0.5) * 18.0;
          let musG = (16 + toneBias * 26) * (1.0 - 0.18 * minD) + (fbmMicro - 0.5) * 6.0;
          let musB = (22 + toneBias * 30) * (1.0 - 0.18 * minD) + (fbmMicro - 0.5) * 7.0;

          // Intramuscular perimysium marbling (creamy-rose collagen web)
          const marbleAmt = clamp(perimysium * 0.46 + endomysium * 0.24 + epiRing * 0.52, 0.0, 0.62);
          musR = mix(musR, 196, marbleAmt);
          musG = mix(musG, 102, marbleAmt);
          musB = mix(musB, 106, marbleAmt);

          // Subtle dark venous blood capillary groove in the intermuscular cleft
          musR = mix(musR, 42, contactSeptum * 0.55);
          musG = mix(musG, 5, contactSeptum * 0.65);
          musB = mix(musB, 8, contactSeptum * 0.65);

          rCol = mix(rCol, musR, mMask);
          gCol = mix(gCol, musG, mMask);
          bCol = mix(bCol, musB, mMask);
          heightVal = mix(heightVal, 0.62 - 0.09 * fasF1 - 0.12 * contactSeptum + 0.04 * fbmMicro, mMask);
          roughVal = mix(roughVal, 0.22 + 0.06 * fbmMicro, mMask);
        }

        // ====================================================================
        // 3. BILATERAL THYROID GLAND LOBES & ISTHMUS (u = 0.50 ± 0.094, v = 0.688)
        // ====================================================================
        for (const side of [-1, 1]) {
          const dThy = Math.hypot((uw - (0.50 + side * 0.094)) / 0.045, (vw - 0.688) / 0.064);
          if (dThy < 1.0) {
            const thyMask = smoothstep(1.0, 0.62, dThy);
            const [tF1, tSep] = worley2D(u * 96.0, v * 96.0, seedBase + 409);
            const follicleRim = 1.0 - smoothstep(0.015, 0.085, tSep);
            const thR = mix(mix(106, 62, tF1), 158, follicleRim * 0.35) + (fbm3 - 0.5) * 14;
            const thG = mix(mix(14, 6, tF1), 54, follicleRim * 0.35);
            const thB = mix(mix(20, 10, tF1), 62, follicleRim * 0.35);
            rCol = mix(rCol, thR, thyMask);
            gCol = mix(gCol, thG, thyMask);
            bCol = mix(bCol, thB, thyMask);
            heightVal = mix(heightVal, 0.60 - 0.07 * tF1, thyMask);
            roughVal = mix(roughVal, 0.15, thyMask);
          }
        }

        // ====================================================================
        // 4. POSTERIOR (-Z): UNIFIED SMOOTH-SDF C4 CERVICAL VERTEBRA
        //    with Spongy Red Bone Marrow Trabeculae inside the Anterior Body
        // ====================================================================
        const uSym = Math.abs(uw - 0.50);
        // (a) Anterior Vertebral Body (oval at u=0.50, v=0.442)
        const sdBody = Math.hypot(uSym / 0.084, (vw - 0.442) / 0.058) - 1.0;
        // (b) Bilateral Pedicles & Transverse Processes (at uSym=0.106, v=0.422)
        const sdTrans = Math.hypot((uSym - 0.106) / 0.050, (vw - 0.422) / 0.033) - 1.0;
        // (c) Vertebral Arch (Laminae) enclosing the spinal canal (ring centered at u=0.50, v=0.332)
        const dArchOuter = Math.hypot(uSym / 0.080, (vw - 0.332) / 0.064) - 1.0;
        // (d) Posterior Spinous Process extending from v=0.285 down to v=0.198 with subtle bifid tip
        const spDist = sdSegment(uSym, vw, 0.006, 0.285, 0.014, 0.198) / 0.021 - 1.0;

        let sdVertebra = smin(sdBody, sdTrans, 0.30);
        sdVertebra = smin(sdVertebra, dArchOuter, 0.26);
        sdVertebra = smin(sdVertebra, spDist, 0.24);

        const dCanalRaw = Math.hypot((u - 0.50) / 0.052, (v - 0.332) / 0.041);
        const dForamenT = Math.hypot((Math.abs(u - 0.50) - 0.114) / 0.019, (v - 0.422) / 0.015);

        if (sdVertebra < 0.05 && dCanalRaw > 0.92) {
          const boneMask = smoothstep(0.05, -0.09, sdVertebra);
          // Spongy cancellous red bone marrow inside the core of the anterior vertebral body (vw > 0.395)
          const marrowMask = smoothstep(-0.18, -0.38, sdBody) * smoothstep(0.392, 0.415, vw);

          // Cortical bone: realistic wet ivory-buff with periosteal crimson blood staining
          const boneGrain = fbm2D(u * 135.0, v * 135.0, seedBase + 521, 3);
          const bloodSmear = smoothstep(0.46, 0.80, fbm1 * 0.65 + fbm2 * 0.35) * 0.48 + (1.0 - boneMask) * 0.42;
          let bR = mix(222, 196, boneGrain);
          let bG = mix(204, 174, boneGrain);
          let bB = mix(178, 146, boneGrain);

          bR = mix(bR, 124, bloodSmear * 0.58);
          bG = mix(bG, 24, bloodSmear * 0.68);
          bB = mix(bB, 28, bloodSmear * 0.68);

          if (marrowMask > 0.01) {
            // Spongy Cancellous Red Bone Marrow: Worley trabecular ivory spicules in deep crimson marrow
            const [trF1, trWeb] = worley2D(u * 96.0, v * 96.0, seedBase + 563);
            const spicule = (1.0 - smoothstep(0.018, 0.115, trWeb)) * (0.45 + 0.55 * fbm3);
            const mrR = mix(74, 206, spicule) + (fbmMicro - 0.5) * 18;
            const mrG = mix(9, 162, spicule * 0.78);
            const mrB = mix(13, 144, spicule * 0.74);
            bR = mix(bR, mrR, marrowMask);
            bG = mix(bG, mrG, marrowMask);
            bB = mix(bB, mrB, marrowMask);
          }

          if (dForamenT < 1.0) {
            const ftMask = smoothstep(1.0, 0.65, dForamenT);
            const ftLumen = smoothstep(0.55, 0.30, dForamenT);
            bR = mix(bR, mix(148, 22, ftLumen), ftMask);
            bG = mix(bG, mix(30, 2, ftLumen), ftMask);
            bB = mix(bB, mix(36, 4, ftLumen), ftMask);
          }

          rCol = mix(rCol, bR, boneMask);
          gCol = mix(gCol, bG, boneMask);
          bCol = mix(bCol, bB, boneMask);
          heightVal = mix(heightVal, 0.84 - 0.22 * marrowMask - (dForamenT < 0.8 ? 0.35 : 0.0), boneMask);
          roughVal = mix(roughVal, mix(0.42, 0.12, Math.max(marrowMask, bloodSmear)), boneMask);
        }

        // 5. SPINAL CANAL & SEVERED SPINAL CORD (u = 0.50, v = 0.332)
        if (dCanalRaw < 1.02) {
          const canalMask = smoothstep(1.02, 0.86, dCanalRaw);
          let scR = 26;
          let scG = 3;
          let scB = 5;
          let scH = 0.24;
          let scRough = 0.05;

          if (dCanalRaw < 0.74) {
            const cordMask = smoothstep(0.72, 0.58, dCanalRaw);
            const gx = Math.abs(uw - 0.50) / 0.032;
            const gy = (vw - 0.332) / 0.025;
            const dAntH = Math.hypot((gx - 0.38) / 0.28, (gy - 0.20) / 0.38);
            const dPostH = Math.hypot((gx - 0.44) / 0.20, (gy + 0.25) / 0.44);
            const dComm = Math.hypot(gx / 0.45, gy / 0.14);
            const grayDist = smin(smin(dAntH, dPostH, 0.35), dComm, 0.35);
            const grayMask = smoothstep(1.0, 0.45, grayDist);

            let cwR = mix(226, 154, grayMask) + (fbm3 - 0.5) * 12;
            let cwG = mix(204, 84, grayMask) + (fbm3 - 0.5) * 10;
            let cwB = mix(188, 86, grayMask) + (fbm3 - 0.5) * 10;
            const piaTint = smoothstep(0.45, 0.70, dCanalRaw);
            cwR = mix(cwR, 152, piaTint * 0.42);
            cwG = mix(cwG, 40, piaTint * 0.42);
            cwB = mix(cwB, 46, piaTint * 0.42);

            scR = mix(scR, cwR, cordMask);
            scG = mix(scG, cwG, cordMask);
            scB = mix(scB, cwB, cordMask);
            scH = mix(0.24, 0.76, cordMask);
            scRough = mix(0.06, 0.24, cordMask);
          }

          rCol = mix(rCol, scR, canalMask);
          gCol = mix(gCol, scG, canalMask);
          bCol = mix(bCol, scB, canalMask);
          heightVal = mix(heightVal, scH, canalMask);
          roughVal = mix(roughVal, scRough, canalMask);
        }

        // ====================================================================
        // 6. COLLAPSED ESOPHAGUS (u = 0.50, v = 0.585) & ANTERIOR TRACHEA (u = 0.50, v = 0.715)
        // ====================================================================
        const dEso = Math.hypot((uw - 0.50) / 0.044, (vw - 0.585) / 0.028);
        if (dEso < 1.0) {
          const esoMask = smoothstep(1.0, 0.72, dEso);
          const angEso = Math.atan2(vw - 0.585, uw - 0.50);
          const slitR = 0.34 + 0.16 * Math.cos(angEso * 6.0 + fbm2 * 2.5);
          const inEsoLumen = smoothstep(slitR + 0.14, slitR - 0.06, dEso);
          const eR = mix(142, 18, inEsoLumen);
          const eG = mix(36, 2, inEsoLumen);
          const eB = mix(44, 4, inEsoLumen);
          rCol = mix(rCol, eR, esoMask);
          gCol = mix(gCol, eG, esoMask);
          bCol = mix(bCol, eB, esoMask);
          heightVal = mix(heightVal, mix(0.56, 0.18, inEsoLumen), esoMask);
          roughVal = mix(roughVal, mix(0.18, 0.04, inEsoLumen), esoMask);
        }

        // Trachea & Pearly Hyaline Cartilage C-Ring (Anterior +Z: u = 0.50, v = 0.715)
        const uwTr = u + (fbm2 - 0.5) * 0.0085;
        const vwTr = v + (fbm1 - 0.5) * 0.0085;
        const dTrach = Math.hypot((uwTr - 0.50) / 0.068, (vwTr - 0.715) / 0.060);
        if (dTrach < 1.04) {
          const trachMask = smoothstep(1.04, 0.88, dTrach);
          const angTr = Math.atan2(vwTr - 0.715, uwTr - 0.50);
          // Posterior trachealis muscle gap at angTr = -PI/2 (-Z side)
          const postGap = Math.exp(-Math.pow((angTr + Math.PI * 0.5) / 0.54, 2.0));
          // C-ring spans dTrach in [0.68, 0.90]
          const inCRing = smoothstep(0.65, 0.73, dTrach) * (1.0 - smoothstep(0.85, 0.94, dTrach)) * (1.0 - 0.90 * postGap);
          const inLumen = smoothstep(0.68, 0.52, dTrach);

          let trR = 132 + (fbm3 - 0.5) * 16;
          let trG = 28;
          let trB = 36;
          let trH = 0.58;
          let trRough = 0.18;

          if (inCRing > 0.01) {
            // Pearly grey-ivory hyaline cartilage C-ring stained with mucosal crimson film
            const cartStain = smoothstep(0.35, 0.78, fbm1 * 0.6 + fbm2 * 0.4) * 0.52 + 0.18;
            const cR = mix(202, 138, cartStain);
            const cG = mix(198, 38, cartStain);
            const cB = mix(204, 46, cartStain);
            trR = mix(trR, cR, inCRing);
            trG = mix(trG, cG, inCRing);
            trB = mix(trB, cB, inCRing);
            trH = mix(trH, 0.80, inCRing);
            trRough = mix(trRough, 0.22, inCRing);
          }

          if (inLumen > 0.01) {
            const wallSlope = smoothstep(0.48, 0.68, dTrach);
            trR = mix(5, 62, wallSlope * 0.65);
            trG = mix(1, 7, wallSlope * 0.65);
            trB = mix(2, 10, wallSlope * 0.65);
            trH = mix(0.02, 0.36, wallSlope);
            trRough = 0.06;
          }

          rCol = mix(rCol, trR, trachMask);
          gCol = mix(gCol, trG, trachMask);
          bCol = mix(bCol, trB, trachMask);
          heightVal = mix(heightVal, trH, trachMask);
          roughVal = mix(roughVal, trRough, trachMask);
        }

        // Smoothly blended thin subcutaneous fibro-adipose transition near the outer dermis (rhoW in 0.90..0.972)
        if (rhoW > 0.90) {
          const subMask = smoothstep(0.90, 0.945, rhoW) * (1.0 - smoothstep(0.958, 0.974, rhoW));
          const [wF1] = worley2D(uw * 48.0, vw * 48.0, seedBase + 131);
          const lobule = (1.0 - smoothstep(0.18, 0.85, wF1)) * (0.50 + 0.50 * fbm2);
          const subR = mix(118, 196, lobule);
          const subG = mix(24, 114, lobule * 0.82);
          const subB = mix(28, 86, lobule * 0.76);
          rCol = mix(rCol, subR, subMask * 0.72);
          gCol = mix(gCol, subG, subMask * 0.72);
          bCol = mix(bCol, subB, subMask * 0.72);
          heightVal = mix(heightVal, 0.64, subMask * 0.5);
        }

        // ====================================================================
        // 7. REALISTIC CAROTID SHEATH VESSELS (Common Carotid A. & Internal Jugular V.)
        // ====================================================================
        for (const side of [-1, 1]) {
          // Common Carotid Artery (u = 0.50 ± 0.158, v = 0.562)
          const dCa = Math.hypot((uw - (0.50 + side * 0.158)) / 0.027, (vw - 0.562) / 0.025);
          if (dCa < 1.05) {
            const caMask = smoothstep(1.05, 0.80, dCa);
            const caLumen = smoothstep(0.58, 0.36, dCa);
            const caR = mix(176, 18, caLumen);
            const caG = mix(54, 2, caLumen);
            const caB = mix(62, 4, caLumen);
            rCol = mix(rCol, caR, caMask);
            gCol = mix(gCol, caG, caMask);
            bCol = mix(bCol, caB, caMask);
            heightVal = mix(heightVal, mix(0.72, 0.14, caLumen), caMask);
            roughVal = mix(roughVal, mix(0.18, 0.03, caLumen), caMask);
          }

          // Internal Jugular Vein (u = 0.50 ± 0.212, v = 0.548): partially collapsed venous lumen
          const jx = (uw - (0.50 + side * 0.212)) * Math.cos(0.45 * side) + (vw - 0.548) * Math.sin(0.45 * side);
          const jy = -(uw - (0.50 + side * 0.212)) * Math.sin(0.45 * side) + (vw - 0.548) * Math.cos(0.45 * side);
          const dIjv = Math.hypot(jx / 0.033, jy / 0.017);
          if (dIjv < 1.05) {
            const ijvMask = smoothstep(1.05, 0.78, dIjv);
            const ijvLumen = smoothstep(0.70, 0.44, dIjv);
            const jR = mix(92, 14, ijvLumen);
            const jG = mix(20, 1, ijvLumen);
            const jB = mix(28, 3, ijvLumen);
            rCol = mix(rCol, jR, ijvMask);
            gCol = mix(gCol, jG, ijvMask);
            bCol = mix(bCol, jB, ijvMask);
            heightVal = mix(heightVal, mix(0.56, 0.16, ijvLumen), ijvMask);
            roughVal = mix(roughVal, mix(0.18, 0.03, ijvLumen), ijvMask);
          }
        }

        // ====================================================================
        // 8. ASYMMETRIC VISCERAL COAGULATED BLOOD POOLS & ARTERIAL SMEARS
        // ====================================================================
        if (dTrach > 0.76 && dCanalRaw > 0.68) {
          const angDiff1 = Math.atan2(Math.sin(theta - gushAngle1), Math.cos(theta - gushAngle1));
          const angDiff2 = Math.atan2(Math.sin(theta - gushAngle2), Math.cos(theta - gushAngle2));
          const gushSector = Math.exp(-Math.pow(angDiff1 / 0.92, 2.0)) + 0.80 * Math.exp(-Math.pow(angDiff2 / 0.72, 2.0));
          const clotField = fbm1 * 0.55 + fbm2 * 0.45 + 0.30 * gushSector * smoothstep(0.18, 0.86, rho);
          const clotPool = smoothstep(0.60, 0.84, clotField);
          if (clotPool > 0.01) {
            const isThickClot = smoothstep(0.72, 0.90, clotField);
            const bPoolR = mix(104, 24, isThickClot);
            const bPoolG = mix(6, 1, isThickClot);
            const bPoolB = mix(10, 3, isThickClot);
            rCol = mix(rCol, bPoolR, clotPool * 0.84);
            gCol = mix(gCol, bPoolG, clotPool * 0.88);
            bCol = mix(bCol, bPoolB, clotPool * 0.88);
            heightVal = mix(heightVal, 0.62 + 0.08 * isThickClot, clotPool * 0.70);
            roughVal = mix(roughVal, 0.03, clotPool * 0.96);
          }
        }
      }

      data[idx] = clamp(Math.round(rCol), 0, 255);
      data[idx + 1] = clamp(Math.round(gCol), 0, 255);
      data[idx + 2] = clamp(Math.round(bCol), 0, 255);
      data[idx + 3] = 255;

      const hByte = clamp(Math.round(heightVal * 255.0), 0, 255);
      const rByte = clamp(Math.round(roughVal * 255.0), 0, 255);
      hrData[idx] = hByte;
      hrData[idx + 1] = rByte;
      hrData[idx + 2] = hByte;
      hrData[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  canvas._heightRoughData = hrData;

  if (showLabels) {
    ctx.save();
    const fontSize = Math.max(10, Math.round(size * 0.019));
    ctx.font = `600 ${fontSize}px "Noto Sans SC", "Microsoft YaHei", sans-serif`;
    const boxH = Math.round(fontSize * 1.55);
    for (const item of ANATOMY_LABELS) {
      const lx = item.u * size;
      const ly = (1.0 - item.v) * size;
      ctx.beginPath();
      ctx.arc(lx, ly, size * 0.0055, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.stroke();

      const textW = ctx.measureText(item.name).width;
      const padX = Math.round(size * 0.008);
      const offsetX = Math.round(size * 0.014);
      const boxX = lx > size * 0.5 ? lx + offsetX : lx - textW - padX * 2 - offsetX;
      const boxY = ly - Math.round(boxH * 0.5);
      ctx.fillStyle = 'rgba(9, 13, 22, 0.86)';
      ctx.fillRect(boxX, boxY, textW + padX * 2, boxH);
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(boxX, boxY, textW + padX * 2, boxH);
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(item.name, boxX + padX, boxY + Math.round(boxH * 0.73));
    }
    ctx.restore();
  }
}

const _anatomyTexCache = new Map();

export function createAnatomyTextures(options = {}) {
  const seedVal = Number(options.anatomySeed ?? 1.37);
  const cacheKey = `v54c_${options.skinColor || '#ffe9df'}_${seedVal.toFixed(2)}_${Boolean(options.showLabels)}`;
  if (_anatomyTexCache.has(cacheKey)) {
    return _anatomyTexCache.get(cacheKey);
  }
  const size = 640;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  renderAnatomyCrossSectionToCanvas(colorCanvas, options);

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext('2d');
  if (colorCanvas._heightRoughData) {
    const bImg = new ImageData(colorCanvas._heightRoughData, size, size);
    bctx.putImageData(bImg, 0, 0);
  } else {
    bctx.drawImage(colorCanvas, 0, 0);
  }

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
