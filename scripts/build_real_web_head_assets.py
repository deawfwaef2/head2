#!/usr/bin/env python3
"""
Stage 30 Builder: Authentic Wrinkle-Free Young Asian / Chinese / Korean / Eurasian Female Heads,
Multi-Head Morph Blending Channels, Zero Red-Eye Fix, 8 Switchable Photographic Skin Materials,
and 8 High-Contrast Real 3D MakeHuman Eyebrows.
"""
import io
import json
import os
import struct
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import gaussian_filter
from scipy.spatial import cKDTree

GLB_OUT_PATH = '/home/user/public/models/daz_asian_head_base.glb'
CLEAN_BASE_GLB = '/tmp/check_git/head_37f0260.glb'
STAGE28_BASE_GLB = '/tmp/check_git/head_2f77c19.glb'


def load_glb(path):
    with open(path, 'rb') as f:
        raw = f.read()
    jlen = struct.unpack('<I', raw[12:16])[0]
    gltf = json.loads(raw[20:20 + jlen].decode('utf-8'))
    bin_buf = bytearray(raw[28 + jlen:])
    return gltf, bin_buf


def save_glb(path, gltf, bin_buf):
    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    pad_j = (4 - (len(json_bytes) % 4)) % 4
    json_bytes += b' ' * pad_j
    pad_b = (4 - (len(bin_buf) % 4)) % 4
    bin_buf += b'\x00' * pad_b
    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_buf)
    with open(path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, total_len))
        f.write(struct.pack('<II', len(json_bytes), 0x4E4F534A))
        f.write(json_bytes)
        f.write(struct.pack('<II', len(bin_buf), 0x004E4942))
        f.write(bin_buf)


def get_acc_array(gltf, bin_buf, acc_idx):
    acc = gltf['accessors'][acc_idx]
    bv = gltf['bufferViews'][acc['bufferView']]
    offset = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    dt = {5126: np.float32, 5123: np.uint16, 5122: np.int16, 5125: np.uint32, 5121: np.uint8, 5120: np.int8}[acc['componentType']]
    ch = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}[acc['type']]
    arr = np.frombuffer(bin_buf, dtype=dt, count=acc['count'] * ch, offset=offset).copy()
    return arr.reshape(acc['count'], ch) if ch > 1 else arr


def set_acc_array(gltf, bin_buf, acc_idx, arr):
    acc = gltf['accessors'][acc_idx]
    bv = gltf['bufferViews'][acc['bufferView']]
    offset = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    dt = {5126: np.float32, 5123: np.uint16, 5122: np.int16, 5125: np.uint32, 5121: np.uint8, 5120: np.int8}[acc['componentType']]
    raw = np.ascontiguousarray(arr, dtype=dt).tobytes()
    bin_buf[offset:offset + len(raw)] = raw
    acc['min'] = np.min(arr, axis=0).astype(float).tolist() if dt == np.float32 else np.min(arr, axis=0).astype(int).tolist()
    acc['max'] = np.max(arr, axis=0).astype(float).tolist() if dt == np.float32 else np.max(arr, axis=0).astype(int).tolist()


def parse_mh_obj_vertices(obj_path):
    verts = []
    with open(obj_path, 'r') as f:
        for line in f:
            if line.startswith('v '):
                p = line.split()
                verts.append([float(p[1]), float(p[2]), float(p[3])])
    return np.array(verts, dtype=np.float32)


