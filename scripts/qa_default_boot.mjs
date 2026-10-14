import {chromium} from 'playwright';import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
let report={mode:'Unmodified default collectibles / file:// / Chromium SwiftShader',errors:[]};
try{const page=await browser.newPage({viewport:{width:800,height:600}});page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text().slice(0,500));});
await page.goto(pathToFileURL(path.resolve('点击开始游戏_CERVIX3D.html')).href);await page.waitForFunction(()=>window.__cervixQA?.ready,null,{timeout:120000});
await page.click('#btn-start-pure-desktop');report.state=await page.evaluate(()=>{const q=window.__cervixQA;cancelAnimationFrame(q.desktop.animFrameId);cancelAnimationFrame(q.studio.animId);return {ready:q.ready,petCount:q.desktop.pets.size,startDismissed:document.getElementById('start-game-overlay').classList.contains('hidden')};});
report.passed=report.errors.length===0&&report.state.petCount===3&&report.state.startDismissed;
}catch(e){report.failure=e.message;report.passed=false;}finally{await browser.close();fs.writeFileSync('HAIR_QA_BOOT.json',JSON.stringify(report,null,2));console.log(report);}
