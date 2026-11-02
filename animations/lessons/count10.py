"""Lesson 1 — የአትክልት ቦታ ቆጠራ (Counting in the garden).
Big idea: touch each thing once; the last number said tells how many."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from manim import (DOWN, LEFT, RIGHT, UP, AnimationGroup, Circumscribe, FadeIn, FadeOut,
                   GrowFromEdge, Indicate, LaggedStart, ReplacementTransform, Succession,
                   Transform, VGroup, Write, smooth)

from lk import (ADEY, BERRY, FIELD, LAKE, LessonScene, Flower, TenFrame, am, badge,
                caption_bar, en, ground, lesson, num, say, title_card, data)

L = lesson("count10")
WORDS = data()["numWords"]


class Count10(LessonScene):
    def construct(self):
        # 1 · title
        card = title_card(L)
        self.play(FadeIn(card, shift=UP * 0.3), run_time=0.8)
        say(self, "lesson.count10.title", fallback=1.8)
        self.play(FadeOut(card, shift=UP * 0.3), run_time=0.5)

        # 2 · story: Grandma's garden grows
        soil = ground(y=-1.25)
        flowers = VGroup(*[Flower(size=0.95) for _ in range(6)]).arrange(RIGHT, buff=0.75)
        flowers.move_to(UP * 0.35)
        story = caption_bar(L["story"]["am"], L["story"]["en"], am_size=30, en_size=20)
        self.play(FadeIn(soil), FadeIn(story), run_time=0.6)
        self.play(LaggedStart(*[GrowFromEdge(f, DOWN) for f in flowers], lag_ratio=0.18), run_time=2)
        say(self, "lesson.count10.story", fallback=4.5)
        self.play(FadeOut(story), run_time=0.4)

        # 3 · count each flower once: badge + digit + Amharic number word
        frame = TenFrame(cell=0.62).to_corner(UP + RIGHT, buff=0.45)
        self.play(FadeIn(frame, shift=LEFT * 0.2), run_time=0.5)
        word = None
        badges = VGroup()
        for k, f in enumerate(flowers, start=1):
            b = badge(k, color=LAKE).next_to(f.head, UP, buff=0.12)
            dot = frame.counter(k - 1, color=BERRY).scale(0.01).move_to(f.head)
            new_word = VGroup(num(k, size=64, color=LAKE), am(WORDS["am"][k], size=46),
                              en(WORDS["en"][k], size=24)).arrange(RIGHT, buff=0.35).to_edge(DOWN, buff=0.7)
            anims = [FadeIn(b, scale=1.6), Indicate(f.head, color=ADEY, scale_factor=1.25)]
            anims.append(ReplacementTransform(word, new_word) if word else FadeIn(new_word, shift=UP * 0.2))
            # she says the number just as its badge pops up
            talk = say(self, f"num.{k}", fallback=0.55, gap=0, wait=False, offset=0.15)
            self.play(*anims, run_time=0.45)
            self.add(dot)
            self.play(dot.animate.scale(100).move_to(frame.slot(k - 1)), run_time=0.45, rate_func=smooth)
            badges.add(b)
            word = new_word
            self.wait(max(0.15 + talk - 0.9, 0) + 0.15)

        # 4 · the last number tells how many
        six = VGroup(num(6, size=110, color=BERRY), am(WORDS["am"][6], size=44, color=BERRY)) \
            .arrange(RIGHT, buff=0.3).to_corner(UP + LEFT, buff=0.6)
        self.play(Circumscribe(badges[-1], color=BERRY, fade_out=True), run_time=0.9)
        self.play(FadeOut(word), ReplacementTransform(badges[-1].copy(), six), run_time=0.9)

        recap = caption_bar(L["example"]["am"], L["example"]["en"], am_size=28, en_size=19, max_chars=44)
        self.play(FadeIn(recap, shift=UP * 0.15), run_time=0.5)
        say(self, "lesson.count10.example", fallback=6.5)

        # 5 · close: flowers line up with the counters
        self.play(Indicate(frame, color=FIELD, scale_factor=1.08), run_time=0.8)
        self.play(FadeOut(VGroup(recap, badges, flowers, soil, frame, six)), run_time=0.8)
        self.wait(0.3)
