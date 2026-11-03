"""Grade 2 · Lesson 1 — አስሮች እና አንዶች (Tens and ones).
Big idea: a bundle is one ten; the tens digit counts bundles, the ones digit counts single sticks."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, FadeIn, FadeOut, Indicate, LaggedStart,
                   TransformFromCopy, VGroup)

from lk import (ADEY, BERRY, INK, LAKE, Bundle, LessonScene, Stick, am, badge, en, lesson,
                num, number_word)

L = lesson("g2_placevalue")


def two_digit(n, size=120):
    """Number with the tens digit in lake blue and the ones digit in marigold."""
    t, o = divmod(n, 10)
    return VGroup(num(t, size, LAKE), num(o, size, "#c28f00")).arrange(RIGHT, buff=0.05)


class G2PlaceValue(LessonScene):
    def construct(self):
        self.title(L)

        bundles = VGroup(*[Bundle(1.7) for _ in range(3)]).arrange(RIGHT, buff=0.45)
        singles = VGroup(*[Stick(1.7) for _ in range(4)]).arrange(RIGHT, buff=0.62)
        pic = VGroup(bundles, singles).arrange(RIGHT, buff=1.2).move_to(UP * 1.0)
        self.play(LaggedStart(*[FadeIn(b, shift=DOWN * 0.3) for b in bundles], lag_ratio=0.3), run_time=1.2)
        self.story(L)

        # 0 · three bundles of ten and four single sticks
        self.step(L, 0, LaggedStart(*[FadeIn(s, shift=DOWN * 0.3) for s in singles], lag_ratio=0.2),
                  Indicate(bundles, color=BERRY, scale_factor=1.05), run_time=1.6)

        # 1 · three tens are thirty: count the bundles by tens
        tags = VGroup(*[badge(10 * (i + 1), color=LAKE).scale(1.15).next_to(b, UP, buff=0.15)
                        for i, b in enumerate(bundles)])
        self.step(L, 1, LaggedStart(*[FadeIn(t, scale=1.5) for t in tags], lag_ratio=0.45), run_time=1.8)

        # 2 · thirty and four is thirty-four: count on with the singles
        tags1 = VGroup(*[badge(31 + i, color="#c28f00").scale(0.95).next_to(s, UP, buff=0.15)
                         for i, s in enumerate(singles)])
        self.step(L, 2, LaggedStart(*[FadeIn(t, scale=1.5) for t in tags1], lag_ratio=0.35), run_time=1.6)
        self.clear_step()

        # the number: tens digit = bundles, ones digit = singles
        n = two_digit(34).move_to(DOWN * 1.65 + LEFT * 2.4)
        words = VGroup(am(number_word(34), size=48), en(number_word(34, "en"), size=26)) \
            .arrange(DOWN, buff=0.1).next_to(n, RIGHT, buff=0.7)
        expanded = VGroup(num(30, 54, LAKE), num("+", 54, INK), num(4, 54, "#c28f00"),
                          num("=", 54, INK), num(34, 54, INK)).arrange(RIGHT, buff=0.25) \
            .next_to(VGroup(n, words), DOWN, buff=0.35)
        self.play(TransformFromCopy(bundles, n[0]), TransformFromCopy(singles, n[1]), run_time=1.2)
        self.play(FadeIn(words, shift=LEFT * 0.2), run_time=0.6)
        self.play(FadeIn(expanded, shift=UP * 0.2), run_time=0.7)
        self.wait(2.0)
        self.play(FadeOut(VGroup(bundles, singles, tags, tags1, n, words, expanded)), run_time=0.8)
