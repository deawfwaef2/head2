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
        cap_uv.append([0.5 + 0.455 * u_d, 0.5 + 0.455 * v_d])

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

# ==============================================================================
# STAGE 8 UPGRADE:
# 1. Exact MakeHuman .mhclo Vertex-Binding (0.67 um precision) for 8 High-Poly
#    Artist-Sculpted Hair Meshes (elvs_*, toigo_*, o4saken_*, rehmanpolanski_*)
# 2. 3D Teeth (Upper Maxilla + Lower Mandible) & 3D Tongue inside Oral Cavity
# 3. 10 Forensic Post-Mortem / Dead-Person Expression Morph Targets ("死人各种表情")
#    transferred from MakeHuman faceunits01 ARKit .target files across HeadSkin,
#    Eyebrows, Eyelashes, Eyes, Teeth, and Tongue.
# ==============================================================================
from scipy.spatial import cKDTree
from scipy.sparse import csr_matrix
from scipy.sparse.csgraph import connected_components

# Reconstruct the full 19,158-vertex MakeHuman basemesh (`hv_m` & `hv_sculpted`)
hv_raw, uvs_raw, pairs_raw = [], [], []
with open('/tmp/dl_inspect/base.obj') as f:
    for line in f:
        if line.startswith('v '):
            p = line.split()
            hv_raw.append([float(p[1]) * 0.1, float(p[2]) * 0.1, float(p[3]) * 0.1])
        elif line.startswith('vt '):
            p = line.split()
            uvs_raw.append([float(p[1]), 1.0 - float(p[2])])
        elif line.startswith('f '):
            for tok in line.split()[1:]:
                pts = tok.split('/')
                vi, ti = int(pts[0]) - 1, int(pts[1]) - 1
                if vi < 13380:
                    pairs_raw.append((vi, ti))
hv_raw = np.array(hv_raw, dtype=np.float64)
uvs_raw = np.array(uvs_raw, dtype=np.float64)
hv_m = hv_raw.copy()
hv_m[:, 1] += -hv_raw[:13380, 1].min()

p0_base = gltf['meshes'][0]['primitives'][0]
bpos_neutral = glbutil._read_accessor(gltf, b, p0_base['attributes']['POSITION']).astype(np.float64)
buv_neutral = glbutil._read_accessor(gltf, b, p0_base['attributes']['TEXCOORD_0']).astype(np.float64)
pair_set = list(set(pairs_raw))
pair_vi = np.array([p[0] for p in pair_set])
# Weight UV by 80.0 so upper/lower lip seam and eyelid seam never cross-match
pair_feat = np.hstack([uvs_raw[[p[1] for p in pair_set]] * 80.0, hv_m[pair_vi]])
_, idx_m = cKDTree(pair_feat).query(np.hstack([buv_neutral * 80.0, bpos_neutral]))
glb_to_mh_vi = pair_vi[idx_m]

# Also build hv_sculpted (19,158 verts) for exact .mhclo hair fitting
pair_feat12 = np.hstack([uvs_raw[[p[1] for p in pair_set]] * 12.0, hv_m[pair_vi]])
_, idx_m12 = cKDTree(pair_feat12).query(np.hstack([buv_neutral * 12.0, bpos_neutral]))
glb_to_mh_vi12 = pair_vi[idx_m12]

hv_sculpted = np.zeros_like(hv_m)
known_mask = np.zeros(len(hv_m), dtype=bool)
for glb_i, mh_i in enumerate(glb_to_mh_vi12):
    hv_sculpted[mh_i] = pos_skin[glb_i]
    known_mask[mh_i] = True
known_vi = np.where(known_mask)[0]
tree_known = cKDTree(hv_m[known_vi])
unk_vi = np.where(~known_mask)[0]
d_u, idx_u = tree_known.query(hv_m[unk_vi], k=4)
w_u = 1.0 / np.maximum(d_u, 1e-6)
w_u /= w_u.sum(axis=1, keepdims=True)
disp_known = hv_sculpted[known_vi] - hv_m[known_vi]
hv_sculpted[unk_vi] = hv_m[unk_vi] + (w_u[:, :, None] * disp_known[idx_u]).sum(axis=1)

# Load all ARKit faceunits .target files (in metres)
faceunits = {}
fu_dir = '/tmp/mh_packs/faceunits/targets/faceunits'
for fname in os.listdir(fu_dir):
    if not fname.endswith('.target'):
        continue
    k = fname[:-7]
    arr = np.zeros((len(hv_m), 3), dtype=np.float64)
    with open(os.path.join(fu_dir, fname)) as f:
        for line in f:
            if not line.startswith('#'):
                p = line.split()
                if len(p) == 4:
                    arr[int(p[0])] = [float(p[1]) * 0.1, float(p[2]) * 0.1, float(p[3]) * 0.1]
    faceunits[k] = arr

