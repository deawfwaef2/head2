#!/usr/bin/env python3
"""
Builds the production high-precision East Asian Female Head Bust GLB (`daz_asian_head_base.glb`)
with watertight C4/C5 anatomical cross-section cap, 3D Eyes/Iris/Cornea, 3D Eyebrows, 3D Eyelashes,
32 synchronized facial & blink/gaze morph targets, and 7 real 3D Hair GLB models (`hair_*.glb`).
"""
import io
import json
import math
import os
import struct
import sys
import numpy as np
from PIL import Image, ImageFilter

sys.path.append('/tmp/dl_inspect')
import glbutil

OUT_DIR = '/home/user/public/models'
os.makedirs(OUT_DIR, exist_ok=True)

# 1. Load source base_body.glb
gltf, b = glbutil.read_glb('/tmp/dl_inspect/base_body.glb')
p0 = gltf['meshes'][0]['primitives'][0]
tnames = gltf['meshes'][0]['extras']['targetNames']
joints = glbutil._read_accessor(gltf, b, p0['attributes']['JOINTS_0']).astype(int)
jweights = glbutil._read_accessor(gltf, b, p0['attributes']['WEIGHTS_0'])
hn_weight = np.sum(jweights * ((joints == 43) | (joints == 44)), axis=1)

# Base morph weights baked into the default East Asian Female head bust
BASE_BAKE_WEIGHTS = {
    'gender_female': 1.0,
    'proportions_ideal': 0.72,
    'face_jaw_width_decr': 0.52,
    'face_chin_decr': 0.24,
    'face_nose_width_decr': 0.30,
    'face_eye_size_incr': 0.22,
    'face_eye_tilt_incr': 0.22,
    'face_mouth_width_decr': 0.34,
    'blink_left': 0.14,
    'blink_right': 0.14,
}

# The 32 runtime morph targets to keep on HeadSkin, Eyebrows, Eyelashes, Eyes
KEEP_TARGETS = [
    'face_nose_width_decr', 'face_nose_width_incr',
    'face_nose_length_decr', 'face_nose_length_incr',
    'face_nose_height_decr', 'face_nose_height_incr',
    'face_jaw_width_decr', 'face_jaw_width_incr',
    'face_chin_decr', 'face_chin_incr',
    'face_cheekbones_decr', 'face_cheekbones_incr',
    'face_eye_size_decr', 'face_eye_size_incr',
    'face_eye_spacing_decr', 'face_eye_spacing_incr',
    'face_eye_tilt_decr', 'face_eye_tilt_incr',
    'face_lips_decr', 'face_lips_incr',
    'face_mouth_width_decr', 'face_mouth_width_incr',
    'face_ear_size_decr', 'face_ear_size_incr',
    'face_forehead_decr', 'face_forehead_incr',
    'blink_left', 'blink_right',
    'look_left', 'look_right', 'look_up', 'look_down',
]

# Center of the head in baked female coordinates (so the bust is centered at (0, 0, 0) in Three.js!)
HEAD_CENTER = np.array([0.0, 1.472, 0.038], dtype=np.float64)
CUT_Y = 1.362  # C4/C5 horizontal neck cut plane in world metres (before centering)


