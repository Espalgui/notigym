import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    name_fr: Mapped[str] = mapped_column(String(300), nullable=False)
    name_en: Mapped[str] = mapped_column(String(300), nullable=False)
    description_fr: Mapped[str | None] = mapped_column(Text, nullable=True)
    description_en: Mapped[str | None] = mapped_column(Text, nullable=True)
    meal_type: Mapped[str] = mapped_column(String(20), nullable=False)
    calories: Mapped[int] = mapped_column(Integer, nullable=False)
    protein_g: Mapped[float] = mapped_column(Float, nullable=False)
    carbs_g: Mapped[float] = mapped_column(Float, nullable=False)
    fat_g: Mapped[float] = mapped_column(Float, nullable=False)
    prep_time_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    cook_time_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    servings: Mapped[int] = mapped_column(Integer, default=1, server_default="1")
    ingredients_fr: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array
    ingredients_en: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array
    steps_fr: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array
    steps_en: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array
    tags: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_official: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_public: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    goals: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON array
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    creator = relationship("User", backref="recipes")
