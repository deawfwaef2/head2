#!/usr/bin/env python3
"""
Stage 21 Masterpiece Asset Overhaul:
1. Upgrades `public/models/daz_asian_head_base.glb`:
   - Upsamples & paints a 2048x2048 photoreal East Asian female facial skin texture:
     * Erases baked buzz-cut scalp stubble outside the facial oval
     * Paints photoreal double-eyelid creases (双眼皮折痕), upper lashline tightline eyeliner (内眼线),
       outer canthus eyeshadow depth, lower-eyelid aegyo-sal (自然卧蚕), and inner tear-duct caruncle
     * Paints micro-blading feathered eyebrow strokes on the brow ridge + lifts the 3D `Eyebrows` mesh
       by +1.1mm so 0% of it is buried inside `HeadSkin`
     * Paints dorsal nose-bridge highlight, bilateral nose contour, nostril/alar crease shadow, and philtrum ridges
     * Paints 2048x2048 vertical lip micro-grooves, petal gradient vermilion, oral commissure shadow, and moisture gloss
     * Keeps base cheek skin flawless porcelain (character-specific moles are applied per preset in JS so
       different characters do not share the same 3 cheek moles!)
   - Upgrades `Eye` iris texture (1024x1024) with crisp limbal ring, radial amber-espresso iris fibers & dual catchlights
   - Upgrades `Eyebrow` & `Eyelash` alpha textures for lush, dark, feathered hair definition
   - Sculpts high-impact, anatomically distinct 3D facial bone morph targets (`face_jaw_width_decr/incr`,
     `face_chin_decr/incr`, `face_cheekbones_decr/incr`, `face_nose_height_incr`, `face_eye_size_incr`,
     `face_eye_tilt_incr`) so the 5 presets have unmistakably distinct Chinese female face shapes!
2. Repairs all 8 `public/models/hair_*.glb` meshes (tear-free, >=4.6mm cranial clearance, C-curl neck taper).
3. Generates 3-Layer High-Cranial Silk `.groom` files (`photo_tied.groom`, `center_long.groom`, `low_chignon.groom`)
   with dense overlapping front bangs, temple locks, and high-crown volume so `.groom` hairstyles need ZERO
   low-poly `.glb` polygon helmets!
"""

import io
import json
import math
import os
import struct
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy.spatial import cKDTree

ROOT_DIR = '/home/user'
MODELS_DIR = os.path.join(ROOT_DIR, 'public', 'models')
GROOMS_DIR = os.path.join(ROOT_DIR, 'public', 'grooms')


def read_glb(path):
    with open(path, 'rb') as f:
        raw = f.read()
    jlen = struct.unpack_from('<I', raw, 12)[0]
    gltf = json.loads(raw[20:20 + jlen].decode('utf-8'))
    bin_chunk = raw[28 + jlen:]
    return gltf, bin_chunk


def write_glb(path, gltf, bin_chunk):
    jbytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    jpad = (-len(jbytes)) % 4
    if jpad:
        jbytes += b' ' * jpad
    bpad = (-len(bin_chunk)) % 4
    if bpad:
        bin_chunk += b'\x00' * bpad
    total_len = 12 + 8 + len(jbytes) + 8 + len(bin_chunk)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total_len))
        f.write(struct.pack('<II', len(jbytes), 0x4E4F534A))
        f.write(jbytes)
        f.write(struct.pack('<II', len(bin_chunk), 0x004E4942))
        f.write(bin_chunk)


# ==============================================================================
# PART 1: Upgrade `daz_asian_head_base.glb` (2K Skin, Iris, Brows, Lashes & 3D Bone Morphs)
# ==============================================================================
head_glb_path = os.path.join(MODELS_DIR, 'daz_asian_head_base.glb')
gltf_h, bin_h = read_glb(head_glb_path)
bin_mut = bytearray(bin_h)


def get_acc_view(gltf, b, acc_idx):
    a = gltf['accessors'][acc_idx]
    bv = gltf['bufferViews'][a['bufferView']]
    dt = {5126: '<f4', 5123: '<u2', 5125: '<u4', 5122: '<i2'}[a['componentType']]
    ch = {'VEC3': 3, 'VEC2': 2, 'SCALAR': 1}[a['type']]
    stride = bv.get('byteStride', 0)
    off = bv.get('byteOffset', 0) + a.get('byteOffset', 0)
    return a, bv, off, stride, dt, ch


def read_acc(gltf, b, acc_idx):
    a, bv, off, stride, dt, ch = get_acc_view(gltf, b, acc_idx)
    itemsize = np.dtype(dt).itemsize
    if stride and stride != ch * itemsize:
        raw_v = np.frombuffer(b, dtype=np.uint8, count=a['count'] * stride, offset=off).reshape(a['count'], stride)
        arr = np.frombuffer(raw_v[:, :ch * itemsize].tobytes(), dtype=dt).reshape(a['count'], ch).copy()
    else:
        arr = np.frombuffer(b, dtype=dt, count=a['count'] * ch, offset=off).reshape(a['count'], ch).copy()
    return arr


def write_morph_delta_i16(gltf, b_mut, acc_idx, delta_f32):
    a, bv, off, stride, dt, ch = get_acc_view(gltf, b_mut, acc_idx)
    assert dt == '<i2' and ch == 3
    q = np.clip(np.round(delta_f32 * 32767.0), -32767, 32767).astype('<i2')
    a['min'] = (q.min(axis=0).astype(float) / 32767.0).tolist()
    a['max'] = (q.max(axis=0).astype(float) / 32767.0).tolist()
    if stride == 8:
        padded = np.zeros((a['count'], 4), dtype='<i2')
        padded[:, :3] = q
        raw_bytes = padded.tobytes()
        b_mut[off:off + len(raw_bytes)] = raw_bytes
    else:
        raw_bytes = q.tobytes()
        b_mut[off:off + len(raw_bytes)] = raw_bytes


pr_head = gltf_h['meshes'][0]['primitives'][0]
head_pos = read_acc(gltf_h, bin_mut, pr_head['attributes']['POSITION']).astype(np.float64)
head_norm = read_acc(gltf_h, bin_mut, pr_head['attributes']['NORMAL']).astype(np.float64)
head_uv = read_acc(gltf_h, bin_mut, pr_head['attributes']['TEXCOORD_0']).astype(np.float64)
head_tris = read_acc(gltf_h, bin_mut, pr_head['indices']).reshape(-1, 3)

# 1A. Lift `Eyebrows` (Mesh 2) and `Eyelashes` (Mesh 3) so 0% is buried inside `HeadSkin`
head_tree = cKDTree(head_pos)
for m_idx, min_sd_target in [(2, 0.00095), (3, 0.00045)]:
    pr_m = gltf_h['meshes'][m_idx]['primitives'][0]
    a_m, bv_m, off_m, stride_m, dt_m, ch_m = get_acc_view(gltf_h, bin_mut, pr_m['attributes']['POSITION'])
    pos_m = read_acc(gltf_h, bin_mut, pr_m['attributes']['POSITION']).astype(np.float64)
    _, near_h = head_tree.query(pos_m)
    hn_near = head_norm[near_h]
    hn_near /= np.maximum(np.linalg.norm(hn_near, axis=1, keepdims=True), 1e-8)
    sd = np.sum((pos_m - head_pos[near_h]) * hn_near, axis=1)
    lift_vec = np.where(sd < min_sd_target, min_sd_target - sd, 0.0)[:, None] * hn_near
    pos_m_new = (pos_m + lift_vec).astype('<f4')
    a_m['min'] = pos_m_new.min(axis=0).astype(float).tolist()
    a_m['max'] = pos_m_new.max(axis=0).astype(float).tolist()
    bin_mut[off_m:off_m + pos_m_new.nbytes] = pos_m_new.tobytes()

# 1B. Sculpt High-Impact, Anatomically Distinct 3D Facial Bone Morph Targets across Meshes 0, 2, 3, 4
target_names = gltf_h['meshes'][0]['extras']['targetNames']


