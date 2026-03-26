"""Seed official recipes into the database from the static recipes file."""
import json

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.recipe import Recipe


async def seed_recipes(db: AsyncSession) -> None:
    """Seed recipes if the table is empty."""
    result = await db.execute(select(func.count()).select_from(Recipe))
    count = result.scalar() or 0
    if count > 0:
        return

    # Try to load the full seed first, fallback to the simple recipes file
    try:
        from app.recipe_seed import RECIPE_SEED
        recipes_data = RECIPE_SEED
    except ImportError:
        from app.recipes import RECIPES
        recipes_data = RECIPES

    for r in recipes_data:
        tags = r.get("tags", [])
        goals = r.get("goals", [])
        recipe = Recipe(
            name_fr=r["name_fr"],
            name_en=r["name_en"],
            description_fr=r.get("description_fr"),
            description_en=r.get("description_en"),
            meal_type=r["meal_type"],
            calories=r["calories"],
            protein_g=r["protein_g"],
            carbs_g=r["carbs_g"],
            fat_g=r["fat_g"],
            prep_time_min=r.get("prep_time_min"),
            cook_time_min=r.get("cook_time_min"),
            servings=r.get("servings", 1),
            ingredients_fr=r.get("ingredients_fr") if isinstance(r.get("ingredients_fr"), str) else json.dumps(r["ingredients_fr"]) if r.get("ingredients_fr") else None,
            ingredients_en=r.get("ingredients_en") if isinstance(r.get("ingredients_en"), str) else json.dumps(r["ingredients_en"]) if r.get("ingredients_en") else None,
            steps_fr=r.get("steps_fr") if isinstance(r.get("steps_fr"), str) else json.dumps(r["steps_fr"]) if r.get("steps_fr") else None,
            steps_en=r.get("steps_en") if isinstance(r.get("steps_en"), str) else json.dumps(r["steps_en"]) if r.get("steps_en") else None,
            tags=json.dumps(tags) if isinstance(tags, list) else tags,
            goals=json.dumps(goals) if isinstance(goals, list) else goals,
            image_url=r.get("image_url"),
            is_official=r.get("is_official", True),
            is_public=r.get("is_public", True),
        )
        db.add(recipe)

    await db.commit()
