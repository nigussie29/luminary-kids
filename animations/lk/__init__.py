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

    # Picture first, voice right behind it: the picture for a sentence starts LEAD seconds
    # before she begins that sentence, keeps building while she speaks (stretched up to
    # MAX_RUN seconds for long sentences), and the next step waits until she has finished.
    LEAD = 0.45
    CAPTION = 0.3
    MAX_RUN = 4.0

    def step(self, L, i, *anims, run_time=1.5, fallback=2.6, gap=0.3):
        """Sentence i of the worked example (clip lesson.<id>.example.<i>) with `anims`,
        the picture for that sentence."""
        from manim import UP, FadeIn, FadeOut
        s = L["steps"][i]
        key = f"lesson.{L['id']}.example.{i}"
        cap = caption_bar(s["am"], s["en"], am_size=30, en_size=20, max_chars=46)  # noqa: F405
        old = getattr(self, "_step_cap", None)
        talk = voice.length(key, fallback)
        # voice starts after the caption appears and the picture has begun moving
        voice.say(self, key, fallback=fallback, wait=False, offset=self.CAPTION + (self.LEAD if anims else 0))
        self.play(FadeIn(cap, shift=UP * 0.1), *([FadeOut(old)] if old is not None else []),
                  run_time=self.CAPTION)
        self._step_cap = cap
        if anims:
            run = max(run_time, min(self.LEAD + 0.8 * talk, self.MAX_RUN))
            self.play(*anims, run_time=run)
            rest = self.LEAD + talk - run
        else:
            rest = talk
        self.wait(max(rest, 0) + gap)
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