# Define 10 Forensic Post-Mortem / Dead-Person Expression Morph Targets ("死人各种表情")
FORENSIC_EXPR_SPECS = [
    ('expr_serene', {
        'units': {'eyeBlinkLeft': 0.88, 'eyeBlinkRight': 0.88, 'mouthClose': 0.12},
        'look': (0.0, 0.0),
    }),
    ('expr_hollow', {
        'units': {'eyeBlinkLeft': 0.18, 'eyeBlinkRight': 0.22, 'jawOpen': 0.34, 'mouthLowerDownLeft': 0.25, 'mouthLowerDownRight': 0.25},
        'look': (0.0, 0.45),
    }),
    ('expr_shock', {
        'units': {'eyeWideLeft': 0.85, 'eyeWideRight': 0.85, 'browInnerUp': 0.75, 'browOuterUpLeft': 0.45, 'browOuterUpRight': 0.45, 'jawOpen': 0.65, 'mouthStretchLeft': 0.25, 'mouthStretchRight': 0.25, 'mouthLowerDownLeft': 0.30, 'mouthLowerDownRight': 0.30},
        'look': (0.0, 0.22),
    }),
    ('expr_rigor', {
        'units': {'browDownLeft': 0.88, 'browDownRight': 0.88, 'browInnerUp': 0.72, 'eyeBlinkLeft': 0.48, 'eyeBlinkRight': 0.18, 'eyeSquintLeft': 0.65, 'eyeSquintRight': 0.65, 'cheekSquintLeft': 0.55, 'cheekSquintRight': 0.55, 'noseSneerLeft': 0.70, 'noseSneerRight': 0.70, 'mouthUpperUpLeft': 0.58, 'mouthUpperUpRight': 0.58, 'mouthFrownLeft': 0.78, 'mouthFrownRight': 0.78, 'jawOpen': 0.28, 'mouthLowerDownLeft': 0.38, 'mouthLowerDownRight': 0.38},
        'look': (-0.15, 0.32),
    }),
    ('expr_smile', {
        'units': {'eyeBlinkLeft': 0.48, 'eyeBlinkRight': 0.42, 'mouthSmileLeft': 0.58, 'mouthSmileRight': 0.42, 'mouthDimpleLeft': 0.35, 'mouthDimpleRight': 0.35, 'cheekSquintLeft': 0.28, 'cheekSquintRight': 0.22},
        'look': (0.0, 0.18),
    }),
    ('expr_flaccid', {
        'units': {'eyeBlinkLeft': 0.76, 'eyeBlinkRight': 0.08, 'eyeWideRight': 0.35, 'jawOpen': 0.50, 'jawLeft': 0.58, 'mouthLeft': 0.42, 'mouthFrownLeft': 0.62, 'mouthLowerDownLeft': 0.48, 'tongueOut': 0.62},
        'look': (0.28, 0.52),
    }),
    ('jaw_open', {
        'units': {'jawOpen': 0.72, 'mouthLowerDownLeft': 0.28, 'mouthLowerDownRight': 0.28},
        'look': (0.0, 0.0),
    }),
    ('jaw_side', {
        'units': {'jawLeft': 0.72, 'mouthLeft': 0.45, 'mouthFrownLeft': 0.35},
        'look': (0.0, 0.0),
    }),
    ('tongue_out', {
        'units': {'tongueOut': 0.85, 'jawOpen': 0.26, 'mouthLowerDownLeft': 0.24, 'mouthLowerDownRight': 0.24},
        'look': (0.0, 0.0),
    }),
    ('eye_wide', {
        'units': {'eyeWideLeft': 0.90, 'eyeWideRight': 0.90, 'browInnerUp': 0.55, 'browOuterUpLeft': 0.38, 'browOuterUpRight': 0.38},
        'look': (0.0, 0.0),
    }),
]

ALL_TARGET_NAMES = KEEP_TARGETS + [name for name, _ in FORENSIC_EXPR_SPECS]
head_mh_vi = glb_to_mh_vi[used_v]
chin_mh_mask = (np.abs(hv_m[:13380, 0]) < 0.012) & (hv_m[:13380, 1] > 1.460) & (hv_m[:13380, 1] < 1.478) & (hv_m[:13380, 2] > 0.115)
chin_mh_vi = np.where(chin_mh_mask)[0]

# Precompute full-human deltas and head deltas for the 10 forensic expressions
forensic_head_deltas = []
forensic_jaw_deltas = []
forensic_tongue_out = []
forensic_eye_looks = []
for ename, espec in FORENSIC_EXPR_SPECS:
    d_mh = np.zeros_like(hv_m)
    for uname, uw in espec['units'].items():
        if uname in faceunits:
            d_mh += uw * faceunits[uname]
    d_h = d_mh[head_mh_vi].astype(np.float32)
    # Taper expression delta smoothly to 0 near the neck cut rim (y < -0.085)
    for vi_l in range(len(head_pos)):
        if head_pos[vi_l, 1] < -0.075:
            t_fade = max(0.0, min(1.0, (head_pos[vi_l, 1] - cut_y_local) / 0.035))
            d_h[vi_l] *= t_fade
    forensic_head_deltas.append(d_h)
    forensic_jaw_deltas.append(d_mh[chin_mh_vi].mean(axis=0).astype(np.float32))
    forensic_tongue_out.append(float(espec['units'].get('tongueOut', 0.0)))
    forensic_eye_looks.append(espec['look'])

head_deltas_all = head_deltas + forensic_head_deltas
head_kdtree_local = cKDTree(head_pos)

