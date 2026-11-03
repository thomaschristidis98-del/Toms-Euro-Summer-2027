// Service worker for European Summer 2027 (generated into dist/sw.js by build.mjs).
// Offline behaviour:
//  • The page, its code, styles, itinerary data and the route map are precached.
//  • Photos are cached the first time they are viewed, so pages you've already
//    scrolled through keep their photos offline (up to ~150 photos).
//  • Google Maps, Booking.com and other external links still need a connection.
const VERSION = '__VERSION__';
const PRECACHE = __PRECACHE__;
const SHELL = `es27-shell-${VERSION}`;
const PHOTOS = 'es27-photos-v1';
const FONTS = 'es27-fonts-v1';
const DATA = 'es27-data-v1';
const MAX_PHOTOS = 150;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keep = [SHELL, PHOTOS, FONTS, DATA];
    for (const k of await caches.keys()) if (!keep.includes(k)) await caches.delete(k);
    await self.clients.claim();
  })());
});

async function trim(cacheName, max) {
  const c = await caches.open(cacheName);
  const keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // App shell: network first for navigations so updates arrive, cache when offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then((res) => {
      const copy = res.clone(); caches.open(SHELL).then((c) => c.put('/', copy)); return res;
    }).catch(() => caches.match('/')));
    return;
  }

  // Own static files: cache first.
  if (url.origin === location.origin) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
    return;
  }

  // Wikimedia photos: cache first, store on first view.
  if (url.hostname === 'upload.wikimedia.org' || (url.hostname === 'commons.wikimedia.org' && url.pathname.includes('Special:FilePath'))) {
    e.respondWith(caches.open(PHOTOS).then(async (c) => {
      const hit = await c.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') { c.put(req, res.clone()); trim(PHOTOS, MAX_PHOTOS); }
      return res;
    }));
    return;
  }

  // Photo credits from the Commons API: network first, cached fallback.
  if (url.hostname === 'commons.wikimedia.org' && url.pathname.endsWith('/api.php')) {
    e.respondWith(fetch(req).then((res) => { const copy = res.clone(); caches.open(DATA).then((c) => c.put(req, copy)); return res; })
      .catch(() => caches.match(req)));
    return;
  }

  // Google Fonts: stale while revalidate.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req).then((res) => { c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    }));
  }
});
