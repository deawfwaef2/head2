#!/usr/bin/env python3
"""
Stage 20 Master Visual Overhaul Script (v2 - Pixel-Exact UV & Tear-Free Hair):
1. Upgrades `public/models/daz_asian_head_base.glb`:
   - Erases the brownish buzz-cut hair stubble on the scalp/temples/forehead of `skin_albedo`.
   - Paints pixel-exact East Asian female lip vermilion around the true UV mouth center
     `u in [0.895, 0.923], v = 0.5168` (upper lip `u=0.896..0.908`, parting seam `u=0.9085`,
     lower lip `u=0.909..0.922`), plus soft cheek blush, nose tip warmth, eyelid depth,
     and the 3 signature right-cheek beauty marks.
2. Rebuilds clean, tear-free `hair_user_photo.glb` & shelf-free `hair_*.glb` meshes:
   - Eliminates the `z = 0.034` hard branch tear on `hair_user_photo.glb`.
   - Eliminates the horizontal flat shelf at `y = -0.093m` on long hair meshes by tapering
     strands inward and trimming triangles that hang below the neck cut plane.
3. Regenerates `public/grooms/photo_tied.groom`, `center_long.groom`, `low_chignon.groom`:
   - Full temple coverage (`鬓角饱满不秃`), high crown ("头包脸"), S-curved face-framing locks,
     and clean termination above the C4/C5 bloody neck cross-section.
"""
import io
import json
import math
import os
import struct
import numpy as np
from PIL import Image, ImageFilter
from scipy.spatial import cKDTree

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(ROOT, 'public', 'models')
GROOMS_DIR = os.path.join(ROOT, 'public', 'grooms')


def read_glb(path):
    with open(path, 'rb') as f:
        raw = f.read()
    jlen = struct.unpack_from('<I', raw, 12)[0]
    gltf = json.loads(raw[20:20 + jlen].decode('utf-8'))
    bin_chunk = raw[28 + jlen:]
    return gltf, bin_chunk


def write_glb(path, gltf, bin_chunk):
    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    jpad = (-len(json_bytes)) % 4
    if jpad:
        json_bytes += b' ' * jpad
    bpad = (-len(bin_chunk)) % 4
    if bpad:
        bin_chunk += b'\x00' * bpad
    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_chunk)
    with open(path, 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, total_len))
        f.write(struct.pack('<I4s', len(json_bytes), b'JSON'))
        f.write(json_bytes)
        f.write(struct.pack('<I4s', len(bin_chunk), b'BIN\x00'))
        f.write(bin_chunk)


def get_acc(gltf, b, idx):
    a = gltf['accessors'][idx]
    bv = gltf['bufferViews'][a['bufferView']]
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    stride = bv.get('byteStride', 0)
    if a['componentType'] == 5122 and stride == 8:
        arr = np.frombuffer(b, dtype='<i2', count=a['count'] * 4, offset=off).reshape(a['count'], 4)[:, :3]
        return arr.astype(np.float32) / 32767.0
    dt = {5126: '<f4', 5123: '<u2', 5125: '<u4', 5122: '<i2'}[a['componentType']]
    ch = {'VEC3': 3, 'VEC2': 2, 'SCALAR': 1}[a['type']]
    return np.frombuffer(b, dtype=dt, count=a['count'] * ch, offset=off).reshape(a['count'], ch)


# ==============================================================================
# PART 1: Upgrade `daz_asian_head_base.glb` Skin Albedo (Pixel-Exact UV Mapping)
# ==============================================================================
head_glb_path = os.path.join(MODELS_DIR, 'daz_asian_head_base.glb')
gltf_h, bin_h = read_glb(head_glb_path)
prim_h = gltf_h['meshes'][0]['primitives'][0]
head_pos = get_acc(gltf_h, bin_h, prim_h['attributes']['POSITION']).astype(np.float64)
head_norm = get_acc(gltf_h, bin_h, prim_h['attributes']['NORMAL']).astype(np.float64)
head_uv = get_acc(gltf_h, bin_h, prim_h['attributes']['TEXCOORD_0']).astype(np.float64)
head_tris = get_acc(gltf_h, bin_h, prim_h['indices']).reshape(-1, 3)

img_bytes_list = []
for im_def in gltf_h['images']:
    bv = gltf_h['bufferViews'][im_def['bufferView']]
    off = bv.get('byteOffset', 0)
    img_bytes_list.append(bin_h[off:off + bv['byteLength']])

skin_im = Image.open(io.BytesIO(img_bytes_list[0])).convert('RGB')
W_s, H_s = skin_im.size
skin_arr = np.asarray(skin_im, dtype=np.float32)

yy, xx = np.mgrid[0:H_s, 0:W_s].astype(np.float32)
u_grid = xx / W_s
v_grid = yy / H_s

# 1A. Erase the brownish buzz-cut hair stubble on the cranium/temples/forehead
clean_ref = np.array([242.0, 198.0, 178.0], dtype=np.float32)
skin_pil_cur = Image.fromarray(np.clip(skin_arr, 0, 255).astype(np.uint8))
skin_smooth = np.asarray(skin_pil_cur.filter(ImageFilter.GaussianBlur(radius=14)), dtype=np.float32)

in_head_uv = (u_grid > 0.60) & (u_grid < 0.96) & (v_grid > 0.14) & (v_grid < 0.86)
central_face_dist = np.hypot((u_grid - 0.875) / 0.095, (v_grid - 0.5168) / 0.125)
scalp_lobe_weight = np.clip((central_face_dist - 0.82) / 0.32, 0.0, 1.0) * in_head_uv.astype(np.float32)
lum_skin = 0.299 * skin_arr[..., 0] + 0.587 * skin_arr[..., 1] + 0.114 * skin_arr[..., 2]
stubble_darkness = np.clip((220.0 - lum_skin) / 36.0, 0.0, 1.0) * scalp_lobe_weight
erase_w = np.clip(scalp_lobe_weight * 0.90 + stubble_darkness * 0.45, 0.0, 0.96)[..., None]