def apply_daz_asian_beauty_sculpt(pos_in, is_eye=False, is_brow=False, is_lash=False, is_hair=False):
    pts = pos_in.copy()
    if is_eye:
        return pts
    for i in range(len(pts)):
        x, y, z = pts[i]
        if is_hair:
            # Part lower-front hair locks around the slender neck cylinder so they never block the throat or C4/C5 section!
            if y < 1.415 and z > -0.01:
                t_low = min(1.0, (1.415 - y) / 0.08)
                min_x = 0.056 * t_low
                if abs(x) < min_x:
                    sign_x = 1.0 if x >= 0 else -1.0
                    x = sign_x * (min_x + abs(x) * 0.35)
            # Trim long hair below Y = 1.315 smoothly so bust silhouette is clean
            if y < 1.315:
                y = 1.315 + (y - 1.315) * 0.22
            pts[i] = [x, y, z]
            continue

        if y < 1.30:
            continue
        # 1) Smooth East Asian V-Line / Oval Mandibular Taper (Y in 1.38..1.46)
        jaw_h = math.exp(-((y - 1.425) / 0.038)**2)
        if z > -0.01:
            front_f = min(1.0, max(0.0, (z + 0.01) / 0.12))
            x *= (1.0 - 0.14 * jaw_h * front_f)
        # 2) Delicate Chin Tip (Y ~ 1.400, Z > 0.09)
        chin_w = math.exp(-((y - 1.400) / 0.016)**2) * math.exp(-(x / 0.030)**2)
        if z > 0.09:
            x *= (1.0 - 0.16 * chin_w)
            y += 0.0032 * chin_w
        # 3) Petite Nostrils / Alar Base ONLY at Y = 1.445
        alar_w = math.exp(-((y - 1.445) / 0.009)**2) * math.exp(-(x / 0.024)**2)
        if z > 0.125:
            x *= (1.0 - 0.14 * alar_w)
        # 4) Softly Closed, Petite Petal Lips centered at Y = 1.4255
        mouth_w = math.exp(-((y - 1.4255) / 0.012)**2) * math.exp(-(x / 0.032)**2)
        if z > 0.118:
            x *= (1.0 - 0.14 * mouth_w)
            dy_m = y - 1.4258
            y -= dy_m * 0.64 * mouth_w
        # 5) Gentle Brow Arch Lift
        for ex in (-0.0315, 0.0315):
            dx = x - ex
            if is_brow or (y > 1.492 and z > 0.105):
                brow_w = math.exp(-(dx / 0.026)**2) * math.exp(-((y - 1.497) / 0.010)**2)
                y += 0.0025 * brow_w
        # 6) Slender Cylindrical Female Swan Neck
        if y < 1.395:
            t_n = min(1.0, max(0.0, (1.395 - y) / 0.050))
            x *= (1.0 - 0.24 * (t_n ** 1.15))
            if z < 0.02:
                z *= (1.0 - 0.14 * t_n)
        pts[i] = [x, y, z]
    return pts


def get_baked_primitive(g, bin_b, mesh_idx, prim_idx=0, is_hair=False):
    m = g['meshes'][mesh_idx]
    m_tnames = m.get('extras', {}).get('targetNames', [])
    p = m['primitives'][prim_idx]
    pos = glbutil._read_accessor(g, bin_b, p['attributes']['POSITION']).copy()
    norm = glbutil._read_accessor(g, bin_b, p['attributes']['NORMAL']).copy()
    uv = glbutil._read_accessor(g, bin_b, p['attributes']['TEXCOORD_0']).copy() if 'TEXCOORD_0' in p['attributes'] else np.zeros((len(pos), 2))
    idx = glbutil._read_accessor(g, bin_b, p['indices']).astype(np.int32).flatten().reshape(-1, 3)

    targets = p.get('targets', [])
    for t_name, w in BASE_BAKE_WEIGHTS.items():
        if t_name in m_tnames and abs(w) > 1e-5:
            ti = m_tnames.index(t_name)
            if ti < len(targets):
                if 'POSITION' in targets[ti]:
                    pos += w * glbutil._read_accessor(g, bin_b, targets[ti]['POSITION'])
                if 'NORMAL' in targets[ti]:
                    norm += w * glbutil._read_accessor(g, bin_b, targets[ti]['NORMAL'])

    pos = apply_daz_asian_beauty_sculpt(
        pos,
        is_eye=(m['name'] == 'Eyes'),
        is_brow=(m['name'] == 'Eyebrows'),
        is_lash=(m['name'] == 'Eyelashes'),
        is_hair=is_hair,
    )

    # Extract kept morph target deltas
    kept_deltas = []
    for kt in KEEP_TARGETS:
        if kt in m_tnames:
            ti = m_tnames.index(kt)
            if ti < len(targets) and 'POSITION' in targets[ti]:
                dp = glbutil._read_accessor(g, bin_b, targets[ti]['POSITION']).copy()
            else:
                dp = np.zeros_like(pos)
        else:
            dp = np.zeros_like(pos)
        kept_deltas.append(dp)

    return pos, norm, uv, idx, kept_deltas


# 2. Slice `base` mesh cleanly at `Y = CUT_Y` to produce `HeadSkin` + `NeckCrossSection`
pos_skin, norm_skin, uv_skin, tris_skin, deltas_skin = get_baked_primitive(gltf, b, 0, 0, is_hair=False)
valid_v = hn_weight > 0.04

