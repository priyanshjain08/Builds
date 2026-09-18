import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { TaskAPI } from '../api/resources';
import { useWorkspaceRoom } from '../context/WorkspaceRoomContext';
import { useSocket } from '../context/SocketContext';
import { useDebounce } from '../hooks/useDebounce';
import { PageLoading, ErrorState } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/ui/Icon';
import TaskFormModal from '../components/workspace/TaskFormModal';
import { formatDueDate, isOverdue } from '../utils/format';

const COLUMNS = [
  { status: 'todo', label: 'To Do', color: '#9ea3b5' },
  { status: 'in_progress', label: 'In Progress', color: '#3654F4' },
  { status: 'in_review', label: 'In Review', color: '#E8A23D' },
  { status: 'completed', label: 'Completed', color: '#1FB27A' },
];

export default function KanbanBoard() {
  const { workspaceId } = useParams();
  const { members, projects } = useWorkspaceRoom();
  const { socket } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const projectFilter = searchParams.get('project') || '';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dragOverCol, setDragOverCol] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    TaskAPI.list(workspaceId, {
      projectId: projectFilter || undefined,
      search: debouncedSearch || undefined,
      priority: priority || undefined,
      assignedTo: assignee || undefined,
    })
      .then((data) => setTasks(data.tasks))
      .catch(() => setError('Could not load the board.'))
      .finally(() => setLoading(false));
  }, [workspaceId, projectFilter, debouncedSearch, priority, assignee]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!socket) return;
    const inScope = (t) => !projectFilter || t.project_id === projectFilter;
    const onCreated = (t) => inScope(t) && setTasks((prev) => (prev.some((x) => x.id === t.id) ? prev : [...prev, t]));
    const onUpdated = (t) =>
      setTasks((prev) => {
        if (!inScope(t)) return prev.filter((x) => x.id !== t.id);
        const exists = prev.some((x) => x.id === t.id);
        return exists ? prev.map((x) => (x.id === t.id ? t : x)) : [...prev, t];
      });
    const onDeleted = ({ id }) => setTasks((prev) => prev.filter((t) => t.id !== id));
    socket.on('task:created', onCreated);
    socket.on('task:updated', onUpdated);
    socket.on('task:deleted', onDeleted);
    return () => {
      socket.off('task:created', onCreated);
      socket.off('task:updated', onUpdated);
      socket.off('task:deleted', onDeleted);
    };
  }, [socket, projectFilter]);

  const columns = useMemo(() => {
    const grouped = {};
    COLUMNS.forEach((c) => (grouped[c.status] = []));
    tasks.forEach((t) => grouped[t.status]?.push(t));
    return grouped;
  }, [tasks]);

  async function handleDrop(status) {
    setDragOverCol(null);
    const taskId = window.__draggedTaskId;
    if (!taskId) return;
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === status) return;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
    try {
      await TaskAPI.update(workspaceId, taskId, { status });
    } catch (err) {
      load(); // revert on failure by reloading source of truth
    }
  }

  const activeProject = projects.find((p) => p.id === projectFilter);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Board {activeProject && `· ${activeProject.name}`}</h1>
          <p>Drag a card to change its status — updates go out to your team instantly.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size={16} /> New task
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input">
          <Icon name="search" size={16} />
          <input placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 170, height: 36 }} value={projectFilter} onChange={(e) => setSearchParams(e.target.value ? { project: e.target.value } : {})}>
          <option value="">All projects</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="select" style={{ width: 150, height: 36 }} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
        <select className="select" style={{ width: 170, height: 36 }} value={assignee} onChange={(e) => setAssignee(e.target.value)}>
          <option value="">Everyone</option>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>

      {loading ? (
        <PageLoading />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : tasks.length === 0 ? (
        <div className="card">
          <EmptyState icon="board" title="No tasks match" description="Try clearing your filters, or create the first task." action={<button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>New task</button>} />
        </div>
      ) : (
        <div className="kanban-board">
          {COLUMNS.map((col) => (
            <div
              key={col.status}
              className={`kanban-column ${dragOverCol === col.status ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.status); }}
              onDragLeave={() => setDragOverCol((c) => (c === col.status ? null : c))}
              onDrop={(e) => { e.preventDefault(); handleDrop(col.status); }}
            >
              <div className="kanban-column-head">
                <span className="dot" style={{ background: col.color }} />
                <h4>{col.label}</h4>
                <span className="count">{columns[col.status].length}</span>
              </div>
              <div className="kanban-cards">
                {columns[col.status].map((t) => (
                  <div
                    key={t.id}
                    className="kanban-card"
                    draggable
                    onDragStart={() => { window.__draggedTaskId = t.id; }}
                    onClick={() => setEditingTask(t)}
                  >
                    <span className="project-tag">{t.project_name}</span>
                    <span className="title">{t.title}</span>
                    <div className="kanban-card-foot">
                      <span className={`due ${isOverdue(t.due_date, t.status) ? 'overdue' : ''}`}>
                        {t.due_date && (<><Icon name="calendar" size={12} /> {formatDueDate(t.due_date)}</>)}
                      </span>
                      {t.assignee_name ? (
                        <Avatar name={t.assignee_name} color={t.assignee_color} size="sm" />
                      ) : (
                        <span className={`priority-flag ${t.priority}`} style={{ height: 16, borderRadius: 3 }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <TaskFormModal
          title="New task"
          projects={projects}
          fixedProjectId={projectFilter || undefined}
          members={members}
          onClose={() => setShowCreate(false)}
          onSubmit={async (data) => { await TaskAPI.create(workspaceId, data); load(); }}
        />
      )}

      {editingTask && (
        <TaskFormModal
          title="Edit task"
          initial={editingTask}
          projects={projects}
          members={members}
          onClose={() => setEditingTask(null)}
          onSubmit={async (data) => { await TaskAPI.update(workspaceId, editingTask.id, data); }}
          onDelete={async () => { await TaskAPI.remove(workspaceId, editingTask.id); }}
        />
      )}
    </div>
  );
}