target_scalp_tone = clean_ref[None, None, :] * 0.80 + skin_smooth * 0.20
skin_arr = skin_arr * (1.0 - erase_w) + target_scalp_tone * erase_w

# 1B. Pixel-Exact UV Lip Vermilion, Mouth Parting Line, Cheek Blush, Nose Tip & Eyelids!
# Recall from our exact vertex table on `daz_asian_head_base.glb`:
# - Midline (x = 0) is at v_mid = 0.5168
# - Nose tip (y = -0.0147, z = +0.1141) is at u = 0.8732, v = 0.5168
# - Upper lip Cupid's bow peak (y = -0.0343) is at u = 0.8961, v = 0.5168
# - Mouth parting slit (y = -0.0451) is at u = 0.9072, v = 0.5168
# - Lower lip center (y = -0.0480) is at u = 0.9165, v = 0.5168
# - Lower lip bottom border (y = -0.0511) is at u = 0.9242, v = 0.5168
v_mid = 0.5168
dv = v_grid - v_mid
abs_dv = np.abs(dv)
lip_half_w = 0.0255  # Mouth corner half-width in V

# Corner taper factor (1 at center, 0 at mouth corners |dv| = lip_half_w)
lip_x_env = np.clip(1.0 - (abs_dv / lip_half_w) ** 2.1, 0.0, 1.0)

# Cupid's bow M-curve on upper lip top border: dips slightly at dv=0, peaks at |dv|=0.006
cupid_u_top = 0.8965 + 0.0016 * np.exp(-((abs_dv / 0.0035) ** 2)) - 0.0018 * np.exp(-(((abs_dv - 0.0065) / 0.0045) ** 2)) + 0.0085 * ((abs_dv / lip_half_w) ** 1.8)
seam_u = 0.9074 - 0.0012 * ((abs_dv / lip_half_w) ** 1.6)
lower_u_bot = 0.9225 - 0.0095 * ((abs_dv / lip_half_w) ** 1.7)

# Smooth upper lip vermilion mask
upper_lip_w = (
    np.clip((u_grid - cupid_u_top) / 0.0028, 0.0, 1.0)
    * np.clip((seam_u + 0.0015 - u_grid) / 0.0025, 0.0, 1.0)
    * lip_x_env
)
# Smooth lower lip vermilion mask
lower_lip_w = (
    np.clip((u_grid - (seam_u - 0.0010)) / 0.0025, 0.0, 1.0)
    * np.clip((lower_u_bot - u_grid) / 0.0038, 0.0, 1.0)
    * lip_x_env
)
# Delicate oral commissure / mouth parting line shadow
seam_w = np.exp(-(((u_grid - seam_u) / 0.0014) ** 2)) * np.clip(1.0 - (abs_dv / (lip_half_w * 0.96)) ** 2.4, 0.0, 1.0)

# Also erase any old low-chin pink smudge between u = 0.924 and u = 0.942 near v_mid!
chin_clean_w = (
    np.clip((u_grid - 0.9225) / 0.0030, 0.0, 1.0)
    * np.clip((0.945 - u_grid) / 0.0040, 0.0, 1.0)
    * np.exp(-((abs_dv / 0.032) ** 2))
)[..., None]
skin_arr = skin_arr * (1.0 - 0.75 * chin_clean_w) + clean_ref[None, None, :] * (0.75 * chin_clean_w)

# Blur lip masks slightly for natural feathered vermilion border
def blur_np(arr2d, rad):
    im_t = Image.fromarray((np.clip(arr2d, 0.0, 1.0) * 255.0).astype(np.uint8))
    return (np.asarray(im_t.filter(ImageFilter.GaussianBlur(radius=rad)), dtype=np.float32) / 255.0)[..., None]

up_lip_mask = blur_np(upper_lip_w, 2.2)
lo_lip_mask = blur_np(lower_lip_w, 2.8)
seam_mask = blur_np(seam_w, 1.2)

# Subtle vertical lip micro-striations (realistic lip texture)
lip_striations = (0.5 + 0.5 * np.sin(dv * 1850.0) * np.cos(dv * 920.0))[..., None]
up_color = np.array([182.0, 88.0, 98.0])[None, None, :] * (0.96 + 0.06 * lip_striations)
lo_color = np.array([198.0, 102.0, 112.0])[None, None, :] * (0.95 + 0.08 * lip_striations)
seam_color = np.array([105.0, 38.0, 46.0])[None, None, :]

skin_arr = skin_arr * (1.0 - 0.58 * up_lip_mask) + up_color * (0.58 * up_lip_mask)
skin_arr = skin_arr * (1.0 - 0.54 * lo_lip_mask) + lo_color * (0.54 * lo_lip_mask)
skin_arr = skin_arr * (1.0 - 0.55 * seam_mask) + seam_color * (0.55 * seam_mask)

# Subtle lower lip moisture highlight & Cupid's bow highlight
lo_hi_w = (np.exp(-(((u_grid - 0.9145) / 0.0025) ** 2)) * np.exp(-((abs_dv / 0.011) ** 2)))[..., None]
cupid_hi_w = (np.exp(-(((u_grid - 0.8955) / 0.0018) ** 2)) * np.exp(-((abs_dv / 0.008) ** 2)))[..., None]
skin_arr = np.clip(skin_arr + lo_hi_w * np.array([22.0, 16.0, 18.0]) + cupid_hi_w * np.array([18.0, 14.0, 12.0]), 0, 255)

