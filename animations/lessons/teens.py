"""Grade 1 · Lesson 2 — የገበያ አስሮች (Market tens): one full ten and four more is fourteen.
Checkpoints pause before step 0 (how many fill a ten frame?) and before step 2 (ten and four?)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, Indicate, LaggedStart, VGroup)

from lk import (BERRY, INK, LAKE, LessonScene, Orange, TenFrame, am, badge, en, lesson, num, number_word)

L = lesson("teens")


class Teens(LessonScene):
    def construct(self):
        self.title(L)
        f1 = TenFrame(cell=0.78).move_to(LEFT * 3.3 + UP * 1.0)
        f2 = TenFrame(cell=0.78).move_to(RIGHT * 3.0 + UP * 1.0)
        tens = VGroup(*[Orange(size=0.62).move_to(f1.slot(i)) for i in range(10)])
        more = VGroup(*[Orange(size=0.62).move_to(f2.slot(i)) for i in range(4)])
        self.play(FadeIn(f1), run_time=0.4)
        # the seller packs ten oranges while the story is told
        self.play(LaggedStart(*[FadeIn(o, shift=DOWN * 0.3) for o in tens], lag_ratio=0.15), run_time=2.2)
        self.story(L)
        self.wait(0.5)

        # 0 · one full ten frame is ten
        t10 = badge(10, color=LAKE).scale(1.4).next_to(f1, UP, buff=0.2)
        self.step(L, 0, Circumscribe(f1, color=BERRY), FadeIn(t10, scale=1.5), run_time=1.4)
        # 1 · then four more
        t4 = badge(4, color="#c28f00").scale(1.4).next_to(f2, UP, buff=0.2)
        self.step(L, 1, FadeIn(f2), LaggedStart(*[FadeIn(o, shift=DOWN * 0.3) for o in more], lag_ratio=0.25), FadeIn(t4, scale=1.5), run_time=1.6)
        self.wait(0.5)
        # 2 · ten and four is fourteen
        eq = VGroup(num(10, 72, LAKE), num("+", 72, INK), num(4, 72, "#c28f00"), num("=", 72, INK), num(14, 72, BERRY)).arrange(RIGHT, buff=0.3).move_to(DOWN * 1.4)
        self.step(L, 2, LaggedStart(*[FadeIn(x, shift=UP * 0.2) for x in eq], lag_ratio=0.3), Indicate(VGroup(tens, more), color=BERRY, scale_factor=1.05), run_time=1.8)
        self.clear_step()
        words = VGroup(num(14, 90, BERRY), am(number_word(14), 44, BERRY), en(number_word(14, "en"), 24)).arrange(RIGHT, buff=0.35).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(words, shift=UP * 0.2), run_time=0.6)
        self.wait(1.6)
        self.play(FadeOut(VGroup(f1, f2, tens, more, t10, t4, eq, words)), run_time=0.7)
