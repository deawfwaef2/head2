const { chromium } = require('playwright-core');
const path = require('node:path');
const assert = require('node:assert/strict');
const html=path.resolve(process.env.HTML_PATH||path.join(__dirname,'..','点击开始游戏_CERVIX3D.html'));
(async()=>{
 const b=await chromium.launch({executablePath:'/home/user/.cache/ms-playwright/chromium_headless_shell-1187/chrome-linux/headless_shell',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--ignore-gpu-blocklist']});
 try{
  const p=await b.newPage({viewport:{width:1260,height:850}});let errors=[];
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text().slice(0,220))});
  await p.goto('file://'+encodeURI(html),{waitUntil:'domcontentloaded',timeout:90000});await p.locator('#btn-start-with-studio').click();
  await p.waitForFunction(()=>window.__cervixQA?.ready&&window.__cervixQA.studio?.headNode,null,{timeout:115000});
  await p.locator('.nav-tab[data-tab=studio]').click();
  await p.locator('#chk-photo-overlay').check();
  const before=await p.evaluate(()=>{let q=window.__cervixQA,s=q.studio;return{hair:s.headNode.getObjectByName('HairGroup')?.uuid,morphs:JSON.stringify(q.state.studioDraft.morphs),preview:document.getElementById('studio-photo-overlay').getContext('2d').getImageData(130,125,1,1).data.toString(),handle:!document.getElementById('photo-align-drag-handle').hidden,opacity:document.getElementById('studio-photo-overlay').style.opacity}});
  console.log('ALIGN_START',JSON.stringify(before));assert(before.handle && before.preview!=='0,0,0,0','preset image fills overlay canvas');
  // Adjust scale with actual UI; drag the photo without moving the 3D head.
  const zoom=p.locator('#photo-align-zoom');await p.evaluate(()=>{let el=document.getElementById('photo-align-zoom');el.value='1.25';el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}))});
  const grip=p.locator('#photo-align-drag-handle');let box=await grip.boundingBox();
  await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.mouse.move(box.x+box.width/2+48,box.y+box.height/2+23,{steps:10});await p.mouse.up();
  const aligned=await p.evaluate(()=>{let q=window.__cervixQA,s=q.studio,o=document.getElementById('studio-photo-overlay');return{x:Number(document.getElementById('photo-align-x').value),y:Number(document.getElementById('photo-align-y').value),zoom:Number(document.getElementById('photo-align-zoom').value),left:o.style.left,top:o.style.top,height:o.style.height,hair:s.headNode.getObjectByName('HairGroup')?.uuid,morphs:JSON.stringify(q.state.studioDraft.morphs),gl:s.renderer.getContext().getError()}});
  console.log('ALIGN_DRAG',JSON.stringify(aligned));assert(Math.abs(aligned.x-48)<5&&Math.abs(aligned.y-23)<5&&aligned.zoom===1.25&&aligned.hair===before.hair&&aligned.morphs===before.morphs&&aligned.gl===0);
  await p.locator('.studio-canvas-wrap').screenshot({path:'/var/tmp/stage79_photo_alignment.png'});
  await p.locator('#sculpt-face-detail').click();const canvas=p.locator('#studio-preview-canvas'),cb=await canvas.boundingBox();await p.mouse.move(cb.x+cb.width*.54,cb.y+cb.height*.55);
  const brush=await p.evaluate(()=>({visible:!document.getElementById('sculpt-brush-cursor').hidden,size:document.getElementById('sculpt-brush-cursor').style.width,mode:window.__cervixQA.studio.sculptTool,radius:window.__cervixQA.studio.sculptRadius,strength:window.__cervixQA.studio.sculptStrength}));
  console.log('FACE_FINE',JSON.stringify(brush));assert(brush.visible&&parseFloat(brush.size)>12&&brush.mode==='face'&&brush.radius===.012&&brush.strength===.15);
  await p.locator('#sculpt-hair-detail').click();await p.mouse.move(cb.x+cb.width*.54,cb.y+cb.height*.55);
  const hairFine=await p.evaluate(()=>({mode:window.__cervixQA.studio.sculptTool,radius:window.__cervixQA.studio.sculptRadius,strength:window.__cervixQA.studio.sculptStrength,ring:!document.getElementById('sculpt-brush-cursor').hidden}));
  console.log('HAIR_FINE',JSON.stringify(hairFine));assert(hairFine.mode==='hair'&&hairFine.radius===.018&&hairFine.strength===.30&&hairFine.ring);
  // Import a WIDE reference photo: fitting must preserve aspect ratio rather
  // than squashing a 16:8 photograph into the 260x300 alignment canvas.
  await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=160;c.height=80;let g=c.getContext('2d');g.fillStyle='#ff0000';g.fillRect(0,0,160,80);const blob=await new Promise(r=>c.toBlob(r,'image/png'));const file=new File([blob],'wide.png',{type:'image/png'});const dt=new DataTransfer();dt.items.add(file);const input=document.getElementById('input-photo-upload');input.files=dt.files;input.dispatchEvent(new Event('change',{bubbles:true}))});
  await p.waitForFunction(()=>document.getElementById('photo-status-badge').textContent.includes('wide.png'),null,{timeout:5000});
  const photo=await p.evaluate(()=>{let c=document.getElementById('studio-photo-overlay'),g=c.getContext('2d');return{top:[...g.getImageData(130,0,1,1).data],center:[...g.getImageData(130,150,1,1).data],badge:document.getElementById('photo-status-badge').textContent}});
  console.log('WIDE_PHOTO',JSON.stringify(photo));assert(photo.top[3]===0 && photo.center[0]===255&&photo.center[3]===255,'wide image letterboxed, not distorted');
  const uploaded=await p.evaluate(()=>window.__cervixQA.state.studioDraft.lifePhotoDataUrl);
  await p.locator('[data-ref-photo="linxi"]').click();
  await p.waitForFunction(prev=>{let s=window.__cervixQA.state.studioDraft;return s.lifePhotoDataUrl&&s.lifePhotoDataUrl!==prev&&s.photoElement?.naturalWidth>0},uploaded,{timeout:15000});
  const linxi=await p.evaluate(()=>({w:window.__cervixQA.state.studioDraft.photoElement.naturalWidth,badge:document.getElementById('photo-status-badge').textContent}));
  console.log('REAL_PRESET',JSON.stringify(linxi));assert(linxi.w>160&&linxi.badge.includes('内置参考照'));
  await p.locator('[data-ref-photo="suwan"]').click();
  const schematic=await p.evaluate(()=>({blend:window.__cervixQA.state.studioDraft.photoBlend,photo:window.__cervixQA.state.studioDraft.lifePhotoDataUrl,badge:document.getElementById('photo-status-badge').textContent,gl:window.__cervixQA.studio.renderer.getContext().getError()}));
  console.log('DRAWN_PRESET',JSON.stringify(schematic));assert(schematic.blend===0&&schematic.photo===null&&schematic.badge.includes('示意画像')&&schematic.gl===0);
  await p.reload({waitUntil:'domcontentloaded',timeout:90000});await p.locator('#btn-start-with-studio').click();await p.waitForFunction(()=>window.__cervixQA?.ready&&window.__cervixQA.studio?.headNode,null,{timeout:115000});
  const reload=await p.evaluate(()=>({x:document.getElementById('photo-align-x').value,y:document.getElementById('photo-align-y').value,zoom:document.getElementById('photo-align-zoom').value}));
  console.log('ALIGN_RELOAD',JSON.stringify(reload));assert(reload.x==='48'&&reload.y==='23'&&reload.zoom==='1.25','photo alignment persists after refresh');
  await p.locator('.nav-tab[data-tab=studio]').click();
  await p.locator('#photo-align-reset').click();const reset=await p.evaluate(()=>({x:document.getElementById('photo-align-x').value,y:document.getElementById('photo-align-y').value,zoom:document.getElementById('photo-align-zoom').value,face:window.__cervixQA.studio.headNode.getObjectByName('HeadSkinMesh').uuid}));
  console.log('ALIGN_RESET',JSON.stringify(reset));assert(reset.x==='0'&&reset.y==='0'&&reset.zoom==='1');
  console.log('ERRORS',JSON.stringify(errors));assert.equal(errors.length,0);
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
