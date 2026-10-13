#!/usr/bin/env python3
"""
Stage 29 · 100% Real Downloaded Web Assets Builder (`build_real_web_head_assets.py`)
STRICT RULE (from HANDOFF.md):
- ZERO manual math/Gaussian vertex pinching (`禁止模型手动捏脸`)!
- ZERO procedural Canvas 2D blush circles or eyebrow drawing!
- Restores the clean `37f0260` MakeHuman head mesh and integrates 100% real downloaded assets:
  1. 6 Real Photographic MakeHuman / Community Female Skin Textures (`makehuman_system_assets_cc0.zip` & `skins01_cc0.zip`):
     - `young_asian` (`skins/young_asian_female/young_lightskinned_female_diffuse3.png`)
     - `natural_makeup` (`skins/toigo_light_skin_with_natural_makeup/young_lightskinned_female_diffuse4.png`)
     - `violet_makeup` (`skins/toigo_light_skin_female_with_violet_makeup/young_lightskinned_female_diffuse5.png`)
     - `eurasian` (`skins/onlytheghosts_young_eurasian_female/young_eurasian_female_diffuse.png`)
     - `glam_makeup` (`skins/toigo_light_skin_with_makeup/young_lightskinned_female_diffuse3.png`)
     - `zoey` (`skins/nyloseth_zoeyskin/zoeyskin.png`)
  2. Real 2048x2048 Artist Human Skin Normal Map (`skins02_cc0.zip` -> `mindfront_aksel_skin/Aksel_Skin_NRM.png`).
  3. 8 Real Official MakeHuman 3D Eyebrow Models & Textures (`makehuman_system_assets_cc0.zip` -> `eyebrow001..012` `.obj` + `.png`).
  4. 9 Real Artist-Sculpted `.target` Morph Channels from MPFB2 & MakeHuman Community (`cheek01_cc0.zip` by Elvaerwyn, `nose01_cc0.zip`, `mpfb2/targets/head/`).
"""
import io
import json
import math
import os
import struct
import subprocess
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter
from scipy.spatial import cKDTree

print("=== Stage 29: Building 100% Real Web-Asset Head GLB (ZERO Manual Face Pinching) ===")

# 1. Load clean 37f0260 head GLB from git history
raw_head = subprocess.check_output(['git', '--git-dir=/tmp/check_git', 'show', '37f0260:public/models/daz_asian_head_base.glb'])
jlen = struct.unpack_from('<I', raw_head, 12)[0]
gh = json.loads(raw_head[20:20 + jlen])
bh = bytearray(raw_head[28 + jlen:])

def read_acc(i):
    a = gh['accessors'][i]
    bv = gh['bufferViews'][a['bufferView']]
    dt = {5126: '<f4', 5123: '<u2', 5125: '<u4', 5122: '<i2'}[a['componentType']]
    ch = {'VEC3': 3, 'VEC2': 2, 'SCALAR': 1}[a['type']]
    stride = bv.get('byteStride', 0)
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    if stride and stride > ch * np.dtype(dt).itemsize:
        raw_s = np.frombuffer(bh, dtype=np.uint8, count=a['count'] * stride, offset=off).reshape(a['count'], stride)
        return np.frombuffer(raw_s[:, :ch * np.dtype(dt).itemsize].tobytes(), dtype=dt).reshape(a['count'], ch).copy()
    return np.frombuffer(bh, dtype=dt, count=a['count'] * ch, offset=off).reshape(a['count'], ch).copy()

pos_h = read_acc(gh['meshes'][0]['primitives'][0]['attributes']['POSITION']).astype(np.float64)
uv_h = read_acc(gh['meshes'][0]['primitives'][0]['attributes']['TEXCOORD_0']).astype(np.float64)
tris_h = read_acc(gh['meshes'][0]['primitives'][0]['indices']).reshape(-1, 3)

