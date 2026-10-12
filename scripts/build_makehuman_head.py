#!/usr/bin/env python3
"""
Build a head-only collectible model from MakeHuman CC0 assets.

Sources (all CC0, see assets_src/makehuman/LICENSE_NOTE.txt):
  - base.obj                       MakeHuman base mesh (hm08, 19158 verts)
  - targets/macrodetails/asian-female-young.target
  - targets/head/*.target, targets/neck/*.target, targets/chin/*.target
  - hair/<name>/<name>.obj + .mhclo  (hair proxies, fitted to the base mesh)
  - eyebrows/eyebrow001/...

Output (written into public/models/, in the SAME coordinate frame as the
existing daz_asian_female_linxi.obj so collectibleHeadAssembler sliders still
work):
  public/models/mh_asian_female_head.obj   skin (head_skin) + neck_cross_section + eyebrows
  public/models/mh_hair_bob02.obj          hair (bob)
  public/models/mh_hair_long01.obj         hair (long)

Usage:  python3 scripts/build_makehuman_head.py
"""
import math
import os
import numpy as np

ROOT = '/home/user'
SRC = os.path.join(ROOT, 'assets_src', 'makehuman')
OUT = os.path.join(ROOT, 'public', 'models')

# ---- Target frame (matches daz_asian_female_linxi.obj) ----
LINXI_TOP_Y = 10.27          # top of head
LINXI_NECK_Y = -13.2         # neck cut plane
LINXI_HALF_W = 7.22          # half width at widest point
LINXI_HALF_D = 7.0           # approx half depth
NECK_CENTER_Z = -2.05

# ---- MakeHuman build parameters ----
CUT_Y = 4.72                 # neck cut plane in MakeHuman units (checked by profile plot)

MACRO_TARGETS = [
    ('macrodetails/asian-female-young.target', 1.0),
]
HEAD_TARGETS = [
    ('head/head-oval.target', 0.6),
    ('head/head-age-decr.target', 0.4),
    ('head/head-scale-horiz-decr.target', 0.5),
    ('head/head-scale-depth-decr.target', 0.3),
    ('chin/chin-width-decr.target', 0.4),
    ('chin/chin-height-decr.target', 0.2),
    ('neck/neck-scale-depth-decr.target', 0.5),
    ('neck/neck-scale-horiz-decr.target', 0.6),
    ('neck/neck-double-decr.target', 0.4),
]

HAIRS = [
    ('bob02', 'mh_hair_bob02.obj'),
    ('long01', 'mh_hair_long01.obj'),
]


def load_obj(path):
    V, VT, F = [], [], []
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            if line.startswith('v '):
                V.append([float(x) for x in line.split()[1:4]])
            elif line.startswith('vt '):
                VT.append([float(x) for x in line.split()[1:3]])
            elif line.startswith('f '):
                ids = [int(p.split('/')[0]) - 1 for p in line.split()[1:]]
                F.append(ids)
    return np.array(V, dtype=float), np.array(VT, dtype=float), F


def load_target(path, n):
    d = np.zeros((n, 3))
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            if not line.strip() or line.startswith('#'):
                continue
            t = line.split()
            d[int(t[0])] = [float(t[1]), float(t[2]), float(t[3])]
    return d


def deform_base(base_v):
    out = base_v.copy()
    n = len(base_v)
    for rel, w in MACRO_TARGETS + HEAD_TARGETS:
        out += w * load_target(os.path.join(SRC, 'targets', rel), n)
    return out


def load_mhclo(path):
    """Returns list of (ids[3], weights[3], offsets[3]) and obj filename."""
    obj_name = None
    rows = []
    in_verts = False
    with open(path, encoding='utf-8', errors='ignore') as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith('#'):
                continue
            if s.startswith('obj_file'):
                obj_name = s.split()[1]
            if s.startswith('verts'):
                in_verts = True
                continue
            if in_verts:
                t = s.split()
                if len(t) >= 9:
                    rows.append((
                        [int(t[0]), int(t[1]), int(t[2])],
                        [float(t[3]), float(t[4]), float(t[5])],
                        [float(t[6]), float(t[7]), float(t[8])],
                    ))
    return obj_name, rows


