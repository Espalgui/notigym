from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.exercise import Exercise
from app.models.recipe import Recipe
from app.models.user import User

router = APIRouter(prefix="/search", tags=["search"])


@router.get("")
async def global_search(
    q: str = Query(..., min_length=1, max_length=100),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    term = f"%{q}%"
    limit = 5

    # Exercises
    ex_result = await db.execute(
        select(Exercise.id, Exercise.name_fr, Exercise.name_en, Exercise.muscle_group)
        .where(or_(Exercise.name_fr.ilike(term), Exercise.name_en.ilike(term)))
        .limit(limit)
    )
    exercises = [
        {"id": str(r.id), "name_fr": r.name_fr, "name_en": r.name_en, "muscle_group": r.muscle_group}
        for r in ex_result.all()
    ]

    # Users (public profiles only, exclude self)
    user_result = await db.execute(
        select(User.id, User.username, User.avatar_url)
        .where(User.username.ilike(term), User.privacy == "public", User.id != current_user.id)
        .limit(limit)
    )
    users = [
        {"id": str(r.id), "username": r.username, "avatar_url": r.avatar_url}
        for r in user_result.all()
    ]

    # Recipes
    recipe_result = await db.execute(
        select(Recipe.id, Recipe.name_fr, Recipe.name_en, Recipe.meal_type, Recipe.calories)
        .where(
            or_(Recipe.name_fr.ilike(term), Recipe.name_en.ilike(term)),
            or_(Recipe.is_public.is_(True), Recipe.created_by == current_user.id),
        )
        .limit(limit)
    )
    recipes = [
        {"id": str(r.id), "name_fr": r.name_fr, "name_en": r.name_en, "meal_type": r.meal_type, "calories": r.calories}
        for r in recipe_result.all()
    ]

    return {"exercises": exercises, "users": users, "recipes": recipes}
