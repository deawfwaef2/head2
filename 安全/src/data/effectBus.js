// 安全版 · 效果总线（Effect Bus）—— 所有画面效果的统一开关 / 取值 / 连线接口
//
//   fx.get(id)            当前设定值（不管开没开）
//   fx.effective(id)      实际生效值（被关掉时返回注册表里的 off 值）
//   fx.set(id, v)         设值 → 自动应用到渲染 → 触发连线
//   fx.enable(id, on)     开关（旁路），数值保留
//   fx.on(id | '*', cb)   监听变化，返回取消函数
//   fx.link(from, to, {scale, offset})   连线：to = offset + scale × from（可多级，自动防环）
//   fx.unlink(i) / fx.links()
//   fx.export() / fx.import(json)        开关与连线存成 JSON（每个藏品各自保存）
// 浏览器控制台里也可以用：window.SafeBust.fx
export function createEffectBus({ registry, read, write, apply, state }) {
  const byId = new Map(registry.map((e) => [e.id, e]));
  const listeners = new Map();
  const pending = new Set(); let queued = false;
  const fx = () => { const s = state(); s.bypass ||= {}; s.links ||= []; return s; };
  const queue = (e) => {
    pending.add(e.scope + (e.heavy ? ':heavy' : ''));
    if (queued) return; queued = true;
    queueMicrotask(() => { queued = false; const s = [...pending]; pending.clear(); for (const k of s) { const [scope, heavy] = k.split(':'); apply(scope, !!heavy); } });
  };
  const emit = (id, v) => { for (const k of [id, '*']) for (const cb of listeners.get(k) || []) { try { cb(v, id); } catch (err) { console.error(err); } } };
  const clamp = (e, v) => e.kind === 'toggle' ? !!v : Math.min(e.max, Math.max(e.min, +v));
  const api = {
    registry,
    has: (id) => byId.has(id),
    entry: (id) => byId.get(id),
    get(id) { const e = byId.get(id); return e ? read(e) : undefined; },
    isEnabled(id) { return !fx().bypass[id]; },
    effective(id) { const e = byId.get(id); if (!e) return undefined; return api.isEnabled(id) ? read(e) : e.off; },
    set(id, v, depth = 0) {
      const e = byId.get(id); if (!e) throw new Error('未知效果：' + id);
      v = clamp(e, v); write(e, v); queue(e); emit(id, v);
      if (depth < 6) for (const l of fx().links) if (l.on !== false && l.from === id) {
        const t = byId.get(l.to); if (!t) continue;
        const src = +api.effective(id);
        api.set(l.to, t.kind === 'toggle' ? src * (l.scale ?? 1) + (l.offset ?? 0) > 0.5 : (l.offset ?? 0) + (l.scale ?? 1) * src, depth + 1);
      }
    },
    enable(id, on = true) { const e = byId.get(id); if (!e) return; if (on) delete fx().bypass[id]; else fx().bypass[id] = true; queue(e); emit(id, api.get(id)); },
    on(id, cb) { if (!listeners.has(id)) listeners.set(id, []); listeners.get(id).push(cb); return () => { const a = listeners.get(id); a.splice(a.indexOf(cb), 1); }; },
    links: () => fx().links,
    link(from, to, o = {}) { if (!byId.has(from) || !byId.has(to) || from === to) throw new Error('连线端口无效'); fx().links.push({ from, to, scale: o.scale ?? 1, offset: o.offset ?? 0, on: true }); api.set(from, api.get(from)); },
    unlink(i) { fx().links.splice(i, 1); },
    list: () => registry.map((e) => ({ ...e, value: api.get(e.id), enabled: api.isEnabled(e.id) })),
    export: () => JSON.stringify({ bypass: fx().bypass, links: fx().links, values: Object.fromEntries(registry.map((e) => [e.id, api.get(e.id)])) }, null, 1),
    import(json) {
      const o = typeof json === 'string' ? JSON.parse(json) : json; const s = fx();
      s.bypass = { ...(o.bypass || {}) }; s.links = [...(o.links || [])];
      for (const [id, v] of Object.entries(o.values || {})) if (byId.has(id)) write(byId.get(id), clamp(byId.get(id), v));
      for (const sc of new Set(registry.map((e) => e.scope))) apply(sc, true);
    },
  };
  return api;
}
