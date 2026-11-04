"""Grade 3 · Lesson 11 — ርዝመት፣ ክብደት እና መጠን (Length, mass and liquids): a 12 cm pencil, a 3 kg bag of teff,
a 5 L jerrycan. Big idea: start measuring at zero; each kind of amount has its own unit."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (Group, DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, GrowFromEdge, Indicate, LaggedStart,
                   Rotate, RoundedRectangle, VGroup)

from lk import (ADEY, BERRY, FIELD, INK, LAKE, Jerrycan, LessonScene, Pencil, Ruler, Scale, am, en, lesson, num)

L = lesson("g3_measure")


def tag(n, unit_am, unit_en, color):
    return VGroup(num(n, 56, color), VGroup(am(unit_am, 26, color), en(unit_en, 18)).arrange(DOWN, buff=0.04)).arrange(RIGHT, buff=0.15)


class G3Measure(LessonScene):
    def construct(self):
        self.title(L)
        ruler = Ruler(15, unit=0.42).move_to(LEFT * 2.6 + UP * 1.7)
        pencil = Pencil(length=12 * 0.42).move_to(LEFT * 2.6 + UP * 2.6)
        pencil.align_to(ruler.x(0), LEFT)
        scale = Scale(10).scale(0.95).move_to(LEFT * 2.6 + DOWN * 1.0)
        can = Jerrycan(5).move_to(RIGHT * 4.3 + DOWN * 0.1)
        self.play(FadeIn(ruler), FadeIn(pencil, shift=DOWN * 0.2), FadeIn(scale), FadeIn(can), run_time=1.0)
        self.story(L)

        # 0 · the pencil from 0 to 12 cm
        end = VGroup(*[ruler.ticks[12], ruler.labels[12]])
        t1 = tag(12, "ሳንቲ ሜትር", "cm", LAKE).next_to(ruler, RIGHT, buff=0.35)
        self.step(L, 0, Indicate(ruler.labels[0], color=FIELD, scale_factor=1.8), Indicate(end, color=BERRY, scale_factor=1.6),
                  FadeIn(t1, shift=LEFT * 0.2), run_time=1.8)

        # 1 · a bag of teff on the scale: 3 kg
        bag = RoundedRectangle(width=1.2, height=0.9, corner_radius=0.25, fill_color="#e9dcc0", fill_opacity=1, stroke_color="#8a6a20",
                               stroke_width=3).next_to(scale.pan, UP, buff=0.02)
        bag_lbl = am("ጤፍ", 26, "#5a4300").move_to(bag)
        turn = scale.angle(3) - scale.angle(0)
        t2 = tag(3, "ኪሎ ግራም", "kg", BERRY).next_to(scale, RIGHT, buff=0.3)
        self.step(L, 1, FadeIn(VGroup(bag, bag_lbl), shift=DOWN * 0.4), Rotate(scale.needle, angle=-turn, about_point=scale.c),
                  FadeIn(t2, shift=LEFT * 0.2), run_time=1.8)

        # 2 · the jerrycan holds 5 L
        water = can.water(5)
        t3 = tag(5, "ሊትር", "litres", LAKE).next_to(can, DOWN, buff=0.25)
        self.step(L, 2, GrowFromEdge(water, DOWN), FadeIn(t3, shift=DOWN * 0.2), run_time=1.8)
        self.add(can.marks)

        # 3 · units for each kind of amount
        self.step(L, 3, LaggedStart(Indicate(t1, color=LAKE), Indicate(t2, color=BERRY), Indicate(t3, color=LAKE), lag_ratio=0.5), run_time=2.0)
        self.clear_step()
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
