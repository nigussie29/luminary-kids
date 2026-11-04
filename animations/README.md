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
- **Voice** uses the same clips as the app (`audio/am/<key>.m4a`/`.mp3`). In `self.step(...)` the picture
  starts first and her voice follows 0.45 s later; the picture keeps building while she speaks and the
  next step waits until she has finished (`LEAD`, `MAX_RUN` in `lk/__init__.py`). Missing clips fall back
  to a timed pause and are listed in `animations/media/missing/<Scene>.txt`.
- **Look** uses the app's palette (`lk/style.py`) and Noto Sans Ethiopic for Amharic.

## Files

- `lk/style.py` — colours, Amharic/English text, captions, title card
- `lk/parts.py` — TenFrame, Counter, NumberLine, Flower, Mango, Orange, badges
- `lk/parts2.py` — base-ten rods and ones, place-value mat, written columns, stick bundles, trays and cups, birr notes and coins, injera fractions, children, the bajaj, the mango tree
- `lk/parts3.py` — hundred flats, the hundreds/tens/ones mat, three-digit columns, coffee seedlings in rows, plates
- `lk/parts4.py` — egg boxes, ruler and pencil, kitchen scale, jerrycan, clock, number lines with any labels, bar charts
- `lk/voice.py` — narration clips and timing
- `lessons/<id>.py` — one `LessonScene` per lesson (file name = lesson id); `self.title`, `self.story`, `self.step` give every lesson the same rhythm
- `render.py` — Manim render, then FFmpeg finishing and poster

## Lessons

Every lesson has a hook video (all under 60 s): `count10`, `teens`, `compare`, `add10`, `sub10`, `make10`
(Grade 1), `g2_placevalue`, `g2_add2d`, `g2_sub2d`, `g2_groups`, `g2_birr`, `g2_halves`, `g2_skip`, `g2_compare`, `g2_measure`,
`g2_time`, `g2_shapes`, `g2_graphs` (Grade 2) and
`g3_hundreds`, `g3_add3d`, `g3_sub3d`, `g3_times`, `g3_share`, `g3_fractions`, `g3_round`, `g3_tables`,
`g3_divide`, `g3_fracline`, `g3_measure`, `g3_time`, `g3_shapes`, `g3_area`, `g3_graphs` (Grade 3).

While a video renders, `LessonScene` writes `animations/timelines/<lesson>.json`: when the title, story and
each worked-example sentence (`step0`, `step1`, …) start, plus any `self.mark("name")`, and the caption
text. `render.py` turns that into the caption files and then rebuilds the lesson files, so a checkpoint
written as `"at": "step:2"` in `content/build.js` pauses the video just before sentence 2 — and stays
right when the narration changes length. Captions burned into the picture are Amharic only
(`LK_BURN_EN=1` adds English); English is a separate subtitle track.

Each render writes `dist/video/<id>.mp4` (720p), `dist/video/low/<id>.mp4` (360p for slow connections),
`<id>.jpg` (poster), `<id>.am.vtt` and `<id>.en.vtt`.

Worked examples are split into sentences; each has its own clip `lesson.<id>.example.<n>`
(listed in `dist/narration-script-videos.csv`) so the picture for that sentence appears as it is spoken.

## Setup

```
# Debian/Ubuntu (macOS: brew install pango cairo ffmpeg)
sudo apt install ffmpeg libpango1.0-dev libcairo2-dev pkg-config fonts-noto-core
pip install -r animations/requirements.txt
```
LaTeX is optional (only needed for `MathTex`); lessons use plain `Text` with digits.
