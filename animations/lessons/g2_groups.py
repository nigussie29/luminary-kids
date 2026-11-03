"""Grade 2 · Lesson 4 — እኩል ቡድኖች (Equal groups): 3 × 4 = 12.
Big idea: equal groups can be counted by skip counting; 'three times four' means three groups of four."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Brace, Circumscribe, FadeIn, FadeOut, Indicate, LaggedStart,
                   TransformFromCopy, VGroup)

from lk import (BERRY, INK, LAKE, LessonScene, TrayOf, am, badge, en, lesson, num, number_word)

L = lesson("g2_groups")


class G2Groups(LessonScene):
    def construct(self):
        self.title(L)

        trays = VGroup(*[TrayOf(4, s=0.55) for _ in range(3)]).arrange(RIGHT, buff=0.45).move_to(UP * 1.6)
        self.play(LaggedStart(*[FadeIn(t, shift=DOWN * 0.3) for t in trays], lag_ratio=0.35), run_time=1.5)
        self.story(L)

        # 0 · four, eight, twelve — skip count one tray at a time
        tags = VGroup(*[badge(4 * (i + 1), color=LAKE).scale(1.3).next_to(t, UP, buff=0.18)
                        for i, t in enumerate(trays)])
        self.step(L, 0, LaggedStart(*[LaggedStart(Indicate(t.cups, color=LAKE, scale_factor=1.12),
                                                  FadeIn(g, scale=1.5), lag_ratio=0.3)
                                      for t, g in zip(trays, tags)], lag_ratio=0.6), run_time=2.4)

        # 1 · three groups of four make twelve
        brace = Brace(trays, DOWN, color=INK, buff=0.15)
        groups_line = VGroup(am("3 ቡድኖች", 36), en("3 groups", 22), am("× 4 ስኒዎች", 36), en("of 4 cups", 22),
                             am("= 12", 36)).arrange(RIGHT, buff=0.22).next_to(brace, DOWN, buff=0.15)
        self.step(L, 1, FadeIn(brace), FadeIn(groups_line, shift=UP * 0.2), run_time=1.4)

        # 2 · three times four equals twelve (and 4 + 4 + 4 = 12)
        sym = VGroup(num(3, 72, BERRY), num("×", 72, INK), num(4, 72, LAKE), num("=", 72, INK), num(12, 72, INK)) \
            .arrange(RIGHT, buff=0.3).move_to(DOWN * 0.95)
        rep = VGroup(num(4, 44, LAKE), num("+", 44, INK), num(4, 44, LAKE), num("+", 44, INK), num(4, 44, LAKE),
                     num("=", 44, INK), num(12, 44, INK)).arrange(RIGHT, buff=0.18).next_to(sym, UP, buff=0.25)
        self.step(L, 2, FadeOut(groups_line), FadeOut(brace),
                  LaggedStart(FadeIn(rep, shift=UP * 0.2), TransformFromCopy(rep, sym), lag_ratio=0.5), run_time=1.8)
        self.clear_step()

        words = VGroup(am("ሶስት ጊዜ አራት እኩል ነው አስራ ሁለት", 40, BERRY),
                       en("three times four equals twelve", 24)).arrange(DOWN, buff=0.12).to_edge(DOWN, buff=0.55)
        self.play(FadeIn(words, shift=UP * 0.2), Circumscribe(sym, color=BERRY), run_time=1.0)
        self.wait(2.0)
        self.play(FadeOut(VGroup(trays, tags, rep, sym, words)), run_time=0.8)