def fit_proxy(mhclo_path, base_def):
    """Fit a MakeHuman proxy onto the deformed base mesh.

    Each proxy vertex = weighted base-vertex average + offset expressed in the
    local frame of the bound base triangle (x: edge, y: in-plane, z: normal)."""
    obj_name, rows = load_mhclo(mhclo_path)
    obj_path = os.path.join(os.path.dirname(mhclo_path), obj_name)
    pV, pVT, pF = load_obj(obj_path)
    if len(rows) != len(pV):
        raise RuntimeError(f'{mhclo_path}: {len(rows)} fit rows vs {len(pV)} obj verts')
    fitted = np.zeros_like(pV)
    for i, (ids, w, o) in enumerate(rows):
        b0, b1, b2 = base_def[ids[0]], base_def[ids[1]], base_def[ids[2]]
        p = w[0] * b0 + w[1] * b1 + w[2] * b2
        e1 = b1 - b0
        ln = np.linalg.norm(e1)
        e1 = e1 / ln if ln > 1e-9 else np.array([1.0, 0, 0])
        nrm = np.cross(b1 - b0, b2 - b0)
        nl = np.linalg.norm(nrm)
        nrm = nrm / nl if nl > 1e-9 else np.array([0, 0, 1.0])
        e2 = np.cross(nrm, e1)
        fitted[i] = p + o[0] * e1 + o[1] * e2 + o[2] * nrm
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
        N[a] += n; N[b] += n; N[c] += n
    ln = np.linalg.norm(N, axis=1, keepdims=True)
    ln[ln < 1e-12] = 1.0
    return N / ln


def cap_from_cut(V, F, cut_y):
    """Find boundary loop of faces above cut_y, return (cap_tris_local_indices, loop_ids)."""
    # keep only the head + a narrow neck column: shoulders/trapezius are excluded
    # (they sit just above cut_y and would flare out as wings after the cut)
    def in_column(i):
        return V[i][1] >= 5.2 or abs(V[i][0]) <= 1.1
    keep = [f for f in F if all(V[i][1] >= cut_y and in_column(i) for i in f)]
    edge_count = {}
    for f in keep:
        for k in range(len(f)):
            a, b = f[k], f[(k + 1) % len(f)]
            key = (min(a, b), max(a, b))
            edge_count[key] = edge_count.get(key, 0) + 1
    boundary = [e for e, c in edge_count.items() if c == 1]
    if not boundary:
        return keep, []
    # chain boundary edges into loop(s); keep the largest loop
    adj = {}
    for a, b in boundary:
        adj.setdefault(a, []).append(b)
        adj.setdefault(b, []).append(a)
    loops, seen = [], set()
    for start in adj:
        if start in seen:
            continue
        loop, prev, cur = [], None, start
        while cur not in seen:
            seen.add(cur); loop.append(cur)
            nxt = [x for x in adj[cur] if x != prev]
            if not nxt:
                break
            prev, cur = cur, nxt[0]
        loops.append(loop)
    loop = max(loops, key=len)
    # order by angle around centroid in XZ
    cx = np.mean([V[i][0] for i in loop]); cz = np.mean([V[i][2] for i in loop])
    loop.sort(key=lambda i: math.atan2(V[i][2] - cz, V[i][0] - cx))
    return keep, loop


def write_obj(path, groups):
    """groups: list of (name, V, VT, N, tris) with tris local-indexed (0-based)."""
    with open(path, 'w', encoding='utf-8') as f:
        f.write('# CC0 head model derived from MakeHuman base mesh (see assets_src/makehuman/LICENSE_NOTE.txt)\n')
        vbase = 0; vtbase = 0; vnbase = 0
        for name, V, VT, N, tris in groups:
            f.write(f'o {name}\n')
            for v in V:
                f.write(f'v {v[0]:.5f} {v[1]:.5f} {v[2]:.5f}\n')
            for t in VT:
                f.write(f'vt {t[0]:.5f} {t[1]:.5f}\n')
            for n in N:
                f.write(f'vn {n[0]:.5f} {n[1]:.5f} {n[2]:.5f}\n')
            for a, b, c in tris:
                A = a + 1 + vbase; B = b + 1 + vbase; C = c + 1 + vbase
                f.write(f'f {A}/{A}/{A} {B}/{B}/{B} {C}/{C}/{C}\n')
            vbase += len(V)