def compute_bone_morph_deltas(pos_arr, tname):
    x = pos_arr[:, 0]
    y = pos_arr[:, 1]
    z = pos_arr[:, 2]
    abs_x = np.abs(x)
    sign_x = np.where(x >= 0.0, 1.0, -1.0)
    d = np.zeros_like(pos_arr, dtype=np.float64)

    # Jaw & face sit in front of ear/neck cylinder (z > 0.020); NeckCrossSection is at y = -0.108
    jaw_front = 1.0 / (1.0 + np.exp(-(z - 0.022) / 0.014))
    face_front = 1.0 / (1.0 + np.exp(-(z - 0.015) / 0.018))
    neck_guard = 1.0 / (1.0 + np.exp(-(y - (-0.095)) / 0.005))

    if tname == 'face_jaw_width_decr':
        # 江南古典瓜子V脸: Monotonic V-line taper from below cheekbones (y = -0.005) down to chin (y = -0.082)
        wy_down = (1.0 / (1.0 + np.exp((y - (-0.018)) / 0.014))) * np.exp(-(((y - (-0.062)) / 0.036) ** 2))
        w = jaw_front * neck_guard * wy_down
        d[:, 0] = -x * 0.24 * w
        d[:, 1] = +0.0025 * w * np.clip(abs_x / 0.045, 0.0, 1.0)

    elif tname == 'face_jaw_width_incr':
        # 清冷高级超模折角方圆脸: Defined mandibular corner (y in [-0.068, -0.035]) & sculpted square-oval jaw
        wy = np.exp(-(((y - (-0.052)) / 0.022) ** 2))
        w = jaw_front * neck_guard * wy
        d[:, 0] = +x * 0.22 * w
        d[:, 1] = -0.0032 * w * np.clip((abs_x - 0.020) / 0.030, 0.0, 1.0)

    elif tname == 'face_chin_decr':
        # 幼态甜妹短缩下巴 / 猫系短下庭: Shorten lower face (+9.5mm upward at chin y = -0.081)
        wy = (1.0 / (1.0 + np.exp((y - (-0.046)) / 0.012))) * neck_guard
        wz = 1.0 / (1.0 + np.exp(-(z - 0.028) / 0.016))
        w = wy * wz
        d[:, 1] = +0.0095 * w * np.exp(-((abs_x / 0.042) ** 2))
        d[:, 0] = -x * 0.085 * w
        d[:, 2] = -0.0028 * w * np.exp(-((abs_x / 0.035) ** 2))

    elif tname == 'face_chin_incr':
        # 知性御姐修长下庭 / 成熟鹅蛋长脸: Elongate lower face (-8.8mm downward) & project V-chin
        wy = (1.0 / (1.0 + np.exp((y - (-0.046)) / 0.012))) * neck_guard
        wz = 1.0 / (1.0 + np.exp(-(z - 0.028) / 0.016))
        w = wy * wz
        d[:, 1] = -0.0088 * w * np.exp(-((abs_x / 0.042) ** 2))
        d[:, 2] = +0.0038 * w * np.exp(-((abs_x / 0.032) ** 2))
        d[:, 0] = -x * 0.125 * w

    elif tname == 'face_cheekbones_incr':
        # 元气少女饱满苹果肌 / 幼态圆润鹅蛋脸: Plump anterior malar cheeks & soft full midface (y in [-0.035, +0.015])
        wy = np.exp(-(((y - (-0.010)) / 0.028) ** 2))
        wz = 1.0 / (1.0 + np.exp(-(z - 0.022) / 0.020))
        w_apple = np.exp(-(((y - (-0.004)) / 0.022) ** 2)) * np.exp(-(((abs_x - 0.034) / 0.024) ** 2)) * (1.0 / (1.0 + np.exp(-(z - 0.045) / 0.018)))
        d[:, 0] = +x * 0.105 * wy * wz
        d[:, 2] = +0.0065 * w_apple
        d[:, 1] = +0.0018 * w_apple

    elif tname == 'face_cheekbones_decr':
        # 清冷高级菱形骨相: Prominent high zygomatic arch (y = +0.006) + sleek tapered lower cheek (y = -0.048)
        wy_high = np.exp(-(((y - 0.006) / 0.016) ** 2)) * face_front
        wy_taper = (1.0 / (1.0 + np.exp((y - (-0.020)) / 0.014))) * np.exp(-(((y - (-0.054)) / 0.028) ** 2)) * jaw_front * neck_guard
        d[:, 0] = x * (0.075 * wy_high - 0.115 * wy_taper)
        d[:, 2] = +0.0024 * wy_high - 0.0018 * wy_taper

    elif tname == 'face_nose_height_incr':
        # 立体高挺盒型翘鼻: Project nasal bridge & tip (+6.5mm Z), lift tip (+2.4mm Y), narrow alae
        wy_bridge = np.exp(-(((y - (-0.002)) / 0.022) ** 2))
        wx_bridge = np.exp(-((abs_x / 0.014) ** 2))
        wz_nose = 1.0 / (1.0 + np.exp(-(z - 0.080) / 0.012))
        w_tip = np.exp(-(((y - (-0.015)) / 0.011) ** 2)) * np.exp(-((abs_x / 0.012) ** 2)) * wz_nose
        w_ala = np.exp(-(((y - (-0.022)) / 0.011) ** 2)) * np.exp(-(((abs_x - 0.015) / 0.009) ** 2)) * wz_nose
        d[:, 2] = +0.0065 * wy_bridge * wx_bridge * wz_nose + 0.0028 * w_tip
        d[:, 1] = +0.0024 * w_tip
        d[:, 0] = -x * 0.16 * w_ala

    elif tname == 'face_eye_size_incr':
        # 灵动大杏眼: Enlarge palpebral fissure & eye region smoothly
        wy = np.exp(-(((y - 0.0180) / 0.012) ** 2))
        wx = np.exp(-(((abs_x - 0.0285) / 0.018) ** 2))
        wz = 1.0 / (1.0 + np.exp(-(z - 0.066) / 0.014))
        w = wy * wx * wz
        d[:, 1] = (y - 0.0178) * 0.28 * w
        d[:, 0] = sign_x * (abs_x - 0.0282) * 0.16 * w

    elif tname == 'face_eye_tilt_incr':
        # 魅惑上挑丹凤眼 / 猫系挑眼: Smoothly lift outer eye corner & outer brow tail (+4.8mm Y)
        wy = np.exp(-(((y - 0.020) / 0.018) ** 2))
        wx = (1.0 / (1.0 + np.exp(-(abs_x - 0.026) / 0.008))) * np.exp(-(((abs_x - 0.044) / 0.022) ** 2))
        wz = 1.0 / (1.0 + np.exp(-(z - 0.062) / 0.015))
        w = wy * wx * wz
        d[:, 1] = +0.0048 * w
        d[:, 0] = +sign_x * 0.0016 * w

    return d.astype(np.float32)


for m_idx in [0, 2, 3, 4]:
    for pr_m in gltf_h['meshes'][m_idx]['primitives']:
        pos_m = read_acc(gltf_h, bin_mut, pr_m['attributes']['POSITION']).astype(np.float64)
        m_targets = pr_m.get('targets', [])
        for tname in [
            'face_jaw_width_decr',
            'face_jaw_width_incr',
            'face_chin_decr',
            'face_chin_incr',
            'face_cheekbones_incr',
            'face_cheekbones_decr',
            'face_nose_height_incr',
            'face_eye_size_incr',
            'face_eye_tilt_incr',
        ]:
            if tname in target_names:
                ti = target_names.index(tname)
                if ti < len(m_targets):
                    if m_idx == 4 and tname in ('face_eye_tilt_incr', 'face_eye_size_incr'):
                        continue
                    delta = compute_bone_morph_deltas(pos_m, tname)
                    write_morph_delta_i16(gltf_h, bin_mut, m_targets[ti]['POSITION'], delta)


