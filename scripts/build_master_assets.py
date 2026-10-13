import subprocess, json, struct, io, os, glob, math
import numpy as np
from scipy.spatial import cKDTree
from scipy.ndimage import gaussian_filter
from PIL import Image, ImageFile
ImageFile.LOAD_TRUNCATED_IMAGES = True

print("=== Step 1: Restoring authentic 37f0260 MakeHuman head + upgrading photographic textures ===")
raw_head = subprocess.check_output(['git', 'show', '37f0260:public/models/daz_asian_head_base.glb'])
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

bv0 = gh['bufferViews'][gh['images'][0]['bufferView']]
im37 = np.asarray(Image.open(io.BytesIO(bh[bv0.get('byteOffset',0):bv0.get('byteOffset',0)+bv0['byteLength']])).convert('RGB').resize((2048, 2048), Image.LANCZOS), dtype=np.float32)

s_asian = np.asarray(Image.open('/tmp/mh_skins/skins_young_asian_female_young_lightskinned_female_diffuse3.png').convert('RGB'), dtype=np.float32)
s_makeup = np.asarray(Image.open('/tmp/mh_skins/skins_toigo_light_skin_with_natural_makeup_young_lightskinned_female_diffuse4.png').convert('RGB'), dtype=np.float32)
s_eurasian = np.asarray(Image.open('/tmp/mh_skins/skins_onlytheghosts_young_eurasian_female_young_eurasian_female_diffuse.png').convert('RGB'), dtype=np.float32)

photo_face = 0.45 * s_asian + 0.35 * s_makeup + 0.20 * s_eurasian
fh_mean = photo_face[1010:1105, 1615:1665].mean(axis=(0,1))
target_fh = np.array([228.0, 188.0, 168.0], dtype=np.float32)
gain = target_fh / np.maximum(fh_mean, 1.0)
photo_face = np.clip(photo_face * gain, 0, 255)

yy, xx = np.mgrid[0:2048, 0:2048].astype(np.float32)
face_oval = np.clip(1.0 - np.sqrt(((xx - 1810.0) / 185.0)**2 + ((yy - 1058.0) / 230.0)**2), 0.0, 1.0)
ear_l = np.clip(1.0 - np.sqrt(((xx - 1715.0) / 36.0)**2 + ((yy - 765.0) / 52.0)**2), 0.0, 1.0)
ear_r = np.clip(1.0 - np.sqrt(((xx - 1715.0) / 36.0)**2 + ((yy - 1350.0) / 52.0)**2), 0.0, 1.0)
keep_face = np.clip(np.maximum(face_oval > 0.05, np.maximum(ear_l > 0.05, ear_r > 0.05)).astype(np.float32), 0.0, 1.0)
keep_face = gaussian_filter(keep_face, sigma=26.0)[:, :, None]

smooth_scalp = np.ones_like(photo_face) * target_fh[None, None, :]
smooth_scalp = 0.78 * smooth_scalp + 0.22 * gaussian_filter(photo_face, sigma=(45.0, 45.0, 0.0))
head_composite = photo_face * keep_face + smooth_scalp * (1.0 - keep_face)

neck_rim_mask = ((xx < 1250) & (yy < 500)).astype(np.float32)
neck_rim_mask = gaussian_filter(neck_rim_mask, sigma=20.0)[:, :, None]
final_skin = np.clip(head_composite * (1.0 - neck_rim_mask) + im37 * neck_rim_mask, 0, 255).astype(np.uint8)

img_bv_indices = {im['bufferView']: idx for idx, im in enumerate(gh['images'])}
new_bin = bytearray()