# 2. Exact Vertex Correspondence with Official MakeHuman 19,158-Vertex Basemesh (`/tmp/mh_base.obj`)
base_v, base_vt, base_pairs = [], [], {}
for line in open('/tmp/mh_base.obj'):
    if line.startswith('v '):
        p = line.split()
        base_v.append([float(p[1]) * 0.1, float(p[2]) * 0.1, float(p[3]) * 0.1])
    elif line.startswith('vt '):
        p = line.split()
        base_vt.append([float(p[1]), 1.0 - float(p[2])])
    elif line.startswith('f '):
        for tok in line.split()[1:]:
            sp = tok.split('/')
            base_pairs[int(sp[1]) - 1] = int(sp[0]) - 1
base_v = np.array(base_v, dtype=np.float64)
base_vt = np.array(base_vt, dtype=np.float64)
_, ti_idx = cKDTree(base_vt).query(uv_h)
matched_vi = np.array([base_pairs[t] for t in ti_idx], dtype=np.int32)

# Neck rim lock weight: keep C4/C5 cut ring (`y <= -0.106`) watertight with NeckCrossSection while leaving 100% of face/chin/jaw untouched
neck_protection = np.clip((pos_h[:, 1] - (-0.106)) / 0.024, 0.0, 1.0)[:, None]

def load_raw_target_full(path):
    deltas = np.zeros((len(base_v), 3), dtype=np.float64)
    for line in open(path):
        line = line.strip()
        if not line or line.startswith('#'):
            continue
        parts = line.split()
        if len(parts) == 4:
            vi = int(parts[0])
            if 0 <= vi < len(base_v):
                deltas[vi] = [float(parts[1]) * 0.1, float(parts[2]) * 0.1, float(parts[3]) * 0.1]
    return deltas

# Build the 9 Real Artist-Sculpted Target Channels (from MPFB2 & Elvaerwyn's cheek01 / nose01 packs)
t_round = load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/head-round.target') + 0.35 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/head-age-decr.target')
t_oval = load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/head-oval.target')
t_heart = load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/head-invertedtriangular.target')
t_diamond = load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/head-diamond.target')

t_elvs_baby = (
    0.75 * load_raw_target_full('/tmp/mh_real_assets/targets/cheek/elvs_chipmunk_cheeks_low_1.target')
    + 0.45 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/l-cheek-volume-incr.target')
    + 0.45 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/r-cheek-volume-incr.target')
    + 0.30 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/chin-height-decr.target')
)
t_elvs_apple = (
    0.65 * load_raw_target_full('/tmp/mh_real_assets/targets/cheek/elvs_chipmunk_cheeks_high_1.target')
    + 0.55 * load_raw_target_full('/tmp/mh_real_assets/targets/cheek/elvs_high_chubby_cheekbones_1.target')
    + 0.45 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/l-cheek-inner-incr.target')
    + 0.45 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/r-cheek-inner-incr.target')
)
t_elvs_slim = (
    0.70 * load_raw_target_full('/tmp/mh_real_assets/targets/cheek/elvs_sunken_cheeks_1.target')
    + 0.65 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/l-cheek-bones-decr.target')
    + 0.65 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/r-cheek-bones-decr.target')
    + 0.55 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/chin-width-decr.target')
)
t_brow_down = (
    0.85 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/eyebrows-angle-down.target')
    + 0.40 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/eyebrows-trans-down.target')
)
t_brow_up = (
    0.90 * load_raw_target_full('/tmp/mh_real_assets/mpfb_targets/eyebrows-angle-up.target')
)

# Replace the 9 unused morph target slots (indices 2, 3, 14, 15, 20, 21, 28, 29, 31) in meshes 0, 2, 3, 4
REAL_ARTIST_TARGET_SLOTS = [
    (2,  'mh_head_round',     t_round),
    (3,  'mh_head_oval',      t_oval),
    (14, 'mh_head_heart',     t_heart),
    (15, 'mh_head_diamond',   t_diamond),
    (20, 'elvs_baby_cheeks',  t_elvs_baby),
    (21, 'elvs_apple_cheeks', t_elvs_apple),
    (28, 'elvs_slim_cheeks',  t_elvs_slim),
    (29, 'mh_brow_down',      t_brow_down),
    (31, 'mh_brow_up',        t_brow_up),
]