# 1C. Upgrade Embedded Textures in `daz_asian_head_base.glb`:
#     - Image 0 (`skin_albedo`): Upscale to 2048x2048 & paint photoreal East Asian female features
#     - Image 2 (`eye`): Upgrade to photoreal high-contrast amber-espresso iris with dual catchlights
#     - Image 3 (`eyebrow`): Upgrade to dense dark feathered micro-blading brow strokes
#     - Image 4 (`eyelash`): Upgrade to dense, curved, plush dark lashes
img_bytes_list = []
for im_def in gltf_h['images']:
    bv = gltf_h['bufferViews'][im_def['bufferView']]
    off = bv.get('byteOffset', 0)
    img_bytes_list.append(bytes(bin_mut[off:off + bv['byteLength']]))

# --- Upgrade Image 0: 2048x2048 Photoreal Skin Albedo (Memory-Safe float32 ROI Slicing) ---
skin_orig = Image.open(io.BytesIO(img_bytes_list[0])).convert('RGB').resize((2048, 2048), Image.Resampling.LANCZOS)
skin_arr = np.asarray(skin_orig, dtype=np.float32).copy()
H_s, W_s, _ = skin_arr.shape

u_1d = np.linspace(0.0, 1.0, W_s, dtype=np.float32)[None, :]
v_1d = np.linspace(0.0, 1.0, H_s, dtype=np.float32)[:, None]
v_mid = np.float32(0.5168)
abs_dv_full = np.abs(v_1d - v_mid)

# 1) Erase baked buzz-cut scalp stubble outside the facial oval
face_oval = np.exp(-((((u_1d - 0.865) / 0.088) ** 2 + (abs_dv_full / 0.088) ** 2) ** 1.5)).astype(np.float32)
clean_mask = (np.clip((u_1d - 0.56) / 0.04, 0.0, 1.0) * (1.0 - face_oval))[..., None]

base_patch = skin_arr[int(0.49 * H_s):int(0.54 * H_s), int(0.80 * W_s):int(0.825 * W_s)]
fair_tone = np.percentile(base_patch.reshape(-1, 3), 75, axis=0).astype(np.float32)
fair_tone = np.array([
    max(float(fair_tone[0]), 238.0),
    max(float(fair_tone[1]), 202.0),
    max(float(fair_tone[2]), 188.0),
], dtype=np.float32)

skin_arr = skin_arr * (1.0 - clean_mask) + fair_tone[None, None, :] * clean_mask
del face_oval, clean_mask

# Erase the 3 baked right-cheek moles by mirroring the clean left-cheek skin across v_mid = 0.5168
for mu, mv in [(0.8847, 0.5543), (0.8895, 0.5640), (0.9042, 0.5718)]:
    px_m = int(round(mu * (W_s - 1)))
    py_m = int(round(mv * (H_s - 1)))
    py_mirror = int(round((2.0 * 0.5168 - mv) * (H_s - 1)))
    r_patch = 14
    skin_arr[py_m - r_patch:py_m + r_patch + 1, px_m - r_patch:px_m + r_patch + 1] = (
        skin_arr[py_mirror - r_patch:py_mirror + r_patch + 1, px_m - r_patch:px_m + r_patch + 1]
    )

# Slice the Facial Region of Interest: u in [0.76, 0.96], v in [0.35, 0.68] (only ~675x410 pixels!)
u0_i, u1_i = int(0.76 * W_s), int(0.96 * W_s)
v0_i, v1_i = int(0.35 * H_s), int(0.68 * H_s)
face_roi = skin_arr[v0_i:v1_i, u0_i:u1_i].copy()
u_grid = u_1d[:, u0_i:u1_i]
v_grid = v_1d[v0_i:v1_i, :]
dv = v_grid - v_mid
abs_dv = np.abs(dv)

# Brighten & refine the facial complexion for translucent porcelain warmth ("通透冷白皮/奶油肌")
face_glow = np.exp(-(((u_grid - 0.865) / 0.075) ** 2 + (abs_dv / 0.072) ** 2))[..., None]
porcelain_target = np.array([246.0, 214.0, 202.0], dtype=np.float32)[None, None, :]
face_roi = face_roi * (1.0 - 0.22 * face_glow) + porcelain_target * (0.22 * face_glow)

# 2) Photoreal Eye Makeup, Double-Eyelid Crease (双眼皮折痕), Tightline Eyeliner (内眼线) & Aegyo-Sal (卧蚕)
for side_sign, v_eye_c in [(-1.0, 0.4835), (+1.0, 0.5501)]:
    dv_e = (v_grid - v_eye_c) * (-side_sign)
    abs_dv_e = np.abs(v_grid - v_eye_c)

    # Soft warm rose-almond eyeshadow wash over upper mobile eyelid
    shadow_w = np.exp(-(((u_grid - 0.8330) / 0.0052) ** 2)) * np.exp(-(((v_grid - v_eye_c - side_sign * 0.002) / 0.0165) ** 2))
    face_roi = face_roi * (1.0 - 0.24 * shadow_w[..., None]) + np.array([182.0, 126.0, 118.0], dtype=np.float32)[None, None, :] * (0.24 * shadow_w[..., None])

    # Crisp Asian parallel-fan double-eyelid crease (平行开扇双眼皮折痕)
    u_crease = 0.8318 + 0.0014 * np.tanh((dv_e + 0.004) / 0.010)
    crease_line = np.exp(-(((u_grid - u_crease) / 0.00075) ** 2)) * np.exp(-(np.abs((dv_e - 0.001) / 0.0135) ** 2.4))
    crease_hi = np.exp(-(((u_grid - (u_crease + 0.0011)) / 0.00085) ** 2)) * np.exp(-(np.abs((dv_e - 0.001) / 0.0130) ** 2.4))
    face_roi = face_roi * (1.0 - 0.48 * crease_line[..., None]) + np.array([96.0, 62.0, 56.0], dtype=np.float32)[None, None, :] * (0.48 * crease_line[..., None])
    face_roi = face_roi * (1.0 - 0.18 * crease_hi[..., None]) + np.array([255.0, 236.0, 228.0], dtype=np.float32)[None, None, :] * (0.18 * crease_hi[..., None])

    # Upper lashline tightline eyeliner & outer winged tail (浓密睫毛根部内眼线 + 眼尾微拉长)
    u_lash = 0.8355 + 0.0008 * ((dv_e / 0.012) ** 2)
    lash_line = np.exp(-(((u_grid - u_lash) / 0.00095) ** 2)) * np.exp(-(np.abs((dv_e - 0.002) / 0.0148) ** 2.6))
    face_roi = face_roi * (1.0 - 0.68 * lash_line[..., None]) + np.array([34.0, 22.0, 22.0], dtype=np.float32)[None, None, :] * (0.68 * lash_line[..., None])

    # Lower eyelid Aegyo-Sal (自然卧蚕高光 + 卧蚕下阴影线)
    aegyo_hi = np.exp(-(((u_grid - 0.8462) / 0.0014) ** 2)) * np.exp(-((abs_dv_e / 0.0125) ** 2.2))
    aegyo_sh = np.exp(-(((u_grid - 0.8492) / 0.0010) ** 2)) * np.exp(-((abs_dv_e / 0.0120) ** 2.2))
    face_roi = face_roi * (1.0 - 0.22 * aegyo_hi[..., None]) + np.array([255.0, 238.0, 230.0], dtype=np.float32)[None, None, :] * (0.22 * aegyo_hi[..., None])
    face_roi = face_roi * (1.0 - 0.25 * aegyo_sh[..., None]) + np.array([158.0, 112.0, 104.0], dtype=np.float32)[None, None, :] * (0.25 * aegyo_sh[..., None])

    # Soft airbrushed brow powder shadow directly under the 3D Eyebrows mesh (u in [0.824, 0.831])
    u_brow_arch = 0.8278 - 0.0012 * np.sin(np.clip((dv_e + 0.012) / 0.036, 0.0, 1.0) * math.pi)
    brow_env = np.exp(-(((u_grid - u_brow_arch) / 0.0022) ** 2)) * np.exp(-(np.abs((dv_e - 0.003) / 0.021) ** 2.4))
    brow_w = (brow_env * 0.28)[..., None]
    face_roi = face_roi * (1.0 - brow_w) + np.array([68.0, 50.0, 46.0], dtype=np.float32)[None, None, :] * brow_w

