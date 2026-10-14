import struct, json, io, os, glob, gc
import numpy as np
from scipy.ndimage import gaussian_filter, distance_transform_edt
from PIL import Image

print("=== Stage 34 Asset Upgrade: Step 1 - Upgrading daz_asian_head_base.glb Textures ===")
head_path = '/home/user/public/models/daz_asian_head_base.glb'
with open(head_path, 'rb') as f:
    raw = f.read()
jlen = struct.unpack_from('<I', raw, 12)[0]
gltf = json.loads(raw[20:20 + jlen].decode('utf-8'))
bin_buf = bytearray(raw[28 + jlen:])

def get_image_rgba(bv_idx):
    bv = gltf['bufferViews'][bv_idx]
    return Image.open(io.BytesIO(bin_buf[bv['byteOffset']:bv['byteOffset'] + bv['byteLength']])).convert('RGBA')

def encode_png(pil_img, quantize_colors=None):
    bio = io.BytesIO()
    if quantize_colors:
        pil_img.quantize(colors=quantize_colors, method=Image.FASTOCTREE).save(bio, format='PNG', optimize=True)
    else:
        pil_img.save(bio, format='PNG', optimize=True)
    return bio.getvalue()

def dilate_rgb_into_transparent(rgba_arr, thresh=18):
    mask = rgba_arr[..., 3] > thresh
    if not np.any(mask) or np.all(mask):
        return rgba_arr
    _, inds = distance_transform_edt(~mask, return_indices=True)
    out = rgba_arr.copy()
    for c in range(3):
        out[..., c] = rgba_arr[inds[0], inds[1], c]
    return out

# ---------------------------------------------------------------------------
# 1A. Upgrade Image 2 (Eye: Exact Dual Iris UV Islands at (150.5, 358.1) & (361.0, 152.7)!)
# ---------------------------------------------------------------------------
# In Mesh 4 (Eyes):
#   prim 0 (Sclera) & prim 1 (Iris/Pupil) have TWO UV islands:
#     Left eye (+x):  center = (150.5, 358.1), iris radius = 55.5 px (at 512x512)
#     Right eye (-x): center = (361.0, 152.7), iris radius = 55.5 px (at 512x512)
RES_E = 512
yy_e, xx_e = np.mgrid[0:RES_E, 0:RES_E].astype(np.float32)

d_left = np.hypot(xx_e - 150.5, yy_e - 358.1)
d_right = np.hypot(xx_e - 361.0, yy_e - 152.7)
d_nearest = np.minimum(d_left, d_right)

# Clean warm-ivory sclera with anatomical upper/lower eyelid AO & outer canthus pinkness (NO stark white glow!)
sclera_t = np.clip((d_nearest - 54.0) / 68.0, 0.0, 1.0)
dy_nearest = np.where(d_left < d_right, yy_e - 358.1, yy_e - 152.7)
# Top of eye in UV space is dy_nearest < 0 (upper eyelid casts shadow onto upper sclera!)
lid_ao = np.clip(0.84 + 0.16 * np.clip((dy_nearest + 38.0) / 88.0, 0.0, 1.0), 0.72, 1.0)[..., None]
sclera_rgb = np.stack([
    218.0 - 16.0 * sclera_t - 12.0 * (sclera_t ** 2),
    206.0 - 24.0 * sclera_t - 18.0 * (sclera_t ** 2),
    201.0 - 28.0 * sclera_t - 20.0 * (sclera_t ** 2),
], axis=-1) * lid_ao

rng_eye = np.random.RandomState(42)
f1_lut = gaussian_filter(rng_eye.randn(720).astype(np.float32), sigma=1.4, mode='wrap')
f1_lut /= (np.std(f1_lut) + 1e-6)
f2_lut = gaussian_filter(rng_eye.randn(720).astype(np.float32), sigma=4.2, mode='wrap')
f2_lut /= (np.std(f2_lut) + 1e-6)

