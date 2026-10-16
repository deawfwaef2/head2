import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const main = readFileSync(join(root, 'src/main.js'), 'utf8');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const electron = readFileSync(join(root, 'electron/main.cjs'), 'utf8');
const demo = '点击打开_画质提升演示.html';
assert.ok(existsSync(join(root, '画质提升', demo)), 'tray must link the actual bundled demo file');
assert.ok(electron.includes(`'画质提升', '${demo}'`), 'Electron tray must reference the real demo path');
assert.ok(electron.includes("win.setAlwaysOnTop(true, 'screen-saver')"), 'only the Electron overlay is an OS-level window');
assert.match(html, /仅切换本软件内3D头颅的前景\/背景层/);
assert.match(main, /网页无法跨窗口置顶/);
assert.doesNotMatch(main, /绝不被DAZ窗口遮挡/);
console.log('DESKTOP_LAUNCHER_TRUTH_PASS: correct tray demo path and honest in-page/OS-overlay labeling (Windows runtime not tested)');
