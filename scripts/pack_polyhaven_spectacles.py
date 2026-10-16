#!/usr/bin/env python3
"""Bundle the CC0 Poly Haven Round Spectacles 1K glTF into a self-contained GLB.

Only the resulting 1K GLB is shipped; re-download source files from Poly Haven's
official distribution and verify the published hashes if the asset is rebuilt.
Usage: python3 scripts/pack_polyhaven_spectacles.py [--source-dir /path/to/files]
"""
import argparse
import hashlib
import json
from pathlib import Path
import struct
import urllib.request

ROOT = Path(__file__).resolve().parent.parent
URL_ROOT = "https://dl.polyhaven.org/file/ph-assets/Models/"
# Source: https://api.polyhaven.com/files/round_spectacles (1K glTF entry)
ASSETS = {
    "round_spectacles_1k.gltf": ("gltf/1k/round_spectacles/round_spectacles_1k.gltf", "86541228bc94c773570e9e21decf045e"),
    "round_spectacles.bin": ("gltf/8k/round_spectacles/round_spectacles.bin", "67e0e9c3b5664fd7b2864e26ce26fd6c"),
    "textures/round_spectacles_nor_gl_1k.jpg": ("jpg/1k/round_spectacles/round_spectacles_nor_gl_1k.jpg", "209777dc5c05d8b48cfa27abe000879d"),
    "textures/round_spectacles_diff_1k.jpg": ("jpg/1k/round_spectacles/round_spectacles_diff_1k.jpg", "2c306d4638d9b431435961f1be1d2779"),
    "textures/round_spectacles_arm_1k.jpg": ("jpg/1k/round_spectacles/round_spectacles_arm_1k.jpg", "7bfe25d8af9043b427466bfd3de389e0"),
}


def verified_asset(source_dir: Path, name: str) -> bytes:
    remote, expected_md5 = ASSETS[name]
    local = source_dir / name
    if not local.exists():
        local.parent.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(URL_ROOT + remote, timeout=90) as response:
            local.write_bytes(response.read())
    data = local.read_bytes()
    actual = hashlib.md5(data).hexdigest()  # Origin integrity check, not a security-signature.
    if actual != expected_md5:
        raise ValueError(f"{local} source MD5 mismatch: {actual} != {expected_md5}")
    return data


def pack(source_dir: Path, output: Path):
    gltf = json.loads(verified_asset(source_dir, "round_spectacles_1k.gltf"))
    binary = bytearray(verified_asset(source_dir, "round_spectacles.bin"))
    assert len(gltf["buffers"]) == 1 and gltf["buffers"][0]["uri"] == "round_spectacles.bin"
    # glTF allows more than one image to refer to the same URI; store one copy.
    locations = {}
    for image in gltf["images"]:
        name = image.pop("uri")
        if name not in locations:
            payload = verified_asset(source_dir, name)
            binary.extend(b"\0" * (-len(binary) % 4))
            location = len(gltf["bufferViews"])
            gltf["bufferViews"].append({"buffer": 0, "byteOffset": len(binary), "byteLength": len(payload)})
            binary.extend(payload)
            locations[name] = location
        image["bufferView"] = locations[name]
    gltf["buffers"][0].pop("uri")
    gltf["buffers"][0]["byteLength"] = len(binary)
    binary.extend(b"\0" * (-len(binary) % 4))
    json_bytes = json.dumps(gltf, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    json_bytes += b" " * (-len(json_bytes) % 4)
    payload_len = 12 + 8 + len(json_bytes) + 8 + len(binary)
    glb = (struct.pack("<III", 0x46546C67, 2, payload_len)
           + struct.pack("<II", len(json_bytes), 0x4E4F534A) + json_bytes
           + struct.pack("<II", len(binary), 0x004E4942) + binary)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_bytes(glb)
    print(f"{output}: {len(glb):,} bytes, sha256={hashlib.sha256(glb).hexdigest()}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source-dir", type=Path, default=Path("/var/tmp/polyhaven-round-spectacles"))
    parser.add_argument("--output", type=Path, default=ROOT / "public/models/polyhaven_round_spectacles.glb")
    args = parser.parse_args()
    pack(args.source_dir, args.output)
