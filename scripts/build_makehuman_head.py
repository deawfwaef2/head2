#!/usr/bin/env python3
"""
Build a high-precision 3D Asian Female head-only collectible model from MakeHuman CC0 assets.

Sources (all CC0, see assets_src/makehuman/LICENSE_NOTE.txt):
  - base.obj                       MakeHuman base mesh (hm08: g body, g helper-l/r-eye, g helper-l/r-eyelashes)
  - targets/macrodetails/asian-female-young.target
  - targets/head/*.target, targets/neck/*.target, targets/chin/*.target
  - hair/<name>/<name>.obj + .mhclo  (hair proxies fitted with exact world-axis mhclo scale)
  - eyebrows/eyebrow001/...

Outputs (in the exact same coordinate frame & group convention as daz_asian_female_linxi.obj):
  public/models/mh_asian_female_head.obj   (g head_skin + g neck_cross_section)
  public/models/mh_hair_bob02.obj
  public/models/mh_hair_long01.obj
  public/models/mh_hair_ponytail01.obj
"""
import math
import os
from collections import Counter, defaultdict
import numpy as np

ROOT = '/home/user'
SRC = os.path.join(ROOT, 'assets_src', 'makehuman')
OUT = os.path.join(ROOT, 'public', 'models')

# Target frame (matches daz_asian_female_linxi.obj)
LINXI_TOP_Y = 10.25          # crown top Y
LINXI_NECK_Y = -13.20        # C4/C5 anatomical neck cross-section plane
NECK_CENTER_Z = -2.05
NECK_RX = 3.08
NECK_RZ = 3.25

# MakeHuman neck slice level (clean cylindrical neck above shoulders)
CUT_Y = 4.69

MACRO_TARGETS = [
    ('macrodetails/asian-female-young.target', 1.0),
]
HEAD_TARGETS = [
    ('head/head-oval.target', 0.65),
    ('head/head-age-decr.target', 0.45),
    ('head/head-fat-decr.target', 0.35),
    ('chin/chin-width-decr.target', 0.55),
    ('chin/chin-height-decr.target', 0.25),
    ('neck/neck-scale-depth-decr.target', 0.45),
    ('neck/neck-scale-horiz-decr.target', 0.55),
    ('neck/neck-double-decr.target', 0.50),
]

HAIRS = [
    ('bob02', 'mh_hair_bob02.obj'),
    ('long01', 'mh_hair_long01.obj'),
    ('ponytail01', 'mh_hair_ponytail01.obj'),
]


def load_obj_with_groups(path):
    V, VT = [], []
    groups = defaultdict(list)
    cur_g = 'default'
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            if line.startswith('v '):
                V.append([float(x) for x in line.split()[1:4]])
            elif line.startswith('vt '):
                VT.append([float(x) for x in line.split()[1:3]])
            elif line.startswith('g '):
                parts = line.strip().split()
                cur_g = parts[1] if len(parts) > 1 else 'default'
            elif line.startswith('f '):
                ids = [int(p.split('/')[0]) - 1 for p in line.split()[1:]]
                groups[cur_g].append(ids)
    return np.array(V, dtype=float), np.array(VT, dtype=float), groups


def load_target(path, n):
    d = np.zeros((n, 3))
    if not os.path.exists(path):
        return d
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            if not line.strip() or line.startswith('#'):
                continue
            t = line.split()
            d[int(t[0])] = [float(t[1]), float(t[2]), float(t[3])]
    return d


