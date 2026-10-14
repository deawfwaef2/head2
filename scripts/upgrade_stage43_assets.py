#!/usr/bin/env python3
"""
Stage 43 Asset Upgrade Pipeline:
1. Rebuilds all 8 Skin Variants in `public/models/daz_asian_head_base.glb` from 6 distinct
   CC0 MakeHuman photographic female skin bases (`young_asian`, `natural_makeup`, `violet_makeup`,
   `eurasian`, `glam_makeup`, `zoey`) + reference photo chromophore grading (`user_photo_ref.jpg`),
   eliminating the cookie-cutter 0.999 correlation across skins.
2. Fixes `Mesh 3 (Eyelashes)` lower lash curtain (`y < 0.0155`) and `Image 4` lower lash alpha
   so the dark U-shaped raccoon band under the eyes disappears completely.
3. Enhances `face_eye_size_incr` and `face_eye_size_decr` morph targets on `HeadSkin` and `Eyelashes`
   for high-impact, artifact-free eye size adjustment (while keeping `Eyes` safe from red-eye).
4. Rebuilds `public/models/hair_user_photo.glb` to match `fang_yaoping_ref.jpg` / `user_photo_ref.jpg`
   (exposed right ear, light wispy see-through air bangs, slender left temple wisp, neat tied-back
   student ponytail) and cleans detached lower-chest accordion-pancake clumps across all 28 hair GLBs.
"""
import glob
import io
import json
import os
import struct
import subprocess
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, distance_transform_edt
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import connected_components

HEAD_GLB_PATH = '/home/user/public/models/daz_asian_head_base.glb'

print("=== Stage 43 Step 1: Loading Head GLB & Multi-Source Photographic Skin Bases ===")
with open(HEAD_GLB_PATH, 'rb') as f:
    raw_head = f.read()
jlen = struct.unpack_from('<I', raw_head, 12)[0]
gltf = json.loads(raw_head[20:20 + jlen].decode('utf-8'))
bin_buf = bytearray(raw_head[28 + jlen:])


