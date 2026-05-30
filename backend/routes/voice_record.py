from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from tables import VoiceRecord
from models.voice_record import VoiceRecordResponse
from routes.functions.storage import upload_audio, remove_audio, get_audio_url
from routes.functions.transcription import transcribe_audio

router = APIRouter(prefix="/voice-records", tags=["voice-records"])


@router.post("", response_model=VoiceRecordResponse)
async def create_voice_record(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """Upload audio → S3 → transcribe → save voice record + note."""
    file_bytes = await file.read()

    # Reset pointer — file.read() exhausts the stream, upload needs it from start
    await file.seek(0)

    # Upload to S3
    s3_result = await upload_audio(file)

    # Transcribe
    transcription = await transcribe_audio(file_bytes, filename=file.filename or "audio.webm")

    # Save voice record
    full_text = transcription["text"] or ""
    record = VoiceRecord(
        title=full_text[:60] if full_text else None,
        transcript=full_text or None,
        duration=int(transcription["duration"]) if transcription["duration"] else None,
        audio_file=s3_result["key"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return record


@router.get("", response_model=list[VoiceRecordResponse])
def list_voice_records(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
):
    return db.query(VoiceRecord).order_by(VoiceRecord.datetime.desc()).offset(skip).limit(limit).all()


@router.get("/{record_id}", response_model=VoiceRecordResponse)
def get_voice_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(VoiceRecord).filter(VoiceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Voice record not found")
    return record


@router.get("/{record_id}/audio-url")
def get_voice_record_audio_url(record_id: int, db: Session = Depends(get_db)):
    """Generate a fresh presigned URL for the audio file (24h expiry)."""
    record = db.query(VoiceRecord).filter(VoiceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Voice record not found")
    if not record.audio_file:
        raise HTTPException(status_code=404, detail="No audio file for this record")
    url = get_audio_url(record.audio_file, expiration=86400)
    if not url:
        raise HTTPException(status_code=500, detail="Failed to generate audio URL")
    return {"url": url}


@router.delete("/{record_id}")
def delete_voice_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(VoiceRecord).filter(VoiceRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Voice record not found")

    if record.audio_file:
        remove_audio(record.audio_file)

    db.delete(record)
    db.commit()
    return {"deleted": True, "id": record_id}
