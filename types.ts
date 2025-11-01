export interface TodoItem {
  id: string;
  text: string;
  createdAt: string;
  recurrence?: 'daily' | 'weekly' | 'monthly';
}

export interface TimeSession {
  id: string;
  todo_id: string;
  session_date: string;
  start_time: string;
  end_time: string | null;
  duration_seconds: number | null;
}

export interface TodoItemViewData extends TodoItem {
  completed: boolean;
  totalTimeToday?: number;
  totalTimeMonth?: number;
  isTimerActive?: boolean;
  activeSessionId?: string;
}

export type Todos = Record<string, TodoItem[]>;

export type TodoCompletions = Record<string, string[]>;
