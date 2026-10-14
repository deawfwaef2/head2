# Stage 42 · Restored artist hair texture credits

This update changes textures/shading only; it does not claim that the existing model collection is Daz-owned or newly license-audited in its entirety.

## Elvaerwyn — Daisy hair
- Artist: **Elvaerwyn**.
- Source: http://www.makehumancommunity.org/node/1859
- Official distribution: https://static.makehumancommunity.org/assets/assetpacks/hair02.html
- Download: https://files2.makehumancommunity.org/asset_packs/hair02/hair02_ccby.zip
- License as published in both `packs/hair02.json` and the source header: **CC-BY** (version not stated there; no specific version is asserted here).
- Original texture: `hair/elvs_daisy_hair/daisyhair1.png` (1024×1024).
- SHA-256: `a434a5b22dfaf8e658742ce1e91a531e4e626a868731c37fb04c2fcb60d3ae9c`.
- Used by `hair_long01.glb` and `daz_hair_air_bangs_long.glb`. UV matching was checked against the artist OBJ, not inferred from the misleading internal filenames.
- Changes: grayscale luminance levels for the application's dye tint; original 8-bit alpha retained; lossless luminance-alpha PNG encoding. No generated hair strokes, silhouette changes, mesh sculpting or geometry replacement.

## littleright — bobcut texture
- Artist: **littleright**. Homepage in original source: https://twitter.com/littleright_lr
- Source: http://www.makehumancommunity.org/node/936
- Official distribution: https://static.makehumancommunity.org/assets/assetpacks/hair01.html
- Download: https://files2.makehumancommunity.org/asset_packs/hair01/hair01_cc0.zip
- Current official catalog distributes this asset as **CC0**. Important historical discrepancy: the `.mhclo` header in the archive still says `AGPL3`; this update records that conflict rather than silently claiming all historical licensing is resolved. Follow up with the distributor before commercial redistribution if clarification is needed.
- Original texture: `hair/littleright_bobcut_hair/hairtex.png` (1024×1024).
- SHA-256: `57a7924c9a7a5c6174e1bc27d6c182cd31e88cf900238dc941156dae85bf1e15`.
- Used by `hair_user_photo.glb` (the existing mesh uses bobcut UVs, **not** the O4saken Chinese-bob UVs that old scripts suggest). Original positions/UVs/index data remain byte-identical.
- Changes: dye-neutral luminance levels, original alpha, lossless LA PNG; no new geometry.

The O4saken Chinese-bob atlas was investigated but **is not included**: it does not match the current mesh UVs. Download archives and investigation scratch files are not committed.

Attribution also appears inside the downloadable HTML's hair panel so it travels with the standalone artifact. The official CC-BY attribution is retained without inventing a license version.
