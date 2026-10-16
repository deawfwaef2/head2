const { chromium } = require('playwright-core');
const path = require('node:path');
const assert = require('node:assert/strict');
const html = path.resolve(process.env.HTML_PATH || path.join(__dirname, '..', '点击开始游戏_CERVIX3D.html'));
(async () => {
  const browser = await chromium.launch({
    executablePath: '/home/user/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell', headless: true,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1260, height: 850 } });
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text().slice(0,220)); });
    await page.goto('file://' + encodeURI(html), { waitUntil: 'domcontentloaded', timeout: 100000 });
    await page.locator('#btn-start-with-studio').click();
    await page.waitForFunction(() => window.__cervixQA?.ready && window.__cervixQA.studio?.headNode, null, { timeout: 115000 });
    await page.locator('.nav-tab[data-tab=studio]').click();
    await page.locator('[data-sculpt-tool=glasses]').click();
    const canvas = page.locator('#studio-preview-canvas');
    const stats = () => page.evaluate(() => {
      const q=window.__cervixQA, s=q.studio, m=q.state.studioDraft.morphs;
      const g=s.headNode.getObjectByName(`Glasses_${m.glassesStyle}`), names=[];
      g?.traverse(o => { if(o.isMesh && o.geometry.attributes.position) names.push(o.name); });
      return {style:m.glassesStyle, contours:m.glassesContours?.[m.glassesStyle], scale:g?.scale.toArray(),
        nodes:document.querySelectorAll('#glasses-contour-handles .glasses-contour-point:not([hidden])').length,
        physical:g?.userData.physicalLoaded, gl:s.renderer.getContext().getError(), meshes:names.slice(0,12)};
    });
    const pick = async(id,value) => page.evaluate(([id,value]) => {let el=document.getElementById(id);el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));},[id,value]);
    const capture = async(side=1) => page.evaluate(side => {
      const q=window.__cervixQA,m=q.state.studioDraft.morphs,g=q.studio.headNode.getObjectByName('Glasses_'+m.glassesStyle);
      const rim=g.getObjectByName('AcetateBevel_'+side)||g.getObjectByName('TitaniumRim_'+side);
      const lens=g.getObjectByName('ConvexOpticalLens_'+side);
      const scanned=[];
      g.traverse(o=>{if(o.isMesh && o.userData.scannedBasePositions)scanned.push({name:o.name,p:Array.from(o.geometry.attributes.position.array)});});
      return {rim:rim?Array.from(rim.geometry.attributes.position.array):null,lens:lens?Array.from(lens.geometry.attributes.position.array):null,scanned,scale:g.scale.toArray()};
    },side);
    const compare = (before,after) => {
      const diff=(a,b) => Array.isArray(a)&&Array.isArray(b)&&a.length===b.length ? a.reduce((max,v,i)=>Math.max(max,Math.abs(v-b[i])),0) : 0;
      return {rim:diff(before.rim,after.rim),lens:diff(before.lens,after.lens),
        scan:Math.max(0,...before.scanned.map((o,i)=>diff(o.p,after.scanned[i]?.p))),
        scale:diff(before.scale,after.scale)};
    };
    const drag = async(side,knot,dx,dy) => {
      const dot=page.locator(`#glasses-contour-handles [data-contour-side="${side}"][data-contour-knot="${knot}"]`);
      await dot.waitFor({state:'visible',timeout:15000});
      const r=await dot.boundingBox();
      const x=r.x+r.width/2, y=r.y+r.height/2;
      await page.mouse.move(x,y);await page.mouse.down();
      const tool=await page.evaluate(()=>window.__cervixQA.studio.sculptDrag?.tool);
      if(tool!=='glassesContour') {
        const detail=await page.evaluate(({x,y})=>({hit:document.elementFromPoint(x,y)?.outerHTML.slice(0,280),style:document.getElementById('glasses-contour-handles')?.dataset.style,active:window.__cervixQA.studio.sculptTool,status:document.getElementById('sculpt-status').textContent}),{x,y});
        throw Error('Dot did not start local contour drag: '+JSON.stringify({tool,detail,errors}));
      }
      await page.mouse.move(x+dx,y+dy,{steps:8});await page.mouse.up();
    };
    const dotCenter = async(side,knot) => {const r=await page.locator(`#glasses-contour-handles [data-contour-side="${side}"][data-contour-knot="${knot}"]`).boundingBox();return [r.x+r.width/2,r.y+r.height/2]};
    console.log('START',JSON.stringify(await stats()));
    assert.equal((await stats()).nodes,16);
    await canvas.screenshot({path:'/var/tmp/stage79_squircle_before.png'});
    const beforeDot=await dotCenter(1,1);
    const base=await capture();await drag(1,1,27,-19);
    const afterDot=await dotCenter(1,1);
    const squircle=await stats(),changed=compare(base,await capture());
    console.log('SQUIRCLE_LOCAL',JSON.stringify({squircle,changed,beforeDot,afterDot}));
    assert(squircle.contours?.right[1][0]>.03 && squircle.contours?.right[1][1]>.03,'right local corner moves both axes');
    assert.deepEqual(squircle.contours.left[1],squircle.contours.right[1],'mirror changes opposite lens');
    assert(changed.rim>.001 && changed.lens>.001 && changed.scale===0,'rim and lens reshape without changing overall scale');
    assert(afterDot[0]>beforeDot[0]+4 && afterDot[1]<beforeDot[1]-4,'visual handle follows pointer outward/up');
    await canvas.screenshot({path:'/var/tmp/stage79_squircle_after.png'});
    await page.locator('#sculpt-undo').click();
    const undone=await stats();console.log('UNDO',JSON.stringify(undone));
    assert(!undone.contours || (undone.contours.right[1][0]===0 && undone.contours.left[1][1]===0));
    assert(compare(base,await capture()).rim<1e-6,'undo restores rim vertices');
    await page.locator('#sculpt-symmetric').uncheck();
    await drag(1,2,0,-17);
    const asymmetric=await stats();console.log('ASYMMETRY',JSON.stringify(asymmetric));
    assert(asymmetric.contours.right[2][1]>.02 && asymmetric.contours.left[2][1]===0);
    await pick('sel-glasses-style','wire_oval');
    await page.waitForFunction(()=>window.__cervixQA.studio.headNode?.getObjectByName('Glasses_wire_oval') && document.getElementById('glasses-contour-handles')?.dataset.style === 'wire_oval',null,{timeout:12000});
    const wireBase=await capture();await drag(1,7,21,18);
    const wire=await stats(),wireDiff=compare(wireBase,await capture());
    console.log('WIRE_LOCAL',JSON.stringify({wire,wireDiff}));
    assert(wire.contours?.right[7][0]>.02 && wireDiff.rim>.001 && wireDiff.lens>.001 && wireDiff.scale===0);
    await canvas.screenshot({path:'/var/tmp/stage79_wire_after.png'});
    await pick('sel-glasses-style','polyhaven_round');
    await page.waitForFunction(()=>window.__cervixQA.studio.headNode?.getObjectByName('Glasses_polyhaven_round')?.userData.physicalLoaded && document.getElementById('glasses-contour-handles')?.dataset.style === 'polyhaven_round',null,{timeout:35000});
    const scanBase=await capture();console.log('SCAN_BASE',JSON.stringify({n:scanBase.scanned.length,stats:await stats()}));
    await canvas.screenshot({path:'/var/tmp/stage79_scan_before.png'});
    await drag(1,2,0,-24);
    const scan=await stats(),scanDiff=compare(scanBase,await capture());
    console.log('SCAN_LOCAL',JSON.stringify({scan,scanDiff}));
    assert(scan.contours?.right[2][1]>.02 && scanDiff.scan>.0003 && scanDiff.scale===0);
    await canvas.screenshot({path:'/var/tmp/stage79_scan_after.png'});
    // Complete the six real menu styles, not merely their shared abstract
    // contour helper: two more procedural lens apertures + second CC0 scan.
    let lastScannedBase=null;
    for(const style of ['acetate_square','aviator','polyhaven_large_oval']){
      await pick('sel-glasses-style',style);
      await page.waitForFunction(style=>{
        let q=window.__cervixQA,g=q.studio.headNode?.getObjectByName('Glasses_'+style);
        return g && document.getElementById('glasses-contour-handles')?.dataset.style===style &&
          (!style.startsWith('polyhaven_') || g.userData.physicalLoaded);
      },style,{timeout:35000});
      const old=await capture(-1);if(style==='polyhaven_large_oval') lastScannedBase=old;
      await drag(-1,3,-19,13);
      const newState=await stats(),delta=compare(old,await capture(-1));
      console.log('OTHER_STYLE_'+style.toUpperCase(),JSON.stringify({newState,delta}));
      assert(newState.contours.left[3][0]>.02 && newState.contours.right[3][0]===0,style+': left-only shape edit');
      assert(delta.scale===0,style+': not only size slider');
      if(style.startsWith('polyhaven_')) assert(delta.scan>.0003,style+': actual scanned vertices');
      else assert(delta.rim>.001&&delta.lens>.001,style+': rim and actual optical lens aperture');
    }
    await page.locator('[data-studio-subtab="save"]').click();
    const savedId=await page.locator('#inp-col-id').inputValue();
    await page.locator('#btn-save-and-summon').click();
    await page.waitForFunction(id=>window.__cervixQA.state.collectibles.some(c=>c.id===id && c.morphs?.glassesContours?.polyhaven_large_oval?.left?.[3]?.[0]>.02),savedId,{timeout:35000});
    const saved=await page.evaluate(id=>{const c=window.__cervixQA.state.collectibles.find(c=>c.id===id);return{id:c.id,style:c.morphs.glassesStyle,editedStyles:Object.keys(c.morphs.glassesContours),contour:c.morphs.glassesContours.polyhaven_large_oval.left[3]}},savedId);
    console.log('SAVED_CONTOURS',JSON.stringify(saved));
    assert(saved.editedStyles.length===6,'all six eyewear style contours persist per style');
    await page.waitForFunction(id=>{const p=window.__cervixQA.desktop?.pets?.get(id),h=p?.node||p?.headNode,g=h?.getObjectByName('Glasses_polyhaven_large_oval');return g?.userData.physicalLoaded},savedId,{timeout:50000});
    const desktop=await page.evaluate(id=>{const p=window.__cervixQA.desktop.pets.get(id),h=p.node||p.headNode,g=h.getObjectByName('Glasses_polyhaven_large_oval');return{style:h.userData.currentMorphs.glassesStyle,contour:h.userData.currentMorphs.glassesContours?.polyhaven_large_oval?.left?.[3],shapeKey:g.userData.scannedShapeKey,gl:window.__cervixQA.desktop.renderer.getContext().getError()}},savedId);
    console.log('DESKTOP_CONTOUR',JSON.stringify(desktop));
    assert.deepEqual(desktop.contour,saved.contour,'in-page pet received saved local lens outline');assert(desktop.shapeKey&&desktop.gl===0);
    await page.reload({waitUntil:'domcontentloaded',timeout:90000});
    await page.locator('#btn-start-with-studio').click();
    await page.waitForFunction(()=>window.__cervixQA?.ready&&window.__cervixQA.studio?.headNode,null,{timeout:115000});
    const recovered=await page.evaluate(id=>{const c=window.__cervixQA.state.collectibles.find(c=>c.id===id);return c&&{id:c.id,style:c.morphs.glassesStyle,editedStyles:Object.keys(c.morphs.glassesContours||{}),contour:c.morphs.glassesContours?.polyhaven_large_oval?.left?.[3]}},savedId);
    console.log('RELOADED_CONTOURS',JSON.stringify(recovered));
    assert.deepEqual(recovered,saved,'offline file:// refresh keeps all six lens outlines');
    await page.evaluate(async id=>window.__cervixQA.applySavedCharacterToActivePet(id,'select_or_apply'),savedId);
    await page.waitForFunction(()=>{
      let s=window.__cervixQA.studio,m=s?.headNode?.userData?.currentMorphs,g=s?.headNode?.getObjectByName('Glasses_polyhaven_large_oval');
      return m?.glassesStyle==='polyhaven_large_oval'&&g?.userData.physicalLoaded&&
        m.glassesContours?.polyhaven_large_oval?.left?.[3]?.[0]>.02;
    },null,{timeout:45000});
    const restoredVertices=compare(lastScannedBase,await capture(-1));
    console.log('RELOADED_RENDER',JSON.stringify({restoredVertices,stats:await stats()}));
    assert(restoredVertices.scan>.0003&&restoredVertices.scale===0,'reloaded GLB frame vertices must retain freeform edit');
    console.log('ERRORS',JSON.stringify(errors));
    assert.equal(errors.length,0,'page and console errors');
  } finally { await browser.close(); }
})().catch(err=>{console.error(err);process.exitCode=1});
