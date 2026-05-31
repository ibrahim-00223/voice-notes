import json
from routes.functions.llm import call_llm

SYSTEM_PROMPT = """Tu es un assistant qui transforme des transcriptions vocales en notes structurées par sujets.
Tu réponds toujours en JSON valide avec exactement ces deux champs : "title" et "text".
Pas de markdown, pas d'explication, uniquement le JSON."""

USER_PROMPT = """Transforme cette transcription vocale en liste de sujets sous forme de bullet points.

Règles :
- "title" : titre court et précis résumant le thème global (max 60 caractères)
- "text" : liste de bullet points, un par sujet distinct abordé dans l'audio.
  Chaque bullet doit :
  • Commencer par "• "
  • Identifier clairement le sujet en début de bullet (ex: "• Sujet X : ...")
  • Développer l'idée en 2 à 4 phrases concrètes et autonomes
  • Être suffisamment riche pour servir de base à un post LinkedIn ou Twitter
  • Corriger les fautes orales, garder le sens original
  Séparer chaque bullet par une ligne vide.

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
    Generate a bullet-point note (one bullet per topic) from a transcript.
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
