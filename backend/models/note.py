from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class NoteCreate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None
    voice_record_id: int


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    text: Optional[str] = None


class NoteResponse(BaseModel):
    id: int
    title: Optional[str]
    datetime: datetime
    text: Optional[str]
    voice_record_id: int

    class Config:
        from_attributes = True
