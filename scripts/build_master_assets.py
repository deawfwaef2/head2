import json, struct, io, os, glob, gc
import numpy as np
from scipy.spatial import cKDTree
from scipy.ndimage import gaussian_filter, gaussian_filter1d, maximum_filter1d
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

print("=== Step 1: Loading MakeHuman Head Base Mesh ===")
head_out_path = '/home/user/public/models/daz_asian_head_base.glb'
raw_head = open(head_out_path, 'rb').read()
jlen = struct.unpack_from('<I', raw_head, 12)[0]
gh = json.loads(raw_head[20:20+jlen])
bh = raw_head[28+jlen:]

def acc(i):
    a = gh['accessors'][i]
    bv = gh['bufferViews'][a['bufferView']]
    dt = {5126:'<f4', 5123:'<u2', 5125:'<u4', 5122:'<i2'}[a['componentType']]
    ch = {'VEC3':3, 'VEC2':2, 'SCALAR':1}[a['type']]
    return np.frombuffer(bh, dtype=dt, count=a['count']*ch, offset=bv.get('byteOffset',0)+a.get('byteOffset',0)).reshape(a['count'], ch)

pos_h = acc(gh['meshes'][0]['primitives'][0]['attributes']['POSITION']).astype(np.float64)
uv_h = acc(gh['meshes'][0]['primitives'][0]['attributes']['TEXCOORD_0']).astype(np.float64)
tris_h = acc(gh['meshes'][0]['primitives'][0]['indices']).reshape(-1, 3)
print(f"Loaded {head_out_path}: {len(pos_h)} head vertices")

print("=== Step 2: Building 19,158-vertex MakeHuman .mhclo Alignment Field ===")
base_v, base_vt, base_pairs = [], [], {}
for line in open('/tmp/mh_base.obj'):
    if line.startswith('v '):
        p = line.split(); base_v.append([float(p[1])*0.1, float(p[2])*0.1, float(p[3])*0.1])
    elif line.startswith('vt '):
        p = line.split(); base_vt.append([float(p[1]), 1.0 - float(p[2])])
    elif line.startswith('f '):
        for tok in line.split()[1:]:
            sp = tok.split('/'); base_pairs[int(sp[1])-1] = int(sp[0])-1
base_v = np.array(base_v); base_vt = np.array(base_vt)
_, ti_idx = cKDTree(base_vt).query(uv_h)
matched_vi = np.array([base_pairs[t] for t in ti_idx])

diffs = pos_h - base_v[matched_vi]
d_tree = cKDTree(base_v[matched_vi])
dists, idx_k = d_tree.query(base_v, k=8)
weights = 1.0 / np.maximum(dists, 1e-6)**2
weights /= np.sum(weights, axis=1, keepdims=True)
hv_aligned = base_v + (weights[:, :, None] * diffs[idx_k]).sum(axis=1)

v0_h, v1_h, v2_h = pos_h[tris_h[:, 0]], pos_h[tris_h[:, 1]], pos_h[tris_h[:, 2]]
fc_h = (v0_h + v1_h + v2_h) / 3.0
m01_h = (v0_h + v1_h) * 0.5; m12_h = (v1_h + v2_h) * 0.5; m20_h = (v2_h + v0_h) * 0.5
all_surf_pts = np.vstack([pos_h, fc_h, m01_h, m12_h, m20_h])
scalp_pts = all_surf_pts[(all_surf_pts[:, 1] > -0.065) & (all_surf_pts[:, 2] > -0.095)]
hc_global = np.array([0.0, 0.022, -0.005], dtype=np.float64)
scalp_norms = scalp_pts - hc_global
scalp_norms /= np.maximum(np.linalg.norm(scalp_norms, axis=1, keepdims=True), 1e-6)
scalp_tree = cKDTree(scalp_pts)

