from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PostCreate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    note_id: int
    platform_id: int
    status_id: int
    scheduled_at: Optional[datetime] = None


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    platform_id: Optional[int] = None
    status_id: Optional[int] = None
    scheduled_at: Optional[datetime] = None
    published_at: Optional[datetime] = None


class PostResponse(BaseModel):
    id: int
    title: Optional[str]
    content: Optional[str]
    datetime: datetime
    scheduled_at: Optional[datetime]
    published_at: Optional[datetime]
    note_id: int
    platform_id: int
    status_id: int

    class Config:
        from_attributes = True
