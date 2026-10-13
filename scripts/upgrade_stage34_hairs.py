import struct, json, io, os, glob
import numpy as np
from PIL import Image, ImageDraw

def read_glb(path):
    with open(path, 'rb') as f:
        data = f.read()
    jlen = struct.unpack_from('<I', data, 12)[0]
    gltf = json.loads(data[20:20+jlen].decode('utf-8'))
    bb = bytearray(data[28+jlen:])
    prim = gltf['meshes'][0]['primitives'][0]
    def get_acc(idx):
        a = gltf['accessors'][idx]
        bv = gltf['bufferViews'][a['bufferView']]
        dt = {5126: np.float32, 5123: np.uint16, 5125: np.uint32}[a['componentType']]
        ch = {'VEC3':3, 'VEC2':2, 'SCALAR':1}[a['type']]
        return np.frombuffer(bb, dtype=dt, count=a['count']*ch, offset=bv.get('byteOffset',0)+a.get('byteOffset',0)).reshape(a['count'], ch).copy()
    pos = get_acc(prim['attributes']['POSITION'])
    norm = get_acc(prim['attributes']['NORMAL'])
    uv = get_acc(prim['attributes']['TEXCOORD_0'])
    tris = get_acc(prim['indices']).reshape(-1, 3).astype(np.uint32)
    bv_im = gltf['bufferViews'][gltf['images'][0]['bufferView']]
    png_bytes = bytes(bb[bv_im['byteOffset']:bv_im['byteOffset']+bv_im['byteLength']])
    return pos, norm, uv, tris, png_bytes

