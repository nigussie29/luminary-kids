"""Grade 2 · Lesson 9 — ርዝመትን መለካት (Measuring length): start at 0; a pencil is 8 cm, an exercise book 20 cm; doors in metres."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, Circumscribe, FadeIn, FadeOut, Group, Indicate, Rectangle, RoundedRectangle, VGroup)

from lk import (BERRY, FIELD, INK, LAKE, LessonScene, Pencil, Ruler, am, en, lesson, num)

L = lesson("g2_measure")


def tag(n, unit_am, unit_en, color):
    return VGroup(num(n, 52, color), VGroup(am(unit_am, 24, color), en(unit_en, 16)).arrange(DOWN, buff=0.04)).arrange(RIGHT, buff=0.12)


class G2Measure(LessonScene):
    def construct(self):
        self.title(L)
        ruler = Ruler(20, unit=0.5).move_to(LEFT * 1.0 + UP * 0.3)
        pencil = Pencil(length=8 * 0.5).next_to(ruler, UP, buff=0.15)
        pencil.align_to(ruler.x(0), LEFT)
        self.play(FadeIn(ruler), FadeIn(pencil, shift=DOWN * 0.2), run_time=0.8)
        self.story(L)

        # 0 · always start at zero
        self.step(L, 0, Indicate(ruler.labels[0], color=FIELD, scale_factor=2.0), Indicate(pencil, color=FIELD, scale_factor=1.05), run_time=1.6)

        # 1 · the pencil reaches 8: 8 cm
        t1 = tag(8, "ሳንቲ ሜትር", "cm", LAKE).next_to(pencil, UP, buff=0.25).align_to(pencil, RIGHT)
        self.step(L, 1, Indicate(VGroup(ruler.ticks[8], ruler.labels[8]), color=BERRY, scale_factor=1.8), FadeIn(t1, shift=DOWN * 0.2), run_time=1.6)

        # 2 · the exercise book is 20 cm, longer than the pencil
        book = RoundedRectangle(width=20 * 0.5, height=0.7, corner_radius=0.06, fill_color=LAKE, fill_opacity=0.85, stroke_color=INK, stroke_width=2)
        book.next_to(ruler, DOWN, buff=0.15).align_to(ruler.x(0), LEFT)
        t2 = tag(20, "ሳንቲ ሜትር", "cm", LAKE).next_to(book, DOWN, buff=0.2).align_to(book, RIGHT)
        blbl = am("ደብተር", 28, "#ffffff").move_to(book)
        self.step(L, 2, FadeIn(VGroup(book, blbl), shift=UP * 0.2), FadeIn(t2), run_time=1.8)

        # 3 · big things like a door: metres
        door = Rectangle(width=1.2, height=2.6, fill_color="#a0672b", fill_opacity=0.9, stroke_color="#5c3a12", stroke_width=4).move_to(RIGHT * 5.6 + UP * 0.6)
        t3 = VGroup(num(2, 52, BERRY), VGroup(am("ሜትር", 26, BERRY), en("metres", 16)).arrange(DOWN, buff=0.04)).arrange(RIGHT, buff=0.12).next_to(door, DOWN, buff=0.2)
        self.step(L, 3, FadeIn(door, shift=LEFT * 0.3), FadeIn(t3), run_time=1.6)
        self.clear_step()
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
