// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import DashboardService from '../services/DashboardService';
import ActivityFeed from '../components/ActivityFeed';
import LoadingSpinner from '../components/LoadingSpinner';
import FolderIcon from '@mui/icons-material/Folder';
import BugReportIcon from '@mui/icons-material/BugReport';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ScheduleIcon from '@mui/icons-material/Schedule';

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await DashboardService.getDashboardData();
      setData(data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const StatCard = ({ title, value, icon, color }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            <Typography variant="h3" sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}20`,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Welcome back! Here's what's happening with your projects.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Projects"
            value={data.totalProjects}
            icon={<FolderIcon sx={{ color: '#6366f1' }} />}
            color="#6366f1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Projects"
            value={data.activeProjects}
            icon={<TrendingUpIcon sx={{ color: '#10b981' }} />}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Open Issues"
            value={data.openIssues}
            icon={<BugReportIcon sx={{ color: '#ef4444' }} />}
            color="#ef4444"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Completed Issues"
            value={data.closedIssues + data.resolvedIssues}
            icon={<ScheduleIcon sx={{ color: '#3b82f6' }} />}
            color="#3b82f6"
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Issue Overview
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Open Issues
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={data.totalIssues > 0 ? (data.openIssues / data.totalIssues) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  In Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={data.totalIssues > 0 ? (data.inProgressIssues / data.totalIssues) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                  color="warning"
                />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Completed
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={data.totalIssues > 0 ? ((data.closedIssues + data.resolvedIssues) / data.totalIssues) * 100 : 0}
                  sx={{ height: 8, borderRadius: 4 }}
                  color="success"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Upcoming Deadlines
              </Typography>
              {data.upcomingDeadlines && data.upcomingDeadlines.length > 0 ? (
                data.upcomingDeadlines.map((deadline, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      {deadline.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Due: {new Date(deadline.deadline).toLocaleDateString()}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No upcoming deadlines
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <ActivityFeed activities={data.recentActivities} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;
