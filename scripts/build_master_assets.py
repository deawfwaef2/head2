import subprocess, json, struct, io, os, glob, math
import numpy as np
from scipy.spatial import cKDTree
from scipy.ndimage import gaussian_filter
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

print("=== Step 1: Verifying restored 37f0260 MakeHuman head ===")
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
print(f"Loaded {head_out_path}: {len(pos_h)} head vertices, {len(gh['bufferViews'])} bufferViews")

print("=== Step 2: Building 19,158-vertex MakeHuman .mhclo alignment field ===")
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

scalp_mask = (pos_h[:, 1] > -0.065) & (pos_h[:, 2] > -0.095)
v0_h, v1_h, v2_h = pos_h[tris_h[:, 0]], pos_h[tris_h[:, 1]], pos_h[tris_h[:, 2]]
fc_h = (v0_h + v1_h + v2_h) / 3.0
m01_h = (v0_h + v1_h) * 0.5; m12_h = (v1_h + v2_h) * 0.5; m20_h = (v2_h + v0_h) * 0.5
all_surf_pts = np.vstack([pos_h, fc_h, m01_h, m12_h, m20_h])
scalp_pts = all_surf_pts[(all_surf_pts[:, 1] > -0.065) & (all_surf_pts[:, 2] > -0.095)]
hc_global = np.array([0.0, 0.022, -0.005], dtype=np.float64)
scalp_norms = scalp_pts - hc_global
scalp_norms /= np.maximum(np.linalg.norm(scalp_norms, axis=1, keepdims=True), 1e-6)
scalp_tree = cKDTree(scalp_pts)

def build_base_fiber_grid(res=512):
    u = np.linspace(0.0, 1.0, res, endpoint=False, dtype=np.float32)[None, :]
    v = np.linspace(0.0, 1.0, res, endpoint=False, dtype=np.float32)[:, None]
    f1 = np.sin(u * 2.0 * np.pi * 118.0 + np.sin(v * 2.0 * np.pi * 3.0) * 0.30)
    f2 = np.sin(u * 2.0 * np.pi * 239.0 + 1.3 + np.cos(v * 2.0 * np.pi * 5.0) * 0.22)
    f3 = np.cos(u * 2.0 * np.pi * 367.0 + 2.7)
    f_macro = np.sin(u * 2.0 * np.pi * 31.0 + 0.5) * 0.5 + np.cos(u * 2.0 * np.pi * 57.0) * 0.5
    strands = 0.42 * f1 + 0.33 * f2 + 0.25 * f3
    long_grad = 0.93 + 0.07 * np.sin(v * np.pi)
    albedo_v = np.clip((182.0 + strands * 32.0 + f_macro * 13.0) * long_grad, 132.0, 232.0)
    comb_fine = 0.5 + 0.5 * (0.45 * np.sin(u * 2.0 * np.pi * 145.0) + 0.35 * np.cos(u * 2.0 * np.pi * 270.0 + 0.9) + 0.20 * np.sin(u * 2.0 * np.pi * 410.0 + 2.1))
    return albedo_v, comb_fine, u, v

ALBEDO_V, COMB_V, U_GRID, V_GRID = build_base_fiber_grid(512)

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

    zero_frac = (a_orig < 0.05).sum() / float(res * res)
    semi_frac = ((a_orig >= 0.05) & (a_orig <= 0.92)).sum() / float(res * res)

    if zero_frac < 0.015 and semi_frac < 0.02:
        # Solid texture without alpha channel: keep interior dense and softly comb tips
        tip_feather = np.clip(np.minimum(v_coord, 1.0 - v_coord) / 0.045, 0.25, 1.0)
        a_final = np.where(tip_feather > 0.92, 1.0, tip_feather * (0.76 + 0.24 * comb))
    else:
        # Preserve 100% of the artist's original alpha mask (no artificial UV-0/1 slits!) and gently comb semi-transparent wisps
        edge_zone = np.clip(4.0 * a_orig * (1.0 - a_orig), 0.0, 1.0)
        a_final = np.clip(a_orig * (1.0 - 0.16 * edge_zone * (1.0 - comb)), 0.0, 1.0)

    # RGB is 100% pure synthesized longitudinal hair micro-fibers (ZERO painted gray strips or white halos from old textures!)
    rgb_val = np.clip(albedo_base, 132.0, 226.0)

    g_u8 = rgb_val.astype(np.uint8)
    a_u8 = np.clip(a_final * 255.0, 0.0, 255.0).astype(np.uint8)
    out_rgba = np.stack([g_u8, g_u8, g_u8, a_u8], axis=-1)

    bio = io.BytesIO()
    Image.fromarray(out_rgba, mode='RGBA').quantize(colors=256, method=Image.FASTOCTREE).save(bio, format='PNG', optimize=True)
    return bio.getvalue()

