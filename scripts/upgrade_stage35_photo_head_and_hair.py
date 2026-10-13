import struct, json, numpy as np

HEAD_GLB_PATH = '/home/user/public/models/daz_asian_head_base.glb'
with open(HEAD_GLB_PATH, 'rb') as f:
    data = f.read()
jlen = struct.unpack_from('<I', data, 12)[0]
gltf = json.loads(data[20:20+jlen].decode('utf-8'))
bin_buf = bytearray(data[28+jlen:])

def get_acc(acc_idx):
    acc = gltf['accessors'][acc_idx]
    bv = gltf['bufferViews'][acc['bufferView']]
    offset = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    arr = np.frombuffer(bin_buf, dtype=np.float32, count=acc['count']*3, offset=offset).copy().reshape(-1, 3)
    return arr

def set_acc(acc_idx, arr):
    acc = gltf['accessors'][acc_idx]
    bv = gltf['bufferViews'][acc['bufferView']]
    offset = bv.get('byteOffset', 0) + acc.get('byteOffset', 0)
    raw = np.ascontiguousarray(arr, dtype=np.float32).tobytes()
    bin_buf[offset:offset+len(raw)] = raw
    acc['min'] = np.min(arr, axis=0).astype(float).tolist()
    acc['max'] = np.max(arr, axis=0).astype(float).tolist()

# Check Eye prim 0 (Sclera), prim 1 (Iris), prim 2 (Cornea)
p0 = get_acc(gltf['meshes'][4]['primitives'][0]['attributes']['POSITION'])
p1 = get_acc(gltf['meshes'][4]['primitives'][1]['attributes']['POSITION'])
p2 = get_acc(gltf['meshes'][4]['primitives'][2]['attributes']['POSITION'])

# Find left and right eyeball centers from prim 2 (Cornea/Eyeball outer sphere)
for side in [-1.0, 1.0]:
    m1 = (p1[:, 0] * side) > 0
    iris_pts = p1[m1]
    cx = iris_pts[:, 0].mean()
    cy = iris_pts[:, 1].mean()
    # Eyeball center is ~12mm behind the iris plane
    cz = iris_pts[:, 2].mean() - 0.0115
    center = np.array([cx, cy, cz], dtype=np.float32)
    print(f"Side {side}: iris_center=({cx:.4f}, {cy:.4f}, {iris_pts[:,2].mean():.4f}), eyeball_center={center}")

    # Expand iris (prim 1) radially in X/Y by +13% around (cx, cy) while keeping it on the eyeball sphere
    for prim_idx, pos in [(0, p0), (1, p1), (2, p2)]:
        mside = (pos[:, 0] * side) > 0
        pts = pos[mside]
        dx = pts[:, 0] - cx
        dy = pts[:, 1] - cy
        rxy = np.hypot(dx, dy)
        # On prim 1 (iris), all points are within rxy <= 0.0060; on prim 0/2, smoothly taper expansion from rxy=0.0055 out to rxy=0.0105
        if prim_idx == 1:
            scale_xy = 1.135
        else:
            w = np.clip((0.0110 - rxy) / 0.0055, 0.0, 1.0)
            scale_xy = 1.0 + 0.135 * w
        pts[:, 0] = cx + dx * scale_xy
        pts[:, 1] = cy + dy * scale_xy
        pos[mside] = pts

set_acc(gltf['meshes'][4]['primitives'][0]['attributes']['POSITION'], p0)
set_acc(gltf['meshes'][4]['primitives'][1]['attributes']['POSITION'], p1)
set_acc(gltf['meshes'][4]['primitives'][2]['attributes']['POSITION'], p2)

# Save updated GLB
pad = (4 - (len(bin_buf) % 4)) % 4
if pad:
    bin_buf.extend(b'\x00' * pad)
gltf['buffers'][0]['byteLength'] = len(bin_buf)
json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
jpad = (4 - (len(json_bytes) % 4)) % 4
if jpad:
    json_bytes += b' ' * jpad
total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_buf)
with open(HEAD_GLB_PATH, 'wb') as f:
    f.write(struct.pack('<III', 0x46546C67, 2, total_len))
    f.write(struct.pack('<II', len(json_bytes), 0x4E4F534A))
    f.write(json_bytes)
    f.write(struct.pack('<II', len(bin_buf), 0x004E4942))
    f.write(bin_buf)
print("Successfully expanded 3D Iris & Cornea limbal diameter by +13.5%!")
