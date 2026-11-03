// Owner-only photo previews. Photos added on the #owner page are stored in this
// browser (IndexedDB) so you can see how real hotel photos will look. They are
// NOT uploaded anywhere and other visitors will not see them. To publish a
// photo, copy it into /public/photos/hotels/<destination-id>/ and list it in
// that hotel's `photos` array in src/data/trip.js (see README).
const DB = 'es27-owner-photos';
const STORE = 'photos';
const listeners = new Set();

function open() {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) { reject(e); }
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const out = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(out?.result ?? out);
    t.onerror = () => reject(t.error);
  });
}

export async function listLocal(destId) {
  try {
    const all = await tx('readonly', (s) => s.getAll());
    return all.filter((p) => p.destId === destId).map((p) => ({ ...p, url: URL.createObjectURL(p.blob) }));
  } catch { return []; }
}

export async function addLocal(destId, files) {
  try {
    await tx('readwrite', (s) => { for (const f of files) s.add({ destId, name: f.name, blob: f, added: Date.now() }); });
  } catch { /* storage unavailable */ }
  listeners.forEach((fn) => fn(destId));
}

export async function removeLocal(id, destId) {
  try { await tx('readwrite', (s) => s.delete(id)); } catch { /* ignore */ }
  listeners.forEach((fn) => fn(destId));
}

export const onLocalChange = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
