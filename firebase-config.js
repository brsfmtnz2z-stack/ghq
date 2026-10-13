const FIREBASE_ENABLED = KVDB_BUCKET !== 'ADn53EcfTf4WooB';

function makeRef(path) {
  const url = `https://kvdb.io/${KVDB_BUCKET}/` + path.replace(/\//g, '_');
  return {
    once: async () => {
      try {
        const res = await fetch(url);
        const text = await res.text();
        let val = null;
        try { val = text ? JSON.parse(text) : null; } catch { val = text; }
        return { val: () => val };
      } catch { return { val: () => null }; }
    },
    set: async (value) => {
      try {
        await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(value)
        });
      } catch (e) { console.warn('写入失败', e); }
    },
    remove: async () => {
      try { await fetch(url, { method: 'DELETE' }); } catch {}
    },
    on: (event, cb) => {
      setInterval(async () => {
        try {
          const res = await fetch(url);
          const text = await res.text();
          let val = null;
          try { val = text ? JSON.parse(text) : null; } catch { val = text; }
          cb({ val: () => val });
        } catch {}
      }, 3000);
    }
  };
}

window.rtdb = FIREBASE_ENABLED ? { ref: makeRef } : null;
console.log(FIREBASE_ENABLED ? '✅ 共享模式已启用' : '⚠️ 未配置 bucket，本地模式');