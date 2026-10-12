import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('1. Running Vite production build...');
execSync('npx vite build', { stdio: 'inherit' });

const distDir = path.resolve('/home/user/dist');
const assetsDir = path.join(distDir, 'assets');
const htmlRaw = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

const assetFiles = fs.readdirSync(assetsDir);
const cssFile = assetFiles.find(f => f.endsWith('.css'));
const jsFile = assetFiles.find(f => f.endsWith('.js'));

const cssContent = cssFile ? fs.readFileSync(path.join(assetsDir, cssFile), 'utf8') : '';
const jsContent = jsFile ? fs.readFileSync(path.join(assetsDir, jsFile), 'utf8') : '';

const glbFiles = [
  'daz_asian_head_base.glb',
  'hair_long01.glb',
  'hair_bob01.glb',
  'hair_bob02.glb',
  'hair_ponytail01.glb',
  'hair_braid01.glb',
  'hair_short02.glb',
  'hair_short04.glb'
];

const embeddedGlbs = {};
for (const fname of glbFiles) {
  const fpath = path.join('/home/user/public/models', fname);
  if (fs.existsSync(fpath)) {
    embeddedGlbs[`/models/${fname}`] = fs.readFileSync(fpath).toString('base64');
  }
}

const embeddedModelsScript = `<script>window.__EMBEDDED_GLBS__ = ${JSON.stringify(embeddedGlbs)};</script>`;

let standaloneHtml = htmlRaw
  .replace(/<link rel="stylesheet"[^>]*>/g, `<style>\n${cssContent}\n</style>`)
  .replace(/<script type="module"[^>]*src="[^"]+"[^>]*><\/script>/g, () => {
    return `${embeddedModelsScript}\n<script type="module">\n${jsContent}\n</script>`;
  });

const outPath = '/home/user/点击开始游戏_CERVIX3D.html';
fs.writeFileSync(outPath, standaloneHtml, 'utf8');
const sizeMb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
console.log(`✅ Built standalone playable HTML: ${outPath} (${sizeMb} MB)`);