# 3) Sculpted Nose Bridge Highlight, Nasal Side Contour, Nostril Shadow & Philtrum
nose_bridge_hi = np.exp(-(((u_grid - 0.854) / 0.020) ** 2)) * np.exp(-((abs_dv / 0.0032) ** 2))
nose_tip_hi = np.exp(-(((u_grid - 0.8735) / 0.0042) ** 2)) * np.exp(-((abs_dv / 0.0042) ** 2))
nose_side_sh = np.exp(-(((u_grid - 0.852) / 0.022) ** 2)) * np.exp(-(((abs_dv - 0.0085) / 0.0035) ** 2))
alar_sh = np.exp(-(((u_grid - 0.8805) / 0.0045) ** 2)) * np.exp(-(((abs_dv - 0.0145) / 0.0042) ** 2))
philtrum_sh = np.exp(-(((u_grid - 0.8915) / 0.0045) ** 2)) * np.exp(-((abs_dv / 0.0026) ** 2))
philtrum_ridge = np.exp(-(((u_grid - 0.8915) / 0.0045) ** 2)) * np.exp(-(((abs_dv - 0.0042) / 0.0016) ** 2))

face_roi = face_roi * (1.0 - 0.26 * nose_bridge_hi[..., None]) + np.array([255.0, 244.0, 238.0], dtype=np.float32)[None, None, :] * (0.26 * nose_bridge_hi[..., None])
face_roi = face_roi * (1.0 - 0.32 * nose_tip_hi[..., None]) + np.array([255.0, 245.0, 240.0], dtype=np.float32)[None, None, :] * (0.32 * nose_tip_hi[..., None])
face_roi = face_roi * (1.0 - 0.18 * nose_side_sh[..., None]) + np.array([172.0, 128.0, 118.0], dtype=np.float32)[None, None, :] * (0.18 * nose_side_sh[..., None])
face_roi = face_roi * (1.0 - 0.34 * alar_sh[..., None]) + np.array([138.0, 92.0, 84.0], dtype=np.float32)[None, None, :] * (0.34 * alar_sh[..., None])
face_roi = face_roi * (1.0 - 0.18 * philtrum_sh[..., None]) + np.array([175.0, 130.0, 122.0], dtype=np.float32)[None, None, :] * (0.18 * philtrum_sh[..., None])
face_roi = face_roi * (1.0 - 0.16 * philtrum_ridge[..., None]) + np.array([255.0, 240.0, 234.0], dtype=np.float32)[None, None, :] * (0.16 * philtrum_ridge[..., None])

# 4) Photoreal 2048x2048 Multi-Layer Petal Lips with Ultra-Fine Microscopic Lip Sulcus
lip_half_v = 0.0255
xn = np.clip(abs_dv / lip_half_v, 0.0, 1.5)
cupid_u_top = 0.8960 - 0.0018 * np.sin(np.clip(1.0 - xn, 0.0, 1.0) * math.pi) + 0.0014 * (xn < 0.22) * (1.0 - xn / 0.22) + 0.0078 * (xn ** 2.1)
u_seam = 0.9074 - 0.0008 * (xn ** 2)
u_bot = 0.9225 - 0.0145 * (xn ** 1.95)

w_vx = np.exp(-((np.maximum(0.0, abs_dv - 0.0225) / 0.0040) ** 2)) * (abs_dv < 0.029)
up_h = np.maximum(0.001, u_seam - cupid_u_top)
up_t = (u_grid - cupid_u_top) / up_h
w_upper = np.exp(-((np.maximum(0.0, np.abs(up_t - 0.52) - 0.36) / 0.15) ** 2)) * w_vx * (u_grid >= cupid_u_top - 0.003) * (u_grid <= u_seam + 0.002)

lo_h = np.maximum(0.001, u_bot - u_seam)
lo_t = (u_grid - u_seam) / lo_h
w_lower = np.exp(-((np.maximum(0.0, np.abs(lo_t - 0.48) - 0.36) / 0.16) ** 2)) * w_vx * (u_grid >= u_seam - 0.002) * (u_grid <= u_bot + 0.0035)

lip_sulcus = 0.978 + 0.022 * np.sin(dv * 4800.0 + np.sin(u_grid * 620.0) * 0.5)
inner_grad_up = np.clip(up_t, 0.0, 1.0)
inner_grad_lo = np.clip(1.0 - lo_t, 0.0, 1.0)

upper_lip_col = (
    np.array([204.0, 108.0, 114.0], dtype=np.float32)[None, None, :] * (1.0 - 0.35 * inner_grad_up[..., None])
    + np.array([168.0, 68.0, 78.0], dtype=np.float32)[None, None, :] * (0.35 * inner_grad_up[..., None])
) * lip_sulcus[..., None]

lower_lip_col = (
    np.array([218.0, 118.0, 124.0], dtype=np.float32)[None, None, :] * (1.0 - 0.38 * inner_grad_lo[..., None])
    + np.array([176.0, 72.0, 82.0], dtype=np.float32)[None, None, :] * (0.38 * inner_grad_lo[..., None])
) * lip_sulcus[..., None]

wu = (w_upper * 0.86)[..., None]
wl = (w_lower * 0.88)[..., None]
face_roi = face_roi * (1.0 - wu) + upper_lip_col * wu
face_roi = face_roi * (1.0 - wl) + lower_lip_col * wl

seam_w = np.exp(-(((u_grid - u_seam) / 0.0014) ** 2)) * np.exp(-((abs_dv / 0.0235) ** 2.8))
comm_w = np.exp(-(((u_grid - 0.9066) / 0.0024) ** 2)) * np.exp(-(((abs_dv - 0.0225) / 0.0038) ** 2))
ws = np.clip(seam_w * 0.72 + comm_w * 0.56, 0.0, 0.80)[..., None]
face_roi = face_roi * (1.0 - ws) + np.array([92.0, 38.0, 44.0], dtype=np.float32)[None, None, :] * ws

lo_hi_w = (
    np.exp(-(((u_grid - 0.9142) / 0.0020) ** 2))
    * np.exp(-((abs_dv / 0.011) ** 2))
    * (0.85 + 0.15 * np.cos(dv * 4800.0))
)[..., None]
cupid_hi_w = (np.exp(-(((u_grid - 0.8954) / 0.0014) ** 2)) * np.exp(-((abs_dv / 0.0075) ** 2)))[..., None]
face_roi = face_roi * (1.0 - 0.38 * lo_hi_w) + np.array([255.0, 212.0, 216.0], dtype=np.float32)[None, None, :] * (0.38 * lo_hi_w)
face_roi = face_roi * (1.0 - 0.26 * cupid_hi_w) + np.array([255.0, 228.0, 224.0], dtype=np.float32)[None, None, :] * (0.26 * cupid_hi_w)

cheek_l = np.exp(-(((u_grid - 0.864) / 0.030) ** 2) - (((v_grid - (v_mid - 0.050)) / 0.036) ** 2))
cheek_r = np.exp(-(((u_grid - 0.864) / 0.030) ** 2) - (((v_grid - (v_mid + 0.050)) / 0.036) ** 2))
nose_blush = np.exp(-(((u_grid - 0.874) / 0.010) ** 2) - ((abs_dv / 0.012) ** 2))
blush_total = np.clip(cheek_l + cheek_r + nose_blush * 0.55, 0.0, 1.0)[..., None]
face_roi = face_roi * (1.0 - 0.18 * blush_total) + np.array([238.0, 134.0, 136.0], dtype=np.float32)[None, None, :] * (0.18 * blush_total)

skin_arr[v0_i:v1_i, u0_i:u1_i] = face_roi

