import math
import os
from collections import Counter, defaultdict

def load_canonical_face(path):
    verts = []
    orig_uvs = []
    raw_faces = []
    with open(path) as f:
        for line in f:
            if line.startswith('v '):
                verts.append([float(x) for x in line.split()[1:4]])
            elif line.startswith('vt '):
                orig_uvs.append([float(x) for x in line.split()[1:3]])
            elif line.startswith('f '):
                pts = [[int(x)-1 for x in p.split('/')] for p in line.split()[1:]]
                raw_faces.append(pts)

    v_to_vt = {}
    for f in raw_faces:
        for vi, vti in f:
            v_to_vt[vi] = vti

    uvs = [list(orig_uvs[v_to_vt[i]]) for i in range(len(verts))]
    faces = []
    for f in raw_faces:
        vi = [p[0] for p in f]
        for i in range(1, len(vi)-1):
            faces.append((vi[0], vi[i], vi[i+1]))
    return verts, uvs, faces

def sculpt_asian_female_face(verts, uvs, preset='linxi'):
    out = []
    if preset == 'linxi': # 鹅蛋脸古典骨相
        jaw_taper = 0.83
        cheek_soft = 0.91
        chin_narrow = 0.78
        nose_narrow = 0.87
        nose_height = 0.97
        eye_scale_y = 1.12
        lip_plump = 1.10
        face_len = 0.95
    elif preset == 'suwan': # 姬发式精致V脸骨相
        jaw_taper = 0.77
        cheek_soft = 0.88
        chin_narrow = 0.72
        nose_narrow = 0.84
        nose_height = 0.99
        eye_scale_y = 1.16
        lip_plump = 1.14
        face_len = 0.93
    else: # qianxue: 清冷高智感骨相
        jaw_taper = 0.81
        cheek_soft = 0.90
        chin_narrow = 0.76
        nose_narrow = 0.85
        nose_height = 1.03
        eye_scale_y = 1.06
        lip_plump = 1.04
        face_len = 0.97

    for idx, (x, y, z) in enumerate(verts):
        u, v = uvs[idx]
        nx, ny, nz = x, y * face_len, z

        # 1. Smooth East Asian Female forehead & softer supraorbital ridge
        if ny > 2.0:
            brow_w = math.exp(-((ny - 4.1) / 2.1) ** 2) * math.exp(-(nx / 5.5) ** 2)
            nz -= 0.30 * brow_w
            if ny > 4.2:
                fore_w = ((ny - 4.2) / 4.2) * math.exp(-(nx / 6.2) ** 2)
                nz += 0.42 * fore_w

        # 2. Delicate zygomatic arch & soft anterior malar fullness
        cheek_w = math.exp(-((ny - 0.2) / 3.8) ** 2)
        if abs(nx) > 3.0:
            nx *= (1.0 - (1.0 - cheek_soft) * cheek_w)
        apple_w = math.exp(-((abs(nx) - 3.1) / 1.9) ** 2) * math.exp(-((ny - 0.1) / 2.2) ** 2)
        nz += 0.35 * apple_w

        # 3. Graceful V-line mandible & oval chin taper
        if ny < -0.8:
            t_jaw = min(1.0, (-0.8 - ny) / 8.6)
            s_jaw = t_jaw * t_jaw * (3.0 - 2.0 * t_jaw)
            taper = (1.0 - s_jaw) + s_jaw * jaw_taper
            if ny < -5.8:
                t_chin = min(1.0, (-5.8 - ny) / 3.6)
                taper *= (1.0 - t_chin * (1.0 - chin_narrow / jaw_taper))
            nx *= taper
            if abs(nx) > 2.2 and ny < -2.8:
                nz += 0.28 * s_jaw

        # 4. Refined nasal bridge & delicate nasal tip
        nose_region = math.exp(-(nx / 2.0) ** 2) * math.exp(-((ny - 0.3) / 2.9) ** 2)
        if nz > 4.4:
            nx *= (1.0 - (1.0 - nose_narrow) * nose_region)
            nz = 4.4 + (nz - 4.4) * nose_height

        # 5. Eye aperture + 3D eyeball corneal dome curvature
        for ex, eu in ((-3.18, 0.346), (3.18, 0.654)):
            dx = nx - ex
            dy = ny - 2.62 * face_len
            eye_w = math.exp(-(dx / 1.6) ** 2) * math.exp(-(dy / 1.0) ** 2)
            if eye_w > 0.05:
                outer_dir = (abs(nx) - 3.18) / 1.5
                ny += dy * (eye_scale_y - 1.0) * eye_w + 0.13 * outer_dir * eye_w
            # Corneal spherical dome inside eye opening
            du = (u - eu) / 0.062
            dv = (v - 0.622) / 0.024
            r2 = du*du + dv*dv
            if r2 < 1.0:
                nz += 0.24 * math.sqrt(max(0.0, 1.0 - r2))

        # 6. Sculpted Cupid's bow & plump vermilion lips
        lip_w = math.exp(-(nx / 2.1) ** 2) * math.exp(-((ny + 4.35 * face_len) / 1.1) ** 2)
        if nz > 4.0 and lip_w > 0.05:
            nz += 0.36 * (lip_plump - 0.95) * lip_w

        out.append([nx, ny, nz])
    return out

