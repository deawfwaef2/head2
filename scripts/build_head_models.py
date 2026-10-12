import math
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
    if preset == 'linxi': # 江南古典鹅蛋脸
        jaw_taper = 0.78
        cheek_soft = 0.90
        chin_narrow = 0.72
        nose_narrow = 0.80
        nose_height = 0.95
        eye_scale_x = 1.10
        eye_scale_y = 1.22
        lip_plump = 1.08
        lower_y_scale = 0.87
    elif preset == 'suwan': # 日式姬发精致V脸少女
        jaw_taper = 0.72
        cheek_soft = 0.87
        chin_narrow = 0.64
        nose_narrow = 0.76
        nose_height = 0.94
        eye_scale_x = 1.14
        eye_scale_y = 1.26
        lip_plump = 1.12
        lower_y_scale = 0.84
    else: # qianxue: 东亚清冷高智感骨相
        jaw_taper = 0.76
        cheek_soft = 0.88
        chin_narrow = 0.70
        nose_narrow = 0.78
        nose_height = 1.00
        eye_scale_x = 1.08
        eye_scale_y = 1.18
        lip_plump = 1.04
        lower_y_scale = 0.89

    for idx, (x, y, z) in enumerate(verts):
        u, v = uvs[idx]
        nx, ny, nz = x, y, z

        # 1. Natural East Asian Female vertical proportion (Gentle, linear lower-third refinement so chin stays distinct below lips!)
        if ny < 2.5:
            ny = 2.5 - (2.5 - ny) * lower_y_scale
        else:
            ny = 2.5 + (ny - 2.5) * 0.96

        # 2. Smooth feminine forehead & eliminate heavy male supraorbital ridge
        if y > 1.8:
            brow_w = math.exp(-((y - 3.8) / 2.1) ** 2) * math.exp(-(x / 5.5) ** 2)
            nz -= 0.45 * brow_w
            if y > 3.6:
                fore_w = ((y - 3.6) / 4.7) * math.exp(-(x / 6.2) ** 2)
                nz += 0.58 * fore_w
                nx *= (1.0 - 0.06 * ((y - 3.6) / 4.7))

        # 3. Smooth malar/cheek contour + soft apple cheek fullness + fill hollow buccal cheeks!
        cheek_w = math.exp(-((y - 0.2) / 3.8) ** 2)
        if abs(nx) > 2.6:
            nx *= (1.0 - (1.0 - cheek_soft) * cheek_w)
        apple_w = math.exp(-((abs(x) - 2.8) / 2.0) ** 2) * math.exp(-((y - 0.2) / 2.4) ** 2)
        nz += 0.42 * apple_w
        # Fill lateral lower cheek hollows (around |x| in 2.5..5.2, y in -5.5..-1.5) so face is smooth egg-shaped, not gaunt!
        buccal_w = math.exp(-((abs(x) - 3.6) / 1.8) ** 2) * math.exp(-((y + 3.6) / 2.4) ** 2)
        nz += 0.52 * buccal_w

        # 4. Graceful V-Line / Oval Mandible & Sculpted Chin Button
        if y < -0.5:
            t_jaw = min(1.0, (-0.5 - y) / 8.9)
            s_jaw = t_jaw * t_jaw * (3.0 - 2.0 * t_jaw)
            taper = (1.0 - s_jaw) + s_jaw * jaw_taper
            if y < -5.2:
                t_chin = min(1.0, (-5.2 - y) / 4.2)
                s_chin = t_chin * t_chin * (3.0 - 2.0 * t_chin)
                taper *= (1.0 - s_chin * (1.0 - chin_narrow / jaw_taper))
            nx *= taper
            # Project sculpted feminine chin button forward slightly at y in -8.8..-6.8
            chin_btn = math.exp(-(x / 1.9) ** 2) * math.exp(-((y + 7.9) / 1.5) ** 2)
            nz += 0.42 * chin_btn

        # 5. Delicate Nasal Bridge, Soft Radix (山根柔和过渡) & Petite Alar Base
        nose_region = math.exp(-(x / 2.1) ** 2) * math.exp(-((y - 0.2) / 3.0) ** 2)
        if z > 4.2:
            nx *= (1.0 - (1.0 - nose_narrow) * nose_region)
            nz = 4.2 + (nz - 4.2) * nose_height
        # Soften high glabella/radix between eyes (y in 1.2..3.8, |x| < 1.6) & fill medial canthus hollow
        radix_w = math.exp(-(x / 1.35) ** 2) * math.exp(-((y - 2.65) / 1.35) ** 2)
        nz -= 0.42 * radix_w
        medial_eye_fill = math.exp(-((abs(x) - 1.55) / 0.85) ** 2) * math.exp(-((y - 2.2) / 1.3) ** 2)
        nz += 0.44 * medial_eye_fill
        # Smooth out deep nasolabial / paranasal folds for youthful East Asian skin
        paranasal_w = math.exp(-((abs(x) - 1.85) / 1.25) ** 2) * math.exp(-((y + 2.2) / 2.0) ** 2)
        nz += 0.55 * paranasal_w

        # 6. Smooth Eyeball Dome & Gently Enlarged Almond Eye Contour
        for ex, eu in ((-3.18, 0.346), (3.18, 0.654)):
            dx = x - ex
            dy = y - 2.62
            eye_w = math.exp(-(dx / 1.8) ** 2) * math.exp(-(dy / 1.2) ** 2)
            if eye_w > 0.02:
                outer_dir = (abs(x) - 3.18) / 1.5
                nx += dx * (eye_scale_x - 1.0) * eye_w
                ny += dy * (eye_scale_y - 1.0) * eye_w + 0.14 * outer_dir * eye_w
            # Raise infraorbital/tear-trough hollow below eyes so eyes look youthful & smooth
            tear_w = math.exp(-(dx / 1.9) ** 2) * math.exp(-((y - 1.35) / 0.85) ** 2)
            nz += 0.36 * tear_w
            # Corneal dome
            du = (u - eu) / 0.066
            dv = (v - 0.622) / 0.026
            r2 = du*du + dv*dv
            if r2 < 1.0:
                nz += 0.28 * math.sqrt(max(0.0, 1.0 - r2))

        # 7. Petite, Softly Closed Petal Lips (消除嘴唇中间深沟与嘴角凹陷)
        mouth_w = math.exp(-(x / 2.7) ** 2) * math.exp(-((y + 4.35) / 1.4) ** 2)
        if mouth_w > 0.02:
            nx *= (1.0 - 0.16 * mouth_w)
            # In canonical_face_model, inner lip vertices (y in -4.6..-3.9) are recessed at z ~ 5.2 while vermilion is at z ~ 5.8.
            # Bring recessed inner lip line smoothly forward so lips form a soft, natural closed petal!
            inner_lip_w = math.exp(-(x / 2.2) ** 2) * math.exp(-((y + 4.25) / 0.55) ** 2)
            if z < 5.65:
                nz += (5.65 - z) * 0.72 * inner_lip_w
            nz += 0.22 * (lip_plump - 0.9) * mouth_w
        # Fill oral commissure & labiomental shadows so mouth blends seamlessly into cheeks and chin
        commissure_w = math.exp(-((abs(x) - 2.25) / 1.15) ** 2) * math.exp(-((y + 4.45) / 1.35) ** 2)
        nz += 0.58 * commissure_w

        out.append([nx, ny, nz])
    return out

