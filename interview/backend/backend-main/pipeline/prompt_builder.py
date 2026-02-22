# pipeline/prompt_builder.py

def build_prompt(text: str):

    cleaned = text.lower()

    topic = "default"

    if any(k in cleaned for k in [
        "newton", "force", "motion",
        "acceleration", "physics"
    ]):
        topic = "newton"

    elif any(k in cleaned for k in [
        "graph", "plot", "function"
    ]):
        topic = "graph"

    elif any(k in cleaned for k in [
        "geometry", "circle", "triangle"
    ]):
        topic = "geometry"

    return {
        "cleaned_text": cleaned,
        "topic": topic
    }
