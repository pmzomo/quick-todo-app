import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { migrateLocalStorageToSupabase } from './utils/migrateLocalStorage';
import CalendarView from './components/CalendarView';
import TodoListView from './components/TodoListView';
import { TodoItem, TodoItemViewData, TimeSession } from './types';

const App: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [completions, setCompletions] = useState<Record<string, Set<string>>>({});
  const [timeSessions, setTimeSessions] = useState<TimeSession[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isCalendarVisible, setIsCalendarVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTimerId, setActiveTimerId] = useState<NodeJS.Timeout | null>(null);

  const formatDateKey = useCallback((date: Date): string => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      if (activeTimerId) {
        setTimeSessions(prev => [...prev]);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [activeTimerId]);

  const loadData = async () => {
    try {
      await migrateLocalStorageToSupabase();

      const [todosRes, completionsRes, sessionsRes] = await Promise.all([
        supabase.from('todos').select('*'),
        supabase.from('todo_completions').select('*'),
        supabase.from('time_sessions').select('*')
      ]);

      if (todosRes.data) {
        const mappedTodos: TodoItem[] = todosRes.data.map(t => ({
          id: t.id,
          text: t.text,
          createdAt: t.created_at,
          recurrence: t.recurrence || undefined
        }));
        setTodos(mappedTodos);
      }

      if (completionsRes.data) {
        const completionMap: Record<string, Set<string>> = {};
        completionsRes.data.forEach(c => {
          if (!completionMap[c.completion_date]) {
            completionMap[c.completion_date] = new Set();
          }
          completionMap[c.completion_date].add(c.todo_id);
        });
        setCompletions(completionMap);
      }

      if (sessionsRes.data) {
        setTimeSessions(sessionsRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const todosForSelectedDate = useMemo((): TodoItemViewData[] => {
    const dateKey = formatDateKey(selectedDate);
    const selectedDateUTC = new Date(Date.UTC(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
    const day = selectedDateUTC.getUTCDate();
    const dayOfWeek = selectedDateUTC.getUTCDay();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();

    const tasksForDay: TodoItemViewData[] = [];
    const taskIdsOnDay = new Set<string>();
    const completedIdsForDay = completions[dateKey] || new Set();

    for (const task of todos) {
      if (taskIdsOnDay.has(task.id)) continue;

      let shouldAppear = false;
      const createdAtDateUTC = new Date(task.createdAt + 'T00:00:00Z');

      if (!task.recurrence) {
        if (task.createdAt === dateKey) {
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
        const activeSession = timeSessions.find(
          s => s.todo_id === task.id && s.end_time === null
        );

        const todaySessions = timeSessions.filter(
          s => s.todo_id === task.id && s.session_date === dateKey && s.end_time !== null
        );
        const totalTimeToday = todaySessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

        const activeSessionTime = activeSession
          ? Math.floor((Date.now() - new Date(activeSession.start_time).getTime()) / 1000)
          : 0;

        const monthSessions = timeSessions.filter(s => {
          if (s.todo_id !== task.id || !s.end_time) return false;
          const sessionDate = new Date(s.session_date);
          return sessionDate.getMonth() === currentMonth && sessionDate.getFullYear() === currentYear;
        });
        const totalTimeMonth = monthSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0);

        tasksForDay.push({
          ...task,
          completed: completedIdsForDay.has(task.id),
          totalTimeToday: totalTimeToday + activeSessionTime,
          totalTimeMonth: totalTimeMonth + activeSessionTime,
          isTimerActive: !!activeSession,
          activeSessionId: activeSession?.id
        });
        taskIdsOnDay.add(task.id);
      }
    }
    return tasksForDay;
  }, [selectedDate, todos, completions, timeSessions, formatDateKey]);

  const handleAddTodo = async (text: string, recurrence: 'daily' | 'weekly' | 'monthly' | 'none') => {
    const dateKey = formatDateKey(selectedDate);
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          text,
          created_at: dateKey,
          recurrence: recurrence !== 'none' ? recurrence : null
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        const newTodo: TodoItem = {
          id: data.id,
          text: data.text,
          createdAt: data.created_at,
          recurrence: data.recurrence || undefined
        };
        setTodos(prev => [...prev, newTodo]);
      }
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleToggleTodo = async (id: string) => {
    const dateKey = formatDateKey(selectedDate);
    const isCompleted = completions[dateKey]?.has(id);

    try {
      if (isCompleted) {
        const { error } = await supabase
          .from('todo_completions')
          .delete()
          .eq('todo_id', id)
          .eq('completion_date', dateKey);

        if (error) throw error;

        setCompletions(prev => {
          const newCompletions = { ...prev };
          if (newCompletions[dateKey]) {
            newCompletions[dateKey] = new Set(newCompletions[dateKey]);
            newCompletions[dateKey].delete(id);
            if (newCompletions[dateKey].size === 0) {
              delete newCompletions[dateKey];
            }
          }
          return newCompletions;
        });
      } else {
        const { error } = await supabase
          .from('todo_completions')
          .insert({
            todo_id: id,
            completion_date: dateKey
          });

        if (error) throw error;

        setCompletions(prev => {
          const newCompletions = { ...prev };
          if (!newCompletions[dateKey]) {
            newCompletions[dateKey] = new Set();
          } else {
            newCompletions[dateKey] = new Set(newCompletions[dateKey]);
          }
          newCompletions[dateKey].add(id);
          return newCompletions;
        });
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  };

  const handleDeleteTodo = async (id: string) => {
    const task = todos.find(t => t.id === id);
    if (!task) return;

    if (task.recurrence) {
      if (!window.confirm('This is a recurring task. Do you want to delete this task and all its occurrences?')) {
        return;
      }
    }

    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;

      setTodos(prev => prev.filter(t => t.id !== id));
      setCompletions(prev => {
        const newCompletions = { ...prev };
        Object.keys(newCompletions).forEach(dateKey => {
          newCompletions[dateKey] = new Set(newCompletions[dateKey]);
          newCompletions[dateKey].delete(id);
          if (newCompletions[dateKey].size === 0) {
            delete newCompletions[dateKey];
          }
        });
        return newCompletions;
      });
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  };

  const handleStartTimer = async (id: string) => {
    const activeSession = timeSessions.find(s => s.end_time === null);
    if (activeSession) {
      alert('Please stop the current timer before starting a new one.');
      return;
    }

    const dateKey = formatDateKey(selectedDate);
    try {
      const { data, error } = await supabase
        .from('time_sessions')
        .insert({
          todo_id: id,
          session_date: dateKey,
          start_time: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setTimeSessions(prev => [...prev, data]);
        setActiveTimerId(setInterval(() => {}, 1000));
      }
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const handleStopTimer = async (id: string) => {
    const activeSession = timeSessions.find(
      s => s.todo_id === id && s.end_time === null
    );
    if (!activeSession) return;

    const endTime = new Date();
    const startTime = new Date(activeSession.start_time);
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    try {
      const { error } = await supabase
        .from('time_sessions')
        .update({
          end_time: endTime.toISOString(),
          duration_seconds: durationSeconds
        })
        .eq('id', activeSession.id);

      if (error) throw error;

      setTimeSessions(prev =>
        prev.map(s =>
          s.id === activeSession.id
            ? { ...s, end_time: endTime.toISOString(), duration_seconds: durationSeconds }
            : s
        )
      );

      if (activeTimerId) {
        clearInterval(activeTimerId);
        setActiveTimerId(null);
      }
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 text-gray-900 dark:text-gray-100 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 dark:text-white">
          To-Do <span className="text-blue-600 dark:text-blue-400">Calendar</span>
        </h1>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">Organize your tasks and track your time.</p>
      </header>

      <div className="max-w-6xl mx-auto mb-4 flex justify-end">
        <button
          onClick={() => setIsCalendarVisible(!isCalendarVisible)}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
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
            onStartTimer={handleStartTimer}
            onStopTimer={handleStopTimer}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
