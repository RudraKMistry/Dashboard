import { useState, useEffect } from 'react';
import { HiPlus, HiTrash, HiFire } from 'react-icons/hi';
import { useHabits } from '../../hooks/useData';
import { DEFAULT_HABITS } from '../../lib/constants';
import { getTodayISO, formatDate } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import './HabitsPage.css';

export default function HabitsPage() {
  const {
    habits, logs, addHabit, removeHabit,
    logHabit, unlogHabit, isCompletedToday,
    getTodayValue, getStreak, getTodayProgress
  } = useHabits();
  const [showAddModal, setShowAddModal] = useState(false);

  const today = getTodayISO();
  const progress = getTodayProgress();

  // Get last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const isCompletedOnDate = (habitId, date) => {
    return logs.some(l => l.habitId === habitId && l.date === date);
  };

  return (
    <div className="habits-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>🔥 Habits</h1>
          <p className="page-subtitle">Track daily habits and build streaks</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <HiPlus /> Add Habit
        </button>
      </div>

      {/* Today's Summary */}
      <div className="glass-card habits-summary">
        <div className="habits-summary-ring">
          <svg viewBox="0 0 100 100" width="100" height="100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="42" fill="none"
              stroke="url(#habitsGrad)"
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - (progress.total > 0 ? progress.completed / progress.total : 0))}`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 1s ease' }}
            />
            <defs>
              <linearGradient id="habitsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6C63FF" />
                <stop offset="100%" stopColor="#00E5A0" />
              </linearGradient>
            </defs>
          </svg>
          <div className="habits-summary-ring-text">
            <span className="ring-count">{progress.completed}</span>
            <span className="ring-label">/{progress.total}</span>
          </div>
        </div>
        <div className="habits-summary-info">
          <h3>Today's Progress</h3>
          <p className="text-muted">{progress.completed} of {progress.total} habits completed today</p>
        </div>
      </div>

      {/* Habits List */}
      {habits.length === 0 ? (
        <div className="glass-card empty-state">
          <span className="empty-icon">🎯</span>
          <span className="empty-title">No habits yet</span>
          <span className="empty-text">Start building your daily habits</span>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
            <HiPlus /> Add First Habit
          </button>
        </div>
      ) : (
        <div className="habits-list stagger-children">
          {habits.map(habit => {
            const streak = getStreak(habit.id);
            const completed = isCompletedToday(habit.id);
            const todayVal = getTodayValue(habit.id);

            return (
              <div key={habit.id} className={`glass-card habit-card ${completed ? 'completed' : ''}`}>
                <div className="habit-card-main">
                  <div
                    className="habit-check-btn"
                    style={{ borderColor: completed ? habit.color : 'var(--glass-border)', background: completed ? habit.color : 'transparent' }}
                    onClick={() => {
                      if (habit.type === 'binary') {
                        completed ? unlogHabit(habit.id) : logHabit(habit.id);
                      } else if (!completed) {
                        logHabit(habit.id, today, 1);
                      }
                    }}
                  >
                    {completed && <span>✓</span>}
                  </div>

                  <div className="habit-info">
                    <div className="habit-name-row">
                      <span className="habit-emoji">{habit.emoji}</span>
                      <span className="habit-name">{habit.name}</span>
                    </div>
                    {habit.type === 'quantitative' && (
                      <div className="habit-quantity">
                        <div className="quantity-controls">
                          <button
                            className="qty-btn"
                            onClick={() => {
                              const newVal = Math.max(0, todayVal - 1);
                              if (newVal === 0) unlogHabit(habit.id);
                              else logHabit(habit.id, today, newVal);
                            }}
                          >−</button>
                          <span className="qty-value">{todayVal}</span>
                          <span className="qty-target">/ {habit.target} {habit.unit}</span>
                          <button
                            className="qty-btn"
                            onClick={() => logHabit(habit.id, today, todayVal + 1)}
                          >+</button>
                        </div>
                        <div className="progress-container" style={{ height: '4px', width: '100%', marginTop: '6px' }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: `${Math.min((todayVal / (habit.target || 1)) * 100, 100)}%`,
                              background: habit.color,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="habit-streak">
                    {streak.current > 0 && (
                      <div className="streak-badge" style={{ color: habit.color }}>
                        <HiFire /> {streak.current}
                      </div>
                    )}
                  </div>

                  <button className="btn btn-icon btn-sm btn-ghost" onClick={() => removeHabit(habit.id)}>
                    <HiTrash />
                  </button>
                </div>

                {/* 7-day dots */}
                <div className="habit-week">
                  {last7Days.map(date => {
                    const done = isCompletedOnDate(habit.id, date);
                    const isToday = date === today;
                    return (
                      <div key={date} className="habit-day">
                        <span className="habit-day-label">
                          {formatDate(date, 'EEE').charAt(0)}
                        </span>
                        <span
                          className={`habit-day-dot ${done ? 'filled' : ''} ${isToday ? 'today' : ''}`}
                          style={done ? { background: habit.color, boxShadow: `0 0 6px ${habit.color}40` } : {}}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Habit Modal */}
      <AddHabitModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(data) => {
          addHabit(data);
          setShowAddModal(false);
        }}
      />
    </div>
  );
}

function AddHabitModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '', emoji: '✅', color: '#6C63FF',
    frequency: 'daily', type: 'binary', target: '', unit: '',
  });
  const [showPresets, setShowPresets] = useState(true);

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <Modal
      isOpen={isOpen} onClose={onClose} title="Add Habit"
      footer={
        !showPresets ? <>
          <button className="btn btn-ghost" onClick={() => setShowPresets(true)}>Back</button>
          <button className="btn btn-primary" onClick={() => { if (formData.name) onAdd(formData); }}>Add</button>
        </> : null
      }
    >
      {showPresets ? (
        <div className="preset-habits">
          <p className="text-muted" style={{ marginBottom: '12px' }}>Choose a preset or create custom:</p>
          <div className="preset-grid">
            {DEFAULT_HABITS.map(h => (
              <button
                key={h.id}
                className="glass-card preset-habit-btn"
                onClick={() => { onAdd(h); }}
              >
                <span className="preset-emoji">{h.emoji}</span>
                <span className="preset-name">{h.name}</span>
              </button>
            ))}
          </div>
          <button
            className="btn btn-ghost w-full"
            style={{ marginTop: '16px' }}
            onClick={() => setShowPresets(false)}
          >
            Create Custom Habit
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label">Name</label>
              <input type="text" className="input-field" placeholder="e.g., Run 5km" value={formData.name} onChange={(e) => updateField('name', e.target.value)} autoFocus />
            </div>
            <div className="input-group">
              <label className="input-label">Emoji</label>
              <input type="text" className="input-field" value={formData.emoji} onChange={(e) => updateField('emoji', e.target.value)} style={{ width: '60px', textAlign: 'center', fontSize: '1.3rem' }} />
            </div>
          </div>
          <div className="input-group">
            <label className="input-label">Color</label>
            <input type="color" value={formData.color} onChange={(e) => updateField('color', e.target.value)} style={{ width: '50px', height: '36px', cursor: 'pointer', border: 'none', borderRadius: '8px' }} />
          </div>
          <div className="input-group">
            <label className="input-label">Type</label>
            <div className="toggle-group">
              <button className={`toggle-btn ${formData.type === 'binary' ? 'active income' : ''}`} onClick={() => updateField('type', 'binary')}>Done / Not Done</button>
              <button className={`toggle-btn ${formData.type === 'quantitative' ? 'active income' : ''}`} onClick={() => updateField('type', 'quantitative')}>Quantity</button>
            </div>
          </div>
          {formData.type === 'quantitative' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="input-group">
                <label className="input-label">Target</label>
                <input type="number" className="input-field" placeholder="8" value={formData.target} onChange={(e) => updateField('target', parseInt(e.target.value))} />
              </div>
              <div className="input-group">
                <label className="input-label">Unit</label>
                <input type="text" className="input-field" placeholder="glasses" value={formData.unit} onChange={(e) => updateField('unit', e.target.value)} />
              </div>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