def sculpt_mh_asian_beauty(V_in, groups):
    """Refines the MakeHuman Asian Female head into a delicate East Asian beauty sculpt."""
    V = V_in.copy()

    # Identify eyeball vertices so eyeballs stay purely spherical around their centers
    eye_l_vs = {i for f in groups.get('helper-l-eye', []) for i in f}
    eye_r_vs = {i for f in groups.get('helper-r-eye', []) for i in f}
    eye_vs = eye_l_vs | eye_r_vs

    for i in range(len(V)):
        if i in eye_vs:
            continue
        x, y, z = V[i]
        if y < 4.55 or y > 7.20:
            continue

        nx, ny, nz = x, y, z

        # 1. Graceful East Asian V-Line / Oval Jaw & Cheek Taper (y in 4.88..5.65)
        if 4.85 < y < 5.72 and z > 0.15:
            t_jaw = np.clip((5.72 - y) / (5.72 - 4.92), 0.0, 1.0)
            s_jaw = t_jaw * t_jaw * (3.0 - 2.0 * t_jaw)
            z_front_w = np.clip((z - 0.15) / 0.85, 0.0, 1.0)
            jaw_taper = 1.0 - 0.14 * s_jaw * z_front_w
            # Extra chin tip V-refinement near y in 4.90..5.15
            if y < 5.18:
                t_chin = np.clip((5.18 - y) / 0.26, 0.0, 1.0)
                jaw_taper *= (1.0 - 0.08 * t_chin * z_front_w)
            nx *= jaw_taper

        # 2. Soft Apple Cheek Fullness (y ~ 5.58, |x| ~ 0.34, z > 0.95)
        if z > 0.90:
            apple_w = math.exp(-((abs(x) - 0.33) / 0.18) ** 2) * math.exp(-((y - 5.58) / 0.18) ** 2)
            nz += 0.024 * apple_w

        # 3. Delicate High Nasal Bridge & Petite Alar Wings (y in 5.34..5.75, |x| < 0.25, z > 1.15)
        if 5.33 < y < 5.76 and abs(x) < 0.26 and z > 1.12:
            alar_w = math.exp(-((y - 5.42) / 0.09) ** 2) * math.exp(-(x / 0.20) ** 2)
            bridge_w = math.exp(-((y - 5.58) / 0.16) ** 2) * math.exp(-(x / 0.14) ** 2)
            nx *= (1.0 - 0.20 * alar_w - 0.14 * bridge_w)
            nz += 0.018 * bridge_w
            # Dainty nose tip projection at y ~ 5.45
            tip_w = math.exp(-((y - 5.45) / 0.06) ** 2) * math.exp(-(x / 0.08) ** 2)
            nz += 0.022 * tip_w
            ny += 0.008 * tip_w

        # 4. Petite Sculpted Petal Lips & Gentle Smile Corner Lift (y in 5.04..5.30, |x| < 0.30, z > 1.12)
        if 5.03 < y < 5.31 and abs(x) < 0.32 and z > 1.12:
            mouth_w = math.exp(-((y - 5.172) / 0.095) ** 2) * math.exp(-(x / 0.24) ** 2)
            nx *= (1.0 - 0.14 * mouth_w)
            # Gentle corner lift at |x| ~ 0.18
            corner_w = math.exp(-((abs(x) - 0.18) / 0.06) ** 2) * math.exp(-((y - 5.172) / 0.06) ** 2)
            ny += 0.012 * corner_w
            # Softly plump central upper/lower lip vermilion (z > 1.27)
            if z > 1.26:
                plump_w = math.exp(-(x / 0.14) ** 2) * math.exp(-((y - 5.175) / 0.075) ** 2)
                nz += 0.014 * plump_w

        # 5. Slightly Enlarged Luminous Almond Eye Opening (around eye centers x = ±0.247, y = 5.793, z > 1.05)
        if 5.66 < y < 5.92 and z > 1.02:
            for ex in (-0.2469, 0.2469):
                dx = x - ex
                dy = y - 5.7928
                ew = math.exp(-(dx / 0.13) ** 2) * math.exp(-(dy / 0.075) ** 2)
                if ew > 0.02:
                    ny += dy * 0.18 * ew
                    # Subtle upward almond tilt toward outer canthus
                    outer_dir = (abs(x) - 0.2469) / 0.10
                    ny += 0.006 * outer_dir * ew

        V[i] = [nx, ny, nz]

    return V


def deform_base(base_v, groups):
    out = base_v.copy()
    n = len(base_v)
    for rel, w in MACRO_TARGETS + HEAD_TARGETS:
        out += w * load_target(os.path.join(SRC, 'targets', rel), n)
    out = sculpt_mh_asian_beauty(out, groups)
    return out


def load_mhclo(path):
    """Returns (obj_name, scales_dict, rows) from a MakeHuman .mhclo file."""
    obj_name = None
    scales = {}
    rows = []
    in_verts = False
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith('#'):
                continue
            parts = s.split()
            if parts[0] == 'obj_file':
                obj_name = parts[1]
            elif parts[0] in ('x_scale', 'y_scale', 'z_scale'):
                scales[parts[0]] = (int(parts[1]), int(parts[2]), float(parts[3]))
            elif parts[0] == 'verts':
                in_verts = True
                continue
            elif in_verts and len(parts) >= 9:
                rows.append((
                    [int(parts[0]), int(parts[1]), int(parts[2])],
                    [float(parts[3]), float(parts[4]), float(parts[5])],
                    [float(parts[6]), float(parts[7]), float(parts[8])],
                ))
    return obj_name, scales, rows


