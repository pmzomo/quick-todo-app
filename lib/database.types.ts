export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      todos: {
        Row: {
          id: string
          text: string
          created_at: string
          recurrence: 'daily' | 'weekly' | 'monthly' | null
          user_id: string
          created_timestamp: string
        }
        Insert: {
          id?: string
          text: string
          created_at: string
          recurrence?: 'daily' | 'weekly' | 'monthly' | null
          user_id?: string
          created_timestamp?: string
        }
        Update: {
          id?: string
          text?: string
          created_at?: string
          recurrence?: 'daily' | 'weekly' | 'monthly' | null
          user_id?: string
          created_timestamp?: string
        }
      }
      todo_completions: {
        Row: {
          id: string
          todo_id: string
          completion_date: string
          user_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          todo_id: string
          completion_date: string
          user_id?: string
          completed_at?: string
        }
        Update: {
          id?: string
          todo_id?: string
          completion_date?: string
          user_id?: string
          completed_at?: string
        }
      }
      time_sessions: {
        Row: {
          id: string
          todo_id: string
          session_date: string
          start_time: string
          end_time: string | null
          duration_seconds: number | null
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          todo_id: string
          session_date: string
          start_time?: string
          end_time?: string | null
          duration_seconds?: number | null
          user_id?: string
          created_at?: string
        }
        Update: {
          id?: string
          todo_id?: string
          session_date?: string
          start_time?: string
          end_time?: string | null
          duration_seconds?: number | null
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}
