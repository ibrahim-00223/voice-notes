from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from tables import Post, Note, Platform, Status
from models.post import PostCreate, PostUpdate, PostResponse
from routes.functions.post_generation import generate_post
from routes.functions.nocodb import send_post as nocodb_send_post

router = APIRouter(prefix="/posts", tags=["posts"])


def _get_status_id(db: Session, name: str) -> int:
    status = db.query(Status).filter(Status.name == name).first()
    if not status:
        raise HTTPException(status_code=500, detail=f"Status '{name}' not found in DB")
    return status.id


def _get_platform_id(db: Session, name: str) -> int:
    platform = db.query(Platform).filter(Platform.name == name).first()
    if not platform:
        raise HTTPException(status_code=404, detail=f"Platform '{name}' not found in DB")
    return platform.id


@router.post("/generate", response_model=PostResponse)
def generate_post_from_note(
    note_id: int,
    platform: str = Query(..., description="linkedin or twitter"),
    provider: str = Query(default="openrouter"),
    model: str = Query(default=None),
    bullet_index: int = Query(default=None, description="Index of the bullet point to generate from (0-based). If omitted, uses full note text."),
    db: Session = Depends(get_db),
):
    """Generate a LinkedIn or Twitter post from a note using AI."""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    if not note.text:
        raise HTTPException(status_code=400, detail="Note has no text to generate from")

    if bullet_index is not None:
        bullets = [b.strip() for b in note.text.split("\n\n") if b.strip()]
        if bullet_index < 0 or bullet_index >= len(bullets):
            raise HTTPException(status_code=400, detail=f"bullet_index {bullet_index} out of range (0–{len(bullets)-1})")
        transcript = bullets[bullet_index]
    else:
        transcript = note.text

    result = generate_post(
        transcript=transcript,
        platform=platform,
        provider=provider,
        model=model,
    )

    post = Post(
        title=result["title"],
        content=result["content"],
        note_id=note_id,
        platform_id=_get_platform_id(db, platform),
        status_id=_get_status_id(db, "draft"),
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.post("/{post_id}/send-to-nocodb")
def send_to_nocodb(post_id: int, db: Session = Depends(get_db)):
    """Send a post to NocoDB and mark it as published."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if not post.content:
        raise HTTPException(status_code=400, detail="Post has no content")

    platform_name = post.platform.name if post.platform else "unknown"
    status_name = post.status.name if post.status else "draft"

    nocodb_record = nocodb_send_post(
        title=post.title or "",
        content=post.content,
        platform=platform_name,
        status=status_name,
        scheduled_at=post.scheduled_at.isoformat() if post.scheduled_at else None,
        published_at=post.published_at.isoformat() if post.published_at else None,
    )

    return {"sent": True, "nocodb_id": nocodb_record.get("Id"), "post_id": post_id}


@router.post("", response_model=PostResponse)
def create_post(data: PostCreate, db: Session = Depends(get_db)):
    note = db.query(Note).filter(Note.id == data.note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    post = Post(**data.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return post


@router.get("", response_model=list[PostResponse])
def list_posts(
    skip: int = 0,
    limit: int = 50,
    platform: str = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Post).order_by(Post.datetime.desc())
    if platform:
        query = query.join(Platform).filter(Platform.name == platform)
    return query.offset(skip).limit(limit).all()


@router.get("/{post_id}", response_model=PostResponse)
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/{post_id}", response_model=PostResponse)
def update_post(post_id: int, data: PostUpdate, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(post, field, value)

    db.commit()
    db.refresh(post)
    return post


@router.delete("/{post_id}")
def delete_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    db.delete(post)
    db.commit()
    return {"deleted": True, "id": post_id}
