"""Grade 3 pictures: hundred flats, a three-tray place-value mat, three-digit written columns,
coffee seedlings in rows, plates for sharing."""
import numpy as np
from manim import (DOWN, LEFT, RIGHT, UP, Dot, Ellipse, Line, Polygon, Rectangle, RoundedRectangle, VGroup)

from .parts2 import ONES_C, Rod, label
from .style import ADEY_SOFT, BERRY, BERRY_SOFT, FIELD, INK, LAKE, LAKE_SOFT, num

S3 = 0.145   # unit size on the Grade 3 mat (a flat is 10 × S3 wide)


class Flat(VGroup):
    """A hundred: ten rods side by side (so it can be shown as ten tens joining)."""

    def __init__(self, s=S3, color=BERRY, **kw):
        super().__init__(**kw)
        self.add(*[Rod(s, color=color).shift(RIGHT * s * (i - 4.5)) for i in range(10)])


def rods(n, s=S3, color=LAKE, buff=None):
    return VGroup(*[Rod(s, color=color) for _ in range(n)]).arrange(RIGHT, buff=s * 0.5 if buff is None else buff)


class PlaceValueMat3(VGroup):
    """Three trays labelled Hundreds | Tens | Ones in Amharic and English."""

    def __init__(self, width=12.6, height=3.0, **kw):
        super().__init__(**kw)
        w = (width - 0.3) / 3
        cols = [("መቶዎች", "Hundreds", BERRY_SOFT, BERRY), ("አስሮች", "Tens", LAKE_SOFT, LAKE), ("አንዶች", "Ones", ADEY_SOFT, "#8a6a00")]
        self.trays, self.labels = VGroup(), VGroup()
        for i, (a, e, bg, fg) in enumerate(cols):
            t = RoundedRectangle(width=w, height=height, corner_radius=0.15, fill_color=bg, fill_opacity=1,
                                 stroke_width=0).shift(RIGHT * (i - 1) * (w + 0.15))
            self.trays.add(t)
            self.labels.add(label(a, e, fg).next_to(t, UP, buff=0.12))
        self.add(self.trays, self.labels)


DIGIT_C = [BERRY, LAKE, ONES_C]   # hundreds, tens, ones


class Column3(VGroup):
    """Written vertical addition / subtraction with hundreds, tens and ones columns."""

    def __init__(self, a, b, op="+", size=72, dx=0.72, **kw):
        super().__init__(**kw)
        self.size, self.dx = size, dx
        self.origin = Dot(radius=0.001, fill_opacity=0, stroke_width=0)
        self.add(self.origin)
        self.rows = []
        for r, n in enumerate([a, b]):
            row = self.digits(n, r)
            self.rows.append(row)
            self.add(row)
        self.op = num(op, size, INK).move_to(self.pos(-1, 1))
        self.bar = Line(self.pos(-1.45, 1.62), self.pos(2.45, 1.62), stroke_color=INK, stroke_width=5)
        self.add(self.op, self.bar)

    def pos(self, col, row):
        # col 0 = hundreds, 1 = tens, 2 = ones; row 0, 1 = numbers, 2 = answer, negative = above
        extra = 0.25 if row >= 2 else 0
        return self.origin.get_center() + RIGHT * self.dx * col + DOWN * (row * 1.0 + extra)

    def digits(self, n, row, color=None):
        d = [n // 100, n // 10 % 10, n % 10]
        return VGroup(*[num(d[c], self.size, color or DIGIT_C[c]).move_to(self.pos(c, row)) for c in range(3)])

    def digit(self, d, col, row, color=None):
        return num(d, self.size, color or DIGIT_C[col]).move_to(self.pos(col, row))

    def small(self, d, col, row=-0.62, color=BERRY):
        return num(d, int(self.size * 0.5), color).move_to(self.pos(col, row))

    def strike(self, col, row, color=BERRY):
        p = self.pos(col, row)
        return Line(p + LEFT * 0.28 + DOWN * 0.3, p + RIGHT * 0.28 + UP * 0.3, stroke_color=color, stroke_width=6)


class Seedling(VGroup):
    """A young coffee plant in a little mound of soil."""

    def __init__(self, s=0.5, **kw):
        super().__init__(**kw)
        soil = Ellipse(width=0.9 * s, height=0.28 * s, fill_color="#7a4a22", fill_opacity=1, stroke_width=0).shift(DOWN * 0.42 * s)
        stem = Line(DOWN * 0.38 * s, UP * 0.18 * s, stroke_color="#2f6b3b", stroke_width=5)
        l1 = Polygon([0, -0.02 * s, 0], [-0.48 * s, 0.12 * s, 0], [-0.3 * s, 0.36 * s, 0], fill_color=FIELD, fill_opacity=1, stroke_width=0)
        l2 = Polygon([0, 0.1 * s, 0], [0.48 * s, 0.26 * s, 0], [0.26 * s, 0.5 * s, 0], fill_color="#3fa86c", fill_opacity=1, stroke_width=0)
        self.add(soil, stem, l1, l2)


def field(rows, cols, s=0.62, gap=0.8):
    """rows × cols seedlings; returns (group of rows, soil strips)."""
    g = VGroup(*[VGroup(*[Seedling(s) for _ in range(cols)]).arrange(RIGHT, buff=gap - s) for _ in range(rows)]) \
        .arrange(DOWN, buff=gap - s * 0.9)
    strips = VGroup(*[RoundedRectangle(width=r.width + 0.35, height=0.2, corner_radius=0.08, fill_color="#c79a6b",
                                       fill_opacity=1, stroke_width=0).move_to(r.get_bottom() + UP * 0.06) for r in g])
    return g, strips


class Plate(VGroup):
    """A round plate seen from the side, with room for a little pile on top."""

    def __init__(self, w=2.2, **kw):
        super().__init__(**kw)
        self.dish = Ellipse(width=w, height=0.55, fill_color="#fbf7ef", fill_opacity=1, stroke_color="#b59a6a", stroke_width=3)
        rim = Ellipse(width=w * 0.7, height=0.3, fill_opacity=0, stroke_color="#d9cbb0", stroke_width=2)
        self.add(self.dish, rim)

    def spot(self, k):
        """Place for the k-th thing (piles in rows of two)."""
        r, c = divmod(k, 2)
        return self.dish.get_center() + RIGHT * (c - 0.5) * 0.55 + UP * (0.25 + r * 0.42) + RIGHT * 0.12 * (r % 2)
