import os
import anthropic
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

PROVIDERS = {
    "anthropic": {
        "default_model": "claude-opus-4-5",
    },
    "openai": {
        "default_model": "gpt-4o",
        "base_url": None,
        "api_key_env": "OPENAI_API_KEY",
    },
    "openrouter": {
        "default_model": "openai/gpt-4o",
        "base_url": "https://openrouter.ai/api/v1",
        "api_key_env": "OPENROUTER_API_KEY",
    },
    "mistral": {
        "default_model": "mistral-large-latest",
        "base_url": "https://api.mistral.ai/v1",
        "api_key_env": "MISTRAL_API_KEY",
    },
}


def call_llm(
    prompt: str,
    system: str,
    provider: str = "openrouter",
    model: str = None,
    max_tokens: int = 1024,
) -> str:
    """
    Unified LLM call across providers.
    Returns raw text response.
    provider: "anthropic" | "openai" | "openrouter" | "mistral"
    """
    provider = provider.lower()
    if provider not in PROVIDERS:
        raise ValueError(f"Unknown provider '{provider}'. Choose: {list(PROVIDERS.keys())}")

    config = PROVIDERS[provider]
    model = model or config["default_model"]

    if provider == "anthropic":
        client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        message = client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": prompt}],
        )
        return message.content[0].text.strip()

    else:
        api_key = os.getenv(config["api_key_env"])
        client = OpenAI(
            api_key=api_key,
            base_url=config.get("base_url"),
        )
        response = client.chat.completions.create(
            model=model,
            max_tokens=max_tokens,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt},
            ],
        )
        return response.choices[0].message.content.strip()