for bv_i, old_bv in enumerate(gh['bufferViews']):
    orig_off = old_bv.get('byteOffset', 0)
    orig_len = old_bv['byteLength']
    raw_slice = bh[orig_off : orig_off + orig_len]
    if bv_i in img_bv_indices:
        im_idx = img_bv_indices[bv_i]
        bio = io.BytesIO()
        if im_idx == 0:
            Image.fromarray(final_skin).resize((1536, 1536), Image.LANCZOS).save(bio, format='PNG', optimize=True)
        elif im_idx == 2 and os.path.exists('/tmp/mpfb_img_3_brown_eye.png'):
            Image.open('/tmp/mpfb_img_3_brown_eye.png').convert('RGB').resize((1024, 1024), Image.LANCZOS).save(bio, format='PNG', optimize=True)
        elif im_idx == 3:
            arr = np.asarray(Image.open(io.BytesIO(raw_slice)).convert('RGBA')).copy()
            arr[:,:,0] = 42; arr[:,:,1] = 33; arr[:,:,2] = 30
            Image.fromarray(arr).save(bio, format='PNG', optimize=True)
            gh['materials'][3]['pbrMetallicRoughness']['baseColorFactor'] = [1.0, 1.0, 1.0, 1.0]
        elif im_idx == 4:
            arr = np.asarray(Image.open(io.BytesIO(raw_slice)).convert('RGBA')).copy()
            arr[:,:,0] = 16; arr[:,:,1] = 14; arr[:,:,2] = 16
            Image.fromarray(arr).save(bio, format='PNG', optimize=True)
            gh['materials'][4]['pbrMetallicRoughness']['baseColorFactor'] = [1.0, 1.0, 1.0, 1.0]
        else:
            bio.write(raw_slice)
        data_bytes = bio.getvalue()
    else:
        data_bytes = raw_slice
    while len(new_bin) % 4 != 0:
        new_bin.append(0)
    old_bv['byteOffset'] = len(new_bin)
    old_bv['byteLength'] = len(data_bytes)
    new_bin.extend(data_bytes)

while len(new_bin) % 4 != 0:
    new_bin.append(0)
gh['buffers'][0]['byteLength'] = len(new_bin)
jb = json.dumps(gh, separators=(',', ':')).encode('utf-8')
while len(jb) % 4 != 0:
    jb += b' '

head_out_path = '/home/user/public/models/daz_asian_head_base.glb'
with open(head_out_path, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(jb) + 8 + len(new_bin)))
    f.write(struct.pack('<II', len(jb), 0x4E4F534A))
    f.write(jb)
    f.write(struct.pack('<II', len(new_bin), 0x004E4942))
    f.write(new_bin)
print(f"Saved {head_out_path} ({os.path.getsize(head_out_path)/1024:.1f} KB)")

print("=== Step 2: Exporting 16 Master Artist 3D Hairstyles (.glb) ===")
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

selected_16 = [
    ('hair_user_photo',       'littleright_bobcut_hair',            (0.000, 0.001, 1.01, 1.00, 1.01)),
    ('hair_bob01',            'toigo_curled_under_bob_with_bangs',  (-0.001, 0.002, 1.02, 1.01, 1.02)),
    ('hair_bob02',            'toigo_inverted_bob',                 (0.000, 0.001, 1.01, 1.00, 1.01)),
    ('hair_short02',          'o4saken_chinesebob01',               (-0.001, 0.002, 1.02, 1.01, 1.02)),
    ('hair_long01',           'elvs_island_princess_hair',          (0.000, 0.001, 1.01, 1.00, 1.01)),
    ('hair_ponytail01',       'elvs_lara_hair',                     (0.000, 0.001, 1.01, 1.00, 1.01)),
    ('hair_braid01',          'elvs_reverse_french_braid_bun',      (0.000, 0.001, 1.01, 1.00, 1.01)),
    ('hair_short04',          'elvs_katherine_hair',                (0.004, 0.002, 1.02, 1.00, 1.02)),
    ('daz_hair_hime',         'cortu_straight_bangs',               (0.002, 0.000, 1.01, 1.00, 1.01)),
    ('daz_hair_curtain_wave', 'elvs_that_80s_babe_hair',            (0.000, 0.001, 1.01, 1.00, 1.01)),
    ('daz_hair_wavy_bob',     'elvs_wavy_bob',                      (0.000, 0.001, 1.01, 1.00, 1.01)),
    ('daz_hair_side_long',    'elvs_lady_hippy_hair',               (0.000, 0.001, 1.01, 1.00, 1.01)),
    ('daz_hair_hazel_wave',   'elvs_hazel_hair',                    (0.000, 0.002, 1.02, 1.00, 1.02)),
    ('daz_hair_twin_buns',    'elvs_micky_afro',                    (0.000, 0.001, 1.01, 1.00, 1.01)),
    ('daz_hair_glam_wave',    'culturalibre_hair_17',               (0.000, 0.001, 1.01, 1.00, 1.01)),
    ('daz_hair_asym_short',   'elvs_witchy_lil_bob',                (-0.001, 0.002, 1.02, 1.01, 1.02)),
]