# Soft rosy cheek blush & nose tip warmth in UV space
cheek_l = np.exp(-(((u_grid - 0.868) / 0.032) ** 2) - (((v_grid - (v_mid - 0.052)) / 0.038) ** 2))
cheek_r = np.exp(-(((u_grid - 0.868) / 0.032) ** 2) - (((v_grid - (v_mid + 0.052)) / 0.038) ** 2))
nose_tip_w = np.exp(-(((u_grid - 0.874) / 0.012) ** 2) - ((abs_dv / 0.014) ** 2))
blush_total = np.clip(cheek_l + cheek_r + nose_tip_w * 0.65, 0.0, 1.0)[..., None]
skin_arr = skin_arr * (1.0 - 0.16 * blush_total) + np.array([235.0, 136.0, 134.0])[None, None, :] * (0.16 * blush_total)

# Re-affirm the 3 signature right-cheek moles (matching user photo)
MOLE_LOCAL = [
    (-0.031, -0.024, 0.092),
    (-0.039, -0.028, 0.086),
    (-0.043, -0.044, 0.080),
]
for mx, my, mz in MOLE_LOCAL:
    dists = np.hypot(head_pos[:, 0] - mx, head_pos[:, 1] - my) + np.abs(head_pos[:, 2] - mz) * 0.5
    bvi = int(np.argmin(dists))
    cx_u = int(head_uv[bvi, 0] * W_s)
    cy_v = int(head_uv[bvi, 1] * H_s)
    for py in range(max(0, cy_v - 3), min(H_s, cy_v + 4)):
        for px in range(max(0, cx_u - 3), min(W_s, cx_u + 4)):
            d_p = math.hypot(px - cx_u, py - cy_v)
            if d_p < 2.2:
                mw = math.exp(-((d_p / 1.3) ** 2)) * 0.68
                skin_arr[py, px] = skin_arr[py, px] * (1.0 - mw) + np.array([62.0, 38.0, 32.0]) * mw

skin_out_buf = io.BytesIO()
Image.fromarray(np.clip(skin_arr, 0, 255).astype(np.uint8)).save(skin_out_buf, format='JPEG', quality=94)
img_bytes_list[0] = skin_out_buf.getvalue()

new_bin_chunks = []
image_bv_Map = {im_def['bufferView']: idx for idx, im_def in enumerate(gltf_h['images'])}
for bv_idx, bv in enumerate(gltf_h['bufferViews']):
    off = sum(len(c) for c in new_bin_chunks)
    pad = (-off) % 4
    if pad:
        new_bin_chunks.append(b'\x00' * pad)
        off += pad
    if bv_idx in image_bv_Map:
        raw_part = img_bytes_list[image_bv_Map[bv_idx]]
    else:
        old_off = bv.get('byteOffset', 0)
        raw_part = bin_h[old_off:old_off + bv['byteLength']]
    bv['byteOffset'] = off
    bv['byteLength'] = len(raw_part)
    new_bin_chunks.append(raw_part)

new_bin_h = b''.join(new_bin_chunks)
gltf_h['buffers'][0]['byteLength'] = len(new_bin_h)
write_glb(head_glb_path, gltf_h, new_bin_h)
print(f"Upgraded {head_glb_path}: {os.path.getsize(head_glb_path)/1024:.1f} KB")


# ==============================================================================
# PART 2: Repair All 8 `public/models/hair_*.glb` Meshes (Tear-Free & Shelf-Free)
# ==============================================================================
scalp_mask = head_pos[:, 1] > -0.055
scalp_pts = head_pos[scalp_mask]
scalp_norms = head_norm[scalp_mask]
scalp_norms /= np.maximum(np.linalg.norm(scalp_norms, axis=1, keepdims=True), 1e-8)

tri_centers = (head_pos[head_tris[:, 0]] + head_pos[head_tris[:, 1]] + head_pos[head_tris[:, 2]]) / 3.0
tri_norms = (head_norm[head_tris[:, 0]] + head_norm[head_tris[:, 1]] + head_norm[head_tris[:, 2]]) / 3.0
tri_norms /= np.maximum(np.linalg.norm(tri_norms, axis=1, keepdims=True), 1e-8)
dense_scalp_pts = np.vstack([scalp_pts, tri_centers[tri_centers[:, 1] > -0.055]])
dense_scalp_norms = np.vstack([scalp_norms, tri_norms[tri_centers[:, 1] > -0.055]])
dense_tree = cKDTree(dense_scalp_pts)

HEAD_CORE = np.array([0.0, 0.025, -0.012], dtype=np.float64)


