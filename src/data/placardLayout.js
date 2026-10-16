// Standalone DISPLAY preferences. These never touch the locked photo, name,
// origin, story, or the versioned placardDossier on a collectible.
export const PLACARD_LAYOUT_STORAGE_KEY = 'cervix3d-placard-display-layout-v1';
export const PLACARD_LAYOUT_DEFAULT = Object.freeze({ size: 1, aspect: 1 });
const clamp = (v, min, max, fallback = 1) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
};
export function normalizePlacardLayout(input = {}) {
  return {
    size: Math.round(clamp(input?.size, 0.65, 1.55) * 100) / 100,
    // Horizontal ratio: vertical length still follows the locked paragraph.
    aspect: Math.round(clamp(input?.aspect, 0.70, 1.65) * 100) / 100,
  };
}
export function restorePlacardLayouts(storage = globalThis.localStorage) {
  try {
    const raw = JSON.parse(storage?.getItem(PLACARD_LAYOUT_STORAGE_KEY) || '{}');
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    return Object.fromEntries(Object.entries(raw).slice(0, 80)
      .filter(([id, entry]) => typeof id === 'string' && id.length > 0 && id.length < 128 &&
        !['__proto__', 'prototype', 'constructor'].includes(id) && entry && typeof entry === 'object' && !Array.isArray(entry))
      .map(([id, entry]) => [id, normalizePlacardLayout(entry)]));
  } catch (_) { return {}; }
}
export function savePlacardLayouts(layouts, storage = globalThis.localStorage) {
  try {
    const safe = Object.fromEntries(Object.entries(layouts || {}).slice(0, 80)
      .filter(([id, entry]) => typeof id === 'string' && id.length > 0 && id.length < 128 &&
        !['__proto__', 'prototype', 'constructor'].includes(id) && entry)
      .map(([id, entry]) => [id, normalizePlacardLayout(entry)]));
    storage?.setItem(PLACARD_LAYOUT_STORAGE_KEY, JSON.stringify(safe));
    return true;
  } catch (_) { return false; }
}
export function placardVisualDimensions(input, viewportWidth, viewportHeight) {
  const { size, aspect } = normalizePlacardLayout(input);
  const cssWidth = Math.max(190, Math.min(336 * aspect, 554, (viewportWidth - 24) / size));
  const cssMaxHeight = Math.max(80, (viewportHeight - 112) / size);
  return { size, aspect, cssWidth, cssMaxHeight };
}
