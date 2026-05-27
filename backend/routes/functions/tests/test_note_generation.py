import pytest
from unittest.mock import MagicMock, patch
import json

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "../../.."))

from routes.functions.note_generation import generate_note


@pytest.fixture
def sample_transcript():
    return "Alors voilà je voulais parler de mon idée de startup dans l'IA, on pourrait faire un outil qui transcrit les réunions et génère des résumés automatiquement, ça serait vraiment utile pour les équipes."


@pytest.fixture
def mock_claude_response():
    response = MagicMock()
    response.content = [MagicMock()]
    response.content[0].text = json.dumps({
        "title": "Idée startup : outil de transcription et résumé de réunions IA",
        "text": "Développer un outil basé sur l'IA permettant de transcrire automatiquement les réunions et d'en générer des résumés. Cible : équipes ayant besoin de gagner du temps sur la prise de notes."
    })
    return response


@patch("routes.functions.note_generation.client")
def test_generate_note_returns_title_and_text(mock_client, sample_transcript, mock_claude_response):
    mock_client.messages.create.return_value = mock_claude_response

    result = generate_note(sample_transcript)

    assert "title" in result
    assert "text" in result
    assert len(result["title"]) > 0
    assert len(result["text"]) > 0


@patch("routes.functions.note_generation.client")
def test_generate_note_strips_whitespace(mock_client, sample_transcript):
    response = MagicMock()
    response.content = [MagicMock()]
    response.content[0].text = json.dumps({
        "title": "  Titre avec espaces  ",
        "text": "  Texte avec espaces  "
    })
    mock_client.messages.create.return_value = response

    result = generate_note(sample_transcript)

    assert result["title"] == "Titre avec espaces"
    assert result["text"] == "Texte avec espaces"


@patch("routes.functions.note_generation.client")
def test_generate_note_calls_claude_with_transcript(mock_client, sample_transcript, mock_claude_response):
    mock_client.messages.create.return_value = mock_claude_response

    generate_note(sample_transcript)

    call_kwargs = mock_client.messages.create.call_args.kwargs
    assert sample_transcript in call_kwargs["messages"][0]["content"]


@patch("routes.functions.note_generation.client")
def test_generate_note_invalid_json_raises(mock_client, sample_transcript):
    response = MagicMock()
    response.content = [MagicMock()]
    response.content[0].text = "réponse invalide pas du JSON"
    mock_client.messages.create.return_value = response

    with pytest.raises(Exception):
        generate_note(sample_transcript)