def repair_hair_mesh_positions(pos_arr, h_name, min_clearance=0.0036):
    out = pos_arr.astype(np.float64).copy()

    # For `hair_user_photo.glb`, rebuild its side locks from `hair_bob01.glb` + back bun from `hair_user_photo.glb`
    # WITHOUT the discontinuous `z < 0.034` branch that tore cheek triangles!
    if h_name == 'hair_user_photo.glb' and len(out) == 5029:
        g_b1, b_b1 = read_glb(os.path.join(MODELS_DIR, 'hair_bob01.glb'))
        pr_b1 = g_b1['meshes'][0]['primitives'][0]
        pa_b1 = g_b1['accessors'][pr_b1['attributes']['POSITION']]
        bvp_b1 = g_b1['bufferViews'][pa_b1['bufferView']]
        off_b1 = bvp_b1.get('byteOffset', 0) + pa_b1.get('byteOffset', 0)
        p_bob = np.frombuffer(b_b1, dtype='<f4', count=2806 * 3, offset=off_b1).reshape(2806, 3).astype(np.float64).copy()
        for i in range(2806):
            x, y, z = p_bob[i]
            # Smoothly feather front bangs into a soft, airy arched contour above the eyebrows
            if z > 0.058 and y < 0.068 and abs(x) < 0.060:
                t_tip = max(0.0, min(1.0, (0.058 - y) / 0.040))
                arch = max(0.0, 1.0 - (x / 0.048) ** 2)
                p_bob[i, 1] += (0.0055 * arch + 0.0018 * math.sin(x * 165.0)) * t_tip
                p_bob[i, 2] += 0.0022 * arch * t_tip
            # Smoothly taper lower bob sides & back using a continuous sigmoid in Z (NO tear!)
            if y < 0.042:
                t_down = max(0.0, min(1.0, (0.042 - y) / 0.115))
                t_down = t_down * t_down * (3.0 - 2.0 * t_down)
                # Smooth blend between front cheek wisp (z > 0.025) and back ear-revealing sweep (z < 0.025)
                u_front = max(0.0, min(1.0, (z - (-0.002)) / 0.042))
                u_front = u_front * u_front * (3.0 - 2.0 * u_front)
                u_back = 1.0 - u_front

                # Back part pulls gently behind the ear into the bun at y = -0.024
                bx = x * (1.0 - 0.42 * t_down)
                by = y * (1.0 - 0.54 * t_down) + (-0.024) * (0.54 * t_down)
                bz = z - 0.014 * t_down

                # Front part frames the temple & upper cheek, tapering into a sleek pointed wisp at y = -0.042
                fx = x * (1.0 - 0.15 * t_down)
                fy = y * (1.0 - 0.42 * t_down) + (-0.042) * (0.42 * t_down)
                fz = z + 0.005 * (1.0 - t_down)

                p_bob[i, 0] = bx * u_back + fx * u_front
                p_bob[i, 1] = by * u_back + fy * u_front
                p_bob[i, 2] = bz * u_back + fz * u_front
        out[:2806] = p_bob

    # 1) Cranial clearance above y = -0.030 so skull NEVER pokes through hair triangles
    _, near_idx = dense_tree.query(out)
    sp = dense_scalp_pts[near_idx]
    sn = dense_scalp_norms[near_idx]
    sd = np.sum((out - sp) * sn, axis=1)
    need_push = (out[:, 1] > -0.030) & (sd < min_clearance)
    out[need_push] += sn[need_push] * (min_clearance - sd[need_push])[:, None]

    # 2) Eliminate invisible-shoulder flare & flat pancake lines below y = -0.015m:
    #    Original MakeHuman long hairs flare out to |x| = 0.24m to rest on human shoulders.
    #    On a head-only bust ("只有头，有断面"), we smoothly pull any shoulder-flaring vertices
    #    inward toward a natural neck-hugging / nape-gathered silhouette (r_xz <= 0.072m) and
    #    taper lower tips smoothly behind the neck above y = -0.092m!
    low_v = out[:, 1] < -0.010
    if np.any(low_v):
        pts_l = out[low_v].copy()
        depth = np.maximum(0.0, -0.010 - pts_l[:, 1])  # 0 at earlobe (-0.01m), up to 0.48m at chest
        t_sh = np.tanh(depth / 0.085)  # 0 -> 1 smoothly as hair goes down

        # Pull excessive shoulder flare (r_xz > 0.068m) smoothly inward
        cx_n, cz_n = 0.0, -0.018
        dx_n = pts_l[:, 0] - cx_n
        dz_n = pts_l[:, 2] - cz_n
        r_xz = np.hypot(dx_n, dz_n)
        max_r = 0.074 - 0.016 * t_sh  # Narrows from 7.4cm at jaw to 5.8cm near neck base (C-curl)
        excess = np.maximum(0.0, r_xz - max_r)
        new_r = np.where(r_xz > max_r, max_r + 0.18 * np.tanh(excess / 0.045) * 0.045, r_xz)
        scale_r = np.where(r_xz > 1e-5, new_r / np.maximum(r_xz, 1e-5), 1.0)
        pts_l[:, 0] = cx_n + dx_n * scale_r
        pts_l[:, 2] = cz_n + dz_n * scale_r

        # Sweep only extreme chest/back-drape strands (depth > 0.14m) gently toward the nape
        deep_w = np.clip((depth - 0.140) / 0.180, 0.0, 1.0)
        deep_w = deep_w * deep_w * (3.0 - 2.0 * deep_w)
        pts_l[:, 2] = pts_l[:, 2] * (1.0 - 0.32 * deep_w) + (-0.045) * (0.32 * deep_w)
        pts_l[:, 0] *= (1.0 - 0.18 * deep_w)

        # Smooth vertical C-taper down to y = -0.078m (jawline/upper neck, never a flat pancake!)
        pts_l[:, 1] = -0.010 - 0.068 * np.tanh(depth / 0.095)

        # Smoothly part any front strands around the central face/throat oval (no hard step!)
        front_w = np.clip((pts_l[:, 2] - (-0.010)) / 0.035, 0.0, 1.0) * np.clip((-0.035 - pts_l[:, 1]) / 0.025, 0.0, 1.0)
        min_abs_x = 0.048
        need_part = (front_w > 0.0) & (np.abs(pts_l[:, 0]) < min_abs_x)
        if np.any(need_part):
            sx = np.where(pts_l[need_part, 0] >= 0, 1.0, -1.0)
            target_x = sx * (min_abs_x + np.abs(pts_l[need_part, 0]) * 0.15)
            w_p = front_w[need_part]
            pts_l[need_part, 0] = pts_l[need_part, 0] * (1.0 - w_p) + target_x * w_p
        out[low_v] = pts_l

    return out.astype(np.float32)


