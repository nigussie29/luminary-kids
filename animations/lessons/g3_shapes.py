"""Grade 3 · Lesson 13 — ቅርጾች (Shapes): triangle, rectangle, square and other four-sided shapes, by sides and corners."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (Group, DOWN, LEFT, RIGHT, UP, Circumscribe, Dot, FadeIn, FadeOut, Indicate, LaggedStart, Line, Polygon,
                   Rectangle, RightAngle, Square, VGroup)

from lk import (ADEY, BERRY, FIELD, INK, LAKE, LessonScene, am, badge, en, lesson, num)

L = lesson("g3_shapes")


def ticks_on(seg, n=1, color=INK):
    m = seg.get_center(); d = seg.get_unit_vector(); p = [-d[1], d[0], 0]
    return VGroup(*[Line(m + (k - (n - 1) / 2) * 0.12 * d - 0.15 * __import__('numpy').array(p), m + (k - (n - 1) / 2) * 0.12 * d + 0.15 * __import__('numpy').array(p),
                         stroke_color=color, stroke_width=4) for k in range(n)])


class G3Shapes(LessonScene):
    def construct(self):
        self.title(L)
        wall = Square(3.0, fill_color="#f4e3c3", fill_opacity=1, stroke_color=INK, stroke_width=4).move_to(LEFT * 3 + DOWN * 0.4)
        roof = Polygon(wall.get_corner(UP + LEFT) + LEFT * 0.4, wall.get_corner(UP + RIGHT) + RIGHT * 0.4, wall.get_top() + UP * 1.6,
                       fill_color=BERRY, fill_opacity=0.35, stroke_color=BERRY, stroke_width=5)
        door = Rectangle(width=0.9, height=1.6, fill_color="#a0672b", fill_opacity=0.6, stroke_color="#5c3a12", stroke_width=5) \
            .move_to(wall).align_to(wall, DOWN).shift(LEFT * 0.55)
        window = Square(0.9, fill_color=LAKE, fill_opacity=0.3, stroke_color=LAKE, stroke_width=5).move_to(wall).shift(RIGHT * 0.75 + UP * 0.45)
        house = VGroup(wall, roof, door, window)
        self.play(FadeIn(house, shift=UP * 0.2), run_time=1.0)
        self.story(L)
        info = RIGHT * 3.4

        # 0 · triangle: 3 sides, 3 corners
        v = roof.get_vertices()
        dots = VGroup(*[Dot(p, radius=0.11, color=ADEY) for p in v])
        t = VGroup(am("ሶስት ማዕዘን", 40, BERRY), en("triangle · 3 sides, 3 corners", 22)).arrange(DOWN, buff=0.08).move_to(info + UP * 2.2)
        self.step(L, 0, Indicate(roof, color=BERRY), LaggedStart(*[FadeIn(d, scale=2) for d in dots], lag_ratio=0.3), FadeIn(t), run_time=1.8)

        # 1 · rectangle: opposite sides equal
        dv = door.get_vertices()
        sides = [Line(dv[i], dv[(i + 1) % 4]) for i in range(4)]
        marks = VGroup(ticks_on(sides[0], 1, ADEY), ticks_on(sides[2], 1, ADEY), ticks_on(sides[1], 2, ADEY), ticks_on(sides[3], 2, ADEY))
        r = VGroup(am("አራት ማዕዘን", 40, "#7a4a22"), en("rectangle · opposite sides equal", 22)).arrange(DOWN, buff=0.08).move_to(info + UP * 0.8)
        self.step(L, 1, Indicate(door, color="#a0672b"), FadeIn(marks), FadeIn(r), run_time=1.8)

        # 2 · square: four equal sides, four square corners
        wv = window.get_vertices()
        wsides = [Line(wv[i], wv[(i + 1) % 4]) for i in range(4)]
        wm = VGroup(*[ticks_on(s, 1, BERRY) for s in wsides])
        corner = RightAngle(wsides[0], wsides[1], length=0.18, color=INK, quadrant=(-1, 1))
        sq = VGroup(am("ካሬ", 40, LAKE), en("square · 4 equal sides, 4 square corners", 22)).arrange(DOWN, buff=0.08).move_to(info + DOWN * 0.6)
        self.step(L, 2, Indicate(window, color=LAKE), FadeIn(wm), FadeIn(corner), FadeIn(sq), run_time=1.8)

        # 3 · every four-sided shape is a quadrilateral
        quads = VGroup(Square(0.9, color=LAKE), Rectangle(width=1.3, height=0.7, color="#a0672b"),
                       Polygon([0, 0.55, 0], [0.5, 0, 0], [0, -0.55, 0], [-0.5, 0, 0], color=FIELD),
                       Polygon([-0.35, 0.4, 0], [0.35, 0.4, 0], [0.65, -0.4, 0], [-0.65, -0.4, 0], color=BERRY)) \
            .arrange(RIGHT, buff=0.35).move_to(info + DOWN * 2.0)
        for q in quads: q.set_stroke(width=5).set_fill(q.get_color(), 0.25)
        lbl = VGroup(am("ባለ አራት ጎን", 34, INK), en("quadrilaterals", 20)).arrange(RIGHT, buff=0.15).next_to(quads, UP, buff=0.15)
        self.step(L, 3, FadeOut(VGroup(t, r, sq)), LaggedStart(*[FadeIn(q, scale=0.7) for q in quads], lag_ratio=0.3), FadeIn(lbl), run_time=2.0)
        self.clear_step()
        self.play(Circumscribe(quads, color=BERRY), run_time=1.0)
        self.wait(1.8)
        self.play(FadeOut(Group(*self.mobjects)), run_time=0.8)
