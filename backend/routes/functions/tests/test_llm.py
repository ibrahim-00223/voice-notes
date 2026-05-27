import pytest
from unittest.mock import MagicMock, patch

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "../../.."))

from routes.functions.llm import call_llm


FAKE_PROMPT = "Dis bonjour"
FAKE_SYSTEM = "Tu es un assistant."


@patch("routes.functions.llm.anthropic.Anthropic")
def test_anthropic_provider(mock_anthropic_class):
    mock_client = MagicMock()
    mock_anthropic_class.return_value = mock_client
    mock_client.messages.create.return_value.content = [MagicMock(text="  Bonjour  ")]

    result = call_llm(FAKE_PROMPT, FAKE_SYSTEM, provider="anthropic", model="claude-opus-4-5")

    assert result == "Bonjour"
    mock_client.messages.create.assert_called_once()


@patch("routes.functions.llm.OpenAI")
def test_openai_provider(mock_openai_class):
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    mock_client.chat.completions.create.return_value.choices = [
        MagicMock(message=MagicMock(content="  Hello  "))
    ]

    result = call_llm(FAKE_PROMPT, FAKE_SYSTEM, provider="openai", model="gpt-4o")

    assert result == "Hello"
    mock_client.chat.completions.create.assert_called_once()


@patch("routes.functions.llm.OpenAI")
def test_openrouter_provider_uses_correct_base_url(mock_openai_class):
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    mock_client.chat.completions.create.return_value.choices = [
        MagicMock(message=MagicMock(content="result"))
    ]

    call_llm(FAKE_PROMPT, FAKE_SYSTEM, provider="openrouter")

    call_kwargs = mock_openai_class.call_args.kwargs
    assert call_kwargs["base_url"] == "https://openrouter.ai/api/v1"


@patch("routes.functions.llm.OpenAI")
def test_mistral_provider_uses_correct_base_url(mock_openai_class):
    mock_client = MagicMock()
    mock_openai_class.return_value = mock_client
    mock_client.chat.completions.create.return_value.choices = [
        MagicMock(message=MagicMock(content="result"))
    ]

    call_llm(FAKE_PROMPT, FAKE_SYSTEM, provider="mistral")

    call_kwargs = mock_openai_class.call_args.kwargs
    assert call_kwargs["base_url"] == "https://api.mistral.ai/v1"


@patch("routes.functions.llm.anthropic.Anthropic")
def test_default_model_used_when_none(mock_anthropic_class):
    mock_client = MagicMock()
    mock_anthropic_class.return_value = mock_client
    mock_client.messages.create.return_value.content = [MagicMock(text="ok")]

    call_llm(FAKE_PROMPT, FAKE_SYSTEM, provider="anthropic", model=None)

    call_kwargs = mock_client.messages.create.call_args.kwargs
    assert call_kwargs["model"] == "claude-opus-4-5"


def test_unknown_provider_raises():
    with pytest.raises(ValueError, match="Unknown provider"):
        call_llm(FAKE_PROMPT, FAKE_SYSTEM, provider="groq")