final_eye = sclera_rgb.copy()
for (cx_i, cy_i) in [(150.5, 358.1), (361.0, 152.7)]:
    dx_i = xx_e - cx_i
    dy_i = yy_e - cy_i  # Note: in UV space, smaller v (-dy_i) is +Y (TOP of eye in 3D!)
    r_px = np.hypot(dx_i, dy_i)
    r_norm = r_px / 55.8
    theta = np.arctan2(dy_i, dx_i)
    ang_idx = (((theta + np.pi) / (2.0 * np.pi) * 720.0) % 720.0).astype(int)

    radial_fibers = np.clip(0.50 + 0.24 * f1_lut[ang_idx] + 0.16 * f2_lut[ang_idx], 0.0, 1.0)
    collarette = np.exp(-((r_norm - 0.50) / 0.16) ** 2)
    limbal_ring = np.clip((r_norm - 0.74) / 0.24, 0.0, 1.0) ** 1.35

    # Rich, deep East Asian dark espresso-amber iris
    iris_warm = np.stack([
        58.0 + 52.0 * radial_fibers + 30.0 * collarette,
        31.0 + 28.0 * radial_fibers + 17.0 * collarette,
        17.0 + 14.0 * radial_fibers + 9.0 * collarette,
    ], axis=-1)
    # Upper eyelid shadow (top of eye is dy_i < 0)
    upper_shade = np.clip(0.68 + 0.34 * ((dy_i + 55.8) / 111.6), 0.54, 1.04)[..., None]
    iris_rgb = iris_warm * (1.0 - 0.78 * limbal_ring[..., None]) * upper_shade

    # Deep jet-black pupil (r_norm < 0.36)
    pupil_mask = np.clip((0.37 - r_norm) / 0.05, 0.0, 1.0)[..., None]
    iris_rgb = iris_rgb * (1.0 - pupil_mask) + np.array([4.0, 4.0, 6.0], dtype=np.float32) * pupil_mask

    # Crisp pinpoint dual studio catchlights in upper-left (-dx_i, -dy_i) and lower-right (+dx_i, +dy_i)
    cl1 = np.exp(-(((dx_i + 15.5) / 4.2) ** 2 + ((dy_i + 16.5) / 3.5) ** 2) ** 1.35)
    cl2 = np.exp(-(((dx_i - 16.0) / 2.4) ** 2 + ((dy_i - 15.0) / 2.1) ** 2) ** 1.35) * 0.55
    catchlight = np.clip(cl1 + cl2, 0.0, 1.0)[..., None]
    iris_rgb = iris_rgb * (1.0 - catchlight) + np.array([252.0, 250.0, 248.0], dtype=np.float32) * catchlight

    # Smooth limbal transition into sclera at r_norm = 1.0 (55.8 px)
    iris_blend = np.clip((1.04 - r_norm) / 0.07, 0.0, 1.0)[..., None]
    final_eye = final_eye * (1.0 - iris_blend) + iris_rgb * iris_blend

eye_out_bytes = encode_png(Image.fromarray(np.clip(final_eye, 0.0, 255.0).astype(np.uint8), mode='RGB'))
print(f"  Upgraded Image 2 (eye) with dual iris UV islands: {len(eye_out_bytes)/1024:.1f} KB")

