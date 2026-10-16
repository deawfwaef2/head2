import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createOccludedLightScatteringPass } from '../src/three/occludedLightScattering.js';

const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(), key = new THREE.DirectionalLight();
key.castShadow = true;
scene.add(key);
const pass = createOccludedLightScatteringPass(scene, camera, key);
assert.equal(pass.enabled, false, 'new rays must be opt-in');
assert.equal(pass.baffleGroup.visible, false, 'default portrait material and key shadow must not change');
assert.equal(pass.baffleGroup.children.length, 4);
assert(pass.baffleGroup.children.every(mesh => mesh.castShadow && mesh.geometry.type === 'BoxGeometry'
  && !mesh.material.colorWrite && !mesh.material.depthWrite), 'real shadow blockers, never alpha beam planes');
const shader = pass.baffleGroup.children[0];
assert(shader.material.visible);
pass.setScatteringStrength(0.75, true);
assert(pass.enabled && pass.baffleGroup.visible && pass.baffleGroup.children[0].scale.y === 0.75);
pass.updateBaffles();
assert(pass.baffleGroup.position.length() > 20 && pass.baffleGroup.position.length() < 40);
pass.setScatteringStrength(1, false);
assert(!pass.enabled && !pass.baffleGroup.visible, 'software renderer must not promise a heavy GPU shadow pass');
pass.setScatteringStrength(0, true);
assert(!pass.enabled && !pass.baffleGroup.visible, 'zero restores the original scene');
pass.dispose();
assert.equal(scene.children.includes(pass.baffleGroup), false);
console.log('OCCLUDED_SCATTERING_TESTS_PASS: default off, genuine shadow-casting boxes, GPU opt-in and cleanup');
