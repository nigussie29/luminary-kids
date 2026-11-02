// Small zero-dependency server for Luminary Kids.
//   /                       the app page             /video/<file>            lesson videos, posters, captions (range requests)
//   /audio/am/<file>        recorded narration       /audio/manifest.json     list of narration clips
//   /content/index.json     lesson list              /content/lessons/<id>.json   one lesson (admin edits win)
//   /sw.js                  offline service worker   /admin                   lesson editor (needs ADMIN_TOKEN)
//   /api/lessons/<id>       GET / PUT a lesson (admin, Bearer token)            /healthz
// Admin edits are saved in DATA_DIR/lessons (default ./data). On Railway, mount a volume at DATA_DIR
// so edits survive redeploys.
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const AUDIO_DIR = path.join(ROOT, 'audio', 'am');
const VIDEO_DIR = path.join(DIST, 'video');
const CONTENT_DIR = path.join(ROOT, 'content');
const EDITS_DIR = path.join(DATA_DIR, 'lessons');

const TYPES = {
  '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.webm': 'audio/webm',
  '.mp4': 'video/mp4', '.jpg': 'image/jpeg', '.vtt': 'text/vtt; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.html': 'text/html; charset=utf-8'
};
const security = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=()'
};

function readPage(name) {
  try { const b = fs.readFileSync(path.join(DIST, name)); return { raw: b, gz: zlib.gzipSync(b) }; } catch (e) { return null; }
}
const PAGE = readPage('luminary-kids.html');
const ADMIN = readPage('admin.html');

function manifest() {
  let files = [];
  try { files = fs.readdirSync(AUDIO_DIR).filter((f) => TYPES[path.extname(f).toLowerCase()]); } catch (e) { files = []; }
  return JSON.stringify({ files: files.map((f) => ({ key: f.slice(0, -path.extname(f).length), file: f })) });
}
const MANIFEST = manifest();

