"""Narration for animations, using the same clips the app plays (audio/am/<key>.<ext>).

    say(scene, "lesson.count10.story", fallback=4)

If the clip exists it is added to the soundtrack and the scene waits exactly as long as the clip,
so pictures stay in step with the voice. If it doesn't exist yet, the scene waits `fallback`
seconds and the key is logged, so silent drafts keep the right pacing and the missing clips
show up in `missing.txt` beside the video.
"""
import json
import subprocess
from pathlib import Path

from .style import ROOT

AUDIO = ROOT / "audio" / "am"
EXTS = (".m4a", ".mp3", ".wav", ".ogg", ".webm", ".aac")
MISSING = []


def clip(key):
    for ext in EXTS:
        p = AUDIO / f"{key}{ext}"
        if p.exists():
            return p
    return None


def duration(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "json", str(path)], capture_output=True, text=True, check=True)
    return float(json.loads(out.stdout)["format"]["duration"])


def length(key, fallback=2.0):
    """Seconds of speech in clip `key` (or `fallback` if it isn't recorded yet)."""
    p = clip(key)
    return duration(p) if p else fallback


def say(scene, key, fallback=2.0, gap=0.25, wait=True, offset=0.0):
    """Start clip `key` `offset` seconds from now. Returns its length + gap (without the offset).
    With wait=False the caller animates while she speaks."""
    p = clip(key)
    if p:
        scene.add_sound(str(p), time_offset=offset)
        n = duration(p)
    else:
        if key not in MISSING:
            MISSING.append(key)
        n = fallback
    if wait:
        scene.wait(offset + n + gap)
    return n + gap


def write_missing(out_dir):
    """Called by render.py after a scene finishes."""
    if MISSING:
        Path(out_dir).mkdir(parents=True, exist_ok=True)
        (Path(out_dir) / "missing.txt").write_text("\n".join(MISSING) + "\n", encoding="utf-8")
