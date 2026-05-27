from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class VoiceRecordCreate(BaseModel):
    title: Optional[str] = None
    duration: Optional[int] = None
    audio_file: Optional[str] = None


class VoiceRecordResponse(BaseModel):
    id: int
    title: Optional[str]
    datetime: datetime
    duration: Optional[int]
    audio_file: Optional[str]

    class Config:
        from_attributes = True
