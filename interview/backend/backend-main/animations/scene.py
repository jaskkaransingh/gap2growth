
from manim import *

class Scene(Scene):
    def construct(self):

        title = Text("Newton's Second Law").to_edge(UP)

        obj = Circle(color=BLUE)
        label = Text("m").scale(0.5).move_to(obj)

        arrow = Arrow(LEFT, RIGHT).next_to(obj, LEFT)

        formula = MathTex("F = ma").to_edge(DOWN)

        self.play(Write(title))
        self.play(Create(obj), Write(label))
        self.play(Create(arrow))

        self.play(
            obj.animate.shift(RIGHT*2),
            label.animate.shift(RIGHT*2)
        )

        self.play(Write(formula))
        self.wait(2)
