# Supabase Database Setup Complete

Your To-Do Calendar app is now fully integrated with Supabase and ready to use!

## What Has Been Set Up

### 1. Database Schema
Three main tables have been created in your Supabase database:

#### **todos**
- Stores all task definitions
- Columns: id, text, created_at, recurrence, user_id, created_timestamp
- Supports daily, weekly, and monthly recurring tasks
- Each user can only see their own tasks (RLS enabled)

#### **todo_completions**
- Tracks which tasks were completed on specific dates
- Columns: id, todo_id, completion_date, user_id, completed_at
- Unique constraint ensures a task can only be marked complete once per day
- Each user sees only their own completions (RLS enabled)

#### **time_sessions**
- Records every time tracking session for each task
- Columns: id, todo_id, session_date, start_time, end_time, duration_seconds, user_id, created_at
- Tracks active sessions (end_time is NULL) and completed sessions
- Automatically calculates duration when session ends
- Each user sees only their own time sessions (RLS enabled)

### 2. Authentication
- Email/password authentication is configured
- Users must sign up or sign in to access the app
- Sessions are automatically managed by Supabase
- Only authenticated users can access their tasks

### 3. Row-Level Security (RLS)
All tables have RLS policies enabled:
- Users can only view their own data
- Users can only create/update/delete their own records
- This is automatically enforced at the database level

## How to Use

### First Time Setup
1. **Sign Up**: Create a new account with your email and password
2. **Verify**: Check your email if verification is enabled
3. **Sign In**: Log in with your credentials

### Features Available

#### Add Tasks
- Click "Add a new task..." to create a task
- Choose recurrence: Once, Daily, Weekly, or Monthly
- Click "Add" to save the task

#### Start/Stop Timer
- Click the green play button to start tracking time on a task
- The timer will run in the background (red pulsing button shows it's active)
- Click the red stop button to end the session
- Time is automatically saved to the database

#### View Time Stats
- **Today**: Shows total time tracked on the current date
- **This Month**: Shows total time tracked across the entire month
- Time updates in real-time as the timer runs

#### Complete Tasks
- Check the checkbox to mark a task complete
- Uncheck to mark it incomplete
- Completion status is saved per day (you can mark a daily task complete on different days)

#### Calendar Navigation
- Click dates in the calendar to view tasks for that day
- Dots under dates indicate days with tasks
- Blue highlighting shows the selected date

## Accessing Your Data

All your data is stored in Supabase:
- **Tasks**: Created, read, updated, deleted through the app
- **Completions**: Tracked automatically when you check/uncheck tasks
- **Time Sessions**: Recorded every time you use the timer

You can access this data:
- Through the app interface
- Via Supabase Dashboard (your data tables in the database)
- Through API calls (if you have the API keys)

## Data Persistence

All data is persistent:
- Tasks don't disappear when you close the app
- Timer data is saved even if you refresh the page
- Switching devices: Your data syncs across devices (same account)
- Recurring tasks automatically appear on applicable dates

## Sign Out

- Click "Sign Out" button in the top right
- You'll be logged out and returned to the sign in screen
- Sign back in anytime to access your tasks and time data

## Local Storage Migration

If you had tasks stored in your browser's local storage:
- They are automatically migrated to Supabase on first login
- Your old data won't be lost
- The local storage is cleared after successful migration

## Environment Variables

Your connection details are in `.env`:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Public anon key for client-side access

These are automatically used by the app to connect to Supabase.

## Support

If you encounter any issues:
1. Check browser console for error messages
2. Verify your internet connection
3. Ensure you're logged in
4. Check Supabase dashboard for any database issues
