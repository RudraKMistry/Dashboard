import { useState, useMemo } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns';
import { useTransactions, useTasks, useHabits, useSubscriptions } from '../../hooks/useData';
import { formatCurrency } from '../../lib/utils';
import './CalendarPage.css';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { transactions } = useTransactions();
  const { tasks, toggleComplete } = useTasks();
  const { habits, logs: habitLogs } = useHabits();
  const { subscriptions } = useSubscriptions();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart); // 0=Sun

  // Events for each day
  const dayEvents = useMemo(() => {
    const events = {};
    const addEvent = (date, event) => {
      if (!events[date]) events[date] = [];
      events[date].push(event);
    };

    // Tasks with due dates
    tasks.forEach(t => {
      if (t.dueDate) {
        addEvent(t.dueDate, { type: 'task', id: t.id, label: t.title, isDone: t.status === 'done', color: t.status === 'done' ? 'var(--accent-green)' : 'var(--accent-blue)' });
      }
    });

    // Transactions
    transactions.forEach(t => {
      addEvent(t.date, {
        type: 'transaction',
        label: `${t.type === 'income' ? '+' : '-'}${formatCurrency(t.amount)}`,
        color: t.type === 'income' ? 'var(--accent-green)' : 'var(--accent-red)',
      });
    });

    // Subscriptions (recurring)
    subscriptions.filter(s => s.isActive).forEach(s => {
      days.forEach(day => {
        if (day.getDate() === s.billingDate) {
          const dateStr = format(day, 'yyyy-MM-dd');
          addEvent(dateStr, { type: 'bill', label: `${s.name} - ${formatCurrency(s.amount)}`, color: 'var(--accent-orange)' });
        }
      });
    });

    return events;
  }, [transactions, tasks, subscriptions, currentMonth]);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedEvents = dayEvents[selectedDateStr] || [];

  // Habit count for selected date
  const selectedHabits = useMemo(() => {
    return habitLogs.filter(l => l.date === selectedDateStr);
  }, [habitLogs, selectedDateStr]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="calendar-page animate-fadeIn">
      <div className="page-header">
        <h1>📅 Calendar</h1>
        <p className="page-subtitle">Unified view of tasks, bills, and habits</p>
      </div>

      <div className="calendar-layout">
        {/* Calendar Grid */}
        <div className="glass-card calendar-card">
          <div className="calendar-nav">
            <button className="btn btn-icon btn-ghost" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <HiChevronLeft />
            </button>
            <h3>{format(currentMonth, 'MMMM yyyy')}</h3>
            <button className="btn btn-icon btn-ghost" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <HiChevronRight />
            </button>
          </div>

          <div className="calendar-grid">
            {weekDays.map(day => (
              <div key={day} className="calendar-weekday">{day}</div>
            ))}

            {/* Empty cells for start of month */}
            {Array.from({ length: startDay }, (_, i) => (
              <div key={`empty-${i}`} className="calendar-day empty" />
            ))}

            {days.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const events = dayEvents[dateStr] || [];
              const isSelected = isSameDay(day, selectedDate);
              const isTodayDate = isToday(day);
              const habitCount = habitLogs.filter(l => l.date === dateStr).length;

              return (
                <div
                  key={dateStr}
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${isTodayDate ? 'today' : ''} ${events.length > 0 ? 'has-events' : ''}`}
                  onClick={() => setSelectedDate(day)}
                >
                  <span className="day-number">{format(day, 'd')}</span>
                  <div className="day-indicators">
                    {events.slice(0, 3).map((e, i) => (
                      <span key={i} className="day-dot" style={{ background: e.color }} />
                    ))}
                    {habitCount > 0 && <span className="day-dot" style={{ background: 'var(--accent-primary)' }} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Day Detail Panel */}
        <div className="glass-card day-detail-panel">
          <h3>{format(selectedDate, 'EEEE, MMMM do')}</h3>
          {isToday(selectedDate) && <span className="badge badge-purple">Today</span>}

          {selectedEvents.length === 0 && selectedHabits.length === 0 ? (
            <div className="empty-mini" style={{ paddingTop: '32px' }}>
              <span>📭</span>
              <p>Nothing on this day</p>
            </div>
          ) : (
            <div className="day-events-list">
              {selectedEvents.map((event, i) => (
                <div key={i} className="day-event-item" style={event.type === 'task' ? { cursor: 'pointer' } : {}} onClick={() => {
                  if (event.type === 'task') toggleComplete(event.id);
                }}>
                  {event.type === 'task' ? (
                    <span className="day-event-dot" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', borderRadius: '4px', border: `2px solid ${event.color}`, background: event.isDone ? event.color : 'transparent', color: '#fff', fontSize: '12px' }}>
                      {event.isDone && '✓'}
                    </span>
                  ) : (
                    <span className="day-event-dot" style={{ background: event.color }} />
                  )}
                  <span className="day-event-type">{event.type}</span>
                  <span className="day-event-label" style={{ textDecoration: event.isDone ? 'line-through' : 'none', opacity: event.isDone ? 0.6 : 1 }}>{event.label}</span>
                </div>
              ))}
              {selectedHabits.length > 0 && (
                <div className="day-event-item">
                  <span className="day-event-dot" style={{ background: 'var(--accent-primary)' }} />
                  <span className="day-event-type">habits</span>
                  <span className="day-event-label">{selectedHabits.length} habit{selectedHabits.length > 1 ? 's' : ''} completed</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
