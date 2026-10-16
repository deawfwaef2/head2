// Cheap, explicitly approximate compositor preview for computers rendering WebGL
// through software (SwiftShader/llvmpipe). The expensive HDR post chain is skipped
// there; without this adapter its blur/filter selectors only changed invisible uniforms.
// Hardware-accelerated WebGL continues to use the full optical shader unchanged.
const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, Number(value) || 0));

// Explicitly approximate CSS-only grade. Unlike the full GPU post chain, this
// works on both the desktop and studio canvases on SwiftShader/llvmpipe. It is
// *not* exported into the WebGL canvas pixels or equivalent to a HDR film LUT.
export function updateSoftwarePhotoGrade(engine, config = {}) {
  if (!engine?.softwareRenderer || !engine.canvas) return;
  const canvas = engine.canvas;
  const preset = Boolean(config.filterPreset);
  const contrast = clamp(config.contrast ?? 1.14, 0.65, 1.9);
  const saturation = clamp(config.saturation ?? 0.96, 0, 2);
  const shadowCrush = clamp(config.shadowCrush ?? 0.16, 0, 1.6);
  const soft = clamp(config.softFocus ?? 0.04, 0, 1.5);
  const haze = clamp(config.atmosphereHaze ?? 0, 0, 1.4);
  const warm = clamp(config.warmth ?? 0.06, -1, 1);
  const cssContrast = clamp((preset ? contrast : 1 + (contrast - 1.14) * .82)
    + (shadowCrush - 0.16) * .16 - haze * .13, 0.62, 1.9);
  const cssSaturation = clamp(preset ? saturation : 1 + (saturation - 0.96), .05, 2);
  const brightness = preset ? clamp(config.exposure ?? 1, .72, 1.4) : 1 + haze * .025;
  const bw = clamp(config.bw ?? 0, 0, 1);
  const sepia = clamp((preset ? Math.max(0, warm) : Math.max(0, warm - 0.06)) * .22 + haze * .025, 0, .3);
  const blur = clamp(Math.max(0, soft - 0.04) * 1.4 + haze * .80, 0, 2.6);
  const changed = preset || Math.abs(cssContrast - 1) > .002 || Math.abs(cssSaturation - 1) > .002
    || Math.abs(brightness - 1) > .002 || bw > .005 || sepia > .005 || blur > .015;
  canvas.style.filter = changed
    ? `brightness(${brightness.toFixed(3)}) contrast(${cssContrast.toFixed(3)}) saturate(${cssSaturation.toFixed(3)}) grayscale(${bw.toFixed(3)}) sepia(${sepia.toFixed(3)}) blur(${blur.toFixed(2)}px)`
    : '';
}

export function updateSoftwarePetLens(engine, config = {}) {
  if (!engine?.softwareRenderer || !engine.canvas) return;
  const canvas = engine.canvas;
  updateSoftwarePhotoGrade(engine, config);
  let lens = document.getElementById('desktop-software-lens');
  if (!lens) {
    lens = document.createElement('div');
    lens.id = 'desktop-software-lens';
    lens.setAttribute('aria-hidden', 'true');
    canvas.after(lens);
  }
  // The HDR/Bloom toggle is forcibly off on software WebGL; the separate
  // optical blur overlay remains an approximation, not a GPU bokeh simulation.

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
