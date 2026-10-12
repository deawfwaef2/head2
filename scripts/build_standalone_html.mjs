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

// Compress OBJ strings by omitting vn lines (since computeWeldedSmoothNormals computes smooth normals on load!)
function loadCompactObj(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  return raw
    .split('\n')
    .filter(line => !line.startsWith('vn '))
    .map(line => {
      if (line.startsWith('f ')) {
        // convert f v/vt/vn to f v/vt
        return 'f ' + line.slice(2).split(' ').map(tok => {
          const parts = tok.split('/');
          return `${parts[0]}/${parts[1] || parts[0]}`;
        }).join(' ');
      }
      return line;
    })
    .join('\n');
}

// MakeHuman CC0 head/hair keep their vn normals (OBJ loader does not recompute them for custom models)
function loadRawObj(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

const embeddedModels = {
  linxi: loadCompactObj('/home/user/public/models/daz_asian_female_linxi.obj'),
  suwan: loadCompactObj('/home/user/public/models/daz_asian_female_suwan.obj'),
  qianxue: loadCompactObj('/home/user/public/models/daz_asian_female_qianxue.obj'),
  mh_asian: loadCompactObj('/home/user/public/models/mh_asian_female_head.obj'),
  'mh_asian_female_head.obj': loadCompactObj('/home/user/public/models/mh_asian_female_head.obj'),
  'mh_hair_bob02.obj': loadCompactObj('/home/user/public/models/mh_hair_bob02.obj'),
  'mh_hair_long01.obj': loadCompactObj('/home/user/public/models/mh_hair_long01.obj'),
  'mh_hair_ponytail01.obj': loadCompactObj('/home/user/public/models/mh_hair_ponytail01.obj')
};

const embeddedModelsScript = `<script>window.__EMBEDDED_MODELS__ = ${JSON.stringify(embeddedModels)};</script>`;

// Replace external <link rel="stylesheet"> and <script type="module" src="..."> with inline tags
let standaloneHtml = htmlRaw
  .replace(/<link rel="stylesheet"[^>]*>/g, `<style>\n${cssContent}\n</style>`)
  .replace(/<script type="module"[^>]*src="[^"]+"[^>]*><\/script>/g, () => {
    return `${embeddedModelsScript}\n<script type="module">\n${jsContent}\n</script>`;
  });

const outPath = '/home/user/点击开始游戏_CERVIX3D.html';
fs.writeFileSync(outPath, standaloneHtml, 'utf8');
const sizeMb = (fs.statSync(outPath).size / (1024 * 1024)).toFixed(2);
console.log(`✅ Built standalone playable HTML: ${outPath} (${sizeMb} MB)`);