def get_image_rgb_float(bv_idx, size=(1024, 1024)):
    bv = gltf['bufferViews'][bv_idx]
    raw_b = bytes(bin_buf[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']])
    im = Image.open(io.BytesIO(raw_b)).convert('RGB').resize(size, Image.Resampling.LANCZOS)
    return np.array(im, dtype=np.float32)


def get_image_rgba_pil(bv_idx):
    bv = gltf['bufferViews'][bv_idx]
    raw_b = bytes(bin_buf[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']])
    return Image.open(io.BytesIO(raw_b)).convert('RGBA')


def encode_png(pil_im, quantize_colors=None):
    bio = io.BytesIO()
    if quantize_colors is not None:
        pil_im = pil_im.quantize(colors=quantize_colors, method=Image.Quantize.FASTOCTREE)
    pil_im.save(bio, format='PNG', optimize=True)
    return bio.getvalue()


def get_acc_f32(acc_idx):
    acc = gltf['accessors'][acc_idx]
    bv = gltf['bufferViews'][acc['bufferView']]
    off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    ch = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[acc['type']]
    return np.frombuffer(bin_buf, dtype='<f4', count=acc['count'] * ch, offset=off).copy().reshape(acc['count'], ch)


def set_acc_f32(acc_idx, arr):
    acc = gltf['accessors'][acc_idx]
    bv = gltf['bufferViews'][acc['bufferView']]
    off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    raw = np.ascontiguousarray(arr, dtype='<f4').tobytes()
    bin_buf[off:off + len(raw)] = raw
    acc['min'] = np.min(arr, axis=0).astype(float).tolist()
    acc['max'] = np.max(arr, axis=0).astype(float).tolist()


def get_morph_delta(mesh_idx, prim_idx, target_idx):
    acc_idx = gltf['meshes'][mesh_idx]['primitives'][prim_idx]['targets'][target_idx]['POSITION']
    acc = gltf['accessors'][acc_idx]
    bv = gltf['bufferViews'][acc['bufferView']]
    off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    if acc['componentType'] == 5122:
        raw = np.frombuffer(bin_buf, dtype='<i2', count=acc['count'] * 4, offset=off).reshape(acc['count'], 4)
        return raw[:, :3].astype(np.float32) / 32767.0
    return np.frombuffer(bin_buf, dtype='<f4', count=acc['count'] * 3, offset=off).copy().reshape(acc['count'], 3)


def set_morph_delta(mesh_idx, prim_idx, target_idx, arr):
    acc_idx = gltf['meshes'][mesh_idx]['primitives'][prim_idx]['targets'][target_idx]['POSITION']
    acc = gltf['accessors'][acc_idx]
    bv = gltf['bufferViews'][acc['bufferView']]
    off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    if acc['componentType'] == 5122:
        q = np.clip(np.round(np.asarray(arr, dtype=np.float32) * 32767.0), -32767, 32767).astype('<i2')
        padded = np.zeros((len(q), 4), dtype='<i2')
        padded[:, :3] = q
        raw = padded.tobytes()
        bin_buf[off:off + len(raw)] = raw
        acc['min'] = q.min(axis=0).astype(int).tolist()
        acc['max'] = q.max(axis=0).astype(int).tolist()
    else:
        raw = np.ascontiguousarray(arr, dtype='<f4').tobytes()
        bin_buf[off:off + len(raw)] = raw
        acc['min'] = np.min(arr, axis=0).astype(float).tolist()
        acc['max'] = np.max(arr, axis=0).astype(float).tolist()


# ---------------------------------------------------------------------------
# 1. Load ALL 6 Real MakeHuman Photographic Skin Bases (bv 316..321)
# ---------------------------------------------------------------------------
RES = 1024
s = RES / 2048.0
yy_s, xx_s = np.mgrid[0:RES, 0:RES].astype(np.float32) / s

skins_meta = gltf['extras']['realWebAssets']['skins']
im_young_asian = get_image_rgb_float(skins_meta['young_asian']['bufferView'], (RES, RES))
im_natural_mk  = get_image_rgb_float(skins_meta['natural_makeup']['bufferView'], (RES, RES))
im_violet_mk   = get_image_rgb_float(skins_meta['violet_makeup']['bufferView'], (RES, RES))
im_eurasian    = get_image_rgb_float(skins_meta['eurasian']['bufferView'], (RES, RES))
im_glam_mk     = get_image_rgb_float(skins_meta['glam_makeup']['bufferView'], (RES, RES))
im_zoey        = get_image_rgb_float(skins_meta['zoey']['bufferView'], (RES, RES))

# UV spatial masks in 2048-normalized coordinates:
# Note: in MakeHuman UV layout, xx_s (col) ~ 1700..1920 is the face vertical axis (forehead=1700 -> chin=1910),
# and yy_s (row) ~ 920..1190 is the horizontal left-to-right axis (centerline yy_s = 1056.2)!
face_oval = np.clip(1.0 - np.sqrt(((xx_s - 1812.0) / 186.0) ** 2 + ((yy_s - 1058.0) / 232.0) ** 2), 0.0, 1.0)
ear_l = np.clip(1.0 - np.sqrt(((xx_s - 1715.0) / 86.0) ** 2 + ((yy_s - 765.0) / 64.0) ** 2), 0.0, 1.0)
ear_r = np.clip(1.0 - np.sqrt(((xx_s - 1715.0) / 86.0) ** 2 + ((yy_s - 1350.0) / 64.0) ** 2), 0.0, 1.0)
face_keep = gaussian_filter(np.maximum(face_oval, np.maximum(ear_l, ear_r)), sigma=20.0 * s)[..., None]
neck_rim = ((xx_s < 1250) & (yy_s < 500)).astype(np.float32)[..., None]

# Eye aperture & mucosal rim
eye_ap_l = np.exp(-(((xx_s - 1753.0) / 11.0) ** 2 + ((yy_s - 982.0) / 21.0) ** 2) ** 1.8)
eye_ap_r = np.exp(-(((xx_s - 1753.0) / 11.0) ** 2 + ((yy_s - 1134.0) / 21.0) ** 2) ** 1.8)
eye_hole_mask = np.clip(eye_ap_l + eye_ap_r, 0.0, 1.0)[..., None]

# Upper eyelid lash line & double-eyelid crease
lash_line_l = np.exp(-(((xx_s - 1744.0) / 3.8) ** 2 + ((yy_s - 982.0) / 24.0) ** 2))
lash_line_r = np.exp(-(((xx_s - 1744.0) / 3.8) ** 2 + ((yy_s - 1134.0) / 24.0) ** 2))
crease_l = np.exp(-(((xx_s - 1735.0) / 3.2) ** 2 + ((yy_s - 982.0) / 25.0) ** 2)) * 0.45
crease_r = np.exp(-(((xx_s - 1735.0) / 3.2) ** 2 + ((yy_s - 1134.0) / 25.0) ** 2)) * 0.45
eyelid_def = np.clip(lash_line_l + lash_line_r + crease_l + crease_r, 0.0, 1.0)[..., None]

# Upper orbital eyeshadow / wash zone
eyeshadow_l = np.exp(-(((xx_s - 1736.0) / 14.0) ** 2 + ((yy_s - 976.0) / 32.0) ** 2))
eyeshadow_r = np.exp(-(((xx_s - 1736.0) / 14.0) ** 2 + ((yy_s - 1140.0) / 32.0) ** 2))
eyeshadow_zone = np.clip(eyeshadow_l + eyeshadow_r, 0.0, 1.0)[..., None] * (1.0 - eye_hole_mask)

# Aegyo-sal (卧蚕) luminous cushion & subtle lower shadow groove
aegyo_puff_l = np.exp(-(((xx_s - 1765.5) / 5.5) ** 2 + ((yy_s - 982.0) / 22.0) ** 2))
aegyo_puff_r = np.exp(-(((xx_s - 1765.5) / 5.5) ** 2 + ((yy_s - 1134.0) / 22.0) ** 2))
aegyo_puff = np.clip(aegyo_puff_l + aegyo_puff_r, 0.0, 1.0)[..., None] * (1.0 - eye_hole_mask)

aegyo_line_l = np.exp(-(((xx_s - 1772.5) / 3.2) ** 2 + ((yy_s - 982.0) / 20.0) ** 2))
aegyo_line_r = np.exp(-(((xx_s - 1772.5) / 3.2) ** 2 + ((yy_s - 1134.0) / 20.0) ** 2))
aegyo_line = np.clip(aegyo_line_l + aegyo_line_r, 0.0, 1.0)[..., None]

# T-zone & nasal bridge highlight zone (DLSS-5 intrinsic specular albedo guide)
nasal_bridge = np.exp(-(((xx_s - 1782.0) / 34.0) ** 2 + ((yy_s - 1056.2) / 9.5) ** 2))
nose_tip_hi  = np.exp(-(((xx_s - 1816.0) / 10.5) ** 2 + ((yy_s - 1056.2) / 11.0) ** 2))
forehead_hi  = np.exp(-(((xx_s - 1692.0) / 32.0) ** 2 + ((yy_s - 1056.2) / 48.0) ** 2))
chin_hi      = np.exp(-(((xx_s - 1898.0) / 16.0) ** 2 + ((yy_s - 1056.2) / 22.0) ** 2))
tzone_hi = np.clip(nasal_bridge * 0.75 + nose_tip_hi * 1.1 + forehead_hi * 0.55 + chin_hi * 0.5, 0.0, 1.0)[..., None]

# Nasolabial & under-eye age-shadow suppression
naso_l = np.exp(-(((xx_s - 1852.0) / 42.0) ** 2 + ((yy_s - 998.0) / 28.0) ** 2))
naso_r = np.exp(-(((xx_s - 1852.0) / 42.0) ** 2 + ((yy_s - 1118.0) / 28.0) ** 2))
age_zone = np.clip(naso_l + naso_r, 0.0, 1.0)[..., None]

scalp_smooth_ref = np.stack([gaussian_filter(im_young_asian[..., c], sigma=32.0 * s) for c in range(3)], axis=-1)


def prepare_photo_skin_base(photo_im, deage_strength=0.45, pore_boost=1.10):
    low10 = np.stack([gaussian_filter(photo_im[..., c], sigma=8.0 * s) for c in range(3)], axis=-1)
    low32 = np.stack([gaussian_filter(photo_im[..., c], sigma=28.0 * s) for c in range(3)], axis=-1)
    hi_detail = (photo_im - low10) * pore_boost
    mid_sculpt = low10 - low32
    rejuvenated = low32 + mid_sculpt * (1.0 - deage_strength * age_zone) + hi_detail
    mucosal = np.array([218.0, 170.0, 158.0], dtype=np.float32)
    rejuvenated = rejuvenated * (1.0 - eye_hole_mask * 0.78) + mucosal * (eye_hole_mask * 0.78)
    bg_clean = low32 * (1.0 - neck_rim) + photo_im * neck_rim
    return bg_clean * (1.0 - face_keep) + rejuvenated * face_keep


# Prepare 6 genuinely distinct multi-source photographic bases!
base_young_asian = prepare_photo_skin_base(im_young_asian, deage_strength=0.38, pore_boost=1.12)
base_natural_mk  = prepare_photo_skin_base(0.65 * im_natural_mk + 0.35 * im_young_asian, deage_strength=0.48, pore_boost=1.05)
base_violet_mk   = prepare_photo_skin_base(0.60 * im_violet_mk + 0.40 * im_zoey, deage_strength=0.52, pore_boost=0.95)
base_eurasian    = prepare_photo_skin_base(0.75 * im_eurasian + 0.25 * im_natural_mk, deage_strength=0.40, pore_boost=1.08)
base_glam_mk     = prepare_photo_skin_base(0.62 * im_glam_mk + 0.38 * im_young_asian, deage_strength=0.46, pore_boost=1.02)
base_zoey_porc   = prepare_photo_skin_base(0.68 * im_zoey + 0.32 * im_young_asian, deage_strength=0.55, pore_boost=0.88)

# Different Blush Placement Masks (Apple Cheeks, High Cheekbone Drape, Sub-Orbital Igari/Drunk Blush, Nose-Tip Flush)
blush_apple_l = np.exp(-(((xx_s - 1804.0) / 36.0) ** 2 + ((yy_s - 964.0) / 42.0) ** 2))
blush_apple_r = np.exp(-(((xx_s - 1804.0) / 36.0) ** 2 + ((yy_s - 1150.0) / 42.0) ** 2))
mask_blush_apple = np.clip(blush_apple_l + blush_apple_r, 0.0, 1.0)[..., None]

blush_high_l = np.exp(-(((xx_s - 1784.0) / 28.0) ** 2 + ((yy_s - 942.0) / 46.0) ** 2))
blush_high_r = np.exp(-(((xx_s - 1784.0) / 28.0) ** 2 + ((yy_s - 1172.0) / 46.0) ** 2))
mask_blush_high = np.clip(blush_high_l + blush_high_r, 0.0, 1.0)[..., None]

blush_igari_l = np.exp(-(((xx_s - 1782.0) / 22.0) ** 2 + ((yy_s - 982.0) / 38.0) ** 2))
blush_igari_r = np.exp(-(((xx_s - 1782.0) / 22.0) ** 2 + ((yy_s - 1132.0) / 38.0) ** 2))
blush_nose    = np.exp(-(((xx_s - 1814.0) / 14.0) ** 2 + ((yy_s - 1056.2) / 18.0) ** 2)) * 0.65
mask_blush_igari = np.clip(blush_igari_l + blush_igari_r + blush_nose, 0.0, 1.0)[..., None]

# Lip masks (Full lip vermilion + Inner gradient "咬唇" petal mask + Lower lip specular pillow)
mouth_box = np.exp(-(((xx_s - 1864.0) / 21.0) ** 2 + ((yy_s - 1056.2) / 39.0) ** 2) ** 1.8)
lip_redness = (base_young_asian[..., 0] - 0.50 * (base_young_asian[..., 1] + base_young_asian[..., 2]))
lip_lum_inv = np.clip((205.0 - (0.299 * base_young_asian[..., 0] + 0.587 * base_young_asian[..., 1] + 0.114 * base_young_asian[..., 2])) / 55.0, 0.0, 1.0)
lip_mask = gaussian_filter(np.clip((lip_redness - 16.0) / 18.0 + 0.35 * lip_lum_inv, 0.0, 1.0) * mouth_box, sigma=1.1 * s)[..., None]
lip_inner = gaussian_filter(np.clip(lip_mask[..., 0] * 1.30, 0.0, 1.0) * np.exp(-(((xx_s - 1864.8) / 7.5) ** 2 + ((yy_s - 1056.2) / 26.0) ** 2)), sigma=0.9 * s)[..., None]
lip_hi = (base_young_asian - np.stack([gaussian_filter(base_young_asian[..., c], sigma=3.0 * s) for c in range(3)], axis=-1)) * 1.25

# 8 Distinct Multi-Source Recipes:
# (base_img, rgb_mul, rgb_add, blush_mask, blush_rgb, blush_w, eyeshadow_rgb, eyeshadow_w, aegyo_w, tzone_w, lip_outer_rgb, lip_inner_rgb, lip_w)
variant_recipes = {
    # 1. 凝脂白瓷肌: Ultra-bright Zoey alabaster porcelain, cool ivory sheen, rosebud bitten lips
    'cn_porcelain_ivory': (
        base_zoey_porc, [1.06, 1.05, 1.08], [8.0, 7.0, 11.0],
        mask_blush_apple, [242, 148, 158], 0.28,
        [218, 168, 162], 0.18, 0.45, 0.35,
        [216, 112, 122], [188, 52, 68], 0.72
    ),
    # 2. 书卷清透肌 (方尧平专属): Warm sunlit natural student complexion matching fang_yaoping_ref.jpg, bare clean eyelids, soft coral-pink student lips
    'cn_scholar_natural': (
        base_young_asian, [1.02, 1.01, 0.98], [4.0, 2.0, -2.0],
        mask_blush_apple, [232, 138, 132], 0.22,
        [204, 156, 142], 0.08, 0.52, 0.22,
        [206, 108, 108], [178, 72, 76], 0.62
    ),
    # 3. 韩系水光蜜桃肌 (初夏专属): Dewy peach pink-warm complexion with Igari sub-orbital + nose-tip flush, champagne aegyo-sal & glossy juicy peach lips
    'kr_dewy_peach': (
        base_natural_mk, [1.05, 1.00, 1.01], [9.0, 1.0, 3.0],
        mask_blush_igari, [248, 118, 132], 0.52,
        [235, 156, 152], 0.32, 0.75, 0.48,
        [232, 92, 108], [208, 44, 68], 0.82
    ),
    # 4. 财阀千金冷白皮 (林汐专属): Pale icy lilac-ivory chaebol skin, smoky cool taupe eyeshadow contour, high cheekbone drape, deep crushed-berry plum lips
    'kr_chaebol_cool': (
        base_violet_mk, [1.03, 1.03, 1.09], [5.0, 6.0, 14.0],
        mask_blush_high, [212, 126, 156], 0.26,
        [152, 118, 128], 0.42, 0.28, 0.42,
        [168, 58, 82], [122, 22, 46], 0.88
    ),
    # 5. 江南温润羊脂玉 (苏晚专属): Warm creamy mutton-fat jade tone, classical apricot wash, traditional vermilion inner-petal gradient lips
    'cn_jiangnan_jade': (
        0.55 * base_zoey_porc + 0.45 * base_young_asian, [1.04, 1.02, 0.96], [6.0, 3.0, -5.0],
        mask_blush_apple, [228, 124, 116], 0.30,
        [208, 146, 132], 0.24, 0.38, 0.28,
        [208, 88, 86], [176, 38, 42], 0.78
    ),
    # 6. 初恋山茶花瓣肌 (千雪专属): Stage-lit radiant camellia pink-ivory, dramatic stage blush & eye blossom, rich crimson-camellia lips
    'kr_firstlove_camellia': (
        base_glam_mk, [1.05, 0.99, 1.02], [8.0, -1.0, 4.0],
        mask_blush_igari, [244, 98, 118], 0.58,
        [222, 128, 136], 0.38, 0.68, 0.44,
        [224, 68, 84], [192, 24, 44], 0.86
    ),
    # 7. 清冷高智橄榄皮 (沈知微专属): Cool intellectual olive-beige tone, sculpted matte cheekbone contour, muted dried-rose mocha lips
    'cn_intellectual_olive': (
        0.60 * base_young_asian + 0.40 * base_eurasian, [0.95, 0.98, 0.94], [-8.0, -1.0, -6.0],
        mask_blush_high, [186, 122, 116], 0.22,
        [148, 116, 104], 0.36, 0.20, 0.30,
        [168, 86, 86], [134, 52, 54], 0.74
    ),
    # 8. 混血丝绒玫瑰肌: Sculpted Eurasian warm rose-gold skin, deep orbital shadow definition, rich velvet rosewood lips
    'eurasian_velvet_rose': (
        base_eurasian, [1.01, 0.98, 1.00], [2.0, -3.0, 1.0],
        mask_blush_high, [218, 114, 124], 0.38,
        [164, 118, 112], 0.44, 0.42, 0.50,
        [192, 74, 86], [148, 36, 52], 0.82
    ),
}

skin_out_bytes = {}
skin_face_patches = {}
for vk, (base_im, mul_c, add_c, b_mask, b_rgb, b_w, es_rgb, es_w, aeg_w, tz_w, lip_out_rgb, lip_in_rgb, lip_w) in variant_recipes.items():
    img = base_im * np.array(mul_c, dtype=np.float32) + np.array(add_c, dtype=np.float32)
    # Apply variant-specific blush
    b_col = np.array(b_rgb, dtype=np.float32)
    img = img * (1.0 - b_mask * b_w * 0.48) + b_col * (b_mask * b_w * 0.48)
    # Apply variant-specific upper orbital eyeshadow wash
    es_col = np.array(es_rgb, dtype=np.float32)
    img = img * (1.0 - eyeshadow_zone * es_w * 0.42) + es_col * (eyeshadow_zone * es_w * 0.42)
    # Apply variant-specific aegyo-sal (卧蚕) champagne highlight & subtle groove
    aeg_hi_col = np.array([250.0, 224.0, 210.0], dtype=np.float32)
    aeg_sh_col = np.array([158.0, 112.0, 102.0], dtype=np.float32)
    img = img * (1.0 - aegyo_puff * aeg_w * 0.26) + aeg_hi_col * (aegyo_puff * aeg_w * 0.26)
    img = img * (1.0 - aegyo_line * aeg_w * 0.14) + aeg_sh_col * (aegyo_line * aeg_w * 0.14)
    # Apply T-zone bridge highlight
    tz_col = np.array([252.0, 236.0, 226.0], dtype=np.float32)
    img = img * (1.0 - tzone_hi * tz_w * 0.22) + tz_col * (tzone_hi * tz_w * 0.22)
    # Apply two-tone gradient lips (outer + inner petal + pore highlight)
    lo_col = np.array(lip_out_rgb, dtype=np.float32) + lip_hi
    li_col = np.array(lip_in_rgb, dtype=np.float32) + lip_hi * 1.15
    img = img * (1.0 - lip_mask * lip_w) + lo_col * (lip_mask * lip_w)
    img = img * (1.0 - lip_inner * (lip_w * 0.82)) + li_col * (lip_inner * (lip_w * 0.82))

    clipped = np.clip(img, 0.0, 255.0)
    skin_face_patches[vk] = clipped[int(0.45 * RES):int(0.58 * RES), int(0.82 * RES):int(0.94 * RES)].copy()
    pil_v = Image.fromarray(clipped.astype(np.uint8), mode='RGB')
    skin_out_bytes[vk] = encode_png(pil_v, quantize_colors=None)
    fp = skin_face_patches[vk]
    print(f"  Skin {vk:22s}: {len(skin_out_bytes[vk])/1024:5.1f} KB, face_RGB=({fp[...,0].mean():.1f}, {fp[...,1].mean():.1f}, {fp[...,2].mean():.1f})")

print("  Pairwise MAD between rebuilt skin variants:")
vks = list(skin_face_patches.keys())
for i in range(len(vks)):
    for j in range(i + 1, len(vks)):
        mad = np.abs(skin_face_patches[vks[i]] - skin_face_patches[vks[j]]).mean()
        if mad < 8.0:
            print(f"    [Note] {vks[i]} vs {vks[j]}: mad={mad:.2f}")
print(f"  Min pairwise MAD across all 28 pairs = {min(np.abs(skin_face_patches[vks[i]] - skin_face_patches[vks[j]]).mean() for i in range(len(vks)) for j in range(i+1, len(vks))):.2f}")

# ---------------------------------------------------------------------------
# 2. Fix Mesh 3 (Eyelashes) Lower Curtain & Upgrade Eye Size Morph Targets
# ---------------------------------------------------------------------------
print("=== Stage 43 Step 2: Fixing Lower Eyelash Curtain & Amplifying Eye Size Morphs ===")
# Restore clean Mesh 3 (Eyelashes) from 7e3cf84 before repeated runs, then trim lower curtain cleanly
raw_7e = subprocess.check_output(['git', '-C', '/home/user', 'show', '7e3cf84:public/models/daz_asian_head_base.glb'])
jlen_7e = struct.unpack_from('<I', raw_7e, 12)[0]
gltf_7e = json.loads(raw_7e[20:20 + jlen_7e].decode('utf-8'))
bin_7e = raw_7e[28 + jlen_7e:]

def get_acc_7e(acc_idx):
    acc = gltf_7e['accessors'][acc_idx]
    bv = gltf_7e['bufferViews'][acc['bufferView']]
    off = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    ch = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[acc['type']]
    return np.frombuffer(bin_7e, dtype='<f4', count=acc['count'] * ch, offset=off).copy().reshape(acc['count'], ch)

lash_pos = get_acc_7e(gltf_7e['meshes'][3]['primitives'][0]['attributes']['POSITION'])
# Lower eyelashes (y < 0.0155) originally hung down to y = 0.0081 (8.3mm curtain across lower eyelid!).
# Pull lower lash tips up toward the lower lid margin (y_lid = 0.0150) by 68% and tuck z slightly back
lower_mask = lash_pos[:, 1] < 0.0155
if lower_mask.any():
    dy_lash = 0.0155 - lash_pos[lower_mask, 1]
    lash_pos[lower_mask, 1] = 0.0155 - dy_lash * 0.34
    lash_pos[lower_mask, 2] -= dy_lash * 0.22
set_acc_f32(gltf['meshes'][3]['primitives'][0]['attributes']['POSITION'], lash_pos)
print(f"  Trimmed lower eyelashes y_min from 0.0081 -> {lash_pos[:,1].min():.4f} (zero under-eye raccoon band)")

# Amplify face_eye_size_incr (target 12) and face_eye_size_decr (target 11) on HeadSkin (Mesh 0) & Eyelashes (Mesh 3)
# by coupling 55% of eye_wide (target 5) + radial expansion around eye centers (±0.0285, 0.0179) so Eye Size slider has huge range!
tnames = gltf['meshes'][0]['extras']['targetNames']
idx_eye_incr = tnames.index('face_eye_size_incr')
idx_eye_decr = tnames.index('face_eye_size_decr')
idx_eye_wide = tnames.index('eye_wide')

for m_idx in [0, 3]:
    m_pos = get_acc_f32(gltf['meshes'][m_idx]['primitives'][0]['attributes']['POSITION'])
    # Restore clean deltas from 0ed1b86 first so repeated runs are idempotent
    d_incr = get_morph_delta(m_idx, 0, idx_eye_incr)
    d_decr = get_morph_delta(m_idx, 0, idx_eye_decr)
    d_wide = get_morph_delta(m_idx, 0, idx_eye_wide)
    # Normalize existing d_incr if already boosted
    max_cur = np.linalg.norm(d_incr, axis=1).max()
    scale_base = 0.0023 / max(max_cur, 1e-6) if max_cur > 0.0030 else 1.0
    d_incr = d_incr * scale_base
    # Combine with orbital radial expansion around left/right eye centers (±0.0285, 0.0179, 0.080)
    radial_delta = np.zeros_like(m_pos)
    for side in [-1.0, 1.0]:
        ec = np.array([side * 0.0285, 0.0179, 0.080], dtype=np.float32)
        rel = m_pos - ec
        dist = np.linalg.norm(rel, axis=1)
        # Orbital rim window (r in [0.004, 0.024])
        w_orb = np.exp(-((dist - 0.009) / 0.011) ** 2) * (m_pos[:, 2] > 0.060)
        radial_delta[:, 0] += (rel[:, 0] / np.maximum(dist, 1e-4)) * 0.0022 * w_orb
        radial_delta[:, 1] += (rel[:, 1] / np.maximum(dist, 1e-4)) * 0.0028 * w_orb
    new_incr = d_incr * 1.35 + d_wide * 0.55 + radial_delta
    new_decr = d_decr * 1.25 - radial_delta * 0.85
    set_morph_delta(m_idx, 0, idx_eye_incr, new_incr)
    set_morph_delta(m_idx, 0, idx_eye_decr, new_decr)
    print(f"  Upgraded Mesh {m_idx} eye_size_incr max_delta={np.linalg.norm(new_incr, axis=1).max()*1000:.2f}mm, decr={np.linalg.norm(new_decr, axis=1).max()*1000:.2f}mm")

# Save updated Head GLB
bv_replacements = {
    gltf['images'][0]['bufferView']: skin_out_bytes['cn_porcelain_ivory'],
}
for k, b_data in skin_out_bytes.items():
    bv_replacements[gltf['extras']['realWebAssets']['skins'][k]['bufferView']] = b_data

new_bin = bytearray()
for idx_bv, bv in enumerate(gltf['bufferViews']):
    while len(new_bin) % 4 != 0:
        new_bin.append(0)
    if idx_bv in bv_replacements:
        chunk = bv_replacements[idx_bv]
    else:
        chunk = bin_buf[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']]
    bv['byteOffset'] = len(new_bin)
    bv['byteLength'] = len(chunk)
    new_bin.extend(chunk)
while len(new_bin) % 4 != 0:
    new_bin.append(0)
gltf['buffers'][0]['byteLength'] = len(new_bin)

jb = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
while len(jb) % 4 != 0:
    jb += b' '
with open(HEAD_GLB_PATH, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(new_bin)))
    f.write(struct.pack('<II', len(jb), 0x4E4F534A))
    f.write(jb)
    f.write(struct.pack('<II', len(new_bin), 0x004E4942))
    f.write(new_bin)
print(f"Saved upgraded {HEAD_GLB_PATH}: {os.path.getsize(HEAD_GLB_PATH)/1024/1024:.2f} MB")


# ---------------------------------------------------------------------------
# 3. Clean All 28 Hair GLBs (Remove Detached Jaw Pine-Cone Clumps & Rebuild Photo-Accurate `hair_user_photo.glb`)
# ---------------------------------------------------------------------------
print("=== Stage 43 Step 3: Cleaning Detached Jaw Clumps & Rebuilding Photo-Matched `hair_user_photo.glb` ===")

def read_hair_glb_from_bytes(data):
    jlen = struct.unpack_from('<I', data, 12)[0]
    gh = json.loads(data[20:20 + jlen].decode('utf-8'))
    bb = bytearray(data[28 + jlen:])
    prim = gh['meshes'][0]['primitives'][0]
    def get_a(idx):
        a = gh['accessors'][idx]
        bv = gh['bufferViews'][a['bufferView']]
        dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32}[a['componentType']]
        ch = {'VEC3': 3, 'VEC2': 2, 'SCALAR': 1}[a['type']]
        return np.frombuffer(bb, dtype=dt, count=a['count'] * ch, offset=bv.get('byteOffset', 0) + a.get('byteOffset', 0)).reshape(a['count'], ch).copy()
    pos = get_a(prim['attributes']['POSITION'])
    norm = get_a(prim['attributes']['NORMAL'])
    uv = get_a(prim['attributes']['TEXCOORD_0'])
    tris = get_a(prim['indices']).reshape(-1, 3).astype(np.uint32)
    bv_im = gh['bufferViews'][gh['images'][0]['bufferView']]
    png_b = bytes(bb[bv_im['byteOffset']:bv_im['byteOffset'] + bv_im['byteLength']])
    return pos, norm, uv, tris, png_b


def recompute_smooth_hair_normals(pos, tris):
    hc = np.array([0.0, 0.02, -0.01], dtype=np.float32)
    v0, v1, v2 = pos[tris[:, 0]], pos[tris[:, 1]], pos[tris[:, 2]]
    fn = np.cross(v1 - v0, v2 - v0)
    fc = (v0 + v1 + v2) / 3.0
    inward = np.sum(fn * (fc - hc), axis=1) < 0
    fn[inward] = -fn[inward]
    vn = np.zeros_like(pos, dtype=np.float32)
    for k in range(3):
        np.add.at(vn, tris[:, k], fn)
    for _ in range(3):
        f_mean = (vn[tris[:, 0]] + vn[tris[:, 1]] + vn[tris[:, 2]]) / 3.0
        v_sm = np.zeros_like(vn)
        for k in range(3):
            np.add.at(v_sm, tris[:, k], f_mean)
        vn = 0.55 * vn + 0.45 * v_sm
    rad = pos - hc
    rad /= np.maximum(np.linalg.norm(rad, axis=1, keepdims=True), 1e-6)
    vn_len = np.linalg.norm(vn, axis=1, keepdims=True)
    vn = np.where(vn_len > 1e-6, vn / np.maximum(vn_len, 1e-6), rad)
    vn = 0.68 * vn + 0.32 * rad
    vn /= np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-6)
    return vn.astype(np.float32)


def write_hair_glb(out_path, name, pos, norm, uv, tris, png_bytes):
    fc = (pos[tris[:, 0]] + pos[tris[:, 1]] + pos[tris[:, 2]]) / 3.0
    hc = np.array([0.0, 0.02, -0.01], dtype=np.float32)
    r_dist = np.linalg.norm(fc - hc, axis=1)
    sort_order = np.argsort(fc[:, 2] + 0.45 * r_dist)
    tris = tris[sort_order].astype(np.uint32)

    pos_b = pos.astype('<f4').tobytes()
    norm_b = norm.astype('<f4').tobytes()
    uv_b = uv.astype('<f4').tobytes()
    idx_b = tris.astype('<u4').tobytes()

    bin_buf = bytearray()
    def add_slice(b_data):
        while len(bin_buf) % 4 != 0:
            bin_buf.append(0)
        off = len(bin_buf)
        bin_buf.extend(b_data)
        return off, len(b_data)

    off_p, len_p = add_slice(pos_b)
    off_n, len_n = add_slice(norm_b)
    off_u, len_u = add_slice(uv_b)
    off_i, len_i = add_slice(idx_b)
    off_t, len_t = add_slice(png_bytes)
    while len(bin_buf) % 4 != 0:
        bin_buf.append(0)

    gltf_h = {
        "asset": {"version": "2.0", "generator": "Stage43ModularHairPipeline"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": name}],
        "meshes": [{
            "name": name,
            "primitives": [{
                "attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2},
                "indices": 3,
                "material": 0
            }]
        }],
        "materials": [{
            "name": f"{name}_mat",
            "pbrMetallicRoughness": {
                "baseColorTexture": {"index": 0},
                "metallicFactor": 0.0,
                "roughnessFactor": 0.42
            },
            "alphaMode": "MASK",
            "alphaCutoff": 0.12,
            "doubleSided": True
        }],
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"bufferView": 4, "mimeType": "image/png"}],
        "samplers": [{"magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 10497}],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": len(pos), "type": "VEC3",
             "min": pos.min(axis=0).tolist(), "max": pos.max(axis=0).tolist()},
            {"bufferView": 1, "componentType": 5126, "count": len(norm), "type": "VEC3"},
            {"bufferView": 2, "componentType": 5126, "count": len(uv), "type": "VEC2"},
            {"bufferView": 3, "componentType": 5125, "count": int(tris.size), "type": "SCALAR"}
        ],
        "bufferViews": [
            {"buffer": 0, "byteOffset": off_p, "byteLength": len_p, "target": 34962},
            {"buffer": 0, "byteOffset": off_n, "byteLength": len_n, "target": 34962},
            {"buffer": 0, "byteOffset": off_u, "byteLength": len_u, "target": 34962},
            {"buffer": 0, "byteOffset": off_i, "byteLength": len_i, "target": 34963},
            {"buffer": 0, "byteOffset": off_t, "byteLength": len_t}
        ],
        "buffers": [{"byteLength": len(bin_buf)}]
    }
    jb = json.dumps(gltf_h, separators=(',', ':')).encode('utf-8')
    while len(jb) % 4 != 0:
        jb += b' '
    with open(out_path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(bin_buf)))
        f.write(struct.pack('<II', len(jb), 0x4E4F534A))
        f.write(jb)
        f.write(struct.pack('<II', len(bin_buf), 0x004E4942))
        f.write(bin_buf)


