"""Luminary Kids animation kit (Manim Community)."""
from pathlib import Path

from manim import Scene

from . import voice
from .parts import *  # noqa: F401,F403
from .style import *  # noqa: F401,F403
from .style import ANIM, setup

setup()


class LessonScene(Scene):
    """Base for lesson videos: writes the list of narration clips still to record."""

    def tear_down(self):
        out = ANIM / "media" / "missing"
        out.mkdir(parents=True, exist_ok=True)
        f = out / f"{type(self).__name__}.txt"
        if voice.MISSING:
            f.write_text("\n".join(voice.MISSING) + "\n", encoding="utf-8")
        elif f.exists():
            f.unlink()
        super().tear_down()


say = voice.say
