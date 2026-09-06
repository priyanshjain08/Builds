// frontend/src/components/ActivityFeed.js
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';

function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No recent activity
      </Typography>
    );
  }

  return (
    <Timeline>
      {activities.map((activity, index) => (
        <TimelineItem key={activity.id || index}>
          <TimelineSeparator>
            <TimelineDot color="primary" />
            {index < activities.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="body2">
              {activity.details}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(activity.createdAt).toLocaleString()}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}

export default ActivityFeed;