def write_hair_glb(out_path, name, pos, norm, uv, tris, png_bytes):
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
        "asset": {"version": "2.0", "generator": "MakeHuman-Master-Hair-Pipeline"},
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
                "roughnessFactor": 0.36
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

keep_glbs = {'daz_asian_head_base.glb'}
for gid, folder_name, tune in selected_16:
    keep_glbs.add(f'{gid}.glb')
    folder = f'/tmp/mh_packs/extracted/hair/{folder_name}'
    dy, dz, sx_t, sy_t, sz_t = tune
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
    fitted_v = fitted_v + rdir * (0.0042 * mask_up)
    fitted_v = (fitted_v - hc) * np.array([sx_t, sy_t, sz_t]) + hc + np.array([0.0, dy, dz])

    uvs, faces = [], []
    for line in open(obj_p, errors='ignore'):
        l = line.strip()
        if l.startswith('vt '):
            p = l.split(); uvs.append([float(p[1]), 1.0 - float(p[2])])
        elif l.startswith('f '):
            pts = l.split()[1:]
            poly = [(int(t.split('/')[0])-1, int(t.split('/')[1])-1 if len(t.split('/'))>1 and t.split('/')[1] else 0) for t in pts]
            for k in range(1, len(poly)-1):
                faces.append((poly[0], poly[k], poly[k+1]))
    uvs = np.array(uvs, dtype=np.float32) if uvs else np.zeros((1,2), dtype=np.float32)

    v_norm_obj = np.zeros_like(fitted_v, dtype=np.float64)
    f_arr = np.array([[f[0][0], f[1][0], f[2][0]] for f in faces], dtype=np.int32)
    fn = np.cross(fitted_v[f_arr[:,1]] - fitted_v[f_arr[:,0]], fitted_v[f_arr[:,2]] - fitted_v[f_arr[:,0]])
    for k in range(3):
        np.add.at(v_norm_obj, f_arr[:, k], fn)
    n_len = np.linalg.norm(v_norm_obj, axis=1, keepdims=True)
    rad_n = (fitted_v - hc) / np.maximum(np.linalg.norm(fitted_v - hc, axis=1, keepdims=True), 1e-6)
    v_norm_obj = np.where(n_len > 1e-8, v_norm_obj / np.maximum(n_len, 1e-8), rad_n)
    v_norm_obj = 0.70 * v_norm_obj + 0.30 * rad_n
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

    im_t = Image.open(valid_tex).convert('RGBA').resize((512, 512), Image.LANCZOS)
    arr_t = np.asarray(im_t, dtype=np.float32)
    lum = 0.299 * arr_t[:,:,0] + 0.587 * arr_t[:,:,1] + 0.114 * arr_t[:,:,2]
    valid = arr_t[:,:,3] > 20
    m_l = float(lum[valid].mean()) if valid.any() else 128.0
    s_l = max(18.0, float(lum[valid].std()) if valid.any() else 32.0)
    norm_g = np.clip(188.0 + ((lum - m_l) / s_l) * 36.0, 115.0, 252.0).astype(np.uint8)
    out_rgba = np.stack([norm_g, norm_g, norm_g, arr_t[:,:,3].astype(np.uint8)], axis=-1)
    bio_t = io.BytesIO()
    # Quantize to 128-color RGBA PNG for 4x smaller GLB without quality loss
    Image.fromarray(out_rgba, mode='RGBA').quantize(colors=128, method=Image.FASTOCTREE).save(bio_t, format='PNG', optimize=True)
    png_bytes = bio_t.getvalue()

    out_glb = f'/home/user/public/models/{gid}.glb'
    write_hair_glb(out_glb, gid, pos_hr, norm_hr, uv_hr, tris_hr, png_bytes)
    print(f"Exported {out_glb}: verts={len(pos_hr)}, tris={len(tris_hr)}, size={os.path.getsize(out_glb)/1024:.1f} KB")

for p in glob.glob('/home/user/public/models/*.glb'):
    if os.path.basename(p) not in keep_glbs:
        os.remove(p)
        print("Cleaned old duplicate GLB:", p)
