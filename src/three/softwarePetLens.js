// Cheap, explicitly approximate compositor preview for computers rendering WebGL
// through software (SwiftShader/llvmpipe). The expensive HDR post chain is skipped
// there; without this adapter its blur/filter selectors only changed invisible uniforms.
// Hardware-accelerated WebGL continues to use the full optical shader unchanged.
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, Number(value) || 0));

export function updateSoftwarePetLens(engine, config = {}) {
  if (!engine?.softwareRenderer || !engine.canvas) return;
  const canvas = engine.canvas;
  let lens = document.getElementById('desktop-software-lens');
  if (!lens) {
    lens = document.createElement('div');
    lens.id = 'desktop-software-lens';
    lens.setAttribute('aria-hidden', 'true');
    canvas.after(lens);
  }
  // The HDR/Bloom toggle is forcibly off on software WebGL for performance.
  // Explicitly chosen blur/film controls still need this independent preview.
  // CSS grading is a lightweight approximation of the chosen film grade, not
  // a claim to reproduce the HDR LUT, iris mask, bokeh taps or skin response.
  const hasGrade = Boolean(config.filterPreset);
  if (hasGrade) {
    const contrast = clamp(config.contrast ?? 1, .70, 1.4);
    const saturation = clamp(config.saturation ?? 1, .10, 1.7);
    const exposure = clamp(config.exposure ?? 1, .72, 1.4);
    const bw = clamp(config.bw ?? 0, 0, 1);
    const warm = Math.max(0, clamp(config.warmth ?? 0, -1, 1));
    canvas.style.filter = `brightness(${exposure.toFixed(2)}) contrast(${contrast.toFixed(2)}) saturate(${saturation.toFixed(2)}) grayscale(${bw.toFixed(2)}) sepia(${(warm * .22).toFixed(2)})`;
  } else {
    canvas.style.filter = '';
  }

  const mode = config.blurMode || 'none';
  const power = clamp(config.blurPower ?? 0, 0, 1.5);
  if (mode === 'none' || power < .015) {
    lens.hidden = true;
    lens.style.backdropFilter = '';
    lens.style.webkitBackdropFilter = '';
    return;
  }
  const px = Math.min(8.5, 1.2 + power * (mode === 'dream_haze' ? 5.5 : 4.2));
  const focusY = (100 - clamp(config.focusCenterY ?? .52, 0, 1) * 100).toFixed(1);
  lens.hidden = false;
  lens.dataset.blurMode = mode;
  lens.style.backdropFilter = `blur(${px.toFixed(1)}px)`;
  lens.style.webkitBackdropFilter = lens.style.backdropFilter;
  lens.style.background = (mode === 'pro_mist' || mode === 'dream_haze')
    ? 'rgba(255, 239, 218, 0.045)' : 'transparent';
  if (mode === 'tilt_shift') {
    lens.style.maskImage = `linear-gradient(to bottom, #000 0%, #000 13%, transparent ${Math.max(3, Number(focusY)-16)}%, transparent ${Math.min(97, Number(focusY)+16)}%, #000 87%, #000 100%)`;
  } else if (mode === 'dream_haze') {
    lens.style.maskImage = 'none';
  } else if (mode === 'pro_mist') {
    // Black Pro-Mist in GPU mode is highlight-selective; software mode only
    // previews a gentle full-frame diffusion, not identical microphysics.
    lens.style.maskImage = 'linear-gradient(#000, #000)';
    lens.style.opacity = '.58';
  } else {
    lens.style.maskImage = `radial-gradient(ellipse 40% 48% at 50% ${focusY}%, transparent 12%, transparent 33%, #000 100%)`;
  }
  if (mode !== 'pro_mist') lens.style.opacity = '1';
}
