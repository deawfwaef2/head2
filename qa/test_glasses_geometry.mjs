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
function outerCornerHeight(rim, threshold = 0.062) {
  const a = rim.geometry.attributes.position;
  let high = -Infinity;
  for (let i = 0; i < a.count; i++) if (a.getX(i) > threshold) high = Math.max(high, a.getY(i));
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
// Every existing PROCEDURAL style must have editable silhouette, real rim
// geometry and a selectable material, not just the default squircle.
for (const style of ['wire_oval', 'acetate_square', 'aviator']) {
  settings.glassesStyle = style;
  settings.glassesRimThickness = 0.55;
  settings.glassesOutline = 'round';
  settings.glassesFrameMaterial = 'matte_black';
  syncFaceAccessories(root, settings);
  const plain = root.getObjectByName(`Glasses_${style}`);
  const rimName = style === 'acetate_square' ? 'AcetateBevel_1' : 'TitaniumRim_1';
  const pRim = plain.getObjectByName(rimName);
  const oldOuter = outerCornerHeight(pRim, 0.050);
  const thinVerts = Float32Array.from(pRim.geometry.attributes.position.array);
  assert.equal(plain.userData.frameMaterial.metalness, 0);
  assert(plain.getObjectByName('ConvexOpticalLens_1'));
  settings.glassesOutline = 'cat_eye';
  settings.glassesRimThickness = 1.55;
  settings.glassesFrameMaterial = 'brushed_titanium';
  settings.glassesWidth = 1.34;
  settings.glassesHeight = 0.87;
  syncFaceAccessories(root, settings);
  const shaped = root.getObjectByName(`Glasses_${style}`);
  const sRim = shaped.getObjectByName(rimName);
  assert(outerCornerHeight(sRim, 0.050) > oldOuter + 0.0035, `${style}: cat-eye reshapes outer rim`);
  assert(thinVerts.some((n, i) => Math.abs(n - sRim.geometry.attributes.position.array[i]) > 0.001),
    `${style}: thicker border changes real triangles`);
  assert.equal(shaped.userData.frameMaterial.metalness, 0.88, `${style}: physical metalness changed`);
  assert(shaped.scale.x > shaped.scale.y, `${style}: direct drag dimensions change frame proportions`);
}
settings.glassesStyle = 'none';
syncFaceAccessories(root, settings);
assert(!root.getObjectByName('Glasses_aviator'), 'archived none remains an option');
console.log('GLASSES_GEOMETRY_TESTS_PASS: all procedural rims/frames reshape & recolor; drag dimensions; archived none');