skin_out_buf = io.BytesIO()
Image.fromarray(np.clip(skin_arr, 0, 255).astype(np.uint8)).save(skin_out_buf, format='JPEG', quality=93)
img_bytes_list[0] = skin_out_buf.getvalue()

# --- Upgrade Image 2: Photoreal High-Contrast Iris & Sclera Texture (`eye`, 1024x1024) ---
# Exact measured iris disc (`Mesh 4, prim[1]`) UV centers on 1024x1024:
# Left iris (x>0): (300.0, 711.4), radii rx_ir=109.6, ry_ir=106.1
# Right iris (x<0): (722.9, 300.5), radii rx_ir=109.8, ry_ir=106.2
eye_orig = np.asarray(Image.open(io.BytesIO(img_bytes_list[2])).convert('RGB'), dtype=np.float32).copy()
H_e, W_e, _ = eye_orig.shape
ye, xe = np.mgrid[0:H_e, 0:W_e].astype(np.float32)
for icx, icy in [(300.0, 711.4), (722.9, 300.5)]:
    dx_e = xe - icx
    dy_e = ye - icy
    rx_ir, ry_ir = 109.7, 106.2
    r_norm = np.hypot(dx_e / rx_ir, dy_e / ry_ir)
    ang_e = np.arctan2(dy_e / ry_ir, dx_e / rx_ir)
    pup_norm = 0.36

    # Clean warm-white sclera outside iris (r_norm > 1.0)
    sclera_w = np.clip((r_norm - 1.02) / 0.16, 0.0, 1.0)[..., None]
    sclera_mask = (r_norm > 1.0) & (r_norm < 2.35)
    eye_orig = np.where(
        sclera_mask[..., None],
        eye_orig * (1.0 - 0.55 * sclera_w) + np.array([245.0, 240.0, 238.0], dtype=np.float32)[None, None, :] * (0.55 * sclera_w),
        eye_orig,
    )

    # Rich amber-espresso radial iris fibers between pup_norm and 1.0
    in_iris = (r_norm >= pup_norm * 0.82) & (r_norm <= 1.06)
    rn = np.clip((r_norm - pup_norm) / (1.0 - pup_norm), 0.0, 1.0)
    fibers = 0.5 + 0.32 * np.sin(ang_e * 72.0 + np.sin(rn * 6.0) * 0.5) + 0.18 * np.cos(ang_e * 135.0 - rn * 4.0)
    collarette = np.exp(-(((rn - 0.34) / 0.14) ** 2))
    limbal = np.exp(-(((rn - 0.94) / 0.10) ** 2))

    iris_col = (
        np.array([64.0, 34.0, 22.0], dtype=np.float32)[None, None, :] * (0.65 + 0.55 * fibers[..., None])
        + np.array([124.0, 68.0, 36.0], dtype=np.float32)[None, None, :] * (collarette * fibers)[..., None] * 0.58
    ) * (1.0 - 0.82 * limbal[..., None])

    w_ir = (np.exp(-((np.maximum(0.0, np.abs(rn - 0.5) - 0.44) / 0.08) ** 2)) * in_iris)[..., None]
    eye_orig = eye_orig * (1.0 - w_ir) + iris_col * w_ir

    # Deep velvet-black pupil
    w_pup = (1.0 / (1.0 + np.exp(np.clip((r_norm - pup_norm) / 0.025, -40.0, 40.0))))[..., None]
    eye_orig = eye_orig * (1.0 - w_pup) + np.array([7.0, 5.0, 6.0], dtype=np.float32)[None, None, :] * w_pup

    # Dual studio catchlights (眼神光: upper-left softbox + lower-right fill)
    c1 = np.exp(-(((dx_e - (-28.0)) / 15.0) ** 2 + ((dy_e - (-28.0)) / 12.0) ** 2))[..., None]
    c2 = np.exp(-(((dx_e - 24.0) / 8.5) ** 2 + ((dy_e - 24.0) / 7.5) ** 2))[..., None]
    eye_orig = np.clip(eye_orig + 248.0 * c1 + 170.0 * c2, 0, 255)

eye_out_buf = io.BytesIO()
Image.fromarray(np.clip(eye_orig, 0, 255).astype(np.uint8)).save(eye_out_buf, format='JPEG', quality=94)
img_bytes_list[2] = eye_out_buf.getvalue()

# --- Upgrade Image 3 (`eyebrow`) & Image 4 (`eyelash`): Boost alpha density for crisp dark strokes ---
for tidx, boost in [(3, 1.45), (4, 1.65)]:
    im_rgba = np.asarray(Image.open(io.BytesIO(img_bytes_list[tidx])).convert('RGBA'), dtype=np.float32).copy()
    im_rgba[:, :, 3] = np.clip(im_rgba[:, :, 3] * boost, 0, 255)
    buf_t = io.BytesIO()
    Image.fromarray(im_rgba.astype(np.uint8)).save(buf_t, format='PNG')
    img_bytes_list[tidx] = buf_t.getvalue()

# Repack `daz_asian_head_base.glb` binary buffer
new_bin_chunks = []
image_bv_map = {im_def['bufferView']: idx for idx, im_def in enumerate(gltf_h['images'])}
for bv_idx, bv in enumerate(gltf_h['bufferViews']):
    off = sum(len(c) for c in new_bin_chunks)
    pad = (-off) % 4
    if pad:
        new_bin_chunks.append(b'\x00' * pad)
        off += pad
    if bv_idx in image_bv_map:
        raw_part = img_bytes_list[image_bv_map[bv_idx]]
    else:
        old_off = bv.get('byteOffset', 0)
        raw_part = bytes(bin_mut[old_off:old_off + bv['byteLength']])
    bv['byteOffset'] = off
    bv['byteLength'] = len(raw_part)
    new_bin_chunks.append(raw_part)

new_bin_h = b''.join(new_bin_chunks)
gltf_h['buffers'][0]['byteLength'] = len(new_bin_h)
write_glb(head_glb_path, gltf_h, new_bin_h)
print(f"Upgraded {head_glb_path}: {os.path.getsize(head_glb_path)/1024:.1f} KB")


# ==============================================================================
# PART 2: Repair Legacy `public/models/hair_*.glb` Meshes
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