def build_stochastic_hair_field(res=512, seed=2026):
    """
    100% NON-PERIODIC Stochastic Multi-Scale Hair Strand Field.
    Zero periodic sine waves! Uses flow-warped anisotropic longitudinal Gaussian
    filtering of random noise so every strand has finite length, organic tapering,
    and natural micro-clumping without any repeating barcode lines.
    """
    rng = np.random.RandomState(seed)
    warp_u = gaussian_filter(rng.randn(res, res).astype(np.float32), sigma=(44.0, 14.0), mode='wrap')
    warp_u = warp_u / (np.std(warp_u) + 1e-6) * 0.0065

    n_fine = rng.randn(res, res).astype(np.float32)
    s_fine = gaussian_filter(n_fine, sigma=(28.0, 0.65), mode='wrap')
    s_fine /= (np.std(s_fine) + 1e-6)

    n_med = rng.randn(res, res).astype(np.float32)
    s_med = gaussian_filter(n_med, sigma=(54.0, 1.35), mode='wrap')
    s_med /= (np.std(s_med) + 1e-6)

    n_clump = rng.randn(res, res).astype(np.float32)
    s_clump = gaussian_filter(n_clump, sigma=(78.0, 3.0), mode='wrap')
    s_clump /= (np.std(s_clump) + 1e-6)

    grid_v, grid_u = np.meshgrid(np.arange(res, dtype=np.float32), np.arange(res, dtype=np.float32), indexing='ij')
    warped_u_idx = np.mod((grid_u + warp_u * res).astype(np.int32), res)

    fiber_mix = (
        0.50 * s_fine[grid_v.astype(np.int32), warped_u_idx] +
        0.34 * s_med[grid_v.astype(np.int32), warped_u_idx] +
        0.16 * s_clump
    )
    v_norm = np.linspace(0.0, 1.0, res, dtype=np.float32)[:, None]
    u_norm = np.linspace(0.0, 1.0, res, dtype=np.float32)[None, :]
    root_tip_shade = 0.82 + 0.18 * np.sin(v_norm * np.pi)
    # Rich, high-dynamic non-periodic strand relief (range 42..242, std ~38 -> crisp 3D hair locks, zero flat blob!)
    albedo_v = np.clip((146.0 + fiber_mix * 36.0) * root_tip_shade, 42.0, 242.0)

    # Non-periodic stochastic strand-tip comb
    n_tip1 = gaussian_filter1d(rng.randn(res).astype(np.float32), sigma=0.75, mode='wrap')
    n_tip2 = gaussian_filter1d(rng.randn(res).astype(np.float32), sigma=2.10, mode='wrap')
    comb_1d = 0.52 + 0.28 * (n_tip1 / (np.std(n_tip1) + 1e-6)) + 0.20 * (n_tip2 / (np.std(n_tip2) + 1e-6))
    comb_v = np.clip(comb_1d, 0.08, 0.99)[None, :] + 0.0 * v_norm
    return albedo_v.astype(np.float32), comb_v.astype(np.float32), u_norm, v_norm

ALBEDO_V, COMB_V, U_GRID, V_GRID = build_stochastic_hair_field(512)

def synthesize_photoreal_hair_png(valid_tex_path, folder_name):
    res = 512
    im_orig = Image.open(valid_tex_path).convert('RGBA').resize((res, res), Image.LANCZOS)
    arr = np.asarray(im_orig, dtype=np.float32)
    lum = 0.299 * arr[:, :, 0] + 0.587 * arr[:, :, 1] + 0.114 * arr[:, :, 2]
    a_orig = arr[:, :, 3] / 255.0

    gx = np.abs(np.diff(lum, axis=1)).mean()
    gy = np.abs(np.diff(lum, axis=0)).mean()
    is_horiz = (gy > gx * 1.15) or ('witchy' in folder_name)

    albedo_base = ALBEDO_V.T if is_horiz else ALBEDO_V
    comb = COMB_V.T if is_horiz else COMB_V
    u_coord = V_GRID.T if is_horiz else U_GRID
    v_coord = U_GRID.T if is_horiz else V_GRID

    # Preserve 100% of the artist's real painted 3D lock & strand shading normalized to [44, 236]!
    valid_mask = a_orig > 0.12
    if valid_mask.sum() > 200:
        p08 = float(np.percentile(lum[valid_mask], 8))
        p92 = float(np.percentile(lum[valid_mask], 92))
    else:
        p08, p92 = float(lum.min()), float(lum.max())
    span = max(p92 - p08, 18.0)
    artist_norm = np.clip(46.0 + (lum - p08) / span * 188.0, 34.0, 244.0)
    lum_smooth = gaussian_filter(artist_norm, sigma=(5.0, 5.0))
    artist_hi = np.clip(artist_norm - lum_smooth, -42.0, 42.0)

    if 'o4saken_' in folder_name:
        a_wide = maximum_filter1d(a_orig, size=6, axis=1)
        a_soft = gaussian_filter1d(a_wide, sigma=1.4, axis=1)
        tip_zone = np.clip((v_coord - 0.65) / 0.30, 0.0, 1.0)
        a_ribbons = a_soft * (0.76 + 0.24 * comb) * (1.0 - 0.48 * tip_zone * (1.0 - comb))
        a_final = np.where(u_coord > 0.55, np.maximum(a_orig * 0.94, a_ribbons), a_orig)
    else:
        zero_frac = (a_orig < 0.05).sum() / float(res * res)
        semi_frac = ((a_orig >= 0.05) & (a_orig <= 0.92)).sum() / float(res * res)
        if zero_frac < 0.015 and semi_frac < 0.02:
            tip_dist = np.minimum(v_coord, 1.0 - v_coord)
            side_dist = np.minimum(u_coord, 1.0 - u_coord)
            tip_feather = np.clip(tip_dist / 0.085, 0.0, 1.0)
            side_feather = np.clip(side_dist / 0.035, 0.25, 1.0)
            base_f = tip_feather * side_feather
            a_final = np.where(base_f > 0.88, 1.0, base_f * (0.52 + 0.48 * comb))
        else:
            edge_zone = np.clip(4.0 * a_orig * (1.0 - a_orig), 0.0, 1.0)
            a_final = np.clip(a_orig * (1.0 - 0.16 * edge_zone * (1.0 - comb)), 0.0, 1.0)

    edge_darken = 0.58 + 0.42 * np.clip(a_final / 0.45, 0.0, 1.0)
    combined_luma = 0.60 * artist_norm + 0.40 * albedo_base + 0.45 * artist_hi
    rgb_val = np.clip(combined_luma * edge_darken, 28.0, 246.0)

    g_u8 = rgb_val.astype(np.uint8)
    a_u8 = np.clip(a_final * 255.0, 0.0, 255.0).astype(np.uint8)
    out_rgba = np.stack([g_u8, g_u8, g_u8, a_u8], axis=-1)

    bio = io.BytesIO()
    Image.fromarray(out_rgba, mode='RGBA').quantize(colors=256, method=Image.FASTOCTREE).save(bio, format='PNG', optimize=True)
    return bio.getvalue()

