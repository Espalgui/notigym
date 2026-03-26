import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.auth.dependencies import get_current_active_user
from app.database import get_db
from app.models.recipe import Recipe
from app.models.user import User
from app.schemas.recipe import RecipeCreate, RecipeResponse

router = APIRouter(prefix="/recipes", tags=["recipes"])


@router.get("", response_model=list[RecipeResponse])
async def list_recipes(
    meal_type: str | None = Query(None),
    goal: str | None = Query(None),
    tag: str | None = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List all public recipes + current user's own recipes."""
    query = (
        select(Recipe)
        .outerjoin(User, Recipe.created_by == User.id)
        .where(
            or_(
                Recipe.is_public == True,  # noqa: E712
                Recipe.created_by == current_user.id,
            )
        )
    )

    if meal_type:
        query = query.where(Recipe.meal_type == meal_type)
    if goal:
        query = query.where(Recipe.goals.like(f'%"{goal}"%'))
    if tag:
        query = query.where(Recipe.tags.like(f'%"{tag}"%'))

    query = query.order_by(Recipe.is_official.desc(), Recipe.created_at.desc())

    result = await db.execute(query.options(joinedload(Recipe.creator)))
    recipes = result.scalars().unique().all()

    # Get user's favorites
    fav_result = await db.execute(
        text("SELECT recipe_id FROM recipe_favorites WHERE user_id = :uid"),
        {"uid": current_user.id},
    )
    fav_ids = {row[0] for row in fav_result.all()}

    response = []
    for recipe in recipes:
        data = RecipeResponse.model_validate(recipe)
        if recipe.creator:
            data.creator_name = recipe.creator.username
        data.is_favorite = recipe.id in fav_ids
        response.append(data)

    return response


@router.get("/{recipe_id}", response_model=RecipeResponse)
async def get_recipe(
    recipe_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a single recipe by ID."""
    result = await db.execute(
        select(Recipe)
        .where(Recipe.id == recipe_id)
        .options(joinedload(Recipe.creator))
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

    if not recipe.is_public and recipe.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

    data = RecipeResponse.model_validate(recipe)
    if recipe.creator:
        data.creator_name = recipe.creator.username
    return data


@router.post("", response_model=RecipeResponse, status_code=status.HTTP_201_CREATED)
async def create_recipe(
    data: RecipeCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new user recipe (is_official=False)."""
    recipe = Recipe(
        created_by=current_user.id,
        is_official=False,
        **data.model_dump(),
    )
    db.add(recipe)
    await db.flush()
    await db.refresh(recipe)

    resp = RecipeResponse.model_validate(recipe)
    resp.creator_name = current_user.username
    return resp


@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_recipe(
    recipe_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Delete own recipe only (not official ones)."""
    result = await db.execute(
        select(Recipe).where(Recipe.id == recipe_id)
    )
    recipe = result.scalar_one_or_none()

    if not recipe:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Recipe not found")

    if recipe.is_official:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete official recipes")

    if recipe.created_by != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot delete another user's recipe")

    await db.delete(recipe)
    return None


@router.post("/{recipe_id}/favorite")
async def toggle_favorite(
    recipe_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle recipe favorite for current user."""
    result = await db.execute(
        text("SELECT 1 FROM recipe_favorites WHERE user_id = :uid AND recipe_id = :rid"),
        {"uid": current_user.id, "rid": recipe_id},
    )
    exists = result.scalar_one_or_none()
    if exists:
        await db.execute(
            text("DELETE FROM recipe_favorites WHERE user_id = :uid AND recipe_id = :rid"),
            {"uid": current_user.id, "rid": recipe_id},
        )
        return {"is_favorite": False}
    else:
        await db.execute(
            text("INSERT INTO recipe_favorites (user_id, recipe_id) VALUES (:uid, :rid)"),
            {"uid": current_user.id, "rid": recipe_id},
        )
        return {"is_favorite": True}


@router.get("/favorites/list", response_model=list[RecipeResponse])
async def list_favorites(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's favorite recipes."""
    result = await db.execute(
        select(Recipe)
        .join(text("recipe_favorites rf"), text("rf.recipe_id = recipes.id"))
        .where(text("rf.user_id = :uid"))
        .params(uid=current_user.id)
        .options(joinedload(Recipe.creator))
    )
    recipes = result.scalars().unique().all()
    response = []
    for recipe in recipes:
        data = RecipeResponse.model_validate(recipe)
        if recipe.creator:
            data.creator_name = recipe.creator.username
        response.append(data)
    return response