head_tree = cKDTree(pos_h)

for mesh_idx in [0, 2, 3, 4]:
    m = gh['meshes'][mesh_idx]
    tnames = m['extras']['targetNames']
    p = m['primitives'][0]
    m_pos = read_acc(p['attributes']['POSITION']).astype(np.float64)

    # Map follower meshes (Eyebrows=2, Eyelashes=3, Eyes=4) to nearest HeadSkin vertices
    if mesh_idx == 0:
        nn_idx = None
    else:
        dists_m, nn_idx = head_tree.query(m_pos, k=4)
        w_m = 1.0 / np.maximum(dists_m, 1e-5) ** 2
        w_m /= np.sum(w_m, axis=1, keepdims=True)

    for slot_idx, new_name, full_delta in REAL_ARTIST_TARGET_SLOTS:
        tnames[slot_idx] = new_name
        head_delta = full_delta[matched_vi] * neck_protection
        if mesh_idx == 0:
            mesh_delta = head_delta
        elif mesh_idx == 4:
            # Eyes are rigid spheres: do not warp eyeball spheres on cheek/jaw targets
            mesh_delta = np.zeros_like(m_pos)
        else:
            mesh_delta = (w_m[:, :, None] * head_delta[nn_idx]).sum(axis=1)

        acc_idx = p['targets'][slot_idx]['POSITION']
        acc_obj = gh['accessors'][acc_idx]
        bv_obj = gh['bufferViews'][acc_obj['bufferView']]
        q_i16 = np.clip(np.round(mesh_delta * 32767.0), -32767, 32767).astype('<i2')
        acc_obj['min'] = [int(q_i16[:, 0].min()), int(q_i16[:, 1].min()), int(q_i16[:, 2].min())]
        acc_obj['max'] = [int(q_i16[:, 0].max()), int(q_i16[:, 1].max()), int(q_i16[:, 2].max())]
        padded = np.zeros((len(m_pos), 4), dtype='<i2')
        padded[:, :3] = q_i16
        raw_bytes = padded.tobytes()
        off = bv_obj.get('byteOffset', 0) + acc_obj.get('byteOffset', 0)
        bh[off : off + len(raw_bytes)] = raw_bytes

print("Injected 9 real downloaded MakeHuman/Elvaerwyn artist .target morphs into HeadSkin, Eyebrows & Eyelashes.")

# 3. Build UV Coverage Mask & Cranial Hair-Cap Neutralization Mask (at 1536x1536)
RES = 1536
uv_mask = np.zeros((RES, RES), dtype=bool)
scalp_cap_uv_mask = np.zeros((RES, RES), dtype=np.float32)

# Only vertices on the upper-back cranium (`y > 0.052 and z < 0.038`) are under the hair cap
is_upper_back_scalp_v = (pos_h[:, 1] > 0.052) & (pos_h[:, 2] < 0.038)

for i0, i1, i2 in tris_h:
    u0, u1, u2 = uv_h[i0, 0] * RES, uv_h[i1, 0] * RES, uv_h[i2, 0] * RES
    v0, v1, v2 = uv_h[i0, 1] * RES, uv_h[i1, 1] * RES, uv_h[i2, 1] * RES
    xa = max(0, int(min(u0, u1, u2)) - 18)
    xb = min(RES - 1, int(max(u0, u1, u2)) + 18)
    ya = max(0, int(min(v0, v1, v2)) - 18)
    yb = min(RES - 1, int(max(v0, v1, v2)) + 18)
    uv_mask[ya : yb + 1, xa : xb + 1] = True
    if is_upper_back_scalp_v[i0] and is_upper_back_scalp_v[i1] and is_upper_back_scalp_v[i2]:
        xa_s = max(0, int(min(u0, u1, u2)) - 4)
        xb_s = min(RES - 1, int(max(u0, u1, u2)) + 4)
        ya_s = max(0, int(min(v0, v1, v2)) - 4)
        yb_s = min(RES - 1, int(max(v0, v1, v2)) + 4)
        scalp_cap_uv_mask[ya_s : yb_s + 1, xa_s : xb_s + 1] = 1.0

