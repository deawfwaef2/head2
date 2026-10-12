#!/usr/bin/env python3
"""
Builds CERVIX-3D Stage 5 Real GLB Assets:
1. Fixes the pouty mouth ("嘟嘟嘴"): calm, flat-closed, wide-cornered lifeless specimen mouth.
2. Adds realistic crimson bloodstains, clots & splatter seepage along the lower neck cut rim ("断面附近血迹感").
3. Bakes a bright, vivid, high-contrast C4/C5 Medical Anatomical Cross-Section texture directly into `NeckCrossSection` ("断面好黑" -> bright & wet).
4. Builds `hair_user_photo.glb` (Wispy Straight Bangs + Ear-Revealing Side Locks + Tied-Back Hair matching the user's uploaded photo) + adds the user's signature right-cheek beauty marks.
"""
import io
import json
import math
import os
import shutil
import struct
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.append('/tmp/dl_inspect')
import glbutil

OUT_DIR = '/home/user/public/models'
os.makedirs(OUT_DIR, exist_ok=True)

# Copy user's uploaded photo to public/models/user_photo_ref.png for Studio reference
if os.path.exists('/home/user/uploads/image-1.png'):
    shutil.copy('/home/user/uploads/image-1.png', os.path.join(OUT_DIR, 'user_photo_ref.png'))

gltf, b = glbutil.read_glb('/tmp/dl_inspect/base_body.glb')
p0 = gltf['meshes'][0]['primitives'][0]
tnames = gltf['meshes'][0]['extras']['targetNames']
joints = glbutil._read_accessor(gltf, b, p0['attributes']['JOINTS_0']).astype(int)
jweights = glbutil._read_accessor(gltf, b, p0['attributes']['WEIGHTS_0'])
hn_weight = np.sum(jweights * ((joints == 43) | (joints == 44)), axis=1)

# Calm, lifeless East Asian Female baseline morph weights:
# NOTE: NO `face_mouth_width_decr` and NO `face_lips_incr` so mouth is NEVER pouty ("嘟嘟嘴")!
BASE_BAKE_WEIGHTS = {
    'gender_female': 1.0,
    'proportions_ideal': 0.68,
    'face_jaw_width_decr': 0.36,
    'face_chin_decr': 0.18,
    'face_cheekbones_incr': 0.16,
    'face_nose_width_decr': 0.22,
    'face_eye_size_incr': 0.16,
    'face_eye_tilt_incr': 0.12,
    'face_lips_decr': 0.22,       # Flatter, calm, non-pouty lips!
    'blink_left': 0.20,           # Slightly half-lowered calm/lifeless specimen eyelids
    'blink_right': 0.20,
}

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

HEAD_CENTER = np.array([0.0, 1.472, 0.038], dtype=np.float64)
CUT_Y = 1.362


