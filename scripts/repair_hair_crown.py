"""One-time, idempotent repair of the photo-style crown compression.
No external assets required. Run: python scripts/repair_hair_crown.py
Preserves UV atlas, topology, morph targets and the source asset's license status.
"""
from pathlib import Path
import struct, json
import numpy as np

path = Path(__file__).resolve().parents[1] / 'public/models/hair_user_photo.glb'
data = path.read_bytes()
json_size = struct.unpack_from('<I', data, 12)[0]
gltf = json.loads(data[20:20 + json_size])
if gltf.get('extras', {}).get('crownCompressionRepaired'):
    print('Crown already repaired; no changes.')
    raise SystemExit(0)
binary = bytearray(data[28 + json_size:])

def view(index):
    a = gltf['accessors'][index]
    b = gltf['bufferViews'][a['bufferView']]
    dtype = {5126: '<f4', 5123: '<u2', 5125: '<u4'}[a['componentType']]
    count = {'VEC3': 3, 'SCALAR': 1}[a['type']]
    return np.ndarray((a['count'], count), dtype=dtype, buffer=binary,
                      offset=b.get('byteOffset', 0) + a.get('byteOffset', 0))

for mesh in gltf['meshes']:
    for primitive in mesh['primitives']:
        ai = primitive['attributes']['POSITION']
        pos = view(ai)
        # Original compiler applied y=.065+(y-.065)*.72 to bob crown vertices.
        # The merged rear bun was not compressed: restore bob vertices only.
        # Its original vertex count was 2,806 (before the rear-bun append).
        mask = (np.arange(len(pos)) < 2806) & (pos[:, 1] > .065)
        before = float(pos[:, 1].max())
        pos[mask, 1] = .065 + (pos[mask, 1] - .065) / .72
        acc = gltf['accessors'][ai]
        acc['min'] = pos.min(axis=0).tolist()
        acc['max'] = pos.max(axis=0).tolist()
        # Preserve authored card normals; inverse-transpose the Y deformation.
        normals = view(primitive['attributes']['NORMAL'])
        normals[mask, 1] *= .72
        normals[:] /= np.maximum(np.linalg.norm(normals, axis=1)[:, None], 1e-10)
        print(f'Restored {mask.sum()} crown vertices: top {before:.6f} -> {pos[:,1].max():.6f} m')

gltf.setdefault('extras', {})['crownCompressionRepaired'] = True
gltf['extras']['repairNote'] = 'Undo .72 crown height compression in first 2806 bob vertices; original UVs/morphs retained.'
json_data = json.dumps(gltf, separators=(',', ':')).encode()
json_data += b' ' * (-len(json_data) % 4)
binary += b'\0' * (-len(binary) % 4)
result = struct.pack('<4sII', b'glTF', 2, 28 + len(json_data) + len(binary))
result += struct.pack('<I4s', len(json_data), b'JSON') + json_data
result += struct.pack('<I4s', len(binary), b'BIN\0') + binary
path.write_bytes(result)
