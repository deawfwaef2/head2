// Advanced numeric editor for every native/late-created range control.
// The original track limits remain visible; direct input may extend the track
// within an explicit, finite safety envelope. We never silently accept NaN,
// infinity, or an out-of-envelope value. Engine-level physical limits remain.
const HARD_LIMITS = Object.freeze({
  'vc-key-azimuth': [-180, 180], 'vc-fill-azimuth': [-180, 180],
  'vc-key-elevation': [-15, 89], 'vc-key-intensity': [0, 5],
  'vc-fill-intensity': [0, 3], 'vc-rim-intensity': [0, 4],
  'vc-exposure': [0.3, 2.4], 'vc-contrast': [0.65, 1.9],
  'vc-saturation': [0, 2], 'vc-warmth': [-1, 1],
  'vc-env-intensity': [0.05, 2.2], 'vc-atmosphere-haze': [0, 1.4],
  'vc-chiaroscuro': [0, 1.6], 'vc-window-gobo-strength': [0, 1.05],
  'vc-film-lut-strength': [0, 1], 'vc-vintage-photo': [0, 1],
  'vc-iris-sparkle': [0, 1.6], 'vc-eye-clarity': [0, 1.6],
  'vc-shadow-lift': [0, 1.5], 'vc-highlight-roll': [0, 1.5],
  'vc-shadow-crush': [0, 1.6],
  'vc-specular-clarity': [0, 1.6], 'vc-skin-lumen': [0, 1.2],
  'vc-depth-blur': [0, 1], 'vc-cas-sharpen': [0, 1.5],
  'vc-swirly-bokeh': [0, 1.5], 'vc-dappled-bokeh': [0, 1.5],
  'vc-wet-lens-drop': [0, 1.5],
  'vc-supersample': [0.85, 1.5], // studio 1.5x; multi-head desktop remains 1.25x
  'vc-occluded-shafts': [0, 1], // GPU ray samples must remain bounded
  'vc-skin-sheen-boost': [0, 1],
  'obs-pet-blur-power': [0, 1.5], 'obs-pet-blur-focus-y': [0, 1],
  'acc-glasses-size': [0.65, 1.55],
  'acc-glasses-rim-width': [0.42, 1.9],
  'acc-glasses-height': [-12, 12], 'acc-glasses-depth': [-12, 12],
  'acc-glasses-tilt': [-18, 18], 'acc-glasses-tint': [0, 0.8],
  'acc-hat-size': [0.78, 1.30], 'acc-hat-height': [-18, 18],
  'acc-hat-tilt': [-18, 18],
  // The sculpt brush / placard geometry deliberately cannot exceed these
  // physical limits. Do not present a numeric value that clamps invisibly.
  'sculpt-radius': [1, 6.5],
  'obs-placard-size': [0.65, 1.55], 'obs-placard-aspect': [0.70, 1.65],
  'morph-head-width': [-0.28, 0.28],
  'morph-head-length': [-0.28, 0.28],
  'morph-jaw-open': [0, 0.85],
  'morph-jaw-side': [0, 0.85],
  'morph-tongue-out': [0, 0.85],
  'morph-eye-roll': [0, 0.85],
  'set-fov': [20, 95],
  'set-box-depth': [450, 3000],
  'set-box-width': [40, 150],
  'set-box-height': [26, 100],
  'set-vp-x': [-0.48, 0.48], 'set-vp-y': [-0.48, 0.48],
  'snd-master': [0, 1], 'snd-pickup': [0, 1],
  'snd-drag': [0, 1], 'snd-collision': [0, 1], 'snd-depth': [0, 1],
  'vc-rain-volume': [0, 1],
});

function limitsFor(input) {
  const target = input.classList.contains('obs-proxy-range')
    ? document.getElementById(input.closest('[data-sync-target]')?.dataset.syncTarget)
    : input.dataset.visGrade
      ? document.getElementById('vc-' + input.dataset.visGrade.replace(/[A-Z]/g, c => '-' + c.toLowerCase()))
      : null;
  if (target?.type === 'range') return limitsFor(target);
  const originalMin = Number(input.dataset.numberOriginalMin ?? input.min);
  const originalMax = Number(input.dataset.numberOriginalMax ?? input.max);
  const min = Number.isFinite(originalMin) ? originalMin : 0;
  const max = Number.isFinite(originalMax) ? originalMax : 100;
  const span = Math.max(0.01, max - min);
  const id = input.id || '';
  if (input.dataset.studioHeadBlend || input.dataset.obsBlendVal || input.dataset.headBlend) return [0, 1.4];
  if (HARD_LIMITS[id]) return HARD_LIMITS[id];
  if (/^(morph-|vcd-eye-)/.test(id)) {
    if (min < 0 && max >= 1) return [Math.min(min, -1.45), Math.max(max, 1.45)];
    if (min >= 0 && max <= 1.6) return [Math.max(0, min - span * .16), Math.min(2.0, max + span * .16)];
  }
  if (/^(snd-|slider-skin-roughness|slider-.*-volume)/.test(id)) return [Math.max(0, min - span * .15), Math.min(1, max + span * .15)];
  if (min >= 0) return [Math.max(0, min - span * .20), max + span * .45];
  return [min - span * .25, max + span * .25];
}

