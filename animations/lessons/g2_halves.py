"""Grade 2 · Lesson 6 — ግማሽ እና ሩብ (Halves and quarters).
Big idea: a half is one of two EQUAL parts; a quarter is one of four equal parts."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Create, FadeIn, FadeOut, Indicate, Intersection, Line, Rectangle,
                   VGroup)

from lk import (ADEY, BERRY, FIELD, INK, LAKE, Injera, LessonScene, am, en, lesson, num)

L = lesson("g2_halves")


def frac(a, b, color=INK, size=60):
    top, bot = num(a, size, color), num(b, size, color)
    bar = Line(LEFT * 0.3, RIGHT * 0.3, stroke_color=color, stroke_width=5)
    return VGroup(top, bar, bot).arrange(DOWN, buff=0.08)


def tag(a, b, am_word, en_word, color):
    return VGroup(frac(a, b, color), VGroup(am(am_word, 40, color), en(en_word, 22)).arrange(DOWN, buff=0.06)) \
        .arrange(RIGHT, buff=0.3)


def check(color=FIELD):
    return VGroup(Line(LEFT * 0.22 + UP * 0.02, DOWN * 0.2, stroke_color=color, stroke_width=8),
                  Line(DOWN * 0.2, RIGHT * 0.32 + UP * 0.3, stroke_color=color, stroke_width=8))


def cross(color=BERRY):
    return VGroup(Line(UP * 0.25 + LEFT * 0.25, DOWN * 0.25 + RIGHT * 0.25, stroke_color=color, stroke_width=8),
                  Line(UP * 0.25 + RIGHT * 0.25, DOWN * 0.25 + LEFT * 0.25, stroke_color=color, stroke_width=8))


class G2Halves(LessonScene):
    def construct(self):
        self.title(L)

        a = Injera(r=1.25, seed=3).move_to(LEFT * 3.6 + UP * 1.3)
        b = Injera(r=1.25, seed=7).move_to(RIGHT * 3.6 + UP * 1.3)
        self.play(FadeIn(a, scale=0.8), FadeIn(b, scale=0.8), run_time=1.0)
        self.story(L)

        # 0 · two equal parts: each is a half
        cut2 = a.cuts(2)
        half = a.piece(0, 2, color=ADEY)
        t2 = tag(1, 2, "ግማሽ", "one half", "#a07400").next_to(a, DOWN, buff=0.3)
        self.step(L, 0, FadeIn(half), Create(cut2), FadeIn(t2, shift=UP * 0.2), run_time=1.6)

        # 1 · four equal parts: each is a quarter
        cut4 = b.cuts(4)
        quarter = b.piece(0, 4, color=LAKE)
        t4 = tag(1, 4, "ሩብ", "one quarter", LAKE).next_to(b, DOWN, buff=0.3)
        self.step(L, 1, FadeIn(quarter), Create(cut4), FadeIn(t4, shift=UP * 0.2), run_time=1.6)

        # 2 · the parts must be equal: an uneven cut is not halves
        c = Injera(r=0.95, seed=11).move_to(UP * 1.3)
        off = c.disc.get_center()
        x = 0.45                                   # cut off-centre
        h = np.sqrt(0.95 ** 2 - x ** 2)
        bad = Line(off + np.array([x, h, 0]), off + np.array([x, -h, 0]), stroke_color=INK, stroke_width=5)
        sliver = Intersection(c.disc, Rectangle(width=2, height=2.2).move_to(off + RIGHT * (x + 1)),
                              fill_color=BERRY, fill_opacity=0.55, stroke_width=0)
        no = cross().next_to(c, UP + RIGHT, buff=-0.1)
        oks = VGroup(check().next_to(a, UP + RIGHT, buff=-0.15), check().next_to(b, UP + RIGHT, buff=-0.15))
        self.step(L, 2, FadeIn(c, scale=0.8), FadeIn(sliver), Create(bad), FadeIn(no, scale=1.5), FadeIn(oks, scale=1.5), run_time=2.0)
        self.clear_step()

        self.play(Indicate(half, color=ADEY), Indicate(quarter, color=LAKE), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(VGroup(a, b, c, cut2, cut4, half, quarter, t2, t4, sliver, bad, no, oks)), run_time=0.8)
