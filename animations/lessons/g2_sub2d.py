"""Grade 2 · Lesson 3 — አስርን ፈትተን እንቀንሳለን (Subtracting by breaking a ten): 42 − 17 = 25.
Big idea: when there aren't enough ones, break one ten into ten ones, then subtract."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (AnimationGroup, Succession, DOWN, LEFT, RIGHT, UP, Circumscribe, Cross, FadeIn, FadeOut, Indicate, LaggedStart,
                   Line, Transform, VGroup, Wiggle)

from lk import (ADEY, BERRY, INK, LAKE, ONES_C, Column, LessonScene, PlaceValueMat, Rod, am, en,
                lesson, num, number_word, ones)

L = lesson("g2_sub2d")


class G2Sub2d(LessonScene):
    def construct(self):
        self.title(L)
        self.story(L)

        mat = PlaceValueMat(width=7.6, height=3.6).move_to(LEFT * 2.6 + UP * 0.75)
        tt, ot = mat.tens_tray, mat.ones_tray
        rods = VGroup(*[Rod() for _ in range(4)]).arrange(RIGHT, buff=0.12).move_to(tt)
        grid = ones(12).move_to(ot)                       # where the ones will sit (rows of five)
        two = VGroup(*[ones(1)[0].move_to(grid[i]) for i in range(2)])
        col = Column(42, 17, op="−").move_to(RIGHT * 4.6 + UP * 1.1)

        # 0 · 42 − 17
        self.play(FadeIn(mat), run_time=0.5)
        self.step(L, 0, LaggedStart(FadeIn(rods, shift=DOWN * 0.2), FadeIn(two, shift=DOWN * 0.2),
                                    FadeIn(col), lag_ratio=0.3), run_time=1.6)

        # 1 · can't take 7 from 2 → break one ten into ten ones
        last = rods[-1]
        new_ones = VGroup(*[ones(1)[0].move_to(grid[i]) for i in range(2, 12)])
        strike = Line(col.rows[0][0].get_corner(DOWN + LEFT), col.rows[0][0].get_corner(UP + RIGHT),
                      stroke_color=BERRY, stroke_width=6)
        three = col.small(3, 0)
        one = num(1, 34, BERRY).next_to(col.rows[0][1], LEFT, buff=0.02).shift(UP * 0.28)
        self.step(L, 1, Succession(
            Wiggle(VGroup(two, col.rows[1][1])),
            last.animate.move_to(ot).shift(UP * 0.2),
            AnimationGroup(Transform(last, new_ones), FadeIn(strike), FadeIn(three, shift=DOWN * 0.2),
                           FadeIn(one, shift=DOWN * 0.2))), run_time=3.2, fallback=3.4)

        # 2 · now three tens and twelve ones
        rods3 = VGroup(*rods[:3])
        all_ones = VGroup(*two, *last)          # the broken ten's cubes are now ten ones
        self.step(L, 2, Indicate(rods3, color=LAKE, scale_factor=1.06),
                  Indicate(all_ones, color=ADEY, scale_factor=1.06), run_time=1.4)

        # 3 · 12 − 7 = 5 ones; 3 tens − 1 ten = 2 tens
        gone_ones = VGroup(*all_ones[5:])                  # seven ones leave
        gone_rod = rods3[-1]
        answer = col.digits(25, 2, color=INK)
        self.step(L, 3,
                  LaggedStart(*[o.animate.shift(DOWN * 2.6).set_opacity(0) for o in gone_ones], lag_ratio=0.08),
                  FadeIn(answer[1], shift=DOWN * 0.2), run_time=1.6)
        self.play(gone_rod.animate.shift(DOWN * 2.6).set_opacity(0), FadeIn(answer[0], shift=DOWN * 0.2),
                  run_time=1.0)

        # 4 · the answer is 25
        left = VGroup(*rods3[:2], *all_ones[:5])
        self.step(L, 4, Circumscribe(answer, color=BERRY), Indicate(left, color=BERRY, scale_factor=1.05),
                  run_time=1.4)
        self.clear_step()
        words = VGroup(num(25, 96, BERRY), am(number_word(25), 44, BERRY), en(number_word(25, "en"), 24)) \
            .arrange(RIGHT, buff=0.35).to_edge(DOWN, buff=0.6)
        self.play(FadeIn(words, shift=UP * 0.2), run_time=0.7)
        self.wait(2.0)
        self.play(FadeOut(VGroup(mat, left, col, strike, three, one, answer, words)), run_time=0.8)
