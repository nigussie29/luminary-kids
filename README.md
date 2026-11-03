# Luminary Kids — የሂሳብ ጀብዱ (Grades 1–3)

Amharic-first, hands-on math for children aged 5–9. Eighteen lessons (six each for Grades 1, 2 and 3)
on an adventure map. Each lesson is mostly the child **doing**: a short Manim story video that pauses for
tap questions, guided drag-and-drop practice that adapts to the child, a mini-game, a five-question
challenge, and a celebration with stars, a badge and new clothes for the child's character.
The original Grade 1 practice runs, starting game and grown-ups report are still there as "Quick practice".

## How a lesson runs

1. **Hook video** (under 60 s, Amharic girl-voice narration, Amharic captions, optional English subtitles)
   with **2 checkpoints**: the video pauses and the child taps the answer before it continues.
   A replay button (ደግመህ/ደግመሽ አዳምጥ) goes back to the last part.
2. **Guided practice**: 6 slots, each with 3 difficulty levels. Three first-try answers in a row → harder;
   two misses in a row → easier, and a short re-teach clip from the video plays.
3. **Play**: one mini-game with the same skill (coffee ceremony, market run, balloon pop, race to
   Grandma's, memory match). Timers are optional and off by default.
4. **Challenge**: 5 quick questions, then stars, confetti and praise audio (ጎበዝ!, በጣም ጥሩ!).

Every lesson has at least 6 drag-and-drop exercises and 4 other exercise types, 15–25 interactions in all.
Wrong answers get a gentle hint; after two tries the answer is demonstrated. The test suite checks all of this.

## Files

- `content/build.js` — the 18 lesson plans (every exercise, in Amharic and English); writes
  `content/lessons/*.json`, `content/index.json`, `docs/lesson-plans.md` and the recording list.
  The exercise format is in `content/README.md`.
- `src/activities.js` — the 16 exercise components (8 drag-and-drop types, tap, count, number pad, clock,
  trace, listen, true/false swipe, speak) and the touch drag engine
- `src/games.js` — the five mini-games
- `src/adventure.js` — lesson player, video checkpoints, adaptivity, stars, streak, badges, wardrobe,
  adventure map, offline download
- `src/admin.js` — the lesson editor at `/admin`
- `src/sw.js` — offline service worker (caches lessons, narration and videos, plays cached video)
- `src/lessons.css`, `src/admin.css` — styles for all of the above
- `animations/` — Manim hook videos (see `animations/README.md`)
- `src/i18n.js`, `src/lessons-g2.js`, `src/lessons-g3.js` — lesson titles, stories and worked examples (send to reviewers)
- `src/engine.js`, `src/app.js`, `src/art.js`, `src/narration.js`, `src/sounds.js` — the original app:
  question generators, interface, artwork, recorded-clip playback, chimes
- `server.js` — serves the app, videos (with range requests), narration, lessons, `/admin` and its API
- `test/content.test.js` — proves every lesson follows the design rules and every answer is right
- `test/lessons_e2e.py` — plays all 18 lessons in a phone-sized browser with real drags and swipes
- `test/engine.test.js`, `test/smoke.py` — the original practice engine and quick-practice play-through

## Commands

```
node content/build.js                         # rebuild lesson files after editing the plans
node build.js                                 # build dist/luminary-kids.html and dist/admin.html
npm test                                      # engine + lesson-content checks
node server.js                                # http://localhost:3000 (admin: set ADMIN_TOKEN)
python3 test/lessons_e2e.py http://localhost:3000   # play every lesson in a browser
python3 animations/render.py --all --std      # re-render the 18 hook videos (then rebuilds lessons + app)
```

## Narration (the girl's voice)

```
pip install edge-tts
python3 tools/girl-voice.py --sample   # 6 audition lines in audio/sample/ — listen first
python3 tools/girl-voice.py            # every clip the app, videos and exercises use → audio/am/
python3 animations/render.py --all --std   # puts the new clips into the videos (checkpoint times follow)
```
On Windows use `py -3.14 tools\girl-voice.py`. Uses the Amharic neural voice Mekdes, pitched up (+22Hz)
and a little slower so she sounds like a friendly young girl (`--pitch`, `--rate` to adjust). Clips a person
recorded (.m4a/.wav) are never overwritten. The recording lists are `dist/narration-script.csv` (app),
`dist/narration-script-videos.csv` (video sentences) and `dist/narration-script-exercises.csv` (exercise
prompts, hints and number words to 100). A line without a clip falls back to the device's voice.
For a human narrator: record with the file names in those lists, then `tools/process-audio.sh <folder>`.
`tools/azure-tts.js` does the same with an Azure key (`npm run voice:azure`).

## Admin panel (`/admin`)

Set `ADMIN_TOKEN` (the password) on the server. Edits are saved to `DATA_DIR/lessons` (default `./data`);
on Railway, attach a volume and set `DATA_DIR` to its mount path so edits survive redeploys.
The editor shows every checkpoint, guided level, game and challenge question; adds exercises from
templates for all 16 types; previews them live with the real components; flags wrong answers before
saving; and can undo all edits to a lesson.

## Offline

Lesson content is built into the page, so a lesson keeps working if the signal drops. The service worker
pre-caches the next lesson's video and clips on good connections; "Download all lessons" on the grown-ups
page saves everything for use with no internet. On slow connections the app picks the 360p videos.

## Not built yet

Parent accounts and sync, checkout, weekly email, teacher class tools. See the Pilot Blueprint doc.
