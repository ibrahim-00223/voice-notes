from pydantic import BaseModel
from typing import Optional


class TagCreate(BaseModel):
    name: str
    color: Optional[str] = "#6366f1"


class TagUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None


class TagResponse(BaseModel):
    id: int
    name: str
    color: Optional[str]

    class Config:
        from_attributes = True
