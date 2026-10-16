import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as THREE from 'three';
import { DesktopBoxSpaceEngine } from '../src/three/desktopBoxSpaceEngine.js';

const engine = Object.create(DesktopBoxSpaceEngine.prototype);
engine.settings = { enableGravity: true };
engine.stagePlatforms = [
  { isMainFloor: true, surfaceY: -25.2 },
  { minX: -24, maxX: -5, minZ: -25, maxZ: -5, surfaceY: -12 },
];
engine.getBoxBounds = () => ({ minY: -27 });
engine.getBoxBoundsAtZ = () => ({ minX: -40, maxX: 40, minY: -24, maxY: 26, minZ: -112, maxZ: 18 });
function pet(x, y) {
  return {
    pos: new THREE.Vector3(x, y, -15), vel: new THREE.Vector3(),
    targetScale: 0.76, currentScale: 0.76, isGrounded: true,
    node: { userData: { baseBottomOffset: -10.8 } },
  };
}
const outside = pet(-4.8, -25.2 + 10.8 * 0.76);
assert.equal(engine.getSupportSurfaceY(outside.pos.x, outside.pos.y, -15, .76, -10.8), -25.2);
// The head overlaps the old anti-clipping guard (5.5cm past the shelf edge),
// but is NOT standing on the shelf. Previously this snapped 13.2cm upward.
const floorRest = outside.pos.y;
for (let frame = 0; frame < 240; frame++) {
  engine.clampPetToBounds(outside);
  assert.equal(outside.pos.y, floorRest, `stationary pet must not jump on frame ${frame}`);
}
const atop = pet(-10, -12 + 10.8 * .76 - 2.0);
assert.equal(engine.getSupportSurfaceY(atop.pos.x, atop.pos.y, -15, .76, -10.8), -12);
engine.clampPetToBounds(atop);
assert(Math.abs(atop.pos.y - (-12 + 10.8 * .76)) < 1e-9, 'valid shelf support prevents board clipping');
assert.equal(atop.vel.y, 0);
const floating = pet(-10, -6);
engine.settings.enableGravity = false;
engine.clampPetToBounds(floating);
assert.equal(floating.pos.y, -6, 'floating mode never receives shelf gravity');
const src = readFileSync(new URL('../src/three/desktopBoxSpaceEngine.js', import.meta.url), 'utf8');
assert.equal((src.match(/pet\.flickSpring\s*=\s*\{\s*age:/g) || []).length, 1,
  'recoil may be created only by explicit forehead flick, not landing/idle');
console.log('IDLE_HEAD_SUPPORT_PASS: 240 near-edge idle frames, real shelf contact, gravity off, no automatic landing recoil');
