// Minimal, dependency-free ZIP "store" writer for the standalone file:// build.
// Two UTF-8 entries (manifest.json and dossier.md); no network/CDN or server needed.
const utf8 = new TextEncoder();
const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c >>> 1) ^ ((c & 1) ? 0xedb88320 : 0);
  table[n] = c >>> 0;
}
function crc32(bytes) {
  let c = 0xffffffff;
  for (const b of bytes) c = table[(c ^ b) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function write16(view, off, value) { view.setUint16(off, value, true); }
function write32(view, off, value) { view.setUint32(off, value, true); }
export function createCollectibleFolderZip(folderName, manifest, dossierMd) {
  const safeFolder = String(folderName || 'collectible').replace(/[^\w\-\u4e00-\u9fff]/g, '_').slice(0, 100);
  const entries = [
    { name: `${safeFolder}/manifest.json`, data: JSON.stringify(manifest, null, 2) },
    { name: `${safeFolder}/dossier.md`, data: dossierMd || '' }
  ].map(entry => ({ name: utf8.encode(entry.name), data: utf8.encode(entry.data) }));
  const chunks = [], directory = [];
  let offset = 0;
  for (const e of entries) {
    const crc = crc32(e.data);
    const local = new Uint8Array(30 + e.name.length);
    const v = new DataView(local.buffer);
    write32(v, 0, 0x04034b50); write16(v, 4, 20);
    write16(v, 6, 0x0800); // UTF-8 names
    write32(v, 14, crc); write32(v, 18, e.data.length); write32(v, 22, e.data.length);
    write16(v, 26, e.name.length);
    local.set(e.name, 30);
    chunks.push(local, e.data);
    const central = new Uint8Array(46 + e.name.length);
    const cv = new DataView(central.buffer);
    write32(cv, 0, 0x02014b50); write16(cv, 4, 20); write16(cv, 6, 20);
    write16(cv, 8, 0x0800); write32(cv, 16, crc);
    write32(cv, 20, e.data.length); write32(cv, 24, e.data.length);
    write16(cv, 28, e.name.length); write32(cv, 42, offset);
    central.set(e.name, 46);
    directory.push(central);
    offset += local.length + e.data.length;
  }
  const directorySize = directory.reduce((sum, bytes) => sum + bytes.length, 0);
  const end = new Uint8Array(22);
  const v = new DataView(end.buffer);
  write32(v, 0, 0x06054b50);
  write16(v, 8, entries.length); write16(v, 10, entries.length);
  write32(v, 12, directorySize); write32(v, 16, offset);
  return new Blob([...chunks, ...directory, end], { type: 'application/zip' });
}