def apply_calm_asian_specimen_sculpt(pos_in, is_eye=False, is_brow=False, is_lash=False, is_hair=False):
    pts = pos_in.copy()
    if is_eye:
        return pts
    for i in range(len(pts)):
        x, y, z = pts[i]
        if is_hair:
            if y < 1.415 and z > -0.01:
                t_low = min(1.0, (1.415 - y) / 0.08)
                min_x = 0.056 * t_low
                if abs(x) < min_x:
                    sign_x = 1.0 if x >= 0 else -1.0
                    x = sign_x * (min_x + abs(x) * 0.35)
            if y < 1.315:
                y = 1.315 + (y - 1.315) * 0.22
            pts[i] = [x, y, z]
            continue

        if y < 1.30:
            continue
        # 1) Soft Youthful East Asian Oval Jawline (matches user photo's soft oval face)
        jaw_h = math.exp(-((y - 1.425) / 0.038)**2)
        if z > -0.01:
            front_f = min(1.0, max(0.0, (z + 0.01) / 0.12))
            x *= (1.0 - 0.10 * jaw_h * front_f)
        # 2) Soft Rounded-Oval Chin Tip (Y ~ 1.400)
        chin_w = math.exp(-((y - 1.400) / 0.016)**2) * math.exp(-(x / 0.032)**2)
        if z > 0.09:
            x *= (1.0 - 0.11 * chin_w)
            y += 0.0024 * chin_w
        # 3) Natural Soft Nose Tip & Nostrils (Y = 1.445)
        alar_w = math.exp(-((y - 1.445) / 0.009)**2) * math.exp(-(x / 0.024)**2)
        if z > 0.125:
            x *= (1.0 - 0.10 * alar_w)
        # 4) ANTI-POUT CALM SPECIMEN MOUTH (Y = 1.4255):
        #    - DO NOT narrow X (`x` stays wide & natural, slightly widened at corners!)
        #    - Tuck lip protrusion Z INWARD (`z -= 0.0028 * lip_z_tuck`) to eliminate any duck-lip/pout!
        #    - Gently seal the inner lip slit in Y so mouth is calmly closed.
        mouth_y_band = math.exp(-((y - 1.4255) / 0.0105)**2)
        mouth_x_band = math.exp(-(x / 0.028)**2)
        mouth_w = mouth_y_band * mouth_x_band
        if z > 0.120:
            # Slightly widen mouth corners for a natural relaxed mouth line
            x *= (1.0 + 0.04 * mouth_y_band)
            # Tuck forward lip bulge inward so it is never pouty ("嘟嘟嘴")
            if z > 0.134:
                z -= (z - 0.134) * 0.36 * mouth_w
            # Close vertical lip gap smoothly toward Y = 1.4256
            dy_m = y - 1.4256
            if abs(dy_m) < 0.009:
                y -= dy_m * 0.72 * mouth_w
        # 5) Slender Cylindrical Female Neck
        if y < 1.395:
            t_n = min(1.0, max(0.0, (1.395 - y) / 0.050))
            x *= (1.0 - 0.22 * (t_n ** 1.15))
            if z < 0.02:
                z *= (1.0 - 0.12 * t_n)
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

    pos = apply_calm_asian_specimen_sculpt(
        pos,
        is_eye=(m['name'] == 'Eyes'),
        is_brow=(m['name'] == 'Eyebrows'),
        is_lash=(m['name'] == 'Eyelashes'),
        is_hair=is_hair,
    )

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


# Slice `base` mesh cleanly at `Y = CUT_Y`
pos_skin, norm_skin, uv_skin, tris_skin, deltas_skin = get_baked_primitive(gltf, b, 0, 0, is_hair=False)
valid_v = hn_weight > 0.04

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

used_v = sorted(set(v_i for tri in kept_tris for v_i in tri))
old_to_new = {old_i: new_i for new_i, old_i in enumerate(used_v)}
head_pos = pos_skin[used_v] - HEAD_CENTER
head_norm = norm_skin[used_v]
head_uv = uv_skin[used_v]
head_tris = np.array([[old_to_new[i0], old_to_new[i1], old_to_new[i2]] for (i0, i1, i2) in kept_tris], dtype=np.uint32)
head_deltas = [d_arr[used_v] for d_arr in deltas_skin]

# Build Watertight C4/C5 Medical Anatomical Cross-Section Cap Mesh (`NeckCrossSection`)
cut_y_local = CUT_Y - HEAD_CENTER[1]
rim_mask = np.abs(head_pos[:, 1] - cut_y_local) < 1e-4
rim_indices = np.where(rim_mask)[0]
rim_pts = head_pos[rim_indices]
cx_neck = float(np.mean(rim_pts[:, 0]))
cz_neck = float(np.mean(rim_pts[:, 2]))

N_ang = 64
N_rad = 12
cap_pos, cap_norm, cap_uv, cap_tris = [], [], [], []
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
        # Tilt cap normal slightly forward (+0.35 Z) so front & side lights illuminate the cross-section brightly!
        cap_norm.append([0.0, -0.93, 0.36])
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

# Build High-Res Skin Texture WITH Realistic Neck Cut Rim Bloodstains ("断面附近血迹感") & Calm Non-Pouty Lips!
raw_skin = Image.open('/tmp/dl_inspect/young_asian_female_diffuse.png').convert('RGB').resize((1024, 1024), Image.Resampling.LANCZOS)
blur_med = raw_skin.filter(ImageFilter.GaussianBlur(radius=8))
blur_wide = raw_skin.filter(ImageFilter.GaussianBlur(radius=28))
arr_raw = np.asarray(raw_skin, dtype=np.float32)
arr_med = np.asarray(blur_med, dtype=np.float32)
arr_wide = np.asarray(blur_wide, dtype=np.float32)

