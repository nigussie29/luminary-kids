"""Grade 3 · Lesson 2 — ባለ ሶስት አሃዝ ቁጥሮችን መደመር (Adding three-digit numbers): 238 + 145 = 383.
Big idea: add ones, then tens, then hundreds; ten ones make a new ten (the small 1 carried over)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, LaggedStart, RoundedRectangle,
                   TransformFromCopy, VGroup)

from lk import (ADEY, BERRY, INK, LAKE, ONES_C, Column3, LessonScene, Orange, am, en, lesson, num,
                number_word)

L = lesson("g3_add3d")


def basket(n, label_color):
    """A basket with a few oranges peeking out and its number on the front."""
    body = RoundedRectangle(width=2.3, height=1.1, corner_radius=0.35, fill_color="#c98f4a", fill_opacity=1,
                            stroke_color="#7a4f1d", stroke_width=3)
    fruit = VGroup(*[Orange(0.9) for _ in range(5)]).arrange(RIGHT, buff=-0.08).next_to(body, UP, buff=-0.25)
    tag = num(n, 48, "#ffffff").move_to(body)
    return VGroup(fruit, body, tag)


def note(*items):
    """A short sum written beside the column, e.g. 8 + 5 = 13."""
    return VGroup(*[num(v, 44, c) for v, c in items]).arrange(RIGHT, buff=0.12)


class G3Add3d(LessonScene):
    def construct(self):
        self.title(L)

        b1 = basket(238, BERRY).move_to(LEFT * 4.6 + UP * 1.6)
        b2 = basket(145, LAKE).move_to(LEFT * 4.6 + DOWN * 0.6)
        self.play(FadeIn(b1, shift=DOWN * 0.3), run_time=0.6)
        self.play(FadeIn(b2, shift=DOWN * 0.3), run_time=0.6)
        self.story(L)

        col = Column3(238, 145).move_to(RIGHT * 0.2 + UP * 1.3)
        side = RIGHT * 4.3

        # 0 · 238 + 145 written in columns
        self.step(L, 0, LaggedStart(TransformFromCopy(b1[2], col.rows[0]), TransformFromCopy(b2[2], col.rows[1]),
                                    FadeIn(VGroup(col.op, col.bar)), lag_ratio=0.4), run_time=1.8)

        # 1 · ones first: 8 + 5 = 13
        n1 = note((8, ONES_C), ("+", INK), (5, ONES_C), ("=", INK), (13, ONES_C)).move_to(side + UP * 1.2)
        self.step(L, 1, Circumscribe(VGroup(col.rows[0][2], col.rows[1][2]), color=ADEY, fade_out=True),
                  FadeIn(n1, shift=LEFT * 0.2), run_time=1.6)

        # 2 · write the 3, carry one ten (the small 1 over the tens)
        a_ones = col.digit(3, 2, 2, INK)
        carry = col.small(1, 1)
        self.step(L, 2, TransformFromCopy(n1[-1], a_ones), TransformFromCopy(n1[-1], carry), run_time=1.6)

        # 3 · tens: 1 + 3 + 4 = 8
        n2 = note((1, BERRY), ("+", INK), (3, LAKE), ("+", INK), (4, LAKE), ("=", INK), (8, LAKE)).move_to(side + UP * 0.2)
        a_tens = col.digit(8, 1, 2, INK)
        self.step(L, 3, Circumscribe(VGroup(carry, col.rows[0][1], col.rows[1][1]), color=LAKE, fade_out=True),
                  FadeIn(n2, shift=LEFT * 0.2), TransformFromCopy(n2[-1], a_tens), run_time=1.8)

        # 4 · hundreds: 2 + 1 = 3
        n3 = note((2, BERRY), ("+", INK), (1, BERRY), ("=", INK), (3, BERRY)).move_to(side + DOWN * 0.8)
        a_h = col.digit(3, 0, 2, INK)
        self.step(L, 4, Circumscribe(VGroup(col.rows[0][0], col.rows[1][0]), color=BERRY, fade_out=True),
                  FadeIn(n3, shift=LEFT * 0.2), TransformFromCopy(n3[-1], a_h), run_time=1.8)

        # 5 · 383
        answer = VGroup(a_h, a_tens, a_ones)
        self.step(L, 5, Circumscribe(answer, color=BERRY), run_time=1.2)
        self.clear_step()
        words = VGroup(am(number_word(383), 44, BERRY), en(number_word(383, "en"), 24)).arrange(DOWN, buff=0.1).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(words, shift=UP * 0.2), run_time=0.8)
        self.wait(2.0)
        self.play(FadeOut(VGroup(b1, b2, col, carry, answer, n1, n2, n3, words)), run_time=0.8)
