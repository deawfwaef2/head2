// 自检截图：node 安全/scripts/qa_shots.mjs /tmp/qa "look=daylight" "look=window&view=front" ...
import { chromium } from 'playwright';
import path from 'node:path'; import fs from 'node:fs'; import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const [outDir, ...cases] = process.argv.slice(2); fs.mkdirSync(outDir, { recursive: true });
const html = pathToFileURL(path.join(here, '..', '点击开始_写实收藏胸像.html')).href;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const W = +(process.env.W || 1100), H = +(process.env.H || 800);
for (const c of cases.length ? cases : ['look=daylight']) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await page.route('http*://**', (r) => r.abort());
  const t0 = Date.now();
  await page.goto(html + '?' + c + (process.env.NOQA ? '' : '&qa=1'));
  await page.waitForFunction(() => window.__READY__ || window.__ERROR__, null, { timeout: 600000 });
  if (process.env.HIDEUI) await page.evaluate(() => document.body.classList.add('hideui'));
  await page.waitForTimeout(+(process.env.WAIT || 300));
  const name = c.replace(/[&=]/g, '_');
  await page.screenshot({ path: path.join(outDir, name + '.png'), timeout: 300000 });
  const err = await page.evaluate(() => window.__ERROR__ || null);
  console.log(name, ((Date.now() - t0) / 1000).toFixed(1) + 's', err ? 'ERROR ' + err.slice(0, 400) : 'ok', errs.slice(0, 5).join(' | '));
  await page.close();
}
await browser.close();