# ---------------------------------------------------------------------------
# 1B. Upgrade Image 3 (Eyebrow), Image 4 (Eyelash), and 8 realWebAssets.eyebrows
#     with True 8-Bit Feathered Alpha (NO 1-bit palette quantization!)
# ---------------------------------------------------------------------------
def upgrade_eyebrow_rgba(im_pil):
    arr = np.array(im_pil.convert('RGBA'), dtype=np.float32)
    mask = arr[..., 3] > 24.0
    if np.any(mask):
        dist_in = distance_transform_edt(mask).astype(np.float32)
        # Reconstruct smooth 8-bit hair-strand feathering from core to edge
        a_smooth = gaussian_filter(np.clip((dist_in - 0.15) / 1.75, 0.0, 1.0) ** 0.85, sigma=0.55)
        a_final = np.clip(a_smooth * 0.88, 0.0, 0.92)
    else:
        a_final = np.clip(arr[..., 3] / 255.0, 0.0, 0.90)
    lum = (0.299 * arr[..., 0] + 0.587 * arr[..., 1] + 0.114 * arr[..., 2]) / 255.0
    r_c = np.clip(28.0 + lum * 24.0, 22.0, 56.0)
    g_c = np.clip(22.0 + lum * 20.0, 18.0, 46.0)
    b_c = np.clip(21.0 + lum * 18.0, 17.0, 44.0)
    out = np.stack([r_c, g_c, b_c, a_final * 255.0], axis=-1).astype(np.uint8)
    out = dilate_rgb_into_transparent(out, thresh=8)
    return encode_png(Image.fromarray(out, mode='RGBA'), quantize_colors=None)

eb_main_bytes = upgrade_eyebrow_rgba(get_image_rgba(gltf['images'][3]['bufferView']))
el_im = get_image_rgba(gltf['images'][4]['bufferView'])
el_arr = np.array(el_im, dtype=np.float32)
el_mask = el_arr[..., 3] > 24.0
if np.any(el_mask):
    el_dist = distance_transform_edt(el_mask).astype(np.float32)
    # Strip away the bloated 20px binary base halo and keep slender, tapered 8-bit lash strands!
    el_a = gaussian_filter(np.clip((el_dist - 0.55) / 2.15, 0.0, 1.0) ** 1.05, sigma=0.48) * 0.82
else:
    el_a = np.clip((el_arr[..., 3] / 255.0) * 0.82, 0.0, 0.85)
el_out = np.zeros_like(el_arr, dtype=np.uint8)
el_out[..., 0] = 24
el_out[..., 1] = 19
el_out[..., 2] = 20
el_out[..., 3] = np.clip(el_a * 255.0, 0.0, 255.0).astype(np.uint8)
el_out_bytes = encode_png(Image.fromarray(el_out, mode='RGBA'), quantize_colors=None)
print(f"  Upgraded Image 3 (eyebrow, 8-bit RGBA): {len(eb_main_bytes)/1024:.1f} KB, Image 4 (eyelash, 8-bit RGBA): {len(el_out_bytes)/1024:.1f} KB")

eb_assets_bytes = {}
for k, v in gltf['extras']['realWebAssets']['eyebrows'].items():
    eb_assets_bytes[k] = upgrade_eyebrow_rgba(get_image_rgba(v['bufferView']))

# ---------------------------------------------------------------------------
# 1C. Upgrade Image 6 (Teeth: Bright Ivory Enamel + Coral Gums + Full UV Dilation)
# ---------------------------------------------------------------------------
# Extract original teeth from young_asian/head or current Image 6
teeth_im = get_image_rgba(gltf['images'][6]['bufferView']).resize((512, 512), Image.Resampling.LANCZOS)
t_arr = np.array(teeth_im, dtype=np.float32)
t_lum = 0.299 * t_arr[..., 0] + 0.587 * t_arr[..., 1] + 0.114 * t_arr[..., 2]
t_red = t_arr[..., 0] - 0.5 * (t_arr[..., 1] + t_arr[..., 2])

# Tooth enamel crowns have high luminance (>145 in upgraded or >75 in original); gums have higher redness and mid luminance
is_tooth = (t_lum > 145.0) & (t_red < 25.0)
is_gum = (~is_tooth) & (t_lum > 82.0)
valid_island = is_tooth | is_gum

