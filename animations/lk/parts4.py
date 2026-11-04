"""More Grade 3 pictures: egg boxes, a ruler and pencil, a kitchen scale, a jerrycan, a clock,
a simple bar chart, a number line with any labels."""
import numpy as np
from manim import (DOWN, LEFT, ORIGIN, RIGHT, UP, Arc, Circle, Dot, Ellipse, Line, Polygon, Rectangle,
                   RoundedRectangle, Text, VGroup)

from .style import ADEY, BERRY, FIELD, FONT_ETH, FONT_LATIN, INK, LAKE, MUTED, SURFACE, num


class Egg(Ellipse):
    def __init__(self, s=0.3, **kw):
        super().__init__(width=s * 0.8, height=s, fill_color="#fbf3e4", fill_opacity=1, stroke_color="#c9b48c",
                         stroke_width=2, **kw)


class EggBox(VGroup):
    """A box of six eggs (two rows of three)."""

    def __init__(self, s=0.32, **kw):
        super().__init__(**kw)
        self.eggs = VGroup(*[Egg(s) for _ in range(6)]).arrange_in_grid(rows=2, buff=0.07)
        self.box = RoundedRectangle(width=self.eggs.width + 0.24, height=self.eggs.height + 0.2, corner_radius=0.08,
                                    fill_color="#c79a6b", fill_opacity=1, stroke_color="#7a4f1d", stroke_width=2).move_to(self.eggs)
        self.add(self.box, self.eggs)


class Ruler(VGroup):
    """A ruler 0…n cm; .x(k) gives the position of k cm."""

    def __init__(self, n=15, unit=0.42, **kw):
        super().__init__(**kw)
        self.n, self.unit = n, unit
        self.body = Rectangle(width=n * unit + 0.4, height=0.7, fill_color="#fbe7a6", fill_opacity=1, stroke_color="#8a6a00",
                              stroke_width=2)
        self.zero = self.body.get_left() + RIGHT * 0.2 + UP * 0.35
        ticks, labels = VGroup(), VGroup()
        for k in range(n + 1):
            p = self.zero + RIGHT * unit * k
            ticks.add(Line(p, p + DOWN * (0.28 if k % 5 == 0 else 0.16), stroke_color=INK, stroke_width=2))
            labels.add(Text(str(k), font=FONT_LATIN, font_size=16, color=INK).move_to(p + DOWN * 0.48))
        self.ticks, self.labels = ticks, labels
        self.add(self.body, ticks, labels)

    def x(self, k):
        # read from the tick itself, so it stays right after the ruler is moved or scaled
        return self.ticks[k].get_start()


class Pencil(VGroup):
    def __init__(self, length=5.0, h=0.28, **kw):
        super().__init__(**kw)
        body = Rectangle(width=length - 0.5, height=h, fill_color=ADEY, fill_opacity=1, stroke_color="#8a6a00", stroke_width=1.5)
        eraser = Rectangle(width=0.3, height=h, fill_color="#e58f74", fill_opacity=1, stroke_width=0).align_to(body, LEFT)
        tip = Polygon(body.get_corner(UP + RIGHT), body.get_corner(DOWN + RIGHT), body.get_right() + RIGHT * 0.5,
                      fill_color="#e9c99a", fill_opacity=1, stroke_color="#8a6a00", stroke_width=1.5)
        self.add(body, eraser, tip)


