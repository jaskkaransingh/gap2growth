from langchain_groq import ChatGroq
from json_utils import extract_json

llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0.5)

def generate_test_questions(topic: str) -> dict:
    """
    Generates 10 MCQ questions on the given topic using Groq.
    Returns: { "questions": [{ "question", "options": ["A..","B..","C..","D.."], "correct_answer": "A.." }] }
    """
    prompt = f"""You are an expert technical interviewer and educator.

Generate exactly 10 multiple-choice quiz questions to test a user's knowledge on: "{topic}".

RULES:
1. Questions must test practical, real-world understanding — not trivia.
2. Each question has exactly 4 options labelled as the full answer text (not "A", "B", etc.).
3. The "correct_answer" field must be the EXACT text of the correct option (copy it verbatim).
4. Vary difficulty: 3 easy, 4 medium, 3 hard questions.
5. Return ONLY raw JSON. No markdown, no explanation, no extra text.

FORMAT:
{{
  "questions": [
    {{
      "question": "What does...",
      "options": ["First option text", "Second option text", "Third option text", "Fourth option text"],
      "correct_answer": "First option text"
    }}
  ]
}}"""

    response = llm.invoke(prompt)
    return extract_json(response.content)
