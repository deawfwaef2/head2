// 安全版资产清洗：从原 GLB 中移除颈部截面网格(NeckCrossSection)，并把其几何数据清零；重写元数据；复制中性发型。
// 只改 JSON（保持 bufferView 索引不变，因为 extras.realWebAssets 里的肤质/眉毛贴图按 bufferView 索引引用）。
// 用法：node 安全/scripts/sanitize_assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { HAIR_CATALOG } from '../src/data/hairCatalog.js';
const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, '..', '..', 'public', 'models');
const out = path.join(here, '..', 'public', 'models');
fs.mkdirSync(out, { recursive: true });

const glb = fs.readFileSync(path.join(src, 'daz_asian_head_base.glb'));
const jsonLen = glb.readUInt32LE(12);
const json = JSON.parse(glb.slice(20, 20 + jsonLen).toString('utf8'));
const binHeader = 20 + jsonLen;
const binLen = glb.readUInt32LE(binHeader);
const bin = Buffer.from(glb.slice(binHeader + 8, binHeader + 8 + binLen));

const badMesh = json.meshes.findIndex((m) => /NeckCrossSection/i.test(m.name));
const badNode = json.nodes.findIndex((n) => /NeckCrossSection/i.test(n.name || ''));
if (badMesh >= 0) {
  // 清零该网格引用的所有 bufferView 数据（不改变索引）
  const acc = new Set();
  for (const p of json.meshes[badMesh].primitives) {
    Object.values(p.attributes).forEach((a) => acc.add(a));
    if (p.indices != null) acc.add(p.indices);
    (p.targets || []).forEach((t) => Object.values(t).forEach((a) => acc.add(a)));
  }
  for (const a of acc) {
    const bv = json.bufferViews[json.accessors[a].bufferView];
    if (bv) bin.fill(0, bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
  }
}
if (badNode >= 0) {
  for (const s of json.scenes) s.nodes = s.nodes.filter((i) => i !== badNode);
  json.nodes[badNode] = { name: 'Removed' };
}
const badMat = json.materials.findIndex((m) => /NeckCrossSection/i.test(m.name));
if (badMat >= 0) json.materials[badMat] = { name: 'Unused' };
if (badMesh >= 0) json.meshes[badMesh] = { name: 'Unused', primitives: json.meshes.find((m, i) => i !== badMesh).primitives.slice(0, 1).map((p) => ({ attributes: { POSITION: p.attributes.POSITION } })) };
json.asset.generator = 'SafeBust sanitizer (neutral collectible bust)';
let js = Buffer.from(JSON.stringify(json), 'utf8');
const pad = (4 - (js.length % 4)) % 4; js = Buffer.concat([js, Buffer.alloc(pad, 0x20)]);
const total = 12 + 8 + js.length + 8 + bin.length;
const head = Buffer.alloc(12); head.writeUInt32LE(0x46546c67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(total, 8);
const jh = Buffer.alloc(8); jh.writeUInt32LE(js.length, 0); jh.writeUInt32LE(0x4e4f534a, 4);
const bh = Buffer.alloc(8); bh.writeUInt32LE(bin.length, 0); bh.writeUInt32LE(0x004e4942, 4);
fs.writeFileSync(path.join(out, 'bust_head_base.glb'), Buffer.concat([head, jh, js, bh, bin]));

// 中性发型（不含任何由真人照片生成的发型）
const HAIRS = HAIR_CATALOG.map((h) => h.id); // hair_user_photo 等由真人照片生成的资产永不复制
for (const h of HAIRS) fs.copyFileSync(path.join(src, h + '.glb'), path.join(out, h + '.glb'));
console.log(fs.readdirSync(out).map((f) => f + ' ' + (fs.statSync(path.join(out, f)).size / 1048576).toFixed(2) + 'MB').join('\n'));