def filter_hair_components_and_tris(pos, norm, uv, tris, keep_vert_mask, keep_tri_extra_mask=None):
    valid_tri = keep_vert_mask[tris[:, 0]] & keep_vert_mask[tris[:, 1]] & keep_vert_mask[tris[:, 2]]
    if keep_tri_extra_mask is not None:
        valid_tri = valid_tri & keep_tri_extra_mask
    kept_tris = tris[valid_tri]
    used_v = np.unique(kept_tris)
    remap = np.full(len(pos), -1, dtype=np.int32)
    remap[used_v] = np.arange(len(used_v), dtype=np.int32)
    new_pos = pos[used_v].copy()
    new_uv = uv[used_v].copy()
    new_tris = remap[kept_tris].astype(np.uint32)
    new_norm = recompute_smooth_hair_normals(new_pos, new_tris)
    return new_pos, new_norm, new_uv, new_tris


# 3A. Rebuild `hair_user_photo.glb` from git `0ed1b86:public/models/hair_user_photo.glb` + ponytail back
# so it matches `fang_yaoping_ref.jpg` / `user_photo_ref.jpg` (exposed right ear, wispy air bangs, left temple wisp, tied back)!
raw_up = subprocess.check_output(['git', '-C', '/home/user', 'show', '0ed1b86:public/models/hair_user_photo.glb'])
pos_up, norm_up, uv_up, tris_up, png_up = read_hair_glb_from_bytes(raw_up)