scalp_cap_uv_mask = gaussian_filter(scalp_cap_uv_mask, sigma=18.0)[:, :, None]

# Extract original 37f0260 skin texture ONLY for the C4/C5 severed neck rim bloodstain zone (`x < 940, y < 375` in 1536x1536)
bv0 = gh['bufferViews'][gh['images'][0]['bufferView']]
im37 = np.asarray(
    Image.open(io.BytesIO(bh[bv0.get('byteOffset', 0) : bv0.get('byteOffset', 0) + bv0['byteLength']]))
    .convert('RGB')
    .resize((RES, RES), Image.LANCZOS),
    dtype=np.float32,
)
yy, xx = np.mgrid[0:RES, 0:RES].astype(np.float32)
# In 37f0260, dark red blood clots at the neck cut rim have high red-to-green ratio (`R - G > 42` and `G < 115`) in the neck UV island (`xx < 960, yy < 380`)
neck_island = (xx < 960) & (yy < 380)
blood_clot_weight = np.where(
    neck_island,
    np.clip(((im37[:, :, 0] - im37[:, :, 1]) - 36.0) / 45.0, 0.0, 1.0) * np.clip((135.0 - im37[:, :, 1]) / 65.0, 0.0, 1.0),
    0.0,
)
blood_clot_weight = gaussian_filter(blood_clot_weight, sigma=2.5)[:, :, None]

def process_real_skin_texture(src_path, target_fh_rgb, jpeg_quality=92):
    """
    Loads a REAL 2048x2048 MakeHuman photographic female skin texture,
    preserves 100% of the unblurred photographic face, forehead, cheeks, lips, eyelids, jaw, ears & neck,
    softly neutralizes only the back-of-skull hair-root shadow under the hair cap,
    applies the C4/C5 severed neck cut bloodstains, and encodes as 4:4:4 high-res JPEG.
    """
    raw_im = Image.open(src_path).convert('RGB').resize((RES, RES), Image.LANCZOS)
    arr = np.asarray(raw_im, dtype=np.float32)

    # Sample forehead skin patch (`u in [0.80, 0.818], v in [0.49, 0.54]`) to calibrate overall exposure
    fh_patch = arr[int(0.49 * RES) : int(0.54 * RES), int(0.80 * RES) : int(0.818 * RES)]
    fh_mean = fh_patch.mean(axis=(0, 1))
    gain = np.array(target_fh_rgb, dtype=np.float32) / np.maximum(fh_mean, 1.0)
    # Gentle exposure calibration while preserving original photographic contrast & pores
    arr_cal = np.clip(arr * gain[None, None, :], 0.0, 255.0)

    # Neutralize only the upper-back cranial scalp shadow under the hair cap (`scalp_cap_uv_mask`)
    scalp_clean = 0.75 * np.array(target_fh_rgb, dtype=np.float32)[None, None, :] + 0.25 * gaussian_filter(arr_cal, sigma=(24.0, 24.0, 0.0))
    arr_cal = arr_cal * (1.0 - scalp_cap_uv_mask) + scalp_clean * scalp_cap_uv_mask

    # Apply C4/C5 severed neck rim bloodstains
    arr_cal = arr_cal * (1.0 - blood_clot_weight) + im37 * blood_clot_weight

    # Mask unused torso/leg/arm UV space to uniform skin tone for compact lossless-chroma 4:4:4 JPEG encoding
    out_u8 = np.clip(arr_cal, 0.0, 255.0).astype(np.uint8)
    bg_col = np.clip(np.round(target_fh_rgb), 0, 255).astype(np.uint8)
    out_u8[~uv_mask] = bg_col

    bio = io.BytesIO()
    Image.fromarray(out_u8, mode='RGB').save(bio, format='JPEG', quality=jpeg_quality, subsampling=0, optimize=True)
    return bio.getvalue()

