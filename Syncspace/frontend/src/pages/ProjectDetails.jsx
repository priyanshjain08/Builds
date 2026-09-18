import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProjectAPI, TaskAPI } from '../api/resources';
import { useWorkspaceRoom } from '../context/WorkspaceRoomContext';
import { useSocket } from '../context/SocketContext';
import { PageLoading, ErrorState } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import { StatusBadge, PriorityBadge, TASK_STATUS_LABELS } from '../components/ui/Badges';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/ui/Icon';
import ProjectFormModal from '../components/workspace/ProjectFormModal';
import TaskFormModal from '../components/workspace/TaskFormModal';
import { formatDueDate, isOverdue } from '../utils/format';

export default function ProjectDetails() {
  const { workspaceId, projectId } = useParams();
  const navigate = useNavigate();
  const { members } = useWorkspaceRoom();
  const { socket } = useSocket();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    ProjectAPI.get(workspaceId, projectId)
      .then((data) => {
        setProject(data.project);
        setTasks(data.tasks);
      })
      .catch(() => setError('Could not load this project.'))
      .finally(() => setLoading(false));
  }, [workspaceId, projectId]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!socket) return;
    const relevant = (t) => t.project_id === projectId;
    const onCreated = (t) => relevant(t) && setTasks((prev) => [t, ...prev]);
    const onUpdated = (t) => relevant(t) && setTasks((prev) => prev.map((x) => (x.id === t.id ? t : x)));
    const onDeleted = ({ id }) => setTasks((prev) => prev.filter((t) => t.id !== id));
    const onProjectUpdated = (p) => p.id === projectId && setProject((prev) => ({ ...prev, ...p }));
    socket.on('task:created', onCreated);
    socket.on('task:updated', onUpdated);
    socket.on('task:deleted', onDeleted);
    socket.on('project:updated', onProjectUpdated);
    return () => {
      socket.off('task:created', onCreated);
      socket.off('task:updated', onUpdated);
      socket.off('task:deleted', onDeleted);
      socket.off('project:updated', onProjectUpdated);
    };
  }, [socket, projectId]);

  if (loading) return <PageLoading />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!project) return null;

  const doneCount = tasks.filter((t) => t.status === 'completed').length;

  return (
    <div className="page">
      <button className="btn btn-ghost btn-sm" style={{ marginBottom: 10 }} onClick={() => navigate(`/app/w/${workspaceId}/projects`)}>
        ← All projects
      </button>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1>{project.name}</h1>
            <StatusBadge status={project.status} />
          </div>
          <p>{project.description || 'No description yet.'} · {doneCount}/{tasks.length} tasks completed</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowEdit(true)}>
            <Icon name="edit" size={15} /> Edit
          </button>
          <Link to={`/app/w/${workspaceId}/board?project=${project.id}`} className="btn btn-secondary">
            <Icon name="board" size={15} /> View on board
          </Link>
          <button className="btn btn-primary" onClick={() => setShowCreateTask(true)}>
            <Icon name="plus" size={16} /> New task
          </button>
        </div>
      </div>

      <div className="card card-flush">
        {tasks.length === 0 ? (
          <EmptyState icon="layers" title="No tasks yet" description="Add the first task for this project." action={<button className="btn btn-primary btn-sm" onClick={() => setShowCreateTask(true)}>New task</button>} />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Assignee</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="row-link" onClick={() => setEditingTask(t)}>
                  <td style={{ fontWeight: 600 }}>{t.title}</td>
                  <td><StatusBadge status={t.status} labels={TASK_STATUS_LABELS} /></td>
                  <td><PriorityBadge priority={t.priority} /></td>
                  <td>
                    {t.assignee_name ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar name={t.assignee_name} color={t.assignee_color} size="sm" />
                        {t.assignee_name}
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-faint)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    {t.due_date ? (
                      <span style={{ color: isOverdue(t.due_date, t.status) ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600, fontSize: 12.5 }}>
                        {formatDueDate(t.due_date)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-faint)' }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showEdit && (
        <ProjectFormModal
          title="Edit project"
          initial={project}
          onClose={() => setShowEdit(false)}
          onSubmit={async (data) => {
            const { project: updated } = await ProjectAPI.update(workspaceId, projectId, data);
            setProject(updated);
          }}
        />
      )}

      {showCreateTask && (
        <TaskFormModal
          title="New task"
          fixedProjectId={project.id}
          members={members}
          onClose={() => setShowCreateTask(false)}
          onSubmit={async (data) => {
            await TaskAPI.create(workspaceId, data);
          }}
        />
      )}

      {editingTask && (
        <TaskFormModal
          title="Edit task"
          initial={editingTask}
          fixedProjectId={project.id}
          members={members}
          onClose={() => setEditingTask(null)}
          onSubmit={async (data) => {
            await TaskAPI.update(workspaceId, editingTask.id, data);
          }}
          onDelete={async () => {
            await TaskAPI.remove(workspaceId, editingTask.id);
          }}
        />
      )}
    </div>
  );
}
