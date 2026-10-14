import { chromium } from 'playwright';
const b = await chromium.launch({ args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'] });
const p = await b.newPage({ viewport: { width: 400, height: 500 } });
p.on('pageerror', e=>console.log('ERR', e.message));
p.on('console', m=>{ if (m.type()!=='log') console.log(m.type(), m.text().slice(0,300)); });
await p.goto('file:///tmp/head2/画质提升/点击打开_画质提升演示.html?qa=1&view=threequarter&hair=hair_bob01&density=low&hR=0&hTRT=0&hTT=0&hD=0&hEnv=0');
await p.waitForFunction(() => window.__READY__ || window.__ERROR__, null, { timeout: 600000 });
console.log(JSON.stringify(await p.evaluate(() => window.__dbg()), null, 1));
await b.close();