class Scale(VGroup):
    """A kitchen scale with a dial 0…max kg; .needle_to(kg) gives the needle's end point."""

    def __init__(self, max_kg=10, r=0.75, **kw):
        super().__init__(**kw)
        self.max, self.r = max_kg, r
        base = RoundedRectangle(width=2.4, height=2.0, corner_radius=0.25, fill_color="#d9eef2", fill_opacity=1,
                                stroke_color=INK, stroke_width=3)
        self.pan = RoundedRectangle(width=2.0, height=0.25, corner_radius=0.08, fill_color="#c9d3d8", fill_opacity=1,
                                    stroke_color=INK, stroke_width=2).next_to(base, UP, buff=0.12)
        self.dial = Circle(radius=r, fill_color=SURFACE, fill_opacity=1, stroke_color=INK, stroke_width=2).move_to(base).shift(DOWN * 0.1)
        c = self.dial.get_center()
        marks = VGroup()
        for k in range(max_kg + 1):
            a = self.angle(k)
            d = np.array([np.sin(a), np.cos(a), 0])
            marks.add(Line(c + d * r * 0.8, c + d * r * 0.97, stroke_color=INK, stroke_width=2))
            if k % 2 == 0:
                marks.add(Text(str(k), font=FONT_LATIN, font_size=14, color=INK).move_to(c + d * r * 0.6))
        unit = Text("kg", font=FONT_LATIN, font_size=14, color=MUTED).move_to(c + DOWN * r * 0.45)
        self.needle = Line(c, c + np.array([np.sin(self.angle(0)), np.cos(self.angle(0)), 0]) * r * 0.85,
                           stroke_color=BERRY, stroke_width=5)
        self.add(base, self.pan, self.dial, marks, unit, self.needle)

    @property
    def c(self):
        return self.dial.get_center()

    def angle(self, kg):
        return np.radians(-120 + 240 * kg / self.max)


class Jerrycan(VGroup):
    """A yellow jerrycan with litre marks; .water(l) is the water filled to l litres."""

    def __init__(self, litres=5, h=2.4, w=1.7, **kw):
        super().__init__(**kw)
        self.litres, self.h = litres, h
        self.body = RoundedRectangle(width=w, height=h, corner_radius=0.18, fill_color="#fff4c8", fill_opacity=1,
                                     stroke_color="#c28f00", stroke_width=4)
        cap = RoundedRectangle(width=0.4, height=0.3, corner_radius=0.06, fill_color="#c28f00", fill_opacity=1,
                               stroke_width=0).next_to(self.body, UP, buff=0).shift(RIGHT * w * 0.28)
        handle = RoundedRectangle(width=0.7, height=0.26, corner_radius=0.12, stroke_color="#c28f00", stroke_width=5,
                                  fill_opacity=0).next_to(self.body, UP, buff=-0.05).shift(LEFT * w * 0.15)
        marks = VGroup()
        for k in range(1, litres + 1):
            y = self.body.get_bottom()[1] + h * k / (litres + 0.3)
            marks.add(Line([self.body.get_right()[0] - 0.3, y, 0], [self.body.get_right()[0], y, 0], stroke_color=INK, stroke_width=2),
                      Text(f"{k}L", font=FONT_LATIN, font_size=14, color=INK).move_to([self.body.get_right()[0] + 0.3, y, 0]))
        self.marks = marks
        self.add(handle, cap, self.body, marks)

    def water(self, l):
        hh = self.h * l / (self.litres + 0.3)
        return Rectangle(width=self.body.width - 0.12, height=hh, fill_color="#7cc3d6", fill_opacity=0.85, stroke_width=0) \
            .align_to(self.body, DOWN).shift(UP * 0.06).set_x(self.body.get_x())