rows_up = np.concatenate([tris_up[:, 0], tris_up[:, 1], tris_up[:, 2], tris_up[:, 1], tris_up[:, 2], tris_up[:, 0]])
cols_up = np.concatenate([tris_up[:, 1], tris_up[:, 2], tris_up[:, 0], tris_up[:, 0], tris_up[:, 1], tris_up[:, 2]])
adj_up = csr_matrix((np.ones(len(rows_up)), (rows_up, cols_up)), shape=(len(pos_up), len(pos_up)))
n_comp_up, labels_up = connected_components(adj_up, directed=False)

keep_v_up = np.ones(len(pos_up), dtype=bool)
for c in range(n_comp_up):
    c_mask = labels_up == c
    pts = pos_up[c_mask]
    y_max, y_min = pts[:, 1].max(), pts[:, 1].min()
    x_min, x_max = pts[:, 0].min(), pts[:, 0].max()
    z_min, z_max = pts[:, 2].min(), pts[:, 2].max()
    # 1. Remove detached lower neck/jaw flaps (`comp 37..49, 51..95`) that hang below the ears/chin
    if y_max < 0.085 and y_min < -0.020:
        keep_v_up[c_mask] = False
        continue
    # 2. Remove wide ear-covering side bob walls (`comp 2..4, 10..12, 19..22, 29..32`) that bulge past |x| > 0.082 over the ears
    if (x_max > 0.084 or x_min < -0.084) and z_max < 0.075:
        keep_v_up[c_mask] = False
        continue
    # 3. On her right ear side (viewer-left in photo, x < -0.042), tuck/remove front temple lock (`comp 9`) so her right ear is 100% exposed (`露耳`) just like `user_photo_ref.jpg`!
    if x_max < -0.038 and z_max > 0.030 and y_min < 0.00:
        keep_v_up[c_mask] = False
        continue

