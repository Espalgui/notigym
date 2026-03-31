-- Add weekly sessions goal to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS weekly_sessions_goal INTEGER;
