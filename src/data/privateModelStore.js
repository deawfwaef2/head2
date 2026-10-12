// Personal 3D assets stay in this browser's IndexedDB. Never bundled into the
// downloadable HTML, GitHub repository, GitHub Pages, or collectible JSON.
const DB_NAME = 'cervix3d-private-assets-v1';
const STORE = 'models';
const PREFIX = 'private-asset:';
const urls = new Map();

function openDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in globalThis)) return reject(new Error('浏览器不支持 IndexedDB'));
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('无法打开本机模型仓库'));
  });
}

export async function keepPrivateModel(file) {
  const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const db = await openDB();
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put({ id, file, name: file.name, bytes: file.size, savedAt: new Date().toISOString() });
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error || new Error('本机空间不足，模型未能保存'));
      tx.onabort = () => reject(tx.error || new Error('模型保存中断'));
    });
  } finally { db.close(); }
  return `${PREFIX}${id}`;
}

export async function resolvePrivateModelUrl(reference) {
  if (typeof reference !== 'string' || !reference.startsWith(PREFIX)) return reference;
  if (urls.has(reference)) return urls.get(reference);
  const db = await openDB();
  let item;
  try {
    item = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const request = tx.objectStore(STORE).get(reference.slice(PREFIX.length));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('读取本机模型失败'));
    });
  } finally { db.close(); }
  if (!item?.file) throw new Error('本机模型文件已被浏览器清理；请重新选择原始 GLB/OBJ 文件');
  const url = URL.createObjectURL(item.file);
  urls.set(reference, url);
  return url;
}

export function isPrivateModel(reference) {
  return typeof reference === 'string' && reference.startsWith(PREFIX);
}
