import json
from routes.functions.llm import call_llm

SYSTEM_PROMPT = """Tu es un assistant qui transforme des transcriptions vocales en notes de synthèse claires et structurées.
Tu réponds toujours en JSON valide avec exactement ces deux champs : "title" et "text".
Pas de markdown, pas d'explication, uniquement le JSON."""

USER_PROMPT = """Transforme cette transcription vocale en note de synthèse.

Règles :
- "title" : titre court et précis (max 60 caractères)
- "text" : note structurée avec les idées clés, points importants et actions si présentes. Corrige les fautes orales. Garde le sens original.

Transcription :
{transcript}

Réponds uniquement avec ce format JSON :
{{"title": "...", "text": "..."}}"""


def generate_note(
    transcript: str,
    provider: str = "anthropic",
    model: str = None,
) -> dict:
    """
    Generate a synthesis note from a transcript.
    Returns: { title, text }
    """
    raw = call_llm(
        prompt=USER_PROMPT.format(transcript=transcript),
        system=SYSTEM_PROMPT,
        provider=provider,
        model=model,
    )

    result = json.loads(raw)

    return {
        "title": result.get("title", "").strip(),
        "text": result.get("text", "").strip(),
    }
