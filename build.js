// node build.js → dist/luminary-kids.html (one self-contained page) + dist/narration-script.csv
const fs = require('fs'), path = require('path');
const src = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const files = ['i18n.js', 'engine.js', 'art.js', 'narration.js', 'legal.js', 'sounds.js', 'lessons-g2.js', 'activities.js', 'games.js', 'adventure.js', 'app.js'];
// Lesson content is built into the page too, so a lesson keeps working if the connection drops.
const contentDir = path.join(__dirname, 'content');
const index = JSON.parse(fs.readFileSync(path.join(contentDir, 'index.json'), 'utf8'));
const lessons = Object.fromEntries(index.lessons.map((l) => [l.id, JSON.parse(fs.readFileSync(path.join(contentDir, 'lessons', l.id + '.json'), 'utf8'))]));
const content = `(function(G){(G.LK=G.LK||{}).content=${JSON.stringify({ index, lessons })};})(typeof globalThis!=='undefined'?globalThis:window);`;
const js = [content, ...files.map(src)].join('\n;\n').replace(/<\/script/gi, '<\\/script');
const css = ['styles.css', 'lessons.css'].map(src).join('\n');
const html = src('index.html').replace('/*CSS*/', () => css).replace('/*JS*/', () => js);
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'luminary-kids.html'), html);

// Lesson editor (/admin): the same exercise components for the live preview, plus the editor.
const adminJs = ['i18n.js', 'art.js', 'sounds.js', 'activities.js', 'games.js', 'admin.js'].map(src).join('\n;\n').replace(/<\/script/gi, '<\\/script');
const adminCss = ['styles.css', 'lessons.css', 'admin.css'].map(src).join('\n');
const admin = src('index.html').replace('<title>Luminary Kids</title>', '<title>Lesson editor · Luminary Kids</title>').replace('<div id="app"></div>', '<div id="admin"></div>')
  .replace('/*CSS*/', () => adminCss).replace('/*JS*/', () => adminJs);
fs.writeFileSync(path.join(__dirname, 'dist', 'admin.html'), admin);

// Recording script for the narrator: one row per clip.
for (const f of files.slice(0, 5)) require(path.join(__dirname, 'src', f));
const rows = globalThis.LK.narr.script();
const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
const csv = '\ufeff' + ['n,file name,Amharic to read,English meaning,note']
  .concat(rows.map((r, i) => [i + 1, r.key + '.m4a', r.am, r.en, r.note].map(q).join(','))).join('\r\n');
fs.writeFileSync(path.join(__dirname, 'dist', 'narration-script.csv'), csv);
console.log('built', (html.length / 1024).toFixed(1) + ' KB;', rows.length, 'narration clips in script');
