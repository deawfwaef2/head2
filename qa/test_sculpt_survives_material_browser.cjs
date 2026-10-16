const { chromium }=require('playwright-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const html=path.resolve(process.env.HTML_PATH||path.join(__dirname,'..','点击开始游戏_CERVIX3D.html'));
(async()=>{const b=await chromium.launch({executablePath:'/home/user/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist']});try{
 const p=await b.newPage({viewport:{width:1260,height:850}}),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,250))});
 await p.goto('file://'+encodeURI(html),{waitUntil:'domcontentloaded',timeout:90000});await p.locator('#btn-start-with-studio').click();await p.waitForFunction(()=>window.__cervixQA?.ready&&window.__cervixQA.studio?.headNode,null,{timeout:115000});await p.locator('.nav-tab[data-tab=studio]').click();
 const pick=async(id,value,type='change')=>p.evaluate(({id,value,type})=>{let e=document.getElementById(id);e.value=value;e.dispatchEvent(new Event(type,{bubbles:true}))},{id,value,type});
 await pick('sel-hair-style','hair_bob01');await p.waitForFunction(()=>window.__cervixQA.studio.headNode?.userData.currentHairStyle==='hair_bob01',null,{timeout:35000});await p.locator('[data-sculpt-tool=hair]').click();
 const canvas=p.locator('#studio-preview-canvas'),box=await canvas.boundingBox();let hit=null;
 for(const [rx,ry] of [[.43,.31],[.51,.32],[.58,.33],[.41,.28],[.47,.42],[.56,.24],[.35,.44]]){
  const x=box.x+rx*box.width,y=box.y+ry*box.height;
  await p.mouse.move(x,y);await p.mouse.down();const tool=await p.evaluate(()=>window.__cervixQA.studio.sculptDrag?.gesture.tool);
  if(tool==='hair'){hit={x,y};break;}await p.mouse.up();
 }
 assert(hit,'actual pointer must hit bob01 hair');
 await p.mouse.move(hit.x+37,hit.y+23,{steps:11});await p.mouse.up();
 const collect=()=>p.evaluate(()=>{const q=window.__cervixQA,s=q.studio,d=q.state.studioDraft,h=s.headNode,g=h.getObjectByName('HairGroup'),strand=g.getObjectByName('MasterStrandHairMesh')||g.getObjectByName('hair_bob01');const geo=strand.geometry,a=geo.attributes.position.array,delta=geo.userData.sculptDelta;let n=0,sum=0,deltaMax=0;for(let i=0;i<a.length;i+=41){n++;sum+=(a[i]||0)*(i%31+1)}if(delta)for(let i=0;i<delta.length;i++)deltaMax=Math.max(deltaMax,Math.abs(delta[i]));return{style:h.userData.currentHairStyle,group:g.uuid,mesh:strand.uuid,geom:geo.uuid,brushes:d.morphs.sculptGestures?.length||0,strokes:d.morphs.sculptGestures?.reduce((n,x)=>n+x.strokes.length,0)||0,rev:d.morphs.sculptRevision,signature:sum/n,deltaMax,deltaRevision:geo.userData.sculptRevision,applied:Boolean(geo.userData.sculptOnPositions),gl:s.renderer.getContext().getError()}});
 const start=await collect();console.log('SCULPT_BASE',JSON.stringify({hit,start}));assert(start.brushes>0&&start.strokes>0,'hair mesh was actually sculpted');
 await canvas.screenshot({path:'/var/tmp/stage79_hair_brushed.png'});
 for(const [label,id,value,type] of [
  ['HAIR_COLOR','col-hair','#a64154','input'],
  ['HAIR_TIP','col-hair-tip','#657fbb','input'],
  ['SKIN_MATERIAL','slider-skin-roughness','0.64','input'],
  ['IRIS_COLOR','col-iris','#4d588d','input'],
 ]){
  await pick(id,value,type);await p.waitForTimeout(550);const now=await collect();console.log(label,JSON.stringify(now));
  assert.equal(now.style,'hair_bob01',label+' style');assert.equal(now.group,start.group,label+' group');assert.equal(now.geom,start.geom,label+' buffer');assert.equal(now.brushes,start.brushes,label+' gestures');assert(Math.abs(now.signature-start.signature)<1e-9,label+' geometry reset');assert.equal(now.gl,0);
 }
 await p.evaluate(()=>{let el=document.getElementById('studio-eye-preset-select');el.value=el.options[1].value;el.dispatchEvent(new Event('change',{bubbles:true}))});await p.waitForTimeout(900);const eye=await collect();console.log('EYE_PRESET',JSON.stringify(eye));assert.equal(eye.style,'hair_bob01');assert.equal(eye.group,start.group);assert.equal(eye.brushes,start.brushes);assert(Math.abs(eye.signature-start.signature)<1e-9);
 await canvas.screenshot({path:'/var/tmp/stage79_hair_after_material.png'});
 await p.locator('[data-studio-subtab="save"]').click();
 const savedId=await p.locator('#inp-col-id').inputValue();await p.locator('#btn-save-and-summon').click();
 await p.waitForFunction(id=>window.__cervixQA.state.collectibles.some(c=>c.id===id&&c.morphs?.sculptGestures?.length>0),savedId,{timeout:30000});
 const snapshot=await p.evaluate(id=>{let c=window.__cervixQA.state.collectibles.find(c=>c.id===id);return{id:c.id,style:c.hairStyle,brushes:c.morphs.sculptGestures.length,rev:c.morphs.sculptRevision}},savedId);console.log('SAVED_HAIR',JSON.stringify(snapshot));
 assert(snapshot.style==='hair_bob01'&&snapshot.brushes===start.brushes);
 await p.waitForFunction(id=>{let p=window.__cervixQA.desktop?.pets?.get(id),h=p?.node||p?.headNode;return h?.userData.currentHairStyle==='hair_bob01'&&h.getObjectByName('HairGroup')},savedId,{timeout:50000});
 const desktop=await p.evaluate(id=>{let p=window.__cervixQA.desktop.pets.get(id),h=p.node||p.headNode,g=h.getObjectByName('HairGroup'),displaced=0,max=0;g.traverse(o=>{let d=o.isMesh&&o.geometry?.userData?.sculptDelta;if(d){displaced++;for(let i=0;i<d.length;i++)max=Math.max(max,Math.abs(d[i]))}});return{style:h.userData.currentHairStyle,brushedMeshes:displaced,deltaMax:max,gl:window.__cervixQA.desktop.renderer.getContext().getError()}},savedId);
 console.log('DESKTOP_SAVED_HAIR',JSON.stringify(desktop));assert(desktop.brushedMeshes>0&&desktop.deltaMax>0&&desktop.gl===0);
 await p.reload({waitUntil:'domcontentloaded',timeout:90000});await p.locator('#btn-start-with-studio').click();await p.waitForFunction(()=>window.__cervixQA?.ready&&window.__cervixQA.studio?.headNode,null,{timeout:115000});
 const recovered=await p.evaluate(id=>{let c=window.__cervixQA.state.collectibles.find(c=>c.id===id);return c&&{id:c.id,style:c.hairStyle,brushes:c.morphs?.sculptGestures?.length,rev:c.morphs?.sculptRevision}},savedId);console.log('RELOADED_HAIR',JSON.stringify(recovered));assert.deepEqual(recovered,snapshot);
 await p.evaluate(async id=>window.__cervixQA.applySavedCharacterToActivePet(id,'select_or_apply'),savedId);
 await p.waitForFunction(()=>{let s=window.__cervixQA.studio;return s?.headNode?.userData.currentHairStyle==='hair_bob01'&&s.headNode.getObjectByName('HairGroup')&&window.__cervixQA.state.studioDraft.morphs.sculptGestures?.length>0},null,{timeout:50000});
 const live=await collect();console.log('RELOADED_LIVE_HAIR',JSON.stringify(live));
 assert.equal(live.style,'hair_bob01');assert.equal(live.brushes,start.brushes);
 assert(start.deltaMax>0.00001&&live.deltaMax>0.00001&&live.applied&&live.deltaRevision===start.rev,'saved brush must replay into actual strand geometry');
 assert(Math.abs(live.signature-start.signature)<1e-5,'reloaded shape should match brushed shape (float rounding allowed)');
 console.log('ERRORS',JSON.stringify(errors));assert.equal(errors.length,0);
}finally{await b.close()}})().catch(err=>{console.error(err);process.exitCode=1});
