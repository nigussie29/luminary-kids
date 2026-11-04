"""Grade 3 · Lesson 15 — ግራፎች እና የቃላት ጥያቄዎች (Graphs and word problems): favourite fruit 7, 5, 3;
bananas have 2 more than mangoes; 15 children in all."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (Group, DOWN, LEFT, RIGHT, UP, Brace, Circumscribe, FadeIn, FadeOut, Indicate, LaggedStart, VGroup)

from lk import (ADEY, BERRY, FIELD, INK, LAKE, Bars, LessonScene, am, en, lesson, num)

L = lesson("g3_graphs")
COLORS = [ADEY, FIELD, "#f28c18"]


class G3Graphs(LessonScene):
    def construct(self):
        self.title(L)
        chart = Bars(["ሙዝ", "ማንጎ", "ብርቱካን"], top=8, unit=0.5, bw=1.4, gap=0.8).move_to(LEFT * 2.8 + UP * 0.7)
        self.play(FadeIn(chart), run_time=0.8)
        self.story(L)
        counts = [7, 5, 3]
        bars = VGroup(*[VGroup(*[chart.box(i, COLORS[i]).move_to(chart.slot(i, k)) for k in range(n)]) for i, n in enumerate(counts)])

        # 0 · one box for each child
        self.step(L, 0, LaggedStart(*[LaggedStart(*[FadeIn(b, shift=DOWN * 0.2) for b in bar], lag_ratio=0.25) for bar in bars], lag_ratio=0.5),
                  run_time=3.0)
        tops = VGroup(*[num(n, 40, INK).next_to(bar, UP, buff=0.1) for n, bar in zip(counts, bars)])
        self.play(FadeIn(tops), run_time=0.4)

        # 1 · the tallest bar is bananas
        self.step(L, 1, Indicate(bars[0], color=BERRY, scale_factor=1.06), Indicate(chart.names[0], color=BERRY, scale_factor=1.4), run_time=1.6)

        # 2 · bananas have two more than mangoes
        brace = Brace(VGroup(*bars[0][5:]), RIGHT, color=BERRY)
        diff = VGroup(num(7, 56, INK), num("−", 56, INK), num(5, 56, INK), num("=", 56, INK), num(2, 56, BERRY)).arrange(RIGHT, buff=0.15) \
            .move_to(RIGHT * 3.8 + UP * 1.6)
        self.step(L, 2, FadeIn(brace), FadeIn(diff, shift=LEFT * 0.2), run_time=1.6)

        # 3 · altogether 15 children
        tot = VGroup(num(7, 56, INK), num("+", 56, INK), num(5, 56, INK), num("+", 56, INK), num(3, 56, INK), num("=", 56, INK), num(15, 56, LAKE)) \
            .arrange(RIGHT, buff=0.12).next_to(diff, DOWN, buff=0.6)
        self.step(L, 3, FadeIn(tot, shift=LEFT * 0.2), run_time=1.6)
        self.clear_step()
        self.play(Circumscribe(tot, color=LAKE), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