clean_skin = arr_wide + (arr_med - arr_wide) * 0.30 + (arr_raw - arr_med) * 0.42
clean_skin = 255.0 * np.power(np.clip(clean_skin / 255.0, 0.0, 1.0), 0.77)
clean_skin[..., 0] = np.clip(clean_skin[..., 0] * 1.02 + 4.0, 0, 255)
clean_skin[..., 1] = np.clip(clean_skin[..., 1] * 0.99 + 3.0, 0, 255)
clean_skin[..., 2] = np.clip(clean_skin[..., 2] * 0.98 + 4.0, 0, 255)

H_t, W_t = 1024, 1024
lip_mask_uv = np.zeros((H_t, W_t), dtype=np.float32)
blood_rim_uv = np.zeros((H_t, W_t), dtype=np.float32)
mole_mask_uv = np.zeros((H_t, W_t), dtype=np.float32)

v_world = head_pos + HEAD_CENTER
# Wide, subtle, calm lip tone (NOT a narrow central cherry dot!)
v_lip_w = np.where(
    v_world[:, 2] > 0.126,
    np.exp(-((v_world[:, 0] / 0.025) ** 2)) * np.exp(-(((v_world[:, 1] - 1.4255) / 0.0065) ** 2)),
    0.0,
)

# Realistic Bloodstain & Seepage Weight along the severed C4/C5 neck cut rim (Y in 1.362..1.388)
v_blood_w = np.zeros(len(v_world), dtype=np.float32)
for idx_v, (vx, vy, vz) in enumerate(v_world):
    dy_cut = max(0.0, vy - CUT_Y)
    if dy_cut < 0.028:
        angle = math.atan2(vz - 0.015, vx)
        # Organic wave modulation around the neck circumference (drips & clots)
        wave = (
            0.55
            + 0.25 * math.sin(angle * 7.0 + 0.8)
            + 0.20 * math.cos(angle * 13.0 - 1.4)
            + 0.15 * math.sin(angle * 23.0 + 2.1)
        )
        rim_height = 0.0085 + 0.011 * max(0.0, wave)
        if dy_cut < 0.0035:
            # Intense coagulated blood right at the severed dermis edge
            v_blood_w[idx_v] = 0.96
        elif dy_cut < rim_height:
            t_b = (dy_cut - 0.0035) / max(1e-4, rim_height - 0.0035)
            v_blood_w[idx_v] = max(0.0, (1.0 - t_b ** 0.75) * 0.85)

# User Photo Distinctive Right-Cheek Moles (viewer's left = subject's right cheek: X in -0.025..-0.048, Y in 1.432..1.455, Z > 0.11)
MOLE_CENTERS = [
    (-0.031, 1.448, 0.130, 0.0022),  # Upper mid-cheek mole
    (-0.039, 1.444, 0.124, 0.0020),  # Outer mid-cheek mole
    (-0.043, 1.428, 0.118, 0.0019),  # Lower cheek mole near smile line
]

for i0, i1, i2 in head_tris:
    uv0, uv1, uv2 = head_uv[i0] * H_t, head_uv[i1] * H_t, head_uv[i2] * H_t
    xa = max(0, int(min(uv0[0], uv1[0], uv2[0])))
    xb = min(W_t - 1, int(max(uv0[0], uv1[0], uv2[0])) + 1)
    ya = max(0, int(min(uv0[1], uv1[1], uv2[1])))
    yb = min(H_t - 1, int(max(uv0[1], uv1[1], uv2[1])) + 1)
    if xa > xb or ya > yb:
        continue

    lw = (v_lip_w[i0] + v_lip_w[i1] + v_lip_w[i2]) / 3.0
    bw = max(v_blood_w[i0], v_blood_w[i1], v_blood_w[i2])
    # Check if this triangle is near one of the user's cheek moles
    if lw > 0.02:
        lip_mask_uv[ya:yb+1, xa:xb+1] = np.maximum(lip_mask_uv[ya:yb+1, xa:xb+1], lw)
    if bw > 0.02:
        blood_rim_uv[ya:yb+1, xa:xb+1] = np.maximum(blood_rim_uv[ya:yb+1, xa:xb+1], bw)

