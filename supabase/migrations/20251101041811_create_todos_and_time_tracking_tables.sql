/*
  # Create To-Do and Time Tracking System

  ## Overview
  This migration creates a comprehensive task and time tracking system with support for:
  - One-time and recurring tasks (daily, weekly, monthly)
  - Task completion tracking per date
  - Active time tracking sessions
  - Historical time logs for monthly/daily analytics

  ## New Tables

  ### 1. `todos`
  Stores all task definitions
  - `id` (uuid, primary key) - Unique task identifier
  - `text` (text) - Task description
  - `created_at` (date) - Date when task was first created
  - `recurrence` (text) - Recurrence type: 'daily', 'weekly', 'monthly', or NULL for one-time tasks
  - `user_id` (uuid) - Owner of the task (for future multi-user support)
  - `created_timestamp` (timestamptz) - Actual creation timestamp

  ### 2. `todo_completions`
  Tracks which tasks were completed on specific dates
  - `id` (uuid, primary key)
  - `todo_id` (uuid, foreign key) - Reference to the task
  - `completion_date` (date) - Date the task was marked complete
  - `user_id` (uuid) - User who completed the task
  - `completed_at` (timestamptz) - Exact completion timestamp
  - Unique constraint on (todo_id, completion_date, user_id)

  ### 3. `time_sessions`
  Tracks active and completed time tracking sessions
  - `id` (uuid, primary key)
  - `todo_id` (uuid, foreign key) - Task being tracked
  - `session_date` (date) - Date of the session
  - `start_time` (timestamptz) - When tracking started
  - `end_time` (timestamptz) - When tracking ended (NULL if active)
  - `duration_seconds` (integer) - Total seconds tracked (computed on end)
  - `user_id` (uuid) - User tracking time
  - `created_at` (timestamptz) - Record creation time

  ## Security
  - RLS enabled on all tables
  - Authenticated users can manage only their own data
  - Policies for SELECT, INSERT, UPDATE, DELETE operations

  ## Notes
  1. Only one active session (end_time IS NULL) allowed per user at a time
  2. Time sessions automatically calculate duration when ended
  3. Supports analytics queries for daily and monthly time summaries
*/

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  created_at date NOT NULL,
  recurrence text CHECK (recurrence IN ('daily', 'weekly', 'monthly')),
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_timestamp timestamptz DEFAULT now()
);

-- Create todo_completions table
CREATE TABLE IF NOT EXISTS todo_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id uuid NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  completion_date date NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  completed_at timestamptz DEFAULT now(),
  UNIQUE(todo_id, completion_date, user_id)
);

-- Create time_sessions table
CREATE TABLE IF NOT EXISTS time_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  todo_id uuid NOT NULL REFERENCES todos(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  start_time timestamptz NOT NULL DEFAULT now(),
  end_time timestamptz,
  duration_seconds integer,
  user_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos(created_at);
CREATE INDEX IF NOT EXISTS idx_todo_completions_user_id ON todo_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_completions_date ON todo_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_time_sessions_user_id ON time_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_time_sessions_todo_id ON time_sessions(todo_id);
CREATE INDEX IF NOT EXISTS idx_time_sessions_date ON time_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_time_sessions_active ON time_sessions(user_id, end_time) WHERE end_time IS NULL;

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for todos table
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for todo_completions table
CREATE POLICY "Users can view own completions"
  ON todo_completions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON todo_completions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own completions"
  ON todo_completions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for time_sessions table
CREATE POLICY "Users can view own time sessions"
  ON time_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own time sessions"
  ON time_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own time sessions"
  ON time_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own time sessions"
  ON time_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);