def load_target_deltas(target_path, num_verts=19158):
    deltas = np.zeros((num_verts, 3), dtype=np.float32)
    if not os.path.exists(target_path):
        return deltas
    with open(target_path, 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            p = line.split()
            if len(p) >= 4:
                try:
                    vi = int(p[0])
                    if 0 <= vi < num_verts:
                        deltas[vi] = [float(p[1]), float(p[2]), float(p[3])]
                except ValueError:
                    pass
    return deltas


def build_clean_young_skin_variants():
    """
    Builds 8 wrinkle-free, stubble-free Young Asian / Chinese / Korean / Eurasian
    photographic female skin textures (1280x1280) with low memory footprint.
    """
    RES = 1280
    s = RES / 2048.0
    im37 = np.array(Image.open('/tmp/check_git/commit_37f0260_img_0.png').convert('RGB').resize((RES, RES), Image.Resampling.LANCZOS), dtype=np.float32)
    im_mh_asian = np.array(Image.open('/tmp/mpfb_check/skin_albedo.png').convert('RGB').resize((RES, RES), Image.Resampling.LANCZOS), dtype=np.float32)
    im_mh_eurasian = np.array(Image.open('/tmp/mpfb_check/skin_eurasian.png').convert('RGB').resize((RES, RES), Image.Resampling.LANCZOS), dtype=np.float32)

    yy, xx = np.mgrid[0:RES, 0:RES].astype(np.float32) / s

    # 1. Clean Face Oval Mask (eliminates shaved scalp stubble outside face oval)
    face_oval = np.clip(1.0 - np.sqrt(((xx - 1812.0) / 182.0) ** 2 + ((yy - 1058.0) / 226.0) ** 2), 0.0, 1.0)
    ear_l = np.clip(1.0 - np.sqrt(((xx - 1715.0) / 85.0) ** 2 + ((yy - 765.0) / 62.0) ** 2), 0.0, 1.0)
    ear_r = np.clip(1.0 - np.sqrt(((xx - 1715.0) / 85.0) ** 2 + ((yy - 1350.0) / 62.0) ** 2), 0.0, 1.0)
    keep_face = gaussian_filter(np.maximum(face_oval, np.maximum(ear_l, ear_r)), sigma=24.0 * s)[..., None]

    # 2. De-wrinkle nasolabial & tear-trough low-frequency shadows
    naso_l = np.exp(-(((xx - 1850.0) / 55.0) ** 2 + ((yy - 995.0) / 38.0) ** 2))
    naso_r = np.exp(-(((xx - 1850.0) / 55.0) ** 2 + ((yy - 1121.0) / 38.0) ** 2))
    tear_l = np.exp(-(((xx - 1785.0) / 28.0) ** 2 + ((yy - 980.0) / 42.0) ** 2))
    tear_r = np.exp(-(((xx - 1785.0) / 28.0) ** 2 + ((yy - 1136.0) / 42.0) ** 2))
    glabella = np.exp(-(((xx - 1725.0) / 30.0) ** 2 + ((yy - 1058.0) / 35.0) ** 2))
    smooth_zone = np.clip(naso_l + naso_r + 0.75 * (tear_l + tear_r) + 0.85 * glabella, 0.0, 1.0)[..., None]

    mh_low = np.stack([gaussian_filter(im_mh_asian[..., c], sigma=12.0 * s) for c in range(3)], axis=-1)
    mh_very_smooth = np.stack([gaussian_filter(im_mh_asian[..., c], sigma=36.0 * s) for c in range(3)], axis=-1)
    mh_pores = (im_mh_asian - mh_low) * (1.0 - 0.55 * smooth_zone)

    # Remove the 3 baked moles from im37 for non-Fang-Yaoping variants
    im37_smooth_patch = np.stack([gaussian_filter(im37[..., c], sigma=7.0 * s) for c in range(3)], axis=-1)
    m1 = np.exp(-(((xx - 1810.5) ** 2 + (yy - 1134.5) ** 2) / (8.5 ** 2)))
    m2 = np.exp(-(((xx - 1820.5) ** 2 + (yy - 1154.5) ** 2) / (8.5 ** 2)))
    m3 = np.exp(-(((xx - 1850.5) ** 2 + (yy - 1170.5) ** 2) / (8.5 ** 2)))
    mole3_mask = np.clip(m1 + m2 + m3, 0.0, 1.0)[..., None]
    im37_molefree = im37 * (1.0 - mole3_mask) + im37_smooth_patch * mole3_mask

    youth_photo_face = mh_low * (1.0 - 0.72 * smooth_zone) + mh_very_smooth * (0.72 * smooth_zone) + mh_pores * 0.82
    base_clean = im37_molefree * (1.0 - keep_face * 0.62) + youth_photo_face * (keep_face * 0.62)
    neck_rim = ((xx < 1250) & (yy < 500)).astype(np.float32)[..., None]
    base_clean = base_clean * (1.0 - neck_rim) + im37_molefree * neck_rim

    # Exact photographic lip vermilion mask centered at (xx=1864, yy=1056) following real Cupid's bow
    mouth_window = np.exp(-(((xx - 1864.0) / 22.0) ** 2 + ((yy - 1056.2) / 42.0) ** 2) ** 1.6)
    raw_redness = (base_clean[..., 0] - 0.52 * (base_clean[..., 1] + base_clean[..., 2]))
    lip_vermilion = np.clip((raw_redness - 20.0) / 18.0, 0.0, 1.0) * mouth_window
    lip_mask = gaussian_filter(lip_vermilion, sigma=2.2 * s)[..., None]
    lip_inner_win = np.exp(-(((xx - 1864.5) / 8.5) ** 2 + ((yy - 1056.2) / 26.0) ** 2) ** 1.4)
    lip_inner = gaussian_filter(np.clip(lip_vermilion * 1.2, 0.0, 1.0) * lip_inner_win, sigma=1.8 * s)[..., None]

    cheek_l = np.exp(-(((xx - 1805.0) / 42.0) ** 2 + ((yy - 962.0) / 48.0) ** 2))[..., None]
    cheek_r = np.exp(-(((xx - 1805.0) / 42.0) ** 2 + ((yy - 1152.0) / 48.0) ** 2))[..., None]
    cheeks = np.clip(cheek_l + cheek_r, 0.0, 1.0)

    eyelid_l = np.exp(-(((xx - 1748.0) / 14.0) ** 2 + ((yy - 982.0) / 34.0) ** 2))[..., None]
    eyelid_r = np.exp(-(((xx - 1748.0) / 14.0) ** 2 + ((yy - 1132.0) / 34.0) ** 2))[..., None]
    eyelids = np.clip(eyelid_l + eyelid_r, 0.0, 1.0)

    aegyo_l = np.exp(-(((xx - 1770.0) / 6.5) ** 2 + ((yy - 984.0) / 26.0) ** 2))[..., None]
    aegyo_r = np.exp(-(((xx - 1770.0) / 6.5) ** 2 + ((yy - 1130.0) / 26.0) ** 2))[..., None]
    aegyo = np.clip(aegyo_l + aegyo_r, 0.0, 1.0)

    nose_hi = np.exp(-(((xx - 1788.0) / 38.0) ** 2 + ((yy - 1056.2) / 8.5) ** 2))[..., None]

    def add_mole(img, cx, cy, radius=2.3, strength=0.58):
        m = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (radius ** 2)))[..., None]
        mole_col = np.array([72.0, 50.0, 44.0], dtype=np.float32)
        return img * (1.0 - m * strength) + mole_col * (m * strength)

    variants = {}

    v1 = base_clean * np.array([1.03, 1.03, 1.05]) + np.array([4.0, 4.0, 6.0]) * keep_face
    v1 = v1 * (1.0 - cheeks * 0.14) + np.array([242.0, 168.0, 166.0]) * (cheeks * 0.14)
    v1 = v1 * (1.0 - lip_mask * 0.45) + np.array([218.0, 106.0, 114.0]) * (lip_mask * 0.45)
    v1 = v1 * (1.0 - lip_inner * 0.38) + np.array([196.0, 74.0, 86.0]) * (lip_inner * 0.38)
    variants['cn_porcelain_ivory'] = np.clip(v1 + nose_hi * 9.0, 0, 255).astype(np.uint8)

    # Fang Yaoping signature scholar skin: preserves the 3 authentic right-cheek moles from im37!
    v2 = im37 * (1.0 - keep_face * 0.42) + base_clean * (keep_face * 0.42)
    v2 = v2 * (1.0 - mole3_mask) + im37 * mole3_mask
    v2 = v2 * (1.0 - lip_mask * 0.32) + np.array([206.0, 110.0, 110.0]) * (lip_mask * 0.32)
    variants['cn_scholar_natural'] = np.clip(v2, 0, 255).astype(np.uint8)

    v3 = base_clean * np.array([1.05, 1.03, 1.04]) + np.array([6.0, 3.0, 5.0]) * keep_face
    v3 = v3 * (1.0 - cheeks * 0.28) + np.array([248.0, 148.0, 152.0]) * (cheeks * 0.28)
    v3 = v3 * (1.0 - eyelids * 0.20) + np.array([238.0, 156.0, 150.0]) * (eyelids * 0.20)
    v3 = v3 + aegyo * np.array([16.0, 12.0, 10.0]) + nose_hi * 12.0
    v3 = v3 * (1.0 - lip_mask * 0.52) + np.array([232.0, 102.0, 112.0]) * (lip_mask * 0.52)
    v3 = v3 * (1.0 - lip_inner * 0.42) + np.array([218.0, 62.0, 78.0]) * (lip_inner * 0.42)
    variants['kr_dewy_peach'] = np.clip(v3, 0, 255).astype(np.uint8)

    v4 = base_clean * np.array([1.03, 1.04, 1.07]) + np.array([4.0, 5.0, 9.0]) * keep_face
    v4 = v4 * (1.0 - eyelids * 0.25) + np.array([168.0, 128.0, 132.0]) * (eyelids * 0.25)
    v4 = v4 * (1.0 - cheeks * 0.16) + np.array([226.0, 152.0, 168.0]) * (cheeks * 0.16)
    v4 = v4 * (1.0 - lip_mask * 0.56) + np.array([186.0, 74.0, 96.0]) * (lip_mask * 0.56)
    v4 = v4 * (1.0 - lip_inner * 0.48) + np.array([148.0, 38.0, 62.0]) * (lip_inner * 0.48) + nose_hi * 14.0
    v4 = add_mole(v4, 1775.0, 948.0, radius=2.2, strength=0.68)
    variants['kr_chaebol_cool'] = np.clip(v4, 0, 255).astype(np.uint8)

    v5 = base_clean * np.array([1.04, 1.02, 0.99]) + np.array([5.0, 3.0, 0.0]) * keep_face
    v5 = v5 * (1.0 - eyelids * 0.22) + np.array([218.0, 138.0, 124.0]) * (eyelids * 0.22)
    v5 = v5 * (1.0 - cheeks * 0.18) + np.array([234.0, 158.0, 148.0]) * (cheeks * 0.18)
    v5 = v5 * (1.0 - lip_mask * 0.28) + np.array([218.0, 134.0, 130.0]) * (lip_mask * 0.28)
    v5 = v5 * (1.0 - lip_inner * 0.68) + np.array([192.0, 52.0, 54.0]) * (lip_inner * 0.68)
    v5 = add_mole(v5, 1782.0, 1142.0, radius=2.1, strength=0.64)
    variants['cn_jiangnan_jade'] = np.clip(v5, 0, 255).astype(np.uint8)

    v6 = base_clean * np.array([1.06, 1.04, 1.05]) + np.array([7.0, 4.0, 6.0]) * keep_face
    v6 = v6 * (1.0 - cheeks * 0.32) + np.array([246.0, 136.0, 148.0]) * (cheeks * 0.32)
    v6 = v6 * (1.0 - eyelids * 0.26) + np.array([236.0, 132.0, 144.0]) * (eyelids * 0.26)
    v6 = v6 * (1.0 - lip_mask * 0.60) + np.array([216.0, 64.0, 78.0]) * (lip_mask * 0.60)
    v6 = v6 * (1.0 - lip_inner * 0.45) + np.array([188.0, 36.0, 52.0]) * (lip_inner * 0.45) + aegyo * np.array([14.0, 10.0, 10.0]) + nose_hi * 12.0
    v6 = add_mole(v6, 1786.0, 1052.0, radius=2.0, strength=0.62)
    variants['kr_firstlove_camellia'] = np.clip(v6, 0, 255).astype(np.uint8)

    v7 = base_clean * np.array([1.01, 1.01, 1.02])
    v7 = v7 * (1.0 - eyelids * 0.24) + np.array([162.0, 126.0, 118.0]) * (eyelids * 0.24)
    v7 = v7 * (1.0 - cheeks * 0.15) + np.array([198.0, 142.0, 136.0]) * (cheeks * 0.15)
    v7 = v7 * (1.0 - lip_mask * 0.54) + np.array([178.0, 92.0, 96.0]) * (lip_mask * 0.54)
    v7 = v7 * (1.0 - lip_inner * 0.38) + np.array([154.0, 68.0, 74.0]) * (lip_inner * 0.38)
    v7 = add_mole(v7, 1836.0, 976.0, radius=2.2, strength=0.65)
    variants['cn_intellectual_olive'] = np.clip(v7, 0, 255).astype(np.uint8)

    eu_low = np.stack([gaussian_filter(im_mh_eurasian[..., c], sigma=12.0 * s) for c in range(3)], axis=-1)
    eu_very_smooth = np.stack([gaussian_filter(im_mh_eurasian[..., c], sigma=36.0 * s) for c in range(3)], axis=-1)
    eu_pores = (im_mh_eurasian - eu_low) * (1.0 - 0.65 * smooth_zone)
    eu_clean_face = eu_low * (1.0 - 0.78 * smooth_zone) + eu_very_smooth * (0.78 * smooth_zone) + eu_pores * 0.75
    v8 = base_clean * (1.0 - keep_face * 0.58) + eu_clean_face * (keep_face * 0.58)
    v8 = v8 * np.array([1.04, 1.02, 1.01]) + np.array([6.0, 4.0, 3.0]) * keep_face
    v8 = v8 * (1.0 - lip_mask * 0.45) + np.array([196.0, 104.0, 108.0]) * (lip_mask * 0.45)
    v8 = v8 * (1.0 - neck_rim) + im37 * neck_rim
    variants['eurasian_velvet_rose'] = np.clip(v8, 0, 255).astype(np.uint8)

    return variants


