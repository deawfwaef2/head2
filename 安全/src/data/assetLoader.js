// 安全版 · 资产加载（开发：Vite 从 public/models 取；单文件 HTML：从内嵌的 window.__SAFE_EMBEDDED__ 解码）
// 与主项目一致：模型放在 public/models，构建脚本 scripts/build_standalone_html.mjs 负责内嵌。
const cache = new Map();
function b64ToU8(s) { const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
export async function loadModelBytes(id) {
  if (cache.has(id)) return cache.get(id);
  const emb = typeof window !== 'undefined' && window.__SAFE_EMBEDDED__;
  let u8;
  if (emb && emb[id]) { u8 = b64ToU8(emb[id]); emb[id] = null; } // 解码后释放字符串，省内存
  else {
    const r = await fetch(`./models/${id}.glb`);
    if (!r.ok) throw new Error('模型加载失败：' + id + '（HTTP ' + r.status + '）');
    u8 = new Uint8Array(await r.arrayBuffer());
  }
  cache.set(id, u8);
  return u8;
}