// one static file with Range support (Safari and Android need it for video seeking)
function sendFile(req, res, file, cache) {
  let st;
  try { st = fs.statSync(file); } catch (e) { res.writeHead(404); res.end(); return; }
  if (!st.isFile()) { res.writeHead(404); res.end(); return; }
  const type = TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const head = Object.assign({ 'Content-Type': type, 'Cache-Control': cache, 'Accept-Ranges': 'bytes' }, security);
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (range) {
    let start = range[1] ? Number(range[1]) : st.size - Number(range[2]);
    let end = range[1] && range[2] ? Number(range[2]) : st.size - 1;
    if (!range[1]) end = st.size - 1;
    if (start >= st.size || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${st.size}` }); res.end(); return; }
    end = Math.min(end, st.size - 1);
    res.writeHead(206, Object.assign(head, { 'Content-Range': `bytes ${start}-${end}/${st.size}`, 'Content-Length': end - start + 1 }));
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file, { start, end }).pipe(res); return;
  }
  res.writeHead(200, Object.assign(head, { 'Content-Length': st.size }));
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(file).pipe(res);
}
// resolve a URL path inside a folder, refusing anything that escapes it
function inside(dir, rel) {
  const f = path.resolve(dir, '.' + path.sep + rel);
  return f.startsWith(dir + path.sep) ? f : null;
}
function sendJSON(res, code, obj) {
  res.writeHead(code, Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' }, security));
  res.end(JSON.stringify(obj));
}
function sendPage(req, res, page) {
  if (!page) { res.writeHead(500); res.end('Run node build.js first.'); return; }
  const gz = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  res.writeHead(200, Object.assign({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }, security, gz ? { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' } : {}));
  res.end(req.method === 'HEAD' ? undefined : gz ? page.gz : page.raw);
}
const LESSON_ID = /^[a-z0-9_]{2,40}$/;
function lessonFile(id) {
  const edited = path.join(EDITS_DIR, `${id}.json`);
  if (fs.existsSync(edited)) return edited;
  return path.join(CONTENT_DIR, 'lessons', `${id}.json`);
}
function authed(req) {
  if (!ADMIN_TOKEN) return false;
  const got = Buffer.from(String((req.headers.authorization || '').replace(/^Bearer\s+/i, '')));
  const want = Buffer.from(ADMIN_TOKEN);
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}
function readBody(req, limit = 2e6) {
  return new Promise((resolve, reject) => {
    let n = 0; const chunks = [];
    req.on('data', (c) => { n += c.length; if (n > limit) { reject(new Error('too big')); req.destroy(); } else chunks.push(c); });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
function validLesson(L, id) {
  const ex = (e) => e && typeof e.type === 'string' && typeof e.prompt_am === 'string' && 'answer' in e;
  return L && L.id === id && L.video && Array.isArray(L.video.checkpoints) && Array.isArray(L.guided) &&
    L.guided.every((s) => Array.isArray(s.levels) && s.levels.every(ex)) && Array.isArray(L.challenge) && L.challenge.every(ex) && L.play && L.play.game;
}

const server = http.createServer(async (req, res) => {
  let url = '/';
  try { url = decodeURIComponent((req.url || '/').split('?')[0]); } catch (e) { res.writeHead(400); res.end(); return; }
  const m = req.method;

  if (url.startsWith('/api/')) {
    if (!ADMIN_TOKEN) { sendJSON(res, 503, { error: 'Admin is off. Set ADMIN_TOKEN on the server to turn it on.' }); return; }
    if (!authed(req)) { sendJSON(res, 401, { error: 'Wrong admin password.' }); return; }
    if (url === '/api/check') { sendJSON(res, 200, { ok: true, storage: EDITS_DIR }); return; }
    const mm = /^\/api\/lessons\/([^/]+)$/.exec(url);
    if (mm && LESSON_ID.test(mm[1])) {
      const id = mm[1];
      if (m === 'GET') { sendFile(req, res, lessonFile(id), 'no-cache'); return; }
      if (m === 'PUT') {
        let L;
        try { L = JSON.parse(await readBody(req)); } catch (e) { sendJSON(res, 400, { error: 'That is not valid JSON.' }); return; }
        if (!validLesson(L, id)) { sendJSON(res, 422, { error: 'The lesson is missing parts (video, guided, challenge or play), or an exercise has no type, prompt or answer.' }); return; }
        fs.mkdirSync(EDITS_DIR, { recursive: true });
        const tmp = path.join(EDITS_DIR, `.${id}.${process.pid}.tmp`);
        fs.writeFileSync(tmp, JSON.stringify(L, null, 2)); fs.renameSync(tmp, path.join(EDITS_DIR, `${id}.json`));
        sendJSON(res, 200, { ok: true, saved: `${id}.json` }); return;
      }
      if (m === 'DELETE') { try { fs.unlinkSync(path.join(EDITS_DIR, `${id}.json`)); } catch (e) { /* nothing to undo */ } sendJSON(res, 200, { ok: true, reverted: id }); return; }
    }
    sendJSON(res, 404, { error: 'Not found' }); return;
  }

  if (m !== 'GET' && m !== 'HEAD') { res.writeHead(405); res.end(); return; }
  if (url === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('ok'); return; }
  if (url === '/audio/manifest.json') { res.writeHead(200, Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }, security)); res.end(MANIFEST); return; }
  if (url.startsWith('/audio/am/')) { const f = inside(AUDIO_DIR, path.basename(url)); if (!f) { res.writeHead(404); res.end(); return; } sendFile(req, res, f, 'public, max-age=86400'); return; }
  if (url.startsWith('/video/')) { const f = inside(VIDEO_DIR, url.slice(7)); if (!f) { res.writeHead(404); res.end(); return; } sendFile(req, res, f, 'public, max-age=86400'); return; }
  if (url === '/content/index.json') { sendFile(req, res, path.join(CONTENT_DIR, 'index.json'), 'no-cache'); return; }
  const cl = /^\/content\/lessons\/([a-z0-9_]+)\.json$/.exec(url);
  if (cl) { sendFile(req, res, lessonFile(cl[1]), 'no-cache'); return; }
  if (url === '/sw.js') { res.setHeader('Service-Worker-Allowed', '/'); sendFile(req, res, path.join(ROOT, 'src', 'sw.js'), 'no-cache'); return; }
  if (url === '/admin' || url === '/admin/') { sendPage(req, res, ADMIN); return; }
  if (!['/', '/index.html', '/privacy', '/terms', '/parents'].includes(url)) { res.writeHead(302, { Location: '/' }); res.end(); return; }
  sendPage(req, res, PAGE);
});
server.listen(PORT, () => console.log(`Luminary Kids listening on ${PORT}${ADMIN_TOKEN ? ' (admin on)' : ''}`));
