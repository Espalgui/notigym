import os
import uuid as uuid_mod
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.config import settings
from app.database import get_db
from app.models.body import BodyMeasurement, ProgressPhoto
from app.models.user import User
from app.schemas.body import (
    BodyMeasurementCreate,
    BodyMeasurementResponse,
    BodyMeasurementStats,
    ProgressPhotoResponse,
)

router = APIRouter(prefix="/body", tags=["body"])


@router.post("/measurements", response_model=BodyMeasurementResponse, status_code=status.HTTP_201_CREATED)
async def create_measurement(
    data: BodyMeasurementCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    measurement = BodyMeasurement(user_id=current_user.id, **data.model_dump())
    db.add(measurement)
    await db.flush()
    await db.refresh(measurement)
    return measurement


@router.get("/measurements", response_model=list[BodyMeasurementResponse])
async def list_measurements(
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == current_user.id)
        .order_by(BodyMeasurement.measured_at.desc())
    )
    if date_from:
        query = query.where(BodyMeasurement.measured_at >= date_from)
    if date_to:
        query = query.where(BodyMeasurement.measured_at <= date_to)
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/measurements/latest", response_model=BodyMeasurementResponse | None)
async def get_latest_measurement(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == current_user.id)
        .order_by(BodyMeasurement.measured_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


@router.get("/measurements/stats", response_model=BodyMeasurementStats)
async def get_measurement_stats(
    date_from: datetime | None = Query(None),
    date_to: datetime | None = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(BodyMeasurement)
        .where(BodyMeasurement.user_id == current_user.id)
        .order_by(BodyMeasurement.measured_at.asc())
    )
    if date_from:
        query = query.where(BodyMeasurement.measured_at >= date_from)
    if date_to:
        query = query.where(BodyMeasurement.measured_at <= date_to)

    result = await db.execute(query)
    measurements = result.scalars().all()

    if not measurements:
        return BodyMeasurementStats()

    first = measurements[0]
    latest = measurements[-1]
    weight_change = None
    if first.weight_kg is not None and latest.weight_kg is not None:
        weight_change = round(latest.weight_kg - first.weight_kg, 2)

    return BodyMeasurementStats(
        first_measurement=first,
        latest_measurement=latest,
        weight_change_kg=weight_change,
        measurement_count=len(measurements),
    )


@router.delete("/measurements/{measurement_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_measurement(
    measurement_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BodyMeasurement).where(
            BodyMeasurement.id == measurement_id,
            BodyMeasurement.user_id == current_user.id,
        )
    )
    measurement = result.scalar_one_or_none()
    if not measurement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Measurement not found")
    await db.delete(measurement)
    return None


@router.post("/photos", response_model=ProgressPhotoResponse, status_code=status.HTTP_201_CREATED)
async def upload_progress_photo(
    file: UploadFile,
    category: str = Query(..., regex="^(front|side|back)$"),
    measurement_id: uuid_mod.UUID | None = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    if file.content_type not in ("image/jpeg", "image/png", "image/webp"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG, and WebP images allowed")

    contents = await file.read()
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(contents) > max_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"File too large (max {settings.MAX_UPLOAD_SIZE_MB}MB)")

    photo_dir = os.path.join(settings.UPLOAD_DIR, "progress")
    os.makedirs(photo_dir, exist_ok=True)

    ext = file.filename.rsplit(".", 1)[-1] if file.filename and "." in file.filename else "jpg"
    filename = f"{current_user.id}_{uuid_mod.uuid4().hex[:8]}.{ext}"
    filepath = os.path.join(photo_dir, filename)

    with open(filepath, "wb") as f:
        f.write(contents)

    photo = ProgressPhoto(
        user_id=current_user.id,
        measurement_id=measurement_id,
        photo_url=f"/uploads/progress/{filename}",
        category=category,
        taken_at=datetime.now(timezone.utc),
    )
    db.add(photo)
    await db.flush()
    await db.refresh(photo)
    return photo


@router.get("/photos", response_model=list[ProgressPhotoResponse])
async def list_photos(
    category: str | None = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(ProgressPhoto)
        .where(ProgressPhoto.user_id == current_user.id)
        .order_by(ProgressPhoto.taken_at.desc())
    )
    if category:
        query = query.where(ProgressPhoto.category == category)
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_photo(
    photo_id: uuid_mod.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ProgressPhoto).where(
            ProgressPhoto.id == photo_id,
            ProgressPhoto.user_id == current_user.id,
        )
    )
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
    await db.delete(photo)
    return None