def subdivide_conforming_watertight(pos, norm, uv, tris, max_edge=0.018):
    """
    100% Watertight Conforming Red-Green Edge Subdivision:
    Whether an edge is split depends ONLY on the 3D edge length between its two endpoints.
    Therefore both triangles sharing an edge ALWAYS agree on splitting it -> ZERO T-junction cracks!
    """
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
        # Subtle curved Phong arch
        arch = max(-0.0018, min(0.0018, -0.10 * float(np.dot(v1 - v0, n1 - n0))))
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
        else:  # cnt == 2
            if not b2:  # b0 and b1 split
                m01, m12 = get_mid(i0, i1), get_mid(i1, i2)
                new_tris.append([m01, i1, m12]); new_tris.append([i0, m01, m12]); new_tris.append([i0, m12, i2])
            elif not b0:  # b1 and b2 split
                m12, m20 = get_mid(i1, i2), get_mid(i2, i0)
                new_tris.append([m12, i2, m20]); new_tris.append([i1, m12, m20]); new_tris.append([i1, m20, i0])
            else:  # b2 and b0 split
                m20, m01 = get_mid(i2, i0), get_mid(i0, i1)
                new_tris.append([m20, i0, m01]); new_tris.append([i2, m20, m01]); new_tris.append([i2, m01, i1])

    return (
        np.array(pos_list, dtype=np.float32),
        np.array(norm_list, dtype=np.float32),
        np.array(uv_list, dtype=np.float32),
        np.array(new_tris, dtype=np.uint32),
    )