def build_wrinkle_free_young_normal_map():
    """
    Replaces Aksel_Skin_NRM.png (which had old-man wrinkles, frown lines, eye bags, and chin stubble)
    with the clean young female normal map from 37f0260, enriched ONLY with uniform, wrinkle-free
    microscopic young-girl dermal pores.
    """
    RES = 1024
    s = RES / 2048.0
    nrm37 = np.array(Image.open('/tmp/check_git/commit_37f0260_img_1.png').convert('RGB').resize((RES, RES), Image.Resampling.LANCZOS), dtype=np.float32)
    rng = np.random.default_rng(20261013)
    noise = rng.normal(0.0, 1.0, (RES, RES)).astype(np.float32)
    micro_pores = gaussian_filter(noise, sigma=0.85) - gaussian_filter(noise, sigma=2.1)
    micro_pores /= (np.std(micro_pores) + 1e-6)
    dy, dx = np.gradient(micro_pores)

    yy, xx = np.mgrid[0:RES, 0:RES].astype(np.float32) / s
    face_oval = np.clip(1.0 - np.sqrt(((xx - 1812.0) / 182.0) ** 2 + ((yy - 1058.0) / 226.0) ** 2), 0.0, 1.0)
    pore_weight = gaussian_filter(face_oval, sigma=20.0 * s) * 1.8

    out = nrm37.copy()
    out[..., 0] = np.clip(out[..., 0] + dx * pore_weight, 0, 255)
    out[..., 1] = np.clip(out[..., 1] + dy * pore_weight, 0, 255)
    return out.astype(np.uint8)


