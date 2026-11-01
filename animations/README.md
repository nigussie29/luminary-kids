# Lesson animations — Manim + Python + FFmpeg

Short teaching videos for each lesson, drawn with [Manim Community](https://www.manim.community/)
so every ten frame, counter and number line is mathematically exact.

```
python3 animations/render.py count10          # quick draft (480p)
python3 animations/render.py count10 --std    # 720p
python3 animations/render.py --all --hd       # 1080p60, every lesson
```

Output goes to `dist/video/<lesson>.mp4` (H.264 + AAC, fast-start for phones) and a poster
`dist/video/<lesson>.jpg`.

## How it fits the app

- **Text** comes from `src/i18n.js`. `render.py` runs `export_lessons.js` first, so lesson titles,
  stories, examples and number words are written and reviewed in one place.
- **Voice** uses the same clips as the app (`audio/am/<key>.m4a`). `say(self, "num.3")` adds the clip
  and waits exactly its length, so pictures stay in step with the narrator. Missing clips fall back
  to a timed pause and are listed in `animations/media/missing/<Scene>.txt`.
- **Look** uses the app's palette (`lk/style.py`) and Noto Sans Ethiopic for Amharic.

## Files

- `lk/style.py` — colours, Amharic/English text, captions, title card
- `lk/parts.py` — TenFrame, Counter, NumberLine, Flower, Mango, Orange, badges
- `lk/parts2.py` — base-ten rods and ones, place-value mat, written columns, stick bundles, trays and cups, birr notes and coins, injera fractions
- `lk/voice.py` — narration clips and timing
- `lessons/<id>.py` — one `LessonScene` per lesson (file name = lesson id); `self.title`, `self.story`, `self.step` give every lesson the same rhythm
- `render.py` — Manim render, then FFmpeg finishing and poster

## Lessons

| Grade | Lesson | File | Idea |
|---|---|---|---|
| 1 | 1 | `count10` | count each thing once; the last number tells how many |
| 2 | 1 | `g2_placevalue` | tens and ones: 3 bundles + 4 sticks = 34 |
| 2 | 2 | `g2_add2d` | 27 + 15 = 42, ten ones make a new ten |
| 2 | 3 | `g2_sub2d` | 42 − 17 = 25, break a ten when ones run short |
| 2 | 4 | `g2_groups` | 3 groups of 4 = 3 × 4 = 12 (coffee-ceremony trays) |
| 2 | 5 | `g2_birr` | count birr from the biggest note: 10 + 10 + 5 + 1 = 26 |
| 2 | 6 | `g2_halves` | halves and quarters of injera; parts must be equal |

Still to animate: Grade 1 `teens`, `compare`, `add10`, `sub10`, `make10`.

Grade 2 text lives in `src/lessons-g2.js` (draft — needs review by an Amharic-speaking teacher).
It is not in the app build yet; only the animations use it. Each worked example is split into
sentences, and each sentence has its own clip `lesson.<id>.example.<n>` so the picture for that
sentence appears while it is spoken. `render.py` writes the Grade 2 recording list to
`dist/narration-script-g2.csv` (34 clips).

## Setup

```
# Debian/Ubuntu (macOS: brew install pango cairo ffmpeg)
sudo apt install ffmpeg libpango1.0-dev libcairo2-dev pkg-config fonts-noto-core
pip install -r animations/requirements.txt
```
LaTeX is optional (only needed for `MathTex`); lessons use plain `Text` with digits.
