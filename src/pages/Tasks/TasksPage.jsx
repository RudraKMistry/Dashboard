import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { HiPlus, HiTrash, HiViewBoards, HiViewList, HiClock, HiPlay, HiPause, HiRefresh } from 'react-icons/hi';
import { AnimatePresence, motion } from 'framer-motion';
import { useTasks, useSettings, useHabits } from '../../hooks/useData';
import { TASK_CATEGORIES, PRIORITIES, TASK_STATUSES } from '../../lib/constants';
import { formatDate, formatTimer, getTodayISO } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import './TasksPage.css';

export default function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeView = searchParams.get('view') || 'list';
  const setActiveView = (view) => setSearchParams({ view });

  const [showAddModal, setShowAddModal] = useState(false);
  const { tasks, addTask, updateTask, removeTask, toggleComplete, moveTask, getByStatus } = useTasks();
  const { settings } = useSettings();

  return (
    <div className="tasks-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>📋 Tasks</h1>
          <p className="page-subtitle">Manage your to-dos, kanban board, and focus timer</p>
        </div>
      </div>

      {/* View Switcher */}
      <div className="tab-nav">
        <button className={activeView === 'list' ? 'active' : ''} onClick={() => setActiveView('list')}>
          <HiViewList style={{ marginRight: 4 }} /> List
        </button>
        <button className={activeView === 'kanban' ? 'active' : ''} onClick={() => setActiveView('kanban')}>
          <HiViewBoards style={{ marginRight: 4 }} /> Kanban
        </button>
        <button className={activeView === 'pomodoro' ? 'active' : ''} onClick={() => setActiveView('pomodoro')}>
          <HiClock style={{ marginRight: 4 }} /> Pomodoro
        </button>
      </div>

      {/* List View */}
      {activeView === 'list' && (
        <div className="animate-fadeInUp">
          <div className="tab-header">
            <h3>{tasks.filter(t => t.status !== 'done').length} active tasks</h3>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <HiPlus /> Add Task
            </button>
          </div>
          {tasks.length === 0 ? (
            <div className="glass-card empty-state">
              <span className="empty-icon">✅</span>
              <span className="empty-title">No tasks yet</span>
              <span className="empty-text">Add your first task to get started</span>
              <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
                <HiPlus /> Add Task
              </button>
            </div>
          ) : (
            <div className="task-list">
              <AnimatePresence>
                {[...tasks].sort((a, b) => {
                  if (a.status === 'done' && b.status !== 'done') return 1;
                  if (a.status !== 'done' && b.status === 'done') return -1;
                  const pOrder = { high: 0, medium: 1, low: 2 };
                  return (pOrder[a.priority] || 1) - (pOrder[b.priority] || 1);
                }).map(task => {
                  const cat = TASK_CATEGORIES.find(c => c.id === task.category);
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true, amount: 0.1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={task.id} 
                      className={`glass-card task-item ${task.status === 'done' ? 'done' : ''}`}
                    >
                      <div className="checkbox-wrapper" onClick={() => toggleComplete(task.id)}>
                        <input type="checkbox" checked={task.status === 'done'} readOnly />
                      </div>
                      <div className="task-content">
                        <span className="task-title">{task.title}</span>
                        <div className="task-meta">
                          {cat && <span className="badge badge-category">{cat.emoji} {cat.name}</span>}
                          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                          {task.dueDate && (
                            <span className="task-due">{formatDate(task.dueDate, 'MMM dd')}</span>
                          )}
                        </div>
                      </div>
                      <button className="btn btn-icon btn-sm btn-ghost" onClick={() => removeTask(task.id)}>
                        <HiTrash />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      )}

      {/* Kanban View */}
      {activeView === 'kanban' && (
        <div className="kanban-wrapper animate-fadeInUp">
          <div className="tab-header">
            <h3>Kanban Board</h3>
            <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
              <HiPlus /> Add Task
            </button>
          </div>
          <div className="kanban-board">
            {TASK_STATUSES.map(status => (
              <KanbanColumn
                key={status.id}
                status={status}
                tasks={getByStatus(status.id)}
                onMoveTask={moveTask}
                onRemoveTask={removeTask}
              />
            ))}
          </div>
        </div>
      )}

      {/* Pomodoro View */}
      {activeView === 'pomodoro' && (
        <PomodoroTimer settings={settings} tasks={tasks.filter(t => t.status !== 'done')} />
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addTask}
      />
    </div>
  );
}

// ── Kanban Column ──────────────────────────
function KanbanColumn({ status, tasks, onMoveTask, onRemoveTask }) {
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const taskId = e.dataTransfer.getData('text/plain');
    onMoveTask(taskId, status.id);
  };

  const statusColors = { todo: 'var(--accent-blue)', in_progress: 'var(--accent-orange)', done: 'var(--accent-green)' };

  return (
    <div
      className="kanban-column"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="kanban-column-header">
        <span className="kanban-column-dot" style={{ background: statusColors[status.id] }} />
        <span className="kanban-column-title">{status.name}</span>
        <span className="kanban-column-count">{tasks.length}</span>
      </div>
      <div className="kanban-column-body">
        {tasks.map(task => {
          const cat = TASK_CATEGORIES.find(c => c.id === task.category);
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.3 }}
              className="glass-card kanban-card"
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', task.id);
                e.currentTarget.classList.add('dragging');
              }}
              onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
            >
              <span className="kanban-card-title">{task.title}</span>
              <div className="kanban-card-meta">
                <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                {cat && <span className="badge badge-category">{cat.emoji}</span>}
              </div>
              {task.dueDate && (
                <span className="kanban-card-due">{formatDate(task.dueDate, 'MMM dd')}</span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Pomodoro Timer ─────────────────────────
function PomodoroTimer({ settings, tasks }) {
  const { habits, addHabit, logHabit } = useHabits();
  const [workMinutes, setWorkMinutes] = useState(settings?.pomodoroWork || 25);
  const [breakMinutes, setBreakMinutes] = useState(settings?.pomodoroBreak || 5);
  const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [selectedTask, setSelectedTask] = useState('');
  const intervalRef = useRef(null);

  const totalTime = isBreak ? breakMinutes * 60 : workMinutes * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 140;

  useEffect(() => {
    setTimeLeft(workMinutes * 60);
  }, [workMinutes]);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current);
      
      const notify = (title, body) => {
        const shouldNotify = settings?.notifications !== false; // Default to true if undefined
        if (!shouldNotify) return;
        if (!('Notification' in window)) return;
        if (Notification.permission === 'granted') {
          try {
            new Notification(title, { body });
          } catch (e) {
            if (navigator.serviceWorker) {
              navigator.serviceWorker.ready.then(reg => {
                reg.showNotification(title, { body });
              });
            }
          }
        }
      };

      if (!isBreak) {
        setSessions(prev => prev + 1);
        notify('🍅 Pomodoro Complete!', 'Time for a break!');
        
        // Auto-log Deep Work habit
        let deepWorkHabit = habits.find(h => h.name === 'Deep Work');
        const todayStr = getTodayISO();
        if (!deepWorkHabit) {
          deepWorkHabit = addHabit({ name: 'Deep Work', emoji: '🧠', color: '#6C63FF' });
        }
        logHabit(deepWorkHabit.id, todayStr, 1);

        setIsBreak(true);
        setTimeLeft(breakMinutes * 60);
        setIsRunning(false);
      } else {
        notify('☕ Break Over!', 'Ready to focus again?');
        setIsBreak(false);
        setTimeLeft(workMinutes * 60);
        setIsRunning(false);
      }
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft, isBreak, workMinutes, breakMinutes]);

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setTimeLeft(workMinutes * 60);
    clearInterval(intervalRef.current);
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="pomodoro-wrapper animate-fadeInUp">
      <div className="glass-card pomodoro-card">
        <div className="pomodoro-status">
          <span className={`pomodoro-mode ${isBreak ? 'break' : 'work'}`}>
            {isBreak ? '☕ Break' : '🍅 Focus'}
          </span>
          <span className="pomodoro-sessions">{sessions} sessions completed</span>
        </div>

        <div className="pomodoro-timer">
          <svg className="pomodoro-ring" viewBox="0 0 300 300">
            <circle cx="150" cy="150" r="140" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="150" cy="150" r="140" fill="none"
              stroke={isBreak ? 'var(--accent-green)' : 'var(--accent-primary)'}
              strokeWidth="8" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress / 100)}
              transform="rotate(-90 150 150)"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>
          <div className="pomodoro-time-display">
            <span className="pomodoro-time">{formatTimer(timeLeft)}</span>
            <span className="pomodoro-time-label">{isBreak ? 'Break time' : 'Stay focused'}</span>
          </div>
        </div>

        <div className="pomodoro-controls">
          <button className="btn btn-ghost btn-icon" onClick={reset} title="Reset">
            <HiRefresh />
          </button>
          <button
            className={`btn ${isRunning ? 'btn-danger' : 'btn-primary'} btn-lg pomodoro-play`}
            onClick={() => {
              requestNotificationPermission();
              setIsRunning(!isRunning);
            }}
          >
            {isRunning ? <HiPause /> : <HiPlay />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <div style={{ width: 38 }} />
        </div>

        {/* Settings */}
        <div className="pomodoro-settings">
          <div className="pomo-setting">
            <label>Work</label>
            <input
              type="number"
              className="input-field"
              value={workMinutes}
              onChange={(e) => {
                setWorkMinutes(parseInt(e.target.value) || 25);
                if (!isRunning && !isBreak) setTimeLeft((parseInt(e.target.value) || 25) * 60);
              }}
              min="1" max="120"
            />
            <span>min</span>
          </div>
          <div className="pomo-setting">
            <label>Break</label>
            <input
              type="number"
              className="input-field"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 5)}
              min="1" max="60"
            />
            <span>min</span>
          </div>
        </div>

        {/* Task Selector */}
        {tasks.length > 0 && (
          <div className="pomodoro-task-select">
            <label className="input-label">Working on:</label>
            <select
              className="input-field"
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
            >
              <option value="">No specific task</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Add Task Modal ─────────────────────────
function AddTaskModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'medium',
    category: 'personal', status: 'todo', dueDate: '',
    isRecurring: false, recurrenceRule: '',
  });

  const handleSubmit = () => {
    if (formData.title.trim()) {
      onAdd(formData);
      setFormData({ title: '', description: '', priority: 'medium', category: 'personal', status: 'todo', dueDate: '', isRecurring: false, recurrenceRule: '' });
      onClose();
    }
  };

  const updateField = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  return (
    <Modal
      isOpen={isOpen} onClose={onClose} title="Add Task"
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Add Task</button>
      </>}
    >
      <div className="input-group">
        <label className="input-label">Title</label>
        <input type="text" className="input-field" placeholder="What needs to be done?" value={formData.title} onChange={(e) => updateField('title', e.target.value)} autoFocus />
      </div>
      <div className="input-group">
        <label className="input-label">Description</label>
        <textarea className="input-field" placeholder="Details (optional)" value={formData.description} onChange={(e) => updateField('description', e.target.value)} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="input-group">
          <label className="input-label">Priority</label>
          <select className="input-field" value={formData.priority} onChange={(e) => updateField('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="input-group">
          <label className="input-label">Category</label>
          <select className="input-field" value={formData.category} onChange={(e) => updateField('category', e.target.value)}>
            {TASK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
          </select>
        </div>
      </div>
      <div className="input-group">
        <label className="input-label">Due Date</label>
        <input type="date" className="input-field" value={formData.dueDate} onChange={(e) => updateField('dueDate', e.target.value)} />
      </div>
      <div className="checkbox-wrapper" onClick={() => updateField('isRecurring', !formData.isRecurring)}>
        <input type="checkbox" checked={formData.isRecurring} readOnly />
        <span>Recurring task</span>
      </div>
      {formData.isRecurring && (
        <div className="input-group">
          <label className="input-label">Repeat</label>
          <select className="input-field" value={formData.recurrenceRule} onChange={(e) => updateField('recurrenceRule', e.target.value)}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}
    </Modal>
  );
}
