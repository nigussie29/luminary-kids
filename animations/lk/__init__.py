"""Luminary Kids animation kit (Manim Community)."""
import json
import os

from manim import Scene

from . import voice
from .parts import *  # noqa: F401,F403
from .parts2 import *  # noqa: F401,F403
from .parts3 import *  # noqa: F401,F403
from .style import *  # noqa: F401,F403
from .style import ANIM, setup

setup()

# Burned-in captions are Amharic only; English is a separate, optional subtitle track (VTT).
BURN_EN = os.environ.get("LK_BURN_EN") == "1"


class LessonScene(Scene):
    """Base for lesson videos. Records a timeline while rendering — when each part starts and
    what the caption says — so the app can pause at checkpoints and show captions:
    animations/timelines/<lesson>.json (render.py turns it into .am.vtt / .en.vtt)."""

    def setup(self):
        self.lesson_id = None
        self.timeline = {"marks": {}, "cues": []}
        self._cue = None

    # ---- timeline ----
    def now(self):
        return round(self.renderer.time, 3)

    def mark(self, name):
        self.timeline["marks"][name] = self.now()

    def cue_on(self, am, en):
        self.cue_off()
        self._cue = {"start": self.now(), "am": am, "en": en}

    def cue_off(self):
        if self._cue:
            self._cue["end"] = self.now()
            if self._cue["end"] > self._cue["start"]:
                self.timeline["cues"].append(self._cue)
            self._cue = None

    def _cap(self, am, en, **kw):
        return caption_bar(am, en if BURN_EN else None, **kw)  # noqa: F405

    # ---- shared beats every lesson uses: title → story → steps (→ recap) ----
    def title(self, L):
        from manim import UP, FadeIn, FadeOut
        self.lesson_id = L["id"]
        self.mark("title")
        card = title_card(L)  # noqa: F405
        self.cue_on(L["title"]["am"], L["title"]["en"])
        self.play(FadeIn(card, shift=UP * 0.3), run_time=0.8)
        voice.say(self, f"lesson.{L['id']}.title", fallback=1.8)
        self.play(FadeOut(card, shift=UP * 0.3), run_time=0.5)
        self.cue_off()

    def story(self, L, fallback=4.5):
        from manim import UP, FadeIn, FadeOut
        self.mark("story")
        cap = self._cap(L["story"]["am"], L["story"]["en"], am_size=30, en_size=20)
        self.cue_on(L["story"]["am"], L["story"]["en"])
        self.play(FadeIn(cap, shift=UP * 0.15), run_time=0.5)
        voice.say(self, f"lesson.{L['id']}.story", fallback=fallback)
        self.play(FadeOut(cap), run_time=0.4)
        self.cue_off()

    def recap(self, L, fallback=7.0, max_chars=46):
        """Whole worked example as a caption with its recorded line. Returns the caption."""
        from manim import UP, FadeIn
        self.mark("recap")
        cap = self._cap(L["example"]["am"], L["example"]["en"], am_size=26, en_size=18, max_chars=max_chars)
        self.cue_on(L["example"]["am"], L["example"]["en"])
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
        the picture for that sentence. Checkpoints in the lesson file can pause at 'step:i'."""
        from manim import UP, FadeIn, FadeOut
        self.mark(f"step{i}")
        s = L["steps"][i]
        key = f"lesson.{L['id']}.example.{i}"
        cap = self._cap(s["am"], s["en"], am_size=30, en_size=20, max_chars=46)
        old = getattr(self, "_step_cap", None)
        talk = voice.length(key, fallback)
        # voice starts after the caption appears and the picture has begun moving
        voice.say(self, key, fallback=fallback, wait=False, offset=self.CAPTION + (self.LEAD if anims else 0))
        self.cue_on(s["am"], s["en"])
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
        self.cue_off()

    def tear_down(self):
        self.cue_off()
        if self.lesson_id:
            out = ANIM / "timelines"
            out.mkdir(parents=True, exist_ok=True)
            self.timeline["duration"] = self.now()
            self.timeline["lesson"] = self.lesson_id
            (out / f"{self.lesson_id}.json").write_text(json.dumps(self.timeline, ensure_ascii=False, indent=1), encoding="utf-8")
        out = ANIM / "media" / "missing"
        out.mkdir(parents=True, exist_ok=True)
        f = out / f"{type(self).__name__}.txt"
        if voice.MISSING:
            f.write_text("\n".join(voice.MISSING) + "\n", encoding="utf-8")
        elif f.exists():
            f.unlink()
        super().tear_down()


say = voice.say
