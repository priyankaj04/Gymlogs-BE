CREATE TABLE IF NOT EXISTS exercises (
    -- Primary Key
    id TEXT PRIMARY KEY NOT NULL,
    
    -- Core Exercise Information
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    
    -- Exercise Categories
    body_part TEXT NOT NULL CHECK (
        body_part IN (
            'chest', 'back', 'shoulders', 'biceps', 'triceps', 
            'legs', 'glutes', 'core', 'calves', 'forearms', 'full-body'
        )
    ),
    exercise_type TEXT NOT NULL CHECK (
        exercise_type IN ('cardio', 'compound', 'isolated', 'mobility')
    ),
    difficulty TEXT CHECK (
        difficulty IN ('beginner', 'intermediate', 'advanced')
    ),
    
    -- Additional Information (Optional)
    equipment TEXT, -- JSON array of equipment strings
    
    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Indexes for performance
    CONSTRAINT unique_exercise_name UNIQUE (name)
);

CREATE INDEX IF NOT EXISTS idx_exercises_body_part ON exercises(body_part);
CREATE INDEX IF NOT EXISTS idx_exercises_type ON exercises(exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_created_at ON exercises(created_at);
CREATE INDEX IF NOT EXISTS idx_exercises_updated_at ON exercises(updated_at);

-- Create a composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_exercises_body_part_type ON exercises(body_part, exercise_type);
CREATE INDEX IF NOT EXISTS idx_exercises_type_difficulty ON exercises(exercise_type, difficulty);

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Trigger to automatically update updated_at timestamp
DROP TRIGGER IF EXISTS on_exercises_updated ON public.exercises;

-- Create the new trigger
CREATE TRIGGER on_exercises_updated
  BEFORE UPDATE ON public.exercises
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_updated_at();


-- Insert sample data based on mock exercises from the app
INSERT INTO exercises (
    id, name, body_part, exercise_type, description, difficulty, equipment, created_at, updated_at
) VALUES 
(
    '1',
    'Bench Press',
    'chest',
    'compound',
    'A compound exercise that primarily targets the chest, shoulders, and triceps.',
    'intermediate',
    '["barbell", "bench"]',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '2',
    'Pull-ups',
    'back',
    'compound',
    'A bodyweight exercise that targets the back muscles and biceps.',
    'intermediate',
    '["pull-up bar"]',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
),
(
    '3',
    'Running',
    'full-body',
    'cardio',
    'Cardiovascular exercise for endurance and fat burning.',
    'beginner',
    '["treadmill"]',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
