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
// env=0.56/chiaroscuro=0.34; advanced direct input extends to 2.20 without
// hitting the previous 1.40 clamp. Safety ceiling prevents a burned-out IBL.
export function effectiveEnvironmentIntensity(env, chiaroscuro) {
  const raw = clamp(Number(env), 0.05, 2.20) * (1.02 - clamp(Number(chiaroscuro), 0, 1.6) * 0.45);
  return clamp(raw * (0.45 / (0.56 * (1.02 - 0.34 * 0.45))), 0.05, 1.80);
}

// PMREM has no software-WebGL fallback. In that mode, use existing *physical*
// sky/floor illumination instead; do not leave the environment slider a no-op.
export function softwareSkyFillFactor(env) {
  return clamp(1 + (clamp(Number(env), 0.05, 2.2) - 0.56) * 0.75, 0.6, 2.3);
}

// An active film filter supplies the HDRI's starting intensity, not a ceiling.
// The former hard clamp at 0.85 made much of the extended slider 1.4–2.2
// change only its number when a bright filter was selected. Preserve the
// shipped value at env=.56 and smoothly compress *only* the bright tail.
export function effectiveFilterEnvironmentIntensity(env, recipeIntensity) {
  const raw = Math.max(0.05, Number(recipeIntensity) || 0.38)
    * clamp(Number(env), 0.05, 2.2) / 0.56;
  return raw <= 0.85 ? raw : 0.85 + 0.95 * (1 - Math.exp(-(raw - 0.85) * 0.9));
}

// Skin micro-relief shader supports up to 1.5. The old CPU clamp at 1
// plateaued long before the advanced global slider's end for some faces.
// Compress its high end smoothly instead of silently accepting dead values.
export function effectivePoreRelief(basePore, globalFactor) {
  const raw = Math.max(0, Number(basePore) || 0) * Math.max(0, Number(globalFactor) || 0);
  return raw <= 1 ? raw : 1 + 0.5 * (1 - Math.exp(-(raw - 1) * 1.2));
}
