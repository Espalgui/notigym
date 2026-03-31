CREATE TABLE IF NOT EXISTS scheduled_workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
    program_day_id UUID REFERENCES program_days(id) ON DELETE CASCADE,
    weekday SMALLINT,
    is_rest_day BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_workouts_user_id ON scheduled_workouts(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_sched_user_weekday ON scheduled_workouts(user_id, weekday) WHERE weekday IS NOT NULL;