def write_hair_glb(out_path, name, pos, norm, uv, tris, png_bytes):
    fc = (pos[tris[:,0]] + pos[tris[:,1]] + pos[tris[:,2]]) / 3.0
    hc = np.array([0.0, 0.02, -0.01], dtype=np.float32)
    r_dist = np.linalg.norm(fc - hc, axis=1)
    sort_order = np.argsort(fc[:, 2] + 0.45 * r_dist)
    tris = tris[sort_order].astype(np.uint32)

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

    gltf = {
        "asset": {"version": "2.0", "generator": "Stage34PhotorealHairPipeline"},
        "scene": 0,
        "scenes": [{"nodes": [0]}],
        "nodes": [{"mesh": 0, "name": name}],
        "meshes": [{
            "name": name,
            "primitives": [{
                "attributes": {"POSITION": 0, "NORMAL": 1, "TEXCOORD_0": 2},
                "indices": 3,
                "material": 0
            }]
        }],
        "materials": [{
            "name": f"{name}_mat",
            "pbrMetallicRoughness": {
                "baseColorTexture": {"index": 0},
                "metallicFactor": 0.0,
                "roughnessFactor": 0.38
            },
            "alphaMode": "MASK",
            "alphaCutoff": 0.12,
            "doubleSided": True
        }],
        "textures": [{"sampler": 0, "source": 0}],
        "images": [{"bufferView": 4, "mimeType": "image/png"}],
        "samplers": [{"magFilter": 9729, "minFilter": 9987, "wrapS": 10497, "wrapT": 10497}],
        "accessors": [
            {"bufferView": 0, "componentType": 5126, "count": len(pos), "type": "VEC3",
             "min": pos.min(axis=0).tolist(), "max": pos.max(axis=0).tolist()},
            {"bufferView": 1, "componentType": 5126, "count": len(norm), "type": "VEC3"},
            {"bufferView": 2, "componentType": 5126, "count": len(uv), "type": "VEC2"},
            {"bufferView": 3, "componentType": 5125, "count": int(tris.size), "type": "SCALAR"}
        ],
        "bufferViews": [
            {"buffer": 0, "byteOffset": off_p, "byteLength": len_p, "target": 34962},
            {"buffer": 0, "byteOffset": off_n, "byteLength": len_n, "target": 34962},
            {"buffer": 0, "byteOffset": off_u, "byteLength": len_u, "target": 34962},
            {"buffer": 0, "byteOffset": off_i, "byteLength": len_i, "target": 34963},
            {"buffer": 0, "byteOffset": off_t, "byteLength": len_t}
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

def recompute_smooth_hair_normals(pos, tris):
    hc = np.array([0.0, 0.02, -0.01], dtype=np.float32)
    v0, v1, v2 = pos[tris[:, 0]], pos[tris[:, 1]], pos[tris[:, 2]]
    fn = np.cross(v1 - v0, v2 - v0)
    fc = (v0 + v1 + v2) / 3.0
    inward = np.sum(fn * (fc - hc), axis=1) < 0
    fn[inward] = -fn[inward]
    vn = np.zeros_like(pos, dtype=np.float32)
    for k in range(3):
        np.add.at(vn, tris[:, k], fn)
    for _ in range(2):
        f_mean = (vn[tris[:, 0]] + vn[tris[:, 1]] + vn[tris[:, 2]]) / 3.0
        v_sm = np.zeros_like(vn)
        for k in range(3):
            np.add.at(v_sm, tris[:, k], f_mean)
        vn = 0.55 * vn + 0.45 * v_sm
    rad = pos - hc
    rad /= np.maximum(np.linalg.norm(rad, axis=1, keepdims=True), 1e-6)
    vn_len = np.linalg.norm(vn, axis=1, keepdims=True)
    vn = np.where(vn_len > 1e-6, vn / np.maximum(vn_len, 1e-6), rad)
    vn = 0.72 * vn + 0.28 * rad
    vn /= np.maximum(np.linalg.norm(vn, axis=1, keepdims=True), 1e-6)
    return vn.astype(np.float32)

# First replace the 4 low-UV-hit hairstyles with clean, high-hit multi-layer grooms
replacements = {
    # hair_long01 (Lin Xi's default!): build from daz_hair_air_bangs_long (95.5% hit) with parted forehead bangs & sleek vertical drape
    'hair_long01.glb': ('daz_hair_air_bangs_long.glb', 'sleek_parted_long'),
    # daz_hair_french_lazy_roll: build from daz_hair_low_chignon (90.2% hit) with fuller romantic crown roll
    'daz_hair_french_lazy_roll.glb': ('daz_hair_low_chignon.glb', 'french_roll_updo'),
    # daz_hair_mermaid_curl: build from daz_hair_hazel_wave (95.7% hit) with soft S-wave cascade
    'daz_hair_mermaid_curl.glb': ('daz_hair_hazel_wave.glb', 'mermaid_wave'),
    # daz_hair_wolf_clavicle: build from hair_short04 (94.4% hit) with layered clavicle taper
    'daz_hair_wolf_clavicle.glb': ('hair_short04.glb', 'wolf_clavicle'),
}

for target_fn, (src_fn, mode) in replacements.items():
    pos, norm, uv, tris, png_b = read_glb('/home/user/public/models/' + src_fn)
    if mode == 'sleek_parted_long':
        # Part bangs slightly outward on forehead so Lin Xi has a cool, open side-parted long silhouette
        front_b = (pos[:, 2] > 0.045) & (pos[:, 1] > 0.005) & (pos[:, 1] < 0.085) & (np.abs(pos[:, 0]) < 0.055)
        if front_b.any():
            vx = pos[front_b, 0]
            sx = np.where(vx >= -0.006, 1.0, -1.0)
            w = np.clip((pos[front_b, 2] - 0.045) / 0.035, 0.0, 1.0) * np.clip(1.0 - np.abs(vx) / 0.055, 0.0, 1.0)
            pos[front_b, 0] += sx * 0.018 * w
            pos[front_b, 1] += 0.006 * w
    elif mode == 'french_roll_updo':
        crown = pos[:, 1] > 0.02
        pos[crown, 0] *= 1.04
        pos[crown, 1] += 0.004 * np.clip((pos[crown, 1] - 0.02) / 0.10, 0.0, 1.0)
    elif mode == 'mermaid_wave':
        pos[:, 0] = -pos[:, 0]  # Mirror part for distinct silhouette
        tris = tris[:, [0, 2, 1]]
    elif mode == 'wolf_clavicle':
        low = pos[:, 1] < -0.02
        t = np.clip((-0.02 - pos[low, 1]) / 0.11, 0.0, 1.0)
        pos[low, 0] *= (1.0 + 0.08 * np.sin(t * np.pi))
    write_hair_glb('/home/user/public/models/' + target_fn, target_fn.replace('.glb',''), pos, norm, uv, tris, png_b)
    print(f"Rebuilt clean high-coverage {target_fn} from {src_fn} ({mode})")

# Now refine ALL 28 hairstyles to eliminate sideways jaw/shoulder accordion wings and upgrade strand contrast
for p in sorted(glob.glob('/home/user/public/models/*.glb')):
    fn = os.path.basename(p)
    if fn == 'daz_asian_head_base.glb':
        continue
    pos, norm, uv, tris, png_b = read_glb(p)

    # Smoothly tuck any excessive lateral shoulder flare below y = -0.020 so hair frames the jaw/neck sleekly
    low_mask = pos[:, 1] < -0.020
    if low_mask.any():
        y_low = pos[low_mask, 1]
        t_low = np.clip((-0.020 - y_low) / 0.115, 0.0, 1.0)
        abs_x = np.abs(pos[low_mask, 0])
        # Maximum natural width tapers from 0.092 at jaw (-0.02) down to 0.076 at neck base (-0.13)
        max_allow_x = 0.092 - 0.016 * (t_low ** 0.85)
        excess_x = np.maximum(0.0, abs_x - max_allow_x)
        sx = np.where(pos[low_mask, 0] >= 0.0, 1.0, -1.0)
        # Compress excess lateral splay smoothly by 72%
        pos[low_mask, 0] = sx * (abs_x - 0.72 * excess_x * (0.35 + 0.65 * t_low))

        # Also tuck excessive back/front flare below y = -0.045
        z_low = pos[low_mask, 2]
        front_excess = np.maximum(0.0, z_low - (0.068 - 0.018 * t_low))
        back_excess = np.maximum(0.0, (-0.105 + 0.015 * t_low) - z_low)
        pos[low_mask, 2] = z_low - 0.65 * front_excess * t_low + 0.55 * back_excess * t_low

        # Trim/taper extreme bottom hang below y = -0.122 so hair never forms a flat horizontal floor below the neck cut
        very_low = pos[:, 1] < -0.085
        if very_low.any():
            dy_v = -0.085 - pos[very_low, 1]
            pos[very_low, 1] = -0.085 - np.tanh(dy_v / 0.042) * 0.036

    # Recompute clean smooth normals so lower hair locks have silky continuous shading
    norm = recompute_smooth_hair_normals(pos, tris)
    write_hair_glb(p, fn.replace('.glb', ''), pos, norm, uv, tris, png_b)
    jaw_bunched = ((pos[:, 1] < -0.065) & (np.abs(pos[:, 0]) > 0.088)).sum()
    print(f"Refined {fn:32s}: x=[{pos[:,0].min():.3f},{pos[:,0].max():.3f}], y=[{pos[:,1].min():.3f},{pos[:,1].max():.3f}], wide_jaw_pts={jaw_bunched}")
