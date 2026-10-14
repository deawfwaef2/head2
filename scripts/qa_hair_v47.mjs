// Actual offline app, HTTP blocked; deterministic fixed-camera captures for visual review.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const label=process.env.QA_LABEL||'current', dir=`qa/stage47/${label}`;
fs.mkdirSync(dir,{recursive:true});
const report={label,errors:[],network:[],screenshots:[]};
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const p=await browser.newPage({viewport:{width:1280,height:800}});
 p.on('pageerror',e=>report.errors.push(e.message));
 p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text().slice(0,1500));});
 await p.route(/^https?:/,r=>{report.network.push(r.request().url());return r.abort();});
 await p.goto(pathToFileURL(path.resolve('点击开始游戏_CERVIX3D.html')).href);
 await p.waitForFunction(()=>window.__cervixQA?.ready,null,{timeout:120000});
 await p.click('#btn-start-pure-desktop');
 report.boot=await p.evaluate(()=>{const q=window.__cervixQA;cancelAnimationFrame(q.desktop.animFrameId);cancelAnimationFrame(q.studio.animId);return {pets:q.desktop.pets.size,started:document.getElementById('start-game-overlay').classList.contains('hidden')};});
 await p.screenshot({path:`${dir}/desktop.jpg`,type:'jpeg',quality:88});
 await p.locator('.nav-tab[data-tab=studio]').evaluate(e=>e.click());
 await p.evaluate(()=>{document.getElementById('software-window').classList.remove('window-hidden');const s=window.__cervixQA.studio;cancelAnimationFrame(s.animId);s.resize();s.renderer.render(s.scene,s.camera);});
 await p.screenshot({path:`${dir}/studio.jpg`,type:'jpeg',quality:88});
 report.hair=await p.evaluate(()=>{const q=window.__cervixQA,s=q.studio;cancelAnimationFrame(q.desktop.animFrameId);cancelAnimationFrame(s.animId);s.autoRotate=false;s.headNode.rotation.set(0,0,0);s.headNode.position.set(0,0,0);s.camera.position.set(0,1,54);s.camera.lookAt(0,1,0);s.camera.aspect=1;s.camera.updateProjectionMatrix();s.renderer.setPixelRatio(1);s.renderer.setSize(720,720,false);s.renderer.shadowMap.enabled=false;const meshes=[];s.headNode.getObjectByName('HairGroup').traverse(o=>{if(o.isMesh)meshes.push({name:o.name,vertices:o.geometry.attributes.position.count,fit:o.geometry.userData.scalpFit,map:!!o.material?.map});});return {style:s.headNode.userData.currentHairStyle,meshes};});
 for(const [name,angle] of [['front',0],['side',-1.0],['rear',Math.PI]]){
  const data=await p.evaluate(a=>{const s=window.__cervixQA.studio;s.headNode.rotation.set(0,a,0);s.renderer.render(s.scene,s.camera);return s.renderer.domElement.toDataURL('image/png');},angle);
  fs.writeFileSync(`${dir}/${name}.png`,Buffer.from(data.split(',')[1],'base64'));report.screenshots.push(`${dir}/${name}.png`);
 }
 report.passed=report.errors.length===0&&report.network.length===0&&report.boot.pets===3&&report.boot.started;
}catch(e){report.failure=e.stack;report.passed=false;process.exitCode=1;}
finally{await browser.close();fs.writeFileSync(`${dir}/results.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