def subdivide_conforming_watertight(pos, norm, uv, tris, max_edge=0.018):
    p0 = pos[tris[:, 0]]
    p1 = pos[tris[:, 1]]
    p2 = pos[tris[:, 2]]
    s01 = np.linalg.norm(p1 - p0, axis=1) > max_edge
    s12 = np.linalg.norm(p2 - p1, axis=1) > max_edge
    s20 = np.linalg.norm(p0 - p2, axis=1) > max_edge
    if not (s01.any() or s12.any() or s20.any()):
        return pos, norm, uv, tris

    pos_list = list(pos)
    norm_list = list(norm)
    uv_list = list(uv)
    new_tris = []
    edge_cache = {}

    def get_mid(i0, i1):
        key = (min(i0, i1), max(i0, i1))
        if key in edge_cache:
            return edge_cache[key]
        v0, v1 = pos_list[i0], pos_list[i1]
        n0, n1 = norm_list[i0], norm_list[i1]
        u0, u1 = uv_list[i0], uv_list[i1]
        mid_v = 0.5 * (v0 + v1)
        mid_n = n0 + n1
        nl = np.linalg.norm(mid_n)
        mid_n = mid_n / nl if nl > 1e-8 else np.array([0.0, 1.0, 0.0], dtype=np.float32)
        arch = max(-0.0016, min(0.0016, -0.09 * float(np.dot(v1 - v0, n1 - n0))))
        mid_v = mid_v + mid_n * arch
        mid_u = 0.5 * (u0 + u1)
        idx = len(pos_list)
        pos_list.append(mid_v)
        norm_list.append(mid_n)
        uv_list.append(mid_u)
        edge_cache[key] = idx
        return idx

    for idx_t, (i0, i1, i2) in enumerate(tris):
        i0, i1, i2 = int(i0), int(i1), int(i2)
        b0, b1, b2 = bool(s01[idx_t]), bool(s12[idx_t]), bool(s20[idx_t])
        cnt = b0 + b1 + b2
        if cnt == 0:
            new_tris.append([i0, i1, i2])
        elif cnt == 3:
            m01, m12, m20 = get_mid(i0, i1), get_mid(i1, i2), get_mid(i2, i0)
            new_tris.append([i0, m01, m20])
            new_tris.append([m01, i1, m12])
            new_tris.append([m20, m12, i2])
            new_tris.append([m01, m12, m20])
        elif cnt == 1:
            if b0:
                m = get_mid(i0, i1)
                new_tris.append([i0, m, i2]); new_tris.append([m, i1, i2])
            elif b1:
                m = get_mid(i1, i2)
                new_tris.append([i1, m, i0]); new_tris.append([m, i2, i0])
            else:
                m = get_mid(i2, i0)
                new_tris.append([i2, m, i1]); new_tris.append([m, i0, i1])
        else:
            if not b2:
                m01, m12 = get_mid(i0, i1), get_mid(i1, i2)
                new_tris.append([m01, i1, m12]); new_tris.append([i0, m01, m12]); new_tris.append([i0, m12, i2])
            elif not b0:
                m12, m20 = get_mid(i1, i2), get_mid(i2, i0)
                new_tris.append([m12, i2, m20]); new_tris.append([i1, m12, m20]); new_tris.append([i1, m20, i0])
            else:
                m20, m01 = get_mid(i2, i0), get_mid(i0, i1)
                new_tris.append([m20, i0, m01]); new_tris.append([i2, m20, m01]); new_tris.append([i2, m01, i1])

    return (
        np.array(pos_list, dtype=np.float32),
        np.array(norm_list, dtype=np.float32),
        np.array(uv_list, dtype=np.float32),
        np.array(new_tris, dtype=np.uint32),
    )

