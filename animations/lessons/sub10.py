"""Grade 1 · Lesson 5 — የማንጎ ዛፍ (The mango tree): 7 − 3 = 4.
Checkpoints pause before step 2 (how many fell?) and before step 3 (how many are left?)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Create, FadeIn, FadeOut, Indicate, LaggedStart, Line, VGroup, Wiggle)

from lk import (BERRY, INK, LAKE, LessonScene, Mango, MangoTree, am, badge, en, ground, lesson, num, number_word)

L = lesson("sub10")


def cross(m):
    c = m.get_center()
    return VGroup(Line(c + UP * 0.3 + LEFT * 0.3, c + DOWN * 0.3 + RIGHT * 0.3, stroke_color=BERRY, stroke_width=7),
                  Line(c + UP * 0.3 + RIGHT * 0.3, c + DOWN * 0.3 + LEFT * 0.3, stroke_color=BERRY, stroke_width=7))


class Sub10(LessonScene):
    def construct(self):
        self.title(L)
        soil = ground(y=-2.6)
        tree = MangoTree(s=1.15).move_to(LEFT * 1.6 + UP * 0.5)
        mangoes = VGroup(*[Mango(size=0.75).move_to(tree.spot(i)) for i in range(7)])
        self.play(FadeIn(soil), FadeIn(tree), run_time=0.6)
        self.play(LaggedStart(*[FadeIn(m, scale=0.5) for m in mangoes], lag_ratio=0.15), run_time=1.4)
        self.story(L)

        # 0 · there were seven mangoes
        t7 = badge(7, color=LAKE).scale(1.5).next_to(tree, RIGHT, buff=0.5).shift(UP * 1.2)
        self.step(L, 0, Indicate(mangoes, color="#e8642b", scale_factor=1.12), FadeIn(t7, scale=1.5), run_time=1.4)
        # 1 · three fell (the wind shakes the tree)
        fell = VGroup(mangoes[1], mangoes[4], mangoes[6])
        spots = [RIGHT * (2.0 + 1.25 * i) + DOWN * 2.2 for i in range(3)]
        self.step(L, 1, Wiggle(tree.canopy, scale_value=1.04), *[m.animate.move_to(p) for m, p in zip(fell, spots)], run_time=1.8)
        self.wait(0.5)
        # 2 · cross out the ones that fell
        xs = VGroup(*[cross(m) for m in fell])
        self.step(L, 2, LaggedStart(*[Create(x) for x in xs], lag_ratio=0.35), run_time=1.4)
        self.wait(0.5)
        # 3 · four are left
        left = VGroup(*[m for m in mangoes if m not in fell])
        t4 = badge(4, color=BERRY).scale(1.5).next_to(t7, DOWN, buff=0.3)
        self.step(L, 3, Indicate(left, color=BERRY, scale_factor=1.18), FadeIn(t4, scale=1.5), run_time=1.4)
        # 4 · seven minus three equals four
        eq = VGroup(num(7, 66, LAKE), num("−", 66, INK), num(3, 66, BERRY), num("=", 66, INK), num(4, 66, INK)).arrange(RIGHT, buff=0.28).to_edge(UP, buff=0.35).shift(RIGHT * 2.6)
        self.step(L, 4, LaggedStart(*[FadeIn(x, shift=DOWN * 0.2) for x in eq], lag_ratio=0.3), run_time=1.6)
        self.clear_step()
        words = VGroup(num(4, 80, BERRY), am(number_word(4), 44, BERRY), en(number_word(4, "en"), 24)).arrange(RIGHT, buff=0.35).to_edge(DOWN, buff=0.3)
        self.play(FadeIn(words, shift=UP * 0.2), run_time=0.6)
        self.wait(1.4)
        self.play(FadeOut(VGroup(soil, tree, mangoes, xs, t7, t4, eq, words)), run_time=0.7)
