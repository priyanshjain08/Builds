import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ProjectAPI } from '../api/resources';
import { useWorkspaceRoom } from '../context/WorkspaceRoomContext';
import { useSocket } from '../context/SocketContext';
import { useDebounce } from '../hooks/useDebounce';
import { StatusBadge } from '../components/ui/Badges';
import EmptyState from '../components/ui/EmptyState';
import { PageLoading, ErrorState } from '../components/ui/Loading';
import Icon from '../components/ui/Icon';
import ProjectFormModal from '../components/workspace/ProjectFormModal';

const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

export default function Projects() {
  const { workspaceId } = useParams();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    ProjectAPI.list(workspaceId, { search: debouncedSearch || undefined, status: status || undefined })
      .then((data) => setProjects(data.projects))
      .catch(() => setError('Could not load projects.'))
      .finally(() => setLoading(false));
  }, [workspaceId, debouncedSearch, status]);

  useEffect(load, [load]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => load();
    socket.on('project:created', refresh);
    socket.on('project:updated', refresh);
    socket.on('project:deleted', refresh);
    socket.on('task:created', refresh);
    socket.on('task:updated', refresh);
    return () => {
      socket.off('project:created', refresh);
      socket.off('project:updated', refresh);
      socket.off('project:deleted', refresh);
      socket.off('task:created', refresh);
      socket.off('task:updated', refresh);
    };
  }, [socket, load]);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p>Everything your team is working on in this workspace.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <Icon name="plus" size={16} /> New project
        </button>
      </div>

      <div className="toolbar">
        <div className="search-input">
          <Icon name="search" size={16} />
          <input placeholder="Search projects…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: 170, height: 36 }} value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS_FILTERS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <div className="card card-flush">
        {loading ? (
          <PageLoading />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : projects.length === 0 ? (
          <EmptyState
            icon="projects"
            title={search || status ? 'No projects match' : 'No projects yet'}
            description={search || status ? 'Try a different search or filter.' : 'Create your first project to start organizing tasks.'}
            action={!search && !status && <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>New project</button>}
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Tasks</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.id} className="row-link" onClick={() => navigate(`/app/w/${workspaceId}/projects/${p.id}`)}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{p.description}</div>}
                  </td>
                  <td><StatusBadge status={p.status} /></td>
                  <td style={{ width: 140 }}>
                    <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%', borderRadius: 3, background: 'var(--signal)',
                          width: `${p.total_tasks > 0 ? Math.round((p.completed_tasks / p.total_tasks) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </td>
                  <td>{p.completed_tasks}/{p.total_tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showCreate && (
        <ProjectFormModal
          title="New project"
          onClose={() => setShowCreate(false)}
          onSubmit={async (data) => {
            await ProjectAPI.create(workspaceId, data);
            load();
          }}
        />
      )}
    </div>
  );
}
