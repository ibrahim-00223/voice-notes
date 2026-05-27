import pytest
from unittest.mock import AsyncMock, MagicMock, patch

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "../../.."))

from routes.functions.transcription import transcribe_audio


@pytest.fixture
def fake_audio_bytes():
    return b"fake audio content"


@pytest.fixture
def mock_whisper_response():
    response = MagicMock()
    response.text = "  Bonjour, ceci est un test de transcription.  "
    response.language = "fr"
    response.duration = 12.5
    return response


@patch("routes.functions.transcription.client")
@pytest.mark.asyncio
async def test_transcribe_returns_text(mock_client, fake_audio_bytes, mock_whisper_response):
    mock_client.audio.transcriptions.create = AsyncMock(return_value=mock_whisper_response)

    result = await transcribe_audio(fake_audio_bytes)

    assert result["text"] == "Bonjour, ceci est un test de transcription."
    assert result["language"] == "fr"
    assert result["duration"] == 12.5


@patch("routes.functions.transcription.client")
@pytest.mark.asyncio
async def test_transcribe_strips_whitespace(mock_client, fake_audio_bytes):
    response = MagicMock()
    response.text = "   texte avec espaces   "
    response.language = "fr"
    response.duration = 5.0
    mock_client.audio.transcriptions.create = AsyncMock(return_value=response)

    result = await transcribe_audio(fake_audio_bytes)

    assert result["text"] == "texte avec espaces"


@patch("routes.functions.transcription.client")
@pytest.mark.asyncio
async def test_transcribe_custom_filename(mock_client, fake_audio_bytes, mock_whisper_response):
    mock_client.audio.transcriptions.create = AsyncMock(return_value=mock_whisper_response)

    await transcribe_audio(fake_audio_bytes, filename="recording.mp3")

    call_kwargs = mock_client.audio.transcriptions.create.call_args
    assert call_kwargs.kwargs["file"].name == "recording.mp3"


@patch("routes.functions.transcription.client")
@pytest.mark.asyncio
async def test_transcribe_missing_metadata(mock_client, fake_audio_bytes):
    response = MagicMock(spec=["text"])
    response.text = "texte sans metadata"
    mock_client.audio.transcriptions.create = AsyncMock(return_value=response)

    result = await transcribe_audio(fake_audio_bytes)

    assert result["text"] == "texte sans metadata"
    assert result["language"] is None
    assert result["duration"] is None
