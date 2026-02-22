# pipeline/manim_runner.py

from manim import config
from manim import Scene as ManimScene
import os


def render_video():

    # run manim using CLI command internally
    command = "python -m manim animations/scene.py Scene -pql"

    print("Running:", command)

    os.system(command)

    return "/media/videos/scene/480p15/Scene.mp4"
