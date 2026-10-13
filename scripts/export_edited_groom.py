"""Export edited native Blender Hair Curves back to the offline application.
Usage:
  blender -b public/grooms/Chinese_Grooms_Source.blend \
    --python scripts/export_edited_groom.py -- photo_tied public/grooms/photo_tied.groom
Selects named groom objects, preserves guide curves, resamples to 36 points,
converts Blender Z-up to application Y-up, then writes H2GRM002. No alpha cards.
"""
import bpy, sys, json, struct
from pathlib import Path
import numpy as np

args = sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []
if len(args) != 2:
    raise RuntimeError('Expected style name and output .groom path after --')
style, destination = args
if style not in ('photo_tied', 'center_long', 'low_chignon'):
    raise RuntimeError('Unknown groom style')
family_names = {'Scalp_Flow':0, 'Feathered_Fringe':1, 'Temple_Wisps':2, 'Fine_Flyaways':3}
samples = 36
positions, radii, families, pigments = [], [], [], []
for obj in bpy.context.scene.objects:
    if obj.type != 'CURVES' or not obj.name.startswith(style + '_'):
        continue
    family = family_names.get(obj.get('family'), 0)
    data = obj.data
    guides = min(int(obj.get('guide_count', len(data.curves))), len(data.curves))
    if obj.get('export_all_curves', False): guides = len(data.curves)
    vectors = data.attributes['position'].data
    radius_data = data.attributes.get('radius')
    for ci in range(guides):
        curve = data.curves[ci]
        start, count = curve.first_point_index, curve.points_length
        if count < 2: continue
        local = [obj.matrix_world @ vectors[start+j].vector for j in range(count)]
        xyz = np.asarray([(p.x, p.z, -p.y) for p in local], dtype=np.float64)
        old = np.linspace(0, 1, count); new = np.linspace(0, 1, samples)
        positions.append(np.stack([np.interp(new, old, xyz[:, k]) for k in range(3)], axis=-1))
        radius = radius_data.data[start].value if radius_data else .000034
        radii.append(max(.000005, min(.0002, radius)))
        families.append(family); pigments.append(70 + ci * 37 % 155)
if not positions:
    raise RuntimeError('No named native Hair Curves found; expected GROOM-style objects')
pos = np.asarray(positions, dtype=np.float32)
if not np.isfinite(pos).all(): raise RuntimeError('Non-finite curve coordinates')
n = len(pos); lo = pos.min(axis=(0,1)); hi = pos.max(axis=(0,1))
if n > 100000 or np.any(hi-lo < 1e-7): raise RuntimeError('Invalid count or bounds')
quant = np.round((pos-lo)/(hi-lo)*65535).astype('<u2')
delta = quant.astype(np.int32); delta[:,1:,:] -= quant[:,:-1,:].astype(np.int32)
planes = delta.astype('<i2').transpose(2,0,1).copy().view(np.uint8).reshape(-1,2)
records = np.zeros(n,dtype=np.dtype([('radius','<f4'),('group','u1'),('pigment','u1'),('flags','<u2')]))
records['radius'] = radii; records['group'] = families; records['pigment'] = pigments
header = struct.pack('<8sII6f',b'H2GRM002',n,samples,*lo,*hi)
out = Path(destination); out.parent.mkdir(parents=True,exist_ok=True)
out.write_bytes(header+records.tobytes()+planes[:,0].tobytes()+planes[:,1].tobytes())
out.with_suffix('.json').write_text(json.dumps({'id':style,'curves':n,'pointsPerCurve':samples,'origin':'Exported from edited native Blender Hair Curves','coordinateSystem':'Y-up meters','bounds':[lo.tolist(),hi.tolist()],'note':'Guide-only export unless export_all_curves is set; runtime may interpolate fringe children.'},ensure_ascii=False,indent=2))
print('EXPORTED_EDITED_GROOM',str(out),n,'guides',flush=True)
