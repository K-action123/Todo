import { useState } from 'react';
import { theme, PRIORITIES } from '../theme';

export default function TaskInputForm({ onAdd }) {
  const [task, setTask]             = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority]     = useState('medium');
  const [subtaskInput, setSubtaskInput] = useState('');
  const [subtasks, setSubtasks]     = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [focused, setFocused]       = useState('');

  const addSubtask = () => {
    if (!subtaskInput.trim()) return;
    setSubtasks([...subtasks, { subtaskText: subtaskInput.trim(), isCompleted: false }]);
    setSubtaskInput('');
  };

  const removeSubtask = (i) => setSubtasks(subtasks.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    if (!task.trim() || submitting) return;
    setSubmitting(true);
    try {
      await onAdd({ task, description, priority, subtasks });
      setTask(''); setDescription(''); setPriority('medium'); setSubtasks([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={s.card}>
      {/* Card header */}
      <div style={s.cardHeader}>
        <div style={s.headerDot} />
        <span style={s.cardTitle}>New Task</span>
      </div>

      {/* Task name */}
      <input
        style={{ ...s.input, borderColor: focused === 'task' ? theme.colors.cornflower : theme.colors.border }}
        placeholder="What needs to be done?"
        value={task}
        onChange={e => setTask(e.target.value)}
        onFocus={() => setFocused('task')}
        onBlur={() => setFocused('')}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />

      {/* Description */}
      <textarea
        style={{ ...s.textarea, borderColor: focused === 'desc' ? theme.colors.cornflower : theme.colors.border }}
        placeholder="Add a description (optional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        onFocus={() => setFocused('desc')}
        onBlur={() => setFocused('')}
        rows={2}
      />

      {/* Priority selector */}
      <div style={s.priorityRow}>
        <span style={s.priorityLabel}>Priority</span>
        <div style={s.priorityBtns}>
          {Object.entries(PRIORITIES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setPriority(key)}
              style={{
                ...s.pBtn,
                background:   priority === key ? val.bg     : 'transparent',
                borderColor:  priority === key ? val.text   : theme.colors.border,
                color:        priority === key ? val.text   : theme.colors.textMuted,
                fontWeight:   priority === key ? '700'      : '500',
                transform:    priority === key ? 'scale(1.06)' : 'scale(1)',
                boxShadow:    priority === key ? `0 2px 8px ${val.bg}` : 'none',
              }}
            >
              {val.dot} {val.label}
            </button>
          ))}
        </div>
      </div>

      {/* Subtasks */}
      <div style={s.subtaskRow}>
        <input
          style={{
            ...s.input,
            flex: 1,
            marginBottom: 0,
            borderColor: focused === 'sub' ? theme.colors.cornflower : theme.colors.border
          }}
          placeholder="Add a subtask (optional)"
          value={subtaskInput}
          onChange={e => setSubtaskInput(e.target.value)}
          onFocus={() => setFocused('sub')}
          onBlur={() => setFocused('')}
          onKeyDown={e => e.key === 'Enter' && addSubtask()}
        />
        <button onClick={addSubtask} style={s.subAddBtn}>＋</button>
      </div>

      {subtasks.length > 0 && (
        <div style={s.chips}>
          {subtasks.map((sub, i) => (
            <span key={i} style={s.chip}>
              <span style={s.chipDot}>◦</span>
              {sub.subtaskText}
              <button onClick={() => removeSubtask(i)} style={s.chipX}>✕</button>
            </span>
          ))}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!task.trim() || submitting}
        style={{
          ...s.submitBtn,
          opacity: !task.trim() || submitting ? 0.5 : 1,
          cursor:  !task.trim() || submitting ? 'not-allowed' : 'pointer',
        }}
      >
        {submitting ? 'Adding...' : '＋ Add Task'}
      </button>
    </div>
  );
}

const s = {
  card: {
    background: theme.colors.cardBg,
    borderRadius: theme.radius.lg,
    padding: '1.5rem',
    boxShadow: `0 4px 20px ${theme.colors.shadow}`,
    border: `1px solid ${theme.colors.border}`,
    marginBottom: '1.25rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.1rem',
  },
  headerDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${theme.colors.cornflower}, ${theme.colors.steel})`,
  },
  cardTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  input: {
    width: '100%',
    padding: '0.7rem 0.9rem',
    border: '1.5px solid',
    borderRadius: theme.radius.md,
    fontSize: '0.9rem',
    marginBottom: '0.7rem',
    outline: 'none',
    boxSizing: 'border-box',
    color: theme.colors.textPrimary,
    background: theme.colors.inputBg,
    transition: 'border-color 0.2s',
    fontFamily: theme.font.sans,
  },
  textarea: {
    width: '100%',
    padding: '0.7rem 0.9rem',
    border: '1.5px solid',
    borderRadius: theme.radius.md,
    fontSize: '0.9rem',
    marginBottom: '0.7rem',
    outline: 'none',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: theme.font.sans,
    color: theme.colors.textPrimary,
    background: theme.colors.inputBg,
  },
  priorityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.7rem',
    flexWrap: 'wrap',
  },
  priorityLabel: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  priorityBtns: {
    display: 'flex',
    gap: '0.4rem',
  },
  pBtn: {
    padding: '0.3rem 0.8rem',
    borderRadius: theme.radius.full,
    border: '1.5px solid',
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: theme.font.sans,
    whiteSpace: 'nowrap',
  },
  subtaskRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    marginBottom: '0.6rem',
  },
  subAddBtn: {
    padding: '0.7rem 0.9rem',
    background: theme.colors.sky,
    border: `1.5px solid ${theme.colors.cornflower}`,
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    color: theme.colors.navy,
    fontWeight: '700',
    fontSize: '1rem',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
    marginBottom: '0.7rem',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
    background: theme.colors.sky,
    border: `1px solid ${theme.colors.cornflower}`,
    borderRadius: theme.radius.full,
    padding: '0.22rem 0.65rem',
    fontSize: '0.78rem',
    color: theme.colors.navy,
  },
  chipDot: { color: theme.colors.steel, fontSize: '0.9rem' },
  chipX: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: theme.colors.steel,
    fontSize: '0.7rem',
    padding: '0 2px',
    lineHeight: 1,
  },
  submitBtn: {
    width: '100%',
    padding: '0.8rem',
    background: `linear-gradient(135deg, ${theme.colors.steel}, ${theme.colors.navy})`,
    color: '#fff',
    border: 'none',
    borderRadius: theme.radius.md,
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    letterSpacing: '0.03em',
    fontFamily: theme.font.sans,
    transition: 'opacity 0.2s',
    marginTop: '0.2rem',
  },
};