import { useState } from 'react';
import Modal from '../ui/Modal';
import { apiErrorMessage } from '../../api/client';

const STATUSES = [
  { value: 'planning', label: 'Planning' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

export default function ProjectFormModal({ initial, onClose, onSubmit, title }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState(initial?.status || 'planning');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return setError('Project name is required.');
    setSaving(true);
    setError('');
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), status });
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save the project.'));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save project'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div className="form-error">{error}</div>}
        <div className="field">
          <label htmlFor="proj-name">Project name</label>
          <input id="proj-name" className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="proj-desc">Description</label>
          <textarea id="proj-desc" className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="proj-status">Status</label>
          <select id="proj-status" className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </form>
    </Modal>
  );
}
