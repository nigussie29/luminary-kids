// Minimal zero-dependency server for the Luminary Kids pilot page.
// Serves dist/luminary-kids.html at "/" and a health check at "/healthz".
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = process.env.PORT || 3000;
const page = fs.readFileSync(path.join(__dirname, 'dist', 'luminary-kids.html'));
const pageGz = zlib.gzipSync(page);

const headers = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-cache',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};

http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/healthz') { res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('ok'); return; }
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
  if (url !== '/' && url !== '/index.html') { res.writeHead(302, { Location: '/' }); res.end(); return; }
  const gz = /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  res.writeHead(200, Object.assign({}, headers, gz ? { 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' } : {}));
  res.end(req.method === 'HEAD' ? undefined : gz ? pageGz : page);
}).listen(PORT, () => console.log(`Luminary Kids listening on ${PORT}`));
