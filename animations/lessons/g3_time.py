"""Grade 3 · Lesson 12 — ሰዓት በደቂቃ (Time to the minute): 7:20 (Ethiopian time: 1:20 in the morning), then 40 minutes
later 8:00. Big idea: the short hand gives the hour, the long hand counts minutes in fives."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (Group, DOWN, LEFT, PI, RIGHT, UP, Circumscribe, FadeIn, FadeOut, Indicate, LaggedStart, Rotate, VGroup)

from lk import (BERRY, INK, LAKE, Clock, LessonScene, am, badge, en, lesson, num)

L = lesson("g3_time")


class G3Time(LessonScene):
    def construct(self):
        self.title(L)
        clock = Clock(r=2.0).set_time(7, 20).move_to(LEFT * 3.4 + UP * 0.8)
        self.play(FadeIn(clock, scale=0.9), run_time=0.8)
        self.story(L)
        c = clock.c

        # 0 · the short hand is just past 7 → the hour is 7
        h = VGroup(num(7, 80, INK), am("ሰዓት", 30, INK)).arrange(RIGHT, buff=0.2).move_to(RIGHT * 3.0 + UP * 2.2)
        self.step(L, 0, Indicate(clock.hour, color=LAKE, scale_factor=1.15), Indicate(clock.nums[6], color=LAKE, scale_factor=1.6),
                  FadeIn(h, shift=LEFT * 0.2), run_time=1.6)

        # 1 · the long hand on 4: 5, 10, 15, 20 minutes
        fives = VGroup()
        for k in range(1, 5):
            a = np.radians(90 - 30 * k)
            fives.add(badge(5 * k, color=BERRY).scale(0.85).move_to(c + np.array([np.cos(a), np.sin(a), 0]) * clock.r * 1.22))
        self.step(L, 1, Indicate(clock.minute, color=BERRY, scale_factor=1.1), LaggedStart(*[FadeIn(f, scale=1.5) for f in fives], lag_ratio=0.4),
                  run_time=2.0)

        # 2 · 7:20 — Ethiopian time 1:20 in the morning
        dig = num("7:20", 110, INK).move_to(RIGHT * 3.0 + UP * 0.8)
        eth = VGroup(am("ከጠዋቱ 1:20", 40, BERRY), en("Ethiopian time", 20)).arrange(DOWN, buff=0.08).next_to(dig, DOWN, buff=0.3)
        self.step(L, 2, FadeOut(h), FadeIn(dig, shift=UP * 0.2), FadeIn(eth, shift=UP * 0.2), run_time=1.6)

        # 3 · 40 minutes later: 8:00
        later = num("8:00", 110, LAKE).move_to(dig)
        plus = VGroup(num("+40", 48, BERRY), en("minutes", 20)).arrange(RIGHT, buff=0.15).next_to(eth, DOWN, buff=0.35)
        self.step(L, 3, FadeOut(fives), FadeOut(eth), FadeIn(plus),
                  Rotate(clock.minute, angle=-40 * PI / 30, about_point=c), Rotate(clock.hour, angle=-40 * PI / 360, about_point=c),
                  dig.animate.become(later), run_time=2.6)
        self.clear_step()
        self.play(Circumscribe(dig, color=LAKE), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
