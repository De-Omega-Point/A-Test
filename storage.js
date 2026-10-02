/* Safe storage facade for the existing classic scripts. The native Window
   storage object is not changed, and existing records are never cleared. */
const localStorage = (() => {
  const fallback = new Map();
  let native, available = true;
  function unavailable() {
    if (!available) return;
    available = false;
    window.dispatchEvent(new Event('atest-storage-warning'));
  }
  try { native = window.localStorage; } catch { unavailable(); }
  return {
    get available() { return available; },
    getItem(key) {
      key = String(key);
      if (fallback.has(key)) return fallback.get(key);
      try { return native ? native.getItem(key) : null; }
      catch { unavailable(); return null; }
    },
    setItem(key, value) {
      key = String(key); value = String(value); fallback.set(key, value);
      try { if (native) native.setItem(key, value); else unavailable(); }
      catch { unavailable(); }
    },
    removeItem(key) {
      key = String(key); fallback.set(key, null);
      try { if (native) native.removeItem(key); } catch { unavailable(); }
    }
  };
})();