crown_shade = np.clip((t_lum - 135.0) / 105.0, 0.0, 1.0)
ivory_rgb = np.stack([
    218.0 + 30.0 * (crown_shade ** 0.7),
    210.0 + 32.0 * (crown_shade ** 0.7),
    198.0 + 32.0 * (crown_shade ** 0.7),
], axis=-1)
gum_shade = np.clip((t_lum - 70.0) / 95.0, 0.55, 1.05)
gum_rgb = np.stack([
    214.0 * gum_shade,
    118.0 * gum_shade,
    124.0 * gum_shade,
], axis=-1)

t_rgba = np.zeros((512, 512, 4), dtype=np.uint8)
t_rgb = np.where(is_tooth[..., None], ivory_rgb, gum_rgb)
t_rgba[..., :3] = np.clip(t_rgb, 0.0, 255.0).astype(np.uint8)
t_rgba[..., 3] = np.where(valid_island, 255, 0).astype(np.uint8)
t_dilated = dilate_rgb_into_transparent(t_rgba, thresh=10)[..., :3]
teeth_out_bytes = encode_png(Image.fromarray(t_dilated, mode='RGB'), quantize_colors=128)
print(f"  Upgraded Image 6 (teeth): {len(teeth_out_bytes)/1024:.1f} KB, mean RGB={t_dilated.mean(axis=(0,1)).round(1)}")

# ---------------------------------------------------------------------------
# 1D. Rebuild Unblurred 24-bit True-Color Skin Variants (ZERO 256-color posterization!)
# ---------------------------------------------------------------------------
skins_meta = gltf['extras']['realWebAssets']['skins']
im_young_asian = np.array(get_image_rgba(skins_meta['young_asian']['bufferView']).convert('RGB').resize((1024, 1024), Image.Resampling.LANCZOS), dtype=np.float32)
im_eurasian = np.array(get_image_rgba(skins_meta['eurasian']['bufferView']).convert('RGB').resize((1024, 1024), Image.Resampling.LANCZOS), dtype=np.float32)

RES = 1024
s = RES / 2048.0
yy_s, xx_s = np.mgrid[0:RES, 0:RES].astype(np.float32) / s

# Build clean unquantized stubble-free scalp/neck base directly from 24-bit float32
scalp_smooth = np.stack([gaussian_filter(im_young_asian[..., c], sigma=32.0 * s) for c in range(3)], axis=-1)
face_oval = np.clip(1.0 - np.sqrt(((xx_s - 1812.0) / 186.0) ** 2 + ((yy_s - 1058.0) / 232.0) ** 2), 0.0, 1.0)
ear_l = np.clip(1.0 - np.sqrt(((xx_s - 1715.0) / 86.0) ** 2 + ((yy_s - 765.0) / 64.0) ** 2), 0.0, 1.0)
ear_r = np.clip(1.0 - np.sqrt(((xx_s - 1715.0) / 86.0) ** 2 + ((yy_s - 1350.0) / 64.0) ** 2), 0.0, 1.0)
face_keep = gaussian_filter(np.maximum(face_oval, np.maximum(ear_l, ear_r)), sigma=20.0 * s)[..., None]
neck_rim = ((xx_s < 1250) & (yy_s < 500)).astype(np.float32)[..., None]

eye_ap_l = np.exp(-(((xx_s - 1753.0) / 11.0) ** 2 + ((yy_s - 982.0) / 21.0) ** 2) ** 1.8)
eye_ap_r = np.exp(-(((xx_s - 1753.0) / 11.0) ** 2 + ((yy_s - 1134.0) / 21.0) ** 2) ** 1.8)
eye_hole_mask = np.clip(eye_ap_l + eye_ap_r, 0.0, 1.0)[..., None]

