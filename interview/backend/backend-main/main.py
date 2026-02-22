# main.py

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles

# import pipeline functions
from pipeline.prompt_builder import build_prompt
from pipeline.ai_codegen import generate_manim_code
from pipeline.manim_runner import render_video


# -------- FASTAPI APP --------
app = FastAPI()


# -------- SERVE VIDEO FILES --------
# This allows browser access to videos
app.mount("/media", StaticFiles(directory="media"), name="media")


# -------- REQUEST MODEL --------
class LessonRequest(BaseModel):
    text: str


# -------- MAIN GENERATE ENDPOINT --------
@app.post("/generate")
def generate_video(data: LessonRequest):

    print("Received prompt:", data.text)

    # STEP 1 — Build prompt structure
    prompt_data = build_prompt(data.text)

    # STEP 2 — Generate scene.py based on prompt
    generate_manim_code(prompt_data)

    # STEP 3 — Render video using Manim
    render_video()

    # STEP 4 — Return video URL
    return {
        "video_url":
        "http://localhost:8000/media/videos/scene/480p15/Scene.mp4",
        "topic_detected": prompt_data["topic"]
    }
