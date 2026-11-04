"""Grade 2 · Lesson 8 — የትኛው ይበልጣል? (Which is greater?): 42 > 24 by comparing tens; equal tens → compare ones."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, Group, Indicate, LaggedStart, VGroup)

from lk import (BERRY, INK, LAKE, ONES_C, LessonScene, lesson, num, ones, tens)

L = lesson("g2_compare")


def blocks(n):
    return VGroup(tens(n // 10), ones(n % 10)).arrange(RIGHT, buff=0.35, aligned_edge=UP)


def number(n, size=88):
    return VGroup(num(n // 10, size, LAKE), num(n % 10, size, ONES_C)).arrange(RIGHT, buff=0.05)


class G2Compare(LessonScene):
    def construct(self):
        self.title(L)
        a, b = blocks(42).move_to(LEFT * 3.3 + UP * 1.2), blocks(24).move_to(RIGHT * 3.3 + UP * 1.2)
        na, nb = number(42).next_to(a, DOWN, buff=0.4), number(24).next_to(b, DOWN, buff=0.4)
        self.play(FadeIn(a, shift=DOWN * 0.2), FadeIn(b, shift=DOWN * 0.2), FadeIn(na), FadeIn(nb), run_time=1.0)
        self.story(L)

        # 0 · compare the tens: 4 tens vs 2 tens
        self.step(L, 0, Indicate(a[0], color=LAKE, scale_factor=1.08), Indicate(b[0], color=LAKE, scale_factor=1.08),
                  Circumscribe(na[0], color=LAKE), Circumscribe(nb[0], color=LAKE), run_time=1.8)

        # 1 · so 42 is greater than 24
        sign = num(">", 110, BERRY).move_to((na.get_center() + nb.get_center()) / 2)
        self.step(L, 1, FadeIn(sign, scale=1.6), run_time=1.4)

        # 2 · the open side faces the bigger number
        self.step(L, 2, Indicate(sign, color=BERRY, scale_factor=1.3), Indicate(na, color=BERRY, scale_factor=1.15), run_time=1.6)

        # 3 · equal tens → compare ones: 36 > 34
        c, d = number(36, 72), number(34, 72)
        row = VGroup(c, num(">", 72, BERRY), d).arrange(RIGHT, buff=0.4).move_to(DOWN * 1.9)
        self.step(L, 3, FadeIn(row, shift=UP * 0.2), Circumscribe(VGroup(c[1], d[1]), color=ONES_C), run_time=2.0)
        self.clear_step()
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
