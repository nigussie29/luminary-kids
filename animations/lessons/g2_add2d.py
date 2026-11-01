"""Grade 2 · Lesson 2 — አስር ሲሞላ እንደምራለን (Adding with a new ten): 27 + 15 = 42.
Big idea: add the ones first; ten ones make one new ten (the small 1 written over the tens)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, Indicate, LaggedStart,
                   Line, ReplacementTransform, VGroup)

from lk import (ADEY, BERRY, INK, LAKE, ONES_C, Column, LessonScene, PlaceValueMat, Rod, am, en,
                lesson, num, number_word, ones)

L = lesson("g2_add2d")


class G2Add2d(LessonScene):
    def construct(self):
        self.title(L)
        self.story(L)

        mat = PlaceValueMat(width=7.6, height=3.6).move_to(LEFT * 2.6 + UP * 0.75)
        tt, ot = mat.tens_tray, mat.ones_tray
        # 27: two rods + seven ones (top), 15: one rod + five ones (bottom)
        rods_a = VGroup(*[Rod() for _ in range(2)]).arrange(RIGHT, buff=0.12)
        rods_b = VGroup(Rod())
        VGroup(rods_a, rods_b).arrange(RIGHT, buff=0.55).move_to(tt).shift(LEFT * 0.2)
        ones_a = ones(7).move_to(ot).shift(UP * 0.85)
        ones_b = ones(5).move_to(ot).shift(DOWN * 0.85)
        ones_b.align_to(ones_a, LEFT)
        col = Column(27, 15).move_to(RIGHT * 4.6 + UP * 1.1)

        # 0 · 27 + 15
        self.play(FadeIn(mat), run_time=0.5)
        self.step(L, 0,
                  LaggedStart(FadeIn(rods_a, shift=DOWN * 0.2), FadeIn(ones_a, shift=DOWN * 0.2),
                              FadeIn(col.rows[0]), lag_ratio=0.3),
                  LaggedStart(FadeIn(rods_b, shift=DOWN * 0.2), FadeIn(ones_b, shift=DOWN * 0.2),
                              FadeIn(VGroup(col.rows[1], col.op, col.bar)), lag_ratio=0.3),
                  run_time=1.8)

        # 1 · add the ones: 7 + 5 = 12 → slide all ones together, rows of five
        all_ones = VGroup(*ones_a, *ones_b)
        target = ones(12).move_to(ot).shift(UP * 0.35)
        ones_note = VGroup(num(7, 38, ONES_C), num("+", 38, INK), num(5, 38, ONES_C), num("=", 38, INK),
                           num(12, 38, ONES_C)).arrange(RIGHT, buff=0.12).next_to(col, DOWN, buff=0.35)
        self.step(L, 1, Circumscribe(VGroup(col.rows[0][1], col.rows[1][1]), color=ADEY, fade_out=True),
                  *[u.animate.move_to(t) for u, t in zip(all_ones, target)],
                  FadeIn(ones_note, shift=UP * 0.15), run_time=1.8)

        # 2 · ten ones make one ten → ten cubes join into a rod that moves to the tens tray
        new_rod = Rod().next_to(rods_b, RIGHT, buff=0.3)
        ten = VGroup(*all_ones[:10])
        carry = col.small(1, 0)
        self.play(Indicate(ten, color=BERRY, scale_factor=1.08), run_time=0.7)
        self.step(L, 2, ReplacementTransform(ten, new_rod), FadeIn(carry, scale=1.6), run_time=1.6)

        # 3 · four tens and two ones: 42
        rest = VGroup(*all_ones[10:])
        rods = VGroup(*rods_a, *rods_b, new_rod)
        rods_target = VGroup(*[Rod() for _ in range(4)]).arrange(RIGHT, buff=0.12).move_to(tt)
        answer = col.digits(42, 2, color=INK)
        self.step(L, 3,
                  *[r.animate.move_to(t) for r, t in zip(rods, rods_target)],
                  rest.animate.move_to(ot),
                  LaggedStart(FadeIn(answer[1], shift=DOWN * 0.2), FadeIn(answer[0], shift=DOWN * 0.2),
                              lag_ratio=0.5),
                  run_time=1.8)
        self.clear_step()
        words = VGroup(num(42, 96, BERRY), am(number_word(42), 44, BERRY), en(number_word(42, "en"), 24)) \
            .arrange(RIGHT, buff=0.35).to_edge(DOWN, buff=0.6)
        self.play(FadeOut(ones_note), FadeIn(words, shift=UP * 0.2), Circumscribe(answer, color=BERRY), run_time=1.0)
        self.wait(2.0)
        self.play(FadeOut(VGroup(mat, rods, rest, col, carry, answer, words)), run_time=0.8)
