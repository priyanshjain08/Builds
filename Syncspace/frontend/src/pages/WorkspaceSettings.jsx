import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkspaceAPI } from '../api/resources';
import { useWorkspaceRoom } from '../context/WorkspaceRoomContext';
import { useWorkspaces } from '../context/WorkspaceContext';
import { apiErrorMessage } from '../api/client';
import Icon from '../components/ui/Icon';

export default function WorkspaceSettings() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { workspace, myRole, reload } = useWorkspaceRoom();
  const { refresh } = useWorkspaces();
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState(workspace.description || '');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const canEdit = myRole === 'owner' || myRole === 'admin';
  const canDelete = myRole === 'owner';

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');
    try {
      await WorkspaceAPI.update(workspaceId, { name: name.trim(), description: description.trim() });
      await Promise.all([reload(), refresh()]);
      setMessage('Workspace updated.');
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update the workspace.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${workspace.name}"? This removes every project, task, and message in it. This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await WorkspaceAPI.remove(workspaceId);
      await refresh();
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not delete the workspace.'));
      setDeleting(false);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Workspace settings</h1>
          <p>Manage details for {workspace.name}.</p>
        </div>
      </div>

      <div className="card" style={{ maxWidth: 560 }}>
        <h3 style={{ marginBottom: 16 }}>General</h3>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="form-error" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>{message}</div>}
          <div className="field">
            <label htmlFor="ws-name">Workspace name</label>
            <input id="ws-name" className="input" value={name} onChange={(e) => setName(e.target.value)} disabled={!canEdit} />
          </div>
          <div className="field">
            <label htmlFor="ws-desc">Description</label>
            <textarea id="ws-desc" className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} disabled={!canEdit} />
          </div>
          {canEdit && (
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          )}
        </form>
      </div>

      {canDelete && (
        <div className="card" style={{ maxWidth: 560, marginTop: 20, borderColor: 'var(--danger-soft)' }}>
          <h3 style={{ marginBottom: 6, color: 'var(--danger)' }}>Danger zone</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>
            Deleting this workspace permanently removes all of its projects, tasks, messages and activity.
          </p>
          <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
            <Icon name="trash" size={15} /> {deleting ? 'Deleting…' : 'Delete workspace'}
          </button>
        </div>
      )}
    </div>
  );
}
