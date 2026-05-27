import os
import io
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()


async def transcribe_audio(file_bytes: bytes, filename: str = "audio.webm") -> dict:
    """
    Transcribe audio bytes using OpenAI Whisper.
    Returns: { text, language, duration }
    """
    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    file_obj = io.BytesIO(file_bytes)
    file_obj.name = filename

    response = await client.audio.transcriptions.create(
        model="whisper-1",
        file=file_obj,
        response_format="verbose_json",
    )

    return {
        "text": response.text.strip(),
        "language": getattr(response, "language", None),
        "duration": getattr(response, "duration", None),
    }
