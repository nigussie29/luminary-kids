"""Grade 3 · Lesson 1 — መቶዎች፣ አስሮች እና አንዶች (Hundreds, tens and ones): 245.
Big idea: ten tens make one hundred; a three-digit number is hundreds, tens and ones."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, Indicate, LaggedStart,
                   ReplacementTransform, VGroup)

from lk import (BERRY, INK, LAKE, ONES_C, S3, Flat, LessonScene, PlaceValueMat3, am, en, lesson,
                num, number_word, ones, rods)

L = lesson("g3_hundreds")


class G3Hundreds(LessonScene):
    def construct(self):
        self.title(L)

        # ten loose rods wait on the table while the story is told
        loose = rods(10, s=0.2, buff=0.22).move_to(UP * 1.1)
        self.play(LaggedStart(*[FadeIn(r, shift=DOWN * 0.3) for r in loose], lag_ratio=0.08), run_time=1.0)
        self.story(L)

        # 0 · ten tens make one hundred: the rods slide together into a flat
        flat = Flat(s=0.2).move_to(UP * 1.1)
        hundred = VGroup(num(100, 80, BERRY), am("መቶ", 40, BERRY), en("one hundred", 22)) \
            .arrange(RIGHT, buff=0.3).next_to(flat, DOWN, buff=0.35)
        tens_tag = VGroup(num(10, 56, LAKE), am("አስሮች", 32, LAKE)).arrange(RIGHT, buff=0.2).next_to(loose, UP, buff=0.25)
        self.play(FadeIn(tens_tag, shift=DOWN * 0.2), run_time=0.4)
        self.step(L, 0, ReplacementTransform(loose, flat), FadeOut(tens_tag), FadeIn(hundred, shift=UP * 0.2), run_time=1.8)
        self.play(FadeOut(VGroup(flat, hundred)), run_time=0.5)

        # 1 · two hundreds, four tens and five ones on the mat
        mat = PlaceValueMat3(width=12.6, height=2.9).move_to(UP * 0.85)
        th, tt, to = mat.trays
        flats = VGroup(Flat(), Flat()).arrange(RIGHT, buff=0.18).move_to(th)
        rs = rods(4).move_to(tt)
        os_ = ones(5, s=S3 * 1.4).move_to(to)
        counts = VGroup(*[num(d, 64, c).next_to(t, DOWN, buff=0.22) for d, c, t in ((2, BERRY, th), (4, LAKE, tt), (5, ONES_C, to))])
        self.play(FadeIn(mat), run_time=0.5)
        self.step(L, 1, LaggedStart(FadeIn(flats, shift=DOWN * 0.2), FadeIn(rs, shift=DOWN * 0.2), FadeIn(os_, shift=DOWN * 0.2),
                                    FadeIn(counts), lag_ratio=0.35), run_time=2.0)

        # 2 · two hundred, forty and five
        parts = VGroup(*[num(v, 64, c).next_to(t, DOWN, buff=0.22) for v, c, t in ((200, BERRY, th), (40, LAKE, tt), (5, ONES_C, to))])
        plus = VGroup(*[num("+", 56, INK).move_to((a.get_center() + b.get_center()) / 2) for a, b in ((th, tt), (tt, to))])
        plus.match_y(parts)
        self.step(L, 2, *[ReplacementTransform(a, b) for a, b in zip(counts, parts)], FadeIn(plus),
                  LaggedStart(Indicate(flats, color=BERRY), Indicate(rs, color=LAKE), Indicate(os_, color=ONES_C), lag_ratio=0.5),
                  run_time=2.0)

        # 3 · the number is 245: the three parts come together into one number
        total = VGroup(num(2, 96, BERRY), num(4, 96, LAKE), num(5, 96, ONES_C)).arrange(RIGHT, buff=0.06).move_to(DOWN * 1.75)
        self.step(L, 3, FadeOut(plus), *[ReplacementTransform(p, d) for p, d in zip(parts, total)], run_time=1.6)
        self.clear_step()
        words = VGroup(am(number_word(245), 44, BERRY), en(number_word(245, "en"), 24)).arrange(DOWN, buff=0.1).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(words, shift=UP * 0.2), Circumscribe(total, color=BERRY), run_time=1.0)
        self.wait(2.0)
        self.play(FadeOut(VGroup(mat, flats, rs, os_, total, words)), run_time=0.8)
