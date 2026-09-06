// frontend/src/components/CommentSection.js
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import Divider from '@mui/material/Divider';
import IssueService from '../services/IssueService';
import AuthService from '../services/AuthService';

function CommentSection({ issueId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const currentUser = AuthService.getCurrentUser();

  useEffect(() => {
    loadComments();
  }, [issueId]);

  const loadComments = async () => {
    try {
      const data = await IssueService.getComments(issueId);
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      await IssueService.addComment(issueId, newComment);
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await IssueService.deleteComment(issueId, commentId);
      await loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Comments ({comments.length})
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button
          variant="contained"
          onClick={handleAddComment}
          disabled={loading || !newComment.trim()}
          sx={{ mt: 1 }}
        >
          Add Comment
        </Button>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {comments.map((comment) => (
        <Box key={comment.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'primary.main' }}>
              {comment.author?.firstName?.charAt(0) || 'U'}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle2">
                {comment.author?.firstName} {comment.author?.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
            </Box>
            {currentUser?.id === comment.author?.id && (
              <IconButton size="small" onClick={() => handleDeleteComment(comment.id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Typography variant="body2">
            {comment.content}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export default CommentSection;
