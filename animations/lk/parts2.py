"""Grade 2 pictures: base-ten blocks, place-value mat, stick bundles, trays and cups, birr, injera."""
import numpy as np
from manim import (DOWN, LEFT, ORIGIN, RIGHT, UP, AnnularSector, Circle, Dot, Line, Polygon,
                   Rectangle, RoundedRectangle, Sector, Text, VGroup, Ellipse)

from .style import (num, ADEY, BERRY, FIELD, FONT_ETH, FONT_LATIN, INK, LAKE, LAKE_SOFT, LINE,
                    MUTED, SURFACE, TRAY, ADEY_SOFT)

U = 0.22   # side of one unit cube
ONES_C = "#c28f00"   # ones digits (darker marigold, readable on white)


class Unit(Rectangle):
    """A one (ones cube)."""

    def __init__(self, s=U, color=ADEY, **kw):
        super().__init__(width=s, height=s, fill_color=color, fill_opacity=1,
                         stroke_color=INK, stroke_width=1.5, **kw)


class Rod(VGroup):
    """A ten: ten unit cubes joined in a column, so it can be broken back into ones."""

    def __init__(self, s=U, color=LAKE, **kw):
        super().__init__(**kw)
        self.add(*[Unit(s, color=color).shift(UP * s * (i - 4.5)) for i in range(10)])


def ones(n, s=U, cols=5, color=ADEY):
    """n ones arranged in rows of five (easy to see 5 + …)."""
    g = VGroup(*[Unit(s, color=color) for _ in range(n)])
    for i, u in enumerate(g):
        r, c = divmod(i, cols)
        u.move_to(RIGHT * c * s * 1.25 + DOWN * r * s * 1.25)
    return g


def tens(n, s=U, color=LAKE):
    return VGroup(*[Rod(s, color=color) for _ in range(n)]).arrange(RIGHT, buff=s * 0.5)


class PlaceValueMat(VGroup):
    """Two trays labelled Tens | Ones in Amharic and English."""

    def __init__(self, width=7.2, height=3.4, **kw):
        super().__init__(**kw)
        w = width / 2 - 0.1
        self.tens_tray = RoundedRectangle(width=w, height=height, corner_radius=0.15, fill_color=LAKE_SOFT,
                                          fill_opacity=1, stroke_width=0).shift(LEFT * (w / 2 + 0.1))
        self.ones_tray = RoundedRectangle(width=w, height=height, corner_radius=0.15, fill_color=ADEY_SOFT,
                                          fill_opacity=1, stroke_width=0).shift(RIGHT * (w / 2 + 0.1))
        self.tens_label = label("አስሮች", "Tens", LAKE).next_to(self.tens_tray, UP, buff=0.12)
        self.ones_label = label("አንዶች", "Ones", "#8a6a00").next_to(self.ones_tray, UP, buff=0.12)
        self.add(self.tens_tray, self.ones_tray, self.tens_label, self.ones_label)


def label(am_text, en_text, color=INK):
    a = Text(am_text, font=FONT_ETH, font_size=28, color=color, weight="BOLD")
    e = Text(en_text, font=FONT_LATIN, font_size=20, color=MUTED)
    return VGroup(a, e).arrange(RIGHT, buff=0.18)


class Stick(Rectangle):
    def __init__(self, length=1.5, **kw):
        super().__init__(width=0.07, height=length, fill_color="#a0672b", fill_opacity=1,
                         stroke_color="#5c3a12", stroke_width=1, **kw)


class Bundle(VGroup):
    """Ten sticks tied with a berry-coloured band."""

    def __init__(self, length=1.5, **kw):
        super().__init__(**kw)
        self.sticks = VGroup(*[Stick(length) for _ in range(10)]).arrange(RIGHT, buff=0.015)
        band = Rectangle(width=self.sticks.width + 0.08, height=0.16, fill_color=BERRY, fill_opacity=1,
                         stroke_width=0).move_to(self.sticks)
        self.band = band
        self.add(self.sticks, band)


class Cup(VGroup):
    """A small handleless coffee cup (ስኒ)."""

    def __init__(self, s=0.4, **kw):
        super().__init__(**kw)
        body = Polygon([-0.5 * s, 0.35 * s, 0], [0.5 * s, 0.35 * s, 0], [0.32 * s, -0.35 * s, 0],
                       [-0.32 * s, -0.35 * s, 0], fill_color=SURFACE, fill_opacity=1,
                       stroke_color=INK, stroke_width=2)
        rim = Line([-0.5 * s, 0.35 * s, 0], [0.5 * s, 0.35 * s, 0], stroke_color=LAKE, stroke_width=4)
        band = Line([-0.42 * s, 0.05 * s, 0], [0.42 * s, 0.05 * s, 0], stroke_color=BERRY, stroke_width=3)
        coffee = Polygon([-0.46 * s, 0.33 * s, 0], [0.46 * s, 0.33 * s, 0], [0.44 * s, 0.24 * s, 0],
                         [-0.44 * s, 0.24 * s, 0], fill_color="#4a2c12", fill_opacity=1, stroke_width=0)
        self.add(body, coffee, band, rim)


