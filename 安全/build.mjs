// 安全版 · 构建：three.js + app + 内嵌 GLB → 单文件 HTML（file:// 双击可用）
import { build } from 'esbuild';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const models = path.join(here, 'assets', 'models');
const HAIRS = [
  ['daz_hair_air_bangs_long', '空气刘海 · 披肩长发'], ['hair_long01', '中分 · 自然长直发'], ['daz_hair_side_long', '侧分 · 长发'],
  ['daz_hair_curtain_wave', '八字刘海 · 微卷'], ['hair_bob01', '内扣短波波'], ['daz_hair_wavy_bob', '微卷波波头'],
  ['daz_hair_ballerina_bun', '高丸子头'], ['daz_hair_low_chignon', '低盘发'], ['hair_ponytail01', '低马尾'], ['daz_hair_pixie_chic', '精灵短发'],
];
const lines = [`export const HEAD_GLB = __b64('${fs.readFileSync(path.join(models, 'bust_head_base.glb')).toString('base64')}');`, 'export const HAIRS = ['];
for (const [id, label] of HAIRS) lines.push(`  { id: '${id}', label: '${label}', data: __b64('${fs.readFileSync(path.join(models, id + '.glb')).toString('base64')}') },`);
lines.push('];');
const gen = path.join(here, 'src', 'assets.gen.js');
fs.writeFileSync(gen, `function __b64(s){ const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }\n` + lines.join('\n'));
try {
  const res = await build({ entryPoints: [path.join(here, 'src', 'app.js')], bundle: true, format: 'iife', minify: true, write: false, target: 'es2020', legalComments: 'none', nodePaths: [path.join(here, '..', 'node_modules')] });
  const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
  const html = fs.readFileSync(path.join(here, 'src', 'template.html'), 'utf8').replace('/*__BUNDLE__*/', () => js);
  fs.writeFileSync(path.join(here, '点击开始_写实收藏胸像.html'), html);
  console.log('built', (html.length / 1048576).toFixed(2) + ' MB');
} finally { fs.unlinkSync(gen); }
