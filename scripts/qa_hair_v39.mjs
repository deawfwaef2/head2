// Optional test dependency: npm install --no-save playwright && npx playwright install chromium
// QA_URL=file:///absolute/path/点击开始游戏_CERVIX3D.html tests the downloadable file offline.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
const url = process.env.QA_URL || 'http://127.0.0.1:5173';
const offline = url.startsWith('file:');
const report = { url: offline ? 'file:// standalone' : url, renderer: 'Chromium / SwiftShader', tests: [], errors: [], network: [] };
const check = (name, ok, detail) => { report.tests.push({ name, passed: !!ok, detail }); if (!ok) throw new Error(name + ': ' + JSON.stringify(detail)); };
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const page = await browser.newPage({ viewport: { width: 1100, height: 780 }, acceptDownloads: true });
  page.on('pageerror', e => report.errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') report.errors.push(m.text().slice(0, 2000)); });
  if (offline) await page.route(/^https?:/, route => { report.network.push(route.request().url()); return route.abort(); });
  await page.addInitScript(() => {
    if (!localStorage.getItem('qa-seeded')) {
      localStorage.setItem('cervix3d-collectibles-stage36-master-v1', JSON.stringify(['FYP','000','001','002','003','004'].map(x => ({id:'SPEC-2026-'+x,name:'QA '+x,summoned:false}))));
      localStorage.setItem('cervix3d-render-quality', 'low');
      localStorage.setItem('qa-seeded','1');
    }
  });
  // Never write QA collectibles into the user's project API.
  await page.route('**/api/collectibles', route => route.fulfill({contentType:'application/json',body:'{"ok":true,"items":[]}'}));
  await page.goto(url);
  await page.waitForFunction(() => window.__cervixQA?.ready, null, {timeout: 120000});
  check('startup without JS/GLSL errors', report.errors.length === 0, report.errors);
  await page.click('#btn-start-with-studio');
  await page.click('.nav-tab[data-tab=studio]');
  await page.evaluate(() => { const {desktop:d,studio:s}=window.__cervixQA; cancelAnimationFrame(d.animFrameId); cancelAnimationFrame(s.animId); d.renderer.clear(); s.renderer.shadowMap.enabled=false; s.renderer.setSize(384,384); s.renderer.setPixelRatio(1); s.camera.aspect=1; s.camera.updateProjectionMatrix(); s.setCameraPreset('front'); });
  await page.locator('#slider-hair-sheen').evaluate(el => {el.value='0';el.dispatchEvent(new Event('input',{bubbles:true}));});
  const zero = await page.evaluate(() => {
    const n=window.__cervixQA.studio.headNode; let mats=[];
    n.getObjectByName('HairGroup').traverse(o=>{if(o.material?.userData.builtInHair && o.name!=='ScalpRootFeatherCap') mats.push({spec:o.material.specularIntensity,alpha:o.material.alphaTest,transparent:o.material.transparent});});
    return {saved:n.userData.hairSheen,mats};
  });
  check('zero sheen stored and eliminates built-in specular', zero.saved===0 && zero.mats.length>0 && zero.mats.every(m=>m.spec===0 && !m.transparent), zero);
  if (!offline) {
    const matrix = await page.evaluate(async () => {
      const {attachRealHairModel, updateHairSheen, applyArtistHairFineTuning} = await import('/src/three/collectibleHeadAssembler.js');
      const {REAL_HAIR_CATALOG}=await import('/src/data/defaultCollectibles.js');
      const s=window.__cervixQA.studio, n=s.headNode, rows=[];
      for (const style of REAL_HAIR_CATALOG.filter(x=>x.id!=='none')) {
        await attachRealHairModel(n,{hairStyle:style.id,frontBangs:'default',sideLocks:'default',backAttachment:'none',hairSheen:0.45});
        s.renderer.render(s.scene,s.camera);
        let duplicates=0,materials=0;
        n.getObjectByName('HairGroup')?.traverse(o=>{if(o.name.endsWith('_SilkyWisps'))duplicates++;if(o.isMesh)materials++;});
        rows.push({id:style.id,loaded:!!n.getObjectByName('HairGroup'),error:n.userData.hairLoadError||null,duplicates,materials});
      }
      updateHairSheen(n,0);
      await attachRealHairModel(n,{hairStyle:'hair_bob02',frontBangs:'default',sideLocks:'default',backAttachment:'none'});
      let restored=[];n.getObjectByName('HairGroup').traverse(o=>{if(o.material?.userData.builtInHair && o.name!=='ScalpRootFeatherCap')restored.push(o.material.specularIntensity);});
      applyArtistHairFineTuning(n,{hairLength:0.4,hairVolume:0.2});
      let bounds=true;n.getObjectByName('HairGroup').traverse(o=>{if(o.isMesh&&o.name!=='ScalpRootFeatherCap')bounds&&=Number.isFinite(o.geometry.boundingSphere?.radius);});
      return {rows,restored,bounds};
    });
    check('all catalog hairstyles load/render, no duplicate wisps', matrix.rows.length>=28 && matrix.rows.every(x=>x.loaded&&!x.error&&!x.duplicates), matrix.rows);
    check('zero sheen survives hairstyle replacement',matrix.restored.length>0&&matrix.restored.every(x=>x===0),matrix.restored);
    check('edited geometry has updated finite bounds',matrix.bounds,matrix.bounds);
  }
  // Actual file input + IndexedDB + save button, not just a synthetic state mutation.
  await page.setInputFiles('#inp-custom-hair-model', path.resolve('public/models/hair_bob02.glb'));
  await page.waitForFunction(()=>window.__cervixQA.state.studioDraft.customHairUrl?.startsWith('private-asset:') && window.__cervixQA.studio.headNode?.userData.customHairUrl===window.__cervixQA.state.studioDraft.customHairUrl,null,{timeout:60000});
  const imported=await page.evaluate(()=>{const n=window.__cervixQA.studio.headNode;let mats=[];n.getObjectByName('HairGroup').traverse(o=>{if(o.isMesh)mats.push({imported:o.material.userData.importedHair,roughness:o.material.roughness});});return {url:n.userData.customHairUrl,mats};});
  check('import keeps original PBR and no generated scalp shell',imported.mats.length>0&&imported.mats.every(m=>m.imported&&Math.abs(m.roughness-0.46)<1e-6),imported);
  await page.click('[data-studio-subtab="save"]');
  await page.locator('#inp-col-name').fill('Hair QA specimen');
  await page.locator('#inp-col-id').fill('QA-HAIR-V39');
  await page.locator('#btn-save-and-summon').evaluate(el=>el.click());
  await page.waitForFunction(()=>window.__cervixQA.state.collectibles.some(x=>x.id==='QA-HAIR-V39') && window.__cervixQA.desktop.pets.has('QA-HAIR-V39'),null,{timeout:60000});
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('cervix3d-collectibles-stage36-master-v1')).find(x=>x.id==='QA-HAIR-V39'));
  check('registered collectible persists custom hair reference/type',saved.customHairUrl===imported.url&&saved.customHairType==='glb', {url:saved.customHairUrl,type:saved.customHairType});
  await page.reload();
  await page.waitForFunction(()=>window.__cervixQA?.ready,null,{timeout:120000});
  const restored=await page.evaluate(()=>{const q=window.__cervixQA,p=q.desktop.pets.get('QA-HAIR-V39');return {url:p?.node.userData.customHairUrl,error:p?.node.userData.hairLoadError,exists:!!p?.node.getObjectByName('HairGroup'),petIds:[...q.desktop.pets.keys()],record:q.state.collectibles.find(x=>x.id==='QA-HAIR-V39'),stored:JSON.parse(localStorage.getItem('cervix3d-collectibles-stage36-master-v1')).find(x=>x.id==='QA-HAIR-V39')};});
  check('reload restores imported hair on desktop pet',restored.exists&&restored.url===imported.url&&!restored.error,restored);
  check('no JS / GLSL compile errors across tests',report.errors.length===0,report.errors);
  if(offline)check('offline HTML makes no HTTP(S) requests',report.network.length===0,report.network);
} catch(e) {report.failure=e.message;process.exitCode=1;}
finally {await browser.close();fs.writeFileSync(offline?'HAIR_QA_OFFLINE.json':'HAIR_QA_DEV.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
