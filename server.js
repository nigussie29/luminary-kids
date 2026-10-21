// Minimal zero-dependency server for the Luminary Kids pilot.
// "/" → the app page · "/audio/am/<file>" → recorded narration · "/audio/manifest.json" → list of clips · "/healthz"
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const page = fs.readFileSync(path.join(__dirname, 'dist', 'luminary-kids.html'));
const pageGz = zlib.gzipSync(page);
const AUDIO_DIR = path.join(__dirname, 'audio', 'am');
const TYPES = { '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.aac': 'audio/aac', '.ogg': 'audio/ogg', '.wav': 'audio/wav', '.webm': 'audio/webm' };

function manifest() {
  let files = [];
  try { files = fs.readdirSync(AUDIO_DIR).filter((f) => TYPES[path.extname(f).toLowerCase()]); } catch (e) { files = []; }
  return JSON.stringify({ files: files.map((f) => ({ key: f.slice(0, -path.extname(f).length), file: f })) });
}
const MANIFEST = manifest();

const security = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

http.createServer((req, res) => {
  let url = '/';
  try { url = decodeURIComponent((req.url || '/').split('?')[0]); } catch (e) { res.writeHead(400); res.end(); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  if (url === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('ok'); return; }
  if (url === '/audio/manifest.json') {
    res.writeHead(200, Object.assign({ 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }, security));
    res.end(MANIFEST); return;
  }
  if (url.startsWith('/audio/am/')) {
    const name = path.basename(url);
    const type = TYPES[path.extname(name).toLowerCase()];
    const file = path.join(AUDIO_DIR, name);
    if (!type || !fs.existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, Object.assign({ 'Content-Type': type, 'Cache-Control': 'public, max-age=86400', 'Content-Length': fs.statSync(file).size }, security));
    if (req.method === 'HEAD') { res.end(); return; }
    fs.createReadStream(file).pipe(res); return;
  }
  if (url !== '/' && url !== '/index.html') { res.writeHead(302, { Location: '/' }); res.end(); return; }
  const gz = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  res.writeHead(200, Object.assign({ 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }, security, gz ? { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' } : {}));
  res.end(req.method === 'HEAD' ? undefined : gz ? pageGz : page);
}).listen(PORT, () => console.log(`Luminary Kids listening on ${PORT}`));
