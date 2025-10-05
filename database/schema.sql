-- Supabase SQL Schema for GymLog Backend
-- Run this in your Supabase SQL editor to set up the database tables

-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Gym logs table
CREATE TABLE gym_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise VARCHAR(255) NOT NULL,
  sets INTEGER NOT NULL CHECK (sets > 0),
  reps INTEGER NOT NULL CHECK (reps > 0),
  weight DECIMAL(10,2) NOT NULL CHECK (weight >= 0),
  notes TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_gym_logs_user_id ON gym_logs(user_id);
CREATE INDEX idx_gym_logs_created_at ON gym_logs(created_at DESC);
CREATE INDEX idx_gym_logs_exercise ON gym_logs(exercise);
CREATE INDEX idx_users_email ON users(email);

-- Enable Row Level Security (RLS) for better security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Users can only see/modify their own data
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for gym_logs table  
-- Users can only see/modify their own gym logs
CREATE POLICY "Users can view own gym logs" ON gym_logs
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own gym logs" ON gym_logs
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own gym logs" ON gym_logs
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own gym logs" ON gym_logs
    FOR DELETE USING (user_id = auth.uid());

-- Create trigger functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at column
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gym_logs_updated_at 
    BEFORE UPDATE ON gym_logs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
-- Note: These passwords are hashed with bcryptjs for 'password123'
INSERT INTO users (email, password, name) VALUES 
('john@example.com', '$2a$10$YnP0HDW7d6wg/TDY2zXwqOHQXHVw5AnpZT1PL0FJ7FNJmQNTHHNIK', 'John Doe'),
('jane@example.com', '$2a$10$YnP0HDW7d6wg/TDY2zXwqOHQXHVw5AnpZT1PL0FJ7FNJmQNTHHNIK', 'Jane Smith');

-- Sample gym logs
INSERT INTO gym_logs (exercise, sets, reps, weight, notes, user_id) VALUES 
('Bench Press', 3, 10, 185.5, 'Felt strong today', (SELECT id FROM users WHERE email = 'john@example.com')),
('Squat', 4, 8, 225.0, 'Good depth', (SELECT id FROM users WHERE email = 'john@example.com')),
('Deadlift', 3, 5, 315.0, 'New PR!', (SELECT id FROM users WHERE email = 'jane@example.com'));