for h_name in sorted(os.listdir(MODELS_DIR)):
    if not (h_name.startswith('hair_') and h_name.endswith('.glb')):
        continue
    h_path = os.path.join(MODELS_DIR, h_name)
    g_hair, b_hair = read_glb(h_path)
    pr_hair = g_hair['meshes'][0]['primitives'][0]
    p_acc = g_hair['accessors'][pr_hair['attributes']['POSITION']]
    bv_p = g_hair['bufferViews'][p_acc['bufferView']]
    off_p = bv_p.get('byteOffset', 0) + p_acc.get('byteOffset', 0)
    pos_h = np.frombuffer(b_hair, dtype='<f4', count=p_acc['count'] * 3, offset=off_p).reshape(p_acc['count'], 3).copy()
    pos_fixed = repair_hair_mesh_positions(pos_h, h_name, min_clearance=0.0046)
    p_acc['min'] = pos_fixed.min(axis=0).astype(float).tolist()
    p_acc['max'] = pos_fixed.max(axis=0).astype(float).tolist()
    b_hair_mut = bytearray(b_hair)
    b_hair_mut[off_p:off_p + pos_fixed.nbytes] = pos_fixed.tobytes()
    write_glb(h_path, g_hair, bytes(b_hair_mut))
    print(f"Repaired {h_name}: minY={pos_fixed[:,1].min():.4f}, maxY={pos_fixed[:,1].max():.4f}")


# ==============================================================================
# PART 3: Fast Precomputed Spherical Scalp Grid + Vectorized `.groom` Generator
# ==============================================================================
N_THETA, N_PHI = 256, 512
th_vals = np.linspace(0.0, math.pi, N_THETA)
ph_vals = np.linspace(-math.pi, math.pi, N_PHI)
TH, PH = np.meshgrid(th_vals, ph_vals, indexing='ij')
dirs_grid = np.stack([np.sin(TH) * np.sin(PH), np.cos(TH), np.sin(TH) * np.cos(PH)], axis=-1).reshape(-1, 3)

scalp_rel = dense_scalp_pts - HEAD_CORE
scalp_r = np.linalg.norm(scalp_rel, axis=1)
scalp_u = scalp_rel / np.maximum(scalp_r[:, None], 1e-8)
dir_tree = cKDTree(scalp_u)
_, g_idx = dir_tree.query(dirs_grid, k=6)
g_pts = dense_scalp_pts[g_idx].mean(axis=1).reshape(N_THETA, N_PHI, 3)
g_nrms = dense_scalp_norms[g_idx].mean(axis=1)
g_nrms /= np.maximum(np.linalg.norm(g_nrms, axis=1, keepdims=True), 1e-8)
g_nrms = g_nrms.reshape(N_THETA, N_PHI, 3)


def sample_scalp_fast(theta, phi, lift=0.0022):
    ti = int(np.clip(theta / math.pi * (N_THETA - 1), 0, N_THETA - 1))
    pi = int(np.clip((phi + math.pi) / (2.0 * math.pi) * (N_PHI - 1), 0, N_PHI - 1))
    p = g_pts[ti, pi]
    n = g_nrms[ti, pi]
    return p + n * lift, n


def enforce_skull_clearance_batch(curves, min_clear=0.0028):
    N, S, _ = curves.shape
    flat = curves.reshape(-1, 3)
    _, idx = dense_tree.query(flat)
    sp = dense_scalp_pts[idx]
    sn = dense_scalp_norms[idx]
    sd = np.sum((flat - sp) * sn, axis=1)
    mask = (flat[:, 1] > -0.045) & (sd < min_clear)
    flat[mask] += sn[mask] * (min_clear - sd[mask])[:, None]

    # Smooth C2-continuous Facial Feature Keep-Out Field (below eyebrows y < 0.024m, in front of ears z > 0.022m)
    # Ensures NO hair strand ever dangles across the eyes, nose bridge, or lips, and NEVER kinks!
    wy = 1.0 / (1.0 + np.exp((flat[:, 1] - 0.022) / 0.007))
    wz = 1.0 / (1.0 + np.exp(-(flat[:, 2] - 0.025) / 0.014))
    w_face = wy * wz
    x_cheek = 0.055 - 0.006 * np.clip((-0.010 - flat[:, 1]) / 0.065, 0.0, 1.0)
    abs_x = np.abs(flat[:, 0])
    need_cheek = (w_face > 0.01) & (abs_x < x_cheek)
    if np.any(need_cheek):
        # Determine side from each curve's root/mid X so all vertices of a strand move to the SAME side!
        curve_side = np.where(curves[:, 4, 0] >= 0.0, 1.0, -1.0)[:, None]
        flat_side = np.broadcast_to(curve_side, (N, S)).reshape(-1)[need_cheek]
        target_x = flat_side * (x_cheek[need_cheek] + abs_x[need_cheek] * 0.12)
        wf = w_face[need_cheek]
        flat[need_cheek, 0] = flat[need_cheek, 0] * (1.0 - wf) + target_x * wf

    # Smooth vertical compression below y = -0.052m so strands end cleanly above the neck blood section
    low = flat[:, 1] < -0.052
    if np.any(low):
        pts_l = flat[low]
        dy = np.maximum(0.0, -0.052 - pts_l[:, 1])
        pts_l[:, 1] = -0.052 - 0.026 * np.tanh(dy / 0.038)
        flat[low] = pts_l

    curves = flat.reshape(N, S, 3)
    # Apply 2 passes of 1D Laplacian smoothing along each strand (preserving root j=0) for silky-smooth curves
    for _ in range(2):
        curves[:, 1:-1, :] = 0.22 * curves[:, :-2, :] + 0.56 * curves[:, 1:-1, :] + 0.22 * curves[:, 2:, :]
    return curves


def make_clump_guides(n_guides, theta_range, phi_range, rng):
    guides = []
    for _ in range(n_guides):
        th = rng.uniform(theta_range[0], theta_range[1])
        ph = rng.uniform(phi_range[0], phi_range[1])
        phase = rng.uniform(0, 2 * math.pi)
        curl = rng.uniform(-1.0, 1.0)
        guides.append((th, ph, phase, curl))
    return guides


