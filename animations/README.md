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
- `lk/voice.py` — narration clips and timing
- `lessons/<id>.py` — one `LessonScene` per lesson (file name = lesson id)
- `render.py` — Manim render, then FFmpeg finishing and poster

Done: `count10`. To do: `teens`, `compare`, `add10`, `sub10`, `make10`.

## Setup

```
# Debian/Ubuntu (macOS: brew install pango cairo ffmpeg)
sudo apt install ffmpeg libpango1.0-dev libcairo2-dev pkg-config fonts-noto-core
pip install -r animations/requirements.txt
```
LaTeX is optional (only needed for `MathTex`); lessons use plain `Text` with digits.
