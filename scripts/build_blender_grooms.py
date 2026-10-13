"""Create editable Blender Hair Curves + compact strand data, without old hair cards.
Run: blender -b --factory-startup --python scripts/build_blender_grooms.py
Source scalp is the repository head mesh. Styles are hand-authored guide fields,
not a photograph reconstruction or a claim of artist-approved/scan-level quality.
The .blend uses Cycles Principled Hair BSDF; browser uses tapered strand geometry.
"""
import bpy, math, json, struct, random, os
from pathlib import Path
import numpy as np
from mathutils import Vector
from mathutils.bvhtree import BVHTree

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/grooms'
OUT.mkdir(parents=True, exist_ok=True)
COUNT = int(os.environ.get('GROOM_COUNT', '12000'))
SAMPLES = 36
STYLES = os.environ.get('GROOM_STYLES', 'photo_tied,center_long,low_chignon').split(',')
CENTER = Vector((0, .028, -.014))

# Read raw Y-up scalp mesh so groom coordinates match the existing browser head.
raw = (ROOT / 'public/models/daz_asian_head_base.glb').read_bytes()
jlen = struct.unpack_from('<I', raw, 12)[0]
gltf = json.loads(raw[20:20+jlen]); binary = raw[28+jlen:]
def accessor(i):
    a = gltf['accessors'][i]; v = gltf['bufferViews'][a['bufferView']]
    dtype = {5126:'<f4',5123:'<u2',5125:'<u4',5122:'<i2'}[a['componentType']]
    channels = {'VEC3':3,'VEC2':2,'SCALAR':1}[a['type']]
    return np.frombuffer(binary,dtype=dtype,count=a['count']*channels,
        offset=v.get('byteOffset',0)+a.get('byteOffset',0)).reshape(a['count'],channels)
prim = gltf['meshes'][0]['primitives'][0]
head_pos = accessor(prim['attributes']['POSITION'])
tri = accessor(prim['indices']).reshape(-1,3)
bvh = BVHTree.FromPolygons([Vector(p) for p in head_pos],tri.tolist(),all_triangles=True)

def direction(theta, phi):
    return Vector((math.sin(theta)*math.sin(phi),math.cos(theta),math.sin(theta)*math.cos(phi)))
def scalp(theta, phi, clearance=.002):
    ray = direction(theta,phi)
    hit, normal, idx, distance = bvh.ray_cast(CENTER,ray,.3)
    if hit is None:
        return CENTER + ray * .09, ray
    return hit + normal * clearance, normal

def outside(point, clearance=.0012):
    ray = point-CENTER
    r = ray.length
    if r < .001: return point
    ray.normalize()
    hit,n,idx,d = bvh.ray_cast(CENTER,ray,.3)
    if hit is not None and r < d + clearance:
        return hit + n * clearance
    return point

def blend(a,b,t):
    return a*(1-t)+b*t

def smooth(t):
    t=max(0,min(1,t));return t*t*(3-2*t)

def bezier(a,b,c,d,t):
    u=1-t;return a*u*u*u+b*3*u*u*t+c*3*u*t*t+d*t*t*t

def to_blender(p):
    return (p[0],-p[2],p[1])

