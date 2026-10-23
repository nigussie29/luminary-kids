// node build.js → dist/luminary-kids.html (one self-contained page) + dist/narration-script.csv
const fs = require('fs'), path = require('path');
const src = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const files = ['i18n.js', 'engine.js', 'art.js', 'narration.js', 'legal.js', 'sounds.js', 'app.js'];
const js = files.map(src).join('\n;\n').replace(/<\/script/gi, '<\\/script');
const html = src('index.html').replace('/*CSS*/', () => src('styles.css')).replace('/*JS*/', () => js);
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'luminary-kids.html'), html);

// Recording script for the narrator: one row per clip.
for (const f of files.slice(0, 5)) require(path.join(__dirname, 'src', f));
const rows = globalThis.LK.narr.script();
const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
const csv = '\ufeff' + ['n,file name,Amharic to read,English meaning,note']
  .concat(rows.map((r, i) => [i + 1, r.key + '.m4a', r.am, r.en, r.note].map(q).join(','))).join('\r\n');
fs.writeFileSync(path.join(__dirname, 'dist', 'narration-script.csv'), csv);
console.log('built', (html.length / 1024).toFixed(1) + ' KB;', rows.length, 'narration clips in script');