def repair_hair_mesh_positions(pos_arr, h_name, min_clearance=0.0046):
    out = pos_arr.astype(np.float64).copy()
    if h_name == 'hair_user_photo.glb' and len(out) == 5029:
        g_b1, b_b1 = read_glb(os.path.join(MODELS_DIR, 'hair_bob01.glb'))
        pr_b1 = g_b1['meshes'][0]['primitives'][0]
        pa_b1 = g_b1['accessors'][pr_b1['attributes']['POSITION']]
        bvp_b1 = g_b1['bufferViews'][pa_b1['bufferView']]
        off_b1 = bvp_b1.get('byteOffset', 0) + pa_b1.get('byteOffset', 0)
        p_bob = np.frombuffer(b_b1, dtype='<f4', count=2806 * 3, offset=off_b1).reshape(2806, 3).astype(np.float64).copy()
        for i in range(2806):
            x, y, z = p_bob[i]
            if z > 0.058 and y < 0.068 and abs(x) < 0.060:
                t_tip = max(0.0, min(1.0, (0.058 - y) / 0.040))
                arch = max(0.0, 1.0 - (x / 0.048) ** 2)
                p_bob[i, 1] += (0.0055 * arch + 0.0018 * math.sin(x * 165.0)) * t_tip
                p_bob[i, 2] += 0.0022 * arch * t_tip
            if y < 0.042:
                t_down = max(0.0, min(1.0, (0.042 - y) / 0.115))
                t_down = t_down * t_down * (3.0 - 2.0 * t_down)
                u_front = max(0.0, min(1.0, (z - (-0.002)) / 0.042))
                u_front = u_front * u_front * (3.0 - 2.0 * u_front)
                u_back = 1.0 - u_front
                bx = x * (1.0 - 0.42 * t_down)
                by = y * (1.0 - 0.54 * t_down) + (-0.024) * (0.54 * t_down)
                bz = z - 0.014 * t_down
                fx = x * (1.0 - 0.15 * t_down)
                fy = y * (1.0 - 0.42 * t_down) + (-0.042) * (0.42 * t_down)
                fz = z + 0.005 * (1.0 - t_down)
                p_bob[i, 0] = bx * u_back + fx * u_front
                p_bob[i, 1] = by * u_back + fy * u_front
                p_bob[i, 2] = bz * u_back + fz * u_front
        out[:2806] = p_bob

    _, near_idx = dense_tree.query(out)
    sp = dense_scalp_pts[near_idx]
    sn = dense_scalp_norms[near_idx]
    sd = np.sum((out - sp) * sn, axis=1)
    need_push = (out[:, 1] > -0.030) & (sd < min_clearance)
    out[need_push] += sn[need_push] * (min_clearance - sd[need_push])[:, None]

    low_v = out[:, 1] < -0.010
    if np.any(low_v):
        pts_l = out[low_v].copy()
        depth = np.maximum(0.0, -0.010 - pts_l[:, 1])
        t_sh = np.tanh(depth / 0.085)
        cx_n, cz_n = 0.0, -0.018
        dx_n = pts_l[:, 0] - cx_n
        dz_n = pts_l[:, 2] - cz_n
        r_xz = np.hypot(dx_n, dz_n)
        max_r = 0.074 - 0.016 * t_sh
        excess = np.maximum(0.0, r_xz - max_r)
        new_r = np.where(r_xz > max_r, max_r + 0.18 * np.tanh(excess / 0.045) * 0.045, r_xz)
        scale_r = np.where(r_xz > 1e-5, new_r / np.maximum(r_xz, 1e-5), 1.0)
        pts_l[:, 0] = cx_n + dx_n * scale_r
        pts_l[:, 2] = cz_n + dz_n * scale_r
        deep_w = np.clip((depth - 0.140) / 0.180, 0.0, 1.0)
        deep_w = deep_w * deep_w * (3.0 - 2.0 * deep_w)
        pts_l[:, 2] = pts_l[:, 2] * (1.0 - 0.32 * deep_w) + (-0.045) * (0.32 * deep_w)
        pts_l[:, 0] *= (1.0 - 0.18 * deep_w)
        pts_l[:, 1] = -0.010 - 0.068 * np.tanh(depth / 0.095)
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
# PART 3: Masterpiece 3-Layer High-Cranial Silk `.groom` Generator
#         (Zero `.glb` helmet needed — 100% pure overlapping 3D silk locks!)
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


def sample_scalp_fast(theta, phi, lift=0.0032):
    ti = int(np.clip(theta / math.pi * (N_THETA - 1), 0, N_THETA - 1))
    pi = int(np.clip((phi + math.pi) / (2.0 * math.pi) * (N_PHI - 1), 0, N_PHI - 1))
    p = g_pts[ti, pi]
    n = g_nrms[ti, pi]
    return p + n * lift, n


def enforce_skull_clearance_batch(curves, min_clear=0.0034, is_bangs_mask=None):
    N, S, _ = curves.shape
    flat = curves.reshape(-1, 3)
    _, idx = dense_tree.query(flat)
    sp = dense_scalp_pts[idx]
    sn = dense_scalp_norms[idx]
    sd = np.sum((flat - sp) * sn, axis=1)
    # Give forehead/eyebrow region extra clearance (4.5mm) so bangs NEVER clip eyebrows or forehead skin!
    brow_zone = (flat[:, 2] > 0.065) & (flat[:, 1] > 0.015) & (flat[:, 1] < 0.065)
    req_clear = np.where(brow_zone, np.maximum(min_clear, 0.0046), min_clear)
    mask = (flat[:, 1] > -0.048) & (sd < req_clear)
    flat[mask] += sn[mask] * (req_clear[mask] - sd[mask])[:, None]

    # Smooth C2-continuous Facial Feature Keep-Out Field (below y = 0.025m, in front of ears z > 0.020m)
    wy = 1.0 / (1.0 + np.exp((flat[:, 1] - 0.023) / 0.006))
    wz = 1.0 / (1.0 + np.exp(-(flat[:, 2] - 0.022) / 0.014))
    w_face = wy * wz
    x_cheek = 0.056 - 0.005 * np.clip((-0.010 - flat[:, 1]) / 0.065, 0.0, 1.0)
    abs_x = np.abs(flat[:, 0])
    need_cheek = (w_face > 0.01) & (abs_x < x_cheek)
    if np.any(need_cheek):
        curve_side = np.where(curves[:, 3, 0] >= 0.0, 1.0, -1.0)[:, None]
        flat_side = np.broadcast_to(curve_side, (N, S)).reshape(-1)[need_cheek]
        target_x = flat_side * (x_cheek[need_cheek] + abs_x[need_cheek] * 0.14)
        wf = w_face[need_cheek]
        flat[need_cheek, 0] = flat[need_cheek, 0] * (1.0 - wf) + target_x * wf

    low = flat[:, 1] < -0.054
    if np.any(low):
        pts_l = flat[low]
        dy = np.maximum(0.0, -0.054 - pts_l[:, 1])
        pts_l[:, 1] = -0.054 - 0.024 * np.tanh(dy / 0.036)
        flat[low] = pts_l

    curves = flat.reshape(N, S, 3)
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
    """
    Reference Photo (`image-1.png`) Signature Hairstyle:
    - Plush high-cranial crown & side canopy sweeping smoothly above/behind the ears into a low nape tie
    - Full, soft, wispy arched air-bangs + curtain bangs across the forehead (28% of curves = 3,360 curves!)
    - Silky cheek-framing temple locks ("修颜龙须碎鬓", 22% of curves = 2,640 curves!)
    """
    rng = np.random.default_rng(20260420)
    curves = np.zeros((count, samples, 3), dtype=np.float32)
    radii = np.zeros(count, dtype=np.float32)
    families = np.zeros(count, dtype=np.uint8)
    pigments = rng.integers(110, 245, size=count, dtype=np.uint8)
    t_arr = np.linspace(0.0, 1.0, samples, dtype=np.float32)

    n_crown = int(count * 0.42)
    n_temple = int(count * 0.22)
    n_bangs = int(count * 0.28)
    clump_guides = make_clump_guides(128, (0.06, 1.48), (-math.pi, math.pi), rng)
    tie_pos = np.array([0.0, -0.020, -0.090], dtype=np.float32)

    for i in range(count):
        layer_shell = (i % 3) * 0.0018  # 3 radial depth shells (+0mm, +1.8mm, +3.6mm)
        if i < n_crown:
            u = rng.uniform(0.0, 1.0)
            theta = 0.04 + (u ** 0.72) * 1.44
            phi = rng.uniform(-math.pi, math.pi)
            # Only exclude roots below the actual forehead hairline (theta > 0.96), NEVER on the front scalp!
            if abs(phi) < 0.52 and theta > 0.94:
                phi = math.copysign(0.52 + abs(phi) * 0.85, phi if phi != 0 else 1.0)
            g_th, g_ph, g_phase, g_curl = clump_guides[i % len(clump_guides)]
            theta = 0.86 * theta + 0.14 * g_th
            phi = 0.88 * phi + 0.12 * g_ph
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0034 + layer_shell * 0.5)
            side = 1.0 if root[0] >= 0 else -1.0
            # High-cranial lift ("高颅顶蓬松度") at mid-control point
            mid = np.array([
                side * (0.072 + 0.014 * math.sin(abs(phi))) * (0.68 + 0.32 * (1.0 - abs(phi) / math.pi)),
                max(-0.005, root[1] * 0.58 + 0.028),
                root[2] * 0.48 - 0.044,
            ], dtype=np.float32)
            m_norm = np.linalg.norm(mid - HEAD_CORE)
            if m_norm < 0.104:
                mid = HEAD_CORE + (mid - HEAD_CORE) / max(m_norm, 1e-6) * 0.104
            end = tie_pos + np.array([
                rng.normal(0.0, 0.010),
                rng.normal(-0.010, 0.008),
                -0.012 + rng.normal(0.0, 0.005),
            ], dtype=np.float32)
            s = t_arr[:, None]
            pts = ((1.0 - s) ** 2) * root + 2.0 * (1.0 - s) * s * mid + (s ** 2) * end
            pts += nrm * (np.sin(t_arr * math.pi) * (0.0085 + layer_shell + 0.0020 * g_curl))[:, None]
            pts[:, 0] += np.sin(t_arr * 4.5 + g_phase) * 0.0014 * t_arr
            curves[i] = pts
            radii[i] = rng.uniform(0.00145, 0.00210)
            families[i] = 3 if (i % 18 == 0) else 0

        elif i < n_crown + n_temple:
            side = 1.0 if (i % 2 == 0) else -1.0
            sub = rng.random()
            if sub < 0.58:
                # Lush cheek-framing temple locks ("修颜鬓角碎发") rooted from outer forehead down to sideburn
                theta = rng.uniform(0.68, 1.22)
                phi = side * rng.uniform(0.42, 0.94)
                root, nrm = sample_scalp_fast(theta, phi, lift=0.0036 + layer_shell * 0.4)
                wisp_len = rng.uniform(0.078, 0.115)
                out_push = max(0.0, 0.058 - abs(root[0]))
                pts = (
                    root[None, :]
                    + nrm[None, :] * (np.sin(t_arr * math.pi * 0.72) * (0.0065 + layer_shell))[:, None]
                    + np.stack([
                        side * ((out_push + 0.008) * np.sin(t_arr * math.pi * 0.58) - 0.007 * (t_arr ** 1.8)),
                        -wisp_len * (t_arr ** 1.06),
                        (0.008 * np.sin(t_arr * math.pi * 0.75) - 0.008 * (t_arr ** 1.5)),
                    ], axis=-1)
                )
                radii[i] = rng.uniform(0.00130, 0.00180)
                families[i] = 2
            else:
                theta = rng.uniform(0.64, 1.30)
                phi = side * rng.uniform(0.75, 1.65)
                root, nrm = sample_scalp_fast(theta, phi, lift=0.0035 + layer_shell * 0.5)
                mid = np.array([side * 0.080, root[1] * 0.56 + 0.010, root[2] * 0.50 - 0.030], dtype=np.float32)
                end = tie_pos + np.array([side * 0.012, rng.uniform(-0.010, 0.008), -0.006], dtype=np.float32)
                s = t_arr[:, None]
                pts = ((1.0 - s) ** 2) * root + 2.0 * (1.0 - s) * s * mid + (s ** 2) * end
                pts += nrm * (np.sin(t_arr * math.pi) * (0.0065 + layer_shell))[:, None]
                radii[i] = rng.uniform(0.00140, 0.00195)
                families[i] = 0
            curves[i] = pts

        elif i < n_crown + n_temple + n_bangs:
            # Lush, softly parted wispy air-bangs + curtain fringe covering upper forehead down to eyebrows (y ~ 0.036m)
            phi = rng.uniform(-0.56, 0.56)
            theta = rng.uniform(0.60, 0.96)
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0038 + layer_shell * 0.4)
            edge_ratio = min(1.0, abs(phi) / 0.50)
            # Target tip Y: ~0.037m in center (just above eyebrows), sweeping down to ~0.005m at outer temples!
            target_tip_y = 0.038 - 0.036 * (edge_ratio ** 1.45) + rng.uniform(-0.006, 0.006)
            bang_len = max(0.038, float(root[1]) - target_tip_y)
            sweep_x = (0.002 + 0.018 * (edge_ratio ** 1.3)) * math.copysign(1.0, phi + 0.04)
            pts = (
                root[None, :]
                + np.stack([
                    sweep_x * (t_arr ** 1.35),
                    -bang_len * (t_arr ** 1.06),
                    np.sin(t_arr * math.pi * 0.78) * (0.0115 + layer_shell * 0.6) - 0.0020 * (t_arr ** 2),
                ], axis=-1)
            )
            curves[i] = pts
            radii[i] = rng.uniform(0.00125, 0.00175)
            families[i] = 1

        else:
            ang = rng.uniform(0.0, 2.0 * math.pi)
            rad = rng.uniform(0.004, 0.028)
            tail_len = rng.uniform(0.034, 0.058)
            pts = np.stack([
                tie_pos[0] + math.cos(ang) * rad * (0.48 + 0.68 * np.sin(t_arr * math.pi)),
                tie_pos[1] + math.sin(ang) * rad * 0.58 * (1.0 - 0.35 * t_arr) - tail_len * (t_arr ** 1.15),
                tie_pos[2] - 0.006 - np.sin(t_arr * math.pi) * 0.020 - 0.008 * t_arr,
            ], axis=-1)
            curves[i] = pts
            radii[i] = rng.uniform(0.00140, 0.00195)
            families[i] = 0

    curves = enforce_skull_clearance_batch(curves, min_clear=0.0036)
    return curves, radii, families, pigments


