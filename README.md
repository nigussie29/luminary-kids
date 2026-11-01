# Luminary Kids — የሂሳብ ጀብዱ (Grade 1 pilot)

Amharic-first math practice for Grade 1: six illustrated lessons with Wali the Walia ibex,
a starting game, adaptive practice, a ten-frame game, rewards and a grown-ups report.

## Files

- `src/i18n.js` — every Amharic and English string, lesson stories, glossary (send this file to reviewers)
- `src/engine.js` — question generators, scoring, levels, mastery, spaced review, recommendations
- `src/art.js` — Wali, child avatars, scenes, badges and exact math pictures, all SVG in code
- `src/narration.js` — recorded-clip playback and the recording script
- `src/sounds.js` — gentle chimes made in code (correct, try again, counting, badges)
- `tools/process-audio.sh` — cleans narrator recordings (trim, denoise, even loudness)
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
(phone voice memos as .m4a are fine). Put the raw files in a folder and run
`tools/process-audio.sh <folder>`: it trims silence, reduces background noise and evens out
loudness, then writes the clips to `audio/am/`. Push, and Railway redeploys.
A line plays from recordings when all its clips exist; otherwise the device's Amharic voice
reads it, and on devices without one, the English line is read aloud.

## AI narration — girl's voice, free (until a human narrator records)

```
pip install edge-tts
python3 tools/girl-voice.py --sample   # 6 audition lines in audio/sample/ — listen first
python3 tools/girl-voice.py            # all 137 Grade 1 + Grade 2 clips → audio/am/
```
Uses the Amharic neural voice Mekdes, pitched up (+22Hz) and a little slower so she sounds like a
friendly young girl. Adjust with `--pitch +15Hz … +30Hz` and `--rate`. Clips a person recorded
(.m4a/.wav) are never overwritten. Then `python3 animations/render.py --all` puts the voice in the videos.

## AI narration with an Azure key

`tools/azure-tts.js` makes all clips with Microsoft Azure's Amharic neural voice (Mekdes by default),
slightly slower and brighter for children. Set `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`, then run
`npm run voice:sample` (5 audition lines in `audio/sample/`) and `npm run voice` (all clips in `audio/am/`).
When human recordings arrive, delete the AI `.mp3` clips they replace.

## Lesson videos

`python3 animations/render.py count10` draws a lesson video with Manim and finishes it with FFmpeg.
See `animations/README.md`.

## Not built yet

Parent accounts and sync, checkout, weekly email, teacher and admin tools, offline install.
See the Pilot Blueprint doc for the roadmap.