# Extract Teeth (mesh 4) and Tongue (mesh 5) and keep visible front/premolar teeth (z > 0.084 in baked space)
t_pos_full, t_norm_full, t_uv_full, t_tris_full, t_deltas_full = get_baked_primitive(gltf, b, 4, 0)
t_rows = np.concatenate([t_tris_full[:, 0], t_tris_full[:, 1], t_tris_full[:, 2]])
t_cols = np.concatenate([t_tris_full[:, 1], t_tris_full[:, 2], t_tris_full[:, 0]])
t_adj = csr_matrix((np.ones(len(t_rows)), (t_rows, t_cols)), shape=(len(t_pos_full), len(t_pos_full)))
_, t_labels_full = connected_components(t_adj, directed=False)
lower_full = np.isin(t_labels_full, [0, 1, 4, 5] + list(range(8, 24)))

t_pos_local_full = t_pos_full - HEAD_CENTER
# Filter triangles to z > 0.046 in local head coords (front 22 teeth + visible gums, saving ~60% vertices)
t_vis_v = (t_pos_local_full[:, 2] > 0.065) & (np.abs(t_pos_local_full[:, 0]) < 0.025)
t_tri_keep = t_vis_v[t_tris_full[:, 0]] | t_vis_v[t_tris_full[:, 1]] | t_vis_v[t_tris_full[:, 2]]
t_kept_tris = t_tris_full[t_tri_keep]
t_used_v = np.unique(t_kept_tris)
t_remap = {old: new for new, old in enumerate(t_used_v)}
teeth_pos = t_pos_local_full[t_used_v].astype(np.float32)
teeth_norm = t_norm_full[t_used_v].astype(np.float32)
teeth_uv = t_uv_full[t_used_v].astype(np.float32)
teeth_tris = np.array([[t_remap[a], t_remap[b_i], t_remap[c]] for a, b_i, c in t_kept_tris], dtype=np.uint16)
lower_teeth_mask = lower_full[t_used_v].astype(np.float32)[:, None]

FORENSIC_TARGET_NAMES = [name for name, _ in FORENSIC_EXPR_SPECS]
teeth_deltas_all = []
for j_d in forensic_jaw_deltas:
    td = lower_teeth_mask * (j_d * np.array([0.85, 0.88, 0.85], dtype=np.float32))
    teeth_deltas_all.append(td)

# Tongue (mesh 5, only 253 verts!)
to_pos, to_norm, to_uv, to_tris, to_deltas = get_baked_primitive(gltf, b, 5, 0)
to_pos = (to_pos - HEAD_CENTER).astype(np.float32)
to_tris = to_tris.astype(np.uint16)
tongue_deltas_all = []
# Weight tongue tip (front vertices with higher Z) more strongly when protruding tongueOut
to_z_min, to_z_max = float(to_pos[:, 2].min()), float(to_pos[:, 2].max())
to_tip_w = np.clip((to_pos[:, 2] - to_z_min) / max(1e-5, to_z_max - to_z_min), 0.0, 1.0)[:, None].astype(np.float32)
for j_d, t_out in zip(forensic_jaw_deltas, forensic_tongue_out):
    tod = (j_d * 0.82) + to_tip_w * np.array([0.0, -0.004 * t_out, 0.022 * t_out], dtype=np.float32)
    tongue_deltas_all.append(tod)

# Extract original Teeth & Tongue textures from base_body.glb
def get_raw_image_bytes(g, bin_b, img_idx):
    im_def = g['images'][img_idx]
    bv = g['bufferViews'][im_def['bufferView']]
    off = bv.get('byteOffset', 0)
    return bin_b[off:off + bv['byteLength']]

def compact_jpeg(raw_b):
    im = Image.open(io.BytesIO(raw_b)).convert("RGB").resize((256, 256), Image.Resampling.LANCZOS)
    bf = io.BytesIO(); im.save(bf, format="JPEG", quality=85); return bf.getvalue()
teeth_tex_bytes = compact_jpeg(get_raw_image_bytes(gltf, b, 5))
tongue_tex_bytes = compact_jpeg(get_raw_image_bytes(gltf, b, 6))

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
    ('teeth', 'image/jpeg', teeth_tex_bytes),
    ('tongue', 'image/jpeg', tongue_tex_bytes),
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
    {
        'name': 'Teeth',
        'pbrMetallicRoughness': {'baseColorTexture': {'index': 6}, 'baseColorFactor': [0.94, 0.91, 0.86, 1.0], 'metallicFactor': 0.0, 'roughnessFactor': 0.22},
        'doubleSided': True,
    },
    {
        'name': 'Tongue',
        'pbrMetallicRoughness': {'baseColorTexture': {'index': 7}, 'baseColorFactor': [0.82, 0.44, 0.48, 1.0], 'metallicFactor': 0.0, 'roughnessFactor': 0.34},
        'doubleSided': True,
    },
]