def subdivide_mesh(verts, uvs, faces, protected_verts=None, iterations=1):
    if protected_verts is None:
        protected_verts = set()
    for _ in range(iterations):
        edge_mid = {}
        new_faces = []
        new_protected = set(protected_verts)
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
                    if u in protected_verts and v in protected_verts:
                        new_protected.add(mi)
                mids.append(edge_mid[key])
            ab, bc, ca = mids
            new_faces.append((a, ab, ca))
            new_faces.append((b, bc, ab))
            new_faces.append((c, ca, bc))
            new_faces.append((ab, bc, ca))
        faces = new_faces
        protected_verts = new_protected

        edge_cnt = Counter()
        adj = defaultdict(set)
        for (a, b, c) in faces:
            for u, v in ((a,b), (b,c), (c,a)):
                edge_cnt[(min(u,v), max(u,v))] += 1
                adj[u].add(v)
                adj[v].add(u)
        boundary_v = {u for (u,v), cnt in edge_cnt.items() if cnt == 1} | {v for (u,v), cnt in edge_cnt.items() if cnt == 1}

        for _pass in range(2):
            for factor in (0.34, -0.35):
                next_v = [list(p) for p in verts]
                for i in range(len(verts)):
                    if i in boundary_v or not adj[i]:
                        continue
                    w_smooth = 0.25 if i in protected_verts else 1.0
                    nbrs = adj[i]
                    inv = 1.0 / len(nbrs)
                    cx = sum(verts[j][0] for j in nbrs) * inv
                    cy = sum(verts[j][1] for j in nbrs) * inv
                    cz = sum(verts[j][2] for j in nbrs) * inv
                    next_v[i][0] += factor * w_smooth * (cx - verts[i][0])
                    next_v[i][1] += factor * w_smooth * (cy - verts[i][1])
                    next_v[i][2] += factor * w_smooth * (cz - verts[i][2])
                verts = next_v

    return verts, uvs, faces

