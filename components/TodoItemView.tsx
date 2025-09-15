import React from 'react';
import { TodoItemViewData } from '../types';

interface TodoItemViewProps {
  todo: TodoItemViewData;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

const TodoItemView: React.FC<TodoItemViewProps> = ({ todo, onToggle, onDelete }) => {
  return (
    <li className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={() => onToggle(todo.id)}
          className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          aria-labelledby={`todo-text-${todo.id}`}
        />
        <span id={`todo-text-${todo.id}`} className={`text-gray-800 dark:text-gray-200 ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
          {todo.text}
        </span>
         {todo.recurrence && (
          // FIX: Replaced the `title` prop on the SVG element with a nested `<title>` element to fix a TypeScript error.
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <title>{`Repeats ${todo.recurrence}`}</title>
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V4a1 1 0 011-1zm10 8a1 1 0 011-1h5a1 1 0 011 1v5a1 1 0 01-1 1h-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 111.885-.666A5.002 5.002 0 0014.001 13H11a1 1 0 01-1-1v-2z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <button onClick={() => onDelete(todo.id)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label={`Delete task: ${todo.text}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </li>
  );
};

export default TodoItemView;