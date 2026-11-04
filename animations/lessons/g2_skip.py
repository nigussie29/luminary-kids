"""Grade 2 · Lesson 7 — ዘለን እንቁጠር፤ ጥንድ እና ጎዶሎ (Skip counting, even and odd): pairs of oranges, 10 is even, 11 is odd,
counting in fives."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, ArcBetweenPoints, Circumscribe, Create, FadeIn, FadeOut, Group, LaggedStart,
                   RoundedRectangle, Succession, VGroup)

from lk import (ADEY, BERRY, FIELD, INK, LAKE, Axis, LessonScene, Orange, am, badge, en, lesson, num)

L = lesson("g2_skip")


class G2Skip(LessonScene):
    def construct(self):
        self.title(L)
        pairs = VGroup(*[VGroup(Orange(1.2), Orange(1.2)).arrange(DOWN, buff=0.12) for _ in range(5)]).arrange(RIGHT, buff=0.6).move_to(UP * 1.4)
        self.play(LaggedStart(*[FadeIn(p, shift=DOWN * 0.2) for p in pairs], lag_ratio=0.2), run_time=1.2)
        self.story(L)

        # 0 · 2, 4, 6, 8, 10
        tags = VGroup(*[badge(2 * (i + 1), color=LAKE).scale(1.1).next_to(p, UP, buff=0.15) for i, p in enumerate(pairs)])
        self.step(L, 0, LaggedStart(*[FadeIn(t, scale=1.5) for t in tags], lag_ratio=0.35), run_time=2.2)

        # 1 · every orange has a partner: 10 is even
        rings = VGroup(*[RoundedRectangle(width=p.width + 0.25, height=p.height + 0.25, corner_radius=0.2, stroke_color=FIELD, stroke_width=4).move_to(p) for p in pairs])
        even = VGroup(num(10, 72, FIELD), am("ጥንድ ቁጥር", 40, FIELD), en("even", 22)).arrange(RIGHT, buff=0.25).move_to(DOWN * 0.6)
        self.step(L, 1, LaggedStart(*[Create(r) for r in rings], lag_ratio=0.15), FadeIn(even, shift=UP * 0.2), run_time=1.8)

        # 2 · one more orange is left on its own: 11 is odd
        extra = Orange(1.2).next_to(pairs, RIGHT, buff=0.6).align_to(pairs[-1][0], UP)
        odd = VGroup(num(11, 72, BERRY), am("ጎዶሎ ቁጥር", 40, BERRY), en("odd", 22)).arrange(RIGHT, buff=0.25).move_to(DOWN * 0.6)
        self.step(L, 2, FadeIn(extra, shift=LEFT * 0.3), Circumscribe(extra, color=BERRY), FadeOut(even), FadeIn(odd), run_time=1.8)

        # 3 · counting in fives on a number line
        axis = Axis(0, 20, 5, width=9, size=26).move_to(DOWN * 1.6)
        hops = [ArcBetweenPoints(axis.point(5 * k) + UP * 0.2, axis.point(5 * (k + 1)) + UP * 0.2, angle=-1.4, stroke_color=ADEY, stroke_width=5) for k in range(4)]
        self.step(L, 3, FadeOut(Group(pairs, tags, rings, extra, odd)), FadeIn(axis), Succession(*[Create(h) for h in hops]), run_time=3.0)
        self.clear_step()
        self.play(Circumscribe(axis.labels, color=ADEY), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
