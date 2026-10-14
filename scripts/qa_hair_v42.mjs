// npm install --no-save playwright; npx playwright install chromium
// Default uses the actual offline artifact, not a synthetic shader-only page.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const url=process.env.QA_URL || pathToFileURL(path.resolve('点击开始游戏_CERVIX3D.html')).href;
const report={mode:url.startsWith('file:')?'offline file://':'dev',renderer:'Chromium SwiftShader',tests:[],errors:[],network:[]};
const check=(name,ok,detail)=>{report.tests.push({name,passed:!!ok,detail});if(!ok)throw Error(name);};
const b=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const p=await b.newPage({viewport:{width:900,height:650}});
  p.on('pageerror',e=>report.errors.push(e.message));
  p.on('console',m=>{if(m.type()==='error')report.errors.push(m.text().slice(0,1500));});
  if(url.startsWith('file:')) await p.route(/^https?:/,r=>{report.network.push(r.request().url());return r.abort();});
  await p.addInitScript(()=>{
    localStorage.setItem('cervix3d-render-quality','low');
    localStorage.setItem('cervix3d-collectibles-stage36-master-v1',JSON.stringify(['FYP','000','001','002','003','004'].map(x=>({id:'SPEC-2026-'+x,name:'QA '+x,summoned:false}))));
  });
  await p.goto(url);await p.waitForFunction(()=>window.__cervixQA?.ready,null,{timeout:120000});
  await p.click('#btn-start-with-studio');await p.click('.nav-tab[data-tab=studio]');
  const original=await p.evaluate(()=>{
    const q=window.__cervixQA;cancelAnimationFrame(q.desktop.animFrameId);cancelAnimationFrame(q.studio.animId);
    return {configs:q.visualRepair.originals,records:JSON.stringify(q.state.collectibles),pore:q.studio.headNode.getObjectByName('HeadSkinMesh')?.material.userData.skinGradingUniforms?.uPoreRelief.value};
  });
  await p.locator('#btn-visual-repair').evaluate(e=>e.click());
  await p.click('[data-recipe="photo"]');
  const active=await p.evaluate(()=>{const q=window.__cervixQA;q.visualRepair.flush();return {state:q.studio._activeVisualState,originals:q.visualRepair.originals};});
  check('photographic recipe is opt-in and disables decorative gobo',active.state.windowGobo==='none'&&active.state.poreReliefGlobal===0.32&&active.state.dynamicLightMode==='static_locked',active.state);
  check('recipe does not overwrite original configs',JSON.stringify(active.originals)===JSON.stringify(original.configs));
  await p.click('#vr-compare');
  const ab=await p.evaluate(()=>{const q=window.__cervixQA;q.visualRepair.flush();return {comparing:q.visualRepair.comparing,configs:[q.desktop.visualConfig,q.studio.visualConfig]};});
  check('A/B returns original engine configs',ab.comparing&&JSON.stringify(ab.configs)===JSON.stringify(original.configs));
  await p.click('#vr-compare');
  await p.locator('#vr-panel [data-action="cancel"]').first().click();
  const cancel=await p.evaluate(()=>{const q=window.__cervixQA;q.visualRepair.flush();return {enabled:q.visualRepair.options.enabled,records:JSON.stringify(q.state.collectibles),configs:[q.desktop.visualConfig,q.studio.visualConfig],pore:q.studio.headNode.getObjectByName('HeadSkinMesh')?.material.userData.skinGradingUniforms?.uPoreRelief.value};});
  check('cancel restores recipe session and leaves collectibles unchanged',!cancel.enabled&&cancel.records===original.records&&JSON.stringify(cancel.configs)===JSON.stringify(original.configs));
  check('cancel restores the actual skin pore uniform',Number.isFinite(original.pore)&&cancel.pore===original.pore,{before:original.pore,after:cancel.pore});
  const lights=await p.evaluate(()=>{
    const q=window.__cervixQA,s=q.studio,n=s.headNode,hair=n.getObjectByName('HairGroup');
    q.visualRepair.set({enabled:true,photoBaseline:true,haze:true,hazeAmount:1,clarity:true,clarityAmount:1,stopMotion:true,removeGobo:true});q.visualRepair.flush();
    s.autoRotate=false;s.renderer.setSize(320,320,false);s.renderer.setPixelRatio(1);s.renderer.shadowMap.enabled=false;
    s.camera.aspect=1;s.camera.position.set(0,1,62);s.camera.lookAt(0,1,0);s.camera.updateProjectionMatrix();
    let flowCount=0,invalid=0,meshes=0;
    hair.traverse(o=>{if(o.isMesh&&o.geometry.attributes.artistHairFlow){meshes++;const a=o.geometry.attributes.artistHairFlow.array;flowCount+=a.length/3;for(const v of a)if(!Number.isFinite(v))invalid++;}});
    const allowed=new Set();hair.traverse(o=>allowed.add(o));
    s.scene.traverse(o=>{if((o.isMesh||o.isPoints||o.isLine||o.isSprite)&&!allowed.has(o))o.visible=false;});
    s.scene.background=null;s.scene.environment=null;s.renderer.setClearColor(0x000000,1);
    const sceneLights=[];s.scene.traverse(o=>{if(o.isLight){sceneLights.push(o);o.intensity=0;}});
    const pixels=()=>{s.renderer.render(s.scene,s.camera);const gl=s.renderer.getContext();const a=new Uint8Array(320*320*4);gl.readPixels(0,0,320,320,gl.RGBA,gl.UNSIGNED_BYTE,a);return a;};
    const dark=pixels();let darkMax=0;for(let i=0;i<dark.length;i+=4)darkMax=Math.max(darkMax,dark[i],dark[i+1],dark[i+2]);
    const key=s.lightRig.key;key.intensity=2;key.color.set('#ffffff');key.position.set(-40,30,45);const left=pixels();key.position.set(40,30,45);const right=pixels();let delta=0,lit=0;
    for(let i=0;i<left.length;i+=4){for(let j=0;j<3;j++)delta+=Math.abs(left[i+j]-right[i+j]);lit+=left[i]+left[i+1]+left[i+2];}
    return {flowCount,invalid,meshes,darkMax,meanLightDifference:delta/(320*320*3),meanLit:lit/(320*320*3)};
  });
  check('derived hair flow attributes are finite',lights.flowCount>1000&&lights.invalid===0,lights);
  check('hair emits no light with scene lights and environment off',lights.darkMax===0,lights.darkMax);
  check('hair appearance follows actual light movement',lights.meanLightDifference>0.2&&lights.meanLit>0.2,lights);
  check('no JS/GLSL errors',report.errors.length===0,report.errors);
  check('offline artifact requires no network',report.network.length===0,report.network);
} catch(e) {report.failure=e.message;process.exitCode=1;}
finally {await b.close();fs.writeFileSync('HAIR_QA_STAGE42.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