def generate_sculpted_ears():
    e_verts, e_uvs, e_faces = [], [], []
    for side in (-1, 1):
        base = len(e_verts)
        rows, cols = 12, 8
        for i in range(rows + 1):
            u = i / rows
            for j in range(cols + 1):
                v = j / cols
                arch = math.sin(math.pi * u)
                lobe = math.exp(-((u - 0.12) / 0.18) ** 2)
                ey = -1.3 + 3.8 * u + 0.28 * math.sin(math.pi * v) * (u - 0.5)
                flare = v * (0.85 * arch + 0.24 * lobe + 0.15) - 0.18 * (v ** 3)
                concha_cup = -0.25 * math.sin(math.pi * u) * math.sin(math.pi * v)
                helix_lip = 0.16 * math.sin(math.pi * 2.0 * v) * arch
                ex = side * (6.35 + flare)
                ez = -1.95 - v * (1.25 * arch + 0.40) + concha_cup + helix_lip
                e_verts.append([ex, ey, ez])
                e_uvs.append([0.08 if side < 0 else 0.92, 0.08 + 0.04 * u])
        for i in range(rows):
            for j in range(cols):
                a = base + i * (cols + 1) + j
                b = a + 1
                c = a + (cols + 1)
                d = c + 1
                if side == 1:
                    e_faces.append((a, b, d)); e_faces.append((a, d, c))
                else:
                    e_faces.append((a, d, b)); e_faces.append((a, c, d))
    return subdivide_mesh(e_verts, e_uvs, e_faces, iterations=1)


def smooth_facial_features(verts, faces):
    from collections import defaultdict, Counter
    adj = defaultdict(set)
    edge_cnt = Counter()
    for (a, b, c) in faces:
        for u, v in ((a,b), (b,c), (c,a)):
            adj[u].add(v); adj[v].add(u)
            edge_cnt[(min(u,v), max(u,v))] += 1
    boundary = {u for (u,v), c in edge_cnt.items() if c == 1} | {v for (u,v), c in edge_cnt.items() if c == 1}

    # Apply 4 passes of gentle anatomical surface relaxation on the face mask
    # (strongest around the boxy lip borders, tear troughs, and cheek transitions, lighter on nose tip)
    for _ in range(4):
        nxt = [list(p) for p in verts]
        for i, (x, y, z) in enumerate(verts):
            if i in boundary or not adj[i]:
                continue
            # Keep nose tip (y in -1.8..0.0, |x| < 1.0, z > 6.2) crisp, smooth everything else!
            is_nose_tip = (abs(x) < 1.1 and -1.9 < y < 0.2 and z > 5.8)
            lam = 0.14 if is_nose_tip else 0.42
            nbrs = adj[i]
            inv = 1.0 / len(nbrs)
            cx = sum(verts[j][0] for j in nbrs) * inv
            cy = sum(verts[j][1] for j in nbrs) * inv
            cz = sum(verts[j][2] for j in nbrs) * inv
            nxt[i][0] += lam * (cx - x)
            nxt[i][1] += lam * (cy - y)
            nxt[i][2] += lam * (cz - z)
        verts = nxt
    return verts

