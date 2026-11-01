"""Luminary Kids animation kit (Manim Community)."""
from pathlib import Path

from manim import Scene

from . import voice
from .parts import *  # noqa: F401,F403
from .parts2 import *  # noqa: F401,F403
from .style import *  # noqa: F401,F403
from .style import ANIM, setup

setup()


class LessonScene(Scene):
    """Base for lesson videos: writes the list of narration clips still to record."""

    # Shared beats every lesson uses: title → story → … → example recap.
    def title(self, L):
        from manim import UP, FadeIn, FadeOut
        card = title_card(L)  # noqa: F405
        self.play(FadeIn(card, shift=UP * 0.3), run_time=0.8)
        voice.say(self, f"lesson.{L['id']}.title", fallback=1.8)
        self.play(FadeOut(card, shift=UP * 0.3), run_time=0.5)

    def story(self, L, fallback=4.5):
        from manim import UP, FadeIn, FadeOut
        cap = caption_bar(L["story"]["am"], L["story"]["en"], am_size=30, en_size=20)  # noqa: F405
        self.play(FadeIn(cap, shift=UP * 0.15), run_time=0.5)
        voice.say(self, f"lesson.{L['id']}.story", fallback=fallback)
        self.play(FadeOut(cap), run_time=0.4)

    def recap(self, L, fallback=7.0, max_chars=46):
        """Whole worked example as a caption with its recorded line. Returns the caption."""
        from manim import UP, FadeIn
        cap = caption_bar(L["example"]["am"], L["example"]["en"], am_size=26, en_size=18,  # noqa: F405
                          max_chars=max_chars)
        self.play(FadeIn(cap, shift=UP * 0.15), run_time=0.5)
        voice.say(self, f"lesson.{L['id']}.example", fallback=fallback)
        return cap

    def step(self, L, i, *anims, run_time=1.5, fallback=2.6):
        """Sentence i of the worked example: caption + its own clip (lesson.<id>.example.<i>),
        with `anims` (the picture for that sentence) playing while the voice speaks.
        Waits until both the voice and the animation are done."""
        from manim import UP, FadeIn, FadeOut
        s = L["steps"][i]
        cap = caption_bar(s["am"], s["en"], am_size=30, en_size=20, max_chars=46)  # noqa: F405
        old = getattr(self, "_step_cap", None)
        self.play(FadeIn(cap, shift=UP * 0.1), *([FadeOut(old)] if old is not None else []), run_time=0.4)
        self._step_cap = cap
        length = voice.say(self, f"lesson.{L['id']}.example.{i}", fallback=fallback, wait=False)
        spent = 0.0
        if anims:
            self.play(*anims, run_time=run_time)
            spent = run_time
        if length > spent:
            self.wait(length - spent)
        return cap

    def clear_step(self):
        from manim import FadeOut
        if getattr(self, "_step_cap", None) is not None:
            self.play(FadeOut(self._step_cap), run_time=0.3)
            self._step_cap = None

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