def build_photo_tied_groom(count=12000, samples=36):
    rng = np.random.default_rng(20260420)
    curves = np.zeros((count, samples, 3), dtype=np.float32)
    radii = np.zeros(count, dtype=np.float32)
    families = np.zeros(count, dtype=np.uint8)
    pigments = rng.integers(95, 245, size=count, dtype=np.uint8)
    t_arr = np.linspace(0.0, 1.0, samples, dtype=np.float32)
    n_crown = int(count * 0.56)
    n_temple = int(count * 0.20)
    n_bangs = int(count * 0.13)
    clump_guides = make_clump_guides(96, (0.08, 1.50), (-math.pi, math.pi), rng)
    tie_pos = np.array([0.0, -0.022, -0.088], dtype=np.float32)

    for i in range(count):
        if i < n_crown:
            u = rng.uniform(0.0, 1.0)
            theta = 0.05 + (u ** 0.72) * 1.48
            phi = rng.uniform(-math.pi, math.pi)
            if abs(phi) < 0.62 and theta > 0.70:
                phi = math.copysign(0.62 + abs(phi) * 0.85, phi if phi != 0 else 1.0)
            g_th, g_ph, g_phase, g_curl = clump_guides[i % len(clump_guides)]
            theta = 0.84 * theta + 0.16 * g_th
            phi = 0.86 * phi + 0.14 * g_ph
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0028)
            side = 1.0 if root[0] >= 0 else -1.0
            mid = np.array([
                side * (0.068 + 0.012 * math.sin(abs(phi))) * (0.65 + 0.35 * (1.0 - abs(phi) / math.pi)),
                max(-0.008, root[1] * 0.48 + 0.018),
                root[2] * 0.42 - 0.048,
            ], dtype=np.float32)
            m_norm = np.linalg.norm(mid - HEAD_CORE)
            if m_norm < 0.098:
                mid = HEAD_CORE + (mid - HEAD_CORE) / max(m_norm, 1e-6) * 0.098
            end = tie_pos + np.array([
                rng.normal(0.0, 0.008),
                rng.normal(-0.012, 0.008),
                -0.012 + rng.normal(0.0, 0.005),
            ], dtype=np.float32)
            s = t_arr[:, None]
            pts = ((1.0 - s) ** 2) * root + 2.0 * (1.0 - s) * s * mid + (s ** 2) * end
            pts += nrm * (np.sin(t_arr * math.pi) * (0.006 + 0.0018 * g_curl))[:, None]
            pts[:, 0] += np.sin(t_arr * 5.0 + g_phase) * 0.0012 * t_arr
            curves[i] = pts
            radii[i] = rng.uniform(0.00072, 0.00096)
            families[i] = 3 if (i % 24 == 0) else 0

        elif i < n_crown + n_temple:
            side = 1.0 if (i % 2 == 0) else -1.0
            sub = rng.random()
            if sub < 0.48:
                # Sleek cheek-framing temple wisps rooted at the sideburn/temple hairline (|phi| in [0.68, 0.96])
                theta = rng.uniform(0.74, 1.18)
                phi = side * rng.uniform(0.68, 0.96)
                root, nrm = sample_scalp_fast(theta, phi, lift=0.0028)
                wisp_len = rng.uniform(0.058, 0.088)
                curl_in = rng.uniform(0.004, 0.010)
                pts = (
                    root[None, :]
                    + nrm[None, :] * (np.sin(t_arr * math.pi * 0.72) * 0.0040)[:, None]
                    + np.stack([
                        side * (0.005 * np.sin(t_arr * math.pi * 0.6) - curl_in * (t_arr ** 1.7)),
                        -wisp_len * (t_arr ** 1.08),
                        (0.006 * np.sin(t_arr * math.pi) - 0.006 * (t_arr ** 1.6)),
                    ], axis=-1)
                )
                radii[i] = rng.uniform(0.00060, 0.00080)
                families[i] = 2
            else:
                theta = rng.uniform(0.68, 1.32)
                phi = side * rng.uniform(0.82, 1.68)
                root, nrm = sample_scalp_fast(theta, phi, lift=0.0028)
                mid = np.array([side * 0.076, root[1] * 0.52 + 0.005, root[2] * 0.50 - 0.032], dtype=np.float32)
                end = tie_pos + np.array([side * 0.010, rng.uniform(-0.010, 0.006), -0.006], dtype=np.float32)
                s = t_arr[:, None]
                pts = ((1.0 - s) ** 2) * root + 2.0 * (1.0 - s) * s * mid + (s ** 2) * end
                pts += nrm * (np.sin(t_arr * math.pi) * 0.0045)[:, None]
                radii[i] = rng.uniform(0.00070, 0.00092)
                families[i] = 0
            curves[i] = pts

        elif i < n_crown + n_temple + n_bangs:
            # Wispy arched air-bangs staying cleanly above the eyebrows in the center, blending into temple wisps at edges
            phi = rng.normal(-0.02, 0.25)
            phi = float(np.clip(phi, -0.46, 0.46))
            theta = rng.uniform(0.58, 0.80)
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0028)
            edge_ratio = min(1.0, abs(phi) / 0.45)
            bang_len = rng.uniform(0.028, 0.042) * (0.78 + 0.36 * (edge_ratio ** 1.6))
            sweep_x = (0.004 + 0.012 * edge_ratio) * math.copysign(1.0, phi + 0.03)
            pts = (
                root[None, :]
                + np.stack([
                    sweep_x * (t_arr ** 1.20),
                    -bang_len * (t_arr ** 1.10),
                    np.sin(t_arr * math.pi * 0.80) * 0.0075 - 0.0030 * (t_arr ** 2),
                ], axis=-1)
            )
            curves[i] = pts
            radii[i] = rng.uniform(0.00056, 0.00076)
            families[i] = 1

        else:
            ang = rng.uniform(0.0, 2.0 * math.pi)
            rad = rng.uniform(0.003, 0.026)
            tail_len = rng.uniform(0.032, 0.056)
            pts = np.stack([
                tie_pos[0] + math.cos(ang) * rad * (0.45 + 0.70 * np.sin(t_arr * math.pi)),
                tie_pos[1] + math.sin(ang) * rad * 0.55 * (1.0 - 0.4 * t_arr) - tail_len * (t_arr ** 1.15),
                tie_pos[2] - 0.006 - np.sin(t_arr * math.pi) * 0.018 - 0.008 * t_arr,
            ], axis=-1)
            curves[i] = pts
            radii[i] = rng.uniform(0.00072, 0.00094)
            families[i] = 0

    curves = enforce_skull_clearance_batch(curves, min_clear=0.0028)
    return curves, radii, families, pigments


