"""Restore original licensed artist detail (no synthetic strands, no mesh edits).
Downloads are deliberately NOT done by this script. Supply official hair02
archives outside the workspace. Source/licensing: ASSET_CREDITS_STAGE42.md.
Usage: python scripts/restore_artist_hair_atlases.py /tmp/hair02.zip /tmp/original-hair
"""
import hashlib, io, json, struct, sys, zipfile
from pathlib import Path
import numpy as np
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
SOURCES = [
    ('hair_user_photo', 1, 'hair/littleright_bobcut_hair/hairtex.png', 1024, 'littleright'),
    ('hair_long01', 0, 'hair/elvs_daisy_hair/daisyhair1.png', 1024, 'Elvaerwyn'),
    ('daz_hair_air_bangs_long', 0, 'hair/elvs_daisy_hair/daisyhair1.png', 1024, 'Elvaerwyn'),
]

def restore(path, source, resolution, author):
    original = path.read_bytes()
    jl = struct.unpack_from('<I', original, 12)[0]
    doc = json.loads(original[20:20+jl]); binary = original[28+jl:]
    artist = Image.open(io.BytesIO(source)).convert('RGBA')
    artist.thumbnail((resolution, resolution), Image.Resampling.LANCZOS)
    rgba = np.asarray(artist)
    # Neutral dyeable luminance, retaining artist fiber frequencies and coverage.
    lum = np.asarray(artist.convert('L'), dtype=np.float32)
    visible = rgba[:,:,3] > 128
    lo, hi = np.percentile(lum[visible], [2,98])
    value = np.clip(28 + (lum-lo)/max(hi-lo, 1)*202, 12, 245).astype(np.uint8)
    # LA PNG stores exactly the same grayscale + 8-bit alpha as RGBA, without
    # palette quantization or wasteful duplicate RGB bytes. No painted new detail.
    la = np.stack((value, rgba[:,:,3]), axis=-1)
    png = io.BytesIO(); Image.fromarray(la, mode='LA').save(png, format='PNG', optimize=True)
    image_index = doc['images'][0]['bufferView']
    new_binary = bytearray()
    for i, view in enumerate(doc['bufferViews']):
        old_offset = view.get('byteOffset',0)
        data = png.getvalue() if i == image_index else binary[old_offset:old_offset+view['byteLength']]
        while len(new_binary)%4: new_binary.append(0)
        view['byteOffset'] = len(new_binary); view['byteLength'] = len(data)
        new_binary.extend(data)
    while len(new_binary)%4: new_binary.append(0)
    doc['buffers'][0]['byteLength'] = len(new_binary)
    doc['asset']['extras'] = {'atlasAuthor': author, 'atlasLicense':'Official pack: CC0; historical mhclo header: AGPL3' if author == 'littleright' else 'CC-BY (version unspecified)',
        'sourceImageSha256': hashlib.sha256(source).hexdigest(),
        'changes':'Dye-neutral luminance levels; native coverage preserved. Geometry and UV unchanged.'}
    metadata = json.dumps(doc,separators=(',',':')).encode()
    metadata += b' ' * (-len(metadata)%4)
    output = struct.pack('<III',0x46546c67,2,28+len(metadata)+len(new_binary))
    output += struct.pack('<II',len(metadata),0x4e4f534a)+metadata
    output += struct.pack('<II',len(new_binary),0x004e4942)+new_binary
    # Assert every non-image bufferView remains byte-identical, including morphs.
    old_doc=json.loads(original[20:20+jl])
    for i, old in enumerate(old_doc['bufferViews']):
        if i == image_index: continue
        new=doc['bufferViews'][i]
        assert binary[old.get('byteOffset',0):old.get('byteOffset',0)+old['byteLength']] == new_binary[new['byteOffset']:new['byteOffset']+new['byteLength']]
    path.write_bytes(output)
    return {'asset':path.name,'resolution':artist.size,'bytes':len(output), 'sourceSha256':hashlib.sha256(source).hexdigest(),'geometryUnchanged':True}

if __name__ == '__main__':
    archives=[zipfile.ZipFile(sys.argv[1]), Path(sys.argv[2])]
    rows=[]
    for name, archive, file, res, author in SOURCES:
        rows.append(restore(ROOT/'public/models'/f'{name}.glb',(archives[archive].read(file) if archive == 0 else (archives[archive]/file).read_bytes()),res,author))
    print(json.dumps(rows,indent=2))
