// node animations/export_lessons.js → animations/lessons.json + dist/narration-script-g2.csv
// The animations read every Amharic and English string from src/i18n.js and src/lessons-g2.js
// (via this file), so lesson text is written and reviewed in one place.
const fs = require('fs'), path = require('path');
require(path.join(__dirname, '..', 'src', 'i18n.js'));
require(path.join(__dirname, '..', 'src', 'lessons-g2.js'));
const { numWords, tensWords, things, glossary, prompts } = globalThis.LK;

// Worked examples are split into sentences ("steps"), each with its own narration clip
// lesson.<id>.example.<i>, so the picture for each sentence appears as it is spoken.
const splitAm = (s) => s.split(/(?<=።)\s*/).map((x) => x.trim()).filter(Boolean);
const splitEn = (s) => s.split(/(?<=[.!?])\s+/).map((x) => x.trim()).filter(Boolean);
const withSteps = (l) => {
  const am = splitAm(l.example.am), en = splitEn(l.example.en);
  if (am.length !== en.length) throw new Error(`${l.id}: ${am.length} Amharic vs ${en.length} English sentences in the example`);
  return { ...l, steps: am.map((a, i) => ({ am: a, en: en[i] })) };
};
const lessons = [...globalThis.LK.lessons, ...globalThis.LK.lessonsG2].map(withSteps);

const out = path.join(__dirname, 'lessons.json');
fs.writeFileSync(out, JSON.stringify({ lessons, numWords, tensWords, things, glossary, prompts }, null, 2));

// Recording script for the Grade 2 lesson clips (Grade 1's is made by build.js).
const rows = [];
for (const l of globalThis.LK.lessonsG2.map(withSteps)) {
  rows.push([`lesson.${l.id}.title`, l.title.am, l.title.en]);
  rows.push([`lesson.${l.id}.story`, l.story.am, l.story.en]);
  l.steps.forEach((s, i) => rows.push([`lesson.${l.id}.example.${i}`, s.am, s.en]));
}
const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
const csv = '﻿' + ['n,file name,Amharic to read,English meaning']
  .concat(rows.map((r, i) => [i + 1, r[0] + '.m4a', r[1], r[2]].map(q).join(','))).join('\r\n');
fs.mkdirSync(path.join(__dirname, '..', 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'narration-script-g2.csv'), csv);
console.log('wrote', path.relative(process.cwd(), out), '—', lessons.length, 'lessons;', rows.length, 'Grade 2 clips in dist/narration-script-g2.csv');
