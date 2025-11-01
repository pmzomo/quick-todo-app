import { supabase } from '../lib/supabase';

interface LocalTodoItem {
  id: string;
  text: string;
  createdAt: string;
  recurrence?: 'daily' | 'weekly' | 'monthly';
}

type LocalTodos = Record<string, LocalTodoItem[]>;
type LocalCompletions = Record<string, string[]>;

export const migrateLocalStorageToSupabase = async (): Promise<{
  success: boolean;
  todosCount: number;
  completionsCount: number;
  error?: string;
}> => {
  try {
    const localTodosStr = localStorage.getItem('todos');
    const localCompletionsStr = localStorage.getItem('todoCompletions');

    if (!localTodosStr && !localCompletionsStr) {
      return { success: true, todosCount: 0, completionsCount: 0 };
    }

    let todosCount = 0;
    let completionsCount = 0;

    if (localTodosStr) {
      const localTodos: LocalTodos = JSON.parse(localTodosStr);
      const todosToInsert = [];

      for (const dateKey in localTodos) {
        for (const todo of localTodos[dateKey]) {
          todosToInsert.push({
            id: todo.id,
            text: todo.text,
            created_at: todo.createdAt,
            recurrence: todo.recurrence || null
          });
        }
      }

      if (todosToInsert.length > 0) {
        const { error } = await supabase.from('todos').upsert(todosToInsert);
        if (error) throw error;
        todosCount = todosToInsert.length;
      }
    }

    if (localCompletionsStr) {
      const localCompletions: LocalCompletions = JSON.parse(localCompletionsStr);
      const completionsToInsert = [];

      for (const dateKey in localCompletions) {
        for (const todoId of localCompletions[dateKey]) {
          completionsToInsert.push({
            todo_id: todoId,
            completion_date: dateKey
          });
        }
      }

      if (completionsToInsert.length > 0) {
        const { error } = await supabase.from('todo_completions').upsert(completionsToInsert, {
          onConflict: 'todo_id,completion_date,user_id',
          ignoreDuplicates: true
        });
        if (error) throw error;
        completionsCount = completionsToInsert.length;
      }
    }

    localStorage.removeItem('todos');
    localStorage.removeItem('todoCompletions');

    return { success: true, todosCount, completionsCount };
  } catch (error) {
    console.error('Migration error:', error);
    return {
      success: false,
      todosCount: 0,
      completionsCount: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
