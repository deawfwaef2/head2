import math
import json
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
    """
    Transforms the raw MediaPipe canonical mesh (which has a long male-like lower jaw Y=-9.4
    and small high-set eyes) into a true Daz Genesis 8.1/9 East Asian Female beauty proportion:
      - Balanced 'Three Courts & Five Eyes' (三庭五眼)
      - Compact, delicate lower face & V-line oval chin (Chin tip raised from -9.4 to -6.8)
      - Larger, expressive almond eyes (+26% aperture)
      - Soft, full apple cheeks & smooth feminine forehead dome
      - Petite, refined nasal bridge & sculpted Cupid's bow lips
    """
    out = []
    if preset == 'linxi': # 江南古典鹅蛋脸
        jaw_taper = 0.74
        cheek_soft = 0.90
        chin_narrow = 0.66
        nose_narrow = 0.80
        nose_height = 0.96
        eye_scale_x = 1.15
        eye_scale_y = 1.28
        lip_plump = 1.12
        lower_face_compact = 0.72
    elif preset == 'suwan': # 日式姬发精致V脸少女
        jaw_taper = 0.68
        cheek_soft = 0.87
        chin_narrow = 0.58
        nose_narrow = 0.76
        nose_height = 0.95
        eye_scale_x = 1.20
        eye_scale_y = 1.34
        lip_plump = 1.16
        lower_face_compact = 0.68
    else: # qianxue: 东亚清冷高智感骨相
        jaw_taper = 0.72
        cheek_soft = 0.88
        chin_narrow = 0.64
        nose_narrow = 0.78
        nose_height = 1.02
        eye_scale_x = 1.14
        eye_scale_y = 1.22
        lip_plump = 1.06
        lower_face_compact = 0.74

    for idx, (x, y, z) in enumerate(verts):
        u, v = uvs[idx]
        nx, ny, nz = x, y, z

        # 1. Re-proportion vertical 'Three Courts' (三庭比例重塑):
        # Raw mesh has eyes at Y=+2.63, nose at Y=-1.13, mouth at Y=-4.35, chin at Y=-9.40 (way too long below nose/mouth!)
        if ny < 2.0:
            # Progressively compact the mid and lower face so chin lands cleanly around Y = -6.85
            below = 2.0 - ny
            # Smooth non-linear vertical compaction of lower jaw/chin
            if ny < -2.0:
                extra = -2.0 - ny # 0 to 7.4
                ny = 2.0 - 4.0 * 0.88 - (extra ** 0.86) * lower_face_compact
            else:
                ny = 2.0 - below * 0.88
        else:
            # Slightly fuller, rounded feminine forehead & cranial dome
            ny = 2.0 + (ny - 2.0) * 0.94

        # 2. Smooth East Asian Female forehead & eliminate harsh male brow ridge
        if y > 1.8:
            brow_w = math.exp(-((y - 3.8) / 2.2) ** 2) * math.exp(-(x / 5.5) ** 2)
            nz -= 0.42 * brow_w
            if y > 3.8:
                fore_w = ((y - 3.8) / 4.5) * math.exp(-(x / 6.2) ** 2)
                nz += 0.55 * fore_w
                # Narrow upper temple width slightly for feminine egg-shaped contour
                nx *= (1.0 - 0.06 * ((y - 3.8) / 4.5))

        # 3. Feminine Cheekbone & Apple Cheek (苹果肌饱满、颧弓内收柔和)
        cheek_w = math.exp(-((y - 0.2) / 3.6) ** 2)
        if abs(nx) > 2.8:
            nx *= (1.0 - (1.0 - cheek_soft) * cheek_w)
        apple_w = math.exp(-((abs(x) - 2.85) / 1.85) ** 2) * math.exp(-((y - 0.3) / 2.1) ** 2)
        nz += 0.46 * apple_w

        # 4. Graceful V-Line Mandible & Crisp Chin Taper (彻底消除宽下颌与双下巴感)
        if y < -0.5:
            t_jaw = min(1.0, (-0.5 - y) / 8.9)
            s_jaw = t_jaw * t_jaw * (3.0 - 2.0 * t_jaw)
            taper = (1.0 - s_jaw) + s_jaw * jaw_taper
            if y < -4.8:
                t_chin = min(1.0, (-4.8 - y) / 4.6)
                s_chin = t_chin * t_chin * (3.0 - 2.0 * t_chin)
                taper *= (1.0 - s_chin * (1.0 - chin_narrow / jaw_taper))
            nx *= taper
            # Pull lateral jaw corners slightly forward/inward so jawline is crisp and sleek
            if abs(x) > 2.4 and y < -2.5:
                nz += 0.35 * s_jaw
            # Subtle feminine chin tip projection at bottom center
            chin_tip_w = math.exp(-(x / 1.8) ** 2) * math.exp(-((y + 8.8) / 1.6) ** 2)
            nz += 0.28 * chin_tip_w

        # 5. Delicate East Asian Nasal Bridge, Slimmer Alar Wings & Upturned Tip
        nose_region = math.exp(-(x / 2.2) ** 2) * math.exp(-((y - 0.3) / 3.0) ** 2)
        if z > 4.2:
            nx *= (1.0 - (1.0 - nose_narrow) * nose_region)
            nz = 4.2 + (nz - 4.2) * nose_height
        # Soften nasolabial groove next to nostrils so face looks youthful (18-22 yo)
        nasolabial_w = math.exp(-((abs(x) - 2.1) / 1.1) ** 2) * math.exp(-((y + 2.4) / 1.8) ** 2)
        nz += 0.32 * nasolabial_w

        # 6. Enlarge & Sculpt Expressive East Asian Almond Eyes + Smooth Corneal Dome
        for ex, eu in ((-3.18, 0.348), (3.18, 0.652)):
            dx = x - ex
            dy = y - 2.62
            eye_w = math.exp(-(dx / 1.85) ** 2) * math.exp(-(dy / 1.25) ** 2)
            if eye_w > 0.02:
                outer_dir = (abs(x) - 3.18) / 1.5
                nx += dx * (eye_scale_x - 1.0) * eye_w
                ny += dy * (eye_scale_y - 1.0) * eye_w + 0.16 * outer_dir * eye_w
            # Spherical 3D eyeball dome inside eye opening
            du = (u - eu) / 0.068
            dv = (v - 0.622) / 0.028
            r2 = du*du + dv*dv
            if r2 < 1.0:
                nz += 0.34 * math.sqrt(max(0.0, 1.0 - r2))

        # 7. Petite, Plump Sculpted Lips (缩短嘴宽，提升唇珠立体度，微翘嘴角)
        mouth_w = math.exp(-(x / 2.8) ** 2) * math.exp(-((y + 4.35) / 1.45) ** 2)
        if mouth_w > 0.02:
            nx *= (1.0 - 0.12 * mouth_w) # Narrower, more delicate mouth width
            if z > 3.8:
                nz += 0.42 * lip_plump * mouth_w
            # Subtle sweet corner lift (微笑唇微翘)
            corner_w = math.exp(-((abs(x) - 2.2) / 0.7) ** 2) * math.exp(-((y + 4.35) / 0.8) ** 2)
            ny += 0.18 * corner_w
            nz += 0.15 * corner_w

        out.append([nx, ny, nz])
    return out

