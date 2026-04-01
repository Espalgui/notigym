import logging
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(name)s - %(message)s")
logging.getLogger("app").setLevel(logging.INFO)

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import Base, engine
from app.limiter import limiter
from app.routers import achievements, activity, admin, auth, body, community, exercises, notes, notifications, nutrition, planning, recipes, search, stats, strava, timers, twofa, users, workouts
from app.seed import seed_exercises
from app.seed_recipes import seed_recipes
from app.seed_users import seed_user_data
from app.seed_achievements import seed_achievements


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    from app.database import async_session_factory

    async with async_session_factory() as session:
        await seed_exercises(session)
        await seed_recipes(session)
        await seed_user_data(session)
        await seed_achievements(session)

    yield


app = FastAPI(
    title="NotiGym API",
    description="Fitness tracking & community platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    if settings.APP_ENV == "production":
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})
    raise exc

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
app.include_router(admin.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(body.router, prefix="/api")
app.include_router(exercises.router, prefix="/api")
app.include_router(workouts.router, prefix="/api")
app.include_router(nutrition.router, prefix="/api")
app.include_router(recipes.router, prefix="/api")
app.include_router(community.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(activity.router, prefix="/api")
app.include_router(stats.router, prefix="/api")
app.include_router(timers.router, prefix="/api")
app.include_router(strava.router, prefix="/api")
app.include_router(twofa.router, prefix="/api")
app.include_router(notes.router, prefix="/api")
app.include_router(planning.router, prefix="/api")
app.include_router(achievements.router, prefix="/api")
app.include_router(search.router, prefix="/api")

try:
    import os

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception:
    pass


@app.get("/api/health")
async def health():
    return {"status": "ok", "app": "NotiGym"}
