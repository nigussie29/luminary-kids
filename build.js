// node build.js → dist/luminary-kids.html (one self-contained page)
const fs = require('fs'), path = require('path');
const src = (f) => fs.readFileSync(path.join(__dirname, 'src', f), 'utf8');
const js = ['i18n.js', 'engine.js', 'art.js', 'app.js'].map(src).join('\n;\n').replace(/<\/script/gi, '<\\/script');
const html = src('index.html').replace('/*CSS*/', () => src('styles.css')).replace('/*JS*/', () => js);
fs.mkdirSync(path.join(__dirname, 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'luminary-kids.html'), html);
console.log('built', (html.length / 1024).toFixed(1) + ' KB');