def enhance_eyebrow_assets(eyebrows_meta, head_v_37, mh_verts, tree_mh_to_37):
    """
    Enhances the 8 real MakeHuman 3D eyebrow assets so each one has:
    1) High-contrast, rich natural dark-brown/charcoal hair strand alpha (no faint invisible brows!)
    2) Distinct 3D brow arch/angle geometry sculpted via official MPFB2 eyebrow targets + arch shaping
    """
    t_brow_down = load_target_deltas('/tmp/mpfb_check/eyebrows-angle-down.target')
    t_brow_up = load_target_deltas('/tmp/mpfb_check/eyebrows-angle-up.target')

    # Distinct 3D sculpting profiles for the 8 eyebrow styles so switching is dramatically visible
    # Note: on Eyebrows mesh, |x| goes from inner brow (~0.012) to outer tail (~0.055), y is vertical, z is forward
    brow_profiles = {
        'eyebrow001': {'inner_dy': 0.0005, 'outer_dy': 0.0002, 'arch_dy': 0.0004, 'thick_scale': 1.05, 'alpha_boost': 2.2, 'gamma': 0.72},   # 韩系平直雾眉 (Straight Korean mist)
        'eyebrow002': {'inner_dy': -0.0004, 'outer_dy': 0.0012, 'arch_dy': 0.0024, 'thick_scale': 0.85, 'alpha_boost': 2.5, 'gamma': 0.68},  # 古典弯月柳叶眉 (Classical willow arch)
        'eyebrow003': {'inner_dy': -0.0012, 'outer_dy': 0.0032, 'arch_dy': 0.0016, 'thick_scale': 1.12, 'alpha_boost': 2.4, 'gamma': 0.70},  # 英气上挑剑眉 (Ascending sword brow)
        'eyebrow004': {'inner_dy': 0.0018, 'outer_dy': -0.0022, 'arch_dy': -0.0006, 'thick_scale': 1.00, 'alpha_boost': 2.8, 'gamma': 0.65}, # 无辜下垂八字眉 (Drooping puppy brow)
        'eyebrow005': {'inner_dy': -0.0003, 'outer_dy': 0.0018, 'arch_dy': 0.0018, 'thick_scale': 1.25, 'alpha_boost': 2.3, 'gamma': 0.70},  # 野生根根分明毛流眉 (Feathered wild brow)
        'eyebrow007': {'inner_dy': 0.0006, 'outer_dy': 0.0008, 'arch_dy': 0.0010, 'thick_scale': 0.78, 'alpha_boost': 2.6, 'gamma': 0.66},   # 盛唐远山蛾眉 (Compact delicate moth brow)
        'eyebrow010': {'inner_dy': -0.0006, 'outer_dy': 0.0022, 'arch_dy': 0.0026, 'thick_scale': 0.96, 'alpha_boost': 2.7, 'gamma': 0.65},  # 韩系女团流星挑眉 (Korean idol meteor arch)
        'eyebrow012': {'inner_dy': 0.0002, 'outer_dy': 0.0006, 'arch_dy': 0.0008, 'thick_scale': 1.02, 'alpha_boost': 2.5, 'gamma': 0.68},   # 清纯学生原生柔眉 (Natural student brow)
    }

    enhanced_eyebrows = {}
    for eb_id, eb in eyebrows_meta.items():
        pos = np.array(eb['pos'], dtype=np.float32).reshape(-1, 3)
        prof = brow_profiles.get(eb_id, brow_profiles['eyebrow001'])

        # Map each eyebrow vertex across |x| ∈ [0.010, 0.056]
        ax = np.abs(pos[:, 0])
        t_span = np.clip((ax - 0.011) / (0.055 - 0.011), 0.0, 1.0)
        arch_bell = np.clip(np.sin(t_span * np.pi), 0.0, 1.0) ** 1.4

        # Vertical thickness relative to local centerline of the brow
        y_center = np.mean(pos[:, 1])
        pos[:, 1] = y_center + (pos[:, 1] - y_center) * prof['thick_scale']
        pos[:, 1] += (1.0 - t_span) * prof['inner_dy'] + t_span * prof['outer_dy'] + arch_bell * prof['arch_dy']
        # Push slightly forward (+0.45mm) so it never z-fights or sinks into the Asian brow ridge
        pos[:, 2] += 0.00045

        tex_file = '/tmp/mpfb_check/eyebrow.png' if eb_id == 'eyebrow001' else f'/tmp/mpfb_check/{eb_id}_tex.png'
        im_eb = Image.open(tex_file).convert('RGBA')
        arr_eb = np.array(im_eb, dtype=np.float32)

        # Darken pale brown MakeHuman brow hairs into rich dark espresso/charcoal and boost alpha
        rgb = arr_eb[..., :3] / 255.0
        alpha = arr_eb[..., 3] / 255.0
        alpha_new = np.clip((alpha ** prof['gamma']) * prof['alpha_boost'], 0.0, 1.0)
        # Rich dark brown-black strand color so it contrasts clearly against fair Asian skin
        rgb_new = np.clip((rgb ** 1.35) * 0.42 * 255.0, 18.0, 95.0)

        out_rgba = np.zeros_like(arr_eb, dtype=np.uint8)
        out_rgba[..., :3] = rgb_new.astype(np.uint8)
        out_rgba[..., 3] = (alpha_new * 255.0).astype(np.uint8)

        buf = io.BytesIO()
        Image.fromarray(out_rgba, mode='RGBA').save(buf, format='PNG', optimize=True)

        enhanced_eyebrows[eb_id] = {
            'pos': np.round(pos, 6).flatten().tolist(),
            'uv': eb['uv'],
            'png_bytes': buf.getvalue(),
        }
    return enhanced_eyebrows


