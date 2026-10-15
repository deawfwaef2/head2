import { BufferGeometry, BufferAttribute } from 'three';

// One standard Loop-subdivision step on the EXISTING artist mesh. No hairstyle
// generation, scalp projection or hand-sculpted offsets. UV seams stay separate;
// non-manifold junctions are pinned rather than tearing or producing NaNs.
// Imported models never enter this function. A budget limits desktop-pet cost.
export function refineArtistHairCards(source) {
  if (!source?.index || !source.attributes.position || !source.attributes.uv ||
      source.morphAttributes.position?.length || source.index.count > 90000) return source;
  const p = source.attributes.position, uv = source.attributes.uv, normal = source.attributes.normal;
  const ids = source.index.array, n = p.count;

  // Map colocated UV-seam vertices to a canonical 3D vertex index so subdivision never splits UV seams into slits
  const canon = new Int32Array(n);
  const posMap = new Map();
  for (let i = 0; i < n; i++) {
    const qx = Math.round(p.array[i * 3] * 100000);
    const qy = Math.round(p.array[i * 3 + 1] * 100000);
    const qz = Math.round(p.array[i * 3 + 2] * 100000);
    const pk = `${qx},${qy},${qz}`;
    let ci = posMap.get(pk);
    if (ci === undefined) {
      ci = i;
      posMap.set(pk, ci);
    }
    canon[i] = ci;
  }

  const cKey = (ca, cb) => ca < cb ? `${ca}/${cb}` : `${cb}/${ca}`;
  const canonEdges = new Map();
  const canonAdj = new Map();
  const ensureSet = (m, k) => { let s = m.get(k); if (!s) { s = new Set(); m.set(k, s); } return s; };

  const addCanon = (a, b, c) => {
    const ca = canon[a], cb = canon[b], cc = canon[c];
    if (ca === cb || ca === cc || cb === cc) return;
    const ck = cKey(ca, cb);
    let ce = canonEdges.get(ck);
    if (!ce) { ce = { ca: Math.min(ca, cb), cb: Math.max(ca, cb), opposite: [] }; canonEdges.set(ck, ce); }
    if (!ce.opposite.includes(cc)) ce.opposite.push(cc);
    ensureSet(canonAdj, ca).add(cb);
    ensureSet(canonAdj, cb).add(ca);
  };

  const edges = new Map();
  const key = (a, b) => a < b ? `${a}/${b}` : `${b}/${a}`;
  const add = (a, b, c) => {
    const k = key(a, b);
    let edge = edges.get(k);
    if (!edge) { edge = { a: Math.min(a, b), b: Math.max(a, b), opposite: [], index: n + edges.size }; edges.set(k, edge); }
    edge.opposite.push(c);
  };

  for (let i = 0; i < ids.length; i += 3) {
    const a = ids[i], b = ids[i + 1], c = ids[i + 2];
    if (a === b || a === c || b === c) continue;
    add(a, b, c); add(b, c, a); add(c, a, b);
    addCanon(a, b, c); addCanon(b, c, a); addCanon(c, a, b);
  }

  const canonBoundary = new Set();
  for (const ce of canonEdges.values()) {
    if (ce.opposite.length !== 2) {
      canonBoundary.add(ce.ca);
      canonBoundary.add(ce.cb);
    }
  }

  const positions = new Float32Array((n + edges.size) * 3);
  const texcoords = new Float32Array((n + edges.size) * 2);
  const normals = new Float32Array((n + edges.size) * 3);
  const read = (a, k) => p.array[a * 3 + k];

  for (let i = 0; i < n; i++) {
    const ci = canon[i];
    const isBorder = canonBoundary.has(ci);
    const neighbors = canonAdj.get(ci) ? [...canonAdj.get(ci)] : [];
    for (let k = 0; k < 3; k++) {
      let v = read(ci, k);
      // Smooth interior welded vertices while keeping outer perimeter vertices pinned so card edges never shrink
      if (!isBorder && neighbors.length >= 3) {
        const beta = (neighbors.length === 3 ? 3 / 16 : 3 / (8 * neighbors.length)) * 0.65;
        v = (1 - neighbors.length * beta) * v + beta * neighbors.reduce((s, j) => s + read(j, k), 0);
      }
      positions[i * 3 + k] = v;
      normals[i * 3 + k] = normal ? normal.array[i * 3 + k] : 0;
    }
    texcoords[i * 2] = uv.getX(i);
    texcoords[i * 2 + 1] = uv.getY(i);
  }

  for (const e of edges.values()) {
    const { a, b, index: i } = e;
    const ca = canon[a], cb = canon[b];
    const ce = canonEdges.get(cKey(ca, cb));
    const co = ce ? ce.opposite : [];
    for (let k = 0; k < 3; k++) {
      positions[i * 3 + k] = co.length === 2
        ? (3 * (read(ca, k) + read(cb, k)) + read(co[0], k) + read(co[1], k)) / 8
        : (read(ca, k) + read(cb, k)) / 2;
      normals[i * 3 + k] = normal ? (normal.array[a * 3 + k] + normal.array[b * 3 + k]) / 2 : 0;
    }
    texcoords[i * 2] = (uv.getX(a) + uv.getX(b)) / 2;
    texcoords[i * 2 + 1] = (uv.getY(a) + uv.getY(b)) / 2;
  }

  const indices = [];
  for (let f = 0; f < ids.length; f += 3) {
    const a = ids[f], b = ids[f + 1], c = ids[f + 2];
    if (a === b || a === c || b === c) continue;
    const ab = edges.get(key(a, b)).index, bc = edges.get(key(b, c)).index, ca = edges.get(key(c, a)).index;
    indices.push(a, ab, ca, ab, b, bc, ca, bc, c, ab, bc, ca);
  }

  const result = new BufferGeometry();
  result.setAttribute('position', new BufferAttribute(positions, 3));
  result.setAttribute('uv', new BufferAttribute(texcoords, 2));
  result.setAttribute('normal', new BufferAttribute(normals, 3));
  result.setIndex(indices);
  if (normal) {
    result.computeVertexNormals();
    const out = result.attributes.normal.array;
    for (let i = 0; i < out.length; i += 3) {
      let gx = out[i], gy = out[i + 1], gz = out[i + 2];
      const ox = normals[i], oy = normals[i + 1], oz = normals[i + 2];
      if (gx * ox + gy * oy + gz * oz < 0) { gx = -gx; gy = -gy; gz = -gz; }
      const bx = ox * 0.72 + gx * 0.28;
      const by = oy * 0.72 + gy * 0.28;
      const bz = oz * 0.72 + gz * 0.28;
      const len = Math.hypot(bx, by, bz) || 1;
      out[i] = bx / len; out[i + 1] = by / len; out[i + 2] = bz / len;
    }
  } else {
    result.computeVertexNormals();
  }
  result.userData = { ...source.userData, artistSubdivision: true, sourceTriangles: ids.length / 3 };
  delete result.userData.basePositions;
  delete result.userData.baseHairNormals;
  delete result.userData.hairShapeSignature;
  for (const group of source.groups) result.addGroup(group.start * 4, group.count * 4, group.materialIndex);
  result.computeBoundingBox();
  result.computeBoundingSphere();
  return result;
}