# 28 Curated Master Artist Hairstyles Catalog
selected_28 = [
    # 1-6: Short Bobs, Student Bobs & Pixie Cuts
    ('hair_bob01',             'toigo_curled_under_bob_with_bangs', (-0.001, 0.002, 1.02, 1.01, 1.02, 'default')),
    ('hair_user_photo',        'littleright_bobcut_hair',           (0.000, 0.001, 1.01, 1.00, 1.01, 'default')),
    ('hair_bob02',             'culturalibre_hair_18',              (0.000, 0.002, 1.02, 1.01, 1.02, 'default')),
    ('hair_short02',           'o4saken_chinesebob01',              (-0.001, 0.002, 1.02, 1.01, 1.02, 'default')),
    ('daz_hair_asym_short',    'elvs_witchy_lil_bob',               (-0.001, 0.002, 1.02, 1.01, 1.02, 'default')),
    ('daz_hair_pixie_chic',    'elvs_grump_hair',                   (0.000, 0.001, 1.01, 1.00, 1.01, 'default')),
    # 7-12: Straight Long, Hime Cut & Clavicle Lobs
    ('hair_long01',            'elvs_daisy_hair',                   (0.000, 0.001, 1.01, 1.00, 1.01, 'extend_long')),
    ('daz_hair_hime',          'cortu_straight_bangs',              (0.002, 0.001, 1.01, 1.00, 1.01, 'drape_long')),
    ('hair_short04',           'elvs_katherine_hair',               (0.008, 0.002, 1.02, 1.00, 1.02, 'lift_bangs')),
    ('daz_hair_side_long',     'elvs_lady_hippy_hair',              (0.000, 0.001, 1.01, 1.00, 1.01, 'drape_long')),
    ('daz_hair_air_bangs_long','toigo_inverted_bob_with_bangs',     (0.000, 0.002, 1.02, 1.01, 1.02, 'extend_long')),
    ('daz_hair_wolf_clavicle', 'toigo_inverted_bob',                (0.000, 0.001, 1.01, 1.00, 1.01, 'wolf_flare')),
    # 13-18: Glamorous Waves & Curls
    ('daz_hair_curtain_wave',  'elvs_that_80s_babe_hair',           (0.000, 0.001, 1.01, 1.00, 1.01, 'drape_clavicle')),
    ('daz_hair_hazel_wave',    'elvs_hazel_hair',                   (0.000, 0.002, 1.02, 1.00, 1.02, 'drape_clavicle')),
    ('daz_hair_wavy_bob',      'elvs_ashley_may_hair',              (0.000, 0.001, 1.01, 1.00, 1.01, 'default')),
    ('daz_hair_glam_wave',     'culturalibre_hair_17',              (0.000, 0.001, 1.01, 1.00, 1.01, 'drape_clavicle')),
    ('daz_hair_mermaid_curl',  'punkduck_alpha7_curly2',            (0.000, 0.002, 1.02, 1.00, 1.02, 'drape_long')),
    ('daz_hair_french_lazy_roll','elvs_inverted_curly_bob',         (0.000, 0.002, 1.02, 1.01, 1.02, 'default')),
    # 19-23: Oriental Updos, Chignons & Braided Buns
    ('hair_braid01',           'elvs_50s_updo',                     (0.000, 0.002, 1.02, 1.01, 1.02, 'default')),
    ('daz_hair_adrienne_updo', 'elvs_adrienne_hair',                (0.001, 0.002, 1.02, 1.00, 1.02, 'default')),
    ('daz_hair_low_chignon',   'elvs_keylth_hair',                  (0.001, 0.002, 1.02, 1.01, 1.02, 'default')),
    ('daz_hair_crown_braid',   'elvs_braid_bun',                    (0.000, 0.001, 1.01, 1.00, 1.01, 'default')),
    ('daz_hair_ballerina_bun', 'grinsegold_wig_bow_tie',            (0.000, 0.002, 1.02, 1.01, 1.02, 'default')),
    # 24-28: Ponytails, Twin Buns, Half-Up & Twin Braids
    ('hair_ponytail01',        'elvs_lara_hair',                    (0.000, 0.001, 1.01, 1.00, 1.01, 'drape_long')),
    ('daz_hair_twin_buns',     'elvs_micky_afro',                   (0.000, 0.001, 1.01, 1.00, 1.01, 'default')),
    ('daz_hair_halfup_princess','elvs_daisy_hair',                  (0.000, 0.001, 1.01, 1.00, 1.01, 'drape_clavicle')),
    ('daz_hair_twin_braids',   'elvs_island_princess_hair',         (0.000, 0.001, 1.01, 1.00, 1.01, 'drape_long')),
    ('daz_hair_sport_ponytail','elvs_short_daisy_hair',             (0.000, 0.001, 1.01, 1.00, 1.01, 'default')),
]

def write_hair_glb(out_path, name, pos, norm, uv, tris, png_bytes):
    # Pre-sort triangles from inner cranial layer outward & back-to-front so alpha-blended hair cards layer cleanly
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
        "asset": {"version": "2.0", "generator": "MakeHuman-Master-Hair-Pipeline-v3"},
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
                "metallicFactor": 0.02,
                "roughnessFactor": 0.34
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