# Each family has a continuous field of guide curves, with coherent clumping,
# controlled root clearance, longitudinal variation and independent flyaways.
def make_strand(style, rng, i):
    phi = rng.uniform(-math.pi,math.pi)
    front = max(0,math.cos(phi))
    theta_edge = 1.80 - .65*front + .10*max(0,-math.cos(phi))
    theta0 = math.acos(1-rng.random()*(1-math.cos(theta_edge*.96)))
    root, root_normal = scalp(theta0,phi,.00025)
    radius = rng.uniform(.000025,.000043)
    pigment = rng.randrange(45,235)
    fly = rng.random() < .035
    fly_height = rng.uniform(.0015,.0035)
    group = 0
    # Preserve scalp direction by following a full curve, not isolated polygons.
    sector = round(phi/.105)*.105
    sector_offset = .012*math.sin(sector*19+.7)
    wave_phase = rng.uniform(0,math.tau)
    start_phase = rng.uniform(0,math.tau)
    theta1 = max(theta0+.12,theta_edge)
    theta1 = min(theta1,2.02)
    scalp_end,_ = scalp(theta1,phi,.0038)
    side = -1 if phi < 0 else 1
    if style == 'photo_tied':
        fringe = abs(phi) < 1.06
        wisps = 1.04 < abs(phi) < 1.85 and rng.random() < .16
        group = 1 if fringe else (2 if wisps else 0)
        if fringe:
            theta1 = max(theta0+.09,1.42+rng.uniform(-.09,.10))
            phi_tip = phi*.84 + sector_offset + .025*math.sin(phi*5)
            end,n = scalp(theta1,phi_tip,.002)
            # Irregular, curved, feathered tips rather than a zig-zag solid edge.
            end.y = rng.uniform(.025,.041) + .007*(abs(phi)/1.06)**2
            end.z += .0008
            end = outside(end,.0018)
        elif wisps:
            end = outside(Vector((side*rng.uniform(.055,.067),rng.uniform(-.058,-.012),rng.uniform(.047,.071))),.002)
        else:
            end = Vector((rng.uniform(-.012,.012),rng.uniform(-.020,.008),rng.uniform(-.121,-.106)))
    elif style == 'center_long':
        group = 0
        # A center part: paths sweep away from the sagittal seam, then fall behind
        # the cheek plane. The front center remains open for facial inspection.
        end = Vector((side*rng.uniform(.064,.089),rng.uniform(-.23,-.17),rng.uniform(-.074,.031)))
    else: # low_chignon
        group = 0
        end = Vector((rng.uniform(-.014,.014),rng.uniform(-.043,-.016),rng.uniform(-.132,-.111)))
        if 1.0 < abs(phi) < 1.65 and rng.random()<.09:
            group=2
            end=outside(Vector((side*rng.uniform(.057,.068),rng.uniform(-.054,-.014),.054)),.002)
    if fly:
        group=3
        radius *= .55
    points=[]
    for j in range(SAMPLES):
        t=j/(SAMPLES-1)
        if style=='photo_tied' and group==1:
            theta=theta0+(theta1-theta0)*t
            ph=phi*(1-.16*smooth(t)) + sector_offset*math.sin(math.pi*t)
            volume=.0003 + .0048*math.sin(math.pi*t*.88)**.9
            p,n=scalp(theta,ph,volume)
            p=blend(p,end,smooth((t-.67)/.33))
        elif group==2:
            p,n=scalp(theta0+(theta1-theta0)*min(t/.60,1),phi,.001+ .005*math.sin(math.pi*min(t/.7,1)))
            p=blend(p,end,smooth((t-.43)/.57))
        elif style=='center_long':
            # Flow away from the central part with a soft C-shaped outer curtain.
            ph=phi + side*.22*smooth(t/.6)*max(0,math.cos(phi))
            p,n=scalp(theta0+(theta1-theta0)*min(t/.49,1),ph,.0005+.0055*math.sin(math.pi*min(t/.65,1)))
            p=blend(p,end,smooth((t-.38)/.62))
            p.x += side*.005*math.sin(t*math.pi*2.2+sector*1.4)*smooth((t-.38)/.5)
        else:
            # Swept side/back hair feeds a small, coherent twisted bun.
            ph=phi + side*(math.pi-abs(phi))*.75*smooth(t/.76)
            p,n=scalp(theta0+(theta1-theta0)*min(t/.7,1),ph,.0004+.004*math.sin(math.pi*t))
            p=blend(p,end,smooth((t-.60)/.40))
            if t>.79:
                spiral=(t-.79)/.21*math.pi*1.5 + start_phase
                r=.012*math.sin(math.pi*(t-.79)/.21)
                p.x += r*math.cos(spiral)
                p.y += r*.70*math.sin(spiral)
        # Small correlated strand variations stay subordinate to the guide flow.
        envelope=math.sin(math.pi*t)
        p.x += .00036*math.sin(t*7+wave_phase)*envelope
        p.z += .00025*math.cos(t*9+wave_phase)*envelope
        if fly:
            p += n * (fly_height*envelope)
            p.x += .0015*math.sin(t*9+start_phase)*envelope
        # Ray collision against the actual scalp, not a guessed spherical shell.
        p=outside(p,.00025 if t<.03 else .0011)
        points.append(tuple(p))
    points[0]=tuple(root)
    return points,radius,group,pigment

bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'public/models/daz_asian_head_base.glb'))
head = next(o for o in bpy.context.scene.objects if o.name.startswith('HeadSkin'))
head.name='REFERENCE_HEAD_do_not_replace'
# This source project retains its reference model. Only groom data is new work.
mat=bpy.data.materials.new('Cycles_Melanin_Black_Hair');mat.use_nodes=True
nodes=mat.node_tree.nodes;nodes.clear()
h=nodes.new('ShaderNodeBsdfHairPrincipled');h.parametrization='MELANIN'
h.inputs['Melanin'].default_value=.93;h.inputs['Melanin Redness'].default_value=.12
h.inputs['Roughness'].default_value=.32;h.inputs['Radial Roughness'].default_value=.44
h.inputs['Random Color'].default_value=.12;h.inputs['Random Roughness'].default_value=.07
out=nodes.new('ShaderNodeOutputMaterial');mat.node_tree.links.new(h.outputs[0],out.inputs['Surface'])

