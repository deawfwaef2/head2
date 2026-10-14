import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheBase = '/var/tmp/cervix3d-build-cache';
fs.mkdirSync(cacheBase, { recursive: true });
process.env.TMPDIR = cacheBase;
const distDir = fs.mkdtempSync(path.join(cacheBase, 'head2-build-'));
console.log('1. Building in /var/tmp disk staging (avoiding /tmp tmpfs RAM disk); last playable HTML stays intact...');
execFileSync(process.execPath, [path.join(projectDir, 'node_modules/vite/bin/vite.js'), 'build', '--outDir', distDir, '--emptyOutDir'], { cwd: projectDir, stdio: 'inherit' });
const assetsDir = path.join(distDir, 'assets');
const htmlRaw = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');

const assetFiles = fs.readdirSync(assetsDir);
const cssFile = assetFiles.find(f => f.endsWith('.css'));
const jsFile = assetFiles.find(f => f.endsWith('.js'));

const cssContent = cssFile ? fs.readFileSync(path.join(assetsDir, cssFile), 'utf8') : '';
const jsContent = jsFile ? fs.readFileSync(path.join(assetsDir, jsFile), 'utf8') : '';

const glbFiles = [
  'daz_asian_head_base.glb',
  'hair_bob01.glb',
  'hair_user_photo.glb',
  'hair_bob02.glb',
  'hair_short02.glb',
  'daz_hair_asym_short.glb',
  'daz_hair_pixie_chic.glb',
  'daz_hair_air_bangs_long.glb',
  'hair_long01.glb',
  'daz_hair_hime.glb',
  'hair_short04.glb',
  'daz_hair_side_long.glb',
  'daz_hair_wolf_clavicle.glb',
  'daz_hair_curtain_wave.glb',
  'daz_hair_hazel_wave.glb',
  'daz_hair_wavy_bob.glb',
  'daz_hair_glam_wave.glb',
  'daz_hair_mermaid_curl.glb',
  'daz_hair_french_lazy_roll.glb',
  'hair_braid01.glb',
  'daz_hair_adrienne_updo.glb',
  'daz_hair_low_chignon.glb',
  'daz_hair_crown_braid.glb',
  'daz_hair_ballerina_bun.glb',
  'hair_ponytail01.glb',
  'daz_hair_twin_buns.glb',
  'daz_hair_halfup_princess.glb',
  'daz_hair_twin_braids.glb',
  'daz_hair_sport_ponytail.glb'
];

const embeddedGlbs = {};
for (const fname of glbFiles) {
  const fpath = path.join(projectDir, 'public/models', fname);
  if (!fs.existsSync(fpath)) throw new Error(`Missing required offline 3D asset: ${fpath}`);
  embeddedGlbs[`/models/${fname}`] = fs.readFileSync(fpath).toString('base64');
}

// Distinct reference photos for SPEC-2026-000 (Chuxia), SPEC-2026-FYP (Fang Yaoping), and SPEC-2026-001 (Lin Xi)
let refPhotoDataUri = '';
const refPhotoPath = path.join(projectDir, 'public/models/chuxia_life_ref.jpg');
if (fs.existsSync(refPhotoPath)) {
  refPhotoDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(refPhotoPath).toString('base64');
}

let fangPhotoDataUri = '';
const fangPhotoPath = path.join(projectDir, 'public/models/fang_yaoping_ref.jpg');
if (fs.existsSync(fangPhotoPath)) {
  fangPhotoDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(fangPhotoPath).toString('base64');
}

let linxiPhotoDataUri = '';
const linxiPhotoPath = path.join(projectDir, 'public/models/linxi_life_ref.jpg');
if (fs.existsSync(linxiPhotoPath)) {
  linxiPhotoDataUri = 'data:image/jpeg;base64,' + fs.readFileSync(linxiPhotoPath).toString('base64');
}

const embeddedModelsScript = `<script>window.__EMBEDDED_GLBS__ = ${JSON.stringify(embeddedGlbs)}; window.__EMBEDDED_REF_PHOTO__ = ${JSON.stringify(refPhotoDataUri)}; window.__EMBEDDED_FANG_PHOTO__ = ${JSON.stringify(fangPhotoDataUri)}; window.__EMBEDDED_LINXI_PHOTO__ = ${JSON.stringify(linxiPhotoDataUri)};</script>`;

let standaloneHtml = htmlRaw
  // Static HUD images load before JS can resolve the embedded photo registry.
  .replace(/src="\.?\/models\/fang_yaoping_ref\.jpg"/g, () => `src="${fangPhotoDataUri}"`)
  .replace(/src="\.?\/models\/(chuxia_life_ref|user_photo_ref)\.(jpg|png)"/g, () => `src="${refPhotoDataUri}"`)
  .replace(/src="\.?\/models\/linxi_life_ref\.jpg"/g, () => `src="${linxiPhotoDataUri}"`)
  .replace(/<link rel="stylesheet"[^>]*>/g, () => `<style>\n${cssContent}\n</style>`)
  .replace(/<script type="module"[^>]*src="[^"]+"[^>]*><\/script>/g, () => {
    return `${embeddedModelsScript}\n<script type="module">\n${jsContent}\n</script>`;
  });

const outPath = path.join(projectDir, '点击开始游戏_CERVIX3D.html');
const stagedHtml = path.join(distDir, 'playable.html');
fs.writeFileSync(stagedHtml, standaloneHtml, 'utf8');
try { fs.renameSync(stagedHtml, outPath); }
catch (err) { if (err.code !== 'EXDEV') throw err; fs.copyFileSync(stagedHtml, outPath); }
const sizeMb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
console.log(`✅ Built standalone playable HTML: ${outPath} (${sizeMb} MB)`);

// Serve the same offline-ready file on GitHub Pages if Pages is configured for /docs.
const docsDir = path.join(projectDir, 'docs');
fs.mkdirSync(docsDir, { recursive: true });
const docsHtml = path.join(docsDir, 'index.html');
fs.rmSync(docsHtml, { force: true });
try { fs.linkSync(outPath, docsHtml); }
catch { fs.copyFileSync(outPath, docsHtml); }
fs.writeFileSync(path.join(docsDir, '.nojekyll'), '');
fs.rmSync(distDir, { recursive: true, force: true });
