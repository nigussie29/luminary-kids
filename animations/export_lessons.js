// node animations/export_lessons.js → animations/lessons.json
// The animations read every Amharic and English string from src/i18n.js (via this file),
// so lesson text is written and reviewed in one place.
const fs = require('fs'), path = require('path');
require(path.join(__dirname, '..', 'src', 'i18n.js'));
const { lessons, numWords, things, glossary, prompts } = globalThis.LK;
const out = path.join(__dirname, 'lessons.json');
fs.writeFileSync(out, JSON.stringify({ lessons, numWords, things, glossary, prompts }, null, 2));
console.log('wrote', path.relative(process.cwd(), out), '—', lessons.length, 'lessons');