// Shared with trusted presets/archive restoring: a displayed value and the
// actual engine config must be normalized by the same published safe limits.
export function numericSafetyBounds(input) {
  return limitsFor(input);
}

function rememberOriginal(input) {
  if (input.dataset.numberOriginalMin === undefined) input.dataset.numberOriginalMin = input.min;
  if (input.dataset.numberOriginalMax === undefined) input.dataset.numberOriginalMax = input.max;
}

// Also used by preset/draft sync code so a saved beyond-track value is not
// silently truncated by HTMLInputElement.value on reload or panel switching.
export function extendRangeForValue(input, value) {
  if (!input || input.type !== 'range') return false;
  rememberOriginal(input);
  const n = Number(value);
  const [lo, hi] = limitsFor(input);
  if (!Number.isFinite(n) || n < lo - 1e-8 || n > hi + 1e-8) return false;
  if (n < Number(input.min)) input.min = String(n);
  if (n > Number(input.max)) input.max = String(n);
  // A value typed between two slider steps must stay exact after assigning it.
  if (input.step !== 'any') input.step = 'any';
  return true;
}

function describe(input) {
  const [lo, hi] = limitsFor(input);
  const originLo = input.dataset.numberOriginalMin;
  const originHi = input.dataset.numberOriginalMax;
  return `原滑杆 ${originLo}～${originHi}；数值安全范围 ${lo}～${hi}。超界会拒绝，部分参数仍受模型/音频/GPU物理限幅。`;
}

// Presets, archive loading and cross-panel synchronization often assign
// range.value directly (which does not fire an input event). Refresh the
// adjacent number explicitly; otherwise it can show a stale, false value.
export function syncRangeNumericEditor(input) {
  if (!input || input.type !== 'range') return false;
  const editor = input.nextElementSibling;
  if (!editor?.classList.contains('range-number-editor')) return false;
  if (document.activeElement !== editor) editor.value = input.value;
  editor.disabled = input.disabled;
  const n = Number(input.value);
  const out = n < Number(input.dataset.numberOriginalMin) - 1e-8
    || n > Number(input.dataset.numberOriginalMax) + 1e-8;
  editor.classList.toggle('range-number-advanced', out);
  return true;
}

// Button presets, reset actions and character switches set range.value without
// firing input/change. Use one write path so the track is extended for a safe
// advanced value BEFORE HTML clamps it, and its number field never stays stale.
export function setRangeValueAndSync(input, value) {
  if (!extendRangeForValue(input, value)) return false;
  input.value = String(value);
  syncRangeNumericEditor(input);
  return true;
}

function install(input) {
  if (input.dataset.numberEditor === 'yes' &&
      input.nextElementSibling?.classList.contains('range-number-editor')) return;
  // A rebuilt/clone-only slider can carry the marker without its editor.
  // Installing its new editor must not silently leave a dead control behind.
  if (input.dataset.numberEditor === 'yes') input.dataset.numberEditor = 'no';
  rememberOriginal(input);
  input.dataset.numberEditor = 'yes';
  const editor = document.createElement('input');
  editor.type = 'number';
  editor.className = 'range-number-editor';
  editor.step = 'any';
  editor.value = input.value;
  editor.disabled = input.disabled;
  editor.setAttribute('aria-label', `${input.closest('.slider-row, .obs-slider-row, label')?.querySelector('span')?.textContent?.trim() || input.id || '滑杆'} 数值直输`);
  editor.title = describe(input);
  input.after(editor);

  const updateFromRange = () => syncRangeNumericEditor(input);
  input.addEventListener('input', updateFromRange);
  input.addEventListener('change', updateFromRange);
  editor.addEventListener('focus', () => { editor.value = input.value; updateFromRange(); });
  editor.addEventListener('change', () => {
    if (input.disabled) { updateFromRange(); return; }
    const typed = Number(editor.value);
    if (!editor.value.trim() || !extendRangeForValue(input, typed)) {
      const [lo, hi] = limitsFor(input);
      editor.setCustomValidity(`超出安全范围：${lo}～${hi}`);
      editor.reportValidity();
      editor.setCustomValidity('');
      editor.value = input.value;
      return;
    }
    input.value = String(typed);
    // Dispatch through the SAME existing bindings as pointer dragging; do not
    // change archived dossier text, only the range's existing draft/config.
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    // Some paired controllers update their values synchronously in listeners.
    if (input.isConnected) { editor.value = input.value; updateFromRange(); }
  });
  updateFromRange();
}

export function installRangeNumericEditors() {
  document.querySelectorAll('input[type="range"]').forEach(install);
  // Obsidian cards and some tool panels are inserted after startup. Only scan
  // newly added subtrees containing a range, not the constantly animated HUD.
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') {
        syncRangeNumericEditor(record.target);
        continue;
      }
      for (const node of record.addedNodes) {
        if (!(node instanceof Element)) continue;
        if (node.matches('input[type="range"]')) install(node);
        node.querySelectorAll('input[type="range"]').forEach(install);
      }
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['disabled'] });
}
