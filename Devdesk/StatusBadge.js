// frontend/src/components/StatusBadge.js
import React from 'react';
import Chip from '@mui/material/Chip';

const statusColors = {
  'OPEN': '#3b82f6',
  'IN_PROGRESS': '#f59e0b',
  'IN_REVIEW': '#8b5cf6',
  'RESOLVED': '#10b981',
  'CLOSED': '#6b7280',
  'PLANNING': '#8b5cf6',
  'ACTIVE': '#10b981',
  'ON_HOLD': '#f59e0b',
  'COMPLETED': '#3b82f6',
};

function StatusBadge({ status }) {
  const color = statusColors[status] || '#6b7280';
  
  return (
    <Chip
      label={status.replace('_', ' ')}
      size="small"
      sx={{
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: 600,
      }}
    />
  );
}

export default StatusBadge;
