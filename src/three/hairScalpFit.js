import { Vector3, Box3 } from 'three';

// Fast O(V) spherical scalp-fit cache: fits artist hair outside the current morphed scalp
// in <0.5ms per head instead of 20M brute-force ray-triangle intersections.
const cache = new WeakMap();
const NT = 48;
const NP = 96;

export function fitArtistHairOutsideScalp(geometry, head) {
  if (!head?.geometry?.attributes?.position || !geometry?.attributes?.position) return;
  const headGeo = head.geometry;
  const influences = head.morphTargetInfluences || [];
  const morphSig = head.parent?.userData?.morphSignature || '';
  const signature = headGeo.uuid + ':' + morphSig + ':' + influences.map((w) => Number(w || 0).toFixed(3)).join(',');

  let entry = cache.get(head);
  if (!entry || entry.signature !== signature) {
    const posAttr = headGeo.attributes.position;
    const n = posAttr.count;
    const positions = new Float32Array(posAttr.array);
    const morphAttrs = headGeo.morphAttributes?.position || [];
    for (let m = 0; m < morphAttrs.length; m++) {
      const w = influences[m];
      if (!w || Math.abs(w) < 1e-4) continue;
      const mAttr = morphAttrs[m];
      for (let i = 0; i < n; i++) {
        const i3 = i * 3;
        positions[i3] += mAttr.getX(i) * w;
        positions[i3 + 1] += mAttr.getY(i) * w;
        positions[i3 + 2] += mAttr.getZ(i) * w;
      }
    }

    const box = new Box3();
    const tmp = new Vector3();
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      tmp.set(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      box.expandByPoint(tmp);
    }
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    center.y += size.y * 0.16;
    center.z -= size.z * 0.07;

    const rawGrid = new Float32Array((NT + 1) * NP);
    for (let i = 0; i < n; i++) {
      const i3 = i * 3;
      const dx = positions[i3] - center.x;
      const dy = positions[i3 + 1] - center.y;
      const dz = positions[i3 + 2] - center.z;
      if (dy < -0.01) continue;
      const dist = Math.hypot(dx, dy, dz);
      if (dist < 1e-6) continue;
      const theta = Math.acos(Math.max(-1, Math.min(1, dy / dist)));
      let phi = Math.atan2(dz, dx);
      if (phi < 0) phi += Math.PI * 2;
      const ti = Math.min(NT, Math.max(0, Math.round((theta / Math.PI) * NT)));
      const pi = ((Math.round((phi / (Math.PI * 2)) * NP) % NP) + NP) % NP;
      const idx = ti * NP + pi;
      if (dist > rawGrid[idx]) rawGrid[idx] = dist;
    }

    // 5x5 morphological dilation across spherical bins so wide triangle chords never dip into the skull
    const grid = new Float32Array((NT + 1) * NP);
    for (let ti = 0; ti <= NT; ti++) {
      for (let pi = 0; pi < NP; pi++) {
        let maxR = 0;
        for (let dt = -2; dt <= 2; dt++) {
          const t2 = Math.min(NT, Math.max(0, ti + dt));
          for (let dp = -2; dp <= 2; dp++) {
            const p2 = (pi + dp + NP) % NP;
            const r = rawGrid[t2 * NP + p2];
            if (r > maxR) maxR = r;
          }
        }
        grid[ti * NP + pi] = maxR;
      }
    }

    entry = { signature, center, size, grid, v: new Vector3() };
    cache.set(head, entry);
  }

  const p = geometry.attributes.position;
  const isPairedStrandRibbon = Boolean(geometry.attributes.aSide && (p.count % 2 === 0));
  const { center, size, grid, v } = entry;
  const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  let adjusted = 0;
  if (isPairedStrandRibbon) {
    for (let i = 0; i < p.count; i += 2) {
      const x0 = p.getX(i), y0 = p.getY(i), z0 = p.getZ(i);
      const x1 = p.getX(i + 1), y1 = p.getY(i + 1), z1 = p.getZ(i + 1);
      const mx = (x0 + x1) * 0.5;
      const my = (y0 + y1) * 0.5;
      const mz = (z0 + z1) * 0.5;
      const yWeight = ss(center.y - 0.025, center.y + 0.012, my);
      if (yWeight <= 1e-4) continue;
      const frontMask = ss(center.z + size.z * 0.16, center.z + size.z * 0.30, mz)
                      * (1.0 - ss(center.y + size.y * 0.18, center.y + size.y * 0.30, my));
      const dx = mx - center.x;
      const dy = my - center.y;
      const dz = mz - center.z;
      const distance = Math.hypot(dx, dy, dz);
      if (distance < 1e-6) continue;
      const theta = Math.acos(Math.max(-1, Math.min(1, dy / distance)));
      let phi = Math.atan2(dz, dx);
      if (phi < 0) phi += Math.PI * 2;
      const ti = Math.min(NT, Math.max(0, Math.round((theta / Math.PI) * NT)));
      const pi = ((Math.round((phi / (Math.PI * 2)) * NP) % NP) + NP) % NP;
      const radius = grid[ti * NP + pi];
      const clearance = 0.0028 - 0.0014 * frontMask;
      const safe = radius + clearance;
      if (radius > 0 && distance < safe && safe - distance < size.x * 0.22) {
        const push = (safe - distance) * yWeight * (1.0 - 0.55 * frontMask);
        const tx = (dx / distance) * push;
        const ty = (dy / distance) * push;
        const tz = (dz / distance) * push;
        p.setXYZ(i, x0 + tx, y0 + ty, z0 + tz);
        p.setXYZ(i + 1, x1 + tx, y1 + ty, z1 + tz);
        adjusted += 2;
      }
    }
  } else {
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      // Smoothly weight upper scalp vs face-framing bangs so no hair card is kinked across a boolean boundary
      const yWeight = ss(center.y - 0.025, center.y + 0.012, v.y);
      if (yWeight <= 1e-4) continue;
      const frontMask = ss(center.z + size.z * 0.16, center.z + size.z * 0.30, v.z)
                      * (1.0 - ss(center.y + size.y * 0.18, center.y + size.y * 0.30, v.y));
      const dx = v.x - center.x;
      const dy = v.y - center.y;
      const dz = v.z - center.z;
      const distance = Math.hypot(dx, dy, dz);
      if (distance < 1e-6) continue;
      const theta = Math.acos(Math.max(-1, Math.min(1, dy / distance)));
      let phi = Math.atan2(dz, dx);
      if (phi < 0) phi += Math.PI * 2;
      const ti = Math.min(NT, Math.max(0, Math.round((theta / Math.PI) * NT)));
      const pi = ((Math.round((phi / (Math.PI * 2)) * NP) % NP) + NP) % NP;
      const radius = grid[ti * NP + pi];
      const clearance = 0.0042 - 0.0022 * frontMask;
      const safe = radius + clearance;
      if (radius > 0 && distance < safe && safe - distance < size.x * 0.22) {
        const push = (safe - distance) * yWeight * (1.0 - 0.55 * frontMask);
        const scale = (distance + push) / distance;
        p.setXYZ(i, center.x + dx * scale, center.y + dy * scale, center.z + dz * scale);
        adjusted++;
      }
    }
  }
  geometry.userData.scalpFit = { adjustedVertices: adjusted, cachedRays: NT * NP };
}