def build_center_long_groom(count=12000, samples=36):
    """
    Modern Chinese High-Cranial Center-Parted Curtain Bangs & Flowing Long Hair ("高颅顶八字刘海黑长直"):
    - High-crown lifted roots at center part (+14mm plush cranial arch, "头包脸")
    - Dense S-curve curtain bangs (32% of curves = 3,840 curves!) draping over forehead hairline before parting
    - Lush flowing side & back locks with inward C-curl taper above C4/C5 neck section
    """
    rng = np.random.default_rng(20260421)
    curves = np.zeros((count, samples, 3), dtype=np.float32)
    radii = np.zeros(count, dtype=np.float32)
    families = np.zeros(count, dtype=np.uint8)
    pigments = rng.integers(110, 245, size=count, dtype=np.uint8)
    t_arr = np.linspace(0.0, 1.0, samples, dtype=np.float32)
    clump_guides = make_clump_guides(128, (0.05, 1.48), (-math.pi, math.pi), rng)
    n_curtain = int(count * 0.32)

    for i in range(count):
        layer_shell = (i % 3) * 0.0020
        if i < n_curtain:
            # Dense high-cranial S-curve curtain bangs ("高颅顶法式八字刘海")
            side = 1.0 if (i % 2 == 0) else -1.0
            phi = side * rng.uniform(0.012, 0.62)
            theta = rng.uniform(0.44, 0.96)
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0038 + layer_shell * 0.5)
            edge_ratio = min(1.0, abs(phi) / 0.55)
            # Inner curtain strands (small |phi|) graze outer brow (y ~ 0.025m); outer strands sweep down to jaw (y ~ -0.045m)
            target_tip_y = 0.030 - 0.072 * (edge_ratio ** 1.15) + rng.uniform(-0.006, 0.006)
            curtain_len = max(0.055, float(root[1]) - target_tip_y)
            # Delayed S-curve lateral sweep (t^1.65) so strands drape over the upper forehead FIRST before parting!
            outward_x = max(0.018, 0.064 - abs(root[0]))
            lat_curve = (t_arr ** 1.60) * np.sin(t_arr * math.pi * 0.62) * 1.25
            high_crown_arch = 0.010 * np.sin(t_arr * math.pi * 0.50) * (1.0 - t_arr * 0.5)
            pts = (
                root[None, :]
                + nrm[None, :] * (np.sin(t_arr * math.pi * 0.68) * (0.0085 + layer_shell))[:, None]
                + np.stack([
                    side * (outward_x * lat_curve - 0.006 * (t_arr ** 2.5)),
                    high_crown_arch - curtain_len * (t_arr ** 1.08),
                    0.011 * np.sin(t_arr * math.pi * 0.65) - 0.012 * (t_arr ** 1.50),
                ], axis=-1)
            )
            curves[i] = pts
            radii[i] = rng.uniform(0.00135, 0.00185)
            families[i] = 1
        else:
            u = rng.uniform(0.0, 1.0)
            theta = 0.05 + (u ** 0.72) * 1.44
            phi = rng.uniform(-math.pi, math.pi)
            if abs(phi) < 0.015 and theta < 0.95:
                phi = math.copysign(0.015 + abs(phi), phi if phi != 0 else 1.0)
            # Only exclude bare forehead skin below theta = 0.94, never on the front scalp!
            if abs(phi) < 0.48 and theta > 0.94:
                phi = math.copysign(0.48 + abs(phi) * 0.85, phi if phi != 0 else 1.0)
            g_th, g_ph, g_phase, _ = clump_guides[i % len(clump_guides)]
            theta = 0.86 * theta + 0.14 * g_th
            phi = 0.88 * phi + 0.12 * g_ph
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0036 + layer_shell * 0.5)
            side = 1.0 if root[0] >= 0 else -1.0
            drop_y = max(-0.075, -0.056 - 0.018 * ((1.0 - abs(phi) / math.pi) ** 1.2) + rng.normal(0.0, 0.004))
            total_drop = max(0.065, root[1] - drop_y)
            c_curl = t_arr ** 2.0
            wave = np.sin(t_arr * 4.5 + g_phase) * 0.0025 * t_arr
            temple_push = max(0.0, 0.066 - abs(root[0])) * max(0.0, 1.0 - abs(phi) / 1.35)
            crown_lift = 0.009 * np.sin(t_arr * math.pi * 0.5) * max(0.0, 1.0 - theta / 1.1)
            pts = np.stack([
                root[0] + nrm[0] * (np.sin(t_arr * math.pi * 0.75) * (0.011 + layer_shell)) + side * ((0.012 + temple_push) * (t_arr ** 1.45) * np.sin(t_arr * math.pi * 0.62) - 0.012 * c_curl) + wave,
                root[1] + nrm[1] * (np.sin(t_arr * math.pi * 0.55) * 0.008) + crown_lift - total_drop * (t_arr ** 1.08),
                root[2] + nrm[2] * (np.sin(t_arr * math.pi * 0.70) * (0.009 + layer_shell)) - 0.014 * (t_arr ** 1.4) + 0.006 * c_curl,
            ], axis=-1)
            curves[i] = pts
            radii[i] = rng.uniform(0.00145, 0.00210)
            families[i] = 2 if (abs(phi) < 1.10 and theta > 0.65) else (3 if (i % 20 == 0) else 0)

    curves = enforce_skull_clearance_batch(curves, min_clear=0.0036)
    return curves, radii, families, pigments


