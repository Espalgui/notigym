import uuid
from datetime import date, datetime

from pydantic import BaseModel


class NutritionGoalCreate(BaseModel):
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    water_goal_ml: int = 2000


class NutritionGoalResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    calories: int
    protein_g: float
    carbs_g: float
    fat_g: float
    water_goal_ml: int = 2000
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class NutritionEntryCreate(BaseModel):
    date: date
    meal_type: str
    food_name: str
    calories: int | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    quantity: float | None = None
    unit: str | None = None
    notes: str | None = None


class NutritionEntryUpdate(BaseModel):
    meal_type: str | None = None
    food_name: str | None = None
    calories: int | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    quantity: float | None = None
    unit: str | None = None
    notes: str | None = None


class NutritionEntryResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    meal_type: str
    food_name: str
    calories: int | None = None
    protein_g: float | None = None
    carbs_g: float | None = None
    fat_g: float | None = None
    quantity: float | None = None
    unit: str | None = None
    notes: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class DailyNutritionSummary(BaseModel):
    date: date
    total_calories: int = 0
    total_protein_g: float = 0.0
    total_carbs_g: float = 0.0
    total_fat_g: float = 0.0
    goal: NutritionGoalResponse | None = None
    calories_remaining: int | None = None
    protein_remaining_g: float | None = None
    carbs_remaining_g: float | None = None
    fat_remaining_g: float | None = None
    entries: list[NutritionEntryResponse] = []


class WaterIntakeCreate(BaseModel):
    date: date
    amount_ml: int


class WaterIntakeResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    date: date
    amount_ml: int
    created_at: datetime

    model_config = {"from_attributes": True}


class DailyWaterSummary(BaseModel):
    date: date
    total_ml: int = 0
    goal_ml: int = 2000
    entries: list[WaterIntakeResponse] = []
