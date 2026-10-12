# Google GNM Head v3 — female Asian photo-fitting bases

This package contains Google's Apache-2.0 GNM Head v3 parameterized head model plus three static base meshes sampled as **Female + Asian**. The user intends to fit young-adult portrait photos to these bases. The generated geometry does not itself encode age or photographic skin detail.

## Contents

- `gnm_head_v3.npz` — official parametric head weights (53,328,601 bytes; identity/expression bases and topology).
- `female_asian_variants/` — three neutral-expression Female + Asian OBJ bases, MTL, deterministic sample metadata, per-file checksums and Apache-2.0 license.
- `UPSTREAM_README_v3_0.md`, `LICENSE` — Google usage notes and Apache-2.0 license.

The optional TensorFlow semantic-sampler H5 files were used to create the three examples but are not part of this asset branch; they remain available from the official Google/GNM source repository.

## Use and limitations

GNM is a shape-generation/fitting base, not a finished photoreal character. The OBJ variants contain UV coordinates and smooth normals but **no photographic skin/albedo texture, hair, or eyelashes**. The official identity sampler uses broad gender and ethnicity classes but has no age label. A fitting step must infer identity from reference photos; a second three-quarter photo helps constrain depth.

## Source and integrity

- Official repository: https://github.com/google/GNM
- Official model weights: https://huggingface.co/google/gnm-v3/tree/main/v3_0
- Version: GNM v3.0, Head variant
- License: Apache License 2.0 (see `LICENSE`)
- SHA-256 (`gnm_head_v3.npz`): `61d78bbfb4ad8e0b38495804a4caef3214d3df00f8c3f68761e63b41ce3747eb`