# 28 Curated Multi-Layer Hair-Card Master Hairstyles (ZERO toigo_* 1-layer helmets!)
selected_28 = [
    # 1-6: Short Bobs, Student Bobs & Pixie Cuts
    ('hair_bob01',             'littleright_bobcut_hair',       (0.000, 0.001, 0.95, 0.99, 0.98, 'bob_drape')),
    ('hair_user_photo',        'o4saken_chinesebob01',          (-0.004, 0.001, 0.92, 0.93, 0.94, 'bob_clean_bangs')),
    ('hair_bob02',             'culturalibre_hair_18',          (0.000, 0.002, 0.96, 0.99, 0.98, 'bob_clean_bangs')),
    ('hair_short02',           'elvs_ashley_may_hair',          (0.000, 0.001, 0.93, 0.98, 0.97, 'clavicle_drape')),
    ('daz_hair_asym_short',    'elvs_witchy_lil_bob',           (-0.001, 0.002, 0.96, 1.00, 0.98, 'bob_drape')),
    ('daz_hair_pixie_chic',    'elvs_grump_hair',               (0.000, 0.001, 0.98, 0.98, 0.99, 'bob_drape')),
    # 7-12: Straight Long, Hime Cut & Clavicle Lobs
    ('hair_long01',            'o4saken_long01',                (-0.004, 0.001, 0.91, 0.94, 0.93, 'long_part_front')),
    ('daz_hair_hime',          'cortu_straight_bangs',          (0.002, 0.001, 0.98, 1.00, 0.99, 'long_drape')),
    ('hair_short04',           'elvs_katherine_hair',           (0.006, 0.002, 0.97, 0.99, 0.99, 'lift_bangs')),
    ('daz_hair_side_long',     'punkduck_alpha7_long2',         (0.000, 0.001, 0.92, 0.97, 0.96, 'long_drape')),
    ('daz_hair_air_bangs_long','elvs_daisy_hair',               (0.000, 0.001, 0.92, 0.99, 0.97, 'sleek_daisy_long')),
    ('daz_hair_wolf_clavicle', 'punkduck_alpha7_long',          (0.000, 0.001, 0.95, 0.99, 0.98, 'clavicle_drape')),
    # 13-18: Glamorous Waves & Curls
    ('daz_hair_curtain_wave',  'elvs_that_80s_babe_hair',       (0.000, 0.001, 0.95, 0.99, 0.98, 'long_drape')),
    ('daz_hair_hazel_wave',    'elvs_hazel_hair',               (0.000, 0.002, 0.92, 0.99, 0.97, 'long_drape')),
    ('daz_hair_wavy_bob',      'elvs_wavy_bob',                 (0.000, 0.001, 0.89, 0.98, 0.96, 'bob_drape')),
    ('daz_hair_glam_wave',     'culturalibre_hair_17',          (0.000, 0.001, 0.92, 0.98, 0.96, 'long_drape')),
    ('daz_hair_mermaid_curl',  'punkduck_alpha7_curly',         (0.000, 0.002, 0.93, 0.98, 0.96, 'long_drape')),
    ('daz_hair_french_lazy_roll','punkduck_alpha7_curly2',      (0.000, 0.002, 0.90, 0.96, 0.95, 'clavicle_drape')),
    # 19-23: Oriental Updos, Chignons & Braided Buns
    ('hair_braid01',           'elvs_50s_updo',                 (0.000, 0.002, 0.99, 0.99, 1.00, 'bob_drape')),
    ('daz_hair_adrienne_updo', 'elvs_adrienne_hair',            (0.001, 0.002, 0.92, 0.97, 0.96, 'clavicle_drape')),
    ('daz_hair_low_chignon',   'elvs_keylth_hair',              (0.001, 0.002, 0.97, 0.98, 0.99, 'clavicle_drape')),
    ('daz_hair_crown_braid',   'elvs_braid_bun',                (0.000, 0.001, 0.98, 0.98, 0.99, 'bob_drape')),
    ('daz_hair_ballerina_bun', 'grinsegold_wig_bow_tie',        (0.000, 0.002, 0.98, 0.99, 0.99, 'clavicle_drape')),
    # 24-28: Ponytails, Twin Buns, Half-Up & Twin Braids
    ('hair_ponytail01',        'elvs_lara_hair',                (0.000, 0.001, 0.98, 0.99, 0.99, 'long_drape')),
    ('daz_hair_twin_buns',     'elvs_micky_afro',               (0.000, 0.001, 0.92, 0.95, 0.95, 'bob_drape')),
    ('daz_hair_halfup_princess','elvs_lady_hippy_hair',         (0.000, 0.001, 0.94, 0.99, 0.97, 'long_drape')),
    ('daz_hair_twin_braids',   'elvs_island_princess_hair',     (0.000, 0.001, 0.95, 0.98, 0.97, 'long_drape')),
    ('daz_hair_sport_ponytail','elvs_short_daisy_hair',         (0.000, 0.001, 0.94, 0.99, 0.97, 'clavicle_drape')),
]

