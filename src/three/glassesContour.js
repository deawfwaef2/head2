// Serializable freeform silhouette edits for *each* pair of glasses. Values
// are fractions of an individual lens's half-width/height, not global scale.
// Eight landmarks per lens: outer, upper-outer, top, upper-inner, inner,
// lower-inner, bottom, lower-outer. Mirroring preserves the optician's symmetry
// without preventing a deliberate one-sided edit.
export const GLASSES_CONTOUR_LABELS = Object.freeze([
  '外侧', '外上角', '上沿', '内上角', '鼻侧', '内下角', '下沿', '外下角',
]);
export const GLASSES_CONTOUR_LIMIT = 0.34;
export const GLASSES_CONTOUR_STYLES = Object.freeze([
  'squircle_large', 'wire_oval', 'acetate_square', 'aviator',
  'polyhaven_round', 'polyhaven_large_oval',
]);
const TAU = Math.PI * 2;
const zeroPoints = () => GLASSES_CONTOUR_LABELS.map(() => [0, 0]);
const clamp = value => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  const bounded = Math.max(-GLASSES_CONTOUR_LIMIT, Math.min(GLASSES_CONTOUR_LIMIT, n));
  return Math.round(bounded * 10000) / 10000 || 0;
};
export function readGlassesContour(contours, style, side) {
  const source = contours && typeof contours === 'object' &&
    GLASSES_CONTOUR_STYLES.includes(style) ? contours[style]?.[side < 0 ? 'left' : 'right'] : null;
  if (!Array.isArray(source)) return zeroPoints();
  return GLASSES_CONTOUR_LABELS.map((_, index) => {
    const point = source[index];
    return Array.isArray(point) ? [clamp(point[0]), clamp(point[1])] : [0, 0];
  });
}
export function sampleGlassesContourPoints(points, angle) {
  const phase = ((Number(angle) || 0) / TAU * points.length % points.length + points.length) % points.length;
  const a = Math.floor(phase), b = (a + 1) % points.length;
  const t = (1 - Math.cos((phase - a) * Math.PI)) * 0.5;
  return [
    points[a][0] * (1 - t) + points[b][0] * t,
    points[a][1] * (1 - t) + points[b][1] * t,
  ];
}
export function sampleGlassesContour(contours, style, side, angle) {
  return sampleGlassesContourPoints(readGlassesContour(contours, style, side), angle);
}
export function glassesContourKey(contours, style) {
  const left = readGlassesContour(contours, style, -1);
  const right = readGlassesContour(contours, style, 1);
  if ([...left, ...right].every(([x, y]) => !x && !y)) return '';
  return JSON.stringify([left, right]);
}
export function withGlassesContourNode(contours, style, side, index, value, mirrored = false) {
  if (!GLASSES_CONTOUR_STYLES.includes(style) || !Number.isInteger(index) ||
      index < 0 || index >= GLASSES_CONTOUR_LABELS.length) return contours || {};
  // Copy only the six known styles, never a prototype or arbitrary data from
  // an imported save. Keep independent adjustments when switching frames.
  const next = {};
  for (const id of GLASSES_CONTOUR_STYLES) {
    if (glassesContourKey(contours, id)) {
      next[id] = {
        left: readGlassesContour(contours, id, -1),
        right: readGlassesContour(contours, id, 1),
      };
    }
  }
  const pair = [clamp(value?.[0]), clamp(value?.[1])];
  const selected = next[style] || { left: zeroPoints(), right: zeroPoints() };
  selected[side < 0 ? 'left' : 'right'][index] = pair.slice();
  if (mirrored) selected[side < 0 ? 'right' : 'left'][index] = pair.slice();
  next[style] = selected;
  return next;
}