def fit_proxy(mhclo_path, base_def):
    """Fit a MakeHuman proxy onto the deformed base mesh using exact world-axis .mhclo scales."""
    obj_name, scales, rows = load_mhclo(mhclo_path)
    obj_path = os.path.join(os.path.dirname(mhclo_path), obj_name)
    pV, pVT, pGroups = load_obj_with_groups(obj_path)
    pF = [f for flist in pGroups.values() for f in flist]
    if len(rows) != len(pV):
        raise RuntimeError(f'{mhclo_path}: {len(rows)} fit rows vs {len(pV)} obj verts')

    sx = sy = sz = 1.0
    if 'x_scale' in scales:
        v1, v2, d0 = scales['x_scale']
        sx = abs(base_def[v1, 0] - base_def[v2, 0]) / max(d0, 1e-6)
    if 'y_scale' in scales:
        v1, v2, d0 = scales['y_scale']
        sy = abs(base_def[v1, 1] - base_def[v2, 1]) / max(d0, 1e-6)
    if 'z_scale' in scales:
        v1, v2, d0 = scales['z_scale']
        sz = abs(base_def[v1, 2] - base_def[v2, 2]) / max(d0, 1e-6)

    fitted = np.zeros_like(pV)
    for i, (ids, w, o) in enumerate(rows):
        p = w[0] * base_def[ids[0]] + w[1] * base_def[ids[1]] + w[2] * base_def[ids[2]]
        fitted[i] = p + np.array([o[0] * sx, o[1] * sy, o[2] * sz])
    return fitted, pVT, pF


def to_triangles(F):
    tris = []
    for f in F:
        for k in range(1, len(f) - 1):
            tris.append([f[0], f[k], f[k + 1]])
    return tris


def smooth_normals(V, tris):
    N = np.zeros_like(V)
    for a, b, c in tris:
        n = np.cross(V[b] - V[a], V[c] - V[a])
        N[a] += n
        N[b] += n
        N[c] += n
    ln = np.linalg.norm(N, axis=1, keepdims=True)
    ln[ln < 1e-12] = 1.0
    return N / ln


def extract_clean_head_and_neck(V_def, body_faces, cut_y):
    """Extracts g body faces above cut_y (excluding shoulder flare) and finds the ordered neck boundary loop."""
    def in_head_neck_column(i):
        x, y, z = V_def[i]
        # Above y=5.15 is head/ears; below y=5.15 is neck cylinder (|x| <= 0.48)
        return y >= cut_y and (y >= 5.15 or abs(x) <= 0.48)

    keep = [f for f in body_faces if all(in_head_neck_column(i) for i in f)]
    edge_count = Counter()
    for f in keep:
        for k in range(len(f)):
            a, b = f[k], f[(k + 1) % len(f)]
            edge_count[(min(a, b), max(a, b))] += 1

    boundary = [e for e, c in edge_count.items() if c == 1]
    adj = defaultdict(list)
    for a, b in boundary:
        adj[a].append(b)
        adj[b].append(a)

    loops, seen = [], set()
    for start in adj:
        if start in seen:
            continue
        loop, prev, cur = [], None, start
        while cur not in seen:
            seen.add(cur)
            loop.append(cur)
            nxt = [x for x in adj[cur] if x != prev]
            if not nxt:
                break
            prev, cur = cur, nxt[0]
        loops.append(loop)

    # The neck boundary loop is the loop with the lowest average Y
    neck_loop = min(loops, key=lambda lp: np.mean([V_def[i, 1] for i in lp]))
    cx = np.mean([V_def[i, 0] for i in neck_loop])
    cz = np.mean([V_def[i, 2] for i in neck_loop])

    # Ensure consistent counter-clockwise ordering around Y axis when viewed from above
    # Check signed area in XZ
    area = 0.0
    for k in range(len(neck_loop)):
        p0 = V_def[neck_loop[k]]
        p1 = V_def[neck_loop[(k + 1) % len(neck_loop)]]
        area += (p0[0] - cx) * (p1[2] - cz) - (p1[0] - cx) * (p0[2] - cz)
    if area < 0:
        neck_loop.reverse()

    return keep, neck_loop


