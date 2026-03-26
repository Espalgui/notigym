import uuid as uuid_mod
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.note import UserNote
from app.models.user import User
from app.schemas.note import NoteCreate, NoteResponse

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_or_update_note(
    data: NoteCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserNote).where(UserNote.user_id == current_user.id, UserNote.date == data.date)
    )
    existing = result.scalar_one_or_none()

    if existing:
        existing.title = data.title
        existing.content = data.content
        await db.flush()
        await db.refresh(existing)
        return existing

    note = UserNote(user_id=current_user.id, date=data.date, title=data.title, content=data.content)
    db.add(note)
    await db.flush()
    await db.refresh(note)
    return note


@router.get("", response_model=list[NoteResponse])
async def list_notes(
    date_from: date | None = Query(None),
    date_to: date | None = Query(None),
    limit: int = Query(30, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(UserNote).where(UserNote.user_id == current_user.id)
    if date_from:
        query = query.where(UserNote.date >= date_from)
    if date_to:
        query = query.where(UserNote.date <= date_to)
    query = query.order_by(UserNote.date.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/{note_date}", response_model=NoteResponse | None)
async def get_note_by_date(
    note_date: date,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserNote).where(UserNote.user_id == current_user.id, UserNote.date == note_date)
    )
    return result.scalar_one_or_none()


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(UserNote).where(UserNote.id == note_id, UserNote.user_id == current_user.id)
    )
    note = result.scalar_one_or_none()
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await db.delete(note)