# 6 Real Downloaded MakeHuman Photographic Skin Variants (1 per character archetype + selectable in UI)
SKIN_VARIANTS_SPEC = [
    ('young_asian',     '/tmp/mh_real_assets/sys_eyebrows/young_asian_female.png',   [234.0, 196.0, 174.0]), # 方尧平: 岭南暖象牙真实亚洲女学生原生肌
    ('natural_makeup',  '/tmp/mh_real_assets/skins/light_natural_makeup.png',        [240.0, 200.0, 184.0]), # 初夏: Toigo 蜜桃粉白自然淡妆少女肌
    ('violet_makeup',   '/tmp/mh_real_assets/skins/light_violet_makeup.png',         [238.0, 204.0, 196.0]), # 林汐: Toigo 韩系冷白瓷烟熏浆果妆肌
    ('eurasian',        '/tmp/mh_real_assets/skins/young_eurasian_female.png',       [236.0, 198.0, 178.0]), # 苏晚: OnlyTheGhosts 江南温润羊脂玉肌
    ('glam_makeup',     '/tmp/mh_real_assets/skins/light_glam_makeup.png',           [242.0, 202.0, 192.0]), # 千雪: Toigo 舞台冷白瓷红唇全妆肌
    ('zoey',            '/tmp/mh_real_assets/skins/zoey_skin.png',                   [230.0, 192.0, 172.0]), # 沈知微: Nyloseth Zoey 高清毛孔清冷御姐肌
]

encoded_skins = {}
for skin_id, src_p, target_rgb in SKIN_VARIANTS_SPEC:
    encoded_skins[skin_id] = process_real_skin_texture(src_p, target_rgb, jpeg_quality=92)
    print(f"Processed real photographic skin [{skin_id}]: {len(encoded_skins[skin_id]) / 1024:.1f} KB")

# 4. Build Real Artist Human Skin Normal Map (`Aksel_Skin_NRM.png` from `skins02_cc0.zip`)
bv1 = gh['bufferViews'][gh['images'][1]['bufferView']]
orig_nrm = np.asarray(
    Image.open(io.BytesIO(bh[bv1.get('byteOffset', 0) : bv1.get('byteOffset', 0) + bv1['byteLength']]))
    .convert('RGB')
    .resize((1024, 1024), Image.LANCZOS),
    dtype=np.float32,
)
real_nrm = np.asarray(
    Image.open('/tmp/mh_real_assets/skins/Aksel_Skin_NRM.png')
    .convert('RGB')
    .resize((1024, 1024), Image.LANCZOS),
    dtype=np.float32,
)
# Combine original anatomical normal map with 65% Mindfront real artist skin normal map
comb_nrm = np.clip(128.0 + (orig_nrm - 128.0) * 0.85 + (real_nrm - 128.0) * 0.65, 0.0, 255.0)
comb_nrm[:, :, 2] = 255.0
uv_mask_1k = np.asarray(Image.fromarray(uv_mask.astype(np.uint8) * 255).resize((1024, 1024), Image.NEAREST)) > 0
comb_nrm_u8 = comb_nrm.astype(np.uint8)
comb_nrm_u8[~uv_mask_1k] = [128, 128, 255]
bio_nrm = io.BytesIO()
Image.fromarray(comb_nrm_u8, mode='RGB').save(bio_nrm, format='JPEG', quality=92, subsampling=0, optimize=True)
real_normal_bytes = bio_nrm.getvalue()
print(f"Processed real artist 1024x1024 skin normal map: {len(real_normal_bytes) / 1024:.1f} KB")

