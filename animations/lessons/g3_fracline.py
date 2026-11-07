"""Grade 3 · Lesson 10 — ክፍልፋዮች በቁጥር መስመር ላይ (Fractions on a number line): quarters from 0 to 1; 2/4 = 1/2."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (Group, DOWN, LEFT, RIGHT, UP, ArcBetweenPoints, Circumscribe, Create, DashedLine, FadeIn, FadeOut,
                   LaggedStart, Line, Succession, VGroup)

from lk import (ADEY, BERRY, INK, LAKE, Axis, Kid, LessonScene, am, en, lesson, num)

L = lesson("g3_fracline")


def frac(a, b, color=INK, size=44):
    t, bt = num(a, size, color), num(b, size, color)
    return VGroup(t, Line(LEFT * 0.22, RIGHT * 0.22, stroke_color=color, stroke_width=4), bt).arrange(DOWN, buff=0.05)


class G3Fracline(LessonScene):
    def construct(self):
        self.title(L)
        road = Axis(0, 1, 1, width=10, labels={0: "0", 1: "1"}, size=30).move_to(DOWN * 0.2)
        home, school = am("ቤት", 30, INK).next_to(road.point(0), DOWN, buff=0.85), am("ትምህርት ቤት", 30, INK).next_to(road.point(1), DOWN, buff=0.85)
        kid = Kid(1, s=0.8).next_to(road.point(0), UP, buff=0.1)
        self.play(FadeIn(road), FadeIn(VGroup(home, school)), FadeIn(kid, shift=UP * 0.2), run_time=0.8)
        self.story(L)

        # 0 · four equal parts
        ticks = VGroup(*[Line(road.point(k / 4) + UP * 0.25, road.point(k / 4) + DOWN * 0.25, stroke_color=INK, stroke_width=4) for k in (1, 2, 3)])
        self.step(L, 0, LaggedStart(*[Create(t) for t in ticks], lag_ratio=0.3), run_time=1.4)

        # 1 · each jump is a quarter: 1/4, 2/4, 3/4, 4/4
        labels = VGroup(*[frac(k, 4, LAKE).next_to(road.point(k / 4), UP, buff=1.45) for k in (1, 2, 3, 4)])
        jumps = []
        for k in range(1, 5):
            arc = ArcBetweenPoints(road.point((k - 1) / 4) + UP * 0.3, road.point(k / 4) + UP * 0.3, angle=-1.6, stroke_color=ADEY, stroke_width=5)
            jumps.append(LaggedStart(Create(arc), kid.animate.next_to(road.point(k / 4), UP, buff=0.1), FadeIn(labels[k - 1], scale=1.3), lag_ratio=0.3))
        self.step(L, 1, Succession(*jumps), run_time=3.6)

        # 2 · a half line above: 1/2 at the same place as 2/4
        half = Line(road.point(0) + UP * 2.6, road.point(1) + UP * 2.6, stroke_color=BERRY, stroke_width=4)
        hmid = Line(road.point(0.5) + UP * 2.8, road.point(0.5) + UP * 2.4, stroke_color=BERRY, stroke_width=4)
        hl = frac(1, 2, BERRY, 36).next_to(hmid, UP, buff=0.08)
        link = DashedLine(road.point(0.5) + UP * 2.35, road.point(0.5) + UP * 0.3, stroke_color=BERRY, stroke_width=3)
        self.step(L, 2, FadeOut(labels[0], labels[2], labels[3]), Create(half), Create(hmid), FadeIn(hl), Create(link), run_time=1.8)

        # 3 · 2/4 = 1/2
        eq = VGroup(frac(2, 4, LAKE, 56), num("=", 56, INK), frac(1, 2, BERRY, 56)).arrange(RIGHT, buff=0.3).move_to(RIGHT * 2.6 + DOWN * 2.0)
        self.step(L, 3, FadeIn(eq, shift=UP * 0.2), Circumscribe(labels[1], color=LAKE), run_time=1.6)
        self.clear_step()
        self.play(Circumscribe(eq, color=BERRY), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
