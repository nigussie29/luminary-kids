"""Grade 2 · Lesson 5 — ብር እንቁጠር (Counting birr): 10 + 10 + 5 + 1 = 26.
Big idea: count money starting from the biggest note, keeping a running total."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, Indicate, LaggedStart,
                   Transform, VGroup)

from lk import (BERRY, INK, LAKE, BirrCoin, BirrNote, LessonScene, am, en, lesson, num, number_word)

L = lesson("g2_birr")


def total(n):
    return VGroup(num(n, 110, BERRY), am("ብር", 54, BERRY)).arrange(RIGHT, buff=0.2, aligned_edge=DOWN)


class G2Birr(LessonScene):
    def construct(self):
        self.title(L)

        # money in a scattered pile first
        money = VGroup(BirrNote(5), BirrNote(10), BirrCoin(1), BirrNote(10))
        pile = [LEFT * 1.2 + UP * 1.4, RIGHT * 0.9 + UP * 1.9, LEFT * 0.2 + UP * 0.9, RIGHT * 1.6 + UP * 1.0]
        angles = [0.25, -0.2, 0, 0.12]
        for m, p, a in zip(money, pile, angles):
            m.move_to(p).rotate(a)
        self.play(LaggedStart(*[FadeIn(m, shift=DOWN * 0.3) for m in money], lag_ratio=0.2), run_time=1.2)
        self.story(L)

        # 0 · start with the biggest: line them up 10, 10, 5, 1
        order = [money[1], money[3], money[0], money[2]]
        slots = VGroup(*[m.copy().rotate(-a) for m, a in zip(order, [angles[1], angles[3], angles[0], angles[2]])]) \
            .arrange(RIGHT, buff=0.4).move_to(UP * 1.9)
        self.step(L, 0, *[m.animate.rotate(-a).move_to(s) for m, a, s in
                          zip(order, [angles[1], angles[3], angles[0], angles[2]], slots)], run_time=1.6)

        # 1 · two ten-birr notes are twenty birr
        run = total(20).move_to(DOWN * 0.55)
        part = VGroup(num(10, 44, LAKE), num("+", 44, INK), num(10, 44, LAKE)).arrange(RIGHT, buff=0.15) \
            .next_to(run, UP, buff=0.25)
        self.step(L, 1, Indicate(VGroup(order[0], order[1]), color=LAKE, scale_factor=1.08),
                  FadeIn(part, shift=DOWN * 0.15), FadeIn(run, shift=UP * 0.2), run_time=1.5)

        # 2 · add a five-birr note: twenty-five
        part2 = VGroup(num(10, 44, LAKE), num("+", 44, INK), num(10, 44, LAKE), num("+", 44, INK),
                       num(5, 44, "#2f8f5b")).arrange(RIGHT, buff=0.15).move_to(part)
        self.step(L, 2, Indicate(order[2], color="#2f8f5b", scale_factor=1.12), Transform(part, part2),
                  Transform(run, total(25).move_to(run)), run_time=1.4)

        # 3 · add one birr: twenty-six birr
        part3 = VGroup(num(10, 44, LAKE), num("+", 44, INK), num(10, 44, LAKE), num("+", 44, INK),
                       num(5, 44, "#2f8f5b"), num("+", 44, INK), num(1, 44, "#8a6a20")) \
            .arrange(RIGHT, buff=0.15).move_to(part)
        self.step(L, 3, Indicate(order[3], color="#8a6a20", scale_factor=1.15), Transform(part, part3),
                  Transform(run, total(26).move_to(run)), run_time=1.4)
        self.clear_step()

        words = VGroup(am(number_word(26) + " ብር", 40, BERRY), en("twenty-six birr", 24)) \
            .arrange(DOWN, buff=0.12).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(words, shift=UP * 0.2), Circumscribe(run, color=BERRY), run_time=1.0)
        self.wait(2.0)
        self.play(FadeOut(VGroup(money, part, run, words)), run_time=0.8)
