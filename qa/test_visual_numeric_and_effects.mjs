import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extendRangeForValue, numericSafetyBounds } from '../src/ui/rangeNumericInput.js';
import { effectiveEnvironmentIntensity, effectiveFilterEnvironmentIntensity, effectivePoreRelief, softwareSkyFillFactor } from '../src/three/portraitLightTuning.js';
import { updateSoftwarePhotoGrade } from '../src/three/softwarePetLens.js';

function fakeRange(id, min, max) {
  return { id, type: 'range', min: String(min), max: String(max), step: '0.05',
    dataset: {}, classList: { contains: () => false } };
}
const bright = fakeRange('vc-key-intensity', 0.4, 3.2);
assert.equal(extendRangeForValue(bright, 4.25), true);
assert.equal(bright.max, '4.25');
assert.equal(bright.dataset.numberOriginalMax, '3.2');
assert.equal(bright.step, 'any');
assert.deepEqual(numericSafetyBounds(bright), [0, 5]);
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
assert.equal(extendRangeForValue(fakeRange('vc-iris-sparkle', 0, 1.6), 1.8), false,
  'point glint shader clamps at 1.6');
assert.equal(extendRangeForValue(fakeRange('vc-eye-clarity', 0, 1.5), 1.6), true);
assert.equal(extendRangeForValue(fakeRange('vc-eye-clarity', 0, 1.5), 1.7), false,
  'iris clarity shader clamps at 1.6');
assert.equal(extendRangeForValue(fakeRange('vc-shadow-lift', 0, 1.2), 1.65), false,
  'GPU shadow lift shader clamps at 1.5');
assert.equal(extendRangeForValue(fakeRange('obs-pet-blur-power', 0, 1.2), 1.65), false,
  'blur shader/CSS cap at 1.5');
const softwareEngine = { softwareRenderer: true, canvas: { style: {} } };
updateSoftwarePhotoGrade(softwareEngine, { warmth: -0.5, saturation: 0 });
assert.match(softwareEngine.canvas.style.filter, /hue-rotate\(-16\.0deg\)/,
  'negative cool tone must change the software image, not only its number');
assert.match(softwareEngine.canvas.style.filter, /saturate\(0\.000\)/,
  'zero saturation actually achieves monochrome in software');

const env = [0.05, 0.1, 0.56, 1.4, 1.8, 2.2].map(v => effectiveEnvironmentIntensity(v, .34));
for (let i=1; i<env.length; i++) assert.ok(env[i] > env[i-1], 'advanced IBL value must alter environment');
assert.ok(softwareSkyFillFactor(2.2) > softwareSkyFillFactor(1.4), 'SwiftShader physical sky must extend');
for (const recipe of [0.38, 0.65, 0.85]) {
  const filtered = [0.05, 0.10, 0.56, 1.4, 1.8, 2.2]
    .map(v => effectiveFilterEnvironmentIntensity(v, recipe));
  for (let i = 1; i < filtered.length; i++)
    assert.ok(filtered[i] > filtered[i-1], `active film HDRI ${recipe}: advanced input must not plateau`);
  assert.equal(effectiveFilterEnvironmentIntensity(0.56, recipe), recipe,
    'preserve the original filter exposure at the reference value');
  assert.ok(filtered.at(-1) < 1.8, 'bright HDRI remains below the film-safe ceiling');
}
for (const basePore of [0.24, 0.8]) {
  const sampled = [0, 0.56, 1.4, 2.0, 2.9]
    .map(v => effectivePoreRelief(basePore, v / 0.56));
  for (let i = 1; i < sampled.length; i++)
    assert.ok(sampled[i] > sampled[i-1], 'pore relief must continue to change above its old CPU plateau');
  assert.ok(sampled.at(-1) < 1.5, 'pore relief must not exceed the skin shader cap');
}

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
assert.ok(main.includes('syncRangeNumericEditor(el)'), 'visual preset updates must refresh neighboring number fields');
assert.ok(main.includes('state.visualCustomConfig[key] = Number.isFinite(n)'),
  'preset and archive values outside advertised limits must be normalized before rendering');
assert.ok(!main.includes('supersample: 1.75'), 'preset must not exceed real 1.50x studio / 1.25x desktop limits');
assert.ok(main.includes('btn.disabled = postUnavailable'), 'a skipped GPU combo must not pretend to be available');
assert.ok(main.includes('syncStudioHeadBlendUI(state.studioDraft.morphs)'), 'archived blend UI must reload beyond track');
assert.ok(main.includes('slider.disabled = staticLight'), 'inert speed / amplitude disabled for static rig');
assert.ok(main.includes('const gpuOnlyIds = [') && main.includes('softwareApproxIds = new Set'));
assert.ok(lens.includes('updateSoftwarePhotoGrade(engine, config = {})'));
console.log('VISUAL_NUMERIC_EFFECTS_PASS: finite editor safety, true advanced range, dynamic light/filter precedence, software approximations and opt-in fog');
