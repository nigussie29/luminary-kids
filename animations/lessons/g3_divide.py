"""Grade 3 · Lesson 9 — ማካፈል እና ማባዛት (Division and multiplication): 24 ÷ 6 = 4 because 4 × 6 = 24."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, LaggedStart, RoundedRectangle, VGroup)

from lk import (BERRY, FIELD, INK, LAKE, Kid, LessonScene, badge, lesson, num)

L = lesson("g3_divide")


class G3Divide(LessonScene):
    def construct(self):
        self.title(L)
        kids = VGroup(*[Kid(i, s=0.55) for i in range(24)]).arrange_in_grid(rows=3, buff=(0.4, 0.35)).move_to(UP * 1.2)
        self.play(LaggedStart(*[FadeIn(k, shift=UP * 0.1) for k in kids], lag_ratio=0.03), run_time=1.2)
        self.story(L)

        # 0 · groups of six
        spots = VGroup(*[VGroup(*[Kid(0, s=0.55) for _ in range(6)]).arrange_in_grid(rows=2, buff=(0.2, 0.25)) for _ in range(4)]) \
            .arrange(RIGHT, buff=0.6).move_to(UP * 1.3)
        rings = VGroup(*[RoundedRectangle(width=g.width + 0.35, height=g.height + 0.35, corner_radius=0.25, stroke_color=c, stroke_width=4)
                         .move_to(g) for g, c in zip(spots, (LAKE, FIELD, BERRY, "#7a5bb5"))])
        moves = [kids[i].animate.move_to(spots[i // 6][i % 6]) for i in range(24)]
        self.step(L, 0, *moves, FadeIn(rings), run_time=2.4)

        # 1 · four teams
        tags = VGroup(*[badge(i + 1, color=INK).scale(1.1).next_to(r, UP, buff=0.15) for i, r in enumerate(rings)])
        self.step(L, 1, LaggedStart(*[FadeIn(t, scale=1.5) for t in tags], lag_ratio=0.3), run_time=1.4)

        # 2 · 24 ÷ 6 = 4
        d = VGroup(num(24, 72, INK), num("÷", 72, INK), num(6, 72, LAKE), num("=", 72, INK), num(4, 72, BERRY)).arrange(RIGHT, buff=0.25).move_to(DOWN * 0.7)
        self.step(L, 2, FadeIn(d, shift=UP * 0.2), run_time=1.4)

        # 3 · because 4 × 6 = 24
        m = VGroup(num(4, 72, BERRY), num("×", 72, INK), num(6, 72, LAKE), num("=", 72, INK), num(24, 72, INK)).arrange(RIGHT, buff=0.25).next_to(d, DOWN, buff=0.3)
        self.step(L, 3, FadeIn(m, shift=UP * 0.2), run_time=1.4)
        self.clear_step()
        self.play(Circumscribe(VGroup(d, m), color=BERRY), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(VGroup(kids, rings, tags, d, m)), run_time=0.8)
