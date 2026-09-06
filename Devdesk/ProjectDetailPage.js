// frontend/src/pages/ProjectDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import AvatarGroup from '@mui/material/AvatarGroup';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import ProjectService from '../services/ProjectService';
import IssueService from '../services/IssueService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TypeBadge from '../components/TypeBadge';
import LoadingSpinner from '../components/LoadingSpinner';

function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);
  const [issueModal, setIssueModal] = useState(false);
  const [editedProject, setEditedProject] = useState({});
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    type: 'TASK',
    priority: 'MEDIUM',
    deadline: '',
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [projectData, issueData] = await Promise.all([
        ProjectService.getProject(id),
        IssueService.getIssuesByProject(id),
      ]);
      setProject(projectData);
      setIssues(issueData);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    try {
      await ProjectService.updateProject(id, editedProject);
      setEditModal(false);
      loadData();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await ProjectService.deleteProject(id);
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleCreateIssue = async () => {
    try {
      await IssueService.createIssue({
        ...newIssue,
        projectId: id,
      });
      setIssueModal(false);
      setNewIssue({ title: '', description: '', type: 'TASK', priority: 'MEDIUM', deadline: '' });
      loadData();
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!project) {
    return <Typography>Project not found</Typography>;
  }

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/projects')}
        sx={{ mb: 2 }}
      >
        Back to Projects
      </Button>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="h4">
                  {project.name}
                </Typography>
                <StatusBadge status={project.status} />
              </Box>
              <Typography variant="body2" color="text.secondary">
                Created by {project.createdBy?.firstName} {project.createdBy?.lastName}
              </Typography>
            </Box>
            <Box>
              <IconButton onClick={() => {
                setEditedProject(project);
                setEditModal(true);
              }}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={handleDeleteProject}>
                <DeleteIcon />
              </IconButton>
            </Box>
          </Box>

          {project.description && (
            <Typography variant="body1" sx={{ mb: 2 }}>
              {project.description}
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Deadline
              </Typography>
              <Typography variant="body2">
                {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Total Issues
              </Typography>
              <Typography variant="body2">
                {project.totalIssues}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="caption" color="text.secondary">
                Team Members
              </Typography>
              <AvatarGroup max={5} sx={{ justifyContent: 'flex-start', mt: 1 }}>
                {project.teamMembers?.map((member) => (
                  <Avatar key={member.id} sx={{ width: 32, height: 32 }}>
                    {member.firstName?.charAt(0)}
                  </Avatar>
                ))}
              </AvatarGroup>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">
          Issues
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIssueModal(true)}
        >
          New Issue
        </Button>
      </Box>

      {issues.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary" align="center">
              No issues yet. Create your first issue!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {issues.map((issue) => (
            <Grid item xs={12} key={issue.id}>
              <Card
                sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}
                onClick={() => navigate(`/issues/${issue.id}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6">
                        {issue.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <TypeBadge type={issue.type} />
                        <PriorityBadge priority={issue.priority} />
                        <StatusBadge status={issue.status} />
                      </Box>
                    </Box>
                    {issue.assignee && (
                      <Avatar sx={{ width: 32, height: 32, ml: 2 }}>
                        {issue.assignee.firstName?.charAt(0)}
                      </Avatar>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={editModal} onClose={() => setEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Project Name"
            value={editedProject.name || ''}
            onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={editedProject.description || ''}
            onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Status"
            value={editedProject.status || 'PLANNING'}
            onChange={(e) => setEditedProject({ ...editedProject, status: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="PLANNING">Planning</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="ON_HOLD">On Hold</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </TextField>
          <TextField
            fullWidth
            type="date"
            label="Deadline"
            value={editedProject.deadline || ''}
            onChange={(e) => setEditedProject({ ...editedProject, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditModal(false)}>Cancel</Button>
          <Button onClick={handleUpdateProject} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={issueModal} onClose={() => setIssueModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Issue</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Issue Title"
            value={newIssue.title}
            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={3}
            value={newIssue.description}
            onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Type"
            value={newIssue.type}
            onChange={(e) => setNewIssue({ ...newIssue, type: e.target.value })}
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
            value={newIssue.priority}
            onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="LOW">Low</MenuItem>
            <MenuItem value="MEDIUM">Medium</MenuItem>
            <MenuItem value="HIGH">High</MenuItem>
            <MenuItem value="CRITICAL">Critical</MenuItem>
          </TextField>
          <TextField
            fullWidth
            type="date"
            label="Deadline"
            value={newIssue.deadline}
            onChange={(e) => setNewIssue({ ...newIssue, deadline: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssueModal(false)}>Cancel</Button>
          <Button onClick={handleCreateIssue} variant="contained">
            Create Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectDetailPage;
