import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import UploadFile
import io

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "../../.."))

from routes.functions.storage import upload_audio, get_audio_url, remove_audio


@pytest.fixture
def mock_upload_file():
    file = MagicMock(spec=UploadFile)
    file.filename = "recording.webm"
    file.content_type = "audio/webm"
    file.file = io.BytesIO(b"fake audio content")
    return file


@patch("routes.functions.storage.upload_file")
@patch("routes.functions.storage.generate_presigned_url")
@pytest.mark.asyncio
async def test_upload_audio_returns_key_and_url(mock_presigned, mock_upload, mock_upload_file):
    mock_presigned.return_value = "https://s3.example.com/recordings/abc.webm?token=xxx"

    result = await upload_audio(mock_upload_file)

    assert "key" in result
    assert "url" in result
    assert result["key"].startswith("recordings/")
    assert result["key"].endswith(".webm")
    assert result["url"] == "https://s3.example.com/recordings/abc.webm?token=xxx"
    mock_upload.assert_called_once()
    mock_presigned.assert_called_once()


@patch("routes.functions.storage.upload_file")
@patch("routes.functions.storage.generate_presigned_url")
@pytest.mark.asyncio
async def test_upload_audio_no_filename(mock_presigned, mock_upload):
    file = MagicMock(spec=UploadFile)
    file.filename = None
    file.content_type = "audio/webm"
    file.file = io.BytesIO(b"fake audio content")
    mock_presigned.return_value = "https://s3.example.com/recordings/abc.webm"

    result = await upload_audio(file)

    assert result["key"].endswith(".webm")


@patch("routes.functions.storage.generate_presigned_url")
def test_get_audio_url(mock_presigned):
    mock_presigned.return_value = "https://s3.example.com/recordings/test.webm?token=xxx"

    url = get_audio_url("recordings/test.webm")

    assert url == "https://s3.example.com/recordings/test.webm?token=xxx"
    mock_presigned.assert_called_once_with("recordings/test.webm", 3600)


@patch("routes.functions.storage.delete_file")
def test_remove_audio_success(mock_delete):
    mock_delete.return_value = True

    result = remove_audio("recordings/test.webm")

    assert result is True
    mock_delete.assert_called_once_with("recordings/test.webm")


@patch("routes.functions.storage.delete_file")
def test_remove_audio_failure(mock_delete):
    mock_delete.return_value = False

    result = remove_audio("recordings/nonexistent.webm")

    assert result is False