class TrayOf(VGroup):
    """A round tray holding k cups in a row."""

    def __init__(self, k=4, s=0.42, **kw):
        super().__init__(**kw)
        self.cups = VGroup(*[Cup(s) for _ in range(k)]).arrange(RIGHT, buff=0.12)
        self.tray = Ellipse(width=self.cups.width + 0.6, height=s * 2.3, fill_color="#c98f4a", fill_opacity=1,
                            stroke_color="#7a4f1d", stroke_width=3).move_to(self.cups).shift(DOWN * 0.08)
        self.add(self.tray, self.cups)


class BirrNote(VGroup):
    """A simple play-money note (not a copy of the real design)."""
    COLORS = {100: BERRY, 50: "#7a5bb5", 10: LAKE, 5: FIELD}

    def __init__(self, value=10, **kw):
        super().__init__(**kw)
        c = self.COLORS.get(value, LAKE)
        paper = RoundedRectangle(width=1.9, height=0.95, corner_radius=0.08, fill_color=c,
                                 fill_opacity=0.18, stroke_color=c, stroke_width=4)
        inner = RoundedRectangle(width=1.65, height=0.72, corner_radius=0.06, stroke_color=c,
                                 stroke_width=1.5, fill_opacity=0)
        v = Text(str(value), font=FONT_LATIN, font_size=40, color=c, weight="BOLD")
        b = Text("ብር", font=FONT_ETH, font_size=22, color=c)
        VGroup(v, b).arrange(RIGHT, buff=0.12).move_to(paper)
        self.value = value
        self.add(paper, inner, v, b)


class BirrCoin(VGroup):
    def __init__(self, value=1, **kw):
        super().__init__(**kw)
        disc = Circle(radius=0.36, fill_color="#d8b25a", fill_opacity=1, stroke_color="#8a6a20", stroke_width=3)
        v = Text(str(value), font=FONT_LATIN, font_size=28, color="#5a4300", weight="BOLD").shift(UP * 0.06)
        b = Text("ብር", font=FONT_ETH, font_size=14, color="#5a4300").shift(DOWN * 0.16)
        self.value = value
        self.add(disc, v, b)


INJERA = "#e9dcc0"


class Injera(VGroup):
    """Round injera with its little 'eyes' (holes)."""

    def __init__(self, r=1.4, seed=3, **kw):
        super().__init__(**kw)
        self.r = r
        self.disc = Circle(radius=r, fill_color=INJERA, fill_opacity=1, stroke_color="#b59a6a", stroke_width=3)
        rng = np.random.default_rng(seed)
        eyes = VGroup()
        for _ in range(int(55 * r * r)):
            a, d = rng.uniform(0, 2 * np.pi), r * np.sqrt(rng.uniform(0, 0.88))
            eyes.add(Dot([d * np.cos(a), d * np.sin(a), 0], radius=0.02 + 0.02 * rng.random(),
                         color="#c9b68e"))
        self.add(self.disc, eyes)

    def piece(self, k, n, color=None):
        """Sector k of n equal parts (for highlighting / pulling out)."""
        return Sector(radius=self.r, angle=2 * np.pi / n, start_angle=np.pi / 2 + 2 * np.pi * k / n,
                      fill_color=color or INJERA, fill_opacity=0.85 if color else 1,
                      stroke_color="#b59a6a", stroke_width=3).shift(self.disc.get_center())

    def cuts(self, n, color=INK):
        c = self.disc.get_center()
        return VGroup(*[Line(c, c + self.r * np.array([np.cos(a), np.sin(a), 0]), stroke_color=color,
                             stroke_width=5)
                        for a in np.pi / 2 + 2 * np.pi * np.arange(n) / n])


class Column(VGroup):
    """Written vertical addition / subtraction with fixed tens and ones columns."""

    def __init__(self, a, b, op="+", size=64, **kw):
        super().__init__(**kw)
        self.size, self.dx = size, 0.62
        self.origin = Dot(radius=0.001, fill_opacity=0, stroke_width=0)  # moves with the group
        self.add(self.origin)
        self.rows = []
        for r, n in enumerate([a, b]):
            row = self.digits(n, r)
            self.rows.append(row)
            self.add(row)
        self.op = num(op, size, INK).move_to(self.pos(-1, 1))
        self.bar = Line(self.pos(-1.4, 1.65), self.pos(1.4, 1.65), stroke_color=INK, stroke_width=5)
        self.add(self.op, self.bar)

    def pos(self, col, row):
        # col 0 = tens, 1 = ones; row 0 = first number, 1 = second, 2 = answer, -1 = carry line
        extra = 0.22 if row >= 2 else 0    # answer row sits clear of the line
        return self.origin.get_center() + RIGHT * self.dx * col + DOWN * (row * 0.95 + extra)

    def digits(self, n, row, color=None):
        t, o = divmod(n, 10)
        return VGroup(num(t, self.size, color or LAKE).move_to(self.pos(0, row)),
                      num(o, self.size, color or ONES_C).move_to(self.pos(1, row)))

    def small(self, d, col, row=-0.55, color=BERRY):
        return num(d, int(self.size * 0.55), color).move_to(self.pos(col, row))