def write_hair_glb(out_path, name, pos, norm, uv, tris, png_bytes):
    fc = (pos[tris[:,0]] + pos[tris[:,1]] + pos[tris[:,2]]) / 3.0
    hc = np.array([0.0, 0.02, -0.01], dtype=np.float32)
    r_dist = np.linalg.norm(fc - hc, axis=1)
    sort_order = np.argsort(fc[:, 2] + 0.45 * r_dist)
    tris = tris[sort_order]

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

    v_cnt = len(pos)
    i_cnt = tris.size
    gltf = {
        "asset": {"version": "2.0", "generator": "MakeHuman-Master-Hair-Pipeline-v4-Stochastic"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"name": name, "mesh": 0}],
        "meshes": [{
            "name": name,
            "primitives": [{
                "attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2},
                "indices": 3,
                "material": 0,
                "mode": 4
            }]
        }],
        "materials": [{
            "name": f"{name}_Mat",
            "pbrMetallicRoughness": {
                "baseColorTexture": {"index": 0},
                "baseColorFactor": [1.0, 1.0, 1.0, 1.0],
                "metallicFactor": 0.0,
                "roughnessFactor": 0.46
            },
            "alphaMode": "BLEND",
            "doubleSided": True
        }],
        "textures": [{"source": 0, "sampler": 0}],
        "samplers": [{"magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 10497}],
        "images": [{"bufferView": 4, "mimeType": "image/png", "name": f"{name}_tex"}],
        "bufferViews": [
            {"buffer": 0, "byteOffset": off_p, "byteLength": len_p, "target": 34962},
            {"buffer": 0, "byteOffset": off_n, "byteLength": len_n, "target": 34962},
            {"buffer": 0, "byteOffset": off_u, "byteLength": len_u, "target": 34962},
            {"buffer": 0, "byteOffset": off_i, "byteLength": len_i, "target": 34963},
            {"buffer": 0, "byteOffset": off_t, "byteLength": len_t}
        ],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": v_cnt, "type": "VEC3",
             "min": pos.min(axis=0).tolist(), "max": pos.max(axis=0).tolist()},
            {"bufferView": 1, "componentType": 5126, "count": v_cnt, "type": "VEC3"},
            {"bufferView": 2, "componentType": 5126, "count": v_cnt, "type": "VEC2"},
            {"bufferView": 3, "componentType": 5125, "count": i_cnt, "type": "SCALAR"}
        ],
        "buffers": [{"byteLength": len(bin_buf)}]
    }
    jb = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    while len(jb) % 4 != 0:
        jb += b' '
    with open(out_path, 'wb') as f:
        f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(bin_buf)))
        f.write(struct.pack('<II', len(jb), 0x4E4F534A))
        f.write(jb)
        f.write(struct.pack('<II', len(bin_buf), 0x004E4942))
        f.write(bin_buf)

print("=== Step 3: Exporting 28 Stochastic Multi-Layer Volumetric 3D Hairstyles ===")
keep_glbs = {'daz_asian_head_base.glb'}
tex_cache = {}