# 5. Process 8 Real Official MakeHuman 3D Eyebrow Assets (`eyebrow001..012` .obj + .png)
def load_mh_eyebrow_obj(idx_num):
    vs, vts, v_to_vt = [], [], {}
    obj_path = f'/tmp/mh_real_assets/sys_eyebrows/eyebrow{idx_num:03d}.obj'
    for l in open(obj_path):
        if l.startswith('v '):
            p = l.split()
            vs.append([float(p[1]) * 0.1, float(p[2]) * 0.1, float(p[3]) * 0.1])
        elif l.startswith('vt '):
            p = l.split()
            vts.append([float(p[1]), 1.0 - float(p[2])])
        elif l.startswith('f '):
            for tok in l.split()[1:]:
                sp = tok.split('/')
                v_to_vt[int(sp[0]) - 1] = int(sp[1]) - 1
    mapped_uv = np.array([vts[v_to_vt[vi]] for vi in range(124)], dtype=np.float32)
    return np.array(vs, dtype=np.float32), mapped_uv

v_brow_base, uv_brow_base = load_mh_eyebrow_obj(1)
glb_brow_pos = read_acc(gh['meshes'][2]['primitives'][0]['attributes']['POSITION']).astype(np.float32)

EYEBROW_PACK_SPEC = [
    ('eyebrow001', 1,  [38, 30, 28]), # 01: MakeHuman 经典自然柔弧眉 (eyebrow001)
    ('eyebrow002', 2,  [42, 32, 30]), # 02: MakeHuman 清秀细长远山眉 (eyebrow002)
    ('eyebrow003', 3,  [34, 26, 25]), # 03: MakeHuman 浓郁野生毛流眉 (eyebrow003)
    ('eyebrow004', 4,  [46, 35, 32]), # 04: MakeHuman 柔和淑女弯眉 (eyebrow004)
    ('eyebrow005', 5,  [32, 25, 24]), # 05: MakeHuman 高挑名伶剑眉 (eyebrow005)
    ('eyebrow008', 8,  [40, 31, 29]), # 08: MakeHuman 饱满平直少年/少女眉 (eyebrow008)
    ('eyebrow010', 10, [48, 36, 33]), # 10: MakeHuman 韩系轻柔淡雾眉 (eyebrow010)
    ('eyebrow012', 12, [30, 24, 24]), # 12: MakeHuman 古典纤细柳叶蛾眉 (eyebrow012)
]

encoded_eyebrows = {}
for brow_id, num, rgb_tint in EYEBROW_PACK_SPEC:
    vi, uvi = load_mh_eyebrow_obj(num)
    # Apply the exact artist 3D vertex offset `(vi - v_brow_base)` onto `glb_brow_pos`
    pos_i = glb_brow_pos + (vi - v_brow_base)
    png_path = f'/tmp/mh_real_assets/sys_eyebrows/eyebrow{num:03d}.png'
    arr_b = np.asarray(Image.open(png_path).convert('RGBA')).copy()
    # Normalize RGB to clean dark charcoal-brown hair pigment while keeping 100% of the artist's alpha channel
    arr_b[:, :, 0] = rgb_tint[0]
    arr_b[:, :, 1] = rgb_tint[1]
    arr_b[:, :, 2] = rgb_tint[2]
    bio_b = io.BytesIO()
    Image.fromarray(arr_b, mode='RGBA').save(bio_b, format='PNG', optimize=True)
    encoded_eyebrows[brow_id] = {
        'png_bytes': bio_b.getvalue(),
        'pos': np.round(pos_i, 5).flatten().tolist(),
        'uv': np.round(uvi, 5).flatten().tolist(),
    }
    print(f"Processed real MakeHuman 3D eyebrow [{brow_id}]: {len(encoded_eyebrows[brow_id]['png_bytes']) / 1024:.1f} KB")

# 6. Rebuild GLB Binary Buffer with Updated Primary Textures + Embedded Real Web Assets
img_bv_indices = {im['bufferView']: idx for idx, im in enumerate(gh['images'])}
new_bin = bytearray()

