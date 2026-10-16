import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extendRangeForValue } from '../src/ui/rangeNumericInput.js';
import { effectiveEnvironmentIntensity, softwareSkyFillFactor } from '../src/three/portraitLightTuning.js';

function fakeRange(id, min, max) {
  return { id, type: 'range', min: String(min), max: String(max), step: '0.05',
    dataset: {}, classList: { contains: () => false } };
}
const bright = fakeRange('vc-key-intensity', 0.4, 3.2);
assert.equal(extendRangeForValue(bright, 4.25), true);
assert.equal(bright.max, '4.25');
assert.equal(bright.dataset.numberOriginalMax, '3.2');
assert.equal(bright.step, 'any');
assert.equal(extendRangeForValue(bright, 400), false);
assert.equal(bright.max, '4.25');
assert.equal(extendRangeForValue(bright, NaN), false);

const face = fakeRange('morph-mouth-width', -1.3, 1.3);
assert.equal(extendRangeForValue(face, 1.43), true);
assert.equal(face.max, '1.43');
assert.equal(extendRangeForValue(face, -1.46), false);
const blend = fakeRange('', 0, 1);
blend.dataset.studioHeadBlend = 'blend_cn_baby';
assert.equal(extendRangeForValue(blend, 1.34), true, 'advanced 38-head weights can pass 100%');
assert.equal(extendRangeForValue(blend, 1.41), false, 'head blend clamps at actual 140% safe limit');
const gobo = fakeRange('vc-window-gobo-strength', 0, 1);
assert.equal(extendRangeForValue(gobo, 1.05), true);
assert.equal(extendRangeForValue(gobo, 1.09), false);
const sound = fakeRange('snd-master', 0, 1);
assert.equal(extendRangeForValue(sound, 1.2), false, 'Web Audio gain must not claim unsafe values');
assert.equal(extendRangeForValue(fakeRange('sculpt-radius', 1, 6.5), 7), false,
  'brush radius already reaches its real 6.5cm ceiling');
assert.equal(extendRangeForValue(fakeRange('obs-placard-size', .65, 1.55), 1.8), false,
  'archived display layout must reject values that would silently clamp');
const lut = fakeRange('vc-film-lut-strength', 0, 1);
assert.equal(extendRangeForValue(lut, 1.2), false, '1.0 is actual film LUT mix ceiling');

const env = [0.05, 0.1, 0.56, 1.4, 1.8, 2.2].map(v => effectiveEnvironmentIntensity(v, .34));
for (let i=1; i<env.length; i++) assert.ok(env[i] > env[i-1], 'advanced IBL value must alter environment');
assert.ok(softwareSkyFillFactor(2.2) > softwareSkyFillFactor(1.4), 'SwiftShader physical sky must extend');

const light = readFileSync(new URL('../src/three/photorealLighting.js', import.meta.url), 'utf8');
const grade = readFileSync(new URL('../src/three/beautyPostChain.js', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.js', import.meta.url), 'utf8');
const lens = readFileSync(new URL('../src/three/softwarePetLens.js', import.meta.url), 'utf8');
assert.ok(light.includes('engine.scene.fog = new THREE.FogExp2'), 'optional true depth fog');
assert.ok(light.includes('rig.key.intensity = Math.max(0, baseKeyInt * intFactor)'), 'manual zero key survives dynamic mode');
assert.ok(light.includes('const baseKeyInt = Number(m.keyIntensity'), 'filter cannot overwrite dynamic key');
assert.ok(light.includes('const baseTyndall = Number(m.tyndall'), 'filter cannot overwrite manual glow');
assert.ok(light.includes('reflectedLight.directDiffuse *= directScale * shadowChromaBalance * windowLightMask'), 'gobo actually shades the face');
assert.ok(light.includes('} else if (uWindowGoboMode < 4.5) {') && light.includes('float beamLine ='),
  'golden hair slit and leafy gobo must have different spatial skin patterns');
const recipeIndex = grade.indexOf('if (params.filterPreset !== undefined)', grade.indexOf('setGradeParams(params = {})'));
const manualIndex = grade.indexOf('if (params.contrast !== undefined)', grade.indexOf('setGradeParams(params = {})'));
assert.ok(recipeIndex >= 0 && recipeIndex < manualIndex, 'filter recipe must not override individual grade sliders');
assert.ok(main.includes('installRangeNumericEditors();'));
assert.ok(main.includes('syncStudioHeadBlendUI(state.studioDraft.morphs)'), 'archived blend UI must reload beyond track');
assert.ok(main.includes('slider.disabled = staticLight'), 'inert speed / amplitude disabled for static rig');
assert.ok(main.includes('const gpuOnlyIds = [') && main.includes('softwareApproxIds = new Set'));
assert.ok(lens.includes('updateSoftwarePhotoGrade(engine, config = {})'));
console.log('VISUAL_NUMERIC_EFFECTS_PASS: finite editor safety, true advanced range, dynamic light/filter precedence, software approximations and opt-in fog');
