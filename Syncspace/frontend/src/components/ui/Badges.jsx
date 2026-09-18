export const PROJECT_STATUS_LABELS = {
  planning: 'Planning',
  active: 'Active',
  on_hold: 'On Hold',
  completed: 'Completed',
};

export const TASK_STATUS_LABELS = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  completed: 'Completed',
};

export const PRIORITY_LABELS = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export function StatusBadge({ status, labels = PROJECT_STATUS_LABELS }) {
  return (
    <span className={`badge badge-${status}`}>
      <span className="badge-dot" />
      {labels[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return <span className={`badge badge-${priority}`}>{PRIORITY_LABELS[priority] || priority}</span>;
}