for bv_i, old_bv in enumerate(gh['bufferViews']):
    orig_off = old_bv.get('byteOffset', 0)
    orig_len = old_bv['byteLength']
    raw_slice = bytes(bh[orig_off : orig_off + orig_len])
    if bv_i in img_bv_indices:
        im_idx = img_bv_indices[bv_i]
        if im_idx == 0:
            # Primary skin_albedo = Real unblurred `young_asian` photographic skin
            data_bytes = encoded_skins['young_asian']
            gh['images'][0]['mimeType'] = 'image/jpeg'
        elif im_idx == 1:
            # Primary skin_normal = Real Mindfront artist skin normal map
            data_bytes = real_normal_bytes
            gh['images'][1]['mimeType'] = 'image/jpeg'
        elif im_idx == 3:
            # Primary eyebrow = Real MakeHuman eyebrow001
            data_bytes = encoded_eyebrows['eyebrow001']['png_bytes']
            gh['materials'][3]['pbrMetallicRoughness']['baseColorFactor'] = [1.0, 1.0, 1.0, 1.0]
        elif im_idx == 4:
            bio_l = io.BytesIO()
            arr_l = np.asarray(Image.open(io.BytesIO(raw_slice)).convert('RGBA')).copy()
            arr_l[:, :, 0] = 16
            arr_l[:, :, 1] = 14
            arr_l[:, :, 2] = 16
            Image.fromarray(arr_l).save(bio_l, format='PNG', optimize=True)
            gh['materials'][4]['pbrMetallicRoughness']['baseColorFactor'] = [1.0, 1.0, 1.0, 1.0]
            data_bytes = bio_l.getvalue()
        else:
            data_bytes = raw_slice
    else:
        data_bytes = raw_slice

    while len(new_bin) % 4 != 0:
        new_bin.append(0)
    old_bv['byteOffset'] = len(new_bin)
    old_bv['byteLength'] = len(data_bytes)
    new_bin.extend(data_bytes)

def append_extra_buffer_view(data_bytes):
    while len(new_bin) % 4 != 0:
        new_bin.append(0)
    off = len(new_bin)
    new_bin.extend(data_bytes)
    bv_idx = len(gh['bufferViews'])
    gh['bufferViews'].append({
        'buffer': 0,
        'byteOffset': off,
        'byteLength': len(data_bytes),
    })
    return bv_idx

real_web_assets_meta = {
    'skins': {},
    'eyebrows': {},
}

# Store the 6 real photographic skins in bufferViews (young_asian reuses images[0]'s bufferView!)
real_web_assets_meta['skins']['young_asian'] = {
    'bufferView': gh['images'][0]['bufferView'],
    'mimeType': 'image/jpeg',
}
for skin_id in ['natural_makeup', 'violet_makeup', 'eurasian', 'glam_makeup', 'zoey']:
    bv_idx = append_extra_buffer_view(encoded_skins[skin_id])
    real_web_assets_meta['skins'][skin_id] = {
        'bufferView': bv_idx,
        'mimeType': 'image/jpeg',
    }

# Store the 8 real MakeHuman 3D eyebrows in bufferViews
for brow_id, bdata in encoded_eyebrows.items():
    if brow_id == 'eyebrow001':
        bv_idx = gh['images'][3]['bufferView']
    else:
        bv_idx = append_extra_buffer_view(bdata['png_bytes'])
    real_web_assets_meta['eyebrows'][brow_id] = {
        'bufferView': bv_idx,
        'mimeType': 'image/png',
        'pos': bdata['pos'],
        'uv': bdata['uv'],
    }

gh['extras'] = gh.get('extras', {})
gh['extras']['realWebAssets'] = real_web_assets_meta

while len(new_bin) % 4 != 0:
    new_bin.append(0)
gh['buffers'][0]['byteLength'] = len(new_bin)

jb = json.dumps(gh, separators=(',', ':')).encode('utf-8')
while len(jb) % 4 != 0:
    jb += b' '

head_out_path = '/home/user/public/models/daz_asian_head_base.glb'
with open(head_out_path, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(new_bin)))
    f.write(struct.pack('<II', len(jb), 0x4E4F534A))
    f.write(jb)
    f.write(struct.pack('<II', len(new_bin), 0x004E4942))
    f.write(new_bin)

print(f"=== Successfully saved {head_out_path}: {os.path.getsize(head_out_path) / (1024 * 1024):.2f} MB ===")
