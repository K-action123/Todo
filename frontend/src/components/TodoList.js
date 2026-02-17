import { useState } from 'react';
import { theme, PRIORITIES } from '../theme';

export default function TodoList({ todos, onToggle, onDelete, onPriorityChange, onOpenModal }) {
  const [filter, setFilter] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);

  const filtered = filter === 'all'
    ? todos
    : todos.filter(t => t.priority === filter);

  const counts = {
    all:    todos.length,
    high:   todos.filter(t => t.priority === 'high').length,
    medium: todos.filter(t => t.priority === 'medium').length,
    low:    todos.filter(t => t.priority === 'low').length,
  };

  return (
    <div>
      {/* Filter tabs */}
      <div style={s.filterRow}>
        {['all', 'high', 'medium', 'low'].map(f => {
          const isActive = filter === f;
          const p = f !== 'all' ? PRIORITIES[f] : null;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...s.filterBtn,
                background:  isActive ? theme.colors.navy    : 'transparent',
                color:       isActive ? '#fff'               : theme.colors.textSecondary,
                borderColor: isActive ? theme.colors.navy    : theme.colors.border,
              }}
            >
              {p ? `${p.dot} ${p.label}` : 'All'}
              <span style={{
                ...s.filterCount,
                background: isActive ? 'rgba(255,255,255,0.2)' : theme.colors.sky,
                color:      isActive ? '#fff' : theme.colors.steel,
              }}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📭</div>
          <p style={s.emptyText}>
            {filter === 'all'
              ? 'No tasks yet. Add one above!'
              : `No ${filter} priority tasks.`}
          </p>
        </div>
      )}

      {/* Task cards */}
      <div style={s.list}>
        {filtered.map(todo => {
          const p = PRIORITIES[todo.priority] || PRIORITIES.medium;
          const isHovered = hoveredId === todo._id;
          const doneCount = todo.subtasks?.filter(s => s.isCompleted).length || 0;

          return (
            <div
              key={todo._id}
              onMouseEnter={() => setHoveredId(todo._id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                ...s.card,
                borderLeft: `4px solid ${p.text}`,
                opacity:    todo.completed ? 0.62 : 1,
                boxShadow:  isHovered
                  ? `0 6px 20px ${theme.colors.shadowMd}`
                  : `0 2px 8px ${theme.colors.shadow}`,
                transform: isHovered ? 'translateY(-1px)' : 'translateY(0)',
              }}
            >
              {/* Top row */}
              <div style={s.topRow}>

                {/* Checkbox */}
                <button
                  onClick={() => onToggle(todo)}
                  style={{
                    ...s.checkbox,
                    background:  todo.completed ? theme.colors.steel : 'transparent',
                    borderColor: todo.completed ? theme.colors.steel : theme.colors.border,
                  }}
                  title={todo.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {todo.completed && <span style={s.checkmark}>✓</span>}
                </button>

                {/* Task name + description */}
                <div style={s.taskInfo}>
                  <span
                    onClick={() => onOpenModal(todo)}
                    style={{
                      ...s.taskName,
                      textDecoration: todo.completed ? 'line-through' : 'none',
                      color: todo.completed ? theme.colors.textMuted : theme.colors.textPrimary,
                      cursor: 'pointer',
                    }}
                    title="Click to view details"
                  >
                    {todo.task}
                  </span>
                  {todo.description && (
                    <span style={s.taskDesc}>{todo.description}</span>
                  )}
                  {/* Subtask progress */}
                  {todo.subtasks?.length > 0 && (
                    <div style={s.progressRow}>
                      <div style={s.progressBg}>
                        <div style={{
                          ...s.progressFill,
                          width: `${(doneCount / todo.subtasks.length) * 100}%`,
                          background: p.text,
                        }} />
                      </div>
                      <span style={s.progressText}>
                        {doneCount}/{todo.subtasks.length} subtasks
                      </span>
                    </div>
                  )}
                </div>

                {/* Right actions */}
                <div style={s.actions}>
                  {/* Priority badge/selector */}
                  <select
                    value={todo.priority || 'medium'}
                    onChange={e => onPriorityChange(todo, e.target.value)}
                    style={{
                      ...s.prioritySelect,
                      color:       p.text,
                      borderColor: p.text,
                      background:  p.bg,
                    }}
                  >
                    <option value="high">🔴 High</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>

                  {/* Delete */}
                  <button
                    onClick={() => onDelete(todo._id)}
                    style={{
                      ...s.deleteBtn,
                      background: isHovered ? '#fef2f2' : 'transparent',
                    }}
                    title="Delete task"
                  >
                    🗑
                  </button>
                </div>
              </div>

              {/* Subtasks list */}
              {todo.subtasks?.length > 0 && (
                <div style={s.subtasksSection}>
                  {todo.subtasks.map((sub, i) => (
                    <div key={i} style={s.subtaskItem}>
                      <span style={{ ...s.subDot, color: p.text }}>◦</span>
                      <span style={{
                        ...s.subText,
                        textDecoration: sub.isCompleted ? 'line-through' : 'none',
                        color: sub.isCompleted ? theme.colors.textMuted : theme.colors.textSecondary,
                      }}>
                        {sub.subtaskText}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const s = {
  filterRow: {
    display: 'flex',
    gap: '0.4rem',
    marginBottom: '1rem',
    flexWrap: 'wrap',
  },
  filterBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.4rem 0.85rem',
    borderRadius: theme.radius.full,
    border: '1.5px solid',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '600',
    transition: 'all 0.15s ease',
    fontFamily: theme.font.sans,
  },
  filterCount: {
    padding: '1px 6px',
    borderRadius: theme.radius.full,
    fontSize: '0.7rem',
    fontWeight: '700',
  },
  empty: {
    textAlign: 'center',
    padding: '3.5rem 1rem',
  },
  emptyIcon: { fontSize: '3rem', marginBottom: '0.75rem' },
  emptyText: {
    color: theme.colors.textMuted,
    fontSize: '0.9rem',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
  },
  card: {
    background: theme.colors.cardBg,
    borderRadius: theme.radius.lg,
    padding: '1rem 1.1rem',
    border: `1px solid ${theme.colors.border}`,
    transition: 'all 0.18s ease',
    cursor: 'default',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    minWidth: '20px',
    borderRadius: theme.radius.sm,
    border: '2px solid',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  },
  checkmark: {
    color: '#fff',
    fontSize: '0.65rem',
    fontWeight: '800',
  },
  taskInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  taskName: {
    fontSize: '0.92rem',
    fontWeight: '600',
    lineHeight: 1.4,
    fontFamily: theme.font.sans,
  },
  taskDesc: {
    fontSize: '0.8rem',
    color: theme.colors.textMuted,
    marginTop: '1px',
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '6px',
  },
  progressBg: {
    flex: 1,
    height: '4px',
    background: theme.colors.sky,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    maxWidth: '100px',
  },
  progressFill: {
    height: '100%',
    borderRadius: theme.radius.full,
    transition: 'width 0.3s ease',
  },
  progressText: {
    fontSize: '0.7rem',
    color: theme.colors.textMuted,
    whiteSpace: 'nowrap',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    flexShrink: 0,
  },
  prioritySelect: {
    padding: '0.22rem 0.5rem',
    border: '1.5px solid',
    borderRadius: theme.radius.full,
    fontSize: '0.72rem',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none',
    appearance: 'none',
    WebkitAppearance: 'none',
    fontFamily: theme.font.sans,
  },
  deleteBtn: {
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.95rem',
    padding: '4px 6px',
    borderRadius: theme.radius.sm,
    transition: 'background 0.15s',
  },
  subtasksSection: {
    marginTop: '0.6rem',
    paddingTop: '0.6rem',
    borderTop: `1px dashed ${theme.colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  subtaskItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  subDot: { fontSize: '1rem', lineHeight: 1 },
  subText: { fontSize: '0.8rem', fontFamily: theme.font.sans },
};