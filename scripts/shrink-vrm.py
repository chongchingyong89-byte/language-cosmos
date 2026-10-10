"""Shrink a VRM/GLB by downscaling selected textures (no other changes).

Usage: python scripts/shrink-vrm.py in.vrm out.vrm
- normal maps (*_nml) larger than 1024 px are halved
- the embedded thumbnail is reduced to 128 px (only avatar pickers use it)
Meshes, materials, bones and VRM metadata are copied byte-for-byte.
The pixiv sample's VRM Public License allows modification.
"""
import io
import json
import struct
import sys

from PIL import Image


def shrink(name, data):
    pic = Image.open(io.BytesIO(data))
    if name == 'Thumbnail':
        pic = pic.resize((128, 128), Image.LANCZOS)
    elif name.endswith('_nml') and max(pic.size) > 1024:
        pic = pic.resize((pic.width // 2, pic.height // 2), Image.LANCZOS)
    else:
        return data
    out = io.BytesIO()
    pic.save(out, format='PNG', optimize=True)
    return out.getvalue()


def main(src, dst):
    b = open(src, 'rb').read()
    assert b[:4] == b'glTF'
    jl = struct.unpack('<I', b[12:16])[0]
    js = json.loads(b[20:20 + jl])
    bin_start = 20 + jl + 8
    bin_len = struct.unpack('<I', b[20 + jl:24 + jl])[0]
    binary = b[bin_start:bin_start + bin_len]

    replace = {}
    for im in js['images']:
        if 'bufferView' not in im:
            continue
        v = js['bufferViews'][im['bufferView']]
        off = v.get('byteOffset', 0)
        old = binary[off:off + v['byteLength']]
        new = shrink(im.get('name', ''), old)
        if new is not old:
            replace[im['bufferView']] = new
            print(f"  {im.get('name')}: {len(old) / 1e6:.2f} MB -> {len(new) / 1e6:.2f} MB")

    # Rebuild the binary chunk, keeping 4-byte alignment between views.
    out = bytearray()
    for i, v in enumerate(js['bufferViews']):
        off = v.get('byteOffset', 0)
        data = replace.get(i, binary[off:off + v['byteLength']])
        while len(out) % 4:
            out.append(0)
        v['byteOffset'] = len(out)
        v['byteLength'] = len(data)
        out += data
    while len(out) % 4:
        out.append(0)
    js['buffers'][0]['byteLength'] = len(out)

    jbytes = json.dumps(js, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    jbytes += b' ' * ((4 - len(jbytes) % 4) % 4)
    total = 12 + 8 + len(jbytes) + 8 + len(out)
    with open(dst, 'wb') as f:
        f.write(struct.pack('<4sII', b'glTF', 2, total))
        f.write(struct.pack('<I4s', len(jbytes), b'JSON'))
        f.write(jbytes)
        f.write(struct.pack('<I4s', len(out), b'BIN\x00'))
        f.write(out)
    print(f'{len(b) / 1e6:.2f} MB -> {total / 1e6:.2f} MB')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
