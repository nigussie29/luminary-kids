"""Grade 1 · Lesson 6 — አስር እንሙላ (Make ten): 8 + 5 → move two to fill the ten → 10 + 3 = 13.
Checkpoints pause before step 1 (how many more does eight need?) and before step 2 (ten and three?)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, Indicate, LaggedStart, VGroup)

from lk import (ADEY, BERRY, INK, LAKE, Counter, LessonScene, TenFrame, am, en, lesson, num, number_word)

L = lesson("make10")


class Make10(LessonScene):
    def construct(self):
        self.title(L)
        f1 = TenFrame(cell=0.78).move_to(LEFT * 3.2 + UP * 1.1)
        f2 = TenFrame(cell=0.78).move_to(RIGHT * 3.2 + UP * 1.1)
        eight = VGroup(*[f1.counter(i, color=LAKE) for i in range(8)])
        five = VGroup(*[f2.counter(i, color=BERRY) for i in range(5)])
        self.play(FadeIn(f1), FadeIn(f2), run_time=0.5)
        self.play(LaggedStart(*[FadeIn(c, scale=0.5) for c in [*eight, *five]], lag_ratio=0.08), run_time=1.6)
        self.story(L)

        # 0 · eight plus five
        lbl = VGroup(num(8, 64, LAKE), num("+", 64, INK), num(5, 64, BERRY)).arrange(RIGHT, buff=0.3).next_to(VGroup(f1, f2), DOWN, buff=0.45)
        self.step(L, 0, FadeIn(lbl, shift=UP * 0.2), Indicate(eight, color=LAKE, scale_factor=1.1), Indicate(five, color=BERRY, scale_factor=1.1), run_time=1.4)
        self.wait(0.5)
        # 1 · move two over to fill the ten
        two = VGroup(five[3], five[4])
        self.step(L, 1, Circumscribe(VGroup(f1), color=ADEY), *[c.animate.move_to(f1.slot(8 + i)) for i, c in enumerate(two)], run_time=2.0)
        self.wait(0.5)
        # 2 · ten and three is thirteen
        eq = VGroup(num(10, 64, LAKE), num("+", 64, INK), num(3, 64, BERRY), num("=", 64, INK), num(13, 64, INK)).arrange(RIGHT, buff=0.3).move_to(lbl)
        self.play(FadeOut(lbl), run_time=0.3)
        self.step(L, 2, LaggedStart(*[FadeIn(x, shift=UP * 0.2) for x in eq], lag_ratio=0.3), run_time=1.6)
        self.clear_step()
        words = VGroup(num(13, 80, BERRY), am(number_word(13), 44, BERRY), en(number_word(13, "en"), 24)).arrange(RIGHT, buff=0.35).to_edge(DOWN, buff=0.35)
        self.play(FadeIn(words, shift=UP * 0.2), run_time=0.6)
        self.wait(1.4)
        self.play(FadeOut(VGroup(f1, f2, eight, five, eq, words)), run_time=0.7)
