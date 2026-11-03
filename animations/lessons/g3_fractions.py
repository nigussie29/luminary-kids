"""Grade 3 · Lesson 6 — ሶስተኛ እና ሌሎች ክፍልፋዮች (Thirds and other fractions).
Big idea: one of three equal parts is one third (1/3); two parts are two thirds; three thirds are one whole."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, Create, FadeIn, FadeOut, LaggedStart, Line, VGroup)

from lk import (ADEY, BERRY, INK, LAKE, Injera, Kid, LessonScene, am, en, lesson, num)

L = lesson("g3_fractions")


def frac(a, b, color=INK, size=64):
    top, bot = num(a, size, color), num(b, size, color)
    bar = Line(LEFT * 0.32, RIGHT * 0.32, stroke_color=color, stroke_width=5)
    return VGroup(top, bar, bot).arrange(DOWN, buff=0.08)


def tag(a, b, am_word, en_word, color):
    return VGroup(frac(a, b, color), VGroup(am(am_word, 40, color), en(en_word, 22)).arrange(DOWN, buff=0.06)) \
        .arrange(RIGHT, buff=0.3)


class G3Fractions(LessonScene):
    def construct(self):
        self.title(L)

        inj = Injera(r=1.55, seed=5).move_to(LEFT * 3.4 + UP * 1.0)
        kids = VGroup(*[Kid(i, s=0.7) for i in (2, 0, 4)]).arrange(RIGHT, buff=0.7).move_to(RIGHT * 3.6 + UP * 2.4)
        self.play(FadeIn(inj, scale=0.8), LaggedStart(*[FadeIn(k, shift=UP * 0.2) for k in kids], lag_ratio=0.3), run_time=1.2)
        self.story(L)

        # 0 · three equal parts
        cuts = inj.cuts(3).set_z_index(2)   # cut lines stay on top of the coloured parts
        self.step(L, 0, Create(cuts), run_time=1.6)

        # 1 · one part is one third: 1/3
        p1 = inj.piece(0, 3, color=ADEY)
        t1 = tag(1, 3, "አንድ ሶስተኛ", "one third", "#a07400").move_to(RIGHT * 3.6 + UP * 0.8)
        self.step(L, 1, FadeIn(p1), FadeIn(t1, shift=LEFT * 0.2), run_time=1.6)

        # 2 · two parts are two thirds: 2/3
        p2 = inj.piece(1, 3, color=LAKE)
        t2 = tag(2, 3, "ሁለት ሶስተኛ", "two thirds", LAKE).move_to(RIGHT * 3.6 + DOWN * 0.8)
        self.step(L, 2, FadeIn(p2), FadeIn(t2, shift=LEFT * 0.2), run_time=1.6)

        # 3 · three thirds make one whole
        p3 = inj.piece(2, 3, color=BERRY)
        whole = VGroup(frac(3, 3, BERRY), num("=", 60, INK), num(1, 72, BERRY), VGroup(am("ሙሉ", 40, BERRY), en("whole", 22)).arrange(DOWN, buff=0.06)) \
            .arrange(RIGHT, buff=0.3).next_to(inj, DOWN, buff=0.35)
        self.step(L, 3, FadeIn(p3), FadeIn(whole, shift=UP * 0.2), run_time=1.6)
        self.clear_step()
        self.play(Circumscribe(VGroup(inj, cuts, p1, p2, p3), color=BERRY), run_time=1.0)
        self.wait(2.0)
        self.play(FadeOut(VGroup(inj, cuts, p1, p2, p3, t1, t2, whole, kids)), run_time=0.8)
