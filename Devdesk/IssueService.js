// frontend/src/services/IssueService.js
import ApiService from './ApiService';

const IssueService = {
  async getAllIssues() {
    return await ApiService.get('/issues');
  },
  
  async getIssuesByProject(projectId) {
    return await ApiService.get(`/issues/project/${projectId}`);
  },
  
  async getIssue(id) {
    return await ApiService.get(`/issues/${id}`);
  },
  
  async createIssue(issueData) {
    return await ApiService.post('/issues', issueData);
  },
  
  async updateIssue(id, issueData) {
    return await ApiService.put(`/issues/${id}`, issueData);
  },
  
  async deleteIssue(id) {
    return await ApiService.delete(`/issues/${id}`);
  },
  
  async getComments(issueId) {
    return await ApiService.get(`/issues/${issueId}/comments`);
  },
  
  async addComment(issueId, content) {
    return await ApiService.post(`/issues/${issueId}/comments`, { content });
  },
  
  async deleteComment(issueId, commentId) {
    return await ApiService.delete(`/issues/${issueId}/comments/${commentId}`);
  }
};

export default IssueService;
