#!/usr/bin/env python3
"""Render lesson animations: Manim draws the frames, FFmpeg finishes the file for phones.

    python3 animations/render.py count10            # draft, 480p, fast
    python3 animations/render.py count10 --hd       # 1080p for publishing
    python3 animations/render.py --all --hd

Output: dist/video/<lesson>.mp4 (H.264, AAC, fast-start for streaming)
        dist/video/<lesson>.jpg (poster frame for the lesson card)
Narration clips still to record are listed in animations/media/missing/<Scene>.txt.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

ANIM = Path(__file__).resolve().parent
ROOT = ANIM.parent
OUT = ROOT / "dist" / "video"
MEDIA = ANIM / "media"

QUALITY = {"draft": ("l", "480p15"), "std": ("m", "720p30"), "hd": ("h", "1080p60")}


def scene_name(py):
    m = re.search(r"^class (\w+)\(LessonScene\)", py.read_text(encoding="utf-8"), re.M)
    if not m:
        sys.exit(f"{py.name}: no LessonScene class found")
    return m.group(1)


def timeline(lesson_id):
    f = ANIM / "timelines" / f"{lesson_id}.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else None


def vtt(cues, lang):
    def ts(t):
        h, rem = divmod(max(t, 0), 3600)
        m, sec = divmod(rem, 60)
        return f"{int(h):02d}:{int(m):02d}:{sec:06.3f}"
    out = ["WEBVTT", ""]
    for i, c in enumerate(cues, 1):
        out += [str(i), f"{ts(c['start'])} --> {ts(c['end'])}", c[lang], ""]
    return "\n".join(out)


def run(cmd):
    print("$", " ".join(map(str, cmd)))
    subprocess.run(cmd, check=True, cwd=ROOT)


def render(lesson_id, q):
    py = ANIM / "lessons" / f"{lesson_id}.py"
    if not py.exists():
        sys.exit(f"no animation yet for '{lesson_id}' (expected {py.relative_to(ROOT)})")
    scene = scene_name(py)
    flag, folder = QUALITY[q]
    run([sys.executable, "-m", "manim", "render", f"-q{flag}", "--disable_caching",
         "--media_dir", MEDIA, py, scene])
    raw = MEDIA / "videos" / lesson_id / folder / f"{scene}.mp4"

    OUT.mkdir(parents=True, exist_ok=True)
    mp4, jpg = OUT / f"{lesson_id}.mp4", OUT / f"{lesson_id}.jpg"
    has_audio = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
                                "stream=index", "-of", "csv=p=0", raw],
                               capture_output=True, text=True).stdout.strip() != ""
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-i", raw,
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-pix_fmt", "yuv420p",
           "-movflags", "+faststart"]
    # Narration evened out to -16 LUFS, same target as tools/process-audio.sh.
    cmd += ["-af", "loudnorm=I=-16:TP=-1.5:LRA=7", "-c:a", "aac", "-b:a", "96k"] if has_audio else ["-an"]
    run(cmd + [mp4])
    # Small copy for slow connections: 360p, lower bitrate, mono narration.
    (OUT / "low").mkdir(exist_ok=True)
    low = ["ffmpeg", "-y", "-loglevel", "error", "-i", mp4, "-vf", "scale=-2:360", "-r", "24",
           "-c:v", "libx264", "-preset", "veryfast", "-crf", "30", "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
    low += ["-c:a", "aac", "-b:a", "48k", "-ac", "1"] if has_audio else ["-an"]
    run(low + [OUT / "low" / f"{lesson_id}.mp4"])
    # Poster: the first moment of the story (after the title card).
    tl = timeline(lesson_id)
    at = str(round((tl["marks"].get("story", 3) + 1.5), 2)) if tl else "8"
    run(["ffmpeg", "-y", "-loglevel", "error", "-ss", at, "-i", mp4, "-frames:v", "1", "-q:v", "3", jpg])
    if not jpg.exists():
        run(["ffmpeg", "-y", "-loglevel", "error", "-i", mp4, "-frames:v", "1", "-q:v", "3", jpg])
    # Captions: Amharic (also burned into the picture) and optional English subtitles.
    if tl:
        for lang in ("am", "en"):
            (OUT / f"{lesson_id}.{lang}.vtt").write_text(vtt(tl["cues"], lang), encoding="utf-8")
        dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", mp4],
                                   capture_output=True, text=True).stdout.strip() or 0)
        if dur > 60:
            print(f"! {lesson_id} is {dur:.1f}s — hook videos should stay under 60 seconds")

    missing = MEDIA / "missing" / f"{scene}.txt"
    note = f" · {len(missing.read_text().split())} narration clip(s) not recorded yet" if missing.exists() else ""
    print(f"✓ {mp4.relative_to(ROOT)}{note}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("lessons", nargs="*")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--hd", action="store_true", help="1080p60 for publishing")
    ap.add_argument("--std", action="store_true", help="720p30")
    a = ap.parse_args()
    run(["node", ANIM / "export_lessons.js"])
    ids = sorted(p.stem for p in (ANIM / "lessons").glob("*.py")) if a.all else a.lessons
    if not ids:
        ap.error("name a lesson (e.g. count10) or use --all")
    q = "hd" if a.hd else "std" if a.std else "draft"
    for i in ids:
        render(i, q)
    # checkpoint times in the lesson files come from the timelines just written
    run(["node", ROOT / "content" / "build.js"])
    run(["node", ROOT / "build.js"])


if __name__ == "__main__":
    main()
