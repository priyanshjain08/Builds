import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardAPI } from '../api/resources';
import { useAuth } from '../context/AuthContext';
import { PageLoading, ErrorState } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Icon from '../components/ui/Icon';
import { PriorityBadge } from '../components/ui/Badges';
import { timeAgo, formatDueDate, isOverdue } from '../utils/format';

const ACTIVITY_ICON = {
  workspace_created: 'workspace', project_created: 'projects', task_created: 'layers',
  task_assigned: 'members', task_status_changed: 'board', member_added: 'members',
  workspace_updated: 'settings', project_updated: 'projects',
};

const STAT_CARDS = [
  { key: 'totalWorkspaces', label: 'Workspaces', icon: 'workspace', color: '#3654F4', bg: '#EDF0FE' },
  { key: 'activeProjects', label: 'Active projects', icon: 'projects', color: '#1FB27A', bg: '#E8F8F1' },
  { key: 'myOpenTasks', label: 'Tasks assigned to you', icon: 'layers', color: '#E8A23D', bg: '#FDF3E3' },
  { key: 'tasksDueSoon', label: 'Due within 7 days', icon: 'calendar', color: '#E5484D', bg: '#FDECEC' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    DashboardAPI.get()
      .then(setData)
      .catch(() => setError('Could not load your dashboard.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  if (loading) return <PageLoading />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p>Here's what's happening across your workspaces.</p>
        </div>
      </div>

      <div className="stat-grid">
        {STAT_CARDS.map((s) => (
          <div className="stat-card" key={s.key}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <Icon name={s.icon} size={17} />
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{data.stats[s.key]}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }} className="dashboard-grid">
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Your tasks</h3>
          {data.myTasks.length === 0 ? (
            <EmptyState icon="layers" title="No open tasks" description="Tasks assigned to you across every workspace will show up here." />
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {data.myTasks.map((t) => (
                <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', borderBottom: '1px solid var(--border)' }}>
                  <span className={`priority-flag ${t.priority}`} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.workspace_name} · {t.project_name}</div>
                  </div>
                  {t.due_date && (
                    <span className={`due ${isOverdue(t.due_date, t.status) ? 'overdue' : ''}`} style={{ fontSize: 12, color: isOverdue(t.due_date, t.status) ? 'var(--danger)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {formatDueDate(t.due_date)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Recent activity</h3>
          {data.activity.length === 0 ? (
            <EmptyState icon="clock" title="No activity yet" description="Actions across your workspaces will appear here." />
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {data.activity.map((a) => (
                <li key={a.id} style={{ display: 'flex', gap: 10, fontSize: 13 }}>
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-muted)' }}>
                    <Icon name={ACTIVITY_ICON[a.type] || 'clock'} size={14} />
                  </span>
                  <div>
                    <div>{a.description}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-faint)' }}>{a.workspace_name} · {timeAgo(a.created_at)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {data.workspaces.length === 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <EmptyState
            icon="workspace"
            title="Create your first workspace"
            description="Workspaces hold your projects, tasks, and team chat. Use the switcher in the sidebar to create one."
          />
        </div>
      )}
    </div>
  );
}
