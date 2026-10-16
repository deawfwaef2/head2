import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  GLASSES_CONTOUR_STYLES, readGlassesContour, sampleGlassesContour,
  glassesContourKey, withGlassesContourNode,
} from '../src/three/glassesContour.js';
import { syncFaceAccessories, glassesContourHandleLocal } from '../src/three/faceAccessories.js';

assert.equal(GLASSES_CONTOUR_STYLES.length, 6);
assert.deepEqual(readGlassesContour({}, 'wire_oval', 1), Array.from({length:8},()=>[0,0]));
const asymmetric=withGlassesContourNode({}, 'squircle_large', 1, 1, [.15, -.23]);
assert.deepEqual(asymmetric.squircle_large.right[1],[.15,-.23]);
assert.deepEqual(asymmetric.squircle_large.left[1],[0,0]);
assert.deepEqual(sampleGlassesContour(asymmetric,'squircle_large',1,Math.PI/4),[.15,-.23]);
assert.deepEqual(sampleGlassesContour(asymmetric,'squircle_large',-1,Math.PI/4),[0,0]);
assert.deepEqual(sampleGlassesContour(asymmetric,'squircle_large',1,Math.PI/8).map(n=>+n.toFixed(3)),[.075,-.115]);
const mirrored=withGlassesContourNode(asymmetric,'squircle_large',1,1,[.31,.50],true);
assert.deepEqual(mirrored.squircle_large.left[1],[.31,.34]);
assert.deepEqual(asymmetric.squircle_large.right[1],[.15,-.23],'previous gesture is immutable for undo');
assert.deepEqual(withGlassesContourNode({},'wire_oval',1,2,[Infinity,NaN]).wire_oval.right[2],[0,0]);
assert.equal(glassesContourKey({},'squircle_large'),'');

for(const style of ['squircle_large','wire_oval','acetate_square','aviator']){
  const root=new THREE.Group();root.userData.accessoriesReady=true;
  const container=new THREE.Group();container.name='RealDazHeadContainer';root.add(container);
  const morphs={glassesStyle:style,glassesOutline:'round',glassesRimThickness:1,glassesWidth:1,glassesHeight:1};
  syncFaceAccessories(root,morphs);
  const original=root.getObjectByName('Glasses_'+style);
  const rimName=style==='squircle_large'||style==='acetate_square'?'AcetateBevel_1':'TitaniumRim_1';
  const before=glassesContourHandleLocal(style,morphs,1,1);
  const rim=original.getObjectByName(rimName),lens=original.getObjectByName('ConvexOpticalLens_1');
  assert(rim?.geometry.attributes.position.count>100 && lens?.geometry.attributes.position.count>64);
  morphs.glassesContours=withGlassesContourNode({},style,1,1,[.19,.16]);
  syncFaceAccessories(root,morphs);
  const edited=root.getObjectByName('Glasses_'+style);
  const after=glassesContourHandleLocal(style,morphs,1,1);
  assert.notEqual(edited,original,`${style}: only selected style frame rebuilt`);
  assert(after.x>before.x+.003 && after.y>before.y+.002,`${style}: actual local handle goes out and up`);
  assert.equal(edited.scale.x,original.scale.x,`${style}: not a width/height scaling trick`);
  const a=lens.geometry.attributes.position.array,b=edited.getObjectByName('ConvexOpticalLens_1').geometry.attributes.position.array;
  assert(a.length===b.length && a.some((v,i)=>Math.abs(v-b[i])>.002),`${style}: optical lens aperture changed`);
  const newRim=edited.getObjectByName(rimName);
  assert(newRim?.geometry.attributes.position.count>100);
  morphs.glassesContours={};syncFaceAccessories(root,morphs);
  const restored=glassesContourHandleLocal(style,morphs,1,1);
  assert(restored.distanceTo(before)<1e-9,`${style}: undo state restores pristine contour`);
}
console.log('GLASSES_CONTOUR_TESTS_PASS: 6 styles sanitized/persistable; 4 procedural rims+lenses edited without scale, mirrored/independent/undo');
