# Growth Video Generator: Usage & Setup

## Example JSON Payload
`POST /generate-growth-video`
```json
{
  "user_name": "Arjun Sharma",
  "skills_before": {
    "Python": 4,
    "FastAPI": 2,
    "React": 5,
    "Docker": 1
  },
  "skills_after": {
    "Python": 9,
    "FastAPI": 8,
    "React": 7,
    "Docker": 6
  },
  "achievements": [
    "Built Scalable Microservices",
    "Optimized LLM Inference",
    "Open Source Contributor"
  ],
  "certification_title": "Senior AI Engineer"
}
```


## Gap2Growth Video Payload
`POST /generate-video`
```json
{
  "atsScore": 85,
  "existingSkills": ["Python", "SQL", "Git"],
  "suggestedSkills": ["Docker", "Kubernetes", "AWS"]
}
```

---

## Installation Steps

### 1. Install Everything via Terminal (Recommended)
Run this single command in your PowerShell/Terminal to install FFmpeg and MiKTeX automatically:
```powershell
winget install -e --id Gyan.FFmpeg --accept-package-agreements; winget install -e --id MiKTeX.MiKTeX --accept-package-agreements
```
*Note: You may need to restart your terminal after this completes.*

### 2. Install Python Dependencies
```bash
pip install manim fastapi uvicorn pydantic
```

### 4. Run the Server
```bash
uvicorn main:app --reload
```
The API will be available at `http://localhost:8000`.
You can test it via Postman or the built-in docs at `http://localhost:8000/docs`.
