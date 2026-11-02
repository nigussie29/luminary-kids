/* Luminary Kids — offline service worker.
   App page, lesson files and the clip list: network first, cached copy when offline.
   Narration, posters, captions and videos: cached copy first (the page pre-caches the next lesson,
   and "Download all lessons" on the grown-ups page fills the cache). Cached videos answer Range
   requests so they can still be played and scrubbed offline. */
const SHELL = 'lk-shell-v1';
const MEDIA = 'lk-media-v1';

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(SHELL).then((c) => c.addAll(['/', '/content/index.json', '/audio/manifest.json']).catch(() => {})).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => ![SHELL, MEDIA].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

async function networkFirst(req, key) {
  const cache = await caches.open(SHELL);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(key || req, res.clone());
    return res;
  } catch (e) {
    const hit = await cache.match(key || req);
    if (hit) return hit;
    throw e;
  }
}
async function rangeFrom(res, rangeHeader) {
  const buf = await res.arrayBuffer();
  const m = /bytes=(\d*)-(\d*)/.exec(rangeHeader);
  const size = buf.byteLength;
  let start = m[1] ? Number(m[1]) : size - Number(m[2]);
  let end = m[1] && m[2] ? Number(m[2]) : size - 1;
  end = Math.min(end, size - 1);
  return new Response(buf.slice(start, end + 1), { status: 206, headers: { 'Content-Type': res.headers.get('Content-Type') || 'video/mp4', 'Content-Range': `bytes ${start}-${end}/${size}`, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes' } });
}
async function mediaFirst(req) {
  const cache = await caches.open(MEDIA);
  const url = new URL(req.url); const key = url.pathname.slice(1);
  const hit = (await cache.match(key)) || (await cache.match(req.url));
  const range = req.headers.get('range');
  if (hit) return range ? rangeFrom(hit, range) : hit;
  const res = await fetch(req);
  // keep small files as they stream past; whole videos are cached by the page's download step
  if (res.ok && res.status === 200 && !/\.mp4$/.test(url.pathname)) cache.put(key, res.clone());
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const p = url.pathname;
  if (req.mode === 'navigate') { e.respondWith(networkFirst(req, '/')); return; }
  if (p.startsWith('/content/') || p === '/audio/manifest.json') { e.respondWith(networkFirst(req)); return; }
  if (p.startsWith('/audio/am/') || p.startsWith('/video/')) { e.respondWith(mediaFirst(req)); }
});