def write_obj(path, groups):
    """groups: list of (group_name, mtl_name, V, VT, N, tris) with tris local-indexed (0-based)."""
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# CC0 High-Precision 3D Asian Female Head derived from MakeHuman (assets_src/makehuman/LICENSE_NOTE.txt)\n')
        f.write('o CERVIX_MH_Collectible_Head\n')
        for _, _, V, _, _, _ in groups:
            for v in V:
                f.write(f'v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n')
        for _, _, _, VT, _, _ in groups:
            for t in VT:
                f.write(f'vt {t[0]:.4f} {t[1]:.4f}\n')
        for _, _, _, _, N, _ in groups:
            for n in N:
                f.write(f'vn {n[0]:.4f} {n[1]:.4f} {n[2]:.4f}\n')

        vbase = 0
        for gname, mtlname, V, _, _, tris in groups:
            f.write(f'g {gname}\nusemtl {mtlname}\n')
            for a, b, c in tris:
                A = a + 1 + vbase
                B = b + 1 + vbase
                C = c + 1 + vbase
                f.write(f'f {A}/{A}/{A} {B}/{B}/{B} {C}/{C}/{C}\n')
            vbase += len(V)


def main():
    os.makedirs(OUT, exist_ok=True)
    base_v, base_vt, groups = load_obj_with_groups(os.path.join(SRC, 'base.obj'))
    base_def = deform_base(base_v, groups)

    kept_body_faces, neck_loop = extract_clean_head_and_neck(base_def, groups['body'], CUT_Y)

    # Compute uniform isotropic scale from Crown-to-Chin height so facial proportions are 100% natural!
    body_used = sorted({i for f in kept_body_faces for i in f})
    crown_y_mh = base_def[body_used, 1].max()   # ~ 6.837
    chin_y_mh = 4.9508                          # chin tip in base_def
    # In LINXI frame: Crown = +10.25, Chin = -7.30 -> Crown-to-Chin = 17.55 cm
    scale_s = 17.55 / (crown_y_mh - chin_y_mh)  # ~ 9.304 (100% isotropic across X, Y, Z!)
    neck_cz_mh = np.mean([base_def[i, 2] for i in neck_loop])

    def xf(P):
        Q = np.zeros_like(P)
        Q[:, 0] = P[:, 0] * scale_s
        Q[:, 1] = LINXI_TOP_Y - (crown_y_mh - P[:, 1]) * scale_s
        Q[:, 2] = (P[:, 2] - neck_cz_mh) * scale_s + NECK_CENTER_Z
        return Q

    # Remap body vertices
    remap = {old: new for new, old in enumerate(body_used)}
    skin_V_mh = base_def[body_used].copy()
    skin_Vx = xf(skin_V_mh)
    skin_tris = [[remap[a], remap[b], remap[c]] for f in kept_body_faces for (a, b, c) in to_triangles([f])]

    # Map UVs of g body onto createDazSkinTexture layout (lips, cheek blush, nose highlight, pure porcelain skin)
    skin_UV = np.zeros((len(body_used), 2))
    for new_i, old_i in enumerate(body_used):
        x_m, y_m, z_m = skin_V_mh[new_i]
        # 1. Outer 3D Lips (y in 5.055..5.285, |x| < 0.24, z > 1.225 so inner mouth cavity stays dark/skin)
        if 5.055 <= y_m <= 5.285 and abs(x_m) <= 0.24 and z_m >= 1.225:
            u = 0.50 + (x_m / 0.22) * 0.088
            v = 0.308 + ((y_m - 5.172) / 0.108) * 0.040
        # 2. Inner oral cavity behind lips (z < 1.225, y in 5.05..5.35, |x| < 0.25) -> deep mouth line color
        elif 5.05 <= y_m <= 5.35 and abs(x_m) <= 0.25 and 0.95 <= z_m < 1.225:
            u = 0.50
            v = 0.308
        # 3. Cheek Blush & Nasal Bridge / Nostrils (y in 5.285..5.66, z > 0.80)
        elif 5.285 < y_m <= 5.66 and z_m > 0.80:
            u = 0.50 + (x_m / 0.66) * 0.22
            v = 0.415 + ((y_m - 5.285) / 0.375) * 0.145
        # 4. Upper Eyelid & Periorbital Soft Eyeshadow (y in 5.66..5.90, |x| in 0.11..0.39, z > 1.04)
        elif 5.66 < y_m <= 5.90 and 0.11 <= abs(x_m) <= 0.39 and z_m > 1.04:
            # Sample the soft peach-rose eyeshadow halo just above the eyelid crease (v in 0.675..0.695)
            side = 1.0 if x_m >= 0 else -1.0
            u = 0.50 + side * (0.154 + ((abs(x_m) - 0.247) / 0.14) * 0.05)
            v = 0.682 + ((y_m - 5.79) / 0.12) * 0.012
        # 5. Pure Porcelain Skin (forehead, temples, chin, jaw, ears, cranium, neck)
        else:
            u = 0.50 + np.clip(x_m / 0.82, -0.32, 0.32)
            v = 0.10 + np.clip((y_m - 4.65) / 2.25, 0.0, 1.0) * 0.12

        skin_UV[new_i] = [np.clip(u, 0.01, 0.99), np.clip(v, 0.01, 0.99)]

    # Smoothly extend neck_loop down to LINXI_NECK_Y = -13.20 cm with 5 cylindrical swan-neck rings!
    loop_local = [remap[i] for i in neck_loop]
    # Level the neck_loop vertices slightly so the transition is super smooth
    neck_rings = 5
    M = len(loop_local)
    prev_ring = loop_local
    neck_ext_V = []
    neck_ext_UV = []
    neck_ext_tris = []

    for r in range(1, neck_rings + 1):
        t = r / neck_rings
        st = t * t * (3.0 - 2.0 * t)
        cur_ring = []
        for k in range(M):
            p0 = skin_Vx[loop_local[k]]
            ang = math.atan2(p0[2] - NECK_CENTER_Z, p0[0])
            cos_a = math.cos(ang)
            sin_a = math.sin(ang)

            # Target anatomical neck cross-section rim at Y = LINXI_NECK_Y
            scm_bulge = 0.12 * (cos_a ** 2) * math.exp(-((sin_a - 0.15) / 0.5) ** 2)
            trachea_ant = 0.10 * (max(0.0, sin_a) ** 3)
            nuchal_post = -0.10 * (max(0.0, -sin_a) ** 3)
            rad_mod = 1.0 + scm_bulge + trachea_ant + nuchal_post

            tx = NECK_RX * rad_mod * cos_a
            tz = NECK_CENTER_Z + NECK_RZ * rad_mod * sin_a
            ty = LINXI_NECK_Y

            px = (1.0 - st) * p0[0] + st * tx
            py = (1.0 - t) * p0[1] + t * ty
            pz = (1.0 - st) * p0[2] + st * tz

            new_idx = len(skin_Vx) + len(neck_ext_V)
            neck_ext_V.append([px, py, pz])
            neck_ext_UV.append([0.50 + 0.18 * cos_a, 0.08 + 0.04 * (1.0 - t)])
            cur_ring.append(new_idx)

        for k in range(M):
            kn = (k + 1) % M
            u0, u1 = prev_ring[k], prev_ring[kn]
            w0, w1 = cur_ring[k], cur_ring[kn]
            neck_ext_tris.append([u0, w0, w1])
            neck_ext_tris.append([u0, w1, u1])
        prev_ring = cur_ring

    bottom_neck_ring = prev_ring
    skin_Vx = np.vstack([skin_Vx, np.array(neck_ext_V)])
    skin_UV = np.vstack([skin_UV, np.array(neck_ext_UV)])
    skin_tris.extend(neck_ext_tris)

    # Append 3D Eyeballs (helper-l-eye, helper-r-eye) mapped to the 3D Eyeball Medallion at UV (0.075, 0.925)
    for eg in ('helper-l-eye', 'helper-r-eye'):
        efaces = groups.get(eg, [])
        e_used = sorted({i for f in efaces for i in f})
        e_remap = {old: len(skin_Vx) + idx for idx, old in enumerate(e_used)}
        e_pts_mh = base_def[e_used]
        e_center = e_pts_mh.mean(axis=0)
        e_rad = 0.110
        e_Vx = xf(e_pts_mh)
        e_UV = np.zeros((len(e_used), 2))
        for idx, pt in enumerate(e_pts_mh):
            dx = (pt[0] - e_center[0]) / e_rad
            dy = (pt[1] - e_center[1]) / e_rad
            e_UV[idx] = [
                np.clip(0.075 + dx * 0.056, 0.012, 0.138),
                np.clip(0.925 + dy * 0.056, 0.862, 0.988)
            ]
        skin_Vx = np.vstack([skin_Vx, e_Vx])
        skin_UV = np.vstack([skin_UV, e_UV])
        for f in efaces:
            for (a, b, c) in to_triangles([f]):
                skin_tris.append([e_remap[a], e_remap[b], e_remap[c]])

    # Append 3D Eyelashes (helper-l/r-eyelashes-1/2) mapped to the Dark Espresso Swatch at UV (0.925, 0.925)
    for lg in ('helper-l-eyelashes-1', 'helper-l-eyelashes-2', 'helper-r-eyelashes-1', 'helper-r-eyelashes-2'):
        lfaces = groups.get(lg, [])
        l_used = sorted({i for f in lfaces for i in f})
        l_remap = {old: len(skin_Vx) + idx for idx, old in enumerate(l_used)}
        l_Vx = xf(base_def[l_used])
        l_UV = np.tile([0.925, 0.925], (len(l_used), 1))
        skin_Vx = np.vstack([skin_Vx, l_Vx])
        skin_UV = np.vstack([skin_UV, l_UV])
        for f in lfaces:
            for (a, b, c) in to_triangles([f]):
                skin_tris.append([l_remap[a], l_remap[b], l_remap[c]])

    # Append 3D Eyebrows (eyebrow001.mhclo) mapped to the Dark Espresso/Brow Swatch at UV (0.925, 0.925)
    eb_V_mh, _, eb_F = fit_proxy(os.path.join(SRC, 'eyebrows', 'eyebrow001', 'eyebrow001.mhclo'), base_def)
    eb_offset = len(skin_Vx)
    eb_Vx = xf(eb_V_mh)
    eb_UV = np.tile([0.945, 0.925], (len(eb_Vx), 1))
    skin_Vx = np.vstack([skin_Vx, eb_Vx])
    skin_UV = np.vstack([skin_UV, eb_UV])
    for (a, b, c) in to_triangles(eb_F):
        skin_tris.append([eb_offset + a, eb_offset + b, eb_offset + c])

    skin_N = smooth_normals(skin_Vx, skin_tris)

    # Build 6-Ring 3D Relief C4/C5 Anatomical Neck Cross-Section Cap (g neck_cross_section)
    cap_verts, cap_uvs, cap_tris = [], [], []
    radial_rings = 6
    cap_ring_indices = []
    for r in range(radial_rings + 1):
        rho = 1.0 - (r / radial_rings)
        ring_idx = []
        for k in range(M):
            bx, by, bz = skin_Vx[bottom_neck_ring[k]]
            px = rho * bx
            pz = NECK_CENTER_Z + rho * (bz - NECK_CENTER_Z)
            nx_norm = px / (NECK_RX * 1.05)
            nz_norm = (pz - NECK_CENTER_Z) / (NECK_RZ * 1.05)

            trachea_dep = -0.14 * math.exp(-((nx_norm / 0.22) ** 2 + ((nz_norm - 0.46) / 0.22) ** 2))
            vert_elev = 0.09 * math.exp(-((nx_norm / 0.35) ** 2 + ((nz_norm + 0.18) / 0.28) ** 2))
            carotid_dep = -0.09 * (
                math.exp(-(((nx_norm - 0.42) / 0.14) ** 2 + ((nz_norm - 0.12) / 0.14) ** 2)) +
                math.exp(-(((nx_norm + 0.42) / 0.14) ** 2 + ((nz_norm - 0.12) / 0.14) ** 2))
            )
            relief = (trachea_dep + vert_elev + carotid_dep) * (1.0 - (rho ** 4))
            py = LINXI_NECK_Y + relief

            idx_c = len(cap_verts)
            cap_verts.append([px, py, pz])
            cu = 0.5 + 0.46 * (px / NECK_RX)
            cv = 0.5 + 0.46 * ((pz - NECK_CENTER_Z) / NECK_RZ)
            cap_uvs.append([max(0.01, min(0.99, cu)), max(0.01, min(0.99, cv))])
            ring_idx.append(idx_c)
        cap_ring_indices.append(ring_idx)

    for r in range(radial_rings):
        R0 = cap_ring_indices[r]
        R1 = cap_ring_indices[r + 1]
        for k in range(M):
            kn = (k + 1) % M
            cap_tris.append([R0[k], R1[kn], R1[k]])
            cap_tris.append([R0[k], R0[kn], R1[kn]])

    cap_V = np.array(cap_verts, dtype=float)
    cap_UV = np.array(cap_uvs, dtype=float)
    cap_N = smooth_normals(cap_V, cap_tris)
    # Ensure cap normals point downward (-Y)
    if np.mean(cap_N[:, 1]) > 0:
        cap_N = -cap_N

    out_head_path = os.path.join(OUT, 'mh_asian_female_head.obj')
    write_obj(out_head_path, [
        ('head_skin', 'HeadSkinMaterial', skin_Vx, skin_UV, skin_N, skin_tris),
        ('neck_cross_section', 'NeckAnatomyMaterial', cap_V, cap_UV, cap_N, cap_tris),
    ])
    print(f'Saved {out_head_path}: skin_verts={len(skin_Vx)}, skin_tris={len(skin_tris)}, cap_tris={len(cap_tris)}')

    # Fit & export MakeHuman 3D Hairs in the exact same coordinate frame!
    for hair_name, out_name in HAIRS:
        mh_path = os.path.join(SRC, 'hair', hair_name, f'{hair_name}.mhclo')
        hV_mh, hVT, hF = fit_proxy(mh_path, base_def)
        hVx = xf(hV_mh)

        # Add subtle radial outward offset (+0.26 cm) around the cranium center (0, 2.2, -1.2)
        # so curved scalp triangles never poke through between flat hair quads!
        cran_center = np.array([0.0, 2.2, -1.2])
        for i in range(len(hVx)):
            vec = hVx[i] - cran_center
            dist = np.linalg.norm(vec)
            if dist > 1e-4 and hVx[i, 1] > -2.0:
                crown_w = np.clip((hVx[i, 1] - (-2.0)) / 8.0, 0.0, 1.0)
                hVx[i] += (vec / dist) * (0.28 * crown_w)

        # For long hair (long01), smoothly trim/taper vertical drop above LINXI_NECK_Y + 0.6 (-12.6cm)
        # so the hair never covers the bottom C4/C5 anatomical neck cross-section!
        if hVx[:, 1].min() < LINXI_NECK_Y + 0.8:
            y_min = hVx[:, 1].min()
            y_pivot = 0.0
            for i in range(len(hVx)):
                if hVx[i, 1] < y_pivot:
                    t = (y_pivot - hVx[i, 1]) / max(1e-5, y_pivot - y_min)
                    hVx[i, 1] = y_pivot - (y_pivot - (LINXI_NECK_Y + 1.0)) * (t ** 0.78)
                    # Gently flare outward behind shoulders/neck so hair doesn't intersect the neck cylinder
                    r_xz = math.hypot(hVx[i, 0], hVx[i, 2] - NECK_CENTER_Z)
                    if r_xz < 4.2:
                        push = 4.2 / max(0.5, r_xz)
                        hVx[i, 0] *= (1.0 + 0.65 * (push - 1.0) * t)
                        hVx[i, 2] = NECK_CENTER_Z + (hVx[i, 2] - NECK_CENTER_Z) * (1.0 + 0.65 * (push - 1.0) * t)

        htris = to_triangles(hF)
        hN = smooth_normals(hVx, htris)
        if len(hVT) != len(hVx):
            hVT = np.zeros((len(hVx), 2))
            hVT[:, 0] = (np.arctan2(hVx[:, 0], hVx[:, 2] - NECK_CENTER_Z) / (2 * math.pi) + 0.5) * 2.0
            hVT[:, 1] = np.clip((hVx[:, 1] - LINXI_NECK_Y) / (LINXI_TOP_Y - LINXI_NECK_Y), 0.02, 0.98)

        write_obj(os.path.join(OUT, out_name), [
            (f'hair_{hair_name}', 'HairMaterial', hVx, hVT, hN, htris)
        ])
        print(f'Saved {out_name}: verts={len(hVx)}, tris={len(htris)}')


if __name__ == '__main__':
    main()
