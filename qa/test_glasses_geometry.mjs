import assert from 'node:assert/strict';
import * as THREE from 'three';
import { syncFaceAccessories } from '../src/three/faceAccessories.js';

const root = new THREE.Group();
root.userData.accessoriesReady = true;
const container = new THREE.Group();
container.name = 'RealDazHeadContainer';
root.add(container);
const settings = {
  glassesStyle: 'squircle_large', glassesOutline: 'soft_square',
  glassesFrameMaterial: 'warm_acetate', glassesRimThickness: 1,
  glassesColor: '#a07857', hatStyle: 'none',
};
function getFrame() {
  syncFaceAccessories(root, settings);
  const glasses = root.getObjectByName('Glasses_squircle_large');
  assert(glasses, 'new default large frame is a real 3D scene node');
  const rim = glasses.getObjectByName('AcetateBevel_1');
  assert(rim?.geometry?.attributes.position.count > 100, 'bevel ring has actual vertices');
  assert(glasses.getObjectByName('ConvexOpticalLens_1'), 'real lens exists');
  assert(glasses.getObjectByName('Temple_-1'), 'receding temple exists');
  assert(glasses.getObjectByName('SiliconeNosePad_1'), 'nose support exists');
  return { glasses, rim, mat: glasses.userData.frameMaterial };
}
const defaultFrame = getFrame();
const baseline = Float32Array.from(defaultFrame.rim.geometry.attributes.position.array);
assert(defaultFrame.mat.map?.isDataTexture, 'warm acetate has actual fine-grain offline atlas');
assert.equal(defaultFrame.mat.metalness, 0.025);
settings.glassesOutline = 'round';
const round = getFrame();
assert.notEqual(round.rim.geometry, defaultFrame.rim.geometry, 'rounding rebuilds real bevel geometry');
assert(baseline.some((n, i) => Math.abs(n - round.rim.geometry.attributes.position.array[i]) > 0.001),
  'shape selector moves at least one ring vertex by over 1mm');
settings.glassesOutline = 'cat_eye';
const cat = getFrame();
function outerCornerHeight(rim) {
  const a = rim.geometry.attributes.position;
  let high = -Infinity;
  for (let i = 0; i < a.count; i++) if (a.getX(i) > 0.062) high = Math.max(high, a.getY(i));
  return high;
}
assert(outerCornerHeight(cat.rim) > outerCornerHeight(round.rim) + 0.005,
  'cat-eye raises the real outer rim by over 5mm');
settings.glassesRimThickness = 1.55;
const thick = getFrame();
assert.notEqual(thick.rim.geometry, cat.rim.geometry, 'border width rebuilds real ring/lens aperture');
assert(thick.rim.geometry.attributes.position.count > 100);
settings.glassesFrameMaterial = 'brushed_titanium';
const metal = getFrame();
assert.equal(metal.mat.metalness, 0.88);
assert.equal(metal.mat.map, null);
assert.equal(metal.mat.roughness, 0.37);
settings.glassesStyle = 'none';
syncFaceAccessories(root, settings);
assert(!root.getObjectByName('Glasses_squircle_large'), 'archived none remains an option');
console.log('GLASSES_GEOMETRY_TESTS_PASS: squircle/round/cat-eye vertices, physical rim width, optical lens, real material');
