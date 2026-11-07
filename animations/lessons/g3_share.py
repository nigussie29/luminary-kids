"""Grade 3 · Lesson 5 — እኩል ማካፈል (Sharing equally): 12 ÷ 3 = 4.
Big idea: deal one at a time, in turns, until none are left; every share is the same."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, LaggedStart, Succession, VGroup)

from lk import (BERRY, INK, LAKE, Kid, LessonScene, Orange, Plate, am, badge, en, lesson, num)

L = lesson("g3_share")


class G3Share(LessonScene):
    def construct(self):
        self.title(L)

        pile = VGroup(*[Orange(1.0) for _ in range(12)]).arrange_in_grid(rows=2, buff=0.12).move_to(UP * 2.6)
        kids = VGroup(*[Kid(i, s=0.85) for i in (0, 3, 1)]).arrange(RIGHT, buff=3.0).move_to(DOWN * 0.9)
        plates = VGroup(*[Plate().next_to(k, UP, buff=0.25) for k in kids])
        self.play(FadeIn(pile, shift=DOWN * 0.2), LaggedStart(*[FadeIn(VGroup(k, p), shift=UP * 0.2) for k, p in zip(kids, plates)],
                                                               lag_ratio=0.3), run_time=1.4)
        self.story(L)

        # deal in turns: orange k goes to plate k % 3, filling each plate's spots in order
        oranges = list(pile)[::-1]   # take from the end of the pile

        def deal(turn):
            moves = []
            for p in range(3):
                o = oranges[turn * 3 + p]
                moves.append(o.animate.move_to(plates[p].spot(turn)))
            return Succession(*moves, lag_ratio=1.0)

        # 0 · one for you, one for you, one for him
        self.step(L, 0, deal(0), run_time=2.0)

        # 1 · keep going until none are left
        self.step(L, 1, Succession(deal(1), deal(2), deal(3)), run_time=3.6)

        # 2 · each child got four
        tags = VGroup(*[badge(4, color=LAKE).scale(1.2).next_to(p, LEFT, buff=0.2).shift(UP * 0.5) for p in plates])
        self.step(L, 2, LaggedStart(*[FadeIn(t, scale=1.5) for t in tags], lag_ratio=0.3), run_time=1.4)

        # 3 · 12 ÷ 3 = 4
        e = VGroup(num(12, 80, INK), num("÷", 80, INK), num(3, 80, BERRY), num("=", 80, INK), num(4, 80, LAKE)) \
            .arrange(RIGHT, buff=0.28).move_to(UP * 2.6)
        self.step(L, 3, FadeIn(e, shift=DOWN * 0.2), run_time=1.4)
        self.clear_step()
        words = VGroup(am("አስራ ሁለት ሲካፈል ለሶስት እኩል ነው አራት", 40, BERRY),
                       en("twelve divided by three equals four", 22)).arrange(DOWN, buff=0.1).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(words, shift=UP * 0.2), Circumscribe(e, color=BERRY), run_time=1.0)
        self.wait(2.0)
        self.play(FadeOut(VGroup(pile, kids, plates, tags, e, words)), run_time=0.8)