def subdivide_mesh(verts, uvs, faces, iterations=1):
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
                    # Crucial: if u and v have distant UVs (e.g., across a seam), do not average across the face!
                    du = abs(uvs[u][0] - uvs[v][0])
                    dv = abs(uvs[u][1] - uvs[v][1])
                    if du > 0.25 or dv > 0.25:
                        uvs.append([uvs[u][0], uvs[u][1]])
                    else:
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

        # Feature-preserving Taubin smoothing (3 passes for ultra-organic skin curvature)
        edge_cnt = Counter()
        adj = defaultdict(set)
        for (a, b, c) in faces:
            for u, v in ((a,b), (b,c), (c,a)):
                edge_cnt[(min(u,v), max(u,v))] += 1
                adj[u].add(v)
                adj[v].add(u)
        boundary_v = {u for (u,v), cnt in edge_cnt.items() if cnt == 1} | {v for (u,v), cnt in edge_cnt.items() if cnt == 1}

        for _pass in range(2):
            for factor in (0.33, -0.34):
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
            u = i / rows
            for j in range(cols + 1):
                v = j / cols
                arch = math.sin(math.pi * u)
                lobe = math.exp(-((u - 0.12) / 0.18) ** 2)
                ey = -1.2 + 3.8 * u + 0.30 * math.sin(math.pi * v) * (u - 0.5)
                flare = v * (0.95 * arch + 0.28 * lobe + 0.18) - 0.20 * (v ** 3)
                concha_cup = -0.28 * math.sin(math.pi * u) * math.sin(math.pi * v)
                helix_lip = 0.18 * math.sin(math.pi * 2.0 * v) * arch
                ex = side * (6.55 + flare)
                ez = -1.95 - v * (1.35 * arch + 0.45) + concha_cup + helix_lip
                e_verts.append([ex, ey, ez])
                # Map ear UVs to pure skin region (bottom-left/right corner of skin texture, away from eyes/lips!)
                e_uvs.append([0.08 if side < 0 else 0.92, 0.08 + 0.04 * u])
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
    num_rings = 16
    rings_v = [loop0]

    # Slender, graceful East Asian female swan neck dimensions!
    # Chin tip is around Y = -6.85, Z = +4.1.
    # The neck cylinder is centered at Z = -1.85, with slender radii Rx = 3.25 cm, Rz = 3.45 cm, terminating at Y = -12.4 cm.
    neck_y = -12.4
    neck_cz = -1.85
    neck_rx = 3.25 if preset != 'suwan' else 3.08
    neck_rz = 3.45 if preset != 'suwan' else 3.28

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

            scm_bulge = 0.16 * (cos_t ** 2) * math.exp(-((sin_t + 0.15) / 0.5) ** 2)
            trachea_protrude = 0.14 * (low_w ** 3)
            nuchal_flat = -0.16 * (up_w ** 3)
            rad_scale = 1.0 + scm_bulge + trachea_protrude + nuchal_flat

            xn = neck_rx * rad_scale * cos_t
            zn = neck_cz - neck_rz * rad_scale * sin_t
            yn = neck_y

            # Tight, crisp submental tuck (颌下三角紧致内收) at the cervicomental junction (Y_collar):
            # Notice y_collar at front (low_w=1) is -7.15 (just 0.3cm below the chin tip -6.85!),
            # so the under-chin goes almost horizontally backward from Z=+4.1 to Z=+1.55 with ZERO double-chin!
            y_collar = -6.85 - 0.32 * low_w + 0.45 * up_w
            r_collar_x = neck_rx * 0.98 * rad_scale
            r_collar_z = neck_rz * 1.00 * rad_scale
            x_collar = r_collar_x * cos_t
            z_collar = neck_cz - r_collar_z * sin_t

            if t <= 0.55:
                u = t / 0.55
                # Fast inward tuck for lower jaw/chin so jawline is sharp and never droops!
                su_jaw = 1.0 - ((1.0 - u) ** 2.2)
                su_cranium = u * u * (3.0 - 2.0 * u)
                su = low_w * su_jaw + (1.0 - low_w) * su_cranium

                bx = (1.0 - su) * x0 + su * x_collar
                by = (1.0 - su) * y0 + su * y_collar
                bz = (1.0 - su) * z0 + su * z_collar

                # Cranial vault & occiput dome for upper/side streamlines
                occiput_arch = math.sin(math.pi * (u ** 0.82))
                by += (up_w ** 1.25) * 4.55 * math.sin(math.pi * (u ** 0.68))
                bx += cos_t * (up_w ** 0.65) * 1.05 * math.sin(math.pi * (u ** 0.75))
                bz -= (up_w ** 1.05 + 0.42 * side_w * (up_w ** 0.3)) * 5.25 * occiput_arch

                # Submental upward/inward tightness under the mandible (eliminates any double chin!)
                by += (low_w ** 1.6) * 0.28 * math.sin(math.pi * u)
                px, py, pz = bx, by, bz
            else:
                v = (t - 0.55) / 0.45
                sv = v * v * (3.0 - 2.0 * v)
                # Graceful slender swan-neck curve (slight waisting in mid-neck, gentle flare at base)
                neck_waist = 1.0 - 0.05 * math.sin(math.pi * v) + 0.04 * (v ** 2)
                px = ((1.0 - sv) * x_collar + sv * xn) * neck_waist
                py = (1.0 - v) * y_collar + v * yn
                pz = neck_cz + (((1.0 - sv) * z_collar + sv * zn) - neck_cz) * neck_waist

            vi = len(verts)
            verts.append([px, py, pz])

            # CRITICAL UV FIX:
            # Never cross the center of the face UV! Keep boundary/neck/cranium UVs radially outside the face oval
            # in the pure porcelain skin margin of the texture map!
            uv0 = uvs[loop0[k]]
            margin_push = min(1.0, t * 1.5)
            target_u = 0.5 + 0.44 * cos_t
            target_v = 0.5 + 0.46 * sin_t
            u_coord = (1.0 - margin_push) * uv0[0] + margin_push * target_u
            v_coord = (1.0 - margin_push) * uv0[1] + margin_push * target_v
            uvs.append([max(0.01, min(0.99, u_coord)), max(0.01, min(0.99, v_coord))])
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

    # Subdivide head+cranium+neck 1 level with multi-pass Taubin smoothing
    verts, uvs, faces = subdivide_mesh(verts, uvs, faces, iterations=1)

    # Find the subdivided bottom neck boundary loop
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

    # Build Anatomical Cross-Section Cap (g neck_cross_section)
    cap_verts = []
    cap_uvs = []
    cap_faces = []
    M = len(neck_loop)
    radial_rings = 6
    cap_ring_indices = []

    for r in range(radial_rings + 1):
        rho = 1.0 - (r / radial_rings)
        ring_idx = []
        for k in range(M):
            bx, by, bz = verts[neck_loop[k]]
            px = rho * bx
            pz = neck_cz + rho * (bz - neck_cz)
            nx_norm = px / (neck_rx * 1.05)
            nz_norm = (pz - neck_cz) / (neck_rz * 1.05)
            trachea_dep = -0.14 * math.exp(-((nx_norm / 0.22)**2 + ((nz_norm - 0.46) / 0.22)**2))
            vert_elev = 0.09 * math.exp(-((nx_norm / 0.35)**2 + ((nz_norm + 0.18) / 0.28)**2))
            carotid_dep = -0.09 * (
                math.exp(-(((nx_norm - 0.42)/0.14)**2 + ((nz_norm - 0.12)/0.14)**2)) +
                math.exp(-(((nx_norm + 0.42)/0.14)**2 + ((nz_norm - 0.12)/0.14)**2))
            )
            relief = (trachea_dep + vert_elev + carotid_dep) * (1.0 - (rho ** 4))
            py = neck_y + relief

            idx_c = len(cap_verts)
            cap_verts.append([px, py, pz])
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
            cap_faces.append((R0[k], R1[k], R1[kn]))
            cap_faces.append((R0[k], R1[kn], R0[kn]))

    # Merge subdivided sculpted bilateral ears into head_skin
    ear_v, ear_uv, ear_f = generate_sculpted_ears()
    ear_off = len(verts)
    verts.extend(ear_v)
    uvs.extend(ear_uv)
    for (a, b, c) in ear_f:
        faces.append((a + ear_off, b + ear_off, c + ear_off))

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

    head_norms = compute_normals(verts, faces)
    cap_norms = compute_normals(cap_verts, cap_faces)

    with open(out_path, 'w') as out:
        out.write(f"# CERVIX-3D Daz-Style High-Precision Asian Female Head ({preset})\n")
        out.write("o CERVIX_Collectible_Head\n")
        for v in verts:
            out.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        for v in cap_verts:
            out.write(f"v {v[0]:.4f} {v[1]:.4f} {v[2]:.4f}\n")
        for uv in uvs:
            out.write(f"vt {uv[0]:.4f} {uv[1]:.4f}\n")
        for uv in cap_uvs:
            out.write(f"vt {uv[0]:.4f} {uv[1]:.4f}\n")
        for n in head_norms:
            out.write(f"vn {n[0]:.4f} {n[1]:.4f} {n[2]:.4f}\n")
        for n in cap_norms:
            out.write(f"vn {n[0]:.4f} {n[1]:.4f} {n[2]:.4f}\n")

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
