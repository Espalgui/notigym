import uuid
from datetime import date, datetime, timezone

from sqlalchemy import Boolean, Date, DateTime, Float, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    height_cm: Mapped[float | None] = mapped_column(Float, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    goal: Mapped[str | None] = mapped_column(String(20), nullable=True)
    training_type: Mapped[str | None] = mapped_column(String(20), nullable=True)
    privacy: Mapped[str] = mapped_column(String(20), default="private", server_default="private")
    language: Mapped[str] = mapped_column(String(5), default="fr", server_default="fr")
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    notif_program_enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    notif_community_enabled: Mapped[bool] = mapped_column(Boolean, default=True, server_default="true")
    totp_secret: Mapped[str | None] = mapped_column(String(64), nullable=True)
    is_2fa_enabled: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    backup_codes: Mapped[str | None] = mapped_column(Text, nullable=True)
    weekly_sessions_goal: Mapped[int | None] = mapped_column(Integer, nullable=True)
    strava_athlete_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    strava_access_token: Mapped[str | None] = mapped_column(String(200), nullable=True)
    strava_refresh_token: Mapped[str | None] = mapped_column(String(200), nullable=True)
    strava_token_expires_at: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    body_measurements = relationship("BodyMeasurement", back_populates="user", cascade="all, delete-orphan")
    progress_photos = relationship("ProgressPhoto", back_populates="user", cascade="all, delete-orphan")
    workout_programs = relationship("WorkoutProgram", back_populates="user", cascade="all, delete-orphan")
    workout_sessions = relationship("WorkoutSession", back_populates="user", cascade="all, delete-orphan")
    personal_records = relationship("PersonalRecord", back_populates="user", cascade="all, delete-orphan")
    nutrition_goals = relationship("NutritionGoal", back_populates="user", cascade="all, delete-orphan")
    nutrition_entries = relationship("NutritionEntry", back_populates="user", cascade="all, delete-orphan")
    water_intakes = relationship("WaterIntake", back_populates="user", cascade="all, delete-orphan")
    community_posts = relationship("CommunityPost", back_populates="user", cascade="all, delete-orphan")
    post_likes = relationship("PostLike", back_populates="user", cascade="all, delete-orphan")
    post_comments = relationship("PostComment", back_populates="user", cascade="all, delete-orphan")
    custom_exercises = relationship("Exercise", back_populates="creator", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    daily_activities = relationship("DailyActivity", back_populates="user", cascade="all, delete-orphan")
    timer_presets = relationship("TimerPreset", back_populates="user", cascade="all, delete-orphan")