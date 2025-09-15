import React, { useState, useMemo, useCallback } from 'react';
import { Todos } from '../types';

interface CalendarViewProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  todos: Todos;
  formatDateKey: (date: Date) => string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onDateChange, todos, formatDateKey }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));

  const daysInMonth = useMemo(() => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const days = [];
    while (date.getMonth() === currentMonth.getMonth()) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [currentMonth]);
  
  const hasTodosOn = useCallback((date: Date): boolean => {
    const dateKey = formatDateKey(date);
    if (todos[dateKey]?.length > 0) return true;

    // Use UTC date for consistent day/date calculations across timezones
    const dateUTC = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = dateUTC.getUTCDate();
    const dayOfWeek = dateUTC.getUTCDay();

    for (const createdDateKey in todos) {
        const createdAtDateUTC = new Date(createdDateKey + 'T00:00:00Z');
        if (createdAtDateUTC > dateUTC) continue;

        for (const task of todos[createdDateKey]) {
            if (!task.recurrence) continue;
            
            switch (task.recurrence) {
                case 'daily':
                    return true;
                case 'weekly':
                    if (createdAtDateUTC.getUTCDay() === dayOfWeek) return true;
                    break;
                case 'monthly':
                    if (createdAtDateUTC.getUTCDate() === day) return true;
                    break;
            }
        }
    }
    return false;
  }, [todos, formatDateKey]);

  const firstDayOfMonth = currentMonth.getDay();
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => changeMonth(-1)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center">
          {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <button onClick={() => changeMonth(1)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 text-center">
        {weekdays.map(day => (
          <div key={day} className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{day}</div>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`}></div>)}
        {daysInMonth.map(day => {
          const dateKey = formatDateKey(day);
          const isSelected = formatDateKey(selectedDate) === dateKey;
          const isToday = formatDateKey(new Date()) === dateKey;
          const hasTodos = hasTodosOn(day);

          return (
            <div key={dateKey} onClick={() => onDateChange(day)} className="relative flex items-center justify-center h-10 w-10">
              <button className={`
                h-10 w-10 rounded-full text-sm font-medium transition-all duration-200 ease-in-out
                ${isSelected ? 'bg-indigo-600 text-white shadow-md scale-110' : ''}
                ${!isSelected && isToday ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-gray-700 dark:text-gray-300'}
                ${!isSelected ? 'hover:bg-gray-200 dark:hover:bg-gray-700' : ''}
              `}>
                {day.getDate()}
              </button>
              {hasTodos && <span className={`absolute bottom-1 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}></span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
