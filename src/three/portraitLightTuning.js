// Pure mappings shared by the photography rig and regression tests.
// A preference of zero/off MUST reproduce the pre-Stage-76 skin material.
const clamp = (value, lo, hi) => Math.min(hi, Math.max(lo, Number.isFinite(value) ? value : lo));

export function skinFinishParameters(baseRoughness, skinGloss, matte, enabled = false, boost = 0) {
  const extra = enabled ? clamp(Number(boost), 0, 1) : 0;
  const rough = clamp(Number(baseRoughness), 0.1, 1);
  const matteAmount = clamp(Number(matte), 0, 1);
  const oldRough = rough + (Math.max(rough, 0.54) - rough) * matteAmount;
  return {
    roughness: clamp(oldRough - extra * 0.24, 0.28, 1),
    clearcoat: 0.10 + skinGloss * 0.14 + extra * 0.16,
    clearcoatRoughness: 0.36 - extra * 0.17,
    specularIntensity: 0.54 + skinGloss * 0.30 + extra * 0.26,
    envMapIntensity: 0.68 + skinGloss * 0.28 + extra * 0.24,
  };
}

// Old HDR slider clamped everything above ~0.50 to 0.45: most of its travel
// changed only the number in the UI. Retain the shipped default of 0.45 at
// env=0.56/chiaroscuro=0.34, but map the entire 0.10–1.40 input monotonically.
export function effectiveEnvironmentIntensity(env, chiaroscuro) {
  const raw = clamp(Number(env), 0.10, 1.40) * (1.02 - clamp(Number(chiaroscuro), 0, 1.5) * 0.45);
  return clamp(raw * (0.45 / (0.56 * (1.02 - 0.34 * 0.45))), 0.08, 0.85);
}

// PMREM has no software-WebGL fallback. In that mode, use existing *physical*
// sky/floor illumination instead; do not leave the environment slider a no-op.
export function softwareSkyFillFactor(env) {
  return clamp(1 + (clamp(Number(env), 0.1, 1.4) - 0.56) * 0.75, 0.6, 1.6);
}