all_metadata=[]
for style in STYLES:
    rng=random.Random(124093+STYLES.index(style)*992)
    positions=[];radii=[];groups=[];pigments=[]
    for i in range(COUNT):
        p,r,g,c=make_strand(style,rng,i)
        positions.append(p);radii.append(r);groups.append(g);pigments.append(c)
    pos=np.asarray(positions,dtype=np.float32)
    radii=np.asarray(radii,dtype=np.float32)
    lo=pos.min(axis=(0,1));hi=pos.max(axis=(0,1))
    quant=np.round((pos-lo)/(hi-lo)*65535).astype('<u2')
    records=np.zeros(COUNT,dtype=np.dtype([('radius','<f4'),('group','u1'),('pigment','u1'),('flags','<u2')]))
    records['radius']=radii;records['group']=groups;records['pigment']=pigments
    # The binary preserves all 12,000 curves; the browser derives explicit LODs.
    header=struct.pack('<8sII6f',b'H2GRM002',COUNT,SAMPLES,*lo,*hi)
    delta=quant.astype(np.int32)
    delta[:,1:,:] -= quant[:,:-1,:].astype(np.int32)
    planes=delta.astype('<i2').transpose(2,0,1).copy().view(np.uint8).reshape(-1,2)
    encoded=planes[:,0].tobytes()+planes[:,1].tobytes()
    (OUT/(style+'.groom')).write_bytes(header+records.tobytes()+encoded)
    collection=bpy.data.collections.new('GROOM_'+style);bpy.context.scene.collection.children.link(collection)
    group_names={0:'Scalp_Flow',1:'Feathered_Fringe',2:'Temple_Wisps',3:'Fine_Flyaways'}
    for group_id,label in group_names.items():
        mask=np.asarray(groups)==group_id
        if not mask.any():continue
        data=bpy.data.hair_curves.new(style+'_'+label)
        data.add_curves([SAMPLES]*int(mask.sum()))
        selected=pos[mask].copy(); xyz=np.stack([selected[:,:,0],-selected[:,:,2],selected[:,:,1]],axis=-1)
        data.attributes['position'].data.foreach_set('vector',xyz.ravel())
        radius_attr=data.attributes.new('radius','FLOAT','POINT')
        taper=(.98*(1-np.linspace(0,1,SAMPLES))**.32+.02)
        rr=(radii[mask,None]*taper).astype(np.float32)
        radius_attr.data.foreach_set('value',rr.ravel())
        data.attributes.new('curve_type','INT8','CURVE').data.foreach_set('value',np.zeros(int(mask.sum()),dtype=np.int32))
        data.materials.append(mat)
        obj=bpy.data.objects.new(style+'_'+label,data);collection.objects.link(obj)
        obj.hide_render=style!=STYLES[0];obj.hide_set(style!=STYLES[0])
        obj['source']='Original guide-field groom, authored for this project; not photo reconstruction.'
        obj['family']=label;obj['strand_count']=int(mask.sum())
    meta={'id':style,'curves':COUNT,'pointsPerCurve':SAMPLES,'groups':{group_names[g]:int(np.count_nonzero(np.asarray(groups)==g)) for g in group_names},'bounds':[lo.tolist(),hi.tolist()], 'coordinateSystem':'Y-up meters','origin':'Original authored guide fields fitted to repository head; photographic style reference only.', 'sourceImage':'public/models/user_photo_ref.jpg','license':'New groom curves CC0; bundled reference head has separate, unresolved upstream license.'}
    (OUT/(style+'.json')).write_text(json.dumps(meta,ensure_ascii=False,indent=2))
    all_metadata.append(meta)
    print('GROOM_BUILT',style,meta['groups'],flush=True)

# Studio camera and Cycles scene are saved so the source is genuinely inspectable.
def aim(obj, target):
    obj.rotation_euler=(Vector(target)-obj.location).to_track_quat('-Z','Y').to_euler()
def area(name,loc,energy,size,color):
    d=bpy.data.lights.new(name,'AREA');d.energy=energy;d.shape='DISK';d.size=size;d.color=color
    o=bpy.data.objects.new(name,d);bpy.context.scene.collection.objects.link(o);o.location=loc;aim(o,(0,0,.025))
area('Soft_Key',(.28,-.40,.42),15,.30,(1,.91,.82))
area('Soft_Fill',(-.3,-.18,.15),5,.26,(.78,.86,1))
area('Hair_Rim',(.18,.28,.35),18,.20,(.85,.91,1))
camera_data=bpy.data.cameras.new('Groom_Review_Camera');camera=bpy.data.objects.new('Groom_Review_Camera',camera_data)
bpy.context.scene.collection.objects.link(camera);camera.location=(.14,-.53,.10);aim(camera,(0,0,.015))
camera_data.type='ORTHO';camera_data.ortho_scale=.35;bpy.context.scene.camera=camera
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=32
scene.cycles.use_denoising=False;scene.render.resolution_x=900;scene.render.resolution_y=1000;scene.render.resolution_percentage=100
scene.world.color=(.08,.08,.08);scene.render.film_transparent=True
scene.view_settings.view_transform='AgX'
# Pack reference textures, not user-entered secrets or private imported models.
bpy.ops.file.pack_all()
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'Chinese_Grooms_Source.blend'),compress=True)
print('SAVED_SOURCE',OUT/'Chinese_Grooms_Source.blend',flush=True)
if os.environ.get('GROOM_RENDER')=='1':
    scene.render.filepath=str(ROOT/'groom-cycles-review.png');bpy.ops.render.render(write_still=True)
