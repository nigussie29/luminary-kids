"""Grade 3 · Lesson 3 — ባለ ሶስት አሃዝ ቁጥሮችን መቀነስ (Subtracting three-digit numbers): 452 − 228 = 224.
Big idea: when the top ones digit is too small, break one ten into ten ones, then subtract place by place."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, Create, FadeIn, FadeOut, LaggedStart, Line,
                   TransformFromCopy, VGroup)

from lk import (ADEY, BERRY, INK, LAKE, ONES_C, Column3, Kid, LessonScene, am, en, lesson, num,
                number_word)

L = lesson("g3_sub3d")


def note(*items):
    return VGroup(*[num(v, 44, c) for v, c in items]).arrange(RIGHT, buff=0.12)


def cross(at, color=BERRY):
    return VGroup(Line(at + UP * 0.25 + LEFT * 0.25, at + DOWN * 0.25 + RIGHT * 0.25, stroke_color=color, stroke_width=8),
                  Line(at + UP * 0.25 + RIGHT * 0.25, at + DOWN * 0.25 + LEFT * 0.25, stroke_color=color, stroke_width=8))


class G3Sub3d(LessonScene):
    def construct(self):
        self.title(L)

        # the school: a crowd of children, some of them walking off on the trip
        kids = VGroup(*[Kid(i, s=0.55) for i in range(10)]).arrange_in_grid(rows=2, buff=(0.25, 0.3)).move_to(UP * 1.2)
        self.play(LaggedStart(*[FadeIn(k, shift=UP * 0.2) for k in kids], lag_ratio=0.08), run_time=1.2)
        self.story(L)
        self.play(kids.animate.scale(0.75).move_to(LEFT * 5.0 + UP * 1.4), run_time=0.6)

        col = Column3(452, 228, op="−").move_to(LEFT * 0.6 + UP * 1.2)
        side = RIGHT * 4.2

        # 0 · 452 − 228 in columns
        self.step(L, 0, LaggedStart(FadeIn(col.rows[0], shift=DOWN * 0.2), FadeIn(col.rows[1], shift=DOWN * 0.2),
                                    FadeIn(VGroup(col.op, col.bar)), lag_ratio=0.4), run_time=1.6)

        # 1 · 2 take away 8? not possible → break a ten
        ones_pair = VGroup(col.rows[0][2], col.rows[1][2])
        no = cross(side + UP * 1.2)
        q = note((2, ONES_C), ("−", INK), (8, ONES_C)).next_to(no, LEFT, buff=0.3)
        self.step(L, 1, Circumscribe(ones_pair, color=ADEY, fade_out=True), FadeIn(q), Create(no), run_time=1.6)

        # 2 · 5 tens → 4 tens, 2 ones → 12 ones
        s_t, s_o = col.strike(1, 0), col.strike(2, 0)
        new_t, new_o = col.small(4, 1), col.small(12, 2)
        self.step(L, 2, FadeOut(VGroup(q, no)), Create(s_t), FadeIn(new_t, shift=DOWN * 0.2),
                  Create(s_o), FadeIn(new_o, shift=DOWN * 0.2), run_time=1.8)

        # 3 · 12 − 8 = 4
        n1 = note((12, ONES_C), ("−", INK), (8, ONES_C), ("=", INK), (4, ONES_C)).move_to(side + UP * 1.2)
        a_o = col.digit(4, 2, 2, INK)
        self.step(L, 3, FadeIn(n1, shift=LEFT * 0.2), TransformFromCopy(n1[-1], a_o), run_time=1.5)

        # 4 · tens 4 − 2 = 2; hundreds 4 − 2 = 2
        n2 = note((4, LAKE), ("−", INK), (2, LAKE), ("=", INK), (2, LAKE)).move_to(side + UP * 0.2)
        n3 = note((4, BERRY), ("−", INK), (2, BERRY), ("=", INK), (2, BERRY)).move_to(side + DOWN * 0.8)
        a_t, a_h = col.digit(2, 1, 2, INK), col.digit(2, 0, 2, INK)
        self.step(L, 4, LaggedStart(FadeIn(n2, shift=LEFT * 0.2), TransformFromCopy(n2[-1], a_t),
                                    FadeIn(n3, shift=LEFT * 0.2), TransformFromCopy(n3[-1], a_h), lag_ratio=0.4), run_time=2.2)

        # 5 · 224 children stayed
        answer = VGroup(a_h, a_t, a_o)
        self.step(L, 5, Circumscribe(answer, color=BERRY), run_time=1.2)
        self.clear_step()
        words = VGroup(am(number_word(224), 44, BERRY), en(number_word(224, "en"), 24)).arrange(DOWN, buff=0.1).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(words, shift=UP * 0.2), run_time=0.8)
        self.wait(2.0)
        self.play(FadeOut(VGroup(kids, col, s_t, s_o, new_t, new_o, n1, n2, n3, answer, words)), run_time=0.8)
