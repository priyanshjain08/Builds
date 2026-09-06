// frontend/src/pages/IssueDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IssueService from '../services/IssueService';
import ProjectService from '../services/ProjectService';
import CommentSection from '../components/CommentSection';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TypeBadge from '../components/TypeBadge';
import LoadingSpinner from '../components/LoadingSpinner';

function IssueDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState(null);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [editedIssue, setEditedIssue] = useState({});

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const issueData = await IssueService.getIssue(id);
      setIssue(issueData);
      
      if (issueData.projectId) {
        const projectData = await ProjectService.getProject(issueData.projectId);
        setTeamMembers(projectData.teamMembers || []);
      }
      
      const projectList = await ProjectService.getAllProjects();
      setProjects(projectList);
    } catch (error) {
      console.error('Error loading issue:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIssue = async () => {
    try {
      await IssueService.updateIssue(id, editedIssue);
      setEditModal(false);
      loadData();
    } catch (error) {
      console.error('Error updating issue:', error);
    }
  };

  const handleDeleteIssue = async () => {
    if (window.confirm('Are you sure you want to delete this issue?')) {
      try {
        await IssueService.deleteIssue(id);
        navigate('/issues');
      } catch (error) {
        console.error('Error deleting issue:', error);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!issue) {
    return <Typography>Issue not found</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/issues')}
        sx={{ mb: 2 }}
      >
        Back to Issues
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4">
                  {issue.title}
                </Typography>
                <StatusBadge status={issue.status} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                {issue.projectName} • Reported by {issue.reporter?.firstName} {issue.reporter?.lastName}
              </Typography>
            </Box>
            <Box>
              <IconButton onClick={() => {
                setEditedIssue(issue);
                setEditModal(true);
              }}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={handleDeleteIssue}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {issue.description && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {issue.description}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Type
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <TypeBadge type={issue.type} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Priority
              </Typography>
              <Box sx={{ mt: 0.5 }}>
                <PriorityBadge priority={issue.priority} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Assignee
              </Typography>
              <Typography variant="body2">
                {issue.assignee ? `${issue.assignee.firstName} ${issue.assignee.lastName}` : 'Unassigned'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Typography variant="caption" color="text.secondary">
                Deadline
              </Typography>
              <Typography variant="body2">
                {issue.deadline ? new Date(issue.deadline).toLocaleDateString() : 'No deadline'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <CommentSection issueId={id} />

      <Dialog open={editModal} onClose={() => setEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Issue</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Issue Title"
            value={editedIssue.title || ''}
            onChange={(e) => setEditedIssue({ ...editedIssue, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={editedIssue.description || ''}
            onChange={(e) => setEditedIssue({ ...editedIssue, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Project"
            value={editedIssue.projectId || ''}
            onChange={(e) => setEditedIssue({ ...editedIssue, projectId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Type"
            value={editedIssue.type || 'TASK'}
            onChange={(e) => setEditedIssue({ ...editedIssue, type: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="BUG">Bug</MenuItem>
            <MenuItem value="FEATURE">Feature</MenuItem>
            <MenuItem value="TASK">Task</MenuItem>
            <MenuItem value="IMPROVEMENT">Improvement</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Priority"
            value={editedIssue.priority || 'MEDIUM'}
            onChange={(e) => setEditedIssue({ ...editedIssue, priority: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="CRITICAL">Critical</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Status"
            value={editedIssue.status || 'OPEN'}
            onChange={(e) => setEditedIssue({ ...editedIssue, status: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="OPEN">Open</MenuItem>
            <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
            <MenuItem value="IN_REVIEW">In Review</MenuItem>
            <MenuItem value="RESOLVED">Resolved</MenuItem>
            <MenuItem value="CLOSED">Closed</MenuItem>
          </TextField>
          <TextField
            fullWidth
            select
            label="Assignee"
            value={editedIssue.assignee?.id || ''}
            onChange={(e) => setEditedIssue({ ...editedIssue, assigneeId: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">Unassigned</MenuItem>
            {teamMembers.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.firstName} {member.lastName}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            type="date"
            label="Deadline"
            value={editedIssue.deadline || ''}
            onChange={(e) => setEditedIssue({ ...editedIssue, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateIssue} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default IssueDetailPage;