# Find triangles that are above or cross CUT_Y
kept_tris = []
crossing_low_verts = set()
above_verts = set()
for i0, i1, i2 in tris_skin:
    if not (valid_v[i0] and valid_v[i1] and valid_v[i2]):
        continue
    ys = (pos_skin[i0, 1], pos_skin[i1, 1], pos_skin[i2, 1])
    if max(ys) < CUT_Y:
        continue
    kept_tris.append((i0, i1, i2))
    for v_i in (i0, i1, i2):
        if pos_skin[v_i, 1] < CUT_Y:
            crossing_low_verts.add(v_i)
        else:
            above_verts.add(v_i)

# For each vertex in crossing_low_verts, snap it along its connected upper neck edges to Y = CUT_Y!
adj_above = {v_i: [] for v_i in crossing_low_verts}
for i0, i1, i2 in kept_tris:
    for u, v in ((i0, i1), (i1, i2), (i2, i0)):
        if u in crossing_low_verts and v in above_verts:
            adj_above[u].append(v)
        elif v in crossing_low_verts and u in above_verts:
            adj_above[v].append(u)

for v_low, up_list in adj_above.items():
    if up_list:
        v_up = min(up_list, key=lambda u: abs(pos_skin[u, 0] - pos_skin[v_low, 0]) + abs(pos_skin[u, 2] - pos_skin[v_low, 2]))
        y_low = pos_skin[v_low, 1]
        y_up = pos_skin[v_up, 1]
        t = (CUT_Y - y_low) / max(1e-5, y_up - y_low)
        t = min(1.0, max(0.0, t))
        pos_skin[v_low] = (1.0 - t) * pos_skin[v_low] + t * pos_skin[v_up]
        pos_skin[v_low, 1] = CUT_Y
        for d_arr in deltas_skin:
            d_arr[v_low] = (1.0 - t) * d_arr[v_low] + t * d_arr[v_up]
    else:
        pos_skin[v_low, 1] = CUT_Y

# Compact HeadSkin vertices
used_v = sorted(set(v_i for tri in kept_tris for v_i in tri))
old_to_new = {old_i: new_i for new_i, old_i in enumerate(used_v)}
head_pos = pos_skin[used_v] - HEAD_CENTER
head_norm = norm_skin[used_v]
head_uv = uv_skin[used_v]
head_tris = np.array([[old_to_new[i0], old_to_new[i1], old_to_new[i2]] for (i0, i1, i2) in kept_tris], dtype=np.uint32)
head_deltas = [d_arr[used_v] for d_arr in deltas_skin]

print(f"HeadSkin compiled: {len(head_pos)} verts, {len(head_tris)} tris")

# 3. Build Watertight C4/C5 Medical Anatomical Cross-Section Cap Mesh (`NeckCrossSection`)
cut_y_local = CUT_Y - HEAD_CENTER[1]
rim_mask = np.abs(head_pos[:, 1] - cut_y_local) < 1e-4
rim_indices = np.where(rim_mask)[0]
rim_pts = head_pos[rim_indices]
cx_neck = float(np.mean(rim_pts[:, 0]))
cz_neck = float(np.mean(rim_pts[:, 2]))

N_ang = 64
N_rad = 12
cap_pos = []
cap_norm = []
cap_uv = []
cap_tris = []

rim_angles = np.arctan2(rim_pts[:, 2] - cz_neck, rim_pts[:, 0] - cx_neck)
rim_radii = np.hypot(rim_pts[:, 0] - cx_neck, rim_pts[:, 2] - cz_neck)

for ir in range(N_rad + 1):
    rho = ir / N_rad
    for ia in range(N_ang + 1):
        theta = (ia / N_ang) * 2.0 * math.pi - math.pi
        ang_diff = np.abs((rim_angles - theta + math.pi) % (2.0 * math.pi) - math.pi)
        nearest = np.argsort(ang_diff)[:4]
        w_ang = 1.0 / np.maximum(ang_diff[nearest], 1e-4)
        w_ang /= np.sum(w_ang)
        r_outer = float(np.sum(rim_radii[nearest] * w_ang))

        x = cx_neck + rho * r_outer * math.cos(theta)
        z = cz_neck + rho * r_outer * math.sin(theta)

        u_d = rho * math.cos(theta)
        v_d = rho * math.sin(theta)
        trachea_d = math.hypot(u_d, (v_d - 0.42) * 1.15)
        lumen_dip = 0.0028 * math.exp(-((trachea_d / 0.16) ** 4)) if trachea_d < 0.18 else 0.0
        vert_d = math.hypot(u_d * 0.9, v_d + 0.18)
        bone_lift = -0.0016 * math.exp(-((vert_d / 0.22) ** 2))
        rim_lip = -0.0008 * math.exp(-(((1.0 - rho) / 0.05) ** 2))

        y = cut_y_local + lumen_dip + bone_lift + rim_lip
        cap_pos.append([x, y, z])
        cap_norm.append([0.0, -1.0, 0.0])
        cap_uv.append([0.5 + 0.455 * u_d, 0.5 - 0.455 * v_d])

