import assert from 'node:assert/strict';
import { skinFinishParameters, effectiveEnvironmentIntensity, softwareSkyFillFactor } from '../src/three/portraitLightTuning.js';

const gloss = 0.14, rough = 0.64 - gloss * 0.24;
const off = skinFinishParameters(rough, gloss, 0, false, 1);
assert.deepEqual(off, {
  roughness: rough,
  clearcoat: 0.10 + gloss * 0.14,
  clearcoatRoughness: 0.36,
  specularIntensity: 0.54 + gloss * 0.30,
  envMapIntensity: 0.68 + gloss * 0.28,
}, 'disabled optional sheen must exactly preserve prior portrait skin material');
assert.deepEqual(skinFinishParameters(rough, gloss, 0, true, 0), off, 'zero gain must be a strict identity');
const on = skinFinishParameters(rough, gloss, 0, true, 0.7);
assert(on.roughness < rough && on.clearcoat > off.clearcoat && on.specularIntensity > off.specularIntensity);
const matteOff = skinFinishParameters(0.45, gloss, 1, false, 0.9);
assert.equal(matteOff.roughness, 0.54, 'existing independent matte control remains intact');
assert(Math.abs(effectiveEnvironmentIntensity(0.56, 0.34) - 0.45) < 1e-12,
  'default HDR intensity must not move');
const hdr = [0.1, 0.3, 0.56, 0.9, 1.4].map(v => effectiveEnvironmentIntensity(v, 0.34));
assert(hdr.every((n,i) => i === 0 || n > hdr[i-1] + 0.01), 'HDR slider must change across full travel');
assert.equal(softwareSkyFillFactor(0.56), 1, 'software fallback must preserve old default sky');
assert(softwareSkyFillFactor(0.10) < 1 && softwareSkyFillFactor(1.40) > 1.5);
console.log('PORTRAIT_LIGHT_TESTS_PASS: optional skin identity, live HDR range and software physical-sky fallback');
