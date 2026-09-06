// frontend/src/pages/IssuesPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Avatar from '@mui/material/Avatar';
import IssueService from '../services/IssueService';
import ProjectService from '../services/ProjectService';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import TypeBadge from '../components/TypeBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

function IssuesPage() {
  const [issues, setIssues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [openModal, setOpenModal] = useState(false);
  const [newIssue, setNewIssue] = useState({
    title: '',
    description: '',
    type: 'TASK',
    priority: 'MEDIUM',
    projectId: '',
    deadline: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [issueData, projectData] = await Promise.all([
        IssueService.getAllIssues(),
        ProjectService.getAllProjects(),
      ]);
      setIssues(issueData);
      setProjects(projectData);
    } catch (error) {
      console.error('Error loading issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIssue = async () => {
    try {
      await IssueService.createIssue(newIssue);
      setOpenModal(false);
      setNewIssue({
        title: '',
        description: '',
        type: 'TASK',
        priority: 'MEDIUM',
        projectId: '',
        deadline: '',
      });
      loadData();
    } catch (error) {
      console.error('Error creating issue:', error);
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || issue.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || issue.type === typeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Issues
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage all issues
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
        >
          New Issue
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search issues..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <TextField
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="ALL">All Statuses</MenuItem>
          <MenuItem value="OPEN">Open</MenuItem>
          <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
          <MenuItem value="IN_REVIEW">In Review</MenuItem>
          <MenuItem value="RESOLVED">Resolved</MenuItem>
          <MenuItem value="CLOSED">Closed</MenuItem>
        </TextField>
        <TextField
          select
          label="Priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="ALL">All Priorities</MenuItem>
          <MenuItem value="LOW">Low</MenuItem>
          <MenuItem value="MEDIUM">Medium</MenuItem>
          <MenuItem value="HIGH">High</MenuItem>
          <MenuItem value="CRITICAL">Critical</MenuItem>
        </TextField>
        <TextField
          select
          label="Type"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="ALL">All Types</MenuItem>
          <MenuItem value="BUG">Bug</MenuItem>
          <MenuItem value="FEATURE">Feature</MenuItem>
          <MenuItem value="TASK">Task</MenuItem>
          <MenuItem value="IMPROVEMENT">Improvement</MenuItem>
        </TextField>
      </Box>

      {filteredIssues.length === 0 ? (
        <EmptyState
          title="No issues found"
          description="Create your first issue or adjust your filters"
          actionText="Create Issue"
          onAction={() => setOpenModal(true)}
        />
      ) : (
        <Grid container spacing={2}>
          {filteredIssues.map((issue) => (
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
                      <Typography variant="caption" color="text.secondary">
                        {issue.projectName}
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

      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
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
            label="Project"
            value={newIssue.projectId}
            onChange={(e) => setNewIssue({ ...newIssue, projectId: e.target.value })}
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
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button onClick={handleCreateIssue} variant="contained">
            Create Issue
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default IssuesPage;
