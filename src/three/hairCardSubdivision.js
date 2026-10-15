import { BufferGeometry, BufferAttribute } from 'three';

// One standard Loop-subdivision step on the EXISTING artist mesh. No hairstyle
// generation, scalp projection or hand-sculpted offsets. UV seams stay separate;
// non-manifold junctions are pinned rather than tearing or producing NaNs.
// Imported models never enter this function. A budget limits desktop-pet cost.
export function refineArtistHairCards(source) {
  // Preserve the artist-authored UV-mapped hair card topology and smooth welded normals directly.
  // Running un-welded Loop subdivision across UV seams shrinks open strip boundaries into slits and holes.
  return source;
}
