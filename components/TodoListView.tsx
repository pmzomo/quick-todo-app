import React, { useState } from 'react';
import { TodoItemViewData } from '../types';
import TodoItemView from './TodoItemView';

type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly';

interface TodoListViewProps {
  selectedDate: Date;
  todosForDate: TodoItemViewData[];
  onAddTodo: (text: string, recurrence: RecurrenceType) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onStartTimer: (id: string) => void;
  onStopTimer: (id: string) => void;
}

const TodoListView: React.FC<TodoListViewProps> = ({
  selectedDate,
  todosForDate,
  onAddTodo,
  onToggleTodo,
  onDeleteTodo,
  onStartTimer,
  onStopTimer,
}) => {
  const [newTodoText, setNewTodoText] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('none');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodoText.trim()) {
      onAddTodo(newTodoText.trim(), recurrence);
      setNewTodoText('');
      setRecurrence('none');
    }
  };
  
  const completedCount = todosForDate.filter(t => t.completed).length;
  const totalCount = todosForDate.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          Tasks for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {totalCount > 0 ? `${completedCount} of ${totalCount} completed` : "No tasks for today. Add one below!"}
        </p>
         {totalCount > 0 && (
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-3">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>

      <div className="flex-grow overflow-y-auto pr-2 -mr-2">
        <ul className="space-y-3">
          {todosForDate.map(todo => (
            <TodoItemView
              key={todo.id}
              todo={todo}
              onToggle={onToggleTodo}
              onDelete={onDeleteTodo}
              onStartTimer={onStartTimer}
              onStopTimer={onStopTimer}
            />
          ))}
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new task..."
          className="flex-grow px-4 py-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-white transition"
        />
        <div className="flex-shrink-0 flex gap-3">
          <select 
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value as RecurrenceType)}
            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-800 dark:text-white transition"
          >
            <option value="none">Once</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors shadow-md hover:shadow-lg">
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default TodoListView;
