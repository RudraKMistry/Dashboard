import { useState, useMemo } from 'react';
import { HiPlus, HiTrash, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { useNotes } from '../../hooks/useData';
import { MOOD_OPTIONS } from '../../lib/constants';
import { getTodayISO, formatDate } from '../../lib/utils';
import './NotesPage.css';

export default function NotesPage() {
  const { notes, addNote, updateNote, removeNote, getTodayNote, getByDate } = useNotes();
  const [selectedDate, setSelectedDate] = useState(getTodayISO());
  const [isEditing, setIsEditing] = useState(false);

  const currentNote = useMemo(() => getByDate(selectedDate), [notes, selectedDate]);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editMood, setEditMood] = useState(null);

  const startEditing = () => {
    setEditTitle(currentNote?.title || '');
    setEditContent(currentNote?.content || '');
    setEditMood(currentNote?.mood || null);
    setIsEditing(true);
  };

  const saveNote = () => {
    if (currentNote) {
      updateNote(currentNote.id, { title: editTitle, content: editContent, mood: editMood });
    } else {
      addNote({ title: editTitle, content: editContent, date: selectedDate, mood: editMood });
    }
    setIsEditing(false);
  };

  const navigateDate = (direction) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + direction);
    setSelectedDate(d.toISOString().split('T')[0]);
    setIsEditing(false);
  };

  // Get notes with content for the sidebar
  const notesWithContent = useMemo(() => {
    return [...notes].filter(n => n.content || n.title).sort((a, b) => b.date.localeCompare(a.date));
  }, [notes]);

  return (
    <div className="notes-page animate-fadeIn">
      <div className="page-header">
        <h1>📝 Journal</h1>
        <p className="page-subtitle">Daily reflections, notes, and mood tracking</p>
      </div>

      <div className="notes-layout">
        {/* Notes Sidebar */}
        <div className="glass-card notes-sidebar">
          <h4>Recent Entries</h4>
          <div className="notes-list">
            {notesWithContent.length === 0 ? (
              <p className="text-muted" style={{ padding: '16px', fontSize: 'var(--font-size-sm)' }}>No journal entries yet</p>
            ) : (
              notesWithContent.map(note => {
                const mood = MOOD_OPTIONS.find(m => m.value === note.mood);
                return (
                  <div
                    key={note.id}
                    className={`note-list-item ${note.date === selectedDate ? 'active' : ''}`}
                    onClick={() => { setSelectedDate(note.date); setIsEditing(false); }}
                  >
                    <div className="note-list-date">
                      {mood && <span>{mood.emoji}</span>}
                      <span>{formatDate(note.date, 'MMM dd')}</span>
                    </div>
                    <span className="note-list-title">{note.title || 'Untitled'}</span>
                    <span className="note-list-preview">
                      {(note.content || '').substring(0, 60)}{note.content?.length > 60 ? '...' : ''}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="glass-card note-editor">
          {/* Date Navigation */}
          <div className="note-date-nav">
            <button className="btn btn-icon btn-ghost" onClick={() => navigateDate(-1)}>
              <HiChevronLeft />
            </button>
            <div className="note-date-display">
              <h3>{formatDate(selectedDate, 'EEEE, MMMM do, yyyy')}</h3>
              {selectedDate === getTodayISO() && <span className="badge badge-purple">Today</span>}
            </div>
            <button className="btn btn-icon btn-ghost" onClick={() => navigateDate(1)}>
              <HiChevronRight />
            </button>
          </div>

          {/* Mood Selector */}
          <div className="mood-selector">
            <span className="mood-label">How are you feeling?</span>
            <div className="mood-options">
              {MOOD_OPTIONS.map(mood => (
                <button
                  key={mood.value}
                  className={`mood-btn ${(isEditing ? editMood : currentNote?.mood) === mood.value ? 'active' : ''}`}
                  onClick={() => {
                    if (isEditing) {
                      setEditMood(mood.value);
                    } else {
                      startEditing();
                      setEditMood(mood.value);
                    }
                  }}
                  title={mood.label}
                  style={
                    (isEditing ? editMood : currentNote?.mood) === mood.value
                      ? { borderColor: mood.color, background: `${mood.color}20` }
                      : {}
                  }
                >
                  <span className="mood-emoji">{mood.emoji}</span>
                  <span className="mood-text">{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="note-edit-area">
              <input
                type="text"
                className="note-title-input"
                placeholder="Title for today's entry..."
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                autoFocus
              />
              <textarea
                className="note-content-input"
                placeholder="What's on your mind? Write about your day, thoughts, goals, gratitudes..."
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
              <div className="note-edit-actions">
                <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={saveNote}>Save Entry</button>
              </div>
            </div>
          ) : (
            <div className="note-view-area">
              {currentNote ? (
                <>
                  {currentNote.title && <h2 className="note-view-title">{currentNote.title}</h2>}
                  <div className="note-view-content">
                    {currentNote.content.split('\n').map((line, i) => (
                      <p key={i}>{line || <br />}</p>
                    ))}
                  </div>
                  <div className="note-view-actions">
                    <button className="btn btn-ghost" onClick={startEditing}>Edit</button>
                    <button className="btn btn-ghost" style={{ color: 'var(--accent-red)' }} onClick={() => { removeNote(currentNote.id); }}>
                      <HiTrash /> Delete
                    </button>
                  </div>
                </>
              ) : (
                <div className="note-empty">
                  <span className="note-empty-icon">✍️</span>
                  <p>No entry for this day</p>
                  <button className="btn btn-primary" onClick={startEditing}>
                    <HiPlus /> Write Entry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
