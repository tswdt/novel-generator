from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from database import get_db
from models import User, Novel, Chapter, NovelStatus
from routes.auth import get_current_user
from ai_service import ai_service
import json

router = APIRouter(prefix="/novels", tags=["小说"])

class NovelCreate(BaseModel):
    title: str
    description: str
    genre: str
    total_chapters: int = 20

class NovelResponse(BaseModel):
    id: int
    title: str
    description: str
    genre: str
    status: str
    total_chapters: int
    generated_chapters: int
    word_count: int
    created_at: str
    
    class Config:
        from_attributes = True

class ChapterResponse(BaseModel):
    id: int
    chapter_number: int
    title: str
    content: Optional[str]
    word_count: int
    created_at: str
    
    class Config:
        from_attributes = True

@router.post("/create", response_model=NovelResponse)
async def create_novel(
    novel: NovelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_novel = Novel(
        user_id=current_user.id,
        title=novel.title,
        description=novel.description,
        genre=novel.genre,
        total_chapters=novel.total_chapters,
        status=NovelStatus.GENERATING
    )
    db.add(db_novel)
    db.commit()
    db.refresh(db_novel)
    
    return db_novel

@router.post("/{novel_id}/generate-outline")
async def generate_novel_outline(
    novel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    novel = db.query(Novel).filter(
        Novel.id == novel_id,
        Novel.user_id == current_user.id
    ).first()
    
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    result = await ai_service.generate_novel_outline(
        novel.title,
        novel.description,
        novel.genre
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=f"生成失败: {result['error']}")
    
    outline = result["data"]
    
    return {"success": True, "outline": outline}

@router.post("/{novel_id}/generate-chapter/{chapter_number}")
async def generate_chapter(
    novel_id: int,
    chapter_number: int,
    chapter_outline: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    novel = db.query(Novel).filter(
        Novel.id == novel_id,
        Novel.user_id == current_user.id
    ).first()
    
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    existing_chapter = db.query(Chapter).filter(
        Chapter.novel_id == novel_id,
        Chapter.chapter_number == chapter_number
    ).first()
    
    if existing_chapter:
        raise HTTPException(status_code=400, detail="章节已存在")
    
    novel_context = f"书名: {novel.title}\n简介: {novel.description}\n题材: {novel.genre}"
    
    result = await ai_service.generate_chapter(
        novel_context,
        chapter_outline,
        chapter_number
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=f"生成失败: {result['error']}")
    
    chapter_content = result["data"]
    word_count = len(chapter_content)
    
    db_chapter = Chapter(
        novel_id=novel_id,
        chapter_number=chapter_number,
        title=f"第{chapter_number}章",
        content=chapter_content,
        word_count=word_count
    )
    db.add(db_chapter)
    
    novel.generated_chapters += 1
    novel.word_count += word_count
    
    db.commit()
    db.refresh(db_chapter)
    
    return {"success": True, "chapter": db_chapter}

@router.get("/", response_model=List[NovelResponse])
async def get_novels(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    novels = db.query(Novel).filter(Novel.user_id == current_user.id).all()
    return novels

@router.get("/{novel_id}", response_model=NovelResponse)
async def get_novel(
    novel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    novel = db.query(Novel).filter(
        Novel.id == novel_id,
        Novel.user_id == current_user.id
    ).first()
    
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    return novel

@router.get("/{novel_id}/chapters", response_model=List[ChapterResponse])
async def get_chapters(
    novel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    novel = db.query(Novel).filter(
        Novel.id == novel_id,
        Novel.user_id == current_user.id
    ).first()
    
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    chapters = db.query(Chapter).filter(Chapter.novel_id == novel_id).order_by(Chapter.chapter_number).all()
    return chapters

@router.get("/{novel_id}/chapters/{chapter_number}", response_model=ChapterResponse)
async def get_chapter(
    novel_id: int,
    chapter_number: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    novel = db.query(Novel).filter(
        Novel.id == novel_id,
        Novel.user_id == current_user.id
    ).first()
    
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    chapter = db.query(Chapter).filter(
        Chapter.novel_id == novel_id,
        Chapter.chapter_number == chapter_number
    ).first()
    
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    
    return chapter

@router.delete("/{novel_id}")
async def delete_novel(
    novel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    novel = db.query(Novel).filter(
        Novel.id == novel_id,
        Novel.user_id == current_user.id
    ).first()
    
    if not novel:
        raise HTTPException(status_code=404, detail="小说不存在")
    
    db.delete(novel)
    db.commit()
    
    return {"success": True, "message": "删除成功"}
