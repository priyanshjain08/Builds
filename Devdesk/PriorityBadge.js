// frontend/src/components/PriorityBadge.js
import React from 'react';
import Chip from '@mui/material/Chip';

const priorityColors = {
  'LOW': '#10b981',
  'MEDIUM': '#3b82f6',
  'HIGH': '#f59e0b',
  'CRITICAL': '#ef4444',
};

function PriorityBadge({ priority }) {
  const color = priorityColors[priority] || '#6b7280';
  
  return (
    <Chip
      label={priority}
      size="small"
      sx={{
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: 600,
      }}
    />
  );
}

export default PriorityBadge;
