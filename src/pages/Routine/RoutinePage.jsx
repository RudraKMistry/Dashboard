import { useState, useEffect } from 'react';
import { HiPlus, HiTrash, HiPencil, HiCheck } from 'react-icons/hi';
import { useRoutine, useHabits } from '../../hooks/useData';
import { DEFAULT_ROUTINE } from '../../lib/constants';
import { getTodayISO, formatDate, percentage } from '../../lib/utils';
import Modal from '../../components/ui/Modal';
import './RoutinePage.css';

export default function RoutinePage() {
  const { template, logs, saveTemplate, toggleRoutineItem, isItemCompleted, getDayProgress } = useRoutine();
  const { habits, addHabit, logHabit } = useHabits();
  const [routineData, setRoutineData] = useState(template?.blocks || DEFAULT_ROUTINE);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addTarget, setAddTarget] = useState({ blockId: '', isOneOff: false });

  const today = getTodayISO();
  const progress = getDayProgress(today);

  // Save default template if none exists
  useEffect(() => {
    if (!template) {
      saveTemplate(DEFAULT_ROUTINE);
    }
  }, []);

  const handleToggle = (blockId, itemId) => {
    toggleRoutineItem(blockId, itemId, today);
    
    // Auto-log habit if the entire routine block is now completed
    setTimeout(() => {
      const blockItems = routineData[blockId]?.items || [];
      if (blockItems.length === 0) return;
      
      const allOthersDone = blockItems.filter(i => i.id !== itemId).every(i => isItemCompleted(blockId, i.id, today));
      const isThisNowDone = !isItemCompleted(blockId, itemId, today); // toggle state before flip
      
      if (allOthersDone && isThisNowDone) {
        const habitName = blockId === 'morning' ? 'Morning Routine' : 
                         blockId === 'afternoon' ? 'Afternoon Routine' : 
                         blockId === 'evening' ? 'Evening Routine' : 'Night Routine';
                         
        let routineHabit = habits.find(h => h.name === habitName);
        if (!routineHabit) {
          routineHabit = addHabit({ name: habitName, emoji: '🌅', color: '#FFB347' });
        }
        logHabit(routineHabit.id, today, 1);
      }
    }, 50);
  };

  const addItemToBlock = (blockId, text, time) => {
    const newRoutine = { ...routineData };
    const newItem = { id: `custom_${Date.now()}`, text, time: time || '' };
    newRoutine[blockId] = {
      ...newRoutine[blockId],
      items: [...(newRoutine[blockId].items || []), newItem],
    };
    setRoutineData(newRoutine);
    saveTemplate(newRoutine);
  };

  const removeItemFromBlock = (blockId, itemId) => {
    const newRoutine = { ...routineData };
    newRoutine[blockId] = {
      ...newRoutine[blockId],
      items: newRoutine[blockId].items.filter(i => i.id !== itemId),
    };
    setRoutineData(newRoutine);
    saveTemplate(newRoutine);
  };

  const blockOrder = ['morning', 'afternoon', 'evening', 'night'];

  return (
    <div className="routine-page animate-fadeIn">
      <div className="page-header">
        <div>
          <h1>🌅 Daily Routine</h1>
          <p className="page-subtitle">{formatDate(new Date(), 'EEEE, MMMM do')} — {progress.completed}/{progress.total} completed</p>
        </div>
        <button
          className={`btn ${isEditing ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? <><HiCheck /> Done</> : <><HiPencil /> Edit</>}
        </button>
      </div>

      {/* Overall Progress */}
      <div className="glass-card routine-overview">
        <div className="routine-overview-text">
          <span className="routine-overview-pct">
            {progress.total > 0 ? percentage(progress.completed, progress.total) : 0}%
          </span>
          <span className="text-muted">of today's routine completed</span>
        </div>
        <div className="progress-container" style={{ height: '10px' }}>
          <div
            className="progress-bar progress-purple"
            style={{ width: `${progress.total > 0 ? percentage(progress.completed, progress.total) : 0}%` }}
          />
        </div>
      </div>

      {/* Routine Blocks */}
      <div className="routine-blocks stagger-children">
        {blockOrder.map(blockId => {
          const block = routineData[blockId];
          if (!block) return null;
          const blockCompleted = (block.items || []).filter(item => isItemCompleted(blockId, item.id, today)).length;
          const blockTotal = (block.items || []).length;

          return (
            <div key={blockId} className="glass-card routine-block">
              <div className="routine-block-header">
                <div className="routine-block-title">
                  <span className="routine-block-emoji">{block.emoji}</span>
                  <h3>{block.label}</h3>
                  <span className="routine-block-count">{blockCompleted}/{blockTotal}</span>
                </div>
                {isEditing && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setAddTarget({ blockId, isOneOff: false });
                      setShowAddModal(true);
                    }}
                  >
                    <HiPlus /> Add
                  </button>
                )}
              </div>

              <div className="progress-container" style={{ height: '4px', marginBottom: '16px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${blockTotal > 0 ? percentage(blockCompleted, blockTotal) : 0}%`,
                    background: block.color,
                  }}
                />
              </div>

              <div className="routine-items">
                {(block.items || []).map(item => {
                  const completed = isItemCompleted(blockId, item.id, today);
                  return (
                    <div key={item.id} className={`routine-item ${completed ? 'completed' : ''}`}>
                      <div
                        className="checkbox-wrapper"
                        onClick={() => handleToggle(blockId, item.id)}
                      >
                        <input type="checkbox" checked={completed} readOnly />
                      </div>
                      <span className="routine-item-text">{item.text}</span>
                      {item.time && <span className="routine-item-time">{item.time}</span>}
                      {isEditing && (
                        <button
                          className="btn btn-icon btn-sm btn-ghost"
                          onClick={() => removeItemFromBlock(blockId, item.id)}
                        >
                          <HiTrash />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Item Modal */}
      <AddRoutineItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={(text, time) => {
          addItemToBlock(addTarget.blockId, text, time);
          setShowAddModal(false);
        }}
        blockLabel={routineData[addTarget.blockId]?.label || ''}
      />
    </div>
  );
}

function AddRoutineItemModal({ isOpen, onClose, onAdd, blockLabel }) {
  const [text, setText] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = () => {
    if (text.trim()) {
      onAdd(text.trim(), time.trim());
      setText('');
      setTime('');
    }
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose} title={`Add to ${blockLabel}`}
      footer={<>
        <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Add</button>
      </>}
    >
      <div className="input-group">
        <label className="input-label">What to do</label>
        <input type="text" className="input-field" placeholder="e.g., Stretch for 10 min" value={text} onChange={(e) => setText(e.target.value)} autoFocus onKeyDown={(e) => e.key === 'Enter' && handleSubmit()} />
      </div>
      <div className="input-group">
        <label className="input-label">Time (optional)</label>
        <input type="text" className="input-field" placeholder="e.g., 7:30 AM" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
    </Modal>
  );
}