stride_c = N_ang + 1
for ir in range(N_rad):
    for ia in range(N_ang):
        a = ir * stride_c + ia
        b_i = a + 1
        c_i = a + stride_c
        d_i = c_i + 1
        cap_tris.append([a, b_i, d_i])
        cap_tris.append([a, d_i, c_i])

cap_pos = np.array(cap_pos, dtype=np.float32)
cap_norm = np.array(cap_norm, dtype=np.float32)
cap_uv = np.array(cap_uv, dtype=np.float32)
cap_tris = np.array(cap_tris, dtype=np.uint32)

# 4. Prepare High-Resolution Embedded Textures (Porcelain East Asian Skin, Normal, Brown Eye, Brow, Lash)
raw_skin = Image.open('/tmp/dl_inspect/young_asian_female_diffuse.png').convert('RGB').resize((1024, 1024), Image.Resampling.LANCZOS)
blur_med = raw_skin.filter(ImageFilter.GaussianBlur(radius=8))
blur_wide = raw_skin.filter(ImageFilter.GaussianBlur(radius=28))
arr_raw = np.asarray(raw_skin, dtype=np.float32)
arr_med = np.asarray(blur_med, dtype=np.float32)
arr_wide = np.asarray(blur_wide, dtype=np.float32)

clean_skin = arr_wide + (arr_med - arr_wide) * 0.30 + (arr_raw - arr_med) * 0.42
clean_skin = 255.0 * np.power(np.clip(clean_skin / 255.0, 0.0, 1.0), 0.77)
clean_skin[..., 0] = np.clip(clean_skin[..., 0] * 1.03 + 5.0, 0, 255)
clean_skin[..., 1] = np.clip(clean_skin[..., 1] * 0.99 + 3.0, 0, 255)
clean_skin[..., 2] = np.clip(clean_skin[..., 2] * 0.97 + 4.0, 0, 255)

H_t, W_t = 1024, 1024
lip_mask_uv = np.zeros((H_t, W_t), dtype=np.float32)
chk_mask_uv = np.zeros((H_t, W_t), dtype=np.float32)
v_world = head_pos + HEAD_CENTER
v_lip_w = np.where(
    v_world[:, 2] > 0.130,
    np.exp(-((v_world[:, 0] / 0.019) ** 2)) * np.exp(-(((v_world[:, 1] - 1.4255) / 0.0078) ** 2)),
    0.0,
)
v_chk_w = np.where(
    v_world[:, 2] > 0.105,
    np.exp(-(((np.abs(v_world[:, 0]) - 0.038) / 0.018) ** 2)) * np.exp(-(((v_world[:, 1] - 1.464) / 0.016) ** 2)),
    0.0,
)
for i0, i1, i2 in head_tris:
    lw = max(v_lip_w[i0], v_lip_w[i1], v_lip_w[i2])
    cw = max(v_chk_w[i0], v_chk_w[i1], v_chk_w[i2])
    if lw < 0.02 and cw < 0.02:
        continue
    uv0, uv1, uv2 = head_uv[i0] * H_t, head_uv[i1] * H_t, head_uv[i2] * H_t
    xa = max(0, int(min(uv0[0], uv1[0], uv2[0])))
    xb = min(W_t - 1, int(max(uv0[0], uv1[0], uv2[0])) + 1)
    ya = max(0, int(min(uv0[1], uv1[1], uv2[1])))
    yb = min(H_t - 1, int(max(uv0[1], uv1[1], uv2[1])) + 1)
    if xa <= xb and ya <= yb:
        lip_mask_uv[ya:yb+1, xa:xb+1] = np.maximum(lip_mask_uv[ya:yb+1, xa:xb+1], (v_lip_w[i0]+v_lip_w[i1]+v_lip_w[i2])/3.0)
        chk_mask_uv[ya:yb+1, xa:xb+1] = np.maximum(chk_mask_uv[ya:yb+1, xa:xb+1], (v_chk_w[i0]+v_chk_w[i1]+v_chk_w[i2])/3.0)

