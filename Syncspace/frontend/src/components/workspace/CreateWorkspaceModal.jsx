import { useState } from 'react';
import Modal from '../ui/Modal';
import { apiErrorMessage } from '../../api/client';

export default function CreateWorkspaceModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Give your workspace a name.');
    setSaving(true);
    setError('');
    try {
      const workspace = await onCreated({ name: name.trim(), description: description.trim() });
      onClose();
      return workspace;
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create the workspace.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title="Create a workspace"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Creating…' : 'Create workspace'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div className="form-error">{error}</div>}
        <div className="field">
          <label htmlFor="ws-name">Workspace name</label>
          <input
            id="ws-name"
            className="input"
            placeholder="e.g. Product Team"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </div>
        <div className="field">
          <label htmlFor="ws-desc">Description (optional)</label>
          <textarea
            id="ws-desc"
            className="textarea"
            placeholder="What's this workspace for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