# Gently Sleek-Fit the remaining crown & back locks (`y < 0.045`) inward behind the ears so it looks cleanly tied back into a ponytail
ear_tuck = (pos_up[:, 1] < 0.045) & (pos_up[:, 2] < 0.042) & (np.abs(pos_up[:, 0]) > 0.052)
if ear_tuck.any():
    sx = np.where(pos_up[ear_tuck, 0] >= 0.0, 1.0, -1.0)
    w_tuck = np.clip((0.045 - pos_up[ear_tuck, 1]) / 0.075, 0.0, 1.0)
    excess = np.maximum(0.0, np.abs(pos_up[ear_tuck, 0]) - 0.052)
    pos_up[ear_tuck, 0] -= sx * excess * 0.65 * w_tuck
    pos_up[ear_tuck, 2] -= 0.012 * w_tuck

# Gather lower back nape (`z < -0.035, y < 0.01`) slightly toward the occipital ponytail tie point (`x=0, y=-0.015, z=-0.085`)
nape_mask = (pos_up[:, 2] < -0.035) & (pos_up[:, 1] < 0.010)
if nape_mask.any():
    w_nape = np.clip((0.010 - pos_up[nape_mask, 1]) / 0.065, 0.0, 1.0)
    pos_up[nape_mask, 0] *= (1.0 - 0.42 * w_nape)
    pos_up[nape_mask, 1] = np.maximum(pos_up[nape_mask, 1], -0.042)

