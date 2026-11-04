"""Grade 3 · Lesson 8 — የማባዛት ሰንጠረዥ (Times tables to 10 × 10): boxes of six eggs, 7 × 6 = 42 = 6 × 7."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, LaggedStart, TransformFromCopy, VGroup)

from lk import (BERRY, INK, LAKE, EggBox, LessonScene, am, badge, en, lesson, num)

L = lesson("g3_tables")


def eq(a, b, c, size=72):
    return VGroup(num(a, size, BERRY), num("×", size, INK), num(b, size, LAKE), num("=", size, INK), num(c, size, INK)).arrange(RIGHT, buff=0.25)


class G3Tables(LessonScene):
    def construct(self):
        self.title(L)
        boxes = VGroup(*[EggBox(s=0.42) for _ in range(7)]).arrange(RIGHT, buff=0.28).move_to(UP * 1.4)
        self.play(FadeIn(boxes[0], shift=DOWN * 0.2), run_time=0.6)
        self.story(L)
        tags = VGroup(*[badge(6 * (i + 1), color=LAKE).scale(1.05).next_to(b, UP, buff=0.18) for i, b in enumerate(boxes)])

        # 0 · 6, 12, 18
        self.step(L, 0, LaggedStart(*[LaggedStart(FadeIn(boxes[i], shift=DOWN * 0.2), FadeIn(tags[i], scale=1.5), lag_ratio=0.4)
                                      for i in range(3)], lag_ratio=0.5), run_time=2.2)
        # 1 · skip count in sixes to 42
        self.step(L, 1, LaggedStart(*[LaggedStart(FadeIn(boxes[i], shift=DOWN * 0.2), FadeIn(tags[i], scale=1.5), lag_ratio=0.4)
                                      for i in range(3, 7)], lag_ratio=0.5), run_time=2.6)
        # 2 · 7 × 6 = 42
        e1 = eq(7, 6, 42).move_to(DOWN * 0.5)
        self.step(L, 2, TransformFromCopy(tags[-1], e1[-1]), FadeIn(VGroup(*e1[:-1]), shift=UP * 0.2), run_time=1.6)
        # 3 · 6 × 7 = 42 too
        e2 = eq(6, 7, 42).next_to(e1, DOWN, buff=0.35)
        self.step(L, 3, FadeIn(e2, shift=UP * 0.2), run_time=1.4)
        self.clear_step()
        self.play(Circumscribe(VGroup(e1, e2), color=BERRY), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(VGroup(boxes, tags, e1, e2)), run_time=0.8)
