"""Grade 1 · Lesson 4 — የባጃጅ ጉዞ (The bajaj ride): 3 + 2 = 5 by counting on.
Checkpoints pause before step 1 (how many inside?) and before step 2 (how many now?)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, FadeIn, FadeOut, Indicate, LaggedStart, VGroup)

from lk import (BERRY, INK, LAKE, Bajaj, Kid, LessonScene, am, badge, en, ground, lesson, num, number_word)

L = lesson("add10")


class Add10(LessonScene):
    def construct(self):
        self.title(L)
        road = ground(y=-1.0)
        bj = Bajaj(s=0.95).move_to(LEFT * 9 + UP * 0.6)
        self.play(FadeIn(road), run_time=0.3)
        self.play(bj.animate.move_to(UP * 0.6), run_time=1.6)
        self.story(L)

        # 0 · three children are inside
        first = VGroup(*[Kid(i, s=0.62).move_to(bj.seat(i)) for i in range(3)])
        t3 = VGroup(*[badge(k + 1, color=LAKE).next_to(first[k], UP, buff=0.12) for k in range(3)])
        self.step(L, 0, LaggedStart(*[FadeIn(k, scale=0.6) for k in first], lag_ratio=0.3), LaggedStart(*[FadeIn(t) for t in t3], lag_ratio=0.3), run_time=1.6)
        self.wait(0.5)
        # 1 · two more get in
        new = VGroup(*[Kid(i + 3, s=0.62).move_to(RIGHT * (5.5 + i) + DOWN * 0.9) for i in range(2)])
        self.add(new)
        self.step(L, 1, *[k.animate.move_to(bj.seat(3 + i)) for i, k in enumerate(new)], run_time=1.6)
        self.wait(0.5)
        # 2 · start at three and count on: four, five
        t45 = VGroup(*[badge(4 + i, color=BERRY).next_to(new[i], UP, buff=0.12) for i in range(2)])
        self.step(L, 2, Indicate(t3[2], color=LAKE, scale_factor=1.4), LaggedStart(*[FadeIn(t, scale=1.6) for t in t45], lag_ratio=0.6), run_time=2.0)
        # 3 · three plus two equals five
        eq = VGroup(num(3, 72, LAKE), num("+", 72, INK), num(2, 72, BERRY), num("=", 72, INK), num(5, 72, INK)).arrange(RIGHT, buff=0.3).move_to(DOWN * 1.9)
        self.step(L, 3, LaggedStart(*[FadeIn(x, shift=UP * 0.2) for x in eq], lag_ratio=0.3), run_time=1.6)
        self.clear_step()
        words = VGroup(num(5, 80, BERRY), am(number_word(5), 44, BERRY), en(number_word(5, "en"), 24)).arrange(RIGHT, buff=0.35).to_edge(DOWN, buff=0.4)
        self.play(FadeOut(eq), FadeIn(words, shift=UP * 0.2), run_time=0.6)
        self.wait(1.4)
        self.play(VGroup(bj, first, new, t3, t45).animate.shift(RIGHT * 12), FadeOut(words), run_time=1.2)
        self.play(FadeOut(road), run_time=0.3)