lash_line_l = np.exp(-(((xx_s - 1744.0) / 4.2) ** 2 + ((yy_s - 982.0) / 25.0) ** 2))
lash_line_r = np.exp(-(((xx_s - 1744.0) / 4.2) ** 2 + ((yy_s - 1134.0) / 25.0) ** 2))
crease_l = np.exp(-(((xx_s - 1735.0) / 3.5) ** 2 + ((yy_s - 982.0) / 26.0) ** 2)) * 0.45
crease_r = np.exp(-(((xx_s - 1735.0) / 3.5) ** 2 + ((yy_s - 1134.0) / 26.0) ** 2)) * 0.45
eyelid_def = np.clip(lash_line_l + lash_line_r + crease_l + crease_r, 0.0, 1.0)[..., None]

naso_l = np.exp(-(((xx_s - 1852.0) / 42.0) ** 2 + ((yy_s - 998.0) / 28.0) ** 2))
naso_r = np.exp(-(((xx_s - 1852.0) / 42.0) ** 2 + ((yy_s - 1118.0) / 28.0) ** 2))
age_zone = np.clip(naso_l + naso_r, 0.0, 1.0)[..., None]

def prepare_sharp_photo_base(photo_im):
    low10 = np.stack([gaussian_filter(photo_im[..., c], sigma=8.0 * s) for c in range(3)], axis=-1)
    low32 = np.stack([gaussian_filter(photo_im[..., c], sigma=28.0 * s) for c in range(3)], axis=-1)
    hi_detail = photo_im - low10
    mid_sculpt = low10 - low32
    rejuvenated = low32 + mid_sculpt * (1.0 - 0.30 * age_zone) + hi_detail
    mucosal = np.array([214.0, 166.0, 154.0], dtype=np.float32)
    rejuvenated = rejuvenated * (1.0 - eye_hole_mask * 0.78) + mucosal * (eye_hole_mask * 0.78)
    # Subtle warm eyelid crease (NO heavy dark brown/black raccoon rings!)
    rejuvenated = rejuvenated * (1.0 - 0.06 * eyelid_def) + np.array([156.0, 112.0, 104.0], dtype=np.float32) * (0.06 * eyelid_def)
    bg_clean = low32 * (1.0 - neck_rim) + photo_im * neck_rim
    return bg_clean * (1.0 - face_keep) + rejuvenated * face_keep

sharp_asian_base = prepare_sharp_photo_base(im_young_asian)
sharp_eurasian_base = prepare_sharp_photo_base(im_eurasian)

mouth_box = np.exp(-(((xx_s - 1864.0) / 21.0) ** 2 + ((yy_s - 1056.2) / 39.0) ** 2) ** 1.8)
lip_redness = (sharp_asian_base[..., 0] - 0.50 * (sharp_asian_base[..., 1] + sharp_asian_base[..., 2]))
lip_lum_inv = np.clip((205.0 - (0.299 * sharp_asian_base[..., 0] + 0.587 * sharp_asian_base[..., 1] + 0.114 * sharp_asian_base[..., 2])) / 55.0, 0.0, 1.0)
lip_mask = gaussian_filter(np.clip((lip_redness - 16.0) / 18.0 + 0.35 * lip_lum_inv, 0.0, 1.0) * mouth_box, sigma=1.1 * s)[..., None]
lip_inner = gaussian_filter(np.clip(lip_mask[..., 0] * 1.25, 0.0, 1.0) * np.exp(-(((xx_s - 1864.8) / 7.0) ** 2 + ((yy_s - 1056.2) / 25.0) ** 2)), sigma=0.9 * s)[..., None]
lip_hi = (sharp_asian_base - np.stack([gaussian_filter(sharp_asian_base[..., c], sigma=3.0 * s) for c in range(3)], axis=-1)) * 1.25

cheek_l = np.exp(-(((xx_s - 1802.0) / 40.0) ** 2 + ((yy_s - 960.0) / 46.0) ** 2))[..., None]
cheek_r = np.exp(-(((xx_s - 1802.0) / 40.0) ** 2 + ((yy_s - 1154.0) / 46.0) ** 2))[..., None]
cheeks = np.clip(cheek_l + cheek_r, 0.0, 1.0)

