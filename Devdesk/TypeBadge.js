// frontend/src/components/TypeBadge.js
import React from 'react';
import Chip from '@mui/material/Chip';

const typeColors = {
  'BUG': '#ef4444',
  'FEATURE': '#3b82f6',
  'TASK': '#6b7280',
  'IMPROVEMENT': '#10b981',
};

function TypeBadge({ type }) {
  const color = typeColors[type] || '#6b7280';
  
  return (
    <Chip
      label={type}
      size="small"
      sx={{
        backgroundColor: `${color}20`,
        color: color,
        fontWeight: 600,
      }}
    />
  );
}

export default TypeBadge;