# ---------------- Grade 1 hook-video pictures ----------------
class Kid(VGroup):
    """A small child (head, hair, shirt) for the bajaj ride."""
    SHIRTS = [ADEY, LAKE, FIELD, BERRY, "#7a5bb5"]
    SKINS = ["#8d5a3b", "#5e3a24", "#a8714d", "#74472b", "#6b4228"]

    def __init__(self, i=0, s=0.5, **kw):
        super().__init__(**kw)
        body = RoundedRectangle(width=0.9 * s, height=0.8 * s, corner_radius=0.3 * s, fill_color=self.SHIRTS[i % 5],
                                fill_opacity=1, stroke_width=0).shift(DOWN * 0.45 * s)
        head = Circle(radius=0.36 * s, fill_color=self.SKINS[i % 5], fill_opacity=1, stroke_width=0).shift(UP * 0.25 * s)
        hair = Ellipse(width=0.74 * s, height=0.34 * s, fill_color="#1d130d", fill_opacity=1, stroke_width=0).shift(UP * 0.5 * s)
        eyes = VGroup(Dot(radius=0.045 * s * 1.6, color="#2b1d14").shift(LEFT * 0.12 * s + UP * 0.25 * s),
                      Dot(radius=0.045 * s * 1.6, color="#2b1d14").shift(RIGHT * 0.12 * s + UP * 0.25 * s))
        self.add(body, head, hair, eyes)


class Bajaj(VGroup):
    """A three-wheeled bajaj (auto-rickshaw), seen from the side, with five seats."""

    def __init__(self, s=1.0, **kw):
        super().__init__(**kw)
        cab = RoundedRectangle(width=5.6 * s, height=2.3 * s, corner_radius=0.7 * s, fill_color="#2a6fb0", fill_opacity=1,
                               stroke_color=INK, stroke_width=3)
        roof = RoundedRectangle(width=5.0 * s, height=0.35 * s, corner_radius=0.15 * s, fill_color="#1d2540", fill_opacity=1,
                                stroke_width=0).next_to(cab, UP, buff=-0.12 * s)
        win = RoundedRectangle(width=4.4 * s, height=1.15 * s, corner_radius=0.3 * s, fill_color="#d9eef2", fill_opacity=1,
                               stroke_color=INK, stroke_width=2).move_to(cab).shift(UP * 0.35 * s + RIGHT * 0.2 * s)
        wheels = VGroup(*[Circle(radius=0.42 * s, fill_color="#1d2540", fill_opacity=1, stroke_color="#586178", stroke_width=4)
                          .move_to(cab.get_bottom() + RIGHT * x * s) for x in (-1.9, 2.0)])
        lamp = Circle(radius=0.16 * s, fill_color=ADEY, fill_opacity=1, stroke_width=0).move_to(cab.get_right() + LEFT * 0.25 * s)
        self.window = win
        self.add(cab, roof, win, wheels, lamp)

    def seat(self, k, n=5):
        w = self.window
        return w.get_left() + RIGHT * (w.width * (k + 0.5) / n) + DOWN * 0.05


class MangoTree(VGroup):
    """A tree with a round canopy; .spot(i) gives places for mangoes."""

    def __init__(self, s=1.0, **kw):
        super().__init__(**kw)
        trunk = Rectangle(width=0.55 * s, height=2.0 * s, fill_color="#7a4a22", fill_opacity=1, stroke_width=0).shift(DOWN * 1.2 * s)
        canopy = VGroup(*[Circle(radius=r * s, fill_color=FIELD, fill_opacity=1, stroke_width=0).shift(np.array([x, y, 0]) * s)
                          for r, x, y in ((1.3, 0, 0.5), (1.0, -1.1, 0.1), (1.0, 1.1, 0.1), (0.9, 0, 1.3))])
        self.canopy = canopy
        self.s = s
        self.add(trunk, canopy)

    SPOTS = [(-1.3, 0.2), (-0.6, 0.9), (0.2, 1.4), (0.9, 0.8), (1.5, 0.1), (-0.3, 0.1), (0.6, -0.1), (-0.9, -0.4), (1.1, -0.5), (0.0, 0.7)]

    def spot(self, i):
        x, y = self.SPOTS[i]
        return self.canopy[0].get_center() + np.array([x, y - 0.5, 0]) * self.s