variant_recipes = {
    'cn_porcelain_ivory':    (sharp_asian_base,    [1.01, 1.01, 1.02], [2.0, 2.0, 4.0],  [196, 86, 94],  0.65, 0.18, None),
    'cn_scholar_natural':    (sharp_asian_base,    [1.00, 1.00, 1.00], [0.0, 0.0, 1.0],  [188, 92, 96],  0.58, 0.14, None),
    'kr_dewy_peach':         (sharp_asian_base,    [1.02, 1.00, 1.01], [3.0, 1.0, 2.0],  [212, 78, 92],  0.74, 0.28, None),
    'kr_chaebol_cool':       (sharp_asian_base,    [0.99, 1.00, 1.03], [0.0, 2.0, 6.0],  [158, 54, 76],  0.78, 0.16, None),
    'cn_jiangnan_jade':      (sharp_asian_base,    [1.01, 1.00, 0.99], [2.0, 1.0, -1.0], [192, 72, 78],  0.70, 0.20, None),
    'kr_firstlove_camellia': (sharp_asian_base,    [1.02, 0.99, 1.00], [3.0, 0.0, 2.0],  [208, 68, 82],  0.76, 0.30, None),
    'cn_intellectual_olive': (sharp_asian_base,    [0.98, 0.99, 0.99], [-2.0, 0.0, 0.0], [166, 78, 82],  0.64, 0.12, None),
    'eurasian_velvet_rose':  (sharp_eurasian_base, [1.00, 0.99, 1.00], [1.0, 0.0, 2.0],  [178, 72, 82],  0.72, 0.22, None),
}

skin_out_bytes = {}
for vk, (base_im, mul_c, add_c, lip_rgb, lip_w, blush_w, _mole_kind) in variant_recipes.items():
    img = base_im * np.array(mul_c, dtype=np.float32) + np.array(add_c, dtype=np.float32)
    blush_target = np.array([228.0, 132.0, 138.0], dtype=np.float32)
    img = img * (1.0 - cheeks * blush_w * 0.42) + blush_target * (cheeks * blush_w * 0.42)
    lip_col = np.array(lip_rgb, dtype=np.float32) + lip_hi
    inner_col = np.array(lip_rgb, dtype=np.float32) * 0.76 + lip_hi
    img = img * (1.0 - lip_mask * lip_w) + lip_col * (lip_mask * lip_w)
    img = img * (1.0 - lip_inner * (lip_w * 0.65)) + inner_col * (lip_inner * (lip_w * 0.65))

    # Save as true 24-bit RGB PNG (ZERO 256-color posterization & ZERO blurry UV mole blotches!)
    pil_v = Image.fromarray(np.clip(img, 0.0, 255.0).astype(np.uint8), mode='RGB')
    skin_out_bytes[vk] = encode_png(pil_v, quantize_colors=None)
    print(f"  Rebuilt 24-bit sharp skin {vk:22s}: {len(skin_out_bytes[vk])/1024:5.1f} KB")

bv_replacements = {
    gltf['images'][0]['bufferView']: skin_out_bytes['cn_porcelain_ivory'],
    gltf['images'][2]['bufferView']: eye_out_bytes,
    gltf['images'][3]['bufferView']: eb_main_bytes,
    gltf['images'][4]['bufferView']: el_out_bytes,
    gltf['images'][6]['bufferView']: teeth_out_bytes,
}
for k, b_data in eb_assets_bytes.items():
    bv_replacements[gltf['extras']['realWebAssets']['eyebrows'][k]['bufferView']] = b_data
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
with open(head_path, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(new_bin)))
    f.write(struct.pack('<II', len(jb), 0x4E4F534A))
    f.write(jb)
    f.write(struct.pack('<II', len(new_bin), 0x004E4942))
    f.write(new_bin)

print(f"Saved upgraded {head_path}: {os.path.getsize(head_path)/1024/1024:.2f} MB")
