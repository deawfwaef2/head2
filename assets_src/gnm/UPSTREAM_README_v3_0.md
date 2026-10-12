---
license: apache-2.0
tags:
- 3d
- computer-vision
- human-head
- mesh
- 3dmm
- parametric-model
- head-tracking
- digital-humans
---

# GNM (Generative aNthropometric Model) - v3.0

[![Technical Report](https://img.shields.io/badge/arXiv-2607.23687-b31b1b.svg)](https://arxiv.org/abs/2607.23687)
[![GitHub Repository](https://img.shields.io/badge/GitHub-google%2FGNM-blue.svg)](https://github.com/google/GNM)
[![License](https://img.shields.io/badge/License-Apache_2.0-green.svg)](https://opensource.org/licenses/Apache-2.0)
[![XR Blocks Demo](https://img.shields.io/badge/Demo-XR_Blocks_GNM_Head-orange.svg)](https://xrblocks.github.io/docs/samples/GNM-Head/)

Official release weights for Google's **Generative aNthropometric Model (GNM)**.

---

## Model Overview

**GNM** (pronounced *genome* `/ˈdʒiː.noʊm/`, in reference to the human genome)
is a state-of-the-art parametric 3D statistical model of the human head
developed by Google. Learned from a large dataset of high-resolution 3D scans,
GNM provides fine-grained, disentangled control over facial identity,
expressions, and head pose, complete with controllable internal anatomy
(eyeballs, teeth, and tongue).

3D Morphable Models (3DMMs) are widely used across computer vision, computer
graphics, and generative AI for representing human geometry and appearance. GNM
introduces a state-of-the-art parametric representation of the human head
accompanied by multi-framework backend support and semantic parameter sampling.

The model is released under the **Apache 2.0 permissive license**, suitable for
both academic research and commercial applications.

---

## Key Features & Anatomy

- **Detailed 3D Face Geometry:** Generates a dense 3D mesh consisting of the
  cranial/facial skin, eyes, teeth & gums, and tongue.
- **Controllable Anatomy:**
  - **Skin:** Full cranial, facial, and neck coverage.
  - **Eyes:** Controllable internal eyeball structures (sclera, pupil, iris)
    and external cornea.
  - **Teeth & Gums:** Articulated upper and lower dentition.
  - **Tongue:** Articulated tongue surface supporting inner-mouth deformation
    and speech articulations.
- **Disentangled Parameter Spaces:** Full orthogonal control over:
  - **Identity:** Controls subject-specific facial features and anatomical
    proportions (head, eyeball, teeth).
  - **Expression:** Animates the face with a rich set of blendshapes across the
    eyes, lower face, tongue, and iris.
  - **Head Pose & Joint Rotations:** Controls kinematic rotation of the neck
    and bilateral eyeball gaze (axis-angle format).
  - **Translation:** Controls global 3D Cartesian positioning.
- **Multi-Topology UV Mapping:** Structured UV layouts provided for both quad
  (`quad_uvs`, shape `[Q, 4, 2]`) and triangulated (`triangle_uvs`, shape
  `[T, 3, 2]`) topologies across five logical regions (skin, upper teeth/gums,
  lower teeth/gums, tongue, eye interior, and eye exterior).
- **Multi-Framework Backend Support:** Native support for **NumPy**, **JAX**,
  **PyTorch**, and **TensorFlow** via a unified `GNM` interface.
- **Semantic Parameter Sampling:** Compatible with pre-trained `IdentitySampler`
  and `ExpressionSampler` models for generating identity and expression
  parameters from high-level labels.

---

## Model Organization Structure

Both **Hugging Face Hub** and **Kaggle Models** follow an identical organization
architecture:

- **1 Model / Repository per MAJOR Version:**
  - **Hugging Face Hub:** [google/gnm-v3](https://huggingface.co/google/gnm-v3)
  - **Kaggle Models:** [google/gnm-v3](https://www.kaggle.com/models/google/gnm-v3)
- **Variants for MINOR Versions:**
  - **Hugging Face Hub:** Each minor version is organized into version
    subdirectories (e.g. `v3_0/gnm_head.npz`), with the root `README.md`
    documenting the major release and version-specific `README.md` files
    documenting each version directory.
  - **Kaggle Models:** Each minor version is published as a distinct model
    variation under the `other` framework (e.g.
    `google/gnm-v3/other/gnm_head_v3_0`).

---

## Model Files in This Release

The following model files and SHA-256 checksums are staged in this release:

| Model File | Variant | Version | SHA-256 Checksum |
| :--- | :--- | :---: | :--- |
| `gnm_head.npz` | Head | 3.0 | `61d78bbfb4ad8e0b38495804a4caef3214d3df00f8c3f68761e63b41ce3747eb` |

---

## Quickstart & Usage

Install the `gnm` package from the [GNM GitHub repository](https://github.com/google/GNM):

```bash
git clone https://github.com/google/gnm.git
cd gnm/gnm/shape
pip install -e .

# Or with framework-specific backend support:
pip install -e ".[jax]"      # JAX
pip install -e ".[pytorch]"  # PyTorch
pip install -e ".[all]"      # All supported frameworks
```

### Loading the Model

```python
from gnm.shape import gnm_numpy  # Or gnm_jax, gnm_pytorch, gnm_tensorflow

# 1. Load from Hugging Face Hub (via huggingface_hub SDK or HTTPS CDN fallback)
gnm = gnm_numpy.GNM.from_huggingface(
    version=gnm_numpy.GNMMajorVersion.V3,
    variant=gnm_numpy.GNMVariant.HEAD,
)

# 2. Load from Kaggle Models (via kagglehub SDK)
gnm = gnm_numpy.GNM.from_kaggle(
    version=gnm_numpy.GNMMajorVersion.V3,
    variant=gnm_numpy.GNMVariant.HEAD,
)

# 3. Load via HTTPS CDN (no external SDK required, automatic local caching)
gnm = gnm_numpy.GNM.from_remote(
    version=gnm_numpy.GNMMajorVersion.V3,
    variant=gnm_numpy.GNMVariant.HEAD,
)
```

### Basic Parameter Manipulation

```python
import numpy as np

# Zero parameters produce the neutral template face mesh
identity = np.zeros(gnm.identity_dim)
expression = np.zeros(gnm.expression_dim)
rotations = np.zeros((gnm.num_joints, 3))  # Axis-angle rotations (neck, eyes)
translation = np.zeros((3,))

# Evaluate 3D vertices [V, 3]
vertices = gnm(identity, expression, rotations, translation)
triangles = gnm.triangles  # [F, 3]
```

---

## Model Limitations & Ethical Considerations

This model was trained on datasets using demographic categories standard in
3DMM literature. These categories do not fully represent the spectrum of human
gender identities or the full diversity of the global population. Please refer
to the [Technical Report](https://arxiv.org/abs/2607.23687) for a detailed
discussion of dataset statistics, fairness evaluations, and limitations. Users
should consider the potential implications for fairness and representation in
their specific applications.

---

## Citation

If you use GNM or this model release in your research, please cite:

```text
@article{ploumpis2026gnmhead,
  title={GNM Head: A Generative aNthropometric Model of the human head},
  author={Ploumpis, S. and Bednarik, J. and Zoss, G. and Guseinov, R. and Prasso, L. and Chandran, P. and Boyne, O. and Choutas, V. and Bolkart, T. and Wang, D. and Chai, M. and Qiu, D. and Winberg, S. and Rainer, G. and Bridgeman, L. and Vicini, D. and Riviere, J. and Boetzel, Y. and Koumis, A. and Busch, J. and Herrera, C. and Still, J. and Ysebert, S. and Lincoln, P. and Escolano, S. O. and Rhemann, C. and Wood, E. and Beeler, T. and Zafeiriou, S.},
  year={2026},
  eprint={2607.23687},
  archivePrefix={arXiv},
  url={https://arxiv.org/abs/2607.23687},
}
```

---

## Links & Resources

- **GitHub Repository:** [https://github.com/google/GNM](https://github.com/google/GNM)
- **Technical Report:** [https://arxiv.org/abs/2607.23687](https://arxiv.org/abs/2607.23687)
- **Interactive WebXR Demo:** [https://xrblocks.github.io/docs/samples/GNM-Head/](https://xrblocks.github.io/docs/samples/GNM-Head/)
- **Hugging Face Hub:** [https://huggingface.co/google/gnm-v3](https://huggingface.co/google/gnm-v3)
- **Kaggle Models:** [https://www.kaggle.com/models/google/gnm-v3](https://www.kaggle.com/models/google/gnm-v3)

---

## License

This project and model weights are licensed under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
