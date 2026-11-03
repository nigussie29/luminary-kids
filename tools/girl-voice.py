#!/usr/bin/env python3
"""AI narration in a young girl's voice — free, no account or key needed.

Uses Microsoft's Amharic neural voice Mekdes (through the edge-tts package), pitched up and
slowed a little so she sounds like a bright, friendly girl talking to younger children.
There is no Amharic child voice yet; this is the closest. Replace with real recordings later.

Run on your own computer, from the luminary-kids folder:

    pip install edge-tts
    python3 tools/girl-voice.py --sample     # 6 audition lines → audio/sample/  (listen first)
    python3 tools/girl-voice.py              # every clip for the app, videos and exercises → audio/am/

Then push: the app and the lesson videos (python3 animations/render.py --all) use the clips.

Options:
    --pitch +22Hz   higher = younger (try +15Hz … +30Hz)
    --rate -10%     slower for little children
    --grade 2       only Grade 2 clips (or 1)
    --force         remake clips that already exist (human recordings are never overwritten)
"""
import argparse
import asyncio
import csv
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VOICE = "am-ET-MekdesNeural"
AUDITION = ["lesson.count10.story", "num.7", "ui.correct.0", "lesson.g2_add2d.example.1",
            "lesson.g2_groups.example.2", "lesson.g2_halves.title"]
G1_SCRIPT = r"""
const fs = require('fs'), path = require('path');
for (const f of ['i18n.js', 'engine.js', 'art.js', 'narration.js']) require(path.resolve('src', f));
const rows = globalThis.LK.narr.script();
const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
const csv = '\ufeff' + ['n,file name,Amharic to read,English meaning,note']
  .concat(rows.map((r, i) => [i + 1, r.key + '.m4a', r.am, r.en, r.note].map(q).join(','))).join('\r\n');
fs.writeFileSync(path.resolve('dist', 'narration-script.csv'), csv);
"""
HUMAN = (".m4a", ".wav", ".ogg", ".webm", ".aac")   # treated as real recordings: never replaced


def rows(grade=None):
    """Every clip the app and the videos use: the app's own lines, each video sentence, and every
    exercise sentence and number word (content/build.js). Shared sentences are listed once."""
    subprocess.run(["node", "-e", G1_SCRIPT], cwd=ROOT, check=True, capture_output=True)
    subprocess.run(["node", "animations/export_lessons.js"], cwd=ROOT, check=True, capture_output=True)
    subprocess.run(["node", "content/build.js"], cwd=ROOT, check=True, capture_output=True)
    out, seen = [], set()
    for name in ("narration-script.csv", "narration-script-videos.csv", "narration-script-exercises.csv"):
        with open(ROOT / "dist" / name, encoding="utf-8-sig", newline="") as fh:
            for r in csv.DictReader(fh):
                key = Path(r["file name"]).stem
                if key in seen:
                    continue
                if grade == 1 and ("g2_" in key):
                    continue
                if grade == 2 and key.startswith(("lesson.", "ex.")) and "g2_" not in key:
                    continue
                seen.add(key)
                out.append((key, r["Amharic to read"]))
    return out


async def speak(text, path, pitch, rate):
    import edge_tts
    for attempt in range(4):
        try:
            await edge_tts.Communicate(text, VOICE, rate=rate, pitch=pitch).save(str(path))
            return
        except Exception as e:  # network hiccups / throttling
            if attempt == 3:
                raise
            await asyncio.sleep(2 * (attempt + 1))


def tidy(path):
    """Trim silence at the ends and even the loudness (same target as tools/process-audio.sh)."""
    tmp = path.with_suffix(".tmp.mp3")
    subprocess.run(["ffmpeg", "-nostdin", "-loglevel", "error", "-y", "-i", str(path), "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,"
                    "areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.12,areverse,"
                    "loudnorm=I=-16:TP=-1.5:LRA=7", "-ar", "44100", "-ac", "1", "-b:a", "96k", str(tmp)],
                   check=True)
    tmp.replace(path)


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", action="store_true")
    ap.add_argument("--pitch", default="+22Hz")
    ap.add_argument("--rate", default="-10%")
    ap.add_argument("--grade", type=int, choices=[1, 2])
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    try:
        import edge_tts  # noqa: F401
    except ImportError as e:
        sys.exit(f"Could not load edge-tts: {e}\n"
                 f"Install it for this Python ({sys.executable}) with:\n"
                 f'    "{sys.executable}" -m pip install edge-tts')
    have_ffmpeg = shutil.which("ffmpeg") is not None   # optional: trims and evens loudness
    if not have_ffmpeg:
        print("(FFmpeg not found: clips are made without trimming; that is fine)")

    todo = rows(a.grade)
    if a.sample:
        todo = [r for r in todo if r[0] in AUDITION]
    out = ROOT / "audio" / ("sample" if a.sample else "am")
    out.mkdir(parents=True, exist_ok=True)

    made = skipped = 0
    for key, text in todo:
        if any((out / f"{key}{e}").exists() for e in HUMAN):
            skipped += 1          # a person recorded this one — keep it
            continue
        target = out / f"{key}.mp3"
        if target.exists() and not a.force:
            skipped += 1
            continue
        await speak(text, target, a.pitch, a.rate)
        if have_ffmpeg:
            tidy(target)
        made += 1
        print(f"ok  {key}")
    print(f"\n{made} clip(s) made, {skipped} kept · voice {VOICE} pitch {a.pitch} rate {a.rate} → {out.relative_to(ROOT)}")


if __name__ == "__main__":
    asyncio.run(main())
