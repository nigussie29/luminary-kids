"""Grade 2 · Lesson 12 — ሥዕላዊ ግራፍ እና አምድ ግራፍ (Picture graphs and bar graphs): favourite fruit 4, 6, 2;
mangoes have 2 more than bananas; 12 children in all."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Brace, Circumscribe, FadeIn, FadeOut, Group, Indicate, LaggedStart, VGroup)

from lk import (ADEY, BERRY, FIELD, INK, LAKE, Bars, LessonScene, lesson, num)

L = lesson("g2_graphs")
COLORS = [ADEY, FIELD, "#f28c18"]


class G2Graphs(LessonScene):
    def construct(self):
        self.title(L)
        chart = Bars(["ሙዝ", "ማንጎ", "ብርቱካን"], top=7, unit=0.55, bw=1.4, gap=0.8).move_to(LEFT * 2.8 + UP * 0.6)
        self.play(FadeIn(chart), run_time=0.8)
        self.story(L)
        counts = [4, 6, 2]
        bars = VGroup(*[VGroup(*[chart.box(i, COLORS[i]).move_to(chart.slot(i, k)) for k in range(n)]) for i, n in enumerate(counts)])

        # 0 · four, six and two children
        self.step(L, 0, LaggedStart(*[LaggedStart(*[FadeIn(b, shift=DOWN * 0.2) for b in bar], lag_ratio=0.25) for bar in bars], lag_ratio=0.5), run_time=2.8)
        tops = VGroup(*[num(n, 40, INK).next_to(bar, UP, buff=0.1) for n, bar in zip(counts, bars)])
        self.play(FadeIn(tops), run_time=0.4)

        # 1 · one box for each child
        self.step(L, 1, LaggedStart(*[Indicate(b, color=BERRY, scale_factor=1.15) for b in bars[1]], lag_ratio=0.15), run_time=1.6)

        # 2 · mangoes have two more than bananas
        brace = Brace(VGroup(*bars[1][4:]), RIGHT, color=BERRY)
        diff = VGroup(num(6, 56, INK), num("−", 56, INK), num(4, 56, INK), num("=", 56, INK), num(2, 56, BERRY)).arrange(RIGHT, buff=0.15).move_to(RIGHT * 3.8 + UP * 1.6)
        self.step(L, 2, FadeIn(brace), FadeIn(diff, shift=LEFT * 0.2), run_time=1.6)

        # 3 · altogether twelve
        tot = VGroup(num(4, 56, INK), num("+", 56, INK), num(6, 56, INK), num("+", 56, INK), num(2, 56, INK), num("=", 56, INK), num(12, 56, LAKE)) \
            .arrange(RIGHT, buff=0.12).next_to(diff, DOWN, buff=0.6)
        self.step(L, 3, FadeIn(tot, shift=LEFT * 0.2), run_time=1.6)
        self.clear_step()
        self.play(Circumscribe(tot, color=LAKE), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
