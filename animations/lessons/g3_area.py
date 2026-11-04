"""Grade 3 · Lesson 14 — ስፋት እና ዙሪያ (Area and perimeter): a 4 × 3 floor, area 12 square units, perimeter 14."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (Group, DOWN, LEFT, RIGHT, UP, Circumscribe, Create, FadeIn, FadeOut, LaggedStart, Rectangle, ShowPassingFlash,
                   Square, VGroup)

from lk import (BERRY, FIELD, INK, LAKE, LessonScene, am, en, lesson, num)

L = lesson("g3_area")
U = 1.15


class G3Area(LessonScene):
    def construct(self):
        self.title(L)
        floor = Rectangle(width=4 * U, height=3 * U, stroke_color=INK, stroke_width=6).move_to(LEFT * 3.2 + UP * 0.9)
        self.play(Create(floor), run_time=0.8)
        self.story(L)
        tiles = VGroup(*[Square(U * 0.94, fill_color=FIELD, fill_opacity=0.85, stroke_color="#1d5e3a", stroke_width=2)
                         .move_to(floor.get_corner(UP + LEFT) + RIGHT * U * (c + 0.5) + DOWN * U * (r + 0.5)) for r in range(3) for c in range(4)])

        # 0 · three rows of four tiles
        self.step(L, 0, LaggedStart(*[FadeIn(t, scale=0.6) for t in tiles], lag_ratio=0.12), run_time=2.6)

        # 1 · 3 × 4 = 12 square units
        e = VGroup(num(3, 72, BERRY), num("×", 72, INK), num(4, 72, LAKE), num("=", 72, INK), num(12, 72, INK)).arrange(RIGHT, buff=0.22).move_to(RIGHT * 3.3 + UP * 1.8)
        u = VGroup(am("ካሬ አሃዶች", 30, INK), en("square units", 20)).arrange(RIGHT, buff=0.15).next_to(e, DOWN, buff=0.2)
        self.step(L, 1, FadeIn(e, shift=LEFT * 0.2), FadeIn(u), run_time=1.6)

        # 2 · around the edge: 4, 3, 4, 3
        labels = VGroup(num(4, 48, LAKE).next_to(floor, UP, buff=0.15), num(3, 48, BERRY).next_to(floor, RIGHT, buff=0.15),
                        num(4, 48, LAKE).next_to(floor, DOWN, buff=0.15), num(3, 48, BERRY).next_to(floor, LEFT, buff=0.15))
        edge = floor.copy().set_stroke(BERRY, width=10)
        self.step(L, 2, ShowPassingFlash(edge, time_width=0.4), LaggedStart(*[FadeIn(l, scale=1.4) for l in labels], lag_ratio=0.35), run_time=2.2)

        # 3 · 4 + 3 + 4 + 3 = 14
        p = VGroup(num(4, 56, LAKE), num("+", 56, INK), num(3, 56, BERRY), num("+", 56, INK), num(4, 56, LAKE), num("+", 56, INK),
                   num(3, 56, BERRY), num("=", 56, INK), num(14, 56, INK)).arrange(RIGHT, buff=0.12).move_to(RIGHT * 3.3 + DOWN * 0.4)
        pl = VGroup(am("ዙሪያ", 30, INK), en("perimeter", 20)).arrange(RIGHT, buff=0.15).next_to(p, DOWN, buff=0.2)
        self.step(L, 3, FadeIn(p, shift=LEFT * 0.2), FadeIn(pl), run_time=1.6)
        self.clear_step()
        self.play(Circumscribe(VGroup(e, p), color=BERRY), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
