import React from 'react';
import { TodoItemViewData } from '../types';

interface TodoItemViewProps {
  todo: TodoItemViewData;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStartTimer: (id: string) => void;
  onStopTimer: (id: string) => void;
}

const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours}h ${minutes}m ${secs}s`;
};

const TodoItemView: React.FC<TodoItemViewProps> = ({ todo, onToggle, onDelete, onStartTimer, onStopTimer }) => {
  return (
    <li className="flex flex-col p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between w-full">
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
      <div className="flex items-center space-x-2">
        {!todo.isTimerActive ? (
          <button
            onClick={() => onStartTimer(todo.id)}
            className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
            aria-label={`Start timer for ${todo.text}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => onStopTimer(todo.id)}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors animate-pulse"
            aria-label={`Stop timer for ${todo.text}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
          </button>
        )}
        <button onClick={() => onDelete(todo.id)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label={`Delete task: ${todo.text}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      </div>
      {(todo.totalTimeToday !== undefined || todo.totalTimeMonth !== undefined) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex gap-4 text-xs text-gray-600 dark:text-gray-400">
          {todo.totalTimeToday !== undefined && (
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span><strong>Today:</strong> {formatTime(todo.totalTimeToday)}</span>
            </div>
          )}
          {todo.totalTimeMonth !== undefined && (
            <div className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span><strong>This Month:</strong> {formatTime(todo.totalTimeMonth)}</span>
            </div>
          )}
        </div>
      )}
    </li>
  );
};

export default TodoItemView;