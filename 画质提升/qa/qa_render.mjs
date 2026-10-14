// 画质提升 · 自检截图：file:// 打开独立 HTML，按不同模式/镜头/布光截图
// 用法：node qa/qa_render.mjs out_dir "mode=after&view=front" "mode=before&view=front" ...
import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const [outDir, ...cases] = process.argv.slice(2);
fs.mkdirSync(outDir, { recursive: true });
const html = pathToFileURL(path.join(here, '..', '点击打开_画质提升演示.html')).href;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const W = +(process.env.W || 900), H = +(process.env.H || 1100);
for (const c of cases) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const errs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  await page.route('http*://**', (r) => r.abort());
  const t0 = Date.now();
  await page.goto(html + '?qa=1&' + c);
  await page.waitForFunction(() => window.__READY__ || window.__ERROR__, null, { timeout: 240000 });
  await page.evaluate(() => document.body.classList.add('hidepanel'));
  await page.waitForTimeout(+(process.env.WAIT || 300));
  const name = c.replace(/[&=]/g, '_');
  await page.screenshot({ path: path.join(outDir, name + '.png') });
  const err = await page.evaluate(() => window.__ERROR__ || null);
  console.log(name, ((Date.now() - t0) / 1000).toFixed(1) + 's', err ? 'ERROR ' + err : 'ok', errs.slice(0, 6).join(' | '));
  await page.close();
}
await browser.close();
