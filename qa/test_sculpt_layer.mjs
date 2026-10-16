import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  applySculptStrokeToBuffer, applyStoredFaceSculpt, applyStoredHairSculpt,
  applyLiveSculptStroke, finalizeSculptStroke
} from '../src/three/sculptStrokeLayer.js';

function makeFace() {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.020, 0, 0, 0.020, 0, 0, -0.020, 0.012, 0,
    0.020, 0.012, 0, 0, 0.009, 0
  ], 3));
  geo.setIndex([0, 1, 4, 0, 4, 2, 1, 3, 4]);
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
  mesh.name = 'HeadSkinMesh';
  return mesh;
}

const face = makeFace(), other = makeFace();
// The two heads intentionally share their initial normals; a brush must not
// alter the other character's geometry attribute.
other.geometry.setAttribute('normal', face.geometry.attributes.normal);
const otherNormal = Array.from(other.geometry.attributes.normal.array);
const baseFace = Float32Array.from(face.geometry.attributes.position.array);
const stroke = [0.020, 0, 0, 0.003, 0.001, 0, 0.016, 1];
const faceMorphs = { sculptRevision: 1, sculptGestures: [{ tool: 'face', strokes: [stroke] }] };
assert.equal(applyStoredFaceSculpt(face, faceMorphs, baseFace), true);
const sculpted = Float32Array.from(face.geometry.attributes.position.array);
assert(sculpted[0] < baseFace[0], 'mirror face x must move in opposite direction');
assert(sculpted[3] > baseFace[3], 'touched face x must move forward');
assert.deepEqual(Array.from(other.geometry.attributes.normal.array), otherNormal,
  'calculating brush normals may not change a second head');
const oneSided = makeFace();
const oneBase = Float32Array.from(oneSided.geometry.attributes.position.array);
assert.equal(applyStoredFaceSculpt(oneSided, {
  sculptRevision: 1, sculptGestures: [{ tool: 'face', strokes: [[...stroke.slice(0, 7), 0]] }]
}, oneBase), true);
assert.equal(oneSided.geometry.attributes.position.array[0], oneBase[0],
  'symmetry off must leave the far-side vertex untouched');
assert(oneSided.geometry.attributes.position.array[3] > oneBase[3],
  'symmetry off must still sculpt the touched side');
face.geometry.attributes.position.array.set(baseFace);
applyStoredFaceSculpt(face, faceMorphs, baseFace);
assert.deepEqual(Array.from(face.geometry.attributes.position.array), Array.from(sculpted),
  'slider recompute must re-apply exactly one cached displacement');
faceMorphs.sculptGestures = [];
faceMorphs.sculptRevision = 2;
face.geometry.attributes.position.array.set(baseFace);
assert.equal(applyStoredFaceSculpt(face, faceMorphs, baseFace), false);
assert.deepEqual(Array.from(face.geometry.attributes.position.array), Array.from(baseFace),
  'undo must restore original face positions');
const safeFace = makeFace();
assert.equal(applySculptStrokeToBuffer(safeFace.geometry.attributes.position.array,
  new Float32Array(safeFace.geometry.attributes.position.array.length),
  [0, 0, 0, 1e9, 0, 0, 0.02, 0]), 0, 'untrusted huge stroke is rejected');

function makeHairRoot(style = 'style_1', sharedGeo = null) {
  const root = new THREE.Group();
  root.userData.currentHairStyle = style;
  const hair = new THREE.Group(); hair.name = 'HairGroup'; root.add(hair);
  const geo = sharedGeo || new THREE.BufferGeometry();
  if (!sharedGeo) geo.setAttribute('position', new THREE.Float32BufferAttribute([
    -0.045, 0, 0, 0.045, 0, 0, -0.045, -0.03, 0,
    0.045, -0.03, 0, 0, 0.065, 0
  ], 3));
  const mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial());
  mesh.name = 'ArtistHair'; hair.add(mesh);
  root.updateMatrixWorld(true);
  return { root, mesh };
}
const original = makeHairRoot();
const another = makeHairRoot('style_1', original.mesh.geometry);
const baseHair = Float32Array.from(original.mesh.geometry.attributes.position.array);
const hairStroke = [0.045, -0.03, 0, 0, -0.005, 0, 0.025, 1];
const hairMorphs = { sculptRevision: 1, sculptGestures: [{ tool: 'hair', hairStyle: 'style_1', strokes: [hairStroke] }] };
applyStoredHairSculpt(original.root, hairMorphs);
const movedHair = Float32Array.from(original.mesh.geometry.attributes.position.array);
assert(movedHair[10] < baseHair[10], 'hair vertex moved in true mesh buffer');
assert(movedHair[7] < baseHair[7], 'mirrored hair vertex moved too');
assert.notEqual(original.mesh.geometry, another.mesh.geometry, 'instanced hair must be isolated');
assert.deepEqual(Array.from(another.mesh.geometry.attributes.position.array), Array.from(baseHair),
  'other character stays unchanged');
original.mesh.geometry.attributes.position.array.set(baseHair);
original.mesh.geometry.userData.sculptOnPositions = false; // card fine tune has reset the card
applyStoredHairSculpt(original.root, hairMorphs);
assert.deepEqual(Array.from(original.mesh.geometry.attributes.position.array), Array.from(movedHair),
  'hair-shape slider re-adds cached brush result without replaying all strokes');
hairMorphs.sculptGestures = [];
hairMorphs.sculptRevision++;
applyStoredHairSculpt(original.root, hairMorphs);
assert(Array.from(original.mesh.geometry.attributes.position.array)
  .every((v, i) => Math.abs(v - baseHair[i]) < 1e-7),
  'undo removes physical hair vertex displacement (float32 rounding allowed)');
assert.equal(applyLiveSculptStroke(original.root, 'hair', hairStroke) > 0, true);
finalizeSculptStroke(original.root, 'hair');
const differentStyle = makeHairRoot('style_2');
applyStoredHairSculpt(differentStyle.root, { sculptRevision: 1,
  sculptGestures: [{ tool: 'hair', hairStyle: 'style_1', strokes: [hairStroke] }] });
assert.deepEqual(Array.from(differentStyle.mesh.geometry.attributes.position.array), Array.from(baseHair),
  'brush for another hairstyle is not applied to the new haircut');
console.log('SCULPT_LAYER_TESTS_PASS: face symmetry/replay/undo/normal isolation; hair unique/replay/undo/style isolation');