def subdivide_mesh(verts, uvs, faces, iterations=1):
    """
    Midpoint subdivision with feature-aware Taubin/Laplacian smoothing
    to make the head mesh ultra-smooth (~9,000 triangles).
    """
    for _ in range(iterations):
        edge_mid = {}
        new_faces = []
        for (a, b, c) in faces:
            mids = []
            for u, v in ((a, b), (b, c), (c, a)):
                key = (min(u, v), max(u, v))
                if key not in edge_mid:
                    mi = len(verts)
                    verts.append([
                        0.5 * (verts[u][0] + verts[v][0]),
                        0.5 * (verts[u][1] + verts[v][1]),
                        0.5 * (verts[u][2] + verts[v][2]),
                    ])
                    uvs.append([
                        0.5 * (uvs[u][0] + uvs[v][0]),
                        0.5 * (uvs[u][1] + uvs[v][1]),
                    ])
                    edge_mid[key] = mi
                mids.append(edge_mid[key])
            ab, bc, ca = mids
            new_faces.append((a, ab, ca))
            new_faces.append((b, bc, ab))
            new_faces.append((c, ca, bc))
            new_faces.append((ab, bc, ca))
        faces = new_faces

        # Gentle Taubin surface smoothing (lambda = +0.32, mu = -0.34) keeping boundary fixed
        edge_cnt = Counter()
        adj = defaultdict(set)
        for (a, b, c) in faces:
            for u, v in ((a,b), (b,c), (c,a)):
                edge_cnt[(min(u,v), max(u,v))] += 1
                adj[u].add(v)
                adj[v].add(u)
        boundary_v = {u for (u,v), cnt in edge_cnt.items() if cnt == 1} | {v for (u,v), cnt in edge_cnt.items() if cnt == 1}

        for factor in (0.30, -0.31):
            next_v = [list(p) for p in verts]
            for i in range(len(verts)):
                if i in boundary_v or not adj[i]:
                    continue
                nbrs = adj[i]
                inv = 1.0 / len(nbrs)
                cx = sum(verts[j][0] for j in nbrs) * inv
                cy = sum(verts[j][1] for j in nbrs) * inv
                cz = sum(verts[j][2] for j in nbrs) * inv
                next_v[i][0] += factor * (cx - verts[i][0])
                next_v[i][1] += factor * (cy - verts[i][1])
                next_v[i][2] += factor * (cz - verts[i][2])
            verts = next_v

    return verts, uvs, faces

def generate_sculpted_ears():
    e_verts = []
    e_uvs = []
    e_faces = []
    for side in (-1, 1):
        base = len(e_verts)
        rows, cols = 12, 8
        for i in range(rows + 1):
            u = i / rows # 0 (earlobe) to 1 (superior helix)
            for j in range(cols + 1):
                v = j / cols # 0 (root at temporal bone) to 1 (outer helix rim)
                arch = math.sin(math.pi * u)
                lobe = math.exp(-((u - 0.12) / 0.18) ** 2)
                ey = -1.95 + 4.35 * u + 0.35 * math.sin(math.pi * v) * (u - 0.5)
                # Natural ear outward flare (~22 deg) and rolled outer helix rim
                flare = v * (1.10 * arch + 0.32 * lobe + 0.22) - 0.24 * (v ** 3)
                concha_cup = -0.32 * math.sin(math.pi * u) * math.sin(math.pi * v)
                helix_lip = 0.22 * math.sin(math.pi * 2.0 * v) * arch
                ex = side * (7.05 + flare)
                ez = -2.15 - v * (1.55 * arch + 0.55) + concha_cup + helix_lip
                e_verts.append([ex, ey, ez])
                e_uvs.append([0.5 + side * 0.16, 0.78 + 0.05 * u])
        for i in range(rows):
            for j in range(cols):
                a = base + i * (cols + 1) + j
                b = a + 1
                c = a + (cols + 1)
                d = c + 1
                if side == 1:
                    e_faces.append((a, b, d))
                    e_faces.append((a, d, c))
                else:
                    e_faces.append((a, d, b))
                    e_faces.append((a, c, d))
    return subdivide_mesh(e_verts, e_uvs, e_faces, iterations=1)


