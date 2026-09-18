import { useState } from 'react';
import Modal from '../ui/Modal';
import { apiErrorMessage } from '../../api/client';

const STATUSES = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'in_review', label: 'In Review' },
  { value: 'completed', label: 'Completed' },
];
const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export default function TaskFormModal({ initial, projects, fixedProjectId, members, onClose, onSubmit, onDelete, title }) {
  const [projectId, setProjectId] = useState(initial?.project_id || fixedProjectId || projects?.[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [status, setStatus] = useState(initial?.status || 'todo');
  const [priority, setPriority] = useState(initial?.priority || 'medium');
  const [assignedTo, setAssignedTo] = useState(initial?.assigned_to || '');
  const [dueDate, setDueDate] = useState(initial?.due_date ? initial.due_date.slice(0, 10) : '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!taskTitle.trim()) return setError('Task title is required.');
    if (!projectId) return setError('Choose a project for this task.');
    setSaving(true);
    setError('');
    try {
      await onSubmit({
        projectId,
        title: taskTitle.trim(),
        description: description.trim(),
        status,
        priority,
        assignedTo: assignedTo || null,
        dueDate: dueDate || null,
      });
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not save the task.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this task? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await onDelete();
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not delete the task.'));
      setDeleting(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      width={520}
      footer={
        <>
          {initial && onDelete && (
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting} style={{ marginRight: 'auto' }}>
              {deleting ? 'Deleting…' : 'Delete task'}
            </button>
          )}
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? 'Saving…' : 'Save task'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {error && <div className="form-error">{error}</div>}
        <div className="field">
          <label htmlFor="task-title">Title</label>
          <input id="task-title" className="input" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} autoFocus />
        </div>
        <div className="field">
          <label htmlFor="task-desc">Description</label>
          <textarea id="task-desc" className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        {projects && !fixedProjectId && (
          <div className="field">
            <label htmlFor="task-project">Project</label>
            <select id="task-project" className="select" value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field">
            <label htmlFor="task-status">Status</label>
            <select id="task-status" className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-priority">Priority</label>
            <select id="task-priority" className="select" value={priority} onChange={(e) => setPriority(e.target.value)}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="field">
            <label htmlFor="task-assignee">Assignee</label>
            <select id="task-assignee" className="select" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)}>
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-due">Due date</label>
            <input id="task-due" type="date" className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
