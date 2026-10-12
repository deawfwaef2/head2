import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

console.log('1. Running Vite production build...');
execSync('npx vite build', { stdio: 'inherit' });

// Resolve from this script rather than assuming the repository lives at /home/user.
const projectDir = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const distDir = path.join(projectDir, 'dist');
const assetsDir = path.join(distDir, 'assets');
const htmlRaw = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

const assetFiles = fs.readdirSync(assetsDir);
const cssFile = assetFiles.find(f => f.endsWith('.css'));
const jsFile = assetFiles.find(f => f.endsWith('.js'));

const cssContent = cssFile ? fs.readFileSync(path.join(assetsDir, cssFile), 'utf8') : '';
const jsContent = jsFile ? fs.readFileSync(path.join(assetsDir, jsFile), 'utf8') : '';

const glbFiles = [
  'daz_asian_head_base.glb',
  'hair_user_photo.glb',
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
  const fpath = path.join(projectDir, 'public/models', fname);
  if (!fs.existsSync(fpath)) throw new Error(`Missing required offline 3D asset: ${fpath}`);
  embeddedGlbs[`/models/${fname}`] = fs.readFileSync(fpath).toString('base64');
}

// User's own reference photo for the SPEC-2026-000 preset (embedded as data URI for file:// offline mode)
let refPhotoDataUri = '';
const refPhotoPath = path.join(projectDir, 'public/models/user_photo_ref.jpg');
if (fs.existsSync(refPhotoPath)) {
  refPhotoDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(refPhotoPath).toString('base64');
} else {
  console.warn(`⚠️ Reference photo not found (dev-server fallback will be used): ${refPhotoPath}`);
}

const embeddedModelsScript = `<script>window.__EMBEDDED_GLBS__ = ${JSON.stringify(embeddedGlbs)}; window.__EMBEDDED_REF_PHOTO__ = ${JSON.stringify(refPhotoDataUri)};</script>`;

let standaloneHtml = htmlRaw
  .replace(/<link rel="stylesheet"[^>]*>/g, `<style>\n${cssContent}\n</style>`)
  .replace(/<script type="module"[^>]*src="[^"]+"[^>]*><\/script>/g, () => {
    return `${embeddedModelsScript}\n<script type="module">\n${jsContent}\n</script>`;
  });

const outPath = path.join(projectDir, '点击开始游戏_CERVIX3D.html');
fs.writeFileSync(outPath, standaloneHtml, 'utf8');
const sizeMb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
console.log(`✅ Built standalone playable HTML: ${outPath} (${sizeMb} MB)`);

// Serve the same offline-ready file on GitHub Pages if Pages is configured for /docs.
const docsDir = path.join(projectDir, 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(path.join(docsDir, 'index.html'), standaloneHtml, 'utf8');
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');