def build_full_collectible_obj(base_verts, base_uvs, base_faces, preset, out_path):
    verts = sculpt_asian_female_face(base_verts, base_uvs, preset=preset)
    uvs = [list(u) for u in base_uvs]
    faces = list(base_faces)

    # Find ordered 36-vertex boundary loop of the face mask
    edges = Counter()
    for (a, b, c) in faces:
        for u, v in ((a,b), (b,c), (c,a)):
            edges[tuple(sorted((u,v)))] += 1
    b_adj = defaultdict(list)
    for (u,v), c in edges.items():
        if c == 1:
            b_adj[u].append(v)
            b_adj[v].append(u)

    start = 10 # forehead top center
    n0, n1 = b_adj[start]
    curr = n0 if verts[n0][0] > 0 else n1
    loop0 = [start]
    prev = start
    while curr != start:
        loop0.append(curr)
        nxt = [x for x in b_adj[curr] if x != prev][0]
        prev, curr = curr, nxt

    N = len(loop0) # 36
    num_rings = 14
    rings_v = [loop0]

    neck_y = -14.2
    neck_cz = -2.35
    neck_rx = 4.45 if preset != 'suwan' else 4.25
    neck_rz = 4.75 if preset != 'suwan' else 4.55

    for r in range(1, num_rings + 1):
        t = r / num_rings
        ring_v_idx = []
        for k in range(N):
            theta = math.pi / 2.0 - (2.0 * math.pi * k) / N
            cos_t = math.cos(theta)
            sin_t = math.sin(theta)
            x0, y0, z0 = verts[loop0[k]]

            up_w = max(0.0, sin_t)
            low_w = max(0.0, -sin_t)
            side_w = abs(cos_t)

            scm_bulge = 0.22 * (cos_t ** 2) * math.exp(-((sin_t + 0.15) / 0.5) ** 2)
            trachea_protrude = 0.20 * (low_w ** 3)
            nuchal_flat = -0.22 * (up_w ** 3)
            rad_scale = 1.0 + scm_bulge + trachea_protrude + nuchal_flat

            xn = neck_rx * rad_scale * cos_t
            zn = neck_cz - neck_rz * rad_scale * sin_t
            yn = neck_y

            y_collar = -9.5 - 0.55 * low_w + 1.0 * up_w
            r_collar_x = neck_rx * 1.04 * rad_scale
            r_collar_z = neck_rz * 1.06 * rad_scale
            x_collar = r_collar_x * cos_t
            z_collar = neck_cz - r_collar_z * sin_t

            if t <= 0.60:
                u = t / 0.60
                su = u * u * (3.0 - 2.0 * u)
                bx = (1.0 - su) * x0 + su * x_collar
                by = (1.0 - su) * y0 + su * y_collar
                bz = (1.0 - su) * z0 + su * z_collar

                crown_arch = math.sin(math.pi * u)
                occiput_arch = math.sin(math.pi * (u ** 0.85))
                by += (up_w ** 1.35) * 4.85 * math.sin(math.pi * (u ** 0.7))
                bx += cos_t * (up_w ** 0.7) * 1.32 * math.sin(math.pi * (u ** 0.75))
                bz -= (up_w ** 1.1 + 0.45 * side_w * (up_w ** 0.3)) * 5.65 * occiput_arch

                by -= (low_w ** 1.5) * 0.42 * crown_arch
                bz += (low_w ** 1.4) * 0.62 * crown_arch
                px, py, pz = bx, by, bz
            else:
                v = (t - 0.60) / 0.40
                sv = v * v * (3.0 - 2.0 * v)
                neck_waist = 1.0 - 0.045 * math.sin(math.pi * v)
                px = ((1.0 - sv) * x_collar + sv * xn) * neck_waist
                py = (1.0 - v) * y_collar + v * yn
                pz = neck_cz + (((1.0 - sv) * z_collar + sv * zn) - neck_cz) * neck_waist

            vi = len(verts)
            verts.append([px, py, pz])
            # Smooth continuation of face perimeter UV into neutral skin tone area (upper forehead skin)
            uv0 = uvs[loop0[k]]
            blend_skin = min(1.0, t * 1.8)
            u_coord = (1.0 - blend_skin) * uv0[0] + blend_skin * (0.5 + 0.14 * cos_t)
            v_coord = (1.0 - blend_skin) * uv0[1] + blend_skin * (0.83 + 0.06 * sin_t)
            uvs.append([u_coord, v_coord])
            ring_v_idx.append(vi)

        rings_v.append(ring_v_idx)

    for r in range(num_rings):
        L0_v, L1_v = rings_v[r], rings_v[r+1]
        for k in range(N):
            kn = (k + 1) % N
            u0, u1 = L0_v[k], L0_v[kn]
            w0, w1 = L1_v[k], L1_v[kn]
            faces.append((u0, u1, w1))
            faces.append((u0, w1, w0))

    # Subdivide head+cranium+neck 1 level -> ~9,000 smooth triangles!
    verts, uvs, faces = subdivide_mesh(verts, uvs, faces, iterations=1)

    # Find the subdivided bottom neck boundary loop (where Y is near neck_y = -14.2)
    edge_cnt = Counter()
    for (a, b, c) in faces:
        for u, v in ((a,b), (b,c), (c,a)):
            edge_cnt[(min(u,v), max(u,v))] += 1
    b_adj2 = defaultdict(list)
    for (u,v), cnt in edge_cnt.items():
        if cnt == 1:
            b_adj2[u].append(v)
            b_adj2[v].append(u)

    b_start = min(b_adj2.keys(), key=lambda i: abs(verts[i][0]) + (0 if verts[i][2] < neck_cz else 100))
    n0, n1 = b_adj2[b_start]
    b_curr = n0 if verts[n0][0] > 0 else n1
    neck_loop = [b_start]
    b_prev = b_start
    while b_curr != b_start:
        neck_loop.append(b_curr)
        nxt = [x for x in b_adj2[b_curr] if x != b_prev][0]
        b_prev, b_curr = b_curr, nxt

    # Build Anatomical Cross-Section Cap (g neck_cross_section) with 6 radial rings for 3D relief
    cap_verts = []
    cap_uvs = []
    cap_faces = []
    M = len(neck_loop)
    radial_rings = 6
    cap_ring_indices = []

    for r in range(radial_rings + 1):
        rho = 1.0 - (r / radial_rings) # 1.0 (outer dermis rim) down to 0.0 (center)
        ring_idx = []
        for k in range(M):
            bx, by, bz = verts[neck_loop[k]]
            px = rho * bx
            pz = neck_cz + rho * (bz - neck_cz)
            # Subtle 3D anatomical surface relief on cross-section:
            # Vertebra C4 slightly elevated (+0.08cm), vascular/tracheal lumen slightly recessed (-0.12cm)
            nx_norm = px / (neck_rx * 1.1)
            nz_norm = (pz - neck_cz) / (neck_rz * 1.1) # + is anterior (trachea), - is posterior (spine)
            # Trachea lumen depression around (0, +0.48)
            trachea_dep = -0.16 * math.exp(-((nx_norm / 0.22)**2 + ((nz_norm - 0.46) / 0.22)**2))
            # C4 vertebral body slight elevation around (0, -0.18)
            vert_elev = 0.10 * math.exp(-((nx_norm / 0.35)**2 + ((nz_norm + 0.18) / 0.28)**2))
            # Carotid sheath bilateral lumen depression around (+-0.42, +0.12)
            carotid_dep = -0.10 * (
                math.exp(-(((nx_norm - 0.42)/0.14)**2 + ((nz_norm - 0.12)/0.14)**2)) +
                math.exp(-(((nx_norm + 0.42)/0.14)**2 + ((nz_norm - 0.12)/0.14)**2))
            )
            relief = (trachea_dep + vert_elev + carotid_dep) * (1.0 - (rho ** 4))
            py = neck_y + relief

            idx_c = len(cap_verts)
            cap_verts.append([px, py, pz])
            # Planar UV in [0, 1] x [0, 1] centered at (0.5, 0.5)
            cu = 0.5 + 0.46 * (px / neck_rx)
            cv = 0.5 + 0.46 * ((pz - neck_cz) / neck_rz)
            cap_uvs.append([max(0.01, min(0.99, cu)), max(0.01, min(0.99, cv))])
            ring_idx.append(idx_c)
        cap_ring_indices.append(ring_idx)

    for r in range(radial_rings):
        R0 = cap_ring_indices[r]
        R1 = cap_ring_indices[r+1]
        for k in range(M):
            kn = (k + 1) % M
            # Downward-facing normal (0, -1, 0)
            cap_faces.append((R0[k], R1[k], R1[kn]))
            cap_faces.append((R0[k], R1[kn], R0[kn]))

    # Compute smooth vertex normals for head_skin and neck_cross_section
    def compute_normals(v_list, f_list):
        norms = [[0.0, 0.0, 0.0] for _ in v_list]
        for (a, b, c) in f_list:
            v0, v1, v2 = v_list[a], v_list[b], v_list[c]
            ux, uy, uz = v1[0]-v0[0], v1[1]-v0[1], v1[2]-v0[2]
            vx, vy, vz = v2[0]-v0[0], v2[1]-v0[1], v2[2]-v0[2]
            nx = uy*vz - uz*vy
            ny = uz*vx - ux*vz
            nz = ux*vy - uy*vx
            for idx in (a, b, c):
                norms[idx][0] += nx
                norms[idx][1] += ny
                norms[idx][2] += nz
        for n in norms:
            l = math.sqrt(n[0]*n[0] + n[1]*n[1] + n[2]*n[2]) or 1.0
            n[0] /= l; n[1] /= l; n[2] /= l
        return norms

    # Merge subdivided sculpted bilateral ears into head_skin
    ear_v, ear_uv, ear_f = generate_sculpted_ears()
    ear_off = len(verts)
    verts.extend(ear_v)
    uvs.extend(ear_uv)
    for (a, b, c) in ear_f:
        faces.append((a + ear_off, b + ear_off, c + ear_off))

    head_norms = compute_normals(verts, faces)
    cap_norms = compute_normals(cap_verts, cap_faces)

    # Write OBJ file with two groups: head_skin and neck_cross_section
    with open(out_path, 'w') as out:
        out.write(f"# CERVIX-3D Daz-Style High-Precision Asian Female Head ({preset})\n")
        out.write("o CERVIX_Collectible_Head\n")
        for v in verts:
            out.write(f"v {v[0]:.5f} {v[1]:.5f} {v[2]:.5f}\n")
        for v in cap_verts:
            out.write(f"v {v[0]:.5f} {v[1]:.5f} {v[2]:.5f}\n")
        for uv in uvs:
            out.write(f"vt {uv[0]:.5f} {uv[1]:.5f}\n")
        for uv in cap_uvs:
            out.write(f"vt {uv[0]:.5f} {uv[1]:.5f}\n")
        for n in head_norms:
            out.write(f"vn {n[0]:.5f} {n[1]:.5f} {n[2]:.5f}\n")
        for n in cap_norms:
            out.write(f"vn {n[0]:.5f} {n[1]:.5f} {n[2]:.5f}\n")

        out.write("g head_skin\nusemtl HeadSkinMaterial\n")
        for (a, b, c) in faces:
            out.write(f"f {a+1}/{a+1}/{a+1} {b+1}/{b+1}/{b+1} {c+1}/{c+1}/{c+1}\n")

        off = len(verts)
        out.write("g neck_cross_section\nusemtl NeckAnatomyMaterial\n")
        for (a, b, c) in cap_faces:
            out.write(f"f {a+off+1}/{a+off+1}/{a+off+1} {b+off+1}/{b+off+1}/{b+off+1} {c+off+1}/{c+off+1}/{c+off+1}\n")

    print(f"Saved {out_path}: head_verts={len(verts)}, head_tris={len(faces)}, cap_tris={len(cap_faces)}")

base_v, base_uv, base_f = load_canonical_face('/home/user/public/models/canonical_face_model.obj')
for preset in ('linxi', 'suwan', 'qianxue'):
    build_full_collectible_obj(
        base_v, base_uv, base_f, preset,
        f'/home/user/public/models/daz_asian_female_{preset}.obj'
    )

