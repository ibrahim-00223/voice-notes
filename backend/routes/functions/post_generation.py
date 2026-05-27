import json
from routes.functions.llm import call_llm

SYSTEM_PROMPT = """Tu es un expert en création de contenu pour les réseaux sociaux professionnels.
Tu crées des posts engageants, authentiques et à forte valeur ajoutée.
Tu réponds toujours en JSON valide avec exactement ces deux champs : "title" et "content".
Pas de markdown autour du JSON, uniquement le JSON brut."""

LINKEDIN_PROMPT = """Crée un post LinkedIn percutant à partir de cette transcription vocale.

Règles :
- "title" : titre interne court pour identifier le post (max 60 caractères)
- "content" : post LinkedIn complet avec :
  • Hook fort sur la 1ère ligne (donne envie de lire la suite)
  • Développement structuré avec sauts de ligne
  • 3 à 5 emojis max, bien placés
  • Call to action en fin de post
  • 3 à 5 hashtags pertinents en dernière ligne
  • 150 à 250 mots

Transcription :
{transcript}

Réponds uniquement avec ce format JSON :
{{"title": "...", "content": "..."}}"""

TWITTER_PROMPT = """Crée un thread X (Twitter) percutant à partir de cette transcription vocale.

Règles :
- "title" : titre interne court pour identifier le thread (max 60 caractères)
- "content" : thread complet avec :
  • Tweet 1 : hook irrésistible + "🧵" à la fin (max 280 caractères)
  • Tweets 2 à 6 : une idée clé par tweet, numérotés (2/, 3/, etc.)
  • Dernier tweet : synthèse + call to action
  • Chaque tweet séparé par une ligne vide
  • Valeur concrète à chaque tweet

Transcription :
{transcript}

Réponds uniquement avec ce format JSON :
{{"title": "...", "content": "..."}}"""

PROMPTS = {
    "linkedin": LINKEDIN_PROMPT,
    "twitter": TWITTER_PROMPT,
}


def generate_post(
    transcript: str,
    platform: str,
    provider: str = "anthropic",
    model: str = None,
) -> dict:
    """
    Generate a LinkedIn or Twitter/X post from a transcript.
    platform: "linkedin" | "twitter"
    provider: "anthropic" | "openai" | "openrouter" | "mistral"
    Returns: { title, content, platform }
    """
    platform = platform.lower()
    if platform not in PROMPTS:
        raise ValueError(f"Platform must be 'linkedin' or 'twitter', got: '{platform}'")

    raw = call_llm(
        prompt=PROMPTS[platform].format(transcript=transcript),
        system=SYSTEM_PROMPT,
        provider=provider,
        model=model,
    )

    result = json.loads(raw)

    return {
        "title": result.get("title", "").strip(),
        "content": result.get("content", "").strip(),
        "platform": platform,
    }
