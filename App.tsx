import React, { useState, useCallback, useMemo } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import CalendarView from './components/CalendarView';
import TodoListView from './components/TodoListView';
import { Todos, TodoItem, TodoCompletions, TodoItemViewData } from './types';

const App: React.FC = () => {
  const [todos, setTodos] = useLocalStorage<Todos>('todos', {});
  const [completions, setCompletions] = useLocalStorage<TodoCompletions>('todoCompletions', {});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);

  const formatDateKey = useCallback((date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const todosForSelectedDate = useMemo((): TodoItemViewData[] => {
    const dateKey = formatDateKey(selectedDate);
    // Use UTC date for consistent day/date calculations across timezones
    const selectedDateUTC = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
    const day = selectedDateUTC.getUTCDate();
    const dayOfWeek = selectedDateUTC.getUTCDay();

    const tasksForDay: TodoItemViewData[] = [];
    const taskIdsOnDay = new Set<string>();

    const completedIdsForDay = new Set<string>(completions[dateKey] || []);

    // Iterate through all tasks ever created
    for (const createdDateKey in todos) {
      for (const task of todos[createdDateKey]) {
        if (taskIdsOnDay.has(task.id)) continue;

        let shouldAppear = false;
        const createdAtDateUTC = new Date(createdDateKey + 'T00:00:00Z');
        
        if (!task.recurrence) {
            if (createdDateKey === dateKey) {
                shouldAppear = true;
            }
        } else {
            if (createdAtDateUTC > selectedDateUTC) continue;
            
            switch (task.recurrence) {
              case 'daily':
                shouldAppear = true;
                break;
              case 'weekly':
                if (createdAtDateUTC.getUTCDay() === dayOfWeek) {
                  shouldAppear = true;
                }
                break;
              case 'monthly':
                if (createdAtDateUTC.getUTCDate() === day) {
                  shouldAppear = true;
                }
                break;
            }
        }

        if (shouldAppear) {
          tasksForDay.push({ ...task, completed: completedIdsForDay.has(task.id) });
          taskIdsOnDay.add(task.id);
        }
      }
    }
    return tasksForDay;
  }, [selectedDate, todos, completions, formatDateKey]);


  const handleAddTodo = (text: string, recurrence: 'daily' | 'weekly' | 'monthly' | 'none') => {
    const dateKey = formatDateKey(selectedDate);
    const newTodo: TodoItem = {
      id: crypto.randomUUID(),
      text,
      createdAt: dateKey,
      ...(recurrence !== 'none' && { recurrence }),
    };
    const currentTodosForDate = todos[dateKey] || [];
    const newTodosForDate = [...currentTodosForDate, newTodo];
    setTodos({ ...todos, [dateKey]: newTodosForDate });
  };

  const handleToggleTodo = (id: string) => {
    const dateKey = formatDateKey(selectedDate);
    const currentCompletions = completions[dateKey] || [];
    const newCompletions = { ...completions };

    if (currentCompletions.includes(id)) {
      newCompletions[dateKey] = currentCompletions.filter(completedId => completedId !== id);
    } else {
      newCompletions[dateKey] = [...currentCompletions, id];
    }
    
    if (newCompletions[dateKey].length === 0) {
      delete newCompletions[dateKey];
    }

    setCompletions(newCompletions);
  };

  const handleDeleteTodo = (id: string) => {
    const newTodos = { ...todos };
    let taskToDelete: TodoItem | null = null;
    let createdDateKeyToDelete: string | null = null;

    for (const dateKey in newTodos) {
      const task = newTodos[dateKey].find(t => t.id === id);
      if (task) {
        taskToDelete = task;
        createdDateKeyToDelete = dateKey;
        break;
      }
    }

    if (taskToDelete && createdDateKeyToDelete) {
      if (taskToDelete.recurrence) {
        if (!window.confirm('This is a recurring task. Do you want to delete this task and all its occurrences?')) {
          return;
        }
      }
      
      newTodos[createdDateKeyToDelete] = newTodos[createdDateKeyToDelete].filter(t => t.id !== id);
      
      if (newTodos[createdDateKeyToDelete].length === 0) {
        delete newTodos[createdDateKeyToDelete];
      }
      
      setTodos(newTodos);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-white">To-Do <span className="text-indigo-600 dark:text-indigo-400">Calendar</span></h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Organize your tasks, day by day.</p>
      </header>

      <div className="max-w-6xl mx-auto mb-4 flex justify-end">
        <button
          onClick={() => setIsCalendarVisible(!isCalendarVisible)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
          aria-expanded={isCalendarVisible}
          aria-controls="calendar-container"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{isCalendarVisible ? 'Hide Calendar' : 'Show Calendar'}</span>
        </button>
      </div>
      
      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
        {isCalendarVisible && (
          <div className="lg:col-span-2" id="calendar-container">
             <CalendarView 
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              todos={todos}
              formatDateKey={formatDateKey}
             />
          </div>
        )}
        <div className={isCalendarVisible ? "lg:col-span-3" : "lg:col-span-5"}>
          <TodoListView
            selectedDate={selectedDate}
            todosForDate={todosForSelectedDate}
            onAddTodo={handleAddTodo}
            onToggleTodo={handleToggleTodo}
            onDeleteTodo={handleDeleteTodo}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
