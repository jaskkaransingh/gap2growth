from document_content_service import get_document_chunks
from langchain_groq import ChatGroq
from json_utils import extract_json
from typing import Dict

llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.2
)


def compress_syllabus(text: str) -> str:
    prompt = f"""
You are extracting syllabus structure.

From the text below, keep ONLY:
- Module names
- Unit titles
- Topic lists

Remove:
- Descriptions
- Assessment rules
- Repetitions

Return clean bullet-style text.

Text:
{text}
"""
    return llm.invoke(prompt).content.strip()


def generate_roadmap(user_input: str, document_id: str | dict | None = None) -> dict:
    # Normalize document_id
    if isinstance(document_id, dict):
        document_id = document_id.get("document_id")

    if document_id is not None and not isinstance(document_id, str):
        raise TypeError("document_id must be a string UUID")

    context = user_input

    if document_id:
        chunks = get_document_chunks(document_id, k=15)
        raw_context = "\n".join(chunks)
        syllabus_context = compress_syllabus(raw_context)
        if user_input:
            context = f"{syllabus_context}\nAdditional input: {user_input}"
        else:
            context = syllabus_context


    if not context.strip():
        raise ValueError("User input or document_id required")

    prompt = f"""
You are an expert curriculum designer and STEM educator.

Your task is to create a structured 1-MONTH LEARNING ROADMAP (4 weeks) 
based on the provided subject or document context.

The roadmap MUST be formatted as a chronological checklist of conceptual checkpoints,
designed so a student can tick off boxes as they progress day by day or concept by concept.

──────────
CORE RULES
──────────
1. Academic correctness is mandatory. Use standard terminology.
2. Structure exactly into 4 "weeks".
3. Each week must have a "focus" (a string summarizing the week's goal).
4. Each week must contain a list of 4-7 actionable "checkpoints".
5. Each checkpoint must have a "title", a brief "description", and resource links. DO NOT use double quotes inside any text values (use single quotes instead to avoid JSON parsing errors).
6. Provide exactly AT LEAST 2 "youtube_links" and AT LEAST 2 "doc_links" per checkpoint. These should be real or highly plausible search/resource URLs.
7. The entire output must be STRICT JSON ONLY. Do NOT use markdown code blocks (e.g. no ```json). Return ONLY the raw JSON object. Ensure no trailing commas.

──────────
OUTPUT SCHEMA
──────────
{{
  "title": "<Main Subject Title>",
  "weeks": [
    {{
      "week_number": 1,
      "focus": "Week 1 Goal/Topic",
      "checkpoints": [
        {{
          "id": "w1-1",
          "title": "Checkpoint 1 Title",
          "description": "Actionable description of what to learn or do.",
          "youtube_links": [
            {{"title": "Video title 1", "url": "https://youtube.com/..."}},
            {{"title": "Video title 2", "url": "https://youtube.com/..."}}
          ],
          "doc_links": [
            {{"title": "Doc title 1", "url": "https://..."}},
            {{"title": "Doc title 2", "url": "https://..."}}
          ]
        }},
        ...
      ]
    }},
    ... // Must have exactly weeks 1-4
  ]
}}

──────────
INPUT CONTENT
──────────
{context}

Return ONLY the JSON.
"""

    response = llm.invoke(prompt.strip())
    roadmap = extract_json(response.content)

    if "title" not in roadmap or "weeks" not in roadmap:
        raise ValueError("Invalid roadmap schema returned by LLM")

    # The backend now returns the raw JSON checkpoint list instead of nodes/edges
    return roadmap