import { Link } from 'react-router-dom';
import { useWorkspaceRoom } from '../context/WorkspaceRoomContext';
import { StatusBadge } from '../components/ui/Badges';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/ui/Icon';
import { timeAgo } from '../utils/format';

const ACTIVITY_ICON = {
  workspace_created: 'workspace', project_created: 'projects', task_created: 'layers',
  task_assigned: 'members', task_status_changed: 'board', member_added: 'members',
  workspace_updated: 'settings', project_updated: 'projects',
};

export default function WorkspaceOverview() {
  const { workspace, projects, members, activity, onlineUserIds } = useWorkspaceRoom();

  const activeCount = projects.filter((p) => p.status === 'active').length;
  const totalTasks = projects.reduce((sum, p) => sum + Number(p.total_tasks || 0), 0);
  const doneTasks = projects.reduce((sum, p) => sum + Number(p.completed_tasks || 0), 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>{workspace.name}</h1>
          <p>{workspace.description || 'No description yet.'}</p>
        </div>
        <Link to={`/app/w/${workspace.id}/projects`} className="btn btn-primary">
          <Icon name="plus" size={16} /> New project
        </Link>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#EDF0FE', color: '#3654F4' }}><Icon name="projects" size={17} /></div>
          <div className="stat-label">Projects</div>
          <div className="stat-value">{projects.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E8F8F1', color: '#1FB27A' }}><Icon name="zap" size={17} /></div>
          <div className="stat-label">Active projects</div>
          <div className="stat-value">{activeCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FDF3E3', color: '#E8A23D' }}><Icon name="layers" size={17} /></div>
          <div className="stat-label">Tasks completed</div>
          <div className="stat-value">{doneTasks}/{totalTasks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#F2ECFC', color: '#8551E5' }}><Icon name="members" size={17} /></div>
          <div className="stat-label">Members online</div>
          <div className="stat-value">{onlineUserIds.length}/{members.length}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }} className="dashboard-grid">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3>Projects</h3>
            <Link to={`/app/w/${workspace.id}/projects`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--signal)' }}>View all</Link>
          </div>
          {projects.length === 0 ? (
            <EmptyState icon="projects" title="No projects yet" description="Create your first project to start tracking tasks." />
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {projects.slice(0, 6).map((p) => (
                <li key={p.id}>
                  <Link
                    to={`/app/w/${workspace.id}/projects/${p.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 4px', borderBottom: '1px solid var(--border)' }}
                  >
                    <span style={{ fontSize: 13.5, fontWeight: 600, flex: 1 }}>{p.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.completed_tasks}/{p.total_tasks} tasks</span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3>Team</h3>
              <Link to={`/app/w/${workspace.id}/members`} style={{ fontSize: 13, fontWeight: 600, color: 'var(--signal)' }}>View all</Link>
            </div>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {members.slice(0, 6).map((m) => (
                <li key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar name={m.name} color={m.avatar_color} size="sm" online={onlineUserIds.includes(m.id)} />
                  <span style={{ fontSize: 13.5, fontWeight: 500 }}>{m.name}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Recent activity</h3>
            {activity.length === 0 ? (
              <EmptyState icon="clock" title="Nothing yet" />
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {activity.slice(0, 8).map((a) => (
                  <li key={a.id} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                    <span style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-muted)' }}>
                      <Icon name={ACTIVITY_ICON[a.type] || 'clock'} size={13} />
                    </span>
                    <div>
                      <div>{a.description}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{timeAgo(a.created_at)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