def build_low_chignon_groom(count=12000, samples=36):
    """
    Modern Chinese Elegant Side-Swept Low Chignon ("新中式温婉三七分斜掠刘海低盘发"):
    - Plush 3:7 side-parted crown & sweeping goddess fringe across the upper forehead (30% of curves!)
    - Romantic temple waves framing both cheekbones
    - Sculpted silk low bun at the occiput/nape
    """
    rng = np.random.default_rng(20260422)
    curves = np.zeros((count, samples, 3), dtype=np.float32)
    radii = np.zeros(count, dtype=np.float32)
    families = np.zeros(count, dtype=np.uint8)
    pigments = rng.integers(110, 245, size=count, dtype=np.uint8)
    t_arr = np.linspace(0.0, 1.0, samples, dtype=np.float32)
    clump_guides = make_clump_guides(112, (0.05, 1.48), (-math.pi, math.pi), rng)
    chignon_center = np.array([0.0, -0.030, -0.092], dtype=np.float32)
    n_swept = int(count * 0.52)
    n_drape = int(count * 0.30)

    for i in range(count):
        layer_shell = (i % 3) * 0.0019
        if i < n_swept:
            u = rng.uniform(0.0, 1.0)
            theta = 0.05 + (u ** 0.72) * 1.44
            phi = rng.uniform(-math.pi, math.pi)
            if abs(phi) < 0.48 and theta > 0.94:
                phi = math.copysign(0.48 + abs(phi) * 0.85, phi if phi != 0 else 1.0)
            g_th, g_ph, _, _ = clump_guides[i % len(clump_guides)]
            theta = 0.86 * theta + 0.14 * g_th
            phi = 0.88 * phi + 0.12 * g_ph
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0036 + layer_shell * 0.5)
            side = 1.0 if root[0] >= 0 else -1.0
            mid = np.array([
                side * (0.076 + 0.012 * math.sin(abs(phi))),
                max(-0.012, root[1] * 0.56 + 0.022),
                root[2] * 0.46 - 0.046,
            ], dtype=np.float32)
            m_norm = np.linalg.norm(mid - HEAD_CORE)
            if m_norm < 0.104:
                mid = HEAD_CORE + (mid - HEAD_CORE) / max(m_norm, 1e-6) * 0.104
            end = chignon_center + np.array([
                rng.normal(0.0, 0.015),
                rng.normal(0.0, 0.010),
                rng.normal(-0.004, 0.006),
            ], dtype=np.float32)
            s = t_arr[:, None]
            pts = ((1.0 - s) ** 2) * root + 2.0 * (1.0 - s) * s * mid + (s ** 2) * end
            pts += nrm * (np.sin(t_arr * math.pi) * (0.0085 + layer_shell))[:, None]
            curves[i] = pts
            radii[i] = rng.uniform(0.00145, 0.00210)
            families[i] = 3 if (i % 20 == 0) else 0

        elif i < n_swept + n_drape:
            # 3:7 side-swept goddess fringe & temple waves
            is_right_sweep = (i % 3 != 0)
            phi = rng.uniform(-0.22, 0.88) if is_right_sweep else rng.uniform(-0.92, -0.22)
            theta = rng.uniform(0.46, 0.96)
            root, nrm = sample_scalp_fast(theta, phi, lift=0.0038 + layer_shell * 0.5)
            side = 1.0 if is_right_sweep else -1.0
            edge_ratio = min(1.0, abs(phi - (-0.22)) / 0.70)
            target_tip_y = 0.034 - 0.068 * (edge_ratio ** 1.15) + rng.uniform(-0.006, 0.006)
            wisp_len = max(0.052, float(root[1]) - target_tip_y)
            outward_x = max(0.018, 0.064 - side * root[0])
            lat_curve = (t_arr ** 1.50) * np.sin(t_arr * math.pi * 0.60) * 1.22
            pts = (
                root[None, :]
                + nrm[None, :] * (np.sin(t_arr * math.pi * 0.70) * (0.0080 + layer_shell))[:, None]
                + np.stack([
                    side * (outward_x * lat_curve - 0.008 * (t_arr ** 2.2)),
                    0.008 * np.sin(t_arr * math.pi * 0.5) - wisp_len * (t_arr ** 1.08),
                    0.011 * np.sin(t_arr * math.pi * 0.68) - 0.012 * (t_arr ** 1.5),
                ], axis=-1)
            )
            curves[i] = pts
            radii[i] = rng.uniform(0.00135, 0.00185)
            families[i] = 1 if abs(phi) < 0.55 else 2

        else:
            u = rng.uniform(0.0, 2.0 * math.pi)
            v = rng.uniform(0.0, 2.0 * math.pi)
            R = 0.026 + rng.normal(0.0, 0.003)
            r = 0.012 + rng.normal(0.0, 0.002)
            theta_t = u + t_arr * 2.2 * math.pi
            phi_t = v + t_arr * 4.4 * math.pi
            pts = np.stack([
                chignon_center[0] + (R + r * np.cos(phi_t)) * np.cos(theta_t) * 1.18,
                chignon_center[1] + (R + r * np.cos(phi_t)) * np.sin(theta_t) * 0.85,
                chignon_center[2] - 0.008 + r * np.sin(phi_t),
            ], axis=-1)
            curves[i] = pts
            radii[i] = rng.uniform(0.00145, 0.00205)
            families[i] = 0

    curves = enforce_skull_clearance_batch(curves, min_clear=0.0036)
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

print("Stage 21 Masterpiece skin/eye/brow/bone-morphs & 3-layer high-cranial .groom assets built successfully!")
