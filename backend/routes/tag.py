from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from tables import Tag, NoteTags, PostTags
from models.tag import TagCreate, TagUpdate, TagResponse

router = APIRouter(prefix="/tags", tags=["tags"])


@router.post("", response_model=TagResponse)
def create_tag(data: TagCreate, db: Session = Depends(get_db)):
    existing = db.query(Tag).filter(Tag.name == data.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Tag already exists")

    tag = Tag(**data.model_dump())
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.get("", response_model=list[TagResponse])
def list_tags(db: Session = Depends(get_db)):
    return db.query(Tag).order_by(Tag.name).all()


@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(tag_id: int, data: TagUpdate, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(tag, field, value)

    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/{tag_id}")
def delete_tag(tag_id: int, db: Session = Depends(get_db)):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    db.delete(tag)
    db.commit()
    return {"deleted": True, "id": tag_id}


@router.post("/notes/{note_id}/tags/{tag_id}")
def add_tag_to_note(note_id: int, tag_id: int, db: Session = Depends(get_db)):
    existing = db.query(NoteTags).filter(
        NoteTags.note_id == note_id,
        NoteTags.tag_id == tag_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Tag already on this note")

    db.add(NoteTags(note_id=note_id, tag_id=tag_id))
    db.commit()
    return {"added": True, "note_id": note_id, "tag_id": tag_id}


@router.delete("/notes/{note_id}/tags/{tag_id}")
def remove_tag_from_note(note_id: int, tag_id: int, db: Session = Depends(get_db)):
    entry = db.query(NoteTags).filter(
        NoteTags.note_id == note_id,
        NoteTags.tag_id == tag_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Tag not on this note")

    db.delete(entry)
    db.commit()
    return {"removed": True, "note_id": note_id, "tag_id": tag_id}


@router.post("/posts/{post_id}/tags/{tag_id}")
def add_tag_to_post(post_id: int, tag_id: int, db: Session = Depends(get_db)):
    existing = db.query(PostTags).filter(
        PostTags.post_id == post_id,
        PostTags.tag_id == tag_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Tag already on this post")

    db.add(PostTags(post_id=post_id, tag_id=tag_id))
    db.commit()
    return {"added": True, "post_id": post_id, "tag_id": tag_id}


@router.delete("/posts/{post_id}/tags/{tag_id}")
def remove_tag_from_post(post_id: int, tag_id: int, db: Session = Depends(get_db)):
    entry = db.query(PostTags).filter(
        PostTags.post_id == post_id,
        PostTags.tag_id == tag_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Tag not on this post")

    db.delete(entry)
    db.commit()
    return {"removed": True, "post_id": post_id, "tag_id": tag_id}
