import { useState } from 'react';
import { WorkspaceAPI } from '../api/resources';
import { useParams } from 'react-router-dom';
import { useWorkspaceRoom } from '../context/WorkspaceRoomContext';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/ui/Avatar';
import Icon from '../components/ui/Icon';
import Modal from '../components/ui/Modal';
import { apiErrorMessage } from '../api/client';

export default function Members() {
  const { workspaceId } = useParams();
  const { user } = useAuth();
  const { members, myRole, onlineUserIds, reload } = useWorkspaceRoom();
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const canManage = myRole === 'owner' || myRole === 'admin';

  async function handleInvite(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const { member } = await WorkspaceAPI.addMember(workspaceId, email.trim());
      setSuccess(`${member.name} was added to the workspace.`);
      setEmail('');
      reload();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not add that member.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(memberId, name) {
    if (!window.confirm(`Remove ${name} from this workspace?`)) return;
    await WorkspaceAPI.removeMember(workspaceId, memberId);
    reload();
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Members</h1>
          <p>{members.length} member{members.length === 1 ? '' : 's'} · {onlineUserIds.length} online now</p>
        </div>
        {canManage && (
          <button className="btn btn-primary" onClick={() => setShowInvite(true)}>
            <Icon name="plus" size={16} /> Add member
          </button>
        )}
      </div>

      <div className="card card-flush">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Status</th>
              {canManage && <th />}
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={m.name} color={m.avatar_color} size="sm" />
                    <div>
                      <div style={{ fontWeight: 600 }}>{m.name}{m.id === user.id ? ' (you)' : ''}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{m.role}</td>
                <td>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: onlineUserIds.includes(m.id) ? 'var(--success)' : 'var(--text-faint)', fontWeight: 600 }}>
                    <span className={`presence-dot ${onlineUserIds.includes(m.id) ? 'online' : ''}`} />
                    {onlineUserIds.includes(m.id) ? 'Online' : 'Offline'}
                  </span>
                </td>
                {canManage && (
                  <td>
                    {m.role !== 'owner' && m.id !== user.id && (
                      <button className="icon-btn" onClick={() => handleRemove(m.id, m.name)} aria-label="Remove member">
                        <Icon name="trash" size={15} />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showInvite && (
        <Modal
          title="Add a member"
          onClose={() => setShowInvite(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setShowInvite(false)}>Close</button>
              <button className="btn btn-primary" onClick={handleInvite} disabled={saving}>
                {saving ? 'Adding…' : 'Add to workspace'}
              </button>
            </>
          }
        >
          <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {error && <div className="form-error">{error}</div>}
            {success && <div className="form-error" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>{success}</div>}
            <div className="field">
              <label htmlFor="invite-email">Email address</label>
              <input
                id="invite-email"
                type="email"
                className="input"
                placeholder="teammate@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
              <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>They must already have a SyncSpace account.</span>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
