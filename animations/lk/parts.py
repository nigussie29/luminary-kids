"""Reusable math pictures: ten frame, counters, number line, flower, mango, orange."""
import numpy as np
from manim import (DOWN, LEFT, RIGHT, UP, Circle, Dot, Ellipse, Line, Rectangle,
                   RoundedRectangle, Text, VGroup)

from .style import (ADEY, BERRY, FIELD, FONT_LATIN, INK, LAKE, LINE, MUTED,
                    SURFACE)


class TenFrame(VGroup):
    """2 × 5 frame. Fill order is left-to-right on the top row, then the bottom row,
    so a full top row always reads as five (same rule as the app's ten-frame game)."""

    def __init__(self, cell=0.9, color=INK, **kw):
        super().__init__(**kw)
        self.cell = cell
        self.box = RoundedRectangle(width=5 * cell, height=2 * cell, corner_radius=0.08,
                                    stroke_color=color, stroke_width=4,
                                    fill_color=SURFACE, fill_opacity=1)
        grid = VGroup(*[Line(self.box.get_top() + RIGHT * (i * cell - 2.5 * cell),
                             self.box.get_bottom() + RIGHT * (i * cell - 2.5 * cell),
                             stroke_color=color, stroke_width=3) for i in range(1, 5)],
                      Line(self.box.get_left(), self.box.get_right(), stroke_color=color, stroke_width=3))
        self.add(self.box, grid)

    def slot(self, i):
        """Centre of slot i (0–9)."""
        row, col = divmod(i, 5)
        c = self.box.get_center()
        return c + RIGHT * (col - 2) * self.cell + UP * (0.5 - row) * self.cell

    def counter(self, i, color=BERRY):
        return Counter(radius=self.cell * 0.36, color=color).move_to(self.slot(i))


class Counter(Circle):
    """A round counter (ጠጠር)."""

    def __init__(self, radius=0.32, color=BERRY, **kw):
        super().__init__(radius=radius, fill_color=color, fill_opacity=1,
                         stroke_color=INK, stroke_width=2, **kw)


class Flower(VGroup):
    """Adey Abeba–style flower: five marigold petals, a green stem."""

    def __init__(self, size=1.0, petal=ADEY, **kw):
        super().__init__(**kw)
        s = size
        stem = Line(DOWN * 0.15 * s, DOWN * 1.1 * s, stroke_color=FIELD, stroke_width=6 * s)
        leaf = Ellipse(width=0.42 * s, height=0.18 * s, fill_color=FIELD, fill_opacity=1,
                       stroke_width=0).rotate(0.6).move_to(DOWN * 0.75 * s + RIGHT * 0.17 * s)
        petals = VGroup(*[
            Ellipse(width=0.34 * s, height=0.56 * s, fill_color=petal, fill_opacity=1,
                    stroke_color=INK, stroke_width=1.5)
            .shift(UP * 0.26 * s).rotate(a, about_point=[0, 0, 0])
            for a in np.linspace(0, 2 * np.pi, 5, endpoint=False)])
        centre = Circle(radius=0.14 * s, fill_color="#8a5a00", fill_opacity=1, stroke_width=0)
        self.add(stem, leaf, petals, centre)
        self.head = VGroup(petals, centre)


class Mango(VGroup):
    def __init__(self, size=1.0, **kw):
        super().__init__(**kw)
        body = Ellipse(width=0.62 * size, height=0.8 * size, fill_color="#f6a623", fill_opacity=1,
                       stroke_color=INK, stroke_width=1.5).rotate(-0.35)
        blush = Ellipse(width=0.3 * size, height=0.36 * size, fill_color="#e8642b", fill_opacity=0.7,
                        stroke_width=0).move_to(body.get_center() + LEFT * 0.1 * size + DOWN * 0.08 * size)
        leaf = Ellipse(width=0.3 * size, height=0.12 * size, fill_color=FIELD, fill_opacity=1,
                       stroke_width=0).rotate(0.4).next_to(body, UP, buff=-0.06 * size).shift(RIGHT * 0.1 * size)
        self.add(body, blush, leaf)


class Orange(VGroup):
    def __init__(self, size=1.0, **kw):
        super().__init__(**kw)
        body = Circle(radius=0.3 * size, fill_color="#f28c18", fill_opacity=1, stroke_color=INK, stroke_width=1.5)
        leaf = Ellipse(width=0.26 * size, height=0.1 * size, fill_color=FIELD, fill_opacity=1,
                       stroke_width=0).rotate(0.3).next_to(body, UP, buff=-0.05 * size)
        self.add(body, leaf)


class NumberLine(VGroup):
    """0…n with big digits under each tick; .point(k) gives the position of k."""

    def __init__(self, n=10, step=0.9, color=INK, **kw):
        super().__init__(**kw)
        self.n, self.step = n, step
        self.line = Line(LEFT * step * n / 2, RIGHT * step * n / 2, stroke_color=color, stroke_width=4)
        ticks, labels = VGroup(), VGroup()
        for k in range(n + 1):
            p = self.point(k)
            ticks.add(Line(p + UP * 0.15, p + DOWN * 0.15, stroke_color=color, stroke_width=3))
            labels.add(Text(str(k), font=FONT_LATIN, font_size=28, color=MUTED).move_to(p + DOWN * 0.45))
        self.ticks, self.labels = ticks, labels
        self.add(self.line, ticks, labels)

    def point(self, k):
        return self.line.get_start() + RIGHT * self.step * k


def ground(width=14, y=-1.6):
    """Simple green ground strip for outdoor scenes."""
    return Rectangle(width=width, height=0.5, fill_color="#cfe8d6", fill_opacity=1,
                     stroke_width=0).move_to([0, y, 0])


def badge(n, color=LAKE):
    """Small numbered circle that pops above an object while counting."""
    c = Circle(radius=0.3, fill_color=color, fill_opacity=1, stroke_width=0)
    t = Text(str(n), font=FONT_LATIN, font_size=30, color=SURFACE, weight="BOLD").move_to(c)
    return VGroup(c, t)


__all__ = ["TenFrame", "Counter", "Flower", "Mango", "Orange", "NumberLine", "ground", "badge", "LINE", "MUTED"]
