-- Workout Plan SQL Schema
-- Run this in your Supabase SQL editor to set up the workout plan tables

-- Workout Plans table
CREATE TABLE workout_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  muscle_types TEXT[] NOT NULL, -- Array of muscle types/body parts
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER, -- Duration in minutes
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false, -- Whether the plan is publicly available
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Workout Plan Exercises table (junction table with additional data)
CREATE TABLE workout_plan_exercises (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
  exercise_id TEXT REFERENCES exercises(id) ON DELETE CASCADE,
  sets INTEGER NOT NULL CHECK (sets > 0),
  reps INTEGER NOT NULL CHECK (reps > 0),
  weight DECIMAL(10,2), -- Optional weight suggestion
  rest_time INTEGER, -- Rest time in seconds
  notes TEXT, -- Exercise-specific notes
  order_index INTEGER NOT NULL DEFAULT 1, -- Order of exercise in the plan
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique combination of workout_plan_id and exercise_id
  UNIQUE(workout_plan_id, exercise_id)
);

-- Create indexes for better performance
CREATE INDEX idx_workout_plans_created_by ON workout_plans(created_by);
CREATE INDEX idx_workout_plans_muscle_types ON workout_plans USING GIN(muscle_types);
CREATE INDEX idx_workout_plans_difficulty ON workout_plans(difficulty_level);
CREATE INDEX idx_workout_plans_public ON workout_plans(is_public);
CREATE INDEX idx_workout_plans_created_at ON workout_plans(created_at DESC);

CREATE INDEX idx_workout_plan_exercises_plan_id ON workout_plan_exercises(workout_plan_id);
CREATE INDEX idx_workout_plan_exercises_exercise_id ON workout_plan_exercises(exercise_id);
CREATE INDEX idx_workout_plan_exercises_order ON workout_plan_exercises(workout_plan_id, order_index);

-- Enable Row Level Security (RLS)
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plan_exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for workout_plans table
-- Users can view their own plans and public plans
CREATE POLICY "Users can view own and public workout plans" ON workout_plans
    FOR SELECT USING (created_by = auth.uid() OR is_public = true);

-- Users can insert their own plans
CREATE POLICY "Users can create workout plans" ON workout_plans
    FOR INSERT WITH CHECK (created_by = auth.uid());

-- Users can update their own plans
CREATE POLICY "Users can update own workout plans" ON workout_plans
    FOR UPDATE USING (created_by = auth.uid());

-- Users can delete their own plans
CREATE POLICY "Users can delete own workout plans" ON workout_plans
    FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for workout_plan_exercises table
-- Users can view exercises from plans they own or public plans
CREATE POLICY "Users can view workout plan exercises" ON workout_plan_exercises
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM workout_plans 
            WHERE workout_plans.id = workout_plan_exercises.workout_plan_id 
            AND (workout_plans.created_by = auth.uid() OR workout_plans.is_public = true)
        )
    );

-- Users can insert exercises to their own plans
CREATE POLICY "Users can add exercises to own workout plans" ON workout_plan_exercises
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_plans 
            WHERE workout_plans.id = workout_plan_exercises.workout_plan_id 
            AND workout_plans.created_by = auth.uid()
        )
    );

-- Users can update exercises in their own plans
CREATE POLICY "Users can update exercises in own workout plans" ON workout_plan_exercises
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM workout_plans 
            WHERE workout_plans.id = workout_plan_exercises.workout_plan_id 
            AND workout_plans.created_by = auth.uid()
        )
    );

-- Users can delete exercises from their own plans
CREATE POLICY "Users can delete exercises from own workout plans" ON workout_plan_exercises
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM workout_plans 
            WHERE workout_plans.id = workout_plan_exercises.workout_plan_id 
            AND workout_plans.created_by = auth.uid()
        )
    );

-- Create trigger functions for updating timestamps
CREATE OR REPLACE FUNCTION update_workout_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_workout_plan_exercises_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at column
CREATE TRIGGER update_workout_plans_updated_at_trigger
    BEFORE UPDATE ON workout_plans 
    FOR EACH ROW 
    EXECUTE FUNCTION update_workout_plans_updated_at();

CREATE TRIGGER update_workout_plan_exercises_updated_at_trigger
    BEFORE UPDATE ON workout_plan_exercises 
    FOR EACH ROW 
    EXECUTE FUNCTION update_workout_plan_exercises_updated_at();

-- Sample data (optional)
-- Insert sample workout plans
INSERT INTO workout_plans (name, description, muscle_types, difficulty_level, estimated_duration, created_by, is_public) VALUES 
(
    'Push Day Workout',
    'A comprehensive push workout targeting chest, shoulders, and triceps',
    ARRAY['chest', 'shoulders', 'triceps'],
    'intermediate',
    60,
    (SELECT id FROM users WHERE email = 'john@example.com'),
    true
),
(
    'Pull Day Workout',
    'Complete pull workout focusing on back and biceps',
    ARRAY['back', 'biceps'],
    'intermediate',
    55,
    (SELECT id FROM users WHERE email = 'john@example.com'),
    true
),
(
    'Leg Day Workout',
    'Intense leg workout for building lower body strength',
    ARRAY['legs', 'glutes'],
    'advanced',
    75,
    (SELECT id FROM users WHERE email = 'jane@example.com'),
    false
);

-- Insert sample workout plan exercises
-- Push Day exercises
INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, weight, rest_time, order_index) VALUES 
(
    (SELECT id FROM workout_plans WHERE name = 'Push Day Workout'),
    '1', -- Bench Press
    4,
    8,
    185.5,
    120,
    1
);

-- Pull Day exercises  
INSERT INTO workout_plan_exercises (workout_plan_id, exercise_id, sets, reps, rest_time, order_index) VALUES 
(
    (SELECT id FROM workout_plans WHERE name = 'Pull Day Workout'),
    '2', -- Pull-ups
    3,
    10,
    90,
    1
);

-- Create a view for easy querying of workout plans with exercise details
CREATE OR REPLACE VIEW workout_plans_with_exercises AS
SELECT 
    wp.id,
    wp.name,
    wp.description,
    wp.muscle_types,
    wp.difficulty_level,
    wp.estimated_duration,
    wp.created_by,
    wp.is_public,
    wp.created_at,
    wp.updated_at,
    u.name as creator_name,
    u.email as creator_email,
    COALESCE(
        JSON_AGG(
            JSON_BUILD_OBJECT(
                'exercise_id', wpe.exercise_id,
                'exercise_name', e.name,
                'exercise_description', e.description,
                'body_part', e.body_part,
                'exercise_type', e.exercise_type,
                'difficulty', e.difficulty,
                'equipment', e.equipment,
                'sets', wpe.sets,
                'reps', wpe.reps,
                'weight', wpe.weight,
                'rest_time', wpe.rest_time,
                'notes', wpe.notes,
                'order_index', wpe.order_index
            ) ORDER BY wpe.order_index
        ) FILTER (WHERE wpe.id IS NOT NULL),
        '[]'::JSON
    ) as exercises
FROM workout_plans wp
LEFT JOIN users u ON wp.created_by = u.id
LEFT JOIN workout_plan_exercises wpe ON wp.id = wpe.workout_plan_id
LEFT JOIN exercises e ON wpe.exercise_id = e.id
GROUP BY wp.id, u.name, u.email;