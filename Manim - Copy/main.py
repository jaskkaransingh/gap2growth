from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import subprocess
import sys
import json
import os
from pydantic import BaseModel
from typing import List, Dict

# ✅ Create FastAPI app FIRST
app = FastAPI()

# ✅ Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Serve video files
app.mount("/media", StaticFiles(directory="media"), name="media")

# 📋 INPUT MODELS
class GrowthInput(BaseModel):
    user_name: str
    skills_before: Dict[str, int]
    skills_after: Dict[str, int]
    achievements: List[str]
    certification_title: str


# 🎬 SKILL POOLS FOR RANDOMIZATION
SKILL_POOL = [
    "React", "Node.js", "Python", "Docker", "Kubernetes", "AWS", "TypeScript",
    "Tailwind CSS", "MongoDB", "PostgreSQL", "CI/CD", "Redis", "GraphQL",
    "Java", "Go", "Rust", "TensorFlow", "PyTorch", "System Design", "Microservices"
]

@app.post("/generate-growth-video")
def generate_growth_video(data: GrowthInput):
    # Save payload for Manim
    payload = data.dict()
    with open("payload.json", "w") as f:
        json.dump(payload, f)

    # Run Manim
    try:
        subprocess.run([
            "manim",
            "scene.py",
            "CareerWrappedScene",
            "-pql", # Low quality for faster rendering and browser compatibility
            "--disable_caching",
            "--flush_cache"
        ], check=True)
    except subprocess.CalledProcessError as e:
        return {"error": "Manim rendering failed", "details": str(e)}

    # Absolute path of video
    rel_path = "media/videos/scene/480p15/CareerWrappedScene.mp4"
    return {
        "status": "success",
        "video_url": f"/{rel_path}"
    }



# 🎬 VIDEO GENERATION ROUTE
@app.post("/generate-video")
def generate_video(data: dict = Body(...)):
    import random
    import traceback

    try:
        ats = data.get("atsScore", 75)
        existing = data.get("existingSkills", [])
        suggested = data.get("suggestedSkills", [])

        # ✅ Shuffling Logic: If inputs are empty, pick randomly
        if not existing:
            existingCount = random.randint(3, 5)
            existing = random.sample(SKILL_POOL, min(existingCount, len(SKILL_POOL)))
        
        if not suggested:
            # Pick skills that aren't in existing
            available = [s for s in SKILL_POOL if s not in existing]
            suggestedCount = random.randint(3, 4)
            suggested = random.sample(available, min(suggestedCount, len(available)))

        payload = {
            "atsScore": ats,
            "existingSkills": existing,
            "suggestedSkills": suggested
        }

        # Ensure media directory exists
        os.makedirs("media", exist_ok=True)

        # Save payload
        with open("payload.json", "w") as f:
            json.dump(payload, f)

        # Run Manim
        # We use -pql (low quality) for speed. Change to -pqh for high quality.
        result = subprocess.run([
            "manim",
            "scene.py",
            "Gap2GrowthScene",
            "-pql",
            "--disable_caching",
            "--flush_cache"
        ], capture_output=True, text=True)

        if result.returncode != 0:
            print(f"Manim Error:\n{result.stderr}")
            return {"error": "Manim rendering failed", "details": result.stderr}

        # Path of video
        # Manim's output structure is media/videos/<module_name>/<quality>/<SceneName>.mp4
        video_rel_path = "media/videos/scene/480p15/Gap2GrowthScene.mp4"
        
        # Verify the file was actually created
        if not os.path.exists(video_rel_path):
            return {"error": "Video file not found after rendering", "path": video_rel_path}

        # Optional: Open file on host (windows only)
        if os.name == 'nt':
            try:
                os.startfile(os.path.abspath(video_rel_path))
            except Exception as e:
                print(f"Could not open file: {e}")

        return {
            "status": "success",
            "video": f"/{video_rel_path}",
            "full_path": os.path.abspath(video_rel_path)
        }

    except Exception as e:
        print(f"Server Error: {traceback.format_exc()}")
        return {"error": "Internal server error", "message": str(e)}