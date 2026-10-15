// 安全版 · 构建单文件 HTML（file:// 双击可用）。与主项目 scripts/build_standalone_html.mjs 同名同职责。
// index.html + src/main.js（esbuild 打包 three.js）+ src/style.css + public/models/*.glb（base64 内嵌）
// 用法：node 安全/scripts/build_standalone_html.mjs     （开发预览：cd 安全 && npx vite）
import { build } from 'esbuild';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url';
import { HAIR_CATALOG, HEAD_MODEL_ID } from '../src/data/hairCatalog.js';
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const models = path.join(root, 'public', 'models');
const res = await build({
  entryPoints: [path.join(root, 'src', 'main.js')], bundle: true, format: 'iife', minify: true, write: false, outdir: path.join(root, '.esbuild'),
  target: 'es2020', legalComments: 'none', nodePaths: [path.join(root, 'node_modules'), path.join(root, '..', 'node_modules')], loader: { '.css': 'css' },
});
const js = res.outputFiles.find((f) => f.path.endsWith('.js')).text.replace(/<\/script/gi, '<\\/script');
const css = (res.outputFiles.find((f) => f.path.endsWith('.css'))?.text || '') ;
const emb = {};
for (const id of [HEAD_MODEL_ID, ...HAIR_CATALOG.map((h) => h.id)]) emb[id] = fs.readFileSync(path.join(models, id + '.glb')).toString('base64');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8')
  .replace('<!--__STYLE__-->', () => `<style>\n${css}</style>`)
  .replace('<!--__EMBEDDED_ASSETS__-->', () => `<script>window.__SAFE_EMBEDDED__=${JSON.stringify(emb)};</script>`)
  .replace('<script type="module" src="./src/main.js"></script>', () => `<script>${js}</script>`);
const out = path.join(root, '点击开始_写实收藏胸像.html');
fs.writeFileSync(out, html);
console.log('built', (html.length / 1048576).toFixed(2) + ' MB', Object.keys(emb).length, 'models');
