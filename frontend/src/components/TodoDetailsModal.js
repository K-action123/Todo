import { useState, useEffect } from 'react';
import { theme, PRIORITIES } from '../theme';

export default function TodoDetailsModal({ open, todo, onClose, onUpdateTodo }) {
  const [description, setDescription]     = useState('');
  const [subtaskInput, setSubtaskInput]   = useState('');
  const [localSubtasks, setLocalSubtasks] = useState([]);
  const [saving, setSaving]               = useState(false);
  const [savedMsg, setSavedMsg]           = useState(false);

  // Sync state when todo changes
  useEffect(() => {
    if (todo) {
      setDescription(todo.description || '');
      setLocalSubtasks(todo.subtasks || []);
    }
  }, [todo]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (open) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !todo) return null;

  const p = PRIORITIES[todo.priority] || PRIORITIES.medium;

  // ── Save description on blur ─────────────────
  const handleDescriptionBlur = async () => {
    if (description.trim() === (todo.description || '').trim()) return;
    setSaving(true);
    await onUpdateTodo(todo._id, { description: description.trim() });
    setSaving(false);
    flashSaved();
  };

  const flashSaved = () => {
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 1800);
  };

  // ── Add subtask ──────────────────────────────
  const handleAddSubtask = async () => {
    if (!subtaskInput.trim()) return;
    const updated = [
      ...localSubtasks,
      { subtaskText: subtaskInput.trim(), isCompleted: false }
    ];
    setLocalSubtasks(updated);
    setSubtaskInput('');
    await onUpdateTodo(todo._id, { subtasks: updated });
  };

  // ── Toggle subtask ───────────────────────────
  const handleToggleSubtask = async (idx) => {
    const updated = localSubtasks.map((s, i) =>
      i === idx ? { ...s, isCompleted: !s.isCompleted } : s
    );
    setLocalSubtasks(updated);
    await onUpdateTodo(todo._id, { subtasks: updated });
  };

  // ── Delete subtask ───────────────────────────
  const handleDeleteSubtask = async (idx) => {
    const updated = localSubtasks.filter((_, i) => i !== idx);
    setLocalSubtasks(updated);
    await onUpdateTodo(todo._id, { subtasks: updated });
  };

  const doneCount = localSubtasks.filter(s => s.isCompleted).length;

  return (
    <>
      {/* ── Backdrop ── */}
      <div onClick={onClose} style={s.backdrop} />

      {/* ── Modal ── */}
      <div style={s.modal}>

        {/* Header */}
        <div style={{ ...s.modalHeader, borderBottom: `3px solid ${p.text}` }}>
          <div style={s.headerLeft}>
            {/* Priority badge */}
            <span style={{ ...s.priorityBadge, background: p.bg, color: p.text, borderColor: p.text }}>
              {p.dot} {p.label}
            </span>
            {/* Completed badge */}
            {todo.completed && (
              <span style={s.doneBadge}>✓ Completed</span>
            )}
          </div>
          <button onClick={onClose} style={s.closeBtn} title="Close (Esc)">✕</button>
        </div>

        {/* Task title */}
        <div style={s.titleSection}>
          <h2 style={{
            ...s.taskTitle,
            textDecoration: todo.completed ? 'line-through' : 'none',
            color: todo.completed ? theme.colors.textMuted : theme.colors.navy,
          }}>
            {todo.task}
          </h2>
          <span style={s.dateText}>
            Created {new Date(todo.createdAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </span>
        </div>

        {/* Scrollable body */}
        <div style={s.body}>

          {/* ── Description ── */}
          <section style={s.section}>
            <div style={s.sectionHeader}>
              <span style={s.sectionIcon}>📝</span>
              <span style={s.sectionTitle}>Description</span>
              {saving && <span style={s.savingText}>Saving...</span>}
              {savedMsg && <span style={s.savedText}>✓ Saved</span>}
            </div>
            <textarea
              style={s.textarea}
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Add a detailed description for this task..."
              rows={3}
            />
          </section>

          {/* ── Subtasks ── */}
          <section style={s.section}>
            <div style={s.sectionHeader}>
              <span style={s.sectionIcon}>📋</span>
              <span style={s.sectionTitle}>Subtasks</span>
              {localSubtasks.length > 0 && (
                <span style={s.subtaskCount}>
                  {doneCount}/{localSubtasks.length}
                </span>
              )}
            </div>

            {/* Progress bar */}
            {localSubtasks.length > 0 && (
              <div style={s.progressBg}>
                <div style={{
                  ...s.progressFill,
                  width: `${(doneCount / localSubtasks.length) * 100}%`,
                  background: p.text,
                }} />
              </div>
            )}

            {/* Subtask items */}
            {localSubtasks.length === 0 ? (
              <p style={s.emptySubtasks}>No subtasks yet. Add one below!</p>
            ) : (
              <ul style={s.subtaskList}>
                {localSubtasks.map((sub, i) => (
                  <li key={i} style={s.subtaskItem}>
                    {/* Toggle checkbox */}
                    <button
                      onClick={() => handleToggleSubtask(i)}
                      style={{
                        ...s.subCheckbox,
                        background:  sub.isCompleted ? theme.colors.steel : 'transparent',
                        borderColor: sub.isCompleted ? theme.colors.steel : theme.colors.border,
                      }}
                    >
                      {sub.isCompleted && <span style={s.checkmark}>✓</span>}
                    </button>

                    {/* Subtask text */}
                    <span style={{
                      ...s.subText,
                      textDecoration: sub.isCompleted ? 'line-through' : 'none',
                      color: sub.isCompleted ? theme.colors.textMuted : theme.colors.textSecondary,
                    }}>
                      {sub.subtaskText}
                    </span>

                    {/* Delete subtask */}
                    <button
                      onClick={() => handleDeleteSubtask(i)}
                      style={s.subDeleteBtn}
                      title="Remove subtask"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Add subtask input */}
            <div style={s.addSubRow}>
              <input
                style={s.subInput}
                placeholder="New subtask..."
                value={subtaskInput}
                onChange={e => setSubtaskInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSubtask()}
              />
              <button
                onClick={handleAddSubtask}
                disabled={!subtaskInput.trim()}
                style={{
                  ...s.addSubBtn,
                  opacity: subtaskInput.trim() ? 1 : 0.45,
                  cursor:  subtaskInput.trim() ? 'pointer' : 'not-allowed',
                }}
              >
                ＋ Add
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div style={s.footer}>
          <button onClick={onClose} style={s.closeFooterBtn}>
            Done
          </button>
        </div>
      </div>
    </>
  );
}

// ── Styles ────────────────────────────────────
const s = {
  backdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(56, 73, 89, 0.45)',
    backdropFilter: 'blur(3px)',
    zIndex: 100,
    animation: 'fadeIn 0.2s ease',
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: '540px',
    maxHeight: '85vh',
    background: theme.colors.cardBg,
    borderRadius: theme.radius.xl,
    boxShadow: `0 24px 64px rgba(56,73,89,0.22)`,
    zIndex: 101,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    animation: 'slideUp 0.22s ease',
    fontFamily: theme.font.sans,
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem 0.75rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  priorityBadge: {
    padding: '0.22rem 0.75rem',
    borderRadius: theme.radius.full,
    border: '1.5px solid',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
  doneBadge: {
    padding: '0.22rem 0.65rem',
    borderRadius: theme.radius.full,
    background: '#eafaf1',
    border: '1.5px solid #a9dfbf',
    color: '#1e8449',
    fontSize: '0.72rem',
    fontWeight: '700',
  },
  closeBtn: {
    background: theme.colors.sky,
    border: 'none',
    borderRadius: theme.radius.sm,
    cursor: 'pointer',
    color: theme.colors.navy,
    fontSize: '0.85rem',
    fontWeight: '700',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleSection: {
    padding: '0.75rem 1.25rem 0.5rem',
    borderBottom: `1px solid ${theme.colors.border}`,
  },
  taskTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    lineHeight: 1.35,
    marginBottom: '0.25rem',
  },
  dateText: {
    fontSize: '0.72rem',
    color: theme.colors.textMuted,
  },
  body: {
    overflowY: 'auto',
    flex: 1,
    padding: '1rem 1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  sectionIcon: { fontSize: '0.9rem' },
  sectionTitle: {
    fontSize: '0.78rem',
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  savingText: {
    marginLeft: 'auto',
    fontSize: '0.72rem',
    color: theme.colors.steel,
    fontStyle: 'italic',
  },
  savedText: {
    marginLeft: 'auto',
    fontSize: '0.72rem',
    color: '#1e8449',
    fontWeight: '600',
  },
  textarea: {
    width: '100%',
    padding: '0.7rem 0.9rem',
    border: `1.5px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    fontSize: '0.88rem',
    resize: 'vertical',
    outline: 'none',
    fontFamily: theme.font.sans,
    color: theme.colors.textPrimary,
    background: theme.colors.inputBg,
    boxSizing: 'border-box',
    lineHeight: 1.5,
    transition: 'border-color 0.2s',
  },
  progressBg: {
    height: '5px',
    background: theme.colors.sky,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.full,
    transition: 'width 0.3s ease',
  },
  subtaskCount: {
    marginLeft: 'auto',
    fontSize: '0.72rem',
    fontWeight: '700',
    color: theme.colors.steel,
    background: theme.colors.sky,
    padding: '1px 8px',
    borderRadius: theme.radius.full,
  },
  emptySubtasks: {
    color: theme.colors.textMuted,
    fontSize: '0.82rem',
    fontStyle: 'italic',
    padding: '0.5rem 0',
  },
  subtaskList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
  },
  subtaskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.4rem 0.6rem',
    borderRadius: theme.radius.md,
    background: theme.colors.inputBg,
    border: `1px solid ${theme.colors.border}`,
  },
  subCheckbox: {
    width: '18px',
    height: '18px',
    minWidth: '18px',
    borderRadius: '4px',
    border: '2px solid',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s',
    flexShrink: 0,
  },
  checkmark: {
    color: '#fff',
    fontSize: '0.6rem',
    fontWeight: '800',
  },
  subText: {
    flex: 1,
    fontSize: '0.85rem',
    lineHeight: 1.3,
  },
  subDeleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: theme.colors.textMuted,
    fontSize: '0.72rem',
    padding: '2px 4px',
    borderRadius: '4px',
    flexShrink: 0,
    transition: 'color 0.15s',
  },
  addSubRow: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  subInput: {
    flex: 1,
    padding: '0.55rem 0.8rem',
    border: `1.5px solid ${theme.colors.border}`,
    borderRadius: theme.radius.md,
    fontSize: '0.85rem',
    outline: 'none',
    fontFamily: theme.font.sans,
    color: theme.colors.textPrimary,
    background: theme.colors.inputBg,
  },
  addSubBtn: {
    padding: '0.55rem 1rem',
    background: theme.colors.sky,
    border: `1.5px solid ${theme.colors.cornflower}`,
    borderRadius: theme.radius.md,
    fontSize: '0.82rem',
    fontWeight: '700',
    color: theme.colors.navy,
    fontFamily: theme.font.sans,
    whiteSpace: 'nowrap',
    transition: 'opacity 0.15s',
  },
  footer: {
    padding: '0.85rem 1.25rem',
    borderTop: `1px solid ${theme.colors.border}`,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  closeFooterBtn: {
    padding: '0.55rem 1.75rem',
    background: `linear-gradient(135deg, ${theme.colors.steel}, ${theme.colors.navy})`,
    color: '#fff',
    border: 'none',
    borderRadius: theme.radius.md,
    fontSize: '0.88rem',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: theme.font.sans,
  },
};