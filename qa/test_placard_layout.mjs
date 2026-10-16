import assert from 'node:assert/strict';
import {
  PLACARD_LAYOUT_STORAGE_KEY, normalizePlacardLayout,
  restorePlacardLayouts, savePlacardLayouts, placardVisualDimensions,
} from '../src/data/placardLayout.js';
import { lockPlacardDossier } from '../src/data/placardDossier.js';

const mem = new Map();
const storage = { getItem: key => mem.get(key) || null, setItem: (key, value) => mem.set(key, value) };
const col = { id: 'p1', name: '建档姓名', lifePhotoUrl: 'locked-image.jpg' };
lockPlacardDossier(col, { displayName: '封存人', origin: '封存的来历', story: '第一段\n第二段', photoUrl: 'data:image/png;base64,AAAA' });
const before = JSON.stringify(col.placardDossier);
assert.equal(savePlacardLayouts({ p1: { size: 1.35, aspect: 1.5 } }, storage), true);
assert.equal(mem.has(PLACARD_LAYOUT_STORAGE_KEY), true);
assert.deepEqual(restorePlacardLayouts(storage).p1, { size: 1.35, aspect: 1.5 });
assert.equal(JSON.stringify(col.placardDossier), before, 'appearance persistence must never mutate locked dossier bytes');
const regular = placardVisualDimensions({ size: 1, aspect: 1 }, 1360, 850);
const wide = placardVisualDimensions({ size: 1, aspect: 1.5 }, 1360, 850);
const big = placardVisualDimensions({ size: 1.35, aspect: 1 }, 1360, 850);
assert(wide.cssWidth > regular.cssWidth * 1.4, 'aspect really widens the laid-out card');
assert(big.cssWidth * big.size > regular.cssWidth * regular.size * 1.30, 'size scales the whole visual card');
assert.equal(normalizePlacardLayout({ size: 100, aspect: -9 }).size, 1.55);
assert.equal(normalizePlacardLayout({ size: 100, aspect: -9 }).aspect, 0.70);
mem.set(PLACARD_LAYOUT_STORAGE_KEY, '{BROKEN');
assert.deepEqual(restorePlacardLayouts(storage), {}, 'corrupt display preference must not break the archive');
assert.equal(JSON.stringify(col.placardDossier), before, 'photo/story lock is independent of display preferences');
console.log('PLACARD_LAYOUT_TESTS_PASS: separate persistence, real width/scale, dossier byte identity');
