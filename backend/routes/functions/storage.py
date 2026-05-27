import uuid
from fastapi import UploadFile
from s3 import upload_file, delete_file, generate_presigned_url

AUDIO_PREFIX = "recordings/"

ALLOWED_CONTENT_TYPES = {
    "audio/webm",
    "audio/ogg",
    "audio/mp4",
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
}


async def upload_audio(file: UploadFile) -> dict:
    """Upload audio file to S3. Returns S3 key and presigned URL."""
    content_type = file.content_type or "audio/webm"

    ext = "webm"
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1]

    key = f"{AUDIO_PREFIX}{uuid.uuid4()}.{ext}"

    upload_file(file.file, key, content_type)

    url = generate_presigned_url(key)
    return {"key": key, "url": url}


def get_audio_url(key: str, expiration: int = 3600) -> str:
    """Get fresh presigned URL for an existing audio file."""
    return generate_presigned_url(key, expiration)


def remove_audio(key: str) -> bool:
    """Delete audio file from S3."""
    return delete_file(key)
