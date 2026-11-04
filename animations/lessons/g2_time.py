"""Grade 2 · Lesson 10 — ሰዓት በአምስት ደቂቃ (Time to five minutes): 3:15, quarter past three; Ethiopian time quarter past nine."""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, Group, Indicate, LaggedStart, VGroup)

from lk import (BERRY, INK, LAKE, Clock, LessonScene, am, badge, en, lesson, num)

L = lesson("g2_time")


class G2Time(LessonScene):
    def construct(self):
        self.title(L)
        clock = Clock(r=2.0).set_time(3, 15).move_to(LEFT * 3.4 + UP * 0.8)
        self.play(FadeIn(clock, scale=0.9), run_time=0.8)
        self.story(L)
        c = clock.c

        # 0 · the hour is 3
        h = VGroup(num(3, 80, INK), am("ሰዓት", 30, INK)).arrange(RIGHT, buff=0.2).move_to(RIGHT * 3.0 + UP * 2.2)
        self.step(L, 0, Indicate(clock.hour, color=LAKE, scale_factor=1.15), Indicate(clock.nums[2], color=LAKE, scale_factor=1.6),
                  FadeIn(h, shift=LEFT * 0.2), run_time=1.6)

        # 1 · 5, 10, 15 minutes
        fives = VGroup()
        for k in range(1, 4):
            a = np.radians(90 - 30 * k)
            fives.add(badge(5 * k, color=BERRY).scale(0.85).move_to(c + np.array([np.cos(a), np.sin(a), 0]) * clock.r * 1.22))
        self.step(L, 1, Indicate(clock.minute, color=BERRY, scale_factor=1.1), LaggedStart(*[FadeIn(f, scale=1.5) for f in fives], lag_ratio=0.4), run_time=1.8)

        # 2 · 3:15, quarter past three
        dig = num("3:15", 110, INK).move_to(RIGHT * 3.0 + UP * 0.8)
        q = VGroup(am("ሶስት ከሩብ", 40, LAKE), en("quarter past three", 20)).arrange(DOWN, buff=0.08).next_to(dig, DOWN, buff=0.3)
        self.step(L, 2, FadeOut(h), FadeIn(dig, shift=UP * 0.2), FadeIn(q), run_time=1.6)

        # 3 · Ethiopian time: quarter past nine
        eth = VGroup(am("ዘጠኝ ሰዓት ከሩብ", 40, BERRY), en("Ethiopian time", 20)).arrange(DOWN, buff=0.08).next_to(q, DOWN, buff=0.35)
        self.step(L, 3, FadeIn(eth, shift=UP * 0.2), run_time=1.4)
        self.clear_step()
        self.play(Circumscribe(VGroup(dig, eth), color=BERRY), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
