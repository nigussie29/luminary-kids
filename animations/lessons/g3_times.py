"""Grade 3 · Lesson 4 — በረድፍ እናባዛ (Multiplying in rows): 3 × 5 = 15 = 5 × 3.
Big idea: equal rows make an array; skip count the rows; turning the array around gives the same total."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, Indicate, LaggedStart,
                   ReplacementTransform, TransformFromCopy, VGroup)

from lk import (BERRY, FIELD, INK, LAKE, LessonScene, am, badge, en, field, lesson, num)

L = lesson("g3_times")


def eq(a, b, c, size=72):
    return VGroup(num(a, size, BERRY), num("×", size, INK), num(b, size, LAKE), num("=", size, INK), num(c, size, INK)) \
        .arrange(RIGHT, buff=0.25)


class G3Times(LessonScene):
    def construct(self):
        self.title(L)

        plants, strips = field(3, 5, s=0.8, gap=0.95)
        farm = VGroup(strips, plants).move_to(LEFT * 3.5 + UP * 1.0)
        self.play(FadeIn(strips), run_time=0.6)
        self.story(L)

        # 0 · three rows, five in each row: plant them row by row
        self.step(L, 0, LaggedStart(*[LaggedStart(*[FadeIn(p, shift=UP * 0.25, scale=0.6) for p in row], lag_ratio=0.15)
                                      for row in plants], lag_ratio=0.7), run_time=2.4)

        # 1 · skip count the rows: 5, 10, 15
        tags = VGroup(*[badge(5 * (i + 1), color=LAKE).scale(1.15).next_to(row, RIGHT, buff=0.35) for i, row in enumerate(plants)])
        self.step(L, 1, LaggedStart(*[LaggedStart(Indicate(row, color=FIELD, scale_factor=1.08), FadeIn(t, scale=1.5), lag_ratio=0.4)
                                      for row, t in zip(plants, tags)], lag_ratio=0.6), run_time=2.2)

        # 2 · 3 × 5 = 15
        e1 = eq(3, 5, 15).move_to(RIGHT * 3.6 + UP * 1.6)
        rows_lbl = VGroup(am("3 ረድፎች", 30, BERRY), en("3 rows", 20), am("× 5 ችግኞች", 30, LAKE), en("of 5", 20)) \
            .arrange(RIGHT, buff=0.15).next_to(e1, DOWN, buff=0.25)
        self.step(L, 2, TransformFromCopy(tags[-1], e1[-1]), FadeIn(VGroup(*e1[:-1]), shift=LEFT * 0.2), FadeIn(rows_lbl),
                  run_time=1.6)

        # 3 · turn the field around: five rows of three — still fifteen
        # (each seedling moves to the transposed spot: row r, place c → row c, place r)
        e2 = eq(5, 3, 15).next_to(rows_lbl, DOWN, buff=0.6)
        plants2, strips2 = field(5, 3, s=0.8, gap=0.95)
        VGroup(strips2, plants2).move_to(farm)
        moves = [plants[r][c].animate.move_to(plants2[c][r]) for r in range(3) for c in range(5)]
        self.step(L, 3, FadeOut(tags), ReplacementTransform(strips, strips2), *moves,
                  LaggedStart(FadeIn(e2, shift=UP * 0.2), lag_ratio=0.5), run_time=2.4)
        self.clear_step()
        words = VGroup(am("ሶስት ጊዜ አምስት እና አምስት ጊዜ ሶስት ሁለቱም አስራ አምስት ናቸው", 36, BERRY),
                       en("three times five and five times three are both fifteen", 22)).arrange(DOWN, buff=0.1).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(words, shift=UP * 0.2), Circumscribe(VGroup(e1, e2), color=BERRY), run_time=1.0)
        self.wait(2.0)
        self.play(FadeOut(VGroup(plants, strips2, e1, e2, rows_lbl, words)), run_time=0.8)
