// 画质提升 · 构建：把 three.js + 演示代码 + 内嵌 GLB 打包成一个 file:// 可双击打开的 HTML
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const models = path.join(here, '..', 'public', 'models');
const HAIRS = [
  ['daz_hair_air_bangs_long', '空气刘海 · 披肩长发'],
  ['hair_long01', '中分 · 自然长直发'],
  ['daz_hair_ballerina_bun', '高丸子头'],
  ['hair_bob01', '内扣短波波'],
  ['daz_hair_side_long', '侧分 · 长发'],
  ['daz_hair_curtain_wave', '八字刘海 · 微卷'],
  ['hair_ponytail01', '低马尾'],
];
const lines = [`export const HEAD_GLB = __b64('${fs.readFileSync(path.join(models, 'daz_asian_head_base.glb')).toString('base64')}');`];
lines.push('export const HAIRS = [');
for (const [id, label] of HAIRS) lines.push(`  { id: '${id}', label: '${label}', data: __b64('${fs.readFileSync(path.join(models, id + '.glb')).toString('base64')}') },`);
lines.push('];');
const pre = `function __b64(s){ const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }\n`;
fs.writeFileSync(path.join(here, 'src', 'assets.gen.js'), pre + lines.join('\n'));
const res = await build({
  entryPoints: [path.join(here, 'src', 'demo.js')],
  bundle: true, format: 'iife', minify: true, write: false, target: 'es2020', legalComments: 'none',
  nodePaths: [path.join(here, '..', 'node_modules')],
});
const js = res.outputFiles[0].text.replace(/<\/script/gi, '<\\/script');
const html = fs.readFileSync(path.join(here, 'src', 'template.html'), 'utf8').replace('/*__BUNDLE__*/', () => js);
const out = path.join(here, '点击打开_画质提升演示.html');
fs.writeFileSync(out, html);
fs.unlinkSync(path.join(here, 'src', 'assets.gen.js'));
console.log('built', out, (html.length / 1048576).toFixed(2) + ' MB');
