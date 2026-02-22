from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv

import os

# Load environment variables from .env file and override stale uvicorn cache
load_dotenv(override=True)

# We import the generate_roadmap function from your roadmap_service file
from roadmap_service import generate_roadmap
from project_service import generate_project_ideas, generate_project_boilerplate
from test_service import generate_test_questions

app = FastAPI(
    title="Roadmap Generator API",
    description="API to generate a learning roadmap using Groq and Nomic embeddings",
    version="1.0.0"
)

# Enable CORS for the frontend origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the request body structure
class RoadmapRequest(BaseModel):
    user_input: str
    document_id: Optional[str] = None

class ProjectIdeaRequest(BaseModel):
    skills_context: str

class ProjectBoilerplateRequest(BaseModel):
    project_idea: Dict[str, Any]

class TestRequest(BaseModel):
    topic: str

@app.post("/generate-roadmap", response_model=Dict[str, Any])
async def create_roadmap(request: RoadmapRequest):
    """
    Endpoint to generate a learning roadmap.
    It takes user_input (the topic or extra context) and an optional document_id (if a document has been uploaded/embedded).
    """
    try:
        # Call the core roadmap generation logic
        roadmap_data = generate_roadmap(
            user_input=request.user_input, 
            document_id=request.document_id
        )
        return roadmap_data
    except Exception as e:
        # Catch and return any errors (like missing API keys or processing errors)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Roadmap Generator API is running! Use the /generate-roadmap endpoint."}

@app.post("/api/project-ideas")
async def get_project_ideas(request: ProjectIdeaRequest):
    try:
        data = generate_project_ideas(request.skills_context)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/project-boilerplate")
async def get_project_boilerplate(request: ProjectBoilerplateRequest):
    try:
        data = generate_project_boilerplate(request.project_idea)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/generate-test")
async def get_test_questions(request: TestRequest):
    try:
        data = generate_test_questions(request.topic)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    # Start the server on port 8000
    uvicorn.run(app, host="127.0.0.1", port=8000)
