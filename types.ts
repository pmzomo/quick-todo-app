export interface TodoItem {
  id: string;
  text: string;
  createdAt: string; // YYYY-MM-DD format
  recurrence?: 'daily' | 'weekly' | 'monthly';
}

// This is the shape of the data passed to the view components
export interface TodoItemViewData extends TodoItem {
    completed: boolean;
}

export type Todos = Record<string, TodoItem[]>; // key: dateKey (createdAt)

export type TodoCompletions = Record<string, string[]>; // key: dateKey (completionDate), value: array of completed todo IDs