def build_center_long_groom(count=12000, samples=36):
    rng = np.random.default_rng(20260421)
    curves = np.zeros((count, samples, 3), dtype=np.float32)
    radii = np.zeros(count, dtype=np.float32)
    families = np.zeros(count, dtype=np.uint8)
    pigments = rng.integers(95, 245, size=count, dtype=np.uint8)
    t_arr = np.linspace(0.0, 1.0, samples, dtype=np.float32)
    clump_guides = make_clump_guides(108, (0.06, 1.48), (-math.pi, math.pi), rng)

    for i in range(count):
        if i < int(count * 0.16):
            # True S-curve curtain bangs ("八字刘海"): root near center part, sweep OUTWARD to temples (|x| -> 0.060m)
            side = 1.0 if (i % 2 == 0) else -1.0
            phi = side * rng.uniform(0.08, 0.52)
            theta = rng.uniform(0.56, 0.84)
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0028)
            curtain_len = rng.uniform(0.068, 0.110)
            outward_x = max(0.018, 0.062 - abs(root[0]))
            pts = (
                root[None, :]
                + nrm[None, :] * (np.sin(t_arr * math.pi * 0.65) * 0.0060)[:, None]
                + np.stack([
                    side * (outward_x * np.sin(t_arr * math.pi * 0.58) - 0.006 * (t_arr ** 2.4)),
                    -curtain_len * (t_arr ** 1.12),
                    0.008 * np.sin(t_arr * math.pi * 0.65) - 0.014 * (t_arr ** 1.5),
                ], axis=-1)
            )
            curves[i] = pts
            radii[i] = rng.uniform(0.00062, 0.00082)
            families[i] = 1
        else:
            u = rng.uniform(0.0, 1.0)
            theta = 0.06 + (u ** 0.74) * 1.44
            phi = rng.uniform(-math.pi, math.pi)
            if abs(phi) < 0.045 and theta < 0.95:
                phi = math.copysign(0.045 + abs(phi), phi if phi != 0 else 1.0)
            if abs(phi) < 0.58 and theta > 0.70:
                phi = math.copysign(0.58 + abs(phi) * 0.85, phi if phi != 0 else 1.0)
            g_th, g_ph, g_phase, g_curl = clump_guides[i % len(clump_guides)]
            theta = 0.85 * theta + 0.15 * g_th
            phi = 0.86 * phi + 0.14 * g_ph
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0028)
            side = 1.0 if root[0] >= 0 else -1.0
            drop_y = max(-0.076, -0.056 - 0.018 * ((1.0 - abs(phi) / math.pi) ** 1.2) + rng.normal(0.0, 0.004))
            total_drop = max(0.060, root[1] - drop_y)
            c_curl = t_arr ** 2.0
            wave = np.sin(t_arr * 4.8 + g_phase) * 0.0028 * t_arr
            temple_push = max(0.0, 0.062 - abs(root[0])) * max(0.0, 1.0 - abs(phi) / 1.2)
            pts = np.stack([
                root[0] + nrm[0] * (np.sin(t_arr * math.pi * 0.75) * 0.009) + side * ((0.010 + temple_push) * np.sin(t_arr * math.pi * 0.62) - 0.010 * c_curl) + wave,
                root[1] + nrm[1] * (np.sin(t_arr * math.pi * 0.5) * 0.006) - total_drop * (t_arr ** 1.08),
                root[2] + nrm[2] * (np.sin(t_arr * math.pi * 0.7) * 0.008) - 0.014 * (t_arr ** 1.4) + 0.006 * c_curl,
            ], axis=-1)
            curves[i] = pts
            radii[i] = rng.uniform(0.00072, 0.00096)
            families[i] = 2 if (abs(phi) < 1.05 and theta > 0.70) else (3 if (i % 25 == 0) else 0)

    curves = enforce_skull_clearance_batch(curves, min_clear=0.0028)
    return curves, radii, families, pigments


