from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import Base, engine
from app.limiter import limiter
from app.routers import activity, auth, body, community, exercises, notifications, nutrition, stats, twofa, users, workouts
from app.seed import seed_exercises


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    from app.database import async_session_factory

    async with async_session_factory() as session:
        await seed_exercises(session)

    yield


app = FastAPI(
    title="NotiGym API",
    description="Fitness tracking & community platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS : origines strictes en production, localhost autorisé en dev
_allow_origins = [settings.FRONTEND_URL]
if settings.APP_ENV != "production":
    _allow_origins += ["http://localhost:5173", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(body.router, prefix="/api")
app.include_router(exercises.router, prefix="/api")
app.include_router(workouts.router, prefix="/api")
app.include_router(nutrition.router, prefix="/api")
app.include_router(community.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(activity.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(twofa.router, prefix="/api")

try:
    import os

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception:
    pass


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "NotiGym"}
