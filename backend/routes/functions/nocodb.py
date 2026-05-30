import os
import httpx
from dotenv import load_dotenv

load_dotenv()

NOCODB_BASE_URL = os.getenv("NOCODB_BASE_URL", "https://app.nocodb.com")
NOCODB_API_TOKEN = os.getenv("NOCODB_API_TOKEN")
NOCODB_TABLE_ID = os.getenv("NOCODB_TABLE_ID", "m85r6k10go7cmmu")


def _headers() -> dict:
    if not NOCODB_API_TOKEN:
        raise ValueError("NOCODB_API_TOKEN environment variable is not set")
    return {
        "xc-token": NOCODB_API_TOKEN,
        "Content-Type": "application/json",
    }


def send_post(
    title: str,
    content: str,
    platform: str,
    status: str = "draft",
    scheduled_at: str = None,
    published_at: str = None,
) -> dict:
    """
    Create a record in NocoDB posts table.
    Returns the created record.
    """
    payload = {
        "title": title,
        "content": content,
        "platform": platform,
        "status": status,
        "scheduled_at": scheduled_at,
        "published_at": published_at,
    }

    # Remove None values
    payload = {k: v for k, v in payload.items() if v is not None}

    url = f"{NOCODB_BASE_URL}/api/v2/tables/{NOCODB_TABLE_ID}/records"

    response = httpx.post(url, json=payload, headers=_headers())
    response.raise_for_status()

    return response.json()


def update_post_status(record_id: int, status: str, published_at: str = None) -> dict:
    """
    Update status of an existing NocoDB record.
    """
    payload = {"status": status}
    if published_at:
        payload["published_at"] = published_at

    url = f"{NOCODB_BASE_URL}/api/v2/tables/{NOCODB_TABLE_ID}/records"

    response = httpx.patch(url, json={"Id": record_id, **payload}, headers=_headers())
    response.raise_for_status()

    return response.json()
