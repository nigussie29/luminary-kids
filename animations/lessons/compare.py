"""Grade 1 · Lesson 3 — ብዙ ወይስ ጥቂት? (More or fewer?): match cups one to one; leftovers mean more.
Checkpoints pause before step 0 (which tray has more?) and before step 1 (how many have no partner?)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Create, FadeIn, FadeOut, Indicate, LaggedStart, Line, SurroundingRectangle, VGroup)

from lk import (BERRY, FIELD, INK, LessonScene, TrayOf, am, en, lesson, num)

L = lesson("compare")


class Compare(LessonScene):
    def construct(self):
        self.title(L)
        top = TrayOf(6, s=0.62).move_to(UP * 1.9)
        bottom = TrayOf(4, s=0.62)
        bottom.move_to(UP * -0.3).align_to(top, LEFT)
        # line the cups up exactly under each other so the matching lines are straight
        shift = top.cups[0].get_center()[0] - bottom.cups[0].get_center()[0]
        bottom.shift(RIGHT * shift)
        self.play(FadeIn(top.tray), FadeIn(bottom.tray), run_time=0.5)
        self.play(LaggedStart(*[FadeIn(c, shift=DOWN * 0.2) for c in [*top.cups, *bottom.cups]], lag_ratio=0.1), run_time=1.6)
        self.story(L)
        self.wait(0.5)

        # 0 · match the cups one to one
        links = VGroup(*[Line(top.cups[i].get_bottom() + DOWN * 0.08, bottom.cups[i].get_top() + UP * 0.08, stroke_color=FIELD, stroke_width=6) for i in range(4)])
        self.step(L, 0, LaggedStart(*[Create(x) for x in links], lag_ratio=0.35), run_time=2.0)
        self.wait(0.5)
        # 1 · the tray with cups left over has more
        spare = VGroup(top.cups[4], top.cups[5])
        ring = SurroundingRectangle(spare, color=BERRY, buff=0.15, corner_radius=0.2, stroke_width=6)
        more = VGroup(num(6, 72, BERRY), num(">", 72, INK), num(4, 72, INK)).arrange(RIGHT, buff=0.3).next_to(bottom, RIGHT, buff=0.9)
        self.step(L, 1, Create(ring), Indicate(spare, color=BERRY, scale_factor=1.25), FadeIn(more, shift=UP * 0.2), run_time=1.8)
        self.clear_step()
        words = VGroup(am("ላይኛው ትሪ ብዙ አለው", 44, BERRY), en("The top tray has more", 24)).arrange(DOWN, buff=0.1).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(words, shift=UP * 0.2), run_time=0.6)
        self.wait(1.6)
        self.play(FadeOut(VGroup(top, bottom, links, ring, more, words)), run_time=0.7)