class Clock(VGroup):
    """A clock face; .hour and .minute hands point at 12 (rotate them about .c)."""

    def __init__(self, r=1.8, **kw):
        super().__init__(**kw)
        self.r = r
        self.face = Circle(radius=r, fill_color=SURFACE, fill_opacity=1, stroke_color=INK, stroke_width=6)
        ticks, nums = VGroup(), VGroup()
        for k in range(60):
            a = np.radians(90 - 6 * k)
            d = np.array([np.cos(a), np.sin(a), 0])
            ticks.add(Line(d * r * (0.9 if k % 5 else 0.84), d * r * 0.97, stroke_color=MUTED, stroke_width=4 if k % 5 == 0 else 1.5))
        for k in range(1, 13):
            a = np.radians(90 - 30 * k)
            nums.add(Text(str(k), font=FONT_LATIN, font_size=int(30 * r / 1.8), color=INK, weight="BOLD")
                     .move_to(np.array([np.cos(a), np.sin(a), 0]) * r * 0.72))
        self.nums = nums
        self.hour = Line(ORIGIN, UP * r * 0.5, stroke_color=INK, stroke_width=12)
        self.minute = Line(ORIGIN, UP * r * 0.82, stroke_color=BERRY, stroke_width=8)
        pin = Dot(radius=0.09, color=INK)
        self.add(self.face, ticks, nums, self.hour, self.minute, pin)

    @property
    def c(self):
        return self.face.get_center()

    def set_time(self, h, m):
        """Point the hands (call before the clock is shown)."""
        from manim import PI
        self.hour.rotate(-((h % 12) + m / 60) * PI / 6, about_point=self.c)
        self.minute.rotate(-m * PI / 30, about_point=self.c)
        return self


class Axis(VGroup):
    """A number line from a to b with ticks every `step` and labels on chosen values."""

    def __init__(self, a, b, step, width=11.0, labels=None, size=22, **kw):
        super().__init__(**kw)
        self.a, self.b, self.length = a, b, width   # (not .width: that is the group's own size)
        self.line = Line(LEFT * width / 2, RIGHT * width / 2, stroke_color=INK, stroke_width=4)
        ticks, labs = VGroup(), VGroup()
        v = a
        while v <= b + 1e-9:
            p = self.point(v)
            big = labels is None or v in labels
            ticks.add(Line(p + UP * (0.18 if big else 0.1), p + DOWN * (0.18 if big else 0.1), stroke_color=INK, stroke_width=3))
            if labels is None or v in labels:
                txt = labels[v] if isinstance(labels, dict) else (str(int(v)) if float(v).is_integer() else str(v))
                labs.add(Text(txt, font=FONT_LATIN, font_size=size, color=MUTED).move_to(p + DOWN * 0.45))
            v += step
        self.ticks, self.labels = ticks, labs
        self.add(self.line, ticks, labs)

    def point(self, v):
        return self.line.get_start() + RIGHT * self.length * (v - self.a) / (self.b - self.a)


class Bars(VGroup):
    """Empty bar-chart axes for `names` with a scale 0…top; .slot(i, k) is where box k of bar i goes."""

    def __init__(self, names, top=8, unit=0.42, bw=1.2, gap=0.7, **kw):
        super().__init__(**kw)
        self.unit, self.bw, self.gap, self.n = unit, bw, gap, len(names)
        w = len(names) * (bw + gap) + 0.3
        self.origin = np.array([0.0, 0.0, 0.0])
        self.x_axis = Line(ORIGIN, RIGHT * w, stroke_color=INK, stroke_width=4)
        self.y_axis = Line(ORIGIN, UP * unit * top, stroke_color=INK, stroke_width=4)
        grid, labs = VGroup(), VGroup()
        for k in range(1, top + 1):
            grid.add(Line(UP * unit * k, UP * unit * k + RIGHT * w, stroke_color="#d3dcdb", stroke_width=1.5))
            labs.add(Text(str(k), font=FONT_LATIN, font_size=16, color=MUTED).move_to(UP * unit * k + LEFT * 0.25))
        self.names = VGroup(*[Text(nm, font=FONT_ETH, font_size=26, color=INK).move_to(RIGHT * (0.3 + i * (bw + gap) + bw / 2) + DOWN * 0.35)
                              for i, nm in enumerate(names)])
        self.grid = grid
        self.add(grid, self.x_axis, self.y_axis, labs, self.names)

    def slot(self, i, k):
        return self.x_axis.get_start() + RIGHT * (0.3 + i * (self.bw + self.gap) + self.bw / 2) + UP * self.unit * (k + 0.5)

    def box(self, i, color):
        return RoundedRectangle(width=self.bw, height=self.unit * 0.92, corner_radius=0.05, fill_color=color, fill_opacity=1,
                                stroke_color=INK, stroke_width=1)
