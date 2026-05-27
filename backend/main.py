from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

import os
from database import Base, engine
from routes.voice_record import router as voice_record_router
from routes.note import router as note_router
from routes.post import router as post_router
from routes.tag import router as tag_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Voice Notes API", version="1.0.0")

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(voice_record_router, prefix="/api")
app.include_router(note_router, prefix="/api")
app.include_router(post_router, prefix="/api")
app.include_router(tag_router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
