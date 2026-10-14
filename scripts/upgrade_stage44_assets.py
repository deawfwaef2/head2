#!/usr/bin/env python3
"""
Stage 44 Safe Texture-Only Upgrade:
- Starts from clean 9d4c64e baseline of `public/models/daz_asian_head_base.glb`.
- NEVER modifies any 3D vertex or morph target bufferView (preserving byteStride=8 int16 buffers 100% intact).
- Gently cleans only the baked dark eyeliner rim on the outer upper/lower eyelids (`xx_s = 1706..1732`) across the 8 skin textures.
- Softens `Image 4 (eyelash)` root alpha band so eyelashes render as fine individual strands without a black eyeliner stripe.
"""
import io
import json
import struct
import subprocess
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

GLB_PATH = Path('/home/user/public/models/daz_asian_head_base.glb')


def load_clean_baseline_glb():
    raw = subprocess.check_output(['git', 'show', '9d4c64e:public/models/daz_asian_head_base.glb'])
    magic, version, total_len = struct.unpack_from('<III', raw, 0)
    json_len, json_type = struct.unpack_from('<II', raw, 12)
    json_str = raw[20:20 + json_len].decode('utf-8')
    gltf = json.loads(json_str)
    bin_start = 20 + json_len
    bin_len, bin_type = struct.unpack_from('<II', raw, bin_start)
    bin_data = bytearray(raw[bin_start + 8:bin_start + 8 + bin_len])
    return gltf, bin_data


def save_glb(path: Path, gltf: dict, bin_data: bytearray):
    json_bytes = json.dumps(gltf, separators=(',', ':')).encode('utf-8')
    while len(json_bytes) % 4 != 0:
        json_bytes += b' '
    while len(bin_data) % 4 != 0:
        bin_data.append(0)
    total_len = 12 + 8 + len(json_bytes) + 8 + len(bin_data)
    out = bytearray()
    out += struct.pack('<III', 0x46546C67, 2, total_len)
    out += struct.pack('<II', len(json_bytes), 0x4E4F534A)
    out += json_bytes
    out += struct.pack('<II', len(bin_data), 0x004E4942)
    out += bin_data
    path.write_bytes(out)


