from langchain_groq import ChatGroq
from json_utils import extract_json
import os

# Initialize Groq LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.7 # Higher temperature for ideation
)

def generate_project_ideas(skills_context: str) -> dict:
    """
    Generates 3-5 project ideas based on the user's skills.
    Returns a strict JSON list of project concepts.
    """
    if not skills_context.strip():
        skills_context = "General Software Engineering"

    prompt = f"""
You are an expert Senior Developer and Career Mentor.
The user has the following skills:
{skills_context}

Create 4 exciting, modern, and resume-worthy project ideas that heavily utilize these specific skills. 
The projects should range from beginner-friendly to advanced.

RULES:
1. Return EXACTLY a JSON object with a "projects" array.
2. Each project must have an "id" (string), "title" (string), "difficulty" (string: Beginner, Intermediate, or Advanced), "description" (2-3 sentences), and an array of "tech_stack" (strings).
3. Do NOT use markdown blocks or conversational text. Return ONLY raw JSON.

FORMAT:
{{
  "projects": [
    {{
      "id": "proj-1",
      "title": "...",
      "difficulty": "...",
      "description": "...",
      "tech_stack": ["...", "..."]
    }}
  ]
}}
"""
    
    response = llm.invoke(prompt)
    return extract_json(response.content)


def generate_project_boilerplate(project_idea: dict) -> dict:
    """
    Generates a structured file tree and boilerplate code for a specific project idea.
    """
    title = project_idea.get("title", "Project")
    tech_stack = ", ".join(project_idea.get("tech_stack", []))
    desc = project_idea.get("description", "")
    
    prompt = f"""
You are an expert Software Architect CLI tool.
The user wants to start a project called "{title}".
Tech Stack constraints: {tech_stack}
Project Description: {desc}

Generate a complete, minimal but functional boilerplate file structure for this application.
Provide structural folders and the essential starting entry files (e.g. package.json, main.py, index.js, vite.config.ts, README.md depending on the stack).
Write the ACTUAL starter code for these files.

RULES:
1. Return EXACTLY a JSON array of objects representing the file tree. 
2. Use this exact schema for every item in the array:
    - "type": "file" or "folder"
    - "name": string (the folder or file name)
    - "content": string (the full code content if it's a file, or empty string if it's a folder)
    - "children": array (an array of these exact same objects if it's a folder. If it's a file, leave it empty or exclude it.)
3. Do NOT use markdown blocks. Return ONLY raw JSON. Do not escape newlines artificially unless inside JSON strings.
4. Keep the boilerplate realistic but minimal (max 6-8 core files).

EXAMPLE FORMAT:
[
  {{
    "type": "folder",
    "name": "src",
    "children": [
      {{
        "type": "file",
        "name": "index.js",
        "content": "console.log('Hello World');"
      }}
    ]
  }},
  {{
    "type": "file",
    "name": "README.md",
    "content": "# Project Start"
  }}
]
"""

    llm_coder = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1)
    response = llm_coder.invoke(prompt)
    
    files_json = extract_json(response.content)
    
    # We wrap it in an object for easier frontend parsing later
    return {"fileTree": files_json}
