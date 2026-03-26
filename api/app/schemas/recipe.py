import uuid
from datetime import datetime
from pydantic import BaseModel


class RecipeCreate(BaseModel):
    name_fr: str
    name_en: str
    description_fr: str | None = None
    description_en: str | None = None
    meal_type: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    prep_time_min: int | None = None
    cook_time_min: int | None = None
    servings: int = 1
    ingredients_fr: str | None = None  # JSON string
    ingredients_en: str | None = None
    steps_fr: str | None = None  # JSON string
    steps_en: str | None = None
    tags: str | None = None  # JSON string
    image_url: str | None = None
    goals: str | None = None  # JSON string


class RecipeResponse(BaseModel):
    id: uuid.UUID
    created_by: uuid.UUID | None = None
    creator_name: str | None = None
    name_fr: str
    name_en: str
    description_fr: str | None = None
    description_en: str | None = None
    meal_type: str
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    prep_time_min: int | None = None
    cook_time_min: int | None = None
    servings: int
    ingredients_fr: str | None = None
    ingredients_en: str | None = None
    steps_fr: str | None = None
    steps_en: str | None = None
    tags: str | None = None
    image_url: str | None = None
    is_official: bool
    is_public: bool
    is_favorite: bool = False
    goals: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
