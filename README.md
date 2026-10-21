# Luminary Kids — የሂሳብ ጀብዱ (Grade 1 pilot)

Amharic-first math practice for Grade 1: six illustrated lessons with Wali the Walia ibex,
a starting game, adaptive practice, a ten-frame game, rewards and a grown-ups report.

## Files

- `src/i18n.js` — every Amharic and English string, lesson stories, glossary (send this file to reviewers)
- `src/engine.js` — question generators, scoring, levels, mastery, spaced review, recommendations
- `src/art.js` — Wali, child avatars, scenes, badges and exact math pictures, all SVG in code
- `src/narration.js` — recorded-clip playback and the recording script
- `src/app.js` — the interface: landing page, child home, lesson player, grown-ups page
- `src/styles.css`, `src/index.html` — design tokens and page shell
- `build.js` — joins everything into `dist/luminary-kids.html`
- `test/engine.test.js` — math and picture tests (54,000 generated questions)
- `test/smoke.py` — full play-through in a headless browser (needs Python Playwright)

## Commands

```
node build.js                    # build dist/luminary-kids.html
node --test test/engine.test.js  # math, picture, scoring and recommendation tests
python3 test/smoke.py <folder>   # browser play-through, saves screenshots to <folder>
```

## Adding recorded narration

`node build.js` writes `dist/narration-script.csv`: 103 short clips (number words, object words,
sentences and sentence pieces). Record each one, name it as in the file name column
(phone voice memos as .m4a are fine) and put it in `audio/am/`. Push, and Railway redeploys.
A line plays from recordings when all its clips exist; otherwise the device's Amharic voice
reads it, and on devices without one, the English line is read aloud.

## Not built yet

Parent accounts and sync, checkout, weekly email, teacher and admin tools, offline install.
See the Pilot Blueprint doc for the roadmap.
