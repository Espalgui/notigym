-- Add image_url to workout_programs
ALTER TABLE workout_programs ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