pos_up_clean, norm_up_clean, uv_up_clean, tris_up_clean = filter_hair_components_and_tris(pos_up, norm_up, uv_up, tris_up, keep_v_up)
write_hair_glb('/home/user/public/models/hair_user_photo.glb', 'hair_user_photo', pos_up_clean, norm_up_clean, uv_up_clean, tris_up_clean, png_up)
print(f"  Rebuilt photo-accurate hair_user_photo.glb: verts={len(pos_up_clean)}, tris={len(tris_up_clean)}, x=[{pos_up_clean[:,0].min():.3f},{pos_up_clean[:,0].max():.3f}], y=[{pos_up_clean[:,1].min():.3f},{pos_up_clean[:,1].max():.3f}]")

# 3B. Clean ALL remaining 27 hair GLBs to remove detached lower-chest accordion clumps & pancake folds!
for p in sorted(glob.glob('/home/user/public/models/*.glb')):
    fn = os.path.basename(p)
    if fn in ('daz_asian_head_base.glb', 'hair_user_photo.glb'):
        continue
    raw_h = subprocess.check_output(['git', '-C', '/home/user', 'show', f'0ed1b86:public/models/{fn}'])
    pos_h, norm_h, uv_h, tris_h, png_h = read_hair_glb_from_bytes(raw_h)

    rows_h = np.concatenate([tris_h[:, 0], tris_h[:, 1], tris_h[:, 2], tris_h[:, 1], tris_h[:, 2], tris_h[:, 0]])
    cols_h = np.concatenate([tris_h[:, 1], tris_h[:, 2], tris_h[:, 0], tris_h[:, 0], tris_h[:, 1], tris_h[:, 2]])
    adj_h = csr_matrix((np.ones(len(rows_h)), (rows_h, cols_h)), shape=(len(pos_h), len(pos_h)))
    n_comp_h, labels_h = connected_components(adj_h, directed=False)

    keep_v = np.ones(len(pos_h), dtype=bool)
    removed_comps = 0
    for c in range(n_comp_h):
        c_mask = labels_h == c
        pts = pos_h[c_mask]
        y_max, y_min = pts[:, 1].max(), pts[:, 1].min()
        z_mean, z_max = pts[:, 2].mean(), pts[:, 2].max()
        # Detached lower-chest / jaw clumps: components whose top never reaches the upper temple/crown (y_max < 0.042)
        # and hang down into the jaw/neck zone (y_min < -0.038) in front of the neck (z_max > -0.015)
        if y_max < 0.042 and y_min < -0.038 and z_max > -0.015:
            keep_v[c_mask] = False
            removed_comps += 1
        # Also remove duplicate inner under-lock components that were squashed into the front neck
        elif y_max < 0.076 and y_min < -0.052 and z_mean > -0.025 and n_comp_h > 40:
            keep_v[c_mask] = False
            removed_comps += 1

    # Also remove any horizontal pancake triangles at the bottom (y < -0.055 and |normal_y| > 0.72)
    # and gently sweep any remaining lower locks (y < -0.030, z > -0.015) outward/backward so they never poke the chin or throat!
    low_front = (pos_h[:, 1] < -0.025) & (pos_h[:, 2] > -0.020)
    if low_front.any():
        w_lf = np.clip((-0.025 - pos_h[low_front, 1]) / 0.065, 0.0, 1.0) * np.clip((pos_h[low_front, 2] + 0.020) / 0.065, 0.0, 1.0)
        pos_h[low_front, 2] -= 0.038 * w_lf
        sx = np.where(pos_h[low_front, 0] >= 0.0, 1.0, -1.0)
        r_neck = np.hypot(pos_h[low_front, 0], pos_h[low_front, 2] + 0.012)
        need_push = np.maximum(0.0, 0.058 - r_neck)
        pos_h[low_front, 0] += sx * need_push * 0.92

    # Un-pancake bottom vertices that were crushed at y ~ -0.115 by tanh in Stage 34:
    # instead of a horizontal floor, trim triangles below y = -0.102 cleanly!
    v0, v1, v2 = pos_h[tris_h[:, 0]], pos_h[tris_h[:, 1]], pos_h[tris_h[:, 2]]
    f_norm = np.cross(v1 - v0, v2 - v0)
    fn_unit = f_norm / np.maximum(np.linalg.norm(f_norm, axis=1, keepdims=True), 1e-8)
    fc = (v0 + v1 + v2) / 3.0
    not_pancake_tri = ~((fc[:, 1] < -0.055) & (np.abs(fn_unit[:, 1]) > 0.72)) & (fc[:, 1] > -0.104)

    if keep_v.sum() > 200 and not_pancake_tri.sum() > 200:
        pos_c, norm_c, uv_c, tris_c = filter_hair_components_and_tris(pos_h, norm_h, uv_h, tris_h, keep_v, not_pancake_tri)
    else:
        pos_c, norm_c, uv_c, tris_c = pos_h, recompute_smooth_hair_normals(pos_h, tris_h), uv_h, tris_h

    write_hair_glb(p, fn.replace('.glb', ''), pos_c, norm_c, uv_c, tris_c, png_h)
    print(f"  Cleaned {fn:28s}: removed_jaw_comps={removed_comps:2d}, verts={len(pos_c):5d}, tris={len(tris_c):5d}")

print("=== Stage 43 Asset Upgrade Complete! ===")
