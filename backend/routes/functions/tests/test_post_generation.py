import pytest
from unittest.mock import patch
import json

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "../../.."))

from routes.functions.post_generation import generate_post


@pytest.fixture
def sample_transcript():
    return "Je voulais partager mes réflexions sur l'IA générative dans les entreprises, c'est vraiment en train de changer la façon dont on travaille."


@pytest.fixture
def mock_linkedin_response():
    return json.dumps({
        "title": "L'IA générative transforme les entreprises",
        "content": "L'IA générative redéfinit nos méthodes de travail 🚀\n\nVoici ce que j'observe sur le terrain...\n\n#IA #Innovation #Entreprise"
    })


@pytest.fixture
def mock_twitter_response():
    return json.dumps({
        "title": "Thread : IA générative en entreprise",
        "content": "L'IA générative change TOUT en entreprise 🧵\n\n2/ Voici les 5 changements majeurs que j'observe...\n\n3/ Dernier point : agis maintenant."
    })


@patch("routes.functions.post_generation.call_llm")
def test_generate_linkedin_post(mock_llm, sample_transcript, mock_linkedin_response):
    mock_llm.return_value = mock_linkedin_response

    result = generate_post(sample_transcript, platform="linkedin")

    assert result["platform"] == "linkedin"
    assert "title" in result
    assert "content" in result
    assert len(result["content"]) > 0


@patch("routes.functions.post_generation.call_llm")
def test_generate_twitter_post(mock_llm, sample_transcript, mock_twitter_response):
    mock_llm.return_value = mock_twitter_response

    result = generate_post(sample_transcript, platform="twitter")

    assert result["platform"] == "twitter"
    assert "🧵" in result["content"]


@patch("routes.functions.post_generation.call_llm")
def test_generate_post_passes_provider_and_model(mock_llm, sample_transcript, mock_linkedin_response):
    mock_llm.return_value = mock_linkedin_response

    generate_post(sample_transcript, platform="linkedin", provider="openai", model="gpt-4o")

    call_kwargs = mock_llm.call_args.kwargs
    assert call_kwargs["provider"] == "openai"
    assert call_kwargs["model"] == "gpt-4o"


@patch("routes.functions.post_generation.call_llm")
def test_generate_post_invalid_platform(mock_llm, sample_transcript):
    with pytest.raises(ValueError, match="Platform must be"):
        generate_post(sample_transcript, platform="instagram")


@patch("routes.functions.post_generation.call_llm")
def test_generate_post_invalid_json_raises(mock_llm, sample_transcript):
    mock_llm.return_value = "pas du JSON"

    with pytest.raises(Exception):
        generate_post(sample_transcript, platform="linkedin")


@patch("routes.functions.post_generation.call_llm")
def test_generate_post_strips_whitespace(mock_llm, sample_transcript):
    mock_llm.return_value = json.dumps({
        "title": "  Titre  ",
        "content": "  Contenu  "
    })

    result = generate_post(sample_transcript, platform="linkedin")

    assert result["title"] == "Titre"
    assert result["content"] == "Contenu"
