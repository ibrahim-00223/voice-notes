import pytest
from unittest.mock import MagicMock, patch

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), "../../.."))

from routes.functions.nocodb import send_post, update_post_status


@pytest.fixture
def mock_success_response():
    response = MagicMock()
    response.json.return_value = {"Id": 1, "title": "Test post", "status": "draft"}
    response.raise_for_status = MagicMock()
    return response


@patch("routes.functions.nocodb.httpx.post")
def test_send_post_success(mock_post, mock_success_response):
    mock_post.return_value = mock_success_response

    result = send_post(
        title="Test post",
        content="Contenu du post",
        platform="linkedin",
    )

    assert result["Id"] == 1
    mock_post.assert_called_once()


@patch("routes.functions.nocodb.httpx.post")
def test_send_post_payload_correct(mock_post, mock_success_response):
    mock_post.return_value = mock_success_response

    send_post(
        title="Mon titre",
        content="Mon contenu",
        platform="twitter",
        status="scheduled",
        scheduled_at="2026-06-01T10:00:00",
    )

    call_kwargs = mock_post.call_args.kwargs
    payload = call_kwargs["json"]
    assert payload["title"] == "Mon titre"
    assert payload["platform"] == "twitter"
    assert payload["status"] == "scheduled"
    assert payload["scheduled_at"] == "2026-06-01T10:00:00"


@patch("routes.functions.nocodb.httpx.post")
def test_send_post_removes_none_values(mock_post, mock_success_response):
    mock_post.return_value = mock_success_response

    send_post(title="Titre", content="Contenu", platform="linkedin")

    call_kwargs = mock_post.call_args.kwargs
    payload = call_kwargs["json"]
    assert "scheduled_at" not in payload
    assert "published_at" not in payload


@patch("routes.functions.nocodb.httpx.post")
def test_send_post_uses_correct_url(mock_post, mock_success_response):
    mock_post.return_value = mock_success_response

    send_post(title="Titre", content="Contenu", platform="linkedin")

    call_args = mock_post.call_args.args
    assert "m85r6k10go7cmmu" in call_args[0]
    assert "/api/v2/tables/" in call_args[0]


@patch("routes.functions.nocodb.httpx.post")
def test_send_post_http_error_raises(mock_post):
    mock_response = MagicMock()
    mock_response.raise_for_status.side_effect = Exception("HTTP 401 Unauthorized")
    mock_post.return_value = mock_response

    with pytest.raises(Exception, match="401"):
        send_post(title="Titre", content="Contenu", platform="linkedin")


@patch("routes.functions.nocodb.httpx.patch")
def test_update_post_status(mock_patch):
    mock_response = MagicMock()
    mock_response.json.return_value = {"Id": 5, "status": "published"}
    mock_response.raise_for_status = MagicMock()
    mock_patch.return_value = mock_response

    result = update_post_status(record_id=5, status="published", published_at="2026-05-27T12:00:00")

    assert result["status"] == "published"
    call_kwargs = mock_patch.call_args.kwargs
    assert call_kwargs["json"]["Id"] == 5
    assert call_kwargs["json"]["status"] == "published"
    assert call_kwargs["json"]["published_at"] == "2026-05-27T12:00:00"
