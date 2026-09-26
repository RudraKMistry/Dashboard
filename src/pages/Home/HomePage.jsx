import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiTrendingUp, HiTrendingDown, HiCash, HiClipboardCheck, HiFire, HiCalendar } from 'react-icons/hi';
import { useTransactions, useTasks, useHabits, useSubscriptions, useRoutine, useSettings } from '../../hooks/useData';
import { formatCurrency, getGreeting, formatDate, getNextBillingDate, daysUntil, percentage } from '../../lib/utils';
import AnimatedNumber from '../../components/ui/AnimatedNumber';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const { getTodaySummary, getMonthSummary, transactions } = useTransactions();
  const { tasks, getTodayTasks } = useTasks();
  const { habits, getTodayProgress, isCompletedToday, logHabit, unlogHabit } = useHabits();
  const { getActiveSubs, getTotalMonthly } = useSubscriptions();
  const { getDayProgress } = useRoutine();
  const { settings } = useSettings();

  const todayPL = useMemo(() => getTodaySummary(), [transactions]);
  const monthSummary = useMemo(() => getMonthSummary(), [transactions]);
  const todayTasks = useMemo(() => getTodayTasks(), [tasks]);
  const habitProgress = useMemo(() => getTodayProgress(), [habits]);
  const routineProgress = useMemo(() => getDayProgress(), []);
  const activeSubs = useMemo(() => getActiveSubs(), []);

  const recentTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  }, [transactions]);

  const upcomingBills = useMemo(() => {
    return activeSubs
      .map(sub => ({
        ...sub,
        nextDate: getNextBillingDate(sub.billingDate),
        daysLeft: daysUntil(getNextBillingDate(sub.billingDate)),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft)
      .slice(0, 4);
  }, [activeSubs]);

  const greeting = getGreeting();
  const userName = settings?.name || 'there';
  const today = new Date();

  return (
    <div className="home-page animate-fadeIn">
      {/* Header */}
      <div className="home-header">
        <div>
          <h1>{greeting}, {userName} 👋</h1>
          <p className="text-muted">{formatDate(today, 'EEEE, MMMM do, yyyy')}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(0, 229, 160, 0.15)' }}>
            <HiTrendingUp style={{ color: 'var(--accent-green)' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Today's Income</span>
            <span className="stat-value text-green"><AnimatedNumber value={todayPL.income} format={formatCurrency} /></span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(255, 107, 107, 0.15)' }}>
            <HiTrendingDown style={{ color: 'var(--accent-red)' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Today's Expenses</span>
            <span className="stat-value text-red"><AnimatedNumber value={todayPL.expense} format={formatCurrency} /></span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: todayPL.net >= 0 ? 'rgba(0, 229, 160, 0.15)' : 'rgba(255, 107, 107, 0.15)' }}>
            <HiCash style={{ color: todayPL.net >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Daily P&L</span>
            <span className={`stat-value ${todayPL.net >= 0 ? 'text-green' : 'text-red'}`}>
              {todayPL.net >= 0 ? '+' : ''}<AnimatedNumber value={Math.abs(todayPL.net)} format={formatCurrency} />
            </span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(108, 99, 255, 0.15)' }}>
            <HiClipboardCheck style={{ color: 'var(--accent-primary-light)' }} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Active Tasks</span>
            <span className="stat-value">{todayTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="home-grid">
        {/* Today's Tasks */}
        {settings.dashboardWidgets?.tasks !== false && (
        <div className="glass-card home-section">
          <div className="section-header">
            <h3>📋 Today's Tasks</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>View All</button>
          </div>
          <div className="section-content">
            {todayTasks.length === 0 ? (
              <div className="empty-mini">
                <span>✨</span>
                <p>All caught up! No pending tasks.</p>
              </div>
            ) : (
              <ul className="task-mini-list">
                {todayTasks.slice(0, 5).map(task => (
                  <li key={task.id} className="task-mini-item">
                    <div className={`priority-dot priority-${task.priority}`} />
                    <span className="task-mini-title">{task.title}</span>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        )}

        {/* Habit Progress */}
        {settings.dashboardWidgets?.habits !== false && (
        <div className="glass-card home-section">
          <div className="section-header">
            <h3>🔥 Habits</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/habits')}>View All</button>
          </div>
          <div className="section-content">
            <div className="habit-progress-ring-wrapper">
              <svg className="habit-ring" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="42"
                  fill="none"
                  stroke="url(#habitGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - (habitProgress.total > 0 ? habitProgress.completed / habitProgress.total : 0))}`}
                  transform="rotate(-90 50 50)"
                  className="habit-ring-progress"
                />
                <defs>
                  <linearGradient id="habitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--accent-primary)" />
                    <stop offset="100%" stopColor="var(--accent-green)" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="habit-ring-text">
                <span className="habit-ring-count">{habitProgress.completed}/{habitProgress.total}</span>
                <span className="habit-ring-label">done</span>
              </div>
            </div>
            <div className="habit-mini-list">
              {habits.slice(0, 5).map(habit => (
                <div
                  key={habit.id}
                  className={`habit-mini-item ${isCompletedToday(habit.id) ? 'completed' : ''}`}
                  onClick={() => {
                    if (isCompletedToday(habit.id)) {
                      unlogHabit(habit.id);
                    } else {
                      logHabit(habit.id);
                    }
                  }}
                >
                  <span className="habit-mini-emoji">{habit.emoji}</span>
                  <span className="habit-mini-name">{habit.name}</span>
                  {isCompletedToday(habit.id) && <span className="habit-check">✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Upcoming Bills */}
        {settings.dashboardWidgets?.bills !== false && (
        <div className="glass-card home-section">
          <div className="section-header">
            <h3>💳 Upcoming Bills</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/finance')}>View All</button>
          </div>
          <div className="section-content">
            {upcomingBills.length === 0 ? (
              <div className="empty-mini">
                <span>📭</span>
                <p>No upcoming bills</p>
              </div>
            ) : (
              <ul className="bills-list">
                {upcomingBills.map(bill => (
                  <li key={bill.id} className="bill-item">
                    <div className="bill-info">
                      <span className="bill-name">{bill.name}</span>
                      <span className="bill-amount">{formatCurrency(bill.amount)}</span>
                    </div>
                    <span className={`bill-days ${bill.daysLeft <= 3 ? 'urgent' : ''}`}>
                      {bill.daysLeft === 0 ? 'Today' : bill.daysLeft === 1 ? 'Tomorrow' : `${bill.daysLeft} days`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        )}

        {/* Recent Transactions */}
        {settings.dashboardWidgets?.transactions !== false && (
        <div className="glass-card home-section">
          <div className="section-header">
            <h3>💰 Recent Transactions</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/finance')}>View All</button>
          </div>
          <div className="section-content">
            {recentTransactions.length === 0 ? (
              <div className="empty-mini">
                <span>📊</span>
                <p>No transactions yet</p>
              </div>
            ) : (
              <ul className="transaction-mini-list">
                {recentTransactions.map(t => (
                  <li key={t.id} className="transaction-mini-item">
                    <div className="transaction-mini-info">
                      <span className="transaction-mini-desc">{t.description || t.category}</span>
                      <span className="transaction-mini-date">{formatDate(t.date, 'MMM dd')}</span>
                    </div>
                    <span className={`transaction-mini-amount ${t.type === 'income' ? 'text-green' : 'text-red'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        )}

        {/* Monthly Overview */}
        {settings.dashboardWidgets?.monthlyOverview !== false && (
        <div className="glass-card home-section monthly-overview">
          <div className="section-header">
            <h3>📊 This Month</h3>
          </div>
          <div className="section-content">
            <div className="month-stats">
              <div className="month-stat">
                <span className="month-stat-label">Income</span>
                <span className="month-stat-value text-green"><AnimatedNumber value={monthSummary.income} format={formatCurrency} /></span>
              </div>
              <div className="month-stat">
                <span className="month-stat-label">Expenses</span>
                <span className="month-stat-value text-red"><AnimatedNumber value={monthSummary.expense} format={formatCurrency} /></span>
              </div>
              <div className="month-stat">
                <span className="month-stat-label">Net</span>
                <span className={`month-stat-value ${monthSummary.net >= 0 ? 'text-green' : 'text-red'}`}>
                  {monthSummary.net >= 0 ? '+' : ''}<AnimatedNumber value={Math.abs(monthSummary.net)} format={formatCurrency} />
                </span>
              </div>
            </div>
            <div className="progress-container" style={{ marginTop: '16px' }}>
              <div
                className={`progress-bar ${monthSummary.income > 0 ? (monthSummary.expense / monthSummary.income > 0.9 ? 'progress-red' : monthSummary.expense / monthSummary.income > 0.7 ? 'progress-yellow' : 'progress-green') : 'progress-purple'}`}
                style={{ width: `${monthSummary.income > 0 ? Math.min((monthSummary.expense / monthSummary.income) * 100, 100) : 0}%` }}
              />
            </div>
            <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: '8px' }}>
              {monthSummary.income > 0
                ? `${Math.round((monthSummary.expense / monthSummary.income) * 100)}% of income spent`
                : 'Add income to see spending ratio'
              }
            </p>
          </div>
        </div>
        )}

        {/* Routine Progress */}
        {settings.dashboardWidgets?.routine !== false && (
        <div className="glass-card home-section">
          <div className="section-header">
            <h3>🌅 Today's Routine</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/routine')}>View All</button>
          </div>
          <div className="section-content">
            <div className="routine-progress-home">
              <div className="routine-progress-bar-wrapper">
                <div className="progress-container" style={{ height: '12px' }}>
                  <div
                    className="progress-bar progress-purple"
                    style={{ width: `${routineProgress.total > 0 ? percentage(routineProgress.completed, routineProgress.total) : 0}%` }}
                  />
                </div>
                <span className="routine-progress-text">
                  {routineProgress.completed}/{routineProgress.total} completed
                </span>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
