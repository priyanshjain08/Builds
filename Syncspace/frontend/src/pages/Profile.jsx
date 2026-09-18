import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { UserAPI } from '../api/resources';
import { useAuth } from '../context/AuthContext';
import { PageLoading, ErrorState } from '../components/ui/Loading';
import EmptyState from '../components/ui/EmptyState';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/ui/Icon';
import { apiErrorMessage } from '../api/client';
import { timeAgo, formatDueDate } from '../utils/format';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    UserAPI.overview()
      .then((data) => {
        setOverview(data);
        setName(data.user.name);
        setTitle(data.user.title || '');
      })
      .catch(() => setError('Could not load your profile.'));
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const { user: updated } = await UserAPI.updateProfile({ name, title });
      updateUser(updated);
      setSaveMsg('Profile updated.');
    } catch (err) {
      setSaveMsg(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (error) return <ErrorState message={error} />;
  if (!overview) return <PageLoading />;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Your profile</h1>
          <p>Manage your basic information and see what's assigned to you.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }} className="dashboard-grid">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <Avatar name={user?.name} color={user?.avatar_color} size="lg" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{user?.name}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{user?.email}</div>
            </div>
          </div>
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {saveMsg && <div className="form-error" style={saveMsg === 'Profile updated.' ? { background: 'var(--success-soft)', color: 'var(--success)' } : undefined}>{saveMsg}</div>}
            <div className="field">
              <label htmlFor="p-name">Name</label>
              <input id="p-name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="p-title">Title (optional)</label>
              <input id="p-title" className="input" placeholder="e.g. Product Designer" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Your workspaces</h3>
            {overview.workspaces.length === 0 ? (
              <EmptyState icon="workspace" title="No workspaces yet" />
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {overview.workspaces.map((w) => (
                  <li key={w.id}>
                    <Link to={`/app/w/${w.id}/overview`} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 4px', borderBottom: '1px solid var(--border)' }}>
                      <Icon name="workspace" size={16} />
                      <span style={{ fontSize: 13.5, fontWeight: 600 }}>{w.name}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{w.member_count} member{w.member_count === '1' ? '' : 's'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Assigned tasks</h3>
            {overview.tasks.length === 0 ? (
              <EmptyState icon="layers" title="Nothing assigned" />
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {overview.tasks.map((t) => (
                  <li key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 4px', borderBottom: '1px solid var(--border)', fontSize: 13.5 }}>
                    <span className={`priority-flag ${t.priority}`} />
                    <span style={{ flex: 1 }}>{t.title}</span>
                    {t.due_date && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDueDate(t.due_date)}</span>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 14 }}>Recent activity</h3>
            {overview.activity.length === 0 ? (
              <EmptyState icon="clock" title="No activity yet" />
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {overview.activity.map((a) => (
                  <li key={a.id} style={{ fontSize: 13 }}>
                    {a.description} <span style={{ color: 'var(--text-faint)', fontSize: 11.5 }}>· {timeAgo(a.created_at)}</span>
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