def main():
    print('=== Stage 44 Safe Texture-Only Upgrade (100% Intact 3D Geometry & Morphs) ===')
    gltf, bin_data = load_clean_baseline_glb()
    bvs = gltf['bufferViews']
    imgs = gltf['images']
    skins_meta = gltf['extras']['realWebAssets']['skins']

    def get_img_rgb(bv_idx, size=None):
        bv = bvs[bv_idx]
        raw = bytes(bin_data[bv.get('byteOffset', 0):bv.get('byteOffset', 0) + bv['byteLength']])
        im = Image.open(io.BytesIO(raw)).convert('RGB')
        if size and im.size != size:
            im = im.resize(size, Image.Resampling.LANCZOS)
        return np.array(im, dtype=np.float32)

    RES = 1024
    s = RES / 2048.0
    yy, xx = np.mgrid[0:RES, 0:RES]
    xx_s = xx / s
    yy_s = yy / s

    # Tight outer eyelid rim mask ONLY where baked dark eyeliner pixels exist (xx_s in [1706..1732])
    # Does NOT touch the inner eye corner mucosa or eyeball!
    lid_l_dist = np.sqrt(((xx_s - 1718.0) / 14.0) ** 2 + ((yy_s - 985.0) / 28.0) ** 2)
    lid_r_dist = np.sqrt(((xx_s - 1718.0) / 14.0) ** 2 + ((yy_s - 1131.0) / 28.0) ** 2)
    lid_zone = np.clip(1.0 - np.minimum(lid_l_dist, lid_r_dist), 0.0, 1.0)
    lid_zone_smooth = gaussian_filter(lid_zone, sigma=1.8 * s)[..., None]

    skin_keys = [
        'cn_porcelain_ivory',
        'cn_scholar_natural',
        'kr_dewy_peach',
        'kr_chaebol_cool',
        'cn_jiangnan_jade',
        'kr_firstlove_camellia',
        'cn_intellectual_olive',
        'eurasian_velvet_rose',
    ]

    skin_out_bytes = {}
    for sk in skin_keys:
        im = get_img_rgb(skins_meta[sk]['bufferView'], (RES, RES))

        # Sample natural upper cheek skin tone right below the eye
        ref_patch = im[int(485 * s * 2):int(505 * s * 2), int(880 * s * 2):int(905 * s * 2)]
        clean_skin_rgb = np.percentile(ref_patch, 65, axis=(0, 1))

        # Only lift abnormally dark baked eyeliner pixels (luma < 0.85 * target_luma) inside the tight eyelid rim
        luma = 0.299 * im[..., 0] + 0.587 * im[..., 1] + 0.114 * im[..., 2]
        target_luma = 0.299 * clean_skin_rgb[0] + 0.587 * clean_skin_rgb[1] + 0.114 * clean_skin_rgb[2]
        dark_mask = np.clip((target_luma * 0.90 - luma) / max(target_luma * 0.35, 1.0), 0.0, 1.0)[..., None]

        heal_w = lid_zone_smooth * dark_mask * 0.85
        im = im * (1.0 - heal_w) + clean_skin_rgb[None, None, :] * heal_w

        im_u8 = np.clip(im, 0, 255).astype(np.uint8)
        buf = io.BytesIO()
        Image.fromarray(im_u8, mode='RGB').save(buf, format='JPEG', quality=92, optimize=True)
        skin_out_bytes[sk] = buf.getvalue()
        print(f'  Cleaned skin {sk:22s}: ({len(skin_out_bytes[sk]) // 1024} KB)')

    # Soften Image 4 (Eyelashes) root band without altering geometry
    lash_bv_idx = imgs[4]['bufferView']
    lash_bv = bvs[lash_bv_idx]
    lash_raw = bytes(bin_data[lash_bv.get('byteOffset', 0):lash_bv.get('byteOffset', 0) + lash_bv['byteLength']])
    lash_im = Image.open(io.BytesIO(lash_raw)).convert('RGBA')
    lash_arr = np.array(lash_im, dtype=np.float32)
    # Gently attenuate alpha by 0.65 so lashes are wispy and never form a thick black band
    lash_arr[..., 3] = np.clip(lash_arr[..., 3] * 0.65, 0.0, 185.0)
    lash_buf = io.BytesIO()
    Image.fromarray(lash_arr.astype(np.uint8), mode='RGBA').save(lash_buf, format='PNG', optimize=True)
    lash_out_bytes = lash_buf.getvalue()

    # Rebuild binary buffer ONLY replacing the 2D image bufferViews (leaving ALL vertex/morph bufferViews 100% untouched!)
    bv_override = {
        imgs[0]['bufferView']: skin_out_bytes['cn_porcelain_ivory'],
        lash_bv_idx: lash_out_bytes,
    }
    for sk, b_val in skin_out_bytes.items():
        bv_override[skins_meta[sk]['bufferView']] = b_val

    new_bin = bytearray()
    for idx, bv in enumerate(bvs):
        old_off = bv.get('byteOffset', 0)
        old_len = bv['byteLength']
        chunk = bv_override[idx] if idx in bv_override else bytes(bin_data[old_off:old_off + old_len])
        while len(new_bin) % 4 != 0:
            new_bin.append(0)
        bv['byteOffset'] = len(new_bin)
        bv['byteLength'] = len(chunk)
        new_bin.extend(chunk)

    gltf['buffers'][0]['byteLength'] = len(new_bin)
    save_glb(GLB_PATH, gltf, new_bin)
    print(f'=== Saved clean /home/user/public/models/daz_asian_head_base.glb ({GLB_PATH.stat().st_size / 1048576:.2f} MB) ===')


if __name__ == '__main__':
    main()
