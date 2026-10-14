// npm ci; npm install --no-save playwright; npx playwright install chromium --only-shell
// Run from repository root. Exercises the actual downloaded HTML over file:// with HTTP blocked.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { STYLE_MODULES, STYLE_DEFAULTS, composeStyleModules, migratePhotographyRecipe } from '../src/ui/styleModules.js';
const report={mode:'offline file:// / Chromium SwiftShader (not hardware GPU)',tests:[],errors:[],warnings:[],network:[],screenshots:[]};
const check=(name,ok,detail)=>{report.tests.push({name,passed:!!ok,...(detail===undefined?{}:{detail})});if(!ok)throw Error(name);};
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
fs.mkdirSync('qa/stage45',{recursive:true});
let browser;
try {
  const source={keyIntensity:2,skinGloss:.3,poreReliefGlobal:1.1,repairSkinMatteAmount:0};
  const snap=JSON.stringify(source);
  check('all modules OFF are a strict no-op',equal(composeStyleModules(source,STYLE_DEFAULTS),{}));
  for(const m of STYLE_MODULES) check(`${m.flag}: zero strength adds no overrides`,equal(composeStyleModules(source,{...STYLE_DEFAULTS,[m.flag]:true,[m.amount]:0}),{}));
  check('pure composition never mutates input',JSON.stringify(source)===snap);
  check('legacy photographic recipes migrate independently',migratePhotographyRecipe({photoBaseline:true}).microDetail===true);
  browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const page=await browser.newPage({viewport:{width:1280,height:800},acceptDownloads:true});
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('console',m=>{if(m.type()==='warning')report.warnings.push(m.text());if(m.type()==='error')report.errors.push(m.text().slice(0,1500));});
  await page.route(/^https?:/,r=>{report.network.push(r.request().url());return r.abort();});
  await page.addInitScript(()=>{
    localStorage.setItem('cervix3d-render-quality','low');
    localStorage.setItem('cervix3d-collectibles-stage44-master-v1',JSON.stringify(['FYP','000','001','002','003','004'].map(x=>({id:'SPEC-2026-'+x,name:'QA '+x,summoned:false}))));
  });
  const url=pathToFileURL(path.resolve('点击开始游戏_CERVIX3D.html')).href;
  const boot=async()=>{await page.goto(url);await page.waitForFunction(()=>window.__cervixQA?.ready,null,{timeout:120000});await page.click('#btn-start-with-studio');await page.click('.nav-tab[data-tab=studio]');await page.evaluate(()=>{const q=window.__cervixQA;cancelAnimationFrame(q.desktop.animFrameId);cancelAnimationFrame(q.studio.animId);q.studio.resize();});};
  const state=()=>page.evaluate(()=>{const q=window.__cervixQA;q.visualRepair.flush();const m=q.studio.headNode.getObjectByName('HeadSkinMesh').material;return {options:q.visualRepair.options,configs:[q.desktop.visualConfig,q.studio.visualConfig],originals:q.visualRepair.originals,records:JSON.stringify(q.state.collectibles),roughness:m.roughness,baseRoughness:m.userData.customSkinRoughness,pore:m.userData.skinGradingUniforms.uPoreRelief.value,basePore:m.userData.baseVisualPoreRelief};});
  const capture=async(name)=>{await page.evaluate(()=>{const s=window.__cervixQA.studio;s.resize();s.renderer.render(s.scene,s.camera);});const file=`qa/stage45/${name}.jpg`;await page.screenshot({path:file,type:'jpeg',quality:82});report.screenshots.push(file);};
  await boot();const original=await state();
  check('fresh startup leaves modulator disabled',!original.options.enabled);
  const rect=await page.locator('#studio-preview-canvas').boundingBox();
  check('studio canvas fits vertically in 1280x800 viewport',rect.y+rect.height<=800&&rect.height>=280,rect);
  await capture('01-original');
  await page.locator('#btn-visual-repair').evaluate(e=>e.click());
  check('opening panel is non-destructive',equal((await state()).configs,original.configs));
  // Real input event: master OFF must stay OFF even if a module is being prepared.
  await page.locator('[data-vr=photoLighting]').check();
  check('editing a module while master OFF does not implicitly enable it',!(await state()).options.enabled&&equal((await state()).configs,original.configs));
  await page.locator('[data-recipe=photo]').click();let active=await state();
  check('natural photography enables all five modules',STYLE_MODULES.every(m=>active.options[m.flag]));
  check('photography actually changes shader material response',active.roughness>original.roughness&&active.pore<original.pore,{original:{roughness:original.roughness,pore:original.pore},active:{roughness:active.roughness,pore:active.pore}});
  check('base materials, saved records and original configs remain unchanged',active.baseRoughness===original.baseRoughness&&active.records===original.records&&equal(active.originals,original.originals));
  await page.click('[data-tab=skin]');await capture('02-natural-modules');
  await page.click('#vr-compare');let ab=await state();
  check('A/B restores original configs AND actual roughness/pore uniforms',equal(ab.configs,original.configs)&&ab.roughness===original.roughness&&ab.pore===original.pore);
  await page.click('#vr-compare');await state();
  // Test independent off/zero/full routing in BOTH engines.
  for(const module of STYLE_MODULES) {
    await page.evaluate(m=>{const r=window.__cervixQA.visualRepair;r.set({[m.flag]:false});r.flush();},module);
    const off=await state();const key=Object.keys(module.targets)[0];
    check(`${module.flag}: disabling restores its original property in both engines`,off.configs.every((c,i)=>c[key]===original.configs[i][key]||equal(c[key],original.configs[i][key])));
    await page.evaluate(m=>{const r=window.__cervixQA.visualRepair;r.set({[m.flag]:true,[m.amount]:0});r.flush();},module);
    const zero=await state();check(`${module.flag}: runtime zero equals OFF`,equal(zero.configs,off.configs));
    await page.evaluate(m=>{const r=window.__cervixQA.visualRepair;r.set({[m.amount]:1});r.flush();},module);
  }
  await page.locator('#vr-panel [data-action=cancel]').first().click();const canceled=await state();
  check('cancel restores session before panel opened',!canceled.options.enabled&&equal(canceled.configs,original.configs)&&canceled.records===original.records);
  await page.locator('#btn-visual-repair').evaluate(e=>e.click());await page.click('[data-recipe=photo]');await state();
  await page.click('[data-action=apply]');await page.click('[data-cam=three_quarter]');await capture('03-three-quarter');
  await page.click('[data-cam=anatomy_bottom]');await capture('04-base-section');
  await page.click('[data-cam=front]');await capture('05-natural-front');
  await page.locator('#btn-visual-repair').evaluate(e=>e.click());await page.locator('.vr-library summary').click();
  await page.locator('#vr-recipe-name').fill('自然摄影 QA');await page.click('[data-action=save]');check('save writes recipe to browser storage',await page.evaluate(()=>JSON.parse(localStorage.getItem('cervix3d-visual-repair-v1')||'null')?.name==='自然摄影 QA'));
  const downloaded=page.waitForEvent('download');await page.click('[data-action=export]');const file=await downloaded;const temp=await file.path();const exported=JSON.parse(fs.readFileSync(temp,'utf8'));
  check('export contains only independent recipe, not characters/models/secrets',exported.version===1&&exported.name==='自然摄影 QA'&&exported.options.skinMatte&&!('collectibles' in exported));
  await page.locator('#vr-import').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,options:{enabled:true,photoBaseline:true}}))});
  await page.waitForFunction(()=>window.__cervixQA.visualRepair.options.photoLighting && !window.__cervixQA.visualRepair.options.skinMatte);
  const imported=await state();check('legacy v1 file imports as independent modules',imported.options.photoLighting&&imported.options.skinResponse&&imported.options.microDetail&&!imported.options.photoBaseline);
  await page.locator('#vr-import').setInputFiles({name:'off.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({version:1,options:{enabled:false,skinMatte:true,skinMatteAmount:.5}}))});
  await page.waitForFunction(()=>!window.__cervixQA.visualRepair.options.enabled && window.__cervixQA.visualRepair.options.skinMatteAmount===.5);
  const offImport=await state();check('import respects explicit disabled master switch',!offImport.options.enabled&&equal(offImport.configs,original.configs));
  await page.locator('#vr-import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{bad json')});
  await page.waitForFunction(()=>document.getElementById('vr-state-text').textContent.includes('导入失败'));
  check('malformed import reports error and leaves current options intact',(await page.locator('#vr-state-text').textContent()).includes('导入失败')&&equal((await state()).options,offImport.options));
  await page.setViewportSize({width:390,height:844});await page.evaluate(()=>window.__cervixQA.visualRepair.open());
  const bounds=await page.locator('#vr-panel').boundingBox();check('modulator fits narrow screen',bounds.x>=0&&bounds.x+bounds.width<=390&&bounds.y+bounds.height<=844,bounds);await capture('06-narrow-panel');
  await page.setViewportSize({width:1280,height:800});await boot();const reloaded=await state();report.reloadStorage=await page.evaluate(()=>({record:localStorage.getItem('cervix3d-visual-repair-v1'),loadDisabled:document.querySelector('[data-action=load]').disabled}));
  check('saved recipe does not silently auto-apply on next boot',!reloaded.options.enabled);
  await page.locator('#btn-visual-repair').evaluate(e=>e.click());await page.locator('.vr-library summary').click();await page.click('[data-action=load]');
  const loaded=await state();check('explicit load restores saved modular recipe',loaded.options.enabled&&loaded.options.skinMatte&&loaded.options.photoLighting);
  // Material edits must remain visible through the layer and survive disabling it.
  const liveEdit=await page.evaluate(()=>{const q=window.__cervixQA;q.studio.updateMaterialsFast({poreRelief:.30,skinRoughness:.40});const m=q.studio.headNode.getObjectByName('HeadSkinMesh').material;return {roughness:m.roughness,pore:m.userData.skinGradingUniforms.uPoreRelief.value,basePore:m.userData.baseVisualPoreRelief};});
  check('live character edit composes immediately with active material modules',Math.abs(liveEdit.pore-.30*(.32/.56))<1e-8&&liveEdit.roughness===.54&&liveEdit.basePore===.30,liveEdit);
  await page.evaluate(()=>{const q=window.__cervixQA;q.visualRepair.set({enabled:false});q.visualRepair.flush();});const editOff=await state();
  check('disabling after edit restores latest character values, not stale cache',Math.abs(editOff.pore-.30*(1.15/.56))<1e-8&&editOff.roughness===.40,{pore:editOff.pore,roughness:editOff.roughness});
  check('no network dependency in actual offline HTML',report.network.length===0,report.network);
  check('no JS or GLSL errors',report.errors.length===0,report.errors);
  report.passed=true;
} catch(e) {report.failure=e.stack;report.passed=false;process.exitCode=1;}
finally {await browser?.close();fs.writeFileSync('qa/stage45/results.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