def build_low_chignon_groom(count=12000, samples=36):
    rng = np.random.default_rng(20260422)
    curves = np.zeros((count, samples, 3), dtype=np.float32)
    radii = np.zeros(count, dtype=np.float32)
    families = np.zeros(count, dtype=np.uint8)
    pigments = rng.integers(95, 245, size=count, dtype=np.uint8)
    t_arr = np.linspace(0.0, 1.0, samples, dtype=np.float32)
    clump_guides = make_clump_guides(96, (0.06, 1.48), (-math.pi, math.pi), rng)
    chignon_center = np.array([0.0, -0.032, -0.092], dtype=np.float32)
    n_swept = int(count * 0.64)
    n_drape = int(count * 0.18)

    for i in range(count):
        if i < n_swept:
            u = rng.uniform(0.0, 1.0)
            theta = 0.06 + (u ** 0.74) * 1.44
            phi = rng.uniform(-math.pi, math.pi)
            if abs(phi) < 0.58 and theta > 0.72:
                phi = math.copysign(0.58 + abs(phi) * 0.85, phi if phi != 0 else 1.0)
            g_th, g_ph, g_phase, _ = clump_guides[i % len(clump_guides)]
            theta = 0.85 * theta + 0.15 * g_th
            phi = 0.86 * phi + 0.14 * g_ph
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0028)
            side = 1.0 if root[0] >= 0 else -1.0
            mid = np.array([
                side * (0.072 + 0.010 * math.sin(abs(phi))),
                max(-0.015, root[1] * 0.45 + 0.012),
                root[2] * 0.42 - 0.050,
            ], dtype=np.float32)
            m_norm = np.linalg.norm(mid - HEAD_CORE)
            if m_norm < 0.098:
                mid = HEAD_CORE + (mid - HEAD_CORE) / max(m_norm, 1e-6) * 0.098
            end = chignon_center + np.array([
                rng.normal(0.0, 0.014),
                rng.normal(0.0, 0.010),
                rng.normal(-0.004, 0.006),
            ], dtype=np.float32)
            s = t_arr[:, None]
            pts = ((1.0 - s) ** 2) * root + 2.0 * (1.0 - s) * s * mid + (s ** 2) * end
            pts += nrm * (np.sin(t_arr * math.pi) * 0.0065)[:, None]
            curves[i] = pts
            radii[i] = rng.uniform(0.00072, 0.00096)
            families[i] = 3 if (i % 25 == 0) else 0

        elif i < n_swept + n_drape:
            is_right_sweep = (i % 5 != 0)
            phi = rng.uniform(0.15, 0.82) if is_right_sweep else rng.uniform(-0.85, -0.32)
            theta = rng.uniform(0.58, 0.96)
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0028)
            side = 1.0 if phi >= 0 else -1.0
            wisp_len = rng.uniform(0.070, 0.108)
            pts = (
                root[None, :]
                + nrm[None, :] * (np.sin(t_arr * math.pi * 0.7) * 0.0055)[:, None]
                + np.stack([
                    side * (0.014 * np.sin(t_arr * math.pi * 0.72) - 0.012 * (t_arr ** 1.8)),
                    -wisp_len * (t_arr ** 1.08),
                    0.010 * np.sin(t_arr * math.pi * 0.75) - 0.014 * (t_arr ** 1.6),
                ], axis=-1)
            )
            curves[i] = pts
            radii[i] = rng.uniform(0.00062, 0.00082)
            families[i] = 1 if abs(phi) < 0.55 else 2

        else:
            u = rng.uniform(0.0, 2.0 * math.pi)
            v = rng.uniform(0.0, 2.0 * math.pi)
            R = 0.024 + rng.normal(0.0, 0.003)
            r = 0.011 + rng.normal(0.0, 0.002)
            theta_t = u + t_arr * 2.2 * math.pi
            phi_t = v + t_arr * 4.4 * math.pi
            pts = np.stack([
                chignon_center[0] + (R + r * np.cos(phi_t)) * np.cos(theta_t) * 1.15,
                chignon_center[1] + (R + r * np.cos(phi_t)) * np.sin(theta_t) * 0.82,
                chignon_center[2] - 0.008 + r * np.sin(phi_t),
            ], axis=-1)
            curves[i] = pts
            radii[i] = rng.uniform(0.00072, 0.00095)
            families[i] = 0

    curves = enforce_skull_clearance_batch(curves, min_clear=0.0028)
    return curves, radii, families, pigments


def write_groom_h2grm002(path, curves, radii, families, pigments):
    count, samples, _ = curves.shape
    bmin = curves.min(axis=(0, 1)).astype(np.float32)
    bmax = curves.max(axis=(0, 1)).astype(np.float32)
    bsize = np.maximum(bmax - bmin, 1e-6)
    q = np.clip(np.round((curves - bmin) / bsize * 65535.0), 0, 65535).astype(np.uint16)
    planes = np.transpose(q, (2, 0, 1))
    deltas = np.empty_like(planes, dtype=np.uint16)
    deltas[:, :, 0] = planes[:, :, 0]
    deltas[:, :, 1:] = (planes[:, :, 1:] - planes[:, :, :-1]) & 0xFFFF
    flat = deltas.reshape(-1)
    low = (flat & 0xFF).astype(np.uint8).tobytes()
    high = ((flat >> 8) & 0xFF).astype(np.uint8).tobytes()
    header = struct.pack('<8sIIffffff', b'H2GRM002', count, samples,
                         float(bmin[0]), float(bmin[1]), float(bmin[2]),
                         float(bmax[0]), float(bmax[1]), float(bmax[2]))
    meta = bytearray(count * 8)
    for i in range(count):
        struct.pack_into('<fBBH', meta, i * 8, float(radii[i]), int(families[i]), int(pigments[i]), 0)
    with open(path, 'wb') as f:
        f.write(header)
        f.write(meta)
        f.write(low)
        f.write(high)
    print(f"Wrote {path}: {count} curves x {samples} samples ({os.path.getsize(path)/1024:.1f} KB)")


os.makedirs(GROOMS_DIR, exist_ok=True)
for gid, builder in [
    ('photo_tied', build_photo_tied_groom),
    ('center_long', build_center_long_groom),
    ('low_chignon', build_low_chignon_groom),
]:
    c_arr, r_arr, f_arr, p_arr = builder(12000, 36)
    write_groom_h2grm002(os.path.join(GROOMS_DIR, f'{gid}.groom'), c_arr, r_arr, f_arr, p_arr)

print("All skin textures, GLB hair meshes, and .groom curve assets upgraded successfully!")