for gid, folder_name, tune in selected_28:
    keep_glbs.add(f'{gid}.glb')
    folder = f'/tmp/mh_packs/extracted/hair/{folder_name}'
    dy, dz, sx_t, sy_t, sz_t, variant = tune
    mhclo_p = glob.glob(os.path.join(folder, '*.mhclo'))[0]
    obj_p = tex_p = mhmat_p = None
    lines_h = [l.strip() for l in open(mhclo_p, errors='ignore')]
    xscale = yscale = zscale = 0.1
    for l in lines_h:
        if l.startswith('obj_file '): obj_p = os.path.join(folder, l.split(None, 1)[1])
        elif l.startswith('material '): mhmat_p = os.path.join(folder, l.split(None, 1)[1])
        elif l.startswith('x_scale '):
            p = l.split(); xscale = abs(hv_aligned[int(p[1]), 0] - hv_aligned[int(p[2]), 0]) / float(p[3])
        elif l.startswith('y_scale '):
            p = l.split(); yscale = abs(hv_aligned[int(p[1]), 1] - hv_aligned[int(p[2]), 1]) / float(p[3])
        elif l.startswith('z_scale '):
            p = l.split(); zscale = abs(hv_aligned[int(p[1]), 2] - hv_aligned[int(p[2]), 2]) / float(p[3])
    if not obj_p or not os.path.exists(obj_p):
        obj_p = glob.glob(os.path.join(folder, '*.obj'))[0]

    # Case-insensitive diffuse texture lookup from .mhmat so we NEVER pick a normal map!
    folder_files_map = {fn.lower(): os.path.join(folder, fn) for fn in os.listdir(folder)}
    if mhmat_p and not os.path.exists(mhmat_p):
        mhmat_p = folder_files_map.get(os.path.basename(mhmat_p).lower())
    if not mhmat_p:
        mhmats = glob.glob(os.path.join(folder, '*.mhmat'))
        if mhmats: mhmat_p = mhmats[0]
    if mhmat_p and os.path.exists(mhmat_p):
        for line in open(mhmat_p, errors='ignore'):
            l = line.strip()
            if l.startswith('diffuseTexture '):
                want_fn = l.split(None, 1)[1].strip()
                tex_p = folder_files_map.get(want_fn.lower(), os.path.join(folder, want_fn))

    pngs = [
        p for p in glob.glob(os.path.join(folder, '*.png')) + glob.glob(os.path.join(folder, '*.jpg'))
        if not p.endswith('.thumb') and 'norm' not in os.path.basename(p).lower() and 'nrm' not in os.path.basename(p).lower() and 'spec' not in os.path.basename(p).lower() and 'bump' not in os.path.basename(p).lower()
    ]
    valid_tex = '/tmp/mh_packs/extracted/hair/elvs_daisy_hair/daisyhair1.png'
    for p in ([tex_p] if tex_p else []) + pngs:
        if p and os.path.exists(p):
            try:
                im = Image.open(p); im.load(); valid_tex = p; break
            except Exception:
                pass

    vs_h = []
    idx_l = lines_h.index('verts 0') + 1
    while idx_l < len(lines_h):
        l2 = lines_h[idx_l]
        if not l2 or l2.startswith('#') or l2.startswith('material') or l2.startswith('delete'): break
        vs_h.append(l2); idx_l += 1
    v_idx_h, w_h, off_h = [], [], []
    for l2 in vs_h:
        p = l2.split()
        if len(p) == 9:
            v_idx_h.append([int(p[0]), int(p[1]), int(p[2])])
            w_h.append([float(p[3]), float(p[4]), float(p[5])])
            off_h.append([float(p[6]), float(p[7]), float(p[8])])
        elif len(p) == 1:
            v_idx_h.append([int(p[0]), 0, 0]); w_h.append([1.0, 0.0, 0.0]); off_h.append([0.0, 0.0, 0.0])
    v_idx_h = np.array(v_idx_h, dtype=np.int32)
    w_h = np.array(w_h, dtype=np.float64)
    off_h = np.array(off_h, dtype=np.float64)
    scale_vec = np.array([xscale, yscale, zscale], dtype=np.float64)
    fitted_v = (w_h[:, :, None] * hv_aligned[v_idx_h]).sum(axis=1) + off_h * scale_vec
    hc = np.array([0.0, 0.025, 0.0])
    rel = fitted_v - hc
    r = np.maximum(np.linalg.norm(rel, axis=1, keepdims=True), 1e-6)
    rdir = rel / r
    mask_up = np.clip((fitted_v[:, 1:2] + 0.03) / 0.05, 0.0, 1.0)
    fitted_v = fitted_v + rdir * (0.0042 * mask_up)
    fitted_v = (fitted_v - hc) * np.array([sx_t, sy_t, sz_t]) + hc + np.array([0.0, dy, dz])

    # Specific gentle face-framing adjustments so bangs/side-locks never cover the eyes/nose
    if variant == 'bob_clean_bangs':
        # Lift low eye-covering bangs on o4saken_chinesebob01 slightly above the eyelashes
        eye_zone = (fitted_v[:, 2] > 0.045) & (fitted_v[:, 1] > -0.015) & (fitted_v[:, 1] < 0.055) & (np.abs(fitted_v[:, 0]) < 0.052)
        if eye_zone.any():
            w_ez = np.clip((fitted_v[eye_zone, 2] - 0.045) / 0.035, 0.0, 1.0) * np.clip(1.0 - np.abs(fitted_v[eye_zone, 0]) / 0.052, 0.0, 1.0)
            fitted_v[eye_zone, 1] += 0.012 * w_ez
    elif variant == 'long_part_front':
        # Gently part the cheek-crossing lock on o4saken_long01 outward so the face is 100% open and framed
        face_front = (fitted_v[:, 2] > 0.038) & (fitted_v[:, 1] < 0.045) & (np.abs(fitted_v[:, 0]) < 0.054)
        if face_front.any():
            vx = fitted_v[face_front, 0]
            sign_x = np.where(vx >= -0.005, 1.0, -1.0)
            push_x = np.clip(0.054 - np.abs(vx), 0.0, 0.054) * np.clip((fitted_v[face_front, 2] - 0.038) / 0.035, 0.0, 1.0)
            fitted_v[face_front, 0] += sign_x * push_x * 0.68
    elif variant == 'lift_bangs':
        front_b = (fitted_v[:, 2] > 0.04) & (fitted_v[:, 1] > -0.01) & (fitted_v[:, 1] < 0.075)
        w_fb = np.clip((fitted_v[front_b, 2] - 0.04) / 0.035, 0.0, 1.0)
        fitted_v[front_b, 1] += 0.009 * w_fb
    elif variant == 'sleek_daisy_long':
        # Tuck lateral ear-level flare on elvs_daisy_hair so it drapes sleekly like Fang Yaoping's straight shoulder hair
        mid_ear = (fitted_v[:, 1] < 0.035) & (np.abs(fitted_v[:, 0]) > 0.056)
        if mid_ear.any():
            vx = fitted_v[mid_ear, 0]
            sign_x = np.where(vx >= 0, 1.0, -1.0)
            w_ear = np.clip((0.035 - fitted_v[mid_ear, 1]) / 0.055, 0.0, 1.0)
            excess_x = np.maximum(0.0, np.abs(vx) - 0.056)
            fitted_v[mid_ear, 0] -= sign_x * excess_x * 0.36 * w_ear

    # Clean, linear vertical proportioning & shoulder-splay tuck (ZERO tanh crushing, ZERO sine folding!)
    y_min_cur = float(fitted_v[:, 1].min())
    y_target_min = -0.126 if variant == 'bob_drape' or variant == 'bob_clean_bangs' else (-0.136 if variant == 'clavicle_drape' else -0.146)
    y_hinge = -0.012
    low_mask = fitted_v[:, 1] < y_hinge
    if low_mask.any() and y_min_cur < y_target_min:
        t_lin = (y_hinge - fitted_v[low_mask, 1]) / max(y_hinge - y_min_cur, 1e-5)
        # Smooth power-linear mapping (p=0.88) keeps tips separated and natural without pancake saturation
        t_mapped = np.power(np.clip(t_lin, 0.0, 1.0), 0.88)
        fitted_v[low_mask, 1] = y_hinge - t_mapped * (y_hinge - y_target_min)
        # Gently tuck wide shoulder-splayed ribbons inward around the bust neck so ribbons overlap without gaps
        r_xz = np.hypot(fitted_v[low_mask, 0], fitted_v[low_mask, 2])
        splay_excess = np.maximum(0.0, r_xz - 0.070)
        tuck_factor = np.where(r_xz > 1e-5, (r_xz - splay_excess * 0.46 * t_lin) / r_xz, 1.0)
        fitted_v[low_mask, 0] *= tuck_factor
        fitted_v[low_mask, 2] *= tuck_factor

    crown_check = (fitted_v[:, 1] > -0.01) & (fitted_v[:, 2] < 0.075)
    if crown_check.any():
        d_s, idx_s = scalp_tree.query(fitted_v[crown_check], k=1)
        near_pt = scalp_pts[idx_s]
        near_n = scalp_norms[idx_s]
        signed_d = np.sum((fitted_v[crown_check] - near_pt) * near_n, axis=1)
        push = np.clip(0.0024 - signed_d, 0.0, 0.012)
        fitted_v[crown_check] += near_n * push[:, None]

    uvs, faces = [], []
    for line in open(obj_p, errors='ignore'):
        l = line.strip()
        if l.startswith('vt '):
            p = l.split(); uvs.append([float(p[1]), 1.0 - float(p[2])])
        elif l.startswith('f '):
            pts = l.split()[1:]
            poly = [(int(t.split('/')[0])-1, int(t.split('/')[1])-1 if len(t.split('/'))>1 and t.split('/')[1] else 0) for t in pts]
            for k in range(1, len(poly)-1):
                faces.append([poly[0], poly[k], poly[k+1]])
    uvs = np.array(uvs, dtype=np.float32) if uvs else np.zeros((1,2), dtype=np.float32)

    f_v = np.array([[f[0][0], f[1][0], f[2][0]] for f in faces], dtype=np.int32)
    v0, v1, v2 = fitted_v[f_v[:, 0]], fitted_v[f_v[:, 1]], fitted_v[f_v[:, 2]]
    fn = np.cross(v1 - v0, v2 - v0)
    fc = (v0 + v1 + v2) / 3.0
    inward = np.sum(fn * (fc - hc), axis=1) < 0
    for idx_f in np.where(inward)[0]:
        faces[idx_f][1], faces[idx_f][2] = faces[idx_f][2], faces[idx_f][1]
        fn[idx_f] = -fn[idx_f]
    f_v = np.array([[f[0][0], f[1][0], f[2][0]] for f in faces], dtype=np.int32)

    v_norm_obj = np.zeros_like(fitted_v, dtype=np.float64)
    for k in range(3):
        np.add.at(v_norm_obj, f_v[:, k], fn)
    for _ in range(3):
        f_mean_n = (v_norm_obj[f_v[:, 0]] + v_norm_obj[f_v[:, 1]] + v_norm_obj[f_v[:, 2]]) / 3.0
        v_smooth = np.zeros_like(v_norm_obj)
        for k in range(3):
            np.add.at(v_smooth, f_v[:, k], f_mean_n)
        v_norm_obj = 0.5 * v_norm_obj + 0.5 * v_smooth

    n_len = np.linalg.norm(v_norm_obj, axis=1, keepdims=True)
    rad_n = (fitted_v - hc) / np.maximum(np.linalg.norm(fitted_v - hc, axis=1, keepdims=True), 1e-6)
    v_norm_obj = np.where(n_len > 1e-8, v_norm_obj / np.maximum(n_len, 1e-8), rad_n)
    v_norm_obj = 0.76 * v_norm_obj + 0.24 * rad_n
    v_norm_obj /= np.maximum(np.linalg.norm(v_norm_obj, axis=1, keepdims=True), 1e-8)

    pair_map, out_pos, out_norm, out_uv, out_tris = {}, [], [], [], []
    for p0_f, p1_f, p2_f in faces:
        tri = []
        for vi, ti in (p0_f, p1_f, p2_f):
            key = (vi, ti)
            if key not in pair_map:
                pair_map[key] = len(out_pos)
                out_pos.append(fitted_v[vi])
                out_norm.append(v_norm_obj[vi])
                out_uv.append(uvs[ti] if ti < len(uvs) else [0.0, 0.0])
            tri.append(pair_map[key])
        out_tris.append(tri)
    pos_hr = np.array(out_pos, dtype=np.float32)
    norm_hr = np.array(out_norm, dtype=np.float32)
    uv_hr = np.array(out_uv, dtype=np.float32)
    tris_hr = np.array(out_tris, dtype=np.uint32)

    for sub_thresh, max_t in ((0.022, 11000), (0.016, 5500)):
        if len(tris_hr) < max_t:
            pos_hr, norm_hr, uv_hr, tris_hr = subdivide_conforming_watertight(pos_hr, norm_hr, uv_hr, tris_hr, max_edge=sub_thresh)

    sub_check = (pos_hr[:, 1] > -0.025) & (pos_hr[:, 2] < 0.082)
    if sub_check.any():
        d_s2, idx_s2 = scalp_tree.query(pos_hr[sub_check], k=1)
        near_pt2 = scalp_pts[idx_s2].astype(np.float32)
        near_n2 = scalp_norms[idx_s2].astype(np.float32)
        signed_d2 = np.sum((pos_hr[sub_check] - near_pt2) * near_n2, axis=1)
        push2 = np.clip(0.0022 - signed_d2, 0.0, 0.012)
        pos_hr[sub_check] += near_n2 * push2[:, None]

    cache_key = (valid_tex, 'o4saken_' in folder_name)
    if cache_key not in tex_cache:
        tex_cache[cache_key] = synthesize_photoreal_hair_png(valid_tex, folder_name)
    png_bytes = tex_cache[cache_key]

    out_glb = f'/home/user/public/models/{gid}.glb'
    write_hair_glb(out_glb, gid, pos_hr, norm_hr, uv_hr, tris_hr, png_bytes)
    print(f"Exported {gid:24s} ({folder_name:26s}): verts={len(pos_hr):5d}, tris={len(tris_hr):5d}, size={os.path.getsize(out_glb)/1024:5.1f} KB")
    gc.collect()

for p in glob.glob('/home/user/public/models/*.glb'):
    if os.path.basename(p) not in keep_glbs:
        os.remove(p)
        print("Cleaned old duplicate GLB:", p)