def build_full_collectible_obj(base_verts, base_uvs, base_faces, preset, out_path):
    verts = sculpt_asian_female_face(base_verts, base_uvs, preset=preset)
    verts = smooth_facial_features(verts, base_faces)
    uvs = [list(u) for u in base_uvs]
    faces = list(base_faces)

    edges = Counter()
    for (a, b, c) in faces:
        for u, v in ((a,b), (b,c), (c,a)):
            edges[tuple(sorted((u,v)))] += 1
    b_adj = defaultdict(list)
    for (u,v), c in edges.items():
        if c == 1:
            b_adj[u].append(v)
            b_adj[v].append(u)

    start = 10
    n0, n1 = b_adj[start]
    curr = n0 if verts[n0][0] > 0 else n1
    loop0 = [start]
    prev = start
    while curr != start:
        loop0.append(curr)
        nxt = [x for x in b_adj[curr] if x != prev][0]
        prev, curr = curr, nxt

    N = len(loop0) # 36
    num_rings = 18
    rings_v = [loop0]

    # Protect jawline vertices (k in 11..25) and cervicomental throat ring so the jawline & under-chin shelf stay crisp!
    protected_verts = set(loop0[11:26])

    neck_y = -13.2
    neck_cz = -2.05
    neck_rx = 3.05 if preset != 'suwan' else 2.92
    neck_rz = 3.25 if preset != 'suwan' else 3.12

    # Chin bottom is at verts[loop0[18]][1] (~ -7.8)
    chin_y = verts[loop0[18]][1]

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

            scm_bulge = 0.15 * (cos_t ** 2) * math.exp(-((sin_t + 0.15) / 0.5) ** 2)
            trachea_protrude = 0.14 * (low_w ** 3)
            nuchal_flat = -0.15 * (up_w ** 3)
            rad_scale = 1.0 + scm_bulge + trachea_protrude + nuchal_flat

            xn = neck_rx * rad_scale * cos_t
            zn = neck_cz - neck_rz * rad_scale * sin_t
            yn = neck_y

            # Cervicomental Throat Junction (Hyoid / Skull Base Collar at t = 0.42):
            # Look at y_collar:
            # At the front of the throat (low_w = 1), y_collar is chin_y + 0.15 (slightly ABOVE the chin tip!),
            # and at the sides of the jaw (low_w ~ 0.5), y_collar is -7.2!
            # So from the entire jawline & chin (loop0[11..25]), the under-chin shelf goes INWARD horizontally
            # to the slender neck cylinder before the neck cylinder drops vertically!
            y_collar = (chin_y + 0.15) * (low_w ** 0.6) + (-6.8) * (1.0 - (low_w ** 0.6))
            r_collar_x = neck_rx * 0.96 * rad_scale
            r_collar_z = neck_rz * 0.98 * rad_scale
            x_collar = r_collar_x * cos_t
            z_collar = neck_cz - r_collar_z * sin_t

            if t <= 0.44:
                u = t / 0.44
                # For lower jaw/chin (low_w > 0):
                # Move horizontally inward in X and Z FIRST while keeping Y high under the mandible!
                su_xz = math.sin(u * math.pi * 0.5) # fast horizontal inward tuck
                su_y = u * u # keep Y near jaw height until close to the throat!
                su_cran = u * u * (3.0 - 2.0 * u)

                wxz = low_w * su_xz + (1.0 - low_w) * su_cran
                wy = low_w * su_y + (1.0 - low_w) * su_cran

                bx = (1.0 - wxz) * x0 + wxz * x_collar
                by = (1.0 - wy) * y0 + wy * y_collar
                bz = (1.0 - wxz) * z0 + wxz * z_collar

                # Cranial vault & occiput dome for upper/side streamlines (sin_t >= 0)
                occiput_arch = math.sin(math.pi * (u ** 0.80))
                by += (up_w ** 1.2) * 4.25 * math.sin(math.pi * (u ** 0.68))
                bx -= cos_t * (up_w ** 0.65) * 0.25 * math.sin(math.pi * (u ** 0.72))
                bz -= (up_w ** 1.05 + 0.38 * side_w * (up_w ** 0.3)) * 5.10 * occiput_arch

                # Submental upward arch right behind the chin (creates crisp shadow under the chin!)
                by += (low_w ** 1.4) * 0.42 * math.sin(math.pi * u)
                px, py, pz = bx, by, bz
            else:
                # Phase 2 (t in 0.44..1.0): Pure vertical slender female swan neck cylinder!
                v = (t - 0.44) / 0.56
                sv = v * v * (3.0 - 2.0 * v)
                neck_waist = 1.0 - 0.04 * math.sin(math.pi * v) + 0.05 * (v ** 2)
                px = ((1.0 - sv) * x_collar + sv * xn) * neck_waist
                py = (1.0 - v) * y_collar + v * yn
                pz = neck_cz + (((1.0 - sv) * z_collar + sv * zn) - neck_cz) * neck_waist

            vi = len(verts)
            verts.append([px, py, pz])
            if r in (7, 8) and low_w > 0.2:
                protected_verts.add(vi)

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

    verts, uvs, faces = subdivide_mesh(verts, uvs, faces, protected_verts=protected_verts, iterations=1)

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

    cap_verts, cap_uvs, cap_faces = [], [], []
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
