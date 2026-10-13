import * as THREE from 'three';

// Original Blender Hair Curves, exported in Y-up meters. This module does NOT
// create old alpha cards, sphere helmets, painted shine or fictitious scan detail.
const sourceCache = new Map();
export const GROOM_STYLES = {
  groom_photo_tied: { file: 'photo_tied', label: '照片参考 · 碎刘海露耳束发' },
  groom_center_long: { file: 'center_long', label: '中式中分 · 柔顺长发' },
  groom_low_chignon: { file: 'low_chignon', label: '中式低盘发 · 露耳碎鬓' },
};
export function groomStyleFor(style) {
  const aliases = {
    hair_user_photo: 'groom_photo_tied',
    hair_long01: 'groom_center_long',
    hair_short02: 'groom_photo_tied',
    hair_ponytail01: 'groom_low_chignon',
    hair_braid01: 'groom_low_chignon',
  };
  return GROOM_STYLES[style] ? style : aliases[style] || null;
}

async function decodeSource(id) {
  if (sourceCache.has(id)) return sourceCache.get(id);
  const promise = (async () => {
    const path = `/grooms/${GROOM_STYLES[id].file}.groom`;
    const embedded = window.__EMBEDDED_GROOMS__?.[path];
    let buffer;
    if (embedded) {
      const binary = atob(embedded.data);
      const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
      if (embedded.encoding === 'gzip-base64') {
        if (!globalThis.DecompressionStream) throw new Error('Groom 离线解压需要新版 Chrome/Edge/Safari。');
        buffer = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      } else buffer = bytes.buffer;
    } else {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`Groom 曲线数据加载失败 (${response.status})`);
      buffer = await response.arrayBuffer();
    }
    const dv = new DataView(buffer);
    const version = new TextDecoder().decode(new Uint8Array(buffer, 0, 8));
    if (!['H2GRM001','H2GRM002'].includes(version)) throw new Error('Groom 数据格式错误');
    const count = dv.getUint32(8, true), samples = dv.getUint32(12, true);
    if (count > 100000 || samples < 4 || samples > 128 || buffer.byteLength !== 40 + count * 8 + count * samples * 6) throw new Error('Groom 数据长度错误');
    const min = [0, 1, 2].map(i => dv.getFloat32(16 + i * 4, true));
    const size = [0, 1, 2].map(i => dv.getFloat32(28 + i * 4, true) - min[i]);
    let points;
    if (version === 'H2GRM002') {
      const packed = new Uint8Array(buffer, 40 + count * 8);
      const plane = count * samples * 3;
      points = new Uint16Array(plane);
      for (let c = 0; c < 3; c++) for (let i = 0; i < count; i++) {
        let value = 0;
        for (let j = 0; j < samples; j++) {
          const k = c * count * samples + i * samples + j;
          const delta = packed[k] | (packed[plane + k] << 8);
          value = j === 0 ? delta : (value + delta) & 65535;
          points[(i * samples + j) * 3 + c] = value;
        }
      }
    } else points = new Uint16Array(buffer, 40 + count * 8);
    const radius = new Float32Array(count), family = new Uint8Array(count), pigment = new Uint8Array(count);
    for (let i = 0; i < count; i++) {
      radius[i] = dv.getFloat32(40 + i * 8, true);
      family[i] = dv.getUint8(44 + i * 8);
      pigment[i] = dv.getUint8(45 + i * 8);
    }
    return { count, samples, min, size, points, radius, family, pigment };
  })();
  sourceCache.set(id, promise);
  try { return await promise; } catch (e) { sourceCache.delete(id); throw e; }
}

function pointAt(source, strand, t, target) {
  const f = t * (source.samples - 1), k = Math.min(source.samples - 2, Math.floor(f)), a = f - k;
  const index = (strand * source.samples + k) * 3;
  for (let c = 0; c < 3; c++) target.setComponent(c, source.min[c] + (source.points[index + c] * (1 - a) + source.points[index + 3 + c] * a) / 65535 * source.size[c]);
  return target;
}

