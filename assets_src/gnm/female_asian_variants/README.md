# Google GNM v3 — Female Asian head-base variants

Three static head-base meshes sampled with Google's official GNM Head v3 identity decoder using its **Female + Asian** semantic labels. They are intended as editable starting geometry for fitting adult portrait references, not as finished photoreal characters or scans of identifiable people.

## Contents

- `gnm_female_asian_01.obj` — 17,821 vertices, 35,324 triangles, UV coordinates and smooth normals.
- `gnm_female_asian_02.obj` — same topology; separate identity sample.
- `gnm_female_asian_03.obj` — same topology; separate identity sample.
- `gnm_female_asian.mtl` — neutral placeholder material (no texture map).
- `identity_parameters.json` — reproducible sampler indices and metadata.
- `LICENSE` — Apache License 2.0.

## Important scope notes

- GNM's official identity sampler has coarse gender and ethnicity labels; it does **not** have an age label. These are female/Asian base shapes, not age-verified assets. Fit them to a young-adult reference photo to set the intended appearance.
- Geometry only: no photographic skin/albedo texture, hair, eyelashes or final shader. The photo-fitting and texture projection step is separate.
- For photo-to-head work, a second 3/4-view photo helps constrain depth that a single frontal image cannot reveal.

## Source and license

- Google GNM repository: https://github.com/google/GNM
- Official model weights: https://huggingface.co/google/gnm-v3/tree/main/v3_0
- Upstream GNM v3.0 model file SHA-256: `61d78bbfb4ad8e0b38495804a4caef3214d3df00f8c3f68761e63b41ce3747eb`
- GNM code, weights and these derivative meshes: Apache-2.0; see `LICENSE`.

The OBJ files are derivatives of the GNM v3.0 parameterized head model, generated from the documented GNM identity decoder; see `identity_parameters.json` for deterministic sample indices.