def main():
    os.makedirs(OUT, exist_ok=True)
    base_v, base_vt, base_F = load_obj(os.path.join(SRC, 'base.obj'))
    base_def = deform_base(base_v)
    print('base verts', len(base_v), 'head top', base_def[:, 1].max().round(3))

    # --- skin head (cut at CUT_Y) ---
    skin_tris = to_triangles(base_F)
    kept_faces, loop = cap_from_cut(base_def, base_F, CUT_Y)
    used = sorted({i for f in kept_faces for i in f})
    remap = {old: new for new, old in enumerate(used)}
    skin_V = base_def[used]
    skin_tris_local = [[remap[a], remap[b], remap[c]] for f in kept_faces for (a, b, c) in to_triangles([f])]
    print('skin verts', len(used), 'tris', len(skin_tris_local), 'loop', len(loop))

    # --- neck cap (planar fan) ---
    cap_V, cap_VT, cap_tris, cap_N = [], [], [], []
    if loop:
        loop_pos = base_def[loop]
        cen = loop_pos.mean(axis=0)
        span = max(loop_pos[:, 0].max() - loop_pos[:, 0].min(), loop_pos[:, 2].max() - loop_pos[:, 2].min()) / 2
        center_idx = 0
        cap_V.append(cen)
        cap_VT.append([0.5, 0.5])
        for vi in loop:
            cap_V.append(base_def[vi])
            cap_VT.append([0.5 + 0.44 * (base_def[vi][0] - cen[0]) / max(span, 1e-6),
                           0.5 + 0.46 * (base_def[vi][2] - cen[2]) / max(span, 1e-6)])
        n = len(loop)
        for k in range(n):
            cap_tris.append([0, 1 + k, 1 + (k + 1) % n])
        cap_V = np.array(cap_V); cap_VT = np.array(cap_VT)
        cap_N = np.tile([0, -1.0, 0], (len(cap_V), 1))

    # --- transform into LINXI frame ---
    all_top = base_def[:, 1].max()
    s = (LINXI_TOP_Y - LINXI_NECK_Y) / (all_top - CUT_Y)
    # horizontal/depth scale so head width/depth follow the LINXI silhouette
    head_mask = base_def[:, 1] > CUT_Y + 0.5
    w_now = (base_def[head_mask, 0].max() - base_def[head_mask, 0].min()) / 2
    d_now = (base_def[head_mask, 2].max() - base_def[head_mask, 2].min()) / 2
    kx = (LINXI_HALF_W) / max(w_now * s, 1e-6)
    kz = (LINXI_HALF_D) / max(d_now * s, 1e-6)
    kx = float(np.clip(kx, 0.6, 1.1)); kz = float(np.clip(kz, 0.6, 1.1))
    cz = base_def[head_mask, 2].mean()

    def xf(P):
        Q = np.zeros_like(P)
        Q[:, 0] = P[:, 0] * s * kx
        Q[:, 1] = (P[:, 1] - CUT_Y) * s + LINXI_NECK_Y
        Q[:, 2] = (P[:, 2] - cz) * s * kz + NECK_CENTER_Z
        return Q

    print(f'scale s={s:.3f} kx={kx:.3f} kz={kz:.3f}')

    skin_Vx = xf(skin_V)
    skin_N = smooth_normals(skin_Vx, skin_tris_local)
    cap_Vx = xf(cap_V) if len(cap_V) else np.zeros((0, 3))

    # UV for skin: planar projection of the head (front view) mapped into a safe skin region
    # NOTE: MakeHuman's UV layout is not the DAZ layout; the mh skin material is untextured.
    skin_UV = np.zeros((len(used), 2))
    skin_UV[:, 0] = np.clip(0.5 + 0.42 * (skin_Vx[:, 0] / (LINXI_HALF_W)), 0, 1)
    skin_UV[:, 1] = np.clip(0.5 + 0.42 * ((skin_Vx[:, 1] - LINXI_NECK_Y) / (LINXI_TOP_Y - LINXI_NECK_Y) - 0.5), 0, 1)

    cap_N_x = cap_N if len(cap_N) else np.zeros((0, 3))

    groups = [('head_skin', skin_Vx, skin_UV, skin_N, skin_tris_local)]
    if len(cap_Vx):
        groups.append(('neck_cross_section', cap_Vx, cap_VT, cap_N_x, cap_tris))

    # --- eyebrows (fitted on deformed base) ---
    eb_V, eb_VT, eb_F = fit_proxy(os.path.join(SRC, 'eyebrows', 'eyebrow001', 'eyebrow001.mhclo'), base_def)
    eb_V = xf(eb_V)
    eb_tris = to_triangles(eb_F)
    eb_N = smooth_normals(eb_V, eb_tris)
    groups_eb = [('eyebrows', eb_V, eb_VT, eb_N, eb_tris)]

    write_obj(os.path.join(OUT, 'mh_asian_female_head.obj'), groups + groups_eb)
    print('wrote mh_asian_female_head.obj')

    for hair_name, out_name in HAIRS:
        mh = os.path.join(SRC, 'hair', hair_name, f'{hair_name}.mhclo')
        hV, hVT, hF = fit_proxy(mh, base_def)
        hV = xf(hV)
        htris = to_triangles(hF)
        hN = smooth_normals(hV, htris)
        write_obj(os.path.join(OUT, out_name), [(f'hair_{hair_name}', hV, hVT, hN, htris)])
        print('wrote', out_name, len(hV), 'verts')


if __name__ == '__main__':
    main()