lip_blur = np.asarray(Image.fromarray((np.clip(lip_mask_uv, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=6)), dtype=np.float32) / 255.0
chk_blur = np.asarray(Image.fromarray((np.clip(chk_mask_uv, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=14)), dtype=np.float32) / 255.0

clean_skin = clean_skin * (1.0 - 0.58 * lip_blur[..., None]) + np.array([212.0, 82.0, 100.0]) * (0.58 * lip_blur[..., None])
clean_skin = clean_skin * (1.0 - 0.18 * chk_blur[..., None]) + np.array([242.0, 152.0, 160.0]) * (0.18 * chk_blur[..., None])

skin_albedo_buf = io.BytesIO()
Image.fromarray(np.clip(clean_skin, 0, 255).astype(np.uint8)).save(skin_albedo_buf, format='JPEG', quality=88)
skin_albedo_bytes = skin_albedo_buf.getvalue()

orig_images = {}
for im_def in gltf.get('images', []):
    bv = gltf['bufferViews'][im_def['bufferView']]
    off = bv.get('byteOffset', 0)
    orig_images[im_def['name']] = b[off:off+bv['byteLength']]

eye_im = Image.open('/tmp/dl_inspect/brown_eye.png').convert('RGB').resize((1024, 1024), Image.Resampling.LANCZOS)
eye_arr = np.asarray(eye_im, dtype=np.float32) / 255.0
L_eye = eye_arr.mean(-1)
H_e, W_e = L_eye.shape
yy_e, xx_e = np.mgrid[0:H_e, 0:W_e].astype(np.float32)
centres = []
for half in (xx_e < W_e / 2, xx_e >= W_e / 2):
    m_dark = (L_eye < 0.35) & half
    centres.append((float(xx_e[m_dark].mean()) / W_e, float(yy_e[m_dark].mean()) / H_e))
u_e, v_e = xx_e / W_e, yy_e / H_e
d_e = [np.hypot(u_e - cu, v_e - cv) for cu, cv in centres]
k_e = np.argmin(d_e, axis=0)
cu_e = np.choose(k_e, [c[0] for c in centres])
cv_e = np.choose(k_e, [c[1] for c in centres])
r_e = np.min(d_e, axis=0)
s_iris = 1.26
ring_r = 124.0 / 1024.0
r1, r2 = ring_r * s_iris, ring_r * s_iris + 45.0 / 1024.0
rs = np.where(r_e < r1, r_e / s_iris, np.where(r_e < r2, ring_r + (r_e - r1) * (r2 - ring_r) / (r2 - r1), r_e))
f_e = np.where(r_e > 1e-9, rs / np.maximum(r_e, 1e-9), 1.0 / s_iris)
sx_e = np.clip((cu_e + (u_e - cu_e) * f_e) * W_e, 0, W_e - 1).astype(int)
sy_e = np.clip((cv_e + (v_e - cv_e) * f_e) * H_e, 0, H_e - 1).astype(int)
eye_scaled_rgb = (eye_arr[sy_e, sx_e] * 255.0).astype(np.uint8)
eye_buf = io.BytesIO()
Image.fromarray(eye_scaled_rgb).save(eye_buf, format='JPEG', quality=90)
eye_bytes = eye_buf.getvalue()

# 5. Assemble clean GLB binary & JSON for `daz_asian_head_base.glb`
bin_chunks = []
buffer_views = []
accessors = []


def add_bv(raw_bytes, target=None, stride=None):
    offset = sum(len(c) for c in bin_chunks)
    pad = (-offset) % 4
    if pad:
        bin_chunks.append(b'\x00' * pad)
        offset += pad
    bv = {'buffer': 0, 'byteOffset': offset, 'byteLength': len(raw_bytes)}
    if target:
        bv['target'] = target
    if stride:
        bv['byteStride'] = stride
    bin_chunks.append(raw_bytes)
    buffer_views.append(bv)
    return len(buffer_views) - 1


def add_acc(arr, ctype, atype, target=None, normalized=False):
    arr = np.ascontiguousarray(arr)
    bv_i = add_bv(arr.tobytes(), target=target)
    acc = {
        'bufferView': bv_i,
        'componentType': ctype,
        'count': len(arr),
        'type': atype,
    }
    if normalized:
        acc['normalized'] = True
    if atype == 'SCALAR':
        acc['min'] = [int(arr.min())] if ctype in (5123, 5125) else [float(arr.min())]
        acc['max'] = [int(arr.max())] if ctype in (5123, 5125) else [float(arr.max())]
    else:
        acc['min'] = arr.min(axis=0).astype(int if normalized else float).tolist()
        acc['max'] = arr.max(axis=0).astype(int if normalized else float).tolist()
    accessors.append(acc)
    return len(accessors) - 1


def add_morph_targets(deltas_list):
    t_list = []
    for dp in deltas_list:
        q = np.clip(np.round(dp * 32767.0), -32767, 32767).astype('<i2')
        count = len(q)
        buf = np.zeros((count, 4), dtype='<i2')
        buf[:, :3] = q
        bv_i = add_bv(buf.tobytes(), target=34962, stride=8)
        acc = {
            'bufferView': bv_i,
            'componentType': 5122,
            'normalized': True,
            'count': count,
            'type': 'VEC3',
            'min': q.min(axis=0).astype(int).tolist(),
            'max': q.max(axis=0).astype(int).tolist(),
        }
        accessors.append(acc)
        t_list.append({'POSITION': len(accessors) - 1})
    return t_list


img_defs = [
    ('skin_albedo', 'image/jpeg', skin_albedo_bytes),
    ('skin_normal', 'image/jpeg', orig_images['skin_normal']),
    ('eye', 'image/jpeg', eye_bytes),
    ('eyebrow', 'image/png', orig_images['eyebrow']),
    ('eyelash', 'image/png', orig_images['eyelash']),
]
gltf_images = []
gltf_textures = []
for name, mime, ibytes in img_defs:
    bv_i = add_bv(ibytes)
    gltf_images.append({'name': name, 'mimeType': mime, 'bufferView': bv_i})
    gltf_textures.append({'source': len(gltf_images) - 1})

gltf_materials = [
    {
        'name': 'Skin',
        'pbrMetallicRoughness': {
            'baseColorTexture': {'index': 0},
            'metallicFactor': 0.0,
            'roughnessFactor': 0.46,
        },
        'normalTexture': {'index': 1, 'scale': 0.35},
    },
    {
        'name': 'NeckCrossSection',
        'pbrMetallicRoughness': {
            'baseColorFactor': [0.85, 0.35, 0.38, 1.0],
            'metallicFactor': 0.02,
            'roughnessFactor': 0.28,
        },
        'doubleSided': True,
    },
    {
        'name': 'Eye',
        'pbrMetallicRoughness': {
            'baseColorTexture': {'index': 2},
            'metallicFactor': 0.0,
            'roughnessFactor': 0.12,
        },
    },
    {
        'name': 'Eyebrow',
        'pbrMetallicRoughness': {
            'baseColorTexture': {'index': 3},
            'baseColorFactor': [0.18, 0.14, 0.13, 1.0],
            'metallicFactor': 0.0,
            'roughnessFactor': 0.65,
        },
        'alphaMode': 'BLEND',
        'doubleSided': True,
    },
    {
        'name': 'Eyelash',
        'pbrMetallicRoughness': {
            'baseColorTexture': {'index': 4},
            'baseColorFactor': [0.07, 0.05, 0.05, 1.0],
            'metallicFactor': 0.0,
            'roughnessFactor': 0.45,
        },
        'alphaMode': 'BLEND',
        'doubleSided': True,
    },
    {
        'name': 'Cornea',
        'pbrMetallicRoughness': {
            'baseColorFactor': [1.0, 1.0, 1.0, 0.14],
            'metallicFactor': 0.0,
            'roughnessFactor': 0.04,
        },
        'alphaMode': 'BLEND',
    },
]

gltf_meshes = []

# Mesh 0: HeadSkin
gltf_meshes.append({
    'name': 'HeadSkin',
    'extras': {'targetNames': KEEP_TARGETS},
    'primitives': [{
        'attributes': {
            'POSITION': add_acc(head_pos.astype('<f4'), 5126, 'VEC3', 34962),
            'NORMAL': add_acc(head_norm.astype('<f4'), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add_acc(head_uv.astype('<f4'), 5126, 'VEC2', 34962),
        },
        'indices': add_acc(head_tris.flatten().astype('<u4'), 5125, 'SCALAR', 34963),
        'material': 0,
        'targets': add_morph_targets(head_deltas),
    }]
})

# Mesh 1: NeckCrossSection
gltf_meshes.append({
    'name': 'NeckCrossSection',
    'primitives': [{
        'attributes': {
            'POSITION': add_acc(cap_pos.astype('<f4'), 5126, 'VEC3', 34962),
            'NORMAL': add_acc(cap_norm.astype('<f4'), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add_acc(cap_uv.astype('<f4'), 5126, 'VEC2', 34962),
        },
        'indices': add_acc(cap_tris.flatten().astype('<u4'), 5125, 'SCALAR', 34963),
        'material': 1,
    }]
})

# Mesh 2: Eyebrows
b_pos, b_norm, b_uv, b_tris, b_deltas = get_baked_primitive(gltf, b, 1, 0)
b_pos -= HEAD_CENTER
gltf_meshes.append({
    'name': 'Eyebrows',
    'extras': {'targetNames': KEEP_TARGETS},
    'primitives': [{
        'attributes': {
            'POSITION': add_acc(b_pos.astype('<f4'), 5126, 'VEC3', 34962),
            'NORMAL': add_acc(b_norm.astype('<f4'), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add_acc(b_uv.astype('<f4'), 5126, 'VEC2', 34962),
        },
        'indices': add_acc(b_tris.flatten().astype('<u2'), 5123, 'SCALAR', 34963),
        'material': 3,
        'targets': add_morph_targets(b_deltas),
    }]
})

# Mesh 3: Eyelashes
l_pos, l_norm, l_uv, l_tris, l_deltas = get_baked_primitive(gltf, b, 2, 0)
l_pos -= HEAD_CENTER
gltf_meshes.append({
    'name': 'Eyelashes',
    'extras': {'targetNames': KEEP_TARGETS},
    'primitives': [{
        'attributes': {
            'POSITION': add_acc(l_pos.astype('<f4'), 5126, 'VEC3', 34962),
            'NORMAL': add_acc(l_norm.astype('<f4'), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add_acc(l_uv.astype('<f4'), 5126, 'VEC2', 34962),
        },
        'indices': add_acc(l_tris.flatten().astype('<u2'), 5123, 'SCALAR', 34963),
        'material': 4,
        'targets': add_morph_targets(l_deltas),
    }]
})

# Mesh 4: Eyes
eye_prims_out = []
for p_i in range(len(gltf['meshes'][3]['primitives'])):
    e_pos, e_norm, e_uv, e_tris, e_deltas = get_baked_primitive(gltf, b, 3, p_i)
    e_pos -= HEAD_CENTER
    orig_mat_name = gltf['materials'][gltf['meshes'][3]['primitives'][p_i]['material']]['name']
    mat_idx = 5 if orig_mat_name == 'Cornea' else 2
    eye_prims_out.append({
        'attributes': {
            'POSITION': add_acc(e_pos.astype('<f4'), 5126, 'VEC3', 34962),
            'NORMAL': add_acc(e_norm.astype('<f4'), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add_acc(e_uv.astype('<f4'), 5126, 'VEC2', 34962),
        },
        'indices': add_acc(e_tris.flatten().astype('<u2'), 5123, 'SCALAR', 34963),
        'material': mat_idx,
        'targets': add_morph_targets(e_deltas),
    })

gltf_meshes.append({
    'name': 'Eyes',
    'extras': {'targetNames': KEEP_TARGETS},
    'primitives': eye_prims_out,
})

out_bin = b''.join(bin_chunks)
out_gltf = {
    'asset': {'version': '2.0', 'generator': 'CERVIX-3D Real Daz/MakeHuman Head Compiler'},
    'extensionsUsed': ['KHR_mesh_quantization'],
    'extensionsRequired': ['KHR_mesh_quantization'],
    'scene': 0,
    'scenes': [{'nodes': [0, 1, 2, 3, 4]}],
    'nodes': [
        {'name': 'HeadSkin', 'mesh': 0},
        {'name': 'NeckCrossSection', 'mesh': 1},
        {'name': 'Eyebrows', 'mesh': 2},
        {'name': 'Eyelashes', 'mesh': 3},
        {'name': 'Eyes', 'mesh': 4},
    ],
    'meshes': gltf_meshes,
    'materials': gltf_materials,
    'textures': gltf_textures,
    'images': gltf_images,
    'accessors': accessors,
    'bufferViews': buffer_views,
    'buffers': [{'byteLength': len(out_bin)}],
}

head_glb_path = os.path.join(OUT_DIR, 'daz_asian_head_base.glb')
glbutil.write_glb(head_glb_path, out_gltf, out_bin)
print(f"Saved {head_glb_path}: {os.path.getsize(head_glb_path) / 1024:.1f} KB")

# 6. Compile all 7 Real 3D Hair Models into compact, pre-fitted GLBs in `/home/user/public/models/`
HAIR_MODELS = [
    'hair_long01',
    'hair_bob01',
    'hair_bob02',
    'hair_ponytail01',
    'hair_braid01',
    'hair_short02',
    'hair_short04',
]

HAIR_KEEP_TARGETS = ['face_forehead_decr', 'face_forehead_incr', 'face_ear_size_decr', 'face_ear_size_incr', 'face_jaw_width_decr', 'face_jaw_width_incr']

for h_name in HAIR_MODELS:
    src_path = f'/tmp/dl_inspect/{h_name}.glb'
    hg, hb = glbutil.read_glb(src_path)
    h_pos, h_norm, h_uv, h_tris, h_all_deltas = get_baked_primitive(hg, hb, 0, 0, is_hair=True)
    h_pos -= HEAD_CENTER

    h_deltas = [h_all_deltas[KEEP_TARGETS.index(kt)] for kt in HAIR_KEEP_TARGETS]

    im_bv = hg['bufferViews'][hg['images'][0]['bufferView']]
    im_off = im_bv.get('byteOffset', 0)
    h_im = Image.open(io.BytesIO(hb[im_off:im_off+im_bv['byteLength']])).convert('RGBA').resize((512, 512), Image.Resampling.LANCZOS)
    h_im_buf = io.BytesIO()
    h_im.save(h_im_buf, format='PNG', optimize=True)
    h_im_bytes = h_im_buf.getvalue()

    bin_chunks = []
    buffer_views = []
    accessors = []

    tex_bv = add_bv(h_im_bytes)
    h_mesh = {
        'name': h_name,
        'extras': {'targetNames': HAIR_KEEP_TARGETS},
        'primitives': [{
            'attributes': {
                'POSITION': add_acc(h_pos.astype('<f4'), 5126, 'VEC3', 34962),
                'NORMAL': add_acc(h_norm.astype('<f4'), 5126, 'VEC3', 34962),
                'TEXCOORD_0': add_acc(h_uv.astype('<f4'), 5126, 'VEC2', 34962),
            },
            'indices': add_acc(h_tris.flatten().astype('<u2'), 5123, 'SCALAR', 34963),
            'material': 0,
            'targets': add_morph_targets(h_deltas),
        }]
    }
    h_out_bin = b''.join(bin_chunks)
    h_out_gltf = {
        'asset': {'version': '2.0'},
        'extensionsUsed': ['KHR_mesh_quantization'],
        'extensionsRequired': ['KHR_mesh_quantization'],
        'scene': 0,
        'scenes': [{'nodes': [0]}],
        'nodes': [{'name': h_name, 'mesh': 0}],
        'meshes': [h_mesh],
        'materials': [{
            'name': f'Mat_{h_name}',
            'pbrMetallicRoughness': {
                'baseColorTexture': {'index': 0},
                'baseColorFactor': [0.16, 0.13, 0.18, 1.0],
                'metallicFactor': 0.04,
                'roughnessFactor': 0.38,
            },
            'alphaMode': 'MASK',
            'alphaCutoff': 0.18,
            'doubleSided': True,
        }],
        'textures': [{'source': 0}],
        'images': [{'name': h_name, 'mimeType': 'image/png', 'bufferView': tex_bv}],
        'accessors': accessors,
        'bufferViews': buffer_views,
        'buffers': [{'byteLength': len(h_out_bin)}],
    }
    h_out_path = os.path.join(OUT_DIR, f'{h_name}.glb')
    glbutil.write_glb(h_out_path, h_out_gltf, h_out_bin)
    print(f"Saved {h_out_path}: {os.path.getsize(h_out_path) / 1024:.1f} KB ({len(h_pos)} verts)")