print("=== Step 3: Exporting 28 Conforming-Subdivided, Halo-Free Photorealistic 3D Hairstyles ===")
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
    if mhmat_p and os.path.exists(mhmat_p):
        for line in open(mhmat_p, errors='ignore'):
            l = line.strip()
            if l.startswith('diffuseTexture '): tex_p = os.path.join(folder, l.split(None, 1)[1])
    pngs = [p for p in glob.glob(os.path.join(folder, '*.png')) + glob.glob(os.path.join(folder, '*.jpg')) if not p.endswith('.thumb') and 'normal' not in p.lower() and 'spec' not in p.lower()]
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
    fitted_v = fitted_v + rdir * (0.0044 * mask_up)
    fitted_v = (fitted_v - hc) * np.array([sx_t, sy_t, sz_t]) + hc + np.array([0.0, dy, dz])

    y_col = fitted_v[:, 1]
    if variant == 'extend_long':
        low = y_col < -0.02
        depth = -0.02 - y_col[low]
        fitted_v[low, 1] = -0.02 - depth * 1.38
        fitted_v[low, 0] *= (1.0 + 0.06 * np.sin(depth * 22.0))
    elif variant == 'wolf_flare':
        low = y_col < 0.00
        depth = -y_col[low]
        rad_xz = np.maximum(np.hypot(fitted_v[low, 0], fitted_v[low, 2]), 1e-5)
        flare = 0.012 * np.sin(depth * 28.0)
        fitted_v[low, 0] += (fitted_v[low, 0] / rad_xz) * flare
        fitted_v[low, 1] -= depth * 0.22
    elif variant == 'lift_bangs':
        front_b = (fitted_v[:, 2] > 0.04) & (fitted_v[:, 1] > -0.01) & (fitted_v[:, 1] < 0.075)
        w_fb = np.clip((fitted_v[front_b, 2] - 0.04) / 0.035, 0.0, 1.0)
        fitted_v[front_b, 1] += 0.009 * w_fb

    below = fitted_v[:, 1] < -0.045
    if below.any():
        d_below = -0.045 - fitted_v[below, 1]
        d_draped = 0.098 * np.tanh(d_below / 0.098)
        fitted_v[below, 1] = -0.045 - d_draped
        t_norm = np.clip(d_below / 0.18, 0.0, 1.0)
        wave_x = 0.003 * np.sin(d_below * 36.0 + fitted_v[below, 0] * 24.0)
        fitted_v[below, 0] = fitted_v[below, 0] * (1.0 - 0.12 * t_norm) + wave_x
        fitted_v[below, 2] = fitted_v[below, 2] * (1.0 - 0.08 * t_norm)

    crown_check = (fitted_v[:, 1] > -0.01) & (fitted_v[:, 2] < 0.075)
    if crown_check.any():
        d_s, idx_s = scalp_tree.query(fitted_v[crown_check], k=1)
        near_pt = scalp_pts[idx_s]
        near_n = scalp_norms[idx_s]
        signed_d = np.sum((fitted_v[crown_check] - near_pt) * near_n, axis=1)
        push = np.clip(0.0022 - signed_d, 0.0, 0.012)
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
    v_norm_obj = 0.28 * v_norm_obj + 0.72 * rad_n
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

    for sub_thresh, max_t in ((0.022, 10000), (0.015, 5000)):
        if len(tris_hr) < max_t:
            pos_hr, norm_hr, uv_hr, tris_hr = subdivide_conforming_watertight(pos_hr, norm_hr, uv_hr, tris_hr, max_edge=sub_thresh)

    # Ensure subdivided midpoints never sag inward into the convex forehead/temple surface
    sub_check = (pos_hr[:, 1] > -0.025) & (pos_hr[:, 2] < 0.082)
    if sub_check.any():
        d_s2, idx_s2 = scalp_tree.query(pos_hr[sub_check], k=1)
        near_pt2 = scalp_pts[idx_s2].astype(np.float32)
        near_n2 = scalp_norms[idx_s2].astype(np.float32)
        signed_d2 = np.sum((pos_hr[sub_check] - near_pt2) * near_n2, axis=1)
        push2 = np.clip(0.0024 - signed_d2, 0.0, 0.012)
        pos_hr[sub_check] += near_n2 * push2[:, None]

    if valid_tex not in tex_cache:
        tex_cache[valid_tex] = synthesize_photoreal_hair_png(valid_tex, folder_name)
    png_bytes = tex_cache[valid_tex]

    out_glb = f'/home/user/public/models/{gid}.glb'
    write_hair_glb(out_glb, gid, pos_hr, norm_hr, uv_hr, tris_hr, png_bytes)
    print(f"Exported {gid:24s}: verts={len(pos_hr):5d}, tris={len(tris_hr):5d}, size={os.path.getsize(out_glb)/1024:5.1f} KB")

for p in glob.glob('/home/user/public/models/*.glb'):
    if os.path.basename(p) not in keep_glbs:
        os.remove(p)
        print("Cleaned old duplicate GLB:", p)