def main():
    print("Loading clean 37f0260 base GLB...")
    gltf, bin_buf = load_glb(CLEAN_BASE_GLB)
    gltf28, bin28 = load_glb(STAGE28_BASE_GLB)

    # 1. Load MakeHuman basemesh & official targets
    mh_verts = parse_mh_obj_vertices('/tmp/mh_base.obj')
    head_prim = gltf['meshes'][0]['primitives'][0]
    head_v = get_acc_array(gltf, bin_buf, head_prim['attributes']['POSITION']).copy()
    eyelash_v = get_acc_array(gltf, bin_buf, gltf['meshes'][2]['primitives'][0]['attributes']['POSITION']).copy()

    # Map head_v back to MakeHuman vertex indices via cKDTree on Caucasian-female-young shifted coords
    t_cauc = load_target_deltas('/tmp/mpfb_check/caucasian-female-young.target')
    t_asian = load_target_deltas('/tmp/mpfb_check/asian-female-young.target')
    t_age_decr = load_target_deltas('/tmp/mpfb_check/head-age-decr.target')

    # Align mh_verts + t_cauc to head_v
    mh_cauc = mh_verts + t_cauc
    # Find nearest vertices in mh_cauc centered around head
    mh_head_mask = np.where((mh_cauc[:, 1] > 0.42) & (mh_cauc[:, 1] < 0.78))[0]
    # Center match via bounding box / eye center
    offset_cauc = np.array([0.0, -0.62538, -0.01545], dtype=np.float32)
    tree = cKDTree(mh_cauc + offset_cauc)
    dists, mh_idx = tree.query(head_v)
    valid_skin = (dists < 0.025).astype(np.float32)[:, None]

    # Compute eye-socket-aligned pure Asian-vs-Caucasian craniofacial delta
    tree_lash = cKDTree(head_v)
    d_lash, idx_lash = tree_lash.query(eyelash_v)
    eye_rim_vi = np.unique(idx_lash[d_lash < 0.003])
    eye_rim_mh = mh_idx[eye_rim_vi]

    p_cauc = mh_verts + t_cauc
    p_asian = mh_verts + t_asian
    c_cauc = p_cauc[eye_rim_mh].mean(axis=0)
    c_asian = p_asian[eye_rim_mh].mean(axis=0)
    scale_align = np.linalg.norm(p_cauc[eye_rim_mh] - c_cauc, axis=1).mean() / np.linalg.norm(p_asian[eye_rim_mh] - c_asian, axis=1).mean()
    p_asian_aligned = (p_asian - c_asian) * scale_align + c_cauc
    delta_asian_mh = p_asian_aligned - p_cauc

    # Taper smoothly to 0 at neck bottom (y < -0.055) and eye rim so eyes & neck cut remain 100% sealed
    neck_taper = np.clip((head_v[:, 1] - (-0.062)) / (0.045), 0.0, 1.0)[:, None]
    d_to_eye, _ = cKDTree(head_v[eye_rim_vi]).query(head_v)
    eye_taper = np.clip((d_to_eye - 0.0025) / 0.010, 0.0, 1.0)[:, None]
    safe_weight = valid_skin * neck_taper * eye_taper

    delta_asian_head = delta_asian_mh[mh_idx] * safe_weight
    delta_youth_head = t_age_decr[mh_idx] * safe_weight

    # Bake 0.72 * delta_asian_head + 0.38 * delta_youth_head into the default base head mesh!
    # This makes the 0-weight default head a smooth, authentic 19-year-old East Asian girl!
    baked_base_delta = 0.72 * delta_asian_head + 0.38 * delta_youth_head
    head_v_new = head_v + baked_base_delta
    set_acc_array(gltf, bin_buf, head_prim['attributes']['POSITION'], head_v_new)

    # Also apply nearest-neighbor smooth delta to Eyebrows base mesh so eyebrows sit flush on the new Asian brow ridge
    eb_prim = gltf['meshes'][1]['primitives'][0]
    eb_v = get_acc_array(gltf, bin_buf, eb_prim['attributes']['POSITION']).copy()
    _, eb_to_head = cKDTree(head_v).query(eb_v)
    eb_v_new = eb_v + baked_base_delta[eb_to_head]
    set_acc_array(gltf, bin_buf, eb_prim['attributes']['POSITION'], eb_v_new)

    # 2. Load additional real MPFB2 + Elvaerwyn .target files for the 9 blendable head/brow morph channels
    t_round = load_target_deltas('/tmp/mpfb_check/head-round.target')
    t_oval = load_target_deltas('/tmp/mpfb_check/head-oval.target')
    t_diamond = load_target_deltas('/tmp/mpfb_check/head-diamond.target')
    t_heart = load_target_deltas('/tmp/mpfb_check/head-invertedtriangular.target')
    t_fat_decr = load_target_deltas('/tmp/mpfb_check/head-fat-decr.target')
    t_chin_w_decr = load_target_deltas('/tmp/mpfb_check/chin-width-decr.target')
    t_chin_h_decr = load_target_deltas('/tmp/mpfb_check/chin-height-decr.target')
    t_cheek_decr = load_target_deltas('/tmp/mpfb_check/l-cheek-bones-decr.target') + load_target_deltas('/tmp/mpfb_check/r-cheek-bones-decr.target')
    t_cheek_inner = load_target_deltas('/tmp/mpfb_check/l-cheek-inner-incr.target') + load_target_deltas('/tmp/mpfb_check/r-cheek-inner-incr.target')
    t_chipmunk = load_target_deltas('/tmp/mpfb_check/cheek/elvs_chipmunk_cheeks_low_1/elvs_chipmunk_cheeks_low_1.target')
    t_high_chubby = load_target_deltas('/tmp/mpfb_check/cheek/elvs_high_chubby_cheekbones_1/elvs_high_chubby_cheekbones_1.target')
    t_brow_down = load_target_deltas('/tmp/mpfb_check/eyebrows-angle-down.target')
    t_brow_up = load_target_deltas('/tmp/mpfb_check/eyebrows-angle-up.target')

    # Map the 9 repurposed morph slots:
    # 2: mh_head_asian_youth (Extra pure East Asian youthful neoteny boost)
    # 3: mh_head_round       (Chinese babyface / plump round cheeks & short chin)
    # 14: mh_head_heart      (Korean chaebol V-line heart face & high apple cheeks)
    # 15: mh_head_oval       (Chinese scholar gentle oval face & full inner cheeks)
    # 20: mh_head_melon      (Classical Jiangnan slender melon-seed face & tapered jaw)
    # 21: mh_head_diamond    (Cool intellectual sculpted high-cheekbone slim face)
    # 28: mh_head_eurasian   (Eurasian / Western deep-set orbital & bridge bone structure — preserved for multi-head mixing!)
    # 29: mh_brow_down       (Gentle drooping brow ridge)
    # 31: mh_brow_up         (Heroic ascending brow ridge)
    slot_deltas_head = {
        2:  (0.45 * delta_asian_mh + 0.40 * t_age_decr + 0.30 * t_cheek_inner)[mh_idx] * safe_weight,
        3:  (0.75 * t_round + 0.55 * t_chipmunk + 0.45 * t_chin_h_decr)[mh_idx] * safe_weight,
        14: (0.65 * t_heart + 0.50 * t_high_chubby + 0.65 * t_chin_w_decr)[mh_idx] * safe_weight,
        15: (0.75 * t_oval + 0.45 * t_cheek_inner + 0.25 * t_chin_w_decr)[mh_idx] * safe_weight,
        20: (0.60 * t_oval + 0.85 * t_chin_w_decr + 0.55 * t_cheek_decr + 0.30 * t_chin_h_decr)[mh_idx] * safe_weight,
        21: (0.70 * t_diamond + 0.55 * t_fat_decr + 0.45 * t_chin_w_decr)[mh_idx] * safe_weight,
        28: (-0.85 * delta_asian_head),
        29: (0.95 * t_brow_down)[mh_idx] * safe_weight,
        31: (0.95 * t_brow_up)[mh_idx] * safe_weight,
    }

    repurposed_slots = sorted(slot_deltas_head.keys())

    # Update morph target names on ALL meshes and write deltas cleanly
    for m_idx, mesh in enumerate(gltf['meshes']):
        target_names = mesh.get('extras', {}).get('targetNames', [])
        if len(target_names) >= 32:
            target_names[2] = 'mh_head_asian_youth'
            target_names[3] = 'mh_head_round'
            target_names[14] = 'mh_head_heart'
            target_names[15] = 'mh_head_oval'
            target_names[20] = 'mh_head_melon'
            target_names[21] = 'mh_head_diamond'
            target_names[28] = 'mh_head_eurasian'
            target_names[29] = 'mh_brow_down'
            target_names[31] = 'mh_brow_up'

        # CRITICAL FIX FOR RED EYES BUG: Iterate over ALL primitives of every mesh (Eyes has 3 primitives!)
        for prim in mesh['primitives']:
            if 'targets' not in prim:
                continue
            for slot in repurposed_slots:
                if slot >= len(prim['targets']):
                    continue
                pos_acc_idx = prim['targets'][slot]['POSITION']
                cur_arr = get_acc_array(gltf, bin_buf, pos_acc_idx)
                if m_idx == 0:
                    # HeadSkin
                    set_acc_array(gltf, bin_buf, pos_acc_idx, slot_deltas_head[slot])
                elif m_idx == 1:
                    # Eyebrows follow HeadSkin
                    set_acc_array(gltf, bin_buf, pos_acc_idx, slot_deltas_head[slot][eb_to_head])
                else:
                    # Eyelashes, Eyes (ALL 3 primitives!), Teeth, Tongue: ZERO OUT repurposed eye/tongue/brow slots!
                    set_acc_array(gltf, bin_buf, pos_acc_idx, np.zeros_like(cur_arr))

    # 3. Build 8 Wrinkle-Free Young Asian / Chinese / Korean / Eurasian Skin Materials
    print("Building 8 wrinkle-free Young Asian / Chinese / Korean / Eurasian skin textures...")
    skin_variants = build_clean_young_skin_variants()

    # Save face crops of the new skin variants & normal map for visual inspection
    os.makedirs('/tmp/stage30_crops', exist_ok=True)
    for k, arr in skin_variants.items():
        im = Image.fromarray(arr, mode='RGB')
        ws, hs = im.size
        crop = im.crop((int(0.76 * ws), int(0.38 * hs), int(0.98 * ws), int(0.65 * hs))).rotate(270, expand=True)
        crop.save(f'/tmp/stage30_crops/crop_{k}.png')

    # 4. Build Wrinkle-Free Young Normal Map
    print("Building wrinkle-free young dermal normal map...")
    nrm_arr = build_wrinkle_free_young_normal_map()
    nrm_im = Image.fromarray(nrm_arr, mode='RGB')
    wn, hn = nrm_im.size
    nrm_crop = nrm_im.crop((int(0.76 * wn), int(0.38 * hn), int(0.98 * wn), int(0.65 * hn))).rotate(270, expand=True)
    nrm_crop.save('/tmp/stage30_crops/crop_normal.png')

    # 5. Enhance 8 Real MakeHuman 3D Eyebrow Assets
    print("Enhancing 8 real 3D MakeHuman eyebrow meshes & textures...")
    with open('/tmp/mpfb_check/eyebrows_meta.json', 'r') as f:
        eyebrows_meta = json.load(f)
    # Apply baked_base_delta to each eyebrow's base positions so they align with the new Asian brow ridge
    for eb_id, eb in eyebrows_meta.items():
        pos = np.array(eb['pos'], dtype=np.float32).reshape(-1, 3)
        _, idx_h = cKDTree(head_v).query(pos)
        pos = pos + baked_base_delta[idx_h]
        eb['pos'] = pos.flatten().tolist()

    enhanced_eyebrows = enhance_eyebrow_assets(eyebrows_meta, head_v_new, mh_verts, mh_idx)

    # Also update the default Eyebrows mesh in gltf['meshes'][1] with eyebrow001's enhanced 3D positions
    eb001_pos = np.array(enhanced_eyebrows['eyebrow001']['pos'], dtype=np.float32).reshape(-1, 3)
    set_acc_array(gltf, bin_buf, eb_prim['attributes']['POSITION'], eb001_pos)

    # 6. Repack all images cleanly into bin_buf
    def encode_jpg(arr, quality=92):
        buf = io.BytesIO()
        Image.fromarray(arr.astype(np.uint8), mode='RGB').save(buf, format='JPEG', quality=quality, subsampling=0)
        return buf.getvalue()

    def append_to_bin(data_bytes, name):
        pad = (4 - (len(bin_buf) % 4)) % 4
        if pad:
            bin_buf.extend(b'\x00' * pad)
        offset = len(bin_buf)
        bin_buf.extend(data_bytes)
        bv_idx = len(gltf['bufferViews'])
        gltf['bufferViews'].append({
            'buffer': 0,
            'byteOffset': offset,
            'byteLength': len(data_bytes),
            'name': name,
        })
        return bv_idx

    # Replace images[0] (default skin_albedo) with cn_porcelain_ivory JPEG
    default_skin_bytes = encode_jpg(skin_variants['cn_porcelain_ivory'], quality=93)
    bv0 = append_to_bin(default_skin_bytes, 'skin_cn_porcelain_ivory')
    gltf['images'][0]['bufferView'] = bv0
    gltf['images'][0]['mimeType'] = 'image/jpeg'

    # Replace images[1] (skin_normal) with clean young normal map JPEG
    nrm_bytes = encode_jpg(nrm_arr, quality=93)
    bv1 = append_to_bin(nrm_bytes, 'skin_young_normal')
    gltf['images'][1]['bufferView'] = bv1
    gltf['images'][1]['mimeType'] = 'image/jpeg'

    # Replace images[2] (eye.png) with clean Stage 28 neutral-sclera brown eye texture
    bv_eye28 = gltf28['bufferViews'][gltf28['images'][2]['bufferView']]
    off_eye28 = bv_eye28.get('byteOffset', 0)
    eye28_bytes = bytes(bin28[off_eye28:off_eye28 + bv_eye28['byteLength']])
    bv2 = append_to_bin(eye28_bytes, 'eye_clean_brown')
    gltf['images'][2]['bufferView'] = bv2
    gltf['images'][2]['mimeType'] = 'image/png'

    # Replace images[3] (default eyebrow.png) with enhanced eyebrow001 PNG
    bv3 = append_to_bin(enhanced_eyebrows['eyebrow001']['png_bytes'], 'eyebrow001_png')
    gltf['images'][3]['bufferView'] = bv3
    gltf['images'][3]['mimeType'] = 'image/png'

    # Pack all 8 skin variants into gltf['extras']['realWebAssets']['skins']
    skins_meta = {}
    for skin_id, arr in skin_variants.items():
        if skin_id == 'cn_porcelain_ivory':
            skins_meta[skin_id] = {'bufferView': bv0, 'mimeType': 'image/jpeg'}
        else:
            jb = encode_jpg(arr, quality=92)
            bvi = append_to_bin(jb, f'skin_{skin_id}')
            skins_meta[skin_id] = {'bufferView': bvi, 'mimeType': 'image/jpeg'}

    # Pack all 8 enhanced eyebrows into gltf['extras']['realWebAssets']['eyebrows']
    eyebrows_out = {}
    for eb_id, eb_data in enhanced_eyebrows.items():
        bvi = bv3 if eb_id == 'eyebrow001' else append_to_bin(eb_data['png_bytes'], f'{eb_id}_png')
        eyebrows_out[eb_id] = {
            'bufferView': bvi,
            'mimeType': 'image/png',
            'pos': eb_data['pos'],
            'uv': eb_data['uv'],
        }

    gltf['extras'] = gltf.get('extras', {})
    gltf['extras']['realWebAssets'] = {
        'skins': skins_meta,
        'eyebrows': eyebrows_out,
        'morphChannels': [
            'mh_head_asian_youth',
            'mh_head_round',
            'mh_head_heart',
            'mh_head_oval',
            'mh_head_melon',
            'mh_head_diamond',
            'mh_head_eurasian',
            'mh_brow_down',
            'mh_brow_up',
        ],
    }

    gltf['buffers'][0]['byteLength'] = len(bin_buf)
    save_glb(GLB_OUT_PATH, gltf, bin_buf)
    size_mb = os.path.getsize(GLB_OUT_PATH) / (1024 * 1024)
    print(f"Saved {GLB_OUT_PATH} ({size_mb:.2f} MB) successfully!")


if __name__ == '__main__':
    main()
