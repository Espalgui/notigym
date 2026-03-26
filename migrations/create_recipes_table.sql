CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    name_fr VARCHAR(300) NOT NULL,
    name_en VARCHAR(300) NOT NULL,
    description_fr TEXT,
    description_en TEXT,
    meal_type VARCHAR(20) NOT NULL,
    calories INTEGER NOT NULL,
    protein_g FLOAT NOT NULL,
    carbs_g FLOAT NOT NULL,
    fat_g FLOAT NOT NULL,
    prep_time_min INTEGER,
    cook_time_min INTEGER,
    servings INTEGER NOT NULL DEFAULT 1,
    ingredients_fr TEXT,
    ingredients_en TEXT,
    steps_fr TEXT,
    steps_en TEXT,
    tags TEXT,
    image_url VARCHAR(500),
    is_official BOOLEAN NOT NULL DEFAULT false,
    is_public BOOLEAN NOT NULL DEFAULT true,
    goals TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_recipes_meal_type ON recipes(meal_type);
CREATE INDEX IF NOT EXISTS idx_recipes_created_by ON recipes(created_by);