function buildStrands(source, indices, steps, sides, desktop) {
  const vertices = indices.length * steps * sides;
  const positions = new Float32Array(vertices * 3), normals = new Float32Array(vertices * 3);
  const tangents = new Float32Array(vertices * 4), colors = new Float32Array(vertices * 3), uvs = new Float32Array(vertices * 2);
  const triangles = new Uint32Array(indices.length * (steps - 1) * sides * 6);
  const p = new THREE.Vector3(), before = new THREE.Vector3(), after = new THREE.Vector3(), tangent = new THREE.Vector3();
  const normal = new THREE.Vector3(), binormal = new THREE.Vector3(), radial = new THREE.Vector3();
  let vi = 0, ti = 0;
  for (const strand of indices) {
    const start = vi;
    normal.set(1, 0, 0);
    const pigment = .72 + source.pigment[strand] / 255 * .54;
    for (let j = 0; j < steps; j++) {
      const t = j / (steps - 1);
      pointAt(source, strand, t, p);
      pointAt(source, strand, Math.max(0, t - .009), before);
      pointAt(source, strand, Math.min(1, t + .009), after);
      tangent.subVectors(after, before).normalize();
      if (tangent.lengthSq() < .1) tangent.set(0, -1, 0);
      // Parallel-transport frame: no arbitrary flips along curved hair.
      normal.addScaledVector(tangent, -normal.dot(tangent));
      if (normal.lengthSq() < .01) normal.set(0, 0, 1).addScaledVector(tangent, -tangent.z);
      normal.normalize(); binormal.crossVectors(tangent, normal).normalize();
      // Real tapered cylindrical strands. Desktop LOD slightly widens subpixel
      // fibers for stable coverage; source and portrait preserve physical radii.
      const radius = source.radius[strand] * (desktop ? 1.7 : 1.15) * (.98 * Math.pow(1 - t, .32) + .02);
      for (let k = 0; k < sides; k++) {
        const angle = k / sides * Math.PI * 2;
        radial.copy(normal).multiplyScalar(Math.cos(angle)).addScaledVector(binormal, Math.sin(angle));
        const i = vi * 3;
        positions[i] = p.x + radial.x * radius; positions[i + 1] = p.y + radial.y * radius; positions[i + 2] = p.z + radial.z * radius;
        normals[i] = radial.x; normals[i + 1] = radial.y; normals[i + 2] = radial.z;
        tangents[vi * 4] = tangent.x; tangents[vi * 4 + 1] = tangent.y; tangents[vi * 4 + 2] = tangent.z; tangents[vi * 4 + 3] = 1;
        colors[i] = pigment; colors[i + 1] = pigment * .95; colors[i + 2] = pigment * .90;
        uvs[vi * 2] = k / sides; uvs[vi * 2 + 1] = t;
        if (j < steps - 1) {
          const a = start + j * sides + k, b = start + j * sides + (k + 1) % sides;
          triangles[ti++] = a; triangles[ti++] = b; triangles[ti++] = a + sides;
          triangles[ti++] = b; triangles[ti++] = b + sides; triangles[ti++] = a + sides;
        }
        vi++;
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
  g.setAttribute('tangent', new THREE.BufferAttribute(tangents, 4));
  g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  g.setIndex(new THREE.BufferAttribute(triangles, 1));
  g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
}

function makeRootLayer(head, color) {
  if (!head?.geometry?.attributes.position) return null;
  const p = head.geometry.attributes.position, n = head.geometry.attributes.normal, index = head.geometry.index;
  if (!n || !index) return null;
  const pos = new Float32Array(p.count * 3), normal = new Float32Array(p.count * 3), colors = new Float32Array(p.count * 4);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const phi = Math.atan2(x, z + .014), front = Math.max(0, Math.cos(phi));
    const hairline = -.026 + .084 * front;
    const a = THREE.MathUtils.smoothstep(y, hairline, hairline + .013);
    for (let k = 0; k < 3; k++) {
      const v = k === 0 ? x : k === 1 ? y : z;
      const nn = k === 0 ? n.getX(i) : k === 1 ? n.getY(i) : n.getZ(i);
      pos[i * 3 + k] = v + nn * .00014; normal[i * 3 + k] = nn;
      colors[i * 4 + k] = .42;
    }
    colors[i * 4 + 3] = a;
  }
  const selected = [];
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i), b = index.getX(i + 1), c = index.getX(i + 2);
    if (colors[a * 4 + 3] + colors[b * 4 + 3] + colors[c * 4 + 3] > .03) selected.push(a, b, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(normal, 3));
  g.setAttribute('color', new THREE.BufferAttribute(colors, 4)); g.setIndex(selected);
  g.computeBoundingSphere();
  const m = new THREE.MeshStandardMaterial({ color, roughness: .88, vertexColors: true, alphaTest: .08, alphaToCoverage: true });
  const layer = new THREE.Mesh(g, m); layer.name = 'Groom_ScalpRootDensity';
  layer.userData.isGroomRoot = true; layer.castShadow = false; layer.receiveShadow = true;
  return layer;
}

export async function buildCurveGroom(style, head, config = {}) {
  const id = groomStyleFor(style);
  if (!id) throw new Error('未知 Groom 发型');
  const source = await decodeSource(id);
  const desktop = config.groomLod !== 'studio';
  const budget = desktop ? 3000 : Math.min(source.count, Number(config.groomDensity || 9000));
  const count = Math.max(600, Math.min(source.count, budget));
  const families = [[], [], [], []];
  for (let i = 0; i < count; i++) {
    const strand = Math.floor(i * source.count / count);
    families[Math.min(3, source.family[strand])].push(strand);
  }
  const group = new THREE.Group(); group.name = 'HairGroup';
  const base = new THREE.Color(config.hairColor || config.materials?.hairColorHex || '#191518');
  base.lerp(new THREE.Color('#31231e'), .16);
  const names = ['GuideFlow', 'FeatheredFringe', 'TempleWisps', 'Flyaways'];
  const root = makeRootLayer(head, base); if (root) group.add(root);
  let triangles = 0;
  for (let f = 0; f < families.length; f++) {
    if (!families[f].length) continue;
    const g = buildStrands(source, families[f], desktop ? 20 : 32, 3, desktop);
    const material = new THREE.MeshPhysicalMaterial({
      color: base, vertexColors: true, roughness: .46, metalness: 0,
      anisotropy: .86, anisotropyRotation: 0, specularIntensity: .48,
      specularColor: new THREE.Color('#f5e4d3'), envMapIntensity: .36,
      sheen: .12, sheenRoughness: .55, sheenColor: base, clearcoat: 0,
      emissive: 0, side: THREE.FrontSide,
    });
    material.userData.builtInHair = true; material.userData.curveGroom = true;
    const mesh = new THREE.Mesh(g, material); mesh.name = `Groom_${names[f]}`;
    mesh.userData.isGroomMesh = true; mesh.userData.groomFamily = f;
    mesh.castShadow = !desktop && f !== 3; mesh.receiveShadow = false;
    group.add(mesh); triangles += g.index.count / 3;
  }
  group.userData.groom = { id, sourceCurves: source.count, renderedStrands: count, triangles, lod: desktop ? 'desktop' : 'portrait', nativeSource: 'public/grooms/Chinese_Grooms_Source.blend' };
  return group;
}

// Real shape controls for the new groom, not legacy GLB morph names with no effect.
export function applyCurveGroomShape(node, morphs) {
  const volume = Number(morphs?.hairVolume || 0), length = Number(morphs?.hairLength || 0), bangs = Number(morphs?.bangsLength || 0);
  const signature = `${volume}|${length}|${bangs}`;
  node.traverse(mesh => {
    if (!mesh.userData.isGroomMesh || mesh.userData.groomShape === signature) return;
    mesh.userData.groomShape = signature;
    const g = mesh.geometry, p = g.attributes.position, uv = g.attributes.uv;
    if (!g.userData.groomBase && volume === 0 && length === 0 && bangs === 0) return;
    const base = g.userData.groomBase || (g.userData.groomBase = p.array.slice());
    for (let i = 0; i < p.count; i++) {
      const t = uv.getY(i), w = THREE.MathUtils.smoothstep(t, .05, .7), o = i * 3;
      const x = base[o], y = base[o + 1], z = base[o + 2];
      p.array[o] = x * (1 + volume * .12 * w);
      p.array[o + 1] = y - length * .025 * w * Math.max(0, .04 - y) / .18 - (mesh.userData.groomFamily === 1 ? bangs * .012 * w : 0);
      p.array[o + 2] = z + (z + .014) * volume * .11 * w;
    }
    p.needsUpdate = true; g.computeBoundingSphere();
  });
}