gltf_meshes = [
    {
        'name': 'HeadSkin',
        'extras': {'targetNames': ALL_TARGET_NAMES},
        'primitives': [{
            'attributes': {
                'POSITION': add_acc(head_pos.astype('<f4'), 5126, 'VEC3', 34962),
                'NORMAL': add_acc(head_norm.astype('<f4'), 5126, 'VEC3', 34962),
                'TEXCOORD_0': add_acc(head_uv.astype('<f4'), 5126, 'VEC2', 34962),
            },
            'indices': add_acc(head_tris.flatten().astype('<u4'), 5125, 'SCALAR', 34963),
            'material': 0,
            'targets': add_morph_targets(head_deltas_all),
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
_, b_near = head_kdtree_local.query(b_pos)
b_deltas_all = list(b_deltas) + [fh[b_near] for fh in forensic_head_deltas]
gltf_meshes.append({
    'name': 'Eyebrows',
    'extras': {'targetNames': ALL_TARGET_NAMES},
    'primitives': [{
        'attributes': {
            'POSITION': add_acc(b_pos.astype('<f4'), 5126, 'VEC3', 34962),
            'NORMAL': add_acc(b_norm.astype('<f4'), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add_acc(b_uv.astype('<f4'), 5126, 'VEC2', 34962),
        },
        'indices': add_acc(b_tris.flatten().astype('<u2'), 5123, 'SCALAR', 34963),
        'material': 3,
        'targets': add_morph_targets(b_deltas_all),
    }]
})

l_pos, l_norm, l_uv, l_tris, l_deltas = get_baked_primitive(gltf, b, 2, 0)
l_pos -= HEAD_CENTER
_, l_near = head_kdtree_local.query(l_pos)
l_deltas_all = list(l_deltas) + [fh[l_near] for fh in forensic_head_deltas]
gltf_meshes.append({
    'name': 'Eyelashes',
    'extras': {'targetNames': ALL_TARGET_NAMES},
    'primitives': [{
        'attributes': {
            'POSITION': add_acc(l_pos.astype('<f4'), 5126, 'VEC3', 34962),
            'NORMAL': add_acc(l_norm.astype('<f4'), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add_acc(l_uv.astype('<f4'), 5126, 'VEC2', 34962),
        },
        'indices': add_acc(l_tris.flatten().astype('<u2'), 5123, 'SCALAR', 34963),
        'material': 4,
        'targets': add_morph_targets(l_deltas_all),
    }]
})

eye_prims_out = []
for p_i in range(len(gltf['meshes'][3]['primitives'])):
    e_pos, e_norm, e_uv, e_tris, e_deltas = get_baked_primitive(gltf, b, 3, p_i)
    e_pos -= HEAD_CENTER
    # Build eye look deltas for the 10 forensic expressions
    e_forensic = []
    idx_up = KEEP_TARGETS.index('look_up')
    idx_down = KEEP_TARGETS.index('look_down')
    idx_left = KEEP_TARGETS.index('look_left')
    idx_right = KEEP_TARGETS.index('look_right')
    for lx, ly in forensic_eye_looks:
        ed = np.zeros_like(e_pos)
        if ly > 0:
            ed += ly * e_deltas[idx_up]
        elif ly < 0:
            ed += (-ly) * e_deltas[idx_down]
        if lx > 0:
            ed += lx * e_deltas[idx_left]
        elif lx < 0:
            ed += (-lx) * e_deltas[idx_right]
        e_forensic.append(ed)
    e_deltas_all = list(e_deltas) + e_forensic
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
        'targets': add_morph_targets(e_deltas_all),
    })

gltf_meshes.append({'name': 'Eyes', 'extras': {'targetNames': ALL_TARGET_NAMES}, 'primitives': eye_prims_out})

gltf_meshes.append({
    'name': 'Teeth',
    'extras': {'targetNames': FORENSIC_TARGET_NAMES},
    'primitives': [{
        'attributes': {
            'POSITION': add_acc(teeth_pos.astype('<f4'), 5126, 'VEC3', 34962),
            'NORMAL': add_acc(teeth_norm.astype('<f4'), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add_acc(teeth_uv.astype('<f4'), 5126, 'VEC2', 34962),
        },
        'indices': add_acc(teeth_tris.flatten().astype('<u2'), 5123, 'SCALAR', 34963),
        'material': 6,
        'targets': add_morph_targets(teeth_deltas_all),
    }]
})

gltf_meshes.append({
    'name': 'Tongue',
    'extras': {'targetNames': FORENSIC_TARGET_NAMES},
    'primitives': [{
        'attributes': {
            'POSITION': add_acc(to_pos.astype('<f4'), 5126, 'VEC3', 34962),
            'NORMAL': add_acc(to_norm.astype('<f4'), 5126, 'VEC3', 34962),
            'TEXCOORD_0': add_acc(to_uv.astype('<f4'), 5126, 'VEC2', 34962),
        },
        'indices': add_acc(to_tris.flatten().astype('<u2'), 5123, 'SCALAR', 34963),
        'material': 7,
        'targets': add_morph_targets(tongue_deltas_all),
    }]
})

out_bin = b''.join(bin_chunks)
out_gltf = {
    'asset': {'version': '2.0', 'generator': 'CERVIX-3D Stage 8 Forensic & High-Poly Compiler'},
    'extensionsUsed': ['KHR_mesh_quantization'],
    'extensionsRequired': ['KHR_mesh_quantization'],
    'scene': 0,
    'scenes': [{'nodes': [0, 1, 2, 3, 4, 5, 6]}],
    'nodes': [
        {'name': 'HeadSkin', 'mesh': 0},
        {'name': 'NeckCrossSection', 'mesh': 1},
        {'name': 'Eyebrows', 'mesh': 2},
        {'name': 'Eyelashes', 'mesh': 3},
        {'name': 'Eyes', 'mesh': 4},
        {'name': 'Teeth', 'mesh': 5},
        {'name': 'Tongue', 'mesh': 6},
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
print(f"Saved {head_glb_path}: {os.path.getsize(head_glb_path) / 1024:.1f} KB (7 meshes, {len(ALL_TARGET_NAMES)} morph targets)")


# ==============================================================================
# 6. Compile All 8 High-Precision .mhclo-Fitted Artist 3D Hair GLB Models
# ==============================================================================
def load_mhclo_fitted_hair(mhclo_path, obj_path, trim_below_y=None):
    vs_h = []
    with open(mhclo_path, 'r', errors='ignore') as f:
        lines_h = [l.strip() for l in f]
    idx_l = 0
    xscale, yscale, zscale = 1.0, 1.0, 1.0
    while idx_l < len(lines_h):
        l = lines_h[idx_l]
        if l.startswith('x_scale '):
            p = l.split()
            v0, v1 = int(p[1]), int(p[2])
            xscale = abs(hv_sculpted[v0, 0] - hv_sculpted[v1, 0]) / float(p[3])
        elif l.startswith('y_scale '):
            p = l.split()
            v0, v1 = int(p[1]), int(p[2])
            yscale = abs(hv_sculpted[v0, 1] - hv_sculpted[v1, 1]) / float(p[3])
        elif l.startswith('z_scale '):
            p = l.split()
            v0, v1 = int(p[1]), int(p[2])
            zscale = abs(hv_sculpted[v0, 2] - hv_sculpted[v1, 2]) / float(p[3])
        elif l == 'verts 0':
            idx_l += 1
            while idx_l < len(lines_h):
                l2 = lines_h[idx_l]
                if not l2 or l2.startswith('#') or l2.startswith('material') or l2.startswith('delete'):
                    break
                p = l2.split()
                if len(p) == 9:
                    vs_h.append((
                        [int(p[0]), int(p[1]), int(p[2])],
                        [float(p[3]), float(p[4]), float(p[5])],
                        [float(p[6]) * 0.1, float(p[7]) * 0.1, float(p[8]) * 0.1]
                    ))
                elif len(p) == 1:
                    vs_h.append(([int(p[0]), int(p[0]), int(p[0])], [1.0, 0.0, 0.0], [0.0, 0.0, 0.0]))
                idx_l += 1
            break
        idx_l += 1

    v_idx_h = np.array([x[0] for x in vs_h], dtype=np.int32)
    w_h = np.array([x[1] for x in vs_h], dtype=np.float64)
    off_h = np.array([x[2] for x in vs_h], dtype=np.float64)
    scale_vec = np.array([xscale, yscale, zscale], dtype=np.float64)
    fitted_v = (w_h[:, :, None] * hv_sculpted[v_idx_h]).sum(axis=1) + off_h * scale_vec
    fitted_v -= HEAD_CENTER

    # Slight cranial clearance (1.5 mm) so inner hair layers never z-fight with the scalp
    for i in range(len(fitted_v)):
        x, y, z = fitted_v[i]
        if y > -0.02:
            r_xz = math.hypot(x, z)
            if r_xz > 1e-4:
                fitted_v[i, 0] += (x / r_xz) * 0.0014
                fitted_v[i, 2] += (z / r_xz) * 0.0014
            if y > 0.03:
                fitted_v[i, 1] += 0.0015

    # If long hair extends below neck cross-section, smoothly gather/trim above trim_below_y
    if trim_below_y is not None:
        for i in range(len(fitted_v)):
            if fitted_v[i, 1] < trim_below_y + 0.035:
                # Smoothly compress lower hair strands above trim_below_y so C4/C5 cut is 100% visible
                dy = (trim_below_y + 0.035) - fitted_v[i, 1]
                fitted_v[i, 1] = (trim_below_y + 0.035) - 0.035 * math.tanh(dy / 0.045)

    uvs_h, faces_h = [], []
    with open(obj_path, 'r', errors='ignore') as f:
        for line in f:
            if line.startswith('vt '):
                p = line.split()
                uvs_h.append([float(p[1]), 1.0 - float(p[2])])
            elif line.startswith('f '):
                pts = line.split()[1:]
                poly = []
                for tok in pts:
                    sp = tok.split('/')
                    vi = int(sp[0]) - 1
                    ti = int(sp[1]) - 1 if len(sp) > 1 and sp[1] else 0
                    poly.append((vi, ti))
                for k in range(1, len(poly) - 1):
                    faces_h.append((poly[0], poly[k], poly[k + 1]))

    uvs_h = np.array(uvs_h, dtype=np.float32) if uvs_h else np.zeros((1, 2), dtype=np.float32)
    pair_map, out_pos, out_uv, out_tris = {}, [], [], []
    for p0_f, p1_f, p2_f in faces_h:
        tri = []
        for vi, ti in (p0_f, p1_f, p2_f):
            key = (vi, ti)
            if key not in pair_map:
                pair_map[key] = len(out_pos)
                out_pos.append(fitted_v[vi])
                out_uv.append(uvs_h[ti] if ti < len(uvs_h) else [0.0, 0.0])
            tri.append(pair_map[key])
        out_tris.append(tri)

    return np.array(out_pos, dtype=np.float32), np.array(out_uv, dtype=np.float32), np.array(out_tris, dtype=np.uint32)


def compute_smooth_normals(pos, tris):
    v0, v1, v2 = pos[tris[:, 0]], pos[tris[:, 1]], pos[tris[:, 2]]
    fn = np.cross(v1 - v0, v2 - v0)
    fn /= np.maximum(np.linalg.norm(fn, axis=1, keepdims=True), 1e-8)
    vn = np.zeros_like(pos)
    np.add.at(vn, tris[:, 0], fn)
    np.add.at(vn, tris[:, 1], fn)
    np.add.at(vn, tris[:, 2], fn)
    vn /= np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-8)
    return vn.astype(np.float32)


def build_hair_morph_deltas(pos):
    # 1. hair_length: extends lower hair strands (y < 0.03) downward by up to 2.8 cm
    d_len = np.zeros_like(pos)
    # 2. hair_volume: puffs outer hair volume radially outward by up to 1.4 cm
    d_vol = np.zeros_like(pos)
    # 3. bangs_length: extends front forehead bangs (z > 0.055, y > -0.01, abs(x) < 0.068) downward by up to 1.8 cm
    d_bng = np.zeros_like(pos)
    for i in range(len(pos)):
        x, y, z = pos[i]
        if y < 0.035:
            t_l = max(0.0, min(1.0, (0.035 - y) / 0.12))
            d_len[i, 1] = -0.026 * t_l
        r_xz = math.hypot(x, z)
        if r_xz > 1e-4:
            t_v = max(0.15, min(1.0, (0.12 - y) / 0.16))
            d_vol[i, 0] = (x / r_xz) * 0.012 * t_v
            d_vol[i, 2] = (z / r_xz) * 0.010 * t_v
            if y > 0.02:
                d_vol[i, 1] = 0.008 * ((y - 0.02) / 0.12)
        if z > 0.055 and -0.015 < y < 0.068 and abs(x) < 0.068:
            t_b = max(0.0, min(1.0, (0.068 - y) / 0.055)) * max(0.0, min(1.0, (z - 0.055) / 0.025))
            d_bng[i, 1] = -0.016 * t_b
            d_bng[i, 2] = 0.002 * t_b
    return [d_len, d_vol, d_bng]


def encode_normalized_hair_tex(tex_path, feather_bangs=False):
    im = Image.open(tex_path).convert('RGBA').resize((256, 256), Image.Resampling.LANCZOS)
    arr = np.asarray(im, dtype=np.float32) / 255.0
    rgb = arr[:, :, :3]
    alpha = arr[:, :, 3].copy()
    lum = 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]
    valid = alpha > 0.05
    mean_l = float(lum[valid].mean()) if valid.any() else 0.5
    std_l = max(0.06, float(lum[valid].std()) if valid.any() else 0.12)
    # High-contrast neutral strand luminance (0.24..0.92, mean ~0.60) so Three.js baseColor tints cleanly with crisp strand detail!
    norm_l = np.clip(0.60 + ((lum - mean_l) / std_l) * 0.18, 0.20, 0.94)
    # Add fine vertical micro-strand modulation for high-frequency strand sheen
    W_t = 256
    u_grid = np.linspace(0.0, 1.0, W_t, dtype=np.float32)[None, :]
    micro = 0.05 * np.sin(u_grid * 380.0) + 0.03 * np.cos(u_grid * 790.0)
    norm_l = np.clip(norm_l + micro, 0.18, 0.96)

    out_rgba = np.zeros((256, 256, 4), dtype=np.uint8)
    out_rgba[:, :, 0] = (norm_l * 255.0).astype(np.uint8)
    out_rgba[:, :, 1] = (norm_l * 248.0).astype(np.uint8)
    out_rgba[:, :, 2] = (norm_l * 252.0).astype(np.uint8)
    out_rgba[:, :, 3] = (alpha * 255.0).astype(np.uint8)

    has_alpha = bool((alpha < 0.92).sum() > 250)
    buf = io.BytesIO()
    if has_alpha:
        Image.fromarray(out_rgba, 'RGBA').save(buf, format='PNG', optimize=True)
        return buf.getvalue(), 'image/png', 'MASK'
    else:
        Image.fromarray(out_rgba[:, :, :3], 'RGB').save(buf, format='JPEG', quality=88)
        return buf.getvalue(), 'image/jpeg', 'OPAQUE'


def write_hair_glb(out_filename, pos, uv, tris, tex_bytes, mime_type, alpha_mode):
    global bin_chunks, buffer_views, accessors
    bin_chunks, buffer_views, accessors = [], [], []
    norm = compute_smooth_normals(pos, tris)
    h_deltas = build_hair_morph_deltas(pos)
    tex_bv = add_bv(tex_bytes)
    idx_ctype = 5123 if len(pos) < 65535 else 5125
    idx_arr = tris.flatten().astype('<u2' if idx_ctype == 5123 else '<u4')

    mat_def = {
        'name': f'Mat_{out_filename[:-4]}',
        'pbrMetallicRoughness': {
            'baseColorTexture': {'index': 0},
            'baseColorFactor': [0.28, 0.24, 0.25, 1.0],
            'metallicFactor': 0.04,
            'roughnessFactor': 0.36,
        },
        'doubleSided': True,
    }
    if alpha_mode != 'OPAQUE':
        mat_def['alphaMode'] = 'MASK'
        mat_def['alphaCutoff'] = 0.20

    h_mesh = {
        'name': out_filename[:-4],
        'extras': {'targetNames': ['hair_length', 'hair_volume', 'bangs_length']},
        'primitives': [{
            'attributes': {
                'POSITION': add_acc(pos.astype('<f4'), 5126, 'VEC3', 34962),
                'NORMAL': add_acc(norm.astype('<f4'), 5126, 'VEC3', 34962),
                'TEXCOORD_0': add_acc(uv.astype('<f4'), 5126, 'VEC2', 34962),
            },
            'indices': add_acc(idx_arr, idx_ctype, 'SCALAR', 34963),
            'material': 0,
            'targets': add_morph_targets(h_deltas),
        }]
    }
    h_bin = b''.join(bin_chunks)
    h_gltf = {
        'asset': {'version': '2.0', 'generator': 'CERVIX-3D Stage 8 MhcloFit Hair Compiler'},
        'extensionsUsed': ['KHR_mesh_quantization'],
        'extensionsRequired': ['KHR_mesh_quantization'],
        'scene': 0,
        'scenes': [{'nodes': [0]}],
        'nodes': [{'name': out_filename[:-4], 'mesh': 0}],
        'meshes': [h_mesh],
        'materials': [mat_def],
        'textures': [{'source': 0}],
        'images': [{'name': out_filename[:-4], 'mimeType': mime_type, 'bufferView': tex_bv}],
        'accessors': accessors,
        'bufferViews': buffer_views,
        'buffers': [{'byteLength': len(h_bin)}],
    }
    out_path = os.path.join(OUT_DIR, out_filename)
    glbutil.write_glb(out_path, h_gltf, h_bin)
    print(f"Saved {out_path}: {os.path.getsize(out_path) / 1024:.1f} KB ({len(pos)} verts, {len(tris)} tris)")


# 6A. Build `hair_user_photo.glb` (Seamless MhcloFit sculpted bangs + tapered cheek wisps + exposed ears + back bun)
p_bun, uv_bun, t_bun = load_mhclo_fitted_hair(
    '/tmp/mh_packs/extracted/hair/rehmanpolanski_hair_bun_brown/rehmanpolanski_hair_bun_brown.mhclo',
    '/tmp/mh_packs/extracted/hair/rehmanpolanski_hair_bun_brown/hair_bun_brown.obj'
)
p_bob, uv_bob, t_bob = load_mhclo_fitted_hair(
    '/tmp/mh_packs/extracted/hair/toigo_curled_under_bob_with_bangs/toigo_curled_under_bob_with_bangs.mhclo',
    '/tmp/mh_packs/extracted/hair/toigo_curled_under_bob_with_bangs/bob_curled_under_bangs.obj'
)

p_sculpt = p_bob.copy()
for i in range(len(p_sculpt)):
    x, y, z = p_sculpt[i]
    # Keep the authored crown height: the old .72 compression buried it in the skull.
    if z > 0.065 and y < 0.060 and abs(x) < 0.062:
        wisp_wave = 0.0022 * math.sin(x * 165.0) + 0.0012 * math.cos(x * 310.0)
        t_tip = max(0.0, min(1.0, (0.048 - y) / 0.036))
        p_sculpt[i, 1] += wisp_wave * t_tip
        p_sculpt[i, 2] -= 0.003 * t_tip * (0.5 + 0.5 * math.sin(x * 210.0))
    if y < 0.040:
        t_down = max(0.0, min(1.0, (0.040 - y) / 0.110))
        if z < 0.034:
            t_back = max(0.0, min(1.0, (0.034 - z) / 0.045))
            pull = t_down * t_back
            p_sculpt[i, 0] *= (1.0 - 0.52 * pull)
            p_sculpt[i, 1] = p_sculpt[i, 1] * (1.0 - 0.48 * pull) + (-0.022) * (0.48 * pull)
            if z > -0.025:
                ear_w = math.exp(-((y - (-0.012)) / 0.035) ** 2) * math.exp(-((z - 0.002) / 0.028) ** 2)
                p_sculpt[i, 0] *= (1.0 - 0.24 * ear_w)
                p_sculpt[i, 2] -= 0.018 * ear_w
        else:
            # Cheek-framing side lock: taper smoothly toward the jawline tip
            p_sculpt[i, 0] *= (1.0 - 0.14 * t_down)
            p_sculpt[i, 1] = p_sculpt[i, 1] * (1.0 - 0.22 * t_down) + (-0.064) * (0.22 * t_down)
            if y < -0.020:
                t_point = max(0.0, min(1.0, (-0.020 - y) / 0.055))
                z_mid = 0.052
                p_sculpt[i, 2] = p_sculpt[i, 2] * (1.0 - 0.55 * t_point) + z_mid * (0.55 * t_point)

v0_b, v1_b, v2_b = p_bun[t_bun[:, 0]], p_bun[t_bun[:, 1]], p_bun[t_bun[:, 2]]
tc_bun = (v0_b + v1_b + v2_b) / 3.0
keep_bun_t = t_bun[tc_bun[:, 2] < -0.045]
used_bun = np.unique(keep_bun_t)
remap_bun = {old: new for new, old in enumerate(used_bun)}
p_backbun = p_bun[used_bun].copy()
uv_backbun = uv_bun[used_bun].copy()
t_backbun = np.array([[remap_bun[a], remap_bun[b_i], remap_bun[c]] for a, b_i, c in keep_bun_t], dtype=np.uint32)

p_user = np.vstack([p_sculpt, p_backbun]).astype(np.float32)
uv_user = np.vstack([uv_bob, uv_backbun]).astype(np.float32)
t_user = np.vstack([t_bob, t_backbun + len(p_sculpt)]).astype(np.uint32)
u_tex_bytes, u_mime, u_amode = encode_normalized_hair_tex(
    '/tmp/mh_packs/extracted/hair/toigo_curled_under_bob_with_bangs/BlondHair.png'
)
write_hair_glb('hair_user_photo.glb', p_user, uv_user, t_user, u_tex_bytes, u_mime, u_amode)

# 6B. Compile the other 7 Catalog High-Poly Hair GLB Models using exact MhcloFit
CATALOG_HAIRS = [
    (
        'hair_bob01.glb',
        '/tmp/mh_packs/extracted/hair/toigo_curled_under_bob_with_bangs/toigo_curled_under_bob_with_bangs.mhclo',
        '/tmp/mh_packs/extracted/hair/toigo_curled_under_bob_with_bangs/bob_curled_under_bangs.obj',
        '/tmp/mh_packs/extracted/hair/toigo_curled_under_bob_with_bangs/BlondHair.png',
        None,
    ),
    (
        'hair_bob02.glb',
        '/tmp/mh_packs/extracted/hair/toigo_inverted_bob_with_bangs/toigo_inverted_bob_with_bangs.mhclo',
        '/tmp/mh_packs/extracted/hair/toigo_inverted_bob_with_bangs/bob_inverted_bangs.obj',
        '/tmp/mh_packs/extracted/hair/toigo_curled_under_bob_with_bangs/BlondHair.png',
        None,
    ),
    (
        'hair_short02.glb',
        '/tmp/mh_packs/extracted/hair/o4saken_chinesebob01/o4saken_chinesebob01.mhclo',
        '/tmp/mh_packs/extracted/hair/o4saken_chinesebob01/o4saken_chinesebob01.obj',
        '/tmp/mh_packs/extracted/hair/o4saken_chinesebob01/o4saken_chinesebob01.png',
        None,
    ),
    (
        'hair_long01.glb',
        '/tmp/mh_packs/extracted/hair/elvs_lara_hair/elvs_lara_hair.mhclo',
        '/tmp/mh_packs/extracted/hair/elvs_lara_hair/elvs_laracroft_hair1a.obj',
        '/tmp/mh_packs/extracted/hair/elvs_lara_hair/larahairtexture1.png',
        -0.098,
    ),
    (
        'hair_ponytail01.glb',
        '/tmp/mh_packs/extracted/hair/elvs_hazel_hair/elvs_hazel_hair.mhclo',
        '/tmp/mh_packs/extracted/hair/elvs_hazel_hair/elvs_hazel_hair.obj',
        '/tmp/mh_packs/extracted/hair/elvs_hazel_hair/elvs_hazel_hair_diffuse.png',
        None,
    ),
    (
        'hair_braid01.glb',
        '/tmp/mh_packs/extracted/hair/elvs_adrienne_hair/elvs_adrienne_hair.mhclo',
        '/tmp/mh_packs/extracted/hair/elvs_adrienne_hair/elvs_adrienne_hair1.obj',
        '/tmp/mh_packs/extracted/hair/elvs_adrienne_hair/Adriennehairtex1.png',
        None,
    ),
    (
        'hair_short04.glb',
        '/tmp/mh_packs/extracted/hair/elvs_daisy_hair/elvs_daisy_hair.mhclo',
        '/tmp/mh_packs/extracted/hair/elvs_daisy_hair/elvs_daisyhair1.obj',
        '/tmp/mh_packs/extracted/hair/elvs_daisy_hair/daisyhair1.png',
        None,
    ),
]

for h_fname, mhclo_p, obj_p, tex_p, trim_y in CATALOG_HAIRS:
    hp, huv, ht = load_mhclo_fitted_hair(mhclo_p, obj_p, trim_below_y=trim_y)
    tb, tm, tam = encode_normalized_hair_tex(tex_p)
    write_hair_glb(h_fname, hp, huv, ht, tb, tm, tam)
