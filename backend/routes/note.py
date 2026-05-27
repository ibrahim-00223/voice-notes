from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from tables import Note, VoiceRecord
from models.note import NoteCreate, NoteUpdate, NoteResponse
from routes.functions.note_generation import generate_note

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("/", response_model=NoteResponse)
def create_note(data: NoteCreate, db: Session = Depends(get_db)):
    """Create a note manually from a voice record."""
    record = db.query(VoiceRecord).filter(VoiceRecord.id == data.voice_record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Voice record not found")

    note = Note(**data.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.post("/generate", response_model=NoteResponse)
def generate_note_from_record(
    voice_record_id: int,
    provider: str = Query(default="anthropic"),
    model: str = Query(default=None),
    db: Session = Depends(get_db),
):
    """Generate a synthesis note from a voice record transcript using AI."""
    record = db.query(VoiceRecord).filter(VoiceRecord.id == voice_record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Voice record not found")

    if not record.title:
        raise HTTPException(status_code=400, detail="Voice record has no transcript")

    result = generate_note(
        transcript=record.title,
        provider=provider,
        model=model,
    )

    note = Note(
        title=result["title"],
        text=result["text"],
        voice_record_id=voice_record_id,
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/", response_model=list[NoteResponse])
def list_notes(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return db.query(Note).order_by(Note.datetime.desc()).offset(skip).limit(limit).all()


@router.get("/{note_id}", response_model=NoteResponse)
def get_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteResponse)
def update_note(note_id: int, data: NoteUpdate, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(note, field, value)

    db.commit()
    db.refresh(note)
    return note


@router.delete("/{note_id}")
def delete_note(note_id: int, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return {"deleted": True, "id": note_id}
