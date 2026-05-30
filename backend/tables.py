from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Platform(Base):
    __tablename__ = "platform"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)

    posts = relationship("Post", back_populates="platform")


class Status(Base):
    __tablename__ = "status"

    id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)

    posts = relationship("Post", back_populates="status")


class Tag(Base):
    __tablename__ = "tag"

    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    color = Column(String(7), default="#6366f1")

    notes = relationship("Note", secondary="note_tags", back_populates="tags")
    posts = relationship("Post", secondary="post_tags", back_populates="tags")


class VoiceRecord(Base):
    __tablename__ = "voice_record"

    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    datetime = Column(DateTime(timezone=True), server_default=func.now())
    duration = Column(Integer)
    audio_file = Column(Text)
    transcript = Column(Text)

    note = relationship("Note", back_populates="voice_record", uselist=False, cascade="all, delete-orphan", passive_deletes=True)


class Note(Base):
    __tablename__ = "note"

    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    datetime = Column(DateTime(timezone=True), server_default=func.now())
    text = Column(Text)
    voice_record_id = Column(Integer, ForeignKey("voice_record.id", ondelete="CASCADE"), nullable=False)

    voice_record = relationship("VoiceRecord", back_populates="note")
    posts = relationship("Post", back_populates="note", cascade="all, delete-orphan", passive_deletes=True)
    tags = relationship("Tag", secondary="note_tags", back_populates="notes")


class Post(Base):
    __tablename__ = "post"

    id = Column(Integer, primary_key=True)
    title = Column(String(255))
    content = Column(Text)
    datetime = Column(DateTime(timezone=True), server_default=func.now())
    scheduled_at = Column(DateTime(timezone=True))
    published_at = Column(DateTime(timezone=True))
    note_id = Column(Integer, ForeignKey("note.id", ondelete="CASCADE"), nullable=False)
    platform_id = Column(Integer, ForeignKey("platform.id"), nullable=False)
    status_id = Column(Integer, ForeignKey("status.id"), nullable=False)

    note = relationship("Note", back_populates="posts")
    platform = relationship("Platform", back_populates="posts")
    status = relationship("Status", back_populates="posts")
    tags = relationship("Tag", secondary="post_tags", back_populates="posts")


class NoteTags(Base):
    __tablename__ = "note_tags"

    note_id = Column(Integer, ForeignKey("note.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tag.id", ondelete="CASCADE"), primary_key=True)


class PostTags(Base):
    __tablename__ = "post_tags"

    post_id = Column(Integer, ForeignKey("post.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tag.id", ondelete="CASCADE"), primary_key=True)
