import { useState, useEffect } from 'react';
import TaskInputForm from './components/TaskInputForm';
import TodoList from './components/TodoList';
import TodoDetailsModal from './components/TodoDetailsModal';
import { todoApi } from './API/todoApi';
import { theme } from './theme';
import './App.css';

export default function App() {
  const [todos, setTodos]         = useState([]);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(true);
  const [modalTodo, setModalTodo] = useState(null);  // ✅ Modal state

  // ── Fetch ────────────────────────────────────
  useEffect(() => { fetchTodos(); }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const data = await todoApi.getAll();
      setTodos(data);
      setError('');
    } catch {
      setError('Cannot reach backend. Make sure it is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  // ── Add ──────────────────────────────────────
  const handleAdd = async (payload) => {
    try {
      const created = await todoApi.create(payload);
      setTodos([created, ...todos]);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to add task.');
    }
  };

  // ── Toggle complete ──────────────────────────
  const handleToggle = async (todo) => {
    try {
      const updated = await todoApi.update(todo._id, { completed: !todo.completed });
      setTodos(todos.map(t => t._id === updated._id ? updated : t));
    } catch {
      setError('Failed to update task.');
    }
  };

  // ── Change priority ──────────────────────────
  const handlePriorityChange = async (todo, priority) => {
    try {
      const updated = await todoApi.update(todo._id, { priority });
      setTodos(todos.map(t => t._id === updated._id ? updated : t));
    } catch {
      setError('Failed to update priority.');
    }
  };

  // ── Delete ───────────────────────────────────
  const handleDelete = async (id) => {
    try {
      await todoApi.delete(id);
      setTodos(todos.filter(t => t._id !== id));
    } catch {
      setError('Failed to delete task.');
    }
  };

  // ── Update todo (used by modal) ──────────────
  const handleUpdate = async (id, payload) => {
    try {
      const updated = await todoApi.update(id, payload);
      setTodos(todos.map(t => t._id === updated._id ? updated : t));
      // Keep modal in sync with latest data
      if (modalTodo && modalTodo._id === updated._id) {
        setModalTodo(updated);
      }
    } catch {
      setError('Failed to update task.');
    }
  };

  // ── Stats ────────────────────────────────────
  const done    = todos.filter(t => t.completed).length;
  const pending = todos.length - done;
  const urgent  = todos.filter(t => t.priority === 'high' && !t.completed).length;
  const pct     = todos.length ? Math.round((done / todos.length) * 100) : 0;

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* ── Header ── */}
        <header style={s.header}>
          <div style={s.logoRow}>
            <div style={s.logoIcon}>✦</div>
            <h1 style={s.title}>My Tasks</h1>
          </div>
          <p style={s.subtitle}>Stay focused. Get things done.</p>

          {/* Stats bar */}
          {todos.length > 0 && (
            <div style={s.statsBar}>
              <Stat value={todos.length} label="Total" />
              <Divider />
              <Stat value={pending}      label="Pending" color={theme.colors.steel} />
              <Divider />
              <Stat value={done}         label="Done"    color="#22a06b" />
              <Divider />
              <Stat value={urgent}       label="Urgent"  color="#c0392b" />
              <Divider />
              {/* Progress */}
              <div style={s.statItem}>
                <div style={s.pctRow}>
                  <span style={{ ...s.statNum, color: theme.colors.cornflower }}>{pct}%</span>
                </div>
                <span style={s.statLabel}>Complete</span>
              </div>
            </div>
          )}

          {/* Progress bar */}
          {todos.length > 0 && (
            <div style={s.progressOuter}>
              <div style={{ ...s.progressInner, width: `${pct}%` }} />
            </div>
          )}
        </header>

        {/* ── Error banner ── */}
        {error && (
          <div style={s.errorBanner}>
            <span>⚠️ {error}</span>
            <button onClick={() => setError('')} style={s.errorClose}>✕</button>
          </div>
        )}

        {/* ── Form ── */}
        <TaskInputForm onAdd={handleAdd} />

        {/* ── List ── */}
        {loading ? (
          <div style={s.loadingBox}>
            <div style={s.spinner} />
            <span style={s.loadingText}>Loading tasks...</span>
          </div>
        ) : (
          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onPriorityChange={handlePriorityChange}
            onOpenModal={setModalTodo}          // ✅ Pass modal opener
          />
        )}

        {/* ── Details Modal ── */}
        <TodoDetailsModal
          open={!!modalTodo}
          todo={modalTodo}
          onClose={() => setModalTodo(null)}
          onUpdateTodo={handleUpdate}           // ✅ Pass updater
        />
      </div>
    </div>
  );
}

// ── Small reusable stat component ─────────────
const Stat = ({ value, label, color }) => (
  <div style={s.statItem}>
    <span style={{ ...s.statNum, color: color || theme.colors.navy }}>{value}</span>
    <span style={s.statLabel}>{label}</span>
  </div>
);

const Divider = () => <div style={s.divider} />;

// ── Styles ────────────────────────────────────
const s = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(160deg, ${theme.colors.sky}55 0%, #f7fafc 40%, ${theme.colors.sky}33 100%)`,
    padding: '2rem 1rem 4rem',
    fontFamily: theme.font.sans,
  },
  container: {
    maxWidth: '700px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.6rem',
  },
  logoIcon: {
    fontSize: '1.6rem',
    color: theme.colors.cornflower,
    lineHeight: 1,
  },
  title: {
    fontSize: '2.2rem',
    fontWeight: '800',
    color: theme.colors.navy,
    margin: 0,
    letterSpacing: '-0.04em',
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: '0.88rem',
    marginTop: '0.25rem',
    marginBottom: 0,
    letterSpacing: '0.02em',
  },
  statsBar: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '1.25rem',
    marginTop: '1.25rem',
    background: theme.colors.cardBg,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.radius.xl,
    padding: '0.65rem 1.75rem',
    boxShadow: `0 2px 10px ${theme.colors.shadow}`,
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1px',
  },
  statNum: {
    fontSize: '1.35rem',
    fontWeight: '800',
    lineHeight: 1,
    color: theme.colors.navy,
  },
  statLabel: {
    fontSize: '0.62rem',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    fontWeight: '600',
  },
  pctRow: { display: 'flex', alignItems: 'baseline', gap: '1px' },
  divider: {
    width: '1px',
    height: '28px',
    background: theme.colors.border,
  },
  progressOuter: {
    height: '4px',
    background: theme.colors.sky,
    borderRadius: theme.radius.full,
    marginTop: '1rem',
    overflow: 'hidden',
    width: '200px',
    margin: '0.8rem auto 0',
  },
  progressInner: {
    height: '100%',
    background: `linear-gradient(90deg, ${theme.colors.cornflower}, ${theme.colors.steel})`,
    borderRadius: theme.radius.full,
    transition: 'width 0.4s ease',
  },
  errorBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: theme.radius.md,
    padding: '0.7rem 1rem',
    marginBottom: '1rem',
    color: '#c0392b',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  errorClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#c0392b',
    fontSize: '1rem',
    padding: '0 4px',
    lineHeight: 1,
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '3rem',
    gap: '1rem',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: `3px solid ${theme.colors.sky}`,
    borderTop: `3px solid ${theme.colors.cornflower}`,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: '0.85rem',
  },
};