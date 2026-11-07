// node animations/export_lessons.js → animations/lessons.json + dist/narration-script-videos.csv
// The animations read every Amharic and English string from src/i18n.js, src/lessons-g2.js and src/lessons-g3.js
// (via this file), so lesson text is written and reviewed in one place.
const fs = require('fs'), path = require('path');
require(path.join(__dirname, '..', 'src', 'i18n.js'));
require(path.join(__dirname, '..', 'src', 'lessons-g2.js'));
require(path.join(__dirname, '..', 'src', 'lessons-g3.js'));
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
const lessons = [...globalThis.LK.lessons, ...globalThis.LK.lessonsG2, ...globalThis.LK.lessonsG3].map(withSteps);

const out = path.join(__dirname, 'lessons.json');
fs.writeFileSync(out, JSON.stringify({ lessons, numWords, tensWords, things, glossary, prompts }, null, 2));

// Recording script for the video clips: Grade 2 and 3 titles and stories (Grade 1's are in build.js's
// script) and, for every lesson, each sentence of the worked example on its own.
const rows = [];
for (const l of lessons) {
  if ([...globalThis.LK.lessonsG2, ...globalThis.LK.lessonsG3].some((g) => g.id === l.id)) {
    rows.push([`lesson.${l.id}.title`, l.title.am, l.title.en]);
    rows.push([`lesson.${l.id}.story`, l.story.am, l.story.en]);
  }
  if (l.id === 'count10') continue; // its video reads the whole example in one clip (lesson.count10.example)
  l.steps.forEach((s, i) => rows.push([`lesson.${l.id}.example.${i}`, s.am, s.en]));
}
const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
const csv = '﻿' + ['n,file name,Amharic to read,English meaning']
  .concat(rows.map((r, i) => [i + 1, r[0] + '.m4a', r[1], r[2]].map(q).join(','))).join('\r\n');
fs.mkdirSync(path.join(__dirname, '..', 'dist'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '..', 'dist', 'narration-script-videos.csv'), csv);
console.log('wrote', path.relative(process.cwd(), out), '—', lessons.length, 'lessons;', rows.length, 'video clips in dist/narration-script-videos.csv');
