"""Grade 3 · Lesson 7 — ማወዳደር እና ማጠጋጋት (Comparing and rounding): 348 < 384; 348 ≈ 350 ≈ 300.
Big idea: compare place by place from the left; rounding means finding the closest ten or hundred on a number line."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Arrow, Circumscribe, CurvedArrow, FadeIn, FadeOut, GrowArrow, Indicate,
                   LaggedStart, SurroundingRectangle, VGroup)

from lk import (ADEY, BERRY, FIELD, INK, LAKE, ONES_C, Axis, LessonScene, Orange, am, en, lesson, num)

L = lesson("g3_round")


def number(n, size=88):
    d = [n // 100, n // 10 % 10, n % 10]
    return VGroup(*[num(x, size, c) for x, c in zip(d, (BERRY, LAKE, ONES_C))]).arrange(RIGHT, buff=0.05)


def team(color, n):
    pile = VGroup(*[Orange(0.7).set_color(color) for _ in range(6)]).arrange_in_grid(rows=2, buff=0.05)
    return VGroup(pile, num(n, 56, INK)).arrange(DOWN, buff=0.15)


class G3Round(LessonScene):
    def construct(self):
        self.title(L)
        red, blue = team("#c0392b", 348).move_to(LEFT * 3 + UP * 1.4), team("#2a6fb0", 384).move_to(RIGHT * 3 + UP * 1.4)
        self.play(FadeIn(red, shift=UP * 0.2), FadeIn(blue, shift=UP * 0.2), run_time=0.8)
        self.story(L)

        a, b = number(348).move_to(UP * 1.9), number(384).move_to(UP * 0.7)
        self.play(FadeOut(VGroup(red, blue)), FadeIn(a), FadeIn(b), run_time=0.6)

        # 0 · same hundreds → compare the tens
        self.step(L, 0, Circumscribe(VGroup(a[0], b[0]), color=BERRY, fade_out=True), run_time=1.4)

        # 1 · 4 tens < 8 tens → 348 < 384
        box = SurroundingRectangle(VGroup(a[1], b[1]), color=LAKE, buff=0.12)
        sign = VGroup(number(348, 64), num("<", 64, INK), number(384, 64)).arrange(RIGHT, buff=0.3).move_to(RIGHT * 4.2 + UP * 1.3)
        self.step(L, 1, FadeIn(box), FadeIn(sign, shift=LEFT * 0.2), run_time=1.6)

        # 2 · on the number line 348 is closest to 350
        axis = Axis(300, 400, 10, width=11, labels={300: "300", 350: "350", 400: "400"}).move_to(DOWN * 1.0)
        dot = num("●", 40, BERRY).move_to(axis.point(348) + UP * 0.05)
        tag = num(348, 36, BERRY).next_to(dot, UP, buff=0.25)
        near = Arrow(axis.point(348) + UP * 0.6, axis.point(350) + UP * 0.25, buff=0, color=FIELD, stroke_width=6)
        self.step(L, 2, FadeOut(VGroup(a, b, box)), sign.animate.move_to(UP * 2.4), FadeIn(axis), FadeIn(dot, scale=1.6), FadeIn(tag),
                  GrowArrow(near), run_time=2.0)

        # 3 · nearest hundred: 300 (348 is before the middle, 350)
        mid = Indicate(axis.labels[1], color=ADEY, scale_factor=1.4)
        back = CurvedArrow(axis.point(348) + DOWN * 0.75, axis.point(300) + DOWN * 0.75, color=BERRY, angle=-0.6)
        res = VGroup(number(348, 64), num("≈", 64, INK), num(300, 64, BERRY)).arrange(RIGHT, buff=0.3).move_to(UP * 1.2)
        self.step(L, 3, mid, FadeOut(near), FadeIn(back), FadeIn(res, shift=UP * 0.2), run_time=2.0)
        self.clear_step()
        self.play(Circumscribe(res, color=BERRY), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(VGroup(sign, axis, dot, tag, back, res)), run_time=0.8)