# Paint 3 crisp, natural single beauty marks (matching the user's photo!) at the exact closest vertex UV
for mx, my, mz, mr in MOLE_CENTERS:
    dists = np.hypot(v_world[:, 0] - mx, v_world[:, 1] - my) + np.abs(v_world[:, 2] - mz) * 0.5
    best_vi = int(np.argmin(dists))
    cx_uv = int(head_uv[best_vi, 0] * W_t)
    cy_uv = int(head_uv[best_vi, 1] * H_t)
    for py in range(max(0, cy_uv - 3), min(H_t, cy_uv + 4)):
        for px in range(max(0, cx_uv - 3), min(W_t, cx_uv + 4)):
            d_uv = math.hypot(px - cx_uv, py - cy_uv)
            if d_uv < 2.2:
                mole_mask_uv[py, px] = max(mole_mask_uv[py, px], math.exp(-((d_uv / 1.3) ** 2)))

lip_blur = np.asarray(Image.fromarray((np.clip(lip_mask_uv, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=8)), dtype=np.float32) / 255.0
blood_blur = np.asarray(Image.fromarray((np.clip(blood_rim_uv, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=5)), dtype=np.float32) / 255.0

# Add fine high-frequency blood splatter droplets near the blood rim in UV space
rng = np.random.default_rng(42)
splatter_noise = rng.random((H_t, W_t)).astype(np.float32)
blood_splatter = np.where((blood_blur > 0.04) & (blood_blur < 0.65) & (splatter_noise > 0.82), 0.78, 0.0)
blood_splatter = np.asarray(Image.fromarray((blood_splatter * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(radius=1.5)), dtype=np.float32) / 255.0
blood_total = np.clip(blood_blur + blood_splatter * 0.65, 0.0, 1.0)

# Apply subtle, calm specimen lip tone (muted rose #bf6872, intensity 0.34 so it NEVER looks like heavy lipstick/pout)
clean_skin = clean_skin * (1.0 - 0.34 * lip_blur[..., None]) + np.array([191.0, 104.0, 114.0]) * (0.34 * lip_blur[..., None])

# Apply realistic arterial & coagulated bloodstains around the lower neck cut edge!
# Outer seepage is fresh crimson (#9e111b), right at the cut rim is dark coagulated venous blood (#4a0409)
blood_color = (
    np.array([158.0, 17.0, 27.0])[None, None, :] * (1.0 - blood_total[..., None] * 0.55)
    + np.array([72.0, 5.0, 10.0])[None, None, :] * (blood_total[..., None] * 0.55)
)
clean_skin = clean_skin * (1.0 - 0.88 * blood_total[..., None]) + blood_color * (0.88 * blood_total[..., None])

# Apply the user photo's signature right-cheek beauty marks / moles
clean_skin = clean_skin * (1.0 - 0.62 * mole_mask_uv[..., None]) + np.array([68.0, 42.0, 36.0]) * (0.62 * mole_mask_uv[..., None])

skin_albedo_buf = io.BytesIO()
Image.fromarray(np.clip(clean_skin, 0, 255).astype(np.uint8)).save(skin_albedo_buf, format='JPEG', quality=90)
skin_albedo_bytes = skin_albedo_buf.getvalue()

# Generate Bright, Vivid, Wet C4/C5 Medical Anatomical Cross-Section Texture (`neck_section.jpg`)
sec_size = 512
sec_im = Image.new('RGB', (sec_size, sec_size), (138, 22, 32))
sdraw = ImageDraw.Draw(sec_im)
scx, scy = sec_size // 2, sec_size // 2
# Outer dermis & subcutaneous adipose ring
sdraw.ellipse([24, 24, sec_size - 24, sec_size - 24], fill=(238, 185, 165), outline=(145, 16, 26), width=8)
sdraw.ellipse([42, 42, sec_size - 42, sec_size - 42], fill=(245, 208, 125), outline=(210, 65, 75), width=5)
# Deep cervical fascia & vascular muscle bed (bright vivid crimson!)
sdraw.ellipse([64, 64, sec_size - 64, sec_size - 64], fill=(178, 28, 38), outline=(235, 175, 180), width=4)
# Sternocleidomastoid, Trapezius & Scalene muscle compartments with fascia septa
muscle_ellipses = [
    (130, 310, 58, 38), (382, 310, 58, 38),  # SCM left/right
    (175, 145, 68, 44), (337, 145, 68, 44),  # Trapezius / Splenius
    (155, 235, 45, 35), (357, 235, 45, 35),  # Scalenes
]
for mx, my, rx, ry in muscle_ellipses:
    sdraw.ellipse([mx - rx, my - ry, mx + rx, my + ry], fill=(196, 36, 48), outline=(242, 205, 208), width=3)
# C4 Cervical Vertebra (ivory cancellous & cortical bone) + Spinal Cord butterfly gray matter
sdraw.ellipse([scx - 56, scy - 58, scx + 56, scy + 34], fill=(245, 232, 202), outline=(255, 248, 235), width=5)
sdraw.ellipse([scx - 32, scy - 8, scx + 32, scy + 42], fill=(218, 185, 142), outline=(248, 238, 215), width=4)
sdraw.ellipse([scx - 24, scy - 52, scx + 24, scy - 14], fill=(252, 246, 215), outline=(220, 195, 165), width=3)
# Trachea hyaline cartilage C-ring & airway lumen + Esophagus
sdraw.ellipse([scx - 40, scy + 72, scx + 40, scy + 142], fill=(185, 228, 248), outline=(235, 248, 255), width=5)
sdraw.ellipse([scx - 26, scy + 84, scx + 26, scy + 130], fill=(42, 12, 18))
sdraw.ellipse([scx - 22, scy + 44, scx + 22, scy + 72], fill=(228, 115, 128), outline=(248, 195, 202), width=3)
# Bilateral Carotid Sheath (Common Carotid Artery in bright arterial red + Internal Jugular Vein in venous blue)
for side in (-1, 1):
    ccx = scx + side * 78
    ccy = scy + 42
    sdraw.ellipse([ccx - 16, ccy - 16, ccx + 16, ccy + 16], fill=(238, 28, 38), outline=(255, 185, 190), width=4)
    sdraw.ellipse([ccx - 8, ccy - 8, ccx + 8, ccy + 8], fill=(95, 6, 12))
    jvx = scx + side * 106
    jvy = scy + 36
    sdraw.ellipse([jvx - 20, jvy - 18, jvx + 20, jvy + 18], fill=(58, 112, 210), outline=(175, 205, 250), width=3)
    sdraw.ellipse([jvx - 11, jvy - 9, jvx + 11, jvy + 9], fill=(22, 38, 88))
# Fresh blood pooling glints across the cross-section
sdraw.ellipse([scx - 95, scy - 95, scx + 95, scy + 95], outline=(215, 22, 34), width=3)
sec_buf = io.BytesIO()
sec_im.save(sec_buf, format='JPEG', quality=92)
neck_sec_bytes = sec_buf.getvalue()

orig_images = {}
for im_def in gltf.get('images', []):
    bv = gltf['bufferViews'][im_def['bufferView']]
    off = bv.get('byteOffset', 0)
    orig_images[im_def['name']] = b[off:off+bv['byteLength']]

# Scale iris in brown_eye.png by 1.26x
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

# Assemble `daz_asian_head_base.glb`
bin_chunks, buffer_views, accessors = [], [], []


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
    acc = {'bufferView': bv_i, 'componentType': ctype, 'count': len(arr), 'type': atype}
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
    ('neck_section', 'image/jpeg', neck_sec_bytes),
]
gltf_images, gltf_textures = [], []
for name, mime, ibytes in img_defs:
    bv_i = add_bv(ibytes)
    gltf_images.append({'name': name, 'mimeType': mime, 'bufferView': bv_i})
    gltf_textures.append({'source': len(gltf_images) - 1})

gltf_materials = [
    {
        'name': 'Skin',
        'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0.0, 'roughnessFactor': 0.44},
        'normalTexture': {'index': 1, 'scale': 0.32},
    },
    {
        'name': 'NeckCrossSection',
        'pbrMetallicRoughness': {'baseColorTexture': {'index': 5}, 'metallicFactor': 0.02, 'roughnessFactor': 0.18},
        'emissiveTexture': {'index': 5},
        'emissiveFactor': [0.55, 0.55, 0.55],
        'doubleSided': True,
    },
    {
        'name': 'Eye',
        'pbrMetallicRoughness': {'baseColorTexture': {'index': 2}, 'metallicFactor': 0.0, 'roughnessFactor': 0.10},
    },
    {
        'name': 'Eyebrow',
        'pbrMetallicRoughness': {'baseColorTexture': {'index': 3}, 'baseColorFactor': [0.18, 0.14, 0.13, 1.0], 'metallicFactor': 0.0, 'roughnessFactor': 0.65},
        'alphaMode': 'BLEND',
        'doubleSided': True,
    },
    {
        'name': 'Eyelash',
        'pbrMetallicRoughness': {'baseColorTexture': {'index': 4}, 'baseColorFactor': [0.07, 0.05, 0.05, 1.0], 'metallicFactor': 0.0, 'roughnessFactor': 0.45},
        'alphaMode': 'BLEND',
        'doubleSided': True,
    },
    {
        'name': 'Cornea',
        'pbrMetallicRoughness': {'baseColorFactor': [1.0, 1.0, 1.0, 0.14], 'metallicFactor': 0.0, 'roughnessFactor': 0.04},
        'alphaMode': 'BLEND',
    },
]

gltf_meshes = [
    {
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
    },
    {
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
    }
]

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

gltf_meshes.append({'name': 'Eyes', 'extras': {'targetNames': KEEP_TARGETS}, 'primitives': eye_prims_out})

out_bin = b''.join(bin_chunks)
out_gltf = {
    'asset': {'version': '2.0', 'generator': 'CERVIX-3D Stage 5 Compiler'},
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

# 6. Build `hair_user_photo.glb` (Wispy Straight Bangs + Temple Side-Locks + Tied-Back Cranial Hair matching the user's photo!)
# Let's read `hair_ponytail01.glb` from public/models/ and add a 3D multi-layered Wispy Forehead Bangs & Side-Lock mesh with a full-coverage feathered strand texture!
hg_pt, hb_pt = glbutil.read_glb(os.path.join(OUT_DIR, 'hair_ponytail01.glb'))
pt_prim = hg_pt['meshes'][0]['primitives'][0]
pt_pos = glbutil._read_accessor(hg_pt, hb_pt, pt_prim['attributes']['POSITION']).copy()
pt_norm = glbutil._read_accessor(hg_pt, hb_pt, pt_prim['attributes']['NORMAL']).copy()
pt_uv = glbutil._read_accessor(hg_pt, hb_pt, pt_prim['attributes']['TEXCOORD_0']).copy()
pt_tris = glbutil._read_accessor(hg_pt, hb_pt, pt_prim['indices']).astype(np.uint16).reshape(-1, 3)

# Trim the low-hanging ponytail tail below the neck (`y < -0.095` in centered head coords) so it matches the user's medium/tied-back hair in the photo!
keep_pt_tris = []
for i0, i1, i2 in pt_tris:
    if min(pt_pos[i0, 1], pt_pos[i1, 1], pt_pos[i2, 1]) > -0.095:
        keep_pt_tris.append([i0, i1, i2])
keep_pt_tris = np.array(keep_pt_tris, dtype=np.uint16)

# Generate a custom 3D Skull-Conforming Wispy Bangs + Temple Side-Locks mesh (`f_verts, f_norms, f_uvs, f_tris`)
# Query the actual `head_pos` front skull surface Z(x, y) so the bangs NEVER sink into the forehead!
front_head = head_pos[head_pos[:, 2] > -0.01]


def get_skull_front_z(x_q, y_q):
    d2 = (front_head[:, 0] - x_q) ** 2 + (front_head[:, 1] - y_q) ** 2
    near = front_head[d2 < 0.018 ** 2]
    if len(near) > 0:
        return float(np.max(near[:, 2]))
    best = int(np.argmin(d2))
    return float(front_head[best, 2])


f_verts, f_norms, f_uvs, f_tris = [], [], [], []

# 1) Full-coverage Dome-Curved Wispy Straight Bangs from Crown Parting down to Eyebrows (Y=+0.016)
for layer_idx, (z_off, y_bot) in enumerate([(0.0040, 0.016), (0.0065, 0.020)]):
    rows, cols = 22, 38
    base_idx = len(f_verts)
    for r in range(rows + 1):
        v = r / rows  # 0 = top crown dome, 1 = eyebrow tip
        for c in range(cols + 1):
            u = c / cols
            s = (u - 0.5) * 2.0  # -1..+1 across forehead width
            # Dome-shaped width & height so bangs seamlessly overlap the temple side-locks!
            half_w = 0.042 * (1.0 - v) + 0.068 * (v ** 0.52)
            x = s * half_w
            crown_drop = 0.018 * (s ** 2) * (1.0 - 0.65 * v)
            y_base = 0.120 * (1.0 - v) + y_bot * v - crown_drop
            z_sk = get_skull_front_z(x, max(0.020, y_base))
            # Tuck top root (v=0) smoothly into the scalp (z_off * sin(v*pi/2)) so crown is seamless!
            root_blend = math.sin(min(1.0, v * 1.6) * (math.pi * 0.5))
            z = z_sk + (0.0012 + z_off * root_blend)
            f_verts.append([x, y_base, z])
            n = np.array([x * 0.45, max(0.05, y_base), z + 0.05])
            n /= np.linalg.norm(n)
            f_norms.append(n)
            f_uvs.append([0.05 + 0.90 * u, 0.65 + 0.34 * v])
    stride = cols + 1
    for r in range(rows):
        for c in range(cols):
            a = base_idx + r * stride + c
            b_i = a + 1
            c_i = a + stride
            d_i = c_i + 1
            f_tris.append([a, c_i, b_i])
            f_tris.append([b_i, c_i, d_i])

# 2) Cheek-Framing Wispy Side Locks in front of both ears (seamlessly tucked into temple scalp at v=0!)
for side in (-1.0, 1.0):
    rows, cols = 18, 10
    base_idx = len(f_verts)
    for r in range(rows + 1):
        v = r / rows
        y = 0.082 * (1.0 - v) + (-0.046) * v
        root_blend = math.sin(min(1.0, v * 1.8) * (math.pi * 0.5))
        for c in range(cols + 1):
            u = c / cols
            x_in = side * (0.048 + 0.010 * (v ** 0.6))
            x_out = side * (0.060 + 0.010 * (v ** 0.6))
            x = x_in * (1.0 - u) + x_out * u
            z_sk = get_skull_front_z(x, max(-0.035, y))
            z = max(0.022, z_sk + 0.001 + 0.0038 * root_blend) - u * 0.012
            f_verts.append([x, y, z])
            n = np.array([side * 0.7, 0.05, 0.5])
            n /= np.linalg.norm(n)
            f_norms.append(n)
            f_uvs.append([0.08 + 0.28 * u, 0.65 + 0.34 * v])
    stride = cols + 1
    for r in range(rows):
        for c in range(cols):
            a = base_idx + r * stride + c
            b_i = a + 1
            c_i = a + stride
            d_i = c_i + 1
            if side < 0:
                f_tris.append([a, b_i, c_i])
                f_tris.append([b_i, d_i, c_i])
            else:
                f_tris.append([a, c_i, b_i])
                f_tris.append([b_i, c_i, d_i])

f_verts = np.array(f_verts, dtype=np.float32)
f_norms = np.array(f_norms, dtype=np.float32)
f_uvs = np.array(f_uvs, dtype=np.float32)
f_tris = np.array(f_tris, dtype=np.uint16) + len(pt_pos)

comb_pos = np.concatenate([pt_pos, f_verts], axis=0)
comb_norm = np.concatenate([pt_norm, f_norms], axis=0)
comb_uv = np.concatenate([pt_uv, f_uvs], axis=0)
comb_tris = np.concatenate([keep_pt_tris, f_tris], axis=0)

# Enhance the hair texture in the bottom band (v in 0.64..0.99):
# Solid opaque hair from crown to mid-forehead (v_n < 0.58), feathering into natural wispy bangs at the eyebrows (v_n in 0.58..1.0)!
im_bv = hg_pt['bufferViews'][hg_pt['images'][0]['bufferView']]
im_off = im_bv.get('byteOffset', 0)
pt_tex = np.array(Image.open(io.BytesIO(hb_pt[im_off:im_off+im_bv['byteLength']])).convert('RGBA')).copy()
Ht, Wt = pt_tex.shape[:2]
for x_px in range(Wt):
    u_n = x_px / Wt
    strand_wave = (
        0.52
        + 0.28 * math.sin(u_n * 115.0)
        + 0.22 * math.cos(u_n * 240.0 + 0.9)
        + 0.16 * math.sin(u_n * 32.0 - 0.5)
    )
    # Subtle natural parted wisps in the lower half of the bangs (matching the user's photo!)
    wisp_gap = (
        0.48 * math.exp(-(((u_n - 0.56) / 0.032) ** 2))
        + 0.35 * math.exp(-(((u_n - 0.38) / 0.024) ** 2))
        + 0.35 * math.exp(-(((u_n - 0.72) / 0.025) ** 2))
    )
    for y_px in range(int(Ht * 0.64), Ht):
        v_n = (y_px - Ht * 0.64) / (Ht * 0.36)  # 0 at root -> 1 at eyebrow tip
        if v_n < 0.52:
            alpha = 1.0
        else:
            t_tip = (v_n - 0.52) / 0.48  # 0 -> 1 in lower 48% of bangs
            # Individual strand length variation
            max_len = 0.68 + 0.32 * max(0.0, min(1.0, strand_wave - wisp_gap * t_tip))
            alpha = 1.0 if t_tip < max_len * 0.75 else max(0.0, 1.0 - (t_tip - max_len * 0.75) / max(0.08, max_len * 0.25))
        shade = int(np.clip(105 + 48 * math.sin(u_n * 190.0) + 25 * math.sin(v_n * math.pi), 60, 185))
        pt_tex[y_px, x_px] = [shade, shade, shade, int(alpha * 255)]

user_hair_im_buf = io.BytesIO()
Image.fromarray(pt_tex).save(user_hair_im_buf, format='PNG', optimize=True)
user_hair_im_bytes = user_hair_im_buf.getvalue()

# Write `hair_user_photo.glb`
bin_chunks, buffer_views, accessors = [], [], []
tex_bv = add_bv(user_hair_im_bytes)
u_mesh = {
    'name': 'hair_user_photo',
    'primitives': [{
        'attributes': {
            'POSITION': add_acc(comb_pos.astype('<f4'), 5126, 'VEC3', 34962),
            'NORMAL': add_acc(comb_norm.astype('<f4'), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add_acc(comb_uv.astype('<f4'), 5126, 'VEC2', 34962),
        },
        'indices': add_acc(comb_tris.flatten().astype('<u2'), 5123, 'SCALAR', 34963),
        'material': 0,
    }]
}
u_bin = b''.join(bin_chunks)
u_gltf = {
    'asset': {'version': '2.0'},
    'scene': 0,
    'scenes': [{'nodes': [0]}],
    'nodes': [{'name': 'hair_user_photo', 'mesh': 0}],
    'meshes': [u_mesh],
    'materials': [{
        'name': 'Mat_hair_user_photo',
        'pbrMetallicRoughness': {
            'baseColorTexture': {'index': 0},
            'baseColorFactor': [0.16, 0.13, 0.14, 1.0],
            'metallicFactor': 0.03,
            'roughnessFactor': 0.40,
        },
        'alphaMode': 'MASK',
        'alphaCutoff': 0.18,
        'doubleSided': True,
    }],
    'textures': [{'source': 0}],
    'images': [{'name': 'hair_user_photo', 'mimeType': 'image/png', 'bufferView': tex_bv}],
    'accessors': accessors,
    'bufferViews': buffer_views,
    'buffers': [{'byteLength': len(u_bin)}],
}
u_hair_path = os.path.join(OUT_DIR, 'hair_user_photo.glb')
glbutil.write_glb(u_hair_path, u_gltf, u_bin)
print(f"Saved {u_hair_path}: {os.path.getsize(u_hair_path) / 1024:.1f} KB ({len(comb_pos)} verts)")
