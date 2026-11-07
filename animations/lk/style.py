"""Luminary Kids look for Manim: the app's palette (src/styles.css), Ethiopic text and captions."""
import json
from pathlib import Path

from manim import (DOWN, UP, ManimColor, Text, VGroup, config)

ROOT = Path(__file__).resolve().parents[2]          # repo root
ANIM = ROOT / "animations"

# Palette from the Ethiopian highlands — same tokens as src/styles.css (light theme).
BG = ManimColor("#f2f6f3")
SURFACE = ManimColor("#ffffff")
TRAY = ManimColor("#e9f0ea")
INK = ManimColor("#1d2540")
MUTED = ManimColor("#586178")
LINE = ManimColor("#d3dcdb")
ADEY = ManimColor("#f2b705")          # Adey Abeba marigold
ADEY_SOFT = ManimColor("#fff1c2")
LAKE = ManimColor("#1f7a8c")
LAKE_SOFT = ManimColor("#d9eef2")
FIELD = ManimColor("#2f8f5b")
FIELD_SOFT = ManimColor("#dcf1e4")
BERRY = ManimColor("#b8456e")
BERRY_SOFT = ManimColor("#f8e1ea")

FONT_ETH = "Noto Sans Ethiopic"       # Amharic (Ge'ez script)
FONT_LATIN = "Noto Sans"              # English subtitles and digits


def setup():
    """Call at import time in every lesson file."""
    config.background_color = BG


def data():
    """Lesson text exported from src/i18n.js by export_lessons.js."""
    return json.loads((ANIM / "lessons.json").read_text(encoding="utf-8"))


def lesson(lesson_id):
    return next(l for l in data()["lessons"] if l["id"] == lesson_id)


def number_word(n, lang="am"):
    """Number word 0–1000 in Amharic ('ሁለት መቶ አርባ አምስት') or English ('two hundred forty-five')."""
    d = data()
    if n == 1000:
        return "አንድ ሺህ" if lang == "am" else "one thousand"
    if n >= 100:
        h, rest = divmod(n, 100)
        if lang == "am":
            head = "መቶ" if h == 1 else f"{d['numWords']['am'][h]} መቶ"
        else:
            head = f"{d['numWords']['en'][h]} hundred"
        return f"{head} {number_word(rest, lang)}" if rest else head
    if n <= 20:
        return d["numWords"][lang][n]
    tens, ones = divmod(n, 10)
    t = d["tensWords"][lang][tens]
    if not ones:
        return t
    return f"{t} {d['numWords'][lang][ones]}" if lang == "am" else f"{t}-{d['numWords'][lang][ones]}"


def am(text,size=40, color=INK, weight="NORMAL"):
    """Amharic text. Pango shapes the Ethiopic syllables correctly."""
    return Text(text, font=FONT_ETH, font_size=size, color=color, weight=weight)


def en(text, size=26, color=MUTED, weight="NORMAL"):
    return Text(text, font=FONT_LATIN, font_size=size, color=color, weight=weight)


def num(n, size=96, color=INK):
    """A digit for the numeral itself (Arabic numerals, as taught in Ethiopian Grade 1)."""
    return Text(str(n), font=FONT_LATIN, font_size=size, color=color, weight="BOLD")


def wrap(text, max_chars):
    """Break a sentence into lines at spaces, at most max_chars per line."""
    lines, line = [], ""
    for word in text.split(" "):
        if line and len(line) + 1 + len(word) > max_chars:
            lines.append(line)
            line = word
        else:
            line = f"{line} {word}".strip()
    if line:
        lines.append(line)
    return "\n".join(lines)


def caption(am_text, en_text=None, am_size=34, en_size=22, max_chars=38):
    """Amharic line with a smaller English line under it, wrapped and centred."""
    def block(text, chars, font, size, color, buff):
        # One Text per line so every line is centred, not left-aligned.
        lines = [Text(s, font=font, font_size=size, color=color) for s in wrap(text, chars).split("\n")]
        return VGroup(*lines).arrange(DOWN, buff=buff)

    parts = [block(am_text, max_chars, FONT_ETH, am_size, INK, 0.12)]
    if en_text:
        parts.append(block(en_text, int(max_chars * 1.6), FONT_LATIN, en_size, MUTED, 0.06))
    return VGroup(*parts).arrange(DOWN, buff=0.2)


def caption_bar(am_text, en_text=None, **kw):
    """Caption pinned to the bottom of the frame."""
    c = caption(am_text, en_text, **kw)
    return c.to_edge(DOWN, buff=0.4)


def title_card(l):
    """Lesson number, Amharic title and English title."""
    g = l.get("grade", 1)
    eyebrow = en(f"{g}ኛ ክፍል · ትምህርት {l['n']}  ·  Grade {g} · Lesson {l['n']}",
                 size=24, color=LAKE, weight="BOLD")
    title = am(l["title"]["am"], size=64, weight="BOLD")
    sub = en(l["title"]["en"], size=30)
    return VGroup(eyebrow, title, sub).arrange(DOWN, buff=0.3)


__all__ = [n for n in dir() if not n.startswith("_")] + ["UP", "DOWN"]
