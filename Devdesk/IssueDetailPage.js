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
              <Typography variant="body2" color
