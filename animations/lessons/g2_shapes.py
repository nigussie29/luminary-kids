"""Grade 2 · Lesson 11 — ቅርጾች እና ጎኖቻቸው (Shapes and their sides): triangle 3, square 4, pentagon 5, hexagon 6, circle none."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circle, Circumscribe, FadeIn, FadeOut, Group, Indicate, LaggedStart, RegularPolygon,
                   Square, Triangle, VGroup)

from lk import (ADEY, BERRY, FIELD, INK, LAKE, LessonScene, am, en, lesson, num)

L = lesson("g2_shapes")


def card(shape, am_name, en_name, n, color):
    shape.set_stroke(color, width=6).set_fill(color, 0.25)
    label = VGroup(am(am_name, 30, color), en(en_name, 18)).arrange(DOWN, buff=0.04)
    count = num(n, 48, INK)
    return VGroup(shape, label, count).arrange(DOWN, buff=0.2)


class G2Shapes(LessonScene):
    def construct(self):
        self.title(L)
        cards = VGroup(card(Triangle().scale(0.85), "ሶስት ማዕዘን", "triangle", 3, BERRY), card(Square(1.4), "ካሬ", "square", 4, LAKE),
                       card(RegularPolygon(5).scale(0.85), "ባለ አምስት ጎን", "pentagon", 5, FIELD), card(RegularPolygon(6).scale(0.85), "ባለ ስድስት ጎን", "hexagon", 6, "#7a5bb5"),
                       card(Circle(radius=0.75), "ክብ", "circle", 0, ADEY)).arrange(RIGHT, buff=0.55, aligned_edge=UP).move_to(UP * 0.9)
        self.play(LaggedStart(*[FadeIn(c[0], shift=DOWN * 0.2) for c in cards], lag_ratio=0.2), run_time=1.2)
        self.story(L)

        def show(i, run=1.6):
            return [Indicate(cards[i][0], color=cards[i][0].get_stroke_color(), scale_factor=1.12), FadeIn(cards[i][1]), FadeIn(cards[i][2], scale=1.5)]

        self.step(L, 0, *show(0))
        self.step(L, 1, *show(1))
        self.step(L, 2, *show(2), *show(3), run_time=2.0)
        self.step(L, 3, *show(4))
        self.clear_step()
        self.play(Circumscribe(cards, color=BERRY), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
